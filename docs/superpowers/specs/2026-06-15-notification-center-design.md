# Notification Center Design

## Goal

Add a first-version **Notification Center / 通知中心** for BioMap Agent.

The Notification Center is a cross-module event inbox for actionable platform events. It should let users quickly understand what needs attention, jump to the right surface, and keep lightweight read / resolved state in the frontend Demo.

The first implementation remains a frontend-only Demo. It should clarify the product model and UI behavior without introducing a real notification backend.

## Product Boundary

Follow the Approval Center boundary defined in [Approval Center Design](/Users/songxuzhengjun/Documents/BioMapAgent/docs/superpowers/specs/2026-06-15-approval-center-design.md):

- **Notification Center / 通知中心** is a cross-module notification surface.
- **Approval Center / 审批中心** remains the source of truth for Approval Requests, queues, Approval Rules, Approval Records, external connector state, and audit logs.
- **Run Inspector / 运行信息窗** remains the Thread-level surface for run progress, tools, approvals, and execution details.
- Notification items deep-link to the related surface. They do not own the target object's lifecycle.

User-facing Chinese should use:

- `通知中心` for the notification surface.
- `待处理` for the cross-module action-required state.
- `待审批` only for formal Approval Requests.
- `待确认` for lightweight Human Confirmation or Agent checkpoints.
- `已读` / `未读` for read state.

Avoid treating the top-right bell as an approval-only shortcut. Approval is one notification category.

## Scope

Included in the first design:

- Connect the top-right bell icon to a right-side Notification Center drawer.
- Connect the user dropdown item `通知中心` to the same drawer.
- Keep the current top-level navigation unchanged. Do not add a `通知中心` top nav tab.
- Define notification categories, list layout, filters, state semantics, mock data, and Zustand persistence.
- Define how notification items deep-link or visually simulate navigation to existing Demo surfaces.
- Define how notification count should appear on the bell.

Not included:

- Real notification backend.
- Real push delivery or websocket subscription.
- Real permission enforcement.
- Real external enterprise notification delivery.
- Full notification archive page.
- Email, WeCom, Feishu, or SMS notification channels.
- Editing approval decisions from the Notification Center.

## Entry Points

Notification Center has two entry points:

```text
TopNav
  Bell icon with red badge

User dropdown
  通知中心
  审批中心
  管理后台
```

Rules:

- Clicking the bell opens the Notification Center drawer.
- Clicking `通知中心` in the account dropdown opens the same drawer.
- The drawer opens over the current page and does not change the active top nav.
- Closing the drawer returns the user to the exact previous workspace state.
- The bell red badge shows **action-required count**, not total unread count.

## Bell Badge Semantics

The bell badge number represents notifications whose `actionState` requires attention.

Included in the badge:

- Pending formal approval.
- Pending human confirmation.
- Unresolved failed Agent run or blocked tool call.
- Failed external approval connector callback.
- Failed asset build or sync job.

Excluded from the badge:

- Informational completed events.
- Already resolved approval events.
- Read but still historical notifications.
- System announcements that require no action.

Read state and action-required state are separate:

- Marking a notification as read removes the unread dot.
- Marking a notification as read does not resolve the action.
- The bell badge decreases only when the notification action is resolved or dismissed as no longer actionable.

First Demo target:

```text
Bell badge: 3
Drawer header: 3 待处理 · 7 未读
```

## Surface Model

The first version uses a right-side drawer.

Recommended desktop dimensions:

- Width: `460px`.
- Max width: `min(460px, calc(100vw - 24px))`.
- Height: full app viewport below or including the top nav, depending on easiest implementation.
- Position: right aligned.
- Backdrop: subtle transparent overlay or none. Prefer no heavy dimming because the drawer is a quick triage tool, not a modal workflow.

Responsive behavior:

- On narrow screens, drawer width becomes `100vw`.
- The drawer remains scrollable independently from the main app.
- The top nav stays visible when practical, but drawer content must not overflow horizontally.

The drawer should feel like a dense enterprise inbox, not a marketing card layout.

## Drawer IA

### Header

Header content:

```text
通知中心
3 待处理 · 7 未读
[全部已读] [关闭]
```

Behavior:

- `全部已读` marks all visible and hidden notifications as read.
- `全部已读` does not resolve pending actions.
- Close button only closes the drawer.

### Filters

Use compact pill tabs:

```text
全部
待处理
审批
Agent
资产
系统
```

Filter rules:

- `全部` shows every active notification.
- `待处理` shows notifications with `actionState: 'actionRequired'` or `actionState: 'failed'`.
- `审批` shows approval-related notifications.
- `Agent` shows run, Thread, tool, and human-confirmation notifications.
- `资产` shows file, dataset, knowledge base, model, and pipeline asset events.
- `系统` shows connector, permission, admin policy, and system health events.

The active filter is persisted in Zustand so refresh keeps the same view.

### List Grouping And Sorting

The list is grouped by time:

```text
今天
昨天
更早
```

Within each group, sort by:

1. `actionRequired`.
2. `failed`.
3. unread.
4. newest first.

This makes the Notification Center a triage inbox instead of a purely chronological activity stream.

### Notification Item

Each row is a compact clickable list item.

Required visible fields:

- Type icon.
- Title.
- One-line or two-line summary.
- Source line: project / thread / asset / connector.
- Time.
- Status tag when relevant.
- Unread dot when unread.
- Primary action button when actionable.

Example:

```text
[审批图标] EGFR 实验订单等待审批               待审批
Antibody Optimization · BM-APR-20260615-002 · 10:40
资料包已生成，需要 Data Governance Reviewers 审批
[去审批]
```

Status tags:

- `待处理`
- `待审批`
- `待确认`
- `失败`
- `已完成`

Use muted gray text for metadata. Do not use large cards. Keep row height compact.

## Notification Categories

### Approval

Approval notifications come from the Approval Center domain.

Supported types:

```ts
type ApprovalNotificationType =
  | 'approval_requested'
  | 'approval_approved'
  | 'approval_rejected'
  | 'approval_expired'
  | 'approval_withdraw_requested'
  | 'approval_withdrawn'
  | 'approval_sync_failed'
```

Default action mapping:

- `approval_requested`: `去审批`
- `approval_sync_failed`: `查看审批中心`
- `approval_approved`: `查看结果`
- `approval_rejected`: `查看原因`
- `approval_withdraw_requested`: `查看撤回`
- `approval_withdrawn`: `查看记录`
- `approval_expired`: `查看审批中心`

Approval decisions are not made inside Notification Center. Actions open or simulate opening Approval Center.

### Agent

Agent notifications represent execution events from Thread runs.

Types:

- `run_completed`
- `run_failed`
- `tool_failed`
- `human_confirmation_requested`
- `run_blocked`
- `run_resumed`

Default actions:

- `打开 Thread`
- `打开运行信息`
- `继续处理`

Human confirmation is not formal approval. Use `待确认`, not `待审批`.

### Asset

Asset notifications represent file, dataset, knowledge base, model, and pipeline asset events.

Types:

- `file_uploaded`
- `dataset_ready`
- `knowledge_base_built`
- `model_published`
- `pipeline_asset_ready`
- `asset_sync_failed`

Default actions:

- `查看文件`
- `查看数据集`
- `查看知识库`
- `查看模型`
- `查看资产`

### System

System notifications represent platform or connector-level events.

Types:

- `connector_degraded`
- `connector_failed`
- `permission_policy_changed`
- `admin_policy_changed`
- `system_announcement`

Default actions:

- `查看详情`
- `查看管理后台`

## Data Model

Use a generic Notification model. Approval-specific mock notifications can be adapted into this model.

```ts
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
      section?: 'overview' | 'pending' | 'initiated' | 'records' | 'rules' | 'external' | 'audit' | 'simulator'
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
```

Derived counts:

```ts
actionRequiredCount = notifications.filter(
  (item) => item.actionState === 'actionRequired' || item.actionState === 'failed',
).length

unreadCount = notifications.filter((item) => !item.read).length
```

## Zustand State

Persist these states:

```ts
type NotificationCenterState = {
  notificationDrawerOpen: boolean
  notificationFilter: 'all' | 'actionRequired' | 'approval' | 'agent' | 'asset' | 'system'
  notificationReadById: Record<string, boolean>
  notificationResolvedById: Record<string, boolean>
}
```

Rules:

- `notificationDrawerOpen` may be persisted so refresh keeps the drawer open if the user left it open.
- `notificationFilter` must be persisted.
- `notificationReadById` overrides mock seed read state.
- `notificationResolvedById` overrides mock seed action state for demo interactions.
- `reset()` must clear notification read / resolved / filter state along with other persisted Demo state.

## Mock Data

First version should include these eight notifications:

### 1. EGFR experiment order pending approval

```ts
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
}
```

### 2. External approval callback failed

```ts
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
}
```

### 3. EGFR run waiting for human confirmation

```ts
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
    threadId: 'egfr-affinity-optimization',
  },
}
```

### 4. LIMS callback blocked history

This row is an already-read diagnostic reminder. It shows that a LIMS callback had been blocked, but it is not a current action-required item and does not count in the bell badge.

```ts
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
}
```

### 5. AI-Ready Dataset generated

```ts
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
}
```

### 6. EGFR GraphRAG knowledge base built

```ts
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
}
```

### 7. xTrimo model published

```ts
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
}
```

### 8. Approval connector degraded

```ts
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
  statusLabel: undefined,
  primaryActionLabel: '查看详情',
  target: {
    surface: 'admin',
    section: 'connectors',
    targetId: 'feishu-approval',
  },
}
```

## Interaction Rules

### Open Drawer

When user clicks the bell:

- Open drawer.
- Keep current page unchanged.
- Do not mark notifications as read automatically.

When user clicks account dropdown `通知中心`:

- Close account dropdown.
- Open drawer.
- Keep current page unchanged.

### Click Notification

When user clicks a notification row:

- Mark that notification as read.
- Keep unresolved action state unchanged.
- Show the selected item visually with a subtle active background.

If the item has a primary action:

- Clicking the primary action marks the item as read.
- For Demo-only targets that are not implemented, show a lightweight status message such as `已打开相关资产视图`.
- For Approval Center targets, navigate to or simulate opening the Approval Center section.
- For Thread targets, open the related Thread if that Thread exists in the current mock workspace.

### Resolve Action

The first Demo should include a lightweight way to resolve action-required notifications without building full workflows.

Recommended behavior:

- `去审批` opens Approval Center. It does not automatically resolve.
- `打开 Thread` opens the Thread. It does not automatically resolve.
- A small secondary row action `标记已处理` may appear only for action-required rows in the drawer.
- Clicking `标记已处理` sets `notificationResolvedById[id] = true`.
- Resolved rows leave the `待处理` filter and no longer count in the bell badge.

### Empty States

Use concise empty states:

- `暂无通知`
- `暂无待处理通知`
- `暂无审批通知`
- `暂无 Agent 通知`
- `暂无资产通知`
- `暂无系统通知`

Do not use illustration-heavy empty states.

## Visual Design

Style direction:

- Match existing BioMap Agent UI: pale blue accents, restrained borders, dense enterprise layout.
- Drawer background: white.
- Row hover: very light blue or gray.
- Unread dot: small blue dot.
- Action-required status: orange.
- Failed status: red.
- Completed status: muted green or neutral.

Use icons from the existing icon system or lucide-style icons already present in the app. Do not add decorative artwork.

The drawer should not compete with Approval Center or Assets pages. It should feel like a fast control surface.

## Accessibility

- Bell button `aria-label`: `打开通知中心`.
- Drawer `role="dialog"` or `aside` with accessible label `通知中心`.
- Close button `aria-label`: `关闭通知中心`.
- Filter buttons expose active state through `aria-pressed`.
- Notification rows should be keyboard focusable.
- Escape closes the drawer.

## Acceptance Criteria

- Bell click opens Notification Center drawer.
- Account dropdown `通知中心` opens the same drawer.
- Top nav active state does not change when opening the drawer.
- Bell badge shows action-required count.
- Drawer header shows action-required count and unread count.
- Filters show correct subsets.
- Clicking a notification marks it read.
- `全部已读` marks all notifications read but does not resolve pending actions.
- `标记已处理` removes an item from action-required count.
- Notification read, resolved, filter, and open state persist through refresh.
- Existing Approval Center behavior remains unchanged.
- `reset()` clears notification demo state.

## Implementation Notes

Suggested files for a future implementation:

- `src/data/notificationCenterMockData.ts`: generic notification seed data and derived count helpers.
- `src/components/notifications/NotificationCenterDrawer.tsx`: drawer UI.
- `src/components/notifications/NotificationCenterDrawer.test.tsx`: drawer behavior tests.
- `src/components/TopNav.tsx`: wire bell click to `onNotificationCenterOpen`.
- `src/App.tsx`: own drawer visibility and account-menu entry behavior through Zustand.
- `src/store/demoStoreLogic.ts`: persisted notification drawer, filter, read, and resolved state.
- `src/App.css`: drawer, filters, rows, status tags, and responsive rules.

The future implementation should not mutate `approvalNotifications` directly. Approval mock notifications can be converted into generic `NotificationItem` records, but Notification Center should operate on its own cross-module notification model.
