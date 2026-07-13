#!/usr/bin/env node
// Pull the promoted Amber Phosphor tokens into a local, gitignored copy.
//
// Why: the site loads tokens.css from theme.chakri.me at runtime, so there's no local
// file for VSCode IntelliSense to read. This drops one at .theme/tokens.css for
// the editor (and for offline reference). It is NOT loaded at runtime — the
// <link> in your <head> still serves the real thing — so mild drift is harmless;
// re-run this when the theme changes.
//
//   npm run pull-theme                       # promoted (latest) tokens
//   THEME_URL=https://theme.chakri.me/1.0.0/tokens.css npm run pull-theme   # pin a version

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const url = process.env.THEME_URL ?? 'https://theme.chakri.me/tokens.css'
const out = process.env.THEME_OUT ?? '.theme/tokens.css'

const res = await fetch(url)
if (!res.ok) {
  console.error(`pull-theme: ${url} → ${res.status} ${res.statusText}`)
  process.exit(1)
}

const css = await res.text()
await mkdir(path.dirname(out), { recursive: true })
await writeFile(out, css)
console.log(`pull-theme: ${url} → ${out} (${css.length} bytes)`)
