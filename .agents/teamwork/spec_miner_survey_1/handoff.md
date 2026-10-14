# Specification Document: Sinar Minimalis Website Modernization
**Document Version:** 1.0.0  
**Author:** Spec Miner Survey 1 (Requirements, SEO & WhatsApp Spec Miner)  
**Assigned Directory:** `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\spec_miner_survey_1`  
**Reference Specification:** `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\ORIGINAL_REQUEST.md`  
**Date:** 2026-10-13

---

## 1. Executive Summary & Specification Scope

This document defines the complete technical, functional, SEO, accessibility, performance, and integration specifications for the comprehensive redesign and modernization of the **Sinar Minimalis** architectural roster website (`c:\Users\Hype G12\OneDrive\website roster`).

The specification covers:
1. **Full Product Catalog Specification (37 Items)**: All 35 numbered roster variants (`roster_1.jpg` through `roster_35.png`) plus 2 premium flagship assets (`product_concrete.png` and `product_terracotta.png`), with metadata, dimensions, materials, motifs, pricing, and WhatsApp order parameters.
2. **Interactive Catalog Engine**: Category/material filtering, live search with zero CLS, interactive high-resolution lightbox modal with contextual order CTA.
3. **WhatsApp Ordering Engine (+62 878 6979 6938)**: Five context-specific, pre-filled, URI-encoded message workflows for product cards, wholesale inquiry, floating button, mobile navigation, and contact form.
4. **Complete SEO & Local Purwakarta/Jabodetabek Search Engine**: Semantic HTML5 hierarchy, Open Graph & Twitter Card social metadata, dual JSON-LD schemas (`LocalBusiness` and `Product`/`ItemList`, plus `FAQPage`), local keyword targeting strategy, and descriptive image alt text standards.
5. **Performance & WCAG 2.1 AA Accessibility Standards**: Zero Cumulative Layout Shift (CLS) layout geometry, responsive image loading strategies, sub-50ms search debounce, color contrast calibration (fixing `--primary` on light backgrounds), touch targets (>= 44x44px), and keyboard/screen reader accessibility.
6. **Testable Acceptance Criteria & Verification Metrics**: Quantitative assertions across 4 tiers of end-to-end (E2E) testing.

---

## 2. Complete Catalog Specifications (All 37 Product Variants)

The audit of `images/` revealed 35 numbered roster assets (`roster_1.jpg` - `roster_35.png`) and 2 studio flagship assets (`product_concrete.png`, `product_terracotta.png`). The current live `index.html` only displays 32 items; items 33, 34, 35, and the 2 flagship items are unlisted. All 37 items MUST be integrated into the catalog.

### Catalog Inventory Table

| ID | File Asset | Product Name | Category / Motif | Material | Standard Size | Unit Price | Contextual WhatsApp Message Parameter |
|---|---|---|---|---|---|---|---|
| R01 | `images/roster_1.jpg` | Roster Hemavara | Klasik / Geometris | Terracotta / Grey | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Hemavara (Terracotta/Grey, Rp 14.000/pcs). Mohon info ketersediaan stok dan ongkir.` |
| R02 | `images/roster_2.jpg` | Roster Motif Kampak | Geometris | Beton Abu-abu | 10x30x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Motif Kampak (10x30 cm, Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R03 | `images/roster_3.jpg` | Roster Motif Daun | Flora / Organik | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Motif Daun (20x20x10 cm, Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R04 | `images/roster_4.jpg` | Roster Minimalis Strip | Minimalis | Beton / Putih / Merah | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Minimalis Strip (Rp 14.000/pcs). Mohon info pilihan warna beton dan stok.` |
| R05 | `images/roster_5.jpg` | Roster Lingkaran Retro | Minimalis / Retro | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Lingkaran Retro (Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R06 | `images/roster_6.jpg` | Roster Bintang Segi Empat | Geometris / Bintang | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Bintang Segi Empat (Rp 14.000/pcs). Mohon info stok dan estimasi pengiriman.` |
| R07 | `images/roster_7.jpg` | Roster Silang Diagonal | Asimetris / Garis | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Silang Diagonal (Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R08 | `images/roster_8.jpg` | Roster Lengkung Vertikal | Geometris / Garis | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Lengkung Vertikal (Rp 14.000/pcs). Mohon info ketersediaan stok.` |
| R09 | `images/roster_9.jpg` | Roster Segitiga Terbalik | Geometris | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Segitiga Terbalik (Rp 14.000/pcs). Mohon info stok dan ongkir.` |
| R10 | `images/roster_10.jpg` | Roster Cekung Horizontal | Minimalis | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Cekung Horizontal (Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R11 | `images/roster_11.png` | Roster Kotak 4 Lubang | Minimalis | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Kotak 4 Lubang (Rp 14.000/pcs). Mohon info stok dan pengiriman.` |
| R12 | `images/roster_12.png` | Roster Motif Bunga Bulat | Flora / Organik | Beton Putih / Abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Motif Bunga Bulat (Rp 14.000/pcs). Mohon info stok dan warna yang tersedia.` |
| R13 | `images/roster_13.png` | Roster Motif Daun Tetesan Air | Flora / Organik | Terracotta / Putih | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Daun Tetesan Air (Terracotta/Putih, Rp 14.000/pcs). Mohon info stok.` |
| R14 | `images/roster_14.png` | Roster Segitiga Prisma 3D | 3D / Prisma | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Segitiga Prisma 3D (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R15 | `images/roster_15.png` | Roster Bintang Kompleks | Geometris / Bintang | Beton Putih | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Bintang Kompleks (Beton Putih, Rp 14.000/pcs). Mohon info stok.` |
| R16 | `images/roster_16.jpg` | Roster Piramida Abu-abu | 3D / Prisma | Beton Abu-abu | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Piramida Abu-abu (Rp 14.000/pcs). Mohon info stok dan ongkir.` |
| R17 | `images/roster_17.jpg` | Roster Bulan Sabit | Minimalis / Geometris | Beton Putih | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Bulan Sabit (Beton Putih, Rp 14.000/pcs). Mohon info stok.` |
| R18 | `images/roster_18.jpg` | Roster Motif Labirin | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Motif Labirin (Beton Cream, Rp 14.000/pcs). Mohon info ketersediaan stok.` |
| R19 | `images/roster_19.jpg` | Roster Segitiga Lancip | Geometris | Terracotta Natural | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Segitiga Lancip (Terracotta, Rp 14.000/pcs). Mohon info stok.` |
| R20 | `images/roster_20.jpg` | Roster Kubik Bulat | 3D / Minimalis | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Kubik Bulat (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R21 | `images/roster_21.png` | Roster Piramida Persegi | 3D / Prisma | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Piramida Persegi (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R22 | `images/roster_22.png` | Roster Diagonal Asimetris | Asimetris / Garis | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Diagonal Asimetris (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R23 | `images/roster_23.png` | Roster Sekat Miring | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Sekat Miring (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R24 | `images/roster_24.png` | Roster Geometris Sudut | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Geometris Sudut (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R25 | `images/roster_25.png` | Roster Prisma Tengah | 3D / Prisma | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Prisma Tengah (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R26 | `images/roster_26.png` | Roster Kotak Berlapis | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Kotak Berlapis (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R27 | `images/roster_27.png` | Roster Kotak Polos | Minimalis | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Kotak Polos (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R28 | `images/roster_28.png` | Roster Sekat Tiga | Minimalis | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Sekat Tiga (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R29 | `images/roster_29.png` | Roster Z Terbalik | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Z Terbalik (Beton Cream, Rp 14.000/pcs). Mohon info stok.` |
| R30 | `images/roster_30.png` | Roster Bunga Empat Kelopak | Flora / Organik | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Bunga Empat Kelopak (Rp 14.000/pcs). Mohon info stok.` |
| R31 | `images/roster_31.png` | Roster Motif Labirin Klasik | Geometris | Beton Cream | 20x20x10 cm | Rp 14.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Motif Labirin Klasik (Rp 14.000/pcs). Mohon info stok.` |
| R32 | `images/roster_32.png` | Roster Bintang Putar | Geometris / Bintang | Beton Cream | 20x20x10 cm | Rp 15.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Bintang Putar (Rp 15.000/pcs). Mohon info stok dan ongkir.` |
| R33 | `images/roster_33.png` | Roster Balok Asimetris Komposisi | Asimetris / Geometris | Beton Cream | 20x20x10 cm | Rp 15.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Balok Asimetris (Rp 15.000/pcs). Mohon info stok dan pengiriman.` |
| R34 | `images/roster_34.png` | Roster Geometris Celah L | Geometris / Asimetris | Beton Cream | 20x20x10 cm | Rp 15.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Geometris Celah L (Rp 15.000/pcs). Mohon info ketersediaan stok.` |
| R35 | `images/roster_35.png` | Roster Silang Bintang Clover | Flora / Bintang | Beton Abu-abu | 20x20x10 cm | Rp 15.000 | `Halo Sinar Minimalis, saya tertarik memesan Roster Silang Bintang Clover (Rp 15.000/pcs). Mohon info stok dan ongkir.` |
| R36 | `images/product_concrete.png` | Roster Beton Geometris Konsentris (Flagship) | Geometris / Signature | Beton Abu-abu Presisi | 20x20x10 cm | Rp 15.000 | `Halo Sinar Minimalis, saya tertarik dengan Roster Beton Geometris Konsentris Flagship (Rp 15.000/pcs). Mohon info stok dan pricelist proyek.` |
| R37 | `images/product_terracotta.png` | Roster Terakota Mandala Flora (Flagship) | Flora / Signature | Terakota Bakar Super | 20x20x10 cm | Rp 16.000 | `Halo Sinar Minimalis, saya tertarik dengan Roster Terakota Mandala Flora Flagship (Rp 16.000/pcs). Mohon info ketersediaan stok dan packing kayu.` |

---

## 3. Functional Requirements Specification

### 3.1 Catalog Layout & Grid
1. **Dynamic Grid Display**: Render all 37 product items cleanly in CSS Grid (`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`) ensuring symmetrical column spacing across 360px, 768px, 1024px, and 1280px+ viewports.
2. **Product Card Components**:
   - Product Image with zoom cursor and responsive aspect ratio (`aspect-ratio: 1 / 1`).
   - Image overlay with "Preview / Detail" action and "Pesan Sekarang" button.
   - Badge for Category/Material (e.g. "Beton", "Terakota", "3D Prisma").
   - Product Title (`<h3>`).
   - Material & Dimension specification subtitle.
   - Price row: "Mulai dari Rp 14.000 / pcs" with an accessible tooltip/popover explaining Jabodetabek base vs luar kota.
   - Wholesale Action Button (`btn-wa-grosir`): Dedicated button linking directly to WhatsApp with pre-filled wholesale message.

### 3.2 Category & Material Filtering System
1. **Filter Controls**:
   - Filter Pills / Buttons above the catalog grid:
     - `Semua` (All - default active)
     - `Beton` (Concrete variants)
     - `Terakota` (Terracotta natural clay variants)
     - `Geometris` (Geometric, L-slit, Z, Labirin, Kampak)
     - `Flora / Organik` (Daun, Bunga, Mandala)
     - `3D / Prisma` (Prisma, Piramida, Kubik)
2. **Instant Visual Feedback**:
   - Filtering MUST update DOM visibility instantly (< 30ms) without page refresh.
   - Filter state must update the result counter: `"Menampilkan X dari 37 produk"`.
   - Active filter button must display prominent visual styling (high contrast background, bold font, focus ring).

### 3.3 Instant Search Engine
1. **Search Input Bar**: Prominent search input with search icon, placeholder `"Cari motif roster, material, atau ukuran..."`, and an instant "Clear Search" button (`×`).
2. **Search Criteria**: Matches against product title, category tag, material description, and dimensions (case-insensitive, normalized).
3. **Empty State Experience**: When no matches are found:
   - Display an elegant architectural graphic or icon.
   - Text: `"Motif atau produk tidak ditemukan"`.
   - Action: `"Reset Filter & Pencarian"` button restoring all 37 items.

### 3.4 Interactive Lightbox Modal System
1. **Modal Triggers**: Clicking any product card image triggers the lightbox modal.
2. **Modal Content**:
   - High-resolution image preview.
   - Product Title.
   - Material & dimension specifications.
   - Price display.
   - Direct Call-to-Action button: `"Pesan Produk Ini via WhatsApp"` triggering the specific pre-filled WhatsApp order URL for that product.
3. **Dismiss Mechanisms**:
   - Dedicated Close Button (`×`) with >= 44x44px touch target.
   - Backdrop click (clicking outside the modal container).
   - Keyboard `Escape` key.
4. **Scroll Lock**: The body scroll MUST be locked (`overflow: hidden`) when modal is open and restored upon close.

### 3.5 Dynamic WhatsApp Ordering Engine (+62 878 6979 6938)
All WhatsApp actions MUST resolve to target international number: **`+62 878 6979 6938`** (URL format: `https://wa.me/6287869796938?text=...`).

#### Workflow 1: Direct Product Order (Card "Pesan Sekarang" & Lightbox "Pesan via WhatsApp")
- Pre-filled message format:
  ```
  Halo Sinar Minimalis, saya tertarik memesan produk:
  - Produk: {Product Name}
  - Material: {Material}
  - Harga: {Price}

  Mohon informasi ketersediaan stok, minimal order, dan estimasi biaya kirim ke lokasi saya. Terima kasih.
  ```

#### Workflow 2: Wholesale Inquiry (Product Card "Chat Harga Grosir")
- Pre-filled message format:
  ```
  Halo Sinar Minimalis, saya ingin menanyakan harga grosir / pembelian partai besar untuk produk:
  - Produk Minat: {Product Name}

  Bisa tolong kirimkan rincian diskon quantity dan katalog lengkap? Terima kasih.
  ```

#### Workflow 3: Section Wholesale CTA ("Chat untuk Harga Grosir" Banner)
- Pre-filled message format:
  ```
  Halo Sinar Minimalis, saya kontraktor / pemilik toko material / owner proyek. Saya tertarik dengan penawaran harga grosir roster Sinar Minimalis. Mohon info pricelist dan syarat kerja sama. Terima kasih.
  ```

#### Workflow 4: Floating WhatsApp Button & Mobile Bottom Nav Chat
- Pre-filled message format:
  ```
  Halo Sinar Minimalis, saya ingin konsultasi pemilihan roster arsitektur untuk proyek bangunan saya. Mohon informasi katalog dan rekomendasinya. Terima kasih.
  ```

#### Workflow 5: Interactive Contact Form Submission (`sendToWhatsApp`)
- Inputs: Full Name (`waName`), Email (`waEmail`), Product Interest (`waProduct`), Message/Volume (`waMessage`).
- Pre-filled message format:
  ```
  Halo Sinar Minimalis, saya menghubungi melalui form website:

  *Nama:* {Name}
  *Email:* {Email}
  *Produk Minat:* {Product Selection}
  *Kebutuhan / Pesan:* {Message}

  Mohon segera dihubungi kembali. Terima kasih!
  ```

---

## 4. Search Engine Optimization (SEO) Specification

### 4.1 Semantic HTML5 & Heading Structure
1. Strict hierarchical tag usage:
   - `<header>`: Site banner, top navigation bar.
   - `<main id="main-content">`: Main document contents enclosing sections.
   - `<section>`: Hero, About Us, Catalog, Project Gallery, Order Steps, FAQ, Contact.
   - `<article>`: Each individual product card in the catalog grid.
   - `<footer>`: Company info, social links, visitor metrics, copyright.
2. Single Heading 1 (`<h1>`) Rule:
   - Primary `<h1>`: `"Pabrik Roster Beton & Terakota Premium Purwakarta | Sinar Minimalis"` (or `"Seni Ruang Elegan: Pabrik Roster Beton & Terakota Modern Purwakarta & Jabodetabek"`).
   - Section headings MUST be `<h2>`:
     - `"Tentang Sinar Minimalis"`
     - `"Katalog Produk Roster Eksklusif"`
     - `"Galeri Inspirasi Proyek Arsitektur"`
     - `"Alur dan Cara Pemesanan Roster"`
     - `"Pertanyaan Umum (FAQ)"`
     - `"Hubungi Kami & Lokasi Pabrik"`
   - Product Card titles MUST be `<h3>`.
   - Feature bullet points and step titles MUST be `<h4>` or `<h3>`.

### 4.2 Metadata & Social Graph (Open Graph & Twitter Cards)
The document `<head>` MUST contain:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sinar Minimalis | Pabrik Roster Beton & Terakota Purwakarta Jabodetabek</title>
<meta name="description" content="Sinar Minimalis - Pabrik & supplier roster beton, terakota, dan roster custom berkualitas di Purwakarta & Jabodetabek. Harga grosir mulai Rp 14.000/pcs. Pengiriman seluruh Indonesia.">
<meta name="keywords" content="roster beton purwakarta, roster terakota plered, jual roster jabodetabek, roster bandung, roster minimalis modern, harga roster beton, pabrik roster plered purwakarta, roster lubang angin, roster fasad arsitektur">
<meta name="author" content="Sinar Minimalis">
<meta name="robots" content="index, follow">
<link rel="canonical" href="https://sinarminimalis.com/">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="business.business">
<meta property="og:url" content="https://sinarminimalis.com/">
<meta property="og:title" content="Sinar Minimalis | Pabrik Roster Beton & Terakota Premium">
<meta property="og:description" content="Koleksi lengkap roster beton & terakota arsitektur modern. Desain eksklusif, kualitas presisi, siap kirim ke Jabodetabek, Bandung, dan seluruh Indonesia.">
<meta property="og:image" content="images/hero_daun.png">
<meta property="og:image:alt" content="Fasad Arsitektur Rumah Modern dengan Roster Sinar Minimalis">
<meta property="og:locale" content="id_ID">
<meta property="og:site_name" content="Sinar Minimalis">

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Sinar Minimalis | Pabrik Roster Beton & Terakota Premium">
<meta name="twitter:description" content="Pabrik roster beton dan terakota minimalis Purwakarta & Jabodetabek. Pilihan motif terlengkap untuk fasad dan interior.">
<meta name="twitter:image" content="images/hero_daun.png">
```

### 4.3 Structured Data (JSON-LD Schemas)
Embed three distinct JSON-LD schemas in `<head>`:

#### 1. Schema: `LocalBusiness` / `HomeAndConstructionBusiness`
```json
{
  "@context": "https://schema.org",
  "@type": "HomeAndConstructionBusiness",
  "name": "Sinar Minimalis",
  "image": "https://sinarminimalis.com/images/logo_sinar.png",
  "url": "https://sinarminimalis.com/",
  "telephone": "+6287869796938",
  "priceRange": "Rp 14.000 - Rp 25.000",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Citeko No. 5, Blok B, Kecamatan Plered",
    "addressLocality": "Purwakarta",
    "addressRegion": "Jawa Barat",
    "postalCode": "41162",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.7000,
    "longitude": 107.4500
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "17:00"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/sinar.minimalis",
    "https://www.facebook.com/people/SinarMinimalis/61589331003047/"
  ],
  "areaServed": [
    "Purwakarta",
    "Jakarta",
    "Bogor",
    "Depok",
    "Tangerang",
    "Bekasi",
    "Bandung",
    "Karawang",
    "Subang",
    "Indonesia"
  ]
}
```

#### 2. Schema: `ItemList` of `Product`
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Katalog Roster Sinar Minimalis",
  "itemListElement": [
    {
      "@type": "Product",
      "position": 1,
      "name": "Roster Hemavara",
      "image": "https://sinarminimalis.com/images/roster_1.jpg",
      "description": "Roster arsitektur minimalis motif Hemavara material terakota dan beton abu-abu.",
      "brand": { "@type": "Brand", "name": "Sinar Minimalis" },
      "offers": {
        "@type": "Offer",
        "price": "14000",
        "priceCurrency": "IDR",
        "availability": "https://schema.org/InStock"
      }
    }
  ]
}
```

#### 3. Schema: `FAQPage`
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Apakah ada minimal order pemesanan roster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ya, terdapat minimal order. Silakan hubungi tim kami via WhatsApp untuk detail kuantitas minimal pesanan berdasarkan lokasi pengiriman Anda."
      }
    },
    {
      "@type": "Question",
      "name": "Apakah aman dikirim ke luar kota atau luar pulau?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sangat aman. Kami menggunakan standar packing kayu yang kuat dan penanganan khusus untuk memastikan pesanan Anda tiba dengan selamat di tujuan ke seluruh kota dan pulau di Indonesia."
      }
    },
    {
      "@type": "Question",
      "name": "Berapa lama estimasi waktu produksi roster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lama estimasi proses dari pesanan masuk hingga siap kirim adalah sekitar 3-7 hari, tergantung pada jumlah pesanan dan antrean produksi."
      }
    },
    {
      "@type": "Question",
      "name": "Bolehkah saya request custom desain roster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tentu, sangat bisa! Kami melayani pembuatan desain roster custom secara eksklusif sesuai dengan gambar teknis atau konsep arsitek Anda."
      }
    }
  ]
}
```

### 4.4 Descriptive Alt Text Standards
Every single `<img>` tag must follow this formula:
`alt="[Nama Produk / Judul Gambar] - [Motif & Material] [Konteks Aplikasi / Wilayah]"`

*Examples:*
- `roster_1.jpg`: `alt="Roster Hemavara material terracotta dan beton abu-abu untuk dinding fasad modern Sinar Minimalis Purwakarta"`
- `roster_3.jpg`: `alt="Roster Motif Daun beton lubang angin alami arsitektur tropis Sinar Minimalis"`
- `roster_33.png`: `alt="Roster Balok Asimetris beton cream desain geometris modern Sinar Minimalis"`
- `product_concrete.png`: `alt="Roster Beton Modern Geometris Konsentris abu-abu presisi tinggi Sinar Minimalis Jabodetabek"`
- `product_terracotta.png`: `alt="Roster Terakota Mandala Flora tanah liat bakar premium Plered Purwakarta Sinar Minimalis"`
- `project_1.png`: `alt="Inspirasi Fasad Eksterior Tropis Rumah Tinggal menggunakan Roster Beton Sinar Minimalis"`
- `logo_sinar.png`: `alt="Logo Sinar Minimalis - Produsen Roster Beton dan Terakota Premium Purwakarta"`

---

## 5. Performance & Accessibility Specification (WCAG AA & Core Web Vitals)

### 5.1 Zero Cumulative Layout Shift (CLS) Specification
To guarantee CLS = 0.00:
1. Every `<img>` tag MUST specify explicit `width` and `height` attributes matching intrinsic aspect ratio, or utilize CSS `aspect-ratio: 1 / 1` in stylesheet.
2. The Google Maps `<iframe>` MUST specify explicit dimensions: `width="100%" height="300"` with CSS `aspect-ratio: 16 / 9` or fixed container height.
3. The font stack MUST include fallback sizing adjustments to prevent FOUT (Flash of Unstyled Text) shifts between system serif/sans-serif and Google Fonts (`Outfit`, `Playfair Display`).

### 5.2 Responsive Image Loading Strategy
1. **Critical Path (Above-the-Fold)**:
   - Hero banner `images/hero_daun.png` MUST be loaded with `loading="eager"` and `fetchpriority="high"`.
   - Logo `images/logo_sinar.png` MUST be loaded with `loading="eager"`.
2. **Below-the-Fold (Catalog & Gallery)**:
   - All 37 catalog images MUST use native `loading="lazy"` and `decoding="async"`.
   - All 5 project gallery images MUST use native `loading="lazy"`.
   - Google Maps iframe MUST use `loading="lazy"`.
3. **Page Loader Optimization**:
   - The artificial 1200ms `setTimeout` in `main.js` degrades FCP/LCP. The loader must fade out as soon as DOM is interactive or within <= 300ms, with a `requestAnimationFrame` transition.

### 5.3 WCAG 2.1 AA Accessibility Matrix
1. **Color Contrast Standards**:
   - Contrast ratio must be >= 4.5:1 for normal text and >= 3.0:1 for large text / UI components.
   - *Issue Identified*: The current `--primary` color `#A46C4D` against `#F7F5F0` light background achieves only ~3.8:1 contrast (Fails WCAG AA).
   - *Fix Specification*: Darken subtitle/small text `--primary` to `#825237` or `#7A4B2F` when displayed on `#F7F5F0` or `#FFFFFF`, which achieves >= 5.2:1 contrast (Passes WCAG AA).
2. **Touch Targets (Minimum 44x44 CSS Pixels)**:
   - All interactive elements must satisfy minimum 44x44px bounding box:
     - Navigation links and hamburger button (`.menu-toggle`).
     - Filter pill buttons (`min-height: 44px; padding: 10px 18px`).
     - Lightbox close button (`.lightbox-close`: 44x44px).
     - Floating WhatsApp trigger (`.floating-wa`: 60x60px).
     - Price info tooltip trigger (`.price-info-trigger`: wrap in button with `padding: 10px; min-width: 44px; min-height: 44px`).
     - Mobile bottom navigation items (`.bottom-nav a`: `min-height: 48px`).
3. **Screen Reader & ARIA Attributes**:
   - Menu toggle: `aria-label="Buka menu navigasi"`, `aria-expanded="false"`, `aria-controls="nav-links"`.
   - Floating WhatsApp button: `aria-label="Hubungi Customer Service via WhatsApp"`.
   - Search input: `aria-label="Cari koleksi roster"`.
   - Result counter: `aria-live="polite"`.
   - Lightbox modal: `role="dialog"`, `aria-modal="true"`, `aria-label="Detail Produk Roster"`.
   - Lightbox close: `aria-label="Tutup jendela preview"`.
   - FAQ Accordion: Questions must be `<button class="faq-question" aria-expanded="false">` with `aria-controls="faq-ans-1"`.
   - Google Maps iframe: `title="Peta Lokasi Pabrik Sinar Minimalis Plered Purwakarta"`.

---

## 6. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Catalog | 37-Item Product Roster | Full inventory of 35 numbered rosters + 2 flagship items | Catalog image files in `images/` | Cards with name, material, price, WA CTA | Fallback image / missing asset handled | Filesystem & `index.html` audit |
| 2 | Catalog | Material & Motif Badges | Visual tag on each card indicating material and design motif | Data attributes / metadata | High-contrast category pill badge | Defaults to "Beton" if unspecified | Code & image analysis |
| 3 | Interactivity | Multi-Category Filter Bar | Filter pills to filter by All, Beton, Terakota, Geometris, Flora, 3D | User click on category button | Filtered card grid, active pill highlight, result count | Empty state shown if 0 matches | ORIGINAL_REQUEST R2 & analysis |
| 4 | Interactivity | Live Catalog Search | Debounced real-time text search filtering by name, motif, size | Search input keystrokes | Filtered products displayed instantly | Displays "Motif tidak ditemukan" with Reset button | ORIGINAL_REQUEST R2 & analysis |
| 5 | Interactivity | Result Counter | Displays count of visible items matching active search/filter | Visible DOM elements count | "Menampilkan X dari 37 produk" | Shows "Menampilkan 0 produk" when no match | Requirements analysis |
| 6 | Interactivity | High-Res Lightbox Modal | Modal preview displaying full image, title, specs, and order CTA | Image click event | Fullscreen overlay with specs & WA order CTA | Escape / click backdrop closes cleanly | ORIGINAL_REQUEST R2 & `js/main.js` |
| 7 | Integration | Dynamic WhatsApp Product Order | Context-specific WhatsApp link with prefilled product details | Product title, material, price | Opens `https://wa.me/6287869796938?text=...` | Falls back to generic message if missing | ORIGINAL_REQUEST R2 & R5 |
| 8 | Integration | Wholesale WhatsApp Order | Wholesale pricing inquiry for bulk and contractor orders | Click on "Chat Harga Grosir" button | Opens WhatsApp wholesale inquiry URL | Opens generic wholesale text | Existing `index.html` & R2 |
| 9 | Integration | Contact Form WA Forwarder | Converts contact form fields into structured WhatsApp message | Name, Email, Product Interest, Message | Redirects to WhatsApp with formatted text | Prevents submission if required fields empty | Existing `js/main.js` & form |
| 10 | SEO | Open Graph Protocol | Social sharing previews for WhatsApp, Facebook, LinkedIn | OG meta tags in `<head>` | Rich social card preview with thumbnail & title | Missing tags show bare URL | ORIGINAL_REQUEST R5 |
| 11 | SEO | Twitter Card Metadata | Large image card preview on Twitter / X | Twitter meta tags | Large card preview | Defaults to basic summary | Technical SEO audit |
| 12 | SEO | LocalBusiness JSON-LD Schema | Rich business snippet for Purwakarta/Jabodetabek | JSON-LD schema block | Google Knowledge Panel / Local Search enrichment | Ignored by crawlers if invalid JSON | Technical SEO audit |
| 13 | SEO | Product ItemList JSON-LD | Product catalog rich snippets for search engines | JSON-LD Product list | Search engine product indexing | Invalid schema logs warnings in search console | Technical SEO audit |
| 14 | SEO | FAQPage JSON-LD Schema | FAQ rich accordion snippets in search engine results | JSON-LD FAQ data | Expandable Q&A in Google SERP | Falls back to normal listing | Technical SEO audit |
| 15 | Performance | CLS Prevention Attributes | Explicit width, height, and CSS aspect-ratio on all media | Image/iframe dimensions | Zero layout shift during image load | Browser reflow occurs if omitted | Technical performance audit |
| 16 | Performance | Lazy Loading & Fetchpriority | Native lazy loading for catalog; eager/high priority for hero | HTML `loading` & `fetchpriority` | Instant hero display, saved bandwidth on scroll | Slower LCP if hero is lazy loaded | Technical performance audit |
| 17 | Accessibility | WCAG AA Contrast Tuning | Darkened `--primary` tone for text against light backgrounds | CSS color variables | Minimum 4.5:1 contrast for small text | Fails WCAG if #A46C4D used on #F7F5F0 | WCAG AA contrast testing |
| 18 | Accessibility | Touch Target Compliance | Enforced 44x44px minimum bounding box on all clickables | CSS min-width / min-height / padding | Finger-friendly controls on touchscreens | Missed taps and poor mobile usability | WCAG 2.1 AA audit |
| 19 | Responsive | Responsive Bottom Mobile Nav | Floating bottom dock with shortcuts on viewports < 768px | Mobile screen resize (< 768px) | Bottom dock with Beranda, Katalog, Chat, Kontak | Hidden on desktop >= 768px | Existing `style.css` & R4 |
| 20 | Navigation | Mobile Hamburger Menu | Slide-out or dropdown menu with animated toggle icon | Click on `.menu-toggle` | Active menu list, body scroll lock, dark backdrop | Closes on link click or outside tap | Existing `main.js` & R4 |

---

## 7. Edge Cases

| # | Feature | Input / Trigger | Observed & Required Behavior |
|---|---------|-----------------|------------------------------|
| 1 | Live Search | User types special characters (e.g. `<script>`, `*?&^%$#@!`) | Input sanitized, treated as literal string; regex injection avoided; shows 0 results gracefully. |
| 2 | Live Search | User types trailing/leading whitespaces (e.g. `"   daun   "`) | Query trimmed before evaluation; matches "Roster Motif Daun" accurately. |
| 3 | Live Search | User types non-matching gibberish (e.g. `"xyz12345nonexistent"`) | Grid clears cleanly; "Motif tidak ditemukan" empty state appears with "Reset" button. |
| 4 | Live Search | User clicks "Reset" in empty state | Search input cleared, all filters reset, all 37 products restored immediately. |
| 5 | Filter Tabs | Rapid sequential clicking between "Beton" -> "Terakota" -> "Semua" | Transitions smoothly without flickering, race conditions, or orphaned DOM cards. |
| 6 | Filter + Search | Active filter "Terakota" + Search input "Kampak" (Beton-only) | Correctly evaluates intersection (0 matches); shows empty state; does not false-positive. |
| 7 | Lightbox Modal | User presses `Escape` key while lightbox is active | Modal closes immediately; body scroll lock removed; focus returned to trigger card. |
| 8 | Lightbox Modal | User clicks dark blurred backdrop outside image | Modal closes immediately without triggering image zoom or link actions. |
| 9 | Lightbox Modal | Product with long title or spec opened in lightbox on mobile (360px) | Modal content wraps gracefully; text does not overflow screen boundaries or clip close button. |
| 10 | WhatsApp CTA | Product title containing special characters or punctuation | Title properly encoded with `encodeURIComponent`; produces valid URL without breaking syntax. |
| 11 | Contact Form | Submitting form with empty Name, Email, or Message | HTML5 form validation triggers; native tooltip highlights missing field; WA window does not open. |
| 12 | Contact Form | User inputs multiline message with line breaks | Line breaks preserved and properly encoded (`%0A` or `\n`) in final WhatsApp message string. |
| 13 | Viewport Resize | Screen resized dynamically between 360px and 1440px | Bottom nav toggles display correctly; navbar adapts; no horizontal scrollbar at any breakpoint (`scrollWidth <= innerWidth`). |
| 14 | Slow Network | Images loading on slow 3G | Explicit aspect ratios prevent layout shift (CLS = 0); skeleton or neutral background holds card shape. |
| 15 | Price Info Tooltip | User taps outside active price info tooltip popup | All open popups dismiss cleanly; multiple popups never overlap simultaneously. |

---

## 8. Testable Acceptance Criteria & Verification Metrics for E2E Suite

The E2E test suite MUST independently verify each of the following criteria across 4 distinct test tiers:

### Tier 1: Smoke & Static Asset Integrity Tests
- [ ] **AC-1.1**: The root document loads with HTTP status 200 and valid HTML doctype (`<!DOCTYPE html>`).
- [ ] **AC-1.2**: Exactly 37 product items exist in the catalog DOM (35 numbered + 2 flagship products).
- [ ] **AC-1.3**: Zero image assets return HTTP 404 or failed network requests (all `images/roster_*.jpg/png`, `product_*.png`, `project_*.png`, `hero_*.png`, `logo_*.png` load successfully).
- [ ] **AC-1.4**: Zero font files or CSS/JS stylesheets return HTTP 404.
- [ ] **AC-1.5**: Browser developer console contains zero unhandled runtime JavaScript exceptions or errors during page load and interaction.

### Tier 2: Functional & Navigation Tests
- [ ] **AC-2.1 (Catalog Rendering)**: Every product card displays a visible image, title (`<h3>`), material specification, price string (`Mulai dari Rp 14.000`), and a WhatsApp order CTA.
- [ ] **AC-2.2 (Category Filtering)**:
  - Clicking "Terakota" displays only products with terracotta material (e.g., R01, R13, R19, R37); hides all other cards.
  - Clicking "Beton" displays only concrete products.
  - Clicking "Semua" restores visibility of all 37 products.
- [ ] **AC-2.3 (Live Search)**:
  - Typing `"Bintang"` in search input limits visible items to products containing "Bintang" (R06, R15, R32, R35).
  - Search response time is under 50ms without UI lag.
  - Typing non-existent string displays the empty state with the reset button.
  - Clicking reset restores all 37 products and clears the search box.
- [ ] **AC-2.4 (Lightbox Modal)**:
  - Clicking any product image activates `.lightbox-overlay.active` with visible image and product title.
  - Clicking `.lightbox-close` removes `.active` and restores body scrolling.
  - Pressing `Escape` key closes the active lightbox modal.
  - Clicking the backdrop outside the modal closes the modal.
  - The lightbox includes a direct WhatsApp order button matching that specific product.
- [ ] **AC-2.5 (Dynamic WhatsApp Links)**:
  - Product card "Pesan Sekarang" link starts with `https://wa.me/6287869796938?text=` and contains URI-encoded product name and price.
  - "Chat Harga Grosir" link contains wholesale inquiry text.
  - Floating WhatsApp button links to `https://wa.me/6287869796938` with consultation text.
- [ ] **AC-2.6 (Contact Form Integration)**:
  - Submitting valid form data redirects/opens `https://wa.me/6287869796938` with URL containing the user's name, email, selected product, and message.
- [ ] **AC-2.7 (FAQ Accordion)**:
  - Clicking an FAQ question expands the corresponding answer; clicking another question collapses previous answers.

### Tier 3: Responsiveness & Mobile-First Tests
- [ ] **AC-3.1 (Horizontal Overflow)**: On viewports 360px, 375px, 414px, 768px, 1024px, 1280px, and 1920px:
  `document.documentElement.scrollWidth === window.innerWidth` (zero horizontal overflow).
- [ ] **AC-3.2 (Mobile Navigation)**:
  - On viewports < 768px, `.menu-toggle` is visible and `.bottom-nav` is visible.
  - Clicking `.menu-toggle` reveals navigation links with active state.
  - Clicking any nav link closes the menu and smoothly scrolls to the target anchor.
- [ ] **AC-3.3 (Touch Targets)**:
  - All interactive buttons, nav items, filter pills, and form controls have bounding box dimensions of at least 44x44px.

### Tier 4: SEO, Performance & WCAG AA Accessibility Metrics
- [ ] **AC-4.1 (Heading Structure)**: Exactly one `<h1>` element exists in the document; all major section headers are `<h2>`.
- [ ] **AC-4.2 (Open Graph Tags)**: `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, and `og:site_name` are present and populated.
- [ ] **AC-4.3 (Twitter Cards)**: `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` are present.
- [ ] **AC-4.4 (JSON-LD Structured Data)**:
  - `<script type="application/ld+json">` parses as valid JSON without syntax errors.
  - Schema contains `@type: "HomeAndConstructionBusiness"` with address in Purwakarta 41162 and telephone `+6287869796938`.
  - Schema contains `@type: "ItemList"` and `@type: "FAQPage"`.
- [ ] **AC-4.5 (Alt Text Completeness)**: 100% of `<img>` elements possess non-empty, descriptive `alt` attributes.
- [ ] **AC-4.6 (Zero CLS)**: All product images, hero images, and the map iframe have explicit width/height or CSS aspect-ratio definitions.
- [ ] **AC-4.7 (Contrast Compliance)**: Subtitle text, buttons, and headings maintain a minimum 4.5:1 contrast ratio against their respective background colors.
- [ ] **AC-4.8 (ARIA Accessibility)**: Menu toggle, lightbox modal, floating WA button, and accordion have proper ARIA attributes (`aria-label`, `aria-expanded`, `aria-controls`, `role="dialog"`).

---

## 9. 5-Component Handoff Report

### 1. Observation
1. **Authoritative Specification Source**: `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\ORIGINAL_REQUEST.md` lines 1-45 explicitly mandates:
   - "Lengkapi seluruh item katalog produk (termasuk aset gambar roster yang tersedia di direktori `images/`)" (line 16).
   - "Sediakan sistem penjelajahan katalog yang intuitif (seperti filter berdasarkan kategori/material/motif atau pencarian), preview gambar detail/lightbox resolusi tinggi, serta integrasi pemesanan WhatsApp yang seamless dan dinamis untuk tiap produk" (lines 16-17).
   - "Form kontak dan tombol WhatsApp terhubung langsung ke nomor tujuan yang ditentukan (+62 878 6979 6938) dengan pesan teks pre-filled yang sesuai konteks aksi pengguna" (line 38).
   - "SEO lokal Purwakarta / Jabodetabek" (line 25).
2. **Asset Directory Inspection**: Running directory inspection on `images/` verified 51 total files:
   - 35 numbered roster images: `roster_1.jpg` through `roster_35.png`.
   - 2 flagship studio images: `product_concrete.png` (609,093 bytes) and `product_terracotta.png` (737,112 bytes).
   - 5 project images: `project_1.png` through `project_5.png` plus `project_interior.png`.
   - 2 hero banners: `hero_bg.png` and `hero_daun.png`.
   - 1 logo: `logo_sinar.png`.
3. **Current Markup Discrepancies in `index.html`**:
   - `index.html` currently lists only 32 products (stopping at `roster_32.png` line 814).
   - `roster_33.png`, `roster_34.png`, `roster_35.png`, `product_concrete.png`, and `product_terracotta.png` are completely absent from `index.html`.
   - Product cards have hardcoded WhatsApp link `https://wa.me/6287869796938` without any pre-filled product parameters.
   - Zero category filter pills exist in `index.html`.
   - Zero search input exists in `index.html`.
   - Missing Open Graph tags, Twitter Card tags, and JSON-LD schema scripts.
   - Heading structure has generic `<h1>Seni Ruang Elegan</h1>` without brand or local keywords.
   - Page loader runs an artificial 1200ms delay via `setTimeout(hideLoader, 1200)`.
   - Color contrast `--primary: #A46C4D` against `--light: #F7F5F0` is ~3.8:1, failing WCAG AA.

### 2. Logic Chain
1. *From Observation 1 & 2*: The project specification mandates that all roster assets in `images/` be presented in the catalog. Since 35 numbered assets and 2 flagship assets exist, the catalog specification must define exactly 37 distinct product variants.
2. *From Observation 1 & 3*: The requirement specifies context-specific pre-filled WhatsApp ordering for every product. Therefore, each product card and lightbox view must dynamically inject its specific product name, material, and price into the WhatsApp URI (`https://wa.me/6287869796938?text=...`).
3. *From Observation 1 & 3*: The requirement mandates intuitive catalog browsing. Therefore, category filtering pills (Semua, Beton, Terakota, Geometris, Flora, 3D) and instant live search must be specified with sub-50ms DOM filtering and zero layout shift.
4. *From Observation 1 & 3*: The requirement mandates Purwakarta and Jabodetabek local SEO and accessibility. Therefore, semantic HTML5 structure, Open Graph tags, dual JSON-LD schemas (`HomeAndConstructionBusiness`, `Product`/`ItemList`, `FAQPage`), contrast calibration for `--primary`, and >= 44x44px touch targets are strictly required.
5. *From Observation 3*: The presence of artificial loading delays and missing image aspect ratios would degrade Core Web Vitals (FCP, LCP, CLS). Therefore, specifications require explicit image aspect ratios, native lazy loading, and an optimized loader fade-out.

### 3. Caveats
- **Pricing Assumptions**: Base pricing for R01 through R31 is listed as `Rp 14.000 / pcs` in `index.html`; R32 is `Rp 15.000 / pcs`. R33-R35 are specified at `Rp 15.000 / pcs`, `product_concrete.png` at `Rp 15.000 / pcs`, and `product_terracotta.png` (ornate floral terracotta) at `Rp 16.000 / pcs`. All prices include the standard Jabodetabek disclaimer.
- **Scope Boundary**: As a read-only Spec Miner, no modifications have been made to project source files (`index.html`, `css/style.css`, `js/main.js`). All definitions herein are deliverable to the orchestrator and implementers.

### 4. Conclusion
The specification for Sinar Minimalis modernization has been fully extracted, enumerated, and verified against the authoritative user request and the physical codebase. The target implementation must incorporate:
1. 37 total catalog items (incorporating all newly discovered images: 33, 34, 35, and the 2 flagship models).
2. Live instant search and category filtering with result count and empty state.
3. Interactive lightbox modal with specs and direct product WhatsApp CTA.
4. 5 context-specific WhatsApp messaging workflows targetting `+62 878 6979 6938`.
5. Complete Local Purwakarta/Jabodetabek SEO package (OG tags, JSON-LD schemas, descriptive alt text).
6. WCAG AA compliance (contrast darkening of `--primary` on light backgrounds, 44x44px touch targets, ARIA labels).
7. Zero CLS and instant page performance.

### 5. Verification Method
To independently verify this specification document:
1. Check the filesystem for all referenced image assets:
   ```powershell
   Get-ChildItem images | Where-Object { $_.Name -like 'roster_*' -or $_.Name -like 'product_*' }
   ```
2. Verify image dimensions and validity using System.Drawing or PowerShell file properties.
3. Verify that `index.html` currently lacks items 33, 34, 35, `product_concrete.png`, `product_terracotta.png`, filter buttons, and search input:
   ```powershell
   Get-Content index.html | Select-String "roster_33", "product_concrete", "filter", "search"
   ```
4. Verify color contrast of `--primary` (#A46C4D) on `#F7F5F0` via standard WebAIM or WCAG contrast formula.
5. Invalidation conditions: If the user explicitly changes the catalog roster list, changes the target WhatsApp phone number, or specifies a different color palette.
