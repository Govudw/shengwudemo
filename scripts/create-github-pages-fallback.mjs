import { copyFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distDir = process.argv[2] ?? 'dist'
const indexPath = join(distDir, 'index.html')
const fallbackPath = join(distDir, '404.html')

if (!existsSync(indexPath)) {
  throw new Error(`Cannot create GitHub Pages fallback: ${indexPath} does not exist.`)
}

copyFileSync(indexPath, fallbackPath)
