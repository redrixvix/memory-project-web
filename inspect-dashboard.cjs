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
    
    const screensDir = './screens/inspect-dashboard';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    await page.screenshot({ path: `${screensDir}/01-dashboard.png` });
    
    // Get the HTML structure around the book cards
    // Look at the card content - what elements exist
    const cardElements = await page.locator('[class*="rounded"]').all();
    console.log('Elements with rounded class:', cardElements.length);
    
    // Get all paragraphs and spans to understand the card data
    const spans = await page.locator('span').all();
    console.log('Spans found:', spans.length);
    for (const s of spans) {
      const text = await s.textContent();
      if (text && text.trim().length > 0 && text.trim().length < 100) {
        const tag = await s.evaluate(e => e.tagName);
        const cls = await s.evaluate(e => e.className);
        console.log(`[${tag}] class="${cls.substring(0, 60)}" text="${text.trim().substring(0, 80)}"`);
      }
    }
    
    // Get all the links in book cards
    const bookCardLinks = await page.locator('a[href*="/books/"]').all();
    console.log('Book links:', bookCardLinks.length);
    
    console.log('Dashboard inspection complete.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
