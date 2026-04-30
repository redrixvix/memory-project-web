const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
  const screensDir = './screens/explore-cycle25';
  const { execSync } = require('child_process');
  execSync(`mkdir -p ${screensDir}`);
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    // Login first
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    const passwordBtn = page.locator('button').filter({ hasText: /Sign in with password/i }).first();
    await passwordBtn.click();
    await page.waitForTimeout(1000);
    await page.fill('input[type="password"]', PASSWORD);
    const signInBtn = page.locator('button[type="submit"]').filter({ hasText: /Sign in/i }).first();
    await signInBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/01-dashboard.png` });
    
    // 2. Check books page
    console.log('2. Navigating to books...');
    const booksLink = page.locator('a[href="/books"]').first();
    if (await booksLink.isVisible()) {
      await booksLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/02-books.png` });
    }
    
    // 3. Look for a book to enter
    console.log('3. Looking for books...');
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    const count = bookLinks.length;
    console.log('Found', count, 'book links');
    
    if (count > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/03-book-detail.png` });
    }
    
    // 4. Try to add a memory
    console.log('4. Looking for Add Memory button...');
    const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
    if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
      console.log('Found Add Memory button');
      await addMemoryBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/04-memory-form.png` });
    }
    
    // 5. Fill memory text
    console.log('5. Filling memory text...');
    const textareas = await page.locator('textarea').all();
    if (textareas.length > 0) {
      const memText = 'This morning was absolutely perfect. The sun was streaming through the kitchen window and I could smell the fresh coffee brewing. These are the moments I want to remember forever - the simple, quiet ones that make life so beautiful.';
      await textareas[0].fill(memText);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screensDir}/05-memory-filled.png` });
    }
    
    console.log('Done - exploring memory creation flow.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
