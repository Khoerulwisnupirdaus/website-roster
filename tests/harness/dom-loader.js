const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.resolve(__dirname, '..', '..');

/**
 * Loads index.html into a JSDOM instance with browser API mocks.
 */
function loadDOM(options = {}) {
  const {
    executeScripts = true,
    url = 'http://localhost:3000/',
    viewportWidth = 1280,
    viewportHeight = 800
  } = options;

  const htmlPath = path.join(ROOT_DIR, 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  // Virtual Console to capture runtime errors
  const jsErrors = [];
  const virtualConsole = new (require('jsdom').VirtualConsole)();
  virtualConsole.on('error', (err) => {
    jsErrors.push(err);
  });
  virtualConsole.on('jsdomError', (err) => {
    jsErrors.push(err);
  });

  const dom = new JSDOM(htmlContent, {
    url,
    contentType: 'text/html',
    runScripts: executeScripts ? 'dangerously' : 'outside-only',
    resources: 'usable',
    virtualConsole,
    beforeParse(window) {
      // Setup window dimensions
      window.innerWidth = viewportWidth;
      window.innerHeight = viewportHeight;

      // Mock scrollTo
      window.scrollTo = (x, y) => {
        window.scrollX = typeof x === 'object' ? (x.left || 0) : x;
        window.scrollY = typeof y === 'object' ? (y.top || 0) : (y !== undefined ? y : (x && x.top) || 0);
      };

      // Mock window.open to track WhatsApp redirections
      window.lastOpenedUrl = null;
      window.open = (url, target) => {
        window.lastOpenedUrl = url;
        window.lastOpenedTarget = target;
        return { closed: false, close: () => {} };
      };

      // Mock IntersectionObserver
      window.IntersectionObserver = class {
        constructor(callback, options) {
          this.callback = callback;
          this.options = options;
        }
        observe(element) {
          // Immediately trigger intersecting by default in test environment
          setTimeout(() => {
            this.callback([{ isIntersecting: true, target: element }], this);
          }, 0);
        }
        unobserve() {}
        disconnect() {}
      };

      // Mock matchMedia
      window.matchMedia = window.matchMedia || function(query) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => {}
        };
      };

      // Mock localStorage
      const storage = {};
      window.localStorage = {
        getItem: (k) => storage[k] || null,
        setItem: (k, v) => { storage[k] = String(v); },
        removeItem: (k) => { delete storage[k]; },
        clear: () => { Object.keys(storage).forEach(k => delete storage[k]); }
      };
    }
  });

  const { window } = dom;
  const { document } = window;

  // If executeScripts is true, execute local scripts synchronously
  if (executeScripts) {
    const scriptTags = Array.from(document.querySelectorAll('script[src]'));
    scriptTags.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http://') && !src.startsWith('https://')) {
        const cleanSrc = src.split('?')[0];
        const scriptPath = path.join(ROOT_DIR, cleanSrc);
        if (fs.existsSync(scriptPath)) {
          try {
            const scriptCode = fs.readFileSync(scriptPath, 'utf-8');
            window.eval(scriptCode);
          } catch (evalErr) {
            jsErrors.push(evalErr);
          }
        }
      }
    });

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);
  }

  return {
    dom,
    window,
    document,
    rawHtml: htmlContent,
    jsErrors,
    helpers: {
      click(selectorOrEl) {
        const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
        if (!el) throw new Error(`Cannot click: element not found (${selectorOrEl})`);
        const evt = new window.MouseEvent('click', { bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
        return el;
      },
      input(selectorOrEl, value) {
        const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
        if (!el) throw new Error(`Cannot input: element not found (${selectorOrEl})`);
        el.value = value;
        const inputEvt = new window.Event('input', { bubbles: true });
        el.dispatchEvent(inputEvt);
        const changeEvt = new window.Event('change', { bubbles: true });
        el.dispatchEvent(changeEvt);
        return el;
      },
      keydown(selectorOrEl, key) {
        const el = typeof selectorOrEl === 'string'
          ? document.querySelector(selectorOrEl)
          : (selectorOrEl || document);
        const evt = new window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
        el.dispatchEvent(evt);
        return el;
      },
      setViewport(width, height) {
        window.innerWidth = width;
        window.innerHeight = height;
        const resizeEvt = new window.Event('resize');
        window.dispatchEvent(resizeEvt);
      }
    }
  };
}

module.exports = { loadDOM, ROOT_DIR };
