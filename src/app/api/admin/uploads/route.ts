import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { deleteCloudinaryImage } from '@/lib/storage/cloudinary';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate admin
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json().catch(() => null);
    if (!body || !body.publicId) {
      return NextResponse.json(
        { success: false, message: 'publicId is required in request body.' },
        { status: 400 }
      );
    }

    const { publicId, currentProductId } = body;

    // 2. Validate folder scope
    if (!publicId.startsWith('mnc-lifestyle/products/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid publicId. Deletions are restricted to the approved products folder.',
        },
        { status: 403 }
      );
    }

    // 3. Shared Image Protection Check
    // Check if another product in Atlas references this publicId or URL
    const productQuery: any = {
      $or: [
        { 'imageDetails.key': publicId },
        { images: { $regex: publicId } },
      ],
    };

    if (currentProductId && mongoose.Types.ObjectId.isValid(currentProductId)) {
      productQuery._id = { $ne: currentProductId };
    }

    const [sharedProduct, sharedCollection] = await Promise.all([
      Product.findOne(productQuery).select('name sku').lean(),
      Collection.findOne({ image: { $regex: publicId } }).select('title slug').lean(),
    ]);

    if (sharedProduct || sharedCollection) {
      const referencedIn = sharedProduct
        ? `Product "${sharedProduct.name}" (${sharedProduct.sku})`
        : `Curated Collection "${sharedCollection?.title}"`;

      return NextResponse.json({
        success: true,
        shared: true,
        message: `Asset is shared with ${referencedIn}. Removed reference from current piece without deleting shared master file.`,
      });
    }

    // 4. Safe Cloudinary deletion
    const deleteResult = await deleteCloudinaryImage(publicId);

    if (!deleteResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: `Cloudinary deletion response: ${deleteResult.result}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Image "${publicId}" deleted from Cloudinary successfully.`,
      result: deleteResult.result,
    });
  } catch (error: any) {
    if (error.message?.startsWith('UNAUTHORIZED')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    console.error('[Upload DELETE Error]:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete asset' },
      { status: 500 }
    );
  }
}
