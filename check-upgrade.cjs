const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  const screensDir = './screens/cycle26-upgrade';
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
  
  // Upgrade page (logged in)
  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `${screensDir}/01-upgrade.png`, fullPage: true });
  
  // Pricing page
  await page.goto('http://localhost:3000/pricing');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/02-pricing.png`, fullPage: true });
  
  // FAQ page
  await page.goto('http://localhost:3000/faq');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/03-faq.png`, fullPage: true });
  
  // Try clicking the "Begin with Premium" button (will go to login if logged out)
  const premiumBtn = page.locator('button').filter({ hasText: /Begin with Premium/i }).first();
  if (await premiumBtn.isVisible({ timeout: 2000 })) {
    await premiumBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-after-premium-click.png`, fullPage: true });
    console.log('Clicked premium button, URL:', page.url());
  }
  
  console.log('Upgrade check complete!');
  await browser.close();
})();
