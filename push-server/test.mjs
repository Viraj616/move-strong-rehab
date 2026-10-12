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

test('weekly snapshots are private, MCP saves drafts, and the app must approve them', async () => {
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
  const snapshot = { schemaVersion: 1, sourceWeekStart, nextWeekStart, sourceFingerprint, ready: true, completedSessions: 5, equipment: { dumbbellsKg: [5,5], kettlebellsKg: [10], bands: ['red'], pullUpBar: true, rowingMachine: true }, days, safetyPolicy: {} };
  assert.equal((await appCall('/review/sync', deviceToken, { id, snapshots: [snapshot] })).status, 200);
  assert.doesNotMatch(db.prepare('SELECT snapshot FROM weekly_snapshots').get().snapshot, /drop me|notes/);

  const mcpCall = body => worker.fetch(new Request('https://example.com/mcp', { method: 'POST', headers: { Authorization: `Bearer ${env.MCP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), env);
  assert.equal((await worker.fetch(new Request('https://example.com/mcp', { method: 'POST', headers: { Authorization: 'Bearer wrong' }, body: '{}' }), env)).status, 401);
  const initialized = await (await mcpCall({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} })).json();
  assert.equal(initialized.result.serverInfo.name, 'move-strong-weekly-review');
  const week = await (await mcpCall({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'get_week_for_review', arguments: { sourceWeekStart } } })).json();
  assert.equal(week.result.structuredContent.snapshot.completedSessions, 5);

  const draft = { sourceWeekStart, nextWeekStart, sourceFingerprint, summary: 'Small, symptom-gated progression.', items: [{ id: 'd3e-row', name: 'Row', state: 'PROGRESS', from: '3 × 12 at 5 kg', to: '3 × 12 at 5 kg with a pause', reason: 'Clean work and stable next-day symptoms; change tempo only.', target: { targetSets: 3, targetReps: 12, implement: 'dumbbell', loadKg: 5, loadLabel: '5 kg dumbbell', variation: 'paused' } }] };
  const saved = await (await mcpCall({ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'save_next_week_draft', arguments: draft } })).json();
  assert.equal(saved.result.structuredContent.status, 'draft');
  const pulled = await (await appCall('/review/draft', deviceToken, { id, nextWeekStart })).json();
  assert.equal(pulled.draft.status, 'draft');
  assert.equal((await appCall('/review/approve', deviceToken, { id, nextWeekStart })).status, 200);
  assert.equal(db.prepare('SELECT status FROM review_drafts WHERE next_week_start=?').get(nextWeekStart).status, 'approved');
  assert.equal((await appCall('/review/disable', deviceToken, { id }, 'DELETE')).status, 200);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM weekly_snapshots').get().n, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM review_drafts').get().n, 0);
  db.close();
});
