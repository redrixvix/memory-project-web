#!/usr/bin/env node
/**
 * Production visual/layout smoke test for Memory Project.
 *
 * Catches the failure mode where HTTP/build checks pass, but critical Tailwind
 * utility CSS is missing and auth pages render as tiny/collapsed controls.
 *
 * Usage:
 *   BASE_URL=https://web-redrixvixs-projects.vercel.app npm run smoke:visual
 *   node checks/visual-smoke-check.cjs https://preview-url.vercel.app
 */

const { chromium } = require('playwright');
const sharp = require('sharp');

const baseUrl = (process.argv[2] || process.env.BASE_URL || 'https://web-redrixvixs-projects.vercel.app').replace(/\/$/, '');
const failures = [];

function fail(message) {
  failures.push(message);
  console.error(`❌ ${message}`);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return await res.text();
}

async function checkCssUtilities() {
  const pages = ['/', '/login', '/signup', '/dashboard'];
  const cssUrls = new Set();

  for (const pagePath of pages) {
    const html = await fetchText(`${baseUrl}${pagePath}`);
    for (const match of html.matchAll(/href="([^\"]+\.css[^\"]*)"/g)) {
      const href = match[1];
      cssUrls.add(href.startsWith('http') ? href : `${baseUrl}${href}`);
    }
  }

  if (cssUrls.size === 0) {
    fail('No CSS chunks found in rendered HTML');
    return;
  }

  let combinedCss = '';
  for (const cssUrl of cssUrls) {
    const css = await fetchText(cssUrl);
    combinedCss += `\n/* ${cssUrl} */\n${css}`;
  }

  const requiredUtilities = [
    '.w-full',
    '.h-11',
    '.max-w-sm',
    '.rounded-2xl',
    '.justify-between',
    '.items-center',
  ];

  const missing = requiredUtilities.filter((utility) => !combinedCss.includes(utility));
  if (missing.length > 0) {
    fail(`CSS is missing critical Tailwind utilities: ${missing.join(', ')}`);
  } else {
    pass(`CSS utility coverage OK across ${cssUrls.size} chunk(s)`);
  }
}

async function dominantColorPercent(page, screenshotPath) {
  const png = await page.screenshot({ path: screenshotPath, fullPage: false });
  const { data, info } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  const counts = new Map();
  const total = info.width * info.height;

  for (let i = 0; i < data.length; i += channels) {
    // Bucket slightly so anti-aliasing does not hide single-color failures.
    const r = Math.round(data[i] / 8) * 8;
    const g = Math.round(data[i + 1] / 8) * 8;
    const b = Math.round(data[i + 2] / 8) * 8;
    const key = `${r},${g},${b}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Math.max(...counts.values()) / total * 100;
}

async function checkVisualAndLayout() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    const desktop = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
    const home = await desktop.newPage();
    await home.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 60000 });
    const dominant = await dominantColorPercent(home, '/tmp/memory-project-home-smoke.png');
    if (dominant > 80) {
      fail(`Homepage visual render looks broken: ${dominant.toFixed(1)}% one color`);
    } else {
      pass(`Homepage visual diversity OK: ${dominant.toFixed(1)}% dominant color`);
    }
    await desktop.close();

    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
    for (const pagePath of ['/login', '/signup']) {
      const page = await mobile.newPage();
      await page.goto(`${baseUrl}${pagePath}`, { waitUntil: 'networkidle', timeout: 60000 });

      const metrics = await page.evaluate(() => {
        const byText = (text) => {
          const el = Array.from(document.querySelectorAll('button')).find((button) =>
            button.innerText.trim().includes(text),
          );
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { text, x: r.x, y: r.y, width: r.width, height: r.height };
        };
        return {
          google: byText('Continue with Google'),
          passkey: byText('passkey'),
          submit: byText('password') || byText('Create account'),
          bodyWidth: document.body.getBoundingClientRect().width,
        };
      });

      let pageOk = true;
      for (const [name, rect] of Object.entries({ google: metrics.google, passkey: metrics.passkey, submit: metrics.submit })) {
        if (!rect) {
          fail(`${pagePath} mobile missing expected ${name} button`);
          pageOk = false;
          continue;
        }
        if (rect.width < 280 || rect.height < 24) {
          fail(`${pagePath} mobile ${name} button collapsed (${Math.round(rect.width)}x${Math.round(rect.height)})`);
          pageOk = false;
        }
      }

      if (pageOk) {
        pass(`${pagePath} mobile auth controls are full-width`);
      }

      await page.close();
    }
    await mobile.close();
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(`Memory Project visual smoke check: ${baseUrl}`);
  await checkCssUtilities();
  await checkVisualAndLayout();

  if (failures.length > 0) {
    console.error('\nRESULT: FAILED');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('\nRESULT: PASSED');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
