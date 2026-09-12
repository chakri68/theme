# consumer setup — Amber Phosphor theme

Drop-in bits for any site that uses the theme. The theme itself lives at
`theme.chakri.me` and loads at runtime; these files just give you editor
IntelliSense (and an offline copy) for the tokens.

## 1. Link the theme in your `<head>`

```html
<!-- Fonts: Press Start 2P (titles) + JetBrains Mono (everything) -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=block" />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap" />

<!-- Amber Phosphor theme tokens (cross-origin, tracks the promoted version) -->
<link rel="stylesheet" href="https://theme.chakri.me/tokens.css" />
```

Pin a version with `https://theme.chakri.me/<x.y.z>/tokens.css` if you need to freeze it.

## 2. Copy these files into your repo

- `.vscode/extensions.json` — recommends the CSS Variable Autocomplete extension
- `.vscode/settings.json` — points that extension at `.theme/tokens.css`
- `.gitignore` — ignores the pulled copy (merge into your existing one)
- `scripts/pull-theme.mjs` — fetches the tokens locally

Add the script to `package.json`:

```json
{ "scripts": { "pull-theme": "node scripts/pull-theme.mjs" } }
```

## 3. Pull the tokens for IntelliSense

```sh
npm run pull-theme
```

This writes `.theme/tokens.css` (gitignored). Install the recommended extension
and you get `var(--…)` autocomplete, hover values, and inline color swatches.
Re-run it whenever the theme changes — the local copy is editor-only, so drift
just means stale completions, never a runtime bug.

Pin a specific version for the local copy:

```sh
THEME_URL=https://theme.chakri.me/1.0.0/tokens.css npm run pull-theme
```

## 4. If the site can't make the request

A site whose own CSP forbids a cross-origin stylesheet — or that must work with
no network at all — vendors the tokens instead of linking them. Same script,
three differences: pin a version, write into `src/` rather than `.theme/`, and
**commit the output** so the build needs no network. The app's CSS then
`@import`s it on its first line. `local-vault` is the worked example; see
`ui_theme.md` §2.

Never hand-copy the `:root` block for this. A pasted copy is what drifts, and
drift is the whole reason this host exists.

A site with a service worker can keep the link instead and cache it — serve the
cached tokens instantly so it themes itself offline, and revalidate in the
background so the next load still picks up a theme edit. `dead-drop` does that.
