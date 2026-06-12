# Target-X Antibody Discovery Thread Redesign

Date: 2026-06-12
Scope: `Antibody Optimization / Target-X 阻断型抗体发现`

## Goal

Redesign the Target-X discovery mock Thread so it feels like a real antibody discovery research session instead of a compressed summary.

The updated Thread should show a scientist and an Agent iteratively turning a target brief into a wet-lab-ready R1 candidate package. The Agent should provide frequent progress updates, surface uncertainty, ask for human judgement at key points, and write intermediate assets into the project file system.

## Problems To Fix

1. The current Thread has too few turns. It reads as a short executive summary, not as an ongoing research workflow.
2. The Agent feedback density is too low. There are long jumps from input to conclusion without visible intermediate reasoning or work.
3. The Thread currently reuses EGFR images. Target-X must not visually look like EGFR or mention EGFR-specific science assets.
4. The right-side run inspector and side-window files should match the expanded discovery workflow.

## Target Experience

The Thread should contain at least 60 turns, preferably 65-75 turns.

The conversation should feel like a real research working session:

- The user starts with an incomplete but research-oriented request.
- The Agent extracts assumptions and asks clarifying questions.
- The Agent reads and summarizes target materials.
- The user corrects or supplements context several times.
- The Agent runs staged database, patent, sequence, structure, candidate generation, filtering, and ranking tasks.
- The Agent does not overclaim model predictions as wet-lab truth.
- The user challenges specific recommendations.
- The Agent updates candidate inclusion/exclusion decisions and records them.
- The final output is a locked Target-X R1 candidate package and LIMS/LISM submission payload.

## Conversation Structure

### Stage 1: Intake And Scope Lock

Approximate turns: 1-8

Purpose:

- Convert the user’s initial request into a concrete discovery scope.
- Clarify target, modality, first-round candidate count, risk tolerance, and downstream handoff.

Expected content:

- User asks for Target-X blocking monoclonal antibody discovery.
- Agent asks whether the priority is blocking function, developability, novelty/FTO, or speed to wet lab.
- User says blocking and developability are highest priority; speed matters but should not override risk.
- Agent records that first output should be 20 primary candidates, 4 backups, and 4 controls.

Representative Agent tone:

> 我先不把“阻断型”当成已经证明的事实。这里我会把它拆成两个层次：一是候选是否能结合 D2/D3 附近表位，二是湿实验是否真的看到功能阻断。前者可以用模型和证据排序，后者必须进 R1 实验验证。

### Stage 2: Target Brief Reading

Approximate turns: 9-16

Purpose:

- Show the Agent reading project files and extracting structured inputs.
- Let the user correct missing or uncertain internal context.

Expected content:

- File block: `TargetX_research_brief.md`
- Tool run: `TargetBriefParser.extractTargetConstraints`
- Agent extracts:
  - Target-X has D1/D2/D3 extracellular domains.
  - Internal team suspects D2/D3 is functional but lacks direct blocking validation.
  - Two homolog proteins require counter-screening.
  - Target material availability is incomplete.
- User clarifies that D2/D3 relevance comes from internal biology, not public validation.
- Agent records this as a hypothesis, not a fact.

### Stage 3: Evidence Retrieval

Approximate turns: 17-27

Purpose:

- Give strong feedback that the Agent is actively searching and consolidating evidence.

Expected content:

- Tool runs:
  - `BioDB.searchTargetProfile`
  - `StructureDB.collectTargetModels`
  - `AntibodyDB.searchKnownBinders`
  - `PatentIntel.scanTargetXAntibodySpace`
  - `EpitopeDB.collectFunctionalHints`
- Data chart: evidence coverage by source.
- Project files:
  - `TargetX_target_profile.json`
  - `TargetX_evidence_network.json`
  - `TargetX_patent_similarity_review.md`

Important behavior:

- The Agent should state what evidence is missing.
- It should avoid saying it “knows” the blocking epitope.
- It should explain that public antibody families can inspire constraints but should not be copied.

### Stage 4: Antigen And Counter-screen Strategy

Approximate turns: 28-36

Purpose:

- Turn target evidence into an antigen plan.
- Include meaningful human intervention.

Expected content:

- Agent proposes:
  - Ag-01: Target-X full ECD.
  - Ag-02: D2/D3 fragment.
  - Ag-03: homolog Y ECD counter-screen.
  - Ag-04: D2/D3 interface mutant or decoy construct.
- User asks whether D2/D3 alone might lose conformational context.
- Agent acknowledges the risk and keeps full ECD as a required validation antigen.
- Human confirmation block records antigen strategy.

Project files:

- `TargetX_antigen_strategy.md`
- `TargetX_counter_screen_plan.json`

### Stage 5: Epitope Hypothesis And Visuals

Approximate turns: 37-44

Purpose:

- Replace EGFR images with Target-X-specific visuals.
- Make the figure content match the story.

Required visual assets:

1. `targetx-domain-epitope-map.png`
   - Target-X ECD with D1/D2/D3.
   - E1/E2/E3 epitope hypotheses.
   - Must not include EGFR text or EGFR-like labels.
2. `targetx-evidence-network.png`
   - Evidence network across target brief, structure, antibody database, patent, and internal biology notes.
3. `targetx-candidate-cluster-map.png`
   - Candidate cluster map by epitope class and developability risk.
4. `targetx-top-candidate-evidence.png`
   - Summary visual for Top candidates and risk flags.

Implementation note:

- Prefer generating these with `imagegen` and storing them under `src/assets/mock-science/targetx/`.
- If image generation is not available, replace scientific figure blocks with ECharts/table-based components rather than reusing unrelated assets.

### Stage 6: Candidate Pool Generation

Approximate turns: 45-53

Purpose:

- Show how the Agent designs the candidate pool without pretending wet-lab truth is known.

Expected content:

- Candidate sources:
  - natural-like antibody space
  - structure-guided CDR proposals
  - public-family-inspired but similarity-controlled variants
  - synthetic diversity with restricted liabilities
- Tool runs:
  - `AntibodyPool.generateNaturalLikeCandidates`
  - `AntibodyPool.generateStructureGuidedCandidates`
  - `SimilarityGuard.removePublicFamilyTooClose`
  - `DevelopabilityFilter.preScreen`
- User says not to use candidates that look too close to public antibody families.
- Agent tightens FTO/similarity thresholds.

Project files:

- `TargetX_candidate_pool_manifest.json`
- `TargetX_similarity_fto_review.md`

### Stage 7: Filtering And Model Scoring

Approximate turns: 54-63

Purpose:

- Show multiple small feedback updates instead of one huge conclusion.

Expected content:

- AI reports the candidate pool shrinking across filters:
  - 175,000 raw pairings
  - 4,380 nonredundant candidates
  - 624 structure-screened candidates
  - 86 candidate families
  - 28 R1-ready candidates
- Data chart:
  - funnel/bar chart of filtering stages.
- Table:
  - risk filter log with liability, aggregation, human-likeness, FTO, homolog binding risk.
- Agent says model scores are ranking aids, not final truth.
- User asks why ABX-014 ranks first.
- Agent answers with a compact evidence breakdown.
- User says ABX-041 should not be in primary 20.
- Agent moves ABX-041 to backup or no-go and records the decision.

Project files:

- `TargetX_developability_filter_log.csv`
- `TargetX_candidate_ranking.xlsx`
- `TargetX_candidate_decision_log.md`

### Stage 8: Candidate Evidence Review

Approximate turns: 64-70

Purpose:

- Give the user a realistic final review moment before release.

Expected content:

- Candidate evidence table with ABX-014, ABX-027, ABX-033, ABX-041, ABX-052, and controls.
- Agent recommends:
  - 20 primary candidates
  - 4 backup candidates
  - 4 controls
- User approves Top 28 but requires no automatic next-round design.
- Approval card records:
  - approver
  - approval type
  - candidate package
  - decision
  - boundary: do not auto-start R2

### Stage 9: Release Package And Handoff

Approximate turns: 71-75

Purpose:

- End with concrete assets and a clear handoff to the LIMS/LISM execution Thread.

Expected content:

- Agent writes:
  - `TargetX_top28_release_package.json`
  - `TargetX_R1_LIMS_Submission_Payload.json`
  - `TargetX_discovery_decision_log.md`
  - `TargetX_discovery_evidence_index.json`
- Final text explains:
  - what the input was
  - what was inferred
  - what remains uncertain
  - what is locked for R1
  - what downstream LIMS may consume

## Human-in-the-loop Requirements

The user should have 12-18 turns.

Human turns should include:

- initial request
- scope preference
- internal D2/D3 clarification
- antigen strategy approval
- question about conformational risk
- FTO/public-antibody concern
- candidate-specific challenge
- ABX-041 exclusion request
- final package approval
- no automatic R2 constraint

Human turns should not all be one-word confirmations. Several should be real scientific objections or refinements.

## Run Inspector Requirements

The run inspector should reflect the expanded workflow with 12-15 steps.

Recommended steps:

1. 读取 Target-X research brief
2. 抽取发现目标和边界
3. 建立靶点档案
4. 检索结构和抗体证据
5. 检索专利与相似性风险
6. 设计抗原与 counter-screen
7. 建立表位假设
8. 生成候选池
9. 执行序列完整性过滤
10. 执行可开发性过滤
11. 执行结构和复合物建模
12. 多目标候选排序
13. 人类复核候选边界
14. 释放 Top 28 候选包
15. 生成 LIMS/LISM submission payload

Outputs should include at least:

- `TargetX_CandidateManifest_v1.0.json`
- `TargetX_top28_release_package.json`
- `TargetX_R1_LIMS_Submission_Payload.json`
- `TargetX_discovery_decision_log.md`

Capability runs should be more numerous than today, but not noisy. 8-10 representative calls are enough.

## Side-window File Tree Requirements

The side-window files for this Thread should include:

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

Preview support:

- Markdown files should have concrete readable content.
- JSON files should preview structured content.
- CSV/XLSX files can use mock spreadsheet previews if available; otherwise they should still appear as stored assets with realistic metadata.

## Component Use

Reuse existing components where possible:

- `projectFile`
- `capabilityRunReplay`
- `scientificFigure`
- `humanConfirmation`
- `approvalGateCard`
- `candidateEvidenceTable`
- `dataChart`

Potential new or expanded usage:

- More `dataChart` blocks for evidence coverage and filtering funnel.
- More compact project files at each major handoff.
- Target-X-specific scientific figure assets.

No new UI component is required for the first pass unless existing chart or scientific figure blocks cannot support the needed content.

## Acceptance Criteria

- The Thread has at least 60 turns.
- The user has at least 12 turns.
- No visible EGFR text, EGFR image asset, or EGFR-specific figure appears in this Thread.
- The Thread has at least 3 Target-X-specific visual/chart moments.
- The Agent frequently gives progress updates and uncertainty notes.
- The conversation includes scientific objections from the user, not only confirmations.
- Right-side run inspector has 12-15 coherent steps and matching outputs.
- Side-window file tree includes the expanded discovery assets.
- Tests assert:
  - the Thread has at least 60 turns
  - user turn count is at least 12
  - no EGFR asset is referenced by this Thread
  - run inspector has at least 12 steps
  - side-window files include the required Target-X assets

## Out Of Scope

- Rewriting the two downstream Target-X Threads.
- Adding real database integrations.
- Making scientific claims about real Target-X biology.
- Replacing the whole conversation renderer.
- Building a new 3D viewer.

## Implementation Notes

- Keep all new content under the existing Target-X discovery thread ID so sidebar behavior remains stable.
- Update tests before implementation to lock the new turn count, file tree, and no-EGFR rule.
- If Target-X images are generated, place them in `src/assets/mock-science/targetx/` and import them only from `antibodyTargetXMockData.ts`.
- The current local server may need a refresh after changing static assets.
