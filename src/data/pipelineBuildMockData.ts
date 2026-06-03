import type {
  CapabilityRunReplayBlock,
  ConversationTurn,
  RunInspectorCapabilityRunItem,
  RunInspectorData,
} from './conversationTypes'
import type { MockCapabilityEntry } from './mockCapabilities'
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
    requiredConfirmations: 4,
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
    id: 'pipeline-build-turn-006',
    role: 'mainAgent',
    markdown:
      '我已读取这三个入口文件。第三件事只确认 QC 处理方式。\n\n**推荐 A：** 表达与纯化 QC 用固定阈值自动分流；未通过样本进入异常复核，不进入活性测定。\n\nB：所有样本都进入活性测定，QC 只在报告里标注。\n\nC：表达与纯化 QC 每次由负责人手动判断。\n\n我建议选 A，因为它能减少无效测定，同时把异常样本交给人工复核。',
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
    markdown:
      '已保存到 Pipelines，来源为自建，版本 v1.0。\n\n保存条目：`ENZ-P0 Assay Characterization Pipeline v1.0`\n\n后续在 ENZ-P0 或同类候选酶实验 Thread 中，可以直接调用这条 Pipeline，并在执行前重新确认输入文件、底物批次和反应体系。',
    contentBlocks: [saveRun],
  },
]

export const pipelineBuildThreads: PipelineBuildThread[] = [
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
    inputs: ['候选酶变体表', '实验 SOP', '底物批次 QC 表'],
    outputs: ['标准化结果包', 'QC 状态表', 'Pipeline 版本记录'],
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
