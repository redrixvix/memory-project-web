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
  
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Get all book links with their memory counts from the DOM
  const bookCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('a[href*="/books/"]');
    const seen = new Set();
    const results = [];
    cards.forEach(a => {
      const href = a.getAttribute('href');
      if (seen.has(href)) return;
      seen.add(href);
      // Get memory count - look for the badge text in the card
      const card = a.closest('[class*="rounded-3xl"]');
      const memBadge = card?.querySelector('span');
      results.push({ href, memBadge: memBadge?.textContent?.trim() });
    });
    return results;
  });
  
  console.log('Book links found:', bookCards.length);
  bookCards.forEach(b => console.log(' -', b.href, '|', b.memBadge));
  
  // Try to find one with 0 memories or "Start writing"
  const emptyBooks = bookCards.filter(b => b.memBadge?.includes('Start writing') || b.memBadge?.includes('0'));
  console.log('\nPotentially empty books:', emptyBooks.length);
  emptyBooks.forEach(b => console.log(' -', b.href));
  
  await browser.close();
}
run().catch(console.error);
