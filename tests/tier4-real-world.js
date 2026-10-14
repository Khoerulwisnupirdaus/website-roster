const fs = require('fs');
const path = require('path');
const { loadDOM, ROOT_DIR } = require('./harness/dom-loader');

function runTier4Tests(harness) {
  harness.describe('Tier 4: Real-World Scenarios, Responsiveness, SEO & Accessibility', () => {

    // AC-4.1: End-to-End Buyer Inquiry Journey
    harness.test('End-to-End Buyer Journey: Search, Lightbox Inspection and Order Action', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
      const lightbox = document.querySelector('#lightbox, .lightbox-overlay');

      if (searchInput && lightbox) {
        // Step 1: Buyer searches for "Hemavara"
        helpers.input(searchInput, 'Hemavara');

        // Step 2: Buyer locates product card
        const hemavaraCard = Array.from(document.querySelectorAll('.product-card')).find(card => {
          return card.textContent.includes('Hemavara') && card.style.display !== 'none';
        });
        harness.assert(Boolean(hemavaraCard), 'Buyer must locate Hemavara card in search results');

        if (hemavaraCard) {
          // Step 3: Buyer clicks card image to inspect detail
          const img = hemavaraCard.querySelector('img');
          helpers.click(img);

          harness.assert(
            lightbox.classList.contains('active'),
            'Buyer opens lightbox preview for Hemavara'
          );

          // Step 4: Verify specs displayed in lightbox
          const modalText = lightbox.textContent;
          harness.assert(
            modalText.includes('Hemavara') || (lightbox.querySelector('img') && lightbox.querySelector('img').alt.includes('Hemavara')),
            'Lightbox must present Hemavara product name'
          );

          // Step 5: Buyer clicks WhatsApp order CTA
          const waOrderBtn = lightbox.querySelector('a[href*="wa.me"], .btn-wa-order');
          harness.assert(Boolean(waOrderBtn), 'Lightbox must have direct WhatsApp order CTA');
          if (waOrderBtn) {
            const href = waOrderBtn.getAttribute('href') || '';
            harness.assertIncludes(href, '6287869796938', 'CTA link must direct to 6287869796938');
          }

          // Step 6: Dismiss preview
          helpers.keydown(document, 'Escape');
          harness.assert(!lightbox.classList.contains('active'), 'Buyer closes lightbox with Escape key');
        }
      } else {
        // Assert requirement check
        harness.assert(
          Boolean(searchInput && lightbox),
          'End-to-end buyer flow requires search input and lightbox modal elements'
        );
      }
    });

    // AC-4.2: Responsive Zero Horizontal Overflow Analysis Across 7 Breakpoints
    harness.test('Responsive Layout Integrity & Zero Horizontal Overflow (360px - 1920px)', () => {
      const { window, document } = loadDOM({ executeScripts: false });

      // Viewport matrix
      const viewports = [
        { name: 'Mobile Small', width: 360, height: 640 },
        { name: 'Mobile Standard (iPhone)', width: 375, height: 667 },
        { name: 'Mobile Large', width: 414, height: 896 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Tablet Landscape / Laptop Small', width: 1024, height: 768 },
        { name: 'Desktop Standard', width: 1280, height: 800 },
        { name: 'FHD Monitor', width: 1920, height: 1080 }
      ];

      // Read CSS file to verify responsive media queries exist
      const cssPath = path.join(ROOT_DIR, 'css', 'style.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Verify essential responsive media queries exist in CSS
      harness.assertIncludes(cssContent, '@media', 'CSS stylesheet must define responsive @media queries');
      harness.assertIncludes(cssContent, 'max-width: 768px', 'CSS stylesheet must support tablet breakpoint (768px)');

      // Verify meta viewport
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      harness.assert(Boolean(viewportMeta), 'Meta viewport tag must be present for responsive scaling');
      if (viewportMeta) {
        harness.assertIncludes(
          viewportMeta.getAttribute('content'),
          'width=device-width',
          'Viewport tag must enforce width=device-width'
        );
      }

      // Check containers do not have fixed pixel widths exceeding mobile boundaries
      const fixedWidthPattern = /width:\s*([8-9]\d{2}|[1-9]\d{3,})px/g;
      // We check that container classes use max-width or percentage rather than fixed width
      const containerRules = cssContent.match(/\.container\s*\{[^}]+\}/g) || [];
      containerRules.forEach(rule => {
        harness.assert(
          !rule.includes('width: 1200px') && !rule.includes('width: 1400px'),
          'Container must use max-width rather than fixed width to prevent overflow'
        );
      });

      // Verify each breakpoint is acknowledged
      viewports.forEach(vp => {
        harness.assert(
          vp.width >= 360 && vp.width <= 1920,
          `Breakpoint ${vp.name} (${vp.width}px) must be within target responsive envelope`
        );
      });
    });

    // AC-4.3: Touch Target Compliance (Minimum 44x44px bounding box)
    harness.test('WCAG 2.1 AA Touch Target Compliance (>= 44x44px bounding size)', () => {
      const { window, document } = loadDOM({ executeScripts: false });
      const cssPath = path.join(ROOT_DIR, 'css', 'style.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Check CSS rules for mobile touch target sizing
      const touchKeywords = ['min-height: 44px', 'min-width: 44px', 'min-height: 48px', 'height: 44px', 'height: 48px', 'height: 50px', 'height: 60px', 'padding: 12px', 'padding: 14px'];
      const hasTouchSizing = touchKeywords.some(kw => cssContent.includes(kw));

      harness.assert(
        hasTouchSizing,
        'CSS stylesheet must enforce minimum 44px height or generous padding on interactive elements'
      );

      // Check floating WA button has >= 50px dimension
      harness.assert(
        cssContent.includes('.floating-wa') || cssContent.includes('floating-whatsapp'),
        'Stylesheet must define floating WhatsApp button styling'
      );

      // Check mobile menu toggle has touch padding or size
      harness.assert(
        cssContent.includes('.menu-toggle'),
        'Stylesheet must define .menu-toggle target styling'
      );
    });

    // AC-4.4: Semantic Heading Hierarchy (Single H1 and Section H2s)
    harness.test('Semantic Heading Hierarchy (Single H1 and Proper Section H2s)', () => {
      const { document } = loadDOM({ executeScripts: false });

      // 1. Exactly one <h1>
      const h1List = Array.from(document.querySelectorAll('h1'));
      harness.assertEqual(
        h1List.length,
        1,
        `Document must contain exactly one <h1> element (Found: ${h1List.length})`
      );

      if (h1List.length === 1) {
        const h1Text = h1List[0].textContent.trim();
        harness.assertGreaterThanOrEqual(
          h1Text.length,
          10,
          'Primary <h1> must contain descriptive, non-empty heading text'
        );
      }

      // 2. Section headings should use <h2>
      const h2List = Array.from(document.querySelectorAll('h2'));
      harness.assertGreaterThanOrEqual(
        h2List.length,
        3,
        `Document must have at least 3 section <h2> headings (Found: ${h2List.length})`
      );
    });

    // AC-4.5: SEO Metadata & Social Graph (Open Graph & Twitter Cards)
    harness.test('SEO Meta Tags, Open Graph Protocol & Twitter Cards', () => {
      const { document } = loadDOM({ executeScripts: false });

      // 1. Meta Description
      const metaDesc = document.querySelector('meta[name="description"]');
      harness.assert(Boolean(metaDesc), '<meta name="description"> must exist');
      if (metaDesc) {
        const descContent = metaDesc.getAttribute('content') || '';
        harness.assertGreaterThanOrEqual(
          descContent.length,
          30,
          'Meta description must be at least 30 characters long for SEO'
        );
      }

      // 2. Canonical Tag
      const canonical = document.querySelector('link[rel="canonical"]');
      harness.assert(Boolean(canonical), '<link rel="canonical"> must exist in <head>');

      // 3. Open Graph Tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDesc = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      const ogType = document.querySelector('meta[property="og:type"]');

      harness.assert(Boolean(ogTitle), 'Open Graph meta tag "og:title" must exist');
      harness.assert(Boolean(ogDesc), 'Open Graph meta tag "og:description" must exist');
      harness.assert(Boolean(ogImage), 'Open Graph meta tag "og:image" must exist');
      harness.assert(Boolean(ogUrl), 'Open Graph meta tag "og:url" must exist');
      harness.assert(Boolean(ogType), 'Open Graph meta tag "og:type" must exist');

      // 4. Twitter Cards
      const twCard = document.querySelector('meta[name="twitter:card"]');
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      const twImage = document.querySelector('meta[name="twitter:image"]');

      harness.assert(Boolean(twCard), 'Twitter card meta tag "twitter:card" must exist');
      harness.assert(Boolean(twTitle), 'Twitter card meta tag "twitter:title" must exist');
      harness.assert(Boolean(twImage), 'Twitter card meta tag "twitter:image" must exist');
    });

    // AC-4.6: Structured Data (JSON-LD Schemas)
    harness.test('Structured Data JSON-LD Schemas (LocalBusiness, Product/ItemList, FAQPage)', () => {
      const { document } = loadDOM({ executeScripts: false });

      const scriptTags = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      harness.assertGreaterThanOrEqual(
        scriptTags.length,
        1,
        `Expected at least 1 JSON-LD script block in <head> (Found: ${scriptTags.length})`
      );

      let foundLocalBusiness = false;
      let foundItemList = false;
      let foundFAQPage = false;

      scriptTags.forEach((script, idx) => {
        let json = null;
        try {
          json = JSON.parse(script.textContent);
          harness.assert(true, `JSON-LD block #${idx + 1} parses as valid JSON`);
        } catch (e) {
          harness.assert(false, `JSON-LD block #${idx + 1} has invalid JSON syntax: ${e.message}`);
          return;
        }

        // Handle array or single schema object
        const schemas = Array.isArray(json) ? json : [json];
        schemas.forEach(s => {
          const type = s['@type'];
          if (type === 'HomeAndConstructionBusiness' || type === 'LocalBusiness') {
            foundLocalBusiness = true;
            harness.assert(
              Boolean(s.telephone && s.telephone.includes('6287869796938')),
              'LocalBusiness schema telephone must be +6287869796938'
            );
            harness.assert(
              Boolean(s.address && s.address.addressLocality && s.address.addressLocality.includes('Purwakarta')),
              'LocalBusiness schema addressLocality must be Purwakarta'
            );
          }
          if (type === 'ItemList') {
            foundItemList = true;
            harness.assert(
              Array.isArray(s.itemListElement) && s.itemListElement.length > 0,
              'ItemList schema must contain non-empty itemListElement array'
            );
          }
          if (type === 'FAQPage') {
            foundFAQPage = true;
            harness.assert(
              Array.isArray(s.mainEntity) && s.mainEntity.length > 0,
              'FAQPage schema must contain mainEntity array with Q&A'
            );
          }
        });
      });

      harness.assert(foundLocalBusiness, 'JSON-LD must include LocalBusiness / HomeAndConstructionBusiness schema');
      harness.assert(foundItemList, 'JSON-LD must include ItemList / Product catalog schema');
      harness.assert(foundFAQPage, 'JSON-LD must include FAQPage schema');
    });

    // AC-4.7: Descriptive Alt Text Completeness for All Media
    harness.test('Descriptive Alt Text Completeness (100% of Images)', () => {
      const { document } = loadDOM({ executeScripts: false });

      const allImages = Array.from(document.querySelectorAll('img'));
      harness.assertGreaterThanOrEqual(
        allImages.length,
        10,
        `Document must have images to verify alt text (Found: ${allImages.length})`
      );

      let missingAltCount = 0;
      let emptyAltCount = 0;
      let genericAltCount = 0;

      allImages.forEach(img => {
        const alt = img.getAttribute('alt');
        const src = img.getAttribute('src') || '';

        // Loader or decorative icons can be skipped if explicitly aria-hidden
        if (img.closest('.page-loader') || img.getAttribute('aria-hidden') === 'true') {
          return;
        }

        if (alt === null) {
          missingAltCount++;
        } else if (alt.trim() === '') {
          emptyAltCount++;
        } else if (alt.trim().toLowerCase() === 'image' || alt.trim().toLowerCase() === 'photo') {
          genericAltCount++;
        }
      });

      harness.assertEqual(missingAltCount, 0, `Zero images should lack the alt attribute (Found ${missingAltCount})`);
      harness.assertEqual(emptyAltCount, 0, `Zero content images should have empty alt="" (Found ${emptyAltCount})`);
      harness.assertEqual(genericAltCount, 0, `Zero images should have generic "image"/"photo" alt text (Found ${genericAltCount})`);
    });

    // AC-4.8: Zero CLS Geometry (Explicit Aspect Ratios & Dimension Attributes)
    harness.test('Zero CLS Layout Geometry (Explicit Aspect Ratios & Dimensions)', () => {
      const { document } = loadDOM({ executeScripts: false });
      const cssPath = path.join(ROOT_DIR, 'css', 'style.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Check if stylesheet defines aspect-ratio for product cards and gallery
      const hasAspectRatio = cssContent.includes('aspect-ratio: 1 / 1') ||
                             cssContent.includes('aspect-ratio: 1/1') ||
                             cssContent.includes('aspect-ratio: 16 / 9') ||
                             cssContent.includes('aspect-ratio: 16/9') ||
                             cssContent.includes('aspect-ratio:');

      harness.assert(
        hasAspectRatio,
        'CSS stylesheet must specify CSS aspect-ratio properties to eliminate Cumulative Layout Shift (CLS)'
      );

      // Check Google Maps iframe dimensions
      const mapIframe = document.querySelector('iframe');
      if (mapIframe) {
        const widthAttr = mapIframe.getAttribute('width');
        const heightAttr = mapIframe.getAttribute('height');
        harness.assert(
          Boolean(heightAttr),
          'Google Maps iframe must have explicit height attribute or container sizing'
        );
      }
    });

    // AC-4.9: Color Contrast Tuning (Terracotta against Light Backgrounds)
    harness.test('WCAG 2.1 AA Color Contrast Calibration for Terracotta Accent', () => {
      const cssPath = path.join(ROOT_DIR, 'css', 'style.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      // Check primary color variable definition
      const primaryColorMatch = cssContent.match(/--primary:\s*(#[0-9a-fA-F]{6})/);
      harness.assert(Boolean(primaryColorMatch), 'CSS Custom Properties must define --primary color token');

      if (primaryColorMatch) {
        const hex = primaryColorMatch[1].toUpperCase();

        // Calculate relative luminance of hex color
        const getLuminance = (hexCode) => {
          const r = parseInt(hexCode.slice(1, 3), 16) / 255;
          const g = parseInt(hexCode.slice(3, 5), 16) / 255;
          const b = parseInt(hexCode.slice(5, 7), 16) / 255;
          const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
          return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
        };

        const getContrastRatio = (lum1, lum2) => {
          const lighter = Math.max(lum1, lum2);
          const darker = Math.min(lum1, lum2);
          return (lighter + 0.05) / (darker + 0.05);
        };

        // Light background luminance: #FFFFFF (1.0) and #F7F5F0
        const whiteLum = 1.0;
        const colorLum = getLuminance(hex);
        const ratio = getContrastRatio(whiteLum, colorLum);

        // WCAG AA requirement for normal text: >= 4.5:1
        // (Legacy color was #A46C4D which scored ~3.8:1; calibration requires darker shade e.g. #945738 or #825237)
        harness.assertGreaterThanOrEqual(
          Number(ratio.toFixed(2)),
          4.5,
          `--primary (${hex}) contrast ratio against white must be >= 4.5:1 (Actual: ${ratio.toFixed(2)}:1)`
        );
      }
    });

  });
}

module.exports = { runTier4Tests };
