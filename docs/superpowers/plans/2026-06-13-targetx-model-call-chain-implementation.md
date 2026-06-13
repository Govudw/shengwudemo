# Target-X Model Call Chain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add xTrimo plus open-source biological model call-chain mock sections to the Target-X antibody discovery Thread.

**Architecture:** Add a typed `modelCallComparison` conversation block, render it as a compact model-comparison card, then insert model workbench turns into the Target-X discovery mock data. Update run inspector and object-storage files so the model artifacts appear in the right panel and side-window file tree.

**Tech Stack:** React + TypeScript, Vitest, existing `ConversationBlocks` rendering pattern, existing mock data files under `src/data`.

---

## File Structure

- Modify `src/data/conversationTypes.ts`: define `ModelCallComparisonBlock` and add it to `ConversationBlock`.
- Modify `src/components/ConversationBlocks.tsx`: render `modelCallComparison` and keep it separate from `capabilityRunReplay`.
- Modify `src/App.css`: style the model card with a dense, scientific workbench look.
- Modify `src/components/ConversationBlocks.test.tsx`: cover the new block rendering.
- Modify `src/data/antibodyTargetXMockData.ts`: add model workbench turns, model comparison blocks, run inspector entries, and outputs.
- Modify `src/data/antibodyTargetXMockData.test.ts`: assert model blocks, xTrimo/open-source pairings, outputs, and no EGFR regression.
- Modify `src/data/workspaceSideWindowMockData.ts`: add model call and consensus files for `targetx-antibody-discovery`.

## Task 1: Type And Rendering Test

**Files:**
- Modify: `src/data/conversationTypes.ts`
- Modify: `src/components/ConversationBlocks.test.tsx`

- [ ] **Step 1: Add the failing render test**

Add this test to `src/components/ConversationBlocks.test.tsx` near the existing Target-X scientific diagram test:

```tsx
it('renders model call comparison blocks with xTrimo and open-source model evidence', () => {
  const { container } = render(
    <ConversationBlocks
      blocks={[
        {
          type: 'modelCallComparison',
          title: 'Fv structure cross-check',
          subtitle: 'xTrimoAbFold v1.2 × IgFold',
          primaryModel: {
            name: 'xTrimoAbFold',
            provider: 'BioMap xTrimo',
            version: 'v1.2',
            purpose: 'Production Fv structure prediction',
            inputSummary: 'Target-X VH/VL candidate batch',
            outputSummary: 'CDR confidence, VH/VL packing, fold risk',
            status: 'success',
          },
          comparatorModel: {
            name: 'IgFold',
            provider: 'Open-source',
            version: 'mock-2026.06',
            purpose: 'Independent Fv sanity check',
            inputSummary: 'Same VH/VL candidate batch',
            outputSummary: 'CDR loop confidence and disagreement flags',
            status: 'success',
          },
          metrics: [
            {
              metric: 'ABX-014 CDRH3',
              primaryValue: 'stable',
              comparatorValue: 'stable',
              agreement: 'agree',
              interpretation: 'enter docking queue',
            },
            {
              metric: 'ABX-041 CDRH3',
              primaryValue: 'medium',
              comparatorValue: 'unstable',
              agreement: 'disagree',
              interpretation: 'downgrade to backup',
            },
          ],
          decision: 'backup',
          decisionText:
            'ABX-041 is downgraded before final ranking because the open-source sanity check disagrees on CDRH3 stability.',
          riskNote: 'Model evidence only; R1 wet-lab validation remains required.',
          artifacts: [
            { name: 'TargetX_xtrimo_abfold_results.json', kind: 'json' },
            { name: 'TargetX_igfold_crosscheck.json', kind: 'json' },
          ],
        },
      ]}
    />,
  )

  expect(container.querySelector('.model-call-comparison-block')).not.toBeNull()
  expect(container.textContent).toContain('xTrimoAbFold')
  expect(container.textContent).toContain('IgFold')
  expect(container.textContent).toContain('downgrade to backup')
  expect(container.textContent).toContain('Model evidence only')
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npx vitest run src/components/ConversationBlocks.test.tsx --maxWorkers=1 --no-file-parallelism
```

Expected: TypeScript/test failure because `modelCallComparison` is not yet part of `ConversationBlock`.

- [ ] **Step 3: Add the TypeScript block type**

In `src/data/conversationTypes.ts`, add `ModelCallComparisonBlock` to the `ConversationBlock` union and define:

```ts
export type ModelCallComparisonBlock = {
  type: 'modelCallComparison'
  title: string
  subtitle: string
  primaryModel: ModelCallSummary
  comparatorModel: ModelCallSummary
  metrics: Array<{
    metric: string
    primaryValue: string
    comparatorValue: string
    agreement: 'agree' | 'partial' | 'disagree'
    interpretation: string
  }>
  decision: 'primary' | 'backup' | 'review' | 'reject' | 'control'
  decisionText: string
  riskNote: string
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
  }>
}

export type ModelCallSummary = {
  name: string
  provider: string
  version: string
  purpose: string
  inputSummary: string
  outputSummary: string
  status: 'success' | 'warning' | 'failed'
}
```

- [ ] **Step 4: Run the focused test again**

Run:

```bash
npx vitest run src/components/ConversationBlocks.test.tsx --maxWorkers=1 --no-file-parallelism
```

Expected: still fails because the renderer has no `modelCallComparison` switch case. That failure is expected before Task 2.

## Task 2: Model Comparison Card Component

**Files:**
- Modify: `src/components/ConversationBlocks.tsx`
- Modify: `src/App.css`
- Test: `src/components/ConversationBlocks.test.tsx`

- [ ] **Step 1: Implement the `modelCallComparison` switch case**

In `src/components/ConversationBlocks.tsx`, add:

```tsx
const modelDecisionLabels: Record<
  BlockOf<'modelCallComparison'>['decision'],
  string
> = {
  primary: 'PRIMARY',
  backup: 'BACKUP',
  review: 'REVIEW',
  reject: 'REJECT',
  control: 'CONTROL',
}

const modelAgreementLabels: Record<
  BlockOf<'modelCallComparison'>['metrics'][number]['agreement'],
  string
> = {
  agree: 'agree',
  partial: 'partial',
  disagree: 'disagree',
}
```

Add a switch case:

```tsx
case 'modelCallComparison':
  return <ModelCallComparison block={block} />
```

Add a local component near the other block helpers:

```tsx
function ModelCallComparison({
  block,
}: {
  block: BlockOf<'modelCallComparison'>
}) {
  return (
    <section
      className={`model-call-comparison-block model-call-comparison-block--${block.decision}`}
      aria-label={block.title}
    >
      <header className="model-call-comparison-block__header">
        <div>
          <div className="model-call-comparison-block__eyebrow">Model Call Comparison</div>
          <h3>{block.title}</h3>
          <p>{block.subtitle}</p>
        </div>
        <span className="model-call-comparison-block__decision">
          {modelDecisionLabels[block.decision]}
        </span>
      </header>

      <div className="model-call-comparison-block__models">
        <ModelCallSummaryCard label="Primary" model={block.primaryModel} />
        <ModelCallSummaryCard label="Comparator" model={block.comparatorModel} />
      </div>

      <div className="model-call-comparison-block__table-wrap">
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>{block.primaryModel.name}</th>
              <th>{block.comparatorModel.name}</th>
              <th>Agreement</th>
              <th>Interpretation</th>
            </tr>
          </thead>
          <tbody>
            {block.metrics.map((metric) => (
              <tr key={metric.metric}>
                <td>{metric.metric}</td>
                <td>{metric.primaryValue}</td>
                <td>{metric.comparatorValue}</td>
                <td>
                  <span
                    className={`model-call-comparison-block__agreement model-call-comparison-block__agreement--${metric.agreement}`}
                  >
                    {modelAgreementLabels[metric.agreement]}
                  </span>
                </td>
                <td>{metric.interpretation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="model-call-comparison-block__footer">
        <p>{block.decisionText}</p>
        <span>{block.riskNote}</span>
      </div>

      {block.artifacts?.length ? (
        <div className="model-call-comparison-block__artifacts">
          {block.artifacts.map((artifact) => (
            <span key={artifact.name}>
              {artifact.kind.toUpperCase()} · {artifact.name}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ModelCallSummaryCard({
  label,
  model,
}: {
  label: string
  model: BlockOf<'modelCallComparison'>['primaryModel']
}) {
  return (
    <article className="model-call-comparison-block__model">
      <div className="model-call-comparison-block__model-label">{label}</div>
      <h4>{model.name}</h4>
      <p>{model.provider} · {model.version}</p>
      <dl>
        <div>
          <dt>Purpose</dt>
          <dd>{model.purpose}</dd>
        </div>
        <div>
          <dt>Input</dt>
          <dd>{model.inputSummary}</dd>
        </div>
        <div>
          <dt>Output</dt>
          <dd>{model.outputSummary}</dd>
        </div>
      </dl>
    </article>
  )
}
```

- [ ] **Step 2: Add CSS**

In `src/App.css`, add a compact card style that matches existing scientific workflow cards:

```css
.model-call-comparison-block {
  border: 1px solid #cfe0ee;
  border-radius: 16px;
  background: linear-gradient(180deg, #fbfdff 0%, #f7fbfd 100%);
  box-shadow: 0 16px 36px rgba(23, 50, 77, 0.08);
  overflow: hidden;
}

.model-call-comparison-block__header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #dbe8f2;
}

.model-call-comparison-block__eyebrow,
.model-call-comparison-block__model-label {
  color: #71839a;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.model-call-comparison-block h3,
.model-call-comparison-block h4,
.model-call-comparison-block p {
  margin: 0;
}

.model-call-comparison-block h3 {
  margin-top: 5px;
  color: #10213a;
  font-size: 1.15rem;
}

.model-call-comparison-block__header p {
  margin-top: 6px;
  color: #61738a;
  font-size: 0.94rem;
}

.model-call-comparison-block__decision {
  align-self: flex-start;
  border-radius: 999px;
  padding: 7px 12px;
  background: #dff7ea;
  color: #107647;
  font-size: 0.78rem;
  font-weight: 900;
}

.model-call-comparison-block--backup .model-call-comparison-block__decision,
.model-call-comparison-block--control .model-call-comparison-block__decision {
  background: #e3f2ff;
  color: #09689f;
}

.model-call-comparison-block--review .model-call-comparison-block__decision {
  background: #fff1c7;
  color: #916006;
}

.model-call-comparison-block--reject .model-call-comparison-block__decision {
  background: #ffe1df;
  color: #b42318;
}

.model-call-comparison-block__models {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 18px 24px;
}

.model-call-comparison-block__model {
  border: 1px solid #d9e5ef;
  border-radius: 14px;
  background: #ffffff;
  padding: 16px;
}

.model-call-comparison-block__model h4 {
  margin-top: 5px;
  color: #10213a;
  font-size: 1.05rem;
}

.model-call-comparison-block__model p {
  margin-top: 5px;
  color: #6c7f95;
  font-size: 0.88rem;
}

.model-call-comparison-block__model dl {
  display: grid;
  gap: 8px;
  margin: 14px 0 0;
}

.model-call-comparison-block__model div {
  display: grid;
  gap: 2px;
}

.model-call-comparison-block__model dt {
  color: #8798ab;
  font-size: 0.76rem;
  font-weight: 800;
}

.model-call-comparison-block__model dd {
  margin: 0;
  color: #22364f;
  font-size: 0.88rem;
  line-height: 1.35;
}

.model-call-comparison-block__table-wrap {
  margin: 0 24px;
  overflow-x: auto;
  border: 1px solid #d9e5ef;
  border-radius: 14px;
  background: #fff;
}

.model-call-comparison-block table {
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: 0.86rem;
}

.model-call-comparison-block th,
.model-call-comparison-block td {
  padding: 11px 13px;
  border-bottom: 1px solid #e4edf4;
  text-align: left;
  vertical-align: top;
}

.model-call-comparison-block th {
  color: #71839a;
  font-weight: 900;
  background: #f5f9fc;
}

.model-call-comparison-block tbody tr:last-child td {
  border-bottom: 0;
}

.model-call-comparison-block__agreement {
  display: inline-flex;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 0.75rem;
  font-weight: 900;
}

.model-call-comparison-block__agreement--agree {
  background: #dff7ea;
  color: #107647;
}

.model-call-comparison-block__agreement--partial {
  background: #fff1c7;
  color: #916006;
}

.model-call-comparison-block__agreement--disagree {
  background: #ffe1df;
  color: #b42318;
}

.model-call-comparison-block__footer {
  display: grid;
  gap: 8px;
  padding: 18px 24px;
}

.model-call-comparison-block__footer p {
  color: #10213a;
  font-weight: 750;
  line-height: 1.45;
}

.model-call-comparison-block__footer span {
  color: #6c7f95;
  font-size: 0.9rem;
}

.model-call-comparison-block__artifacts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 24px 22px;
}

.model-call-comparison-block__artifacts span {
  border-radius: 999px;
  background: #eaf7fb;
  color: #08728b;
  padding: 6px 10px;
  font-size: 0.76rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .model-call-comparison-block__models {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 3: Run the focused render test**

Run:

```bash
npx vitest run src/components/ConversationBlocks.test.tsx --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

## Task 3: Target-X Discovery Transcript And Run Inspector

**Files:**
- Modify: `src/data/antibodyTargetXMockData.ts`
- Modify: `src/data/antibodyTargetXMockData.test.ts`

- [ ] **Step 1: Add tests for model calls in Target-X discovery**

Add assertions to `src/data/antibodyTargetXMockData.test.ts`:

```ts
it('adds xTrimo and open-source model call comparisons to the discovery thread', () => {
  const blocks = getBlocks('targetx-antibody-discovery')
  const modelBlocks = blocks.filter((block) => block.type === 'modelCallComparison')

  expect(modelBlocks.length).toBeGreaterThanOrEqual(5)
  expect(modelBlocks.map((block) => block.primaryModel.name)).toEqual(
    expect.arrayContaining([
      'xTrimoFold',
      'xTrimoAbFold',
      'xTrimoAbAgDock',
      'xTrimoAbGen',
      'xTrimoAbAggregation',
    ]),
  )
  expect(modelBlocks.map((block) => block.comparatorModel.provider)).toEqual(
    expect.arrayContaining(['Open-source']),
  )
  expect(JSON.stringify(modelBlocks)).toContain('wet-lab validation')
})

it('tracks Target-X model workbench outputs in the run inspector', () => {
  const thread = getAntibodyThread('targetx-antibody-discovery')
  const progressTitles = thread.runInspector?.progress.map((item) => item.title) ?? []
  const outputNames = thread.runInspector?.outputs.map((output) => output.name) ?? []

  expect(progressTitles).toEqual(
    expect.arrayContaining([
      '模型输入包',
      '抗原结构交叉校验',
      'Fv 结构交叉校验',
      'Docking 与表位一致性',
      '候选生成模型对照',
      '可开发性模型栈',
      '模型共识矩阵',
    ]),
  )
  expect(outputNames).toEqual(
    expect.arrayContaining([
      'TargetX_model_input_batch.json',
      'TargetX_model_consensus_matrix.csv',
      'TargetX_model_call_audit.json',
      'TargetX_candidate_model_decision_log.md',
    ]),
  )
})
```

- [ ] **Step 2: Run the Target-X data test and confirm failure**

Run:

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: fails because no `modelCallComparison` blocks or model outputs exist yet.

- [ ] **Step 3: Add helper for model comparison blocks**

In `src/data/antibodyTargetXMockData.ts`, add:

```ts
function modelCallComparison(
  block: Omit<Extract<ConversationBlock, { type: 'modelCallComparison' }>, 'type'>,
): Extract<ConversationBlock, { type: 'modelCallComparison' }> {
  return {
    type: 'modelCallComparison',
    ...block,
  }
}
```

- [ ] **Step 4: Insert model workbench turns**

Insert these turns after the current epitope hypothesis generation and before broad candidate pool generation. Use the next available sequential indexes and keep IDs unique:

```ts
turn('targetx-discovery', 32, 'mainAgent', '## Model Workbench · 生物大模型调用与对照\n\n我现在进入模型工作台。这里不会让任何模型直接决定候选，只做排序、风险识别和分歧定位。xTrimo 作为主模型能力，开源模型作为 sanity check；两边冲突时，候选会降级或进入人工复核。'),
turn('targetx-discovery', 33, 'mainAgent', '我先把模型输入包拆出来，不把文件本身当输入，而是拆成 Target-X ECD、D1/D2/D3 边界、Ag-01/Ag-02 构建、E1/E2/E3 假设、VH/VL 候选元数据和 FTO 禁止区域。', [
  capabilityRun(
    'ModelInputCompiler.prepareTargetXModelBatch',
    '生成 Target-X 模型调用输入包',
    { target: 'Target-X', candidateMetadata: 4380, epitopeHypotheses: 3 },
    { modelBatch: 'TargetX_model_input_batch.json', modelReadyObjects: 7, humanConstraints: 4 },
    [{ name: 'TargetX_model_input_batch.json', kind: 'json', description: '模型调用输入对象、字段映射和人工边界。' }],
    '12.8s',
  ),
]),
turn('targetx-discovery', 34, 'mainAgent', '第一组模型校验是抗原结构。xTrimoFold 用于 Target-X ECD 结构主判断，ESMFold 作为开源对照。我只看 D2/D3 interface 是否稳定暴露，不把它当功能阻断证明。', [
  modelCallComparison({
    title: 'Antigen structure cross-check',
    subtitle: 'xTrimoFold v2.0 × ESMFold',
    primaryModel: {
      name: 'xTrimoFold',
      provider: 'BioMap xTrimo',
      version: 'v2.0',
      purpose: 'Target-X full ECD and D2/D3 construct structure support',
      inputSummary: 'Ag-01 full ECD, Ag-02 D2/D3, domain boundaries',
      outputSummary: 'Domain confidence, interface exposure, low-confidence loops',
      status: 'success',
    },
    comparatorModel: {
      name: 'ESMFold',
      provider: 'Open-source',
      version: 'mock-2026.06',
      purpose: 'Independent antigen fold sanity check',
      inputSummary: 'Same Target-X ECD and D2/D3 sequences',
      outputSummary: 'Fold confidence and local disorder flags',
      status: 'success',
    },
    metrics: [
      { metric: 'D2/D3 boundary', primaryValue: 'consistent', comparatorValue: 'consistent', agreement: 'agree', interpretation: 'keep E1 as primary hypothesis' },
      { metric: 'Interface exposure', primaryValue: 'exposed', comparatorValue: 'partly exposed', agreement: 'partial', interpretation: 'require full-ECD validation' },
      { metric: 'Ag-02 local fold', primaryValue: 'usable', comparatorValue: 'loop uncertainty', agreement: 'partial', interpretation: 'do not use Ag-02 as sole screen' },
    ],
    decision: 'review',
    decisionText: 'D2/D3 remains usable as a model-supported hypothesis, but Ag-01 full ECD must stay in R1 validation.',
    riskNote: 'Model evidence only; wet-lab validation remains required.',
    artifacts: [
      { name: 'TargetX_xtrimo_fold_antigen.json', kind: 'json' },
      { name: 'TargetX_esmfold_antigen_crosscheck.json', kind: 'json' },
    ],
  }),
])
```

Add similar turns for:

1. `Fv structure cross-check`: `xTrimoAbFold` × `IgFold`, decision `backup`.
2. `Docking and epitope consistency`: `xTrimoAbAgDock` × `HADDOCK`, decision `primary`.
3. `Candidate generation plausibility`: `xTrimoAbGen` × `IgLM`, decision `review`.
4. `Developability model stack`: `xTrimoAbAggregation` × `Thera-SAbDab Rules`, decision `backup`.
5. `Specificity/FTO model gate`: `xTrimoAbSpecificity + xTrimoAbPatentability` × `ANARCI/OAS annotation`, decision `reject`.

Each card must include `wet-lab validation` in `riskNote` and at least one metric where `agreement` is `partial` or `disagree`.

- [ ] **Step 5: Update candidate rationale turns**

Update the later ABX-014 / ABX-027 / ABX-033 / ABX-041 rationale text so it references model agreement:

- ABX-014: xTrimoAbFold/IgFold agree and xTrimoAbAgDock/HADDOCK both support E1 contact.
- ABX-027: model agreement is enough for primary but less direct than ABX-014.
- ABX-041: downgrade because CDRH3 and FTO risks disagree/stack.
- ABX-052: backup or review because VH/VL packing and homolog specificity are not clean.

- [ ] **Step 6: Update run inspector arrays**

In `discoveryCapabilityRuns`, add records for:

- `targetx-discovery-run-model-input`
- `targetx-discovery-run-antigen-structure`
- `targetx-discovery-run-fv-crosscheck`
- `targetx-discovery-run-docking-crosscheck`
- `targetx-discovery-run-generation-plausibility`
- `targetx-discovery-run-developability-stack`
- `targetx-discovery-run-model-consensus`

In the `runInspector` call for discovery, ensure progress titles include:

- `模型输入包`
- `抗原结构交叉校验`
- `Fv 结构交叉校验`
- `Docking 与表位一致性`
- `候选生成模型对照`
- `可开发性模型栈`
- `模型共识矩阵`

Add outputs:

- `TargetX_model_input_batch.json`
- `TargetX_model_consensus_matrix.csv`
- `TargetX_model_call_audit.json`
- `TargetX_candidate_model_decision_log.md`

- [ ] **Step 7: Run data tests**

Run:

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

## Task 4: Side Window Model Artifacts

**Files:**
- Modify: `src/data/workspaceSideWindowMockData.ts`
- Modify: `src/data/antibodyTargetXMockData.test.ts`

- [ ] **Step 1: Add side-window file expectations**

In `src/data/antibodyTargetXMockData.test.ts`, extend the existing discovery assets test to expect:

```ts
'TargetX_model_input_batch.json',
'TargetX_xtrimo_abfold_results.json',
'TargetX_igfold_crosscheck.json',
'TargetX_xtrimo_abagdock_results.json',
'TargetX_haddock_crosscheck.json',
'TargetX_abgen_candidate_batch.json',
'TargetX_iglm_plausibility_check.csv',
'TargetX_model_consensus_matrix.csv',
'TargetX_model_call_audit.json',
'TargetX_candidate_model_decision_log.md',
```

- [ ] **Step 2: Run the side-window related test and confirm failure**

Run:

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: fails because the files are not registered.

- [ ] **Step 3: Add mock file records**

In `src/data/workspaceSideWindowMockData.ts`, add model files to `targetXDiscoveryFiles` under a model-workbench folder such as:

`Antibody Optimization/Target-X Discovery/model_workbench`

Each file should have realistic `content` for previewable JSON/CSV/MD records. Keep examples concise but specific:

- `TargetX_model_input_batch.json`: target, constructs, candidate ids, constraints.
- `TargetX_xtrimo_abfold_results.json`: Fv confidence and ABX decisions.
- `TargetX_igfold_crosscheck.json`: open-source sanity check flags.
- `TargetX_xtrimo_abagdock_results.json`: E1/E2/E3 contact evidence.
- `TargetX_haddock_crosscheck.json`: docking comparator results.
- `TargetX_abgen_candidate_batch.json`: generated candidate families.
- `TargetX_iglm_plausibility_check.csv`: candidate, naturalness, diversity, notes.
- `TargetX_model_consensus_matrix.csv`: candidate, xTrimo agreement, open-source agreement, decision.
- `TargetX_model_call_audit.json`: model names, versions, inputs, outputs, no-real-api-call marker.
- `TargetX_candidate_model_decision_log.md`: readable summary of selected/downgraded/rejected candidates.

- [ ] **Step 4: Run data tests**

Run:

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

## Task 5: Full Verification And Commit

**Files:**
- All files modified by prior tasks.

- [ ] **Step 1: Run component and Target-X tests**

Run:

```bash
npx vitest run src/components/ConversationBlocks.test.tsx src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npx vitest run --maxWorkers=1 --no-file-parallelism
```

Expected: PASS.

- [ ] **Step 3: Run lint**

Run:

```bash
npm run lint
```

Expected: PASS with no ESLint errors.

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS. Existing Vite chunk size warnings are acceptable.

- [ ] **Step 5: Optional visual check**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1 --port 5179 --strictPort
```

Open the Target-X discovery Thread and verify:

- `Model Workbench · 生物大模型调用与对照` appears.
- Model comparison cards render with dense structured information.
- The card does not overflow horizontally at desktop width.
- No EGFR visuals or text appear in the Target-X discovery main transcript.

- [ ] **Step 6: Commit**

Run:

```bash
git status --short
git add src/data/conversationTypes.ts src/components/ConversationBlocks.tsx src/components/ConversationBlocks.test.tsx src/App.css src/data/antibodyTargetXMockData.ts src/data/antibodyTargetXMockData.test.ts src/data/workspaceSideWindowMockData.ts docs/superpowers/plans/2026-06-13-targetx-model-call-chain-implementation.md
git commit -m "feat: add Target-X model call chain mock"
```

Expected: one feature commit on `codex/targetx-model-call-chain`.

## Self-Review Checklist

- Spec coverage: Tasks cover new block type, xTrimo/open-source comparisons, Thread insertion, run inspector, side-window files, and tests.
- Placeholder scan: no TBD/TODO placeholders are present.
- Scope: only `targetx-antibody-discovery` is changed; LIMS and model fine-tune Threads are out of scope.
- Type consistency: `modelCallComparison`, `primaryModel`, `comparatorModel`, `metrics`, and `decision` names are consistent across type, component, tests, and mock data.
