import puppeteer from 'puppeteer-core';

async function testShopTheLook() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Locate all H2s
  const headings = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim());
  });
  console.log('Found h2s on homepage:', headings);

  // Check buttons/pins inside the photograph
  const dotsInPhoto = await page.evaluate(() => {
    const photoContainer = document.querySelector('.aspect-\\[16\\/10\\]');
    if (!photoContainer) return -1;
    const buttons = photoContainer.querySelectorAll('button');
    return buttons.length;
  });
  console.log('Hotspot buttons/dots inside photo container:', dotsInPhoto);

  // Check pieces in this room buttons
  const pieceButtons = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.textContent.includes('Sofa') || b.textContent.includes('Table') || b.textContent.includes('Chair')
    );
    return buttons.map(b => b.textContent.trim());
  });
  console.log('Piece selector buttons:', pieceButtons);

  // Click Kanso Travertine Table
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button')).filter(b => 
      b.textContent.includes('Table')
    );
    if (buttons[0]) buttons[0].click();
  });
  await new Promise(r => setTimeout(r, 400));

  const activeTitle = await page.evaluate(() => {
    const title = document.querySelector('.bg-\\[\\#F8F0E8\\]\\/70 h4');
    return title ? title.textContent.trim() : null;
  });
  console.log('Active product after clicking table:', activeTitle);

  // Screenshot section
  const sectionEl = await page.evaluateHandle(() => {
    const h2s = Array.from(document.querySelectorAll('h2'));
    const target = h2s.find(h => h.textContent.includes('Shop The Living Room Suite'));
    return target ? target.closest('section') : null;
  });
  
  if (sectionEl) {
    await sectionEl.screenshot({ path: 'scripts/shop-the-look-verified.png' });
    console.log('Screenshot saved to scripts/shop-the-look-verified.png');
  }

  console.log('Console errors:', errors);
  await browser.close();
}

testShopTheLook().catch(console.error);

