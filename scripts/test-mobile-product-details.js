import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const viewports = [
  { name: '360px', width: 360, height: 740, isMobile: true },
  { name: '375px', width: 375, height: 667, isMobile: true },
  { name: '390px', width: 390, height: 844, isMobile: true },
  { name: '414px', width: 414, height: 896, isMobile: true },
  { name: '430px', width: 430, height: 932, isMobile: true },
  { name: '1440px-desktop', width: 1440, height: 900, isMobile: false }
];

async function run() {
  console.log('--- Starting Mobile Product Details Page Verification ---');
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
    // 1. Functional Test on 390px (iPhone 14/15)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle2' });

    // Verify Sticky Bar exists and has correct initial WhatsApp URL
    const stickyBar = await page.$('.fixed.bottom-0');
    console.log('Sticky Purchase Bar Present on mobile:', !!stickyBar);

    let stickyHref = await page.$eval('.fixed.bottom-0 a', a => a.href);
    console.log('Initial Sticky Bar WhatsApp URL has product name:', stickyHref.includes('Aura%20Curved%20Boucl'));
    console.log('Initial Sticky Bar WhatsApp URL has default finish:', stickyHref.includes('Oatmeal%20Boucl'));
    console.log('Initial Sticky Bar WhatsApp URL has quantity 1:', stickyHref.includes('Quantity%3A%201'));

    // Test Finish Selection: click second finish ("Warm Charcoal")
    const finishButtons = await page.$$('button:has(span[style*="background-color"])');
    console.log('Finish buttons count:', finishButtons.length);
    if (finishButtons.length >= 2) {
      await finishButtons[1].click();
      await new Promise(r => setTimeout(r, 200));
      stickyHref = await page.$eval('.fixed.bottom-0 a', a => a.href);
      console.log('After selecting finish 2, Sticky Bar URL updated:', stickyHref.includes('Warm%20Charcoal'));
    }

    // Test Quantity Selector: click "+"
    const plusBtn = await page.$('button[aria-label="Increase quantity"]');
    await plusBtn.click();
    await new Promise(r => setTimeout(r, 200));
    stickyHref = await page.$eval('.fixed.bottom-0 a', a => a.href);
    console.log('After clicking +, Sticky Bar URL has quantity 2:', stickyHref.includes('Quantity%3A%202'));

    // Test Read More description toggle
    const readMoreClicked = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Read More'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Read More button clicked:', readMoreClicked);

    // Test Recommended Products ("Explore Similar Furniture") position vs Accordions
    const sectionOrder = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3')).map(h => h.textContent.trim());
      return headings;
    });
    console.log('Page H3 headings in order:', sectionOrder);

    // Test Accordion Expansion
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Dimensions & Materials'));
      if (btn) btn.click();
    });

    // Capture screenshots across viewports
    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, hasTouch: vp.isMobile });
      await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle2' });

      // Check overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      // Check if sticky bar is visible (should be visible on mobile, hidden on desktop)
      const stickyVisible = await page.evaluate(() => {
        const bar = document.querySelector('.fixed.bottom-0');
        if (!bar) return false;
        const style = window.getComputedStyle(bar);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });

      console.log(`Viewport: ${vp.name} (${vp.width}x${vp.height}): Overflow = ${hasHorizontalOverflow}, StickyBarVisible = ${stickyVisible}`);

      // Screenshot top view
      await page.screenshot({ path: `scripts/product-mobile-${vp.name}-top.png` });

      // Scroll halfway to see sticky bar and recommended products
      if (vp.isMobile) {
        await page.evaluate(() => window.scrollTo(0, 650));
        await new Promise(r => setTimeout(r, 300));
        await page.screenshot({ path: `scripts/product-mobile-${vp.name}-scrolled.png` });
      }
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
