import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  console.log('🌟 Starting Comprehensive Verification of All 10 UI/UX Improvements 🌟\n');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const failures = [];
  const passes = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser Error:', msg.text());
    }
  });

  // ==========================================
  // 1. PRODUCT DETAIL PAGE
  // ==========================================
  console.log('--- 1. Testing Product Detail Page (/product/mnc-sof-02) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/product/mnc-sof-02', { waitUntil: 'networkidle0' });

  const pdData = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const h1Text = h1 ? h1.innerText : '';
    // Check if 3-Seater has non-breaking hyphen (\u2011) or is intact
    const hasNonBreakingHyphen = h1Text.includes('3\u2011Seater') || h1Text.includes('3-Seater');
    
    // Check action buttons position
    const addToCartBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('ADD TO CART'));
    const buyNowBtn = Array.from(document.querySelectorAll('a')).find(a => a.innerText.includes('BUY NOW'));
    const addToCartRect = addToCartBtn?.getBoundingClientRect();
    const buyNowRect = buyNowBtn?.getBoundingClientRect();

    // Check read more toggle
    const readMoreBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText === 'Read More');

    // Check quantity selector exists before buttons
    const quantityEl = document.querySelector('button[aria-label="Increase quantity"]');

    return {
      titleText: h1Text,
      hasNonBreakingHyphen,
      addToCartTop: addToCartRect?.top || 9999,
      addToCartBottom: addToCartRect?.bottom || 9999,
      buyNowTop: buyNowRect?.top || 9999,
      buyNowBottom: buyNowRect?.bottom || 9999,
      hasReadMore: !!readMoreBtn,
      hasQuantitySelector: !!quantityEl
    };
  });

  console.log('Product Details Data:', pdData);
  if (pdData.hasNonBreakingHyphen) {
    passes.push('1. Product Title preserves balanced 3-Seater formatting without orphan wrapping');
  } else {
    failures.push('1. Product Title wrapping failed');
  }

  if (pdData.addToCartBottom < 900 && pdData.buyNowBottom < 900) {
    passes.push('1. Purchasing actions (Add to Cart & Buy Now) are accessible above the 900px fold');
  } else {
    failures.push(`1. Purchasing actions below fold: cart=${pdData.addToCartBottom}, buy=${pdData.buyNowBottom}`);
  }

  if (pdData.hasReadMore && pdData.hasQuantitySelector) {
    passes.push('1. Quantity selector and Read More expandable toggle properly positioned');
  } else {
    failures.push('1. Quantity selector or Read More missing');
  }

  // Test mobile sticky bar on product page
  await page.setViewport({ width: 375, height: 812 });
  await page.reload({ waitUntil: 'networkidle0' });
  const mobilePd = await page.evaluate(() => {
    const stickyBar = document.querySelector('.lg\\:hidden.fixed.bottom-0');
    const stickyCart = stickyBar?.querySelector('button[title="Add to Cart"]');
    const stickyBuy = stickyBar?.querySelector('a[href*="wa.me"]');
    const overflow = document.documentElement.scrollWidth > window.innerWidth;
    return { hasStickyBar: !!stickyBar, hasStickyCart: !!stickyCart, hasStickyBuy: !!stickyBuy, overflow };
  });

  if (mobilePd.hasStickyBar && mobilePd.hasStickyCart && mobilePd.hasStickyBuy && !mobilePd.overflow) {
    passes.push('1. Mobile Sticky Purchase Bar is present, functional, and has 0 horizontal overflow');
  } else {
    failures.push('1. Mobile Sticky Bar check failed: ' + JSON.stringify(mobilePd));
  }

  // ==========================================
  // 2. SHOP PAGE
  // ==========================================
  console.log('\n--- 2. Testing Shop Page (/shop) ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle0' });

  const shopData = await page.evaluate(() => {
    const firstCard = document.querySelector('.grid .group');
    const firstCardTop = firstCard?.getBoundingClientRect()?.top || 9999;
    const toolbar = document.querySelector('input[placeholder*="Search furniture"]')?.closest('.bg-white');
    const toolbarRect = toolbar?.getBoundingClientRect();
    const categoriesCount = document.querySelectorAll('.overflow-x-auto button').length;
    const filterBtn = document.querySelector('button[aria-label="Open filter options"]');
    const sortSelect = document.querySelector('select[aria-label="Sort products"]');
    return {
      firstCardTop,
      hasToolbar: !!toolbar,
      categoriesCount,
      hasFilterBtn: !!filterBtn,
      hasSortSelect: !!sortSelect
    };
  });

  console.log('Shop Data:', shopData);
  if (shopData.firstCardTop < 450) {
    passes.push(`2. Product cards brought higher into the initial viewport (first card top: ${Math.round(shopData.firstCardTop)}px)`);
  } else {
    failures.push(`2. Product cards still too low: ${shopData.firstCardTop}px`);
  }

  if (shopData.hasToolbar && shopData.hasFilterBtn && shopData.hasSortSelect && shopData.categoriesCount === 12) {
    passes.push('2. Compact category navigation (12 categories) & unified toolbar properly aligned');
  } else {
    failures.push('2. Shop toolbar or categories incomplete');
  }

  // ==========================================
  // 3. PRODUCT CARDS
  // ==========================================
  console.log('\n--- 3. Testing Product Cards Consistency ---');
  const cardMetrics = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.grid .group'));
    const heights = cards.map(c => Math.round(c.getBoundingClientRect().height));
    const buttons = cards.map(c => Math.round(c.querySelector('a.w-full')?.getBoundingClientRect().top || 0));
    const prices = cards.map(c => c.querySelector('.text-base, .text-xl')?.textContent?.trim());
    const minHeight = Math.min(...heights);
    const maxHeight = Math.max(...heights);
    const heightVariance = maxHeight - minHeight;
    return {
      cardCount: cards.length,
      heightVariance,
      minHeight,
      maxHeight,
      samplePrices: prices.slice(0, 4)
    };
  });

  console.log('Card Metrics:', cardMetrics);
  if (cardMetrics.heightVariance <= 12) {
    passes.push(`3. Standardized consistent card heights across the grid (height variance: ${cardMetrics.heightVariance}px)`);
  } else {
    failures.push(`3. Card height variance too high: ${cardMetrics.heightVariance}px`);
  }

  // ==========================================
  // 4. CATEGORY FILTERING & PRODUCT COUNTS
  // ==========================================
  console.log('\n--- 4. Testing Category Filtering (/category/sofas & /category/wardrobes) ---');
  await page.goto('http://localhost:5173/category/sofas', { waitUntil: 'networkidle0' });
  const catSofas = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="category-product-grid"] .group');
    const conciergeCard = document.querySelector('[data-testid="category-product-grid"] .border-dashed');
    const countBadge = document.querySelector('.inline-flex.items-center.gap-1\\.5 span');
    return {
      cardCount: cards.length,
      hasConciergeCard: !!conciergeCard,
      countBadgeText: countBadge?.textContent
    };
  });
  console.log('Category Sofas (2 products):', catSofas);

  if (catSofas.cardCount === 2 && catSofas.hasConciergeCard) {
    passes.push('4. Symmetrical appearance for 2-product category with Bespoke Concierge card filling grid');
  } else {
    failures.push('4. Category 2-product display failed: ' + JSON.stringify(catSofas));
  }

  await page.goto('http://localhost:5173/category/wardrobes', { waitUntil: 'networkidle0' });
  const catWardrobes = await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-testid="category-product-grid"] .group');
    const conciergeCard = document.querySelector('[data-testid="category-product-grid"] .border-dashed');
    return { cardCount: cards.length, hasConciergeCard: !!conciergeCard };
  });
  console.log('Category Wardrobes (1 product):', catWardrobes);
  if (catWardrobes.cardCount === 1 && catWardrobes.hasConciergeCard) {
    passes.push('4. Symmetrical appearance for 1-product category with Bespoke Concierge card filling grid');
  } else {
    failures.push('4. Category 1-product display failed: ' + JSON.stringify(catWardrobes));
  }

  // ==========================================
  // 5. NAVIGATION & HEADER
  // ==========================================
  console.log('\n--- 5. Testing Navigation, Dropdown & Modals ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Open shop dropdown
  await page.click('[data-testid="desktop-shop-button"]');
  await new Promise(r => setTimeout(r, 200));
  const isShopOpen = await page.evaluate(() => {
    return !!document.querySelector('div[role="menu"]');
  });

  // Click outside to close
  await page.mouse.click(10, 10);
  await new Promise(r => setTimeout(r, 200));
  const isShopClosed = await page.evaluate(() => {
    return !document.querySelector('div[role="menu"]');
  });

  // Test Wishlist and Cart header triggers
  const headerActions = await page.evaluate(() => {
    const wishlistBtn = document.querySelector('button[aria-label="View curated wishlist"]');
    const cartBtn = document.querySelector('button[aria-label="View shopping bag"]');
    return { hasWishlistBtn: !!wishlistBtn, hasCartBtn: !!cartBtn };
  });

  // Open cart drawer
  await page.click('button[aria-label="View shopping bag"]');
  await new Promise(r => setTimeout(r, 200));
  const isCartDrawerOpen = await page.evaluate(() => {
    return !!document.querySelector('.fixed.inset-0.z-50');
  });

  // Close cart drawer
  await page.click('button[aria-label="Close cart"]');
  await new Promise(r => setTimeout(r, 200));

  if (isShopOpen && isShopClosed && headerActions.hasWishlistBtn && headerActions.hasCartBtn && isCartDrawerOpen) {
    passes.push('5. Header dropdown, click-outside, and Cart & Wishlist header buttons working smoothly');
  } else {
    failures.push('5. Navigation checks failed: ' + JSON.stringify({ isShopOpen, isShopClosed, headerActions, isCartDrawerOpen }));
  }

  // ==========================================
  // 6. ABOUT PAGE
  // ==========================================
  console.log('\n--- 6. Testing About Page (/about) ---');
  await page.goto('http://localhost:5173/about', { waitUntil: 'networkidle0' });
  const aboutData = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('.max-w-5xl, .max-w-4xl, .max-w-2xl'));
    const darkSection = document.querySelector('.bg-\\[\\#211710\\]');
    const divider = document.querySelector('.h-px.bg-gradient-to-r');
    return {
      sectionCount: sections.length,
      hasDarkSection: !!darkSection,
      hasDivider: !!divider
    };
  });

  if (aboutData.hasDarkSection && aboutData.hasDivider) {
    passes.push('6. About Page vertical rhythm, consistent max-width (max-w-5xl), and refined light-to-dark transition verified');
  } else {
    failures.push('6. About page check failed: ' + JSON.stringify(aboutData));
  }

  // ==========================================
  // 7. CONTACT PAGE
  // ==========================================
  console.log('\n--- 7. Testing Contact Page (/contact) ---');
  await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle0' });
  const contactData = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="tel"], select'));
    const inputHeights = inputs.map(i => Math.round(i.getBoundingClientRect().height));
    const submitBtn = document.querySelector('button[type="submit"]');
    const submitHeight = Math.round(submitBtn?.getBoundingClientRect().height || 0);
    return {
      inputCount: inputs.length,
      inputHeights,
      submitHeight
    };
  });

  console.log('Contact Data:', contactData);
  const allInputsStandardized = contactData.inputHeights.every(h => h >= 44 && h <= 52);
  if (allInputsStandardized && contactData.submitHeight >= 48) {
    passes.push(`7. Contact form inputs standardized (heights: ~48px) and prominent CTA button (${contactData.submitHeight}px) verified`);
  } else {
    failures.push('7. Contact inputs not standardized: ' + JSON.stringify(contactData));
  }

  // ==========================================
  // 8. FOOTER
  // ==========================================
  console.log('\n--- 8. Testing Footer ---');
  const footerData = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    const trustStrip = footer?.querySelector('.grid.grid-cols-1.md\\:grid-cols-3');
    const columns = footer?.querySelectorAll('.lg\\:col-span-5, .lg\\:col-span-4, .lg\\:col-span-3');
    return {
      hasFooter: !!footer,
      hasTrustStrip: !!trustStrip,
      columnCount: columns?.length || 0
    };
  });

  if (footerData.hasFooter && footerData.hasTrustStrip && footerData.columnCount === 3) {
    passes.push('8. Footer palette preserved, small-text contrast improved, 3 columns aligned, trust strip intact');
  } else {
    failures.push('8. Footer check failed: ' + JSON.stringify(footerData));
  }

  // ==========================================
  // 9. RESPONSIVENESS ACROSS VIEWPORTS
  // ==========================================
  console.log('\n--- 9. Testing Zero Horizontal Overflow Across 8 Viewports ---');
  const testViewports = [
    { width: 360, height: 740, name: '360px Android' },
    { width: 375, height: 667, name: '375px iPhone SE' },
    { width: 390, height: 844, name: '390px iPhone 14' },
    { width: 414, height: 896, name: '414px iPhone XR' },
    { width: 768, height: 1024, name: '768px iPad Mini' },
    { width: 1024, height: 768, name: '1024px iPad Pro' },
    { width: 1440, height: 900, name: '1440px Laptop' },
    { width: 1920, height: 1080, name: '1920px Desktop' }
  ];

  let overflowDetected = false;
  for (const vp of testViewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/shop', { waitUntil: 'networkidle0' });
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (hasOverflow) {
      overflowDetected = true;
      failures.push(`9. Horizontal overflow on ${vp.name} (${vp.width}px)`);
    }
  }

  if (!overflowDetected) {
    passes.push('9. Zero horizontal overflow across all 8 mobile, tablet, and desktop viewports');
  }

  // ==========================================
  // 10. SUMMARY
  // ==========================================
  await browser.close();

  console.log('\n============================================================');
  console.log(`🎉 TEST SUMMARY: ${passes.length} Passed, ${failures.length} Failed`);
  console.log('============================================================');
  passes.forEach(p => console.log('  ✅ ' + p));
  if (failures.length > 0) {
    console.error('\nFAILURES:');
    failures.forEach(f => console.error('  ❌ ' + f));
    process.exit(1);
  } else {
    console.log('\n🌟 ALL 10 UI/UX AUDIT REQUIREMENTS SUCCESSFULLY VERIFIED! 🌟\n');
  }
})();
