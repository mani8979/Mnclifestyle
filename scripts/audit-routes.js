import puppeteer from 'puppeteer-core';
import fs from 'fs';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const routes = [
  '/',
  '/shop',
  '/category/living-room',
  '/category/bedroom',
  '/category/dining',
  '/category/office',
  '/category/coffee-tables',
  '/category/storage',
  '/collections',
  '/about',
  '/contact',
  '/product/mnc-liv-01',
];

async function auditRoutes() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = {};

  for (const route of routes) {
    const page = await browser.newPage();
    const consoleLogs = [];
    const pageErrors = [];
    const failedRequests = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.toString()));
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), failure: req.failure()?.errorText }));

    try {
      await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle0', timeout: 10000 });
      
      const audit = await page.evaluate(() => {
        const title = document.title;
        const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
        const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim());
        const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim());
        const links = Array.from(document.querySelectorAll('a')).map(a => ({ text: a.innerText.trim(), href: a.getAttribute('href') }));
        const images = Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          hasAlt: img.hasAttribute('alt'),
          complete: img.complete,
          naturalWidth: img.naturalWidth
        }));
        const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
          text: b.innerText.trim(),
          ariaLabel: b.getAttribute('aria-label'),
          hasAccessibleName: !!(b.innerText.trim() || b.getAttribute('aria-label'))
        }));
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;

        return {
          title,
          metaDesc,
          h1s,
          h2s,
          linkCount: links.length,
          brokenHrefs: links.filter(l => !l.href || l.href === '#' || l.href === 'javascript:void(0)'),
          imageCount: images.length,
          missingAlt: images.filter(i => !i.hasAlt || i.alt.trim() === ''),
          brokenImages: images.filter(i => i.complete && i.naturalWidth === 0),
          buttonCount: buttons.length,
          unlabeledButtons: buttons.filter(b => !b.hasAccessibleName),
          hasOverflow: scrollWidth > innerWidth,
          scrollWidth,
          innerWidth
        };
      });

      results[route] = {
        status: pageErrors.length > 0 ? 'CRASHED' : 'OK',
        pageErrors,
        consoleLogs,
        failedRequests,
        ...audit
      };
    } catch (e) {
      results[route] = {
        status: 'TIMEOUT / FAILED',
        error: e.toString(),
        pageErrors,
        consoleLogs,
        failedRequests
      };
    } finally {
      await page.close();
    }
  }

  await browser.close();
  fs.writeFileSync('D:/Furtner/audit-results-routes.json', JSON.stringify(results, null, 2));
  console.log('Route audit complete. Written to audit-results-routes.json');
}

auditRoutes().catch(console.error);

