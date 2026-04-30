const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle9';

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 1000) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🔍 Validating book edit improvements + full flow test...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, 'B01-logged-in');

  // GO TO BOOK 241 EDIT PAGE (the book we created)
  console.log('\n2️⃣ BOOK EDIT PAGE');
  await page.goto(`${BASE_URL}/books/241/edit/book`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, 'B02-book-edit-improved');
  
  // Check for character counters
  const titleCounter = await page.locator('text=/\\d+\\/120/').isVisible().catch(() => false);
  const descCounter = await page.locator('text=/\\d+\\/280/').isVisible().catch(() => false);
  const urlPreview = await page.locator('text=/memoryproject\\.com/').isVisible().catch(() => false);
  console.log('  Title counter visible:', titleCounter);
  console.log('  Description counter visible:', descCounter);
  console.log('  URL preview visible:', urlPreview);

  // Check focus states - click into title input
  const titleInput = page.locator('input[type="text"]').first();
  if (await titleInput.isVisible()) {
    await titleInput.click();
    await waitNet(page, 200);
    await screenshot(page, 'B03-title-input-focused');
    console.log('  Focused title input - border should be more prominent');
  }

  // CHECK DASHBOARD CARDS
  console.log('\n3️⃣ DASHBOARD CARD ANALYSIS');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'B04-dashboard-cards');
  
  // Count book cards
  const bookCards = await page.locator('[class*="card"]').all();
  console.log('  Book cards:', bookCards.length);
  
  // Check memory count badges
  const memoryBadges = await page.locator('text=/\\d+ memories?/i').all();
  console.log('  Memory count badges:', memoryBadges.length);
  for (const badge of memoryBadges.slice(0, 3)) {
    const txt = await badge.textContent().catch(() => '');
    console.log('    Badge:', txt.trim());
  }

  // TEST COMPLETE MEMORY FLOW
  console.log('\n4️⃣ FULL MEMORY FLOW');
  // Go to "Our Wedding Story" book (id 243)
  await page.goto(`${BASE_URL}/books/243`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'B05-wedding-book');
  
  // Add memory
  const addBtn = page.locator('a').filter({ hasText: /add memory/i }).first();
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click();
  } else {
    await page.goto(`${BASE_URL}/books/243/edit`, { waitUntil: 'networkidle' });
  }
  await waitNet(page, 2000);
  await screenshot(page, 'B06-wedding-editor');
  
  // Fill with content
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill('The day you walked into my life is the day I stopped being afraid of the future. Not because I knew what would happen — but because I finally had someone to figure it out with.');
    await waitNet(page, 300);
    await screenshot(page, 'B07-wedding-memory-filled');
    
    // Save
    const saveBtn = page.locator('button').filter({ hasText: /save/i }).last();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await waitNet(page, 5000);
      await screenshot(page, 'B08-wedding-memory-saved');
      console.log('  After save URL:', page.url());
    }
  }

  // FINAL CHECK - SETTINGS
  console.log('\n5️⃣ SETTINGS PAGE');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, 'B09-settings');
  
  // Check form fields
  const inputs = await page.locator('input:not([type="hidden"])').count();
  const selects = await page.locator('select').count();
  console.log('  Inputs:', inputs, 'Selects:', selects);

  // FINAL DASHBOARD
  console.log('\n6️⃣ FINAL DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'B10-dashboard-final');

  await browser.close();
  console.log('\n✅ Validation complete');
  console.log('Screenshots:', SCREEN_DIR);
}

run().catch(e => { 
  console.error('❌ Error:', e.message); 
  console.error(e.stack);
  process.exit(1); 
});