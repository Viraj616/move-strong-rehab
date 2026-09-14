# Move Strong 2.0

The app opens on a dated Today timeline, with a morning routine, scheduled training, movement breaks, optional sauna and bedtime. Calendar supports weekly/monthly views. Train retains the original exercise guides and offers a dated programme, set logging and previous results. Recovery logs sleep, shoulder symptoms, energy, breathing and sauna/skin response. Progress records manual calisthenics milestones and weekly activity. You contains schedule preferences and backups.

## Data compatibility

The production origin and `moveStrongRehabStateV1` key must stay the same to retain on-device history. Existing `logs`, `goals`, start date and original exercise IDs remain intact. The old programme and its history remain accessible from Train. New state is additive at `state.healthOS`, with `schemaVersion: 2`, local-date `days`, `settings`, `milestones` and `reminderState`. New sessions never reuse six-week slot keys.

Before the first write, existing storage is copied to `moveStrongRehabPreHealthOSV1`. Export includes old and new data. Imports merge records, keeping current records on conflicts, with a pre-import snapshot at `moveStrongRehabPreImport`. On an empty device, imported setup is restored too. An empty day created by browsing does not replace an imported workout. Unreadable stored JSON is not overwritten. These snapshots share browser storage and are not substitutes for downloaded backups.

## Notifications

Enable reminders in You. While the app runs, weekday movement reminders and optional sauna reminders offer Start, Snooze 30 minutes and Skip. Logged walks/workouts suppress movement reminders for 45 minutes. Alerts older than 15 minutes are not replayed. Browser notifications are requested only after pressing Enable; denied or unsupported permissions still permit in-app prompts. Reminders can be delayed if the OS suspends the tab.

There is no backend or Web Push scheduler. Closed-app notifications are **not** implemented or promised. The four-week ICS snapshot contains local wall-clock events and movement/sauna display alarms. Calendar applications differ in alarm import behavior, so verify alerts after import. Use a dedicated calendar and replace the snapshot after schedule changes. Exported alerts do not suppress themselves after a workout. For reliable adaptive closed-app alerts, add a push subscription backend and scheduler in a subsequent release.

## Training scope

The programme reuses conservative exercises from the existing app. Upper-body clearance starts unrecorded. Advanced skills are manual long-term milestones and never unlock or increase prescribed load automatically. Check-ins use transparent symptom-based prompts, not numerical readiness scores. Sauna is optional; the app records skin response without claiming a causal effect or treating eczema. The You screen links clinical sources.

## Run and verify

No build step or production dependencies are needed. Run `node dev-server.cjs` and open `http://127.0.0.1:4173`. Model tests: `node --test tests/health-model.test.cjs`. Browser checks: install Playwright separately or set `PLAYWRIGHT_PATH` to an available installation, then run `node tests/browser.cjs`. The browser test defaults to installed Edge; set `BROWSER_CHANNEL` for another installed Chromium channel. It uses an isolated browser profile and synthetic history, and does not access the user's real browser records.

Browser coverage includes desktop/mobile layout, old-record preservation, first-write snapshot, routine persistence, week/month calendar, exercise guide, workout completion, check-ins, sauna, milestone recording, settings, reminder preview, ICS download, backup merge, original programme navigation, offline reload and corrupted storage protection. Screenshots are written to ignored `artifacts/`.

## Release

Deploy the static files to the existing website path only after review. The service worker cache is versioned to 2.0.0 and new script/style URLs are versioned to avoid mixing old cached code with the new page. Keep the same origin, do not clear site data, and export a backup on the device before deployment. Local preview data and the live site's browser data are independent.
