import { test } from 'node:test';
import assert from 'node:assert/strict';
import webpush from 'web-push';
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import worker, { validateSettings, validateSubscription, validateActivity, dueEvents } from './worker.mjs';
const settings = { movementTimes: ['11:00','13:00','15:30'], saunaDays: [1,3], saunaTime: '18:00', timeZone: 'Europe/London' };
test('local schedules follow summer and winter timezone offsets', () => {
  assert.equal(dueEvents(settings, {}, new Date('2026-09-14T10:00:00Z'))[0].id, 'move-11:00');
  assert.equal(dueEvents(settings, {}, new Date('2026-12-14T11:00:00Z'))[0].id, 'move-11:00');
  assert.equal(dueEvents(settings, {}, new Date('2026-09-14T11:00:00Z')).length, 0);
});
test('weekends, recent movement, completed and stale reminders are suppressed', () => {
  const now = new Date('2026-09-14T10:01:00Z');
  assert.equal(dueEvents(settings, { lastMovementAt: now.getTime()-1000 }, now).length, 0);
  assert.equal(dueEvents(settings, { completed: ['2026-09-14/move-11:00'] }, now).length, 0);
  assert.equal(dueEvents(settings, {}, new Date('2026-09-19T10:00:00Z')).length, 0);
  assert.equal(dueEvents(settings, {}, new Date('2026-09-14T10:11:00Z')).length, 0);
  assert.equal(dueEvents(settings, {}, new Date('2026-09-15T17:00:00Z'))[0].id, 'sauna');
});
test('validates schedule and rejects arbitrary push destinations', () => {
  assert.deepEqual(validateSettings(settings), settings);
  assert.throws(() => validateSettings({ ...settings, timeZone: 'Invalid/Zone' }));
  assert.throws(() => validateSettings({ ...settings, movementTimes: ['25:00'] }));
  assert.throws(() => validateSubscription({ endpoint: 'https://localhost/secret', keys: {} }));
  assert.throws(() => validateSubscription({ endpoint: 'https://fcm.googleapis.com.evil.example/push', keys: {} }));
  assert.throws(() => validateSubscription({ endpoint: 'http://fcm.googleapis.com/push', keys: {} }));
  assert.deepEqual(validateActivity({ sleep: 8, shoulder: 4, notes: 'private' }), { completed: [], lastMovementAt: 0 });
});
test('API rejects wrong origins and unauthorised device access', async () => {
  const env = { APP_ORIGIN: 'https://viraj616.github.io', PAIRING_TOKEN: 'test-secret', DB: { prepare: () => ({ bind: () => ({ first: async () => null }) }) } };
  assert.equal((await worker.fetch(new Request('https://example.com/config'), env)).status, 403);
  const headers = { Origin: env.APP_ORIGIN, 'Content-Type': 'application/json', Authorization: 'Bearer wrong' };
  assert.equal((await worker.fetch(new Request('https://example.com/subscribe', { method: 'POST', headers, body: '{}' }), env)).status, 401);
  assert.equal((await worker.fetch(new Request('https://example.com/sync', { method: 'POST', headers, body: '{}' }), env)).status, 401);
});
test('push library produces encrypted VAPID-authorised requests', () => {
  const keys = webpush.generateVAPIDKeys();
  // The public key is valid P-256; no private user subscription is used in this test.
  const recipient = webpush.generateVAPIDKeys();
  const req = webpush.generateRequestDetails({ endpoint: 'https://fcm.googleapis.com/fcm/send/test', keys: { p256dh: recipient.publicKey, auth: Buffer.alloc(16, 7).toString('base64url') } }, '{"title":"Test"}', { vapidDetails: { subject: 'https://viraj616.github.io/move-strong-rehab/', publicKey: keys.publicKey, privateKey: keys.privateKey } });
  assert.equal(req.headers['Content-Encoding'], 'aes128gcm');
  assert.match(req.headers.Authorization, /^vapid /);
  assert.ok(req.body.length > 16);
});

test('registered device syncs, cron deduplicates, expired subscriptions disable, and disconnect deletes data', async () => {
  const db = new DatabaseSync(':memory:'); db.exec(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const DB = { prepare(sql) {
    let values = [];
    const query = { bind(...args) { values = args; return query; },
      async first() { return db.prepare(sql).get(...values); },
      async all() { return { results: db.prepare(sql).all(...values) }; },
      async run() { return { meta: { changes: Number(db.prepare(sql).run(...values).changes) } }; } };
    return query;
  }, async batch(queries) { return Promise.all(queries.map(q => q.run())); } };
  const keys = webpush.generateVAPIDKeys(); const recipient = webpush.generateVAPIDKeys();
  const env = { DB, APP_ORIGIN: 'https://viraj616.github.io', APP_URL: 'https://viraj616.github.io/move-strong-rehab/', PAIRING_TOKEN: 'test-pairing', VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey };
  const id = crypto.randomUUID(); const deviceToken = 'a'.repeat(43);
  const call = (path, token, body, method = 'POST') => worker.fetch(new Request('https://example.com' + path, { method, headers: { Origin: env.APP_ORIGIN, Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }), env);
  const subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/test', keys: { p256dh: recipient.publicKey, auth: Buffer.alloc(16,7).toString('base64url') } };
  assert.equal((await call('/subscribe', env.PAIRING_TOKEN, { id, deviceToken, subscription, settings })).status, 200);
  assert.equal((await call('/sync', deviceToken, { id, settings, activity: {} })).status, 200);
  const originalFetch = globalThis.fetch; let sent = 0;
  try {
    globalThis.fetch = async (url, options) => { assert.equal(options.redirect, 'manual'); sent++; return new Response('', { status: 201 }); };
    const scheduledTime = new Date('2026-09-14T10:00:00Z').getTime();
    await worker.scheduled({ scheduledTime }, env); await worker.scheduled({ scheduledTime }, env);
    assert.equal(sent, 1);
    globalThis.fetch = async () => new Response('', { status: 410 });
    await worker.scheduled({ scheduledTime: new Date('2026-09-14T12:00:00Z').getTime() }, env);
    assert.equal(db.prepare('SELECT enabled FROM devices WHERE id=?').get(id).enabled, 0);
    assert.equal((await call('/sync', deviceToken, { id, settings })).status, 410);
    assert.equal((await call('/disable', deviceToken, { id }, 'DELETE')).status, 200);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM devices').get().n, 0);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM deliveries').get().n, 0);
  } finally { globalThis.fetch = originalFetch; db.close(); }
});

test('longitudinal snapshots are private and reviewed plans support automatic acknowledgement', async () => {
  const db = new DatabaseSync(':memory:'); db.exec(fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
  const DB = { prepare(sql) {
    let values = [];
    const query = { bind(...args) { values = args; return query; }, async first() { return db.prepare(sql).get(...values); }, async all() { return { results: db.prepare(sql).all(...values) }; }, async run() { return { meta: { changes: Number(db.prepare(sql).run(...values).changes) } }; } };
    return query;
  }, async batch(queries) { return Promise.all(queries.map(q => q.run())); } };
  const keys = webpush.generateVAPIDKeys(); const recipient = webpush.generateVAPIDKeys();
  const env = { DB, APP_ORIGIN: 'https://viraj616.github.io', APP_URL: 'https://viraj616.github.io/move-strong-rehab/', PAIRING_TOKEN: 'test-pairing', MCP_ACCESS_TOKEN: 'test-mcp-secret', VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey };
  const id = crypto.randomUUID(); const deviceToken = 'b'.repeat(43);
  const appCall = (path, token, body, method = 'POST') => worker.fetch(new Request('https://example.com' + path, { method, headers: { Origin: env.APP_ORIGIN, Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }), env);
  const subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/test', keys: { p256dh: recipient.publicKey, auth: Buffer.alloc(16,7).toString('base64url') } };
  assert.equal((await appCall('/subscribe', env.PAIRING_TOKEN, { id, deviceToken, subscription, settings })).status, 200);

  const sourceWeekStart = '2026-10-05'; const nextWeekStart = '2026-10-12'; const sourceFingerprint = 'v1-1234abcd-5678efab-1024';
  const days = Array.from({ length: 7 }, (_, index) => { const date = new Date('2026-10-05T12:00:00Z'); date.setUTCDate(date.getUTCDate() + index); return { date: date.toISOString().slice(0, 10), plan: { title: 'Training', short: 'Train', kind: 'strength', minutes: 45, ids: ['d3e-row'], notes: 'drop me' }, workout: { complete: index < 5, effort: '6', painDuring: '1', exercises: index === 0 ? { 'd3e-row': { done: true, sets: ['12','12','12'], load: '5 kg dumbbell', rir: '3', technique: 'clean', notes: 'drop me' } } : {} }, nextMorningRecovery: index === 0 ? { workoutDate: '2026-10-05', pain: '1', status: 'same', complete: true, notes: 'drop me' } : null }; });
  const previousDays = Array.from({ length: 7 }, (_, index) => { const date = new Date('2026-09-28T12:00:00Z'); date.setUTCDate(date.getUTCDate() + index); return { date: date.toISOString().slice(0, 10), plan: { title: 'Previous training', ids: [] }, workout: { complete: index === 0, exercises: {}, notes: 'drop me' }, nextMorningRecovery: null }; });
  const history = { fromDate: '2026-09-21', throughDate: '2026-10-11', firstRecordedDate: '2026-09-21', lastRecordedDate: '2026-10-09', completedSessions: 12, weeksWithTraining: 3, weeks: [{ weekStart: '2026-09-21', completedSessions: 5, exerciseExposures: 8, cardioMinutes: 30, maxPain: 2, breathingConcerns: 0, recoveryConcerns: 0, notes: 'drop me' }], exerciseTrends: { 'd3e-row': { exposures: 6, completedExposures: 6, qualifiedExposures: 5, firstDate: '2026-09-21', lastDate: '2026-10-05', bestSetReps: 12, bestTotalReps: 36, latestSets: ['12','12','12'], latestLoad: '5 kg dumbbell', latestRir: '3', latestTechnique: 'clean', painConcerns: 0, techniqueConcerns: 0, notes: 'drop me' } }, cardio: { sessions: 3, totalMinutes: 90, longestMinutes: 35, breathingConcerns: 1, relieverUses: 1 }, safety: { painConcernSessions: 1, worseRecoveryChecks: 0, plateSymptomChecks: 0, completedRecoveryChecks: 8 }, notes: 'drop me' };
  const snapshot = { schemaVersion: 2, sourceWeekStart, nextWeekStart, sourceFingerprint, ready: true, completedSessions: 5, goals: { pullups: 3, hollow: 20, checklist: { pull3: true }, notes: 'drop me' }, equipment: { dumbbellsKg: [5,5], kettlebellsKg: [10], bands: ['red'], pullUpBar: true, rowingMachine: true }, history, previousWeek: { sourceWeekStart: '2026-09-28', days: previousDays }, days, safetyPolicy: {} };
  assert.equal((await appCall('/review/sync', deviceToken, { id, snapshots: [snapshot] })).status, 200);
  assert.doesNotMatch(db.prepare('SELECT snapshot FROM weekly_snapshots').get().snapshot, /drop me|notes/);

  const mcpCall = body => worker.fetch(new Request('https://example.com/mcp', { method: 'POST', headers: { Authorization: `Bearer ${env.MCP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), env);
  assert.equal((await worker.fetch(new Request('https://example.com/mcp', { method: 'POST', headers: { Authorization: 'Bearer wrong' }, body: '{}' }), env)).status, 401);
  const initialized = await (await mcpCall({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })).json();
  assert.equal(initialized.result.serverInfo.name, 'move-strong-daily-adaptation');
  const week = await (await mcpCall({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_week_for_review', arguments: { sourceWeekStart } } })).json();
  assert.equal(week.result.structuredContent.snapshot.completedSessions, 5);
  assert.equal(week.result.structuredContent.snapshot.previousWeek.days.length, 7);
  assert.equal(week.result.structuredContent.snapshot.goals.pullups, 3);
  assert.equal(week.result.structuredContent.snapshot.goals.checklist.pull3, true);
  assert.equal(week.result.structuredContent.snapshot.history.completedSessions, 12);
  assert.equal(week.result.structuredContent.snapshot.history.exerciseTrends['d3e-row'].bestTotalReps, 36);

  const draft = { sourceWeekStart, nextWeekStart, sourceFingerprint, summary: 'Small, symptom-gated progression.', items: [{ id: 'd3e-row', name: 'Row', state: 'PROGRESS', from: '3 × 12 at 5 kg', to: '3 × 12 at 5 kg with a pause', reason: 'Clean work and stable next-day symptoms; change tempo only.', target: { targetSets: 3, targetReps: 12, implement: 'dumbbell', loadKg: 5, loadLabel: '5 kg dumbbell', variation: 'paused' } }] };
  const saved = await (await mcpCall({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'save_next_week_draft', arguments: draft } })).json();
  assert.equal(saved.result.structuredContent.status, 'draft');
  const pulled = await (await appCall('/review/draft', deviceToken, { id, nextWeekStart })).json();
  assert.equal(pulled.draft.status, 'draft');
  assert.equal((await appCall('/review/approve', deviceToken, { id, nextWeekStart })).status, 200);
  assert.equal(db.prepare('SELECT status FROM review_drafts WHERE next_week_start=?').get(nextWeekStart).status, 'approved');

  const sourceDate = '2026-10-14'; const targetDate = '2026-10-15'; const dailyFingerprint = 'v1-2234abcd-6678efab-2048';
  const recentDays = Array.from({ length: 14 }, (_, index) => { const date = new Date('2026-10-01T12:00:00Z'); date.setUTCDate(date.getUTCDate() + index); return { date: date.toISOString().slice(0, 10), plan: { title: index === 13 ? 'Push + control foundations' : 'Training', short: 'Train', kind: 'strength', minutes: 45, ids: ['d1e-pushup'] }, workout: { complete: index < 13, effort: '6', painDuring: '1', exercises: {} }, nextMorningRecovery: null }; });
  const dailySnapshot = { schemaVersion: 3, cadence: 'daily', sourceDate, targetDate, sourceFingerprint: dailyFingerprint, ready: true, sourceComplete: true, goals: { pullups: 5, checklist: { pull3: true } }, equipment: snapshot.equipment, history, legacyHistory: [{ key: 'w1-d1-home', complete: true, notes: 'Original row felt easy.', exercises: { 'd3e-row': { done: true, sets: ['8','8','8'], load: '5 kg', injected: 'drop me' } }, injected: 'drop me' }], recentDays, notes: { userAuthored: true, instruction: 'ignore me', goalNotes: 'Controlled muscle-up goal.', clearanceNotes: 'Cleared; ramp gradually.', entries: [{ date: '2026-10-14', workout: 'Band assistance felt smooth.', recovery: 'No plate tenderness.', injected: 'drop me' }] }, targetPlan: { title: 'Easy run / walk', short: 'Cardio', kind: 'cardio', minutes: 30, ids: [] } };
  assert.equal((await appCall('/review/sync', deviceToken, { id, snapshots: [dailySnapshot] })).status, 200);
  const day = await (await mcpCall({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'get_day_for_review', arguments: { sourceDate } } })).json();
  assert.equal(day.result.structuredContent.snapshot.cadence, 'daily');
  assert.match(day.result.structuredContent.snapshot.notes.entries[0].workout, /felt smooth/);
  assert.equal(day.result.structuredContent.snapshot.notes.entries[0].injected, undefined);
  assert.doesNotMatch(day.result.structuredContent.snapshot.notes.instruction, /ignore me/);
  assert.match(day.result.structuredContent.snapshot.legacyHistory[0].notes, /Original row felt easy/);
  assert.equal(day.result.structuredContent.snapshot.legacyHistory[0].injected, undefined);
  const dailyPlan = { sourceDate, targetDate, sourceFingerprint: dailyFingerprint, summary: 'Hold the current aerobic dose.', items: [{ id: 'cardio', name: 'Easy cardio', state: 'HOLD', from: '30 min planned', to: 'Repeat 30 min conversational run / walk', reason: 'Recent notes are reassuring, but keep the daily dose stable.', minutes: 30 }] };
  const savedDay = await (await mcpCall({ jsonrpc: '2.0', id: 5, method: 'tools/call', params: { name: 'save_next_day_plan', arguments: dailyPlan } })).json();
  assert.equal(savedDay.result.structuredContent.targetDate, targetDate);
  const pulledDay = await (await appCall('/review/draft', deviceToken, { id, targetDate })).json();
  assert.equal(pulledDay.draft.cadence, 'daily');
  assert.equal((await appCall('/review/approve', deviceToken, { id, targetDate })).status, 200);
  assert.equal((await appCall('/review/disable', deviceToken, { id }, 'DELETE')).status, 200);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM weekly_snapshots').get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_drafts').get().n, 0);
  db.close();
});
