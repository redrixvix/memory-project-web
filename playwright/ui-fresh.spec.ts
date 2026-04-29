import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots: string[] = [];
const OUT = 'playwright/screens-fresh';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string, opts?: any) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: opts?.fullPage ?? false });
  screenshots.push(f);
  console.log(`📸 ${name}`);
}

// 1x1 transparent PNG for test uploads
const TEST_IMG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

test('fresh exploration — verify real product flow', async ({ page }) => {
  // ── LOGIN ──────────────────────────────────────────────────────────
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-login-page');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await snap(page, '02-dashboard-after-login');

  // ── CHECK PAGE TITLE / CONTENT ─────────────────────────────────────
  const title = await page.locator('h1, [class*="title"]').first().textContent().catch(() => 'none');
  console.log('Dashboard title text:', title);

  // ── CREATE BOOK via modal ──────────────────────────────────────────
  const newBookBtn = page.getByRole('button', { name: /new book|create book|add book/i }).first();
  await newBookBtn.click();
  await page.waitForTimeout(700);
  await snap(page, '03-create-modal-open');

  // Type book title
  const titleInput = page.locator('input[id*="title"], input[placeholder*="itle"]').first();
  await titleInput.fill('Cedar Lake Summer 2024');
  
  // Type description
  const descArea = page.locator('textarea[id*="desc"], textarea[placeholder*="esc"]').first();
  if (await descArea.isVisible({ timeout: 2000 })) {
    await descArea.fill('Family memories from our week at the lake house.');
  }

  // Submit
  const submitBtn = page.getByRole('button', { name: /create book|create/i }).filter({ hasText: /create/i }).first();
  await submitBtn.click();

  // Wait for navigation to book detail
  try {
    await page.waitForURL(/\/books\/\d+/, { timeout: 10000 });
  } catch {
    const currentUrl = page.url();
    console.log('Did not navigate to book page. Current URL:', currentUrl);
    await snap(page, '03b-no-book-nav');
    // Continue anyway
  }
  await page.waitForLoadState('networkidle');
  await snap(page, '04-book-detail-page');

  const bookUrl = page.url();
  console.log('Book detail URL:', bookUrl);

  // ── IF on book detail, check for "Add Memory" ──────────────────────
  if (/books\/\d+/.test(bookUrl)) {
    // Look for add memory link/button
    const addLinks = page.locator('a[href*="/edit"]');
    const addCount = await addLinks.count();
    console.log('Edit links found:', addCount);
    
    if (addCount > 0) {
      await addLinks.first().click();
      await page.waitForLoadState('networkidle');
      await snap(page, '05-memory-edit-page', { fullPage: true });
      
      // Check if there's a textarea for memory text
      const textareas = page.locator('textarea');
      const count = await textareas.count();
      console.log('Textarea count on edit page:', count);
      
      if (count > 0) {
        // Enter memory text
        await textareas.first().fill(
          'The morning we arrived at the lake, the water was perfectly still. Mist rose like something from a dream. My grandfather made his famous pancakes while we claimed our favorite spots on the dock.'
        );
        await page.waitForTimeout(400);
        await snap(page, '06-memory-text-filled');
        
        // Try photo upload
        const fileInputs = page.locator('input[type="file"]');
        if (await fileInputs.count() > 0) {
          await fileInputs.first().setInputFiles({
            name: 'lake.png',
            mimeType: 'image/png',
            buffer: TEST_IMG,
          });
          await page.waitForTimeout(1200);
          await snap(page, '07-photo-upload-attempt');
        }
        
        // Try to save
        const saveBtn = page.getByRole('button', { name: /save|add memory|publish/i }).filter({ hasText: /save|add|publish/i }).first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(2000);
          await page.waitForLoadState('networkidle');
          await snap(page, '08-after-save', { fullPage: true });
        }
      }
    } else {
      // Try direct navigation
      const bookId = bookUrl.match(/books\/(\d+)/)?.[1];
      if (bookId) {
        await page.goto(BASE + `/books/${bookId}/edit`);
        await page.waitForLoadState('networkidle');
        await snap(page, '05-edit-direct');
      }
    }
  }

  // ── VISIT SETTINGS ─────────────────────────────────────────────────
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await snap(page, '09-settings-page');

  // ── VISIT UPGRADE ──────────────────────────────────────────────────
  await page.goto(BASE + '/upgrade');
  await page.waitForLoadState('networkidle');
  await snap(page, '10-upgrade-page');

  // ── BACK TO DASHBOARD — check search ───────────────────────────────
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  const searchInput = page.locator('input[placeholder*="earch"]').first();
  if (await searchInput.isVisible({ timeout: 3000 })) {
    await searchInput.fill('Cedar');
    await page.waitForTimeout(600);
    await snap(page, '11-search-cedar');
  }

  // ── CLICK ON THE BOOK ─────────────────────────────────────────────
  const bookLink = page.locator('a[href*="/books/"]').filter({ hasText: /cedar|cedar lake/i }).first();
  if (await bookLink.count() > 0) {
    await bookLink.click();
    await page.waitForLoadState('networkidle');
    await snap(page, '12-book-final-state', { fullPage: true });
  }

  console.log('\n✅ Fresh screenshots:', screenshots.join('\n'));
});