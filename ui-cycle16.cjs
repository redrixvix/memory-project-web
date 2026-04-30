const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];
  const OUT = 'screens/cycle16';

  async function capture(name) {
    const path = `${OUT}_${name}.png`;
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
  await page.waitForTimeout(2000);
  await capture('01_dashboard');

  // Hero section check
  const heroSection = await page.$('[class*="hero"]');
  const bookCards = await page.$$('[class*="book-card"], [class*="BookCard"]');
  const fabBtn = await page.$('[class*="fab"], button[class*="new"], [aria-label*="new memory" i]');
  const emptyState = await page.$('[class*="empty"]');
  console.log('Hero section:', !!heroSection);
  console.log('Book cards found:', bookCards.length);
  console.log('FAB button:', fabBtn ? await fabBtn.textContent() : 'none');
  console.log('Empty state:', !!emptyState);

  // Book detail page
  await page.goto('http://localhost:3000/books/152', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('02_book_detail');

  // Editor page
  await page.goto('http://localhost:3000/books/152/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await capture('03_editor');

  // Check editor toolbar/buttons
  const editorBtns = await page.$$('button');
  for (const btn of editorBtns) {
    const text = await btn.textContent();
    if (text?.trim()) console.log('Editor btn:', text.trim().slice(0, 60));
  }

  // Check settings
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('04_settings');

  // Books list
  await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('05_books');

  console.log('\n=== ERRORS ===');
  console.log(errors.length ? errors : 'None');
  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
