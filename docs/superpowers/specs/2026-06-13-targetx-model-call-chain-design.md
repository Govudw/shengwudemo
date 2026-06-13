# Target-X Model Call Chain Design

Date: 2026-06-13
Scope: `Antibody Optimization / Target-X 阻断型抗体发现`

## Goal

Add a visible biological foundation model workflow to the Target-X discovery mock Thread.

The current discovery Thread shows target intake, evidence collection, antigen strategy, candidate generation, filtering, ranking, and release. It still feels too generic in the core discovery section because model work is represented as broad capability runs such as candidate generation or structure modeling. The updated Thread should show the Agent actively selecting and comparing biological models, especially xTrimo models and open-source models, then using the comparison to make conservative research decisions.

The mock should not imply that any model can prove binding, blocking, developability, or wet-lab success. Model results are ranking and risk evidence. Wet-lab validation remains required.

## Target Experience

The Thread should include a clear model section:

`Model Workbench · 生物大模型调用与对照`

This section should sit inside the discovery flow, after epitope hypothesis setup and before final candidate ranking. It should feel like a real working sequence:

- The Agent explains why it is calling multiple models.
- xTrimo models act as the primary BioMap OS model capability.
- Open-source models act as sanity checks, baselines, or disagreement detectors.
- The Agent compares model outputs in a structured card.
- If models disagree, the candidate is downgraded, sent to backup, or marked for human review.
- Human judgement still controls key boundary choices such as whether to keep a risky candidate, lower expression risk to a penalty, or reject public-family-similar candidates.

## Required Thread Changes

Update only `targetx-antibody-discovery`.

Keep the Thread research-length: at least 60 turns, preferably 75-90 turns after insertion. The existing Target-X discovery Thread already has enough turns, so the implementation can either insert new turns into the current flow or replace the model-heavy middle section with a richer version.

Do not add EGFR references. Do not turn model scores into final biological truth.

## Model Call Chapters

### Chapter 1: Model Input Preparation

Purpose:

- Convert target profile, antigen plan, candidate pool, and human constraints into model-ready inputs.
- Make it clear that the Agent is not simply uploading files, but extracting sequences, structures, epitope hypotheses, risk constraints, and candidate metadata.

Expected model/input package:

- Target-X ECD sequence and D1/D2/D3 domain boundaries.
- Ag-01 full ECD and Ag-02 D2/D3 constructs.
- E1/E2/E3 epitope hypothesis labels.
- VH/VL candidate pool metadata.
- FTO and public-family exclusion constraints.
- Human boundary: R1 ranking only; no automatic R2.

Suggested capability block:

- `ModelInputCompiler.prepareTargetXModelBatch`
- Output artifact: `TargetX_model_input_batch.json`

### Chapter 2: Antigen Structure Cross-check

Primary xTrimo model:

- `xTrimoMonomer` or `xTrimoFold`

Open-source comparator:

- `ESMFold`

Comparison dimensions:

- D1/D2/D3 domain boundary consistency.
- D2/D3 interface exposure.
- Low-confidence loop regions.
- Whether Ag-02 D2/D3 keeps plausible local conformation.

Decision behavior:

- If both models support exposed D2/D3 interface, keep E1 as a primary hypothesis.
- If they disagree around the D2/D3 interface, downgrade E1 confidence and force stronger full-ECD validation.
- The Agent should explicitly say this is structure support, not functional blocking evidence.

### Chapter 3: Fv Structure Cross-check

Primary xTrimo model:

- `xTrimoAbFold`

Open-source comparator:

- `IgFold`

Comparison dimensions:

- VH/VL packing quality.
- CDRH3 conformation stability.
- CDR loop confidence.
- Framework liabilities around canonical regions.

Decision behavior:

- Candidates supported by both models enter the docking queue.
- Candidates with CDRH3 disagreement are downgraded to backup or review.
- Candidates with major VH/VL packing disagreement are not allowed into primary R1 unless the user explicitly overrides.

Example narrative:

> ABX-041 is not rejected because one model is lower. It is downgraded because the CDRH3 conformation is unstable in the open-source check, and later FTO/aggregation risk also stacks against it.

### Chapter 4: Antibody-Antigen Docking And Epitope Consistency

Primary xTrimo model:

- `xTrimoAbAgDock`

Open-source comparator:

- `HADDOCK` or `DiffDock-PP` mock

Comparison dimensions:

- D2/D3 contact probability.
- Interface buried surface area.
- Whether predicted contact aligns to E1, E2, or E3.
- Whether full ECD and D2/D3 fragment assumptions conflict.

Decision behavior:

- E1 primary status requires cross-model agreement or no major contradiction.
- E2 candidates can remain backup if one model supports adjacent contact.
- E3 candidates are retained only as controls, not therapeutic-ranked candidates.

### Chapter 5: Candidate Generation And Language Model Plausibility

Primary xTrimo model:

- `xTrimoAbGen`

Open-source comparator:

- `IgLM` or `AbLang2`

Comparison dimensions:

- Naturalness/plausibility.
- CDR diversity.
- Framework compatibility.
- Similarity to public antibody families.
- Whether generated candidates violate no-copy/FTO boundaries.

Decision behavior:

- xTrimoAbGen produces antigen-constrained candidates.
- Open-source model output is used as plausibility and diversity sanity check.
- Open-source generated sequences are not automatically promoted to primary candidates.
- Public-family-similar candidates are blocked or downgraded even if model scores look good.

### Chapter 6: Developability And Risk Model Stack

Primary xTrimo models:

- `xTrimoAbAggregation`
- `xTrimoAbStability`
- `xTrimoAbSpecificity`
- `xTrimoAbPatentability`
- Optional: `xTrimoAbYield`

Open-source/rule-based comparators:

- `ANARCI` or OAS germline annotation mock.
- `Thera-SAbDab-style developability rules` mock.
- Simple liability motif scanner mock.

Comparison dimensions:

- Aggregation risk.
- Tm / stability risk.
- Specificity/off-target risk.
- Patent/FTO similarity.
- Germline distance and human-likeness.
- Expression/yield risk.

Decision behavior:

- Aggregation high risk, high public similarity, and high specificity risk can hard-block primary inclusion.
- Expression/yield risk should normally be a ranking penalty, not an automatic rejection, matching the existing user preference.
- The Agent should explain whether each model is being used as a hard gate, soft penalty, or review signal.

### Chapter 7: Model Consensus And Human Decision

Purpose:

- Summarize xTrimo and open-source agreement before final candidate ranking.
- Show why some candidates are selected, downgraded, or excluded.

Expected output:

- `TargetX_model_consensus_matrix.csv`
- `TargetX_model_call_audit.json`
- `TargetX_candidate_model_decision_log.md`

Decision language:

- `Adopt xTrimo as primary ranking signal`
- `Use open-source as sanity check`
- `Downgrade due to model disagreement`
- `Send to human review`
- `Keep only as E3 control`

## New Block Type

Add a reusable conversation block:

`modelCallComparison`

Required fields:

- `title`
- `subtitle`
- `primaryModel`
  - `name`
  - `provider`
  - `version`
  - `purpose`
  - `inputSummary`
  - `outputSummary`
  - `status`
- `comparatorModel`
  - same shape as primary model
- `metrics`
  - rows with metric name, xTrimo value, open-source value, agreement status, interpretation
- `decision`
  - `primary`, `backup`, `review`, `reject`, or `control`
- `decisionText`
- `riskNote`
- optional `artifacts`

Visual behavior:

- Render as a structured card, not a collapsed capability log.
- Header should make model pair obvious, for example:
  `xTrimoAbFold v1.2 × IgFold`
- Use a compact two-column model summary.
- Use a small comparison table for metrics.
- Use a colored decision strip:
  - green: primary/adopt
  - blue: backup/control
  - amber: review
  - red: reject
- Keep typography dense enough for chat, but clearer than the generic `capabilityRunReplay` card.

## Existing Block Usage

Keep `capabilityRunReplay` for generic steps such as input preparation, artifact packaging, and release package writing.

Use `modelCallComparison` for model-vs-model comparison only.

Use existing `dataChart` or `candidateEvidenceTable` for summary views:

- candidate count through model gates
- xTrimo/open-source agreement matrix
- final primary/backup/control distribution

## Suggested Insertion Points

Current discovery flow can be updated approximately as follows:

1. Keep turns 1-31 mostly intact through epitope hypothesis.
2. Insert `Model Workbench · 生物大模型调用与对照`.
3. Add 15-22 turns covering model input preparation and six model comparison chapters.
4. Resume candidate filtering/ranking with the model consensus outputs.
5. Update final candidate rationale so ABX-014, ABX-027, ABX-033, ABX-041, and ABX-052 decisions reference model agreement or disagreement.

## Example Cards

### Fv Structure Cross-check

Title:

`Fv structure cross-check`

Primary:

- `xTrimoAbFold v1.2`
- Purpose: production Fv structure prediction for Target-X candidate queue.
- Output: CDR confidence, VH/VL packing, fold risk.

Comparator:

- `IgFold open-source`
- Purpose: independent Fv sanity check.
- Output: CDR loop confidence and packing disagreement flags.

Metrics:

| Metric | xTrimo | Open-source | Agreement | Interpretation |
| --- | --- | --- | --- | --- |
| ABX-014 CDRH3 | stable | stable | agree | enter docking queue |
| ABX-027 CDRH3 | stable | stable | agree | enter docking queue |
| ABX-041 CDRH3 | medium | unstable | disagree | downgrade to backup |
| ABX-052 packing | medium | low | disagree | review only |

Decision:

`ABX-014 / ABX-027 remain primary candidates; ABX-041 is downgraded before final ranking.`

### Docking And Epitope Consistency

Primary:

- `xTrimoAbAgDock v1.2`

Comparator:

- `HADDOCK open-source`

Metrics:

- D2/D3 contact probability.
- E1/E2/E3 assignment.
- Interface agreement.

Decision:

- ABX-014: E1 agreement, keep primary.
- ABX-027: adjacent E1/E2, keep primary as diversity.
- ABX-041: E2 only and FTO risk, backup.

## Run Inspector Updates

Update Target-X discovery run inspector:

- Increase total steps to include model input preparation and model comparison.
- Add progress items:
  - model input batch
  - antigen structure cross-check
  - Fv structure cross-check
  - docking and epitope consistency
  - candidate generation model comparison
  - developability model stack
  - model consensus
- Add capability run records for model calls or model comparison artifacts.
- Add outputs:
  - `TargetX_model_input_batch.json`
  - `TargetX_model_consensus_matrix.csv`
  - `TargetX_model_call_audit.json`
  - `TargetX_candidate_model_decision_log.md`

## Side Window Files

Update object storage for `targetx-antibody-discovery` with:

- `TargetX_model_input_batch.json`
- `TargetX_xtrimo_abfold_results.json`
- `TargetX_igfold_crosscheck.json`
- `TargetX_xtrimo_abagdock_results.json`
- `TargetX_haddock_crosscheck.json`
- `TargetX_abgen_candidate_batch.json`
- `TargetX_iglm_plausibility_check.csv`
- `TargetX_model_consensus_matrix.csv`
- `TargetX_model_call_audit.json`
- `TargetX_candidate_model_decision_log.md`

The files should be mock object-storage records and previewable where current side-window preview supports the file type.

## Tests

Add or update tests to assert:

- Target-X discovery thread contains `modelCallComparison` blocks.
- At least one xTrimo model and one open-source model appear in each model comparison block.
- The discovery Thread still has at least 60 turns and at least 12 user turns.
- The discovery Thread still does not contain `EGFR`.
- Run inspector includes model-related progress items and outputs.
- Side-window object storage includes model call and consensus files.
- `ConversationBlocks` renders the new model comparison card.

## Out Of Scope

- Real model API calls.
- Real xTrimo or open-source model execution.
- Adding model calls to the LIMS execution or fine-tuning Threads.
- Changing Assets model registry data, except referencing existing model names in the Thread.
- Replacing current Target-X frontend diagrams.

## Implementation Notes

- Keep all biological outputs synthetic and framed as mock/demo evidence.
- Use xTrimo model names already present in Assets where possible.
- Avoid presenting model consensus as a final biological decision.
- Make the AI text explain why model disagreement changes candidate handling.
- Prefer adding a new typed block over overloading `capabilityRunReplay`; it will make the demo clearer and easier to test.
