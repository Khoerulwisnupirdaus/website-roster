const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const HTTP_PORT = 8765;
const CDP_PORT = 9226;

// 1. Simple HTTP Server to serve files with accurate MIME types
function startServer() {
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };

  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(HTTP_PORT, '127.0.0.1', () => {
      resolve(server);
    });
  });
}

// 2. Launch Chrome Headless
function launchChrome() {
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    '--hide-scrollbars',
    'about:blank'
  ]);

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
        const targets = await res.json();
        const page = targets.find(t => t.type === 'page');
        if (page && page.webSocketDebuggerUrl) {
          clearInterval(checkInterval);
          resolve({ chromeProcess, wsUrl: page.webSocketDebuggerUrl });
        }
      } catch (err) {
        // waiting for chrome to spin up
      }
    }, 200);

    setTimeout(() => {
      clearInterval(checkInterval);
      reject(new Error('Chrome launch timeout'));
    }, 10000);
  });
}

// 3. Simple CDP WebSocket Client
class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const cb = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) cb.reject(new Error(msg.error.message));
          else cb.resolve(msg.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = this.id++;
      this.callbacks.set(msgId, { resolve, reject });
      this.ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.text || 'Runtime.evaluate exception');
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runMilestone1StressTests() {
  console.log('===============================================================');
  console.log('       MILENSTONE 1 EMPIRICAL STRESS TEST HARNESS (CHALLENGER)  ');
  console.log('===============================================================');

  const server = await startServer();
  console.log(`[1] HTTP Server active on http://127.0.0.1:${HTTP_PORT}`);

  const { chromeProcess, wsUrl } = await launchChrome();
  console.log(`[2] Headless Chrome active on CDP port ${CDP_PORT}`);

  const cdp = new CDPClient(wsUrl);
  await cdp.connect();
  console.log('[3] Connected to Chrome DevTools Protocol via WebSocket');

  // Enable Page, Runtime, DOM
  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');
  await cdp.send('DOM.enable');

  const results = {
    viewports: [],
    touchTargets: [],
    drawerAria: [],
    failures: []
  };

  try {
    // =========================================================================
    // TASK 2A: Viewport Widths & Horizontal Overflow (360, 375, 414, 768, 1024, 1280, 1920)
    // =========================================================================
    console.log('\n--- 2A: TESTING VIEWPORT RESPONSIVENESS & HORIZONTAL OVERFLOW ---');
    const viewportsToTest = [
      { name: 'Ultra Compact Mobile', width: 360, height: 640, isMobile: true },
      { name: 'Standard iPhone', width: 375, height: 667, isMobile: true },
      { name: 'Large Mobile', width: 414, height: 896, isMobile: true },
      { name: 'Tablet Portrait', width: 768, height: 1024, isMobile: true },
      { name: 'Tablet Landscape / Laptop', width: 1024, height: 768, isMobile: false },
      { name: 'Standard Desktop', width: 1280, height: 800, isMobile: false },
      { name: 'Full HD Monitor', width: 1920, height: 1080, isMobile: false }
    ];

    for (const vp of viewportsToTest) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: 1,
        mobile: false
      });

      // Navigate to trigger clean layout calculation at this exact viewport
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` });
      await new Promise(r => setTimeout(r, 900));

      const overflowMetrics = await cdp.eval(`
        (() => {
          const docEl = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(docEl.scrollWidth, body.scrollWidth);
          const clientWidth = docEl.clientWidth;
          const innerWidth = window.innerWidth;
          // 1. Root DOM Scroll Overflow check
          const hasScrollOverflow = scrollWidth > (innerWidth + 1);

          // 2. Off-screen visual transform check (advisory for pre-intersection animations)
          const transformOffsets = [];
          const scrollCulprits = [];
          const allElements = document.querySelectorAll('*');
          for (const el of allElements) {
            if (el.classList.contains('nav-links') || el.closest('.nav-links') || el.classList.contains('nav-backdrop')) continue;
            const rect = el.getBoundingClientRect();
            if (rect.right > innerWidth + 1.5) {
              transformOffsets.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 30) : '',
                rectRight: Math.round(rect.right * 10) / 10,
                rectWidth: Math.round(rect.width * 10) / 10,
                innerWidth: innerWidth
              });
            }
            if (el.scrollWidth > innerWidth + 1 && el !== docEl && el !== body) {
              scrollCulprits.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                className: (el.className && typeof el.className === 'string') ? el.className.slice(0, 30) : '',
                scrollWidth: el.scrollWidth,
                offsetWidth: el.offsetWidth
              });
            }
          }

          return {
            docScroll: docEl.scrollWidth,
            bodyScroll: body.scrollWidth,
            scrollWidth,
            clientWidth,
            innerWidth,
            hasScrollOverflow,
            diff: Math.max(0, scrollWidth - innerWidth),
            transformOffsets: transformOffsets.slice(0, 3),
            scrollCulprits: scrollCulprits.slice(0, 5)
          };
        })()
      `);

      const vpResult = {
        name: vp.name,
        targetWidth: vp.width,
        innerWidth: overflowMetrics.innerWidth,
        scrollWidth: overflowMetrics.scrollWidth,
        diff: overflowMetrics.diff,
        passed: !overflowMetrics.hasScrollOverflow,
        transformAdvisory: overflowMetrics.transformOffsets
      };
      results.viewports.push(vpResult);

      const statusIcon = vpResult.passed ? '✔ PASS' : '✖ FAIL';
      console.log(`[${statusIcon}] ${vp.name.padEnd(26)} | Target: ${vp.width}px | innerWidth: ${overflowMetrics.innerWidth}px | scrollWidth: ${overflowMetrics.scrollWidth}px | Overflow: ${overflowMetrics.diff > 0 ? '+' + overflowMetrics.diff + 'px' : '0px'}`);
      if (!vpResult.passed) {
        console.log(`   [DEBUG] docScroll: ${overflowMetrics.docScroll}, bodyScroll: ${overflowMetrics.bodyScroll}, culprits:`, overflowMetrics.scrollCulprits);
        results.failures.push(`Horizontal scroll overflow detected at ${vp.width}px (${overflowMetrics.diff}px overflow)`);
      }
      if (overflowMetrics.transformOffsets && overflowMetrics.transformOffsets.length > 0) {
        console.log(`   [ADVISORY] Pre-intersection transform offset detected:`, overflowMetrics.transformOffsets[0].className, `(rectRight: ${overflowMetrics.transformOffsets[0].rectRight}px > ${vp.width}px)`);
      }
    }

    // =========================================================================
    // TASK 2B: Touch Target Bounding Boxes (>= 44x44px)
    // =========================================================================
    console.log('\n--- 2B: TESTING TOUCH TARGET BOUNDING BOXES (>= 44x44px) ---');
    const mobileTestWidths = [360, 375, 414, 768];

    for (const w of mobileTestWidths) {
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: w,
        height: 800,
        deviceScaleFactor: 1,
        mobile: false
      });
      await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` });
      await new Promise(r => setTimeout(r, 600));

      const touchMeasurements = await cdp.eval(`
        (() => {
          // Open mobile drawer temporarily to measure drawer items
          const menuToggle = document.getElementById('menuToggle');
          const navLinks = document.getElementById('navLinks');
          const wasOpen = navLinks && navLinks.classList.contains('active');
          if (!wasOpen && menuToggle) {
            menuToggle.click();
          }

          const targets = [];

          // 1. Menu Toggle Button
          if (menuToggle) {
            const r = menuToggle.getBoundingClientRect();
            targets.push({
              name: 'Menu Toggle (#menuToggle)',
              selector: '#menuToggle',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          }

          // 2. Mobile Drawer Navigation Links
          const drawerLinks = document.querySelectorAll('.nav-links a');
          drawerLinks.forEach((a, i) => {
            const r = a.getBoundingClientRect();
            targets.push({
              name: 'Drawer Link [' + a.textContent.trim() + ']',
              selector: '.nav-links a:nth-child(' + (i + 1) + ')',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          });

          // 3. Hero Action Buttons
          const heroBtns = document.querySelectorAll('.hero-btns a, .hero-btns button');
          heroBtns.forEach((btn, i) => {
            const r = btn.getBoundingClientRect();
            targets.push({
              name: 'Hero CTA [' + btn.textContent.trim().replace(/\\s+/g, ' ') + ']',
              selector: '.hero-btns > *:nth-child(' + (i + 1) + ')',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          });

          // 4. Footer Social Buttons
          const socialBtns = document.querySelectorAll('.footer-social a');
          socialBtns.forEach((btn, i) => {
            const r = btn.getBoundingClientRect();
            targets.push({
              name: 'Footer Social [' + (btn.getAttribute('aria-label') || 'Icon ' + (i + 1)) + ']',
              selector: '.footer-social a:nth-child(' + (i + 1) + ')',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          });

          // 5. Floating WhatsApp
          const floatingWa = document.querySelector('.floating-wa');
          if (floatingWa) {
            const r = floatingWa.getBoundingClientRect();
            targets.push({
              name: 'Floating WhatsApp (.floating-wa)',
              selector: '.floating-wa',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          }

          // 6. Bottom Mobile Nav Links
          const bottomNavLinks = document.querySelectorAll('.bottom-nav a');
          bottomNavLinks.forEach((a, i) => {
            const r = a.getBoundingClientRect();
            targets.push({
              name: 'Bottom Nav Link [' + a.textContent.trim() + ']',
              selector: '.bottom-nav a:nth-child(' + (i + 1) + ')',
              width: Math.round(r.width * 10) / 10,
              height: Math.round(r.height * 10) / 10,
              visible: r.width > 0 && r.height > 0
            });
          });

          // Restore menu state
          if (!wasOpen && menuToggle) {
            menuToggle.click();
          }

          return targets;
        })()
      `);

      console.log(`\n  * Touch Targets at Viewport Width: ${w}px:`);
      touchMeasurements.forEach(t => {
        const passesMin44 = t.width >= 44 && t.height >= 44;
        const status = passesMin44 ? '✔ PASS' : '✖ FAIL';
        console.log(`    [${status}] ${t.name.padEnd(36)}: ${t.width}px x ${t.height}px`);

        if (!passesMin44) {
          results.failures.push(`Touch target below 44x44px: ${t.name} measured ${t.width}x${t.height}px at ${w}px viewport`);
        }
      });

      results.touchTargets.push({ viewportWidth: w, targets: touchMeasurements });
    }

    // =========================================================================
    // TASK 2C: DOM Structure of Mobile Drawer, Backdrop & ARIA Attributes
    // =========================================================================
    console.log('\n--- 2C: TESTING MOBILE DRAWER DOM, BACKDROP & ARIA BEHAVIORS ---');

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 375,
      height: 667,
      deviceScaleFactor: 1,
      mobile: false
    });
    await cdp.send('Page.navigate', { url: `http://127.0.0.1:${HTTP_PORT}/` });
    await new Promise(r => setTimeout(r, 600));

    // Step 1: Initial (Closed) State Verification
    const initialAria = await cdp.eval(`
      (() => {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const backdrop = document.getElementById('navBackdrop');
        const icon = toggle ? toggle.querySelector('i') : null;

        return {
          toggleExists: Boolean(toggle),
          toggleTag: toggle ? toggle.tagName.toLowerCase() : null,
          toggleType: toggle ? toggle.getAttribute('type') : null,
          toggleExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
          toggleLabel: toggle ? toggle.getAttribute('aria-label') : null,
          toggleControls: toggle ? toggle.getAttribute('aria-controls') : null,
          iconClass: icon ? icon.className : null,
          drawerActive: navLinks ? navLinks.classList.contains('active') : null,
          drawerRole: navLinks ? navLinks.getAttribute('role') : null,
          backdropExists: Boolean(backdrop),
          backdropHidden: backdrop ? backdrop.getAttribute('aria-hidden') : null,
          backdropActive: backdrop ? backdrop.classList.contains('active') : null,
          bodyScrollLocked: document.body.classList.contains('nav-open')
        };
      })()
    `);

    console.log('  1. Initial Closed State:');
    console.log(`     - Toggle element: <${initialAria.toggleTag} type="${initialAria.toggleType}">`);
    console.log(`     - aria-expanded: "${initialAria.toggleExpanded}" (Expected: "false")`);
    console.log(`     - aria-controls: "${initialAria.toggleControls}" (Expected: "navLinks")`);
    console.log(`     - aria-label: "${initialAria.toggleLabel}"`);
    console.log(`     - Icon: "${initialAria.iconClass}" (Expected: contains fa-bars)`);
    console.log(`     - Drawer active: ${initialAria.drawerActive} (Expected: false)`);
    console.log(`     - Backdrop active: ${initialAria.backdropActive} (Expected: false)`);
    console.log(`     - Body scroll locked: ${initialAria.bodyScrollLocked} (Expected: false)`);

    const c1 = initialAria.toggleExpanded === 'false' &&
               initialAria.toggleControls === 'navLinks' &&
               !initialAria.drawerActive &&
               !initialAria.bodyScrollLocked;
    if (!c1) results.failures.push('Initial drawer state ARIA/DOM violation');

    // Step 2: Open Drawer via Click
    await cdp.eval(`document.getElementById('menuToggle').click();`);
    await new Promise(r => setTimeout(r, 200));

    const openedAria = await cdp.eval(`
      (() => {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        const backdrop = document.getElementById('navBackdrop');
        const icon = toggle ? toggle.querySelector('i') : null;
        const navRect = navLinks ? navLinks.getBoundingClientRect() : null;

        return {
          toggleExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
          toggleLabel: toggle ? toggle.getAttribute('aria-label') : null,
          iconClass: icon ? icon.className : null,
          drawerActive: navLinks ? navLinks.classList.contains('active') : null,
          drawerRight: navRect ? navRect.right : null,
          drawerWidth: navRect ? navRect.width : null,
          backdropActive: backdrop ? backdrop.classList.contains('active') : null,
          bodyScrollLocked: document.body.classList.contains('nav-open')
        };
      })()
    `);

    console.log('\n  2. Opened State (After Toggle Click):');
    console.log(`     - aria-expanded: "${openedAria.toggleExpanded}" (Expected: "true")`);
    console.log(`     - aria-label: "${openedAria.toggleLabel}"`);
    console.log(`     - Icon: "${openedAria.iconClass}" (Expected: contains fa-times)`);
    console.log(`     - Drawer active: ${openedAria.drawerActive} (Expected: true)`);
    console.log(`     - Drawer bounds: width=${openedAria.drawerWidth}px, right=${openedAria.drawerRight}px`);
    console.log(`     - Backdrop active: ${openedAria.backdropActive} (Expected: true)`);
    console.log(`     - Body scroll locked: ${openedAria.bodyScrollLocked} (Expected: true)`);

    const c2 = openedAria.toggleExpanded === 'true' &&
               openedAria.drawerActive &&
               openedAria.backdropActive &&
               openedAria.bodyScrollLocked;
    if (!c2) results.failures.push('Opened drawer state ARIA/DOM violation');

    // Step 3: Dismiss via Backdrop Click
    await cdp.eval(`document.getElementById('navBackdrop').click();`);
    await new Promise(r => setTimeout(r, 200));

    const closedViaBackdrop = await cdp.eval(`
      (() => {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        return {
          toggleExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
          drawerActive: navLinks ? navLinks.classList.contains('active') : null,
          bodyScrollLocked: document.body.classList.contains('nav-open')
        };
      })()
    `);
    console.log('\n  3. Backdrop Click Dismiss:');
    console.log(`     - Drawer active after backdrop click: ${closedViaBackdrop.drawerActive} (Expected: false)`);
    console.log(`     - aria-expanded: "${closedViaBackdrop.toggleExpanded}" (Expected: "false")`);
    console.log(`     - Body scroll locked: ${closedViaBackdrop.bodyScrollLocked} (Expected: false)`);

    if (closedViaBackdrop.drawerActive || closedViaBackdrop.bodyScrollLocked) {
      results.failures.push('Drawer failed to close cleanly on backdrop click');
    }

    // Step 4: Open & Dismiss via Nav Link Click
    await cdp.eval(`document.getElementById('menuToggle').click();`);
    await new Promise(r => setTimeout(r, 200));
    await cdp.eval(`document.querySelector('.nav-links a[href="#about"]').click();`);
    await new Promise(r => setTimeout(r, 200));

    const closedViaLink = await cdp.eval(`
      (() => {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        return {
          toggleExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
          drawerActive: navLinks ? navLinks.classList.contains('active') : null
        };
      })()
    `);
    console.log('\n  4. Nav Link Anchor Click Dismiss:');
    console.log(`     - Drawer active after nav link click: ${closedViaLink.drawerActive} (Expected: false)`);
    console.log(`     - aria-expanded: "${closedViaLink.toggleExpanded}" (Expected: "false")`);

    if (closedViaLink.drawerActive) {
      results.failures.push('Drawer failed to auto-close when clicking internal anchor link');
    }

    // Step 5: Open & Dismiss via Escape Key + Focus Restoration
    await cdp.eval(`document.getElementById('menuToggle').click();`);
    await new Promise(r => setTimeout(r, 200));
    await cdp.eval(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    `);
    await new Promise(r => setTimeout(r, 200));

    const closedViaEsc = await cdp.eval(`
      (() => {
        const toggle = document.getElementById('menuToggle');
        const navLinks = document.getElementById('navLinks');
        return {
          toggleExpanded: toggle ? toggle.getAttribute('aria-expanded') : null,
          drawerActive: navLinks ? navLinks.classList.contains('active') : null,
          activeElId: document.activeElement ? document.activeElement.id : null
        };
      })()
    `);
    console.log('\n  5. Escape Key Dismiss & Focus Restoration:');
    console.log(`     - Drawer active after Escape key: ${closedViaEsc.drawerActive} (Expected: false)`);
    console.log(`     - Focused element ID after Escape: "${closedViaEsc.activeElId}" (Expected: "menuToggle")`);

    if (closedViaEsc.drawerActive) {
      results.failures.push('Drawer failed to close on Escape key');
    }
    if (closedViaEsc.activeElId !== 'menuToggle') {
      results.failures.push('Focus was not restored to #menuToggle upon Escape dismissal');
    }

    // Step 6: Open & Auto-Close on Viewport Resize (> 992px)
    await cdp.eval(`document.getElementById('menuToggle').click();`);
    await new Promise(r => setTimeout(r, 200));
    // Resize to desktop
    await cdp.send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1024,
      height: 768,
      deviceScaleFactor: 1,
      mobile: false,
      scale: 1
    });
    await cdp.eval(`window.dispatchEvent(new Event('resize'));`);
    await new Promise(r => setTimeout(r, 200));

    const closedViaResize = await cdp.eval(`
      (() => {
        const navLinks = document.getElementById('navLinks');
        return {
          drawerActive: navLinks ? navLinks.classList.contains('active') : null
        };
      })()
    `);
    console.log('\n  6. Resize to Desktop (>992px) Auto-Close:');
    console.log(`     - Drawer active after resizing to 1024px: ${closedViaResize.drawerActive} (Expected: false)`);

    if (closedViaResize.drawerActive) {
      results.failures.push('Drawer failed to close upon window resize to desktop viewport');
    }

    results.drawerAria = {
      initialState: initialAria,
      openedState: openedAria,
      backdropDismiss: closedViaBackdrop,
      linkDismiss: closedViaLink,
      escapeDismiss: closedViaEsc,
      resizeDismiss: closedViaResize
    };

  } finally {
    cdp.close();
    chromeProcess.kill();
    server.close();
  }

  console.log('\n===============================================================');
  console.log('                   STRESS TEST EXECUTION VERDICT               ');
  console.log('===============================================================');
  if (results.failures.length === 0) {
    console.log('VERDICT: CONFIRM_CORRECTNESS (All empirical stress tests PASSED)');
  } else {
    console.log(`VERDICT: REJECT (${results.failures.length} failures detected)`);
    results.failures.forEach((f, i) => console.log(`  [${i + 1}] ${f}`));
  }

  // Write detailed results JSON
  fs.writeFileSync(
    path.join(__dirname, 'milestone1-stress-results.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`\nDetailed measurements saved to tests/milestone1-stress-results.json`);

  return results;
}

runMilestone1StressTests().catch(err => {
  console.error('STRESS TEST SUITE CRASHED:', err);
  process.exit(1);
});
