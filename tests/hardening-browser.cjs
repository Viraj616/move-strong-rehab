const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 850 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173');
    await page.evaluate(() => {
      const healthOS = HealthModel.defaults();
      const day = HealthModel.dayRecord(healthOS, '2026-10-05');
      day.plan = { ...HealthModel.plans[0], exerciseOverrides: { 'd3e-row': { prescription: '2 × 8 rows with 5 kg', targetSets: 2, targetReps: 8, implement: 'dumbbell', loadKg: 5, loadLabel: '5 kg dumbbell', variation: 'standard' } } };
      day.planSource = 'daily-review';
      healthOS.dailyReviews['2026-10-04'] = { cadence: 'daily', targetDate: '2026-10-05', status: 'active' };
      localStorage.setItem('moveStrongRehabStateV1', JSON.stringify({ version: '3.11.0', startDate: '2026-09-21', operatedSide: 'Right', morningRounds: 1, goals: { pullups: '', dips: '', hollow: '', kneeRaises: '', support: '', runMinutes: '', checklist: {}, notes: '' }, logs: {}, healthOS }));
    });
    await page.reload();

    await page.locator('[data-route="train"]').click();
    await page.locator('#os-date').fill('2026-10-05'); await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-os="session"]').click();
    assert.equal(await page.locator('[data-exercise-id="d3e-row"]').count(), 2);
    assert.equal(await page.locator('[data-exercise-id="d3e-row"]').first().getAttribute('placeholder'), '8');
    await page.getByRole('button', { name: 'Mark session missed' }).click();
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')).healthOS.days['2026-10-05'].workout.status), 'skipped');

    await page.locator('[data-route="train"]').click();
    await page.locator('#os-date').fill('2026-10-06'); await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-os="session"]').click();
    await page.locator('#os-moveDate').fill('2026-10-07');
    await page.getByRole('button', { name: 'Swap dates' }).click();
    const swapped = await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')).healthOS.days);
    assert.equal(swapped['2026-10-06'].scheduleChange.with, '2026-10-07');
    assert.equal(swapped['2026-10-07'].scheduleChange.with, '2026-10-06');

    await page.locator('[data-route="settings"]').click();
    await page.getByRole('button', { name: 'Edit calisthenics + running goals' }).click();
    await page.locator('#goalPullups').fill('5'); await page.locator('#goalPullups').dispatchEvent('change');
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')).goals.pullups), '5');
    assert.deepEqual(errors, []);
    console.log('PASS: adaptive set counts, missed sessions, date swaps and editable goals');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
