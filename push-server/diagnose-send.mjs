import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import webpush from 'web-push';
const id = process.argv[2];
if (!/^[a-f0-9-]{36}$/.test(id || '')) throw Error('Provide the specific device ID to test');
const raw = execFileSync(process.execPath, ['node_modules/wrangler/bin/wrangler.js', 'd1', 'execute', 'move-strong-reminders', '--remote', `--command=SELECT subscription FROM devices WHERE id='${id}'`, '--json'], { encoding: 'utf8' });
const subscription = JSON.parse(JSON.parse(raw)[0].results[0].subscription);
const keys = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
try {
  const result = await webpush.sendNotification(subscription, JSON.stringify({ title: 'Move Strong delivery check', body: 'This test checks delivery directly to your phone.', tag: 'move-strong-diagnostic' }), { TTL: 600, vapidDetails: { subject: 'https://viraj616.github.io/move-strong-rehab/', publicKey: keys.VAPID_PUBLIC_KEY, privateKey: keys.VAPID_PRIVATE_KEY } });
  console.log(JSON.stringify({ status: result.statusCode, accepted: true }));
} catch (error) {
  console.log(JSON.stringify({ status: error.statusCode, error: String(error.body || error.message).replace(/https?:\/\/\S+/g, '[provider]').slice(0, 500) }));
  process.exitCode = 1;
}
