import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';
async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(5000);
  
  // Go to dashboard and find a book with 0 memories
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Get all book links with memory count
  const books = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="book-card"]');
    return Array.from(cards).map(c => {
      const titleEl = c.querySelector('h3');
      const memEl = c.querySelector('span[class*="rounded-full"]');
      return { title: titleEl?.textContent, memText: memEl?.textContent };
    });
  });
  console.log('Books on dashboard:', JSON.stringify(books, null, 2));
  
  // Also check /books page directly
  await page.goto(`${BASE}/books`, { waitUntil: 'networkidle' });
  const url = page.url();
  console.log('Redirected to:', url);
  
  await browser.close();
}
run().catch(console.error);
