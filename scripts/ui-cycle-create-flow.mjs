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

// Create a new book via the modal
console.log('📖 Opening New Book modal...');
await page.click('button:has-text("New Book")');
await page.waitForTimeout(2000);

// Fill the modal
await page.fill('input[placeholder*="Ruth"]', 'The Weekend at Hawk Mountain');
await page.fill('textarea[placeholder*="collection"]', 'A weekend escape with old college friends — fireside conversations, morning hikes, and the kind of laughter that only happens when you are with people who knew you before the world got complicated.');
console.log('Book title filled');

await page.waitForTimeout(500);
await page.screenshot({ path: 'playwright/screens-ui-cycle/modal-new-book-filled.png', fullPage: true });

// Submit
await page.click('button:has-text("Create Book"), button:has-text("+ Create Book")');
await page.waitForTimeout(6000);
console.log('After create URL:', page.url());

await page.screenshot({ path: 'playwright/screens-ui-cycle/after-book-create.png', fullPage: true });
console.log('📸 After book create');

// Now go to that book's edit page and create a memory with photo
const bookIdMatch = page.url().match(/\/books\/(\d+)/);
if (bookIdMatch) {
  const newBookId = bookIdMatch[1];
  console.log('New book ID:', newBookId);
  
  await page.goto(BASE + '/books/' + newBookId + '/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'playwright/screens-ui-cycle/new-book-edit.png', fullPage: true });
  
  // Fill memory
  const textarea = page.locator('textarea').first();
  await textarea.fill('Friday evening, we arrived just as the sun was setting behind the ridgeline. The cabin was smaller than we remembered, but the stone fireplace made it feel like home. We hauled our bags up the porch steps while the evening insects started their chorus. Mike made his famous chili. Sarah brought a bottle of wine that had been waiting for exactly this occasion.');
  console.log('Memory text filled');
  await page.waitForTimeout(1000);
  
  // Look for the photo upload area
  const photoSectionVisible = await page.locator('text=Photos & audio, text=Photos &').first().isVisible().catch(() => false);
  console.log('Photo section visible:', photoSectionVisible);
  
  // Check for the upsell box
  const upsellBox = page.locator('text=Upgrade your plan').first();
  const hasUpsell = await upsellBox.isVisible().catch(() => false);
  console.log('Has upsell box:', hasUpsell);
  
  // Try to find the file input outside of upsell
  const allFileInputs = await page.locator('input[type="file"]').all();
  console.log('Total file inputs on page:', allFileInputs.length);
  
  // Check if the photo upload is inside the upsell or separate
  const fileInputInUpsell = await page.evaluate(() => {
    const upsell = document.querySelector('text=Upgrade your plan');
    if (!upsell) return 'no upsell found';
    const parent = upsell.closest('[class*="relative"], .relative');
    if (!parent) return 'no parent found';
    const fileInputs = parent.querySelectorAll('input[type="file"]');
    return fileInputs.length;
  });
  console.log('File inputs inside upsell area:', fileInputInUpsell);
  
  // Try clicking on the upsell area to see if there's a hidden file input trigger
  if (hasUpsell) {
    const upsellBtn = page.locator('text=See plans').first();
    if (await upsellBtn.count() > 0) {
      console.log('Upsell "See plans" button found - this is a premium feature');
    }
  }
  
  await page.screenshot({ path: 'playwright/screens-ui-cycle/new-book-edit-filled.png', fullPage: true });
  
  // Save memory
  await page.click('button:has-text("Save Memory")');
  await page.waitForTimeout(8000);
  console.log('After save URL:', page.url());
  await page.screenshot({ path: 'playwright/screens-ui-cycle/new-book-after-save.png', fullPage: true });
  console.log('📸 New book after first memory');
  
  // Verify memory text is there
  const memoryText = await page.locator('text=Friday evening').count();
  console.log('Memory visible:', memoryText);
} else {
  console.log('Not on a book page, URL:', page.url());
}

// Now check the memory editor's photo upload UI more carefully
console.log('\n--- Investigating photo upload UI ---');
await page.goto(BASE + '/books/176/edit');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

// Get full structure of the page around "Photos & audio" section
const photoSectionHTML = await page.evaluate(() => {
  const headings = Array.from(document.querySelectorAll('*')).filter(el => el.textContent?.trim() === 'Photos & audio');
  if (headings.length === 0) return 'No "Photos & audio" section found';
  const section = headings[0].closest('div[class*="relative"], section, div');
  return section ? section.outerHTML.slice(0, 3000) : 'No parent section';
});
console.log('Photo section HTML:', photoSectionHTML);

await browser.close();
console.log('Done');