const { chromium } = require('playwright');
const fs = require('fs');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens-ui-cycle6';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  console.log('=== Word Count Fix Validation ===\n');
  
  // Login
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('✓ Logged in');
  
  // Go to edit page of a book
  await page.goto(BASE_URL + '/books/234/edit', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/60-edit-blank-wordcount.png`, fullPage: true });
  console.log('1. Edit page (blank) captured');
  
  // Check: NO word count badge should be visible when textarea is empty
  // The old code showed "✎ 0 words" - this should now be gone
  const wordCountBadge = page.locator('text=/\\d+ words?/').first();
  const badgeVisibleBlank = await wordCountBadge.isVisible({ timeout: 2000 }).catch(() => false);
  console.log(`2. Word count badge visible (blank page): ${badgeVisibleBlank} (should be false)`);
  
  // Fill the textarea
  const textarea = page.locator('textarea').first();
  await textarea.click();
  await textarea.fill('The garden was my grandmother\'s pride and joy. Every spring she would plant tomatoes, peppers, and herbs that she used in recipes passed down through generations.');
  await page.waitForTimeout(800); // Wait for state update + re-render
  await page.screenshot({ path: `${SCREENSHOT_DIR}/61-edit-filled-wordcount.png`, fullPage: true });
  console.log('3. Edit page (filled) captured');
  
  // Check: word count badge SHOULD be visible now
  const badgeVisibleFilled = await wordCountBadge.isVisible({ timeout: 2000 }).catch(() => false);
  const badgeText = badgeVisibleFilled ? await wordCountBadge.textContent() : 'NOT FOUND';
  console.log(`4. Word count badge visible (with text): ${badgeVisibleFilled} — text: "${badgeText}"`);
  
  // Check word count value
  if (badgeVisibleFilled) {
    const wcMatch = badgeText?.match(/(\d+)/);
    const wc = wcMatch ? parseInt(wcMatch[1]) : 0;
    console.log(`   Word count: ${wc} (expected ~26)`);
    console.log(`   ${wc > 0 ? '✓ PASS' : '✗ FAIL'} — word count badge appeared after text entered`);
  } else {
    console.log('   ✗ FAIL — word count badge did not appear');
  }
  
  // Test save flow
  const saveBtn = page.locator('button[type="submit"]').first();
  if (!(await saveBtn.isDisabled())) {
    await saveBtn.click();
    await page.waitForTimeout(3500);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/62-after-save-validation.png`, fullPage: true });
    console.log('5. Memory saved — screenshot captured');
  }
  
  await browser.close();
  console.log('\n=== Validation Complete ===');
}

main().catch(console.error);
