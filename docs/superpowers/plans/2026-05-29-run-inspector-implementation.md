# Run Inspector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Thread-level Run Inspector side panel and compact Thread title bar described in `docs/superpowers/specs/2026-05-29-run-inspector-design.md`.

**Architecture:** Store Run Inspector content as structured mock data on `DemoThread.runInspector`, and store UI open state separately as `runInspectorByThreadId` in Zustand. `ThreadWorkspace` owns the title-bar button and layout, while a focused `RunInspector` component renders the side panel from structured data without parsing transcript text.

**Tech Stack:** Vite, React 19, TypeScript 6, Zustand persist, Vitest, CSS modules-by-convention in `src/App.css`.

---

### Task 1: Run Inspector Data And Store State

**Files:**
- Modify: `src/data/conversationTypes.ts`
- Modify: `src/data/mockData.ts`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/useDemoStore.ts`
- Test: `src/store/demoStoreLogic.test.ts`
- Test: `src/store/useDemoStore.test.ts`

- [ ] **Step 1: Write failing logic tests**

Add tests that assert:

```ts
expect(egfrThread?.runInspector?.summary).toMatchObject({
  stage: '已完成干湿闭环',
  status: 'completed',
  completedSteps: 7,
  totalSteps: 7,
  pendingCount: 0,
})
expect(egfrThread?.runInspector?.capabilityRuns).toHaveLength(11)
```

Add tests for `toggleRunInspectorSnapshot`:

```ts
const opened = toggleRunInspectorSnapshot(state, 'egfr-affinity', true)
expect(opened.runInspectorByThreadId['egfr-affinity']).toEqual({ open: true })
const closed = toggleRunInspectorSnapshot(opened, 'egfr-affinity', false)
expect(closed.runInspectorByThreadId['egfr-affinity']).toEqual({ open: false })
```

Add a delete cleanup assertion:

```ts
const deleted = deleteThreadSnapshot(opened, 'egfr-affinity')
expect(deleted.runInspectorByThreadId['egfr-affinity']).toBeUndefined()
```

- [ ] **Step 2: Verify tests fail**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts
```

Expected: FAIL because `runInspector`, `runInspectorByThreadId`, and `toggleRunInspectorSnapshot` do not exist.

- [ ] **Step 3: Add types and seed data**

Add `RunInspectorData` and related item types to `src/data/conversationTypes.ts`.

Add `runInspector?: RunInspectorData` to the mock-data `Thread` type and seed EGFR with:

- summary: completed, 7 / 7, 6 outputs, 0 pending.
- progress: 7 EGFR workflow steps.
- outputs: report, order draft, experiment order, result spreadsheet, scientific figures.
- approvals: one confirmed Human Confirmation and one approved Approval Request.
- capabilityRuns: 11 entries mirroring the transcript capability replay commands.

- [ ] **Step 4: Add store state and reducers**

Add `runInspectorByThreadId: Record<string, { open: boolean }>` to `DemoStateSnapshot`.

Add `toggleRunInspectorSnapshot(state, threadId, open)` and expose `toggleRunInspector` from `useDemoStore`.

Update:

- initial state: `{}`.
- `sanitizeDemoState`: preserve valid state.
- `deleteThreadSnapshot`: remove deleted thread key.
- `mergeSeedThread`: keep current seed `runInspector`, while preserving user-editable fields.
- `partialize`: include `runInspectorByThreadId`.
- `merge`: restore `runInspectorByThreadId` or default `{}`.

- [ ] **Step 5: Verify green**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts
```

Expected: PASS.

### Task 2: Run Inspector UI And Layout

**Files:**
- Create: `src/components/RunInspector.tsx`
- Modify: `src/components/ThreadWorkspace.tsx`
- Modify: `src/components/icons.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add component-facing behavior**

Wire `runInspectorOpen` and `onRunInspectorOpenChange` from `App` to `ThreadWorkspace`.

Add a title-bar button with:

```tsx
aria-label={runInspectorOpen ? '关闭运行信息' : '打开运行信息'}
aria-expanded={runInspectorOpen}
```

The button uses a new panel-right icon and sits to the left of the existing `...` menu.

- [ ] **Step 2: Implement `RunInspector`**

Render:

- Empty state when `thread.runInspector` is missing.
- Summary.
- Progress.
- Outputs.
- Approvals.
- Capability runs, default collapsed with local `useState<Record<string, boolean>>`.

Use only UI text from structured fields except stable section labels.

- [ ] **Step 3: Adjust title bar and workspace layout**

Convert `thread-workspace` to a full-width grid:

- Header spans all columns.
- Conversation column maxes at 840-880px when side panel closed.
- Run Inspector takes 360px on wide screens.
- Composer aligns with the conversation column.
- Side panel becomes a right-side drawer on medium/narrow screens.

- [ ] **Step 4: Preserve existing dialogs and menu behavior**

Keep rename/delete dialogs and `...` menu behavior unchanged.

Update status badges to derive pending state from `thread.runInspector?.approvals`.

- [ ] **Step 5: Local visual verification**

Run:

```bash
npm run build
```

Expected: PASS.

### Task 3: Final Verification

**Files:**
- No planned source edits unless verification finds a defect.

- [ ] **Step 1: Run full checks**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 2: Browser verify**

Start or restart Vite on port 5173.

Open `http://localhost:5173/` in the browser and verify:

- EGFR Thread first opens with Run Inspector closed.
- Title bar is compact, full-width, and left/right aligned.
- Clicking `运行信息` opens a right-side panel.
- Refresh preserves the EGFR Thread panel open state.
- Switching to a Thread without data shows the empty Run Inspector state when opened.
- `...` menu still opens and rename/delete dialogs still work.
- Conversation scrolling remains smooth.
