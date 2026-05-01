import { test, expect } from '@playwright/test';

test('verify settings avatar fix and pricing cards', async ({ page }) => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  const dir = 'playwright/screens-cycle2/audit';

  // Login
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Settings page - check avatar
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/fix-01-settings.png', fullPage: false });
  console.log('Settings screenshot done');

  // Pricing page - check cards
  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/fix-02-pricing.png', fullPage: false });
  console.log('Pricing screenshot done');

  // Upgrade page
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/fix-03-upgrade.png', fullPage: false });
  console.log('Upgrade screenshot done');
});
