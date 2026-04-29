const { chromium } = require('@playwright/test');

const BASE = 'http://localhost:3133';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const SCREENSHOT_DIR = 'screens/explore-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

const fs = require('fs');
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function screenshot(page, name) {
  const path = `${SCREENSHOT_DIR}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('📸 Saved:', path);
  return path;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGE ERROR: ' + e.message));

  // Login
  console.log('\n=== LOGIN ===');
  await page.goto(BASE + '/login');
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 20000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Go to a book that has memories
  console.log('\n=== EXPLORE BOOKS WITH MEMORIES ===');
  await page.goto(BASE + '/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  // Find a book with memories
  const memoryLinks = await page.locator('a:has-text("memories"), a:has-text("memory")').all();
  console.log(`Found ${memoryLinks.length} memory count links`);
  
  for (let i = 0; i < Math.min(memoryLinks.length, 3); i++) {
    const href = await memoryLinks[i].getAttribute('href');
    const text = await memoryLinks[i].textContent();
    console.log(`Link ${i}: ${text} -> ${href}`);
  }
  
  // Go to first book with memories
  if (memoryLinks.length > 0) {
    const href = await memoryLinks[0].getAttribute('href');
    if (href) {
      await page.goto(BASE + href);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      await screenshot(page, '01-book-with-memories');
      
      // Count memory cards
      const memoryCards = await page.locator('[class*="memory"], .memory-card').all();
      console.log(`Memory cards found: ${memoryCards.length}`);
      
      // Click first memory
      const firstMemory = page.locator('[class*="memory"], a[href*="/edit"]').first();
      if (await firstMemory.isVisible()) {
        await firstMemory.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        await screenshot(page, '02-memory-detail');
        console.log('Current URL:', page.url());
      }
    }
  }

  // Check image gallery and lightbox
  console.log('\n=== IMAGE GALLERY & LIGHTBOX ===');
  const imageContainers = await page.locator('[class*="gallery"], [class*="photo"], img').all();
  console.log(`Image elements found: ${imageContainers.length}`);
  
  // Check for lightbox trigger
  const lightboxTrigger = page.locator('[class*="lightbox"], button:has-text("View")').first();
  if (await lightboxTrigger.isVisible()) {
    await lightboxTrigger.click();
    await page.waitForTimeout(500);
    await screenshot(page, '03-lightbox');
  }

  // Check settings page
  console.log('\n=== SETTINGS POLISH CHECK ===');
  await page.goto(BASE + '/settings');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  await screenshot(page, '04-settings');
  
  // Check profile image upload area
  const avatarArea = page.locator('[class*="avatar"], button:has-text("Upload"), input[type="file"]').first();
  if (await avatarArea.isVisible()) {
    console.log('✓ Profile image upload area found');
  }

  // Check navigation
  console.log('\n=== NAVIGATION CHECK ===');
  const navLinks = await page.locator('nav a, header a').all();
  console.log(`Navigation links: ${navLinks.length}`);

  console.log('\n=== CONSOLE ERRORS ===');
  if (errors.length > 0) {
    errors.forEach(e => console.log('ERROR:', e));
  } else {
    console.log('No console errors!');
  }

  await browser.close();
  console.log('\n✓ Exploration complete!');
  return { errors, screenshotDir: SCREENSHOT_DIR };
}

run()
  .then(r => {
    console.log('\nSummary:');
    console.log('- Screenshots:', r.screenshotDir);
    console.log('- Errors:', r.errors.length);
    process.exit(0);
  })
  .catch(e => {
    console.error('FATAL:', e);
    process.exit(1);
  });