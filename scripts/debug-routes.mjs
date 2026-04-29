import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const OUT = 'playwright/screens-debug';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page, name) {
  const f = `${OUT}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  console.log(`📸 ${name}: ${page.url()}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(15000);

try {
  // LOGIN
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '01-login');

  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await snap(page, '02-after-login');

  // Check where we are
  console.log('Current URL after login:', page.url());

  // Navigate to /settings
  await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('URL after /settings:', page.url());
  await snap(page, '03-settings');

  // Navigate to /library (which doesn't exist)
  await page.goto(BASE + '/library', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('URL after /library:', page.url());
  await snap(page, '04-library');

  // Navigate to /app/settings (which doesn't exist)
  await page.goto(BASE + '/app/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  console.log('URL after /app/settings:', page.url());
  await snap(page, '05-app-settings');

} catch (err) {
  console.error('Error:', err.message);
} finally {
  await browser.close();
}