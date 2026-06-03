import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const githubRepositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'shengwudemo'
const githubPagesBase = process.env.GITHUB_PAGES === 'true' ? `/${githubRepositoryName}/` : '/'

// https://vite.dev/config/
export default defineConfig({
  base: githubPagesBase,
  plugins: [react()],
  test: {
    exclude: ['**/node_modules/**', '**/dist/**', '**/.worktrees/**'],
  },
})
