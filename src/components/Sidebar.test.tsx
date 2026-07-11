// @vitest-environment happy-dom

import { act } from 'react'
import type { ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DemoProject } from '../store/demoStoreLogic'
import Sidebar from './Sidebar'

const projects: DemoProject[] = [
  {
    id: 'antibody-optimization',
    name: 'Antibody Optimization',
    threads: [
      {
        id: 'egfr-affinity',
        routeId: 'aaaaaaaaaaaaaaaa',
        title: 'EGFR 抗体亲和力优化',
        lastActivityAt: 0,
        pinned: false,
        pinnedAt: null,
        archived: false,
        createdAt: 0,
        transcript: [],
      },
      {
        id: 'cd3-bispecific',
        routeId: 'bbbbbbbbbbbbbbbb',
        title: 'CD3 双抗序列优化分析',
        lastActivityAt: 3,
        pinned: false,
        pinnedAt: null,
        archived: false,
        createdAt: 0,
        transcript: [],
      },
    ],
  },
  {
    id: 'enzyme-discovery',
    name: 'Enzyme Discovery',
    threads: [
      {
        id: 'screening-plan',
        routeId: 'cccccccccccccccc',
        title: '酶活性筛选方案讨论',
        lastActivityAt: 2,
        pinned: false,
        pinnedAt: null,
        archived: false,
        createdAt: 0,
        transcript: [],
      },
    ],
  },
]

const noop = () => undefined

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
})

function renderSidebar(
  props: Partial<ComponentProps<typeof Sidebar>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const mergedProps: ComponentProps<typeof Sidebar> = {
    projects,
    selectedThreadId: null,
    activeItem: 'Workspace',
    searchOpen: false,
    searchQuery: '',
    expandedProjectIds: ['antibody-optimization', 'enzyme-discovery'],
    sidebarCollapsed: false,
    notificationActionRequiredCount: 3,
    onSidebarCollapsedChange: noop,
    onNewThread: noop,
    onCreateProject: noop,
    onPrimaryNav: noop,
    onSearchOpenChange: noop,
    onSearchQueryChange: noop,
    onToggleProject: noop,
    onSelectThread: noop,
    onTogglePinned: noop,
    onRenameThread: noop,
    onArchiveThread: noop,
    onDeleteThread: noop,
    onNotificationCenterOpen: noop,
    onAccountMenuSelect: noop,
    onNotify: noop,
    ...props,
  }

  act(() => {
    root.render(<Sidebar {...mergedProps} />)
  })

  return { container, root }
}

function unmountRoot(root: ReturnType<typeof createRoot>) {
  act(() => {
    root.unmount()
  })
}

describe('Sidebar thread menu', () => {
  it('uses native button semantics instead of incomplete ARIA menu roles', () => {
    const { container, root } = renderSidebar()

    const menuButton = container.querySelector<HTMLButtonElement>(
      '.sidebar__thread-menu-button',
    )

    act(() => {
      menuButton?.click()
    })

    const menu = container.querySelector<HTMLElement>('.sidebar__thread-menu')
    const menuItems = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.sidebar__menu-item'),
    )

    expect(menu).not.toBeNull()
    expect(menu?.getAttribute('role')).toBeNull()
    expect(menuItems.length).toBe(4)
    expect(menuItems.every((item) => item.getAttribute('role') === null)).toBe(true)

    unmountRoot(root)
  })
})

describe('Sidebar collapse rail', () => {
  it('keeps 新对话 in the expanded sidebar and exposes a collapse button', () => {
    const onSidebarCollapsedChange = vi.fn()
    const { container, root } = renderSidebar({ onSidebarCollapsedChange })

    expect(container.textContent).toContain('新对话')

    const collapseButton = getButton(container, '收起侧栏')
    act(() => {
      collapseButton.click()
    })

    expect(onSidebarCollapsedChange).toHaveBeenCalledWith(true)

    unmountRoot(root)
  })

  it('renders a compact rail in collapsed state without the project tree', () => {
    const { container, root } = renderSidebar({ sidebarCollapsed: true })

    expect(container.querySelector('.sidebar__project-list')).toBeNull()
    expect(getButton(container, '展开侧栏')).toBeTruthy()
    expect(getButton(container, '新对话')).toBeTruthy()
    expect(getButton(container, '搜索对话')).toBeTruthy()
    expect(getButton(container, '最近对话')).toBeTruthy()
    expect(container.textContent).not.toContain('Antibody Optimization')

    unmountRoot(root)
  })

  it('keeps the sidebar collapsed when starting a new conversation from the rail', () => {
    const onNewThread = vi.fn()
    const onSidebarCollapsedChange = vi.fn()
    const { container, root } = renderSidebar({
      sidebarCollapsed: true,
      onNewThread,
      onSidebarCollapsedChange,
    })

    act(() => {
      getButton(container, '新对话').click()
    })

    expect(onNewThread).toHaveBeenCalledTimes(1)
    expect(onSidebarCollapsedChange).not.toHaveBeenCalledWith(false)

    unmountRoot(root)
  })

  it('expands the sidebar and opens search when using rail search', () => {
    const onSearchOpenChange = vi.fn()
    const onSidebarCollapsedChange = vi.fn()
    const { container, root } = renderSidebar({
      sidebarCollapsed: true,
      onSearchOpenChange,
      onSidebarCollapsedChange,
    })

    act(() => {
      getButton(container, '搜索对话').click()
    })

    expect(onSidebarCollapsedChange).toHaveBeenCalledWith(false)
    expect(onSearchOpenChange).toHaveBeenCalledWith(true)

    unmountRoot(root)
  })

  it('shows the recent conversations popover from rail focus and selects a conversation', () => {
    const onSelectThread = vi.fn()
    const { container, root } = renderSidebar({
      sidebarCollapsed: true,
      selectedThreadId: 'cd3-bispecific',
      onSelectThread,
    })
    const recentButton = getButton(container, '最近对话')

    act(() => {
      recentButton.focus()
    })

    expect(container.textContent).toContain('最近对话')
    expect(container.textContent).toContain('CD3 双抗序列优化分析')
    expect(container.textContent).toContain('Antibody Optimization')

    act(() => {
      getButton(container, '酶活性筛选方案讨论').click()
    })

    expect(onSelectThread).toHaveBeenCalledWith('enzyme-discovery', 'screening-plan')

    unmountRoot(root)
  })

  it('closes the recent conversations popover with Escape and outside click', () => {
    const { container, root } = renderSidebar({ sidebarCollapsed: true })
    const recentButton = getButton(container, '最近对话')

    act(() => {
      recentButton.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    expect(container.textContent).toContain('EGFR 抗体亲和力优化')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })
    expect(container.textContent).not.toContain('EGFR 抗体亲和力优化')

    act(() => {
      recentButton.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
    })
    expect(container.textContent).toContain('EGFR 抗体亲和力优化')

    act(() => {
      document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    })
    expect(container.textContent).not.toContain('EGFR 抗体亲和力优化')

    unmountRoot(root)
  })
})

describe('Sidebar project scroll area', () => {
  it('renders a custom scrollbar attached to the project viewport', () => {
    const { container, root } = renderSidebar()

    const viewport = container.querySelector<HTMLElement>('.sidebar-scroll')
    const scrollbar = container.querySelector<HTMLElement>(
      '[role="scrollbar"][aria-label="项目对话滚动条"]',
    )

    expect(viewport?.id).toBe('sidebar-project-scroll')
    expect(scrollbar?.getAttribute('aria-controls')).toBe(
      'sidebar-project-scroll',
    )
    expect(
      scrollbar?.querySelector('.sidebar__project-scrollbar-thumb'),
    ).not.toBeNull()

    unmountRoot(root)
  })
})

describe('Sidebar footer', () => {
  it('shows account metadata and keeps notification action available', () => {
    const onNotificationCenterOpen = vi.fn()
    const { container, root } = renderSidebar({ onNotificationCenterOpen })

    expect(container.textContent).toContain('个人账户')

    act(() => {
      getButton(container, '打开通知').click()
    })

    expect(onNotificationCenterOpen).toHaveBeenCalledTimes(1)

    unmountRoot(root)
  })
})

function getButton(container: HTMLElement, name: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name,
  )

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}
