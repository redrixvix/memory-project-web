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
    
    const screensDir = './screens/focus-check';
    const { execSync } = require('child_process');
    execSync(`mkdir -p ${screensDir}`);
    
    // 1. Create an empty book and see its empty state
    // Navigate to dashboard, create a new book
    await page.goto('http://localhost:3000/dashboard');
    await page.waitForTimeout(2000);
    
    // Click New Book button
    const newBookBtn = page.locator('button:has-text("New Book")').first();
    await newBookBtn.click();
    await page.waitForTimeout(500);
    
    // Fill title for an empty book
    await page.fill('#modal-title, input[id*="title"]', 'The Smith Family Chronicle');
    
    const createBtn = page.locator('#create-book-form button[type="submit"], form:has(#create-book-form) button:has-text("Create")').first();
    if (await createBtn.isVisible({ timeout: 2000 })) {
      await createBtn.click();
      await page.waitForURL('**/books/**', { timeout: 10000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: `${screensDir}/empty-book-state.png`, fullPage: true });
      
      // Also capture the URL
      const url = page.url();
      console.log('New book URL:', url);
    }
    
    // 2. Go to upgrade page with a book selected
    await page.goto('http://localhost:3000/upgrade');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/upgrade-page.png`, fullPage: true });
    
    // 3. FAQ page
    await page.goto('http://localhost:3000/faq');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/faq-page.png`, fullPage: true });
    
    // 4. Check signup page
    await page.goto('http://localhost:3000/signup');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screensDir}/signup-page.png`, fullPage: true });
    
    // 5. Book edit page (book details, not memory editor)
    await page.goto('http://localhost:3000/books');
    await page.waitForTimeout(2000);
    const books = await page.locator('a[href*="/books/"]').all();
    if (books.length > 0) {
      await books[0].click();
      await page.waitForTimeout(2000);
      
      const editBookLink = page.locator('a[href*="edit/book"]').first();
      if (await editBookLink.isVisible({ timeout: 2000 })) {
        await editBookLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${screensDir}/book-edit-page.png`, fullPage: true });
      }
    }
    
    console.log('Focus check complete.');
  } catch(e) {
    console.error('Error:', e.message);
    try {
      await page.screenshot({ path: `${screensDir}/error.png` });
    } catch(e2) {}
  } finally {
    await browser.close();
  }
})();
