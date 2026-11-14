import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function verify() {
  console.log('🚀 Starting MNC LifeStyle Website Transformation Verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    // 1. Verify Homepage
    console.log('--- 1. Testing Homepage ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Check Hero title
    const heroTitle = await page.$eval('h1', el => el.innerText);
    console.log('Hero Title:', heroTitle.replace(/\n/g, ' '));

    // Check Categories count in Shop by Categories
    const categoryCount = await page.$$eval('a[href^="/category/"]', els => els.length);
    console.log('Total Category Links found:', categoryCount);

    // Check Floating WhatsApp Button
    const waFloating = await page.$('a[aria-label*="WhatsApp"]');
    console.log('Floating WhatsApp Button exists:', !!waFloating);
    if (waFloating) {
      const waHref = await page.evaluate(el => el.getAttribute('href'), waFloating);
      console.log('WhatsApp Floating Link:', waHref.substring(0, 50) + '...');
    }

    // Check Currency on Homepage Product Cards
    const prices = await page.$$eval('.font-serif', els => 
      els.map(e => e.innerText).filter(t => t.includes('₹') || t.includes('$'))
    );
    console.log('Sample Prices found on Homepage:', prices.slice(0, 5));
    const dollarPrices = prices.filter(p => p.includes('$'));
    if (dollarPrices.length > 0) {
      console.error('❌ Found DOLLAR prices on homepage:', dollarPrices);
    } else {
      console.log('✅ 100% INR currency formatting confirmed on Homepage (0 dollar prices)');
    }

    // Take screenshot of homepage
    await page.screenshot({ path: 'scripts/homepage-verified.png', fullPage: false });
    console.log('📸 Homepage screenshot saved.');

    // 2. Test Product Details Page
    console.log('\n--- 2. Testing Product Details Page (/product/mnc-sof-01) ---');
    await page.goto(`${BASE_URL}/product/mnc-sof-01`, { waitUntil: 'networkidle0' });

    const prodTitle = await page.$eval('h1', el => el.innerText);
    console.log('Product Title:', prodTitle);

    // Check WhatsApp Order Button
    const orderBtn = await page.$('a[href*="wa.me"]');
    console.log('WhatsApp Order CTA exists:', !!orderBtn);
    if (orderBtn) {
      const orderHref = await page.evaluate(el => el.getAttribute('href'), orderBtn);
      console.log('Pre-filled WhatsApp Order URL preview:\n', decodeURIComponent(orderHref).substring(0, 180) + '...');
    }

    // Check Product Pricing in INR
    const productPrice = await page.$eval('.font-serif.text-3xl, .font-serif.text-4xl', el => el.innerText);
    console.log('Product Details Price:', productPrice);

    await page.screenshot({ path: 'scripts/product-details-verified.png', fullPage: false });
    console.log('📸 Product details screenshot saved.');

    // 3. Test Category Page (/category/sofas)
    console.log('\n--- 3. Testing Category Page (/category/sofas) ---');
    await page.goto(`${BASE_URL}/category/sofas`, { waitUntil: 'networkidle0' });
    const catHeading = await page.$eval('h1', el => el.innerText);
    console.log('Category Heading:', catHeading);
    await page.screenshot({ path: 'scripts/category-verified.png', fullPage: false });

    // 4. Test Catalog Shop Page (/shop)
    console.log('\n--- 4. Testing Shop Catalog Page (/shop) ---');
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle0' });
    const shopHeading = await page.$eval('h1', el => el.innerText);
    console.log('Shop Heading:', shopHeading);

    // 5. Check Errors
    console.log('\n--- 5. Runtime Console / Page Errors ---');
    if (errors.length === 0) {
      console.log('✅ ZERO runtime errors across all tested pages!');
    } else {
      console.log('Errors caught:', errors);
    }

  } catch (err) {
    console.error('Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

verify();
