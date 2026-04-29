import { test, expect } from '@playwright/test';

test.describe('UI Cycle - Premium Flow', () => {
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';

  test('complete premium flow: login, dashboard, create book, add memory, settings', async ({ page }) => {
    const BASE_URL = 'http://localhost:3000';

    // STEP 1: LOGIN
    console.log('=== LOGIN ===');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(3500);
    
    console.log('After login URL:', page.url());
    // Should redirect to /dashboard
    expect(page.url()).toContain('/dashboard');

    // STEP 2: DASHBOARD
    console.log('\n=== DASHBOARD ===');
    await page.waitForLoadState('networkidle');
    
    // Take dashboard screenshot
    const dashBody = page.locator('body');
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-01-dashboard.png', fullPage: false });
    console.log('Dashboard loaded at:', page.url());

    // STEP 3: CREATE A BOOK
    console.log('\n=== CREATE BOOK ===');
    
    // Click "New Book" button
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    await expect(newBookBtn).toBeVisible({ timeout: 5000 });
    await newBookBtn.click();
    await page.waitForTimeout(800);
    
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-02-create-modal.png', fullPage: false });
    
    // Fill in book title
    const titleInput = page.locator('#modal-title');
    await titleInput.fill('The Lake House Summer');
    
    const descInput = page.locator('#modal-desc');
    await descInput.fill('Memories from our beloved cabin on the lake.');
    
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-03-create-filled.png', fullPage: false });
    
    // Submit
    const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
    await createBtn.click();
    await page.waitForTimeout(3000);
    
    console.log('After book create URL:', page.url());
    // Should be at /books/[id]
    expect(page.url()).toContain('/books/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-04-book-detail.png', fullPage: false });

    // STEP 4: ADD A MEMORY
    console.log('\n=== ADD MEMORY ===');
    
    const addMemBtn = page.locator('a:has-text("Add Memory")').first();
    await expect(addMemBtn).toBeVisible({ timeout: 5000 });
    await addMemBtn.click();
    await page.waitForTimeout(2000);
    
    console.log('Edit page URL:', page.url());
    expect(page.url()).toContain('/edit');
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-05-edit-page.png', fullPage: false });
    
    // Look for textarea / form
    const textarea = page.locator('textarea').first();
    if (await textarea.isVisible({ timeout: 2000 })) {
      await textarea.fill('Every July we packed the station wagon and drove up to cabin 14. The lake was so still in the early morning you could see the mountains reflected perfectly in the water. We swam until our lips turned blue and ate grilled cheese sandwiches by the fire every night.');
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-06-memory-filled.png', fullPage: false });
      
      // Save
      const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-07-after-save.png', fullPage: false });
      }
    }

    // STEP 5: BACK TO DASHBOARD - check book appears
    console.log('\n=== DASHBOARD CHECK ===');
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-08-dashboard-with-book.png', fullPage: false });
    
    // STEP 6: SETTINGS
    console.log('\n=== SETTINGS ===');
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-09-settings.png', fullPage: false });

    // STEP 7: EDIT THE MEMORY (go back to book and click edit)
    console.log('\n=== EDIT MEMORY ===');
    // Click first memory card
    const memCard = page.locator('.rounded-2xl, [class*="memory"]').first();
    if (await memCard.isVisible({ timeout: 3000 })) {
      await memCard.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-10-memory-card.png', fullPage: false });
    }

    console.log('\n=== FLOW COMPLETE ===');
    console.log('All screenshots captured');
  });
});