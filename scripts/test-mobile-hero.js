import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '360px (Small Android)', width: 360, height: 740, isMobile: true },
  { name: '375px (iPhone SE)', width: 375, height: 667, isMobile: true },
  { name: '390px (iPhone 14/15)', width: 390, height: 844, isMobile: true },
  { name: '414px (iPhone XR/Plus)', width: 414, height: 896, isMobile: true },
  { name: '430px (iPhone Pro Max)', width: 430, height: 932, isMobile: true },
  { name: '1440px (Desktop check)', width: 1440, height: 900, isMobile: false }
];

async function run() {
  console.log('--- Starting Mobile Hero Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Inspect heading font size, line count, colors
    const heroMetrics = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const spans = h1 ? Array.from(h1.querySelectorAll('span')) : [];
      const computedH1 = h1 ? window.getComputedStyle(h1) : null;
      const computedSpan1 = spans[0] ? window.getComputedStyle(spans[0]) : null;
      const computedSpan2 = spans[1] ? window.getComputedStyle(spans[1]) : null;

      const p = document.querySelector('h1 + p') || document.querySelector('p');
      const computedP = p ? window.getComputedStyle(p) : null;

      const hasHorizontalScroll = document.documentElement.scrollWidth > document.documentElement.clientWidth;

      return {
        h1FontSize: computedH1?.fontSize,
        h1LineHeight: computedH1?.lineHeight,
        span1Text: spans[0]?.textContent?.trim(),
        span1Color: computedSpan1?.color,
        span2Text: spans[1]?.textContent?.trim(),
        span2Color: computedSpan2?.color,
        descFontSize: computedP?.fontSize,
        hasHorizontalScroll,
        h1BoundingRect: h1 ? h1.getBoundingClientRect() : null
      };
    });

    console.log(`Viewport: ${vp.name} (${vp.width}x${vp.height})`);
    console.log(`  H1 Font Size: ${heroMetrics.h1FontSize}, Line 1: "${heroMetrics.span1Text}" (${heroMetrics.span1Color}), Line 2: "${heroMetrics.span2Text}" (${heroMetrics.span2Color})`);
    console.log(`  Desc Font Size: ${heroMetrics.descFontSize}, Horizontal Overflow: ${heroMetrics.hasHorizontalScroll}`);

    const safeName = vp.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    await page.screenshot({ path: `scripts/hero-test-${safeName}.png` });
  }

  await browser.close();
  console.log('--- Verification Complete: All screenshots saved! ---');
}

run();
