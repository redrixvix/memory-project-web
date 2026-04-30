const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-cycle11';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name, opts = {}) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: opts.fullPage || false, ...opts });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 800) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🚀 MemoryProject UI Cycle 11 — Premium Flow Audit\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  const errors = [];
  const issues = [];

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, '01-logged-in');
  
  const dashUrl = page.url();
  console.log('   Dashboard URL:', dashUrl);
  console.log('   ✅ Logged in');

  // DASHBOARD
  console.log('\n2️⃣ DASHBOARD AUDIT');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '02-dashboard');

  // Collect book links
  const bookLinks = [];
  const allLinks = await page.locator('a[href*="/books/"]').all();
  for (const link of allLinks) {
    const href = await link.getAttribute('href').catch(() => null);
    if (href && !href.includes('/edit') && !href.includes('/new')) {
      bookLinks.push(href);
    }
  }
  const uniqueBooks = [...new Set(bookLinks)];
  console.log('   Books found:', uniqueBooks.length);

  // BOOKS LIBRARY
  console.log('\n3️⃣ /books LIBRARY');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '03-books-library');

  // SETTINGS
  console.log('\n4️⃣ /settings');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '04-settings');

  // BOOK EDIT - first book
  console.log('\n5️⃣ BOOK EDIT FLOW');
  if (uniqueBooks.length > 0) {
    const bookId = uniqueBooks[0].split('/').pop();
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '05-book-edit');
    console.log('   Book ID:', bookId);
  } else {
    // Create a book first
    console.log('   No books found, creating one...');
    await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, '05b-create-book-form');
    
    await page.locator('input[name="title"]').fill('My Test Memory Book');
    await page.locator('textarea[name="description"]').fill('A test book for UI validation');
    await page.locator('button[type="submit"]').click();
    await waitNet(page, 5000);
    const newUrl = page.url();
    console.log('   New book URL:', newUrl);
  }

  // CREATE MEMORY IN BOOK
  console.log('\n6️⃣ CREATE MEMORY');
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill('The autumn light streamed through the old kitchen window, painting everything in that particular shade of gold that only October seems to know how to make. Grandmother was humming something off-key, a tune I can no longer name but will never forget.');
    await waitNet(page, 300);
    await screenshot(page, '06-memory-text-entered');
    
    // Try to save
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await waitNet(page, 6000);
      await screenshot(page, '07-after-save');
      console.log('   Saved! URL:', page.url());
    }
  }

  // INSPECT MEMORY CARD
  console.log('\n7️⃣ MEMORY CARD INSPECTION');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '08-dashboard-after-create');

  // CHECK FOR UI ISSUES
  console.log('\n8️⃣ UI ISSUES CHECK');
  
  // Check for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`Console error: ${msg.text()}`);
    }
  });

  // Check for broken images
  const images = await page.locator('img').all();
  for (const img of images) {
    const naturalWidth = await img.evaluate(el => el.naturalWidth).catch(() => 0);
    if (naturalWidth === 0) {
      issues.push(`Broken image: ${await img.getAttribute('src').catch(() => 'unknown')}`);
    }
  }

  // NAVIGATE TO BOOK DETAIL
  if (uniqueBooks.length > 0) {
    console.log('\n9️⃣ BOOK DETAIL');
    await page.goto(`${BASE_URL}${uniqueBooks[0]}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '09-book-detail');
  }

  // FINAL REPORT
  console.log('\n📊 UI AUDIT RESULTS');
  console.log('==================');
  console.log('Errors found:', errors.length);
  errors.forEach(e => console.log('  ❌', e));
  console.log('Issues found:', issues.length);
  issues.forEach(i => console.log('  ⚠️', i));
  console.log('Books on dashboard:', uniqueBooks.length);

  await browser.close();
  
  return { errors, issues, bookCount: uniqueBooks.length };
}

run().then(r => {
  console.log('\n✅ Cycle 11 audit complete');
  process.exit(0);
}).catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
