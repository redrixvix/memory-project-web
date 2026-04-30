const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];

  async function capture(name) {
    const path = `screens/cycle15_${name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push(path);
    console.log(`📸 ${name}`);
  }

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(1500);

  // Dashboard full view
  await capture('01_dashboard_full');

  // Book with memories - Summer Stories Collection (book 151 has 5 memories)
  await page.goto('http://localhost:3000/books/152', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('02_book_152_detail');

  // Book with no memories
  await page.goto('http://localhost:3000/books/155', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('03_book_155_empty');

  // Editor - new memory
  await page.goto('http://localhost:3000/books/155/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await capture('04_editor_new');

  // Scroll down in editor
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await capture('05_editor_scrolled');

  // Click in textarea and type
  const textarea = page.locator('textarea').first();
  if (await textarea.isVisible()) {
    await textarea.click();
    await textarea.fill('The summer I turned seven, my grandmother took me to the farmers market. We walked past the honey stand, the baker with the cinnamon rolls, and the old man who sold tomatoes from wooden crates. She let me pick whatever I wanted for lunch. I chose a peach, still warm from the sun. That was the best peach I ever ate.');
    await page.waitForTimeout(1000);
    await capture('06_editor_content_filled');
  }

  // Scroll to bottom of editor
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await capture('07_editor_bottom');

  // Look at the save button area
  const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save")').first();
  if (await saveBtn.isVisible()) {
    const box = await saveBtn.boundingBox();
    console.log('Save button position:', box);
  }

  // Check the prompt selection area
  const promptChips = page.locator('[class*="rounded-full"], [class*="rounded-2xl"]').all();
  console.log('Rounded elements on editor:', promptChips.length);

  // Look at all buttons visible
  const allBtns = await page.locator('button').all();
  for (const btn of allBtns) {
    const text = await btn.textContent();
    if (text?.trim()) console.log('Button:', text.trim().slice(0, 50));
  }

  // Check home page - pricing section
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await capture('08_homepage');

  // Check pricing
  await page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await capture('09_pricing');

  console.log('\n=== ERRORS ===');
  console.log(errors.length ? errors : 'None');
  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});