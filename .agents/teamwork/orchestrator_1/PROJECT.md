# Project: Sinar Minimalis Modernization & Architectural Redesign

## Architecture
- **Overview**: High-performance, architectural-grade, mobile-first static catalog website for "Sinar Minimalis" (Purwakarta & Jabodetabek roster manufacturer).
- **Frontend Stack**: Semantic HTML5, modern CSS3 (Custom Properties design tokens, fluid typography, CSS Grid, Flexbox, touch-first responsive breakpoints), modular ES6+ JavaScript.
- **Data Architecture**: Structured catalog data model (`js/catalog-data.js`) containing all 37 product items with rich metadata (name, category, material, motif, dimensions, unit price, asset path, alt text, and dynamic WhatsApp order parameter).
- **Interactive Engines**:
  - Filter Engine: Instant multi-category/material filtering with animated transitions and result count (`js/catalog.js`).
  - Search Engine: Debounced (<50ms) case-insensitive multi-attribute search with empty-state recovery.
  - Lightbox Engine: High-resolution zoom modal with technical specs, responsive dismiss (close button, backdrop, Escape key), and direct contextual WhatsApp order CTA.
  - Calculator Engine: Interactive Roster Wall Area Calculator (wall dimension inputs, automatic pcs count + 5% waste margin, 1-click WhatsApp quote generator).
  - WhatsApp Order Engine: Dynamic URI-encoded messaging targeting `+62 878 6979 6938` across 5 contextual user workflows.
  - SEO & Local Engine: Open Graph, Twitter Cards, LocalBusiness / HomeAndConstructionBusiness JSON-LD schema (Purwakarta 41162), Product ItemList schema, FAQPage schema.
  - Performance & A11y Engine: Native lazy loading, explicit aspect ratios for zero CLS, WCAG AA compliant contrast (darkened terracotta #945738 >= 4.5:1), >= 44x44px touch targets.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 37-Product Catalog Inventory | All 35 numbered rosters + 2 flagship products (`product_concrete.png`, `product_terracotta.png`) | M2 | Survey 1, 2, Spec Miner |
| 2 | Product Metadata & Specifications | Material tags, motif classification, dimensions (20x20x10), prices (Rp 14.000–16.000) | M2 | Survey 1, Spec Miner |
| 3 | Category & Material Filter Chips | Filter pills: Semua, Beton, Terakota, Geometris, Flora, 3D | M2 | ORIGINAL_REQUEST R2 |
| 4 | Live Instant Catalog Search | Debounced (<50ms) search across product title, material, and dimensions | M2 | ORIGINAL_REQUEST R2 |
| 5 | Catalog Result Counter & Empty State | Live count ("Menampilkan X dari 37") and empty state with Reset button | M2 | Spec Miner |
| 6 | High-Resolution Lightbox Modal | Zoom view, full specs, Esc key, backdrop tap, and contextual WhatsApp order CTA | M2 | ORIGINAL_REQUEST R2 |
| 7 | Dynamic WhatsApp Product Order CTA | Product card & lightbox order button with prefilled name, material, price to +62 878 6979 6938 | M2 | ORIGINAL_REQUEST R2, R5 |
| 8 | Wholesale Inquiry WhatsApp Buttons | Wholesale buttons on cards and wholesale banner with bulk order message | M2 | ORIGINAL_REQUEST R2 |
| 9 | Architectural Design System & Color Palette | Calibrate terracotta to #945738 (WCAG AA >= 4.5:1), charcoal #1A1B1E, sand #F9F8F5 | M1 | Survey 2, ORIGINAL_REQUEST R1 |
| 10 | Architectural Typography & Scale | Fluid font scale (Plus Jakarta Sans/Outfit), architectural headings, crisp tracking | M1 | Survey 2, ORIGINAL_REQUEST R1 |
| 11 | Premium Hero Section Overhaul | Credibility badges, manufacturing capacity, priority image loading (`fetchpriority="high"`) | M1 | Survey 2, ORIGINAL_REQUEST R1 |
| 12 | Navigation Header & Footer | Sticky glassmorphism header, complete section links, responsive drawer, accessible footer | M1 | Survey 2, ORIGINAL_REQUEST R1 |
| 13 | Interactive Roster Wall Calculator | Input length & height (m), auto-calculate m², roster pcs (25/m²) + 5% reserve, WA quote CTA | M3 | Survey 2 Proposal |
| 14 | Project Inspiration Gallery Overhaul | Touch-friendly cards, high-res project lightbox, architectural context | M3 | ORIGINAL_REQUEST R1 |
| 15 | Step-by-Step Order Flow | 4-step ordering guide with visual progress connectors and clarity | M3 | ORIGINAL_REQUEST R1 |
| 16 | Accessible FAQ Accordion | ARIA attributes (`aria-expanded`, `aria-controls`), expanded buyer questions (MOQ, shipping) | M3 | ORIGINAL_REQUEST R1 |
| 17 | Interactive Contact Form Forwarder | Form inputs validation, formatting into WhatsApp message to +62 878 6979 6938 | M3 | ORIGINAL_REQUEST R2, R5 |
| 18 | Mobile-First Responsive Breakpoints | Perfect rendering across 360px, 414px, 768px, 1024px, 1280px+ without horizontal overflow | M4 | ORIGINAL_REQUEST R4 |
| 19 | Touch Target Compliance | Enforce minimum 44x44px bounding box on all mobile clickables | M4 | Survey 2, ORIGINAL_REQUEST R4 |
| 20 | Mobile Bottom Nav & Floating WA Sync | Hide desktop floating WA on mobile to prevent bottom nav collision | M4 | Survey 2, ORIGINAL_REQUEST R4 |
| 21 | Zero Cumulative Layout Shift (CLS) | Explicit width, height, and CSS aspect-ratio on all 51 images and map iframe | M4 | ORIGINAL_REQUEST R3 |
| 22 | Native Lazy Loading & Decoding | `loading="lazy"` and `decoding="async"` on below-fold images | M4 | ORIGINAL_REQUEST R3 |
| 23 | Immediate Page Loader Transition | Remove artificial 1200ms setTimeout delay; fade out immediately on DOM load | M4 | Survey 2, ORIGINAL_REQUEST R3 |
| 24 | Local Purwakarta & Jabodetabek SEO | Single `<h1>`, Open Graph metadata, Twitter Cards, canonical tags, local keywords | M4 | ORIGINAL_REQUEST R5 |
| 25 | Structured Data JSON-LD Schemas | LocalBusiness (Purwakarta 41162), ItemList/Product, FAQPage schemas | M4 | ORIGINAL_REQUEST R5 |
| 26 | Descriptive Alt Text for All Media | SEO & accessibility alt tags for all 51 assets following architectural formula | M4 | ORIGINAL_REQUEST R5 |
| 27 | Dead Code Elimination | Remove orphaned darkToggle listeners, unreferenced CSS rules, and cleanup scripts | M1 | Survey 1, Survey 2 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Architectural Design System & Brand Identity | Features #9, #10, #11, #12, #27: Visual palette, typography, hero overhaul, header/footer, cleanup | none | DONE |
| M2 | Product Catalog Data & Interactive Catalog Engine | Features #1, #2, #3, #4, #5, #6, #7, #8: 37 products, filter chips, search, lightbox modal, dynamic WA CTA | M1 | PLANNED |
| M3 | Conversion Funnel & Architectural Experience | Features #13, #14, #15, #16, #17: Wall Calculator, Project Gallery, Order Flow, FAQ Accordion, Contact Form | M1, M2 | PLANNED |
| M4 | Performance, Responsiveness & Local SEO Package | Features #18, #19, #20, #21, #22, #23, #24, #25, #26: Zero CLS, 44px targets, lazy loading, SEO metadata, JSON-LD | M1, M2, M3 | PLANNED |
| M5 | Final Milestone: 100% E2E Pass & Adversarial Hardening | Phase 1: 100% pass across Tiers 1-4; Phase 2: Adversarial coverage hardening (Tier 5) | M1, M2, M3, M4 | PLANNED |

## Interface Contracts

### 1. Catalog Data Model (`js/catalog-data.js`)
```javascript
/**
 * @typedef {Object} ProductItem
 * @property {string} id - Unique identifier (e.g. 'R01', 'R36')
 * @property {string} name - Product name (e.g. 'Roster Hemavara')
 * @property {string} category - Category pill key ('beton', 'terakota', 'geometris', 'flora', '3d')
 * @property {string} categoryLabel - Human label (e.g. 'Beton Abu-abu K-250')
 * @property {string} material - Material description (e.g. 'Beton Abu-abu Presisi')
 * @property {string} dimensions - Dimensions string (e.g. '20 × 20 × 10 cm')
 * @property {number} price - Unit price number (e.g. 14000)
 * @property {string} priceFormatted - Formatted price string (e.g. 'Rp 14.000 / pcs')
 * @property {string} image - Image path relative to root (e.g. 'images/roster_1.jpg')
 * @property {string} alt - Descriptive SEO alt text
 * @property {boolean} isFlagship - Flag indicating flagship showcase item
 */
window.CATALOG_PRODUCTS = [ /* 37 items */ ];
```

### 2. Catalog Engine (`js/catalog.js`)
```javascript
// Filter & Search Interface
function initCatalogEngine() { /* attaches search input, filter pills, result count */ }
function filterProducts(categoryKey, searchQuery) { /* updates DOM visibility without CLS */ }
function openProductLightbox(productId) { /* populates modal, locks scroll, attaches WA CTA */ }
function closeProductLightbox() { /* restores scroll, clears active modal */ }
```

### 3. WhatsApp Message Generator (`js/main.js` / `js/catalog.js`)
```javascript
const WA_PHONE = '6287869796938';
function createWhatsAppOrderUrl(product) {
  const text = `Halo Sinar Minimalis, saya tertarik memesan produk:\n- Produk: ${product.name}\n- Material: ${product.material}\n- Harga: ${product.priceFormatted}\n\nMohon info stok, minimal order, dan estimasi ongkir ke lokasi saya. Terima kasih.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}
function createWhatsAppWholesaleUrl(product) {
  const text = `Halo Sinar Minimalis, saya ingin menanyakan harga grosir / pembelian partai besar untuk produk: ${product.name}. Mohon info pricelist dan diskon quantity. Terima kasih.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}
```

### 4. Wall Calculator Interface (`js/calculator.js`)
```javascript
function calculateRosterRequirement(lengthMeter, heightMeter, pcsPerM2 = 25, reservePercent = 5) {
  const areaM2 = lengthMeter * heightMeter;
  const basePcs = Math.ceil(areaM2 * pcsPerM2);
  const reservePcs = Math.ceil(basePcs * (reservePercent / 100));
  const totalPcs = basePcs + reservePcs;
  return { areaM2, basePcs, reservePcs, totalPcs };
}
```

## Code Layout & Write Boundaries
- `index.html`: Main entry point containing semantic HTML structure, SEO metadata, schemas, and section layouts. Owned by active milestone worker.
- `css/style.css`: Primary stylesheet, design tokens, responsive breakpoints, animations.
- `js/catalog-data.js`: Structured data object for all 37 product items.
- `js/catalog.js`: Filter, search, and lightbox modal engine.
- `js/calculator.js`: Interactive roster wall area calculator module.
- `js/main.js`: Main site interactions (navbar, scroll spy, FAQ accordion, contact form, loader).
- `tests/`: Automated E2E test suite directory (owned exclusively by E2E Testing Track).
