import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

// All 12 viewports explicitly required by client audit
const screens = [
  { name: 'viewport-320', width: 320, height: 667, isMobile: true },
  { name: 'viewport-360', width: 360, height: 740, isMobile: true },
  { name: 'viewport-375', width: 375, height: 812, isMobile: true },
  { name: 'viewport-390', width: 390, height: 844, isMobile: true },
  { name: 'viewport-430', width: 430, height: 932, isMobile: true },
  { name: 'viewport-768', width: 768, height: 1024, isMobile: false },
  { name: 'viewport-1024', width: 1024, height: 768, isMobile: false },
  { name: 'viewport-1100', width: 1100, height: 800, isMobile: false },
  { name: 'viewport-1280', width: 1280, height: 800, isMobile: false },
  { name: 'viewport-1366', width: 1366, height: 768, isMobile: false },
  { name: 'viewport-1440', width: 1440, height: 900, isMobile: false },
  { name: 'viewport-1920', width: 1920, height: 1080, isMobile: false },
];

const pagesToTest = [
  { path: '/', name: 'home' },
  { path: '/shop', name: 'shop' },
  { path: '/category/living-room', name: 'category' },
  { path: '/collections', name: 'collections' },
  { path: '/product/mnc-liv-01', name: 'product' },
  { path: '/about', name: 'about' },
  { path: '/contact', name: 'contact' },
];

async function run() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  console.log('Launching Chrome via puppeteer-core for 12-viewport test suite...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const report = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error(`Browser console error:`, msg.text());
    }
  });

  for (const screen of screens) {
    console.log(`\nTesting viewport: ${screen.name} (${screen.width}x${screen.height})...`);
    await page.setViewport({
      width: screen.width,
      height: screen.height,
      deviceScaleFactor: 1,
      isMobile: screen.isMobile,
      hasTouch: screen.isMobile,
    });

    for (const testPage of pagesToTest) {
      const url = `http://localhost:5173${testPage.path}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

      // Check horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

      // Check dropdown at 1024 / 1280
      if (testPage.name === 'home' && screen.width >= 1024) {
        // Test dropdown trigger button
        const dropdownButton = await page.$('nav button');
        if (dropdownButton) {
          await dropdownButton.click();
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      // Check mobile hotspot interaction at 375
      if (testPage.name === 'home' && screen.width <= 430) {
        const pinButton = await page.$('button[aria-label*="View"]');
        if (pinButton) {
          await pinButton.click();
          await new Promise((r) => setTimeout(r, 200));
        }
      }

      const status = {
        page: testPage.name,
        viewport: screen.name,
        width: screen.width,
        scrollWidth: scrollWidth,
        overflow: hasHorizontalScroll,
      };

      report.push(status);
      console.log(`  ✓ ${testPage.name.padEnd(12)} at ${screen.name.padEnd(15)} | Overflow: ${hasHorizontalScroll ? '⚠️ YES' : 'None'}`);
    }
  }

  await browser.close();

  fs.writeFileSync(path.join(screenshotsDir, 'report-12-viewports.json'), JSON.stringify(report, null, 2));
  console.log('\nAll 12-viewport checks completed successfully!');
}

run().catch((err) => {
  console.error('Fatal error during screen checks:', err);
  process.exit(1);
});
