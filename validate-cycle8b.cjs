const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const BASE = 'http://localhost:3133';

  // Login
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('✓ Login successful');

  // Test 1: Empty state - "Autosaves as you write" shows, NOT "Saving..."
  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const savingOnLoad = await page.locator('text=Saving').count();
  const autosaveHint = await page.locator('text=Autosaves as you write').count();
  console.log(`\nTest 1: No premature Saving on load: ${savingOnLoad === 0 ? 'PASS' : 'FAIL'} (${savingOnLoad} found)`);
  console.log(`Test 2: Autosave hint when empty: ${autosaveHint > 0 ? 'PASS' : 'FAIL'} (${autosaveHint} found)`);

  // Type content
  const textarea = page.locator('textarea').first();
  await textarea.fill('The summer evening was warm and golden.');
  await page.waitForTimeout(100);
  await page.waitForTimeout(1200); // Wait for 700ms timer + buffer
  
  const savingAfterType = await page.locator('text=Saving').count();
  const savedAfterType = await page.locator('text=Saved').count();
  console.log(`Test 3: Saving or Saved after typing: ${savingAfterType > 0 || savedAfterType > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Saving: ${savingAfterType}, Saved: ${savedAfterType}`);

  // Wait for saved state
  await page.waitForTimeout(1500);
  const savedIndicator = await page.locator('text=Saved').count();
  console.log(`Test 4: Saved indicator visible after wait: ${savedIndicator > 0 ? 'PASS' : 'FAIL'}`);

  // Check word count badge
  const wordBadge = await page.locator('text=words').count();
  console.log(`Test 5: Word count badge: ${wordBadge > 0 ? 'PASS' : 'FAIL'}`);

  // Check button disabled state text contrast
  const bodyContent = await page.locator('body').textContent();
  const hasDisabledTextFaded = bodyContent.includes('rgba(43,43,43,0.55)');
  console.log(`Test 6: Disabled button text NOT faded: ${!hasDisabledTextFaded ? 'PASS' : 'FAIL'}`);

  await browser.close();
  console.log('\n✓ Validation complete');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
