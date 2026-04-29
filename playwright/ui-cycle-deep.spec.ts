import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test.describe('Premium UI Cycle - Deep Usage', () => {

  async function login(page: any) {
    await page.goto(BASE + '/login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(1500);
  }

  test('01 - full memory creation flow with photo and audio', async ({ page }) => {
    await login(page);

    // Go to the first book
    const bookLink = page.locator('a[href*="/books/"]').first();
    await bookLink.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/d-01-book-detail.png', fullPage: true });

    // Click "Add Memory" 
    const addBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    await addBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/d-02-memory-form.png', fullPage: true });

    // Check the form elements
    const promptSelect = page.locator('select[name="prompt"], select').first();
    const answerTextarea = page.locator('textarea[name="answer"], textarea').first();
    
    if (await promptSelect.isVisible({ timeout: 3000 })) {
      await page.screenshot({ path: 'screens/ui-cycle/d-03-form-with-prompt.png', fullPage: true });
    }

    // Select a prompt and fill answer
    if (await promptSelect.isVisible()) {
      const options = await promptSelect.locator('option').all();
      console.log(`Found ${options.length} prompt options`);
      if (options.length > 1) {
        await options[1].click();
        await page.waitForTimeout(500);
      }
    }

    if (await answerTextarea.isVisible()) {
      await answerTextarea.fill('This was one of the most beautiful days we spent together. The sun was warm, the food was delicious, and we laughed until our sides hurt. These are the moments I want to remember forever.');
      await page.waitForTimeout(300);
    }

    // Upload photo if input exists
    const fileInputs = page.locator('input[type="file"]').all();
    const fileCount = await fileInputs.count();
    console.log(`Found ${fileCount} file inputs`);
    
    for (let i = 0; i < fileCount; i++) {
      const input = fileInputs.nth(i);
      const accept = await input.getAttribute('accept');
      console.log(`Input ${i}: accept=${accept}`);
    }

    await page.screenshot({ path: 'screens/ui-cycle/d-04-form-filled.png', fullPage: true });
  });

  test('02 - explore book edit page fully', async ({ page }) => {
    await login(page);

    // Go to a book and then to edit page
    const bookLink = page.locator('a[href*="/books/"]').first();
    let bookId = '1';
    if (await bookLink.isVisible({ timeout: 3000 })) {
      const href = await bookLink.getAttribute('href');
      const match = href?.match(/\/books\/(\d+)/);
      if (match) bookId = match[1];
    }

    // Go to edit page directly
    await page.goto(BASE + `/books/${bookId}/edit`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screens/ui-cycle/d-05-edit-page.png', fullPage: true });

    // Check all form elements
    const allInputs = await page.locator('input, select, textarea').all();
    console.log(`Found ${allInputs.length} form elements on edit page`);
    for (let i = 0; i < allInputs.length; i++) {
      const tag = await allInputs[i].evaluate(el => el.tagName);
      const type = await allInputs[i].getAttribute('type');
      const name = await allInputs[i].getAttribute('name');
      const placeholder = await allInputs[i].getAttribute('placeholder');
      console.log(`  ${i}: <${tag}> type=${type} name=${name} placeholder=${placeholder}`);
    }

    // Check for any visible buttons
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons`);
    for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
      const text = await allButtons[i].textContent();
      console.log(`  Button ${i}: "${text?.trim()}"`);
    }
  });

  test('03 - dashboard empty state exploration', async ({ page }) => {
    await login(page);
    
    // Check the dashboard at various scroll positions
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens/ui-cycle/d-06-dash-top.png', fullPage: true });

    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens/ui-cycle/d-07-dash-middle.png', fullPage: true });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens/ui-cycle/d-08-dash-bottom.png', fullPage: true });

    // Check book count, pagination
    const bookCards = page.locator('.book-card, [class*="book"]').all();
    console.log(`Found ${await bookCards.count()} book cards`);

    const paginationBtns = page.locator('button[aria-label*="Page"], button[aria-label*="page"]').all();
    console.log(`Found ${await paginationBtns.count()} pagination buttons`);
  });

  test('04 - explore upgrade page', async ({ page }) => {
    await login(page);
    await page.goto(BASE + '/upgrade');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/ui-cycle/d-09-upgrade.png', fullPage: true });

    // Check plan cards
    const planCards = page.locator('[role="group"], .plan-card, .card').all();
    console.log(`Found ${planCards.length} cards/sections`);
  });

  test('05 - mobile responsive check on dashboard', async ({ page }) => {
    await login(page);
    
    // Emulate mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screens/ui-cycle/d-10-mobile-dashboard.png', fullPage: true });

    // Check if menu button works
    const menuBtn = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"], [aria-label*="menu"]').first();
    if (await menuBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screens/ui-cycle/d-11-mobile-menu.png', fullPage: true });
    }

    // Reset viewport
    await page.setViewportSize({ width: 1440, height: 900 });
  });

  test('06 - real memory creation - fill form and save', async ({ page }) => {
    await login(page);

    // Get first book ID
    const bookLink = page.locator('a[href*="/books/"]').first();
    let bookId = '1';
    if (await bookLink.isVisible({ timeout: 3000 })) {
      const href = await bookLink.getAttribute('href');
      const match = href?.match(/\/books\/(\d+)/);
      if (match) bookId = match[1];
    }

    await page.goto(BASE + `/books/${bookId}/edit`);
    await page.waitForTimeout(3000);

    // Select first available prompt
    const promptSelect = page.locator('select').first();
    if (await promptSelect.isVisible({ timeout: 2000 })) {
      const options = await promptSelect.locator('option').all();
      if (options.length > 1) {
        await options[1].click();
        await page.waitForTimeout(300);
      }
    }

    // Fill in the answer
    const answerArea = page.locator('textarea').first();
    if (await answerArea.isVisible({ timeout: 2000 })) {
      await answerArea.fill('The laughter that day was uncontrollable. We sat on the porch watching the sunset, talking about everything and nothing. This is what matters most.');
    }

    await page.screenshot({ path: 'screens/ui-cycle/d-12-memory-form-complete.png', fullPage: true });

    // Try to upload a photo
    const photoInput = page.locator('input[type="file"][accept*="image"], input[type="file"]').first();
    if (await photoInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await photoInput.setInputFiles('./test-photo.png');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens/ui-cycle/d-13-photo-uploaded.png', fullPage: true });
    }

    // Save the memory
    const saveBtn = page.locator('button[type="submit"], button:has-text("Save Memory"), button:has-text("Add Memory")').first();
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens/ui-cycle/d-14-memory-saved.png', fullPage: true });
    }
  });

  test('07 - check dropdown menu quality', async ({ page }) => {
    await login(page);

    // Open user dropdown
    const avatar = page.locator('[class*="avatar"], img[alt*="avatar"], [class*="user"]').first();
    if (await avatar.isVisible({ timeout: 3000 })) {
      await avatar.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'screens/ui-cycle/d-15-user-dropdown.png', fullPage: true });
    }
  });

  test('08 - check book detail memory cards for edit/delete controls', async ({ page }) => {
    await login(page);

    const bookLink = page.locator('a[href*="/books/"]').first();
    let bookId = '1';
    if (await bookLink.isVisible({ timeout: 3000 })) {
      const href = await bookLink.getAttribute('href');
      const match = href?.match(/\/books\/(\d+)/);
      if (match) bookId = match[1];
    }

    await page.goto(BASE + `/books/${bookId}`);
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'screens/ui-cycle/d-16-book-with-memories.png', fullPage: true });

    // Look for memory cards
    const memoryCards = page.locator('[class*="chapter"], [class*="memory-card"], .rounded-2xl').all();
    console.log(`Found ${memoryCards.length} potential memory cards`);

    // Check if cards have edit/delete buttons
    const editButtons = page.locator('button:has-text("Edit"), button:has-text("Delete"), button:has-text("...")').all();
    console.log(`Found ${editButtons.length} edit/delete buttons on memory cards`);
  });
});