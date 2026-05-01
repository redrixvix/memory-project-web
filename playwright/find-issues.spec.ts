import { test, expect } from '@playwright/test';

test('find highest impact UX issues', async ({ page }) => {
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
  
  // Navigate to book with memories
  await page.goto('/books/255');
  await page.waitForLoadState('networkidle');
  
  // Scroll to see memory cards
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(300);
  await page.screenshot({ path: dir + '/issue-01-memory-cards.png', fullPage: false });
  
  // Hover over a memory card
  const card = page.locator('[class*="rounded-2xl"][class*="overflow-hidden"]').nth(2);
  if (await card.isVisible({ timeout: 2000 })) {
    await card.hover();
    await page.waitForTimeout(300);
    await page.screenshot({ path: dir + '/issue-02-memory-card-hover.png', fullPage: false });
  }
  
  // Check the editor - focus the textarea
  await page.goto('/books/255/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: dir + '/issue-03-editor-loaded.png', fullPage: false });
  
  // Click into textarea
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 2000 })) {
    await textarea.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: dir + '/issue-04-editor-textarea-focused.png', fullPage: false });
    
    // Type some text
    await textarea.fill('This is a beautiful memory from my childhood that I will never forget. The morning light was golden and the house smelled like fresh bread.');
    await page.waitForTimeout(500);
    await page.screenshot({ path: dir + '/issue-05-editor-text-typed.png', fullPage: false });
  }
  
  // Scroll down to see save bar
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: dir + '/issue-06-editor-save-bar.png', fullPage: false });
  
  // Test empty book
  await page.goto('/books/258');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: dir + '/issue-07-empty-book.png', fullPage: false });
  
  console.log('Done');
});
