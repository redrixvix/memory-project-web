const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-mobile';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.locator('button').filter({ hasText: /password/i }).first().click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Dashboard mobile
    await page.screenshot({ path: `${screensDir}/01-dash-mobile.png`, fullPage: true });
    
    // Books list
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/02-books-mobile.png`, fullPage: true });
    
    // First book detail
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/03-bookdetail-mobile.png`, fullPage: true });
      
      // Add memory
      const addMem = page.locator('a[href*="/edit"]').first();
      if (await addMem.isVisible({ timeout: 3000 })) {
        await addMem.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/04-editor-mobile.png`, fullPage: true });
        
        // Scroll down to see save bar and media section
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/05-editor-mobile-scroll.png`, fullPage: true });
      }
    }
    
    console.log('Mobile check complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
