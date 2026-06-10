import {
  commodityRecords,
  getCommodityDetail,
  getProductTypeByProductId,
  productRecords,
  type BillingItemRecord,
  type CommodityRecord,
  type CommoditySaleType,
  type ProductRecord,
  type ProductType,
} from './productManagementMockData'

export type CostSection =
  | 'overview'
  | 'items'
  | 'models'
  | 'allocations'
  | 'versions'
export type CostSubject =
  | '资源成本'
  | '人力成本'
  | '交付成本'
  | '运维成本'
  | '第三方成本'
  | '共享成本'
export type CostScope = '全局标准' | '产品专属' | '商品专属' | '共享成本'
export type CostSource =
  | '云资源账单'
  | '内部人力标准'
  | '供应商报价'
  | '财务测算'
  | '历史项目均摊'
export type CostAllocationMethod =
  | '直接归属'
  | '按用量'
  | '按收入'
  | '按席位'
  | '按项目'
  | '按人天'
export type CostRecordStatus = '生效中' | '待生效' | '已失效'
export type CostRiskStatus = '正常' | '关注' | '风险'
export type CostModelStatus = '草稿' | '生效中' | '已归档'
export type AllocationTarget = '产品' | '商品' | '计费项'
export type AllocationDriver =
  | '收入占比'
  | '用量占比'
  | '席位占比'
  | '存储占比'
  | '项目人天占比'
  | '平均分摊'
export type AllocationStatus = '草稿' | '生效中' | '待失效' | '已失效'
export type CostVersionStatus = '草稿' | '已生效' | '已归档'

export type CostItemRecord = {
  id: string
  name: string
  code: string
  scope: CostScope
  subject: CostSubject
  unit: string
  standardUnitCost: string
  currency: 'CNY'
  source: CostSource
  allocationMethod: CostAllocationMethod
  effectiveAt: string
  expiredAt: string
  status: CostRecordStatus
  owner: string
  updatedAt: string
}

export type CostBreakdownRecord = {
  costItemCode: string
  costItemName: string
  subject: CostSubject
  unit: string
  quantityAssumption: string
  unitCost: string
  costAmount: string
  allocationMethod: CostAllocationMethod
  note: string
}

export type CostPricingSimulationRecord = {
  priceLine: '刊例价' | '自由折扣线' | '一般折扣线' | '产品折扣线' | '出厂价折扣线'
  discount: string
  price: string
  grossMargin: string
}

export type CostModelVersionRecord = {
  costVersion: string
  status: CostVersionStatus
  createdAt: string
  effectiveAt: string
  creator: string
  summary: string
}

export type CostModelRecord = {
  costModelId: string
  costModelName: string
  costModelCode: string
  productId: string
  productName: string
  productType: ProductType
  commodityId: string
  commodityName: string
  commodityType: CommoditySaleType
  billingItemName: string
  billingItemCode: string
  chargeType: '资源包' | '包月' | '项目制' | '人天'
  meteringAssumption: string
  costBasis: string
  totalTargetCost: string
  resourceCost: string
  laborCost: string
  deliveryCost: string
  opsAllocation: string
  sharedCost: string
  targetGrossMargin: string
  forecastGrossMargin: string
  riskStatus: CostRiskStatus
  status: CostModelStatus
  costVersion: string
  updatedAt: string
  breakdown: CostBreakdownRecord[]
  pricingSimulation: CostPricingSimulationRecord[]
  versions: CostModelVersionRecord[]
}

export type CostAllocationRecord = {
  allocationRuleId: string
  ruleName: string
  ruleCode: string
  sharedCostItemCode: string
  sharedCostItemName: string
  allocationTarget: AllocationTarget
  allocationDriver: AllocationDriver
  allocationCycle: '月' | '季度' | '年度'
  productIds: string[]
  productNames: string
  currentAllocatedAmount: string
  unallocatedAmount: string
  allocationCompleteness: string
  status: AllocationStatus
  updatedAt: string
}

export type CostVersionRecord = {
  costVersion: string
  relatedObjectId: string
  relatedObjectName: string
  objectType: '产品' | '商品' | '计费项' | '成本项' | '分摊规则'
  changeType:
    | '单价调整'
    | '模型调整'
    | '分摊规则调整'
    | '人力成本调整'
    | '资源价格调整'
    | '口径锁定'
  status: CostVersionStatus
  productId: string
  commodityId: string
  billingItemCode: string
  costModelId: string
  impactRevenue: string
  impactCost: string
  impactGrossMargin: string
  effectiveAt: string
  creator: string
  createdAt: string
  description: string
}

export type CostOverviewRecord = {
  productId: string
  productName: string
  owner: string
  targetRevenue: string
  actualRevenue: string
  targetCost: string
  actualCost: string
  costUsageRate: string
  targetGrossMargin: string
  actualGrossMargin: string
  marginVariance: string
  riskStatus: CostRiskStatus
}

export const costSections: { id: CostSection; label: string }[] = [
  { id: 'overview', label: '成本总览' },
  { id: 'items', label: '成本项管理' },
  { id: 'models', label: '成本模型' },
  { id: 'allocations', label: '成本分摊规则' },
  { id: 'versions', label: '成本版本记录' },
]

export const costSubjects: CostSubject[] = [
  '资源成本',
  '人力成本',
  '交付成本',
  '运维成本',
  '第三方成本',
  '共享成本',
]

export const costRiskStatuses: CostRiskStatus[] = ['正常', '关注', '风险']

export const costItemRecords: CostItemRecord[] = [
  createCostItem(1, 'GPU 归一化算力', 'COST-RES-GPU-001', '全局标准', '资源成本', '千核时', '¥1,280', '云资源账单', '按用量', '生效中', '许航'),
  createCostItem(2, 'CPU 批处理算力', 'COST-RES-CPU-002', '全局标准', '资源成本', '千核时', '¥420', '云资源账单', '按用量', '生效中', '许航'),
  createCostItem(3, '模型推理调用', 'COST-RES-INF-003', '全局标准', '资源成本', '万次调用', '¥260', '云资源账单', '按用量', '生效中', '许航'),
  createCostItem(4, '对象存储容量', 'COST-RES-STO-004', '全局标准', '资源成本', 'TB/月', '¥680', '云资源账单', '按用量', '生效中', '许航'),
  createCostItem(5, '向量检索节点', 'COST-RES-VEC-005', '产品专属', '资源成本', '节点/月', '¥5,800', '云资源账单', '按用量', '生效中', '林嘉'),
  createCostItem(6, '专属环境实例', 'COST-RES-ENV-006', '商品专属', '资源成本', '环境/月', '¥28,000', '云资源账单', '直接归属', '生效中', '林嘉'),
  createCostItem(7, 'L1 科学支持', 'COST-LAB-L1-001', '全局标准', '人力成本', '人天', '¥2,200', '内部人力标准', '按人天', '生效中', '陈澈'),
  createCostItem(8, 'L2 方案专家', 'COST-LAB-L2-002', '全局标准', '人力成本', '人天', '¥3,600', '内部人力标准', '按人天', '生效中', '陈澈'),
  createCostItem(9, 'CSM 项目治理', 'COST-LAB-CSM-003', '共享成本', '人力成本', '人天', '¥2,800', '内部人力标准', '按人天', '生效中', '陈澈'),
  createCostItem(10, '模型科学家适配', 'COST-LAB-SCI-004', '产品专属', '人力成本', '人天', '¥4,800', '内部人力标准', '按项目', '生效中', '陈澈'),
  createCostItem(11, '实施部署工程师', 'COST-DEL-IMP-001', '全局标准', '交付成本', '人天', '¥3,200', '内部人力标准', '按人天', '生效中', '朱敏'),
  createCostItem(12, '数据迁移服务', 'COST-DEL-DATA-002', '商品专属', '交付成本', '项目', '¥42,000', '财务测算', '按项目', '生效中', '朱敏'),
  createCostItem(13, '验收与培训包', 'COST-DEL-ACC-003', '全局标准', '交付成本', '项目', '¥24,000', '历史项目均摊', '按项目', '生效中', '朱敏'),
  createCostItem(14, '专属模型部署', 'COST-DEL-MODEL-004', '产品专属', '交付成本', '项目', '¥88,000', '财务测算', '按项目', '待生效', '朱敏'),
  createCostItem(15, 'SRE 值守摊销', 'COST-OPS-SRE-001', '共享成本', '运维成本', '环境/月', '¥9,600', '历史项目均摊', '按收入', '生效中', '杨宁'),
  createCostItem(16, '监控告警平台', 'COST-OPS-MON-002', '共享成本', '运维成本', '环境/月', '¥3,800', '供应商报价', '按收入', '生效中', '杨宁'),
  createCostItem(17, '安全扫描与审计', 'COST-OPS-SEC-003', '共享成本', '运维成本', '项目', '¥18,000', '供应商报价', '按项目', '生效中', '杨宁'),
  createCostItem(18, '版本升级运维', 'COST-OPS-UPG-004', '商品专属', '运维成本', '人天', '¥3,400', '内部人力标准', '按人天', '生效中', '杨宁'),
  createCostItem(19, '第三方知识库授权', 'COST-3P-KB-001', '产品专属', '第三方成本', '租户/月', '¥1,500', '供应商报价', '按席位', '生效中', '梁知'),
  createCostItem(20, '药物数据库授权', 'COST-3P-DRUG-002', '产品专属', '第三方成本', '租户/月', '¥12,000', '供应商报价', '按收入', '生效中', '梁知'),
  createCostItem(21, '农业遥感数据', 'COST-3P-AGRI-003', '产品专属', '第三方成本', 'TB/月', '¥4,600', '供应商报价', '按用量', '待生效', '梁知'),
  createCostItem(22, '平台基础运维池', 'COST-SHARED-OPS-001', '共享成本', '共享成本', '季度', '¥420,000', '历史项目均摊', '按收入', '生效中', '谢然'),
  createCostItem(23, '模型服务共享池', 'COST-SHARED-MODEL-002', '共享成本', '共享成本', '季度', '¥560,000', '历史项目均摊', '按用量', '生效中', '谢然'),
  createCostItem(24, '交付治理共享池', 'COST-SHARED-PMO-003', '共享成本', '共享成本', '季度', '¥180,000', '历史项目均摊', '按项目', '生效中', '谢然'),
]

const virtualCellSaasCommodity = commodityRecords.find(
  (record) => record.id === 'commodity-virtual-cell-saas',
)

const virtualCellSaasBillingItems =
  getCommodityDetail('commodity-virtual-cell-saas')?.billingItems ?? []

const costModelInputs = [
  ...(virtualCellSaasCommodity
    ? virtualCellSaasBillingItems.map((billingItem) => ({
        commodity: virtualCellSaasCommodity,
        billingItem,
      }))
    : []),
  ...commodityRecords
    .filter((commodity) => commodity.id !== 'commodity-virtual-cell-saas')
    .map((commodity) => ({
      commodity,
      billingItem: getCommodityDetail(commodity.id)?.billingItems[0] ?? null,
    }))
    .filter(
      (
        input,
      ): input is {
        commodity: CommodityRecord
        billingItem: BillingItemRecord
      } => input.billingItem !== null,
    ),
]

export const costModelRecords: CostModelRecord[] = costModelInputs.map(
  ({ commodity, billingItem }, index) =>
    createCostModelRecord(commodity, billingItem, index),
)

export const costAllocationRecords: CostAllocationRecord[] = [
  createAllocationRule(1, '平台基础运维季度分摊', 'COST-SHARED-OPS-001', '产品', '收入占比', '季度', allProducts(), '¥318,000', '¥22,000', '94%', '生效中'),
  createAllocationRule(2, '模型服务推理池分摊', 'COST-SHARED-MODEL-002', '计费项', '用量占比', '月', productsByTypes(['虚拟细胞', '蛋白药物', '合成生物']), '¥426,000', '¥34,000', '93%', '生效中'),
  createAllocationRule(3, '对象存储共享池分摊', 'COST-RES-STO-004', '商品', '存储占比', '月', allProducts(), '¥146,000', '¥11,000', '93%', '生效中'),
  createAllocationRule(4, 'CSM 项目治理池分摊', 'COST-LAB-CSM-003', '商品', '项目人天占比', '季度', productsByTypes(['虚拟细胞', '蛋白药物', '合成生物']), '¥172,000', '¥8,000', '96%', '生效中'),
  createAllocationRule(5, '交付治理 PMO 分摊', 'COST-SHARED-PMO-003', '产品', '项目人天占比', '季度', allProducts(), '¥162,000', '¥18,000', '90%', '生效中'),
  createAllocationRule(6, 'SRE 值守环境分摊', 'COST-OPS-SRE-001', '商品', '平均分摊', '月', productsByTypes(['虚拟细胞', '合成生物']), '¥88,000', '¥4,000', '96%', '生效中'),
  createAllocationRule(7, '安全审计项目分摊', 'COST-OPS-SEC-003', '商品', '项目人天占比', '季度', allProducts(), '¥72,000', '¥6,000', '92%', '生效中'),
  createAllocationRule(8, '向量检索节点席位分摊', 'COST-RES-VEC-005', '计费项', '席位占比', '月', productsByTypes(['通用产品']), '¥41,000', '¥2,000', '95%', '生效中'),
  createAllocationRule(9, '药物数据库授权分摊', 'COST-3P-DRUG-002', '产品', '收入占比', '季度', productsByTypes(['蛋白药物']), '¥96,000', '¥0', '100%', '生效中'),
  createAllocationRule(10, '农业遥感数据试算分摊', 'COST-3P-AGRI-003', '商品', '存储占比', '季度', productsByTypes(['农业智能']), '¥38,000', '¥7,000', '84%', '草稿'),
  createAllocationRule(11, '监控告警平台平均分摊', 'COST-OPS-MON-002', '产品', '平均分摊', '月', allProducts(), '¥54,000', '¥0', '100%', '生效中'),
  createAllocationRule(12, '专属环境实例直接分摊', 'COST-RES-ENV-006', '商品', '用量占比', '月', productsByTypes(['虚拟细胞', '合成生物', '蛋白药物']), '¥224,000', '¥19,000', '92%', '待失效'),
]

export const costVersionRecords: CostVersionRecord[] = costModelRecords
  .slice(0, 18)
  .map((model, index) => ({
    costVersion: model.costVersion,
    relatedObjectId: model.billingItemCode,
    relatedObjectName: model.billingItemName,
    objectType: getVersionObjectType(index),
    changeType: getCostVersionChangeType(index),
    status: getVersionStatus(index),
    productId: model.productId,
    commodityId: model.commodityId,
    billingItemCode: model.billingItemCode,
    costModelId: model.costModelId,
    impactRevenue: formatCurrency(90000 + index * 18000),
    impactCost: formatCurrency(18000 + index * 6500),
    impactGrossMargin: `${index % 2 === 0 ? '+' : '-'}${(0.8 + index * 0.2).toFixed(1)}pt`,
    effectiveAt: index % 3 === 0 ? '2026-07-01 00:00' : '2026-06-01 00:00',
    creator: model.productName === 'BioMap Agent' ? '宋旭政俊' : model.productName,
    createdAt: `2026-06-${String((index % 18) + 1).padStart(2, '0')} 10:30`,
    description: `${model.billingItemName} 成本口径与共享摊销规则更新。`,
  }))

export const costOverviewRecords: CostOverviewRecord[] = productRecords.map(
  (product, index) => {
    const productType = getProductType(product)
    const modelCount = costModelRecords.filter(
      (model) => model.productId === product.id,
    ).length
    const targetCost = 620000 + index * 180000 + modelCount * 26000
    const actualCost = Math.round(targetCost * (0.58 + index * 0.05))
    const targetRevenue = targetCost * 2.8
    const actualRevenue = Math.round(targetRevenue * (0.62 + index * 0.04))

    return {
      productId: product.id,
      productName: product.name,
      owner: product.owner,
      targetRevenue: formatCurrency(targetRevenue),
      actualRevenue: formatCurrency(actualRevenue),
      targetCost: formatCurrency(targetCost),
      actualCost: formatCurrency(actualCost),
      costUsageRate: `${Math.round((actualCost / targetCost) * 100)}%`,
      targetGrossMargin: `${64 - index}%`,
      actualGrossMargin: `${Math.round(((actualRevenue - actualCost) / actualRevenue) * 100)}%`,
      marginVariance: productType === '农业智能' ? '-7pt' : `${index % 2 === 0 ? '+' : '-'}${index + 2}pt`,
      riskStatus: index >= 3 ? '关注' : '正常',
    }
  },
)

function createCostItem(
  index: number,
  name: string,
  code: string,
  scope: CostScope,
  subject: CostSubject,
  unit: string,
  standardUnitCost: string,
  source: CostSource,
  allocationMethod: CostAllocationMethod,
  status: CostRecordStatus,
  owner: string,
): CostItemRecord {
  return {
    id: `cost-item-${String(index).padStart(3, '0')}`,
    name,
    code,
    scope,
    subject,
    unit,
    standardUnitCost,
    currency: 'CNY',
    source,
    allocationMethod,
    effectiveAt: '2026-06-01 00:00',
    expiredAt: '-',
    status,
    owner,
    updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')} 09:30`,
  }
}

function createCostModelRecord(
  commodity: CommodityRecord,
  billingItem: BillingItemRecord,
  index: number,
): CostModelRecord {
  const product = getProductForCommodity(commodity)
  const costVersion = `CV-2026Q2-${String(index + 1).padStart(3, '0')}`
  const resourceAmount = 36000 + index * 7600
  const laborAmount = 18000 + (index % 6) * 5200
  const deliveryAmount = 9000 + (index % 5) * 6200
  const opsAmount = 7000 + (index % 4) * 3100
  const sharedAmount = 6000 + (index % 7) * 2400
  const total = resourceAmount + laborAmount + deliveryAmount + opsAmount + sharedAmount

  return {
    costModelId: `cost-model-${String(index + 1).padStart(3, '0')}`,
    costModelName: `${billingItem.name} 成本模型`,
    costModelCode: `CM-${billingItem.code}`,
    productId: product.id,
    productName: product.name,
    productType: getProductType(product),
    commodityId: commodity.id,
    commodityName: commodity.name,
    commodityType: commodity.commodityType,
    billingItemName: billingItem.name,
    billingItemCode: billingItem.code,
    chargeType: getCostChargeType(billingItem),
    meteringAssumption: `${billingItem.unit} 按 ${billingItem.meter} 计入目标成本。`,
    costBasis: getModelCostBasis(billingItem, commodity),
    totalTargetCost: formatCurrency(total),
    resourceCost: formatCurrency(resourceAmount),
    laborCost: formatCurrency(laborAmount),
    deliveryCost: formatCurrency(deliveryAmount),
    opsAllocation: formatCurrency(opsAmount),
    sharedCost: formatCurrency(sharedAmount),
    targetGrossMargin: `${64 - (index % 5)}%`,
    forecastGrossMargin: `${61 - (index % 6)}%`,
    riskStatus: index % 9 === 0 ? '风险' : index % 4 === 0 ? '关注' : '正常',
    status: index % 11 === 0 ? '草稿' : '生效中',
    costVersion,
    updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')} 16:20`,
    breakdown: createBreakdown(resourceAmount, laborAmount, deliveryAmount, opsAmount, sharedAmount, index),
    pricingSimulation: createPricingSimulation(billingItem, index),
    versions: createModelVersions(costVersion, product.owner, billingItem.name),
  }
}

function createBreakdown(
  resourceAmount: number,
  laborAmount: number,
  deliveryAmount: number,
  opsAmount: number,
  sharedAmount: number,
  index: number,
): CostBreakdownRecord[] {
  const resourceItem = pickCostItem(
    [
      'COST-RES-GPU-001',
      'COST-RES-CPU-002',
      'COST-RES-INF-003',
      'COST-RES-STO-004',
      'COST-RES-VEC-005',
      'COST-RES-ENV-006',
    ],
    index,
  )
  const laborItem = pickCostItem(
    [
      'COST-LAB-L1-001',
      'COST-LAB-L2-002',
      'COST-LAB-CSM-003',
      'COST-LAB-SCI-004',
    ],
    index,
  )
  const deliveryItem = pickCostItem(
    [
      'COST-DEL-IMP-001',
      'COST-DEL-DATA-002',
      'COST-DEL-ACC-003',
      'COST-DEL-MODEL-004',
    ],
    index,
  )
  const opsItem = pickCostItem(
    [
      'COST-OPS-SRE-001',
      'COST-OPS-MON-002',
      'COST-OPS-SEC-003',
      'COST-OPS-UPG-004',
    ],
    index,
  )
  const sharedItem = pickCostItem(
    ['COST-SHARED-OPS-001', 'COST-SHARED-MODEL-002', 'COST-SHARED-PMO-003'],
    index,
  )

  return [
    createBreakdownLine(resourceItem, `${120 + index * 8} 标准单位`, resourceAmount, '直接资源消耗'),
    createBreakdownLine(laborItem, `${4 + (index % 6)} 人天`, laborAmount, '售前、方案和客户成功投入'),
    createBreakdownLine(deliveryItem, `${1 + (index % 3)} 项`, deliveryAmount, '上线交付和验收成本'),
    createBreakdownLine(opsItem, `${1 + (index % 2)} 环境/月`, opsAmount, '运行维护与审计摊销'),
    createBreakdownLine(sharedItem, '按本期分摊规则', sharedAmount, '平台共享成本分摊'),
  ]
}

function pickCostItem(codes: string[], index: number): CostItemRecord {
  const code = codes[index % codes.length]
  const item = costItemRecords.find((record) => record.code === code)

  if (!item) {
    throw new Error(`Cost item not found for code ${code}`)
  }

  return item
}

function createBreakdownLine(
  item: CostItemRecord,
  quantityAssumption: string,
  amount: number,
  note: string,
): CostBreakdownRecord {
  return {
    costItemCode: item.code,
    costItemName: item.name,
    subject: item.subject,
    unit: item.unit,
    quantityAssumption,
    unitCost: item.standardUnitCost,
    costAmount: formatCurrency(amount),
    allocationMethod: item.allocationMethod,
    note,
  }
}

function createPricingSimulation(
  billingItem: BillingItemRecord,
  index: number,
): CostPricingSimulationRecord[] {
  return [
    {
      priceLine: '刊例价',
      discount: '100%',
      price: billingItem.publishedPrice,
      grossMargin: `${68 - (index % 5)}%`,
    },
    {
      priceLine: '自由折扣线',
      discount: '85%',
      price: '按刊例价 8.5 折',
      grossMargin: `${58 - (index % 5)}%`,
    },
    {
      priceLine: '一般折扣线',
      discount: '75%',
      price: '按刊例价 7.5 折',
      grossMargin: `${50 - (index % 5)}%`,
    },
    {
      priceLine: '产品折扣线',
      discount: '65%',
      price: '按刊例价 6.5 折',
      grossMargin: `${41 - (index % 5)}%`,
    },
    {
      priceLine: '出厂价折扣线',
      discount: '55%',
      price: '按刊例价 5.5 折',
      grossMargin: `${29 - (index % 5)}%`,
    },
  ]
}

function createModelVersions(
  costVersion: string,
  owner: string,
  billingItemName: string,
): CostModelVersionRecord[] {
  return [
    {
      costVersion,
      status: '已生效',
      createdAt: '2026-06-01 10:00',
      effectiveAt: '2026-06-01 00:00',
      creator: owner,
      summary: `${billingItemName} 二季度成本口径锁定。`,
    },
    {
      costVersion: `${costVersion}-draft`,
      status: '草稿',
      createdAt: '2026-06-08 16:40',
      effectiveAt: '-',
      creator: owner,
      summary: `${billingItemName} 三季度资源、人力和分摊口径草稿。`,
    },
    {
      costVersion: costVersion.replace('2026Q2', '2026Q1'),
      status: '已归档',
      createdAt: '2026-03-28 15:20',
      effectiveAt: '2026-04-01 00:00',
      creator: owner,
      summary: '一季度资源与人力成本基线归档。',
    },
  ]
}

function createAllocationRule(
  index: number,
  ruleName: string,
  sharedCostItemCode: string,
  allocationTarget: AllocationTarget,
  allocationDriver: AllocationDriver,
  allocationCycle: '月' | '季度' | '年度',
  products: ProductRecord[],
  currentAllocatedAmount: string,
  unallocatedAmount: string,
  allocationCompleteness: string,
  status: AllocationStatus,
): CostAllocationRecord {
  const item = costItemRecords.find((record) => record.code === sharedCostItemCode)

  return {
    allocationRuleId: `allocation-rule-${String(index).padStart(3, '0')}`,
    ruleName,
    ruleCode: `AR-2026Q2-${String(index).padStart(3, '0')}`,
    sharedCostItemCode,
    sharedCostItemName: item?.name ?? sharedCostItemCode,
    allocationTarget,
    allocationDriver,
    allocationCycle,
    productIds: products.map((product) => product.id),
    productNames: products.map((product) => product.name).join('、'),
    currentAllocatedAmount,
    unallocatedAmount,
    allocationCompleteness,
    status,
    updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')} 18:00`,
  }
}

function getProductForCommodity(commodity: CommodityRecord): ProductRecord {
  const product = productRecords.find(
    (record) => getProductType(record) === commodity.productType,
  )

  if (!product) {
    throw new Error(`Product not found for commodity ${commodity.id}`)
  }

  return product
}

function getProductType(product: ProductRecord): ProductType {
  return getProductTypeByProductId(product.id)
}

function getCostChargeType(
  billingItem: BillingItemRecord,
): CostModelRecord['chargeType'] {
  if (billingItem.unit.includes('人天')) {
    return '人天'
  }

  if (billingItem.unit.includes('项目') || billingItem.billingCycle.includes('项目')) {
    return '项目制'
  }

  return billingItem.chargeType
}

function getModelCostBasis(
  billingItem: BillingItemRecord,
  commodity: CommodityRecord,
) {
  if (commodity.commodityType === 'SaaS') {
    return `${billingItem.name} 按标准用量、订阅席位和共享模型服务分摊测算。`
  }

  return `${billingItem.name} 按项目交付、人力投入、专属环境和年度运维摊销测算。`
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function allProducts() {
  return productRecords
}

function productsByTypes(types: ProductType[]) {
  return productRecords.filter((record) => types.includes(getProductType(record)))
}

function getVersionObjectType(index: number): CostVersionRecord['objectType'] {
  const values: CostVersionRecord['objectType'][] = [
    '计费项',
    '商品',
    '产品',
    '成本项',
    '分摊规则',
  ]

  return values[index % values.length]
}

function getCostVersionChangeType(
  index: number,
): CostVersionRecord['changeType'] {
  const values: CostVersionRecord['changeType'][] = [
    '单价调整',
    '模型调整',
    '分摊规则调整',
    '人力成本调整',
    '资源价格调整',
    '口径锁定',
  ]

  return values[index % values.length]
}

function getVersionStatus(index: number): CostVersionStatus {
  if (index % 7 === 0) {
    return '草稿'
  }

  if (index % 5 === 0) {
    return '已归档'
  }

  return '已生效'
}
