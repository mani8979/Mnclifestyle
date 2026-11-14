/**
 * MNC LifeStyle — Products Data
 * Luxury Indian Furniture with Authentic INR Pricing and Handcrafted Specifications.
 */

export const products = [
  // 1. SOFAS
  {
    id: 'mnc-sof-01',
    name: 'Aura Curved Bouclé Sofa',
    category: 'sofas',
    categoryLabel: 'Sofas',
    subCategory: '3-Seater Sofas',
    price: 84999,
    originalPrice: 99999,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 38,
    shortDescription: 'Gently curved 3-seater sofa wrapped in textured Belgian bouclé with a concealed brushed brass plinth.',
    fullDescription: 'The Aura Curved Sofa reimagines conversational seating with soft, organic contours that flow effortlessly into contemporary Indian spaces. Handcrafted using seasoned kiln-dried teak interior frames and dual-density high-resilience foam cushioning, it balances sculptural poise with sink-in comfort. Its textured oatmeal bouclé fabric offers natural stain resistance while delivering sensory warmth to modern living rooms.',
    dimensions: {
      width: '240 cm (94.5 in)',
      depth: '105 cm (41.3 in)',
      height: '76 cm (29.9 in)',
      seatHeight: '43 cm (16.9 in)',
      weight: '72 kg'
    },
    materials: [
      'Textured Belgian Wool Bouclé (95% Wool, 5% Polyamide)',
      'Kiln-dried solid Teakwood and Birch interior frame',
      'Dual-layer high resilience foam with down topper',
      'Subtle recessed brass architectural base'
    ],
    colors: [
      { name: 'Oatmeal Bouclé', hex: '#EDE8E1', inStock: true },
      { name: 'Warm Charcoal', hex: '#343332', inStock: true },
      { name: 'Terra Cotta', hex: '#9E6756', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)',
    warranty: '10-Year Structural Frame & Termite Warranty',
    sku: 'MNC-SOF-001'
  },
  {
    id: 'mnc-sof-02',
    name: 'Elysian Solid Teak 3-Seater Sofa',
    category: 'sofas',
    categoryLabel: 'Sofas',
    subCategory: '3-Seater Sofas',
    price: 68500,
    originalPrice: 79900,
    badge: 'Signature Piece',
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 24,
    shortDescription: 'Exposed teakwood side rails with premium textured woven fabric cushions in neutral linen tones.',
    fullDescription: 'The Elysian Sofa celebrates the beauty of natural Indian teakwood with exposed finger-joint joinery and gentle chamfered edges. Designed specifically for tropical and coastal Indian climates, the timber is treated against moisture and humidity, while the high-density foam cushions maintain their firm structure for years.',
    dimensions: {
      width: '215 cm (84.6 in)',
      depth: '90 cm (35.4 in)',
      height: '78 cm (30.7 in)',
      seatHeight: '44 cm (17.3 in)',
      weight: '58 kg'
    },
    materials: [
      'Solid CP Teakwood Frame in Natural Honey Finish',
      'Heavyweight Breathable Cotton-Linen Blend Upholstery',
      'High-Density 38-Density Foam Core with Feather Topping',
      'Brass accent connectors'
    ],
    colors: [
      { name: 'Natural Sand Linen', hex: '#E2DACB', inStock: true },
      { name: 'Sage Olive', hex: '#6B7A68', inStock: true },
      { name: 'Deep Espresso', hex: '#3E2F26', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Delivery (4–8 Days)',
    warranty: '10-Year Teakwood Craftsmanship Guarantee',
    sku: 'MNC-SOF-002'
  },

  // 2. BEDS
  {
    id: 'mnc-bed-01',
    name: 'Kyoto Solid Teak Platform Bed',
    category: 'beds',
    categoryLabel: 'Beds',
    subCategory: 'King Size Beds',
    price: 74500,
    originalPrice: 89000,
    badge: 'Popular',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 42,
    shortDescription: 'Low-profile king platform bed in solid teak with floating cantilever nightstand shelves and upholstered headboard.',
    fullDescription: 'The Kyoto Platform Bed merges Japanese minimalism with solid Indian timber craftsmanship. Featuring an integrated cushioned headboard in natural textured linen, it anchors the bedroom with serene gravitas. The wide solid wood plinth provides a floating visual effect while supporting king mattresses without requiring a box spring.',
    dimensions: {
      width: '200 cm (78.7 in)',
      depth: '220 cm (86.6 in)',
      height: '92 cm (36.2 in)',
      bedBaseHeight: '26 cm (10.2 in)',
      weight: '88 kg'
    },
    materials: [
      'Grade-A Kiln-Dried Solid Teakwood Frame',
      'Padded Belgian Linen Headboard Cushion',
      'Ventilated Hardwood Slat Support Foundation',
      'Matte Water-Based Polyurethane Sealant'
    ],
    colors: [
      { name: 'Natural Warm Teak', hex: '#9C6F44', inStock: true },
      { name: 'Smoked Walnut Finish', hex: '#4A3B32', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In Stock for White-Glove Delivery in AP (3–5 Days)',
    warranty: '10-Year Termite & Joint Guarantee',
    sku: 'MNC-BED-001'
  },
  {
    id: 'mnc-bed-02',
    name: 'Valetta Hydraulic Storage Bed',
    category: 'beds',
    categoryLabel: 'Beds',
    subCategory: 'Hydraulic Storage Beds',
    price: 86000,
    originalPrice: 98000,
    badge: 'Smart Storage',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 19,
    shortDescription: 'German hydraulic lift mechanism bed with spacious internal storage and channeled velvet headboard.',
    fullDescription: 'Designed for contemporary urban living, the Valetta bed incorporates silent German gas-lift struts to reveal a partitioned under-bed storage chamber. The vertical fluted headboard is generously padded in performance velvet that repels dust and stains.',
    dimensions: {
      width: '195 cm (76.7 in)',
      depth: '215 cm (84.6 in)',
      height: '115 cm (45.2 in)',
      bedBaseHeight: '35 cm (13.7 in)',
      weight: '110 kg'
    },
    materials: [
      'High-grade German Gas-Lift Hydraulic Pistons (1200N)',
      'Heavy-duty Marine Plywood Interior Box',
      'Solid Teak Structural Border Frame',
      'Textured Stain-Resistant Velvet Headboard'
    ],
    colors: [
      { name: 'Champagne Taupe', hex: '#C2B4A3', inStock: true },
      { name: 'Charcoal Slate', hex: '#3B3C3E', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Assembly in 5–7 Days',
    warranty: '5-Year Hydraulic & 10-Year Frame Warranty',
    sku: 'MNC-BED-002'
  },

  // 3. DINING SETS
  {
    id: 'mnc-din-01',
    name: 'Valen Teak Dining Suite (6-Seater)',
    category: 'dining-sets',
    categoryLabel: 'Dining Sets',
    subCategory: '6-Seater Sets',
    price: 98000,
    originalPrice: 118000,
    badge: 'Curated Suite',
    isBestseller: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 31,
    shortDescription: 'Solid timber dining table (200cm) paired with 6 ergonomic upholstered dining chairs.',
    fullDescription: 'The Valen 6-Seater Dining Suite is an ode to timeless communal meals. Crafted from hand-selected planks of seasoned Teak, the tabletop reveals rich organic grain patterns and butterfly joint accents. The six included chairs feature curved ergonomic timber backs and stain-resistant woven seat cushions.',
    dimensions: {
      width: '200 cm (78.7 in)',
      depth: '95 cm (37.4 in)',
      height: '76 cm (29.9 in)',
      seatHeight: '46 cm (18.1 in)',
      weight: '95 kg (Table + 6 Chairs)'
    },
    materials: [
      'Hand-Selected Indian Teakwood Planks (35mm Top Thickness)',
      'Traditional Mortise-and-Tenon Joinery',
      'Water-repellent woven fabric chair cushions',
      'Matte natural plant-oil wax finish'
    ],
    colors: [
      { name: 'Natural Honey Teak', hex: '#A67341', inStock: true },
      { name: 'Dark Walnut Stain', hex: '#443224', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary In-Home Assembly in AP (4–7 Days)',
    warranty: '10-Year Craftsmanship Warranty',
    sku: 'MNC-DIN-001'
  },
  {
    id: 'mnc-din-02',
    name: 'Carrara Italian Marble 6-Seater Dining Set',
    category: 'dining-sets',
    categoryLabel: 'Dining Sets',
    subCategory: 'Marble-Top Tables',
    price: 135000,
    originalPrice: 155000,
    badge: 'Ultra Luxury',
    isBestseller: false,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 15,
    shortDescription: 'Imported polished Carrara marble dining table with fluted wooden pedestal and 6 brass-legged chairs.',
    fullDescription: 'A statement centerpiece for luxury Indian residences. Features a 20mm genuine Italian Carrara marble slab with eased bullnose edges, sealed against oil and turmeric stains. Supported by a dual fluted cylindrical base crafted in seasoned teak with brushed gold accents.',
    dimensions: {
      width: '210 cm (82.6 in)',
      depth: '100 cm (39.3 in)',
      height: '76 cm (29.9 in)',
      seatHeight: '47 cm (18.5 in)',
      weight: '165 kg'
    },
    materials: [
      'Authentic Sealed Italian Carrara White Marble',
      'Solid Fluted Teakwood Pedestal Base',
      'Brushed Champagne Gold Accents',
      'Top-Grain Leatherette & Brass Dining Chairs'
    ],
    colors: [
      { name: 'Carrara White & Teak', hex: '#F0EEE9', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Placement (5–9 Days)',
    warranty: '5-Year Marble Seal & 10-Year Base Warranty',
    sku: 'MNC-DIN-002'
  },

  // 4. STUDY TABLES
  {
    id: 'mnc-stu-01',
    name: 'Atelier Solid Sheesham Study Desk',
    category: 'study-tables',
    categoryLabel: 'Study Tables',
    subCategory: 'Executive Study Tables',
    price: 28500,
    originalPrice: 34000,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 27,
    shortDescription: 'Solid Sheesham wood study table with 3 dovetailed drawers, concealed cable port, and bevelled edge.',
    fullDescription: 'The Atelier Study Table is crafted for deep focus and aesthetic serenity. Featuring solid Sheesham wood construction with natural grain swirls, it includes three slim soft-close drawers for laptops and stationary, plus a brass cable grommet for seamless wire management.',
    dimensions: {
      width: '140 cm (55.1 in)',
      depth: '65 cm (25.6 in)',
      height: '76 cm (29.9 in)',
      kneeClearance: '66 cm (26.0 in)',
      weight: '44 kg'
    },
    materials: [
      'Seasoned Indian Sheesham (Rosewood)',
      'Hand-cut Dovetail Drawer Joinery with Soft-Close Slides',
      'Solid Brass Knurled Drawer Pulls',
      'Polyurethane Scratch-Resistant Finish'
    ],
    colors: [
      { name: 'Warm Sheesham Honey', hex: '#874D27', inStock: true },
      { name: 'Dark Walnut Finish', hex: '#3B2A1E', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Delivery (3–6 Days)',
    warranty: '10-Year Timber Warranty',
    sku: 'MNC-STU-001'
  },
  {
    id: 'mnc-stu-02',
    name: 'Kanso Minimalist Floating Study Table',
    category: 'study-tables',
    categoryLabel: 'Study Tables',
    subCategory: 'Compact Writing Desks',
    price: 22000,
    originalPrice: 26500,
    badge: 'Modern',
    isBestseller: false,
    isFeatured: false,
    rating: 4.7,
    reviewsCount: 18,
    shortDescription: 'Slim modern writing desk in solid white oak with powder-coated steel geometric trestle legs.',
    fullDescription: 'A light-footprint desk engineered for contemporary apartments and study nooks. Slender proportions with an integrated stationary ledge and cable trough allow clean clutter-free work.',
    dimensions: {
      width: '120 cm (47.2 in)',
      depth: '60 cm (23.6 in)',
      height: '75 cm (29.5 in)',
      weight: '28 kg'
    },
    materials: [
      'Solid European White Oak Surface',
      'Textured Matte Carbon Black Steel Trestle Base',
      'Integrated Pen & Cable Recess'
    ],
    colors: [
      { name: 'Natural Oak & Black', hex: '#C7B198', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Ready to Dispatch (2–4 Days)',
    warranty: '5-Year Structural Warranty',
    sku: 'MNC-STU-002'
  },

  // 5. CENTRE TABLES
  {
    id: 'mnc-cen-01',
    name: 'Kanso Roman Travertine Centre Table',
    category: 'centre-tables',
    categoryLabel: 'Centre Tables',
    subCategory: 'Travertine & Marble',
    price: 36000,
    originalPrice: 42000,
    badge: 'Architectural',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 33,
    shortDescription: 'Sculptural low coffee table carved from unfilled Italian Roman travertine with soft rounded bevels.',
    fullDescription: 'The Kanso Centre Table brings raw geological poetry into the living room. Each piece is carved from authentic porous Roman travertine, celebrating subtle sediment striations and tactile earth tones. The organic geometry grounds conversational seating without visual bulk.',
    dimensions: {
      width: '110 cm (43.3 in)',
      depth: '110 cm (43.3 in)',
      height: '35 cm (13.7 in)',
      weight: '62 kg'
    },
    materials: [
      'Natural Italian Roman Travertine Stone',
      'Matte penetrating stone sealer (oil and water repellent)',
      'Concealed felt glides for marble flooring protection'
    ],
    colors: [
      { name: 'Warm Roman Beige', hex: '#DED1BF', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Placement (3–6 Days)',
    warranty: '5-Year Stone Craftsmanship Guarantee',
    sku: 'MNC-CEN-001'
  },
  {
    id: 'mnc-cen-02',
    name: 'Nesting Duo Fluted Teak Centre Tables',
    category: 'centre-tables',
    categoryLabel: 'Centre Tables',
    subCategory: 'Nesting Coffee Tables',
    price: 29500,
    originalPrice: 35000,
    badge: 'Versatile',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 16,
    shortDescription: 'Set of two nesting round coffee tables featuring solid fluted teakwood drums and black marble tops.',
    fullDescription: 'A versatile two-tier nesting centerpiece. The taller table slides gracefully over the lower table, allowing you to expand your serving surface during parties or tuck it away for open room space.',
    dimensions: {
      largeTable: '80 cm dia x 42 cm H',
      smallTable: '60 cm dia x 35 cm H',
      totalWeight: '38 kg'
    },
    materials: [
      'Solid Fluted Teak Tambour Sides',
      'Nero Marquina Black Marble Slab Tops',
      'Brass base rim trim'
    ],
    colors: [
      { name: 'Teak & Black Marble', hex: '#583D28', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Delivery (3–5 Days)',
    warranty: '5-Year Warranty',
    sku: 'MNC-CEN-002'
  },

  // 6. RECLINERS
  {
    id: 'mnc-rec-01',
    name: 'Ravenna Motorized Genuine Leather Recliner',
    category: 'recliners',
    categoryLabel: 'Recliners',
    subCategory: 'Motorized Recliners',
    price: 54000,
    originalPrice: 65000,
    badge: 'Top Rated',
    isBestseller: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 47,
    shortDescription: 'Silent dual-motor power recliner in top-grain Italian leather with integrated USB-C fast charging port.',
    fullDescription: 'Indulge in supreme personal comfort. The Ravenna motorized recliner features smooth dual-motor articulation allowing independent control of the footrest and backrest down to a 160-degree flat relaxation mode. Wrapped in supple top-grain Italian bovine leather with high-resiliency pocket springs.',
    dimensions: {
      width: '92 cm (36.2 in)',
      depth: '98 cm (38.5 in) upright / 168 cm (66.1 in) reclined',
      height: '104 cm (40.9 in)',
      seatHeight: '48 cm (18.9 in)',
      weight: '56 kg'
    },
    materials: [
      '100% Top-Grain Genuine Bovine Leather',
      'Heavy-Gauge Alloy Steel Mechanism (OKIN German Motor)',
      'Multi-Zone Lumbar & Cervical Support Cushioning',
      'Dual USB-A and USB-C Charging Hub in armrest'
    ],
    colors: [
      { name: 'Cognac Saddle Leather', hex: '#8E4A23', inStock: true },
      { name: 'Obsidian Black Leather', hex: '#232323', inStock: true },
      { name: 'Cream Ivory Leather', hex: '#EBE5D8', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Placement (3–6 Days)',
    warranty: '5-Year Motor & 10-Year Steel Mechanism Warranty',
    sku: 'MNC-REC-001'
  },
  {
    id: 'mnc-rec-02',
    name: 'Soren Sculptural Lounge Chair & Ottoman',
    category: 'recliners',
    categoryLabel: 'Recliners',
    subCategory: 'Genuine Leather Loungers',
    price: 42000,
    originalPrice: 48000,
    badge: 'Design Icon',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 29,
    shortDescription: 'Organic wood armrests paired with deep shearling upholstery on an architectural silhouette.',
    fullDescription: 'Influenced by mid-century Nordic design, the Soren Lounge Chair showcases sweeping American walnut joinery and generous, cocooning comfort. The inclined seating angle encourages mindful decompression, while the tactile wool upholstery offers a soothing tactile contrast to the dark timber frame.',
    dimensions: {
      width: '82 cm (32.3 in)',
      depth: '88 cm (34.6 in)',
      height: '79 cm (31.1 in)',
      seatHeight: '41 cm (16.1 in)',
      weight: '26 kg'
    },
    materials: [
      'FSC-Certified Solid Teakwood Frame',
      'Plush shearling textured wool fabric',
      'Feather-down wrapped ergonomic cushion',
      'Natural matte oil finish hand-rubbed by artisans'
    ],
    colors: [
      { name: 'Natural Shearling & Teak', hex: '#EAE5DB', inStock: true },
      { name: 'Espresso Leather & Walnut', hex: '#4A3B32', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Ready for dispatch (3–5 Days)',
    warranty: '5-Year Craftsmanship Guarantee',
    sku: 'MNC-REC-002'
  },

  // 7. SECTIONAL SOFAS
  {
    id: 'mnc-sec-01',
    name: 'Norden Deep Modular 4-Piece Sectional',
    category: 'sectional-sofas',
    categoryLabel: 'Sectional Sofas',
    subCategory: 'U-Shaped Family Modulars',
    price: 135000,
    originalPrice: 155000,
    badge: 'Curated',
    isBestseller: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 22,
    shortDescription: 'Low-slung Italian minimalist modular sectional with feather blend deep seating and moveable ottomans.',
    fullDescription: 'The Norden modular system allows boundless spatial flexibility. Formed from clean horizontal geometries, each module interlocks discreetly beneath the frame. Upholstered in heavy-weight stone-washed linen that drapes with casual elegance, it invites relaxed lounging without compromising tailored refinement.',
    dimensions: {
      width: '320 cm (126.0 in)',
      depth: '220 cm (86.6 in)',
      height: '72 cm (28.3 in)',
      seatHeight: '40 cm (15.7 in)',
      weight: '128 kg'
    },
    materials: [
      'Stonewashed Heavy Belgian Linen (Removable & Washable)',
      'Solid Teak and Hardwood Internal Skeleton',
      'Multi-density foam base with genuine goose feather top layer',
      'Interlocking heavy-duty steel bottom connectors'
    ],
    colors: [
      { name: 'Stonewashed Ecru', hex: '#DCD4C6', inStock: true },
      { name: 'Olive Drab Linen', hex: '#69685B', inStock: true },
      { name: 'Warm Charcoal', hex: '#373635', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Placement in 5–8 Days',
    warranty: '10-Year Structural Frame Warranty',
    sku: 'MNC-SEC-001'
  },
  {
    id: 'mnc-sec-02',
    name: 'Solis L-Shaped Left-Facing Sectional',
    category: 'sectional-sofas',
    categoryLabel: 'Sectional Sofas',
    subCategory: 'Left-Facing Sectionals',
    price: 112000,
    originalPrice: 128000,
    badge: 'Bestseller',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 17,
    shortDescription: 'Generously proportioned chaise lounge sofa with wide armrests and stain-guarded chenille fabric.',
    fullDescription: 'Designed for modern open-plan Indian living rooms. The extended chaise allows full reclining relaxation, while the wide armrest doubles as a steady surface for books or morning coffee.',
    dimensions: {
      width: '280 cm (110.2 in)',
      depth: '175 cm (68.9 in) at chaise',
      height: '78 cm (30.7 in)',
      weight: '98 kg'
    },
    materials: [
      'Stain-Guarded Textured Chenille Fabric',
      'FSC-Certified Solid Hardwood Framing',
      'Black Powder-Coated Cast Aluminum Feet'
    ],
    colors: [
      { name: 'Warm Sand', hex: '#D4C6B2', inStock: true },
      { name: 'Slate Grey', hex: '#525458', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Delivery (4–7 Days)',
    warranty: '10-Year Structural Frame Warranty',
    sku: 'MNC-SEC-002'
  },

  // 8. WARDROBES
  {
    id: 'mnc-war-01',
    name: 'Merano 4-Door Solid Teak Wardrobe',
    category: 'wardrobes',
    categoryLabel: 'Wardrobes',
    subCategory: '4-Door Grand Armoires',
    price: 89000,
    originalPrice: 105000,
    badge: 'Masterwork',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 20,
    shortDescription: 'Grand 4-door wardrobe in solid seasoned teakwood with fluted door panels and Blum soft-close hinges.',
    fullDescription: 'The Merano 4-Door Wardrobe combines architectural dignity with intelligent interior organization. Features adjustable shelving, solid brass hanging rods, soft-close dovetailed jewellery drawers, and integrated LED motion-sensing interior lights.',
    dimensions: {
      width: '200 cm (78.7 in)',
      depth: '62 cm (24.4 in)',
      height: '215 cm (84.6 in)',
      weight: '145 kg'
    },
    materials: [
      'Solid Indian Teakwood External Doors & Framework',
      'Moisture-Resistant Marine Grade Plywood Internal Carcass',
      'Blum Clip-Top Soft-Close Concealed Hinges (Austria)',
      'Solid Brushed Brass Long Edge Handles'
    ],
    colors: [
      { name: 'Natural Golden Teak', hex: '#9E7145', inStock: true },
      { name: 'Smoked Walnut Finish', hex: '#423225', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Installation (5–9 Days)',
    warranty: '10-Year Termite & Structural Warranty',
    sku: 'MNC-WAR-001'
  },

  // 9. CABINETS & SIDEBOARDS
  {
    id: 'mnc-sto-01',
    name: 'Paloma Fluted Marble Credenza',
    category: 'cabinets-sideboards',
    categoryLabel: 'Cabinets & Sideboards',
    subCategory: 'Fluted Credenzas',
    price: 52000,
    originalPrice: 62000,
    badge: 'Signature Piece',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 28,
    shortDescription: 'Fluted solid wood credenza featuring a honed Roman travertine stone top and soft-close cabinets.',
    fullDescription: 'The Paloma Sideboard balances architectural rhythm with tactile materials. Individually routed solid oak flutes wrap the curved corners, crowned by a recessed 20mm Roman travertine slab. Designed with internal adjustable shelves and wire pass-throughs, it functions seamlessly as a dining room buffet or a living room media console.',
    dimensions: {
      width: '180 cm (70.9 in)',
      depth: '48 cm (18.9 in)',
      height: '75 cm (29.5 in)',
      weight: '78 kg'
    },
    materials: [
      'Solid White Oak fluted tambour facade',
      'Honed natural Roman travertine slab top',
      'Blum soft-close push-to-open door dampers',
      'Brushed bronze foot caps'
    ],
    colors: [
      { name: 'Bleached Oak & Cream Travertine', hex: '#DED5C5', inStock: true },
      { name: 'Smoked Oak & Charcoal Travertine', hex: '#3E3832', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary White-Glove In-Home Placement (3–7 Days)',
    warranty: '10-Year Structural Guarantee',
    sku: 'MNC-STO-001'
  },

  // 10. OFFICE FURNITURE
  {
    id: 'mnc-off-01',
    name: 'ErgoArch Executive Leather Desk Chair',
    category: 'office-furniture',
    categoryLabel: 'Office Furniture',
    subCategory: 'High-Back Ergonomic Chairs',
    price: 38000,
    originalPrice: 45000,
    badge: 'Ergonomic',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 36,
    shortDescription: 'High-back ergonomic executive armchair wrapped in supple top-grain leather with synchronized tilt lock.',
    fullDescription: 'Sculpted for enduring daily focus. Combines an architectural aluminum silhouette with supple aniline leather upholstery. A multi-position synchronized knee-tilt mechanism and adjustable lumbar support maintain natural posture across intensive working sessions.',
    dimensions: {
      width: '68 cm (26.8 in)',
      depth: '70 cm (27.6 in)',
      height: '118–128 cm (46.5–50.4 in)',
      seatHeight: '45–55 cm (17.7–21.6 in)',
      weight: '24 kg'
    },
    materials: [
      'Supple top-grain aniline Italian leather',
      'Die-cast polished aluminum 5-star base and armrests',
      'German Class-4 heavy-duty pneumatic gas cylinder',
      'Smooth-gliding soft PU castors safe for hardwood and marble floors'
    ],
    colors: [
      { name: 'Cognac Saddle Leather', hex: '#8C4D26', inStock: true },
      { name: 'Raven Black Leather', hex: '#242321', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In Stock — Dispatched within 24–48 hours',
    warranty: '7-Year Mechanism & Structural Frame Warranty',
    sku: 'MNC-OFF-001'
  },

  // 11. SHOE RACKS
  {
    id: 'mnc-sho-01',
    name: 'Aethel Ventilated Louvered Shoe Cabinet',
    category: 'shoe-racks',
    categoryLabel: 'Shoe Racks',
    subCategory: 'Shoe Cabinets with Bench',
    price: 21500,
    originalPrice: 26000,
    badge: 'Popular',
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 31,
    shortDescription: 'Naturally ventilated teakwood shoe storage cabinet holding 18+ pairs with top brass tray for keys.',
    fullDescription: 'The Aethel Shoe Cabinet keeps your foyer organized with quiet sophistication. Slanted solid teak louvers provide natural air circulation, preventing odor buildup. Includes adjustable interior shelves accommodating boots, heels, and sneakers, plus an upper felt-lined tray for entryway essentials.',
    dimensions: {
      width: '105 cm (41.3 in)',
      depth: '38 cm (15.0 in)',
      height: '100 cm (39.3 in)',
      weight: '34 kg'
    },
    materials: [
      'Solid CP Teakwood Louvered Doors and Legs',
      'Termite-proof internal shelving with easy-wipe finish',
      'Recessed solid brass pulls',
      'Magnetic door closures'
    ],
    colors: [
      { name: 'Natural Teak Finish', hex: '#9E6E3E', inStock: true },
      { name: 'Espresso Brown', hex: '#3B291C', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Delivery (3–5 Days)',
    warranty: '10-Year Craftsmanship Warranty',
    sku: 'MNC-SHO-001'
  },

  // 12. BAR FURNITURE
  {
    id: 'mnc-bar-01',
    name: 'Bodega Fluted Teak Home Bar Cabinet',
    category: 'bar-furniture',
    categoryLabel: 'Bar Furniture',
    subCategory: 'Wine & Bar Cabinets',
    price: 46000,
    originalPrice: 54000,
    badge: 'Entertainer',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 21,
    shortDescription: 'Sculptural bar cabinet with stemware hanging racks, 12-bottle wine grid, and mirrored back panel.',
    fullDescription: 'The Bodega Bar Cabinet transforms home entertaining into an art form. The dual doors open to reveal an antiqued brass stemware rack holding up to 16 wine and cocktail glasses, a solid teak bottle grid, two soft-close drawers for mixology tools, and an LED-backlit mirror interior.',
    dimensions: {
      width: '95 cm (37.4 in)',
      depth: '48 cm (18.9 in)',
      height: '125 cm (49.2 in)',
      weight: '58 kg'
    },
    materials: [
      'Kiln-Dried Solid Teakwood Facade with Fluted Grooves',
      'Brushed Brass Stemware Racks & Hardware',
      'Antiqued Mirror Internal Backing with Warm LED Lighting',
      'Concealed felt drawer lining'
    ],
    colors: [
      { name: 'Warm Teak & Champagne Gold', hex: '#8F6236', inStock: true },
      { name: 'Smoked Charcoal Oak', hex: '#322E2B', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Placement in 4–7 Days',
    warranty: '10-Year Structural Warranty',
    sku: 'MNC-BAR-001'
  }
];

// Helper to look up a product by ID (supports legacy IDs)
export const findProductById = (id) => {
  return products.find((p) => p.id === id);
};
