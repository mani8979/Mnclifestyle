import puppeteer from 'puppeteer-core';

async function testFooter() {
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

  // 1. Test Desktop View (1440 x 900)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Scroll to footer
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    footer?.scrollIntoView();
  });

  // Verify Columns and Links
  const footerData = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    if (!footer) return null;

    // Trust strip
    const trustHeadings = Array.from(footer.querySelectorAll('h4')).map(h => h.textContent.trim());

    // 4 Columns
    const colHeadings = Array.from(footer.querySelectorAll('h5')).map(h => h.textContent.trim());

    // Contact Links
    const addressLink = footer.querySelector('a[href*="maps.google.com"]')?.getAttribute('href');
    const phoneLink = footer.querySelector('a[href^="tel:"]')?.getAttribute('href');
    const whatsappLink = footer.querySelector('a[href*="wa.me"]')?.getAttribute('href');

    // Category Links count
    const catLinks = Array.from(footer.querySelectorAll('a[href^="/category/"]')).map(a => a.textContent.trim());

    // Legal links
    const legalLinks = Array.from(footer.querySelectorAll('.border-t a')).map(a => a.textContent.trim());

    return {
      trustHeadings,
      colHeadings,
      addressLink,
      phoneLink,
      whatsappLink,
      catLinksCount: catLinks.length,
      catLinks,
      legalLinks
    };
  });

  console.log('Desktop Footer Inspection:');
  console.log(footerData);

  // 2. Test Newsletter Validation
  console.log('\n--- Testing Newsletter Subscription ---');
  // Type invalid email
  await page.evaluate(() => {
    const input = document.querySelector('footer input[type="email"]');
    if (input) {
      input.value = 'invalid-email';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.querySelector('footer button[type="submit"]');
      btn?.click();
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const errorText = await page.evaluate(() => {
    return document.querySelector('footer .text-rose-400')?.textContent.trim();
  });
  console.log('Error for invalid email:', errorText);

  // Type valid email
  await page.evaluate(() => {
    const input = document.querySelector('footer input[type="email"]');
    if (input) {
      input.value = 'concierge@luxuryhome.in';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      const btn = document.querySelector('footer button[type="submit"]');
      btn?.click();
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const successText = await page.evaluate(() => {
    return document.querySelector('footer .bg-white\\/5 span')?.textContent.trim();
  });
  console.log('Success text for valid email:', successText);

  // 3. Test Floating WhatsApp Button
  const waButtonData = await page.evaluate(() => {
    const aside = document.querySelector('aside[aria-label="WhatsApp quick contact"]');
    const btn = aside?.querySelector('a');
    const href = btn?.getAttribute('href');
    const ariaLabel = btn?.getAttribute('aria-label');
    const title = btn?.getAttribute('title');
    const computed = btn ? window.getComputedStyle(btn) : null;

    return {
      href,
      ariaLabel,
      title,
      bgColor: computed?.backgroundColor,
      borderColor: computed?.borderColor,
      color: computed?.color
    };
  });
  console.log('\n--- Floating WhatsApp Button ---');
  console.log(waButtonData);

  // Screenshot Footer Desktop
  const footerElement = await page.$('footer');
  if (footerElement) {
    await footerElement.screenshot({ path: 'scripts/footer-desktop.png' });
    console.log('Desktop footer screenshot saved to scripts/footer-desktop.png');
  }

  // 4. Test Viewports for Responsiveness & Overflow
  console.log('\n--- Testing Responsive Viewports ---');
  const viewports = [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`Viewport ${vp.width}x${vp.height}: Horizontal Overflow = ${overflow}`);
  }

  // Screenshot Footer Mobile (390px)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const footer = document.querySelector('footer');
    footer?.scrollIntoView();
  });
  const mobileFooter = await page.$('footer');
  if (mobileFooter) {
    await mobileFooter.screenshot({ path: 'scripts/footer-mobile.png' });
    console.log('Mobile footer screenshot saved to scripts/footer-mobile.png');
  }

  console.log('\nConsole Errors:', errors);
  await browser.close();
}

testFooter().catch(console.error);

