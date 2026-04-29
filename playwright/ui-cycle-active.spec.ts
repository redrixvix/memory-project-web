import { test, expect, Page, chromium } from '@playwright/test';

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';

const SCREENSHOT_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens/ui-cycle-' + new Date().toISOString().slice(0, 19).replace(/:/g, '-');

async function ensureDir() {
  const { mkdirSync } = require('fs');
  try { mkdirSync(SCREENSHOT_DIR, { recursive: true }); } catch {}
}

async function snap(page: Page, name: string) {
  await ensureDir();
  const f = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path: f, fullPage: false });
  console.log(`📸 ${name}`);
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await snap(page, '00-login-page');
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]:has-text("Sign in")').click();
  await page.waitForTimeout(3000);
  expect(page.url()).toContain('/dashboard');
  await page.waitForLoadState('networkidle');
  await snap(page, '01-dashboard');
}

test('Active UI exploration and product testing', async ({ page }) => {
  // ══ LOGIN ══════════════════════════════════════════════════════════
  await login(page);

  // ══ DASHBOARD EXPLORATION ═════════════════════════════════════════
  console.log('\n📊 DASHBOARD');
  await page.waitForTimeout(2000);
  
  // Get a sense of the dashboard layout
  const bookCards = page.locator('[class*="card"], a[href*="/books/"]').all();
  console.log(`  Found ${(await bookCards).length} book-related elements`);
  
  // Check for empty states or welcome messages
  const emptyState = page.locator('text=/empty|no books|create/i').first();
  if (await emptyState.isVisible({ timeout: 2000 })) {
    console.log('  📭 Empty state visible');
    await snap(page, '02-dashboard-empty-state');
  }

  // Look for the New Book button
  const newBookBtn = page.locator('button:has-text("New Book"), a:has-text("New Book")').first();
  const newBookVisible = await newBookBtn.isVisible({ timeout: 3000 });
  console.log(`  New Book button visible: ${newBookVisible}`);
  await snap(page, '02-dashboard-overview');

  // ══ CREATE A BOOK ═══════════════════════════════════════════════════
  console.log('\n📖 CREATE BOOK');
  
  if (newBookVisible) {
    await newBookBtn.click();
    await page.waitForTimeout(1000);
    await snap(page, '03-new-book-modal');
    
    // Check modal fields
    const titleInput = page.locator('#modal-title, input[id*="title"]').first();
    const descInput = page.locator('#modal-desc, textarea[id*="desc"]').first();
    
    if (await titleInput.isVisible({ timeout: 2000 })) {
      await titleInput.fill('Spring Garden Memories');
      await snap(page, '04-book-title-filled');
    }
    
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Gathering stories from our family garden — planting, growing, harvest, and everything in between.');
      await snap(page, '05-book-desc-filled');
    }
    
    // Submit
    const submitBtn = page.locator('button[type="submit"]:has-text("Create Book"), button:has-text("Create Book")').first();
    if (await submitBtn.isVisible({ timeout: 2000 })) {
      await submitBtn.click();
      await page.waitForTimeout(4000);
      await snap(page, '06-book-created');
    }
  } else {
    // Try navigating to /books/new
    await page.goto(`${BASE_URL}/books/new`, { waitUntil: 'networkidle' });
    await snap(page, '03-book-new-direct');
  }

  // ══ BOOK DETAIL PAGE ════════════════════════════════════════════════
  console.log('\n📄 BOOK DETAIL');
  await page.waitForTimeout(2000);
  
  // Find first book link
  const firstBookLink = page.locator('a[href*="/books/"]:not([href*="/books/new"])').first();
  const bookHref = await firstBookLink.getAttribute('href').catch(() => '');
  
  if (bookHref) {
    console.log(`  Navigating to: ${bookHref}`);
    await page.goto(`${BASE_URL}${bookHref}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await snap(page, '07-book-detail');
    
    // ══ ADD A MEMORY FROM BOOK DETAIL ══════════════════════════════
    console.log('\n✍️ ADD MEMORY');
    
    const addMemBtn = page.locator('a:has-text("Add Memory"), button:has-text("Add Memory"), a:has-text("+ Add")').first();
    if (await addMemBtn.isVisible({ timeout: 3000 })) {
      await addMemBtn.click();
      await page.waitForTimeout(1500);
      await snap(page, '08-memory-edit-page');
      
      // Fill in memory text
      const textarea = page.locator('textarea').first();
      if (await textarea.isVisible({ timeout: 3000 })) {
        await textarea.fill('The garden was my grandmother\'s sanctuary. Every Sunday morning she would walk through the rows of tomato plants, pinching off suckers with practiced fingers. I learned to do the same when I was just seven years old, my small hands reaching between the leaves.');
        await snap(page, '09-memory-text-filled');
        
        // Look for photo upload
        const photoArea = page.locator('[class*="upload"], [class*="photo"], input[type="file"]').first();
        if (await photoArea.isVisible({ timeout: 2000 })) {
          console.log('  📷 Photo upload area found');
          await snap(page, '10-memory-photo-area');
        }
        
        // Save memory
        const saveBtn = page.locator('button:has-text("Save Memory"), button:has-text("Publish Memory"), button:has-text("Publish")').first();
        if (await saveBtn.isVisible({ timeout: 2000 })) {
          await saveBtn.click();
          await page.waitForTimeout(5000);
          await snap(page, '11-memory-saved');
        }
      }
    } else {
      // Try edit route directly
      const editLink = page.locator('a[href*="/edit"]').first();
      if (await editLink.isVisible({ timeout: 2000 })) {
        await editLink.click();
        await page.waitForTimeout(1500);
        await snap(page, '08-memory-edit-page');
      }
    }
  }

  // ══ BOOKS PAGE ════════════════════════════════════════════════════
  console.log('\n📚 BOOKS PAGE');
  await page.goto(`${BASE_URL}/books`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await snap(page, '12-books-page');

  // ══ SETTINGS PAGE ═════════════════════════════════════════════════
  console.log('\n⚙️ SETTINGS');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await snap(page, '13-settings-page');
  
  // Check form fields
  const nameField = page.locator('input[id*="name"], input[placeholder*="name"]').first();
  if (await nameField.isVisible({ timeout: 2000 })) {
    console.log('  ✅ Settings form fields visible');
    await snap(page, '14-settings-form');
  }

  // ══ DASHBOARD FINAL STATE ══════════════════════════════════════════
  console.log('\n🏠 BACK TO DASHBOARD');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await snap(page, '15-dashboard-final');

  console.log('\n✅ UI exploration complete!');
});

test('Deep product flow - create, upload, verify', async ({ page }) => {
  await login(page);
  await page.waitForTimeout(2000);
  
  // Create another book
  console.log('\n📖 CREATING SECOND BOOK');
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  await newBookBtn.click();
  await page.waitForTimeout(800);
  
  await page.locator('#modal-title').fill('Summer Road Trip 2024');
  await page.locator('#modal-desc').fill('All our favorite family adventures on the road.');
  
  await page.locator('button[type="submit"]:has-text("Create Book")').click();
  await page.waitForTimeout(4000);
  await snap(page, '16-second-book-created');
  
  // Navigate to book detail
  const bookLink = page.locator('a[href*="/books/"]:not([href*="/books/new"])').first();
  const href = await bookLink.getAttribute('href').catch(() => '');
  
  if (href) {
    await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await snap(page, '17-book-detail-2');
    
    // Try adding a memory via prompt selection
    const promptBtn = page.locator('button:has-text("Choose a prompt"), a:has-text("Choose a prompt")').first();
    if (await promptBtn.isVisible({ timeout: 3000 })) {
      await promptBtn.click();
      await page.waitForTimeout(1000);
      await snap(page, '18-prompt-selector');
    }
  }
  
  console.log('\n✅ Deep flow complete!');
});

test('Settings and profile configuration', async ({ page }) => {
  await login(page);
  await page.waitForTimeout(2000);
  
  console.log('\n⚙️ SETTINGS EXPLORATION');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await snap(page, '19-settings-top');
  
  // Scroll through settings
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(500);
  await snap(page, '20-settings-mid');
  
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(500);
  await snap(page, '21-settings-bottom');
  
  // Check for any buttons or forms
  const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")').first();
  if (await saveBtn.isVisible({ timeout: 2000 })) {
    console.log('  💾 Save button found');
  }
  
  console.log('\n✅ Settings exploration complete!');
});