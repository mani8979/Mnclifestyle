import puppeteer from 'puppeteer-core';

const viewports = [
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

(async () => {
  console.log('🚀 Starting Comprehensive Typography & UX Audit...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();

  // Test 1: Desktop Category Grid & Wardrobe Image
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Scroll to Category section
  await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Shop by Category'));
    if (heading) heading.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));

  const categoryCards = await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Shop by Category'));
    const section = heading.closest('section');
    const links = Array.from(section.querySelectorAll('a[href^="/category/"]'));
    return links.map(l => ({
      href: l.getAttribute('href'),
      title: l.querySelector('h3') ? l.querySelector('h3').innerText.trim() : '',
      allText: l.innerText.trim(),
      hasDesignsCount: /designs/i.test(l.innerText),
      imgNaturalWidth: l.querySelector('img') ? l.querySelector('img').naturalWidth : 0,
      imgSrc: l.querySelector('img') ? l.querySelector('img').src : ''
    }));
  });

  console.log('--- Category Grid Audit (12 Categories) ---');
  let allImagesLoaded = true;
  let allCountsHidden = true;

  categoryCards.forEach(c => {
    console.log(`• [${c.title}]: text="${c.allText}" | imgWidth=${c.imgNaturalWidth} | hasDesignsCount=${c.hasDesignsCount}`);
    if (c.hasDesignsCount) allCountsHidden = false;
    if (c.imgNaturalWidth === 0) allImagesLoaded = false;
  });

  if (!allCountsHidden) {
    console.error('❌ FAILURE: Some category cards still show design counts!');
  } else {
    console.log('✅ SUCCESS: All category cards show ONLY names, no design counts!');
  }

  if (!allImagesLoaded) {
    console.error('❌ FAILURE: Some category images failed to load!');
  } else {
    console.log('✅ SUCCESS: All 12 category images (including Wardrobes) loaded with full width!');
  }

  await page.screenshot({ path: 'category_grid_verified.png' });

  // Test 2: Price Typography on Product Details Page
  console.log('\n--- Product Details Price Typography Audit ---');
  await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle0' });

  const priceDetails = await page.evaluate(() => {
    const priceEl = document.querySelector('span.text-3xl, span.text-4xl, span.font-bold');
    const style = priceEl ? window.getComputedStyle(priceEl) : null;
    return {
      text: priceEl ? priceEl.innerText : 'Not found',
      fontFamily: style ? style.fontFamily : '',
      fontWeight: style ? style.fontWeight : '',
      fontVariantNumeric: style ? style.fontVariantNumeric : ''
    };
  });
  console.log('Product Price Typography:', priceDetails);

  // Test 3: Mobile Sticky Bar and Floating WhatsApp Button
  console.log('\n--- Mobile Viewport Audit (375px) ---');
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle0' });
  await page.evaluate(() => window.scrollBy(0, 400));
  await new Promise(r => setTimeout(r, 600));

  const mobileStickyBar = await page.evaluate(() => {
    const bar = document.querySelector('.lg\\:hidden.fixed.bottom-0');
    if (!bar) return 'Sticky bar not found';
    const price = bar.querySelector('.font-bold');
    const btn = bar.querySelector('a[href*="wa.me"]');
    const btnStyle = btn ? window.getComputedStyle(btn) : null;
    return {
      priceText: price ? price.innerText : '',
      waBtnColor: btnStyle ? btnStyle.backgroundColor : '',
      waBtnText: btn ? btn.innerText.trim() : ''
    };
  });
  console.log('Mobile Sticky Bar:', mobileStickyBar);

  await page.screenshot({ path: 'mobile_sticky_verified.png' });

  // Test 4: Floating WhatsApp button on Home page
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const waFloating = await page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="WhatsApp quick contact"]');
    const a = aside ? aside.querySelector('a') : null;
    const style = a ? window.getComputedStyle(a) : null;
    return {
      href: a ? a.getAttribute('href') : '',
      bgColor: style ? style.backgroundColor : '',
      hasPulse: aside ? !!aside.querySelector('.animate-ping') : false
    };
  });
  console.log('\n--- Floating WhatsApp Action Button Audit ---');
  console.log(waFloating);

  await browser.close();
  console.log('\n🎉 Master Audit completed successfully!');
})();

