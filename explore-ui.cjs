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

  // Dashboard screenshot
  await page.screenshot({ path: 'screens-ui-cycle/01-dashboard.png', fullPage: true });
  console.log('✓ Dashboard screenshot');

  // Book links
  const links = await page.locator('a[href*="/books/"]').all();
  console.log('Book links found:', links.length);

  // Go to first book
  const href = await links[0].getAttribute('href');
  await page.goto(BASE + href);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle/02-book-detail.png', fullPage: false });
  console.log('✓ Book detail screenshot');

  // List all buttons and links with text
  const allEls = await page.locator('button, a, [role="button"]').all();
  console.log('\nAll interactive elements on book page:');
  for (const el of allEls) {
    const text = (await el.textContent()).trim() || '';
    const ariaLabel = await el.getAttribute('aria-label') || '';
    const hrefAttr = await el.getAttribute('href') || '';
    if (text.length > 0 || ariaLabel.length > 0) {
      console.log(' -', (text || ariaLabel).substring(0, 60), '| href:', hrefAttr.substring(0, 40));
    }
  }

  // Try creating a new memory
  console.log('\n--- CREATING A NEW MEMORY ---');
  const newMemoryLinks = await page.locator('a[href*="new-memory"], a[href*="/memories/new"], a:has-text("New Memory"), a:has-text("Write a Memory")').all();
  console.log('New memory links found:', newMemoryLinks.length);
  for (const l of newMemoryLinks) {
    console.log(' link text:', await l.textContent(), '| href:', await l.getAttribute('href'));
  }

  // Try direct URL
  await page.goto(BASE + '/memories/new?book_id=223');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  console.log('Current URL after /memories/new:', page.url());
  const memText = await page.locator('body').textContent();
  console.log('Memory form text length:', memText.length);

  // Go to create book page
  console.log('\n--- BOOK NEW PAGE ---');
  await page.goto(BASE + '/books/new');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle/03-new-book.png', fullPage: false });
  console.log('New book page screenshot');

  // Settings page
  console.log('\n--- SETTINGS PAGE ---');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle/04-settings.png', fullPage: false });
  console.log('Settings page screenshot');

  console.log('\nConsole errors:', errors);
  await browser.close();
  console.log('✓ Exploration complete');
}

run().catch(e => { console.error(e); process.exit(1); });
