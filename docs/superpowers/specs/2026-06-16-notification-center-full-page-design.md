# Notification Center Full Page Design

## Goal

Extend the first Notification Center Demo from a bell-triggered drawer into a two-layer notification system:

- **Bell drawer / 通知抽屉** remains a lightweight quick-triage surface.
- **Notification Center / 通知中心** becomes a full-page management surface with a dense table, filters, search, batch actions, and an optional detail inspector.

The first implementation is still frontend-only mock behavior. It should clarify how BioMap Agent handles notification triage at two levels: quick attention from the bell, and complete operational review from the full page. Full page means it occupies the app's main content area under the top navigation; it is not a modal and not browser fullscreen.

## Product Boundary

This design builds on [Notification Center Design](/Users/songxuzhengjun/Documents/BioMapAgent/docs/superpowers/specs/2026-06-15-notification-center-design.md).

Keep these boundaries:

- The bell is not the full Notification Center. It opens only the quick drawer.
- The full Notification Center is not a top-level navigation tab.
- Approval Center remains the source of truth for approval requests, queues, approval records, rules, external connectors, and audit logs.
- Run Inspector remains the Thread-level execution detail surface.
- Assets, Projects, Capabilities, and Admin remain their own destination surfaces.
- Notification Center owns notification read / attention / selection / filtering state only.
- Clearing a notification never approves, rejects, confirms, cancels, publishes, retries, or edits the source business object.

User-facing Chinese should use:

- `通知中心` for the full page.
- `通知抽屉` only in internal docs. User-facing drawer header should say `通知`.
- `待关注` for cross-module notifications that still need user attention.
- `清除提醒` for removing a notification from the attention queue.
- `待审批` for formal approval requests.
- `待确认` for lightweight Agent or human confirmation checkpoints.
- `已读` / `未读` for read state.

## Scope

Included:

- Keep top-right bell click behavior as a right-side drawer.
- Add `查看全部` entry inside the drawer to open the full Notification Center page.
- Change account dropdown `通知中心` behavior to open the full Notification Center page.
- Add full-page Notification Center layout with summary metrics, filter tabs, search, structured filters, dense table, and detail inspector.
- Reuse existing notification mock data and Zustand state.
- Add table-specific Zustand state for search, table filter, selected notification, and detail panel.
- Define demo behavior for row selection, read state, attention-cleared state, and destination actions.

Not included:

- Real notification backend.
- Real event subscription.
- Real user permission enforcement.
- Notification channel settings.
- Email / WeCom / Feishu delivery preferences.
- Exporting notification logs.
- A separate audit-log product beyond the table itself.
- Editing approval decisions inside Notification Center.
- Completing Agent confirmations inside Notification Center.
- Retrying connectors or external callbacks inside Notification Center.

## Navigation

Top navigation remains unchanged:

```text
Workspace
Projects
Assets
Capabilities
```

Right side remains:

```text
Bell icon with attention-required badge
zhengjun ▼
```

Account dropdown:

```text
zhengjun ▼
  通知中心
  审批中心
  管理后台
```

Rules:

- Clicking the bell opens the drawer.
- Clicking `通知中心` in the account dropdown opens the full Notification Center page.
- Clicking `查看全部` in the drawer closes the drawer and opens the full Notification Center page.
- The full Notification Center page is a hidden management surface, similar to Approval Center: it is not shown as a top nav item.
- Implementation can represent this with a dedicated internal page mode or an internal `activeTopNav: 'NotificationCenter'`, but that state must not render a top-nav tab.
- Opening the full page should preserve current notification read / cleared state.
- Entering the full page does not automatically mark notifications as read.

## Two-Layer Surface Model

### Bell Drawer

Purpose:

- Quick attention.
- Show the latest and most urgent notifications.
- Allow immediate simple actions.
- Provide a bridge into the full page.

Drawer changes:

- Use drawer header `通知`, not `通知中心`.
- Add `查看全部` button in the header area.
- Use compact filters: `全部`, `待关注`, `审批`, `Agent`, `资产`, `系统`.
- Keep current row density and compact interaction.
- Primary row action still closes the drawer and opens the target surface.

Drawer should not gain table controls, advanced filters, batch actions, or full-page management UI.

### Full Notification Center Page

Purpose:

- Complete operational view.
- Search and filter notifications.
- Compare notification records.
- Mark notifications read and batch clear reminders.
- Inspect one notification without leaving the page.
- Jump to related product surfaces.

Layout:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 通知中心                                  [全部已读] [批量清除提醒]   │
│ 3 待关注 · 7 未读 · 今日 5 · 异常 2                                  │
├──────────────────────────────────────────────────────────────────────┤
│ [全部] [待关注] [未读] [审批] [Agent] [资产] [系统]                   │
│ [搜索通知、项目、对象] [类型 v] [提醒状态 v] [业务状态 v] [来源 v] [时间 v] │
├──────────────────────────────────────────────────────┬───────────────┤
│ 表格                                                 │ 详情 Inspector │
│ 提醒 类型 通知内容 来源 对象 业务状态 时间 操作      │ selected item  │
└──────────────────────────────────────────────────────┴───────────────┘
```

The page should feel like a dense ToB management table, not a chat timeline and not a marketing page.

## Header

Header content:

```text
通知中心
3 待关注 · 7 未读 · 今日 5 · 异常 2

[全部已读] [批量清除提醒] [...]
```

Rules:

- Header height should be close to Capabilities / Assets page compact headers, not a tall hero.
- `全部已读` marks every notification read.
- `批量清除提醒` applies only to selected rows that are still awaiting attention.
- `批量清除提醒` does not change the source Approval Request, Agent Run, Asset, or Connector state.
- The `...` button is visual-only for the first implementation unless a menu already exists locally.

Metric semantics:

- `待关注`: notification is action-required or failed, and has not been cleared by the user.
- `未读`: `read === false`.
- `今日`: notifications whose created time is today in `Asia/Shanghai`.
- `异常`: notifications with `severity === 'danger'` or `actionState === 'failed'`.

## Filters

### Primary Tabs

Tabs:

```text
全部
待关注
未读
审批
Agent
资产
系统
```

Rules:

- `全部`: all notifications.
- `待关注`: action-required or failed notifications that have not been cleared.
- `未读`: read state is false.
- `审批`: category is approval.
- `Agent`: category is agent.
- `资产`: category is asset.
- `系统`: category is system.

The drawer filter and full-page preset should be separate state:

- Drawer keeps using compact `notificationFilter`.
- Full page uses `notificationCenterPreset`.
- Opening the full page from `查看全部` maps the current drawer filter once into `notificationCenterPreset`.
- After the page opens, changing full-page filters should not mutate the drawer filter.
- `未读` is a full-page-only preset.
- Existing internal values such as `actionRequired` may remain in code, but UI copy should say `待关注` to avoid implying that Notification Center performs the business action.

### Search

Search placeholder:

```text
搜索通知、项目、对象
```

Search should match:

- `title`
- `summary`
- `sourceLabel`
- `projectName`
- `threadTitle`
- `assetName`
- `targetId` if available

Search is case-insensitive for English and direct substring for Chinese.

### Structured Filters

Controls:

```text
类型：全部 / 审批 / Agent / 资产 / 系统
提醒状态：全部 / 待关注 / 已清除 / 未读 / 已读
业务状态：全部 / 待审批 / 待确认 / 失败 / 已完成
来源：全部 / Project / Thread / Asset / Connector / Admin
时间：全部 / 今天 / 最近 7 天 / 最近 30 天
```

First implementation can use native `select` controls or existing compact filter controls. Do not build a complex query builder.

`提醒状态` is owned by Notification Center. `业务状态` is read-only context copied from the source object.

If collaboration notifications are added later, they should appear in `全部`, search, and structured `类型` filtering. Do not add a primary `协作` tab in the first implementation unless mock data volume makes it necessary.

## Table

Use a dense table as the primary full-page view.

Columns:

```text
选择
提醒
类型
通知内容
来源
对象
业务状态
时间
操作
```

Column details:

- `选择`: checkbox for batch operations. Only rows awaiting attention need to be selectable in the first implementation.
- `提醒`: notification-level tags such as `未读`, `待关注`, `已清除`.
- `类型`: `审批`, `Agent`, `资产`, `系统`.
- `通知内容`: title plus one-line summary.
- `来源`: project / thread / asset / connector summary.
- `对象`: related object id or asset name.
- `业务状态`: read-only source status such as `待审批`, `待确认`, `同步失败`, `已完成`.
- `时间`: compact relative or absolute time.
- `操作`: primary destination action plus small secondary actions.

Row behavior:

- Clicking a row selects it and opens the detail inspector.
- Selecting a row marks it read.
- Clicking the primary action opens the target surface and leaves the full Notification Center page.
- Primary action marks the notification read, but does not clear the reminder.
- Clicking `清除提醒` marks the notification read, clears it from `待关注`, and leaves the source business status unchanged.
- Clicking checkbox does not mark read by itself.

Unread visual:

- Use a small blue dot or subtle pale-blue row background.
- Do not use large cards.

Table density:

- Row height around `56-68px`.
- Title and summary should fit within two lines total.
- Sticky table header if the table scrolls.
- Keep horizontal overflow under control at 1280px width.

## Detail Inspector

The full page includes a right-side detail panel.

Default:

- Closed or empty when no row is selected.
- When a row is selected, open a right-side inspector within the page.

Inspector content:

```text
通知详情

EGFR 实验订单等待审批
提醒：待关注
业务状态：待审批
类型：审批
来源：Antibody Optimization / EGFR 抗体亲和力优化
对象：BM-APR-20260615-002
触发人：Data Agent
时间：2026-06-15 10:40

摘要
资料包已生成，需要 Data Governance Reviewers 审批后才能提交 CRO 订单。

操作
[去审批] [标记已读] [清除提醒]
```

Rules:

- Inspector should not be a modal.
- It should not cover the table.
- It can use a fixed width around `360px`.
- On narrow viewports, inspector can stack below or open as an in-page drawer.
- It should not duplicate the Approval Center or Run Inspector. It only summarizes and links.
- Any source action must happen through the primary destination action, not inside the inspector.

## Data Model

Reuse the existing `NotificationItem` model from `notificationCenterMockData.ts`.

Recommended derivations:

```ts
type NotificationAttentionState = 'normal' | 'attentionRequired' | 'cleared'

const needsAttention =
  (notification.actionState === 'actionRequired' ||
    notification.actionState === 'failed') &&
  !notificationClearedById[notification.id]
```

`NotificationItem.statusLabel` should be treated as read-only source/business status. It should not be used to represent whether a notification has been cleared.

Add table UI state:

```ts
type NotificationCenterPreset =
  | 'all'
  | 'actionRequired'
  | 'unread'
  | 'approval'
  | 'agent'
  | 'asset'
  | 'system'

type NotificationCenterStatusFilter =
  | 'all'
  | 'actionRequired'
  | 'cleared'
  | 'read'
  | 'unread'

type NotificationCenterBusinessStatusFilter =
  | 'all'
  | 'approvalPending'
  | 'confirmationPending'
  | 'failed'
  | 'completed'

type NotificationCenterSourceFilter =
  | 'all'
  | 'project'
  | 'thread'
  | 'asset'
  | 'connector'
  | 'admin'

type NotificationCenterTimeFilter =
  | 'all'
  | 'today'
  | 'last7Days'
  | 'last30Days'

type NotificationCenterTableState = {
  notificationCenterPreset: NotificationCenterPreset
  notificationCenterSearchQuery: string
  notificationCenterStatusFilter: NotificationCenterStatusFilter
  notificationCenterBusinessStatusFilter: NotificationCenterBusinessStatusFilter
  notificationCenterSourceFilter: NotificationCenterSourceFilter
  notificationCenterTimeFilter: NotificationCenterTimeFilter
  notificationCenterSelectedId: string | null
  notificationCenterSelectedIds: string[]
  notificationCenterDetailOpen: boolean
}
```

Persistence:

- Persist table filters, selected id, detail open state, read state, and cleared notification state.
- Reset through `reset()` should restore all Notification Center table state to defaults.

Recommended naming:

- Keep existing `notificationReadById`.
- Rename or wrap existing `notificationResolvedById` as `notificationClearedById` for this feature.
- If the first implementation keeps the old store key for migration simplicity, UI and docs must still use `清除提醒` / `cleared`, not `resolved` / `已处理`.

## Page State Defaults

Initial full-page defaults:

```ts
notificationCenterPreset: 'all'
notificationCenterSearchQuery: ''
notificationCenterStatusFilter: 'all'
notificationCenterBusinessStatusFilter: 'all'
notificationCenterSourceFilter: 'all'
notificationCenterTimeFilter: 'all'
notificationCenterSelectedId: null
notificationCenterSelectedIds: []
notificationCenterDetailOpen: false
```

If opened from the drawer:

- Map the current drawer filter into the full-page preset once.
- Close the drawer.
- Select no row initially.

If opened from account dropdown:

- Open full page with the last persisted full-page filters.
- Close the account dropdown.
- Do not open drawer.

Selection recovery:

- If a persisted `notificationCenterSelectedId` no longer exists in mock data, clear the selected id and close the detail inspector.
- If a selected notification is removed from the current filtered table, keep the inspector open only if the notification still exists globally; otherwise clear it.

## Actions

### Mark All Read

Behavior:

- Sets all notifications read.
- Does not clear any notification reminders.
- Bell badge does not decrease unless those notifications were already cleared.

### Batch Clear Reminders

Behavior:

- Enabled when at least one selected row is action-required or failed.
- Sets selected action-required / failed notifications to cleared and read.
- Leaves non-action-required selected rows unchanged unless the UI explicitly allows selecting them later.
- Decreases bell badge.
- Updates table rows immediately.
- Clears the batch selection after applying.
- Does not mutate Approval Request state, Agent confirmation state, Asset state, or Connector state.

### Row Primary Action

Behavior by target:

- `approvalCenter`: open Approval Center, ideally at the relevant section.
- `thread`: open the related Thread.
- `runInspector`: open Thread and Run Inspector.
- `asset`: open Assets page at the related section.
- `admin`: open Admin / Product Management Platform mock or show status if unavailable.

Primary action marks the notification read.
Primary action does not clear reminders. A pending approval notification should remain `待关注` until the source state changes or the user explicitly clicks `清除提醒`.

### Row Secondary Actions

First implementation can include:

- `标记已读`
- `清除提醒`

Do not add archive, delete, snooze, or notification preferences in this version.

## Empty States

Use concise empty states:

- `暂无通知`
- `暂无待关注通知`
- `暂无未读通知`
- `没有匹配的通知`

If search has no results:

```text
没有匹配的通知
调整关键词或筛选条件
```

## Visual Design

Direction:

- Enterprise console.
- Dense but readable.
- Similar information density to Assets and Capabilities pages.
- Avoid cards for rows. Use table rows.
- Avoid decorative illustration.

Color:

- Keep current BioMap palette.
- Pending: orange.
- Failed: red.
- Completed: green or neutral.
- Unread: small blue dot / pale row background.

Spacing:

- Header compact.
- Filters close to table.
- Table should occupy most vertical space.
- Detail inspector should be visually lighter than the table.

Responsive behavior:

- At desktop width, show table + inspector side by side.
- At medium width, table remains primary and inspector can overlay within content.
- At mobile width, hide less critical columns or stack row metadata.

## Accessibility

- Full page main element should use `aria-label="通知中心"`.
- Tabs should expose selected state.
- Table should use semantic `table`, `thead`, `tbody`, `th`, and `td`.
- Row action buttons must be real buttons.
- Avoid nested interactive controls.
- Checkbox labels should reference notification titles.
- Detail inspector should have a heading and be reachable after row selection.

## Acceptance Criteria

- Bell click still opens the right-side drawer, not the full page.
- Drawer header says `通知`, not `通知中心`.
- Drawer contains `查看全部`.
- Drawer `查看全部` opens full Notification Center page and closes the drawer.
- Account dropdown `通知中心` opens full Notification Center page.
- Full page is not shown as a top-level nav tab.
- Full page shows summary metrics.
- Full page shows primary tabs, search, structured filters, table, and detail inspector.
- Table uses the same notification mock data and read / cleared state as the drawer.
- Opening from drawer maps the drawer filter into the full-page preset once; later full-page filter changes do not mutate the drawer filter.
- Selecting a table row opens inspector and marks row read.
- `全部已读` marks all notifications read without clearing reminders.
- Batch clear reminders clears selected attention-required rows.
- Bell badge decreases only when attention-required rows are cleared.
- Clearing reminders never mutates Approval Request, Agent confirmation, Asset, or Connector state.
- Primary row actions navigate to the correct existing Demo surfaces or show a status message for unavailable targets.
- Zustand persistence preserves full-page filters and selected detail state.
- `reset()` clears full-page Notification Center state.
- Existing drawer tests and behavior remain valid.

## Suggested Implementation Files

Likely changes:

- `src/components/notifications/NotificationCenterPage.tsx`: full-page layout, table, filters, detail inspector.
- `src/components/notifications/NotificationCenterPage.test.tsx`: full-page behavior tests.
- `src/components/notifications/NotificationCenterDrawer.tsx`: add `查看全部` action.
- `src/data/notificationCenterMockData.ts`: add filtering helpers for full page if useful.
- `src/store/demoStoreLogic.ts`: add full-page table state and snapshot reducers.
- `src/store/useDemoStore.ts`: persist full-page table state.
- `src/components/TopNav.tsx`: no top-level nav item changes; keep bell opening drawer.
- `src/App.tsx`: route account dropdown and drawer `查看全部` into full-page surface.
- `src/App.css`: full-page table, inspector, filter controls, responsive styles.

Do not replace the existing drawer component with the page component. They are separate surfaces over the same notification data.
