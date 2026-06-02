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

    expect(getButton(container, '实验列表')).toBeTruthy()
    expect(getButton(container, '执行')).toBeTruthy()
    expect(getButton(container, '库存')).toBeTruthy()
    expect(getButton(container, '设备')).toBeTruthy()
    expect(getButton(container, '配方')).toBeTruthy()
    expect(findButton(container, '需求')).toBeUndefined()
    expect(findButton(container, '配置')).toBeUndefined()
    expect(findButton(container, '模板')).toBeUndefined()

    root.unmount()
  })

  it('renders experiment equipment and recipe assets from the new taxonomy', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '实验').click()
    })
    act(() => {
      getButton(container, '设备').click()
    })

    expect(container.textContent).toContain('Octet R8 - BLI')
    expect(container.textContent).not.toContain('BLI_KD_v2')

    act(() => {
      getButton(container, '配方').click()
    })

    expect(container.textContent).toContain('BLI_KD_v2')
    expect(container.textContent).toContain('实验配方')

    root.unmount()
  })

  it('switches experiment assets between card and table views and filters records', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '实验').click()
    })

    expect(getButton(container, '卡片').getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('.assets-experiment-table')).toBeNull()
    expect(container.textContent).toContain('EGFR Affinity Validation Design Package')

    act(() => {
      getButton(container, '表格').click()
    })

    expect(getButton(container, '表格').getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('.assets-experiment-table')).not.toBeNull()
    expect(container.textContent).toContain('订单草稿')

    setSearchInput(container, '搜索实验资产', 'HER2')

    expect(container.textContent).toContain('HER2 Wet-lab Validation Order')
    expect(container.textContent).not.toContain('EGFR Affinity Validation Design Package')

    root.unmount()
  })
})

describe('xTrimo model assets', () => {
  it('uses compact xTrimo-specific layout classes', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    expect(container.querySelector('.xtrimo-overview')).toBeNull()
    expect(container.querySelector('.xtrimo-stats')).toBeNull()
    expect(container.querySelector('.xtrimo-recommendations')).not.toBeNull()
    expect(container.querySelector('.xtrimo-filter-bar')).not.toBeNull()
    expect(container.querySelector('.assets-main--xtrimo > .assets-toolbar')).toBeNull()
    expect(container.querySelector('.assets-xtrimo-filter-search')).not.toBeNull()
    expect(container.querySelector('input[aria-label="搜索xTrimo模型"]')).not.toBeNull()
    expect(getButton(container, '综合')).toBeTruthy()
    expect(container.querySelector('.xtrimo-card-grid')).not.toBeNull()
    expect(
      container.querySelectorAll(
        '.xtrimo-recommendations .xtrimo-model-card--compact',
      ),
    ).toHaveLength(6)

    act(() => {
      getButton(container, '公开模型').click()
    })

    expect(container.querySelector('.xtrimo-overview')).toBeNull()
    expect(container.querySelector('.xtrimo-stats')).toBeNull()
    expect(container.querySelector('.xtrimo-recommendations')).toBeNull()
    expect(container.querySelector('.xtrimo-filter-bar')).toBeNull()
    expect(container.querySelector('.xtrimo-card-grid')).toBeNull()

    root.unmount()
  })

  it('renders xTrimo as a dense platform model directory', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    expect(container.textContent).toContain('xTrimo')
    expect(container.textContent).toContain('BioMap 自研 xTrimo 模型家族')
    expect(container.textContent).not.toContain('xTrimo 平台模型目录')
    expect(container.textContent).not.toContain('33 模型')
    expect(container.textContent).not.toContain('24 已上线')
    expect(container.textContent).not.toContain('9 即将上线')
    expect(container.textContent).not.toContain('24 可调用')
    expect(container.textContent).toContain('Agent 推荐')
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoPFP')
    expect(findButton(container, '新建')).toBeUndefined()
    expect(findButton(container, '上传')).toBeUndefined()
    expect(getButton(container, '更多资产操作')).toBeTruthy()

    root.unmount()
  })

  it('notifies when xTrimo callable and preview-only model actions are clicked', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getModelCardButton(container, 'xTrimoAbAffinity_DDG', '查看详情').click()
    })

    expect(getStatus(container).textContent).toContain(
      '模型详情将在后续 Demo 中展开',
    )

    act(() => {
      getButton(container, '即将上线').click()
    })
    act(() => {
      getModelCardButton(container, 'xTrimoAAVViability', '预览模型').click()
    })

    expect(getStatus(container).textContent).toContain(
      '该模型即将上线，当前仅支持预览',
    )

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

    expect(getButton(container, '亲和力').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).toContain('xTrimoTCR-PeptideBinding')
    expect(container.textContent).not.toContain('xTrimoGene')

    act(() => {
      getButton(container, '抗体').click()
    })

    expect(getButton(container, '抗体').getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoTCR-PeptideBinding')

    act(() => {
      getButton(container, '即将上线').click()
    })

    expect(getButton(container, '即将上线').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(getButton(container, '亲和力').getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(getButton(container, '抗体').getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).not.toContain('xTrimoAAVViability')

    act(() => {
      getButton(container, '全部状态').click()
    })
    act(() => {
      getButton(container, '全部能力').click()
    })
    act(() => {
      getButton(container, '全部实体').click()
    })
    act(() => {
      getButton(container, '即将上线').click()
    })

    expect(container.textContent).toContain('xTrimoAAVViability')
    expect(container.textContent).toContain('仅预览')
    expect(container.textContent).not.toContain('可调用 · xTrimoAAVViability')

    root.unmount()
  })

  it('searches xTrimo models by name, agent use, input, output, capability, and entity', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    setXtrimoSearch(container, 'xTrimoMonomer_Fast')
    expect(getModelCard(container, 'xTrimoMonomer_Fast')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

    setXtrimoSearch(container, 'MSA 辅助')
    expect(getModelCard(container, 'xTrimoMonomer')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

    setXtrimoSearch(container, '底物信息')
    expect(getModelCard(container, 'xTrimoEnzymeKcat')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

    setXtrimoSearch(container, 'Kcat 预测值')
    expect(getModelCard(container, 'xTrimoEnzymeKcat')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

    setXtrimoSearch(container, '细胞活力')
    expect(getModelCard(container, 'xTrimoAAVViability')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

    setXtrimoSearch(container, 'TCR-多肽-MHC')
    expect(getModelCard(container, 'xTrimoNeoantigen')).toBeTruthy()
    expect(findModelCard(container, 'xTrimoGene')).toBeUndefined()

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

function getStatus(container: HTMLElement) {
  const status = container.querySelector('[role="status"]')

  if (!status) {
    throw new Error('Status toast not found')
  }

  return status
}

function setXtrimoSearch(container: HTMLElement, value: string) {
  setSearchInput(container, '搜索xTrimo模型', value)
}

function setSearchInput(container: HTMLElement, label: string, value: string) {
  act(() => {
    const searchInput = container.querySelector<HTMLInputElement>(
      `input[aria-label="${label}"]`,
    )
    if (!searchInput) {
      throw new Error(`Search input not found: ${label}`)
    }
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    valueSetter?.call(searchInput, value)
    searchInput.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: value,
        inputType: 'insertText',
      }),
    )
  })
}

function findModelCard(container: HTMLElement, modelName: string) {
  return Array.from(container.querySelectorAll<HTMLElement>('.assets-record-card')).find(
    (card) => card.textContent?.includes(modelName),
  )
}

function getModelCard(container: HTMLElement, modelName: string) {
  const card = findModelCard(container, modelName)

  if (!card) {
    throw new Error(`Model card not found: ${modelName}`)
  }

  return card
}

function getModelCardButton(
  container: HTMLElement,
  modelName: string,
  buttonName: string,
) {
  const card = getModelCard(container, modelName)
  const button = findButton(card, buttonName)

  if (!button) {
    throw new Error(`Button not found for ${modelName}: ${buttonName}`)
  }

  return button
}
