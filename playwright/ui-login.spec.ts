import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test('login and dashboard', async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(4000);
  
  const url = page.url();
  console.log('After login URL:', url);
  expect(url).toContain('/dashboard');
  
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-val-01-dashboard.png', fullPage: true });
  console.log('Dashboard screenshot taken');
});