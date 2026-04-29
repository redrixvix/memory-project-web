import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots = [];
const OUT = 'playwright/screens-ui-cycle2';
try { fs.mkdirSync(OUT, { recursive: true }); } catch {}

async function snap(page, name) {
  const f = `${OUT}/${name}.png`;
  try {
    await page.screenshot({ path: f, fullPage: false });
    screenshots.push(f);
    console.log(`📸 ${name}`);
  } catch (e) {
    console.log(`⚠️ snap failed for ${name}: ${e.message}`);
  }
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(20000);

try {
  console.log('Starting deep UI cycle...');

  // LOGIN
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '01-login-page');

  const emailInput = page.locator('input[type="email"]');
  const passInput = page.locator('input[type="password"]');
  await emailInput.fill(EMAIL);
  await passInput.fill(PASSWORD);
  await snap(page, '02-login-filled');

  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await snap(page, '03-dashboard-loaded');
  console.log('Dashboard loaded');

  // NAVIGATE TO SETTINGS at correct URL
  await page.goto(BASE + '/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '04-settings-page');
  console.log('Settings page navigated');

  // NAVIGATE TO UPGRADE
  await page.goto(BASE + '/upgrade', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '05-upgrade-page');

  // NAVIGATE TO BOOKS/NEW
  await page.goto(BASE + '/books/new', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '06-new-book-form');

  // FILL and create a book
  const titleInput = page.locator('input[id*="title"], input[name*="title"]').first();
  if (await titleInput.isVisible({ timeout: 3000 })) {
    await titleInput.fill('Premium Test Book');
    const descArea = page.locator('textarea[name*="description"]').first();
    if (await descArea.isVisible({ timeout: 2000 })) {
      await descArea.fill('Testing the premium flow');
    }
    await snap(page, '07-book-form-filled');
    const createBtn = page.locator('button:has-text("Create"), button:has-text("Save")').first();
    await createBtn.click();
    await page.waitForURL(/\/books\/\d+/, { timeout: 15000 });
    await page.waitForTimeout(2000);
    await snap(page, '08-new-book-created');
    console.log('Book created');
  }

  // GO TO THE NEW BOOK DETAIL
  await page.waitForTimeout(1000);
  await snap(page, '09-book-detail');

  // ADD A MEMORY to the new book
  const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
  if (await addMemoryBtn.isVisible({ timeout: 5000 })) {
    await addMemoryBtn.click();
    await page.waitForTimeout(2000);
    await snap(page, '10-memory-edit-form');
    console.log('Memory form opened');

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The warmth of the afternoon sun streamed through the window as I sat with my grandfather on his old leather chair. He was telling me about his first job, working in the shipyards during WWII. I wanted to absorb every word. Those quiet moments with him were the most precious gifts I ever received.');
      await snap(page, '11-memory-text-entered');

      const titleInput = page.locator('input[id*="title"], input[name*="title"]').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('An Afternoon with Grandpa');
        await snap(page, '12-memory-titled');
      }

      // Save
      const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save"), button:has-text("Add Memory"), button[type="submit"]').first();
      await saveBtn.click();
      await page.waitForTimeout(4000);
      await snap(page, '13-memory-saved');
      console.log('Memory saved');
    }
  }

  // GO TO DASHBOARD via logo click
  await page.goto(BASE + '/dashboard', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '14-dashboard-final');

  console.log('\n✅ All screenshots:', screenshots.join('\n'));
} catch (err) {
  console.error('Error during cycle:', err.message);
  try { await snap(page, 'ERROR'); } catch {}
} finally {
  await browser.close();
}