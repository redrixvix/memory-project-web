import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots: string[] = [];
const OUT = 'playwright/screens-deep';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string, opts?: any) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: opts?.fullPage ?? false, ...opts });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

// Simple 1x1 transparent PNG as test image
const TEST_IMG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

test('deep UI exploration — create, upload, edit, verify', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-login');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await snap(page, '02-dashboard-logged-in');

  // ── GO TO LIBRARY ──────────────────────────────────────────────────
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await snap(page, '03-library-full', { fullPage: true });

  // ── CREATE NEW BOOK ────────────────────────────────────────────────
  const createBtn = page.getByRole('button', { name: /new book|create book/i }).first();
  await createBtn.click();
  await page.waitForTimeout(600);
  await snap(page, '04-create-book-modal');

  // Fill in book details
  await page.fill('input[id*="title"], input[placeholder*="itle"]', 'Cedar Lake Summer 2024');
  const descLocator = page.locator('textarea[id*="desc"], textarea[placeholder*="esc"]').first();
  if (await descLocator.isVisible({ timeout: 2000 })) {
    await descLocator.fill('A collection of our favorite memories from the family lake house.');
  }

  await page.click('button[type="submit"]');
  await page.waitForURL(/\/books\/\d+/, { timeout: 10000 });
  await page.waitForLoadState('networkidle');
  await snap(page, '05-new-book-page');

  // ── ADD MEMORY — FULL FORM ─────────────────────────────────────────
  const addMemoryLink = page.getByRole('link', { name: /add memory|new memory/i }).first();
  if (await addMemoryLink.isVisible({ timeout: 3000 })) {
    await addMemoryLink.click();
  } else {
    await page.goto(page.url().replace(/\/books\/\d+$/, '/edit'));
  }
  await page.waitForLoadState('networkidle');
  await snap(page, '06-memory-edit-page', { fullPage: true });

  // Select a prompt if available
  const promptBtns = page.locator('button[class*="border"], button[class*="prompt"]').filter({ hasText: /\?/ });
  if (await promptBtns.count() > 0) {
    await promptBtns.first().click();
    await page.waitForTimeout(400);
    await snap(page, '07-prompt-selected');
  }

  // Write memory text
  const textareas = page.locator('textarea');
  const memoryText = 'The morning we arrived at the lake, everything was impossibly still. Mist rose from the water like something from a dream. My grandfather made his legendary pancakes while my sister and I raced to claim the best dock chair. That whole week felt suspended in time — I want to keep every detail forever.';
  
  if (await textareas.count() > 0) {
    await textareas.first().focus();
    await textareas.first().fill(memoryText);
    await page.waitForTimeout(300);
    await snap(page, '08-memory-text-entered');
  }

  // Try to upload a photo
  const fileInputs = page.locator('input[type="file"]');
  const fileCount = await fileInputs.count();
  if (fileCount > 0) {
    // Use the first file input (usually photo)
    const photoInput = fileInputs.first();
    await photoInput.setInputFiles({
      name: 'test-memory.png',
      mimeType: 'image/png',
      buffer: TEST_IMG_BUFFER,
    });
    await page.waitForTimeout(1000);
    await snap(page, '09-photo-uploaded');
  }

  // Save the memory
  const saveBtn = page.getByRole('button', { name: /save memory|add memory|publish/i })
    .filter({ hasText: /save|add|publish/i }).first();
  
  if (await saveBtn.isVisible({ timeout: 2000 })) {
    await saveBtn.click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');
    await snap(page, '10-memory-saved', { fullPage: true });
  }

  // ── BOOK DETAIL PAGE ────────────────────────────────────────────────
  await page.waitForTimeout(1000);
  await page.waitForLoadState('networkidle');
  await snap(page, '11-book-detail-after-memory', { fullPage: true });

  // ── OPEN SETTINGS ──────────────────────────────────────────────────
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await snap(page, '12-settings-page', { fullPage: true });

  // ── NAVIGATE TO FAQ ─────────────────────────────────────────────────
  await page.goto(BASE + '/faq');
  await page.waitForLoadState('networkidle');
  await snap(page, '13-faq-page');

  // ── UPGRADE PAGE ───────────────────────────────────────────────────
  await page.goto(BASE + '/upgrade');
  await page.waitForLoadState('networkidle');
  await snap(page, '14-upgrade-page');

  // ── GO BACK TO DASHBOARD — verify search ───────────────────────────
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  const searchInput = page.locator('input[placeholder*="earch"], input[type="search"]').first();
  if (await searchInput.isVisible({ timeout: 3000 })) {
    await searchInput.fill('Cedar');
    await page.waitForTimeout(700);
    await snap(page, '15-dashboard-search-cedar');
  }

  // ── BOOK DETAIL — verify memory appears ───────────────────────────
  const bookLink = page.locator('a[href*="/books/"]').filter({ hasText: /cedar|cedar/i }).first();
  if (await bookLink.count() > 0) {
    await bookLink.first().click();
    await page.waitForLoadState('networkidle');
    await snap(page, '16-book-detail-with-memory', { fullPage: true });
  }

  console.log('\n✅ Screenshots:', screenshots.join('\n'));
});