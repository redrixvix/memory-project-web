import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('UI Cycle - explore and improve', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${SCREEN_DIR}/01-login.png` });
  
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  
  await page.screenshot({ path: `${SCREEN_DIR}/02-after-login.png` });
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: `${SCREEN_DIR}/03-dashboard.png` });

  // EXPLORE DASHBOARD
  console.log('\n📊 DASHBOARD EXPLORE');
  await waitForLoad(page);
  
  // Check visible UI elements
  const bookCards = page.locator('[class*="card"]').all();
  console.log('Book cards found:', (await bookCards).length);
  
  // CREATE BOOK via modal
  console.log('\n📖 CREATE BOOK');
  const newBookBtn = page.locator('button:has-text("New Book"), button:has-text("Create Book")').first();
  if (await newBookBtn.isVisible({ timeout: 5000 })) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREEN_DIR}/04-create-modal.png` });
    
    // Check modal structure - use the actual input id
    const modalTitleInput = page.locator('#modal-title');
    if (await modalTitleInput.isVisible({ timeout: 3000 })) {
      await modalTitleInput.fill('Summer Memories 2026');
      // Also fill description
      const modalDesc = page.locator('#modal-desc');
      if (await modalDesc.isVisible({ timeout: 2000 })) {
        await modalDesc.fill('Our favorite summer memories and adventures.');
      }
      await page.screenshot({ path: `${SCREEN_DIR}/05-create-filled.png` });
      
      // Try submit
      const submitBtn = page.locator('button:has-text("Create Book"), button:has-text("Create")').first();
      if (await submitBtn.isVisible({ timeout: 2000 })) {
        await submitBtn.click();
        await page.waitForTimeout(4000);
        await page.screenshot({ path: `${SCREEN_DIR}/06-after-create.png` });
      }
    }
  }

  // NAVIGATE TO BOOKS PAGE
  console.log('\n📚 BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: `${SCREEN_DIR}/07-books-page.png` });

  // NAVIGATE TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: `${SCREEN_DIR}/08-settings.png` });

  // GO BACK TO DASHBOARD AND ADD MEMORY
  console.log('\n✍️ ADD MEMORY');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  
  // Try clicking first book card to get to book detail
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  if (await firstBookLink.isVisible({ timeout: 3000 })) {
    await firstBookLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREEN_DIR}/09-book-detail.png` });
    
    // Try to add memory
    const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("Write a Memory")').first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREEN_DIR}/10-memory-edit.png` });
      
      // Fill memory
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('This summer we visited the lake house where my grandmother grew up. The smell of pine needles and the sound of crickets brought back so many memories.');
        await page.screenshot({ path: `${SCREEN_DIR}/11-memory-filled.png` });
        
        // Try to add photo
        const photoBtn = page.locator('input[type="file"]').first();
        if (await photoBtn.isVisible({ timeout: 2000 })) {
          console.log('Photo upload found');
        }
        
        // Save
        const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory"), button:has-text("Publish")').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(4000);
          await page.screenshot({ path: `${SCREEN_DIR}/12-memory-saved.png` });
        }
      }
    }
  }

  // Try to create another book
  console.log('\n📖 CREATE ANOTHER BOOK');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  
  const createBtn = page.locator('button:has-text("Create Book"), a:has-text("Create Book")').first();
  if (await createBtn.isVisible({ timeout: 3000 })) {
    await createBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREEN_DIR}/13-books-create.png` });
  }

  console.log('\n✅ Exploration complete');
});
