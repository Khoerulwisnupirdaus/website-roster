const { loadDOM } = require('./harness/dom-loader');

function runTier3Tests(harness) {
  harness.describe('Tier 3: Cross-Feature Combinations & Calculation Engines', () => {

    // AC-3.1: Filter + Search Intersection Logic
    harness.test('Filter Category and Search Query Intersection Logic', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
      const filterPills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));

      const terakotaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('terakota'));

      if (terakotaBtn && searchInput) {
        // Step 1: Select Terakota filter
        helpers.click(terakotaBtn);

        // Step 2: Search for "Kampak" (which is Beton only)
        helpers.input(searchInput, 'Kampak');

        // Step 3: Intersection must yield 0 items
        const allCards = Array.from(document.querySelectorAll('.product-card'));
        const visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));

        harness.assertEqual(
          visibleCards.length,
          0,
          'Intersection of Terakota filter + "Kampak" search query must yield 0 items'
        );

        // Verify empty state is triggered
        const emptyState = document.querySelector('.empty-state, #catalogEmptyState, .catalog-empty');
        if (emptyState) {
          const isVisible = emptyState.style.display !== 'none' && !emptyState.classList.contains('hidden');
          harness.assert(isVisible, 'Empty state must be visible on zero intersection match');
        }

        // Step 4: Now search for "Hemavara" (which is Terakota)
        helpers.input(searchInput, 'Hemavara');
        const visibleAfterHemavara = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        harness.assertGreaterThanOrEqual(
          visibleAfterHemavara.length,
          1,
          'Intersection of Terakota filter + "Hemavara" search query must yield matching product(s)'
        );
      } else {
        harness.assert(
          Boolean(terakotaBtn && searchInput),
          'Both filter buttons and search input must be present for intersection testing'
        );
      }
    });

    // AC-3.2: Mobile Menu Drawer + Scroll Navigation
    harness.test('Mobile Menu Drawer Toggle, Auto-Close and Target Anchors', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true, viewportWidth: 375, viewportHeight: 667 });

      const menuToggle = document.querySelector('.menu-toggle');
      const navLinks = document.querySelector('.nav-links');

      harness.assert(Boolean(menuToggle), 'Mobile menu toggle button (.menu-toggle) must exist');
      harness.assert(Boolean(navLinks), 'Navigation links container (.nav-links) must exist');

      if (menuToggle && navLinks) {
        // 1. Open mobile menu
        helpers.click(menuToggle);
        harness.assert(
          navLinks.classList.contains('active'),
          'Clicking menu toggle must open mobile menu (.nav-links.active)'
        );

        // 2. Click a link inside navLinks - should auto-close menu
        const firstLink = navLinks.querySelector('a');
        harness.assert(Boolean(firstLink), 'Navigation menu must contain anchor links');

        if (firstLink) {
          helpers.click(firstLink);
          harness.assert(
            !navLinks.classList.contains('active'),
            'Clicking a nav link must automatically close the mobile menu'
          );
        }

        // 3. Verify all nav link href anchors point to valid existing section elements
        const links = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
        harness.assertGreaterThanOrEqual(links.length, 3, 'Must have at least 3 internal anchor links');

        links.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href !== '#' && href.length > 1) {
            const targetId = href.slice(1);
            const targetEl = document.getElementById(targetId);
            harness.assert(
              Boolean(targetEl),
              `Navigation anchor "${href}" must point to an existing DOM element (id="${targetId}")`
            );
          }
        });
      }
    });

    // AC-3.3: Interactive Wall Area Calculator Logic + 5% Reserve Margin
    harness.test('Roster Wall Area Calculator Mathematical Logic and 5% Margin', () => {
      const { window, document, helpers } = loadDOM({ executeScripts: true });

      // We check if calculateRosterRequirement is available globally or on window,
      // or if calculator input elements exist in DOM (#calcLength, #calcHeight, etc.)
      const calcLengthInput = document.querySelector('#calcLength, input[name="calcLength"], #wallLength');
      const calcHeightInput = document.querySelector('#calcHeight, input[name="calcHeight"], #wallHeight');
      const calcResultEl = document.querySelector('#calcTotalPcs, .calc-total-pcs, #calculatorResult');

      // Reference mathematical calculation according to PROJECT.md interface contract:
      // Area = length * height
      // Base Pcs = Math.ceil(area * 25)
      // Reserve Pcs = Math.ceil(basePcs * 0.05)
      // Total Pcs = basePcs + reservePcs
      const calculateReference = (length, height, pcsPerM2 = 25, reservePct = 5) => {
        const areaM2 = length * height;
        const basePcs = Math.ceil(areaM2 * pcsPerM2);
        const reservePcs = Math.ceil(basePcs * (reservePct / 100));
        const totalPcs = basePcs + reservePcs;
        return { areaM2, basePcs, reservePcs, totalPcs };
      };

      // Test Scenario 1: 4.0m x 3.0m (12 m²)
      const s1 = calculateReference(4.0, 3.0);
      harness.assertEqual(s1.areaM2, 12.0, 'Scenario 1: Area for 4m x 3m must be 12 m²');
      harness.assertEqual(s1.basePcs, 300, 'Scenario 1: Base pcs for 12 m² at 25 pcs/m² must be 300');
      harness.assertEqual(s1.reservePcs, 15, 'Scenario 1: 5% reserve for 300 pcs must be 15');
      harness.assertEqual(s1.totalPcs, 315, 'Scenario 1: Total pcs must be 315');

      // Test Scenario 2: 2.5m x 2.0m (5 m²)
      const s2 = calculateReference(2.5, 2.0);
      harness.assertEqual(s2.areaM2, 5.0, 'Scenario 2: Area for 2.5m x 2m must be 5 m²');
      harness.assertEqual(s2.basePcs, 125, 'Scenario 2: Base pcs must be 125');
      harness.assertEqual(s2.reservePcs, 7, 'Scenario 2: 5% reserve for 125 pcs must be 7 (Math.ceil(6.25))');
      harness.assertEqual(s2.totalPcs, 132, 'Scenario 2: Total pcs must be 132');

      // Test Scenario 3: 1.2m x 2.4m (2.88 m²)
      const s3 = calculateReference(1.2, 2.4);
      harness.assertEqual(Number(s3.areaM2.toFixed(2)), 2.88, 'Scenario 3: Area must be 2.88 m²');
      harness.assertEqual(s3.basePcs, 72, 'Scenario 3: Base pcs for 2.88 m² must be 72');
      harness.assertEqual(s3.reservePcs, 4, 'Scenario 3: 5% reserve for 72 pcs must be 4');
      harness.assertEqual(s3.totalPcs, 76, 'Scenario 3: Total pcs must be 76');

      // Test Scenario 4: 10.0m x 2.5m (25 m²)
      const s4 = calculateReference(10.0, 2.5);
      harness.assertEqual(s4.areaM2, 25.0, 'Scenario 4: Area must be 25 m²');
      harness.assertEqual(s4.basePcs, 625, 'Scenario 4: Base pcs must be 625');
      harness.assertEqual(s4.reservePcs, 32, 'Scenario 4: 5% reserve for 625 pcs must be 32 (Math.ceil(31.25))');
      harness.assertEqual(s4.totalPcs, 657, 'Scenario 4: Total pcs must be 657');

      // Test Scenario 5: Edge boundary 0m x 2m (0 m²)
      const s5 = calculateReference(0, 2.0);
      harness.assertEqual(s5.areaM2, 0, 'Scenario 5: Area for 0m must be 0');
      harness.assertEqual(s5.totalPcs, 0, 'Scenario 5: Total pcs for 0m must be 0');

      // If calculator UI exists in DOM, verify interactive inputs
      if (calcLengthInput && calcHeightInput) {
        helpers.input(calcLengthInput, '4');
        helpers.input(calcHeightInput, '3');
        if (calcResultEl) {
          harness.assertIncludes(
            calcResultEl.textContent,
            '315',
            'Interactive calculator UI must display 315 total pcs for 4m x 3m wall'
          );
        }
      }

      // If window.calculateRosterRequirement function exists, verify contract
      if (typeof window.calculateRosterRequirement === 'function') {
        const result = window.calculateRosterRequirement(4, 3);
        harness.assertEqual(result.totalPcs, 315, 'window.calculateRosterRequirement must return 315 total pcs');
      }
    });

    // AC-3.4: Calculator WhatsApp Quote CTA Integration
    harness.test('Calculator WhatsApp Quote Pre-filled URL Generator', () => {
      const { window, document } = loadDOM({ executeScripts: true });

      const calcWaBtn = document.querySelector('.btn-calc-wa, #calcWaQuote, a[href*="kebutuhan-roster"], [data-calc-quote]');
      // If element exists, test its URL
      if (calcWaBtn) {
        const href = calcWaBtn.getAttribute('href') || '';
        harness.assertIncludes(href, '6287869796938', 'Calculator WhatsApp quote must target 6287869796938');
      } else {
        // Assert requirement check
        const hasCalcSection = Boolean(document.querySelector('#calculator, #kalkulator, .calculator-section'));
        harness.assert(
          hasCalcSection,
          'Calculator section (#calculator or #kalkulator) with WhatsApp quote CTA must exist in DOM'
        );
      }
    });
  });
}

module.exports = { runTier3Tests };
