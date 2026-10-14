#!/usr/bin/env node

/**
 * Adversarial Stress & Verification Test Runner for Milestone 2
 * Focus: Catalog Data, Live Search Attacks, Filter State Transitions,
 *        Empty State Recovery, Lightbox Modal, and WhatsApp CTAs.
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('./node_modules/jsdom');

const ROOT_DIR = path.resolve(__dirname, '..');
const HTML_PATH = path.join(ROOT_DIR, 'index.html');
const CATALOG_DATA_PATH = path.join(ROOT_DIR, 'js', 'catalog-data.js');
const CATALOG_JS_PATH = path.join(ROOT_DIR, 'js', 'catalog.js');
const RESULTS_PATH = path.join(__dirname, 'milestone2-stress-results.json');

// Load modules
const { CATALOG_PRODUCTS } = require(CATALOG_DATA_PATH);
const catalogEngine = require(CATALOG_JS_PATH);

class ChallengerHarness {
  constructor() {
    this.currentSuite = '';
    this.currentTest = '';
    this.results = {
      timestamp: new Date().toISOString(),
      verdict: 'PENDING',
      summary: {
        totalSuites: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalAssertions: 0,
        passedAssertions: 0,
        failedAssertions: 0,
        executionTimeMs: 0
      },
      metrics: {},
      failures: []
    };
    this.startTime = Date.now();
  }

  describe(suiteName, fn) {
    this.currentSuite = suiteName;
    this.results.summary.totalSuites++;
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
    fn();
  }

  test(testName, fn) {
    this.currentTest = testName;
    this.results.summary.totalTests++;
    const t0 = Date.now();
    let testPassed = true;
    const initialFailures = this.results.failures.length;

    try {
      fn();
      if (this.results.failures.length > initialFailures) {
        testPassed = false;
      }
    } catch (err) {
      testPassed = false;
      this.assert(false, `Unexpected crash in "${testName}": ${err.message}`);
    }

    const duration = Date.now() - t0;
    if (testPassed) {
      this.results.summary.passedTests++;
      console.log(`  \x1b[32m✔\x1b[0m ${testName} \x1b[90m(${duration}ms)\x1b[0m`);
    } else {
      this.results.summary.failedTests++;
      console.log(`  \x1b[31m✖\x1b[0m ${testName} \x1b[90m(${duration}ms)\x1b[0m`);
    }
  }

  assert(condition, message, details = {}) {
    this.results.summary.totalAssertions++;
    if (Boolean(condition)) {
      this.results.summary.passedAssertions++;
    } else {
      this.results.summary.failedAssertions++;
      const failureObj = {
        suite: this.currentSuite,
        test: this.currentTest,
        message,
        details
      };
      this.results.failures.push(failureObj);
      console.log(`    \x1b[31mASSERTION FAILED:\x1b[0m ${message}`);
    }
  }

  assertEqual(actual, expected, message) {
    const passed = actual === expected;
    this.assert(passed, message || `Expected ${JSON.stringify(actual)} === ${JSON.stringify(expected)}`, { expected, actual });
  }

  assertGreaterThanOrEqual(actual, expected, message) {
    const passed = actual >= expected;
    this.assert(passed, message || `Expected ${actual} >= ${expected}`, { expected, actual });
  }

  finish() {
    this.results.summary.executionTimeMs = Date.now() - this.startTime;
    this.results.verdict = this.results.failures.length === 0 ? 'CONFIRM_CORRECTNESS' : 'REJECT';
    return this.results;
  }
}

/**
 * Creates an isolated JSDOM environment for catalog tests
 */
function createCatalogDOM() {
  const htmlContent = fs.readFileSync(HTML_PATH, 'utf-8');
  const dom = new JSDOM(htmlContent, {
    url: 'http://localhost:3000/',
    contentType: 'text/html',
    runScripts: 'outside-only',
    beforeParse(win) {
      win.innerWidth = 1280;
      win.innerHeight = 800;
      win.scrollTo = () => {};
      if (win.performance && !win.performance.getEntriesByType) {
        win.performance.getEntriesByType = () => [];
      }
    }
  });

  const { window } = dom;
  const { document } = window;

  // Provide catalog data & functions in window
  window.CATALOG_PRODUCTS = CATALOG_PRODUCTS;
  Object.assign(window, catalogEngine);

  // Initialize catalog engine
  window.initCatalogEngine();

  // Helper methods
  const helpers = {
    dom,
    window,
    document,
    getCards: () => Array.from(document.querySelectorAll('.product-card')),
    getVisibleCards: () => {
      const cards = Array.from(document.querySelectorAll('.product-card'));
      return cards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
    },
    clickFilter: (filterKey) => {
      const pills = Array.from(document.querySelectorAll('.filter-btn'));
      const target = pills.find(p => {
        const val = p.getAttribute('data-filter') || p.textContent.toLowerCase();
        return val.toLowerCase() === filterKey.toLowerCase();
      });
      if (!target) throw new Error(`Filter pill not found for key: ${filterKey}`);
      target.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
      return target;
    },
    inputSearch: (query) => {
      const input = document.getElementById('catalogSearch');
      if (!input) throw new Error('Search input #catalogSearch not found');
      input.value = query;
      input.dispatchEvent(new window.Event('input', { bubbles: true }));
      return input;
    },
    clickReset: () => {
      const resetBtn = document.getElementById('resetSearchBtn');
      if (!resetBtn) throw new Error('Reset button #resetSearchBtn not found');
      resetBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
      return resetBtn;
    },
    clickClearSearch: () => {
      const clearBtn = document.getElementById('clearSearchBtn');
      if (!clearBtn) throw new Error('Clear search button #clearSearchBtn not found');
      clearBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
      return clearBtn;
    },
    getResultCountText: () => {
      const el = document.getElementById('resultCount');
      return el ? el.textContent.trim() : '';
    },
    isEmptyStateVisible: () => {
      const el = document.getElementById('catalogEmptyState');
      if (!el) return false;
      return el.style.display !== 'none' && !el.classList.contains('hidden');
    },
    getLightbox: () => document.getElementById('lightbox'),
    isLightboxOpen: () => {
      const lb = document.getElementById('lightbox');
      if (!lb) return false;
      return lb.classList.contains('active') && lb.style.display === 'flex';
    }
  };

  return helpers;
}

// MAIN RUNNER
async function runMilestone2StressTests() {
  const harness = new ChallengerHarness();

  console.log('=============================================================');
  console.log('   CHALLENGER M2-1: ADVERSARIAL STRESS TEST SUITE            ');
  console.log('   Target: Catalog Data, Live Search, Filters, Lightbox      ');
  console.log('=============================================================');

  // =========================================================================
  // SUITE 1: Data Model Contract & Physical Asset Integrity
  // =========================================================================
  harness.describe('Suite 1: Data Model Contract & Invariants', () => {
    harness.test('1.1: Exact 37-Product Inventory Count', () => {
      harness.assertEqual(CATALOG_PRODUCTS.length, 37, 'Catalog must contain exactly 37 product items');
    });

    harness.test('1.2: Mandatory Schema Fields for Every Product', () => {
      const requiredFields = [
        'id', 'name', 'category', 'categoryLabel', 'tags',
        'material', 'dimensions', 'price', 'priceFormatted',
        'image', 'alt', 'description', 'isFlagship'
      ];

      CATALOG_PRODUCTS.forEach((p, idx) => {
        requiredFields.forEach(field => {
          harness.assert(
            p[field] !== undefined && p[field] !== null,
            `Product #${idx + 1} (${p.id || 'unnamed'}) must have field "${field}"`
          );
        });
        harness.assert(Array.isArray(p.tags) && p.tags.length > 0, `Product ${p.id} must have non-empty tags array`);
        harness.assert(typeof p.price === 'number' && p.price > 0, `Product ${p.id} price must be positive number`);
        harness.assert(typeof p.isFlagship === 'boolean', `Product ${p.id} isFlagship must be boolean`);
      });
    });

    harness.test('1.3: Product ID Uniqueness and Sequence', () => {
      const ids = CATALOG_PRODUCTS.map(p => p.id);
      const uniqueIds = new Set(ids);
      harness.assertEqual(uniqueIds.size, 37, 'All 37 product IDs must be unique');

      for (let i = 1; i <= 37; i++) {
        const expectedId = `R${String(i).padStart(2, '0')}`;
        harness.assert(uniqueIds.has(expectedId), `Inventory must contain ID ${expectedId}`);
      }
    });

    harness.test('1.4: Filesystem Image Asset Validation for All 37 Products', () => {
      CATALOG_PRODUCTS.forEach(p => {
        const imgPath = path.join(ROOT_DIR, p.image);
        const exists = fs.existsSync(imgPath);
        harness.assert(exists, `Image asset for ${p.id} must exist on disk: ${p.image}`);
        if (exists) {
          const stats = fs.statSync(imgPath);
          harness.assert(stats.size > 1000, `Image asset ${p.image} must not be empty (size: ${stats.size} bytes)`);
        }
      });
    });

    harness.test('1.5: Pricing and Dimensions Invariants', () => {
      CATALOG_PRODUCTS.forEach(p => {
        harness.assert(p.price >= 14000 && p.price <= 16000, `Product ${p.id} price ${p.price} must be within Rp 14.000 - 16.000`);
        harness.assert(p.priceFormatted.startsWith('Rp '), `Product ${p.id} formatted price must start with "Rp "`);
        harness.assert(/\d+\s*×\s*\d+\s*×\s*\d+\s*cm/.test(p.dimensions), `Product ${p.id} dimensions format must match standard pattern`);
      });
    });

    harness.test('1.6: Flagship Products Specification', () => {
      const flagships = CATALOG_PRODUCTS.filter(p => p.isFlagship);
      harness.assertEqual(flagships.length, 2, 'Exactly 2 products must be marked as Flagship');
      const concrete = flagships.find(p => p.image.includes('product_concrete'));
      const terracotta = flagships.find(p => p.image.includes('product_terracotta'));
      harness.assert(Boolean(concrete), 'Flagship product_concrete.png must exist');
      harness.assert(Boolean(terracotta), 'Flagship product_terracotta.png must exist');
    });

    harness.test('1.7: Category Distribution Invariants', () => {
      const catDistribution = {};
      CATALOG_PRODUCTS.forEach(p => {
        catDistribution[p.category] = (catDistribution[p.category] || 0) + 1;
      });
      harness.results.metrics.categoryDistribution = catDistribution;
      harness.assert(catDistribution.terakota >= 2, 'Terakota category must have at least 2 items');
      harness.assert(catDistribution.geometris >= 10, 'Geometris category must have at least 10 items');
      harness.assert(catDistribution.flora >= 3, 'Flora category must have at least 3 items');
      harness.assert(catDistribution['3d'] >= 3, '3D category must have at least 3 items');
    });
  });

  // =========================================================================
  // SUITE 2: Search Input Attacks, Edge Cases & Sanitization Vectors
  // =========================================================================
  harness.describe('Suite 2: Search Input Attacks & Edge Cases', () => {
    harness.test('2.1: Regex Metacharacters Injection Attacks', () => {
      const env = createCatalogDOM();
      const regexVectors = [
        '.*+?^${}()|[]\\',
        '(',
        '[',
        '\\',
        '*',
        '+',
        '?',
        '^$',
        '(a|b)*',
        '(?=.*a)',
        '^.*$',
        '\\d+',
        '[a-z]{3}',
        'Roster.*',
        '^Roster',
        'Roster$'
      ];

      regexVectors.forEach(vec => {
        let threw = false;
        try {
          env.inputSearch(vec);
        } catch (e) {
          threw = true;
        }
        harness.assert(!threw, `Search with regex vector "${vec}" must not throw exception`);

        const visible = env.getVisibleCards();
        // Specifically check that wildcards do NOT match everything
        if (vec === '.*' || vec === 'Roster.*' || vec === '^Roster' || vec === 'Roster$') {
          harness.assert(
            visible.length === 0,
            `Regex attack "${vec}" must be treated literally (expected 0 matches, got ${visible.length})`
          );
        }
        // Lone unclosed group '(' should safely match the 2 Flagship products that literally contain '(Flagship)'
        if (vec === '(') {
          harness.assertEqual(visible.length, 2, `Literal '(' search must match the 2 items with '(Flagship)' in name`);
        }
      });
    });

    harness.test('2.2: HTML / XSS Injection Vectors', () => {
      const env = createCatalogDOM();
      const xssVectors = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert(1)>',
        '<svg/onload=alert(1)>',
        '"><script src="evil.js"></script>',
        'javascript:alert(1)',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<style>body{display:none}</style>'
      ];

      xssVectors.forEach(vec => {
        let threw = false;
        try {
          env.inputSearch(vec);
        } catch (e) {
          threw = true;
        }
        harness.assert(!threw, `Search with XSS vector "${vec}" must not crash`);

        // Assert no script tags were injected into DOM
        const scripts = env.document.querySelectorAll('script[src="evil.js"]');
        harness.assertEqual(scripts.length, 0, `XSS vector "${vec}" must not inject script tags`);

        const visible = env.getVisibleCards();
        harness.assertEqual(visible.length, 0, `XSS attack vector "${vec}" must yield 0 matches`);
        harness.assert(env.isEmptyStateVisible(), `XSS vector "${vec}" must trigger empty state`);
      });
    });

    harness.test('2.3: Whitespace, Tabs, and Padding Boundary Conditions', () => {
      const env = createCatalogDOM();

      // Leading & trailing spaces: '   daun   '
      env.inputSearch('   daun   ');
      let visible = env.getVisibleCards();
      harness.assert(visible.length >= 1, 'Search for "   daun   " with excessive padding must find matching product(s)');
      harness.assertEqual(visible.length, 2, 'Search for "daun" matches R03 and R35');

      // Tabs and newlines: '\t\ndaun\r\n'
      env.inputSearch('\t\ndaun\r\n');
      visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 2, 'Search with tabs & newlines must trim and match 2 products');

      // Pure whitespace: '     '
      env.inputSearch('     ');
      visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 37, 'Search with only whitespace must be treated as empty and show all 37 products');

      // Empty string: ''
      env.inputSearch('');
      visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 37, 'Empty string search must show all 37 products');
    });

    harness.test('2.4: Non-matching Gibberish, SQLi, and Large String Invariants', () => {
      const env = createCatalogDOM();

      // Random non-matching string
      env.inputSearch('xyz12345nonexistent');
      harness.assertEqual(env.getVisibleCards().length, 0, 'Gibberish string must yield 0 results');
      harness.assert(env.isEmptyStateVisible(), 'Gibberish string must display empty state');

      // 1000 character string stress test
      const largeString = 'a'.repeat(1000);
      const t0 = Date.now();
      env.inputSearch(largeString);
      const latency1000 = Date.now() - t0;
      harness.assertEqual(env.getVisibleCards().length, 0, '1000-character input must yield 0 results');
      harness.assert(latency1000 < 50, `1000-char search latency (${latency1000}ms) must be < 50ms`);

      // SQL Injection patterns
      const sqliVectors = [
        "' OR '1'='1",
        "'; DROP TABLE products; --",
        "1' ORDER BY 1--+",
        "admin'--"
      ];
      sqliVectors.forEach(sql => {
        env.inputSearch(sql);
        harness.assertEqual(env.getVisibleCards().length, 0, `SQLi vector "${sql}" must safely return 0 results`);
      });

      // Special symbols and Unicode / Emojis
      const unicodeVectors = ['磚', 'قالب', '🧱', '✨', 'éèê', 'üöä'];
      unicodeVectors.forEach(u => {
        let threw = false;
        try {
          env.inputSearch(u);
        } catch (e) {
          threw = true;
        }
        harness.assert(!threw, `Unicode search "${u}" must not crash`);
      });
    });

    harness.test('2.5: Multi-Attribute & Case-Insensitive Search Matching', () => {
      const env = createCatalogDOM();

      // Case insensitivity
      env.inputSearch('BINTANG');
      const upperCount = env.getVisibleCards().length;
      env.inputSearch('bintang');
      const lowerCount = env.getVisibleCards().length;
      env.inputSearch('bInTaNg');
      const mixedCount = env.getVisibleCards().length;
      harness.assertEqual(upperCount, lowerCount, 'Upper and lower case query counts must match');
      harness.assertEqual(upperCount, mixedCount, 'Mixed case query count must match');
      harness.assert(upperCount >= 2, 'Search "bintang" should match at least 2 star motif items');

      // Match by Name: 'Hemavara'
      env.inputSearch('Hemavara');
      let visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 1, 'Search "Hemavara" must match exactly 1 item (R01)');
      harness.assertEqual(visible[0].getAttribute('data-id'), 'R01', 'Matching card must be R01');

      // Match by Dimensions: '10 × 30'
      env.inputSearch('10 × 30');
      visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 1, 'Search "10 × 30" must match R02 (Motif Kampak 10x30)');

      // Match by Description keyword: 'kubisme'
      env.inputSearch('kubisme');
      visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 1, 'Search "kubisme" must match R33 Balok Asimetris');
    });
  });

  // =========================================================================
  // SUITE 3: Filter State Transitions & Intersection Matrices
  // =========================================================================
  harness.describe('Suite 3: Filter State Transitions & Combinations', () => {
    harness.test('3.1: Sequential Filter Pills Traversal and Counts', () => {
      const env = createCatalogDOM();

      const expectedCounts = {
        'all': 37,
        'beton': 35,
        'terakota': 4,
        'geometris': 25,
        'flora': 6,
        '3d': 6
      };

      for (const [filterKey, expectedCount] of Object.entries(expectedCounts)) {
        env.clickFilter(filterKey);
        const visible = env.getVisibleCards();
        harness.assertEqual(
          visible.length,
          expectedCount,
          `Filter pill "${filterKey}" must display exactly ${expectedCount} products`
        );

        // Check active class and aria-selected
        const activePills = Array.from(env.document.querySelectorAll('.filter-btn.active'));
        harness.assertEqual(activePills.length, 1, 'Exactly one filter pill must be active');
        harness.assertEqual(
          activePills[0].getAttribute('aria-selected'),
          'true',
          'Active filter pill must have aria-selected="true"'
        );

        // Check counter text
        const counterText = env.getResultCountText();
        harness.assert(
          counterText.includes(`Menampilkan ${expectedCount} dari 37 produk`),
          `Counter text must say "Menampilkan ${expectedCount} dari 37 produk" (Got: "${counterText}")`
        );
      }
    });

    harness.test('3.2: Rapid Sequential Filter Switching Stress (120 Iterations)', () => {
      const env = createCatalogDOM();
      const keys = ['all', 'beton', 'terakota', 'geometris', 'flora', '3d'];
      const iterations = 120;

      const t0 = Date.now();
      for (let i = 0; i < iterations; i++) {
        const key = keys[i % keys.length];
        env.clickFilter(key);
      }
      const totalDuration = Date.now() - t0;
      const avgDuration = totalDuration / iterations;

      harness.results.metrics.filterStress = {
        iterations,
        totalDurationMs: totalDuration,
        avgLatencyMsPerOp: Number(avgDuration.toFixed(3))
      };

      harness.assert(
        avgDuration < 10,
        `Average filter transition latency (${avgDuration.toFixed(2)}ms) must be < 10ms`
      );

      // Final state should be '3d'
      const visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 6, 'Final filter state after 120 cycles must be stable (6 items for 3D)');
    });

    harness.test('3.3: Filter + Search Intersection Attacks (Adversarial Matrices)', () => {
      const env = createCatalogDOM();

      // INTERSECTION 1: Terakota + 'Kampak' -> 0 products (Empty State)
      env.clickFilter('terakota');
      env.inputSearch('Kampak');
      let visible = env.getVisibleCards();
      harness.assertEqual(
        visible.length,
        0,
        'Intersection of Filter "Terakota" + Search "Kampak" must yield 0 results'
      );
      harness.assert(env.isEmptyStateVisible(), 'Empty state must be visible for Terakota + Kampak');
      harness.assertEqual(
        env.getResultCountText(),
        'Menampilkan 0 dari 37 produk',
        'Result counter must read "Menampilkan 0 dari 37 produk"'
      );

      // INTERSECTION 2: Beton + 'Kampak' -> 1 product (R02 Kampak)
      env.clickFilter('beton');
      visible = env.getVisibleCards();
      harness.assertEqual(
        visible.length,
        1,
        'Intersection of Filter "Beton" + Search "Kampak" must match 1 item (R02)'
      );
      harness.assertEqual(visible[0].getAttribute('data-id'), 'R02', 'Matching item must be R02');
      harness.assert(!env.isEmptyStateVisible(), 'Empty state must be hidden when results exist');

      // INTERSECTION 3: Flora + 'Daun' -> 2 products (R03 & R35)
      env.clickFilter('flora');
      env.inputSearch('Daun');
      visible = env.getVisibleCards();
      harness.assertEqual(
        visible.length,
        2,
        'Intersection of Filter "Flora" + Search "Daun" must match 2 items'
      );

      // INTERSECTION 4: Terakota + 'Mandala' -> 1 product (R37 Flagship)
      env.clickFilter('terakota');
      env.inputSearch('Mandala');
      visible = env.getVisibleCards();
      harness.assertEqual(
        visible.length,
        1,
        'Intersection of Filter "Terakota" + Search "Mandala" must match Flagship R37'
      );
      harness.assertEqual(visible[0].getAttribute('data-id'), 'R37', 'Matching product must be R37');

      // INTERSECTION 5: 3D + 'Hemavara' (Terakota item) -> 0 products
      env.clickFilter('3d');
      env.inputSearch('Hemavara');
      visible = env.getVisibleCards();
      harness.assertEqual(
        visible.length,
        0,
        'Intersection of Filter "3D" + Search "Hemavara" must yield 0 results'
      );
      harness.assert(env.isEmptyStateVisible(), 'Empty state must be visible for 3D + Hemavara');
    });
  });

  // =========================================================================
  // SUITE 4: Empty State Visibility & Reset Recovery
  // =========================================================================
  harness.describe('Suite 4: Empty State & Reset Recovery Workflows', () => {
    harness.test('4.1: Empty State DOM Structure and Elements', () => {
      const env = createCatalogDOM();
      const emptyState = env.document.getElementById('catalogEmptyState');
      harness.assert(Boolean(emptyState), 'Empty state element #catalogEmptyState must exist');

      const icon = emptyState.querySelector('.empty-state-icon i, i.fa-search-minus');
      harness.assert(Boolean(icon), 'Empty state must have an icon');

      const title = emptyState.querySelector('h4');
      harness.assert(Boolean(title && title.textContent.trim().length > 0), 'Empty state must have a headline');

      const resetBtn = env.document.getElementById('resetSearchBtn');
      harness.assert(Boolean(resetBtn), 'Reset button #resetSearchBtn must exist');
    });

    harness.test('4.2: Reset Button Execution and Full State Restoration', () => {
      const env = createCatalogDOM();

      // 1. Induce empty state via Terakota + 'Kampak'
      env.clickFilter('terakota');
      env.inputSearch('Kampak');
      harness.assertEqual(env.getVisibleCards().length, 0, 'Precondition: 0 items visible');
      harness.assert(env.isEmptyStateVisible(), 'Precondition: Empty state is visible');

      // 2. Click Reset button
      env.clickReset();

      // 3. Verify complete restoration
      const visible = env.getVisibleCards();
      harness.assertEqual(visible.length, 37, 'Clicking Reset must restore all 37 products');
      harness.assert(!env.isEmptyStateVisible(), 'Empty state must be hidden after Reset');

      const searchInput = env.document.getElementById('catalogSearch');
      harness.assertEqual(searchInput.value, '', 'Search input must be cleared to empty string');

      const activePill = env.document.querySelector('.filter-btn.active');
      harness.assert(Boolean(activePill), 'An active filter pill must be set');
      const activeFilter = activePill ? (activePill.getAttribute('data-filter') || activePill.textContent.toLowerCase()) : '';
      harness.assert(
        activeFilter === 'all' || activeFilter.includes('semua'),
        `Active filter pill must be reset to "all" / "semua" (Got: "${activeFilter}")`
      );

      const counterText = env.getResultCountText();
      harness.assertEqual(
        counterText,
        'Menampilkan 37 dari 37 produk',
        'Result counter must read "Menampilkan 37 dari 37 produk"'
      );
    });

    harness.test('4.3: Clear Search Button (Input X Button) Workflow', () => {
      const env = createCatalogDOM();
      const clearBtn = env.document.getElementById('clearSearchBtn');
      harness.assert(Boolean(clearBtn), 'Clear search button #clearSearchBtn must exist');

      // Filter to Terakota first
      env.clickFilter('terakota');
      harness.assertEqual(env.getVisibleCards().length, 4, 'Terakota has 4 items');

      // Type search
      env.inputSearch('Hemavara');
      harness.assertEqual(env.getVisibleCards().length, 1, 'Search narrowed to 1 item');
      harness.assert(
        clearBtn.style.display !== 'none',
        'Clear search button must be visible when query exists'
      );

      // Click clear search button
      env.clickClearSearch();
      const searchInput = env.document.getElementById('catalogSearch');
      harness.assertEqual(searchInput.value, '', 'Search input value must be cleared by clear button');
      harness.assertEqual(
        env.getVisibleCards().length,
        4,
        'Clearing search should restore products matching the currently active Terakota filter (4 items)'
      );

      // Active pill must still be Terakota
      const activePill = env.document.querySelector('.filter-btn.active');
      const activeFilter = activePill.getAttribute('data-filter') || '';
      harness.assertEqual(activeFilter, 'terakota', 'Clearing search must preserve current category filter');
    });
  });

  // =========================================================================
  // SUITE 5: Lightbox Interactions & WhatsApp Link Generation
  // =========================================================================
  harness.describe('Suite 5: Lightbox Modal & WhatsApp Parameters', () => {
    harness.test('5.1: Traversal of All 37 Products in Lightbox Modal', () => {
      const env = createCatalogDOM();
      const TARGET_PHONE = '6287869796938';

      CATALOG_PRODUCTS.forEach(product => {
        // Open lightbox
        catalogEngine.openProductLightbox(product);

        // Verify active and display
        harness.assert(env.isLightboxOpen(), `Lightbox must open for product ${product.id}`);

        // Verify scroll lock
        harness.assertEqual(
          env.document.body.style.overflow,
          'hidden',
          `Body scroll must be locked to "hidden" when viewing ${product.id}`
        );

        // Verify modal content
        const lb = env.getLightbox();
        const lbImg = lb.querySelector('img');
        const lbTitle = lb.querySelector('.lightbox-title, h3, h4');
        const lbWaOrder = lb.querySelector('#lightboxWaBtn, .lightbox-wa');
        const lbWaWholesale = lb.querySelector('#lightboxWholesaleBtn, .btn-wa-wholesale');

        harness.assertEqual(lbImg.src, product.image, `Lightbox image src must match ${product.image}`);
        harness.assertEqual(lbTitle.textContent.trim(), product.name, `Lightbox title must match ${product.name}`);

        // Verify Order WA URL
        harness.assert(Boolean(lbWaOrder), `Order WhatsApp button must exist in modal for ${product.id}`);
        if (lbWaOrder) {
          const orderHref = lbWaOrder.getAttribute('href');
          harness.assert(orderHref.includes(TARGET_PHONE), `Order WA link must target phone ${TARGET_PHONE}`);
          harness.assert(orderHref.includes(encodeURIComponent(product.name)), `Order WA link must include encoded name for ${product.id}`);
        }

        // Verify Wholesale WA URL
        harness.assert(Boolean(lbWaWholesale), `Wholesale WhatsApp button must exist in modal for ${product.id}`);
        if (lbWaWholesale) {
          const wholesaleHref = lbWaWholesale.getAttribute('href');
          harness.assert(wholesaleHref.includes(TARGET_PHONE), `Wholesale WA link must target phone ${TARGET_PHONE}`);
          harness.assert(wholesaleHref.includes(encodeURIComponent(product.name)), `Wholesale WA link must include encoded name for ${product.id}`);
        }

        // Close lightbox
        catalogEngine.closeProductLightbox();
        harness.assert(!env.isLightboxOpen(), `Lightbox must be closed after closeProductLightbox()`);
        harness.assertEqual(
          env.document.body.style.overflow,
          '',
          `Body scroll lock must be restored to "" after closing ${product.id}`
        );
      });
    });

    harness.test('5.2: Lightbox Dismiss Mechanisms (Escape, Close Button, Backdrop)', () => {
      const env = createCatalogDOM();
      const product = CATALOG_PRODUCTS[0];

      // Mechanism 1: Escape keydown
      catalogEngine.openProductLightbox(product);
      harness.assert(env.isLightboxOpen(), 'Lightbox is open');
      env.document.dispatchEvent(new env.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      harness.assert(!env.isLightboxOpen(), 'Pressing Escape must close the lightbox');
      harness.assertEqual(env.document.body.style.overflow, '', 'Escape must restore body scroll');

      // Mechanism 2: Close Button click
      catalogEngine.openProductLightbox(product);
      const closeBtn = env.document.getElementById('lightboxClose') || env.document.querySelector('.lightbox-close');
      harness.assert(Boolean(closeBtn), 'Lightbox close button must exist');
      closeBtn.dispatchEvent(new env.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      harness.assert(!env.isLightboxOpen(), 'Clicking close button must close the lightbox');
      harness.assertEqual(env.document.body.style.overflow, '', 'Close button must restore body scroll');

      // Mechanism 3: Backdrop click
      catalogEngine.openProductLightbox(product);
      const lb = env.getLightbox();
      lb.dispatchEvent(new env.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      harness.assert(!env.isLightboxOpen(), 'Clicking modal backdrop must close the lightbox');
      harness.assertEqual(env.document.body.style.overflow, '', 'Backdrop click must restore body scroll');
    });

    harness.test('5.3: Card DOM Click Delegation', () => {
      const env = createCatalogDOM();
      const firstCard = env.getCards()[0];
      const img = firstCard.querySelector('img');
      const detailBtn = firstCard.querySelector('.btn-detail-trigger');

      // Click card image
      img.dispatchEvent(new env.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      harness.assert(env.isLightboxOpen(), 'Clicking product card image must open lightbox');
      catalogEngine.closeProductLightbox();

      // Click "Lihat Detail" button
      detailBtn.dispatchEvent(new env.window.MouseEvent('click', { bubbles: true, cancelable: true }));
      harness.assert(env.isLightboxOpen(), 'Clicking "Lihat Detail" button must open lightbox');
      catalogEngine.closeProductLightbox();
    });
  });

  // =========================================================================
  // SUITE 6: Quantitative Performance & Stress Benchmark
  // =========================================================================
  harness.describe('Suite 6: Quantitative Performance & Robustness Metrics', () => {
    harness.test('6.1: High-Frequency Search Typing Simulation (100 Keystrokes)', () => {
      const env = createCatalogDOM();
      const testQueries = [
        'r', 'ro', 'ros', 'rost', 'roste', 'roster',
        'roster ', 'roster b', 'roster be', 'roster bet', 'roster beton',
        'h', 'he', 'hem', 'hema', 'hemav', 'hemava', 'hemavar', 'hemavara',
        'k', 'ka', 'kam', 'kamp', 'kampa', 'kampak',
        'd', 'da', 'dau', 'daun',
        '2', '20', '20 ', '20 x', '20 ×', '20 × ', '20 × 2', '20 × 20'
      ];

      const t0 = Date.now();
      let keystrokeCount = 0;
      for (let i = 0; i < 100; i++) {
        const q = testQueries[i % testQueries.length];
        env.inputSearch(q);
        keystrokeCount++;
      }
      const totalSearchDuration = Date.now() - t0;
      const avgSearchLatency = totalSearchDuration / keystrokeCount;

      harness.results.metrics.searchStress = {
        keystrokes: keystrokeCount,
        totalDurationMs: totalSearchDuration,
        avgLatencyMsPerKeystroke: Number(avgSearchLatency.toFixed(3))
      };

      harness.assert(
        avgSearchLatency < 5,
        `Average search keystroke latency (${avgSearchLatency.toFixed(2)}ms) must be < 5ms`
      );
    });

    harness.test('6.2: DOM Card Count Invariance Across All Operations', () => {
      const env = createCatalogDOM();
      const allCards = env.getCards();
      harness.assertEqual(allCards.length, 37, 'Total product cards in DOM must remain exactly 37');
    });
  });

  // =========================================================================
  // SUMMARY & REPORT GENERATION
  // =========================================================================
  const finalResults = harness.finish();

  console.log('\n=============================================================');
  console.log('                 STRESS TEST EXECUTION VERDICT               ');
  console.log('=============================================================');
  console.log(`  Suites Executed     : ${finalResults.summary.totalSuites}`);
  console.log(`  Test Cases Total    : ${finalResults.summary.totalTests} (Passed: ${finalResults.summary.passedTests}, Failed: ${finalResults.summary.failedTests})`);
  console.log(`  Total Assertions    : ${finalResults.summary.totalAssertions}`);
  console.log(`  Assertions Passed   : \x1b[32m${finalResults.summary.passedAssertions}\x1b[0m`);
  console.log(`  Assertions Failed   : ${finalResults.summary.failedAssertions > 0 ? `\x1b[31m${finalResults.summary.failedAssertions}\x1b[0m` : '0'}`);
  console.log(`  Pass Rate           : ${((finalResults.summary.passedAssertions / finalResults.summary.totalAssertions) * 100).toFixed(1)}%`);
  console.log(`  Execution Time      : ${finalResults.summary.executionTimeMs}ms`);
  console.log(`  VERDICT             : \x1b[1m${finalResults.verdict === 'CONFIRM_CORRECTNESS' ? '\x1b[32mCONFIRM_CORRECTNESS' : '\x1b[31mREJECT'}\x1b[0m`);
  console.log('=============================================================');

  // Save metrics and results JSON
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(finalResults, null, 2), 'utf-8');
  console.log(`\nDetailed stress test results saved to: ${RESULTS_PATH}`);

  return finalResults;
}

runMilestone2StressTests().then(res => {
  if (res.summary.failedAssertions > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch(err => {
  console.error('STRESS TEST RUNNER CRASHED:', err);
  process.exit(1);
});
