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
    
    const screensDir = './screens/analyze-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Take screenshots of key pages
    await page.screenshot({ path: `${screensDir}/01-dashboard.png` });
    console.log('Dashboard captured');
    
    // Books page
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/02-books.png` });
    console.log('Books captured');
    
    // Click first book
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/03-book-detail.png` });
    }
    
    // Settings
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-settings.png` });
    
    // Upgrade page
    await page.goto('http://localhost:3000/upgrade');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/05-upgrade.png` });
    
    // Pricing page
    await page.goto('http://localhost:3000/pricing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/06-pricing.png` });
    
    console.log('All key pages captured.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
