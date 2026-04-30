const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];
  const OUT = 'screens-cycle17';
  
  const fs = require('fs');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  async function capture(name) {
    const path = `${OUT}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push(path);
    console.log(`📸 ${name}`);
  }

  // === LOGIN ===
  console.log('\n=== LOGIN ===');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await capture('01_login_page');
  
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000);
  await capture('02_dashboard_loaded');

  // === DASHBOARD ANALYSIS ===
  console.log('\n=== DASHBOARD ANALYSIS ===');
  
  const cardEls = await page.$$('[class*="card"]');
  console.log('Cards found:', cardEls.length);
  
  // Get page structure
  const bodyText = await page.evaluate(() => document.body.innerText.slice(0, 500));
  console.log('Body text:', bodyText.replace(/\n+/g, ' ').slice(0, 300));

  // === BOOK DETAIL + CREATE MEMORY FLOW ===
  console.log('\n=== BOOK DETAIL PAGE + MEMORY CREATION ===');
  
  // Get first book card link
  const bookLink = await page.$('[class*="card"] a[href*="/books/"]');
  if (bookLink) {
    const href = await bookLink.getAttribute('href');
    console.log('Navigating to book:', href);
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await capture('03_book_detail_page');
    
    // Now click "Add Memory" button
    const addMemoryBtn = await page.$('a[href*="/edit"]');
    if (addMemoryBtn) {
      const editHref = await addMemoryBtn.getAttribute('href');
      console.log('Clicking Add Memory:', editHref);
      await page.goto(`http://localhost:3000${editHref}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      await capture('04_memory_editor_page');
      
      // Check editor structure
      const textarea = await page.$('textarea');
      console.log('Textarea found:', !!textarea);
      
      // Try to fill memory content
      if (textarea) {
        await textarea.fill('This is a test memory about a wonderful summer afternoon spent with family. We had barbecue, played games, and watched the sunset together.');
        await page.waitForTimeout(500);
        await capture('05_memory_content_filled');
        
        // Try to select a prompt
        const promptSelect = await page.$('select');
        if (promptSelect) {
          console.log('Prompt select found');
          await capture('06_prompt_select');
        }
        
        // Check for save/publish button
        const saveBtn = await page.$('button[type="submit"]');
        if (saveBtn) {
          const btnText = await saveBtn.textContent();
          console.log('Submit button:', btnText?.slice(0, 50));
        }
      }
    }
  }

  // === EDITOR PAGE (book 152 directly) ===
  console.log('\n=== EDITOR PAGE ===');
  await page.goto('http://localhost:3000/books/152/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await capture('07_editor_152');
  
  // Check URL and look for editor
  console.log('Current URL:', page.url());
  
  // Get the full page content for analysis
  const editorContent = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    const editor = document.querySelector('[class*="editor"]');
    const proseMirror = document.querySelector('.ProseMirror');
    const selects = document.querySelectorAll('select');
    const btns = document.querySelectorAll('button');
    return {
      hasTextarea: !!textarea,
      hasEditor: !!editor,
      hasProseMirror: !!proseMirror,
      selectCount: selects.length,
      buttonCount: btns.length,
      buttonTexts: Array.from(btns).map(b => b.textContent?.trim()).filter(Boolean).slice(0, 20)
    };
  });
  console.log('Editor analysis:', JSON.stringify(editorContent, null, 2));

  // === SETTINGS PAGE ===
  console.log('\n=== SETTINGS PAGE ===');
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('08_settings_page');

  // === BOOKS LIST ===
  console.log('\n=== BOOKS LIST ===');
  await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('09_books_list');
  
  const bookCards = await page.$$('[class*="book"], [class*="card"]');
  console.log('Book cards:', bookCards.length);

  // === FINAL ERRORS CHECK ===
  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length) {
    errors.slice(0, 10).forEach(e => console.log('ERROR:', e.slice(0, 200)));
  } else {
    console.log('No console errors');
  }
  
  console.log('\n=== SCREENSHOTS SAVED ===');
  screenshots.forEach(s => console.log(s));
  
  console.log('\n=== TOTAL ERRORS:', errors.length, '===');

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
