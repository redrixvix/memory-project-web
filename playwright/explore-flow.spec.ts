import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots: string[] = [];
const OUT = 'playwright/screens-cycle2';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

test('explore full memory creation flow', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await snap(page, 'flow-01-login');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await snap(page, 'flow-02-dashboard');

  // ── GO TO A BOOK DETAIL ────────────────────────────────────────────
  // Click on the first book link
  const bookLinks = page.locator('a[href*="/books/"]').first();
  if (await bookLinks.count() > 0) {
    await bookLinks.click();
    await page.waitForLoadState('networkidle');
    await snap(page, 'flow-03-book-detail');
    
    // Look for "Add Memory" button
    const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
    if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
      await addMemoryBtn.click();
      await page.waitForLoadState('networkidle');
      await snap(page, 'flow-04-memory-form');
      
      // Fill in the memory text
      const textareas = page.locator('textarea');
      if (await textareas.count() > 0) {
        await textareas.first().fill('This is a beautiful memory from my childhood. The morning sun was streaming through the window and the whole house smelled like fresh bread. I want to remember every detail of days like this.');
        await snap(page, 'flow-05-memory-filled');
      }
      
      // Save the memory
      const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Add Memory"), button:has-text("Save")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
        await snap(page, 'flow-06-memory-saved');
      }
    } else {
      console.log('No Add Memory button found - book may be empty');
      // Try clicking on the "Start writing" link
      const startWriting = page.locator('a:has-text("Start writing")').first();
      if (await startWriting.count() > 0) {
        await startWriting.click();
        await page.waitForLoadState('networkidle');
        await snap(page, 'flow-04-memory-form');
      }
    }
  } else {
    console.log('No books found - creating a new book first');
    const createBtn = page.getByRole('button', { name: /new book|create/i }).first();
    if (await createBtn.isVisible({ timeout: 3000 })) {
      await createBtn.click();
      await page.waitForTimeout(500);
      
      // Fill title
      await page.fill('input[id*="title"]', 'My Test Book');
      await snap(page, 'flow-03-new-book');
      
      // Create
      const createBookBtn = page.locator('button:has-text("Create Book")');
      await createBookBtn.click();
      await page.waitForURL(/\/books\/\d+/, { timeout: 10000 });
      await page.waitForLoadState('networkidle');
      await snap(page, 'flow-04-book-created');
    }
  }

  console.log('\n✅ Screenshots:', screenshots.join('\n'));
});
