const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle9';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
  return p;
}

async function waitNet(page, ms = 1000) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🎯 UI Cycle 9 - Deep exploration and improvement...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await screenshot(page, '01-login');
  
  const emailInput = page.locator('#email').first();
  const passwordInput = page.locator('#password').first();
  await emailInput.fill(EMAIL);
  await passwordInput.fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in with password/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, '02-dashboard-post-login');
  console.log('  URL:', page.url());

  // ANALYZE DASHBOARD
  console.log('\n2️⃣ ANALYZE DASHBOARD');
  
  // Check book cards
  const bookCards = await page.locator('[class*="card"]').all();
  console.log('  Book cards found:', bookCards.length);
  
  for (let i = 0; i < Math.min(5, bookCards.length); i++) {
    const txt = await bookCards[i].textContent().catch(() => '');
    console.log(`  Card ${i+1}:`, txt.trim().slice(0, 80).replace(/\s+/g, ' '));
  }
  
  // Check for pagination
  const paginationBtns = await page.locator('button').filter({ hasText: /^\d+$/ }).all();
  console.log('  Pagination buttons:', paginationBtns.length);
  
  // Check for sort buttons
  const sortBtns = await page.locator('button').filter({ hasText: /newest|oldest|az|a-z/i }).all();
  console.log('  Sort buttons:', sortBtns.length);
  for (const btn of sortBtns) {
    const txt = await btn.textContent().catch(() => '');
    if (txt.trim()) console.log('    Sort:', txt.trim());
  }

  // NAVIGATE TO A BOOK
  console.log('\n3️⃣ BOOK DETAIL');
  const firstBookLink = page.locator('a[href*="/books/"]').filter({ hasText: /My Family|Family|Summer|Christmas|Life/i }).first();
  let bookUrl = '';
  
  if (await firstBookLink.isVisible().catch(() => false)) {
    await firstBookLink.click();
    await waitNet(page, 2000);
    await screenshot(page, '03-book-detail');
    bookUrl = page.url();
  } else {
    // Get first book URL
    const anyBookLink = page.locator('a[href*="/books/"]').first();
    const href = await anyBookLink.getAttribute('href').catch(() => '');
    if (href) {
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
      await waitNet(page, 2000);
      await screenshot(page, '03-book-detail');
      bookUrl = page.url();
    }
  }
  console.log('  Book URL:', bookUrl);

  // MEMORY EDITOR FLOW
  console.log('\n4️⃣ MEMORY EDITOR');
  // Click Add Memory
  const addMemoryBtn = page.locator('a[href*="/edit"], button').filter({ hasText: /add memory|write|new memory/i }).first();
  if (await addMemoryBtn.isVisible().catch(() => false)) {
    await addMemoryBtn.click();
    await waitNet(page, 2000);
    await screenshot(page, '04-memory-editor');
    console.log('  Editor URL:', page.url());
    
    // Check form elements
    const textareas = await page.locator('textarea').count();
    const inputs = await page.locator('input:not([type="hidden"])').count();
    const buttons = await page.locator('button').count();
    console.log('  Textareas:', textareas, 'Inputs:', inputs, 'Buttons:', buttons);
    
    // Look for prompt selector
    const promptSelect = page.locator('select, [role="combobox"], [aria-label*="prompt" i]').first();
    const hasPrompt = await promptSelect.isVisible().catch(() => false);
    console.log('  Has prompt selector:', hasPrompt);
    
    // Look for image upload
    const fileInputs = await page.locator('input[type="file"]').all();
    console.log('  File upload inputs:', fileInputs.length);
    for (let i = 0; i < fileInputs.length; i++) {
      const accept = await fileInputs[i].getAttribute('accept').catch(() => '');
      console.log(`    Input ${i+1} accept:`, accept || 'all files');
    }
    
    // Fill in content if textarea is visible
    const contentArea = page.locator('textarea').first();
    if (await contentArea.isVisible().catch(() => false)) {
      // Get the textarea label
      const parent = contentArea.locator('xpath=..');
      const labelText = await parent.locator('label, [id], [for]').first().textContent().catch(() => 'no label');
      console.log('  Content area label:', labelText);
      
      // Fill with meaningful content
      await contentArea.fill('Every Sunday after church, we gathered at Grandma\'s house. The smell of her homemade cinnamon rolls would drift through the screen door, mixing with the coffee brewing in her old percolator. Those afternoons felt endless in the best way — no rush, just family.');
      await screenshot(page, '05-memory-content-filled');
    }
    
    // Scroll down to check for all form fields
    await page.evaluate(() => window.scrollBy(0, 300));
    await waitNet(page, 300);
    await screenshot(page, '06-editor-scrolled');
    
    // Look for audio upload
    const audioLabel = page.locator('text=/audio|recording|sound/i').first();
    const hasAudio = await audioLabel.isVisible().catch(() => false);
    console.log('  Audio section visible:', hasAudio);
    
    // Check save button state
    const saveBtn = page.locator('button').filter({ hasText: /save|publish|add memory/i }).last();
    const saveDisabled = await saveBtn.isDisabled().catch(() => true);
    console.log('  Save button disabled:', saveDisabled);
  } else {
    // Navigate directly to editor
    const bookId = bookUrl.split('/books/')[1]?.split('?')[0] || '1';
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 1000);
    await screenshot(page, '04-memory-editor');
    console.log('  Editor URL:', page.url());
  }

  // GO BACK AND NAVIGATE TO LIBRARY
  console.log('\n5️⃣ LIBRARY PAGE');
  await page.goto(`${BASE_URL}/library`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '07-library');
  
  const libCards = await page.locator('[class*="card"], a[href*="memory"]').count();
  const libHeader = await page.locator('h1, h2').first().textContent().catch(() => '');
  console.log('  Library header:', libHeader.trim());
  console.log('  Memory/card elements:', libCards);

  // BOOK CREATION
  console.log('\n6️⃣ CREATE BOOK');
  await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '08-new-book-page');
  
  // Check form
  const titleInput = page.locator('#title, input[id*="title"]').first();
  const descInput = page.locator('textarea').first();
  const planSelect = page.locator('select').first();
  
  console.log('  Title input visible:', await titleInput.isVisible().catch(() => false));
  console.log('  Desc input visible:', await descInput.isVisible().catch(() => false));
  console.log('  Plan select visible:', await planSelect.isVisible().catch(() => false));
  
  if (await titleInput.isVisible()) {
    await titleInput.fill('Our Family Adventures');
    if (await descInput.isVisible()) {
      await descInput.fill('A collection of stories and memories from our family gatherings, holidays, and everyday moments that make us who we are.');
    }
    await screenshot(page, '09-book-form-filled');
    
    // Submit
    const createBtn = page.locator('button[type="submit"]').first();
    if (await createBtn.isVisible()) {
      await createBtn.click();
      await waitNet(page, 4000);
      await screenshot(page, '10-book-created');
      console.log('  After create URL:', page.url());
    }
  }

  // SETTINGS PAGE
  console.log('\n7️⃣ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '11-settings');
  
  const settingsItems = await page.locator('input, select, button').all();
  console.log('  Interactive elements:', settingsItems.length);

  // FINAL DASHBOARD VIEW
  console.log('\n8️⃣ FINAL DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '12-dashboard-final');

  // Check for any broken UI elements
  const allText = await page.locator('body').textContent().catch(() => '');
  const hasBrokenText = allText.includes('undefined') || allText.includes('null');
  console.log('  Has undefined/null text:', hasBrokenText);

  await browser.close();
  console.log('\n✅ Deep exploration complete');
  console.log('Screenshots:', SCREEN_DIR);
}

run().catch(e => { 
  console.error('❌ Error:', e.message); 
  console.error(e.stack);
  process.exit(1); 
});