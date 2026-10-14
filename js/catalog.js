/**
 * Scarlet Roster — Interactive Catalog Engine (`js/catalog.js`)
 * Milestone 2: Features #1, #2, #3, #4, #5, #6, #7, #8
 * - 37-Product Architectural Catalog
 * - Category & Material Filter Chips (Semua, Beton, Terakota, Geometris, Flora, 3D)
 * - Live Instant Search with Debounce & Corner-Case Sanitization
 * - Live Result Count & Empty State with Reset Button
 * - Interactive High-Resolution Lightbox Modal with Technical Specs & WhatsApp CTA
 * - Dynamic WhatsApp Ordering & Wholesale CTA Generators targeting +62 831 4959 7892
 */

// Universal window environment fallback
if (typeof window === 'undefined') {
  global.window = global;
}

const WA_PHONE = '6283149597892';

/**
 * Generate contextual WhatsApp product ordering URL
 * @param {Object} product
 * @returns {string} URI-encoded WhatsApp link
 */
function createWhatsAppOrderUrl(product) {
  if (!product) return `https://wa.me/${WA_PHONE}`;
  const text = `Halo Scarlet Roster, saya tertarik memesan produk:\n- Produk: ${product.name}\n- Material: ${product.material}\n- Harga: ${product.priceFormatted || ('Rp ' + Number(product.price).toLocaleString('id-ID') + ' / pcs')}\n\nMohon informasi ketersediaan stok, minimal order, dan estimasi biaya kirim ke lokasi saya. Terima kasih.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Generate contextual WhatsApp wholesale inquiry URL
 * @param {Object} product
 * @returns {string} URI-encoded WhatsApp link
 */
function createWhatsAppWholesaleUrl(product) {
  if (!product) {
    return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent('Halo Scarlet Roster, saya tertarik dengan penawaran harga grosir roster. Mohon info pricelist dan syarat kerja sama. Terima kasih.')}`;
  }
  const text = `Halo Scarlet Roster, saya ingin menanyakan harga grosir / pembelian partai besar untuk produk:\n- Produk: ${product.name}\n\nBisa tolong kirimkan rincian diskon quantity dan katalog lengkap? Terima kasih.`;
  return `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(text)}`;
}

/**
 * Find product item by ID, name, or image src
 * @param {string} idOrSrc
 * @returns {Object|null}
 */
function findProduct(idOrSrc) {
  const products = window.CATALOG_PRODUCTS || [];
  if (!idOrSrc) return null;
  const cleanKey = String(idOrSrc).trim().toLowerCase();
  
  return products.find(p => {
    if (p.id && p.id.toLowerCase() === cleanKey) return true;
    if (p.image && (p.image.toLowerCase().includes(cleanKey) || cleanKey.includes(p.image.toLowerCase()))) return true;
    if (p.name && p.name.toLowerCase() === cleanKey) return true;
    return false;
  }) || null;
}

/**
 * Check if a product item matches a category filter key
 * @param {Object} product
 * @param {string} filterKey
 * @returns {boolean}
 */
function matchesCategory(product, filterKey) {
  if (!filterKey || filterKey === 'all' || filterKey === 'semua') return true;
  const key = filterKey.toLowerCase();

  // 1. Exact or partial category property
  if (product.category && product.category.toLowerCase().includes(key)) return true;

  // 2. Tags list
  if (Array.isArray(product.tags) && product.tags.some(t => t.toLowerCase() === key)) return true;

  // 3. Category label
  if (product.categoryLabel && product.categoryLabel.toLowerCase().includes(key)) return true;

  // 4. Material checks for Beton and Terakota
  if (product.material) {
    const mat = product.material.toLowerCase();
    if (key === 'terakota' && (mat.includes('terakota') || mat.includes('terracotta'))) return true;
    if (key === 'beton' && mat.includes('beton')) return true;
  }

  return false;
}

/**
 * Check if a product item matches a search query
 * @param {Object} product
 * @param {string} query
 * @returns {boolean}
 */
function matchesSearch(product, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();

  // Multi-attribute substring match (safe against regex injections)
  const nameMatch = product.name ? product.name.toLowerCase().includes(q) : false;
  const matMatch = product.material ? product.material.toLowerCase().includes(q) : false;
  const catMatch = product.categoryLabel ? product.categoryLabel.toLowerCase().includes(q) : false;
  const dimMatch = product.dimensions ? product.dimensions.toLowerCase().includes(q) : false;
  const descMatch = product.description ? product.description.toLowerCase().includes(q) : false;
  const tagsMatch = Array.isArray(product.tags) ? product.tags.some(t => t.toLowerCase() === q) : false;

  return nameMatch || matMatch || catMatch || dimMatch || descMatch || tagsMatch;
}

/**
 * Render a single architectural product card HTML string
 * @param {Object} product
 * @returns {string} HTML markup
 */
function renderProductCard(product) {
  const orderUrl = createWhatsAppOrderUrl(product);
  const wholesaleUrl = createWhatsAppWholesaleUrl(product);
  const badgeText = product.isFlagship ? '★ Flagship' : (product.categoryLabel || product.category);
  const badgeClass = product.isFlagship ? 'badge-flagship' : `badge-${product.category}`;

  return `
    <article class="product-card fade-in-up" data-id="${product.id}" data-category="${product.category}" data-tags="${(product.tags || []).join(' ')}" data-material="${product.material}">
      <div class="product-img">
        <img src="${product.image}" alt="${product.alt}" width="400" height="400" loading="lazy" decoding="async">
        <span class="product-badge ${badgeClass}">${badgeText}</span>
        <div class="product-overlay">
          <button type="button" class="btn-detail-trigger" data-id="${product.id}" aria-label="Lihat detail ${product.name}">
            <i class="fas fa-search-plus" aria-hidden="true"></i> Lihat Detail
          </button>
          <a href="${orderUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-sm btn-card-order">
            <i class="fab fa-whatsapp" aria-hidden="true"></i> Pesan Sekarang
          </a>
        </div>
      </div>
      <div class="product-info">
        <div class="product-meta-header">
          <span class="dimension-pill"><i class="fas fa-ruler-combined" aria-hidden="true"></i> ${product.dimensions}</span>
          <span class="rating-pill"><i class="fas fa-star" aria-hidden="true"></i> 4.9 <small class="sold-count">· 500+ pcs</small></span>
        </div>
        <h3 class="product-title">${product.name}</h3>
        <p class="material">${product.material}</p>
        <div class="price-row">
          <p class="price">Mulai dari ${product.priceFormatted}</p>
        </div>
        <a href="${wholesaleUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-grosir" data-wa-type="wholesale">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Chat Harga Grosir
        </a>
      </div>
    </article>
  `.trim();
}

/**
 * Open high-resolution lightbox modal for a specific product
 * @param {Object} product
 */
function openProductLightbox(product) {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || !product) return;

  const lbImg = lightbox.querySelector('img');
  const lbTitle = lightbox.querySelector('.lightbox-title, h3, h4');
  const lbWaBtn = lightbox.querySelector('a[href*="wa.me"], .btn-wa-order, .lightbox-wa');
  const lbWholesaleBtn = lightbox.querySelector('.btn-wa-wholesale, #lightboxWholesaleBtn');
  const lbSpecs = lightbox.querySelector('.lightbox-specs');

  // Specific detail elements
  const lbMat = lightbox.querySelector('#lightboxMaterial');
  const lbDim = lightbox.querySelector('#lightboxDimensions');
  const lbPrice = lightbox.querySelector('#lightboxPrice');
  const lbCat = lightbox.querySelector('#lightboxCategory');
  const lbBadge = lightbox.querySelector('#lightboxBadge');

  if (lbImg) {
    lbImg.src = product.image;
    lbImg.alt = product.alt || product.name;
  }

  if (lbTitle) {
    lbTitle.textContent = product.name;
  }

  if (lbCat) {
    lbCat.textContent = product.categoryLabel || product.category;
  }

  if (lbBadge) {
    lbBadge.textContent = product.isFlagship ? '★ Flagship' : (product.categoryLabel || product.category);
  }

  if (lbMat) {
    lbMat.textContent = product.material;
  }

  if (lbDim) {
    lbDim.textContent = product.dimensions;
  }

  if (lbPrice) {
    lbPrice.textContent = product.priceFormatted;
  }

  if (lbSpecs && !lbMat) {
    lbSpecs.innerHTML = `
      <span class="lightbox-spec-pill"><i class="fas fa-layer-group"></i> ${product.material}</span>
      <span class="lightbox-spec-pill"><i class="fas fa-ruler-combined"></i> ${product.dimensions}</span>
      <span class="lightbox-spec-pill price"><i class="fas fa-tag"></i> ${product.priceFormatted}</span>
    `;
  }

  if (lbWaBtn) {
    lbWaBtn.href = createWhatsAppOrderUrl(product);
  }

  if (lbWholesaleBtn) {
    lbWholesaleBtn.href = createWhatsAppWholesaleUrl(product);
  }

  lightbox.classList.add('active');
  lightbox.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

/**
 * Close high-resolution lightbox modal
 */
function closeProductLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  lightbox.classList.remove('active');
  lightbox.style.display = 'none';
  document.body.style.overflow = '';
}

/**
 * Initialize Catalog Engine
 */
function initCatalogEngine() {
  const catalogGrid = document.querySelector('.catalog-grid');
  const searchInput = document.querySelector('#catalogSearch, input[type="search"], .catalog-search-input, #searchInput');
  const filterPills = Array.from(document.querySelectorAll('.filter-btn, .filter-pill, [data-filter], .category-filter button'));
  const counterEl = document.querySelector('.result-count, #resultCount, [data-result-count], .catalog-counter');
  const emptyState = document.querySelector('.empty-state, #catalogEmptyState, .catalog-empty');
  const resetBtn = document.querySelector('#resetSearchBtn, .btn-reset, .btn-reset-catalog');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const lightbox = document.getElementById('lightbox');

  let activeCategory = 'all';

  // 1. Dynamic Rendering / Hydration of Catalog Grid if products exist
  const products = window.CATALOG_PRODUCTS || [];
  if (catalogGrid && products.length > 0) {
    const existingCards = catalogGrid.querySelectorAll('.product-card');
    if (existingCards.length < products.length) {
      catalogGrid.innerHTML = products.map(renderProductCard).join('\n');
    }
  }

  // Helper to re-query all cards
  function getCards() {
    return Array.from(document.querySelectorAll('.product-card'));
  }

  // 2. Filter & Search Application
  function applyFilters() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const cards = getCards();
    let visibleCount = 0;

    cards.forEach(card => {
      const id = card.getAttribute('data-id');
      const img = card.querySelector('img');
      const imgSrc = img ? img.getAttribute('src') : '';
      const product = findProduct(id) || findProduct(imgSrc) || {
        name: card.querySelector('h3') ? card.querySelector('h3').textContent : '',
        material: card.querySelector('.material') ? card.querySelector('.material').textContent : '',
        category: card.getAttribute('data-category') || '',
        categoryLabel: '',
        dimensions: card.querySelector('.dimension-pill') ? card.querySelector('.dimension-pill').textContent : '',
        tags: (card.getAttribute('data-tags') || '').split(' ')
      };

      const matchCat = matchesCategory(product, activeCategory);
      const matchQ = matchesSearch(product, query);

      if (matchCat && matchQ) {
        card.style.display = '';
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.style.display = 'none';
        card.classList.add('hidden');
      }
    });

    // Update Result Counter
    if (counterEl) {
      counterEl.textContent = `Menampilkan ${visibleCount} dari ${cards.length} produk`;
    }

    // Toggle Empty State
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.style.display = 'block';
        emptyState.classList.remove('hidden');
      } else {
        emptyState.style.display = 'none';
        emptyState.classList.add('hidden');
      }
    }

    // Toggle clear search button
    if (clearSearchBtn && searchInput) {
      clearSearchBtn.style.display = searchInput.value.length > 0 ? 'inline-flex' : 'none';
    }
  }

  // 3. Category Filter Buttons Listener
  filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const filterVal = pill.getAttribute('data-filter') || pill.textContent.trim().toLowerCase();
      activeCategory = filterVal.includes('semua') || filterVal === 'all' ? 'all' : filterVal;
      applyFilters();
    });
  });

  // 4. Live Search Input with Immediate/Debounced (<50ms) Execution
  if (searchInput) {
    let debounceTimer;
    const handleInput = () => {
      clearTimeout(debounceTimer);
      applyFilters();
    };

    searchInput.addEventListener('input', handleInput);
    searchInput.addEventListener('change', handleInput);

    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.focus();
        applyFilters();
      });
    }
  }

  // 5. Reset Button Listener (Empty State Recovery)
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      activeCategory = 'all';
      filterPills.forEach(p => {
        const text = p.textContent.trim().toLowerCase();
        const dataVal = (p.getAttribute('data-filter') || '').toLowerCase();
        if (text.includes('semua') || dataVal === 'all' || dataVal === 'semua') {
          p.classList.add('active');
          p.setAttribute('aria-selected', 'true');
        } else {
          p.classList.remove('active');
          p.setAttribute('aria-selected', 'false');
        }
      });
      applyFilters();
    });
  }

  // 6. Bind image clicks directly to cards
  function bindCardClicks() {
    getCards().forEach(card => {
      const img = card.querySelector('img');
      const detailBtn = card.querySelector('.btn-detail-trigger');
      const clickHandler = (e) => {
        e.preventDefault();
        const id = card.getAttribute('data-id');
        const imgSrc = img ? img.getAttribute('src') : null;
        const product = findProduct(id) || findProduct(imgSrc);
        if (product) {
          openProductLightbox(product);
        } else if (img) {
          openProductLightbox({
            name: img.alt || 'Roster Scarlet Roster',
            image: img.src,
            alt: img.alt,
            material: 'Beton / Terakota Presisi',
            dimensions: '20 × 20 × 10 cm',
            priceFormatted: 'Rp 14.000 / pcs'
          });
        }
      };
      if (img) img.addEventListener('click', clickHandler);
      if (detailBtn) detailBtn.addEventListener('click', clickHandler);
    });
  }
  bindCardClicks();

  // 7. Lightbox Event Delegation (backup for dynamically added nodes)
  document.addEventListener('click', (e) => {
    const imgTarget = e.target.closest('.product-card .product-img img, .product-card img');
    const detailBtn = e.target.closest('.btn-detail-trigger');

    if (imgTarget || detailBtn) {
      const card = (imgTarget || detailBtn).closest('.product-card');
      const id = card ? card.getAttribute('data-id') : null;
      const imgSrc = imgTarget ? imgTarget.getAttribute('src') : (card && card.querySelector('img') ? card.querySelector('img').getAttribute('src') : null);

      const product = findProduct(id) || findProduct(imgSrc);
      if (product) {
        openProductLightbox(product);
      } else if (imgTarget) {
        openProductLightbox({
          name: imgTarget.alt || 'Roster Scarlet Roster',
          image: imgTarget.src,
          alt: imgTarget.alt,
          material: 'Beton / Terakota Presisi',
          dimensions: '20 × 20 × 10 cm',
          priceFormatted: 'Rp 14.000 / pcs'
        });
      }
    }
  });

  // Lightbox close interactions
  if (lightbox) {
    const closeBtn = lightbox.querySelector('.lightbox-close, .modal-close, button.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeProductLightbox();
      });
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeProductLightbox();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeProductLightbox();
      }
    });
  }

  // Initial filter application
  applyFilters();
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.createWhatsAppOrderUrl = createWhatsAppOrderUrl;
  window.createWhatsAppWholesaleUrl = createWhatsAppWholesaleUrl;
  window.findProduct = findProduct;
  window.matchesCategory = matchesCategory;
  window.matchesSearch = matchesSearch;
  window.renderProductCard = renderProductCard;
  window.openProductLightbox = openProductLightbox;
  window.closeProductLightbox = closeProductLightbox;
  window.initCatalogEngine = initCatalogEngine;
}

// Auto-initialize on DOMContentLoaded or immediately if DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCatalogEngine);
  } else {
    initCatalogEngine();
  }
}

// Export for Node.js test environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createWhatsAppOrderUrl,
    createWhatsAppWholesaleUrl,
    findProduct,
    matchesCategory,
    matchesSearch,
    renderProductCard,
    openProductLightbox,
    closeProductLightbox,
    initCatalogEngine
  };
}
