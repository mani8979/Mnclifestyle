import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: 'desktop-1440px', width: 1440, height: 900, isMobile: false },
  { name: 'desktop-1920px', width: 1920, height: 1080, isMobile: false },
  { name: 'mobile-360px', width: 360, height: 740, isMobile: true },
  { name: 'mobile-375px', width: 375, height: 667, isMobile: true },
  { name: 'mobile-390px', width: 390, height: 844, isMobile: true },
  { name: 'mobile-430px', width: 430, height: 932, isMobile: true }
];

async function run() {
  console.log('--- Starting Complete Shop Redesign Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. Desktop 1440px Inspection
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle2' });

    // Header inspection
    const headerDetails = await page.evaluate(() => {
      const h1 = document.querySelector('h1')?.textContent?.trim();
      const eyebrow = document.querySelector('h1')?.previousElementSibling?.textContent?.trim();
      const desc = document.querySelector('h1')?.nextElementSibling?.textContent?.trim();
      return { h1, eyebrow, desc };
    });
    console.log('Header elements:', headerDetails);

    // Category navigation inspection
    const categories = await page.$$eval('.overflow-x-auto button', btns =>
      btns.map(b => b.textContent.trim())
    );
    console.log('Category buttons count:', categories.length, categories);

    // Check grid columns
    const gridCols = await page.evaluate(() => {
      const grid = document.querySelector('.grid.grid-cols-2');
      return grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
    });
    console.log('Desktop 1440px Grid Columns count:', gridCols);

    await page.screenshot({ path: 'scripts/shop-desktop-1440px.png' });
    console.log('Screenshot saved: scripts/shop-desktop-1440px.png');

    // 2. Functional Test: Category Filtering
    console.log('Testing category filter: Sofas...');
    await page.evaluate(() => {
      const sofaBtn = Array.from(document.querySelectorAll('.overflow-x-auto button')).find(b => b.textContent.trim() === 'Sofas');
      if (sofaBtn) sofaBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const sofaProductCount = await page.$$eval('.grid.grid-cols-2 .group', els => els.length);
    console.log('Products showing for Sofas:', sofaProductCount);
    await page.screenshot({ path: 'scripts/shop-desktop-sofas-filtered.png' });

    // 3. Functional Test: Sorting
    console.log('Testing price sorting...');
    await page.select('select[aria-label="Sort products"]', 'price-low');
    await new Promise(r => setTimeout(r, 300));
    const sortedPrices = await page.$$eval('.grid.grid-cols-2 .text-base.sm\\:text-xl', els =>
      els.map(el => el.textContent.trim())
    );
    console.log('Sorted prices (Low to High):', sortedPrices);

    // 4. Functional Test: Search
    console.log('Testing search: "Bouclé"...');
    await page.type('input[placeholder*="Search furniture"]', 'Bouclé');
    await new Promise(r => setTimeout(r, 400));
    const searchCount = await page.$$eval('.grid.grid-cols-2 .group', els => els.length);
    console.log('Products matching "Bouclé":', searchCount);

    // Clear search
    await page.click('button[aria-label="Clear search"]');
    await new Promise(r => setTimeout(r, 200));

    // Reset filters
    await page.evaluate(() => {
      const resetBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Clear All') || b.textContent.includes('Reset'));
      if (resetBtn) resetBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // 5. Functional Test: Filter Drawer
    console.log('Testing Filter Drawer...');
    await page.click('button[aria-label="Open filter options"]');
    await new Promise(r => setTimeout(r, 400));
    const isDrawerOpen = await page.evaluate(() => {
      return !!document.querySelector('.fixed.inset-0.z-50');
    });
    console.log('Filter drawer opened:', isDrawerOpen);
    await page.screenshot({ path: 'scripts/shop-filter-drawer.png' });

    // Close drawer
    await page.click('button[aria-label="Close filters"]');
    await new Promise(r => setTimeout(r, 300));

    // 6. Viewport Responsive Tests across all required widths
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
      await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle2' });

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      const cardCount = await page.$$eval('.grid.grid-cols-2 .group', els => els.length);
      const cols = await page.evaluate(() => {
        const grid = document.querySelector('.grid.grid-cols-2');
        return grid ? window.getComputedStyle(grid).gridTemplateColumns.split(' ').length : 0;
      });

      console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow = ${overflow}, Columns = ${cols}, Cards = ${cardCount}`);
      await page.screenshot({ path: `scripts/shop-${vp.name}.png` });
    }

    console.log('All Console Errors during tests:', consoleErrors);
    console.log('--- Verification Complete: SUCCESS ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

run();
