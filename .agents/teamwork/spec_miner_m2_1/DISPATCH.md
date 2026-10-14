## 2026-10-13T14:05:38Z
You are Spec Miner M2-1 (Lightbox Modal & WhatsApp Engine Spec Miner).
Your working directory: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\spec_miner_m2_1
Authoritative user request: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\ORIGINAL_REQUEST.md
Master project specification: c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\orchestrator_1\PROJECT.md
Parent conversation ID: bef73a8e-2405-4609-86f2-fb5e0f0c059e

Scope: Milestone 2 — Lightbox Modal & Dynamic WhatsApp Ordering Engine (Features #6, #7, #8)
Tasks:
1. READ ORIGINAL_REQUEST.md, PROJECT.md, and `tests/run-tests.js` (Tier 2 test cases) first.
2. Design the high-resolution Lightbox Modal:
   - High-res image display with zoom cursor.
   - Technical specifications (product name, material, exact dimensions, unit price, usage per m²).
   - Dismiss interactions: close button (`.lightbox-close`, >= 44x44px), clicking dark backdrop, and pressing `Escape` key. Body scroll lock while modal is open.
   - Direct Call-to-Action button: "Pesan via WhatsApp" linking to dynamic WhatsApp order URL for that product.
3. Design the Dynamic WhatsApp Ordering Engine targeting `+62 878 6979 6938`:
   - Workflow 1: Direct product card order ("Pesan Sekarang") and lightbox order CTA -> prefilled message with Product Name, Material, Price.
   - Workflow 2: Wholesale inquiry button ("Chat Harga Grosir") -> wholesale bulk pricing inquiry for that product.
   - Workflow 3: Section Wholesale banner CTA.
   - Ensure proper `encodeURIComponent` formatting.
4. Deliver exact drop-in markup, CSS, and JS code for Worker M2.
5. Write your handoff report to `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\spec_miner_m2_1\handoff.md`.
6. Send a completion message to the orchestrator.

Scope boundary: Read-only. Write only to your working directory.
