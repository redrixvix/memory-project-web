import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('book detail page - check for duplicate Add Memory buttons', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  
  // Go to dashboard and find first book
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Look for any book card with a CTA button
  const bookCTA = page.locator('a[href*="/books/"]').first();
  const hasBooks = await bookCTA.count() > 0;
  console.log('Has book links on dashboard:', hasBooks);
  
  if (hasBooks) {
    const href = await bookCTA.getAttribute('href');
    console.log('First book href:', href);
    
    if (href) {
      await page.goto(`${BASE}${href}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      await page.screenshot({ path: 'screens/cycle-book-detail.png', fullPage: true });
      console.log('Book detail page captured');
      
      // Count Add Memory buttons
      const addMemoryButtons = page.locator('button:has-text("Add Memory"), a:has-text("Add Memory")');
      const count = await addMemoryButtons.count();
      console.log('Add Memory button count:', count);
    }
  }
  
  // Check tasks page
  await page.goto(`${BASE}/tasks`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/cycle-tasks-page.png', fullPage: true });
  console.log('Tasks page captured');
  
  // Check library page  
  await page.goto(`${BASE}/library`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/cycle-library-page.png', fullPage: true });
  console.log('Library page captured');
});
