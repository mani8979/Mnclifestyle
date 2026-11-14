/**
 * MNC LifeStyle — Furniture Categories
 * 12 Indian Market Pepperfry-inspired furniture categories with high-definition assets.
 */

export const categories = [
  {
    id: 'sofas',
    legacyId: 'living-room',
    name: 'Sofas',
    title: 'Luxury Sofas & Couches',
    tagline: 'Sanctuaries for Living & Entertaining',
    description: 'Sculptural 3-seaters, bouclé couches, and teak-framed seating engineered for deep sink-in comfort and enduring elegance.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Curated Seating',
    subcategories: ['3-Seater Sofas', '2-Seater Loveseats', 'Curved Bouclé', 'Chesterfields']
  },
  {
    id: 'beds',
    legacyId: 'bedroom',
    name: 'Beds',
    title: 'Solid Wood Beds & Suites',
    tagline: 'Quiet Luxury for Restorative Sleep',
    description: 'Platform beds crafted in seasoned teakwood and solid oak with upholstered headboards and hydraulic storage options.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Bedroom Sanctuary',
    subcategories: ['King Size Beds', 'Queen Size Beds', 'Hydraulic Storage Beds', 'Upholstered Headboards']
  },
  {
    id: 'dining-sets',
    legacyId: 'dining',
    name: 'Dining Sets',
    title: 'Handcrafted Dining Tables & Chairs',
    tagline: 'Where Indian Family Gatherings Flourish',
    description: 'Solid timber dining tables paired with ergonomic cushioned chairs tailored for everyday hospitality and grand festivities.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Dining Suites',
    subcategories: ['6-Seater Sets', '8-Seater Grand Suites', 'Marble-Top Tables', 'Solid Teak Dining']
  },
  {
    id: 'study-tables',
    name: 'Study Tables',
    title: 'Ergonomic Study Desks & Tables',
    tagline: 'Designed for Focused Living & Learning',
    description: 'Solid wood study tables with integrated cable management, paper drawers, and contemporary Scandinavian silhouettes.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Study & Desks',
    subcategories: ['Compact Writing Desks', 'Executive Study Tables', 'Storage Desks', 'Solid Teak Workstations']
  },
  {
    id: 'centre-tables',
    legacyId: 'coffee-tables',
    name: 'Centre Tables',
    title: 'Sculptural Centre & Coffee Tables',
    tagline: 'The Anchor of Every Living Space',
    description: 'Roman travertine stone, fluted brass accents, and bookmatched walnut centerpieces that elevate conversational spaces.',
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Centre Pieces',
    subcategories: ['Travertine & Marble', 'Solid Walnut', 'Nesting Coffee Tables', 'Glass & Metal']
  },
  {
    id: 'recliners',
    name: 'Recliners',
    title: 'Ergonomic Motorized & Manual Recliners',
    tagline: 'Ultimate Comfort at the Touch of a Button',
    description: 'Motorized single-seater recliners upholstered in top-grain genuine leather and performance velvet with multi-angle support.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Power Loungers',
    subcategories: ['Motorized Recliners', 'Manual Rocker Recliners', 'Genuine Leather Loungers', 'Fabric Swivel Recliners']
  },
  {
    id: 'sectional-sofas',
    name: 'Sectional Sofas',
    title: 'Spacious L-Shaped & U-Shaped Sectionals',
    tagline: 'Expansive Seating for Modern Living Rooms',
    description: 'Modular sectionals that configure effortlessly to your room dimensions, with sink-in feather blend cushions and washable linen covers.',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    itemCount: 2,
    subtitle: 'Modular Living',
    subcategories: ['Left-Facing Sectionals', 'Right-Facing Sectionals', 'U-Shaped Family Modulars', 'Sleeper Sectionals']
  },
  {
    id: 'wardrobes',
    name: 'Wardrobes',
    title: 'Artisan Wardrobes & Armoires',
    tagline: 'Intelligent Organization in Timeless Timber',
    description: 'Solid wood hinged and sliding wardrobes with customized internal compartments, soft-close hardware, and mirror accents.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    subtitle: 'Artisan Armoires',
    subcategories: ['3-Door Wardrobes', '4-Door Grand Armoires', 'Sliding Door Wardrobes', 'Walk-in Closets']
  },
  {
    id: 'cabinets-sideboards',
    legacyId: 'storage',
    name: 'Cabinets & Sideboards',
    title: 'Buffets, Credenzas & Consoles',
    tagline: 'Artful Concealment in Architectural Form',
    description: 'Fluted wood buffets, slatted media units, and display credenzas blending storage function with museum-worthy aesthetics.',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    subtitle: 'Credenzas & Storage',
    subcategories: ['Dining Sideboards', 'TV Media Consoles', 'Fluted Credenzas', 'Bar Cabinets']
  },
  {
    id: 'office-furniture',
    legacyId: 'office',
    name: 'Office Furniture',
    title: 'Executive Desks & Ergonomic Seating',
    tagline: 'Productivity Harmonized with Luxury',
    description: 'Solid hardwood executive desks, leather conference seating, and minimalist credenzas designed for high-performing Indian professionals.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    subtitle: 'Executive Suite',
    subcategories: ['Executive Desks', 'High-Back Ergonomic Chairs', 'Bookshelves & Vitrines', 'Conference Tables']
  },
  {
    id: 'shoe-racks',
    name: 'Shoe Racks',
    title: 'Ventilated Entryway Shoe Storage',
    tagline: 'Order and Serenity at Your Doorstep',
    description: 'Naturally ventilated louvered shoe cabinets in solid teakwood with integrated seating benches and hidden storage drawers.',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    subtitle: 'Entryway Consoles',
    subcategories: ['Shoe Cabinets with Bench', 'Louvered Door Racks', 'Multi-Tier Organizers', 'Compact Entryway Consoles']
  },
  {
    id: 'bar-furniture',
    name: 'Bar Furniture',
    title: 'Home Bar Units, Counters & Stools',
    tagline: 'Sophisticated Entertaining at Home',
    description: 'Compact wine credenzas, solid wood bar cabinets with stemware racks, and brass-trimmed leather bar stools.',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
    itemCount: 1,
    subtitle: 'Bar & Lounge',
    subcategories: ['Wine & Bar Cabinets', 'Counter-Height Bar Stools', 'Bar Carts & Trolleys', 'Wall-Mounted Bars']
  }
];

// Helper to find category by id or legacy id
export const findCategoryById = (id) => {
  if (!id) return null;
  return categories.find((c) => c.id === id || c.legacyId === id);
};
