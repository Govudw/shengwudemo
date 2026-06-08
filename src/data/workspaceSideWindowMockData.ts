import enzymeExperimentAnomalyLog from '../assets/mock-science/enzyme/enzyme-experiment-anomaly-log.png'
import enzymeExperimentNotebookPolling from '../assets/mock-science/enzyme/enzyme-experiment-notebook-polling.png'
import enzymeExperimentRecordSummary from '../assets/mock-science/enzyme/enzyme-experiment-record-summary.png'
import enzymeResultPackageQcOverview from '../assets/mock-science/enzyme/enzyme-result-package-qc-overview.png'

export type SideWindowFilePreviewKind =
  | 'markdown'
  | 'json'
  | 'eln'
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
  | 'Runs/RUN-ENZ-SYN-20260604-001/eln'
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
  elnDocument?: SideWindowElnDocument
}

export type SideWindowSpreadsheetPreview = {
  sheetName: string
  summary: string
  columns: string[]
  rows: string[][]
  totalRows: number
}

export type SideWindowElnDocument = {
  formatVersion: 'bmeln.v1'
  revision: number
  schemaVersion: 'biomap.eln.v1'
  revisionLabel: string
  notebook: {
    notebookId: string
    runId: string
    projectName: string
    status: string
    owner: string
    generatedAt: string
  }
  sections: Array<{
    id: string
    title: string
    state: 'complete' | 'flagged' | 'draft'
    summary: string
  }>
  document: {
    type: 'doc'
    content: Array<Record<string, unknown>>
  }
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

type ElnDocumentNode = SideWindowElnDocument['document']['content'][number]

const elnHeading = (level: 1 | 2 | 3, text: string): ElnDocumentNode => ({
  type: 'heading',
  attrs: { level },
  content: [{ type: 'text', text }],
})

const elnParagraph = (text: string): ElnDocumentNode => ({
  type: 'paragraph',
  content: [{ type: 'text', text }],
})

const elnTable = (rows: string[][]): ElnDocumentNode => ({
  type: 'table',
  content: rows.map((row) => ({
    type: 'tableRow',
    content: row.map((text) => ({
      type: 'tableCell',
      content: [elnParagraph(text)],
    })),
  })),
})

const elnChartBlock = (attrs: Record<string, unknown>): ElnDocumentNode => ({
  type: 'elnChartBlock',
  attrs,
})

const elnSignatureBlock = (attrs: Record<string, unknown>): ElnDocumentNode => ({
  type: 'elnSignatureBlock',
  attrs,
})

const elnAttachmentBlock = (attrs: Record<string, unknown>): ElnDocumentNode => ({
  type: 'elnAttachmentBlock',
  attrs,
})

const limsExperimentRecordEln: SideWindowElnDocument = {
  formatVersion: 'bmeln.v1',
  revision: 1,
  schemaVersion: 'biomap.eln.v1',
  revisionLabel: 'Released mock v2.0 · final review pending',
  notebook: {
    notebookId: 'ELN-RUN-ENZ-SYN-20260604-001',
    runId: 'RUN-ENZ-SYN-20260604-001',
    projectName: 'Enzyme Synthesis Ops',
    status: 'released / editable / final review pending',
    owner: 'ProteinOps Agent',
    generatedAt: '2026-06-04 09:18',
  },
  sections: [
    {
      id: 'basic-info',
      title: '实验基本信息',
      state: 'complete',
      summary: '实验编号、样本批次、SOP、设备窗口和记录来源已登记。',
    },
    {
      id: 'objective-boundary',
      title: '实验目的与边界',
      state: 'complete',
      summary: '本轮目标、读数边界和不自动扩样策略已明确。',
    },
    {
      id: 'materials-equipment',
      title: '材料、设备与执行条件',
      state: 'complete',
      summary: '库存、底物、缓冲液、SOP v4、LCQ-03 和 PR-3107 已追溯。',
    },
    {
      id: 'sample-registry-and-plate-map',
      title: '样本登记与板图',
      state: 'complete',
      summary: '48 个候选、4 个对照、条码批次和两块 96-well 板图已登记。',
    },
    {
      id: 'execution-timeline',
      title: '实验流程与时间线',
      state: 'complete',
      summary: '从 run_start 到 result_release 的关键时间线已整理。',
    },
    {
      id: 'construct-and-rework',
      title: '构建执行与返工记录',
      state: 'complete',
      summary: '构建覆盖不足样本 ENZ-SYN-017 和 ENZ-SYN-032 已返工 resolved。',
    },
    {
      id: 'expression-records',
      title: '表达记录',
      state: 'complete',
      summary: '52 条 expression records 已入库，表达作为结果上下文保留。',
    },
    {
      id: 'purification-records',
      title: '纯化记录',
      state: 'flagged',
      summary: 'AKTA small-column purification 完成，ENZ-SYN-006 和 ENZ-SYN-041 保留低收率 flag。',
    },
    {
      id: 'qc-characterization',
      title: '质量分析与表征',
      state: 'complete',
      summary: 'activity、kcat/Km proxy、Tm、pH window 和 expression 指标完成结构化登记。',
    },
    {
      id: 'results-and-raw-data',
      title: '结果与原始数据',
      state: 'complete',
      summary: '正文展示摘要与代表性读数，612 条结构化读数通过数据集追溯。',
    },
    {
      id: 'exceptions-and-deviations',
      title: '异常与偏差记录',
      state: 'flagged',
      summary: '构建返工、低收率、边缘孔波动和附件补录均保留原始记录。',
    },
    {
      id: 'result-package-links',
      title: '结果包与数据追溯',
      state: 'complete',
      summary: '结果包、结构化读数、QC 摘要、异常清单和审批文件已回链。',
    },
    {
      id: 'efficiency-and-next-step',
      title: '效率复盘与下一步计划',
      state: 'complete',
      summary: '本轮总耗时 471 min，比最近 5 轮均值快 74 min。',
    },
    {
      id: 'review-and-signature',
      title: '审核与签名',
      state: 'draft',
      summary: '启动、返工、结果释放签名已记录，Data Steward 和 Experiment Owner 预留复核位。',
    },
  ],
  document: {
    type: 'doc',
    content: [
      elnHeading(1, '酶合成实验记录'),
      elnParagraph(
        '本记录覆盖 RUN-ENZ-SYN-20260604-001 的酶合成执行、样本登记、工单回调、QC 判定、结构化读数、异常保留、结果释放和后续复核建议。记录仅引用当前 mock 已存在的样本、设备、批次、工单和结果资产，不新增宿主菌株、质粒或载体信息。',
      ),
      elnHeading(2, '实验基本信息'),
      elnTable([
        ['字段', '记录值', '追溯来源'],
        ['实验编号', 'RUN-ENZ-SYN-20260604-001', 'RUN manifest'],
        ['ELN 编号', 'ELN-RUN-ENZ-SYN-20260604-001', 'bmeln document metadata'],
        ['实验名称', '酶合成执行与活性表征', 'LIMS 酶合成执行 Pipeline v1.0'],
        ['关联项目', 'Enzyme Synthesis Ops', 'Project context'],
        ['样本批次', 'ENZ-SYN-BATCH-048', 'RUN input package'],
        ['样本范围', '48 个候选 variants + 4 个 controls', 'sample manifest'],
        ['SOP', 'SOP v4', 'resource readiness'],
        ['开始/结束时间', '2026-06-04 09:18 / 2026-06-04 17:10', 'approvals'],
        ['结果状态', '结果包已发布，异常 flag 保留', 'result_release approval'],
      ]),
      elnParagraph(
        '本记录由 ProteinOps Agent 根据 LIMS 执行流程、工单回调、QC 摘要和结果数据自动维护，并保留人工补充与复核空间。',
      ),
      elnSignatureBlock({
        role: 'Lab Owner',
        signer: 'Lab Owner',
        status: 'signed',
        signedAt: '2026-06-04 09:18',
        sourceRef: 'APPROVAL-run_start-20260604-0918.json',
        meaning: '确认本轮输入范围、执行边界和自动派发权限。',
      }),
      elnHeading(2, '实验目的与边界'),
      elnParagraph(
        '本实验用于完成 ENZ-SYN-BATCH-048 的小规模酶合成与结果交付，确认候选样本在既定 SOP、设备窗口和结果释放边界下的活性、稳定性、表达及 QC 状态。',
      ),
      elnTable([
        ['边界项', '本轮值', '说明'],
        ['候选样本', 'ENZ-SYN-001 至 ENZ-SYN-048', '来自已锁定输入范围'],
        ['对照', 'parent enzyme ENZ-P0、blank buffer、inactive enzyme、process control', '分散布置在边缘和中心孔'],
        ['主要读数', 'activity、kcat/Km proxy、Tm、pH window、expression', '进入结构化结果'],
        ['异常策略', '原始读数保留，不自动剔除', '异常只作为 flag 或 resolved 状态'],
        ['不包含', '自动触发下一轮设计或扩大样本范围', '结果释放后只给出复核建议'],
      ]),
      elnAttachmentBlock({
        fileName: 'RUN-ENZ-SYN-20260604-001_input_package.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/inputs/RUN-ENZ-SYN-20260604-001_input_package.md',
        fileType: 'md',
        status: 'locked',
        summary: '启动审批前锁定的样本、SOP、设备窗口和交付边界。',
        sourceRef: 'run_start input package',
      }),
      elnHeading(2, '材料、设备与执行条件'),
      elnTable([
        ['类别', '记录值', '状态', '限制/备注'],
        ['库存记录', 'INV-ENZ-SYN-202606', '已锁定', '与本轮 run 绑定'],
        ['底物批次', 'SUB-LOT-202606-A', '已放行', '来自库存记录；具体台面暴露限制未在当前 mock 展开'],
        ['备用批次', 'SUB-LOT-202606-B', '未进入本轮执行', '稳定性记录未齐'],
        ['缓冲液批次', 'BUF-PH7-202606 / BUF-PH9-202606', '已放行', '来自资源准备回调'],
        ['质控设备', 'LCQ-03', '队列已锁定', '窗口 10:00-11:40'],
        ['读板设备', 'PR-3107', '校准有效', '窗口 13:30-16:20'],
        ['交接记录', 'Tech_A / Tech_B', '已记录', '表达与纯化跨午间班次'],
      ]),
      elnParagraph(
        '当前 mock 未提供具体宿主菌株、质粒编号或载体编号；本 ELN 不补编这些实体。后续如果 LIMS/Registry 提供，可作为实验对象引用块补充。',
      ),
      elnTable([
        ['设备窗口', '用途', '占用时间', '状态'],
        ['LCQ-03', '质控队列', '10:00-11:40', '已锁定并完成回调'],
        ['PR-3107', '读板检测', '13:30-16:20', '校准有效并完成读数入库'],
        ['DNA assembly bench', '构建与返工', '10:02-12:55', '覆盖不足样本返工后 resolved'],
        ['AKTA small-column', '纯化', '13:05-14:24', '低收率 flag 保留'],
      ]),
      elnChartBlock({
        title: '设备窗口占用',
        chartType: 'bar',
        sourceRef: 'resource readiness callbacks',
        updatedAt: '2026-06-04 14:24',
        option: {
          xAxis: { type: 'category', data: ['LCQ-03', 'PR-3107', '构建台', 'AKTA'] },
          yAxis: { type: 'value', name: 'min' },
          series: [{ type: 'bar', data: [100, 170, 173, 79] }],
        },
      }),
      elnHeading(2, '样本登记与板图'),
      elnTable([
        ['对象', '数量', '记录', '追溯对象'],
        ['candidate variants', '48', '样本登记完成', 'ENZ-SYN-001 至 ENZ-SYN-048'],
        ['controls', '4', '对照分散布置', 'parent enzyme ENZ-P0、blank buffer、inactive enzyme、process control'],
        ['plate', '2 x 96-well', '候选按行展开，对照分散到边缘和中心孔', 'PLATE-ENZ-SYN-20260604-001'],
        ['barcode batch', '1', '已绑定样本、库存引用和板图', 'BAR-ENZ-SYN-20260604-001'],
      ]),
      elnTable([
        ['板图角色', '数量', '布置策略', '说明'],
        ['候选样本', '48', '按行展开', 'ENZ-SYN-001 至 ENZ-SYN-048'],
        ['parent control', '1', '靠近中心孔', 'ENZ-P0 parent 基线对照'],
        ['blank buffer', '1', '边缘孔', '背景扣除和边缘效应观察'],
        ['inactive enzyme', '1', '边缘孔', '阴性酶对照'],
        ['process control', '1', '跨板保留', '流程一致性对照'],
      ]),
      elnChartBlock({
        title: '板图孔位布局摘要',
        chartType: 'bar',
        sourceRef: 'ENZ-SYN-BATCH-048_sample_manifest.xlsx',
        updatedAt: '2026-06-04 09:42',
        option: {
          xAxis: {
            type: 'category',
            data: ['候选样本', 'parent', 'blank', 'inactive', 'process'],
          },
          yAxis: { type: 'value', name: 'well count' },
          series: [{ type: 'bar', data: [48, 1, 1, 1, 1] }],
        },
      }),
      elnHeading(2, '实验流程与时间线'),
      elnTable([
        ['阶段', '开始', '结束', '关键输出'],
        ['输入确认', '09:12', '09:18', 'run_start 审批通过'],
        ['样本注册', '09:18', '09:42', '52 个 sample records 与条码批次'],
        ['资源准备', '09:42', '10:00', '库存、设备、SOP 和交接人锁定'],
        ['构建执行', '10:02', '10:30', '构建完成 50 个，2 个覆盖不足'],
        ['返工审批与返工', '12:38', '12:55', 'ENZ-SYN-017 / 032 返工后 resolved'],
        ['表达与纯化', '13:05', '14:24', '表达记录提交，纯化曲线回传'],
        ['活性检测与数据入库', '13:40', '16:18', '612 条结构化读数入库'],
        ['结果释放', '16:52', '17:10', 'result_release 审批通过'],
      ]),
      elnChartBlock({
        title: '工单节点完成状态',
        chartType: 'bar',
        sourceRef: 'work order callbacks',
        updatedAt: '2026-06-04 16:18',
        option: {
          xAxis: { type: 'category', data: ['construct', 'express', 'purify', 'assay', 'ingest'] },
          yAxis: { type: 'value' },
          series: [
            { name: 'completed', type: 'bar', data: [1, 1, 1, 1, 1] },
            { name: 'flagged', type: 'bar', data: [0, 0, 1, 0, 0] },
          ],
        },
      }),
      elnChartBlock({
        title: '实验阶段时间线',
        chartType: 'bar',
        sourceRef: 'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
        updatedAt: '2026-06-04 17:12',
        option: {
          xAxis: { type: 'value', name: 'min' },
          yAxis: {
            type: 'category',
            data: ['输入确认', '构建与质检等待', '表达与纯化', '检测与入库', '结果释放'],
          },
          series: [{ type: 'bar', data: [18, 168, 173, 84, 28] }],
        },
      }),
      elnChartBlock({
        title: '样本角色分布',
        chartType: 'pie',
        sourceRef: 'ENZ-SYN-BATCH-048_sample_manifest.xlsx',
        updatedAt: '2026-06-04 09:42',
        option: {
          series: [
            {
              type: 'pie',
              data: [
                { name: '候选 variants', value: 48 },
                { name: 'controls', value: 4 },
              ],
            },
          ],
        },
      }),
      elnHeading(2, '构建执行与返工记录'),
      elnTable([
        ['对象', '记录值', '状态'],
        ['构建工单', 'WO-CONSTRUCT-20260604-101', 'complete'],
        ['执行内容', 'DNA assembly / clone verification', '回调已返回'],
        ['构建完成', '50 个样本直接通过', '进入表达排队'],
        ['覆盖不足', 'ENZ-SYN-017 / ENZ-SYN-032', '触发 rework_authorization'],
        ['返工工单', 'WO-REWORK-CONSTRUCT-20260604-201', '只处理 2 个样本'],
        ['复查结论', '2 个返工样本重新通过构建 QC', 'resolved'],
      ]),
      elnChartBlock({
        title: '构建 QC 状态',
        chartType: 'bar',
        sourceRef: 'construction_qc_summary.md',
        updatedAt: '2026-06-04 12:55',
        option: {
          xAxis: { type: 'category', data: ['直接通过', '返工后通过', '保留异常'] },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: [50, 2, 0] }],
        },
      }),
      elnAttachmentBlock({
        fileName: 'WO-CONSTRUCT-20260604-101.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/work_orders/WO-CONSTRUCT-20260604-101.md',
        fileType: 'md',
        status: 'completed',
        summary: '构建工单说明、负责人、设备和回调端点。',
        sourceRef: 'construct work order',
      }),
      elnAttachmentBlock({
        fileName: 'construction_qc_summary.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/qc/construction_qc_summary.md',
        fileType: 'md',
        status: 'resolved',
        summary: '构建 QC 结论、返工样本和 resolved 状态。',
        sourceRef: 'construction QC',
      }),
      elnHeading(2, '表达记录'),
      elnTable([
        ['项目', '记录值', '说明'],
        ['表达工单', 'WO-EXPRESS-20260604-102', '构建 QC 通过后执行'],
        ['输入样本', '52', '含返工后通过样本和 4 个 controls'],
        ['表达记录', '52 个 expression records', '作为输出指标入库'],
        ['主 QC gate', '无独立表达 QC gate', '表达状态作为结果上下文'],
        ['条件展开', '详见表达工单附件', '当前 mock 未展开培养温度或诱导条件'],
      ]),
      elnChartBlock({
        title: '表达记录分布',
        chartType: 'bar',
        sourceRef: 'WO-EXPRESS-20260604-102.md',
        updatedAt: '2026-06-04 13:05',
        option: {
          xAxis: { type: 'category', data: ['records complete', 'flagged', 'missing'] },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: [52, 0, 0] }],
        },
      }),
      elnAttachmentBlock({
        fileName: 'WO-EXPRESS-20260604-102.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/work_orders/WO-EXPRESS-20260604-102.md',
        fileType: 'md',
        status: 'completed',
        summary: '表达工单、样本输入、交接记录和表达记录提交状态。',
        sourceRef: 'expression work order',
      }),
      elnHeading(2, '纯化记录'),
      elnTable([
        ['项目', '记录值', '处理'],
        ['纯化工单', 'WO-PURIFY-20260604-103', 'complete'],
        ['方法', 'AKTA small-column purification', '曲线已回传'],
        ['输入样本', '52', '构建 QC 通过样本'],
        ['低收率样本', 'ENZ-SYN-006 / ENZ-SYN-041', '保留 flag，继续进入活性检测'],
        ['放行策略', '低收率不阻断 PR-3107 检测', '结果表中保留 QC flag'],
      ]),
      elnChartBlock({
        title: '纯化收率分布',
        chartType: 'bar',
        sourceRef: 'purification_qc_summary.json',
        updatedAt: '2026-06-04 14:24',
        option: {
          xAxis: { type: 'category', data: ['正常收率', '低收率 flag', '缺失'] },
          yAxis: { type: 'value' },
          series: [{ type: 'bar', data: [50, 2, 0] }],
        },
      }),
      elnAttachmentBlock({
        fileName: 'purification_qc_summary.json',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/qc/purification_qc_summary.json',
        fileType: 'json',
        status: 'completed',
        summary: '纯化收率、纯度、低收率 flag 和放行结论。',
        sourceRef: 'purification QC',
      }),
      elnHeading(2, '质量分析与表征'),
      elnTable([
        ['QC / 指标', '样本数', '来源', '结论'],
        ['construction QC', '52', 'CALLBACK-CONSTRUCT-101 / CALLBACK-REWORK-201', '2 个返工样本 resolved'],
        ['purification QC', '52', 'purification_qc_summary.json', '2 个低收率 flag，不阻断检测'],
        ['data integrity QC', '612 条读数', 'CALLBACK-QC-204_summary.json', '字段、重复孔一致性、权限边界通过'],
        ['activity', '52', 'PR-3107', '含 4 个 controls'],
        ['kcat/Km proxy', '48', 'initial-rate window', '只对候选统计'],
        ['Tm', '48', 'assay panel', '低收率样本保留为 flagged reads'],
        ['pH window', '48', 'pH 5.5-9.0', '进入结构化结果'],
        ['expression', '52', 'expression workflow', '作为输出上下文'],
      ]),
      elnTable([
        ['数据完整性检查项', '覆盖对象', '结论', '处理'],
        ['样本 ID 与条码一致性', '52 个样本记录', '通过', '进入结果包'],
        ['必填读数字段', '612 条结构化读数', '通过', 'activity、kcat/Km proxy、Tm、pH window、expression 均可追溯'],
        ['重复孔与对照一致性', '4 个 controls 与候选重复读数', '通过', '无自动剔除'],
        ['权限与对象路径', '结果、QC、异常和审批附件', '通过', '交付前校验 object path'],
        ['异常 flag 保留', '6 条异常记录', '通过', '低收率、返工、边缘孔和附件补录均保留链路'],
      ]),
      elnChartBlock({
        title: 'QC 门控结果',
        chartType: 'bar',
        sourceRef: 'CALLBACK-QC-204_summary.json',
        updatedAt: '2026-06-04 16:18',
        option: {
          xAxis: { type: 'category', data: ['passed', 'resolved', 'flagged', 'completed'] },
          yAxis: { type: 'value', name: 'item count' },
          series: [{ type: 'bar', data: [5, 2, 3, 1] }],
        },
      }),
      elnChartBlock({
        title: 'PR-3107 活性读数时间线',
        chartType: 'line',
        sourceRef: 'CALLBACK-QC-204_activity_timeline.png',
        updatedAt: '2026-06-04 15:00',
        option: {
          xAxis: { type: 'category', data: ['13:40', '14:00', '14:20', '14:40', '15:00'] },
          yAxis: { type: 'value', name: 'median relative activity' },
          series: [
            { name: '候选中位活性', type: 'line', data: [42, 57, 63, 69, 71] },
            { name: 'parent control', type: 'line', data: [50, 51, 50, 52, 51] },
          ],
        },
      }),
      elnAttachmentBlock({
        fileName: 'CALLBACK-QC-204_summary.json',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/qc/CALLBACK-QC-204_summary.json',
        fileType: 'json',
        status: 'completed',
        summary: '构建、纯化、读数完整性和异常 flag 的汇总回调。',
        sourceRef: 'QC callback',
      }),
      elnHeading(2, '结果与原始数据'),
      elnParagraph(
        '612 条结构化读数不在正文全文展开；正文只展示统计摘要、代表性读数和图表，完整数据通过 structured_readouts.json 与结果包追溯。',
      ),
      elnTable([
        ['读数类型', '样本数', '数据来源', '正文呈现'],
        ['activity', '52', 'PR-3107 / structured_readouts.json', '代表性读数 + Top-N 图'],
        ['kcat/Km proxy', '48', 'initial-rate window', '代表性读数'],
        ['Tm', '48', 'assay panel', 'Activity 与 Tm 关系图'],
        ['pH window', '48', 'pH 5.5-9.0', '结果包字段'],
        ['expression', '52', 'expression workflow', '结果上下文'],
      ]),
      elnTable([
        ['代表性读数', '样本/分组', '角色', 'activity 趋势', 'Tm 趋势', 'QC 状态', '复核含义'],
        ['parent control', 'ENZ-P0', 'control', '基线', '基线', 'passed', '基线对照'],
        ['高活性候选', 'Active-site group', '候选分组', '高于 parent control 中位趋势', '低于 Stability group', 'passed / resolved mixed', '下一轮关注 activity-Tm tradeoff'],
        ['返工样本', 'ENZ-SYN-017 / ENZ-SYN-032', '返工样本', '读数保留在数据集中', '详见 structured_readouts.json', 'resolved', '构建返工后仍进入结果表'],
        ['稳定性候选', 'Stability group', '候选分组', 'activity 中等', 'Tm 趋势更高', 'passed', '可作为稳定性方向参考'],
        ['低收率 flag 样本', 'ENZ-SYN-006 / ENZ-SYN-041', 'candidate', '原始读数保留', '详见 structured_readouts.json', 'flagged', '需确认是否复测'],
        ['process control', 'process control', 'control', '流程背景读数', 'NA', 'passed', '流程背景读数'],
      ]),
      elnChartBlock({
        title: '候选分组表现',
        chartType: 'bar',
        sourceRef: 'structured_readouts.json',
        updatedAt: '2026-06-04 16:18',
        option: {
          legend: { show: true },
          xAxis: { type: 'category', data: ['Active-site', 'Stability', 'Combo', 'Control'] },
          yAxis: { type: 'value', name: 'normalized score' },
          series: [
            { name: 'activity', type: 'bar', data: [78, 64, 72, 51] },
            { name: 'Tm', type: 'bar', data: [61, 76, 70, 66] },
          ],
        },
      }),
      elnChartBlock({
        title: 'Activity 与 Tm 关系',
        chartType: 'scatter',
        sourceRef: '候选分组检测摘要 / structured_readouts.json',
        updatedAt: '2026-06-04 16:18',
        option: {
          xAxis: { type: 'value', name: 'Tm C' },
          yAxis: { type: 'value', name: 'activity %' },
          series: [
            {
              type: 'scatter',
              data: [
                [61, 78],
                [76, 64],
                [70, 72],
                [66, 51],
              ],
            },
          ],
        },
      }),
      elnAttachmentBlock({
        fileName: 'structured_readouts.json',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/results/structured_readouts.json',
        fileType: 'json',
        status: 'saved',
        summary: '612 条结构化读数，包含 activity、kcat/Km proxy、Tm、pH window、expression 和 QC flag。',
        sourceRef: 'data ingest service',
      }),
      elnHeading(2, '异常与偏差记录'),
      elnTable([
        ['样本/对象', '位置/来源', '异常', '状态', '处理'],
        ['ENZ-SYN-006', 'B08', '低收率', 'flagged', '原始读数保留，不自动剔除'],
        ['ENZ-SYN-017', 'D04', '构建覆盖不足', 'resolved', '返工后通过，保留原始异常链路'],
        ['ENZ-SYN-032', 'F10', '构建覆盖不足', 'resolved', '返工后通过，保留原始异常链路'],
        ['ENZ-SYN-041', '待复核孔位', '低收率', 'flagged', '保留 flag 待复核'],
        ['边缘孔波动', 'plate edge wells', '读数波动', 'flagged', '不作为自动剔除依据'],
        ['附件补录', 'result package attachment', '补录记录', 'completed', '追溯至结果包附件'],
      ]),
      elnParagraph(
        '异常处理原则：原始读数保留，不自动剔除；不由系统自动扩大下一轮样本范围；低收率和高活性低 Tm 候选均进入人工复核清单。',
      ),
      elnTable([
        ['异常处理策略', '适用对象', '当前动作', '复核要求'],
        ['低收率 flag', 'ENZ-SYN-006 / ENZ-SYN-041', '保留读数并进入人工复核', '确认是否补做纯化或复测'],
        ['构建覆盖不足', 'ENZ-SYN-017 / ENZ-SYN-032', '返工后 resolved', '保留原始异常链路'],
        ['边缘孔波动', 'plate edge wells', '作为 flag 保留', '人工判断是否影响候选排序'],
        ['附件补录', 'result package attachment', '已 completed', '确认审批包和结果包一致'],
      ]),
      elnChartBlock({
        title: '异常处理状态',
        chartType: 'bar',
        sourceRef: 'ANOMALY-ENZ-SYN-20260604-001.md',
        updatedAt: '2026-06-04 15:30',
        option: {
          xAxis: { type: 'category', data: ['resolved', 'flagged', 'completed'] },
          yAxis: { type: 'value', name: 'record count' },
          series: [{ type: 'bar', data: [2, 3, 1] }],
        },
      }),
      elnChartBlock({
        title: '异常类型分布',
        chartType: 'pie',
        sourceRef: 'ANOMALY-ENZ-SYN-20260604-001.md / CALLBACK-QC-204_summary.json',
        updatedAt: '2026-06-04 15:30',
        option: {
          series: [
            {
              type: 'pie',
              data: [
                { name: '构建返工', value: 2 },
                { name: '低收率', value: 2 },
                { name: '边缘孔波动', value: 1 },
                { name: '附件补录', value: 1 },
              ],
            },
          ],
        },
      }),
      elnAttachmentBlock({
        fileName: 'ANOMALY-ENZ-SYN-20260604-001.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/exceptions/ANOMALY-ENZ-SYN-20260604-001.md',
        fileType: 'md',
        status: 'saved',
        summary: '构建返工、低收率、边缘孔波动和附件补录的异常记录。',
        sourceRef: 'anomaly log',
      }),
      elnHeading(2, '结果包与数据追溯'),
      elnTable([
        ['交付物', '状态', '说明'],
        ['Enzyme_Synthesis_Result_Package.xlsx', '已发布', '结构化读数、QC 摘要、异常清单、图表和效率复盘'],
        ['structured_readouts.json', '已保存', '612 条结构化读数'],
        ['CALLBACK-QC-204_summary.json', '已保存', 'QC 摘要回调'],
        ['ANOMALY-ENZ-SYN-20260604-001.md', '已保存', '异常 flag 与处理策略'],
        ['RESULT-RELEASE-MANIFEST-20260604.json', '已保存', '结果释放清单'],
        ['APPROVAL-result_release-20260604-1710.pdf', '已批准', 'Project Owner 审批'],
      ]),
      elnAttachmentBlock({
        fileName: 'Enzyme_Synthesis_Result_Package.xlsx',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/results/Enzyme_Synthesis_Result_Package.xlsx',
        fileType: 'xlsx',
        status: 'released',
        summary: '结构化读数、QC 摘要、异常清单、图表和效率复盘。',
        sourceRef: 'result package',
      }),
      elnAttachmentBlock({
        fileName: 'APPROVAL-result_release-20260604-1710.pdf',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/approvals/APPROVAL-result_release-20260604-1710.pdf',
        fileType: 'pdf',
        status: 'approved',
        summary: '结果包发布审批记录，审批通过时间 2026-06-04 17:10。',
        sourceRef: 'approval artifact',
      }),
      elnHeading(2, '效率复盘与下一步计划'),
      elnTable([
        ['阶段', '本轮实际', '上一轮', '最近 5 轮均值', '备注'],
        ['输入确认', '18 min', '34 min', '27 min', '4 轮确认完成，少一次补表等待'],
        ['构建与质检等待', '168 min', '218 min', '191 min', '质检审批占 6 min，但没有阻塞主线'],
        ['表达与纯化', '173 min', '186 min', '180 min', '交接记录完整，纯化台等待缩短'],
        ['检测与入库', '84 min', '124 min', '98 min', 'PR-3107 回调和完整性检查一次通过'],
        ['结果释放', '28 min', '50 min', '49 min', 'schema 检查提前完成'],
        ['总耗时', '471 min', '612 min', '545 min', '比最近 5 轮均值快 74 min，比上一轮快 141 min'],
      ]),
      elnChartBlock({
        title: '阶段耗时对比',
        chartType: 'bar',
        sourceRef: 'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
        updatedAt: '2026-06-04 17:12',
        option: {
          legend: { show: true },
          xAxis: { type: 'category', data: ['输入确认', '构建与质检', '表达与纯化', '检测与入库', '结果释放'] },
          yAxis: { type: 'value', name: 'min' },
          series: [
            { name: '本轮', type: 'bar', data: [18, 168, 173, 84, 28] },
            { name: '上一轮', type: 'bar', data: [34, 218, 186, 124, 50] },
            { name: '最近 5 轮均值', type: 'bar', data: [27, 191, 180, 98, 49] },
          ],
        },
      }),
      elnParagraph(
        '下一轮建议优先复核 ENZ-SYN-006 和 ENZ-SYN-041 的低收率原因，并评估高活性但 Tm 较低候选的稳定性 tradeoff。不建议直接扩大到新一轮 96 样本，除非低收率样本复测和高活性候选稳定性复核完成。',
      ),
      elnAttachmentBlock({
        fileName: 'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
        objectPath:
          'Runs/RUN-ENZ-SYN-20260604-001/analysis/RUN-ENZ-SYN-20260604-001_efficiency_review.md',
        fileType: 'md',
        status: 'saved',
        summary: '节点耗时、返工等待、设备占用和下一轮流程建议。',
        sourceRef: 'efficiency review',
      }),
      elnHeading(2, '审核与签名'),
      elnTable([
        ['节点', '审批人/复核人', '决策', '时间', '关联文件'],
        ['run_start', 'Lab Owner', '通过', '2026-06-04 09:18', 'APPROVAL-run_start-20260604-0918.json'],
        ['rework_authorization', 'Lab Owner', '通过', '2026-06-04 12:44', 'APPROVAL-rework_authorization-20260604-1244.json'],
        ['result_release', 'Project Owner', '通过', '2026-06-04 17:10', 'APPROVAL-result_release-20260604-1710.pdf'],
        ['data stewardship', 'Data Steward', '待复核', '待签署', 'structured_readouts.json'],
        ['experiment owner review', 'Experiment Owner', '待确认', '待签署', 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln'],
      ]),
      elnSignatureBlock({
        role: 'Lab Owner',
        signer: 'Lab Owner',
        status: 'signed',
        signedAt: '2026-06-04 12:44',
        sourceRef: 'APPROVAL-rework_authorization-20260604-1244.json',
        meaning: '确认返工范围仅限 ENZ-SYN-017 与 ENZ-SYN-032。',
      }),
      elnSignatureBlock({
        role: 'Project Owner',
        signer: 'Project Owner',
        status: 'signed',
        signedAt: '2026-06-04 17:10',
        sourceRef: 'APPROVAL-result_release-20260604-1710.pdf',
        meaning: '确认结果包可以释放至项目交付区。',
      }),
      elnSignatureBlock({
        role: 'Data Steward',
        signer: 'Data Steward',
        status: 'pending_review',
        signedAt: '',
        sourceRef: 'structured_readouts.json',
        meaning: '预留结构化读数复核签名位。',
      }),
      elnSignatureBlock({
        role: 'Experiment Owner',
        signer: 'Experiment Owner',
        status: 'pending_review',
        signedAt: '',
        sourceRef: 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
        meaning: '预留实验记录最终人工确认位。',
      }),
      elnParagraph('Lab Owner notes:'),
      elnParagraph('Project Owner notes:'),
      elnParagraph('Data Steward notes:'),
      elnParagraph('Follow-up questions:'),
    ],
  },
}

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
        controls: ['ENZ-P0 parent', 'blank buffer', 'inactive enzyme', 'process control'],
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
        equipment: ['DNA Assembly Bench', 'LCQ-03', 'AKTA Pure', 'PR-3107 Plate Reader'],
        benchWindow: '2026-06-04 09:30-16:20',
        substrateLot: 'SUB-LOT-202606-A',
        backupSubstrateLot: 'SUB-LOT-202606-B',
        buffers: ['BUF-PH7-202606', 'BUF-PH9-202606'],
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
| Input samples | 52 verified samples including controls |
| Callback | CALLBACK-EXPRESSION-102 |
| Result | 52 expression records returned |`,
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
| Result | 52 assay inputs released; 2 low-yield flags retained |`,
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
| ENZ-SYN-041 | low yield | keep raw reading |
| plate edge wells | edge effect | keep raw reading |
| result package attachment | attachment supplement | completed |`,
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
    fileName: 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
    directory: 'Runs/RUN-ENZ-SYN-20260604-001/eln',
    sourceLabel: 'ProteinOps Agent',
    sizeLabel: '76 KB',
    updatedAt: '2026-06-04 16:18',
    statusLabel: '可编辑',
    elnDocument: limsExperimentRecordEln,
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

  if (normalized === 'bmeln') {
    return 'eln'
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
      elnDocument: seed.elnDocument,
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
