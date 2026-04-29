const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens-ui-cycle5';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('=== Fix Validation: Add Memory Button Always Visible ===\n');
  
  // Login
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('1. ✓ Logged in');
  
  // Go to a book that exists
  await page.goto(BASE_URL + '/books/234', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/40-book-hero-fix.png`, fullPage: true });
  
  // Check for Add Memory buttons
  const addMemBtns = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")');
  const count = await addMemBtns.count();
  console.log(`\n2. Found ${count} "Add Memory" elements`);
  
  for (let i = 0; i < count; i++) {
    const tag = await addMemBtns.nth(i).evaluate(el => el.tagName);
    const href = await addMemBtns.nth(i).getAttribute('href');
    const visible = await addMemBtns.nth(i).isVisible();
    console.log(`   [${i}] ${tag} href="${href}" visible=${visible}`);
  }
  
  // Check hero section has Add Memory button
  const heroAddBtn = page.locator('header + main a:has-text("Add Memory")').first();
  const heroVisible = await heroAddBtn.isVisible({ timeout: 2000 });
  console.log(`\n3. Hero "Add Memory" button visible: ${heroVisible}`);
  
  // Check nav has Add Memory button
  const navAddBtn = page.locator('header a:has-text("Add Memory")').first();
  const navVisible = await navAddBtn.isVisible({ timeout: 2000 });
  console.log(`4. Nav "Add Memory" button visible: ${navVisible}`);
  
  await browser.close();
  console.log('\n=== Done ===');
}

main().catch(console.error);
