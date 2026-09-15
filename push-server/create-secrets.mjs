import fs from 'node:fs';
import crypto from 'node:crypto';
import webpush from 'web-push';
if (fs.existsSync('secrets.json')) {
  console.log('Existing private push keys retained.');
} else {
  const keys = webpush.generateVAPIDKeys();
  fs.writeFileSync('secrets.json', JSON.stringify({ VAPID_PUBLIC_KEY: keys.publicKey, VAPID_PRIVATE_KEY: keys.privateKey, PAIRING_TOKEN: crypto.randomBytes(24).toString('base64url') }), { mode: 0o600 });
  console.log('Created private push keys in ignored local file.');
}
