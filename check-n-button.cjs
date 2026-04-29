const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const BASE = 'http://localhost:3133';

  await page.goto(BASE + '/login');
  await page.fill('input[type="email"]', process.env.TEST_EMAIL || 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', process.env.TEST_PASS || 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('✓ Logged in');

  await page.goto(BASE + '/books/149');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  const fixedElements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const found = [];
    for (const el of all) {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' && el.textContent?.trim()) {
        found.push({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50),
          left: style.left,
          bottom: style.bottom
        });
      }
    }
    return found;
  });
  
  console.log('Fixed elements with text:', JSON.stringify(fixedElements, null, 2));

  await browser.close();
})().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
