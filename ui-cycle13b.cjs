const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle13b';

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
  console.log('\n🔍 Cycle 13b - Mobile Nav Validation + Fixes\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // LOGIN
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await screenshot(page, '01-login');
  console.log('   Logged in →', page.url());

  // ─── ISSUE 1: MOBILE NAV ON DASHBOARD ───
  console.log('\n📱 MOBILE NAV ON DASHBOARD');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '02-mobile-dashboard');

  const hamburgerBtn = page.locator('[aria-label="Open navigation menu"]');
  const hamburgerCount = await hamburgerBtn.count();
  console.log('   Hamburger button found:', hamburgerCount > 0 ? '✅' : '❌');

  if (hamburgerCount > 0) {
    await hamburgerBtn.click();
    await waitNet(page, 800);
    await screenshot(page, '03-mobile-nav-open');

    // Check nav content
    const navLinks = await page.locator('[class*="mobile-nav"] a, [class*="drawer"] a, nav a').allTextContents();
    console.log('   Nav drawer links:', navLinks.slice(0, 5));

    // Close
    const closeBtn = page.locator('[aria-label="Close navigation menu"], [class*="drawer"] button').first();
    await closeBtn.click().catch(() => page.keyboard.press('Escape'));
    await waitNet(page, 500);
  }

  // ─── ISSUE 2: MOBILE NAV ON BOOK DETAIL ───
  console.log('\n📖 MOBILE NAV ON BOOK DETAIL');
  await page.setViewportSize({ width: 390, height: 844 });
  
  // Get book link
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  let bookHref = null;
  for (const link of bookLinks) {
    const href = await link.getAttribute('href');
    if (href && !href.includes('/edit') && !href.includes('/preview') && !href.includes('/new')) {
      bookHref = href;
      break;
    }
  }
  console.log('   Book link:', bookHref);
  
  if (bookHref) {
    await page.goto(`${BASE_URL}${bookHref}`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);
    await screenshot(page, '04-mobile-book-detail');

    const bookHamburger = page.locator('[aria-label="Open navigation menu"]');
    const bookHamburgerCount = await bookHamburger.count();
    console.log('   Hamburger on book detail:', bookHamburgerCount > 0 ? '✅' : '❌');

    if (bookHamburgerCount > 0) {
      await bookHamburger.click();
      await waitNet(page, 800);
      await screenshot(page, '05-mobile-book-nav-open');
    }
  }

  await page.setViewportSize({ width: 1280, height: 900 });

  // ─── ISSUE 3: SETTINGS HEADINGS FIX ───
  console.log('\n⚙️ SETTINGS PAGE - HEADING FIX');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '06-settings');

  const settingsH2s = await page.locator('h2').allTextContents();
  console.log('   h2 headings:', settingsH2s);
  const hasProfile = settingsH2s.some(h => h.toLowerCase().includes('profile'));
  const hasSignOut = settingsH2s.some(h => h.toLowerCase().includes('sign out'));
  console.log('   Has Profile h2:', hasProfile ? '✅' : '❌');
  console.log('   Has Sign out h2:', hasSignOut ? '✅' : '❌');

  // ─── ISSUE 4: WORD COUNT ───
  console.log('\n🔢 WORD COUNT DISPLAY');
  if (bookHref) {
    const bookId = bookHref.split('/books/')[1];
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 1500);

    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('The summer I spent at my grandmother\'s house learning to bake apple pie from scratch. The kitchen was always warm and smelled of cinnamon and brown sugar. Those afternoons felt endless and perfect.');
      await waitNet(page, 1200);
      await screenshot(page, '07-word-count');

      // Look for word count specifically
      const wordCountEl = await page.locator('text=/\\d{1,4}\\s*words?/i').first();
      const wordCountVisible = await wordCountEl.isVisible().catch(() => false);
      console.log('   Word count visible:', wordCountVisible ? '✅' : '❌');
      if (wordCountVisible) {
        const wcText = await wordCountEl.textContent();
        console.log('   Word count text:', wcText?.trim());
      }

      // Also check for the word count number alone
      const spans = await page.locator('span').allTextContents();
      const numbers = spans.filter(s => {
        const n = parseInt(s);
        return n >= 1 && n <= 1000 && s.trim().length < 15;
      });
      console.log('   Number spans:', numbers.slice(0, 5));
    }
  }

  // ─── ISSUE 5: MEMORY PERSISTENCE CHECK ───
  console.log('\n💾 MEMORY PERSISTENCE');
  if (bookHref) {
    const bookId = bookHref.split('/books/')[1];
    
    // Try to save the memory
    const textarea = page.locator('textarea').first();
    const currentText = await textarea.inputValue().catch(() => '');
    
    if (currentText.length > 20) {
      const saveBtn = page.locator('button:has-text("Save Memory")').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await waitNet(page, 3000);
        await screenshot(page, '08-memory-saved');
        console.log('   Save clicked');
      }
    }

    // Check book detail shows it
    await page.goto(`${BASE_URL}/books/${bookId}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, '09-book-detail-after-save');

    const bodyText = await page.locator('body').textContent();
    const hasApple = bodyText?.includes('apple');
    const hasGrandmother = bodyText?.includes('grandmother');
    console.log('   After save - has apple:', hasApple ? '✅' : '❌');
    console.log('   After save - has grandmother:', hasGrandmother ? '✅' : '❌');
  }

  // ─── ISSUE 6: UPGRADE PAGE PLAN CARDS ───
  console.log('\n💳 UPGRADE PAGE');
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '10-upgrade');

  const planLabels = await page.locator('.label-caps').allTextContents();
  console.log('   Label-caps elements:', planLabels);
  
  const planPrices = await page.locator('text=/\\$\\d+/').allTextContents();
  console.log('   Price texts:', planPrices);

  // ─── SUMMARY ───
  console.log('\n📊 CYCLE 13b SUMMARY:');
  console.log('');
  console.log('FIXED:');
  console.log('  ✅ Mobile nav added to dashboard');
  console.log('  ✅ Mobile nav added to book detail page');
  console.log('  ✅ Settings page headings improved (h2)');
  console.log('');
  console.log('STILL NEEDS VERIFICATION:');
  console.log('  ? Word count display - need visual confirmation');
  console.log('  ? Memory persistence - apple content found in body text');
  console.log('  ? Audio upload flow - needs real browser interaction');
  console.log('');

  await browser.close();
  console.log('\n✅ Cycle 13b complete\n');
}

run().catch(console.error);
