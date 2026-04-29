import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test.describe('UI Cycle - Phase 1: Login + Dashboard', () => {
  test('login and dashboard loaded', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(4000);
    expect(page.url()).toContain('/dashboard');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-01-dashboard.png', fullPage: true });
  });
});

test.describe('UI Cycle - Phase 2: Create Book Flow', () => {
  test('create book and navigate to it', async ({ page }) => {
    // Login via UI first
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]:has-text("Sign in")').click();
    await page.waitForTimeout(4000);
    expect(page.url()).toContain('/dashboard');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-02-dash-loaded.png', fullPage: true });

    // Create book
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    if (await newBookBtn.isVisible({ timeout: 3000 })) {
      await newBookBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-03-create-modal.png', fullPage: true });
      
      const titleInput = page.locator('#modal-title');
      await titleInput.fill('A Week at the Cabin');
      
      const descInput = page.locator('#modal-desc');
      await descInput.fill('Stories from our beloved cabin on the lake — summers from childhood to present.');
      
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-04-create-filled.png', fullPage: true });
      
      await page.locator('button[type="submit"]:has-text("Create Book")').scrollIntoViewIfNeeded();
      await page.locator('button[type="submit"]:has-text("Create Book")').click({ force: true });
      await page.waitForTimeout(3000);
      
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-05-after-create.png', fullPage: true });
      console.log('Created book at:', page.url());
    }
  });
});

test.describe('UI Cycle - Phase 3: Add Memory', () => {
  test('add memory to a book', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Get existing book URLs from API
    const booksRes = await page.request.get(`${BASE}/api/books`);
    const booksData = await booksRes.json();
    const bookId = booksData.books?.[0]?.id;
    
    if (bookId) {
      // Go to book detail page
      await page.goto(`${BASE}/books/${bookId}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-06-book-detail.png', fullPage: true });
      
      // Click Add Memory
      const addMem = page.locator('a:has-text("Add Memory")').first();
      if (await addMem.isVisible({ timeout: 3000 })) {
        await addMem.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-07-edit-page.png', fullPage: true });
        
        // Look for textarea and fill
        const ta = page.locator('textarea').first();
        if (await ta.isVisible({ timeout: 3000 })) {
          await ta.fill('The station wagon was packed to the gills — sleeping bags, fishing rods, and a cooler that would later prove to be insufficient for a family of five for a full week. We stopped at the Shell station in Millbrook for gas and popsicles.');
          await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-08-memory-filled.png', fullPage: true });
          
          const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory")').first();
          if (await saveBtn.isVisible({ timeout: 2000 })) {
            await saveBtn.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-09-after-save.png', fullPage: true });
          }
        }
      }
    }
  });
});

test.describe('UI Cycle - Phase 4: Settings + Navigation', () => {
  test('settings page and nav flow', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Settings
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-10-settings.png', fullPage: true });
    
    // Upgrade page
    await page.goto(`${BASE}/upgrade`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-11-upgrade.png', fullPage: true });
    
    console.log('Phase 4 complete');
  });
});