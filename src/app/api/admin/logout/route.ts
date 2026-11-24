import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, validateRequestOrigin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    if (!validateRequestOrigin(request)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear HTTP-only session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Logout Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
