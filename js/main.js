document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. Navbar Scroll Effect & Sticky Glassmorphism =====
    const navbar = document.querySelector('.navbar');
    
    function updateNavbarScroll() {
        if (!navbar) return;
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
            if (!navLinks || !navLinks.classList.contains('active')) {
                navbar.classList.remove('scrolled');
            }
        }
    }
    window.addEventListener('scroll', updateNavbarScroll, { passive: true });
    updateNavbarScroll();

    // ===== 2. Accessible Mobile Menu Drawer & Backdrop Overlay =====
    const menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('navLinks') || document.querySelector('.nav-links');
    const navBackdrop = document.getElementById('navBackdrop') || document.querySelector('.nav-backdrop');

    function openMobileMenu() {
        if (!navLinks || !menuToggle) return;
        navLinks.classList.add('active');
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.classList.add('nav-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Tutup menu navigasi');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
        if (navbar) navbar.classList.add('scrolled');
    }

    function closeMobileMenu() {
        if (!navLinks || !menuToggle) return;
        navLinks.classList.remove('active');
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('nav-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
        
        const icon = menuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
        if (navbar && window.scrollY <= 40) {
            navbar.classList.remove('scrolled');
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = navLinks && navLinks.classList.contains('active');
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMobileMenu);
    }

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks && navLinks.classList.contains('active')) {
            closeMobileMenu();
            if (menuToggle) menuToggle.focus();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 992 && navLinks && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // ===== 3. Synchronized Active Scroll Spy Engine =====
    const trackedSectionIds = ['home', 'about', 'standar-mutu', 'katalog', 'proyek', 'b2b-proyek', 'kalkulator', 'alur-pesan', 'lacak-armada', 'faq', 'kontak'];
    const trackedSections = trackedSectionIds
        .map(id => document.getElementById(id))
        .filter(sec => sec !== null);

    const desktopNavLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const bottomNavLinks = document.querySelectorAll('.bottom-nav a[href^="#"]');

    function updateActiveNavLinks() {
        if (!trackedSections.length) return;
        const scrollPosition = window.scrollY + 120;
        const documentHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;

        let activeId = trackedSections[0].id;

        if (window.scrollY + windowHeight >= documentHeight - 50) {
            activeId = trackedSections[trackedSections.length - 1].id;
        } else {
            trackedSections.forEach(section => {
                if (scrollPosition >= section.offsetTop) {
                    activeId = section.id;
                }
            });
        }

        desktopNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        bottomNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            window.requestAnimationFrame(() => {
                updateActiveNavLinks();
                scrollTimeout = null;
            });
            scrollTimeout = true;
        }
    }, { passive: true });
    updateActiveNavLinks();

    // ===== 4. Intersection Observer for Animations =====
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right');
    animatedElements.forEach(el => observer.observe(el));

    // ===== 5. FAQ Accordion =====
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });
});

// WhatsApp Form Submission
window.sendToWhatsApp = function(event) {
    event.preventDefault();
    
    const name = document.getElementById('waName').value;
    const email = document.getElementById('waEmail').value;
    const product = document.getElementById('waProduct').value;
    const message = document.getElementById('waMessage').value;

    const waNumber = "6287869796938";
    
    let waText = `Halo Scarlet Roster, saya tertarik dengan produk Anda.\n\n`;
    waText += `*Nama:* ${name}\n`;
    waText += `*Email:* ${email}\n`;
    waText += `*Produk Minat:* ${product}\n`;
    waText += `*Pesan:* ${message}\n`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
};

// ===== Fleet Tracking Submission =====
window.handleFleetTracking = function(event) {
    if (event) event.preventDefault();
    const trackInput = document.getElementById('trackInput');
    const query = trackInput ? trackInput.value.trim() : '';
    if (!query) return;

    const waNumber = "6287869796938";
    const waText = `Halo Admin Logistik Scarlet Roster, saya ingin mengecek status pemuatan dan jadwal keberangkatan armada untuk pesanan saya.\n\n*No. Surat Jalan / No. WhatsApp:* ${query}\n\nMohon info estimasi kedatangan armada ke lokasi proyek. Terima kasih.`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`;
    window.open(waUrl, '_blank');
};

// Close price info popups when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('price-info-trigger')) {
        document.querySelectorAll('.price-info-popup.show').forEach(popup => {
            popup.classList.remove('show');
        });
    }
});

// ===== Page Loader =====
function hideLoader() {
    const loader = document.querySelector('.page-loader');
    if (loader && !loader.classList.contains('hidden')) {
        loader.classList.add('hidden');
        document.body.classList.add('loaded');
    }
}
setTimeout(hideLoader, 400);
if (document.readyState === 'complete') {
    hideLoader();
} else {
    window.addEventListener('load', hideLoader);
}

// ===== Lightbox Modal =====
const lightbox = document.getElementById('lightbox');
if (lightbox) {
    const lbImg = lightbox.querySelector('img');
    const lbTitle = lightbox.querySelector('.lightbox-title, h3, h4');
    const lbClose = lightbox.querySelector('.lightbox-close');

    document.querySelectorAll('.product-img img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', (e) => {
            const card = img.closest('.product-card');
            const id = card ? card.getAttribute('data-id') : null;
            const product = typeof findProduct === 'function' ? (findProduct(id) || findProduct(img.src)) : null;
            if (product && typeof openProductLightbox === 'function') {
                openProductLightbox(product);
                return;
            }
            if (lbImg) lbImg.src = img.src;
            if (lbTitle) lbTitle.textContent = img.alt || '';
            lightbox.classList.add('active');
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });

    const closeLightbox = () => {
        if (typeof closeProductLightbox === 'function') {
            closeProductLightbox();
            return;
        }
        lightbox.classList.remove('active');
        lightbox.style.display = 'none';
        document.body.style.overflow = '';
    };
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
}

// ===== Interactive Wall Area Calculator Logic =====
function calculateRosterRequirement(length, height, pcsPerM2 = 25, reservePct = 5) {
    const l = parseFloat(length) || 0;
    const h = parseFloat(height) || 0;
    const areaM2 = Number((l * h).toFixed(2));
    const basePcs = Math.ceil(areaM2 * pcsPerM2);
    const reservePcs = Math.ceil(basePcs * (reservePct / 100));
    const totalPcs = basePcs + reservePcs;
    return { areaM2, basePcs, reservePcs, totalPcs };
}

window.calculateRosterRequirement = calculateRosterRequirement;

function initRosterCalculator() {
    const calcLength = document.getElementById('calcLength');
    const calcHeight = document.getElementById('calcHeight');
    const calcArea = document.getElementById('calcArea');
    const calcBasePcs = document.getElementById('calcBasePcs');
    const calcReservePcs = document.getElementById('calcReservePcs');
    const calcTotalPcs = document.getElementById('calcTotalPcs');
    const calcWaQuote = document.getElementById('calcWaQuote');

    if (!calcLength || !calcHeight) return;

    function updateCalculator() {
        const l = parseFloat(calcLength.value) || 0;
        const h = parseFloat(calcHeight.value) || 0;
        const result = calculateRosterRequirement(l, h);

        if (calcArea) calcArea.textContent = result.areaM2.toFixed(1) + ' m²';
        if (calcBasePcs) calcBasePcs.textContent = result.basePcs + ' pcs';
        if (calcReservePcs) calcReservePcs.textContent = result.reservePcs + ' pcs';
        if (calcTotalPcs) calcTotalPcs.textContent = result.totalPcs + ' pcs';

        if (calcWaQuote) {
            const waNumber = '6287869796938';
            const msg = `Halo Scarlet Roster, saya sudah hitung kebutuhan-roster untuk dinding panjang ${l}m x tinggi ${h}m (luas ${result.areaM2.toFixed(1)}m²), total estimasi sekitar ${result.totalPcs} pcs. Boleh minta info penawaran harga dan ongkir?`;
            calcWaQuote.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
        }
    }

    calcLength.addEventListener('input', updateCalculator);
    calcHeight.addEventListener('input', updateCalculator);
    calcLength.addEventListener('change', updateCalculator);
    calcHeight.addEventListener('change', updateCalculator);

    updateCalculator();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRosterCalculator);
} else {
    initRosterCalculator();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ...(module.exports || {}),
        calculateRosterRequirement
    };
}

