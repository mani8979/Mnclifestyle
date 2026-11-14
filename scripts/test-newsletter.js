import puppeteer from 'puppeteer-core';

async function testNewsletter() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Scroll to footer
  await page.evaluate(() => {
    document.querySelector('footer')?.scrollIntoView();
  });

  // Type valid email
  await page.type('footer input[type="email"]', 'vip@mnclifestyle.in');
  await page.click('footer button[type="submit"]');
  await new Promise(r => setTimeout(r, 400));

  const successMessage = await page.evaluate(() => {
    return document.querySelector('footer .p-3\\.5')?.textContent.trim();
  });
  console.log('Newsletter Form Success Message:', successMessage);

  await browser.close();
}

testNewsletter().catch(console.error);

