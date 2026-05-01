const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  console.log('Navigating to login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'RedRixvix@proton.me');
  await page.fill('input[type="password"]', 'd[,<(q<HC6V~MJvV');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  console.log('✓ Logged in');
  
  await page.waitForTimeout(2000);
  console.log('✓ Dashboard loaded');
  
  await page.goto('http://localhost:3000/upgrade', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('✓ Upgrade page loaded');
  
  await page.goto('http://localhost:3000/settings', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  console.log('✓ Settings page loaded');
  
  if (errors.length > 0) {
    console.log('Console errors:', errors.slice(0, 5));
  } else {
    console.log('✓ No console errors');
  }
  
  await browser.close();
  console.log('✓ All pages verified!');
})().catch(e => { console.error('Test failed:', e.message); process.exit(1); });
