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
  it('uses Chinese labels except the Capabilities platform term', () => {
    const { container, root } = renderTopNav()

    expect(container.textContent).toContain('Capabilities')
    expect(container.textContent).toContain('工作区')
    expect(container.textContent).toContain('项目')
    expect(container.textContent).toContain('资产')
    expect(container.textContent).not.toContain('Pipelines')
    expect(container.textContent).not.toContain('Workspace')

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
    expect(getButton(container, '工作区').getAttribute('aria-current')).toBeNull()

    act(() => {
      getButton(container, '工作区').click()
    })

    expect(onNavigate).toHaveBeenCalledWith('Workspace')

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
