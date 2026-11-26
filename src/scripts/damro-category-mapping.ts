/**
 * Category mapping helper for importing external catalog records
 * into MNC LifeStyle's existing MongoDB Category & Subcategory structure.
 *
 * Strictly read-only with respect to Category documents: never creates new categories.
 */

export interface ExistingCategoryDoc {
  slug: string;
  legacyId?: string | null;
  name: string;
  subcategories?: string[];
  isActive?: boolean;
}

export interface CategoryMappingRule {
  targetSlug: string;
  defaultSubCategory: string;
  subCategoryAliases: Record<string, string>;
}

export interface CategoryResolutionResult {
  matched: boolean;
  targetCategorySlug?: string;
  targetCategoryLabel?: string;
  targetSubCategory?: string;
  reason?: string;
}

function normalizeKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Exact, audited mapping from furniture catalog category labels to MNC LifeStyle's
 * existing MongoDB category slugs and their existing subcategories.
 */
export const SOURCE_CATEGORY_RULES: Record<string, CategoryMappingRule> = {
  // Living Room - Sofas -> existing slug `sectional-sofas` (Name: Sofas)
  sofas: {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: '3-Seater Sofas',
    subCategoryAliases: {
      'sofa sets': '3-Seater Sofas',
      'fabric sofas': '3-Seater Sofas',
      'leather sofas': '3-Seater Sofas',
      '3 seater sofas': '3-Seater Sofas',
      'three seater sofas': '3-Seater Sofas',
      '2 seater sofas': '2-Seater Loveseats',
      '2 seater loveseats': '2-Seater Loveseats',
      loveseats: '2-Seater Loveseats',
      'corner sofas': 'L-Shaped Sectionals',
      'l shaped sofas': 'L-Shaped Sectionals',
      'l shaped sectionals': 'L-Shaped Sectionals',
      'sectional sofas': 'L-Shaped Sectionals',
      'curved boucle sofas': 'Curved Bouclé Sofas',
    },
  },
  'sofa sets': {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: '3-Seater Sofas',
    subCategoryAliases: {},
  },
  'fabric sofas': {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: '3-Seater Sofas',
    subCategoryAliases: {},
  },
  'leather sofas': {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: '3-Seater Sofas',
    subCategoryAliases: {},
  },
  'corner sofas': {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: 'L-Shaped Sectionals',
    subCategoryAliases: {},
  },
  'sectional sofas': {
    targetSlug: 'sectional-sofas',
    defaultSubCategory: 'L-Shaped Sectionals',
    subCategoryAliases: {},
  },

  // Living Room - Recliners -> existing slug `recliners`
  recliners: {
    targetSlug: 'recliners',
    defaultSubCategory: 'Motorized Recliners',
    subCategoryAliases: {
      'motorized recliners': 'Motorized Recliners',
      'motorised recliners': 'Motorized Recliners',
      'power recliners': 'Motorized Recliners',
      'manual recliners': 'Manual Rocker Recliners',
      'manual rocker recliners': 'Manual Rocker Recliners',
      'leather recliners': 'Genuine Leather Loungers',
      'genuine leather loungers': 'Genuine Leather Loungers',
      'fabric recliners': 'Fabric Swivel Recliners',
      'fabric swivel recliners': 'Fabric Swivel Recliners',
    },
  },

  // Living Room - Center / Coffee Tables -> existing slug `centre-tables`
  'center tables': {
    targetSlug: 'centre-tables',
    defaultSubCategory: 'Solid Teak Centre Tables',
    subCategoryAliases: {
      'travertine and marble': 'Travertine & Marble Tables',
      'travertine and marble tables': 'Travertine & Marble Tables',
      'marble tables': 'Travertine & Marble Tables',
      'marble top center tables': 'Travertine & Marble Tables',
      'wooden center tables': 'Solid Teak Centre Tables',
      'solid teak centre tables': 'Solid Teak Centre Tables',
      'nesting coffee tables': 'Nesting Coffee Tables',
      'nesting tables': 'Nesting Coffee Tables',
      'glass center tables': 'Fluted Glass Tables',
      'fluted glass tables': 'Fluted Glass Tables',
    },
  },
  'centre tables': {
    targetSlug: 'centre-tables',
    defaultSubCategory: 'Solid Teak Centre Tables',
    subCategoryAliases: {},
  },
  'coffee tables': {
    targetSlug: 'centre-tables',
    defaultSubCategory: 'Solid Teak Centre Tables',
    subCategoryAliases: {},
  },

  // Living Room - TV Stands & Entertainment Units -> existing slug `tv-stands-and-wall-units`
  'tv stands': {
    targetSlug: 'tv-stands-and-wall-units',
    defaultSubCategory: 'TV Stands and Wall Units',
    subCategoryAliases: {
      'wall mounted tv units': 'Wall Mounted TV Units',
      'media consoles': 'Solid Teak Media Consoles',
      'solid teak media consoles': 'Solid Teak Media Consoles',
      'fluted storage units': 'Fluted Storage Units',
      'entertainment units': 'Entertainment Centres',
      'entertainment centres': 'Entertainment Centres',
    },
  },
  'tv units': {
    targetSlug: 'tv-stands-and-wall-units',
    defaultSubCategory: 'TV Stands and Wall Units',
    subCategoryAliases: {},
  },
  'tv stands and wall units': {
    targetSlug: 'tv-stands-and-wall-units',
    defaultSubCategory: 'TV Stands and Wall Units',
    subCategoryAliases: {},
  },
  'entertainment units': {
    targetSlug: 'tv-stands-and-wall-units',
    defaultSubCategory: 'Entertainment Centres',
    subCategoryAliases: {},
  },

  // Bedroom - Beds -> existing slug `beds`
  beds: {
    targetSlug: 'beds',
    defaultSubCategory: 'Queen Size Beds',
    subCategoryAliases: {
      'queen size beds': 'Queen Size Beds',
      'queen beds': 'Queen Size Beds',
      'hydraulic beds': 'Hydraulic Storage Beds',
      'hydraulic storage beds': 'Hydraulic Storage Beds',
      'storage beds': 'Hydraulic Storage Beds',
      'upholstered beds': 'Upholstered Headboards',
      'upholstered headboards': 'Upholstered Headboards',
    },
  },
  'hydraulic beds': {
    targetSlug: 'beds',
    defaultSubCategory: 'Hydraulic Storage Beds',
    subCategoryAliases: {},
  },
  'queen size beds': {
    targetSlug: 'beds',
    defaultSubCategory: 'Queen Size Beds',
    subCategoryAliases: {},
  },
  'king size beds': {
    targetSlug: 'beds',
    defaultSubCategory: 'Queen Size Beds',
    subCategoryAliases: {},
  },
  'single beds': {
    targetSlug: 'beds',
    defaultSubCategory: 'Queen Size Beds',
    subCategoryAliases: {},
  },

  // Bedroom - Wardrobes -> existing canonical slug `wardrobes` (avoids duplicate empty `wardrobes-2`)
  wardrobes: {
    targetSlug: 'wardrobes',
    defaultSubCategory: '3-Door Wardrobes',
    subCategoryAliases: {
      '2 door wardrobes': '3-Door Wardrobes',
      '3 door wardrobes': '3-Door Wardrobes',
      '4 door wardrobes': '4-Door Grand Armoires',
      '4 door grand armoires': '4-Door Grand Armoires',
      'sliding door wardrobes': 'Sliding Door Wardrobes',
      'sliding wardrobes': 'Sliding Door Wardrobes',
      'walk in closets': 'Walk-in Closets',
      'modular wardrobes': 'Sliding Door Wardrobes',
    },
  },
  'modular wardrobes': {
    targetSlug: 'wardrobes',
    defaultSubCategory: 'Sliding Door Wardrobes',
    subCategoryAliases: {},
  },

  // Bedroom - Mattresses -> existing slug `mattresses`
  mattresses: {
    targetSlug: 'mattresses',
    defaultSubCategory: 'Orthopedic Memory Foam',
    subCategoryAliases: {
      'memory foam mattresses': 'Orthopedic Memory Foam',
      'orthopedic mattresses': 'Orthopedic Memory Foam',
      'orthopedic memory foam': 'Orthopedic Memory Foam',
      'latex mattresses': 'Natural Latex Mattresses',
      'natural latex mattresses': 'Natural Latex Mattresses',
      'spring mattresses': 'Pocket Spring Mattresses',
      'pocket spring mattresses': 'Pocket Spring Mattresses',
    },
  },

  // Dining - Dining Table Sets -> existing slug `dining-sets`
  'dining table sets': {
    targetSlug: 'dining-sets',
    defaultSubCategory: '6-Seater Sets',
    subCategoryAliases: {
      '4 seater dining sets': '6-Seater Sets',
      '6 seater sets': '6-Seater Sets',
      '6 seater dining sets': '6-Seater Sets',
      '8 seater grand suites': '8-Seater Grand Suites',
      '8 seater dining sets': '8-Seater Grand Suites',
      'marble top dining sets': 'Marble-Top Tables',
      'marble top tables': 'Marble-Top Tables',
      'solid teak dining': 'Solid Teak Dining',
      'wooden dining sets': 'Solid Teak Dining',
    },
  },
  'dining sets': {
    targetSlug: 'dining-sets',
    defaultSubCategory: '6-Seater Sets',
    subCategoryAliases: {},
  },
  'dining furniture': {
    targetSlug: 'dining-sets',
    defaultSubCategory: '6-Seater Sets',
    subCategoryAliases: {},
  },

  // Chairs -> existing slug `chairs`
  'dining chairs': {
    targetSlug: 'chairs',
    defaultSubCategory: 'Ergonomic Dining Chairs',
    subCategoryAliases: {},
  },
  chairs: {
    targetSlug: 'chairs',
    defaultSubCategory: 'Accent Armchairs',
    subCategoryAliases: {
      'accent armchairs': 'Accent Armchairs',
      'armchairs': 'Accent Armchairs',
      'ergonomic dining chairs': 'Ergonomic Dining Chairs',
      'dining chairs': 'Ergonomic Dining Chairs',
      'lounge seating': 'Lounge Seating',
      'lounge chairs': 'Lounge Seating',
      'solid teak chairs': 'Solid Teak Chairs',
      'wooden chairs': 'Solid Teak Chairs',
    },
  },

  // Office & Study Tables
  'office tables': {
    targetSlug: 'office-tables',
    defaultSubCategory: 'Executive Office Desks',
    subCategoryAliases: {
      'executive office desks': 'Executive Office Desks',
      'executive tables': 'Executive Office Desks',
      'ergonomic workstations': 'Ergonomic Workstations',
      'workstations': 'Ergonomic Workstations',
      'solid wood writing tables': 'Solid Wood Writing Tables',
      'writing tables': 'Solid Wood Writing Tables',
    },
  },
  'study tables': {
    targetSlug: 'study-and-computer-tables',
    defaultSubCategory: 'Compact Study Desks',
    subCategoryAliases: {
      'compact study desks': 'Compact Study Desks',
      'study desks': 'Compact Study Desks',
      'computer tables with drawers': 'Computer Tables with Drawers',
      'solid teak study tables': 'Solid Teak Study Tables',
    },
  },
  'computer tables': {
    targetSlug: 'study-and-computer-tables',
    defaultSubCategory: 'Computer Tables with Drawers',
    subCategoryAliases: {},
  },
  'study and computer tables': {
    targetSlug: 'study-and-computer-tables',
    defaultSubCategory: 'Compact Study Desks',
    subCategoryAliases: {},
  },

  // Modular Furniture
  'modular furniture': {
    targetSlug: 'modular-furniture',
    defaultSubCategory: 'Modular Storage Systems',
    subCategoryAliases: {
      'modular storage systems': 'Modular Storage Systems',
      'modular wall units': 'Modular Wall Units',
      'modular tv consoles': 'Modular TV Consoles',
    },
  },
};

/**
 * Source categories that do not have a dedicated category in MongoDB
 * and must be reported separately instead of auto-creating new categories.
 */
export const UNMATCHED_SOURCE_CATEGORIES: Record<string, string> = {
  'shoe racks': 'No "shoe-racks" category exists in the current MongoDB Category collection.',
  'dressing tables': 'No Dressing Tables category or subcategory exists in MongoDB.',
  'bedside tables': 'No Bedside Tables / Nightstands category or subcategory exists in MongoDB.',
  'crockery units': 'No Crockery Units / Sideboards category exists in MongoDB.',
  'office chairs': 'No Office / Executive / Visitor Chairs category or subcategory exists in MongoDB.',
  'executive chairs': 'No Office / Executive Chairs category or subcategory exists in MongoDB.',
  'visitor chairs': 'No Office / Visitor Chairs category or subcategory exists in MongoDB.',
  'office furniture': 'Too broad: Office Tables exists (`office-tables`), whereas Office Chairs has no target category.',
  cupboards: 'No generic Cupboards category exists in MongoDB (only `wardrobes`).',
  'storage furniture': 'No Storage Furniture category exists in MongoDB.',
  'shelving units': 'No Shelving Units category exists in MongoDB.',
  'modular kitchens': 'No Modular Kitchens category exists in MongoDB.',
  'sofa beds': 'No Sofa Beds category or subcategory exists in MongoDB.',
};

export function resolveExistingCategory(
  sourceCategory: string,
  sourceSubCategory: string | undefined,
  dbCategories: ExistingCategoryDoc[]
): CategoryResolutionResult {
  const normalizedCat = normalizeKey(sourceCategory || '');
  const normalizedSub = normalizeKey(sourceSubCategory || '');

  if (!normalizedCat) {
    return { matched: false, reason: 'Missing source category.' };
  }

  if (UNMATCHED_SOURCE_CATEGORIES[normalizedCat]) {
    return {
      matched: false,
      reason: UNMATCHED_SOURCE_CATEGORIES[normalizedCat],
    };
  }

  // First check direct DB category slug or name match (excluding duplicate empty `wardrobes-2` when `wardrobes` exists)
  const preferredCategories = [...dbCategories].sort((a, b) => {
    if (a.slug === 'wardrobes-2' && b.slug !== 'wardrobes-2') return 1;
    if (b.slug === 'wardrobes-2' && a.slug !== 'wardrobes-2') return -1;
    return 0;
  });

  const rule =
    (normalizedSub && SOURCE_CATEGORY_RULES[normalizedSub]) || SOURCE_CATEGORY_RULES[normalizedCat];

  let targetDbCat: ExistingCategoryDoc | undefined;
  if (rule) {
    targetDbCat = preferredCategories.find((c) => c.slug === rule.targetSlug);
  } else {
    targetDbCat = preferredCategories.find(
      (c) => normalizeKey(c.slug) === normalizedCat || normalizeKey(c.name) === normalizedCat
    );
  }

  if (!targetDbCat) {
    return {
      matched: false,
      reason: `No matching existing MongoDB category found for "${sourceCategory}".`,
    };
  }

  const availableSubs = Array.isArray(targetDbCat.subcategories) ? targetDbCat.subcategories : [];
  let resolvedSub = '';

  // 1. Direct case-insensitive match against existing DB subcategory
  if (normalizedSub) {
    const directSubMatch = availableSubs.find((s) => normalizeKey(s) === normalizedSub);
    if (directSubMatch) {
      resolvedSub = directSubMatch;
    }
  }

  // 2. Alias lookup within the category rule (checking sub first, then cat)
  if (!resolvedSub && rule) {
    const aliasTarget =
      (normalizedSub && rule.subCategoryAliases[normalizedSub]) ||
      rule.subCategoryAliases[normalizedCat] ||
      '';
    if (aliasTarget) {
      resolvedSub =
        availableSubs.find((s) => normalizeKey(s) === normalizeKey(aliasTarget)) || aliasTarget;
    }
  }

  // 3. Fallback to rule default or first DB subcategory
  if (!resolvedSub) {
    const defaultSub = rule?.defaultSubCategory || availableSubs[0] || targetDbCat.name;
    resolvedSub =
      availableSubs.find((s) => normalizeKey(s) === normalizeKey(defaultSub)) || defaultSub;
  }

  return {
    matched: true,
    targetCategorySlug: targetDbCat.slug,
    targetCategoryLabel: targetDbCat.name,
    targetSubCategory: resolvedSub,
  };
}
