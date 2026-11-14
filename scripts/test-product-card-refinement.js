import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('🔍 Testing Product Card UI/UX Refinements...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  try {
    // 1. Desktop View (1440x900)
    console.log('\n--- 1. Testing Desktop (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle0' });

    // Verify badges are NOT inside the image container
    const badgesInImage = await page.$$eval('.aspect-\\[4\\/3\\] span', els => els.map(e => e.innerText));
    console.log('Badges found inside image container:', badgesInImage);
    if (badgesInImage.length === 0) {
      console.log('✅ 100% CLEAN PHOTOGRAPHS: Zero badges, text, or overlays on furniture photos!');
    } else {
      console.error('❌ Found elements on image:', badgesInImage);
    }

    // Inspect first product card's text structure
    const cardData = await page.evaluate(() => {
      const card = document.querySelector('.group.relative.flex.flex-col');
      if (!card) return null;
      return {
        text: card.innerText,
        allSpans: Array.from(card.querySelectorAll('span')).map(s => s.innerText),
        hasViewDetailsBtn: !!card.querySelector('a[href^="/product/"]'),
        btnText: card.querySelector('.group\\/btn')?.innerText || ''
      };
    });

    console.log('\nSample Product Card Text breakdown:\n' + cardData.text);
    console.log('View Details Button text:', cardData.btnText);

    // Take screenshot of desktop shop product grid
    await page.screenshot({ path: 'scripts/desktop-product-cards.png', fullPage: false });
    console.log('📸 Desktop product cards screenshot saved to scripts/desktop-product-cards.png');

    // 2. Mobile View (375x812 - iPhone X / 11)
    console.log('\n--- 2. Testing Mobile (375x812) ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(`${BASE_URL}/shop`, { waitUntil: 'networkidle0' });

    const mobileMetrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    }));
    console.log('Mobile horizontal overflow:', mobileMetrics.hasOverflow ? 'YES (FAIL)' : 'NO (PASS)');

    await page.screenshot({ path: 'scripts/mobile-product-cards.png', fullPage: false });
    console.log('📸 Mobile product cards screenshot saved to scripts/mobile-product-cards.png');

    // 3. Homepage Bestsellers section
    console.log('\n--- 3. Testing Homepage Bestsellers ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Scroll down to bestsellers
    await page.evaluate(() => {
      const bestsellersSection = document.querySelector('h2');
      if (bestsellersSection) bestsellersSection.scrollIntoView();
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: 'scripts/homepage-bestsellers-refined.png', fullPage: false });
    console.log('📸 Homepage bestsellers screenshot saved.');

    // 4. Runtime errors check
    if (errors.length === 0) {
      console.log('\n✅ ZERO runtime errors detected!');
    } else {
      console.error('Errors:', errors);
    }

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

test();

