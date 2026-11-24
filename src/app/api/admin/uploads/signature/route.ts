import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  generateUploadSignature,
  generateProductImagePublicId,
  CLOUDINARY_PRODUCTS_FOLDER,
  ALLOWED_FORMATS,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/storage/cloudinary';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate admin
    await requireAdminSession(undefined, request);

    // 2. Parse body
    const body = await request.json().catch(() => ({}));
    const { format, size, productIdentifier } = body;

    // 3. Format validation
    if (format) {
      const normalizedFormat = format.toLowerCase().replace('image/', '');
      const isAllowed = ALLOWED_FORMATS.some(
        (f) => f === normalizedFormat || (f === 'jpeg' && normalizedFormat === 'jpg')
      );
      if (!isAllowed) {
        return NextResponse.json(
          {
            success: false,
            message: `Unsupported file format "${format}". Allowed formats: JPG, JPEG, PNG, WebP.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. File size validation (<= 8 MB)
    if (size && Number(size) > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the 8 MB maximum limit (${(Number(size) / (1024 * 1024)).toFixed(1)} MB uploaded).`,
        },
        { status: 400 }
      );
    }

    // 5. Generate secure public ID
    const publicId = generateProductImagePublicId(productIdentifier || 'piece');

    // 6. Generate signed parameters
    const signatureData = generateUploadSignature({
      folder: CLOUDINARY_PRODUCTS_FOLDER,
      public_id: publicId,
    });

    return NextResponse.json({
      success: true,
      ...signatureData,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    console.error('[Upload Signature Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to generate upload signature' },
      { status: 500 }
    );
  }
}
