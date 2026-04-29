import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('explore memory creation flow', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  
  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  
  // Go to dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Click first book
  const firstBook = page.locator('a[href*="/books/"]').first();
  const bookUrl = await firstBook.getAttribute('href');
  console.log('Opening book:', bookUrl);
  
  await page.goto(`${BASE}${bookUrl}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/explore-01-book-detail.png', fullPage: true });
  
  // Click Add Memory in header
  const headerAddBtn = page.locator('a:has-text("Add Memory")').first();
  if (await headerAddBtn.count() > 0) {
    await headerAddBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/explore-02-memory-edit.png', fullPage: true });
    console.log('Memory edit page:', page.url());
    
    // Check form elements
    const inputs = await page.locator('input').count();
    const textareas = await page.locator('textarea').count();
    const buttons = await page.locator('button').count();
    console.log('Form elements - inputs:', inputs, 'textareas:', textareas, 'buttons:', buttons);
    
    // Look for title field
    const titleField = page.locator('input[id*="title"], input[placeholder*="title" i]').first();
    if (await titleField.count() > 0) {
      console.log('Title field found');
    }
    
    // Check for photo upload area
    const uploadArea = page.locator('[class*="upload"], [class*="drop"], [class*="photo"]').first();
    if (await uploadArea.count() > 0) {
      console.log('Upload area found');
    }
  }
  
  // Check pricing page
  await page.goto(`${BASE}/pricing`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/explore-03-pricing.png', fullPage: true });
  console.log('Pricing page captured');
  
  // Check upgrade page
  await page.goto(`${BASE}/upgrade`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/explore-04-upgrade.png', fullPage: true });
  console.log('Upgrade page captured');
  
  console.log('Edit flow exploration complete');
});
