# Knowledge Base Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first-class 知识库 asset category below 文件 in the Assets workspace, with list and detail views for RAG, 知识图谱, and GraphRAG knowledge base assets.

**Architecture:** Extend the existing Assets store/menu model with a `knowledge` section and knowledge-base item ids. Keep mock domain data in `src/data/assetsMockData.ts`, render the list/detail inside `src/components/assets/AssetsPage.tsx`, and reuse existing Assets table/header styles with focused CSS additions in `src/App.css`.

**Tech Stack:** Vite, React, TypeScript, Zustand, Vitest, Testing Library, existing project CSS.

---

## File Structure

- Modify `src/store/demoStoreLogic.ts`: add `knowledge` section, knowledge menu ids, validation, and default item mapping.
- Modify `src/store/demoStoreLogic.test.ts`: cover knowledge menu validation and default selection behavior.
- Modify `src/store/useDemoStore.test.ts`: cover persisted legacy compatibility when active section/item is knowledge.
- Modify `src/data/assetsMockData.ts`: add knowledge-base types, menu section, mock records, source files, version history, and helper lookup functions.
- Modify `src/components/assets/AssetsPage.tsx`: add knowledge list/detail rendering, filters, row click, back navigation, and tab state.
- Modify `src/App.css`: add compact knowledge list/detail styles.
- Modify `src/App.test.tsx`: cover sidebar navigation, list rendering, detail tabs, and back behavior.

## Task 1: Store And Mock Data

**Files:**
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/demoStoreLogic.test.ts`
- Modify: `src/store/useDemoStore.test.ts`
- Modify: `src/data/assetsMockData.ts`

- [ ] **Step 1: Write failing store tests**

Add tests proving:

```ts
expect(setAssetsSelectionSnapshot(state, 'knowledge', 'all-knowledge')).toMatchObject({
  assetsActiveSection: 'knowledge',
  assetsActiveItem: 'all-knowledge',
})

expect(setAssetsSelectionSnapshot(state, 'knowledge', 'rag')).toMatchObject({
  assetsActiveSection: 'knowledge',
  assetsActiveItem: 'rag',
})
```

Also add a legacy invalid-pair test:

```ts
const migrated = sanitizePersistedDemoState({
  ...state,
  assetsActiveSection: 'knowledge',
  assetsActiveItem: 'project-files',
})

expect(migrated.assetsActiveSection).toBe('knowledge')
expect(migrated.assetsActiveItem).toBe('all-knowledge')
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts
```

Expected: fails because `knowledge` and knowledge item ids are not in the store unions/validators.

- [ ] **Step 3: Implement store types and validation**

Add:

```ts
export type AssetsSection = 'file' | 'knowledge' | 'data' | 'experiment' | 'model'

export type KnowledgeAssetItemId =
  | 'all-knowledge'
  | 'rag'
  | 'knowledge-graph'
  | 'graph-rag'

export type AssetMenuItemId =
  | FileAssetItemId
  | KnowledgeAssetItemId
  | DataAssetItemId
  | ExperimentAssetItemId
  | ModelAssetItemId
```

Update:

```ts
const assetsSections = ['file', 'knowledge', 'data', 'experiment', 'model'] as const

const assetMenuItemsBySection = {
  file: ['public-files', 'project-files', 'recent-uploads', 'archived-files'],
  knowledge: ['all-knowledge', 'rag', 'knowledge-graph', 'graph-rag'],
  data: ['datasets', 'tables', 'analysis-results', 'catalog'],
  experiment: ['experiment-list', 'execution', 'inventory', 'equipment', 'recipe'],
  model: ['xtrimo', 'public-models', 'project-models', 'oracles'],
} as const satisfies Record<AssetsSection, readonly AssetMenuItemId[]>
```

Default knowledge item must be `all-knowledge`.

- [ ] **Step 4: Implement mock data**

In `src/data/assetsMockData.ts`, import `KnowledgeAssetItemId`, then add:

```ts
export type KnowledgeBaseKind = 'rag' | 'knowledgeGraph' | 'graphRag'
export type KnowledgeBaseStatus = '已构建' | '构建中' | '需重建' | '失败'

export type KnowledgeBaseSourceFile = {
  id: string
  name: string
  kind: string
  sourceSpace: string
  contribution: string
  syncedAt: string
  status: string
}

export type KnowledgeBaseVersion = {
  version: string
  builtAt: string
  summary: string
  fileDelta: string
  entityDelta?: string
  status: KnowledgeBaseStatus
}

export type KnowledgeBaseRecord = {
  id: string
  name: string
  category: KnowledgeAssetItemId
  kind: KnowledgeBaseKind
  scope: AssetScope
  projectName?: string
  owner: string
  status: KnowledgeBaseStatus
  version: string
  fileCount: number
  entityCount?: number
  relationCount?: number
  chunkCount?: number
  updatedAt: string
  lastBuildAt: string
  description: string
  overview: string[]
  entitySummary: { label: string; value: string }[]
  relationshipSummary: string[]
  sourceFiles: KnowledgeBaseSourceFile[]
  versions: KnowledgeBaseVersion[]
}
```

Add menu section immediately after 文件:

```ts
{
  id: 'knowledge',
  label: '知识库',
  description: 'RAG、知识图谱与 GraphRAG 知识资产',
  items: [
    { id: 'all-knowledge', label: '全部知识库' },
    { id: 'rag', label: 'RAG' },
    { id: 'knowledge-graph', label: '知识图谱' },
    { id: 'graph-rag', label: 'GraphRAG' },
  ],
}
```

Add at least six biological records matching the spec, including `EGFR 抗体亲和力优化知识库`.

- [ ] **Step 5: Run store tests and all tests**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/store/demoStoreLogic.ts src/store/demoStoreLogic.test.ts src/store/useDemoStore.test.ts src/data/assetsMockData.ts
git commit -m "Add knowledge base asset data model"
```

## Task 2: Knowledge Base List And Detail UI

**Files:**
- Modify: `src/components/assets/AssetsPage.tsx`
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Add tests proving:

```ts
await user.click(screen.getByRole('button', { name: 'Assets' }))
await user.click(screen.getByRole('button', { name: '知识库' }))
expect(screen.getByRole('heading', { name: '全部知识库' })).toBeInTheDocument()
expect(screen.getByText('EGFR 抗体亲和力优化知识库')).toBeInTheDocument()
expect(screen.getByText('GraphRAG')).toBeInTheDocument()
```

Add detail test:

```ts
await user.click(screen.getByText('EGFR 抗体亲和力优化知识库'))
expect(screen.getByRole('heading', { name: 'EGFR 抗体亲和力优化知识库' })).toBeInTheDocument()
expect(screen.getByRole('tab', { name: '知识库概览' })).toHaveAttribute('aria-selected', 'true')
await user.click(screen.getByRole('tab', { name: '使用文件' }))
expect(screen.getByText('EGFR_parent_antibody_baseline.xlsx')).toBeInTheDocument()
await user.click(screen.getByRole('tab', { name: '版本记录' }))
expect(screen.getByText('v3')).toBeInTheDocument()
await user.click(screen.getByRole('button', { name: '返回知识库列表' }))
expect(screen.getByRole('heading', { name: '全部知识库' })).toBeInTheDocument()
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: fails because the knowledge section UI does not exist.

- [ ] **Step 3: Implement knowledge list routing**

In `AssetsPage.tsx`, import knowledge types/data. Add local state:

```ts
const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(null)
```

Clear it in `handleSelection`.

In `AssetContent`, route `activeItem` values `all-knowledge`, `rag`, `knowledge-graph`, `graph-rag` to a new `KnowledgeBaseAssetsView`.

- [ ] **Step 4: Implement list view**

Add `KnowledgeBaseAssetsView` with:

- list filtering by menu item, search query, scope, and status
- table columns from the spec
- clickable rows
- `AssetListHeader` title based on selected menu item
- empty state

Use labels:

```ts
const knowledgeBaseKindLabels = {
  rag: 'RAG',
  knowledgeGraph: '知识图谱',
  graphRag: 'GraphRAG',
} as const
```

- [ ] **Step 5: Implement detail view**

Add `KnowledgeBaseDetailView` with:

- back button labeled `返回知识库列表`
- summary header with metrics
- tabs using `role="tablist"`, `role="tab"`, and `aria-selected`
- overview tab with overview bullets, entity summary, relationship summary
- source files tab with dense table
- versions tab with build history table

Keep selected tab local component state.

- [ ] **Step 6: Add compact styles**

Add CSS classes:

- `.knowledge-assets-table`
- `.knowledge-detail`
- `.knowledge-detail__summary`
- `.knowledge-detail__metrics`
- `.knowledge-detail__tabs`
- `.knowledge-detail__panel`
- `.knowledge-source-table`
- `.knowledge-version-table`

Use the existing Assets colors, borders, and compact spacing. Do not add hero layout or large vertical gaps.

- [ ] **Step 7: Run UI tests and all tests**

Run:

```bash
npm test -- src/App.test.tsx
npm test
```

Expected: all tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/assets/AssetsPage.tsx src/App.css src/App.test.tsx
git commit -m "Add knowledge base assets UI"
```

## Task 3: Final Verification And Polish

**Files:**
- Modify only if verification reveals issues.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass.

- [ ] **Step 2: Review diff for scope**

Run:

```bash
git diff --stat main...HEAD
git diff --name-only main...HEAD
```

Confirm the change set is limited to knowledge base assets implementation and its spec/plan.

- [ ] **Step 3: Optional browser check**

If the dev server is available, open Assets → 知识库 and verify:

- 知识库 appears below 文件.
- The table is dense and readable.
- Detail page tabs work.
- Back button returns to the list.

- [ ] **Step 4: Final commit if polish changes were needed**

If Step 1 or Step 3 required fixes:

```bash
git add <changed-files>
git commit -m "Polish knowledge base asset details"
```

Otherwise no commit is needed.

## Self-Review

- The plan covers the navigation order, menu ids, list page, detail page, tabs, mock biological content, and out-of-scope boundaries from the spec.
- The tasks are sequential because store types, mock data, and UI rendering touch shared files.
- TDD red/green steps are explicit for store and UI behavior.
- No real indexing, graph visualization, upload, or rebuild workflow is included.
