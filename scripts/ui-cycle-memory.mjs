import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
console.log('🔐 Logging in...');
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// Dashboard
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/dashboard.png', fullPage: true });
console.log('📸 Dashboard');

// Click New Book button to see the modal
console.log('📖 Clicking New Book...');
await page.click('button:has-text("New Book")');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/modal-new-book.png', fullPage: true });
console.log('URL:', page.url());

// Check if modal appeared with form
const modalTitle = await page.locator('h2, h1, [role="dialog"] h2, [role="dialog"] h1').first().textContent().catch(() => '');
console.log('Modal title:', modalTitle);

// Check for input fields in dialog
const dialogInputs = await page.locator('[role="dialog"] input, [role="dialog"] textarea').all();
console.log('Dialog inputs:', dialogInputs.length);

// Now go to book edit page and add a memory
console.log('📝 Editing memory on book 174...');
await page.goto(BASE + '/books/174/edit');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/edit-174.png', fullPage: true });

// Fill memory
const textarea = page.locator('textarea').first();
if (await textarea.count() > 0) {
  await textarea.fill('Saturday morning at the market — the smell of fresh basil and the sound of the accordion player three stalls down. We bought a wheel of aged cheddar and a loaf of sourdough still warm from the oven.');
  console.log('Memory text filled');
  await page.waitForTimeout(1000);

  // Check file inputs
  const fileInputInfo = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="file"]');
    return Array.from(inputs).map(inp => ({
      id: inp.id,
      name: inp.name,
      className: inp.className,
      parentTagName: inp.parentElement.tagName,
      parentClass: inp.parentElement.className,
      hidden: inp.hidden,
      tabIndex: inp.tabIndex
    }));
  });
  console.log('File inputs:', JSON.stringify(fileInputInfo, null, 2));
  
  // Try using DataTransfer approach with setInputFiles
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count() > 0) {
    const isHidden = await fileInput.evaluate(el => el.hidden);
    console.log('File input hidden:', isHidden);
    
    if (isHidden) {
      // Find the parent label and use setInputFiles on it
      const labelWithInput = page.locator('label:has(input[type="file"])').first();
      if (await labelWithInput.count() > 0) {
        console.log('Found label wrapping file input');
      }
    }
    
    // Try to attach file directly
    try {
      await fileInput.setInputFiles('test-photo.png');
      console.log('Photo attached via setInputFiles');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright/screens-ui-cycle/photo-attached.png', fullPage: true });
    } catch (e) {
      console.log('setInputFiles failed:', e.message.split('\n')[0]);
    }
  }
  
  await page.screenshot({ path: 'playwright/screens-ui-cycle/edit-174-text-filled.png', fullPage: true });

  // Save memory
  console.log('Saving memory...');
  const saveBtn = page.locator('button:has-text("Save Memory")').first();
  await saveBtn.click();
  await page.waitForTimeout(8000);
  console.log('After save URL:', page.url());
  await page.screenshot({ path: 'playwright/screens-ui-cycle/after-save-174.png', fullPage: true });
  console.log('📸 After save');
  
  // Check if memory text is visible
  const memoryText = await page.locator('text=Saturday morning').count();
  console.log('Memory text visible:', memoryText);
} else {
  console.log('No textarea found');
}

await browser.close();
console.log('Done');