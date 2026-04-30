const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  const OUT = 'screens-cycle20b';
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  async function capture(name) {
    await page.screenshot({ path: OUT + '/' + name + '.png', fullPage: true });
    console.log('📸 ' + name);
  }

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await capture('01_dashboard');

  // Open create modal
  const newBookBtn = await page.$('button:has-text("New Book")');
  if (newBookBtn) {
    await newBookBtn.click();
    await page.waitForTimeout(1000);
    await capture('02_create_modal');
    await page.fill('#modal-title', 'Summer at the Lake House');
    await page.click('button[form="create-book-form"]');
    await page.waitForURL('**/books/**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await capture('03_new_book_empty');

    // Navigate to editor
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await capture('05_dashboard_updated');
  }

  console.log('ERRORS:', errors.length);
  errors.slice(0, 5).forEach(e => console.log(' -', e.slice(0, 150)));
  await browser.close();
  console.log('Done');
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
