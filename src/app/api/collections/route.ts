import { NextResponse } from 'next/server';
import { getCollections } from '@/services/collectionService';

export async function GET() {
  try {
    const collections = await getCollections();
    return NextResponse.json({
      success: true,
      count: collections.length,
      total: collections.length,
      collections,
      data: collections,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
