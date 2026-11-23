# Test inventory

- **full backup survives export and restore into a fresh installation** exercises both backup controls and compares sessions, heat, baseline, history, weight, reminder and import state after a round trip using a simulated document picker.

Flutter rebuild tests have individual assertion summaries below. Earlier web and server tests are grouped by source. Their descriptive test titles identify the checked behavior. Browser scripts are listed by filename and coverage.


## tests/health-model.test.cjs

- local calendar crosses month, leap day and year boundaries
- new records do not change a legacy log or collide after six weeks
- normalization rejects incompatible or corrupted records
- older schemas migrate to v4 without changing dated records and gain the known home-kit profile
- 21–25 September baseline generates the agreed first adaptive week
- row progression uses exact owned loads, then tempo when no heavier implement exists
- lower-body progression selects the owned 2 × 5 kg pair or 10 kg kettlebell
- bodyweight pulling and pushing progress by assistance, leverage or volume without invented load
- band progressions use the exact configured labels
- cardio prescription uses the configured rower and preserves asthma-safe progression
- equipment edits refresh unstarted days but preserve an already-started workout
- deterministic rules hold missing recovery and regress symptom flares
- cardio progression is symptom-aware and capped at ten percent
- weekly review snapshot includes all-history trends, recent detail and excludes free-text notes
- editing an older training record invalidates the complete-history review fingerprint
- daily review includes notes as observations and any note edit invalidates tomorrow
- daily reviewed plan changes only tomorrow and never rewrites a started target day
- recorded skill targets automatically rotate in the next exercise without a manual milestone
- skill pathways derive stages from two clean target sessions and ignore manual milestones
- shoulder pathways require stable next-morning recovery and reset after a concern
- skill pathway evidence counts the clean streak after the latest concern
- core target automatically replaces one future dead-bug slot with hollow holds
- a prior-week symptom concern prevents progression until two clean current exposures exist
- Codex reviewed plan can be activated automatically and rejects stale workout data
- adaptive generation uses the latest logged reps to create a concrete next target
- stale v1 generated weeks refresh before the following week is started
- started days are preserved while later days of a refreshed week can update
- exercise completion does not qualify work below the machine-readable target
- clinical clearance false survives normalization and holds shoulder progression
- reliever no is false, reliever yes holds cardio, and both cardio days update
- unstarted sessions can be swapped and missed sessions are counted explicitly
- reviewed plans reject unavailable loads and morning concerns remove unstarted shoulder work
- cloud merge restores remote settings on an empty device and keeps newest workouts
- cloud merge does not let an older device invent equipment over an explicit remote profile
- reminders respect weekday, completion, snooze, stale alerts and recent activity
- recovery never treats missing pain as clearance; flags take precedence
- calendar contains independent dated events and movement alarms
- visiting a blank date cannot hide an imported workout
- meditation follows work time and programme starts without altering history
- confirmed November profile provides the trial schedule and separate home and gym equipment profiles
- date-locked re-entry weeks use exact profiles, Friday fallback and week-two main-lift volume
- verified weight recalculates protein and completed week-one retests drive week-three progression

## tests/massage-guidance.test.cjs

- lower-body workouts map to the exercised muscle groups
- upper-body guidance identifies only muscle-belly targets and flags shoulder caution
- mobility-only sessions do not invent a percussion target
- rowing cardio maps to legs without being mistaken for a cable-row shoulder target

## push-server/test.mjs

- local schedules follow summer and winter timezone offsets
- weekends, recent movement, completed and stale reminders are suppressed
- validates schedule and rejects arbitrary push destinations
- API rejects wrong origins and unauthorised device access
- push library produces encrypted VAPID-authorised requests
- registered device syncs, cron deduplicates, expired subscriptions disable, and disconnect deletes data
- longitudinal snapshots are private and reviewed plans support automatic acknowledgement

## gym/test/flows_test.dart

- logging saves actual sets, load, RIR, recovery and both heat rounds — Saves via the workout form and checks set values, load, RIR, pain and two separate heat entries in persisted data.
- profile starting weight and retests persist edits — Changes starting weight and pull-up retest in the UI and reads stored values.
- Android reminder sends one selected time and cancellation — Checks the Android channel receives a workout time and cancellation from the UI. OS delivery requires a phone.

## gym/test/requirements_test.dart

- calendar, re-entry volume, prehab, rest and asthma cues — Checks weekly ordering, re-entry sets, prehab, target cues, rest times, demo mapping and aerobic warm-ups.
- pain boundary, incomplete sets, low RIR and skipped exercises — Checks the inclusive 3/10 boundary, incomplete sets, wrong RIR and skipped work.
- two stalled weeks trigger review and fatigue triggers early deload — Checks reviews for consecutive stalls and early reduction after two high-fatigue sessions.
- focal symptoms block loading across exercises — Checks that a focal flag on one exercise suspends other shoulder loading.
- calisthenics stages require performance and readiness — Checks promotion with two clean exposures and readiness, denial without readiness, and baseline hold caps.
- assisted dips and strength load increases stay conservative — Checks the two-exposure assisted dip gate and bounded strength-load increase.
- AI validator checks reason, load, volume, keys and suspended work — Exercises valid proposals and individually invalid reason, resistance, target, sets, extra fields and suspended work.
- migration CLI preserves both versions and refuses overwrite — Runs the migration executable on temporary copies, tests version retention, refuses overwrite and compares bytes.
- Export week copies targets, logs, heat, profile and next draft — Reads the actual clipboard payload, including targets, fatigue, sleep, both week boundaries, profile and heat note.

## gym/test/session_test.dart

- set entry keeps keyboard focus through inset changes — The active set field retains focus and text through a simulated keyboard resize.
- missed training supplies no evidence and swapped legs get recovery — A swapped lower-body workout blocks duplicate loading the next day. Missing it does not.

## gym/test/training_test.dart

- imported dated evidence keeps missing recovery unknown and original heat notes intact — Unknown next-morning pain stays unknown and original heat records survive import.
- three weeks drive fourth week assistance and deterministic export — Three mock weeks generate a lower fourth-week assistance target and repeatable drafts.
- hold incomplete recovery and regress symptoms — Missing recovery holds loading. Excess pain during or the following morning regresses it.
- week five deload; unknown kit and inflated AI suggestion rejected — Checks fifth-week deload, the catalogue equipment list and rejected suggestions.
- migration retains both original records — Both slot-based and dated records survive normalization.

## Legacy browser scripts

- tests\push-browser.cjs — phone connection UI, schedule-only upload, test, sync, disconnect, credential exclusion. Push API and network mocked; real Android delivery still requires user confirmation.
- tests\navigation.cjs — phone Back, week context, text guides, timer, logs, forward, reload, routine details
- tests\browser.cjs — desktop/mobile, logs, routines, committed weeks, text-only sessions, recovery, sauna, milestones, settings, reminders, export, import, stable disclosures, current-only UI, offline, corrupt-data protection
- tests\adaptive-browser.cjs — v4 equipment migration, editable kit, adaptive week, RIR/technique, asthma fields and next-morning recovery
- tests\hardening-browser.cjs — adaptive set counts, missed sessions, date swaps and editable goals
- tests\input-focus.cjs — exercise and session inputs retain focus through cloud sync and Done saves cleanly
- tests\massage-browser.cjs — exercise-specific X6 Ultra timing, targets, ORIF warning, evidence limits and mobile layout
