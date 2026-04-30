const { chromium } = require('playwright');
const { execSync } = require('child_process');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const screensDir = './screens/cycle26-explore';
execSync(`mkdir -p ${screensDir}`);

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.locator('button').filter({ hasText: /password/i }).first().click();
  await page.waitForTimeout(800);
  await page.fill('input[type="password"]', PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/01-dashboard.png`, fullPage: true });

  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${screensDir}/02-dashboard-scrolled.png`, fullPage: false });

  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/03-books.png`, fullPage: true });

  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Book links found:', bookLinks.length);
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/04-book-detail.png`, fullPage: true });

    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screensDir}/05-book-detail-scrolled.png`, fullPage: false });

    const addMemBtn = page.locator('button').filter({ hasText: /add memory/i }).first();
    if (await addMemBtn.isVisible({ timeout: 2000 })) {
      console.log('Add memory button visible');
      await addMemBtn.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screensDir}/06-add-memory-modal.png`, fullPage: false });
    }
  }

  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/07-settings.png`, fullPage: true });

  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/08-upgrade.png`, fullPage: true });

  console.log('Errors captured:', errors.length);
  errors.forEach(e => console.log('ERROR:', e));

  await browser.close();
  console.log('Done!');
})();
