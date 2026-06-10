# HER2 Antibody Wet-Lab Execution Mock Thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `HER2 抗体候选湿实验验证` mock Thread that demonstrates antibody wet-lab execution, approval, Experiment Task replay, preset QC, and Experiment Result Package archival without analysis or redesign.

**Architecture:** Reuse the existing static seed-data architecture. Add tests to define the HER2 contract, generate five project-bound scientific operation/QC image assets, then extend `src/data/mockData.ts` with a HER2 transcript, Run Inspector data, and a new Thread under `Antibody Optimization`. No new component, store, route, or backend behavior is required.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, static imported PNG assets, existing `ConversationTurn` and `RunInspectorData` types.

---

## File Structure

- Modify `src/store/demoStoreLogic.test.ts`
  - Add two HER2 seed-data tests: transcript/block contract and Run Inspector/domain-boundary contract.
- Create `src/assets/mock-science/her2/`
  - `her2-experiment-order-execution-flow.png`
  - `her2-sample-plate-map.png`
  - `her2-expression-purification-qc.png`
  - `her2-sec-dsf-bli-qc-dashboard.png`
  - `her2-experiment-result-package-summary.png`
- Modify `src/data/mockData.ts`
  - Import five HER2 PNGs.
  - Add `her2WetlabExecutionTranscript: ConversationTurn[]`.
  - Add `her2WetlabRunInspector: RunInspectorData`.
  - Insert a new Thread with id `her2-wetlab-validation` into the `Antibody Optimization` Project.
- No UI component changes are planned because the current conversation block and Run Inspector components already render `projectFile`, `experimentOrderDraft`, `capabilityRunReplay`, `humanConfirmation`, `approvalRequestReplay`, `elapsedWorkReplay`, and `scientificFigure`.

## Task 1: HER2 Seed Contract Tests

**Files:**
- Modify: `src/store/demoStoreLogic.test.ts`
- Reference: `docs/superpowers/specs/2026-05-31-her2-antibody-wetlab-execution-design.md`

- [ ] **Step 1: Write failing tests**

Add these tests after the IL-17A Run Inspector test and before the generic Run Inspector toggle test:

```ts
  it('seeds the HER2 wet-lab execution Thread without changing the New Thread Draft default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2Thread = findThreadById(state.projects, 'her2-wetlab-validation')?.thread
    const blocks = her2Thread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )
    const allText = her2Thread?.transcript.map((turn) => turn.markdown ?? '').join('\n') ?? ''

    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(her2Thread?.title).toBe('HER2 抗体候选湿实验验证')
    expect(her2Thread?.transcript).toHaveLength(19)
    expect(her2Thread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(5)
    expect(scientificFigures).toHaveLength(5)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.filter((block) => block.type === 'experimentOrderDraft')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(2)
    expect(blocks.filter((block) => block.type === 'humanConfirmation')).toHaveLength(3)
    expect(blocks.filter((block) => block.type === 'approvalGatePreview')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'candidateMoleculeTable')).toHaveLength(0)
    expect(allText).toContain('HER2-EXPTASK-20260531-001')
    expect(allText).toContain('Preset QC Check')
    expect(allText).toContain('Experiment Result Package')
    expect(allText).not.toContain('最佳突变组合')
    expect(allText).not.toContain('下一轮设计')
  })

  it('seeds structured Run Inspector data for the HER2 wet-lab execution replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2Thread = findThreadById(state.projects, 'her2-wetlab-validation')?.thread
    const runInspector = her2Thread?.runInspector

    expect(runInspector?.summary).toMatchObject({
      stage: '湿实验验证完成',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 5,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.progress[3]).toMatchObject({
      title: 'Experiment Task 执行回放',
      status: 'done',
    })
    expect(runInspector?.outputs).toHaveLength(5)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'BM-LAB-HER2-20260531-001',
          kind: 'experimentOrder',
          status: 'submitted',
        }),
        expect.objectContaining({
          name: 'HER2_wetlab_raw_result_bundle.xlsx',
          kind: 'dataset',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_qc_report.md',
          kind: 'report',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_summary_report.md',
          kind: 'report',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_result_package_figures.png',
          kind: 'figure',
        }),
      ]),
    )
    expect(runInspector?.outputs.some((output) => output.name.includes('EXPTASK'))).toBe(false)
    expect(runInspector?.approvals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'approvalRequest',
          title: '提交 HER2 Experiment Order',
          status: 'approved',
        }),
      ]),
    )
    expect(runInspector?.approvals).toHaveLength(4)
    expect(runInspector?.capabilityRuns).toHaveLength(9)
    expect(runInspector?.capabilityRuns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ commandName: 'ExperimentTaskReplay.syncStatus' }),
        expect.objectContaining({ commandName: 'PresetQcChecker.evaluateAssayFiles' }),
      ]),
    )
    expect(
      runInspector?.capabilityRuns.some((run) =>
        JSON.stringify(run.output).includes('HER2-EXPTASK-20260531-001'),
      ),
    ).toBe(true)
    expect(
      runInspector?.capabilityRuns.every(
        (run) =>
          !JSON.stringify(run.output).includes('recommendedLead') &&
          !JSON.stringify(run.output).includes('mechanismExplanation') &&
          !JSON.stringify(run.output).includes('nextRoundDesign'),
      ),
    ).toBe(true)
  })
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts
```

Expected: FAIL because the lookup for `her2-wetlab-validation` returns `undefined`.

- [ ] **Step 3: Commit failing tests**

Do not commit if the test does not fail for the expected missing-thread reason.

```bash
git add src/store/demoStoreLogic.test.ts
git commit -m "Add HER2 wet-lab seed contract tests"
```

## Task 2: HER2 Scientific Operation Images

**Files:**
- Create: `src/assets/mock-science/her2/her2-experiment-order-execution-flow.png`
- Create: `src/assets/mock-science/her2/her2-sample-plate-map.png`
- Create: `src/assets/mock-science/her2/her2-expression-purification-qc.png`
- Create: `src/assets/mock-science/her2/her2-sec-dsf-bli-qc-dashboard.png`
- Create: `src/assets/mock-science/her2/her2-experiment-result-package-summary.png`

- [ ] **Step 1: Generate images with the imagegen skill**

Use built-in `image_gen` once per asset. The outputs must be moved or copied into `src/assets/mock-science/her2/`.

Prompts:

```text
Use case: scientific-educational
Asset type: BioMap Agent mock Thread scientific figure
Primary request: Create a clean scientific operations workflow diagram for HER2 antibody wet-lab validation execution.
Scene/backdrop: white biomedical report canvas, restrained cyan, teal, slate, and amber accents.
Subject: candidate manifest to Experiment Order Draft, Approval Request, submitted Experiment Order, lab-side Experiment Task, result return, Preset QC Check, Experiment Result Package archival.
Layout: left-to-right process with seven labeled stages, small status chips, no brand UI.
Avoid: mechanistic biology interpretation, candidate ranking, "best lead", marketing style, decorative blobs.
```

```text
Use case: scientific-educational
Asset type: BioMap Agent mock Thread scientific figure
Primary request: Create a sample and plate-map layout for HER2 antibody wet-lab validation.
Scene/backdrop: white scientific operations sheet with microplate grid and routing lanes.
Subject: HER2-P0 parent, HER2-VH-01, HER2-VH-02, HER2-VH-03, HER2-ISO isotype control, triplicate wells, assay routing for expression, purification, BLI, ELISA, SEC-HPLC, DSF.
Layout: readable matrix, color-coded controls and candidates, concise labels.
Avoid: candidate ranking, molecular mechanism claims, photoreal lab scene, brand UI.
```

```text
Use case: scientific-educational
Asset type: BioMap Agent mock Thread scientific figure
Primary request: Create an expression and Protein A purification QC summary for HER2 antibody candidates.
Scene/backdrop: white biomedical QC dashboard.
Subject: expression titer, purification yield, sample availability, parent and isotype controls, pass/fail operational markers.
Layout: bar chart plus compact table, neutral status colors, no claims about best molecule.
Avoid: mechanism explanation, lead nomination, dense unreadable text, decorative UI.
```

```text
Use case: scientific-educational
Asset type: BioMap Agent mock Thread scientific figure
Primary request: Create a HER2 assay QC dashboard for SEC-HPLC, DSF, BLI, and binding ELISA.
Scene/backdrop: white scientific report dashboard.
Subject: SEC monomer threshold, Tm threshold, BLI fitting QC, ELISA positive-control window, pass/fail chips against preset criteria.
Layout: four panels with simplified synthetic plots and QC status markers.
Avoid: biological causality, ranking candidates, next-round design advice, product marketing.
```

```text
Use case: scientific-educational
Asset type: BioMap Agent mock Thread scientific figure
Primary request: Create a final HER2 Experiment Result Package summary visual.
Scene/backdrop: white report-style package overview.
Subject: submitted Experiment Order, raw result bundle, QC report, experiment summary report, figure bundle, Project Files archival.
Layout: organized package tiles connected by lineage arrows, clear distinction that files are Project Files, not automatically Assets.
Avoid: sales graphics, best-candidate badges, mechanism interpretation, brand UI.
```

- [ ] **Step 2: Verify files exist and are non-empty**

Run:

```bash
find src/assets/mock-science/her2 -maxdepth 1 -type f -name '*.png' -print -exec test -s {} \;
```

Expected: five PNG paths printed and command exits 0.

- [ ] **Step 3: Commit image assets**

```bash
git add src/assets/mock-science/her2
git commit -m "Add HER2 wet-lab mock figures"
```

## Task 3: HER2 Transcript, Run Inspector, And Thread Seed Data

**Files:**
- Modify: `src/data/mockData.ts`
- Test: `src/store/demoStoreLogic.test.ts`

- [ ] **Step 1: Add HER2 image imports**

At the top of `src/data/mockData.ts`, after the IL-17A imports, add:

```ts
import her2ExperimentOrderExecutionFlow from '../assets/mock-science/her2/her2-experiment-order-execution-flow.png'
import her2ExperimentResultPackageSummary from '../assets/mock-science/her2/her2-experiment-result-package-summary.png'
import her2ExpressionPurificationQc from '../assets/mock-science/her2/her2-expression-purification-qc.png'
import her2SamplePlateMap from '../assets/mock-science/her2/her2-sample-plate-map.png'
import her2SecDsfBliQcDashboard from '../assets/mock-science/her2/her2-sec-dsf-bli-qc-dashboard.png'
```

- [ ] **Step 2: Add `her2WetlabExecutionTranscript`**

Add the transcript after `il17aAffinityDesignTranscript`. It must have exactly 19 explicit turn objects with ids `her2-turn-001` through `her2-turn-019`, exactly 5 user turns, 5 scientific figures, 1 `experimentOrderDraft`, 3 `humanConfirmation`, 1 `approvalRequestReplay`, and 2 `elapsedWorkReplay` blocks.

Content requirements:

- Turn 1 includes Project Files `HER2_candidate_antibody_manifest.xlsx`, `HER2_material_inventory.csv`, and `HER2_validation_sop.pdf`.
- Turn 2 explicitly says this is an execution flow, not candidate analysis, redesign, or a new Workflow object.
- Turn 4 includes the `her2-experiment-order-execution-flow` scientific figure.
- Turn 7 includes the `her2-sample-plate-map` scientific figure.
- Turn 10 includes an `experimentOrderDraft` block for `BM-LAB-HER2-20260531-001`.
- Turn 11 includes an `approvalRequestReplay` block approving the Experiment Order.
- Turns 12 and 13 include `elapsedWorkReplay` blocks for `HER2-EXPTASK-20260531-001`.
- Turn 14 includes the `her2-expression-purification-qc` scientific figure.
- Turn 15 includes the `her2-sec-dsf-bli-qc-dashboard` scientific figure.
- Turn 16 says `Preset QC Check` and only presents pass/fail rows against predefined criteria.
- Turn 17 is a user instruction to archive only the Experiment Result Package and not produce next-round design advice.
- Turn 18 saves these Project Files: `HER2_wetlab_raw_result_bundle.xlsx`, `HER2_experiment_qc_report.md`, `HER2_experiment_summary_report.md`, `HER2_experiment_result_package_figures.png`.
- Turn 19 includes the `her2-experiment-result-package-summary` scientific figure.

- [ ] **Step 3: Add `her2WetlabRunInspector`**

Add `her2WetlabRunInspector: RunInspectorData` after the HER2 transcript and before `projects`.

Required summary:

```ts
summary: {
  stage: '湿实验验证完成',
  status: 'completed',
  completedSteps: 7,
  totalSteps: 7,
  outputCount: 5,
  pendingCount: 0,
}
```

Required progress titles:

```ts
[
  '候选与订单输入确认',
  '样本需求和 controls 检查',
  'Experiment Order 审批',
  'Experiment Task 执行回放',
  '结果文件导入',
  '预设 QC 检查',
  'Experiment Result Package 归档',
]
```

Required outputs:

```ts
[
  { id: 'her2-experiment-order', name: 'BM-LAB-HER2-20260531-001', kind: 'experimentOrder', location: 'Antibody Optimization / Experiment Orders', status: 'submitted' },
  { id: 'her2-raw-result-bundle', name: 'HER2_wetlab_raw_result_bundle.xlsx', kind: 'dataset', location: 'Antibody Optimization / Files / Assays', status: 'completed' },
  { id: 'her2-qc-report', name: 'HER2_experiment_qc_report.md', kind: 'report', location: 'Antibody Optimization / Files / Reports', status: 'saved' },
  { id: 'her2-summary-report', name: 'HER2_experiment_summary_report.md', kind: 'report', location: 'Antibody Optimization / Files / Reports', status: 'saved' },
  { id: 'her2-figures', name: 'HER2_experiment_result_package_figures.png', kind: 'figure', location: 'Antibody Optimization / Files / Figures', status: 'saved' },
]
```

Required approvals:

- `humanConfirmation` for scope confirmation.
- `humanConfirmation` for budget/schedule/assay constraints.
- `humanConfirmation` for control requirements.
- `approvalRequest` titled `提交 HER2 Experiment Order`.

Required capability runs:

1. `ProjectFileReader.extractHer2ExecutionInputs`
2. `ExperimentOrderDraft.create`
3. `SampleRequirementEstimator.calculate`
4. `PlateMapDesigner.createLayout`
5. `ExperimentOrder.submit`
6. `ExperimentTaskReplay.syncStatus`
7. `ExperimentResultReader.importResults`
8. `PresetQcChecker.evaluateAssayFiles`
9. `ProjectFile.save`

The `ExperimentTaskReplay.syncStatus` output must include `experimentTaskId: 'HER2-EXPTASK-20260531-001'`. No capability output may include `recommendedLead`, `mechanismExplanation`, or `nextRoundDesign`.

- [ ] **Step 4: Insert the new Thread**

In the `Antibody Optimization` project `threads` array, insert the HER2 Thread after IL-17A:

```ts
      {
        id: 'her2-wetlab-validation',
        title: 'HER2 抗体候选湿实验验证',
        lastActivity: '1 天前',
        transcript: her2WetlabExecutionTranscript,
        runInspector: her2WetlabRunInspector,
      },
```

- [ ] **Step 5: Run HER2 seed tests to verify GREEN**

Run:

```bash
npm test -- src/store/demoStoreLogic.test.ts
```

Expected: PASS for `src/store/demoStoreLogic.test.ts`.

- [ ] **Step 6: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit implementation**

```bash
git add src/data/mockData.ts src/store/demoStoreLogic.test.ts
git commit -m "Add HER2 wet-lab execution mock thread"
```

## Task 4: Browser Verification

**Files:**
- No source edits expected.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1 --port 5175
```

Expected: Vite serves the app at `http://127.0.0.1:5175/`. If 5175 is unavailable, use the next available port.

- [ ] **Step 2: Verify default homepage**

Open the local URL in the browser automation tool.

Expected:

- The app opens in New Thread Draft mode.
- No mock Thread transcript is visible by default.
- `HER2 抗体候选湿实验验证` appears under `Antibody Optimization`.

- [ ] **Step 3: Verify HER2 Thread**

Click `HER2 抗体候选湿实验验证`.

Expected:

- Thread title is visible.
- Transcript contains `BM-LAB-HER2-20260531-001`.
- Transcript contains `HER2-EXPTASK-20260531-001`.
- Transcript contains five Scientific Figure blocks.
- Run Inspector summary shows `湿实验验证完成`.
- Run Inspector outputs include `HER2_experiment_result_package_figures.png`.

- [ ] **Step 4: Stop dev server**

Stop the server session cleanly.

## Final Review Checklist

- [ ] Re-read `docs/superpowers/specs/2026-05-31-her2-antibody-wetlab-execution-design.md`.
- [ ] Confirm every acceptance criterion has an implementation or test.
- [ ] Confirm `CONTEXT.md` terms are respected:
  - Thread is not Workflow.
  - Experiment Task is not Main Agent Task.
  - Preset QC Check is not biological analysis.
  - Experiment Result Package is Project Files, not automatically Asset.
- [ ] Confirm `git status --short --branch` is clean after commits.
