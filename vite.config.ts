import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

/* The theme repo is BOTH the showcase site and the CSS host, deployed together
   at theme.chakri.me (its own origin — every consumer is cross-origin and links
   the absolute URL). Sources live in theme/<x.y.z>/*.css. This plugin:
     - dev:   serves /<v>/*.css, /tokens.css (promoted), /versions.json
     - build: emits every version at its pinned path + the promoted copy at the
              root (tokens.css) + versions.json into dist/
     - both:  inlines the promoted tokens into <head> so first paint is themed.
   "Promoted" = whatever package.json "version" points at. */

const THEME_DIR = 'theme'
const SEMVER = /^\d+\.\d+\.\d+$/

function cmpSemver(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i]
  return 0
}

function listVersions(root: string): string[] {
  const dir = path.join(root, THEME_DIR)
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && SEMVER.test(d.name))
    .map((d) => d.name)
    .sort(cmpSemver)
}

function promotedVersion(root: string): string {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  return pkg.version as string
}

function versionFiles(root: string, version: string): Record<string, string> {
  const dir = path.join(root, THEME_DIR, version)
  const out: Record<string, string> = {}
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith('.css')) out[f] = fs.readFileSync(path.join(dir, f), 'utf8')
  }
  return out
}

function themeHost(): Plugin {
  let root: string
  return {
    name: 'theme-host',
    configResolved(c: ResolvedConfig) {
      root = c.root
    },

    // Inline the promoted tokens so the page is themed on first paint (no FOUC).
    // The runtime <link> the showcase appends later overrides this when you
    // switch versions in the dropdown.
    transformIndexHtml(html) {
      const seed = versionFiles(root, promotedVersion(root))['tokens.css'] ?? ''
      return {
        html,
        tags: [
          { tag: 'style', attrs: { id: 'theme-seed' }, children: seed, injectTo: 'head' },
        ],
      }
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]

        // base is '/', so Vite serves the showcase at '/' — no redirect needed.
        if (url === '/versions.json') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ versions: listVersions(root), current: promotedVersion(root) }))
          return
        }

        // /<x.y.z>/<file>.css  (pinned)  or  /<file>.css  (promoted). Vite's own
        // CSS modules live under /src/… so they carry a slash and never match this.
        const m = url.match(/^\/(?:(\d+\.\d+\.\d+)\/)?([\w.-]+\.css)$/)
        if (m) {
          const version = m[1] ?? promotedVersion(root)
          const file = path.join(root, THEME_DIR, version, m[2])
          if (fs.existsSync(file)) {
            res.setHeader('Content-Type', 'text/css')
            res.end(fs.readFileSync(file))
          } else {
            // Own the whole *.css namespace: a miss is a 404 here too, matching
            // what GitHub Pages returns in prod (not Vite's HTML fallback).
            res.statusCode = 404
            res.end(`/* theme: no such file — ${version}/${m[2]} */`)
          }
          return
        }

        next()
      })
    },

    generateBundle() {
      const versions = listVersions(root)
      const current = promotedVersion(root)

      this.emitFile({
        type: 'asset',
        fileName: 'versions.json',
        source: JSON.stringify({ versions, current }),
      })

      for (const v of versions) {
        for (const [name, source] of Object.entries(versionFiles(root, v))) {
          this.emitFile({ type: 'asset', fileName: `${v}/${name}`, source }) // pinned
          if (v === current) this.emitFile({ type: 'asset', fileName: name, source }) // promoted copy
        }
      }
    },
  }
}

export default defineConfig({
  // Host is its own origin (theme.chakri.me), so everything lives at the root.
  base: '/',
  plugins: [themeHost()],
})
