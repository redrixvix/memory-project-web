const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push('ERR:' + m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  const snap = (name) => page.screenshot({ path: `screens-ui-cycle/${name}.png`, fullPage: false }).then(() => console.log('📸 ' + name));

  // Login
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  console.log('✓ Logged in');
  await snap('01-dashboard');

  // ── DASHBOARD ──────────────────────────────────────
  const bookLinks = await page.locator('a[href*="/books/"]').all();
  console.log('Book cards found:', bookLinks.length);

  // ── NEW BOOK FLOW ──────────────────────────────────
  const newBookBtn = page.locator('button:has-text("New Book"), button:has-text("Create your first book")').first();
  if (await newBookBtn.isVisible({ timeout: 3000 })) {
    await newBookBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await snap('02-new-book-modal');
    
    // Fill title using the correct selector
    await page.fill('#modal-title', 'My Test Memory Book');
    await page.fill('#modal-desc', 'Testing the premium UI flow');
    await snap('03-new-book-filled');
    
    // Submit via form
    await page.click('button[type="submit"]:has-text("Create Book")');
    await page.waitForURL(/\/books\/\d+/, { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    console.log('✓ Book created:', page.url());
    await snap('04-new-book-created');
  }

  const currentUrl = page.url();

  // ── BOOK DETAIL / EMPTY STATE ───────────────────────
  console.log('\n--- BOOK DETAIL ---');
  const bookText = await page.locator('body').textContent();
  console.log('Has "Start your memory book":', bookText.includes('Start your memory book'));
  console.log('Has prompt chips:', bookText.includes('A trip that changed'));
  console.log('Has Add first memory CTA:', bookText.includes('Add your first memory'));
  
  // Try prompt chip
  const promptChip = page.locator('a:has-text("A trip that changed")').first();
  if (await promptChip.isVisible({ timeout: 3000 })) {
    console.log('\n--- CLICKING PROMPT CHIP ---');
    await promptChip.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());
    await snap('05-memory-from-prompt');
    
    // Check textarea
    const ta = page.locator('textarea').first();
    const taVal = await ta.inputValue();
    console.log('Textarea has prompt:', taVal.length > 0);
    if (taVal.length === 0) {
      await ta.fill('The summer I turned sixteen, my grandfather took me fishing at the lake. I remember the way the early morning mist sat on the water, so quiet and still. He taught me how to bait the hook, how to wait with patience, how to appreciate the simple moments.');
    }
    await snap('06-memory-filled');
    
    // Scroll down to save bar
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(800);
    await snap('07-save-bar');
  }

  // ── ADD MEMORY VIA HEADER BUTTON ───────────────────
  console.log('\n--- GOING BACK TO BOOK ---');
  await page.goto(currentUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const addBtn = page.locator('a:has-text("Add Memory"), a:has-text("Add a Memory")').first();
  if (await addBtn.isVisible({ timeout: 3000 })) {
    console.log('Clicking Add Memory header button');
    await addBtn.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('URL:', page.url());
    await snap('08-add-memory-page');
  }

  // ── WRITE FREE-FORM ─────────────────────────────────
  console.log('\n--- FREE-FORM MEMORY ---');
  await page.goto(BASE + '/books/223/edit');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Check prompt select
  const selectEl = page.locator('select').first();
  const options = await selectEl.locator('option').all();
  console.log('Prompt options:', options.length);
  
  // Fill free-form memory  
  await page.locator('textarea').first().fill('Grandma\'s kitchen was the heart of our family. Every Sunday after church, everyone would gather there. The smell of her roast beef would fill the whole house. She had this way of making everyone feel like the most important person in the room.');
  await page.waitForTimeout(500);
  await snap('09-freeform-filled');
  
  // Check word count visible
  const wcText = await page.locator('text=/\\d+ word/').first().textContent().catch(() => 'not found');
  console.log('Word count:', wcText);

  // ── SETTINGS PAGE ──────────────────────────────────
  console.log('\n--- SETTINGS ---');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await snap('10-settings');
  
  const st = await page.locator('body').textContent();
  console.log('Has Profile:', st.includes('Profile'));
  console.log('Has Display name:', st.includes('Display name'));
  console.log('Has Privacy:', st.includes('Privacy'));
  console.log('Has Security:', st.includes('Security'));
  console.log('Has Sign out:', st.includes('Sign out'));

  // ── BOOK WITH MEMORIES ─────────────────────────────
  console.log('\n--- BOOK WITH MEMORIES ---');
  await page.goto(BASE + '/books/222');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  const book222Text = await page.locator('body').textContent();
  console.log('Book 222 has memories:', book222Text.includes('Chapter'));
  if (book222Text.includes('Chapter')) {
    await snap('11-book-with-memories');
  }

  console.log('\n=== CONSOLE ERRORS ===');
  console.log(errors.length > 0 ? errors : 'None');
  
  await browser.close();
  console.log('\n✓ Complete');
}

run().catch(e => { console.error(e); process.exit(1); });
