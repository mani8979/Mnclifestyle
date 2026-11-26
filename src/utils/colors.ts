/**
 * Pure isomorphic color helpers shared by Storefront and Admin UI.
 */

export interface ColorSwatchItem {
  name: string;
  hex: string;
  slug?: string;
}

export interface AvailableColorFilterOption {
  key: string;
  name: string;
  hex: string;
  count: number;
}

const DEFAULT_FALLBACK_HEX = '#211710';

const NAMED_PALETTE: Array<{ name: string; rgb: [number, number, number] }> = [
  { name: 'Dark Walnut', rgb: [33, 23, 16] },
  { name: 'Espresso', rgb: [54, 38, 28] },
  { name: 'Teak Brown', rgb: [120, 74, 42] },
  { name: 'Honey Oak', rgb: [181, 128, 76] },
  { name: 'Warm Beige', rgb: [214, 194, 168] },
  { name: 'Ivory White', rgb: [232, 227, 220] },
  { name: 'Pure White', rgb: [250, 250, 250] },
  { name: 'Charcoal', rgb: [45, 48, 52] },
  { name: 'Slate Grey', rgb: [112, 118, 128] },
  { name: 'Navy Blue', rgb: [37, 50, 91] },
  { name: 'Royal Blue', rgb: [44, 82, 146] },
  { name: 'Sage Green', rgb: [118, 138, 115] },
  { name: 'Forest Green', rgb: [38, 78, 54] },
  { name: 'Burgundy', rgb: [110, 34, 42] },
  { name: 'Terracotta', rgb: [176, 86, 58] },
];

/**
 * Infer a human-readable colour name from a hex code when an explicit colour name is missing.
 */
export function inferColorNameFromHex(hex?: string): string {
  if (typeof hex !== 'string') return '';
  const cleaned = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return '';
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);

  let bestName = '';
  let bestDist = Infinity;
  for (const entry of NAMED_PALETTE) {
    const dr = r - entry.rgb[0];
    const dg = g - entry.rgb[1];
    const db = b - entry.rgb[2];
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      bestName = entry.name;
    }
  }
  return bestName;
}

export function getProductPrimaryColor(product: any): ColorSwatchItem | null {
  if (!product) return null;
  const directName = typeof product.colorName === 'string' ? product.colorName.trim() : '';
  const directHex = typeof product.colorHex === 'string' ? product.colorHex.trim() : '';

  if (directName) {
    const matchedSwatch = Array.isArray(product.colors)
      ? product.colors.find(
          (c: any) => typeof c?.name === 'string' && c.name.trim().toLowerCase() === directName.toLowerCase()
        )
      : null;
    return {
      name: directName,
      hex: directHex || matchedSwatch?.hex || DEFAULT_FALLBACK_HEX,
    };
  }

  if (Array.isArray(product.colors) && product.colors.length > 0 && product.colors[0]?.name) {
    return {
      name: product.colors[0].name.trim(),
      hex: product.colors[0].hex || directHex || DEFAULT_FALLBACK_HEX,
    };
  }

  return null;
}

export function getProductDisplaySwatches(product: any): ColorSwatchItem[] {
  if (!product) return [];

  const seen = new Set<string>();
  const result: ColorSwatchItem[] = [];

  const pushUnique = (name?: string, hex?: string, slug?: string) => {
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) return;
    const key = cleanName.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push({
      name: cleanName,
      hex: (typeof hex === 'string' && hex.trim()) || DEFAULT_FALLBACK_HEX,
      ...(slug ? { slug } : {}),
    });
  };

  if (Array.isArray(product.colorVariants) && product.colorVariants.length > 1) {
    for (const variant of product.colorVariants) {
      pushUnique(variant.colorName || variant.name, variant.colorHex, variant.slug);
    }
    return result;
  }

  const primary = getProductPrimaryColor(product);
  if (primary) {
    pushUnique(primary.name, primary.hex, product.slug);
  }

  if (Array.isArray(product.colors)) {
    for (const c of product.colors) {
      pushUnique(c?.name, c?.hex);
    }
  }

  return result;
}

export function collectAvailableColors(products: any[]): AvailableColorFilterOption[] {
  if (!Array.isArray(products)) return [];
  const map = new Map<string, AvailableColorFilterOption>();

  for (const product of products) {
    const productKeysSeen = new Set<string>();
    const candidates: Array<{ name: string; hex: string }> = [];

    const primary = getProductPrimaryColor(product);
    if (primary) candidates.push(primary);

    if (Array.isArray(product?.colors)) {
      for (const c of product.colors) {
        if (c?.name?.trim()) {
          candidates.push({ name: c.name.trim(), hex: c.hex || DEFAULT_FALLBACK_HEX });
        }
      }
    }

    for (const item of candidates) {
      const key = item.name.toLowerCase();
      if (productKeysSeen.has(key)) continue;
      productKeysSeen.add(key);

      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
        if ((!existing.hex || existing.hex === DEFAULT_FALLBACK_HEX) && item.hex) {
          existing.hex = item.hex;
        }
      } else {
        map.set(key, {
          key,
          name: item.name,
          hex: item.hex || DEFAULT_FALLBACK_HEX,
          count: 1,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export interface SingleProductSwatchVariant {
  _id: string;
  slug: string;
  colorName: string;
  colorHex: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  isProductVariant: false;
}

/**
 * Builds deduplicated Amazon-style swatch cards for a single product's `colors[]` array.
 * Explicit per-color `image` values take priority; gallery fallbacks are only used once each
 * so cards never repeat identical duplicate thumbnails when colors outnumber unique photos.
 */
export function buildSingleProductSwatchVariants(
  product: any,
  idPrefix = 'swatch'
): SingleProductSwatchVariant[] {
  if (!product || !Array.isArray(product.colors) || product.colors.length === 0) {
    return [];
  }

  const gallery = Array.isArray(product.images)
    ? product.images.filter((img: any) => typeof img === 'string' && img.trim().length > 0)
    : [];

  const uniqueColors: any[] = [];
  const seenNames = new Set<string>();
  for (const c of product.colors) {
    const cleanName = typeof c?.name === 'string' ? c.name.trim() : '';
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();
    if (seenNames.has(key)) continue;
    seenNames.add(key);
    uniqueColors.push({ ...c, name: cleanName });
  }

  const usedImages = new Set<string>();
  for (const c of uniqueColors) {
    if (typeof c.image === 'string' && c.image.trim()) {
      usedImages.add(c.image.trim());
    }
  }

  let fallbackCursor = 0;

  return uniqueColors.map((c, idx) => {
    const explicitImage = typeof c.image === 'string' ? c.image.trim() : '';
    let resolvedImage = explicitImage;

    if (!resolvedImage) {
      while (fallbackCursor < gallery.length) {
        const candidate = gallery[fallbackCursor].trim();
        fallbackCursor += 1;
        if (!usedImages.has(candidate)) {
          resolvedImage = candidate;
          usedImages.add(candidate);
          break;
        }
      }
    }

    const customPrice = Number(c.price);
    const customOriginalPrice = Number(c.originalPrice);

    return {
      _id: `${idPrefix}-${idx}-${c.name}`,
      slug: product.slug || '',
      colorName: c.name,
      colorHex: (typeof c.hex === 'string' && c.hex.trim()) || DEFAULT_FALLBACK_HEX,
      name: c.name,
      price: customPrice > 0 ? customPrice : Number(product.price) || 0,
      originalPrice:
        customOriginalPrice > 0
          ? customOriginalPrice
          : customPrice > 0
          ? 0
          : Number(product.originalPrice) || 0,
      image: resolvedImage,
      inStock: c.inStock !== false,
      isProductVariant: false,
    };
  });
}

export function matchesSelectedColor(product: any, selectedColorKey: string): boolean {
  if (!selectedColorKey || selectedColorKey === 'all') return true;
  const target = selectedColorKey.trim().toLowerCase();

  const primary = getProductPrimaryColor(product);
  if (primary && primary.name.toLowerCase() === target) {
    return true;
  }

  if (
    Array.isArray(product?.colors) &&
    product.colors.some((c: any) => typeof c?.name === 'string' && c.name.trim().toLowerCase() === target)
  ) {
    return true;
  }

  return false;
}
