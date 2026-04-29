const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  console.log('=== UI Cycle 4: Post-Improvement Validation ===\n');
  
  // 1. Login
  console.log('1. Logging in...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle3/15-post-login.png', fullPage: true });
  console.log('  ✓ Logged in');
  
  // 2. Open create book modal and see the improved plan selection
  console.log('\n2. Testing improved plan selection UI...');
  
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens-ui-cycle3/16-improved-plan-ui.png', fullPage: true });
    console.log('  ✓ Plan selection UI captured');
    
    // Fill title
    await page.fill('#modal-title', 'Test Book for Plan UI');
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-ui-cycle3/17-plan-filled.png', fullPage: true });
    
    // Close modal - we don't want to create another book
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
  }
  
  // 3. Go to settings page and check improved contrast
  console.log('\n3. Testing improved settings page...');
  await page.goto(BASE_URL + '/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle3/18-settings-improved.png', fullPage: true });
  console.log('  ✓ Settings page captured');
  
  // 4. Navigate to a book and create a memory to test the improved upgrade prompt
  console.log('\n4. Testing improved media upgrade prompt...');
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  
  const bookLinks = page.locator('a[href*="/books/"]');
  const bookCount = await bookLinks.count();
  if (bookCount > 0) {
    const firstBookHref = await bookLinks.first().getAttribute('href');
    if (firstBookHref) {
      await page.goto(BASE_URL + firstBookHref, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      
      const addMemoryBtn = page.locator('button:has-text("Add Memory"), button:has-text("Write a memory")').first();
      if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
        await addMemoryBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screens-ui-cycle3/19-memory-form-improved.png', fullPage: true });
        console.log('  ✓ Memory form captured');
        
        // Scroll down to see the improved media upgrade prompt
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.7));
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'screens-ui-cycle3/20-media-upgrade-improved.png', fullPage: true });
        console.log('  ✓ Media upgrade prompt captured');
      }
    }
  }
  
  // 5. Check errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 5).forEach(e => console.log(`  - ${e.substring(0, 100)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Screenshots captured ===');
}

main().catch(console.error);
