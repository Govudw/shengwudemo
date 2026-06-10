# Industrial Enzyme Design Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing `enzyme-discovery` mock Project into a full `Industrial Enzyme Design` Agent OS demo with four complete enzyme-design Threads, high-density scientific figures, enhanced Run Inspector data, and seed persistence cleanup.

**Architecture:** Reuse the existing static seed-data architecture and current Thread rendering system. Add one domain-neutral `candidateEvidenceTable` block for enzyme candidate evidence, keep existing antibody `candidateMoleculeTable` untouched, move enzyme-specific transcripts/run inspectors into a focused data module, and wire it into `src/data/mockData.ts`. Clean up obsolete enzyme placeholder seed Threads through a narrow allowlist so user-created Threads are preserved.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Zustand persist, static imported PNG assets, existing `ConversationTurn` and `RunInspectorData` types.

---

## File Structure

- Create `src/data/enzymeMockData.ts`
  - Import 28 PNGs from `src/assets/mock-science/enzyme/`.
  - Export four `ConversationTurn[]` transcripts.
  - Export four `RunInspectorData` objects.
  - Export `industrialEnzymeThreads`.
- Modify `src/data/conversationTypes.ts`
  - Add `CandidateEvidenceTableBlock`.
  - Add it to `ConversationBlock`.
- Modify `src/components/ConversationBlocks.tsx`
  - Render `candidateEvidenceTable`.
- Modify `src/App.css`
  - Add focused styles for the candidate evidence table.
- Modify `src/data/mockData.ts`
  - Import `industrialEnzymeThreads`.
  - Replace the old `enzyme-discovery` placeholder Threads with the four full Threads.
  - Rename the project display name to `Industrial Enzyme Design`.
- Modify `src/store/useDemoStore.ts`
  - Add a narrow obsolete enzyme seed Thread allowlist.
  - Remove only `enzyme-family`, `screening-plan`, and `enzymekcat` during seed merge.
  - Reset selected Thread to New Thread Draft if it points at an obsolete enzyme placeholder.
- Modify `src/store/demoStoreLogic.test.ts`
  - Add seed contract tests for the four enzyme Threads.
  - Add candidate evidence table block assertions.
- Modify `src/store/useDemoStore.test.ts`
  - Add persistence migration tests for obsolete enzyme placeholders.
- Create `src/assets/mock-science/enzyme/*.png`
  - 28 scientific/operations figures, seven per Thread.

## Canonical Demo Contract

Project:

- Project id: `enzyme-discovery`
- Project display name: `Industrial Enzyme Design`
- The old placeholder Threads `enzyme-family`, `screening-plan`, and `enzymekcat` must not remain as seed Threads.

Threads:

| Title | Thread id | Contract |
| --- | --- | --- |
| `工业酶设计全流程闭环` | `enzyme-full-loop` | 19 turns, 5 user turns, 7 Scientific Figures |
| `设计拆解：目标定义与候选生成` | `enzyme-design-breakdown` | 19 turns, 5 user turns, 7 Scientific Figures |
| `实验拆解：酶库订单与执行回收` | `enzyme-experiment-execution` | 19 turns, 5 user turns, 7 Scientific Figures |
| `分析拆解：结果解释与迭代结论` | `enzyme-analysis-iteration` | 19 turns, 5 user turns, 7 Scientific Figures |

Shared canonical objects:

- `ENZ-P0`
- `ENZ-LIB-20260602-048`
- `ENZ-MUT-001` through `ENZ-MUT-048`
- `Enzyme_Industrial_Design_Brief.md`
- `Enzyme_Candidate_Design_Package.md`
- `BM-LAB-ENZ-20260602-001`
- `ENZ-EXPTASK-20260602-001`
- `CRO-ENZ-20260602-001`
- `ENZ-PLATEMAP-20260602-001.csv`
- `Enzyme_Experiment_Result_Package.xlsx`
- `Enzyme_Curve_Fit_and_QC_Summary.xlsx`
- `Enzyme_Post_Experiment_Analysis_Report.md`
- `Enzyme_Candidate_Consensus_Score_Table.csv`
- `Enzyme_Iteration_Decision_Log.md`
- `Enzyme_Operational_Record_Index.csv`
- `Enzyme_Analysis_Figure_Bundle.png`

Forbidden capability command names:

- `DataCenter.*`
- `KnowledgeAssistant.*`
- `PredictBestEnzyme.*`
- `ProveMechanism.*`
- `AutoSelectLead.*`

## Task 1: Candidate Evidence Table Block

**Files:**
- Modify `src/data/conversationTypes.ts`
- Modify `src/components/ConversationBlocks.tsx`
- Modify `src/App.css`
- Modify `src/components/ThreadWorkspace.test.tsx` or add focused assertions in `src/store/demoStoreLogic.test.ts`

- [ ] **Step 1: Add a failing renderer test**

Add a test that renders a Thread containing this block and asserts the enzyme-specific readout labels are visible:

```ts
{
  type: 'candidateEvidenceTable',
  title: 'Enzyme candidate evidence matrix',
  columns: [
    { key: 'activity', label: 'Activity' },
    { key: 'kcatKm', label: 'kcat/Km proxy' },
    { key: 'tm', label: 'Tm' },
    { key: 'phWindow', label: 'pH window' },
    { key: 'expressionRisk', label: 'Expression risk' },
  ],
  rows: [
    {
      id: 'ENZ-MUT-021',
      group: 'Stability enhanced',
      evidence: {
        activity: '+12%',
        kcatKm: '+9%',
        tm: '+5.8 C',
        phWindow: 'pH 4.3-5.1',
        expressionRisk: 'low',
      },
      risk: 'low',
      rationale: 'Stable 60 C half-life signal with acceptable activity.',
    },
  ],
}
```

Expected RED: TypeScript fails because `candidateEvidenceTable` is not in `ConversationBlock`, or the renderer does not display it.

- [ ] **Step 2: Add the block type**

In `src/data/conversationTypes.ts`, add:

```ts
export type CandidateEvidenceTableBlock = {
  type: 'candidateEvidenceTable'
  title: string
  columns: Array<{ key: string; label: string }>
  rows: Array<{
    id: string
    group: string
    evidence: Record<string, string>
    risk: 'low' | 'medium' | 'high'
    rationale: string
  }>
}
```

Add `CandidateEvidenceTableBlock` to the `ConversationBlock` union.

- [ ] **Step 3: Render the block**

In `src/components/ConversationBlocks.tsx`, add a `case 'candidateEvidenceTable'` branch. It should render:

- `<section className="candidate-evidence-table-block">`
- `<h3>{block.title}</h3>`
- A horizontally scrollable table.
- Columns: `ID`, `Group`, all configured `columns`, `Risk`, `Rationale`.
- Risk labels can reuse the existing `riskLabels`.

- [ ] **Step 4: Style the block**

In `src/App.css`, add compact table styles mirroring the existing candidate table style but using the `candidate-evidence-table-block` class. Keep dimensions stable and avoid large decorative cards.

- [ ] **Step 5: Verify**

Run:

```bash
npm test -- src/components/ThreadWorkspace.test.tsx src/store/demoStoreLogic.test.ts
```

Expected: tests pass.

## Task 2: Seed Persistence Migration For Obsolete Enzyme Placeholders

**Files:**
- Modify `src/store/useDemoStore.ts`
- Modify `src/store/useDemoStore.test.ts`

- [ ] **Step 1: Write failing persistence tests**

Add a test that persists an `enzyme-discovery` project containing:

- old seed placeholder Threads: `enzyme-family`, `screening-plan`, `enzymekcat`
- one user-created Thread: `custom-enzyme-thread`
- `selectedThreadId: 'screening-plan'`
- `isDraftingNewThread: false`

Expected after hydration:

- old placeholders are removed
- `custom-enzyme-thread` remains
- the new enzyme seed Threads are present
- `selectedThreadId` is `null`
- `isDraftingNewThread` is `true`

- [ ] **Step 2: Implement a narrow obsolete seed allowlist**

In `src/store/useDemoStore.ts`, add:

```ts
const obsoleteSeedThreadIdsByProjectId: Record<string, Set<string>> = {
  'enzyme-discovery': new Set(['enzyme-family', 'screening-plan', 'enzymekcat']),
}
```

Use it during merge to drop only these known obsolete seed Thread ids.

- [ ] **Step 3: Reset obsolete selected Thread**

During persisted-state merge, if `restoredState.selectedThreadId` is one of the obsolete ids for `enzyme-discovery`, restore the New Thread Draft state:

- `selectedThreadId: null`
- `isDraftingNewThread: true`

Do not reset selection for unrelated projects or user-created Threads.

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- src/store/useDemoStore.test.ts
```

Expected: tests pass.

## Task 3: Enzyme Scientific Figure Assets

**Files:**
- Create `src/assets/mock-science/enzyme/`
- Create 28 PNG files listed below.

- [ ] **Step 1: Generate figures**

Generate PNG assets in `src/assets/mock-science/enzyme/` with these exact names:

```text
enzyme-full-loop-project-map.png
enzyme-industrial-objective-tradeoff.png
enzyme-candidate-library-overview.png
enzyme-order-to-task-flow.png
enzyme-result-package-summary.png
enzyme-consensus-and-iteration-summary.png
enzyme-human-gates-map.png
enzyme-family-clustering.png
enzyme-active-site-pocket-map.png
enzyme-conserved-and-mutable-sites.png
enzyme-mutation-design-map.png
enzyme-model-score-panel.png
enzyme-pareto-ranking.png
enzyme-library-design-matrix.png
enzyme-experiment-order-draft.png
enzyme-assay-panel-design.png
enzyme-plate-map.png
enzyme-sample-material-device-flow.png
enzyme-cro-task-status.png
enzyme-experiment-anomaly-log.png
enzyme-result-ingestion-checklist.png
enzyme-result-package-qc-overview.png
enzyme-kinetics-curve-fitting.png
enzyme-ph-temperature-profile.png
enzyme-stability-half-life.png
enzyme-model-consensus-matrix.png
enzyme-uncertainty-sensitivity-analysis.png
enzyme-iteration-decision-tree.png
```

Each figure should look like a scientific report, operations dashboard, analysis plot, or workflow figure. The figures must use the canonical ids where relevant: `ENZ-P0`, `ENZ-LIB-20260602-048`, `BM-LAB-ENZ-20260602-001`, `ENZ-EXPTASK-20260602-001`, and `Enzyme_Experiment_Result_Package.xlsx`.

- [ ] **Step 2: Verify assets**

Run:

```bash
find src/assets/mock-science/enzyme -maxdepth 1 -type f -name '*.png' -print | wc -l
find src/assets/mock-science/enzyme -maxdepth 1 -type f -name '*.png' -print -exec test -s {} \;
```

Expected: first command prints `28`; second command exits 0.

## Task 4: Industrial Enzyme Seed Data

**Files:**
- Create `src/data/enzymeMockData.ts`
- Modify `src/data/mockData.ts`
- Modify `src/store/demoStoreLogic.test.ts`

- [ ] **Step 1: Write failing seed contract tests**

Add tests that assert:

- Project `enzyme-discovery` display name is `Industrial Enzyme Design`.
- `enzyme-discovery` contains only these four seed Thread ids: `enzyme-full-loop`, `enzyme-design-breakdown`, `enzyme-experiment-execution`, `enzyme-analysis-iteration`.
- Each Thread has 19 turns, 5 user turns, and 7 `scientificFigure` blocks with non-empty `src`, `width`, and `height`.
- Every Thread text contains `ENZ-LIB-20260602-048`, `BM-LAB-ENZ-20260602-001`, and `Enzyme_Experiment_Result_Package.xlsx`.
- `enzyme-design-breakdown` and `enzyme-analysis-iteration` contain `candidateEvidenceTable` and do not contain `candidateMoleculeTable`.
- No capability run command starts with a forbidden prefix.
- Each Thread has Run Inspector data with summary, 7-9 progress items, outputs, approvals, and 8-12 capability runs.

- [ ] **Step 2: Add enzyme data module**

Create `src/data/enzymeMockData.ts`. It should:

- import the 28 enzyme PNGs
- import `ConversationTurn` and `RunInspectorData`
- export `enzymeFullLoopTranscript`
- export `enzymeDesignBreakdownTranscript`
- export `enzymeExperimentExecutionTranscript`
- export `enzymeAnalysisIterationTranscript`
- export four matching Run Inspector objects
- export `industrialEnzymeThreads`

Use the exact canonical ids from this plan. Keep each Thread focused on its own perspective.

- [ ] **Step 3: Replace the old project seed**

In `src/data/mockData.ts`, import `industrialEnzymeThreads` and replace:

```ts
{
  id: 'enzyme-discovery',
  name: 'Enzyme Discovery',
  threads: [
    { id: 'enzyme-family', title: '新型噬酸酶家族调研', lastActivity: '3 小时' },
    { id: 'screening-plan', title: '酶活性筛选方案讨论', lastActivity: '昨天' },
    { id: 'enzymekcat', title: 'EnzymeKcat 模型探索', lastActivity: '2 天前' },
  ],
}
```

with:

```ts
{
  id: 'enzyme-discovery',
  name: 'Industrial Enzyme Design',
  threads: industrialEnzymeThreads,
}
```

- [ ] **Step 4: Verify**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts
```

Expected: tests pass.

## Task 5: Full Verification

**Files:**
- All changed files.

- [ ] **Step 1: Run full tests**

Run:

```bash
npm test -- --run
```

Expected: all tests pass.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: build exits 0.

- [ ] **Step 3: Inspect status**

Run:

```bash
git status --short
```

Expected: only intended files are changed.

- [ ] **Step 4: Manual UI smoke**

Start Vite:

```bash
npm run dev -- --host 127.0.0.1
```

Open the app and verify:

- default state is New Thread Draft
- sidebar has `Industrial Enzyme Design`
- old enzyme placeholder Threads are absent
- four enzyme Threads are visible
- each enzyme Thread renders without broken images
- Run Inspector opens for enzyme Threads
- `candidateEvidenceTable` displays enzyme readouts rather than `Kd`
