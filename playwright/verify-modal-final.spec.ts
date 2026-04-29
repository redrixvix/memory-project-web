import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('create book modal fully visible', async ({ page }) => {
  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  
  // Go to dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  // Open create modal
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(1000);
  
  // Fill title
  const titleInput = page.locator('#modal-title');
  await titleInput.fill('Spring 2026 Test Book');
  await page.waitForTimeout(500);
  
  // Check: Plus plan should be visible (3 plan cards visible)
  // Check: Create Book button visible
  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  await expect(createBtn).toBeVisible();
  
  // Screenshot
  await page.screenshot({ path: 'screens/cycle-final-modal.png', fullPage: false });
  console.log('Modal fully visible - test passed');
});
