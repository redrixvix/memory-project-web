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
  console.log('✓ Login');

  // Test 1: Edit page - no premature "Saving..." on initial load
  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const noPrematureSaving = await page.locator('text=Saving').count() === 0;
  console.log(`Test 1: No premature Saving on load: ${noPrematureSaving ? 'PASS' : 'FAIL'}`);

  // Test 2: Autosave hint when textarea is empty
  const autosaveHint = await page.locator('text=Autosaves as you write').count();
  console.log(`Test 2: Autosave hint when empty: ${autosaveHint > 0 ? 'PASS' : 'FAIL'}`);

  // Test 3: Type content and verify word count
  const textarea = page.locator('textarea').first();
  await textarea.fill('The autumn leaves fell gently from the trees.');
  await page.waitForTimeout(300);
  const wordCount = await page.locator('text=words').count();
  console.log(`Test 3: Word count badge appears: ${wordCount > 0 ? 'PASS' : 'FAIL'}`);

  // Test 4: Check book detail - NO redundant "Add Memory" in hero when book has memories
  await page.goto(BASE + '/books/149');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Count "Add Memory" buttons - there should be ONLY the one in the header (nav bar)
  // The empty state should have "Add your first memory" but NOT "Add Memory" in the hero area
  const addMemoryCount = await page.locator('text=Add Memory').count();
  console.log(`Test 4: "Add Memory" buttons on book with memories: ${addMemoryCount}`);
  
  // The memories section should exist
  const memoriesSection = await page.locator('text=Your Memories').count();
  console.log(`  Memories section visible: ${memoriesSection > 0 ? 'YES' : 'NO'}`);
  console.log(`  ${addMemoryCount <= 2 ? 'PASS' : 'FAIL'} (expected ≤2, found ${addMemoryCount})`);

  // Test 5: Empty book - hero should show Add Memory
  await page.goto(BASE + '/books/235');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const emptyState = await page.locator('text=Start your memory book').count();
  const heroAddMemory = await page.locator('.rounded-3xl >> text=Add Memory').count();
  console.log(`Test 5: Empty book has hero Add Memory: ${heroAddMemory > 0 ? 'PASS' : 'FAIL'}`);
  console.log(`  Empty state visible: ${emptyState > 0 ? 'YES' : 'NO'}`);

  await browser.close();
  console.log('\n✓ Validation complete');
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
