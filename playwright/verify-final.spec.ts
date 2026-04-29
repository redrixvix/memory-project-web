import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('Final verification - premium UI improvements', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-01-dashboard.png' });

  // NAVIGATE TO A BOOK
  console.log('\n📖 BOOK DETAIL');
  const firstBook = page.locator('a[href*="/books/"]').first();
  if (await firstBook.isVisible({ timeout: 3000 })) {
    await firstBook.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-02-book-detail.png' });
    
    // ADD MEMORY
    const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-03-memory-edit.png' });
      
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('The first snow always smelled different — cleaner, quieter somehow. I would stand at the window watching it fall, counting the seconds between lightning and thunder.');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-04-memory-filled.png' });
        
        const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(4000);
          await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-05-saved.png' });
        }
      }
    }
  }

  // NAVIGATE TO BOOKS PAGE
  console.log('\n📚 BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-06-books-page.png' });

  // NAVIGATE TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/final-07-settings.png' });

  console.log('\n✅ Final verification complete');
});
