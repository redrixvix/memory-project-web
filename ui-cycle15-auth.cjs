const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Capture console errors only
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];

  // 1. Homepage
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens/cycle15_homepage.png', fullPage: false });
  screenshots.push('screens/cycle15_homepage.png');

  // 2. Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens/cycle15_login.png', fullPage: false });
  screenshots.push('screens/cycle15_login.png');

  // 3. Login with test credentials
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 8000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens/cycle15_dashboard.png', fullPage: true });
  screenshots.push('screens/cycle15_dashboard.png');

  // 4. Click New Book button
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screens/cycle15_create_modal.png', fullPage: false });
    screenshots.push('screens/cycle15_create_modal.png');
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
  }

  // 5. Navigate to first book if exists
  const bookLinks = page.locator('a[href^="/books/"]').first();
  if (await bookLinks.isVisible({ timeout: 3000 })) {
    await bookLinks.click();
    await page.waitForURL('**/books/**', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens/cycle15_book_detail.png', fullPage: true });
    screenshots.push('screens/cycle15_book_detail.png');
  }

  // 6. Create a test memory (click Add Memory)
  const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
  if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
    await addMemoryBtn.click();
    await page.waitForURL('**/edit**', { timeout: 5000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens/cycle15_memory_editor.png', fullPage: true });
    screenshots.push('screens/cycle15_memory_editor.png');

    // Fill in a real memory
    await page.fill('textarea[name="answer"]', 'This is a test memory to validate the complete flow. I am exploring the product UI for potential UX improvements and premium feel enhancements.');
    await page.waitForTimeout(300);

    // Save it
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.isVisible()) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens/cycle15_after_save.png', fullPage: true });
      screenshots.push('screens/cycle15_after_save.png');
    }
  }

  console.log('Screenshots captured:', screenshots);
  console.log('Errors:', errors.length ? errors : 'None');
  console.log('Done!');
  await browser.close();
})().catch(err => {
  console.error('Script error:', err.message);
  process.exit(1);
});