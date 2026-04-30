const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const EMAIL = 'RedRixvix@proton.me';
  const PASSWORD = 'd[,<(q<HC6V~MJvV';
  
  const screensDir = './screens/cycle26-fullflow';
  const { execSync } = require('child_process');
  execSync(`mkdir -p ${screensDir}`);
  
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.locator('button').filter({ hasText: /password/i }).first().click();
    await page.waitForTimeout(800);
    await page.fill('input[type="password"]', PASSWORD);
    await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).first().click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('1. Logged in successfully');
    
    // Create a new memory book
    const createBtn = page.locator('a[href*="create"]').first();
    if (await createBtn.isVisible({ timeout: 3000 })) {
      await createBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screensDir}/01-create-book.png`, fullPage: true });
      
      // Fill in book title
      const titleInput = page.locator('input[placeholder*="book" i], input[id*="title" i]').first();
      if (await titleInput.isVisible({ timeout: 2000 })) {
        await titleInput.fill('Test Memory Book');
        await page.waitForTimeout(300);
        await page.screenshot({ path: `${screensDir}/02-book-filled.png`, fullPage: true });
        
        // Submit
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        await page.waitForTimeout(3000);
        console.log('2. Created book, URL:', page.url());
        await page.screenshot({ path: `${screensDir}/03-after-create.png`, fullPage: true });
      }
    }
    
    // Navigate to the new book and add a memory
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    console.log('Found book links:', bookLinks.length);
    
    // Go to books list
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/04-books-list.png`, fullPage: true });
    
    // Find our test book and go to it
    const testBook = page.locator('text=/Test Memory Book/i').first();
    if (await testBook.isVisible({ timeout: 3000 })) {
      await testBook.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/05-testbook-detail.png`, fullPage: true });
      
      // Click Add Memory
      const addMemBtn = page.locator('a[href*="/edit"]').first();
      if (await addMemBtn.isVisible({ timeout: 3000 })) {
        await addMemBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/06-editor.png`, fullPage: true });
        
        // Type a memory
        const textarea = page.locator('textarea').first();
        await textarea.fill('This is a test memory created during the UX review cycle. The evening light was golden and warm, and the whole family gathered around the old oak table for dinner.');
        await page.waitForTimeout(1000);
        
        // Check word count appeared
        const wordCountText = await page.locator('text=/\\d+ words/i').first().textContent().catch(() => null);
        console.log('Word count visible:', wordCountText);
        
        // Scroll to save bar
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${screensDir}/07-editor-scrolled.png`, fullPage: true });
        
        // Save the memory
        const saveBtn = page.locator('button[type="submit"]').first();
        if (await saveBtn.isEnabled({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(4000);
          await page.screenshot({ path: `${screensDir}/08-after-save.png`, fullPage: true });
          console.log('3. Saved memory, URL:', page.url());
          
          // Check book detail now shows the memory
          await page.waitForTimeout(2000);
          await page.screenshot({ path: `${screensDir}/09-book-with-memory.png`, fullPage: true });
        }
      }
    } else {
      console.log('Test Memory Book not found on books page');
    }
    
    // Test settings page save
    await page.goto('http://localhost:3000/settings');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/10-settings.png`, fullPage: true });
    
    const nameInput = page.locator('input').first();
    if (await nameInput.isVisible({ timeout: 2000 })) {
      await nameInput.click();
      await nameInput.fill('Alexander Smith');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${screensDir}/11-settings-edited.png`, fullPage: true });
      
      const saveChangesBtn = page.locator('button[type="submit"]').first();
      if (await saveChangesBtn.isEnabled({ timeout: 1000 })) {
        await saveChangesBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${screensDir}/12-settings-saved.png`, fullPage: true });
        console.log('4. Settings saved');
      }
    }
    
    console.log('Full flow test complete!');
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    await browser.close();
  }
})();
