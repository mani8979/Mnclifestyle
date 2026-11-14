import puppeteer from 'puppeteer-core';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  // Desktop
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

  // Verify category card texts
  const categoryTexts = await page.$$eval('.grid.grid-cols-2.sm\\:grid-cols-3 a.group', els =>
    els.map(el => el.textContent.trim().replace(/\s+/g, ' '))
  );
  console.log('All 12 Category card texts:', categoryTexts);

  const hasDesignsCount = categoryTexts.some(t => t.includes('Designs') || t.includes('+'));
  console.log('Any Designs count visible in categories:', hasDesignsCount);

  // Inspect floating WhatsApp button styles
  const whatsappStyles = await page.$eval('aside[aria-label="WhatsApp quick contact"] a', el => {
    const computed = window.getComputedStyle(el);
    const svg = el.querySelector('svg');
    const svgFill = svg ? window.getComputedStyle(svg).fill : null;
    return {
      bgColor: computed.backgroundColor,
      borderRadius: computed.borderRadius,
      svgFill: svgFill
    };
  });
  console.log('Floating WhatsApp Button styles:', whatsappStyles);

  // Scroll to categories and screenshot
  await page.evaluate(() => window.scrollTo(0, 650));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/categories-and-whatsapp-desktop.png' });

  // Mobile check
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 600));
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: 'scripts/categories-and-whatsapp-mobile.png' });

  await browser.close();
  console.log('Verification completed successfully.');
}

run();
