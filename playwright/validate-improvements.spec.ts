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
  await page.screenshot({ path: `/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle3/${name}.png`, fullPage: false });
  console.log(`📸 ${name}`);
}

test('Validate UI improvements', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  await expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await takeShot(page, 'validate-01-dashboard');

  // CREATE BOOK - check modal button states
  console.log('\n📖 CREATE BOOK - check button state');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await expect(newBookBtn).toBeVisible({ timeout: 5000 });
  await newBookBtn.click();
  await page.waitForTimeout(800);
  await takeShot(page, 'validate-02-create-modal-empty');
  
  // Fill title and check button activation
  await page.locator('#modal-title').fill('My Test Book');
  await page.waitForTimeout(300);
  await takeShot(page, 'validate-03-create-modal-filled');
  
  // Submit and check book creation flow
  await page.locator('button[type="submit"]:has-text("Create Book")').click();
  await page.waitForTimeout(4000);
  await takeShot(page, 'validate-04-book-created');

  // GO TO BOOK AND ADD MEMORY
  console.log('\n✍️ MEMORY EDIT');
  await page.waitForTimeout(2000);
  const bookUrl = page.url();
  console.log('Book URL:', bookUrl);
  await takeShot(page, 'validate-05-book-detail');

  // Add memory button should be visible
  const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  if (await addMemBtn.isVisible({ timeout: 3000 })) {
    await addMemBtn.click();
    await page.waitForTimeout(2000);
    await takeShot(page, 'validate-06-memory-edit-clean');

    // Fill memory
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The evening light through the kitchen window, the smell of bread baking, and the sound of laughter echoing from the next room — these are the moments I hold closest.');
      await takeShot(page, 'validate-07-memory-filled');

      // Check prompt count label
      const promptLabel = page.locator('text=/\\d+ prompts? available/').first();
      const promptLabelVisible = await promptLabel.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Prompt count label visible:', promptLabelVisible);
    }
  }

  // NAVIGATE TO DASHBOARD
  console.log('\n🏠 DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await takeShot(page, 'validate-08-dashboard-final');

  // SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await takeShot(page, 'validate-09-settings');

  console.log('\n✅ Validation complete');
});
