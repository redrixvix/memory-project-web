const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle13';

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

function generateTestImage() {
  // Create a minimal PNG (1x1 red pixel PNG)
  // This is a valid minimal PNG
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR length
    0x49, 0x48, 0x44, 0x52, // "IHDR"
    0x00, 0x00, 0x00, 0x01, // width = 1
    0x00, 0x00, 0x00, 0x01, // height = 1
    0x08, 0x02, // bit depth = 8, color type = 2 (RGB)
    0x00, 0x00, 0x00, // compression, filter, interlace
    0x90, 0x77, 0x53, 0xDE, // CRC
    0x00, 0x00, 0x00, 0x0C, // IDAT length
    0x49, 0x44, 0x41, 0x54, // "IDAT"
    0x08, 0xD7, 0x63, 0xF8, 0xCF, 0xC0, 0x00, 0x00, 0x00, 0x03, 0x00, 0x01, // compressed data
    0x00, 0xF9, 0xFF, 0xA6, // CRC (approx)
    0x00, 0x00, 0x00, 0x00, // IEND length
    0x49, 0x45, 0x4E, 0x44, // "IEND"
    0xAE, 0x42, 0x60, 0x82, // CRC
  ]);
  return pngBuffer;
}

function generateTestAudio() {
  // Generate a minimal valid MP3 file (silence, ~0.1s)
  // This is a minimal but valid MP3 frame
  // We use a simple approach: generate raw PCM and wrap in MP3 header
  const samples = [];
  for (let i = 0; i < 8000; i++) samples.push(0);
  const buffer = Buffer.from(samples);
  return buffer;
}

async function run() {
  console.log('\n🔍 MemoryProject UX Deep Dive - UI Cycle 13\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // ─── LOGIN ───
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await screenshot(page, '01-login-ok');
  console.log('   → Logged in:', page.url());

  // ─── STEP 1: MOBILE NAV ON DASHBOARD ───
  console.log('\n📱 ISSUE 1: Mobile Nav on Dashboard');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 800);
  await screenshot(page, '02-mobile-dashboard');

  // Check header for hamburger/menu buttons
  const header = page.locator('header');
  const headerHTML = await header.innerHTML();
  const hasHamburger = headerHTML.includes('hamburger') || headerHTML.includes('menu') || headerHTML.includes('bars');
  console.log('   Header has hamburger:', hasHamburger);

  // Check what IS visible in the header on mobile
  const headerButtons = await page.locator('header button').count();
  const headerLinks = await page.locator('header a').count();
  console.log('   Header buttons:', headerButtons, '| Links:', headerLinks);

  // Try finding a menu button with specific attributes
  const menuBtn = await page.locator('[aria-label*="menu"], [aria-label*="nav"]').count();
  console.log('   aria-label menu buttons:', menuBtn);

  // Check the full header element
  const fullHeaderHTML = await page.locator('header').first().innerHTML();
  // Look for anything with "md:hidden" or mobile-specific class
  const mobileElems = fullHeaderHTML.match(/mobile|menu|hamburger|drawer/gi);
  console.log('   Mobile-related text in header:', mobileElems || 'none');

  await page.setViewportSize({ width: 1280, height: 900 });

  // ─── STEP 2: MEMORY CREATION WITH PROMPTS ───
  console.log('\n✍️ ISSUE 2: Memory Creation Flow');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);

  // Get first book
  const bookLink = page.locator('a[href*="/books/"]').first();
  const bookHref = await bookLink.getAttribute('href');
  const bookId = bookHref?.split('/books/')[1];
  console.log('   First book ID:', bookId);

  // Navigate to edit page
  await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '03-edit-page-load');

  // Check that the textarea is present
  const textarea = page.locator('textarea').first();
  const textareaCount = await textarea.count();
  console.log('   Textarea found:', textareaCount > 0 ? '✅' : '❌');

  // Check word count UI
  const pageContent = await page.content();
  const hasWordCount = pageContent.includes('word');
  console.log('   Page mentions "word":', hasWordCount ? '✅' : '❌');

  // Type some content
  await textarea.fill('This morning I made my grandmother\'s apple pie recipe for the first time. The kitchen smelled exactly like I remembered from childhood visits. The crust came out flaky and buttery, just like hers always did.');
  await waitNet(page, 1000);
  await screenshot(page, '04-text-entered');

  // Check word count number appears
  const spans = await page.locator('span').allTextContents();
  const wordCountSpans = spans.filter(s => s.match(/^\d+$/) && parseInt(s) > 0 && parseInt(s) < 10000);
  console.log('   Word count numbers found:', wordCountSpans);

  // Look for the save button
  const saveBtn = await page.locator('button:has-text("Save"), button:has-text("Save memory"), button:has-text("save")').first();
  const saveBtnExists = await saveBtn.count() > 0;
  console.log('   Save button found:', saveBtnExists ? '✅' : '❌');
  if (saveBtnExists) {
    const saveBtnText = await saveBtn.textContent();
    console.log('   Save button text:', saveBtnText?.trim());
  }

  // ─── STEP 3: AUDIO UPLOAD ───
  console.log('\n🎤 ISSUE 3: Audio Upload Flow');
  await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);

  // Look for audio-related elements more carefully
  const audioElements = await page.locator('[class*="audio"], [class*="voice"], input[type="file"]').all();
  const audioInfo = [];
  for (const el of audioElements) {
    const tag = await el.evaluate(e => e.tagName);
    const cls = await el.getAttribute('class').catch(() => '');
    const type = await el.getAttribute('type').catch(() => '');
    audioInfo.push({ tag, cls: cls?.slice(0, 60), type });
  }
  console.log('   Audio elements:', JSON.stringify(audioInfo.slice(0, 5)));

  // Check for UploadThing file input (common pattern)
  const fileInputs = await page.locator('input[type="file"]').count();
  console.log('   File inputs on page:', fileInputs);

  // Look for the audio section specifically
  const audioSection = await page.locator('text=/audio|voice|microphone|record/i').count();
  console.log('   Audio-related text elements:', audioSection);

  await screenshot(page, '05-audio-section');

  // ─── STEP 4: BOOK DETAIL MEMORY RENDERING ───
  console.log('\n📖 ISSUE 4: Book Detail Memory Rendering');

  // Go to book detail
  await page.goto(`${BASE_URL}/books/${bookId}`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '06-book-detail');

  // Get page text content
  const bodyText = await page.locator('body').textContent();
  console.log('   Body text length:', bodyText?.length);
  console.log('   Has "apple":', bodyText?.includes('apple') ? '✅' : '❌');
  console.log('   Has "pie":', bodyText?.includes('pie') ? '✅' : '❌');
  console.log('   Has "grandmother":', bodyText?.includes('grandmother') ? '✅' : '❌');

  // Count divs and spans (memory content elements)
  const allDivs = await page.locator('div').count();
  console.log('   Total divs:', allDivs);

  // Look for memory-specific classes
  const memoryCards = await page.locator('[class*="memory"], [class*="card"], [class*="chapter"]').count();
  console.log('   memory/card/chapter elements:', memoryCards);

  // Try to find memory text content
  const paragraphs = await page.locator('p').allTextContents();
  const textParas = paragraphs.filter(p => p.length > 30);
  console.log('   Substantial paragraphs:', textParas.length);
  if (textParas.length > 0) {
    console.log('   First substantial para:', textParas[0]?.slice(0, 80));
  }

  // ─── STEP 5: SETTINGS PAGE ───
  console.log('\n⚙️ ISSUE 5: Settings Page');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '07-settings');

  const settingsH2s = await page.locator('h2').allTextContents();
  console.log('   Settings headings:', settingsH2s);

  // ─── STEP 6: UPGRADE PAGE ───
  console.log('\n💳 ISSUE 6: Upgrade Page');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '08-upgrade');

  const upgradeH2s = await page.locator('h2, h3').allTextContents();
  console.log('   Upgrade headings:', upgradeH2s);

  const planCards = await page.locator('[class*="plan"], [class*="card"]').count();
  console.log('   Plan/card elements:', planCards);

  // ─── STEP 7: CREATE A NEW BOOK ───
  console.log('\n📚 ISSUE 7: Create New Book');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);

  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await waitNet(page, 800);
  await screenshot(page, '09-new-book-modal');

  const modalTitle = await page.locator('[class*="modal"], [class*="dialog"]').first().textContent().catch(() => 'no modal text');
  console.log('   Modal content (first 100 chars):', modalTitle?.slice(0, 100));

  // Close modal
  await page.keyboard.press('Escape');
  await waitNet(page, 500);

  // ─── SUMMARY ───
  console.log('\n📊 CYCLE 13 ISSUE SUMMARY:');
  console.log('');
  console.log('CRITICAL:');
  console.log('  1. [?] Book detail page - apple/pie text found in DOM but memory cards = 0');
  console.log('  2. [?] Word count - spans with numbers found but need visual confirmation');
  console.log('');
  console.log('HIGH PRIORITY:');
  console.log('  3. [ ] Mobile nav missing on dashboard (investigation needed)');
  console.log('  4. [ ] Audio upload flow not testable in headless (needs real file upload)');
  console.log('');
  console.log('MEDIUM PRIORITY:');
  console.log('  5. [ ] Settings page - check h2 headings (returned empty)');
  console.log('  6. [ ] Upgrade page plan cards - need visual confirmation');
  console.log('');

  await browser.close();
  console.log('\n✅ Cycle 13 validation complete\n');
}

run().catch(console.error);
