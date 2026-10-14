const { loadDOM } = require('./harness/dom-loader');

function runTier2Tests(harness) {
  harness.describe('Tier 2: Boundaries, Corners & Interactive Behaviors', () => {

    // AC-2.1 & AC-2.2: Category Filter Pills and Instant Filtering
    harness.test('Category Filter Pills and State Transitions', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      // Look for filter pills/buttons
      const filterPills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));
      harness.assertGreaterThanOrEqual(
        filterPills.length,
        5,
        `Expected at least 5 filter pills (Semua, Beton, Terakota, Geometris, Flora, 3D), found ${filterPills.length}`
      );

      const filterTexts = filterPills.map(p => p.textContent.trim().toLowerCase());
      const requiredCategories = ['semua', 'beton', 'terakota'];
      requiredCategories.forEach(cat => {
        const found = filterTexts.some(t => t.includes(cat));
        harness.assert(found, `Filter buttons must include category "${cat}"`);
      });

      // Find Terakota filter button
      const terakotaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('terakota'));
      if (terakotaBtn) {
        helpers.click(terakotaBtn);
        // After clicking Terakota, check visible cards
        const allCards = Array.from(document.querySelectorAll('.product-card'));
        const visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertGreaterThanOrEqual(
          visibleCards.length,
          1,
          'Filtering by Terakota must display at least 1 matching product'
        );
        harness.assertLessThanOrEqual(
          visibleCards.length,
          36,
          'Filtering by Terakota must filter out non-terracotta products'
        );
      }

      // Find Semua (All) button to restore
      const semuaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('semua'));
      if (semuaBtn) {
        helpers.click(semuaBtn);
        const allCards = Array.from(document.querySelectorAll('.product-card'));
        const visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertEqual(
          visibleCards.length,
          allCards.length,
          'Clicking "Semua" must restore all products'
        );
      }

      // Check result counter element
      const counterEl = document.querySelector('.result-count, #resultCount, [data-result-count], .catalog-counter');
      harness.assert(Boolean(counterEl), 'Catalog result count indicator must exist in DOM');
      if (counterEl) {
        harness.assertMatch(
          counterEl.textContent,
          /\d+/,
          'Result counter text must contain numeric product count'
        );
      }
    });

    // AC-2.3: Live Instant Search and Boundary Corner Inputs
    harness.test('Live Search Debounce, Corner Cases & Sanitization', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
      harness.assert(Boolean(searchInput), 'Catalog search input must exist in DOM');

      if (searchInput) {
        // Corner Case 1: Trailing & leading whitespace ("   daun   ")
        helpers.input(searchInput, '   daun   ');
        let cards = Array.from(document.querySelectorAll('.product-card'));
        let visible = cards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertGreaterThanOrEqual(
          visible.length,
          1,
          'Search for "   daun   " with whitespace must find matching product(s)'
        );

        // Corner Case 2: Case insensitivity ("BINTANG" vs "bintang")
        helpers.input(searchInput, 'BINTANG');
        cards = Array.from(document.querySelectorAll('.product-card'));
        visible = cards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertGreaterThanOrEqual(
          visible.length,
          1,
          'Search with uppercase "BINTANG" must match products'
        );

        // Corner Case 3: Adversarial special characters without crash
        let htmlTagsThrew = false;
        try {
          helpers.input(searchInput, '<script>alert("xss")</script>');
        } catch (e) {
          htmlTagsThrew = true;
        }
        harness.assert(
          !htmlTagsThrew,
          'Search input containing HTML tags must not throw runtime exception'
        );

        let specialCharsThrew = false;
        try {
          helpers.input(searchInput, '.*+?^${}()|[]\\');
        } catch (e) {
          specialCharsThrew = true;
        }
        harness.assert(
          !specialCharsThrew,
          'Search input containing regex meta-characters must not throw Regex syntax error'
        );

        // Clear search
        helpers.input(searchInput, '');
        cards = Array.from(document.querySelectorAll('.product-card'));
        visible = cards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertEqual(
          visible.length,
          cards.length,
          'Empty search string must restore all product cards'
        );
      }
    });

    // AC-2.3b: Search Empty State and Recovery Reset Button
    harness.test('Empty State Experience and Reset Recovery Button', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
      if (searchInput) {
        // Type nonexistent query
        helpers.input(searchInput, 'xyz12345nonexistentquery');

        const emptyState = document.querySelector('.empty-state, #catalogEmptyState, .catalog-empty');
        harness.assert(Boolean(emptyState), 'Empty state container must exist in DOM');

        if (emptyState) {
          // Verify empty state is displayed or active
          const isVisible = emptyState.style.display !== 'none' && !emptyState.classList.contains('hidden');
          harness.assert(isVisible, 'Empty state must be visible when zero products match');

          // Check reset button inside or associated with empty state
          const resetBtn = emptyState.querySelector('button, .btn-reset, #resetSearchBtn') ||
                           document.querySelector('#resetSearchBtn, .btn-reset-catalog');
          harness.assert(Boolean(resetBtn), 'Empty state must offer a Reset Filter & Pencarian button');

          if (resetBtn) {
            helpers.click(resetBtn);
            // After reset, search input should be cleared and cards restored
            harness.assertEqual(searchInput.value, '', 'Reset button must clear search input value');
            const cards = Array.from(document.querySelectorAll('.product-card'));
            const visible = cards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
            harness.assertEqual(
              visible.length,
              cards.length,
              'Reset button must restore all catalog products'
            );
          }
        }
      }
    });

    // AC-2.4: Lightbox Modal Functionality, Specs, Dismiss & Scroll Lock
    harness.test('Lightbox Modal Interactions, Dismiss Mechanisms and Scroll Lock', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const lightbox = document.querySelector('#lightbox, .lightbox-overlay, .modal-lightbox');
      harness.assert(Boolean(lightbox), 'Lightbox modal container (#lightbox) must exist in DOM');

      const firstProductImg = document.querySelector('.product-card .product-img img, .product-card img');
      harness.assert(Boolean(firstProductImg), 'At least one product image must exist to trigger lightbox');

      if (lightbox && firstProductImg) {
        // 1. Trigger lightbox
        helpers.click(firstProductImg);

        // Check active state
        const isActive = lightbox.classList.contains('active') ||
                         lightbox.style.display === 'block' ||
                         lightbox.style.display === 'flex';
        harness.assert(isActive, 'Clicking product image must activate lightbox modal');

        // Check scroll lock
        harness.assertEqual(
          document.body.style.overflow,
          'hidden',
          'Activating lightbox must set document.body.style.overflow to "hidden"'
        );

        // Check image src in lightbox
        const lbImg = lightbox.querySelector('img');
        harness.assert(Boolean(lbImg && lbImg.src), 'Lightbox must display the targeted product image');

        // Check title in lightbox
        const lbTitle = lightbox.querySelector('.lightbox-title, h3, h4');
        harness.assert(Boolean(lbTitle && lbTitle.textContent.trim().length > 0), 'Lightbox must display product title');

        // Check WhatsApp CTA in lightbox
        const lbWaBtn = lightbox.querySelector('a[href*="wa.me"], .btn-wa-order, .lightbox-wa');
        harness.assert(Boolean(lbWaBtn), 'Lightbox must provide a direct WhatsApp order button');
        if (lbWaBtn) {
          const href = lbWaBtn.getAttribute('href') || '';
          harness.assertIncludes(href, '6287869796938', 'Lightbox order link must target +62 878 6979 6938');
        }

        // 2. Dismiss via Escape key
        helpers.keydown(document, 'Escape');
        const closedAfterEsc = !lightbox.classList.contains('active') || lightbox.style.display === 'none';
        harness.assert(closedAfterEsc, 'Pressing Escape key must close the lightbox modal');
        harness.assertEqual(
          document.body.style.overflow,
          '',
          'Closing lightbox via Escape must restore body overflow'
        );

        // 3. Re-open and dismiss via Close Button
        helpers.click(firstProductImg);
        const closeBtn = lightbox.querySelector('.lightbox-close, .modal-close, button.close');
        harness.assert(Boolean(closeBtn), 'Lightbox must have a close button (.lightbox-close)');
        if (closeBtn) {
          helpers.click(closeBtn);
          const closedAfterBtn = !lightbox.classList.contains('active') || lightbox.style.display === 'none';
          harness.assert(closedAfterBtn, 'Clicking close button must close the lightbox modal');
        }

        // 4. Re-open and dismiss via Backdrop click
        helpers.click(firstProductImg);
        helpers.click(lightbox);
        const closedAfterBackdrop = !lightbox.classList.contains('active') || lightbox.style.display === 'none';
        harness.assert(closedAfterBackdrop, 'Clicking lightbox backdrop must close the modal');
      }
    });

    // AC-2.5: Dynamic WhatsApp URLs Across Workflows
    harness.test('Dynamic WhatsApp Order URLs Formulation and Target Number', () => {
      const { window, document } = loadDOM({ executeScripts: true });

      const TARGET_PHONE = '6287869796938';

      // 1. All WhatsApp links on the site
      const allWaLinks = Array.from(document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]'));
      harness.assertGreaterThanOrEqual(
        allWaLinks.length,
        5,
        `Expected at least 5 WhatsApp action links across the site, found ${allWaLinks.length}`
      );

      // Verify every WhatsApp link targets the official phone number
      allWaLinks.forEach(link => {
        const href = link.getAttribute('href') || '';
        harness.assertIncludes(
          href,
          TARGET_PHONE,
          `WhatsApp URL must target official number ${TARGET_PHONE} (Found: ${href})`
        );
      });

      // 2. Product Card Order CTAs
      const productOrderLinks = Array.from(document.querySelectorAll('.product-card a[href*="wa.me"]'));
      harness.assertGreaterThanOrEqual(
        productOrderLinks.length,
        1,
        'Product cards must contain WhatsApp order action links'
      );

      // Check if product card links contain encoded product information
      const hasDynamicParams = productOrderLinks.some(link => {
        const href = link.getAttribute('href') || '';
        return href.includes('text=') && (href.includes('%') || href.includes('Roster'));
      });
      harness.assert(
        hasDynamicParams,
        'Product card WhatsApp buttons must contain pre-filled product parameters in URL query'
      );

      // 3. Wholesale Button
      const wholesaleLinks = Array.from(document.querySelectorAll('.btn-wa-grosir, a[href*="grosir"], [data-wa-type="wholesale"]'));
      harness.assertGreaterThanOrEqual(
        wholesaleLinks.length,
        1,
        'Catalog or banners must include dedicated Wholesale ("Harga Grosir") WhatsApp CTA'
      );

      // 4. Floating WhatsApp Button
      const floatingWa = document.querySelector('.floating-wa, a.floating-whatsapp, #floatingWa');
      harness.assert(Boolean(floatingWa), 'Floating WhatsApp contact button must exist');
      if (floatingWa) {
        const href = floatingWa.getAttribute('href') || '';
        harness.assertIncludes(href, TARGET_PHONE, 'Floating WhatsApp button must target 6287869796938');
      }
    });

    // AC-2.6: Interactive Contact Form Forwarder
    harness.test('Contact Form Validation and WhatsApp Forwarding Engine', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const nameInput = document.getElementById('waName');
      const emailInput = document.getElementById('waEmail');
      const productSelect = document.getElementById('waProduct');
      const messageInput = document.getElementById('waMessage');
      const submitBtn = document.querySelector('#contactForm button[type="submit"], .btn-submit-wa, form button[type="submit"]');

      harness.assert(Boolean(nameInput), 'Contact form must have Name input (#waName)');
      harness.assert(Boolean(emailInput), 'Contact form must have Email input (#waEmail)');
      harness.assert(Boolean(productSelect), 'Contact form must have Product interest select (#waProduct)');
      harness.assert(Boolean(messageInput), 'Contact form must have Message input (#waMessage)');

      // Verify sendToWhatsApp function exists
      harness.assertEqual(
        typeof window.sendToWhatsApp,
        'function',
        'window.sendToWhatsApp function must be defined'
      );

      if (typeof window.sendToWhatsApp === 'function' && nameInput && emailInput && messageInput) {
        // Fill form fields
        nameInput.value = 'Budi Santoso';
        emailInput.value = 'budi@example.com';
        if (productSelect) productSelect.value = 'Roster Hemavara';
        messageInput.value = 'Butuh 300 pcs untuk proyek renovasi di Bekasi.';

        // Create mock event
        let prevented = false;
        const mockEvent = {
          preventDefault: () => { prevented = true; }
        };

        window.sendToWhatsApp(mockEvent);

        harness.assert(prevented, 'sendToWhatsApp must call event.preventDefault()');
        harness.assert(Boolean(window.lastOpenedUrl), 'sendToWhatsApp must trigger window.open with WhatsApp URL');

        if (window.lastOpenedUrl) {
          harness.assertIncludes(
            window.lastOpenedUrl,
            '6287869796938',
            'Contact form WhatsApp URL must target 6287869796938'
          );
          harness.assertIncludes(
            window.lastOpenedUrl,
            encodeURIComponent('Budi Santoso'),
            'Contact form WhatsApp URL must include encoded name'
          );
        }
      }
    });

    // AC-2.7: FAQ Accordion Toggle Interaction
    harness.test('FAQ Accordion Expand / Collapse Behaviors', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const faqItems = Array.from(document.querySelectorAll('.faq-item'));
      harness.assertGreaterThanOrEqual(
        faqItems.length,
        4,
        `FAQ section must contain at least 4 question items (Found: ${faqItems.length})`
      );

      if (faqItems.length >= 2) {
        const item1 = faqItems[0];
        const btn1 = item1.querySelector('.faq-question, button');
        const item2 = faqItems[1];
        const btn2 = item2.querySelector('.faq-question, button');

        if (btn1 && btn2) {
          // Click item 1
          helpers.click(btn1);
          harness.assert(
            item1.classList.contains('active'),
            'Clicking first FAQ question must activate item 1'
          );

          // Click item 2 - should close item 1
          helpers.click(btn2);
          harness.assert(
            item2.classList.contains('active'),
            'Clicking second FAQ question must activate item 2'
          );
          harness.assert(
            !item1.classList.contains('active'),
            'Activating item 2 must collapse previously active item 1'
          );
        }
      }
    });
  });
}

module.exports = { runTier2Tests };
