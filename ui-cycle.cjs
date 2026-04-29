const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/ui-cycle-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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

  // Books page
  console.log('\n=== BOOKS PAGE ===');
  await page.goto(BASE + '/books');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '03-books-page');

  // Settings page
  console.log('\n=== SETTINGS PAGE ===');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '04-settings');

  // Try creating a new book
  console.log('\n=== CREATE NEW BOOK ===');
  await page.goto(BASE + '/books/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '05-new-book-form');

  // Fill in book form
  const titleInput = page.locator('input[name="title"], input[placeholder*="title" i], input[id*="title"]').first();
  if (await titleInput.isVisible()) {
    await titleInput.fill('My Test Memory Book - ' + new Date().toISOString().slice(0, 10));
    console.log('✓ Filled book title');
    await screenshot(page, '06-new-book-filled');
  }

  // Look for submit button
  const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
  if (await submitBtn.isVisible()) {
    await submitBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    console.log('✓ Submitted book form');
    await screenshot(page, '07-book-created');
    console.log('Current URL:', page.url());
  }

  // Go to the new book page if we have one
  const newBookLinks = await page.locator('a[href*="/books/"]').all();
  if (newBookLinks.length > 0) {
    const href = await newBookLinks[0].getAttribute('href');
    console.log('\n=== BOOK DETAIL ===');
    await page.goto(BASE + href);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '08-book-detail');

    // Try creating a memory in this book
    console.log('\n=== CREATE MEMORY ===');
    const newMemoryBtn = page.locator('a:has-text("New Memory"), a:has-text("Write"), button:has-text("Add Memory"), a[href*="new-memory"]').first();
    if (await newMemoryBtn.isVisible()) {
      await newMemoryBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await screenshot(page, '09-memory-form');
      
      // Fill memory form
      const contentArea = page.locator('textarea[name="content"], textarea[id*="content"], [placeholder*="memory" i], [placeholder*="story" i]').first();
      if (await contentArea.isVisible()) {
        await contentArea.fill('This is a test memory created during the UI cycle test. The sun was shining, the birds were singing, and we had the most wonderful day together as a family.');
        console.log('✓ Filled memory content');
        await screenshot(page, '10-memory-filled');
      }

      // Submit memory
      const saveBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
      if (await saveBtn.isVisible()) {
        await saveBtn.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        console.log('✓ Saved memory');
        await screenshot(page, '11-memory-saved');
      }
    } else {
      console.log('New memory button not found, trying direct URL...');
      // Try direct URL if book ID known
      const urlParts = href.split('/');
      const bookId = urlParts[urlParts.length - 1];
      if (bookId && !isNaN(bookId)) {
        await page.goto(BASE + `/memories/new?book_id=${bookId}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        await screenshot(page, '09-memory-form-direct');
      }
    }
  }

  // Final dashboard check
  console.log('\n=== FINAL DASHBOARD ===');
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '12-final-dashboard');

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ UI Cycle complete!');
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
