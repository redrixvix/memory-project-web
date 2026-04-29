import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = process.env.MEMORY_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.MEMORY_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const screenshots = '/home/rixvix/.openclaw/workspace/memory-project/web/screens';

  console.log('=== CYCLE 2 START ===');

  // 1. LOGIN
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3500);
  await page.screenshot({ path: `${screenshots}/cycle2-01-logged-in.png` });

  // 2. DASHBOARD — look at a book card hover and the full library feel
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${screenshots}/cycle2-02-dashboard-full.png` });

  // Hover over a book card to see the hover state
  const firstCard = page.locator('.book-card').first();
  if (await firstCard.isVisible({ timeout: 3000 })) {
    await firstCard.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${screenshots}/cycle2-03-card-hover.png` });
  }

  // 3. Open create modal to see the plan selector more clearly
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${screenshots}/cycle2-04-create-modal.png` });

  // Select a plan option
  const planOptions = page.locator('[role="dialog"] button[type="button"]');
  const count = await planOptions.count();
  console.log('  Plan options found:', count);
  if (count > 2) {
    await planOptions.nth(1).click(); // Click second plan
    await page.screenshot({ path: `${screenshots}/cycle2-05-plan-selected.png` });
  }

  // Close modal
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // 4. Go to a book with memories
  const bookLinks = page.locator('a[href^="/books/"]');
  const linkCount = await bookLinks.count();
  console.log('  Book links found:', linkCount);
  if (linkCount > 0) {
    await bookLinks.first().click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${screenshots}/cycle2-06-book-detail.png` });

    // 5. Check memory card interaction
    const memoryCards = page.locator('[class*="rounded-2xl"]').filter({ has: page.locator('text=/Chapter|memory/i') });
    const memCount = await memoryCards.count();
    console.log('  Memory cards found:', memCount);
    if (memCount > 0) {
      await memoryCards.first().hover();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${screenshots}/cycle2-07-memory-hover.png` });
    }

    // 6. Navigate to add memory to check the flow
    const addMemLink = page.locator('a:has-text("Add Memory")').first();
    if (await addMemLink.isVisible({ timeout: 2000 })) {
      await addMemLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screenshots}/cycle2-08-add-memory.png` });

      // Check if there's a photo upload section
      const uploadSection = page.locator('text=/photo|upload|audio/i');
      const uploadVisible = await uploadSection.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('  Upload section visible:', uploadVisible);
    }
  }

  // 7. Settings page full review
  await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${screenshots}/cycle2-09-settings-full.png` });

  // Check form fields
  const nameField = page.locator('#display-name');
  if (await nameField.isVisible()) {
    await nameField.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${screenshots}/cycle2-10-settings-focus.png` });
  }

  console.log('\n=== CYCLE 2 COMPLETE ===');
  await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });