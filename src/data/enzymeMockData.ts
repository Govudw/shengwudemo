import enzymeFullLoopProjectMap from '../assets/mock-science/enzyme/enzyme-full-loop-project-map.png'
import enzymeIndustrialObjectiveTradeoff from '../assets/mock-science/enzyme/enzyme-industrial-objective-tradeoff.png'
import enzymeCandidateLibraryOverview from '../assets/mock-science/enzyme/enzyme-candidate-library-overview.png'
import enzymeOrderToTaskFlow from '../assets/mock-science/enzyme/enzyme-order-to-task-flow.png'
import enzymeResultPackageSummary from '../assets/mock-science/enzyme/enzyme-result-package-summary.png'
import enzymeConsensusAndIterationSummary from '../assets/mock-science/enzyme/enzyme-consensus-and-iteration-summary.png'
import enzymeHumanGatesMap from '../assets/mock-science/enzyme/enzyme-human-gates-map.png'
import enzymeFamilyClustering from '../assets/mock-science/enzyme/enzyme-family-clustering.png'
import enzymeActiveSitePocketMap from '../assets/mock-science/enzyme/enzyme-active-site-pocket-map.png'
import enzymeConservedAndMutableSites from '../assets/mock-science/enzyme/enzyme-conserved-and-mutable-sites.png'
import enzymeMutationDesignMap from '../assets/mock-science/enzyme/enzyme-mutation-design-map.png'
import enzymeModelScorePanel from '../assets/mock-science/enzyme/enzyme-model-score-panel.png'
import enzymeParetoRanking from '../assets/mock-science/enzyme/enzyme-pareto-ranking.png'
import enzymeLibraryDesignMatrix from '../assets/mock-science/enzyme/enzyme-library-design-matrix.png'
import enzymeResultPackageQcOverview from '../assets/mock-science/enzyme/enzyme-result-package-qc-overview.png'
import enzymeKineticsCurveFitting from '../assets/mock-science/enzyme/enzyme-kinetics-curve-fitting.png'
import enzymePhTemperatureProfile from '../assets/mock-science/enzyme/enzyme-ph-temperature-profile.png'
import enzymeStabilityHalfLife from '../assets/mock-science/enzyme/enzyme-stability-half-life.png'
import enzymeModelConsensusMatrix from '../assets/mock-science/enzyme/enzyme-model-consensus-matrix.png'
import enzymeUncertaintySensitivityAnalysis from '../assets/mock-science/enzyme/enzyme-uncertainty-sensitivity-analysis.png'
import enzymeIterationDecisionTree from '../assets/mock-science/enzyme/enzyme-iteration-decision-tree.png'
import enzymeExperimentNotebookPolling from '../assets/mock-science/enzyme/enzyme-experiment-notebook-polling.png'
import enzymeExperimentRecordSummary from '../assets/mock-science/enzyme/enzyme-experiment-record-summary.png'
import enzymeExperimentAnomalyLog from '../assets/mock-science/enzyme/enzyme-experiment-anomaly-log.png'
import enzymeResultIngestionChecklist from '../assets/mock-science/enzyme/enzyme-result-ingestion-checklist.png'
import type {
  CandidateEvidenceTableBlock,
  CapabilityRunReplayBlock,
  ConversationBlock,
  ConversationTurn,
  HumanConfirmationBlock,
  ProjectFileBlock,
  RunInspectorCapabilityRunItem,
  RunInspectorData,
  ScientificFigureBlock,
} from './conversationTypes'

type EnzymeThread = {
  id: string
  title: string
  lastActivity: string
  transcript: ConversationTurn[]
  runInspector: RunInspectorData
}

type CapabilityArtifact = NonNullable<CapabilityRunReplayBlock['artifacts']>[number]
type InspectorOutput = RunInspectorData['outputs'][number]
type InspectorApproval = RunInspectorData['approvals'][number]

const enzymeEvidenceColumns = [
  { key: 'activity', label: 'Activity' },
  { key: 'kcatKmProxy', label: 'kcat/Km proxy' },
  { key: 'tm', label: 'Tm' },
  { key: 'phWindow', label: 'pH window' },
  { key: 'expressionRisk', label: 'Expression risk' },
  { key: 'evidenceStrength', label: 'Evidence strength' },
]

function scientificFigure(
  figureId: string,
  title: string,
  description: string,
  src: string,
): ScientificFigureBlock {
  return {
    type: 'scientificFigure',
    figureId,
    title,
    description,
    imagegenPrompt: `Static scientific report figure for Industrial Enzyme Design project: ${title}.`,
    placeholder: `图片：${description}`,
    src,
    width: 960,
    height: 640,
    alt: description,
  }
}

function capabilityRun(
  commandName: string,
  summary: string,
  input: CapabilityRunReplayBlock['input'],
  output: CapabilityRunReplayBlock['output'],
  artifacts: CapabilityArtifact[] = [],
  duration = '18.6s',
): CapabilityRunReplayBlock {
  return {
    type: 'capabilityRunReplay',
    commandName,
    status: 'success',
    summary,
    defaultCollapsed: true,
    input,
    output,
    duration,
    artifacts,
  }
}

function inspectorRun(
  id: string,
  run: CapabilityRunReplayBlock,
): RunInspectorCapabilityRunItem {
  return {
    id,
    commandName: run.commandName,
    status: run.status,
    summary: run.summary,
    duration: run.duration,
    input: run.input,
    output: run.output,
    artifacts: run.artifacts?.map(({ name, kind }) => ({ name, kind })),
  }
}

function progress(prefix: string, titles: string[]): RunInspectorData['progress'] {
  return titles.map((title, index) => ({
    id: `${prefix}-progress-${String(index + 1).padStart(2, '0')}`,
    title,
    status: 'done',
  }))
}

function runInspector(
  stage: string,
  progressItems: RunInspectorData['progress'],
  outputs: InspectorOutput[],
  approvals: InspectorApproval[],
  runs: CapabilityRunReplayBlock[],
  runPrefix: string,
): RunInspectorData {
  return {
    summary: {
      stage,
      status: 'completed',
      completedSteps: progressItems.length,
      totalSteps: progressItems.length,
      outputCount: outputs.length,
      pendingCount: 0,
    },
    progress: progressItems,
    outputs,
    approvals,
    capabilityRuns: runs.map((run, index) =>
      inspectorRun(`${runPrefix}-run-${String(index + 1).padStart(2, '0')}`, run),
    ),
  }
}

const fullLoopRuns = [
  capabilityRun(
    'IndustrialBriefReader.normalizeTarget',
    '读取 ENZ-P0 工业目标并形成边界',
    {
      parent: 'ENZ-P0',
      brief: 'Enzyme_Industrial_Design_Brief.md',
      libraryId: 'ENZ-LIB-20260602-048',
    },
    {
      objective: '提高可操作活性窗口',
      humanBoundary: '需要专家确认取舍',
      designRange: 'ENZ-MUT-001 through ENZ-MUT-048',
    },
    [
      {
        name: 'Enzyme_Industrial_Design_Brief.md',
        kind: 'md',
        description: '工业目标、约束和人工确认边界。',
      },
    ],
  ),
  capabilityRun(
    'ObjectiveTradeoffMapper.scoreConstraints',
    '拆分活性、稳定性、pH 与表达风险',
    {
      substrate: 'maltodextrin / soluble starch surrogate',
      temperatureWindow: '58-62 C',
      phRange: '4.5-5.5',
    },
    {
      primaryTradeoff: 'activity_vs_stability',
      riskCeiling: 'medium',
      autoDecision: false,
    },
    [
      {
        name: 'ENZ-P0_objective_tradeoff.json',
        kind: 'json',
        description: '目标权重和人工确认后的排除规则。',
      },
    ],
  ),
  capabilityRun(
    'HomologFamilyProfiler.clusterEvidence',
    '整理同源家族证据和保守区',
    {
      parent: 'ENZ-P0',
      familyWindow: 'GH-like industrial hydrolase panel',
      maxTemplates: 42,
    },
    {
      clusters: 6,
      conservedSites: 14,
      mutableSites: 11,
    },
    [
      {
        name: 'ENZ-P0_family_evidence.csv',
        kind: 'csv',
        description: '同源聚类、保守性和可变位点证据。',
      },
    ],
  ),
  capabilityRun(
    'ActiveSiteConstraintMapper.mapPocket',
    '标记活性口袋和禁改位点',
    {
      structure: 'ENZ-P0_model.pdb',
      catalyticResidues: 'expert_locked',
      pocketRadiusAngstrom: 8,
    },
    {
      lockedSites: 5,
      softMutableSites: 9,
      mechanismClaim: 'not_proven',
    },
    [
      {
        name: 'ENZ-P0_active_site_constraints.pdb',
        kind: 'pdb',
        description: '活性口袋、禁改位点和结构风险标注。',
      },
    ],
  ),
  capabilityRun(
    'MutationLibraryPlanner.compose48MemberLibrary',
    '生成 48 个候选突变组合',
    {
      parent: 'ENZ-P0',
      libraryId: 'ENZ-LIB-20260602-048',
      variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
    },
    {
      variants: 48,
      excludedHighRisk: 17,
      selectionMode: 'human_review_only',
    },
    [
      {
        name: 'Enzyme_Candidate_Design_Package.md',
        kind: 'md',
        description: '候选库、证据强度和待实验验证说明。',
      },
    ],
  ),
  capabilityRun(
    'AssayPanelPlanner.composeExecutionReadouts',
    '生成实验读数面板和板图',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      assayPanel: 'activity,kcatKm_proxy,Tm,pH_window,expression',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
    },
    {
      sampleCount: 48,
      controlCount: 8,
      requiresHumanApproval: true,
    },
    [
      {
        name: 'ENZ-PLATEMAP-20260602-001.csv',
        kind: 'csv',
        description: '48 个候选和对照样本的板位安排。',
      },
    ],
  ),
  capabilityRun(
    'ExperimentOrderBuilder.draftLabOrder',
    '生成可审批的实验订单草稿',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      taskId: 'ENZ-EXPTASK-20260602-001',
      croRef: 'CRO-ENZ-20260602-001',
    },
    {
      status: 'draft',
      approvalRequired: true,
      autoSubmit: false,
    },
    [
      {
        name: 'BM-LAB-ENZ-20260602-001_draft.md',
        kind: 'md',
        description: '实验订单、样本范围和交付物边界。',
      },
    ],
  ),
  capabilityRun(
    'LabExecutionReplay.syncTaskStatus',
    '回放订单到实验任务执行链路',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      taskId: 'ENZ-EXPTASK-20260602-001',
      croRef: 'CRO-ENZ-20260602-001',
    },
    {
      synthesisAccepted: true,
      assayCompleted: true,
      anomalyFlagged: true,
    },
    [
      {
        name: 'Enzyme_Operational_Record_Index.csv',
        kind: 'csv',
        description: '订单、CRO、样本、设备和结果包索引。',
      },
    ],
  ),
  capabilityRun(
    'ResultPackageReader.ingestEnzymePackage',
    '读取实验结果包并执行 QC',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      orderId: 'BM-LAB-ENZ-20260602-001',
      curveSummary: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
    },
    {
      acceptedWells: 54,
      flaggedWells: 2,
      needsExpertReview: true,
    },
    [
      {
        name: 'Enzyme_Experiment_Result_Package.xlsx',
        kind: 'xlsx',
        description: '湿实验活性、表达、Tm、pH 和原始曲线结果包。',
      },
    ],
  ),
  capabilityRun(
    'EvidenceConsensusScorer.prepareIterationSummary',
    '汇总证据强度和下一步人工决策项',
    {
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
      consensusTable: 'Enzyme_Candidate_Consensus_Score_Table.csv',
      decisionLog: 'Enzyme_Iteration_Decision_Log.md',
    },
    {
      candidatesForReview: 6,
      mechanismStatus: 'hypothesis_only',
      nextExperimentAutoSubmitted: false,
    },
    [
      {
        name: 'Enzyme_Post_Experiment_Analysis_Report.md',
        kind: 'md',
        description: '实验后分析报告和人工迭代建议。',
      },
    ],
  ),
]

const designRuns = [
  capabilityRun(
    'IndustrialBriefReader.extractDesignConstraints',
    '提取工业目标和禁止自动决策边界',
    {
      parent: 'ENZ-P0',
      brief: 'Enzyme_Industrial_Design_Brief.md',
      libraryId: 'ENZ-LIB-20260602-048',
    },
    {
      targetUseCase: 'weak-acid high-temperature maltodextrin conversion',
      outputPackage: 'Enzyme_Candidate_Design_Package.md',
      humanReviewRequired: true,
    },
    [
      {
        name: 'Enzyme_Industrial_Design_Brief.md',
        kind: 'md',
        description: '设计目标、约束和交付口径。',
      },
    ],
  ),
  capabilityRun(
    'HomologClusterAnalyzer.buildFamilyMap',
    '构建同源家族和证据覆盖图',
    {
      parent: 'ENZ-P0',
      sequenceSet: 'industrial_hydrolase_reference.fasta',
      minIdentity: '28%',
    },
    {
      clusters: 6,
      usableTemplates: 18,
      lowCoverageRegion: 'loop-6',
    },
    [
      {
        name: 'ENZ-P0_family_cluster_map.csv',
        kind: 'csv',
        description: '家族聚类、模板覆盖和低置信区域。',
      },
    ],
  ),
  capabilityRun(
    'ActiveSitePocketAnalyzer.annotateMutableShell',
    '标注口袋周边可变位点',
    {
      structure: 'ENZ-P0_model.pdb',
      protectedResidues: 'catalytic triad locked',
      shell: '6-10A',
    },
    {
      mutableShellSites: 11,
      protectedSites: 5,
      explanationBoundary: 'no mechanism proof',
    },
    [
      {
        name: 'ENZ-P0_pocket_mutable_shell.pdb',
        kind: 'pdb',
        description: '活性口袋周边可变位点和禁改区域。',
      },
    ],
  ),
  capabilityRun(
    'MutabilityEvidenceScorer.rankSites',
    '按证据强度给位点分层',
    {
      parent: 'ENZ-P0',
      readouts: 'activity,kcatKm_proxy,Tm,pH_window,expression',
      riskCeiling: 'medium',
    },
    {
      tier1Sites: 4,
      tier2Sites: 7,
      excludedSites: 9,
    },
    [
      {
        name: 'ENZ-P0_mutability_evidence.csv',
        kind: 'csv',
        description: '位点层级、证据强度和表达风险。',
      },
    ],
  ),
  capabilityRun(
    'MutationLibraryDesigner.generateBoundedVariants',
    '生成 ENZ-MUT-001 到 ENZ-MUT-048 候选库',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      parent: 'ENZ-P0',
      variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
    },
    {
      variantCount: 48,
      familiesBalanced: true,
      claimBoundary: 'evidence_review_only',
    },
    [
      {
        name: 'ENZ-LIB-20260602-048_design_matrix.csv',
        kind: 'csv',
        description: '48 个候选突变组合和设计分层。',
      },
    ],
  ),
  capabilityRun(
    'ModelPanelEvaluator.compareSignals',
    '比较多模型信号但不自动选 lead',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      models: 'activity_proxy,stability_proxy,expression_risk',
      consensusMode: 'evidence_weighted',
    },
    {
      highEvidenceCandidates: 9,
      discordantCandidates: 6,
      selectionMode: 'human_review_only',
    },
    [
      {
        name: 'Enzyme_Candidate_Consensus_Score_Table.csv',
        kind: 'csv',
        description: '候选证据强度、模型分歧和人工复核标记。',
      },
    ],
  ),
  capabilityRun(
    'ParetoEvidenceRanker.prepareReviewSet',
    '形成 Pareto 复核集合',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      maxReviewCandidates: 12,
      riskCeiling: 'medium',
    },
    {
      reviewCandidates: 12,
      requiresWetLab: true,
      certaintyClaim: false,
    },
    [
      {
        name: 'ENZ-LIB-20260602-048_pareto_review.csv',
        kind: 'csv',
        description: '供专家复核的候选集合和取舍说明。',
      },
    ],
  ),
  capabilityRun(
    'DesignPackageWriter.exportCandidatePackage',
    '导出候选设计包',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      package: 'Enzyme_Candidate_Design_Package.md',
      downstreamOrder: 'BM-LAB-ENZ-20260602-001',
    },
    {
      packageSaved: true,
      experimentNotSubmitted: true,
      resultPackageExpected: 'Enzyme_Experiment_Result_Package.xlsx',
    },
    [
      {
        name: 'Enzyme_Candidate_Design_Package.md',
        kind: 'md',
        description: '候选库设计、证据表和实验前边界。',
      },
    ],
  ),
]

const experimentRuns = [
  capabilityRun(
    'DesignHandoffReader.extractExecutionScope',
    '读取设计交接并抽取实验执行范围',
    {
      designPackage: 'Enzyme_Candidate_Design_Package.md',
      libraryId: 'ENZ-LIB-20260602-048',
      orderId: 'BM-LAB-ENZ-20260602-001',
    },
    {
      parentEnzyme: 'ENZ-P0',
      variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
      variantCount: 48,
      executionMode: 'linear',
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
    },
    [
      {
        name: 'Enzyme_Candidate_Design_Package.md',
        kind: 'md',
        description: '候选库设计交接、实验边界和交付物要求。',
      },
    ],
  ),
  capabilityRun(
    'ExperimentOrderBuilder.composeBoundary',
    '整理订单边界、读数面板和交付物',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      libraryId: 'ENZ-LIB-20260602-048',
      readouts: 'activity,kcatKm_proxy,Tm,pH_window,expression',
    },
    {
      boundaryStatus: 'pending_approval',
      variantCount: 48,
      controlsPerPlate: 8,
      approvalRequired: true,
    },
    [
      {
        name: 'BM-LAB-ENZ-20260602-001_boundary.json',
        kind: 'json',
        description: '订单范围、样本边界和交付物清单。',
      },
    ],
  ),
  capabilityRun(
    'SampleInventoryResolver.checkAvailability',
    '检查样本库存和孔板关联',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      sampleBatchId: 'SB-ENZ-20260602-004',
      plateLinkRecord: 'PLATE-LINK-ENZ-048',
    },
    {
      variantAliquotsReady: 48,
      controlAliquotsReady: 8,
      missingItems: 0,
      inventoryStatus: 'ready',
    },
    [
      {
        name: 'ENZ_sample_inventory_link.csv',
        kind: 'csv',
        description: '样本批次、工作液、备份管和孔板关联记录。',
      },
    ],
  ),
  capabilityRun(
    'PlateMapGenerator.assignControls',
    '生成带对照和重复孔的板图',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
    },
    {
      assignedVariants: 48,
      controlWells: 16,
      plateCount: 2,
      lockedByHuman: true,
    },
    [
      {
        name: 'ENZ-PLATEMAP-20260602-001.csv',
        kind: 'csv',
        description: '候选库和对照的 96 孔板位布局。',
      },
    ],
  ),
  capabilityRun(
    'MaterialSopReadinessChecker.validate',
    '检查物料、SOP、设备和执行线路',
    {
      substrateLot: 'SUB-LOT-202606',
      sopVersion: 'Enzyme_Assay_SOP_v3',
      deviceId: 'PR-3107',
    },
    {
      readinessStatus: 'ready',
      substrateReleased: true,
      deviceCalibrationValid: true,
      routeLocked: true,
    },
    [
      {
        name: 'ENZ_material_sop_readiness.json',
        kind: 'json',
        description: '底物批次、SOP、设备校准和执行线路检查。',
      },
    ],
  ),
  capabilityRun(
    'LabOrderGateway.submitApprovedOrder',
    '提交已审批实验订单',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      taskId: 'ENZ-EXPTASK-20260602-001',
      approver: 'Lab Owner',
    },
    {
      submitted: true,
      orderStatus: 'submitted',
      formalApproval: 'approved',
      taskCreated: false,
      readyForTaskCreation: true,
    },
    [
      {
        name: 'BM-LAB-ENZ-20260602-001_submission.json',
        kind: 'json',
        description: '审批后提交记录和任务映射。',
      },
    ],
  ),
  capabilityRun(
    'ExperimentTaskTracker.createTask',
    '创建 Experiment Task 并绑定订单',
    {
      taskId: 'ENZ-EXPTASK-20260602-001',
      orderId: 'BM-LAB-ENZ-20260602-001',
      notebookId: 'ELN-ENZ-20260602-117',
    },
    {
      taskStatus: 'running',
      executionOwner: 'Experiment Operations',
      notebookTemplate: 'enzyme_activity_stability_v1',
      dataMutationAllowed: false,
    },
    [
      {
        name: 'ENZ-EXPTASK-20260602-001_status.json',
        kind: 'json',
        description: 'Experiment Task、订单和实验记录本绑定关系。',
      },
    ],
  ),
  capabilityRun(
    'ExperimentNotebookMonitor.schedulePolling',
    '按预计提交时间创建实验记录本轮询任务',
    {
      taskId: 'ENZ-EXPTASK-20260602-001',
      notebookId: 'ELN-ENZ-20260602-117',
      estimatedSubmitBy: '2026-06-02 14:40',
      pollIntervalMinutes: 5,
    },
    {
      pollingTaskId: 'POLL-ELN-ENZ-20260602-117',
      firstCheckAt: '2026-06-02 14:40',
      overdueReminderAt: '2026-06-02 15:15',
      callbackId: 'CALLBACK-ELN-ENZ-20260602-117',
    },
    [
      {
        name: 'ELN-ENZ-20260602-117_polling_plan.json',
        kind: 'json',
        description: '实验记录本预计提交、轮询频率和回调任务。',
      },
    ],
    '8.4s',
  ),
  capabilityRun(
    'ExperimentNotebookMonitor.checkSubmission',
    '到达预计时间后检查实验记录本提交状态',
    {
      pollingTaskId: 'POLL-ELN-ENZ-20260602-117',
      notebookId: 'ELN-ENZ-20260602-117',
      checkAt: '2026-06-02 14:45',
    },
    {
      submitted: false,
      minutesPastEstimate: 5,
      reminderSent: true,
      reminderChannel: 'system message + lab inbox',
    },
    [
      {
        name: 'ELN-ENZ-20260602-117_overdue_notice.json',
        kind: 'json',
        description: '记录本未提交检查和提醒发送记录。',
      },
    ],
    '6.2s',
  ),
  capabilityRun(
    'ExperimentNotebookCallback.ingestRecord',
    '接收回调并解析实验记录本数据',
    {
      callbackId: 'CALLBACK-ELN-ENZ-20260602-117',
      notebookId: 'ELN-ENZ-20260602-117',
      submittedAt: '2026-06-02 15:42',
    },
    {
      sectionsReceived: 6,
      wellsRead: 192,
      anomaliesFlagged: 3,
      attachmentsReceived: 12,
      recordStatus: 'validated',
    },
    [
      {
        name: 'ELN-ENZ-20260602-117_record.json',
        kind: 'json',
        description: '实验记录本回调载荷、分段摘要和附件索引。',
      },
    ],
    '21.3s',
  ),
  capabilityRun(
    'ExperimentTaskTracker.syncAssayExecution',
    '从实验记录本同步 assay 执行日志',
    {
      taskId: 'ENZ-EXPTASK-20260602-001',
      notebookId: 'ELN-ENZ-20260602-117',
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
    },
    {
      samplePrep: 'completed',
      assayExecution: 'completed',
      stage: 'record_submitted',
      readoutRecordsLinked: 576,
    },
    [
      {
        name: 'RUNLOG-ENZ-20260602-ASSAY.csv',
        kind: 'csv',
        description: '实验记录本解析出的活性、动力学代理、Tm、pH 和表达日志。',
      },
    ],
  ),
  capabilityRun(
    'AnomalyLogger.captureExecutionEvents',
    '记录执行异常但不自动丢弃数据',
    {
      taskId: 'ENZ-EXPTASK-20260602-001',
      anomalyScope: 'edge wells and expression notes',
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
    },
    {
      anomaliesFlagged: 3,
      wellsExcludedAutomatically: 0,
      expertReviewRequired: true,
    },
    [
      {
        name: 'ENZ_execution_anomaly_log.csv',
        kind: 'csv',
        description: '实验异常、设备备注和人工复核状态。',
      },
    ],
  ),
  capabilityRun(
    'ResultPackageReceiver.validateSchema',
    '校验结果包 schema 和跨文件索引',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
      orderId: 'BM-LAB-ENZ-20260602-001',
    },
    {
      schemaStatus: 'completed',
      filesReceived: 7,
      missingItems: 0,
      readyForAnalysis: true,
    },
    [
      {
        name: 'Enzyme_Experiment_Result_Package.xlsx',
        kind: 'xlsx',
        description: '实验结果包、原始读数、异常标记和元数据 schema。',
      },
    ],
  ),
  capabilityRun(
    'OperationalRecordIndexer.writeTraceability',
    '归档订单、任务、样本和结果索引',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      taskId: 'ENZ-EXPTASK-20260602-001',
      index: 'Enzyme_Operational_Record_Index.csv',
    },
    {
      recordsIndexed: 84,
      readyForAnalysis: true,
      nextExperimentAutoSubmitted: false,
    },
    [
      {
        name: 'Enzyme_Operational_Record_Index.csv',
        kind: 'csv',
        description: '订单到结果包的可追溯索引。',
      },
    ],
  ),
]

const analysisRuns = [
  capabilityRun(
    'ResultPackageReader.loadEnzymePackage',
    '读取实验结果包和板图索引',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
      orderId: 'BM-LAB-ENZ-20260602-001',
    },
    {
      recordsLoaded: 56,
      variants: 48,
      anomaliesCarriedForward: true,
    },
    [
      {
        name: 'Enzyme_Experiment_Result_Package.xlsx',
        kind: 'xlsx',
        description: '活性、表达、稳定性和 pH 原始读数。',
      },
    ],
  ),
  capabilityRun(
    'DataQualityChecker.evaluateReplicates',
    '检查重复孔和异常点处理边界',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      anomalyPolicy: 'flag_only',
      minimumReplicates: 3,
    },
    {
      acceptedReplicateGroups: 45,
      flaggedReplicateGroups: 3,
      autoDiscarded: 0,
    },
    [
      {
        name: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
        kind: 'xlsx',
        description: '重复孔、异常点和曲线 QC 汇总。',
      },
    ],
  ),
  capabilityRun(
    'KineticsCurveFitter.fitProxyCurves',
    '拟合动力学代理曲线',
    {
      curveSummary: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
      model: 'Michaelis-Menten proxy',
      certaintyPolicy: 'no definitive mechanism',
    },
    {
      usableFits: 44,
      warningFits: 4,
      mechanismStatus: 'hypothesis_only',
    },
    [
      {
        name: 'ENZ_kinetics_fit_diagnostics.csv',
        kind: 'csv',
        description: '动力学代理拟合参数和诊断标记。',
      },
    ],
  ),
  capabilityRun(
    'ProfileAnalyzer.comparePhTemperature',
    '比较 pH 与温度窗口',
    {
      variants: 'ENZ-MUT-001 through ENZ-MUT-048',
      profileReadouts: 'pH_window,temperature_activity',
      parent: 'ENZ-P0',
    },
    {
      broadenedWindowCandidates: 7,
      narrowedWindowCandidates: 5,
      needsWetLabConfirmation: true,
    },
    [
      {
        name: 'ENZ_ph_temperature_profile.csv',
        kind: 'csv',
        description: 'pH 和温度窗口对比数据。',
      },
    ],
  ),
  capabilityRun(
    'StabilityAnalyzer.estimateHalfLife',
    '估算稳定性半衰期趋势',
    {
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
      readout: 'thermal_half_life_proxy',
      baseline: 'ENZ-P0',
    },
    {
      improvedHalfLifeCandidates: 8,
      expressionTradeoffCandidates: 4,
      certaintyClaim: false,
    },
    [
      {
        name: 'ENZ_stability_half_life_summary.csv',
        kind: 'csv',
        description: '热稳定半衰期代理读数和表达风险。',
      },
    ],
  ),
  capabilityRun(
    'ConsensusScorer.combineEvidence',
    '合并实验读数和设计证据强度',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      designPackage: 'Enzyme_Candidate_Design_Package.md',
      consensusTable: 'Enzyme_Candidate_Consensus_Score_Table.csv',
    },
    {
      highEvidenceCandidates: 6,
      discordantCandidates: 7,
      selectionMode: 'human_review_only',
    },
    [
      {
        name: 'Enzyme_Candidate_Consensus_Score_Table.csv',
        kind: 'csv',
        description: '候选一致性评分、证据强度和分歧标签。',
      },
    ],
  ),
  capabilityRun(
    'UncertaintySensitivityAnalyzer.runBoundaryCheck',
    '评估不确定性和敏感性',
    {
      consensusTable: 'Enzyme_Candidate_Consensus_Score_Table.csv',
      sensitivityAxes: 'normalization,outlier_policy,readout_weight',
      decisionLog: 'Enzyme_Iteration_Decision_Log.md',
    },
    {
      robustCandidates: 4,
      policySensitiveCandidates: 5,
      humanDecisionNeeded: true,
    },
    [
      {
        name: 'ENZ_uncertainty_sensitivity.csv',
        kind: 'csv',
        description: '权重、异常点和归一化敏感性检查。',
      },
    ],
  ),
  capabilityRun(
    'HypothesisWriter.composeBoundedExplanation',
    '生成假设性解释并标明证据限制',
    {
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
      parent: 'ENZ-P0',
      language: 'hypothesis_only',
    },
    {
      explanationMode: '假设性解释',
      mechanismStatus: 'hypothesis_only',
      requiresExpertSignoff: true,
    },
    [
      {
        name: 'Enzyme_Post_Experiment_Analysis_Report.md',
        kind: 'md',
        description: '实验后分析报告和证据边界。',
      },
    ],
  ),
  capabilityRun(
    'IterationDecisionRecorder.writeDecisionLog',
    '写入迭代决策日志',
    {
      decisionLog: 'Enzyme_Iteration_Decision_Log.md',
      libraryId: 'ENZ-LIB-20260602-048',
      nextOrder: 'none',
    },
    {
      reviewSetSize: 6,
      nextExperimentAutoSubmitted: false,
      decisionOwner: 'human',
    },
    [
      {
        name: 'Enzyme_Iteration_Decision_Log.md',
        kind: 'md',
        description: '候选复核集合、分歧和人工决定记录。',
      },
    ],
  ),
  capabilityRun(
    'FigureBundleExporter.exportAnalysisFigures',
    '导出分析图包',
    {
      report: 'Enzyme_Post_Experiment_Analysis_Report.md',
      figureBundle: 'Enzyme_Analysis_Figure_Bundle.png',
      index: 'Enzyme_Operational_Record_Index.csv',
    },
    {
      figuresExported: 7,
      indexUpdated: true,
      archiveReady: true,
    },
    [
      {
        name: 'Enzyme_Analysis_Figure_Bundle.png',
        kind: 'png',
        description: 'QC、曲线、共识和迭代决策图包。',
      },
    ],
  ),
]

const designEvidenceTable: CandidateEvidenceTableBlock = {
  type: 'candidateEvidenceTable',
  title: 'ENZ-LIB-20260602-048 candidate evidence review',
  columns: enzymeEvidenceColumns,
  rows: [
    {
      id: 'ENZ-MUT-004',
      group: 'active-site shell',
      evidence: {
        activity: '+18% proxy',
        kcatKmProxy: '+22% proxy',
        tm: '-0.8 C',
        phWindow: '4.5-5.3',
        expressionRisk: 'Low',
        evidenceStrength: 'Medium',
      },
      risk: 'low',
      rationale: '多模型信号一致，但仍需湿实验确认。',
    },
    {
      id: 'ENZ-MUT-017',
      group: 'loop stabilizer',
      evidence: {
        activity: '+9% proxy',
        kcatKmProxy: '+11% proxy',
        tm: '+2.1 C',
        phWindow: '4.3-5.1',
        expressionRisk: 'Medium',
        evidenceStrength: 'Medium',
      },
      risk: 'medium',
      rationale: '稳定性证据较强，表达风险需要实验读数。',
    },
    {
      id: 'ENZ-MUT-031',
      group: 'pH-window probe',
      evidence: {
        activity: '+6% proxy',
        kcatKmProxy: '+8% proxy',
        tm: '+0.4 C',
        phWindow: '4.6-5.5',
        expressionRisk: 'Low',
        evidenceStrength: 'Low',
      },
      risk: 'low',
      rationale: '用于探索 pH 窗口，不作为自动 lead。',
    },
  ],
}

const analysisEvidenceTable: CandidateEvidenceTableBlock = {
  type: 'candidateEvidenceTable',
  title: 'Post-experiment consensus evidence table',
  columns: enzymeEvidenceColumns,
  rows: [
    {
      id: 'ENZ-MUT-004',
      group: 'review set A',
      evidence: {
        activity: '+16% observed',
        kcatKmProxy: '+19% fitted',
        tm: '-0.6 C',
        phWindow: '4.5-5.2',
        expressionRisk: 'Low',
        evidenceStrength: 'Medium-high',
      },
      risk: 'low',
      rationale: '读数较一致，但机制只能作为假设性解释。',
    },
    {
      id: 'ENZ-MUT-017',
      group: 'review set B',
      evidence: {
        activity: '+7% observed',
        kcatKmProxy: '+10% fitted',
        tm: '+2.4 C',
        phWindow: '4.4-5.2',
        expressionRisk: 'Medium',
        evidenceStrength: 'Medium',
      },
      risk: 'medium',
      rationale: '稳定性改善明显，表达风险需要专家取舍。',
    },
    {
      id: 'ENZ-MUT-044',
      group: 'discordant set',
      evidence: {
        activity: '+21% observed',
        kcatKmProxy: '+5% fitted',
        tm: '-2.3 C',
        phWindow: '4.6-5.0',
        expressionRisk: 'Medium',
        evidenceStrength: 'Low',
      },
      risk: 'medium',
      rationale: '活性与稳定性分歧大，不能自动推进下一轮实验。',
    },
  ],
}

const fullLoopTranscript: ConversationTurn[] = [
  {
    id: 'enzyme-full-loop-turn-001',
    role: 'user',
    markdown:
      '请基于 ENZ-P0 启动工业酶优化闭环：设计库 ENZ-LIB-20260602-048，实验订单 BM-LAB-ENZ-20260602-001，结果包 Enzyme_Experiment_Result_Package.xlsx。需要明确哪些地方必须人工确认。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'Enzyme_Industrial_Design_Brief.md',
        fileKind: 'md',
        location: 'Industrial Enzyme Design / Files / Inputs',
        note: 'MD · 工业目标、底物窗口、温度和 pH 约束。',
      },
    ],
  },
  {
    id: 'enzyme-full-loop-turn-002',
    role: 'mainAgent',
    markdown:
      '我先把本轮工作流分成目标定义、候选生成、订单执行、结果分析和迭代决策五段。ENZ-MUT-001 到 ENZ-MUT-048 只作为候选库，不表示已经找到最佳酶。',
    contentBlocks: [
      fullLoopRuns[0],
      scientificFigure(
        'enzyme-full-loop-project-map',
        'Industrial enzyme design project map',
        '从 ENZ-P0 到候选库、实验订单、结果包和迭代日志的全流程视图。',
        enzymeFullLoopProjectMap,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-003',
    role: 'mainAgent',
    markdown:
      '目标取舍显示，活性提升、Tm、pH 窗口和表达风险会互相牵制；我会把证据强度和不确定性写入报告，而不是自动证明机制。',
    contentBlocks: [
      fullLoopRuns[1],
      scientificFigure(
        'enzyme-industrial-objective-tradeoff',
        'Industrial objective tradeoff',
        '活性、稳定性、pH 窗口和表达风险之间的工业目标取舍。',
        enzymeIndustrialObjectiveTradeoff,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-004',
    role: 'mainAgent',
    markdown:
      '在生成 ENZ-LIB-20260602-048 前，我需要你确认优先级：是优先 60 C 半衰期，还是优先 pH 4.5 到 5.5 的弱酸活性窗口？',
  },
  {
    id: 'enzyme-full-loop-turn-005',
    role: 'user',
    markdown:
      '优先 60 C 半衰期，其次 pH 4.5 到 5.5；表达风险不要超过 Medium，不能因为模型分数高就自动提交实验。',
  },
  {
    id: 'enzyme-full-loop-turn-006',
    role: 'mainAgent',
    markdown:
      '已记录人工约束：稳定性优先、表达风险封顶、实验提交需要审批。后续解释只写“假设性解释”和“证据强度”。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认工业目标取舍',
        confirmedBy: 'Process Owner',
        confirmedAt: '2026-06-02 09:24',
        decision: '优先 60 C 半衰期，表达风险不得超过 Medium，禁止自动提交订单。',
      },
    ],
  },
  {
    id: 'enzyme-full-loop-turn-007',
    role: 'mainAgent',
    markdown:
      '我完成了家族证据、活性口袋约束和 48 个候选的组合规划，候选编号覆盖 ENZ-MUT-001 到 ENZ-MUT-048。',
    contentBlocks: [
      fullLoopRuns[2],
      fullLoopRuns[3],
      fullLoopRuns[4],
      scientificFigure(
        'enzyme-candidate-library-overview',
        'Candidate library overview',
        'ENZ-LIB-20260602-048 的候选分层、风险分布和人工复核集合。',
        enzymeCandidateLibraryOverview,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-008',
    role: 'mainAgent',
    markdown:
      '候选库已导出为 Enzyme_Candidate_Design_Package.md。这里的排序是实验前证据优先级，不是最终 lead 选择。',
  },
  {
    id: 'enzyme-full-loop-turn-009',
    role: 'user',
    markdown:
      '可以把 ENZ-LIB-20260602-048 做成 BM-LAB-ENZ-20260602-001 订单草稿；提交前把读数面板和交付物再列出来。',
  },
  {
    id: 'enzyme-full-loop-turn-010',
    role: 'mainAgent',
    markdown:
      '订单草稿已准备，交付物包括 ENZ-PLATEMAP-20260602-001.csv、Enzyme_Experiment_Result_Package.xlsx 和 Enzyme_Curve_Fit_and_QC_Summary.xlsx。',
    contentBlocks: [
      fullLoopRuns[5],
      fullLoopRuns[6],
      {
        type: 'experimentOrderDraft',
        title: 'BM-LAB-ENZ-20260602-001 enzyme library assay',
        orderId: 'BM-LAB-ENZ-20260602-001',
        status: 'draft',
        items: [
          { label: 'Library', value: 'ENZ-LIB-20260602-048' },
          { label: 'Variants', value: 'ENZ-MUT-001 through ENZ-MUT-048' },
          { label: 'Readouts', value: 'Activity, kcat/Km proxy, Tm, pH window, expression' },
          { label: 'Task', value: 'ENZ-EXPTASK-20260602-001' },
        ],
      },
      {
        type: 'approvalRequestReplay',
        title: '提交 BM-LAB-ENZ-20260602-001',
        approvalType: 'experimentOrder',
        status: 'approved',
        decidedBy: 'Process Owner',
        decidedAt: '2026-06-02 10:12',
        decision: '批准提交 48 个候选的工业酶测定订单。',
        requestSummary: '仅授权本轮 ENZ-LIB-20260602-048，不授权自动追加下一轮实验。',
      },
    ],
  },
  {
    id: 'enzyme-full-loop-turn-011',
    role: 'mainAgent',
    markdown:
      '订单提交后生成 ENZ-EXPTASK-20260602-001，并映射到 CRO-ENZ-20260602-001；我会只回放状态，不改写实验结果。',
  },
  {
    id: 'enzyme-full-loop-turn-012',
    role: 'mainAgent',
    markdown:
      '执行链路已完成，从订单到任务、样本、设备和结果包都有可追溯记录。',
    contentBlocks: [
      fullLoopRuns[7],
      {
        type: 'elapsedWorkReplay',
        target: 'BM-LAB-ENZ-20260602-001 execution',
        elapsed: '4 小时 6 分钟',
        status: 'completed',
        summary: '合成、表达、活性测定和稳定性读数均完成，异常孔保留为待复核状态。',
      },
      scientificFigure(
        'enzyme-order-to-task-flow',
        'Order to task flow',
        'BM-LAB 订单、ENZ-EXPTASK 任务和 CRO 执行记录之间的映射。',
        enzymeOrderToTaskFlow,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-013',
    role: 'mainAgent',
    markdown:
      'Enzyme_Experiment_Result_Package.xlsx 已进入项目文件，QC 只标记异常，不自动删除点位。',
    contentBlocks: [
      fullLoopRuns[8],
      {
        type: 'projectFile',
        fileName: 'Enzyme_Experiment_Result_Package.xlsx',
        fileKind: 'xlsx',
        location: 'Industrial Enzyme Design / Files / Results',
        note: 'XLSX · 包含原始读数、重复孔、表达、Tm 和 pH 窗口。',
      },
      scientificFigure(
        'enzyme-result-package-summary',
        'Result package summary',
        '结果包的样本、读数、QC 标记和异常保留状态。',
        enzymeResultPackageSummary,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-014',
    role: 'user',
    markdown:
      '请做结果解释，但不要写成“机制已证明”。输出 Enzyme_Post_Experiment_Analysis_Report.md，并说明不能自动提交下一轮实验。',
  },
  {
    id: 'enzyme-full-loop-turn-015',
    role: 'mainAgent',
    markdown:
      '我把结果解释限定为假设性解释，输出 Enzyme_Candidate_Consensus_Score_Table.csv 和 Enzyme_Iteration_Decision_Log.md，供专家复核。',
    contentBlocks: [
      fullLoopRuns[9],
      {
        type: 'elapsedWorkReplay',
        target: 'Post-experiment analysis',
        elapsed: '38 分钟',
        status: 'completed',
        summary: '完成曲线 QC、证据共识和人工迭代决策日志，不自动生成新实验订单。',
      },
      scientificFigure(
        'enzyme-consensus-and-iteration-summary',
        'Consensus and iteration summary',
        '候选证据强度、分歧和下一步人工复核集合。',
        enzymeConsensusAndIterationSummary,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-016',
    role: 'mainAgent',
    markdown:
      '全流程人工关口包括目标取舍、订单提交、异常处理、解释边界和下一轮实验授权。',
    contentBlocks: [
      scientificFigure(
        'enzyme-human-gates-map',
        'Human-in-the-loop gates',
        '工业酶优化项目中必须由人确认的边界和审批点。',
        enzymeHumanGatesMap,
      ),
    ],
  },
  {
    id: 'enzyme-full-loop-turn-017',
    role: 'mainAgent',
    markdown:
      '闭环产物已归档：Enzyme_Industrial_Design_Brief.md、Enzyme_Candidate_Design_Package.md、BM-LAB-ENZ-20260602-001、ENZ-EXPTASK-20260602-001、CRO-ENZ-20260602-001、Enzyme_Operational_Record_Index.csv 和 Enzyme_Analysis_Figure_Bundle.png。',
  },
  {
    id: 'enzyme-full-loop-turn-018',
    role: 'user',
    markdown:
      '确认归档。下一轮只保留人工复核建议，不要把任何候选自动标为最终选择。',
  },
  {
    id: 'enzyme-full-loop-turn-019',
    role: 'mainAgent',
    markdown:
      '已按人工边界归档：报告只保留候选复核集合、证据强度和不确定性说明，不能自动提交下一轮实验。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认闭环归档边界',
        confirmedBy: 'Project Lead',
        confirmedAt: '2026-06-02 16:40',
        decision: '归档报告和图包，不自动选择 lead，不自动提交下一轮实验。',
      },
    ],
  },
]

const designTranscript: ConversationTurn[] = [
  {
    id: 'enzyme-design-breakdown-turn-001',
    role: 'user',
    markdown:
      '请先推进设计阶段：从 ENZ-P0 定义 ENZ-LIB-20260602-048，后续关联 BM-LAB-ENZ-20260602-001 和 Enzyme_Experiment_Result_Package.xlsx，但这一步不要提交实验。',
  },
  {
    id: 'enzyme-design-breakdown-turn-002',
    role: 'mainAgent',
    markdown:
      '我先读取 Enzyme_Industrial_Design_Brief.md，并把目标限制成实验前候选生成，不做“最佳酶”判断。',
    contentBlocks: [
      designRuns[0],
      designRuns[1],
      scientificFigure(
        'enzyme-family-clustering',
        'Enzyme family clustering',
        'ENZ-P0 同源家族聚类、模板覆盖和低置信区域。',
        enzymeFamilyClustering,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-003',
    role: 'mainAgent',
    markdown:
      '活性口袋图只用于约束候选生成；催化位点默认锁定，机制解释需要实验和专家确认。',
    contentBlocks: [
      designRuns[2],
      scientificFigure(
        'enzyme-active-site-pocket-map',
        'Active-site pocket map',
        'ENZ-P0 活性口袋、催化位点锁定和周边可变壳层。',
        enzymeActiveSitePocketMap,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-004',
    role: 'mainAgent',
    markdown:
      '可变位点分成 Tier 1 和 Tier 2。我需要你确认：是否允许对口袋外层 loop 做保守替换？',
    contentBlocks: [
      designRuns[3],
      scientificFigure(
        'enzyme-conserved-and-mutable-sites',
        'Conserved and mutable sites',
        '保守位点、可变位点和禁改位点的证据强度图。',
        enzymeConservedAndMutableSites,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-005',
    role: 'user',
    markdown:
      '允许口袋外层 loop 的保守替换，但不要牺牲表达。把表达风险和证据强度放进候选表。',
  },
  {
    id: 'enzyme-design-breakdown-turn-006',
    role: 'mainAgent',
    markdown:
      '已确认设计边界：允许保守替换，表达风险封顶，候选证据表必须显示 Activity、kcat/Km proxy、Tm、pH window、expression risk 和 evidence strength。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认设计位点边界',
        confirmedBy: 'Enzyme SME',
        confirmedAt: '2026-06-02 09:42',
        decision: '允许口袋外层 loop 保守替换，表达风险不得超过 Medium。',
      },
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-007',
    role: 'mainAgent',
    markdown:
      '我生成 ENZ-MUT-001 through ENZ-MUT-048 的候选组合，覆盖活性、稳定性和 pH 窗口探索。',
    contentBlocks: [
      designRuns[4],
      scientificFigure(
        'enzyme-mutation-design-map',
        'Mutation design map',
        'ENZ-LIB-20260602-048 的突变组合设计和位点覆盖。',
        enzymeMutationDesignMap,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-008',
    role: 'mainAgent',
    markdown:
      '多模型面板只提供相对证据，不代表可以预测最佳酶；分歧候选会进入人工复核。',
    contentBlocks: [
      designRuns[5],
      scientificFigure(
        'enzyme-model-score-panel',
        'Model score panel',
        '活性代理、稳定性代理和表达风险模型的信号比较。',
        enzymeModelScorePanel,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-009',
    role: 'user',
    markdown:
      '候选表里请用 kcat/Km proxy，不要写成真实 kcat/Km。机制描述只允许写假设性解释。',
  },
  {
    id: 'enzyme-design-breakdown-turn-010',
    role: 'mainAgent',
    markdown:
      '候选证据表已按你的边界改写，下面是进入 ENZ-LIB-20260602-048 复核集合的样例。',
    contentBlocks: [
      designEvidenceTable,
      designRuns[6],
      scientificFigure(
        'enzyme-pareto-ranking',
        'Pareto evidence ranking',
        '候选在活性代理、稳定性和表达风险之间的 Pareto 复核排序。',
        enzymeParetoRanking,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-011',
    role: 'mainAgent',
    markdown:
      '设计矩阵已覆盖 48 个候选、8 个对照和后续 ENZ-PLATEMAP-20260602-001.csv 的映射。',
    contentBlocks: [
      scientificFigure(
        'enzyme-library-design-matrix',
        'Library design matrix',
        'ENZ-MUT-001 到 ENZ-MUT-048 的设计矩阵、对照和读数映射。',
        enzymeLibraryDesignMatrix,
      ),
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-012',
    role: 'mainAgent',
    markdown:
      'Enzyme_Candidate_Design_Package.md 已生成，包含候选库、证据强度、排除理由和实验前限制。',
    contentBlocks: [designRuns[7]],
  },
  {
    id: 'enzyme-design-breakdown-turn-013',
    role: 'mainAgent',
    markdown:
      '请确认是否按这个设计包交给实验执行阶段。确认后仍只生成交接文件，不会提交 BM-LAB-ENZ-20260602-001。',
  },
  {
    id: 'enzyme-design-breakdown-turn-014',
    role: 'user',
    markdown:
      '确认设计包。把 ENZ-LIB-20260602-048 标成 ready for review，但订单提交留给实验执行阶段。',
  },
  {
    id: 'enzyme-design-breakdown-turn-015',
    role: 'mainAgent',
    markdown:
      '已将候选设计包标为 ready for review，实验订单仍为未提交状态。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认候选设计包',
        confirmedBy: 'Project Lead',
        confirmedAt: '2026-06-02 10:18',
        decision: 'ENZ-LIB-20260602-048 可交给实验执行阶段复核，不在设计阶段提交订单。',
      },
      {
        type: 'projectFile',
        fileName: 'Enzyme_Candidate_Design_Package.md',
        fileKind: 'md',
        location: 'Industrial Enzyme Design / Files / Design',
        note: 'MD · 候选库、证据强度和实验前限制。',
      },
    ],
  },
  {
    id: 'enzyme-design-breakdown-turn-016',
    role: 'mainAgent',
    markdown:
      '后续文件关系已写入包内：BM-LAB-ENZ-20260602-001 是待审批实验订单，Enzyme_Experiment_Result_Package.xlsx 是实验完成后的预期结果包。',
  },
  {
    id: 'enzyme-design-breakdown-turn-017',
    role: 'mainAgent',
    markdown:
      '设计阶段结论：候选库可用于实验设计，但不能自动判定 lead，也不能证明活性变化机制。',
  },
  {
    id: 'enzyme-design-breakdown-turn-018',
    role: 'user',
    markdown:
      '请把假设、限制和人工确认点写入设计交接，方便实验执行阶段接手。',
  },
  {
    id: 'enzyme-design-breakdown-turn-019',
    role: 'mainAgent',
    markdown:
      '已归档设计交接：Enzyme_Candidate_Design_Package.md 包含假设性解释、证据强度、候选排除理由和人工审批边界。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认设计交接边界',
        confirmedBy: 'Enzyme SME',
        confirmedAt: '2026-06-02 10:31',
        decision: '设计阶段只交付候选包和证据表，不提交实验订单。',
      },
    ],
  },
]

function experimentExecutionTurn(
  index: number,
  role: ConversationTurn['role'],
  markdown: string,
  contentBlocks?: ConversationBlock[],
): ConversationTurn {
  return {
    id: `enzyme-experiment-execution-turn-${String(index).padStart(3, '0')}`,
    role,
    markdown,
    ...(contentBlocks?.length ? { contentBlocks } : {}),
  }
}

function executionConfirmation(
  title: string,
  confirmedBy: string,
  confirmedAt: string,
  decision: string,
): HumanConfirmationBlock {
  return {
    type: 'humanConfirmation',
    title,
    confirmedBy,
    confirmedAt,
    decision,
  }
}

function executionProjectFile(
  fileName: string,
  fileKind: ProjectFileBlock['fileKind'],
  location: string,
  note: string,
): ProjectFileBlock {
  return {
    type: 'projectFile',
    fileName,
    fileKind,
    location,
    note,
  }
}

const experimentTranscript: ConversationTurn[] = [
  experimentExecutionTurn(
    1,
    'user',
    '请按线性实验执行模块接手 ENZ-LIB-20260602-048：订单 BM-LAB-ENZ-20260602-001，结果包 Enzyme_Experiment_Result_Package.xlsx。一次只推进一个原子模块，每个检查点先让我确认。',
  ),
  experimentExecutionTurn(
    2,
    'mainAgent',
    '模块 01 读取设计交接。请确认处理方式，我建议选 A。\n\n- 推荐 A：只抽取 ENZ-P0、ENZ-MUT-001 through ENZ-MUT-048、读数和交付边界。\n  原因：只抽取执行边界能避免把设计阶段的假设误写成实验结论，也方便后面按订单、样本、读数逐步锁定。\n- B：重新解释设计理由。\n- C：等待实验室补充说明。',
  ),
  experimentExecutionTurn(
    3,
    'user',
    '确认 A。只抽取执行边界，不重新解释候选设计。',
  ),
  experimentExecutionTurn(
    4,
    'mainAgent',
    '已读取设计交接，执行范围固定为本轮 48 个候选和指定结果包。',
    [
      experimentRuns[0],
      {
        type: 'designHandoffBrief',
        designPackage: 'Enzyme_Candidate_Design_Package.md',
        libraryId: 'ENZ-LIB-20260602-048',
        parentEnzyme: 'ENZ-P0',
        variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
        executionConstraints: [
          '只执行已交接候选库',
          '不扩展候选范围',
          '结果解释留给分析阶段',
        ],
        forbiddenActions: ['不新建设计候选', '不提交后续实验'],
        sourceFiles: ['Enzyme_Candidate_Design_Package.md', 'ENZ-P0_assay_constraints.md'],
      },
      executionConfirmation(
        '确认设计交接读取',
        'Project Lead',
        '2026-06-02 10:34',
        '仅抽取实验执行范围，候选设计解释不在本模块重写。',
      ),
      executionProjectFile(
        'Enzyme_Candidate_Design_Package.md',
        'md',
        'Industrial Enzyme Design / Files / Design',
        'MD · ENZ-LIB-20260602-048 的候选库、约束和交接说明。',
      ),
    ],
  ),
  experimentExecutionTurn(5, 'mainAgent', '模块 01 记录完成，下一步只处理订单边界。'),
  experimentExecutionTurn(
    6,
    'mainAgent',
    '模块 02 确认订单边界。请确认订单范围，我建议选 A。\n\n- 推荐 A：订单仅覆盖 BM-LAB-ENZ-20260602-001 与本轮候选。\n  原因：这个范围和设计交接一致，能减少后续样本、板图和结果包之间的追踪歧义。\n- B：拆成多个订单。\n- C：暂停到实验负责人补齐字段。',
  ),
  experimentExecutionTurn(
    7,
    'user',
    '确认 A。订单边界只覆盖 BM-LAB-ENZ-20260602-001 和 ENZ-LIB-20260602-048。',
  ),
  experimentExecutionTurn(
    8,
    'mainAgent',
    '订单边界已形成，提交状态仍等待正式审批。',
    [
      experimentRuns[1],
      {
        type: 'experimentOrderSummary',
        title: 'Experiment Order Boundary',
        orderId: 'BM-LAB-ENZ-20260602-001',
        status: 'draft',
        reviewStatus: 'pending',
        projectId: 'industrial-enzyme-design',
        libraryId: 'ENZ-LIB-20260602-048',
        parentEnzyme: 'ENZ-P0',
        purpose: '验证 48 个候选酶在工业底物窗口下的活性、稳定性和表达读数',
        scopeLock: '仅执行已确认样本范围、读数面板和板图',
        owner: 'Experiment Operations',
        createdAt: '2026-06-02 10:42',
        dueAt: '2026-06-04 17:30',
        rows: [
          { label: 'Variant range', value: 'ENZ-MUT-001 through ENZ-MUT-048' },
          { label: 'Result package', value: 'Enzyme_Experiment_Result_Package.xlsx' },
          { label: 'Submission gate', value: '订单提交审批' },
        ],
      },
      executionConfirmation(
        '确认订单边界',
        'Lab Owner',
        '2026-06-02 10:45',
        '订单只覆盖本轮候选库、固定读数和指定交付物。',
      ),
      executionProjectFile(
        'BM-LAB-ENZ-20260602-001_boundary.json',
        'json',
        'Industrial Enzyme Design / Files / Execution',
        'JSON · 订单边界、交付物和审批前检查清单。',
      ),
    ],
  ),
  experimentExecutionTurn(9, 'mainAgent', '模块 02 记录完成，订单尚未提交。'),
  experimentExecutionTurn(
    10,
    'mainAgent',
    '模块 03 固化样本范围。请确认纳入哪些样本，我建议选 A。\n\n- 推荐 A：48 个候选、ENZ-P0、空白和热失活对照进入范围。\n  原因：完整样本范围能让本轮订单和板图一次成型，也保留必要的对照解释空间。\n- B：先只跑 24 个候选。\n- C：等待样本库存复核。',
  ),
  experimentExecutionTurn(
    11,
    'user',
    '确认 A。48 个候选和三类对照都进入范围，缺失样本不能替补。',
  ),
  experimentExecutionTurn(
    12,
    'mainAgent',
    '样本范围已固化，后续板图不得新增候选。',
    [
      {
        type: 'sampleScopePanel',
        libraryId: 'ENZ-LIB-20260602-048',
        variantCount: 48,
        variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
        controls: ['ENZ-P0 parent', 'blank buffer', 'heat-inactivated ENZ-P0'],
        replicatePlan: '2 plates; activity duplicate wells; stability and pH profile single scheduled runs',
        sampleSource: 'Design Package and Sample Inventory',
        exclusions: ['库存缺失样本不得替补', '未通过批次 QC 的工作液不得上板'],
        lockedBy: 'Lab Owner',
      },
      executionConfirmation(
        '确认样本范围',
        'Lab Owner',
        '2026-06-02 10:52',
        '48 个候选、ENZ-P0、空白和热失活对照进入固定样本范围。',
      ),
      executionProjectFile(
        'ENZ_sample_scope_lock.csv',
        'csv',
        'Industrial Enzyme Design / Files / Execution',
        'CSV · 样本范围、对照集合和排除规则。',
      ),
    ],
  ),
  experimentExecutionTurn(13, 'mainAgent', '模块 03 记录完成，样本边界已锁定。'),
  experimentExecutionTurn(
    14,
    'mainAgent',
    '模块 04 固化读数面板。请确认读数字段，我建议选 A。\n\n- 推荐 A：Activity、kcat/Km proxy、Tm、pH window、expression 五项读数。\n  原因：这组字段覆盖活性、稳定性、窗口和表达风险，但仍然只作为实验读数，不会被写成机制结论。\n- B：只跑活性和表达。\n- C：等待工艺团队改读数。',
  ),
  experimentExecutionTurn(
    15,
    'user',
    '确认 A。保留 kcat/Km proxy 这个名称，不写成真实 kcat/Km。',
  ),
  experimentExecutionTurn(
    16,
    'mainAgent',
    '读数面板已锁定，读数只作为实验结果字段。',
    [
      {
        type: 'assayPanelTable',
        panelStatus: 'locked',
        sopReference: 'Enzyme_Assay_SOP_v3',
        assays: [
          {
            name: 'Activity Assay',
            purpose: '工业底物窗口下的相对活性',
            readout: 'Relative Activity (%)',
            method: '96-well colorimetric assay',
            replicateCount: 2,
            qcRule: 'Z-factor >= 0.6; CV <= 15%',
          },
          {
            name: 'kcat/Km proxy panel',
            purpose: '动力学代理读数',
            readout: 'Initial-rate proxy',
            method: 'serial substrate points',
            replicateCount: 1,
            qcRule: 'curve fit warning retained',
          },
          {
            name: 'Tm and pH window',
            purpose: '稳定性与弱酸窗口',
            readout: 'Tm; pH 4.5-5.5 activity retention',
            method: 'thermal shift and buffered activity readout',
            replicateCount: 1,
            qcRule: 'raw readings preserved',
          },
        ],
      },
      executionConfirmation(
        '确认读数面板',
        'Enzyme SME',
        '2026-06-02 10:58',
        '读数面板固定为五项字段，kcat/Km proxy 不改写为真实 kcat/Km。',
      ),
      executionProjectFile(
        'ENZ_assay_panel_lock.xlsx',
        'xlsx',
        'Industrial Enzyme Design / Files / Execution',
        'XLSX · 读数面板、QC 规则和字段说明。',
      ),
    ],
  ),
  experimentExecutionTurn(17, 'mainAgent', '模块 04 记录完成，读数字段已锁定。'),
  experimentExecutionTurn(
    18,
    'mainAgent',
    '模块 05 生成板图。请确认对照和排布方式，我建议选 A。\n\n- 推荐 A：每块板放置 ENZ-P0、空白和热失活对照，候选按固定重复孔排布。\n  原因：三类对照能支撑后续 QC 和异常复核，固定重复孔也能减少人工改板造成的追踪错误。\n- B：只放 ENZ-P0。\n- C：暂停等待手工板图。',
  ),
  experimentExecutionTurn(
    19,
    'user',
    '确认 A。每块板都要有 ENZ-P0、空白和热失活对照。',
  ),
  experimentExecutionTurn(
    20,
    'mainAgent',
    '板图已生成，控制孔和候选孔的映射可追溯。',
    [
      experimentRuns[3],
      {
        type: 'plateMapMini',
        plateMapId: 'ENZ-PLATEMAP-20260602-001',
        plateCount: 2,
        dimensions: '96-well',
        wells: [
          { position: 'A1', label: 'ENZ-P0', group: 'Parent control' },
          { position: 'A2', label: 'blank', group: 'Blank control' },
          { position: 'A3', label: 'heat-inactivated ENZ-P0', group: 'Inactive control' },
          { position: 'B1', label: 'ENZ-MUT-001', group: 'Variant' },
          { position: 'B2', label: 'ENZ-MUT-002', group: 'Variant' },
          { position: 'H12', label: 'ENZ-MUT-048', group: 'Variant' },
        ],
        legend: [
          { label: 'Parent control', color: 'teal' },
          { label: 'Blank control', color: 'gray' },
          { label: 'Inactive control', color: 'violet' },
          { label: 'Variant', color: 'orange' },
        ],
        locked: true,
      },
      executionConfirmation(
        '确认板图对照',
        'Lab Owner',
        '2026-06-02 11:06',
        '每块板保留三类对照，候选孔位不再调整。',
      ),
      executionProjectFile(
        'ENZ-PLATEMAP-20260602-001.csv',
        'csv',
        'Industrial Enzyme Design / Files / Execution',
        'CSV · 96 孔板候选、对照和重复孔映射。',
      ),
    ],
  ),
  experimentExecutionTurn(21, 'mainAgent', '模块 05 记录完成，板图进入锁定状态。'),
  experimentExecutionTurn(
    22,
    'mainAgent',
    '模块 06 检查样本库存与孔板关联。请确认样本批次和关联记录，我建议选 A。\n\n- 推荐 A：使用 SB-ENZ-20260602-004，并写入 PLATE-LINK-ENZ-048。\n  原因：该批次已经和当前板图对齐，直接写入关联记录可以保证样本、孔位和结果包可追溯。\n- B：改用备用批次。\n- C：暂停等待库存盘点。',
  ),
  experimentExecutionTurn(
    23,
    'user',
    '确认 A。使用 SB-ENZ-20260602-004，孔板关联必须写入操作索引。',
  ),
  experimentExecutionTurn(
    24,
    'mainAgent',
    '样本库存检查通过，工作液和备份管均可追溯。',
    [
      experimentRuns[2],
      {
        type: 'sampleInventoryLink',
        sampleBatchId: 'SB-ENZ-20260602-004',
        inventoryStatus: 'ready',
        storageCondition: '4 C short hold; -80 C backup aliquot',
        aliquotPlan: '每个候选 2 管工作液 + 1 管备份；对照按每块板独立分装',
        plateLinkRecord: 'PLATE-LINK-ENZ-048',
        missingItems: [],
      },
      executionConfirmation(
        '确认样本库存与孔板关联',
        'Sample Custodian',
        '2026-06-02 11:14',
        '使用 SB-ENZ-20260602-004，并把 PLATE-LINK-ENZ-048 写入索引。',
      ),
      executionProjectFile(
        'ENZ_sample_inventory_link.csv',
        'csv',
        'Industrial Enzyme Design / Files / Execution',
        'CSV · 样本批次、工作液、备份管和板图关联。',
      ),
    ],
  ),
  experimentExecutionTurn(25, 'mainAgent', '模块 06 记录完成，样本与孔板链路已固定。'),
  experimentExecutionTurn(
    26,
    'mainAgent',
    '模块 07 检查物料/SOP/设备/线路。请确认执行条件，我建议选 A。\n\n- 推荐 A：使用 SUB-LOT-202606、Enzyme_Assay_SOP_v3、PR-3107 和既定线路。\n  原因：这组物料、SOP、设备和线路都能直接绑定到订单，减少提交审批前的变量。\n- B：更换底物批次。\n- C：暂停等设备复校。',
  ),
  experimentExecutionTurn(
    27,
    'user',
    '确认 A。物料、SOP、设备和线路按你列出的组合执行。',
  ),
  experimentExecutionTurn(
    28,
    'mainAgent',
    '物料、SOP、设备和线路检查通过。',
    [
      experimentRuns[4],
      {
        type: 'materialSopReadiness',
        substrateLot: 'SUB-LOT-202606',
        buffer: '50 mM citrate-phosphate pH 5.0; 150 mM NaCl',
        sopVersion: 'Enzyme_Assay_SOP_v3',
        deviceType: 'Plate reader',
        deviceId: 'PR-3107',
        labLocation: 'Lab B / Enzyme bench 03',
        experimentRoute: 'sample-prep -> assay-readout -> result-package-return',
        workflowTemplate: 'SmartExperiment enzyme small-scale assay',
        readinessChecks: ['底物放行', '设备校准有效', 'SOP 生效', '数据回收路径可写'],
      },
      executionConfirmation(
        '确认物料与执行线路',
        'Lab Owner',
        '2026-06-02 11:22',
        'SUB-LOT-202606、Enzyme_Assay_SOP_v3、PR-3107 和固定线路可用于本订单。',
      ),
      executionProjectFile(
        'ENZ_material_sop_readiness.json',
        'json',
        'Industrial Enzyme Design / Files / Execution',
        'JSON · 物料、SOP、设备校准和执行线路检查记录。',
      ),
    ],
  ),
  experimentExecutionTurn(29, 'mainAgent', '模块 07 记录完成，提交审批前检查已齐备。'),
  experimentExecutionTurn(
    30,
    'mainAgent',
    '模块 08 订单提交审批。请确认是否可以提交订单 BM-LAB-ENZ-20260602-001。\n\n请重点检查这些内容：\n\n- 订单范围：只覆盖 ENZ-LIB-20260602-048，本轮 48 个候选和已确认对照。\n- 样本与板图：样本范围已锁定，ENZ-PLATEMAP-20260602-001 与 PLATE-LINK-ENZ-048 已对齐。\n- 读数面板：Activity、kcat/Km proxy、Tm、pH window、expression 已固定，不在提交后追加字段。\n- 物料和线路：SUB-LOT-202606、Enzyme_Assay_SOP_v3、PR-3107 和执行线路均已通过提交前检查。\n- 权限边界：提交后只创建本轮 Experiment Task，不触发后续设计或额外订单。\n\n如果这些都可以，请直接回复 OK。',
  ),
  experimentExecutionTurn(
    31,
    'user',
    'OK。',
  ),
  experimentExecutionTurn(
    32,
    'mainAgent',
    '我已提交审批。BM-LAB-ENZ-20260602-001 正在等待 Lab Owner 审批。\n\n我会等待审批结束，结束后会在这里继续。如果你需要撤回并修改，可随时告诉我。',
    [
      {
        type: 'approvalGateCard',
        title: '订单提交审批',
        approvalType: 'experimentOrder',
        status: 'pending',
        approver: 'Lab Owner',
        details: [
          { label: '发起人', value: 'ProteinDesign Agent' },
          { label: '审批对象', value: 'BM-LAB-ENZ-20260602-001' },
          { label: '发起时间', value: '2026-06-02 11:31' },
          { label: '当前动作', value: '发起审批，不创建 Experiment Task' },
          { label: '撤回条件', value: '用户要求修改订单范围、样本、板图或读数面板' },
        ],
        checklist: [
          '订单边界资料：BM-LAB-ENZ-20260602-001 / ENZ-LIB-20260602-048',
          '样本与板图资料：ENZ-PLATEMAP-20260602-001 / PLATE-LINK-ENZ-048',
          '读数面板资料：Activity、kcat/Km proxy、Tm、pH window、expression',
          '物料与线路资料：SUB-LOT-202606 / SOP v3 / PR-3107',
        ],
        riskSummary: '审批发起资料已提交：订单范围、样本板图、读数面板、物料线路和权限边界均随单进入审批；当前还没有创建实验任务。',
        decision: '审批流程已发起，等待审批人处理',
      },
    ],
  ),
  experimentExecutionTurn(
    33,
    'mainAgent',
    '已经通过审批，这是审批建议和结果：',
    [
      experimentRuns[5],
      {
        type: 'approvalGateCard',
        title: '订单提交审批',
        approvalType: 'experimentOrder',
        status: 'approved',
        approver: 'Lab Owner',
        decidedAt: '2026-06-02 11:34',
        approvalAdvice: '建议通过；实验范围、样本、板图和物料检查均满足提交条件。',
        details: [
          { label: '审批人', value: 'Lab Owner' },
          { label: '审批通过时间', value: '2026-06-02 11:34' },
          { label: '生效动作', value: '创建 ENZ-EXPTASK-20260602-001' },
          { label: '限制条件', value: '只授权本轮执行，不触发后续设计或额外订单' },
        ],
        checklist: ['范围确认', '样本与板图确认', '物料/SOP/设备确认', '结果包交付确认'],
        riskSummary: '仅授权 BM-LAB-ENZ-20260602-001，本模块不创建后续实验。',
        decision: '批准提交 BM-LAB-ENZ-20260602-001',
      },
      executionProjectFile(
        'BM-LAB-ENZ-20260602-001_submission.json',
        'json',
        'Industrial Enzyme Design / Experiments',
        'JSON · 订单提交审批、提交时间和任务映射。',
      ),
    ],
  ),
  experimentExecutionTurn(
    34,
    'mainAgent',
    '模块 09 创建 Experiment Task。订单已审批通过，我直接创建本轮任务，不再让你重复确认。\n\n执行边界：只绑定 BM-LAB-ENZ-20260602-001、ENZ-LIB-20260602-048、ENZ-PLATEMAP-20260602-001 和实验记录本 ELN-ENZ-20260602-117；任务只同步执行状态，不改写实验读数。',
  ),
  experimentExecutionTurn(
    36,
    'mainAgent',
    'Experiment Task 创建请求已提交，正在绑定订单、板图和记录本模板。',
    [
      experimentRuns[6],
      {
        type: 'executionTaskStatus',
        taskId: 'ENZ-EXPTASK-20260602-001',
        orderId: 'BM-LAB-ENZ-20260602-001',
        croRef: 'SmartExperiment / internal execution',
        stage: 'task-created',
        status: 'running',
        owner: 'Experiment Operations',
        startedAt: '2026-06-02 11:38',
        records: ['Order submitted', 'Task created', 'Sample preparation queued'],
      },
      executionProjectFile(
        'ENZ-EXPTASK-20260602-001_status.json',
        'json',
        'Industrial Enzyme Design / Experiments',
        'JSON · Experiment Task 创建记录和状态来源。',
      ),
    ],
  ),
  experimentExecutionTurn(
    37,
    'mainAgent',
    '任务状态已进入 running。我继续写入三条执行约束：样本准备由实验室完成、读数从记录本回调进入、异常只打标不自动剔除。',
  ),
  experimentExecutionTurn(
    38,
    'mainAgent',
    '模块 09 记录完成，任务已进入样本准备队列。',
  ),
  experimentExecutionTurn(
    39,
    'mainAgent',
    '模块 10 实验记录本。我为 ELN-ENZ-20260602-117 设置预计提交时间：2026-06-02 14:40。\n\n我会创建一个轮询任务，到预计时间检查实验室是否提交记录本；如果未提交，我会提醒你和实验室负责人，并继续等待回调。',
    [
      experimentRuns[7],
      executionProjectFile(
        'ELN-ENZ-20260602-117_polling_plan.json',
        'json',
        'Industrial Enzyme Design / Experiments',
        'JSON · 实验记录本预计提交时间、轮询频率、提醒策略和回调任务。',
      ),
    ],
  ),
  experimentExecutionTurn(
    40,
    'mainAgent',
    '轮询任务已创建：POLL-ELN-ENZ-20260602-117。检查频率为每 5 分钟一次，预计提交时间后 30 分钟仍未提交则发送超时提醒。',
  ),
  experimentExecutionTurn(
    41,
    'mainAgent',
    '到达预计提交时间后，我检查了实验记录本状态：2026-06-02 14:45 尚未提交实验记录。我已发送提醒，并继续等待回调任务。',
    [
      experimentRuns[8],
      {
        type: 'runLogTable',
        logId: 'ELN-POLL-ENZ-20260602-117',
        taskId: 'ENZ-EXPTASK-20260602-001',
        rows: [
          {
            time: '2026-06-02 14:40',
            actor: 'ExperimentNotebookMonitor',
            system: 'ELN',
            event: 'Expected submission check',
            recordId: 'POLL-ELN-001',
            status: 'not-submitted',
          },
          {
            time: '2026-06-02 14:45',
            actor: 'ExperimentNotebookMonitor',
            system: 'ELN',
            event: 'Reminder sent to Lab Owner and operator',
            recordId: 'REMINDER-ELN-001',
            status: 'sent',
          },
        ],
      },
      executionProjectFile(
        'ELN-ENZ-20260602-117_overdue_notice.json',
        'json',
        'Industrial Enzyme Design / Experiments',
        'JSON · 记录本未提交检查、提醒对象和提醒时间。',
      ),
    ],
  ),
  experimentExecutionTurn(
    42,
    'mainAgent',
    '我会继续等待实验记录本回调。这里不会主动猜测实验结果，也不会从缺失记录里推断数据。',
  ),
  experimentExecutionTurn(
    43,
    'mainAgent',
    '收到回调任务 CALLBACK-ELN-ENZ-20260602-117。实验记录本已提交，我开始解析记录数据。',
  ),
  experimentExecutionTurn(
    44,
    'mainAgent',
    '实验记录数据摘要如下。记录本显示样本处理、assay 条件、读数记录、QC 控制、异常备注和附件均已返回；异常仍只作为 flag 保留。',
    [
      experimentRuns[9],
      {
        type: 'experimentNotebookSummary',
        notebookId: 'ELN-ENZ-20260602-117',
        taskId: 'ENZ-EXPTASK-20260602-001',
        orderId: 'BM-LAB-ENZ-20260602-001',
        status: 'validated',
        estimatedSubmitBy: '2026-06-02 14:40',
        submittedAt: '2026-06-02 15:42',
        submittedBy: 'Tech_A / Lab B',
        callbackId: 'CALLBACK-ELN-ENZ-20260602-117',
        recordSections: [
          {
            label: '样本处理',
            value: '48 个候选和 4 组对照完成分装、上板和标签核对。',
            status: 'completed',
          },
          {
            label: '实验条件',
            value: 'SOP v3、SUB-LOT-202606、PR-3107、25 C 台面条件已记录。',
            status: 'completed',
          },
          {
            label: '读数记录',
            value: 'Activity、kcat/Km proxy、Tm、pH window、expression 读数共 576 条。',
            status: 'completed',
          },
          {
            label: 'QC 控制',
            value: '阳性/阴性/blank/reference controls 均达到接受标准。',
            status: 'passed',
          },
          {
            label: '异常备注',
            value: '3 条异常记录进入复核，未自动剔除原始读数。',
            status: 'flagged',
          },
        ],
        observations: [
          'G8 边缘效应被标记，原始读数保留。',
          'ENZ-MUT-031 有表达备注，需要分析阶段降权处理。',
          '记录本附件校验通过，结果包可以进入回收。',
        ],
        attachments: [
          'PlateMap_20260602.csv',
          'RawData_Activity.xlsx',
          'RawData_Kinetics.xlsx',
          'RawData_Tm.xlsx',
          'RunLog_20260602.txt',
        ],
      },
      scientificFigure(
        'enzyme-experiment-notebook-polling',
        'Experiment notebook polling monitor',
        '实验记录本预计提交、轮询检查、超时提醒和回调接收状态。',
        enzymeExperimentNotebookPolling,
      ),
      scientificFigure(
        'enzyme-experiment-record-summary',
        'Experiment notebook record summary',
        'ELN 回调后的样本处理、assay 条件、读数记录、QC、异常和附件摘要。',
        enzymeExperimentRecordSummary,
      ),
      executionProjectFile(
        'ELN-ENZ-20260602-117_record.json',
        'json',
        'Industrial Enzyme Design / Files / Execution',
        'JSON · 实验记录本回调载荷、记录分段摘要、异常备注和附件索引。',
      ),
    ],
  ),
  experimentExecutionTurn(45, 'mainAgent', '模块 10 记录完成，实验记录本已回调并锁定。'),
  experimentExecutionTurn(
    46,
    'mainAgent',
    '模块 11 同步 assay 执行。我从实验记录本抽取 assay 执行日志，按设备、读数面板和 record ID 关联，不改变任何原始读数。',
  ),
  experimentExecutionTurn(
    47,
    'mainAgent',
    'assay 执行日志已同步，异常策略保持打标。',
    [
      experimentRuns[10],
      {
        type: 'runLogTable',
        logId: 'RUNLOG-ENZ-20260602-ASSAY',
        taskId: 'ENZ-EXPTASK-20260602-001',
        rows: [
          {
            time: '2026-06-02 12:18',
            actor: 'Lab Technician',
            system: 'Sample Bench',
            event: 'Sample handling section locked',
            recordId: 'REC-SAMPLE-001',
            status: 'done',
          },
          {
            time: '2026-06-02 13:20',
            actor: 'PlateReader PR-3107',
            system: 'Activity Assay',
            event: 'Activity plate read complete',
            recordId: 'REC-ACT-001',
            status: 'done',
          },
          {
            time: '2026-06-02 14:18',
            actor: 'PlateReader PR-3107',
            system: 'Thermal Shift',
            event: 'Tm readout complete',
            recordId: 'REC-TM-001',
            status: 'done',
          },
          {
            time: '2026-06-02 15:38',
            actor: 'ExperimentNotebookCallback',
            system: 'ELN',
            event: 'Readout records linked to task',
            recordId: 'REC-LINK-001',
            status: 'done',
          },
        ],
      },
      scientificFigure(
        'enzyme-assay-execution-readout-summary',
        'Assay execution readout summary',
        '实验记录本解析出的活性、动力学代理、稳定性和 pH 读数执行摘要。',
        enzymeResultPackageSummary,
      ),
      executionProjectFile(
        'RUNLOG-ENZ-20260602-ASSAY.csv',
        'csv',
        'Industrial Enzyme Design / Files / Execution',
        'CSV · 从实验记录本解析出的样本处理、读数执行和记录关联日志。',
      ),
    ],
  ),
  experimentExecutionTurn(48, 'mainAgent', '模块 11 记录完成，assay 状态已同步。'),
  experimentExecutionTurn(
    49,
    'mainAgent',
    '模块 12 回收结果包。我继续检查结果包是否和订单、任务、记录本、板图一致。',
  ),
  experimentExecutionTurn(
    50,
    'mainAgent',
    '结果包已回收，任务状态同步到 result_returned。',
    [
      {
        type: 'executionTaskStatus',
        taskId: 'ENZ-EXPTASK-20260602-001',
        orderId: 'BM-LAB-ENZ-20260602-001',
        croRef: 'SmartExperiment / internal execution',
        stage: 'result-returned',
        status: 'completed',
        owner: 'Experiment Operations',
        startedAt: '2026-06-02 11:38',
        completedAt: '2026-06-02 15:28',
        records: [
          'Notebook callback ingested',
          'Assay run linked',
          'Result package returned',
        ],
      },
      executionProjectFile(
        'Enzyme_Experiment_Result_Package.xlsx',
        'xlsx',
        'Industrial Enzyme Design / Files / Results',
        'XLSX · 原始读数、重复孔、异常标记和元数据。',
      ),
    ],
  ),
  experimentExecutionTurn(51, 'mainAgent', '模块 12 记录完成，结果包进入校验队列。'),
  experimentExecutionTurn(
    52,
    'mainAgent',
    '模块 13 记录异常事件。我把记录本里的异常备注、边缘孔、曲线警告和表达备注写成复核清单，执行阶段不自动删数。',
  ),
  experimentExecutionTurn(
    53,
    'mainAgent',
    '异常事件已记录，所有原始读数仍保留。',
    [
      experimentRuns[11],
      {
        type: 'anomalyReviewTable',
        anomalyLogId: 'ANOM-ENZ-20260602-001',
        policy: '原始读数保留，异常孔进入人工复核，不自动剔除。',
        rows: [
          {
            sampleId: 'ENZ-MUT-017',
            well: 'G8',
            anomalyType: 'edge-effect',
            rawReadingPreserved: 'yes',
            autoExcluded: 'no',
            reviewOwner: 'Lab Owner',
            status: 'flagged',
          },
          {
            sampleId: 'ENZ-MUT-031',
            well: 'D11',
            anomalyType: 'expression-note',
            rawReadingPreserved: 'yes',
            autoExcluded: 'no',
            reviewOwner: 'Enzyme SME',
            status: 'flagged',
          },
        ],
      },
      scientificFigure(
        'enzyme-experiment-anomaly-log',
        'Experiment anomaly log',
        '执行异常、边缘孔、表达备注和人工复核状态摘要。',
        enzymeExperimentAnomalyLog,
      ),
      executionProjectFile(
        'ENZ_execution_anomaly_log.csv',
        'csv',
        'Industrial Enzyme Design / Files / Results',
        'CSV · 异常孔、表达备注、设备事件和复核责任人。',
      ),
    ],
  ),
  experimentExecutionTurn(54, 'mainAgent', '模块 13 记录完成，异常策略已写入结果包索引。'),
  experimentExecutionTurn(
    55,
    'mainAgent',
    '模块 14 校验结果包 schema。我检查样本 ID、板位、读数字段、异常表、记录本元数据和附件索引，只判断是否可被分析读取。',
  ),
  experimentExecutionTurn(
    56,
    'mainAgent',
    '结果包 schema 校验通过，没有缺项。',
    [
      experimentRuns[12],
      {
        type: 'resultPackageChecklist',
        packageName: 'Enzyme_Experiment_Result_Package.xlsx',
        receivedAt: '2026-06-02 15:31',
        files: [
          'raw_activity.csv',
          'kinetics_proxy.csv',
          'tm_profile.csv',
          'ph_window.csv',
          'expression_notes.csv',
          'plate_map.csv',
          'anomaly_log.csv',
        ],
        schemaChecks: ['样本 ID 对齐', '板位映射完整', '读数字段完整', '异常记录可追溯'],
        missingItems: [],
        archiveLocations: ['Project Files / Results', 'Operational Record Index'],
        readyForAnalysis: true,
      },
      scientificFigure(
        'enzyme-result-ingestion-checklist',
        'Result ingestion checklist',
        '结果包 schema、板图、异常表、记录本元数据和附件索引校验摘要。',
        enzymeResultIngestionChecklist,
      ),
      executionProjectFile(
        'Enzyme_Result_Package_Schema_Check.json',
        'json',
        'Industrial Enzyme Design / Files / Results',
        'JSON · 结果包字段、文件完整性和缺项检查记录。',
      ),
    ],
  ),
  experimentExecutionTurn(57, 'mainAgent', '模块 14 记录完成，结果包可交给分析阶段读取。'),
  experimentExecutionTurn(
    58,
    'mainAgent',
    '模块 15 归档操作索引。我写入订单、任务、样本、板图、实验记录本、轮询提醒、异常、结果包和 schema 校验索引；分析阶段只按这个索引读取证据。',
  ),
  experimentExecutionTurn(
    59,
    'mainAgent',
    '操作索引已归档，执行模块不输出候选结论。',
    [
      experimentRuns[13],
      executionProjectFile(
        'Enzyme_Operational_Record_Index.csv',
        'csv',
        'Industrial Enzyme Design / Files / Execution',
        'CSV · 从 BM-LAB-ENZ-20260602-001 到 Enzyme_Experiment_Result_Package.xlsx 的可追溯索引。',
      ),
    ],
  ),
  experimentExecutionTurn(
    60,
    'mainAgent',
    '结果包已准备进入分析：ENZ-LIB-20260602-048、BM-LAB-ENZ-20260602-001、Enzyme_Experiment_Result_Package.xlsx 和 Enzyme_Operational_Record_Index.csv 已完成执行归档。',
  ),
]

const analysisTranscript: ConversationTurn[] = [
  {
    id: 'enzyme-analysis-iteration-turn-001',
    role: 'user',
    markdown:
      '请分析 Enzyme_Experiment_Result_Package.xlsx，关联 ENZ-LIB-20260602-048 和 BM-LAB-ENZ-20260602-001。只给证据强度和迭代建议，不要证明机制。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-002',
    role: 'mainAgent',
    markdown:
      '我先读取结果包、板图和操作索引，保留异常标记作为复核条件。',
    contentBlocks: [
      analysisRuns[0],
      {
        type: 'projectFile',
        fileName: 'Enzyme_Experiment_Result_Package.xlsx',
        fileKind: 'xlsx',
        location: 'Industrial Enzyme Design / Files / Results',
        note: 'XLSX · 与 ENZ-PLATEMAP-20260602-001.csv 和订单映射一致。',
      },
      scientificFigure(
        'enzyme-result-package-qc-overview',
        'Result package QC overview',
        '结果包完整性、重复孔、异常标记和 QC 状态。',
        enzymeResultPackageQcOverview,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-003',
    role: 'mainAgent',
    markdown:
      '重复孔检查完成，异常孔只标记不删除；这一策略会进入敏感性分析。',
    contentBlocks: [analysisRuns[1]],
  },
  {
    id: 'enzyme-analysis-iteration-turn-004',
    role: 'mainAgent',
    markdown:
      '动力学曲线拟合使用 kcat/Km proxy，不写成真实机制参数；警告曲线会保留在 QC 汇总。',
    contentBlocks: [
      analysisRuns[2],
      scientificFigure(
        'enzyme-kinetics-curve-fitting',
        'Kinetics curve fitting',
        'kcat/Km proxy 曲线拟合、残差和 QC 警告。',
        enzymeKineticsCurveFitting,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-005',
    role: 'user',
    markdown:
      '异常孔不要删除。报告里把异常处理写成“flag only”，并说明这会影响证据强度。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-006',
    role: 'mainAgent',
    markdown:
      '已确认异常处理边界：flag only，不自动排除，不把曲线拟合解释为机制证明。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认异常点处理边界',
        confirmedBy: 'Data Owner',
        confirmedAt: '2026-06-02 16:50',
        decision: '异常孔只标记，保留进入敏感性分析。',
      },
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-007',
    role: 'mainAgent',
    markdown:
      'pH 和温度 profile 显示部分候选窗口扩大，但需要专家确认工业场景权重。',
    contentBlocks: [
      analysisRuns[3],
      scientificFigure(
        'enzyme-ph-temperature-profile',
        'pH and temperature profile',
        '候选和 ENZ-P0 在 pH 与温度窗口下的相对表现。',
        enzymePhTemperatureProfile,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-008',
    role: 'mainAgent',
    markdown:
      '稳定性半衰期代理读数显示改良趋势和表达风险之间存在分歧，不能单独决定候选。',
    contentBlocks: [
      analysisRuns[4],
      scientificFigure(
        'enzyme-stability-half-life',
        'Stability half-life',
        '热稳定半衰期代理读数、表达风险和分歧候选。',
        enzymeStabilityHalfLife,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-009',
    role: 'user',
    markdown:
      '请给我候选证据表，但不要把任何候选写成最终 lead。可以列 review set。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-010',
    role: 'mainAgent',
    markdown:
      '候选证据表按 review set 输出，强调证据强度和风险，不做自动 lead 选择。',
    contentBlocks: [
      analysisEvidenceTable,
      analysisRuns[5],
      scientificFigure(
        'enzyme-model-consensus-matrix',
        'Model consensus matrix',
        '实验读数、模型信号和证据强度的共识矩阵。',
        enzymeModelConsensusMatrix,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-011',
    role: 'mainAgent',
    markdown:
      '敏感性分析显示，异常点策略和读数权重会改变部分候选排序，所以需要人工复核。',
    contentBlocks: [
      analysisRuns[6],
      scientificFigure(
        'enzyme-uncertainty-sensitivity-analysis',
        'Uncertainty sensitivity analysis',
        '异常点、归一化和读数权重对候选证据的影响。',
        enzymeUncertaintySensitivityAnalysis,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-012',
    role: 'mainAgent',
    markdown:
      '我把结构和曲线解释写成假设性解释：可能影响底物口袋柔性，但不能证明机制。',
    contentBlocks: [analysisRuns[7]],
  },
  {
    id: 'enzyme-analysis-iteration-turn-013',
    role: 'mainAgent',
    markdown:
      '请确认迭代边界：是否只输出人工 review set 和 Enzyme_Iteration_Decision_Log.md，不生成下一轮订单？',
  },
  {
    id: 'enzyme-analysis-iteration-turn-014',
    role: 'user',
    markdown:
      '确认。只输出 review set、假设和不确定性，不生成 BM-LAB 新订单。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-015',
    role: 'mainAgent',
    markdown:
      '迭代决策树已按人工边界生成：候选进入复核集合，不自动提交下一轮实验。',
    contentBlocks: [
      analysisRuns[8],
      {
        type: 'humanConfirmation',
        title: '确认迭代决策边界',
        confirmedBy: 'Project Lead',
        confirmedAt: '2026-06-02 17:10',
        decision: '只输出 review set 和决策日志，不生成新实验订单。',
      },
      scientificFigure(
        'enzyme-iteration-decision-tree',
        'Iteration decision tree',
        '候选复核、分歧处理和下一步人工决策节点。',
        enzymeIterationDecisionTree,
      ),
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-016',
    role: 'mainAgent',
    markdown:
      '分析文件已导出：Enzyme_Post_Experiment_Analysis_Report.md、Enzyme_Candidate_Consensus_Score_Table.csv、Enzyme_Iteration_Decision_Log.md 和 Enzyme_Analysis_Figure_Bundle.png。',
    contentBlocks: [
      analysisRuns[9],
      {
        type: 'projectFile',
        fileName: 'Enzyme_Post_Experiment_Analysis_Report.md',
        fileKind: 'md',
        location: 'Industrial Enzyme Design / Files / Analysis',
        note: 'MD · 实验后结果解释、证据强度和人工迭代建议。',
      },
    ],
  },
  {
    id: 'enzyme-analysis-iteration-turn-017',
    role: 'mainAgent',
    markdown:
      'Enzyme_Curve_Fit_and_QC_Summary.xlsx 和 Enzyme_Operational_Record_Index.csv 已作为附录索引，方便追溯曲线、样本和异常策略。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-018',
    role: 'user',
    markdown:
      '确认归档。请明确写上不能自动选择 lead，也不能自动提交下一轮实验。',
  },
  {
    id: 'enzyme-analysis-iteration-turn-019',
    role: 'mainAgent',
    markdown:
      '已归档 Enzyme_Iteration_Decision_Log.md：只能作为人工复核输入，不能自动选择 lead，不能自动提交下一轮实验。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认分析报告归档',
        confirmedBy: 'Data Owner',
        confirmedAt: '2026-06-02 17:25',
        decision: '报告归档为人工复核材料，不作为自动决策或机制证明。',
      },
    ],
  },
]

export const industrialEnzymeThreads: EnzymeThread[] = [
  {
    id: 'enzyme-full-loop',
    title: 'ENZ-P0 工业酶优化闭环',
    lastActivity: '刚刚',
    transcript: fullLoopTranscript,
    runInspector: runInspector(
      '工业酶设计闭环完成',
      progress('enzyme-full-loop', [
        '读取工业目标',
        '拆分设计约束',
        '生成候选库',
        '准备实验订单',
        '回放实验执行',
        '回收结果包',
        '分析证据强度',
        '归档人工迭代边界',
      ]),
      [
        {
          id: 'enzyme-full-loop-output-01',
          name: 'Enzyme_Industrial_Design_Brief.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Inputs',
          status: 'saved',
        },
        {
          id: 'enzyme-full-loop-output-02',
          name: 'Enzyme_Candidate_Design_Package.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Design',
          status: 'saved',
        },
        {
          id: 'enzyme-full-loop-output-03',
          name: 'BM-LAB-ENZ-20260602-001',
          kind: 'experimentOrder',
          location: 'Industrial Enzyme Design / Experiments',
          status: 'submitted',
        },
        {
          id: 'enzyme-full-loop-output-04',
          name: 'Enzyme_Experiment_Result_Package.xlsx',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Results',
          status: 'completed',
        },
        {
          id: 'enzyme-full-loop-output-05',
          name: 'Enzyme_Post_Experiment_Analysis_Report.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Analysis',
          status: 'saved',
        },
        {
          id: 'enzyme-full-loop-output-06',
          name: 'Enzyme_Analysis_Figure_Bundle.png',
          kind: 'figure',
          location: 'Industrial Enzyme Design / Files / Figures',
          status: 'saved',
        },
      ],
      [
        {
          id: 'enzyme-full-loop-approval-01',
          kind: 'humanConfirmation',
          title: '确认工业目标取舍',
          status: 'confirmed',
          actor: 'Process Owner',
          decidedAt: '2026-06-02 09:24',
        },
        {
          id: 'enzyme-full-loop-approval-02',
          kind: 'approvalRequest',
          title: '提交 BM-LAB-ENZ-20260602-001',
          status: 'approved',
          actor: 'Process Owner',
          decidedAt: '2026-06-02 10:12',
        },
        {
          id: 'enzyme-full-loop-approval-03',
          kind: 'humanConfirmation',
          title: '确认闭环归档边界',
          status: 'confirmed',
          actor: 'Project Lead',
          decidedAt: '2026-06-02 16:40',
        },
      ],
      fullLoopRuns,
      'enzyme-full-loop',
    ),
  },
  {
    id: 'enzyme-design-breakdown',
    title: '目标定义与候选设计',
    lastActivity: '15 分钟',
    transcript: designTranscript,
    runInspector: runInspector(
      '实验前候选设计完成',
      progress('enzyme-design-breakdown', [
        '读取设计目标',
        '构建家族证据',
        '标注口袋约束',
        '确认可变位点边界',
        '生成 48 个候选',
        '比较多模型证据',
        '输出候选证据表',
        '归档设计交接',
      ]),
      [
        {
          id: 'enzyme-design-output-01',
          name: 'Enzyme_Industrial_Design_Brief.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Inputs',
          status: 'saved',
        },
        {
          id: 'enzyme-design-output-02',
          name: 'Enzyme_Candidate_Design_Package.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Design',
          status: 'saved',
        },
        {
          id: 'enzyme-design-output-03',
          name: 'ENZ-LIB-20260602-048_design_matrix.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Design',
          status: 'saved',
        },
        {
          id: 'enzyme-design-output-04',
          name: 'Enzyme_Candidate_Consensus_Score_Table.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Design',
          status: 'saved',
        },
        {
          id: 'enzyme-design-output-05',
          name: 'ENZ-PLATEMAP-20260602-001.csv',
          kind: 'projectFile',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'draft',
        },
      ],
      [
        {
          id: 'enzyme-design-approval-01',
          kind: 'humanConfirmation',
          title: '确认设计位点边界',
          status: 'confirmed',
          actor: 'Enzyme SME',
          decidedAt: '2026-06-02 09:42',
        },
        {
          id: 'enzyme-design-approval-02',
          kind: 'humanConfirmation',
          title: '确认候选设计包',
          status: 'confirmed',
          actor: 'Project Lead',
          decidedAt: '2026-06-02 10:18',
        },
        {
          id: 'enzyme-design-approval-03',
          kind: 'humanConfirmation',
          title: '确认设计交接边界',
          status: 'confirmed',
          actor: 'Enzyme SME',
          decidedAt: '2026-06-02 10:31',
        },
      ],
      designRuns,
      'enzyme-design-breakdown',
    ),
  },
  {
    id: 'enzyme-experiment-execution',
    title: '酶库订单与实验执行',
    lastActivity: '38 分钟',
    transcript: experimentTranscript,
    runInspector: runInspector(
      '实验执行模块',
      progress('enzyme-experiment-execution', [
        '读取设计交接',
        '确认订单边界',
        '固化样本范围',
        '固化读数面板',
        '生成板图',
        '检查样本库存与孔板关联',
        '检查物料/SOP/设备/线路',
        '订单提交审批',
        '创建 Experiment Task',
        '监控实验记录本',
        '同步 assay 执行',
        '回收结果包',
        '记录异常事件',
        '校验结果包 schema',
        '归档操作索引',
      ]),
      [
        {
          id: 'enzyme-experiment-output-01',
          name: 'BM-LAB-ENZ-20260602-001',
          kind: 'experimentOrder',
          location: 'Industrial Enzyme Design / Experiments',
          status: 'submitted',
        },
        {
          id: 'enzyme-experiment-output-02',
          name: 'ENZ-EXPTASK-20260602-001',
          kind: 'report',
          location: 'Industrial Enzyme Design / Experiments',
          status: 'completed',
        },
        {
          id: 'enzyme-experiment-output-03',
          name: 'ENZ-PLATEMAP-20260602-001.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'completed',
        },
        {
          id: 'enzyme-experiment-output-04',
          name: 'ELN-ENZ-20260602-117_record.json',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'completed',
        },
        {
          id: 'enzyme-experiment-output-05',
          name: 'Enzyme_Experiment_Result_Package.xlsx',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Results',
          status: 'completed',
        },
        {
          id: 'enzyme-experiment-output-06',
          name: 'Enzyme_Operational_Record_Index.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'completed',
        },
      ],
      [
        {
          id: 'enzyme-experiment-approval-01',
          kind: 'humanConfirmation',
          title: '确认设计交接读取',
          status: 'confirmed',
          actor: 'Project Lead',
          decidedAt: '2026-06-02 10:34',
        },
        {
          id: 'enzyme-experiment-approval-02',
          kind: 'humanConfirmation',
          title: '确认订单边界',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 10:45',
        },
        {
          id: 'enzyme-experiment-approval-03',
          kind: 'humanConfirmation',
          title: '确认样本范围',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 10:52',
        },
        {
          id: 'enzyme-experiment-approval-04',
          kind: 'humanConfirmation',
          title: '确认读数面板',
          status: 'confirmed',
          actor: 'Enzyme SME',
          decidedAt: '2026-06-02 10:58',
        },
        {
          id: 'enzyme-experiment-approval-05',
          kind: 'humanConfirmation',
          title: '确认板图对照',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 11:06',
        },
        {
          id: 'enzyme-experiment-approval-06',
          kind: 'humanConfirmation',
          title: '确认样本库存与孔板关联',
          status: 'confirmed',
          actor: 'Sample Custodian',
          decidedAt: '2026-06-02 11:14',
        },
        {
          id: 'enzyme-experiment-approval-07',
          kind: 'humanConfirmation',
          title: '确认物料与执行线路',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 11:22',
        },
        {
          id: 'enzyme-experiment-approval-08',
          kind: 'approvalRequest',
          title: '订单提交审批',
          status: 'approved',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 11:34',
        },
      ],
      experimentRuns,
      'enzyme-experiment-execution',
    ),
  },
  {
    id: 'enzyme-analysis-iteration',
    title: '结果分析与迭代决策',
    lastActivity: '1 小时',
    transcript: analysisTranscript,
    runInspector: runInspector(
      '实验后分析与迭代结论完成',
      progress('enzyme-analysis-iteration', [
        '读取结果包',
        '检查 QC 和异常策略',
        '拟合动力学代理曲线',
        '比较 pH 和温度窗口',
        '估算稳定性趋势',
        '合并证据强度',
        '运行敏感性分析',
        '写入迭代决策日志',
      ]),
      [
        {
          id: 'enzyme-analysis-output-01',
          name: 'Enzyme_Post_Experiment_Analysis_Report.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Analysis',
          status: 'saved',
        },
        {
          id: 'enzyme-analysis-output-02',
          name: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
          kind: 'projectFile',
          location: 'Industrial Enzyme Design / Files / Results',
          status: 'saved',
        },
        {
          id: 'enzyme-analysis-output-03',
          name: 'Enzyme_Candidate_Consensus_Score_Table.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Analysis',
          status: 'saved',
        },
        {
          id: 'enzyme-analysis-output-04',
          name: 'Enzyme_Iteration_Decision_Log.md',
          kind: 'report',
          location: 'Industrial Enzyme Design / Files / Analysis',
          status: 'saved',
        },
        {
          id: 'enzyme-analysis-output-05',
          name: 'Enzyme_Operational_Record_Index.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'saved',
        },
        {
          id: 'enzyme-analysis-output-06',
          name: 'Enzyme_Analysis_Figure_Bundle.png',
          kind: 'figure',
          location: 'Industrial Enzyme Design / Files / Figures',
          status: 'saved',
        },
      ],
      [
        {
          id: 'enzyme-analysis-approval-01',
          kind: 'humanConfirmation',
          title: '确认异常点处理边界',
          status: 'confirmed',
          actor: 'Data Owner',
          decidedAt: '2026-06-02 16:50',
        },
        {
          id: 'enzyme-analysis-approval-02',
          kind: 'humanConfirmation',
          title: '确认迭代决策边界',
          status: 'confirmed',
          actor: 'Project Lead',
          decidedAt: '2026-06-02 17:10',
        },
        {
          id: 'enzyme-analysis-approval-03',
          kind: 'humanConfirmation',
          title: '确认分析报告归档',
          status: 'confirmed',
          actor: 'Data Owner',
          decidedAt: '2026-06-02 17:25',
        },
      ],
      analysisRuns,
      'enzyme-analysis-iteration',
    ),
  },
]
