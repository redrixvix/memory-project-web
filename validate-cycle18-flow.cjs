const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const screenshots = [];
  const OUT = 'screens-cycle18-flow';
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
  await capture('01_dashboard_logged_in');

  // Navigate to book detail
  await page.goto('http://localhost:3000/books/152', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('02_book_detail');

  // Click "Start writing" on empty book
  const startWritingBtn = await page.$('a[href*="/books/152/edit"]');
  if (startWritingBtn) {
    await startWritingBtn.click();
    await page.waitForTimeout(2000);
    await capture('03_editor');
    
    // Type a memory
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('The summer I turned seven, my grandmother taught me to bake her famous apple pie. We stood together in her small kitchen, the windows foggy from the heat of the old gas oven. She let me crimp the edges of the crust with my small fingers, carefully pressing each fold. The kitchen smelled of cinnamon and brown sugar for days afterward. That pie became our tradition every autumn, and even now, whenever I bake one, I think of her flour-dusted hands guiding mine.');
      await page.waitForTimeout(1500);
      await capture('04_editor_with_text');
      
      // Wait for autosave
      await page.waitForTimeout(2000);
      
      // Scroll to save area
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await capture('05_editor_footer');
    }
  }

  // Navigate back to book to see memory card
  await page.goto('http://localhost:3000/books/152', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await capture('06_book_with_memory');

  // Test creating a new book
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await capture('07_dashboard_final');

  // ERRORS
  console.log('\n=== ERRORS:', errors.length, '===');
  if (errors.length) errors.slice(0, 5).forEach(e => console.log('ERROR:', e.slice(0, 200)));
  
  console.log('\n=== SCREENSHOTS ===');
  screenshots.forEach(s => console.log(s));

  await browser.close();
})().catch(err => { console.error('Fatal:', err.message); process.exit(1); });