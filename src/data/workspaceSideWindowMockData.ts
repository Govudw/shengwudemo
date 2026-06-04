import enzymeExperimentAnomalyLog from '../assets/mock-science/enzyme/enzyme-experiment-anomaly-log.png'
import enzymeExperimentNotebookPolling from '../assets/mock-science/enzyme/enzyme-experiment-notebook-polling.png'
import enzymeExperimentRecordSummary from '../assets/mock-science/enzyme/enzyme-experiment-record-summary.png'
import enzymeResultPackageQcOverview from '../assets/mock-science/enzyme/enzyme-result-package-qc-overview.png'

export type SideWindowFilePreviewKind =
  | 'markdown'
  | 'json'
  | 'image'
  | 'unsupported'

export type SideWindowFileDirectory =
  | 'Design'
  | 'Execution'
  | 'ELN'
  | 'Results'
  | 'Reports'
  | 'Figures'

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

const threadFileSeeds: Record<string, SideWindowFileSeed[]> = {
  'enzyme-experiment-execution': executionThreadFiles,
  'enzyme-full-loop': executionThreadFiles.slice(0, 14),
  'enzyme-design-breakdown': executionThreadFiles.slice(0, 9),
  'enzyme-analysis-iteration': executionThreadFiles.slice(14, 24),
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

  return 'unsupported'
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
