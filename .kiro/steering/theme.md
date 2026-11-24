---
inclusion: always
---

# Haunted Study Planner — Theme & Wording Rules

These rules apply to **every UI task** in the Haunted Study Planner. Follow them in all components, stylesheets, and copy.

## 1. Dark Purple & Orange Palette (CSS Variables)

Define the full palette once as CSS custom properties on `:root` and reference only those variables everywhere — never hard-code hex/rgb values in component CSS.

- **Background** — deep near-black with a purple cast (e.g. `#0d0a1a` / `#140c2b`).
- **Surface** — slightly lighter purple panels for cards, modals, and the dashboard (e.g. `#1e1334`).
- **Primary accent** — Halloween orange (e.g. `#ff7b00` / `#f0932b`), used for primary actions, active states, and highlights.
- **Secondary accent** — spectral purple/violet (e.g. `#9d4edd` / `#7b2cbf`), used for secondary actions, links, and decorative glow.
- **Text** — high-contrast off-white/cream on dark surfaces (e.g. `#f4f1de`).
- **Danger / restless** — a dim eerie red or sickly green for overdue/"restless ghost" indicators.
- **Banished** — a muted ethereal gray-blue for completed spirits.

Expose semantic tokens (e.g. `--bg`, `--surface`, `--text`, `--accent-primary`, `--accent-secondary`, `--danger`, `--banished`) so components stay decoupled from raw color values. Keep the palette cohesive: orange and purple should dominate; other colors are supporting roles only.

## 2. Gothic Google Font

Load a gothic/serif display font from Google Fonts (e.g. *Creepster*, *UnifrakturMaguntia*, or *Cinzel Decorative* for headings, paired with *EB Garamond* or *Spectral* for body). Use `@import` or a `<link>` in `index.html`. Apply the display font to headings and thematic copy, and a readable serif for body text. Ensure the font stack degrades gracefully (fallback to serif) if the font fails to load.

## 3. Text Contrast (≥ 4.5:1)

Maintain at least **4.5:1** contrast between text and its background for all normal text, and at least **3:1** for large text and UI component boundaries. Test dark backgrounds with off-white text and orange/purple accents — pure orange on dark purple often fails; use lighter accent variants or outlines for text. Never rely on color alone to convey meaning (pair color with an icon, label, or text).

## 4. Visible Focus Outlines

Every interactive element (`button`, `a`, `input`, `select`, `[tabindex]`, custom controls) must show a **clearly visible focus outline** when reached via keyboard. Use a high-contrast focus ring (e.g. a 2–3px solid orange or cream outline with a subtle offset) that stands out against the dark theme. Do not remove focus styles (`outline: none`) without replacing them with an equally visible alternative. Keep `:focus-visible` styling distinct from `:hover`/`:active`.

## 5. Reduced-Motion Support

Respect the user's `prefers-reduced-motion` setting. Wrap all non-essential/decorative animations (ghost animations, glows, floating effects, fades) in a `@media (prefers-reduced-motion: reduce)` block that **disables or replaces them with a simple fade**. The banish flow must still complete and persist data even when the full ghost animation is suppressed. Never block essential functionality behind an animation.

## 6. Spooky Halloween Wording

Use Halloween-themed vocabulary consistently throughout the UI copy:

- Assignments are **"spirits"** to banish.
- Completing an assignment **"banishes"** the spirit.
- Completed/deleted items are **"banished spirits"**.
- Restoring an item **"restores"** a banished spirit.
- Overdue tasks are **"restless ghosts"**.
- Deadlines **"rise"** — e.g. "Rises in 2 days", "Rises tonight".
- The dashboard tracks **"spirits banished"** and **"spirits remaining"**, and shows the **"most urgent spirit"**.
- Priority levels are themed: **Faint** (low), **Haunting** (medium), **Terrifying** (high).

Keep wording consistent across buttons, labels, empty states, toasts, and tooltips. Avoid breaking the theme with plain corporate phrasing (e.g. use "Banish Spirit" not "Mark as Complete").
