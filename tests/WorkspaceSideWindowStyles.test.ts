/// <reference types="node" />

import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

describe('workspace side window file tree styles', () => {
  it('keeps the object file tree visually compact', () => {
    expect(appCss).toContain('grid-template-columns: 26px minmax(0, 1fr);')
    expect(appCss).toContain('min-height: 32px;')
    expect(appCss).toContain('width: 24px;')
    expect(appCss).toContain('height: 22px;')
    expect(appCss).toContain('font-size: 12px;')
  })
})
