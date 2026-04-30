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
    
    const screensDir = './screens/key-pages-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Go to books
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/01-books-page.png` });
    
    // Click first book
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      
      // Click Add Memory to go to editor
      const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
      if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
        await addMemoryBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/02-memory-editor.png` });
        
        // Fill some content
        const textareas = await page.locator('textarea').all();
        if (textareas.length > 0) {
          await textareas[0].fill('Testing the editor. The morning was warm and the light was golden.');
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${screensDir}/03-memory-editor-filled.png` });
        }
        
        // Check the full page HTML structure to understand editor layout
        const h1Tags = await page.locator('h1, h2').all();
        for (const h of h1Tags) {
          const text = await h.textContent();
          console.log('Heading:', text?.trim().substring(0, 100));
        }
        
        const buttons = await page.locator('button').all();
        console.log('Buttons in editor:');
        for (const btn of buttons) {
          const text = await btn.textContent();
          console.log(' -', text?.trim().substring(0, 80));
        }
      }
    }
    
    // Check dashboard cards
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-dashboard-cards.png` });
    
    // Get the card structure
    const cards = await page.locator('[class*="Card"]').all();
    console.log('Cards found:', cards.length);
    
    console.log('Key pages check complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
