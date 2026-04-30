const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-final-verify';
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
    
    // Navigate to first book and editor
    const firstBookLink = page.locator('a[href*="/books/"]').first();
    await firstBookLink.click();
    await page.waitForTimeout(3000);
    
    const addMemLink = page.locator('a[href*="/edit"]').first();
    if (await addMemLink.isVisible({ timeout: 3000 })) {
      await addMemLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/editor-new-media-heading.png`, fullPage: true });
      
      // Scroll to media section
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${screensDir}/editor-media-at-bottom.png`, fullPage: true });
      
      // Verify the "Optional" label is gone
      const optionalVisible = await page.locator('text=/Optional/i').isVisible().catch(() => false);
      console.log('Optional label gone:', !optionalVisible);
      
      // Verify "Enrich your memory" is visible
      const enrichVisible = await page.locator('text=/Enrich your memory/i').isVisible().catch(() => false);
      console.log('"Enrich your memory" visible:', enrichVisible);
      
      // Type in textarea and verify word count
      const textarea = page.locator('textarea').first();
      await textarea.fill('The summer evening light streamed through the curtains as we gathered around the old kitchen table, sharing stories and laughter that would become precious memories.');
      await page.waitForTimeout(800);
      
      // Check word count
      const wordCountEl = await page.locator('text=/\\d+ words/i').first().textContent().catch(() => 'not found');
      console.log('Word count display:', wordCountEl);
      
      // Scroll down and submit
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isEnabled({ timeout: 2000 })) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/after-save.png`, fullPage: true });
        console.log('Current URL after save:', page.url());
      }
    }
    
    // Check book detail shows the memory
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/book-detail-after.png`, fullPage: true });
    
    const bodyText = await page.locator('body').textContent();
    console.log('Book detail has "Chapter":', (bodyText || '').includes('Chapter'));
    
    console.log('Final verify complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
