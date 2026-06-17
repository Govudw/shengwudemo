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
  it('renders full page metrics, compact controls, table, and inspector', () => {
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
    expect(getSelect(container, '时间').value).toBe('all')
    expect(querySelect(container, '业务状态')).toBeNull()
    expect(querySelect(container, '来源')).toBeNull()
    expect(getButton(container, '更多筛选')).not.toBeNull()
    expect(getTable(container).querySelectorAll('tbody tr')).toHaveLength(
      notificationCenterSeedItems.length,
    )
    expect(container.textContent).toContain('EGFR 实验订单等待审批')
    expect(container.textContent).toContain('提醒详情')

    root.unmount()
  })

  it('keeps advanced filters behind a single more filter button', () => {
    const { container, root } = renderPage()

    expect(getButton(container, '更多筛选')).not.toBeNull()
    expect(querySelect(container, '业务状态')).toBeNull()
    expect(querySelect(container, '来源')).toBeNull()
    expect(querySelect(container, '类型')).toBeNull()

    act(() => {
      getButton(container, '更多筛选').click()
    })

    expect(getSelect(container, '业务状态').value).toBe('all')
    expect(getSelect(container, '来源').value).toBe('all')
    expect(getSelect(container, '类型').value).toBe('all')
    expect(getSelect(container, '已读状态').value).toBe('all')
    expect(container.textContent).toContain('全部业务状态')
    expect(container.textContent).toContain('全部来源')
    expect(container.textContent).toContain('全部类型')

    root.unmount()
  })

  it('shows the selected advanced filter count on the more filter button', () => {
    const { container, root } = renderPage({
      businessStatusFilter: 'approvalPending',
      sourceFilter: 'project',
      typeFilter: 'agent',
    })

    expect(getButtonContaining(container, '更多筛选').textContent).toContain('3')

    root.unmount()
  })

  it('combines reminder status and read status filters independently', () => {
    const notifications = notificationCenterSeedItems.map((notification) =>
      notification.id === 'notification-agent-egfr-confirmation'
        ? { ...notification, read: true }
        : notification,
    )
    const { container, root } = renderPage({
      notifications,
      statusFilter: 'actionRequired',
      readStatusFilter: 'unread',
      advancedFiltersOpen: true,
    })
    const rowText = Array.from(
      getTable(container).querySelectorAll('tbody tr'),
    ).map((row) => row.textContent ?? '')

    expect(getSelect(container, '提醒状态').value).toBe('actionRequired')
    expect(getSelect(container, '已读状态').value).toBe('unread')
    expect(getButtonContaining(container, '更多筛选').textContent).toContain('1')
    expect(rowText).toHaveLength(2)
    expect(rowText.some((text) => text.includes('EGFR 实验订单等待审批'))).toBe(
      true,
    )
    expect(
      rowText.some((text) => text.includes('CRO 订单外部审批回调失败')),
    ).toBe(true)
    expect(
      rowText.some((text) => text.includes('EGFR 亲和力优化等待确认')),
    ).toBe(false)

    root.unmount()
  })

  it('keeps reminder status and read status change handlers separate', () => {
    const onStatusFilterChange = vi.fn()
    const onReadStatusFilterChange = vi.fn()
    const { container, root } = renderPage({
      advancedFiltersOpen: true,
      onStatusFilterChange,
      onReadStatusFilterChange,
    })

    act(() => {
      setSelectValue(getSelect(container, '提醒状态'), 'actionRequired')
    })
    act(() => {
      setSelectValue(getSelect(container, '已读状态'), 'unread')
    })

    expect(onStatusFilterChange).toHaveBeenCalledWith('actionRequired')
    expect(onStatusFilterChange).not.toHaveBeenCalledWith('unread')
    expect(onReadStatusFilterChange).toHaveBeenCalledWith('unread')

    root.unmount()
  })

  it('hides batch actions until rows are selected', () => {
    const { container, root, rerender } = renderPage()

    expect(queryButton(container, '全部已读')).toBeNull()
    expect(queryButton(container, '批量清除提醒')).toBeNull()

    rerender({
      selectedNotificationIds: ['notification-approval-egfr-order'],
    })

    expect(getButton(container, '全部已读')).not.toBeNull()
    expect(getButton(container, '批量清除提醒')).not.toBeNull()

    root.unmount()
  })

  it('keeps default table columns compact and moves object metadata out of the list', () => {
    const { container, root } = renderPage()
    const headers = Array.from(getTable(container).querySelectorAll('th')).map(
      (header) => header.textContent?.trim(),
    )

    expect(headers).toEqual([
      '选择',
      '提醒',
      '类型',
      '通知内容',
      '来源',
      '时间',
      '操作',
    ])
    expect(headers).not.toContain('对象')
    expect(headers).not.toContain('业务状态')

    root.unmount()
  })

  it('uses localized primary notification copy', () => {
    const { container, root } = renderPage()

    expect(container.textContent).toContain('打开对话')
    expect(container.textContent).not.toContain('打开 Thread')
    expect(container.textContent).not.toContain('Provider')

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
          readStatusFilter="all"
          businessStatusFilter="all"
          sourceFilter="all"
          typeFilter="all"
          timeFilter="all"
          selectedNotificationId={null}
          selectedNotificationIds={[]}
          detailOpen={false}
          onPresetChange={() => undefined}
          onSearchChange={() => undefined}
          onStatusFilterChange={() => undefined}
          onReadStatusFilterChange={() => undefined}
          onBusinessStatusFilterChange={() => undefined}
          onSourceFilterChange={() => undefined}
          onTypeFilterChange={() => undefined}
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
  const button = queryButton(container, name)

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}

function getButtonContaining(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) =>
    element.textContent?.includes(text),
  )

  if (!button) {
    throw new Error(`Button containing text not found: ${text}`)
  }

  return button
}

function queryButton(container: HTMLElement, name: string) {
  return (
    Array.from(container.querySelectorAll('button')).find(
      (element) => element.textContent?.trim() === name,
    ) ?? null
  )
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
  const select = querySelect(container, label)

  if (!select) {
    throw new Error(`Select not found: ${label}`)
  }

  return select
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  select.value = value
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

function querySelect(container: HTMLElement, label: string) {
  const select = container.querySelector<HTMLSelectElement>(
    `select[aria-label="${label}"]`,
  )

  return select
}

function getTable(container: HTMLElement) {
  const table = container.querySelector('table')

  if (!table) {
    throw new Error('Notification table not found')
  }

  return table
}
