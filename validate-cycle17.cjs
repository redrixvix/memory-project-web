const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];
  const OUT = 'screens-cycle17';
  
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
  
  // Book detail page - test prompt contrast fix
  const bookLink = await page.$('[class*="card"] a[href*="/books/"]');
  if (bookLink) {
    const href = await bookLink.getAttribute('href');
    await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await capture('05_book_detail_v2');
  }

  // Editor - test contrast fixes
  await page.goto('http://localhost:3000/books/152/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('08_editor_final');
  
  const textarea = await page.$('textarea');
  if (textarea) {
    await textarea.fill('This is a test memory about a wonderful summer afternoon. The sun was setting and we were all gathered around the fire pit.');
    await page.waitForTimeout(1000);
    await capture('09_editor_content');
  }

  // Dashboard final
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('10_dashboard_final');

  // ERRORS
  console.log('\n=== ERRORS:', errors.length, '===');
  if (errors.length) errors.slice(0, 5).forEach(e => console.log('ERROR:', e.slice(0, 200)));
  
  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });
