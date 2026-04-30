const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const baseURL = 'http://localhost:3000';
  const email = 'RedRixvix@proton.me';
  const password = 'd[,<(q<HC6V~MJvV';

  const results = [];
  const ts = Date.now();
  const outDir = `screens-cycle21-${ts}`;
  const fs = require('fs');
  fs.mkdirSync(outDir, { recursive: true });

  async function screenshot(name) {
    await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });
    results.push(name);
  }

  // 1. Login
  console.log('Logging in...');
  await page.goto(`${baseURL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('Logged in');
  await screenshot('01-after-login');

  // 2. Dashboard
  console.log('Dashboard...');
  await page.waitForTimeout(1500);
  await screenshot('02-dashboard');

  // 3. Books page
  await page.goto(`${baseURL}/books`);
  await page.waitForTimeout(1000);
  await screenshot('03-books');

  // 4. Book detail
  await page.goto(`${baseURL}/books/152`);
  await page.waitForTimeout(1500);
  await screenshot('04-book-detail');

  // 5. Memory editor
  await page.goto(`${baseURL}/books/152/edit`);
  await page.waitForTimeout(2000);
  await screenshot('05-editor-top');

  // 6. Type in textarea
  await page.click('textarea');
  await page.type('textarea', 'Testing the memory editor with a sample memory entry to verify the writing experience feels smooth and premium.');
  await page.waitForTimeout(800);
  await screenshot('06-editor-with-text');

  // 7. Editor bottom (submit area)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await screenshot('07-editor-bottom');

  // 8. Settings page
  await page.goto(`${baseURL}/settings`);
  await page.waitForTimeout(1500);
  await screenshot('08-settings');

  await browser.close();
  console.log('Done. Screens:', results.join(', '));
})();
