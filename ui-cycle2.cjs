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
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  console.log('=== UI Cycle: Premium Memory App ===\n');
  
  // 1. Login flow with full page navigation
  console.log('1. Starting login flow...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens-ui-cycle2/01-login-page.png', fullPage: true });
  
  // Fill email
  const emailInput = page.locator('#email');
  await emailInput.fill(EMAIL);
  console.log('  ✓ Email filled');
  
  // Click the specific "Sign in with password" button
  await page.locator('button:has-text("Sign in with password")').first().click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'screens-ui-cycle2/02-after-email.png', fullPage: true });
  
  // Now fill password
  const passInput = page.locator('#password');
  const passVisible = await passInput.isVisible({ timeout: 3000 }).catch(() => false);
  if (passVisible) {
    await passInput.fill(PASSWORD);
    console.log('  ✓ Password filled');
    await page.locator('button:has-text("Sign in with password")').click();
    console.log('  ✓ Login submitted');
  } else {
    console.log('  ⚠ Password field not visible after email submit');
  }
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle2/03-after-login.png', fullPage: true });
  
  const currentUrl = page.url();
  console.log(`  Current URL: ${currentUrl}`);
  
  // 2. Explore authenticated pages
  console.log('\n2. Exploring authenticated pages...');
  
  const pages = [
    { url: '/app', name: '04-app-main' },
    { url: '/app/dashboard', name: '05-dashboard' },
    { url: '/app/books', name: '06-books' },
    { url: '/app/settings', name: '07-settings' },
  ];
  
  for (const p of pages) {
    try {
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `screens-ui-cycle2/${p.name}.png`, fullPage: true });
      console.log(`  ✓ ${p.url}`);
    } catch (e) {
      console.log(`  ✗ ${p.url}: ${e.message}`);
    }
  }
  
  // 3. Create a memory
  console.log('\n3. Testing memory creation...');
  
  // Look for create button - on dashboard
  await page.goto(BASE_URL + '/app/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screens-ui-cycle2/08-dashboard-check.png', fullPage: true });
  
  // Try to find "Create Memory" button in various forms
  const createMemoryBtn = page.locator('button:has-text("Create Memory"), button:has-text("New Memory")').first();
  const btnVisible = await createMemoryBtn.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (btnVisible) {
    await createMemoryBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens-ui-cycle2/08-create-modal.png', fullPage: true });
    console.log('  ✓ Create modal opened');
    
    // Fill title
    const titleInput = page.locator('input[placeholder*="title" i], input[placeholder*="Title" i]').first();
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('My Test Memory - UI Cycle 2026');
      console.log('  ✓ Title filled');
    }
    
    // Fill description
    const descInput = page.locator('textarea[placeholder*="description" i], textarea[placeholder*="Description" i]').first();
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Testing the memory creation flow during UI improvement cycle.');
      console.log('  ✓ Description filled');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-ui-cycle2/09-memory-filled.png', fullPage: true });
    
    // Save memory
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create")').first();
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens-ui-cycle2/10-memory-saved.png', fullPage: true });
      console.log('  ✓ Memory saved');
    }
  } else {
    console.log('  ✗ Create Memory button not found on dashboard');
    // Check the page HTML for debugging
    const bodyText = await page.locator('body').textContent();
    console.log(`  Body preview: ${bodyText?.substring(0, 200)}`);
  }
  
  // 4. Create a book
  console.log('\n4. Testing book creation...');
  
  await page.goto(BASE_URL + '/app/books', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screens-ui-cycle2/11-books-page.png', fullPage: true });
  
  const newBookBtn = page.locator('button:has-text("New Book"), button:has-text("Create Book")').first();
  const newBookVisible = await newBookBtn.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (newBookVisible) {
    await newBookBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: 'screens-ui-cycle2/12-new-book-modal.png', fullPage: true });
    console.log('  ✓ New book modal opened');
    
    // Fill book title
    const bookTitle = page.locator('input[placeholder*="book" i], input[placeholder*="Book" i], input[type="text"]').first();
    if (await bookTitle.isVisible({ timeout: 2000 })) {
      await bookTitle.fill('Smith Family Memories 2026');
      console.log('  ✓ Book title filled');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-ui-cycle2/13-book-filled.png', fullPage: true });
    
    const createBookBtn = page.locator('button:has-text("Create"), button:has-text("Save")').first();
    if (await createBookBtn.isVisible({ timeout: 2000 })) {
      await createBookBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens-ui-cycle2/14-book-created.png', fullPage: true });
      console.log('  ✓ Book created');
    }
  } else {
    console.log('  ✗ New Book button not found');
    const bodyText = await page.locator('body').textContent();
    console.log(`  Body preview: ${bodyText?.substring(0, 200)}`);
  }
  
  // 5. Check for errors
  if (errors.length > 0) {
    console.log('\n⚠ Console errors:');
    errors.slice(0, 5).forEach(e => console.log(`  - ${e.substring(0, 100)}`));
  } else {
    console.log('\n✓ No console errors');
  }
  
  await browser.close();
  console.log('\n=== Screenshots in screens-ui-cycle2/*.png ===');
}

main().catch(console.error);
