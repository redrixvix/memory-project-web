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
    
    const screensDir = './screens/priority-check';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    await page.screenshot({ path: `${screensDir}/01-dashboard.png` });
    
    // Get the detailed structure of a book card
    const cards = await page.locator('[class*="rounded-2xl"]').all();
    console.log('Rounded-2xl elements:', cards.length);
    
    // Look at SVG elements - decorative accents
    const svgs = await page.locator('svg').all();
    console.log('SVG elements:', svgs.length);
    
    // Inspect the first book card more deeply
    const bookCardSection = await page.evaluate(() => {
      // Find the grid container with book cards
      const main = document.querySelector('main');
      if (!main) return 'No main found';
      
      const children = Array.from(main.querySelectorAll('*')).filter(el => {
        const text = el.textContent || '';
        return text.includes('memories') || text.includes('memory');
      });
      
      return children.map(el => {
        return `${el.tagName}: class="${el.className}" text="${(el.textContent || '').substring(0, 100)}"`;
      });
    });
    
    console.log('Memory-related elements:');
    bookCardSection.forEach(item => console.log(' -', item));
    
    // Get color info about book cards
    const cardStyles = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="rounded-2xl"]');
      return Array.from(cards).slice(0, 5).map((card, i) => {
        const style = window.getComputedStyle(card);
        return {
          index: i,
          bg: style.backgroundColor,
          border: style.border,
          borderRadius: style.borderRadius,
        };
      });
    });
    
    console.log('Card styles:', JSON.stringify(cardStyles, null, 2));
    
    console.log('Priority check complete.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
