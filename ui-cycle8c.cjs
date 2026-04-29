const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

(async () => {
  const BASE = 'http://localhost:3133';
  const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle8c';
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

  // Book with memories - hero should NOT have Add Memory
  await page.goto(BASE + '/books/149');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'book-with-memories.png') });
  console.log('✓ Book with memories (should have 1 Add Memory in nav)');

  // Empty book - hero should show Add Memory
  await page.goto(BASE + '/books/235');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'empty-book-hero.png') });
  console.log('✓ Empty book hero');

  // Edit page - check save state behavior
  await page.goto(BASE + '/books/235/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'edit-initial-clean.png') });
  console.log('✓ Edit page initial state (no premature saving)');

  await page.locator('textarea').first().fill('A warm afternoon in the garden with the smell of fresh bread.');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'edit-with-content.png') });
  console.log('✓ Edit page with content');

  await browser.close();
  console.log('✓ All screenshots');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
