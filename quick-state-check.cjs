const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  const screensDir = './screens/cycle26-state-check';
  const { execSync } = require('child_process');
  execSync(`mkdir -p ${screensDir}`);
  
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.locator('button').filter({ hasText: /password/i }).first().click();
  await page.waitForTimeout(800);
  await page.fill('input[type="password"]', PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  
  // Dashboard overview
  await page.screenshot({ path: `${screensDir}/01-dashboard.png`, fullPage: true });
  
  // Books list
  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/02-books.png`, fullPage: true });
  
  // Book detail (first book)
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Found book links:', bookLinks.length);
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/03-bookdetail.png`, fullPage: true });
    const bodyText = await page.locator('body').textContent();
    const hasMemories = bodyText.includes('memories') || bodyText.includes('memories');
    console.log('Book detail text snippet:', bodyText.substring(0, 500));
  }
  
  // Settings page
  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/04-settings.png`, fullPage: true });
  
  // Try editing profile name
  const nameInput = page.locator('input[placeholder*="name" i], input[id*="name" i]').first();
  if (await nameInput.isVisible({ timeout: 2000 })) {
    await nameInput.fill('Alexander Smith Updated');
    await page.screenshot({ path: `${screensDir}/05-settings-edit.png`, fullPage: true });
    // Look for save button
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.isVisible({ timeout: 1000 })) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/06-settings-saved.png`, fullPage: true });
      console.log('Settings save attempted');
    }
  }
  
  console.log('State check complete!');
  await browser.close();
})();
