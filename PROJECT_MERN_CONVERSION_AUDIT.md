# COMPLETE PROJECT AUDIT – MERN STACK CONVERSION
**Project Name:** MNC LifeStyle (Furniture & Contemporary Living)  
**Location:** Visakhapatnam, Andhra Pradesh, India  
**Auditor:** Senior MERN Stack Architect, Full-Stack Developer & Database Designer  
**Date:** November 2026  
**Status:** Phase 1 Completed – Comprehensive Audit Only (Zero existing source files modified)

---

## 1. Existing Project Overview

MNC LifeStyle is an ultra-premium Indian luxury furniture e-commerce and bespoke concierge web application tailored for homeowners, interior architects, and design studios across Visakhapatnam, Andhra Pradesh, Telangana, and Pan-India.

### Core Technology Stack
- **Frontend Framework:** React `19.3.1` (using `react-dom` `19.3.1`)
- **Build Tool & Dev Server:** Vite `8.3.6` with `@vitejs/plugin-react` `6.1.2`
- **Routing Engine:** React Router v7 (`react-router-dom` `7.18.5`)
- **Styling Architecture:** Tailwind CSS `3.4.17` + PostCSS `8.5.32` + Autoprefixer `10.6.2`
- **Typography:** Google Fonts loaded in `index.html`:
  - *Serif Display:* `Playfair Display` & `Cormorant Garamond`
  - *Sans Body / UI:* `Inter` & `Manrope`
- **Iconography:** `lucide-react` `1.70.0`
- **Linter & Code Quality:** `oxlint` `1.90.0`
- **Automated Verification:** `puppeteer-core` `25.16.0` (used for responsive screenshots and routing checks in `scripts/`)
- **Backend & Database:** **None currently** (Pure static client-side React SPA with in-memory JSON data files).

---

## 2. Current Folder Structure

```
d:\Furtner/
├── index.html                               # HTML entry point, fonts, OpenGraph, Schema.org JSON-LD
├── package.json                             # Dependencies and npm scripts
├── package-lock.json                        # Dependency lockfile
├── postcss.config.js                        # PostCSS configuration with Tailwind & Autoprefixer
├── tailwind.config.js                       # Custom theme (colors, fonts, shadow tokens, luxury palette)
├── vite.config.js                           # Vite bundler configuration
├── vercel.json                              # Static SPA rewrite configuration for Vercel deployment
├── public/                                  # Public static assets
│   ├── favicon.svg                          # Brand SVG monogram
│   ├── hero-bg.png / hero-bg.webp           # Luxury living room high-resolution hero photograph
│   ├── icons.svg                            # Sprite icons
│   ├── live-beautifully.png                 # Editorial banner asset
│   ├── logo.png                             # MNC LifeStyle official logo
│   ├── robots.txt                           # Search engine crawling rules
│   └── sitemap.xml                          # XML sitemap covering all 12 categories and key pages
├── scripts/                                 # Puppeteer automated testing & audit scripts
│   ├── audit-routes.js                      # Route validation script
│   ├── test-shop-navigation.js              # Shop page filter and navigation verifications
│   └── ... (viewports and responsive verification scripts)
└── src/
    ├── main.jsx                             # React entry point mounting to #root
    ├── App.jsx                              # Root component, router configuration, context providers
    ├── App.css                              # Global app style overrides
    ├── index.css                            # Tailwind directives and custom utility classes
    ├── assets/                              # Bundled static media
    │   ├── hero-bg.png / hero-bg.webp       # Hero room photography
    │   ├── live-beautifully.png             # Secondary editorial artwork
    │   └── logo.png                         # High-res transparent logo
    ├── components/                          # 17 reusable UI components
    │   ├── AnnouncementBar.jsx              # Top bar with location, phone, email, and consultation CTA
    │   ├── CartDrawer.jsx                   # Slide-out shopping bag drawer with WhatsApp order generation
    │   ├── CategoryCard.jsx                 # Individual category link card
    │   ├── CategoryGrid.jsx                 # 12-category responsive grid on homepage
    │   ├── Footer.jsx                       # 3-column footer with trust badges, showroom address, map links
    │   ├── Header.jsx                       # Sticky navigation header with shop mega-menu & mobile drawer
    │   ├── Hero.jsx                         # Homepage hero banner with split editorial copy & benefits strip
    │   ├── ProductCard.jsx                  # Standardized catalog card with pricing, discount & wishlist
    │   ├── ProductQuickViewModal.jsx        # Modal for instant product preview and finish selection
    │   ├── ScrollReveal.jsx                 # IntersectionObserver wrapper for luxury scroll transitions
    │   ├── SearchModal.jsx                  # Fullscreen search modal with instant keyword filtering
    │   ├── SectionHeading.jsx               # Standardized section title with subtitle and "See All" link
    │   ├── ShopTheLook.jsx                  # Interactive room suite curation preview
    │   ├── ShowroomModal.jsx                # Experience centre appointment booking modal
    │   ├── SwatchModal.jsx                  # Complimentary timber & fabric swatch ordering modal
    │   ├── WhatsAppFloatingButton.jsx       # Floating WhatsApp quick concierge chat trigger
    │   └── WishlistDrawer.jsx               # Slide-out drawer displaying user-curated wishlist pieces
    ├── context/                             # Global client-side state
    │   ├── CartContext.jsx                  # Shopping bag items, quantities, subtotal (localStorage synced)
    │   └── WishlistContext.jsx              # Saved product IDs and drawer toggle (localStorage synced)
    ├── data/                                # Hardcoded mock database
    │   ├── businessConfig.js                # Centralized phone, address, coordinates, warranty details
    │   ├── categories.js                    # 12 Indian furniture category definitions
    │   ├── collections.js                   # 4 Curated suites (Modern Living, Contemporary Bedroom, etc.)
    │   └── products.js                      # 19 Full-spec handcrafted furniture products
    ├── hooks/
    │   └── useScrollReveal.js               # IntersectionObserver hook with prefers-reduced-motion fallback
    ├── layouts/
    │   └── MainLayout.jsx                   # Global shell wrapping Header, AnnouncementBar, Outlet, Footer, Modals
    ├── pages/                               # 8 Top-level route views (lazy-loaded)
    │   ├── Home.jsx                         # Landing page (Hero, Categories, Bestsellers, Pillars, Testimonials)
    │   ├── Shop.jsx                         # Full catalog with category chips, price filter, sorting, material filter
    │   ├── Category.jsx                     # Category-specific view with subcategory pills, filters, and trust badges
    │   ├── Collections.jsx                  # Editorial suites with featured products and material breakdowns
    │   ├── ProductDetails.jsx               # Product deep-dive: gallery, pricing, dimensions, WhatsApp order, reviews
    │   ├── About.jsx                        # Atelier history, solid hardwood principles, craftsmanship guarantee
    │   ├── Contact.jsx                      # Showroom location, inquiry form, FAQs, Google Maps embed
    │   └── NotFound.jsx                     # Custom luxury 404 page with return-to-shop actions
    └── utils/
        ├── currency.js                      # Intl.NumberFormat INR currency formatter & discount calculator
        └── whatsapp.js                      # Pre-formatted WhatsApp order and inquiry URL generator
```

---

## 3. Existing Pages and Routes

The application utilizes **React Router v7** with code-splitting (`React.lazy` + `Suspense` with custom `PageLoader`):

| Path | Component File | Description | Current Data Source |
|------|----------------|-------------|---------------------|
| `/` | `src/pages/Home.jsx` | Homepage with Hero, 12 Categories, Bestsellers, Value Pillars, Testimonials | Static `products.js`, `categories.js` |
| `/shop` | `src/pages/Shop.jsx` | All furniture catalog, multi-attribute filter drawer, category chips, sort | Static `products.js`, `categories.js` |
| `/category/:categoryId` | `src/pages/Category.jsx` | Dynamic category page (e.g. `/category/sofas`), subcategory pill filter | Static `categories.js`, `products.js` |
| `/collections` | `src/pages/Collections.jsx` | Curated design themes with anchor links (`#modern-living`, etc.) | Static `collections.js`, `products.js` |
| `/product/:id` | `src/pages/ProductDetails.jsx` | Product view with gallery, dimensions accordion, WhatsApp order CTA | Static `products.js` |
| `/about` | `src/pages/About.jsx` | Brand story, artisan credentials, 10-year warranty details | Static `businessConfig.js` |
| `/contact` | `src/pages/Contact.jsx` | Showroom address, inquiry form, experience centre booking, FAQs | Static `businessConfig.js` |
| `*` | `src/pages/NotFound.jsx` | Fallback 404 page with links to Shop and Home | Static |

---

## 4. Existing Components Audit

### Core Layout Components
- **`AnnouncementBar.jsx`**: Displays phone (`+91 87909 43457`), email (`hello@mnclifestyle.in`), location (`Visakhapatnam, Andhra Pradesh`), and "Get a Free Consultation" button linking to `/contact`.
- **`Header.jsx`**: Responsive navigation header containing:
  - Mobile hamburger toggle and slide-out navigation drawer.
  - MNC LifeStyle brand logo linking to `/`.
  - Desktop navigation links (Home, Collections, About, Contact).
  - Hover-activated Shop Mega Menu displaying direct links to 8 categories and 4 collections.
  - Search icon triggering `SearchModal`.
  - Wishlist icon with badge counter triggering `WishlistDrawer`.
  - Shopping Bag icon with quantity counter triggering `CartDrawer`.
- **`Footer.jsx`**: Structured in 3 balanced sections:
  1. Top trust feature strip (Bespoke Quality, White-Glove Placement, 10-Year Warranty).
  2. Brand info, showroom address, Google Maps links, telephone, and WhatsApp order contact.
  3. Explore links, Customer Care, and newsletter subscription form.
- **`MainLayout.jsx`**: Persistent master layout managing search modal, cart drawer, wishlist drawer, floating WhatsApp button, and toast notification alerts.

### Interactive Customer-Facing Components
- **`ProductCard.jsx`**: Standard card for all grids. Includes 4:3 image, category tag, bestseller badge, wishlist heart button, title, short description, finish swatches, selling price, MRP, savings pill, and "View Details" button.
- **`CategoryGrid.jsx`**: 12-category responsive grid on the homepage linking to `/category/:categoryId`.
- **`ShopTheLook.jsx`**: Interactive suite showcasing specific furniture items within an architectural room photograph.
- **`ProductQuickViewModal.jsx`**: Modal preview allowing finish selection and instant WhatsApp order without navigating away.
- **`SearchModal.jsx`**: Fullscreen modal with instant substring matching across product names, descriptions, categories, and materials.
- **`ShowroomModal.jsx`**: Form for scheduling private showroom visits with date, time slot, and consultation scope.
- **`SwatchModal.jsx`**: Modal for ordering up to 3 complimentary wood and fabric swatches.
- **`WhatsAppFloatingButton.jsx`**: Bottom-right floating badge connecting directly to the Visakhapatnam concierge.

---

## 5. Product Data Structure Audit

Currently, all product data resides in `src/data/products.js` (19 items).

### Existing Fields in Current Codebase
```javascript
{
  id: "mnc-sof-01",                                          // String: Unique identifier / slug
  name: "Aura Curved Bouclé Sofa",                           // String: Full product title
  category: "sofas",                                         // String: Category foreign slug
  categoryLabel: "Sofas",                                    // String: Human-readable category
  subCategory: "3-Seater Sofas",                             // String: Subcategory name
  price: 84999,                                              // Number: Selling price in INR
  originalPrice: 99999,                                      // Number: MRP / strikethrough price
  badge: "Bestseller",                                       // String: Optional marketing badge
  isBestseller: true,                                        // Boolean: Featured in Bestsellers section
  isFeatured: true,                                          // Boolean: Featured flag
  rating: 4.9,                                               // Number: Average rating (1-5)
  reviewsCount: 38,                                          // Number: Total review count
  shortDescription: "Gently curved 3-seater sofa...",        // String: Card description
  fullDescription: "The Aura Curved Sofa reimagines...",     // String: Deep editorial copy
  dimensions: {                                              // Object: Specifications
    width: "240 cm (94.5 in)",
    depth: "105 cm (41.3 in)",
    height: "76 cm (29.9 in)",
    seatHeight: "43 cm (16.9 in)",
    weight: "72 kg"
  },
  materials: [                                               // Array of Strings: Technical materials
    "Textured Belgian Wool Bouclé (95% Wool, 5% Polyamide)",
    "Kiln-dried solid Teakwood and Birch interior frame",
    "Dual-layer high resilience foam with down topper",
    "Subtle recessed brass architectural base"
  ],
  colors: [                                                  // Array of Objects: Available finishes
    { name: "Oatmeal Bouclé", hex: "#EDE8E1", inStock: true },
    { name: "Warm Charcoal", hex: "#343332", inStock: true },
    { name: "Terra Cotta", hex: "#9E6756", inStock: true }
  ],
  images: [                                                  // Array of Strings: High-res image URLs
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80"
  ],
  leadTime: "Complimentary White-Glove Delivery (3–7 Days)", // String: Delivery expectation
  warranty: "10-Year Structural Frame & Termite Warranty",   // String: Warranty guarantee
  sku: "MNC-SOF-001"                                         // String: Inventory stock keeping unit
}
```

### Missing Fields Required for Production MERN Application
The audit reveals that while the UI is complete, the following critical data fields are currently missing or hardcoded:
1. **`stockQuantity`** (Number): Currently inventory is only represented as a static `inStock: true` boolean on color variants. A real ecommerce inventory requires exact unit counts with low-stock thresholds.
2. **`isActive` / `isPublished`** (Boolean): Ability for an Admin to draft or unpublish products without deleting them.
3. **`slug`** (String, Unique): Dedicated SEO URL slug (`aura-curved-boucle-sofa`) separate from database `_id`.
4. **`tags`** (Array of Strings): Keyword tags for backend text indexing (`['living-room', 'sofa', 'boucle', 'luxury']`).
5. **`reviews`** (Subdocuments or Collection): Currently, reviews in `ProductDetails.jsx` are hardcoded in a static array. A true system requires dynamic customer submissions, ratings, and admin approval status.
6. **`seoMeta`** (Object): Dynamic title, description, and OpenGraph images per product.
7. **`featuredImage`** / `primaryImageIndex` (Number or Object): Explicit definition of primary thumbnail versus gallery.
8. **Timestamps & Audit Trail**: `createdAt`, `updatedAt`, `createdBy`, `updatedBy`.

---

## 6. Static vs Dynamic Functionality Breakdown

| Feature / UI Component | Current State in Frontend | Target State in MERN Stack |
|------------------------|---------------------------|----------------------------|
| **Product Catalog** | Read from static `products.js` | Fetched dynamically from `GET /api/products` with pagination, filter, and sort |
| **Category List** | Read from static `categories.js` (12 hardcoded) | Fetched from `GET /api/categories` with real-time product counts |
| **Search Function** | In-memory Javascript `.filter()` on loaded array | MongoDB Atlas Full-Text Search via `GET /api/products?search=...` |
| **Filter by Category** | URL query parameter filtering static array | Server-side query parameter filtering via MongoDB index |
| **Filter by Price** | Client-side slider filtering loaded array | MongoDB range query `{ price: { $lte: maxPrice } }` |
| **Product Detail Page** | In-memory `.find(p => p.id === id)` | Dynamic `GET /api/products/:idOrSlug` with related product aggregation |
| **Shopping Cart** | `CartContext` using browser `localStorage` | Preserved in `localStorage` for guests, with optional backend sync |
| **Wishlist** | `WishlistContext` using browser `localStorage` | Preserved in `localStorage` for guests, with optional customer account sync |
| **Contact Form** | Local state validation; generates WhatsApp URL | Saves inquiry to MongoDB `Inquiry` collection + email/WhatsApp alert |
| **Showroom Booking** | Local state modal; generates WhatsApp message | Saves booking to MongoDB `Booking` collection with admin confirmation |
| **Swatch Ordering** | Local state modal; mock submission message | Saves swatch order to MongoDB with shipping dispatch status |
| **Admin Controls** | **Non-existent** (files must be edited in code) | Dedicated Admin Panel with secure JWT login and full CRUD |

---

## 7. Navigation and Link Audit

Every navigation link and route in the existing project was analyzed:

1. **Header Navigation Links:**
   - Home (`/`): Active state highlights properly.
   - Shop Mega Menu (`/shop`): Categorized into 8 category shortcuts (`/category/sofas`, `/category/beds`, etc.) and 4 collection anchors (`/collections#modern-living`).
   - Collections (`/collections`): Direct route.
   - About (`/about`): Direct route.
   - Contact (`/contact`): Direct route.
   - Search trigger: Opens modal overlay.
   - Cart / Wishlist triggers: Open respective slide-out drawers.
2. **Homepage Links & "See All" Buttons:**
   - Hero "Explore Collection" -> `/shop`
   - Hero "Discover More" -> `/collections`
   - Category Grid "Explore All Collections" -> `/shop`
   - 12 Category Cards -> `/category/:categoryId`
   - Bestselling Furniture "View Complete Catalog" -> `/shop`
   - Product Cards -> `/product/:id`
3. **Shop Page Filters & Links:**
   - Breadcrumb: `Home (/)` -> `Shop (/shop)`
   - Horizontal Category Pills: All Furniture, Sofas, Beds, etc. Updates URL search param `?category=<id>` without page reload.
   - Filter Drawer: Filter by material, badge, price slider.
4. **Category Page Links:**
   - Breadcrumb: `Home (/)` -> `Furniture (/shop)` -> `Category Name (/category/:categoryId)`
   - Subcategory Pills: Filters products matching `p.subCategory`.
   - "Order on WhatsApp" & "Ask About This Product": Builds pre-filled WhatsApp URLs.
5. **Dynamic Link Transformation Strategy:**
   - **Rule 1 (Zero URL Breaking Changes):** Keep existing route formats exactly intact (`/shop`, `/category/:categoryId`, `/product/:id`).
   - **Rule 2 (Dynamic Slug Support):** Update `ProductDetails.jsx` to fetch by either legacy ID (`mnc-sof-01`) or MongoDB `_id` or SEO slug (`aura-curved-boucle-sofa`).
   - **Rule 3 (Instant Propagation):** When an admin creates a product with category `sofas`, it automatically appears in `/category/sofas`, `/shop?category=sofas`, search results, and bestsellers if flagged.

---

## 8. Current Technical Limitations

1. **Zero Content Management Capability:** Adding, updating, or deleting a product currently requires manually editing JavaScript files (`products.js`), rebuilding the project, and redeploying via git.
2. **Image Hosting Scalability:** Images are directly referenced from Unsplash. There is no file upload mechanism, image CDN transformation, thumbnail generation, or WebP/AVIF auto-compression.
3. **No Dynamic Inventory & Stock Control:** Stock availability is static. When a piece sells out, there is no way to mark it out-of-stock without a code commit.
4. **Data Isolation:** Customer inquiries, showroom booking requests, and swatch orders are only handled via WhatsApp redirect; no lead records are retained in a central database for follow-up or analytics.
5. **SEO Dynamic Metadata Limitation:** React 19 is running as a client-side SPA. Single page applications load a static `<title>` and `<meta>` description from `index.html`. Product-specific OpenGraph tags for WhatsApp/Facebook previews are static unless server-side rendered or pre-rendered.
6. **No Admin Authentication:** No authentication layer, roles, or protected routes exist.

---

## 9. Recommended MERN Architecture

To maintain the exact look, feel, animations, and speed of the existing React frontend while adding dynamic power, we recommend a decoupled client-server architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          MERN STACK ECOSYSTEM                          │
├──────────────────────────────────┬─────────────────────────────────────┤
│      CUSTOMER FRONTEND           │         ADMIN DASHBOARD             │
│   (Existing React 19 + Vite)     │   (Protected React Admin Portal)    │
│  - Luxury Storefront             │  - Secure JWT Authentication        │
│  - Shop & Category Navigation    │  - Product CRUD & Inventory         │
│  - Dynamic Search & Filters      │  - Multi-image Cloudinary Upload    │
│  - Cart & Wishlist Drawers       │  - Category & Collection Manager    │
│  - WhatsApp Direct Orders        │  - Lead & Booking Management        │
└─────────────────┬────────────────┴──────────────────┬──────────────────┘
                  │                                   │
                  │ REST API (JSON / HTTPS)           │ REST API + Auth Token
                  ▼                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NODE.JS + EXPRESS API SERVER                    │
│  - Controllers: Product, Category, Collection, Auth, Lead, Upload      │
│  - Middlewares: Auth (JWT), Role Verification, Error Handler, Multer   │
│  - Validation: Joi / Zod Schema Validation                             │
│  - Security: Helmet, CORS, Rate Limiting, Mongo Sanitize               │
└─────────────────┬───────────────────────────────────┬──────────────────┘
                  │                                   │
                  ▼                                   ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│         MONGODB DATABASE         │ │      CLOUDINARY MEDIA CDN         │
│  - Products Collection           │ │  - High-res Furniture Originals  │
│  - Categories Collection         │ │  - WebP / AVIF Auto-Formatting   │
│  - Collections Collection        │ │  - Thumbnail Transformations     │
│  - Users / Admins Collection     │ │  - Fast Global Edge Delivery      │
│  - Leads & Bookings Collection   │ │                                   │
└──────────────────────────────────┘ └───────────────────────────────────┘
```

### Proposed Directory Layout (Clean Monorepo or Root Separation)
```
d:\Furtner/
├── backend/                         # Node.js + Express REST API
│   ├── src/
│   │   ├── config/                  # DB, Cloudinary, JWT configurations
│   │   │   ├── db.js
│   │   │   └── cloudinary.js
│   │   ├── controllers/             # Business logic handlers
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── categoryController.js
│   │   │   ├── leadController.js
│   │   │   └── uploadController.js
│   │   ├── middleware/              # Auth, error, rate-limit, file upload
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   ├── upload.js            # Multer memory storage
│   │   │   └── validator.js
│   │   ├── models/                  # Mongoose data schemas
│   │   │   ├── Admin.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Collection.js
│   │   │   └── Lead.js
│   │   ├── routes/                  # Express route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── leadRoutes.js
│   │   │   └── uploadRoutes.js
│   │   ├── utils/                   # Helpers, seeders, token generator
│   │   │   ├── seeder.js            # Imports existing products.js into MongoDB
│   │   │   └── token.js
│   │   ├── app.js                   # Express app setup
│   │   └── server.js                # Port listener & DB connection
│   ├── .env.example
│   └── package.json
├── frontend/                        # Existing React app (fully preserved)
│   ├── src/
│   │   ├── services/                # Axios / fetch API client services
│   │   │   ├── api.js
│   │   │   ├── productService.js
│   │   │   └── categoryService.js
│   │   └── ... (existing src files preserved)
└── admin/                           # (Optional: Standalone Admin Dashboard or subroute)
```

---

## 10. Proposed MongoDB Schemas

### 10.1 Product Schema (`models/Product.js`)
```javascript
const mongoose = require('mongoose');

const ColorVariantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true },
  inStock: { type: Boolean, default: true }
});

const ProductDimensionsSchema = new mongoose.Schema({
  width: { type: String, default: '' },
  depth: { type: String, default: '' },
  height: { type: String, default: '' },
  seatHeight: { type: String, default: '' },
  bedBaseHeight: { type: String, default: '' },
  weight: { type: String, default: '' }
}, { _id: false });

const ProductImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true }, // Cloudinary asset ID
  altText: { type: String, default: '' },
  isPrimary: { type: Boolean, default: false }
});

const ProductSchema = new mongoose.Schema({
  legacyId: { type: String, unique: true, sparse: true, index: true }, // e.g., 'mnc-sof-01'
  sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { 
    type: String, 
    required: true, 
    index: true 
  }, // references Category.slug (e.g. 'sofas')
  categoryLabel: { type: String, required: true },
  subCategory: { type: String, required: true, index: true },
  
  // Pricing
  price: { type: Number, required: true, min: 0 },
  originalPrice: { type: Number, default: 0, min: 0 },
  
  // Badges and Merchandising
  badge: { type: String, default: null }, // e.g. 'Bestseller', 'Signature Piece'
  isBestseller: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false, index: true },
  isActive: { type: Boolean, default: true, index: true }, // Published / Draft
  
  // Stock & Inventory
  stockQuantity: { type: Number, default: 5, min: 0 },
  inStock: { type: Boolean, default: true },
  
  // Descriptions
  shortDescription: { type: String, required: true },
  fullDescription: { type: String, required: true },
  
  // Specifications
  dimensions: ProductDimensionsSchema,
  materials: [{ type: String, trim: true }],
  colors: [ColorVariantSchema],
  images: [ProductImageSchema],
  
  // Trust & Concierge
  leadTime: { type: String, default: 'Complimentary White-Glove In-Home Delivery across AP (3–7 Days)' },
  warranty: { type: String, default: '10-Year Structural Frame & Termite Warranty' },
  
  // Ratings
  rating: { type: Number, default: 5.0, min: 1, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  
  // Audit metadata
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
  timestamps: true
});

// Full-text search index
ProductSchema.index({
  name: 'text',
  shortDescription: 'text',
  fullDescription: 'text',
  materials: 'text',
  subCategory: 'text'
});

module.exports = mongoose.model('Product', ProductSchema);
```

### 10.2 Category Schema (`models/Category.js`)
```javascript
const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // e.g., 'sofas'
  legacyId: { type: String, default: null }, // e.g., 'living-room'
  name: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  tagline: { type: String, default: '' },
  description: { type: String, required: true },
  image: { type: String, required: true },
  imagePublicId: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  subcategories: [{ type: String, trim: true }],
  orderIndex: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);
```

### 10.3 Admin User Schema (`models/Admin.js`)
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['superadmin', 'editor', 'concierge'], default: 'editor' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

AdminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', AdminSchema);
```

### 10.4 Customer Lead / Inquiry Schema (`models/Lead.js`)
```javascript
const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['contact_inquiry', 'showroom_booking', 'swatch_order', 'whatsapp_order'], 
    required: true 
  },
  fullName: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed }, // Form specific data (dates, room scope, swatches)
  status: { type: String, enum: ['new', 'contacted', 'scheduled', 'completed', 'cancelled'], default: 'new' },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', LeadSchema);
```

---

## 11. Admin Dashboard Requirements

A separate, authenticated administrative portal must be developed to empower non-technical managers to control the store:

### 1. Authentication & Session Management
- Clean admin login page with email and password inputs.
- JWT stored in secure `httpOnly` cookie or memory with secure refresh token flow.
- Password change and secure session logout.
- Auto-logout on token expiration.

### 2. Dashboard Overview & Analytics
- Metrics cards:
  - Total Active Products.
  - Total Categories.
  - Low Stock Alerts (`stockQuantity <= 2`).
  - Total Inquiries & Showroom Booking Requests.
- Quick shortcut buttons: "Add New Product", "View Customer Leads", "Manage Categories".

### 3. Product Management (CRUD)
- **Product Table:** Searchable, sortable, paginated data table.
  - Columns: Image, Name, SKU, Category, Price, Stock Status, Featured/Bestseller toggles, Actions (Edit, Delete, Preview).
  - Quick-toggle switches for `isActive`, `isFeatured`, and `isBestseller` without leaving the table.
- **Add Product Screen:**
  - Standard fields: Name, SKU, Category (dropdown), Subcategory (auto-suggest from category), Price (INR), Original MRP.
  - Descriptions: Rich text or markdown for full description, character-counted short description.
  - Multi-image dropzone: Drag-and-drop multiple images with instant upload to Cloudinary. Drag to reorder primary thumbnail.
  - Dimensions inputs: Width, Depth, Height, Seat Height, Weight.
  - Materials tags input: Easy tag pills.
  - Finishes/Colors editor: Add color name, hex code color picker, in-stock checkbox.
  - Delivery & Warranty text defaults.
- **Edit Product Screen:**
  - Pre-filled with existing data.
  - Delete individual images or append new ones.
  - Immediate preview link opening the live frontend product page.
- **Delete Product:**
  - Soft-delete or hard-delete with two-step confirmation modal and Cloudinary asset cleanup.

### 4. Category Management
- List 12 existing categories with product count badges.
- Add or edit category title, tagline, description, and hero banner image.
- Manage category subcategories list (adds subcategories that appear in product form dropdowns).

### 5. Customer Leads & Experience Centre Bookings
- Tabular view of all incoming contact inquiries, showroom appointments, and swatch requests.
- Filter by status (`New`, `Contacted`, `Completed`).
- One-click "Chat on WhatsApp" button next to each customer's phone number.

---

## 12. Proposed API Endpoints

### Public Endpoints (Customer Frontend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get products with query filters (`?category=sofas&search=teak&sort=price-low&page=1&limit=12`) |
| `GET` | `/api/products/bestsellers` | Retrieve top bestselling products for Homepage |
| `GET` | `/api/products/featured` | Retrieve featured curation pieces |
| `GET` | `/api/products/:idOrSlug` | Retrieve complete details of a single product by ID or slug |
| `GET` | `/api/products/:idOrSlug/related` | Retrieve related products within the same category |
| `GET` | `/api/categories` | Retrieve all active categories with subcategories and piece counts |
| `GET` | `/api/categories/:slug` | Retrieve single category details with its products |
| `GET` | `/api/collections` | Retrieve curated collection suites |
| `POST` | `/api/leads/inquiry` | Submit contact form inquiry |
| `POST` | `/api/leads/booking` | Submit experience centre private appointment booking |
| `POST` | `/api/leads/swatch` | Submit complimentary material swatch order |

### Protected Endpoints (Admin Dashboard - Requires JWT Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/auth/login` | Authenticate admin & issue token |
| `POST` | `/api/admin/auth/logout` | Invalidate session |
| `GET` | `/api/admin/auth/me` | Verify active session & retrieve admin profile |
| `GET` | `/api/admin/dashboard/stats` | Retrieve aggregate metrics (product counts, low stock, leads) |
| `POST` | `/api/admin/products` | Create a new product |
| `PUT` | `/api/admin/products/:id` | Update an existing product |
| `DELETE` | `/api/admin/products/:id` | Delete a product and remove images from Cloudinary |
| `PATCH` | `/api/admin/products/:id/quick-edit` | Quick inline edit for price, stock, or status |
| `POST` | `/api/admin/upload/images` | Upload single or multiple images to Cloudinary |
| `DELETE` | `/api/admin/upload/images/:publicId` | Delete image asset from Cloudinary |
| `POST` | `/api/admin/categories` | Create new category |
| `PUT` | `/api/admin/categories/:id` | Update category details and image |
| `DELETE` | `/api/admin/categories/:id` | Delete category (checks for existing products first) |
| `GET` | `/api/admin/leads` | Retrieve customer inquiries & showroom bookings |
| `PATCH` | `/api/admin/leads/:id/status` | Update lead status (`Contacted`, `Completed`) |

---

## 13. Image Upload Architecture

### Recommended Provider: Cloudinary
Cloudinary is the industry standard for luxury e-commerce due to its automated responsive delivery, format optimization (WebP/AVIF), and transformation capabilities.

### Upload Flow:
1. **Admin File Selection:** Admin drops images in the Admin React Dashboard.
2. **Multipart Form Request:** Dashboard sends `multipart/form-data` to `POST /api/admin/upload/images` with JWT authorization header.
3. **Server Memory Buffer:** Node.js Express server receives file via `multer` memory storage (no temporary files stored on disk).
4. **Cloudinary Stream:** Server streams buffer to Cloudinary folder `mnc-lifestyle/products/` with eager transformations.
5. **Secure URL Return:** Cloudinary returns `secure_url`, `public_id`, `width`, `height`, and `format`.
6. **MongoDB Storage:** The array of `{ url, publicId, altText, isPrimary }` is persisted in the product document.

### Cloudinary Optimization Rules:
- **Automatic Format & Quality:** Deliver with `f_auto,q_auto` to reduce image payloads by up to 60% without perceptible loss of timber grain detail.
- **Card Thumbnails:** Use Cloudinary dynamic transformations:
  `https://res.cloudinary.com/<cloud>/image/upload/c_fill,w_800,h_600,q_auto,f_auto/<public_id>`
- **Asset Cleanup on Delete:** When an admin deletes a product or removes an image from a gallery, the backend calls `cloudinary.uploader.destroy(publicId)` to prevent orphaned files and unnecessary storage costs.

---

## 14. Security Audit & Recommendations

### Critical Vulnerabilities in Static Frontend to Avoid During MERN Transition:
1. **Never Expose Secrets in Client Code:**
   - **Risk:** Storing MongoDB connection URIs, JWT secrets, or Cloudinary API secrets in Vite's `.env` (prefixed with `VITE_`) bundles them into public JavaScript files where anyone can inspect them.
   - **Remedy:** Keep all database credentials and secret keys exclusively in `backend/.env`.
2. **Admin Authentication & Password Hashing:**
   - Passwords must be hashed using `bcryptjs` with a work factor of at least 12 rounds before storing in MongoDB.
   - Use industry-standard JSON Web Tokens (JWT) signed with a minimum 256-bit cryptographically random secret (`JWT_SECRET`).
3. **Route Protection & Role Verification:**
   - Create an Express middleware `protect` that decodes the Bearer token, checks database expiration, and ensures user existence.
   - Restrict administrative endpoints exclusively to authenticated admins.
4. **Input Sanitization & Injection Prevention:**
   - Utilize `express-mongo-sanitize` to strip `$` and `.` operators from request bodies, preventing NoSQL injection attacks.
   - Validate and sanitize all incoming request bodies using `joi` or `zod`.
5. **Rate Limiting & Abuse Prevention:**
   - Apply `express-rate-limit` on login attempts (maximum 5 attempts per 15 minutes per IP) to prevent brute-force attacks.
   - Apply rate limiting on customer inquiry forms to prevent spam submissions.
6. **HTTP Security Headers & CORS:**
   - Deploy `helmet` middleware to set `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, and strict HSTS policies.
   - Configure `cors` to whitelist only authorized frontend domains (`http://localhost:5173`, `https://mnclifestyle.in`, and admin domain).

---

## 15. SEO and Performance Audit

### Current Strengths:
- Clean semantic HTML structure with high-quality heading hierarchy (`h1`, `h2`, `h3`).
- Rich Schema.org `FurnitureStore` structured data in `index.html` detailing phone, address, coordinates, and opening hours in Visakhapatnam.
- Responsive images with native `loading="lazy"` on secondary cards and `fetchPriority="high"` on the main hero banner.
- High accessibility rating with custom `ScrollReveal` respecting `prefers-reduced-motion`.

### Limitations in Pure Static Client SPA:
- **Static Meta Titles:** All pages currently share the same static meta title and description defined in `index.html`. When sharing a link to `/product/mnc-sof-01` on WhatsApp, the preview displays the homepage metadata instead of the sofa's specific title, image, and price.
- **Search Engine Indexing:** While modern Googlebot parses JavaScript, social sharing crawlers (WhatsApp, Facebook, Twitter, LinkedIn) do not execute JavaScript and only read static HTML meta tags.

### Recommendations (Preserving Existing UI):
1. **Dynamic Meta Tags:** Integrate `react-helmet-async` on all frontend route views (`Shop`, `Category`, `ProductDetails`) to dynamically update:
   - `<title>`: e.g. "Aura Curved Bouclé Sofa — Luxury Living | MNC LifeStyle Visakhapatnam"
   - `<meta name="description">`: Dynamic short description.
   - `<meta property="og:image">`: First product photo URL.
   - `<meta property="og:price:amount">`: Product price.
2. **Product-Level Schema.org JSON-LD:**
   - Inject dynamic `@type: "Product"` schema into `ProductDetails.jsx` containing `name`, `image`, `description`, `sku`, `offers` (price, priceCurrency: 'INR', availability: 'InStock').
3. **Fast API Response & Caching:**
   - Add database indexing on `{ category: 1, isBestseller: 1, price: 1 }`.
   - Implement HTTP caching headers (`Cache-Control: public, max-age=120`) on public category and product listings.

---

## 16. Step-by-Step Migration Roadmap

To transition smoothly from static React into a full MERN stack without downtime or UI breakage, follow this 10-phase sequence:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MERN CONVERSION ROADMAP                           │
├────────┬───────────────────────────────────────┬───────────────────────┤
│ Phase  │ Objective                             │ Deliverable           │
├────────┼───────────────────────────────────────┼───────────────────────┤
│ Step 1 │ Project Audit (Current Phase)         │ Completed Report      │
│ Step 2 │ Backend Architecture & Server Setup   │ Node/Express in place │
│ Step 3 │ MongoDB Schema & Database Seeding     │ 19 Products in DB     │
│ Step 4 │ Admin Authentication & Security       │ JWT Login & Protect   │
│ Step 5 │ Product & Category REST CRUD APIs     │ Tested Endpoints      │
│ Step 6 │ Cloudinary Media Integration          │ Live Image Upload     │
│ Step 7 │ Secure Admin Dashboard Development    │ Usable Admin Portal   │
│ Step 8 │ Connect Existing React Frontend       │ API Services & Hooks  │
│ Step 9 │ Dynamic Routing & Navigation Linking  │ 100% Dynamic Links    │
│ Step 10│ Full Verification & Production Deploy │ Live Full-Stack App   │
└────────┴───────────────────────────────────────┴───────────────────────┘
```

### Detailed Execution Tasks:
1. **Phase 2 – Backend Setup:** Initialize `backend/` folder, install Express, Mongoose, dotenv, cors, helmet, morgan. Configure database connection to MongoDB Atlas.
2. **Phase 3 – Data Seeding:** Run a database seeder script that imports the exact data from `src/data/categories.js` and `src/data/products.js` into MongoDB. Verify 12 categories and 19 products are preserved with exact IDs and specifications.
3. **Phase 4 – Auth Engine:** Build admin model, bcrypt password hashing, login controller, and JWT verification middleware.
4. **Phase 5 – Product APIs:** Implement filtered, paginated product endpoints (`GET /api/products`), single product lookups (`GET /api/products/:id`), and admin CRUD handlers.
5. **Phase 6 – Cloudinary Media:** Configure Cloudinary SDK with Multer to allow image uploads from admin forms.
6. **Phase 7 – Admin Portal:** Build the admin dashboard UI using modern, clean components matching the aesthetic shown in the target design preview.
7. **Phase 8 – Frontend Integration:** Create `src/services/api.js` in the React app. Replace static imports of `products` and `categories` with custom query hooks. Add loading skeletons matching the luxury theme.
8. **Phase 9 – Dynamic Link Validation:** Ensure "See All" buttons, category pills, search bar, and product card click-throughs fetch dynamically from MongoDB without changing any URL structure.
9. **Phase 10 – Production Deployment:** Deploy backend to a reliable cloud platform (Render, Railway, or AWS) and connect frontend environment variables.

---

## 17. Potential Risks and Mitigation Solutions

| Potential Risk | Technical Impact | Architect-Approved Mitigation Strategy |
|----------------|------------------|----------------------------------------|
| **1. UI / Design Regression** | Frontend styling or animations breaking when switching data sources. | **Zero redesign policy:** Do not touch component JSX/CSS. Only replace static array variables with data fetched from the API. Ensure API responses match the exact property keys currently used. |
| **2. Breaking Existing URLs** | Bookmarked URLs or WhatsApp links breaking if IDs change. | Support dual lookups in the backend controller: `Product.findOne({ $or: [{ slug: req.params.id }, { legacyId: req.params.id }, { _id: isValidObjectId ? req.params.id : null }] })`. |
| **3. Slower Initial Page Load** | Waiting for remote database queries might cause empty screens. | Implement subtle luxury loading skeletons; cache category lists in React state; enable MongoDB connection pooling; serve all images from Cloudinary CDN. |
| **4. Cloudinary Free Tier Limits** | Exceeding storage or transformation limits. | Compress before upload; use `f_auto,q_auto`; delete old assets from Cloudinary when updating or deleting products. |
| **5. CORS & Environment Issues** | Frontend fails to connect to backend due to cross-origin blocks. | Configure explicit CORS whitelist with credentials support; manage environment variables cleanly using `.env.development` and `.env.production`. |

---

## 18. Final Recommendations & Readiness Sign-Off

1. **Keep the Existing Frontend Clean:** The current React 19 UI is exceptionally well designed, responsive across mobile viewports (360px–430px) and desktops (1440px–1920px), and has high conversion potential with direct WhatsApp ordering. **Do not redesign or discard this frontend.**
2. **Preserve Legacy IDs in MongoDB:** By maintaining `legacyId: 'mnc-sof-01'` on all products during database seeding, zero existing links or cart items will break.
3. **Maintain WhatsApp Direct Order Utility:** Keep `src/utils/whatsapp.js` intact; it works seamlessly with dynamic data by simply accepting the product object returned by the API.
4. **Readiness Status:** The project is thoroughly audited, completely cataloged, and **100% ready to proceed to Phase 2 (Backend & Database Architecture Setup)**.

---
*Report compiled and verified by Senior MERN Stack Architect for MNC LifeStyle.*
