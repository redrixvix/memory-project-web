const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens-ui-cycle5';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  console.log('=== UI Cycle 5d: Final Verification Round ===\n');
  
  // 1. Login
  console.log('1. Logging in...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('  ✓ Logged in');
  
  // 2. Dashboard - comprehensive look
  console.log('\n2. Dashboard overview...');
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/50-dashboard-final.png`, fullPage: true });
  
  // Count books
  const bookCards = page.locator('a[href*="/books/"]');
  const bookCount = await bookCards.count();
  console.log(`  Found ${bookCount} book cards/links`);
  
  // 3. Check nav header elements
  console.log('\n3. Testing navigation header...');
  const navElements = await page.locator('header a, header button').all();
  console.log(`  ${navElements.length} nav elements in header`);
  
  // 4. Create a fresh new book
  console.log('\n4. Testing New Book creation...');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/51-create-modal-final.png`, fullPage: true });
    
    // Fill
    await page.fill('#modal-title', 'Stories from the Garden');
    await page.fill('#modal-desc', 'Memories of growing up on the farm');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/52-create-filled-final.png`, fullPage: true });
    
    // Create
    await page.click('button[type="submit"]:has-text("Create Book")');
    await page.waitForURL('**/books/**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    const newBookUrl = page.url();
    console.log(`  ✓ New book created at ${newBookUrl}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/53-new-book-created.png`, fullPage: true });
    
    // 5. Check the new book's empty state
    console.log('\n5. Checking new book empty state...');
    // Is it empty? If so, should show empty state
    const emptyStateTitle = page.locator('text=Start your memory book').first();
    const hasEmptyState = await emptyStateTitle.isVisible({ timeout: 3000 });
    console.log(`  Empty state visible: ${hasEmptyState}`);
    
    // 6. Check Add Memory button is visible in header nav
    console.log('\n6. Checking Add Memory button in nav...');
    const navAddMemory = page.locator('header a[href*="/edit"]:has-text("Add Memory")');
    const navAddVisible = await navAddMemory.isVisible({ timeout: 2000 });
    console.log(`  Nav Add Memory button visible: ${navAddVisible}`);
    if (navAddVisible) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/54-nav-add-memory.png`, fullPage: true });
    }
    
    // 7. Add a memory to the new book
    console.log('\n7. Adding memory to new book...');
    const heroAddBtn = page.locator('a:has-text("Add your first memory"), a:has-text("Add Memory")').first();
    if (await heroAddBtn.isVisible({ timeout: 2000 })) {
      const href = await heroAddBtn.getAttribute('href');
      console.log(`  Clicking: ${href}`);
      await heroAddBtn.click();
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/55-edit-new-memory.png`, fullPage: true });
      
      // Fill memory
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 2000 })) {
        const ph = await textarea.getAttribute('placeholder');
        console.log(`  Filling textarea: "${ph}"`);
        await textarea.fill('The garden was my grandmother\'s pride and joy. Every spring, she would plant tomatoes, peppers, and herbs that she used in recipes passed down through generations. I still remember the smell of basil on a hot August afternoon.');
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/56-memory-filled.png`, fullPage: true });
        
        // Save
        const saveBtn = page.locator('button[type="submit"]').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          const disabled = await saveBtn.isDisabled();
          console.log(`  Save button disabled: ${disabled}`);
          if (!disabled) {
            await saveBtn.click();
            await page.waitForTimeout(3500);
            await page.screenshot({ path: `${SCREENSHOT_DIR}/57-memory-saved.png`, fullPage: true });
            console.log('  ✓ Memory saved');
          }
        }
      }
    }
    
    // 8. Check book with memory
    if (page.url().includes('/edit')) {
      console.log('\n8. Back to book detail...');
      await page.goto(newBookUrl.replace('/edit', '').replace('/books/', '/books/'), { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/58-book-with-memory-final.png`, fullPage: true });
    }
  }
  
  // 9. Settings page
  console.log('\n9. Testing Settings page...');
  await page.goto(BASE_URL + '/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/59-settings-final.png`, fullPage: true });
  console.log('  ✓ Settings page captured');
  
  // 10. Summary
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 120)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Final screenshots in ' + SCREENSHOT_DIR + '/ ===');
}

main().catch(console.error);
