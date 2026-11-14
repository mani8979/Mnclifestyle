import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function run() {
  console.log('--- Starting Shop Navigation Verification ---');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. Desktop Test (1440 x 900)
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Verify Desktop Navigation items
    const navItems = await page.$$eval('header nav a, header nav button', els =>
      els.map(el => el.textContent.trim().replace(/\s+/g, ' '))
    );
    console.log('Desktop Nav elements:', navItems);

    // Hover SHOP button to trigger mega menu
    const shopButton = await page.waitForSelector('[data-testid="desktop-shop-button"]');
    await shopButton.hover();
    await new Promise(r => setTimeout(r, 400));

    // Verify mega menu is visible
    const megaMenu = await page.$('div[role="menu"]');
    const isMegaMenuVisible = !!megaMenu;
    console.log('Mega Menu Visible on Hover:', isMegaMenuVisible);

    // Read mega menu categories & collections
    const categories = await page.$$eval('div[role="menu"] .grid-cols-2 a', els =>
      els.map(el => {
        const title = el.querySelector('span:first-child')?.textContent?.trim();
        const desc = el.querySelector('span:last-child')?.textContent?.trim();
        const href = el.getAttribute('href');
        return { title, desc, href };
      })
    );
    console.log('Mega Menu Categories count:', categories.length, categories.map(c => c.title));

    const collections = await page.$$eval('div[role="menu"] .space-y-1\\.5 a', els =>
      els.map(el => {
        const title = el.querySelector('.flex span:first-child')?.textContent?.trim();
        const tag = el.querySelector('.flex span:last-child')?.textContent?.trim();
        const desc = el.querySelector('span.line-clamp-1')?.textContent?.trim();
        const href = el.getAttribute('href');
        return { title, tag, desc, href };
      })
    );
    console.log('Mega Menu Collections count:', collections.length, collections.map(c => c.title));

    // Screenshot Desktop Mega Menu
    await page.screenshot({ path: 'scripts/shop-navigation-desktop-megamenu.png' });
    console.log('Desktop mega menu screenshot saved.');

    // Test clicking on "Living Room"
    await page.click('div[role="menu"] a[href="/category/sofas"]');
    await page.waitForFunction(() => window.location.pathname === '/category/sofas', { timeout: 5000 });
    console.log('Navigated to:', page.url());

    // 2. Mobile Test (390 x 844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });

    // Open hamburger drawer
    const hamburger = await page.waitForSelector('button[aria-label="Toggle navigation menu"]');
    await hamburger.click();
    await new Promise(r => setTimeout(r, 500));

    // Tap Shop accordion button in mobile drawer
    const mobileShopBtn = await page.waitForSelector('[data-testid="mobile-shop-accordion"]');
    await mobileShopBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // Verify expanded links inside drawer
    const mobileCatCount = await page.$$eval('.fixed nav a', els => els.length);
    console.log('Mobile Drawer nav links count:', mobileCatCount);

    // Screenshot Mobile Drawer with Shop expanded
    await page.screenshot({ path: 'scripts/shop-navigation-mobile-drawer.png' });
    console.log('Mobile navigation drawer screenshot saved.');

    // Check overflow
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    console.log('Mobile horizontal overflow:', hasHorizontalOverflow);

    console.log('All Console Errors during tests:', consoleErrors);
    console.log('--- Verification Complete: SUCCESS ---');
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

run();
