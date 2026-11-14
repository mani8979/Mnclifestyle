import puppeteer from 'puppeteer-core';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  // scroll to category section
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const catHeading = headings.find(h => h.textContent.includes('Shop by Category'));
    if (catHeading) {
      catHeading.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'local_category_section.png', fullPage: false });

  // Let's also check category card texts and img sources
  const cardsData = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const catHeading = headings.find(h => h.textContent.includes('Shop by Category'));
    if (!catHeading) return 'No heading found';
    const section = catHeading.closest('section');
    if (!section) return 'No section found';
    const links = Array.from(section.querySelectorAll('a[href^="/category/"]'));
    return links.map(l => ({
      href: l.getAttribute('href'),
      text: l.innerText.trim(),
      imgSrc: l.querySelector('img') ? l.querySelector('img').src : null,
      imgNaturalWidth: l.querySelector('img') ? l.querySelector('img').naturalWidth : 0
    }));
  });

  console.log('Cards data:', JSON.stringify(cardsData, null, 2));

  // Check floating whatsapp button
  const waData = await page.evaluate(() => {
    const waList = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
    return waList.map(wa => {
      const style = window.getComputedStyle(wa);
      return {
        href: wa.getAttribute('href'),
        bg: style.backgroundColor,
        classes: wa.className
      };
    });
  });
  console.log('WhatsApp buttons data:', JSON.stringify(waData, null, 2));

  await browser.close();
})();
