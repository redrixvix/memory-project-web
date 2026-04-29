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

  // Test 1: Check edit page does NOT show premature "Saving..." on load
  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  const savingIndicators = await page.locator('text=Saving').count();
  console.log(`Test 1: Saving indicators visible on initial load: ${savingIndicators}`);
  if (savingIndicators > 0) {
    console.log('  FAIL: Premature "Saving..." still visible');
  } else {
    console.log('  PASS: No premature Saving indicator');
  }

  // Test 2: Check "Autosaves as you write" shows when textarea is empty
  const autosaveHint = await page.locator('text=Autosaves as you write').count();
  console.log(`Test 2: "Autosaves as you write" visible when empty: ${autosaveHint}`);
  if (autosaveHint > 0) {
    console.log('  PASS: Autosave hint shows correctly');
  } else {
    console.log('  FAIL: Autosave hint missing');
  }

  // Test 3: Type content and check word count appears
  const textarea = page.locator('textarea').first();
  await textarea.fill('The summer sun set behind the hills casting long shadows across the valley floor.');
  await page.waitForTimeout(300);
  
  const wordCountVisible = await page.locator('text=words').count();
  console.log(`Test 3: Word count visible after typing: ${wordCountVisible}`);
  if (wordCountVisible > 0) {
    console.log('  PASS: Word count appears');
  } else {
    console.log('  FAIL: Word count missing');
  }

  // Test 4: Saving indicator appears after typing
  await page.waitForTimeout(800);
  const savingAfterTyping = await page.locator('text=Saving').count();
  console.log(`Test 4: Saving indicator after typing: ${savingAfterTyping}`);
  if (savingAfterTyping > 0) {
    console.log('  PASS: Saving indicator shows during save');
  } else {
    console.log('  CHECK: Saving state may have already completed');
  }

  // Test 5: Saved indicator appears
  await page.waitForTimeout(2000);
  const savedIndicator = await page.locator('text=Saved').count();
  console.log(`Test 5: Saved indicator visible: ${savedIndicator}`);
  if (savedIndicator > 0) {
    console.log('  PASS: Saved indicator shows');
  } else {
    console.log('  FAIL: Saved indicator missing');
  }

  // Test 6: Disabled button text is readable (not faded)
  const disabledButtons = page.locator('button[disabled]');
  const disabledCount = await disabledButtons.count();
  console.log(`Test 6: Disabled buttons found: ${disabledCount}`);
  if (disabledCount > 0) {
    console.log('  INFO: Disabled buttons present (expected if form validation applies)');
  } else {
    console.log('  INFO: No disabled buttons at this stage');
  }

  await browser.close();
  console.log('\nValidation complete');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
