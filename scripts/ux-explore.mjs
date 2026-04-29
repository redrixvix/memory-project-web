import { chromium } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  let step = 0;
  const snap = async (label) => {
    await page.waitForLoadState('networkidle');
    const path = `/home/rixvix/.openclaw/workspace/memory-project/web/screens/ux-${Date.now()}-${step++}-${label}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`[${step}] ${label} → ${path}`);
  };

  try {
    // ── LOGIN ──
    console.log('\n=== LOGIN ===');
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    await snap('login');
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 15000 });
    await snap('post-login');

    // ── DASHBOARD ──
    console.log('\n=== DASHBOARD ===');
    await page.waitForLoadState('networkidle');
    
    // Get all book links
    const bookLinks = await page.locator('a[href*="/books/"]').all();
    console.log(`Found ${bookLinks.length} book links`);
    
    for (const link of bookLinks.slice(0, 3)) {
      const href = await link.getAttribute('href');
      const txt = await link.textContent().catch(() => '');
      console.log(`  Book: ${txt.trim().substring(0, 50)} → ${href}`);
    }

    // ── BOOK DETAIL PAGE ──
    console.log('\n=== BOOK DETAIL ===');
    // Click the first book
    const firstBookLink = page.locator('a[href*="/books/"]').first();
    const bookHref = await firstBookLink.getAttribute('href');
    console.log(`Navigating to: ${bookHref}`);
    await firstBookLink.click();
    await page.waitForLoadState('networkidle');
    await snap('book-detail');

    // Check the URL
    console.log('URL:', page.url());

    // Count "Add Memory" buttons
    const addMemoryButtons = await page.locator('a:has-text("Add Memory"), button:has-text("Add Memory")').all();
    console.log(`Found ${addMemoryButtons.length} Add Memory elements`);
    for (const btn of addMemoryButtons) {
      const txt = await btn.textContent().catch(() => '');
      const visible = await btn.isVisible().catch(() => false);
      console.log(`  "${txt.trim()}" visible=${visible}`);
    }

    // Try clicking the first visible Add Memory
    const addMemBtn = page.locator('a:has-text("Add Memory")').first();
    if (await addMemBtn.count() > 0 && await addMemBtn.isVisible().catch(() => false)) {
      console.log('Clicking Add Memory...');
      await addMemBtn.click();
      await page.waitForLoadState('networkidle');
      await snap('add-memory-form');
      console.log('URL after click:', page.url());
      
      // Explore the form
      const inputs = await page.locator('input, textarea, select').all();
      console.log(`Form inputs (${inputs.length}):`);
      for (const input of inputs) {
        const type = await input.getAttribute('type').catch(() => 'text');
        const placeholder = await input.getAttribute('placeholder').catch(() => '');
        const id = await input.getAttribute('id').catch(() => '');
        const name = await input.getAttribute('name').catch(() => '');
        const visible = await input.isVisible().catch(() => false);
        if (visible) console.log(`  ${type} | placeholder="${placeholder}" | id="${id}" | name="${name}"`);
      }
      
      // Fill the form if possible
      const promptSelect = page.locator('select').first();
      if (await promptSelect.count() > 0 && await promptSelect.isVisible().catch(() => false)) {
        console.log('Found prompt select, selecting first option...');
        const options = await promptSelect.locator('option').all();
        console.log(`  ${options.length} prompt options`);
        if (options.length > 1) {
          await options[1].click();
          await snap('prompt-selected');
        }
      }
      
      const textarea = page.locator('textarea').first();
      if (await textarea.count() > 0 && await textarea.isVisible().catch(() => false)) {
        console.log('Filling answer textarea...');
        await textarea.fill('This is my test memory about a wonderful summer spent with family. The lake was beautiful and we swam every day.');
        await snap('memory-text-filled');
        
        // Count words
        const text = await textarea.inputValue();
        console.log(`  Word count: ${text.split(/\s+/).filter(Boolean).length}`);
      }
      
      // Check for save button
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button:has-text("Publish")').first();
      if (await saveBtn.count() > 0 && await saveBtn.isVisible().catch(() => false)) {
        const saveTxt = await saveBtn.textContent().catch(() => '');
        console.log(`Found save button: "${saveTxt.trim()}"`);
        await snap('ready-to-save');
      }
    } else {
      console.log('No Add Memory button found, trying direct nav...');
      // Navigate to /books/new directly
      await page.goto(`${BASE_URL}/books/new`);
      await page.waitForLoadState('networkidle');
      console.log('URL:', page.url());
      await snap('books-new-redirect-result');
    }

    // ── CREATE A NEW BOOK ──
    console.log('\n=== CREATE BOOK FLOW ===');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    
    // Click "New Book" button
    const newBookBtn = page.locator('button:has-text("New Book"), a:has-text("New Book")').first();
    if (await newBookBtn.count() > 0 && await newBookBtn.isVisible().catch(() => false)) {
      console.log('Clicking New Book...');
      await newBookBtn.click();
      await page.waitForLoadState('networkidle');
      await snap('create-book-modal');
      
      // Check modal
      const modal = page.locator('[role="dialog"]').first();
      if (await modal.count() > 0 && await modal.isVisible().catch(() => false)) {
        console.log('Create modal is visible');
        
        // Fill title
        const titleInput = page.locator('#modal-title, input[id*="title"]').first();
        if (await titleInput.count() > 0 && await titleInput.isVisible().catch(() => false)) {
          await titleInput.fill('Test Memory Book');
          await snap('book-title-filled');
        }
        
        // Fill description
        const descInput = page.locator('#modal-desc, textarea[id*="desc"]').first();
        if (await descInput.count() > 0 && await descInput.isVisible().catch(() => false)) {
          await descInput.fill('A test book for UI review');
          await snap('book-desc-filled');
        }
        
        // Check create button
        const createBtn = page.locator('button:has-text("Create Book"), button[type="submit"]').first();
        if (await createBtn.count() > 0 && await createBtn.isVisible().catch(() => false)) {
          console.log('Clicking Create Book...');
          await createBtn.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(2000);
          console.log('URL after create:', page.url());
          await snap('after-book-created');
        }
      }
    }

    // ── SETTINGS ──
    console.log('\n=== SETTINGS ===');
    await page.goto(`${BASE_URL}/app/settings`);
    await page.waitForLoadState('networkidle');
    await snap('settings');
    
    // Check if profile name can be edited
    const nameInput = page.locator('input[type="text"]').first();
    if (await nameInput.count() > 0) {
      const val = await nameInput.inputValue();
      console.log(`Profile name: "${val}"`);
    }

    console.log('\n=== DONE ===');

  } catch (err) {
    console.error('Error:', err.message);
    await snap(`error-${Date.now()}`);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
