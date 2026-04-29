import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

const screenshots = [];
const results = [];

async function screenshot(name) {
  await page.screenshot({ path: `playwright/screens-ui-cycle/final-${name}.png`, fullPage: true });
  screenshots.push(name);
}

// Login
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// 1. Dashboard
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('dashboard');
results.push({ page: 'Dashboard', url: page.url() });

// 2. Settings - test real-time avatar initials
await page.goto(BASE + '/settings');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('settings');

const nameInput = page.locator('#display-name');
const currentName = await nameInput.inputValue();
const avatarInitials = await page.evaluate(() => 
  document.querySelector('button[class*="rounded-full"] span[class*="text-2xl"]')?.textContent
);
results.push({ page: 'Settings', currentName, avatarInitials, expected: currentName.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) });

// Test name change
await nameInput.fill('Alex Johnson Smith');
await page.waitForTimeout(400);
const newAvatar = await page.evaluate(() => 
  document.querySelector('button[class*="rounded-full"] span[class*="text-2xl"]')?.textContent
);
results.push({ test: 'Avatar real-time update', before: avatarInitials, after: newAvatar, pass: newAvatar === 'AJ' });

// Save
await page.click('button:has-text("Save Changes")');
await page.waitForTimeout(3000);

// 3. Upgrade page
await page.goto(BASE + '/upgrade');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('upgrade-page');

// Check CTA buttons
const ctaButtons = await page.evaluate(() => 
  Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(t => t?.includes('Begin with'))
);
results.push({ page: 'Upgrade CTAs', ctas: ctaButtons });

// Check aria-label on plan group
const planGroupAria = await page.evaluate(() => {
  const group = document.querySelector('[role="group"]');
  return group?.getAttribute('aria-label');
});
results.push({ planGroupAria });

// 4. Book detail with memories (book 176)
await page.goto(BASE + '/books/176');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('book-176-memories');

// Check memory cards visible
const memoryCards = await page.locator('[class*="group/card"]').count();
results.push({ page: 'Book 176', memoryCards, url: page.url() });

// 5. Memory edit page
await page.goto(BASE + '/books/176/edit');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('edit-page');

// Check photo upsell copy changed
const photoUpsellText = await page.evaluate(() => {
  const el = Array.from(document.querySelectorAll('p')).find(p => p.textContent?.includes('Tuck away photos'));
  return el?.textContent || 'NOT FOUND';
});
results.push({ photoUpsellCopy: photoUpsellText.includes('Tuck away') ? 'PASS - warmer copy' : 'FAIL - ' + photoUpsellText });

// 6. Book 174 (empty state)
await page.goto(BASE + '/books/174');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await screenshot('book-174-empty');

console.log('\n=== VALIDATION RESULTS ===');
results.forEach(r => console.log(JSON.stringify(r)));
console.log('\nScreenshots:', screenshots.map(s => `final-${s}.png`).join(', '));

await browser.close();
console.log('\n✅ Validation complete');