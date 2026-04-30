const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle14-final';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name, opts = {}) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: opts.fullPage !== false, ...opts });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 1500) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('\n🔍 UI Cycle 14 — Final Validation\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // LOGIN
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, '00-login');
  console.log('  →', page.url());

  // ─── FLOW 1: Book with memories ───
  console.log('\n📖 BOOK WITH MEMORIES');
  await page.goto(`${BASE_URL}/books/245`, { waitUntil: 'networkidle' });
  await waitNet(page, 2500);
  await screenshot(page, '01-book-detail');

  const allAddMemory = await page.locator('a:has-text("Add Memory")').all();
  console.log('  Add Memory links:', allAddMemory.length);
  for (const link of allAddMemory) {
    const href = await link.getAttribute('href');
    const visible = await link.isVisible();
    console.log('   -', href, '| visible:', visible);
  }

  // ─── FLOW 2: Empty book ───
  console.log('\n📖 EMPTY BOOK');
  await page.goto(`${BASE_URL}/books/246`, { waitUntil: 'networkidle' });
  await waitNet(page, 2500);
  await screenshot(page, '02-empty-book');

  const emptyAddBtn = page.locator('a:has-text("Add your first memory")').first();
  console.log('  Empty state CTA:', await emptyAddBtn.count() > 0 ? '✅' : '❌');

  // Click to editor
  if (await emptyAddBtn.count() > 0) {
    await emptyAddBtn.click();
    await waitNet(page, 2500);
    await screenshot(page, '03-editor-empty');
    console.log('  Editor URL:', page.url());
  }

  // ─── FLOW 3: Edit memory with content ───
  console.log('\n✏️ EDIT EXISTING MEMORY');
  await page.goto(`${BASE_URL}/books/245/edit?memory=`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);

  // Get first memory ID
  await page.goto(`${BASE_URL}/books/245`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  const memoryLinks = await page.locator('a[href*="/edit?memory="]').all();
  if (memoryLinks.length > 0) {
    const href = await memoryLinks[0].getAttribute('href');
    console.log('  Editing memory:', href);
    await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2500);
    await screenshot(page, '04-edit-memory');

    // Check save states
    const autosaveText = await page.locator('text=/auto.*saved|draft saved|save.*as/i').allTextContents();
    console.log('  Save state text found:', autosaveText.length, autosaveText[0] || '');

    // Try filling textarea
    const ta = page.locator('textarea').first();
    if (await ta.count() > 0) {
      const currentVal = await ta.inputValue();
      console.log('  Textarea has content:', currentVal.length > 0 ? '✅' : '❌', `(${currentVal.length} chars)`);
    }

    // Check word count badge
    const wordBadge = page.locator('span:has-text("words"), span:has-text("word")').first();
    console.log('  Word badge:', await wordBadge.count() > 0 ? '✅' : '❌');

    // Check premium section
    const optionalSection = page.locator('text=/Photos.*audio|Photos & audio/i').first();
    console.log('  Optional section:', await optionalSection.count() > 0 ? '✅' : '❌');
  }

  // ─── FLOW 4: Settings page ───
  console.log('\n⚙️ SETTINGS');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '05-settings-desktop');

  // Save changes
  const saveBtn = page.locator('button:has-text("Save changes")').first();
  console.log('  Save button:', await saveBtn.count() > 0 ? '✅' : '❌');

  // ─── FLOW 5: Upgrade page ───
  console.log('\n💎 UPGRADE PAGE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '06-upgrade');

  // Select a book
  const selectEl = page.locator('select').first();
  if (await selectEl.count() > 0) {
    const options = await selectEl.locator('option').allTextContents();
    console.log('  Books in selector:', options.length);
  }

  // ─── FLOW 6: Dashboard mobile ───
  console.log('\n📱 MOBILE DASHBOARD');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '07-mobile-dashboard');

  // Open nav
  const ham = page.locator('[aria-label*="navigation"], [aria-label*="menu"]').first();
  if (await ham.count() > 0) {
    await ham.click();
    await waitNet(page, 700);
    await screenshot(page, '08-mobile-nav-open');

    const navLinks = await page.locator('nav a').allTextContents();
    console.log('  Nav links:', navLinks.slice(0, 6));
  }

  // ─── FLOW 7: Verify edit page has correct save CTA ───
  console.log('\n🔍 EDITOR SAVE CTA VERIFICATION');
  await page.setViewportSize({ width: 1280, height: 900 });
  // Try to reach the editor with a book that has content
  await page.goto(`${BASE_URL}/books/245/edit`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);

  // Count save buttons in main form area
  const saveInForm = await page.locator('form button[type="submit"]').count();
  console.log('  Submit buttons in form:', saveInForm);

  // Check the sticky bar
  const stickyBar = page.locator('[class*="sticky"][class*="bottom"]').first();
  console.log('  Sticky save bar:', await stickyBar.count() > 0 ? '✅' : '❌');

  // ─── ERRORS ───
  console.log('\n');
  const uniqueErrors = [...new Set(errors)];
  if (uniqueErrors.length > 0) {
    console.log('⚠️ CONSOLE ERRORS:', uniqueErrors.length);
    uniqueErrors.slice(0, 5).forEach(e => console.log(' -', e));
  } else {
    console.log('✅ No console errors');
  }

  await browser.close();
  console.log('\n✅ Cycle 14 final validation complete');
  return { errors: uniqueErrors };
}

run().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });