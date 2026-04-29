import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('final comprehensive verification', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  
  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  
  // 1. Dashboard - capture full state
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/final-01-dashboard.png', fullPage: true });
  console.log('Dashboard done');
  
  // 2. Create book modal - verify CTA visible
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(1000);
  const titleInput = page.locator('#modal-title');
  await titleInput.fill('Test Book Verification');
  await page.waitForTimeout(500);
  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  const createVisible = await createBtn.isVisible();
  console.log('Create Book button visible:', createVisible);
  await page.screenshot({ path: 'screens/final-02-create-modal.png', fullPage: false });
  
  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);
  
  // 3. Book detail page - empty state
  const bookLink = page.locator('a[href*="/books/"]').first();
  const bookUrl = await bookLink.getAttribute('href');
  await page.goto(`${BASE}${bookUrl}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/final-03-book-empty.png', fullPage: true });
  console.log('Book detail empty state captured');
  
  // 4. Settings page
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/final-04-settings.png', fullPage: true });
  console.log('Settings captured');
  
  // 5. Memory creation flow - open edit page
  const addMemHeader = page.locator('a:has-text("Add Memory")').first();
  if (await addMemHeader.count() > 0) {
    await addMemHeader.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/final-05-memory-edit.png', fullPage: true });
    console.log('Memory edit page captured');
  }
  
  // 6. Create a real memory
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.fill('The summer of 2025 was one of the best of my life. We spent three weeks at my grandparents lake house, fishing and swimming every day.');
    await page.waitForTimeout(1000);
    
    const saveBtn = page.locator('button:has-text("Save Memory")');
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens/final-06-after-save.png', fullPage: true });
      console.log('Memory saved');
    }
  }
  
  console.log('Final verification complete');
});
