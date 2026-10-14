## 2026-10-13T13:23:04Z
You are Worker M1-1 (teamwork_preview_worker).
Your working directory: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\worker_m1_1
Project root directory: c:\Users\Hype G12\OneDrive\website roster
Authoritative user request: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\ORIGINAL_REQUEST.md
Master project specification: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\orchestrator_1\PROJECT.md
Parent conversation ID: bef73a8e-2405-4609-86f2-fb5e0f0c059e

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Mission: Implement Milestone 1 — Architectural Design System & Brand Identity (Features #9, #10, #11, #12, #27).

Input Reports:
Read the exact code and specifications in:
1. c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\explorer_m1_1\handoff.md (Calibrated terracotta #945738 WCAG AA >= 4.5:1, tokens, shadows, utility classes, cleanup)
2. c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\explorer_m1_2\handoff.md (Plus Jakarta Sans/Outfit typography, fluid clamp() scales, 2-column Hero with showcase card & trust badges strip, About section overhaul with 10+ year badge & metrics)
3. c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\spec_miner_m1_1\handoff.md (7-link navbar, accessible #menuToggle button, #navBackdrop, 4-column verified footer, removal of hardcoded visitor counter, removal of dead darkToggle code)

Your Write Ownership:
You own `css/style.css`, the header/hero/about/footer sections in `index.html`, and the navigation/drawer/scroll-spy/cleanup logic in `js/main.js`. Do not modify product catalog cards (that is Milestone 2).

Tasks:
1. Update Google Fonts in `index.html` to `Plus Jakarta Sans` and `Outfit`.
2. Update header in `index.html`: 7 nav links, accessible `<button id="menuToggle">`, and backdrop `#navBackdrop`.
3. Overhaul Hero in `index.html`: 2-column hero grid with showcase card (`product_terracotta.png`), trust badges strip, `fetchpriority="high"`, explicit dimensions (1024x1024).
4. Overhaul About in `index.html`: 10+ year experience badge, 3-metric factory credibility grid.
5. Overhaul Footer in `index.html`: 4-column semantic layout, verified Purwakarta 41162 details, remove hardcoded visitor counter.
6. Overhaul `css/style.css`:
   - Calibrate tokens: `--primary: #945738`, `--secondary: #1A1B1E`, `--light: #F9F8F5`, `--white: #FFFFFF`, `--border: #E5E0D8`.
   - Implement fluid typography scales using `clamp()`.
   - Implement Hero styling (`min-height: 100svh`), showcase card, trust strip, About styling, navbar glassmorphism, mobile drawer, backdrop, and footer styles.
   - Delete dead darkToggle and visitor counter rules.
7. Overhaul `js/main.js`:
   - Implement accessible mobile drawer toggle with body scroll lock, backdrop dismiss, and Escape key dismiss.
   - Implement synchronized active scroll spy engine for both desktop navbar and mobile bottom nav.
   - Completely remove orphaned `darkToggle` event listeners and storage handlers.
8. Verify code syntax: Run `node -c js/main.js` and ensure 0 errors.
9. Write handoff report to `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\worker_m1_1\handoff.md`.
10. Send completion message to orchestrator (`bef73a8e-2405-4609-86f2-fb5e0f0c059e`).
