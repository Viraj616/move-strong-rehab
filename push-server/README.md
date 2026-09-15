# Personal reminder service

Free-tier Cloudflare Worker plus D1, checked once per minute. No paid features or billing subscription are needed at the intended personal scale. Keep within the provider's current free quotas. Four-device cap; about 1,440 scheduler invocations per day, plus app requests. Delivery history is retained for seven days.

Run `npm ci`, `npm test` and `npm run check` in this folder. Login with `npx wrangler login`. The configured D1 database belongs to the owner of this repository; for another account, create a database and replace its ID. Apply the schema with `npx wrangler d1 execute move-strong-reminders --remote --file=schema.sql`.

Run `node create-secrets.mjs` once. It writes an ignored `secrets.json` containing VAPID keys and a strong pairing code. Never publish that file. Set the Worker secrets with `npx wrangler secret bulk secrets.json`, then deploy with `npm run deploy`. Preserve the VAPID keys across deployments or existing subscriptions must be replaced. APP_ORIGIN and APP_URL must match the live app address.

On the phone, open You, enter the Worker address and PAIRING_TOKEN, allow notifications, then press Send test notification. The pairing code is used once; each device receives its own token. Disconnect removes the server record. Do not share pairing codes in public issues or commit them. Device subscriptions remain browser-specific; restored backups do not restore the push connection.

Tests exercise encryption, schedule validation, summer/winter timezone conversion, activity suppression, origin/auth checks, D1 schema/registration/sync, duplicate prevention, expired subscription handling and device deletion. A real phone must still confirm receiving a test notification and a scheduled notification with the app closed.
