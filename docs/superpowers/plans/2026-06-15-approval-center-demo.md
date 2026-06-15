# Approval Center Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a frontend-only Approval Center demo that makes BioMap Agent approval governance, built-in approval flows, external approval connectors, and approval records visible from the top-right account menu.

**Architecture:** Add a focused approval mock-data module, a standalone `ApprovalCenterPage`, then integrate it into the existing top navigation/account menu and Zustand persisted state. The page should reuse the existing management console visual language in `src/App.css`, with only approval-specific layout classes where the generic styles are insufficient.

**Tech Stack:** React + TypeScript, Zustand, Vite, Vitest + Testing Library.

---

## File Structure

- Create `src/data/approvalCenterMockData.ts` for Approval Center domain types, Chinese labels, seed records, rules, flows, groups, external connectors, audit events, notifications, and pure helpers.
- Create `src/data/approvalCenterMockData.test.ts` for domain helper tests.
- Create `src/components/approval/ApprovalCenterPage.tsx` for the full management UI.
- Create `src/components/approval/ApprovalCenterPage.test.tsx` for route/section/action rendering behavior.
- Modify `src/App.tsx` to render the Approval Center and wire account menu selections.
- Modify `src/components/TopNav.tsx` and `src/components/TopNav.test.tsx` to add `通知中心 / 审批中心 / 管理后台` to the account dropdown.
- Modify `src/store/demoStoreLogic.ts`, `src/store/demoStoreLogic.test.ts`, and `src/store/useDemoStore.test.ts` to persist/sanitize `ApprovalCenter` as a non-top-tab workspace surface.
- Modify `src/App.css` for the compact approval console layout.

## Task 1: Approval Domain Mock Data

**Files:**
- Create: `src/data/approvalCenterMockData.ts`
- Create: `src/data/approvalCenterMockData.test.ts`

- [ ] **Step 1: Write failing helper tests**

```ts
import {
  approvalCenterSections,
  approvalRecords,
  getApprovalOverviewMetrics,
  getApprovalRecordsBySection,
  runApprovalSimulation,
} from './approvalCenterMockData'

describe('approvalCenterMockData', () => {
  it('keeps Approval Center IA labels in the spec order', () => {
    expect(approvalCenterSections.map((section) => section.label)).toEqual([
      '总览',
      '待处理',
      '我发起的',
      '审批记录',
      '操作规则',
      '审批流程',
      '审批人组',
      '外部审批',
      '审计日志',
      '模拟测试',
    ])
  })

  it('separates approval lifecycle status from external sync status', () => {
    expect(
      approvalRecords.find((record) => record.id === 'BM-APR-20260615-007'),
    ).toMatchObject({
      status: 'pending',
      syncStatus: 'callbackFailed',
      route: 'external',
    })
  })

  it('returns actionable pending records separately from immutable records', () => {
    expect(getApprovalRecordsBySection('pending').every((record) => record.status === 'pending')).toBe(true)
    expect(getApprovalRecordsBySection('records').some((record) => record.status === 'approved')).toBe(true)
  })

  it('computes overview metrics from seeded approval records', () => {
    expect(getApprovalOverviewMetrics()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '待处理审批' }),
        expect.objectContaining({ label: '外部同步异常' }),
      ]),
    )
  })

  it('simulates rule matching for a CRO order as an external approval route', () => {
    expect(runApprovalSimulation({ operationType: 'createCroOrder' })).toMatchObject({
      route: 'external',
      connectorName: '企业微信 CRO 审批流',
    })
  })
})
```

- [ ] **Step 2: Run tests and confirm red**

Run: `npm test -- src/data/approvalCenterMockData.test.ts`

Expected: FAIL because `approvalCenterMockData` does not exist.

- [ ] **Step 3: Implement the mock data module**

Create the module with these exported shapes:

```ts
export type ApprovalCenterSectionId =
  | 'overview'
  | 'pending'
  | 'initiated'
  | 'records'
  | 'rules'
  | 'flows'
  | 'groups'
  | 'external'
  | 'audit'
  | 'simulator'

export type ApprovalStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'withdrawn'
  | 'voided'

export type ApprovalSyncStatus =
  | 'notApplicable'
  | 'submitPending'
  | 'submitted'
  | 'submitFailed'
  | 'callbackPending'
  | 'callbackFailed'
  | 'withdrawRequested'
  | 'withdrawFailed'
  | 'synced'

export type ApprovalRoute = 'builtIn' | 'external'
export type ApprovalScope = 'organization' | 'project'
export type AuditCompleteness = 'result-level' | 'node-level' | 'complete'
```

Seed the records listed in `docs/superpowers/specs/2026-06-15-approval-center-design.md`, including `BM-APR-20260615-001` through `BM-APR-20260615-007`.

- [ ] **Step 4: Run tests and confirm green**

Run: `npm test -- src/data/approvalCenterMockData.test.ts`

Expected: PASS.

## Task 2: Approval Center Page

**Files:**
- Create: `src/components/approval/ApprovalCenterPage.tsx`
- Create: `src/components/approval/ApprovalCenterPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing UI tests**

```tsx
import { fireEvent, render, screen } from '@testing-library/react'
import ApprovalCenterPage from './ApprovalCenterPage'

describe('ApprovalCenterPage', () => {
  it('opens on the overview dashboard by default', () => {
    render(<ApprovalCenterPage onNotify={vi.fn()} />)
    expect(screen.getByRole('heading', { name: '审批中心' })).toBeInTheDocument()
    expect(screen.getByText('待处理审批')).toBeInTheDocument()
    expect(screen.getByText('近期审批记录')).toBeInTheDocument()
  })

  it('shows external approval connectors as black-box integrations', () => {
    render(<ApprovalCenterPage onNotify={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '外部审批' }))
    expect(screen.getByRole('heading', { name: '外部审批' })).toBeInTheDocument()
    expect(screen.getByText(/外部系统拥有自己的流程/)).toBeInTheDocument()
    expect(screen.getByText('企业微信 CRO 审批流')).toBeInTheDocument()
  })

  it('renders simulation output for a CRO order', () => {
    render(<ApprovalCenterPage onNotify={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: '模拟测试' }))
    expect(screen.getByText('匹配规则')).toBeInTheDocument()
    expect(screen.getByText('CRO 订单企业审批')).toBeInTheDocument()
  })

  it('notifies when approving a pending request in demo mode', () => {
    const onNotify = vi.fn()
    render(<ApprovalCenterPage onNotify={onNotify} />)
    fireEvent.click(screen.getByRole('button', { name: '待处理' }))
    fireEvent.click(screen.getAllByRole('button', { name: '通过' })[0])
    expect(onNotify).toHaveBeenCalledWith('已在 Demo 中记录审批动作')
  })
})
```

- [ ] **Step 2: Run tests and confirm red**

Run: `npm test -- src/components/approval/ApprovalCenterPage.test.tsx`

Expected: FAIL because `ApprovalCenterPage` does not exist.

- [ ] **Step 3: Implement the page**

Use a two-column management layout:

```tsx
<main className="approval-center" aria-label="审批中心">
  <aside className="approval-center__sidebar">...</aside>
  <section className="approval-center__workspace">
    <header className="approval-center__header">...</header>
    ...
  </section>
</main>
```

Render all left-menu sections from `approvalCenterSections`. Use compact metric tiles and tables. Do not add chat UI. External approval text must say external systems own their own workflow and BioMap only records submission/callback/withdraw metadata.

- [ ] **Step 4: Add compact CSS**

Add approval-specific CSS near the management styles in `src/App.css`. Keep density close to `CapabilitiesPage`: compact header, 240-280 px sidebar, table-heavy content, no nested marketing cards.

- [ ] **Step 5: Run tests and confirm green**

Run: `npm test -- src/components/approval/ApprovalCenterPage.test.tsx`

Expected: PASS.

## Task 3: Navigation And Store Integration

**Files:**
- Modify: `src/components/TopNav.tsx`
- Modify: `src/components/TopNav.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/demoStoreLogic.test.ts`
- Modify: `src/store/useDemoStore.test.ts`

- [ ] **Step 1: Write failing navigation tests**

Update `TopNav.test.tsx` so the account dropdown is expected to contain exactly these product-context entries:

```tsx
expect(screen.getByRole('menuitem', { name: '通知中心' })).toBeInTheDocument()
expect(screen.getByRole('menuitem', { name: '审批中心' })).toBeInTheDocument()
expect(screen.getByRole('menuitem', { name: '管理后台' })).toBeInTheDocument()
```

Update store tests so `ApprovalCenter` is accepted by the persisted state sanitizer.

- [ ] **Step 2: Run tests and confirm red**

Run: `npm test -- src/components/TopNav.test.tsx src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts`

Expected: FAIL because the dropdown and persisted state do not include Approval Center.

- [ ] **Step 3: Implement navigation**

Changes:

```ts
export type ActiveTopNav =
  | 'Workspace'
  | 'Projects'
  | 'Assets'
  | 'Capabilities'
  | 'ApprovalCenter'
```

Keep top nav visible items as `Workspace`, `Projects`, `Assets`, `Capabilities`. Add `notification-center`, `approval-center`, and `product-management-platform` as account menu items. In `App.tsx`, selecting `approval-center` should route to `/` without root-sync reset and set `activeTopNav` to `ApprovalCenter`.

- [ ] **Step 4: Run tests and confirm green**

Run: `npm test -- src/components/TopNav.test.tsx src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts`

Expected: PASS.

## Task 4: Full Verification

**Files:**
- Review all changed files.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Browser QA**

Start dev server on an available localhost port and verify:

- Account dropdown contains `通知中心`, `审批中心`, `管理后台`.
- Clicking `审批中心` opens the management surface.
- Left menu switches to `外部审批` and `模拟测试`.
- No `审批中心` top-level tab appears.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/superpowers/plans/2026-06-15-approval-center-demo.md src
git commit -m "feat: add approval center demo"
```

Expected: commit succeeds on branch `codex/approval-center-demo`.

## Self-Review

- Spec coverage: navigation, IA, Approval Rules, Approval Flows, Approver Groups, External Approval Connectors, Approval Records, audit logs, simulation, and notification-center context are covered.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: the plan uses `ApprovalCenterSectionId`, `ApprovalStatus`, `ApprovalSyncStatus`, `ApprovalRoute`, and `ActiveTopNav` consistently.
