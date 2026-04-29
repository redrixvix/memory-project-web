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
  
  console.log('=== UI Cycle: Premium Memory App ===\n');
  
  // 1. Login flow
  console.log('1. Starting login flow...');
  await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screens-ui-cycle3/01-login-page.png', fullPage: true });
  
  // Fill email and password
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  console.log('  ✓ Credentials filled');
  
  // Submit
  await page.click('button[type="submit"]');
  console.log('  ✓ Submitted');
  
  // Wait for redirect to dashboard
  try {
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    console.log('  ✓ Redirected to dashboard');
  } catch (e) {
    console.log('  ⚠ Did not redirect to dashboard, current URL:', page.url());
  }
  
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'screens-ui-cycle3/02-after-login.png', fullPage: true });
  
  // 2. Explore authenticated pages - using correct routes
  console.log('\n2. Exploring authenticated pages...');
  
  const pagesToTest = [
    { url: '/dashboard', name: '03-dashboard' },
    { url: '/books', name: '04-books-redirect' },
    { url: '/books/new', name: '05-new-book' },
    { url: '/settings', name: '06-settings' },
  ];
  
  for (const p of pagesToTest) {
    try {
      await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `screens-ui-cycle3/${p.name}.png`, fullPage: true });
      console.log(`  ✓ ${p.url} -> ${page.url()}`);
    } catch (e) {
      console.log(`  ✗ ${p.url}: ${e.message}`);
    }
  }
  
  // 3. Create a book on the dashboard
  console.log('\n3. Testing book creation...');
  
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screens-ui-cycle3/07-dashboard-fresh.png', fullPage: true });
  
  // Find "New Book" button - it's the primary CTA on the dashboard
  const newBookBtn = page.locator('button:has-text("New Book"), button:has-text("Create your first book")').first();
  const btnVisible = await newBookBtn.isVisible({ timeout: 3000 }).catch(() => false);
  
  if (btnVisible) {
    await newBookBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'screens-ui-cycle3/08-create-modal.png', fullPage: true });
    console.log('  ✓ Create book modal opened');
    
    // Fill book title
    const titleInput = page.locator('#modal-title');
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('Summer Vacation 2026');
      console.log('  ✓ Book title filled');
    }
    
    // Fill description
    const descInput = page.locator('#modal-desc');
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Our wonderful family trip to the lake house.');
      console.log('  ✓ Book description filled');
    }
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screens-ui-cycle3/09-book-filled.png', fullPage: true });
    
    // Click Create Book button in the modal
    const createBtn = page.locator('button:has-text("Create Book")');
    if (await createBtn.isVisible({ timeout: 2000 })) {
      await createBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: 'screens-ui-cycle3/10-book-created.png', fullPage: true });
      console.log('  ✓ Book created, now at:', page.url());
    }
  } else {
    console.log('  ✗ New Book button not found');
    const allButtons = await page.locator('button').all();
    console.log(`  Found ${allButtons.length} buttons`);
    for (const btn of allButtons.slice(0, 10)) {
      const text = await btn.textContent();
      if (text && text.trim()) console.log(`    Button: "${text.trim().substring(0, 50)}"`);
    }
  }
  
  // 4. Navigate to a book and create a memory
  console.log('\n4. Testing memory creation in a book...');
  
  // Go back to dashboard and find a book
  await page.goto(BASE_URL + '/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Look for book links
  const bookLinks = page.locator('a[href*="/books/"]');
  const bookCount = await bookLinks.count();
  console.log(`  Found ${bookCount} book links`);
  
  if (bookCount > 0) {
    const firstBookHref = await bookLinks.first().getAttribute('href');
    if (firstBookHref) {
      await page.goto(BASE_URL + firstBookHref, { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'screens-ui-cycle3/11-book-detail.png', fullPage: true });
      console.log(`  ✓ Viewing book: ${firstBookHref}`);
      
      // Look for "Add Memory" or "Create Memory" button
      const addMemoryBtn = page.locator('button:has-text("Add Memory"), button:has-text("Write"), a:has-text("Add Memory")').first();
      const addMemVisible = await addMemoryBtn.isVisible({ timeout: 3000 }).catch(() => false);
      
      if (addMemVisible) {
        await addMemoryBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'screens-ui-cycle3/12-memory-form.png', fullPage: true });
        console.log('  ✓ Memory form opened');
        
        // Fill memory title
        const memTitleInput = page.locator('input[placeholder*="title" i], input[placeholder*="Title" i]').first();
        if (await memTitleInput.isVisible({ timeout: 2000 })) {
          await memTitleInput.fill('First Day at the Lake');
          console.log('  ✓ Memory title filled');
        }
        
        // Fill memory content
        const memContentInput = page.locator('textarea[placeholder*="Write" i], textarea[placeholder*="Content" i], textarea').first();
        if (await memContentInput.isVisible({ timeout: 2000 })) {
          await memContentInput.fill('The water was perfect. We arrived early and the whole family enjoyed the sunrise over the lake.');
          console.log('  ✓ Memory content filled');
        }
        
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'screens-ui-cycle3/13-memory-filled.png', fullPage: true });
        
        // Save memory
        const saveMemBtn = page.locator('button:has-text("Save Memory"), button:has-text("Save"), button:has-text("Create Memory")').first();
        if (await saveMemBtn.isVisible({ timeout: 2000 })) {
          await saveMemBtn.click();
          await page.waitForTimeout(2000);
          await page.screenshot({ path: 'screens-ui-cycle3/14-memory-saved.png', fullPage: true });
          console.log('  ✓ Memory saved');
        }
      } else {
        console.log('  ⚠ Add Memory button not found - checking page content');
        const allBtns = await page.locator('button').all();
        console.log(`  ${allBtns.length} buttons on page`);
        for (const btn of allBtns.slice(0, 5)) {
          const t = await btn.textContent();
          if (t && t.trim()) console.log(`    - "${t.trim().substring(0, 40)}"`);
        }
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
  console.log('\n=== Screenshots in screens-ui-cycle3/*.png ===');
  console.log('Final URL:', page.url());
}

main().catch(console.error);
