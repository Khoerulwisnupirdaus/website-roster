/**
 * DOM Simulation Test for Catalog Controls & Engine
 */
const { JSDOM } = require('../../../tests/node_modules/jsdom');
const assert = require('assert');

// Simulate HTML fragment with controls and 37 product cards
const sampleCardsHTML = `
  <section id="katalog" class="catalog section-padding bg-light">
    <div class="container">
      <div class="section-header text-center">
        <span class="subtitle">Katalog Produk</span>
        <h2>Koleksi Eksklusif Kami</h2>
        <p>Pilih desain roster yang sesuai dengan karakter bangunan Anda.</p>
      </div>

      <!-- Catalog Interactive Controls -->
      <div class="catalog-controls" id="catalogControls">
        <div class="catalog-search-wrap">
          <div class="catalog-search-box">
            <i class="fas fa-search search-icon" aria-hidden="true"></i>
            <input 
              type="search" 
              id="catalogSearch" 
              class="catalog-search-input" 
              placeholder="Cari motif roster, material (beton / terakota), ukuran 20x20..." 
              aria-label="Cari motif roster"
              autocomplete="off"
            >
            <button type="button" id="catalogSearchClear" class="search-clear-btn" aria-label="Hapus kata kunci pencarian" style="display: none;">
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <div class="catalog-filter-bar" role="toolbar" aria-label="Filter kategori roster">
          <div class="filter-pills-wrap" role="group" aria-label="Kategori produk">
            <button type="button" class="filter-pill filter-btn active" data-filter="all" aria-pressed="true">
              <span class="pill-dot"></span>
              <span>Semua</span>
              <span class="pill-count">37</span>
            </button>
            <button type="button" class="filter-pill filter-btn" data-filter="beton" aria-pressed="false">
              <span class="pill-dot"></span>
              <span>Beton</span>
              <span class="pill-count">34</span>
            </button>
            <button type="button" class="filter-pill filter-btn" data-filter="terakota" aria-pressed="false">
              <span class="pill-dot"></span>
              <span>Terakota</span>
              <span class="pill-count">4</span>
            </button>
            <button type="button" class="filter-pill filter-btn" data-filter="geometris" aria-pressed="false">
              <span class="pill-dot"></span>
              <span>Geometris</span>
              <span class="pill-count">26</span>
            </button>
            <button type="button" class="filter-pill filter-btn" data-filter="flora" aria-pressed="false">
              <span class="pill-dot"></span>
              <span>Flora</span>
              <span class="pill-count">6</span>
            </button>
            <button type="button" class="filter-pill filter-btn" data-filter="3d" aria-pressed="false">
              <span class="pill-dot"></span>
              <span>3D</span>
              <span class="pill-count">5</span>
            </button>
          </div>
        </div>

        <div class="catalog-meta-bar">
          <div class="catalog-counter result-count" id="resultCount" aria-live="polite">
            Menampilkan <strong id="visibleCount">37</strong> dari <span id="totalCount">37</span> produk
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div class="empty-state catalog-empty hidden" id="catalogEmptyState" style="display: none;" role="status">
        <div class="empty-state-card">
          <h3 class="empty-state-title">Motif tidak ditemukan</h3>
          <p class="empty-state-desc">Tidak ada produk yang cocok.</p>
          <button type="button" id="resetSearchBtn" class="btn-primary btn-reset btn-reset-catalog">
            Reset Filter & Pencarian
          </button>
        </div>
      </div>

      <!-- 37 Product Cards Grid -->
      <div class="catalog-grid" id="catalogGrid">
        <div class="product-card" data-id="R01" data-name="Roster Hemavara" data-category="terakota geometris beton" data-material="Terracotta / Grey" data-dimensions="20x20x10 cm">
          <div class="product-img"><img src="images/roster_1.jpg" alt="Roster Hemavara"></div>
          <div class="product-info"><h3>Roster Hemavara</h3><p class="material">Pilihan: Terracotta / Grey</p><p class="price">Rp 14.000</p></div>
        </div>
        <div class="product-card" data-id="R02" data-name="Roster Motif Kampak" data-category="beton geometris" data-material="Beton Abu-abu" data-dimensions="10x30x10 cm">
          <div class="product-img"><img src="images/roster_2.jpg" alt="Roster Kampak"></div>
          <div class="product-info"><h3>Roster Motif Kampak</h3><p class="material">Beton Abu-abu</p><p class="price">Rp 14.000</p></div>
        </div>
        <div class="product-card" data-id="R03" data-name="Roster Motif Daun" data-category="beton flora" data-material="Beton Abu-abu" data-dimensions="20x20x10 cm">
          <div class="product-img"><img src="images/roster_3.jpg" alt="Roster Daun"></div>
          <div class="product-info"><h3>Roster Motif Daun</h3><p class="material">Beton Abu-abu</p><p class="price">Rp 14.000</p></div>
        </div>
        <div class="product-card" data-id="R06" data-name="Roster Bintang Segi Empat" data-category="beton geometris" data-material="Beton Abu-abu" data-dimensions="20x20x10 cm">
          <div class="product-img"><img src="images/roster_6.jpg" alt="Roster Bintang"></div>
          <div class="product-info"><h3>Roster Bintang Segi Empat</h3><p class="material">Beton Abu-abu</p><p class="price">Rp 14.000</p></div>
        </div>
        <!-- 33 more cards -->
        ${Array.from({ length: 33 }, (_, i) => `
          <div class="product-card" data-id="R${String(i + 4).padStart(2, '0')}" data-name="Roster Varian ${i + 4}" data-category="beton geometris" data-material="Beton Abu-abu" data-dimensions="20x20x10 cm">
            <div class="product-img"><img src="images/roster_${i + 4}.png" alt="Roster ${i + 4}"></div>
            <div class="product-info"><h3>Roster Varian ${i + 4}</h3><p class="material">Beton Abu-abu</p><p class="price">Rp 14.000</p></div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
`;

// Engine code to be embedded in js/catalog.js
const catalogEngineCode = `
(function(window, document) {
  'use strict';

  var state = {
    activeCategory: 'all',
    searchQuery: ''
  };

  function normalize(str) {
    return (str || '').toLowerCase().trim();
  }

  function matchesCategory(cardCat, filterKey) {
    if (!filterKey || filterKey === 'all' || filterKey === 'semua') return true;
    var normKey = normalize(filterKey);
    var normCat = normalize(cardCat);
    return normCat.indexOf(normKey) !== -1;
  }

  function matchesSearch(text, query) {
    if (!query) return true;
    var normQuery = normalize(query);
    if (!normQuery) return true;
    var tokens = normQuery.split(/\\s+/).filter(Boolean);
    var target = normalize(text);
    for (var i = 0; i < tokens.length; i++) {
      if (target.indexOf(tokens[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function filterProducts(categoryKey, searchQuery) {
    if (categoryKey !== undefined) {
      state.activeCategory = normalize(categoryKey);
    }
    if (searchQuery !== undefined) {
      state.searchQuery = searchQuery.trim();
    }

    var cards = Array.from(document.querySelectorAll('.product-card'));
    var visibleCount = 0;

    cards.forEach(function(card) {
      var cat = card.getAttribute('data-category') || '';
      var title = (card.querySelector('h3') ? card.querySelector('h3').textContent : '') || card.getAttribute('data-name') || '';
      var material = (card.querySelector('.material') ? card.querySelector('.material').textContent : '') || card.getAttribute('data-material') || '';
      var dimensions = card.getAttribute('data-dimensions') || (card.querySelector('.dimensions') ? card.querySelector('.dimensions').textContent : '') || '';

      var searchable = title + ' ' + material + ' ' + cat + ' ' + dimensions;

      var catMatch = matchesCategory(cat, state.activeCategory);
      var searchMatch = matchesSearch(searchable, state.searchQuery);

      if (catMatch && searchMatch) {
        card.style.display = '';
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    // Update Result Counter
    var counterEl = document.querySelector('.result-count, #resultCount, [data-result-count], .catalog-counter');
    if (counterEl) {
      counterEl.textContent = 'Menampilkan ' + visibleCount + ' dari ' + cards.length + ' produk';
    }

    // Update Empty State
    var emptyState = document.querySelector('.empty-state, #catalogEmptyState, .catalog-empty');
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        emptyState.classList.remove('hidden');
      } else {
        emptyState.style.display = 'none';
        emptyState.classList.add('hidden');
      }
    }

    // Update Active Filter Pill
    var pills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));
    pills.forEach(function(pill) {
      var key = normalize(pill.getAttribute('data-filter') || pill.textContent);
      var isCurrent = (key === state.activeCategory) || 
                      (state.activeCategory === 'all' && (key === 'all' || key === 'semua')) ||
                      (state.activeCategory === 'semua' && (key === 'all' || key === 'semua'));
      if (isCurrent) {
        pill.classList.add('active');
        pill.setAttribute('aria-pressed', 'true');
      } else {
        pill.classList.remove('active');
        pill.setAttribute('aria-pressed', 'false');
      }
    });

    // Toggle Clear Search Button
    var clearBtn = document.getElementById('catalogSearchClear');
    if (clearBtn) {
      clearBtn.style.display = state.searchQuery ? 'flex' : 'none';
    }

    return visibleCount;
  }

  function resetSearchAndFilter() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    var searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
    if (searchInput) {
      searchInput.value = '';
    }
    filterProducts('all', '');
  }

  function initCatalogEngine() {
    var searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        filterProducts(state.activeCategory, e.target.value);
      });
      searchInput.addEventListener('change', function(e) {
        filterProducts(state.activeCategory, e.target.value);
      });
    }

    var filterPills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));
    filterPills.forEach(function(pill) {
      pill.addEventListener('click', function(e) {
        e.preventDefault();
        var key = pill.getAttribute('data-filter') || pill.textContent.trim().toLowerCase();
        filterProducts(key, state.searchQuery);
      });
    });

    var resetBtn = document.querySelector('#resetSearchBtn, .btn-reset, .btn-reset-catalog');
    if (resetBtn) {
      resetBtn.addEventListener('click', function(e) {
        e.preventDefault();
        resetSearchAndFilter();
      });
    }

    var clearBtn = document.getElementById('catalogSearchClear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (searchInput) searchInput.value = '';
        filterProducts(state.activeCategory, '');
      });
    }

    // Initial count update
    filterProducts('all', '');
  }

  // Export to window
  window.initCatalogEngine = initCatalogEngine;
  window.filterProducts = filterProducts;
  window.resetCatalogSearch = resetSearchAndFilter;

  window.catalogState = state;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogEngine);
  } else {
    initCatalogEngine();
  }
})(window, document);
`;

// Run test in JSDOM
const dom = new JSDOM(`<!DOCTYPE html><html><body>${sampleCardsHTML}</body></html>`, {
  runScripts: 'dangerously'
});

const { window } = dom;
const { document } = window;

// Inject engine code
try {
  window.eval(catalogEngineCode);
  // Trigger DOMContentLoaded just like dom-loader.js does
  const event = new window.Event('DOMContentLoaded');
  document.dispatchEvent(event);
  console.log('DEBUG: eval succeeded & DOMContentLoaded dispatched!');
} catch (e) {
  console.error('DEBUG: eval error:', e);
}

const helpers = {
  click(el) {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  },
  input(el, val) {
    el.value = val;
    el.dispatchEvent(new window.Event('input', { bubbles: true }));
    el.dispatchEvent(new window.Event('change', { bubbles: true }));
  }
};

console.log('Testing Tier 2 AC-2.1 & AC-2.2: Category Filter Pills');
const filterPills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));
assert(filterPills.length >= 5, `Expected >= 5 pills, found ${filterPills.length}`);
const filterTexts = filterPills.map(p => p.textContent.trim().toLowerCase());
['semua', 'beton', 'terakota'].forEach(cat => {
  assert(filterTexts.some(t => t.includes(cat)), `Filter buttons must include ${cat}`);
});

// Test click Terakota
const terakotaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('terakota'));
helpers.click(terakotaBtn);
let allCards = Array.from(document.querySelectorAll('.product-card'));
let visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
console.log('DEBUG: terakotaBtn found:', terakotaBtn ? terakotaBtn.outerHTML : 'null');
console.log('DEBUG: visibleCards.length after click:', visibleCards.length);
console.log('DEBUG: state.activeCategory:', window.catalogState ? window.catalogState.activeCategory : 'no state');
assert(visibleCards.length >= 1, 'Terakota must show >= 1');
assert(visibleCards.length <= 36, 'Terakota must filter out non-terakota');
console.log('✓ Terakota filter displays', visibleCards.length, 'cards');

// Test click Semua
const semuaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('semua'));
helpers.click(semuaBtn);
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert.strictEqual(visibleCards.length, allCards.length, 'Semua must restore all cards');
console.log('✓ Semua filter restores', visibleCards.length, 'cards');

// Test counter
const counterEl = document.querySelector('.result-count, #resultCount, [data-result-count], .catalog-counter');
assert(Boolean(counterEl), 'Counter must exist');
console.log('DEBUG: counterEl.textContent is:', counterEl.textContent);
assert(/\d+/.test(counterEl.textContent), 'Counter must contain numeric digits');
console.log('✓ Counter text:', counterEl.textContent);

console.log('\nTesting Tier 2 AC-2.3: Live Search Corner Cases');
const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
assert(Boolean(searchInput), 'Search input must exist');

// Corner case 1: "   daun   "
helpers.input(searchInput, '   daun   ');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert(visibleCards.length >= 1, '"   daun   " must match');
console.log('✓ "   daun   " matched', visibleCards.length);

// Corner case 2: "BINTANG"
helpers.input(searchInput, 'BINTANG');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert(visibleCards.length >= 1, '"BINTANG" must match');
console.log('✓ "BINTANG" matched', visibleCards.length);

// Corner case 3: Special characters
helpers.input(searchInput, '<script>alert("xss")</script>');
helpers.input(searchInput, '.*+?^${}()|[]\\\\');
console.log('✓ Special characters did not crash');

// Empty search
helpers.input(searchInput, '');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert.strictEqual(visibleCards.length, allCards.length, 'Empty search restores all');
console.log('✓ Empty search restores all');

console.log('\nTesting Tier 2 AC-2.3b: Empty State & Reset Button');
helpers.input(searchInput, 'xyz12345nonexistentquery');
const emptyState = document.querySelector('.empty-state, #catalogEmptyState, .catalog-empty');
assert(Boolean(emptyState), 'Empty state must exist');
const isVisible = emptyState.style.display !== 'none' && !emptyState.classList.contains('hidden');
assert(isVisible, 'Empty state must be visible');
console.log('✓ Empty state visible on 0 match');

const resetBtn = emptyState.querySelector('button, .btn-reset, #resetSearchBtn') || document.querySelector('#resetSearchBtn, .btn-reset-catalog');
assert(Boolean(resetBtn), 'Reset button must exist');
helpers.click(resetBtn);
assert.strictEqual(searchInput.value, '', 'Reset clears search input');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert.strictEqual(visibleCards.length, allCards.length, 'Reset restores all cards');
console.log('✓ Reset button restores all cards');

console.log('\nTesting Tier 3 AC-3.1: Intersection Logic');
helpers.click(terakotaBtn);
helpers.input(searchInput, 'Kampak');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert.strictEqual(visibleCards.length, 0, 'Terakota + Kampak yields 0');
assert(emptyState.style.display !== 'none' && !emptyState.classList.contains('hidden'), 'Empty state visible on 0 intersection');
console.log('✓ Terakota + Kampak yields 0 with empty state');

helpers.input(searchInput, 'Hemavara');
visibleCards = allCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
assert(visibleCards.length >= 1, 'Terakota + Hemavara yields >= 1');
console.log('✓ Terakota + Hemavara yields', visibleCards.length);

console.log('\nALL TIER 2 & TIER 3 DOM HARNESS ASSERTIONS PASSED WITH FLYING COLORS!\n');
