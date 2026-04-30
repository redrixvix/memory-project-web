const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  const screensDir = './screens/cycle26-verify';
  const { execSync } = require('child_process');
  execSync(`mkdir -p ${screensDir}`);
  
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.locator('button').filter({ hasText: /password/i }).first().click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Upgrade page
    await page.goto('http://localhost:3000/upgrade');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/upgrade-new-hero.png`, fullPage: true });
    
    // Check new headline is visible
    const headline = await page.locator('text=/Give your story a home that lasts/i').isVisible().catch(() => false);
    console.log('New headline visible:', headline);
    
    // Check old headline is gone
    const oldHeadline = await page.locator('text=/Choose a plan for your book/i').isVisible().catch(() => false);
    console.log('Old headline gone:', !oldHeadline);
    
    // Check new subtext
    const subtext = await page.locator('text=/Your stories deserve more than words/i').isVisible().catch(() => false);
    console.log('New subtext visible:', subtext);
    
    console.log('Verify complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
