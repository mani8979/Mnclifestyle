import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ZodError } from 'zod';
import { connectDB } from '@/lib/mongodb';
import { Admin, AdminRole } from '@/models/Admin';
import { ColorVariantValidationError } from '@/lib/color-variants';
import {
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  type AdminJWTPayload,
  signAdminToken,
  verifyAdminToken,
  getAdminCookieOptions,
} from '@/lib/auth-token';

export {
  ADMIN_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  signAdminToken,
  verifyAdminToken,
  getAdminCookieOptions,
};
export type { AdminJWTPayload };

export class AuthError extends Error {
  status = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

/**
 * Retrieve admin session payload from request cookies (NextRequest or Next.js cookies())
 */
export async function getAdminSession(request?: NextRequest): Promise<AdminJWTPayload | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  } else {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      return null;
    }
  }

  if (!token) return null;
  return verifyAdminToken(token);
}

/**
 * Enforce active admin authentication and authorization verified against live MongoDB Admin record.
 */
export async function requireAdminSession(
  allowedRoles?: AdminRole[],
  request?: NextRequest
): Promise<AdminJWTPayload> {
  const session = await getAdminSession(request);

  if (!session) {
    throw new AuthError('Unauthorized: No active admin session');
  }

  await connectDB();
  const dbAdmin = await Admin.findById(session.id)
    .select('_id email name role isActive')
    .lean();

  if (!dbAdmin || !dbAdmin.isActive) {
    throw new AuthError('Unauthorized: Admin account is inactive or no longer valid');
  }

  if (allowedRoles && !allowedRoles.includes(dbAdmin.role)) {
    throw new ForbiddenError('Forbidden: Insufficient role permissions');
  }

  return {
    id: (dbAdmin as any)._id.toString(),
    email: dbAdmin.email,
    name: dbAdmin.name || '',
    role: dbAdmin.role,
  };
}

/**
 * Request Origin / CSRF validator for state-changing POST/PATCH/DELETE requests
 */
export function validateRequestOrigin(request: Request): boolean {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') {
    return false;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (origin) {
    if (!host) return false;
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }

  if (referer && host) {
    try {
      return new URL(referer).host === host;
    } catch {
      return false;
    }
  }

  return true;
}

export function assertValidOrigin(request: Request): void {
  if (!validateRequestOrigin(request)) {
    throw new ForbiddenError('Invalid request origin');
  }
}

/**
 * Standardized safe API error serializer — never exposes internal DB/stack errors in 500 responses.
 */
export function handleApiError(
  error: unknown,
  fallbackMessage = 'Internal server error',
  logContext = '[API Error]'
) {
  if (error instanceof AuthError) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (error instanceof ForbiddenError) {
    return NextResponse.json({ success: false, message: error.message || 'Forbidden' }, { status: 403 });
  }

  if (error instanceof ColorVariantValidationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    const issues = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ');
    return NextResponse.json(
      {
        success: false,
        message: issues ? `Validation failed: ${issues}` : 'Invalid request payload',
        errors: error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const errObj = error as any;

  if (
    errObj?.status === 401 ||
    (typeof errObj?.message === 'string' &&
      (errObj.message.startsWith('UNAUTHORIZED') || errObj.message.includes('Unauthorized')))
  ) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  if (
    errObj?.status === 403 ||
    (typeof errObj?.message === 'string' && errObj.message.startsWith('FORBIDDEN'))
  ) {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }

  if (typeof errObj?.status === 'number' && errObj.status >= 400 && errObj.status < 500) {
    return NextResponse.json(
      { success: false, message: errObj.message || 'Invalid request' },
      { status: errObj.status }
    );
  }

  if (errObj?.name === 'CastError') {
    return NextResponse.json({ success: false, message: 'Invalid identifier format' }, { status: 400 });
  }

  if (errObj?.name === 'ValidationError') {
    return NextResponse.json({ success: false, message: 'Validation failed' }, { status: 400 });
  }

  if (errObj?.code === 11000) {
    return NextResponse.json(
      { success: false, message: 'A record with this unique value already exists' },
      { status: 409 }
    );
  }

  console.error(`${logContext}:`, error);
  return NextResponse.json({ success: false, message: fallbackMessage }, { status: 500 });
}

/**
 * In-memory brute-force rate limiter for admin login attempts
 * Limits IP + Email combinations to 5 failed attempts per 15-minute window, cleanly resetting after expiry.
 */
interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil?: number;
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const loginRateLimitMap = new Map<string, RateLimitEntry>();

function pruneExpiredRateLimits(now: number) {
  if (loginRateLimitMap.size <= 500) return;
  for (const [key, entry] of loginRateLimitMap.entries()) {
    const expiredWindow = now - entry.firstAttemptAt >= RATE_LIMIT_WINDOW_MS;
    const unlocked = !entry.lockedUntil || entry.lockedUntil <= now;
    if (expiredWindow && unlocked) {
      loginRateLimitMap.delete(key);
    }
  }
}

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimitMap.get(identifier);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  // Reset expired lockouts or expired attempt windows cleanly (prevents permanent lockout)
  if ((entry.lockedUntil && entry.lockedUntil <= now) || now - entry.firstAttemptAt >= RATE_LIMIT_WINDOW_MS) {
    loginRateLimitMap.delete(identifier);
    return { allowed: true };
  }

  if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    entry.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
    const retryAfterSeconds = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): void {
  const now = Date.now();
  pruneExpiredRateLimits(now);

  const existing = loginRateLimitMap.get(identifier);
  const shouldReset =
    !existing ||
    (existing.lockedUntil && existing.lockedUntil <= now) ||
    now - existing.firstAttemptAt >= RATE_LIMIT_WINDOW_MS;

  const entry: RateLimitEntry = shouldReset
    ? { attempts: 1, firstAttemptAt: now }
    : {
        attempts: existing.attempts + 1,
        firstAttemptAt: existing.firstAttemptAt,
        lockedUntil: existing.lockedUntil,
      };

  if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    entry.lockedUntil = now + RATE_LIMIT_WINDOW_MS;
  }

  loginRateLimitMap.set(identifier, entry);
}

export function clearLoginRateLimit(identifier: string): void {
  loginRateLimitMap.delete(identifier);
}
