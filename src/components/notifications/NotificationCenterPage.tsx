import { useMemo } from 'react'
import {
  isActionRequiredNotification,
  sortNotificationsForTriage,
} from '../../data/notificationCenterMockData'
import type {
  NotificationCategory,
  NotificationCenterBusinessStatusFilter,
  NotificationCenterPreset,
  NotificationCenterSourceFilter,
  NotificationCenterStatusFilter,
  NotificationCenterTimeFilter,
  NotificationItem,
} from '../../data/notificationCenterMockData'

export type NotificationCenterPageProps = {
  notifications: NotificationItem[]
  preset: NotificationCenterPreset
  search: string
  statusFilter: NotificationCenterStatusFilter
  businessStatusFilter: NotificationCenterBusinessStatusFilter
  sourceFilter: NotificationCenterSourceFilter
  timeFilter: NotificationCenterTimeFilter
  selectedNotificationId: string | null
  selectedNotificationIds: string[]
  detailOpen: boolean
  onPresetChange: (preset: NotificationCenterPreset) => void
  onSearchChange: (search: string) => void
  onStatusFilterChange: (filter: NotificationCenterStatusFilter) => void
  onBusinessStatusFilterChange: (
    filter: NotificationCenterBusinessStatusFilter,
  ) => void
  onSourceFilterChange: (filter: NotificationCenterSourceFilter) => void
  onTimeFilterChange: (filter: NotificationCenterTimeFilter) => void
  onSelectNotification: (notificationId: string) => void
  onToggleNotification: (notificationId: string, selected: boolean) => void
  onDetailOpenChange: (open: boolean) => void
  onMarkAllRead: () => void
  onBatchClearReminders: (notificationIds: string[]) => void
  onMarkRead: (notificationId: string) => void
  onClearReminder: (notificationId: string) => void
  onPrimaryAction: (notification: NotificationItem) => void
  onBack?: () => void
}

const presetOptions: { id: NotificationCenterPreset; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'actionRequired', label: '待关注' },
  { id: 'unread', label: '未读' },
  { id: 'approval', label: '审批' },
  { id: 'agent', label: 'Agent' },
  { id: 'asset', label: '资产' },
  { id: 'system', label: '系统' },
]

const categoryLabels: Record<NotificationCategory, string> = {
  approval: '审批',
  agent: 'Agent',
  asset: '资产',
  system: '系统',
  collaboration: '协作',
}

const sourceLabels: Record<NotificationCenterSourceFilter, string> = {
  all: '全部来源',
  project: 'Project',
  thread: 'Thread',
  asset: 'Asset',
  connector: 'Connector',
  admin: 'Admin',
}

function NotificationCenterPage({
  notifications,
  preset,
  search,
  statusFilter,
  businessStatusFilter,
  sourceFilter,
  timeFilter,
  selectedNotificationId,
  selectedNotificationIds,
  detailOpen,
  onPresetChange,
  onSearchChange,
  onStatusFilterChange,
  onBusinessStatusFilterChange,
  onSourceFilterChange,
  onTimeFilterChange,
  onSelectNotification,
  onToggleNotification,
  onDetailOpenChange,
  onMarkAllRead,
  onBatchClearReminders,
  onMarkRead,
  onClearReminder,
  onPrimaryAction,
  onBack,
}: NotificationCenterPageProps) {
  const visibleNotifications = useMemo(
    () =>
      filterNotificationCenterItems(notifications, {
        preset,
        search,
        statusFilter,
        businessStatusFilter,
        sourceFilter,
        timeFilter,
      }),
    [
      businessStatusFilter,
      notifications,
      preset,
      search,
      sourceFilter,
      statusFilter,
      timeFilter,
    ],
  )
  const selectedNotification =
    visibleNotifications.find((item) => item.id === selectedNotificationId) ??
    null
  const detailActive = Boolean(detailOpen && selectedNotification)
  const selectedAttentionIds = selectedNotificationIds.filter((notificationId) => {
    const notification = notifications.find((item) => item.id === notificationId)

    return notification ? isActionRequiredNotification(notification) : false
  })
  const attentionCount = notifications.filter(isActionRequiredNotification).length
  const unreadCount = notifications.filter((item) => !item.read).length
  const todayCount = notifications.filter((item) =>
    matchesTimeFilter(item, notifications, 'today'),
  ).length
  const exceptionCount = notifications.filter(
    (item) => item.severity === 'danger' || item.actionState === 'failed',
  ).length

  function handleSelect(notification: NotificationItem) {
    onSelectNotification(notification.id)
    onMarkRead(notification.id)
    onDetailOpenChange(true)
  }

  function handleBatchClear() {
    if (selectedAttentionIds.length > 0) {
      onBatchClearReminders(selectedAttentionIds)
    }
  }

  return (
    <main className="notification-center-page" aria-label="通知中心">
      <header className="notification-page-header">
        <div className="notification-page-header__title">
          {onBack ? (
            <button
              type="button"
              className="notification-page-back"
              onClick={onBack}
            >
              返回
            </button>
          ) : null}
          <div>
            <h1>通知中心</h1>
            <p>只管理已读和提醒状态，不修改来源业务对象。</p>
          </div>
        </div>
        <div className="notification-page-metrics" aria-label="通知指标">
          <MetricCard label="待关注" value={attentionCount} />
          <MetricCard label="未读" value={unreadCount} />
          <MetricCard label="今日" value={todayCount} />
          <MetricCard label="异常" value={exceptionCount} />
        </div>
      </header>

      <section className="notification-page-toolbar" aria-label="通知筛选工具">
        <div className="notification-page-tabs" aria-label="通知预设">
          {presetOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`notification-page-tab${
                option.id === preset ? ' notification-page-tab--active' : ''
              }`}
              aria-pressed={option.id === preset}
              onClick={() => onPresetChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <label className="notification-page-search">
          <span className="visually-hidden">搜索通知</span>
          <input
            aria-label="搜索通知"
            value={search}
            placeholder="搜索通知、项目、对象"
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
        <div className="notification-page-filters">
          <FilterSelect
            label="提醒状态"
            value={statusFilter}
            onChange={(value) =>
              onStatusFilterChange(value as NotificationCenterStatusFilter)
            }
            options={[
              ['all', '全部提醒'],
              ['actionRequired', '待关注'],
              ['cleared', '已清除'],
              ['unread', '未读'],
              ['read', '已读'],
            ]}
          />
          <FilterSelect
            label="业务状态"
            value={businessStatusFilter}
            onChange={(value) =>
              onBusinessStatusFilterChange(
                value as NotificationCenterBusinessStatusFilter,
              )
            }
            options={[
              ['all', '全部业务状态'],
              ['approvalPending', '待审批'],
              ['confirmationPending', '待确认'],
              ['failed', '失败'],
              ['completed', '已完成'],
            ]}
          />
          <FilterSelect
            label="来源"
            value={sourceFilter}
            onChange={(value) =>
              onSourceFilterChange(value as NotificationCenterSourceFilter)
            }
            options={Object.entries(sourceLabels)}
          />
          <FilterSelect
            label="时间范围"
            value={timeFilter}
            onChange={(value) =>
              onTimeFilterChange(value as NotificationCenterTimeFilter)
            }
            options={[
              ['all', '全部时间'],
              ['today', '今天'],
              ['last7Days', '最近 7 天'],
              ['last30Days', '最近 30 天'],
            ]}
          />
        </div>
        <div className="notification-page-actions">
          <button
            type="button"
            className="notification-page-secondary-action"
            onClick={onMarkAllRead}
          >
            全部已读
          </button>
          <button
            type="button"
            className="notification-page-primary-action"
            disabled={selectedAttentionIds.length === 0}
            onClick={handleBatchClear}
          >
            批量清除提醒
          </button>
        </div>
      </section>

      <div
        className={`notification-page-layout ${
          detailActive
            ? 'notification-page-layout--detail-open'
            : 'notification-page-layout--detail-closed'
        }`}
      >
        <section className="notification-page-table-shell" aria-label="通知列表">
          <table className="notification-page-table">
            <thead>
              <tr>
                <th scope="col" className="notification-page-table__select">
                  选择
                </th>
                <th scope="col">提醒</th>
                <th scope="col">类型</th>
                <th scope="col">通知内容</th>
                <th scope="col">来源</th>
                <th scope="col">对象</th>
                <th scope="col" className="notification-page-table__business-status">
                  业务状态
                </th>
                <th scope="col" className="notification-page-table__time">
                  时间
                </th>
                <th scope="col" className="notification-page-table__actions-col">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleNotifications.map((notification) => {
                const selected = selectedNotificationIds.includes(notification.id)
                const active = notification.id === selectedNotificationId
                const canClear = isActionRequiredNotification(notification)

                return (
                  <tr
                    key={notification.id}
                    className={active ? 'notification-page-table__row--active' : ''}
                  >
                    <td className="notification-page-table__select">
                      <input
                        type="checkbox"
                        aria-label={`选择 ${notification.title}`}
                        checked={selected}
                        disabled={!canClear}
                        onChange={(event) =>
                          onToggleNotification(
                            notification.id,
                            event.currentTarget.checked,
                          )
                        }
                      />
                    </td>
                    <td>
                      <span
                        className={`notification-page-badge notification-page-badge--${getAttentionTone(notification)}`}
                      >
                        {getAttentionLabel(notification)}
                      </span>
                    </td>
                    <td>{categoryLabels[notification.category]}</td>
                    <td>
                      <button
                        type="button"
                        className="notification-page-row-title"
                        onClick={() => handleSelect(notification)}
                      >
                        {notification.title}
                      </button>
                      <p className="notification-page-row-summary">
                        {notification.summary}
                      </p>
                    </td>
                    <td>{notification.sourceLabel}</td>
                    <td>{getNotificationObjectLabel(notification)}</td>
                    <td className="notification-page-table__business-status">
                      {getBusinessStatusLabel(notification)}
                    </td>
                    <td className="notification-page-table__time">
                      <time dateTime={notification.createdAt}>
                        {formatNotificationDateTime(notification.createdAt)}
                      </time>
                    </td>
                    <td className="notification-page-table__actions-col">
                      <div className="notification-page-row-actions">
                        {notification.primaryActionLabel ? (
                          <button
                            type="button"
                            className="notification-page-link-action"
                            onClick={() => onPrimaryAction(notification)}
                          >
                            {notification.primaryActionLabel}
                          </button>
                        ) : null}
                        {canClear ? (
                          <button
                            type="button"
                            className="notification-page-link-action"
                            onClick={() => onClearReminder(notification.id)}
                          >
                            清除提醒
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {visibleNotifications.length === 0 ? (
            <div className="notification-page-empty">
              <h2>没有匹配的通知</h2>
              <p>
                {search.trim()
                  ? `当前搜索“${search.trim()}”没有结果。`
                  : '调整筛选条件后再查看。'}
              </p>
            </div>
          ) : null}
        </section>

        {detailActive && selectedNotification ? (
          <aside className="notification-page-inspector" aria-label="提醒详情">
            <div className="notification-page-inspector__header">
              <div>
                <h2>提醒详情</h2>
                <p>{categoryLabels[selectedNotification.category]}</p>
              </div>
              <button
                type="button"
                className="notification-page-inspector__close"
                onClick={() => onDetailOpenChange(false)}
              >
                关闭
              </button>
            </div>
            <h3>{selectedNotification.title}</h3>
            <p>{selectedNotification.summary}</p>
            <dl className="notification-page-inspector__meta">
              <div>
                <dt>提醒状态</dt>
                <dd>{getAttentionLabel(selectedNotification)}</dd>
              </div>
              <div>
                <dt>业务状态</dt>
                <dd>{getBusinessStatusLabel(selectedNotification)}</dd>
              </div>
              <div>
                <dt>来源</dt>
                <dd>{selectedNotification.sourceLabel}</dd>
              </div>
              <div>
                <dt>对象</dt>
                <dd>{getNotificationObjectLabel(selectedNotification)}</dd>
              </div>
              <div>
                <dt>时间</dt>
                <dd>{formatNotificationDateTime(selectedNotification.createdAt)}</dd>
              </div>
            </dl>
            <div className="notification-page-inspector__actions">
              {selectedNotification.primaryActionLabel ? (
                <button
                  type="button"
                  className="notification-page-primary-action"
                  onClick={() => onPrimaryAction(selectedNotification)}
                >
                  {selectedNotification.primaryActionLabel}
                </button>
              ) : null}
              {isActionRequiredNotification(selectedNotification) ? (
                <button
                  type="button"
                  className="notification-page-secondary-action"
                  onClick={() => onClearReminder(selectedNotification.id)}
                >
                  清除提醒
                </button>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  )
}

type FilterSelectProps = {
  label: string
  value: string
  options: [string, string][]
  onChange: (value: string) => void
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="notification-page-filter">
      <span>{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  )
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="notification-page-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function filterNotificationCenterItems(
  notifications: NotificationItem[],
  filters: {
    preset: NotificationCenterPreset
    search: string
    statusFilter: NotificationCenterStatusFilter
    businessStatusFilter: NotificationCenterBusinessStatusFilter
    sourceFilter: NotificationCenterSourceFilter
    timeFilter: NotificationCenterTimeFilter
  },
) {
  const normalizedSearch = filters.search.trim().toLocaleLowerCase()

  return sortNotificationsForTriage(notifications).filter((notification) => {
    if (
      filters.preset === 'actionRequired' &&
      !isActionRequiredNotification(notification)
    ) {
      return false
    }

    if (filters.preset === 'unread' && notification.read) {
      return false
    }

    if (
      filters.preset !== 'all' &&
      filters.preset !== 'actionRequired' &&
      filters.preset !== 'unread' &&
      notification.category !== filters.preset
    ) {
      return false
    }

    if (
      filters.statusFilter === 'actionRequired' &&
      !isActionRequiredNotification(notification)
    ) {
      return false
    }

    if (filters.statusFilter === 'cleared' && !notification.cleared) {
      return false
    }

    if (filters.statusFilter === 'read' && !notification.read) {
      return false
    }

    if (filters.statusFilter === 'unread' && notification.read) {
      return false
    }

    if (
      filters.businessStatusFilter !== 'all' &&
      getBusinessStatusFilterValue(notification) !== filters.businessStatusFilter
    ) {
      return false
    }

    if (
      filters.sourceFilter !== 'all' &&
      getNotificationSourceFilterValue(notification) !== filters.sourceFilter
    ) {
      return false
    }

    if (!matchesTimeFilter(notification, notifications, filters.timeFilter)) {
      return false
    }

    if (!normalizedSearch) {
      return true
    }

    return [
      notification.title,
      notification.summary,
      notification.sourceLabel,
      notification.projectName,
      notification.threadTitle,
      notification.assetName,
      notification.actor,
      notification.statusLabel,
      getTargetId(notification),
    ]
      .filter(Boolean)
      .some((value) => value?.toLocaleLowerCase().includes(normalizedSearch))
  })
}

function getAttentionLabel(notification: NotificationItem) {
  if (notification.cleared) {
    return '已清除'
  }

  if (isActionRequiredNotification(notification)) {
    return '待关注'
  }

  if (!notification.read) {
    return '未读'
  }

  return '已读'
}

function getAttentionTone(notification: NotificationItem) {
  if (notification.cleared) {
    return 'cleared'
  }

  if (notification.actionState === 'failed') {
    return 'failed'
  }

  if (isActionRequiredNotification(notification)) {
    return 'actionRequired'
  }

  return notification.read ? 'read' : 'unread'
}

function getBusinessStatusLabel(notification: NotificationItem) {
  return notification.statusLabel ?? getFallbackBusinessStatus(notification)
}

function getFallbackBusinessStatus(notification: NotificationItem) {
  if (notification.actionState === 'failed') {
    return '失败'
  }

  if (notification.actionState === 'resolved') {
    return '已完成'
  }

  return '无'
}

function getBusinessStatusFilterValue(
  notification: NotificationItem,
): NotificationCenterBusinessStatusFilter {
  if (notification.statusLabel === '待审批') {
    return 'approvalPending'
  }

  if (notification.statusLabel === '待确认') {
    return 'confirmationPending'
  }

  if (notification.actionState === 'failed' || notification.statusLabel === '失败') {
    return 'failed'
  }

  if (
    notification.actionState === 'resolved' ||
    notification.statusLabel === '已完成'
  ) {
    return 'completed'
  }

  return 'all'
}

function getNotificationSourceFilterValue(
  notification: NotificationItem,
): NotificationCenterSourceFilter {
  const { target } = notification

  if (target.surface === 'asset') {
    return 'asset'
  }

  if (target.surface === 'thread' || target.surface === 'runInspector') {
    return 'thread'
  }

  if (target.surface === 'admin') {
    return 'admin'
  }

  if (target.surface === 'approvalCenter' && target.section === 'external') {
    return 'connector'
  }

  return 'project'
}

function getNotificationObjectLabel(notification: NotificationItem) {
  return (
    getTargetId(notification) ??
    notification.assetName ??
    notification.threadTitle ??
    notification.projectName ??
    '—'
  )
}

function getTargetId(notification: NotificationItem) {
  return 'targetId' in notification.target
    ? notification.target.targetId
    : undefined
}

function matchesTimeFilter(
  notification: NotificationItem,
  notifications: NotificationItem[],
  timeFilter: NotificationCenterTimeFilter,
) {
  if (timeFilter === 'all' || notifications.length === 0) {
    return true
  }

  const maxTime = Math.max(...notifications.map((item) => Date.parse(item.createdAt)))
  const notificationTime = Date.parse(notification.createdAt)

  if (timeFilter === 'today') {
    return getDateKey(new Date(notificationTime)) === getDateKey(new Date(maxTime))
  }

  if (timeFilter === 'last7Days') {
    return maxTime - notificationTime <= 7 * 24 * 60 * 60 * 1000
  }

  return maxTime - notificationTime <= 30 * 24 * 60 * 60 * 1000
}

function formatNotificationDateTime(createdAt: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(new Date(createdAt))
}

const shanghaiDateKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function getDateKey(date: Date) {
  const parts = shanghaiDateKeyFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '00'
  const day = parts.find((part) => part.type === 'day')?.value ?? '00'

  return `${year}-${month}-${day}`
}

export default NotificationCenterPage
