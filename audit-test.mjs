import { chromium } from 'playwright';

const BASE = 'http://localhost:3789';
const EMAIL = 'alex@memoryproject.com';
const PASSWORD = 'MemoryProject2026!';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  const browser = await chromium.launch({ 
    executablePath: '/home/rixvix/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];
  
  async function test(name, fn) {
    try {
      await fn();
      results.push({ name, ok: true });
      console.log(`✅ ${name}`);
    } catch (e) {
      results.push({ name, ok: false, error: e.message });
      console.log(`❌ ${name}: ${e.message}`);
    }
  }

  // ── Login helper ──────────────────────────────────────────
  async function login(context) {
    const page = await context.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    await page.close();
  }

  // ── Desktop viewport ─────────────────────────────────────
  console.log('\n=== DESKTOP (1440x900) ===');
  const desktopCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  await test('Landing page loads', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    if (errors.length) throw new Error(`Console errors: ${errors.join('; ')}`);
    await page.close();
  });

  await test('Login page loads', async () => {
    const page = await desktopCtx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await test('Signup page loads', async () => {
    const page = await desktopCtx.newPage();
    await page.goto(`${BASE}/signup`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await login(desktopCtx);

  await test('Dashboard loads', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    if (errors.length) throw new Error(`Console errors: ${errors.join('; ')}`);
    await page.close();
  });

  await test('Book detail page (book 1) loads', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/books/1`, { waitUntil: 'networkidle' });
    if (errors.length) throw new Error(`Console errors: ${errors.join('; ')}`);
    await page.close();
  });

  await test('Add memory page loads', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/books/1/edit`, { waitUntil: 'networkidle' });
    if (errors.length) throw new Error(`Console errors: ${errors.join('; ')}`);
    await page.close();
  });

  await test('Edit memory page (memory=2) pre-fills form', async () => {
    const page = await desktopCtx.newPage();
    await page.goto(`${BASE}/books/1/edit?memory=2`, { waitUntil: 'networkidle' });
    await sleep(3000); // wait for fetchMemory to complete
    const textarea = page.locator('textarea').first();
    const val = await textarea.inputValue();
    if (!val || val.length < 2) throw new Error(`Form not pre-filled. Got: "${val}"`);
    console.log(`   Pre-filled text length: ${val.length}`);
    await page.close();
  });

  await test('Edit memory page (memory=999) handles gracefully', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/books/1/edit?memory=999`, { waitUntil: 'networkidle' });
    await sleep(3000); // allow redirect to happen
    // After redirect, URL should be clean (no memory= param)
    const url = page.url();
    const hasMemoryParam = url.includes('memory=');
    if (hasMemoryParam) throw new Error(`Should redirect away from memory=999. URL: ${url}`);
    // Should show "Add a Memory" not crash
    const h1 = await page.locator('h1').first().textContent().catch(() => '');
    if (!h1) throw new Error('No h1 found');
    // Filter out expected 404 browser-level resource errors
    const unexpectedErrors = errors.filter(e => 
      !e.includes('404') && !e.includes('Failed to load resource')
    );
    if (unexpectedErrors.length) throw new Error(`Unexpected errors: ${unexpectedErrors.join('; ')}`);
    console.log(`   Page title: ${h1} (redirected from non-existent memory)`);
    await page.close();
  });

  await test('Preview page loads', async () => {
    const page = await desktopCtx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${BASE}/books/1/preview`, { waitUntil: 'networkidle' });
    if (errors.length) throw new Error(`Console errors: ${errors.join('; ')}`);
    await page.close();
  });

  await desktopCtx.close();

  // ── Mobile viewport ─────────────────────────────────────
  console.log('\n=== MOBILE (390x844) ===');
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } });

  await test('Mobile: Landing page', async () => {
    const page = await mobileCtx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await test('Mobile: Login page', async () => {
    const page = await mobileCtx.newPage();
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await login(mobileCtx);

  await test('Mobile: Dashboard loads', async () => {
    const page = await mobileCtx.newPage();
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await test('Mobile: Book detail page', async () => {
    const page = await mobileCtx.newPage();
    await page.goto(`${BASE}/books/1`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await test('Mobile: Add memory page', async () => {
    const page = await mobileCtx.newPage();
    await page.goto(`${BASE}/books/1/edit`, { waitUntil: 'networkidle' });
    await page.close();
  });

  await mobileCtx.close();

  // ── API checks ───────────────────────────────────────────
  console.log('\n=== API CHECKS ===');

  await test('API: GET /api/books/1 returns book + memories', async () => {
    const browser2 = await chromium.launch({ 
      executablePath: '/home/rixvix/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
      headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const ctx = await browser2.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    // now cookies are set
    const cookies = await ctx.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    if (!sessionCookie) throw new Error('No session cookie after login');

    const apiResp = await page.evaluate(async (url) => {
      const r = await fetch(url, { credentials: 'include' });
      return { status: r.status, body: await r.json() };
    }, `${BASE}/api/books/1`);

    if (apiResp.status !== 200) throw new Error(`Status ${apiResp.status}`);
    if (!apiResp.body.book) throw new Error('No book in response');
    await browser2.close();
  });

  await test('API: GET /api/memories/2 returns memory', async () => {
    const browser3 = await chromium.launch({ 
      executablePath: '/home/rixvix/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',
      headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const ctx = await browser3.newContext();
    const page = await ctx.newPage();
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {});
    
    const result = await page.evaluate(async (url) => {
      const r = await fetch(url, { credentials: 'include' });
      return { status: r.status, body: await r.json() };
    }, `${BASE}/api/memories/2`);

    if (result.status !== 200) throw new Error(`Status ${result.status}, body: ${JSON.stringify(result.body)}`);
    if (!result.body.memory) throw new Error('No memory in response');
    console.log(`   Memory prompt: "${result.body.memory.prompt_question}"`);
    await browser3.close();
  });

  await browser.close();

  // ── Summary ─────────────────────────────────────────────
  console.log('\n=== SUMMARY ===');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`Passed: ${passed}/${results.length}`);
  if (failed > 0) {
    console.log('Failed tests:');
    results.filter(r => !r.ok).forEach(r => console.log(`  - ${r.name}: ${r.error}`));
  }
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });