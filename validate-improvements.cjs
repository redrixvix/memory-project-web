const { chromium } = require('playwright');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const BASE = 'http://localhost:3133';
  
  // Login
  await page.goto(`${BASE}/login`);
  await page.waitForTimeout(1000);
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  
  // Dashboard — capture CTA buttons
  await page.goto(`${BASE}/dashboard`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-improvements/01-dashboard.png', fullPage: true });
  console.log('✓ Dashboard captured');
  
  // Hover a book card to see CTA
  const firstCard = await page.$('.book-card');
  if (firstCard) {
    await firstCard.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-improvements/02-card-hover.png', fullPage: true });
    console.log('✓ Card hover captured');
  }
  
  // Navigate to a book with memories (ID 231)
  await page.goto(`${BASE}/books/231`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-improvements/03-book-detail.png', fullPage: true });
  console.log('✓ Book detail captured');
  
  // Scroll to see memories
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screens-improvements/04-book-scroll.png', fullPage: true });
  
  // Empty state book (ID 232)
  await page.goto(`${BASE}/books/232`);
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-improvements/05-empty-book.png', fullPage: true });
  console.log('✓ Empty book state captured');
  
  // Memory editor via prompt link (should auto-focus textarea)
  await page.goto(`${BASE}/books/232/edit?prompt=What+is+your+earliest+childhood+memory?`);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens-improvements/06-memory-editor.png', fullPage: true });
  
  // Check textarea focused state
  const textarea = await page.$('textarea');
  if (textarea) {
    const isFocused = await textarea.evaluate(el => document.activeElement === el);
    console.log(`Textarea auto-focused: ${isFocused}`);
  }
  
  await browser.close();
  console.log('Validation complete — screenshots in screens-improvements/');
}

main().catch(err => { console.error(err); process.exit(1); });