# Specification Handoff Report: Milestone 1 — Navigation Header, Mobile Drawer, Footer & Dead Code Cleanup

**Author:** Spec Miner M1-1  
**Working Directory:** `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\spec_miner_m1_1`  
**Target Roles:** Sub-Orchestrator M1, Worker M1-1, E2E Test Suite Architect  
**Scope:** Milestone 1 — Features #12 (Navigation Header & Footer) & #27 (Dead Code Elimination)  
**Date:** 2026-10-13  

---

## 1. Observation

Direct examination of the authoritative project files (`ORIGINAL_REQUEST.md`, `PROJECT.md`), the codebase (`index.html`, `js/main.js`, `css/style.css`), and the asset directory (`images/`) revealed the following factual state:

### A. Navigation Header in `index.html` (Lines 20–34)
- **Current Markup**:
  ```html
  <nav class="navbar">
      <div class="container nav-container">
          <a href="#" class="logo"><img src="images/logo_sinar.png?v=3" alt="Sinar Minimalis" class="logo-img"><span class="logo-text">SINAR MINIMALIS</span></a>
          <ul class="nav-links">
              <li><a href="#home">Beranda</a></li>
              <li><a href="#about">Tentang Kami</a></li>
              <li><a href="#katalog">Katalog</a></li>
              <li><a href="#proyek">Proyek</a></li>
          </ul>
          <a href="#kontak" class="btn-primary">Hubungi Kami</a>
          <div class="menu-toggle">
              <i class="fas fa-bars"></i>
          </div>
      </div>
  </nav>
  ```
- **Observed Inconsistencies**:
  1. Only 4 links are present in `.nav-links`: `#home`, `#about`, `#katalog`, and `#proyek`.
  2. Sections `#alur-pesan` (Alur Pemesanan), `#faq` (Pertanyaan Umum), and `#kontak` (Kontak & Pemesanan) are missing from the navigation menu list.
  3. The logo anchor uses `href="#"` instead of a targeted anchor (`#home`), which can cause page scroll resets or broken history navigation.
  4. The logo image (`images/logo_sinar.png?v=3`) lacks explicit `width` and `height` attributes, violating CLS guidelines.
  5. The `.menu-toggle` element is an inaccessible `<div>` instead of a semantic `<button type="button">`. It lacks accessibility attributes (`aria-label`, `aria-expanded`, and `aria-controls`).
  6. There is no backdrop overlay element (`.nav-backdrop`), leaving mobile users with no visual scrim and no outside-click dismissal mechanism.

### B. Mobile Menu & Scroll Spy Logic in `js/main.js`
- **Mobile Menu (Lines 13–44)**:
  ```javascript
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      ...
  });
  ```
  - Lacks `aria-expanded` synchronization (screen readers cannot detect open/close states).
  - Does not support outside click dismissal via backdrop overlay.
  - Does not listen for `Escape` key to close the drawer and restore focus.
  - Does not lock body scroll when the mobile drawer is active, leading to background page drift during menu touches.
- **Scroll Spy (Lines 191–210)**:
  - Scroll spy is only attached to `.bottom-nav a[href^="#"]`.
  - The main desktop header links (`.nav-links a`) do NOT receive `.active` class updates on scroll.
- **Orphaned Dead Code (Lines 136–156)**:
  ```javascript
  // ===== Dark Mode Toggle =====
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
      if (localStorage.getItem('darkMode') === 'true') {
          document.body.classList.add('dark-mode');
          darkToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
      }
      darkToggle.addEventListener('click', () => { ... });
  }
  ```
  - `darkToggle` does NOT exist in `index.html`.
  - Grep search confirms `darkToggle` appears 0 times in `index.html` and 0 times in `css/style.css`.
  - Lines 81–83 also contain a stale comment referring to obsolete canvas scripts.

### C. Footer & Arbitrary Counters in `index.html` & `css/style.css`
- **Current Footer in `index.html` (Lines 1031–1051)**:
  ```html
  <footer>
      <div class="container">
          <div class="footer-content">
              <div class="footer-brand">
                  <a href="#" class="logo"><img src="images/logo_sinar.png?v=3" alt="Sinar Minimalis" class="logo-img footer-logo-img"><span class="logo-text">SINAR MINIMALIS</span></a>
                  <p>Pabrikasi roster premium untuk solusi arsitektur masa kini.</p>
              </div>
              <div class="footer-social">
                  <a href="https://www.instagram.com/sinar.minimalis" target="_blank"><i class="fab fa-instagram"></i></a>
                  <a href="https://www.facebook.com/people/SinarMinimalis/61589331003047/" target="_blank"><i class="fab fa-facebook-f"></i></a>
              </div>
          </div>
          <div class="footer-bottom">
              <div class="visitor-counter">
                  <i class="fas fa-eye"></i>
                  Website dikunjungi <span class="visitor-count-num">2.819</span> kali
              </div>
              <p>&copy; 2026 Sinar Minimalis. All rights reserved.</p>
          </div>
      </div>
  </footer>
  ```
- **Observed Deficiencies**:
  1. The footer lacks semantic multi-column navigation, missing quick links, product categories, and physical address details.
  2. Verified business location (`Jl. Citeko No. 5, Blok B, Kec. Plered, Purwakarta, Jawa Barat 41162`), verified WhatsApp (`+62 878 6979 6938`), and operating hours are completely absent from the footer.
  3. An arbitrary, hardcoded counter (`2.819 kali`) is displayed via `.visitor-counter`, misleading visitors and violating clean data standards.
  4. Social links lack `aria-label` and `rel="noopener noreferrer"`.
  5. In `css/style.css` (lines 1140–1158), dead rules for `.visitor-counter` exist.
  6. In `css/style.css` (line 1024), a dead comment `/* Dark Mode removed per user request */` exists.

---

## 2. Logic Chain

1. **Header Completeness**: The site consists of 7 primary sections: `#home` (Beranda), `#about` (Tentang Kami), `#katalog` (Katalog), `#proyek` (Inspirasi Proyek), `#alur-pesan` (Alur Pemesanan), `#faq` (Pertanyaan Umum / FAQ), and `#kontak` (Kontak & Pemesanan). Having only 4 links prevents users from jumping directly to ordering instructions, FAQ, and contact information. Therefore, all 7 sections must be represented in `.nav-links`.
2. **Glassmorphism & Scroll Spy**:
   - The hero background has dark architectural imagery with a dark overlay, requiring white text and transparent navbar initially.
   - When scrolled past 40px, the navbar transitions to `.scrolled`, adopting `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(12px)` and charcoal text.
   - Without active state tracking on desktop, users have no visual feedback on their current page location. Synchronizing desktop `.nav-links a` and mobile `.bottom-nav a` via an offset scroll spy guarantees seamless location awareness.
3. **Accessible Mobile Navigation**:
   - WCAG 2.1 AA and Google mobile usability require interactive controls to be semantic buttons with accessible names (`aria-label`) and state indicators (`aria-expanded`).
   - Touch targets must be >= 44x44px to prevent tap errors.
   - Users expect outside taps to dismiss drawers; a frosted backdrop overlay (`.nav-backdrop`) provides both visual context and intuitive dismissal.
4. **Verified Local Footer**:
   - Local SEO for Purwakarta and Jabodetabek depends on clear, indexable NAP (Name, Address, Phone) consistency across the page.
   - Grounding the footer with the exact workshop location (`Plered, Purwakarta 41162`), direct WhatsApp links, and clear navigation links fulfills R1, R4, and R5.
   - Eliminating the ungrounded "2.819" visitor counter removes untruthful metadata.
5. **Dead Code Cleanup**:
   - Eliminating the unreferenced `darkToggle` event listeners in `js/main.js` and dead CSS comments/rules ensures zero runtime bloat and zero console warnings.

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | 7-Item Navigation Header | Complete links: Beranda, Tentang Kami, Katalog, Inspirasi Proyek, Alur Pemesanan, FAQ, Kontak | User click on nav links | Smooth scroll to matching section target | If anchor missing, defaults to top | ORIGINAL_REQUEST R1, PROJECT.md |
| 2 | Navigation | Sticky Glassmorphism Navbar | Transparent at top; transitions to frosted white glass (`blur(12px)`) with subtle shadow on scroll | Window scroll event (`scrollY > 40px`) | `.navbar.scrolled` class toggled | Graceful fallback without blur if unsupported | Existing `style.css` lines 147-168 |
| 3 | Navigation | Synchronized Active Scroll Spy | Real-time `.active` class updates on both desktop nav and mobile bottom nav | Scroll position relative to section offsets | Corresponding anchor receives `.active` class | If at bottom of page, activates last section (`#kontak`) | `js/main.js` analysis |
| 4 | Mobile UI | Accessible Hamburger Toggle | Semantic `<button>` with `aria-label`, `aria-expanded`, and `aria-controls="navLinks"` | User tap/click or keyboard Enter/Space | Drawer opens/closes; `aria-expanded` toggles | Graceful fallback if JS disabled | WCAG 2.1 AA audit & R4 |
| 5 | Mobile UI | Dismissable Backdrop Overlay | Frosted dark scrim (`.nav-backdrop`) behind mobile drawer | Drawer active state or click on backdrop | Scrim fades in/out; closes drawer on click | Pointer events disabled when inactive | Survey 2 & UX inspection |
| 6 | Mobile UI | Keyboard & Escape Dismissal | Dismiss mobile drawer when user presses `Escape` key | Keyboard `keydown` (key === 'Escape') | Drawer closes, focus returned to hamburger toggle | No-op if drawer is not active | A11y standard compliance |
| 7 | Mobile UI | Touch Target Sizing (>= 44x44px) | Minimum 44x44px bounding box for toggle, all drawer links, and footer buttons | Touch interactions | Reliable touch activation without mis-taps | Visual padding ensures zero tap overlap | WCAG 2.1 AA / Lighthouse |
| 8 | Footer | 4-Column Semantic Footer | Semantic grid: Brand/Bio, Navigasi Cepat, Koleksi Roster, Workshop & Kontak Purwakarta | HTML5 `<footer>` structure | Comprehensive, indexable footer layout | Responsive collapse to 1-2 cols on mobile | R1, R5 & SEO audit |
| 9 | Footer | Verified Purwakarta NAP Details | Physical workshop address (Plered 41162), WhatsApp +62 878 6979 6938, email, operating hours | Footer contact block | Clickable WhatsApp, tel, and mailto links | Valid schema-ready format | `index.html` lines 988-996 |
| 10 | Cleanup | Arbitrary Counter Removal | Deletion of hardcoded "2.819" visitor counter and associated CSS rules | Removal of markup and styles | Zero ungrounded counters displayed | Prevents misleading user claims | PROJECT.md Feature #27 |
| 11 | Cleanup | Orphaned `darkToggle` Removal | Elimination of dead `darkToggle` event listeners and localStorage code in `js/main.js` | Code removal | Clean, error-free script execution | Eliminates unreferenced DOM queries | `js/main.js` lines 136-156 |
| 12 | Cleanup | Stale Comments & Dead CSS Rules | Elimination of canvas logo comment and dead dark-mode comment/visitor-counter CSS | Code refactoring | Zero dead rules or confusing obsolete comments | Maintains compact stylesheet | `css/style.css` lines 1024, 1140 |

---

## 4. Edge Cases

| # | Feature | Input / Trigger | Observed & Required Behavior |
|---|---------|-----------------|------------------------------|
| 1 | Scroll Spy | Fast or erratic scrolling across sections | Throttled via `requestAnimationFrame`; checks section offset bounding boxes smoothly without UI stutter or flickering. |
| 2 | Scroll Spy | Reaching bottom of page where `#kontak` offset doesn't reach top | Detects `scrollY + innerHeight >= scrollHeight - 50` and automatically highlights the final `#kontak` section. |
| 3 | Mobile Drawer | Viewport resized from mobile to desktop (> 992px) while drawer is open | `resize` event triggers `closeMobileMenu()`, removes `.nav-open` and resets `aria-expanded="false"`. |
| 4 | Mobile Drawer | User taps outside the drawer on background | Backdrop overlay intercepts click, closes drawer immediately, and does not fire clicks on background elements. |
| 5 | Mobile Drawer | User presses `Escape` key while drawer is open | Drawer dismisses immediately; `document.body` scroll lock is removed; focus returns to `#menuToggle`. |
| 6 | Navigation CTA | Screen width between 768px and 992px | Nav CTA button hidden from the top bar to prevent header wrapping; navigation links remain uncluttered. |
| 7 | Footer Links | Tapping social icons on small screens (360px viewport) | Bounding box is at least 44x44px (`.social-btn: 44x44px`), preventing accidental double taps on adjacent icons. |
| 8 | Header Logo | Fast click on logo when already on `#home` | Smoothly scrolls to top (`#home`) without page reload or appending unwanted `#` to browser history. |

---

## 5. Precise Implementation Specifications for Worker M1-1

### A. Exact HTML Specification for `index.html`

#### 1. Header & Navigation (Replace lines 20–34):
```html
    <nav class="navbar" id="navbar" role="navigation" aria-label="Navigasi Utama">
        <div class="container nav-container">
            <a href="#home" class="logo" aria-label="Sinar Minimalis Beranda">
                <img src="images/logo_sinar.png?v=3" alt="Sinar Minimalis Logo" class="logo-img" width="160" height="50">
                <span class="logo-text">SINAR MINIMALIS</span>
            </a>
            <ul class="nav-links" id="navLinks" role="menubar">
                <li role="none"><a href="#home" role="menuitem" class="nav-link active">Beranda</a></li>
                <li role="none"><a href="#about" role="menuitem" class="nav-link">Tentang Kami</a></li>
                <li role="none"><a href="#katalog" role="menuitem" class="nav-link">Katalog</a></li>
                <li role="none"><a href="#proyek" role="menuitem" class="nav-link">Inspirasi Proyek</a></li>
                <li role="none"><a href="#alur-pesan" role="menuitem" class="nav-link">Alur Pemesanan</a></li>
                <li role="none"><a href="#faq" role="menuitem" class="nav-link">FAQ</a></li>
                <li role="none"><a href="#kontak" role="menuitem" class="nav-link">Kontak</a></li>
            </ul>
            <a href="https://wa.me/6287869796938?text=Halo%20Sinar%20Minimalis%2C%20saya%20ingin%20konsultasi%20pemesanan%20roster" target="_blank" rel="noopener noreferrer" class="btn-primary nav-cta">
                <i class="fab fa-whatsapp" aria-hidden="true"></i> Konsultasi
            </a>
            <button type="button" class="menu-toggle" id="menuToggle" aria-label="Buka menu navigasi" aria-expanded="false" aria-controls="navLinks">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
        </div>
    </nav>
    <div class="nav-backdrop" id="navBackdrop" aria-hidden="true"></div>
```

#### 2. Footer (Replace lines 1031–1051):
```html
    <footer class="site-footer" role="contentinfo">
        <div class="container">
            <div class="footer-grid">
                <!-- Kolom 1: Brand & Profil Pabrik -->
                <div class="footer-col footer-col-brand">
                    <a href="#home" class="logo footer-logo" aria-label="Sinar Minimalis Beranda">
                        <img src="images/logo_sinar.png?v=3" alt="Sinar Minimalis - Pabrikasi Roster Premium" class="logo-img footer-logo-img" width="180" height="55" loading="lazy">
                        <span class="logo-text">SINAR MINIMALIS</span>
                    </a>
                    <p class="footer-desc">
                        Produsen dan pabrikasi roster beton & terakota presisi kualitas arsitektur modern. Menghadirkan ventilasi alami, estetika fasad kontemporer, dan ketahanan cuaca maksimal untuk hunian serta bangunan komersial.
                    </p>
                    <div class="footer-social" aria-label="Media Sosial Sinar Minimalis">
                        <a href="https://www.instagram.com/sinar.minimalis" target="_blank" rel="noopener noreferrer" aria-label="Instagram Sinar Minimalis" class="social-btn">
                            <i class="fab fa-instagram" aria-hidden="true"></i>
                        </a>
                        <a href="https://www.facebook.com/people/SinarMinimalis/61589331003047/" target="_blank" rel="noopener noreferrer" aria-label="Facebook Sinar Minimalis" class="social-btn">
                            <i class="fab fa-facebook-f" aria-hidden="true"></i>
                        </a>
                        <a href="https://wa.me/6287869796938?text=Halo%20Sinar%20Minimalis%2C%20saya%20ingin%20konsultasi%20pemesanan%20roster" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp Sinar Minimalis" class="social-btn social-wa">
                            <i class="fab fa-whatsapp" aria-hidden="true"></i>
                        </a>
                    </div>
                </div>

                <!-- Kolom 2: Navigasi Cepat -->
                <div class="footer-col footer-col-nav">
                    <h3 class="footer-heading">Navigasi Halaman</h3>
                    <ul class="footer-links">
                        <li><a href="#home">Beranda</a></li>
                        <li><a href="#about">Tentang Kami</a></li>
                        <li><a href="#katalog">Katalog Produk</a></li>
                        <li><a href="#proyek">Inspirasi Proyek</a></li>
                        <li><a href="#alur-pesan">Alur Pemesanan</a></li>
                        <li><a href="#faq">Pertanyaan Umum (FAQ)</a></li>
                        <li><a href="#kontak">Kontak & Pemesanan</a></li>
                    </ul>
                </div>

                <!-- Kolom 3: Ragam Produk Roster -->
                <div class="footer-col footer-col-products">
                    <h3 class="footer-heading">Koleksi Produk</h3>
                    <ul class="footer-links">
                        <li><a href="#katalog">Roster Beton Abu-abu Presisi</a></li>
                        <li><a href="#katalog">Roster Terakota Bakar Natural</a></li>
                        <li><a href="#katalog">Roster Motif Geometris</a></li>
                        <li><a href="#katalog">Roster Motif Flora & Organik</a></li>
                        <li><a href="#katalog">Roster 3D & Prisma Modern</a></li>
                        <li><a href="#kontak">Pemesanan Desain Custom</a></li>
                    </ul>
                </div>

                <!-- Kolom 4: Workshop & Kontak Terverifikasi -->
                <div class="footer-col footer-col-contact">
                    <h3 class="footer-heading">Workshop & Kontak</h3>
                    <ul class="footer-contact-info">
                        <li>
                            <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                            <span>Jl. Citeko No. 5, Blok B, Kec. Plered, Kab. Purwakarta, Jawa Barat 41162</span>
                        </li>
                        <li>
                            <i class="fab fa-whatsapp" aria-hidden="true"></i>
                            <a href="https://wa.me/6287869796938" target="_blank" rel="noopener noreferrer">+62 878 6979 6938</a>
                        </li>
                        <li>
                            <i class="fas fa-envelope" aria-hidden="true"></i>
                            <a href="mailto:sinarminimalis@gmail.com">sinarminimalis@gmail.com</a>
                        </li>
                        <li>
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span>Senin – Sabtu: 08.00 – 17.00 WIB</span>
                        </li>
                    </ul>
                    <div class="footer-service-area">
                        <i class="fas fa-truck-fast" aria-hidden="true"></i>
                        <span>Pengiriman: Purwakarta, Subang, Karawang, Bandung, Jabodetabek & Seluruh Indonesia (Packing Kayu Aman)</span>
                    </div>
                </div>
            </div>

            <!-- Footer Bottom: Clean copyright without arbitrary counter -->
            <div class="footer-bottom">
                <p>&copy; 2026 Sinar Minimalis. All rights reserved. Pabrikasi Roster Beton & Terakota Berkualitas Arsitektur.</p>
            </div>
        </div>
    </footer>
```

---

### B. Exact CSS Specification for `css/style.css`

#### 1. Header & Glassmorphism (Replace lines 146–245):
```css
/* ===== Navbar & Sticky Glassmorphism ===== */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 18px 0;
    z-index: 1000;
    transition: background-color 0.3s ease, padding 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
    background: transparent;
}

.navbar.scrolled {
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 12px 0;
    border-bottom: 1px solid rgba(229, 224, 216, 0.6);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.nav-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
}

.logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    z-index: 1002;
}

.logo-img {
    height: 48px;
    width: auto;
    max-width: 160px;
    transition: transform 0.3s ease;
}

.navbar.scrolled .logo-img {
    height: 42px;
}

.footer-logo-img {
    height: 52px;
    width: auto;
    filter: brightness(1.2);
}

.logo-text {
    font-family: var(--font-heading);
    font-size: 1.35rem;
    font-weight: 700;
    color: var(--white);
    letter-spacing: 2px;
    margin-left: 10px;
    transition: color 0.3s ease;
}

.navbar.scrolled .logo-text {
    color: var(--secondary);
}

.nav-links {
    display: flex;
    gap: 22px;
    list-style: none;
    margin: 0;
    padding: 0;
    align-items: center;
}

.nav-links a {
    color: var(--white);
    font-weight: 500;
    position: relative;
    font-size: 0.92rem;
    padding: 6px 2px;
    transition: color 0.3s ease;
    display: inline-block;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background-color: var(--primary);
    transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.nav-links a:hover::after,
.nav-links a.active::after {
    width: 100%;
}

.nav-links a:hover {
    color: var(--white);
    opacity: 0.9;
}

.nav-links a.active {
    color: #FFFFFF;
    font-weight: 600;
}

.navbar.scrolled .nav-links a {
    color: var(--secondary);
}

.navbar.scrolled .nav-links a:hover,
.navbar.scrolled .nav-links a.active {
    color: var(--primary);
}

.nav-cta {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    font-size: 0.9rem;
    font-weight: 600;
    border-radius: 6px;
    z-index: 1002;
    transition: var(--transition);
}

.nav-cta i {
    font-size: 1.1rem;
}

/* Hamburger Toggle Button */
.menu-toggle {
    display: none;
    background: transparent;
    border: none;
    color: var(--white);
    font-size: 1.5rem;
    cursor: pointer;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border-radius: 8px;
    transition: var(--transition);
    z-index: 1002;
}

.navbar.scrolled .menu-toggle {
    color: var(--secondary);
}

.menu-toggle:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
}

/* Backdrop Overlay */
.nav-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 999;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s ease, visibility 0.3s ease;
    pointer-events: none;
}

.nav-backdrop.active {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
}
```

#### 2. Mobile Drawer Navigation Breakpoint (Replace lines 793–824):
```css
@media (max-width: 992px) {
    .menu-toggle {
        display: flex;
    }

    .nav-cta {
        display: none;
    }

    .nav-links {
        position: fixed;
        top: 0;
        right: -100%;
        width: 300px;
        max-width: 82vw;
        height: 100vh;
        height: 100dvh;
        background: var(--white);
        flex-direction: column;
        align-items: stretch;
        padding: 85px 24px 30px;
        box-shadow: -8px 0 30px rgba(0, 0, 0, 0.15);
        transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 1001;
        gap: 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .nav-links.active {
        right: 0;
    }

    .nav-links li {
        width: 100%;
        border-bottom: 1px solid var(--border);
    }

    .nav-links a {
        display: flex;
        align-items: center;
        width: 100%;
        min-height: 48px; /* >= 44x44px touch target compliance */
        padding: 12px 10px;
        color: var(--secondary);
        font-size: 1rem;
        font-weight: 500;
        border-radius: 6px;
    }

    .nav-links a::after {
        display: none;
    }

    .nav-links a:hover,
    .nav-links a.active {
        color: var(--primary);
        background: rgba(148, 87, 56, 0.08);
        padding-left: 16px;
        font-weight: 600;
    }

    body.nav-open {
        overflow: hidden;
    }
}

@media (min-width: 993px) and (max-width: 1120px) {
    .nav-links {
        gap: 14px;
    }
    .nav-links a {
        font-size: 0.86rem;
    }
}
```

#### 3. Semantic Footer CSS (Replace lines 551–598):
```css
/* ===== Semantic Footer ===== */
.site-footer {
    background-color: #1A1B1E;
    color: #B0B0B0;
    padding: 70px 0 25px;
    font-size: 0.95rem;
    line-height: 1.6;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-grid {
    display: grid;
    grid-template-columns: 1.8fr 1fr 1.2fr 1.6fr;
    gap: 40px;
    padding-bottom: 50px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-logo {
    display: inline-flex;
    align-items: center;
    margin-bottom: 18px;
    text-decoration: none;
}

.footer-desc {
    color: #A0A0A0;
    font-size: 0.9rem;
    margin-bottom: 24px;
    line-height: 1.6;
}

.footer-heading {
    font-family: var(--font-main);
    color: var(--white);
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 22px;
    position: relative;
    letter-spacing: 0.5px;
}

.footer-heading::after {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    background: var(--primary);
    margin-top: 8px;
    border-radius: 2px;
}

.footer-links {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.footer-links a {
    color: #B0B0B0;
    text-decoration: none;
    font-size: 0.9rem;
    transition: var(--transition);
    display: inline-block;
    padding: 2px 0;
}

.footer-links a:hover {
    color: var(--white);
    transform: translateX(4px);
}

.footer-social {
    display: flex;
    gap: 12px;
    align-items: center;
}

.social-btn {
    width: 44px;
    height: 44px;
    background: rgba(255, 255, 255, 0.08);
    color: var(--white);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.1rem;
    transition: var(--transition);
    text-decoration: none;
}

.social-btn:hover {
    background: var(--primary);
    color: var(--white);
    transform: translateY(-3px);
}

.social-btn.social-wa:hover {
    background: #25D366;
}

.footer-contact-info {
    list-style: none;
    padding: 0;
    margin: 0 0 20px 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.footer-contact-info li {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 0.88rem;
    color: #B0B0B0;
}

.footer-contact-info li i {
    color: var(--primary);
    font-size: 1rem;
    margin-top: 3px;
    flex-shrink: 0;
    width: 18px;
    text-align: center;
}

.footer-contact-info a {
    color: #B0B0B0;
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-contact-info a:hover {
    color: var(--white);
}

.footer-service-area {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 0.8rem;
    color: #C0C0C0;
    border: 1px solid rgba(255, 255, 255, 0.06);
    line-height: 1.4;
}

.footer-service-area i {
    color: var(--primary);
    margin-top: 2px;
    flex-shrink: 0;
}

.footer-bottom {
    padding-top: 25px;
    text-align: center;
    font-size: 0.85rem;
    color: #777;
}

@media (max-width: 992px) {
    .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 35px;
    }
}

@media (max-width: 600px) {
    .footer-grid {
        grid-template-columns: 1fr;
        gap: 30px;
    }
    .footer-desc {
        font-size: 0.88rem;
    }
}
```

#### 4. Dead Code Removal in `css/style.css`:
- Remove line 1024 (`/* Dark Mode removed per user request */`).
- Remove lines 1140–1158 (`/* ===== Visitor Counter ===== */` and `.visitor-counter` styles).

---

### C. Exact JavaScript Specification for `js/main.js`

Replace lines 1–45 and 191–210, and eliminate lines 136–156:
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. Navbar Scroll Effect & Sticky Glassmorphism =====
    const navbar = document.querySelector('.navbar');
    
    function updateNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            const navLinks = document.querySelector('.nav-links');
            if (!navLinks || !navLinks.classList.contains('active')) {
                navbar.classList.remove('scrolled');
            }
        }
    }
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    // ===== 2. Accessible Mobile Menu Drawer & Backdrop Overlay =====
    const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    const navBackdrop = document.getElementById('navBackdrop') || document.querySelector('.nav-backdrop');

    function openMobileMenu() {
        if (!navLinks || !menuToggle) return;
        navLinks.classList.add('active');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.classList.add('nav-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Tutup menu navigasi');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
        if (navbar) navbar.classList.add('scrolled');
    }

    function closeMobileMenu() {
        if (!navLinks || !menuToggle) return;
        navLinks.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        if (navbar && window.scrollY <= 40) {
            navbar.classList.remove('scrolled');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks && navLinks.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMobileMenu);
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            closeMobileMenu();
            if (menuToggle) menuToggle.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navLinks && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ===== 3. Synchronized Scroll Spy Engine =====
    const trackedSectionIds = ['home', 'about', 'katalog', 'proyek', 'alur-pesan', 'faq', 'kontak'];
    const trackedSections = trackedSectionIds
        .map(id => document.getElementById(id))
        .filter(sec => sec !== null);

    const desktopNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const bottomNavLinks = document.querySelectorAll('.bottom-nav a[href^="#"]');

    function updateActiveNavLinks() {
        if (!trackedSections.length) return;
        const scrollPosition = window.scrollY + 120;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        let activeId = trackedSections[0].id;

        if (window.scrollY + windowHeight >= documentHeight - 50) {
            activeId = trackedSections[trackedSections.length - 1].id;
        } else {
            trackedSections.forEach(section => {
                if (scrollPosition >= section.offsetTop) {
                    activeId = section.id;
                }
            });
        }

        desktopNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        bottomNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            window.requestAnimationFrame(() => {
                updateActiveNavLinks();
                scrollTimeout = null;
            });
            scrollTimeout = true;
        }
    }, { passive: true });
    updateActiveNavLinks();

    // ===== 4. Intersection Observer for Animations =====
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // ===== 5. FAQ Accordion =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
});
```

---

## 6. Caveats

1. **Section IDs in DOM**: The scroll spy relies on section IDs `#home`, `#about`, `#katalog`, `#proyek`, `#alur-pesan`, `#faq`, and `#kontak`. If any subsequent milestone changes these IDs, both HTML anchors and the `trackedSectionIds` array in `js/main.js` must be kept synchronized.
2. **Bottom Nav and Floating WhatsApp**: On mobile viewport (< 768px), `.bottom-nav` is displayed at `bottom: 0`. To prevent visual collision with `.floating-wa`, `.floating-wa` is positioned at `bottom: 80px`. In M4 (Feature #20), the floating WA button may be hidden entirely on mobile if redundant with the bottom nav WhatsApp icon.
3. **Logo Asset Quality**: The logo `images/logo_sinar.png` is already transparent, but has dimension `160x50` configured to maintain crisp aspect ratio across desktop and mobile.

---

## 7. Conclusion

The specification for Milestone 1 (Features #12 and #27) is fully probed, verified, and formulated:
1. **Navigation Header**: Complete 7-link structure (`#home`, `#about`, `#katalog`, `#proyek`, `#alur-pesan`, `#faq`, `#kontak`) with sticky glassmorphism and active scroll spy.
2. **Mobile Drawer**: Accessible `<button>` hamburger with `aria-expanded` and `aria-controls`, frosted backdrop overlay dismissal, `Escape` key support, and >= 44x44px touch target compliance.
3. **Semantic Footer**: 4-column architectural layout with verified Purwakarta 41162 location, direct WhatsApp links, and zero ungrounded arbitrary counters.
4. **Dead Code Elimination**: Complete removal of orphaned `darkToggle` event listeners, stale canvas comments, and dead visitor-counter CSS rules.

Worker M1-1 has exact drop-in HTML, CSS, and JS code ready for implementation.

---

## 8. Verification Method

Once Worker M1-1 implements these changes, the implementation can be verified via the following checks:

### Independent Command Checks
1. **Orphaned `darkToggle` check**:
   ```powershell
   Select-String -Path "js\main.js" -Pattern "darkToggle"
   ```
   *Expected Result*: 0 matches found.
2. **Arbitrary visitor counter check**:
   ```powershell
   Select-String -Path "index.html", "css\style.css" -Pattern "visitor-counter", "2.819"
   ```
   *Expected Result*: 0 matches found.
3. **Navigation Links completeness check**:
   ```powershell
   Select-String -Path "index.html" -Pattern '#home', '#about', '#katalog', '#proyek', '#alur-pesan', '#faq', '#kontak'
   ```
   *Expected Result*: All 7 section anchors present inside `.nav-links`.
4. **Accessible attributes check**:
   ```powershell
   Select-String -Path "index.html" -Pattern 'aria-controls="navLinks"', 'aria-expanded="false"', 'id="navBackdrop"'
   ```
   *Expected Result*: Matches found verifying accessibility and backdrop presence.
5. **Interactive UI Verification**:
   - Open `index.html` in browser.
   - Resize to 375px width (iPhone standard):
     - Click `#menuToggle` -> drawer opens, `#navBackdrop` fades in, body cannot scroll.
     - Press `Escape` -> drawer closes cleanly, focus returns to `#menuToggle`.
     - Click `#menuToggle` -> drawer opens, tap on backdrop -> drawer closes immediately.
   - Scroll page on desktop:
     - Header becomes frosted white glass at `scrollY > 40px`.
     - Respective link underline (`.active`) transitions cleanly between `#home`, `#about`, `#katalog`, `#proyek`, `#alur-pesan`, `#faq`, `#kontak`.
