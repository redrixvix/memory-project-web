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
    
    // Settings page - scroll to Privacy section
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    
    // Scroll to privacy section
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screensDir}/settings-privacy.png`, fullPage: true });
    
    // Check new coming soon badge
    const badge = await page.locator('text=/Coming soon/i').isVisible().catch(() => false);
    console.log('"Coming soon" badge visible:', badge);
    
    console.log('Verify complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
