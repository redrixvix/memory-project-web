const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const BASE = 'http://localhost:3133';
  const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle8-final';
  fs.mkdirSync(SCREEN_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('✓ Logged in');

  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'edit-page-no-premature-saving.png') });
  console.log('✓ Edit page - clean initial state');

  await page.locator('textarea').fill('Golden autumn light filtered through the kitchen window.');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'edit-page-with-saved-indicator.png') });
  console.log('✓ Edit page - saved indicator');

  await page.goto(BASE + '/books/149');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'book-no-duplicate-add-memory.png') });
  console.log('✓ Book - no redundant hero Add Memory');

  await page.goto(BASE + '/books/235');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'empty-book-hero-add-memory.png') });
  console.log('✓ Empty book - hero Add Memory');

  await browser.close();
  console.log('\n✓ All final screenshots captured');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
