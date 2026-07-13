#!/usr/bin/env node
/* theme:new <x.y.z> — scaffold a new DRAFT version by copying the latest one.
   Draft only: it does NOT promote. Edit the new folder, preview it via the
   showcase dropdown, then promote by bumping package.json "version". */
import fs from 'node:fs'
import path from 'node:path'

const THEME_DIR = path.resolve(process.cwd(), 'theme')
const SEMVER = /^\d+\.\d+\.\d+$/
const arg = process.argv[2]

const fail = (msg) => {
  console.error(`✗ ${msg}`)
  process.exit(1)
}

const cmp = (a, b) => {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
  return 0
}

if (!arg) fail('usage: npm run theme:new <x.y.z>')
if (!SEMVER.test(arg)) fail(`"${arg}" is not a valid x.y.z version`)

const existing = fs.existsSync(THEME_DIR)
  ? fs
      .readdirSync(THEME_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && SEMVER.test(d.name))
      .map((d) => d.name)
      .sort(cmp)
  : []

if (existing.length === 0) fail('no existing versions in theme/ to copy from')

const latest = existing[existing.length - 1]
if (cmp(arg, latest) <= 0) fail(`${arg} must be greater than the latest version (${latest})`)

const src = path.join(THEME_DIR, latest)
const dst = path.join(THEME_DIR, arg)
fs.mkdirSync(dst)
let copied = 0
for (const f of fs.readdirSync(src)) {
  if (f.endsWith('.css')) {
    fs.copyFileSync(path.join(src, f), path.join(dst, f))
    copied++
  }
}

console.log(`✓ created theme/${arg} — copied ${copied} file(s) from ${latest}`)
console.log(`  next: edit it, preview via the showcase dropdown, then promote by`)
console.log(`  setting package.json "version" to ${arg}.`)
