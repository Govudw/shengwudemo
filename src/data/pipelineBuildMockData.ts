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
