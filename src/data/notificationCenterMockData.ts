export type NotificationCategory =
  | 'approval'
  | 'agent'
  | 'asset'
  | 'system'
  | 'collaboration'

export type NotificationSeverity = 'info' | 'success' | 'warning' | 'danger'

export type NotificationActionState =
  | 'none'
  | 'actionRequired'
  | 'failed'
  | 'resolved'

export type NotificationTarget =
  | {
      surface: 'approvalCenter'
      section?:
        | 'overview'
        | 'pending'
        | 'initiated'
        | 'records'
        | 'rules'
        | 'external'
        | 'audit'
        | 'simulator'
      targetId?: string
    }
  | {
      surface: 'thread'
      projectId: string
      threadId: string
    }
  | {
      surface: 'runInspector'
      projectId: string
      threadId: string
      runId?: string
    }
  | {
      surface: 'asset'
      assetSection: 'file' | 'data' | 'experiment' | 'model' | 'knowledgeBase'
      targetId: string
    }
  | {
      surface: 'admin'
      section?: string
      targetId?: string
    }

export type NotificationItem = {
  id: string
  category: NotificationCategory
  type: string
  title: string
  summary: string
  sourceLabel: string
  projectName?: string
  threadTitle?: string
  assetName?: string
  actor?: string
  createdAt: string
  read: boolean
  severity: NotificationSeverity
  actionState: NotificationActionState
  statusLabel?: string
  primaryActionLabel?: string
  target: NotificationTarget
}

export type NotificationFilter =
  | 'all'
  | 'actionRequired'
  | 'approval'
  | 'agent'
  | 'asset'
  | 'system'

export type NotificationGroup = {
  label: '今天' | '昨天' | '更早'
  items: NotificationItem[]
}

export const notificationCenterSeedItems: NotificationItem[] = [
  {
    id: 'notification-approval-egfr-order',
    category: 'approval',
    type: 'approval_requested',
    title: 'EGFR 实验订单等待审批',
    summary: '资料包已生成，需要 Data Governance Reviewers 审批后才能提交 CRO 订单。',
    sourceLabel: 'Antibody Optimization · BM-APR-20260615-002',
    projectName: 'Antibody Optimization',
    threadTitle: 'EGFR 抗体亲和力优化',
    createdAt: '2026-06-15T10:40:00+08:00',
    read: false,
    severity: 'warning',
    actionState: 'actionRequired',
    statusLabel: '待审批',
    primaryActionLabel: '去审批',
    target: {
      surface: 'approvalCenter',
      section: 'pending',
      targetId: 'BM-APR-20260615-002',
    },
  },
  {
    id: 'notification-approval-cro-callback-failed',
    category: 'approval',
    type: 'approval_sync_failed',
    title: 'CRO 订单外部审批回调失败',
    summary: '飞书审批集成返回超时，BioMap 已保留外部流程编号，等待管理员处理。',
    sourceLabel: '飞书审批集成 · BM-APR-20260615-007',
    projectName: 'Antibody Optimization',
    createdAt: '2026-06-15T14:48:00+08:00',
    read: false,
    severity: 'danger',
    actionState: 'failed',
    statusLabel: '失败',
    primaryActionLabel: '查看审批中心',
    target: {
      surface: 'approvalCenter',
      section: 'external',
      targetId: 'BM-APR-20260615-007',
    },
  },
  {
    id: 'notification-agent-egfr-confirmation',
    category: 'agent',
    type: 'human_confirmation_requested',
    title: 'EGFR 亲和力优化等待确认',
    summary: 'Agent 已完成候选排序，正在等待你确认是否提交湿实验订单。',
    sourceLabel: 'EGFR 抗体亲和力优化 · Run Inspector',
    projectName: 'Antibody Optimization',
    threadTitle: 'EGFR 抗体亲和力优化',
    createdAt: '2026-06-15T14:20:00+08:00',
    read: false,
    severity: 'warning',
    actionState: 'actionRequired',
    statusLabel: '待确认',
    primaryActionLabel: '打开 Thread',
    target: {
      surface: 'thread',
      projectId: 'antibody-optimization',
      threadId: 'egfr-affinity',
    },
  },
  {
    id: 'notification-agent-lims-blocked',
    category: 'agent',
    type: 'tool_failed',
    title: 'LIMS 回调任务被阻塞',
    summary: '实验记录本回调缺少 plate map 字段，Agent 已暂停后续数据整理。',
    sourceLabel: 'Enzyme Discovery · LIMS Connector',
    projectName: 'Enzyme Discovery',
    createdAt: '2026-06-15T09:35:00+08:00',
    read: true,
    severity: 'info',
    actionState: 'none',
    primaryActionLabel: '打开运行信息',
    target: {
      surface: 'runInspector',
      projectId: 'enzyme-discovery',
      threadId: 'enzyme-screening-plan',
      runId: 'RUN-LIMS-20260615-002',
    },
  },
  {
    id: 'notification-asset-ai-ready-dataset',
    category: 'asset',
    type: 'dataset_ready',
    title: 'AI-Ready Dataset 已生成',
    summary: 'SEC-HPLC、BLI 和表达量结果已标准化，可用于 Oracle 微调。',
    sourceLabel: 'Data Assetization · Dataset',
    projectName: 'Data Assetization',
    assetName: 'EGFR_binding_screening_ai_ready_v1',
    createdAt: '2026-06-15T13:12:00+08:00',
    read: false,
    severity: 'success',
    actionState: 'resolved',
    statusLabel: '已完成',
    primaryActionLabel: '查看数据集',
    target: {
      surface: 'asset',
      assetSection: 'data',
      targetId: 'EGFR_binding_screening_ai_ready_v1',
    },
  },
  {
    id: 'notification-asset-egfr-graphrag',
    category: 'asset',
    type: 'knowledge_base_built',
    title: 'EGFR GraphRAG 知识库构建完成',
    summary: '12 篇文献、3 份实验记录和 2 个结构文件已完成索引。',
    sourceLabel: '知识库 · GraphRAG',
    projectName: 'Antibody Optimization',
    assetName: 'EGFR Antibody Optimization GraphRAG',
    createdAt: '2026-06-15T11:08:00+08:00',
    read: false,
    severity: 'success',
    actionState: 'resolved',
    statusLabel: '已完成',
    primaryActionLabel: '查看知识库',
    target: {
      surface: 'asset',
      assetSection: 'knowledgeBase',
      targetId: 'egfr-antibody-graphrag',
    },
  },
  {
    id: 'notification-asset-xtrimo-ddg-published',
    category: 'asset',
    type: 'model_published',
    title: 'xTrimoAbAffinity DDG 模型发布完成',
    summary: '模型已进入可调用状态，可用于单点突变亲和力变化预测。',
    sourceLabel: '模型 · xTrimo',
    assetName: 'xTrimoAbAffinity DDG',
    createdAt: '2026-06-14T18:10:00+08:00',
    read: false,
    severity: 'success',
    actionState: 'resolved',
    statusLabel: '已完成',
    primaryActionLabel: '查看模型',
    target: {
      surface: 'asset',
      assetSection: 'model',
      targetId: 'xtrimo-ab-affinity-ddg',
    },
  },
  {
    id: 'notification-system-feishu-connector-degraded',
    category: 'system',
    type: 'connector_degraded',
    title: '飞书审批连接器延迟升高',
    summary: '过去 30 分钟外部审批回调 p95 延迟超过 12 秒，建议管理员检查企业网络或回调配置。',
    sourceLabel: '系统 · External Approval Connector',
    createdAt: '2026-06-15T15:02:00+08:00',
    read: false,
    severity: 'warning',
    actionState: 'none',
    primaryActionLabel: '查看详情',
    target: {
      surface: 'admin',
      section: 'connectors',
      targetId: 'feishu-approval',
    },
  },
]

export function applyNotificationOverrides(
  notifications: NotificationItem[],
  overrides: {
    readById?: Record<string, boolean>
    resolvedById?: Record<string, boolean>
  },
): NotificationItem[] {
  return notifications.map((item) => {
    const readOverride = overrides.readById?.[item.id]
    const isResolved = Boolean(overrides.resolvedById?.[item.id])

    return {
      ...item,
      read: typeof readOverride === 'boolean' ? readOverride : item.read,
      actionState: isResolved ? 'resolved' : item.actionState,
      severity: isResolved ? 'success' : item.severity,
      statusLabel: isResolved ? '已完成' : item.statusLabel,
    }
  })
}

export function countActionRequiredNotifications(
  notifications: NotificationItem[],
) {
  return notifications.filter(isActionRequiredNotification).length
}

export function countUnreadNotifications(notifications: NotificationItem[]) {
  return notifications.filter((item) => !item.read).length
}

export function filterNotifications(
  notifications: NotificationItem[],
  filter: NotificationFilter,
) {
  const filtered =
    filter === 'all'
      ? notifications
      : filter === 'actionRequired'
        ? notifications.filter(isActionRequiredNotification)
        : notifications.filter((item) => item.category === filter)

  return sortNotificationsForTriage(filtered)
}

export function sortNotificationsForTriage(notifications: NotificationItem[]) {
  return [...notifications].sort((left, right) => {
    const priorityDelta = getActionPriority(right) - getActionPriority(left)

    if (priorityDelta !== 0) {
      return priorityDelta
    }

    const readDelta = Number(!right.read) - Number(!left.read)

    if (readDelta !== 0) {
      return readDelta
    }

    return Date.parse(right.createdAt) - Date.parse(left.createdAt)
  })
}

export function groupNotificationsByTime(
  notifications: NotificationItem[],
): NotificationGroup[] {
  if (notifications.length === 0) {
    return []
  }

  const sorted = sortNotificationsForTriage(notifications)
  const maxTime = Math.max(...sorted.map((item) => Date.parse(item.createdAt)))
  const today = getDateKey(new Date(maxTime))
  const yesterday = getDateKey(new Date(maxTime - 24 * 60 * 60 * 1000))
  const grouped: NotificationGroup[] = []

  for (const item of sorted) {
    const itemDate = getDateKey(new Date(item.createdAt))
    const label =
      itemDate === today ? '今天' : itemDate === yesterday ? '昨天' : '更早'
    const group = grouped.find((currentGroup) => currentGroup.label === label)

    if (group) {
      group.items.push(item)
    } else {
      grouped.push({ label, items: [item] })
    }
  }

  return grouped
}

export function isActionRequiredNotification(item: NotificationItem) {
  return item.actionState === 'actionRequired' || item.actionState === 'failed'
}

const shanghaiDateKeyFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Shanghai',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

function getActionPriority(item: NotificationItem) {
  if (item.actionState === 'actionRequired') {
    return 3
  }

  if (item.actionState === 'failed') {
    return 2
  }

  return 0
}

function getDateKey(date: Date) {
  const parts = shanghaiDateKeyFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '00'
  const day = parts.find((part) => part.type === 'day')?.value ?? '00'

  return `${year}-${month}-${day}`
}
