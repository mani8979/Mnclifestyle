import puppeteer from 'puppeteer-core';

async function testCategoryRedesign() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('--- Testing Desktop Category Page (1440 x 900) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/category/sofas', { waitUntil: 'networkidle0' });

  // 1. Inspect Category Hero
  const heroData = await page.evaluate(() => {
    const hero = document.querySelector('h1');
    const breadcrumb = document.querySelector('nav[aria-label="Breadcrumb"]');
    const trustIndicators = document.querySelectorAll('.border-t.border-white\\/10 span');

    return {
      title: hero?.textContent.trim(),
      breadcrumb: breadcrumb?.textContent.trim(),
      trustCount: trustIndicators.length
    };
  });
  console.log('Hero Inspection:', heroData);

  // 2. Inspect Grid Layout for 2-Product Category
  const gridMetrics = await page.evaluate(() => {
    const grid = document.querySelector('.max-w-4xl.mx-auto.gap-6');
    const cards = Array.from(document.querySelectorAll('.max-w-4xl .group.relative.flex.flex-col'));
    const parentContainer = document.querySelector('.max-w-\\[1360px\\]');
    
    const cardRects = cards.map(c => {
      const r = c.getBoundingClientRect();
      return { width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right) };
    });

    const gridRect = grid ? grid.getBoundingClientRect() : null;
    const parentRect = parentContainer ? parentContainer.getBoundingClientRect() : null;

    return {
      cardCount: cards.length,
      gridWidth: Math.round(gridRect?.width || 0),
      gridLeft: Math.round(gridRect?.left || 0),
      gridRight: Math.round(gridRect?.right || 0),
      parentWidth: Math.round(parentRect?.width || 0),
      cardRects,
      isGridCentered: gridRect && parentRect ? Math.abs((parentRect.width - gridRect.width) / 2 - (gridRect.left - parentRect.left)) < 15 : false
    };
  });
  console.log('2-Product Grid Metrics (Centered & Balanced):', gridMetrics);

  // 3. Test Sorting: Price Low to High
  console.log('\n--- Testing Sorting ---');
  await page.select('select[aria-label="Sort products"]', 'price-low');
  await new Promise(r => setTimeout(r, 300));

  const pricesAfterSort = await page.evaluate(() => {
    const priceEls = Array.from(document.querySelectorAll('.text-2xl.sm\\:text-\\[25px\\]'));
    return priceEls.map(p => p.textContent.trim());
  });
  console.log('Prices sorted Low to High:', pricesAfterSort);

  // Test Sorting: Price High to Low
  await page.select('select[aria-label="Sort products"]', 'price-high');
  await new Promise(r => setTimeout(r, 300));
  const pricesHighToLow = await page.evaluate(() => {
    const priceEls = Array.from(document.querySelectorAll('.text-2xl.sm\\:text-\\[25px\\]'));
    return priceEls.map(p => p.textContent.trim());
  });
  console.log('Prices sorted High to Low:', pricesHighToLow);

  // 4. Test Single-Product Category (/category/wardrobes)
  console.log('\n--- Testing 1-Product Category (/category/wardrobes) ---');
  await page.goto('http://localhost:5173/category/wardrobes', { waitUntil: 'networkidle0' });

  const singleProdGrid = await page.evaluate(() => {
    const grid = document.querySelector('.max-w-sm');
    const cards = document.querySelectorAll('.group.relative.flex.flex-col');
    return {
      cardCount: cards.length,
      isCenteredClass: grid ? grid.className : 'not found'
    };
  });
  console.log('Single product layout:', singleProdGrid);

  // Take Desktop Screenshot of Sofas
  await page.goto('http://localhost:5173/category/sofas', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'scripts/category-sofas-desktop.png' });
  console.log('Desktop screenshot saved to scripts/category-sofas-desktop.png');

  // 5. Test Responsive Viewports for Overflow
  console.log('\n--- Testing Responsive Viewports ---');
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 360, height: 740 }
  ];

  for (const vp of viewports) {
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/category/sofas', { waitUntil: 'networkidle0' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Viewport ${vp.width}x${vp.height}: Horizontal Overflow = ${overflow}`);
  }

  // 6. Test Mobile Filter Drawer on 390px
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:5173/category/sofas', { waitUntil: 'networkidle0' });

  // Click Filter & Sort button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Filter & Sort'));
    btn?.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const drawerVisible = await page.evaluate(() => {
    const drawer = document.querySelector('.fixed.inset-0.z-50');
    return !!drawer;
  });
  console.log('Mobile Drawer Opened:', drawerVisible);

  await page.screenshot({ path: 'scripts/category-mobile-drawer.png' });
  console.log('Mobile drawer screenshot saved.');

  // Close drawer
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[aria-label="Close filters"]');
    closeBtn?.click();
  });
  await new Promise(r => setTimeout(r, 300));

  await page.screenshot({ path: 'scripts/category-sofas-mobile.png' });
  console.log('Mobile category screenshot saved.');

  console.log('\nConsole Errors:', errors);
  await browser.close();
}

testCategoryRedesign().catch(console.error);
