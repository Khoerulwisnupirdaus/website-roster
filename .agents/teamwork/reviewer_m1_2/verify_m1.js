const fs = require('fs');
const path = require('path');
const { loadDOM, ROOT_DIR } = require(path.resolve('tests/harness/dom-loader'));

const htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'css/style.css'), 'utf8');
const jsContent = fs.readFileSync(path.join(ROOT_DIR, 'js/main.js'), 'utf8');

const results = [];

// Ignore external script errors (e.g. Google Maps API looking for browser performance API)
process.on('uncaughtException', (err) => {
    if (err.stack && err.stack.includes('maps.googleapis.com')) {
        return; // Ignore external Google Maps mock limitation in JSDOM
    }
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
function test(name, fn) {
    try {
        fn();
        results.push({ name, passed: true });
        console.log(`  PASS: ${name}`);
    } catch (err) {
        results.push({ name, passed: false, error: err.message });
        console.error(`  FAIL: ${name} -> ${err.message}`);
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

console.log('======================================================');
console.log('   REVIEWER M1-2 INDEPENDENT ADVERSARIAL VERIFICATION ');
console.log('======================================================\n');

// Group 1: Navigation Header & Semantic Attributes
console.log('--- 1. Navigation Header & Semantic Elements ---');
test('Header has exactly 7 complete navigation links', () => {
    const { document } = loadDOM({ executeScripts: false });
    const navLinks = document.querySelectorAll('.nav-links a');
    assert(navLinks.length === 7, `Expected 7 nav links, found ${navLinks.length}`);
    const expected = ['#home', '#about', '#katalog', '#proyek', '#alur-pesan', '#faq', '#kontak'];
    const actual = Array.from(navLinks).map(a => a.getAttribute('href'));
    expected.forEach(href => {
        assert(actual.includes(href), `Missing link href: ${href}`);
    });
});

test('All 7 target section IDs exist in HTML', () => {
    const { document } = loadDOM({ executeScripts: false });
    const expected = ['home', 'about', 'katalog', 'proyek', 'alur-pesan', 'faq', 'kontak'];
    expected.forEach(id => {
        const el = document.getElementById(id);
        assert(Boolean(el), `Target section id="${id}" does not exist in DOM`);
    });
});

test('Menu toggle button has correct ARIA attributes and semantic markup', () => {
    const { document } = loadDOM({ executeScripts: false });
    const toggle = document.getElementById('menuToggle');
    assert(Boolean(toggle), 'Button #menuToggle not found');
    assert(toggle.tagName.toLowerCase() === 'button', `Expected <button>, found <${toggle.tagName.toLowerCase()}>`);
    assert(toggle.getAttribute('type') === 'button', 'Expected type="button"');
    assert(toggle.getAttribute('aria-expanded') === 'false', 'Expected aria-expanded="false"');
    assert(toggle.getAttribute('aria-controls') === 'navLinks', 'Expected aria-controls="navLinks"');
    assert(Boolean(toggle.getAttribute('aria-label')), 'Expected aria-label to be present');
});

test('Nav backdrop overlay exists in HTML', () => {
    const { document } = loadDOM({ executeScripts: false });
    const backdrop = document.getElementById('navBackdrop');
    assert(Boolean(backdrop), '#navBackdrop element not found');
    assert(backdrop.getAttribute('aria-hidden') === 'true', 'Expected aria-hidden="true" on backdrop');
});

// Group 2: Mobile Drawer Interactive Mechanics
console.log('\n--- 2. Mobile Drawer Interactions ---');
test('Click menuToggle opens drawer, adds body.nav-open, updates ARIA and icon', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');

    // Click toggle to open
    helpers.click(toggle);
    assert(navLinks.classList.contains('active'), 'navLinks should have .active class');
    assert(backdrop.classList.contains('active'), 'navBackdrop should have .active class');
    assert(document.body.classList.contains('nav-open'), 'body should have .nav-open class for scroll lock');
    assert(toggle.getAttribute('aria-expanded') === 'true', 'aria-expanded should be "true"');
    assert(toggle.getAttribute('aria-label') === 'Tutup menu navigasi', 'aria-label should be updated to Tutup');
    const icon = toggle.querySelector('i');
    assert(icon && icon.classList.contains('fa-times'), 'icon should switch to fa-times');
});

test('Clicking backdrop dismisses drawer and restores state', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    const backdrop = document.getElementById('navBackdrop');

    helpers.click(toggle); // Open
    assert(navLinks.classList.contains('active'), 'Menu should be open');

    helpers.click(backdrop); // Dismiss via backdrop
    assert(!navLinks.classList.contains('active'), 'navLinks should remove .active');
    assert(!backdrop.classList.contains('active'), 'backdrop should remove .active');
    assert(!document.body.classList.contains('nav-open'), 'body should remove .nav-open');
    assert(toggle.getAttribute('aria-expanded') === 'false', 'aria-expanded should be "false"');
    const icon = toggle.querySelector('i');
    assert(icon && icon.classList.contains('fa-bars'), 'icon should switch back to fa-bars');
});

test('Clicking nav link auto-closes drawer and restores state', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    helpers.click(toggle); // Open
    const firstLink = navLinks.querySelector('a');
    helpers.click(firstLink);

    assert(!navLinks.classList.contains('active'), 'navLinks should remove .active after link click');
    assert(!document.body.classList.contains('nav-open'), 'body should remove .nav-open');
    assert(toggle.getAttribute('aria-expanded') === 'false', 'aria-expanded should be "false"');
});

test('Pressing Escape key closes drawer and returns focus to menuToggle', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    helpers.click(toggle); // Open
    assert(navLinks.classList.contains('active'), 'Menu should be open');

    let focused = false;
    toggle.focus = () => { focused = true; };

    helpers.keydown(document, 'Escape');

    assert(!navLinks.classList.contains('active'), 'navLinks should remove .active on Escape');
    assert(!document.body.classList.contains('nav-open'), 'body should remove .nav-open on Escape');
    assert(toggle.getAttribute('aria-expanded') === 'false', 'aria-expanded should be "false"');
    assert(focused, 'Focus should be restored to menuToggle');
});

test('Window resize > 992px auto-closes active drawer', () => {
    const { window, document, helpers } = loadDOM({ executeScripts: true, viewportWidth: 375 });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    helpers.click(toggle); // Open
    assert(navLinks.classList.contains('active'), 'Menu should be open');

    helpers.setViewport(1200, 800);

    assert(!navLinks.classList.contains('active'), 'Drawer should close on resize > 992px');
    assert(!document.body.classList.contains('nav-open'), 'body should remove .nav-open on resize');
});

// Group 3: Synchronized Scroll Spy
console.log('\n--- 3. Synchronized Scroll Spy ---');
test('Scroll spy synchronizes desktop nav and mobile bottom nav', () => {
    const { window, document } = loadDOM({ executeScripts: true });

    // Mock performance for external scripts
    if (!window.performance) window.performance = {};
    if (!window.performance.getEntriesByType) window.performance.getEntriesByType = () => [];

    const sections = ['home', 'about', 'katalog', 'proyek', 'alur-pesan', 'faq', 'kontak'];
    const offsets = {
        'home': 0,
        'about': 600,
        'katalog': 1200,
        'proyek': 2400,
        'alur-pesan': 3200,
        'faq': 4000,
        'kontak': 4800
    };

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            Object.defineProperty(el, 'offsetTop', { value: offsets[id], configurable: true });
        }
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 6000, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true });

    // Proper asynchronous RAF queue
    let rAFQueue = [];
    window.requestAnimationFrame = (cb) => { rAFQueue.push(cb); return rAFQueue.length; };
    function flushRAF() {
        const q = rAFQueue;
        rAFQueue = [];
        q.forEach(cb => cb());
    }

    // Test 1: Scroll to #katalog (scrollY = 1300 -> scrollPosition = 1420 >= 1200)
    window.scrollTo(0, 1300);
    window.dispatchEvent(new window.Event('scroll'));
    flushRAF();

    const activeDesktop = document.querySelector('.nav-links a.active');
    const activeBottom = document.querySelector('.bottom-nav a.active');

    assert(activeDesktop && activeDesktop.getAttribute('href') === '#katalog',
        `Desktop active should be #katalog, got ${activeDesktop ? activeDesktop.getAttribute('href') : 'null'}`);
    assert(activeBottom && activeBottom.getAttribute('href') === '#katalog',
        `Bottom nav active should be #katalog, got ${activeBottom ? activeBottom.getAttribute('href') : 'null'}`);

    // Test 2: Scroll to #kontak (bottom of page: 5250 + 800 = 6050 >= 6000 - 50)
    window.scrollTo(0, 5250);
    window.dispatchEvent(new window.Event('scroll'));
    flushRAF();

    const activeDesktopEnd = document.querySelector('.nav-links a.active');
    const activeBottomEnd = document.querySelector('.bottom-nav a.active');

    assert(activeDesktopEnd && activeDesktopEnd.getAttribute('href') === '#kontak',
        `Desktop active at bottom should be #kontak, got ${activeDesktopEnd ? activeDesktopEnd.getAttribute('href') : 'null'}`);
    assert(activeBottomEnd && activeBottomEnd.getAttribute('href') === '#kontak',
        `Bottom active at bottom should be #kontak, got ${activeBottomEnd ? activeBottomEnd.getAttribute('href') : 'null'}`);
});

// Group 4: Semantic Footer & Truthful Data
console.log('\n--- 4. Semantic Footer ---');
test('Footer has role=contentinfo and 4 structural columns', () => {
    const { document } = loadDOM({ executeScripts: false });
    const footer = document.querySelector('footer.site-footer');
    assert(Boolean(footer), 'footer.site-footer not found');
    assert(footer.getAttribute('role') === 'contentinfo', 'footer must have role="contentinfo"');

    assert(Boolean(footer.querySelector('.footer-col-brand')), '.footer-col-brand missing');
    assert(Boolean(footer.querySelector('.footer-col-nav')), '.footer-col-nav missing');
    assert(Boolean(footer.querySelector('.footer-col-products')), '.footer-col-products missing');
    assert(Boolean(footer.querySelector('.footer-col-contact')), '.footer-col-contact missing');
});

test('Footer contains verified NAP Purwakarta 41162 and WhatsApp', () => {
    const { document } = loadDOM({ executeScripts: false });
    const contactCol = document.querySelector('.footer-col-contact');
    assert(Boolean(contactCol), '.footer-col-contact missing');
    const text = contactCol.textContent;
    assert(text.includes('Plered') && text.includes('Purwakarta') && text.includes('41162'),
        'Footer must contain verified Purwakarta 41162 location');
    assert(text.includes('6287869796938') || text.includes('0878 6979 6938') || text.includes('+62 878 6979 6938'),
        'Footer must contain verified WhatsApp contact');
});

test('Arbitrary visitor counter is completely removed', () => {
    assert(!htmlContent.includes('visitor-counter'), 'visitor-counter class found in HTML');
    assert(!htmlContent.includes('2.819'), '2.819 visitor count found in HTML');
    assert(!cssContent.includes('visitor-counter'), 'visitor-counter styles found in CSS');
    assert(!jsContent.includes('visitor-counter'), 'visitor-counter logic found in JS');
});

// Group 5: Dead Code Elimination Audit
console.log('\n--- 5. Dead Code Elimination Audit ---');
test('No dead code traces (darkToggle, dark-mode, wa-shake, A46C4D, emoji sparkle)', () => {
    const deadPatterns = ['darkToggle', 'dark-mode', 'wa-shake', 'A46C4D', '✨'];
    const files = [
        { name: 'index.html', content: htmlContent },
        { name: 'css/style.css', content: cssContent },
        { name: 'js/main.js', content: jsContent }
    ];

    deadPatterns.forEach(pattern => {
        files.forEach(f => {
            const matches = (f.content.match(new RegExp(pattern, 'gi')) || []).length;
            assert(matches === 0, `Found ${matches} occurrence(s) of "${pattern}" in ${f.name}`);
        });
    });
});

// Group 6: Adversarial Resilience & Edge Cases
console.log('\n--- 6. Adversarial Stress-Testing ---');
test('Pressing Escape when drawer is closed does nothing and does not crash', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    helpers.keydown(document, 'Escape');
});

test('Clicking backdrop when backdrop is closed does not throw', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const backdrop = document.getElementById('navBackdrop');
    helpers.click(backdrop);
});

test('Rapid toggle clicks (5 times) toggles state reliably without desync', () => {
    const { document, helpers } = loadDOM({ executeScripts: true });
    const toggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    for (let i = 0; i < 5; i++) {
        helpers.click(toggle);
    }
    // After 5 clicks (odd), it should be open
    assert(navLinks.classList.contains('active'), 'After 5 clicks drawer should be active');
    assert(document.body.classList.contains('nav-open'), 'Body should be nav-open');

    helpers.click(toggle); // 6th click (even) -> closed
    assert(!navLinks.classList.contains('active'), 'After 6 clicks drawer should be closed');
    assert(!document.body.classList.contains('nav-open'), 'Body should not be nav-open');
});

test('Touch targets on mobile drawer have >= 48px height defined in CSS', () => {
    assert(cssContent.includes('min-height: 48px'), 'CSS must define min-height: 48px on mobile nav links');
});

// Summary
console.log('\n======================================================');
const passedCount = results.filter(r => r.passed).length;
const totalCount = results.length;
console.log(`TOTAL TESTS: ${totalCount} | PASSED: ${passedCount} | FAILED: ${totalCount - passedCount}`);
console.log('======================================================');
if (totalCount !== passedCount) process.exit(1);
