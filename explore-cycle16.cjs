const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

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

  // Check dashboard structure
  const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'none');
  const cards = await page.$$eval('[class*="rounded-2xl"], [class*="book-card"]', els => els.map(el => ({
    cls: el.className.slice(0, 50),
    text: el.textContent?.trim().slice(0, 80)
  })));
  console.log('H1:', h1);
  console.log('Cards:', JSON.stringify(cards.slice(0, 3), null, 2));

  // Scroll dashboard
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(800);
  await capture('02_dashboard_scrolled');

  // Check book with memories - book 152 (from earlier)
  await page.goto('http://localhost:3000/books/152', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('03_book152');

  // Scroll on book detail
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(600);
  await capture('04_book152_scrolled');

  // Check books list
  await page.goto('http://localhost:3000/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('05_books');

  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
