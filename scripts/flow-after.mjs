import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  async function screenshot(name) {
    const path = `screens/after-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 ${path}`);
  }

  try {
    // Login
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.locator('#email').fill(EMAIL);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button:has-text("Sign in with password")').click();
    await page.waitForTimeout(5000);
    await screenshot('01-login');

    // Dashboard
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot('02-dashboard');

    // Navigate to book detail of the book we created
    await page.goto(`${BASE}/books/141`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot('03-book-detail-empty-state');

    // Create a memory
    await page.locator('a[href*="/edit"]').first().click();
    await page.waitForTimeout(2000);
    await screenshot('04-memory-form');

    // Fill text
    const textareas = page.locator('textarea');
    if (await textareas.count() > 0) {
      await textareas.first().fill('Spring has arrived and the garden is coming alive. We planted tomatoes, peppers, and herbs last weekend. The kids helped water every morning, their small hands carefully sprinkling the soil. There is something deeply satisfying about watching things grow.');
      await screenshot('05-memory-text-filled');

      // Check the compact upgrade box
      const upgradeBox = page.locator('text=Add photos & voice notes').first();
      if (await upgradeBox.count() > 0) {
        console.log('✅ Compact upgrade box found');
      } else {
        console.log('❌ Compact upgrade box not found');
      }

      // Save
      const saveBtn = page.locator('button:has-text("Save Memory")').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await screenshot('06-memory-saved');
        console.log('Memory saved, URL:', page.url());
      }
    }

    // Go back to book detail with memories
    await page.goto(`${BASE}/books/141`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot('07-book-with-memory');

    // Settings page
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await screenshot('08-settings-improved');

    // Check for no "Coming soon" badges
    const comingSoonCount = await page.locator('text="Coming soon"').count();
    console.log('❌ "Coming soon" badges found:', comingSoonCount, '(should be 0)');

    console.log('\n✅ All improvement checks complete');
    console.log('Screenshots: screens/after-*.png');

  } catch (err) {
    console.error('Test error:', err);
    await screenshot('error');
  } finally {
    await browser.close();
  }
}

run().catch(console.error);