const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✓ Logged in');
  
  // Dashboard - check book cards render
  await page.waitForTimeout(1500);
  const bookCards = await page.$$('.book-card');
  console.log(`✓ Dashboard: ${bookCards.length} book cards found`);
  
  // Click on first book card to go to book detail
  if (bookCards.length > 0) {
    await bookCards[0].click();
    await page.waitForTimeout(2000);
    const url = page.url();
    console.log(`✓ Navigated to book detail: ${url}`);
    
    // Check memories section
    const heroTitle = await page.$('h1');
    if (heroTitle) {
      const title = await heroTitle.textContent();
      console.log(`✓ Book title: "${title}"`);
    }
    
    // Navigate to settings
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✓ Settings loaded');
  }
  
  if (errors.length > 0) {
    console.log('Console errors found:', errors.slice(0, 3));
  } else {
    console.log('✓ No console errors across all pages');
  }
  
  await browser.close();
  console.log('✓ Full flow test complete!');
})().catch(e => { console.error('Test failed:', e.message); process.exit(1); });
