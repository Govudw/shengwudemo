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
import enzymeExperimentOrderDraft from '../assets/mock-science/enzyme/enzyme-experiment-order-draft.png'
import enzymeAssayPanelDesign from '../assets/mock-science/enzyme/enzyme-assay-panel-design.png'
import enzymePlateMap from '../assets/mock-science/enzyme/enzyme-plate-map.png'
import enzymeSampleMaterialDeviceFlow from '../assets/mock-science/enzyme/enzyme-sample-material-device-flow.png'
import enzymeCroTaskStatus from '../assets/mock-science/enzyme/enzyme-cro-task-status.png'
import enzymeExperimentAnomalyLog from '../assets/mock-science/enzyme/enzyme-experiment-anomaly-log.png'
import enzymeResultIngestionChecklist from '../assets/mock-science/enzyme/enzyme-result-ingestion-checklist.png'
import enzymeResultPackageQcOverview from '../assets/mock-science/enzyme/enzyme-result-package-qc-overview.png'
import enzymeKineticsCurveFitting from '../assets/mock-science/enzyme/enzyme-kinetics-curve-fitting.png'
import enzymePhTemperatureProfile from '../assets/mock-science/enzyme/enzyme-ph-temperature-profile.png'
import enzymeStabilityHalfLife from '../assets/mock-science/enzyme/enzyme-stability-half-life.png'
import enzymeModelConsensusMatrix from '../assets/mock-science/enzyme/enzyme-model-consensus-matrix.png'
import enzymeUncertaintySensitivityAnalysis from '../assets/mock-science/enzyme/enzyme-uncertainty-sensitivity-analysis.png'
import enzymeIterationDecisionTree from '../assets/mock-science/enzyme/enzyme-iteration-decision-tree.png'
import type {
  CandidateEvidenceTableBlock,
  CapabilityRunReplayBlock,
  ConversationTurn,
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
    imagegenPrompt: `Static scientific report figure for Industrial Enzyme Design demo: ${title}.`,
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
    'ExperimentOrderBuilder.composeDraft',
    '生成 BM-LAB 实验订单草稿',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      libraryId: 'ENZ-LIB-20260602-048',
      designPackage: 'Enzyme_Candidate_Design_Package.md',
    },
    {
      status: 'draft',
      sampleCount: 48,
      approvalRequired: true,
    },
    [
      {
        name: 'BM-LAB-ENZ-20260602-001_draft.md',
        kind: 'md',
        description: '实验订单草稿和人工审批项。',
      },
    ],
  ),
  capabilityRun(
    'AssayPanelDesigner.freezeReadouts',
    '冻结活性、动力学代理、Tm 和 pH 读数面板',
    {
      parent: 'ENZ-P0',
      readouts: 'activity,kcatKm_proxy,Tm,pH_window,expression',
      controls: 8,
    },
    {
      readoutPanels: 5,
      minimumReplicates: 3,
      mechanismClaim: 'not_requested',
    },
    [
      {
        name: 'ENZ_assay_panel_design.xlsx',
        kind: 'xlsx',
        description: '读数面板、重复数和 QC 门限。',
      },
    ],
  ),
  capabilityRun(
    'PlateMapGenerator.assignVariants',
    '生成 ENZ-PLATEMAP 板图',
    {
      libraryId: 'ENZ-LIB-20260602-048',
      variantRange: 'ENZ-MUT-001 through ENZ-MUT-048',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
    },
    {
      assignedVariants: 48,
      controlWells: 8,
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
    'LabOrderGateway.submitApprovedOrder',
    '提交已审批实验订单',
    {
      orderId: 'BM-LAB-ENZ-20260602-001',
      taskId: 'ENZ-EXPTASK-20260602-001',
      approver: 'Process Owner',
    },
    {
      submitted: true,
      croRef: 'CRO-ENZ-20260602-001',
      autoSubmitted: false,
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
    'ExperimentTaskTracker.syncCroStatus',
    '同步 CRO 任务状态',
    {
      taskId: 'ENZ-EXPTASK-20260602-001',
      croRef: 'CRO-ENZ-20260602-001',
      orderId: 'BM-LAB-ENZ-20260602-001',
    },
    {
      synthesisDone: true,
      assayDone: true,
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
    },
    [
      {
        name: 'CRO-ENZ-20260602-001_status.json',
        kind: 'json',
        description: 'CRO 合成、质控和测定状态。',
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
    'ResultPackageReceiver.validateFiles',
    '校验结果包文件完整性',
    {
      package: 'Enzyme_Experiment_Result_Package.xlsx',
      plateMap: 'ENZ-PLATEMAP-20260602-001.csv',
      orderId: 'BM-LAB-ENZ-20260602-001',
    },
    {
      filesReceived: 6,
      missingFiles: 0,
      flaggedForQc: true,
    },
    [
      {
        name: 'Enzyme_Experiment_Result_Package.xlsx',
        kind: 'xlsx',
        description: '实验结果包和原始读数。',
      },
    ],
  ),
  capabilityRun(
    'CurveQcSummarizer.prepareReviewWorkbook',
    '生成曲线拟合和 QC 汇总',
    {
      resultPackage: 'Enzyme_Experiment_Result_Package.xlsx',
      curveSummary: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
      taskId: 'ENZ-EXPTASK-20260602-001',
    },
    {
      curveFits: 48,
      qcWarnings: 5,
      reportBoundary: 'execution only',
    },
    [
      {
        name: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
        kind: 'xlsx',
        description: '曲线拟合、QC 标记和复核建议。',
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
      '请把 ENZ-P0 做成一个工业酶设计闭环 demo：设计库 ENZ-LIB-20260602-048，实验订单 BM-LAB-ENZ-20260602-001，结果包 Enzyme_Experiment_Result_Package.xlsx。需要明确哪些地方必须人工确认。',
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
      '我先把闭环拆成目标定义、候选生成、订单执行、结果分析和迭代决策五段。ENZ-MUT-001 到 ENZ-MUT-048 只作为候选库，不表示已经找到最佳酶。',
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
        '工业酶设计 demo 中必须由人确认的边界和审批点。',
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
      '请只拆解设计阶段：从 ENZ-P0 定义 ENZ-LIB-20260602-048，后续关联 BM-LAB-ENZ-20260602-001 和 Enzyme_Experiment_Result_Package.xlsx，但本线程不要提交实验。',
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
      '请确认是否按这个设计包交给实验线程。确认后仍只生成交接文件，不会提交 BM-LAB-ENZ-20260602-001。',
  },
  {
    id: 'enzyme-design-breakdown-turn-014',
    role: 'user',
    markdown:
      '确认设计包。把 ENZ-LIB-20260602-048 标成 ready for review，但订单提交留给实验线程。',
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
        decision: 'ENZ-LIB-20260602-048 可交给实验线程复核，不在本线程提交订单。',
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
      '请把假设、限制和人工确认点写入设计交接，方便实验线程接手。',
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
        decision: '设计线程只交付候选包和证据表，不提交实验订单。',
      },
    ],
  },
]

const experimentTranscript: ConversationTurn[] = [
  {
    id: 'enzyme-experiment-execution-turn-001',
    role: 'user',
    markdown:
      '基于 ENZ-LIB-20260602-048 执行实验拆解：订单 BM-LAB-ENZ-20260602-001，候选 ENZ-MUT-001 through ENZ-MUT-048，结果包 Enzyme_Experiment_Result_Package.xlsx。',
  },
  {
    id: 'enzyme-experiment-execution-turn-002',
    role: 'mainAgent',
    markdown:
      '我先生成订单草稿，状态保持 draft，等你确认读数面板和交付物后才提交。',
    contentBlocks: [
      experimentRuns[0],
      {
        type: 'experimentOrderDraft',
        title: 'Industrial enzyme library assay order',
        orderId: 'BM-LAB-ENZ-20260602-001',
        status: 'draft',
        items: [
          { label: 'Library', value: 'ENZ-LIB-20260602-048' },
          { label: 'Task', value: 'ENZ-EXPTASK-20260602-001' },
          { label: 'CRO', value: 'CRO-ENZ-20260602-001' },
          { label: 'Result package', value: 'Enzyme_Experiment_Result_Package.xlsx' },
        ],
      },
      scientificFigure(
        'enzyme-experiment-order-draft',
        'Experiment order draft',
        'BM-LAB-ENZ-20260602-001 的订单范围、样本和交付物草稿。',
        enzymeExperimentOrderDraft,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-003',
    role: 'mainAgent',
    markdown:
      '订单边界：只测试本轮 48 个候选和对照，不追加突变，不根据中间结果自动改板图。',
  },
  {
    id: 'enzyme-experiment-execution-turn-004',
    role: 'mainAgent',
    markdown:
      '读数面板包含 Activity、kcat/Km proxy、Tm、pH window 和 expression；这些读数用于证据强度，不用于证明机制。',
    contentBlocks: [
      experimentRuns[1],
      scientificFigure(
        'enzyme-assay-panel-design',
        'Assay panel design',
        '工业酶候选库的活性、动力学代理、稳定性、pH 和表达读数面板。',
        enzymeAssayPanelDesign,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-005',
    role: 'user',
    markdown:
      '读数面板可以。请把 ENZ-P0 和空白对照放在每块板上，异常点只标记，不自动删除。',
  },
  {
    id: 'enzyme-experiment-execution-turn-006',
    role: 'mainAgent',
    markdown:
      '已固定对照和异常点策略，ENZ-PLATEMAP-20260602-001.csv 会保留每个孔的样本来源。',
    contentBlocks: [
      experimentRuns[2],
      {
        type: 'humanConfirmation',
        title: '确认板图和异常点策略',
        confirmedBy: 'Lab Owner',
        confirmedAt: '2026-06-02 11:05',
        decision: '每块板保留 ENZ-P0 和空白对照，异常点只标记。',
      },
      scientificFigure(
        'enzyme-plate-map',
        'Plate map',
        'ENZ-PLATEMAP-20260602-001.csv 的候选、对照和重复孔布局。',
        enzymePlateMap,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-007',
    role: 'mainAgent',
    markdown:
      '请确认是否提交 BM-LAB-ENZ-20260602-001。提交后只执行已冻结范围，不会自动追加下一轮设计。',
  },
  {
    id: 'enzyme-experiment-execution-turn-008',
    role: 'mainAgent',
    markdown:
      '交付物清单：ENZ-PLATEMAP-20260602-001.csv、Enzyme_Experiment_Result_Package.xlsx、Enzyme_Curve_Fit_and_QC_Summary.xlsx 和 Enzyme_Operational_Record_Index.csv。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'ENZ-PLATEMAP-20260602-001.csv',
        fileKind: 'csv',
        location: 'Industrial Enzyme Design / Files / Execution',
        note: 'CSV · 96 孔板位、候选、对照和重复孔映射。',
      },
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-009',
    role: 'user',
    markdown:
      '批准提交 BM-LAB-ENZ-20260602-001。范围只限 ENZ-LIB-20260602-048，不允许自动扩展实验。',
  },
  {
    id: 'enzyme-experiment-execution-turn-010',
    role: 'mainAgent',
    markdown:
      '已按人工审批提交订单，并生成 ENZ-EXPTASK-20260602-001。样本、材料、设备链路会写入操作索引。',
    contentBlocks: [
      experimentRuns[3],
      {
        type: 'approvalRequestReplay',
        title: '提交 BM-LAB-ENZ-20260602-001',
        approvalType: 'experimentOrder',
        status: 'approved',
        decidedBy: 'Lab Owner',
        decidedAt: '2026-06-02 11:24',
        decision: '批准提交已冻结的 48 个候选实验订单。',
        requestSummary: '仅授权 ENZ-LIB-20260602-048，不授权追加候选或下一轮实验。',
      },
      {
        type: 'elapsedWorkReplay',
        target: 'Order submission',
        elapsed: '12 分钟',
        status: 'completed',
        summary: '订单从 draft 变为 submitted，并绑定 ENZ-EXPTASK-20260602-001。',
      },
      scientificFigure(
        'enzyme-sample-material-device-flow',
        'Sample material device flow',
        '样本、材料、设备和结果文件之间的可追溯链路。',
        enzymeSampleMaterialDeviceFlow,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-011',
    role: 'mainAgent',
    markdown:
      'CRO-ENZ-20260602-001 已接受任务。这里是静态回放，不代表 Agent 能直接控制实验设备。',
    contentBlocks: [experimentRuns[4]],
  },
  {
    id: 'enzyme-experiment-execution-turn-012',
    role: 'mainAgent',
    markdown:
      '任务执行完成，CRO 状态从合成、表达、测定到结果包回收均有时间戳。',
    contentBlocks: [
      {
        type: 'elapsedWorkReplay',
        target: 'CRO-ENZ-20260602-001 execution',
        elapsed: '4 小时 4 分钟',
        status: 'completed',
        summary: '完成表达、纯化、活性读数、Tm 和 pH profile 测定。',
      },
      scientificFigure(
        'enzyme-cro-task-status',
        'CRO task status',
        'CRO-ENZ-20260602-001 的任务状态和回收节点。',
        enzymeCroTaskStatus,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-013',
    role: 'user',
    markdown:
      '如果边缘孔有异常，请在 Enzyme_Experiment_Result_Package.xlsx 里保留原始读数并打标，不要替我决定删除。',
  },
  {
    id: 'enzyme-experiment-execution-turn-014',
    role: 'mainAgent',
    markdown:
      '异常记录已保留，未自动丢弃任何孔；分析线程会把异常策略作为敏感性条件。',
    contentBlocks: [
      experimentRuns[5],
      {
        type: 'humanConfirmation',
        title: '确认异常处理边界',
        confirmedBy: 'Lab Owner',
        confirmedAt: '2026-06-02 15:10',
        decision: '异常孔只标记，不自动排除；由分析线程复核。',
      },
      scientificFigure(
        'enzyme-experiment-anomaly-log',
        'Experiment anomaly log',
        '边缘孔、表达备注和设备事件的异常记录。',
        enzymeExperimentAnomalyLog,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-015',
    role: 'mainAgent',
    markdown:
      '结果包校验通过：Enzyme_Experiment_Result_Package.xlsx 与板图、订单和任务编号可以互相追溯。',
    contentBlocks: [experimentRuns[6]],
  },
  {
    id: 'enzyme-experiment-execution-turn-016',
    role: 'mainAgent',
    markdown:
      '我生成了结果回收清单，并把曲线 QC 汇总写入 Enzyme_Curve_Fit_and_QC_Summary.xlsx。',
    contentBlocks: [
      experimentRuns[7],
      {
        type: 'projectFile',
        fileName: 'Enzyme_Experiment_Result_Package.xlsx',
        fileKind: 'xlsx',
        location: 'Industrial Enzyme Design / Files / Results',
        note: 'XLSX · 原始实验读数、重复孔、异常标记和元数据。',
      },
      scientificFigure(
        'enzyme-result-ingestion-checklist',
        'Result ingestion checklist',
        '结果包、曲线汇总、板图和操作索引的回收检查。',
        enzymeResultIngestionChecklist,
      ),
    ],
  },
  {
    id: 'enzyme-experiment-execution-turn-017',
    role: 'mainAgent',
    markdown:
      '执行线程交付完成：BM-LAB-ENZ-20260602-001、ENZ-EXPTASK-20260602-001、CRO-ENZ-20260602-001、Enzyme_Operational_Record_Index.csv 均已归档。',
    contentBlocks: [experimentRuns[8]],
  },
  {
    id: 'enzyme-experiment-execution-turn-018',
    role: 'user',
    markdown:
      '确认执行归档。把后续解释限制交给分析线程，不要在这里给候选结论。',
  },
  {
    id: 'enzyme-experiment-execution-turn-019',
    role: 'mainAgent',
    markdown:
      '已归档执行结果。本线程只说明订单、执行、回收和 QC，不输出候选优先级，也不自动设计下一轮实验。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认执行线程归档',
        confirmedBy: 'Project Lead',
        confirmedAt: '2026-06-02 16:00',
        decision: '执行线程只交付结果包和操作索引，分析结论留给下一线程。',
      },
    ],
  },
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
    title: '工业酶设计全流程闭环',
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
    title: '设计拆解：目标定义与候选生成',
    lastActivity: '15 分钟',
    transcript: designTranscript,
    runInspector: runInspector(
      '实验前设计拆解完成',
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
    title: '实验拆解：酶库订单与执行回收',
    lastActivity: '38 分钟',
    transcript: experimentTranscript,
    runInspector: runInspector(
      '酶库实验执行回收完成',
      progress('enzyme-experiment-execution', [
        '生成订单草稿',
        '冻结读数面板',
        '生成板图',
        '提交已审批订单',
        '同步 CRO 执行',
        '记录异常事件',
        '校验结果包',
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
          status: 'saved',
        },
        {
          id: 'enzyme-experiment-output-04',
          name: 'Enzyme_Experiment_Result_Package.xlsx',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Results',
          status: 'completed',
        },
        {
          id: 'enzyme-experiment-output-05',
          name: 'Enzyme_Curve_Fit_and_QC_Summary.xlsx',
          kind: 'projectFile',
          location: 'Industrial Enzyme Design / Files / Results',
          status: 'saved',
        },
        {
          id: 'enzyme-experiment-output-06',
          name: 'Enzyme_Operational_Record_Index.csv',
          kind: 'dataset',
          location: 'Industrial Enzyme Design / Files / Execution',
          status: 'saved',
        },
      ],
      [
        {
          id: 'enzyme-experiment-approval-01',
          kind: 'humanConfirmation',
          title: '确认板图和异常点策略',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 11:05',
        },
        {
          id: 'enzyme-experiment-approval-02',
          kind: 'approvalRequest',
          title: '提交 BM-LAB-ENZ-20260602-001',
          status: 'approved',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 11:24',
        },
        {
          id: 'enzyme-experiment-approval-03',
          kind: 'humanConfirmation',
          title: '确认异常处理边界',
          status: 'confirmed',
          actor: 'Lab Owner',
          decidedAt: '2026-06-02 15:10',
        },
        {
          id: 'enzyme-experiment-approval-04',
          kind: 'humanConfirmation',
          title: '确认执行线程归档',
          status: 'confirmed',
          actor: 'Project Lead',
          decidedAt: '2026-06-02 16:00',
        },
      ],
      experimentRuns,
      'enzyme-experiment-execution',
    ),
  },
  {
    id: 'enzyme-analysis-iteration',
    title: '分析拆解：结果解释与迭代结论',
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
