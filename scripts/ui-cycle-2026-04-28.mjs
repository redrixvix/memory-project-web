import { chromium } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-2026-04-28';

async function screenshot(page, name) {
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREEN_DIR}/${name}` });
  console.log(`📸 ${name}`);
}

async function run() {
  // Create screen dir
  const fs = await import('fs');
  fs.mkdirSync(SCREEN_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    // ── LOGIN ──
    console.log('\n🔐 LOGIN');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await screenshot(page, '01-login.png');

    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(3000);
    console.log('After login:', page.url());
    await screenshot(page, '02-post-login.png');

    if (!page.url().includes('/dashboard')) {
      console.log('⚠️ Login may not have redirected to dashboard');
      console.log('URL:', page.url());
    }

    // ── DASHBOARD ──
    console.log('\n📚 DASHBOARD');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await screenshot(page, '03-dashboard.png');

    // Explore books page
    console.log('\n📖 BOOKS PAGE');
    await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
    await screenshot(page, '04-books.png');

    // ── CREATE BOOK ──
    console.log('\n📖 CREATE BOOK');
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    if (await newBookBtn.isVisible({ timeout: 5000 })) {
      await newBookBtn.click();
      await page.waitForTimeout(600);
      await screenshot(page, '05-create-book-modal.png');

      await page.locator('#modal-title').fill('Summer at Cedar Lake');
      await page.locator('#modal-desc').fill('Our family trips to the lake cabin, 2015–2024. All the stories we told by firelight.');
      await screenshot(page, '06-create-book-filled.png');

      await page.locator('button[type="submit"]:has-text("Create Book")').click();
      await page.waitForTimeout(3000);
      console.log('After book create URL:', page.url());
      await screenshot(page, '07-book-detail.png');
    } else {
      console.log('⚠️ New Book button not found');
    }

    // ── ADD MEMORY ──
    console.log('\n✍️ ADD MEMORY');
    const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await addMemBtn.isVisible({ timeout: 5000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      console.log('Memory edit page:', page.url());
      await screenshot(page, '08-memory-edit.png');

      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('The dock was rotting at the far end but we always jumped off it anyway. Mom packed fried chicken and sweet tea in a cooler, and we\'d stay until the sun went down behind the pines. Those July evenings the lake turned to gold and the loons called out across the water. I wish I had a photo of that specific light.');
        await screenshot(page, '09-memory-text-filled.png');

        const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
        if ( await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(3000);
          await screenshot(page, '10-after-memory-save.png');
        }
      }
    } else {
      console.log('⚠️ Add Memory button not found');
    }

    // ── NAVIGATE MEMORIES PAGE ──
    console.log('\n🧠 MEMORIES PAGE');
    await page.goto(`${BASE_URL}/memories`, { waitUntil: 'networkidle' }).catch(() => {
      console.log('⚠️ /memories route may not exist');
    });
    await screenshot(page, '11-memories.png');

    // ── SETTINGS ──
    console.log('\n⚙️ SETTINGS');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await screenshot(page, '12-settings.png');

    // ── UPGRADE PAGE ──
    console.log('\n💎 UPGRADE PAGE');
    await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
    await screenshot(page, '13-upgrade.png');

    // Back to dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await screenshot(page, '14-dashboard-final.png');

    console.log('\n✅ Flow complete! Screenshots saved to', SCREEN_DIR);

  } catch (err) {
    console.error('❌ Error during flow:', err.message);
    await screenshot(page, '99-error.png');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
