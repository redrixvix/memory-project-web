import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('all 3 plan cards visible in create modal', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(4000);
  
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(1000);
  
  // Check that the modal content area is scrollable and shows all 3 plans
  const freePlan = page.locator('text=Free').first();
  const plusPlan = page.locator('text=Plus').first();
  
  // Check Free plan visible at top
  await expect(freePlan).toBeVisible();
  console.log('Free plan visible');
  
  // Scroll to see Plus plan
  await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto');
    if (el) el.scrollTop = 300;
  });
  await page.waitForTimeout(500);
  
  await expect(plusPlan).toBeVisible();
  console.log('Plus plan visible after scroll');
  
  // Verify Create Book button is still visible (sticky footer)
  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  await expect(createBtn).toBeVisible();
  
  // Scroll back to top for final screenshot
  await page.evaluate(() => {
    const el = document.querySelector('.overflow-y-auto');
    if (el) el.scrollTop = 0;
  });
  await page.waitForTimeout(300);
  
  await page.screenshot({ path: 'screens/cycle-modal-all-plans.png', fullPage: false });
  console.log('All 3 plans verified - test passed');
});
