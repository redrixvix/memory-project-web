import { test, expect } from '@playwright/test';

test('explore dashboard settings pricing', async ({ page }) => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'playwright/screens-cycle2/explore-01-login.png', fullPage: false });
  
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'playwright/screens-cycle2/explore-02-dashboard.png', fullPage: false });
  
  const bookCount = await page.locator('a[href*="/books/"]').count();
  console.log('Books visible:', bookCount);
  
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'playwright/screens-cycle2/explore-03-settings.png', fullPage: false });
  
  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'playwright/screens-cycle2/explore-04-pricing.png', fullPage: false });
});
