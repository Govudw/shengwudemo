# Non-Workspace UI Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the simplified non-Workspace application surfaces defined in `docs/superpowers/specs/2026-06-17-non-workspace-ui-simplification-design.md`.

**Architecture:** Reuse the current React component structure and central `App.css`, adding only small local helpers where needed. Keep business mock data stable; move secondary information into compact filters, collapsible regions, row menus, and Inspector-style side panels. Persist only durable UI preferences in Zustand.

**Tech Stack:** Vite, React 19, TypeScript, Zustand persist, Vitest with happy-dom, CSS in `src/App.css`.

---

## Task 1: Notification Center simplification and state persistence

**Files:**
- Modify: `src/components/notifications/NotificationCenterPage.tsx`
- Modify: `src/components/notifications/NotificationCenterDrawer.tsx`
- Modify: `src/data/notificationCenterMockData.ts`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/useDemoStore.ts`
- Modify: `src/components/notifications/NotificationCenterPage.test.tsx`
- Modify: `src/components/notifications/NotificationCenterDrawer.test.tsx`
- Modify: `src/store/useDemoStore.test.ts`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing tests**

Add or update tests so they fail before implementation:

```tsx
// NotificationCenterPage.test.tsx
it('keeps advanced filters behind a single more filter button', () => {
  const { container, root } = renderPage()
  expect(container.textContent).toContain('更多筛选')
  expect(container.textContent).not.toContain('业务状态')
  expect(container.textContent).not.toContain('来源')
  act(() => getButton(container, '更多筛选').click())
  expect(container.textContent).toContain('全部业务状态')
  expect(container.textContent).toContain('全部来源')
  root.unmount()
})

it('hides batch actions until rows are selected', () => {
  const { container, root, rerender } = renderPage()
  expect(container.textContent).not.toContain('批量清除提醒')
  rerender({ selectedNotificationIds: ['notification-approval-egfr-order'] })
  expect(container.textContent).toContain('批量清除提醒')
  root.unmount()
})
```

```tsx
// NotificationCenterDrawer.test.tsx
it('uses compact drawer rows without long object ids', () => {
  const { container, root } = renderDrawer()
  expect(container.textContent).toContain('查看全部')
  expect(container.textContent).not.toContain('BM-APR-20260615')
  root.unmount()
})
```

```ts
// useDemoStore.test.ts
it('does not persist notification center batch selection', async () => {
  // Seed persisted state with selected ids, then import store.
  // Expect notificationCenterSelectedIds to hydrate as [] while detail open state can persist.
})
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test -- src/components/notifications/NotificationCenterPage.test.tsx src/components/notifications/NotificationCenterDrawer.test.tsx src/store/useDemoStore.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: fails because `更多筛选` is absent, batch actions are always visible, or selection still persists.

- [ ] **Step 3: Implement notification simplification**

Implementation requirements:

- Full page header is one compact row: title on the left, summary metrics on the right.
- Default filter area shows preset pills, search, `提醒状态`, `时间`, and `更多筛选`.
- `业务状态`, `来源`, `类型`, `已读状态` move into a popover or compact expanded panel.
- `更多筛选` displays selected advanced filter count when non-default filters are active.
- Batch actions render only when `selectedNotificationIds.length > 0`.
- Table default columns are `选择 / 提醒 / 类型 / 通知内容 / 来源 / 时间 / 操作`; object ID and business status move to Inspector.
- Main content and Inspector each have independent scroll.
- User-visible labels use `对话`, not `Thread`.
- Drawer rows show only title, status, source, time, one primary action, and optional clear action.
- Persist detail open/filter state, but do not persist batch selection.

- [ ] **Step 4: Run focused tests and fix**

Run the same focused command from Step 2. Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/notifications/NotificationCenterPage.tsx src/components/notifications/NotificationCenterDrawer.tsx src/data/notificationCenterMockData.ts src/store/demoStoreLogic.ts src/store/useDemoStore.ts src/components/notifications/NotificationCenterPage.test.tsx src/components/notifications/NotificationCenterDrawer.test.tsx src/store/useDemoStore.test.ts src/App.css
git commit -m "feat: simplify notification center UI"
```

## Task 2: Capabilities simplification

**Files:**
- Modify: `src/components/CapabilitiesPage.tsx`
- Modify: `src/components/CapabilitiesPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing tests**

Add tests for:

```tsx
it('keeps advanced capability filters collapsed by default', () => {
  const { container, root } = renderCapabilitiesPage()
  expect(container.textContent).toContain('更多筛选')
  expect(container.textContent).not.toContain('全部版本')
  act(() => getButtonContaining(container, '更多筛选').click())
  expect(container.textContent).toContain('全部版本')
  root.unmount()
})

it('collapses pipeline dag details by default', () => {
  const { container, root } = renderCapabilitiesPage()
  expect(container.textContent).toContain('执行 DAG')
  expect(container.querySelector('.capabilities-dag-canvas--preview')).toBeNull()
  act(() => getButtonContaining(container, '展开').click())
  expect(container.querySelector('.capabilities-dag-canvas--preview')).not.toBeNull()
  root.unmount()
})
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/components/CapabilitiesPage.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 3: Implement capability UI**

Implementation requirements:

- Keep `TypeNav + MainList + optional Inspector`.
- Default toolbar shows search, source, status, `更多筛选`; lower-priority filters live in compact advanced panel.
- Pipeline list remains the main surface; Inspector should not auto-open from stale missing selection.
- Pipeline DAG preview is collapsed by default, rendered as `执行 DAG  7 步 · 1 个审批点 · 最近运行 14 次  [展开] [最大化]`.
- Canvas renders only after `展开`.
- Skill / MCP Server / Plugin list density remains aligned with Pipeline list. No user-visible `Provider`.

- [ ] **Step 4: Run focused tests and fix**

```bash
npm test -- src/components/CapabilitiesPage.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 5: Commit**

```bash
git add src/components/CapabilitiesPage.tsx src/components/CapabilitiesPage.test.tsx src/App.css
git commit -m "feat: simplify capabilities workspace"
```

## Task 3: Assets and Projects simplification

**Files:**
- Modify: `src/components/assets/AssetsPage.tsx`
- Modify: `src/components/projects/ProjectsPage.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing tests**

Add or update App-level tests for:

```tsx
it('keeps xTrimo recommendations collapsed by default', () => {
  // Navigate to Assets > xTrimo.
  // Expect "推荐用于当前项目" and "展开" visible, but recommendation cards absent.
})

it('shows project management as compact list plus details affordance', () => {
  // Navigate to Projects.
  // Expect table headers: 项目, 状态, 负责人, 最近活动, 更多.
  // Expect removed headers such as 读权限, 写权限, 资产 absent in default table.
})
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/App.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 3: Implement Assets**

Implementation requirements:

- Assets header remains one compact title + actions row.
- File, Knowledge, Data, Experiment, Model pages show search + two core filters + `更多筛选`.
- xTrimo removes summary stat strip, keeps image cards but reduces badge noise, and collapses recommendation region by default.
- Knowledge detail remains reachable but compact; long source file/version detail stays off the list.
- Experiment card/table keeps only name, type, status, key object, updated time; equipment stays `设备`, recipe stays `配方`.

- [ ] **Step 4: Implement Projects**

Implementation requirements:

- Projects default table columns: `项目 / 状态 / 负责人 / 最近活动 / 更多`.
- Tags, read/write permissions, thread count, asset counts, members and full activity move to detail page/Inspector or menu path.
- Toolbar uses search, status,负责人, `更多筛选`; tag and activity range move behind advanced filter.
- Do not change Workspace left sidebar or Thread conversation UI.

- [ ] **Step 5: Run focused tests and fix**

```bash
npm test -- src/App.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 6: Commit**

```bash
git add src/components/assets/AssetsPage.tsx src/components/projects/ProjectsPage.tsx src/App.test.tsx src/App.css
git commit -m "feat: simplify assets and projects pages"
```

## Task 4: Approval Center simplification

**Files:**
- Modify: `src/components/approval/ApprovalCenterPage.tsx`
- Modify: `src/components/approval/ApprovalCenterPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing tests**

Add tests for:

```tsx
it('groups approval navigation into workbench records configuration and integrations', () => {
  const { root } = renderApprovalCenterPage()
  expect(getText('审批工作台')).not.toBeNull()
  expect(getText('记录')).not.toBeNull()
  expect(getText('配置')).not.toBeNull()
  expect(getText('集成')).not.toBeNull()
  root.unmount()
})

it('keeps external connector endpoints behind detail disclosure', () => {
  const { root } = renderApprovalCenterPage()
  act(() => getButton('外部审批').click())
  expect(getText('已配置 3 个端点')).not.toBeNull()
  expect(getText('提交端点')).toBeNull()
  act(() => getButton('查看详情').click())
  expect(getText('提交端点')).not.toBeNull()
  root.unmount()
})
```

- [ ] **Step 2: Run tests and verify RED**

```bash
npm test -- src/components/approval/ApprovalCenterPage.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 3: Implement Approval Center**

Implementation requirements:

- Left menu grouped into `审批工作台`, `记录`, `配置`, `集成`.
- Default approval tables use compact columns: title, type, status, node/result, updated time, more.
- External connector list shows `已配置 3 个端点`; full submit/callback/withdraw endpoints appear only in Inspector/detail disclosure.
- Preserve black-box external approval wording. Withdraw is a notification to external system, not a BioMap internal Approval Flow.

- [ ] **Step 4: Run focused tests and fix**

```bash
npm test -- src/components/approval/ApprovalCenterPage.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 5: Commit**

```bash
git add src/components/approval/ApprovalCenterPage.tsx src/components/approval/ApprovalCenterPage.test.tsx src/App.css
git commit -m "feat: simplify approval center"
```

## Task 5: Integration verification and visual polish

**Files:**
- Modify only files needed to fix integration or visual issues discovered by verification.

- [ ] **Step 1: Run full checks**

```bash
npm test
npm run lint
npm run build
```

- [ ] **Step 2: Chrome visual verification**

Start Vite and inspect at the current desktop viewport:

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Open:

- `http://127.0.0.1:5173/`
- Projects
- Assets > xTrimo
- Assets > 知识库
- Assets > 实验
- Capabilities > Pipeline
- Approval Center
- Bell drawer
- Notification Center

Verify:

- No main-page horizontal overflow at the current desktop viewport.
- Main scroll works on Notification Center and other long pages.
- Filter bars are compact.
- Inspector/detail regions do not swallow the page scroll.
- User-visible UI does not show `打开 Thread`, `Provider`, `healthy`, `warning`, or `disabled`.

- [ ] **Step 3: Fix issues and rerun checks**

If any visual or test issue appears, add focused fixes and rerun the relevant test plus `npm run build`.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "polish non-workspace simplified UI"
```
