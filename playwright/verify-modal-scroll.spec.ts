import { test, expect } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE = 'http://localhost:3000';

test('create book modal scrollable with Plus plan', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  
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
  
  // Check modal opens
  const titleInput = page.locator('#modal-title');
  await expect(titleInput).toBeVisible();
  
  // Check that the modal panel exists and has overflow
  const modal = page.locator('.overflow-y-auto');
  await expect(modal).toBeVisible();
  
  // Scroll down in the modal to see Plus plan
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) scrollContainer.scrollTop = 500;
  });
  await page.waitForTimeout(500);
  
  // Check for Plus plan text
  const plusPlan = page.locator('text=Plus').first();
  const plusVisible = await plusPlan.isVisible();
  console.log('Plus plan visible after scroll:', plusVisible);
  
  // Scroll back to top
  await page.evaluate(() => {
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  });
  await page.waitForTimeout(300);
  
  // Verify Create Book button is visible
  const createBtn = page.locator('button[type="submit"]:has-text("Create Book")');
  await expect(createBtn).toBeVisible();
  
  await page.screenshot({ path: 'screens/cycle-modal-scroll-test.png', fullPage: false });
  console.log('Scroll test complete');
});
