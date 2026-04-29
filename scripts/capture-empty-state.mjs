import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const EMAIL = process.env.E2E_EMAIL || 'RedRixvix@proton.me';
const PASSWORD = process.env.E2E_PASSWORD || 'd[,<(q<HC6V~MJvV';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  async function screenshot(name) {
    const path = `screens/empty-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    console.log(`📸 ${path}`);
  }

  // Login
  await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' });
  await page.locator('#email').fill(EMAIL);
  await page.locator('#password').fill(PASSWORD);
  await page.locator('button:has-text("Sign in with password")').click();
  await page.waitForTimeout(5000);
  console.log('Logged in, URL:', page.url());

  // Go to dashboard
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Create a new empty book
  const newBookBtn = page.locator('button:has-text("New Book")').first();
  if (await newBookBtn.count() > 0) {
    await newBookBtn.click();
    await page.waitForTimeout(800);
    const titleInput = page.locator('#modal-title');
    if (await titleInput.count() > 0) {
      await titleInput.fill('Brand New Empty Book');
      await page.waitForTimeout(300);
      const submitBtn = page.locator('button:has-text("Create Book"), button[type="submit"]').first();
      if (await submitBtn.count() > 0) {
        await submitBtn.click();
        await page.waitForTimeout(3000);
        console.log('Created book, URL:', page.url());
        
        // Should now be on the new book's detail page (empty state)
        await screenshot('empty-state-new-book');
        
        // Check for prompt chips
        const promptChip = page.locator('text="A trip that changed me"');
        const promptChipVisible = await promptChip.count() > 0;
        console.log('Prompt chips visible on empty book:', promptChipVisible);
        
        // Also check the "Start your memory book" text
        const emptyStateHeading = page.locator('text="Start your memory book"');
        const emptyStateVisible = await emptyStateHeading.count() > 0;
        console.log('Empty state heading visible:', emptyStateVisible);
        
        // Now add a memory
        const addMemoryLink = page.locator('a:has-text("Add your first memory")');
        if (await addMemoryLink.count() > 0) {
          await addMemoryLink.click();
          await page.waitForTimeout(2000);
          await screenshot('new-memory-form');
          
          // Fill and save
          const textareas = page.locator('textarea');
          if (await textareas.count() > 0) {
            await textareas.first().fill('This is a test memory for our brand new book. The prompt chips encouraged me to start writing!');
            await screenshot('memory-filled');
            
            const saveBtn = page.locator('button:has-text("Save Memory")').first();
            if (await saveBtn.count() > 0) {
              await saveBtn.click();
              await page.waitForTimeout(3000);
              await screenshot('book-with-new-memory');
              console.log('Book with memory, URL:', page.url());
            }
          }
        }
      }
    }
  } else {
    console.log('New Book button not found');
  }

  await browser.close();
  console.log('\n✅ Done. Check screenshots: screens/empty-*.png');
}

run().catch(console.error);