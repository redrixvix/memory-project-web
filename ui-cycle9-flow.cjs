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
}

async function waitNet(page, ms = 1000) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🎯 UI Cycle 9 - Testing complete memory and book flows...\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await screenshot(page, 'A01-login');
  
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, 'A02-post-login');
  console.log('  URL:', page.url());

  // GO TO A BOOK THAT HAS MEMORIES
  console.log('\n2️⃣ FIND A BOOK WITH MEMORIES');
  // Find book with memories from dashboard
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('  Total book links on dashboard:', bookLinks.length);
  
  // Look for a book with memory count
  const memoryCountText = await page.locator('text=/\\d+ memories?/i').all();
  for (const el of memoryCountText.slice(0, 3)) {
    const txt = await el.textContent().catch(() => '');
    console.log('  Memory text:', txt.trim());
  }
  
  // Click first book that has memories
  const bookWithMemories = page.locator('a[href*="/books/"]').filter({ hasText: /1 memory|2 memories|3 memories/i }).first();
  if (await bookWithMemories.isVisible().catch(() => false)) {
    await bookWithMemories.click();
  } else {
    // Just click any book
    await page.locator('a[href*="/books/"]').first().click();
  }
  await waitNet(page, 2500);
  await screenshot(page, 'A03-book-detail');
  console.log('  Book URL:', page.url());
  
  // Check memory count
  const memoryCards = await page.locator('[class*="memory-card"], [class*="card"]').all();
  console.log('  Memory/memory cards on page:', memoryCards.length);

  // EDIT MEMORY FLOW
  console.log('\n3️⃣ EDIT/ADD MEMORY IN BOOK');
  const addMemoryLink = page.locator('a[href*="/edit"]').filter({ hasText: /add memory/i }).first();
  if (await addMemoryLink.isVisible().catch(() => false)) {
    await addMemoryLink.click();
  } else {
    // Try clicking the Add Memory button in header
    const headerAddBtn = page.locator('a').filter({ hasText: /add memory/i }).first();
    if (await headerAddBtn.isVisible().catch(() => false)) {
      await headerAddBtn.click();
    } else {
      // Navigate directly
      const bookId = page.url().split('/books/')[1]?.split('?')[0] || '1';
      await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    }
  }
  await waitNet(page, 2000);
  await screenshot(page, 'A04-memory-editor');
  console.log('  Editor URL:', page.url());

  // Fill in memory
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill('The summer I turned twelve, my grandfather taught me to fish in the lake behind his house. We woke before dawn, and the mist was still rising off the water when he handed me my first rod. "Patience," he said, "is the only skill you need." We caught nothing that morning, but he made me breakfast anyway — eggs from his neighbor\'s chickens and toast with his own jam. It remains one of the happiest mornings I can remember.');
    await screenshot(page, 'A05-memory-text-entered');
    console.log('  Memory text entered');
  }
  
  // Scroll and look at full form
  await page.evaluate(() => window.scrollBy(0, 400));
  await waitNet(page, 300);
  await screenshot(page, 'A06-editor-form');
  
  // Check for all inputs and buttons
  const allBtns = await page.locator('button').all();
  console.log('  Buttons in editor:', allBtns.length);
  for (const btn of allBtns.slice(0, 8)) {
    const txt = await btn.textContent().catch(() => '');
    if (txt.trim()) console.log('    Button:', txt.trim().slice(0, 60));
  }
  
  // Check select elements (for prompts)
  const selects = await page.locator('select').all();
  console.log('  Select elements:', selects.length);
  for (const sel of selects) {
    const id = await sel.getAttribute('id').catch(() => '');
    const cls = await sel.getAttribute('class').catch(() => '');
    console.log('    Select id:', id, 'class:', cls.slice(0, 50));
  }

  // LOOK AT BOOK EDIT FORM (book details)
  console.log('\n4️⃣ BOOK EDIT PAGE');
  // Navigate to book edit
  const bookId = page.url().split('/books/')[1]?.split('/')[0]?.split('?')[0] || '1';
  await page.goto(`${BASE_URL}/books/${bookId}/edit/book`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'A07-book-edit');
  console.log('  Book edit URL:', page.url());
  
  const inputs = await page.locator('input, textarea').all();
  console.log('  Inputs on book edit:', inputs.length);

  // CREATE BRAND NEW BOOK WITH MEMORY
  console.log('\n5️⃣ CREATE NEW BOOK WITH MEMORY');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  
  // Click New Book button
  const newBookBtn = page.locator('button').filter({ hasText: /new book/i }).first();
  if (await newBookBtn.isVisible().catch(() => false)) {
    await newBookBtn.click();
    await waitNet(page, 1000);
    await screenshot(page, 'A08-create-modal');
    
    // Fill modal
    const modalTitle = page.locator('#modal-title').first();
    if (await modalTitle.isVisible().catch(() => false)) {
      await modalTitle.fill('Our Wedding Story');
      const modalDesc = page.locator('#modal-desc').first();
      if (await modalDesc.isVisible().catch(() => false)) {
        await modalDesc.fill('The story of our wedding day and the moments that made it uniquely ours.');
      }
      await screenshot(page, 'A09-modal-filled');
      
      // Submit
      const createBtn = page.locator('button[type="submit"]').first();
      if (await createBtn.isVisible().catch(() => false)) {
        await createBtn.click();
        await waitNet(page, 5000);
        await screenshot(page, 'A10-new-book-created');
        console.log('  After create URL:', page.url());
        
        const newBookId = page.url().split('/books/')[1]?.split('/')[0] || '';
        
        // Now go to edit to add a memory
        await page.goto(`${BASE_URL}/books/${newBookId}/edit`, { waitUntil: 'networkidle' });
        await waitNet(page, 1500);
        await screenshot(page, 'A11-new-book-editor');
        
        const textArea = page.locator('textarea').first();
        if (await textArea.isVisible().catch(() => false)) {
          await textArea.fill('The moment I saw you walking down the aisle, everything else faded. The noise of the guests, the June heat, even the small tear in my dress — none of it mattered. You were there, and everything was exactly as it should be.');
          await screenshot(page, 'A12-new-memory-filled');
          
          // Save
          const saveBtn = page.locator('button').filter({ hasText: /save|publish|add/i }).last();
          if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click();
            await waitNet(page, 5000);
            await screenshot(page, 'A13-memory-saved');
            console.log('  After save URL:', page.url());
          }
        }
      }
    }
  } else {
    console.log('  New Book button not visible, trying direct navigation');
    await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, 'A08-create-page-direct');
  }

  // FINAL VERIFICATION
  console.log('\n6️⃣ FINAL VERIFICATION');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'A14-dashboard-final');
  
  // Check for the new book
  const newBookVisible = await page.locator('text=/Our Wedding Story/i').isVisible().catch(() => false);
  console.log('  New book "Our Wedding Story" visible on dashboard:', newBookVisible);

  await browser.close();
  console.log('\n✅ Complete flow test done');
  console.log('Screenshots:', SCREEN_DIR);
}

run().catch(e => { 
  console.error('❌ Error:', e.message); 
  console.error(e.stack);
  process.exit(1); 
});