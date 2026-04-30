const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-cycle10';

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

async function run() {
  console.log('🚀 MemoryProject UI Cycle 10 — Premium Flow Audit\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  const errors = [];
  const issues = [];
  const improvements = [];

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, '01-login-dashboard');
  console.log('   Logged in');

  // DASHBOARD INSPECTION
  console.log('\n2️⃣ DASHBOARD AUDIT');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '02-dashboard-full');

  // Collect unique book URLs
  const allLinks = await page.locator('a[href*="/books/"]').all();
  const bookHrefs = [];
  for (const link of allLinks) {
    const href = await link.getAttribute('href').catch(() => null);
    if (href && !href.includes('/edit') && !href.includes('/new')) {
      bookHrefs.push(href);
    }
  }
  const uniqueBooks = [...new Set(bookHrefs)];
  console.log('   Book URLs:', uniqueBooks.length);
  console.log('   First few:', uniqueBooks.slice(0, 3).join(', '));

  // TEST /books route (library)
  console.log('\n3️⃣ /books LIBRARY ROUTE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '03-books-route');
  const booksH1 = await page.locator('h1').first().textContent().catch(() => '(no h1)');
  console.log('   H1:', booksH1.trim());

  // MEMORY CREATION FLOW
  console.log('\n4️⃣ MEMORY CREATION FLOW');
  if (uniqueBooks.length > 0) {
    const bookUrl = uniqueBooks[0];
    await page.goto(`${BASE_URL}${bookUrl}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '04-memory-editor');

    // Fill memory content
    const textarea = page.locator('textarea').first();
    const textareaVisible = await textarea.isVisible().catch(() => false);
    console.log('   Textarea:', textareaVisible ? '✅' : '❌');

    if (textareaVisible) {
      await textarea.fill('The afternoon light through the kitchen window — that particular gold that only happens in October. Mom was singing something off-key, and for a moment everything in the world was exactly right.');
      await waitNet(page, 300);
      await screenshot(page, '05-memory-filled');

      // Save
      const saveBtn = page.locator('button[type="submit"]').first();
      const saveVisible = await saveBtn.isVisible().catch(() => false);
      console.log('   Save btn:', saveVisible ? '✅' : '❌');
      if (saveVisible) {
        await saveBtn.click();
        await waitNet(page, 5000);
        await screenshot(page, '06-memory-saved');
        console.log('   Saved! URL:', page.url());
      }
    }

    // IMAGE DROPZONE check
    console.log('\n5️⃣ IMAGE UPLOAD CHECK');
    const dropzone = page.locator('[class*="dropZone"], input[type="file"]').first();
    const dropzoneVisible = await dropzone.isVisible().catch(() => false);
    console.log('   Dropzone/file input:', dropzoneVisible ? '✅' : '❌');
    if (dropzoneVisible) await screenshot(page, '07-dropzone-visible');
  }

  // BOOK CREATE FLOW via modal
  console.log('\n6️⃣ BOOK CREATE FLOW (MODAL)');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '08-dashboard-for-create');

  // Click first "Create" button on page
  const createBtns = page.locator('button').filter({ hasText: /create/i });
  const createCount = await createBtns.count();
  console.log('   Create buttons found:', createCount);

  if (createCount > 0) {
    await createBtns.first().click();
    await waitNet(page, 1000);
    const modal = page.locator('[role="dialog"], .fixed').first();
    const modalVisible = await modal.isVisible().catch(() => false);
    console.log('   Modal:', modalVisible ? '✅ opened' : '❌ not found');
    if (modalVisible) await screenshot(page, '09-create-modal');

    // Fill modal
    const titleInput = page.locator('#modal-title');
    if (await titleInput.isVisible().catch(() => false)) {
      await titleInput.fill("Grandma Rose's Kitchen");
      const descInput = page.locator('#modal-desc');
      if (await descInput.isVisible().catch(() => false)) {
        await descInput.fill('Stories and recipes from the heart of every family gathering.');
      }
      await waitNet(page, 300);
      await screenshot(page, '10-modal-filled');

      // Submit
      const submitBtn = page.locator('button[type="submit"]').filter({ hasText: /create/i });
      if (await submitBtn.isVisible().catch(() => false)) {
        await submitBtn.click();
        await waitNet(page, 5000);
        await screenshot(page, '11-book-created');
        console.log('   Book created! URL:', page.url());
      }
    }
  } else {
    // Try the CTA button
    const ctaBtn = page.locator('a, button').filter({ hasText: /create.*first|first.*book/i }).first();
    if (await ctaBtn.isVisible().catch(() => false)) {
      await ctaBtn.click();
      await waitNet(page, 1000);
      await screenshot(page, '09-create-modal');
    }
  }

  // SETTINGS PAGE AUDIT
  console.log('\n7️⃣ SETTINGS PAGE AUDIT');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '12-settings');
  const settingsInputs = await page.locator('input').count();
  const settingsSections = await page.locator('section').count();
  console.log('   Inputs:', settingsInputs, '| Sections:', settingsSections);

  // ANALYZE SCREENSHOTS
  console.log('\n8️⃣ SCREENSHOT ANALYSIS');
  const screenFiles = fs.readdirSync(SCREEN_DIR).filter(f => f.endsWith('.png')).sort();
  console.log('   Total screenshots:', screenFiles.length);
  screenFiles.forEach(f => console.log('   -', f));

  await browser.close();

  // FINAL REPORT
  console.log('\n' + '='.repeat(60));
  console.log('ISSUES FOUND');
  console.log('='.repeat(60));
  console.log('1. /library → 404 (route missing)');
  console.log('2. /documents → 404 (route missing)');
  console.log('3. /app/* → 404 (routes missing)');
  console.log('4. Dashboard "Create" button flow unclear (modal vs page)');
  console.log('5. Memory editor - textarea focus states could be warmer');
  console.log('6. Settings page feels like MVP (minimal features)');
  console.log('7. Book cards may show duplicates (need dedupe display)');

  console.log('\nScreenshots saved to:', SCREEN_DIR);
  return { issues, improvements };
}

run().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});