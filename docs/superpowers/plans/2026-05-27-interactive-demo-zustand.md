# Interactive Demo Zustand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the BioMap Agent homepage as an interactive, persisted demo with real Thread create/select/pin/rename/archive/delete behavior.

**Architecture:** Keep `mockData.ts` as read-only seed data. Add a focused Zustand store plus pure logic helpers for Demo State mutations, then connect `App.tsx`, `Sidebar.tsx`, and `Composer.tsx` to the store. Keep temporary UI state such as search, menus, and dialogs local to components.

**Tech Stack:** React 19, TypeScript, Vite, Zustand persist middleware, Vitest for store logic tests, Chrome Use for browser verification.

---

## Files

- Modify: `package.json`, `package-lock.json`
- Create: `src/store/demoStoreLogic.ts`
- Create: `src/store/demoStoreLogic.test.ts`
- Create: `src/store/useDemoStore.ts`
- Modify: `src/data/mockData.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Composer.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/components/icons.tsx`
- Modify: `src/App.css`

## Task 1: Test Harness And Store Logic Red Tests

- [ ] Install `zustand` and `vitest`.

Run:

```bash
npm install zustand
npm install -D vitest
```

- [ ] Add `test` script to `package.json`.

Expected script:

```json
"test": "vitest run"
```

- [ ] Write failing tests in `src/store/demoStoreLogic.test.ts` for:
  - seed conversion creates `lastActivityAt`, `pinned`, `pinnedAt`, `archived`, `createdAt`
  - new draft submit creates and selects a Thread
  - selected Thread submit does not create a Thread, updates `lastActivityAt`, and moves it to the Project top
  - pin, rename, archive, delete mutate one canonical Thread visible from pinned and project entries
  - search filters pinned and project Threads consistently

- [ ] Run the tests and verify they fail because `src/store/demoStoreLogic.ts` does not exist yet.

Run:

```bash
npm test
```

Expected: FAIL with missing module or missing exported functions.

## Task 2: Implement Pure Demo State Logic

- [ ] Create `src/store/demoStoreLogic.ts` with:
  - `DemoThread`, `DemoProject`, `DemoStateSnapshot` types
  - `createInitialDemoProjects(seedProjects, now)`
  - `formatRelativeActivity(lastActivityAt, now)`
  - `submitDraftSnapshot(state, now, idFactory)`
  - `selectThreadSnapshot(state, projectId, threadId)`
  - `setSelectedProjectSnapshot(state, projectId)`
  - `togglePinnedSnapshot(state, threadId, now)`
  - `renameThreadSnapshot(state, threadId, title)`
  - `archiveThreadSnapshot(state, threadId)`
  - `deleteThreadSnapshot(state, threadId)`
  - `getPinnedThreads(projects)`
  - `getSearchView(projects, query)`

- [ ] Run tests and iterate until pure logic tests pass.

Run:

```bash
npm test
```

Expected: PASS.

## Task 3: Add Zustand Store And Reset Command

- [ ] Create `src/store/useDemoStore.ts`.

Required behavior:

```ts
persist(
  (set, get) => ({
    projects: createInitialDemoProjects(projects, Date.now()),
    selectedProjectId: projects[0].id,
    selectedThreadId: null,
    isDraftingNewThread: true,
    draft: '',
    expandedProjectIds: projects.map((project) => project.id),
    statusMessage: '',
    // actions delegate to demoStoreLogic helpers
  }),
  {
    name: 'biomap-agent-demo-store-v1',
    version: 1,
    partialize: ({ projects, selectedProjectId, selectedThreadId, isDraftingNewThread, draft, expandedProjectIds }) => ({
      projects,
      selectedProjectId,
      selectedThreadId,
      isDraftingNewThread,
      draft,
      expandedProjectIds,
    }),
  },
)
```

- [ ] Add `window.reset()` registration from `App.tsx` or a store helper, with TypeScript global declaration.

- [ ] Run tests.

Run:

```bash
npm test
```

Expected: PASS.

## Task 4: Connect App, Composer, And Use Cases

- [ ] Replace `App.tsx` local persisted state with `useDemoStore` selectors/actions.
- [ ] Keep `searchOpen`, `searchQuery`, and `projectMenuOpen` local.
- [ ] Pass Demo State `projects` to `Sidebar` and `Composer`.
- [ ] Update `Composer.tsx`:
  - accept `isDraftingNewThread`
  - use selected-thread placeholder `继续推进这个 Thread...`
  - keep `Shift+Enter` as newline
  - call store `setSelectedProject` through existing `onProjectChange`
- [ ] Update `UseCaseGrid` prompt selection path so chip/card overwrites draft and focuses composer.

- [ ] Run tests, lint, and build.

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all exit 0.

## Task 5: Sidebar Pinned Section, Menus, Dialogs

- [ ] Update `Sidebar.tsx` to render:
  - optional global `置顶` section above `项目`
  - Thread rows with title and formatted time
  - hover tools: pin shortcut and three-dot menu
  - search state with `未找到相关对话`
  - empty Project state with `暂无对话`
- [ ] Add local state for one open Thread menu at a time.
- [ ] Add local rename dialog state and delete confirmation dialog state.
- [ ] Wire menu actions:
  - share toast: `分享功能将在后续版本开放`
  - rename dialog
  - archive action
  - delete confirmation
- [ ] Ensure pinned section menu actions update the same canonical Thread as the Project row.
- [ ] Add required icons to `icons.tsx`: more, share, rename, warning, trash.
- [ ] Add CSS for pinned section, menu, modal overlay, dialog panels, destructive button, active pin.

- [ ] Run tests, lint, and build.

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all exit 0.

## Task 6: Browser Verification

- [ ] Start or reuse Vite dev server at `http://127.0.0.1:5173/`.
- [ ] Use Chrome Use to verify the interactive flows from the spec:
  - initial new conversation has no Thread highlighted
  - draft persists across refresh
  - new draft submit creates and selects Thread
  - selected Thread submit does not create a Thread
  - Project selector switches to new draft for another Project
  - pin creates `置顶` section and persists
  - pinned and Project entries select the same Thread
  - rename, archive, delete work from pinned entry
  - search filters pinned and Project lists, no match shows `未找到相关对话`
  - `reset()` clears persisted state and reloads
  - Chrome console has no errors

- [ ] Run final verification.

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all exit 0.
