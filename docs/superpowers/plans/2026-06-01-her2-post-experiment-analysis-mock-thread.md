# HER2 Post-Experiment Analysis Mock Thread Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the `HER2 实验结果多模型分析` mock Thread with generated figures, transcript data, Run Inspector data, and tests.

**Architecture:** Reuse the existing `mockData.ts` seed pattern and `scientificFigure`, `capabilityRunReplay`, `projectFile`, and `humanConfirmation` block types. No UI component changes are needed because existing renderers already support the required content blocks.

**Tech Stack:** Vite, React, TypeScript, Vitest, generated PNG assets.

---

### Task 1: Lock The Seed Contract With Tests

**Files:**
- Modify: `src/store/demoStoreLogic.test.ts`

- [x] **Step 1: Add a failing test for the new Thread transcript**

Assert the Thread id `her2-post-experiment-analysis`, title `HER2 实验结果多模型分析`, 19 turns, 4 user turns, 5 scientific figures, 10 capability run replays, 3 human confirmations, and no experiment-order or elapsed-work blocks.

- [x] **Step 2: Add a failing test for Run Inspector**

Assert stage `实验后结果分析完成`, 7 progress steps, 5 saved outputs, 3 human confirmations, 10 capability runs, and no deterministic lead/mechanism/next-round output claims.

- [x] **Step 3: Verify red**

Run `npm test -- src/store/demoStoreLogic.test.ts`. Expected failure: the new Thread is missing.

### Task 2: Add Project-Bound Figures

**Files:**
- Create: `src/assets/mock-science/her2-post-analysis/*.png`

- [x] **Step 1: Generate five figures with imagegen**

Generate result package QC, curve fitting diagnostics, multi-model consensus, structural hypothesis map, and uncertainty sensitivity analysis figures.

- [x] **Step 2: Copy final PNG files into the project**

Save the files under `src/assets/mock-science/her2-post-analysis/`.

### Task 3: Implement Mock Transcript And Run Inspector

**Files:**
- Modify: `src/data/mockData.ts`

- [x] **Step 1: Import the five generated PNG files**

Add imports near the existing HER2 image imports.

- [x] **Step 2: Add `her2PostExperimentAnalysisTranscript`**

Create a 19-turn transcript using existing conversation block types.

- [x] **Step 3: Add `her2PostExperimentAnalysisRunInspector`**

Create completed Run Inspector data with analysis-focused progress, outputs, approvals, and capability run replays.

- [x] **Step 4: Insert the Thread into `Antibody Optimization`**

Add the Thread with id `her2-post-experiment-analysis` and keep default app state unchanged.

### Task 4: Verify

**Files:**
- Test: `src/store/demoStoreLogic.test.ts`

- [x] **Step 1: Run targeted tests**

Run `npm test -- src/store/demoStoreLogic.test.ts`. Expected: all tests pass.

- [x] **Step 2: Run full verification**

Run `npm test`, `npm run lint`, and `npm run build`. Expected: all pass.
