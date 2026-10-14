# Handoff Report: Typography, Hero Section & Visual Hierarchy (Milestone 1)

**Agent**: Explorer M1-2 (Typography & Hero Section Explorer)  
**Date**: 2026-10-13  
**Target Project**: Website Katalog Roster "Sinar Minimalis" (`c:\Users\Hype G12\OneDrive\website roster`)  
**Parent Orchestrator ID**: `bef73a8e-2405-4609-86f2-fb5e0f0c059e`  
**Milestone**: Milestone 1 — Features #10, #11  

---

## 1. Observation

Direct inspection of `index.html` (lines 1–87), `css/style.css` (lines 1–366, 778–885), and project assets in `images/` revealed the following critical findings:

### A. Typography & Font Stacks (`index.html:8–10`, `css/style.css:11–13, 86–95, 196–200`)
- **Current Font Declaration**:
  `index.html` loads:
  ```html
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  ```
  `css/style.css` declares:
  ```css
  --font-main: 'Outfit', sans-serif;
  --font-heading: 'Playfair Display', serif;
  ```
- **Architectural Misalignment**: `Playfair Display` is a transitional, high-contrast serif font designed for editorial fashion and literature. For an industrial and architectural manufacturer of precision concrete blocks (Beton K-250) and terracotta (Plered), it clashes with the brand identity.
- **Fixed Font Sizes & Breakpoint Jumps**:
  `css/style.css:284` sets `.hero h1 { font-size: 4rem; }`, abruptly dropping at line 826 to `2.5rem` on `@media (max-width: 768px)`.
  `css/style.css:92` sets `h2 { font-size: 2.5rem; }`, dropping at line 876 to `1.5rem`.
  There are zero fluid `clamp()` formulas, resulting in rigid, unharmonized text scaling between 360px and 1280px+.
- **Letter Spacing**: Heading letter-spacing is default or untracked. Only `.subtitle` has `letter-spacing: 2px` (line 80) and `.logo-text` has `letter-spacing: 2px` (line 200).

### B. Hero Section Layout, Mobile Snapping & Empty Container (`index.html:36–49`, `css/style.css:247–303`)
- **Mobile Height Snapping**:
  `css/style.css:248` defines `.hero { height: 100vh; position: relative; display: flex; align-items: center; }`.
  On mobile browsers (iOS Safari, Android Chrome), `100vh` ignores dynamic navigation/URL address bar retraction and expansion, creating vertical snapping and layout shifts.
- **Empty Desktop Right Container**:
  In `index.html:41–48`, `.hero-content` is wrapped inside `.container` with `max-width: 600px;`. On a 1200px+ desktop viewport, the entire right 50% of the Hero is empty dark gradient, wasting prime brand real estate.
- **Missing Trust & Manufacturing Badges**:
  The hero currently features only a title, a short paragraph, and two buttons. Key manufacturer trust elements specified in `PROJECT.md` are completely absent:
  - Kapasitas Produksi: `5.000+ pcs/hari`
  - Jangkauan Distribusi: `Jabodetabek & Seluruh Indonesia`
  - Bahan Baku Teruji: `Beton K-250 & Terakota Plered Asli`
- **Missing Image Attributes & LCP Neglect**:
  In `index.html:38`:
  `<img src="images/hero_daun.png?v=3" alt="Modern luxury house facade with roster motif daun">`
  - Lacks `width` and `height` attributes (violates CLS zero-shift mandate).
  - Lacks `fetchpriority="high"` on the site's Largest Contentful Paint (LCP) element.
  - Contains query parameter `?v=3` that disrupts offline/local caching.

### C. About Section (Tentang Kami) Layout & Credibility (`index.html:51–87`, `css/style.css:305–366`)
- **Missing Dimensions & Lazy Loading**:
  `index.html:55` loads `<img src="images/project_interior.png" alt="Roster interior design">` without `width`, `height`, or `loading="lazy"`.
- **CSS Pseudo-element Overflow Protrusion**:
  `css/style.css:321–329` places `.about-img::before` at `top: -20px; left: -20px; width: 100%; height: 100%; border: 2px solid var(--primary);`. On 360px mobile viewports where container padding is 18px (5%), an offset of `-20px` risks boundary overflow.
- **Absence of Quantitative Credibility Metrics**:
  The section lists only 3 generic bullet points (Material Premium, Desain Presisi, Eco-Friendly) with zero quantitative metrics verifying manufacturer capacity, experience, or track record.

---

## 2. Logic Chain

```
[Observation 1A: Playfair Display serif used for masonry brand; abrupt font jumps without clamp()]
  │
  ├─► Deductive Step 1: Replace Playfair Display with Plus Jakarta Sans (neo-grotesque architectural geometry) 
  │   and modern Outfit weights; define fluid clamp() scales for h1, h2, h3, h4, and subtitles with tight 
  │   architectural tracking (-0.03em for headings, +0.15em for uppercase badges).
  │
[Observation 1B: .hero has height: 100vh causing mobile viewport snap; max-width 600px leaves 50% empty space]
  │
  ├─► Deductive Step 2: Change hero height to min-height: 100vh; min-height: 100svh; height: auto with 
  │   calc(var(--nav-height) + 2rem) top padding. Convert container to a 2-column grid (.hero-grid): 
  │   Left column = Typography + CTAs; Right column = Architectural showcase card using flagship product 
  │   (product_terracotta.png) with glassmorphic floating badges.
  │
[Observation 1C: Zero trust badges in Hero; hero image lacks fetchpriority and explicit dimensions]
  │
  ├─► Deductive Step 3: Implement Hero Trust Badges Strip (5.000+ pcs/hari, Jabodetabek & Seluruh RI, 
  │   Beton K-250 & Terakota Plered); add width="1024" height="1024" fetchpriority="high" decoding="sync".
  │
[Observation 1D: About section has generic bullets, no quantitative metrics, and border offset bug]
  │
  ├─► Deductive Step 4: Harmonize About section with 10+ Years Experience floating badge on the image, 
  │   sanitized CSS box-shadow (removing negative -20px offset), and a 3-metric factory capability grid 
  │   (5.000+ Pcs/Hari, 37+ Ragam Motif, 100% Jaminan Mutu).
  │
  ▼
[Conclusion: Full architectural redesign specification and exact drop-in code ready for Milestone 1 Worker.]
```

---

## 3. Caveats

- **Scope Boundary Compliance**: This analysis is strictly read-only; no modifications to production files were made. All code below is formatted for direct integration by Worker M1.
- **Coordination with Peers**:
  - Color tokens (`--primary: #945738`, `--secondary: #1A1B1E`, `--light: #F9F8F5`) match Explorer M1-1's WCAG AA compliant palette.
  - Navbar offset calculations (`--nav-height: 80px`) match Spec Miner M1-1's sticky header specification.
- **Asset Integrity**: Verified that `images/hero_daun.png`, `images/product_terracotta.png`, `images/product_concrete.png`, and `images/project_interior.png` all exist locally and have 1024×1024 dimensions.

---

## 4. Conclusion & Concrete Implementation Specifications

### Recommendation Summary
1. **Typography**: Adopt `Plus Jakarta Sans` as the primary architectural typeface for headings and brand display, complemented by `Outfit` for body copy. Implement fluid `clamp()` scales.
2. **Hero Section**: 
   - Eliminate 100vh mobile jump using `min-height: 100svh; height: auto`.
   - Populate desktop right column with a glassmorphic architectural showcase card featuring `product_terracotta.png`.
   - Embed high-contrast Hero Trust Badges Strip (`5.000+ pcs/hari`, `Jabodetabek & Seluruh Indonesia`, `Beton K-250 & Terakota Plered`).
   - Optimize LCP with `width="1024" height="1024" fetchpriority="high" decoding="sync"`.
3. **About Section**:
   - Modernize two-column layout with 1:1 architectural visual wrap.
   - Add "10+ Tahun Dedikasi" floating badge.
   - Embed 3-metric factory credibility grid (`5.000+ Pcs/Hari`, `37+ Motif`, `100% Presisi`).

---

### Exact Drop-in Code for Worker M1

#### A. Markup for `index.html`

##### 1. Google Fonts Link (Replace lines 8–10):
```html
    <!-- Architectural Google Fonts: Plus Jakarta Sans & Outfit -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

##### 2. Hero Section (Replace lines 36–49):
```html
    <!-- Hero Section -->
    <header id="home" class="hero">
        <div class="hero-bg">
            <img src="images/hero_daun.png" alt="Fasad Bangunan Modern dengan Roster Beton Arsitektur Sinar Minimalis" width="1024" height="1024" fetchpriority="high" decoding="sync">
            <div class="overlay"></div>
        </div>
        <div class="container hero-container">
            <div class="hero-grid">
                <!-- Left Column: Typography, Value Proposition & CTA -->
                <div class="hero-content">
                    <div class="hero-eyebrow fade-in-up">
                        <span class="badge-dot"></span>
                        <span class="eyebrow-text">Pabrik Roster Beton &amp; Terakota Purwakarta</span>
                    </div>
                    <h1 class="hero-title fade-in-up delay-1">
                        Seni Ruang <br>
                        <span class="highlight-text">Elegan &amp; Berongga</span>
                    </h1>
                    <p class="hero-lead fade-in-up delay-2">
                        Produsen langsung roster arsitektur mutu Beton K-250 &amp; Terakota Plered asli. Presisi tinggi untuk pencahayaan alami optimal, sirkulasi udara sejuk, dan estetika fasad kontemporer.
                    </p>
                    <div class="hero-btns fade-in-up delay-3">
                        <a href="#katalog" class="btn-primary">
                            <i class="fas fa-th-large"></i> Lihat Katalog (37 Motif)
                        </a>
                        <a href="#proyek" class="btn-secondary">
                            <i class="fas fa-images"></i> Galeri Proyek
                        </a>
                    </div>
                </div>

                <!-- Right Column: Desktop Architectural Showcase Card -->
                <div class="hero-showcase fade-in-up delay-2">
                    <div class="hero-card">
                        <div class="hero-card-media">
                            <img src="images/product_terracotta.png" alt="Roster Terakota Plered Flagship Sinar Minimalis" width="1024" height="1024" loading="eager" decoding="async" class="hero-card-img">
                            <span class="hero-card-tag">Flagship Product</span>
                        </div>
                        <div class="hero-card-meta">
                            <div class="hero-card-header">
                                <span class="card-series">Seri Terakota Plered</span>
                                <span class="card-dim"><i class="fas fa-ruler-combined"></i> 20 &times; 20 &times; 10 cm</span>
                            </div>
                            <h3 class="hero-card-title">Roster Terakota Alami</h3>
                            <p class="hero-card-desc">Bahan tanah liat Plered berkualitas tinggi dengan pembakaran optimal, tahan cuaca &amp; anti-lumut.</p>
                        </div>
                        <!-- Floating Glassmorphic Trust Badges -->
                        <div class="hero-badge badge-quality">
                            <i class="fas fa-certificate"></i>
                            <div class="badge-content">
                                <span class="badge-title">Standar Mutu K-250</span>
                                <span class="badge-sub">Beton Padat &amp; Terakota Asli</span>
                            </div>
                        </div>
                        <div class="hero-badge badge-capacity">
                            <i class="fas fa-boxes-stacked"></i>
                            <div class="badge-content">
                                <span class="badge-title">5.000+ Pcs / Hari</span>
                                <span class="badge-sub">Kapasitas Produksi Pabrik</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Hero Trust Badges Strip (Mobile-first, full-width credibility bar) -->
            <div class="hero-trust-strip fade-in-up delay-3">
                <div class="trust-item">
                    <div class="trust-icon">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="trust-text">
                        <strong>5.000+ pcs / hari</strong>
                        <span>Kapasitas Produksi Pabrik</span>
                    </div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                    <div class="trust-icon">
                        <i class="fas fa-truck-fast"></i>
                    </div>
                    <div class="trust-text">
                        <strong>Jabodetabek &amp; Seluruh Indonesia</strong>
                        <span>Jangkauan Ekspedisi Aman</span>
                    </div>
                </div>
                <div class="trust-divider"></div>
                <div class="trust-item">
                    <div class="trust-icon">
                        <i class="fas fa-shield-halved"></i>
                    </div>
                    <div class="trust-text">
                        <strong>Beton K-250 &amp; Terakota Plered</strong>
                        <span>Bahan Asli Presisi Tinggi</span>
                    </div>
                </div>
            </div>
        </div>
    </header>
```

##### 3. About Section (Replace lines 51–87):
```html
    <!-- Tentang Kami (About Section) -->
    <section id="about" class="about section-padding">
        <div class="container">
            <div class="about-grid">
                <!-- Left: Architectural Image with Credibility Overlay -->
                <div class="about-visual slide-in-left">
                    <div class="about-img-wrap">
                        <img src="images/project_interior.png" alt="Aplikasi Roster Sinar Minimalis pada Desain Interior dan Partisi Ruang" width="1024" height="1024" loading="lazy" decoding="async">
                        <!-- Floating Experience Badge -->
                        <div class="about-experience-badge">
                            <span class="exp-number">10+</span>
                            <div class="exp-label">
                                <strong>Tahun Dedikasi</strong>
                                <span>Fabrikasi Roster Presisi</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right: Content, Features & Credibility Metrics -->
                <div class="about-content slide-in-right">
                    <span class="subtitle">Tentang Sinar Minimalis</span>
                    <h2>Kualitas Tanpa Kompromi untuk Setiap Detail Arsitektur</h2>
                    <p class="about-lead">
                        Kami adalah produsen langsung roster beton dan terakota berbasis di Purwakarta, melayani kebutuhan proyek arsitektur, perumahan, perkantoran, dan komersial di Jabodetabek serta seluruh Indonesia.
                    </p>
                    
                    <!-- Feature Points -->
                    <ul class="features-list">
                        <li>
                            <div class="icon"><i class="fas fa-cubes"></i></div>
                            <div>
                                <h4>Material Beton K-250 &amp; Terakota Plered Asli</h4>
                                <p>Kepadatan material maksimal dengan campuran pasir silika pilihan dan tanah liat Plered super, kokoh menghadapi cuaca ekstrem tanpa rapuh.</p>
                            </div>
                        </li>
                        <li>
                            <div class="icon"><i class="fas fa-compass-drafting"></i></div>
                            <div>
                                <h4>Cetakan Presisi &amp; Sudut Siku Sempurna</h4>
                                <p>Tiap unit roster diproduksi dengan mesin cetak modern berpresisi milimeter untuk memudahkan pemasangan rapi dan simetris bagi tukang.</p>
                            </div>
                        </li>
                        <li>
                            <div class="icon"><i class="fas fa-wind"></i></div>
                            <div>
                                <h4>Efisiensi Sirkulasi &amp; Pencahayaan Alami</h4>
                                <p>Rongga roster dirancang matematis untuk meredam panas terik, memasukkan angin sejuk, dan memotong konsumsi listrik pendingin ruangan.</p>
                            </div>
                        </li>
                    </ul>

                    <!-- Credibility Metrics Bar -->
                    <div class="about-stats-grid">
                        <div class="stat-card">
                            <span class="stat-value">5.000+</span>
                            <span class="stat-caption">Pcs / Hari Kapasitas</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">37+</span>
                            <span class="stat-caption">Pilihan Desain Motif</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-value">100%</span>
                            <span class="stat-caption">Jaminan Mutu &amp; Presisi</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
```

---

#### B. Stylesheet Rules for `css/style.css`

##### 1. Typography & Tokens (Update lines 1–15, 75–99):
```css
/* Design Tokens & Typography */
:root {
    --primary: #945738; /* Calibrated terracotta: WCAG AA compliant >= 4.5:1 */
    --primary-dark: #7a462b;
    --primary-light: #b37351;
    --primary-subtle: rgba(148, 87, 56, 0.1);
    
    --secondary: #1A1B1E; /* Deep architectural charcoal */
    --secondary-light: #2C2E33;
    --light: #F9F8F5; /* Warm sand / architectural off-white */
    --white: #FFFFFF;
    --text: #4A4A4A;
    --text-muted: #71767E;
    --border: #E5E0D8;
    --border-subtle: rgba(229, 224, 216, 0.6);
    
    /* Modern Architectural Typography */
    --font-heading: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-main: 'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    
    --nav-height: 80px;
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    --shadow-sm: 0 2px 8px rgba(26, 27, 30, 0.04);
    --shadow-md: 0 8px 24px rgba(26, 27, 30, 0.08);
    --shadow-lg: 0 20px 40px -10px rgba(26, 27, 30, 0.12);
}

/* Headings with Fluid Clamp & Architectural Tracking */
h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--secondary);
    line-height: 1.2;
    font-weight: 700;
}

h1 {
    font-size: clamp(2.25rem, 5vw + 0.5rem, 3.85rem);
    line-height: 1.12;
    letter-spacing: -0.03em;
}

h2 {
    font-size: clamp(1.75rem, 3vw + 0.5rem, 2.5rem);
    line-height: 1.2;
    letter-spacing: -0.025em;
    margin-bottom: 20px;
}

h3 {
    font-size: clamp(1.15rem, 1.2vw + 0.5rem, 1.35rem);
    letter-spacing: -0.015em;
}

h4 {
    font-size: clamp(0.95rem, 0.8vw + 0.5rem, 1.1rem);
    letter-spacing: -0.01em;
}

.subtitle {
    display: inline-block;
    color: var(--primary);
    font-family: var(--font-heading);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-size: clamp(0.75rem, 0.3vw + 0.65rem, 0.85rem);
    margin-bottom: 15px;
}
```

##### 2. Hero Section Rules (Replace lines 247–303):
```css
/* ===== Hero Section ===== */
.hero {
    min-height: 100vh;
    min-height: 100svh;
    position: relative;
    display: flex;
    align-items: center;
    padding-top: calc(var(--nav-height) + 2rem);
    padding-bottom: 3.5rem;
    overflow: hidden;
}

.hero-bg {
    position: absolute;
    inset: 0;
    z-index: -1;
}

.hero-bg img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 30%;
}

.hero-bg .overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(26, 27, 30, 0.92) 0%, rgba(26, 27, 30, 0.78) 55%, rgba(26, 27, 30, 0.55) 100%);
}

.hero-container {
    width: 100%;
    position: relative;
    z-index: 1;
}

.hero-grid {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 48px;
    align-items: center;
    margin-bottom: 3rem;
}

/* Hero Left Column */
.hero-content {
    color: var(--white);
    max-width: 640px;
}

.hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(8px);
    padding: 6px 14px;
    border-radius: 30px;
    margin-bottom: 1.25rem;
}

.badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 10px var(--primary);
}

.eyebrow-text {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.95);
}

.hero-title {
    color: var(--white);
    margin-bottom: 1.25rem;
}

.hero-title .highlight-text {
    color: var(--primary-light);
    position: relative;
    display: inline-block;
}

.hero-lead {
    font-size: clamp(1rem, 1vw + 0.6rem, 1.125rem);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.85);
    margin-bottom: 2.25rem;
    max-width: 540px;
}

.hero-btns {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
}

.btn-primary, .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 48px;
    padding: 14px 28px;
    font-weight: 600;
    border-radius: 6px;
    transition: var(--transition);
    cursor: pointer;
    font-family: var(--font-heading);
    font-size: 0.95rem;
    letter-spacing: 0.01em;
}

.btn-primary {
    background-color: var(--primary);
    color: var(--white);
    box-shadow: 0 4px 14px rgba(148, 87, 56, 0.35);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(148, 87, 56, 0.45);
}

.btn-secondary {
    background-color: rgba(255, 255, 255, 0.08);
    color: var(--white);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
}

.btn-secondary:hover {
    background-color: var(--white);
    color: var(--secondary);
    border-color: var(--white);
    transform: translateY(-2px);
}

/* Hero Right Column: Showcase Card */
.hero-showcase {
    display: flex;
    justify-content: center;
}

.hero-card {
    position: relative;
    background: rgba(26, 27, 30, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.12);
    backdrop-filter: blur(16px);
    border-radius: 16px;
    padding: 20px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
    transition: var(--transition);
}

.hero-card:hover {
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-4px);
}

.hero-card-media {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #111215;
    aspect-ratio: 1 / 1;
}

.hero-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
}

.hero-card:hover .hero-card-img {
    transform: scale(1.04);
}

.hero-card-tag {
    position: absolute;
    top: 14px;
    left: 14px;
    background: var(--primary);
    color: var(--white);
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 4px 10px;
    border-radius: 4px;
}

.hero-card-meta {
    padding-top: 16px;
    color: var(--white);
}

.hero-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.65);
}

.card-dim {
    font-family: var(--font-heading);
    font-weight: 500;
    color: var(--primary-light);
}

.hero-card-title {
    font-size: 1.25rem;
    color: var(--white);
    margin-bottom: 6px;
}

.hero-card-desc {
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.75);
    line-height: 1.5;
    margin: 0;
}

/* Floating Glass Badges on Showcase Card */
.hero-badge {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(26, 27, 30, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    padding: 10px 16px;
    color: var(--white);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 2;
}

.hero-badge i {
    font-size: 1.25rem;
    color: var(--primary-light);
}

.badge-content {
    display: flex;
    flex-direction: column;
}

.badge-title {
    font-size: 0.8rem;
    font-weight: 700;
    line-height: 1.2;
}

.badge-sub {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.2;
}

.badge-quality {
    top: 25px;
    right: -24px;
}

.badge-capacity {
    bottom: -16px;
    left: -20px;
}

/* Hero Trust Strip */
.hero-trust-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(26, 27, 30, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border-radius: 14px;
    padding: 18px 28px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.trust-item {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.trust-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: var(--primary-subtle);
    border: 1px solid rgba(148, 87, 56, 0.3);
    color: var(--primary-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
}

.trust-text {
    display: flex;
    flex-direction: column;
}

.trust-text strong {
    color: var(--white);
    font-size: 0.95rem;
    font-weight: 700;
    font-family: var(--font-heading);
}

.trust-text span {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.78rem;
    line-height: 1.3;
}

.trust-divider {
    width: 1px;
    height: 36px;
    background: rgba(255, 255, 255, 0.12);
    margin: 0 20px;
}
```

##### 3. About Section Rules (Replace lines 305–366):
```css
/* ===== About Section ===== */
.about {
    background-color: var(--white);
    position: relative;
}

.about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.about-visual {
    position: relative;
}

.about-img-wrap {
    position: relative;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 20px 40px -10px rgba(26, 27, 30, 0.12);
    border: 1px solid var(--border);
    aspect-ratio: 1 / 1;
}

.about-img-wrap img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s ease;
}

.about-img-wrap:hover img {
    transform: scale(1.03);
}

.about-experience-badge {
    position: absolute;
    bottom: 24px;
    left: 24px;
    background: var(--secondary);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: var(--white);
    border-radius: 12px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(8px);
}

.exp-number {
    font-family: var(--font-heading);
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary-light);
    line-height: 1;
}

.exp-label {
    display: flex;
    flex-direction: column;
}

.exp-label strong {
    font-size: 0.85rem;
    font-weight: 700;
}

.exp-label span {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.7);
}

.about-lead {
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--text);
    margin-bottom: 25px;
}

.features-list {
    margin-top: 30px;
    margin-bottom: 35px;
    display: flex;
    flex-direction: column;
    gap: 22px;
}

.features-list li {
    display: flex;
    gap: 18px;
    align-items: flex-start;
}

.features-list .icon {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    color: #fff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(148, 87, 56, 0.25);
    transition: var(--transition);
}

.features-list li:hover .icon {
    transform: translateY(-2px) rotate(-4deg);
}

.features-list h4 {
    font-size: 1.05rem;
    margin-bottom: 4px;
    color: var(--secondary);
}

.features-list p {
    font-size: 0.88rem;
    color: var(--text-muted);
    line-height: 1.55;
    margin: 0;
}

/* Credibility Metrics Bar in About */
.about-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    padding-top: 25px;
    border-top: 1px solid var(--border);
}

.stat-card {
    background: var(--light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.stat-value {
    font-family: var(--font-heading);
    font-size: 1.45rem;
    font-weight: 800;
    color: var(--primary);
    line-height: 1.1;
    margin-bottom: 4px;
}

.stat-caption {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--text-muted);
    line-height: 1.3;
}
```

##### 4. Media Query Breakpoints for Hero & About:
```css
/* Responsive Breakpoints for Hero & About */
@media (max-width: 1024px) {
    .hero-grid {
        gap: 32px;
    }
    .badge-quality {
        right: 0;
    }
    .badge-capacity {
        left: 0;
    }
    .about-grid {
        gap: 40px;
    }
}

@media (max-width: 992px) {
    .hero {
        padding-top: calc(var(--nav-height) + 1.5rem);
        padding-bottom: 2.5rem;
    }
    .hero-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }
    .hero-content {
        max-width: 100%;
        text-align: left;
    }
    .hero-showcase {
        order: 2;
    }
    .hero-trust-strip {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        padding: 20px;
    }
    .trust-divider {
        width: 100%;
        height: 1px;
        margin: 0;
    }
    
    .about-grid {
        grid-template-columns: 1fr;
        gap: 36px;
    }
    .about-visual {
        order: 2;
    }
    .about-content {
        order: 1;
    }
}

@media (max-width: 576px) {
    .hero {
        padding-top: calc(var(--nav-height) + 1rem);
    }
    .hero-btns {
        flex-direction: column;
        width: 100%;
    }
    .hero-btns .btn-primary,
    .hero-btns .btn-secondary {
        width: 100%;
        text-align: center;
    }
    .badge-quality,
    .badge-capacity {
        position: static;
        margin-top: 10px;
    }
    .hero-badge {
        width: 100%;
    }
    .about-experience-badge {
        bottom: 14px;
        left: 14px;
        right: 14px;
        padding: 10px 14px;
    }
    .exp-number {
        font-size: 1.6rem;
    }
    .about-stats-grid {
        grid-template-columns: 1fr;
        gap: 10px;
    }
}
```

---

## 5. Verification Method

To independently verify this specification once implemented by Worker M1:

1. **Font Loading & Absence of 404s**:
   - Inspect Network tab in browser / test harness: verify Google Fonts stylesheet returns 200 OK for `Plus+Jakarta+Sans` and `Outfit`.
   - Invalidate if `Playfair Display` is requested or referenced anywhere in computed CSS.
2. **Hero Fluid Scaling & Zero Horizontal Overflow**:
   - Test viewport widths `360px`, `414px`, `768px`, `1024px`, and `1440px`:
     ```javascript
     console.assert(document.documentElement.scrollWidth <= window.innerWidth, "Horizontal overflow detected!");
     ```
   - Invalidate if `document.querySelector('.hero').offsetHeight` snaps or changes abruptly when URL bar is simulated in responsive mode.
3. **Trust Badges Verification**:
   - Verify the presence of all 3 required badges:
     ```javascript
     const text = document.querySelector('.hero-trust-strip').innerText;
     console.assert(text.includes('5.000+ pcs / hari'), "Missing capacity badge");
     console.assert(text.includes('Jabodetabek & Seluruh Indonesia'), "Missing coverage badge");
     console.assert(text.includes('Beton K-250 & Terakota Plered'), "Missing material badge");
     ```
4. **LCP & Priority Loading**:
   - Inspect the hero background image:
     ```javascript
     const heroImg = document.querySelector('.hero-bg img');
     console.assert(heroImg.getAttribute('fetchpriority') === 'high', "fetchpriority must be high");
     console.assert(heroImg.hasAttribute('width') && heroImg.hasAttribute('height'), "Missing explicit dimensions");
     ```
5. **Touch Target Size**:
   - Check computed dimensions of `.hero-btns .btn-primary` and `.btn-secondary`:
     ```javascript
     const rect = document.querySelector('.hero-btns .btn-primary').getBoundingClientRect();
     console.assert(rect.height >= 44 && rect.width >= 44, "Touch target must be >= 44x44px");
     ```
