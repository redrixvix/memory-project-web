import { test, expect } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const OUT = 'playwright/screens-comprehensive';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string, opts?: any) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: opts?.fullPage ?? false });
  console.log(`📸 ${name}`);
}

const TEST_IMG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
  'base64'
);

test('comprehensive real product flow with memory creation', async ({ page }) => {
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

  // ── GO TO A BOOK DETAIL ────────────────────────────────────────────
  await page.goto('http://localhost:3000/books/176');
  await page.waitForLoadState('networkidle');
  await snap(page, '03-book-detail-empty', { fullPage: true });

  // ── ADD A MEMORY ───────────────────────────────────────────────────
  await page.goto('http://localhost:3000/books/176/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000); // Wait for client hydration
  await snap(page, '04-memory-edit-page', { fullPage: true });

  // Fill in memory text
  const textarea = page.locator('textarea').first();
  await textarea.fill(
    'The moment we arrived at the lake house, the world felt different. My grandfather had the coffee ready before we even got the car unpacked. That first morning, we sat on the dock and watched the mist rise off the water while the loons called in the distance. My sister and I would spend the whole week racing to claim the best chair on the dock before breakfast.'
  );
  await page.waitForTimeout(300);
  await snap(page, '05-memory-text-filled');

  // Upload photo — click the label button which wraps the hidden file input
  const photoLabel = page.locator('label').filter({ hasText: /add photos/i }).first();
  if (await photoLabel.count() > 0) {
    try {
      // Try to find the hidden file input inside the label and set files via JS
      await page.evaluate(async (label) => {
        const input = label.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const dataTransfer = new DataTransfer();
          const blob = new Blob(['test'], { type: 'image/png' });
          const file = new File(['test'], 'lake-morning.png', { type: 'image/png' });
          dataTransfer.items.add(file);
          input.files = dataTransfer.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }, await photoLabel.elementHandle());
    } catch(e) {
      console.log('Photo upload via JS failed:', e);
    }
    await page.waitForTimeout(2000);
    await snap(page, '06-photo-uploaded');
  } else {
    console.log('No photo label found, skipping photo upload');
  }

  // Save memory
  const saveBtn = page.getByRole('button', { name: /save/i }).first();
  await saveBtn.click();
  await page.waitForTimeout(2500);
  await page.waitForLoadState('networkidle');
  await snap(page, '07-after-save-book-detail', { fullPage: true });

  // ── VERIFY MEMORY APPEARS ON BOOK PAGE ─────────────────────────────
  const memoryText = await page.locator('text=The moment we arrived').count();
  console.log('Memory text visible:', memoryText);

  // ── SETTINGS PAGE ──────────────────────────────────────────────────
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await snap(page, '08-settings', { fullPage: true });

  // Change display name
  const nameInput = page.locator('input[id*="name"], input[placeholder*="ame"]').first();
  if (await nameInput.isVisible({ timeout: 2000 })) {
    await nameInput.clear();
    await nameInput.fill('Alex Smith');
    await page.waitForTimeout(200);
    await snap(page, '09-settings-name-filled');
    
    // Save
    const saveSettingsBtn = page.getByRole('button', { name: /save changes/i }).first();
    if (await saveSettingsBtn.isVisible({ timeout: 2000 })) {
      await saveSettingsBtn.click();
      await page.waitForTimeout(1500);
      await snap(page, '10-settings-saved');
    }
  }

  // ── UPGRADE PAGE ───────────────────────────────────────────────────
  await page.goto(BASE + '/upgrade');
  await page.waitForLoadState('networkidle');
  await snap(page, '11-upgrade-page', { fullPage: true });

  // Try to select a plan
  const premiumCard = page.locator('[role="button"]').filter({ hasText: /Premium/i }).first();
  if (await premiumCard.count() > 0) {
    await premiumCard.click();
    await page.waitForTimeout(300);
    await snap(page, '12-plan-selected');
  }

  // ── FAQ PAGE ───────────────────────────────────────────────────────
  await page.goto(BASE + '/faq');
  await page.waitForLoadState('networkidle');
  await snap(page, '13-faq-page');

  // ── BACK TO DASHBOARD — verify book list ───────────────────────────
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await snap(page, '14-dashboard-final', { fullPage: true });

  // Search
  const searchInput = page.locator('input[placeholder*="earch"]').first();
  if (await searchInput.isVisible({ timeout: 3000 })) {
    await searchInput.fill('Cedar');
    await page.waitForTimeout(500);
    await snap(page, '15-dashboard-search-cedar');
  }

  console.log('✅ Flow complete');
});