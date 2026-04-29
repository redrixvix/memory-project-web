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
    console.log('\n🔐 LOGIN');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await screenshot(page, '20-login.png');
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(2500);
    await screenshot(page, '21-post-login.png');

    // Create a new book with description
    console.log('\n📖 CREATE BOOK');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await screenshot(page, '22-dashboard.png');

    const newBookBtn = page.locator('button:has-text("New Book")').first();
    if (await newBookBtn.isVisible({ timeout: 5000 })) {
      await newBookBtn.click();
      await page.waitForTimeout(600);
      await screenshot(page, '23-create-book-modal.png');
      await page.locator('#modal-title').fill('Summer at Cedar Lake');
      await page.locator('#modal-desc').fill('Our family trips to the lake cabin, 2015–2024. All the stories we told by firelight, the swimming holes we discovered, the thunderstorms we watched roll in across the water.');
      await page.locator('button[type="submit"]:has-text("Create Book")').click();
      await page.waitForTimeout(2500);
      console.log('Book URL:', page.url());
      await screenshot(page, '24-new-book-detail.png');
    }

    // Open memory edit page
    console.log('\n✍️ MEMORY EDIT FLOW');
    await page.goto(`${BASE_URL}/books/159/edit`, { waitUntil: 'networkidle' });
    await screenshot(page, '25-memory-edit.png');

    // Check prompt selector
    const promptSelect = page.locator('select').first();
    if (await promptSelect.isVisible()) {
      await promptSelect.selectOption({ index: 1 });
      await page.waitForTimeout(400);
      await screenshot(page, '26-prompt-selected.png');
    }

    // Fill text
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible()) {
      await textarea.fill('The dock was rotting at the far end but we always jumped off it anyway. Mom packed fried chicken and sweet tea in a cooler, and we would stay until the sun went down behind the pines. Those July evenings the lake turned to gold and the loons called out across the water. I wish I had a photo of that specific light.');
      await screenshot(page, '27-text-filled.png');
    }

    // Check save bar visible
    const saveBar = page.locator('.sticky.bottom-0').first();
    if (await saveBar.isVisible()) {
      console.log('Save bar visible');
      await screenshot(page, '28-save-bar-visible.png');
    }

    // Open book detail page
    console.log('\n📚 BOOK DETAIL');
    await page.goto(`${BASE_URL}/books/159`, { waitUntil: 'networkidle' });
    await screenshot(page, '29-book-detail.png');

    // Check empty state with prompt chips
    const addFirstBtn = page.locator('a:has-text("Add your first memory")').first();
    if (await addFirstBtn.isVisible({ timeout: 3000 })) {
      console.log('Empty state visible - clicking add');
      await addFirstBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '30-add-from-empty.png');
    }

    // Check settings
    console.log('\n⚙️ SETTINGS');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await screenshot(page, '31-settings.png');

    // Upgrade page
    console.log('\n💎 UPGRADE');
    await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
    await screenshot(page, '32-upgrade.png');

    console.log('\n✅ Flow 2 complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    await screenshot(page, '99-error.png');
  } finally {
    await browser.close();
  }
}

run();
