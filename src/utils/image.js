export const DEFAULT_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80';

const OPTIMIZABLE_HOST_SUFFIXES = [
  'images.unsplash.com',
  'res.cloudinary.com',
  '.r2.dev',
  '.cloudflare.com',
  '.mnclifestyle.in',
  'mnclifestyle.in',
];

/**
 * Returns a valid Next.js Image `src` string (local `/...` or valid http/https URL),
 * falling back cleanly if empty or malformed so SSR never throws `Invalid src prop`.
 */
export function getSafeImageSrc(src, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (typeof src !== 'string') return fallback;
  const trimmed = src.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith('/')) return trimmed;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return trimmed;
    }
  } catch {
    // Malformed URL falls back to safe default image
  }
  return fallback;
}

/**
 * Returns true if the URL points to a third-party host not listed in next.config.mjs `remotePatterns`,
 * allowing `<Image unoptimized />` instead of crashing SSR when admins paste direct image URLs.
 */
export function shouldUnoptimizeImage(src) {
  const safeSrc = getSafeImageSrc(src);
  if (safeSrc.startsWith('/')) return false;

  try {
    const { hostname, protocol } = new URL(safeSrc);
    if (protocol !== 'https:') return true;
    const lowerHost = hostname.toLowerCase();
    return !OPTIMIZABLE_HOST_SUFFIXES.some((allowed) =>
      allowed.startsWith('.') ? lowerHost.endsWith(allowed) : lowerHost === allowed
    );
  } catch {
    return true;
  }
}
