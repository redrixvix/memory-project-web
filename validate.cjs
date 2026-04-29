const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/validate-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

const fs = require('fs');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function screenshot(page, name) {
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('📸 Saved:', path);
  return path;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // Login
  console.log('\n=== LOGIN ===');
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('✓ Logged in');
  await screenshot(page, '01-after-login');

  // Dashboard
  console.log('\n=== DASHBOARD ===');
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '02-dashboard');

  // Check for book cards and links
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Book links on dashboard:', bookLinks.length);

  // Go to first book
  if (bookLinks.length > 0) {
    const href = await bookLinks[0].getAttribute('href');
    console.log('\n=== BOOK DETAIL ===');
    await page.goto(BASE + href);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '03-book-detail');

    // Scroll down to see if scroll-to-top button appears
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(1000);
    
    // Check if scroll-to-top button is visible (should be on bottom-RIGHT now)
    const scrollBtn = page.locator('button[aria-label="Scroll to top"]');
    if (await scrollBtn.isVisible()) {
      console.log('✓ Scroll-to-top button visible on bottom-right');
      await screenshot(page, '04-scroll-button-visible');
      await scrollBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, '05-after-scroll-top');
    }
  }

  // Settings page
  console.log('\n=== SETTINGS PAGE ===');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '06-settings');

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Validation complete!');
  return { errors, screenshotDir: SCREENSHOT_DIR };
}

run()
  .then(r => {
    console.log('\nSummary:');
    console.log('- Screenshots:', r.screenshotDir);
    console.log('- Errors:', r.errors.length);
    process.exit(0);
  })
  .catch(e => {
    console.error('FATAL:', e);
    process.exit(1);
  });
