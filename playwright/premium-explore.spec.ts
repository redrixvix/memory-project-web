import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(600);
}

test('premium exploration cycle - assess UX quality', async ({ page }) => {
  // LOGIN
  console.log('\n🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-01-login.png', fullPage: false });
  
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-02-dashboard-loaded.png', fullPage: true });

  // DASHBOARD - assess visual hierarchy, spacing, cards
  console.log('\n📊 DASHBOARD ANALYSIS');
  await waitForLoad(page);
  
  // Count books, check filter tabs
  const bookLinks = page.locator('a[href*="/books/"]').all();
  console.log('Book links found:', (await bookLinks).length);
  
  // Scroll down to see the full dashboard
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-03-dashboard-scrolled.png', fullPage: true });
  
  // Go to first book
  console.log('\n📖 BOOK DETAIL');
  const firstBook = page.locator('a[href*="/books/"]').first();
  if (await firstBook.isVisible()) {
    await firstBook.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-04-book-detail.png', fullPage: true });
    
    // Check memory count, layout
    const memoryCards = page.locator('[class*="memory"], [class*="card"]').all();
    console.log('Memory/cards on book page:', (await memoryCards).length);
    
    // Scroll to see if there are more memories
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-05-book-scrolled.png', fullPage: true });
  }

  // GO TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-06-settings.png', fullPage: true });

  // GO TO UPGRADE
  console.log('\n💎 UPGRADE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-07-upgrade.png', fullPage: true });

  // GO TO PRICING
  console.log('\n💰 PRICING');
  await page.goto(`${BASE_URL}/pricing`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/premium-08-pricing.png', fullPage: true });
});