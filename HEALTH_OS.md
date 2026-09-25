# Move Strong 3.1

The app opens on a dated Today timeline, with a morning routine, scheduled training, movement breaks, optional sauna and bedtime. Week shows only committed current or generated plans; speculative month views are deliberately omitted. Log offers the dated programme, text-only technique guidance, set logging and previous results without exercise-mimicking imagery. Recovery logs sleep, shoulder symptoms, energy, breathing and sauna/skin response. Review explains weekly adaptation and records manual milestones. You contains schedule, sync and backup preferences.

## Data compatibility

The production origin and `moveStrongRehabStateV1` key must stay the same to retain on-device history. Existing `logs`, `goals`, start date and original exercise IDs remain intact. The old programme and its history remain accessible from Train. Health state now uses `schemaVersion: 3`, adding `generatedWeeks`, `weeklyReviews`, exercise-level `rir` / `technique`, next-morning recovery records, and cardio breathing fields. Schema v2 is migrated in place after a pre-migration snapshot; no dated record or six-week slot is renamed or reused.

Before the first write, existing storage is copied to `moveStrongRehabPreHealthOSV1`. Export includes old and new data. Imports merge records, keeping current records on conflicts, with a pre-import snapshot at `moveStrongRehabPreImport`. On an empty device, imported setup is restored too. An empty day created by browsing does not replace an imported workout. Unreadable stored JSON is not overwritten. These snapshots share browser storage and are not substitutes for downloaded backups.

## Notifications

Enable reminders in You. While the app runs, weekday movement reminders and optional sauna reminders offer Start, Snooze 30 minutes and Skip. Logged walks/workouts suppress movement reminders for 45 minutes. Alerts older than 15 minutes are not replayed. Browser notifications are requested only after pressing Enable; denied or unsupported permissions still permit in-app prompts. Reminders can be delayed if the OS suspends the tab.

Version 2.1 adds an optional Cloudflare Worker and D1 scheduler in `push-server/`. Connect the phone in You using the deployed server and private pairing code. The server uses standard encrypted Web Push and checks schedules once per minute in the phone's last-synced timezone. It suppresses duplicate deliveries and recent completed movement, retries transient failures for up to ten minutes, and disables expired subscriptions. It supports up to four active devices. Closed-app notifications require a valid connection and permission; delivery timing depends on network and Android settings. Push alerts open the app; notification action buttons and server-side snooze are not implemented. Open-app alerts are suppressed when push is connected to prevent duplicates.

The reminder server receives only reminder settings, timezone, push subscription and recent completion flags; health notes and detailed workout history are never sent to that server. If the separate optional Firebase health-data sync is connected, the full app state is sent to the user’s Firestore account. Device tokens are stored separately from backups; the pairing code and VAPID private key are excluded from Git. Schedule/completion changes sync when online, so offline changes cannot immediately suppress a server reminder. Reopen the app after timezone changes. Use Sync now to retry a failed sync, and Disconnect to remove the device from the server.

Calendar export remains a fallback. Its one-week snapshot contains only the selected committed week, including local-time events and movement/sauna alarms; verify your calendar retained alerts after import. It does not sync with the app and should be replaced after each weekly review.

## Adaptive weekly programming

Every completed exercise can record 0–4 RIR and Clean / Okay / Poor technique. The following morning, shoulder pain, change from baseline and focal plate-site symptoms are requested. A missing shoulder follow-up prevents automatic progression. Cardio records breathing/asthma symptoms and reliever use.

The deterministic rules use three states. PROGRESS requires target completion, clean technique, 2–4 RIR, controlled effort, shoulder pain no higher than 2/10 and stable next-morning symptoms. HOLD is used for missing data, incomplete targets, okay technique, low RIR, high effort or borderline 3/10 pain. REGRESS / MODIFY is used for poor technique, pain of 4/10 or more during training, pain of 3/10 or more next morning, worse recovery, focal plate symptoms, or moderate/stopping asthma symptoms. Progress changes only one major variable and cardio increases are capped at 10%.

The 21–25 September 2026 records are the first baseline. The generated week of 28 September retains the programme schedule while holding the pull-up variation at 8–9 total reps, moving 5 kg rows to 3 × 12, adding one controlled floor-push-up exposure with two incline back-off sets, moving the recorded leg exercises to modest rep targets, holding dead bugs for control, and moving conversational cardio to 32 minutes. The Progress screen shows the evidence and reason for every generated change.

## Optional health-data cloud sync

`cloud-sync.js` uses Firebase Authentication and the Firestore REST API, so the static PWA keeps its no-build architecture. Local storage is always written first; online changes are debounced and synced afterwards. Cloud and local records merge by `updatedAt`, with the newest workout/recovery record winning. Firebase configuration and refresh tokens use the separate `moveStrongFirebaseSyncV1` local key and are excluded from JSON backups. See README for setup and per-user Firestore rules.

## Training scope

The programme reuses conservative exercises from the existing app. Upper-body clearance starts unrecorded. Advanced skills are manual long-term milestones and never unlock or increase prescribed load automatically. Check-ins use transparent symptom-based prompts, not numerical readiness scores. Sauna is optional; the app records skin response without claiming a causal effect or treating eczema. The You screen links clinical sources.

## Run and verify

No build step or production dependencies are needed. Run `node dev-server.cjs` and open `http://127.0.0.1:4173`. Model tests: `node --test tests/health-model.test.cjs`. Browser checks: install Playwright separately or set `PLAYWRIGHT_PATH` to an available installation, then run `node tests/browser.cjs` and `node tests/adaptive-browser.cjs`. The browser tests default to installed Edge; set `BROWSER_CHANNEL` for another installed Chromium channel. They use isolated browser profiles and synthetic history, and do not access the user's real browser records.

Browser coverage includes desktop/mobile layout, old-record preservation, first-write snapshot, routine persistence, committed-week planning, text-only exercise guidance, workout completion, check-ins, sauna, milestone recording, settings, reminder preview, one-week ICS download, backup merge, original programme navigation, offline reload and corrupted storage protection. Screenshots are written to ignored `artifacts/`.

## Release

Deploy the static files to the existing website path only after review. The service worker cache and script/style URLs are versioned to avoid mixing old cached code with the new page. Keep the same origin, do not clear site data, and export a backup on the device before deployment. Local preview data and the live site's browser data are independent. The Worker only accepts the configured production origin; the local preview cannot pair with production.
