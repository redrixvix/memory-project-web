const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setViewportSize({ width: 1440, height: 900 });
  
  // Login
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('#email', 'RedRixvix@proton.me');
  await page.fill('#password', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]:has-text("Sign in with password")');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Editor
  await page.goto('http://localhost:3000/books/152/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens/improve_05_editor_v3.png', fullPage: true });
  
  // Test focus mode - click textarea and type
  const ta = await page.$('textarea');
  if (ta) {
    await ta.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens/improve_06_editor_focused.png', fullPage: true });
  }
  
  console.log('Editor v3 captured');
  await browser.close();
})();