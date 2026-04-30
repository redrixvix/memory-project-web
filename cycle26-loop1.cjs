const { chromium } = require('playwright');
const { execSync } = require('child_process');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const screensDir = './screens/cycle26-loop1';
execSync(`mkdir -p ${screensDir}`);

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.locator('button').filter({ hasText: /password/i }).first().click();
  await page.waitForTimeout(800);
  await page.fill('input[type="password"]', PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Create a test memory via editor
  await page.goto('http://localhost:3000/books');
  await page.waitForTimeout(2000);
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Books found:', bookLinks.length);
  
  if (bookLinks.length > 0) {
    await bookLinks[0].click();
    await page.waitForTimeout(3000);
    
    // Click Add Memory
    const addMemBtn = page.locator('a').filter({ hasText: /add memory/i }).first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/01-editor.png`, fullPage: true });
      
      // Type some content
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('This is a beautiful summer afternoon spent with the whole family at the lake house. My grandmother made her famous peach cobbler and we sat on the porch watching the fireflies come out.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/02-editor-writing.png`, fullPage: true });
        
        // Count words
        const wordCountEl = page.locator('text=/word').first();
        if (await wordCountEl.isVisible({ timeout: 2000 })) {
          console.log('Word count visible');
        }
      }
    }
    
    // Check dashboard stats
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/03-dashboard.png`, fullPage: true });
  }

  // Settings page
  await page.goto('http://localhost:3000/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/04-settings.png`, fullPage: true });
  
  // Upgrade page
  await page.goto('http://localhost:3000/upgrade');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${screensDir}/05-upgrade.png`, fullPage: true });

  console.log('Errors:', errors.length);
  errors.forEach(e => console.log('ERROR:', e.substring(0, 200)));

  await browser.close();
  console.log('Done!');
})();
