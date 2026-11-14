import puppeteer from 'puppeteer-core';

(async () => {
  console.log('🚀 Running Maps & WhatsApp Integration Verification...\n');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  const errors = [];

  // TEST 1: CONTACT PAGE
  console.log('--- 1. Testing Contact Page ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle0' });

  const contactData = await page.evaluate(() => {
    const iframe = document.querySelector('iframe');
    const directionsBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('Get Directions'));
    const viewMapsBtn = Array.from(document.querySelectorAll('a')).find(a => a.textContent.includes('View on Google Maps'));
    const allText = document.body.innerText;
    const hasInteriors = /MNC LifeStyle Furniture & Interiors/.test(allText);

    return {
      iframeSrc: iframe ? iframe.src : null,
      directionsHref: directionsBtn ? directionsBtn.href : null,
      viewMapsHref: viewMapsBtn ? viewMapsBtn.href : null,
      hasInteriors,
      pageTextSample: document.querySelector('h2')?.innerText
    };
  });

  console.log('Contact iframe src:', contactData.iframeSrc);
  console.log('Contact directions href:', contactData.directionsHref);
  console.log('Contact view maps href:', contactData.viewMapsHref);
  console.log('Has "& Interiors":', contactData.hasInteriors);

  if (!contactData.iframeSrc || !contactData.iframeSrc.includes('17.80386734008789,83.2098159790039')) {
    errors.push('Contact iframe does not contain exact coordinates!');
  }
  if (!contactData.directionsHref || !contactData.directionsHref.includes('17.80386734008789,83.2098159790039')) {
    errors.push('Get Directions button does not contain exact coordinates!');
  }
  if (contactData.hasInteriors) {
    errors.push('Found "& Interiors" on Contact page!');
  }

  // TEST 2: FOOTER
  console.log('\n--- 2. Testing Footer ---');
  const footerData = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;
    const mapLinks = Array.from(footer.querySelectorAll('a[href*="google.com/maps"]')).map(a => ({
      text: a.innerText.trim(),
      href: a.href
    }));
    const waLink = footer.querySelector('a[href*="wa.me"]');
    return {
      text: footer.innerText,
      mapLinks,
      waHref: waLink ? waLink.href : null,
      hasInteriors: /MNC LifeStyle Furniture & Interiors/.test(footer.innerText)
    };
  });

  console.log('Footer Map Links:', footerData.mapLinks);
  console.log('Footer WhatsApp Href:', footerData.waHref);
  console.log('Footer has "& Interiors":', footerData.hasInteriors);

  if (!footerData.waHref || !footerData.waHref.includes('918790943457')) {
    errors.push('Footer WhatsApp link does not use 918790943457!');
  }
  if (footerData.hasInteriors) {
    errors.push('Footer contains "& Interiors"!');
  }

  // TEST 3: PRODUCT DETAILS WHATSAPP ORDER
  console.log('\n--- 3. Testing Product Details WhatsApp Order ---');
  await page.goto('http://localhost:5173/product/mnc-sof-01', { waitUntil: 'networkidle0' });

  const productOrderData = await page.evaluate(() => {
    const orderBtn = Array.from(document.querySelectorAll('a')).find(a => 
      a.textContent.includes('Order on WhatsApp') || a.textContent.includes('Order Through WhatsApp')
    );
    return {
      href: orderBtn ? orderBtn.href : null,
      text: orderBtn ? orderBtn.innerText.trim() : null
    };
  });

  console.log('Product Order Button Href:', productOrderData.href);
  if (productOrderData.href) {
    const urlObj = new URL(productOrderData.href);
    const decodedMessage = decodeURIComponent(urlObj.searchParams.get('text') || '');
    console.log('\nDecoded WhatsApp Message:\n' + decodedMessage);

    if (!urlObj.pathname.includes('918790943457')) {
      errors.push('Order button target phone number is not 918790943457!');
    }
    if (!decodedMessage.includes('Hello MNC LifeStyle')) {
      errors.push('Message missing greeting!');
    }
    if (!decodedMessage.includes('Product: Aura Curved Bouclé Sofa')) {
      errors.push('Message missing product name!');
    }
    if (!decodedMessage.includes('SKU: MNC-SOF-001')) {
      errors.push('Message missing product SKU!');
    }
    if (!decodedMessage.includes('Price: ₹84,999')) {
      errors.push('Message missing selling price!');
    }
    if (!decodedMessage.includes('Quantity: 1')) {
      errors.push('Message missing quantity!');
    }
    if (!decodedMessage.includes('Finish/Fabric: Oatmeal Bouclé')) {
      errors.push('Message missing selected finish/fabric!');
    }
    if (!decodedMessage.includes('Product Link:')) {
      errors.push('Message missing product link!');
    }
    if (!decodedMessage.includes('Please share availability and delivery details.')) {
      errors.push('Message missing closing call to action!');
    }
  } else {
    errors.push('Could not find Order on WhatsApp button!');
  }

  // TEST 4: CATEGORY PAGE DESIGNER PERSPECTIVE REMOVED
  console.log('\n--- 4. Testing Category Page (Removal of Designer Perspective) ---');
  await page.goto('http://localhost:5173/category/dining-sets', { waitUntil: 'networkidle0' });

  const categoryCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasDesignerPerspective: /Designer's Perspective/i.test(text),
      hasSanctuary: /Styling Your Dining Sets Sanctuary/i.test(text),
      hasHardwoodsMortise: /Seasoned Hardwoods & Mortise Joinery/i.test(text)
    };
  });

  console.log('Category check:', categoryCheck);
  if (categoryCheck.hasDesignerPerspective || categoryCheck.hasSanctuary || categoryCheck.hasHardwoodsMortise) {
    errors.push('Designer Perspective section was not fully removed from Category page!');
  }

  // TEST 5: MOBILE BREAKPOINTS (360px, 375px, 390px, 430px)
  console.log('\n--- 5. Mobile Responsiveness (360px, 375px, 390px, 430px) ---');
  const widths = [360, 375, 390, 430];
  for (const w of widths) {
    await page.setViewport({ width: w, height: 800 });
    await page.goto('http://localhost:5173/contact', { waitUntil: 'networkidle0' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Width ${w}px overflow:`, overflow);
    if (overflow) {
      errors.push(`Horizontal overflow detected at ${w}px on Contact page!`);
    }
  }

  await browser.close();

  console.log('\n========================================');
  if (errors.length === 0) {
    console.log('✅ ALL TESTS PASSED WITH 0 ERRORS!');
  } else {
    console.error('❌ FAILURES DETECTED:');
    errors.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
})();
