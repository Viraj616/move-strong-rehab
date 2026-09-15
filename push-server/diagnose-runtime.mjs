import fs from 'node:fs';
import crypto from 'node:crypto';
import webpush from 'web-push';
import { execFileSync } from 'node:child_process';
const keys = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
const recipient = webpush.generateVAPIDKeys(); const id = crypto.randomUUID(); const deviceToken = crypto.randomBytes(32).toString('base64url');
const base = 'https://move-strong-reminders.viraj616.workers.dev';
let subscription = { endpoint: 'https://fcm.googleapis.com/fcm/send/move-strong-invalid-diagnostic-endpoint', keys: { p256dh: recipient.publicKey, auth: crypto.randomBytes(16).toString('base64url') } };
// Optional: send one real diagnostic to a specified owner-authorized device.
if (process.argv[2]) {
  const target = process.argv[2];
  if (!/^[a-f0-9-]{36}$/.test(target)) throw Error('Invalid device ID');
  const raw = execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'move-strong-reminders', '--remote', `--command=SELECT subscription FROM devices WHERE id='${target}'`, '--json'], { encoding: 'utf8' });
  subscription = JSON.parse(JSON.parse(raw)[0].results[0].subscription);
}
async function call(path, token, body, method = 'POST') {
  const response = await fetch(base + path, { method, headers: { Origin: 'https://viraj616.github.io', Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { status: response.status, result: await response.json() };
}
try {
  const registration = await call('/subscribe', keys.PAIRING_TOKEN, { id, deviceToken, subscription, settings: { movementTimes: [], saunaDays: [], saunaTime: '18:00', timeZone: 'Europe/London' } });
  if (registration.status !== 200) throw Error(JSON.stringify(registration));
  console.log(JSON.stringify(await call('/test', deviceToken, { id })));
} finally {
  console.log('Diagnostic device cleanup:', (await call('/disable', deviceToken, { id }, 'DELETE')).status);
}
