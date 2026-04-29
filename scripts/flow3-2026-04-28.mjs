import { chromium } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-2026-04-28';

async function screenshot(page, name) {
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${SCREEN_DIR}/${name}`, fullPage: false });
  console.log(`📸 ${name}`);
}

async function run() {
  const fs = await import('fs');
  fs.mkdirSync(SCREEN_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    // Login
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await screenshot(page, '30-login.png');
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(2500);

    // Navigate to a book edit page
    const bookUrl = 'http://localhost:3000/books/160/edit';
    await page.goto(bookUrl, { waitUntil: 'networkidle' });
    await screenshot(page, '31-edit-page.png');

    // Check the text area height / writing feel
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      const box = await textarea.boundingBox();
      console.log('Textarea bounding box:', JSON.stringify(box));
    }

    // Scroll to bottom to check save bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await screenshot(page, '32-save-bar.png');

    // Check the prompt section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Check if drop zone is visible and styled correctly
    const dropZone = page.locator('[role="button"]').filter({ hasText: 'Drag photos' }).first();
    if (await dropZone.isVisible({ timeout: 3000 })) {
      console.log('Drop zone visible');
      await screenshot(page, '33-drop-zone.png');
    }

    // Scroll to media section
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(400);
    await screenshot(page, '34-media-section.png');

    // Check book detail with memory
    await page.goto('http://localhost:3000/books/160', { waitUntil: 'networkidle' });
    await screenshot(page, '35-book-detail.png');

    // Check memories page
    await page.goto(`${BASE_URL}/memories`, { waitUntil: 'networkidle' });
    await screenshot(page, '36-memories-page.png');

    console.log('\n✅ Flow 3 complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await screenshot(page, '99-error.png');
  } finally {
    await browser.close();
  }
}

run();
