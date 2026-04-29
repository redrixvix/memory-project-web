import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

test('settings - display name input has proper label association', async ({ page }) => {
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');

  // Check the display name label is associated with the input
  const displayNameLabel = page.locator('label[for="display-name"]');
  await expect(displayNameLabel).toBeVisible();

  // Check the input has the correct id
  const displayNameInput = page.locator('#display-name');
  await expect(displayNameInput).toBeVisible();

  // Check that clicking label focuses input
  await displayNameLabel.click();
  await expect(displayNameInput).toBeFocused();
});

test('upgrade - redundant bottom book selector removed', async ({ page }) => {
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  await page.goto(BASE + '/upgrade');
  await page.waitForLoadState('networkidle');

  // Should have ONE book selector dropdown, not two
  const selects = page.locator('select');
  await expect(selects).toHaveCount(1);

  // Should have a label with id for the select
  const label = page.locator('#book-selector-label');
  await expect(label).toBeVisible();

  // Plan cards should be grouped with aria-label
  const planGroup = page.locator('[role="group"]');
  await expect(planGroup).toBeVisible();
});

test('memory creation flow - verify edit and save', async ({ page }) => {
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // Navigate to a book and create memory
  await page.goto(BASE + '/books/176/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);

  // Type memory text
  const textarea = page.locator('textarea').first();
  await textarea.fill('The golden light of the late afternoon sun filtered through the pine branches as we made our way down the trail to the lake. There was that specific sound — the soft crunch of needles underfoot combined with the distant murmur of water lapping against the shore.');

  await page.waitForTimeout(300);

  // Click save
  const saveBtn = page.getByRole('button', { name: /save/i }).first();
  await saveBtn.click();

  // Wait for navigation back to book
  await page.waitForURL(/books\/176$/, { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Verify the memory text appears
  const memoryVisible = await page.locator('text=golden light').count();
  console.log('Memory visible:', memoryVisible);
  expect(memoryVisible).toBeGreaterThan(0);
});