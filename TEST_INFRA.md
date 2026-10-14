# Test Architecture & E2E Testing Infrastructure (TEST_INFRA.md)

**Project:** Sinar Minimalis Website Modernization & Architectural Redesign  
**Test Suite:** Automated Opaque-Box E2E Test Suite  
**Author:** E2E Test Suite Architect (`teamwork_preview_test_writer`)  
**Directory:** `tests/`  
**Date:** 2026-10-13  

---

## 1. Overview & Architecture

The test suite provides an automated, opaque-box, deterministic End-to-End (E2E) testing harness designed to verify the Sinar Minimalis website against all acceptance criteria defined in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `spec_miner_survey_1/handoff.md`.

### Core Architectural Principles:
1. **Opaque-Box Verification**: Tests interact with the application through DOM structures, simulated user events (clicks, keyboard strokes, input events), and external interfaces (URLs, query parameters, schemas) rather than internal implementation state.
2. **Quantitative Assertion Tracking**: Every verification step is a tracked assertion. The test suite evaluates **343 quantitative assertions** across 27 test cases.
3. **Zero Facade Policy**: Tests never use dummy/facade passes. Assertions test real DOM attributes, asset binary headers, mathematical logic, WCAG luminance contrast ratios, and JSON-LD syntax.
4. **Progressive Testability & Tier Isolation**: The test runner allows running all tiers or targeting specific tiers (`--tier 1`, `--tier 2`, `--tier 3`, `--tier 4`) to enable milestone workers to verify their progress during implementation.

---

## 2. Test Suite Directory Structure

```
c:\Users\Hype G12\OneDrive\website roster\
├── package.json                         # Root package config enabling `npm test`
├── TEST_INFRA.md                        # Test architecture documentation (this file)
├── TEST_READY.md                        # Test readiness signal file
└── tests/
    ├── package.json                     # Test suite dependencies and runner scripts
    ├── run-tests.js                     # Unified CLI test runner
    ├── harness/
    │   ├── test-harness.js              # Custom assertion library & quantitative statistics
    │   ├── dom-loader.js                # JSDOM loader with browser mocks & interaction helpers
    │   └── asset-checker.js             # Asset header inspector & missing link auditor
    ├── tier1-smoke-integrity.js         # Tier 1: Smoke & Static Asset Integrity (167 assertions)
    ├── tier2-boundaries-corners.js      # Tier 2: Boundaries, Filters, Search, Lightbox, WA (104 assertions)
    ├── tier3-cross-feature.js           # Tier 3: Cross-Feature, Calculator & Drawer (30 assertions)
    └── tier4-real-world.js              # Tier 4: Real-World Scenarios, Responsive, SEO & A11y (42 assertions)
```

---

## 3. Four-Tier Test Suite Specification

### Tier 1: Smoke & Static Asset Integrity
- **Scope**: Foundational document syntax, HTTP availability, physical asset integrity, zero 404s, and script stability.
- **Key Assertions (167 assertions)**:
  - Valid `<!DOCTYPE html>` doctype, `lang="id"`, `charset="UTF-8"`, `viewport` meta tags.
  - Document title non-empty and containing brand name.
  - Catalog inventory count: exactly 37 distinct products (35 numbered rosters `roster_1` to `roster_35` plus 2 flagship products `product_concrete` and `product_terracotta`).
  - Filesystem image verification: All 51 image files in `images/` verified on disk for byte length (>1KB) and authentic binary headers (PNG `\x89PNG` or JPEG `\xFF\xD8\xFF`).
  - Zero missing or 404 local images, stylesheets, or scripts referenced in HTML.
  - Zero unhandled JavaScript runtime exceptions on load.
  - Semantic landmark sections presence (`navbar`, `hero`, `#about`, `#katalog`, `#proyek`, `#kontak`, `footer`, `.page-loader`).

### Tier 2: Boundaries, Corners & Interactive Behaviors
- **Scope**: User interaction edge cases, filter chips, debounce search, empty states, lightbox modal, dynamic WhatsApp URLs, and form validation.
- **Key Assertions (104 assertions)**:
  - Filter pills: `Semua`, `Beton`, `Terakota`, `Geometris`, `Flora`, `3D` with state transitions.
  - Result count display (`Menampilkan X dari 37`).
  - Live search corner cases: case insensitivity (`BINTANG` vs `bintang`), leading/trailing whitespace trimming (`"   daun   "`), special character sanitization (`.*+?^${}()|[]\\` and HTML injection).
  - Empty state display when zero items match, equipped with working `Reset` button restoring all 37 products.
  - Lightbox modal: Image click activation, title and specs rendering, direct WhatsApp order CTA, close button (`.lightbox-close`), Escape key dismiss, backdrop tap dismiss, and scroll lock (`document.body.style.overflow = 'hidden'`).
  - WhatsApp order engine: Target number strictly `+62 831 4959 7892` (`6283149597892`), product card URLs contain URI-encoded product parameters, wholesale CTA links to wholesale prefill, floating button links to consultation prefill.
  - Contact form forwarding (`window.sendToWhatsApp`): HTML5 validation, formatted WhatsApp message creation.
  - FAQ accordion toggle and single-item expansion logic.

### Tier 3: Cross-Feature Combinations & Calculation Engines
- **Scope**: Intersecting features, mobile navigation drawer, and architectural wall calculator mathematics.
- **Key Assertions (30 assertions)**:
  - Filter + Search Intersection: Active filter (e.g. Terakota) combined with search query (e.g. Kampak) evaluates to 0 items and displays empty state; searching for Terakota item (Hemavara) displays matching card.
  - Mobile drawer: Hamburger menu toggle opens `.nav-links.active`, clicking navigation link inside drawer auto-closes menu, navigation anchors point to existing section IDs.
  - Interactive Wall Calculator:
    - Formula contract: `areaM2 = length * height`, `basePcs = ceil(areaM2 * 25)`, `reservePcs = ceil(basePcs * 0.05)`, `totalPcs = basePcs + reservePcs`.
    - 5 verified scenarios: 4m x 3m (315 pcs), 2.5m x 2m (132 pcs), 1.2m x 2.4m (76 pcs), 10m x 2.5m (657 pcs), 0m x 2m (0 pcs).
    - 1-click WhatsApp quote generator targeting `6283149597892`.

### Tier 4: Real-World Scenarios, Responsiveness, SEO & Accessibility
- **Scope**: End-to-end workflows, multi-breakpoint responsiveness, touch target sizes, SEO tags, JSON-LD schemas, alt text, and color contrast.
- **Key Assertions (42 assertions)**:
  - Complete buyer inquiry journey: Search -> Locate card -> Inspect in lightbox -> Trigger WhatsApp CTA -> Dismiss modal.
  - Responsive layout integrity: Enforces zero horizontal scroll overflow across 7 device viewports (360px, 375px, 414px, 768px, 1024px, 1280px, 1920px), verifies media queries in CSS.
  - Touch target compliance: Interactive buttons and links meet WCAG minimum 44x44px bounding dimension.
  - Semantic hierarchy: Exactly one `<h1>`, at least 3 `<h2>` section headings.
  - SEO metadata: Meta description (>=30 chars), canonical tag, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), Twitter Card tags.
  - Structured data: 3 JSON-LD schemas (`LocalBusiness` with Purwakarta 41162 and +6283149597892, `ItemList`/`Product`, `FAQPage`).
  - 100% media alt text completeness without missing or generic tags.
  - Zero CLS: Explicit aspect-ratio definitions in CSS, explicit height on Google Maps iframe.
  - WCAG 2.1 AA Contrast: Relative luminance analysis verifying `--primary` terracotta contrast ratio against light backgrounds is >= 4.5:1.

---

## 4. Running the Test Suite

### Full Test Suite (Single Command)
```bash
# Via npm
npm test

# Via Node directly
node tests/run-tests.js
```
*Exit code:* `0` if all assertions pass, `1` if any assertion fails.

### Running Individual Tiers
```bash
# Tier 1 only (Smoke & Static Asset Integrity)
node tests/run-tests.js --tier 1

# Tier 2 only (Boundaries, Filters, Search, Lightbox)
node tests/run-tests.js --tier 2

# Tier 3 only (Cross-Feature, Calculator & Drawer)
node tests/run-tests.js --tier 3

# Tier 4 only (Real-World Scenarios, SEO, A11y)
node tests/run-tests.js --tier 4
```

### Report-Only Mode (Always Exits with Code 0)
```bash
node tests/run-tests.js --report-only
```

---

## 5. Baseline Benchmark Execution & Defect Escalation

When executed against the un-updated baseline codebase (`index.html` v5), the test suite produces the following authoritative benchmark:

- **Suites Executed**: 4
- **Test Cases Total**: 27 (Passed: 15, Failed: 12)
- **Total Assertions**: 343
- **Assertions Passed**: 310
- **Assertions Failed**: 33
- **Pass Rate**: 90.4%
- **Execution Time**: ~2.5 seconds

### Escalated Implementation Defect Map for Milestone Workers:

| Defect ID | Feature Missing / Defect | Test Tier | Target Milestone | Description |
|-----------|--------------------------|-----------|------------------|-------------|
| DEF-01 | Missing Catalog Products | Tier 1 | M2 | Only 32 products in DOM; items 33, 34, 35, and flagship products missing |
| DEF-02 | Missing Filter Pills | Tier 2 | M2 | 0 filter buttons exist in DOM (requires Semua, Beton, Terakota, Geometris, Flora, 3D) |
| DEF-03 | Missing Result Counter | Tier 2 | M2 | Result count element ("Menampilkan X dari 37") is missing |
| DEF-04 | Missing Catalog Search Input | Tier 2 | M2 | Search input (#catalogSearch) is missing |
| DEF-05 | Missing Lightbox Order CTA | Tier 2 | M2 | Lightbox lacks direct WhatsApp order button with encoded parameters |
| DEF-06 | Missing Filter/Search Intersection | Tier 3 | M2, M3 | Filter and search intersection logic not implemented |
| DEF-07 | Missing Wall Area Calculator | Tier 3 | M3 | Calculator section and WhatsApp quote button missing from DOM |
| DEF-08 | Fixed Width Container in CSS | Tier 4 | M1 | Style sheet lacks fluid max-width guard on `.container` |
| DEF-09 | Missing Open Graph & Twitter Cards | Tier 4 | M4 | Social graph meta tags missing from `<head>` |
| DEF-10 | Missing Canonical Link | Tier 4 | M4 | `<link rel="canonical">` missing from `<head>` |
| DEF-11 | Missing JSON-LD Schemas | Tier 4 | M4 | Zero structured data JSON-LD scripts present |
| DEF-12 | Missing CSS Aspect-Ratio | Tier 4 | M4 | No explicit `aspect-ratio` rules for zero CLS |
| DEF-13 | Missing Google Maps Height | Tier 4 | M4 | Maps iframe lacks explicit height attribute |
| DEF-14 | Terracotta Contrast Fails WCAG AA | Tier 4 | M1 | `--primary: #A46C4D` achieves 4.35:1 against white (< 4.5:1 required) |

Milestone workers (M1, M2, M3, M4) must resolve these defects in their respective milestones. When all milestones are complete, running `npm test` will achieve **100% pass (343/343)**.
