# Thread URL Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add stable `/c/{routeId}` URLs for Workspace threads while preserving existing internal thread IDs. Legacy `/{routeId}` URLs remain readable for compatibility, but new navigation writes the `/c` namespace.

**Architecture:** Keep routing local to `App.tsx`, matching the existing pathname/pushState pattern. Add a runtime-required `DemoThread.routeId`, seed/fallback helpers in store logic, and a small route helper layer in `App.tsx` for direct visits and history updates.

**Tech Stack:** React 19, Zustand, TypeScript, Vitest, existing Vite app without react-router.

---

## Files

- Modify: `src/data/mockData.ts`
  - Add optional `routeId` to seed `Thread`.
  - Assign fixed 16-character lowercase alphanumeric route IDs to every seed thread.
- Modify: `src/store/demoStoreLogic.ts`
  - Add `routeId` to `DemoThread`.
  - Add route ID validation, uniqueness repair, and `findThreadByRouteId`.
  - Pass a route ID generator into initial-state creation and draft submission.
- Modify: `src/store/useDemoStore.ts`
  - Increment persist version.
  - Provide route ID generation and uniqueness during create/merge.
  - Keep persisted older threads routable after migration.
- Modify: `src/App.tsx`
  - Parse `/c/{routeId}` routes and legacy `/{routeId}` routes.
  - Select matching threads on direct visits and browser history changes.
  - Push thread URLs on sidebar/project thread open.
  - Push `/` on new conversation.
  - Preserve the configured Vite base path when reading and writing browser-visible URLs for GitHub Pages.
- Modify: `src/store/demoStoreLogic.test.ts`
  - Add store-level route ID tests.
- Modify: `src/store/useDemoStore.test.ts`
  - Add persisted migration tests for missing and duplicate `routeId`.
- Modify: `src/App.test.tsx`
  - Add direct route, sidebar click, new conversation, history, missing thread, and product route regression tests.

---

### Task 1: Add Store Route ID Tests

**Files:**
- Modify: `src/store/demoStoreLogic.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that assert:

```ts
it('hydrates seed threads with valid unique route ids', () => {
  const state = createInitialDemoState(seedProjects, now, createRouteId)
  const routeIds = state.projects.flatMap((project) =>
    project.threads.map((thread) => thread.routeId),
  )

  expect(routeIds.every((routeId) => /^[a-z0-9]{16}$/.test(routeId))).toBe(true)
  expect(new Set(routeIds).size).toBe(routeIds.length)
})

it('finds threads by route id', () => {
  const state = createInitialDemoState(seedProjects, now, createRouteId)
  const thread = state.projects[0].threads[0]

  expect(findThreadByRouteId(state.projects, thread.routeId)?.thread.id).toBe(
    thread.id,
  )
})

it('creates new threads with generated route ids', () => {
  const state = submitDraftSnapshot(
    { ...createInitialDemoState(seedProjects, now, createRouteId), draft: 'hello' },
    now + 1,
    createThreadId,
    createRouteId,
  )

  const createdThread = state.projects
    .find((project) => project.id === state.selectedProjectId)
    ?.threads.find((thread) => thread.id === state.selectedThreadId)

  expect(createdThread?.routeId).toMatch(/^[a-z0-9]{16}$/)
})
```

- [ ] **Step 2: Run focused test and verify RED**

Run:

```bash
npx vitest run src/store/demoStoreLogic.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: FAIL because `routeId`, `createInitialDemoState` generator argument, and `findThreadByRouteId` do not exist yet.

---

### Task 2: Implement Runtime Route IDs

**Files:**
- Modify: `src/data/mockData.ts`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/useDemoStore.ts`

- [ ] **Step 1: Add data fields and helpers**

Implement:

```ts
export const threadRouteIdPattern = /^[a-z0-9]{16}$/

export function isThreadRouteId(value: string): boolean {
  return threadRouteIdPattern.test(value)
}

export function collectThreadRouteIds(projects: DemoProject[]): Set<string> {
  return new Set(
    projects.flatMap((project) => project.threads.map((thread) => thread.routeId)),
  )
}

export function findThreadByRouteId(
  projects: DemoProject[],
  routeId: string,
): (ThreadEntry & { project: DemoProject }) | undefined {
  for (const project of projects) {
    const thread = project.threads.find(
      (currentThread) =>
        currentThread.routeId === routeId && !currentThread.archived,
    )

    if (thread) {
      return { project, projectId: project.id, projectName: project.name, thread }
    }
  }

  return undefined
}
```

Update `createInitialDemoState`, `createInitialDemoProjects`, and `submitDraftSnapshot` to accept a route ID generator. Runtime threads must always have `routeId`.

- [ ] **Step 2: Seed route IDs**

Assign fixed valid route IDs to all seed threads in `src/data/mockData.ts`. Use stable values and keep them unique.

- [ ] **Step 3: Update persistence**

In `src/store/useDemoStore.ts`:

- Increment `demoStorePersistVersion`.
- Add `createThreadRouteId(existingRouteIds?: ReadonlySet<string>)`.
- Ensure `mergeProjectsWithCurrentSeed`, `mergeSeedThread`, and persisted custom threads always return valid unique route IDs.
- Ensure `isDemoThreadLike` accepts older persisted threads without `routeId` so migration can repair them.

- [ ] **Step 4: Run focused store tests and verify GREEN**

Run:

```bash
npx vitest run src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

---

### Task 3: Add App Route Tests

**Files:**
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing route tests**

Add tests for:

```ts
it('opens a thread from a direct /c route id URL', () => {
  const thread = getThreadFixture('pipeline-build', 'lims-enzyme-synthesis-build')
  window.history.replaceState(null, '', `/c/${thread.routeId}`)

  const { container, root } = renderApp()

  expect(container.textContent).toContain('LIMS 酶合成执行编排')
  expect(container.querySelector('.workspace-main--thread')).not.toBeNull()
  root.unmount()
})

it('updates the URL when a sidebar thread is selected', () => {
  const { container, root } = renderApp()
  const thread = getThreadFixture('pipeline-build', 'lims-enzyme-synthesis-build')

  act(() => {
    getButton(container, 'LIMS 酶合成执行编排').click()
  })

  expect(window.location.pathname).toBe(`/c/${thread.routeId}`)
  root.unmount()
})

it('returns to the root URL when starting a new conversation', () => {
  const thread = getThreadFixture('pipeline-build', 'lims-enzyme-synthesis-build')
  window.history.replaceState(null, '', `/c/${thread.routeId}`)
  const { container, root } = renderApp()

  act(() => {
    getButton(container, '新对话').click()
  })

  expect(window.location.pathname).toBe('/')
  expect(container.querySelector('.workspace-main--thread')).toBeNull()
  root.unmount()
})
```

Also add tests that unknown route IDs redirect to `/` with toast and product-management routes still render the product page.

- [ ] **Step 2: Run focused App tests and verify RED**

Run:

```bash
npx vitest run src/App.test.tsx --maxWorkers=1 --no-file-parallelism
```

Expected: FAIL because `App.tsx` has not implemented thread route parsing/pushState yet.

---

### Task 4: Implement App URL Synchronization

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add path helpers**

Add local helpers:

```ts
const threadPathPattern = /^\/c\/([a-z0-9]{16})\/?$/
const legacyThreadPathPattern = /^\/([a-z0-9]{16})\/?$/

function getThreadRouteId(pathname: string) {
  return (
    threadPathPattern.exec(pathname)?.[1] ??
    legacyThreadPathPattern.exec(pathname)?.[1] ??
    null
  )
}

function getThreadPath(routeId: string) {
  return `/c/${routeId}`
}
```

The app should keep `pathname` as an internal route while converting browser-visible paths through base-aware helpers:

```ts
getInternalPathname('/shengwudemo/c/{routeId}', '/shengwudemo') // /c/{routeId}
getExternalPath('/c/{routeId}', '/shengwudemo') // /shengwudemo/c/{routeId}
```

- [ ] **Step 2: Apply path to Workspace state**

Add a route effect that:

- Ignores product-management routes.
- For `/`, starts a new thread draft if a thread is currently selected.
- For `/c/{routeId}`, selects the matching non-archived thread, switches top nav to `Workspace`, and expands its project through `selectThread`.
- For legacy `/{routeId}`, selects the matching non-archived thread through compatibility parsing.
- For unknown route IDs, navigates to `/`, starts new draft, and shows `Thread 不存在或已被删除`.

- [ ] **Step 3: Update navigation handlers**

Update:

- `handleNewThread` -> `startNewThread()` and `navigateToPath('/')`.
- `handleSelectThread` -> `selectThread(projectId, threadId)` and push selected thread route.
- `handleOpenProjectThread` -> same thread URL push plus `Workspace` nav.
- Archive/delete selected thread -> after action, route returns to `/`.
- `navigateToPath` -> writes `getExternalPath(path)` to browser history while storing the internal `path` in React state.

- [ ] **Step 4: Run App tests and verify GREEN**

Run:

```bash
npx vitest run src/App.test.tsx --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

---

### Task 5: Full Verification And Review

**Files:**
- No planned source edits unless verification finds issues.

- [ ] **Step 1: Run route/store focused tests**

```bash
npx vitest run src/App.test.tsx src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

```bash
npx vitest run --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: PASS. Existing Vite chunk-size warning is acceptable if no new build errors appear.

- [ ] **Step 5: Manual browser sanity check**

Open `http://127.0.0.1:5173/`, click a thread, confirm URL becomes `/c/{routeId}`, refresh direct URL, and click new conversation to confirm URL returns to `/`.
