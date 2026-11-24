import http from 'http';

interface TestResult {
  name: string;
  url: string;
  status: number;
  passed: boolean;
  notes: string;
}

const BASE_URL = 'http://127.0.0.1:3006';

async function fetchRoute(path: string): Promise<{ status: number; text: string; json?: any; headers: any }> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  const text = await res.text();
  let json: any = undefined;
  try {
    json = JSON.parse(text);
  } catch (e) {
    // not json
  }
  return { status: res.status, text, json, headers: Object.fromEntries(res.headers.entries()) };
}

async function verifyAll() {
  console.log('Testing Production HTTP Server on port 3006...\n');
  const results: TestResult[] = [];

  // Check 1: Homepage (GET /)
  {
    const r = await fetchRoute('/');
    const hasProducts = r.text.includes('Aura Curved') || r.text.includes('Bestselling Furniture');
    results.push({
      name: 'Check 1: Homepage loads & contains products',
      url: '/',
      status: r.status,
      passed: r.status === 200 && hasProducts,
      notes: hasProducts ? 'Homepage returned 200 and rendered products' : 'Missing expected content'
    });
  }

  // Check 2: Shop (GET /shop)
  {
    const r = await fetchRoute('/shop');
    const hasShop = r.text.includes('All Furniture') || r.text.includes('Aura Curved');
    results.push({
      name: 'Check 2: Shop page loads & lists products',
      url: '/shop',
      status: r.status,
      passed: r.status === 200 && hasShop,
      notes: hasShop ? 'Shop returned 200 and contains catalog' : 'Missing expected content'
    });
  }

  // Check 3: Category page (GET /category/sofas)
  {
    const r = await fetchRoute('/category/sofas');
    const hasSofas = r.text.includes('Sofas') && (r.text.includes('Aura Curved') || r.text.includes('Linear Teakwood'));
    results.push({
      name: 'Check 3: Category page (/category/sofas)',
      url: '/category/sofas',
      status: r.status,
      passed: r.status === 200 && hasSofas,
      notes: hasSofas ? 'Category returned 200 and filtered sofa products' : 'Missing category content'
    });
  }

  // Check 4a: Product detail by slug (GET /product/aura-curved-boucle-sofa)
  {
    const r = await fetchRoute('/product/aura-curved-boucle-sofa');
    const hasProduct = r.text.includes('Aura Curved Boucl');
    results.push({
      name: 'Check 4a: Product detail page resolves slug',
      url: '/product/aura-curved-boucle-sofa',
      status: r.status,
      passed: r.status === 200 && hasProduct,
      notes: hasProduct ? 'Resolved product details by slug' : 'Failed to resolve by slug'
    });
  }

  // Check 4b: Product detail by legacy ID (GET /product/mnc-sof-01)
  {
    const r = await fetchRoute('/product/mnc-sof-01');
    const hasProduct = r.text.includes('Aura Curved Boucl');
    results.push({
      name: 'Check 4b: Product detail page resolves legacy ID',
      url: '/product/mnc-sof-01',
      status: r.status,
      passed: r.status === 200 && hasProduct,
      notes: hasProduct ? 'Resolved product details by legacyId' : 'Failed to resolve by legacyId'
    });
  }

  // Check 4c: Product detail invalid ID returns 404 (GET /product/non-existent-product)
  {
    const r = await fetchRoute('/product/non-existent-product');
    results.push({
      name: 'Check 4c: Invalid product returns 404',
      url: '/product/non-existent-product',
      status: r.status,
      passed: r.status === 404,
      notes: r.status === 404 ? 'Correctly returned 404 Not Found' : `Unexpected status: ${r.status}`
    });
  }

  // Check 5: Collections page (GET /collections)
  {
    const r = await fetchRoute('/collections');
    const hasCollections = r.text.includes('Curated Collections') && r.text.includes('Modern Living Collection');
    results.push({
      name: 'Check 5: Collections page loads & resolves suites',
      url: '/collections',
      status: r.status,
      passed: r.status === 200 && hasCollections,
      notes: hasCollections ? 'Collections returned 200 and rendered suite data' : 'Missing collections'
    });
  }

  // Check 7a: Public API /api/products returns active products
  {
    const r = await fetchRoute('/api/products');
    const isSuccess = r.json?.success === true;
    const total = r.json?.total || 0;
    const allActive = r.json?.data?.every((p: any) => p.isActive !== false);
    results.push({
      name: 'Check 7a: API /api/products returns active products',
      url: '/api/products',
      status: r.status,
      passed: r.status === 200 && isSuccess && total > 0 && allActive,
      notes: `Returned ${total} products, all active: ${allActive}`
    });
  }

  // Check 7b: Public API /api/products/[id] with legacyId
  {
    const r = await fetchRoute('/api/products/mnc-sof-01');
    const isSuccess = r.json?.success === true;
    const match = r.json?.data?.legacyId === 'mnc-sof-01';
    results.push({
      name: 'Check 7b: API /api/products/[id] by legacyId',
      url: '/api/products/mnc-sof-01',
      status: r.status,
      passed: r.status === 200 && isSuccess && match,
      notes: match ? `Resolved "${r.json?.data?.name}" via legacyId` : 'Failed to match'
    });
  }

  // Check 7c: Public API /api/products/[id] by slug
  {
    const r = await fetchRoute('/api/products/aura-curved-boucle-sofa');
    const isSuccess = r.json?.success === true;
    const match = r.json?.data?.slug === 'aura-curved-boucle-sofa';
    results.push({
      name: 'Check 7c: API /api/products/[id] by slug',
      url: '/api/products/aura-curved-boucle-sofa',
      status: r.status,
      passed: r.status === 200 && isSuccess && match,
      notes: match ? `Resolved "${r.json?.data?.name}" via slug` : 'Failed to match'
    });
  }

  // Check 7d: Public API /api/categories returns categories
  {
    const r = await fetchRoute('/api/categories');
    const isSuccess = r.json?.success === true;
    const total = r.json?.total || 0;
    results.push({
      name: 'Check 7d: API /api/categories',
      url: '/api/categories',
      status: r.status,
      passed: r.status === 200 && isSuccess && total >= 12,
      notes: `Returned ${total} categories`
    });
  }

  // Check 7e: Public API /api/collections returns collections
  {
    const r = await fetchRoute('/api/collections');
    const isSuccess = r.json?.success === true;
    const total = r.json?.total || 0;
    results.push({
      name: 'Check 7e: API /api/collections',
      url: '/api/collections',
      status: r.status,
      passed: r.status === 200 && isSuccess && total >= 4,
      notes: `Returned ${total} collections`
    });
  }

  // Check 8: No internal fields (__v) or credentials in API responses
  {
    const r = await fetchRoute('/api/products');
    const data = r.json?.data || [];
    const hasV = data.some((p: any) => '__v' in p);
    const hasUri = JSON.stringify(r.json).includes('mongodb+srv') || JSON.stringify(r.json).includes('cluster0');
    results.push({
      name: 'Check 8: API responses sanitized (no __v, no secrets)',
      url: '/api/products',
      status: r.status,
      passed: !hasV && !hasUri,
      notes: `__v present: ${hasV}, DB secrets present: ${hasUri}`
    });
  }

  console.log('--- RESULTS SUMMARY ---');
  let allPassed = true;
  for (const res of results) {
    const symbol = res.passed ? '✓' : '✗';
    console.log(`${symbol} [${res.status}] ${res.name}: ${res.notes}`);
    if (!res.passed) allPassed = false;
  }
  console.log('\nAll tests passed:', allPassed);
  process.exit(allPassed ? 0 : 1);
}

verifyAll().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
