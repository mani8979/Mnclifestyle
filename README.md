# MNC LIFESTYLE — Premium Furniture & Architectural Living

> A luxury furniture e-commerce experience blending the refined editorial elegance of Tianu Furniture with the structured, user-friendly shopping architecture of DAMRO.

![React 19](https://img.shields.io/badge/React-19.3-blue.svg)
![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)
![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success.svg)

---

## 🏛️ Brand & Design Philosophy

**MNC LIFESTYLE** delivers contemporary solid wood furniture, bespoke architectural joinery, and minimalist living concepts designed for modern residences.

- **Warm Editorial Color Palette:**
  - Ivory (`#F7F5F0`) — Primary breathing canvas
  - Soft Beige (`#EAE3D8`) — Secondary architectural surfaces
  - Deep Charcoal (`#252525`) — High-contrast typography & structural lines
  - Warm Grey (`#77736D`) — Subdued body copy & specifications
  - Muted Bronze (`#826039`) — Verified WCAG AA compliant text accent (5.48:1 contrast on ivory)
  - Espresso Brown (`#30251F`) — Dark hero grounding & CTA button surfaces
- **Editorial Typography:**
  - Headings: *Cormorant Garamond* (editorial serif)
  - Body & UI: *Plus Jakarta Sans* (geometric clean sans-serif)

---

## ✨ Key Features

1. **Interactive Showroom & Lookbook Experience:**
   - **Shop the Look Hotspots:** Interactive room scenes with clickable furniture markers, preview cards, and mobile slide-up sheets.
   - **Dual-Angle Photography:** Instant preview on desktop hover and touch card transitions.
   - **Quick View Modal:** In-place product inspection, wood/fabric swatch switcher, and instant cart additions.
   - **Complimentary Swatch Kit Modal:** Request up to 3 physical Belgian linen and solid wood finish swatches in a custom presentation box.
   - **Private Showroom Visit Scheduler:** Dedicated consultation booking for flagship design galleries.

2. **Full E-Commerce Architecture (Frontend):**
   - **Persistent Cart & Wishlist Drawers:** LocalStorage-persisted state with sliding drawer interfaces and item counter badges.
   - **Multi-Filter Catalog:** Filter by Room Category, Collection, Material, and Price Range with instant clearing.
   - **Detailed Product Specification Tabs:** Comprehensive dimensions, timber source, care instructions, and white-glove delivery details.
   - **Client Concierge Portal:** Responsive contact and trade architect inquiry forms with local validation.

3. **Responsive & Accessible Design:**
   - Fully audited and verified across 12 viewport widths:
     `320px`, `360px`, `375px`, `390px`, `430px`, `768px`, `1024px`, `1100px`, `1280px`, `1366px`, `1440px`, `1920px`.
   - 44px minimum touch targets on mobile controls.
   - Zero horizontal overflow (`overflow-x: hidden` safeguards).
   - Dynamic mobile sticky action bars for seamless mobile purchases.

4. **Config-Driven Business Claims:**
   - All commercial claims, warranties, lead times, and concierge contact points are centralized in `src/data/businessConfig.js` for instant client updates without refactoring code.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + PostCSS + Autoprefixer
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Persistence:** Browser LocalStorage API (zero external database / backend dependencies required)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/mani8979/Mnclifestyle.git

# Navigate to project folder
cd Mnclifestyle

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build
```bash
# Compile and bundle optimized production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
├── public/                 # Static assets, icons, fonts
├── src/
│   ├── components/         # Reusable luxury UI components
│   │   ├── Header.jsx      # Responsive header with room navigation & drawer triggers
│   │   ├── Hero.jsx        # High-impact editorial hero section
│   │   ├── Footer.jsx      # Multi-column luxury footer & newsletter signup
│   │   ├── ProductCard.jsx # Dual-image hover card with 44px mobile touch targets
│   │   ├── ShopTheLook.jsx # Interactive hotspot room scenes
│   │   ├── SwatchModal.jsx # Complimentary swatch kit modal
│   │   ├── ShowroomModal.jsx # Private appointment scheduler modal
│   │   ├── ProductQuickViewModal.jsx # Quick inspection modal
│   │   ├── CartDrawer.jsx  # Slide-over shopping bag drawer
│   │   └── WishlistDrawer.jsx # Slide-over wishlist drawer
│   ├── context/            # React Context providers (Cart & Wishlist)
│   ├── data/
│   │   ├── businessConfig.js # Centralized client-editable business claims & warranties
│   │   ├── products.js     # 15 realistic luxury furniture products
│   │   ├── categories.js   # Room categories (Living, Dining, Bedroom, etc.)
│   │   └── collections.js  # Signature collections (Sylvan, Monolith, etc.)
│   ├── pages/              # Route views (Home, Shop, Category, Collections, Details, About, Contact)
│   ├── App.jsx             # Main router wrapper
│   ├── index.css           # Global typography & Tailwind styles
│   └── main.jsx            # React root mount
├── tailwind.config.js      # Custom luxury color tokens & font definitions
└── vite.config.js          # Vite bundler configuration
```

---

## 📄 License
Private & Proprietary — Developed for **MNC LIFESTYLE**.
