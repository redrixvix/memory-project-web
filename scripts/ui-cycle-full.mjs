import { chromium } from '@playwright/test';

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

// Click "New Book" button
console.log('📖 Clicking New Book...');
await page.click('button:has-text("New Book")');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/after-new-book-click.png', fullPage: true });
console.log('URL:', page.url());

// Check if a modal appeared
const body = await page.locator('body').textContent();
const hasForm = body?.includes('Title') || body?.includes('title') || body?.includes('Date');
console.log('Has form fields:', hasForm);

// Look for dialog/modal
const dialog = page.locator('[role="dialog"], .fixed, .absolute, .modal, .overlay').first();
if (await dialog.count() > 0) {
  console.log('Modal/dialog found');
  await dialog.screenshot({ path: 'playwright/screens-ui-cycle/modal-detected.png' });
}

// Check if URL changed or modal appeared
const url = page.url();
if (!url.includes('new')) {
  // Modal might have appeared without URL change
  // Look for form inputs in the current page
  const inputs = await page.locator('input').all();
  console.log('Inputs on page:', inputs.length);
  for (const inp of inputs) {
    const type = await inp.getAttribute('type');
    const placeholder = await inp.getAttribute('placeholder');
    console.log('Input:', { type, placeholder });
  }
}

// Now let's navigate to the settings page to see its structure
console.log('⚙️ Checking settings page...');
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-page.png', fullPage: true });

// Now let's go to the upgrade page
console.log('💎 Checking upgrade page...');
await page.goto(BASE + '/upgrade');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/upgrade-page.png', fullPage: true });

// Check the FAQ page
console.log('❓ Checking FAQ page...');
await page.goto(BASE + '/faq');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/faq-page.png', fullPage: true });

// Now find an existing book and add a memory with photo
console.log('📝 Adding memory with photo to existing book...');

// Go to book 174 which had an empty state earlier
await page.goto(BASE + '/books/174');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Click Add Memory
const addBtn = page.locator('a[href*="/edit"]').filter({ hasText: /memory/i }).first();
console.log('Add Memory button count:', await addBtn.count());
if (await addBtn.count() > 0) {
  await addBtn.click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  console.log('On edit page:', page.url());
  await page.screenshot({ path: 'playwright/screens-ui-cycle/book-edit-page.png', fullPage: true });

  // Fill memory text
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.fill('Saturday morning at the market — the smell of fresh basil and the sound of the accordion player three stalls down. We bought a wheel of aged cheddar and a loaf of sourdough still warm from the oven.');
    console.log('Memory text filled');
    await page.waitForTimeout(1000);

    // Try to attach photo via file input
    const fileInput = page.locator('input[type="file"]').first();
    console.log('File input count:', await fileInput.count());
    
    if (await fileInput.count() > 0) {
      try {
        await fileInput.setInputFiles('test-photo.png');
        console.log('Photo attached');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'playwright/screens-ui-cycle/after-photo-attach.png', fullPage: true });
      } catch (e) {
        console.log('Photo attach error:', e.message);
      }
    }

    // Save
    const saveBtn = page.locator('button:has-text("Save Memory")').first();
    console.log('Save button count:', await saveBtn.count());
    await saveBtn.click();
    await page.waitForTimeout(8000);
    console.log('After save URL:', page.url());
    await page.screenshot({ path: 'playwright/screens-ui-cycle/after-memory-save.png', fullPage: true });
  }
} else {
  console.log('No Add Memory button found');
}

await browser.close();
console.log('Done');