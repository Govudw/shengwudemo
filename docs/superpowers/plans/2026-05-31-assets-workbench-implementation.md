# Assets Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first interactive Assets Workbench demo from `docs/superpowers/specs/2026-05-31-assets-workbench-design.md`.

**Architecture:** Keep the app single-page and state-driven. Add Assets page state to the existing Zustand demo store, add structured mock asset data, then render `AssetsPage` when `TopNav` selects `Assets`. Do not introduce routing or backend calls.

**Tech Stack:** React 19, TypeScript, Zustand persist, Vitest, existing CSS in `src/App.css`.

---

### Task 1: Assets State And Mock Data

**Files:**
- Create: `src/data/assetsMockData.ts`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/useDemoStore.ts`
- Test: `src/store/demoStoreLogic.test.ts`
- Test: `src/store/useDemoStore.test.ts`

- [ ] **Step 1: Write failing store logic tests**

Add tests that assert:

```ts
expect(createInitialDemoState(seedProjects, now)).toMatchObject({
  activeTopNav: 'Workspace',
  assetsActiveSection: 'file',
  assetsActiveItem: 'project-files',
  assetsFileViewMode: 'list',
})
```

Also assert `selectTopNavSnapshot(state, 'Assets')` changes top nav without changing Thread selection; `setAssetsSelectionSnapshot(state, 'experiment', 'inventory')` persists a valid Assets menu; invalid persisted values sanitize back to defaults.

- [ ] **Step 2: Run red tests**

Run: `npm test src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts`

Expected: FAIL because Assets state fields and actions do not exist.

- [ ] **Step 3: Add mock data and store state**

Create `assetsMockData.ts` with structured `FileResource`, `DataAsset`, `ExperimentAsset`, and `ModelAsset` arrays. Add `activeTopNav`, `assetsActiveSection`, `assetsActiveItem`, `assetsFileViewMode`, and optional `assetsOpenFolderId` to `DemoStateSnapshot`, sanitizers, store actions, persist `partialize`, and merge validation.

- [ ] **Step 4: Run green tests**

Run: `npm test src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts`

Expected: PASS.

### Task 2: Assets Page Components

**Files:**
- Create: `src/components/assets/AssetsPage.tsx`
- Create: `src/components/assets/AssetsSidebar.tsx`
- Create: `src/components/assets/AssetsToolbar.tsx`
- Create: `src/components/assets/FileSpaceView.tsx`
- Create: `src/components/assets/DataAssetsView.tsx`
- Create: `src/components/assets/ExperimentAssetsView.tsx`
- Create: `src/components/assets/ModelAssetsView.tsx`
- Modify: `src/components/TopNav.tsx`
- Modify: `src/App.tsx`
- Test: `src/components/AssetsPage.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Test that clicking `Assets` in TopNav shows `项目文件`, left menu contains `文件 / 数据 / 实验 / 模型`, does not contain `模板`, and experiment menu shows only `需求 / 执行 / 库存 / 配置`.

- [ ] **Step 2: Run red UI tests**

Run: `npm test src/components/AssetsPage.test.tsx`

Expected: FAIL because components and navigation behavior do not exist.

- [ ] **Step 3: Implement page components**

Make `TopNav` controlled by `activeTopNav`. Render `AssetsPage` in `App` when active nav is `Assets`; otherwise keep current Workspace behavior. Use mock data and current Assets store selection to render the correct section.

- [ ] **Step 4: Run green UI tests**

Run: `npm test src/components/AssetsPage.test.tsx`

Expected: PASS.

### Task 3: Search, View Mode, Mock Menus, And Styles

**Files:**
- Modify: `src/components/assets/*.tsx`
- Modify: `src/App.css`
- Test: `src/components/AssetsPage.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Add tests for search filtering, list/grid view mode toggle, mock upload/new dropdown visibility, and persisted selection after store hydration.

- [ ] **Step 2: Run red interaction tests**

Run: `npm test src/components/AssetsPage.test.tsx src/store/useDemoStore.test.ts`

Expected: FAIL until interactions exist.

- [ ] **Step 3: Implement interactions and styling**

Add local search state in `AssetsPage`, view mode action in store, mock action menus, cards/tables for each asset category, and `App.css` styles that match the current utilitarian BioMap Agent visual language.

- [ ] **Step 4: Run green interaction tests**

Run: `npm test src/components/AssetsPage.test.tsx src/store/useDemoStore.test.ts`

Expected: PASS.

### Task 4: Final Verification

**Files:**
- All touched implementation and tests.

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit 0.

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: TypeScript and Vite build succeed.

- [ ] **Step 4: Browser verification**

Open `http://127.0.0.1:5173/` and verify Workspace still works, Assets opens, `文件 > 项目文件` is default, menu switching works, search filters, grid/list mode toggles, and no `模板` or personal asset entry appears.

## Self Review

- Covers all spec requirements: top nav, four menus, File Space distinction, no personal scope, mock data, Zustand persistence, lightweight interactions, tests.
- No placeholders.
- Uses existing app/store/test patterns without adding routing or backend dependencies.
