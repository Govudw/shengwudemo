# EGFR Agentic Workflow Replay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Replace the EGFR mock conversation with a 19-turn agentic workflow replay using Capability Run Replay, Human Confirmation, Approval Request Replay, Elapsed Work Replay, and 8 Scientific Figures.

**Architecture:** Keep the existing Thread Transcript model and add new conversation block variants alongside the old variants for compatibility. EGFR seed data uses only the new block variants, while old block renderers remain for untouched threads. Generated scientific figures live under `src/assets/mock-science/egfr/` and are imported by `mockData.ts`.

**Tech Stack:** Vite, React, TypeScript, Zustand persist seed data, Vitest, CSS modules via `src/App.css`, built-in imagegen for bitmap assets.

---

### Task 1: Types, Store Tests, And Header State

**Files:**
- Modify: `src/data/conversationTypes.ts`
- Modify: `src/store/demoStoreLogic.ts`
- Modify: `src/store/demoStoreLogic.test.ts`
- Modify: `src/components/ThreadWorkspace.tsx`

- [x] **Step 1: Write failing tests for the new EGFR replay contract**

Add tests in `src/store/demoStoreLogic.test.ts` that assert:

```ts
it('seeds the EGFR agentic workflow replay with canonical block types', () => {
  const state = createInitialDemoState(seedProjects, now)
  const egfrThread = findThreadById(state.projects, 'egfr-affinity')?.thread
  const blocks = egfrThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []

  expect(egfrThread?.transcript).toHaveLength(19)
  expect(blocks.filter((block) => block.type === 'capabilityRunReplay')).toHaveLength(11)
  expect(blocks.filter((block) => block.type === 'humanConfirmation')).toHaveLength(1)
  expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(1)
  expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(1)
  expect(blocks.filter((block) => block.type === 'scientificFigure')).toHaveLength(8)
  expect(blocks.some((block) => block.type === 'visualEvidence')).toBe(false)
  expect(blocks.some((block) => block.type === 'approvalGatePreview')).toBe(false)
})
```

Update the existing selected Thread acknowledgement test to expect:

```ts
'已记录到当前对话。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。'
```

- [x] **Step 2: Run the targeted test and confirm it fails**

Run: `npm test -- --run src/store/demoStoreLogic.test.ts`

Expected: FAIL because EGFR still has 9 turns and old block types, and acknowledgement still says `Thread`.

- [x] **Step 3: Add new conversation block types**

Extend `src/data/conversationTypes.ts` with:

```ts
export type ConversationBlock =
  | ProjectFileBlock
  | MainAgentProgressBlock
  | CommandPreviewBlock
  | VisualEvidenceBlock
  | CandidateMoleculeTableBlock
  | ExperimentOrderDraftBlock
  | ApprovalGatePreviewBlock
  | CapabilityRunReplayBlock
  | HumanConfirmationBlock
  | ApprovalRequestReplayBlock
  | ElapsedWorkReplayBlock
  | ScientificFigureBlock
```

Define the new block types exactly as named in the spec.

- [x] **Step 4: Remove visible Thread wording from follow-up acknowledgement**

Change `selectedThreadAcknowledgement` in `src/store/demoStoreLogic.ts` to:

```ts
const selectedThreadAcknowledgement =
  '已记录到当前对话。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。'
```

- [x] **Step 5: Update Thread stage label logic**

Change `getThreadStageLabel` in `src/components/ThreadWorkspace.tsx` so EGFR with `approvalRequestReplay`, `elapsedWorkReplay`, and `ProjectFile.save` reports:

```ts
return '已完成干湿闭环 · 1 次确认 · 1 次审批'
```

Other non-empty conversations can still return `Mock 对话已生成`.

- [x] **Step 6: Run targeted test and confirm it still fails only on seed data**

Run: `npm test -- --run src/store/demoStoreLogic.test.ts`

Expected: FAIL until Task 3 replaces EGFR seed data.

### Task 2: Markdown Tables And New Block Renderers

**Files:**
- Modify: `src/components/ConversationTranscript.tsx`
- Modify: `src/components/ConversationBlocks.tsx`
- Modify: `src/App.css`

- [x] **Step 1: Add Markdown table support**

Extend `MarkdownSegment` with:

```ts
| { type: 'table'; headers: string[]; alignments: Array<'left' | 'right' | 'center'>; rows: string[][] }
```

Parse GitHub-style tables by detecting a header line followed by a separator line like `| --- | ---: |`. Render a `<table className="conversation-markdown-table">`.

- [x] **Step 2: Add renderers for new block types**

In `ConversationBlocks.tsx`, add cases for:

- `capabilityRunReplay`: render `<details className="capability-run-block">` with `open={false}` omitted so default is collapsed.
- `humanConfirmation`: render a non-collapsed lightweight event block.
- `approvalRequestReplay`: render a non-collapsed lightweight approved event block.
- `elapsedWorkReplay`: render a non-collapsed elapsed work event block.
- `scientificFigure`: render an image when `src` exists; fallback to JSON placeholder when it does not.

- [x] **Step 3: Add CSS for the new transcript components**

Add CSS classes:

- `.conversation-markdown-table`
- `.capability-run-block`
- `.capability-run-block__summary`
- `.capability-run-block__details`
- `.event-replay-block`
- `.event-replay-block--confirmation`
- `.event-replay-block--approval`
- `.event-replay-block--elapsed`
- `.scientific-figure-block`

Keep the visual language compact, gray, and log-like.

- [x] **Step 4: Run targeted tests**

Run: `npm test -- --run src/store/demoStoreLogic.test.ts`

Expected: same seed-data failure until Task 3, no TypeScript compile errors.

### Task 3: EGFR 19-Turn Seed Data

**Files:**
- Modify: `src/data/mockData.ts`

- [x] **Step 1: Import scientific figure assets**

At the top of `mockData.ts`, import:

```ts
import egfrAntibodyAntigenComplex from '../assets/mock-science/egfr/egfr-antibody-antigen-complex.png'
...
```

Use all 8 assets listed in the spec.

- [x] **Step 2: Replace `egfrAffinityTranscript`**

Replace the current 9-turn transcript with the 19-turn transcript from the spec. Use only:

- `projectFile`
- `capabilityRunReplay`
- `humanConfirmation`
- `approvalRequestReplay`
- `elapsedWorkReplay`
- `scientificFigure`

- [x] **Step 3: Ensure counts match the test**

The final transcript must have:

- 19 `ConversationTurn`s
- 11 `capabilityRunReplay` blocks
- 1 `humanConfirmation`
- 1 `approvalRequestReplay`
- 1 `elapsedWorkReplay`
- 8 `scientificFigure`

- [x] **Step 4: Run targeted tests**

Run: `npm test -- --run src/store/demoStoreLogic.test.ts`

Expected: PASS.

### Task 4: Scientific Figure Assets, Build, And Browser Verification

**Files:**
- Create: `src/assets/mock-science/egfr/*.png`

- [x] **Step 1: Generate 8 imagegen assets**

Use the prompts from the spec and save final PNGs under:

```text
src/assets/mock-science/egfr/
```

- [x] **Step 2: Run full verification**

Run:

```bash
npm run lint
npm test -- --run
npm run build
```

Expected: all pass.

- [x] **Step 3: Restart or confirm the Vite dev server**

Run or reuse:

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

- [x] **Step 4: Browser verification**

Use Browser/Playwright against `http://localhost:5173/`:

- open the app
- click `EGFR 抗体亲和力优化`
- verify header contains `19 轮对话` and `1 次确认 · 1 次审批`
- verify no visible `Main Agent`
- verify no visible old BioMap OS `visualEvidence`
- verify there are 8 scientific figure images
- verify Capability Run Replay blocks are collapsed and can expand
- verify scrolling works in the conversation

- [x] **Step 5: Final file-state report**

Because `/Users/songxuzhengjun/Documents/BioMapAgent` is not a git repository, do not attempt commit. Report changed files and verification results.
