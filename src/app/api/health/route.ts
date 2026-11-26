import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (err) {
    console.error('[Health Check] Database connection failed:', err);
  }

  const healthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      database: {
        status: dbStatus,
      },
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
