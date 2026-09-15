const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage(); const calls = []; const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    const sub = { toJSON: () => ({ endpoint: 'https://fcm.googleapis.com/test', keys: { p256dh: 'x'.repeat(87), auth: 'x'.repeat(22) } }), unsubscribe: async () => true };
    const registration = { pushManager: { getSubscription: async () => null, subscribe: async () => sub } };
    Object.defineProperty(navigator, 'serviceWorker', { value: { ready: Promise.resolve(registration), register: async () => registration, getRegistration: async () => registration } });
    Object.defineProperty(window, 'Notification', { value: { permission: 'granted', requestPermission: async () => 'granted' } });
    Object.defineProperty(window, 'PushManager', { value: function () {} });
  });
  await page.route('https://move-strong-reminders.viraj616.workers.dev/**', route => {
    const request = route.request(); calls.push({ path: new URL(request.url()).pathname, body: request.postDataJSON() });
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(request.method() === 'GET' ? { publicKey: 'a'.repeat(87) } : { ok: true }) });
  });
  await page.goto('http://127.0.0.1:4173');
  await page.locator('[data-route="settings"]').click();
  await page.locator('#push-code').fill('synthetic-pairing-code');
  await page.locator('#push-connect button').click();
  await page.locator('#push-test').waitFor();
  const registration = calls.find(c => c.path === '/subscribe');
  assert.ok(registration.body.deviceToken);
  assert.deepEqual(Object.keys(registration.body.settings).sort(), ['movementTimes','saunaDays','saunaTime','timeZone']);
  await page.locator('#push-test').click();
  await page.waitForFunction(() => document.getElementById('toast').textContent.includes('Test sent'));
  await page.locator('#push-sync').click();
  await page.waitForFunction(() => document.getElementById('toast').textContent === 'Schedule synced');
  assert.ok(calls.find(c => c.path === '/sync'));
  assert.equal(await page.evaluate(() => JSON.stringify(state).includes('synthetic-pairing-code')), false);
  await page.locator('#push-disable').click();
  await page.locator('#push-connect').waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('moveStrongPushDeviceV1')), null);
  assert.ok(calls.find(c => c.path === '/disable'));
  assert.deepEqual(errors, []);
  await browser.close(); console.log('PASS: phone connection UI, schedule-only upload, test, sync, disconnect, credential exclusion. Push API and network mocked; real Android delivery still requires user confirmation.');
})().catch(e => { console.error(e); process.exit(1); });
