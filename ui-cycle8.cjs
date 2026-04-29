const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const BASE = 'http://localhost:3133';
  const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle8';
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

  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, '01-dashboard.png') });
  console.log('✓ Dashboard screenshot');

  // Go to the book detail page
  const bookLink = page.locator('a[href^="/books/"]').first();
  const bookUrl = await bookLink.getAttribute('href');
  await page.goto(BASE + bookUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, '02-book-detail.png') });
  console.log('✓ Book detail screenshot');

  // Find a book with memories to check the saved indicator issue
  // Navigate to edit page and check initial state
  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000); // Wait to see if "Saving..." appears without typing
  await page.screenshot({ path: path.join(SCREEN_DIR, '03-edit-page-initial.png') });
  console.log('✓ Edit page initial state (checking for premature Saving indicator)');

  // Type some content
  const textarea = page.locator('textarea').first();
  await textarea.fill('Testing the memory entry flow one more time. This is a test memory to verify the save state behavior.');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREEN_DIR, '04-edit-page-filled.png') });
  console.log('✓ Edit page with content');

  // Go back to dashboard
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, '05-dashboard-again.png') });
  console.log('✓ Dashboard again');

  await browser.close();
  console.log('✓ All screenshots captured');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
