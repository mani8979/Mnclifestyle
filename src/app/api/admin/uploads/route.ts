import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAdminSession, assertValidOrigin, handleApiError } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Collection } from '@/models/Collection';
import { Category } from '@/models/Category';
import { escapeRegex } from '@/lib/category-cleanup';
import { deleteCloudinaryImage } from '@/lib/storage/cloudinary';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    assertValidOrigin(request);
    await requireAdminSession(undefined, request);
    await connectDB();

    const body = await request.json().catch(() => null);
    if (!body || typeof body.publicId !== 'string' || !body.publicId.trim()) {
      return NextResponse.json(
        { success: false, message: 'publicId is required in request body.' },
        { status: 400 }
      );
    }

    const publicId = body.publicId.trim();
    const currentProductId = typeof body.currentProductId === 'string' ? body.currentProductId.trim() : '';

    if (!publicId.startsWith('mnc-lifestyle/products/')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid publicId. Deletions are restricted to the approved products folder.',
        },
        { status: 403 }
      );
    }

    const safePublicIdPattern = escapeRegex(publicId);

    const productQuery: any = {
      isArchived: { $ne: true },
      $or: [
        { 'imageDetails.key': publicId },
        { images: { $regex: safePublicIdPattern } },
        { 'colors.image': { $regex: safePublicIdPattern } },
        { 'seoMeta.ogImage': { $regex: safePublicIdPattern } },
      ],
    };

    if (currentProductId && mongoose.Types.ObjectId.isValid(currentProductId)) {
      productQuery._id = { $ne: currentProductId };
    }

    const [sharedProduct, sharedCollection, sharedCategory] = await Promise.all([
      Product.findOne(productQuery).select('name sku').lean(),
      Collection.findOne({ image: { $regex: safePublicIdPattern } }).select('title slug').lean(),
      Category.findOne({
        $or: [{ imageKey: publicId }, { image: { $regex: safePublicIdPattern } }],
      })
        .select('name slug')
        .lean(),
    ]);

    if (sharedProduct || sharedCollection || sharedCategory) {
      const referencedIn = sharedProduct
        ? `Product "${sharedProduct.name}" (${sharedProduct.sku})`
        : sharedCollection
          ? `Curated Collection "${sharedCollection.title}"`
          : `Category "${sharedCategory?.name}"`;

      return NextResponse.json({
        success: true,
        shared: true,
        message: `Asset is shared with ${referencedIn}. Removed reference from current piece without deleting shared master file.`,
      });
    }

    const deleteResult = await deleteCloudinaryImage(publicId);

    if (!deleteResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cloudinary deletion could not be completed.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Image "${publicId}" deleted from Cloudinary successfully.`,
      result: deleteResult.result,
    });
  } catch (error) {
    return handleApiError(error, 'Failed to delete uploaded media asset', '[Upload DELETE Error]');
  }
}
