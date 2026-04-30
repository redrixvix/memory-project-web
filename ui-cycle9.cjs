const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle9';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 1000) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🚀 Starting UI cycle 9 - Premium improvement pass...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-login-page');
  
  // Check login form elements
  const emailInput = page.locator('#email, input[type="email"]').first();
  const passwordInput = page.locator('#password, input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();
  
  if (await emailInput.isVisible()) {
    await emailInput.fill(EMAIL);
    await passwordInput.fill(PASSWORD);
    await submitBtn.click();
    await page.waitForTimeout(5000);
    await screenshot(page, '02-post-login');
    console.log('  Logged in, URL:', page.url());
  }

  // DASHBOARD
  console.log('\n2️⃣ DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '03-dashboard');
  
  // Check for FAB/create buttons
  const allButtons = await page.locator('button').all();
  console.log('  Total buttons on dashboard:', allButtons.length);
  for (const btn of allButtons.slice(0, 8)) {
    const txt = await btn.textContent().catch(() => '');
    if (txt.trim()) console.log('    Button:', txt.trim().slice(0, 50));
  }

  // MEMORY CREATION FLOW
  console.log('\n3️⃣ CREATE MEMORY');
  // Try to find "New Memory" or FAB
  const fabBtn = page.locator('button').filter({ hasText: /new memory|write|create memory/i }).first();
  if (await fabBtn.isVisible().catch(() => false)) {
    await fabBtn.click();
    await waitNet(page, 1000);
  } else {
    // Try going directly to new memory page
    await page.goto(`${BASE_URL}/memories/new`, { waitUntil: 'networkidle' }).catch(() => {});
    await waitNet(page, 500);
  }
  await screenshot(page, '04-create-memory');
  console.log('  URL after nav:', page.url());

  // Look for title input
  const titleInput = page.locator('#title, input[id*="title"], input[placeholder*="title" i]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.fill('Sunday Afternoons at Grandma\'s House');
    console.log('  Title filled');
  }

  // Find content textarea
  const contentArea = page.locator('textarea, [ contenteditable="true"]').first();
  if (await contentArea.isVisible().catch(() => false)) {
    await contentArea.fill('Every Sunday after church, we gathered at Grandma\'s house. The smell of her homemade cinnamon rolls would drift through the screen door, mixing with the coffee brewing in her old percolator. We kids would play in the backyard while the adults talked around her worn oak table. Those afternoons felt endless in the best way — no rush, no schedules, just family.');
    await screenshot(page, '05-memory-content-filled');
    console.log('  Content filled');
  }

  // Scroll down to see all form elements
  await page.evaluate(() => window.scrollBy(0, 300));
  await waitNet(page, 300);
  await screenshot(page, '06-form-scrolled');
  
  // Look for photo upload
  const photoUpload = page.locator('input[type="file"]').first();
  if (await photoUpload.isVisible().catch(() => false)) {
    console.log('  Photo upload present');
    await screenshot(page, '07-photo-upload-visible');
  }

  // Look for audio upload
  const audioUpload = page.locator('input[type="file"][accept*="audio"], input[type="file"][accept*="mp3"]').first();
  if (await audioUpload.isVisible().catch(() => false)) {
    console.log('  Audio upload present');
    await screenshot(page, '08-audio-upload-visible');
  }

  // Find save/publish button
  const saveBtn = page.locator('button').filter({ hasText: /save|publish|create/i }).last();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await waitNet(page, 5000);
    await screenshot(page, '09-after-save');
    console.log('  After save URL:', page.url());
  }

  // NAVIGATE TO LIBRARY
  console.log('\n4️⃣ LIBRARY PAGE');
  await page.goto(`${BASE_URL}/library`, { waitUntil: 'networkidle' }).catch(() => {});
  await waitNet(page, 1000);
  await screenshot(page, '10-library');
  console.log('  Library URL:', page.url());

  // NAVIGATE TO BOOKS
  console.log('\n5️⃣ BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '11-books-page');
  
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('  Books found:', bookLinks.length);

  // CREATE A BOOK
  console.log('\n6️⃣ CREATE BOOK');
  const newBookBtn = page.locator('a, button').filter({ hasText: /new book|create book/i }).first();
  if (await newBookBtn.isVisible().catch(() => false)) {
    await newBookBtn.click();
    await waitNet(page, 1500);
    await screenshot(page, '12-new-book-page');
    
    // Fill book title
    const bookTitleInput = page.locator('#title, input[id*="title"]').first();
    if (await bookTitleInput.isVisible().catch(() => false)) {
      await bookTitleInput.fill('Family Stories Collection');
    }
    
    // Fill description
    const descArea = page.locator('textarea').first();
    if (await descArea.isVisible().catch(() => false)) {
      await descArea.fill('A collection of our family\'s favorite memories and stories passed down through generations.');
    }
    
    await page.evaluate(() => window.scrollBy(0, 300));
    await waitNet(page, 300);
    await screenshot(page, '13-book-form-filled');
    
    // Submit
    const createBtn = page.locator('button[type="submit"]').first();
    if (await createBtn.isVisible().catch(() => false)) {
      await createBtn.click();
      await waitNet(page, 4000);
      await screenshot(page, '14-book-created');
      console.log('  After create URL:', page.url());
    }
  } else {
    await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' }).catch(() => {});
    await waitNet(page, 1000);
    await screenshot(page, '12-new-book-page-direct');
  }

  // NAVIGATE TO A BOOK
  console.log('\n7️⃣ BOOK DETAIL');
  const firstBook = page.locator('a[href*="/books/"]').first();
  if (await firstBook.isVisible().catch(() => false)) {
    await firstBook.click();
    await waitNet(page, 2000);
    await screenshot(page, '15-book-detail');
    console.log('  Book URL:', page.url());
    
    // Look for memories section
    const memorySection = await page.locator('[class*="memory"], [class*="chapter"]').count();
    console.log('  Memory/chapter elements:', memorySection);
    
    // Scroll through book detail
    await page.evaluate(() => window.scrollBy(0, 400));
    await waitNet(page, 500);
    await screenshot(page, '16-book-scrolled');
  }

  // SETTINGS PAGE
  console.log('\n8️⃣ SETTINGS PAGE');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '17-settings');
  
  const settingsSections = await page.locator('h1, h2').all();
  for (const s of settingsSections.slice(0, 5)) {
    const txt = await s.textContent().catch(() => '');
    if (txt.trim()) console.log('  Section:', txt.trim());
  }

  // FINAL DASHBOARD
  console.log('\n9️⃣ FINAL DASHBOARD CHECK');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '18-dashboard-final');
  
  // Check for empty states vs populated states
  const emptyState = await page.locator('text=/empty|no.*found|no memories/i').isVisible().catch(() => false);
  const memoryCount = await page.locator('[class*="card"], a[href*="memory"]').count();
  console.log('  Empty state visible:', emptyState);
  console.log('  Memory/card elements:', memoryCount);

  await browser.close();
  console.log('\n✅ Cycle 9 exploration complete');
  console.log('Screenshots:', SCREEN_DIR);
}

run().catch(e => { 
  console.error('❌ Error:', e.message); 
  console.error(e.stack);
  process.exit(1); 
});