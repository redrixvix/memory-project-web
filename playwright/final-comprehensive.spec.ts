import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('Comprehensive premium UI verification', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-01-dashboard.png' });

  // CREATE BOOK
  console.log('\n📖 CREATE BOOK');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await expect(newBookBtn).toBeVisible({ timeout: 5000 });
  await newBookBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-02-create-modal.png' });
  
  await page.locator('#modal-title').fill('Winter Stories Collection');
  await page.locator('#modal-desc').fill('Cozy memories from cold nights and snowy days.');
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-03-create-filled.png' });
  
  await page.locator('button[type="submit"]:has-text("Create Book")').click();
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-04-book-created.png' });

  // ADD MEMORY
  console.log('\n✍️ ADD MEMORY');
  await waitForLoad(page);
  const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  if (await addMemBtn.isVisible({ timeout: 5000 })) {
    await addMemBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-05-memory-edit.png' });
    
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 3000 })) {
      await textarea.fill('The fireplace crackled while outside the first snow of the season fell silently over the yard. Inside, the smell of hot chocolate and cinnamon rolls filled the kitchen.');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-06-memory-filled.png' });
      
      const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(4000);
        await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-07-memory-saved.png' });
      }
    }
  }

  // NAVIGATE TO BOOKS PAGE
  console.log('\n📚 BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-08-books-page.png' });

  // NAVIGATE TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-09-settings.png' });

  // BACK TO DASHBOARD
  console.log('\n🏠 DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/comprehensive-10-dashboard-final.png' });

  console.log('\n✅ Comprehensive verification complete');
});
