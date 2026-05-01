import { test, expect } from '@playwright/test';

test('find and visit book detail with memories', async ({ page }) => {
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
  
  // Look for book card links (NOT dashboard nav)
  // Dashboard has a "Create your first book" link when empty
  // When populated, book cards are wrapped in links to /books/{id}
  // Use the book grid section specifically
  const bookGridLinks = page.locator('[class*="grid"] a[href*="/books/"]');
  const gridCount = await bookGridLinks.count();
  console.log('Grid book links:', gridCount);
  
  // Get all links with books pattern
  const allBookLinks = page.locator('a[href*="/books/"]');
  const allCount = await allBookLinks.count();
  console.log('All book links:', allCount);
  
  // Print href of first few
  for (let i = 0; i < Math.min(allCount, 5); i++) {
    const href = await allBookLinks.nth(i).getAttribute('href');
    console.log(`Link ${i}:`, href);
  }
  
  // Try second link (first might be logo/dashboard)
  if (allCount > 1) {
    const href2 = await allBookLinks.nth(1).getAttribute('href');
    console.log('Clicking:', href2);
    await allBookLinks.nth(1).click();
    await page.waitForLoadState('networkidle');
    console.log('URL after click:', page.url());
    
    // Check for memories  
    const chapters = await page.locator('text=Chapter').count();
    console.log('Chapters:', chapters);
    
    const emptyText = await page.locator('text=empty').count();
    console.log('Empty text:', emptyText);
    
    // Take screenshot
    await page.screenshot({ path: `${dir}/b-01-book-detail.png`, fullPage: true });
    console.log('📸 book detail');
    
    // Try to click Add Memory
    const addBtns = page.locator('a:has-text("Add Memory")');
    const addCount = await addBtns.count();
    console.log('Add Memory buttons:', addCount);
    
    if (addCount > 0) {
      await addBtns.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${dir}/b-02-editor.png`, fullPage: false });
      console.log('📸 editor');
    }
  }
});
