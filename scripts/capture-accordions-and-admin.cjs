const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  console.log('Navigating to product page...');
  await page.goto('http://localhost:3000/product/elysian-solid-teak-3-seater-sofa', { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));

  // Find the Architectural Integrity / Specifications section
  const foundSection = await page.evaluate(() => {
    const heading = Array.from(document.querySelectorAll('h2, h3, span, p')).find(el => el.textContent && el.textContent.includes('ARCHITECTURAL INTEGRITY'));
    if (heading) {
      heading.scrollIntoView({ behavior: 'instant', block: 'start' });
      return true;
    }
    return false;
  });
  console.log('Found Architectural Integrity heading:', foundSection);

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'screenshots/product-architectural-integrity.png' });

  // Now capture Admin Products page
  console.log('Navigating to admin products page...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle0', timeout: 45000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'screenshots/admin-products.png' });

  await browser.close();
  console.log('Done!');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
