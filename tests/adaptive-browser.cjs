const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173');
    const state = {
      version: '2.1.3', startDate: '2026-07-14', operatedSide: 'Right', morningRounds: 1,
      goals: { pullups: '', checklist: {} }, logs: { 'w1-d1-home': { complete: true, exercises: {}, notes: 'preserve me', updatedAt: '2026-07-14T08:00:00Z' } },
      healthOS: { schemaVersion: 2, settings: { programmeStart: '2026-09-21', wake: '06:30', workout: '07:05', work: '09:00', windDown: '22:00', bedtime: '22:45', saunaTime: '18:00', saunaDays: [1, 3, 5], movementTimes: ['11:00', '13:00', '15:30'], reminders: false, upperBodyCleared: true, clearanceNotes: '' }, days: {}, milestones: {}, reminderState: {} }
    };
    const add = (key, exercises, extra = {}) => { state.healthOS.days[key] = { routine: {}, activities: {}, recovery: {}, workout: { complete: true, exercises, painDuring: extra.painDuring || '1', painNext: extra.painNext || '1', effort: extra.effort || '4', cardioMinutes: extra.cardioMinutes || '', updatedAt: `${key}T08:00:00Z` } }; };
    add('2026-09-21', { 'd3e-pullup-single': { done: true, sets: ['1', '1', '1'] }, 'd3e-row': { done: true, sets: ['8', '8', '8'], load: '5kg' } }, { painDuring: '3', painNext: '' });
    add('2026-09-22', { 'd2e-bss': { done: true, sets: ['8', '8', '8'] }, 'd2e-slrdl': { done: true, sets: ['8', '8', '8'] }, 'd2e-calf': { done: true, sets: ['12', '12', '12'] } }, { painDuring: '0', painNext: '0' });
    add('2026-09-23', { 'd1e-pushup': { done: true, sets: ['8', '8', '8'] } }, { painDuring: '2', painNext: '1', effort: '2' });
    add('2026-09-24', {}, { cardioMinutes: '30', painNext: '1' });
    add('2026-09-25', { 'd3e-pullup-single': { done: false, sets: ['3', '2', '2'] }, 'd3e-row': { done: true, sets: ['10', '10', '10'], load: '5kg' }, 'd1e-pushup': { done: true, sets: ['12', '10', '10'] } }, { painDuring: '2', painNext: '1', cardioMinutes: '5' });
    await page.evaluate(value => localStorage.setItem('moveStrongRehabStateV1', JSON.stringify(value)), state);
    await page.reload();
    const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')));
    assert.equal(migrated.healthOS.schemaVersion, 3);
    assert.equal(migrated.logs['w1-d1-home'].notes, 'preserve me');
    assert.ok(migrated.healthOS.generatedWeeks['2026-09-28']);

    await page.locator('[data-route="progress"]').click();
    await page.getByText('First adaptive week', { exact: true }).waitFor();
    assert.equal(await page.locator('.os-state.progress').count() > 0, true);
    assert.equal(await page.locator('.os-state.hold').count() > 0, true);
    await page.screenshot({ path: 'artifacts/adaptive-review.png', fullPage: true });

    await page.locator('[data-route="train"]').click();
    await page.locator('#os-date').fill('2026-09-28'); await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-os="session"]').click();
    await page.getByText(/8–9 clean total reps/, { exact: false }).waitFor();
    await page.screenshot({ path: 'artifacts/text-workout.png', fullPage: true });
    await page.locator('[data-exercise-rir="d3e-pullup-single"]').selectOption('3');
    await page.locator('[data-exercise-technique="d3e-pullup-single"]').selectOption('clean');
    await page.locator('#os-minutes').fill('40');
    await page.locator('#os-breathingSymptoms').selectOption('none');
    await page.getByRole('button', { name: 'Finish session ✓', exact: true }).click();

    await page.locator('[data-route="train"]').click(); await page.locator('#os-date').fill('2026-09-29'); await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-route="home"]').click();
    await page.getByText('How is your shoulder this morning?', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Complete shoulder check →' }).click();
    await page.locator('#os-morningPain').fill('1'); await page.locator('#os-morningStatus').selectOption('same');
    await page.getByRole('button', { name: 'Save morning recovery' }).click();
    assert.equal(await page.locator('#morning-recovery-form').getByText('Shoulder follow-up saved').count(), 1);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('moveStrongRehabStateV1')));
    assert.equal(saved.healthOS.days['2026-09-28'].workout.exercises['d3e-pullup-single'].rir, '3');
    assert.equal(saved.healthOS.days['2026-09-29'].recovery.previousWorkout.status, 'same');
    assert.deepEqual(errors, []);
    console.log('PASS: v3 migration, first adaptive week, RIR/technique, asthma fields and next-morning recovery');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
