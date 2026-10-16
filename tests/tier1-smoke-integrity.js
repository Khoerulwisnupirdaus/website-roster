const fs = require('fs');
const path = require('path');
const { loadDOM, ROOT_DIR } = require('./harness/dom-loader');
const { getImagesInventory, auditHtmlLocalAssets } = require('./harness/asset-checker');

function runTier1Tests(harness) {
  harness.describe('Tier 1: Smoke & Static Asset Integrity', () => {
    const { dom, window, document, rawHtml, jsErrors } = loadDOM({ executeScripts: true });

    // AC-1.1: Document Structure & DOCTYPE
    harness.test('Document Structure, Doctype and Essential Metadata', () => {
      // 1. DOCTYPE check
      const doctypeRegex = /^\s*<!DOCTYPE\s+html>/i;
      harness.assert(doctypeRegex.test(rawHtml), 'HTML document must start with <!DOCTYPE html>');

      // 2. HTML lang attribute
      const htmlLang = document.documentElement.getAttribute('lang');
      harness.assertEqual(htmlLang, 'id', 'Root <html> element must specify lang="id"');

      // 3. Charset meta tag
      const charsetMeta = document.querySelector('meta[charset]');
      harness.assert(Boolean(charsetMeta), '<meta charset> tag must be present');
      if (charsetMeta) {
        harness.assertEqual(
          charsetMeta.getAttribute('charset').toUpperCase(),
          'UTF-8',
          'Character encoding must be UTF-8'
        );
      }

      // 4. Viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      harness.assert(Boolean(viewportMeta), '<meta name="viewport"> tag must be present');
      if (viewportMeta) {
        harness.assertIncludes(
          viewportMeta.getAttribute('content'),
          'width=device-width',
          'Viewport content must include "width=device-width"'
        );
      }

      // 5. Document title
      const title = document.title;
      harness.assert(Boolean(title && title.length > 0), 'Document must have a non-empty <title>');
      harness.assertIncludes(title, 'Scarlet Roster', 'Title must mention "Scarlet Roster"');
    });

    // AC-1.2: Catalog Inventory Count (Exactly 35 items: 33 numbered + 2 flagship)
    harness.test('Catalog Inventory Count (Exactly 35 distinct products)', () => {
      // Products can be represented as .product-card or items registered in window.CATALOG_PRODUCTS
      const domProductCards = Array.from(document.querySelectorAll('.product-card'));
      const windowCatalog = window.CATALOG_PRODUCTS || [];

      // Check DOM cards count
      const totalCount = Math.max(domProductCards.length, windowCatalog.length);
      harness.assertEqual(
        totalCount,
        35,
        `Catalog must contain exactly 35 distinct product items (Found: ${totalCount})`
      );

      // Verify all 33 numbered rosters and 2 flagship items are represented
      const expectedAssetSubstrings = [
        ...Array.from({ length: 33 }, (_, i) => `roster_${i + 1}`),
        'product_concrete',
        'product_terracotta'
      ];

      // Extract all image sources from product cards
      const cardImageSources = domProductCards.map(card => {
        const img = card.querySelector('img');
        return img ? img.getAttribute('src') : '';
      });

      // Extract image sources from window.CATALOG_PRODUCTS if present
      const catalogImageSources = windowCatalog.map(item => item.image || '');
      const allKnownSources = [...cardImageSources, ...catalogImageSources].join(' ');

      expectedAssetSubstrings.forEach(expectedAsset => {
        harness.assert(
          allKnownSources.includes(expectedAsset),
          `Catalog must include product asset "${expectedAsset}"`
        );
      });
    });

    // AC-1.3: Physical 51 Image Assets Integrity on Filesystem
    harness.test('Filesystem Image Assets Integrity (All 51 files verified)', () => {
      const inventory = getImagesInventory();
      harness.assertEqual(
        inventory.length,
        51,
        `images/ directory must contain exactly 51 physical assets (Found: ${inventory.length})`
      );

      // Verify every image is non-empty and has a valid binary header
      inventory.forEach(asset => {
        harness.assertGreaterThanOrEqual(
          asset.sizeBytes,
          1024,
          `Asset ${asset.fileName} must be at least 1KB (Actual: ${asset.sizeBytes} bytes)`
        );
        harness.assert(
          asset.isValidImage,
          `Asset ${asset.fileName} must possess valid PNG or JPEG magic header`
        );
      });
    });

    // AC-1.3b: Zero Missing / 404 Local Image References in HTML
    harness.test('Zero Missing or 404 Local Image References in HTML', () => {
      const audit = auditHtmlLocalAssets(document);
      const missingImages = audit.missing.filter(item => item.type === 'img');
      harness.assertEqual(
        missingImages.length,
        0,
        `Zero local image references in HTML should be missing (Found ${missingImages.length} missing: ${missingImages.map(m => m.src).join(', ')})`
      );
      harness.assertGreaterThanOrEqual(
        audit.found.filter(item => item.type === 'img').length,
        1,
        'At least 1 local image reference must be resolved successfully'
      );
    });

    // AC-1.4: Zero Missing Local CSS or JS References
    harness.test('Zero Missing Local CSS and JS Stylesheets / Scripts', () => {
      const audit = auditHtmlLocalAssets(document);
      const missingStyles = audit.missing.filter(item => item.type === 'css');
      const missingScripts = audit.missing.filter(item => item.type === 'js');

      harness.assertEqual(
        missingStyles.length,
        0,
        `Zero local stylesheets should be missing (Found: ${missingStyles.map(m => m.href).join(', ')})`
      );
      harness.assertEqual(
        missingScripts.length,
        0,
        `Zero local scripts should be missing (Found: ${missingScripts.map(m => m.src).join(', ')})`
      );

      // Verify css/style.css exists and is non-empty
      const stylePath = path.join(ROOT_DIR, 'css', 'style.css');
      harness.assert(fs.existsSync(stylePath), 'css/style.css must exist');
      if (fs.existsSync(stylePath)) {
        const styleStat = fs.statSync(stylePath);
        harness.assertGreaterThanOrEqual(
          styleStat.size,
          1000,
          `css/style.css must be non-trivial stylesheet (Size: ${styleStat.size} bytes)`
        );
      }

      // Verify js/main.js exists and is non-empty
      const mainJsPath = path.join(ROOT_DIR, 'js', 'main.js');
      harness.assert(fs.existsSync(mainJsPath), 'js/main.js must exist');
      if (fs.existsSync(mainJsPath)) {
        const mainStat = fs.statSync(mainJsPath);
        harness.assertGreaterThanOrEqual(
          mainStat.size,
          500,
          `js/main.js must be non-trivial script (Size: ${mainStat.size} bytes)`
        );
      }
    });

    // AC-1.5: Zero Unhandled Runtime JS Exceptions on Load
    harness.test('Zero Unhandled Runtime JavaScript Exceptions on Page Load', () => {
      harness.assertEqual(
        jsErrors.length,
        0,
        `Page load must generate 0 unhandled runtime errors (Encountered: ${jsErrors.map(e => e.message).join('; ')})`
      );
    });

    // Landmark Sections Structure
    harness.test('Semantic HTML5 Landmark Sections Integrity', () => {
      const navbar = document.querySelector('.navbar, nav');
      const hero = document.querySelector('.hero, header#home');
      const about = document.querySelector('#about');
      const catalog = document.querySelector('#katalog');
      const project = document.querySelector('#proyek');
      const contact = document.querySelector('#kontak');
      const footer = document.querySelector('footer');

      harness.assert(Boolean(navbar), 'Navigation bar (<nav> or .navbar) must exist');
      harness.assert(Boolean(hero), 'Hero section (#home or header) must exist');
      harness.assert(Boolean(about), 'About section (#about) must exist');
      harness.assert(Boolean(catalog), 'Catalog section (#katalog) must exist');
      harness.assert(Boolean(project), 'Project section (#proyek) must exist');
      harness.assert(Boolean(contact), 'Contact section (#kontak) must exist');
      harness.assert(Boolean(footer), 'Footer (<footer>) must exist');

      // Loader integrity
      const pageLoader = document.querySelector('.page-loader');
      harness.assert(Boolean(pageLoader), 'Page loader (.page-loader) element must exist');
      if (pageLoader) {
        const loaderImg = pageLoader.querySelector('img');
        harness.assert(Boolean(loaderImg), 'Page loader must contain a logo image');
      }
    });
  });
}

module.exports = { runTier1Tests };
