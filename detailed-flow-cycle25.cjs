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
    
    const screensDir = './screens/detailed-flow-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // 1. Full book creation + memory creation flow
    console.log('1. Testing full book creation flow...');
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    // Click New Book button
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    await newBookBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screensDir}/01-new-book-modal.png` });
    
    // Fill in book creation form
    await page.fill('input[id*="modal-title"], input[placeholder*="title"]', 'My Favorite Recipes');
    await page.screenshot({ path: `${screensDir}/02-book-title-filled.png` });
    
    // Submit
    const submitBtn = page.locator('#create-book-form button[type="submit"], form button:has-text("Create")').first();
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click();
      await page.waitForURL('**/books/**', { timeout: 10000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/03-new-book-created.png` });
    }
    
    // 2. Go back to dashboard and look at the book in the list
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-dashboard-with-new-book.png` });
    
    // 3. Go to upgrade page - check it
    await page.goto('http://localhost:3000/upgrade');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/05-upgrade-page.png` });
    
    // Get key info
    const headings = await page.locator('h1, h2').all();
    console.log('Upgrade page headings:');
    for (const h of headings) {
      const text = await h.textContent();
      console.log(' -', text?.trim().substring(0, 100));
    }
    
    // 4. Go to pricing
    await page.goto('http://localhost:3000/pricing');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/06-pricing-page.png` });
    
    console.log('Detailed flow complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
