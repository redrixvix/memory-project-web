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
  
  console.log('=== UI Cycle 5c: Memory Edit Flow ===\n');
  
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
  
  // 2. Go to memory editor
  console.log('\n2. Going to memory editor...');
  await page.goto(BASE_URL + '/books/234/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/31-memory-editor.png`, fullPage: true });
  
  // 3. Inspect all textareas
  console.log('\n3. Inspecting textareas...');
  const textareas = page.locator('textarea');
  const tCount = await textareas.count();
  for (let i = 0; i < tCount; i++) {
    const id = await textareas.nth(i).getAttribute('id');
    const name = await textareas.nth(i).getAttribute('name');
    const placeholder = await textareas.nth(i).getAttribute('placeholder');
    const visible = await textareas.nth(i).isVisible();
    const box = await textareas.nth(i).boundingBox();
    console.log(`  textarea[${i}]: id="${id}" name="${name}" placeholder="${placeholder}" visible=${visible} boxY=${box ? Math.round(box.y) : 'null'}`);
  }
  
  // 4. Inspect selects
  console.log('\n4. Inspecting selects...');
  const selects = page.locator('select');
  const sCount = await selects.count();
  for (let i = 0; i < sCount; i++) {
    const visible = await selects.nth(i).isVisible();
    const optCount = await selects.nth(i).locator('option').count();
    console.log(`  select[${i}]: visible=${visible}, ${optCount} options`);
  }
  
  // 5. Fill memory textarea - find the largest one (main content area)
  console.log('\n5. Filling main memory textarea...');
  // The memory textarea should be the one with "take your time" placeholder
  // or the one that's largest
  let textareaFilled = false;
  for (let i = 0; i < tCount; i++) {
    const ph = await textareas.nth(i).getAttribute('placeholder') || '';
    const box = await textareas.nth(i).boundingBox();
    if (ph.toLowerCase().includes('take') || ph.toLowerCase().includes('time')) {
      console.log(`  Filling textarea[${i}] with placeholder "${ph}"`);
      await textareas.nth(i).fill('The summer my family drove across Route 66 remains the most vivid memory of my childhood. We loaded up our old station wagon with nothing but a tent and a cooler full of sandwiches, and for two weeks we saw the country the way it was meant to be seen — together, with no schedule and no agenda.');
      textareaFilled = true;
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/32-memory-filled.png`, fullPage: true });
      console.log('  ✓ Memory text filled');
      break;
    }
  }
  
  if (!textareaFilled) {
    // Fill the last textarea as fallback
    const lastT = textareas.last();
    if (await lastT.isVisible({ timeout: 2000 })) {
      const ph = await lastT.getAttribute('placeholder');
      console.log(`  Filling last textarea (placeholder="${ph}")`);
      await lastT.fill('The summer my family drove across Route 66 remains the most vivid memory of my childhood.');
      await page.waitForTimeout(500);
      await page.screenshot({ path: `${SCREENSHOT_DIR}/32-memory-filled.png`, fullPage: true });
      console.log('  ✓ Memory text filled (fallback)');
    }
  }
  
  // 6. Check save button state
  console.log('\n6. Checking save button...');
  const saveBtn = page.locator('button[type="submit"]').first();
  const disabled = await saveBtn.isDisabled();
  const btnText = await saveBtn.textContent();
  console.log(`  Save button: "${btnText?.trim()}" disabled=${disabled}`);
  
  // 7. Save the memory
  if (!disabled) {
    console.log('\n7. Saving memory...');
    await saveBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/33-after-save.png`, fullPage: true });
    console.log(`  Current URL: ${page.url()}`);
    console.log('  ✓ Save complete');
  }
  
  // 8. Check errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 120)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Done ===');
}

main().catch(console.error);
