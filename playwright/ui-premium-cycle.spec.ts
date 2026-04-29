import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots: string[] = [];
const OUT = 'playwright/screens-ui-cycle';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

async function snapFull(page: any, name: string) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: true });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

test('UI premium cycle - login, create memories, books, verify polish', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-login-page');

  const emailInput = page.locator('input[type="email"]');
  const passInput = page.locator('input[type="password"]');
  await emailInput.fill(EMAIL);
  await passInput.fill(PASSWORD);
  await snap(page, '02-login-filled');

  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await snap(page, '03-dashboard-loaded');

  // ── DASHBOARD EXPLORATION ──────────────────────────────────────────
  // Check for books list
  const booksSection = page.locator('text=My Books').first();
  if (await booksSection.isVisible({ timeout: 3000 })) {
    await snap(page, '04-books-section');
  }

  // Check FAB (floating action button)
  const fab = page.locator('button[aria-label="Create new book"], button:has-text("New Book"), a:has-text("New Book")').first();
  if (await fab.isVisible({ timeout: 3000 })) {
    await snap(page, '05-fab-visible');
    await fab.click();
    await page.waitForLoadState('networkidle');
    await snap(page, '06-create-book-modal');
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
  }

  // ── NAVIGATE TO FIRST BOOK OR CREATE ONE ──────────────────────────
  let bookUrl = '';
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  if (await firstBookLink.isVisible({ timeout: 3000 })) {
    bookUrl = await firstBookLink.getAttribute('href');
    await firstBookLink.click();
    await page.waitForLoadState('networkidle');
    await snap(page, '07-book-detail');
  } else {
    // Create a book first
    await page.goto(BASE + '/books/new');
    await page.waitForLoadState('networkidle');
    await snap(page, '07-new-book-page');
    await page.fill('input[id*="title"], input[name*="title"]', 'My First Premium Book');
    await page.fill('textarea[name*="description"]', 'A book of cherished memories and stories from my life.');
    await snap(page, '08-new-book-filled');
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Save")').first();
    await createBtn.click();
    await page.waitForURL(/\/books\/\d+/, { timeout: 15000 });
    await page.waitForLoadState('networkidle');
    bookUrl = page.url();
  }

  await snap(page, '08-book-detail-page');

  // ── ADD MEMORY ─────────────────────────────────────────────────────
  const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory"), button:has-text("Write a Memory")').first();
  if (await addMemoryBtn.isVisible({ timeout: 5000 })) {
    await addMemoryBtn.click();
    await page.waitForLoadState('networkidle');
    await snap(page, '09-memory-form');

    // Fill memory content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The morning light was golden and warm. Grandma was in the kitchen making her famous cinnamon rolls, and the whole house smelled like heaven. I was sitting at the old oak table, watching her hands move with practiced grace. Those were the moments that mattered most — simple, warm, full of love.');
      await snap(page, '10-memory-filled');
    }

    // Fill title if field exists
    const titleInput = page.locator('input[id*="title"], input[name*="title"]').first();
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('Morning in Grandma\'s Kitchen');
      await snap(page, '11-memory-titled');
    }

    // Try to add photo if upload button exists
    const photoBtn = page.locator('button:has-text("Add Photo"), button:has-text("Upload Image"), input[type="file"]').first();
    if (await photoBtn.isVisible({ timeout: 2000 })) {
      await snap(page, '12-photo-button-visible');
    }

    // Save the memory
    const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save"), button:has-text("Add Memory"), button[type="submit"]').first();
    await saveBtn.click();
    await page.waitForTimeout(3000);
    await snap(page, '13-memory-saved');
  } else {
    // Maybe there's an inline form
    const inlineTextarea = page.locator('textarea').first();
    if (await inlineTextarea.isVisible({ timeout: 3000 })) {
      await inlineTextarea.fill('This is my first memory entry.');
      await snap(page, '10-inline-memory-filled');
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add")').first();
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await snap(page, '11-inline-saved');
    }
  }

  // ── NAVIGATE TO LIBRARY ───────────────────────────────────────────
  await page.goto(BASE + '/app/library');
  await page.waitForLoadState('networkidle');
  await snap(page, '14-library-page');

  // ── NAVIGATE TO SETTINGS ──────────────────────────────────────────
  await page.goto(BASE + '/app/settings');
  await page.waitForLoadState('networkidle');
  await snap(page, '15-settings-page');

  // ── GO BACK TO DASHBOARD ──────────────────────────────────────────
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await snap(page, '16-dashboard-again');

  console.log('\n✅ Screenshots:', screenshots.join('\n'));
});