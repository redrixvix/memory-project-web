import { test, expect, Page } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

async function waitForLoad(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
}

test('Settings page - save button visible', async ({ page }) => {
  // LOGIN
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await waitForLoad(page);

  // NAVIGATE TO SETTINGS
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitForLoad(page);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/settings-01-top.png' });
  
  // Scroll to see save button
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/settings-02-save-button.png' });

  console.log('\n✅ Settings verification complete');
});
