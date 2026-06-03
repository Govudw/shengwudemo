import type { PipelineDag, PipelineDagNode } from './mockCapabilities'

const inputNode: PipelineDagNode = {
  id: 'input-files-confirmation',
  kind: 'input',
  subtype: 'data',
  title: '输入文件确认',
  shortTitle: '输入文件',
  description:
    '读取候选酶变体表、实验 SOP、底物批次 QC 和项目约束，形成 Pipeline 的输入契约。',
  inputs: ['ENZ-P0_candidate_variants.xlsx', 'Enzyme_Assay_SOP_v3.md'],
  outputs: ['输入文件清单', '字段映射摘要'],
  prerequisites: ['Project Files 已上传', '项目约束可读取'],
  resources: [{ kind: 'data-system', name: 'Project Files' }],
  layout: { row: 0, column: 0 },
}

const scopeNode: PipelineDagNode = {
  id: 'experiment-scope-lock',
  kind: 'human-gate',
  subtype: 'data',
  title: '实验范围锁定',
  shortTitle: '范围锁定',
  description:
    '确认本 Pipeline 覆盖表达与纯化 QC、酶活、pH/温度、半衰期和结果包归档。',
  inputs: ['输入文件清单', '实验范围建议'],
  outputs: ['确认后的实验范围'],
  prerequisites: ['输入文件确认完成'],
  control: {
    kind: 'human-confirmation',
    summary: '流程负责人确认实验范围后，Pipeline 才能生成后续执行拓扑。',
  },
  resources: [{ kind: 'lab-system', name: 'Pipeline Builder' }],
  layout: { row: 1, column: 0 },
}

const barcodeNode: PipelineDagNode = {
  id: 'sample-barcode-map',
  kind: 'operation',
  subtype: 'sample',
  title: '样本接收与条码映射',
  shortTitle: '条码映射',
  description:
    '把 ENZ-P0 候选酶变体和板位条码绑定，生成后续 QC 与 assay 可追溯的样本映射。',
  inputs: ['确认后的实验范围', '候选酶变体表'],
  outputs: ['样本条码映射表', '板位布局'],
  prerequisites: ['实验范围已确认'],
  resources: [
    { kind: 'sample-storage', name: 'Sample Registry' },
    { kind: 'lab-system', name: 'Plate Mapping Console' },
  ],
  layout: { row: 2, column: 0 },
}

const expressionQcNode: PipelineDagNode = {
  id: 'expression-purification-qc',
  kind: 'qc-decision',
  subtype: 'lab-operation',
  title: '表达与纯化 QC',
  shortTitle: '表达纯化 QC',
  description:
    '检查表达量、纯化收率和基础纯度是否满足进入活性测定的预设阈值。',
  inputs: ['样本条码映射表', '表达与纯化记录'],
  outputs: ['QC 状态表', '可进入 assay 的样本列表'],
  prerequisites: ['样本条码映射完成', '表达与纯化记录已返回'],
  control: {
    kind: 'preset-qc-check',
    summary: '未通过表达或纯化 QC 的样本进入异常复核，不自动进入活性测定。',
  },
  resources: [
    { kind: 'device', name: 'Microplate Reader' },
    { kind: 'lab-system', name: 'QC Ruleset ENZ-SOP-v3' },
  ],
  layout: { row: 3, column: 0 },
}

const substrateGateNode: PipelineDagNode = {
  id: 'substrate-reaction-system-gate',
  kind: 'human-gate',
  subtype: 'lab-operation',
  title: '底物与反应体系确认',
  shortTitle: '体系确认',
  description:
    '在活性测定前确认底物批次、反应体系、阳性对照和阴性对照是否符合 SOP v3。',
  inputs: ['QC 状态表', 'Substrate_Lot_QC_202606.xlsx', 'Enzyme_Assay_SOP_v3.md'],
  outputs: ['确认后的反应体系', '对照设置记录'],
  prerequisites: ['表达与纯化 QC 已完成'],
  control: {
    kind: 'human-confirmation',
    summary: '底物批次、缓冲液、温度、反应时间和对照设置必须由实验负责人确认。',
  },
  resources: [{ kind: 'lab-system', name: 'Assay Setup Console' }],
  layout: { row: 4, column: 0 },
}

const activityAssayNode: PipelineDagNode = {
  id: 'enzyme-activity-assay',
  kind: 'operation',
  subtype: 'lab-operation',
  title: '酶活测定',
  shortTitle: '酶活测定',
  description:
    '按确认后的反应体系执行候选酶活性测定，并输出标准化原始读数和对照结果。',
  inputs: ['可进入 assay 的样本列表', '确认后的反应体系'],
  outputs: ['酶活原始读数', '对照结果表'],
  prerequisites: ['反应体系已确认'],
  resources: [
    { kind: 'device', name: 'Kinetic Plate Reader' },
    { kind: 'robot', name: 'Liquid Handler' },
  ],
  layout: { row: 5, column: 0 },
}

const stabilityPanelNode: PipelineDagNode = {
  id: 'ph-temperature-half-life-panel',
  kind: 'operation',
  subtype: 'lab-operation',
  title: 'pH / 温度 / 半衰期面板',
  shortTitle: '稳定性面板',
  description:
    '对进入测定的候选酶执行 pH 窗口、温度窗口和半衰期面板，沉淀工业使用条件证据。',
  inputs: ['酶活原始读数', '样本条码映射表'],
  outputs: ['pH/温度曲线', '半衰期结果表'],
  prerequisites: ['酶活测定完成'],
  resources: [
    { kind: 'device', name: 'Thermal Incubator' },
    { kind: 'device', name: 'pH Gradient Assay Bench' },
  ],
  layout: { row: 6, column: 0 },
}

const anomalyReviewNode: PipelineDagNode = {
  id: 'anomaly-retest-review',
  kind: 'human-gate',
  subtype: 'data',
  title: '异常复核与复测判断',
  shortTitle: '异常复核',
  description:
    '对 QC 异常、对照异常或曲线异常的样本进行人工复核，决定是否复测或标记排除。',
  inputs: ['QC 状态表', '对照结果表', 'pH/温度曲线'],
  outputs: ['复测清单', '排除记录'],
  prerequisites: ['稳定性面板完成', '异常规则已运行'],
  control: {
    kind: 'human-confirmation',
    summary: '异常样本是否复测由实验负责人确认，不由 Main Agent 自动决定。',
  },
  resources: [{ kind: 'data-system', name: 'QC Review Console' }],
  layout: { row: 7, column: 0 },
}

const outputNode: PipelineDagNode = {
  id: 'result-package-version-record',
  kind: 'output',
  subtype: 'report',
  title: '结果包与版本记录',
  shortTitle: '结果包',
  description:
    '生成标准化结果包、QC 状态表和 Pipeline 版本记录，供后续复用和追溯。',
  inputs: ['酶活原始读数', '半衰期结果表', '复测清单'],
  outputs: ['结果包', 'QC 状态表', 'Pipeline 版本记录'],
  prerequisites: ['异常复核完成'],
  resources: [{ kind: 'data-system', name: 'Pipeline Registry' }],
  layout: { row: 8, column: 0 },
}

export const pipelineBuildDagV01: PipelineDag = {
  nodes: [
    inputNode,
    scopeNode,
    barcodeNode,
    expressionQcNode,
    { ...activityAssayNode, layout: { row: 4, column: 0 } },
    { ...stabilityPanelNode, layout: { row: 5, column: 0 } },
    { ...anomalyReviewNode, layout: { row: 6, column: 0 } },
    { ...outputNode, layout: { row: 7, column: 0 } },
  ],
  edges: [
    { from: 'input-files-confirmation', to: 'experiment-scope-lock', label: '输入确认' },
    { from: 'experiment-scope-lock', to: 'sample-barcode-map', label: '范围确认' },
    { from: 'sample-barcode-map', to: 'expression-purification-qc', label: '样本映射' },
    { from: 'expression-purification-qc', to: 'enzyme-activity-assay', label: 'QC 通过' },
    { from: 'enzyme-activity-assay', to: 'ph-temperature-half-life-panel', label: '读数' },
    { from: 'ph-temperature-half-life-panel', to: 'anomaly-retest-review', label: '面板结果' },
    { from: 'anomaly-retest-review', to: 'result-package-version-record', label: '确认' },
    { from: 'expression-purification-qc', to: 'anomaly-retest-review', label: 'QC 异常' },
  ],
}

export const pipelineBuildDagV02: PipelineDag = {
  nodes: [
    inputNode,
    scopeNode,
    barcodeNode,
    expressionQcNode,
    substrateGateNode,
    activityAssayNode,
    stabilityPanelNode,
    anomalyReviewNode,
    outputNode,
  ],
  edges: [
    { from: 'input-files-confirmation', to: 'experiment-scope-lock', label: '输入确认' },
    { from: 'experiment-scope-lock', to: 'sample-barcode-map', label: '范围确认' },
    { from: 'sample-barcode-map', to: 'expression-purification-qc', label: '样本映射' },
    {
      from: 'expression-purification-qc',
      to: 'substrate-reaction-system-gate',
      label: 'QC 通过',
    },
    {
      from: 'substrate-reaction-system-gate',
      to: 'enzyme-activity-assay',
      label: '体系确认',
    },
    { from: 'enzyme-activity-assay', to: 'ph-temperature-half-life-panel', label: '读数' },
    { from: 'ph-temperature-half-life-panel', to: 'anomaly-retest-review', label: '面板结果' },
    { from: 'anomaly-retest-review', to: 'result-package-version-record', label: '确认' },
    { from: 'expression-purification-qc', to: 'anomaly-retest-review', label: 'QC 异常' },
  ],
}
