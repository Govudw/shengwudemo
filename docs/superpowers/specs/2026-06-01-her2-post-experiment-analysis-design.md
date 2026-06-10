# HER2 Post-Experiment Analysis Mock Thread Design

## Goal

Add a new mock Thread named `HER2 实验结果多模型分析` under the existing `Antibody Optimization` Project.

The Thread demonstrates post-experiment analysis after a wet-lab Experiment Result Package has already been returned. It should focus on applying multiple analysis models, checking assumptions, exposing uncertainty, and saving an analysis report. It must not submit a new Experiment Order, simulate new lab execution, or create a next-round experiment design.

## Positioning

This Thread complements the existing antibody mock sequence:

- `IL-17A 亲和力成熟实验设计`: before experiment, analysis-design focus.
- `HER2 抗体候选湿实验验证`: experiment execution and result package archival.
- `HER2 实验结果多模型分析`: after experiment, pure analysis of returned results.

The Main Agent should feel useful as an analysis coordinator, not as an oracle. Model outputs are evidence-weighted and uncertainty-aware.

## Narrative Shape

Use 19 turns with 4 user turns:

1. User asks the Main Agent to analyze the archived HER2 Experiment Result Package.
2. User confirms how to handle a flagged ELISA outlier.
3. User confirms that structural interpretation must remain hypothesis-level.
4. User confirms final report archival.

The Main Agent covers:

- result package loading and completeness checks
- BLI kinetics fitting and ELISA curve fitting
- expression, SEC-HPLC, DSF, and developability signal integration
- multi-model consensus scoring
- structural interpretation as a hypothesis
- uncertainty and sensitivity analysis
- final saved Project Files

## Figures

Generate five project-bound scientific figures under `src/assets/mock-science/her2-post-analysis/`:

- `her2-result-package-qc-overview.png`
- `her2-curve-fit-diagnostics.png`
- `her2-model-consensus-analysis.png`
- `her2-structural-hypothesis-map.png`
- `her2-uncertainty-sensitivity-analysis.png`

## Run Inspector

Summary:

- Stage: `实验后结果分析完成`
- Status: `completed`
- Completed steps: 7 of 7
- Outputs: 5
- Pending: 0

Outputs:

- `HER2_post_experiment_multimodel_analysis_report.md`
- `HER2_model_consensus_score_table.csv`
- `HER2_curve_fit_and_qc_summary.xlsx`
- `HER2_post_analysis_figure_bundle.png`
- `HER2_analysis_assumption_log.md`

## Acceptance Criteria

- App still opens in New Thread Draft with no mock Thread selected.
- New Thread appears under `Antibody Optimization`.
- Transcript has 19 turns, 4 user turns, 5 scientific figures, 10 capability run replays, and 3 human confirmation blocks.
- Transcript contains no Experiment Order draft, approval request replay, or elapsed wet-lab replay.
- Language avoids deterministic biological claims, `recommendedLead`, `mechanismProven`, and `nextRoundDesign`.
