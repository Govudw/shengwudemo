export type ApprovalCenterSectionId =
  | 'overview'
  | 'pending'
  | 'initiated'
  | 'records'
  | 'rules'
  | 'flows'
  | 'groups'
  | 'external'
  | 'audit'
  | 'simulator'

export type ApprovalStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'withdrawn'
  | 'voided'

export type ApprovalSyncStatus =
  | 'notApplicable'
  | 'submitPending'
  | 'submitted'
  | 'submitFailed'
  | 'callbackPending'
  | 'callbackFailed'
  | 'withdrawRequested'
  | 'withdrawFailed'
  | 'synced'

export type ApprovalRoute = 'builtIn' | 'external'
export type ApprovalScope = 'organization' | 'project'
export type AuditCompleteness = 'result-level' | 'node-level' | 'complete'

export type ApprovalOperationType =
  | 'submitExperimentOrder'
  | 'startLimsRun'
  | 'publishAiReadyDataset'
  | 'publishKnowledgeBase'
  | 'publishOracleOrModel'
  | 'releaseExternalResultPackage'
  | 'createCroOrder'
  | 'modifyPublicRecipeOrSop'
  | 'deleteKeyAsset'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ApprovalCenterSection = {
  id: ApprovalCenterSectionId
  label: string
}

export type ApprovalStage = {
  id: string
  name: string
  approverSource:
    | 'fixedUsers'
    | 'approverGroup'
    | 'projectRole'
    | 'orgRole'
    | 'manager'
    | 'assetOwner'
    | 'experimentOwner'
  approverLabel: string
  approvalMode: 'any' | 'all'
  timeoutPolicy: 'remindOnly' | 'escalate' | 'expire'
  canRequestSupplement: boolean
  canDelegate: boolean
}

export type ApprovalFlow = {
  id: string
  name: string
  scope: ApprovalScope
  version: string
  status: 'draft' | 'published' | 'disabled'
  stages: ApprovalStage[]
}

export type ApproverGroup = {
  id: string
  name: string
  scope: ApprovalScope
  members: string[]
  owner: string
  usedByFlowIds: string[]
  status: 'active' | 'disabled'
}

export type ExternalApprovalConnector = {
  id: string
  name: string
  provider: 'wecom' | 'feishu' | 'dingtalk' | 'webhook' | 'custom'
  status: 'healthy' | 'warning' | 'disabled'
  externalFlowKey: string
  submissionEndpoint: string
  callbackEndpoint: string
  withdrawEndpoint: string
  retryPolicy: string
  authenticationLabel: string
  lastSyncStatus: ApprovalSyncStatus
  lastSyncAt: string
  auditCompleteness: AuditCompleteness
  blackBoxDescription: string
}

export type ApprovalRule = {
  id: string
  name: string
  scope: ApprovalScope
  projectId?: string
  operationType: ApprovalOperationType
  conditionSummary: string
  route: ApprovalRoute
  flowId?: string
  connectorId?: string
  evidenceTemplateId: string
  priority: number
  enabled: boolean
  version: string
  updatedAt: string
}

export type ApprovalRequest = {
  id: string
  title: string
  operationType: ApprovalOperationType
  status: ApprovalStatus
  syncStatus: ApprovalSyncStatus
  route: ApprovalRoute
  projectId: string
  projectName: string
  initiator: string
  currentAssigneeLabel: string
  currentNode: string
  ruleVersion: string
  flowVersion?: string
  connectorId?: string
  connectorName?: string
  evidencePackageId: string
  auditCompleteness: AuditCompleteness
  riskLevel: RiskLevel
  dueAt?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  resultLabel: string
}

export type ApprovalAuditEvent = {
  id: string
  time: string
  actor: string
  eventType:
    | 'ruleCreated'
    | 'ruleUpdated'
    | 'flowPublished'
    | 'requestCreated'
    | 'requestAssigned'
    | 'approved'
    | 'rejected'
    | 'expired'
    | 'withdrawRequested'
    | 'externalSubmitted'
    | 'externalCallbackReceived'
    | 'externalCallbackFailed'
  targetObject: string
  beforeSummary?: string
  afterSummary: string
  source: 'UI' | 'Agent' | 'API' | 'externalCallback'
}

export type ApprovalNotificationType =
  | 'approval_requested'
  | 'approval_approved'
  | 'approval_rejected'
  | 'approval_expired'
  | 'approval_withdraw_requested'
  | 'approval_withdrawn'
  | 'approval_sync_failed'

export type ApprovalNotification = {
  id: string
  type: ApprovalNotificationType
  approvalRequestId: string
  operationType: ApprovalOperationType
  projectName: string
  actor: string
  target: string
  createdAt: string
  read: boolean
  deepLink: {
    surface: 'approvalCenter' | 'thread' | 'runInspector'
    section?: ApprovalCenterSectionId
    targetId?: string
  }
}

export type ApprovalOverviewMetric = {
  id: string
  label: string
  value: number
  tone: 'neutral' | 'warning' | 'danger' | 'success'
  helper: string
}

export type ApprovalSimulationInput = {
  operationType: ApprovalOperationType
  projectId?: string
  assetType?: string
  riskLevel?: RiskLevel
  externalVendor?: string
  amount?: number
  scope?: ApprovalScope
}

export type ApprovalSimulationResult = {
  matchedRule: ApprovalRule | null
  matchedRuleName: string
  route: ApprovalRoute | 'none'
  flowName?: string
  flowStages?: ApprovalStage[]
  connectorName?: string
  connector?: ExternalApprovalConnector
  evidenceTemplateId?: string
  expectedPendingApprovers: string[]
}

export const approvalCenterSections: ApprovalCenterSection[] = [
  { id: 'overview', label: '总览' },
  { id: 'pending', label: '待处理' },
  { id: 'initiated', label: '我发起的' },
  { id: 'records', label: '审批记录' },
  { id: 'rules', label: '操作规则' },
  { id: 'flows', label: '审批流程' },
  { id: 'groups', label: '审批人组' },
  { id: 'external', label: '外部审批' },
  { id: 'audit', label: '审计日志' },
  { id: 'simulator', label: '模拟测试' },
]

export const operationTypeLabels: Record<ApprovalOperationType, string> = {
  submitExperimentOrder: '提交实验订单',
  startLimsRun: '启动 LIMS 执行',
  publishAiReadyDataset: '发布 AI-Ready Dataset 到公开范围',
  publishKnowledgeBase: '发布知识库到公开范围',
  publishOracleOrModel: '发布 Oracle / Model',
  releaseExternalResultPackage: '发布外部结果包',
  createCroOrder: '创建外部 CRO 订单',
  modifyPublicRecipeOrSop: '修改公共配方 / SOP',
  deleteKeyAsset: '删除关键资产',
}

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  draft: '草稿',
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
  expired: '已过期',
  withdrawn: '已撤回',
  voided: '已作废',
}

export const approvalSyncStatusLabels: Record<ApprovalSyncStatus, string> = {
  notApplicable: '无需同步',
  submitPending: '提交中',
  submitted: '已提交外部系统',
  submitFailed: '提交失败',
  callbackPending: '等待回调',
  callbackFailed: '回调异常',
  withdrawRequested: '撤回中',
  withdrawFailed: '撤回失败',
  synced: '已同步',
}

export const routeLabels: Record<ApprovalRoute, string> = {
  builtIn: 'BioMap 内置审批',
  external: '外部审批',
}

export const riskLevelLabels: Record<RiskLevel, string> = {
  low: '低',
  medium: '中',
  high: '高',
  critical: '关键',
}

export const approverGroups: ApproverGroup[] = [
  {
    id: 'group-antibody-program-leads',
    name: 'Antibody Program Leads',
    scope: 'project',
    members: ['zhengjun', 'ABot-智能助手', 'Research Lead'],
    owner: 'zhengjun',
    usedByFlowIds: ['flow-experiment-order-standard'],
    status: 'active',
  },
  {
    id: 'group-wet-lab-ops',
    name: 'Wet Lab Operations Leads',
    scope: 'organization',
    members: ['LabOps', 'Wet Lab Lead'],
    owner: 'LabOps',
    usedByFlowIds: ['flow-experiment-order-standard'],
    status: 'active',
  },
  {
    id: 'group-data-governance',
    name: 'Data Governance Reviewers',
    scope: 'organization',
    members: ['Data Agent', 'Data Steward'],
    owner: 'Data Governance',
    usedByFlowIds: ['flow-public-asset-release'],
    status: 'active',
  },
  {
    id: 'group-model-governance',
    name: 'Model Governance Reviewers',
    scope: 'organization',
    members: ['Model Team', 'Platform Ops'],
    owner: 'Model Governance',
    usedByFlowIds: ['flow-model-release'],
    status: 'active',
  },
  {
    id: 'group-public-asset-steward',
    name: 'Public Asset Steward',
    scope: 'organization',
    members: ['Organization Admin', 'Asset Steward'],
    owner: 'Organization Admin',
    usedByFlowIds: ['flow-key-asset-delete'],
    status: 'active',
  },
]

export const approvalFlows: ApprovalFlow[] = [
  {
    id: 'flow-experiment-order-standard',
    name: '实验订单标准审批',
    scope: 'project',
    version: 'v1.3',
    status: 'published',
    stages: [
      {
        id: 'stage-experiment-owner',
        name: 'Experiment Owner 复核',
        approverSource: 'experimentOwner',
        approverLabel: 'Experiment Owner',
        approvalMode: 'any',
        timeoutPolicy: 'remindOnly',
        canRequestSupplement: true,
        canDelegate: true,
      },
      {
        id: 'stage-wet-lab-lead',
        name: 'Wet Lab Operations Lead 审批',
        approverSource: 'approverGroup',
        approverLabel: 'Wet Lab Operations Leads',
        approvalMode: 'any',
        timeoutPolicy: 'escalate',
        canRequestSupplement: true,
        canDelegate: true,
      },
    ],
  },
  {
    id: 'flow-public-asset-release',
    name: '公共资产发布审批',
    scope: 'organization',
    version: 'v2.1',
    status: 'published',
    stages: [
      {
        id: 'stage-asset-owner',
        name: 'Asset Owner 确认资料包',
        approverSource: 'assetOwner',
        approverLabel: 'Asset Owner',
        approvalMode: 'any',
        timeoutPolicy: 'remindOnly',
        canRequestSupplement: true,
        canDelegate: true,
      },
      {
        id: 'stage-data-governance',
        name: 'Data Governance Reviewers 审批',
        approverSource: 'approverGroup',
        approverLabel: 'Data Governance Reviewers',
        approvalMode: 'all',
        timeoutPolicy: 'expire',
        canRequestSupplement: true,
        canDelegate: false,
      },
    ],
  },
  {
    id: 'flow-model-release',
    name: '模型发布审批',
    scope: 'organization',
    version: 'v1.7',
    status: 'published',
    stages: [
      {
        id: 'stage-model-owner',
        name: 'Model Owner 复核',
        approverSource: 'assetOwner',
        approverLabel: 'Model Owner',
        approvalMode: 'any',
        timeoutPolicy: 'remindOnly',
        canRequestSupplement: true,
        canDelegate: true,
      },
      {
        id: 'stage-model-governance',
        name: 'Model Governance Reviewers 审批',
        approverSource: 'approverGroup',
        approverLabel: 'Model Governance Reviewers',
        approvalMode: 'all',
        timeoutPolicy: 'expire',
        canRequestSupplement: true,
        canDelegate: false,
      },
    ],
  },
  {
    id: 'flow-key-asset-delete',
    name: '关键资产删除审批',
    scope: 'organization',
    version: 'v1.2',
    status: 'published',
    stages: [
      {
        id: 'stage-project-admin',
        name: 'Project Admin 审批',
        approverSource: 'projectRole',
        approverLabel: 'Project Admin',
        approvalMode: 'any',
        timeoutPolicy: 'escalate',
        canRequestSupplement: true,
        canDelegate: true,
      },
      {
        id: 'stage-org-admin',
        name: 'Organization Admin 审批',
        approverSource: 'orgRole',
        approverLabel: 'Organization Admin',
        approvalMode: 'any',
        timeoutPolicy: 'expire',
        canRequestSupplement: false,
        canDelegate: false,
      },
    ],
  },
]

export const externalApprovalConnectors: ExternalApprovalConnector[] = [
  {
    id: 'connector-wecom-cro',
    name: '企业微信 CRO 审批流',
    provider: 'wecom',
    status: 'healthy',
    externalFlowKey: 'WECOM-CRO-ORDER-V3',
    submissionEndpoint: 'https://approval.example.com/wecom/cro/submit',
    callbackEndpoint: 'https://biomap.example.com/approval/callback/wecom',
    withdrawEndpoint: 'https://approval.example.com/wecom/cro/withdraw',
    retryPolicy: '指数退避，最多 5 次',
    authenticationLabel: '企业微信审批应用凭证',
    lastSyncStatus: 'synced',
    lastSyncAt: '2026-06-15T15:30:00+08:00',
    auditCompleteness: 'node-level',
    blackBoxDescription:
      '外部系统拥有自己的流程、节点和处理人，BioMap 只记录提交、回调、撤回和审计完整度元数据。',
  },
  {
    id: 'connector-feishu-publication',
    name: '飞书审批集成',
    provider: 'feishu',
    status: 'warning',
    externalFlowKey: 'FEISHU-PUBLICATION-REVIEW',
    submissionEndpoint: 'https://approval.example.com/feishu/submit',
    callbackEndpoint: 'https://biomap.example.com/approval/callback/feishu',
    withdrawEndpoint: 'https://approval.example.com/feishu/withdraw',
    retryPolicy: '固定间隔 10 分钟，最多 3 次',
    authenticationLabel: '飞书应用机器人 Token',
    lastSyncStatus: 'callbackFailed',
    lastSyncAt: '2026-06-15T14:48:00+08:00',
    auditCompleteness: 'result-level',
    blackBoxDescription:
      '外部审批在飞书内完成，BioMap 不展开外部节点，只展示结果级回调状态。',
  },
  {
    id: 'connector-http-custom',
    name: 'Custom HTTP Approval',
    provider: 'custom',
    status: 'disabled',
    externalFlowKey: 'CUSTOM-HTTP-COMPLETE-AUDIT',
    submissionEndpoint: 'https://approval.example.com/custom/submit',
    callbackEndpoint: 'https://biomap.example.com/approval/callback/custom',
    withdrawEndpoint: 'https://approval.example.com/custom/withdraw',
    retryPolicy: '由外部系统控制',
    authenticationLabel: 'HTTP 签名密钥',
    lastSyncStatus: 'notApplicable',
    lastSyncAt: '2026-06-10T11:00:00+08:00',
    auditCompleteness: 'complete',
    blackBoxDescription:
      '启用后可接收完整审计字段，但外部流程仍作为黑盒连接器呈现。',
  },
]

export const approvalRules: ApprovalRule[] = [
  {
    id: 'rule-egfr-experiment-order',
    name: '实验订单提交审批',
    scope: 'project',
    projectId: 'antibody-optimization',
    operationType: 'submitExperimentOrder',
    conditionSummary: 'EGFR / HER2 / IL-17A 抗体项目的湿实验订单提交',
    route: 'builtIn',
    flowId: 'flow-experiment-order-standard',
    evidenceTemplateId: 'template-experiment-order',
    priority: 90,
    enabled: true,
    version: 'v4',
    updatedAt: '2026-06-15T09:00:00+08:00',
  },
  {
    id: 'rule-public-dataset',
    name: '公共数据集发布审批',
    scope: 'organization',
    operationType: 'publishAiReadyDataset',
    conditionSummary: '发布 AI-Ready Dataset 到公开范围',
    route: 'builtIn',
    flowId: 'flow-public-asset-release',
    evidenceTemplateId: 'template-ai-ready-dataset',
    priority: 70,
    enabled: true,
    version: 'v2',
    updatedAt: '2026-06-14T18:30:00+08:00',
  },
  {
    id: 'rule-public-kb',
    name: '公共知识库发布审批',
    scope: 'organization',
    operationType: 'publishKnowledgeBase',
    conditionSummary: 'RAG / 知识图谱 / GraphRAG 知识库发布到公开范围',
    route: 'builtIn',
    flowId: 'flow-public-asset-release',
    evidenceTemplateId: 'template-knowledge-base',
    priority: 75,
    enabled: true,
    version: 'v3',
    updatedAt: '2026-06-13T16:40:00+08:00',
  },
  {
    id: 'rule-cro-order-enterprise',
    name: 'CRO 订单企业审批',
    scope: 'organization',
    operationType: 'createCroOrder',
    conditionSummary: '创建外部 CRO 订单或预算超过 20,000 CNY',
    route: 'external',
    connectorId: 'connector-wecom-cro',
    evidenceTemplateId: 'template-cro-order',
    priority: 95,
    enabled: true,
    version: 'v5',
    updatedAt: '2026-06-15T10:20:00+08:00',
  },
  {
    id: 'rule-public-recipe-sop',
    name: '公共 SOP / 配方修改审批',
    scope: 'organization',
    operationType: 'modifyPublicRecipeOrSop',
    conditionSummary: '修改公共配方 / SOP 并影响已有实验模板',
    route: 'builtIn',
    flowId: 'flow-public-asset-release',
    evidenceTemplateId: 'template-public-sop-recipe',
    priority: 80,
    enabled: true,
    version: 'v2',
    updatedAt: '2026-06-12T13:10:00+08:00',
  },
  {
    id: 'rule-key-asset-delete',
    name: '关键资产删除审批',
    scope: 'organization',
    operationType: 'deleteKeyAsset',
    conditionSummary: '删除关键数据集、模型、知识库或历史结果包',
    route: 'builtIn',
    flowId: 'flow-key-asset-delete',
    evidenceTemplateId: 'template-key-asset-delete',
    priority: 100,
    enabled: true,
    version: 'v1',
    updatedAt: '2026-06-11T12:00:00+08:00',
  },
  {
    id: 'rule-legacy-candidate-dataset-external-delete',
    name: '旧候选数据集外部删除审批',
    scope: 'organization',
    operationType: 'deleteKeyAsset',
    conditionSummary: '删除历史候选数据集且需要外部企业审批留痕',
    route: 'external',
    connectorId: 'connector-feishu-publication',
    evidenceTemplateId: 'template-key-asset-delete',
    priority: 105,
    enabled: true,
    version: 'v1',
    updatedAt: '2026-06-15T13:00:00+08:00',
  },
  {
    id: 'rule-model-release',
    name: '模型发布审批',
    scope: 'organization',
    operationType: 'publishOracleOrModel',
    conditionSummary: '发布 Oracle / Model 到组织可见范围',
    route: 'builtIn',
    flowId: 'flow-model-release',
    evidenceTemplateId: 'template-model-release',
    priority: 85,
    enabled: true,
    version: 'v2',
    updatedAt: '2026-06-13T17:20:00+08:00',
  },
  {
    id: 'rule-external-result-release',
    name: '外部结果包发布审批',
    scope: 'organization',
    operationType: 'releaseExternalResultPackage',
    conditionSummary: '发布外部 CRO 或合作方结果包',
    route: 'external',
    connectorId: 'connector-feishu-publication',
    evidenceTemplateId: 'template-external-result-package',
    priority: 88,
    enabled: true,
    version: 'v1',
    updatedAt: '2026-06-15T14:00:00+08:00',
  },
]

export const approvalRecords: ApprovalRequest[] = [
  {
    id: 'BM-APR-20260615-001',
    title: 'EGFR Top 3 wet-lab Experiment Order approval',
    operationType: 'submitExperimentOrder',
    status: 'approved',
    syncStatus: 'notApplicable',
    route: 'builtIn',
    projectId: 'antibody-optimization',
    projectName: 'Antibody Optimization',
    initiator: 'ABot-智能助手',
    currentAssigneeLabel: 'Wet Lab Operations Leads',
    currentNode: '已完成',
    ruleVersion: '实验订单提交审批 v4',
    flowVersion: '实验订单标准审批 v1.3',
    evidencePackageId: 'AEP-EGFR-ORDER-20260615-001',
    auditCompleteness: 'complete',
    riskLevel: 'high',
    dueAt: '2026-06-15T18:00:00+08:00',
    createdAt: '2026-06-15T09:18:00+08:00',
    updatedAt: '2026-06-15T10:22:00+08:00',
    completedAt: '2026-06-15T10:22:00+08:00',
    resultLabel: '通过',
  },
  {
    id: 'BM-APR-20260615-002',
    title: 'Publish EGFR GraphRAG KnowledgeBase to public scope',
    operationType: 'publishKnowledgeBase',
    status: 'pending',
    syncStatus: 'notApplicable',
    route: 'builtIn',
    projectId: 'antibody-optimization',
    projectName: 'Antibody Optimization',
    initiator: 'Data Agent',
    currentAssigneeLabel: 'Data Governance Reviewers',
    currentNode: 'Data Governance Reviewers 审批',
    ruleVersion: '公共知识库发布审批 v3',
    flowVersion: '公共资产发布审批 v2.1',
    evidencePackageId: 'AEP-EGFR-KB-20260615-002',
    auditCompleteness: 'complete',
    riskLevel: 'high',
    dueAt: '2026-06-16T11:00:00+08:00',
    createdAt: '2026-06-15T10:40:00+08:00',
    updatedAt: '2026-06-15T13:35:00+08:00',
    resultLabel: '待审批',
  },
  {
    id: 'BM-APR-20260615-003',
    title: 'Create external CRO order for SEC-HPLC assay',
    operationType: 'createCroOrder',
    status: 'pending',
    syncStatus: 'submitted',
    route: 'external',
    projectId: 'antibody-optimization',
    projectName: 'Antibody Optimization',
    initiator: 'ABot-智能助手',
    currentAssigneeLabel: '企业微信 CRO 审批流',
    currentNode: '外部系统处理中',
    ruleVersion: 'CRO 订单企业审批 v5',
    connectorId: 'connector-wecom-cro',
    connectorName: '企业微信 CRO 审批流',
    evidencePackageId: 'AEP-CRO-ORDER-20260615-003',
    auditCompleteness: 'node-level',
    riskLevel: 'high',
    dueAt: '2026-06-15T20:00:00+08:00',
    createdAt: '2026-06-15T11:30:00+08:00',
    updatedAt: '2026-06-15T15:10:00+08:00',
    resultLabel: '待审批',
  },
  {
    id: 'BM-APR-20260615-004',
    title: 'Publish xTrimoAbAffinity_DDG project model',
    operationType: 'publishOracleOrModel',
    status: 'rejected',
    syncStatus: 'notApplicable',
    route: 'builtIn',
    projectId: 'model-to-oracle',
    projectName: 'Model-to-Oracle',
    initiator: 'Model Team',
    currentAssigneeLabel: 'Model Governance Reviewers',
    currentNode: '已完成',
    ruleVersion: '模型发布审批 v2',
    flowVersion: '模型发布审批 v1.7',
    evidencePackageId: 'AEP-MODEL-20260615-004',
    auditCompleteness: 'complete',
    riskLevel: 'critical',
    dueAt: '2026-06-15T14:00:00+08:00',
    createdAt: '2026-06-15T08:45:00+08:00',
    updatedAt: '2026-06-15T12:05:00+08:00',
    completedAt: '2026-06-15T12:05:00+08:00',
    resultLabel: '驳回',
  },
  {
    id: 'BM-APR-20260615-005',
    title: 'Modify public BLI KD recipe',
    operationType: 'modifyPublicRecipeOrSop',
    status: 'expired',
    syncStatus: 'notApplicable',
    route: 'builtIn',
    projectId: 'antibody-optimization',
    projectName: 'Antibody Optimization',
    initiator: 'LabOps',
    currentAssigneeLabel: 'Data Governance Reviewers',
    currentNode: '已过期',
    ruleVersion: '公共 SOP / 配方修改审批 v2',
    flowVersion: '公共资产发布审批 v2.1',
    evidencePackageId: 'AEP-BLI-RECIPE-20260615-005',
    auditCompleteness: 'complete',
    riskLevel: 'medium',
    dueAt: '2026-06-15T12:30:00+08:00',
    createdAt: '2026-06-14T16:20:00+08:00',
    updatedAt: '2026-06-15T12:31:00+08:00',
    completedAt: '2026-06-15T12:31:00+08:00',
    resultLabel: '过期',
  },
  {
    id: 'BM-APR-20260615-006',
    title: 'Delete old candidate dataset',
    operationType: 'deleteKeyAsset',
    status: 'pending',
    syncStatus: 'withdrawRequested',
    route: 'external',
    projectId: 'data-assetization',
    projectName: 'Data Assetization',
    initiator: 'zhengjun',
    currentAssigneeLabel: '飞书审批集成',
    currentNode: '撤回中',
    ruleVersion: '旧候选数据集外部删除审批 v1',
    connectorId: 'connector-feishu-publication',
    connectorName: '飞书审批集成',
    evidencePackageId: 'AEP-DATASET-DELETE-20260615-006',
    auditCompleteness: 'result-level',
    riskLevel: 'critical',
    dueAt: '2026-06-15T19:00:00+08:00',
    createdAt: '2026-06-15T13:15:00+08:00',
    updatedAt: '2026-06-15T14:42:00+08:00',
    resultLabel: '撤回中',
  },
  {
    id: 'BM-APR-20260615-007',
    title: 'External enterprise approval callback failure for CRO result release',
    operationType: 'releaseExternalResultPackage',
    status: 'pending',
    syncStatus: 'callbackFailed',
    route: 'external',
    projectId: 'antibody-optimization',
    projectName: 'Antibody Optimization',
    initiator: 'ABot-智能助手',
    currentAssigneeLabel: '飞书审批集成',
    currentNode: '回调异常',
    ruleVersion: '外部结果包发布审批 v1',
    connectorId: 'connector-feishu-publication',
    connectorName: '飞书审批集成',
    evidencePackageId: 'AEP-CRO-RESULT-20260615-007',
    auditCompleteness: 'result-level',
    riskLevel: 'high',
    dueAt: '2026-06-15T17:30:00+08:00',
    createdAt: '2026-06-15T14:05:00+08:00',
    updatedAt: '2026-06-15T14:48:00+08:00',
    resultLabel: '待审批',
  },
]

export const approvalAuditEvents: ApprovalAuditEvent[] = [
  {
    id: 'audit-20260615-001',
    time: '2026-06-15T09:18:00+08:00',
    actor: 'ABot-智能助手',
    eventType: 'requestCreated',
    targetObject: 'BM-APR-20260615-001',
    afterSummary: '创建 EGFR Top 3 wet-lab Experiment Order 审批资料包',
    source: 'Agent',
  },
  {
    id: 'audit-20260615-002',
    time: '2026-06-15T10:22:00+08:00',
    actor: 'Wet Lab Lead',
    eventType: 'approved',
    targetObject: 'BM-APR-20260615-001',
    afterSummary: '通过实验订单标准审批',
    source: 'UI',
  },
  {
    id: 'audit-20260615-003',
    time: '2026-06-15T11:31:00+08:00',
    actor: 'BioMap Approval Connector',
    eventType: 'externalSubmitted',
    targetObject: 'BM-APR-20260615-003',
    afterSummary: '企业微信 CRO 审批流已接受外部审批请求',
    source: 'API',
  },
  {
    id: 'audit-20260615-004',
    time: '2026-06-15T14:42:00+08:00',
    actor: 'zhengjun',
    eventType: 'withdrawRequested',
    targetObject: 'BM-APR-20260615-006',
    afterSummary: '已向外部系统发送撤回通知，等待确认',
    source: 'UI',
  },
  {
    id: 'audit-20260615-005',
    time: '2026-06-15T14:48:00+08:00',
    actor: '飞书审批集成',
    eventType: 'externalCallbackFailed',
    targetObject: 'BM-APR-20260615-007',
    beforeSummary: '等待回调',
    afterSummary: '外部回调缺少有效签名，审批状态保持待审批',
    source: 'externalCallback',
  },
]

export const approvalNotifications: ApprovalNotification[] = [
  {
    id: 'approval-notification-001',
    type: 'approval_requested',
    approvalRequestId: 'BM-APR-20260615-002',
    operationType: 'publishKnowledgeBase',
    projectName: 'Antibody Optimization',
    actor: 'Data Agent',
    target: 'Data Governance Reviewers',
    createdAt: '2026-06-15T10:40:00+08:00',
    read: false,
    deepLink: {
      surface: 'approvalCenter',
      section: 'pending',
      targetId: 'BM-APR-20260615-002',
    },
  },
  {
    id: 'approval-notification-002',
    type: 'approval_sync_failed',
    approvalRequestId: 'BM-APR-20260615-007',
    operationType: 'releaseExternalResultPackage',
    projectName: 'Antibody Optimization',
    actor: '飞书审批集成',
    target: 'Organization admin',
    createdAt: '2026-06-15T14:48:00+08:00',
    read: false,
    deepLink: {
      surface: 'approvalCenter',
      section: 'external',
      targetId: 'BM-APR-20260615-007',
    },
  },
  {
    id: 'approval-notification-003',
    type: 'approval_approved',
    approvalRequestId: 'BM-APR-20260615-001',
    operationType: 'submitExperimentOrder',
    projectName: 'Antibody Optimization',
    actor: 'Wet Lab Lead',
    target: 'ABot-智能助手',
    createdAt: '2026-06-15T10:22:00+08:00',
    read: true,
    deepLink: {
      surface: 'runInspector',
      targetId: 'RUN-EGFR-20260615-001',
    },
  },
]

const immutableStatuses = new Set<ApprovalStatus>([
  'approved',
  'rejected',
  'expired',
  'withdrawn',
  'voided',
])

const syncFailureStatuses = new Set<ApprovalSyncStatus>([
  'submitFailed',
  'callbackFailed',
  'withdrawFailed',
])

export function getApprovalOverviewMetrics(): ApprovalOverviewMetric[] {
  const pendingRecords = approvalRecords.filter(
    (record) => record.status === 'pending',
  )
  const todayRecords = approvalRecords.filter((record) =>
    record.createdAt.startsWith('2026-06-15'),
  )
  const overdueRecords = pendingRecords.filter(
    (record) =>
      record.dueAt !== undefined &&
      Date.parse(record.dueAt) < Date.parse('2026-06-15T16:00:00+08:00'),
  )
  const externalSyncFailures = approvalRecords.filter((record) =>
    syncFailureStatuses.has(record.syncStatus),
  )
  const coveredOperationCount = new Set(
    approvalRules
      .filter((rule) => rule.enabled)
      .map((rule) => rule.operationType),
  ).size

  return [
    {
      id: 'pending',
      label: '待处理审批',
      value: pendingRecords.length,
      tone: pendingRecords.length > 0 ? 'warning' : 'success',
      helper: '当前仍在审批 Gate 等待的请求',
    },
    {
      id: 'overdue',
      label: '逾期审批',
      value: overdueRecords.length,
      tone: overdueRecords.length > 0 ? 'danger' : 'success',
      helper: '超过截止时间且尚未完成的审批',
    },
    {
      id: 'startedToday',
      label: '今日发起',
      value: todayRecords.length,
      tone: 'neutral',
      helper: '今天创建的审批请求',
    },
    {
      id: 'externalSyncFailures',
      label: '外部同步异常',
      value: externalSyncFailures.length,
      tone: externalSyncFailures.length > 0 ? 'danger' : 'success',
      helper: '提交、回调或撤回同步失败的外部审批',
    },
    {
      id: 'coveredOperations',
      label: '高风险操作覆盖',
      value: coveredOperationCount,
      tone: 'success',
      helper: '已启用操作规则覆盖的高风险操作类型',
    },
  ]
}

export function getApprovalRecordsBySection(
  section: ApprovalCenterSectionId,
): ApprovalRequest[] {
  if (section === 'pending') {
    return approvalRecords.filter((record) => record.status === 'pending')
  }

  if (section === 'initiated') {
    return approvalRecords.filter(
      (record) =>
        record.initiator === 'zhengjun' ||
        record.initiator === 'ABot-智能助手',
    )
  }

  if (section === 'records') {
    return approvalRecords.filter((record) => immutableStatuses.has(record.status))
  }

  return approvalRecords
}

export function findApprovalRecord(id: string): ApprovalRequest | undefined {
  return approvalRecords.find((record) => record.id === id)
}

export function runApprovalSimulation(
  input: ApprovalSimulationInput,
): ApprovalSimulationResult {
  const enabledRules = approvalRules.filter(
    (rule) => rule.enabled && rule.operationType === input.operationType,
  )
  const projectRules = enabledRules.filter(
    (rule) => rule.scope === 'project' && rule.projectId === input.projectId,
  )
  const candidateRules =
    projectRules.length > 0
      ? projectRules
      : enabledRules.filter((rule) => rule.scope === 'organization')
  const matchedRule =
    [...candidateRules].sort((a, b) => b.priority - a.priority)[0] ?? null

  if (!matchedRule) {
    return {
      matchedRule: null,
      matchedRuleName: '未匹配审批规则',
      route: 'none',
      expectedPendingApprovers: [],
    }
  }

  if (matchedRule.route === 'external') {
    const connector = externalApprovalConnectors.find(
      (item) => item.id === matchedRule.connectorId,
    )

    return {
      matchedRule,
      matchedRuleName: matchedRule.name,
      route: 'external',
      connectorName: connector?.name,
      connector,
      evidenceTemplateId: matchedRule.evidenceTemplateId,
      expectedPendingApprovers: [],
    }
  }

  const flow = approvalFlows.find((item) => item.id === matchedRule.flowId)

  return {
    matchedRule,
    matchedRuleName: matchedRule.name,
    route: 'builtIn',
    flowName: flow?.name,
    flowStages: flow?.stages ?? [],
    evidenceTemplateId: matchedRule.evidenceTemplateId,
    expectedPendingApprovers:
      flow?.stages.map((stage) => stage.approverLabel) ?? [],
  }
}
