import './showcase.css'

const BASE = import.meta.env.BASE_URL // '/theme/' in dev and prod

type Manifest = { versions: string[]; current: string }
type Token = { name: string; color: boolean; desc: string }

// Every token in tokens.css, in display order. Drives both the swatches
// (colors only) and the full reference table (all of them).
const TOKENS: Token[] = [
  { name: 'bg', color: true, desc: 'canvas / deepest wells' },
  { name: 'panel', color: true, desc: 'main surface, a hair above black' },
  { name: 'panel-2', color: true, desc: 'input & button backgrounds' },
  { name: 'border', color: true, desc: 'hairline borders' },
  { name: 'text', color: true, desc: 'primary text' },
  { name: 'muted', color: true, desc: 'labels, secondary text, icons' },
  { name: 'accent', color: true, desc: 'active / primary / interactive — the only hue' },
  { name: 'accent-dim', color: true, desc: 'hover / pressed / hover borders' },
  { name: 'warn', color: true, desc: 'caution states, distinct from accent' },
  { name: 'danger', color: true, desc: 'danger / destructive' },
  { name: 'font-pixel', color: false, desc: 'pixel display — titles only' },
  { name: 'font-mono', color: false, desc: 'base family — body + controls' },
]

const tokenValue = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()

// Re-reads live computed values, so both views track the selected version.
function renderTokens() {
  const swatches = document.querySelector<HTMLDivElement>('#swatches')
  if (swatches) {
    swatches.innerHTML = TOKENS.filter((t) => t.color)
      .map(
        (t) => `
      <div class="swatch">
        <span class="swatch-chip" style="background: var(--${t.name})"></span>
        <span class="swatch-name">--${t.name}</span>
        <span class="swatch-hex">${tokenValue(t.name)}</span>
      </div>`,
      )
      .join('')
  }

  const ref = document.querySelector<HTMLTableSectionElement>('#ref-body')
  if (ref) {
    ref.innerHTML = TOKENS.map((t) => {
      const chip = t.color
        ? `<span class="ref-chip" style="background: var(--${t.name})"></span>`
        : ''
      return `
      <tr>
        <td class="ref-name">${chip}<code>--${t.name}</code></td>
        <td class="ref-val">${tokenValue(t.name)}</td>
        <td class="ref-desc">${t.desc}</td>
      </tr>`
    }).join('')
  }
}

function wireCopy() {
  const btn = document.querySelector<HTMLButtonElement>('#copy-head')
  const snippet = document.querySelector<HTMLElement>('#head-snippet')
  if (!btn || !snippet) return
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(snippet.textContent ?? '')
      btn.textContent = 'copied ✓'
    } catch {
      btn.textContent = 'copy failed'
    }
    setTimeout(() => (btn.textContent = 'copy'), 1400)
  })
}

async function init() {
  wireCopy()

  // The active theme <link>, appended after the inlined seed <style> so it wins.
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.id = 'theme-active'
  link.addEventListener('load', renderTokens)
  document.head.appendChild(link)

  const select = document.querySelector<HTMLSelectElement>('#version')
  if (!select) return

  let data: Manifest
  try {
    data = await (await fetch(`${BASE}versions.json`)).json()
  } catch {
    data = { versions: [], current: '' }
  }

  const pin = document.querySelector<HTMLSpanElement>('#pin-cur')
  if (pin && data.current) pin.textContent = data.current

  for (const v of data.versions) {
    const opt = document.createElement('option')
    opt.value = v
    opt.textContent = v === data.current ? `${v} · current` : v
    if (v === data.current) opt.selected = true
    select.appendChild(opt)
  }

  const apply = (v: string) => {
    if (v) link.href = `${BASE}${v}/tokens.css`
  }
  select.addEventListener('change', () => apply(select.value))
  apply(data.current || data.versions.at(-1) || '')

  // Seed both views from the inlined tokens; the link's load event refreshes them.
  renderTokens()
}

init()
