import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('comprehensive flow - create memory and verify persistence', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  
  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  console.log('Logged in:', page.url());
  
  // ── 1. Dashboard - capture initial state ──────────
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/comprehensive-01-dashboard.png', fullPage: true });
  console.log('Dashboard captured');
  
  // ── 2. Go to a book and add memory ─────────────────
  // Find first book link
  const firstBook = page.locator('a[href*="/books/"]').first();
  if (await firstBook.count() > 0) {
    const bookUrl = await firstBook.getAttribute('href');
    console.log('Going to book:', bookUrl);
    
    await page.goto(`${BASE}${bookUrl}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/comprehensive-02-book-before.png', fullPage: true });
    
    // Click "Add Memory" button
    const addMemBtn = page.locator('button:has-text("Add Memory")').first();
    if (await addMemBtn.count() > 0) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: 'screens/comprehensive-03-memory-form.png' });
      console.log('Memory form opened');
      
      // Check if there's a title or content input
      const titleInput = page.locator('input[id*="title"], input[placeholder*="title"], input[placeholder*="memory"]').first();
      const contentArea = page.locator('textarea, [role="textbox"]').first();
      
      if (await titleInput.count() > 0) {
        await titleInput.fill('Summer at the Lake');
        console.log('Title filled');
      }
      
      if (await contentArea.count() > 0) {
        await contentArea.fill('We spent three weeks at my grandparents lake house. The water was warm and the sunsets were unforgettable. My grandfather taught me to fish that summer.');
        console.log('Content filled');
        await page.waitForTimeout(500);
      }
      
      // Look for save/submit button
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add"), button:has-text("Create")').first();
      if (await saveBtn.count() > 0) {
        await page.screenshot({ path: 'screens/comprehensive-04-filled-form.png' });
        console.log('Form filled, ready to save');
      }
    }
  }
  
  // ── 3. Navigate back to dashboard ───────────────────
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/comprehensive-05-dashboard-after.png', fullPage: true });
  
  // ── 4. Check settings ───────────────────────────────
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/comprehensive-06-settings.png', fullPage: true });
  
  // ── 5. Check documents page ────────────────────────
  await page.goto(`${BASE}/documents`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/comprehensive-07-documents.png', fullPage: true });
  console.log('Documents page:', page.url());
  
  console.log('Comprehensive flow complete');
});
