const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });

  console.log('1. Going to login page...');
  await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1000));

  console.log('2. Entering credentials...');
  await page.type('input[type="email"]', 'admin@mnclifestyle.in');
  await page.type('input[type="password"]', 'MncLuxury@2026!');
  
  const submitBtn = await page.$('button[type="submit"]');
  await submitBtn.click();

  console.log('3. Waiting for navigation after login...');
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  console.log('4. Navigating to products page...');
  await page.goto('http://localhost:3000/admin/products', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/admin-products-verified.png' });

  console.log('5. Navigating to products/new page...');
  await page.goto('http://localhost:3000/admin/products/new', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/admin-product-new-verified.png' });

  console.log('6. Navigating to dashboard...');
  await page.goto('http://localhost:3000/admin/dashboard', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/admin-dashboard-verified.png' });

  console.log('7. Navigating to categories...');
  await page.goto('http://localhost:3000/admin/categories', { waitUntil: 'networkidle0', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'screenshots/admin-categories-verified.png' });

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
