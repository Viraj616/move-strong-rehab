# Move Strong gym app

From this directory run `flutter pub get`, then `flutter run` on Android or `flutter run -d edge` on Windows. Run `flutter test` for the progression and session tests. Build the static release with `flutter build web --no-tree-shake-icons --base-href /move-strong-rehab/`. Build an Android package with a configured Android SDK using `flutter build apk`.

The original web client lives one directory above. On its original web origin, the new client reads the existing Move Strong storage key on first launch. For a native installation, export the old app's JSON backup, open Progress, and paste it into Import existing history. Imports preserve the historical fields and original IDs. Only dated exercises with compatible identities and recorded targets contribute to progression.

The Week tab opens sessions and copies the week's JSON to the clipboard. Reopen a saved session the following morning to enter recovery. Progress holds the editable starting weight, baseline retests, historical results and the Android reminder setting. Each heat round has its own type, duration and skin/chest note.

The pure Dart training engine lives in `lib/training.dart`. Its inputs are the calendar week, recorded history and baseline. See the repository's `REHAB_EVIDENCE.md` and the planned server review contract in `AI_REVIEW.md`.
