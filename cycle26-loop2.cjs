const { chromium } = require('playwright');
const { execSync } = require('child_process');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const screensDir = './screens/cycle26-loop2';
execSync(`mkdir -p ${screensDir}`);

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // ─── Login ───
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.locator('button').filter({ hasText: /password/i }).first().click();
  await page.waitForTimeout(800);
  await page.fill('input[type="password"]', PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  console.log('Logged in successfully');

  // ─── Books page ───
  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/01-books.png`, fullPage: true });

  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Books found:', bookLinks.length);

  // ─── Open first book ───
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/02-bookdetail.png`, fullPage: true });

    // ─── Click on a memory card ───
    const memCards = await page.locator('[class*="cursor-pointer"]').all();
    console.log('Clickable elements:', memCards.length);

    // Find a memory card (memory card is clickable)
    const memLink = page.locator('a[href*="/books/"][href*="/memories/"]').first();
    if (await memLink.isVisible({ timeout: 3000 })) {
      await memLink.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${screensDir}/03-memory-detail.png`, fullPage: true });
      console.log('Memory detail page captured');
    }

    // ─── Go to editor ───
    const editLink = page.locator('a[href*="/books/"][href*="/edit"]').first();
    if (await editLink.isVisible({ timeout: 3000 })) {
      await editLink.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${screensDir}/04-editor.png`, fullPage: true });
    }

    // ─── Add a memory ───
    const addMem = page.locator('a').filter({ hasText: /add memory/i }).first();
    if (await addMem.isVisible({ timeout: 3000 })) {
      await addMem.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/05-add-memory.png`, fullPage: true });

      // Try filling content
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('Summer 1987 — The whole family gathered at Lake Winnipesaukee for Grandma Rose\'s 70th birthday. The weather was perfect, the lake was calm, and we had the biggest strawberry shortcake you\'ve ever seen. Uncle Frank finally got the old rowboat running after three years of promises.');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${screensDir}/06-memory-writing.png`, fullPage: true });
      }
    }
  }

  // ─── Dashboard ───
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/07-dashboard.png`, fullPage: true });

  // ─── Settings ───
  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/08-settings.png`, fullPage: true });

  // ─── Upgrade ───
  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/09-upgrade.png`, fullPage: true });

  console.log('Errors captured:', errors.length);
  errors.forEach(e => console.log('  ERR:', e.substring(0, 250)));

  await browser.close();
  console.log('Done!');
})();