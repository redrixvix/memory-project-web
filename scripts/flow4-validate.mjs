import { chromium } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-2026-04-28';

async function screenshot(page, name) {
  await page.waitForTimeout(600);
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
    await screenshot(page, '40-login.png');
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(2000);

    // Open the memory edit page
    await page.goto(`${BASE_URL}/books/160/edit`, { waitUntil: 'networkidle' });
    await screenshot(page, '41-memory-edit.png');

    // Scroll to media section and check photo grid
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(500);
    await screenshot(page, '42-media-photo-grid.png');

    // Check book detail page
    await page.goto(`${BASE_URL}/books/160`, { waitUntil: 'networkidle' });
    await screenshot(page, '43-book-detail.png');

    // Check empty state
    await page.goto(`${BASE_URL}/books/159`, { waitUntil: 'networkidle' });
    await screenshot(page, '44-empty-state.png');

    // Check upgrade page
    await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
    await screenshot(page, '45-upgrade.png');

    // Settings
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await screenshot(page, '46-settings.png');

    console.log('\n✅ Validation complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await screenshot(page, '99-error.png');
  } finally {
    await browser.close();
  }
}

run();
