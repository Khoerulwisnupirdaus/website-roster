const fs = require('fs');
const path = require('path');
const { CATALOG_PRODUCTS } = require('./catalog-data');
const { renderProductCard } = require('./catalog');

const cardsHtml = CATALOG_PRODUCTS.map(renderProductCard).join('\n\n');

const fullCatalogHtml = `
    <!-- Katalog Produk (Milestone 2: 37 Roster Items, Filter Chips, Live Search & Dynamic WA) -->
    <section id="katalog" class="catalog section-padding bg-light">
        <div class="container">
            <div class="section-header text-center">
                <span class="subtitle">Katalog Produk Roster</span>
                <h2>Koleksi Eksklusif Arsitektur</h2>
                <p>Pilihan terlengkap roster beton presisi dan terakota Plered untuk fasad tropis, partisi ruang, dan pagar modern.</p>
            </div>

            <!-- Interactive Catalog Controls -->
            <div class="catalog-controls">
                <!-- Live Search Bar -->
                <div class="catalog-search-wrap">
                    <i class="fas fa-search search-icon" aria-hidden="true"></i>
                    <input type="search" id="catalogSearch" class="catalog-search-input" placeholder="Cari motif roster, material, atau ukuran..." aria-label="Cari produk roster">
                    <button type="button" id="clearSearchBtn" class="clear-search-btn" aria-label="Bersihkan pencarian" style="display: none;">&times;</button>
                </div>

                <!-- Category & Material Filter Chips -->
                <div class="catalog-filters" role="tablist" aria-label="Kategori Roster">
                    <button type="button" class="filter-btn active" data-filter="all" role="tab" aria-selected="true">Semua (37)</button>
                    <button type="button" class="filter-btn" data-filter="beton" role="tab" aria-selected="false">Beton</button>
                    <button type="button" class="filter-btn" data-filter="terakota" role="tab" aria-selected="false">Terakota</button>
                    <button type="button" class="filter-btn" data-filter="geometris" role="tab" aria-selected="false">Geometris</button>
                    <button type="button" class="filter-btn" data-filter="flora" role="tab" aria-selected="false">Flora</button>
                    <button type="button" class="filter-btn" data-filter="3d" role="tab" aria-selected="false">3D</button>
                </div>
            </div>

            <!-- Result Counter -->
            <div class="catalog-meta-bar">
                <p class="result-count" id="resultCount">Menampilkan 37 dari 37 produk</p>
            </div>

            <!-- Empty State Container -->
            <div class="empty-state" id="catalogEmptyState" style="display: none;">
                <div class="empty-state-icon"><i class="fas fa-search-minus" aria-hidden="true"></i></div>
                <h4>Motif atau produk tidak ditemukan</h4>
                <p>Tidak ada roster yang cocok dengan kombinasi filter dan kata kunci pencarian Anda.</p>
                <button type="button" class="btn-primary btn-reset" id="resetSearchBtn">
                    <i class="fas fa-undo" aria-hidden="true"></i> Reset Filter &amp; Pencarian
                </button>
            </div>

            <!-- 37-Product Architectural Catalog Grid -->
            <div class="catalog-grid" id="catalogGrid">
${cardsHtml}
            </div>

            <!-- Section Wholesale Inquiry Banner -->
            <div style="text-align: center; margin-top: 3.5rem;">
                <a href="https://wa.me/6287869796938?text=Halo%20Sinar%20Minimalis%2C%20saya%20kontraktor%20%2F%20pemilik%20toko%20material%20%2F%20owner%20proyek.%20Saya%20tertarik%20dengan%20penawaran%20harga%20grosir%20roster%20Sinar%20Minimalis.%20Mohon%20info%20pricelist%20dan%20syarat%20kerja%20sama.%20Terima%20kasih." target="_blank" rel="noopener noreferrer" class="btn-wa-grosir" data-wa-type="wholesale" style="padding: 16px 40px; font-size: 1.1rem; border-radius: 50px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.4);">
                    <i class="fab fa-whatsapp" style="font-size: 1.3rem;" aria-hidden="true"></i>
                    Chat untuk Harga Grosir
                </a>
            </div>

        </div>
    </section>
`;

fs.writeFileSync(path.join(__dirname, 'catalog-markup.html'), fullCatalogHtml.trim(), 'utf-8');
console.log('Successfully generated catalog-markup.html with all 37 products!');
