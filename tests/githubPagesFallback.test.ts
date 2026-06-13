/// <reference types="node" />

import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

const tempDirs: string[] = []

function createTempDist() {
  const distDir = mkdtempSync(join(tmpdir(), 'biomap-gh-pages-fallback-'))
  tempDirs.push(distDir)
  return distDir
}

afterEach(() => {
  while (tempDirs.length) {
    const distDir = tempDirs.pop()

    if (distDir) {
      rmSync(distDir, { recursive: true, force: true })
    }
  }
})

describe('GitHub Pages SPA fallback', () => {
  it('copies the built index file to 404.html for direct thread URL access', () => {
    const distDir = createTempDist()
    const indexHtml = '<!doctype html><div id="root"></div>'

    writeFileSync(join(distDir, 'index.html'), indexHtml)
    writeFileSync(join(distDir, '404.html'), 'old fallback')

    execFileSync(
      process.execPath,
      [new URL('../scripts/create-github-pages-fallback.mjs', import.meta.url).pathname, distDir],
      { stdio: 'pipe' },
    )

    expect(readFileSync(join(distDir, '404.html'), 'utf8')).toBe(indexHtml)
  })
})
