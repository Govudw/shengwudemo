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

export type StarterRecommendationGroup = {
  id: string
  title: string
  items: HomeRecommendationItem[]
}

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

function starterItem(
  id: string,
  templateId: string,
  title: string,
  summary: string,
  primaryActionLabel: string,
  prompt: string,
  group: string,
  accent: RecommendationAccent,
): HomeRecommendationItem {
  return {
    id,
    section: 'starter-work',
    type: 'starter-work-item',
    recommendationPriority: 'low',
    recommendationStatus: 'starter',
    sourceStatus: '',
    title,
    summary,
    reason: '',
    sourceLabel: `Template Library / ${group}`,
    sourceSurface: 'template-library',
    sourceObjectType: 'Starter Work Item',
    relatedObject: '',
    primaryActionLabel,
    prompt,
    accent,
    templateId,
  }
}

const starterItems: HomeRecommendationItem[] = [
  starterItem(
    'starter-target-competitor-research',
    'home-template-001',
    '靶点与竞品调研',
    '快速整理靶点背景、竞品管线、风险和可验证假设。',
    '生成调研框架',
    '请帮我启动靶点与竞品调研，整理靶点机制、竞品管线、差异化机会、主要风险和下一步验证问题。',
    '调研设计',
    'violet',
  ),
  starterItem(
    'starter-antibody-candidate-design',
    'home-template-102',
    '抗体候选设计',
    '生成候选设计策略、证据维度和初步实验验证路径。',
    '起草设计策略',
    '请帮我启动抗体候选设计，整理候选生成策略、关键评价维度、结构或序列证据和初步实验验证路径。',
    '调研设计',
    'blue',
  ),
  starterItem(
    'starter-experiment-plan-design',
    'home-template-003',
    '实验方案设计',
    '把研究目标转成实验分组、样本、指标和验收口径。',
    '设计实验方案',
    '请帮我设计实验方案，围绕研究目标整理实验分组、样本范围、关键指标、对照设置、验收标准和风险预案。',
    '调研设计',
    'teal',
  ),
  starterItem(
    'starter-experiment-workflow-execution',
    'home-template-103',
    '实验流程执行',
    '拆解实验执行步骤、输入输出、检查点和责任分工。',
    '拆解执行步骤',
    '请帮我启动实验流程执行，拆解实验步骤、输入输出、关键检查点、责任分工和需要提前确认的风险。',
    '实验执行',
    'teal',
  ),
  starterItem(
    'starter-cro-order-draft',
    'home-template-030',
    'CRO 下单草稿',
    '生成外包下单所需的样本、交付物、时间窗口和验收要求。',
    '起草下单材料',
    '请帮我起草 CRO 下单材料，整理样本范围、实验内容、交付物、时间窗口、验收标准和双方责任人。',
    '实验执行',
    'amber',
  ),
  starterItem(
    'starter-approval-materials',
    'home-template-036',
    '审批材料整理',
    '把审批背景、风险点、预算和交付物整理成可提交版本。',
    '整理审批材料',
    '请帮我整理审批材料，归纳审批背景、必要性、预算范围、交付物、关键风险和需要审批人判断的问题。',
    '实验执行',
    'amber',
  ),
  starterItem(
    'starter-biological-data-analysis',
    'home-template-015',
    '生物数据分析',
    '规划数据清洗、统计比较、异常识别和结论表达。',
    '规划分析路径',
    '请帮我规划生物数据分析路径，整理数据清洗、分组比较、异常识别、统计方法、关键图表和结论表达方式。',
    '数据与模型',
    'blue',
  ),
  starterItem(
    'starter-ai-ready-dataset',
    'home-template-076',
    'AI-Ready Dataset 整理',
    '定义字段、附件、质量标记和资产复用说明。',
    '定义数据结构',
    '请帮我整理 AI-Ready Dataset，定义字段结构、附件清单、质量标记、数据来源、复用边界和后续模型使用说明。',
    '数据与模型',
    'violet',
  ),
  starterItem(
    'starter-model-tuning-suggestion',
    'home-template-006',
    '模型调优建议',
    '基于任务目标生成模型选择、输入特征和评估指标建议。',
    '生成调优建议',
    '请帮我生成模型调优建议，围绕当前任务目标整理模型选择、输入特征、训练数据要求、评估指标和迭代策略。',
    '数据与模型',
    'slate',
  ),
  starterItem(
    'starter-workflow-orchestration',
    'home-template-101',
    '流程编排',
    '把跨系统研发任务拆成节点、依赖、输入输出和检查点。',
    '编排流程节点',
    '请帮我编排研发流程，拆解任务节点、上下游依赖、输入输出、人工检查点、系统交互和风险控制。',
    '项目协同',
    'teal',
  ),
  starterItem(
    'starter-feishu-doc-writing',
    'home-template-025',
    '飞书文档写作',
    '生成适合团队协作的文档结构、章节和待补充问题。',
    '起草文档结构',
    '请帮我起草飞书文档结构，围绕当前协作目标整理章节、关键结论、数据或附件引用、待确认问题和行动项。',
    '项目协同',
    'slate',
  ),
  starterItem(
    'starter-project-weekly-report',
    'home-template-056',
    '项目周报生成',
    '汇总本周进展、风险、下周计划和需要协同的事项。',
    '生成周报草稿',
    '请帮我生成项目周报草稿，汇总本周进展、关键结果、风险与阻塞、下周计划和需要团队协同的事项。',
    '项目协同',
    'violet',
  ),
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
