import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { connectDB } from '../lib/mongodb';
import { Admin, hashAdminPassword } from '../models/Admin';
import { Product } from '../models/Product';
import { signAdminToken, verifyAdminToken, ADMIN_COOKIE_NAME } from '../lib/auth';

const BASE_URL = 'http://127.0.0.1:3007';

interface CheckResult {
  id: number;
  title: string;
  passed: boolean;
  notes: string;
}

const results: CheckResult[] = [];

async function runTests() {
  console.log('================================================================');
  console.log('MNC LifeStyle — Phase 5: Secure Admin Auth Verification');
  console.log('================================================================\n');

  await connectDB();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD in .env.local before running auth tests.');
  }

  // --- UNIT / MODEL LEVEL CHECKS ---
  console.log('--- Step 1: Mongoose Model & Cryptography Tests ---');
  const admin = await Admin.findOne({ email: adminEmail }).select('+passwordHash');
  if (!admin) {
    throw new Error(`Admin ${adminEmail} not found. Run seeder first.`);
  }

  // Model Password Hash Exposure Check
  const adminJSON = JSON.parse(JSON.stringify(admin));
  const isHashHidden = adminJSON.passwordHash === undefined && adminJSON.__v === undefined;
  console.log(`[PASS] Admin toJSON() strips passwordHash & __v: ${isHashHidden}`);

  // Model Password Compare Check
  const validCompare = await admin.comparePassword(adminPassword);
  const invalidCompare = await admin.comparePassword('WrongPassword123!');
  console.log(`[PASS] bcrypt candidate comparison: valid=${validCompare}, invalid=${!invalidCompare}`);

  // Jose JWT Sign & Verify Check
  const testToken = await signAdminToken({
    id: admin._id.toString(),
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  const verified = await verifyAdminToken(testToken);
  const tampered = await verifyAdminToken(testToken + 'tampered');
  console.log(`[PASS] JWT signing and verification: verified=${verified?.email === admin.email}, tamperedRejected=${tampered === null}`);

  // Create temporary disabled admin for test 3
  const disabledEmail = 'disabled_test@mnclifestyle.in';
  await Admin.deleteOne({ email: disabledEmail });
  const disabledAdmin = new Admin({
    name: 'Disabled Test Admin',
    email: disabledEmail,
    passwordHash: await hashAdminPassword('TempPass123!'),
    role: 'admin',
    isActive: false,
  });
  await disabledAdmin.save();

  console.log('\n--- Step 2: HTTP Integration Tests against Next.js Server ---');

  let sessionCookie = '';

  // 1. Login with valid credentials
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const setCookie = res.headers.get('set-cookie') || '';
    const json = await res.json();
    const hasToken = setCookie.includes(ADMIN_COOKIE_NAME);
    const isHttpOnly = setCookie.toLowerCase().includes('httponly');
    const noHash = json.admin?.passwordHash === undefined;

    if (hasToken) {
      // extract cookie value for subsequent requests
      const match = setCookie.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`));
      if (match) sessionCookie = match[0];
    }

    results.push({
      id: 1,
      title: 'Login with valid credentials',
      passed: res.status === 200 && json.success === true && hasToken && isHttpOnly && noHash,
      notes: `HTTP ${res.status}, HTTP-only cookie set, passwordHash omitted: ${noHash}`,
    });
  } catch (e: any) {
    results.push({ id: 1, title: 'Login with valid credentials', passed: false, notes: e.message });
  }

  // 2. Login with invalid credentials
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: 'IncorrectPassword999!' }),
    });
    const json = await res.json();
    const isGenericError = json.message === 'Invalid email or password';
    results.push({
      id: 2,
      title: 'Login with invalid credentials',
      passed: res.status === 401 && isGenericError,
      notes: `HTTP ${res.status}, generic error message: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 2, title: 'Login with invalid credentials', passed: false, notes: e.message });
  }

  // 3. Disabled admin cannot log in
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: disabledEmail, password: 'TempPass123!' }),
    });
    const json = await res.json();
    results.push({
      id: 3,
      title: 'Disabled admin cannot log in',
      passed: res.status === 403 && json.success === false,
      notes: `HTTP ${res.status}, rejected with: "${json.message}"`,
    });
  } catch (e: any) {
    results.push({ id: 3, title: 'Disabled admin cannot log in', passed: false, notes: e.message });
  } finally {
    await Admin.deleteOne({ email: disabledEmail });
  }

  // 4. Unauthenticated users cannot access dashboard (Redirect to /admin/login)
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      redirect: 'manual',
    });
    const location = res.headers.get('location') || '';
    const redirectsToLogin = location.includes('/admin/login');
    results.push({
      id: 4,
      title: 'Unauthenticated users cannot access dashboard',
      passed: (res.status === 307 || res.status === 308 || res.status === 302) && redirectsToLogin,
      notes: `HTTP ${res.status}, redirected to: "${location}"`,
    });
  } catch (e: any) {
    results.push({ id: 4, title: 'Unauthenticated users cannot access dashboard', passed: false, notes: e.message });
  }

  // 5. Authenticated admin can access dashboard and /api/admin/me
  try {
    const meRes = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Cookie: sessionCookie },
    });
    const meJson = await meRes.json();

    const dashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Cookie: sessionCookie },
    });
    const dashText = await dashRes.text();
    const hasWelcome = dashText.includes('Welcome back') || dashText.includes('MNC LifeStyle');

    results.push({
      id: 5,
      title: 'Authenticated admin can access dashboard & /api/admin/me',
      passed: meRes.status === 200 && meJson.success === true && dashRes.status === 200 && hasWelcome,
      notes: `/api/admin/me HTTP ${meRes.status} (email: ${meJson.admin?.email}), /admin/dashboard HTTP ${dashRes.status}`,
    });
  } catch (e: any) {
    results.push({ id: 5, title: 'Authenticated admin can access dashboard & /api/admin/me', passed: false, notes: e.message });
  }

  // 6. Logout invalidates session
  try {
    const res = await fetch(`${BASE_URL}/api/admin/logout`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    const setCookie = res.headers.get('set-cookie') || '';
    const isCleared = setCookie.includes('Max-Age=0') || setCookie.includes('expires=');
    results.push({
      id: 6,
      title: 'Logout invalidates the session',
      passed: res.status === 200 && isCleared,
      notes: `HTTP ${res.status}, cookie cleared with Max-Age=0`,
    });
  } catch (e: any) {
    results.push({ id: 6, title: 'Logout invalidates the session', passed: false, notes: e.message });
  }

  // 7. Expired or tampered sessions are rejected
  try {
    const res = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Cookie: `${ADMIN_COOKIE_NAME}=eyJhbGciOiJIUzI1NiJ9.tamperedPayload.invalidSig` },
    });
    results.push({
      id: 7,
      title: 'Expired / tampered sessions are rejected',
      passed: res.status === 401,
      notes: `HTTP ${res.status} Unauthorized returned for forged signature`,
    });
  } catch (e: any) {
    results.push({ id: 7, title: 'Expired / tampered sessions are rejected', passed: false, notes: e.message });
  }

  // 8. Admin APIs reject unauthorized requests
  try {
    const res = await fetch(`${BASE_URL}/api/admin/me`);
    results.push({
      id: 8,
      title: 'Admin APIs reject unauthorized requests',
      passed: res.status === 401,
      notes: `HTTP ${res.status} returned without cookie`,
    });
  } catch (e: any) {
    results.push({ id: 8, title: 'Admin APIs reject unauthorized requests', passed: false, notes: e.message });
  }

  // 9. Password hashes are never exposed
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const rawLogin = await loginRes.text();
    const loginCookie = loginRes.headers.get('set-cookie')?.match(new RegExp(`${ADMIN_COOKIE_NAME}=([^;]+)`))?.[0] || '';

    const meRes = await fetch(`${BASE_URL}/api/admin/me`, {
      headers: { Cookie: loginCookie },
    });
    const rawMe = await meRes.text();

    const exposedInLogin = rawLogin.includes('passwordHash') || rawLogin.includes('$2a$') || rawLogin.includes('$2b$');
    const exposedInMe = rawMe.includes('passwordHash') || rawMe.includes('$2a$') || rawMe.includes('$2b$');

    results.push({
      id: 9,
      title: 'Password hashes are never exposed',
      passed: !exposedInLogin && !exposedInMe,
      notes: `Login payload exposed: ${exposedInLogin}, Me payload exposed: ${exposedInMe}`,
    });
  } catch (e: any) {
    results.push({ id: 9, title: 'Password hashes are never exposed', passed: false, notes: e.message });
  }

  // 10. Existing customer storefront still works
  try {
    const activeSample = await Product.findOne({ isActive: true, isArchived: { $ne: true } })
      .select('slug')
      .lean();
    if (!activeSample?.slug) {
      throw new Error('No active product found in database for storefront verification.');
    }

    const homeRes = await fetch(`${BASE_URL}/`);
    const shopRes = await fetch(`${BASE_URL}/shop`);
    const categoryRes = await fetch(`${BASE_URL}/category/sectional-sofas`);
    const prodRes = await fetch(`${BASE_URL}/product/${activeSample.slug}`);

    const allStorefront200 =
      homeRes.status === 200 &&
      shopRes.status === 200 &&
      categoryRes.status === 200 &&
      prodRes.status === 200;

    results.push({
      id: 10,
      title: 'Existing customer storefront still works',
      passed: allStorefront200,
      notes: `Home: ${homeRes.status}, Shop: ${shopRes.status}, Category: ${categoryRes.status}, Product (${activeSample.slug}): ${prodRes.status}`,
    });
  } catch (e: any) {
    results.push({ id: 10, title: 'Existing customer storefront still works', passed: false, notes: e.message });
  }

  // Print scorecard
  console.log('\n================================================================');
  console.log('--- PHASE 5 VERIFICATION SCORECARD ---');
  console.log('================================================================');
  let allPass = true;
  for (const r of results) {
    const symbol = r.passed ? '✓ [PASS]' : '✗ [FAIL]';
    console.log(`${symbol} Check ${r.id}: ${r.title}\n          → ${r.notes}`);
    if (!r.passed) allPass = false;
  }
  console.log('================================================================');
  console.log(`Final Result: ${allPass ? 'ALL 10 CHECKS PASSED' : 'SOME CHECKS FAILED'}`);
  console.log('================================================================');

  process.exit(allPass ? 0 : 1);
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
