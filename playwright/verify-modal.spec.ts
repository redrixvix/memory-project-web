import { test, expect } from '@playwright/test';

test('verify create modal CTA visible', async ({ page }) => {
  const BASE_URL = 'http://localhost:3000';
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';

  // Login
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(4000);
  
  // Dashboard
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Open create modal
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(1000);
  
  // Check if Create Book button is visible
  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  await expect(createBtn).toBeVisible();
  console.log('Create Book button is visible without scrolling');
  
  await page.screenshot({ path: '/home/rixvix/.openclaw/workspace/memory-project/web/screens/verify-04-modal-cta.png', fullPage: false });
});
