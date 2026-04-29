import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
console.log('🔐 Logging in...');
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// Dashboard explore - find the create book button
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Look for Create Book button or modal trigger
console.log('Looking for create book trigger...');

// Check for buttons with "new", "create", "add", "book" in text
const buttons = await page.locator('button').all();
for (const btn of buttons) {
  const text = await btn.textContent().catch(() => '');
  const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
  if (text.toLowerCase().includes('book') || text.toLowerCase().includes('new') || text.toLowerCase().includes('create')) {
    console.log('Found button:', { text: text.trim(), ariaLabel });
  }
}

// Look for links that say "Create book" or similar
const links = await page.locator('a').all();
for (const lnk of links) {
  const text = await lnk.textContent().catch(() => '');
  const href = await lnk.getAttribute('href').catch(() => '');
  if (text.toLowerCase().includes('create') && text.toLowerCase().includes('book')) {
    console.log('Found link:', { text: text.trim(), href });
  }
}

// Screenshot dashboard to see the create button
await page.screenshot({ path: 'playwright/screens-ui-cycle/dashboard-annotated.png', fullPage: true });
console.log('📸 Dashboard annotated');

// Get the page source to understand the layout
const html = await page.content();
const createBookIdx = html.toLowerCase().indexOf('create book');
const newBookIdx = html.toLowerCase().indexOf('new book');
console.log('create book in HTML:', createBookIdx > 0 ? 'YES at ' + createBookIdx : 'NO');
console.log('new book in HTML:', newBookIdx > 0 ? 'YES at ' + newBookIdx : 'NO');

// Look for any modal trigger elements
const modalTriggers = await page.locator('[data-modal-trigger], [aria-haspopup="dialog"], [role="dialog"]').all();
console.log('Modal elements:', modalTriggers.length);

// Click any button that might be "New Book" or "Create Book"
const allButtonTexts = await page.evaluate(() => {
  return Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
});
console.log('All button texts:', allButtonTexts);

await browser.close();