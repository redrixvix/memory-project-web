import { test, expect } from '@playwright/test';

test('book detail with memories', async ({ page }) => {
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
  
  // Get all book links from dashboard
  const bookLinks = page.locator('a[href*="/books/"]');
  const count = await bookLinks.count();
  console.log('Books found:', count);
  
  // Click a book to check if it has memories
  if (count > 0) {
    // Try first book
    await bookLinks.first().click();
    await page.waitForLoadState('networkidle');
    
    // Check URL 
    console.log('URL:', page.url());
    
    // Check for memory count in footer
    const footerText = await page.locator('[class*="footer"], [class*="memory"]').allTextContents();
    console.log('Some text:', footerText.slice(0,5).join(' | '));
    
    // Check if there are "Chapter" elements (memory cards) 
    const chapters = await page.locator('text=Chapter').count();
    console.log('Chapters found:', chapters);
    
    // Check empty state vs populated state
    const emptyState = await page.locator('text=Start your memory book').count();
    console.log('Empty state visible:', emptyState);
    
    // If empty, click "Add your first memory" 
    const firstMemoryBtn = page.locator('text=Add your first memory');
    if (await firstMemoryBtn.isVisible({ timeout: 2000 })) {
      console.log('Empty book - clicking Add your first memory');
      await firstMemoryBtn.click();
      await page.waitForLoadState('networkidle');
      console.log('Editor URL:', page.url());
    }
  }
});
