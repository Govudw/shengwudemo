# Notification Center Full Page Design

## Goal

Extend the first Notification Center Demo from a bell-triggered drawer into a two-layer notification system:

- **Bell drawer / 通知抽屉** remains a lightweight quick-triage surface.
- **Notification Center / 通知中心** becomes a full-screen management page with a dense table, filters, search, batch actions, and an optional detail inspector.

The first implementation is still frontend-only mock behavior. It should clarify how BioMap Agent handles notification triage at two levels: quick attention from the bell, and complete operational review from the full page.

## Product Boundary

This design builds on [Notification Center Design](/Users/songxuzhengjun/Documents/BioMapAgent/docs/superpowers/specs/2026-06-15-notification-center-design.md).

Keep these boundaries:

- The bell is not the full Notification Center. It opens only the quick drawer.
- The full Notification Center is not a top-level navigation tab.
- Approval Center remains the source of truth for approval requests, queues, approval records, rules, external connectors, and audit logs.
- Run Inspector remains the Thread-level execution detail surface.
- Assets, Projects, Capabilities, and Admin remain their own destination surfaces.
- Notification Center owns notification read / resolved / selection / filtering UI state only.

User-facing Chinese should use:

- `通知中心` for the full page.
- `通知抽屉` only in internal docs. User-facing UI can simply say `通知`.
- `待处理` for cross-module action-required notifications.
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
- Define demo behavior for row selection, read state, resolved state, and destination actions.

Not included:

- Real notification backend.
- Real event subscription.
- Real user permission enforcement.
- Notification channel settings.
- Email / WeCom / Feishu delivery preferences.
- Exporting notification logs.
- A separate audit-log product beyond the table itself.
- Editing approval decisions inside Notification Center.

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
Bell icon with action-required badge
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
- The full Notification Center page is a hidden management surface, similar to Approval Center: it is not shown as a top nav item, but it may be represented internally as `activeTopNav: 'NotificationCenter'`.
- Opening the full page should preserve current notification read / resolved state.
- Entering the full page does not automatically mark notifications as read.

## Two-Layer Surface Model

### Bell Drawer

Purpose:

- Quick attention.
- Show the latest and most urgent notifications.
- Allow immediate simple actions.
- Provide a bridge into the full page.

Drawer changes:

- Keep existing `通知中心` drawer header and counts.
- Add `查看全部` button in the header area.
- Keep existing filters: `全部`, `待处理`, `审批`, `Agent`, `资产`, `系统`.
- Keep current row density and compact interaction.
- Primary row action still closes the drawer and opens the target surface.

Drawer should not gain table controls, advanced filters, batch actions, or full-page management UI.

### Full Notification Center Page

Purpose:

- Complete operational view.
- Search and filter notifications.
- Compare notification records.
- Batch mark read or resolved.
- Inspect one notification without leaving the page.
- Jump to related product surfaces.

Layout:

```text
┌──────────────────────────────────────────────────────────────────────┐
│ 通知中心                                  [全部已读] [批量标记已处理] │
│ 3 待处理 · 7 未读 · 今日 5 · 异常 2                                  │
├──────────────────────────────────────────────────────────────────────┤
│ [全部] [待处理] [未读] [审批] [Agent] [资产] [系统]                   │
│ [搜索通知、项目、对象] [类型 v] [状态 v] [来源 v] [时间 v]            │
├──────────────────────────────────────────────────────┬───────────────┤
│ 表格                                                 │ 详情 Inspector │
│ 状态 类型 通知内容 来源 对象 时间 操作               │ selected item  │
└──────────────────────────────────────────────────────┴───────────────┘
```

The page should feel like a dense ToB management table, not a chat timeline and not a marketing page.

## Header

Header content:

```text
通知中心
3 待处理 · 7 未读 · 今日 5 · 异常 2

[全部已读] [批量标记已处理] [...]
```

Rules:

- Header height should be close to Capabilities / Assets page compact headers, not a tall hero.
- `全部已读` marks every notification read.
- `批量标记已处理` applies only to selected action-required rows.
- The `...` button is visual-only for the first implementation unless a menu already exists locally.

Metric semantics:

- `待处理`: `actionState === 'actionRequired' || actionState === 'failed'`.
- `未读`: `read === false`.
- `今日`: notifications whose created time is today in `Asia/Shanghai`.
- `异常`: notifications with `severity === 'danger'` or `actionState === 'failed'`.

## Filters

### Primary Tabs

Tabs:

```text
全部
待处理
未读
审批
Agent
资产
系统
```

Rules:

- `全部`: all notifications.
- `待处理`: action-required or failed.
- `未读`: read state is false.
- `审批`: category is approval.
- `Agent`: category is agent.
- `资产`: category is asset.
- `系统`: category is system.

The primary tab state should be shared with the drawer where possible:

- Drawer currently uses `notificationFilter`.
- Full page can reuse it for category/action filters.
- `未读` is a full-page-only filter and may be represented as `notificationTablePreset: 'unread'`.

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
状态：全部 / 待处理 / 待审批 / 待确认 / 失败 / 已完成 / 未读
来源：全部 / Project / Thread / Asset / Connector / Admin
时间：全部 / 今天 / 最近 7 天 / 最近 30 天
```

First implementation can use native `select` controls or existing compact filter controls. Do not build a complex query builder.

## Table

Use a dense table as the primary full-page view.

Columns:

```text
选择
状态
类型
通知内容
来源
对象
时间
操作
```

Column details:

- `选择`: checkbox for batch operations. Only action-required rows need to be selectable in the first implementation.
- `状态`: tag such as `待审批`, `待确认`, `失败`, `已完成`, `未读`.
- `类型`: `审批`, `Agent`, `资产`, `系统`.
- `通知内容`: title plus one-line summary.
- `来源`: project / thread / asset / connector summary.
- `对象`: related object id or asset name.
- `时间`: compact relative or absolute time.
- `操作`: primary destination action plus small secondary actions.

Row behavior:

- Clicking a row selects it and opens the detail inspector.
- Selecting a row marks it read.
- Clicking the primary action opens the target surface and leaves the full Notification Center page.
- Clicking `标记已处理` resolves the notification and removes it from `待处理` counts.
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
状态：待审批
类型：审批
来源：Antibody Optimization / EGFR 抗体亲和力优化
对象：BM-APR-20260615-002
触发人：Data Agent
时间：2026-06-15 10:40

摘要
资料包已生成，需要 Data Governance Reviewers 审批后才能提交 CRO 订单。

操作
[去审批] [标记已读] [标记已处理]
```

Rules:

- Inspector should not be a modal.
- It should not cover the table.
- It can use a fixed width around `360px`.
- On narrow viewports, inspector can stack below or open as an in-page drawer.
- It should not duplicate the Approval Center or Run Inspector. It only summarizes and links.

## Data Model

Reuse the existing `NotificationItem` model from `notificationCenterMockData.ts`.

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
  | 'approvalPending'
  | 'confirmationPending'
  | 'failed'
  | 'resolved'
  | 'unread'

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
  notificationCenterSourceFilter: NotificationCenterSourceFilter
  notificationCenterTimeFilter: NotificationCenterTimeFilter
  notificationCenterSelectedId: string | null
  notificationCenterSelectedIds: string[]
  notificationCenterDetailOpen: boolean
}
```

Persistence:

- Persist table filters, selected id, detail open state, read state, and resolved state.
- Reset through `reset()` should restore all Notification Center table state to defaults.

## Page State Defaults

Initial full-page defaults:

```ts
notificationCenterPreset: 'all'
notificationCenterSearchQuery: ''
notificationCenterStatusFilter: 'all'
notificationCenterSourceFilter: 'all'
notificationCenterTimeFilter: 'all'
notificationCenterSelectedId: null
notificationCenterSelectedIds: []
notificationCenterDetailOpen: false
```

If opened from the drawer:

- Preserve the drawer filter when it maps to a full-page preset.
- Close the drawer.
- Select no row initially.

If opened from account dropdown:

- Open full page with the last persisted full-page filters.
- Close the account dropdown.
- Do not open drawer.

## Actions

### Mark All Read

Behavior:

- Sets all notifications read.
- Does not resolve any action-required notifications.
- Bell badge does not decrease unless those notifications were already resolved.

### Batch Mark Handled

Behavior:

- Enabled when at least one selected row is action-required or failed.
- Sets selected action-required / failed notifications to resolved.
- Leaves non-action-required selected rows unchanged.
- Decreases bell badge.
- Updates table rows immediately.

### Row Primary Action

Behavior by target:

- `approvalCenter`: open Approval Center, ideally at the relevant section.
- `thread`: open the related Thread.
- `runInspector`: open Thread and Run Inspector.
- `asset`: open Assets page at the related section.
- `admin`: open Admin / Product Management Platform mock or show status if unavailable.

Primary action marks the notification read.

### Row Secondary Actions

First implementation can include:

- `标记已读`
- `标记已处理`

Do not add archive, delete, snooze, or notification preferences in this version.

## Empty States

Use concise empty states:

- `暂无通知`
- `暂无待处理通知`
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
- Drawer contains `查看全部`.
- Drawer `查看全部` opens full Notification Center page and closes the drawer.
- Account dropdown `通知中心` opens full Notification Center page.
- Full page is not shown as a top-level nav tab.
- Full page shows summary metrics.
- Full page shows primary tabs, search, structured filters, table, and detail inspector.
- Table uses the same notification mock data and read / resolved state as the drawer.
- Selecting a table row opens inspector and marks row read.
- `全部已读` marks all notifications read without resolving them.
- Batch mark handled resolves selected action-required rows.
- Bell badge decreases only when action-required rows are resolved.
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
