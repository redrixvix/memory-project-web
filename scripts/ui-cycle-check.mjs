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

// Check upgrade page CTAs in detail
console.log('💎 Upgrade page analysis...');
await page.goto(BASE + '/upgrade');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/upgrade-page.png', fullPage: true });

// Get the plan card structure
const planCards = await page.locator('[role="radio"]').all();
console.log('Plan cards (role=radio):', planCards.length);

// Get all buttons on upgrade page
const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean));
console.log('All buttons:', JSON.stringify(buttons));

// Check each plan card for its CTA button
const planCardInfo = await page.evaluate(() => {
  const cards = document.querySelectorAll('[role="radio"]');
  return Array.from(cards).map(card => ({
    planName: card.querySelector('h3, [class*="font-semibold"]')?.textContent,
    buttons: Array.from(card.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean),
    html: card.outerHTML.slice(0, 500)
  }));
});
console.log('Plan cards info:', JSON.stringify(planCardInfo, null, 2));

// Now check settings - name change → avatar update
console.log('\n⚙️ Settings - name change + avatar...');
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-page.png', fullPage: true });

const nameInput = page.locator('#display-name');
const currentName = await nameInput.inputValue().catch(() => 'not found');
console.log('Current name:', currentName);

// Get avatar initials
const avatarText = await page.locator('[class*="w-10"][class*="h-10"], [class*="w-12"][class*="h-12"]').first().textContent().catch(() => 'not found');
console.log('Avatar text:', avatarText);

// Change the name
await nameInput.fill('Alexander Smith');
await page.waitForTimeout(500);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-name-changed.png', fullPage: true });

// Get new avatar text
const newAvatarText = await page.locator('[class*="w-10"][class*="h-10"], [class*="w-12"][class*="h-12"]').first().textContent().catch(() => 'not found');
console.log('New avatar text after name change:', newAvatarText);

// Save changes
await page.click('button:has-text("Save Changes")');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-after-save.png', fullPage: true });

// Reload and check if avatar persists
await page.reload();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
const avatarAfterReload = await page.locator('[class*="w-10"][class*="h-10"], [class*="w-12"][class*="h-12"]').first().textContent().catch(() => 'not found');
console.log('Avatar after reload:', avatarAfterReload);

await browser.close();
console.log('✅ Analysis complete');