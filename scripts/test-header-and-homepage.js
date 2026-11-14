import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://localhost:5173';

async function test() {
  console.log('🚀 Running Header & Homepage Verification Test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    // 1. Verify Homepage: Signature Collections completely removed
    console.log('\n--- 1. Testing Homepage (Removed Signature Collections) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    const pageContent = await page.content();
    const hasCuratedSuites = pageContent.includes('Curated Living Suites') || pageContent.includes('Signature Collections');
    console.log('Is "Signature Collections" on homepage?', hasCuratedSuites ? 'YES (FAIL)' : 'NO (PASSED - Completely Removed!)');

    // 2. Test Desktop ROOMS dropdown & selection
    console.log('\n--- 2. Testing Desktop ROOMS Dropdown & Option Selection ---');
    // Click on ROOMS button
    const roomsBtn = await page.$('button[aria-haspopup="true"]');
    if (!roomsBtn) throw new Error('ROOMS button not found on desktop header');

    await roomsBtn.click();
    await new Promise(r => setTimeout(r, 200));

    // Verify dropdown is visible and contains 12 categories
    const categoryLinksInDropdown = await page.$$eval('div[role="menu"] a[href^="/category/"]', els => els.map(e => e.innerText.trim()));
    console.log(`Dropdown opened with ${categoryLinksInDropdown.length} category options.`);
    console.log('First 4 options:', categoryLinksInDropdown.slice(0, 4));

    // Click on "Sofas" option in dropdown
    const sofasOption = await page.$('div[role="menu"] a[href="/category/sofas"]');
    if (!sofasOption) throw new Error('Sofas option not found in dropdown');

    console.log('Clicking "Sofas" option in dropdown...');
    await sofasOption.click();
    await page.waitForFunction(() => window.location.pathname.includes('/category/sofas'));

    const currentUrl = page.url();
    console.log('Current URL after selecting option:', currentUrl);
    const heading = await page.$eval('h1', el => el.innerText);
    console.log('Category page heading:', heading);

    // 3. Test Mobile Navigation Drawer & ROOMS accordion
    console.log('\n--- 3. Testing Mobile Navigation Drawer & ROOMS Accordion ---');
    await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });

    // Click hamburger button
    const hamburgerBtn = await page.$('button[aria-label="Toggle navigation menu"]');
    if (!hamburgerBtn) throw new Error('Hamburger button not found');
    await hamburgerBtn.click();
    await new Promise(r => setTimeout(r, 300));

    // Verify main navigation links show normally
    const mobileLinks = await page.$$eval('nav.flex-col > *', els => els.map(e => e.innerText.trim().split('\n')[0]));
    console.log('Mobile navigation items showing normally:', mobileLinks);

    // Click on "Rooms" in mobile drawer
    const mobileRoomsBtn = await page.$('nav.flex-col button[aria-expanded]');
    if (!mobileRoomsBtn) throw new Error('Mobile Rooms button not found');

    console.log('Clicking "Rooms" accordion button in mobile drawer...');
    await mobileRoomsBtn.click();
    await new Promise(r => setTimeout(r, 250));

    // Verify dropdown accordion is opened with categories
    const mobileCategories = await page.$$eval('nav.flex-col a[href^="/category/"]', els => els.map(e => e.innerText.trim()));
    console.log(`Mobile Rooms accordion expanded with ${mobileCategories.length} categories:`, mobileCategories.slice(0, 3));

    // Click on "Beds" inside mobile accordion
    const mobileBedsLink = await page.$('nav.flex-col a[href="/category/beds"]');
    if (!mobileBedsLink) throw new Error('Beds link not found in mobile accordion');

    console.log('Clicking "Beds" category inside mobile accordion...');
    await mobileBedsLink.click();
    await page.waitForFunction(() => window.location.pathname.includes('/category/beds'));

    console.log('Mobile navigated URL:', page.url());
    const bedsHeading = await page.$eval('h1', el => el.innerText);
    console.log('Mobile navigated page heading:', bedsHeading);

    // Take screenshot
    await page.screenshot({ path: 'scripts/mobile-rooms-navigated.png' });
    console.log('📸 Mobile navigated screenshot saved.');

    // 4. Check errors
    console.log('\n--- 4. Runtime Errors ---');
    if (errors.length === 0) {
      console.log('✅ ZERO runtime errors detected!');
    } else {
      console.error('Errors:', errors);
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
}

test();
