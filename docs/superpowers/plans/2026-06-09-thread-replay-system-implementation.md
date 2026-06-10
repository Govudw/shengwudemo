# Thread Replay System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a view-only Replay mode for Workspace Threads that replays transcript content and Run Inspector state without mutating persisted data.

**Architecture:** Add pure replay helpers that derive replay steps, partial transcripts, and partial Run Inspector state from the existing seed data. Keep playback state in `ThreadWorkspace`, pass derived data into `ConversationTranscript`, `RunInspector`, and `ThreadComposer`, and keep block rendering unchanged except for replay highlight metadata.

**Tech Stack:** React, TypeScript, Zustand-backed existing store, Vitest + Testing Library, CSS in `src/App.css`.

---

## File Map

- Create `src/components/threadReplay.ts`: pure replay step builder and derived-state helpers.
- Create `src/components/threadReplay.test.ts`: unit tests for replay step and Run Inspector derivation.
- Modify `src/components/ConversationTranscript.tsx`: accept replay step metadata and render partial markdown segments/blocks.
- Modify `src/components/ConversationBlocks.tsx`: accept active block id and add a highlight wrapper/class without changing block internals.
- Modify `src/components/ThreadWorkspace.tsx`: add Replay button, timer lifecycle, side-window/run-inspector coordination, composer disabled state, and auto-scroll.
- Modify `src/components/ThreadComposer.tsx`: accept `disabled` and `placeholder` props.
- Modify `src/components/ThreadWorkspace.test.tsx`: component coverage for Replay start, finish, Run Inspector opening, side-window closing, and disabled composer.
- Modify `src/App.css`: Replay button, current-step animation, disabled composer, and visual states.

## Task 1: Pure Replay Model

**Files:**
- Create: `src/components/threadReplay.ts`
- Create: `src/components/threadReplay.test.ts`

- [ ] **Step 1: Write failing tests for replay step generation**

Add tests that build steps from a turn containing two paragraphs and two blocks. Assert that markdown segments and blocks become stable sequential steps and preserve turn role/id.

Run:

```bash
npx vitest run src/components/threadReplay.test.ts
```

Expected: FAIL because `buildThreadReplaySteps` does not exist.

- [ ] **Step 2: Implement minimal replay step builder**

Implement:

```ts
export type ThreadReplayStep =
  | { id: string; turnId: string; role: ConversationRole; kind: 'markdown'; markdownSegmentIndex: number }
  | { id: string; turnId: string; role: ConversationRole; kind: 'block'; blockIndex: number; block: ConversationBlock }

export function buildThreadReplaySteps(turns: ConversationTurn[]): ThreadReplayStep[]
```

Split markdown by display segment boundaries using the same parser behavior as `ConversationTranscript`. Export the parser or move it into this helper if needed so tests and UI share the same segmentation.

- [ ] **Step 3: Write failing tests for partial transcript derivation**

Assert `deriveReplayTranscript(turns, steps, visibleCount)` returns:

- no turns at `0`;
- a turn with only first markdown segment at `1`;
- a turn with partial blocks when block steps are visible;
- full transcript when `visibleCount >= steps.length`.

Expected: FAIL because `deriveReplayTranscript` does not exist.

- [ ] **Step 4: Implement partial transcript derivation**

Implement:

```ts
export function deriveReplayTranscript(
  turns: ConversationTurn[],
  steps: ThreadReplayStep[],
  visibleCount: number,
): ConversationTurn[]
```

Use existing turn IDs. For partial markdown, rebuild markdown text from visible parsed segments. Preserve block object identity for visible blocks.

- [ ] **Step 5: Write failing tests for Run Inspector derivation**

Use a small `RunInspectorData` fixture and steps with:

- `capabilityRunReplay` command name;
- `projectFile` file name;
- `approvalGateCard` or `approvalRequestReplay`;
- `pipelineDag` with completed nodes.

Assert the partial inspector shows matching capability/output/approval/progress and running summary. Assert final visible count returns the original full inspector.

Expected: FAIL because `deriveReplayRunInspector` does not exist.

- [ ] **Step 6: Implement Run Inspector derivation**

Implement:

```ts
export function deriveReplayRunInspector(
  fullInspector: RunInspectorData | undefined,
  steps: ThreadReplayStep[],
  visibleCount: number,
): RunInspectorData | undefined
```

Use left transcript steps as the master clock. Match outputs by `ProjectFileBlock.fileName`, capability runs by `commandName`, approvals by title/type/known block metadata, and progress by `PipelineDagBlock.completedNodeIds` where possible. Keep the result valid even when no matches exist.

- [ ] **Step 7: Verify tests pass**

Run:

```bash
npx vitest run src/components/threadReplay.test.ts
```

Expected: PASS.

## Task 2: Transcript And Block Replay Rendering

**Files:**
- Modify: `src/components/ConversationTranscript.tsx`
- Modify: `src/components/ConversationBlocks.tsx`
- Test: `src/components/threadReplay.test.ts`

- [ ] **Step 1: Write failing tests for markdown segment rendering support**

Add or update tests to prove partial transcript markdown segments render as normal markdown: paragraphs, lists, tables, and code blocks remain valid.

Run:

```bash
npx vitest run src/components/threadReplay.test.ts
```

Expected: FAIL until shared markdown segment serialization exists.

- [ ] **Step 2: Refactor markdown parsing into replay helper**

Move or export the markdown parsing/serialization helpers so `ConversationTranscript` and `threadReplay.ts` share one segmentation model. Do not change current full transcript rendering.

- [ ] **Step 3: Add replay highlight metadata**

Update `ConversationTranscript` props:

```ts
activeReplayStepId?: string | null
```

Render markdown segments and content blocks with a class for the active step. For blocks, pass `activeReplayBlockStepId` into `ConversationBlocks`.

- [ ] **Step 4: Verify current transcript tests still pass**

Run:

```bash
npx vitest run src/components/ThreadWorkspace.test.tsx src/components/threadReplay.test.ts
```

Expected: PASS.

## Task 3: ThreadWorkspace Replay Integration

**Files:**
- Modify: `src/components/ThreadWorkspace.tsx`
- Modify: `src/components/ThreadComposer.tsx`
- Test: `src/components/ThreadWorkspace.test.tsx`

- [ ] **Step 1: Write failing component tests**

Add tests for:

- Replay button is visible for a seeded Thread and disabled for an empty/new Thread.
- Clicking Replay opens Run Inspector and closes side window if it was open.
- First replay render starts with an empty transcript or only the first revealed step after timer advance.
- Clicking Replay again finishes and shows the full transcript.
- Composer is disabled while replaying.

Use fake timers for the 2 second cadence.

Run:

```bash
npx vitest run src/components/ThreadWorkspace.test.tsx -t "Replay"
```

Expected: FAIL because the UI is not implemented.

- [ ] **Step 2: Add ThreadComposer disabled support**

Add optional props:

```ts
disabled?: boolean
placeholder?: string
```

Use `disabled` on the textarea/input and submit controls. Preserve existing placeholder when not provided.

- [ ] **Step 3: Add Replay state to ThreadWorkspace**

Add local state:

- `replayActive`;
- `visibleReplayStepCount`;
- timer ref;
- user-scroll-follow flag if needed.

Use `buildThreadReplaySteps`, `deriveReplayTranscript`, and `deriveReplayRunInspector`.

- [ ] **Step 4: Implement Replay button behavior**

Idle click:

- close side window through the existing close path;
- open Run Inspector;
- set `visibleReplayStepCount` to `0`;
- start 2 second interval.

Playing click:

- clear timer;
- set `visibleReplayStepCount` to `steps.length`;
- return button to idle state after full derived view is displayed.

Thread/project changes:

- clear timer;
- reset replay state.

- [ ] **Step 5: Verify component tests pass**

Run:

```bash
npx vitest run src/components/ThreadWorkspace.test.tsx -t "Replay"
```

Expected: PASS.

## Task 4: Styling And Full Verification

**Files:**
- Modify: `src/App.css`
- Modify: `src/components/ThreadWorkspace.test.tsx` if selectors need final adjustment.

- [ ] **Step 1: Add Replay visual styling**

Add styles for:

- header Replay button idle/playing/disabled;
- progress pill;
- active replay step highlight;
- fade/slide reveal animation;
- disabled composer state.

Keep palette aligned with existing BioMap Agent UI: restrained blue/cyan, no large gradients.

- [ ] **Step 2: Verify full test suite**

Run:

```bash
npm test -- --run
```

Expected: PASS.

- [ ] **Step 3: Verify lint and build**

Run:

```bash
npm run lint
npm run build
```

Expected: PASS. Existing Vite chunk-size warnings are acceptable.

- [ ] **Step 4: Manual localhost check**

Start or reuse:

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

Open `http://127.0.0.1:5174/`, select `Pipeline Build / LIMS 酶合成执行编排`, click Replay, observe step playback and Run Inspector updates, click Finish Replay, and confirm the full Thread returns.

## Self-Review Checklist

- Spec coverage: Replay button, 2-second steps, Run Inspector sync, side-window closure, composer disabled, finish behavior, no persistence.
- No task writes replay state to Zustand or localStorage.
- No task changes seed mock data.
- Tests cover pure logic and component behavior.
- Implementation remains view-only and works for all seeded Threads with transcript content.
