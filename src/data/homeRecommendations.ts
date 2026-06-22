import {
  homeTemplates,
  type HomeTemplate,
  type HomeTemplateTone,
} from './homeTemplates'
import {
  dataAssetRecords,
  experimentAssetRecords,
  fileAssetRecords,
  knowledgeBaseRecords,
  modelAssetRecords,
  xtrimoModelRecords,
} from './assetsMockData'
import { capabilityEntries } from './mockCapabilities'

export type RecommendationSection =
  | 'today-attention'
  | 'continue-work'
  | 'smart-suggestions'
  | 'starter-work'

export type RecommendationType =
  | 'thread'
  | 'asset'
  | 'approval-request'
  | 'experiment-return'
  | 'project-risk-signal'
  | 'agent-suggestion'
  | 'starter-work-item'

export type RecommendationPriority = 'high' | 'medium' | 'low'
export type RecommendationStatus =
  | 'needs-attention'
  | 'ready-to-continue'
  | 'suggested'
  | 'starter'

export type RecommendationSourceSurface =
  | 'thread'
  | 'assets-workbench'
  | 'approval-center'
  | 'run-inspector'
  | 'template-library'
  | 'external-feishu'

export type RecommendationSourceObjectType =
  | 'Thread'
  | 'Asset'
  | 'Approval Request'
  | 'Experiment Return'
  | 'Project'
  | 'Project Risk Signal'
  | 'Starter Work Item'

export type RecommendationAccent =
  | 'coral'
  | 'amber'
  | 'blue'
  | 'teal'
  | 'violet'
  | 'slate'

export type HomeRecommendationItem = {
  id: string
  section: RecommendationSection
  type: RecommendationType
  recommendationPriority: RecommendationPriority
  recommendationStatus: RecommendationStatus
  sourceStatus: string
  title: string
  summary: string
  reason: string
  sourceLabel: string
  sourceSurface: RecommendationSourceSurface
  sourceObjectType: RecommendationSourceObjectType
  relatedObject: string
  primaryActionLabel: string
  prompt: string
  accent: RecommendationAccent
  templateId?: string
}

export type StarterRecommendationItem = HomeRecommendationItem & {
  section: 'starter-work'
  type: 'starter-work-item'
  recommendationStatus: 'starter'
  templateId: string
}

export type StarterRecommendationGroup = {
  id: string
  title: string
  items: StarterRecommendationItem[]
}

export type HomeSignalTone = 'risk' | 'review' | 'approval' | 'asset'

export type HomeSignalItem = {
  id: string
  label: string
  value: string
  tone: HomeSignalTone
  targetId: string
  targetLabel: string
}

export type HomeInsightKind =
  | 'priority'
  | 'project-flow'
  | 'timeline'
  | 'asset-health'

export type HomeInsightEntry = {
  id: string
  label: string
  detail: string
  status: string
  tone: HomeSignalTone
  targetId: string
}

export type HomeInsightWidget = {
  id: string
  title: string
  kind: HomeInsightKind
  summary: string
  accent: RecommendationAccent
  primaryActionLabel: string
  prompt: string
  targetId: string
  entries: HomeInsightEntry[]
}

export type HomeRecommendationFeedKind =
  | 'continue-task'
  | 'new-task'
  | 'new-asset'
  | 'new-skill'

export type HomeRecommendationFeedTagLabel =
  | '继续任务'
  | '新任务'
  | '新资产'
  | '新 Skill'

export type HomeRecommendationFeedBodySection = {
  label: string
  value: string
}

export type HomeRecommendationFeedTarget = {
  projectId?: string
  threadId?: string
  assetId?: string
  skillId?: string
  relatedIds?: string[]
}

export type HomeRecommendationFeedCard = {
  id: string
  kind: HomeRecommendationFeedKind
  tagLabel: HomeRecommendationFeedTagLabel
  title: string
  subtitle: string
  posterVariant: string
  posterKicker: string
  posterTitle: string
  posterLines: string[]
  bodySections: HomeRecommendationFeedBodySection[]
  chips: string[]
  actionLabel: string
  prompt: string
  target: HomeRecommendationFeedTarget
}

export type HomeRecommendationAssetDetail = {
  id: string
  name: string
  sectionLabel: string
  kindLabel: string
  description: string
  metadata: HomeRecommendationFeedBodySection[]
  chips: string[]
}

export type HomeRecommendationSkillDetail = {
  id: string
  name: string
  description: string
  owner: string
  version: string
  tags: string[]
  metrics: HomeRecommendationFeedBodySection[]
  inputs: string[]
  outputs: string[]
  recentActivity: string[]
}

export const HOME_RECOMMENDATION_FEED_INITIAL_COUNT = 24
export const HOME_RECOMMENDATION_FEED_BATCH_COUNT = 24
export const HOME_RECOMMENDATION_FEED_MAX_COUNT = 240

export const homeRecommendationFeedBaseCards: HomeRecommendationFeedCard[] = [
  {
    id: 'home-feed-001-target-competitive-research',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '靶点竞品研究',
    subtitle: '梳理靶点价值、竞品布局与关键差异。',
    posterVariant: 'aqua-quote',
    posterKicker: 'Target Intel',
    posterTitle: 'EGFR 竞品图谱',
    posterLines: ['靶点机制', '抗体格局', '差异化机会'],
    bodySections: [
      { label: '目标', value: '输出 1 页竞品矩阵与机会假设' },
      { label: '重点', value: '亲和力、表位、适应症、开发阶段' },
    ],
    chips: ['靶点', '竞品', '项目启动'],
    actionLabel: '开始调研',
    prompt:
      '请为 EGFR 抗体项目做靶点与竞品调研，整理机制、已上市/在研抗体、亲和力/表位信息、适应症布局，并输出差异化机会矩阵。',
    target: { projectId: 'antibody-optimization' },
  },
  {
    id: 'home-feed-002-antibody-design',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '抗体研发设计',
    subtitle: '把靶点、表位、分子形式与开发约束转成候选设计策略。',
    posterVariant: 'violet-blueprint',
    posterKicker: 'Antibody Design',
    posterTitle: '亲和力再提升',
    posterLines: ['CDR 位点', '稳定性约束', '候选排序'],
    bodySections: [
      { label: '输入', value: '序列、结构线索、BLI/SPR 目标' },
      { label: '产出', value: '突变组合、风险标注、验证建议' },
    ],
    chips: ['抗体研发', '分子设计', '验证路径'],
    actionLabel: '生成方案',
    prompt:
      '请基于 HER2 抗体优化目标，设计一组提升亲和力且兼顾稳定性和可开发性的候选突变方案，并按验证优先级排序。',
    target: { projectId: 'antibody-optimization', skillId: 'skill-protein-design' },
  },
  {
    id: 'home-feed-003-workflow-orchestration',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '流程编排',
    subtitle: '把研发目标拆成可执行流程、关口与责任链。',
    posterVariant: 'green-flow',
    posterKicker: 'Workflow',
    posterTitle: '从模型到实验',
    posterLines: ['任务拆解', '节点编排', '结果回流'],
    bodySections: [
      { label: '场景', value: '酶突变库设计与筛选闭环' },
      { label: '交付', value: '流程节点、输入输出、失败分支' },
    ],
    chips: ['流程编排', '责任分工', '阶段门'],
    actionLabel: '搭建流程',
    prompt:
      '请为酶发现项目搭建 P0 流程，覆盖突变设计、合成下单、表达纯化、活性筛选、数据回流和下一轮设计，并列出每个节点的输入输出。',
    target: { projectId: 'pipeline-build' },
  },
  {
    id: 'home-feed-004-experiment-execution',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: '实验执行流程',
    subtitle: '把实验方案拆成样本、物料、步骤、质控与异常处理节点。',
    posterVariant: 'amber-ops',
    posterKicker: 'Wetlab Ops',
    posterTitle: '合成订单跑起来',
    posterLines: ['字段映射', '状态回传', '异常兜底'],
    bodySections: [
      { label: '当前进度', value: '已拆出合成下单与状态同步节点' },
      { label: '下一步', value: '确认 LIMS 字段、CRO 回传格式、重试策略' },
    ],
    chips: ['实验执行', 'LIMS', 'CRO 交接'],
    actionLabel: '继续推进',
    prompt:
      '请继续推进酶合成 LIMS 对接流程，补齐订单字段、状态同步、异常处理和 CRO 交接清单。',
    target: {
      projectId: 'enzyme-synthesis-ops',
      threadId: 'pipeline-build-lims-enzyme-synthesis',
    },
  },
  {
    id: 'home-feed-005-data-packaging',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: '数据打包',
    subtitle: '把分散的实验结果、字段说明、版本信息和使用约束整理成可复用数据资产包。',
    posterVariant: 'cyan-data',
    posterKicker: 'Data Asset',
    posterTitle: '候选分子一屏看',
    posterLines: ['序列清单', 'BLI 曲线', 'QC 标签'],
    bodySections: [
      { label: '资产', value: 'EGFR candidates 数据集' },
      { label: '可用于', value: '筛选排序、报告生成、下一轮设计' },
    ],
    chips: ['数据打包', 'AI 就绪', '资产交付'],
    actionLabel: '打开资产',
    prompt:
      '请分析 EGFR 候选分子数据资产，整理候选排序、关键实验读数和下一轮优化建议。',
    target: { assetId: 'data-egfr-candidates', projectId: 'data-assetization' },
  },
  {
    id: 'home-feed-006-model-tuning-loop',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '模型调优闭环',
    subtitle: '用实验回传、模型分歧和下一轮候选一次串起来。',
    posterVariant: 'blue-model',
    posterKicker: 'Model Loop',
    posterTitle: '调优闭环',
    posterLines: ['EGFR affinity head', '实验回传校准', '下一轮主动学习'],
    bodySections: [
      { label: '输入', value: 'BLI / SEC-HPLC / 候选排序' },
      { label: '产出', value: '调优记录 + 下一轮实验建议' },
    ],
    chips: ['模型调优', '主动学习', 'EGFR'],
    actionLabel: '生成闭环计划',
    prompt:
      '请帮我基于 EGFR 亲和力模型、实验回传和 SEC-HPLC QC 数据，设计一轮模型调优闭环，输出误差样本、调优动作、验证指标和下一轮实验建议。',
    target: {
      assetId: 'model-egfr-affinity-head',
      relatedIds: ['model-egfr-oracle', 'data-sec-hplc-qc'],
    },
  },
  {
    id: 'home-feed-007-feishu-doc-writing',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: '飞书文档写作',
    subtitle: '把分散的实验结论、风险点和下一步动作整理成可协作文档。',
    posterVariant: 'mint-document',
    posterKicker: 'Doc Writer',
    posterTitle: '复盘成稿',
    posterLines: ['结构化提纲', '结论先行', '可直接贴飞书'],
    bodySections: [
      { label: '适合', value: '周会前、评审前、交付前' },
      { label: '产出', value: '飞书文档初稿 + 待确认清单' },
    ],
    chips: ['飞书文档', '报告写作', '协作材料'],
    actionLabel: '查看 Skill',
    prompt:
      '请帮我把当前项目材料整理成飞书文档初稿，要求包含背景、关键结论、数据依据、风险点、待确认事项和下一步动作。',
    target: { skillId: 'skill-report', relatedIds: ['file-egfr-order-draft'] },
  },
  {
    id: 'home-feed-008-approval-material-pack',
    kind: 'new-task',
    tagLabel: '新任务',
    title: 'EGFR 审批材料包',
    subtitle: '把样本范围、交付物、风险说明和 SOP 依据合成审批包。',
    posterVariant: 'peach-approval',
    posterKicker: 'Approval Ready',
    posterTitle: '审批材料包',
    posterLines: ['订单草稿检查', 'SOP 对齐', '风险口径统一'],
    bodySections: [
      { label: '缺口', value: '交付边界与异常处理说明' },
      { label: '产出', value: '审批摘要、附件清单、补充问题' },
    ],
    chips: ['飞书审批', 'CRO 交接', '订单材料'],
    actionLabel: '整理审批包',
    prompt:
      '请帮我检查 EGFR CRO 订单草稿和 CRO 服务订单 SOP，整理飞书审批所需材料，列出样本范围、交付物、风险说明、附件清单和待补字段。',
    target: {
      projectId: 'antibody-optimization',
      relatedIds: ['file-egfr-order-draft', 'kb-cro-service-order-sop'],
      skillId: 'skill-cro-handoff',
    },
  },
  {
    id: 'home-feed-009-weekly-summary',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '项目周报和纪要',
    subtitle: '把本周实验回传、审批进展和资产沉淀合成一页可同步材料。',
    posterVariant: 'slate-weekly',
    posterKicker: 'Weekly Sync',
    posterTitle: '周报 / 纪要',
    posterLines: ['进展按项目归并', '风险按责任人落点', '动作按下周推进'],
    bodySections: [
      { label: '覆盖', value: 'EGFR、工业酶、数据资产' },
      { label: '产出', value: '周报正文 + 会议纪要框架' },
    ],
    chips: ['飞书周报', '会议纪要', '项目同步'],
    actionLabel: '生成周报',
    prompt:
      '请帮我生成本周项目周报和会议纪要摘要，按项目整理进展、关键数据、审批状态、风险阻塞、责任人和下周行动。',
    target: { projectId: 'pipeline-build', skillId: 'skill-report' },
  },
  {
    id: 'home-feed-010-data-quality-view',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: '数据资产质量视图',
    subtitle: '把生物制品目录和 SEC-HPLC QC 表连起来，先看哪些数据能复用。',
    posterVariant: 'green-data',
    posterKicker: 'Asset Health',
    posterTitle: '质量 / 复用',
    posterLines: ['字段完整度', 'QC 可追溯', '复用边界'],
    bodySections: [
      { label: '资产', value: 'Biologics Catalog + SEC-HPLC QC' },
      { label: '检查', value: '缺失字段、批次映射、附件状态' },
    ],
    chips: ['数据资产', '质量检查', '复用'],
    actionLabel: '打开资产',
    prompt:
      '请帮我检查生物制品目录和 SEC-HPLC QC 数据的资产质量，输出字段完整度、批次映射问题、附件缺口、复用风险和建议的数据资产沉淀方式。',
    target: {
      assetId: 'data-biologics-catalog',
      relatedIds: ['data-sec-hplc-qc'],
      skillId: 'skill-experiment-data',
    },
  },
  {
    id: 'home-feed-011-cdr-mutation-design',
    kind: 'new-task',
    tagLabel: '新任务',
    title: 'CDR 小库突变',
    subtitle: '围绕 CDR-H3 / CDR-L1 热点位点生成可复核的亲和力成熟方案。',
    posterVariant: 'rose-grid',
    posterKicker: 'CDR Mutation',
    posterTitle: 'EGFR 亲和力小库',
    posterLines: ['H3: Y102 / D104', 'L1: S31 / N33', '保留开发约束'],
    bodySections: [
      { label: '输入', value: 'EGFR 候选表 + parent baseline' },
      { label: '输出', value: '24-48 个突变组合、设计理由、排除位点' },
    ],
    chips: ['CDR-H3', '亲和力成熟', '48 variants'],
    actionLabel: '生成突变设计',
    prompt:
      '请基于 EGFR 候选表和抗体 developability 约束，设计一版 CDR 突变小库，输出候选组合、设计理由、风险标签和需要人工复核的位点。',
    target: {
      projectId: 'antibody-optimization',
      relatedIds: ['data-egfr-candidates', 'kb-antibody-developability-kg'],
      skillId: 'skill-protein-design',
    },
  },
  {
    id: 'home-feed-012-developability-review',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: 'EGFR 成药性审查',
    subtitle: '把 Top 候选的聚集、疏水 patch、PTM 和表达风险补成决策清单。',
    posterVariant: 'amber-sheet',
    posterKicker: 'Developability',
    posterTitle: 'Top 候选风险扫描',
    posterLines: ['Aggregation / PTM', 'Expression titer', '可缓解策略'],
    bodySections: [
      { label: '当前状态', value: '候选摘要已就绪，风险解释尚未统一口径' },
      { label: '下一步', value: '给 AF-14 / AF-21 / AF-38 打风险标签' },
    ],
    chips: ['成药性', '风险审查', 'EGFR'],
    actionLabel: '继续审查',
    prompt:
      '请继续审查 EGFR Top 候选的成药性风险，结合候选摘要和 developability 知识图谱，按聚集、疏水、PTM、表达、稳定性输出风险等级、证据和缓解建议。',
    target: {
      projectId: 'antibody-optimization',
      threadId: 'egfr-affinity',
      relatedIds: ['kb-antibody-developability-kg', 'file-egfr-candidate-summary'],
      skillId: 'skill-egfr-review',
    },
  },
  {
    id: 'home-feed-013-egfr-ranking-asset',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: 'EGFR 候选排序资产',
    subtitle: '把多目标评分、实验读数和人工复核结论整理成可复用排序表。',
    posterVariant: 'blue-rank',
    posterKicker: 'Candidate Ranking',
    posterTitle: 'Top 12 排序表',
    posterLines: ['KD / monomer%', 'Expression / risk', '推荐进入验证'],
    bodySections: [
      { label: '来源', value: 'EGFR_MOO_candidates_v3 与候选摘要文件' },
      { label: '用途', value: '下一轮实验设计和审批证据引用' },
    ],
    chips: ['排序表', 'MOO score', '决策资产'],
    actionLabel: '打开资产',
    prompt:
      '请把 EGFR 候选数据整理成候选排序资产，综合亲和力、纯度、表达、成药性风险和人工复核意见，输出 Top 12 排序表、推荐理由和证据引用字段。',
    target: {
      assetId: 'data-egfr-candidates',
      relatedIds: ['file-egfr-candidate-summary'],
    },
  },
  {
    id: 'home-feed-014-egfr-cro-order',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: 'EGFR CRO 下单草稿',
    subtitle: '把 BLI / SEC-HPLC 外包检测范围、样本边界和交付物写成可提交草稿。',
    posterVariant: 'teal-flow',
    posterKicker: 'CRO Handoff',
    posterTitle: '订单草稿待收口',
    posterLines: ['4 molecules', 'BLI KD + SEC-HPLC', 'SLA 5 business days'],
    bodySections: [
      { label: '当前草稿', value: 'BM-LAB-EGFR-20260528-001 Draft' },
      { label: '缺口', value: '样本浓度、复测条件、回传格式说明' },
    ],
    chips: ['CRO', '订单草稿', 'BLI KD'],
    actionLabel: '继续补订单',
    prompt:
      '请继续补完 EGFR CRO 下单草稿，基于订单草稿和 CRO tracking 对象，整理实验目的、样本清单、检测项目、交付物格式、SLA、风险点和提交前复核项。',
    target: {
      projectId: 'pipeline-build',
      threadId: 'egfr-affinity',
      relatedIds: ['experiment-egfr-order-draft', 'experiment-egfr-cro-order'],
      skillId: 'skill-cro-handoff',
    },
  },
  {
    id: 'home-feed-015-approval-evidence-skill',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: '审批证据包 Skill',
    subtitle: '把候选排序、成药性风险和 CRO 订单材料自动组装为审批前证据包。',
    posterVariant: 'violet-dossier',
    posterKicker: 'Approval Evidence',
    posterTitle: '证据包自动装配',
    posterLines: ['候选排序', '风险说明', '订单边界'],
    bodySections: [
      { label: '触发场景', value: '实验订单进入审批前检查' },
      { label: '输出', value: '审批摘要、证据索引、缺口清单' },
    ],
    chips: ['审批', '证据包', 'Skill'],
    actionLabel: '查看 Skill',
    prompt:
      '请起草一个审批证据包 Skill，用于 EGFR 抗体实验订单审批前自动汇总候选排序、成药性风险、CRO 下单边界和缺口清单，并给出触发条件、输入、输出和使用示例。',
    target: { skillId: 'skill-egfr-review', relatedIds: ['skill-cro-handoff'] },
  },
  {
    id: 'home-feed-016-lims-synthesis-flow',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: 'LIMS 酶合成执行流',
    subtitle: '输入确认、工单派发、QC gate 和结果包已串起来，适合继续收口异常与数据入库。',
    posterVariant: 'lims-flow',
    posterKicker: 'LIMS Run',
    posterTitle: '酶合成执行链路',
    posterLines: ['RUN-ENZ-SYN-20260604-001', 'QC gate + 数据入库', '异常样本保留 flag'],
    bodySections: [
      { label: '当前', value: '工单与 QC 节点已成型' },
      { label: '下一步', value: '补齐回调与验收口径' },
    ],
    chips: ['LIMS', '酶合成', 'QC gate'],
    actionLabel: '继续追踪',
    prompt:
      '请帮我继续推进 enzyme-synthesis-ops 的 LIMS 酶合成执行流，梳理当前节点、异常样本 flag、QC gate、数据入库和结果包交付的下一步动作。',
    target: {
      projectId: 'enzyme-synthesis-ops',
      threadId: 'pipeline-build-lims-enzyme-synthesis',
      skillId: 'skill-wetlab',
    },
  },
  {
    id: 'home-feed-017-fermentation-anomaly',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '发酵异常排查',
    subtitle: 'pH 漂移和产量波动需要把菌株、培养条件和取样记录对齐。',
    posterVariant: 'fermentation-alert',
    posterKicker: 'Fermentation',
    posterTitle: '批次异常待复核',
    posterLines: ['pH drift / OD lag', '2 个批次偏离窗口', '建议先做复测分流'],
    bodySections: [
      { label: '异常', value: 'pH 与 OD600 同步偏移' },
      { label: '输出', value: '复测与放行判断表' },
    ],
    chips: ['菌株', '发酵', '异常分级'],
    actionLabel: '生成排查清单',
    prompt:
      '请帮我为 enzyme-synthesis-ops 生成发酵异常排查清单，重点检查菌株批次、培养条件、pH、OD600、取样时间点、原始读数和复测分流建议。',
    target: {
      projectId: 'enzyme-synthesis-ops',
      relatedIds: ['experiment-recipe-expression'],
      skillId: 'skill-experiment-data',
    },
  },
  {
    id: 'home-feed-018-enzyme-activity-panel',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '工业酶活性筛选',
    subtitle: '把底物、pH、温度和阴性对照整理成首轮筛选方案。',
    posterVariant: 'activity-screen',
    posterKicker: 'Assay Panel',
    posterTitle: '24 个候选先筛活性',
    posterLines: ['substrate / pH / Tm', 'Oracle + Activity Head', '保留阴性对照'],
    bodySections: [
      { label: '对象', value: '候选酶与突变组合' },
      { label: '产物', value: '筛选矩阵和判定阈值' },
    ],
    chips: ['工业酶', '活性筛选', '底物谱'],
    actionLabel: '生成筛选面板',
    prompt:
      '请帮我为 enzyme-discovery 设计工业酶活性筛选面板，结合 model-enzyme-activity-head 和 model-enzyme-oracle，输出候选分组、底物条件、pH/温度范围、对照设置和判定阈值。',
    target: {
      projectId: 'enzyme-discovery',
      relatedIds: ['model-enzyme-activity-head', 'model-enzyme-oracle'],
      skillId: 'skill-experiment-data',
    },
  },
  {
    id: 'home-feed-019-enzyme-graphrag',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: '酶家族注释 GraphRAG',
    subtitle: '把序列簇、保守位点、底物谱、结构口袋和活性结果连成注释资产。',
    posterVariant: 'family-graph',
    posterKicker: 'Graph RAG',
    posterTitle: '酶家族功能注释',
    posterLines: ['family → residue → substrate', '结构口袋 + 活性证据', '解释候选排名'],
    bodySections: [
      { label: '来源', value: 'FASTA 与初筛活性表' },
      { label: '用途', value: '支撑突变设计解释' },
    ],
    chips: ['酶家族', 'GraphRAG', '证据追溯'],
    actionLabel: '打开资产',
    prompt:
      '请帮我补全 kb-enzyme-family-annotation-graphrag 的资产说明，围绕酶家族序列、结构口袋、底物谱、活性证据和候选排名解释，输出缺口清单和下一步构建计划。',
    target: {
      assetId: 'kb-enzyme-family-annotation-graphrag',
      relatedIds: ['data-biologics-catalog'],
    },
  },
  {
    id: 'home-feed-020-cro-handoff-skill',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: 'CRO 交接格式化',
    subtitle: '把实验草稿、样本要求、交付标准和外部分享复核点压成稳定交接模板。',
    posterVariant: 'cro-handoff',
    posterKicker: 'CRO Handoff',
    posterTitle: '外包交接一键成稿',
    posterLines: ['任务范围 / 样本清单', '交付物 / 时间表', '外部分享需复核'],
    bodySections: [
      { label: '输入', value: '实验草稿与接收方上下文' },
      { label: '输出', value: 'CRO 交接说明' },
    ],
    chips: ['CRO', '外包执行', '交接模板'],
    actionLabel: '查看 Skill',
    prompt:
      '请帮我基于 skill-cro-handoff 为 pipeline-build 配置 CRO/外包交接模板，覆盖任务范围、样本与物料、实验参数、交付标准、时间节点、待确认问题和外部分享复核点。',
    target: { skillId: 'skill-cro-handoff', projectId: 'pipeline-build' },
  },
  {
    id: 'home-feed-021-virtual-cell-perturb',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: '虚拟细胞扰动复盘',
    subtitle: '把单细胞扰动预测整理成下一轮可验证假设，而不是直接下结论。',
    posterVariant: 'cell-perturbation',
    posterKicker: 'Virtual Cell',
    posterTitle: '扰动响应草图',
    posterLines: ['基因扰动 x 细胞状态', '方向一致性检查', '候选假设待验证'],
    bodySections: [
      { label: '输入', value: 'scRNA 扰动矩阵、细胞亚群标注、目标通路' },
      { label: '边界', value: '用于假设排序，不替代实验结论' },
    ],
    chips: ['虚拟细胞', '单细胞扰动', '假设复盘'],
    actionLabel: '继续整理',
    prompt:
      '请基于 xTrimo Single Cell Perturb 的 demo 结果，整理单细胞扰动假设复盘，输出候选扰动、支持证据、风险点和下一步验证建议。',
    target: { assetId: 'xtrimo-single-cell-perturb' },
  },
  {
    id: 'home-feed-022-breeding-ranking',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '农业育种候选排序',
    subtitle: '把候选材料、性状观测和环境批次先组织成可讨论的筛选表。',
    posterVariant: 'breeding-field',
    posterKicker: 'Breeding',
    posterTitle: '候选材料初筛',
    posterLines: ['性状表现分层', '环境批次对齐', '优先级仅供讨论'],
    bodySections: [
      { label: '对象', value: '耐逆、产量或品质相关候选材料' },
      { label: '产物', value: '候选排序表、缺失字段清单、验证建议' },
    ],
    chips: ['农业育种', '候选排序', '数据对齐'],
    actionLabel: '生成筛选框架',
    prompt:
      '请帮我创建一个农业育种候选排序 demo 任务，先定义表型、批次、环境变量和候选材料字段，再输出一版可人工复核的筛选框架。',
    target: { skillId: 'skill-experiment-data' },
  },
  {
    id: 'home-feed-023-aav-viability-panel',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: 'AAV 可行性面板',
    subtitle: '把 capsid 候选的体外可行性信号整理成模型资产入口。',
    posterVariant: 'aav-panel',
    posterKicker: 'AAV Asset',
    posterTitle: 'Viability Panel',
    posterLines: ['候选 capsid 对照', '可行性分数草稿', '实验确认优先'],
    bodySections: [
      { label: '模型', value: 'xTrimo AAV Viability 与 AAV Oracle 对照' },
      { label: '注意', value: 'mock 评估信号，不代表真实递送表现' },
    ],
    chips: ['AAV', '模型资产', '候选对照'],
    actionLabel: '打开资产',
    prompt:
      '请整理一个 AAV capsid 可行性评估面板 demo，比较 xTrimo AAV Viability 和 AAV Oracle 的候选信号，列出可用字段、缺口和人工复核点。',
    target: { assetId: 'xtrimo-aav-viability', relatedIds: ['model-aav-oracle'] },
  },
  {
    id: 'home-feed-024-experiment-data-skill',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: '实验数据分析 Skill',
    subtitle: '把散落的实验表、结果包和 QC 标记转成结构化分析输入。',
    posterVariant: 'analysis-matrix',
    posterKicker: 'Data Skill',
    posterTitle: '实验数据整理器',
    posterLines: ['字段映射', 'QC 标记', '批次合并'],
    bodySections: [
      { label: '适合', value: 'ELN 表格、CSV 结果包、候选元数据' },
      { label: '能力', value: '字段字典、缺失值检查、批次合并建议' },
    ],
    chips: ['数据分析', 'QC', '字段映射'],
    actionLabel: '查看 Skill',
    prompt:
      '请用实验数据分析 Skill 帮我梳理一个结果包的数据结构，输出字段字典、QC 标记、缺失项、批次合并规则和后续分析建议。',
    target: { skillId: 'skill-experiment-data' },
  },
  {
    id: 'home-feed-025-structure-model-stack',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: '结构预测模型对照',
    subtitle: '把 xTrimo Fold、Boltz 和 RFdiffusion 的 demo 输出放到同一张复核卡里。',
    posterVariant: 'structure-stack',
    posterKicker: 'Structure',
    posterTitle: 'Fold 对照面板',
    posterLines: ['结构草图汇总', '置信区间标注', '设计输入待确认'],
    bodySections: [
      { label: '资产', value: '结构预测、生成式设计和候选构象对照记录' },
      { label: '用途', value: '为蛋白设计讨论提供可追溯模型输出' },
    ],
    chips: ['结构预测', '模型资产', 'RFdiffusion'],
    actionLabel: '打开资产',
    prompt:
      '请创建一个结构预测模型对照资产 demo，汇总 xTrimo Fold、Boltz 和 RFdiffusion 的输入、输出、置信标记、适用场景和需要人工复核的风险点。',
    target: {
      assetId: 'xtrimo-fold',
      relatedIds: ['model-boltz', 'model-rfdiffusion', 'skill-protein-design'],
    },
  },
  {
    id: 'home-feed-026-delivery-board',
    kind: 'continue-task',
    tagLabel: '继续任务',
    title: '项目交付看板',
    subtitle: '把 Thread 里的执行节点、负责人和交付物整理成飞书协作视图。',
    posterVariant: 'timeline-teal',
    posterKicker: '项目管理',
    posterTitle: '交付节点待对齐',
    posterLines: ['CRO 下单草稿', 'LIMS 字段映射', '飞书负责人同步'],
    bodySections: [
      { label: '当前状态', value: '流程到交付拆解阶段，缺里程碑和责任人映射' },
      { label: '推荐动作', value: '先生成项目看板，再同步飞书群确认' },
    ],
    chips: ['项目管理', '交付', '飞书协作'],
    actionLabel: '继续整理',
    prompt:
      '请继续推进 LIMS 酶合成项目交付看板，按里程碑、负责人、交付物、风险和飞书同步动作整理下一步计划。',
    target: {
      projectId: 'enzyme-synthesis-ops',
      threadId: 'pipeline-build-lims-enzyme-synthesis',
    },
  },
  {
    id: 'home-feed-027-egfr-risk-review',
    kind: 'new-task',
    tagLabel: '新任务',
    title: 'EGFR 订单风险复盘',
    subtitle: '订单草稿、实验排期和 CRO 目录信息已经具备，可以先拉出风险清单。',
    posterVariant: 'risk-amber',
    posterKicker: '风险',
    posterTitle: '订单边界需要锁定',
    posterLines: ['样本范围', '外包窗口', '验收口径'],
    bodySections: [
      { label: '输入资产', value: '订单草稿 + 实验排期 + CRO 服务目录' },
      { label: '输出建议', value: '审批前风险表，标明影响、责任人和截止时间' },
    ],
    chips: ['风险检查', 'EGFR', '交付物'],
    actionLabel: '生成风险清单',
    prompt:
      '请基于 EGFR 订单草稿、实验排期和 CRO 服务目录，生成审批前交付风险清单，包含风险点、影响、负责人、补充材料和建议处理顺序。',
    target: {
      projectId: 'antibody-optimization',
      relatedIds: ['file-egfr-order-draft', 'experiment-egfr-schedule', 'file-public-cro-catalog'],
    },
  },
  {
    id: 'home-feed-028-cro-sop-kb',
    kind: 'new-asset',
    tagLabel: '新资产',
    title: 'CRO 下单 SOP 知识库',
    subtitle: '把服务目录、订单草稿和历史交接口径合并成可复用知识库资产。',
    posterVariant: 'kb-blueprint',
    posterKicker: '知识库',
    posterTitle: 'CRO SOP 可复用',
    posterLines: ['下单字段', '验收标准', '交接模板'],
    bodySections: [
      { label: '资产来源', value: 'CRO 服务目录与 EGFR 订单草稿' },
      { label: '复用价值', value: '下单前检查字段、附件和验收边界' },
    ],
    chips: ['知识库资产', 'SOP', 'CRO'],
    actionLabel: '打开资产',
    prompt:
      '请创建一份 CRO 下单与验收 SOP 知识库草稿，整合服务目录和订单草稿，按下单字段、附件要求、验收标准、风险提示和飞书交接话术组织。',
    target: { assetId: 'kb-cro-service-order-sop' },
  },
  {
    id: 'home-feed-029-feishu-weekly-sync',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '飞书项目周同步',
    subtitle: '把项目进度、风险、交付物和待决策项压缩成一页可发群摘要。',
    posterVariant: 'collab-coral',
    posterKicker: '飞书协作',
    posterTitle: '周同步缺一版摘要',
    posterLines: ['项目进度', '风险阻塞', '待确认事项'],
    bodySections: [
      { label: '覆盖范围', value: 'EGFR、工业酶和 LIMS 酶合成三个工作流' },
      { label: '适合发送', value: '飞书群消息版 + 文档版' },
    ],
    chips: ['飞书', '项目周报', '协作'],
    actionLabel: '生成同步摘要',
    prompt:
      '请帮我整理一版飞书项目周同步材料，覆盖 EGFR、工业酶和 LIMS 酶合成项目，按进度、风险、交付物、待决策项和需要 @ 的责任人输出。',
    target: { projectId: 'pipeline-build', skillId: 'skill-report' },
  },
  {
    id: 'home-feed-030-cro-delivery-skill',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: 'CRO 交付包 Skill',
    subtitle: '当前材料适合交给 Skill 做结构化交付，避免飞书沟通口径分散。',
    posterVariant: 'skill-violet',
    posterKicker: '交付',
    posterTitle: '一键生成交接包',
    posterLines: ['任务说明', '验收标准', '飞书消息'],
    bodySections: [
      { label: '推荐 Skill', value: '把订单、SOP 和排期打包成交接材料' },
      { label: '交付结果', value: 'CRO 任务说明、验收清单和飞书话术' },
    ],
    chips: ['新 Skill', 'CRO 交接', '文档交付'],
    actionLabel: '查看 Skill',
    prompt:
      '请使用 CRO 交接思路，基于订单草稿、实验排期和 SOP，生成一套交付包：任务说明、样本与附件清单、验收标准、风险提示和飞书同步消息。',
    target: { skillId: 'skill-cro-handoff' },
  },
  {
    id: 'home-feed-031-low-priority-explore',
    kind: 'new-task',
    tagLabel: '新任务',
    title: '低优先级探索清单',
    subtitle: '把暂时不紧急但可能有价值的想法收束成轻量探索任务。',
    posterVariant: 'soft-note',
    posterKicker: 'Explore',
    posterTitle: '先收进备选池',
    posterLines: ['不用今天处理', '保留背景和触发条件', '下次复盘再看'],
    bodySections: [
      { label: '适合', value: '不确定价值、缺少输入、暂不影响主线的想法' },
      { label: '输出', value: '探索问题、需要补的数据、触发推进条件' },
    ],
    chips: ['其他', '探索', '低优先级'],
    actionLabel: '生成探索清单',
    prompt:
      '请帮我把当前暂不紧急的研发想法整理成低优先级探索清单，按问题、需要补充的数据、触发推进条件和暂不处理理由组织。',
    target: { projectId: 'pipeline-build' },
  },
  {
    id: 'home-feed-032-skill-discovery',
    kind: 'new-skill',
    tagLabel: '新 Skill',
    title: '发现可复用 Skill',
    subtitle: '当推荐信号不足时，低存在感地提示可复用的能力，而不是塞满任务。',
    posterVariant: 'quiet-skill',
    posterKicker: 'Discovery',
    posterTitle: '有个 Skill 可复用',
    posterLines: ['报告撰写', '审批材料', 'CRO 交接'],
    bodySections: [
      { label: '用途', value: '把重复材料整理成稳定输入输出' },
      { label: '边界', value: '仅提示可复用能力，不自动创建任务' },
    ],
    chips: ['Skill', '发现', '兜底'],
    actionLabel: '查看 Skill',
    prompt:
      '请帮我梳理当前项目中哪些重复工作适合沉淀成 Skill，并按触发条件、输入、输出和复用价值排序。',
    target: { skillId: 'skill-report' },
  },
]

export function getHomeRecommendationFeedCards(
  requestedCount = HOME_RECOMMENDATION_FEED_INITIAL_COUNT,
): HomeRecommendationFeedCard[] {
  const count = Math.max(
    0,
    Math.min(requestedCount, HOME_RECOMMENDATION_FEED_MAX_COUNT),
  )

  return Array.from({ length: count }, (_, index) => {
    if (index < homeRecommendationFeedBaseCards.length) {
      return homeRecommendationFeedBaseCards[index]
    }

    return createDerivedFeedCard(index)
  })
}

export function getHomeRecommendationFeedHasMore(currentCount: number) {
  return currentCount < HOME_RECOMMENDATION_FEED_MAX_COUNT
}

export function getHomeRecommendationAssetDetail(
  assetId: string,
): HomeRecommendationAssetDetail | undefined {
  return getRecommendationAssetCatalog().find((asset) => asset.id === assetId)
}

export function getHomeRecommendationSkillDetail(
  skillId: string,
): HomeRecommendationSkillDetail | undefined {
  const entry = capabilityEntries.find(
    (candidate) => candidate.kind === 'skill' && candidate.id === skillId,
  )

  if (!entry) {
    return undefined
  }

  return {
    id: entry.id,
    name: entry.name,
    description: entry.description,
    owner: entry.owner,
    version: entry.version,
    tags: entry.tags,
    metrics: entry.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
    })),
    inputs: entry.interface.inputs,
    outputs: entry.interface.outputs,
    recentActivity: entry.recentActivity,
  }
}

function createDerivedFeedCard(index: number): HomeRecommendationFeedCard {
  const baseIndex = index % homeRecommendationFeedBaseCards.length
  const round = Math.floor(index / homeRecommendationFeedBaseCards.length) + 1
  const base = homeRecommendationFeedBaseCards[baseIndex]

  return {
    ...base,
    id: `${base.id}-r${round}`,
    subtitle: `${base.subtitle} · 第 ${round} 批推荐`,
    posterKicker: `${base.posterKicker} · R${round}`,
  }
}

function getRecommendationAssetCatalog(): HomeRecommendationAssetDetail[] {
  return [
    ...fileAssetRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: '文件资产',
      kindLabel: record.kind,
      description: record.description,
      metadata: [
        { label: '范围', value: record.scope === 'project' ? '项目范围' : '公开范围' },
        { label: '负责人', value: record.owner },
        { label: '更新时间', value: record.modifiedAt },
        { label: '状态', value: record.status },
      ],
      chips: [record.kind, record.scope, record.fileSpaceKind],
    })),
    ...dataAssetRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: '数据资产',
      kindLabel: record.category,
      description: record.description,
      metadata: [
        { label: '范围', value: record.scope === 'project' ? '项目范围' : '公开范围' },
        { label: '负责人', value: record.owner },
        { label: '行数', value: record.rows },
        { label: '更新时间', value: record.updatedAt },
      ],
      chips: ['数据集', record.category, record.scope],
    })),
    ...knowledgeBaseRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: '知识库',
      kindLabel: record.kind,
      description: record.description,
      metadata: [
        { label: '范围', value: record.scope === 'project' ? '项目范围' : '公开范围' },
        { label: '负责人', value: record.owner },
        { label: '状态', value: record.status },
        { label: '更新时间', value: record.updatedAt },
      ],
      chips: ['知识库', record.kind, record.status],
    })),
    ...experimentAssetRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: '实验资产',
      kindLabel: record.kind,
      description: record.description,
      metadata: [
        { label: '范围', value: record.scope === 'project' ? '项目范围' : '公开范围' },
        { label: '负责人', value: record.owner },
        { label: '状态', value: record.status },
        { label: '更新时间', value: record.updatedAt },
      ],
      chips: ['实验', record.category, record.kind],
    })),
    ...xtrimoModelRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: 'xTrimo 模型',
      kindLabel: record.callability,
      description: record.agentUse,
      metadata: [
        { label: '版本', value: record.version },
        { label: '状态', value: record.status === 'online' ? '在线' : '预览' },
        { label: '输入', value: record.input },
        { label: '输出', value: record.output },
      ],
      chips: [...record.capabilities.slice(0, 3), ...record.entities.slice(0, 1)],
    })),
    ...modelAssetRecords.map((record) => ({
      id: record.id,
      name: record.name,
      sectionLabel: '模型资产',
      kindLabel: record.category,
      description: record.description,
      metadata: [
        { label: '范围', value: record.scope === 'project' ? '项目范围' : '公开范围' },
        { label: '负责人', value: record.owner },
        { label: '状态', value: record.status },
        { label: '更新时间', value: record.updatedAt },
      ],
      chips: ['模型', record.category, record.status],
    })),
  ]
}

export const homeRecommendationSignals: HomeSignalItem[] = [
  {
    id: 'home-signal-risk',
    label: '风险',
    value: '3',
    tone: 'risk',
    targetId: 'home-insight-project-flow',
    targetLabel: '项目流转风险',
  },
  {
    id: 'home-signal-review',
    label: '待复核',
    value: '2',
    tone: 'review',
    targetId: 'home-insight-timeline',
    targetLabel: '回传时间线待复核',
  },
  {
    id: 'home-signal-approval',
    label: '审批',
    value: '1',
    tone: 'approval',
    targetId: 'home-insight-priority',
    targetLabel: '今日优先级审批',
  },
  {
    id: 'home-signal-asset',
    label: '资产',
    value: '78%',
    tone: 'asset',
    targetId: 'home-insight-asset-health',
    targetLabel: '资产健康度',
  },
]

export const homeRecommendationInsights: HomeInsightWidget[] = [
  {
    id: 'home-insight-priority',
    title: '今日优先级',
    kind: 'priority',
    summary: '高优先级实验回传和审批检查需要先完成，避免影响下一轮排序。',
    accent: 'blue',
    primaryActionLabel: '生成今日行动清单',
    prompt:
      '请帮我整理今日推荐事项的优先级，按风险、复核、审批和资产缺口输出行动清单。',
    targetId: 'home-insight-priority',
    entries: [
      {
        id: 'home-insight-priority-her2-review',
        label: 'HER2 BLI 复核',
        detail: '2 个候选曲线 QC 标记不一致，下一轮排序前需确认。',
        status: '需要今天复核',
        tone: 'review',
        targetId: 'home-insight-timeline',
      },
      {
        id: 'home-insight-priority-egfr-approval',
        label: 'EGFR 审批检查',
        detail: '样本范围和外包检测窗口缺少交付物边界说明。',
        status: '审批材料待补齐',
        tone: 'approval',
        targetId: 'home-insight-priority',
      },
    ],
  },
  {
    id: 'home-insight-project-flow',
    title: '项目流转',
    kind: 'project-flow',
    summary: 'HER2、EGFR 和工业酶项目分别处在复核、审批和 CRO 交接节点。',
    accent: 'teal',
    primaryActionLabel: '梳理流转阻塞',
    prompt:
      '请帮我梳理当前项目流转状态，标出 HER2、EGFR 和工业酶项目的阻塞点、责任人和下一步。',
    targetId: 'home-insight-project-flow',
    entries: [
      {
        id: 'home-insight-flow-her2',
        label: 'HER2',
        detail: '实验结果已回传，等待复核后进入候选排序。',
        status: '复核中',
        tone: 'review',
        targetId: 'continue-her2-candidate-design',
      },
      {
        id: 'home-insight-flow-enzyme',
        label: '工业酶',
        detail: 'CRO 下单草稿前仍缺工艺约束、命名和验收指标。',
        status: '交接风险',
        tone: 'risk',
        targetId: 'continue-enzyme-workflow-execution',
      },
    ],
  },
  {
    id: 'home-insight-timeline',
    title: '回传时间线',
    kind: 'timeline',
    summary: '近期实验回传集中在 HER2 BLI 和 EGFR SEC-HPLC，可先沉淀复盘材料。',
    accent: 'violet',
    primaryActionLabel: '生成回传摘要',
    prompt:
      '请帮我按时间线整理近期实验回传，说明每个结果包的状态、质量问题和建议动作。',
    targetId: 'home-insight-timeline',
    entries: [
      {
        id: 'home-insight-timeline-her2',
        label: '今天 10:42',
        detail: 'HER2 BLI 复测回传，HER2-AB-07 与 HER2-AB-11 待复核。',
        status: '已回传',
        tone: 'review',
        targetId: 'continue-her2-candidate-design',
      },
      {
        id: 'home-insight-timeline-egfr',
        label: '结果包草稿',
        detail: 'EGFR SEC-HPLC 图谱和候选表已导入，等待批次合并说明。',
        status: '待整理',
        tone: 'asset',
        targetId: 'continue-egfr-sec-hplc-organization',
      },
    ],
  },
  {
    id: 'home-insight-asset-health',
    title: '资产健康度',
    kind: 'asset-health',
    summary: 'AI-Ready Dataset 和结果包草稿已有可复用基础，但附件与字段仍需补齐。',
    accent: 'amber',
    primaryActionLabel: '检查资产缺口',
    prompt:
      '请帮我检查当前推荐资产的健康度，列出缺失附件、字段映射、复用风险和补齐步骤。',
    targetId: 'home-insight-asset-health',
    entries: [
      {
        id: 'home-insight-asset-her2-dataset',
        label: 'HER2 Dataset',
        detail: '缺少 2 份原始曲线附件和样本批次映射字段。',
        status: '质量缺口',
        tone: 'asset',
        targetId: 'home-insight-asset-health',
      },
      {
        id: 'home-insight-asset-ai-ready',
        label: 'AI-Ready Dataset',
        detail: '建议合并曲线、QC 标记和候选元数据形成可复用资产。',
        status: '建议沉淀',
        tone: 'asset',
        targetId: 'suggest-her2-ai-ready-dataset',
      },
    ],
  },
]

const todayAttention: HomeRecommendationItem[] = [
  {
    id: 'today-her2-bli-return-review',
    section: 'today-attention',
    type: 'experiment-return',
    recommendationPriority: 'high',
    recommendationStatus: 'needs-attention',
    sourceStatus: 'BLI 结果已返回，2 个候选曲线需要人工复核',
    title: 'HER2 BLI 结果需要复核',
    summary: 'HER2-AB-07 与 HER2-AB-11 的结合曲线出现高置信信号，但 QC 标记不一致。',
    reason: '实验结果已回传，下一轮候选排序前需要确认曲线拟合和异常点处理口径。',
    sourceLabel: 'Run Inspector / HER2 BLI 复测',
    sourceSurface: 'run-inspector',
    sourceObjectType: 'Experiment Return',
    relatedObject: 'HER2 抗体湿实验执行 Thread',
    primaryActionLabel: '生成复核摘要',
    prompt:
      '请帮我整理 HER2 BLI 返回结果的复核摘要，重点比较 HER2-AB-07 和 HER2-AB-11 的曲线质量、异常点、QC 标记和下一轮候选排序影响。',
    accent: 'blue',
  },
  {
    id: 'today-egfr-approval-risk-check',
    section: 'today-attention',
    type: 'approval-request',
    recommendationPriority: 'high',
    recommendationStatus: 'needs-attention',
    sourceStatus: '审批待补充风险说明',
    title: 'EGFR 实验订单审批需补齐风险点',
    summary: '订单包含新增样本范围和外包检测窗口，审批材料缺少交付物边界说明。',
    reason: '审批请求已到达风险检查节点，适合先让 Agent 生成检查清单再提交判断。',
    sourceLabel: 'Approval Center / EGFR CRO 订单',
    sourceSurface: 'approval-center',
    sourceObjectType: 'Approval Request',
    relatedObject: 'EGFR 抗体亲和力优化项目',
    primaryActionLabel: '生成审批检查清单',
    prompt:
      '请帮我整理 EGFR 订单审批需要关注的风险点，重点检查样本范围、交付物、时间窗口和责任人是否完整。',
    accent: 'amber',
  },
  {
    id: 'today-enzyme-cro-handoff-gap',
    section: 'today-attention',
    type: 'project-risk-signal',
    recommendationPriority: 'medium',
    recommendationStatus: 'needs-attention',
    sourceStatus: '交接信息缺口 3 项',
    title: '工业酶项目缺少 CRO 交接信息',
    summary: '工艺约束、样本批次命名和验收指标尚未同步到外包执行清单。',
    reason: '项目即将进入 CRO 协作阶段，缺口不处理会影响下单草稿和执行追踪。',
    sourceLabel: 'Project Risk / 工业酶稳定性改造',
    sourceSurface: 'external-feishu',
    sourceObjectType: 'Project Risk Signal',
    relatedObject: '工业酶全流程项目',
    primaryActionLabel: '整理风险点',
    prompt:
      '请帮我整理工业酶项目 CRO 交接前的风险点，重点列出工艺约束、样本批次命名、验收指标和责任人缺口。',
    accent: 'coral',
  },
  {
    id: 'today-dataset-package-quality-gap',
    section: 'today-attention',
    type: 'asset',
    recommendationPriority: 'medium',
    recommendationStatus: 'needs-attention',
    sourceStatus: '数据集复用前质量缺口待确认',
    title: 'HER2 数据集复用前有质量缺口',
    summary: 'AI-Ready Dataset 缺少 2 份原始曲线附件和一列样本批次映射。',
    reason: '资产已进入可复用准备阶段，补齐缺口后可用于模型复盘和下一轮设计。',
    sourceLabel: 'Assets Workbench / HER2 BLI Dataset',
    sourceSurface: 'assets-workbench',
    sourceObjectType: 'Asset',
    relatedObject: 'HER2 Post-analysis 结果包',
    primaryActionLabel: '整理数据集缺口',
    prompt:
      '请帮我整理 HER2 BLI 数据集复用前的质量缺口，列出缺失附件、样本批次映射问题、影响范围和建议补齐步骤。',
    accent: 'teal',
  },
]

const continueWork: HomeRecommendationItem[] = [
  {
    id: 'continue-her2-candidate-design',
    section: 'continue-work',
    type: 'thread',
    recommendationPriority: 'medium',
    recommendationStatus: 'ready-to-continue',
    sourceStatus: 'Thread 最近更新于今天 10:42',
    title: '继续 HER2 抗体候选设计',
    summary: '上一轮已完成候选聚类和初步 QC，可以继续推进排序表和下一轮假设。',
    reason: '已有实验返回和候选证据，适合回到 Thread 继续形成设计决策。',
    sourceLabel: 'Thread / HER2 抗体候选设计',
    sourceSurface: 'thread',
    sourceObjectType: 'Thread',
    relatedObject: 'HER2 抗体湿实验执行 Thread',
    primaryActionLabel: '帮我继续推进',
    prompt:
      '请帮我继续推进 HER2 抗体候选设计，基于已有候选聚类、BLI 结果和 QC 信息，整理下一轮候选排序和实验建议。',
    accent: 'blue',
  },
  {
    id: 'continue-enzyme-workflow-execution',
    section: 'continue-work',
    type: 'thread',
    recommendationPriority: 'medium',
    recommendationStatus: 'ready-to-continue',
    sourceStatus: '流程执行到 CRO 下单草稿',
    title: '继续工业酶流程执行',
    summary: '突变库设计已形成，下一步需要把执行步骤转成可检查的外包任务。',
    reason: '当前 Thread 已有设计输入和流程节点，可以继续生成执行材料。',
    sourceLabel: 'Thread / 工业酶稳定性改造',
    sourceSurface: 'thread',
    sourceObjectType: 'Thread',
    relatedObject: '工业酶全流程项目',
    primaryActionLabel: '起草下一步计划',
    prompt:
      '请帮我继续推进工业酶流程执行，基于突变库设计和当前流程节点，起草 CRO 下单前的下一步计划和检查项。',
    accent: 'teal',
  },
  {
    id: 'continue-egfr-sec-hplc-organization',
    section: 'continue-work',
    type: 'asset',
    recommendationPriority: 'low',
    recommendationStatus: 'ready-to-continue',
    sourceStatus: '结果包草稿已生成',
    title: '继续整理 EGFR SEC-HPLC 结果',
    summary: 'SEC-HPLC 图谱和候选表已导入，等待按样本批次合并说明。',
    reason: '已有资产草稿，适合补齐结果说明并准备复盘输出。',
    sourceLabel: 'Assets Workbench / EGFR SEC-HPLC',
    sourceSurface: 'assets-workbench',
    sourceObjectType: 'Asset',
    relatedObject: 'EGFR 结果整理工作流',
    primaryActionLabel: '整理结果说明',
    prompt:
      '请帮我继续整理 EGFR SEC-HPLC 结果，按样本批次合并图谱、候选表和异常说明，形成可复盘的结果摘要。',
    accent: 'slate',
  },
]

const smartSuggestions: HomeRecommendationItem[] = [
  {
    id: 'suggest-her2-ai-ready-dataset',
    section: 'smart-suggestions',
    type: 'agent-suggestion',
    recommendationPriority: 'medium',
    recommendationStatus: 'suggested',
    sourceStatus: 'Agent 建议',
    title: '把 HER2 结果整理成 AI-Ready Dataset',
    summary: '将实验曲线、QC 标记和候选元数据合并成后续模型可读的数据资产。',
    reason: 'HER2 实验结果已回传，当前最适合沉淀成可复用资产，避免后续复盘遗漏上下文。',
    sourceLabel: 'Agent Suggestion / HER2 Post-analysis',
    sourceSurface: 'assets-workbench',
    sourceObjectType: 'Asset',
    relatedObject: 'HER2 BLI Dataset',
    primaryActionLabel: '生成整理计划',
    prompt:
      '请帮我把 HER2 实验结果整理成 AI-Ready Dataset，规划字段结构、附件清单、QC 标记、候选元数据和复用说明。',
    accent: 'violet',
  },
  {
    id: 'suggest-egfr-ranking-table',
    section: 'smart-suggestions',
    type: 'agent-suggestion',
    recommendationPriority: 'low',
    recommendationStatus: 'suggested',
    sourceStatus: 'Agent 建议',
    title: '生成 EGFR 下一轮候选排序表',
    summary: '基于亲和力、表达、纯度和风险说明，先生成一版可讨论的排序表。',
    reason: 'EGFR 项目已有多源结果，排序表能帮助审批和下一轮实验设计对齐。',
    sourceLabel: 'Agent Suggestion / EGFR 候选复盘',
    sourceSurface: 'thread',
    sourceObjectType: 'Thread',
    relatedObject: 'EGFR 抗体亲和力优化 Thread',
    primaryActionLabel: '生成候选排序表',
    prompt:
      '请帮我生成 EGFR 下一轮候选排序表，综合亲和力、表达、纯度、样本风险和推荐理由，输出可讨论的初版排序。',
    accent: 'blue',
  },
]

const templatesById = new Map<string, HomeTemplate>(
  homeTemplates.map((template) => [template.id, template]),
)

const templateToneToRecommendationAccent: Record<
  HomeTemplateTone,
  RecommendationAccent
> = {
  cyan: 'blue',
  blue: 'blue',
  teal: 'teal',
  violet: 'violet',
  amber: 'amber',
}

type StarterItemConfig = {
  id: string
  templateId: string
  group: string
  accent?: RecommendationAccent
}

function requireTemplate(templateId: string): HomeTemplate {
  const template = templatesById.get(templateId)

  if (!template) {
    throw new Error(`Missing starter source template: ${templateId}`)
  }

  return template
}

function starterItem({
  id,
  templateId,
  group,
  accent,
}: StarterItemConfig): StarterRecommendationItem {
  const template = requireTemplate(templateId)

  return {
    id,
    section: 'starter-work',
    type: 'starter-work-item',
    recommendationPriority: 'low',
    recommendationStatus: 'starter',
    sourceStatus: '',
    title: template.title,
    summary: template.summary,
    reason: '',
    sourceLabel: `Template Library / ${group}`,
    sourceSurface: 'template-library',
    sourceObjectType: 'Starter Work Item',
    relatedObject: template.title,
    primaryActionLabel: '使用模板',
    prompt: template.prompt,
    accent: accent ?? templateToneToRecommendationAccent[template.tone],
    templateId: template.id,
  }
}

const starterItems: StarterRecommendationItem[] = [
  starterItem({
    id: 'starter-target-competitor-research',
    templateId: 'home-template-001',
    group: '调研设计',
  }),
  starterItem({
    id: 'starter-antibody-candidate-design',
    templateId: 'home-template-102',
    group: '调研设计',
  }),
  starterItem({
    id: 'starter-experiment-plan-design',
    templateId: 'home-template-003',
    group: '调研设计',
  }),
  starterItem({
    id: 'starter-experiment-workflow-execution',
    templateId: 'home-template-103',
    group: '实验执行',
  }),
  starterItem({
    id: 'starter-cro-order-draft',
    templateId: 'home-template-086',
    group: '实验执行',
  }),
  starterItem({
    id: 'starter-approval-materials',
    templateId: 'home-template-091',
    group: '实验执行',
  }),
  starterItem({
    id: 'starter-biological-data-analysis',
    templateId: 'home-template-014',
    group: '数据与模型',
  }),
  starterItem({
    id: 'starter-ai-ready-dataset',
    templateId: 'home-template-076',
    group: '数据与模型',
  }),
  starterItem({
    id: 'starter-model-tuning-suggestion',
    templateId: 'home-template-104',
    group: '数据与模型',
  }),
  starterItem({
    id: 'starter-workflow-orchestration',
    templateId: 'home-template-101',
    group: '项目协同',
  }),
  starterItem({
    id: 'starter-feishu-doc-writing',
    templateId: 'home-template-105',
    group: '项目协同',
  }),
  starterItem({
    id: 'starter-project-weekly-report',
    templateId: 'home-template-056',
    group: '项目协同',
  }),
]

export const starterRecommendationGroups: StarterRecommendationGroup[] = [
  { id: 'research-design', title: '调研设计', items: starterItems.slice(0, 3) },
  { id: 'experiment-execution', title: '实验执行', items: starterItems.slice(3, 6) },
  { id: 'data-model', title: '数据与模型', items: starterItems.slice(6, 9) },
  { id: 'project-collaboration', title: '项目协同', items: starterItems.slice(9, 12) },
]

export const homeRecommendationSections = {
  todayAttention,
  continueWork,
  smartSuggestions,
}

export const homeRecommendations: HomeRecommendationItem[] = [
  ...todayAttention,
  ...continueWork,
  ...smartSuggestions,
  ...starterItems,
].map((item) => ({ ...item, templateId: item.templateId }))
