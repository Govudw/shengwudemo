# EGFR Thread Mock Conversation Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Agent homepage demo into an interactive first Thread detail prototype for `EGFR 抗体亲和力优化`: clicking that Thread opens a scrollable transcript with realistic BioMap OS-derived visual evidence, project files, command previews, candidate molecules, and an experiment order draft. New Thread mode keeps the current homepage. Other Threads open an empty Thread detail state.

**Architecture:** Keep seeded mock content in `src/data/mockData.ts`, store runtime mutable Thread state in the existing Zustand logic, and render Thread detail through dedicated conversation components. Treat screenshots as mock/source-derived assets under `src/assets/mock-biomap-os/`, separate from brand and UI assets. Use the `CONTEXT.md` terms: Thread Transcript, Main Agent, Capability Command, Visual Evidence, Project File, Experiment Order Draft, Approval Gate Preview.

**Tech Stack:** Vite + React + TypeScript, Zustand persist, Vitest/Testing Library, lucide-like local SVG icons, CSS modules via `src/App.css`, optional `react-markdown` for safe Markdown rendering, Swift PDFKit one-off asset extraction script for local BioMap OS manual screenshots, Chrome Use for final browser verification.

---

## Source References

- Spec: `docs/superpowers/specs/2026-05-28-egfr-thread-mock-conversation-design.md`
- Domain terms: `CONTEXT.md`
- Existing seed data: `src/data/mockData.ts`
- Existing store logic: `src/store/demoStoreLogic.ts`
- Persist wrapper: `src/store/useDemoStore.ts`
- Homepage composition: `src/App.tsx`
- Existing composer: `src/components/Composer.tsx`
- Visual source manuals:
  - `/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/蛋白设计-用户手册.pdf`
  - `/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/智能实验-用户手册.pdf`

---

## Phase 1: Type And Store Tests First

- [ ] Add focused tests in `src/store/demoStoreLogic.test.ts` before implementation.

  Cover these cases:

  1. Initial demo projects preserve the seeded EGFR Thread Transcript.
  2. Selecting `egfr-affinity` exposes transcript turns and keeps New Thread Draft unselected.
  3. Submitting from a selected Thread appends a right-side user turn and a Main Agent acknowledgement turn, updates `lastActivityAt`, moves the Thread to the top of its Project, and does not set a toast/status message.
  4. Creating a new Thread from New Thread Draft creates an empty `transcript: []` Thread and may keep the existing creation status behavior.
  5. Delete/archive/rename/pin paths preserve existing transcript data for untouched Threads.

- [ ] Expected failing assertions before implementation:

  ```ts
  expect(egfrThread?.transcript?.length).toBeGreaterThan(0)
  expect(result.statusMessage).toBe('')
  expect(updatedThread.transcript.at(-2)).toMatchObject({ role: 'user', markdown: draftText })
  expect(updatedThread.transcript.at(-1)?.role).toBe('mainAgent')
  ```

- [ ] Keep the tests at store-logic level; do not add browser or DOM tests for this phase.

## Phase 2: Conversation Data Types

- [ ] Create `src/data/conversationTypes.ts`.

  Use discriminated unions so mock data and render components stay aligned:

  ```ts
  export type ConversationRole = 'user' | 'mainAgent'

  export type ConversationTurn = {
    id: string
    role: ConversationRole
    markdown?: string
    contentBlocks?: ConversationBlock[]
  }

  export type ConversationBlock =
    | ProjectFileBlock
    | MainAgentProgressBlock
    | CommandPreviewBlock
    | VisualEvidenceBlock
    | CandidateMoleculeTableBlock
    | ExperimentOrderDraftBlock
    | ApprovalGatePreviewBlock

  export type ProjectFileBlock = {
    type: 'projectFile'
    fileName: string
    fileKind: 'pdf' | 'xlsx' | 'csv' | 'png' | 'fasta' | 'pdb'
    location: string
    note: string
  }

  export type MainAgentProgressBlock = {
    type: 'mainAgentProgress'
    title: string
    steps: Array<{ label: string; state: 'done' | 'active' | 'queued' }>
  }

  export type CommandPreviewBlock = {
    type: 'commandPreview'
    commandName: string
    description: string
    parameters: Array<{ label: string; value: string }>
  }

  export type VisualEvidenceBlock = {
    type: 'visualEvidence'
    title: string
    imageSrc: string
    caption: string
  }

  export type CandidateMoleculeTableBlock = {
    type: 'candidateMoleculeTable'
    title: string
    rows: Array<{
      id: string
      mutation: string
      predictedKd: string
      risk: 'low' | 'medium' | 'high'
      rationale: string
    }>
  }

  export type ExperimentOrderDraftBlock = {
    type: 'experimentOrderDraft'
    title: string
    orderId: string
    status: 'draft' | 'submitted'
    items: Array<{ label: string; value: string }>
  }

  export type ApprovalGatePreviewBlock = {
    type: 'approvalGatePreview'
    title: string
    description: string
    approvalType: 'experimentOrder' | 'dataPublish' | 'modelRelease'
  }
  ```

- [ ] Update `src/data/mockData.ts` `Thread` type to include `transcript?: ConversationTurn[]`.

- [ ] Update `src/store/demoStoreLogic.ts` `DemoThread` type to include `transcript: ConversationTurn[]`.

## Phase 3: Mock BioMap OS Assets

- [ ] Create a dedicated folder:

  ```bash
  mkdir -p src/assets/mock-biomap-os
  ```

- [ ] Add a one-off extraction script at `scripts/extract-mock-biomap-assets.swift`.

  The script should render source PDF pages with PDFKit, crop fixed rectangles, and write PNG files. Keep all output names prefixed with `mock-`:

  | Output | Source PDF | 1-based page | Purpose |
  | --- | --- | ---: | --- |
  | `mock-protein-moo-results-overview.png` | 蛋白设计 | 19 | MOO candidate result overview |
  | `mock-protein-surface-coloring-detail.png` | 蛋白设计 | 21 | structure/surface visual evidence |
  | `mock-submit-to-wet-lab-menu.png` | 蛋白设计 | 25 | submit-to-wet-lab action evidence |
  | `mock-experiment-order-detail.png` | 智能实验 | 6 | experiment order detail |
  | `mock-cro-route-config.png` | 智能实验 | 11 | CRO/order route configuration |

- [ ] Use source-derived comments in the script so the asset origin is auditable:

  ```swift
  // Source-derived mock asset for BioMap Agent demo.
  // Do not use as product UI asset outside mock conversation examples.
  ```

- [ ] Run:

  ```bash
  swift scripts/extract-mock-biomap-assets.swift
  sips -g pixelWidth -g pixelHeight src/assets/mock-biomap-os/*.png
  ```

- [ ] Open at least two generated images with the local image viewer or Chrome to confirm the crop shows meaningful BioMap OS UI content, not blank margins.

## Phase 4: Seed EGFR Transcript

- [ ] In `src/data/mockData.ts`, import `ConversationTurn` and the mock asset URLs.

  Example:

  ```ts
  import type { ConversationTurn } from './conversationTypes'
  import proteinMooOverview from '../assets/mock-biomap-os/mock-protein-moo-results-overview.png'
  import proteinSurfaceDetail from '../assets/mock-biomap-os/mock-protein-surface-coloring-detail.png'
  import submitToWetLabMenu from '../assets/mock-biomap-os/mock-submit-to-wet-lab-menu.png'
  import experimentOrderDetail from '../assets/mock-biomap-os/mock-experiment-order-detail.png'
  import croRouteConfig from '../assets/mock-biomap-os/mock-cro-route-config.png'
  ```

- [ ] Add `egfrAffinityTranscript: ConversationTurn[]` near the Project seed data.

  Required content flow:

  1. User asks to improve EGFR antibody affinity and mentions uploaded files.
  2. Main Agent summarizes the received Project Files with a `projectFile` block.
  3. Main Agent shows a `mainAgentProgress` block for parsing sequence, checking structure, searching prior assays, and preparing optimization routes.
  4. Main Agent shows BioMap OS-derived `visualEvidence` for candidate/structure evidence.
  5. Main Agent shows a `candidateMoleculeTable` with 4 candidates.
  6. User asks to pick top candidates and create a wet-lab validation draft.
  7. Main Agent shows a `commandPreview` for `submit_to_wet_lab_validation`.
  8. Main Agent shows `experimentOrderDraft` and two more `visualEvidence` blocks for order detail and CRO route configuration.
  9. Main Agent shows `approvalGatePreview` explaining that submitting the experiment order needs approval.

- [ ] Attach the transcript only to:

  ```ts
  {
    id: 'egfr-affinity',
    title: 'EGFR 抗体亲和力优化',
    lastActivity: '2 分钟',
    transcript: egfrAffinityTranscript,
  }
  ```

- [ ] Leave every other seed Thread without `transcript` in `mockData.ts`; store conversion will normalize them to `[]`.

## Phase 5: Store Runtime Behavior And Persist V2

- [ ] In `src/store/demoStoreLogic.ts`, add a local clone helper:

  ```ts
  const cloneTranscript = (transcript?: ConversationTurn[]): ConversationTurn[] =>
    transcript ? structuredClone(transcript) : []
  ```

  If `structuredClone` causes test/runtime issues, replace with JSON clone because this data is plain JSON:

  ```ts
  const cloneTranscript = (transcript?: ConversationTurn[]): ConversationTurn[] =>
    transcript ? JSON.parse(JSON.stringify(transcript)) : []
  ```

- [ ] Update `createInitialDemoProjects` to copy `transcript: cloneTranscript(thread.transcript)`.

- [ ] Update `DemoThread` creation in the New Thread path to include `transcript: []`.

- [ ] Update selected Thread submit behavior:

  - Append a `user` turn using the draft text.
  - Append a simple `mainAgent` acknowledgement turn.
  - Update `lastActivityAt`.
  - Move the Thread to the top of its Project.
  - Clear draft.
  - Return `statusMessage: ''`.

  Main Agent acknowledgement text:

  ```md
  已记录到当前 Thread。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。
  ```

- [ ] Preserve transcript arrays when renaming, pinning, unpinning, archiving, deleting other Threads, and selecting Threads.

- [ ] In `src/store/useDemoStore.ts`, change persist storage to:

  ```ts
  name: 'biomap-agent-demo-store-v2',
  version: 2,
  ```

- [ ] Update `reset()` to remove `biomap-agent-demo-store-v2` and reload. The console API remains:

  ```js
  reset()
  ```

## Phase 6: Thread Detail Components

- [ ] Add `src/components/ThreadWorkspace.tsx`.

  Responsibilities:

  - Receives `thread`, `draft`, `onDraftChange`, `onSubmit`, `onNotify`.
  - Renders a Thread title header using `thread.title`.
  - Renders `ConversationTranscript` when `thread.transcript.length > 0`.
  - Renders an empty Thread detail state when no transcript exists:

    ```text
    这个 Thread 还没有 Mock 对话内容
    ```

  - Keeps the bottom composer fixed/sticky inside the main workspace, smaller than homepage composer.

- [ ] Add `src/components/ConversationTranscript.tsx`.

  Rendering rules:

  - User messages are compact right-side bubbles.
  - Main Agent messages render directly in the content column with no avatar and no outer message card.
  - Markdown supports paragraphs, bold, inline code, bullet lists, and fenced code blocks.
  - `contentBlocks` render directly below the Main Agent Markdown.
  - Transcript area owns the vertical scroll; the main window should not become the primary Thread scroll.

- [ ] Add `src/components/ConversationBlocks.tsx`.

  Block renderers:

  - `projectFile`: small file strip/card with file type, file name, location, note.
  - `mainAgentProgress`: compact checklist/timeline; done/active/queued states are visually distinct.
  - `commandPreview`: command-style panel with command name and parameter rows.
  - `visualEvidence`: source-derived screenshot with title and caption.
  - `candidateMoleculeTable`: dense table with mutation, predicted Kd, risk, rationale.
  - `experimentOrderDraft`: draft order summary with status pill and item rows.
  - `approvalGatePreview`: non-clicking preview of the Approval Gate; do not create a real notification or order.

- [ ] Add `src/components/ThreadComposer.tsx`.

  Behavior:

  - Placeholder: `继续推进这个 Thread...`
  - Submit calls existing `submitDraft`.
  - Upload/context button is clickable but mock-only.
  - If clicked, show inline status near composer:

    ```text
    附件上传会进入当前项目文件区。第一版 Demo 仅展示 Mock 附件。
    ```

  - Do not show toast for Thread submit.

## Phase 7: App Integration

- [ ] In `src/App.tsx`, derive selected Thread from projects:

  ```ts
  const selectedThread = projects
    .flatMap((project) => project.threads)
    .find((thread) => thread.id === selectedThreadId)
  ```

- [ ] Render modes:

  - `isDraftingNewThread === true`: keep current homepage (`Composer` + chips + use-case grid).
  - `selectedThread && !isDraftingNewThread`: render `ThreadWorkspace`.
  - no selected Thread fallback: homepage.

- [ ] When user clicks `新对话`, clear selected Thread highlight as already implemented and show homepage.

- [ ] When user clicks `egfr-affinity`, left Thread row becomes selected and right side changes to the EGFR Thread detail page.

- [ ] When user clicks any other Thread, right side changes to empty Thread detail state.

## Phase 8: Visual Styling

- [ ] Add Thread detail CSS in `src/App.css` without changing the approved homepage proportions.

  Required layout:

  - Top nav and left sidebar remain unchanged.
  - Thread detail content width aligns with the homepage central column.
  - Main Agent text is direct content, not inside a chat bubble/card.
  - User bubble sits right aligned, compact, with soft neutral background.
  - Embedded evidence images have a light border and 8px radius.
  - Candidate table is dense, readable, and not oversized.
  - Bottom Thread composer is visually smaller than homepage composer and stays near the bottom of the Thread workspace.

- [ ] Avoid adding decorative gradients, orbs, nested cards, or oversized marketing-style panels.

- [ ] Ensure all Chinese labels fit inside their containers at desktop width.

## Phase 9: Tests And Static Verification

- [ ] Run unit tests:

  ```bash
  npm test -- --run
  ```

- [ ] Run lint:

  ```bash
  npm run lint
  ```

- [ ] Run build:

  ```bash
  npm run build
  ```

- [ ] Fix all TypeScript, lint, and test failures before browser verification.

## Phase 10: Chrome Use Verification

- [ ] Start or reuse the Vite dev server at `http://localhost:5173`.

- [ ] Use Chrome Use, not only terminal output, to verify:

  1. `reset()` works from DevTools console and restores seed data.
  2. Homepage New Thread mode has no selected left Thread highlight.
  3. Clicking `EGFR 抗体亲和力优化` opens Thread detail.
  4. The transcript scrolls vertically.
  5. User messages appear as right-side bubbles.
  6. Main Agent messages appear as direct content without avatar and without an outer message card.
  7. Screenshot-derived BioMap OS evidence images render.
  8. Candidate table and experiment order draft render.
  9. Submitting a new message in the selected Thread appends user + Main Agent acknowledgement turns, moves Thread to project top, and shows no toast.
  10. Clicking another Thread shows the empty Thread detail state.
  11. New Thread mode still shows the original Agent homepage.

- [ ] Capture at least one desktop screenshot after EGFR Thread detail is open and inspect for obvious layout breaks.

## Phase 11: Final Review

- [ ] Run `git diff --stat` and inspect changed files.

- [ ] Confirm changed files are scoped to:

  - `src/data/*`
  - `src/store/*`
  - `src/components/*`
  - `src/App.tsx`
  - `src/App.css`
  - `src/assets/mock-biomap-os/*`
  - `scripts/extract-mock-biomap-assets.swift`
  - tests

- [ ] Final response should include:

  - What changed.
  - Verification commands and Chrome Use result.
  - Any remaining visual caveats if screenshot crops need a second pass.
