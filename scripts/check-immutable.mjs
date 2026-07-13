#!/usr/bin/env node
// Immutability guard (pre-commit).
//
// A version folder theme/<x.y.z>/ is frozen the moment it's committed — from then
// on a consumer may pin it, so its bytes must never change. This blocks any staged
// add / edit / delete / rename inside a version folder that already exists in HEAD.
// Draft folders (not yet committed) stay freely editable; new changes go in a NEW
// version via `npm run theme:new <x.y.z>`, not an edit to an old one.
//
// Bypass in a genuine pinch with: git commit --no-verify

import { execFileSync } from 'node:child_process'

const VERSION_DIR = /^theme\/(\d+\.\d+\.\d+)\//

const git = (args) => execFileSync('git', args, { encoding: 'utf8' })
// Same, but for existence probes: swallow the "fatal: …" stderr we expect on a miss.
const gitProbe = (args) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })

// No HEAD (first commit) → nothing is published yet, so nothing is frozen.
try {
  gitProbe(['rev-parse', '--verify', 'HEAD'])
} catch {
  process.exit(0)
}

// Staged paths: Added, Copied, Modified, Renamed, Deleted.
const staged = git(['diff', '--cached', '--name-only', '--diff-filter=ACMRD'])
  .split('\n')
  .filter(Boolean)

const published = new Map() // version -> is it already committed?
const violations = []

for (const file of staged) {
  const m = file.match(VERSION_DIR)
  if (!m) continue
  const version = m[1]
  if (!published.has(version)) {
    // `HEAD:theme/<v>` resolves to a tree only if the folder is already committed.
    let committed = true
    try {
      gitProbe(['cat-file', '-e', `HEAD:theme/${version}`])
    } catch {
      committed = false
    }
    published.set(version, committed)
  }
  if (published.get(version)) violations.push(file)
}

if (violations.length) {
  const versions = [...new Set(violations.map((f) => f.match(VERSION_DIR)[1]))]
  console.error('')
  console.error(`✗ immutability guard: ${versions.join(', ')} already published — frozen.`)
  console.error('')
  console.error('  Published versions can be pinned by consumers, so their bytes must not')
  console.error('  change. Cut a new version instead of editing an old one:')
  console.error('')
  console.error('    npm run theme:new <x.y.z>')
  console.error('')
  for (const f of violations) console.error(`    ✗ ${f}`)
  console.error('')
  console.error('  (Genuine exception? Bypass with: git commit --no-verify)')
  console.error('')
  process.exit(1)
}
