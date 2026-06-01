// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { useDemoStore } from './store/useDemoStore'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
  localStorage.clear()
  useDemoStore.getState().resetDemoState()
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('App Assets navigation', () => {
  it('opens the Assets workbench from the top navigation', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })

    expect(container.querySelector('.assets-workbench')).not.toBeNull()
    expect(getButton(container, 'Assets').getAttribute('aria-current')).toBe('page')
    expect(container.textContent).toContain('项目文件')
    expect(container.textContent).toContain('公共文件')
    expect(container.textContent).not.toContain('个人')
    expect(findButton(container, '模板')).toBeUndefined()

    root.unmount()
  })

  it('shows Project File and File Asset distinctions in the default file list', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })

    expect(container.textContent).toContain('Project File')
    expect(container.textContent).toContain('File Asset')

    root.unmount()
  })

  it('filters the current Assets list and opens the upload dialog', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      const searchInput = container.querySelector<HTMLInputElement>(
        'input[aria-label="搜索当前资产"]',
      )
      if (!searchInput) {
        throw new Error('Assets search input not found')
      }
      const valueSetter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      )?.set
      valueSetter?.call(searchInput, 'baseline')
      searchInput.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          data: 'baseline',
          inputType: 'insertText',
        }),
      )
    })

    expect(container.textContent).toContain('EGFR_parent_antibody_baseline.xlsx')
    expect(container.textContent).not.toContain('BLI_run_0528.csv')

    act(() => {
      getButton(container, '上传').click()
    })

    expect(container.textContent).toContain('上传到文件空间')
    expect(container.textContent).toContain('CSV / XLSX / PARQUET')

    root.unmount()
  })

  it('keeps the Experiment asset menu as object groups only', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '实验').click()
    })

    expect(getButton(container, '需求')).toBeTruthy()
    expect(getButton(container, '执行')).toBeTruthy()
    expect(getButton(container, '库存')).toBeTruthy()
    expect(getButton(container, '配置')).toBeTruthy()
    expect(findButton(container, '模板')).toBeUndefined()

    root.unmount()
  })
})

function renderApp() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<App />)
  })

  return { container, root }
}

function findButton(container: HTMLElement, name: string) {
  return Array.from(container.querySelectorAll('button')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name,
  )
}

function getButton(container: HTMLElement, name: string) {
  const button = findButton(container, name)

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}
