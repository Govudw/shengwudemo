# Target-X Antibody Discovery Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand `Target-X 阻断型抗体发现` into a 60+ turn research-style mock Thread with matching run inspector, side-window files, and Target-X-specific visuals.

**Architecture:** Keep the existing thread ID and rendering components. Move richer Target-X discovery content into `src/data/antibodyTargetXMockData.ts`, update object-storage seeds in `src/data/workspaceSideWindowMockData.ts`, and add tests that prevent regression to short transcript or EGFR assets.

**Tech Stack:** React, TypeScript, Vitest, existing conversation block schema, existing side-window file preview system, project-local PNG assets.

---

### Task 1: Lock Discovery Thread Requirements With Tests

**Files:**
- Modify: `src/data/antibodyTargetXMockData.test.ts`

- [ ] **Step 1: Add failing tests**

Add assertions that `targetx-antibody-discovery` has at least 60 turns, at least 12 human turns, no EGFR references in markdown/content blocks/run inspector, at least 3 chart or figure moments, at least 12 run inspector steps, and the expanded side-window file list.

- [ ] **Step 2: Run targeted test**

Run:

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts --maxWorkers=1 --no-file-parallelism
```

Expected: fail because the current thread has only 18 turns and uses EGFR assets.

### Task 2: Add Target-X-Specific Visual Assets

**Files:**
- Create directory: `src/assets/mock-science/targetx/`
- Create: `targetx-domain-epitope-map.png`
- Create: `targetx-evidence-network.png`
- Create: `targetx-candidate-cluster-map.png`
- Create: `targetx-top-candidate-evidence.png`

- [ ] **Step 1: Generate assets**

Use `imagegen` to create four scientific mock images with Target-X labels only. Do not include EGFR or unrelated target names.

- [ ] **Step 2: Store assets**

Move/copy the generated PNG files into `src/assets/mock-science/targetx/`.

- [ ] **Step 3: Validate filenames and dimensions**

Run:

```bash
file src/assets/mock-science/targetx/*.png
```

Expected: four PNG files.

### Task 3: Rewrite Discovery Transcript

**Files:**
- Modify: `src/data/antibodyTargetXMockData.ts`

- [ ] **Step 1: Import Target-X images**

Replace EGFR imports with imports from `src/assets/mock-science/targetx/`.

- [ ] **Step 2: Replace `discoveryTranscript`**

Write a 65-75 turn transcript with these stages:

1. Intake and scope lock.
2. Target brief reading.
3. Evidence retrieval.
4. Antigen and counter-screen strategy.
5. Epitope hypothesis and visual figures.
6. Candidate pool generation.
7. Filtering and model scoring.
8. Candidate evidence review.
9. Release package and handoff.

Ensure at least 12 user turns and multiple nontrivial user objections or refinements.

- [ ] **Step 3: Keep component coverage**

The transcript must include `projectFile`, `capabilityRunReplay`, `scientificFigure`, `humanConfirmation`, `approvalGateCard`, `candidateEvidenceTable`, and `dataChart`.

### Task 4: Expand Discovery Run Inspector

**Files:**
- Modify: `src/data/antibodyTargetXMockData.ts`

- [ ] **Step 1: Replace discovery run steps**

Set discovery run inspector progress to 12-15 steps covering target brief, evidence retrieval, antigen design, epitope hypothesis, candidate generation, filtering, ranking, review, release, and LIMS payload generation.

- [ ] **Step 2: Expand outputs and capability runs**

Add outputs for `TargetX_top28_release_package.json`, `TargetX_R1_LIMS_Submission_Payload.json`, and `TargetX_discovery_decision_log.md`. Add 8-10 representative capability runs.

### Task 5: Expand Side-window Files

**Files:**
- Modify: `src/data/workspaceSideWindowMockData.ts`

- [ ] **Step 1: Replace `targetXDiscoveryFiles`**

Add the required file seeds:

- `TargetX_research_brief.md`
- `TargetX_target_profile.json`
- `TargetX_evidence_network.json`
- `TargetX_patent_similarity_review.md`
- `TargetX_antigen_strategy.md`
- `TargetX_counter_screen_plan.json`
- `TargetX_epitope_hypothesis.json`
- `TargetX_candidate_pool_manifest.json`
- `TargetX_developability_filter_log.csv`
- `TargetX_candidate_ranking.xlsx`
- `TargetX_candidate_decision_log.md`
- `TargetX_top28_release_package.json`
- `TargetX_R1_LIMS_Submission_Payload.json`
- `TargetX_discovery_evidence_index.json`

- [ ] **Step 2: Add preview content**

Markdown and JSON files should have concrete preview content. CSV/XLSX files should have realistic metadata; add spreadsheet preview data if the existing side-window system supports it.

### Task 6: Verify And Polish

**Files:**
- Test: `src/data/antibodyTargetXMockData.test.ts`
- Optional test: existing component tests if snapshots or type coverage need updates.

- [ ] **Step 1: Run targeted tests**

```bash
npx vitest run src/data/antibodyTargetXMockData.test.ts src/components/ConversationBlocks.test.tsx --maxWorkers=1 --no-file-parallelism
```

- [ ] **Step 2: Run full verification**

```bash
npx vitest run --maxWorkers=1 --no-file-parallelism
npm run lint
npm run build
```

- [ ] **Step 3: Browser check**

Open the local app, select `Target-X 阻断型抗体发现`, and verify:

- the Thread feels long and active
- no EGFR images appear
- right-side run info is aligned
- side-window files include the expanded discovery assets

## Self-review

- Spec coverage: each design requirement maps to a task.
- Placeholder scan: no TBD/TODO placeholders.
- Type consistency: tasks use existing `ConversationBlock`, `RunInspectorData`, and `SideWindowFileSeed` concepts.
