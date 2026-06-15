// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { notificationCenterSeedItems } from '../../data/notificationCenterMockData'
import NotificationCenterDrawer from './NotificationCenterDrawer'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('NotificationCenterDrawer', () => {
  it('renders counts, compact filters, and grouped notifications', () => {
    const { container, root } = renderDrawer()

    expect(getDialog(container).textContent).toContain('通知中心')
    expect(getDialog(container).textContent).toContain('3 待处理 · 7 未读')
    expect(getButton(container, '全部').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '待处理')).not.toBeNull()
    expect(container.textContent).toContain('今天')
    expect(container.textContent).toContain('昨天')
    expect(container.textContent).toContain('EGFR 实验订单等待审批')

    root.unmount()
  })

  it('marks a notification read when its row is clicked without resolving it', () => {
    const onMarkRead = vi.fn()
    const { container, root } = renderDrawer({ onMarkRead })

    act(() => {
      getButton(container, 'EGFR 实验订单等待审批').click()
    })

    expect(onMarkRead).toHaveBeenCalledWith('notification-approval-egfr-order')
    expect(container.textContent).toContain('标记已处理')

    root.unmount()
  })

  it('keeps rows non-interactive while the title button selects the notification', () => {
    const onMarkRead = vi.fn()
    const { container, root } = renderDrawer({ onMarkRead })
    const row = container.querySelector<HTMLElement>('.notification-center__row')

    expect(row?.tagName).toBe('ARTICLE')
    expect(row?.getAttribute('role')).toBeNull()
    expect(row?.getAttribute('tabindex')).toBeNull()

    act(() => {
      getButton(container, 'EGFR 实验订单等待审批').click()
    })

    expect(onMarkRead).toHaveBeenCalledWith('notification-approval-egfr-order')

    root.unmount()
  })

  it('closes the drawer after a primary notification action', () => {
    const onPrimaryAction = vi.fn()
    const onClose = vi.fn()
    const { container, root } = renderDrawer({ onClose, onPrimaryAction })

    act(() => {
      getButton(container, '去审批').click()
    })

    expect(onPrimaryAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'notification-approval-egfr-order' }),
    )
    expect(onClose).toHaveBeenCalledTimes(1)

    root.unmount()
  })

  it('marks every notification read without resolving pending actions', () => {
    const onMarkAllRead = vi.fn()
    const onMarkResolved = vi.fn()
    const { container, root } = renderDrawer({ onMarkAllRead, onMarkResolved })

    act(() => {
      getButton(container, '全部已读').click()
    })

    expect(onMarkAllRead).toHaveBeenCalledTimes(1)
    expect(onMarkResolved).not.toHaveBeenCalled()

    root.unmount()
  })

  it('shows only actionable items in the persisted pending filter and resolves rows explicitly', () => {
    const onFilterChange = vi.fn()
    const onMarkResolved = vi.fn()
    const { container, root } = renderDrawer({
      filter: 'actionRequired',
      onFilterChange,
      onMarkResolved,
    })

    expect(getButton(container, '待处理').getAttribute('aria-pressed')).toBe('true')
    expect(container.textContent).toContain('EGFR 实验订单等待审批')
    expect(container.textContent).not.toContain('AI-Ready Dataset 已生成')

    act(() => {
      getButton(container, '标记已处理').click()
    })

    expect(onMarkResolved).toHaveBeenCalled()

    act(() => {
      getButton(container, '系统').click()
    })

    expect(onFilterChange).toHaveBeenCalledWith('system')

    root.unmount()
  })

  it('shows concise empty states for filters without matching notifications', () => {
    const { container, root } = renderDrawer({
      filter: 'approval',
      notifications: notificationCenterSeedItems.filter(
        (item) => item.category !== 'approval',
      ),
    })

    expect(container.textContent).toContain('暂无审批通知')

    root.unmount()
  })
})

function renderDrawer(
  props: Partial<React.ComponentProps<typeof NotificationCenterDrawer>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(
      <NotificationCenterDrawer
        open
        notifications={notificationCenterSeedItems}
        filter="all"
        onFilterChange={() => undefined}
        onClose={() => undefined}
        onMarkRead={() => undefined}
        onMarkAllRead={() => undefined}
        onMarkResolved={() => undefined}
        onPrimaryAction={() => undefined}
        {...props}
      />,
    )
  })

  return { container, root }
}

function getDialog(container: HTMLElement) {
  const dialog = container.querySelector<HTMLElement>('[role="dialog"]')

  if (!dialog) {
    throw new Error('Notification dialog not found')
  }

  return dialog
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
