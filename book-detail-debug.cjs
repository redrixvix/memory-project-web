const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-debug';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    const passwordBtn = page.locator('button').filter({ hasText: /password/i }).first();
    await passwordBtn.click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Get all book IDs from dashboard
    const bookCards = await page.locator('.book-card').all();
    console.log('Book cards found:', bookCards.length);
    
    // Get the links from each card
    for (let i = 0; i < Math.min(bookCards.length, 3); i++) {
      const link = await bookCards[i].locator('a').first();
      const href = await link.getAttribute('href');
      const cardText = await bookCards[i].textContent();
      console.log(`Card ${i+1}: href=${href}, text="${(cardText || '').substring(0, 80)}"`);
    }
    
    // Click first book card
    const firstHref = await bookCards[0].locator('a').first().getAttribute('href');
    console.log('Navigating to:', firstHref);
    
    await page.goto(`http://localhost:3000${firstHref}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/01-book-detail.png`, fullPage: true });
    
    // Check the page structure
    const bodyText = await page.locator('body').textContent();
    console.log('Page text length:', (bodyText || '').length);
    console.log('Page contains "memory":', (bodyText || '').toLowerCase().includes('memory'));
    console.log('Page contains "0 memories":', (bodyText || '').includes('0 memories'));
    console.log('Page contains "1 memory":', (bodyText || '').includes('1 memory'));
    console.log('Page contains memories:', (bodyText || '').toLowerCase().includes('memories'));
    
    // Look at the memories section
    const sections = await page.locator('section, div[class*="section"], main').all();
    console.log('Sections found:', sections.length);
    
    // Get all article elements
    const articles = await page.locator('article').all();
    console.log('Articles:', articles.length);
    
    // Look for any list of memories
    const memoryItems = await page.locator('[class*="memory"]').all();
    console.log('Memory class elements:', memoryItems.length);
    
    // Check if there's a loading state or empty state
    const emptyState = await page.locator('text=/empty|no memories|add your first/i').all();
    console.log('Empty state elements:', emptyState.length);
    
    const pageHTML = await page.content();
    // Check for memory list in HTML
    const hasMemoriesList = pageHTML.includes('memories-list') || pageHTML.includes('MemoryList') || pageHTML.includes('memory-list');
    console.log('Has memories-list class:', hasMemoriesList);
    
    // Look for grid containers
    const grids = await page.locator('[class*="grid"]').all();
    console.log('Grid elements:', grids.length);
    
    console.log('Book detail debug complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
