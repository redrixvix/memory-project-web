import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('Settings - sticky save button', async ({ page }) => {
  // LOGIN
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);

  // NAVIGATE TO SETTINGS
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/sticky-01-top.png' });
  
  // Scroll to middle
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/sticky-02-mid.png' });

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(300);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/sticky-03-bottom.png' });

  console.log('\n✅ Sticky save test complete');
});
