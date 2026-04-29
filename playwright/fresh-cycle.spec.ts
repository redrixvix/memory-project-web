import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('Premium UI cycle - full exploration', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-01-login.png' });
  
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-02-after-login.png' });
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-03-dashboard.png' });

  // EXPLORE DASHBOARD
  console.log('\n📊 DASHBOARD EXPLORE');
  await waitForLoad(page);
  
  // Check book cards
  const bookCards = page.locator('[class*="card"]').all();
  console.log('Book cards found:', (await bookCards).length);
  
  // CREATE BOOK
  console.log('\n📖 CREATE BOOK');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible({ timeout: 3000 })) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-04-create-modal.png' });
    
    await page.locator('#modal-title').fill('Test Premium Book');
    await page.locator('#modal-desc').fill('Testing the premium UI flow.');
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-05-create-filled.png' });
    
    await page.locator('button[type="submit"]:has-text("Create Book")').click();
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-06-after-create.png' });
  }

  // NAVIGATE TO BOOKS PAGE
  console.log('\n📚 BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-07-books-page.png' });

  // NAVIGATE TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-08-settings.png' });

  // GO BACK TO DASHBOARD AND ADD MEMORY
  console.log('\n✍️ ADD MEMORY');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  
  // Try clicking first book card to get to book detail
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  if (await firstBookLink.isVisible({ timeout: 3000 })) {
    await firstBookLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-09-book-detail.png' });
    
    // Try to add memory
    const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-10-memory-edit.png' });
      
      // Fill memory
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('This is a test memory entry to verify the premium UI flow is working correctly.');
        await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-11-memory-filled.png' });
        
        // Save
        const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(4000);
          await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/fresh-12-memory-saved.png' });
        }
      }
    }
  }

  console.log('\n✅ Exploration complete');
});
