import { describe, expect, it } from 'vitest'
import {
  applyNotificationOverrides,
  countActionRequiredNotifications,
  countUnreadNotifications,
  filterNotifications,
  groupNotificationsByTime,
  notificationCenterSeedItems,
  sortNotificationsForTriage,
} from './notificationCenterMockData'

describe('notificationCenterMockData', () => {
  it('seeds the first demo drawer with 3 pending actions and 7 unread notifications', () => {
    expect(notificationCenterSeedItems).toHaveLength(8)
    expect(countActionRequiredNotifications(notificationCenterSeedItems)).toBe(3)
    expect(countUnreadNotifications(notificationCenterSeedItems)).toBe(7)
  })

  it('applies read and resolved overrides without mutating seed notifications', () => {
    const resolved = applyNotificationOverrides(notificationCenterSeedItems, {
      readById: {
        'notification-approval-egfr-order': true,
      },
      resolvedById: {
        'notification-approval-egfr-order': true,
      },
    })

    expect(
      resolved.find((item) => item.id === 'notification-approval-egfr-order'),
    ).toMatchObject({
      read: true,
      actionState: 'resolved',
      statusLabel: '已完成',
    })
    expect(
      notificationCenterSeedItems.find(
        (item) => item.id === 'notification-approval-egfr-order',
      ),
    ).toMatchObject({ read: false, actionState: 'actionRequired' })
    expect(countActionRequiredNotifications(resolved)).toBe(2)
    expect(countUnreadNotifications(resolved)).toBe(6)
  })

  it('filters action-required rows separately from approval category rows', () => {
    const actionRequired = filterNotifications(
      notificationCenterSeedItems,
      'actionRequired',
    )
    const approval = filterNotifications(notificationCenterSeedItems, 'approval')

    expect(actionRequired.map((item) => item.id)).toEqual([
      'notification-agent-egfr-confirmation',
      'notification-approval-egfr-order',
      'notification-approval-cro-callback-failed',
    ])
    expect(approval.map((item) => item.id)).toEqual([
      'notification-approval-egfr-order',
      'notification-approval-cro-callback-failed',
    ])
  })

  it('sorts triage rows by action state, unread state, then recency and groups by day', () => {
    const sorted = sortNotificationsForTriage(notificationCenterSeedItems)
    const groups = groupNotificationsByTime(sorted)

    expect(sorted.slice(0, 3).map((item) => item.id)).toEqual([
      'notification-agent-egfr-confirmation',
      'notification-approval-egfr-order',
      'notification-approval-cro-callback-failed',
    ])
    expect(groups.map((group) => group.label)).toEqual(['今天', '昨天'])
    expect(groups[0].items).toHaveLength(7)
    expect(groups[1].items).toHaveLength(1)
  })

  it('groups notifications by Asia Shanghai local date around midnight', () => {
    const midnightItem = {
      ...notificationCenterSeedItems[0],
      id: 'notification-local-midnight',
      createdAt: '2026-06-15T00:30:00+08:00',
      actionState: 'none' as const,
    }
    const sameLocalDateMaxItem = {
      ...notificationCenterSeedItems[1],
      id: 'notification-local-evening',
      createdAt: '2026-06-15T23:00:00+08:00',
      actionState: 'none' as const,
    }

    const groups = groupNotificationsByTime([
      midnightItem,
      sameLocalDateMaxItem,
    ])

    expect(groups).toHaveLength(1)
    expect(groups[0].label).toBe('今天')
    expect(groups[0].items.map((item) => item.id)).toEqual([
      'notification-local-evening',
      'notification-local-midnight',
    ])
  })
})
