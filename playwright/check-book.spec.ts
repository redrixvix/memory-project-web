import { test, expect } from '@playwright/test';

test('visit books directly via API', async ({ page }) => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  const dir = 'playwright/screens-cycle2/audit';
  
  // Login first
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Try visiting book 259 directly
  await page.goto('/books/259');
  await page.waitForLoadState('networkidle');
  console.log('After visiting /books/259:', page.url());
  await page.screenshot({ path: `${dir}/c-01-book259.png`, fullPage: false });
  
  // Try book 258
  await page.goto('/books/258');
  await page.waitForLoadState('networkidle');
  console.log('After visiting /books/258:', page.url());
  await page.screenshot({ path: `${dir}/c-02-book258.png`, fullPage: false });
  
  // Try book 255
  await page.goto('/books/255');
  await page.waitForLoadState('networkidle');
  console.log('After visiting /books/255:', page.url());
  await page.screenshot({ path: `${dir}/c-03-book255.png`, fullPage: false });
  
  // Check page content
  const body = await page.locator('body').textContent();
  console.log('Body preview:', body?.slice(0, 300));
});
