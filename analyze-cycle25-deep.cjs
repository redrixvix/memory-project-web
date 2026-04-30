const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    // Login first
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    const passwordBtn = page.locator('button').filter({ hasText: /Sign in with password/i }).first();
    await passwordBtn.click();
    await page.waitForTimeout(1000);
    await page.fill('input[type="password"]', PASSWORD);
    const signInBtn = page.locator('button[type="submit"]').filter({ hasText: /Sign in/i }).first();
    await signInBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const screensDir = './screens/analyze-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // 1. Book detail page - go to books first
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/07-book-detail.png` });
      
      // 2. Memory editor - look for add memory
      const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
      if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
        await addMemoryBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${screensDir}/08-memory-editor.png` });
        
        // Fill some text
        const textareas = await page.locator('textarea').all();
        if (textareas.length > 0) {
          await textareas[0].fill('Testing the memory editor interface. The morning light was golden and warm.');
        }
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${screensDir}/09-memory-editor-filled.png` });
      }
    }
    
    // 3. Signup page
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/10-signup.png` });
    
    // 4. FAQ page
    await page.goto('http://localhost:3000/faq');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/11-faq.png` });
    
    console.log('Deep analysis complete.');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
