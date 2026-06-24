# Move Strong Rehab

A local-first six-week Progressive Web App (PWA) containing the six-day Strength Side-inspired movement and post-clavicle-ORIF strengthening plan.

## Included

- Six training days, each with a 10- or 20-minute morning session and a longer evening session
- Local position-guide diagrams for every exercise
- Text technique cues and clavicle-specific precautions
- YouTube search links as an optional fallback only
- Sets, repetitions, loads/levels and exercise-completion tracking
- Rest timer
- Pain-during, pain-after and next-morning response tracking
- Six-week completion view
- JSON backup and restore
- Offline use after installation

The app stores training records locally in the browser on the device. It has no user account or server database.

---

# Publish it with GitHub Pages

## 1. Extract the ZIP

On Windows:

1. Right-click the downloaded ZIP.
2. Select **Extract All**.
3. Open the extracted `strengthside_clavicle_app` folder.
4. Confirm that you can see `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `README.md`, and the `assets` folder.

Do not upload the ZIP itself to GitHub. Upload the files inside the extracted folder.

## 2. Create a GitHub account

1. Go to GitHub and create a free account, or sign in to an existing account.
2. Verify the email address if GitHub asks you to.

## 3. Create the repository

1. At the top-right of GitHub, select the **+** button.
2. Select **New repository**.
3. Repository name: `move-strong-rehab`.
4. Set visibility to **Public**. GitHub Pages on a free account publishes from a public repository.
5. Do not add a README, `.gitignore`, or licence because this package already includes its own files.
6. Select **Create repository**.

The public repository will contain the app code and generic exercise plan. Your completed workouts, notes and pain records stay in your phone/browser storage and are not uploaded to the repository.

## 4. Upload the app

1. On the empty repository page, select **uploading an existing file**. Alternatively use **Add file → Upload files**.
2. In Windows File Explorer, open the extracted app folder.
3. Select all files and the `assets` folder.
4. Drag them into the GitHub upload area.
5. Check that `index.html` appears at the top level, not inside another folder.
6. In the commit box, enter `Initial app upload`.
7. Select **Commit changes**.

## 5. Turn on GitHub Pages

1. Open the repository's **Settings** tab.
2. In the left sidebar, select **Pages** under **Code and automation**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Under **Branch**, choose `main` and `/ (root)`.
5. Select **Save**.
6. Return to the Pages screen until GitHub displays the published site address. It will usually have this format:

   `https://YOUR-USERNAME.github.io/move-strong-rehab/`

7. Open that address on the Windows laptop first and check that the home screen loads.

## 6. Install it on the Samsung S23+

1. Send the GitHub Pages address to the phone or type it into **Google Chrome**.
2. Open the site in Chrome, not inside an email or messaging-app preview.
3. Tap Chrome's three-dot menu.
4. Tap **Add to home screen**.
5. Tap **Install**. Depending on the Chrome version, the first option may say **Install app**.
6. Open **Move Strong** from the Android home screen.
7. In the app, open **Settings** and set the programme start date, operated side, and default morning duration.

The plan, diagrams and saved logs work offline after the app has loaded. The **Video fallback** buttons open YouTube and require an internet connection.

## 7. First-use checklist

1. Open **Plan** and inspect all six days.
2. Open Day 1 morning and confirm the exercise cards and diagrams load.
3. Enter a test set, close the app, reopen it and confirm the entry remains.
4. Open **Settings → Export backup** and save the JSON file somewhere safe, such as Google Drive or OneDrive.
5. Delete the test entry if needed and begin Week 1.

---

# Updating the programme after six weeks

Before any update:

1. Open **Settings** in the app.
2. Select **Export backup**.
3. Keep the downloaded JSON file.
4. Bring the backup and your training feedback to the next programme review.

To publish a revised app package:

1. Download and extract the replacement package.
2. Open the GitHub repository.
3. Use **Add file → Upload files**.
4. Upload the replacement files and allow GitHub to overwrite matching files.
5. Commit the changes with a message such as `Week 7 programme update`.
6. Open the app while connected to the internet. Close and reopen it once to ensure the refreshed files are active.
7. Import the backup only if the browser data was lost; normal code updates should not erase locally saved records.

The `CACHE_NAME` near the top of `sw.js` is versioned. A revised package should increase this version so the installed app removes the older offline cache.

---

# Important limitations

- This is an independent plan inspired by publicly shown movement-training principles. It is not affiliated with Strength Side and does not reproduce a paid programme.
- The line diagrams are position guides, not medical or biomechanical illustrations.
- The app does not diagnose injury or replace surgeon/physiotherapist clearance.
- Stop progression for sharp fracture-site or plate pain, new swelling, deformity, neurological symptoms, sudden weakness, or worsening symptoms after a fall.
