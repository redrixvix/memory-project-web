const { chromium } = require('playwright');
const { execSync } = require('child_process');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const screensDir = './screens/cycle26-afterfix1';
execSync(`mkdir -p ${screensDir}`);

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.locator('button').filter({ hasText: /password/i }).first().click();
  await page.waitForTimeout(800);
  await page.fill('input[type="password"]', PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Settings page - verify fixes
  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/01-settings-fixed.png`, fullPage: true });

  // Upgrade page - verify "Pay once, own forever" badge
  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/02-upgrade-fixed.png`, fullPage: true });

  // Book detail
  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/03-bookdetail.png`, fullPage: true });
  }

  await browser.close();
  console.log('Done!');
})();
