import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { InventoryMovement } from '../models/InventoryMovement';
import { Admin } from '../models/Admin';
import { signAdminToken, ADMIN_COOKIE_NAME } from '../lib/auth';

const BASE_URL = 'http://127.0.0.1:3007';

interface CheckItem {
  id: number;
  title: string;
  passed: boolean;
  notes: string;
}

const results: CheckItem[] = [];

async function runInventoryTests() {
  console.log('================================================================');
  console.log('MNC LifeStyle — Phase 8: Inventory & Stock Management Verification');
  console.log('================================================================\n');

  await connectDB();

  // 1. Admin Session Setup
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mnclifestyle.in';
  const admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    throw new Error('Admin user not found. Ensure Phase 5 admin is seeded.');
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

  const testSku = 'MNC-INV-TEST-99';
  const testSlug = 'artisan-inventory-test-chair';

  // Clean any previous test artifacts
  await Product.deleteMany({ sku: testSku });
  await InventoryMovement.deleteMany({ sku: testSku });

  // Create isolated test product
  const testProduct = await Product.create({
    name: 'Artisan Atelier Inventory Test Chair',
    slug: testSlug,
    sku: testSku,
    category: 'study-and-computer-tables',
    categoryLabel: 'Study and Computer Tables',
    subCategory: 'Compact Study Desks',
    price: 45000,
    costPrice: 20000,
    stockQuantity: 10,
    reservedQuantity: 2,
    availableQuantity: 8,
    lowStockThreshold: 4,
    trackInventory: true,
    allowBackorders: false,
    isActive: true,
    inStock: true,
    shortDescription: 'Handcrafted luxury testing chair for Phase 8 inventory system.',
    fullDescription: 'Solid teak with architectural brass joinery used for automated verification.',
    materials: ['Solid Indian Teak', 'Full-Grain Leather'],
    images: ['https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80'],
  });

  const testId = testProduct._id.toString();

  // --------------------------------------------------------------------------
  // Check 1: Admin can access inventory dashboard
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/admin/inventory`, { headers: authHeaders });
    const text = await res.text();
    const hasWorkspace =
      res.url.includes('/admin/inventory') &&
      text.includes('Inventory Management') &&
      text.includes('Export Stock CSV');
    results.push({
      id: 1,
      title: 'Admin can access inventory dashboard',
      passed: res.status === 200 && hasWorkspace,
      notes: `HTTP ${res.status} (${res.url}), dedicated Inventory Management workspace rendered`,
    });
  } catch (e: any) {
    results.push({ id: 1, title: 'Admin can access inventory dashboard', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 2: Unauthorized users cannot access inventory APIs
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory`);
    results.push({
      id: 2,
      title: 'Unauthorized users cannot access inventory APIs',
      passed: res.status === 401,
      notes: `HTTP ${res.status} returned without cookie credentials`,
    });
  } catch (e: any) {
    results.push({ id: 2, title: 'Unauthorized users cannot access inventory APIs', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 3: Admin can view all inventory
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory?limit=50`, { headers: authHeaders });
    const json = await res.json();
    const hasItems = json.success === true && json.products.length >= 19;
    results.push({
      id: 3,
      title: 'Admin can view all inventory items',
      passed: hasItems,
      notes: `Retrieved ${json.products?.length} inventory items successfully`,
    });
  } catch (e: any) {
    results.push({ id: 3, title: 'Admin can view all inventory items', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 4: Admin can search by product name
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory?search=Atelier+Inventory+Test`, { headers: authHeaders });
    const json = await res.json();
    const found = json.products?.some((p: any) => p.sku === testSku);
    results.push({
      id: 4,
      title: 'Admin can search by product name',
      passed: res.status === 200 && found,
      notes: `Found test product by title search query`,
    });
  } catch (e: any) {
    results.push({ id: 4, title: 'Admin can search by product name', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 5: Admin can search by SKU
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory?search=${testSku}`, { headers: authHeaders });
    const json = await res.json();
    const found = json.products?.length === 1 && json.products[0].sku === testSku;
    results.push({
      id: 5,
      title: 'Admin can search by SKU',
      passed: res.status === 200 && found,
      notes: `Exact SKU lookup verified: ${testSku}`,
    });
  } catch (e: any) {
    results.push({ id: 5, title: 'Admin can search by SKU', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 6: Admin can filter by category
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory?category=study-and-computer-tables`, { headers: authHeaders });
    const json = await res.json();
    const allStudy = json.products?.every((p: any) => p.category === 'study-and-computer-tables' || p.categoryLabel === 'Study and Computer Tables');
    results.push({
      id: 6,
      title: 'Admin can filter by category',
      passed: res.status === 200 && allStudy && json.products.length > 0,
      notes: `Returned ${json.products?.length} category filtered items`,
    });
  } catch (e: any) {
    results.push({ id: 6, title: 'Admin can filter by category', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 7: Admin can add stock
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Stock Received',
        quantity: 5,
        reason: 'Testing workshop delivery batch',
        notes: 'Verification script step 7',
      }),
    });
    const json = await res.json();
    const newStockIs15 = json.product?.stockQuantity === 15;
    const availableIs13 = json.product?.availableQuantity === 13; // 15 - 2 reserved
    results.push({
      id: 7,
      title: 'Admin can add stock (Stock Received)',
      passed: res.status === 200 && newStockIs15 && availableIs13,
      notes: `Stock increased from 10 to 15 (Available: 13, Reserved: 2)`,
    });
  } catch (e: any) {
    results.push({ id: 7, title: 'Admin can add stock (Stock Received)', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 8: Admin can reduce stock
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Manual Reduction',
        quantity: 3,
        reason: 'Testing stock reduction',
      }),
    });
    const json = await res.json();
    const newStockIs12 = json.product?.stockQuantity === 12;
    results.push({
      id: 8,
      title: 'Admin can reduce stock (Manual Reduction)',
      passed: res.status === 200 && newStockIs12,
      notes: `Stock reduced from 15 to 12`,
    });
  } catch (e: any) {
    results.push({ id: 8, title: 'Admin can reduce stock (Manual Reduction)', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 9: Admin can set exact stock quantity
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Stock Correction',
        quantity: 8,
        reason: 'Warehouse physical audit count',
      }),
    });
    const json = await res.json();
    const newStockIs8 = json.product?.stockQuantity === 8;
    results.push({
      id: 9,
      title: 'Admin can set exact stock quantity (Stock Correction)',
      passed: res.status === 200 && newStockIs8,
      notes: `Set exact physical stock count to 8`,
    });
  } catch (e: any) {
    results.push({ id: 9, title: 'Admin can set exact stock quantity (Stock Correction)', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 10: Negative stock is rejected
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Manual Reduction',
        quantity: 50, // exceeds current stock 8
        reason: 'Oversell attempt test',
      }),
    });
    const json = await res.json();
    results.push({
      id: 10,
      title: 'Negative stock is rejected',
      passed: res.status === 400 && json.success === false,
      notes: `HTTP 400, correctly rejected: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 10, title: 'Negative stock is rejected', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 11: Stock cannot be reduced below reserved quantity
  // --------------------------------------------------------------------------
  try {
    // Current stock is 8, reserved is 2. Attempting to reduce by 7 would leave 1, which is < reserved (2)
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Manual Reduction',
        quantity: 7,
        reason: 'Reduction below reserved test',
      }),
    });
    const json = await res.json();
    results.push({
      id: 11,
      title: 'Stock cannot be reduced below reserved quantity',
      passed: res.status === 400 && json.success === false,
      notes: `HTTP 400, correctly protected reserved units: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 11, title: 'Stock cannot be reduced below reserved quantity', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 12: Low-stock detection works
  // --------------------------------------------------------------------------
  try {
    // Reduce physical stock to 5 (with 2 reserved => 3 available, which is <= lowStockThreshold of 4)
    await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        adjustmentType: 'Stock Correction',
        quantity: 5,
        reason: 'Lowering stock to trigger low-stock alert',
      }),
    });

    const res = await fetch(`${BASE_URL}/api/admin/inventory?status=low_stock`, { headers: authHeaders });
    const json = await res.json();
    const testFoundInLowStock = json.products?.some((p: any) => p.sku === testSku);
    results.push({
      id: 12,
      title: 'Low-stock detection works',
      passed: res.status === 200 && testFoundInLowStock,
      notes: `Available (3) <= Threshold (4): detected in low_stock filter`,
    });
  } catch (e: any) {
    results.push({ id: 12, title: 'Low-stock detection works', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 13: Out-of-stock detection works
  // --------------------------------------------------------------------------
  try {
    // Set stock to equal reserved quantity (5 stock, 5 reserved => 0 available)
    await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/reserve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 3, // 2 + 3 = 5 reserved
        reason: 'Deplete available stock for out-of-stock test',
      }),
    });

    const res = await fetch(`${BASE_URL}/api/admin/inventory?status=out_of_stock`, { headers: authHeaders });
    const json = await res.json();
    const testFoundInOutOfStock = json.products?.some((p: any) => p.sku === testSku);
    results.push({
      id: 13,
      title: 'Out-of-stock detection works',
      passed: res.status === 200 && testFoundInOutOfStock,
      notes: `Available (0) with allowBackorders=false: flagged as out_of_stock`,
    });
  } catch (e: any) {
    results.push({ id: 13, title: 'Out-of-stock detection works', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 14: Stock thresholds can be updated
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        lowStockThreshold: 8,
        costPrice: 22500,
        allowBackorders: true,
      }),
    });
    const json = await res.json();
    const updated = json.product?.lowStockThreshold === 8 && json.product?.costPrice === 22500;
    results.push({
      id: 14,
      title: 'Stock thresholds & settings can be updated',
      passed: res.status === 200 && updated,
      notes: `Updated threshold to 8, costPrice to ₹22,500, backorders=true`,
    });
  } catch (e: any) {
    results.push({ id: 14, title: 'Stock thresholds & settings can be updated', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 15: Movement history is created
  // --------------------------------------------------------------------------
  try {
    const count = await InventoryMovement.countDocuments({ sku: testSku });
    results.push({
      id: 15,
      title: 'Movement history is created',
      passed: count >= 4,
      notes: `Recorded ${count} immutable movement entries for test item`,
    });
  } catch (e: any) {
    results.push({ id: 15, title: 'Movement history is created', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 16: Movement history preserves previous quantities
  // --------------------------------------------------------------------------
  try {
    const movements = await InventoryMovement.find({ sku: testSku }).sort({ timestamp: 1 }).lean();
    const hasPreviousAndNew = movements.every(
      (m: any) => typeof m.previousQuantity === 'number' && typeof m.newQuantity === 'number'
    );
    results.push({
      id: 16,
      title: 'Movement history preserves previous quantities',
      passed: hasPreviousAndNew && movements.length > 0,
      notes: `All ${movements.length} records maintain exact audit trail (prev -> new)`,
    });
  } catch (e: any) {
    results.push({ id: 16, title: 'Movement history preserves previous quantities', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 17: Movement history is paginated
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/history?page=1&limit=2`, { headers: authHeaders });
    const json = await res.json();
    const paginated = json.movements?.length === 2 && json.pagination?.total >= 4;
    results.push({
      id: 17,
      title: 'Movement history is paginated',
      passed: res.status === 200 && paginated,
      notes: `Page 1 returned 2 items with total ${json.pagination?.total}`,
    });
  } catch (e: any) {
    results.push({ id: 17, title: 'Movement history is paginated', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 18: Stock reservation works
  // --------------------------------------------------------------------------
  try {
    // Reset test product to 10 physical, 0 reserved => 10 available
    await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ adjustmentType: 'Stock Correction', quantity: 10, reason: 'Reset for reserve test' }),
    });
    await Product.updateOne({ sku: testSku }, { reservedQuantity: 0, availableQuantity: 10 });

    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/reserve`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 4,
        reason: 'VIP beach residence reservation',
      }),
    });
    const json = await res.json();
    const reservedIs4 = json.product?.reservedQuantity === 4;
    const availableIs6 = json.product?.availableQuantity === 6;
    results.push({
      id: 18,
      title: 'Stock reservation works',
      passed: res.status === 200 && reservedIs4 && availableIs6,
      notes: `Reserved 4 units, available updated to 6`,
    });
  } catch (e: any) {
    results.push({ id: 18, title: 'Stock reservation works', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 19: Reservation release works
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/release`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 2,
        isSold: false,
        reason: 'Customer cancelled partial hold',
      }),
    });
    const json = await res.json();
    const reservedIs2 = json.product?.reservedQuantity === 2;
    const availableIs8 = json.product?.availableQuantity === 8;
    results.push({
      id: 19,
      title: 'Reservation release works',
      passed: res.status === 200 && reservedIs2 && availableIs8,
      notes: `Released 2 reserved units, restored available stock to 8`,
    });
  } catch (e: any) {
    results.push({ id: 19, title: 'Reservation release works', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 20: Confirmed sales update stock correctly
  // --------------------------------------------------------------------------
  try {
    // Current stock: 10 physical, 2 reserved.
    // Confirming sale of remaining 2 reserved units should reduce physical to 8 and reserved to 0.
    const res = await fetch(`${BASE_URL}/api/admin/inventory/${testSku}/release`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        quantity: 2,
        isSold: true,
        reason: 'Confirmed order invoice #MNC-2026-TEST',
      }),
    });
    const json = await res.json();
    const physicalIs8 = json.product?.stockQuantity === 8;
    const reservedIs0 = json.product?.reservedQuantity === 0;
    const availableIs8 = json.product?.availableQuantity === 8;
    results.push({
      id: 20,
      title: 'Confirmed sales update stock correctly',
      passed: res.status === 200 && physicalIs8 && reservedIs0 && availableIs8,
      notes: `Fulfillment: physical reduced to 8, reserved cleared to 0, available is 8`,
    });
  } catch (e: any) {
    results.push({ id: 20, title: 'Confirmed sales update stock correctly', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 21: Concurrent adjustments do not oversell
  // --------------------------------------------------------------------------
  try {
    // Send 3 parallel requests attempting to reduce 4 units each from 8 units physical stock
    // Only 2 should succeed, the 3rd must fail or be rejected because 8 - 4 - 4 = 0
    const parallelRequests = [
      fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ adjustmentType: 'Manual Reduction', quantity: 4, reason: 'Parallel test 1' }),
      }),
      fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ adjustmentType: 'Manual Reduction', quantity: 4, reason: 'Parallel test 2' }),
      }),
      fetch(`${BASE_URL}/api/admin/inventory/${testSku}/adjust`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ adjustmentType: 'Manual Reduction', quantity: 4, reason: 'Parallel test 3' }),
      }),
    ];

    const responses = await Promise.all(parallelRequests);
    const statuses = responses.map((r) => r.status);
    const successCount = statuses.filter((s) => s === 200).length;
    const rejectCount = statuses.filter((s) => s === 400).length;

    const freshDoc = await Product.findOne({ sku: testSku }).lean();
    const nonNegative = (freshDoc?.stockQuantity || 0) >= 0;

    results.push({
      id: 21,
      title: 'Concurrent adjustments do not oversell',
      passed: successCount === 2 && rejectCount === 1 && nonNegative,
      notes: `Statuses: [${statuses.join(', ')}], Success: ${successCount}, Reject: ${rejectCount}, Final Stock: ${freshDoc?.stockQuantity}`,
    });
  } catch (e: any) {
    results.push({ id: 21, title: 'Concurrent adjustments do not oversell', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 22: Inventory statistics are accurate
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/stats`, { headers: authHeaders });
    const json = await res.json();
    const statsValid =
      json.success === true &&
      json.stats.totalProducts >= 19 &&
      json.stats.totalStockUnits > 0 &&
      json.stats.totalCostValuation > 0;
    results.push({
      id: 22,
      title: 'Inventory statistics are accurate',
      passed: res.status === 200 && statsValid,
      notes: `Aggregated ${json.stats?.totalProducts} items, ${json.stats?.totalStockUnits} stock units`,
    });
  } catch (e: any) {
    results.push({ id: 22, title: 'Inventory statistics are accurate', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 23: Inventory valuation is accurate where cost data exists
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/inventory/stats`, { headers: authHeaders });
    const json = await res.json();
    const hasValuation =
      typeof json.stats?.totalCostValuation === 'number' &&
      typeof json.stats?.totalRetailValuation === 'number' &&
      json.stats.totalRetailValuation > json.stats.totalCostValuation;
    results.push({
      id: 23,
      title: 'Inventory valuation is accurate where cost data exists',
      passed: hasValuation,
      notes: `Cost: ₹${json.stats?.totalCostValuation.toLocaleString()} vs Retail: ₹${json.stats?.totalRetailValuation.toLocaleString()}`,
    });
  } catch (e: any) {
    results.push({ id: 23, title: 'Inventory valuation is accurate where cost data exists', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 24: Public APIs do not expose private cost information
  // --------------------------------------------------------------------------
  try {
    const resList = await fetch(`${BASE_URL}/api/products`);
    const jsonList = await resList.json();
    const listLeaksCost = jsonList.products?.some((p: any) => p.costPrice !== undefined);

    const activeSample = await Product.findOne({ isActive: true, isArchived: { $ne: true } })
      .select('slug')
      .lean();
    if (!activeSample?.slug) {
      throw new Error('No active product found for public costPrice leakage verification');
    }

    const resSingle = await fetch(`${BASE_URL}/api/products/${activeSample.slug}`);
    const jsonSingle = await resSingle.json();
    const singleLeaksCost = jsonSingle.product?.costPrice !== undefined;

    const noCostLeak =
      resList.status === 200 &&
      resSingle.status === 200 &&
      Boolean(jsonSingle.product) &&
      !listLeaksCost &&
      !singleLeaksCost;
    results.push({
      id: 24,
      title: 'Public APIs do not expose private cost information',
      passed: noCostLeak,
      notes: `Public routes strictly sanitized; zero costPrice leakage in /api/products`,
    });
  } catch (e: any) {
    results.push({ id: 24, title: 'Public APIs do not expose private cost information', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Check 25: Existing Phase 6 and Phase 7 functionality remains intact
  // --------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
    const json = await res.json();
    const crudIntact = res.status === 200 && json.success === true && json.total >= 19;
    const sampleHasImages = json.products?.[0]?.images?.length > 0;

    results.push({
      id: 25,
      title: 'Existing Phase 6 and Phase 7 functionality intact',
      passed: crudIntact && sampleHasImages,
      notes: `All ${json.total} catalog items, Cloudinary media pipeline, and CRUD operational`,
    });
  } catch (e: any) {
    results.push({ id: 25, title: 'Existing Phase 6 and Phase 7 functionality intact', passed: false, notes: e.message });
  }

  // --------------------------------------------------------------------------
  // Cleanup test artifacts
  // --------------------------------------------------------------------------
  await Product.deleteMany({ sku: testSku });
  await InventoryMovement.deleteMany({ sku: testSku });

  // --------------------------------------------------------------------------
  // Print Scorecard
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('--- PHASE 8 VERIFICATION SCORECARD ---');
  console.log('================================================================');
  let allPass = true;
  for (const r of results) {
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} Check ${r.id}: ${r.title}\n          → ${r.notes}`);
    if (!r.passed) allPass = false;
  }
  console.log('================================================================');
  console.log(`Final Result: ${allPass ? 'ALL 25 CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  console.log('================================================================');

  process.exit(allPass ? 0 : 1);
}

runInventoryTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
