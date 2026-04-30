const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];

  // 1. Homepage
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens/cycle15_homepage.png', fullPage: false });
  screenshots.push('screens/cycle15_homepage.png');
  console.log('Homepage captured');

  // 2. Login page
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens/cycle15_login.png', fullPage: false });
  screenshots.push('screens/cycle15_login.png');
  console.log('Login page captured');

  // 3. Login with credentials
  console.log('Attempting login...');
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');

  // Wait for navigation with longer timeout
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('Logged in, at dashboard');
  } catch(e) {
    // Check where we are
    const url = page.url();
    console.log('Current URL after login attempt:', url);
    const content = await page.textContent('body');
    console.log('Page content preview:', content.slice(0, 300));
    await page.screenshot({ path: 'screens/cycle15_login_failed.png', fullPage: false });
    console.log('Captured login failed state');
    await browser.close();
    process.exit(1);
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens/cycle15_dashboard.png', fullPage: true });
  screenshots.push('screens/cycle15_dashboard.png');
  console.log('Dashboard captured');

  // 4. Try New Book button
  console.log('Trying New Book button...');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible({ timeout: 3000 })) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'screens/cycle15_create_modal.png', fullPage: false });
    screenshots.push('screens/cycle15_create_modal.png');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    console.log('Create modal captured');
  } else {
    console.log('New Book button not visible');
  }

  // 5. Navigate to first book
  console.log('Looking for book links...');
  const bookLinks = page.locator('a[href*="/books/"]').first();
  if (await bookLinks.isVisible({ timeout: 3000 })) {
    await bookLinks.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens/cycle15_book_detail.png', fullPage: true });
    screenshots.push('screens/cycle15_book_detail.png');
    console.log('Book detail captured');

    // 6. Look for Add Memory
    const addMem = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
    if (await addMem.isVisible({ timeout: 3000 })) {
      await addMem.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens/cycle15_memory_editor.png', fullPage: true });
      screenshots.push('screens/cycle15_memory_editor.png');

      // Fill real content
      const textarea = page.locator('textarea[name="answer"], textarea[id*="answer"], textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('This is a real memory entry created during the UI improvement cycle. Writing about a wonderful afternoon spent with family, capturing the warmth and joy of that moment.');
        await page.waitForTimeout(300);
        const saveBtn = page.locator('button[type="submit"], button:has-text("Save")').first();
        if (await saveBtn.isVisible({ timeout: 3000 })) {
          await saveBtn.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: 'screens/cycle15_after_save.png', fullPage: true });
          screenshots.push('screens/cycle15_after_save.png');
        }
      }
    }
  } else {
    console.log('No book links visible');
    // Try clicking on any link on the page
    const allLinks = await page.locator('a').all();
    console.log('Total links on page:', allLinks.length);
    for (const link of allLinks.slice(0, 5)) {
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      console.log(`Link: ${href} - "${text?.trim()}"`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('Screenshots:', screenshots);
  console.log('Errors:', errors.length ? errors : 'None');
  console.log('Done!');

  await browser.close();
})().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});