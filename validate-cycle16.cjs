const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // Login first
  console.log('Logging in...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  const emailInput = await page.$('input[type="email"]');
  if (emailInput) {
    await emailInput.fill('RedRixvix@proton.me');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Logged in');
  }

  // Check 1: Dashboard empty state description
  console.log('\n--- CHECK 1: Dashboard empty state ---');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');
  
  // Find "Start writing" buttons and check nearby text
  const cards = await page.$$('.book-card');
  console.log(`Found ${cards.length} book cards`);
  
  // Take screenshot of first page
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/validate-01-dashboard.png', fullPage: false });
  console.log('✓ Dashboard screenshot saved');

  // Check 2: Book detail empty state prompt chips contrast
  console.log('\n--- CHECK 2: Book detail empty state ---');
  await page.goto('http://localhost:3000/books/155');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/validate-02-book-empty.png', fullPage: false });
  console.log('✓ Book empty state screenshot saved');

  // Check 3: Editor - should have only ONE submit button in main content area
  console.log('\n--- CHECK 3: Editor save buttons ---');
  await page.goto('http://localhost:3000/books/155/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/validate-03-editor-top.png', fullPage: false });
  
  // Check sticky save bar
  const stickyBar = await page.$('.sticky.bottom-0');
  if (stickyBar) {
    const stickyBarText = await stickyBar.textContent();
    console.log('Sticky bar found:', stickyBarText?.substring(0, 100));
  }

  // Count submit buttons in the main content area (not in sticky bar)
  const submitButtons = await page.$$('button[type="submit"]');
  console.log(`Total submit buttons on page: ${submitButtons.length}`);
  
  // Scroll and check bottom of editor
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/validate-04-editor-bottom.png', fullPage: false });
  console.log('✓ Editor bottom screenshot saved');

  await browser.close();
  console.log('\n✅ Validation complete!');
})();