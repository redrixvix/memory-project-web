const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/cycle-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

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
  await screenshot(page, '01-dashboard-top');
  
  // Scroll to trigger FAB
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(1000);
  await screenshot(page, '02-dashboard-scrolled');
  
  // Check FAB position
  const fabButton = page.locator('button[aria-label="Create new book"]');
  if (await fabButton.isVisible()) {
    const box = await fabButton.boundingBox();
    console.log(`FAB position: x=${box?.x}, y=${box?.y}, w=${box?.width}, h=${box?.height}`);
    console.log(`Screen width = 1280, FAB x center = ${box ? box.x + box.width/2 : 'N/A'}`);
    if (box && box.x > 640) {
      console.log('✓ FAB correctly on RIGHT side');
    } else {
      console.log('⚠ FAB on LEFT side - needs fix');
    }
  } else {
    console.log('⚠ FAB not visible after scroll');
  }

  // Create a real memory in an empty book
  console.log('\n=== CREATING REAL MEMORY ===');
  
  // Find an empty book (with "Start writing" button)
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Look for "Start writing" link
  const startWritingLink = page.locator('a:has-text("Start writing")').first();
  if (await startWritingLink.isVisible()) {
    const href = await startWritingLink.getAttribute('href');
    console.log('Going to empty book:', href);
    await page.goto(BASE + href);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '03-empty-book');
    
    // Click "Add your first memory" button
    const addFirstBtn = page.locator('a:has-text("Add your first memory")').first();
    if (await addFirstBtn.isVisible()) {
      console.log('✓ Found "Add your first memory" button');
      await addFirstBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(3000);
      await screenshot(page, '04-memory-editor');
      
      // Check URL
      console.log('Current URL:', page.url());
      
      // Fill in memory content if on edit page
      if (page.url().includes('/edit')) {
        console.log('On memory editor page');
        
        // Try to find title input
        const titleInput = page.locator('input[placeholder*="title" i], input[id*="title" i], h1:has-text("New memory")').first();
        if (await titleInput.isVisible()) {
          console.log('✓ Title input visible');
        }
        
        // Try to find textarea
        const textareas = await page.locator('textarea').count();
        console.log(`Found ${textareas} textareas`);
        
        // Look for content area
        const contentArea = page.locator('[contenteditable="true"], textarea').first();
        if (await contentArea.isVisible()) {
          console.log('✓ Content area found');
          await screenshot(page, '05-editor-content');
        }
        
        // Check for save/publish buttons
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish"), button:has-text("Add Memory")').first();
        if (await saveBtn.isVisible()) {
          console.log('✓ Save/Publish button visible');
          await screenshot(page, '06-editor-actions');
        }
      }
    }
  } else {
    console.log('No "Start writing" link found');
  }

  // Check book creation flow
  console.log('\n=== BOOK CREATION ===');
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Scroll to top and click New Book
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  
  const newBookBtn = page.locator('a:has-text("New Book"), button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await screenshot(page, '07-new-book-modal');
  }

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Usage cycle complete!');
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