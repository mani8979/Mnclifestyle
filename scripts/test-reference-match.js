import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Test 1: Desktop Exact Reference Viewport (1672 x 941)
  console.log('Capturing Desktop 1672x941 (Exact Reference Match)...');
  await page.setViewport({ width: 1672, height: 941, deviceScaleFactor: 1 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-1672x941.png') });

  // Test 2: Standard Desktop 1440x900
  console.log('Capturing Standard Desktop 1440x900...');
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(screenshotsDir, 'desktop-1440x900.png') });

  // Test 3: Tablet 768x1024
  console.log('Capturing Tablet 768x1024...');
  await page.setViewport({ width: 768, height: 1024, deviceScaleFactor: 1 });
  await page.screenshot({ path: path.join(screenshotsDir, 'tablet-768x1024.png') });

  // Test 4: Mobile 375x812
  console.log('Capturing Mobile 375x812...');
  await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.screenshot({ path: path.join(screenshotsDir, 'mobile-375x812.png') });

  // Check horizontal overflow
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile horizontal overflow:', hasHorizontalScroll ? 'FAIL - Overflow detected' : 'PASS - No overflow');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

run().catch(console.error);

