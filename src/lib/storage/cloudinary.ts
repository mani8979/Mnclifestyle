import { v2 as cloudinary } from 'cloudinary';
export * from './cloudinary-constants';
import { CLOUDINARY_PRODUCTS_FOLDER, ALLOWED_FORMATS, MAX_FILE_SIZE_BYTES, MAX_GALLERY_IMAGES } from './cloudinary-constants';

function parseCloudinaryUrl() {
  const envUrl = process.env.CLOUDINARY_URL;
  if (!envUrl) {
    throw new Error('CLOUDINARY_URL environment variable is missing.');
  }

  const match = envUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
  }

  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
}

let isConfigured = false;
export function ensureCloudinaryConfig() {
  if (isConfigured) return;
  const config = parseCloudinaryUrl();
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });
  isConfigured = true;
}

export function getCloudinaryClient() {
  ensureCloudinaryConfig();
  return cloudinary;
}

export function getCloudinaryPublicConfig() {
  const { apiKey, cloudName } = parseCloudinaryUrl();
  return {
    apiKey,
    cloudName,
    folder: CLOUDINARY_PRODUCTS_FOLDER,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Generate a clean, unique public ID for product imagery.
 * Format: mnc-lifestyle/products/<slug-or-sku>-<timestamp>-<rand>
 */
export function generateProductImagePublicId(productIdentifier: string = 'product'): string {
  const sanitized = productIdentifier
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40);

  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);
  return `${CLOUDINARY_PRODUCTS_FOLDER}/${sanitized}-${timestamp}-${rand}`;
}

/**
 * Generate a secure upload signature for direct browser uploads.
 * Signs parameters with Cloudinary API secret on the server.
 */
export function generateUploadSignature(params: {
  folder?: string;
  public_id?: string;
  timestamp?: number;
  [key: string]: any;
}) {
  ensureCloudinaryConfig();
  const { apiKey, apiSecret, cloudName } = parseCloudinaryUrl();

  const timestamp = params.timestamp || Math.round(Date.now() / 1000);
  const folder = params.folder || CLOUDINARY_PRODUCTS_FOLDER;
  const publicId = params.public_id || generateProductImagePublicId();

  // Cloudinary requires signing the exact parameters that will be passed in POST body
  const paramsToSign: Record<string, any> = {
    folder,
    public_id: publicId,
    timestamp,
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return {
    signature,
    timestamp,
    apiKey,
    cloudName,
    folder,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  };
}

/**
 * Safely delete an image asset from Cloudinary by its public ID.
 * Returns { success: boolean, result: string }.
 */
export async function deleteCloudinaryImage(publicId: string): Promise<{ success: boolean; result: string }> {
  ensureCloudinaryConfig();

  // Enforce folder scope safety: only allow deleting assets in mnc-lifestyle/products
  if (!publicId.startsWith('mnc-lifestyle/products/')) {
    throw new Error(`Unauthorized asset deletion: publicId "${publicId}" is outside approved folder.`);
  }

  try {
    const res = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'image',
    });
    return {
      success: res.result === 'ok',
      result: res.result,
    };
  } catch (error: any) {
    console.error(`[Cloudinary Destroy Error] Failed to delete publicId "${publicId}":`, error);
    return {
      success: false,
      result: error.message || 'Deletion failed',
    };
  }
}

/**
 * Extract publicId from a standard Cloudinary CDN URL.
 * e.g., https://res.cloudinary.com/dtii8jmyd/image/upload/v12345/mnc-lifestyle/products/abc.jpg -> mnc-lifestyle/products/abc
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  if (!url.includes('res.cloudinary.com')) return null;

  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(mnc-lifestyle\/products\/[^.]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Generate an optimized responsive Cloudinary delivery URL with f_auto,q_auto.
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: { width?: number; height?: number; crop?: string; quality?: string | number } = {}
): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const transformations: string[] = ['f_auto', 'q_auto'];
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);

  const transformString = transformations.join(',');
  return url.replace('/image/upload/', `/image/upload/${transformString}/`);
}
