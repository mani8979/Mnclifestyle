export const products = [
  // LIVING ROOM
  {
    id: 'mnc-liv-01',
    name: 'Aura Curved Bouclé Sofa',
    category: 'living-room',
    categoryLabel: 'Living Room',
    subCategory: 'Sofas & Sectionals',
    price: 2450,
    originalPrice: 2890,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 38,
    shortDescription: 'Gently curved 3-seater sofa wrapped in textured Belgian bouclé with a concealed brushed brass plinth.',
    fullDescription: 'The Aura Curved Sofa reimagines conversational seating with soft, organic contours that flow effortlessly into contemporary spaces. Handcrafted using FSC-certified hardwood frames and dual-density memory foam cushioning, it balances sculptural poise with sink-in comfort. Its textured oatmeal bouclé fabric offers natural stain resistance while delivering sensory warmth to modern living rooms.',
    dimensions: {
      width: '240 cm (94.5 in)',
      depth: '105 cm (41.3 in)',
      height: '76 cm (29.9 in)',
      seatHeight: '43 cm (16.9 in)',
      weight: '72 kg'
    },
    materials: [
      'Textured Belgian Wool Bouclé (95% Wool, 5% Polyamide)',
      'Kiln-dried solid beech and birch interior frame',
      'Dual-layer high resilience foam with goose down topper',
      'Subtle recessed brass architectural base'
    ],
    colors: [
      { name: 'Oatmeal Bouclé', hex: '#EDE8E1', inStock: true },
      { name: 'Warm Charcoal', hex: '#343332', inStock: true },
      { name: 'Terra Cotta', hex: '#9E6756', inStock: false }
    ],
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary White-Glove In-Home Delivery (3–7 Days)',
    warranty: '10-Year Structural Frame Warranty',
    sku: 'MNC-LIV-084'
  },
  {
    id: 'mnc-liv-02',
    name: 'Soren Sculptural Lounge Chair',
    category: 'living-room',
    categoryLabel: 'Living Room',
    subCategory: 'Armchairs & Loungers',
    price: 1180,
    originalPrice: 1350,
    badge: 'Signature Piece',
    isBestseller: true,
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
      'FSC-Certified Solid American Walnut Frame',
      'Plush shearling textured wool fabric',
      'Feather-down wrapped ergonomic cushion',
      'Natural matte oil finish hand-rubbed by artisans'
    ],
    colors: [
      { name: 'Natural Shearling & Walnut', hex: '#EAE5DB', inStock: true },
      { name: 'Espresso Leather & Oak', hex: '#4A3B32', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580481077195-c32e1373b49e?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Ready for dispatch',
    warranty: '5-Year Craftsmanship Guarantee',
    sku: 'MNC-LIV-029'
  },
  {
    id: 'mnc-liv-03',
    name: 'Norden Deep Modular 4-Piece Sectional',
    category: 'living-room',
    categoryLabel: 'Living Room',
    subCategory: 'Sofas & Sectionals',
    price: 3650,
    originalPrice: 4200,
    badge: 'Curated',
    isBestseller: false,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 17,
    shortDescription: 'Low-slung Italian minimalist modular sofa with feather blend deep seating and moveable ottomans.',
    fullDescription: 'The Norden modular system allows boundless spatial flexibility. Formed from clean horizontal geometries, each module interlocks discreetly beneath the frame. Upholstered in heavy-weight stone-washed linen that drapes with casual elegance, it invites relaxed lounging without compromising tailored refinement.',
    dimensions: {
      width: '320 cm (126.0 in)',
      depth: '210 cm (82.7 in)',
      height: '70 cm (27.5 in)',
      seatHeight: '39 cm (15.3 in)',
      weight: '115 kg'
    },
    materials: [
      '100% Stone-washed Belgian Linen (Removable Covers)',
      'Multi-density HR foam with channel-quilted down',
      'Heavy-duty hidden interlocking steel brackets'
    ],
    colors: [
      { name: 'Sand Linen', hex: '#DED7C8', inStock: true },
      { name: 'Slate Grey', hex: '#636569', inStock: true },
      { name: 'Ivory Cream', hex: '#F3EFE9', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Custom crafted — Ships in 10-14 days',
    warranty: '10-Year Structural Frame Warranty',
    sku: 'MNC-LIV-092'
  },

  // BEDROOM
  {
    id: 'mnc-bed-01',
    name: 'Kyoto Floating Oak Bed Frame',
    category: 'bedroom',
    categoryLabel: 'Bedroom',
    subCategory: 'Solid Oak Frames',
    price: 2150,
    originalPrice: 2490,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 42,
    shortDescription: 'Solid Japanese-inspired white oak bed with an integrated floating headboard and soft perimeter ledges.',
    fullDescription: 'Rooted in timeless wabi-sabi philosophy, the Kyoto Bed creates an illusion of floating weightlessly above the bedroom floor. Constructed entirely of quarter-sawn European white oak with traditional mortise-and-tenon joints, the wide border serves as a convenient resting place for evening books and warm tea.',
    dimensions: {
      width: '212 cm (83.5 in) [King]',
      depth: '228 cm (89.8 in)',
      height: '84 cm (33.1 in)',
      platformHeight: '28 cm (11.0 in)',
      weight: '94 kg'
    },
    materials: [
      '100% Solid European White Oak',
      'Natural low-VOC matte oil sealer',
      'Solid pine internal slatted mattress support (No box spring required)'
    ],
    colors: [
      { name: 'Natural White Oak', hex: '#D8C3A5', inStock: true },
      { name: 'Smoked Espresso Oak', hex: '#3B2F2F', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary White-Glove In-Home Assembly Included',
    warranty: '10-Year Craftsmanship Guarantee',
    sku: 'MNC-BED-014'
  },
  {
    id: 'mnc-bed-02',
    name: 'Serena Upholstered Linen Bed',
    category: 'bedroom',
    categoryLabel: 'Bedroom',
    subCategory: 'Upholstered Beds',
    price: 1890,
    originalPrice: 2150,
    badge: 'New Arrival',
    isBestseller: false,
    isFeatured: true,
    rating: 4.7,
    reviewsCount: 15,
    shortDescription: 'Padded linen headboard with double flanged tailored edges and tapered solid walnut feet.',
    fullDescription: 'The Serena Bed envelopes your bedroom in hotel-suite tranquility. Its tall, cushioned headboard provides upright ergonomic support for morning reading, upholstered in natural textured slub linen that breathes year-round.',
    dimensions: {
      width: '196 cm (77.2 in) [Queen]',
      depth: '220 cm (86.6 in)',
      height: '122 cm (48.0 in)',
      platformHeight: '32 cm (12.6 in)',
      weight: '68 kg'
    },
    materials: [
      'Belgian Heavy Slub Linen (Anti-Pilling)',
      'High-density foam headboard padding',
      'Solid American walnut feet with bronze ferrules'
    ],
    colors: [
      { name: 'Warm Greige', hex: '#C7BFB5', inStock: true },
      { name: 'Chalk White', hex: '#ECE8DF', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Delivers in 4–6 business days',
    warranty: '10-Year Structural Frame Warranty',
    sku: 'MNC-BED-028'
  },

  // DINING
  {
    id: 'mnc-din-01',
    name: 'Valen Monolithic Dining Table',
    category: 'dining',
    categoryLabel: 'Dining Room',
    subCategory: 'Extendable Tables',
    price: 2790,
    originalPrice: 3200,
    badge: 'Signature Piece',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 31,
    shortDescription: 'Monumental 8-to-10 seater solid oak dining table with soft pill-shaped ends and sculptural fluted pillars.',
    fullDescription: 'The Valen dining table is a tribute to architectural majesty. Featuring twin ribbed pedestal bases crafted from continuous solid oak staves, it allows unhindered legroom around the entire perimeter. The chamfered racetrack table top exhibits natural wood grain patterns unique to every hand-inspected slab.',
    dimensions: {
      width: '260 cm (102.4 in)',
      depth: '110 cm (43.3 in)',
      height: '76 cm (29.9 in)',
      clearance: '72 cm (28.3 in)',
      weight: '110 kg'
    },
    materials: [
      'Solid European Oak Tabletop (4 cm thickness)',
      'Dual fluted solid timber pedestal columns with internal steel ballast',
      'Waterproof organic polyurethane matte finish'
    ],
    colors: [
      { name: 'Bleached White Oak', hex: '#D7C7B2', inStock: true },
      { name: 'Smoked Walnut Finish', hex: '#44372F', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1577140917170-285929fb55b7?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Assembly Included (3–7 Days)',
    warranty: '15-Year Solid Wood Structural Warranty',
    sku: 'MNC-DIN-009'
  },
  {
    id: 'mnc-din-02',
    name: 'Celine Leather Dining Chair (Set of 2)',
    category: 'dining',
    categoryLabel: 'Dining Room',
    subCategory: 'Dining Chairs',
    price: 890,
    originalPrice: 1050,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 46,
    shortDescription: 'Supple cognac top-grain leather seating with an architectural curved oak backrest.',
    fullDescription: 'Engineered for dinners that seamlessly flow late into the evening. The Celine dining chair pairs warm tactile Italian leather with a steam-bent oak backrest that curves naturally with spinal contours.',
    dimensions: {
      width: '54 cm (21.3 in)',
      depth: '56 cm (22.0 in)',
      height: '80 cm (31.5 in)',
      seatHeight: '46 cm (18.1 in)',
      weight: '8 kg per chair'
    },
    materials: [
      'Italian Top-Grain Semi-Aniline Leather',
      'Steam-bent solid oak backrest',
      'Reinforced internal steel frame'
    ],
    colors: [
      { name: 'Cognac Leather & Oak', hex: '#9C5B32', inStock: true },
      { name: 'Onyx Leather & Walnut', hex: '#212121', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580481077195-c32e1373b49e?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Delivers in pairs within 3–5 days',
    warranty: '5-Year Commercial & Residential Warranty',
    sku: 'MNC-DIN-044'
  },

  // OFFICE
  {
    id: 'mnc-off-01',
    name: 'Atelier Executive Walnut Desk',
    category: 'office',
    categoryLabel: 'Office Furniture',
    subCategory: 'Executive Desks',
    price: 2250,
    originalPrice: 2600,
    badge: 'Signature Piece',
    isBestseller: false,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 22,
    shortDescription: 'Minimalist executive desk in bookmatched walnut with concealed magnetic cable routing and soft-close drawers.',
    fullDescription: 'Designed for the discerning visionary. The Atelier Desk conceals modern tech chaos within a sculpted architectural form. A recessed rear channel with flip-top walnut door hides multi-device power strips, while two felt-lined drawers glide effortlessly on concealed German Blum runners.',
    dimensions: {
      width: '180 cm (70.9 in)',
      depth: '85 cm (33.5 in)',
      height: '75 cm (29.5 in)',
      drawerClearance: '64 cm (25.2 in)',
      weight: '64 kg'
    },
    materials: [
      'Solid and Bookmatched American Walnut Veneer',
      'Concealed German Blum soft-close slide hardware',
      'Anodized bronze wire-pass and magnetic modesty cover'
    ],
    colors: [
      { name: 'Natural Walnut', hex: '#4D382C', inStock: true },
      { name: 'Smoked Ash & Brass', hex: '#2C2B2A', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Ready for White-Glove In-Room Setup',
    warranty: '10-Year Craftsmanship Guarantee',
    sku: 'MNC-OFF-019'
  },
  {
    id: 'mnc-off-02',
    name: 'Verona Ergonomic Leather Task Chair',
    category: 'office',
    categoryLabel: 'Office Furniture',
    subCategory: 'Ergonomic Task Chairs',
    price: 1350,
    originalPrice: 1550,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 35,
    shortDescription: 'High-back ergonomic leather task chair with synchronized tilt mechanism and cast bronze casters.',
    fullDescription: 'Where executive prestige meets orthopedic science. The Verona task chair is upholstered in butter-soft semi-aniline Italian leather, with multi-axis lumbar adjustment and quiet urethane rollers designed for hardwood floors.',
    dimensions: {
      width: '68 cm (26.8 in)',
      depth: '68 cm (26.8 in)',
      height: '118 - 128 cm (46.5 - 50.4 in)',
      seatHeight: '45 - 55 cm (17.7 - 21.7 in)',
      weight: '22 kg'
    },
    materials: [
      'Full-grain Italian Nappa Leather',
      'Cast aluminum frame with brushed bronze finish',
      'German pneumatic class 4 gas lift mechanism'
    ],
    colors: [
      { name: 'Caramel Nappa', hex: '#875638', inStock: true },
      { name: 'Nero Black', hex: '#1C1B1A', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1580481077195-c32e1373b49e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Delivers in 2–4 business days',
    warranty: '7-Year Mechanical Warranty',
    sku: 'MNC-OFF-061'
  },

  // COFFEE TABLES
  {
    id: 'mnc-cof-01',
    name: 'Kanso Travertine Sculpted Coffee Table',
    category: 'coffee-tables',
    categoryLabel: 'Coffee Tables',
    subCategory: 'Travertine & Stone',
    price: 1480,
    originalPrice: 1750,
    badge: 'Bestseller',
    isBestseller: true,
    isFeatured: true,
    rating: 5.0,
    reviewsCount: 28,
    shortDescription: 'Honed Roman travertine table top resting on dual cylindrical solid stone columns.',
    fullDescription: 'The Kanso coffee table celebrates the ancient beauty of unfilled Roman travertine. Cut from massive natural quarries, each piece possesses distinct natural cavities, creamy warm tones, and a velvety honed finish that resists stains while retaining honest geologic character.',
    dimensions: {
      width: '130 cm (51.2 in)',
      depth: '75 cm (29.5 in)',
      height: '35 cm (13.8 in)',
      stoneThickness: '3 cm (1.2 in)',
      weight: '78 kg'
    },
    materials: [
      'Authentic Italian Travertine Marble',
      'Semi-matte food-safe hydrophobic sealer',
      'Felt base pads to protect hardwood floors'
    ],
    colors: [
      { name: 'Roman Warm Ivory Travertine', hex: '#E2D9CC', inStock: true },
      { name: 'Silver Vein Grey Marble', hex: '#9E9A94', inStock: false }
    ],
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove Crating & In-Room Positioning (4–8 Days)',
    warranty: 'Lifetime Stone Durability Guarantee',
    sku: 'MNC-COF-012'
  },
  {
    id: 'mnc-cof-02',
    name: 'Liza Dual Nesting Walnut Low Tables',
    category: 'coffee-tables',
    categoryLabel: 'Coffee Tables',
    subCategory: 'Nesting Sets',
    price: 1120,
    originalPrice: 1290,
    badge: 'Curated',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 19,
    shortDescription: 'Pair of asymmetric organic tables in dark walnut and fluted bronze support rings.',
    fullDescription: 'Inspired by pebble formations along mountain riverbeds, the Liza nesting pair offers dynamic layout configurations. Slide them together for a layered center focus or separate them to flank individual armchairs when entertaining.',
    dimensions: {
      width: 'Large: 95 cm (37.4 in) | Small: 65 cm (25.6 in)',
      depth: 'Large: 70 cm (27.5 in) | Small: 55 cm (21.6 in)',
      height: 'Large: 40 cm (15.7 in) | Small: 34 cm (13.4 in)',
      weight: '32 kg combined'
    },
    materials: [
      'Solid American Black Walnut bevelled edges',
      'Cast bronze ring bases with antiqued patina'
    ],
    colors: [
      { name: 'Warm American Walnut', hex: '#4A3427', inStock: true },
      { name: 'Natural Scandinavian Oak', hex: '#CFBEA7', inStock: true }
    ],
    images: [
      'https://images.openai.com/static-rsc-4/5k157VVLbiPU94wdRdcRfSWljOqTpRUN0RvEAjz9aVZELQMffr4ChHqVWKKUiPFmsKdHmRURLNHFQrTx7iGA1fCuOneU0-ixPfLtBtwOjIOQY961DnJoqTSA6k29h-GmKjGNWcz_mcocQWuuqnu4HMDpJB1N8DK86MMBI-lHTo4T6AktVO7pDANRB6jpi7AW?purpose=fullsize',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Delivers in 3–5 days',
    warranty: '5-Year Craftsmanship Guarantee',
    sku: 'MNC-COF-035'
  },

  // STORAGE & CABINETS
  {
    id: 'mnc-sto-01',
    name: 'Paloma Fluted Oak Credenza',
    category: 'storage',
    categoryLabel: 'Storage & Cabinets',
    subCategory: 'Sideboards',
    price: 2380,
    originalPrice: 2750,
    badge: 'Signature Piece',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 33,
    shortDescription: 'Four-door credenza with continuous vertical fluting, honed marble top, and push-to-open soft hinges.',
    fullDescription: 'The Paloma Credenza creates a rhythmic play of light and shadow across its fluted solid oak façade. Crowned with an integrated slab of honed Carrara marble, it offers expansive interior storage with adjustable shelving and rear pass-throughs for seamless media setup.',
    dimensions: {
      width: '200 cm (78.7 in)',
      depth: '48 cm (18.9 in)',
      height: '78 cm (30.7 in)',
      weight: '89 kg'
    },
    materials: [
      'Solid White Oak fluted tambour door faces',
      'Italian Carrara White Marble inset top',
      'Push-to-open Blum German soft-close hinges',
      'Warm bronze steel sled base'
    ],
    colors: [
      { name: 'Natural Oak & White Marble', hex: '#DBC9B5', inStock: true },
      { name: 'Charcoal Oak & Nero Marble', hex: '#2B2928', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Placement Included',
    warranty: '10-Year Craftsmanship Guarantee',
    sku: 'MNC-STO-088'
  },
  {
    id: 'mnc-sto-02',
    name: 'Elysian Minimalist 6-Drawer Dresser',
    category: 'storage',
    categoryLabel: 'Storage & Cabinets',
    subCategory: 'Chests of Drawers',
    price: 1950,
    originalPrice: 2200,
    badge: 'New Arrival',
    isBestseller: false,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 14,
    shortDescription: 'Low horizontal double dresser featuring recessed continuous finger pulls and solid oak dovetailed drawers.',
    fullDescription: 'Uninterrupted visual calm for the modern bedroom suite. The Elysian Dresser is built with traditional English dovetail joints in solid European oak. Six deep drawers provide generous storage for garments and linens.',
    dimensions: {
      width: '170 cm (66.9 in)',
      depth: '50 cm (19.7 in)',
      height: '82 cm (32.3 in)',
      weight: '76 kg'
    },
    materials: [
      'Solid White Oak and Quarter-sawn veneers',
      'Full-extension undermount soft-close slides',
      'Cedar-lined lower drawers'
    ],
    colors: [
      { name: 'Natural Bleached Oak', hex: '#D2C3B0', inStock: true },
      { name: 'Espresso Stained Ash', hex: '#312A27', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Delivered pre-assembled by white glove team',
    warranty: '10-Year Structural Guarantee',
    sku: 'MNC-STO-045'
  },

  // ADDITIONAL CURATED MASTERPIECES
  {
    id: 'mnc-liv-04',
    name: 'Elowen Curved Swivel Armchair',
    category: 'living-room',
    categoryLabel: 'Living Room',
    subCategory: 'Armchairs & Loungers',
    price: 980,
    originalPrice: 1150,
    badge: 'New Arrival',
    isBestseller: true,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 21,
    shortDescription: 'Cocooning barrel silhouette with smooth 360-degree hidden return swivel in textured ivory wool.',
    fullDescription: 'The Elowen Swivel Armchair wraps the body in ergonomic embrace. Fitted with a high-durability internal steel swivel plate that rotates whisper-quietly, it turns naturally toward conversation or window views.',
    dimensions: {
      width: '86 cm (33.9 in)',
      depth: '84 cm (33.1 in)',
      height: '74 cm (29.1 in)',
      seatHeight: '42 cm (16.5 in)',
      weight: '28 kg'
    },
    materials: [
      'Textured Scandinavian Wool Blend',
      'Concealed German ball-bearing 360° return swivel base',
      'Steel-reinforced cold-cured molded foam'
    ],
    colors: [
      { name: 'Chalk Wool', hex: '#F0EBE1', inStock: true },
      { name: 'Forest Moss', hex: '#4B5548', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Delivers in 3–5 business days',
    warranty: '7-Year Swivel Mechanism Warranty',
    sku: 'MNC-LIV-055'
  },
  {
    id: 'mnc-bed-03',
    name: 'Koto Cantilevered Oak Nightstand',
    category: 'bedroom',
    categoryLabel: 'Bedroom',
    subCategory: 'Nightstands',
    price: 580,
    originalPrice: 680,
    badge: 'Curated',
    isBestseller: false,
    isFeatured: true,
    rating: 4.8,
    reviewsCount: 16,
    shortDescription: 'Solid quarter-sawn white oak bedside table with soft-close single drawer and open lower bookshelf.',
    fullDescription: 'The Koto Nightstand pairs with both low-profile platform beds and taller upholstered suites. Its continuous wood grain wraps seamlessly around the mitered casing.',
    dimensions: {
      width: '55 cm (21.7 in)',
      depth: '45 cm (17.7 in)',
      height: '52 cm (20.5 in)',
      weight: '18 kg'
    },
    materials: [
      'Solid European White Oak',
      'Leather-lined drawer bottom',
      'Concealed Blum undermount drawer slide'
    ],
    colors: [
      { name: 'Natural White Oak', hex: '#D8C3A5', inStock: true },
      { name: 'Smoked Walnut Finish', hex: '#44372F', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef5?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'In stock — Ready for dispatch',
    warranty: '10-Year Craftsmanship Guarantee',
    sku: 'MNC-BED-073'
  },
  {
    id: 'mnc-cof-03',
    name: 'Oasis Honed Calacatta Low Table',
    category: 'coffee-tables',
    categoryLabel: 'Coffee Tables',
    subCategory: 'Travertine & Stone',
    price: 1390,
    originalPrice: 1650,
    badge: 'Signature Piece',
    isBestseller: false,
    isFeatured: true,
    rating: 4.9,
    reviewsCount: 12,
    shortDescription: 'Circular low cocktail table carved from solid honed marble with a fluted cylindrical base.',
    fullDescription: 'An organic sculptural centerpiece. The Oasis low table features a hand-honed matte marble top with soft bullnose edges, resting upon a substantial fluted solid timber plinth.',
    dimensions: {
      width: '90 cm diameter (35.4 in)',
      depth: '90 cm diameter (35.4 in)',
      height: '36 cm (14.2 in)',
      weight: '62 kg'
    },
    materials: [
      'Authentic Italian Calacatta Marble Slab (2.5 cm)',
      'Solid smoked white oak fluted column base',
      'Sealed with hydrophobic anti-stain matte treatment'
    ],
    colors: [
      { name: 'Calacatta & Smoked Oak', hex: '#EAE6E1', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'White-Glove In-Home Placement Included',
    warranty: 'Lifetime Stone Durability Guarantee',
    sku: 'MNC-COF-068'
  },
  {
    id: 'mnc-off-03',
    name: 'Linea Modular Smoked Oak Bookshelf',
    category: 'office',
    categoryLabel: 'Office Furniture',
    subCategory: 'Bookshelves',
    price: 1850,
    originalPrice: 2100,
    badge: 'Curated',
    isBestseller: false,
    isFeatured: false,
    rating: 4.8,
    reviewsCount: 18,
    shortDescription: 'Open architectural shelving system with asymmetrical dividers in smoked oak and bronze uprights.',
    fullDescription: 'The Linea shelving system frames books, ceramics, and personal art collections with gallery restraint. Solid timber uprights interlock with slim bronze tie-rods for monumental structural rigidity.',
    dimensions: {
      width: '140 cm (55.1 in)',
      depth: '38 cm (15.0 in)',
      height: '190 cm (74.8 in)',
      weight: '72 kg'
    },
    materials: [
      'Solid Smoked European Oak',
      'Matte bronze anodized aluminum reinforcement stanchions',
      'Integrated wall-anchor safety brackets'
    ],
    colors: [
      { name: 'Smoked Oak & Bronze', hex: '#3B332F', inStock: true },
      { name: 'Natural White Oak', hex: '#D8C3A5', inStock: true }
    ],
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80'
    ],
    leadTime: 'Complimentary In-Home Assembly Included',
    warranty: '10-Year Craftsmanship Guarantee',
    sku: 'MNC-OFF-044'
  }
];

