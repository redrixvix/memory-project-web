const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];
  const OUT = 'screens-cycle18';
  
  const fs = require('fs');
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  async function capture(name) {
    const path = `${OUT}/${name}.png`;
    await page.screenshot({ path, fullPage: true });
    screenshots.push(path);
    console.log(`📸 ${name}`);
  }

  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(3000);
  await capture('01_dashboard');
  
  // Books list
  await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('02_books_list');
  
  // Book detail page
  let bookLink = await page.$('a[href*="/books/"][href*="?"]');
  if (!bookLink) bookLink = await page.$('a[href*="/books/"]');
  if (bookLink) {
    const href = await bookLink.getAttribute('href');
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await capture('03_book_detail');
  }
  
  // Editor
  await page.goto('http://localhost:3000/books/152/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('04_editor_empty');
  
  // Pricing page (logged in view)
  await page.goto('http://localhost:3000/pricing', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('05_pricing');

  // Settings
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('06_settings');

  // ERRORS
  console.log('\n=== ERRORS:', errors.length, '===');
  if (errors.length) errors.slice(0, 5).forEach(e => console.log('ERROR:', e.slice(0, 200)));
  
  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });