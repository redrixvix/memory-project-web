import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// Settings - name change
console.log('⚙️ Settings page...');
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Get current avatar
const avatarInitials = await page.evaluate(() => {
  const el = document.querySelector('button[class*="rounded-full"] span[class*="text-2xl"]');
  return el ? el.textContent : 'NOT FOUND';
});
console.log('Current avatar initials:', avatarInitials);

// Change name
const nameInput = page.locator('#display-name');
await nameInput.fill('Alexander Smith');
await page.waitForTimeout(300);

// Get avatar after typing (should still show old initials since not saved)
const avatarAfterTyping = await page.evaluate(() => {
  const el = document.querySelector('button[class*="rounded-full"] span[class*="text-2xl"]');
  return el ? el.textContent : 'NOT FOUND';
});
console.log('Avatar after typing (should be AR):', avatarAfterTyping);

// Save
await page.click('button:has-text("Save Changes")');
await page.waitForTimeout(4000);
console.log('After save URL:', page.url());
await page.screenshot({ path: 'playwright/screens-ui-cycle/settings-after-save.png', fullPage: true });

// Reload and check
await page.reload();
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
const avatarAfterReload = await page.evaluate(() => {
  const el = document.querySelector('button[class*="rounded-full"] span[class*="text-2xl"]');
  return el ? el.textContent : 'NOT FOUND';
});
console.log('Avatar after reload:', avatarAfterReload);

// Now create a memory with photo on a Plus plan book
console.log('\n📝 Creating memory with photo...');
await page.goto(BASE + '/books/179/edit'); // Vermont book (Plus plan based on earlier flow)
await page.waitForLoadState('networkidle');
await page.waitForTimeout(3000);

// Check photo upload visibility
const photoUpsell = await page.locator('text=Upgrade your plan').first().isVisible().catch(() => false);
console.log('Photo upsell visible:', photoUpsell);

if (!photoUpsell) {
  console.log('Photo upload available - this book is on Plus plan');
  
  // Try to attach a photo
  const fileInput = page.locator('input[type="file"]').first();
  console.log('File input count:', await fileInput.count());
  
  if (await fileInput.count() > 0) {
    try {
      await fileInput.setInputFiles('test-photo.png');
      console.log('Photo attached!');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'playwright/screens-ui-cycle/plus-plan-photo-attached.png', fullPage: true });
    } catch (e) {
      console.log('Photo attach failed:', e.message.split('\n')[0]);
    }
  }
} else {
  console.log('Photo upsell visible - this book is on Free plan');
}

// Check the upgrade page CTAs more carefully
console.log('\n💎 Checking upgrade page...');
await page.goto(BASE + '/upgrade');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);

// Find the CTA buttons with "Begin with" text
const ctaButtons = await page.locator('button:has-text("Begin with")').all();
console.log('CTA buttons found:', ctaButtons.length);
for (const btn of ctaButtons) {
  const text = await btn.textContent();
  console.log('CTA:', text);
}

// Check plan cards are properly visible
const planCardsContainer = page.locator('[role="group"]').first();
const planCardsAriaLabel = await planCardsContainer.getAttribute('aria-label').catch(() => 'not found');
console.log('Plan group aria-label:', planCardsAriaLabel);

await page.screenshot({ path: 'playwright/screens-ui-cycle/upgrade-page-final.png', fullPage: true });

await browser.close();
console.log('\n✅ Done');