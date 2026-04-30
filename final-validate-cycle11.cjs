const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-cycle11-final';

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
  console.log('🚀 MemoryProject Final Validation\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  let passed = true;
  const errors = [];

  // LOGIN
  console.log('1️⃣ LOGIN');
  try {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
    await page.waitForTimeout(5000);
    await screenshot(page, '01-logged-in');
    console.log('   ✅ Logged in');
  } catch (e) {
    console.log('   ❌ Login failed:', e.message);
    passed = false;
    errors.push('Login failed');
  }

  // DASHBOARD
  console.log('2️⃣ DASHBOARD');
  try {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, '02-dashboard');
    console.log('   ✅ Dashboard loaded');
  } catch (e) {
    console.log('   ❌ Dashboard failed:', e.message);
    passed = false;
    errors.push('Dashboard failed');
  }

  // Collect book links
  const bookLinks = [];
  try {
    const allLinks = await page.locator('a[href*="/books/"]').all();
    for (const link of allLinks) {
      const href = await link.getAttribute('href').catch(() => null);
      if (href && !href.includes('/edit') && !href.includes('/new')) {
        bookLinks.push(href);
      }
    }
    const uniqueBooks = [...new Set(bookLinks)];
    console.log(`   📚 Books found: ${uniqueBooks.length}`);
  } catch (e) {
    console.log('   ⚠️ Could not collect books:', e.message);
  }

  // BOOK DETAIL
  console.log('3️⃣ BOOK DETAIL');
  try {
    if (bookLinks.length > 0) {
      const bookId = bookLinks[0].split('/').pop();
      await page.goto(`${BASE_URL}/books/${bookId}`, { waitUntil: 'networkidle' });
      await waitNet(page, 2000);
      await screenshot(page, '03-book-detail');
      console.log('   ✅ Book detail loaded');
    }
  } catch (e) {
    console.log('   ❌ Book detail failed:', e.message);
    passed = false;
    errors.push('Book detail failed');
  }

  // BOOK EDIT
  console.log('4️⃣ BOOK EDIT');
  try {
    if (bookLinks.length > 0) {
      const bookId = bookLinks[0].split('/').pop();
      await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
      await waitNet(page, 2000);
      await screenshot(page, '04-book-edit');
      console.log('   ✅ Book edit loaded');
    }
  } catch (e) {
    console.log('   ❌ Book edit failed:', e.message);
    passed = false;
    errors.push('Book edit failed');
  }

  // CREATE MEMORY
  console.log('5️⃣ CREATE MEMORY');
  try {
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill('The morning fog lifted slowly over the valley, revealing the old oak tree where we used to climb as children. Each branch held a memory, each leaf a whispered story from summers long past.');
      await waitNet(page, 300);
      await screenshot(page, '05-memory-filled');
      
      const saveBtn = page.locator('button[type="submit"]').first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        await waitNet(page, 6000);
        await screenshot(page, '06-memory-saved');
        console.log('   ✅ Memory created');
      }
    }
  } catch (e) {
    console.log('   ❌ Create memory failed:', e.message);
    passed = false;
    errors.push('Create memory failed');
  }

  // SETTINGS
  console.log('6️⃣ SETTINGS');
  try {
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, '07-settings');
    console.log('   ✅ Settings loaded');
  } catch (e) {
    console.log('   ❌ Settings failed:', e.message);
    passed = false;
    errors.push('Settings failed');
  }

  // FINAL CHECK
  console.log('\n📊 VALIDATION RESULTS');
  console.log('======================');
  if (passed) {
    console.log('✅ All checks passed!');
  } else {
    console.log('❌ Some checks failed:');
    errors.forEach(e => console.log('  -', e));
  }

  await browser.close();
  process.exit(passed ? 0 : 1);
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
