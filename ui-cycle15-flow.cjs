const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];

  // 1. Login
  console.log('=== LOGIN ===');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/cycle15_dashboard.png', fullPage: true });
  screenshots.push('screens/cycle15_dashboard.png');

  // 2. Navigate to a book
  console.log('=== BOOK DETAIL ===');
  await page.goto('http://localhost:3000/books/151', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/cycle15_book_151.png', fullPage: true });
  screenshots.push('screens/cycle15_book_151.png');

  // 3. Add Memory — go to editor
  console.log('=== MEMORY EDITOR ===');
  await page.goto('http://localhost:3000/books/151/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'screens/cycle15_editor.png', fullPage: true });
  screenshots.push('screens/cycle15_editor.png');

  // Get current URL to confirm we're in editor
  console.log('Editor URL:', page.url());

  // 4. Select a prompt
  const promptDropdown = page.locator('select').first();
  if (await promptDropdown.isVisible({ timeout: 2000 })) {
    await promptDropdown.selectOption({ index: 1 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screens/cycle15_editor_with_prompt.png', fullPage: true });
    screenshots.push('screens/cycle15_editor_with_prompt.png');
  }

  // 5. Type a memory
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible({ timeout: 2000 })) {
    await textarea.fill('This is a wonderful memory about a summer afternoon spent in the garden with my grandmother. The warmth of the sunlight, the smell of fresh flowers, and her gentle laughter are moments I will never forget. These are the stories that bind our family together.');
    await page.waitForTimeout(500);

    // Count words
    const content = await textarea.inputValue();
    const words = content.trim().split(/\s+/).length;
    console.log('Word count:', words);

    await page.screenshot({ path: 'screens/cycle15_editor_filled.png', fullPage: true });
    screenshots.push('screens/cycle15_editor_filled.png');
  }

  // 6. Scroll down to see full editor
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screens/cycle15_editor_scrolled.png', fullPage: true });
  screenshots.push('screens/cycle15_editor_scrolled.png');

  console.log('\n=== SUMMARY ===');
  console.log('Screenshots:', screenshots);
  console.log('Errors:', errors.length ? errors : 'None');

  await browser.close();
  console.log('Done!');
})().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});