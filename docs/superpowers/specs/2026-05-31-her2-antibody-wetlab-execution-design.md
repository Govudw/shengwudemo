# HER2 Antibody Wet-Lab Execution Design

## Goal

Add a new mock Thread named `HER2 抗体候选湿实验验证` under the existing `Antibody Optimization` Project.

This Thread demonstrates an operational wet-lab validation execution flow for antibody candidates. It starts after candidate selection is already complete. The Main Agent should coordinate experiment order preparation, sample and control checks, Approval Request replay, Experiment Task execution replay, result file import, Preset QC Checks, and Experiment Result Package archival.

This Thread must not show the Main Agent doing candidate discovery, mechanism analysis, mutation design, developability interpretation, or next-round optimization planning. Any result review is limited to file completeness, assay QC, and pass/fail checks against criteria that were defined before execution.

Use `execution flow` or `wet-lab validation execution` for this Thread's narrative sequence. Do not describe the mock conversation itself as a new **Workflow** object. The submitted **Experiment Order** may be shown as creating or feeding a lab-side **Experiment Task**, but the UI must not expose that Experiment Task as the Main Agent **Task** or as a sidebar item.

The homepage behavior stays unchanged: the app opens in the New Thread Draft state and does not show any mock Thread by default. The HER2 mock appears only after the user clicks its Thread row in the sidebar.

## Product Positioning

The existing mock Threads cover adjacent but different stories:

- `EGFR 抗体亲和力优化` shows a broad dry-to-wet optimization loop.
- `IL-17A 亲和力成熟实验设计` shows pre-experiment analysis and design, with uncertainty and human judgment before wet-lab submission.
- `HER2 抗体候选湿实验验证` should show the experiment execution and delivery layer: turning an already selected Candidate Molecule set into an approved Experiment Order, tracking lab-side Experiment Task execution, receiving files, running Preset QC Checks, and saving an Experiment Result Package.

The case should make BioMap Agent feel useful without implying that it can automatically solve antibody biology. The Main Agent is the coordinator and recorder of a realistic experimental execution flow.

## Thread Placement

Project: `Antibody Optimization`

Thread title: `HER2 抗体候选湿实验验证`

Suggested list position: near the existing EGFR and IL-17A Threads in the `Antibody Optimization` project.

Suggested last activity label: `1 天前`

## Scope Boundary

Allowed in this Thread:

- Read a mock candidate manifest and material inventory.
- Prepare an Experiment Order Draft.
- Calculate sample, control, replicate, and plate-map requirements.
- Surface budget, timeline, and assay coverage decisions for human confirmation.
- Create an Approval Request replay for Experiment Order submission.
- Simulate elapsed Experiment Task execution.
- Import returned result files.
- Run file completeness checks and Preset QC Checks.
- Render pass/fail status against predeclared acceptance criteria.
- Save raw results, QC report, summary report, and figure bundle as Project Files that together form an Experiment Result Package.

Not allowed in this Thread:

- No candidate generation.
- No mutation or sequence analysis.
- No mechanism interpretation.
- No "best molecule" scientific ranking beyond preset pass/fail status.
- No recommendation for next-round design.
- No claim that the Main Agent understands why a candidate passed or failed.

## Narrative Shape

Use approximately 19 conversation turns. The user should appear in 5 turns:

1. Starts wet-lab validation for three preselected HER2 Candidate Molecules and uploads the execution input bundle.
2. Confirms budget, timeline, and required assay coverage.
3. Adds control requirements: parent and isotype controls must be retained.
4. Approves the final Experiment Order submission.
5. Clarifies that the final output should be archived as an Experiment Result Package, without next-round design advice.

The Main Agent should own the operational flow between those turns. Its language should be execution-oriented:

- confirm what will be run
- state which files or controls are missing or present
- show order and plate-map preparation
- expose approval and execution status
- run Preset QC Checks
- avoid scientific explanation beyond the acceptance criteria

## Input Project File Bundle

The first user turn includes three Project Files:

- `HER2_candidate_antibody_manifest.xlsx`
  - Three preselected Candidate Molecules, parent antibody, expression construct IDs, lot placeholders, required assays, and predeclared acceptance criteria.
- `HER2_material_inventory.csv`
  - Available plasmid, antigen, sensor, buffer, cell-free inventory, and sample shipping constraints.
- `HER2_validation_sop.pdf`
  - Mock SOP covering small-scale expression, Protein A purification, SEC-HPLC, DSF, BLI, and binding ELISA.

These files are mock Project Files. They are rendered as Thread evidence and do not require real parsing.

## Experimental Package

Candidate Molecule set:

- `HER2-P0`: parent antibody control
- `HER2-VH-01`: preselected candidate
- `HER2-VH-02`: preselected candidate
- `HER2-VH-03`: preselected candidate
- `HER2-ISO`: isotype control

Assay panel:

- transient expression titer
- Protein A small-scale purification yield
- SEC-HPLC monomer percentage
- DSF or Tm
- BLI kinetics against HER2-ECD
- binding ELISA against HER2-ECD

Preset acceptance criteria:

- expression titer >= 30 mg/L
- post-purification yield >= 0.25 mg per construct
- SEC-HPLC monomer >= 95%
- Tm >= parent minus 2 C
- BLI data quality passes fitting QC
- binding ELISA signal passes SOP-defined positive-control window

The transcript may show pass/fail status for these criteria. It must not turn those statuses into a mechanistic explanation, lead-selection analysis, or next-round design recommendation.

## Conversation Outline

The transcript should follow this structure:

1. User uploads the HER2 execution input bundle and asks to start wet-lab validation for three Candidate Molecules.
2. Main Agent confirms the scope: execution flow only, no candidate analysis or redesign, and no new Workflow object in the mock UI.
3. Main Agent extracts the candidate manifest, available materials, and preset acceptance criteria.
4. Main Agent creates the first Experiment Order Draft.
5. User confirms constraints: 10-day turnaround, budget cap, and required assays.
6. Main Agent recalculates sample needs, control coverage, assay replicates, and route.
7. Main Agent creates a sample map and plate layout for expression, purification, BLI, ELISA, SEC-HPLC, and DSF.
8. User adds that parent and isotype controls must both be retained.
9. Main Agent updates the Experiment Order Draft, controls, replicate plan, and material requirements.
10. Main Agent prepares the Approval Request for Experiment Order submission.
11. User approves submission of `BM-LAB-HER2-20260531-001`.
12. Main Agent submits the Experiment Order and shows that it feeds the lab-side Experiment Task `HER2-EXPTASK-20260531-001`.
13. Main Agent shows Elapsed Work Replay for construct prep, expression, and purification under that Experiment Task.
14. Main Agent shows Elapsed Work Replay for SEC-HPLC, DSF, BLI, and ELISA under that Experiment Task.
15. Main Agent imports returned result files and checks file completeness.
16. Main Agent runs Preset QC Checks and shows pass/fail status by molecule and assay row.
17. User asks to archive the Experiment Result Package only, without next-round design recommendations.
18. Main Agent saves raw results, QC report, summary report, and figure bundle to Project Files.
19. Main Agent summarizes the completed wet-lab validation execution and lists saved Project Files.

If implementation needs exactly 18 or 20 turns for pacing, keep the five user turns and the same decision structure.

## Human Judgment And Confirmation Points

The Thread should make five human-in-loop points explicit:

1. Scope confirmation
   - User starts from preselected Candidate Molecules.
   - Main Agent confirms that the Thread will not perform candidate analysis or redesign.

2. Budget and schedule constraints
   - User confirms 10-day turnaround, budget cap, and required assay coverage.
   - Main Agent updates sample requirements and routing accordingly.

3. Control requirements
   - User requires both parent and isotype controls.
   - Main Agent updates the order and plate map.

4. Formal order submission
   - User approves the Experiment Order.
   - Use an `approvalRequestReplay` block for the approved order submission.

5. Final archival boundary
   - User asks for Experiment Result Package archival only.
   - Main Agent saves reports and raw result files as an Experiment Result Package without generating next-round design advice.

Use `humanConfirmation` blocks for lightweight user confirmations and `approvalRequestReplay` only for formal Experiment Order approval.

## Scientific Figure Files

Use `imagegen` during implementation to create five project-bound raster image files. Save them under a new source image directory:

`src/assets/mock-science/her2/`

Required figures:

1. `her2-experiment-order-execution-flow.png`
   - Operational execution flow from candidate manifest to order submission, Experiment Task execution, result return, QC, and archival.

2. `her2-sample-plate-map.png`
   - Sample and control layout showing Candidate Molecules, parent, isotype, replicates, and assay routing.

3. `her2-expression-purification-qc.png`
   - Expression and purification execution summary with operational QC markers.

4. `her2-sec-dsf-bli-qc-dashboard.png`
   - SEC-HPLC, DSF, BLI, and ELISA QC dashboard using pass/fail indicators against preset criteria.

5. `her2-experiment-result-package-summary.png`
   - Final Experiment Result Package summary showing raw data bundle, QC report, experiment summary, and figure bundle.

The figures should look like scientific operations and QC visuals, not product marketing art. They should avoid causal biology claims and avoid ranking candidates as "best" or "lead".

## Run Inspector Design

The Run Inspector should show the Thread as a completed wet-lab validation execution flow.

Summary:

- Stage: `湿实验验证完成`
- Status: `completed`
- Completed steps: 7 of 7
- Outputs: 5 items
- Pending: 0

Progress stages:

1. 候选与订单输入确认
2. 样本需求和 controls 检查
3. Experiment Order 审批
4. Experiment Task 执行回放
5. 结果文件导入
6. 预设 QC 检查
7. Experiment Result Package 归档

Capability replay examples:

- `ProjectFileReader.extractHer2ExecutionInputs`
- `ExperimentOrderDraft.create`
- `SampleRequirementEstimator.calculate`
- `PlateMapDesigner.createLayout`
- `ExperimentOrder.submit`
- `ExperimentTaskReplay.syncStatus`
- `ExperimentResultReader.importResults`
- `PresetQcChecker.evaluateAssayFiles`
- `ProjectFile.save`

Capability replay summaries should emphasize operational state, input/output files, QC status, and artifact creation. They should not imply model-driven biological interpretation.

## Final Project Files

At the end of the Thread, render four saved Project Files. Together these Project Files form the mock Experiment Result Package, but they are not Assets unless a later product flow promotes them:

- `HER2_wetlab_raw_result_bundle.xlsx`
  - Raw returned assay data bundle for expression, purification, SEC-HPLC, DSF, BLI, and ELISA.
- `HER2_experiment_qc_report.md`
  - File completeness checks, SOP window checks, assay-level pass/fail status, and data quality notes.
- `HER2_experiment_summary_report.md`
  - Operational experiment summary, order metadata, assays performed, controls included, and final delivery status.
- `HER2_experiment_result_package_figures.png`
  - Figure bundle representing the five Scientific Figures rendered in the Thread.

The Experiment Order should also appear as a Run Inspector output:

- `BM-LAB-HER2-20260531-001`
  - Submitted Experiment Order for the HER2 wet-lab validation execution flow.

The lab-side Experiment Task ID should be visible only as replay metadata, for example `HER2-EXPTASK-20260531-001`. It should not appear as a top-level Thread, sidebar Task, or Run Inspector output item because the current UI does not model Experiment Task details as a durable page.

## Implementation Scope

Expected code/data changes:

- Add five HER2 image imports to `src/data/mockData.ts`.
- Add `her2WetlabExecutionTranscript` using existing `ConversationTurn` and `scientificFigure` block types.
- Add `her2WetlabRunInspector` using the existing `RunInspectorData` shape.
- Insert the new Thread into the `Antibody Optimization` Project.
- Keep `createInitialDemoState` behavior unchanged so the app opens in New Thread Draft state.
- Add focused tests for the new seeded Thread, default homepage state, transcript length, no-analysis language boundary, required Scientific Figures, Experiment Task replay metadata, Project File archival, and Run Inspector outputs.

No new backend, real parser, real assay computation, real order submission, real CRO integration, or new UI component is required for this design. The implementation should reuse the current EGFR and IL-17A mock patterns and only add new content and image files unless a small supporting refactor is necessary.

## Acceptance Criteria

- The app still opens to New Thread Draft, with no mock Thread selected by default.
- `HER2 抗体候选湿实验验证` appears under `Antibody Optimization`.
- Clicking the Thread shows a complete wet-lab execution mock transcript with approximately 19 turns.
- The transcript includes five user turns that materially affect Main Agent behavior.
- The Thread contains five HER2 Scientific Figures generated as project-bound image files.
- The Main Agent does not perform candidate analysis, mechanism interpretation, mutation design, or next-round planning.
- The Thread includes an Experiment Order Draft, formal Approval Request replay, submission replay, elapsed Experiment Task execution replay, result import, Preset QC Checks, and Project File archival.
- The Run Inspector reflects a completed wet-lab validation execution flow.
- Final Project Files are visible in the transcript and Run Inspector outputs.
- The Experiment Result Package is represented as Project Files, not automatically as an Asset.
- Existing EGFR and IL-17A mock behavior remains intact.

## Non-Goals

- Do not implement real HER2 data parsing.
- Do not implement real Experiment Order submission.
- Do not implement a real Workflow object or Workflow Run for this Thread.
- Do not expose Experiment Task as the Main Agent Task or a sidebar item.
- Do not add a real CRO integration.
- Do not claim accurate biological prediction or causal interpretation.
- Do not generate or rank new antibody Candidate Molecules.
- Do not add a new Project.
- Do not change the homepage default selected state.
- Do not add new sidebar concepts or navigation patterns.
- Do not add next-round analysis or design advice to this Thread.
