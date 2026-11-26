import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Product } from '../models/Product';
import { Collection } from '../models/Collection';
import { Admin } from '../models/Admin';
import { syncCategoryItemCounts } from '../lib/category-cleanup';
import { signAdminToken, ADMIN_COOKIE_NAME } from '../lib/auth';
import {
  generateUploadSignature,
  generateProductImagePublicId,
  deleteCloudinaryImage,
  getCloudinaryClient,
} from '../lib/storage/cloudinary';

const BASE_URL = 'http://127.0.0.1:3007';

interface CheckItem {
  id: number;
  title: string;
  passed: boolean;
  notes: string;
}

const results: CheckItem[] = [];

async function runCloudinaryTests() {
  console.log('================================================================');
  console.log('MNC LifeStyle — Phase 7: Cloudinary Media Upload Verification');
  console.log('================================================================\n');

  await connectDB();

  // Admin Session Setup
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@mnclifestyle.in';
  const admin = await Admin.findOne({ email: adminEmail });
  if (!admin) {
    throw new Error('Admin account not found. Run seed script first.');
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

  let uploadedPublicId = '';
  let uploadedSecureUrl = '';
  const testProductSku = 'MNC-MEDIA-TEST-01';
  const testProductSlug = 'cloudinary-media-test-sofa';

  // 1. Admin Authentication Check
  try {
    const res = await fetch(`${BASE_URL}/api/admin/me`, { headers: authHeaders });
    const json = await res.json();
    results.push({
      id: 1,
      title: 'Admin authentication verification',
      passed: res.status === 200 && json.success === true,
      notes: `HTTP ${res.status}, authenticated as ${json.admin?.email}`,
    });
  } catch (e: any) {
    results.push({ id: 1, title: 'Admin authentication verification', passed: false, notes: e.message });
  }

  // 2. Unauthorized Upload Rejection
  try {
    const res = await fetch(`${BASE_URL}/api/admin/uploads/signature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format: 'jpg', size: 1024 }),
    });
    results.push({
      id: 2,
      title: 'Unauthorized upload rejection',
      passed: res.status === 401,
      notes: `HTTP ${res.status} Unauthorized returned without session cookie`,
    });
  } catch (e: any) {
    results.push({ id: 2, title: 'Unauthorized upload rejection', passed: false, notes: e.message });
  }

  // 3. Signature Generation
  let signaturePayload: any = null;
  try {
    const res = await fetch(`${BASE_URL}/api/admin/uploads/signature`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        format: 'webp',
        size: 500000,
        productIdentifier: 'test-sofa',
      }),
    });
    const json = await res.json();
    signaturePayload = json;
    const hasSig = Boolean(json.signature && json.apiKey && json.timestamp && json.publicId);
    results.push({
      id: 3,
      title: 'Secure signature generation',
      passed: res.status === 200 && json.success === true && hasSig,
      notes: `Generated timestamp=${json.timestamp}, publicId=${json.publicId}`,
    });
  } catch (e: any) {
    results.push({ id: 3, title: 'Secure signature generation', passed: false, notes: e.message });
  }

  // 4. Invalid Format Rejection
  try {
    const res = await fetch(`${BASE_URL}/api/admin/uploads/signature`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ format: 'gif', size: 50000 }),
    });
    const json = await res.json();
    results.push({
      id: 4,
      title: 'Invalid file format rejection',
      passed: res.status === 400 && json.success === false,
      notes: `HTTP ${res.status}, correctly rejected unsupported format: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 4, title: 'Invalid file format rejection', passed: false, notes: e.message });
  }

  // 5. File Size Restrictions (>8MB)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/uploads/signature`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ format: 'jpg', size: 10 * 1024 * 1024 }), // 10MB
    });
    const json = await res.json();
    results.push({
      id: 5,
      title: 'File size restriction (>8 MB rejected)',
      passed: res.status === 400 && json.success === false,
      notes: `HTTP ${res.status}, correctly rejected: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 5, title: 'File size restriction (>8 MB rejected)', passed: false, notes: e.message });
  }

  // 6. Public ID Generation (Folder Scope)
  try {
    const generatedId = generateProductImagePublicId('valen-dining-table');
    const hasCorrectFolder = generatedId.startsWith('mnc-lifestyle/products/');
    results.push({
      id: 6,
      title: 'Public ID generation & folder isolation',
      passed: hasCorrectFolder,
      notes: `Generated: "${generatedId}" inside approved folder`,
    });
  } catch (e: any) {
    results.push({ id: 6, title: 'Public ID generation & folder isolation', passed: false, notes: e.message });
  }

  // 7. Direct Upload to Cloudinary (Real Cloudinary API upload)
  try {
    const cloudinary = getCloudinaryClient();
    // 1x1 transparent PNG data URI
    const test1x1Png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const testPublicId = generateProductImagePublicId('phase7-test-media');
    const uploadRes = await cloudinary.uploader.upload(test1x1Png, {
      public_id: testPublicId,
      folder: 'mnc-lifestyle/products',
      resource_type: 'image',
    });

    uploadedPublicId = uploadRes.public_id;
    uploadedSecureUrl = uploadRes.secure_url;

    results.push({
      id: 7,
      title: 'Direct upload to Cloudinary (Real Integration)',
      passed: Boolean(uploadedPublicId && uploadedSecureUrl),
      notes: `Real Cloudinary asset created: public_id="${uploadedPublicId}"`,
    });
  } catch (e: any) {
    results.push({ id: 7, title: 'Direct upload to Cloudinary (Real Integration)', passed: false, notes: e.message });
  }

  // 8. Image URL Retrieval & Format Validation
  try {
    const isCloudinaryUrl =
      uploadedSecureUrl.startsWith('https://res.cloudinary.com/') &&
      uploadedSecureUrl.includes('dtii8jmyd');
    results.push({
      id: 8,
      title: 'Cloudinary CDN URL retrieval & structure',
      passed: isCloudinaryUrl,
      notes: `Valid CDN delivery URL: ${uploadedSecureUrl}`,
    });
  } catch (e: any) {
    results.push({ id: 8, title: 'Cloudinary CDN URL retrieval & structure', passed: false, notes: e.message });
  }

  // 9. Product Creation with Uploaded Image
  let createdPieceId = '';
  try {
    await Product.deleteMany({ sku: testProductSku });

    const newPiece = {
      name: 'Valen Cloudinary Masterpiece Sofa',
      slug: testProductSlug,
      sku: testProductSku,
      category: 'sectional-sofas',
      subCategory: '3-Seater Sofas',
      price: 185000,
      originalPrice: 210000,
      badge: 'Masterpiece',
      isActive: true,
      stockQuantity: 5,
      inStock: true,
      shortDescription: 'Luxury curved sofa featuring direct Cloudinary media pipeline.',
      fullDescription: 'Handcrafted with architectural joinery and Belgian fabric, photographed and served through Cloudinary.',
      materials: ['Solid Indian Teak', 'Belgian Bouclé'],
      images: [uploadedSecureUrl],
      imageDetails: [
        {
          url: uploadedSecureUrl,
          key: uploadedPublicId,
          altText: 'Valen Cloudinary Masterpiece Sofa Front View',
          isPrimary: true,
          width: 800,
          height: 600,
        },
      ],
    };

    const res = await fetch(`${BASE_URL}/api/admin/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newPiece),
    });
    const json = await res.json();
    createdPieceId = json.product?._id || json.product?.id || '';

    results.push({
      id: 9,
      title: 'Product creation with Cloudinary image & metadata',
      passed: res.status === 201 && json.success === true && Boolean(createdPieceId),
      notes: `Created product ID ${createdPieceId} with secure_url & public_id stored`,
    });
  } catch (e: any) {
    results.push({ id: 9, title: 'Product creation with Cloudinary image & metadata', passed: false, notes: e.message });
  }

  // 10. Existing Image Preservation (CDN URLs continue working)
  try {
    const existing = await Product.findOne({ isActive: true, isArchived: { $ne: true } }).lean();
    const hasCdnImage = existing?.images?.some(
      (img: string) => img.startsWith('https://') && (img.includes('cloudinary.com') || img.includes('unsplash.com'))
    );
    results.push({
      id: 10,
      title: 'Existing image preservation (Catalog URLs)',
      passed: Boolean(hasCdnImage),
      notes: `Existing piece "${existing?.name}" preserves CDN imagery: ${hasCdnImage}`,
    });
  } catch (e: any) {
    results.push({ id: 10, title: 'Existing image preservation (Unsplash URLs)', passed: false, notes: e.message });
  }

  // 11. Product Editing with Image Updates
  try {
    const secondaryImageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    const res = await fetch(`${BASE_URL}/api/admin/products/${testProductSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        images: [uploadedSecureUrl, secondaryImageUrl],
        imageDetails: [
          { url: uploadedSecureUrl, key: uploadedPublicId, isPrimary: true },
          { url: secondaryImageUrl, key: '', isPrimary: false },
        ],
      }),
    });
    const json = await res.json();
    const hasBoth = json.product?.images?.length === 2;
    results.push({
      id: 11,
      title: 'Product editing with image updates',
      passed: res.status === 200 && hasBoth,
      notes: `Updated gallery to ${json.product?.images?.length} images successfully`,
    });
  } catch (e: any) {
    results.push({ id: 11, title: 'Product editing with image updates', passed: false, notes: e.message });
  }

  // 12. Image Reordering
  try {
    const secondaryImageUrl = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    // Reorder: place secondary image first
    const res = await fetch(`${BASE_URL}/api/admin/products/${testProductSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        images: [secondaryImageUrl, uploadedSecureUrl],
        imageDetails: [
          { url: secondaryImageUrl, key: '', isPrimary: true },
          { url: uploadedSecureUrl, key: uploadedPublicId, isPrimary: false },
        ],
      }),
    });
    const json = await res.json();
    const reorderedFirst = json.product?.images?.[0] === secondaryImageUrl;
    results.push({
      id: 12,
      title: 'Image reordering support',
      passed: res.status === 200 && reorderedFirst,
      notes: `Reordered: first image updated to primary position`,
    });
  } catch (e: any) {
    results.push({ id: 12, title: 'Image reordering support', passed: false, notes: e.message });
  }

  // 13. Image Removal from Product State
  try {
    // Remove secondary image, keeping only Cloudinary asset
    const res = await fetch(`${BASE_URL}/api/admin/products/${testProductSku}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        images: [uploadedSecureUrl],
        imageDetails: [{ url: uploadedSecureUrl, key: uploadedPublicId, isPrimary: true }],
      }),
    });
    const json = await res.json();
    const isSingleImage = json.product?.images?.length === 1;
    results.push({
      id: 13,
      title: 'Image removal from product gallery',
      passed: res.status === 200 && isSingleImage,
      notes: `Gallery pruned back to single image: ${isSingleImage}`,
    });
  } catch (e: any) {
    results.push({ id: 13, title: 'Image removal from product gallery', passed: false, notes: e.message });
  }

  // 14 & 15. Shared Image Protection & Safe Deletion
  try {
    // Test 15: Attempt to delete while referenced by testProduct -> Shared protection triggers
    const sharedCheckRes = await fetch(`${BASE_URL}/api/admin/uploads`, {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify({ publicId: uploadedPublicId }), // no currentProductId -> detected as shared
    });
    const sharedJson = await sharedCheckRes.json();
    const sharedProtected = sharedJson.shared === true;

    // Test 14: Delete testProduct first, then safely destroy from Cloudinary
    await Product.deleteMany({ sku: testProductSku });
    await syncCategoryItemCounts();

    const safeDelRes = await fetch(`${BASE_URL}/api/admin/uploads`, {
      method: 'DELETE',
      headers: authHeaders,
      body: JSON.stringify({ publicId: uploadedPublicId }),
    });
    const safeDelJson = await safeDelRes.json();
    const safeDeleted = safeDelJson.success === true;

    results.push({
      id: 14,
      title: 'Safe Cloudinary asset deletion',
      passed: safeDeleted,
      notes: `HTTP ${safeDelRes.status}, Cloudinary destroy result: "${safeDelJson.result}"`,
    });

    results.push({
      id: 15,
      title: 'Shared image protection check',
      passed: sharedProtected,
      notes: `Asset referenced by active piece was shielded from accidental destruction`,
    });
  } catch (e: any) {
    results.push({ id: 14, title: 'Safe Cloudinary asset deletion', passed: false, notes: e.message });
    results.push({ id: 15, title: 'Shared image protection check', passed: false, notes: e.message });
  }

  // 16. Storefront Rendering Check
  try {
    const res = await fetch(`${BASE_URL}/shop`);
    const text = await res.text();
    const storefrontHealthy = res.status === 200 && text.includes('Shop');
    results.push({
      id: 16,
      title: 'Storefront rendering integrity',
      passed: storefrontHealthy,
      notes: `HTTP ${res.status}, public /shop renders catalog seamlessly`,
    });
  } catch (e: any) {
    results.push({ id: 16, title: 'Storefront rendering integrity', passed: false, notes: e.message });
  }

  // 17. Legacy Image Compatibility
  try {
    const activeSample = await Product.findOne({ isActive: true, isArchived: { $ne: true } })
      .select('slug name')
      .lean();
    if (!activeSample?.slug) {
      throw new Error('No active catalog product found for detail page image compatibility test.');
    }
    const res = await fetch(`${BASE_URL}/product/${activeSample.slug}`);
    const text = await res.text();
    const legacyProductHealthy = res.status === 200 && text.includes(activeSample.name);
    results.push({
      id: 17,
      title: 'Catalog image compatibility (Detail Pages)',
      passed: legacyProductHealthy,
      notes: `HTTP ${res.status}, active product detail (${activeSample.slug}) renders cleanly`,
    });
  } catch (e: any) {
    results.push({ id: 17, title: 'Legacy image compatibility (Detail Pages)', passed: false, notes: e.message });
  }

  // 18. Existing Phase 6 CRUD Functionality Intact
  try {
    const res = await fetch(`${BASE_URL}/api/admin/products`, { headers: authHeaders });
    const json = await res.json();
    const crudIntact = res.status === 200 && json.success === true && json.total >= 19;
    results.push({
      id: 18,
      title: 'Phase 6 CRUD operations regression check',
      passed: crudIntact,
      notes: `Admin product listing operational with ${json.total} catalog items`,
    });
  } catch (e: any) {
    results.push({ id: 18, title: 'Phase 6 CRUD operations regression check', passed: false, notes: e.message });
  }

  // Clean up any remaining test artifacts
  await Product.deleteMany({
    $or: [{ sku: testProductSku }, { slug: testProductSlug }],
  });
  await syncCategoryItemCounts();

  // Print scorecard
  console.log('\n================================================================');
  console.log('--- PHASE 7 VERIFICATION SCORECARD ---');
  console.log('================================================================');
  let allPass = true;
  for (const r of results) {
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} Check ${r.id}: ${r.title}\n          → ${r.notes}`);
    if (!r.passed) allPass = false;
  }
  console.log('================================================================');
  console.log(`Final Result: ${allPass ? 'ALL 18 CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  console.log('================================================================');

  process.exit(allPass ? 0 : 1);
}

runCloudinaryTests().catch((err) => {
  console.error('Fatal Cloudinary test error:', err);
  process.exit(1);
});
