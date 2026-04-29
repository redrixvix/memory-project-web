import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  async function screenshot(name) {
    const path = `screens/final-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 ${path}`);
  }

  let passed = 0;
  let failed = 0;

  function check(label, condition) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      failed++;
    }
  }

  try {
    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button:has-text("Sign in with password")').click();
    await page.waitForTimeout(5000);
    check('Login successful', page.url().includes('/dashboard'));
    await screenshot('login');

    // Dashboard
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const bookCards = await page.locator('.book-card').count();
    check('Dashboard shows book cards', bookCards > 0);
    console.log(`  Book cards on dashboard: ${bookCards}`);
    await screenshot('dashboard');

    // Create an empty book to test empty state
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    check('New Book button found', await newBookBtn.count() > 0);
    await newBookBtn.click();
    await page.waitForTimeout(800);
    const titleInput = page.locator('#modal-title');
    check('Create book modal opened', await titleInput.count() > 0);
    await titleInput.fill('Final Test Book');
    const submitBtn = page.locator('button:has-text("Create Book"), button[type="submit"]').first();
    await submitBtn.click();
    await page.waitForTimeout(3000);
    check('Book created, now on book detail', page.url().includes('/books/'));
    console.log(`  Book detail URL: ${page.url()}`);

    // Check empty state with prompt chips
    const emptyHeading = page.locator('text="Start your memory book"');
    check('Empty state heading visible', await emptyHeading.count() > 0);

    const promptChip = page.locator('text="A trip that changed me"');
    check('Prompt chip visible', await promptChip.count() > 0);

    const addMemoryCta = page.locator('a:has-text("Add your first memory")');
    check('Add memory CTA visible', await addMemoryCta.count() > 0);
    await screenshot('empty-state');

    // Add a memory
    await addMemoryCta.click();
    await page.waitForTimeout(2000);

    // Check memory form
    const textareas = page.locator('textarea');
    check('Memory textarea visible', await textareas.count() > 0);

    // Check compact upgrade box
    const compactUpgrade = page.locator('text="Add photos & voice notes"');
    check('Compact upgrade box (not large box)', await compactUpgrade.count() > 0);

    // Check no large "See plans" upgrade box
    const largeUpgrade = page.locator('.rounded-\\[1\\.5rem\\] p-6'); // The old large box style
    check('No large upgrade box', await largeUpgrade.count() === 0);
    await screenshot('memory-form');

    // Fill text and save
    await textareas.first().fill('This is the final validation test. The form is working correctly and the upgrade box is now compact and non-intrusive.');
    await screenshot('memory-filled');

    const saveBtn = page.locator('button:has-text("Save Memory")').first();
    check('Save Memory button found', await saveBtn.count() > 0);
    await saveBtn.click();
    await page.waitForTimeout(3000);
    check('Memory saved - back on book detail', page.url().includes('/books/'));

    // Check memory card with chapter badge
    const chapterBadge = page.locator('text="Chapter 1"');
    check('Chapter badge visible on memory card', await chapterBadge.count() > 0);

    // Settings page - no "Coming soon"
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const comingSoon = await page.locator('text="Coming soon"').count();
    check('Settings - no "Coming soon" badges', comingSoon === 0);

    const passwordFriendly = page.locator('text="You haven\'t changed your password yet"');
    check('Settings - friendly password text', await passwordFriendly.count() > 0);
    await screenshot('settings');

    console.log('\n========================================');
    console.log(`FINAL VALIDATION: ${passed} passed, ${failed} failed`);
    console.log('========================================');

  } catch (err) {
    console.error('Test error:', err);
    await screenshot('error');
  } finally {
    await browser.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });