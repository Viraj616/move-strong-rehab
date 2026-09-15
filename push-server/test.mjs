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
    globalThis.fetch = async () => { sent++; return new Response('', { status: 201 }); };
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
