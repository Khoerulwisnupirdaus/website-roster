const { JSDOM } = require('../../../tests/node_modules/jsdom');
const fs = require('fs');
const path = require('path');

const catalogHtml = fs.readFileSync(path.join(__dirname, 'catalog-markup.html'), 'utf-8');
const catalogDataCode = fs.readFileSync(path.join(__dirname, 'catalog-data.js'), 'utf-8');
const catalogEngineCode = fs.readFileSync(path.join(__dirname, 'catalog.js'), 'utf-8');

// Construct mock DOM
const fullHtml = `
<!DOCTYPE html>
<html lang="id">
<head><meta charset="UTF-8"><title>Test</title></head>
<body>
${catalogHtml}

<!-- Lightbox Modal -->
<div class="lightbox-overlay" id="lightbox" role="dialog" aria-modal="true" aria-label="Detail Produk Roster" style="display: none;">
    <button type="button" class="lightbox-close" aria-label="Tutup preview">&times;</button>
    <div class="lightbox-content">
        <img src="" alt="Preview">
        <div class="lightbox-info">
            <h3 class="lightbox-title"></h3>
            <div class="lightbox-specs"></div>
            <a href="https://wa.me/6287869796938" target="_blank" rel="noopener noreferrer" class="btn-primary btn-wa-order">
                Pesan Produk Ini via WhatsApp
            </a>
        </div>
    </div>
</div>

<script>${catalogDataCode}</script>
<script>${catalogEngineCode}</script>
</body>
</html>
`;

const dom = new JSDOM(fullHtml, { runScripts: 'dangerously' });
const { window } = dom;
const { document } = window;

// Trigger DOMContentLoaded
const evt = new window.Event('DOMContentLoaded');
document.dispatchEvent(evt);

console.log('--- M2 Verification Runner ---');

// 1. Inventory Count
const domCards = Array.from(document.querySelectorAll('.product-card'));
const windowCatalog = window.CATALOG_PRODUCTS || [];
console.log(`DOM Cards count: ${domCards.length}`);
console.log(`window.CATALOG_PRODUCTS count: ${windowCatalog.length}`);
if (domCards.length !== 37 || windowCatalog.length !== 37) {
  throw new Error(`Expected 37 items, got DOM=${domCards.length}, Window=${windowCatalog.length}`);
}

// 2. Asset strings check
const expectedAssets = [
  ...Array.from({ length: 35 }, (_, i) => `roster_${i + 1}`),
  'product_concrete',
  'product_terracotta'
];
const cardImageSources = domCards.map(c => c.querySelector('img').src).join(' ');
expectedAssets.forEach(asset => {
  if (!cardImageSources.includes(asset)) {
    throw new Error(`Asset missing from cards: ${asset}`);
  }
});
console.log('All 37 assets verified in DOM cards!');

// 3. Filter check
const filterPills = Array.from(document.querySelectorAll('.filter-btn'));
console.log(`Filter pills count: ${filterPills.length}`);
const terakotaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('terakota'));
terakotaBtn.click();
let visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
console.log(`Visible cards after Terakota filter: ${visibleCards.length}`);
if (visibleCards.length < 1 || visibleCards.length > 36) {
  throw new Error(`Expected between 1 and 36 visible cards for Terakota, got ${visibleCards.length}`);
}

const semuaBtn = filterPills.find(p => p.textContent.toLowerCase().includes('semua'));
semuaBtn.click();
visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
console.log(`Visible cards after Semua filter: ${visibleCards.length}`);
if (visibleCards.length !== 37) {
  throw new Error(`Expected 37 visible cards after Semua, got ${visibleCards.length}`);
}

// 4. Search check
const searchInput = document.querySelector('#catalogSearch');
searchInput.value = '   daun   ';
searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

// Simulate debounce delay
setTimeout(() => {
  visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
  console.log(`Visible cards after search "   daun   ": ${visibleCards.length}`);
  if (visibleCards.length < 1) {
    throw new Error(`Search for "   daun   " failed`);
  }

  // Corner case: Case-insensitive BINTANG
  searchInput.value = 'BINTANG';
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

  setTimeout(() => {
    visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
    console.log(`Visible cards after search "BINTANG": ${visibleCards.length}`);
    if (visibleCards.length < 1) {
      throw new Error(`Search for "BINTANG" failed`);
    }

    // Corner case: Regex special chars
    searchInput.value = '.*+?^${}()|[]\\';
    searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

    setTimeout(() => {
      // Empty state check
      const emptyState = document.querySelector('#catalogEmptyState');
      console.log(`Empty state display on regex non-match: ${emptyState.style.display}`);
      if (emptyState.style.display !== 'block') {
        throw new Error('Empty state should be displayed when no matches');
      }

      // Reset button
      const resetBtn = document.querySelector('#resetSearchBtn');
      resetBtn.click();
      visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
      console.log(`Visible cards after Reset click: ${visibleCards.length}`);
      if (visibleCards.length !== 37 || searchInput.value !== '') {
        throw new Error('Reset failed to restore all cards and clear search input');
      }

      // 5. Tier 3 Intersection test
      terakotaBtn.click();
      searchInput.value = 'Kampak';
      searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

      setTimeout(() => {
        visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
        console.log(`Visible cards for Terakota + Kampak: ${visibleCards.length}`);
        if (visibleCards.length !== 0) {
          throw new Error('Intersection of Terakota + Kampak must yield 0 items');
        }

        searchInput.value = 'Hemavara';
        searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));

        setTimeout(() => {
          visibleCards = domCards.filter(c => c.style.display !== 'none' && !c.classList.contains('hidden'));
          console.log(`Visible cards for Terakota + Hemavara: ${visibleCards.length}`);
          if (visibleCards.length < 1) {
            throw new Error('Intersection of Terakota + Hemavara must yield at least 1 item');
          }

          // 6. Lightbox test
          const lightbox = document.querySelector('#lightbox');
          const firstImg = document.querySelector('.product-card .product-img img');
          firstImg.click();

          console.log(`Lightbox active after click: ${lightbox.classList.contains('active')}`);
          console.log(`Document body overflow: ${document.body.style.overflow}`);
          const lbWa = lightbox.querySelector('.btn-wa-order');
          console.log(`Lightbox WA link: ${lbWa ? lbWa.href : 'NOT FOUND'}`);

          if (!lightbox.classList.contains('active') || document.body.style.overflow !== 'hidden' || !lbWa || !lbWa.href.includes('6287869796938')) {
            throw new Error('Lightbox activation failed');
          }

          // Escape dismiss
          document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
          console.log(`Lightbox closed after Escape: ${!lightbox.classList.contains('active')}`);
          console.log(`Body overflow restored: ${document.body.style.overflow === ''}`);
          if (lightbox.classList.contains('active') || document.body.style.overflow !== '') {
            throw new Error('Lightbox escape dismiss failed');
          }

          console.log('\n===========================================');
          console.log('ALL VERIFICATION CHECKS PASSED PERFECTLY!');
          console.log('===========================================');
        }, 50);
      }, 50);
    }, 50);
  }, 50);
}, 50);
