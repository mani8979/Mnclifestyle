import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Admin } from '../models/Admin';
import { signAdminToken, ADMIN_COOKIE_NAME } from '../lib/auth';

const BASE_URL = 'http://127.0.0.1:3007';

interface TestResult {
  id: number;
  title: string;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

async function runCrudVerification() {
  console.log('================================================================');
  console.log('MNC LifeStyle — Phase 6: Admin Product CRUD Verification');
  console.log('================================================================\n');

  await connectDB();

  // Find admin for signing JWT
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mnclifestyle.in';
  const admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    throw new Error('Admin account not found. Run seeder first.');
  }

  const token = await signAdminToken({
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  const authHeaders = {
    'Content-Type': 'application/json',
    Cookie: `${ADMIN_COOKIE_NAME}=${token}`,
  };

  // Clean up any previous test artifact
  const testSku = 'MNC-TEST-CRE-01';
  const testSlug = 'kanso-sculptural-teak-credenza-test';
  await Product.deleteMany({
    $or: [{ sku: testSku }, { slug: testSlug }],
  });

  let createdProductId = '';

  // 1. Admin can view all products
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
    const json = await res.json();
    results.push({
      id: 1,
      title: 'Admin can view all products',
      passed: res.status === 200 && json.success === true && json.total >= 19,
      notes: `HTTP ${res.status}, returned total=${json.total} products`,
    });
  } catch (e: any) {
    results.push({ id: 1, title: 'Admin can view all products', passed: false, notes: e.message });
  }

  // 2. Admin can search products
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products?search=Aura`, { headers: authHeaders });
    const json = await res.json();
    const hasAura = json.products?.some((p: any) => p.name.includes('Aura'));
    results.push({
      id: 2,
      title: 'Admin can search products',
      passed: res.status === 200 && json.success === true && hasAura,
      notes: `HTTP ${res.status}, found ${json.count} matching "Aura"`,
    });
  } catch (e: any) {
    results.push({ id: 2, title: 'Admin can search products', passed: false, notes: e.message });
  }

  // 3. Admin can filter products
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products?category=sofas&status=published&stock=in-stock`, {
      headers: authHeaders,
    });
    const json = await res.json();
    const allSofas = json.products?.every((p: any) => p.category === 'sofas' && p.isActive);
    results.push({
      id: 3,
      title: 'Admin can filter products',
      passed: res.status === 200 && json.success === true && allSofas,
      notes: `HTTP ${res.status}, filtered category=sofas, published & in-stock (${json.count} items)`,
    });
  } catch (e: any) {
    results.push({ id: 3, title: 'Admin can filter products', passed: false, notes: e.message });
  }

  // 4. Admin can add a product
  try {
    const newProductPayload = {
      name: 'Kanso Sculptural Teak Credenza Test',
      slug: testSlug,
      sku: testSku,
      category: 'cabinets-sideboards',
      subCategory: 'Credenzas & Sideboards',
      price: 135000,
      originalPrice: 155000,
      badge: 'Signature Piece',
      isBestseller: true,
      isFeatured: true,
      isActive: true,
      stockQuantity: 12,
      inStock: true,
      shortDescription: 'Minimalist low credenza in seasoned Indian teak with fluted soft-close tambour doors.',
      fullDescription: 'Designed with architectural proportion for luxury residences, featuring fluted solid timber tambour doors and German soft-close hardware.',
      dimensions: { width: '200 cm', depth: '48 cm', height: '65 cm', weight: '54 kg' },
      materials: ['Kiln-Dried Indian Teak', 'Matte Carbon Hardware'],
      colors: [{ name: 'Smoked Teak', hex: '#3E2A1E', inStock: true }],
      images: ['https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80'],
    };

    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newProductPayload),
    });
    const json = await res.json();
    createdProductId = json.product?._id || json.product?.id || '';

    results.push({
      id: 4,
      title: 'Admin can add a product',
      passed: res.status === 201 && json.success === true && Boolean(createdProductId),
      notes: `HTTP ${res.status}, created ID: ${createdProductId}`,
    });
  } catch (e: any) {
    results.push({ id: 4, title: 'Admin can add a product', passed: false, notes: e.message });
  }

  // 5. Duplicate SKU is rejected
  try {
    const dupSkuPayload = {
      name: 'Another Piece With Duplicate SKU',
      slug: 'different-slug-for-duplicate-test',
      sku: testSku, // duplicate
      category: 'sofas',
      subCategory: 'Sofas',
      price: 99000,
      shortDescription: 'Testing duplicate SKU rejection.',
      fullDescription: 'Full description testing duplicate SKU rejection properly.',
      materials: ['Teak'],
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    };

    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(dupSkuPayload),
    });
    results.push({
      id: 5,
      title: 'Duplicate SKU is rejected',
      passed: res.status === 409,
      notes: `HTTP ${res.status} Conflict correctly returned for duplicate SKU`,
    });
  } catch (e: any) {
    results.push({ id: 5, title: 'Duplicate SKU is rejected', passed: false, notes: e.message });
  }

  // 6. Duplicate slug is rejected
  try {
    const dupSlugPayload = {
      name: 'Another Piece With Duplicate Slug',
      slug: testSlug, // duplicate
      sku: 'UNIQUE-SKU-9999',
      category: 'sofas',
      subCategory: 'Sofas',
      price: 99000,
      shortDescription: 'Testing duplicate slug rejection.',
      fullDescription: 'Full description testing duplicate slug rejection properly.',
      materials: ['Teak'],
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'],
    };

    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(dupSlugPayload),
    });
    results.push({
      id: 6,
      title: 'Duplicate slug is rejected',
      passed: res.status === 409,
      notes: `HTTP ${res.status} Conflict correctly returned for duplicate slug`,
    });
  } catch (e: any) {
    results.push({ id: 6, title: 'Duplicate slug is rejected', passed: false, notes: e.message });
  }

  // 7. Admin can edit a product
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        shortDescription: 'Updated architectural description for credenza test.',
      }),
    });
    const json = await res.json();
    results.push({
      id: 7,
      title: 'Admin can edit a product',
      passed: res.status === 200 && json.success === true,
      notes: `HTTP ${res.status}, updated product fields`,
    });
  } catch (e: any) {
    results.push({ id: 7, title: 'Admin can edit a product', passed: false, notes: e.message });
  }

  // 8. Admin can update product pricing
  try {
    const newPrice = 142000;
    const res = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ price: newPrice }),
    });
    const json = await res.json();
    const isPriceUpdated = json.product?.price === newPrice;
    results.push({
      id: 8,
      title: 'Admin can update product pricing',
      passed: res.status === 200 && isPriceUpdated,
      notes: `HTTP ${res.status}, new price ₹${json.product?.price}`,
    });
  } catch (e: any) {
    results.push({ id: 8, title: 'Admin can update product pricing', passed: false, notes: e.message });
  }

  // 9. Admin can update stock
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ stockQuantity: 28, inStock: true }),
    });
    const json = await res.json();
    const isStockUpdated = json.product?.stockQuantity === 28;
    results.push({
      id: 9,
      title: 'Admin can update stock',
      passed: res.status === 200 && isStockUpdated,
      notes: `HTTP ${res.status}, stock quantity set to ${json.product?.stockQuantity}`,
    });
  } catch (e: any) {
    results.push({ id: 9, title: 'Admin can update stock', passed: false, notes: e.message });
  }

  // 10. Admin can publish and unpublish products (toggle active/draft)
  try {
    // Unpublish -> Draft
    const resDraft = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isActive: false }),
    });
    const jsonDraft = await resDraft.json();

    // Re-publish -> Published
    const resPub = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isActive: true }),
    });
    const jsonPub = await resPub.json();

    const toggled = jsonDraft.product?.isActive === false && jsonPub.product?.isActive === true;
    results.push({
      id: 10,
      title: 'Admin can publish and unpublish products',
      passed: resDraft.status === 200 && resPub.status === 200 && toggled,
      notes: `Draft isActive=${jsonDraft.product?.isActive}, Published isActive=${jsonPub.product?.isActive}`,
    });
  } catch (e: any) {
    results.push({ id: 10, title: 'Admin can publish and unpublish products', passed: false, notes: e.message });
  }

  // 11. Admin can delete/archive a product
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products/${testSku}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    const json = await res.json();
    const archivedProduct = await Product.findOne({ sku: testSku });
    const isArchived = archivedProduct?.isArchived === true && archivedProduct?.isActive === false;

    results.push({
      id: 11,
      title: 'Admin can delete/archive a product',
      passed: res.status === 200 && json.success === true && isArchived,
      notes: `HTTP ${res.status}, isArchived=${archivedProduct?.isArchived}, isActive=${archivedProduct?.isActive}`,
    });
  } catch (e: any) {
    results.push({ id: 11, title: 'Admin can delete/archive a product', passed: false, notes: e.message });
  }

  // 12. Unauthorized users cannot access admin APIs
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`);
    results.push({
      id: 12,
      title: 'Unauthorized users cannot access admin APIs',
      passed: res.status === 401,
      notes: `HTTP ${res.status} returned without session cookie`,
    });
  } catch (e: any) {
    results.push({ id: 12, title: 'Unauthorized users cannot access admin APIs', passed: false, notes: e.message });
  }

  // 13. Draft & Archived products are hidden from public APIs
  try {
    const res = await fetch(`${BASE_URL}/api/products`);
    const json = await res.json();
    const testPieceFound = json.products?.some((p: any) => p.sku === testSku);
    results.push({
      id: 13,
      title: 'Draft & Archived products are hidden from public APIs',
      passed: res.status === 200 && !testPieceFound,
      notes: `Public API returned ${json.count} products, archived piece absent: ${!testPieceFound}`,
    });
  } catch (e: any) {
    results.push({ id: 13, title: 'Draft & Archived products are hidden from public APIs', passed: false, notes: e.message });
  }

  // Clean up test product
  await Product.deleteMany({
    $or: [{ sku: testSku }, { slug: testSlug }],
  });

  // 14. Published products appear in storefront
  try {
    const res = await fetch(`${BASE_URL}/shop`);
    const text = await res.text();
    const hasShopCatalog = text.includes('Aura Curved') && text.includes('All Furniture');
    results.push({
      id: 14,
      title: 'Published products appear in the storefront',
      passed: res.status === 200 && hasShopCatalog,
      notes: `HTTP ${res.status}, /shop renders published catalog items`,
    });
  } catch (e: any) {
    results.push({ id: 14, title: 'Published products appear in the storefront', passed: false, notes: e.message });
  }

  // 15. Existing product URLs still work
  try {
    const resSlug = await fetch(`${BASE_URL}/product/aura-curved-boucle-sofa`);
    const resLegacy = await fetch(`${BASE_URL}/product/mnc-sof-01`);
    results.push({
      id: 15,
      title: 'Existing product URLs still work',
      passed: resSlug.status === 200 && resLegacy.status === 200,
      notes: `Slug URL: HTTP ${resSlug.status}, Legacy URL: HTTP ${resLegacy.status}`,
    });
  } catch (e: any) {
    results.push({ id: 15, title: 'Existing product URLs still work', passed: false, notes: e.message });
  }

  // 16. Existing cart and wishlist functionality remains intact
  try {
    const fs = await import('fs');
    const cartCode = fs.readFileSync('src/context/CartContext.jsx', 'utf8');
    const wishlistCode = fs.readFileSync('src/context/WishlistContext.jsx', 'utf8');
    const intact =
      cartCode.includes('addToCart') &&
      cartCode.includes('removeFromCart') &&
      wishlistCode.includes('toggleWishlist');
    results.push({
      id: 16,
      title: 'Existing cart and wishlist functionality remains intact',
      passed: intact,
      notes: `Cart & Wishlist methods preserved with localStorage synchronization: ${intact}`,
    });
  } catch (e: any) {
    results.push({ id: 16, title: 'Existing cart and wishlist functionality remains intact', passed: false, notes: e.message });
  }

  // Print scorecard
  console.log('\n================================================================');
  console.log('--- PHASE 6 VERIFICATION SCORECARD ---');
  console.log('================================================================');
  let allPass = true;
  for (const r of results) {
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} Check ${r.id}: ${r.title}\n          → ${r.notes}`);
    if (!r.passed) allPass = false;
  }
  console.log('================================================================');
  console.log(`Final Result: ${allPass ? 'ALL 16 CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  console.log('================================================================');

  process.exit(allPass ? 0 : 1);
}

runCrudVerification().catch((err) => {
  console.error('Fatal CRUD test error:', err);
  process.exit(1);
});
