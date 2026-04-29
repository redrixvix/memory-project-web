import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const OUT = 'screens/ui-final-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const { mkdirSync } = require('fs');
try { mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page: any, name: string) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  console.log(`📸 ${name}`);
}

async function login(page: any) {
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
}

test('final validation', async ({ page }) => {
  // Login
  await login(page);
  await snap(page, '00-dashboard');

  // Settings
  await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
  await snap(page, '01-settings');

  // Book detail
  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  let bookHref = '';
  if (await firstBookLink.isVisible()) {
    bookHref = await firstBookLink.getAttribute('href') || '';
  }
  if (bookHref) {
    await page.goto(BASE + bookHref, { waitUntil: 'networkidle' });
    await snap(page, '02-book-detail');
  }

  // Book edit
  if (bookHref) {
    await page.goto(BASE + bookHref + '/edit', { waitUntil: 'networkidle' });
    await snap(page, '03-book-edit');
  }

  // New book modal
  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(600);
    await snap(page, '04-new-book-modal');
  }

  console.log('\n✅ Final validation complete!');
});