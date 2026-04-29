const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/check-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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

  // Go to the book that now has 1 memory
  console.log('\n=== CHECK BOOK WITH MEMORY ===');
  await page.goto(BASE + '/books/229');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '01-book-229-with-memory');

  // Look at the header area
  const headerButtons = await page.locator('header button, header a').all();
  console.log(`Header buttons/links: ${headerButtons.length}`);
  for (const btn of headerButtons) {
    const text = await btn.textContent();
    const tag = await btn.evaluate(el => el.tagName);
    console.log(`  - [${tag}]: "${text?.trim()}"`);
  }

  // Check for Add Memory button in header
  const addMemoryBtn = page.locator('header a:has-text("Add Memory")');
  const hasAddMemory = await addMemoryBtn.count();
  console.log(`\nAdd Memory button in header: ${hasAddMemory}`);

  // Check memory card actions
  const editBtns = await page.locator('button:has-text("Edit"), a:has-text("Edit")').all();
  console.log(`Edit buttons found: ${editBtns.length}`);

  // Go to add memory via the hero section button
  const heroAddBtn = page.locator('a:has-text("Add another memory")').first();
  if (await heroAddBtn.isVisible()) {
    console.log('✓ Found "Add another memory" button in hero');
    await heroAddBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '02-editor-from-hero');
    console.log('URL:', page.url());
  } else {
    console.log('✗ No "Add another memory" button in hero');
    // Look for any Add Memory button
    const anyAddBtn = page.locator('a:has-text("Add memory"), a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await anyAddBtn.isVisible()) {
      console.log('✓ Found add button:', await anyAddBtn.textContent());
    }
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Check complete!');
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