export type BillingCenterRole = 'admin' | 'viewer'

export type BillingCenterTab =
  | 'overview'
  | 'services'
  | 'bills'
  | 'usage'
  | 'budgets'

export type BillingCenterServiceStatus =
  | 'active'
  | 'expiring'
  | 'overage'
  | 'paused'

export type BillingCenterFeeRule =
  | 'subscription'
  | 'prepaidPack'
  | 'postpaid'
  | 'oneTime'
  | 'storage'

export interface BillingCenterServiceInstance {
  id: string
  name: string
  productName: string
  commodityCode: string
  billingItemCode: string
  billingInstanceId: string
  feeRule: BillingCenterFeeRule
  status: BillingCenterServiceStatus
  startsAt: string
  endsAt: string | null
  quotaLabel: string
  usedAmount: number
  quotaAmount: number | null
  unit: string
  currentMonthCost: number
  previousMonthCost: number
  ownerTeam: string
  costCenter: string
  riskLevel: 'none' | 'watch' | 'warning' | 'critical'
  riskReason?: string
}

export interface BillingCenterBillLineItem {
  id: string
  serviceInstanceId: string
  serviceInstanceName: string
  productName: string
  billingItemCode: string
  itemName: string
  feeRule: BillingCenterFeeRule
  quantity: number
  unit: string
  unitPrice: number
  amount: number
  periodStart: string
  periodEnd: string
  costCenter: string
}

export interface BillingCenterMonthlyBill {
  id: string
  month: '2026-04' | '2026-05' | '2026-06'
  status: 'issued' | 'estimated'
  currency: 'CNY'
  issuedAt: string | null
  dueAt: string | null
  subtotal: number
  taxAmount: number
  totalAmount: number
  lineItems: BillingCenterBillLineItem[]
}

export interface BillingCenterUsageRecord {
  id: string
  serviceInstanceId: string
  serviceInstanceName: string
  date: string
  metricName: string
  quantity: number
  unit: string
  estimatedCost: number
}

export interface BillingCenterBudgetRule {
  id: string
  name: string
  scope: 'enterprise' | 'product' | 'serviceInstance' | 'costCenter'
  targetId: string
  targetName: string
  period: 'monthly' | 'quarterly'
  limitAmount: number
  usedAmount: number
  thresholds: number[]
  recipients: string[]
  status: 'active' | 'paused'
  lastTriggeredAt: string | null
}

export interface BillingCenterRiskNotification {
  id: string
  serviceInstanceId: string
  title: string
  severity: 'watch' | 'warning' | 'critical'
  message: string
  createdAt: string
}

export interface BillingCenterOverviewMetrics {
  activeServices: number
  resourceRisks: number
  currentMonthEstimate: number
  previousMonthBill: number
  budgetUsageRate: number
}

export const billingCenterServiceInstances: BillingCenterServiceInstance[] = [
  {
    id: 'svc-agent-enterprise-subscription',
    name: 'Agent 企业版年度订阅',
    productName: 'BioMap Agent 企业协作平台',
    commodityCode: 'BM-AGENT-ENT',
    billingItemCode: 'BM-AGENT-SUB-001',
    billingInstanceId: 'bi-2026-agent-ent-001',
    feeRule: 'subscription',
    status: 'active',
    startsAt: '2026-01-01',
    endsAt: '2026-12-31',
    quotaLabel: '200 企业席位',
    usedAmount: 148,
    quotaAmount: 200,
    unit: 'seat',
    currentMonthCost: 56400,
    previousMonthCost: 56200,
    ownerTeam: '平台科学家团队',
    costCenter: 'CC-BIOMAP-PLATFORM',
    riskLevel: 'none',
  },
  {
    id: 'svc-agent-workflow-pack',
    name: 'Agent 自动化工作流包',
    productName: 'BioMap Agent 自动化',
    commodityCode: 'BM-AGENT-WORKFLOW',
    billingItemCode: 'BM-AGENT-WF-010',
    billingInstanceId: 'bi-2026-agent-wf-018',
    feeRule: 'prepaidPack',
    status: 'expiring',
    startsAt: '2026-04-01',
    endsAt: '2026-06-30',
    quotaLabel: '60,000 次工作流执行',
    usedAmount: 55240,
    quotaAmount: 60000,
    unit: 'run',
    currentMonthCost: 18600,
    previousMonthCost: 14200,
    ownerTeam: '智能实验室运营',
    costCenter: 'CC-LAB-AUTO',
    riskLevel: 'warning',
    riskReason: '剩余额度低于 10%，预计 2026-06-24 耗尽',
  },
  {
    id: 'svc-xtrimo-abaffinity-pack',
    name: 'XTrimo 抗体亲和力优化包',
    productName: 'XTrimo 抗体发现',
    commodityCode: 'BM-XTRIMO-AB',
    billingItemCode: 'BM-XTRIMO-AB-020',
    billingInstanceId: 'bi-2026-xtrimo-ab-006',
    feeRule: 'prepaidPack',
    status: 'active',
    startsAt: '2026-03-15',
    endsAt: '2026-09-14',
    quotaLabel: '300 条候选抗体优化',
    usedAmount: 184,
    quotaAmount: 300,
    unit: 'candidate',
    currentMonthCost: 32600,
    previousMonthCost: 29400,
    ownerTeam: '抗体药物研发',
    costCenter: 'CC-ANTIBODY-RD',
    riskLevel: 'watch',
    riskReason: '本月候选抗体优化量环比增长 28%',
  },
  {
    id: 'svc-xtrimo-gene-postpaid',
    name: 'XTrimo 基因功能后付费实例',
    productName: 'XTrimo 基因功能分析',
    commodityCode: 'BM-XTRIMO-GENE',
    billingItemCode: 'BM-XTRIMO-GENE-POST-001',
    billingInstanceId: 'bi-2026-xtrimo-gene-011',
    feeRule: 'postpaid',
    status: 'overage',
    startsAt: '2026-02-01',
    endsAt: null,
    quotaLabel: '按样本后付费',
    usedAmount: 1284,
    quotaAmount: null,
    unit: 'sample',
    currentMonthCost: 45960,
    previousMonthCost: 31240,
    ownerTeam: '基因组平台',
    costCenter: 'CC-GENOMICS',
    riskLevel: 'critical',
    riskReason: '本月费用已超过预算阈值 120%',
  },
  {
    id: 'svc-egfr-graphrag-storage',
    name: 'EGFR GraphRAG 知识库存储',
    productName: '科研知识库 GraphRAG',
    commodityCode: 'BM-GRAPHRAG',
    billingItemCode: 'BM-GRAPHRAG-STO-001',
    billingInstanceId: 'bi-2026-graphrag-egfr-004',
    feeRule: 'storage',
    status: 'active',
    startsAt: '2026-01-10',
    endsAt: null,
    quotaLabel: '8 TB 知识库存储',
    usedAmount: 6.8,
    quotaAmount: 8,
    unit: 'TB',
    currentMonthCost: 12400,
    previousMonthCost: 11600,
    ownerTeam: '转化医学知识工程',
    costCenter: 'CC-KNOWLEDGE',
    riskLevel: 'watch',
    riskReason: '存储使用率达到 85%',
  },
  {
    id: 'svc-hpc-corehour-pack',
    name: '高性能计算 CoreHour 资源包',
    productName: 'BioMap 高性能计算',
    commodityCode: 'BM-HPC',
    billingItemCode: 'BM-HPC-CORE-050',
    billingInstanceId: 'bi-2026-hpc-core-009',
    feeRule: 'prepaidPack',
    status: 'active',
    startsAt: '2026-05-01',
    endsAt: '2026-08-31',
    quotaLabel: '120,000 CoreHour',
    usedAmount: 73600,
    quotaAmount: 120000,
    unit: 'coreHour',
    currentMonthCost: 28800,
    previousMonthCost: 21600,
    ownerTeam: '蛋白结构平台',
    costCenter: 'CC-COMPUTE',
    riskLevel: 'none',
  },
  {
    id: 'svc-virtual-cell-credit-pack',
    name: '虚拟细胞积分资源包',
    productName: 'Virtual Cell SaaS',
    commodityCode: 'BM-VCELL',
    billingItemCode: 'VCELL-COMM-001-BI-003',
    billingInstanceId: 'bi-2026-vcell-credit-021',
    feeRule: 'prepaidPack',
    status: 'expiring',
    startsAt: '2026-04-20',
    endsAt: '2026-07-19',
    quotaLabel: '100,000 虚拟细胞积分',
    usedAmount: 91400,
    quotaAmount: 100000,
    unit: 'credit',
    currentMonthCost: 24600,
    previousMonthCost: 16800,
    ownerTeam: '细胞模型团队',
    costCenter: 'CC-VCELL',
    riskLevel: 'warning',
    riskReason: '积分余量低于 10%',
  },
  {
    id: 'svc-antibody-design-service',
    name: '抗体序列设计专家服务',
    productName: '抗体蛋白专家服务',
    commodityCode: 'BM-AB-SERVICE',
    billingItemCode: 'BM-AB-DESIGN-SVC-001',
    billingInstanceId: 'bi-2026-ab-design-003',
    feeRule: 'oneTime',
    status: 'active',
    startsAt: '2026-06-01',
    endsAt: '2026-07-15',
    quotaLabel: '4 周专家设计服务',
    usedAmount: 3,
    quotaAmount: 4,
    unit: 'week',
    currentMonthCost: 68000,
    previousMonthCost: 0,
    ownerTeam: '抗体药物研发',
    costCenter: 'CC-ANTIBODY-RD',
    riskLevel: 'none',
  },
  {
    id: 'svc-cro-order-orchestration',
    name: 'CRO 订单编排与样本追踪',
    productName: '智能实验室 CRO 协同',
    commodityCode: 'BM-CRO-OPS',
    billingItemCode: 'BM-CRO-ORDER-OPS-001',
    billingInstanceId: 'bi-2026-cro-order-012',
    feeRule: 'postpaid',
    status: 'active',
    startsAt: '2026-03-01',
    endsAt: null,
    quotaLabel: '按订单编排量后付费',
    usedAmount: 86,
    quotaAmount: null,
    unit: 'order',
    currentMonthCost: 17200,
    previousMonthCost: 15100,
    ownerTeam: 'CRO 项目运营',
    costCenter: 'CC-CRO-OPS',
    riskLevel: 'none',
  },
]

const lineItemSeeds: Array<
  Omit<
    BillingCenterBillLineItem,
    'id' | 'periodStart' | 'periodEnd' | 'quantity' | 'amount'
  > & {
    april: number
    may: number
    june: number
    monthlyQuantity: number
  }
> = [
  {
    serviceInstanceId: 'svc-agent-enterprise-subscription',
    serviceInstanceName: 'Agent 企业版年度订阅',
    productName: 'BioMap Agent 企业协作平台',
    billingItemCode: 'BM-AGENT-SUB-001',
    itemName: '企业版订阅基础席位',
    feeRule: 'subscription',
    unit: 'month',
    unitPrice: 52800,
    costCenter: 'CC-BIOMAP-PLATFORM',
    monthlyQuantity: 1,
    april: 52800,
    may: 52800,
    june: 52800,
  },
  {
    serviceInstanceId: 'svc-agent-workflow-pack',
    serviceInstanceName: 'Agent 自动化工作流包',
    productName: 'BioMap Agent 自动化',
    billingItemCode: 'BM-AGENT-WF-010',
    itemName: '自动化工作流执行资源包摊销',
    feeRule: 'prepaidPack',
    unit: 'run',
    unitPrice: 0.34,
    costCenter: 'CC-LAB-AUTO',
    monthlyQuantity: 54700,
    april: 9800,
    may: 14200,
    june: 18600,
  },
  {
    serviceInstanceId: 'svc-xtrimo-abaffinity-pack',
    serviceInstanceName: 'XTrimo 抗体亲和力优化包',
    productName: 'XTrimo 抗体发现',
    billingItemCode: 'BM-XTRIMO-AB-020',
    itemName: '候选抗体亲和力优化',
    feeRule: 'prepaidPack',
    unit: 'candidate',
    unitPrice: 177,
    costCenter: 'CC-ANTIBODY-RD',
    monthlyQuantity: 184,
    april: 21800,
    may: 29400,
    june: 32600,
  },
  {
    serviceInstanceId: 'svc-xtrimo-gene-postpaid',
    serviceInstanceName: 'XTrimo 基因功能后付费实例',
    productName: 'XTrimo 基因功能分析',
    billingItemCode: 'BM-XTRIMO-GENE-POST-001',
    itemName: '基因功能样本分析',
    feeRule: 'postpaid',
    unit: 'sample',
    unitPrice: 35.8,
    costCenter: 'CC-GENOMICS',
    monthlyQuantity: 1284,
    april: 24420,
    may: 31240,
    june: 45960,
  },
  {
    serviceInstanceId: 'svc-egfr-graphrag-storage',
    serviceInstanceName: 'EGFR GraphRAG 知识库存储',
    productName: '科研知识库 GraphRAG',
    billingItemCode: 'BM-GRAPHRAG-STO-001',
    itemName: 'GraphRAG 知识库存储',
    feeRule: 'storage',
    unit: 'TB-month',
    unitPrice: 1823.53,
    costCenter: 'CC-KNOWLEDGE',
    monthlyQuantity: 6.8,
    april: 10400,
    may: 11600,
    june: 12400,
  },
  {
    serviceInstanceId: 'svc-hpc-corehour-pack',
    serviceInstanceName: '高性能计算 CoreHour 资源包',
    productName: 'BioMap 高性能计算',
    billingItemCode: 'BM-HPC-CORE-050',
    itemName: '高性能计算 CoreHour 消耗',
    feeRule: 'prepaidPack',
    unit: 'coreHour',
    unitPrice: 0.39,
    costCenter: 'CC-COMPUTE',
    monthlyQuantity: 73600,
    april: 0,
    may: 21600,
    june: 28800,
  },
  {
    serviceInstanceId: 'svc-virtual-cell-credit-pack',
    serviceInstanceName: '虚拟细胞积分资源包',
    productName: 'Virtual Cell SaaS',
    billingItemCode: 'VCELL-COMM-001-BI-003',
    itemName: '虚拟细胞积分消耗',
    feeRule: 'prepaidPack',
    unit: 'credit',
    unitPrice: 0.27,
    costCenter: 'CC-VCELL',
    monthlyQuantity: 91400,
    april: 8600,
    may: 16800,
    june: 24600,
  },
  {
    serviceInstanceId: 'svc-antibody-design-service',
    serviceInstanceName: '抗体序列设计专家服务',
    productName: '抗体蛋白专家服务',
    billingItemCode: 'BM-AB-DESIGN-SVC-001',
    itemName: '抗体序列设计专家服务费',
    feeRule: 'oneTime',
    unit: 'project',
    unitPrice: 68000,
    costCenter: 'CC-ANTIBODY-RD',
    monthlyQuantity: 1,
    april: 0,
    may: 0,
    june: 68000,
  },
  {
    serviceInstanceId: 'svc-cro-order-orchestration',
    serviceInstanceName: 'CRO 订单编排与样本追踪',
    productName: '智能实验室 CRO 协同',
    billingItemCode: 'BM-CRO-ORDER-OPS-001',
    itemName: 'CRO 订单编排服务费',
    feeRule: 'postpaid',
    unit: 'order',
    unitPrice: 200,
    costCenter: 'CC-CRO-OPS',
    monthlyQuantity: 86,
    april: 12800,
    may: 15100,
    june: 17200,
  },
  {
    serviceInstanceId: 'svc-agent-enterprise-subscription',
    serviceInstanceName: 'Agent 企业版年度订阅',
    productName: 'BioMap Agent 企业协作平台',
    billingItemCode: 'BM-AGENT-SUB-001',
    itemName: '企业审计日志与数据留存',
    feeRule: 'subscription',
    unit: 'month',
    unitPrice: 3600,
    costCenter: 'CC-BIOMAP-PLATFORM',
    monthlyQuantity: 1,
    april: 3200,
    may: 3400,
    june: 3600,
  },
]

const billMonths = [
  {
    month: '2026-04',
    status: 'issued',
    issuedAt: '2026-05-02',
    dueAt: '2026-05-15',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    amountKey: 'april',
  },
  {
    month: '2026-05',
    status: 'issued',
    issuedAt: '2026-06-02',
    dueAt: '2026-06-15',
    periodStart: '2026-05-01',
    periodEnd: '2026-05-31',
    amountKey: 'may',
  },
  {
    month: '2026-06',
    status: 'estimated',
    issuedAt: null,
    dueAt: null,
    periodStart: '2026-06-01',
    periodEnd: '2026-06-30',
    amountKey: 'june',
  },
] as const

export const billingCenterMonthlyBills: BillingCenterMonthlyBill[] = billMonths.map(
  (bill) => {
    const lineItems = lineItemSeeds.map((seed, index) => {
      const amount = seed[bill.amountKey]

      return {
        id: `bill-${bill.month}-line-${String(index + 1).padStart(3, '0')}`,
        serviceInstanceId: seed.serviceInstanceId,
        serviceInstanceName: seed.serviceInstanceName,
        productName: seed.productName,
        billingItemCode: seed.billingItemCode,
        itemName: seed.itemName,
        feeRule: seed.feeRule,
        quantity: amount === 0 ? 0 : seed.monthlyQuantity,
        unit: seed.unit,
        unitPrice: seed.unitPrice,
        amount,
        periodStart: bill.periodStart,
        periodEnd: bill.periodEnd,
        costCenter: seed.costCenter,
      }
    })
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = Math.round(subtotal * 0.06)

    return {
      id: `bill-${bill.month}`,
      month: bill.month,
      status: bill.status,
      currency: 'CNY',
      issuedAt: bill.issuedAt,
      dueAt: bill.dueAt,
      subtotal,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      lineItems,
    }
  },
)

export const billingCenterUsageRecords: BillingCenterUsageRecord[] = [
  {
    id: 'usage-2026-06-agent-wf-001',
    serviceInstanceId: 'svc-agent-workflow-pack',
    serviceInstanceName: 'Agent 自动化工作流包',
    date: '2026-06-17',
    metricName: '工作流执行',
    quantity: 4280,
    unit: 'run',
    estimatedCost: 1455,
  },
  {
    id: 'usage-2026-06-xtrimo-ab-001',
    serviceInstanceId: 'svc-xtrimo-abaffinity-pack',
    serviceInstanceName: 'XTrimo 抗体亲和力优化包',
    date: '2026-06-18',
    metricName: '候选抗体优化',
    quantity: 34,
    unit: 'candidate',
    estimatedCost: 6018,
  },
  {
    id: 'usage-2026-06-gene-001',
    serviceInstanceId: 'svc-xtrimo-gene-postpaid',
    serviceInstanceName: 'XTrimo 基因功能后付费实例',
    date: '2026-06-18',
    metricName: '样本分析',
    quantity: 118,
    unit: 'sample',
    estimatedCost: 4224,
  },
  {
    id: 'usage-2026-06-vcell-001',
    serviceInstanceId: 'svc-virtual-cell-credit-pack',
    serviceInstanceName: '虚拟细胞积分资源包',
    date: '2026-06-19',
    metricName: '虚拟细胞积分',
    quantity: 7600,
    unit: 'credit',
    estimatedCost: 2048,
  },
  {
    id: 'usage-2026-06-hpc-001',
    serviceInstanceId: 'svc-hpc-corehour-pack',
    serviceInstanceName: '高性能计算 CoreHour 资源包',
    date: '2026-06-19',
    metricName: 'CoreHour',
    quantity: 6200,
    unit: 'coreHour',
    estimatedCost: 2418,
  },
]

export const billingCenterBudgetRules: BillingCenterBudgetRule[] = [
  {
    id: 'budget-enterprise-monthly',
    name: '企业月度总预算',
    scope: 'enterprise',
    targetId: 'enterprise-biomap-demo',
    targetName: 'BioMap Demo 企业',
    period: 'monthly',
    limitAmount: 320000,
    usedAmount: 304560,
    thresholds: [70, 90, 100],
    recipients: ['企业管理员', '财务 BP'],
    status: 'active',
    lastTriggeredAt: '2026-06-18T09:30:00+08:00',
  },
  {
    id: 'budget-antibody-rd-monthly',
    name: '抗体研发月度预算',
    scope: 'costCenter',
    targetId: 'CC-ANTIBODY-RD',
    targetName: '抗体药物研发',
    period: 'monthly',
    limitAmount: 105000,
    usedAmount: 100600,
    thresholds: [80, 95, 110],
    recipients: ['抗体研发负责人'],
    status: 'active',
    lastTriggeredAt: '2026-06-19T14:05:00+08:00',
  },
  {
    id: 'budget-genomics-postpaid',
    name: '基因功能后付费预算',
    scope: 'serviceInstance',
    targetId: 'svc-xtrimo-gene-postpaid',
    targetName: 'XTrimo 基因功能后付费实例',
    period: 'monthly',
    limitAmount: 38000,
    usedAmount: 45960,
    thresholds: [75, 100, 120],
    recipients: ['基因组平台主管', '费用查看用户'],
    status: 'active',
    lastTriggeredAt: '2026-06-18T18:12:00+08:00',
  },
  {
    id: 'budget-vcell-credit-pack',
    name: '虚拟细胞积分包预算',
    scope: 'serviceInstance',
    targetId: 'svc-virtual-cell-credit-pack',
    targetName: '虚拟细胞积分资源包',
    period: 'monthly',
    limitAmount: 26000,
    usedAmount: 24600,
    thresholds: [70, 90, 100],
    recipients: ['细胞模型团队'],
    status: 'active',
    lastTriggeredAt: '2026-06-17T11:48:00+08:00',
  },
  {
    id: 'budget-compute-quarterly',
    name: '算力平台季度预算',
    scope: 'product',
    targetId: 'BM-HPC',
    targetName: 'BioMap 高性能计算',
    period: 'quarterly',
    limitAmount: 180000,
    usedAmount: 50400,
    thresholds: [70, 90, 100],
    recipients: ['蛋白结构平台', '财务 BP'],
    status: 'active',
    lastTriggeredAt: null,
  },
]

export const billingCenterRiskNotifications: BillingCenterRiskNotification[] = [
  {
    id: 'risk-agent-workflow-quota',
    serviceInstanceId: 'svc-agent-workflow-pack',
    title: 'Agent 工作流资源包预计 4 天内耗尽',
    severity: 'warning',
    message: '当前剩余 4,760 次执行额度，建议补充资源包或切换后付费。',
    createdAt: '2026-06-20T09:10:00+08:00',
  },
  {
    id: 'risk-gene-postpaid-budget',
    serviceInstanceId: 'svc-xtrimo-gene-postpaid',
    title: '基因功能后付费实例超过预算',
    severity: 'critical',
    message: '本月预估费用 45,960 元，已超过预算阈值 120%。',
    createdAt: '2026-06-19T18:12:00+08:00',
  },
  {
    id: 'risk-vcell-credit-low',
    serviceInstanceId: 'svc-virtual-cell-credit-pack',
    title: '虚拟细胞积分余量低',
    severity: 'warning',
    message: '积分资源包已使用 91.4%，预计 2026-06-25 前耗尽。',
    createdAt: '2026-06-19T10:25:00+08:00',
  },
  {
    id: 'risk-graphrag-storage-near-limit',
    serviceInstanceId: 'svc-egfr-graphrag-storage',
    title: 'EGFR GraphRAG 存储接近上限',
    severity: 'watch',
    message: '当前知识库存储使用率 85%，建议清理历史索引或扩容存储实例。',
    createdAt: '2026-06-18T16:40:00+08:00',
  },
]

export function getBillingCenterOverviewMetrics(): BillingCenterOverviewMetrics {
  const activeServices = billingCenterServiceInstances.filter(
    (service) => service.status === 'active',
  ).length
  const resourceRisks = billingCenterServiceInstances.filter(
    (service) => service.riskLevel !== 'none',
  ).length
  const currentMonthBill = billingCenterMonthlyBills.find(
    (bill) => bill.month === '2026-06',
  )
  const previousMonthBill = billingCenterMonthlyBills.find(
    (bill) => bill.month === '2026-05',
  )
  const enterpriseBudget = billingCenterBudgetRules.find(
    (rule) => rule.id === 'budget-enterprise-monthly',
  )

  return {
    activeServices,
    resourceRisks,
    currentMonthEstimate: currentMonthBill?.totalAmount ?? 0,
    previousMonthBill: previousMonthBill?.totalAmount ?? 0,
    budgetUsageRate: enterpriseBudget
      ? Math.round((enterpriseBudget.usedAmount / enterpriseBudget.limitAmount) * 100)
      : 0,
  }
}
