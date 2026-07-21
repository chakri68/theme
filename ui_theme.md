# UI Style Guide — "Amber Phosphor Terminal"

A portable description of this project's UI aesthetic. Hand this to Claude Code in
another project to reproduce the same look and feel. It is stack-agnostic: the
original is hand-written CSS with **no framework** (no Tailwind, no component lib),
but the tokens and rules below translate directly to Tailwind, CSS-in-JS, etc.

---

## 1. The concept

A **pure-black, amber-phosphor CRT terminal** look — think an old monochrome
monitor, but warm amber instead of green. The vibe is retro-computing / hacker
sandbox: dark, dense, monospaced, with a single glowing amber accent doing all the
emphasis. It should feel like a tool, not a marketing page — compact controls,
tabular numbers, subtle glow, restrained motion.

Guiding principles:

- **One accent color, used sparingly.** Amber (`#ffb000`) marks the active/primary/
  interactive thing and nothing else. Everything else is grayscale-on-black.
- **Monospace everywhere.** Body text and controls are `JetBrains Mono`; a pixel
  font (`Press Start 2P`) is reserved for titles/headings only.
- **Dark, near-black surfaces** with low-contrast warm-gray borders.
- **Glow, not shadow, for emphasis.** Amber text gets `text-shadow` bloom.
- **Terminal affordances:** `>` prompt prefixes on headings, dashed "add" buttons,
  thin themed scrollbars, crosshair cursors.

---

## 2. Design tokens

The tokens live in **one place**: `https://theme.chakri.me/tokens.css` — a hosted
stylesheet that defines all of the custom properties below on `:root`. Every
chakri.me site is its own subdomain (its own origin), so it links this
cross-origin and gets the theme without redefining anything. Edit the tokens
once at the source and every consumer picks it up.

### If this is a chakri.me site (the default) — link the hosted tokens

Don't paste the `:root` block. Add these to `<head>`, in this order:

```html
<!-- Dark from frame zero: color-scheme governs the pre-paint canvas color,
     before any background rule (or the render-blocking token link) can paint. -->
<meta name="color-scheme" content="dark" />

<!-- Fonts as <head> links, NOT @import — the preload scanner can't see into
     CSS, so @import costs one extra serial round-trip before first paint. -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block"
  rel="stylesheet"
/>
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap"
  rel="stylesheet"
/>

<!-- Boot mask: pure-black, no visible content until the app has mounted and its
     styles are applied, then reveal — kills the flash of unstyled HTML (Vite
     injects app CSS via JS in dev; also guards a slow first load). The listener
     attaches at parse time so it fires even if app JS throws. -->
<style>
  html {
    background: #000;
  }
  body {
    visibility: hidden;
  }
</style>
<script>
  addEventListener("DOMContentLoaded", function () {
    requestAnimationFrame(function () {
      document.body.style.visibility = "visible";
    });
  });
</script>
<noscript><style>body { visibility: visible; }</style></noscript>

<!-- Amber Phosphor theme tokens — single source of truth -->
<link rel="stylesheet" href="https://theme.chakri.me/tokens.css" />
```

Notes:

- **Pin a version for production stability.** The floating
  `https://theme.chakri.me/tokens.css` always serves the current release; pin to
  a specific version with `https://theme.chakri.me/<x.y.z>/tokens.css` (e.g.
  `https://theme.chakri.me/1.0.0/tokens.css`) if you don't want a theme edit to
  reach the site until you bump it. Published version folders are immutable.
  `https://theme.chakri.me/versions.json` lists what's available.
- **Don't redefine the 12 shared tokens** (`--bg --panel-2 --panel --border
  --text --muted --accent --accent-dim --warn --danger --font-pixel
  --font-mono`) in a local `:root` — that shadows the source and drifts. Only
  add *project-specific* extras locally (a grid color, a trace palette, a radius
  scale), and use the canonical names above so nothing collides.
- **IntelliSense (optional):** point the CSS Variables extension at a local copy
  of the tokens so `var(--…)` autocompletes. See `consumer-template/` for the
  `.vscode` config and the `pull-theme` script that fetches `tokens.css` into a
  gitignored `.theme/`.

### If this is NOT a chakri.me site — copy the block inline

For a truly external project (no access to `theme.chakri.me`, or you want zero
network dependency), define these once yourself (CSS custom properties on
`:root`, or your framework's theme):

```css
:root {
  /* Surfaces (darkest → lightest) */
  --bg: #000000; /* pure black — canvas / deepest wells */
  --panel-2: #000; /* input & button backgrounds (also near-black) */
  --panel: #0b0b0a; /* main app + sidebar surface, a hair above black */

  /* Lines & text */
  --border: #2b2925; /* warm dark-gray hairline borders */
  --text: #ece7da; /* warm off-white — primary text */
  --muted: #8b8574; /* warm gray — labels, secondary text, icons */

  /* Accent — the ONLY chromatic color */
  --accent: #ffb000; /* amber phosphor — active/primary/interactive */
  --accent-dim: #cc8a00; /* hover / pressed / borders on hover */
  --warn: #ff6a2b; /* caution states, distinct from accent */

  /* Fonts */
  --font-pixel: "Press Start 2P", ui-monospace, monospace;
  --font-mono:
    "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
```

Ancillary colors used inline (keep these consistent if you extend):

- Danger / destructive text & border: `#ff6b6b` (hover), body copy `#ff9b9b`.
- Script/notice warn text: `#ffae85` on `rgba(255,106,43,0.09)` bg.
- Doc/comment green (code-comment tone): `#6f8f73` / `#6f8f73`.
- Scrollbar thumb: `#3a362e`, hover `rgba(255,176,0,0.45)`.
- Modal backdrop: `rgba(2,4,8,0.66)`.

**Never introduce a second bright hue.** Blues, greens, purples break the theme.
Warn-orange and danger-red are the only permitted deviations, and only for their
semantic role.

---

## 3. Typography

- **Load two Google Fonts:** `Press Start 2P` (pixel display) and
  `JetBrains Mono:wght@400;500;700`.
  - Pixel font: load with `display=block` (it must NEVER flash a fallback — the
    fallback shifts layout badly).
  - Mono font: load with `display=swap`.
- **Base family is `--font-mono`.** Applied on `:root`/`body` and all inputs/buttons.
- **Pixel font (`--font-pixel`) only for:** the app title (`h1`), the intro splash
  title, and modal headings (`h3`). Always amber, always with a glow text-shadow,
  always `letter-spacing: -0.5px`.
- **Sizes are small and dense.** Body 13px, labels/secondary 12px, fine print 11px.
  Pixel headings 12–15px (they read large for their px size).
- **Numbers use `font-variant-numeric: tabular-nums`** wherever they update live
  (stats, counters) so they don't jitter.
- Headings/labels that aren't the pixel title use **uppercase + letter-spacing**
  (`text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted)`).

---

## 4. Signature details (the things that make it feel "terminal")

These are the flourishes that carry the aesthetic. Reproduce them.

**`>` prompt prefix on section headings.** Sidebar `h2`s get a `::before { content: ">" }`
in amber. When a panel is collapsible, that same `>` doubles as the chevron:
rotate it 90° when collapsed.

```css
.sidebar h2::before {
  content: ">";
  color: var(--accent);
  display: inline-block;
  transition: transform 0.15s;
}
.panel.collapsed .panel-head::before {
  transform: rotate(90deg);
}
```

**Amber glow on titles.** `text-shadow: 0 0 14px rgba(255,176,0,0.5);` on the h1;
softer (`0 0 10px …0.4`) on modal headings.

**Dashed "add" buttons.** Actions that create a row (add rule, add condition) use a
full-width dashed border in muted gray, going amber on hover. Signals "insert here."

```css
.add-rule {
  background: none;
  border: 1px dashed var(--border);
  color: var(--muted);
  border-radius: 6px;
  width: 100%;
}
.add-rule:hover {
  color: var(--text);
  border-color: var(--accent);
}
```

**Thin themed scrollbars — no arrows, inset thumb.** A rounded `#3a362e` thumb that
turns amber on hover, floating clear of the edges rather than hugging them.

- The thumb is **inset**: give it a transparent border + `background-clip: padding-box`
  so the visible pill sits ~4px in on every side, and margin the track top/bottom so
  it clears rounded panel corners.

  ```css
  *::-webkit-scrollbar {
    width: 14px;
    height: 14px;
  }
  *::-webkit-scrollbar-track {
    margin: 8px 0;
    background: transparent;
  }
  *::-webkit-scrollbar-thumb {
    background: #3a362e;
    border-radius: 999px;
    border: 4px solid transparent; /* inset */
    background-clip: padding-box;
  }
  *::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 176, 0, 0.45);
    background-clip: padding-box;
  }
  ```

- **Gotcha — don't set the standard props alongside the WebKit ones.** Modern Chromium
  supports `scrollbar-width` / `scrollbar-color`; the moment either is set it switches
  to the standard scrollbar model, draws the OS up/down **stepper arrows**, and ignores
  every `::-webkit-scrollbar` rule. So keep the WebKit custom track for Chromium/Safari
  (it has no arrows), and scope the standard props to Firefox only, where `thin` is also
  arrow-free:

  ```css
  @supports not selector(::-webkit-scrollbar) {
    * {
      scrollbar-width: thin;
      scrollbar-color: #3a362e transparent;
    }
  }
  ```

  (Firefox has no way to inset the thumb, so it just gets the plain thin scrollbar.)

**Crosshair cursor** on the interactive canvas; `col-resize` on drag handles.

**Focus rings, not tap highlights.** Kill `-webkit-tap-highlight-color` and the
default `:focus` outline; give `:focus-visible` a `1px solid var(--accent)` ring
with `outline-offset: 1px`. Keyboard users get the amber ring; mouse users don't.

---

## 5. Component patterns

Consistent recipe: **near-black fill, 1px warm-gray border, small radius, amber on
interaction.** Radii scale with element size (inputs 4px, buttons/rows 5–8px,
cards/rules 9px, canvas/large 16px, pills 999px).

**Buttons** — `.btn`

```css
.btn {
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 12px;
  font-family: var(--font-mono);
  font-size: 13px;
  cursor: pointer;
  transition:
    background 0.12s,
    border-color 0.12s;
}
.btn:hover {
  border-color: var(--accent-dim);
} /* border warms, no fill */
.btn.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #000;
  font-weight: 600;
} /* solid amber, black text */
.btn.primary:hover {
  background: var(--accent-dim);
  border-color: var(--accent-dim);
}
```

Icon-only buttons (`.btn-icon`) go amber on hover instead of just the border.
Small square icon buttons (`.icon-btn`, 26×26) start muted, text goes `--text` and
border `--accent-dim` on hover; a `.danger` variant goes red.

**Inputs / selects** — near-black fill, hairline border, 4px radius, 13px mono.

```css
select,
input[type="text"],
input[type="number"] {
  background: var(--panel-2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 6px 8px;
  font-family: var(--font-mono);
  font-size: 13px;
}
```

On focus, text inputs / editors switch border to `--accent` (no glow).

**Cards / grouped blocks** — `.rule`, `.species-card`

```css
background: var(--panel-2);
border: 1px solid var(--border);
border-radius: 9px;
padding: 10px;
```

**Selectable rows** — transparent border by default; when `.active`, border becomes
amber and background lifts to `--panel-2`. Hover just lifts the background.

**Chips / tags / pills** — `border-radius: 999px`, muted by default; the `.on`
state gets amber border + amber text + bold.

```css
.chip {
  border-radius: 999px;
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 3px 9px;
  font-size: 11px;
}
.chip.on {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 700;
}
```

**Sliders** — `accent-color: var(--accent)` (or `--warn` in a warning row).

**Modals** — centered over a `rgba(2,4,8,0.66)` backdrop; panel is `--panel`,
hairline border, 8px radius, `box-shadow: 0 18px 60px rgba(0,0,0,.55)`, pixel-font
amber heading. Enter with a small fade + pop (see motion).

**Inline notices / errors** — tinted translucent bg + matching 1px border in the
semantic color (warn-orange for warnings, `#ff6b6b` red for errors), small mono
text. Toggled by a `.show` class, hidden by default.

---

## 6. Layout

- **App shell is flexbox**, full-viewport (`html, body, #app { height: 100% }`),
  `overflow: hidden` on the shell; internal panes scroll.
- **Main + right sidebar** split. Sidebar is a fixed `380px`, `flex-shrink: 0`,
  scrolls internally with `scrollbar-gutter: stable`.
- **A draggable resizer** (`col-resize`, a small rounded grip with a 3-dot
  `::before`) separates the panes; during drag, add `body.resizing` to force the
  cursor and disable canvas pointer events / text selection.
- **The primary content well** (canvas here) sits on pure `--bg`, inset with margin
  and a large `16px` radius — a rounded black "screen."
- **Bottom control bar** — a horizontal flex row, `flex-wrap: wrap`, `gap: 10px`, with a
  right-aligned stats cluster (`margin-left: auto`).
- Generous `gap`s (6–12px) instead of margins for control spacing.

---

## 7. Motion

Motion is **subtle, fast, and purposeful.** Transitions are 0.12–0.15s on
background/border/color only. Larger entrance animations exist but are short and
eased.

- **Boot sequence:** an intro overlay is in the DOM from first paint (so the app
  never flashes unstyled), kept dormant via a `.booting` class; JS adds `.booted`
  _only once the pixel font has loaded_, then runs the whole sequence off one shared
  timeline (title appears → glows → flies up and shrinks → sidebar slides in from
  the right → control bar rises from the bottom).
- **Title glow** pulses via an infinite alternating `text-shadow` keyframe.
- **Modals** fade the backdrop (`0.16s ease-out`) and pop the panel
  (`translateY(10px) scale(0.97) → 0/1`, `0.19s cubic-bezier(.2,.8,.2,1)`).
- **Always honor `prefers-reduced-motion: reduce`** — hide the intro entirely and
  set all animated chrome to its resting state (`opacity:1; transform:none;
animation:none`).

Standard easings used: `ease`, `ease-out`, and `cubic-bezier(.2,.9,.2,1)` /
`cubic-bezier(.2,.8,.2,1)` for springy entrances.

---

## 8. Quick checklist to reproduce the look

- [ ] Pure-black background, near-black panels, warm-gray hairline borders.
- [ ] One amber accent (`#ffb000`) for all active/primary/interactive states; nothing
      else colored except semantic warn-orange / danger-red.
- [ ] JetBrains Mono base; Press Start 2P (pixel) for titles only, always amber +
      glow.
- [ ] `>` prompt prefix on section headings (doubles as collapse chevron).
- [ ] Small, dense controls; tabular-nums on live numbers.
- [ ] Border-warms-on-hover buttons; solid-amber primary with black text.
- [ ] Dashed "add" buttons, pill chips with amber `.on` state.
- [ ] Thin amber-on-hover scrollbars — inset thumb, no stepper arrows (WebKit custom
      track; standard `scrollbar-*` props scoped to Firefox only); amber
      `:focus-visible` ring; no tap highlight.
- [ ] Fast (0.12s) color/border transitions; short eased entrances; reduced-motion
      fallback.
