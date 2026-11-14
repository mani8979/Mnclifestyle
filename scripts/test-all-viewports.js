import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

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
  { name: 'viewport-1672', width: 1672, height: 941, isMobile: false },
  { name: 'viewport-1920', width: 1920, height: 1080, isMobile: false },
];

async function run() {
  const screenshotsDir = path.resolve('screenshots', 'viewports');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  let hasFailures = false;

  for (const screen of screens) {
    await page.setViewport({
      width: screen.width,
      height: screen.height,
      deviceScaleFactor: 1,
      isMobile: screen.isMobile,
      hasTouch: screen.isMobile,
    });

    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 200));

    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth,
    }));

    if (metrics.hasOverflow) {
      hasFailures = true;
      console.error(`❌ Overflow at ${screen.name} (${screen.width}px): scrollWidth=${metrics.scrollWidth}`);
    } else {
      console.log(`✅ ${screen.name.padEnd(16)} (${screen.width}x${screen.height}): No overflow (scrollWidth=${metrics.scrollWidth})`);
    }

    // Capture screenshot for visual audit
    await page.screenshot({ 
      path: path.join(screenshotsDir, `${screen.name}.png`),
      fullPage: false 
    });
  }

  await browser.close();

  if (hasFailures) {
    console.error('Test suite finished with overflow errors.');
    process.exit(1);
  } else {
    console.log('\n🎉 ALL 13 viewports passed with 0 horizontal overflow!');
  }
}

run().catch(console.error);

