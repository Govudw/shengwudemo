// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { notificationCenterSeedItems } from '../../data/notificationCenterMockData'
import NotificationCenterPage from './NotificationCenterPage'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('NotificationCenterPage', () => {
  it('renders full page metrics, controls, filters, table, and inspector', () => {
    const { container, root } = renderPage({
      selectedNotificationId: 'notification-approval-egfr-order',
      detailOpen: true,
    })

    expect(container.textContent).toContain('通知中心')
    expect(container.textContent).toContain('待关注')
    expect(container.textContent).toContain('未读')
    expect(getButton(container, '全部').getAttribute('aria-pressed')).toBe('true')
    expect(getButton(container, '待关注').getAttribute('aria-pressed')).toBe('false')
    expect(getInput(container, '搜索通知').value).toBe('')
    expect(getSelect(container, '提醒状态').value).toBe('all')
    expect(getSelect(container, '业务状态').value).toBe('all')
    expect(getSelect(container, '来源').value).toBe('all')
    expect(getSelect(container, '时间范围').value).toBe('all')
    expect(getTable(container).querySelectorAll('tbody tr')).toHaveLength(
      notificationCenterSeedItems.length,
    )
    expect(container.textContent).toContain('EGFR 实验订单等待审批')
    expect(container.textContent).toContain('提醒详情')

    root.unmount()
  })

  it('selecting a row marks it read and requests the inspector to open', () => {
    const onSelectNotification = vi.fn()
    const onMarkRead = vi.fn()
    const onDetailOpenChange = vi.fn()
    const { container, root } = renderPage({
      onSelectNotification,
      onMarkRead,
      onDetailOpenChange,
    })

    act(() => {
      getButton(container, 'EGFR 实验订单等待审批').click()
    })

    expect(onSelectNotification).toHaveBeenCalledWith(
      'notification-approval-egfr-order',
    )
    expect(onMarkRead).toHaveBeenCalledWith('notification-approval-egfr-order')
    expect(onDetailOpenChange).toHaveBeenCalledWith(true)

    root.unmount()
  })

  it('keeps the table full width until a notification detail is selected', () => {
    const { container, root, rerender } = renderPage()

    expect(container.querySelector('.notification-page-layout--detail-closed')).not.toBeNull()
    expect(container.querySelector('.notification-page-inspector')).toBeNull()

    rerender({
      selectedNotificationId: 'notification-approval-egfr-order',
      detailOpen: true,
    })

    expect(container.querySelector('.notification-page-layout--detail-open')).not.toBeNull()
    expect(container.querySelector('.notification-page-inspector')?.textContent).toContain(
      'EGFR 实验订单等待审批',
    )

    root.unmount()
  })

  it('enables batch clear only when selected rows still require attention', () => {
    const onBatchClearReminders = vi.fn()
    const { container, root, rerender } = renderPage({
      selectedNotificationIds: ['notification-agent-lims-blocked'],
      onBatchClearReminders,
    })

    expect(getButton(container, '批量清除提醒').hasAttribute('disabled')).toBe(
      true,
    )

    rerender({
      selectedNotificationIds: ['notification-approval-egfr-order'],
      onBatchClearReminders,
    })

    act(() => {
      getButton(container, '批量清除提醒').click()
    })

    expect(onBatchClearReminders).toHaveBeenCalledWith([
      'notification-approval-egfr-order',
    ])

    root.unmount()
  })

  it('primary action does not clear reminders', () => {
    const onPrimaryAction = vi.fn()
    const onClearReminder = vi.fn()
    const { container, root } = renderPage({
      onPrimaryAction,
      onClearReminder,
    })

    act(() => {
      getButton(container, '去审批').click()
    })

    expect(onPrimaryAction).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'notification-approval-egfr-order' }),
    )
    expect(onClearReminder).not.toHaveBeenCalled()

    root.unmount()
  })

  it('shows an empty state when search has no matching notifications', () => {
    const { container, root } = renderPage({ search: 'not-a-real-notification' })

    expect(getTable(container).querySelectorAll('tbody tr')).toHaveLength(0)
    expect(container.textContent).toContain('没有匹配的通知')
    expect(container.textContent).toContain('not-a-real-notification')

    root.unmount()
  })

  it('hides stale inspector detail when the selected notification is filtered out', () => {
    const { container, root, rerender } = renderPage({
      selectedNotificationId: 'notification-approval-egfr-order',
      detailOpen: true,
    })

    expect(container.textContent).toContain('EGFR 实验订单等待审批')

    rerender({
      selectedNotificationId: 'notification-approval-egfr-order',
      detailOpen: true,
      search: 'not-a-real-notification',
    })

    expect(container.querySelector('.notification-page-layout--detail-closed')).not.toBeNull()
    expect(container.querySelector('.notification-page-inspector')).toBeNull()

    root.unmount()
  })
})

function renderPage(
  props: Partial<React.ComponentProps<typeof NotificationCenterPage>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  function render(nextProps: Partial<React.ComponentProps<typeof NotificationCenterPage>>) {
    act(() => {
      root.render(
        <NotificationCenterPage
          notifications={notificationCenterSeedItems}
          preset="all"
          search=""
          statusFilter="all"
          businessStatusFilter="all"
          sourceFilter="all"
          timeFilter="all"
          selectedNotificationId={null}
          selectedNotificationIds={[]}
          detailOpen={false}
          onPresetChange={() => undefined}
          onSearchChange={() => undefined}
          onStatusFilterChange={() => undefined}
          onBusinessStatusFilterChange={() => undefined}
          onSourceFilterChange={() => undefined}
          onTimeFilterChange={() => undefined}
          onSelectNotification={() => undefined}
          onToggleNotification={() => undefined}
          onDetailOpenChange={() => undefined}
          onMarkAllRead={() => undefined}
          onBatchClearReminders={() => undefined}
          onMarkRead={() => undefined}
          onClearReminder={() => undefined}
          onPrimaryAction={() => undefined}
          {...nextProps}
        />,
      )
    })
  }

  render(props)

  return {
    container,
    root,
    rerender: (
      nextProps: Partial<React.ComponentProps<typeof NotificationCenterPage>>,
    ) => render({ ...props, ...nextProps }),
  }
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

function getInput(container: HTMLElement, label: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )

  if (!input) {
    throw new Error(`Input not found: ${label}`)
  }

  return input
}

function getSelect(container: HTMLElement, label: string) {
  const select = container.querySelector<HTMLSelectElement>(
    `select[aria-label="${label}"]`,
  )

  if (!select) {
    throw new Error(`Select not found: ${label}`)
  }

  return select
}

function getTable(container: HTMLElement) {
  const table = container.querySelector('table')

  if (!table) {
    throw new Error('Notification table not found')
  }

  return table
}
