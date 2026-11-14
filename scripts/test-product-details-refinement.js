import puppeteer from 'puppeteer-core';

async function testProductDetails() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  // Navigate to product details
  await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle0' });

  // 1. Inspect Hierarchy on Right Column
  const hierarchy = await page.evaluate(() => {
    const col5 = document.querySelector('.lg\\:col-span-5');
    if (!col5) return null;

    const category = col5.children[0]?.textContent.trim();
    const name = col5.children[1]?.textContent.trim();
    const rating = col5.children[2]?.textContent.trim();
    const sku = col5.children[3]?.textContent.trim();
    const priceBlock = col5.children[4]?.textContent.trim();
    const taxDelivery = col5.children[5]?.textContent.trim();
    const description = col5.children[6]?.textContent.trim();
    const finish = col5.children[7]?.textContent.trim();
    const quantity = col5.children[8]?.textContent.trim();
    const whatsappOrder = col5.children[9]?.textContent.trim();

    return {
      category,
      name,
      rating,
      sku,
      priceBlock,
      taxDelivery,
      description: description?.slice(0, 60) + '...',
      finish: finish?.slice(0, 40) + '...',
      quantity: quantity?.slice(0, 30),
      whatsappOrder: whatsappOrder?.slice(0, 40) + '...'
    };
  });

  console.log('Hierarchy on Right Column:');
  console.log(hierarchy);

  // 2. Check Clean Photograph (No overlay discount badges)
  const imageOverlays = await page.evaluate(() => {
    const mainImgContainer = document.querySelector('.lg\\:col-span-7 .aspect-\\[4\\/3\\]');
    if (!mainImgContainer) return -1;
    // Count badges overlaying the image
    const badges = mainImgContainer.querySelectorAll('span');
    return badges.length;
  });
  console.log('Badges overlaying main product photo:', imageOverlays);

  // 3. Test Quantity Selector
  const qtyBefore = await page.evaluate(() => {
    const qtySpan = document.querySelector('.lg\\:col-span-5 span.w-12');
    return qtySpan?.textContent.trim();
  });
  console.log('Initial Quantity:', qtyBefore);

  // Click minus (should remain 1)
  await page.evaluate(() => {
    const minusBtn = document.querySelector('button[aria-label="Decrease quantity"]');
    if (minusBtn) minusBtn.click();
  });
  const qtyAfterMinus = await page.evaluate(() => {
    const qtySpan = document.querySelector('.lg\\:col-span-5 span.w-12');
    return qtySpan?.textContent.trim();
  });
  console.log('Quantity after clicking minus at 1:', qtyAfterMinus);

  // Click plus twice
  await page.evaluate(() => {
    const plusBtn = document.querySelector('button[aria-label="Increase quantity"]');
    if (plusBtn) {
      plusBtn.click();
      plusBtn.click();
    }
  });
  const qtyAfterPlus = await page.evaluate(() => {
    const qtySpan = document.querySelector('.lg\\:col-span-5 span.w-12');
    return qtySpan?.textContent.trim();
  });
  console.log('Quantity after clicking plus twice:', qtyAfterPlus);

  // 4. Test Finish Selection
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('.lg\\:col-span-5 button')).filter(b => 
      b.textContent.includes('Warm Charcoal')
    );
    if (buttons[0]) buttons[0].click();
  });
  await new Promise(r => setTimeout(r, 200));

  // Check generated WhatsApp URL
  const whatsappUrl = await page.evaluate(() => {
    const orderBtn = document.querySelector('a[href^="https://wa.me/"]');
    return orderBtn ? orderBtn.getAttribute('href') : null;
  });
  console.log('Generated WhatsApp Link:');
  console.log(decodeURIComponent(whatsappUrl || ''));

  // Take Desktop Screenshot
  await page.screenshot({ path: 'scripts/product-details-desktop.png' });
  console.log('Desktop screenshot saved to scripts/product-details-desktop.png');

  // 5. Test Mobile Viewport
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle0' });

  const mobileMetrics = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    const priceText = document.querySelector('.font-serif.text-3xl')?.textContent.trim();
    const whatsappBtn = document.querySelector('a[href^="https://wa.me/"]');
    const btnRect = whatsappBtn ? whatsappBtn.getBoundingClientRect() : null;

    return {
      hasHorizontalOverflow: overflow,
      price: priceText,
      whatsappBtnWidth: btnRect?.width,
      viewportWidth: window.innerWidth
    };
  });
  console.log('Mobile Check (390px):', mobileMetrics);

  await page.screenshot({ path: 'scripts/product-details-mobile.png' });
  console.log('Mobile screenshot saved to scripts/product-details-mobile.png');

  console.log('Console Errors:', errors);
  await browser.close();
}

testProductDetails().catch(console.error);

