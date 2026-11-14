import puppeteer from 'puppeteer-core';

(async () => {
  console.log('Testing Desktop SHOP dropdown...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Click on SHOP button in desktop navigation
  const shopBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('SHOP'));
  });

  if (shopBtn) {
    await shopBtn.click();
    await new Promise(r => setTimeout(r, 600));
  }

  const dropdownData = await page.evaluate(() => {
    const menu = document.querySelector('[role="menu"]');
    if (!menu) return { open: false };
    const text = menu.innerText;
    return {
      open: true,
      hasShopByCollection: /Shop by Collection/i.test(text),
      hasSignatureCollection: /Signature Collection/i.test(text),
      hasShopByCategory: /Shop by Category/i.test(text),
      menuText: text
    };
  });

  console.log('Dropdown Data:', dropdownData);
  await page.screenshot({ path: 'desktop_shop_dropdown.png' });

  await browser.close();

  if (dropdownData.hasShopByCollection || dropdownData.hasSignatureCollection) {
    console.error('❌ FAILURE: Shop by Collection is still present in desktop view!');
    process.exit(1);
  } else {
    console.log('✅ SUCCESS: Shop by Collection was successfully removed from desktop view!');
  }
})();
