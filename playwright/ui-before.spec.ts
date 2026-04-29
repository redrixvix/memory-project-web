import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-after-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-');

async function ensureDir() {
  const { mkdirSync } = require('fs');
  try { mkdirSync(SCREENSHOT_DIR, { recursive: true }); } catch {}
}

async function snap(page: Page, name: string) {
  await ensureDir();
  const f = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  console.log(`📸 ${name}`);
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await page.waitForLoadState('networkidle');
}

test('Screenshot current state before improvements', async ({ page }) => {
  await login(page);
  await page.waitForTimeout(2000);
  
  // Dashboard full view
  await snap(page, '01-dashboard-top');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.4));
  await page.waitForTimeout(300);
  await snap(page, '02-dashboard-mid');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
  await page.waitForTimeout(300);
  await snap(page, '03-dashboard-bottom');
  
  // Create a new book
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(800);
  await snap(page, '04-create-modal');
  
  await page.locator('#modal-title').fill('Sunset Valley Collection');
  await page.locator('#modal-desc').fill('Memories from our evenings watching the sun go down.');
  await snap(page, '05-create-filled');
  
  await page.locator('button[type="submit"]:has-text("Create Book")').click();
  await page.waitForTimeout(4000);
  await snap(page, '06-after-create');
  
  // Navigate to book detail
  const bookLink = page.locator('a[href*="/books/"]:not([href*="/books/new"])').first();
  const href = await bookLink.getAttribute('href').catch(() => '');
  
  if (href) {
    await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await snap(page, '07-book-detail');
    
    // Navigate to add memory
    const addMemBtn = page.locator('a:has-text("Add Memory")').first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await snap(page, '08-memory-form');
      
      // Fill text
      const textarea = page.locator('textarea').first();
      await textarea.fill('The sky turned amber and rose as the sun finally dipped below the ridge. We sat on the old wooden bench, the one my grandfather built forty years ago, and watched the colors shift across the hills.');
      await snap(page, '09-memory-text');
      
      // Try to save
      const saveBtn = page.locator('button:has-text("Save Memory")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(4000);
        await snap(page, '10-memory-saved');
      }
    }
  }
  
  // Settings
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await snap(page, '11-settings');
  
  console.log('\n✅ Screenshots captured');
});