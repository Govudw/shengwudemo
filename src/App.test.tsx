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
  it('opens notification drawer from the bell without changing the active top navigation', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })

    expect(container.querySelector('.projects-page')).not.toBeNull()

    act(() => {
      getButton(container, '打开通知').click()
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Projects')
    expect(container.querySelector('.notification-center')).not.toBeNull()
    expect(container.textContent).toContain('通知')
    expect(container.textContent).toContain('3 待关注 · 7 未读')
    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )

    root.unmount()
  })

  it('opens full Notification Center page from the account dropdown', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '通知中心').click()
    })

    expect(useDemoStore.getState().activeTopNav).toBe('NotificationCenter')
    expect(useDemoStore.getState().notificationDrawerOpen).toBe(false)
    expect(container.querySelector('.notification-center')).toBeNull()
    expect(container.querySelector('.notification-center-page')).not.toBeNull()
    expect(container.textContent).toContain('EGFR 实验订单等待审批')

    root.unmount()
  })

  it('opens full Notification Center page from drawer view-all without mutating drawer filter later', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '打开通知').click()
    })
    act(() => {
      getButton(container, '审批').click()
    })
    act(() => {
      getButton(container, '查看全部').click()
    })

    expect(useDemoStore.getState().notificationDrawerOpen).toBe(false)
    expect(useDemoStore.getState().activeTopNav).toBe('NotificationCenter')
    expect(useDemoStore.getState().notificationFilter).toBe('approval')
    expect(useDemoStore.getState().notificationCenterPreset).toBe('approval')

    act(() => {
      getButton(container, '未读').click()
    })

    expect(useDemoStore.getState().notificationCenterPreset).toBe('unread')
    expect(useDemoStore.getState().notificationFilter).toBe('approval')

    root.unmount()
  })

  it('opens a notification detail from the drawer title', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '打开通知').click()
    })
    act(() => {
      getButton(container, 'EGFR 实验订单等待审批').click()
    })

    expect(useDemoStore.getState().notificationDrawerOpen).toBe(false)
    expect(useDemoStore.getState().activeTopNav).toBe('NotificationCenter')
    expect(useDemoStore.getState().notificationCenterSelectedId).toBe(
      'notification-approval-egfr-order',
    )
    expect(useDemoStore.getState().notificationCenterDetailOpen).toBe(true)
    expect(container.querySelector('.notification-center')).toBeNull()
    expect(container.querySelector('.notification-page-inspector')?.textContent).toContain(
      'EGFR 实验订单等待审批',
    )

    root.unmount()
  })

  it('clears notification reminder without changing the source business status', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '通知中心').click()
    })

    expect(container.textContent).toContain('待审批')

    act(() => {
      getLabeledControl(container, '选择 EGFR 实验订单等待审批').click()
    })
    act(() => {
      getButton(container, '批量清除提醒').click()
    })

    expect(useDemoStore.getState().notificationClearedById).toMatchObject({
      'notification-approval-egfr-order': true,
    })
    expect(container.textContent).toContain('待审批')
    expect(container.textContent).toContain('已清除')

    root.unmount()
  })

  it('keeps Approval Center account behavior unchanged', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '审批中心').click()
    })

    expect(window.location.pathname).toBe('/')
    expect(container.querySelector('.approval-center')).not.toBeNull()
    expect(useDemoStore.getState().activeTopNav).toBe('ApprovalCenter')

    root.unmount()
  })

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

  it('clears Notification Center batch selection when opening Product Management Platform', () => {
    const { container, root } = renderApp()

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '通知中心').click()
    })
    act(() => {
      getLabeledControl(container, '选择 EGFR 实验订单等待审批').click()
    })

    expect(useDemoStore.getState().activeTopNav).toBe('NotificationCenter')
    expect(useDemoStore.getState().notificationCenterSelectedIds).toEqual([
      'notification-approval-egfr-order',
    ])

    act(() => {
      getAccountButton(container).click()
    })
    act(() => {
      getButton(container, '管理后台').click()
    })

    expect(window.location.pathname).toBe('/product-management-platform')
    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(useDemoStore.getState().notificationCenterSelectedIds).toEqual([])

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
    expect(getStatus(container).textContent).toContain('对话不存在或已被删除')

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
    expect(container.textContent).not.toContain('读取权限')
    expect(container.textContent).not.toContain('编辑权限')
    expect(container.textContent).toContain('最近活动')

    root.unmount()
  })

  it('renders the default Projects table with only compact columns', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })

    expect(getProjectTableHeaders(container)).toEqual([
      '项目',
      '状态',
      '负责人',
      '最近活动',
      '更多',
    ])
    expect(container.textContent).not.toContain('读取权限')
    expect(container.textContent).not.toContain('编辑权限')

    root.unmount()
  })

  it('keeps Projects tag and activity filters behind more filters with active count', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Projects').click()
    })

    const initialRowCount = getProjectRows(container).length

    expect(container.querySelector('[aria-label="筛选标签"]')).toBeNull()
    expect(container.querySelector('[aria-label="筛选最近活动"]')).toBeNull()

    act(() => {
      getButton(container, '更多筛选').click()
    })

    expect(container.querySelector('[aria-label="筛选标签"]')).not.toBeNull()
    expect(container.querySelector('[aria-label="筛选最近活动"]')).not.toBeNull()

    setSelectValue(container, '筛选标签', '抗体')

    expect(getButton(container, '更多筛选 1')).toBeTruthy()
    expect(getProjectRows(container).length).toBeLessThan(initialRowCount)

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
  it('defaults to the compact recommendation workbench below the composer', () => {
    const { container, root } = renderApp()

    expect(container.querySelector('.composer')).not.toBeNull()
    expect(container.querySelector('.home-control-bar')).not.toBeNull()
    expect(container.querySelector('.home-template-controls')).toBeNull()
    expect(getButton(container, '推荐').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '推荐').closest('.home-mode-switch')).not.toBeNull()
    expect(getButton(container, '模板').closest('.home-mode-switch')).not.toBeNull()
    expect(container.textContent).not.toContain(
      '推荐：根据当前工作上下文给出待关注事项和下一步建议。',
    )
    expect(container.textContent).not.toContain('全部模板')
    expect(container.textContent).not.toContain('工作建议')
    expect(container.textContent).not.toContain('今日工作台')
    expect(container.textContent).toContain('今日关注')
    expect(container.textContent).not.toContain('今日需要关注')
    expect(container.textContent).not.toContain('继续推进')
    expect(container.textContent).not.toContain('智能建议')
    expect(container.textContent).not.toContain('开始新工作')
    expect(container.querySelectorAll('.recommendation-feed-card')).toHaveLength(24)
    expect(container.textContent).toContain('靶点竞品研究')
    expect(container.textContent).toContain('模型调优闭环')
    expect(container.querySelector('[aria-label="模板类别"]')).toBeNull()
    expect(container.querySelector('input[aria-label="搜索模板"]')).toBeNull()
    expect(container.querySelector('.template-section')).toBeNull()
    expect(container.querySelectorAll('.recommendation-insight-widget')).toHaveLength(4)

    root.unmount()
  })

  it('shows recommendation signals only in recommendation mode', () => {
    const { container, root } = renderApp()

    expect(container.querySelector('.home-signal-strip')).not.toBeNull()
    expect(getButton(container, '风险 3')).toBeTruthy()
    expect(getButton(container, '待复核 2')).toBeTruthy()
    expect(getButton(container, '审批 1')).toBeTruthy()
    expect(getButton(container, '资产 78%')).toBeTruthy()

    act(() => {
      getButton(container, '模板').click()
    })

    expect(container.querySelector('.home-signal-strip')).toBeNull()
    expect(findButton(container, '风险 3')).toBeUndefined()
    expect(container.querySelector('.home-template-controls')).not.toBeNull()

    root.unmount()
  })

  it('signal clicks jump-highlight targets without changing the composer draft', () => {
    const { container, root } = renderApp()
    const textarea = getTextarea(container, '研发目标或对话内容')

    setTextareaValue(textarea, '保留草稿')

    act(() => {
      getButton(container, '风险 3').click()
    })

    expect(textarea.value).toBe('保留草稿')
    expect(
      container
        .querySelector('[data-recommendation-target="home-insight-project-flow"]')
        ?.classList.contains('recommendation-highlight'),
    ).toBe(true)

    root.unmount()
  })

  it('escapes recommendation target selectors before querying the document', async () => {
    const { container, root } = renderApp()
    const originalCss = globalThis.CSS
    const escapeSpy = vi.fn((value: string) => value)

    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: { ...(globalThis.CSS ?? {}), escape: escapeSpy },
    })

    act(() => {
      getButton(container, '风险 3').click()
    })
    await waitForAnimationFrame()

    expect(escapeSpy).toHaveBeenCalledWith('home-insight-project-flow')

    Object.defineProperty(globalThis, 'CSS', {
      configurable: true,
      value: originalCss,
    })

    root.unmount()
  })

  it('switches to all templates mode and removes the old 推荐 scope filter', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

    const templateSection = getTemplateSection(container)

    expect(getButton(container, '模板').getAttribute('aria-pressed')).toBe('true')
    expect(container.querySelector('.home-control-bar')).not.toBeNull()
    expect(container.querySelector('.home-template-controls')).not.toBeNull()
    expect(getButton(container, '推荐').closest('.home-mode-switch')).not.toBeNull()
    expect(getButton(container, '模板').closest('.home-mode-switch')).not.toBeNull()
    expect(getTemplateScopeGroup(container).closest('.home-template-controls')).not.toBeNull()
    expect(getButton(container, '模板').closest('.home-template-controls')).toBeNull()
    expect(
      container
        .querySelector('.home-template-controls__advanced')
        ?.closest('.home-template-controls__filter-strip'),
    ).toBeNull()
    expect(
      container.querySelector('.home-template-controls__advanced')?.parentElement,
    ).toBe(container.querySelector('.home-template-controls'))
    expect(
      container
        .querySelector<HTMLInputElement>('input[aria-label="搜索模板"]')
        ?.closest('.home-control-bar'),
    ).not.toBeNull()
    expect(templateSection.querySelector('.template-section__toolbar')).toBeNull()
    expect(getTemplateCards(container)).toHaveLength(30)
    expect(templateSection.textContent).not.toContain('100 个模板')
    expect(templateSection.textContent).not.toContain('类型筛选')
    expect(templateSection.textContent).not.toContain('全部类型')
    expect(templateSection.querySelector('.template-section__meta')).toBeNull()
    expect(templateSection.querySelector('.template-section__advanced-panel')).toBeNull()
    expect(getButton(container, '展开更多筛选').getAttribute('aria-expanded')).toBe('false')
    expect(
      Array.from(getTemplateScopeGroup(container).querySelectorAll('button')).map(
        (button) => button.textContent?.trim(),
      ),
    ).toEqual(['全部类别', '日常', '生物', '飞书', '其他'])
    expect(getButton(container, '蛋白药物')).not.toBeNull()
    expect(getButton(container, '虚拟细胞')).not.toBeNull()
    expect(getButton(container, '合成生物学')).not.toBeNull()
    expect(getButton(container, '农业育种')).not.toBeNull()
    expect(getButton(container, '其他')).not.toBeNull()
    expect(findButton(container, '抗体')).toBeUndefined()
    expect(findButton(container, '细胞')).toBeUndefined()
    expect(findButton(container, '酶')).toBeUndefined()
    expect(
      Array.from(
        templateSection.querySelectorAll<HTMLButtonElement>(
          '.template-section__page',
        ),
      ).map((button) => button.textContent?.trim()),
    ).toEqual(['1', '2', '3', '4'])
    expect(getTemplateCard(container, '靶点竞品研究').textContent).toContain(
      '梳理靶点价值、竞品布局与关键差异。',
    )

    root.unmount()
  })

  it('passes wheel scrolling to the outer workspace until the template region is pinned', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

    const workspaceMain = container.querySelector<HTMLElement>('.workspace-main')
    const controlBar = container.querySelector<HTMLElement>('.home-control-bar')
    const results = container.querySelector<HTMLElement>(
      '.template-section__results',
    )

    if (!workspaceMain || !controlBar || !results) {
      throw new Error('Template scroll test elements not found')
    }

    Object.defineProperties(workspaceMain, {
      clientHeight: { configurable: true, value: 800 },
      scrollHeight: { configurable: true, value: 2200 },
      scrollTop: { configurable: true, value: 0, writable: true },
    })

    const scrollBy = vi.fn((options: ScrollToOptions) => {
      workspaceMain.scrollTop += Number(options.top ?? 0)
    })
    workspaceMain.scrollBy = scrollBy as unknown as typeof workspaceMain.scrollBy
    vi.spyOn(workspaceMain, 'getBoundingClientRect').mockReturnValue(
      createDomRect(48, 800),
    )
    const controlBarRect = vi
      .spyOn(controlBar, 'getBoundingClientRect')
      .mockReturnValue(createDomRect(300, 34))

    const wheelBeforePinned = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    })

    act(() => {
      results.dispatchEvent(wheelBeforePinned)
    })

    expect(wheelBeforePinned.defaultPrevented).toBe(true)
    expect(scrollBy).toHaveBeenCalledWith({
      top: 80,
      left: 0,
      behavior: 'auto',
    })

    scrollBy.mockClear()
    const largeWheelBeforePinned = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 500,
    })

    act(() => {
      results.dispatchEvent(largeWheelBeforePinned)
    })

    expect(largeWheelBeforePinned.defaultPrevented).toBe(true)
    expect(scrollBy).toHaveBeenCalledWith({
      top: 96,
      left: 0,
      behavior: 'auto',
    })

    scrollBy.mockClear()
    controlBarRect.mockReturnValue(createDomRect(56, 34))
    const wheelAfterPinned = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 80,
    })

    act(() => {
      results.dispatchEvent(wheelAfterPinned)
    })

    expect(wheelAfterPinned.defaultPrevented).toBe(false)
    expect(scrollBy).not.toHaveBeenCalled()

    root.unmount()
  })

  it('filters templates by first-level Feishu and other categories', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

    const scopeGroup = getTemplateScopeGroup(container)

    act(() => {
      getGroupButton(scopeGroup, '飞书').click()
    })

    const feishuFirstPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, { scope: '飞书' }, ''),
      1,
      30,
    )
    expect(getTemplateCards(container)).toHaveLength(feishuFirstPage.totalItems)
    expect(getTemplateCards(container)[0].textContent).toContain('飞书文档写作')
    expect(getTemplateCards(container).every((card) => card.textContent?.includes('飞书'))).toBe(true)

    act(() => {
      getGroupButton(scopeGroup, '其他').click()
    })

    const otherFirstPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, { scope: '其他' }, ''),
      1,
      30,
    )
    expect(getTemplateCards(container)).toHaveLength(
      Math.min(30, otherFirstPage.totalItems),
    )
    expect(getTemplateCards(container)[0].textContent).toContain(otherFirstPage.items[0].title)
    expect(getTemplateCards(container).some((card) => card.textContent?.includes('飞书'))).toBe(false)

    root.unmount()
  })

  it('expands the toolbar to show advanced template type filters without auto-collapsing', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

    expect(findButton(container, '完整工作流')).toBeUndefined()

    act(() => {
      getButton(container, '展开更多筛选').click()
    })

    expect(getButton(container, '收起更多筛选').getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.home-template-controls__popover')).not.toBeNull()
    const advancedPanel = container.querySelector('.home-template-controls__popover')
    expect(advancedPanel).not.toBeNull()
    expect(advancedPanel?.textContent).toContain('类型')

    act(() => {
      getButton(container, '研究设计').click()
    })

    const researchDesignFirstPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, { type: '研究设计' }, ''),
      1,
      30,
    )
    expect(getButton(container, '收起更多筛选').getAttribute('aria-expanded')).toBe('true')
    expect(container.querySelector('.home-template-controls__popover')).not.toBeNull()
    expect(getButton(container, '研究设计').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '收起更多筛选').textContent).toContain(
      '更多 1',
    )
    expect(getTemplateCards(container)).toHaveLength(
      Math.min(30, researchDesignFirstPage.totalItems),
    )
    expect(getTemplateCards(container)[0].textContent).toContain(
      researchDesignFirstPage.items[0].title,
    )

    act(() => {
      getButton(container, '收起更多筛选').click()
    })

    expect(container.querySelector('.home-template-controls__popover')).toBeNull()
    expect(getButton(container, '展开更多筛选').textContent).toContain(
      '更多 1',
    )

    root.unmount()
  })

  it('resets template filters from the more-filters popover while staying in all templates mode', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })
    act(() => {
      getGroupButton(getTemplateScopeGroup(container), '飞书').click()
    })
    act(() => {
      getButton(container, '蛋白药物').click()
    })
    setSearchInput(container, '搜索模板', 'CDR')
    act(() => {
      getButton(container, '展开更多筛选').click()
    })
    act(() => {
      getButton(container, '研究设计').click()
    })

    expect(getButton(container, '收起更多筛选').textContent).toContain(
      '更多 1',
    )
    expect(getTemplateCards(container)).toHaveLength(0)

    act(() => {
      getButton(container, '重置筛选').click()
    })

    expect(getButton(container, '模板').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '全部类别').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '全部方向').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '全部类型').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '收起更多筛选').textContent).toContain('更多')
    expect(getButton(container, '收起更多筛选').textContent).not.toContain('筛选')
    expect(getButton(container, '收起更多筛选').textContent).not.toContain('1')
    expect(
      container.querySelector<HTMLInputElement>('input[aria-label="搜索模板"]')?.value,
    ).toBe('')
    expect(getTemplateCards(container)).toHaveLength(30)
    expect(getTemplatePageButton(container, '1').getAttribute('aria-current')).toBe(
      'page',
    )

    root.unmount()
  })

  it('refreshes results and returns to page one when filtering by direction', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

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
      getButton(container, '蛋白药物').click()
    })

    const proteinDrugFirstPage = getTemplatePage(
      getFilteredTemplates(homeTemplates, { direction: '蛋白药物' }, ''),
      1,
      30,
    )
    expect(getTemplateCards(container)).toHaveLength(
      Math.min(30, proteinDrugFirstPage.totalItems),
    )
    expect(getTemplateCards(container)[0].textContent).toContain(
      proteinDrugFirstPage.items[0].title,
    )
    expect(getTemplatePageButton(container, '1').getAttribute('aria-current')).toBe(
      'page',
    )

    root.unmount()
  })

  it('searches visible template fields immediately, can clear, and does not match hidden prompt text', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '模板').click()
    })

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

    act(() => {
      getButton(container, '模板').click()
    })

    const card = getTemplateCard(container, '靶点竞品研究')

    expect(card.querySelector('.template-card__header')).not.toBeNull()
    expect(card.querySelector('.template-card__summary')).not.toBeNull()
    expect(card.querySelector('.template-card__tag-row')).not.toBeNull()
    expect(
      Array.from(card.querySelectorAll('.template-card__tag')).some((tag) =>
        Array.from(tag.classList).some((className) =>
          className.startsWith('template-card__tag--'),
        ),
      ),
    ).toBe(true)

    act(() => {
      card.click()
    })
    await waitForAnimationFrame()

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

  it('fills, appends, focuses, scrolls, and confirms recommendation prompts', async () => {
    const { container, root } = renderApp()
    const scrollIntoView = vi.fn()
    const textarea = getTextarea(container, '研发目标或对话内容')

    textarea.scrollIntoView = scrollIntoView

    act(() => {
      getButton(container, '生成今日行动清单').click()
    })
    await waitForAnimationFrame()

    expect(textarea.value).toContain('今日推荐事项')
    expect(document.activeElement).toBe(textarea)
    expect(textarea.selectionStart).toBe(textarea.value.length)
    expect(scrollIntoView).toHaveBeenCalled()
    expect(container.textContent).toContain('已填入指令，可直接发送')

    const firstPrompt = textarea.value
    setTextareaValue(textarea, `${firstPrompt}\n\n我已有一段手写输入。`)

    act(() => {
      getButton(container, '开始调研：靶点竞品研究').click()
    })
    await waitForAnimationFrame()

    expect(textarea.value).not.toContain('我已有一段手写输入。')
    expect(textarea.value).toContain('EGFR 抗体项目做靶点与竞品调研')
    expect(textarea.value).not.toBe(firstPrompt)
    expect(useDemoStore.getState().notificationClearedById).toEqual({})
    expect(useDemoStore.getState().notificationResolvedById).toEqual({})

    root.unmount()
  })

  it('uses new-task recommendation cards as template-like composer starters', async () => {
    const { container, root } = renderApp()
    const textarea = getTextarea(container, '研发目标或对话内容')

    setTextareaValue(textarea, '我已有一段手写输入。')

    act(() => {
      getButton(container, '生成方案：抗体研发设计').click()
    })
    await waitForAnimationFrame()

    expect(textarea.value).toContain('HER2 抗体优化目标')
    expect(textarea.value).not.toContain('我已有一段手写输入。')
    expect(document.activeElement).toBe(textarea)
    expect(textarea.selectionStart).toBe(textarea.value.length)

    root.unmount()
  })

  it('does not render old recommendation subsections or starter shortcuts', () => {
    const { container, root } = renderApp()

    expect(container.textContent).not.toContain('继续推进')
    expect(container.textContent).not.toContain('智能建议')
    expect(container.textContent).not.toContain('开始新工作')
    expect(findButton(container, '查看模板')).toBeUndefined()
    expect(container.querySelectorAll('.recommendation-feed-card')).toHaveLength(24)

    root.unmount()
  })

  it('filters recommendation cards when selecting a home signal', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '审批 1').click()
    })

    expect(container.textContent).toContain('审批相关推荐')
    expect(container.textContent).toContain('EGFR 审批材料包')
    expect(container.querySelectorAll('.recommendation-feed-card').length).toBeGreaterThan(0)
    Array.from(container.querySelectorAll<HTMLElement>('.recommendation-feed-card')).forEach(
      (card) => {
        expect(card.getAttribute('data-recommendation-filter-kinds')).toContain(
          'approval',
        )
      },
    )

    root.unmount()
  })

  it('opens asset and skill recommendation cards as URL-backed detail routes', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, '打开资产：数据打包').click()
    })

    expect(window.location.pathname).toBe('/assets/data-egfr-candidates')
    expect(getButton(container, 'Assets').getAttribute('aria-current')).toBe('page')
    expect(container.querySelector('.recommendation-detail-page')).not.toBeNull()
    expect(container.textContent).toContain('EGFR_MOO_candidates_v3')

    act(() => {
      getButton(container, 'Workspace').click()
    })
    act(() => {
      getButton(container, '查看 Skill：飞书文档写作').click()
    })

    expect(window.location.pathname).toBe('/capabilities/skill-report')
    expect(getButton(container, 'Capabilities').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.querySelector('.recommendation-detail-page')).not.toBeNull()
    expect(container.textContent).toContain('研发报告撰写 Skill')

    root.unmount()
  })

  it('renders recommendation asset and skill detail routes on direct visits', () => {
    window.history.replaceState(null, '', '/assets/data-egfr-candidates')
    const assetRender = renderApp()

    expect(useDemoStore.getState().activeTopNav).toBe('Assets')
    expect(assetRender.container.textContent).toContain('EGFR_MOO_candidates_v3')

    assetRender.root.unmount()
    document.body.replaceChildren()
    window.history.replaceState(null, '', '/capabilities/skill-report')

    const skillRender = renderApp()

    expect(useDemoStore.getState().activeTopNav).toBe('Capabilities')
    expect(skillRender.container.textContent).toContain('研发报告撰写 Skill')

    skillRender.root.unmount()
  })

  it('does not render the old home capability buttons or use case cards', () => {
    const { container, root } = renderApp()

    expect(findButton(container, '知识调研')).toBeUndefined()
    expect(findButton(container, '实验设计')).toBeUndefined()
    expect(findButton(container, '更多')).toBeUndefined()
    expect(container.querySelector('[class*="use-case-"]')).toBeNull()
    expect(container.querySelector('.capability-row')).toBeNull()
    expect(container.querySelector('.selected')).toBeNull()

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

  it('renders the default file list without file-space badge columns', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })

    expect(getAssetsTableHeaders(container)).toEqual([
      '名称',
      '范围',
      '类型',
      '更新时间',
      '更多',
    ])
    expect(container.textContent).not.toContain('Project File')
    expect(container.textContent).not.toContain('File Asset')

    root.unmount()
  })

  it('uses file type and update time as core file filters', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })

    const toolbar = getAssetsToolbar(container)
    expect(toolbar.querySelector('select[aria-label="筛选文件类型"]')).not.toBeNull()
    expect(toolbar.querySelector('select[aria-label="筛选文件更新时间"]')).not.toBeNull()
    expect(toolbar.querySelector('[aria-label="文件显示方式"]')).toBeNull()

    setSelectValue(toolbar, '筛选文件更新时间', 'last30Minutes')

    expect(container.textContent).toContain('EGFR_parent_antibody_baseline.xlsx')
    expect(container.textContent).toContain('BLI_run_0528.csv')
    expect(container.textContent).not.toContain('EGFR_MOO_candidate_summary.parquet')
    expect(container.textContent).not.toContain('SEC_HPLC_overlay.png')

    act(() => {
      getButton(toolbar, '更多筛选').click()
    })

    expect(toolbar.querySelector('[aria-label="文件显示方式"]')).not.toBeNull()

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

  it('labels compact row action buttons for assistive technology', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    expect(
      getButton(container, '查看 EGFR_parent_antibody_baseline.xlsx 的更多操作'),
    ).toBeTruthy()

    act(() => {
      getButton(container, '数据').click()
    })
    expect(
      getButton(container, '查看 EGFR_MOO_candidates_v3 的更多操作'),
    ).toBeTruthy()

    act(() => {
      getButton(container, '实验').click()
    })
    act(() => {
      getButton(container, '更多筛选').click()
    })
    act(() => {
      getButton(container, '表格').click()
    })
    expect(
      getButton(
        container,
        '查看 EGFR Affinity Validation Design Package 的更多操作',
      ),
    ).toBeTruthy()

    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, '公开模型').click()
    })
    expect(
      getButton(container, '查看 ESM-2 Protein Encoder 的更多操作'),
    ).toBeTruthy()

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

  it('keeps experiment view mode behind more filters by default', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '实验').click()
    })

    const toolbar = getAssetsToolbar(container)
    expect(toolbar.querySelector('input[aria-label="搜索实验资产"]')).not.toBeNull()
    expect(toolbar.querySelector('select[aria-label="筛选实验类型"]')).not.toBeNull()
    expect(toolbar.querySelector('select[aria-label="筛选实验状态"]')).not.toBeNull()
    expect(toolbar.querySelector('[aria-label="实验资产显示方式"]')).toBeNull()
    expect(getButton(toolbar, '更多筛选')).toBeTruthy()

    act(() => {
      getButton(toolbar, '更多筛选').click()
    })

    expect(toolbar.querySelector('[aria-label="实验资产显示方式"]')).not.toBeNull()

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

    expect(findButton(container, '卡片')).toBeUndefined()
    expect(container.querySelector('.assets-experiment-table')).toBeNull()
    expect(container.textContent).toContain('EGFR Affinity Validation Design Package')

    act(() => {
      getButton(container, '更多筛选').click()
    })
    expect(getButton(container, '卡片').getAttribute('aria-pressed')).toBe('true')
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

describe('App data asset pages', () => {
  it('renders data assets as a compact table without card descriptions', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '数据').click()
    })

    const assetsMain = getAssetsMain(container)
    const toolbar = getAssetsToolbar(container)
    expect(getAssetsTableHeaders(assetsMain)).toEqual([
      '名称',
      '类型',
      '范围',
      '数量',
      '更新时间',
      '更多',
    ])
    expect(assetsMain.querySelector('.assets-record-grid')).toBeNull()
    expect(assetsMain.textContent).toContain('EGFR_MOO_candidates_v3')
    expect(assetsMain.textContent).toContain('数据集')
    expect(assetsMain.textContent).toContain('1,284 rows')
    expect(assetsMain.textContent).toContain('32 分钟前')
    expect(assetsMain.textContent).not.toContain(
      '亲和力、稳定性、表达量与 developability 评分汇总',
    )
    expect(findButton(toolbar, '更多筛选')).toBeUndefined()

    root.unmount()
  })
})

describe('App model asset pages', () => {
  it('hides upload on public models and renders model sections as compact tables', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, '公开模型').click()
    })

    let assetsMain = getAssetsMain(container)
    expect(findButton(assetsMain, '上传')).toBeUndefined()
    expect(getAssetsTableHeaders(assetsMain)).toEqual([
      '名称',
      '状态',
      '范围',
      '更新时间',
      '更多',
    ])
    expect(assetsMain.querySelector('.assets-record-grid')).toBeNull()
    expect(assetsMain.textContent).toContain('ESM-2 Protein Encoder')

    act(() => {
      getButton(container, '项目模型').click()
    })

    assetsMain = getAssetsMain(container)
    expect(getAssetsTableHeaders(assetsMain)).toEqual([
      '名称',
      '状态',
      '范围',
      '更新时间',
      '更多',
    ])
    expect(assetsMain.querySelector('.assets-record-grid')).toBeNull()
    expect(assetsMain.textContent).toContain('EGFR_Affinity_Head_v2')

    act(() => {
      getButton(container, 'Oracle').click()
    })

    assetsMain = getAssetsMain(container)
    expect(getAssetsTableHeaders(assetsMain)).toEqual([
      '名称',
      '状态',
      '范围',
      '更新时间',
      '更多',
    ])
    expect(assetsMain.querySelector('.assets-record-grid')).toBeNull()

    root.unmount()
  })

  it('treats Oracle v1 as callable read-only without create or upload actions', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, 'Oracle').click()
    })

    const assetsMain = getAssetsMain(container)
    const toolbar = getAssetsToolbar(container)
    expect(findButton(assetsMain, '新建')).toBeUndefined()
    expect(findButton(assetsMain, '上传')).toBeUndefined()
    expect(findButton(toolbar, '更多筛选')).toBeUndefined()
    expect(assetsMain.textContent).not.toContain('注册模型')
    expect(assetsMain.textContent).not.toContain('新建 Oracle')

    root.unmount()
  })

  it('shows only published callable Oracle assets in the default Oracle view', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, 'Oracle').click()
    })

    const assetsMain = getAssetsMain(container)
    expect(assetsMain.textContent).toContain('EGFR Developability Oracle')
    expect(assetsMain.textContent).toContain('Enzyme Activity Oracle')
    expect(assetsMain.textContent).not.toContain('Bispecific Pairing Oracle')
    expect(assetsMain.textContent).not.toContain('AAV Manufacturability Oracle')

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
    ).toHaveLength(0)
    expect(
      container.querySelectorAll('.xtrimo-model-card__thumbnail-image'),
    ).toHaveLength(33)
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
    expect(container.textContent).toContain('推荐用于当前项目')
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoPFP')
    expect(findButton(container, '新建')).toBeUndefined()
    expect(findButton(container, '上传')).toBeUndefined()
    expect(getButton(container, '更多资产操作')).toBeTruthy()

    root.unmount()
  })

  it('keeps xTrimo recommendations collapsed by default and expands cards on demand', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    expect(container.textContent).toContain('推荐用于当前项目的 6 个模型')
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> & {
          xtrimoRecommendationsExpanded?: boolean
        }
      ).xtrimoRecommendationsExpanded,
    ).toBe(false)
    expect(getButton(container, '展开推荐')).toBeTruthy()
    expect(
      container.querySelectorAll('.xtrimo-recommendations .xtrimo-model-card'),
    ).toHaveLength(0)

    act(() => {
      getButton(container, '展开推荐').click()
    })

    expect(getButton(container, '收起推荐')).toBeTruthy()
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> & {
          xtrimoRecommendationsExpanded?: boolean
        }
      ).xtrimoRecommendationsExpanded,
    ).toBe(true)
    expect(
      container.querySelectorAll('.xtrimo-recommendations .xtrimo-model-card'),
    ).toHaveLength(6)

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
      getButton(container, '更多筛选').click()
    })
    setSelectValue(container, '筛选xTrimo状态', 'comingSoon')
    act(() => {
      getModelCardButton(container, 'xTrimoAAVViability', '预览模型').click()
    })

    expect(getStatus(container).textContent).toContain(
      '该模型即将上线，当前仅支持预览',
    )

    root.unmount()
  })

  it('filters xTrimo models by capability, entity, and advanced lifecycle status', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })

    setSelectValue(container, '筛选xTrimo能力', '亲和力')

    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).toContain('xTrimoTCR-PeptideBinding')
    expect(container.textContent).not.toContain('xTrimoGene')

    setSelectValue(container, '筛选xTrimo实体', '抗体')

    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoTCR-PeptideBinding')

    act(() => {
      getButton(container, '更多筛选').click()
    })

    setSelectValue(container, '筛选xTrimo状态', 'comingSoon')

    expect(getButton(container, '更多筛选 1')).toBeTruthy()
    expect(container.textContent).not.toContain('xTrimoAAVViability')

    setSelectValue(container, '筛选xTrimo状态', 'all')
    setSelectValue(container, '筛选xTrimo能力', 'all')
    setSelectValue(container, '筛选xTrimo实体', 'all')
    setSelectValue(container, '筛选xTrimo状态', 'comingSoon')

    expect(container.textContent).toContain('xTrimoAAVViability')
    expect(container.textContent).toContain('仅预览')
    expect(container.textContent).not.toContain('可调用 · xTrimoAAVViability')

    root.unmount()
  })

  it('filters xTrimo models by version from advanced filters', () => {
    const { container, root } = renderApp()

    act(() => {
      getButton(container, 'Assets').click()
    })
    act(() => {
      getButton(container, '模型').click()
    })
    act(() => {
      getButton(container, '更多筛选').click()
    })

    expect(container.querySelector('select[aria-label="筛选xTrimo版本"]')).not.toBeNull()

    setSelectValue(container, '筛选xTrimo版本', 'v2.1')

    expect(getButton(container, '更多筛选 1')).toBeTruthy()
    expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
    expect(container.textContent).not.toContain('xTrimoGene')

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

function getLabeledControl(container: HTMLElement, name: string) {
  const control = container.querySelector<HTMLElement>(`[aria-label="${name}"]`)

  if (!control) {
    throw new Error(`Labeled control not found: ${name}`)
  }

  return control
}

function getProjectRows(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLTableRowElement>(
    '.projects-table tbody tr',
  ))
}

function getProjectTableHeaders(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.projects-table thead th')).map(
    (header) => header.textContent?.trim(),
  )
}

function getAssetsMain(container: HTMLElement) {
  const assetsMain = container.querySelector<HTMLElement>('.assets-main')

  if (!assetsMain) {
    throw new Error('Assets main pane not found')
  }

  return assetsMain
}

function getAssetsToolbar(container: HTMLElement) {
  const toolbar = container.querySelector<HTMLElement>('.assets-toolbar')

  if (!toolbar) {
    throw new Error('Assets toolbar not found')
  }

  return toolbar
}

function getAssetsTableHeaders(container: HTMLElement) {
  return Array.from(container.querySelectorAll('.assets-table [role="columnheader"]')).map(
    (header) => header.textContent?.trim(),
  )
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

function getTemplateScopeGroup(container: HTMLElement) {
  const group = container.querySelector<HTMLElement>(
    '[aria-label="模板类别"]',
  )

  if (!group) {
    throw new Error('Template scope group not found')
  }

  return group
}

function getGroupButton(group: HTMLElement, name: string) {
  const button = Array.from(group.querySelectorAll<HTMLButtonElement>('button')).find(
    (element) => element.textContent?.trim() === name,
  )

  if (!button) {
    throw new Error(`Group button not found: ${name}`)
  }

  return button
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

function createDomRect(top: number, height: number) {
  return {
    x: 0,
    y: top,
    top,
    right: 100,
    bottom: top + height,
    left: 0,
    width: 100,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

async function waitForAnimationFrame() {
  await act(async () => {
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => resolve())
    })
  })
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  act(() => {
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

function setSelectValue(container: HTMLElement, label: string, value: string) {
  act(() => {
    const select = container.querySelector<HTMLSelectElement>(
      `select[aria-label="${label}"]`,
    )
    if (!select) {
      throw new Error(`Select not found: ${label}`)
    }
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLSelectElement.prototype,
      'value',
    )?.set
    valueSetter?.call(select, value)
    select.dispatchEvent(new Event('change', { bubbles: true }))
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
