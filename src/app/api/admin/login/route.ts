import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import {
  signAdminToken,
  getAdminCookieOptions,
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  validateRequestOrigin,
} from '@/lib/auth';

// Constant-time fallback hash used when email does not exist to prevent user enumeration timing leaks.
const DUMMY_PASSWORD_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8u1q2lM9D8s7S5xP4oB2n8m2W9R6eC';

export async function POST(request: NextRequest) {
  try {
    // 1. Origin / CSRF validation
    if (!validateRequestOrigin(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin' },
        { status: 403 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // 3. Brute-force rate limiting check (IP + Email)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';
    const rateLimitKey = `${clientIp}:${email}`;

    const rateCheck = checkLoginRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many failed login attempts. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 4. Database connection & admin lookup
    await connectDB();
    const admin = await Admin.findOne({ email }).select('+passwordHash');

    // 5. Verify credentials (constant-time dummy check when account missing to prevent user enumeration timing leaks)
    if (!admin) {
      await bcrypt.compare(password, DUMMY_PASSWORD_HASH);
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      recordFailedLogin(rateLimitKey);
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 6. Check active account status
    if (!admin.isActive) {
      return NextResponse.json(
        {
          success: false,
          message: 'This account has been deactivated. Please contact your system administrator.',
        },
        { status: 403 }
      );
    }

    // 7. Successful login: reset rate limit & update last login
    clearLoginRateLimit(rateLimitKey);
    admin.lastLoginAt = new Date();
    await admin.save();

    // 8. Sign JWT
    const token = await signAdminToken({
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      role: admin.role,
    });

    // 9. Prepare HTTP-only cookie
    const cookieOpts = getAdminCookieOptions();
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
      },
    });

    response.cookies.set({
      name: cookieOpts.name,
      value: token,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge,
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Login Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication service error' },
      { status: 500 }
    );
  }
}
