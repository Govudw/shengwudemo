// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import {
  modelAssetRecords,
  xtrimoModelRecords,
} from './data/assetsMockData'
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

describe('xTrimo model assets', () => {
  it('renders xTrimo as a dense platform model directory', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    expect(container.textContent).toContain('xTrimo')
    expect(container.textContent).toContain('33 模型')
    expect(container.textContent).toContain('24 已上线')
    expect(container.textContent).toContain('9 即将上线')
    expect(container.textContent).toContain('24 可调用')
    expect(container.textContent).toContain('Agent 推荐')
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoPFP')
    expect(findButton(container, '上传')).toBeUndefined()

    root.unmount()
  })

  it('filters xTrimo models by capability, entity, and lifecycle status', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, '亲和力').click()
    })

    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).toContain('xTrimoTCR-PeptideBinding')
    expect(container.textContent).not.toContain('xTrimoGene')

    act(() => {
      getButton(container, '抗体').click()
    })

    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoTCR-PeptideBinding')

    act(() => {
      getButton(container, '即将上线').click()
    })

    expect(container.textContent).toContain('xTrimoAAVViability')
    expect(container.textContent).toContain('仅预览')
    expect(container.textContent).not.toContain('可调用 · xTrimoAAVViability')

    root.unmount()
  })

  it('seeds realistic xTrimo model records with lifecycle and callability separated', () => {
    expect(xtrimoModelRecords).toHaveLength(33)
    expect(
      xtrimoModelRecords.filter((record) => record.status === 'online'),
    ).toHaveLength(24)
    expect(
      xtrimoModelRecords.filter((record) => record.status === 'comingSoon'),
    ).toHaveLength(9)
    expect(
      xtrimoModelRecords.filter((record) => record.callability === 'callable'),
    ).toHaveLength(24)
    expect(
      xtrimoModelRecords.filter(
        (record) => record.callability === 'previewOnly',
      ),
    ).toHaveLength(9)
    expect(
      xtrimoModelRecords.filter(
        (record) => record.projectFit === 'recommended',
      ),
    ).toHaveLength(6)
    expect(xtrimoModelRecords.every((record) => record.scope === 'public')).toBe(
      true,
    )
    expect(
      xtrimoModelRecords.some(
        (record) => record.name === 'xTrimoAbAffinity_DDG',
      ),
    ).toBe(true)
    expect(
      xtrimoModelRecords.some((record) => record.name === 'xTrimoAAVViability'),
    ).toBe(true)
  })

  it('keeps non-xTrimo model sections populated', () => {
    expect(
      modelAssetRecords.filter((record) => record.category === 'public-models')
        .length,
    ).toBeGreaterThanOrEqual(8)
    expect(
      modelAssetRecords.filter((record) => record.category === 'project-models')
        .length,
    ).toBeGreaterThanOrEqual(4)
    expect(
      modelAssetRecords.filter((record) => record.category === 'oracles').length,
    ).toBeGreaterThanOrEqual(4)
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
