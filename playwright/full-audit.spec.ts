import { test, expect } from '@playwright/test';

test('full premium UX audit', async ({ page }) => {
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
  await page.screenshot({ path: `${dir}/01-dashboard.png`, fullPage: false });
  
  // Visit book 255 which has memories
  await page.goto('/books/255');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/02-book-detail-memories.png`, fullPage: false });
  
  // Scroll down to see all memories
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${dir}/03-book-detail-scrolled.png`, fullPage: false });
  
  // Navigate to editor for this book
  await page.goto('/books/255/edit');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/04-editor.png`, fullPage: false });
  
  // Check settings page
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/05-settings.png`, fullPage: false });
  
  // Pricing page
  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/06-pricing.png`, fullPage: false });
  
  // Upgrade page
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/07-upgrade.png`, fullPage: false });
  
  // Login page check
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${dir}/08-login.png`, fullPage: false });
  
  console.log('All screenshots captured');
});
