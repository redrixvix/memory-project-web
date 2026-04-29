const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3133';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-detailed-test';

// Generate a simple test PNG (1x1 pixel red)
function createTestPng() {
  // Simple 1x1 red PNG
  const png = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x18, 0xDD,
    0x8D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, // IEND
    0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  return png;
}

// Generate a small valid MP3 (silent/empty body - just headers)
function createTestMp3() {
  // Minimal valid MP3 frame (silence)
  const mp3Header = Buffer.from([
    0xFF, 0xFB, 0x90, 0x00, // MP3 frame header
  ]);
  // Pad with zeros to make it look like an audio file
  return Buffer.concat([mp3Header, Buffer.alloc(1000, 0)]);
}

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 800) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function scroll(page, by = 300) {
  await page.evaluate((y) => window.scrollBy(0, y), by);
  await page.waitForTimeout(200);
}

async function run() {
  console.log('🚀 Starting detailed UI flow test...\n');
  
  // Create test files
  const testPng = path.join(os.tmpdir(), 'test-memory-photo.png');
  const testMp3 = path.join(os.tmpdir(), 'test-voice.mp3');
  fs.writeFileSync(testPng, createTestPng());
  fs.writeFileSync(testMp3, createTestMp3());
  console.log('  Created test files:', testPng, testMp3);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

  // LOGIN
  console.log('\n1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(3500);
  await screenshot(page, '01-logged-in');
  console.log('  URL:', page.url());

  // GO TO DASHBOARD
  console.log('\n2️⃣ DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '02-dashboard');
  
  // Count books
  const bookCount = await page.locator('a[href*="/books/"]').count();
  console.log('  Book links:', bookCount);

  // CREATE A NEW BOOK
  console.log('\n3️⃣ CREATE NEW BOOK');
  const newBookBtn = page.locator('button:has-text("New Book")');
  if (await newBookBtn.isVisible().catch(() => false)) {
    await newBookBtn.click();
    await waitNet(page, 800);
    await screenshot(page, '03-create-modal');
    
    await page.locator('#modal-title').fill('Test Memory Book UI');
    await page.waitForTimeout(200);
    await screenshot(page, '04-title-filled');
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button:has-text("+ Create Book")').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await waitNet(page, 4000);
      await screenshot(page, '05-after-create');
      console.log('  New URL:', page.url());
    }
  }

  // We're now on the book edit page or book detail
  const currentUrl = page.url();
  console.log('  Current URL:', currentUrl);

  // If we're on /books/X/edit/book (settings), navigate to /books/X/edit
  if (currentUrl.includes('/edit/book')) {
    const bookId = currentUrl.split('/')[4];
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 1000);
    await screenshot(page, '06-on-memory-editor');
    console.log('  Navigated to memory editor');
  } else if (currentUrl.includes('/edit')) {
    await screenshot(page, '06-on-memory-editor');
    console.log('  Already on edit page');
  } else {
    console.log('  Unexpected URL, trying to navigate to memory editor');
    await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
    await waitNet(page, 1000);
    const bookLink = page.locator('a[href*="/books/"]').first();
    if (await bookLink.isVisible().catch(() => false)) {
      await bookLink.click();
      await waitNet(page, 2000);
      const addBtn = page.locator('a:has-text("Add Memory"), a:has-text("+ Add your first memory")').first();
      if (await addBtn.isVisible().catch(() => false)) {
        await addBtn.click();
        await waitNet(page, 2000);
      }
    }
  }

  await screenshot(page, '07-current-page');
  console.log('  Current URL:', page.url());

  // Check what page we're on and what the UI looks like
  const url = page.url();
  if (url.includes('/edit')) {
    console.log('\n4️⃣ MEMORY EDITOR DETECTED - Analyzing layout...');
    
    // Check for textarea
    const textareas = await page.locator('textarea').count();
    console.log('  Textareas found:', textareas);
    
    // Check for photo input
    const photoInputs = await page.locator('input[type="file"]').count();
    console.log('  File inputs found:', photoInputs);
    
    // Check for prompt dropdowns
    const selects = await page.locator('select').count();
    console.log('  Selects found:', selects);
    
    // Get page text content to understand the layout
    const bodyText = await page.locator('body').innerText();
    console.log('  Page has text content:', bodyText.length, 'chars');
    
    // Try to find submit button
    const submitBtns = await page.locator('button').all();
    for (const btn of submitBtns) {
      const text = await btn.innerText().catch(() => '');
      if (text.trim()) console.log('  Button:', text.trim().substring(0, 50));
    }
    
    await screenshot(page, '08-editor-full');
    
    // Try to fill in the memory form
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible().catch(() => false)) {
      console.log('\n5️⃣ FILLING MEMORY FORM');
      await textarea.fill('This summer we took a road trip through the Pacific Northwest. We started in Seattle, drove up to the San Juan Islands, and ended in Vancouver. Every stop along the way felt like discovering something new.');
      await waitNet(page, 500);
      await screenshot(page, '09-text-filled');
      
      // Scroll to see full form
      await scroll(page, 400);
      await screenshot(page, '10-form-scrolled');
      
      // Try to upload photo if input exists
      const photoInput = page.locator('input[type="file"]').first();
      if (await photoInput.isVisible().catch(() => false)) {
        console.log('\n6️⃣ UPLOADING PHOTO');
        await photoInput.setInputFiles(testPng);
        await waitNet(page, 2000);
        await screenshot(page, '11-photo-uploaded');
      }
      
      // Scroll down more to see save/submit button
      await scroll(page, 600);
      await screenshot(page, '12-form-bottom');
      
      // Find and click save
      const saveBtn = page.locator('button').filter({ hasText: /save|publish|add memory/i }).first();
      if (await saveBtn.isVisible().catch(() => false)) {
        console.log('\n7️⃣ SAVING MEMORY');
        await saveBtn.click();
        await waitNet(page, 5000);
        await screenshot(page, '13-after-save');
        console.log('  After save URL:', page.url());
      } else {
        console.log('  Save button not found');
        // Try to find the submit button in form
        const formSubmit = page.locator('form button[type="submit"]').first();
        if (await formSubmit.isVisible().catch(() => false)) {
          await formSubmit.click();
          await waitNet(page, 5000);
          await screenshot(page, '13-after-save');
        }
      }
    } else {
      console.log('  No textarea visible');
      await screenshot(page, '09-no-textarea');
    }
  } else {
    console.log('\n4️⃣ BOOK DETAIL PAGE - Analyzing...');
    const addBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await addBtn.isVisible().catch(() => false)) {
      console.log('  Found Add Memory button');
      await addBtn.click();
      await waitNet(page, 2000);
      await screenshot(page, '05-navigating-to-editor');
      console.log('  New URL:', page.url());
    }
  }

  // FINAL STATE CHECK
  console.log('\n8️⃣ FINAL STATE CHECK');
  await screenshot(page, '14-final-state');
  console.log('  Final URL:', page.url());
  
  const finalUrl = page.url();
  
  // If we saved and returned to book detail, check for memory cards
  if (finalUrl.includes('/books/') && !finalUrl.includes('/edit')) {
    await waitNet(page, 1000);
    await screenshot(page, '15-book-detail-final');
    
    // Check for memory elements
    const cardCount = await page.locator('[class*="card"]').count();
    console.log('  Card elements:', cardCount);
    
    // Scroll to see memory content
    await scroll(page, 500);
    await screenshot(page, '16-book-scrolled');
  }

  // GO TO SETTINGS PAGE
  console.log('\n9️⃣ SETTINGS PAGE');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 800);
  await screenshot(page, '17-settings');

  // BACK TO DASHBOARD
  console.log('\n🔟 DASHBOARD FINAL');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 800);
  await screenshot(page, '18-dashboard-final');

  // Summary
  console.log('\n📋 UI ANALYSIS SUMMARY:');
  console.log('  Final URL:', page.url());
  const newBookLinks = await page.locator('a[href*="/books/"]').count();
  console.log('  Book links visible:', newBookLinks);

  await browser.close();
  console.log('\n✅ Detailed test complete. Screenshots in:', SCREEN_DIR);
  
  // Clean up temp files
  try { fs.unlinkSync(testPng); } catch {}
  try { fs.unlinkSync(testMp3); } catch {}
}

run().catch(e => { console.error('❌ Error:', e.message); console.error(e.stack); process.exit(1); });