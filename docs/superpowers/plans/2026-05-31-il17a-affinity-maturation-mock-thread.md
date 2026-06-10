# IL-17A Affinity Maturation Mock Thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the IL-17A pre-experiment analysis-design mock Thread described in the approved spec.

**Architecture:** Reuse the existing EGFR mock Thread architecture in `src/data/mockData.ts`: typed local mock transcript data, `scientificFigure` blocks, and `RunInspectorData`. Add generated raster figure files under `src/assets/mock-science/il17a/`, then seed a new Thread under `Antibody Optimization` without changing the New Thread Draft default state.

**Tech Stack:** React, TypeScript, Vite, Vitest, existing local mock data model, built-in `imagegen` for project-bound Scientific Figure image files.

---

### Task 1: Lock Seed Behavior With A Failing Test

**Files:**
- Modify: `src/store/demoStoreLogic.test.ts`

- [ ] **Step 1: Add the failing IL-17A seed test**

Add this test near the existing seeded EGFR tests:

```ts
  it('seeds the IL-17A analysis-design Thread without changing the New Thread Draft default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const il17aThread = findThreadById(state.projects, 'il17a-affinity-design')?.thread
    const blocks = il17aThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )

    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(il17aThread?.title).toBe('IL-17A 亲和力成熟实验设计')
    expect(il17aThread?.transcript).toHaveLength(19)
    expect(il17aThread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(4)
    expect(scientificFigures).toHaveLength(5)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'approvalGatePreview')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(0)
  })
```

- [ ] **Step 2: Add the failing IL-17A Run Inspector test**

Add this test near the existing Run Inspector seed test:

```ts
  it('seeds structured Run Inspector data for the IL-17A analysis design replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const il17aThread = findThreadById(state.projects, 'il17a-affinity-design')?.thread
    const runInspector = il17aThread?.runInspector

    expect(runInspector?.summary).toMatchObject({
      stage: '实验前分析设计完成',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 4,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.outputs).toHaveLength(4)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'IL17A_affinity_maturation_design_package.md', kind: 'report' }),
        expect.objectContaining({ name: 'IL17A_library_design_matrix.csv', kind: 'dataset' }),
        expect.objectContaining({ name: 'IL17A_assay_readout_plan.xlsx', kind: 'projectFile' }),
        expect.objectContaining({ name: 'IL17A_scientific_figures.png', kind: 'figure' }),
      ]),
    )
    expect(runInspector?.approvals).toEqual([
      expect.objectContaining({
        kind: 'humanConfirmation',
        title: '确认 Experiment Design Package',
        status: 'confirmed',
      }),
    ])
    expect(runInspector?.capabilityRuns).toHaveLength(8)
    expect(
      runInspector?.capabilityRuns.every(
        (run) =>
          !JSON.stringify(run.output).includes('predictedWinner') &&
          !JSON.stringify(run.output).includes('provenCause'),
      ),
    ).toBe(true)
  })
```

- [ ] **Step 3: Run the focused tests and confirm they fail for missing IL-17A seed data**

Run: `npm test -- src/store/demoStoreLogic.test.ts`

Expected: FAIL because `il17aThread` is undefined.

### Task 2: Generate And Save IL-17A Scientific Figure Files

**Files:**
- Create directory: `src/assets/mock-science/il17a/`
- Create images:
  - `src/assets/mock-science/il17a/il17a-discordance-plot.png`
  - `src/assets/mock-science/il17a/il17a-variant-evidence-heatmap.png`
  - `src/assets/mock-science/il17a/il17a-cdr-site-evidence-map.png`
  - `src/assets/mock-science/il17a/il17a-hypothesis-triage-diagram.png`
  - `src/assets/mock-science/il17a/il17a-library-assay-design-matrix.png`

- [ ] **Step 1: Generate five imagegen outputs**

Use built-in `imagegen` once per figure with scientific-report prompts. Avoid relying on small readable text; captions in the Thread provide exact meaning.

- [ ] **Step 2: Copy final outputs into the project**

Copy the selected image files from the imagegen output directory into `src/assets/mock-science/il17a/` using the exact filenames above.

- [ ] **Step 3: Verify the files exist**

Run: `find src/assets/mock-science/il17a -type f | sort`

Expected: the five PNG paths above.

### Task 3: Add IL-17A Transcript And Run Inspector Data

**Files:**
- Modify: `src/data/mockData.ts`

- [ ] **Step 1: Import the five IL-17A figures**

Add imports after the EGFR figure imports:

```ts
import il17aDiscordancePlot from '../assets/mock-science/il17a/il17a-discordance-plot.png'
import il17aVariantEvidenceHeatmap from '../assets/mock-science/il17a/il17a-variant-evidence-heatmap.png'
import il17aCdrSiteEvidenceMap from '../assets/mock-science/il17a/il17a-cdr-site-evidence-map.png'
import il17aHypothesisTriageDiagram from '../assets/mock-science/il17a/il17a-hypothesis-triage-diagram.png'
import il17aLibraryAssayDesignMatrix from '../assets/mock-science/il17a/il17a-library-assay-design-matrix.png'
```

- [ ] **Step 2: Add `il17aAffinityDesignTranscript`**

Create a 19-turn `ConversationTurn[]` after the EGFR transcript. Include exactly four user turns, three initial `projectFile` blocks, five `scientificFigure` blocks, several `capabilityRunReplay` blocks, one `humanConfirmation` block, and no approval or elapsed-work replay blocks.

- [ ] **Step 3: Add `il17aRunInspector`**

Create a `RunInspectorData` object with summary stage `实验前分析设计完成`, seven progress items, four outputs, one `humanConfirmation` approval item, and eight capability runs.

- [ ] **Step 4: Seed the new Thread**

Insert this Thread under `Antibody Optimization` without changing `createInitialDemoState`:

```ts
{
  id: 'il17a-affinity-design',
  title: 'IL-17A 亲和力成熟实验设计',
  lastActivity: '2 天前',
  transcript: il17aAffinityDesignTranscript,
  runInspector: il17aRunInspector,
}
```

- [ ] **Step 5: Run focused tests and make them pass**

Run: `npm test -- src/store/demoStoreLogic.test.ts`

Expected: PASS.

### Task 4: Full Verification And Browser Check

**Files:**
- No planned code changes unless verification exposes a real defect.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: all Vitest tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`

Expected: no ESLint errors.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build pass.

- [ ] **Step 4: Start the dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite prints a localhost URL.

- [ ] **Step 5: Verify in Browser**

Open the dev URL with the Browser plugin. Confirm the home view starts as New Thread Draft, click `IL-17A 亲和力成熟实验设计`, confirm the transcript renders, five scientific figures are present, and Run Inspector can be opened.

- [ ] **Step 6: Commit implementation**

Run:

```bash
git add src/store/demoStoreLogic.test.ts src/data/mockData.ts src/assets/mock-science/il17a docs/superpowers/plans/2026-05-31-il17a-affinity-maturation-mock-thread.md
git commit -m "Add IL-17A analysis mock thread"
```
