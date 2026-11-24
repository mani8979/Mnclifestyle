import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Admin } from '@/models/Admin';
import { getAdminSession, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession(request);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: No active admin session' },
        { status: 401 }
      );
    }

    await connectDB();
    const admin = await Admin.findById(session.id);

    if (!admin || !admin.isActive) {
      // Invalidate cookie if account was deleted or disabled
      const response = NextResponse.json(
        { success: false, message: 'Account is no longer active' },
        { status: 401 }
      );
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: '',
        httpOnly: true,
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt,
        createdAt: admin.createdAt,
      },
    });
  } catch (error: any) {
    console.error('[Admin Me Error]:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
