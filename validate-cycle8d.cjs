const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const BASE = 'http://localhost:3133';

  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('✓ Login');

  // Test: Settings page form quality
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Check for disabled button readability
  const inputs = await page.locator('input').count();
  console.log(`Settings inputs: ${inputs}`);
  
  // Check if name field has a value
  const nameInput = page.locator('input[id="name"], input[placeholder*="name"], input[placeholder*="Name"]').first();
  const nameValue = await nameInput.inputValue().catch(() => 'not found');
  console.log(`Name field value: ${nameValue}`);

  // Check submit button state
  const submitBtn = page.locator('button[type="submit"]').first();
  const isDisabled = await submitBtn.isDisabled().catch(() => 'unknown');
  console.log(`Submit button disabled: ${isDisabled}`);

  // Dashboard: FAB quality check
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
  
  // Scroll down to trigger FAB
  await page.evaluate(() => window.scrollTo(0, 300));
  await page.waitForTimeout(500);
  const fabVisible = await page.locator('.fixed.bottom-7').isVisible().catch(() => false);
  console.log(`FAB visible after scroll: ${fabVisible}`);

  await browser.close();
  console.log('\n✓ Settings + Dashboard validation complete');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
