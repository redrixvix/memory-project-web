const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-verify';
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
    
    // Navigate to first book
    const firstBookLink = page.locator('a[href*="/books/"]').first();
    await firstBookLink.click();
    await page.waitForTimeout(3000);
    
    // Go to memory editor
    const addMemLink = page.locator('a[href*="/edit"]').first();
    if (await addMemLink.isVisible({ timeout: 3000 })) {
      await addMemLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/editor-media-section.png`, fullPage: true });
      
      // Verify the new section text
      const sectionText = await page.locator('text=/Enrich your memory|A photograph or voice note/i').first().textContent().catch(() => 'not found');
      console.log('New section text found:', sectionText ? 'YES' : 'NO');
      console.log('Section text:', sectionText);
      
      // Check if "Optional" label is gone
      const optionalLabel = await page.locator('text=/Optional/i').first().isVisible({ timeout: 1000 }).catch(() => false);
      console.log('"Optional" label still visible:', optionalLabel);
    }
    
    console.log('Verify complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
