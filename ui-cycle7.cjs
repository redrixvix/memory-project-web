const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const BASE = 'http://localhost:3133';
const SCREEN_DIR = path.join(__dirname, 'screens-ui-cycle7');
if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

const EMAIL = process.env.MEMORY_TEST_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.MEMORY_TEST_PASSWORD || 'd[,<(q<HC6V~MJvV';

function randId() { return crypto.randomBytes(4).toString('hex'); }
function screenshot(page, name) {
  return page.screenshot({ path: path.join(SCREEN_DIR, name), fullPage: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();

  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  let passed = [];
  let failed = [];

  async function step(name, fn) {
    try {
      await fn();
      passed.push(name);
      console.log(`✓ ${name}`);
    } catch(e) {
      failed.push(`${name}: ${e.message}`);
      console.error(`✗ ${name}: ${e.message}`);
    }
  }

  // ── 1. LOGIN ──────────────────────────────────────────────────────────────
  await step('Login page loads', async () => {
    await page.goto(BASE + '/login');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '01-login-page.png');
    const title = await page.title();
    console.log(`  Page title: ${title}`);
  });

  await step('Login with credentials', async () => {
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log(`  Landed at: ${page.url()}`);
  });

  await step('Dashboard loads with books', async () => {
    await page.waitForLoadState('networkidle');
    await screenshot(page, '02-dashboard-loaded.png');
    const heading = await page.locator('h1').first().textContent();
    console.log(`  Dashboard heading: ${heading}`);
    // Count book cards
    const cards = await page.locator('a[href^="/books/"]').count();
    console.log(`  Book links found: ${cards}`);
  });

  // ── 2. EXPLORE NAVIGATION ────────────────────────────────────────────────
  await step('Navigate to settings', async () => {
    await page.goto(BASE + '/settings');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '03-settings-page.png');
    const h1 = await page.locator('h1').first().textContent().catch(() => 'no h1');
    console.log(`  Settings heading: ${h1}`);
  });

  await step('Navigate back to dashboard', async () => {
    await page.goto(BASE + '/dashboard');
    await page.waitForLoadState('networkidle');
    await screenshot(page, '04-dashboard-return.png');
  });

  // ── 3. CREATE A NEW BOOK ──────────────────────────────────────────────
  let newBookId = null;
  await step('Open create book modal', async () => {
    const createBtn = page.locator('button:has-text("New Book")').first();
    await createBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, '05-create-book-modal.png');
  });

  await step('Fill and submit new book form', async () => {
    const titleVal = `Test Book ${randId()}`;
    await page.fill('#modal-title', titleVal);
    await page.fill('#modal-desc', 'A book created during UI testing to identify UX friction.');
    await page.click('button[form="create-book-form"]');
    // Wait for navigation to book detail page
    await page.waitForURL('**/books/**', { timeout: 10000 });
    newBookId = page.url().split('/books/')[1];
    console.log(`  Created book ID: ${newBookId}`);
    await screenshot(page, '06-new-book-page.png');
  });

  // ── 4. CREATE MEMORIES ────────────────────────────────────────────────
  await step('Create memory #1 - text only', async () => {
    await page.waitForLoadState('networkidle');
    // Find and click the "Add memory" or "New memory" button
    const addBtn = page.locator('button:has-text("Add memory"), button:has-text("Add a memory"), button:has-text("New Memory")').first();
    await addBtn.click();
    await page.waitForTimeout(800);
    await screenshot(page, '07-memory-editor.png');

    // Check what editor fields are visible
    const body = await page.locator('body').textContent();
    console.log(`  Editor has content: ${body.includes('Write') || body.includes('Memory') || body.includes('prompt')}`);
  });

  await step('Fill memory content', async () => {
    // Find the textarea / contenteditable
    const textareas = page.locator('textarea, [contenteditable="true"]');
    const count = await textareas.count();
    console.log(`  Textareas/editable fields: ${count}`);

    // Try to find and fill the text content area
    const editor = page.locator('[data-state="open"] textarea, [data-state="open"] [contenteditable]').first();
    if (await editor.count() > 0) {
      await editor.fill('This is a test memory created to identify UX issues during the UI review cycle. I am testing how the interface handles longer content entry.');
    } else {
      // Fall back to generic textareas
      if (count > 0) {
        await textareas.first().fill('This is a test memory created to identify UX issues during the UI review cycle.');
      }
    }
    await screenshot(page, '08-memory-content-entered.png');
  });

  await step('Save memory', async () => {
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add Memory"), button[type="submit"]').first();
    await saveBtn.click();
    await page.waitForTimeout(2000);
    await screenshot(page, '09-after-save-memory.png');
    console.log(`  URL after save: ${page.url()}`);
  });

  await step('Create memory #2 - with photo', async () => {
    // Go back to book page and add another memory
    if (newBookId) {
      await page.goto(BASE + `/books/${newBookId}`);
      await page.waitForLoadState('networkidle');
    }
    const addBtn = page.locator('button:has-text("Add memory"), button:has-text("New Memory")').first();
    await addBtn.click();
    await page.waitForTimeout(800);
    await screenshot(page, '10-memory2-editor.png');
  });

  // Try to find the photo upload
  await step('Check photo upload UI', async () => {
    const uploadArea = page.locator('[data-upload], [aria-label*="photo"], [aria-label*="upload"], input[type="file"]');
    const count = await uploadArea.count();
    console.log(`  Upload elements: ${count}`);
    // Try to attach a test photo
    const fileInput = page.locator('input[type="file"]').first();
    const testPhotoPath = path.join(__dirname, 'test-photo.png');
    if (await fileInput.count() > 0 && fs.existsSync(testPhotoPath)) {
      await fileInput.setInputFiles(testPhotoPath);
      await page.waitForTimeout(1000);
      await screenshot(page, '11-photo-uploaded.png');
      console.log('  Photo upload triggered');
    } else {
      console.log('  No file input found, trying upload button');
      // Look for upload button
      const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Add photo"), button:has-text("Photo")').first();
      if (await uploadBtn.count() > 0) {
        console.log('  Found upload button');
      }
    }
  });

  // ── 5. EDIT EXISTING MEMORY ──────────────────────────────────────────
  await step('Edit existing memory', async () => {
    await page.waitForLoadState('networkidle');
    // Look for an edit button on a memory card
    const editBtns = page.locator('button:has-text("Edit"), [aria-label*="Edit"], [aria-label*="edit memory"]');
    const editCount = await editBtns.count();
    console.log(`  Edit buttons found: ${editCount}`);

    if (editCount > 0) {
      await editBtns.first().click();
      await page.waitForTimeout(800);
      await screenshot(page, '12-edit-memory.png');
    } else {
      console.log('  No edit button visible - checking memory cards');
      const cards = await page.locator('[class*="memory"], .rounded-2xl, .rounded-3xl').all();
      console.log(`  Cards found: ${cards.length}`);
    }
  });

  // ── 6. NAVIGATE TO LIBRARY ──────────────────────────────────────────
  await step('Check library page', async () => {
    await page.goto(BASE + '/dashboard'); // Library is on dashboard
    await page.waitForLoadState('networkidle');
    await screenshot(page, '13-dashboard-library.png');
    // Check if library section exists
    const libSection = await page.locator('text=/library|your books|books/i').count();
    console.log(`  Library-related elements: ${libSection}`);
  });

  // ── 7. CHECK RESPONSIVE ─────────────────────────────────────────────
  await step('Check mobile responsiveness', async () => {
    await ctx.close();
    const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const mobilePage = await mobileCtx.newPage();
    await mobilePage.goto(BASE + '/dashboard');
    await mobilePage.waitForLoadState('networkidle');
    await screenshot(mobilePage, '14-mobile-dashboard.png');
    await mobilePage.close();
  });

  // ── 8. FINAL SCREENSHOT PASS ────────────────────────────────────────
  await step('Final state - book detail page', async () => {
    await ctx.close();
    const finalCtx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const finalPage = await finalCtx.newPage();
    await finalPage.goto(BASE + `/books/${newBookId || '1'}`);
    await finalPage.waitForLoadState('networkidle');
    await finalPage.waitForTimeout(1000);
    await screenshot(finalPage, '15-final-book-page.png');
    await finalCtx.close();
  });

  await browser.close();

  // ── REPORT ──────────────────────────────────────────────────────────
  console.log('\n=== USAGE CYCLE RESULTS ===');
  console.log(`Passed: ${passed.length}`);
  console.log(`Failed: ${failed.length}`);
  if (failed.length > 0) {
    console.log('\nFailures:');
    failed.forEach(f => console.log(`  - ${f}`));
  }
  console.log(`\nScreenshots: ${SCREEN_DIR}`);
  console.log(`Console errors: ${errors.length}`);
  if (errors.length > 0) {
    errors.slice(0, 5).forEach(e => console.log(`  ERROR: ${e}`));
  }
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });