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
  console.log('🚀 MemoryProject UI Cycle 11 — Validation\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  
  // DASHBOARD
  console.log('2️⃣ DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'v02-dashboard');

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

  // BOOK DETAIL - first book
  console.log('3️⃣ BOOK DETAIL');
  if (uniqueBooks.length > 0) {
    const bookId = uniqueBooks[0].split('/').pop();
    await page.goto(`${BASE_URL}/books/${bookId}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, 'v03-book-detail');
    
    // Check memory cards for contrast
    const memoryDates = await page.locator('text=/April 29, 2026|January|February|March|2025/').all();
    console.log('   Memory dates found:', memoryDates.length);
  }

  // BOOK EDIT
  console.log('4️⃣ BOOK EDIT');
  if (uniqueBooks.length > 0) {
    const bookId = uniqueBooks[0].split('/').pop();
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, 'v04-book-edit');
  }

  console.log('\n✅ Validation complete');
  await browser.close();
  process.exit(0);
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
