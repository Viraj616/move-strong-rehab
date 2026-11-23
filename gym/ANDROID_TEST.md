# Install on your Samsung phone

Open [Move Strong releases](https://github.com/Viraj616/move-strong-rehab/releases), select the newest Android release, expand **Assets**, and tap **Move-Strong.apk**. Open the downloaded file. If prompted, tap **Settings → Allow from this source**, go back and tap **Install**. You can turn this permission off again afterwards. On future releases use the same steps and tap **Update**. Android keeps the installed app's private storage when updating the same package with the same signing identity. Uninstalling or clearing storage removes that data.

Under **Progress → Export all data**, choose a destination in the Android file picker and tap **Save**. The JSON contains personal training and recovery records. To recover them, open **Progress → Restore full backup**, pick the file and confirm. For history from the earlier web app, use **Import existing history**.

## Optional developer build

1. On Windows install Android Studio. In **More Actions → SDK Manager** (or **Tools → SDK Manager**) install Android SDK Platform **36**. Under **SDK Tools** install Android SDK Build-Tools, Android SDK Platform-Tools, Android SDK Command-line Tools (latest), and NDK (Side by side) **28.2.13676358**. Use the Android Studio bundled JDK. Install Flutter **3.50.1 stable** and add its `bin` folder to PATH. [Flutter Android setup](https://docs.flutter.dev/platform-integration/android/setup)
2. On the phone, open **Settings → About phone → Software information** and tap **Build number** seven times. In **Settings → Developer options**, enable **USB debugging**. Connect by USB with a data cable, unlock the phone and accept the computer's debugging key. If Windows cannot see it, install the [Samsung USB driver](https://developer.samsung.com/android-usb-driver).
3. From a new PowerShell window in a folder for a fresh checkout:

   ```powershell
   git clone --branch gym-rebuild --single-branch https://github.com/Viraj616/move-strong-rehab.git move-strong-phone-test
   Set-Location move-strong-phone-test/gym
   flutter --version
   flutter doctor --android-licenses
   flutter doctor -v
   flutter devices
   flutter pub get
   flutter test
   flutter build apk --debug
   ```

   Continue once the Android toolchain is healthy and your phone is listed. The resulting test APK is `build\app\outputs\flutter-apk\app-debug.apk`.

4. Install and open it. Use the Android SDK location shown in Android Studio if you changed the default. Replace `PHONE_SERIAL` with the value shown next to **device** in the first command's output.

   ```powershell
   $adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
   & $adb devices -l
   & $adb -s PHONE_SERIAL install -r .\build\app\outputs\flutter-apk\app-debug.apk
   & $adb -s PHONE_SERIAL shell am start -n com.viraj.movestrong/.MainActivity
   ```

   An `unauthorized` result requires accepting the prompt on the phone. `install -r` updates a matching signed test installation while preserving its storage. If Android reports a signature conflict, stop before uninstalling an installation containing logs. [Android Debug Bridge](https://developer.android.com/tools/adb)

## Phone acceptance tests

| Test | Steps and expected result |
|---|---|
| Keyboard focus | Open Monday's session. Tap the first set field once and type three comma-separated values. The keyboard should remain visible and the cursor should stay in the field. Move to assistance, then RIR, and repeat. |
| Offline persistence | In airplane mode enter sets, assistance, RIR, during-pain, duration and a note. Add one sauna and one steam round with separate minutes and notes. Save, close normally, reopen the app and inspect the same date. Add next-morning pain on a second visit. Both rounds and all values should survive. |
| Weekly export and progress | Tap Export week and paste into a private local note. Verify date, sets, heat rounds, planned targets and next week's draft. Open Progress and check the exercise's history. |
| One workout reminder | On Monday–Saturday open Progress → Workout reminder, choose an upcoming time and allow notifications. Change the time once, background the app normally and check for one notification around the replacement time. Tap it to open the app. Schedule another reminder, cancel with the crossed-out bell and check that it stays cancelled. Android uses an inexact alarm and may delay it during idle mode. |
| Real-history import | Open the migrated JSON on your phone, copy its full text and use Progress → Import existing history. Inspect several dates and legacy slots. Import again and verify no duplicate keys appear. A native app needs an explicit import from the previous web app. |

Firebase model calls, accepted/rejected suggestion display and approval are phase-two design items. The offline suggestion validator has automated tests. Clinical effectiveness and the movement accuracy of advanced variations are outside the automated checks.
