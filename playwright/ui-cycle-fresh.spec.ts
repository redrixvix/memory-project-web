import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test.describe('Premium UI Cycle - Active Usage', () => {

  test('01 - login and explore dashboard', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-01-dashboard.png', fullPage: true });
  });

  test('02 - navigate to books and create one', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.goto(BASE + '/dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-02-dashboard-loaded.png', fullPage: true });

    // Look at the book cards
    const bookCards = page.locator('[class*="book"], [class*="card"]').first();
    if (await bookCards.isVisible({ timeout: 3000 }).catch(() => false)) {
      await page.screenshot({ path: 'screens/ui-cycle/screen-03-book-cards.png', fullPage: true });
    }
  });

  test('03 - create memory (if route exists)', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Check if there's a memories route
    const memoriesLink = page.locator('a[href*="memory"], text=Memories').first();
    if (await memoriesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await memoriesLink.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screens/ui-cycle/screen-04-memories-page.png', fullPage: true });

      // Try to create a memory
      const createBtn = page.locator('button:has-text("New"), button:has-text("Create"), button:has-text("Add")').first();
      if (await createBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await createBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'screens/ui-cycle/screen-05-create-memory-form.png', fullPage: true });
      }
    } else {
      // Try direct URL
      await page.goto(BASE + '/memories');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screens/ui-cycle/screen-04-memories-direct.png', fullPage: true });
    }
  });

  test('04 - check settings page', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.goto(BASE + '/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-06-settings.png', fullPage: true });
  });

  test('05 - check book detail page', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Get first book card link
    const firstBookLink = page.locator('a[href*="/books/"]').first();
    if (await firstBookLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstBookLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens/ui-cycle/screen-07-book-detail.png', fullPage: true });
    } else {
      // Try first book by ID directly
      await page.goto(BASE + '/books/1');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens/ui-cycle/screen-07-book-detail-1.png', fullPage: true });
    }
  });

  test('06 - create a new book', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.goto(BASE + '/books/new');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens/ui-cycle/screen-08-new-book-form.png', fullPage: true });

    // Fill in the form
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
    if (await titleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await titleInput.fill('My Summer Adventures 2025');
      await page.waitForTimeout(300);

      const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]').first();
      if (await descInput.isVisible()) {
        await descInput.fill('A collection of our best summer memories from hiking, beach trips, and family gatherings.');
      }

      await page.screenshot({ path: 'screens/ui-cycle/screen-09-book-form-filled.png', fullPage: true });

      // Submit
      const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens/ui-cycle/screen-10-book-created.png', fullPage: true });
    }
  });

  test('07 - explore all nav elements', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Check navigation links
    const navLinks = await page.locator('nav a, header a').all();
    console.log(`Found ${navLinks.length} navigation links`);

    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      const href = await navLinks[i].getAttribute('href');
      const text = await navLinks[i].textContent();
      console.log(`Nav link ${i}: ${text} -> ${href}`);
    }

    await page.screenshot({ path: 'screens/ui-cycle/screen-11-nav-exploration.png', fullPage: true });
  });

  test('08 - explore book edit page', async ({ page }) => {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);

    // Navigate to books
    await page.goto(BASE + '/dashboard');
    await page.waitForTimeout(1500);

    const bookLink = page.locator('a[href*="/books/"]').first();
    let bookId = '1';
    if (await bookLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      const href = await bookLink.getAttribute('href');
      const match = href?.match(/\/books\/(\d+)/);
      if (match) bookId = match[1];
    }

    await page.goto(BASE + `/books/${bookId}/edit`);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/screen-12-book-edit.png', fullPage: true });
  });
});