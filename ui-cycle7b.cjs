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
async function screenshot(page, name) {
  await page.screenshot({ path: path.join(SCREEN_DIR, name), fullPage: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const errors = [];

  // ── LOGIN ──────────────────────────────────────────────────────────────
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));

  console.log('=== Logging in ===');
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await screenshot(page, '01-dashboard.png');

  // ── FIND A BOOK TO TEST ─────────────────────────────────────────────
  const bookLinks = await page.locator('a[href^="/books/"]').all();
  const bookHrefs = await Promise.all(bookLinks.map(l => l.getAttribute('href')));
  const testBookId = bookHrefs.find(h => !h.includes('preview') && !h.includes('edit')) || '/books/1';
  console.log(`Testing book: ${testBookId}`);

  // ── GO TO BOOK DETAIL ──────────────────────────────────────────────
  await page.goto(BASE + testBookId);
  await page.waitForLoadState('networkidle');
  await screenshot(page, '02-book-detail.png');

  // Count Add Memory button
  const addMemoryBtns = await page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').all();
  console.log(`Add Memory buttons: ${addMemoryBtns.length}`);

  // ── NAVIGATE TO EDIT PAGE (MEMORY CREATION) ────────────────────────
  const addMemoryLink = page.locator(`a[href*="/edit"]`).first();
  const editHref = await addMemoryLink.getAttribute('href');
  console.log(`Edit page href: ${editHref}`);
  
  await page.goto(BASE + editHref);
  await page.waitForLoadState('networkidle');
  await screenshot(page, '03-edit-page.png');

  // Check prompt selector
  const promptSelect = page.locator('select').first();
  const promptOptions = await promptSelect.locator('option').all();
  console.log(`Prompt options: ${promptOptions.length}`);

  // Check textarea
  const textarea = page.locator('textarea').first();
  const textareaCount = await textarea.count();
  console.log(`Textarea present: ${textareaCount > 0}`);

  // ── CREATE MEMORY WITH TEXT ────────────────────────────────────────
  console.log('\n=== Creating Memory ===');
  
  // Pick a prompt
  const promptOptions_all = await promptSelect.locator('option').allTextContents();
  console.log(`First few prompts: ${promptOptions_all.slice(0, 4).join(', ')}`);
  
  // Select "Start writing freely" option (first option)
  await promptSelect.selectOption({ index: 0 });
  await page.waitForTimeout(300);

  // Fill textarea
  const testMemory = `This is a test memory written during the UI review cycle. It contains some actual content that simulates what a real user would write. We're testing the interface to find friction points and improve the overall experience. The goal is to make this feel premium, warm, and emotionally resonant — like a $5,000 custom product.`;
  
  await textarea.fill(testMemory);
  await page.waitForTimeout(500);
  await screenshot(page, '04-memory-text-filled.png');

  // Check word count badge
  const wordBadge = await page.locator('text=/\\d+ word/').count();
  console.log(`Word count badge visible: ${wordBadge > 0}`);

  // ── ADD PHOTO (if available) ─────────────────────────────────────
  console.log('\n=== Testing Photo Upload ===');
  
  // Check if we can add photos (premium check)
  const addPhotosBtn = page.locator('label:has-text("Add photos"), input[type="file"][accept*="image"]').first();
  const addPhotosCount = await addPhotosBtn.count();
  console.log(`Add photos available: ${addPhotosCount > 0}`);
  
  if (addPhotosCount > 0) {
    const testPhotoPath = path.join(__dirname, 'test-photo.png');
    if (fs.existsSync(testPhotoPath)) {
      const fileInput = page.locator('input[type="file"][accept*="image"]').first();
      await fileInput.setInputFiles(testPhotoPath);
      await page.waitForTimeout(2000);
      await screenshot(page, '05-photo-uploaded.png');
      
      // Check if photo appears in gallery
      const gallery = await page.locator('[class*="gallery"], [class*="photo"]').count();
      console.log(`Gallery elements: ${gallery}`);
    }
  } else {
    // Check if premium upgrade prompt is shown
    const upgradePrompt = await page.locator('text=/Upgrade|premium/i').count();
    console.log(`Upgrade prompt visible: ${upgradePrompt > 0}`);
    await screenshot(page, '05-no-photo-upgrade-prompt.png');
  }

  // ── ADD AUDIO (if available) ──────────────────────────────────────
  console.log('\n=== Testing Audio Upload ===');
  
  const audioInput = page.locator('input[type="file"][accept*="audio"]').first();
  const audioInputCount = await audioInput.count();
  console.log(`Audio input available: ${audioInputCount > 0}`);

  if (audioInputCount > 0) {
    const testAudioPath = path.join(__dirname, 'test-audio.mp3');
    if (fs.existsSync(testAudioPath)) {
      await audioInput.setInputFiles(testAudioPath);
      await page.waitForTimeout(2000);
      await screenshot(page, '06-audio-uploaded.png');
      console.log('Audio uploaded successfully');
    }
  }

  // ── SAVE MEMORY ───────────────────────────────────────────────────
  console.log('\n=== Saving Memory ===');
  
  // Find the Save Memory button (in sticky bar or inline)
  const saveBtn = page.locator('button[type="submit"]:has-text("Save Memory"), button:has-text("Save Memory")').first();
  const saveBtnCount = await saveBtn.count();
  console.log(`Save button found: ${saveBtnCount > 0}`);
  
  if (saveBtnCount > 0) {
    const isDisabled = await saveBtn.isDisabled();
    console.log(`Save button disabled: ${isDisabled}`);
    
    if (!isDisabled) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await screenshot(page, '07-after-save.png');
      console.log(`URL after save: ${page.url()}`);
    }
  }

  // ── GO BACK TO BOOK ──────────────────────────────────────────────
  await page.goto(BASE + testBookId);
  await page.waitForLoadState('networkidle');
  await screenshot(page, '08-book-with-memory.png');
  
  // Check if memory card is visible
  const memoryCards = await page.locator('[class*="memory"], [class*="card"]').all();
  console.log(`Memory cards on book page: ${memoryCards.length}`);

  // ── EDIT EXISTING MEMORY ─────────────────────────────────────────
  console.log('\n=== Editing Memory ===');
  
  // Look for edit buttons
  const editButtons = await page.locator('button:has-text("Edit"), a:has-text("Edit"), [aria-label*="edit"]').all();
  console.log(`Edit buttons found: ${editButtons.length}`);
  
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await page.waitForLoadState('networkidle');
    await screenshot(page, '09-memory-edit-page.png');
    
    // Check if content is pre-filled
    const editorText = await textarea.inputValue();
    console.log(`Editor has pre-filled content: ${editorText.length > 0}`);
  }

  // ── SETTINGS PAGE CHECK ──────────────────────────────────────────
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await screenshot(page, '10-settings.png');

  // ── MOBILE CHECK ────────────────────────────────────────────────
  console.log('\n=== Mobile Check ===');
  await ctx.close();
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobilePage = await mobileCtx.newPage();
  
  await mobilePage.goto(BASE + '/dashboard');
  await mobilePage.waitForLoadState('networkidle');
  await screenshot(mobilePage, '11-mobile-dashboard.png');
  
  // Test book detail on mobile
  await mobilePage.goto(BASE + testBookId);
  await mobilePage.waitForLoadState('networkidle');
  await screenshot(mobilePage, '12-mobile-book-detail.png');
  
  // Mobile edit page
  await mobilePage.goto(BASE + editHref);
  await mobilePage.waitForLoadState('networkidle');
  await screenshot(mobilePage, '13-mobile-edit-page.png');
  
  await mobileCtx.close();
  await browser.close();

  // ── REPORT ───────────────────────────────────────────────────────
  console.log('\n=== UX FRICTION REPORT ===');
  console.log(`Errors: ${errors.length}`);
  errors.slice(0, 10).forEach(e => console.log(`  ERR: ${e}`));
  console.log(`\nScreenshots: ${SCREEN_DIR}`);
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });