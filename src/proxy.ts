import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = token ? await verifyAdminToken(token) : null;

  // 1. Allow login endpoint itself
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    // If admin is already logged in, redirect away from login page to dashboard
    if (session && pathname === '/admin/login') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Protect Admin Pages (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
