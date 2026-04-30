const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
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
    
    const screensDir = './screens/real-usage-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // 1. Go to books page
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/01-books-page.png` });
    
    // 2. Go to a specific book with memories (Summer Vacation 2024)
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    let foundBook = false;
    for (const link of bookLinks) {
      const href = await link.getAttribute('href');
      if (href && href !== '/books' && !href.includes('/new')) {
        await link.click();
        await page.waitForTimeout(3000);
        const url = page.url();
        console.log('Book detail URL:', url);
        
        // Check if this book has memories
        const memoriesSection = page.locator('h2:has-text("Your Memories")');
        if (await memoriesSection.isVisible({ timeout: 2000 })) {
          console.log('This book has memories!');
          foundBook = true;
          await page.screenshot({ path: `${screensDir}/02-book-with-memories.png` });
          
          // 3. Click on a memory card to see detail view
          const memoryCards = page.locator('[class*="Card"]').all();
          console.log('Memory cards found:', memoryCards.length);
          
          break;
        } else {
          // Go back
          await page.goBack();
          await page.waitForTimeout(2000);
        }
      }
    }
    
    // 4. Check the settings page
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/03-settings-page.png` });
    
    // 5. Check the book edit page (not memory editor, but book settings)
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    const bookLinks2 = await page.locator('a[href*="/books/"]').all();
    for (const link of bookLinks2) {
      const href = await link.getAttribute('href');
      if (href && href !== '/books' && !href.includes('/new') && !href.includes('/edit') && !href.includes('/preview')) {
        await link.click();
        await page.waitForTimeout(2000);
        
        // Look for edit book button
        const editBtn = page.locator('a[href*="/edit/book"], a[href*="edit/book"]').first();
        if (await editBtn.isVisible({ timeout: 2000 })) {
          await editBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${screensDir}/04-book-edit-page.png` });
          break;
        } else {
          await page.goBack();
          await page.waitForTimeout(2000);
        }
        break;
      }
    }
    
    console.log('Real usage flow complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
