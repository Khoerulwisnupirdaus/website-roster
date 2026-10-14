# Handoff Report: Milestone 1 — Architectural Design System & CSS Architecture (Features #9, #27)

**Author**: Explorer M1-1 (Design Tokens & CSS Architecture Explorer)  
**Target Recipient**: Worker M1 (Architectural Redesign & Foundation Worker) / Orchestrator  
**Date**: 2026-10-13  
**Working Directory**: `c:\Users\Hype G12\OneDrive\website roster\.agents\teamwork\explorer_m1_1`  

---

## 1. Observation

Direct inspections of `css/style.css`, `js/main.js`, and `index.html` revealed the following exact facts and findings:

### 1.1 Existing CSS Variables (`css/style.css:1-15`)
```css
/* CSS variables */
:root {
    --primary: #A46C4D; /* Terracotta tone */
    --primary-dark: #825237;
    --secondary: #2C2C2C; /* Dark gray */
    --light: #F7F5F0; /* Warm off-white */
    --white: #FFFFFF;
    --text: #4A4A4A;
    --border: #E5E0D8;
    
    --font-main: 'Outfit', sans-serif;
    --font-heading: 'Playfair Display', serif;
    
    --transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
```

### 1.2 WCAG 2.1 Contrast Measurements
Running programmatic WCAG 2.1 luminance and contrast calculations yielded:
- **Current Primary `#A46C4D` on `#FFFFFF`**: **4.35:1** (Fails WCAG AA Normal Text requirement $\ge 4.5:1$).
- **Current Primary `#A46C4D` on Warm Ground `#F7F5F0`**: **3.99:1** (Fails WCAG AA Normal Text $\ge 4.5:1$).
- **Calibrated Terracotta `#945738` on `#FFFFFF`**: **5.71:1** (**PASSES** WCAG AA Normal Text $\ge 4.5:1$ and WCAG AA Large Text $\ge 3.0:1$).
- **Calibrated Terracotta `#945738` on Warm Sand `#F9F8F5`**: **5.37:1** (**PASSES** WCAG AA Normal Text $\ge 4.5:1$).
- **Deep Charcoal `#1A1B1E` on `#FFFFFF`**: **17.22:1** (**PASSES** WCAG AAA $\ge 7.0:1$).
- **Deep Charcoal `#1A1B1E` on Warm Sand `#F9F8F5`**: **16.22:1** (**PASSES** WCAG AAA $\ge 7.0:1$).
- **Concrete Gray `#71767E` on `#FFFFFF`**: **4.57:1** (**PASSES** WCAG AA Normal Text $\ge 4.5:1$).
- **Dark Concrete Body Text `#4A4D53` on `#FFFFFF`**: **9.15:1** (**PASSES** WCAG AAA).
- **Dark Concrete Body Text `#4A4D53` on `#F9F8F5`**: **8.62:1** (**PASSES** WCAG AAA).
- **Terracotta Accent on Charcoal `#D49B7A` on `#1A1B1E`**: **7.19:1** (**PASSES** WCAG AAA).
- **WhatsApp White Text on Brand `#25D366`**: **1.98:1** (Severe failure for plain text; requires emerald gradient anchor `#128C7E` [4.14:1+] or dark text / icon badge).

### 1.3 Hardcoded Color Tokens & Desynchronization
- The RGB equivalent of `#A46C4D` (`164, 108, 77`) is hardcoded in 6 distinct CSS rules:
  - `css/style.css:122`: `box-shadow: 0 10px 20px rgba(164, 108, 77, 0.2);`
  - `css/style.css:354`: `box-shadow: 0 4px 12px rgba(164, 108, 77, 0.3);`
  - `css/style.css:651`: `box-shadow: 0 6px 16px rgba(164, 108, 77, 0.3);`
  - `css/style.css:910`: `background: rgba(164, 108, 77, 0.1);`
  - `css/style.css:911`: `border: 1px solid rgba(164, 108, 77, 0.25);`
  - `css/style.css:920`: `background: rgba(164, 108, 77, 0.2);`
- Hardcoded grays and hexes without tokens:
  - `#1a1a1a` (`css/style.css:553`)
  - `#999` (`css/style.css:554`)
  - `#333` (`css/style.css:564, 581`)
  - `#666` (`css/style.css:668`)
  - `#888` (`css/style.css:437`)
  - `#25D366` (`css/style.css:732, 968, 1202`)
  - `#128C7E` (`css/style.css:968, 1202`)

### 1.4 Dead Code & Unreferenced Dark Mode Logic
- **`js/main.js:136-156`**:
  ```javascript
  // ===== Dark Mode Toggle =====
  const darkToggle = document.getElementById('darkToggle');
  if (darkToggle) {
      if (localStorage.getItem('darkMode') === 'true') {
          document.body.classList.add('dark-mode');
          darkToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
      }
      darkToggle.addEventListener('click', () => {
          document.body.classList.toggle('dark-mode');
          ...
      });
  }
  ```
- **`index.html`**: Does NOT contain `#darkToggle` or any dark toggle UI element.
- **`css/style.css:1024`**: Dangling comment `/* Dark Mode removed per user request */` with zero `.dark-mode` rules anywhere in the stylesheet.
- **`css/style.css:1105-1123`**: Unprofessional emoji sparkle pseudo-element on product cards:
  ```css
  .product-overlay .btn-primary::after {
      content: '✨';
      ...
  }
  ```

### 1.5 Typography & Layout Observations
- `index.html:10` loads `Outfit` (300-700) and `Playfair Display` (400-600).
- `PROJECT.md` Feature #10 explicitly mandates an architectural fluid typography scale with `Plus Jakarta Sans` / `Outfit` and tight tracking (`-0.02em`).
- Headings in `css/style.css:284, 826, 876` use rigid rem values without `clamp()`, forcing abrupt mobile jumps (`4rem` -> `2.5rem`).

---

## 2. Logic Chain

1. **Premise (Accessibility)**: WCAG 2.1 Success Criterion 1.4.3 (Level AA) requires a visual contrast ratio of at least $4.5:1$ for standard text and $3.0:1$ for large text ($\ge 18\text{pt}$ or $\ge 14\text{pt}$ bold) against background surfaces.
2. **Observation Linking**: Current `--primary: #A46C4D` yields only $4.35:1$ on `#FFFFFF` and $3.99:1$ on `--light: #F7F5F0`. It is used across subtitles (`.subtitle`), prices (`.price`), and small trigger icons (`.price-info-trigger`), generating multiple automated accessibility audit failures.
3. **Calibrated Terracotta Solution**: Darkening the terracotta tone to `#945738` (RGB: `148, 87, 56`) shifts its relative luminance from $0.169$ to $0.117$. This guarantees a contrast ratio of **$5.71:1$** on pure white and **$5.37:1$** on warm sand (`#F9F8F5`), safely surpassing the $4.5:1$ threshold while preserving the warm earthenware architectural identity.
4. **RGB Tokenization Rationale**: Because 6 styles rely on alpha transparency tints (`rgba(..., 0.2)`), introducing `--primary-rgb: 148, 87, 56;` enables `rgba(var(--primary-rgb), <alpha>)`, eliminating all hardcoded hex/RGB numbers and preventing visual drift.
5. **Architectural Grayscale Rationale**: Replacing the generic `--secondary: #2C2C2C` with Deep Charcoal `#1A1B1E` establishes rich contrast ($17.22:1$) reminiscent of dark anodized aluminum and charcoal basalt. Introducing Concrete Gray `#71767E` ($4.57:1$) and Dark Concrete `#4A4D53` ($9.15:1$) provides an authentic material-inspired palette for masonry and roster products.
6. **Dead Code Elimination (Feature #27)**: Because `#darkToggle` does not exist in `index.html` and `.dark-mode` has no styling rules in `css/style.css`, lines 136-156 in `js/main.js` are dead execution overhead and must be purged. Removing line 1024 from `css/style.css` cleanses orphaned comments.
7. **Elevation & Micro-Interactions**: Replacing raw `box-shadow: 0 10px 30px rgba(0,0,0,0.05)` with layered architectural shadows (`--shadow-sm` through `--shadow-xl`) and replacing `all 0.3s` with targeted transform/shadow cubic-bezier transitions prevents layout reflows and achieves smooth 60fps responsiveness.

---

## 3. Caveats

1. **Dark Section Accents**: In dark sections (e.g. `#kontak` with background `#1A1B1E`), terracotta `#945738` text has a contrast ratio of $2.99:1$. Therefore, subtitles or accent text in `.bg-dark` or `#kontak` MUST use `--primary-light: #D49B7A` ($7.19:1$ AAA) or pure white rather than `--primary`.
2. **WhatsApp Action Button Text**: Pure white text on WhatsApp pure green `#25D366` has a contrast of only $1.98:1$. To ensure accessibility, text buttons must use the gradient `linear-gradient(135deg, #25D366, #128C7E)` where the dark emerald base `#128C7E` ($4.14:1+$) or `#075E54` provides legibility, or use a bold icon badge with deep text.
3. **Scope Boundary**: As Explorer, this report contains read-only findings and code proposals. No files outside `.agents/teamwork/explorer_m1_1` have been edited.

---

## 4. Conclusion & Concrete Implementation Strategy

Worker M1 should execute the following specific implementation tasks in Milestone 1:

### 4.1 Master Architectural Color Token Specification
Replace lines 1-15 of `css/style.css` with the comprehensive design system token block:

```css
/* ==========================================================================
   01. ARCHITECTURAL DESIGN TOKENS & CUSTOM PROPERTIES
   ========================================================================== */
:root {
    /* --- Brand & Material Colors --- */
    --primary: #945738;             /* Calibrated Terracotta (WCAG AA: 5.71:1 on white, 5.37:1 on sand) */
    --primary-dark: #7B4328;        /* Deep Terracotta / Active-Hover state */
    --primary-light: #D49B7A;       /* Soft Terracotta / Contrast accent on dark surfaces (7.19:1) */
    --primary-surface: #FBF4F0;     /* Terracotta light wash / chip background */
    --primary-rgb: 148, 87, 56;     /* RGB channels for dynamic alpha tints */

    --secondary: #1A1B1E;           /* Deep Architectural Charcoal (17.22:1 AAA on white) */
    --secondary-rgb: 26, 27, 30;
    --charcoal-surface: #24262B;    /* Elevated surface in dark sections */
    --charcoal-border: #34373E;     /* Crisp dark borders */

    --light: #F9F8F5;               /* Warm Sand (Architectural Ground) */
    --white: #FFFFFF;               /* Pure White (Card & Elevated Surface) */
    
    /* --- Architectural Concrete Grayscale --- */
    --concrete-gray: #71767E;       /* Concrete Gray (Secondary/Muted text: 4.57:1 on white) */
    --concrete-light: #EEF0F2;      /* Concrete Light (Fills, Dividers, Card Insets) */
    --text: #4A4D53;                /* Dark Concrete Body Copy (9.15:1 on white, 8.62:1 on sand) */
    --text-muted: #71767E;          /* Muted & Caption text */
    
    --border: #E5E0D8;              /* Subtle Warm Architectural Border */
    --border-strong: #D3CBC0;       /* Strong Architectural Divider */

    /* --- WhatsApp Communication Tokens --- */
    --whatsapp: #25D366;            /* WhatsApp Brand Accent */
    --whatsapp-dark: #128C7E;       /* Deep Emerald (High contrast button anchor) */
    --whatsapp-deep: #075E54;       /* Forest Teal WhatsApp */
    --whatsapp-glow: rgba(37, 211, 102, 0.28);

    /* --- Typography Tokens --- */
    --font-main: 'Plus Jakarta Sans', 'Outfit', system-ui, -apple-system, sans-serif;
    --font-heading: 'Outfit', 'Plus Jakarta Sans', sans-serif;
    --font-serif: 'Playfair Display', serif;

    /* Fluid Typography Scale (Zero Layout Shift clamp) */
    --text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.8125rem);
    --text-sm: clamp(0.8125rem, 0.78rem + 0.2vw, 0.875rem);
    --text-base: clamp(0.9375rem, 0.9rem + 0.2vw, 1rem);
    --text-lg: clamp(1.0625rem, 1rem + 0.35vw, 1.1875rem);
    --text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.4rem);
    --text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.75rem);
    --text-3xl: clamp(1.85rem, 1.65rem + 1vw, 2.25rem);
    --text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);
    --text-hero: clamp(2.5rem, 2rem + 2.5vw, 4.25rem);

    /* Weights & Tracking */
    --weight-light: 300;
    --weight-regular: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;
    --tracking-tight: -0.025em;
    --tracking-normal: 0em;
    --tracking-wide: 0.05em;
    --tracking-wider: 0.12em;

    /* --- Architectural Elevation & Shadows --- */
    --shadow-sm: 0 1px 3px rgba(26, 27, 30, 0.05), 0 1px 2px rgba(26, 27, 30, 0.03);
    --shadow-md: 0 4px 14px rgba(26, 27, 30, 0.06), 0 2px 4px rgba(26, 27, 30, 0.03);
    --shadow-lg: 0 12px 30px rgba(26, 27, 30, 0.08), 0 4px 10px rgba(26, 27, 30, 0.04);
    --shadow-xl: 0 20px 48px rgba(26, 27, 30, 0.12), 0 8px 16px rgba(26, 27, 30, 0.05);
    --shadow-terracotta: 0 8px 24px rgba(var(--primary-rgb), 0.24);
    --shadow-whatsapp: 0 8px 24px rgba(37, 211, 102, 0.32);

    /* --- Radii & Micro-Transitions --- */
    --radius-xs: 4px;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --radius-full: 9999px;

    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.25, 0.8, 0.25, 1);
    --transition-smooth: 400ms cubic-bezier(0.16, 1, 0.3, 1);

    /* --- Architectural Layout Spacing --- */
    --container-max: 1240px;
    --section-spacing: clamp(64px, 8vw, 112px);
}
```

### 4.2 Architectural Palette Contrast Verification Matrix

| Color Token | Hex Code | RGB | Contrast vs `#FFFFFF` | Contrast vs `#F9F8F5` | Usage Context | WCAG Status |
|---|---|---|---|---|---|---|
| `--primary` | `#945738` | `148, 87, 56` | **5.71:1** | **5.37:1** | Subtitles, price numbers, active tabs, buttons | **PASSES AA** ($\ge 4.5:1$) |
| `--primary-dark` | `#7B4328` | `123, 67, 40` | **7.54:1** | **7.09:1** | Hover states, button pressed | **PASSES AAA** ($\ge 7.0:1$) |
| `--primary-light` | `#D49B7A` | `212, 155, 122` | N/A (light) | N/A (light) | Subtitles on `--secondary` (#1A1B1E) = **7.19:1** | **PASSES AAA** on dark |
| `--secondary` | `#1A1B1E` | `26, 27, 30` | **17.22:1** | **16.22:1** | Section headings, dark section background, nav brand | **PASSES AAA** ($\ge 7.0:1$) |
| `--text` | `#4A4D53` | `74, 77, 83` | **9.15:1** | **8.62:1** | Main body copy, product specs | **PASSES AAA** ($\ge 7.0:1$) |
| `--text-muted` | `#71767E` | `113, 118, 126` | **4.57:1** | **4.30:1** | Secondary labels, dimensions, metadata | **PASSES AA** on white ($\ge 4.5:1$) |
| `--light` | `#F9F8F5` | `249, 248, 245` | N/A | Ground | Warm sand section background | High-end gallery feel |
| `--border` | `#E5E0D8` | `229, 224, 216` | 1.25:1 | 1.18:1 | Subtle card borders, dividers | Architectural frame |

### 4.3 Card Elevation & Micro-Interaction Enhancements
Replace the existing `.product-card` and button styles with:

```css
/* Card Elevation & Architectural Depth */
.product-card {
    background: var(--white);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: transform var(--transition-base), box-shadow var(--transition-base), border-color var(--transition-base);
}

.product-card:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
    border-color: rgba(var(--primary-rgb), 0.35);
}

/* Micro-interaction Buttons */
.btn-primary {
    background-color: var(--primary);
    color: var(--white);
    padding: 13px 26px;
    font-weight: 600;
    font-family: var(--font-main);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-sm);
    transition: background-color var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
}

.btn-primary:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-terracotta);
}

.btn-primary:active {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
}

/* REMOVED: .product-overlay .btn-primary::after emoji sparkle */
/* REPLACED WITH: Sleek architectural overlay fade */
.product-overlay {
    position: absolute;
    inset: 0;
    background: rgba(26, 27, 30, 0.55);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity var(--transition-base);
}

.product-card:hover .product-overlay {
    opacity: 1;
}

/* Refined Floating WhatsApp */
.floating-wa {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--whatsapp) 0%, var(--whatsapp-dark) 100%);
    color: var(--white);
    border-radius: var(--radius-full);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    box-shadow: var(--shadow-whatsapp);
    z-index: 1000;
    transition: transform var(--transition-base), box-shadow var(--transition-base);
}

.floating-wa:hover {
    transform: translateY(-4px) scale(1.06);
    box-shadow: 0 14px 32px rgba(37, 211, 102, 0.42);
    color: var(--white);
}
```

### 4.4 Dead Code Elimination Actions (Feature #27)
1. **In `js/main.js`**:
   - Delete lines 136-156 entirely (the dead `darkToggle` block).
   - In the loader section (lines 127-134), streamline `hideLoader()` to execute immediately on `DOMContentLoaded` or `load` without unnecessary 1200ms delay.
2. **In `css/style.css`**:
   - Delete line 1024: `/* Dark Mode removed per user request */`.
   - Delete `.product-overlay .btn-primary::after` (lines 1105-1123).
   - Delete `@keyframes wa-shake` (lines 1096-1103).
   - Replace all instances of `rgba(164, 108, 77, ...)` with `rgba(var(--primary-rgb), ...)`.
   - Replace `#A46C4D` -> `var(--primary)`.
   - Replace `#825237` -> `var(--primary-dark)`.
   - Replace `#2C2C2C` -> `var(--secondary)`.
   - Replace `#F7F5F0` -> `var(--light)`.

### 4.5 Font Link Update in `index.html` (Feature #10)
Update line 10 in `index.html` to import `Plus Jakarta Sans` alongside `Outfit`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

### 4.6 Utility Classes Specification
Add the following foundational utility classes to `css/style.css`:
```css
/* --- Utility Classes --- */
.bg-light, .bg-warm-sand { background-color: var(--light) !important; }
.bg-dark, .bg-charcoal { background-color: var(--secondary) !important; }
.bg-white { background-color: var(--white) !important; }
.text-terracotta { color: var(--primary) !important; }
.text-charcoal { color: var(--secondary) !important; }
.text-concrete { color: var(--concrete-gray) !important; }
.text-muted { color: var(--text-muted) !important; }
.border-warm { border: 1px solid var(--border) !important; }
.shadow-sm { box-shadow: var(--shadow-sm) !important; }
.shadow-md { box-shadow: var(--shadow-md) !important; }
.shadow-lg { box-shadow: var(--shadow-lg) !important; }
.tracking-tight { letter-spacing: var(--tracking-tight) !important; }
.tracking-wide { letter-spacing: var(--tracking-wide) !important; }
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```

---

## 5. Verification Method

To verify these findings and confirm full compliance after Worker M1 completes the changes:

1. **Automated WCAG Contrast Check**:
   Run the PowerShell / Node.js contrast verification script:
   ```powershell
   powershell -Command "
   function Get-Lum(`$hex) {
       `$r = [Convert]::ToInt32(`$hex.Substring(1,2), 16) / 255.0
       `$g = [Convert]::ToInt32(`$hex.Substring(3,2), 16) / 255.0
       `$b = [Convert]::ToInt32(`$hex.Substring(5,2), 16) / 255.0
       `$conv = { param(`$c) if (`$c -le 0.03928) { `$c / 12.92 } else { [Math]::Pow((`$c + 0.055)/1.055, 2.4) } }
       `$rL = & `$conv `$r; `$gL = & `$conv `$g; `$bL = & `$conv `$b
       return (0.2126 * `$rL + 0.7152 * `$gL + 0.0722 * `$bL)
   }
   function Get-CR(`$h1, `$h2) {
       `$l1 = Get-Lum `$h1; `$l2 = Get-Lum `$h2
       `$max = [Math]::Max(`$l1, `$l2); `$min = [Math]::Min(`$l1, `$l2)
       return [Math]::Round((`$max + 0.05) / (`$min + 0.05), 2)
   }
   Write-Output ('Terracotta on White: ' + (Get-CR '#945738' '#FFFFFF') + ' (Expected: >= 4.50)')
   Write-Output ('Terracotta on Sand: ' + (Get-CR '#945738' '#F9F8F5') + ' (Expected: >= 4.50)')
   Write-Output ('Charcoal on White: ' + (Get-CR '#1A1B1E' '#FFFFFF') + ' (Expected: >= 7.00)')
   "
   ```
   **Pass Condition**: Terracotta on White $\ge 5.0$, Terracotta on Sand $\ge 5.0$, Charcoal on White $\ge 15.0$.

2. **Dead Code Elimination Verification**:
   Inspect `js/main.js` and `css/style.css` using ripgrep:
   ```powershell
   # Must return 0 matches
   git grep -i "darkToggle"
   git grep -i "dark-mode"
   git grep -i "wa-shake"
   git grep -i "#A46C4D"
   ```
   **Pass Condition**: 0 matches for old `#A46C4D`, 0 matches for `darkToggle`, and 0 matches for `wa-shake`.

3. **Lighthouse Accessibility Audit**:
   When loaded in Chrome/Edge, run Lighthouse Accessibility audit.
   **Pass Condition**: Zero contrast ratio flags on `.subtitle`, `.price`, `.product-card`, `.btn-primary`.
