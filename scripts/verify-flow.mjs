import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  async function screenshot(name) {
    const path = `screens/verify-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 ${path}`);
  }

  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(5000);
  await screenshot('login-ok');

  // Check the book with prompt chips - find an empty book
  // Go to books list to find a book with 0 memories
  const booksPage = await context.newPage();
  await booksPage.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await booksPage.waitForTimeout(2000);
  
  // Get all book links
  const bookLinks = await booksPage.locator('a[href*="/books/"]').all();
  console.log('Found', bookLinks.length, 'book links');
  
  for (let i = 0; i < Math.min(bookLinks.length, 5); i++) {
    const href = await bookLinks[i].getAttribute('href');
    console.log(`Book ${i+1}: ${href}`);
  }

  // Navigate to books page directly to see book list  
  await page.goto(`${BASE}/books`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await screenshot('books-page');
  
  // Find the Spring Garden book we created
  const springBookLink = page.locator('a:has-text("Spring Garden")');
  if (await springBookLink.count() > 0) {
    await springBookLink.first().click();
    await page.waitForTimeout(2000);
    await screenshot('spring-garden-book');
    
    // Check for the prompt chips in empty state
    const promptChips = page.locator('text=A trip that changed me');
    console.log('Prompt chips visible:', await promptChips.count() > 0);
  }

  // Check memory form upgrade box
  const memoryLink = page.locator('a[href*="/edit"]').first();
  if (await memoryLink.count() > 0) {
    await memoryLink.click();
    await page.waitForTimeout(2000);
    await screenshot('memory-form-upgrade');
    
    // Check upgrade box size
    const upgradeText = page.locator('text=Add photos & voice notes');
    console.log('Compact upgrade box visible:', await upgradeText.count() > 0);
  }

  await browser.close();
  console.log('Done');
}

run().catch(console.error);