const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle14';

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

function createTestImage() {
  // Create a simple 200x200 PNG (1x1 pixel blue) as fallback
  // This is just to satisfy the upload flow
  return null;
}

async function run() {
  console.log('\n🔍 UI Cycle 14 — Premium UX Deep Dive\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // ─── LOGIN ───
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await screenshot(page, '01-login');
  console.log('   Logged in →', page.url());

  // ─── DASHBOARD ───
  console.log('\n📊 DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '02-dashboard-desktop');

  // Check book cards layout
  const bookCards = await page.locator('[class*="card"], [class*="book"]').all();
  console.log('   Book/card elements found:', bookCards.length);

  // ─── CREATE MEMORY FLOW ───
  console.log('\n💎 CREATE MEMORY');
  // Find create memory button
  let createBtn = page.locator('button:has-text("New Memory"), button:has-text("Add Memory"), a:has-text("New Memory"), a:has-text("Add Memory")').first();
  const createBtnExists = await createBtn.count() > 0;
  console.log('   Create memory button:', createBtnExists ? '✅' : '❌');

  if (createBtnExists) {
    await createBtn.click();
    await waitNet(page, 1500);
    await screenshot(page, '03-create-memory-form');

    // Check form fields
    const titleInput = page.locator('input[id*="title"], input[placeholder*="title" i], input[name*="title"]').first();
    const descTextarea = page.locator('textarea[id*="description"], textarea[placeholder*="description" i]').first();
    const contentTextarea = page.locator('textarea[id*="content"], textarea[placeholder*="content" i], textarea[name*="content"]').first();
    
    console.log('   Title input:', await titleInput.count() > 0 ? '✅' : '❌');
    console.log('   Description textarea:', await descTextarea.count() > 0 ? '✅' : '❌');
    console.log('   Content textarea:', await contentTextarea.count() > 0 ? '✅' : '❌');

    // Fill in memory details
    const testTitle = 'Summer Garden Party 2024';
    const testDesc = 'Beautiful evening in the backyard with friends and family.';
    const testContent = 'We gathered in the garden as the sun was setting. The fairy lights were strung between the apple tree branches, and the smell of fresh bread filled the air. Children played on the lawn while adults talked and laughed on the porch. It was one of those perfect evenings that stays with you forever.';

    if (await titleInput.count() > 0) await titleInput.fill(testTitle);
    if (await descTextarea.count() > 0) await descTextarea.fill(testDesc);
    if (await contentTextarea.count() > 0) await contentTextarea.fill(testContent);
    
    await screenshot(page, '04-memory-form-filled');

    // Check for image upload
    const imageUpload = page.locator('input[type="file"][accept*="image"], input[type="file"]').first();
    const hasImageUpload = await imageUpload.count() > 0;
    console.log('   Image upload:', hasImageUpload ? '✅' : '❌');

    // Check for audio upload
    const audioUpload = page.locator('input[type="file"][accept*="audio"], input[type="file"]').first();
    const hasAudioUpload = await audioUpload.count() > 0;
    console.log('   Audio upload:', hasAudioUpload ? '✅' : '❌');

    // Check save button
    const saveBtn = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")').first();
    console.log('   Save button:', await saveBtn.count() > 0 ? '✅' : '❌');

    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await waitNet(page, 3000);
      await screenshot(page, '05-memory-saved');
      console.log('   After save URL:', page.url());
    }
  }

  // ─── MOBILE CHECK ───
  console.log('\n📱 MOBILE DASHBOARD');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '06-mobile-dashboard');

  // Check hamburger
  const hamburger = page.locator('[aria-label*="navigation"], [aria-label*="menu"], button[class*="hamburger"], button[class*="menu"]').first();
  const hasHamburger = await hamburger.count() > 0;
  console.log('   Hamburger nav:', hasHamburger ? '✅' : '❌');

  if (hasHamburger) {
    await hamburger.click();
    await waitNet(page, 800);
    await screenshot(page, '07-mobile-nav-open');
    
    const navItems = await page.locator('nav a, [class*="drawer"] a, [class*="mobile-nav"] a').allTextContents();
    console.log('   Nav items:', navItems.slice(0, 6));
  }

  // ─── BOOKS PAGE ───
  console.log('\n📚 BOOKS PAGE');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '08-books-page');

  const bookItems = await page.locator('[class*="card"], [class*="book-item"]').all();
  console.log('   Book items found:', bookItems.length);

  // Create a new book
  const newBookBtn = page.locator('a:has-text("New Book"), button:has-text("New Book")').first();
  if (await newBookBtn.count() > 0) {
    await newBookBtn.click();
    await waitNet(page, 1500);
    await screenshot(page, '09-create-book-form');
    console.log('   Create book form URL:', page.url());
  }

  // ─── BOOK DETAIL ───
  console.log('\n📖 BOOK DETAIL');
  // Get first book link
  const bookLinks = await page.locator(`a[href*="/books/"]`).all();
  let bookHref = null;
  for (const link of bookLinks) {
    const href = await link.getAttribute('href');
    if (href && !href.includes('/edit') && !href.includes('/preview') && !href.includes('/new')) {
      bookHref = href;
      break;
    }
  }
  
  if (bookHref) {
    await page.goto(`${BASE_URL}${bookHref}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '10-book-detail');

    // Check for memories section
    const memorySection = page.locator('text=/memory/i, [class*="memory"]').first();
    console.log('   Memory section:', await memorySection.count() > 0 ? '✅' : '❌');

    // Check add memory button
    const addMemoryBtn = page.locator('button:has-text("Add Memory"), a:has-text("Add Memory")').first();
    console.log('   Add memory button:', await addMemoryBtn.count() > 0 ? '✅' : '❌');
  }

  // ─── SETTINGS ───
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '11-settings');

  const settingsSections = await page.locator('[class*="section"], [class*="card"]').all();
  console.log('   Settings sections:', settingsSections.length);

  // ─── REPORT ERRORS ───
  if (errors.length > 0) {
    console.log('\n⚠️ CONSOLE ERRORS:');
    errors.slice(0, 10).forEach(e => console.log('  -', e));
  } else {
    console.log('\n✅ No console errors');
  }

  await browser.close();
  console.log('\n✅ Cycle 14 exploration complete');
  return { errors };
}

run().catch(e => { console.error('❌ Fatal error:', e.message); process.exit(1); });