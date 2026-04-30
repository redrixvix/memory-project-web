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
    
    const screensDir = './screens/full-flow-cycle25';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // Go to a book detail
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    if (bookLinks.length > 0) {
      await bookLinks[0].click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/01-book-detail.png` });
      
      // Click Add Memory
      const addMemoryBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("New Memory")').first();
      if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
        await addMemoryBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/02-memory-editor.png` });
        
        // Fill in memory content
        const textareas = await page.locator('textarea').all();
        if (textareas.length > 0) {
          const memText = 'This morning was absolutely perfect. The sun was streaming through the kitchen window and I could smell the fresh coffee brewing. These are the moments I want to remember forever.';
          await textareas[0].fill(memText);
          await page.waitForTimeout(1000);
          await page.screenshot({ path: `${screensDir}/03-memory-filled.png` });
          
          // Look at what UI elements are visible
          const labels = await page.locator('label').all();
          console.log('Labels in editor:');
          for (const l of labels) {
            console.log(' -', await l.textContent());
          }
          
          // Check what the save button says
          const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save")').first();
          const saveBtnText = await saveBtn.textContent();
          console.log('Save button text:', saveBtnText?.trim());
          
          // Click save
          await saveBtn.click();
          await page.waitForTimeout(5000);
          await page.screenshot({ path: `${screensDir}/04-after-save.png` });
          
          const url = page.url();
          console.log('URL after save:', url);
          
          // Check if we're still on editor or redirected
          if (url.includes('/edit')) {
            console.log('Still on editor page');
          } else if (url.includes('/books/')) {
            console.log('Redirected to book detail page');
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `${screensDir}/05-book-with-new-memory.png` });
          }
        }
      }
    }
    
    console.log('Full flow complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
