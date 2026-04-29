import { chromium } from '@playwright/test';

const BASE = 'http://localhost:3000';
const EMAIL = 'RedRixvix@proton.me';
const PASSWORD = 'd[,<(q<HC6V~MJvV';

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
await page.setViewportSize({ width: 1440, height: 900 });

// Login
console.log('🔐 Logging in...');
await page.goto(BASE + '/login');
await page.fill('input[type="email"]', EMAIL);
await page.fill('input[type="password"]', PASSWORD);
await page.click('button[type="submit"]');
await page.waitForURL('**/dashboard', { timeout: 20000 });
console.log('✅ Logged in');

// Screenshot dashboard
await page.goto(BASE + '/dashboard');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/dashboard.png', fullPage: true });
console.log('📸 Dashboard');

// Explore /books/new to create a new book
console.log('📚 Creating new book...');
await page.goto(BASE + '/books/new');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/new-book-page.png', fullPage: true });
console.log('📸 New book page');

// Get content of new book form
const body = await page.locator('body').textContent();
console.log('New book page body snippet:', body?.slice(0, 500));

// Check for title/description inputs
const inputs = await page.locator('input').count();
const textareas = await page.locator('textarea').count();
console.log('Inputs:', inputs, 'Textareas:', textareas);

// Check /app route
console.log('🔍 Exploring /app...');
await page.goto(BASE + '/app');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/app-page.png', fullPage: true });
const appBody = await page.locator('body').textContent();
console.log('App body snippet:', appBody?.slice(0, 300));

// Check /app/tasks
console.log('🔍 Exploring /app/tasks...');
await page.goto(BASE + '/app/tasks');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/app-tasks.png', fullPage: true });

// Check /app/library
console.log('🔍 Exploring /app/library...');
await page.goto(BASE + '/app/library');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/app-library.png', fullPage: true });

// Check /app/documents
console.log('🔍 Exploring /app/documents...');
await page.goto(BASE + '/app/documents');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(2000);
await page.screenshot({ path: 'playwright/screens-ui-cycle/app-documents.png', fullPage: true });

await browser.close();
console.log('Done exploring');