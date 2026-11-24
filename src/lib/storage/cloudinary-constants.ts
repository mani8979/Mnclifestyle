export const CLOUDINARY_PRODUCTS_FOLDER = 'mnc-lifestyle/products';
export const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'] as const;
export type AllowedImageFormat = (typeof ALLOWED_FORMATS)[number];

export const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_FILE_SIZE_MB = 8;
export const MAX_GALLERY_IMAGES = 10;
