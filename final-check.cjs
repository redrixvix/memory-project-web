const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/final-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
  await screenshot(page, '01-dashboard');

  // Check dashboard key elements
  const bookCards = await page.locator('a[href*="/books/"]').all();
  console.log(`✓ Dashboard has ${bookCards.length} book cards`);

  // Check FAB position
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  const fab = page.locator('button[aria-label="Create new book"]');
  if (await fab.isVisible()) {
    const box = await fab.boundingBox();
    console.log(`✓ FAB position: x=${box?.x.toFixed(0)}, y=${box?.y.toFixed(0)}`);
  }

  // Go to a book with memory to verify Add Memory button in header
  console.log('\n=== BOOK WITH MEMORY ===');
  await page.goto(BASE + '/books/229');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '02-book-with-memory');

  const headerBtns = await page.locator('header a, header button').all();
  console.log('Header elements:');
  for (const btn of headerBtns) {
    const text = await btn.textContent();
    const cls = await btn.getAttribute('class');
    console.log(`  - "${text?.trim()}" (${cls?.includes('hidden') ? 'conditional' : 'visible'})`);
  }

  // Check search bar focus on dashboard
  console.log('\n=== SEARCH BAR FOCUS ===');
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  const searchInput = page.locator('input[placeholder*="Search"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await page.waitForTimeout(500);
    await screenshot(page, '03-search-focused');
    await searchInput.blur();
  }

  // Check settings page
  console.log('\n=== SETTINGS PAGE ===');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '04-settings');

  // Final error check
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Final check complete!');
  return { errors, screenshotDir: SCREENSHOT_DIR };
}

run()
  .then(r => {
    console.log('\n=== SUMMARY ===');
    console.log('Screenshots:', r.screenshotDir);
    console.log('Errors:', r.errors.length);
    process.exit(0);
  })
  .catch(e => {
    console.error('FATAL:', e);
    process.exit(1);
  });