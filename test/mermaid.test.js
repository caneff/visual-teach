import { describe, it, expect, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dir = dirname(fileURLToPath(import.meta.url))
const SRC = readFileSync(join(__dir, '../assets/mermaid.js'), 'utf8')

// Execute the UMD module: in new Function() scope, `module` is not defined so
// the browser branch runs and assigns vtMermaid onto globalThis.
function loadVtm() {
  // eslint-disable-next-line no-new-func
  new Function(SRC)()
  return globalThis.vtMermaid
}

const vtm = loadVtm()

function makeDoc(mermaidCount = 0) {
  const nodes = Array.from({ length: mermaidCount }, () => ({ tagName: 'div' }))
  const scripts = []
  return {
    querySelectorAll(sel) { return sel === '.vt-mermaid' ? nodes : [] },
    createElement() { return { src: '', onload: null } },
    head: { appendChild(el) { scripts.push(el) } },
    documentElement: { dataset: {} },
    _scripts: scripts,
  }
}

describe('vtMermaid.init', () => {
  it('no-ops when no .vt-mermaid elements present', () => {
    const doc = makeDoc(0)
    vtm.init(doc, { cdn: 'https://fake/mermaid.js' })
    expect(doc._scripts).toHaveLength(0)
  })

  it('appends mermaid script when .vt-mermaid elements exist', () => {
    const doc = makeDoc(2)
    vtm.init(doc, { cdn: 'https://fake/mermaid.js' })
    expect(doc._scripts).toHaveLength(1)
    expect(doc._scripts[0].src).toBe('https://fake/mermaid.js')
  })

  it('uses default CDN URL when no cdn override given', () => {
    const doc = makeDoc(1)
    vtm.init(doc)
    expect(doc._scripts[0].src).toMatch(/mermaid/)
  })
})

describe('vtMermaid.readTokens', () => {
  it('returns fallback values when CSS vars are empty', () => {
    const mockGcs = () => ({ getPropertyValue: () => '' })
    const tokens = vtm.readTokens({}, mockGcs)
    expect(tokens.primaryColor).toBe('#1a73e8')
    expect(tokens.background).toBe('#ffffff')
    expect(tokens.mainBkg).toBe('#ffffff')
    expect(tokens.textColor).toBe('#1a1f2b')
    expect(tokens.lineColor).toBe('#5b6472')
  })

  it('returns CSS custom property values when set', () => {
    const vals = { '--vt-accent': '#ff4500', '--vt-paper': '#0a0a0a', '--vt-ink': '#eee' }
    const mockGcs = () => ({ getPropertyValue: (k) => vals[k] || '' })
    const tokens = vtm.readTokens({}, mockGcs)
    expect(tokens.primaryColor).toBe('#ff4500')
    expect(tokens.background).toBe('#0a0a0a')
    expect(tokens.mainBkg).toBe('#0a0a0a')
    expect(tokens.textColor).toBe('#eee')
  })

  it('trims whitespace from CSS var values', () => {
    const mockGcs = () => ({ getPropertyValue: () => '  #abc  ' })
    const tokens = vtm.readTokens({}, mockGcs)
    expect(tokens.primaryColor).toBe('#abc')
  })
})

describe('vtMermaid.isDark', () => {
  it('returns true when data-theme is "dark"', () => {
    expect(vtm.isDark({ dataset: { theme: 'dark' } })).toBe(true)
  })

  it('returns false when data-theme is "light"', () => {
    expect(vtm.isDark({ dataset: { theme: 'light' } })).toBe(false)
  })

  it('falls back to matchMedia and returns true when dark', () => {
    const mm = () => ({ matches: true })
    expect(vtm.isDark({ dataset: {} }, mm)).toBe(true)
  })

  it('falls back to matchMedia and returns false when light', () => {
    const mm = () => ({ matches: false })
    expect(vtm.isDark({ dataset: {} }, mm)).toBe(false)
  })

  it('returns false when no dataset and no matchMedia', () => {
    expect(vtm.isDark({ dataset: {} }, null)).toBe(false)
  })
})
