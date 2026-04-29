import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots: string[] = [];
const OUT = 'playwright/screens-book-flow';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string, opts?: any) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: opts?.fullPage ?? false });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

const TEST_IMG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

test('book detail + memory creation flow — fix and verify', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-login');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await snap(page, '02-dashboard');

  // ── CLICK ON EXISTING BOOK (Summer at Cedar Lake) ───────────────────
  // Find a book with content (has "1 memory" or similar)
  const bookLinks = page.locator('a[href*="/books/"]');
  const linkCount = await bookLinks.count();
  console.log('Book links found on dashboard:', linkCount);

  // Try clicking the first book
  if (linkCount > 0) {
    await bookLinks.first().click();
    await page.waitForLoadState('networkidle');
    const url = page.url();
    console.log('After clicking book, URL:', url);
    await snap(page, '03-book-detail', { fullPage: true });

    // Check what's on the page
    const bodyText = await page.locator('body').textContent();
    const hasContent = bodyText && bodyText.length > 200;
    console.log('Page has substantial content:', hasContent);
    console.log('URL:', url);

    // If it's a 404 page, we'll know
    if (url.includes('404') || (!hasContent && url.match(/\/books\/\d+$/))) {
      console.log('Book detail page appears empty/404 — needs investigation');
    }

    // Check for empty state vs memories
    const emptyState = await page.locator('text=Start your memory book').count();
    const memoryCount = await page.locator('[class*="memory"], .animate-fade-up').count();
    console.log('Empty state visible:', emptyState, 'Memory-like elements:', memoryCount);

    // If we can add a memory, do so
    const addMemoryLinks = page.locator('a[href*="/edit"]');
    if (await addMemoryLinks.count() > 0) {
      await addMemoryLinks.first().click();
      await page.waitForLoadState('networkidle');
      await snap(page, '04-memory-edit-page', { fullPage: true });

      // Fill in the textarea
      const textareas = page.locator('textarea');
      if (await textareas.count() > 0) {
        await textareas.first().fill(
          'The moment we arrived at the lake house, time seemed to stop. The mist was still rising off the water when we unpacked the car. My grandfather already had the coffee ready — somehow he always knew exactly when we would pull in.'
        );
        await page.waitForTimeout(300);
        await snap(page, '05-memory-text-filled');

        // Upload a photo
        const fileInputs = page.locator('input[type="file"]');
        if (await fileInputs.count() > 0) {
          await fileInputs.first().setInputFiles({
            name: 'lake-memory.png',
            mimeType: 'image/png',
            buffer: TEST_IMG,
          });
          await page.waitForTimeout(1500);
          await snap(page, '06-photo-uploaded');
        }

        // Save
        const saveBtn = page.getByRole('button', { name: /save|add memory|publish/i })
          .filter({ hasText: /save|add|publish/i }).first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(2500);
          await page.waitForLoadState('networkidle');
          await snap(page, '07-after-save', { fullPage: true });
        }
      }
    }
  }

  // ── NAVIGATE DIRECTLY TO SETTINGS ─────────────────────────────────
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await snap(page, '08-settings', { fullPage: true });

  // ── UPGRADE PAGE ───────────────────────────────────────────────────
  await page.goto(BASE + '/upgrade');
  await page.waitForLoadState('networkidle');
  await snap(page, '09-upgrade-page', { fullPage: true });

  // ── FAQ PAGE ───────────────────────────────────────────────────────
  await page.goto(BASE + '/faq');
  await page.waitForLoadState('networkidle');
  await snap(page, '10-faq-page');

  console.log('\n✅ Screenshots:', screenshots.join('\n'));
});