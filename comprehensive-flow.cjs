const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  try {
    const screensDir = './screens/cycle25-comprehensive';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // LOGIN
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.locator('button').filter({ hasText: /password/i }).first().click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${screensDir}/01-dashboard.png`, fullPage: true });
    
    // DASHBOARD → click first book card
    const firstBookLink = page.locator('a[href*="/books/"]').first();
    const firstBookHref = await firstBookLink.getAttribute('href');
    console.log('Going to book:', firstBookHref);
    await firstBookLink.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${screensDir}/02-book-detail.png`, fullPage: true });
    
    // Get page URL and text
    const bookUrl = page.url();
    const bookText = await page.locator('body').textContent();
    const memoryCount = (bookText || '').match(/(\d+)\s*memory/i)?.[1] || '0';
    console.log('Book URL:', bookUrl, 'Memory count:', memoryCount);
    
    // Find "Add Memory" or "Edit" link
    const addMemLink = page.locator('a[href*="/edit"]').first();
    if (await addMemLink.isVisible({ timeout: 3000 })) {
      const editHref = await addMemLink.getAttribute('href');
      console.log('Add memory href:', editHref);
      await addMemLink.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/03-editor-new.png`, fullPage: true });
      
      // Check editor UI elements
      const textarea = page.locator('textarea').first();
      const hasTextarea = await textarea.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Editor has textarea:', hasTextarea);
      
      // Check prompt select
      const select = page.locator('select').first();
      const hasSelect = await select.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Editor has prompt select:', hasSelect);
      
      // Check photo upload area
      const photoArea = page.locator('text=/photo|image|picture/i').first();
      const hasPhotoArea = await photoArea.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Editor has photo area:', hasPhotoArea);
      
      // Check audio upload area  
      const audioArea = page.locator('text=/audio|record|mic/i').first();
      const hasAudioArea = await audioArea.isVisible({ timeout: 2000 }).catch(() => false);
      console.log('Editor has audio area:', hasAudioArea);
      
      // Try selecting a prompt and writing
      if (hasSelect) {
        const options = await page.locator('select option').all();
        console.log('Prompt options count:', options.length);
      }
      
      // Fill some content
      if (hasTextarea) {
        await textarea.fill('The afternoon sun cast long shadows across the garden. I could hear the children laughing in the distance, and for a moment everything felt exactly right.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/04-editor-filled.png`, fullPage: true });
        
        // Word count should update
        await page.waitForTimeout(500);
      }
      
      // Click submit if button is enabled
      const submitBtn = page.locator('button[type="submit"]').first();
      const submitEnabled = await submitBtn.isEnabled().catch(() => false);
      console.log('Submit button enabled:', submitEnabled);
      
      if (submitEnabled) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/05-after-submit.png`, fullPage: true });
        console.log('After submit URL:', page.url());
      }
    }
    
    // Navigate to settings
    await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/06-settings.png`, fullPage: true });
    
    // Check upgrade page
    await page.goto('http://localhost:3000/upgrade', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/07-upgrade.png`, fullPage: true });
    
    console.log('Comprehensive flow complete!');
  } catch(e) {
    console.error('Error:', e.message);
    try { await page.screenshot({ path: `${screensDir}/error.png` }); } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
