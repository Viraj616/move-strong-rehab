const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    let releaseCloudPull;
    const cloudPullReleased = new Promise(resolve => { releaseCloudPull = resolve; });
    await page.route('https://firestore.googleapis.com/**', async route => {
      if (route.request().method() === 'GET') {
        await cloudPullReleased;
        const state = await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ fields: { payload: { stringValue: JSON.stringify(state) } } })
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });

    await page.goto('http://127.0.0.1:4173');
    await page.evaluate(() => {
      localStorage.setItem('moveStrongFirebaseSyncV1', JSON.stringify({
        projectId: 'focus-test', apiKey: 'test', email: 'test@example.com', uid: 'user',
        refreshToken: 'refresh', idToken: 'token', expiresAt: Date.now() + 3600000
      }));
    });
    await page.reload();

    await page.locator('[data-route="train"]').click();
    await page.locator('#os-date').fill('2026-09-21');
    await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-os="session"]').click();

    const setInput = page.locator('[data-set-index]').first();
    await setInput.click();
    await setInput.fill('12');
    releaseCloudPull();
    await page.waitForTimeout(200);
    assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-set-index')), true, 'cloud pull must not replace the focused set input');
    assert.equal(await setInput.inputValue(), '12');

    const loadInput = page.locator('[data-exercise-load]').first();
    await loadInput.click();
    await loadInput.fill('8 kg');
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute('data-exercise-load')), true, 'scheduled sync must not replace the focused load input');
    assert.equal(await loadInput.inputValue(), '8 kg');

    await page.locator('#os-minutes').click();
    await page.locator('#os-minutes').fill('45');
    await page.waitForTimeout(1500);
    assert.equal(await page.evaluate(() => document.activeElement?.id), 'os-minutes', 'session fields must keep focus during sync');

    await page.getByRole('button', { name: 'Finish session ✓', exact: true }).click();
    await page.getByRole('button', { name: 'Reopen session', exact: true }).waitFor();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')));
    const workout = saved.healthOS.days['2026-09-21'].workout;
    const firstExercise = Object.values(workout.exercises)[0];
    assert.equal(firstExercise.sets[0], '12');
    assert.equal(firstExercise.load, '8 kg');
    assert.equal(workout.minutes, '45');
    assert.equal(workout.complete, true);
    assert.deepEqual(errors, []);
    console.log('PASS: exercise and session inputs retain focus through cloud sync and Done saves cleanly');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
