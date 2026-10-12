import fs from 'node:fs';
import crypto from 'node:crypto';
import webpush from 'web-push';
if (fs.existsSync('secrets.json')) {
  const secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
  if (!secrets.MCP_ACCESS_TOKEN) {
    secrets.MCP_ACCESS_TOKEN = crypto.randomBytes(32).toString('base64url');
    fs.writeFileSync('secrets.json', JSON.stringify(secrets), { mode: 0o600 });
    console.log('Existing private push keys retained; added a private Codex review token.');
  } else console.log('Existing private push and Codex review keys retained.');
} else {
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync('secrets.json', JSON.stringify({ VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey, PAIRING_TOKEN: crypto.randomBytes(24).toString('base64url'), MCP_ACCESS_TOKEN: crypto.randomBytes(32).toString('base64url') }), { mode: 0o600 });
  console.log('Created private push and Codex review keys in ignored local file.');
}
