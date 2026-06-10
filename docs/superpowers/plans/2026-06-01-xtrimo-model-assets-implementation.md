# xTrimo Model Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the `Assets > 模型 > xTrimo` spec as a dense, realistic xTrimo Platform Model Asset directory with typed mock data, compact filtering UI, callability states, and tests.

**Architecture:** Keep the existing Assets workbench shell and left navigation. Add xTrimo-specific data and view code instead of stretching the generic `ModelAssetRecord` card. Keep xTrimo as public-scope Platform Model Assets; `项目模型 / 公开模型 / Oracle` continue to use the existing generic model view with expanded mock data.

**Tech Stack:** Vite, React, TypeScript, Zustand-backed app state, Vitest with happy-dom, existing CSS in `src/App.css`.

---

## Source Specs

- `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/docs/superpowers/specs/2026-06-01-xtrimo-model-assets-design.md`
- `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/docs/superpowers/specs/2026-05-31-assets-workbench-design.md`
- `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/CONTEXT.md`

## Files

- Modify: `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/src/data/assetsMockData.ts`
- Modify: `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/src/components/assets/AssetsPage.tsx`
- Modify: `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/src/App.css`
- Modify: `/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/xtrimo-model-assets/src/App.test.tsx`

## Task 1: Typed xTrimo Model Data

**Files:**
- Modify: `src/data/assetsMockData.ts`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing data tests**

Add tests under `describe('App Assets navigation', ...)` or a new `describe('xTrimo model assets', ...)` in `src/App.test.tsx`:

```ts
import {
  modelAssetRecords,
  xtrimoModelRecords,
} from './data/assetsMockData'

it('seeds realistic xTrimo model records with lifecycle and callability separated', () => {
  expect(xtrimoModelRecords).toHaveLength(33)
  expect(xtrimoModelRecords.filter((record) => record.status === 'online')).toHaveLength(24)
  expect(xtrimoModelRecords.filter((record) => record.status === 'comingSoon')).toHaveLength(9)
  expect(xtrimoModelRecords.filter((record) => record.callability === 'callable')).toHaveLength(24)
  expect(xtrimoModelRecords.filter((record) => record.callability === 'previewOnly')).toHaveLength(9)
  expect(xtrimoModelRecords.filter((record) => record.projectFit === 'recommended')).toHaveLength(6)
  expect(xtrimoModelRecords.every((record) => record.scope === 'public')).toBe(true)
  expect(xtrimoModelRecords.some((record) => record.name === 'xTrimoAbAffinity_DDG')).toBe(true)
  expect(xtrimoModelRecords.some((record) => record.name === 'xTrimoAAVViability')).toBe(true)
})

it('keeps non-xTrimo model sections populated', () => {
  expect(modelAssetRecords.filter((record) => record.category === 'public-models').length).toBeGreaterThanOrEqual(8)
  expect(modelAssetRecords.filter((record) => record.category === 'project-models').length).toBeGreaterThanOrEqual(4)
  expect(modelAssetRecords.filter((record) => record.category === 'oracles').length).toBeGreaterThanOrEqual(4)
})
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: fail because `xtrimoModelRecords` and the expanded model data do not exist.

- [ ] **Step 3: Implement xTrimo data types and records**

In `src/data/assetsMockData.ts`, add:

```ts
export type XtrimoModelStatus = 'online' | 'comingSoon'
export type XtrimoModelCallability = 'callable' | 'previewOnly'
export type XtrimoProjectFit = 'recommended' | 'useful' | 'general'

export type XtrimoCapability =
  | '结构'
  | '亲和力'
  | '聚集'
  | '催化'
  | 'Embedding'
  | '疏水性'
  | '免疫'
  | '自然度'
  | '可专利性'
  | '扰动'
  | '特异性'
  | '稳定性'
  | '细胞活力'
  | '产量'

export type XtrimoEntity =
  | '细胞'
  | '通用蛋白'
  | '抗体'
  | '酶'
  | 'TCR-多肽-MHC'
  | '功能蛋白'
  | 'AAV'

export type XtrimoModelRecord = {
  id: string
  name: string
  version: string
  status: XtrimoModelStatus
  callability: XtrimoModelCallability
  scope: 'public'
  capabilities: XtrimoCapability[]
  entities: XtrimoEntity[]
  agentUse: string
  input: string
  output: string
  updatedAt: string
  projectFit: XtrimoProjectFit
}
```

Add `xtrimoModelRecords` with the 33 records from the spec:

- 24 `online` and `callable`
- 9 `comingSoon` and `previewOnly`
- 6 `projectFit: 'recommended'`: `xTrimoAbAffinity_DG`, `xTrimoAbAffinity_DDG`, `xTrimoAbAggregation`, `xTrimoAbStability`, `xTrimoAbSpecificity`, `xTrimoAbYield`
- All records `scope: 'public'`

Also expand `modelAssetRecords` so:

- `public-models` contains at least 8 records.
- `project-models` contains at least 4 records.
- `oracles` contains at least 4 records.
- Remove the old single `xTrimoPFP` generic `xtrimo` record or leave `xtrimo` unused by the special xTrimo view, but do not render it in the xTrimo page.

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: the new data tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/data/assetsMockData.ts src/App.test.tsx
git commit -m "Add realistic xTrimo model asset data"
```

## Task 2: xTrimo Page Behavior and Tests

**Files:**
- Modify: `src/components/assets/AssetsPage.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing UI tests**

Add tests to `src/App.test.tsx`:

```ts
it('renders xTrimo as a dense platform model directory', () => {
  const { container, root } = renderApp()

  act(() => {
    getButton(container, 'Assets').click()
  })
  act(() => {
    getButton(container, '模型').click()
  })

  expect(container.textContent).toContain('xTrimo')
  expect(container.textContent).toContain('33 模型')
  expect(container.textContent).toContain('24 已上线')
  expect(container.textContent).toContain('9 即将上线')
  expect(container.textContent).toContain('24 可调用')
  expect(container.textContent).toContain('Agent 推荐')
  expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
  expect(container.textContent).not.toContain('xTrimoPFP')
  expect(findButton(container, '上传')).toBeUndefined()

  root.unmount()
})

it('filters xTrimo models by capability, entity, and lifecycle status', () => {
  const { container, root } = renderApp()

  act(() => {
    getButton(container, 'Assets').click()
  })
  act(() => {
    getButton(container, '模型').click()
  })
  act(() => {
    getButton(container, '亲和力').click()
  })

  expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
  expect(container.textContent).toContain('xTrimoTCR-PeptideBinding')
  expect(container.textContent).not.toContain('xTrimoGene')

  act(() => {
    getButton(container, '抗体').click()
  })

  expect(container.textContent).toContain('xTrimoAbAffinity_DDG')
  expect(container.textContent).not.toContain('xTrimoTCR-PeptideBinding')

  act(() => {
    getButton(container, '即将上线').click()
  })

  expect(container.textContent).toContain('xTrimoAAVViability')
  expect(container.textContent).toContain('仅预览')
  expect(container.textContent).not.toContain('可调用 · xTrimoAAVViability')

  root.unmount()
})
```

- [ ] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: fail because the xTrimo special page and filters are missing.

- [ ] **Step 3: Implement xTrimo view**

In `src/components/assets/AssetsPage.tsx`:

- Import `xtrimoModelRecords` and xTrimo types.
- In `ModelAssetsView`, special-case `item === 'xtrimo'` and render `XtrimoModelAssetsView`.
- Add local state inside `XtrimoModelAssetsView` for:
  - `selectedCapability: XtrimoCapability | 'all'`
  - `selectedEntity: XtrimoEntity | 'all'`
  - `selectedStatus: XtrimoModelStatus | 'all'`
- Use the existing `query` from the global assets toolbar for name, agentUse, input, output, capability and entity search.
- Render:
  - compact header copy
  - stats strip: `33 模型`, `24 已上线`, `9 即将上线`, `14 能力类型`, `7 实体类型`, `24 可调用`, `6 Agent 推荐`
  - `Agent 推荐` compact cards for `projectFit === 'recommended'`
  - capability chips
  - entity chips
  - status segmented control
  - compact model directory cards
- Make `comingSoon / previewOnly` models display `即将上线` and `仅预览`, not `可调用`.
- Card click:
  - callable: `onNotify('模型详情将在后续 Demo 中展开')`
  - previewOnly: `onNotify('该模型即将上线，当前仅支持预览')`

Also update top actions in `AssetsPage`:

- Add `const isXtrimoView = activeSection === 'model' && activeItem === 'xtrimo'`.
- Hide `新建` and `上传` for `isXtrimoView`.
- Keep `更多` available.

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: xTrimo UI tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/assets/AssetsPage.tsx src/App.test.tsx
git commit -m "Render xTrimo model asset directory"
```

## Task 3: Dense xTrimo Visual Styling

**Files:**
- Modify: `src/App.css`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write failing style contract tests**

Add a DOM-level contract test to `src/App.test.tsx`:

```ts
it('uses compact xTrimo-specific layout classes', () => {
  const { container, root } = renderApp()

  act(() => {
    getButton(container, 'Assets').click()
  })
  act(() => {
    getButton(container, '模型').click()
  })

  expect(container.querySelector('.xtrimo-overview')).not.toBeNull()
  expect(container.querySelector('.xtrimo-stats')).not.toBeNull()
  expect(container.querySelector('.xtrimo-recommendations')).not.toBeNull()
  expect(container.querySelector('.xtrimo-filter-bar')).not.toBeNull()
  expect(container.querySelector('.xtrimo-card-grid')).not.toBeNull()

  root.unmount()
})
```

- [ ] **Step 2: Run test and verify red if classes are not present**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: fail until Task 2 adds the class names. If Task 2 already added them, this test may pass; still proceed to CSS implementation.

- [ ] **Step 3: Implement compact CSS**

In `src/App.css`, add xTrimo-specific rules near the existing Assets styles:

- `.xtrimo-overview`: compact section, no hero styling.
- `.xtrimo-stats`: grid of small stat cells, 52px-60px target height.
- `.xtrimo-recommendations`: compact 3-column grid; cards capped visually around 128px.
- `.xtrimo-filter-bar`: compact chip rows, 28px-32px chip height.
- `.xtrimo-card-grid`: 3 columns on wide screens, 2 columns on medium, 1 on mobile.
- `.xtrimo-model-card`: dense, min-height around 104px, max practical content height around 132px using line clamps and low padding.
- Distinguish `callable` and `previewOnly` with small badges.
- Preserve current BioMap Agent palette; avoid large gradients, decorative backgrounds, and tall cards.

- [ ] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/App.test.tsx
```

Expected: all App tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/App.css src/App.test.tsx
git commit -m "Style dense xTrimo model asset view"
```

## Task 4: Final Verification

**Files:**
- No required code files unless fixes are needed.

- [ ] **Step 1: Run full automated verification**

```bash
npm test
npm run build
npm run lint
```

Expected:

- All Vitest tests pass.
- Production build succeeds.
- ESLint exits cleanly.

- [ ] **Step 2: Manual browser verification**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open `http://localhost:5173/` in Chrome or the in-app browser and verify:

- `Assets > 模型 > xTrimo` shows the dedicated xTrimo view.
- Top actions do not show `上传` in xTrimo.
- The page is dense: stats, recommendations, filters, and model cards appear without tall empty cards.
- Filtering by `亲和力`, `抗体`, and `即将上线` behaves as specified.

- [ ] **Step 3: Commit fixes if needed**

If verification required fixes:

```bash
git add src/data/assetsMockData.ts src/components/assets/AssetsPage.tsx src/App.css src/App.test.tsx
git commit -m "Polish xTrimo model assets verification issues"
```

If no fixes were needed, no commit is required.
