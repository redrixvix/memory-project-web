const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3133';
const EMAIL = 'alexsmith@gmail.com';
const PASSWORD = 'Test123!';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  console.log('=== UI Cycle: Premium Memory App ===\n');
  
  // 1. Login flow
  console.log('1. Starting login flow...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens-ui-cycle/login-landing.png', fullPage: true });
  
  // Click sign in
  const signInBtn = page.locator('button:has-text("Sign in")').first();
  if (await signInBtn.isVisible()) {
    await signInBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens-ui-cycle/login-modal.png', fullPage: true });
  }
  
  // Fill email
  const emailInput = page.locator('input[type="email"], input[placeholder*="email" i], input[placeholder*="mail" i]').first();
  if (await emailInput.isVisible({ timeout: 2000 })) {
    await emailInput.fill(EMAIL);
    console.log('  ✓ Email filled');
  }
  
  // Fill password
  const passInput = page.locator('input[type="password"]').first();
  if (await passInput.isVisible({ timeout: 2000 })) {
    await passInput.fill(PASSWORD);
    console.log('  ✓ Password filled');
    
    // Submit
    const submitBtn = page.locator('button[type="submit"], button:has-text("Continue"), button:has-text("Sign in")').first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      console.log('  ✓ Submitted login');
    }
  }
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle/after-login.png', fullPage: true });
  console.log('  ✓ Post-login screenshot');
  
  // 2. Explore authenticated pages
  console.log('\n2. Exploring authenticated pages...');
  
  const pages = [
    { url: '/app', name: 'app-main' },
    { url: '/app/dashboard', name: 'app-dashboard' },
    { url: '/app/settings', name: 'app-settings' },
  ];
  
  for (const p of pages) {
    try {
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `screens-ui-cycle/${p.name}.png`, fullPage: true });
      console.log(`  ✓ ${p.url}`);
    } catch (e) {
      console.log(`  ✗ ${p.url}: ${e.message}`);
    }
  }
  
  // 3. Try creating a memory
  console.log('\n3. Testing memory creation flow...');
  
  // Look for create memory button
  const createBtn = page.locator('button:has-text("Create"), button:has-text("New Memory"), button:has-text("Add Memory")').first();
  if (await createBtn.isVisible({ timeout: 2000 })) {
    await createBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens-ui-cycle/memory-create-modal.png', fullPage: true });
    console.log('  ✓ Create memory modal opened');
    
    // Fill in memory details
    const titleInput = page.locator('input[placeholder*="title" i], input[placeholder*="Title" i], input[type="text"]').first();
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('My Test Memory from UI Cycle');
      console.log('  ✓ Title filled');
    }
    
    const descInput = page.locator('textarea[placeholder*="description" i], textarea[placeholder*="Description" i], textarea').first();
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Testing the memory creation flow to improve UI');
      console.log('  ✓ Description filled');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-ui-cycle/memory-filled.png', fullPage: true });
  } else {
    console.log('  ✗ Create button not found');
    await page.screenshot({ path: 'screens-ui-cycle/no-create-btn.png', fullPage: true });
  }
  
  // 4. Check for console errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors detected:');
    errors.forEach(e => console.log(`  - ${e}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== UI Cycle screenshots captured ===');
  console.log('Location: screens-ui-cycle/*.png');
}

main().catch(console.error);
