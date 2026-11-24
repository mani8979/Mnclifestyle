import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envCheck = {
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    mongoUriPrefix: process.env.MONGODB_URI
      ? process.env.MONGODB_URI.substring(0, 14) + '...'
      : 'MISSING',
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    authSecretValidLength: Boolean(
      process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32
    ),
    authSecretLength: process.env.AUTH_SECRET?.length || 0,
    hasCloudinary: Boolean(process.env.CLOUDINARY_URL),
    adminEmailConfigured: Boolean(process.env.ADMIN_EMAIL),
    nodeEnv: process.env.NODE_ENV,
  };

  let dbStatus = 'disconnected';
  let dbError: string | null = null;

  try {
    await connectDB();
    dbStatus =
      mongoose.connection.readyState === 1
        ? 'connected'
        : `readyState_${mongoose.connection.readyState}`;
  } catch (err: any) {
    dbStatus = 'connection_failed';
    dbError = err?.message || String(err);
  }

  return NextResponse.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    database: {
      status: dbStatus,
      error: dbError,
    },
    environment: envCheck,
    timestamp: new Date().toISOString(),
  });
}
