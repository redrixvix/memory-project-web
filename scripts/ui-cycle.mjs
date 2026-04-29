import { chromium } from '@playwright/test';
import fs from 'fs';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

const screenshots = [];
const OUT = 'playwright/screens-ui-cycle';
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

// Set shorter timeouts globally
page.setDefaultTimeout(15000);
page.setDefaultNavigationTimeout(20000);

try {
  console.log('Starting UI premium cycle...');

  // LOGIN
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '01-login-page');
  console.log('Login page loaded');

  const emailInput = page.locator('input[type="email"]');
  const passInput = page.locator('input[type="password"]');
  await emailInput.fill(EMAIL);
  await passInput.fill(PASSWORD);
  await snap(page, '02-login-filled');

  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForTimeout(2000);
  await snap(page, '03-dashboard-loaded');
  console.log('Dashboard loaded after login');

  // Check for books
  const booksSection = page.locator('text=My Books').first();
  if (await booksSection.isVisible({ timeout: 3000 })) {
    await snap(page, '04-books-section');
    console.log('Books section visible');
  }

  // Navigate to first book or create new one
  let bookUrl = '';
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  if (await firstBookLink.isVisible({ timeout: 3000 })) {
    bookUrl = await firstBookLink.getAttribute('href');
    await firstBookLink.click();
    await page.waitForTimeout(2000);
    await snap(page, '05-book-detail');
    console.log('Navigated to book detail');
  } else {
    await page.goto(BASE + '/books/new', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    await snap(page, '05-new-book-page');
    const titleInput = page.locator('input[id*="title"], input[name*="title"]').first();
    if (await titleInput.isVisible({ timeout: 3000 })) {
      await titleInput.fill('My First Premium Book');
      const descArea = page.locator('textarea[name*="description"]').first();
      if (await descArea.isVisible({ timeout: 2000 })) {
        await descArea.fill('A collection of cherished memories.');
      }
      await snap(page, '06-new-book-filled');
      const createBtn = page.locator('button:has-text("Create"), button:has-text("Save")').first();
      await createBtn.click();
      await page.waitForURL(/\/books\/\d+/, { timeout: 15000 });
      await page.waitForTimeout(2000);
      bookUrl = page.url();
    }
    console.log('Created new book');
  }

  await snap(page, '07-book-context');

  // ADD MEMORY
  const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory"), button:has-text("Write a Memory")').first();
  if (await addMemoryBtn.isVisible({ timeout: 5000 })) {
    await addMemoryBtn.click();
    await page.waitForTimeout(2000);
    await snap(page, '08-memory-form');
    console.log('Memory form opened');

    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The morning light was golden and warm. Grandma was in the kitchen making her famous cinnamon rolls, and the whole house smelled like heaven. Those were the moments that mattered most — simple, warm, full of love.');
      await snap(page, '09-memory-filled');
    }

    const titleInput = page.locator('input[id*="title"], input[name*="title"]').first();
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('Morning in Grandmas Kitchen');
      await snap(page, '10-memory-titled');
    }

    // Save the memory
    const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save"), button:has-text("Add Memory"), button[type="submit"]').first();
    await saveBtn.click();
    await page.waitForTimeout(3000);
    await snap(page, '11-memory-saved');
    console.log('Memory saved');
  }

  // NAVIGATE TO LIBRARY
  await page.goto(BASE + '/app/library', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '12-library-page');

  // SETTINGS
  await page.goto(BASE + '/app/settings', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await snap(page, '13-settings-page');

  // BACK TO DASHBOARD
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