export type CapabilityEntryKind = 'pipeline' | 'skill' | 'mcp-server' | 'plugin'

export type CapabilityStatus = 'active' | 'draft' | 'inactive' | 'needs-review'

export type CapabilitySource = 'preset' | 'created' | 'installed' | 'system'

export type ProviderConnectionStatus = 'connected' | 'needs-review' | 'inactive'

export type CapabilityMetric = {
  label: string
  value: string
}

export type CapabilityInterface = {
  inputs: string[]
  outputs: string[]
  permissions: string[]
}

export type CapabilitySection = {
  title: string
  items: string[]
}

export type PipelineDagNodeKind =
  | 'input'
  | 'operation'
  | 'human-gate'
  | 'qc-decision'
  | 'output'

export type PipelineDagNodeSubtype =
  | 'sample'
  | 'lab-operation'
  | 'transport'
  | 'cro-handoff'
  | 'report'
  | 'data'

export type PipelineDagNodeControl = {
  kind:
    | 'human-confirmation'
    | 'approval-gate'
    | 'preset-qc-check'
    | 'sop-threshold'
  summary: string
}

export type PipelineDagNodeResource = {
  kind:
    | 'device'
    | 'robot'
    | 'transport-vehicle'
    | 'island-bench'
    | 'sample-storage'
    | 'cro-order'
    | 'lab-system'
    | 'data-system'
  name: string
}

export type PipelineDagNode = {
  id: string
  kind: PipelineDagNodeKind
  subtype?: PipelineDagNodeSubtype
  title: string
  shortTitle: string
  resources?: PipelineDagNodeResource[]
  description: string
  inputs: string[]
  outputs: string[]
  prerequisites: string[]
  control?: PipelineDagNodeControl
  layout: { row: number; column: number }
}

export type PipelineDagEdge = { from: string; to: string; label?: string }

export type PipelineDag = { nodes: PipelineDagNode[]; edges: PipelineDagEdge[] }

export type MockCapabilityEntry = {
  id: string
  kind: CapabilityEntryKind
  name: string
  description: string
  status: CapabilityStatus
  source: CapabilitySource
  owner: string
  version: string
  tags: string[]
  enabledForMainAgent?: boolean
  connectionStatus?: ProviderConnectionStatus
  lastUsedAt?: string
  updatedAt: string
  metrics: CapabilityMetric[]
  interface: CapabilityInterface
  sections: CapabilitySection[]
  recentActivity: string[]
  steps?: string[]
  instructions?: string[]
  triggers?: string[]
  examples?: string[]
  tools?: string[]
  resources?: string[]
  dag?: PipelineDag
  presetLocked?: boolean
  placeholderState?: string
}

type PipelineDagTemplateNode = Omit<PipelineDagNode, 'id' | 'kind' | 'layout'>

type PipelineDagTemplate = {
  input: PipelineDagTemplateNode
  parameters: PipelineDagTemplateNode
  gate: PipelineDagTemplateNode
  cro: PipelineDagTemplateNode
  sample: PipelineDagTemplateNode
  execution: PipelineDagTemplateNode
  qc: PipelineDagTemplateNode
  output: PipelineDagTemplateNode
}

function createPipelineDag(template: PipelineDagTemplate): PipelineDag {
  return {
    nodes: [
      {
        id: 'candidate-confirmation',
        kind: 'input',
        layout: { row: 0, column: 0 },
        ...template.input,
      },
      {
        id: 'order-parameters',
        kind: 'operation',
        layout: { row: 1, column: 0 },
        ...template.parameters,
      },
      {
        id: 'human-gate-top3',
        kind: 'human-gate',
        layout: { row: 2, column: 0 },
        ...template.gate,
      },
      {
        id: 'cro-draft',
        kind: 'operation',
        layout: { row: 3, column: 0 },
        ...template.cro,
      },
      {
        id: 'sample-transport',
        kind: 'operation',
        layout: { row: 4, column: 0 },
        ...template.sample,
      },
      {
        id: 'device-run',
        kind: 'operation',
        layout: { row: 5, column: 0 },
        ...template.execution,
      },
      {
        id: 'qc-decision',
        kind: 'qc-decision',
        layout: { row: 6, column: 0 },
        ...template.qc,
      },
      {
        id: 'report-assets',
        kind: 'output',
        layout: { row: 7, column: 0 },
        ...template.output,
      },
    ],
    edges: [
      { from: 'candidate-confirmation', to: 'order-parameters', label: '输入' },
      { from: 'order-parameters', to: 'human-gate-top3', label: '待确认' },
      { from: 'human-gate-top3', to: 'cro-draft', label: '通过' },
      { from: 'cro-draft', to: 'sample-transport', label: '任务' },
      { from: 'sample-transport', to: 'device-run', label: '样本/数据' },
      { from: 'device-run', to: 'qc-decision', label: '原始数据' },
      { from: 'qc-decision', to: 'report-assets', label: 'QC 通过' },
      { from: 'order-parameters', to: 'device-run', label: '执行配置' },
      { from: 'cro-draft', to: 'report-assets', label: '追踪' },
    ],
  }
}

export const capabilityEntries: MockCapabilityEntry[] = [
  {
    id: 'pipeline-egfr-affinity',
    kind: 'pipeline',
    name: 'EGFR 抗体亲和力优化 Pipeline',
    description:
      '编排序列读取、结构评分、候选排序和湿实验订单草稿，用于 EGFR 抗体亲和力优化。',
    status: 'active',
    source: 'preset',
    owner: 'BioMap 研发平台',
    version: 'v2.3',
    tags: ['抗体', 'EGFR', '湿实验'],
    lastUsedAt: '18 小时前',
    updatedAt: '2026-05-29',
    metrics: [
      { label: '步骤', value: '7' },
      { label: '近期运行', value: '14' },
      { label: '审批点', value: '1' },
    ],
    interface: {
      inputs: ['靶点上下文', '候选序列', '实验约束'],
      outputs: ['候选排序', '实验订单草稿', '优化报告'],
      permissions: ['Top 候选需要人工确认', '实验订单提交需要审批'],
    },
    sections: [
      {
        title: '访问控制',
        items: ['可在活跃对话线程中自动调用', '实验订单提交必须经过审批'],
      },
      {
        title: '使用情况',
        items: ['最近用于 EGFR 抗体亲和力优化', '可用于抗体方向项目'],
      },
    ],
    recentActivity: [
      '在 EGFR 抗体亲和力优化中运行候选筛选',
      '更新湿实验订单模板映射',
    ],
    steps: [
      '读取上下文',
      '结构分析',
      '候选排序',
      '风险复核',
      '生成湿实验订单草稿',
      '人工确认',
      '生成报告',
    ],
    dag: {
      nodes: [
        {
          id: 'candidate-confirmation',
          kind: 'input',
          subtype: 'data',
          title: '候选确认',
          shortTitle: '候选确认',
          description: '汇总 EGFR 候选序列、结构评分和项目约束，确认进入湿实验设计的候选集合。',
          inputs: ['候选序列', '结构评分', '项目约束'],
          outputs: ['候选 Top 列表', '风险摘要'],
          prerequisites: ['候选排序已完成', '项目上下文可读取'],
          resources: [{ kind: 'data-system', name: 'Candidate Registry' }],
          layout: { row: 0, column: 0 },
        },
        {
          id: 'order-parameters',
          kind: 'operation',
          subtype: 'lab-operation',
          title: '湿实验订单参数',
          shortTitle: '订单参数',
          description: '把候选列表映射到 BLI、SEC-HPLC 和 DSF assay 参数，形成可复核的订单配置。',
          inputs: ['候选 Top 列表', 'assay 面板', '实验约束'],
          outputs: ['订单参数表', 'assay 配置'],
          prerequisites: ['候选确认已完成'],
          resources: [{ kind: 'lab-system', name: 'Wet Lab Order Console' }],
          layout: { row: 1, column: 0 },
        },
        {
          id: 'human-gate-top3',
          kind: 'human-gate',
          subtype: 'data',
          title: 'Human Gate: Top 3 候选确认',
          shortTitle: 'Human Gate',
          description: '负责人确认 Top 3 候选、排除高风险序列，并允许生成 CRO 订单草稿。',
          inputs: ['订单参数表', '风险摘要'],
          outputs: ['确认后的 Top 3 候选', '复核记录'],
          prerequisites: ['订单参数已生成', '候选风险摘要可查看'],
          control: {
            kind: 'human-confirmation',
            summary: '项目负责人确认 Top 3 候选和 assay 组合后继续执行。',
          },
          resources: [{ kind: 'lab-system', name: 'Approval Console' }],
          layout: { row: 2, column: 0 },
        },
        {
          id: 'cro-draft',
          kind: 'operation',
          subtype: 'cro-handoff',
          title: 'CRO 订单草稿',
          shortTitle: 'CRO 草稿',
          description: '根据已确认候选生成 CRO 订单草稿，保留提交前审批状态。',
          inputs: ['确认后的 Top 3 候选', 'assay 配置'],
          outputs: ['CRO 订单草稿', '提交包清单'],
          prerequisites: ['Human Gate 已通过'],
          resources: [{ kind: 'cro-order', name: 'CRO Connector' }],
          layout: { row: 3, column: 0 },
        },
        {
          id: 'sample-transport',
          kind: 'operation',
          subtype: 'transport',
          title: '样本准备 / 转运',
          shortTitle: '样本转运',
          description: '准备样本、登记保存条件，并安排样本在内部台架和 CRO 间转运。',
          inputs: ['CRO 订单草稿', '样本库存'],
          outputs: ['样本批次', '转运记录'],
          prerequisites: ['订单草稿已复核', '样本库存可用'],
          resources: [
            { kind: 'sample-storage', name: 'Sample Storage' },
            { kind: 'transport-vehicle', name: '冷链转运' },
          ],
          layout: { row: 4, column: 0 },
        },
        {
          id: 'device-run',
          kind: 'operation',
          subtype: 'lab-operation',
          title: '设备执行: BLI + SEC-HPLC + DSF',
          shortTitle: '设备执行',
          description: '在设备和岛式台架上执行 BLI、SEC-HPLC 与 DSF 测试，采集原始实验数据。',
          inputs: ['样本批次', 'assay 配置'],
          outputs: ['BLI 原始数据', 'SEC-HPLC 曲线', 'DSF 熔解曲线'],
          prerequisites: ['样本转运完成', '设备校准完成'],
          resources: [
            { kind: 'device', name: 'BLI Analyzer' },
            { kind: 'device', name: 'SEC-HPLC' },
            { kind: 'island-bench', name: 'DSF Bench' },
          ],
          layout: { row: 5, column: 0 },
        },
        {
          id: 'qc-decision',
          kind: 'qc-decision',
          subtype: 'data',
          title: 'QC Decision: 数据质量通过',
          shortTitle: 'QC Decision',
          description: '根据预设 QC 规则判断数据质量是否可进入结果回传和报告生成。',
          inputs: ['BLI 原始数据', 'SEC-HPLC 曲线', 'DSF 熔解曲线'],
          outputs: ['QC 判断', '可用数据包'],
          prerequisites: ['设备执行完成', '原始数据完整'],
          control: {
            kind: 'preset-qc-check',
            summary: '自动检查重复孔一致性、曲线拟合质量和 SOP 阈值。',
          },
          resources: [{ kind: 'data-system', name: 'QC Rule Engine' }],
          layout: { row: 6, column: 0 },
        },
        {
          id: 'report-assets',
          kind: 'output',
          subtype: 'report',
          title: '结果回传、报告与数据资产登记',
          shortTitle: '报告登记',
          description: '回传实验结果，生成优化报告，并把数据包登记为可追溯资产。',
          inputs: ['QC 判断', '可用数据包'],
          outputs: ['优化报告', '实验数据资产', '下一轮建议'],
          prerequisites: ['QC Decision 通过'],
          resources: [
            { kind: 'data-system', name: 'Asset Registry' },
            { kind: 'lab-system', name: 'Report Builder' },
          ],
          layout: { row: 7, column: 0 },
        },
      ],
      edges: [
        { from: 'candidate-confirmation', to: 'order-parameters', label: '候选' },
        { from: 'order-parameters', to: 'human-gate-top3', label: '待确认' },
        { from: 'human-gate-top3', to: 'cro-draft', label: '通过' },
        { from: 'cro-draft', to: 'sample-transport', label: '订单' },
        { from: 'sample-transport', to: 'device-run', label: '样本' },
        { from: 'device-run', to: 'qc-decision', label: '原始数据' },
        { from: 'qc-decision', to: 'report-assets', label: 'QC 通过' },
        { from: 'order-parameters', to: 'device-run', label: 'assay 配置' },
        { from: 'cro-draft', to: 'report-assets', label: '订单追踪' },
      ],
    },
  },
  {
    id: 'pipeline-protein-stability',
    kind: 'pipeline',
    name: '蛋白稳定性改造 Pipeline',
    description:
      '筛查残基层面的稳定性风险，并结合表达和聚集风险提出改造候选。',
    status: 'active',
    source: 'preset',
    owner: '蛋白设计团队',
    version: 'v1.8',
    tags: ['蛋白设计', '稳定性', '筛选'],
    lastUsedAt: '2 天前',
    updatedAt: '2026-05-22',
    metrics: [
      { label: '步骤', value: '6' },
      { label: '近期运行', value: '9' },
      { label: '输出', value: '4' },
    ],
    interface: {
      inputs: ['蛋白序列', '结构模型', '设计约束'],
      outputs: ['突变短名单', '稳定性报告', '表达风险表'],
      permissions: ['下游验证前需要人工确认'],
    },
    sections: [
      { title: '访问控制', items: ['只读分析可自动调用'] },
      { title: '使用情况', items: ['用于酶改造演示对话线程'] },
    ],
    recentActivity: ['新增聚集风险摘要模块'],
    steps: ['读取序列', '结构映射', '提出突变', '风险排序', '报告草稿', '复核'],
    dag: createPipelineDag({
      input: {
        subtype: 'data',
        title: '稳定性候选确认',
        shortTitle: '候选确认',
        description: '汇总蛋白序列、结构模型和设计约束，确认进入稳定性验证的突变候选。',
        inputs: ['蛋白序列', '结构模型', '设计约束'],
        outputs: ['待验证突变列表', '稳定性风险摘要'],
        prerequisites: ['结构模型可用', '设计目标已确认'],
        resources: [{ kind: 'data-system', name: 'Protein Design Workspace' }],
      },
      parameters: {
        subtype: 'lab-operation',
        title: '稳定性验证参数',
        shortTitle: '验证参数',
        description: '把突变候选映射到表达、DSF 和聚集风险验证参数。',
        inputs: ['待验证突变列表', '稳定性风险摘要'],
        outputs: ['验证参数表', 'assay 配置'],
        prerequisites: ['候选确认已完成'],
        resources: [{ kind: 'lab-system', name: 'Assay Planning Console' }],
      },
      gate: {
        subtype: 'data',
        title: 'Human Gate: 突变短名单确认',
        shortTitle: 'Human Gate',
        description: '负责人确认突变短名单、验证优先级和风险接受范围。',
        inputs: ['验证参数表', '稳定性风险摘要'],
        outputs: ['确认后的突变短名单', '复核记录'],
        prerequisites: ['验证参数已生成', '风险摘要可查看'],
        control: {
          kind: 'human-confirmation',
          summary: '蛋白设计负责人确认突变短名单后继续执行验证流程。',
        },
        resources: [{ kind: 'lab-system', name: 'Review Console' }],
      },
      cro: {
        subtype: 'cro-handoff',
        title: 'CRO 验证包草稿',
        shortTitle: 'CRO 草稿',
        description: '生成表达、DSF 和聚集风险验证的外部交接草稿。',
        inputs: ['确认后的突变短名单', 'assay 配置'],
        outputs: ['CRO 验证包草稿', '提交包清单'],
        prerequisites: ['Human Gate 已通过'],
        resources: [{ kind: 'cro-order', name: 'CRO Connector' }],
      },
      sample: {
        subtype: 'transport',
        title: '构建与样本准备',
        shortTitle: '样本准备',
        description: '准备构建、表达样本和转运记录，确保后续设备读数可追溯。',
        inputs: ['CRO 验证包草稿', '构建清单'],
        outputs: ['表达样本批次', '转运记录'],
        prerequisites: ['验证包已复核', '构建资源可用'],
        resources: [
          { kind: 'sample-storage', name: 'Protein Sample Storage' },
          { kind: 'transport-vehicle', name: '样本转运' },
        ],
      },
      execution: {
        subtype: 'lab-operation',
        title: '设备执行: 表达 + DSF + 聚集',
        shortTitle: '设备执行',
        description: '执行表达读数、DSF 熔解曲线和聚集风险检测。',
        inputs: ['表达样本批次', 'assay 配置'],
        outputs: ['表达读数', 'DSF 曲线', '聚集风险数据'],
        prerequisites: ['样本准备完成', '设备校准完成'],
        resources: [
          { kind: 'device', name: 'Plate Reader' },
          { kind: 'device', name: 'DSF Bench' },
          { kind: 'robot', name: 'Liquid Handler' },
        ],
      },
      qc: {
        subtype: 'data',
        title: 'QC Decision: 稳定性数据通过',
        shortTitle: 'QC Decision',
        description: '根据预设阈值检查表达、DSF 和聚集数据是否可进入报告。',
        inputs: ['表达读数', 'DSF 曲线', '聚集风险数据'],
        outputs: ['QC 判断', '可用稳定性数据包'],
        prerequisites: ['设备执行完成', '原始数据完整'],
        control: {
          kind: 'preset-qc-check',
          summary: '检查重复孔一致性、熔解曲线质量和聚集风险阈值。',
        },
        resources: [{ kind: 'data-system', name: 'QC Rule Engine' }],
      },
      output: {
        subtype: 'report',
        title: '稳定性报告与候选登记',
        shortTitle: '报告登记',
        description: '生成稳定性改造报告，并登记验证后的候选和数据包。',
        inputs: ['QC 判断', '可用稳定性数据包'],
        outputs: ['稳定性报告', '突变候选资产', '表达风险表'],
        prerequisites: ['QC Decision 通过'],
        resources: [
          { kind: 'data-system', name: 'Asset Registry' },
          { kind: 'lab-system', name: 'Report Builder' },
        ],
      },
    }),
  },
  {
    id: 'pipeline-wetlab-order',
    kind: 'pipeline',
    name: '湿实验验证订单 Pipeline',
    description:
      '把已选择分子和 assay 要求整理成可复核的实验订单草稿。',
    status: 'needs-review',
    source: 'created',
    owner: '实验运营',
    version: 'v0.9',
    tags: ['湿实验', '订单', '审批'],
    lastUsedAt: '4 天前',
    updatedAt: '2026-05-20',
    metrics: [
      { label: '步骤', value: '5' },
      { label: '审批点', value: '2' },
      { label: '草稿', value: '6' },
    ],
    interface: {
      inputs: ['候选分子', 'assay 面板', '交付时间'],
      outputs: ['实验订单草稿', '复核清单'],
      permissions: ['提交前必须审批'],
    },
    sections: [
      { title: '访问控制', items: ['权限复核完成前仅允许生成草稿'] },
      { title: '使用情况', items: ['用于抗体验证流程'] },
    ],
    recentActivity: ['已发起 CRO connector 权限复核'],
    steps: ['校验候选', '映射 assay', '生成订单草稿', '审批点', '提交包整理'],
    dag: createPipelineDag({
      input: {
        subtype: 'sample',
        title: '候选与 assay 确认',
        shortTitle: '候选确认',
        description: '校验候选分子、assay 面板和交付时间，确认订单输入完整。',
        inputs: ['候选分子', 'assay 面板', '交付时间'],
        outputs: ['候选清单', '订单约束摘要'],
        prerequisites: ['候选已选择', 'assay 目录可读取'],
        resources: [{ kind: 'lab-system', name: 'Assay Catalog' }],
      },
      parameters: {
        subtype: 'lab-operation',
        title: '订单参数校验',
        shortTitle: '参数校验',
        description: '把候选、样本量、检测条件和交付时间整理成可提交的订单参数。',
        inputs: ['候选清单', '订单约束摘要'],
        outputs: ['订单参数表', '复核清单'],
        prerequisites: ['候选与 assay 已确认'],
        resources: [{ kind: 'lab-system', name: 'Order Draft Console' }],
      },
      gate: {
        subtype: 'data',
        title: 'Human Gate: 提交前审批',
        shortTitle: 'Human Gate',
        description: '实验运营负责人审批订单参数、外部交接范围和提交风险。',
        inputs: ['订单参数表', '复核清单'],
        outputs: ['审批记录', '可提交订单草稿'],
        prerequisites: ['订单参数已校验', '复核清单已生成'],
        control: {
          kind: 'approval-gate',
          summary: '提交真实实验订单前必须完成正式 Approval Gate。',
        },
        resources: [{ kind: 'lab-system', name: 'Approval Console' }],
      },
      cro: {
        subtype: 'cro-handoff',
        title: 'CRO 订单草稿',
        shortTitle: 'CRO 草稿',
        description: '生成 CRO 订单草稿和外部交接包，保留待提交状态。',
        inputs: ['可提交订单草稿', '审批记录'],
        outputs: ['CRO 订单草稿', '外部交接包'],
        prerequisites: ['Approval Gate 已通过'],
        resources: [{ kind: 'cro-order', name: 'CRO Connector' }],
      },
      sample: {
        subtype: 'transport',
        title: '样本与物流安排',
        shortTitle: '样本物流',
        description: '安排样本批次、存储条件和交付路线，形成可执行物流记录。',
        inputs: ['CRO 订单草稿', '样本库存'],
        outputs: ['样本批次', '物流记录'],
        prerequisites: ['订单草稿已复核', '样本库存可用'],
        resources: [
          { kind: 'sample-storage', name: 'Sample Storage' },
          { kind: 'transport-vehicle', name: '冷链转运' },
        ],
      },
      execution: {
        subtype: 'lab-operation',
        title: '执行状态同步',
        shortTitle: '执行同步',
        description: '同步 CRO 或内部实验执行状态，跟踪关键设备、样本和交付节点。',
        inputs: ['样本批次', '外部交接包'],
        outputs: ['执行状态', '中间结果记录'],
        prerequisites: ['样本物流完成', 'CRO 订单已接收'],
        resources: [
          { kind: 'cro-order', name: 'CRO Order' },
          { kind: 'lab-system', name: 'Execution Tracker' },
        ],
      },
      qc: {
        subtype: 'data',
        title: 'QC Decision: 订单完整性通过',
        shortTitle: 'QC Decision',
        description: '检查订单、样本、执行状态和交付包是否满足提交与回传条件。',
        inputs: ['执行状态', '中间结果记录'],
        outputs: ['QC 判断', '可回传交付包'],
        prerequisites: ['执行状态完整', '交付包可读取'],
        control: {
          kind: 'sop-threshold',
          summary: '按 SOP 检查样本、订单字段、执行状态和交付包完整性。',
        },
        resources: [{ kind: 'data-system', name: 'Order QC Rules' }],
      },
      output: {
        subtype: 'report',
        title: '提交包与复核清单',
        shortTitle: '提交包',
        description: '整理订单提交包、复核清单和交付记录，供后续对话和资产登记引用。',
        inputs: ['QC 判断', '可回传交付包'],
        outputs: ['实验订单草稿', '复核清单', '交付记录'],
        prerequisites: ['QC Decision 通过'],
        resources: [
          { kind: 'data-system', name: 'Order Registry' },
          { kind: 'lab-system', name: 'Report Builder' },
        ],
      },
    }),
  },
  {
    id: 'pipeline-dataset-curation',
    kind: 'pipeline',
    name: 'AI-ready 数据集整理 Pipeline',
    description:
      '规范化实验表格、标注 assay 元数据，并生成可复用的 AI-ready 数据集。',
    status: 'active',
    source: 'installed',
    owner: '数据资产化团队',
    version: 'v1.4',
    tags: ['数据集', '资产化', '元数据'],
    lastUsedAt: '1 周前',
    updatedAt: '2026-05-18',
    metrics: [
      { label: '步骤', value: '6' },
      { label: '数据集', value: '11' },
      { label: '检查项', value: '8' },
    ],
    interface: {
      inputs: ['原始 assay 表格', '项目元数据', '标注规则'],
      outputs: ['AI-ready 数据集', '质量报告', 'Schema 摘要'],
      permissions: ['读取项目文件', '创建数据集资产'],
    },
    sections: [
      { title: '访问控制', items: ['确认后可创建数据集资产'] },
      { title: '使用情况', items: ['用于数据资产化项目'] },
    ],
    recentActivity: ['为 assay 面板导入生成 Schema 摘要'],
    steps: ['读取文件', '推断 Schema', '清洗数据', '标注元数据', '质量检查', '登记资产'],
    dag: createPipelineDag({
      input: {
        subtype: 'data',
        title: '原始数据确认',
        shortTitle: '数据确认',
        description: '读取原始 assay 表格、项目元数据和标注规则，确认数据整理范围。',
        inputs: ['原始 assay 表格', '项目元数据', '标注规则'],
        outputs: ['原始数据清单', '整理范围摘要'],
        prerequisites: ['项目文件可读取', '数据来源已确认'],
        resources: [{ kind: 'data-system', name: 'Project Files' }],
      },
      parameters: {
        subtype: 'data',
        title: 'Schema 与标注参数',
        shortTitle: 'Schema 参数',
        description: '推断数据 Schema，映射 assay 元数据和质量检查规则。',
        inputs: ['原始数据清单', '标注规则'],
        outputs: ['Schema 草稿', '标注参数表'],
        prerequisites: ['原始数据确认完成'],
        resources: [{ kind: 'data-system', name: 'Schema Library' }],
      },
      gate: {
        subtype: 'data',
        title: 'Human Gate: 标注规则确认',
        shortTitle: 'Human Gate',
        description: '数据资产负责人确认 Schema、标注规则和资产化范围。',
        inputs: ['Schema 草稿', '标注参数表'],
        outputs: ['确认后的 Schema', '复核记录'],
        prerequisites: ['Schema 草稿已生成', '质量规则可查看'],
        control: {
          kind: 'human-confirmation',
          summary: '数据资产负责人确认标注规则后继续生成 AI-ready 数据集。',
        },
        resources: [{ kind: 'data-system', name: 'Data Review Console' }],
      },
      cro: {
        subtype: 'data',
        title: '整理任务草稿',
        shortTitle: '任务草稿',
        description: '生成数据清洗、标注和登记任务草稿，保留可追踪执行状态。',
        inputs: ['确认后的 Schema', '复核记录'],
        outputs: ['整理任务草稿', '处理队列'],
        prerequisites: ['Human Gate 已通过'],
        resources: [{ kind: 'data-system', name: 'Dataset Pipeline Queue' }],
      },
      sample: {
        subtype: 'data',
        title: '数据清洗 / 标注',
        shortTitle: '清洗标注',
        description: '清洗实验表格、补齐元数据字段，并标注 assay 维度。',
        inputs: ['整理任务草稿', '原始数据清单'],
        outputs: ['清洗后数据表', '标注记录'],
        prerequisites: ['处理队列已创建', '原始表格可读取'],
        resources: [{ kind: 'data-system', name: 'Curation Worker' }],
      },
      execution: {
        subtype: 'data',
        title: 'Schema 生成与质量扫描',
        shortTitle: '质量扫描',
        description: '生成 AI-ready Schema，并扫描缺失值、单位、异常行和标注一致性。',
        inputs: ['清洗后数据表', '标注记录'],
        outputs: ['AI-ready Schema', '质量扫描结果'],
        prerequisites: ['数据清洗完成', '标注记录完整'],
        resources: [{ kind: 'data-system', name: 'Quality Scanner' }],
      },
      qc: {
        subtype: 'data',
        title: 'QC Decision: 数据集质量通过',
        shortTitle: 'QC Decision',
        description: '根据预设质量规则判断数据集是否可登记为可复用资产。',
        inputs: ['AI-ready Schema', '质量扫描结果'],
        outputs: ['QC 判断', '可登记数据集'],
        prerequisites: ['质量扫描完成', 'Schema 可读取'],
        control: {
          kind: 'preset-qc-check',
          summary: '检查缺失值比例、单位一致性、Schema 完整性和标注覆盖率。',
        },
        resources: [{ kind: 'data-system', name: 'Dataset QC Rules' }],
      },
      output: {
        subtype: 'data',
        title: 'AI-ready 数据集登记',
        shortTitle: '资产登记',
        description: '登记 AI-ready 数据集、质量报告和 Schema 摘要。',
        inputs: ['QC 判断', '可登记数据集'],
        outputs: ['AI-ready 数据集', '质量报告', 'Schema 摘要'],
        prerequisites: ['QC Decision 通过'],
        resources: [
          { kind: 'data-system', name: 'Dataset Registry' },
          { kind: 'data-system', name: 'Asset Registry' },
        ],
      },
    }),
  },
  {
    id: 'pipeline-candidate-triage',
    kind: 'pipeline',
    name: '分子候选筛选 Pipeline',
    description:
      '从预测活性、可生产性、新颖性和验证准备度等维度比较候选分子。',
    status: 'draft',
    source: 'created',
    owner: '发现策略团队',
    version: 'v0.4',
    tags: ['候选', '筛选', '排序'],
    updatedAt: '2026-05-24',
    metrics: [
      { label: '步骤', value: '4' },
      { label: '草稿检查', value: '5' },
      { label: '负责人', value: '2' },
    ],
    interface: {
      inputs: ['候选列表', '选择标准', '参考资产'],
      outputs: ['优先级短名单', '风险摘要'],
      permissions: ['推荐前需要人工确认'],
    },
    sections: [
      { title: '访问控制', items: ['草稿 Pipeline，暂不可自动调用'] },
      { title: '使用情况', items: ['暂无生产演示使用记录'] },
    ],
    recentActivity: ['根据发现团队笔记整理排序标准'],
    steps: ['读取标准', '匹配证据', '归一化评分', '生成短名单草稿'],
    dag: createPipelineDag({
      input: {
        subtype: 'data',
        title: '候选池确认',
        shortTitle: '候选池',
        description: '读取候选列表、选择标准和参考资产，确认进入筛选的候选池。',
        inputs: ['候选列表', '选择标准', '参考资产'],
        outputs: ['候选池', '筛选约束摘要'],
        prerequisites: ['候选列表已上传', '参考资产可读取'],
        resources: [{ kind: 'data-system', name: 'Candidate Registry' }],
      },
      parameters: {
        subtype: 'data',
        title: '筛选标准参数',
        shortTitle: '筛选参数',
        description: '把预测活性、可生产性、新颖性和验证准备度整理成筛选参数。',
        inputs: ['候选池', '选择标准'],
        outputs: ['筛选参数表', '证据需求清单'],
        prerequisites: ['候选池确认完成'],
        resources: [{ kind: 'data-system', name: 'Scoring Criteria Store' }],
      },
      gate: {
        subtype: 'data',
        title: 'Human Gate: 筛选标准确认',
        shortTitle: 'Human Gate',
        description: '发现策略负责人确认筛选标准、权重和必须保留的候选约束。',
        inputs: ['筛选参数表', '证据需求清单'],
        outputs: ['确认后的筛选标准', '复核记录'],
        prerequisites: ['筛选参数已生成', '证据需求可查看'],
        control: {
          kind: 'human-confirmation',
          summary: '发现策略负责人确认筛选标准后继续执行候选比较。',
        },
        resources: [{ kind: 'data-system', name: 'Strategy Review Console' }],
      },
      cro: {
        subtype: 'data',
        title: '筛选任务草稿',
        shortTitle: '任务草稿',
        description: '生成候选筛选任务草稿，锁定标准、输入资产和输出格式。',
        inputs: ['确认后的筛选标准', '候选池'],
        outputs: ['筛选任务草稿', '执行配置'],
        prerequisites: ['Human Gate 已通过'],
        resources: [{ kind: 'data-system', name: 'Triage Workflow Queue' }],
      },
      sample: {
        subtype: 'data',
        title: '证据汇总 / 数据拉取',
        shortTitle: '证据汇总',
        description: '拉取预测活性、可生产性、新颖性和验证准备度证据。',
        inputs: ['筛选任务草稿', '参考资产'],
        outputs: ['候选证据包', '缺口清单'],
        prerequisites: ['执行配置已生成', '参考资产可读取'],
        resources: [{ kind: 'data-system', name: 'Evidence Store' }],
      },
      execution: {
        subtype: 'data',
        title: '多维评分执行',
        shortTitle: '评分执行',
        description: '按固定标准执行归一化评分和候选比较，生成可复核短名单。',
        inputs: ['候选证据包', '确认后的筛选标准'],
        outputs: ['归一化评分表', '候选短名单草稿'],
        prerequisites: ['证据汇总完成', '评分标准已确认'],
        resources: [{ kind: 'data-system', name: 'Scoring Engine' }],
      },
      qc: {
        subtype: 'data',
        title: 'QC Decision: 证据完整性通过',
        shortTitle: 'QC Decision',
        description: '检查候选证据覆盖率、评分输入完整性和短名单输出一致性。',
        inputs: ['归一化评分表', '候选短名单草稿'],
        outputs: ['QC 判断', '可用短名单'],
        prerequisites: ['评分执行完成', '候选证据包完整'],
        control: {
          kind: 'preset-qc-check',
          summary: '检查候选证据覆盖率、关键字段缺失和评分标准一致性。',
        },
        resources: [{ kind: 'data-system', name: 'Triage QC Rules' }],
      },
      output: {
        subtype: 'report',
        title: '短名单与风险摘要',
        shortTitle: '短名单',
        description: '输出优先级短名单、风险摘要和后续验证建议。',
        inputs: ['QC 判断', '可用短名单'],
        outputs: ['优先级短名单', '风险摘要', '验证建议'],
        prerequisites: ['QC Decision 通过'],
        resources: [
          { kind: 'data-system', name: 'Candidate Registry' },
          { kind: 'lab-system', name: 'Report Builder' },
        ],
      },
    }),
  },
  {
    id: 'skill-protein-design',
    kind: 'skill',
    name: '蛋白设计操作 Skill',
    description:
      '指导主 Agent 处理蛋白设计任务，从约束读取到突变理由说明。',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skill 团队',
    version: 'v3.1',
    tags: ['蛋白设计', '预设'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '今天',
    updatedAt: '2026-05-30',
    metrics: [
      { label: '触发条件', value: '8' },
      { label: '示例', value: '6' },
      { label: '范围', value: '设计' },
    ],
    interface: {
      inputs: ['设计目标', '序列或结构上下文', '约束条件'],
      outputs: ['设计理由', '候选改动', '下一步计划'],
      permissions: ['仅提供指导，不直接执行命令'],
    },
    sections: [
      { title: '指令', items: ['提出突变前先澄清设计目标', '区分科学理由和执行步骤'] },
      { title: '使用情况', items: ['检测到蛋白设计意图时启用'] },
    ],
    recentActivity: ['在蛋白稳定性改造演示中加载'],
    instructions: [
      '提出设计前先询问靶点、序列上下文和硬约束。',
      '解释突变理由时同时覆盖结构、表达和 assay 取舍。',
    ],
    triggers: ['蛋白改造', '突变建议', '稳定性优化'],
    examples: ['设计更稳妥的 EGFR 候选短名单', '解释某个突变为什么提升热稳定性'],
  },
  {
    id: 'skill-wetlab',
    kind: 'skill',
    name: '湿实验操作 Skill',
    description:
      '帮助主 Agent 起草验证计划、assay 请求和实验交接说明。',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skill 团队',
    version: 'v2.7',
    tags: ['湿实验', '预设'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '18 小时前',
    updatedAt: '2026-05-28',
    metrics: [
      { label: '触发条件', value: '7' },
      { label: '示例', value: '5' },
      { label: '范围', value: '实验' },
    ],
    interface: {
      inputs: ['候选分子', 'assay 目的', '时间计划'],
      outputs: ['实验计划', '订单草稿文案', '复核清单'],
      permissions: ['真实提交前必须审批'],
    },
    sections: [
      { title: '指令', items: ['区分订单草稿和已提交订单', '高影响操作前明确审批点'] },
      { title: '使用情况', items: ['用于 EGFR 湿实验订单草稿'] },
    ],
    recentActivity: ['准备 EGFR 验证订单文案'],
    instructions: ['订单只能作为待复核草稿，不得直接视为已提交。', '明确样本制备和测量假设。'],
    triggers: ['验证计划', '实验订单', '湿实验交接'],
    examples: ['起草 BLI 验证计划', '准备 CRO 交接说明'],
  },
  {
    id: 'skill-experiment-data',
    kind: 'skill',
    name: '实验数据分析 Skill',
    description:
      '支持 assay 表格解读、异常值复核和结果摘要起草。',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skill 团队',
    version: 'v2.2',
    tags: ['分析', 'assay'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '3 天前',
    updatedAt: '2026-05-25',
    metrics: [
      { label: '触发条件', value: '9' },
      { label: '示例', value: '4' },
      { label: '范围', value: '数据' },
    ],
    interface: {
      inputs: ['assay 表格', '对照组', '分析问题'],
      outputs: ['结果解读', '异常值说明', '图表摘要说明'],
      permissions: ['读取项目文件'],
    },
    sections: [
      { title: '指令', items: ['区分观测数据和推断解读', '标出缺失的对照组'] },
      { title: '使用情况', items: ['用于 assay 结果摘要对话线程'] },
    ],
    recentActivity: ['总结 BLI 亲和力表格'],
    instructions: ['总结前检查对照组和单位。', '回答中明确不确定性。'],
    triggers: ['分析 assay', '解读结果', '总结表格'],
    examples: ['总结 SEC-HPLC 纯度结果', '识别 BLI sensorgram 异常值'],
  },
  {
    id: 'skill-report',
    kind: 'skill',
    name: '研发报告撰写 Skill',
    description:
      '为候选决策、实验结果和项目交付更新提供报告结构指导。',
    status: 'active',
    source: 'preset',
    owner: 'BioMap Skill 团队',
    version: 'v1.9',
    tags: ['报告', '预设'],
    enabledForMainAgent: true,
    presetLocked: true,
    lastUsedAt: '5 天前',
    updatedAt: '2026-05-21',
    metrics: [
      { label: '模板', value: '4' },
      { label: '示例', value: '5' },
      { label: '范围', value: '报告' },
    ],
    interface: {
      inputs: ['决策背景', '证据块', '受众'],
      outputs: ['结构化报告', '执行摘要', '证据附录'],
      permissions: ['读取对话证据'],
    },
    sections: [
      { title: '指令', items: ['先给出决策背景', '把结论绑定到可见证据'] },
      { title: '使用情况', items: ['用于候选报告起草'] },
    ],
    recentActivity: ['为 EGFR 优化生成报告骨架'],
    instructions: ['结论和下一步分开写。', '科学判断使用有证据支撑的要点。'],
    triggers: ['准备报告', '总结项目', '写交付更新'],
    examples: ['创建 EGFR 优化报告大纲', '为管理层总结实验结果'],
  },
  {
    id: 'skill-egfr-review',
    kind: 'skill',
    name: 'EGFR 候选复核清单 Skill',
    description:
      '用于湿实验验证前复核 EGFR 抗体候选的准备度。',
    status: 'active',
    source: 'created',
    owner: 'zhengjun',
    version: 'v0.6',
    tags: ['EGFR', '清单'],
    enabledForMainAgent: true,
    lastUsedAt: '昨天',
    updatedAt: '2026-05-30',
    metrics: [
      { label: '清单项', value: '12' },
      { label: '示例', value: '3' },
      { label: '范围', value: '复核' },
    ],
    interface: {
      inputs: ['候选表格', '项目约束'],
      outputs: ['复核清单', '风险说明'],
      permissions: ['仅提供指导'],
    },
    sections: [
      { title: '指令', items: ['检查亲和力、表达、稳定性和 assay 可行性'] },
      { title: '使用情况', items: ['为 EGFR 优化演示创建'] },
    ],
    recentActivity: ['新增表达风险检查点'],
    instructions: ['围绕亲和力、表达和验证准备度复核 Top 候选。'],
    triggers: ['EGFR 候选复核', 'Top 候选清单'],
    examples: ['验证前复核 EGFR-AF-01'],
  },
  {
    id: 'skill-cro-handoff',
    kind: 'skill',
    name: 'CRO 交接格式化 Skill',
    description:
      '已安装的格式化 Skill，用于生成简洁的 CRO 实验交接说明。',
    status: 'active',
    source: 'installed',
    owner: '实验运营',
    version: 'v1.1',
    tags: ['CRO', '交接'],
    enabledForMainAgent: false,
    updatedAt: '2026-05-19',
    metrics: [
      { label: '格式', value: '3' },
      { label: '示例', value: '4' },
      { label: '范围', value: '运营' },
    ],
    interface: {
      inputs: ['实验草稿', '接收方上下文'],
      outputs: ['CRO 交接说明'],
      permissions: ['外部分享需要复核'],
    },
    sections: [
      { title: '指令', items: ['使用简洁的运营语言', '标记外部分享复核'] },
      { title: '使用情况', items: ['为运营演示安装'] },
    ],
    recentActivity: ['因文案复核暂未对主 Agent 启用'],
    instructions: ['把实验计划整理成面向 CRO 的清晰假设和交付说明。'],
    triggers: ['CRO 交接', '外部实验说明'],
    examples: ['把 BLI assay 请求整理成 CRO 可读版本'],
  },
  {
    id: 'mcp-structure-tools',
    kind: 'mcp-server',
    name: 'BioMap 结构工具 MCP',
    description:
      '已连接的结构评分、表面着色和突变图资源提供方。',
    status: 'active',
    source: 'system',
    connectionStatus: 'connected',
    owner: '平台集成团队',
    version: 'v1.6',
    tags: ['结构', 'MCP'],
    lastUsedAt: '18 小时前',
    updatedAt: '2026-05-27',
    metrics: [
      { label: '工具', value: '8' },
      { label: '资源', value: '5' },
      { label: '模式', value: '只读' },
    ],
    interface: {
      inputs: ['结构 id', '突变列表', '评分请求'],
      outputs: ['结构评分', '表面图', 'Artifact 引用'],
      permissions: ['只读提供方', '不向外部传输'],
    },
    sections: [
      { title: '访问控制', items: ['只读结构工具', '可在活跃对话线程中自动调用'] },
      { title: '使用情况', items: ['支持 EGFR 结构分析回放'] },
    ],
    recentActivity: ['为 EGFR 回放返回 structure_scores.json'],
    tools: ['structure.analyze', 'structure.colorSurface', 'mutation.map', 'stability.score'],
    resources: ['project-structures', 'mutation-libraries', 'surface-coloring-presets'],
  },
  {
    id: 'mcp-experiment-order',
    kind: 'mcp-server',
    name: '实验订单系统 MCP',
    description:
      '用于起草实验订单并检查审批准备度的提供方。',
    status: 'needs-review',
    source: 'installed',
    connectionStatus: 'needs-review',
    owner: '实验运营',
    version: 'v0.8',
    tags: ['订单', 'MCP', '审批'],
    updatedAt: '2026-05-24',
    metrics: [
      { label: '工具', value: '5' },
      { label: '资源', value: '2' },
      { label: '模式', value: '仅草稿' },
    ],
    interface: {
      inputs: ['订单草稿载荷', '项目上下文'],
      outputs: ['草稿 id', '审批清单'],
      permissions: ['复核完成前仅允许草稿'],
    },
    sections: [
      { title: '访问控制', items: ['演示中禁用提交', '真实订单必须审批'] },
      { title: '使用情况', items: ['供湿实验验证订单 Pipeline 使用'] },
    ],
    recentActivity: ['已发起权限复核'],
    tools: ['order.createDraft', 'order.validate', 'approval.preview'],
    resources: ['assay-catalog', 'order-templates'],
  },
  {
    id: 'mcp-dataset-registry',
    kind: 'mcp-server',
    name: '数据集注册表 MCP',
    description:
      '用于发现和登记 AI-ready 数据集资产的已连接提供方。',
    status: 'active',
    source: 'system',
    connectionStatus: 'connected',
    owner: '数据平台',
    version: 'v2.0',
    tags: ['数据集', 'MCP'],
    lastUsedAt: '1 周前',
    updatedAt: '2026-05-17',
    metrics: [
      { label: '工具', value: '6' },
      { label: '资源', value: '7' },
      { label: '模式', value: '创建资产' },
    ],
    interface: {
      inputs: ['数据集 Schema', '元数据标签'],
      outputs: ['已登记资产 id', '质量报告'],
      permissions: ['确认后可创建数据集资产'],
    },
    sections: [
      { title: '访问控制', items: ['确认后可登记数据集资产'] },
      { title: '使用情况', items: ['支持 AI-ready 数据集整理 Pipeline'] },
    ],
    recentActivity: ['登记 assay 数据集演示资产'],
    tools: ['dataset.search', 'dataset.register', 'schema.validate'],
    resources: ['registered-datasets', 'schema-library', 'quality-rules'],
  },
  {
    id: 'mcp-literature',
    kind: 'mcp-server',
    name: '文献检索网关 MCP',
    description:
      '已安装的提供方，用于受限文献检索和引用摘要交接。',
    status: 'inactive',
    source: 'installed',
    connectionStatus: 'inactive',
    owner: '知识系统团队',
    version: 'v0.5',
    tags: ['文献', 'MCP'],
    updatedAt: '2026-05-12',
    metrics: [
      { label: '工具', value: '3' },
      { label: '资源', value: '1' },
      { label: '模式', value: '已禁用' },
    ],
    interface: {
      inputs: ['研究问题', '范围约束'],
      outputs: ['引用短名单', '证据摘要'],
      permissions: ['演示中禁用外部检索'],
    },
    sections: [
      { title: '访问控制', items: ['未启用提供方', '使用前需要复核'] },
      { title: '使用情况', items: ['暂无近期演示使用记录'] },
    ],
    recentActivity: ['演示加固期间已禁用'],
    tools: ['literature.search', 'citation.extract', 'evidence.summarize'],
    resources: ['literature-cache'],
  },
  {
    id: 'plugin-sequence-viewer',
    kind: 'plugin',
    name: '序列查看器 Plugin',
    description:
      '用于查看序列比对和蛋白区域标注的预览扩展点。',
    status: 'inactive',
    source: 'system',
    owner: 'BioMap 扩展团队',
    version: '预览',
    tags: ['plugin', '序列'],
    updatedAt: '2026-05-10',
    metrics: [
      { label: '状态', value: '预览' },
      { label: '动作', value: '申请' },
      { label: '安装', value: '待开放' },
    ],
    interface: {
      inputs: ['序列集合', '标注轨道'],
      outputs: ['查看器面板', '区域说明'],
      permissions: ['仅占位'],
    },
    sections: [
      { title: '访问控制', items: ['即将开放的占位内容', '演示中不执行真实安装'] },
      { title: '使用情况', items: ['预留给序列密集型流程'] },
    ],
    recentActivity: ['已加入 Capabilities 演示作为预览占位'],
    placeholderState: '即将开放',
  },
  {
    id: 'plugin-molecule-viz',
    kind: 'plugin',
    name: '分子可视化 Plugin',
    description:
      '用于更丰富分子可视化和对比界面的预览 Plugin。',
    status: 'inactive',
    source: 'system',
    owner: 'BioMap 扩展团队',
    version: '预览',
    tags: ['plugin', '可视化'],
    updatedAt: '2026-05-10',
    metrics: [
      { label: '状态', value: '预览' },
      { label: '动作', value: '申请' },
      { label: '安装', value: '待开放' },
    ],
    interface: {
      inputs: ['分子 id', '可视化模式'],
      outputs: ['交互视图占位'],
      permissions: ['仅占位'],
    },
    sections: [
      { title: '访问控制', items: ['即将开放的占位内容', '演示中不执行真实安装'] },
      { title: '使用情况', items: ['预留给分子对比流程'] },
    ],
    recentActivity: ['已加入 Capabilities 演示作为预览占位'],
    placeholderState: '即将开放',
  },
  {
    id: 'plugin-cro-connector',
    kind: 'plugin',
    name: '外部 CRO Connector Plugin',
    description:
      '用于未来 CRO 交付包交换和状态更新的预览扩展。',
    status: 'needs-review',
    source: 'installed',
    owner: '实验运营',
    version: '预览',
    tags: ['plugin', 'CRO'],
    updatedAt: '2026-05-13',
    metrics: [
      { label: '状态', value: '预览' },
      { label: '复核', value: '需要' },
      { label: '安装', value: '待开放' },
    ],
    interface: {
      inputs: ['实验交付包', '接收方元数据'],
      outputs: ['Connector 交接占位'],
      permissions: ['外部分享需要复核'],
    },
    sections: [
      { title: '访问控制', items: ['仅预览', '演示中禁用外部分享'] },
      { title: '使用情况', items: ['预留给 CRO 交接流程'] },
    ],
    recentActivity: ['已标记为未来 connector 复核项'],
    placeholderState: '预览',
  },
]

export const capabilityTypeLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Pipeline',
  skill: 'Skill',
  'mcp-server': 'MCP Server',
  plugin: 'Plugin',
}

export const capabilityTypeDescriptions: Record<CapabilityEntryKind, string> = {
  pipeline:
    '管理主 Agent 可在研发任务中运行或按需改造的生物学 Pipeline。',
  skill:
    '管理可复用的 Skill，包括 BioMap 预设、自建和已安装 Skill。',
  'mcp-server':
    '查看已连接 MCP Server、暴露工具、资源和权限边界。',
  plugin:
    '管理额外 Plugin 扩展。演示中先展示预览占位条目。',
}

export const capabilityTypeOrder: CapabilityEntryKind[] = [
  'pipeline',
  'skill',
  'mcp-server',
  'plugin',
]
