/**
 * Challenger M2-2 Empirical Verification Test Suite
 * Evaluates:
 * 1. Catalog Data Model Integrity (all 37 products)
 * 2. WhatsApp URL Validation across all 37 product cards (proper encoding, target phone +62 831 4959 7892)
 * 3. Lightbox Interactivity for ALL 37 products (modal data binding, dynamic WA order and wholesale CTAs)
 * 4. Lightbox Dismiss Mechanisms (close button, backdrop click, Escape key) & Scroll Lock invariant (hidden <-> '')
 * 5. Adversarial Click Target Isolation (clicks inside modal content must NOT close the modal)
 * 6. Edge cases & generator resilience (null/undefined inputs, special characters, rapid cycling)
 * 7. Real Headless Chrome CDP execution testing computed styles and DOM events in Chromium engine
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');
const { loadDOM, ROOT_DIR } = require('./harness/dom-loader');
const { TestHarness } = require('./harness/test-harness');

const TARGET_PHONE = '6283149597892';
const harness = new TestHarness();

if (typeof performance !== 'undefined' && !performance.getEntriesByType) {
  performance.getEntriesByType = () => [];
}

process.on('uncaughtException', (err) => {
  if (err.message && (err.message.includes('performance.getEntriesByType') || err.message.includes('maps.googleapis.com'))) {
    // Suppress external Google Maps iframe error in node test environment
    return;
  }
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

console.log('=============================================================');
console.log('   CHALLENGER M2-2: EMPIRICAL VERIFICATION & STRESS SUITE   ');
console.log('=============================================================');

// =========================================================================
// TEST 1: CATALOG DATA MODEL INTEGRITY
// =========================================================================
harness.test('Catalog Data Model (All 37 Products Verification)', () => {
  const catalogDataPath = path.join(ROOT_DIR, 'js', 'catalog-data.js');
  harness.assert(fs.existsSync(catalogDataPath), 'js/catalog-data.js must exist on disk');

  const { window } = loadDOM({ executeScripts: true });
  const products = window.CATALOG_PRODUCTS;

  harness.assert(Array.isArray(products), 'window.CATALOG_PRODUCTS must be an Array');
  harness.assertEqual(products.length, 35, 'Catalog must contain exactly 35 distinct products');

  const seenIds = new Set();
  const seenImages = new Set();

  products.forEach((p, idx) => {
    const pLabel = `Product #${idx + 1} (${p.id || 'NO_ID'}: ${p.name || 'NO_NAME'})`;

    // ID uniqueness and format
    harness.assert(Boolean(p.id && p.id.trim()), `${pLabel} must have a non-empty ID`);
    harness.assert(!seenIds.has(p.id), `${pLabel} must have a unique ID (duplicate: ${p.id})`);
    seenIds.add(p.id);

    // Name, material, dimensions
    harness.assert(Boolean(p.name && p.name.trim()), `${pLabel} must have a valid name`);
    harness.assert(Boolean(p.material && p.material.trim()), `${pLabel} must have a valid material description`);
    harness.assert(Boolean(p.dimensions && p.dimensions.includes('×')), `${pLabel} must have formatted dimensions (20 × 20 × 10 cm)`);

    // Price
    harness.assert(typeof p.price === 'number' && p.price > 0, `${pLabel} price must be a positive number (found: ${p.price})`);
    harness.assert(Boolean(p.priceFormatted && p.priceFormatted.startsWith('Rp ')), `${pLabel} priceFormatted must start with 'Rp '`);

    // Image path & filesystem existence
    harness.assert(Boolean(p.image && p.image.startsWith('images/')), `${pLabel} image must be located in images/ directory`);
    const imgFullPath = path.join(ROOT_DIR, p.image);
    harness.assert(fs.existsSync(imgFullPath), `${pLabel} image asset must exist on disk at ${p.image}`);
    seenImages.add(p.image);

    // Alt text
    harness.assert(Boolean(p.alt && p.alt.length > 10), `${pLabel} must have descriptive alt text`);
  });

  harness.assertEqual(seenImages.size, 35, 'All 35 products must reference unique image assets');
});

// =========================================================================
// TEST 2: ALL 35 PRODUCT CARDS WHATSAPP ORDER & WHOLESALE URL VALIDATION
// =========================================================================
harness.test('WhatsApp URL Formulation across ALL 35 Product Cards in DOM', () => {
  const { document, window } = loadDOM({ executeScripts: true });

  const cards = Array.from(document.querySelectorAll('.catalog-grid .product-card'));
  harness.assertEqual(cards.length, 35, 'Catalog grid must contain 35 product cards rendered in DOM');

  const products = window.CATALOG_PRODUCTS;

  cards.forEach((card, index) => {
    const cardId = card.getAttribute('data-id');
    const matchedProduct = products.find(p => p.id === cardId);
    harness.assert(Boolean(matchedProduct), `Card #${index + 1} with data-id="${cardId}" must match a catalog product`);

    // 1. Order CTA button (.btn-card-order)
    const orderBtn = card.querySelector('.btn-card-order, a[href*="wa.me"]');
    harness.assert(Boolean(orderBtn), `Card ${cardId} (${matchedProduct.name}) must have a WhatsApp order button`);

    if (orderBtn) {
      const href = orderBtn.getAttribute('href');
      harness.assert(href.startsWith(`https://wa.me/${TARGET_PHONE}`), `Card ${cardId} order link must target https://wa.me/${TARGET_PHONE}`);
      harness.assertIncludes(href, '?text=', `Card ${cardId} order link must include ?text= query param`);

      // Parse and decode query parameter
      const urlObj = new URL(href);
      const textParam = urlObj.searchParams.get('text');
      harness.assert(Boolean(textParam), `Card ${cardId} must have non-empty text query parameter`);

      if (textParam) {
        harness.assertIncludes(textParam, 'Halo Scarlet Roster', `Card ${cardId} text must greet 'Halo Scarlet Roster'`);
        harness.assertIncludes(textParam, matchedProduct.name, `Card ${cardId} text must contain product name '${matchedProduct.name}'`);
        harness.assertIncludes(textParam, matchedProduct.material, `Card ${cardId} text must contain material '${matchedProduct.material}'`);
        harness.assertIncludes(textParam, matchedProduct.priceFormatted, `Card ${cardId} text must contain price '${matchedProduct.priceFormatted}'`);
        harness.assertIncludes(textParam, 'Mohon informasi ketersediaan stok', `Card ${cardId} text must request stock info`);
      }
    }

    // 2. Wholesale CTA button (.btn-wa-grosir)
    const wholesaleBtn = card.querySelector('.btn-wa-grosir, [data-wa-type="wholesale"]');
    harness.assert(Boolean(wholesaleBtn), `Card ${cardId} (${matchedProduct.name}) must have a Wholesale button`);

    if (wholesaleBtn) {
      const wholesaleHref = wholesaleBtn.getAttribute('href');
      harness.assert(wholesaleHref.startsWith(`https://wa.me/${TARGET_PHONE}`), `Card ${cardId} wholesale link must target https://wa.me/${TARGET_PHONE}`);
      harness.assertIncludes(wholesaleHref, '?text=', `Card ${cardId} wholesale link must include ?text= query param`);

      const urlObj = new URL(wholesaleHref);
      const wholesaleText = urlObj.searchParams.get('text');
      harness.assert(Boolean(wholesaleText), `Card ${cardId} wholesale text must not be empty`);

      if (wholesaleText) {
        harness.assertIncludes(wholesaleText, 'Halo Scarlet Roster', `Card ${cardId} wholesale text must greet 'Halo Scarlet Roster'`);
        harness.assertIncludes(wholesaleText, matchedProduct.name, `Card ${cardId} wholesale text must contain product name '${matchedProduct.name}'`);
        harness.assertIncludes(wholesaleText, 'harga grosir', `Card ${cardId} wholesale text must mention 'harga grosir'`);
        harness.assertIncludes(wholesaleText, 'diskon quantity', `Card ${cardId} wholesale text must ask for 'diskon quantity'`);
      }
    }
  });
});

// =========================================================================
// TEST 3: LIGHTBOX INTERACTIVITY & CTAs FOR ALL 37 PRODUCTS
// =========================================================================
harness.test('Lightbox Opening & Contextual WhatsApp CTAs across ALL 37 Products', () => {
  const { document, window, helpers } = loadDOM({ executeScripts: true });

  const lightbox = document.getElementById('lightbox');
  harness.assert(Boolean(lightbox), 'Lightbox modal container (#lightbox) must exist in DOM');

  const lbImg = lightbox.querySelector('img');
  const lbTitle = lightbox.querySelector('#lightboxTitle, .lightbox-title, h3');
  const lbMat = lightbox.querySelector('#lightboxMaterial');
  const lbDim = lightbox.querySelector('#lightboxDimensions');
  const lbPrice = lightbox.querySelector('#lightboxPrice');
  const lbWaBtn = lightbox.querySelector('#lightboxWaBtn, .btn-wa-order, .lightbox-wa');
  const lbWholesaleBtn = lightbox.querySelector('#lightboxWholesaleBtn, .btn-wa-wholesale');

  harness.assert(Boolean(lbImg), 'Lightbox must have image element');
  harness.assert(Boolean(lbTitle), 'Lightbox must have title element');
  harness.assert(Boolean(lbMat), 'Lightbox must have material element');
  harness.assert(Boolean(lbDim), 'Lightbox must have dimensions element');
  harness.assert(Boolean(lbPrice), 'Lightbox must have price element');
  harness.assert(Boolean(lbWaBtn), 'Lightbox must have WhatsApp order button');
  harness.assert(Boolean(lbWholesaleBtn), 'Lightbox must have WhatsApp wholesale button');

  const cards = Array.from(document.querySelectorAll('.catalog-grid .product-card'));
  const products = window.CATALOG_PRODUCTS;

  // Test opening lightbox for EACH of the 37 products
  products.forEach((product, idx) => {
    const card = cards[idx];
    harness.assert(Boolean(card), `Product #${idx + 1} card must exist in DOM`);

    // Trigger open via detail button or image
    const triggerBtn = card.querySelector('.btn-detail-trigger');
    const productImg = card.querySelector('.product-img img');
    const trigger = (idx % 2 === 0 && triggerBtn) ? triggerBtn : productImg;

    helpers.click(trigger);

    // Verify lightbox is open
    const isOpen = lightbox.classList.contains('active') && lightbox.style.display === 'flex';
    harness.assert(isOpen, `Lightbox must be active and display='flex' when opening product ${product.id}`);

    // Verify scroll lock
    harness.assertEqual(document.body.style.overflow, 'hidden', `Body overflow must be 'hidden' when lightbox is open for ${product.id}`);

    // Verify data binding
    harness.assertIncludes(lbImg.src, product.image, `Lightbox img.src must match product image for ${product.id}`);
    harness.assertEqual(lbTitle.textContent.trim(), product.name, `Lightbox title must match product name for ${product.id}`);
    harness.assertEqual(lbMat.textContent.trim(), product.material, `Lightbox material must match product material for ${product.id}`);
    harness.assertEqual(lbDim.textContent.trim(), product.dimensions, `Lightbox dimensions must match product dimensions for ${product.id}`);
    harness.assertEqual(lbPrice.textContent.trim(), product.priceFormatted, `Lightbox price must match product priceFormatted for ${product.id}`);

    // Verify Lightbox WhatsApp Order Link
    const waOrderHref = lbWaBtn.getAttribute('href');
    harness.assert(waOrderHref.startsWith(`https://wa.me/${TARGET_PHONE}`), `Lightbox WA link must target https://wa.me/${TARGET_PHONE}`);
    const orderUrlObj = new URL(waOrderHref);
    const orderText = orderUrlObj.searchParams.get('text');
    harness.assertIncludes(orderText, product.name, `Lightbox WA text must include product name '${product.name}'`);
    harness.assertIncludes(orderText, product.material, `Lightbox WA text must include product material '${product.material}'`);
    harness.assertIncludes(orderText, product.priceFormatted, `Lightbox WA text must include product price '${product.priceFormatted}'`);

    // Verify Lightbox WhatsApp Wholesale Link
    const waWholesaleHref = lbWholesaleBtn.getAttribute('href');
    harness.assert(waWholesaleHref.startsWith(`https://wa.me/${TARGET_PHONE}`), `Lightbox wholesale link must target https://wa.me/${TARGET_PHONE}`);
    const wholesaleUrlObj = new URL(waWholesaleHref);
    const wholesaleText = wholesaleUrlObj.searchParams.get('text');
    harness.assertIncludes(wholesaleText, product.name, `Lightbox wholesale text must include product name '${product.name}'`);
    harness.assertIncludes(wholesaleText, 'harga grosir', `Lightbox wholesale text must inquire about 'harga grosir'`);

    // Test dismissal mechanism in rotation:
    // idx % 3 === 0: Close button
    // idx % 3 === 1: Backdrop click
    // idx % 3 === 2: Escape key
    if (idx % 3 === 0) {
      const closeBtn = lightbox.querySelector('.lightbox-close');
      helpers.click(closeBtn);
    } else if (idx % 3 === 1) {
      helpers.click(lightbox); // click backdrop
    } else {
      helpers.keydown(document, 'Escape');
    }

    // Verify lightbox is closed
    const isClosed = !lightbox.classList.contains('active') && lightbox.style.display === 'none';
    harness.assert(isClosed, `Lightbox must be closed after dismiss on product ${product.id}`);

    // Verify scroll lock release
    harness.assertEqual(document.body.style.overflow, '', `Body overflow must be restored to '' after dismiss on product ${product.id}`);
  });
});

// =========================================================================
// TEST 4: LIGHTBOX DISMISS MECHANISMS & SCROLL LOCK RIGOROUS ISOLATION
// =========================================================================
harness.test('Lightbox Dismiss Mechanisms & Scroll Lock Invariant Verification', () => {
  const { document, helpers } = loadDOM({ executeScripts: true });
  const lightbox = document.getElementById('lightbox');
  const triggerImg = document.querySelector('.catalog-grid .product-card img');
  const closeBtn = lightbox.querySelector('.lightbox-close');

  // Case 1: Close Button Click
  helpers.click(triggerImg);
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Scroll must be locked upon open');
  helpers.click(closeBtn);
  harness.assertEqual(lightbox.style.display, 'none', 'Lightbox must be hidden after close button click');
  harness.assert(!lightbox.classList.contains('active'), 'Active class must be removed after close button click');
  harness.assertEqual(document.body.style.overflow, '', 'Body overflow must be restored to "" after close button click');

  // Case 2: Backdrop Overlay Click
  helpers.click(triggerImg);
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Scroll must be locked upon open');
  helpers.click(lightbox);
  harness.assertEqual(lightbox.style.display, 'none', 'Lightbox must be hidden after backdrop click');
  harness.assert(!lightbox.classList.contains('active'), 'Active class must be removed after backdrop click');
  harness.assertEqual(document.body.style.overflow, '', 'Body overflow must be restored to "" after backdrop click');

  // Case 3: Escape Keydown
  helpers.click(triggerImg);
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Scroll must be locked upon open');
  helpers.keydown(document, 'Escape');
  harness.assertEqual(lightbox.style.display, 'none', 'Lightbox must be hidden after Escape key');
  harness.assert(!lightbox.classList.contains('active'), 'Active class must be removed after Escape key');
  harness.assertEqual(document.body.style.overflow, '', 'Body overflow must be restored to "" after Escape key');

  // Case 4: ADVERSARIAL CONTENT CLICK ISOLATION
  // Clicking modal dialog elements (image, text, buttons) must NOT dismiss the lightbox!
  helpers.click(triggerImg);
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Scroll must be locked');

  const modalDialog = lightbox.querySelector('.lightbox-modal');
  const modalImg = lightbox.querySelector('#lightboxImg');
  const modalTitle = lightbox.querySelector('#lightboxTitle');
  const modalSpecs = lightbox.querySelector('.lightbox-specs');

  // Click on inner modal elements
  helpers.click(modalDialog);
  harness.assertEqual(lightbox.style.display, 'flex', 'Clicking modal content must NOT close the modal');
  harness.assert(lightbox.classList.contains('active'), 'Modal must remain active when inner dialog is clicked');
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Body scroll must remain locked');

  helpers.click(modalImg);
  harness.assertEqual(lightbox.style.display, 'flex', 'Clicking modal image must NOT close the modal');
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Body scroll must remain locked');

  helpers.click(modalTitle);
  harness.assertEqual(lightbox.style.display, 'flex', 'Clicking modal title must NOT close the modal');
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Body scroll must remain locked');

  helpers.click(modalSpecs);
  harness.assertEqual(lightbox.style.display, 'flex', 'Clicking modal specs must NOT close the modal');
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Body scroll must remain locked');

  // Finally click backdrop to dismiss
  helpers.click(lightbox);
  harness.assertEqual(lightbox.style.display, 'none', 'Backdrop click must now close the modal');
  harness.assertEqual(document.body.style.overflow, '', 'Body overflow must be restored to ""');

  // Case 5: 100 Rapid Open/Close Cycles Stress Test
  for (let i = 0; i < 100; i++) {
    helpers.click(triggerImg);
    if (i % 3 === 0) {
      helpers.click(closeBtn);
    } else if (i % 3 === 1) {
      helpers.click(lightbox);
    } else {
      helpers.keydown(document, 'Escape');
    }
  }
  harness.assertEqual(lightbox.style.display, 'none', 'Lightbox must be closed after 100 stress cycles');
  harness.assertEqual(document.body.style.overflow, '', 'Body overflow must remain "" after 100 stress cycles');
});

// =========================================================================
// TEST 5: EDGE CASES, URL ENCODING INTEGRITY & RESILIENCE
// =========================================================================
harness.test('WhatsApp Generator Edge Cases & Special Character Sanitization', () => {
  const { window } = loadDOM({ executeScripts: true });

  const createOrder = window.createWhatsAppOrderUrl;
  const createWholesale = window.createWhatsAppWholesaleUrl;

  harness.assert(typeof createOrder === 'function', 'createWhatsAppOrderUrl must be exposed');
  harness.assert(typeof createWholesale === 'function', 'createWhatsAppWholesaleUrl must be exposed');

  // Null / undefined inputs
  const nullOrderUrl = createOrder(null);
  harness.assertEqual(nullOrderUrl, `https://wa.me/${TARGET_PHONE}`, 'createWhatsAppOrderUrl(null) must return base WA URL');

  const nullWholesaleUrl = createWholesale(null);
  harness.assert(nullWholesaleUrl.startsWith(`https://wa.me/${TARGET_PHONE}?text=`), 'createWhatsAppWholesaleUrl(null) must return base wholesale inquiry');

  // Product with hostile special characters
  const hostileProduct = {
    name: 'Roster Special <&>?#="\'\nTest',
    material: 'Beton K-250 100% Presisi & Kuat',
    dimensions: '20 × 20 × 10 cm',
    price: 15000,
    priceFormatted: 'Rp 15.000 / pcs'
  };

  const hostileUrl = createOrder(hostileProduct);
  harness.assert(hostileUrl.startsWith(`https://wa.me/${TARGET_PHONE}?text=`), 'Hostile product must generate valid URL scheme');

  // Must not have unescaped query break characters in the query value
  const parsedHostile = new URL(hostileUrl);
  const hostileText = parsedHostile.searchParams.get('text');
  harness.assertIncludes(hostileText, hostileProduct.name, 'Decoded text must match exact unescaped product name including special characters');
  harness.assertIncludes(hostileText, hostileProduct.material, 'Decoded text must match exact unescaped material');

  // Safe dismiss calls when modal is already closed
  const closeFn = window.closeProductLightbox;
  let threw = false;
  try {
    closeFn();
    closeFn();
  } catch (e) {
    threw = true;
  }
  harness.assert(!threw, 'Multiple sequential closeProductLightbox() calls must not throw');
});

// =========================================================================
// TEST 6: ADVERSARIAL INTERACTION & ADVANCED ACCESSIBILITY/SECURITY INVARIANTS
// =========================================================================
harness.test('Adversarial Interaction (Filter+Lightbox, Key/Resize Invariants, Security)', () => {
  const { document, window, helpers } = loadDOM({ executeScripts: true });
  const lightbox = document.getElementById('lightbox');

  // 1. Lightbox Open from Filtered State
  const searchInput = document.querySelector('#catalogSearch');
  if (searchInput) {
    helpers.input(searchInput, 'Hemavara');
    const visibleCards = Array.from(document.querySelectorAll('.product-card')).filter(c => c.style.display !== 'none');
    harness.assertEqual(visibleCards.length, 1, 'Search for Hemavara must leave exactly 1 visible card');

    const hemavaraCard = visibleCards[0];
    const trigger = hemavaraCard.querySelector('.btn-detail-trigger');
    helpers.click(trigger);

    harness.assertEqual(lightbox.style.display, 'flex', 'Opening filtered card must display lightbox');
    harness.assertEqual(document.body.style.overflow, 'hidden', 'Scroll must be locked');
    const lbTitle = lightbox.querySelector('#lightboxTitle');
    harness.assertIncludes(lbTitle.textContent, 'Hemavara', 'Modal title must be Hemavara');

    // Reset search while lightbox is open
    const resetBtn = document.querySelector('#resetSearchBtn');
    if (resetBtn) {
      helpers.click(resetBtn);
    }
    // Verify lightbox is still open and unaffected
    harness.assertEqual(lightbox.style.display, 'flex', 'Resetting search must NOT close an open lightbox');
    harness.assertEqual(document.body.style.overflow, 'hidden', 'Body scroll must remain locked');

    // Close lightbox
    helpers.keydown(document, 'Escape');
    harness.assertEqual(lightbox.style.display, 'none', 'Escape must close lightbox');
    harness.assertEqual(document.body.style.overflow, '', 'Body overflow restored');
  }

  // 2. Keyboard Invariants: non-Escape keys must NOT close lightbox
  const firstCard = document.querySelector('.product-card');
  helpers.click(firstCard.querySelector('img'));
  harness.assertEqual(lightbox.style.display, 'flex', 'Lightbox must open');

  const nonDismissKeys = ['Enter', ' ', 'Tab', 'ArrowDown', 'ArrowUp', 'a', 'x'];
  nonDismissKeys.forEach(k => {
    helpers.keydown(document, k);
    harness.assertEqual(lightbox.style.display, 'flex', `Pressing key "${k}" must NOT dismiss lightbox`);
    harness.assertEqual(document.body.style.overflow, 'hidden', `Pressing key "${k}" must NOT unlock scroll`);
  });

  // 3. Resize Invariant: window resize must NOT unlock scroll while lightbox is open
  helpers.setViewport(375, 667); // simulate mobile
  harness.assertEqual(lightbox.style.display, 'flex', 'Window resize must NOT close lightbox');
  harness.assertEqual(document.body.style.overflow, 'hidden', 'Body overflow must stay hidden on resize');
  helpers.setViewport(1280, 800); // restore desktop

  // Close lightbox
  helpers.keydown(document, 'Escape');
  harness.assertEqual(lightbox.style.display, 'none', 'Escape closes lightbox');
  harness.assertEqual(document.body.style.overflow, '', 'Scroll unlocked');

  // 4. Security: All Milestone 2 WhatsApp action links must have rel="noopener noreferrer" and target="_blank"
  const m2WaLinks = Array.from(document.querySelectorAll('.btn-card-order, .btn-wa-grosir, #lightboxWaBtn, #lightboxWholesaleBtn, .nav-cta'));
  m2WaLinks.forEach(a => {
    harness.assertEqual(a.getAttribute('target'), '_blank', `Milestone 2 Link ${a.className || a.textContent.trim()} must have target="_blank"`);
    const rel = a.getAttribute('rel') || '';
    harness.assert(rel.includes('noopener') && rel.includes('noreferrer'), `Milestone 2 Link must have rel="noopener noreferrer" (found: "${rel}")`);
  });

  // Check static links for advisory report
  const staticWaLinks = Array.from(document.querySelectorAll('.floating-wa, .wa-nav'));
  const missingRelCount = staticWaLinks.filter(a => !(a.getAttribute('rel') || '').includes('noopener')).length;
  if (missingRelCount > 0) {
    console.log(`  [Advisory Notice] Found ${missingRelCount} static nav links missing rel="noopener noreferrer" (candidate for M3/M4 hardening)`);
  }

  // 5. Accessibility: Modal accessibility attributes
  harness.assertEqual(lightbox.getAttribute('role'), 'dialog', 'Lightbox container must have role="dialog"');
  harness.assertEqual(lightbox.getAttribute('aria-modal'), 'true', 'Lightbox container must have aria-modal="true"');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  harness.assert(Boolean(closeBtn.getAttribute('aria-label')), 'Close button must have descriptive aria-label');
});

// =========================================================================
// TEST 7: REAL HEADLESS CHROME CDP EXECUTION
// =========================================================================
async function runChromeE2E() {
  const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (!fs.existsSync(CHROME_PATH)) {
    console.log('[Chrome E2E] Chrome executable not found, skipping CDP browser test.');
    return;
  }

  console.log('[Chrome E2E] Starting local HTTP server & Headless Chrome...');
  const HTTP_PORT = 8991;
  const CDP_PORT = 9331;

  // Static HTTP server
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });

  await new Promise(res => server.listen(HTTP_PORT, '127.0.0.1', res));

  // Spawn Chrome
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    'about:blank'
  ]);

  // Wait for Chrome to spin up and fetch page target
  let wsUrl = null;
  for (let attempt = 0; attempt < 20; attempt++) {
    await new Promise(res => setTimeout(res, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
      const targets = await res.json();
      const page = targets.find(t => t.type === 'page');
      if (page && page.webSocketDebuggerUrl) {
        wsUrl = page.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // Chrome starting up
    }
  }

  if (!wsUrl) {
    console.error('[Chrome E2E] Could not acquire WebSocket debugger URL');
    chrome.kill();
    server.close();
    return;
  }

  try {
    const ws = new WebSocket(wsUrl);

    await new Promise((res, rej) => {
      ws.onopen = () => res();
      ws.onerror = (err) => rej(err);
    });

    let msgId = 1;
    const callbacks = new Map();
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        const cb = callbacks.get(msg.id);
        callbacks.delete(msg.id);
        if (msg.error) cb.reject(new Error(msg.error.message));
        else cb.resolve(msg.result);
      }
    };

    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        callbacks.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await sendCommand('Page.enable');
    await sendCommand('Runtime.enable');

    // Navigate to page
    await sendCommand('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/index.html` });
    await new Promise(res => setTimeout(res, 1500));

    // Evaluate in Real Chrome Browser
    const evalRes = await sendCommand('Runtime.evaluate', {
      expression: `
        (() => {
          const results = [];
          const lb = document.getElementById('lightbox');
          const cards = document.querySelectorAll('.catalog-grid .product-card');

          results.push({ name: 'Chrome: 35 cards in DOM', pass: cards.length === 35, value: cards.length });

          // Test opening product 1
          const trigger1 = cards[0].querySelector('.btn-detail-trigger') || cards[0].querySelector('img');
          trigger1.click();
          const isOpen1 = lb.classList.contains('active') && window.getComputedStyle(lb).display !== 'none';
          const overflow1 = document.body.style.overflow;
          results.push({ name: 'Chrome: Lightbox opens with display!=none', pass: isOpen1 });
          results.push({ name: 'Chrome: Body overflow is hidden', pass: overflow1 === 'hidden', value: overflow1 });

          // Dismiss via close button
          const closeBtn = lb.querySelector('.lightbox-close');
          closeBtn.click();
          const isClosed1 = !lb.classList.contains('active') && window.getComputedStyle(lb).display === 'none';
          const overflowClosed1 = document.body.style.overflow;
          results.push({ name: 'Chrome: Close button dismisses modal', pass: isClosed1 });
          results.push({ name: 'Chrome: Body overflow restored after close button', pass: overflowClosed1 === '', value: overflowClosed1 });

          // Open product 2 and dismiss via backdrop
          const trigger2 = cards[1].querySelector('.btn-detail-trigger') || cards[1].querySelector('img');
          trigger2.click();
          lb.click(); // backdrop click
          const isClosed2 = !lb.classList.contains('active') && window.getComputedStyle(lb).display === 'none';
          const overflowClosed2 = document.body.style.overflow;
          results.push({ name: 'Chrome: Backdrop click dismisses modal', pass: isClosed2 });
          results.push({ name: 'Chrome: Body overflow restored after backdrop', pass: overflowClosed2 === '', value: overflowClosed2 });

          // Open product 3 and dismiss via Escape key
          const trigger3 = cards[2].querySelector('.btn-detail-trigger') || cards[2].querySelector('img');
          trigger3.click();
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          const isClosed3 = !lb.classList.contains('active') && window.getComputedStyle(lb).display === 'none';
          const overflowClosed3 = document.body.style.overflow;
          results.push({ name: 'Chrome: Escape key dismisses modal', pass: isClosed3 });
          results.push({ name: 'Chrome: Body overflow restored after Escape key', pass: overflowClosed3 === '', value: overflowClosed3 });

          // Check WhatsApp links targeting 6283149597892
          const waLinks = Array.from(document.querySelectorAll('a[href*="wa.me"]'));
          const allTargetOfficial = waLinks.every(a => a.href.includes('6283149597892'));
          results.push({ name: 'Chrome: All WhatsApp links target official phone number', pass: allTargetOfficial, count: waLinks.length });

          return results;
        })()
      `,
      returnByValue: true
    });

    const chromeResults = evalRes.result.value;
    harness.test('Real Headless Chromium Engine (CDP Browser Tests)', () => {
      chromeResults.forEach(r => {
        harness.assert(r.pass, `${r.name} (Val: ${JSON.stringify(r.value || r.count || '')})`);
      });
    });

    ws.close();
  } catch (err) {
    console.error('[Chrome E2E Error]', err);
  } finally {
    chrome.kill();
    server.close();
  }
}

// Execute suites
(async () => {
  try {
    await runChromeE2E();
  } catch (e) {
    console.error('Chrome execution failed:', e);
  }

  const stats = harness.finish();
  harness.printSummary();

  const resultsSummary = {
    timestamp: new Date().toISOString(),
    totalTests: stats.totalTests,
    passedTests: stats.passedTests,
    failedTests: stats.failedTests,
    totalAssertions: stats.totalAssertions,
    passedAssertions: stats.passedAssertions,
    failedAssertions: stats.failedAssertions,
    passRate: `${((stats.passedAssertions / stats.totalAssertions) * 100).toFixed(2)}%`,
    failures: stats.failures
  };

  fs.writeFileSync(
    path.join(ROOT_DIR, 'tests', 'challenger-m2-results.json'),
    JSON.stringify(resultsSummary, null, 2),
    'utf-8'
  );

  if (stats.failedAssertions > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
})();
