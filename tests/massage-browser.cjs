const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:4173', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.locator('[data-route="train"]').click();
    await page.locator('#os-date').fill('2026-09-21');
    await page.locator('#os-date').dispatchEvent('change');
    await page.locator('[data-os="session"]').click();

    await page.getByRole('heading', { name: 'Massage-gun guide for this session' }).waitFor();
    await page.getByText('Speed 1 (2,000 rpm)', { exact: false }).waitFor();
    await page.getByText('Clavicle ORIF plate: make this a no-go zone.', { exact: true }).waitFor();
    assert.equal(await page.locator('.os-massage-targets').getByText('Triceps or forearms', { exact: true }).count(), 1);
    assert.equal(await page.getByText('does not claim improved strength, hypertrophy, fracture healing or training adaptations', { exact: false }).isVisible(), false);
    await page.locator('.os-massage-guide details summary').click();
    await page.getByText('does not claim improved strength, hypertrophy, fracture healing or training adaptations', { exact: false }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.locator('.os-massage-guide').screenshot({ path: 'artifacts/massage-guide-mobile.png' });
    assert.deepEqual(errors, []);
    console.log('PASS: exercise-specific X6 Ultra timing, targets, ORIF warning, evidence limits and mobile layout');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
