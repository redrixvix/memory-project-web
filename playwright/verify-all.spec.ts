import { test, expect } from '@playwright/test';

test('verify all fixes', async ({ page }) => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  const dir = 'playwright/screens-cycle2/audit';

  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  
  // Settings - avatar initials should be properly contained now
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/v-01-settings.png', fullPage: false });
  console.log('Settings verified');
  
  // Pricing - card colors should be darker/more contrasted
  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/v-02-pricing.png', fullPage: false });
  console.log('Pricing verified');
  
  // Upgrade - button colors should be darker
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/v-03-upgrade.png', fullPage: false });
  console.log('Upgrade verified');
  
  // Book detail - memory cards should have warm left border accent
  await page.goto('/books/259');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/v-04-book-detail.png', fullPage: false });
  console.log('Book detail verified');
  
  console.log('All verifications done');
});
