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
    const path = `/home/rixvix/.openclaw/workspace/memory-project/web/screens/flow-${Date.now()}-${step++}-${label}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`[${step}] ${label} → ${path}`);
    return path;
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
    await snap('logged-in');

    // ── BOOK CREATION ──
    console.log('\n=== CREATE BOOK ===');
    const newBookBtn = page.locator('button:has-text("New Book"), a:has-text("New Book")').first();
    await newBookBtn.click();
    await page.waitForLoadState('networkidle');
    await snap('create-modal');

    const modal = page.locator('[role="dialog"]').first();
    await modal.waitFor({ state: 'visible', timeout: 5000 });
    
    await page.locator('#modal-title').fill('My Test Memory Book');
    await snap('title-filled');
    await page.locator('#modal-desc').fill('Capturing memories from my travels');
    await snap('desc-filled');
    
    // Click Create Book
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(/books\/\d+/, { timeout: 10000 });
    console.log('Book created at:', page.url());
    await snap('book-created');

    // Extract book ID from URL
    const bookId = page.url().match(/books\/(\d+)/)?.[1];
    console.log('Book ID:', bookId);

    // ── MEMORY CREATION ──
    console.log('\n=== CREATE MEMORY ===');
    const addMemoryLink = page.locator('a:has-text("Add Memory")').first();
    await addMemoryLink.click();
    await page.waitForLoadState('networkidle');
    console.log('Memory edit URL:', page.url());
    await snap('memory-edit-page');

    // Select a prompt
    const promptSelect = page.locator('select').first();
    const promptOptions = await promptSelect.locator('option').all();
    console.log(`Found ${promptOptions.length} prompt options`);
    
    // Select 3rd option (first is "No prompt")
    if (promptOptions.length > 2) {
      await promptOptions[2].click();
      await snap('prompt-selected');
    }

    // Fill textarea
    const textarea = page.locator('textarea').first();
    await textarea.fill('Some of my fondest memories involve lazy summer afternoons by the water. There is something profoundly peaceful about watching the sun cast golden light across the surface of a lake at dusk.');
    await snap('memory-filled');

    const text = await textarea.inputValue();
    console.log(`Word count: ${text.split(/\s+/).filter(Boolean).length}`);

    // Check for image upload area
    const dropzone = page.locator('[data-testid="dropzone"], input[type="file"], [class*="drop"], [class*="upload"]').first();
    const uploadArea = await dropzone.count() > 0;
    console.log(`Upload area found: ${uploadArea}`);
    if (uploadArea) {
      const dropzoneVisible = await dropzone.isVisible().catch(() => false);
      console.log(`Dropzone visible: ${dropzoneVisible}`);
    }

    // Save Memory
    const saveBtn = page.locator('button[type="submit"]').first();
    const saveTxt = await saveBtn.textContent().catch(() => '');
    console.log(`Save button: "${saveTxt.trim()}"`);
    await snap('before-save');
    await saveBtn.click();
    
    // Wait for save to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('After save URL:', page.url());
    await snap('memory-saved');

    // ── VERIFY MEMORY IN BOOK ──
    console.log('\n=== VERIFY MEMORY ===');
    await page.waitForLoadState('networkidle');
    
    // Check if we are back on book detail
    if (page.url().includes('/edit')) {
      // Go back to book detail
      await page.goto(`${BASE_URL}/books/${bookId}`);
    } else if (page.url().includes(`/books/${bookId}`)) {
      // already on book detail
    } else {
      await page.goto(`${BASE_URL}/books/${bookId}`);
    }
    await page.waitForLoadState('networkidle');
    await snap('book-with-memory');
    
    // Check for the memory text
    const memoryText = await page.locator('text=/fondest|summer afternoon|lazy summer/i').count();
    console.log(`Memory text found: ${memoryText > 0 ? 'YES' : 'NO'}`);

    // ── EDIT MEMORY ──
    console.log('\n=== EDIT MEMORY ===');
    const editBtn = page.locator('a:has-text("Edit")').first();
    if (await editBtn.count() > 0 && await editBtn.isVisible().catch(() => false)) {
      console.log('Found Edit button, clicking...');
      await editBtn.click();
      await page.waitForLoadState('networkidle');
      await snap('editing-memory');
      console.log('URL:', page.url());
      
      // Check form is pre-filled
      const ta = page.locator('textarea').first();
      const val = await ta.inputValue().catch(() => '');
      console.log(`Pre-filled text (${val.split(/\s+/).filter(Boolean).length} words): "${val.substring(0, 60)}..."`);
      
      // Add more text
      await ta.fill(val + ' Every moment spent there reminded me how precious time with family truly is.');
      await snap('memory-edited');
      
      // Save
      await page.locator('button[type="submit"]').first().click();
      await page.waitForTimeout(2000);
      await snap('edited-memory-saved');
    }

    // ── PREVIEW BOOK ──
    console.log('\n=== PREVIEW BOOK ===');
    const previewLink = page.locator('a:has-text("Preview")').first();
    if (await previewLink.count() > 0 && await previewLink.isVisible().catch(() => false)) {
      await previewLink.click();
      await page.waitForLoadState('networkidle');
      await snap('book-preview');
      console.log('Preview URL:', page.url());
    }

    // ── FINAL DASHBOARD ──
    console.log('\n=== FINAL CHECK ===');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await snap('dashboard-final');
    
    // Check if our new book appears
    const newBookCard = await page.locator('text=/My Test Memory Book/i').count();
    console.log(`New book card found: ${newBookCard > 0 ? 'YES' : 'NO'}`);

    console.log('\n=== ALL FLOWS COMPLETE ===');

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err.stack);
    await snap(`error-${Date.now()}`);
  } finally {
    await browser.close();
  }
}

run().catch(console.error);
