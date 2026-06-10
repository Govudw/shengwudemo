# IL-17A Affinity Maturation Analysis Design

## Goal

Add a new mock Thread named `IL-17A 亲和力成熟实验设计` under the existing `Antibody Optimization` Project.

This Thread demonstrates a pre-experiment analysis and experiment-design flow. It should not look like the Main Agent can accurately predict biological truth. The Main Agent should instead organize a complex mock analysis flow, expose uncertainty, turn competing hypotheses into a concrete experiment design, and ask for human judgment at key decision points.

Use `flow` for this Thread's narrative sequence. Do not describe the mock analysis as a Pipeline, Task, or executable Workflow. The only Workflow referenced in this spec is a future wet-lab Workflow that may consume the saved Experiment Design Package.

The homepage behavior stays unchanged: the app opens in the New Thread Draft state and does not show any mock Thread by default. The IL-17A mock appears only after the user clicks its Thread row in the sidebar.

## Product Positioning

The existing EGFR Thread shows a relatively complete dry-to-wet optimization loop. The IL-17A Thread complements it by focusing on the work that happens before a wet experiment is submitted:

- read a compact analysis input bundle
- find a mismatch between binding affinity and cell potency
- form plausible but uncertain hypotheses
- let the user correct goals and constraints
- design a 48-variant experiment and assay panel
- save an Experiment Design Package as Project Files

The mock should feel like a realistic collaboration between the Main Agent and a scientist, not like a deterministic autopilot.

## Thread Placement

Project: `Antibody Optimization`

Thread title: `IL-17A 亲和力成熟实验设计`

Suggested list position: near the existing EGFR Thread in the `Antibody Optimization` project. The new Thread may appear above or below EGFR, but it must not change the default app state to auto-open this mock.

Suggested last activity label: `2 天前`

## Narrative Shape

Use approximately 19 conversation turns. The user should appear in 4 turns:

1. Starts the analysis with a compact IL-17A input bundle.
2. Corrects the objective: prioritize cell potency, not only KD.
3. Sets human constraints: 48 variants, no high-hydrophobicity designs, retain cell assay.
4. Confirms the final Experiment Design Package as an input for a future wet-lab Workflow.

The Main Agent should own the analytical flow between those turns. Its language should be hypothesis-driven:

- state what the data supports
- state what remains uncertain
- explain why a validation design can distinguish hypotheses
- avoid saying that the Main Agent has proven causal biology

## Input Project File Bundle

The first user turn includes three Project Files:

- `IL17A_parent_and_variant_history.xlsx`
  - Parent antibody and 12 historical variants.
  - Columns include BLI KD, competition ELISA IC50, IL-17A cell neutralization IC50, expression, SEC-HPLC monomer, Tm, and risk notes.
- `IL17A_variant_sequences.fasta`
  - Heavy/light variable region sequences for the parent and historical variants.
- `IL17A_assay_notes.md`
  - Scientist notes about assay noise, cell line behavior, and historical team observations.

These files are mock Project Files. They are rendered as Thread evidence and do not require real parsing.

## Core Scientific Conflict

Historical variants show a binding/function discordance:

- Several variants improve BLI KD from roughly 18 nM to 2-4 nM.
- Cell neutralization IC50 does not improve proportionally.
- A few variants with only moderate KD improvement show better cell potency.
- Some high-affinity variants carry expression or thermal stability penalties.

The Main Agent should frame this as a design problem:

> The next experiment should not simply chase lower KD. It should test whether potency is limited by epitope blocking geometry, binding kinetics, assay context, or developability trade-offs.

## Conversation Outline

The transcript should follow this structure:

1. User uploads the input bundle and asks for next-round affinity maturation design.
2. Main Agent extracts baseline and summarizes initial objectives.
3. Main Agent runs input-bundle QC and flags that data are adequate for design but not for causal certainty.
4. Main Agent shows a BLI versus cell potency discordance analysis.
5. User corrects the goal: do not optimize KD alone; prioritize cell potency and preserve developability.
6. Main Agent updates the objective function and states revised success criteria.
7. Main Agent maps historical sequence changes to CDR/site regions and identifies evidence-supported regions.
8. Main Agent proposes three hypotheses: affinity-limited, epitope/blocking-limited, and assay/context-limited.
9. User gives project experience: variants around one CDR region changed ELISA blocking more than KD.
10. Main Agent reweights the hypotheses and proposes what the next experiment must distinguish.
11. Main Agent drafts a design space with candidate site groups and excluded risky regions.
12. User sets hard constraints: 48 variants, avoid high hydrophobicity, retain BLI, ELISA, and cell neutralization.
13. Main Agent converts the constraints into a 48-variant library strategy.
14. Main Agent designs the assay panel, controls, replicates, and decision criteria.
15. Main Agent explains the uncertainty model and how each readout will update the hypotheses.
16. User asks why the Main Agent is not choosing a single "best" mutation set.
17. Main Agent answers that the evidence supports a discriminating experiment, not a deterministic lead prediction.
18. Main Agent writes the Experiment Design Package and supporting files to Project Files.
19. User confirms the package can be used as the input to a future wet-lab Workflow; Main Agent summarizes final next steps.

If implementation needs exactly 18 or 20 turns for pacing, keep the four user turns and the same decision structure.

## Human Judgment And Confirmation Points

The Thread should make four human judgment points explicit:

1. Objective correction
   - User changes the optimization target from "lower KD" to "better cell potency with acceptable developability".
   - Main Agent updates the objective function in the transcript and Run Inspector.

2. Hypothesis interpretation
   - Main Agent presents multiple plausible explanations for discordance.
   - User adds project experience that shifts attention toward epitope/blocking behavior.

3. Design constraints
   - User sets budget and risk boundaries.
   - Main Agent must revise the design to exactly 48 variants.

4. Final design confirmation
   - Main Agent saves outputs as an Experiment Design Package and supporting Project Files.
   - User accepts them as input for a future experimental Workflow, without submitting an Experiment Order in this Thread.

Use Human Confirmation blocks for lightweight accepted decisions, such as final package acceptance. Do not use Approval Request, Approval Gate, or Approval Gate Preview in this Thread, because no Experiment Order is submitted.

## Scientific Figure Files

Use `imagegen` during implementation to create five project-bound raster image files. Save them under a new source image directory, for example:

`src/assets/mock-science/il17a/`

Required figures:

1. `il17a-discordance-plot.png`
   - BLI KD versus cell neutralization IC50.
   - Highlight variants where KD improves but cell potency does not.

2. `il17a-variant-evidence-heatmap.png`
   - Historical variant matrix across KD, ELISA blocking, cell potency, expression, monomer, Tm, and risk.

3. `il17a-cdr-site-evidence-map.png`
   - CDR/site evidence map showing mutation clusters, priority regions, and excluded high-risk regions.

4. `il17a-hypothesis-triage-diagram.png`
   - Three competing hypotheses: affinity-limited, epitope/blocking-limited, assay/context-limited.
   - Show evidence strength and uncertainty, not a single proven answer.

5. `il17a-library-assay-design-matrix.png`
   - Final 48-variant design matrix with groups, readouts, controls, and replicate strategy.

The figures should use the same `scientificFigure` conversation block pattern already used by the EGFR Thread. They should look like scientific report visuals, not product marketing art.

## Final Experiment Design

The final design should contain 48 variants split into four groups:

- 12 binding-focused variants
- 12 epitope/blocking-focused variants
- 12 developability-safe rescue variants
- 12 controls, recombinations, and rollback variants

Assay panel:

- BLI kinetics
- competition ELISA
- IL-17A cell neutralization assay
- expression titer
- SEC-HPLC monomer
- DSF or Tm

Decision criteria:

- primary: cell neutralization IC50 improvement
- secondary: KD and/or kinetics improvement
- developability gates: expression, monomer, Tm, and high-risk sequence features
- interpretation: choose variant families that improve function without unacceptable developability cost; do not claim causality unless the design distinguishes hypotheses after data return

## Run Inspector Design

The Run Inspector should show the Thread as a completed pre-experiment analysis-design flow.

Summary:

- Stage: `实验前分析设计完成`
- Status: `completed`
- Completed steps: 7 of 7
- Outputs: 4 items
- Pending: 0

Progress stages:

1. 输入文件导入与质控
2. Assay discordance 分析
3. 序列和位点证据归因
4. 假设分层与不确定性标注
5. 用户目标修正
6. Library 和 assay panel 设计
7. Experiment Design Package 写回项目文件

Capability replay examples:

- `ProjectFileReader.extractIl17aHistory`
- `InputBundleQc.checkCompleteness`
- `AssayDiscordanceAnalyzer.compareBindingAndFunction`
- `SequenceEvidenceMapper.mapCdrSignals`
- `HypothesisTriage.rankUncertainty`
- `LibraryDesignPlanner.composeVariantGroups`
- `AssayPanelDesigner.defineReadouts`
- `ProjectFile.save`

Outputs should use uncertainty-aware language, such as `evidenceStrength`, `remainingUncertainty`, and `recommendedValidation`, rather than deterministic claims.

## Final Project Files

At the end of the Thread, render three saved Project Files. The files together form the Experiment Design Package, but they remain Project Files in the UI unless a later Workflow promotes them into durable Assets:

- `IL17A_affinity_maturation_design_package.md`
  - Full rationale, hypotheses, constraints, variant group strategy, assay panel, and success criteria.
- `IL17A_library_design_matrix.csv`
  - 48-variant design matrix with group, intent, sites, readouts, and risk gates.
- `IL17A_assay_readout_plan.xlsx`
  - Assay panel, controls, replicates, acceptance thresholds, and interpretation rules.

The fourth Run Inspector output should be a figure bundle entry, `IL17A_scientific_figures.png`, representing the five Scientific Figures already rendered in the Thread.

## Implementation Scope

Expected code/data changes:

- Add five IL-17A image imports to `src/data/mockData.ts`.
- Add `il17aAffinityDesignTranscript` using existing `ConversationTurn` and `scientificFigure` block types.
- Add `il17aRunInspector` using the existing `RunInspectorData` shape.
- Insert the new Thread into the `Antibody Optimization` Project.
- Keep `createInitialDemoState` behavior unchanged so the app opens in New Thread Draft state.
- Add or update tests only if existing tests depend on project/thread ordering or seeded data.

No new backend, real parser, real model call, real Experiment Order, or new UI component is required for this design. The implementation should reuse the current EGFR mock patterns and only add new content and image files unless a small supporting refactor is necessary.

## Acceptance Criteria

- The app still opens to New Thread Draft, with no mock Thread selected by default.
- `IL-17A 亲和力成熟实验设计` appears under `Antibody Optimization`.
- Clicking the Thread shows a complete analysis-design mock transcript with approximately 19 turns.
- The transcript includes four user turns that materially affect Main Agent behavior.
- The Thread contains five IL-17A Scientific Figures generated as project-bound image files.
- The Main Agent language is hypothesis-driven and uncertainty-aware.
- The Run Inspector reflects a completed pre-experiment analysis-design flow.
- The final Project Files are visible in the transcript and Run Inspector outputs.
- The Thread does not submit an Experiment Order or simulate wet-lab results.
- Existing EGFR mock behavior remains intact.

## Non-Goals

- Do not implement real IL-17A data parsing.
- Do not claim accurate biological prediction.
- Do not add a new Project.
- Do not change the homepage default selected state.
- Do not add new sidebar concepts or navigation patterns.
- Do not simulate wet-lab execution or result return in this Thread.
