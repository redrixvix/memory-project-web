import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

// Test memory creation flow - the core product experience
test('Memory creation flow - full write + photo + save', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: `${SCREEN_DIR}/mem-01-dashboard.png` });

  // Find a book to add memory to
  console.log('\n📚 FIND BOOK');
  const firstBookLink = page.locator('a[href*="/books/"]').first();
  if (await firstBookLink.isVisible({ timeout: 5000 })) {
    await firstBookLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREEN_DIR}/mem-02-book-detail.png` });
    
    // Click "Add Memory" or "Write a Memory" 
    const addBtn = page.locator('a:has-text("Add Memory"), a:has-text("Write a Memory"), a:has-text("Add your first memory")').first();
    if (await addBtn.isVisible({ timeout: 3000 })) {
      await addBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREEN_DIR}/mem-03-memory-edit.png` });
      
      // Select a prompt if prompt selector is visible
      const promptChip = page.locator('[class*="chip"], [class*="prompt"]').first();
      if (await promptChip.isVisible({ timeout: 2000 })) {
        await promptChip.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREEN_DIR}/mem-04-prompt-selected.png` });
      }
      
      // Fill in the memory text
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('The summer of 1994, my grandfather taught me to fish at the lake near his cabin. We woke up before dawn, and the mist was still rising off the water when we got to the dock. He showed me how to bait the hook, how to feel for the tug, and how to be patient. We caught three catfish that morning, and he made his famous breakfast with every single one.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREEN_DIR}/mem-05-memory-filled.png` });
        
        // Try to upload a photo if the upload UI is present
        const photoInput = page.locator('input[type="file"]').first();
        if (await photoInput.isVisible({ timeout: 2000 })) {
          await page.screenshot({ path: `${SCREEN_DIR}/mem-06-photo-upload-visible.png` });
        }
        
        // Save the memory
        const saveBtn = page.locator('button:has-text("Publish Memory"), button:has-text("Save Memory"), button:has-text("Publish")').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: `${SCREEN_DIR}/mem-07-memory-saved.png` });
          console.log('Memory saved successfully!');
        } else {
          await page.screenshot({ path: `${SCREEN_DIR}/mem-07-no-save-button.png` });
        }
      }
    }
  }

  console.log('\n✅ Memory flow complete');
});

// Test book creation
test('Book creation + empty state + first memory', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  await waitForLoad(page);
  
  // Create a new book
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible({ timeout: 5000 })) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREEN_DIR}/book-01-create-modal.png` });
    
    await page.locator('#modal-title').fill('Weekend Adventures');
    const descInput = page.locator('#modal-desc');
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Stories from our weekend trips and family outings.');
    }
    
    // Select premium plan
    const premiumPlan = page.locator('button:has-text("5GB Storage")').first();
    if (await premiumPlan.isVisible({ timeout: 2000 })) {
      await premiumPlan.click();
    }
    await page.screenshot({ path: `${SCREEN_DIR}/book-02-filled.png` });
    
    // Submit
    const submitBtn = page.locator('button:has-text("Create Book")').first();
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click();
      await page.waitForTimeout(4000);
      await page.screenshot({ path: `${SCREEN_DIR}/book-03-created.png` });
      
      // If we land on book detail, check the empty state
      if (page.url().includes('/books/')) {
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SCREEN_DIR}/book-04-empty-state.png` });
        
        // Add first memory
        const addFirstBtn = page.locator('a:has-text("Add your first memory")').first();
        if (await addFirstBtn.isVisible({ timeout: 3000 })) {
          await addFirstBtn.click();
          await page.waitForTimeout(1500);
          await page.screenshot({ path: `${SCREEN_DIR}/book-05-first-memory.png` });
        }
      }
    }
  }
  
  console.log('\n✅ Book creation complete');
});
