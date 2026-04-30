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
    
    const screensDir = './screens/identify-highimpact';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Focus on book detail - click first book
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/book-detail-full.png` });
      
      // Hover over memory cards to see interactions
      const memoryCards = page.locator('[class*="memory"], [class*="card"]').all();
      console.log('Found', memoryCards.length, 'cards/elements');
      
      // Get all text content to understand the layout
      const headings = await page.locator('h1, h2, h3').all();
      for (const h of headings) {
        const text = await h.textContent();
        console.log('Heading:', text?.trim().substring(0, 100));
      }
      
      // Check the "Your story continues" section
      const pTags = await page.locator('p').all();
      for (const p of pTags) {
        const text = await p.textContent();
        if (text && text.length > 10 && text.length < 200) {
          console.log('Paragraph:', text.trim().substring(0, 150));
        }
      }
    }
    
    console.log('High impact analysis complete.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
