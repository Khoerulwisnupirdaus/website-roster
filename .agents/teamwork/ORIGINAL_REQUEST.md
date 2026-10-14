# Original User Request

## 2026-10-13T13:00:12Z

Lakukan redesain menyeluruh dan modernisasi UI/UX untuk website katalog "Sinar Minimalis" (website roster) guna menciptakan tampilan arsitektur premium, meningkatkan interaktivitas pengguna, serta mengoptimalkan performa dan SEO.

Working directory: c:\Users\Hype G12\OneDrive\website roster
Integrity mode: development

## Requirements

### R1. Redesain Visual & Identitas Premium
Tingkatkan estetika visual website agar mencerminkan brand arsitektur roster premium yang elegan dan modern. Terapkan hierarki visual yang kuat, tipografi profesional, palet warna harmonis, serta mikro-interaksi dan animasi transisi yang halus di seluruh section (Hero, Tentang Kami, Katalog, Inspirasi Proyek, Alur Pemesanan, FAQ, Kontak).

### R2. Penyempurnaan Katalog Produk & Pengalaman Interaktif
Lengkapi seluruh item katalog produk (termasuk aset gambar roster yang tersedia di direktori `images/`) dengan presentasi yang rapi. Sediakan sistem penjelajahan katalog yang intuitif (seperti filter berdasarkan kategori/material/motif atau pencarian), preview gambar detail/lightbox resolusi tinggi, serta integrasi pemesanan WhatsApp yang seamless dan dinamis untuk tiap produk.

### R3. Optimalisasi Performa & Kecepatan Loading
Optimalkan pemuatan halaman dan aset (termasuk optimasi aset gambar, lazy loading, script bundling/minifikasi jika relevan) agar halaman memuat secara instan tanpa lag atau layout shift (CLS). Bebas menggunakan bundler atau alat modern bila terbukti meningkatkan efisiensi dan performa.

### R4. Responsivitas Multi-Device & Mobile-First Experience
Pastikan pengalaman pengguna sempurna dan proporsional di seluruh breakpoint layar (smartphone berbagai ukuran, tablet, laptop, dan monitor desktop layar lebar), termasuk kemudahan navigasi mobile, touch targets yang ramah jari, dan bottom navigation yang responsif.

### R5. SEO, Aksesibilitas, dan Clean Code
Lengkapi struktur metadata Open Graph, semantic HTML5, alt text deskriptif untuk setiap media, dan struktur heading yang ramah mesin pencari (SEO lokal Purwakarta / Jabodetabek). Pastikan tidak ada runtime console error, tautan rusak, atau file aset yang gagal dimuat.

## Acceptance Criteria

### Visual & Responsivitas
- [ ] Seluruh section website tampil proporsional tanpa horizontal scroll overflow pada viewport mobile (360px - 414px), tablet (768px - 1024px), dan desktop (1280px+).
- [ ] Tipografi, kontras warna, dan elemen visual konsisten di semua komponen.
- [ ] Semua animasi transisi berjalan lancar (minimal 60fps) tanpa stuttering.

### Fungsionalitas & Interaksi
- [ ] Seluruh varian produk yang memiliki aset gambar di direktori proyek tertata lengkap di katalog dengan informasi nama, material, dan harga yang jelas.
- [ ] Fitur filter/kategori atau pencarian katalog berfungsi akurat menyaring item produk secara instan.
- [ ] Modal lightbox atau preview detail gambar berfungsi dengan baik untuk setiap produk dengan tombol tutup/escape yang responsif.
- [ ] Form kontak dan tombol WhatsApp terhubung langsung ke nomor tujuan yang ditentukan (+62 878 6979 6938) dengan pesan teks pre-filled yang sesuai konteks aksi pengguna.

### Performa & Standar Kualitas
- [ ] Halaman web berjalan tanpa error atau warning kritis pada browser developer console.
- [ ] Tidak ada aset gambar atau font yang menghasilkan status HTTP 404.
- [ ] Skor audit Lighthouse / PageSpeed untuk kategori Performance, Accessibility, Best Practices, dan SEO berada pada standar tinggi (di atas 85 pada masing-masing kategori).
- [ ] Seluruh fungsionalitas utama teruji dan dapat dijalankan langsung di lingkungan lokal.


## Follow-up — 2026-10-13T15:07:51Z

The laptop rebooted/restarted. All files on disk are completely intact, and Milestone 2 worker (worker_m2_1) had successfully delivered handoff.md with all 37 products, catalog-data.js, catalog.js, index.html, style.css, and passing tests. Please resume execution from the current state in `.agents/teamwork/` and continue orchestrating Milestone 2 review/gate and subsequent milestones.
