// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import TopNav from './TopNav'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
})

describe('TopNav', () => {
  it('uses English labels for the top-level navigation titles', () => {
    const { container, root } = renderTopNav()

    expect(container.textContent).toContain('Capabilities')
    expect(container.textContent).toContain('Workspace')
    expect(container.textContent).toContain('Projects')
    expect(container.textContent).toContain('Assets')
    expect(container.textContent).not.toContain('工作区')
    expect(container.textContent).not.toContain('项目')
    expect(container.textContent).not.toContain('资产')
    expect(container.textContent).not.toContain('Pipelines')

    root.unmount()
  })

  it('marks the active item and navigates between implemented pages', () => {
    const onNavigate = vi.fn()
    const { container, root } = renderTopNav({
      activeItem: 'Capabilities',
      onNavigate,
    })

    expect(getButton(container, 'Capabilities').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(getButton(container, 'Workspace').getAttribute('aria-current')).toBeNull()

    act(() => {
      getButton(container, 'Workspace').click()
    })

    expect(onNavigate).toHaveBeenCalledWith('Workspace')

    root.unmount()
  })

  it('can mark Projects as the active top navigation item', () => {
    const onNavigate = vi.fn()
    const { container, root } = renderTopNav({
      activeItem: 'Projects',
      onNavigate,
    })

    expect(getButton(container, 'Projects').getAttribute('aria-current')).toBe(
      'page',
    )

    act(() => {
      getButton(container, 'Assets').click()
    })

    expect(onNavigate).toHaveBeenCalledWith('Assets')

    root.unmount()
  })

  it('opens account menu options and reports selected account menu actions', () => {
    const onAccountMenuSelect = vi.fn()
    const { container, root } = renderTopNav({ onAccountMenuSelect })
    const accountButton = container.querySelector<HTMLButtonElement>('.top-nav__user')

    act(() => {
      accountButton?.click()
    })

    expect(getButton(container, '系统设置')).not.toBeNull()
    expect(getButton(container, '费用中心')).not.toBeNull()
    expect(getButton(container, '权限与安全')).not.toBeNull()
    expect(getButton(container, '产品管理平台')).not.toBeNull()

    act(() => {
      getButton(container, '产品管理平台').click()
    })

    expect(onAccountMenuSelect).toHaveBeenCalledWith(
      'product-management-platform',
    )
    expect(container.textContent).not.toContain('产品管理平台')

    root.unmount()
  })
})

function renderTopNav(
  props: Partial<React.ComponentProps<typeof TopNav>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(
      <TopNav
        activeItem="Workspace"
        onNavigate={() => undefined}
        onNotify={() => undefined}
        onAccountMenuSelect={() => undefined}
        {...props}
      />,
    )
  })

  return { container, root }
}

function getButton(container: HTMLElement, name: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === name,
  )

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}
