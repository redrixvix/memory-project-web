const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';
const BASE_URL = 'http://localhost:3000';
const SCREEN_DIR = '/home/rixvix/.openclaw/workspace/memory-project/web/screens-ui-cycle12-validate';

if (!fs.existsSync(SCREEN_DIR)) fs.mkdirSync(SCREEN_DIR, { recursive: true });

async function screenshot(page, name) {
  const p = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`  📸 ${name}.png`);
}

async function waitNet(page, ms = 1500) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(ms);
}

async function run() {
  console.log('\n🔍 MemoryProject UX Validation - Detailed Issue Investigation\n');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  // LOGIN
  console.log('🔐 LOGIN');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button[type="submit"]').filter({ hasText: /sign in/i }).click();
  await page.waitForTimeout(5000);
  await screenshot(page, 'A-login-ok');
  console.log('   Logged in →', page.url());

  // ─────────────────────────────────────────
  // ISSUE 1: MOBILE NAV — the hamburger button issue
  // The edit page shows hamburger but what about dashboard?
  // Let's check the dashboard mobile view
  // ─────────────────────────────────────────
  console.log('\n📱 MOBILE NAV CHECK');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, 'B-mobile-dashboard');

  // Look for any button with hamburger/menu icon  
  const allButtons = await page.locator('button').all();
  console.log('   Total buttons on mobile dashboard:', allButtons.length);
  
  for (const btn of allButtons) {
    const label = await btn.getAttribute('aria-label').catch(() => null);
    const title = await btn.getAttribute('title').catch(() => null);
    const text = await btn.textContent().catch(() => null);
    if (label || title || text) {
      console.log(`   Button: aria-label="${label}", title="${title}", text="${text?.trim()}"`);
    }
  }

  // Look for any element with "menu", "hamburger", "nav" related attributes
  const menuButtons = await page.locator('[aria-label*="menu"], [aria-label*="nav"], [aria-label*="navigation"], button:has(svg)').count();
  console.log('   Menu-like buttons found:', menuButtons);

  // Try to find the mobile nav trigger — check for the user dropdown or anything
  const userDropdownTrigger = await page.locator('[class*="user"], [class*="avatar"]').count();
  console.log('   User-related elements:', userDropdownTrigger);

  // Now check on the edit page which the earlier cycle said has mobile hamburger
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  
  // Check if there are multiple viewport-specific elements
  const mobileOnlyElements = await page.locator('.md\\:hidden, [class*="md:hidden"]').count();
  console.log('   md:hidden elements:', mobileOnlyElements);

  await page.setViewportSize({ width: 1280, height: 900 });

  // ─────────────────────────────────────────
  // ISSUE 2: BOOK DETAIL PAGE — memories not showing
  // ─────────────────────────────────────────
  console.log('\n📖 BOOK DETAIL PAGE - MEMORY VISIBILITY');
  
  // Get list of books from dashboard
  const bookLinks = [];
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  
  const allBookLinks = await page.locator('a[href*="/books/"]').all();
  for (const link of allBookLinks) {
    const href = await link.getAttribute('href').catch(() => null);
    if (href && !href.includes('/edit') && !href.includes('/new') && !href.includes('/preview')) {
      bookLinks.push(href);
    }
  }
  const uniqueBooks = [...new Set(bookLinks)];
  console.log('   Books on dashboard:', uniqueBooks.length);

  if (uniqueBooks.length > 0) {
    // Navigate to first book
    const bookId = uniqueBooks[0].split('/books/')[1];
    console.log('   Checking book ID:', bookId);
    
    await page.goto(`${BASE_URL}/books/${bookId}`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    await screenshot(page, 'C-book-detail');
    
    const url = page.url();
    console.log('   URL:', url);
    
    // Count different types of elements that might contain memories
    const allText = await page.locator('body').textContent();
    console.log('   Page has content:', (allText?.length || 0) > 50 ? '✅' : '❌');
    
    // Check for specific memory content (from our earlier test memory)
    const hasApplePie = allText?.includes('apple') || allText?.includes('pie') || allText?.includes('grandmother');
    console.log('   Has apple/pie/grandmother content:', hasApplePie ? '✅' : '❌');
    
    // Count card/list items
    const cards = await page.locator('[class*="card"], [class*="memory"]').count();
    console.log('   Cards/memory elements:', cards);
    
    // Check for any list items
    const listItems = await page.locator('li').count();
    console.log('   List items (li):', listItems);
    
    // Check for the "add memory" button
    const addMemoryLinks = await page.locator('a[href*="/edit"]').all();
    console.log('   Edit links visible:', addMemoryLinks.length);
    for (const l of addMemoryLinks) {
      const href = await l.getAttribute('href').catch(() => null);
      const text = await l.textContent().catch(() => null);
      console.log(`   Link: "${text?.trim()}" → ${href}`);
    }
  }

  // ─────────────────────────────────────────
  // ISSUE 3: WORD COUNT DISPLAY 
  // Check if it's inside an overflow:hidden container
  // ─────────────────────────────────────────
  console.log('\n🔢 WORD COUNT DISPLAY CHECK');
  
  if (uniqueBooks.length > 0) {
    const bookId = uniqueBooks[0].split('/books/')[1];
    
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    
    // Type some text
    const textarea = page.locator('textarea').first();
    if (await textarea.count() > 0) {
      await textarea.fill('This is a test memory entry with enough words to show the count.');
      await page.waitForTimeout(1500);
      await screenshot(page, 'D-word-count-test');
      
      // Search for any number display
      const numbers = await page.locator('text=/\\d+/').all();
      for (const n of numbers) {
        const text = await n.textContent().catch(() => '');
        const visible = await n.isVisible().catch(() => false);
        if (visible && text.trim()) {
          console.log(`   Number text: "${text.trim()}" - visible: ${visible}`);
        }
      }
      
      // Check for the word count badge specifically
      const wordCountBadge = await page.locator('[class*="word"]').count();
      console.log('   Elements with "word" in class:', wordCountBadge);
      
      // Check for inline styles or specific word count display
      const allSpans = await page.locator('span').all();
      for (const span of allSpans.slice(0, 20)) {
        const text = await span.textContent().catch(() => null);
        const visible = await span.isVisible().catch(() => false);
        if (visible && text?.match(/\d/) && text.trim().length < 20) {
          console.log(`   Span: "${text.trim()}"`);
        }
      }
    }
  }

  // ─────────────────────────────────────────
  // ISSUE 4: AUDIO UPLOAD UI
  // ─────────────────────────────────────────
  console.log('\n🎤 AUDIO UPLOAD CHECK');
  
  if (uniqueBooks.length > 0) {
    const bookId = uniqueBooks[0].split('/books/')[1];
    
    await page.goto(`${BASE_URL}/books/${bookId}/edit`, { waitUntil: 'networkidle' });
    await waitNet(page, 2000);
    
    // Look for audio/voice elements
    const audioLabel = await page.locator('text=/audio|voice/i').first();
    const hasAudio = await audioLabel.count() > 0;
    console.log('   Audio/Voice label found:', hasAudio ? '✅' : '❌');
    
    // Check for the audio upload button
    const audioButtons = await page.locator('button:has-text("audio"), button:has-text("audio"), button:has-text("Record")').count();
    console.log('   Audio/Record buttons:', audioButtons);
    
    // Check for file input with audio accept
    const audioInputs = await page.locator('input[type="file"][accept*="audio"]').count();
    console.log('   Audio file inputs:', audioInputs);
    
    await screenshot(page, 'E-audio-section');
  }

  // ─────────────────────────────────────────
  // ISSUE 5: BOOK CARD HOVER STATES
  // ─────────────────────────────────────────
  console.log('\n🎨 BOOK CARD HOVER STATES');
  
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
  await waitNet(page, 1000);
  await screenshot(page, 'F-dashboard-before-hover');
  
  // Hover over first book card
  const firstCard = page.locator('.book-card, [class*="book-card"]').first();
  if (await firstCard.count() > 0) {
    await firstCard.hover();
    await page.waitForTimeout(500);
    await screenshot(page, 'G-dashboard-hover-card');
    console.log('   Hovered over first book card ✅');
    
    // Check if the CTA button appears or changes
    const ctaButton = await firstCard.locator('[class*="cta"], button').count();
    console.log('   Buttons inside card:', ctaButton);
  }

  // ─────────────────────────────────────────
  // ISSUE 6: SETTINGS PAGE QUALITY
  // ─────────────────────────────────────────
  console.log('\n⚙️ SETTINGS PAGE AUDIT');
  
  await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'H-settings-page');
  
  // Check what sections are present
  const h2s = await page.locator('h2').allTextContents();
  console.log('   Section headings:', h2s);
  
  // Check for form inputs
  const inputs = await page.locator('input').count();
  const buttons = await page.locator('button').count();
  console.log('   Inputs:', inputs, '| Buttons:', buttons);
  
  // Check for any obvious empty states
  const emptySections = await page.locator('[class*="empty"], [class*="placeholder"]').count();
  console.log('   Empty/placeholder sections:', emptySections);

  // ─────────────────────────────────────────
  // ISSUE 7: UPGRADE PAGE PLAN CARDS
  // ─────────────────────────────────────────
  console.log('\n💳 UPGRADE PAGE AUDIT');
  
  await page.goto(`${BASE_URL}/upgrade`, { waitUntil: 'networkidle' });
  await waitNet(page, 1500);
  await screenshot(page, 'I-upgrade-page');
  
  // Check for pricing/plan elements
  const prices = await page.locator('text=/\\$\\d+/').count();
  console.log('   Price displays:', prices);
  
  const planHeadings = await page.locator('h2, h3').allTextContents();
  console.log('   Plan headings:', planHeadings);

  // ─────────────────────────────────────────
  // FINAL SUMMARY
  // ─────────────────────────────────────────
  console.log('\n📊 ISSUE SUMMARY:');
  console.log('');
  console.log('CRITICAL (blocks usage):');
  console.log('  1. [?] Book detail - memories not visible (need deeper investigation)');
  console.log('  2. [?] Word count display - not found in test (may be styling issue)');
  console.log('');
  console.log('HIGH PRIORITY (major UX gaps):');
  console.log('  3. [?] Mobile nav missing on dashboard');
  console.log('  4. [ ] Audio upload flow not tested end-to-end');
  console.log('');
  console.log('MEDIUM PRIORITY (Polish):');
  console.log('  5. [ ] Book card hover states - need visual check');
  console.log('  6. [ ] Settings page completeness');
  console.log('  7. [ ] Upgrade page plan card layout');
  console.log('');

  await browser.close();
  console.log('\n✅ Validation complete\n');
}

run().catch(console.error);