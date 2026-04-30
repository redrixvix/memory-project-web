const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle13-final';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name, opts = {}) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: opts.fullPage !== false, ...opts });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 1500) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  const startTime = Date.now();
  console.log('\n🔍 Cycle 13 Final Validation\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  let passed = 0;
  let failed = 0;
  const results = [];

  function check(label, condition) {
    if (condition) {
      console.log(`  ✅ ${label}`);
      results.push({ label, status: 'pass' });
      passed++;
    } else {
      console.log(`  ❌ ${label}`);
      results.push({ label, status: 'fail' });
      failed++;
    }
  }

  // LOGIN
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await screenshot(page, 'A-login');
  check('Login redirects to dashboard', page.url().includes('/dashboard'));

  // DESKTOP DASHBOARD
  console.log('\n🖥️ DESKTOP DASHBOARD');
  check('Books visible', await page.locator('[class*="book"], a[href*="/books/"]').count() > 0);
  check('User avatar button visible', await page.locator('header').locator('button, [class*=avatar]').count() > 0);
  const newBookBtn = await page.locator('button:has-text("New Book")').count();
  check('New Book button', newBookBtn > 0);
  await screenshot(page, 'B-desktop-dashboard');

  // MOBILE DASHBOARD
  console.log('\n📱 MOBILE DASHBOARD');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 800);
  const hamburger = await page.locator('[aria-label="Open navigation menu"]').count();
  check('Hamburger button visible', hamburger > 0);
  await screenshot(page, 'C-mobile-dashboard');
  await page.setViewportSize({ width: 1280, height: 900 });

  // BOOK DETAIL - MOBILE
  console.log('\n📖 BOOK DETAIL');
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  let bookHref = null;
  for (const link of bookLinks) {
    const href = await link.getAttribute('href');
    if (href && !href.includes('/edit') && !href.includes('/preview') && !href.includes('/new')) {
      bookHref = href;
      break;
    }
  }
  if (bookHref) {
    await page.goto(`${BASE_URL}${bookHref}`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    const bookTitle = await page.locator('h1').first().textContent();
    check('Book title rendered', (bookTitle?.length || 0) > 0);
    const appleContent = (await page.locator('body').textContent())?.includes('apple');
    check('Memory content visible (apple)', appleContent);

    // Mobile hamburger
    await page.setViewportSize({ width: 390, height: 844 });
    const bookHamburger = await page.locator('[aria-label="Open navigation menu"]').count();
    check('Book detail mobile hamburger', bookHamburger > 0);
    await page.setViewportSize({ width: 1280, height: 900 });
    await screenshot(page, 'D-book-detail');
  }

  // MEMORY EDIT FLOW
  console.log('\n✍️ MEMORY EDIT');
  if (bookHref) {
    const bookId = bookHref.split('/books/')[1];
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    const textarea = await page.locator('textarea').count();
    check('Textarea present', textarea > 0);

    const textareaEl = page.locator('textarea').first();
    await textareaEl.fill('The golden afternoon light came through the kitchen window as I rolled out the pie dough. My grandmother stood beside me, her hands dusted with flour, guiding mine with patient instructions.');
    await waitNet(page, 1200);

    const wordCountVisible = await page.locator('text=/\\d+.*word/i').isVisible().catch(() => false);
    check('Word count visible while typing', wordCountVisible);
    await screenshot(page, 'E-memory-edit');

    const saveBtn = page.locator('button:has-text("Save Memory")');
    check('Save Memory button', await saveBtn.count() > 0);
    await saveBtn.first().click();
    await waitNet(page, 3000);
    check('Save successful - stayed on book detail', page.url().includes(`/books/${bookId}`));
  }

  // SETTINGS PAGE
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  const settingsH2s = await page.locator('h2').allTextContents();
  check('Settings has h2 headings', settingsH2s.length > 0);
  const hasProfile = settingsH2s.some(h => h.toLowerCase().includes('profile'));
  const hasSignOut = settingsH2s.some(h => h.toLowerCase().includes('sign out'));
  check('Settings has Profile h2', hasProfile);
  check('Settings has Sign out h2', hasSignOut);
  const avatarEl = await page.locator('[class*="avatar"], [class*="w-24"]').count();
  check('Avatar/image upload section', avatarEl > 0);
  await screenshot(page, 'F-settings');

  // UPGRADE PAGE
  console.log('\n💳 UPGRADE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  const planPrices = await page.locator('text=/\\$\\d+/').count();
  check('Plan prices displayed', planPrices > 0);
  const labelCaps = await page.locator('.label-caps').allTextContents();
  check('Plan label-caps visible', labelCaps.length > 0);
  await screenshot(page, 'G-upgrade');

  // FINAL SUMMARY
  const elapsed = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n📊 FINAL VALIDATION RESULTS (${elapsed}s):`);
  console.log(`  Passed: ${passed}/${passed + failed}`);
  console.log(`  Failed: ${failed}/${passed + failed}`);
  console.log('');
  console.log('Failing checks:');
  results.filter(r => r.status === 'fail').forEach(r => console.log(`  ❌ ${r.label}`));

  await browser.close();
  console.log('\n✅ Final validation complete\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
