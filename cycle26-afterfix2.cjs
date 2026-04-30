const { chromium } = require('playwright');
const { execSync } = require('child_process');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const screensDir = './screens/cycle26-afterfix2';
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

  // Upgrade page
  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${screensDir}/01-upgrade.png`, fullPage: true });

  // Book detail - check chapter contrast
  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/02-bookdetail.png`, fullPage: true });
  }

  // Settings page
  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/03-settings.png`, fullPage: true });

  // Dashboard
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/04-dashboard.png`, fullPage: true });

  console.log('Errors:', errors.length);
  errors.forEach(e => console.log('  ERR:', e.substring(0, 250)));

  await browser.close();
  console.log('Done!');
})();