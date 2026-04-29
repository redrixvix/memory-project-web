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
  
  console.log('=== UI Cycle 5: Memory + Upload Flow ===\n');
  
  // 1. Login
  console.log('1. Logging in...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('  ✓ Logged in');
  
  // 2. Find a book to add memories to
  console.log('\n2. Finding a book...');
  const bookLinks = page.locator('a[href*="/books/"]');
  const bookCount = await bookLinks.count();
  console.log(`  Found ${bookCount} book links`);
  
  if (bookCount > 0) {
    const firstBookHref = await bookLinks.first().getAttribute('href');
    if (firstBookHref) {
      console.log(`  Navigating to ${firstBookHref}`);
      await page.goto(BASE_URL + firstBookHref, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/20-book-detail-test.png`, fullPage: true });
      
      // 3. Find the Add Memory button
      console.log('\n3. Looking for Add Memory button...');
      const addMemoryBtn = page.locator('a[href*="/edit"], button:has-text("Add Memory"), button:has-text("Write a memory"), button:has-text("Add your first memory")');
      const btnCount = await addMemoryBtn.count();
      console.log(`  Found ${btnCount} add memory elements`);
      
      for (let i = 0; i < Math.min(btnCount, 5); i++) {
        const text = await addMemoryBtn.nth(i).textContent();
        const tag = await addMemoryBtn.nth(i).evaluate(el => el.tagName);
        const href = await addMemoryBtn.nth(i).getAttribute('href');
        console.log(`  [${i}] ${tag}${href ? ' (href=' + href + ')' : ''}: "${text}"`);
      }
      
      if (btnCount > 0) {
        const firstBtnHref = await addMemoryBtn.first().getAttribute('href');
        const firstBtnTag = await addMemoryBtn.first().evaluate(el => el.tagName);
        
        if (firstBtnTag === 'A' && firstBtnHref) {
          await page.goto(BASE_URL + firstBtnHref, { waitUntil: 'networkidle' });
        } else {
          await addMemoryBtn.first().click();
        }
        await page.waitForTimeout(2000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/21-edit-memory-form.png`, fullPage: true });
        
        // 4. Test the form - fill in memory text
        console.log('\n4. Testing memory edit form...');
        
        // Find textarea
        const textareas = page.locator('textarea');
        const textareaCount = await textareas.count();
        console.log(`  Found ${textareaCount} textareas`);
        
        for (let i = 0; i < textareaCount; i++) {
          const id = await textareas.nth(i).getAttribute('id');
          const placeholder = await textareas.nth(i).getAttribute('placeholder');
          const name = await textareas.nth(i).getAttribute('name');
          console.log(`  [${i}] id="${id}" name="${name}" placeholder="${placeholder}"`);
        }
        
        // Fill the main text area
        const mainTextarea = textareas.last();
        if (await mainTextarea.isVisible({ timeout: 2000 })) {
          await mainTextarea.fill('My grandmother\'s kitchen was always filled with the warm smell of fresh bread. Every Sunday, she would let me help her knead the dough, teaching me that the best things in life require patience and love.');
          await page.waitForTimeout(500);
          await page.screenshot({ path: `${SCREENSHOT_DIR}/22-memory-text-filled.png`, fullPage: true });
          console.log('  ✓ Memory text filled');
        }
        
        // 5. Test image upload area
        console.log('\n5. Testing photo upload UI...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.6));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/23-upload-area.png`, fullPage: true });
        
        // 6. Test audio recording UI
        console.log('\n6. Testing audio recording UI...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(500);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/24-audio-area.png`, fullPage: true });
        
        // 7. Check the save button state
        console.log('\n7. Checking save button state...');
        const saveBtn = page.locator('button[type="submit"]:not(:has-text("Log")), button:has-text("Save Memory"), button:has-text("Update Memory")');
        for (let i = 0; i < await saveBtn.count(); i++) {
          const text = await saveBtn.nth(i).textContent();
          const disabled = await saveBtn.nth(i).isDisabled();
          console.log(`  Save button [${i}]: "${text}" disabled=${disabled}`);
        }
        
        // 8. Try to save the memory
        console.log('\n8. Saving memory...');
        const submitBtn = page.locator('button[type="submit"]:has-text("Save Memory"), button[type="submit"]:has-text("Save")').first();
        if (await submitBtn.isVisible({ timeout: 2000 })) {
          const isDisabled = await submitBtn.isDisabled();
          console.log(`  Submit button disabled: ${isDisabled}`);
          
          if (!isDisabled) {
            await submitBtn.click();
            await page.waitForTimeout(3000);
            await page.screenshot({ path: `${SCREENSHOT_DIR}/25-after-save.png`, fullPage: true });
            console.log('  ✓ Memory saved');
          }
        }
      }
    }
  }
  
  // 9. Check the book detail for the new memory
  if (bookCount > 0) {
    console.log('\n9. Checking book detail for saved memory...');
    await page.goto(page.url().replace('/edit', ''), { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/26-book-with-memory.png`, fullPage: true });
    console.log('  ✓ Book detail captured');
  }
  
  // 10. Check for errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 120)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Screenshots saved ===');
}

main().catch(console.error);
