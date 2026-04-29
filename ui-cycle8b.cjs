const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const BASE = 'http://localhost:3133';
  const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle8b';
  fs.mkdirSync(SCREEN_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Login
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('✓ Logged in');

  // Test the book detail empty state UX
  // Navigate to book 149 - which has the "Start your memory book" empty state
  // Actually find a book without memories
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Find a book card and click it
  const bookLinks = await page.locator('a[href^="/books/"]').evaluateAll(els => els.map(el => el.getAttribute('href')));
  console.log('Book links found:', bookLinks.length);

  // Go to each book and check for empty state
  for (const link of bookLinks.slice(0, 4)) {
    await page.goto(BASE + link);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    const hasEmptyState = await page.locator('text=Start your memory book').count();
    if (hasEmptyState > 0) {
      console.log(`Empty state found at ${link}`);
      await page.screenshot({ path: path.join(SCREEN_DIR, `empty-state-${link.replace('/books/', '')}.png`) });
      break;
    }
  }

  // Test dashboard book cards quality
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'dashboard-cards.png') });
  console.log('✓ Dashboard cards');

  // Test settings page
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'settings-page.png') });
  console.log('✓ Settings page');

  await browser.close();
  console.log('✓ Screenshots captured');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
