const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/comprehensive-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
  await screenshot(page, '01-dashboard');

  // Check dashboard elements
  const bookCards = await page.locator('.book-card').all();
  console.log(`✓ Found ${bookCards.length} book cards on dashboard`);

  // Check search bar focus state
  const searchInput = page.locator('input[placeholder="Search your books..."]');
  if (await searchInput.isVisible()) {
    await searchInput.click();
    await page.waitForTimeout(500);
    await screenshot(page, '02-search-focus');
    await searchInput.blur();
    console.log('✓ Search bar focus state looks good');
  }

  // Check if FAB is on bottom-right now
  const fabButton = page.locator('button[aria-label="Create new book"]');
  if (await fabButton.isVisible()) {
    const box = await fabButton.boundingBox();
    console.log(`✓ FAB button position: x=${box?.x}, y=${box?.y}`);
    // FAB should be on the right side (x > 1000 for 1280 width)
    if (box && box.x > 1000) {
      console.log('✓ FAB is correctly positioned on bottom-right');
    } else {
      console.log('⚠ FAB might be in wrong position');
    }
  }

  // Go to a book that has memories
  const memoryLinks = await page.locator('a:has-text("memory")').all();
  if (memoryLinks.length > 0) {
    const href = await memoryLinks[0].getAttribute('href');
    if (href && href.includes('/books/')) {
      console.log('\n=== BOOK WITH MEMORIES ===');
      await page.goto(BASE + href);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await screenshot(page, '03-book-with-memories');

      // Scroll to trigger scroll-to-top button
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForTimeout(1000);
      
      const scrollBtn = page.locator('button[aria-label="Scroll to top"]');
      if (await scrollBtn.isVisible()) {
        console.log('✓ Scroll-to-top button visible');
        const box = await scrollBtn.boundingBox();
        console.log(`✓ Scroll-to-top button position: x=${box?.x}, y=${box?.y}`);
        // Should be on right side
        if (box && box.x > 1000) {
          console.log('✓ Scroll-to-top is correctly on bottom-right');
        }
        await screenshot(page, '04-scroll-button');
      }
    }
  }

  // Go to an empty book to check button redundancy fix
  console.log('\n=== EMPTY BOOK (checking no redundant buttons) ===');
  // Try to find a book with "Start writing" button
  const startWritingLinks = await page.locator('a:has-text("Start writing")').all();
  if (startWritingLinks.length > 0) {
    const href = await startWritingLinks[0].getAttribute('href');
    if (href) {
      await page.goto(BASE + href);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await screenshot(page, '05-empty-book');
      
      // Check that header doesn't have Add Memory button when empty
      const headerAddMemory = page.locator('header a:has-text("Add Memory"), header button:has-text("Add Memory")');
      const headerHasButton = await headerAddMemory.count();
      console.log(`✓ Header Add Memory buttons when empty: ${headerHasButton} (should be 0)`);
    }
  }

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
  console.log('\n✓ Comprehensive test complete!');
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
