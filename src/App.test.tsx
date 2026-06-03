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

describe('App Projects management', () => {
  it('opens the Projects management full page from the top navigation', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })

    expect(container.querySelector('.projects-page')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()
    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      container
        .querySelector('.projects-main__header')
        ?.classList.contains('projects-main__header--compact'),
    ).toBe(true)
    expect(
      container.querySelector('.projects-main__title')?.nextElementSibling,
    ).toBe(container.querySelector('.projects-main__actions'))
    expect(container.querySelector('.projects-main__eyebrow')).toBeNull()
    expect(container.querySelector('.projects-main__title p')).toBeNull()
    expect(container.textContent).toContain('项目管理')
    expect(container.textContent).toContain('我的收藏')
    expect(container.textContent).toContain('回收站')
    expect(container.textContent).not.toContain('草稿')
    expect(container.textContent).toContain('负责人')
    expect(container.textContent).toContain('读取权限')
    expect(container.textContent).toContain('编辑权限')
    expect(container.textContent).toContain('最近活动')

    root.unmount()
  })

  it('opens a project detail page inside Projects without changing routes', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '打开项目 Antibody Optimization').click()
    })

    expect(container.querySelector('.projects-detail-page')).not.toBeNull()
    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(
      container
        .querySelector('.projects-detail-header')
        ?.classList.contains('projects-detail-header--compact'),
    ).toBe(true)
    expect(
      container.querySelector('.projects-detail-header__copy')?.nextElementSibling,
    ).toBe(container.querySelector('.projects-detail-header__actions'))
    expect(container.querySelector('.projects-detail-header__eyebrow')).toBeNull()
    expect(container.querySelector('.projects-detail-header__copy p')).toBeNull()
    expect(container.querySelector('.projects-detail-back-button')?.textContent).toBe(
      '<',
    )
    expect(container.textContent).toContain('Antibody Optimization')
    expect(container.textContent).toContain('成员与权限')
    expect(container.textContent).toContain('项目上下文')
    expect(container.textContent).toContain('相关对话')
    expect(container.textContent).toContain('资产摘要')

    root.unmount()
  })

  it('does not start a Workspace draft for a trashed project record outside Workspace', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '回收站').click()
    })
    act(() => {
      getButton(container, '打开项目 Legacy Target Cleanup').click()
    })

    const newThreadButton = getButton(container, '新建对话') as HTMLButtonElement
    expect(newThreadButton.disabled).toBe(true)

    act(() => {
      newThreadButton.click()
    })

    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.querySelector('.projects-detail-page')).not.toBeNull()

    root.unmount()
  })

  it('starts a Workspace New Thread Draft from project detail', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '打开项目 Antibody Optimization').click()
    })
    act(() => {
      getButton(container, '新建对话').click()
    })

    expect(getButton(container, 'Workspace').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.querySelector('.workspace-main')?.getAttribute(
      'data-drafting-new-thread',
    )).toBe('true')
    expect(container.querySelector('.composer__project-button')?.textContent).toContain(
      'Antibody Optimization',
    )

    root.unmount()
  })

  it('opens a related project Thread in Workspace from project detail', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '打开项目 Antibody Optimization').click()
    })
    act(() => {
      getButton(container, '相关对话').click()
    })
    act(() => {
      getButton(container, '打开对话 EGFR 抗体亲和力优化').click()
    })

    expect(getButton(container, 'Workspace').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()
    expect(container.textContent).toContain('EGFR 抗体亲和力优化')

    root.unmount()
  })

  it('opens Project Files in Assets from the project asset summary', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '打开项目 Antibody Optimization').click()
    })
    act(() => {
      getButton(container, '资产摘要').click()
    })
    act(() => {
      getButton(container, '打开项目文件').click()
    })

    expect(getButton(container, 'Assets').getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('.assets-workbench')).not.toBeNull()
    expect(container.querySelector('.assets-folder-path')?.textContent).toContain(
      'Antibody Optimization',
    )

    root.unmount()
  })

  it('does not open Project Files when the project has no mapped folder', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })
    act(() => {
      getButton(container, '打开项目 Protein Delivery').click()
    })
    act(() => {
      getButton(container, '资产摘要').click()
    })

    const projectFilesButton = getButton(
      container,
      '打开项目文件',
    ) as HTMLButtonElement
    expect(projectFilesButton.disabled).toBe(true)

    act(() => {
      projectFilesButton.click()
    })

    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )

    root.unmount()
  })
})

describe('App Workspace project creation', () => {
  it('adds a named Project from the composer project menu and shows it in the sidebar', () => {
    const { container, root } = renderApp()

    act(() => {
      getComposerProjectButton(container).click()
    })
    act(() => {
      getButton(container, '新项目').click()
    })

    expect(container.textContent).toContain('为项目命名')

    setTextInput(container, '项目名称', 'Assay Automation')

    act(() => {
      getButton(container, '保存').click()
    })

    expect(container.textContent).not.toContain('为项目命名')
    expect(getComposerProjectButton(container).textContent).toContain(
      'Assay Automation',
    )
    expect(getSidebarProjectNames(container)).toContain('Assay Automation')

    root.unmount()
  })

  it('filters many Projects from a fixed search field inside the project menu', () => {
    act(() => {
      useDemoStore.getState().createProject('Assay Automation')
      useDemoStore.getState().createProject('Protein Analytics')
      useDemoStore.getState().createProject('Cell Therapy')
    })
    const { container, root } = renderApp()

    act(() => {
      getComposerProjectButton(container).click()
    })

    const menu = getComposerProjectMenu(container)

    expect(menu.querySelector('input[aria-label="搜索项目"]')).not.toBeNull()
    expect(menu.textContent).toContain('Protein Analytics')
    expect(menu.textContent).toContain('Cell Therapy')

    setTextInput(menu, '搜索项目', 'protein')

    expect(menu.textContent).toContain('Protein Analytics')
    expect(menu.textContent).toContain('Protein Delivery')
    expect(menu.textContent).not.toContain('Cell Therapy')
    expect(menu.textContent).not.toContain('Assay Automation')

    root.unmount()
  })

  it('keeps the project menu search and create actions fixed while only the project list scrolls', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.composer__project-menu')).toContain(
      'top: calc(100% + 2px);',
    )
    expect(getCssRule(appCss, '.composer__project-search')).toContain(
      'min-height: 36px;',
    )
    expect(getCssRule(appCss, '.composer__project-option')).toContain(
      'min-height: 36px;',
    )
    expect(getCssRule(appCss, '.composer__project-search')).toContain(
      'position: sticky;',
    )
    expect(getCssRule(appCss, '.composer__project-option-list')).toContain(
      'max-height: calc(36px * 5);',
    )
    expect(getCssRule(appCss, '.composer__project-option-list')).toContain(
      'overflow-y: auto;',
    )
    expect(getCssRule(appCss, '.composer__project-create-button')).toContain(
      'position: sticky;',
    )
    expect(getCssRule(appCss, '.composer__project-create-button')).toContain(
      'min-height: 36px;',
    )
  })

  it('uses compact text sizing in the project menu to match the sidebar thread rows', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.composer__project-search input')).toContain(
      'font-size: 13px;',
    )
    expect(getCssRule(appCss, '.composer__project-option')).toContain(
      'font-size: 13px;',
    )
    expect(getCssRule(appCss, '.composer__project-option')).toContain(
      'font-weight: 600;',
    )
    expect(getCssRule(appCss, '.composer__project-create-button')).toContain(
      'font-size: 13px;',
    )
  })
})

describe('App composer attachment menu', () => {
  it('opens attachment actions from the composer plus button', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Add context').click()
    })

    expect(container.querySelector('.attachment-menu')).not.toBeNull()
    expect(getButton(container, '从资产添加')).toBeTruthy()
    expect(getButton(container, '上传文件或图片')).toBeTruthy()

    act(() => {
      getButton(container, '从资产添加').click()
    })

    expect(container.querySelector('.attachment-menu')).toBeNull()
    expect(getStatus(container).textContent).toContain(
      '从资产添加将在后续 Demo 中展开',
    )

    root.unmount()
  })

  it('positions the composer attachment menu below the plus button with compact rows', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.composer__context-button')).toContain(
      'width: 34px;',
    )
    expect(getCssRule(appCss, '.composer__context-button')).toContain(
      'height: 34px;',
    )
    expect(getCssRule(appCss, '.composer__send-button')).toContain(
      'width: 40px;',
    )
    expect(
      getCssRule(appCss, '.composer__attachment-control .attachment-menu'),
    ).toContain('top: calc(100% + 6px);')
    expect(
      getCssRule(appCss, '.composer__attachment-control .attachment-menu'),
    ).toContain('bottom: auto;')
    expect(
      getCssRule(appCss, '.thread-composer__attachment-control .attachment-menu'),
    ).toContain('bottom: calc(100% + 6px);')
    expect(getCssRule(appCss, '.attachment-menu')).toContain(
      'padding: 5px;',
    )
    expect(getCssRule(appCss, '.attachment-menu__item')).toContain(
      'min-height: 36px;',
    )
    expect(getCssRule(appCss, '.attachment-menu__item')).toContain(
      'font-size: 13px;',
    )
  })
})

describe('App use case cards', () => {
  it('shows a task summary and fills a user-authored template when clicked', () => {
    const { container, root } = renderApp()

    const card = getUseCaseCard(container, '调研靶点机制与竞品')

    expect(card.querySelector('.use-case-grid__card-header')).not.toBeNull()
    expect(card.querySelector('.use-case-grid__card-summary')).not.toBeNull()
    expect(card.textContent).toContain('梳理靶点作用机制')

    act(() => {
      card.click()
    })

    const textarea = getTextarea(container, '研发目标或对话内容')

    expect(textarea.value).toContain('请帮我调研靶点机制与竞品。')
    expect(textarea.value).toContain('我的靶点名称如下：【】')
    expect(textarea.value).toContain('我的疾病背景 / 适应症如下：【】')
    expect(textarea.value).not.toContain('需要你提供')

    root.unmount()
  })

  it('uses a denser card layout with title and icon in one header row', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.use-case-card')).toContain('padding: 16px;')
    expect(getCssRule(appCss, '.use-case-card')).toContain(
      'min-height: 188px;',
    )
    expect(getCssRule(appCss, '.use-case-grid__card-header')).toContain(
      'display: flex;',
    )
    expect(getCssRule(appCss, '.use-case-grid__card-icon')).toContain(
      'width: 34px;',
    )
    expect(getCssRule(appCss, '.use-case-grid__card-summary')).toContain(
      '-webkit-line-clamp: 3;',
    )
  })
})

describe('App Assets navigation', () => {
  it('opens the Assets workbench from the top navigation', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })

    expect(container.querySelector('.assets-workbench')).not.toBeNull()
    expect(
      container.querySelector('.assets-main__header--workspace-bar'),
    ).not.toBeNull()
    expect(getButton(container, 'Assets').getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('.assets-main__title h1')?.textContent).toBe(
      '项目文件',
    )
    expect(container.querySelector('.assets-main__eyebrow')).toBeNull()
    expect(container.querySelector('.assets-main__title p')).toBeNull()
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
    expect(
      container.querySelectorAll('.xtrimo-model-card__thumbnail-image'),
    ).toHaveLength(39)
    expect(
      getModelCard(container, 'xTrimoGene')
        .querySelector('img')
        ?.getAttribute('alt'),
    ).toBe('xTrimoGene ModelHub preview')

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
    expect(container.textContent).not.toContain('BioMap 自研 xTrimo 模型家族')
    expect(container.querySelector('.assets-main__eyebrow')).toBeNull()
    expect(container.querySelector('.assets-main__title p')).toBeNull()
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
    expect(
      xtrimoModelRecords.every((record) =>
        record.thumbnailSrc.includes('/mock-biomap-os/modelhub/'),
      ),
    ).toBe(true)
    expect(
      xtrimoModelRecords.find((record) => record.name === 'xTrimoGene')
        ?.thumbnailSrc,
    ).toContain('xtrimo-gene.png')
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

function getComposerProjectButton(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>(
    '.composer__project-button',
  )

  if (!button) {
    throw new Error('Composer project button not found')
  }

  return button
}

function getComposerProjectMenu(container: HTMLElement) {
  const menu = container.querySelector<HTMLElement>('.composer__project-menu')

  if (!menu) {
    throw new Error('Composer project menu not found')
  }

  return menu
}

function getUseCaseCard(container: HTMLElement, title: string) {
  const card = Array.from(
    container.querySelectorAll<HTMLButtonElement>('.use-case-grid__card'),
  ).find((element) => element.textContent?.includes(title))

  if (!card) {
    throw new Error(`Use case card not found: ${title}`)
  }

  return card
}

function getTextarea(container: HTMLElement, label: string) {
  const textarea = container.querySelector<HTMLTextAreaElement>(
    `textarea[aria-label="${label}"]`,
  )

  if (!textarea) {
    throw new Error(`Textarea not found: ${label}`)
  }

  return textarea
}

function getSidebarProjectNames(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.sidebar__project-name')).map(
    (element) => element.textContent?.trim(),
  )
}

async function readAppCss() {
  // @ts-expect-error Vitest runs this test in Node, while app tsconfig omits Node built-in types.
  const { readFileSync } = await import('node:fs')

  return readFileSync('src/App.css', 'utf8') as string
}

function getCssRule(appCss: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = appCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  if (!match) {
    throw new Error(`CSS rule not found: ${selector}`)
  }

  return match[1]
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
  setTextInput(container, label, value)
}

function setTextInput(container: HTMLElement, label: string, value: string) {
  act(() => {
    const input = container.querySelector<HTMLInputElement>(
      `input[aria-label="${label}"]`,
    )
    if (!input) {
      throw new Error(`Input not found: ${label}`)
    }
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    valueSetter?.call(input, value)
    input.dispatchEvent(
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
