import puppeteer from 'puppeteer-core';

(async () => {
  console.log('🚀 Testing Elysian Solid Teak 3-Seater Sofa Product Page...\n');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  const errors = [];

  // Viewport: 1440 x 900 (Desktop)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/product/mnc-sof-02', { waitUntil: 'networkidle0' });

  // 1. Title Typography Audit
  const titleData = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const rect = h1 ? h1.getBoundingClientRect() : null;
    const computed = h1 ? window.getComputedStyle(h1) : null;
    return {
      text: h1 ? h1.innerText : null,
      width: rect ? rect.width : 0,
      height: rect ? rect.height : 0,
      fontSize: computed ? computed.fontSize : null,
      lineHeight: computed ? computed.lineHeight : null
    };
  });
  console.log('Title Data:', titleData);

  // 2. Button Above the Fold Check
  const buttonsData = await page.evaluate(() => {
    const addToCartBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ADD TO CART'));
    const buyNowBtn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('BUY NOW'));
    const cartRect = addToCartBtn ? addToCartBtn.getBoundingClientRect() : null;
    const buyRect = buyNowBtn ? buyNowBtn.getBoundingClientRect() : null;

    return {
      addToCartTop: cartRect ? cartRect.top : 9999,
      addToCartBottom: cartRect ? cartRect.bottom : 9999,
      buyNowTop: buyRect ? buyRect.top : 9999,
      buyNowBottom: buyRect ? buyRect.bottom : 9999,
      buyNowHref: buyNowBtn ? buyNowBtn.href : null,
      viewportHeight: window.innerHeight
    };
  });
  console.log('\nButtons Viewport Position:', buttonsData);

  if (buttonsData.buyNowBottom > 900) {
    errors.push(`Buy Now button bottom (${buttonsData.buyNowBottom}px) is below 900px fold!`);
  } else {
    console.log(`✅ SUCCESS: Buy Now button is immediately visible at ${buttonsData.buyNowTop}px (above 900px fold)!`);
  }

  if (buttonsData.addToCartBottom > 900) {
    errors.push(`Add to Cart button bottom (${buttonsData.addToCartBottom}px) is below 900px fold!`);
  } else {
    console.log(`✅ SUCCESS: Add to Cart button is immediately visible at ${buttonsData.addToCartTop}px (above 900px fold)!`);
  }

  // 3. Test Read More toggle
  console.log('\n--- Testing Read More toggle ---');
  const readMoreBefore = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Read More');
    return !!btn;
  });
  console.log('Has Read More button before click:', readMoreBefore);

  if (readMoreBefore) {
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Read More');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    const showLessAfter = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Show Less');
      return !!btn;
    });
    console.log('Has Show Less button after click:', showLessAfter);
    if (!showLessAfter) {
      errors.push('Read More did not toggle to Show Less!');
    }
  }

  // Take desktop screenshot
  await page.screenshot({ path: 'elysian_desktop_view.png' });

  // 4. Test Mobile Viewport (375x812)
  console.log('\n--- Testing Mobile Viewport (375x812) ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/product/mnc-sof-02', { waitUntil: 'networkidle0' });

  const mobileData = await page.evaluate(() => {
    const stickyBar = document.querySelector('.lg\\:hidden.fixed.bottom-0');
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    const stickyAddCart = stickyBar ? stickyBar.querySelector('button[title="Add to Cart"]') : null;
    const stickyBuyNow = stickyBar ? stickyBar.querySelector('a[href*="wa.me"]') : null;

    return {
      hasStickyBar: !!stickyBar,
      hasStickyAddCart: !!stickyAddCart,
      hasStickyBuyNow: !!stickyBuyNow,
      overflow,
      titleText: document.querySelector('h1')?.innerText
    };
  });
  console.log('Mobile Data:', mobileData);

  if (!mobileData.hasStickyBar || !mobileData.hasStickyBuyNow || !mobileData.hasStickyAddCart) {
    errors.push('Mobile sticky bottom bar is missing or missing buttons!');
  }
  if (mobileData.overflow) {
    errors.push('Horizontal overflow detected on mobile!');
  }

  await page.screenshot({ path: 'elysian_mobile_view.png' });

  await browser.close();

  console.log('\n========================================');
  if (errors.length === 0) {
    console.log('✅ ALL PRODUCT DETAIL PAGE TESTS PASSED!');
  } else {
    console.error('❌ FAILURES DETECTED:');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
})();

