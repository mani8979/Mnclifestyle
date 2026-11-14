import puppeteer from 'puppeteer-core';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function check() {
  const browser = await puppeteer.launch({ 
    executablePath: chromePath, 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('requestfailed', req => console.log('REQ FAILED:', req.url()));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  const imgSrc = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="MNC Lifestyle"]');
    return img ? { src: img.src, complete: img.complete, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight } : null;
  });
  console.log('Image status:', imgSrc);
  await browser.close();
}
check().catch(console.error);

