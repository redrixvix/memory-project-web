import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test.describe('Premium UI Cycle - Real Usage', () => {

  test('01 - login and dashboard', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-01-dashboard.png', fullPage: true });
  });

  test('02 - create a book via modal', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-02-dashboard-ready.png', fullPage: true });

    // Click "Create Book" button
    const createBtn = page.locator('button:has-text("Create Book"), button:has-text("New Book"), button:has-text("create")').first();
    if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await createBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: 'screens/ui-cycle/screen-03-create-modal.png', fullPage: true });

      // Fill in book title
      const titleInput = page.locator('#modal-title, input[id*="title"]').first();
      if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await titleInput.fill('Test Book April 2026');
        await page.screenshot({ path: 'screens/ui-cycle/screen-04-book-title-filled.png', fullPage: true });

        // Submit
        const submitBtn = page.locator('button[type="submit"]:has-text("Create"), button:has-text("Create Book")').first();
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screens/ui-cycle/screen-05-book-created.png', fullPage: true });
        }
      }
    }
  });

  test('03 - navigate to book detail and add memory', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Click first book card
    const bookCard = page.locator('[class*="cursor-pointer"], [class*="book-card"]').first();
    if (await bookCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookCard.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens/ui-cycle/screen-06-book-detail.png', fullPage: true });

      // Click Add Memory button
      const addMemoryBtn = page.locator('a:has-text("Add your first memory"), a:has-text("Add Memory"), button:has-text("Add Memory")').first();
      if (await addMemoryBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addMemoryBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screens/ui-cycle/screen-07-memory-form.png', fullPage: true });
      }
    }
  });

  test('04 - fill memory form with text', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    // Go to first book
    await page.goto(BASE + '/dashboard');
    await page.waitForTimeout(1000);
    const bookCard = page.locator('[class*="cursor-pointer"]').first();
    if (await bookCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookCard.click();
      await page.waitForTimeout(1500);

      // Go to edit page directly
      const url = page.url();
      const bookId = url.split('/books/')[1]?.split('/')[0];
      if (bookId) {
        await page.goto(BASE + `/books/${bookId}/edit`);
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screens/ui-cycle/screen-08-edit-page.png', fullPage: true });

        // Type in textarea
        const textarea = page.locator('textarea').first();
        if (await textarea.isVisible({ timeout: 3000 }).catch(() => false)) {
          await textarea.click();
          await textarea.fill('This is a beautiful memory from my childhood. The smell of fresh bread every Sunday morning brings back so many cherished moments with my grandmother.');
          await page.waitForTimeout(500);
          await page.screenshot({ path: 'screens/ui-cycle/screen-09-memory-text-filled.png', fullPage: true });
        }
      }
    }
  });

  test('05 - settings page profile section', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.goto(BASE + '/settings');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens/ui-cycle/screen-10-settings.png', fullPage: true });
  });

});
