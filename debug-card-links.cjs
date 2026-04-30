const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-debug2';
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
    
    // The card IS the anchor link, so click it directly
    const card = page.locator('.book-card').first();
    const cardHref = await card.getAttribute('href');
    console.log('Card href:', cardHref);
    
    // Or find the links inside
    const cardHTML = await card.innerHTML();
    console.log('Card HTML (first 500):', cardHTML.substring(0, 500));
    
    // Get all links on the page
    const allLinks = await page.locator('a').all();
    const bookLinks = allLinks.filter(async (l) => {
      const href = await l.getAttribute('href');
      return href && href.includes('/books/');
    });
    console.log('All links:', allLinks.length);
    
    // Try getting the card link
    const cardLink = page.locator('.book-card').first();
    const tag = await cardLink.evaluate(el => el.tagName);
    console.log('Card tag:', tag);
    
    // Get the parent anchor
    const parentLink = await page.locator('.book-card').first().locator('xpath=..').getAttribute('href').catch(() => 'none');
    console.log('Parent link:', parentLink);
    
    // Find ALL anchor tags that contain /books/
    const bookAnchors = await page.locator('a[href*="/books/"]').all();
    console.log('Book anchors:', bookAnchors.length);
    for (const a of bookAnchors) {
      const href = await a.getAttribute('href');
      const cls = await a.getAttribute('class');
      console.log(`  anchor: class="${cls?.substring(0, 50)}" href="${href}"`);
    }
    
    console.log('Debug complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
