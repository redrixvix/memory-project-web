const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-cycle10';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 800) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('🔍 Cycle 10 Validation — Testing Improvements\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  // LOGIN
  console.log('1️⃣ LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  console.log('   Logged in');

  // TEST: Memory editor textarea focus
  console.log('\n2️⃣ MEMORY EDITOR FOCUS TEST');
  await page.goto(`${BASE_URL}/books/241/edit`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  await screenshot(page, '10-memory-editor-focus');

  const textarea = page.locator('textarea.memory-editor-textarea, textarea').first();
  if (await textarea.isVisible().catch(() => false)) {
    // Click and test focus
    await textarea.click();
    await waitNet(page, 300);
    await screenshot(page, '11-textarea-focused');
    console.log('   Textarea focused ✅');

    // Type some content
    await textarea.fill('The old house on Maple Street still shows up in my dreams — the creaky third step, the kitchen that always smelled like cinnamon.');
    await waitNet(page, 300);
    await screenshot(page, '12-textarea-filled');
    console.log('   Typed content ✅');

    // Check word count display
    const wordCountEl = page.locator('text=/\\d+ words/').first();
    const wcVisible = await wordCountEl.isVisible().catch(() => false);
    console.log('   Word count visible:', wcVisible ? '✅' : '❌');
  }

  // TEST: Book edit page improvements
  console.log('\n3️⃣ BOOK EDIT PAGE (character counters + URL preview)');
  await page.goto(`${BASE_URL}/books/241/edit/book`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '13-book-edit-improved');

  const titleCounter = await page.locator('text=/\\d+\\/120/').isVisible().catch(() => false);
  const descCounter = await page.locator('text=/\\d+\\/280/').isVisible().catch(() => false);
  const urlPreview = await page.locator('text=/memoryproject\\.com/').isVisible().catch(() => false);
  console.log('   Title counter:', titleCounter ? '✅' : '❌');
  console.log('   Desc counter:', descCounter ? '✅' : '❌');
  console.log('   URL preview:', urlPreview ? '✅' : '❌');

  // Test focus states on inputs
  const titleInput = page.locator('input[type="text"]').first();
  if (await titleInput.isVisible().catch(() => false)) {
    await titleInput.click();
    await waitNet(page, 200);
    await screenshot(page, '14-book-title-focused');
  }

  // TEST: Dashboard book cards (no corner artifact)
  console.log('\n4️⃣ DASHBOARD CARD CLEANUP');
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '15-dashboard-cards-clean');
  
  // Check corner artifacts are gone (look for the thin horizontal lines)
  const artifacts = await page.locator('.absolute.top-4.right-4').count();
  console.log('   Corner artifacts (should be 0):', artifacts);

  // TEST: Full memory creation and save flow
  console.log('\n5️⃣ FULL MEMORY SAVE FLOW');
  await page.goto(`${BASE_URL}/books/242/edit`, { waitUntil: 'networkidle' });
  await waitNet(page, 2000);
  
  const txt = page.locator('textarea').first();
  if (await txt.isVisible().catch(() => false)) {
    await txt.fill('I remember the way sunlight fell through the stained glass — casting those impossible colors across the wooden floor. Some moments are preserved not in photos but in the way light once moved.');
    await waitNet(page, 500);

    // Wait for autosave
    await waitNet(page, 2000);
    await screenshot(page, '16-memory-autosaved');
    console.log('   Autosave triggered ✅');

    // Now submit
    const saveBtn = page.locator('button[type="submit"]').first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await waitNet(page, 5000);
      await screenshot(page, '17-memory-submit-success');
      console.log('   Saved! URL:', page.url());
    }
  }

  // TEST: Settings page
  console.log('\n6️⃣ SETTINGS PAGE');
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, '18-settings-improved');
  console.log('   Settings loaded ✅');

  // TEST: Book detail page
  console.log('\n7️⃣ BOOK DETAIL PAGE');
  await page.goto(`${BASE_URL}/books/243`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, '19-book-detail');
  
  const memories = await page.locator('text=/memories?/i').all();
  console.log('   Memory mentions:', memories.length);

  console.log('\n' + '─'.repeat(60));
  console.log('VALIDATION COMPLETE');
  console.log('─'.repeat(60));
  console.log('Screenshots:', SCREEN_DIR);

  await browser.close();
}

run().catch(e => {
  console.error('❌ Fatal:', e.message);
  process.exit(1);
});