const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // Login
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  console.log('✓ Logged in');

  await page.screenshot({ path: 'screens-ui-cycle/before-01-dashboard.png', fullPage: true });
  console.log('✓ Dashboard before shot');

  // Go to a book
  const links = await page.locator('a[href*="/books/"]').all();
  const href = await links[0].getAttribute('href');
  await page.goto(BASE + href);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle/before-02-book-detail.png', fullPage: false });
  console.log('✓ Book detail before shot');

  // Go to edit memory flow (Add Memory)
  await page.goto(BASE + '/books/223/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle/before-03-memory-form.png', fullPage: false });
  console.log('✓ Memory form before shot');

  // Check body text to understand the form
  const formText = await page.locator('body').textContent();
  console.log('\nMemory form text (first 1500):', formText.substring(0, 1500));

  // Look at the book new page
  await page.goto(BASE + '/books/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle/before-04-new-book.png', fullPage: false });
  console.log('✓ New book page shot');

  // Check empty library
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle/before-05-empty-dashboard.png', fullPage: true });
  console.log('✓ Dashboard empty shot');

  // Settings page
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle/before-06-settings.png', fullPage: false });
  console.log('✓ Settings shot');

  const settingsText = await page.locator('body').textContent();
  console.log('\nSettings text (first 1000):', settingsText.substring(0, 1000));

  console.log('\nConsole errors:', errors);
  await browser.close();
  console.log('✓ Done');
}

run().catch(e => { console.error(e); process.exit(1); });
