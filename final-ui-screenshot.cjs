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
    
    const screensDir = './screens/final-ui-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Capture all key pages in full detail
    console.log('Capturing dashboard...');
    await page.screenshot({ path: `${screensDir}/01-dashboard.png`, fullPage: true });
    
    console.log('Capturing book detail...');
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/02-book-detail.png`, fullPage: true });
    }
    
    console.log('Capturing memory editor...');
    const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
    if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
      await addMemoryBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/03-memory-editor.png`, fullPage: true });
    }
    
    console.log('Capturing settings...');
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-settings.png`, fullPage: true });
    
    console.log('Capturing upgrade...');
    await page.goto('http://localhost:3000/upgrade');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/05-upgrade.png`, fullPage: true });
    
    console.log('Capturing pricing...');
    await page.goto('http://localhost:3000/pricing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/06-pricing.png`, fullPage: true });
    
    console.log('All screenshots captured!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
