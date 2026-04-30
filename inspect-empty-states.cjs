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
    
    const screensDir = './screens/inspect-empty-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Create a new empty book
    await page.goto('http://localhost:3000/books/new');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/01-new-book-form.png` });
    
    // Fill in the form
    await page.fill('input[id*="title"]', 'Test Empty Book');
    await page.fill('textarea[id*="description"]', 'A book to test empty states');
    
    // Click create
    const createBtn = page.locator('button[type="submit"]').first();
    await createBtn.click();
    await page.waitForURL('**/books/**', { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/02-new-book-detail.png` });
    
    // Now go to dashboard to see empty state
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/03-dashboard.png` });
    
    // Navigate to settings
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-settings.png` });
    
    // Get HTML structure of book detail to understand what's there
    const bookDetailHTML = await page.content();
    // Look for elements with "empty" or "no memories"
    const emptyElements = await page.locator('*:has-text("No memories"), *:has-text("empty"), *:has-text("start writing"), *:has-text("Your story")').all();
    for (const el of emptyElements) {
      const text = await el.textContent();
      const tag = await el.evaluate(e => e.tagName);
      console.log(`[${tag}]:`, text?.trim().substring(0, 200));
    }
    
    console.log('Empty state inspection complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
