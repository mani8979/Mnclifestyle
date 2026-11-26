import { SignJWT, jwtVerify } from 'jose';
import type { AdminRole } from '@/models/Admin';

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
  } catch {
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
