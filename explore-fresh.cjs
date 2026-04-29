const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3133';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-fresh-ui';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 800) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function scrollDown(page, amt = 300) {
  await page.evaluate((y) => window.scrollBy(0, y), amt);
  await page.waitForTimeout(300);
}

async function run() {
  console.log('🚀 Starting fresh UI exploration...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-login-page');

  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  await screenshot(page, '02-after-login');
  console.log('  Current URL:', page.url());

  // DASHBOARD
  console.log('\n2️⃣ DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '03-dashboard');
  
  const fabVisible = await page.locator('button').filter({ hasText: /new|create|book/i }).first().isVisible().catch(() => false);
  console.log('  FAB/Create button visible:', fabVisible);
  const cards = await page.locator('[class*="card"]').count();
  console.log('  Card elements found:', cards);

  // CREATE A BOOK
  console.log('\n3️⃣ CREATE BOOK');
  const createBtn = page.locator('button').filter({ hasText: /new|create book/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await createBtn.click();
    await waitNet(page, 1000);
    await screenshot(page, '04-create-book-modal');

    const titleInput = page.locator('#modal-title');
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill('My Family Stories 2026');
      const descInput = page.locator('#modal-desc');
      if (await descInput.isVisible().catch(() => false)) {
        await descInput.fill('Capturing our favorite family moments and stories.');
      }
      await screenshot(page, '05-create-form-filled');
      
      const submitBtn = page.locator('button[type="submit"], button').filter({ hasText: /create|save/i }).first();
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await waitNet(page, 4000);
        await screenshot(page, '06-after-book-create');
      }
    }
  } else {
    console.log('  Create button not found, trying direct navigation');
    await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' });
    await waitNet(page, 1000);
    await screenshot(page, '04-books-new-page');
  }

  // BOOK DETAIL
  console.log('\n4️⃣ BOOK DETAIL');
  const bookLink = page.locator('a[href*="/books/"]').first();
  if (await bookLink.isVisible().catch(() => false)) {
    await bookLink.click();
    await waitNet(page, 2000);
    await screenshot(page, '07-book-detail');
    console.log('  Book URL:', page.url());
  }

  // ADD MEMORY
  console.log('\n5️⃣ ADD MEMORY');
  const addMemoryBtn = page.locator('a, button').filter({ hasText: /add memory|write memory|new memory/i }).first();
  if (await addMemoryBtn.isVisible().catch(() => false)) {
    await addMemoryBtn.click();
    await waitNet(page, 1500);
    await screenshot(page, '08-memory-editor');
    console.log('  Memory editor URL:', page.url());

    const textareas = page.locator('textarea');
    if (await textareas.first().isVisible().catch(() => false)) {
      await textareas.first().fill('Growing up, every Sunday meant church in the morning and Grandma\'s cooking in the afternoon. Her kitchen smelled like cinnamon and coffee, and everyone gathered around her worn oak table.');
      await screenshot(page, '09-memory-text-filled');

      const photoInput = page.locator('input[type="file"]').first();
      if (await photoInput.isVisible().catch(() => false)) {
        console.log('  Photo upload input found');
        await screenshot(page, '10-photo-input-visible');
      }

      await scrollDown(page, 400);
      await screenshot(page, '11-memory-editor-scrolled');
    }
  }

  // SAVE MEMORY
  console.log('\n6️⃣ SAVE MEMORY');
  const saveBtn = page.locator('button').filter({ hasText: /save|publish|add/i }).first();
  if (await saveBtn.isVisible().catch(() => false)) {
    await saveBtn.click();
    await waitNet(page, 5000);
    await screenshot(page, '12-after-memory-save');
    console.log('  After save URL:', page.url());
  }

  // SETTINGS
  console.log('\n7️⃣ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '13-settings');

  // BOOKS PAGE
  console.log('\n8️⃣ BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '14-books-page');

  // BOOK DETAIL WITH MEMORY
  console.log('\n9️⃣ BOOK DETAIL (after memory)');
  const books = await page.locator('a[href*="/books/"]').all();
  if (books.length > 0) {
    await books[0].click();
    await waitNet(page, 2000);
    await screenshot(page, '15-book-detail-with-memory');
    const memoryCards = await page.locator('[class*="card"], [class*="memory"]').count();
    console.log('  Memory card elements:', memoryCards);
  }

  // SCROLL BOOK DETAIL
  console.log('\n🔟 SCROLL BOOK DETAIL');
  await scrollDown(page, 500);
  await screenshot(page, '16-book-detail-scroll-1');
  await scrollDown(page, 500);
  await screenshot(page, '17-book-detail-scroll-2');
  await scrollDown(page, 500);
  await screenshot(page, '18-book-detail-scroll-3');

  // DASHBOARD FINAL
  console.log('\n1️⃣1️⃣ DASHBOARD FINAL');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '19-dashboard-final');

  // UI ANALYSIS
  console.log('\n📋 UI ANALYSIS:');
  const buttons = await page.locator('button').count();
  const links = await page.locator('a').count();
  const inputs = await page.locator('input, textarea').count();
  const cardEls = await page.locator('[class*="card"]').count();
  console.log(`  Buttons: ${buttons}, Links: ${links}, Inputs: ${inputs}, Cards: ${cardEls}`);

  await browser.close();
  console.log('\n✅ Exploration complete. Screenshots in:', SCREEN_DIR);
}

run().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });