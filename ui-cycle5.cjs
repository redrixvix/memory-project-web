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
  
  console.log('=== UI Cycle 5: Comprehensive Premium Flow ===\n');
  
  // 1. Login
  console.log('1. Logging in...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-login.png`, fullPage: true });
  console.log('  ✓ Logged in');
  
  // 2. Dashboard overview
  console.log('\n2. Dashboard overview...');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-dashboard.png`, fullPage: true });
  console.log('  ✓ Dashboard captured');
  
  // 3. Create a new book - test the create flow
  console.log('\n3. Testing New Book flow...');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.isVisible()) {
    await newBookBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-create-modal.png`, fullPage: true });
    
    // Fill in book details
    await page.fill('#modal-title', 'A Life Well Lived');
    await page.fill('#modal-desc', 'Stories and memories from our family history');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/04-create-filled.png`, fullPage: true });
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Create Book")');
    await page.waitForURL('**/books/**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-book-created.png`, fullPage: true });
    console.log('  ✓ Book created');
    
    const bookUrl = page.url();
    
    // 4. Add a memory to this book
    console.log('\n4. Adding memory to book...');
    const addMemoryBtn = page.locator('button:has-text("Add Memory"), button:has-text("Write a memory")').first();
    if (await addMemoryBtn.isVisible({ timeout: 3000 })) {
      await addMemoryBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/06-memory-form.png`, fullPage: true });
      
      // Fill memory content
      const promptField = page.locator('textarea[id*="prompt"], textarea[placeholder*="prompt"], textarea[id*="answer"], textarea[id*="content"]').first();
      if (await promptField.isVisible({ timeout: 2000 })) {
        await promptField.fill('What is your favorite childhood memory and why does it mean so much to you?');
      }
      
      const textField = page.locator('textarea:not([id*="prompt"]):not([placeholder*="prompt"]):not([id*="answer"]):not([id*="description"]):not([id*="desc"]), textarea[placeholder*="memory"], textarea[placeholder*="answer"]').first();
      if (await textField.isVisible({ timeout: 2000 })) {
        await textField.fill('When I was seven, my grandmother taught me how to bake bread. The warmth of the kitchen, the smell of fresh dough, and her hands guiding mine — those Sunday mornings taught me that love is measured in flour and patience.');
      }
      
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/07-memory-filled.png`, fullPage: true });
      
      // Save the memory
      const saveBtn = page.locator('button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add"), button:has-text("Save memory")').first();
      if (await saveBtn.isVisible({ timeout: 2000 })) {
        await saveBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/08-memory-saved.png`, fullPage: true });
        console.log('  ✓ Memory saved');
      }
    }
    
    // 5. Navigate to Dashboard and check the book appears
    console.log('\n5. Checking Dashboard after creation...');
    await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-dashboard-with-book.png`, fullPage: true });
    console.log('  ✓ Dashboard verified');
    
    // 6. Go to Library page
    console.log('\n6. Testing Library page...');
    await page.goto(BASE_URL + '/books', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/10-library.png`, fullPage: true });
    console.log('  ✓ Library page captured');
    
    // 7. Settings page
    console.log('\n7. Testing Settings page...');
    await page.goto(BASE_URL + '/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/11-settings.png`, fullPage: true });
    console.log('  ✓ Settings page captured');
    
    // 8. Go back to the book we created and test editing
    console.log('\n8. Testing book detail/edit flow...');
    await page.goto(bookUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/12-book-detail.png`, fullPage: true });
    
    // Try to find and click an edit button
    const editBtn = page.locator('button:has-text("Edit"), button:has-text("Edit memory")').first();
    if (await editBtn.isVisible({ timeout: 3000 })) {
      await editBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/13-edit-flow.png`, fullPage: true });
      console.log('  ✓ Edit flow captured');
    }
    
    // 9. Scroll through book detail page
    console.log('\n9. Testing scroll experience...');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.5));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/14-book-mid-scroll.png`, fullPage: true });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/15-book-bottom.png`, fullPage: true });
    console.log('  ✓ Scroll experience captured');
  }
  
  // 10. Check for console errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 120)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Screenshots saved to ' + SCREENSHOT_DIR + '/ ===');
  console.log('Next steps: review screenshots and identify UI improvements');
}

main().catch(console.error);
