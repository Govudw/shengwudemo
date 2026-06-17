import { useEffect, useMemo, useState } from 'react'
import {
  countActionRequiredNotifications,
  countUnreadNotifications,
  filterNotifications,
  groupNotificationsByTime,
  isActionRequiredNotification,
} from '../../data/notificationCenterMockData'
import type {
  NotificationFilter,
  NotificationItem,
} from '../../data/notificationCenterMockData'
import {
  BellIcon,
  DatabaseIcon,
  FolderIcon,
  InfoIcon,
  WarningIcon,
  XIcon,
} from '../icons'

type NotificationCenterDrawerProps = {
  open: boolean
  notifications: NotificationItem[]
  filter: NotificationFilter
  onFilterChange: (filter: NotificationFilter) => void
  onClose: () => void
  onMarkRead: (notificationId: string) => void
  onMarkAllRead: () => void
  onMarkResolved: (notificationId: string) => void
  onPrimaryAction: (notification: NotificationItem) => void
  onOpenFullPage?: (notificationId?: string) => void
}

const filters: { id: NotificationFilter; label: string; empty: string }[] = [
  { id: 'all', label: '全部', empty: '暂无通知' },
  { id: 'actionRequired', label: '待关注', empty: '暂无待关注通知' },
  { id: 'approval', label: '审批', empty: '暂无审批通知' },
  { id: 'agent', label: 'Agent', empty: '暂无 Agent 通知' },
  { id: 'asset', label: '资产', empty: '暂无资产通知' },
  { id: 'system', label: '系统', empty: '暂无系统通知' },
]

function NotificationCenterDrawer({
  open,
  notifications,
  filter,
  onFilterChange,
  onClose,
  onMarkRead,
  onMarkAllRead,
  onMarkResolved,
  onPrimaryAction,
  onOpenFullPage,
}: NotificationCenterDrawerProps) {
  const [activeNotificationId, setActiveNotificationId] = useState<string | null>(
    null,
  )
  const visibleNotifications = useMemo(
    () => filterNotifications(notifications, filter),
    [filter, notifications],
  )
  const groups = useMemo(
    () => groupNotificationsByTime(visibleNotifications),
    [visibleNotifications],
  )
  const actionRequiredCount = countActionRequiredNotifications(notifications)
  const unreadCount = countUnreadNotifications(notifications)
  const emptyLabel =
    filters.find((filterOption) => filterOption.id === filter)?.empty ?? '暂无通知'

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  function handleRowSelect(notification: NotificationItem) {
    setActiveNotificationId(notification.id)
    onMarkRead(notification.id)
    onOpenFullPage?.(notification.id)
  }

  function handlePrimaryAction(notification: NotificationItem) {
    setActiveNotificationId(notification.id)
    onMarkRead(notification.id)
    onPrimaryAction(notification)
    onClose()
  }

  return (
    <div className="notification-center-shell">
      <aside
        className="notification-center"
        role="dialog"
        aria-modal="false"
        aria-label="通知抽屉"
      >
        <header className="notification-center__header">
          <div>
            <h2>通知</h2>
            <p>
              {actionRequiredCount} 待关注 · {unreadCount} 未读
            </p>
          </div>
          <div className="notification-center__header-actions">
            {onOpenFullPage ? (
              <button
                type="button"
                className="notification-center__open-full"
                onClick={() => onOpenFullPage()}
              >
                查看全部
              </button>
            ) : null}
            <button
              type="button"
              className="notification-center__mark-all"
              onClick={onMarkAllRead}
            >
              全部已读
            </button>
            <button
              type="button"
              className="notification-center__close"
              aria-label="关闭通知抽屉"
              onClick={onClose}
            >
              <XIcon className="notification-center__close-icon" />
            </button>
          </div>
        </header>

        <div className="notification-center__filters" aria-label="通知筛选">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              type="button"
              className={`notification-center__filter${
                filterOption.id === filter
                  ? ' notification-center__filter--active'
                  : ''
              }`}
              aria-pressed={filterOption.id === filter}
              onClick={() => onFilterChange(filterOption.id)}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        <div className="notification-center__list">
          {groups.length > 0 ? (
            groups.map((group) => (
              <section
                key={group.label}
                className="notification-center__group"
                aria-label={group.label}
              >
                <h3>{group.label}</h3>
                {group.items.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    active={notification.id === activeNotificationId}
                    onSelect={() => handleRowSelect(notification)}
                    onResolve={() => onMarkResolved(notification.id)}
                    onPrimaryAction={() => handlePrimaryAction(notification)}
                  />
                ))}
              </section>
            ))
          ) : (
            <div className="notification-center__empty">{emptyLabel}</div>
          )}
        </div>
      </aside>
    </div>
  )
}

type NotificationRowProps = {
  notification: NotificationItem
  active: boolean
  onSelect: () => void
  onResolve: () => void
  onPrimaryAction: () => void
}

function NotificationRow({
  notification,
  active,
  onSelect,
  onResolve,
  onPrimaryAction,
}: NotificationRowProps) {
  return (
    <article
      className={`notification-center__row${
        notification.read ? '' : ' notification-center__row--unread'
      }${active ? ' notification-center__row--active' : ''}`}
    >
      <div
        className={`notification-center__type notification-center__type--${notification.category}`}
        aria-hidden="true"
      >
        <NotificationIcon notification={notification} />
      </div>
      <div className="notification-center__row-body">
        <div className="notification-center__row-top">
          <button
            type="button"
            className="notification-center__title"
            onClick={(event) => {
              event.stopPropagation()
              onSelect()
            }}
          >
            {notification.title}
          </button>
          {notification.statusLabel ? (
            <span
              className={`notification-center__status notification-center__status--${notification.actionState} notification-center__status--${notification.severity}`}
            >
              {notification.statusLabel}
            </span>
          ) : null}
        </div>
        <div className="notification-center__meta">
          <span>{notification.sourceLabel}</span>
          <time dateTime={notification.createdAt}>
            {formatNotificationTime(notification.createdAt)}
          </time>
        </div>
        <div className="notification-center__row-actions">
          {notification.primaryActionLabel ? (
            <button
              type="button"
              className="notification-center__primary-action"
              onClick={(event) => {
                event.stopPropagation()
                onPrimaryAction()
              }}
            >
              {notification.primaryActionLabel}
            </button>
          ) : null}
          {isActionRequiredNotification(notification) ? (
            <button
              type="button"
              className="notification-center__resolve-action"
              onClick={(event) => {
                event.stopPropagation()
                onResolve()
              }}
            >
              清除提醒
            </button>
          ) : null}
        </div>
      </div>
      {!notification.read ? (
        <span className="notification-center__unread-dot" aria-label="未读" />
      ) : null}
    </article>
  )
}

function NotificationIcon({ notification }: { notification: NotificationItem }) {
  if (notification.actionState === 'failed') {
    return <WarningIcon className="notification-center__type-icon" />
  }

  if (notification.category === 'approval') {
    return <BellIcon className="notification-center__type-icon" />
  }

  if (notification.category === 'asset') {
    return <DatabaseIcon className="notification-center__type-icon" />
  }

  if (notification.category === 'system') {
    return <InfoIcon className="notification-center__type-icon" />
  }

  return <FolderIcon className="notification-center__type-icon" />
}

function formatNotificationTime(createdAt: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(new Date(createdAt))
}

export default NotificationCenterDrawer
