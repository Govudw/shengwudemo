import type {
  CapabilityRunReplayBlock,
  ConversationTurn,
  RunInspectorCapabilityRunItem,
  RunInspectorData,
} from './conversationTypes'
import { enzymeSynthesisLimsDag } from './enzymeSynthesisOpsMockData'
import type { MockCapabilityEntry, PipelineDag } from './mockCapabilities'
import { pipelineBuildDagV01, pipelineBuildDagV02 } from './pipelineBuildDagData'

type PipelineBuildThread = {
  id: string
  title: string
  lastActivity: string
  transcript: ConversationTurn[]
  runInspector: RunInspectorData
}

type CapabilityArtifact = NonNullable<CapabilityRunReplayBlock['artifacts']>[number]

function capabilityRun(
  commandName: string,
  summary: string,
  input: CapabilityRunReplayBlock['input'],
  output: CapabilityRunReplayBlock['output'],
  artifacts: CapabilityArtifact[] = [],
  duration = '9.8s',
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

const inputExtractionRun = capabilityRun(
  'PipelineBuilder.extractInputs',
  '读取候选酶表、实验 SOP 和底物批次 QC',
  {
    project: 'Pipeline Build / ENZ-P0 实验流程编排',
    files: [
      'ENZ-P0_candidate_variants.xlsx',
      'Enzyme_Assay_SOP_v3.md',
      'Substrate_Lot_QC_202606.xlsx',
    ],
  },
  {
    candidateCount: 48,
    sopVersion: 'v3',
    substrateLot: 'SUB-202606',
    parsedInputConfirmations: 5,
    requiredRuntimeConfirmations: 4,
  },
  [
    {
      name: 'pipeline_input_contract.json',
      kind: 'json',
      description: '输入文件、字段映射、SOP 版本和必要确认点。',
    },
  ],
  '7.6s',
)

const sopSectionRun = capabilityRun(
  'SopParser.extractExperimentSections',
  '提取表达纯化、酶活、稳定性和异常复核段落',
  {
    sop: 'Enzyme_Assay_SOP_v3.md',
    focus: 'ENZ-P0 assay characterization',
  },
  {
    sections: 5,
    qcThresholds: 6,
    humanGateCandidates: 3,
  },
  [
    {
      name: 'sop_section_map.csv',
      kind: 'csv',
      description: 'SOP 段落、阈值和推荐确认点映射。',
    },
  ],
  '11.2s',
)

const draftDagRun = capabilityRun(
  'PipelinePlanner.generateDraftDag',
  '生成实验流程 DAG v0.1',
  {
    inputContract: 'pipeline_input_contract.json',
    sopSectionMap: 'sop_section_map.csv',
    scope: 'expression QC, activity assay, pH/temperature, half-life, review',
  },
  {
    version: 'v0.1',
    nodes: 8,
    edges: 8,
    humanGates: 2,
  },
  [
    {
      name: 'Pipeline_DAG_v0.1.json',
      kind: 'json',
      description: '初版流程拓扑和节点依赖。',
    },
  ],
  '14.9s',
)

const gateInsertionRun = capabilityRun(
  'HumanGatePlanner.insertControlPoint',
  '在活性测定前加入底物与反应体系确认点',
  {
    baseDag: 'Pipeline_DAG_v0.1.json',
    requestedGate: 'substrate lot, reaction system, controls',
  },
  {
    version: 'v0.2',
    insertedNode: '底物与反应体系确认',
    nodes: 9,
    edges: 9,
  },
  [
    {
      name: 'Pipeline_DAG_v0.2.json',
      kind: 'json',
      description: '加入反应体系确认点后的流程拓扑。',
    },
  ],
  '8.4s',
)

const validationRun = capabilityRun(
  'PipelineDagValidator.validateDependencies',
  '校验 DAG 依赖、确认点和输出契约',
  {
    dag: 'Pipeline_DAG_v0.2.json',
    sopVersion: 'Enzyme_Assay_SOP_v3',
    owner: 'Process Development',
  },
  {
    dependencyIssues: 0,
    unresolvedConfirmations: 0,
    outputContract: 'ready',
  },
  [
    {
      name: 'Pipeline_Build_Decision_Log.md',
      kind: 'md',
      description: '用户确认点、修改理由和保存前校验记录。',
    },
  ],
  '6.1s',
)

const saveRun = capabilityRun(
  'PipelineRegistry.savePipeline',
  '保存到 Pipelines 并生成可复用版本',
  {
    pipelineName: 'ENZ-P0 Assay Characterization Pipeline',
    version: 'v1.0',
    dag: 'Pipeline_DAG_v0.2.json',
  },
  {
    registryId: 'pipeline-enz-p0-assay-characterization',
    source: '自建',
    status: 'active',
  },
  [
    {
      name: 'ENZ-P0_Assay_Characterization_Pipeline_v1.0.md',
      kind: 'md',
      description: 'Pipeline 说明、输入输出契约和执行确认点。',
    },
  ],
  '5.3s',
)

const pipelineBuildRuns = [
  inputExtractionRun,
  sopSectionRun,
  draftDagRun,
  gateInsertionRun,
  validationRun,
  saveRun,
]

const pipelineBuildRunInspector: RunInspectorData = {
  summary: {
    stage: 'Pipeline Builder',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 3,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'pipeline-build-progress-01',
      title: '读取输入文件',
      status: 'done',
      detail: '候选酶表、实验 SOP、底物批次 QC 已映射。',
    },
    {
      id: 'pipeline-build-progress-02',
      title: '确认实验范围',
      status: 'done',
      detail: '锁定表达纯化 QC、酶活、稳定性面板和异常复核。',
    },
    {
      id: 'pipeline-build-progress-03',
      title: '抽取 SOP 节点',
      status: 'done',
      detail: '识别 5 个实验段落和 6 个 QC 阈值。',
    },
    {
      id: 'pipeline-build-progress-04',
      title: '生成 DAG v0.1',
      status: 'done',
      detail: '生成初版流程拓扑。',
    },
    {
      id: 'pipeline-build-progress-05',
      title: '插入人工确认点',
      status: 'done',
      detail: '在活性测定前加入底物与反应体系确认。',
    },
    {
      id: 'pipeline-build-progress-06',
      title: '校验 DAG 依赖',
      status: 'done',
      detail: '无未解析依赖或未确认输出契约。',
    },
    {
      id: 'pipeline-build-progress-07',
      title: '保存到 Pipelines',
      status: 'done',
      detail: '登记 ENZ-P0 Assay Characterization Pipeline v1.0。',
    },
  ],
  outputs: [
    {
      id: 'pipeline-build-output-01',
      name: 'ENZ-P0 Assay Characterization Pipeline v1.0',
      kind: 'projectFile',
      location: 'Pipeline Build / Pipelines',
      status: 'saved',
    },
    {
      id: 'pipeline-build-output-02',
      name: 'Pipeline_DAG_v0.2.json',
      kind: 'projectFile',
      location: 'Pipeline Build / Project Files / 输出文件',
      status: 'saved',
    },
    {
      id: 'pipeline-build-output-03',
      name: 'Pipeline_Build_Decision_Log.md',
      kind: 'report',
      location: 'Pipeline Build / Project Files / 输出文件',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'pipeline-build-approval-01',
      kind: 'humanConfirmation',
      title: '确认实验范围',
      status: 'confirmed',
      actor: 'Process Development',
      decidedAt: '2026-06-03 09:15',
    },
    {
      id: 'pipeline-build-approval-02',
      kind: 'humanConfirmation',
      title: '确认输入文件',
      status: 'confirmed',
      actor: 'Process Development',
      decidedAt: '2026-06-03 09:20',
    },
    {
      id: 'pipeline-build-approval-03',
      kind: 'humanConfirmation',
      title: '确认底物与反应体系 gate',
      status: 'confirmed',
      actor: 'Assay Lead',
      decidedAt: '2026-06-03 09:44',
    },
    {
      id: 'pipeline-build-approval-04',
      kind: 'humanConfirmation',
      title: '确认保存并启用 Pipeline v1.0',
      status: 'confirmed',
      actor: 'Process Development',
      decidedAt: '2026-06-03 09:52',
    },
  ],
  capabilityRuns: pipelineBuildRuns.map((run, index) =>
    inspectorRun(`pipeline-build-run-${String(index + 1).padStart(2, '0')}`, run),
  ),
}

const limsPipelineBuildDagV01: PipelineDag = {
  nodes: enzymeSynthesisLimsDag.nodes.map((node) =>
    node.id === 'data-integrity-qc'
      ? {
          ...node,
          description:
            '检查 ELN 回调、结果包 schema、缺失字段、重复孔一致性、异常 flag 和权限边界。',
          inputs: ['ELN 回调数据', '结果包 schema', '结构化数据集', '对象存储清单'],
          prerequisites: ['数据入库完成'],
          control: {
            kind: 'preset-qc-check',
            summary: '数据完整性通过后允许生成结果包；缺失项触发补充回调。',
          },
        }
      : node,
  ),
  edges: enzymeSynthesisLimsDag.edges,
}

const limsPipelineBuildDagV10 = enzymeSynthesisLimsDag

const limsEvidenceExtractionRun = capabilityRun(
  'RealRunEvidenceExtractor.extractLimsFlow',
  '读取真实运行资料包并抽取可固化事实与缺口',
  {
    project: 'Pipeline Build / LIMS 酶合成执行编排',
    files: [
      'RUN-ENZ-SYN-20260604_experiment_retro.md',
      'LIMS_work_orders_export.csv',
      'ELN_callback_records.json',
      'QC_gate_summary.xlsx',
      'approval_events.json',
      'asset_object_manifest.json',
    ],
  },
  {
    confirmedFacts: 6,
    openGaps: 6,
    workOrderFamilies: 4,
    approvalTypes: ['run_start', 'rework_authorization', 'result_release'],
  },
  [
    {
      name: 'LIMS_real_run_evidence_map.json',
      kind: 'json',
      description: '真实运行资料、可固化事实和待确认缺口映射。',
    },
  ],
  '12.4s',
)

const limsDraftDagRun = capabilityRun(
  'PipelinePlanner.generateLimsDraftDag',
  '生成 LIMS 酶合成执行 DAG v0.1',
  {
    evidenceMap: 'LIMS_real_run_evidence_map.json',
    confirmedGaps: [
      '流程边界',
      '输入包',
      '审批模型',
      '工单与回调',
      'QC 与回退',
      '权限与资产',
    ],
  },
  {
    version: 'v0.1',
    nodes: limsPipelineBuildDagV01.nodes.length,
    edges: limsPipelineBuildDagV01.edges.length,
    openRisk: 'data_integrity_waits_only_eln_and_schema',
  },
  [
    {
      name: 'LIMS_Enzyme_Synthesis_DAG_v0.1.json',
      kind: 'json',
      description: '基于真实运行资料抽取的第一版 DAG。',
    },
  ],
  '16.8s',
)

const limsIntegrityRevisionRun = capabilityRun(
  'PipelinePlanner.reviseDataIntegrityGate',
  '把数据完整性检查改为三方一致后放行',
  {
    baseDag: 'LIMS_Enzyme_Synthesis_DAG_v0.1.json',
    correction: 'ELN callback + instrument readout + work order status must match',
  },
  {
    version: 'v0.2',
    updatedNode: '数据完整性检查',
    requiredSignals: ['ELN 回调', '仪器读数', '工单状态'],
  },
  [
    {
      name: 'LIMS_Enzyme_Synthesis_DAG_v0.2.json',
      kind: 'json',
      description: '数据完整性检查改为三方一致后的 DAG。',
    },
  ],
  '7.9s',
)

const limsValidationRun = capabilityRun(
  'PipelineDagValidator.validateLimsDag',
  '校验拓扑、I/O、审批、权限和真实运行 dry-run',
  {
    dag: 'LIMS_Enzyme_Synthesis_DAG_v0.2.json',
    realRun: 'RUN-ENZ-SYN-20260604',
    owner: 'LabOps Owner',
  },
  {
    topologyIssues: 0,
    emptyOutputs: 0,
    approvalContractIssues: 0,
    permissionIssues: 0,
    dryRunResult: 'result_release_reachable',
  },
  [
    {
      name: 'LIMS_Pipeline_Build_Decision_Log.md',
      kind: 'md',
      description: '资料来源、用户确认点、DAG 修改理由和校验记录。',
    },
  ],
  '10.6s',
)

const limsSaveRun = capabilityRun(
  'PipelineRegistry.savePipeline',
  '保存 LIMS 酶合成执行 Pipeline v1.0',
  {
    pipelineName: 'LIMS 酶合成执行 Pipeline',
    version: 'v1.0',
    dag: 'LIMS_Enzyme_Synthesis_DAG_v0.2.json',
  },
  {
    registryId: 'pipeline-enzyme-synthesis-lims',
    source: '自建',
    status: 'active',
  },
  [
    {
      name: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.json',
      kind: 'json',
      description: '完整 Pipeline DAG、节点 I/O、审批和权限契约。',
    },
    {
      name: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.md',
      kind: 'md',
      description: '可读版 Pipeline 输入、输出、流程和使用边界。',
    },
  ],
  '6.8s',
)

const limsPipelineBuildRuns = [
  limsEvidenceExtractionRun,
  limsDraftDagRun,
  limsIntegrityRevisionRun,
  limsValidationRun,
  limsSaveRun,
]

const limsPipelineBuildRunInspector: RunInspectorData = {
  summary: {
    stage: 'Pipeline 编排',
    status: 'completed',
    completedSteps: 12,
    totalSteps: 12,
    outputCount: 3,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'lims-pipeline-build-progress-01',
      title: '读取真实运行资料包',
      status: 'done',
      detail: '复盘、工单、ELN、QC、审批和对象清单已读取。',
    },
    {
      id: 'lims-pipeline-build-progress-02',
      title: '抽取流程事实和缺口',
      status: 'done',
      detail: '分离可固化事实和 6 个待确认决策。',
    },
    {
      id: 'lims-pipeline-build-progress-03',
      title: '确认流程边界',
      status: 'done',
      detail: '覆盖完整 LIMS 执行闭环。',
    },
    {
      id: 'lims-pipeline-build-progress-04',
      title: '确认输入包',
      status: 'done',
      detail: '文件、表记录和负责人补充共同组成输入。',
    },
    {
      id: 'lims-pipeline-build-progress-05',
      title: '确认审批模型',
      status: 'done',
      detail: '审批节点统一为审批人、审批类型和资料包。',
    },
    {
      id: 'lims-pipeline-build-progress-06',
      title: '确认工单和回调模型',
      status: 'done',
      detail: '节点 I/O 记录工单、设备/人员/ELN 回调和执行记录。',
    },
    {
      id: 'lims-pipeline-build-progress-07',
      title: '确认 QC 与回退策略',
      status: 'done',
      detail: '区分返工和隔离继续。',
    },
    {
      id: 'lims-pipeline-build-progress-08',
      title: '确认权限和资产规则',
      status: 'done',
      detail: '发起人 owner，节点负责人默认 read。',
    },
    {
      id: 'lims-pipeline-build-progress-09',
      title: '生成 DAG v0.1',
      status: 'done',
      detail: '生成第一版 LIMS 执行闭环 DAG。',
    },
    {
      id: 'lims-pipeline-build-progress-10',
      title: '修订数据完整性 QC',
      status: 'done',
      detail: '改为 ELN、仪器读数和工单状态三方一致。',
    },
    {
      id: 'lims-pipeline-build-progress-11',
      title: '校验 DAG 和 I/O 契约',
      status: 'done',
      detail: '拓扑、I/O、审批、权限和 dry-run 均通过。',
    },
    {
      id: 'lims-pipeline-build-progress-12',
      title: '保存 Pipeline v1.0',
      status: 'done',
      detail: '登记 LIMS 酶合成执行 Pipeline v1.0。',
    },
  ],
  outputs: [
    {
      id: 'lims-pipeline-build-output-01',
      name: 'LIMS 酶合成执行 Pipeline v1.0',
      kind: 'projectFile',
      location: 'Pipeline Build / Pipelines',
      status: 'saved',
    },
    {
      id: 'lims-pipeline-build-output-02',
      name: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.json',
      kind: 'projectFile',
      location: 'Pipeline Build / Project Files / 输出文件',
      status: 'saved',
    },
    {
      id: 'lims-pipeline-build-output-03',
      name: 'LIMS_Pipeline_Build_Decision_Log.md',
      kind: 'report',
      location: 'Pipeline Build / Project Files / 输出文件',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'lims-pipeline-build-confirmation-01',
      kind: 'humanConfirmation',
      title: '确认保存 Pipeline',
      status: 'confirmed',
      actor: 'LabOps Owner',
      decidedAt: '2026-06-04 10:38',
    },
  ],
  capabilityRuns: limsPipelineBuildRuns.map((run, index) =>
    inspectorRun(`lims-pipeline-build-run-${String(index + 1).padStart(2, '0')}`, run),
  ),
}

const pipelineBuildTranscript: ConversationTurn[] = [
  {
    id: 'pipeline-build-turn-001',
    role: 'user',
    markdown:
      '我想把 ENZ-P0 这一批候选酶后面的实验流程固化成一个 Pipeline，后面团队可以直接复用。你先帮我一起把流程确认清楚。',
  },
  {
    id: 'pipeline-build-turn-002',
    role: 'mainAgent',
    markdown:
      '我先只确认第一件事：这条 Pipeline 的边界。\n\n**推荐 A：** 覆盖从候选酶样本接收到结果包归档，包括表达与纯化 QC、酶活、pH/温度、半衰期和异常复核。\n\nB：只覆盖酶活测定，不处理稳定性和异常复核。\n\nC：覆盖更长链路，把上一轮候选设计也放进同一条 Pipeline。\n\n我建议选 A，因为这更适合作为实验过程复用模板，也不会把设计判断混进执行流程。',
  },
  {
    id: 'pipeline-build-turn-003',
    role: 'user',
    markdown: '选 A。先把实验过程闭环做好，设计判断不要放进去。',
  },
  {
    id: 'pipeline-build-turn-004',
    role: 'mainAgent',
    markdown:
      '第二件事只确认输入文件。\n\n**推荐 A：** 用三类输入作为固定入口：候选酶变体表、实验 SOP、底物批次 QC 表。\n\nB：只用候选酶变体表和 SOP，底物批次在执行时人工补录。\n\nC：再加入历史结果包，用于自动设置阈值。\n\n我建议选 A。历史结果可以作为参考，但固定 Pipeline 的第一版不应让阈值自动漂移。',
  },
  {
    id: 'pipeline-build-turn-005',
    role: 'user',
    markdown:
      '选 A。输入就按这三个文件：候选酶变体表、SOP v3、底物批次 QC。底物批次不要自动通过。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'ENZ-P0_candidate_variants.xlsx',
        fileKind: 'xlsx',
        location: 'Pipeline Build / Project Files / 输入文件',
        note: 'XLSX · 48 个候选酶变体 · 已保存为 Project File',
      },
      {
        type: 'projectFile',
        fileName: 'Enzyme_Assay_SOP_v3.md',
        fileKind: 'md',
        location: 'Pipeline Build / Project Files / 输入文件',
        note: 'MD · 酶活、稳定性和异常复核 SOP · 已保存为 Project File',
      },
      {
        type: 'projectFile',
        fileName: 'Substrate_Lot_QC_202606.xlsx',
        fileKind: 'xlsx',
        location: 'Pipeline Build / Project Files / 输入文件',
        note: 'XLSX · 底物批次、对照设置和放行记录 · 已保存为 Project File',
      },
    ],
  },
  {
    id: 'pipeline-build-turn-005a',
    role: 'mainAgent',
    markdown:
      '我先不直接生成输入契约。我担心把候选酶表里的 ID 粒度理解错，后面板位映射和复测记录都会错。先只确认候选酶集合怎么定义。\n\n**推荐 A：** 把 `variant_id + sample_id + plate_id + well_position + replicate` 作为一个可执行候选单元；variant_id 表示设计变体，sample_id 表示本次实验样本。\n\nB：只把 variant_id 作为输入主键，sample_id 和板位在执行时再补。\n\nC：把 sample_id 作为唯一主键，variant_id 只作为备注字段。\n\n我建议选 A，因为它能同时追踪设计变体和实验样本，后续复测也不会混在一起。',
  },
  {
    id: 'pipeline-build-turn-005b',
    role: 'user',
    markdown:
      '选 A。variant_id 是设计变体，sample_id 是本次实验样本，plate 和 well 也要进入输入契约。',
  },
  {
    id: 'pipeline-build-turn-005c',
    role: 'mainAgent',
    markdown:
      '第二个容易误解的点是 SOP 里的表达与纯化阈值。我担心如果只把它们当作报告字段，Pipeline 会把不该进入 assay 的样本继续往下送。\n\n**推荐 A：** 把表达量下限、纯化收率和基础纯度阈值解析为前置 QC 规则；未通过样本只进入异常复核，不进入酶活测定。\n\nB：把这些阈值只作为结果标注，所有样本仍进入酶活测定。\n\nC：不在 Pipeline 中固化阈值，每次由负责人手动判断。\n\n我建议选 A。你刚才强调底物批次不要自动通过，同样的逻辑也适用于表达与纯化 QC。',
  },
  {
    id: 'pipeline-build-turn-005d',
    role: 'user',
    markdown:
      '选 A。表达、纯化、基础纯度都作为前置 QC。未通过不要进入酶活测定，但要保留异常复核入口。',
  },
  {
    id: 'pipeline-build-turn-005e',
    role: 'mainAgent',
    markdown:
      '第三个点是反应体系。SOP v3 里有默认条件，底物批次 QC 表里也有本批次信息。我担心如果只引用 SOP，实际执行时会漏掉本批次底物和对照配置。\n\n**推荐 A：** 把底物批次、底物浓度、酶浓度、buffer、pH、温度、反应时间、读数方式和对照孔设置都解析成固定输入字段，进入酶活测定前再确认一次。\n\nB：只解析 SOP 默认条件，底物批次和对照孔在实验执行时人工补录。\n\nC：只确认底物批次，其他反应条件按 SOP 默认值静默继承。\n\n我建议选 A，因为这条 Pipeline 的核心风险就在反应体系一致性，不能只把文件名当输入。',
  },
  {
    id: 'pipeline-build-turn-005f',
    role: 'user',
    markdown:
      '选 A。反应体系要拆成具体字段，不要只写 SOP 文件。底物批次、浓度、buffer、pH、温度、时间、读数方式和对照孔都要有。',
  },
  {
    id: 'pipeline-build-turn-005g',
    role: 'mainAgent',
    markdown:
      '第四个点是对照失败怎么处理。我担心如果只把对照读数放进输出，Pipeline 会在阳性或阴性对照失败时仍然生成可用结论。\n\n**推荐 A：** 把阳性对照、阴性对照、blank wells、对照阈值和失败路由写入输入契约；任一关键对照失败时，结果包标记为需复核，不输出可用活性结论。\n\nB：对照失败只在报告里标注，活性结果仍照常输出。\n\nC：只保留阳性和阴性对照，不把 blank wells 写入输入契约。\n\n我建议选 A。这样后面结果包会清楚区分“实验执行完成”和“结论可用”。',
  },
  {
    id: 'pipeline-build-turn-005h',
    role: 'user',
    markdown:
      '选 A。对照失败必须阻断可用结论，blank wells 也要在输入契约里。',
  },
  {
    id: 'pipeline-build-turn-005i',
    role: 'mainAgent',
    markdown:
      '最后确认稳定性面板和输出字段契约。我担心如果这里不先锁定，后面 DAG 能跑完，但结果包会缺少进入下一轮判断需要的字段。\n\n**推荐 A：** 把 pH 梯度、温度梯度、半衰期时间点、重复数、曲线质量要求，以及结果包中的 activity、QC status、control status、retest flag、exclusion reason、version record 都作为 Pipeline Input 的一部分。\n\nB：稳定性面板先不进入本 Pipeline，只输出酶活结果。\n\nC：输出字段不提前固定，等实验完成后根据实际数据生成。\n\n我建议选 A。Pipeline 不是只把实验步骤串起来，还要保证输出字段契约可复用。',
  },
  {
    id: 'pipeline-build-turn-005j',
    role: 'user',
    markdown:
      '选 A。稳定性面板和输出字段契约都固定下来。结果包必须包含 QC、control、retest、exclusion 和 version record。',
  },
  {
    id: 'pipeline-build-turn-006',
    role: 'mainAgent',
    markdown:
      '我把刚才确认的 5 个输入解析点合成了 `pipeline_input_contract.json`：候选酶集合、样本与板位映射、前置 QC 规则、反应体系与对照设置、稳定性面板和输出字段契约都已拆成字段，不再把文件本身当作唯一输入。\n\n接下来只确认 QC 分流执行方式。\n\n**推荐 A：** 表达与纯化 QC 用固定阈值自动分流；未通过样本进入异常复核，不进入活性测定。\n\nB：所有样本都进入活性测定，QC 只在报告里标注。\n\nC：表达与纯化 QC 每次由负责人手动判断。\n\n我建议选 A，因为它能减少无效测定，同时把异常样本交给人工复核。',
    contentBlocks: [inputExtractionRun],
  },
  {
    id: 'pipeline-build-turn-007',
    role: 'user',
    markdown:
      '选 A。表达或纯化不过的样本不要进活性测定，但是异常样本要能复核和安排复测。确认点也按 A 来，先给我看第一版 DAG。',
  },
  {
    id: 'pipeline-build-turn-008',
    role: 'mainAgent',
    markdown:
      '第四件事只确认人工确认点。\n\n**推荐 A：** 保留三个确认点：实验范围确认、底物与反应体系确认、异常复核与复测判断。\n\nB：只保留最后的异常复核确认点。\n\nC：每个实验段落前都加确认点。\n\n我建议选 A。它能覆盖关键风险，又不会让执行流程被过多停顿打断。',
    contentBlocks: [sopSectionRun],
  },
  {
    id: 'pipeline-build-turn-009',
    role: 'mainAgent',
    markdown:
      '我按 A 记录确认点：实验范围确认、底物与反应体系确认、异常复核与复测判断。下面先生成第一版 DAG，再把需要调整的节点单独标出来。',
  },
  {
    id: 'pipeline-build-turn-010',
    role: 'mainAgent',
    markdown:
      '这是第一版 DAG。它已经覆盖输入、范围锁定、条码映射、表达纯化 QC、酶活、稳定性面板、异常复核和结果包归档。\n\n我注意到你特别强调活性测定前的底物与反应体系确认；这一版还没有单独拆成节点。\n\n**推荐 A：** 在表达与纯化 QC 之后、酶活测定之前插入独立人工确认点，确认底物批次、反应体系和对照设置。\n\nB：不新增节点，只把底物批次和反应体系写进酶活测定节点的前置条件。\n\nC：把底物批次确认放到输入文件确认阶段，不在实验执行中再停一次。\n\n我建议选 A，因为这个风险点会直接影响活性测定结果，应该作为进入酶活测定前的必经 gate。',
    contentBlocks: [
      draftDagRun,
      {
        type: 'pipelineDag',
        title: 'ENZ-P0 实验流程 DAG',
        version: 'v0.1',
        status: 'draft',
        summary: '初版流程把 QC 异常样本分流到复核，但尚未单独拆出反应体系确认节点。',
        dag: pipelineBuildDagV01,
      },
    ],
  },
  {
    id: 'pipeline-build-turn-011',
    role: 'user',
    markdown:
      '需要改。活性测定前加一个确认节点，确认底物批次、反应体系、阳性对照、阴性对照，再进入酶活测定。',
  },
  {
    id: 'pipeline-build-turn-012',
    role: 'mainAgent',
    markdown:
      '已按你的要求更新。v0.2 在表达与纯化 QC 之后、酶活测定之前插入“底物与反应体系确认”，并把反应体系、底物批次和对照设置作为人工确认输出。\n\n依赖校验结果：没有未解析输入，没有孤立节点，也没有绕过人工确认点的边。',
    contentBlocks: [
      gateInsertionRun,
      validationRun,
      {
        type: 'pipelineDag',
        title: 'ENZ-P0 实验流程 DAG',
        version: 'v0.2',
        status: 'validated',
        summary: '新版流程把底物批次、反应体系和对照设置作为进入酶活测定前的必经确认点。',
        dag: pipelineBuildDagV02,
      },
    ],
  },
  {
    id: 'pipeline-build-turn-013',
    role: 'mainAgent',
    markdown:
      '最后只确认保存方式。\n\n**推荐 A：** 保存为 `ENZ-P0 Assay Characterization Pipeline v1.0`，来源标记为自建，并允许主流程在后续 Thread 中调用。\n\nB：保存为草稿，只保留当前对话可见。\n\nC：先导出 DAG，不登记到 Pipelines。\n\n我建议选 A。当前确认点和依赖已经完整，可以进入可复用版本。',
  },
  {
    id: 'pipeline-build-turn-014',
    role: 'user',
    markdown: '选 A。确认保存，并允许后续 Thread 调用。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认保存 Pipeline',
        confirmedBy: 'Process Development',
        confirmedAt: '2026-06-03 09:52',
        decision: '保存为 v1.0，并允许后续 Thread 调用。',
      },
    ],
  },
  {
    id: 'pipeline-build-turn-015',
    role: 'mainAgent',
    markdown: `
已保存到 Pipelines，来源为自建，版本 v1.0。

保存条目：\`ENZ-P0 Assay Characterization Pipeline v1.0\`

**Pipeline Input**

- 候选酶集合：48 个 ENZ-P0 变体；每个候选包含 variant_id、sample_id、突变标签、样本批次、进入实验状态和候选来源。
- 样本与板位映射：plate_id、well_position、replicate 规则、样本条码，以及候选与实验孔位的绑定关系。
- 表达与纯化 QC 规则：表达量下限、纯化收率、基础纯度阈值，以及未通过样本进入异常复核的分流规则。
- 酶活测定配置：底物批次、底物浓度、酶浓度、缓冲体系、pH、温度、反应时间和读数方式。
- 对照设置：阳性对照、阴性对照、blank wells、对照失败阈值和失败后的处理规则。
- 稳定性面板定义：pH 梯度、温度梯度、半衰期时间点、重复数和曲线质量要求。
- 人工确认点：实验范围确认、底物与反应体系确认、异常复核与复测判断。
- 输出字段契约：结果包必须包含 activity、QC status、control status、retest flag、exclusion reason 和 version record。

这些输入由候选酶变体表、SOP v3 和底物批次 QC 表解析得到，原始文件保留为 Project Files 追溯来源。

**Pipeline Output**

- 样本执行结果：每个候选酶对应的 sample_id、plate_id、well_position、replicate、执行状态和原始读数索引。
- 酶活结果：activity value、单位、归一化结果、对照校正结果、重复孔 CV，以及是否通过活性读数质量要求。
- QC 状态表：表达纯化 QC、对照 QC、曲线质量 QC、稳定性面板 QC 的通过/失败状态和失败原因。
- 对照结果：阳性对照、阴性对照、blank wells 的读数、阈值判断和异常标记。
- 稳定性结果：pH profile、temperature profile、half-life readout、曲线拟合状态和置信标记。
- 异常与复测决策：异常样本列表、异常类型、是否复测、复测原因、是否排除和排除理由。
- 候选酶结果摘要：每个候选的 activity、stability、QC status、retest flag、exclusion reason 和进入下一轮判断所需字段。
- 标准化结果包：汇总样本执行结果、酶活结果、对照结果、稳定性结果、QC 状态表、复测清单和排除记录。
- Pipeline 版本记录：Pipeline name、version、DAG version、确认点、确认人、确认时间和执行输入摘要。

**输出文件**

- \`Pipeline_DAG_v0.2.json\`
- \`ENZ-P0_Assay_Result_Package.xlsx\`
- \`ENZ-P0_QC_Status_Table.csv\`
- \`ENZ-P0_Retest_and_Exclusion_Log.md\`
- \`ENZ-P0_Assay_Characterization_Pipeline_v1.0.md\`

**Pipeline 流程**

Pipeline 先读取候选酶集合和样本板位映射，生成可追溯的样本执行表；随后按表达与纯化 QC 规则判断哪些样本可以进入 assay，未通过样本进入异常复核。通过 QC 的样本在酶活测定前必须完成底物批次、反应体系和对照设置确认。确认后执行酶活测定，并把原始读数、对照状态和样本映射写入结果包。随后进入 pH、温度和半衰期稳定性面板，最后根据异常复核规则生成复测清单、排除记录、QC 状态表和 Pipeline 版本记录。

后续在 ENZ-P0 或同类候选酶实验 Thread 中，可以直接调用这条 Pipeline，并在执行前重新确认输入文件、底物批次和反应体系。
`.trim(),
    contentBlocks: [
      saveRun,
      {
        type: 'pipelineDag',
        title: 'ENZ-P0 Assay Characterization Pipeline DAG',
        version: 'v0.2',
        status: 'saved',
        summary: '最终保存版本 DAG，包含输入确认、QC 分流、人工确认点、实验执行和结果归档。',
        dag: pipelineBuildDagV02,
      },
    ],
  },
]

const limsPipelineBuildTranscript: ConversationTurn[] = [
  {
    id: 'lims-pipeline-build-turn-001',
    role: 'user',
    markdown:
      '上一轮酶合成实验已经跑通了，我想把这个 LIMS 流程固化成可复用 Pipeline。资料不是特别齐，我先把复盘包、部分 LIMS 工单、QC 摘要、审批事件和对象清单给你。你帮我抽出 DAG，不清楚的地方一项项问我。',
    contentBlocks: [
      {
        type: 'projectFile',
        fileName: 'RUN-ENZ-SYN-20260604_experiment_retro.md',
        fileKind: 'md',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'MD · 上一轮真实实验复盘，包含跑通流程、返工原因和人工判断记录。',
      },
      {
        type: 'projectFile',
        fileName: 'LIMS_work_orders_export.csv',
        fileKind: 'csv',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'CSV · 构建、表达、纯化、检测工单导出，部分字段缺失。',
      },
      {
        type: 'projectFile',
        fileName: 'ELN_callback_records.json',
        fileKind: 'json',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'JSON · 实验记录本回调，字段不完全统一。',
      },
      {
        type: 'projectFile',
        fileName: 'QC_gate_summary.xlsx',
        fileKind: 'xlsx',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'XLSX · 构建 QC、纯化 QC、数据完整性 QC 摘要。',
      },
      {
        type: 'projectFile',
        fileName: 'approval_events.json',
        fileKind: 'json',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'JSON · 启动审批、质检审批、结果释放审批事件。',
      },
      {
        type: 'projectFile',
        fileName: 'asset_object_manifest.json',
        fileKind: 'json',
        location: 'Pipeline Build / Project Files / LIMS 复盘资料',
        note: 'JSON · 对象存储文件、表记录和结果包清单。',
      },
    ],
  },
  {
    id: 'lims-pipeline-build-turn-002',
    role: 'mainAgent',
    markdown:
      '我先把资料分成两类：可以直接固化的事实，和需要你确认的缺口。\n\n**可以直接固化的事实**\n\n- 上一轮流程覆盖 48 个候选酶和 4 个对照。\n- 实际运行中出现过构建 QC 异常，并且只返工异常样本。\n- LIMS 里存在构建、表达、纯化、检测四类工单。\n- 审批事件包括 `run_start`、`rework_authorization`、`result_release`。\n- 输出包含工单包、执行记录、QC 结论、结构化数据、结果包和效率复盘。\n\n**需要你确认的缺口**\n\n- Pipeline 边界是否包含结果释放和效率复盘。\n- 输入包是否同时包含文件、表记录和负责人语言补充。\n- 审批节点是否统一为审批人、审批类型和资料包。\n- 工单和回调是否作为节点 I/O 记录。\n- QC 不通过时是返工、隔离继续，还是终止。\n- 节点负责人和资产权限默认规则。\n\n我先不画 DAG，先把这些缺口逐项确认。',
    contentBlocks: [limsEvidenceExtractionRun],
  },
  {
    id: 'lims-pipeline-build-turn-003',
    role: 'mainAgent',
    markdown:
      '这里我需要先确认流程边界。我从资料里能确定，上一轮最终做到了结果包和效率复盘，但不确定这是否要固化进 Pipeline。\n\n**推荐 A：** 覆盖完整 LIMS 执行闭环，从输入确认、启动审批、样本注册、资源锁定、工单派发、构建、表达、纯化、检测、QC gate、数据入库、结果释放到效率复盘。\n\nB：只覆盖湿实验执行段，到检测数据回传为止。\n\nC：覆盖到下一轮分子设计建议。\n\n我建议选 A，因为真实运行已经产生了结果释放和效率复盘数据，不放进 Pipeline，负责人后续仍然要手工拼接运行表现。',
  },
  {
    id: 'lims-pipeline-build-turn-004',
    role: 'user',
    markdown: '选 A。这个 Pipeline 就覆盖完整 LIMS 执行闭环，不进入下一轮分子设计。',
  },
  {
    id: 'lims-pipeline-build-turn-005',
    role: 'mainAgent',
    markdown:
      '第二个缺口是输入包。资料里有文件，也有 LIMS 表记录，但我担心只把文件当输入会漏掉库存、设备窗口和负责人补充的返工边界。\n\n**推荐 A：** 输入包由文件、表记录和负责人语言补充共同组成。\n\nB：只使用文件，表记录在执行时再读取。\n\nC：只使用结构化表记录，不把复盘文档作为输入。\n\n我建议选 A，因为这次记录并不完整，真实的返工边界和结果释放规则需要负责人补充才能固化。',
  },
  {
    id: 'lims-pipeline-build-turn-006',
    role: 'user',
    markdown:
      '选 A。工单和回调记录能用就用，不完整的部分我补充。比如当时构建异常只返工了 5 个样本，不是整批重做。',
  },
  {
    id: 'lims-pipeline-build-turn-007',
    role: 'mainAgent',
    markdown:
      '第三个缺口是审批节点。我看到三个审批事件，但不想把每个审批的 checklist 写死，否则后续换审批系统会很难改。\n\n**推荐 A：** 审批节点统一抽象为审批人、审批类型和资料包；外部审批系统返回审批结果、结果资料包和执行记录。\n\nB：每个审批节点都内置具体 checklist。\n\nC：只保留启动审批，质检和结果释放放到普通节点里。\n\n我建议选 A，因为它能把 `run_start`、`rework_authorization`、`result_release` 都统一进 DAG，同时保留审批通过和不通过两条线。',
  },
  {
    id: 'lims-pipeline-build-turn-008',
    role: 'user',
    markdown:
      '选 A。审批节点就按审批人、审批类型和资料包处理。具体审批系统返回什么，由外部审批系统负责。',
  },
  {
    id: 'lims-pipeline-build-turn-009',
    role: 'mainAgent',
    markdown:
      '第四个缺口是工单和回调。我看到构建、表达、纯化、检测都有工单，也有 ELN 和设备回调。如果每个回调都拆成独立节点，DAG 会变得很碎。\n\n**推荐 A：** 工单和回调不完全拆开，但在每个执行节点的 I/O 里明确工单记录、设备/人员/ELN 回调数据和执行记录。\n\nB：每个执行节点拆成派单、等待回调、解析回调三个节点。\n\nC：只保留一个大工单执行节点。\n\n我建议选 A，因为它既能表达真实 LIMS 回调，又不会把编排图堆成日志清单。',
  },
  {
    id: 'lims-pipeline-build-turn-010',
    role: 'user',
    markdown:
      '选 A。DAG 节点保持清楚，但节点背后的 I/O 要能让后续执行时读到工单、回调和执行记录。',
  },
  {
    id: 'lims-pipeline-build-turn-011',
    role: 'mainAgent',
    markdown:
      '第五个缺口是 QC 不通过后的路由。复盘资料里有构建 QC 异常，但不是整轮失败。我担心如果把 QC 不通过直接写成“重跑上一步”，后续会浪费样本和设备窗口。\n\n**推荐 A：** 区分返工和隔离继续。异常样本进入质检审批；审批通过只返工受影响样本，审批不通过就隔离异常样本，其余样本继续。\n\nB：所有 QC 不通过都回到上一个实验节点重跑。\n\nC：所有 QC 不通过都终止 Pipeline。\n\n我建议选 A，因为这符合上一轮真实处理方式，也能保留人的判断空间。',
  },
  {
    id: 'lims-pipeline-build-turn-012',
    role: 'user',
    markdown:
      '选 A。节点名字叫质检审批，不要叫返工审批。审批通过才返工受影响样本，不通过就隔离继续。',
  },
  {
    id: 'lims-pipeline-build-turn-013',
    role: 'mainAgent',
    markdown:
      '最后一个缺口是权限和资产。节点输出会包含对象存储文件、表记录和执行记录，但不是每个下游负责人都需要看到全部内容。\n\n**推荐 A：** 发起人默认 owner；节点负责人默认拥有所需 read 权限；只有特殊限制才在节点 I/O 中声明。\n\nB：每条边都显式声明权限。\n\nC：所有节点共享同一权限。\n\n我建议选 A，因为它能保持 Pipeline JSON 完整，又不会让每条边都被权限配置淹没。',
  },
  {
    id: 'lims-pipeline-build-turn-014',
    role: 'user',
    markdown:
      '选 A。发起人默认 owner，节点负责人默认 read。只有特殊限制才写清楚。',
  },
  {
    id: 'lims-pipeline-build-turn-015',
    role: 'mainAgent',
    markdown:
      '六个缺口已经锁定。我先生成第一版 DAG。它会覆盖输入包、审批、样本注册、资源准备、工单、构建、表达、纯化、检测、数据入库、结果释放和效率复盘。\n\n我会特别标出一个风险点：数据完整性检查现在只依赖 ELN 回调和结果包 schema，可能还不够。',
    contentBlocks: [
      limsDraftDagRun,
      {
        type: 'pipelineDag',
        title: 'LIMS 酶合成执行 Pipeline DAG',
        version: 'v0.1',
        status: 'draft',
        summary: '基于真实运行资料抽取的第一版 LIMS 执行闭环。',
        dag: limsPipelineBuildDagV01,
      },
    ],
  },
  {
    id: 'lims-pipeline-build-turn-016',
    role: 'user',
    markdown:
      '这里要改。数据完整性 QC 不能只等 ELN 和结果包 schema。上一轮仪器读数回传慢，差点提前入库。这里必须等 ELN 回调、仪器读数和工单状态三方一致，再进入数据入库。',
  },
  {
    id: 'lims-pipeline-build-turn-017',
    role: 'mainAgent',
    markdown:
      '已改。数据完整性检查现在要求 ELN 回调、仪器读数和工单状态三方一致；如果任意一方缺失或冲突，就进入补充回调，不生成结果包。',
    contentBlocks: [
      limsIntegrityRevisionRun,
      {
        type: 'pipelineDag',
        title: 'LIMS 酶合成执行 Pipeline DAG',
        version: 'v0.2',
        status: 'validated',
        summary: '数据完整性 QC 已改为 ELN、仪器读数和工单状态三方一致后才放行。',
        dag: limsPipelineBuildDagV10,
      },
    ],
  },
  {
    id: 'lims-pipeline-build-turn-018',
    role: 'mainAgent',
    markdown:
      '保存前我做 5 类校验：DAG 拓扑、节点 I/O、审批契约、权限契约和上一轮真实运行 dry-run。\n\n结果都通过：没有孤立节点，每个节点都有输出；启动审批、质检审批和结果释放审批都具备审批人、审批类型和资料包；权限默认规则可执行；上一轮记录可以跑到结果释放。',
    contentBlocks: [limsValidationRun],
  },
  {
    id: 'lims-pipeline-build-turn-019',
    role: 'mainAgent',
    markdown:
      '最后只确认保存。\n\n**推荐 A：** 保存为 `LIMS 酶合成执行 Pipeline v1.0`，来源为自建，并允许后续 Thread 调用。\n\nB：保存为草稿，只保留当前对话可见。\n\nC：只导出 DAG，不登记到 Pipelines。\n\n我建议选 A，因为 DAG、I/O、审批、权限和真实运行 dry-run 都已经通过。',
  },
  {
    id: 'lims-pipeline-build-turn-020',
    role: 'user',
    markdown: '确认保存。按这个版本进入 Pipelines。',
    contentBlocks: [
      {
        type: 'humanConfirmation',
        title: '确认保存 Pipeline',
        confirmedBy: 'LabOps Owner',
        confirmedAt: '2026-06-04 10:38',
        decision: '保存为 LIMS 酶合成执行 Pipeline v1.0，并允许后续 Thread 调用。',
      },
    ],
  },
  {
    id: 'lims-pipeline-build-turn-021',
    role: 'mainAgent',
    markdown:
      '已保存到 Pipelines，来源为自建，版本 v1.0。\n\n保存条目：`LIMS 酶合成执行 Pipeline v1.0`',
    contentBlocks: [
      limsSaveRun,
      {
        type: 'projectFile',
        fileName: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.json',
        fileKind: 'json',
        location: 'Pipeline Build / Project Files / 输出文件',
        note: 'JSON · 完整 Pipeline DAG、节点 I/O、审批和权限契约。',
      },
      {
        type: 'projectFile',
        fileName: 'LIMS_Pipeline_Build_Decision_Log.md',
        fileKind: 'md',
        location: 'Pipeline Build / Project Files / 输出文件',
        note: 'MD · 资料来源、用户确认点、DAG 修改理由和校验记录。',
      },
      {
        type: 'projectFile',
        fileName: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.md',
        fileKind: 'md',
        location: 'Pipeline Build / Project Files / 输出文件',
        note: 'MD · 可读版 Pipeline 输入、输出、流程和使用边界。',
      },
    ],
  },
  {
    id: 'lims-pipeline-build-turn-022',
    role: 'mainAgent',
    markdown: `
保存条目：\`LIMS 酶合成执行 Pipeline v1.0\`

**Pipeline Input**

- 真实实验复盘资料：上一轮运行中确认的流程、返工边界、人工判断和效率观察。
- LIMS 工单记录：构建、表达、纯化、检测工单及其状态字段。
- ELN 和设备回调：实验记录本回调、仪器读数回调、回调时间和 schema 版本。
- QC 资料：构建 QC、纯化 QC、数据完整性 QC 的阈值、异常类型和通过/不通过路由。
- 审批输入：审批人、审批类型和资料包。
- 表记录输入：样本批次、库存记录、设备窗口、SOP 版本和工单模板。
- 负责人语言补充：资料缺失时由负责人确认的返工范围、隔离策略、结果释放边界和权限默认值。

**Pipeline Output**

- 运行输入包和输入摘要执行记录。
- 样本注册记录、条码批次和板图引用。
- 资源锁定记录和 SLA 计划。
- 工单包及构建、表达、纯化、检测执行记录。
- 设备、人员和 ELN 回调数据。
- 构建 QC、纯化 QC、数据完整性 QC 结论。
- 质检审批结果、结果释放审批结果和对应资料包。
- 结构化实验数据集和结果包。
- 异常样本清单、返工记录和隔离记录。
- 效率复盘摘要和下一轮流程建议边界。

**Pipeline Flow**

这条 Pipeline 先把负责人启动语句、真实复盘资料、LIMS 表记录和补充说明合并成运行输入包；输入包通过启动审批后，进入样本注册、资源准备和工单包生成。随后 Pipeline 派发构建、表达、纯化和检测相关工单，并把设备、人员和 ELN 回调写回节点输出。构建 QC 和纯化 QC 发现异常时，不默认重跑全流程，而是进入质检审批，根据审批结果返工受影响样本或隔离异常样本继续推进。数据入库前必须等待 ELN 回调、仪器读数和工单状态三方一致，并通过数据完整性检查。最后生成结果包，进入结果释放审批，并输出效率复盘。

最终 DAG 如下。后续可在 \`LIMS 流程运行\` 中直接调用这条 Pipeline 启动实验批次。
`.trim(),
    contentBlocks: [
      {
        type: 'pipelineDag',
        title: 'LIMS 酶合成执行 Pipeline DAG',
        version: 'v1.0',
        status: 'saved',
        summary: '已保存版本，包含输入确认、审批、工单、回调、QC gate、数据入库、结果释放和效率复盘。',
        dag: limsPipelineBuildDagV10,
      },
    ],
  },
]

export const pipelineBuildThreads: PipelineBuildThread[] = [
  {
    id: 'pipeline-build-lims-enzyme-synthesis',
    title: 'LIMS 酶合成执行编排',
    lastActivity: '刚刚',
    transcript: limsPipelineBuildTranscript,
    runInspector: limsPipelineBuildRunInspector,
  },
  {
    id: 'pipeline-build-enz-p0-flow',
    title: 'ENZ-P0 实验流程编排',
    lastActivity: '刚刚',
    transcript: pipelineBuildTranscript,
    runInspector: pipelineBuildRunInspector,
  },
]

export const enzP0AssayCharacterizationPipeline: MockCapabilityEntry = {
  id: 'pipeline-enz-p0-assay-characterization',
  kind: 'pipeline',
  name: 'ENZ-P0 Assay Characterization Pipeline',
  description:
    '固化 ENZ-P0 候选酶从样本接收、表达纯化 QC、酶活测定、稳定性面板到结果包归档的实验流程。',
  status: 'active',
  source: 'created',
  owner: 'Process Development Team',
  version: 'v1.0',
  tags: ['酶工程', '实验表征', '流程编排'],
  enabledForMainAgent: true,
  lastUsedAt: '刚刚',
  updatedAt: '2026-06-03',
  metrics: [
    { label: '步骤', value: '9' },
    { label: '确认点', value: '4' },
    { label: '版本', value: 'v1.0' },
  ],
  interface: {
    inputs: [
      '候选酶集合与样本批次元数据',
      '样本与板位映射、replicate 规则和样本条码',
      '表达纯化 QC 规则、酶活测定配置和对照设置',
      '稳定性面板定义、人工确认点和输出字段契约',
    ],
    outputs: [
      '样本执行结果、酶活结果和对照结果',
      'QC 状态表、稳定性结果和异常与复测决策',
      '候选酶结果摘要、Pipeline 版本记录和输出文件清单',
    ],
    permissions: ['实验范围、底物与反应体系、异常复核均需人工确认'],
  },
  sections: [
    {
      title: '访问控制',
      items: ['可在同类酶实验 Thread 中调用', '关键确认点不可自动跳过'],
    },
    {
      title: '使用情况',
      items: ['由 ENZ-P0 实验流程编排保存', '适用于候选酶表征流程复用'],
    },
  ],
  recentActivity: [
    '从 ENZ-P0 实验流程编排保存',
    '插入底物与反应体系人工确认点',
    '完成 DAG 依赖校验',
  ],
  steps: [
    '输入文件确认',
    '实验范围锁定',
    '样本接收与条码映射',
    '表达与纯化 QC',
    '底物与反应体系确认',
    '酶活测定',
    'pH / 温度 / 半衰期面板',
    '异常复核与复测判断',
    '结果包与版本记录',
  ],
  dag: pipelineBuildDagV02,
}
