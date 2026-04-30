const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens-fresh-ux-cycle/' + Date.now();
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
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // 1. Login
  console.log('\n=== LOGIN ===');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await screenshot(page, '01-login-page');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await screenshot(page, '02-dashboard');

  // 2. Dashboard exploration
  console.log('\n=== DASHBOARD ===');
  
  // Count books with memories
  const memoryLinks = await page.locator('a:has-text("memories"), a:has-text("memory")').all();
  console.log(`Found ${memoryLinks.length} memory links`);
  
  for (let i = 0; i < Math.min(memoryLinks.length, 3); i++) {
    const href = await memoryLinks[i].getAttribute('href');
    const text = await memoryLinks[i].textContent();
    console.log(`Link ${i}: ${text} -> ${href}`);
  }
  
  // Check books grid
  const bookCards = await page.locator('[class*="card"], article, [class*="book"]').all();
  console.log(`Found ${bookCards.length} card-like elements`);
  
  // 3. Book detail with memories
  console.log('\n=== BOOK DETAIL ===');
  const firstMemoryLink = await page.locator('a:has-text("memories")').first();
  if (await firstMemoryLink.isVisible()) {
    const href = await firstMemoryLink.getAttribute('href');
    await page.goto(BASE + href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot(page, '03-book-detail');
    
    // Check for memory cards
    const memories = await page.locator('[class*="memory"], [class*="card"]').all();
    console.log(`Found ${memories.length} memory/card elements`);
    
    // Look for photo display
    const photos = await page.locator('img[src*="photo"], img[src*="upload"], img[src*="asset"]').all();
    console.log(`Found ${photos.length} photos`);
  }
  
  // 4. Memory editor
  console.log('\n=== MEMORY EDITOR ===');
  const addMemoryBtn = await page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  if (await addMemoryBtn.isVisible()) {
    await addMemoryBtn.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '04-memory-editor');
    
    // Check the textarea
    const textarea = await page.locator('textarea, [contenteditable]').first();
    if (await textarea.isVisible()) {
      await textarea.fill('This is a test memory entry to check the editor interface and see how it handles real content input.');
      await page.waitForTimeout(500);
      await screenshot(page, '05-editor-with-text');
    }
    
    // Check photo/audio section
    const upgradeSection = await page.locator('[class*="upgrade"], [class*="premium"]').first();
    if (await upgradeSection.isVisible()) {
      console.log('Premium upsell section found');
    }
    
    // Check prompt section
    const promptDropdown = await page.locator('select, [role="combobox"]').first();
    if (await promptDropdown.isVisible()) {
      console.log('Prompt dropdown found');
    }
    
    // Check save button state
    const saveBtn = await page.locator('button:has-text("Save Memory"), button:has-text("Save")').first();
    if (await saveBtn.isVisible()) {
      const isDisabled = await saveBtn.isDisabled();
      console.log(`Save button disabled: ${isDisabled}`);
    }
  }
  
  // 5. Create a new book
  console.log('\n=== CREATE BOOK ===');
  await page.goto(BASE + '/dashboard', { waitUntil: 'networkidle' });
  const newBookBtn = await page.locator('button:has-text("New Book"), a:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, '06-new-book-modal');
    
    // Fill the form
    const titleInput = await page.locator('input[placeholder*="title" i], input[id*="title"]').first();
    if (await titleInput.isVisible()) {
      await titleInput.fill('Summer Vacation 2024');
    }
    
    const descInput = await page.locator('textarea[id*="description"], textarea[placeholder*="description" i]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('Memories from our family trip to the coast.');
    }
    
    await screenshot(page, '07-new-book-filled');
    
    // Submit
    const submitBtn = await page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Book")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await screenshot(page, '08-after-create-book');
    }
  }
  
  // 6. Settings page
  console.log('\n=== SETTINGS ===');
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
  await screenshot(page, '09-settings');
  
  // 7. Books library
  console.log('\n=== BOOKS LIBRARY ===');
  await page.goto(BASE + '/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await screenshot(page, '10-books-library');
  
  // 8. Check upgrade page
  console.log('\n=== UPGRADE ===');
  await page.goto(BASE + '/upgrade', { waitUntil: 'networkidle' });
  await screenshot(page, '11-upgrade');
  
  // Print errors
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length === 0) {
    console.log('No errors found!');
  } else {
    errors.forEach(e => console.log('ERROR:', e));
  }
  
  await browser.close();
  console.log('\n✅ Exploration complete. Screenshots in:', SCREENSHOT_DIR);
}

run().catch(console.error);