import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AdminRole } from '@/models/Admin';

export const ADMIN_COOKIE_NAME = 'mnc_admin_session';
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

export interface AdminJWTPayload {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  [key: string]: any;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET environment variable must be set with at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Sign an admin session JWT using jose (HS256)
 */
export async function signAdminToken(payload: AdminJWTPayload): Promise<string> {
  const secret = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject(payload.id)
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secret);
}

/**
 * Verify and decode an admin session JWT
 */
export async function verifyAdminToken(token: string): Promise<AdminJWTPayload | null> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });

    if (!payload.id || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || '',
      role: payload.role as AdminRole,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Configure standard secure HTTP-only cookie options for admin session
 */
export function getAdminCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  };
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
 * Enforce admin authentication on server actions and route handlers
 * Throws an Error or returns null if not authenticated
 */
export async function requireAdminSession(
  allowedRoles?: AdminRole[],
  request?: NextRequest
): Promise<AdminJWTPayload> {
  const session = await getAdminSession(request);

  if (!session) {
    throw new Error('UNAUTHORIZED: No active admin session');
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    throw new Error('FORBIDDEN: Insufficient role permissions');
  }

  return session;
}

/**
 * Request Origin / CSRF validator for state-changing POST/PUT/DELETE requests
 */
export function validateRequestOrigin(request: Request): boolean {
  // Allow all in test or development if no origin header present
  const origin = request.headers.get('origin');
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');

  if (!origin || !host) {
    // Standard direct API or same-host requests without origin
    return true;
  }

  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/**
 * In-memory brute-force rate limiter for admin login attempts
 * Limits IP + Email combinations to 5 failed attempts per 15 minutes
 */
interface RateLimitEntry {
  attempts: number;
  lockedUntil?: number;
}

const loginRateLimitMap = new Map<string, RateLimitEntry>();

export function checkLoginRateLimit(identifier: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  const lockDurationMs = 15 * 60 * 1000;

  const entry = loginRateLimitMap.get(identifier);

  if (!entry) {
    return { allowed: true };
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  if (entry.attempts >= maxAttempts) {
    entry.lockedUntil = now + lockDurationMs;
    const retryAfterSeconds = Math.ceil(lockDurationMs / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

export function recordFailedLogin(identifier: string): void {
  const entry = loginRateLimitMap.get(identifier) || { attempts: 0 };
  entry.attempts += 1;
  if (entry.attempts >= 5) {
    entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  }
  loginRateLimitMap.set(identifier, entry);
}

export function clearLoginRateLimit(identifier: string): void {
  loginRateLimitMap.delete(identifier);
}
