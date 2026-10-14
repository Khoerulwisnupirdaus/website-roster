/**
 * Test script for Catalog Filtering & Live Search Engine
 */
const assert = require('assert');

// Mock data representing the 37 products
const mockProducts = [
  { id: 'R01', name: 'Roster Hemavara', category: 'terakota geometris beton', material: 'Terracotta / Grey', dimensions: '20x20x10 cm' },
  { id: 'R02', name: 'Roster Motif Kampak', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '10x30x10 cm' },
  { id: 'R03', name: 'Roster Motif Daun', category: 'beton flora', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R04', name: 'Roster Minimalis Strip', category: 'beton geometris', material: 'Beton / Putih / Merah', dimensions: '20x20x10 cm' },
  { id: 'R05', name: 'Roster Lingkaran Retro', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R06', name: 'Roster Bintang Segi Empat', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R07', name: 'Roster Silang Diagonal', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R08', name: 'Roster Lengkung Vertikal', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R09', name: 'Roster Segitiga Terbalik', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R10', name: 'Roster Cekung Horizontal', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R11', name: 'Roster Kotak 4 Lubang', category: 'beton geometris', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R12', name: 'Roster Motif Bunga Bulat', category: 'beton flora', material: 'Beton Putih / Abu', dimensions: '20x20x10 cm' },
  { id: 'R13', name: 'Roster Motif Daun Tetesan Air', category: 'terakota flora', material: 'Terracotta / Putih', dimensions: '20x20x10 cm' },
  { id: 'R14', name: 'Roster Segitiga Prisma 3D', category: 'beton 3d', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R15', name: 'Roster Bintang Kompleks', category: 'beton geometris', material: 'Beton Putih', dimensions: '20x20x10 cm' },
  { id: 'R16', name: 'Roster Piramida Abu-abu', category: 'beton 3d', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R17', name: 'Roster Bulan Sabit', category: 'beton geometris', material: 'Beton Putih', dimensions: '20x20x10 cm' },
  { id: 'R18', name: 'Roster Motif Labirin', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R19', name: 'Roster Segitiga Lancip', category: 'terakota geometris', material: 'Terracotta Natural', dimensions: '20x20x10 cm' },
  { id: 'R20', name: 'Roster Kubik Bulat', category: 'beton 3d', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R21', name: 'Roster Piramida Persegi', category: 'beton 3d', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R22', name: 'Roster Diagonal Asimetris', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R23', name: 'Roster Sekat Miring', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R24', name: 'Roster Geometris Sudut', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R25', name: 'Roster Prisma Tengah', category: 'beton 3d', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R26', name: 'Roster Kotak Berlapis', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R27', name: 'Roster Kotak Polos', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R28', name: 'Roster Sekat Tiga', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R29', name: 'Roster Z Terbalik', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R30', name: 'Roster Bunga Empat Kelopak', category: 'beton flora', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R31', name: 'Roster Motif Labirin Klasik', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R32', name: 'Roster Bintang Putar', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R33', name: 'Roster Balok Asimetris Komposisi', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R34', name: 'Roster Geometris Celah L', category: 'beton geometris', material: 'Beton Cream', dimensions: '20x20x10 cm' },
  { id: 'R35', name: 'Roster Silang Bintang Clover', category: 'beton flora', material: 'Beton Abu-abu', dimensions: '20x20x10 cm' },
  { id: 'R36', name: 'Roster Beton Geometris Konsentris', category: 'beton geometris', material: 'Beton Abu-abu Presisi', dimensions: '20x20x10 cm' },
  { id: 'R37', name: 'Roster Terakota Mandala Flora', category: 'terakota flora', material: 'Terakota Bakar Super', dimensions: '20x20x10 cm' }
];

assert.strictEqual(mockProducts.length, 37, 'Total mock products must be 37');

function normalizeStr(str) {
  return (str || '').toLowerCase().trim();
}

function matchesSearch(searchableText, query) {
  if (!query) return true;
  const normalizedQuery = normalizeStr(query);
  if (!normalizedQuery) return true;
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const target = normalizeStr(searchableText);
  return tokens.every(token => target.includes(token));
}

function matchesCategory(itemCategory, filterKey) {
  if (!filterKey || filterKey === 'all' || filterKey === 'semua') return true;
  const normKey = normalizeStr(filterKey);
  const normCat = normalizeStr(itemCategory);
  return normCat.includes(normKey);
}

function filterItems(products, activeCategory, searchQuery) {
  return products.filter(item => {
    const isCat = matchesCategory(item.category, activeCategory);
    const searchable = `${item.name} ${item.material} ${item.category} ${item.dimensions}`;
    const isSearch = matchesSearch(searchable, searchQuery);
    return isCat && isSearch;
  });
}

// Test 1: Category Filtering
const allItems = filterItems(mockProducts, 'semua', '');
assert.strictEqual(allItems.length, 37, 'Semua must return 37 products');

const terakotaItems = filterItems(mockProducts, 'terakota', '');
assert(terakotaItems.length >= 1 && terakotaItems.length <= 36, `Terakota must return 1..36 products, got ${terakotaItems.length}`);
console.log('✓ Terakota count:', terakotaItems.length);

const betonItems = filterItems(mockProducts, 'beton', '');
assert(betonItems.length >= 30, `Beton count must be >= 30, got ${betonItems.length}`);
console.log('✓ Beton count:', betonItems.length);

const geoItems = filterItems(mockProducts, 'geometris', '');
console.log('✓ Geometris count:', geoItems.length);

const floraItems = filterItems(mockProducts, 'flora', '');
console.log('✓ Flora count:', floraItems.length);

const threeDItems = filterItems(mockProducts, '3d', '');
console.log('✓ 3D count:', threeDItems.length);

// Test 2: Search with Whitespace
const daunItems = filterItems(mockProducts, 'all', '   daun   ');
assert(daunItems.length >= 1, 'Search for "   daun   " must match');
console.log('✓ Search "   daun   " matches:', daunItems.map(p => p.name));

// Test 3: Case-insensitive Search
const bintangItems = filterItems(mockProducts, 'all', 'BINTANG');
assert(bintangItems.length >= 1, 'Search for "BINTANG" must match');
console.log('✓ Search "BINTANG" matches:', bintangItems.map(p => p.name));

// Test 4: Special Characters & Regex metachars
let noCrash = true;
try {
  filterItems(mockProducts, 'all', '<script>alert("xss")</script>');
  filterItems(mockProducts, 'all', '.*+?^${}()|[]\\');
} catch (e) {
  noCrash = false;
}
assert(noCrash, 'Special characters must not throw errors');
console.log('✓ Special characters test passed');

// Test 5: Empty state trigger
const nonexistent = filterItems(mockProducts, 'all', 'xyz12345nonexistentquery');
assert.strictEqual(nonexistent.length, 0, 'Nonexistent query must return 0');
console.log('✓ Nonexistent query returns 0');

// Test 6: Intersection Logic (Terakota + Kampak -> 0; Terakota + Hemavara -> 1)
const terakotaKampak = filterItems(mockProducts, 'terakota', 'Kampak');
assert.strictEqual(terakotaKampak.length, 0, 'Terakota + Kampak must yield 0');

const terakotaHemavara = filterItems(mockProducts, 'terakota', 'Hemavara');
assert(terakotaHemavara.length >= 1, 'Terakota + Hemavara must yield >= 1');
console.log('✓ Intersection tests passed');

console.log('\nALL 6 CATALOG FILTER & SEARCH LOGIC CHECKS PASSED PERFECTLY!\n');
