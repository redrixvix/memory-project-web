const { chromium } = require('./node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', 'd[,<(q<HC6V~MJvV');
    await page.fill('input[type="password"]', 'testpass123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Logged in');

    await page.waitForTimeout(1000);
    console.log('✓ Dashboard loaded');

    const bookLinks = await page.locator('a[href*="/books/"]').all();
    let bookDetailUrl = null;
    for (const link of bookLinks) {
      const href = await link.getAttribute('href');
      if (href && href.match(/\/books\/\d+$/)) {
        bookDetailUrl = href;
        break;
      }
    }

    if (bookDetailUrl) {
      await page.goto(`http://localhost:3000${bookDetailUrl}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      console.log('✓ Book detail loaded');
      
      const memoryCards = await page.locator('[class*="card"]').count();
      console.log(`✓ Cards found: ${memoryCards}`);

      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/explore32-book-detail.png', fullPage: false });
      console.log('✓ Screenshot saved');
    } else {
      console.log('⚠ No book detail link found');
    }

    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✓ Settings loaded');

    await page.goto('http://localhost:3000/upgrade', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('✓ Upgrade loaded');

    if (errors.length > 0) {
      console.log('\n⚠ Console errors:');
      errors.forEach(e => console.log('  ', e));
    } else {
      console.log('\n✓ No console errors');
    }

  } finally {
    await browser.close();
  }
})();
