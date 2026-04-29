import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  const screenshots = [];
  let step = 0;
  const snap = async (label) => {
    await page.waitForLoadState('networkidle');
    const path = `/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-${Date.now()}-${step++}-${label}.png`;
    await page.screenshot({ path, fullPage: false });
    screenshots.push(path);
    console.log(`[${step}] ${label} → ${path}`);
  };

  try {
    // ── 1. LOGIN ──
    console.log('\n=== LOGIN ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await snap('login-page');

    // Fill credentials
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await snap('dashboard-after-login');

    // ── 2. EXPLORE DASHBOARD ──
    console.log('\n=== DASHBOARD ===');
    await page.waitForLoadState('networkidle');

    const bookLinks = await page.locator('a[href*="/books/"]').count();
    console.log(`Found ${bookLinks} book links on dashboard`);

    const emptyState = await page.locator('text=/empty|no book|start/i').count();
    console.log(`Empty state elements: ${emptyState}`);

    await snap('dashboard-full');

    // ── 3. CREATE A BOOK ──
    console.log('\n=== CREATE BOOK ===');

    let createBookBtn = page.locator('a:has-text("New Book"), button:has-text("Create Book")').first();
    if (await createBookBtn.count() === 0) {
      createBookBtn = page.locator('a:has-text("Create"), button:has-text("Create")').first();
    }

    const createBookBtnVisible = await createBookBtn.count() > 0 && await createBookBtn.isVisible().catch(() => false);
    console.log(`Create book button visible: ${createBookBtnVisible}`);

    if (createBookBtnVisible) {
      await createBookBtn.click();
      await page.waitForLoadState('networkidle');
      await snap('book-creation-page');
      console.log('Current URL:', page.url());
    } else {
      await page.goto(`${BASE_URL}/books/new`).catch(() => {});
      await page.waitForLoadState('networkidle');
      await snap('book-new-direct');
      console.log('Current URL:', page.url());
    }

    // ── 4. NAVIGATE TO APP PAGES ──
    console.log('\n=== NAVIGATE PAGES ===');
    const routes = ['/app/settings'];
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`).catch(() => {});
      await page.waitForLoadState('networkidle');
      await snap(`route-${route.replace(/\//g, '-')}`);
      console.log(`${route}: ${page.url()}`);
    }

    // ── 5. GO TO BOOK DETAIL AND ADD MEMORY ──
    console.log('\n=== BOOK DETAIL → MEMORY CREATION ===');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await snap('dashboard-back');

    const bookLink = page.locator('a[href*="/books/"]').first();
    if (await bookLink.count() > 0) {
      const bookHref = await bookLink.getAttribute('href');
      console.log(`Found book link: ${bookHref}`);
      await bookLink.click();
      await page.waitForLoadState('networkidle');
      await snap('book-detail-page');

      const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').first();
      if (await addMemoryBtn.count() > 0 && await addMemoryBtn.isVisible().catch(() => false)) {
        await addMemoryBtn.click();
        await page.waitForLoadState('networkidle');
        await snap('memory-edit-page');
        console.log('Memory edit URL:', page.url());

        // Try to fill in memory form
        const promptInput = page.locator('input[placeholder*="question"], input[placeholder*="prompt"]').first();
        if (await promptInput.count() > 0) {
          await promptInput.fill('What is your favorite childhood memory?');
        }

        const answerTextarea = page.locator('textarea').first();
        if (await answerTextarea.count() > 0) {
          await answerTextarea.fill('This is a test memory entry created during the UI review cycle. It should be properly styled and feel premium.');
        }

        await snap('memory-form-filled');
      } else {
        console.log('No Add Memory button visible');
      }
    } else {
      console.log('No book links found on dashboard');
      await snap('dashboard-no-books');
    }

    // ── 6. SETTINGS ──
    console.log('\n=== SETTINGS ===');
    await page.goto(`${BASE_URL}/app/settings`);
    await page.waitForLoadState('networkidle');
    await snap('settings-page');

    // ── 7. FINAL DASHBOARD ──
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await snap('dashboard-final');

    console.log('\n=== SCREENSHOTS ===');
    screenshots.forEach((s, i) => console.log(`${i + 1}. ${s}`));

  } catch (err) {
    console.error('Error during flow:', err);
    await snap(`error-${Date.now()}`);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
