import { test, expect } from '@playwright/test';

test('audit key UX flows with screenshots', async ({ page }) => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  const dir = 'playwright/screens-cycle2/audit';
  const fs = require('fs');
  try { fs.mkdirSync(dir, { recursive: true }); } catch {}
  const snap = (n: number) => page.screenshot({ path: `${dir}/a-${String(n).padStart(2,'0')}.png`, fullPage: false }).then(() => console.log(`📸 a-${String(n).padStart(2,'0')}`));

  // Login
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  await snap(1);
  
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await snap(2);

  // Dashboard - check empty state / book grid
  // Try to find a book with memories to see full memory detail
  const bookLinks = page.locator('a[href*="/books/"]');
  const count = await bookLinks.count();
  console.log('Book links found:', count);
  
  // Navigate to first book
  if (count > 0) {
    await bookLinks.first().click();
    await page.waitForLoadState('networkidle');
    await snap(3);
    
    // Scroll down to see full page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await snap(4);
  }

  // Navigate to settings and check layout
  await page.goto('/settings');
  await page.waitForLoadState('networkidle');
  await snap(5);
  
  // Check pricing page
  await page.goto('/pricing');
  await page.waitForLoadState('networkidle');
  await snap(6);

  // Check upgrade page
  await page.goto('/upgrade');
  await page.waitForLoadState('networkidle');
  await snap(7);
  
  // Go to editor with a book that has memories
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');
  if (count > 0) {
    await bookLinks.first().click();
    await page.waitForLoadState('networkidle');
    
    // Click "Add Memory"
    const addBtn = page.locator('a:has-text("Add Memory")').first();
    if (await addBtn.isVisible({ timeout: 3000 })) {
      await addBtn.click();
      await page.waitForLoadState('networkidle');
      await snap(8);
    }
  }
});
