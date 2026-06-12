import type { ConversationBlock, ConversationTurn, RunInspectorData } from './conversationTypes'
import targetxCandidateClusterMap from '../assets/mock-science/targetx/targetx-candidate-cluster-map.png'
import targetxTopCandidateEvidence from '../assets/mock-science/targetx/targetx-top-candidate-evidence.png'
import type { Thread } from './mockData'

const targetXDiscoveryEvidenceColumns = [
  { key: 'epitope', label: 'Epitope' },
  { key: 'bindingProxy', label: 'Binding proxy' },
  { key: 'blockingFit', label: 'Blocking fit' },
  { key: 'humanLikeness', label: 'Human-likeness' },
  { key: 'aggregation', label: 'Aggregation risk' },
  { key: 'recommendation', label: 'Recommendation' },
]

const targetXModelEvidenceColumns = [
  { key: 'r1Readout', label: 'R1 readout' },
  { key: 'labelQuality', label: 'Label quality' },
  { key: 'modelUse', label: 'Model use' },
  { key: 'r2Action', label: 'R2 action' },
]

function turn(
  threadPrefix: string,
  index: number,
  role: ConversationTurn['role'],
  markdown: string,
  contentBlocks?: ConversationBlock[],
): ConversationTurn {
  return {
    id: `${threadPrefix}-turn-${String(index).padStart(3, '0')}`,
    role,
    markdown,
    contentBlocks,
  }
}

function projectFile(
  fileName: string,
  fileKind: Extract<ConversationBlock, { type: 'projectFile' }>['fileKind'],
  location: string,
  note: string,
): Extract<ConversationBlock, { type: 'projectFile' }> {
  return {
    type: 'projectFile',
    fileName,
    fileKind,
    location,
    note,
  }
}

function capabilityRun(
  commandName: string,
  summary: string,
  input: Record<string, string | string[] | number | boolean>,
  output: Record<string, string | string[] | number | boolean>,
  artifacts: Extract<ConversationBlock, { type: 'capabilityRunReplay' }>['artifacts'],
  duration = '18.6s',
): Extract<ConversationBlock, { type: 'capabilityRunReplay' }> {
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

function confirmation(
  title: string,
  decision: string,
  confirmedAt: string,
): Extract<ConversationBlock, { type: 'humanConfirmation' }> {
  return {
    type: 'humanConfirmation',
    title,
    confirmedBy: 'Project Owner',
    confirmedAt,
    decision,
  }
}

function approvalGate(
  title: string,
  approvalType: string,
  decision: string,
  checklist: string[],
): Extract<ConversationBlock, { type: 'approvalGateCard' }> {
  return {
    type: 'approvalGateCard',
    title,
    approvalType,
    status: 'approved',
    approver: 'Project Owner',
    decidedAt: '2026-06-06 15:40',
    approvalAdvice: '批准进入下一阶段，保留风险标签和人工复核点。',
    details: [
      { label: 'Target', value: 'Target-X' },
      { label: 'Round', value: 'R1' },
      { label: 'Audit mode', value: 'Human-in-the-loop' },
    ],
    checklist,
    riskSummary: '高相似度、聚集和非特异性结合风险已标注，不允许自动扩展范围。',
    decision,
  }
}

function dataChart(
  title: string,
  series: Extract<ConversationBlock, { type: 'dataChart' }>['series'],
): Extract<ConversationBlock, { type: 'dataChart' }> {
  return {
    type: 'dataChart',
    title,
    chartType: 'bar',
    xLabel: 'Group',
    yLabel: 'Score',
    series,
  }
}

function scientificFigure(
  figureId: string,
  title: string,
  description: string,
  src?: string,
): Extract<ConversationBlock, { type: 'scientificFigure' }> {
  return {
    type: 'scientificFigure',
    figureId,
    title,
    description,
    imagegenPrompt:
      'Clean scientific biomedical figure for antibody discovery, Target-X extracellular domain, epitope classes, antibody candidates and evidence layers, publication style, no brand UI, synthetic labels only.',
    placeholder: `图片：${description}`,
    src,
    width: 780,
    height: 520,
    alt: title,
  }
}

function runInspector(
  stage: string,
  progressTitles: string[],
  outputs: RunInspectorData['outputs'],
  capabilityRuns: RunInspectorData['capabilityRuns'],
): RunInspectorData {
  return {
    summary: {
      stage,
      status: 'completed',
      completedSteps: progressTitles.length,
      totalSteps: progressTitles.length,
      outputCount: outputs.length,
      pendingCount: 0,
    },
    progress: progressTitles.map((title, index) => ({
      id: `${stage.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
      title,
      status: 'done',
      meta: `Step ${index + 1}`,
      detail: '已完成并写入审计记录。',
    })),
    outputs,
    approvals: [
      {
        id: `${stage}-approval`,
        kind: 'humanConfirmation',
        title: '关键边界确认',
        status: 'confirmed',
        actor: 'Project Owner',
        decidedAt: '2026-06-06 15:40',
      },
    ],
    capabilityRuns,
  }
}

function scientificDiagram(
  diagramKind: Extract<ConversationBlock, { type: 'scientificDiagram' }>['diagramKind'],
  title: string,
  description: string,
): Extract<ConversationBlock, { type: 'scientificDiagram' }> {
  return {
    type: 'scientificDiagram',
    diagramKind,
    title,
    description,
  }
}

const discoveryCapabilityRuns: RunInspectorData['capabilityRuns'] = [
  {
    id: 'targetx-discovery-run-01',
    commandName: 'TargetBriefParser.extractTargetConstraints',
    status: 'success',
    summary: '读取 research brief，抽取目标、边界、候选规模和禁止事项。',
    duration: '8.4s',
    input: { file: 'TargetX_research_brief.md', project: 'AB-Discovery-Target-X-001' },
    output: { target: 'Target-X', modality: 'IgG1', requestedCandidates: 28 },
    artifacts: [{ name: 'TargetX_research_brief.md', kind: 'md' }],
  },
  {
    id: 'targetx-discovery-run-02',
    commandName: 'BioDB.searchTargetProfile',
    status: 'success',
    summary: '检索 Target-X 序列、结构域、同源蛋白和结构证据。',
    duration: '36.2s',
    input: { target: 'Target-X', sources: ['sequence', 'structure', 'homologs'] },
    output: { domains: 'D1/D2/D3', homologRisk: 'medium', structureConfidence: 'mixed' },
    artifacts: [{ name: 'TargetX_target_profile.json', kind: 'json' }],
  },
  {
    id: 'targetx-discovery-run-03',
    commandName: 'EvidenceGraph.buildNetwork',
    status: 'success',
    summary: '合并内部 biology note、结构、抗体数据库、专利和表位线索。',
    duration: '28.7s',
    input: { targetProfile: 'TargetX_target_profile.json', includeInternalNotes: true },
    output: { evidenceNodes: 42, uncertainClaims: 5, blockingHypotheses: 3 },
    artifacts: [{ name: 'TargetX_evidence_network.json', kind: 'json' }],
  },
  {
    id: 'targetx-discovery-run-04',
    commandName: 'PatentIntel.scanTargetXSpace',
    status: 'success',
    summary: '扫描公开抗体家族相似性和 FTO 风险，用于候选池去重。',
    duration: '44.9s',
    input: { target: 'Target-X', similarityPolicy: 'strict' },
    output: { publicFamilies: 7, highSimilarityMotifs: 19, blockedFamilies: 2 },
    artifacts: [{ name: 'TargetX_patent_similarity_review.md', kind: 'md' }],
  },
  {
    id: 'targetx-discovery-run-05',
    commandName: 'AntigenPlanner.designConstructs',
    status: 'success',
    summary: '生成全长 ECD、D2/D3、同源 counter-screen 和突变体抗原策略。',
    duration: '19.5s',
    input: { domains: ['D1', 'D2', 'D3'], homologCounterScreen: true },
    output: { antigens: 4, primaryScreen: 'Ag-02 D2/D3', validation: 'Ag-01 full ECD' },
    artifacts: [{ name: 'TargetX_antigen_strategy.md', kind: 'md' }],
  },
  {
    id: 'targetx-discovery-run-06',
    commandName: 'EpitopeHypothesis.classify',
    status: 'success',
    summary: '把 D2/D3 周边表位分成 E1、E2、E3 假设层级。',
    duration: '16.1s',
    input: { antigenStrategy: 'TargetX_antigen_strategy.md', evidenceNetwork: 'TargetX_evidence_network.json' },
    output: { epitopeClasses: 3, wetLabValidationRequired: true },
    artifacts: [{ name: 'TargetX_epitope_hypothesis.json', kind: 'json' }],
  },
  {
    id: 'targetx-discovery-run-07',
    commandName: 'AntibodyPool.generateTargetXCandidates',
    status: 'success',
    summary: '生成天然样、结构约束、公开家族启发和受限合成多样性候选池。',
    duration: '54.1s',
    input: { naturalLike: 50000, structureGuided: 20000, publicInspired: 5000, syntheticDiversity: 100000 },
    output: { rawPairings: 175000, nonRedundant: 4380, familyClusters: 86 },
    artifacts: [{ name: 'TargetX_candidate_pool_manifest.json', kind: 'json' }],
  },
  {
    id: 'targetx-discovery-run-08',
    commandName: 'DevelopabilityFilter.screen',
    status: 'success',
    summary: '按人源性、liability、聚集、表达风险和同源蛋白风险过滤候选。',
    duration: '39.8s',
    input: { candidatePool: 'TargetX_candidate_pool_manifest.json', policy: 'R1 conservative' },
    output: { structureScreened: 624, r1ReadyFamilies: 86, noGo: 151 },
    artifacts: [{ name: 'TargetX_developability_filter_log.csv', kind: 'csv' }],
  },
  {
    id: 'targetx-discovery-run-09',
    commandName: 'Ranker.multiObjectiveScore',
    status: 'success',
    summary: '对候选做表位、结合代理、可开发性、FTO 和多样性综合排序。',
    duration: '42.7s',
    input: { candidates: 624, evidenceMode: 'ranking_only' },
    output: { primary: 20, backups: 4, controls: 4, excludedFromPrimary: ['ABX-041'] },
    artifacts: [{ name: 'TargetX_candidate_ranking.xlsx', kind: 'xlsx' }],
  },
  {
    id: 'targetx-discovery-run-10',
    commandName: 'ReleasePackager.writeR1Payload',
    status: 'success',
    summary: '生成 Top 28 释放包、证据索引、人工决策记录和 LIMS/LISM 输入。',
    duration: '24.6s',
    input: { primary: 20, backups: 4, controls: 4, autoR2: false },
    output: { releasePackage: 'TargetX_top28_release_package.json', limsPayload: 'TargetX_R1_LIMS_Submission_Payload.json' },
    artifacts: [
      { name: 'TargetX_top28_release_package.json', kind: 'json' },
      { name: 'TargetX_R1_LIMS_Submission_Payload.json', kind: 'json' },
    ],
  },
]

const discoveryTranscript: ConversationTurn[] = [
  turn('targetx-discovery', 1, 'user', '我想针对 Target-X 做阻断型单抗发现。第一轮希望推进 20 到 30 个候选进湿实验，但不要只追求模型分数。', [
    projectFile('TargetX_research_brief.md', 'md', 'Antibody Optimization / Design', 'MD · 靶点背景、内部假设、候选规模和输出边界。'),
  ]),
  turn('targetx-discovery', 2, 'mainAgent', '我会把这个任务拆成发现研究流程，而不是直接给候选结论。先锁定目标：Target-X、IgG1、阻断型、R1 候选包，输出给后续 LIMS/LISM。'),
  turn('targetx-discovery', 3, 'mainAgent', '这里我先标一个边界：模型可以帮我们排序和排风险，但不能证明“阻断”。阻断必须由 R1 功能实验验证。'),
  turn('targetx-discovery', 4, 'user', '对。我们的内部判断是 D2/D3 可能跟功能阻断相关，但这个还没有直接功能验证。'),
  turn('targetx-discovery', 5, 'mainAgent', '收到。我会把 D2/D3 写成“内部生物学假设”，不会把它作为已验证事实。候选排序会偏向 D2/D3，但必须保留全长 ECD 验证。'),
  turn('targetx-discovery', 6, 'mainAgent', '我先读取 research brief，并抽取项目约束、候选数量、抗体形式、风险偏好和禁止事项。', [
    capabilityRun(
      'TargetBriefParser.extractTargetConstraints',
      '抽取 Target-X 发现目标和边界',
      { file: 'TargetX_research_brief.md', owner: 'Project Owner' },
      { target: 'Target-X', modality: 'IgG1', candidateWindow: '20-30', autoR2: false },
      [{ name: 'TargetX_research_brief.md', kind: 'md', description: '原始靶点 brief 和内部发现边界。' }],
      '8.4s',
    ),
  ]),
  turn('targetx-discovery', 7, 'mainAgent', '第一轮我建议锁成 Top 28：20 个主候选、4 个备选、4 个对照。这样既能覆盖表位假设，又不会把湿实验规模拉得太大。'),
  turn('targetx-discovery', 8, 'user', '可以。第一轮重点是验证表位和可表达性，不要为了追求多样性把风险候选塞太多。'),
  turn('targetx-discovery', 9, 'mainAgent', '我把 R1 目标写成：验证 D2/D3 阻断假设、保留全长 ECD 结合、排除明显同源蛋白非特异结合，并给下一轮是否设计提供证据。', [
    confirmation('确认 R1 发现目标', 'Top 28 候选进入 R1；目标是验证表位、可表达性和初步阻断，不自动启动 R2。', '2026-06-06 10:12'),
  ]),
  turn('targetx-discovery', 10, 'mainAgent', '开始建立靶点档案。我会分开看序列结构域、结构资产、同源蛋白、公开抗体线索和专利相似性。'),
  turn('targetx-discovery', 11, 'mainAgent', '序列侧结果先出来：Target-X 胞外区可分为 D1、D2、D3。D2/D3 边界附近有内部注释的功能相关片段，但公开资料不足。'),
  turn('targetx-discovery', 12, 'user', 'D2/D3 相关性来自我们之前做的细胞通路观察，不是公开文献。这个不要写成文献支持。'),
  turn('targetx-discovery', 13, 'mainAgent', '已修正。我会在证据图里把它标成 internal biology note，置信度不和结构或实验文献混在一起。'),
  turn('targetx-discovery', 14, 'mainAgent', '继续检索结构和抗体数据库。当前看到结构资产可用但不完整：单体结构可参考，抗体-抗原复合物缺少高质量直接证据。', [
    capabilityRun(
      'BioDB.searchTargetProfile',
      '建立 Target-X 靶点档案',
      { target: 'Target-X', sources: ['sequence', 'structure', 'homologs'] },
      { domains: 'D1/D2/D3', structureConfidence: 'mixed', homologRisk: 'medium' },
      [{ name: 'TargetX_target_profile.json', kind: 'json', description: '结构域、同源蛋白和结构证据摘要。' }],
      '36.2s',
    ),
  ]),
  turn('targetx-discovery', 15, 'mainAgent', '同源蛋白风险需要单独处理：Family-Y 和 Family-Z 在 D2/D3 周边有局部相似性。R1 里应该放 counter-screen，而不是等到后面再补。'),
  turn('targetx-discovery', 16, 'mainAgent', '我把证据源汇成一张网络图。橙色是内部假设，蓝色是结构/序列，绿色是公开抗体空间，红色是相似性与专利风险。', [
    scientificDiagram(
      'targetxEvidenceNetwork',
      'Target-X Evidence Network',
      'Target-X 证据网络，区分内部假设、结构/序列、公开抗体空间、相似性与专利风险。',
    ),
  ]),
  turn('targetx-discovery', 17, 'user', '专利和公开抗体相似性要严一点。我们宁愿第一轮少几个，也不要太像公开家族。'),
  turn('targetx-discovery', 18, 'mainAgent', '明白。我会把公开家族相似性作为硬过滤，而不是排序里的软分。后面如果候选覆盖 D2/D3 但太像公开家族，也不能进主 20。'),
  turn('targetx-discovery', 19, 'mainAgent', '开始扫公开抗体家族和专利相似性。这里的目标是建立禁止区域，不是寻找可复制的序列。', [
    capabilityRun(
      'PatentIntel.scanTargetXSpace',
      '扫描 Target-X 抗体空间相似性风险',
      { target: 'Target-X', similarityPolicy: 'strict', publicFamilyReuse: false },
      { publicFamilies: 7, highSimilarityMotifs: 19, blockedFamilies: 2 },
      [{ name: 'TargetX_patent_similarity_review.md', kind: 'md', description: '公开抗体家族、相似性阈值和 FTO 风险。' }],
      '44.9s',
    ),
  ]),
  turn('targetx-discovery', 20, 'mainAgent', '相似性扫描完成。两个公开家族要设为禁止靠近；另有 19 个 CDR motif 允许作为弱参考，但不能直接进入主候选。'),
  turn('targetx-discovery', 21, 'mainAgent', '我开始设计抗原策略。由于 D2/D3 是假设核心，不能只用 D2/D3 片段筛选，必须同时保留全长 ECD。'),
  turn('targetx-discovery', 22, 'user', 'D2/D3 单独表达可能构象不稳定。Ag-02 可以用，但不要让它成为唯一标准。'),
  turn('targetx-discovery', 23, 'mainAgent', '同意。我建议四个抗原对象：Ag-01 全长 ECD 做构象验证，Ag-02 D2/D3 做主筛，Ag-03 同源蛋白做 counter-screen，Ag-04 D2/D3 interface mutant 做表位解释。'),
  turn('targetx-discovery', 24, 'mainAgent', '我把抗原策略写入项目文件，并在候选排序里设定：Ag-02 强阳性但 Ag-01 弱结合的候选只能进备选，不进主 20。', [
    capabilityRun(
      'AntigenPlanner.designConstructs',
      '设计 Target-X 抗原和 counter-screen 组合',
      { primaryHypothesis: 'D2/D3', requireFullEcdValidation: true },
      { antigens: 4, primaryScreen: 'Ag-02 D2/D3', conformationalValidation: 'Ag-01 full ECD' },
      [{ name: 'TargetX_antigen_strategy.md', kind: 'md', description: 'Ag-01 到 Ag-04 的用途、风险和排序规则。' }],
      '19.5s',
    ),
  ]),
  turn('targetx-discovery', 25, 'mainAgent', '抗原策略如下：Ag-01 全长 ECD，Ag-02 D2/D3，Ag-03 homolog Y/Z ECD，Ag-04 D2/D3 interface mutant。请确认是否锁定。'),
  turn('targetx-discovery', 26, 'user', '确认。Ag-01 和 Ag-02 都必须进入 R1。Ag-03 只做排除，不要让它影响主筛强度。'),
  turn('targetx-discovery', 27, 'mainAgent', '已锁定。Ag-03 只作为非特异性和同源蛋白风险排除项，不作为主筛增强信号。', [
    confirmation('确认 Target-X 抗原策略', 'Ag-01、Ag-02、Ag-03、Ag-04 进入 R1；Ag-03 只作为 counter-screen。', '2026-06-06 11:06'),
  ]),
  turn('targetx-discovery', 28, 'user', '表位分层你准备怎么做？我不希望 AI 直接宣布 E1 就是功能表位。'),
  turn('targetx-discovery', 29, 'mainAgent', '我会只写“表位假设”。E1 是 D2/D3 interface 周边的阻断核心假设；E2 是邻近或变构假设；E3 是非阻断或工具抗体假设。'),
  turn('targetx-discovery', 30, 'mainAgent', '我把 D1/D2/D3 和 E1/E2/E3 的关系画成项目图。注意这张图是工作假设，不是实验结论。', [
    scientificDiagram(
      'targetxEpitopeHypothesis',
      'Target-X ECD Epitope Hypothesis',
      'D1-D2-D3 胞外区结构域图；E1/E2/E3 只表示 R1 前的表位假设分层。',
    ),
  ]),
  turn('targetx-discovery', 31, 'mainAgent', '我把表位假设写入 JSON，后续候选只会被标注为“更像 E1/E2/E3”，不会被标注为已验证阻断。', [
    capabilityRun(
      'EpitopeHypothesis.classify',
      '生成 E1/E2/E3 表位假设层级',
      { domainMap: 'TargetX_target_profile.json', antigenStrategy: 'TargetX_antigen_strategy.md' },
      { classes: ['E1 blocking-core hypothesis', 'E2 adjacent hypothesis', 'E3 non-blocking control'], validation: 'R1 required' },
      [{ name: 'TargetX_epitope_hypothesis.json', kind: 'json', description: '表位假设、证据来源和验证要求。' }],
      '16.1s',
    ),
  ]),
  turn('targetx-discovery', 32, 'mainAgent', '接下来生成候选池。我会把来源分成四类：天然样空间、结构约束、公开家族启发但低相似度、受限合成多样性。'),
  turn('targetx-discovery', 33, 'user', '公开家族启发可以有，但相似度阈值要严格。尤其不要把 CDRH3 太像的放进主候选。'),
  turn('targetx-discovery', 34, 'mainAgent', '已把 CDRH3 相似性设为主候选硬约束：高相似 motif 只能进 no-go 证据，不进入主 20。'),
  turn('targetx-discovery', 35, 'mainAgent', '开始生成候选池：天然样 50,000、结构约束 20,000、公开家族启发 5,000、受限合成多样性 100,000。', [
    capabilityRun(
      'AntibodyPool.generateTargetXCandidates',
      '生成 Target-X 候选抗体池',
      { naturalLike: 50000, structureGuided: 20000, publicInspired: 5000, syntheticDiversity: 100000 },
      { rawPairings: 175000, nonRedundant: 4380, familyClusters: 86 },
      [{ name: 'TargetX_candidate_pool_manifest.json', kind: 'json', description: '候选来源、去重、家族聚类和禁止区域。' }],
      '54.1s',
    ),
  ]),
  turn('targetx-discovery', 36, 'mainAgent', '原始候选 175,000 对，去重后 4,380 对。这个数字只是序列层面，不代表可表达或可结合。'),
  turn('targetx-discovery', 37, 'mainAgent', '我先做序列完整性过滤：VH/VL 完整、CDR 可识别、框架没有明显断裂。剩余 3,260 对。'),
  turn('targetx-discovery', 38, 'mainAgent', '第二层过滤是 human-likeness。保留接近人源 germline 的框架，过远或需要大量 back-mutation 的先降级。剩余 1,240 对。'),
  turn('targetx-discovery', 39, 'mainAgent', '第三层是 liability：明显 N-糖基化、脱酰胺、氧化热点、高疏水 patch 进入风险队列。剩余 824 对。'),
  turn('targetx-discovery', 40, 'mainAgent', '第四层是结构可折叠性和 CDR 多样性。624 对进入结构和复合物建模队列。'),
  turn('targetx-discovery', 41, 'user', '这里别把低表达风险直接淘汰。第一轮我们可以接受部分表达不高的，只要它能帮助验证表位。'),
  turn('targetx-discovery', 42, 'mainAgent', '收到。我把表达风险从硬排除改为排序降权。只有聚集高风险、FTO 高相似、同源蛋白非特异高风险仍然硬排。'),
  turn('targetx-discovery', 43, 'mainAgent', '过滤漏斗如下。你会看到表达风险没有直接砍掉候选，只是影响主候选排序。', [
    dataChart('Target-X candidate filtering funnel', [
      {
        label: 'Remaining candidates',
        color: 'blue',
        points: [
          { label: 'Raw', value: 175000 },
          { label: 'Dedup', value: 4380 },
          { label: 'Human-like', value: 1240 },
          { label: 'Liability', value: 824 },
          { label: 'Structure', value: 624 },
          { label: 'R1 families', value: 86 },
          { label: 'Top 28', value: 28 },
        ],
      },
    ]),
  ]),
  turn('targetx-discovery', 44, 'mainAgent', '开始结构和复合物建模。这个阶段我只用接触概率和构象一致性做排序辅助，不给出真实亲和力预测。'),
  turn('targetx-discovery', 45, 'mainAgent', '建模结果把候选分成四簇：E1 primary、E2 backup、E3 control、risk-filtered。ABX-014、ABX-027、ABX-033 在 E1 簇里最稳定。', [
    scientificFigure('targetx-candidate-cluster-map', 'Target-X candidate cluster map', '候选抗体按表位假设和可开发性风险分群。', targetxCandidateClusterMap),
  ]),
  turn('targetx-discovery', 46, 'mainAgent', '我继续检查同源蛋白 counter-screen 风险。这里不是实验结果，而是结构和序列层面的“可能误伤”提示。'),
  turn('targetx-discovery', 47, 'mainAgent', 'Family-Y 风险较集中在 E3 样候选。E1 主候选中 ABX-052 有轻微同源风险，我会把它留作备选而不是主 20。'),
  turn('targetx-discovery', 48, 'mainAgent', 'FTO 相似性过滤后，ABX-041 的公开家族相似性和聚集风险叠加，不建议进主候选。'),
  turn('targetx-discovery', 49, 'mainAgent', '我先生成一版候选证据表，里面每个分数都只用于排序，不作为湿实验结论。'),
  turn('targetx-discovery', 50, 'user', 'ABX-014 为什么排第一？如果只是模型打分高，我不接受。'),
  turn('targetx-discovery', 51, 'mainAgent', 'ABX-014 排第一不是单一模型分数。它同时满足四点：E1 接触概率高、全长 ECD 结合代理分稳定、FTO 相似性低、聚集风险低。弱点是 CDRH3 多样性不算最高。'),
  turn('targetx-discovery', 52, 'mainAgent', '我把 Top 候选证据热图贴出来，便于你看风险组合。ABX-041 的问题在于 FTO 与 aggregation 两个风险同时偏高。', [
    scientificFigure('targetx-top-candidate-evidence', 'Target-X top candidate evidence', 'Top 候选证据矩阵，展示 E1 fit、ECD binding、FTO、人源性、聚集和 R1 推荐。', targetxTopCandidateEvidence),
  ]),
  turn('targetx-discovery', 53, 'mainAgent', '候选证据表如下。建议 ABX-014、027、033 做第一梯队；ABX-041 不进主 20。', [
    {
      type: 'candidateEvidenceTable',
      title: 'Target-X R1 candidate evidence review',
      columns: targetXDiscoveryEvidenceColumns,
      rows: [
        {
          id: 'ABX-014',
          group: 'Primary',
          evidence: {
            epitope: 'E1 / D2-D3',
            bindingProxy: 'high',
            blockingFit: 'strong',
            humanLikeness: '0.91',
            aggregation: 'low',
            recommendation: 'Go',
          },
          risk: 'low',
          rationale: 'E1 接触、全长 ECD 代理分、FTO 和聚集风险同时可接受。',
        },
        {
          id: 'ABX-027',
          group: 'Primary',
          evidence: {
            epitope: 'E1 adjacent',
            bindingProxy: 'high',
            blockingFit: 'medium-high',
            humanLikeness: '0.88',
            aggregation: 'low',
            recommendation: 'Go',
          },
          risk: 'low',
          rationale: '与 ABX-014 表位相邻，可降低单一表位假设风险。',
        },
        {
          id: 'ABX-033',
          group: 'Primary',
          evidence: {
            epitope: 'E1',
            bindingProxy: 'medium-high',
            blockingFit: 'medium-high',
            humanLikeness: '0.89',
            aggregation: 'low-medium',
            recommendation: 'Go',
          },
          risk: 'medium',
          rationale: 'CDRH3 多样性更高，适合作为主候选补充。',
        },
        {
          id: 'ABX-041',
          group: 'Backup',
          evidence: {
            epitope: 'E2',
            bindingProxy: 'medium',
            blockingFit: 'medium',
            humanLikeness: '0.84',
            aggregation: 'medium',
            recommendation: 'Backup',
          },
          risk: 'medium',
          rationale: '公开家族相似性和聚集风险叠加，不进主 20。',
        },
      ],
    },
  ]),
  turn('targetx-discovery', 54, 'mainAgent', '我把候选分层先写成 20 primary、4 backup、4 control。ABX-041 暂时在 backup，不进 primary。', [
    dataChart('Target-X release tier distribution', [
      {
        label: 'R1 package',
        color: 'teal',
        points: [
          { label: 'Primary', value: 20 },
          { label: 'Backup', value: 4 },
          { label: 'Controls', value: 4 },
          { label: 'No-Go', value: 151 },
        ],
      },
    ]),
  ]),
  turn('targetx-discovery', 55, 'mainAgent', '我还需要确认一个边界：control 里是否保留 E3 非阻断候选？我的建议是保留 2 个，便于后面解释功能 assay。'),
  turn('targetx-discovery', 56, 'user', '保留。E3 可以作为 assay 和表位解释的对照，但不要在结论里说它们是治疗候选。'),
  turn('targetx-discovery', 57, 'mainAgent', '已记录。E3 候选会标注为 control only，不参与主治疗候选排序。'),
  turn('targetx-discovery', 58, 'mainAgent', '我现在生成 developability filter log 和候选 ranking 表。所有被降级的理由会写入审计记录，不只写最终名单。', [
    capabilityRun(
      'DevelopabilityFilter.screen',
      '完成可开发性、FTO 和同源蛋白风险过滤',
      { candidatePool: 'TargetX_candidate_pool_manifest.json', expressionRiskAsPenalty: true },
      { r1Families: 86, primary: 20, backups: 4, controls: 4, noGo: 151 },
      [{ name: 'TargetX_developability_filter_log.csv', kind: 'csv', description: '过滤阈值、风险标签和降级原因。' }],
      '39.8s',
    ),
  ]),
  turn('targetx-discovery', 59, 'mainAgent', '排序表已生成。ABX-041 的状态从 backup 候选保留，但不进入主 20；ABX-052 从主候选降到 backup，因为同源风险不够干净。'),
  turn('targetx-discovery', 60, 'mainAgent', '我把人工决策也写入 `TargetX_candidate_decision_log.md`：D2/D3 是内部假设、Ag-01 必须验证、ABX-041 不进主 20、E3 只做对照。'),
  turn('targetx-discovery', 61, 'user', '再确认一下：第一轮不要自动设计 R2。R1 结果出来前，只能准备后续分析框架。'),
  turn('targetx-discovery', 62, 'mainAgent', '确认。R1 release package 会显式写入 `autoNextRound=false`。后续模型微调 Thread 可以准备，但不会自动生成 R2 工单。'),
  turn('targetx-discovery', 63, 'mainAgent', '我开始生成候选释放包。包里会包含候选清单、VH/VL、表位假设、risk flags、降级理由、control 说明和 LIMS/LISM 输入边界。', [
    projectFile('TargetX_top28_release_package.json', 'json', 'Antibody Optimization / Design', 'JSON · Top 20 主候选、4 个备选、4 个对照及风险标签。'),
    projectFile('TargetX_candidate_ranking.xlsx', 'xlsx', 'Antibody Optimization / Results', 'XLSX · 候选分层、排序证据、过滤理由和审计列。'),
  ]),
  turn('targetx-discovery', 64, 'mainAgent', '候选包释放前，我需要你确认三条边界：只释放 Top 28；ABX-041 不进主 20；不自动启动 R2。'),
  turn('targetx-discovery', 65, 'user', '确认。Top 28 可以释放。ABX-041 不进主 20。R2 不自动启动。'),
  turn('targetx-discovery', 66, 'mainAgent', '已记录审批。候选包进入 R1 的审批卡如下：', [
    approvalGate('Target-X R1 候选包释放审批', 'CandidatePackageRelease', '批准 Top 28 进入 R1；ABX-041 不进主 20；不自动启动 R2。', [
      'Target-X D2/D3 仍为内部假设',
      'Ag-01 全长 ECD 和 Ag-02 D2/D3 均进入 R1',
      '高 FTO 相似候选不进入主 20',
      'E3 候选仅作为对照',
      'R1 结果前不自动启动 R2',
    ]),
  ]),
  turn('targetx-discovery', 67, 'mainAgent', '我写入 release package、证据索引和 LIMS/LISM submission payload。下游管线只能读取被批准的 Top 28，不允许扩展候选。', [
    capabilityRun(
      'ReleasePackager.writeR1Payload',
      '生成 R1 候选释放包和 LIMS/LISM 输入',
      { primary: 20, backups: 4, controls: 4, autoR2: false },
      { releasePackage: 'TargetX_top28_release_package.json', limsPayload: 'TargetX_R1_LIMS_Submission_Payload.json' },
      [
        { name: 'TargetX_top28_release_package.json', kind: 'json', description: 'R1 候选释放包。' },
        { name: 'TargetX_R1_LIMS_Submission_Payload.json', kind: 'json', description: 'LIMS/LISM 输入载荷。' },
      ],
      '24.6s',
    ),
  ]),
  turn('targetx-discovery', 68, 'mainAgent', '释放包已保存。输入是 research brief、内部 D2/D3 假设、结构/数据库证据和人工边界；输出是 Top 28 候选包、证据索引和 LIMS/LISM payload。'),
  turn('targetx-discovery', 69, 'mainAgent', '仍然不确定的部分也写进包里：D2/D3 是否真阻断、Ag-02 是否保留天然构象、ABX-014 是否真实功能最强，都必须由 R1 验证。'),
  turn('targetx-discovery', 70, 'user', '可以。把这版作为 R1 输入，不要再扩大候选数。'),
  turn('targetx-discovery', 71, 'mainAgent', '已锁定 R1 输入。`TargetX_R1_LIMS_Submission_Payload.json` 可由后续 LIMS/LISM 执行 Thread 消费。'),
  turn('targetx-discovery', 72, 'mainAgent', 'Target-X 阻断型抗体发现阶段完成。下一步是 R1 LIMS 实验执行：样本注册、板图、表达纯化、结合/阻断 assay、counter-screen 和结果包回收。', [
    projectFile('TargetX_discovery_decision_log.md', 'md', 'Antibody Optimization / Reports', 'MD · 人工确认、降级理由、禁止自动 R2 和释放边界。'),
    projectFile('TargetX_discovery_evidence_index.json', 'json', 'Antibody Optimization / Reports', 'JSON · 证据、候选、文件和审批的可追溯索引。'),
  ]),
]

const limsCapabilityRuns: RunInspectorData['capabilityRuns'] = [
  {
    id: 'targetx-lims-run-01',
    commandName: 'LIMS.createProjectAndSamples',
    status: 'success',
    summary: '创建 R1 项目、样本、条码和样本谱系。',
    duration: '25.3s',
    input: { package: 'TargetX_CandidateManifest_v1.0.json', candidates: 28 },
    output: { project: 'LIMS-ABX-R1-001', sampleObjects: 196, barcodeBatches: 4 },
    artifacts: [{ name: 'TargetX_R1_sample_manifest.xlsx', kind: 'xlsx' }],
  },
  {
    id: 'targetx-lims-run-02',
    commandName: 'LIMS.releaseResultPackage',
    status: 'success',
    summary: '校验并释放 R1 结果包。',
    duration: '18.9s',
    input: { project: 'LIMS-ABX-R1-001', round: 'R1' },
    output: { package: 'TargetX_R1_ResultBundle.xlsx', readyForAnalysis: true },
    artifacts: [{ name: 'TargetX_R1_ResultBundle.xlsx', kind: 'xlsx' }],
  },
]

const limsTranscript: ConversationTurn[] = [
  turn('targetx-lims', 1, 'user', '接收 Target-X 的 Top 28 候选包，创建 R1 湿实验管线，并把样本、板图、工单和结果回收都结构化。', [
    projectFile('TargetX_R1_LIMS_Submission_Payload.json', 'json', 'Antibody Optimization / Execution', 'JSON · 来自发现流程的 R1 工单输入。'),
  ]),
  turn('targetx-lims', 2, 'mainAgent', '已接收候选包。我将创建 LIMS/LISM 项目 LIMS-ABX-R1-001，并拆分为 7 类工单。', [
    capabilityRun(
      'LIMS.createProjectAndSamples',
      '创建 LIMS/LISM 项目、样本和条码',
      { project: 'AB-Discovery-Target-X-001', candidates: 28, round: 'WetLab-R1' },
      { limsProject: 'LIMS-ABX-R1-001', sampleObjects: 196, workOrderGroups: 7 },
      [{ name: 'TargetX_R1_sample_manifest.xlsx', kind: 'xlsx', description: '候选、样本、条码和谱系。' }],
    ),
  ]),
  turn('targetx-lims', 3, 'mainAgent', '订单边界已形成：只覆盖当前 Top 28 候选、Ag-01 到 Ag-04 和 R1 assay panel。', [
    {
      type: 'experimentOrderSummary',
      title: 'Target-X R1 experiment order',
      orderId: 'LIMS-ABX-R1-001',
      status: 'draft',
      reviewStatus: 'pending',
      projectId: 'AB-Discovery-Target-X-001',
      libraryId: 'TargetX-Top28-v1.0',
      subjectLabel: 'Campaign',
      parentEnzyme: 'Target-X antibody campaign',
      purpose: '执行 Top 28 候选的表达、纯化、结合、阻断、选择性和细胞结合验证',
      scopeLock: '仅执行已批准候选包，不新增候选或修改序列',
      owner: 'Wet Lab Operations',
      createdAt: '2026-06-07 09:20',
      dueAt: '2026-06-10 18:00',
      rows: [
        { label: 'Candidates', value: '20 primary + 4 backups + 4 controls' },
        { label: 'Antigens', value: 'Ag-01, Ag-02, Ag-03, Ag-04' },
        { label: 'Result package', value: 'TargetX_R1_ResultBundle.xlsx' },
      ],
    },
  ]),
  turn('targetx-lims', 4, 'mainAgent', '请确认样本范围：28 个候选、Ag-01/Ag-02 主抗原、Ag-03 同源蛋白、Ag-04 表位突变体全部进入 R1。'),
  turn('targetx-lims', 5, 'user', '确认。样本范围固定，库存缺失的不能用其它候选替补。'),
  turn('targetx-lims', 6, 'mainAgent', '样本范围已锁定，所有样本对象、条码和谱系已绑定候选 manifest 版本。', [
    {
      type: 'sampleScopePanel',
      libraryId: 'TargetX-Top28-v1.0',
      variantCount: 28,
      variantRange: 'ABX-001 through ABX-028',
      controls: ['positive reference binder', 'isotype control', 'blank buffer', 'homolog antigen control'],
      replicatePlan: 'ELISA/BLI duplicate wells; blocking and cell binding duplicate reads',
      sampleSource: 'TargetX_CandidateManifest_v1.0.json',
      exclusions: ['未在 manifest 中的候选不得补入', '条码未绑定样本不得上板'],
      lockedBy: 'Project Owner',
    },
    confirmation('确认 R1 样本范围', 'Top 28 候选和四类对照进入固定执行范围。', '2026-06-07 09:42'),
  ]),
  turn('targetx-lims', 7, 'mainAgent', '我拆分工单：基因合成、克隆、表达、纯化、QC、结合和功能实验。每个工单都绑定样本谱系。'),
  turn('targetx-lims', 8, 'mainAgent', '库存检查完成，Ag-02 D2/D3 批次足够，Ag-04 突变体需要延后 4 小时释放。'),
  turn('targetx-lims', 9, 'mainAgent', '我生成 96 孔板图。建议每块板都放阳性、阴性、空白和同源蛋白对照，减少板效应解释风险。'),
  turn('targetx-lims', 10, 'user', '批准这个板图策略。边缘孔要有对照，不要把主候选集中到同一排。'),
  turn('targetx-lims', 11, 'mainAgent', '板图已锁定，候选孔、重复孔和对照孔都可追溯。', [
    {
      type: 'plateMapMini',
      plateMapId: 'TX-R1-PLATEMAP-001',
      plateCount: 4,
      dimensions: '96-well',
      wells: [
        { position: 'A1', label: 'positive ref', group: 'Positive control' },
        { position: 'A2', label: 'isotype', group: 'Negative control' },
        { position: 'B3', label: 'ABX-014', group: 'Primary candidate' },
        { position: 'C5', label: 'ABX-027', group: 'Primary candidate' },
        { position: 'D7', label: 'ABX-033', group: 'Primary candidate' },
        { position: 'H12', label: 'blank', group: 'Blank control' },
      ],
      legend: [
        { label: 'Primary candidate', color: 'teal' },
        { label: 'Backup candidate', color: 'amber' },
        { label: 'Positive control', color: 'violet' },
        { label: 'Negative control', color: 'gray' },
      ],
      locked: true,
    },
  ]),
  turn('targetx-lims', 12, 'mainAgent', 'R1 工单已派发。仪器队列包含 AKTA、SEC、Octet/Biacore、plate reader 和 FACS。'),
  turn('targetx-lims', 13, 'mainAgent', '执行追踪显示表达和纯化已完成，ABX-017 纯化记录延迟，ABX-041 BLI 初始拟合不稳定。', [
    dataChart('Target-X R1 execution status', [
      {
        label: 'Work orders',
        color: 'blue',
        points: [
          { label: 'Complete', value: 5 },
          { label: 'Review', value: 2 },
          { label: 'Blocked', value: 0 },
        ],
      },
    ]),
  ]),
  turn('targetx-lims', 14, 'mainAgent', '请确认异常策略：ABX-017 先标记为数据延迟，ABX-041 保留原始 BLI 曲线但降低拟合标签置信度。'),
  turn('targetx-lims', 15, 'user', '确认。不要删除原始读数，异常必须保留在结果包里。'),
  turn('targetx-lims', 16, 'mainAgent', '异常策略已写入记录本和审计日志，原始读数保留，分析阶段会看到标签置信度。', [
    {
      type: 'experimentNotebookSummary',
      notebookId: 'ELN-TX-R1-001',
      taskId: 'TX-R1-EXEC-001',
      orderId: 'LIMS-ABX-R1-001',
      status: 'submitted',
      estimatedSubmitBy: '2026-06-10 16:00',
      submittedAt: '2026-06-10 15:42',
      submittedBy: 'Wet Lab Operations',
      callbackId: 'CALLBACK-TX-R1-RESULTS',
      recordSections: [
        { label: 'Expression', value: '28/28 complete', status: 'complete' },
        { label: 'Purification', value: '27/28 complete; ABX-017 delayed', status: 'flagged' },
        { label: 'BLI/SPR', value: '23/24 fit pass; ABX-041 low confidence', status: 'flagged' },
      ],
      observations: ['ABX-014 and ABX-027 show strong blocking signal', 'Plate effect normalized using internal controls'],
      attachments: ['TargetX_R1_plate_map.csv', 'TargetX_R1_raw_bli_curves.zip'],
    },
  ]),
  turn('targetx-lims', 17, 'mainAgent', '结果包 schema 校验通过，样本 ID、板位、读数字段、异常表和记录本元数据完整。', [
    {
      type: 'resultPackageChecklist',
      packageName: 'TargetX_R1_ResultBundle.xlsx',
      receivedAt: '2026-06-10 16:10',
      files: [
        'candidate_manifest_v1.0.json',
        'sample_lineage.csv',
        'expression_qc.csv',
        'bli_spr_fit_results.csv',
        'blocking_assay_results.csv',
        'counter_screen_results.csv',
      ],
      schemaChecks: ['样本 ID 对齐', '板位映射完整', '异常记录保留', '标签置信度字段完整'],
      missingItems: [],
      archiveLocations: ['Antibody Optimization / Results', 'Antibody Optimization / Reports'],
      readyForAnalysis: true,
    },
    projectFile('TargetX_R1_ResultBundle.xlsx', 'xlsx', 'Antibody Optimization / Results', 'XLSX · R1 结果包、异常记录和标签置信度。'),
  ]),
  turn('targetx-lims', 18, 'mainAgent', 'R1 LIMS/LISM 实验执行完成。结果包已准备好交给数据分析和模型微调流程。'),
]

const modelCapabilityRuns: RunInspectorData['capabilityRuns'] = [
  {
    id: 'targetx-model-run-01',
    commandName: 'DataQC.curateR1Bundle',
    status: 'success',
    summary: '回收、清洗并标注 R1 结果数据。',
    duration: '31.4s',
    input: { package: 'TargetX_R1_ResultBundle.xlsx' },
    output: { completeRate: '96%', curatedRows: 28, lowConfidenceLabels: 2 },
    artifacts: [{ name: 'DataCurationLog_R1_v1.1.md', kind: 'md' }],
  },
  {
    id: 'targetx-model-run-02',
    commandName: 'Training.finetuneIgBertLoRA',
    status: 'success',
    summary: '选择模型栈并完成 LoRA 微调。',
    duration: '24m 18s',
    input: { model: 'IgBert encoder', trainingSet: 'TargetX_R1_training_dataset.jsonl' },
    output: { run: 'FT-ABX-R1-IgBert-001', validationSpearman: 0.71, r2Candidates: 32 },
    artifacts: [{ name: 'ModelCard_FT-ABX-R1-IgBert-001.md', kind: 'md' }],
  },
]

const modelTranscript: ConversationTurn[] = [
  turn('targetx-model', 1, 'user', '回收 Target-X R1 湿实验所有数据，分析哪些抗体值得优化，并选择合适的生物模型做微调。', [
    projectFile('TargetX_R1_ResultBundle.xlsx', 'xlsx', 'Antibody Optimization / Results', 'XLSX · R1 表达、纯化、结合、阻断和选择性结果。'),
  ]),
  turn('targetx-model', 2, 'mainAgent', '我会先做数据完整性检查和单位标准化，再进行多目标候选分层、模型选择、微调和 R2 回写。', [
    capabilityRun(
      'DataQC.curateR1Bundle',
      '完成 R1 结果包 schema 和标签质量检查',
      { bundle: 'TargetX_R1_ResultBundle.xlsx', project: 'LIMS-ABX-R1-001' },
      { completeRate: '96%', delayedSamples: 1, lowConfidenceFits: 1 },
      [{ name: 'DataCurationLog_R1_v1.1.md', kind: 'md', description: '数据修正、异常和标签置信度记录。' }],
    ),
  ]),
  turn('targetx-model', 3, 'mainAgent', '发现 3 个质量问题：ABX-017 纯化数据延迟、ABX-041 BLI 拟合失败、P-BLOCK-01 轻微边缘效应。'),
  turn('targetx-model', 4, 'mainAgent', '建议 ABX-041 不进入主亲和力训练标签，ABX-017 暂列待定，P-BLOCK-01 用板内对照归一化后保留。'),
  turn('targetx-model', 5, 'user', '批准。所有修正必须写审计记录，原始读数不能删。'),
  turn('targetx-model', 6, 'mainAgent', '已应用数据修正，原始读数保留，训练标签带置信度字段。', [
    confirmation('批准 R1 数据修正规则', '保留原始读数；ABX-041 降低标签置信度；ABX-017 暂列待定。', '2026-06-11 09:20'),
  ]),
  turn('targetx-model', 7, 'mainAgent', '多目标分析完成。ABX-014、ABX-027 和 ABX-033 是最适合进入优化的母本。', [
    {
      type: 'candidateEvidenceTable',
      title: 'Target-X R1 multi-objective evidence',
      columns: targetXModelEvidenceColumns,
      rows: [
        {
          id: 'ABX-014',
          group: 'Tier 1',
          evidence: {
            r1Readout: 'strong Ag-02 binding; high blocking',
            labelQuality: 'high',
            modelUse: 'primary parent',
            r2Action: 'exploit around HCDR3',
          },
          risk: 'low',
          rationale: '综合亲和力、阻断、选择性和表达表现最好。',
        },
        {
          id: 'ABX-027',
          group: 'Tier 1',
          evidence: {
            r1Readout: 'balanced binding and developability',
            labelQuality: 'high',
            modelUse: 'parallel parent',
            r2Action: 'local CDRL3 exploration',
          },
          risk: 'low',
          rationale: '机制与 ABX-014 不完全重叠，适合作并行母本。',
        },
        {
          id: 'ABX-041',
          group: 'No-Go label',
          evidence: {
            r1Readout: 'BLI fit failed',
            labelQuality: 'low',
            modelUse: 'excluded from primary affinity training',
            r2Action: 'do not optimize',
          },
          risk: 'medium',
          rationale: '保留为低置信记录，不作为模型主标签。',
        },
      ],
    },
    dataChart('Target-X R1 candidate tiers', [
      {
        label: 'R1 tiers',
        color: 'violet',
        points: [
          { label: 'Tier 1', value: 3 },
          { label: 'Tier 2', value: 2 },
          { label: 'Tool', value: 1 },
          { label: 'No-Go', value: 8 },
        ],
      },
    ]),
  ]),
  turn('targetx-model', 8, 'mainAgent', '我把模型任务拆成 4 类：亲和力/阻断预测、可开发性预测、结构约束生成和复合物重打分。'),
  turn('targetx-model', 9, 'mainAgent', '模型选择建议：IgBert encoder 做回归主模型，IgT5 生成 R2 变体，IgFold/Chai 类模型做结构复核。'),
  turn('targetx-model', 10, 'user', '可以。训练集要小心，不要把低置信标签当成真值。'),
  turn('targetx-model', 11, 'mainAgent', '训练集已构建：高置信标签用于主训练，低置信标签仅用于辅助分析和不确定性标注。', [
    projectFile('TargetX_R1_training_dataset.jsonl', 'json', 'Antibody Optimization / Results', 'JSONL · VH/VL、CDR、assay 标签和置信度。'),
  ]),
  turn('targetx-model', 12, 'mainAgent', '我启动 IgBert LoRA 微调，并把训练参数、数据版本和 checkpoint 写入模型卡草稿。', [
    capabilityRun(
      'Training.finetuneIgBertLoRA',
      '完成 Target-X R1 小样本微调',
      { baseModel: 'IgBert encoder', adapter: 'LoRA', labels: ['KD', 'blocking', 'counter-screen'] },
      { runId: 'FT-ABX-R1-IgBert-001', validationSpearman: 0.71, checkpoints: 4 },
      [{ name: 'ModelCard_FT-ABX-R1-IgBert-001.md', kind: 'md', description: '模型用途、数据、指标和限制。' }],
      '24m 18s',
    ),
  ]),
  turn('targetx-model', 13, 'mainAgent', '微调模型相对 baseline 提升明显，但 R1 样本量小，R2 只能作为主动学习推荐，不能作为最终排序真值。'),
  turn('targetx-model', 14, 'mainAgent', '我生成 R2 变体：围绕 ABX-014 做 exploit，围绕 ABX-027 和 ABX-033 做 explore，并保留结构和可开发性过滤。'),
  turn('targetx-model', 15, 'mainAgent', 'R2 候选经过结构和 developability 过滤后剩余 32 个，建议推进 24 个进入下一轮。'),
  turn('targetx-model', 16, 'mainAgent', '进入 R2 前需要审批：是否批准将 24 个 R2 候选回写 LIMS/LISM，但等待实验负责人另行启动工单。', [
    approvalGate('R2 候选回写审批', 'modelRelease', '批准 24 个 R2 候选回写 LIMS/LISM，暂不自动启动实验。', [
      '训练数据版本已锁定',
      '低置信标签未进入主训练真值',
      'R2 候选结构过滤已完成',
      '回写载荷不自动创建执行工单',
    ]),
  ]),
  turn('targetx-model', 17, 'user', '批准回写，但工单需要我再确认后才能启动。'),
  turn('targetx-model', 18, 'mainAgent', '已生成 R2 Candidate Manifest、FASTA、模型评分和 LIMS/LISM 回写载荷。闭环分析完成，等待下一轮实验启动确认。', [
    {
      type: 'resultPackageChecklist',
      packageName: 'TargetX_R2_Model_Design_Package.zip',
      receivedAt: '2026-06-11 11:10',
      files: [
        'R2_CandidateManifest_v1.0.json',
        'R2_VHVL_FASTA.fasta',
        'R2_ModelScores.csv',
        'ModelCard_FT-ABX-R1-IgBert-001.md',
        'R2_LIMS_Submission_Payload.json',
      ],
      schemaChecks: ['候选 ID 唯一', '母本来源可追溯', '模型评分字段完整', 'LIMS/LISM payload schema 通过'],
      missingItems: [],
      archiveLocations: ['Antibody Optimization / Results', 'Antibody Optimization / Reports'],
      readyForAnalysis: true,
    },
    projectFile('R2_LIMS_Submission_Payload.json', 'json', 'Antibody Optimization / Execution', 'JSON · R2 候选回写载荷，等待人工启动。'),
  ]),
]

export const antibodyTargetXThreads: Thread[] = [
  {
    id: 'targetx-antibody-discovery',
    title: 'Target-X 阻断型抗体发现',
    lastActivity: '刚刚',
    transcript: discoveryTranscript,
    runInspector: runInspector(
      'Target-X discovery',
      [
        '读取 Target-X research brief',
        '抽取发现目标和边界',
        '建立靶点档案',
        '检索结构和抗体证据',
        '检索专利与相似性风险',
        '设计抗原与 counter-screen',
        '建立表位假设',
        '生成候选池',
        '执行序列完整性过滤',
        '执行可开发性过滤',
        '执行结构和复合物建模',
        '多目标候选排序',
        '人类复核候选边界',
        '释放 Top 28 候选包',
        '生成 LIMS/LISM submission payload',
      ],
      [
        {
          id: 'targetx-discovery-output-01',
          name: 'TargetX_CandidateManifest_v1.0.json',
          kind: 'dataset',
          location: 'Antibody Optimization / Design',
          status: 'saved',
        },
        {
          id: 'targetx-discovery-output-02',
          name: 'TargetX_top28_release_package.json',
          kind: 'projectFile',
          location: 'Antibody Optimization / Design',
          status: 'saved',
        },
        {
          id: 'targetx-discovery-output-03',
          name: 'TargetX_R1_LIMS_Submission_Payload.json',
          kind: 'projectFile',
          location: 'Antibody Optimization / Execution',
          status: 'saved',
        },
        {
          id: 'targetx-discovery-output-04',
          name: 'TargetX_discovery_decision_log.md',
          kind: 'report',
          location: 'Antibody Optimization / Reports',
          status: 'saved',
        },
      ],
      discoveryCapabilityRuns,
    ),
  },
  {
    id: 'targetx-r1-lims-execution',
    title: 'Target-X R1 LIMS 实验执行',
    lastActivity: '5 分钟',
    transcript: limsTranscript,
    runInspector: runInspector(
      'Target-X R1 LIMS',
      [
        '接收候选包',
        '创建 LIMS/LISM 项目',
        '创建样本和条码',
        '锁定实验订单边界',
        '固化样本范围',
        '生成并审批板图',
        '派发工单和仪器排程',
        '回收结果包并校验 schema',
      ],
      [
        {
          id: 'targetx-lims-output-01',
          name: 'TargetX_R1_sample_manifest.xlsx',
          kind: 'dataset',
          location: 'Antibody Optimization / Execution',
          status: 'saved',
        },
        {
          id: 'targetx-lims-output-02',
          name: 'TargetX_R1_ResultBundle.xlsx',
          kind: 'dataset',
          location: 'Antibody Optimization / Results',
          status: 'completed',
        },
      ],
      limsCapabilityRuns,
    ),
  },
  {
    id: 'targetx-data-model-finetune',
    title: 'Target-X R1 数据回收与模型微调',
    lastActivity: '刚刚',
    transcript: modelTranscript,
    runInspector: runInspector(
      'Target-X model loop',
      [
        '回收 R1 结果包',
        '执行 schema 和单位检查',
        '标注异常和标签置信度',
        '完成多目标候选分层',
        '选择模型栈',
        '构建微调数据集',
        '完成 LoRA 微调',
        '生成 R2 候选并回写',
      ],
      [
        {
          id: 'targetx-model-output-01',
          name: 'ModelCard_FT-ABX-R1-IgBert-001.md',
          kind: 'report',
          location: 'Antibody Optimization / Reports',
          status: 'saved',
        },
        {
          id: 'targetx-model-output-02',
          name: 'R2_LIMS_Submission_Payload.json',
          kind: 'projectFile',
          location: 'Antibody Optimization / Execution',
          status: 'saved',
        },
      ],
      modelCapabilityRuns,
    ),
  },
]
