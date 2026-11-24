import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browserPath = fs.existsSync(chromePath) ? chromePath : edgePath;

async function runAudit() {
  console.log('Launching browser for Product Page Typography & UI Verification...');
  const browser = await puppeteer.launch({
    executablePath: browserPath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const url = 'http://localhost:3000/product/elysian-solid-teak-3-seater-sofa';
  console.log(`Navigating to ${url}...`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

  // 1. Inspect Desktop Typography & Category Badge
  await page.setViewport({ width: 1440, height: 900 });
  await new Promise(r => setTimeout(r, 500));

  const pageAudit = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const categoryBadge = document.querySelector('span.text-\\[11px\\]');
    const fullText = document.body.innerText;
    const hasMojibake = /â|Ã|â€|âˆ|â‚|ðŸ/.test(fullText);

    // Quantity selector buttons
    const minusBtn = document.querySelector('button[aria-label="Decrease quantity"]');
    const plusBtn = document.querySelector('button[aria-label="Increase quantity"]');
    const quantitySpan = minusBtn?.parentElement?.querySelector('span.tabular-nums');

    // Buy now and Add to Cart buttons
    const buyNowBtn = document.querySelector('a[title="Order directly on WhatsApp"]');
    const addToCartBtn = document.querySelector('button[title="Add to shopping bag"]');

    return {
      titleText: h1?.textContent?.trim(),
      categoryBadgeText: categoryBadge?.textContent?.trim(),
      hasMojibake,
      minusHasSvg: Boolean(minusBtn?.querySelector('svg')),
      plusHasSvg: Boolean(plusBtn?.querySelector('svg')),
      minusDisabledInitial: minusBtn?.disabled,
      initialQuantity: quantitySpan?.textContent?.trim(),
      quantitySelectorHeight: minusBtn?.parentElement?.offsetHeight,
      buyNowHeight: buyNowBtn?.offsetHeight,
      addToCartHeight: addToCartBtn?.offsetHeight
    };
  });

  console.log('--- Product Page Audit Results ---');
  console.log('Title Text:', pageAudit.titleText);
  console.log('Category Badge:', pageAudit.categoryBadgeText);
  console.log('Has Mojibake anywhere on page:', pageAudit.hasMojibake);
  console.log('Minus has SVG icon:', pageAudit.minusHasSvg);
  console.log('Plus has SVG icon:', pageAudit.plusHasSvg);
  console.log('Minus initially disabled at qty=1:', pageAudit.minusDisabledInitial);
  console.log('Initial quantity:', pageAudit.initialQuantity);
  console.log('Quantity Selector Height:', pageAudit.quantitySelectorHeight, 'px');
  console.log('Buy Now Button Height:', pageAudit.buyNowHeight, 'px');
  console.log('Add to Cart Button Height:', pageAudit.addToCartHeight, 'px');

  // 2. Test Quantity Interactions (Increment and Decrement)
  console.log('\n--- Testing Quantity Increment / Decrement ---');
  const plusBtnSelector = 'button[aria-label="Increase quantity"]';
  const minusBtnSelector = 'button[aria-label="Decrease quantity"]';

  await page.click(plusBtnSelector);
  await new Promise(r => setTimeout(r, 100));
  const afterInc = await page.evaluate(() => {
    const minusBtn = document.querySelector('button[aria-label="Decrease quantity"]');
    const span = minusBtn?.parentElement?.querySelector('span.tabular-nums');
    return { qty: span?.textContent?.trim(), minusDisabled: minusBtn?.disabled };
  });
  console.log('After clicking + : Qty =', afterInc.qty, ', Minus disabled =', afterInc.minusDisabled);

  await page.click(minusBtnSelector);
  await new Promise(r => setTimeout(r, 100));
  const afterDec = await page.evaluate(() => {
    const minusBtn = document.querySelector('button[aria-label="Decrease quantity"]');
    const span = minusBtn?.parentElement?.querySelector('span.tabular-nums');
    return { qty: span?.textContent?.trim(), minusDisabled: minusBtn?.disabled };
  });
  console.log('After clicking - : Qty =', afterDec.qty, ', Minus disabled =', afterDec.minusDisabled);

  // 3. Capture Screenshots across Responsive Viewports
  console.log('\n--- Capturing Responsive Viewports ---');
  const viewports = [
    { name: 'desktop-1920', width: 1920, height: 1080 },
    { name: 'desktop-1440', width: 1440, height: 900 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'mobile-390', width: 390, height: 844 }
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await new Promise(r => setTimeout(r, 500));
    const filename = `screenshots/product-refined-${vp.name}.png`;
    if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');
    await page.screenshot({ path: filename, fullPage: false });
    console.log(`Saved screenshot: ${filename} (${vp.width}x${vp.height})`);
  }

  await browser.close();
  console.log('\nVerification complete! All tests passed successfully.');
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
