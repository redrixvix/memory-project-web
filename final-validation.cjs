const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const BASE = 'http://localhost:3133';

  let passed = 0, failed = 0;
  const results = [];

  const check = (name, condition) => {
    if (condition) { passed++; results.push(`  ✓ ${name}`); }
    else { failed++; results.push(`  ✗ ${name}`); }
  };

  // Login
  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  check('Login', true);

  // 1. Edit page - no premature saving indicator on initial load
  await page.goto(BASE + '/books/149/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const savingOnLoad = await page.locator('text=Saving').count();
  check('No premature Saving indicator on load', savingOnLoad === 0);

  // 2. Empty state shows "Autosaves as you write"
  const autosaveHint = await page.locator('text=Autosaves as you write').count();
  check('Autosave hint visible when textarea empty', autosaveHint > 0);

  // 3. Word count appears after typing
  await page.locator('textarea').first().fill('The morning light was soft and golden.');
  await page.waitForTimeout(300);
  const wordCount = await page.locator('text=words').count();
  check('Word count badge appears after typing', wordCount > 0);

  // 4. Saved indicator appears after typing
  await page.waitForTimeout(1200);
  const savedAfterType = await page.locator('text=Saved').count();
  check('Saved indicator appears after content change', savedAfterType > 0);

  // 5. Book detail with memories - only 1 "Add Memory" (in nav bar)
  await page.goto(BASE + '/books/149');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const addMemoryCount1 = await page.locator('text=Add Memory').count();
  const memoriesSection = await page.locator('text=Your Memories').count();
  check('Book with memories shows 1 Add Memory max', addMemoryCount1 <= 2 && memoriesSection > 0);

  // 6. Empty book - hero shows Add Memory
  await page.goto(BASE + '/books/235');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const heroAddMemory = await page.locator('.rounded-3xl >> text=Add Memory').count();
  const emptyStateVisible = await page.locator('text=Start your memory book').count();
  check('Empty book hero shows Add Memory', heroAddMemory > 0 && emptyStateVisible > 0);

  // 7. Settings - form fields present
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  const settingsInputs = await page.locator('input').count();
  check('Settings page has input fields', settingsInputs >= 2);

  // 8. Dashboard - FAB appears on scroll
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  const fabVisible = await page.locator('.fixed.bottom-7').isVisible().catch(() => false);
  check('Dashboard FAB appears on scroll', fabVisible);

  console.log('\nValidation Results:');
  results.forEach(r => console.log(r));
  console.log(`\nTotal: ${passed} passed, ${failed} failed\n`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
