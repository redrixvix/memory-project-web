const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens-ui-cycle6';

async function main() {
  // Ensure screenshot dir
  if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  console.log('=== UI Cycle 6: Deep Memory Flow + UX Audit ===\n');
  
  // 1. Login
  console.log('1. Login...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/01-dashboard.png`, fullPage: true });
  console.log('  ✓ Logged in');
  
  // 2. Create brand-new book for testing
  console.log('\n2. Creating fresh test book...');
  await page.click('button:has-text("New Book")');
  await page.waitForTimeout(1500);
  await page.fill('#modal-title', 'The Kitchen Table');
  await page.fill('#modal-desc', 'Stories told around food, family, and the old kitchen table.');
  await page.click('button[type="submit"]:has-text("Create Book")');
  await page.waitForURL('**/books/**', { timeout: 10000 });
  await page.waitForTimeout(2000);
  const testBookUrl = page.url();
  const bookId = testBookUrl.match(/\/books\/(\d+)/)?.[1];
  console.log(`  ✓ Created: /books/${bookId}`);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/02-new-book-empty.png`, fullPage: true });
  
  // 3. Click "Add your first memory" CTA (hero empty state)
  console.log('\n3. Clicking empty state CTA...');
  const emptyCta = page.locator('a:has-text("Add your first memory")').first();
  const emptyCtaVisible = await emptyCta.isVisible({ timeout: 3000 });
  console.log(`  Empty CTA visible: ${emptyCtaVisible}`);
  if (emptyCtaVisible) {
    await emptyCta.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/03-edit-page-blank.png`, fullPage: true });
  }
  
  // 4. Inspect the edit page fully
  console.log('\n4. Inspecting edit page elements...');
  const textareas = page.locator('textarea');
  const tCount = await textareas.count();
  for (let i = 0; i < tCount; i++) {
    const ph = await textareas.nth(i).getAttribute('placeholder');
    const box = await textareas.nth(i).boundingBox();
    console.log(`  textarea[${i}]: placeholder="${ph?.substring(0, 60)}" y=${box ? Math.round(box.y) : 'null'}`);
  }
  
  const selects = page.locator('select');
  const sCount = await selects.count();
  console.log(`  ${sCount} select elements`);
  for (let i = 0; i < sCount; i++) {
    const opts = await selects.nth(i).locator('option').allTextContents();
    console.log(`  select[${i}]: ${opts.slice(0, 4).join(', ')}${opts.length > 4 ? '...' : ''}`);
  }
  
  // 5. Type a memory with prompt visible
  console.log('\n5. Writing memory...');
  const mainTextarea = textareas.first();
  await mainTextarea.click();
  await mainTextarea.fill('The kitchen table was where everything happened. Birthdays were celebrated with vanilla sheet cake baked in a chipped Pyrex dish. Arguments were settled over dishes being dried. And every Sunday, my grandmother folded laundry while telling stories about the old country — how she met my grandfather, why she immigrated, what she ate on her first American Thanksgiving.');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/04-memory-text-entered.png`, fullPage: true });
  
  // 6. Word count display check
  const wordCountEl = page.locator('text=/\\d+ words?/').first();
  const wordCountVisible = await wordCountEl.isVisible({ timeout: 2000 });
  const wordCountText = await wordCountEl.textContent().catch(() => 'n/a');
  console.log(`  Word count visible: ${wordCountVisible} — "${wordCountText}"`);
  
  // 7. Open prompt selector
  console.log('\n6. Testing prompt selector...');
  const promptSelect = page.locator('select').first();
  if (await promptSelect.isVisible()) {
    const currentVal = await promptSelect.inputValue();
    console.log(`  Current prompt value: ${currentVal}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/05-with-prompt-selector.png`, fullPage: true });
    
    // Select a prompt
    await promptSelect.selectOption({ index: 3 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/06-prompt-selected.png`, fullPage: true });
    const newVal = await promptSelect.inputValue();
    console.log(`  New prompt value: ${newVal}`);
  }
  
  // 8. Check save button
  console.log('\n7. Checking save button...');
  const saveBtn = page.locator('button[type="submit"]').first();
  const saveDisabled = await saveBtn.isDisabled();
  const saveText = await saveBtn.textContent();
  console.log(`  Save: "${saveText?.trim()}" disabled=${saveDisabled}`);
  
  // 9. Save memory
  if (!saveDisabled) {
    console.log('\n8. Saving memory...');
    await saveBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/07-after-save.png`, fullPage: true });
    console.log(`  URL after save: ${page.url()}`);
  }
  
  // 10. Go back to book — verify memory card
  console.log('\n9. Verifying book with new memory...');
  await page.goto(BASE_URL + `/books/${bookId}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/08-book-with-memory.png`, fullPage: true });
  
  // 11. Edit the memory
  console.log('\n10. Editing memory...');
  const editBtn = page.locator('button:has-text("Edit")').first();
  if (await editBtn.isVisible({ timeout: 3000 })) {
    await editBtn.click();
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/09-memory-edit-page.png`, fullPage: true });
    console.log('  ✓ Edit page loaded');
    
    // Add more text
    const editTextarea = page.locator('textarea').first();
    if (await editTextarea.isVisible()) {
      const existingText = await editTextarea.inputValue();
      await editTextarea.fill(existingText + ' That kitchen table is gone now, but I still have the dish towel she used every single day.');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/10-memory-edited.png`, fullPage: true });
      
      const editSaveBtn = page.locator('button[type="submit"]').first();
      if (!(await editSaveBtn.isDisabled())) {
        await editSaveBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({ path: `${SCREENSHOT_DIR}/11-memory-update-saved.png`, fullPage: true });
        console.log('  ✓ Memory updated');
      }
    }
  }
  
  // 12. Library view
  console.log('\n11. Checking library...');
  await page.goto(BASE_URL + '/library', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/12-library.png`, fullPage: true });
  
  // 13. Settings page checks
  console.log('\n12. Checking settings...');
  await page.goto(BASE_URL + '/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Try to change display name
  const nameInput = page.locator('#display-name');
  if (await nameInput.isVisible()) {
    await nameInput.fill('');
    await nameInput.fill('Alex R.');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/13-settings-name-changed.png`, fullPage: true });
    console.log('  Name changed');
  }
  
  // 14. Check for any console errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 150)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== All done ===');
}

main().catch(console.error);
