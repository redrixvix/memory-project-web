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
console.log('📖 Creating new book via modal...');
await page.click('button:has-text("New Book")');
await page.waitForTimeout(2000);
await page.fill('input[placeholder*="Ruth"]', 'Coastal Retreat - Fall 2024');
await page.fill('textarea[placeholder*="collection"]', 'Three days by the ocean with my sister — long walks on the beach, fresh seafood, and deep conversations about the future.');
await page.waitForTimeout(500);

// Submit
await page.click('button:has-text("+ Create Book")');
await page.waitForTimeout(6000);
console.log('New book URL:', page.url());

// Now create a memory on book 178
const bookUrl = page.url();
const bookIdMatch = bookUrl.match(/\/books\/(\d+)/);
if (bookIdMatch) {
  const bookId = bookIdMatch[1];
  
  // Go to edit page
  await page.goto(BASE + '/books/' + bookId + '/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Fill memory
  await page.locator('textarea').first().fill('The sound of the waves was constant — a rhythm we fell into without trying. We collected shells along the tide line, comparing our finds like children. Mine was a perfect spiral, pale pink and ivory, worn smooth by years of tumbling in the surf.');
  console.log('Memory text filled');
  await page.waitForTimeout(1000);
  
  // Check for any visible photo upload button (not in upsell)
  const photoButtons = await page.locator('button:has-text("photo"), button:has-text("Photo"), label:has-text("Photo")').all();
  console.log('Photo buttons found:', photoButtons.length);
  
  // Try clicking Add photos text
  const addPhotosLabel = page.locator('text=Add photos').first();
  if (await addPhotosLabel.count() > 0) {
    console.log('"Add photos" label found');
    const parent = await addPhotosLabel.locator('..').first();
    const inputs = await parent.locator('input[type="file"]').count();
    console.log('Inputs in parent:', inputs);
  }
  
  // Save memory
  await page.click('button:has-text("Save Memory")');
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'playwright/screens-ui-cycle/coastal-after-save.png', fullPage: true });
  console.log('📸 Coastal book after save');
  
  // Verify memory
  const memoryVisible = await page.locator('text=waves was constant').count();
  console.log('Memory visible:', memoryVisible);
}

// Now let's check the dashboard's new book card
console.log('\n--- Checking dashboard with new books ---');
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/dashboard-with-new-books.png', fullPage: true });
console.log('📸 Dashboard with new books');

// Look at the dashboard more carefully - the left accent bar on cards
console.log('Looking at book cards on dashboard...');
const cardAccentBars = await page.evaluate(() => {
  const cards = document.querySelectorAll('[class*="border-l"]');
  return cards.length;
});
console.log('Cards with border-l:', cardAccentBars);

// Check if books show memory count
const bookCards = await page.locator('[class*="group"]').all();
console.log('Group elements (book cards):', bookCards.length);

// Now look at the settings page to check avatar and name handling
console.log('\n--- Settings page ---');
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-page.png', fullPage: true });
console.log('📸 Settings page');

// Now let's analyze what we've found and make UI improvements

// IMPROVEMENT 1: The photo upload is hidden for free users - this is a UX issue
// Let's find where this gating happens in the code and see if we can make the upsell feel warmer

// IMPROVEMENT 2: Dashboard cards could show more info - let's check if they have hover effects

// IMPROVEMENT 3: Check the book detail page with 2 memories to see the card hover effect

await page.goto(BASE + '/books/176');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/book-176-with-memories.png', fullPage: true });
console.log('📸 Book 176 with multiple memories');

// Check if there are 2 memories
const memoryCount = await page.locator('[class*="group/card"]').count();
console.log('Memory cards:', memoryCount);

await browser.close();
console.log('Done');