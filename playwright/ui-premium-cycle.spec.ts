import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

// Helper: wait for network idle
async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// ─────────────────────────────────────────────────────────
// TEST 1: Complete Memory Flow — login → dashboard → book → memory → edit → settings
// ─────────────────────────────────────────────────────────
test('Premium UI cycle — full flow with screenshots', async ({ page }) => {
  // ── LOGIN ──
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-01-login.png' });
  
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  
  console.log('After login:', page.url());
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-02-after-login.png' });
  expect(page.url()).toContain('/dashboard');

  // ── DASHBOARD ──
  console.log('\n📚 DASHBOARD');
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-03-dashboard.png' });

  // ── CREATE BOOK ──
  console.log('\n📖 CREATE BOOK');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await expect(newBookBtn).toBeVisible({ timeout: 5000 });
  await newBookBtn.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-04-create-modal.png' });

  const titleInput = page.locator('#modal-title');
  await titleInput.fill('Summer at Cedar Lake');
  
  const descInput = page.locator('#modal-desc');
  await descInput.fill('Our family trips to the lake cabin, 2015–2024.');
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-05-create-filled.png' });

  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  await createBtn.click();
  await page.waitForTimeout(3000);
  
  console.log('After book create:', page.url());
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-06-book-detail.png' });
  expect(page.url()).toContain('/books/');

  // ── ADD MEMORY ──
  console.log('\n✍️ ADD MEMORY');
  await waitForLoad(page);
  const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  await expect(addMemBtn).toBeVisible({ timeout: 5000 });
  await addMemBtn.click();
  await page.waitForTimeout(1500);
  
  console.log('Edit page:', page.url());
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-07-edit-page.png' });

  // Fill memory text
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 3000 })) {
    await textarea.fill('The dock was rotting at the far end but we always jumped off it anyway. Mom would pack fried chicken and sweet tea in a cooler, and we\'d stay until the sun went down behind the pines. Those July evenings the lake turned to gold and the loons called out across the water. I wish I had a photo of that specific light.');
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-08-memory-filled.png' });
    
    const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-09-after-save.png' });
    }
  }

  // ── BACK TO DASHBOARD ──
  console.log('\n🏠 BACK TO DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-10-dashboard-with-book.png' });

  // ── SETTINGS ──
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-11-settings.png' });

  // ── UPGRADE PAGE ──
  console.log('\n💎 UPGRADE PAGE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/cycle-12-upgrade.png' });
});
