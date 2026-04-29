'use client';

import { test, expect, Page } from '@playwright/test';

const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';
const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

async function takeShot(page: Page, name: string) {
  await page.screenshot({ path: `/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle/${name}.png`, fullPage: false });
  console.log(`📸 ${name}`);
}

test('Premium UI Cycle - Real Usage', async ({ page }) => {
  // ─── LOGIN ─────────────────────────────────────────────────────────────
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  await expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await takeShot(page, '01-dashboard');

  // ─── CREATE MEMORY (text only) ──────────────────────────────────────────
  console.log('\n✍️ CREATE MEMORY - Text');
  // Navigate to first book or create one if needed
  const bookLinks = await page.locator('a[href^="/books/"]').all();
  if (bookLinks.length === 0) {
    console.log('No books found - creating one first');
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.locator('#modal-title').fill('Test Memory Book');
    await page.locator('button[type="submit"]:has-text("Create Book")').click();
    await page.waitForTimeout(4000);
    await takeShot(page, '02-new-book-created');
  } else {
    // Go to a book to add memory
    await bookLinks[0].click();
    await page.waitForTimeout(2000);
    await takeShot(page, '02-book-detail');
  }

  // ─── ADD MEMORY ─────────────────────────────────────────────────────────
  console.log('\n📝 ADDING MEMORY');
  const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  if (await addMemBtn.isVisible({ timeout: 3000 })) {
    await addMemBtn.click();
    await page.waitForTimeout(2000);
    await takeShot(page, '03-memory-edit-page');

    // Fill in memory content
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The smell of fresh rain on dusty earth, the sound of crickets at dusk, the warmth of a hand-knit blanket on a cool autumn evening — these are the moments that make up a life.');
      await takeShot(page, '04-memory-text-filled');

      // Try to find title field
      const titleInput = page.locator('input[id*="title"], input[placeholder*="title"], input[placeholder*="Title"]').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('Moments of Stillness');
        await takeShot(page, '05-memory-title-filled');
      }

      // Save
      const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory"), button:has-text("Publish")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(5000);
        await takeShot(page, '06-memory-saved');
      }
    }
  } else {
    console.log('Add Memory button not found - checking book page');
    await takeShot(page, '03-no-add-memory-btn');
  }

  // ─── CREATE BOOK ────────────────────────────────────────────────────────
  console.log('\n📖 CREATE BOOK via modal');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await takeShot(page, '07-dashboard-reload');

  const createBtn = page.locator('button:has-text("New Book")').first();
  await createBtn.click();
  await page.waitForTimeout(1000);
  await takeShot(page, '08-create-modal');

  // Fill modal
  await page.locator('#modal-title').fill('Summer Recollections');
  await page.locator('#modal-desc').fill('Warm days, long evenings, and the company of those we love.');
  await takeShot(page, '09-create-modal-filled');

  await page.locator('button[type="submit"]:has-text("Create Book")').click();
  await page.waitForTimeout(5000);
  await takeShot(page, '10-book-created');

  // ─── NAVIGATE TO BOOK DETAIL ────────────────────────────────────────────
  console.log('\n📚 BOOK DETAIL');
  await page.waitForTimeout(2000);
  const bookUrl = page.url();
  console.log('Current URL:', bookUrl);
  await takeShot(page, '11-book-detail-fresh');

  // ─── LIBRARY PAGE ───────────────────────────────────────────────────────
  console.log('\n📚 LIBRARY PAGE');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await takeShot(page, '12-library');

  // ─── SETTINGS PAGE ──────────────────────────────────────────────────────
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await takeShot(page, '13-settings');

  // ─── IDENTIFY ISSUES ────────────────────────────────────────────────────
  console.log('\n🔍 ISSUE IDENTIFICATION');
  // Check for confusing elements
  const body = page.locator('body');
  const text = await body.textContent();

  // Look for error states
  const errors = await page.locator('[style*="rgba(212,163,115,0.1)"][style*="red"], [style*="error"]').count();
  console.log('Error indicators:', errors);

  // Check for empty states
  const emptyStates = await page.locator('text=/empty|no.*yet|waiting/i').count();
  console.log('Empty states found:', emptyStates);

  console.log('\n✅ Cycle complete');
});
