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

async function run() {
  console.log('\n🔍 UI Cycle 14 — Deep Product Flow\n');
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
  console.log('   →', page.url());

  // ─── DASHBOARD ───
  console.log('\n📊 DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '02-dashboard');

  // Scroll to trigger FAB
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(600);
  await screenshot(page, '03-dashboard-scrolled');

  // ─── OPEN CREATE BOOK MODAL ───
  console.log('\n📗 CREATE BOOK MODAL');
  const newBookBtn = page.locator('button:has-text("New Book"), button:has-text("new book")').first();
  console.log('   New Book button:', await newBookBtn.count() > 0 ? '✅' : '❌');
  if (await newBookBtn.count() > 0) {
    await newBookBtn.click();
    await waitNet(page, 800);
    await screenshot(page, '04-create-book-modal');
    console.log('   Modal URL:', page.url());

    // Check modal fields
    const titleInput = page.locator('input[id*="title"], input[placeholder*="title" i]').first();
    const descInput = page.locator('textarea[id*="description"], textarea[placeholder*="description" i]').first();
    console.log('   Title input:', await titleInput.count() > 0 ? '✅' : '❌');
    console.log('   Description input:', await descInput.count() > 0 ? '✅' : '❌');

    // Fill and submit
    if (await titleInput.count() > 0) await titleInput.fill('My Test Memory Book');
    if (await descInput.count() > 0) await descInput.fill('Testing the create book flow.');
    
    // Look for plan selector
    const planBtns = await page.locator('button:has-text("Plus"), button:has-text("Free"), button:has-text("Premium")').all();
    console.log('   Plan buttons:', planBtns.length);

    await screenshot(page, '05-create-book-filled');

    // Submit form
    const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button[id*="submit"]').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await waitNet(page, 3000);
      await screenshot(page, '06-after-create-book');
      console.log('   After submit →', page.url());
    } else {
      // Try pressing Enter on the form
      await page.keyboard.press('Enter');
      await waitNet(page, 3000);
      console.log('   After Enter →', page.url());
    }
  }

  // ─── BOOK DETAIL (navigate to first book with memories) ───
  console.log('\n📖 BOOK DETAIL');
  // Get any book link
  const bookLink = page.locator(`a[href*="/books/"]`).first();
  if (await bookLink.count() > 0) {
    const href = await bookLink.getAttribute('href');
    console.log('   Navigating to:', href);
    await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '07-book-detail');

    // Check memory cards
    const memoryCards = await page.locator('[class*="card"], [class*="memory-card"], [class*="memory"]').all();
    console.log('   Memory elements:', memoryCards.length);

    // Check Add Memory button
    const addBtn = page.locator('a[href*="/edit"]:has-text("Add Memory"), button:has-text("Add Memory")').first();
    console.log('   Add Memory btn:', await addBtn.count() > 0 ? '✅' : '❌');

    if (await addBtn.count() > 0) {
      await addBtn.click();
      await waitNet(page, 2000);
      await screenshot(page, '08-add-memory-form');
      console.log('   Add Memory URL:', page.url());
    }
  }

  // ─── MEMORY EDITOR ───
  console.log('\n✏️ MEMORY EDITOR');
  // If we're on the editor page
  if (page.url().includes('/edit')) {
    // Check prompt selector
    const promptSelect = page.locator('select[id*="prompt"], select[name*="prompt"]').first();
    console.log('   Prompt selector:', await promptSelect.count() > 0 ? '✅' : '❌');

    // Check text areas
    const textareas = await page.locator('textarea').all();
    console.log('   Textareas:', textareas.length);

    // Check image upload
    const fileInputs = await page.locator('input[type="file"]').all();
    console.log('   File inputs:', fileInputs.length);

    // Check for upload zone
    const dropzone = page.locator('[class*="dropzone"], [class*="upload"], [class*="gallery"]').first();
    console.log('   Upload zone:', await dropzone.count() > 0 ? '✅' : '❌');

    // Try filling in content if textarea exists
    if (textareas.length > 0) {
      await textareas[0].fill('This is a beautiful memory from a summer afternoon.');
      await screenshot(page, '09-editor-content-filled');
    }

    // Look for save button
    const saveBtn = page.locator('button[type="submit"]:has-text("Save"), button:has-text("Save Memory"), button:has-text("Publish")').first();
    console.log('   Save button:', await saveBtn.count() > 0 ? '✅' : '❌');
  }

  // ─── SETTINGS PAGE ───
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '10-settings');
  console.log('   URL:', page.url());

  // Check settings sections
  const sections = await page.locator('h1, h2, h3').allTextContents();
  console.log('   Headings:', sections.slice(0, 8));

  // ─── UPGRADE PAGE ───
  console.log('\n💎 UPGRADE PAGE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '11-upgrade-page');

  // ─── MOBILE CHECK ───
  console.log('\n📱 MOBILE FLOW');
  await page.setViewportSize({ width: 390, height: 844 });
  
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '12-mobile-dashboard');

  // Check book card layout on mobile
  const mobileBookCards = await page.locator('[class*="card"]').all();
  console.log('   Mobile card count:', mobileBookCards.length);

  // Open hamburger
  const hamburger = page.locator('[aria-label*="navigation"], [aria-label*="menu"]').first();
  if (await hamburger.count() > 0) {
    await hamburger.click();
    await waitNet(page, 600);
    await screenshot(page, '13-mobile-nav-open');

    // Navigate to settings via mobile nav
    const settingsLink = page.locator('a[href="/settings"]').first();
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      await waitNet(page, 1500);
      await screenshot(page, '14-mobile-settings');
    }
  }

  // ─── FINAL CHECK: BOOK DETAIL MOBILE ───
  console.log('\n📱 BOOK DETAIL MOBILE');
  await page.setViewportSize({ width: 390, height: 844 });
  // Go to a book detail
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  const firstBook = page.locator(`a[href*="/books/"]`).first();
  const bookHref = await firstBook.getAttribute('href');
  if (bookHref) {
    await page.goto(`${BASE_URL}${bookHref}`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, '15-mobile-book-detail');
    console.log('   Book URL:', page.url());
  }

  // ─── ERRORS ───
  console.log('\n');
  if (errors.length > 0) {
    console.log('⚠️ CONSOLE ERRORS (', errors.length, '):');
    [...new Set(errors)].slice(0, 5).forEach(e => console.log(' -', e));
  } else {
    console.log('✅ No console errors');
  }

  await browser.close();
  console.log('\n✅ Cycle 14 deep flow complete');
  return { errors };
}

run().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });