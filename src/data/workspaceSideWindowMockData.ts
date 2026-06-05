import enzymeExperimentAnomalyLog from '../assets/mock-science/enzyme/enzyme-experiment-anomaly-log.png'
import enzymeExperimentNotebookPolling from '../assets/mock-science/enzyme/enzyme-experiment-notebook-polling.png'
import enzymeExperimentRecordSummary from '../assets/mock-science/enzyme/enzyme-experiment-record-summary.png'
import enzymeResultPackageQcOverview from '../assets/mock-science/enzyme/enzyme-result-package-qc-overview.png'

export type SideWindowFilePreviewKind =
  | 'markdown'
  | 'json'
  | 'image'
  | 'spreadsheet'
  | 'unsupported'

export type SideWindowFileDirectory =
  | 'Design'
  | 'Execution'
  | 'ELN'
  | 'Results'
  | 'Reports'
  | 'Figures'
  | 'Runs/RUN-ENZ-SYN-20260604-001/inputs'
  | 'Runs/RUN-ENZ-SYN-20260604-001/approvals'
  | 'Runs/RUN-ENZ-SYN-20260604-001/work_orders'
  | 'Runs/RUN-ENZ-SYN-20260604-001/callbacks'
  | 'Runs/RUN-ENZ-SYN-20260604-001/qc'
  | 'Runs/RUN-ENZ-SYN-20260604-001/exceptions'
  | 'Runs/RUN-ENZ-SYN-20260604-001/results'
  | 'Runs/RUN-ENZ-SYN-20260604-001/analysis'

export type SideWindowFileAsset = {
  id: string
  fileName: string
  extension: string
  directory: SideWindowFileDirectory
  objectPath: string
  sourceLabel: string
  sizeLabel: string
  updatedAt: string
  statusLabel: string
  previewKind: SideWindowFilePreviewKind
  content?: string
  imageSrc?: string
  spreadsheetPreview?: SideWindowSpreadsheetPreview
}

export type SideWindowSpreadsheetPreview = {
  sheetName: string
  summary: string
  columns: string[]
  rows: string[][]
  totalRows: number
}

type SideWindowFileSeed = Omit<
  SideWindowFileAsset,
  'id' | 'extension' | 'objectPath' | 'previewKind'
>

const executionThreadFiles: SideWindowFileSeed[] = [
  {
    fileName: 'ENZ-LIB-20260602-048_design_brief.md',
    directory: 'Design',
    sourceLabel: 'Design Thread',
    sizeLabel: '84 KB',
    updatedAt: '2026-06-02 10:15',
    statusLabel: '已保存',
    content: `# ENZ-LIB-20260602-048 Design Brief

Summary: ENZ-P0 is the parent enzyme. This handoff freezes ENZ-MUT-001 through ENZ-MUT-048 for small-scale execution.

| Boundary | Value |
| --- | --- |
| Parent enzyme | ENZ-P0 |
| Variant count | 48 |
| Primary readouts | Activity, kcat/Km proxy, Tm, pH window, expression |
| Expansion policy | No automatic next-round design |

- Keep raw readings traceable to plate position.
- Flag abnormal wells instead of excluding them automatically.
- Return a result package suitable for analysis and iteration planning.`,
  },
  {
    fileName: 'ENZ-P0_variant_boundary.json',
    directory: 'Design',
    sourceLabel: 'Current Thread',
    sizeLabel: '18 KB',
    updatedAt: '2026-06-02 10:18',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        parentEnzyme: 'ENZ-P0',
        libraryId: 'ENZ-LIB-20260602-048',
        firstVariant: 'ENZ-MUT-001',
        lastVariant: 'ENZ-MUT-048',
        candidateCount: 48,
        controls: ['ENZ-P0', 'heat-inactivated ENZ-P0', 'blank'],
        lockedReadouts: ['activity', 'kcatKmProxy', 'Tm', 'pHWindow', 'expression'],
        automaticPassThrough: false,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'ENZ-MUT-001_to_048_variant_table.xlsx',
    directory: 'Design',
    sourceLabel: 'Design Thread',
    sizeLabel: '312 KB',
    updatedAt: '2026-06-02 10:20',
    statusLabel: '只读',
  },
  {
    fileName: 'active_site_constraints.json',
    directory: 'Design',
    sourceLabel: 'ProteinDesign Agent',
    sizeLabel: '24 KB',
    updatedAt: '2026-06-02 10:22',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        catalyticPocket: 'ENZ-P0 active-site cleft',
        mutableRegions: ['loop_A', 'loop_C', 'substrate_gate'],
        protectedResidues: ['H57', 'D102', 'S195'],
        maxMutationsPerVariant: 4,
        disallowedMotifs: ['glycosylation_site_creation', 'cysteine_pair_break'],
        structuralReviewRequired: true,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'BM-LAB-ENZ-20260602-001_order_summary.md',
    directory: 'Execution',
    sourceLabel: 'Current Thread',
    sizeLabel: '52 KB',
    updatedAt: '2026-06-02 11:31',
    statusLabel: '已保存',
    content: `# BM-LAB-ENZ-20260602-001 Order Summary

This order authorizes only the confirmed execution scope for ENZ-LIB-20260602-048.

| Section | Locked value |
| --- | --- |
| Library | ENZ-LIB-20260602-048 |
| Parent control | ENZ-P0 |
| Plate count | 2 x 96-well plates |
| Replicates | 2 biological replicates, duplicate reads |
| Result package | Enzyme_Experiment_Result_Package.xlsx |

- The order does not trigger additional design.
- The experiment task starts only after Lab Owner approval.
- All exception notes remain in the record package.`,
  },
  {
    fileName: 'BM-LAB-ENZ-20260602-001_order_payload.json',
    directory: 'Execution',
    sourceLabel: 'Current Thread',
    sizeLabel: '20 KB',
    updatedAt: '2026-06-02 11:31',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        orderId: 'BM-LAB-ENZ-20260602-001',
        taskId: 'ENZ-EXPTASK-20260602-001',
        libraryId: 'ENZ-LIB-20260602-048',
        parentEnzyme: 'ENZ-P0',
        candidateCount: 48,
        assayPanel: ['activity', 'kcatKmProxy', 'Tm', 'pHWindow', 'expression'],
        approvalMode: 'lab_owner_required',
        downstreamDesign: 'disabled',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'ENZ-PLATEMAP-20260602-001.json',
    directory: 'Execution',
    sourceLabel: 'Current Thread',
    sizeLabel: '32 KB',
    updatedAt: '2026-06-02 11:34',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        plateMapId: 'ENZ-PLATEMAP-20260602-001',
        plateCount: 2,
        format: '96-well',
        controlWells: ['A1', 'A12', 'H1', 'H12'],
        strategy: 'row-wise variants with interleaved controls',
        lockedBy: 'Lab Owner',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'Enzyme_Assay_SOP_v3.md',
    directory: 'Execution',
    sourceLabel: 'Lab Owner',
    sizeLabel: '116 KB',
    updatedAt: '2026-06-01 16:40',
    statusLabel: '已归档',
    content: `# Enzyme Assay SOP v3

Applies to small-scale activity and stability screening for ENZ-P0 derivative libraries.

| Step | Control |
| --- | --- |
| Sample normalization | Protein concentration normalized before plate setup |
| Activity read | Fluorogenic substrate, duplicate reads |
| Kinetics proxy | Initial-rate window only |
| Exception policy | Preserve raw reads and flag exceptions |

- Use PR-3107 plate reader only for this batch.
- Substrate lot must pass release before activity read.
- Z-factor target is >= 0.6 per assay plate.`,
  },
  {
    fileName: 'Substrate_Lot_QC_202606.xlsx',
    directory: 'Execution',
    sourceLabel: 'Lab Owner',
    sizeLabel: '248 KB',
    updatedAt: '2026-06-01 18:10',
    statusLabel: '只读',
  },
  {
    fileName: 'PR-3107_material_route.json',
    directory: 'Execution',
    sourceLabel: 'Data Steward',
    sizeLabel: '16 KB',
    updatedAt: '2026-06-02 11:36',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        deviceId: 'PR-3107',
        substrateLot: 'SUB-LOT-202606',
        bufferLot: 'BUF-TRIS-202606',
        route: ['sample_prep', 'plate_setup', 'plate_read', 'result_ingest'],
        calibrationValidUntil: '2026-06-30',
        materialRelease: 'passed',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'ELN-ENZ-20260602-117_summary.md',
    directory: 'ELN',
    sourceLabel: 'Current Thread',
    sizeLabel: '66 KB',
    updatedAt: '2026-06-04 15:42',
    statusLabel: '已保存',
    content: `# ELN-ENZ-20260602-117 Summary

The experiment notebook returned sample handling, assay conditions, read records, QC controls, exception notes, and attachments.

| Section | Summary |
| --- | --- |
| Sample handling | 48 candidates and 4 controls aliquoted and plate-linked |
| Assay conditions | SOP v3, SUB-LOT-202606, PR-3107 |
| Read records | Activity, kcat/Km proxy, Tm, pH window, expression |
| Exceptions | Flagged only; no automatic exclusion |

- Submitted by Tech_A / Lab B.
- Callback id: CALLBACK-ELN-ENZ-20260602-117.
- Ready for result package ingestion.`,
  },
  {
    fileName: 'ELN-ENZ-20260602-117_raw_record.json',
    directory: 'ELN',
    sourceLabel: 'Experiment Notebook',
    sizeLabel: '144 KB',
    updatedAt: '2026-06-04 15:42',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        notebookId: 'ELN-ENZ-20260602-117',
        orderId: 'BM-LAB-ENZ-20260602-001',
        submittedBy: 'Tech_A / Lab B',
        submittedAt: '2026-06-04 15:42',
        readRecordCount: 576,
        exceptionCount: 7,
        attachmentCount: 6,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'CALLBACK-ELN-ENZ-20260602-117.json',
    directory: 'ELN',
    sourceLabel: 'Experiment Notebook',
    sizeLabel: '14 KB',
    updatedAt: '2026-06-04 15:42',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        callbackId: 'CALLBACK-ELN-ENZ-20260602-117',
        taskId: 'ENZ-EXPTASK-20260602-001',
        callbackType: 'experiment_notebook_ingested',
        payloadSections: ['sample_handling', 'assay_conditions', 'read_records', 'qc', 'attachments'],
        blockingIssue: false,
        nextAction: 'ingest_result_package',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'lab_exception_flags.md',
    directory: 'ELN',
    sourceLabel: 'Lab Owner',
    sizeLabel: '26 KB',
    updatedAt: '2026-06-04 15:45',
    statusLabel: '待确认',
    content: `# Lab Exception Flags

Exception flags are retained for analysis review and are not removed from the raw record.

| Flag | Count | Handling |
| --- | ---: | --- |
| edge-effect | 3 | keep raw read, mark flag |
| low-expression | 2 | keep record, review expression link |
| pipetting note | 2 | keep note, no exclusion |

- No automatic pass/fail changes were applied.
- All flags are tied to well and sample identifiers.`,
  },
  {
    fileName: 'activity_normalized_matrix.json',
    directory: 'Results',
    sourceLabel: 'Current Thread',
    sizeLabel: '98 KB',
    updatedAt: '2026-06-04 15:52',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        matrixId: 'ACTIVITY-NORM-ENZ-20260604',
        orderId: 'BM-LAB-ENZ-20260602-001',
        samples: 48,
        controls: 4,
        normalization: 'parent_ENZ_P0_relative_activity',
        units: 'relative_activity_percent',
        flaggedRows: 7,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'kcatKm_proxy_fit_summary.json',
    directory: 'Results',
    sourceLabel: 'Analysis Thread',
    sizeLabel: '72 KB',
    updatedAt: '2026-06-04 16:02',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        fitId: 'KCATKM-PROXY-ENZ-20260604',
        model: 'initial_rate_proxy',
        variantCount: 48,
        acceptedFits: 43,
        reviewRequired: 5,
        topCandidate: 'ENZ-MUT-021',
        confidenceLabel: 'ranking_support_only',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'Tm_pH_expression_qc.json',
    directory: 'Results',
    sourceLabel: 'Analysis Thread',
    sizeLabel: '64 KB',
    updatedAt: '2026-06-04 16:08',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        qcId: 'TM-PH-EXPR-QC-ENZ-20260604',
        tmWindow: '45-80 C',
        pHWindow: '3-9',
        expressionMetric: 'relative_expression_percent',
        hardFailures: 3,
        humanReviewRows: 9,
        retainedForIteration: true,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'Enzyme_Experiment_Result_Package.xlsx',
    directory: 'Results',
    sourceLabel: 'Current Thread',
    sizeLabel: '2.8 MB',
    updatedAt: '2026-06-04 15:50',
    statusLabel: '只读',
  },
  {
    fileName: 'ENZ_raw_readout_summary.csv',
    directory: 'Results',
    sourceLabel: 'Result Package Receiver',
    sizeLabel: '240 KB',
    updatedAt: '2026-06-04 15:50',
    statusLabel: '只读',
  },
  {
    fileName: 'experiment_execution_report.md',
    directory: 'Reports',
    sourceLabel: 'Current Thread',
    sizeLabel: '58 KB',
    updatedAt: '2026-06-04 16:15',
    statusLabel: '已保存',
    content: `# Experiment Execution Report

BM-LAB-ENZ-20260602-001 completed the planned small-scale execution for ENZ-LIB-20260602-048.

| Item | Result |
| --- | --- |
| Experiment task | ENZ-EXPTASK-20260602-001 |
| Notebook callback | CALLBACK-ELN-ENZ-20260602-117 |
| Result package | Enzyme_Experiment_Result_Package.xlsx |
| Blocking issue | None |

- Exceptions remain visible as flags.
- Analysis can start from the returned package.
- No automatic design iteration was triggered.`,
  },
  {
    fileName: 'approval_decision_record.pdf',
    directory: 'Reports',
    sourceLabel: 'Lab Owner',
    sizeLabel: '420 KB',
    updatedAt: '2026-06-02 11:04',
    statusLabel: '已归档',
  },
  {
    fileName: 'next_iteration_recommendation.md',
    directory: 'Reports',
    sourceLabel: 'Analysis Thread',
    sizeLabel: '44 KB',
    updatedAt: '2026-06-04 16:18',
    statusLabel: '已保存',
    content: `# Next Iteration Recommendation

The returned data supports a human-reviewed next design round, not an automatic closed-loop decision.

| Recommendation | Reason |
| --- | --- |
| Prioritize ENZ-MUT-021 family | Activity and stability support are aligned |
| Review ENZ-MUT-017 | Edge-effect flag affects confidence |
| Keep ENZ-P0 controls | Required for normalization continuity |

- Use result data as evidence.
- Require expert confirmation before new library design.
- Preserve uncertainty notes in the next brief.`,
  },
  {
    fileName: 'enzyme-experiment-record-summary.png',
    directory: 'Figures',
    sourceLabel: 'Current Thread',
    sizeLabel: '690 KB',
    updatedAt: '2026-06-04 15:43',
    statusLabel: '已保存',
    imageSrc: enzymeExperimentRecordSummary,
  },
  {
    fileName: 'enzyme-experiment-notebook-polling.png',
    directory: 'Figures',
    sourceLabel: 'Current Thread',
    sizeLabel: '610 KB',
    updatedAt: '2026-06-04 14:40',
    statusLabel: '已保存',
    imageSrc: enzymeExperimentNotebookPolling,
  },
  {
    fileName: 'enzyme-result-package-qc-overview.png',
    directory: 'Figures',
    sourceLabel: 'Analysis Thread',
    sizeLabel: '650 KB',
    updatedAt: '2026-06-04 16:04',
    statusLabel: '已保存',
    imageSrc: enzymeResultPackageQcOverview,
  },
  {
    fileName: 'ELN-ENZ-20260602-117_attachment_bundle.zip',
    directory: 'ELN',
    sourceLabel: 'Current Thread',
    sizeLabel: '3.4 MB',
    updatedAt: '2026-06-04 15:43',
    statusLabel: '已归档',
  },
  {
    fileName: 'enzyme-experiment-anomaly-log.png',
    directory: 'Figures',
    sourceLabel: 'Lab Owner',
    sizeLabel: '480 KB',
    updatedAt: '2026-06-04 15:48',
    statusLabel: '待确认',
    imageSrc: enzymeExperimentAnomalyLog,
  },
]

const limsFlowRunFiles: SideWindowFileSeed[] = [
  {
    fileName: 'RUN-ENZ-SYN-20260604-001_input_package.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/inputs',
    sourceLabel: 'ProteinOps Agent',
    sizeLabel: '72 KB',
    updatedAt: '2026-06-04 09:12',
    statusLabel: '已锁定',
    content: `# RUN-ENZ-SYN-20260604-001 Input Package

| Field | Value |
| --- | --- |
| Pipeline | LIMS 酶合成执行 Pipeline v1.0 |
| Sample batch | ENZ-SYN-BATCH-048 |
| Inventory | INV-ENZ-SYN-202606 |
| Substrate lot | SUB-LOT-202606-A |
| SOP | SOP v4 |
| Result release approver | Project Owner |

The run scope is locked before run_start approval. Any sample, plate, SOP, device window, or delivery boundary change must return to input confirmation.`,
  },
  {
    fileName: 'LIMS_Enzyme_Synthesis_Pipeline_v1.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/inputs',
    sourceLabel: 'Pipeline Registry',
    sizeLabel: '46 KB',
    updatedAt: '2026-06-04 09:08',
    statusLabel: '已读取',
    content: JSON.stringify(
      {
        pipelineId: 'pipeline-enzyme-synthesis-lims',
        version: 'v1.0',
        runId: 'RUN-ENZ-SYN-20260604-001',
        nodeCount: 18,
        approvalTypes: ['run_start', 'rework_authorization', 'result_release'],
        qcGates: ['construction_qc', 'purification_qc', 'data_integrity_qc'],
      },
      null,
      2,
    ),
  },
  {
    fileName: 'RUN-ENZ-SYN-20260604-001_run_manifest.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/inputs',
    sourceLabel: 'Run Orchestrator',
    sizeLabel: '58 KB',
    updatedAt: '2026-06-04 09:13',
    statusLabel: '已锁定',
    content: JSON.stringify(
      {
        runId: 'RUN-ENZ-SYN-20260604-001',
        owner: 'Lab Owner',
        sampleBatch: 'ENZ-SYN-BATCH-048',
        controls: ['ENZ-P0 parent', 'blank buffer', 'inactive enzyme'],
        expectedWorkOrders: 5,
        releaseTarget: '2026-06-04 17:30',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'ENZ-SYN-BATCH-048_sample_manifest.xlsx',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/inputs',
    sourceLabel: 'Sample Registry',
    sizeLabel: '284 KB',
    updatedAt: '2026-06-04 09:11',
    statusLabel: '只读',
  },
  {
    fileName: 'RESOURCE-LOCK-ENZ-SYN-20260604.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/inputs',
    sourceLabel: 'LIMS Resource Planner',
    sizeLabel: '24 KB',
    updatedAt: '2026-06-04 09:15',
    statusLabel: '已锁定',
    content: JSON.stringify(
      {
        equipment: ['DNA Assembly Bench', 'AKTA Pure', 'PR-3107 Plate Reader'],
        benchWindow: '2026-06-04 09:30-16:20',
        substrateLot: 'SUB-LOT-202606-A',
        lockedBy: 'ProteinOps Agent',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'APPROVAL-run_start-20260604-0918.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/approvals',
    sourceLabel: 'Approval Gateway',
    sizeLabel: '16 KB',
    updatedAt: '2026-06-04 09:18',
    statusLabel: '已批准',
    content: JSON.stringify(
      {
        approvalType: 'run_start',
        approver: 'Lab Owner',
        requestedAt: '2026-06-04 09:12',
        decidedAt: '2026-06-04 09:18',
        decision: 'approved',
        advice: '允许本轮运行；仅限已锁定样本、设备窗口和结果包边界。',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'APPROVAL-rework_authorization-20260604-1244.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/approvals',
    sourceLabel: 'Approval Gateway',
    sizeLabel: '18 KB',
    updatedAt: '2026-06-04 12:44',
    statusLabel: '已批准',
    content: JSON.stringify(
      {
        approvalType: 'rework_authorization',
        approvalDisplayName: '质检审批',
        approver: 'Lab Owner',
        requestedAt: '2026-06-04 12:38',
        decidedAt: '2026-06-04 12:44',
        decision: 'approved',
        samples: ['ENZ-SYN-017', 'ENZ-SYN-032'],
      },
      null,
      2,
    ),
  },
  {
    fileName: 'APPROVAL-result_release-20260604-1710.pdf',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/approvals',
    sourceLabel: 'Project Owner',
    sizeLabel: '412 KB',
    updatedAt: '2026-06-04 17:10',
    statusLabel: '已归档',
  },
  {
    fileName: 'WO-BUNDLE-ENZ-SYN-001.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'Work Order Gateway',
    sizeLabel: '38 KB',
    updatedAt: '2026-06-04 09:41',
    statusLabel: '已派发',
    content: JSON.stringify(
      {
        bundleId: 'WO-BUNDLE-ENZ-SYN-001',
        runId: 'RUN-ENZ-SYN-20260604-001',
        workOrders: [
          'WO-CONSTRUCT-20260604-101',
          'WO-EXPRESS-20260604-102',
          'WO-PURIFY-20260604-103',
          'WO-ASSAY-20260604-104',
          'WO-INGEST-20260604-105',
        ],
        callbackEndpoints: 5,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'WO-CONSTRUCT-20260604-101.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'LIMS',
    sizeLabel: '34 KB',
    updatedAt: '2026-06-04 10:02',
    statusLabel: '完成',
    content: `# WO-CONSTRUCT-20260604-101

Construct execution for ENZ-SYN-BATCH-048.

| Item | Value |
| --- | --- |
| Owner | Tech_A / Lab B |
| Stage | DNA assembly / clone verification |
| Callback | CALLBACK-CONSTRUCT-101 |
| Result | 50 pass, 2 rework required |

Raw construction and sequencing notes are retained in the callback package.`,
  },
  {
    fileName: 'WO-EXPRESS-20260604-102.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'LIMS',
    sizeLabel: '31 KB',
    updatedAt: '2026-06-04 10:45',
    statusLabel: '完成',
    content: `# WO-EXPRESS-20260604-102

Expression work order for verified constructs.

| Item | Value |
| --- | --- |
| Owner | Tech_B / Fermentation bay |
| Stage | Yeast expression |
| Input samples | 50 verified constructs + controls |
| Callback | CALLBACK-EXPRESSION-102 |
| Result | 50 expression records returned |`,
  },
  {
    fileName: 'WO-PURIFY-20260604-103.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'LIMS',
    sizeLabel: '33 KB',
    updatedAt: '2026-06-04 12:18',
    statusLabel: '完成',
    content: `# WO-PURIFY-20260604-103

Purification work order for expression-positive samples.

| Item | Value |
| --- | --- |
| Owner | Tech_C / Protein purification |
| Method | AKTA small-column purification |
| QC | SDS-PAGE and yield threshold |
| Callback | CALLBACK-PURIFY-103 |
| Result | 48 ready for activity assay; 2 low-yield flags retained |`,
  },
  {
    fileName: 'WO-ASSAY-20260604-104.csv',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'LIMS',
    sizeLabel: '96 KB',
    updatedAt: '2026-06-04 13:35',
    statusLabel: '完成',
  },
  {
    fileName: 'WO-INGEST-20260604-105.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
    sourceLabel: 'LIMS',
    sizeLabel: '26 KB',
    updatedAt: '2026-06-04 15:05',
    statusLabel: '完成',
    content: `# WO-INGEST-20260604-105

Data ingest and normalization work order.

| Item | Value |
| --- | --- |
| Owner | DataOps / LIMS ingest |
| Input | Plate reader raw reads and ELN records |
| Output | structured_readouts.json |
| QC | Data integrity gate before result release |`,
  },
  {
    fileName: 'CALLBACK-CONSTRUCT-101.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
    sourceLabel: 'Callback Gateway',
    sizeLabel: '22 KB',
    updatedAt: '2026-06-04 10:30',
    statusLabel: '已接收',
    content: JSON.stringify(
      {
        callbackId: 'CALLBACK-CONSTRUCT-101',
        runId: 'RUN-ENZ-SYN-20260604-001',
        passed: 50,
        reworkRequired: ['ENZ-SYN-017', 'ENZ-SYN-032'],
        rawRecordsPreserved: true,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'CALLBACK-ASSAY-104.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
    sourceLabel: 'Plate Reader Gateway',
    sizeLabel: '42 KB',
    updatedAt: '2026-06-04 14:52',
    statusLabel: '已接收',
    content: JSON.stringify(
      {
        callbackId: 'CALLBACK-ASSAY-104',
        plates: ['PLATE-ENZ-SYN-001', 'PLATE-ENZ-SYN-002'],
        rawReadRows: 576,
        includedControls: 4,
        handoff: 'WO-INGEST-20260604-105',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'CALLBACK-INGEST-105.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
    sourceLabel: 'Data Ingest Service',
    sizeLabel: '36 KB',
    updatedAt: '2026-06-04 15:18',
    statusLabel: '已接收',
    content: JSON.stringify(
      {
        callbackId: 'CALLBACK-INGEST-105',
        normalizedRows: 612,
        schemaVersion: 'enzyme_readout.v4',
        outputDataset: 'DS-ENZ-SYN-20260604-001',
        qcGate: 'data_integrity_qc',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'CALLBACK-QC-204_summary.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
    sourceLabel: 'QC Rule Engine',
    sizeLabel: '28 KB',
    updatedAt: '2026-06-04 15:22',
    statusLabel: '已接收',
    content: JSON.stringify(
      {
        callbackId: 'CALLBACK-QC-204',
        readoutRows: 612,
        anomalyFlags: 6,
        constructionQc: 'passed_after_rework',
        purificationQc: 'passed_with_flags',
        dataIntegrity: 'passed',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'CALLBACK-QC-204_activity_timeline.png',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
    sourceLabel: 'QC Rule Engine',
    sizeLabel: '690 KB',
    updatedAt: '2026-06-04 15:23',
    statusLabel: '已保存',
    imageSrc: enzymeExperimentRecordSummary,
  },
  {
    fileName: 'construction_qc_summary.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/qc',
    sourceLabel: 'QC Rule Engine',
    sizeLabel: '32 KB',
    updatedAt: '2026-06-04 10:31',
    statusLabel: '已保存',
    content: `# Construction QC Summary

| Metric | Value |
| --- | --- |
| Passed samples | 50 |
| Rework samples | ENZ-SYN-017, ENZ-SYN-032 |
| Negative control | Pass |
| Raw records | Preserved |

The two rework samples were routed to rework_authorization and later resolved.`,
  },
  {
    fileName: 'purification_qc_summary.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/qc',
    sourceLabel: 'QC Rule Engine',
    sizeLabel: '20 KB',
    updatedAt: '2026-06-04 14:24',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        purityThreshold: '>=80%',
        lowYieldFlags: ['ENZ-SYN-006', 'ENZ-SYN-041'],
        blockingIssue: false,
        nextGate: 'assay_execution',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'data_integrity_qc.png',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/qc',
    sourceLabel: 'Data Ingest Service',
    sizeLabel: '650 KB',
    updatedAt: '2026-06-04 15:24',
    statusLabel: '已保存',
    imageSrc: enzymeResultPackageQcOverview,
  },
  {
    fileName: 'ANOMALY-ENZ-SYN-20260604-001.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/exceptions',
    sourceLabel: 'Lab Owner',
    sizeLabel: '30 KB',
    updatedAt: '2026-06-04 15:28',
    statusLabel: '待复核',
    content: `# Anomaly Flags

Exception flags are retained and are not used for automatic exclusion.

| Sample | Flag | Handling |
| --- | --- | --- |
| ENZ-SYN-006 | low yield | keep raw reading |
| ENZ-SYN-017 | rework construction | resolved |
| ENZ-SYN-032 | rework construction | resolved |
| ENZ-SYN-041 | low yield | keep raw reading |`,
  },
  {
    fileName: 'anomaly_distribution.png',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/exceptions',
    sourceLabel: 'Ops Analytics',
    sizeLabel: '480 KB',
    updatedAt: '2026-06-04 15:30',
    statusLabel: '已保存',
    imageSrc: enzymeExperimentAnomalyLog,
  },
  {
    fileName: 'EXCEPTION-RAW-LOG-20260604.zip',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/exceptions',
    sourceLabel: 'ELN',
    sizeLabel: '1.8 MB',
    updatedAt: '2026-06-04 15:31',
    statusLabel: '已归档',
  },
  {
    fileName: 'Enzyme_Synthesis_Result_Package.xlsx',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/results',
    sourceLabel: 'Report Builder',
    sizeLabel: '3.1 MB',
    updatedAt: '2026-06-04 16:18',
    statusLabel: '已发布',
  },
  {
    fileName: 'structured_readouts.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/results',
    sourceLabel: 'Data Ingest Service',
    sizeLabel: '128 KB',
    updatedAt: '2026-06-04 16:14',
    statusLabel: '已保存',
    content: JSON.stringify(
      {
        datasetId: 'DS-ENZ-SYN-20260604-001',
        rows: 612,
        samples: 52,
        readouts: ['activity', 'kcatKmProxy', 'Tm', 'pHWindow', 'expression'],
        anomalyFlagsRetained: true,
      },
      null,
      2,
    ),
  },
  {
    fileName: 'result_package_overview.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/results',
    sourceLabel: 'Report Builder',
    sizeLabel: '44 KB',
    updatedAt: '2026-06-04 16:18',
    statusLabel: '已保存',
    content: `# Result Package Overview

The result package contains structured readouts, QC summary, anomaly flags, figures, execution logs, and next-iteration notes.

Published file: Enzyme_Synthesis_Result_Package.xlsx`,
  },
  {
    fileName: 'RESULT-RELEASE-MANIFEST-20260604.json',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/results',
    sourceLabel: 'Report Builder',
    sizeLabel: '30 KB',
    updatedAt: '2026-06-04 17:10',
    statusLabel: '已发布',
    content: JSON.stringify(
      {
        releaseId: 'REL-ENZ-SYN-20260604-001',
        packageFile: 'Enzyme_Synthesis_Result_Package.xlsx',
        includedAssets: [
          'structured_readouts.json',
          'data_integrity_qc.png',
          'ANOMALY-ENZ-SYN-20260604-001.md',
          'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
        ],
        approval: 'APPROVAL-result_release-20260604-1710.pdf',
      },
      null,
      2,
    ),
  },
  {
    fileName: 'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/analysis',
    sourceLabel: 'Ops Analytics',
    sizeLabel: '52 KB',
    updatedAt: '2026-06-04 17:12',
    statusLabel: '已保存',
    content: `# Efficiency Review

| Stage | Planned | Actual | Note |
| --- | ---: | ---: | --- |
| Input confirmation | 20 min | 18 min | 4 rounds |
| Construction and QC wait | 150 min | 168 min | QC approval added 6 min |
| Expression and purification | 180 min | 173 min | handoff logged |
| Assay and ingest | 90 min | 84 min | integrity check passed |
| Result release | 30 min | 28 min | first package released |

## Cumulative node throughput

| Run | 18 nodes completed at | Note |
| --- | ---: | --- |
| RUN-ENZ-SYN-20260604-001 | 471 min | current run |
| RUN-ENZ-SYN-20260531-004 | 612 min | previous run |
| recent 5-run mean | 545 min | rolling baseline |

The main delay is construction and QC wait: QC approval and sample barcode confirmation added 11 min of wait time. The current run still finished 74 min faster than the recent 5-run mean and 141 min faster than the previous run. The recovery comes from assay and ingest: PR-3107 callback and data integrity QC passed on the first attempt, saving roughly 14 min versus the recent 5-run mean.`,
  },
  {
    fileName: 'next_round_candidate_notes.md',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/analysis',
    sourceLabel: 'Project Owner',
    sizeLabel: '36 KB',
    updatedAt: '2026-06-04 17:14',
    statusLabel: '已保存',
    content: `# Next Round Candidate Notes

- Review low-yield flags before expanding sample count.
- Keep active-site high-activity candidates but recheck Tm tradeoff.
- Do not automatically start a new design round from this run.`,
  },
  {
    fileName: 'ops_efficiency_breakdown.png',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/analysis',
    sourceLabel: 'Ops Analytics',
    sizeLabel: '610 KB',
    updatedAt: '2026-06-04 17:15',
    statusLabel: '已保存',
    imageSrc: enzymeExperimentNotebookPolling,
  },
]

const threadFileSeeds: Record<string, SideWindowFileSeed[]> = {
  'enzyme-experiment-execution': executionThreadFiles,
  'enzyme-full-loop': executionThreadFiles.slice(0, 14),
  'enzyme-design-breakdown': executionThreadFiles.slice(0, 9),
  'enzyme-analysis-iteration': executionThreadFiles.slice(14, 24),
  'lims-flow-run': limsFlowRunFiles,
}

export function getPreviewKindByExtension(
  extension: string,
): SideWindowFilePreviewKind {
  const normalized = extension.trim().replace(/^\./, '').toLowerCase()

  if (normalized === 'md') {
    return 'markdown'
  }

  if (normalized === 'json') {
    return 'json'
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(normalized)) {
    return 'image'
  }

  if (['csv', 'xls', 'xlsx'].includes(normalized)) {
    return 'spreadsheet'
  }

  return 'unsupported'
}

function getSpreadsheetPreviewByFileName(
  fileName: string,
): SideWindowSpreadsheetPreview | undefined {
  const spreadsheetPreviews: Record<string, SideWindowSpreadsheetPreview> = {
    'ENZ-MUT-001_to_048_variant_table.xlsx': {
      sheetName: 'Variant Boundary',
      summary: '48 个候选突变体的设计边界、突变区域和是否进入实验执行。',
      columns: ['variant_id', 'mutation_set', 'region', 'risk_flag', 'execution_scope'],
      totalRows: 48,
      rows: [
        ['ENZ-MUT-001', 'A42V / T88S', 'loop_A', 'none', 'included'],
        ['ENZ-MUT-012', 'L141F / G144A', 'substrate_gate', 'reviewed', 'included'],
        ['ENZ-MUT-017', 'S62A / N96D / V178I', 'loop_C', 'none', 'included'],
        ['ENZ-MUT-031', 'P77G / A181T', 'loop_A', 'stability watch', 'included'],
        ['ENZ-MUT-048', 'Y201F / R205K', 'substrate_gate', 'none', 'included'],
      ],
    },
    'Substrate_Lot_QC_202606.xlsx': {
      sheetName: 'Lot Release',
      summary: '底物批次放行、对照设置和异常复核记录。',
      columns: ['lot_id', 'release_status', 'purity_pct', 'blank_signal', 'owner'],
      totalRows: 6,
      rows: [
        ['SUB-LOT-202606', 'released', '98.7', 'within baseline', 'Lab Owner'],
        ['SUB-LOT-202606-A', 'released', '98.4', 'within baseline', 'Lab Owner'],
        ['SUB-LOT-202606-B', 'hold', '96.1', 'slightly high', 'QC Owner'],
        ['CTRL-FLUOR-01', 'released', '99.1', 'within baseline', 'QC Owner'],
      ],
    },
    'Enzyme_Experiment_Result_Package.xlsx': {
      sheetName: 'Summary',
      summary: 'ENZ-LIB-20260602-048 结果包摘要，包含活性、稳定性、表达和 QC flag。',
      columns: [
        'variant_id',
        'activity_pct',
        'kcatKm_proxy',
        'Tm_c',
        'pH_window',
        'expression_pct',
        'qc_flag',
      ],
      totalRows: 52,
      rows: [
        ['ENZ-P0', '100.0', '1.00', '62.1', '5.5-8.0', '100', 'control'],
        ['ENZ-MUT-003', '118.4', '1.16', '63.7', '5.0-8.0', '94', 'pass'],
        ['ENZ-MUT-017', '136.2', '1.31', '66.5', '5.5-8.5', '89', 'candidate'],
        ['ENZ-MUT-028', '82.7', '0.78', '69.2', '4.5-8.0', '91', 'stability'],
        ['ENZ-MUT-041', '47.3', '0.44', '58.6', '5.5-7.0', '63', 'low activity'],
      ],
    },
    'ENZ_raw_readout_summary.csv': {
      sheetName: 'CSV preview',
      summary: '板读仪原始读数摘要，按 well、variant 和读数类型保留 QC flag。',
      columns: ['well', 'variant_id', 'readout', 'value', 'unit', 'qc_flag'],
      totalRows: 576,
      rows: [
        ['A01', 'ENZ-P0', 'activity', '100.0', '%', 'control'],
        ['A03', 'ENZ-MUT-017', 'activity', '136.2', '%', 'pass'],
        ['B07', 'ENZ-MUT-028', 'Tm', '69.2', 'C', 'pass'],
        ['D11', 'ENZ-MUT-041', 'expression', '63', '%', 'low expression'],
        ['H12', 'blank', 'background', '0.8', 'RFU', 'blank'],
      ],
    },
    'ENZ-SYN-BATCH-048_sample_manifest.xlsx': {
      sheetName: 'Sample Manifest',
      summary: '样本登记、板位、条码和物料状态，用于 LIMS Pipeline 输入确认。',
      columns: [
        'sample_id',
        'variant_id',
        'plate',
        'well',
        'barcode',
        'material_state',
        'status',
      ],
      totalRows: 52,
      rows: [
        ['ENZ-SYN-001', 'ENZ-P0', 'P1', 'A01', 'BC-ENZ-001', 'control ready', '样本登记'],
        ['ENZ-SYN-003', 'ENZ-MUT-003', 'P1', 'A03', 'BC-ENZ-003', 'aliquoted', '样本登记'],
        ['ENZ-SYN-019', 'ENZ-MUT-017', 'P1', 'C07', 'BC-ENZ-019', 'aliquoted', '样本登记'],
        ['ENZ-SYN-031', 'ENZ-MUT-028', 'P2', 'B05', 'BC-ENZ-031', 'aliquoted', '样本登记'],
        ['ENZ-SYN-049', 'blank buffer', 'P2', 'H12', 'BC-ENZ-049', 'control ready', '样本登记'],
      ],
    },
    'WO-ASSAY-20260604-104.csv': {
      sheetName: 'Assay Dispatch',
      summary: '活性检测工单的板位、读数窗口和回调编号。',
      columns: ['work_order', 'plate', 'assay', 'read_window', 'callback', 'state'],
      totalRows: 12,
      rows: [
        ['WO-ASSAY-104', 'P1', 'activity', '13:10-13:35', 'CALLBACK-ASSAY-104', 'complete'],
        ['WO-ASSAY-104', 'P1', 'kcatKm_proxy', '13:38-14:05', 'CALLBACK-ASSAY-104', 'complete'],
        ['WO-ASSAY-104', 'P2', 'activity', '14:10-14:35', 'CALLBACK-ASSAY-104', 'complete'],
        ['WO-ASSAY-104', 'P2', 'pH_window', '14:40-15:05', 'CALLBACK-ASSAY-104', 'complete'],
      ],
    },
    'Enzyme_Synthesis_Result_Package.xlsx': {
      sheetName: 'Release Summary',
      summary: 'LIMS 流程运行输出结果包，包含节点状态、结果释放和异常保留。',
      columns: ['section', 'record_count', 'status', 'released_to', 'note'],
      totalRows: 9,
      rows: [
        ['input_package', '4', 'locked', 'Project Owner', 'scope confirmed'],
        ['work_orders', '5', 'complete', 'Lab Ops', 'callbacks ingested'],
        ['qc_gates', '3', 'passed', 'Project Owner', '2 flags retained'],
        ['readouts', '576', 'released', 'Analysis Agent', 'schema checked'],
        ['exceptions', '6', 'retained', 'Project Owner', 'no auto exclusion'],
      ],
    },
  }

  return spreadsheetPreviews[fileName]
}

export function buildThreadObjectStorageFiles(
  projectName: string,
  threadId: string,
): SideWindowFileAsset[] {
  const seeds = threadFileSeeds[threadId] ?? []

  return seeds.map((seed, index) => {
    const extension = getFileExtension(seed.fileName)

    return {
      id: `${threadId}-side-window-file-${String(index + 1).padStart(2, '0')}`,
      fileName: seed.fileName,
      extension,
      directory: seed.directory,
      objectPath: `${projectName}/${seed.directory}/${seed.fileName}`,
      sourceLabel: seed.sourceLabel,
      sizeLabel: seed.sizeLabel,
      updatedAt: seed.updatedAt,
      statusLabel: seed.statusLabel,
      previewKind: getPreviewKindByExtension(extension),
      content: seed.content,
      imageSrc: seed.imageSrc,
      spreadsheetPreview: getSpreadsheetPreviewByFileName(seed.fileName),
    }
  })
}

export function filterSideWindowFiles(
  files: SideWindowFileAsset[],
  query: string,
): SideWindowFileAsset[] {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return files
  }

  return files.filter((file) =>
    [file.fileName, file.objectPath, file.sourceLabel].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    ),
  )
}

function getFileExtension(fileName: string): string {
  const extension = fileName.split('.').pop()

  return extension === fileName || !extension ? '' : extension.toLowerCase()
}
