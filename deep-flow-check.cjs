const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-deep-flow';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // LOGIN
    console.log('=== FLOW: LOGIN ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    const passwordBtn = page.locator('button').filter({ hasText: /password/i }).first();
    await passwordBtn.click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/01-login-success.png`, fullPage: true });
    
    // DASHBOARD
    console.log('=== FLOW: DASHBOARD ===');
    await page.screenshot({ path: `${screensDir}/02-dashboard.png`, fullPage: true });
    
    // Check dashboard interaction: hover a book card
    const firstCard = page.locator('.book-card').first();
    if (await firstCard.isVisible({ timeout: 3000 })) {
      await firstCard.hover();
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${screensDir}/03-card-hover.png` });
    }
    
    // BOOKS PAGE
    console.log('=== FLOW: BOOKS PAGE ===');
    await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-books-page.png`, fullPage: true });
    
    // BOOK DETAIL
    console.log('=== FLOW: BOOK DETAIL ===');
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/05-book-detail.png`, fullPage: true });
      
      // Check if memories list is visible
      const memories = await page.locator('article').all();
      console.log('Memory articles on book detail:', memories.length);
    }
    
    // MEMORY EDITOR (create new memory)
    console.log('=== FLOW: MEMORY EDITOR ===');
    const addMemBtn = page.locator('a[href*="/edit"]').first();
    if (await addMemBtn.isVisible({ timeout: 2000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/06-memory-editor.png`, fullPage: true });
      
      // Type some content
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('This is a beautiful spring morning. The flowers are blooming and the air smells wonderful.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/07-memory-typing.png`, fullPage: true });
        
        // Check word count
        const wordCount = await page.locator('text=/\\d+ words/').first().textContent().catch(() => 'not found');
        console.log('Word count display:', wordCount);
      }
    }
    
    // SETTINGS
    console.log('=== FLOW: SETTINGS ===');
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/08-settings.png`, fullPage: true });
    
    // UPGRADE PAGE
    console.log('=== FLOW: UPGRADE ===');
    await page.goto('http://localhost:3000/upgrade', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/09-upgrade.png`, fullPage: true });
    
    // PRICING
    console.log('=== FLOW: PRICING ===');
    await page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/10-pricing.png`, fullPage: true });
    
    // FAQ
    console.log('=== FLOW: FAQ ===');
    await page.goto('http://localhost:3000/faq', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/11-faq.png`, fullPage: true });
    
    // SIGNUP (logged out view)
    console.log('=== FLOW: SIGNUP ===');
    await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/12-signup.png`, fullPage: true });
    
    // LOGGED OUT HOME
    console.log('=== FLOW: LOGGED OUT HOME ===');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/13-home-anon.png`, fullPage: true });
    
    // Now log back in and try a full memory creation flow
    console.log('=== FULL MEMORY CREATE FLOW ===');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    const pBtn2 = page.locator('button').filter({ hasText: /password/i }).first();
    await pBtn2.click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Navigate to first book and create a memory
    const booksLink = page.locator('a[href="/books"]').first();
    await booksLink.click();
    await page.waitForTimeout(2000);
    
    const firstBook = page.locator('a[href*="/books/"]').first();
    await firstBook.click();
    await page.waitForTimeout(2000);
    
    const editLink = page.locator('a[href*="/edit"]').first();
    if (await editLink.isVisible({ timeout: 3000 })) {
      await editLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/14-editor-new-memory.png`, fullPage: true });
      
      // Select a prompt
      const promptSelect = page.locator('select').first();
      if (await promptSelect.isVisible({ timeout: 2000 })) {
        await promptSelect.selectOption({ index: 2 }).catch(() => {});
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/15-prompt-selected.png`, fullPage: true });
      }
      
      // Fill memory content
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 2000 })) {
        await textarea.fill('The morning light filtered through the kitchen window as I made breakfast. Something about the way the steam rose from the pan made everything feel peaceful and perfect.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/16-memory-filled.png`, fullPage: true });
        
        // Check word count updates
        const wc = await page.locator('text=/\\d+/').all();
        console.log('WC elements:', wc.length);
      }
      
      // Submit the memory
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/17-memory-submitted.png`, fullPage: true });
        
        // Wait for redirect back to book
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${screensDir}/18-after-submit-redirect.png`, fullPage: true });
        console.log('Current URL after submit:', page.url());
      }
    }
    
    console.log('All deep flows complete!');
  } catch(e) {
    console.error('Error:', e.message);
    try { await page.screenshot({ path: `${screensDir}/error.png` }); } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
