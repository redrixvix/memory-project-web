import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
console.log('🔐 Logging in...');
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// Dashboard overview
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/dashboard.png', fullPage: true });
console.log('📸 Dashboard');

// Open New Book modal
console.log('📖 Opening New Book modal...');
await page.click('button:has-text("New Book")');
await page.waitForTimeout(2000);

// Check what plan is pre-selected
const selectedPlanText = await page.locator('[data-state="checked"], [aria-checked="true"]').first().textContent().catch(() => 'not found');
console.log('Selected plan:', selectedPlanText);

// Fill the book form
console.log('Filling book form...');
const titleInput = page.locator('input[id*="title"], input[placeholder*="title" i]').first();
console.log('Title input count:', await titleInput.count());
if (await titleInput.count() > 0) {
  await titleInput.fill('Autumn Weekend in Vermont');
  console.log('Title filled');
} else {
  // Try finding the first text input in the dialog
  const dialogInput = page.locator('[role="dialog"] input[type="text"]').first();
  if (await dialogInput.count() > 0) {
    await dialogInput.fill('Autumn Weekend in Vermont');
    console.log('Filled dialog text input');
  }
}

// Fill description
const descTextarea = page.locator('[role="dialog"] textarea').first();
console.log('Description textarea count:', await descTextarea.count());
if (await descTextarea.count() > 0) {
  await descTextarea.fill('A perfect fall weekend with friends — apple cider, leaf peeping, and a cozy barn dance.');
}

// Check plan options are visible
const planOptions = await page.locator('[role="radio"]').all();
console.log('Plan options:', planOptions.length);

// Screenshot the modal
await page.screenshot({ path: 'playwright/screens-ui-cycle/modal-filled.png', fullPage: true });

// Select Plus plan (click on it)
if (planOptions.length >= 3) {
  await planOptions[2].click(); // Plus plan
  console.log('Selected Plus plan');
  await page.waitForTimeout(500);
}

// Click Create Book
console.log('Clicking Create Book...');
await page.click('button:has-text("Create Book")');
await page.waitForTimeout(6000);
console.log('After create URL:', page.url());
await page.screenshot({ path: 'playwright/screens-ui-cycle/after-new-book.png', fullPage: true });

const newBookId = page.url().match(/\/books\/(\d+)/)?.[1];
console.log('New book ID:', newBookId);

// Now go to the edit page and create memory
if (newBookId) {
  await page.goto(BASE + '/books/' + newBookId + '/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'playwright/screens-ui-cycle/new-book-edit.png', fullPage: true });

  // Fill memory
  const textarea = page.locator('textarea').first();
  if (await textarea.count() > 0) {
    await textarea.fill('We drove up on Friday night, the leaves just starting to turn. By Saturday morning the whole valley was on fire with color — amber, crimson, and every shade of orange imaginable. We walked for hours along the ridge trail, stopping to sketch the old stone walls covered in orange lichen.');
    console.log('Memory filled');
    await page.waitForTimeout(1000);

    // Check if photo upload is available (Plus plan should have it)
    const upsellBox = page.locator('text=Upgrade your plan').first();
    const hasUpsell = await upsellBox.isVisible().catch(() => false);
    console.log('Has upsell (should be false for Plus):', hasUpsell);

    // Check for photo upload elements
    const photoArea = page.locator('text=Photos & audio').first();
    const photoAreaVisible = await photoArea.isVisible().catch(() => false);
    console.log('Photo area visible:', photoAreaVisible);

    const addPhotosBtn = page.locator('text=Add photos').first();
    const addPhotosVisible = await addPhotosBtn.isVisible().catch(() => false);
    console.log('Add photos button visible:', addPhotosVisible);

    await page.screenshot({ path: 'playwright/screens-ui-cycle/edit-with-photo-area.png', fullPage: true });

    // Save memory
    await page.click('button:has-text("Save Memory")');
    await page.waitForTimeout(8000);
    console.log('After save URL:', page.url());
    await page.screenshot({ path: 'playwright/screens-ui-cycle/vermont-after-save.png', fullPage: true });
    console.log('📸 Vermont book after save');
  }
}

// Now check the upgrade page CTA buttons
console.log('\n--- Checking upgrade page ---');
await page.goto(BASE + '/upgrade');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/upgrade-page.png', fullPage: true });

// Check if plan cards have proper CTA
const planCTAs = await page.locator('button:has-text("Begin with")').all();
console.log('CTA buttons:', planCTAs.length);

// Check the settings page
console.log('\n--- Settings page ---');
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-page.png', fullPage: true });

// Check the display name field - does changing it update the avatar?
const nameInput = page.locator('#display-name').first();
const nameVal = await nameInput.inputValue().catch(() => 'not found');
console.log('Display name value:', nameVal);

// Try changing the name
await nameInput.fill('Alexander Smith');
await page.waitForTimeout(500);
const saveBtn = page.locator('button:has-text("Save Changes")').first();
console.log('Save button visible:', await saveBtn.isVisible().catch(() => false));
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-name-changed.png', fullPage: true });

await browser.close();
console.log('\n✅ Analysis complete');