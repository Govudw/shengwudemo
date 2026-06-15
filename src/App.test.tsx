// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { getExternalPath, getInternalPathname } from './appRouting'
import {
  modelAssetRecords,
  xtrimoModelRecords,
} from './data/assetsMockData'
import {
  getFilteredTemplates,
  getTemplatePage,
  homeTemplates,
} from './data/homeTemplates'
import { useDemoStore } from './store/useDemoStore'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  useDemoStore.getState().resetDemoState()
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('App Product Management Platform route', () => {
  it('opens Approval Center from the account dropdown without adding a top-level tab', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '审批中心').click()
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.approval-center')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()
    expect(container.textContent).toContain('审批中心')
    expect(container.textContent).toContain('外部审批')
    expect(container.textContent).toContain('Workspace')

    root.unmount()
  })

  it('keeps persisted Approval Center visible on root load', () => {
    useDemoStore.setState({ activeTopNav: 'ApprovalCenter' })
    const { container, root } = renderApp()

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.approval-center')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()
    expect(useDemoStore.getState().activeTopNav).toBe('ApprovalCenter')

    root.unmount()
  })

  it('opens Product Management Platform from the account dropdown with a URL route', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '管理后台').click()
    })

    expect(window.location.pathname).toBe('/product-management-platform')
    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()

    root.unmount()
  })

  it('renders Product Management Platform on direct route visits', () => {
    window.history.replaceState(null, '', '/product-management-platform')
    const { container, root } = renderApp()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(container.textContent).toContain('产品管理')

    root.unmount()
  })

  it('renders a product detail page on direct product detail route visits', () => {
    window.history.replaceState(
      null,
      '',
      '/product-management-platform/products/product-virtual-cell',
    )
    const { container, root } = renderApp()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()
    expect(container.querySelector('.commodity-detail')).not.toBeNull()
    expect(container.textContent).toContain('虚拟细胞')
    expect(container.textContent).toContain('产品概览')
    expect(container.textContent).toContain('产品版本记录')

    root.unmount()
  })

  it('returns from product detail to the persisted product list route', () => {
    window.history.replaceState(
      null,
      '',
      '/product-management-platform/products/product-virtual-cell',
    )
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '返回产品列表').click()
    })

    expect(window.location.pathname).toBe('/product-management-platform')
    expect(getButton(container, '产品管理').getAttribute('aria-selected')).toBe('true')
    expect(container.querySelector('.commodity-detail')).toBeNull()
    expect(container.textContent).toContain('PROD-VCELL')
    expect(container.textContent).toContain('+ 新建产品')

    root.unmount()
  })

  it('persists the commodity list with a direct commodity route', () => {
    window.history.replaceState(null, '', '/product-management-platform/commodities')
    const { container, root } = renderApp()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe('true')
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(container.textContent).toContain('+ 新建商品')

    root.unmount()
  })

  it('renders a commodity detail page on direct detail route visits', () => {
    window.history.replaceState(
      null,
      '',
      '/product-management-platform/commodities/commodity-virtual-cell-saas',
    )
    const { container, root } = renderApp()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(container.querySelector('.agent-shell')).toBeNull()
    expect(container.querySelector('.commodity-detail')).not.toBeNull()
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(container.textContent).toContain('商品概览')

    root.unmount()
  })

  it('returns from commodity detail to the persisted commodity list route', () => {
    window.history.replaceState(
      null,
      '',
      '/product-management-platform/commodities/commodity-virtual-cell-saas',
    )
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '返回商品列表').click()
    })

    expect(window.location.pathname).toBe('/product-management-platform/commodities')
    expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe('true')
    expect(container.querySelector('.commodity-detail')).toBeNull()
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(container.textContent).toContain('+ 新建商品')

    root.unmount()
  })

  it('persists the commodity list URL when opening 商品管理 from the platform shell', () => {
    window.history.replaceState(null, '', '/product-management-platform')
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '商品管理').click()
    })

    expect(window.location.pathname).toBe('/product-management-platform/commodities')
    expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe('true')
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')

    root.unmount()
  })

  it('returns to the main app when browser history goes back from Product Management Platform', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '管理后台').click()
    })
    act(() => {
      window.history.back()
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.product-platform-page')).toBeNull()
    expect(container.querySelector('.agent-shell')).not.toBeNull()

    root.unmount()
  })
})

describe('App Thread URL route', () => {
  it('keeps Thread routes under the configured GitHub Pages base path', () => {
    const routeId = '00pi1l7n010b2jvo'

    expect(getInternalPathname('/shengwudemo/c/00pi1l7n010b2jvo', '/shengwudemo')).toBe(
      `/c/${routeId}`,
    )
    expect(getInternalPathname('/shengwudemo/', '/shengwudemo')).toBe('/')
    expect(getExternalPath(`/c/${routeId}`, '/shengwudemo')).toBe(
      `/shengwudemo/c/${routeId}`,
    )
    expect(getExternalPath('/', '/shengwudemo')).toBe('/shengwudemo/')
  })

  it('opens a Workspace Thread from a direct /c route id URL', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    window.history.replaceState(null, '', `/c/${thread.routeId}`)

    const { container, root } = renderApp()

    expect(window.location.pathname).toBe(`/c/${thread.routeId}`)
    expect(container.querySelector('.product-platform-page')).toBeNull()
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()
    expect(container.textContent).toContain('LIMS 酶合成执行编排')
    expect(useDemoStore.getState().selectedProjectId).toBe('pipeline-build')
    expect(useDemoStore.getState().expandedProjectIds).toContain('pipeline-build')

    root.unmount()
  })

  it('keeps legacy root route id URLs compatible', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    window.history.replaceState(null, '', `/${thread.routeId}`)

    const { container, root } = renderApp()

    expect(window.location.pathname).toBe(`/${thread.routeId}`)
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()
    expect(container.textContent).toContain('LIMS 酶合成执行编排')

    root.unmount()
  })

  it('treats the root URL as the Workspace new conversation even with persisted navigation state', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    act(() => {
      useDemoStore.setState({
        activeTopNav: 'Projects',
        selectedProjectId: 'pipeline-build',
        selectedThreadId: thread.id,
        isDraftingNewThread: false,
      })
    })

    const { container, root } = renderApp()

    expect(window.location.pathname).toBe('/')
    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
    expect(useDemoStore.getState().selectedThreadId).toBeNull()
    expect(container.querySelector('.workspace-main--thread')).toBeNull()
    expect(container.querySelector('.composer')).not.toBeNull()

    root.unmount()
  })

  it('updates the browser URL when selecting a Thread from the sidebar', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    const { container, root } = renderApp()

    act(() => {
      getSidebarThreadButton(container, 'LIMS 酶合成执行编排').click()
    })

    expect(window.location.pathname).toBe(`/c/${thread.routeId}`)
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()

    root.unmount()
  })

  it('navigates a newly submitted Thread draft to its route id URL', () => {
    const { container, root } = renderApp()

    setTextarea(container, '研发目标或对话内容', '新建一个 URL 化测试 Thread')
    act(() => {
      getButton(container, 'Send').click()
    })

    const state = useDemoStore.getState()
    const selectedThread = state.projects
      .flatMap((project) => project.threads)
      .find((thread) => thread.id === state.selectedThreadId)

    expect(selectedThread?.routeId).toMatch(/^[a-z0-9]{16}$/)
    expect(window.location.pathname).toBe(`/c/${selectedThread?.routeId}`)
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()

    root.unmount()
  })

  it('uses browser back to return from a Thread URL to the new conversation route', () => {
    const { container, root } = renderApp()

    act(() => {
      getSidebarThreadButton(container, 'LIMS 酶合成执行编排').click()
    })
    act(() => {
      window.history.back()
      window.dispatchEvent(new PopStateEvent('popstate'))
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.workspace-main--thread')).toBeNull()
    expect(container.querySelector('.composer')).not.toBeNull()

    root.unmount()
  })

  it('returns to the root URL when starting a new conversation from a Thread URL', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    window.history.replaceState(null, '', `/c/${thread.routeId}`)
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '新对话').click()
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.workspace-main--thread')).toBeNull()
    expect(container.querySelector('.composer')).not.toBeNull()

    root.unmount()
  })

  it('keeps Product Management Platform routes out of Thread routing', () => {
    window.history.replaceState(null, '', '/product-management-platform')
    const { container, root } = renderApp()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(window.location.pathname).toBe('/product-management-platform')

    root.unmount()
  })

  it('does not let the root URL sync steal top navigation from a Thread URL', () => {
    const thread = getStoreThread(
      'pipeline-build',
      'pipeline-build-lims-enzyme-synthesis',
    )
    window.history.replaceState(null, '', `/c/${thread.routeId}`)
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.projects-page')).not.toBeNull()
    expect(useDemoStore.getState().activeTopNav).toBe('Projects')

    act(() => {
      getButton(container, 'Workspace').click()
    })

    expect(window.location.pathname).toBe(`/c/${thread.routeId}`)
    expect(container.querySelector('.workspace-main--thread')).not.toBeNull()

    root.unmount()
  })

  it('returns to the root URL when a route id does not match a Thread', () => {
    window.history.replaceState(null, '', '/c/0000000000000000')
    const { container, root } = renderApp()

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.workspace-main--thread')).toBeNull()
    expect(getStatus(container).textContent).toContain('Thread 不存在或已被删除')

    root.unmount()
  })
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
      '从资产添加尚未接入当前工作区',
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

describe('App home templates', () => {
  it('shows the first 30 home templates with total count and four pagination buttons', () => {
    const { container, root } = renderApp()

    expect(getTemplateCards(container)).toHaveLength(30)
    expect(getTemplateSection(container).textContent).toContain('100 个模板')
    expect(
      Array.from(
        getTemplateSection(container).querySelectorAll<HTMLButtonElement>(
          '.template-section__page',
        ),
      ).map((button) => button.textContent?.trim()),
    ).toEqual(['1', '2', '3', '4'])
    expect(getTemplateCard(container, '靶点竞品研究').textContent).toContain(
      '梳理靶点价值、竞品布局与关键差异。',
    )

    root.unmount()
  })

  it('refreshes results and returns to page one when filtering by direction and featured templates', () => {
    const { container, root } = renderApp()

    act(() => {
      getTemplatePageButton(container, '2').click()
    })
    const secondPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, {}, ''),
      2,
      30,
    )
    expect(getTemplateCards(container)[0].textContent).toContain(
      secondPage.items[0].title,
    )
    expect(getTemplatePageButton(container, '2').getAttribute('aria-current')).toBe(
      'page',
    )

    act(() => {
      getButton(container, '抗体').click()
    })

    const antibodyFirstPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, { direction: '抗体' }, ''),
      1,
      30,
    )
    expect(getTemplateCards(container)).toHaveLength(
      Math.min(30, antibodyFirstPage.totalItems),
    )
    expect(getTemplateCards(container)[0].textContent).toContain(
      antibodyFirstPage.items[0].title,
    )
    expect(getTemplatePageButton(container, '1').getAttribute('aria-current')).toBe(
      'page',
    )

    act(() => {
      getButton(container, '推荐').click()
    })

    const featuredAntibodyFirstPage = getTemplatePage(
      getFilteredTemplates(
        homeTemplates,
        { scope: '推荐', direction: '抗体' },
        '',
      ),
      1,
      30,
    )
    expect(getTemplateCards(container)).toHaveLength(
      Math.min(30, featuredAntibodyFirstPage.totalItems),
    )
    expect(getTemplateCards(container)[0].textContent).toContain(
      featuredAntibodyFirstPage.items[0].title,
    )
    expect(featuredAntibodyFirstPage.totalItems).toBeLessThanOrEqual(30)
    expect(
      getTemplateSection(container).querySelector('.template-section__pagination'),
    ).toBeNull()

    root.unmount()
  })

  it('searches visible template fields immediately, can clear, and does not match hidden prompt text', () => {
    const { container, root } = renderApp()

    setSearchInput(container, '搜索模板', 'CDR')
    expect(getTemplateCards(container)).toHaveLength(1)
    expect(getTemplateCard(container, 'CDR突变设计')).toBeTruthy()

    setSearchInput(container, '搜索模板', 'weekly/risk')
    expect(getTemplateCards(container)).toHaveLength(0)
    expect(getTemplateSection(container).textContent).toContain('未找到匹配模板')

    setSearchInput(container, '搜索模板', '')
    expect(getTemplateCards(container)).toHaveLength(30)

    root.unmount()
  })

  it('fills the composer with a user-authored prompt without sending or adding a capability tag', async () => {
    const { container, root } = renderApp()

    const card = getTemplateCard(container, '靶点竞品研究')

    expect(card.querySelector('.template-card__header')).not.toBeNull()
    expect(card.querySelector('.template-card__summary')).not.toBeNull()
    expect(card.querySelector('.template-card__tag-row')).not.toBeNull()

    act(() => {
      card.click()
    })
    await act(async () => {
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => resolve())
      })
    })

    const textarea = getTextarea(container, '研发目标或对话内容')

    expect(textarea.value).toBe(homeTemplates[0].prompt)
    expect(textarea.value).toContain('请你作为Agent')
    expect(textarea.value).not.toContain('需要你提供')
    expect(container.querySelector('.composer__capability-tag')).toBeNull()
    expect(document.activeElement).toBe(textarea)
    expect(textarea.selectionStart).toBe(textarea.value.length)
    expect(textarea.selectionEnd).toBe(textarea.value.length)
    expect(container.querySelector('.workspace-main--thread')).toBeNull()

    root.unmount()
  })

  it('does not render the old home capability buttons or use case cards', () => {
    const { container, root } = renderApp()

    expect(findButton(container, '知识调研')).toBeUndefined()
    expect(findButton(container, '实验设计')).toBeUndefined()
    expect(findButton(container, '更多')).toBeUndefined()
    expect(container.querySelector('.use-case-grid__card')).toBeNull()
    expect(container.querySelector('.use-case-grid__chips')).toBeNull()

    root.unmount()
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

  it('renders the Knowledge Base asset list from the Assets navigation', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '知识库').click()
    })

    const assetsMain = getAssetsMain(container)
    expect(assetsMain.querySelector('.assets-main__title h1')?.textContent).toBe(
      '全部知识库',
    )
    expect(assetsMain.querySelector('.knowledge-assets-table')).not.toBeNull()
    expect(assetsMain.textContent).toContain('EGFR 抗体亲和力优化知识库')
    expect(assetsMain.textContent).toContain('GraphRAG')

    root.unmount()
  })

  it('filters Knowledge Base assets from the RAG menu item', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '知识库').click()
    })
    act(() => {
      getButton(container, 'RAG').click()
    })

    const assetsMain = getAssetsMain(container)
    expect(assetsMain.querySelector('.knowledge-assets-table')).not.toBeNull()
    expect(assetsMain.textContent).toContain('xTrimo API 与模型调用知识库')
    expect(assetsMain.textContent).toContain('RAG')
    expect(assetsMain.textContent).not.toContain('EGFR 抗体亲和力优化知识库')

    root.unmount()
  })

  it('opens Knowledge Base detail tabs and returns to the list', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '知识库').click()
    })
    act(() => {
      getButton(container, '打开 EGFR 抗体亲和力优化知识库').click()
    })

    let assetsMain = getAssetsMain(container)
    expect(assetsMain.querySelector('[role="tablist"]')).not.toBeNull()
    expect(getButton(assetsMain, '知识库概览').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(assetsMain.textContent).toContain('覆盖 EGFR-P0')

    act(() => {
      getButton(assetsMain, '使用文件').click()
    })

    assetsMain = getAssetsMain(container)
    expect(getButton(assetsMain, '使用文件').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(assetsMain.textContent).toContain('EGFR_parent_antibody_baseline.xlsx')

    act(() => {
      getButton(assetsMain, '版本记录').click()
    })

    assetsMain = getAssetsMain(container)
    expect(getButton(assetsMain, '版本记录').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(assetsMain.textContent).toContain('v3')

    act(() => {
      getButton(assetsMain, '返回知识库列表').click()
    })

    assetsMain = getAssetsMain(container)
    expect(assetsMain.querySelector('.assets-main__title h1')?.textContent).toBe(
      '全部知识库',
    )
    expect(assetsMain.querySelector('.knowledge-assets-table')).not.toBeNull()

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
      '模型详情尚未接入当前工作区',
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

function getStoreThread(projectId: string, threadId: string) {
  const thread = useDemoStore
    .getState()
    .projects.find((project) => project.id === projectId)
    ?.threads.find((currentThread) => currentThread.id === threadId)

  if (!thread) {
    throw new Error(`Thread fixture not found: ${projectId}/${threadId}`)
  }

  return thread
}

function getSidebarThreadButton(container: HTMLElement, title: string) {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('.sidebar__thread-select'),
  ).find((element) =>
    element.querySelector('.sidebar__thread-title')?.textContent?.trim() === title,
  )

  if (!button) {
    throw new Error(`Sidebar thread button not found: ${title}`)
  }

  return button
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

function getAssetsMain(container: HTMLElement) {
  const assetsMain = container.querySelector<HTMLElement>('.assets-main')

  if (!assetsMain) {
    throw new Error('Assets main pane not found')
  }

  return assetsMain
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

function getAccountButton(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>('.top-nav__user')

  if (!button) {
    throw new Error('Account button not found')
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

function getTemplateSection(container: HTMLElement) {
  const section = container.querySelector<HTMLElement>('.template-section')

  if (!section) {
    throw new Error('Template section not found')
  }

  return section
}

function getTemplateCards(container: HTMLElement) {
  return Array.from(
    getTemplateSection(container).querySelectorAll<HTMLButtonElement>(
      '.template-card',
    ),
  )
}

function getTemplateCard(container: HTMLElement, title: string) {
  const card = Array.from(
    getTemplateSection(container).querySelectorAll<HTMLButtonElement>(
      '.template-card',
    ),
  ).find((element) => element.textContent?.includes(title))

  if (!card) {
    throw new Error(`Template card not found: ${title}`)
  }

  return card
}

function getTemplatePageButton(container: HTMLElement, page: string) {
  const button = Array.from(
    getTemplateSection(container).querySelectorAll<HTMLButtonElement>(
      '.template-section__page',
    ),
  ).find((element) => element.textContent?.trim() === page)

  if (!button) {
    throw new Error(`Template page button not found: ${page}`)
  }

  return button
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

function setTextarea(container: HTMLElement, label: string, value: string) {
  act(() => {
    const textarea = getTextarea(container, label)
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    )?.set
    valueSetter?.call(textarea, value)
    textarea.dispatchEvent(
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
