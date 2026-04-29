const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/real-flow-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
  await screenshot(page, '01-logged-in');

  // Navigate to an empty book to create a memory
  console.log('\n=== CREATE MEMORY FLOW ===');
  
  // First find an empty book from dashboard
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const startWritingLink = page.locator('a:has-text("Start writing")').first();
  if (await startWritingLink.isVisible()) {
    const href = await startWritingLink.getAttribute('href');
    console.log('Going to empty book:', href);
    await page.goto(BASE + href);
  } else {
    console.log('No empty books found, going to create a new book');
    await page.goto(BASE + '/books/new');
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '02-book-page');

  // Click "Add your first memory" if on empty book
  const addFirstBtn = page.locator('a:has-text("Add your first memory")').first();
  if (await addFirstBtn.isVisible()) {
    console.log('✓ Clicking "Add your first memory"');
    await addFirstBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await screenshot(page, '03-memory-editor');
    
    console.log('URL:', page.url());
    
    // Type memory content
    console.log('\n=== FILL IN MEMORY CONTENT ===');
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      console.log('✓ Found textarea, typing content...');
      await textarea.fill('This is a test memory created by the UI cycle. It contains some content to test the writing experience and verify that memories are properly saved and displayed in the book.');
      await page.waitForTimeout(500);
      await screenshot(page, '04-filled-content');
    }
    
    // Check for save/publish button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Publish")').first();
    if (await submitBtn.isVisible()) {
      const btnText = await submitBtn.textContent();
      console.log('✓ Submit button found:', btnText);
      await screenshot(page, '05-before-submit');
    }
    
    // Check for photo upload button
    const photoBtn = page.locator('button:has-text("Add photo"), input[type="file"]').first();
    if (await photoBtn.isVisible()) {
      console.log('✓ Photo upload available');
    }
    
    // Check for audio/voice button
    const audioBtn = page.locator('button:has-text("Voice"), button:has-text("Audio"), button:has-text("Record")').first();
    if (await audioBtn.isVisible()) {
      console.log('✓ Audio recording available');
    }
    
    // Now save the memory
    console.log('\n=== SAVING MEMORY ===');
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.isVisible()) {
      const isDisabled = await saveBtn.isDisabled();
      console.log('Save button disabled?', isDisabled);
      
      if (!isDisabled) {
        await saveBtn.click();
        console.log('✓ Clicked save button');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        await screenshot(page, '07-after-save');
        console.log('URL after save:', page.url());
      }
    }
  }

  // Check if we got redirected back to book
  if (page.url().includes('/books/') && !page.url().includes('/edit')) {
    console.log('\n✓ Returned to book page after save');
    await screenshot(page, '08-book-after-save');
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Real flow complete!');
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