export type ProductPlatformTab = 'product' | 'commodity' | 'cost'
export type CommodityStatus = '未发布' | '已发布' | '下架中' | '下架'
export type CommodityFilter = 'all'
export type ProductStage = '待发布' | 'Alpha' | 'Beta' | 'GA'
export type ExternalVisible = '是' | '否'
export type ProductType = '虚拟细胞' | '蛋白药物' | '合成生物' | '农业智能' | '通用产品'
export type ProductDetailTab = 'overview' | 'versions'
export type CommodityDetailTab = 'overview' | 'billing' | 'cost' | 'versions'
export type CommoditySaleType = 'SaaS' | '私有化部署'
export type BillingItemType =
  | '订阅授权'
  | '算力资源'
  | '模型调用'
  | '存储资源'
  | '专业服务'
  | '维保服务'
  | '交付实施'
export type PaymentType = '预付费' | '后付费'
export type BillingChargeType = '资源包' | '包月'
export type BillingItemStatus = '启用' | '停用'
export type VersionStatus = '草稿' | '已发布' | '已失效'

export type CommodityRecord = {
  id: string
  name: string
  productType: ProductType
  commodityType: CommoditySaleType
  owner: string
  updatedAt: string
  createdAt: string
  status: CommodityStatus
}

export type ProductRecord = {
  id: string
  name: string
  code: string
  owner: string
  stage: ProductStage
  externalVisible: ExternalVisible
  updatedAt: string
  createdAt: string
}

export type CommodityOverviewField = {
  label: string
  value: string
}

export type ProductOverviewField = {
  label: string
  value: string
}

export type BillingItemRecord = {
  id: string
  code: string
  name: string
  type: BillingItemType
  meteringContent: string
  chargeType: BillingChargeType
  chargeSpec: string
  unit: string
  meter: string
  paymentType: PaymentType
  billingCycle: string
  currency: string
  publishedPrice: string
  discountBasis: string
  minimumPurchase: string
  status: BillingItemStatus
  updatedAt: string
  description: string
}

export type CostDiscountRecord = {
  billingItemName: string
  billingItemCode: string
  freeDiscountLine: string
  standardDiscountLine: string
  productDiscountLine: string
  factoryDiscountLine: string
  totalTargetCost: string
  resourceCost: string
  l1Days: string
  l2Days: string
  csmDays: string
  deliveryDays: string
  freeGrossMargin: string
  standardGrossMargin: string
  productGrossMargin: string
  factoryGrossMargin: string
  costBasis: string
  updatedAt: string
}

export type CommodityVersionRecord = {
  version: string
  versionType: string
  status: VersionStatus
  summary: string
  creator: string
  createdAt: string
  publishedAt: string
  effectiveAt: string
}

export type ProductVersionRecord = {
  version: string
  versionType: string
  status: VersionStatus
  summary: string
  creator: string
  createdAt: string
  publishedAt: string
  effectiveAt: string
}

export type ProductDetailRecord = {
  productId: string
  description: string
  overview: ProductOverviewField[]
  versions: ProductVersionRecord[]
}

export type CommodityDetailRecord = {
  commodityId: string
  description: string
  overview: CommodityOverviewField[]
  billingItems: BillingItemRecord[]
  costDiscounts: CostDiscountRecord[]
  versions: CommodityVersionRecord[]
}

export const productPlatformTabs: { id: ProductPlatformTab; label: string }[] = [
  { id: 'product', label: '产品管理' },
  { id: 'commodity', label: '商品管理' },
  { id: 'cost', label: '成本管理' },
]

export const productDetailTabs: { id: ProductDetailTab; label: string }[] = [
  { id: 'overview', label: '产品概览' },
  { id: 'versions', label: '产品版本记录' },
]

export const commodityDetailTabs: { id: CommodityDetailTab; label: string }[] = [
  { id: 'overview', label: '商品概览' },
  { id: 'billing', label: '计费项' },
  { id: 'cost', label: '成本与折扣' },
  { id: 'versions', label: '商品版本记录' },
]

export const commodityPageSize = 10

export const productStages: ProductStage[] = ['待发布', 'Alpha', 'Beta', 'GA']

export const externalVisibleOptions: ExternalVisible[] = ['是', '否']

export const productTypes: ProductType[] = [
  '虚拟细胞',
  '蛋白药物',
  '合成生物',
  '农业智能',
  '通用产品',
]

export const commodityStatuses: CommodityStatus[] = [
  '未发布',
  '已发布',
  '下架中',
  '下架',
]

export const billingItemTypes: BillingItemType[] = [
  '订阅授权',
  '算力资源',
  '模型调用',
  '存储资源',
  '专业服务',
  '维保服务',
  '交付实施',
]

export const paymentTypes: PaymentType[] = ['预付费', '后付费']

export const productRecords: ProductRecord[] = [
  {
    id: 'product-virtual-cell',
    name: '虚拟细胞',
    code: 'PROD-VCELL',
    owner: '别西',
    stage: 'GA',
    externalVisible: '是',
    updatedAt: '2026-06-09 10:30',
    createdAt: '2026-03-12 09:20',
  },
  {
    id: 'product-protein-drug',
    name: '蛋白药物',
    code: 'PROD-PDRUG',
    owner: '王宗安',
    stage: 'Beta',
    externalVisible: '是',
    updatedAt: '2026-06-03 18:24',
    createdAt: '2026-03-18 11:05',
  },
  {
    id: 'product-synbio',
    name: '合成生物',
    code: 'PROD-SYNBIO',
    owner: '李一凡',
    stage: 'Beta',
    externalVisible: '是',
    updatedAt: '2026-06-09 09:40',
    createdAt: '2026-03-26 14:15',
  },
  {
    id: 'product-agriculture',
    name: '农业智能',
    code: 'PROD-AGRI',
    owner: '王曼',
    stage: 'Alpha',
    externalVisible: '是',
    updatedAt: '2026-05-30 12:55',
    createdAt: '2026-04-08 10:40',
  },
  {
    id: 'product-biomap-agent',
    name: 'BioMap Agent',
    code: 'PROD-BMAGENT',
    owner: '宋旭政俊',
    stage: '待发布',
    externalVisible: '否',
    updatedAt: '2026-05-28 14:22',
    createdAt: '2026-04-20 09:50',
  },
]

export const commodityRecords: CommodityRecord[] = [
  {
    id: 'commodity-virtual-cell-saas',
    name: '虚拟细胞平台-SaaS',
    productType: '虚拟细胞',
    commodityType: 'SaaS',
    owner: '别西',
    updatedAt: '2026-06-09 10:30',
    createdAt: '2026-04-02 09:15',
    status: '已发布',
  },
  {
    id: 'commodity-virtual-cell-private-subscription',
    name: '虚拟细胞平台-私部订阅',
    productType: '虚拟细胞',
    commodityType: '私有化部署',
    owner: '别西',
    updatedAt: '2026-06-08 18:42',
    createdAt: '2026-04-09 11:20',
    status: '已发布',
  },
  {
    id: 'commodity-virtual-cell-private-buyout',
    name: '虚拟细胞平台-私部买断',
    productType: '虚拟细胞',
    commodityType: '私有化部署',
    owner: '别西',
    updatedAt: '2026-06-07 16:08',
    createdAt: '2026-04-15 15:44',
    status: '已发布',
  },
  {
    id: 'commodity-virtual-cell-maintenance',
    name: '虚拟细胞平台-维保',
    productType: '虚拟细胞',
    commodityType: '私有化部署',
    owner: '别西',
    updatedAt: '2026-06-06 12:24',
    createdAt: '2026-04-18 10:30',
    status: '已发布',
  },
  {
    id: 'commodity-virtual-cell-labor-service',
    name: '虚拟细胞平台-人力服务',
    productType: '虚拟细胞',
    commodityType: '私有化部署',
    owner: '别西',
    updatedAt: '2026-06-05 14:50',
    createdAt: '2026-04-22 13:12',
    status: '已发布',
  },
  {
    id: 'commodity-synbio-saas',
    name: '合成生物平台-SaaS',
    productType: '合成生物',
    commodityType: 'SaaS',
    owner: '李一凡',
    updatedAt: '2026-06-09 09:40',
    createdAt: '2026-05-06 10:16',
    status: '已发布',
  },
  {
    id: 'commodity-synbio-private-subscription',
    name: '合成生物平台-私部订阅',
    productType: '合成生物',
    commodityType: '私有化部署',
    owner: '李一凡',
    updatedAt: '2026-06-08 11:35',
    createdAt: '2026-05-08 14:20',
    status: '未发布',
  },
  {
    id: 'commodity-synbio-private-buyout',
    name: '合成生物平台-私部买断',
    productType: '合成生物',
    commodityType: '私有化部署',
    owner: '李一凡',
    updatedAt: '2026-06-07 10:12',
    createdAt: '2026-05-11 09:42',
    status: '已发布',
  },
  {
    id: 'commodity-synbio-maintenance',
    name: '合成生物平台-维保',
    productType: '合成生物',
    commodityType: '私有化部署',
    owner: '李一凡',
    updatedAt: '2026-06-05 17:28',
    createdAt: '2026-05-13 11:08',
    status: '下架中',
  },
  {
    id: 'commodity-synbio-labor-service',
    name: '合成生物平台-人力服务',
    productType: '合成生物',
    commodityType: '私有化部署',
    owner: '李一凡',
    updatedAt: '2026-06-04 15:06',
    createdAt: '2026-05-14 16:35',
    status: '下架',
  },
  {
    id: 'commodity-protein-drug-saas',
    name: '蛋白药物平台-SaaS',
    productType: '蛋白药物',
    commodityType: 'SaaS',
    owner: '王宗安',
    updatedAt: '2026-06-03 18:24',
    createdAt: '2026-04-30 13:18',
    status: '已发布',
  },
  {
    id: 'commodity-protein-drug-private-subscription',
    name: '蛋白药物平台-私部订阅',
    productType: '蛋白药物',
    commodityType: '私有化部署',
    owner: '王宗安',
    updatedAt: '2026-06-02 11:12',
    createdAt: '2026-05-02 09:24',
    status: '未发布',
  },
  {
    id: 'commodity-protein-drug-maintenance',
    name: '蛋白药物平台-维保',
    productType: '蛋白药物',
    commodityType: '私有化部署',
    owner: '王宗安',
    updatedAt: '2026-06-01 16:10',
    createdAt: '2026-05-03 10:46',
    status: '下架中',
  },
  {
    id: 'commodity-protein-drug-labor-service',
    name: '蛋白药物平台-人力服务',
    productType: '蛋白药物',
    commodityType: '私有化部署',
    owner: '王宗安',
    updatedAt: '2026-05-31 15:40',
    createdAt: '2026-05-04 14:10',
    status: '已发布',
  },
  {
    id: 'commodity-agriculture-saas',
    name: '农业智能平台-SaaS',
    productType: '农业智能',
    commodityType: 'SaaS',
    owner: '王曼',
    updatedAt: '2026-05-30 12:55',
    createdAt: '2026-04-28 10:12',
    status: '已发布',
  },
  {
    id: 'commodity-agriculture-labor-service',
    name: '农业智能平台-人力服务',
    productType: '农业智能',
    commodityType: '私有化部署',
    owner: '王曼',
    updatedAt: '2026-05-29 17:32',
    createdAt: '2026-04-26 11:35',
    status: '未发布',
  },
  {
    id: 'commodity-biomap-agent-saas',
    name: 'BioMap Agent - SaaS',
    productType: '通用产品',
    commodityType: 'SaaS',
    owner: '宋旭政俊',
    updatedAt: '2026-05-28 14:22',
    createdAt: '2026-04-20 09:50',
    status: '已发布',
  },
]

const productCodeByType: Record<ProductType, string> = {
  虚拟细胞: 'VCELL',
  蛋白药物: 'PDRUG',
  合成生物: 'SYNBIO',
  农业智能: 'AGRI',
  通用产品: 'GEN',
}

const productTaxRateByType: Record<ProductType, string> = {
  虚拟细胞: '6%',
  蛋白药物: '6%',
  合成生物: '6%',
  农业智能: '6%',
  通用产品: '6%',
}

const productDescriptionByType: Record<ProductType, string> = {
  虚拟细胞: '面向虚拟细胞建模与仿真的',
  蛋白药物: '面向蛋白药物发现与优化的',
  合成生物: '面向菌株设计、路径优化与实验闭环的',
  农业智能: '面向农业性状分析、种质评估与田间决策的',
  通用产品: '面向企业级智能体工作流编排的',
}

export const productDetailsById: Record<string, ProductDetailRecord> =
  Object.fromEntries(
    productRecords.map((record) => [record.id, createProductDetail(record)]),
  )

export function getProductDetail(
  productId: string | null,
): ProductDetailRecord | null {
  if (!productId) {
    return null
  }

  return productDetailsById[productId] ?? null
}

export const commodityDetailsById: Record<string, CommodityDetailRecord> =
  Object.fromEntries(
    commodityRecords.map((record, index) => [
      record.id,
      createCommodityDetail(record, index),
    ]),
  )

export function getCommodityDetail(
  commodityId: string | null,
): CommodityDetailRecord | null {
  if (!commodityId) {
    return null
  }

  return commodityDetailsById[commodityId] ?? null
}

function createCommodityDetail(
  record: CommodityRecord,
  recordIndex: number,
): CommodityDetailRecord {
  const code = createCommodityCode(record, recordIndex)
  const billingItems = createBillingItems(record, code)
  const overview = createOverviewFields(record, code, billingItems)

  return {
    commodityId: record.id,
    description: createCommodityDescription(record),
    overview,
    billingItems,
    costDiscounts: billingItems.map((item, index) =>
      createCostDiscountRecord(item, record, index),
    ),
    versions: createVersionRecords(record),
  }
}

function createProductDetail(record: ProductRecord): ProductDetailRecord {
  return {
    productId: record.id,
    description: createProductDescription(record),
    overview: createProductOverviewFields(record),
    versions: createProductVersionRecords(record),
  }
}

function createProductDescription(record: ProductRecord) {
  const productType = getProductTypeForRecord(record)

  if (record.name === 'BioMap Agent') {
    return '面向企业级智能体工作流编排的产品，承载 SaaS 商品的目录、权限和计费展示。'
  }

  return `${productDescriptionByType[productType]}产品，统一承载 SaaS、私有化部署与服务商品的版本管理。`
}

function createProductOverviewFields(record: ProductRecord): ProductOverviewField[] {
  const productType = getProductTypeForRecord(record)
  const relatedCommodities = commodityRecords.filter(
    (commodity) => commodity.productType === productType,
  )
  const publishedCount = relatedCommodities.filter(
    (commodity) => commodity.status === '已发布',
  ).length

  return [
    { label: '产品名称', value: record.name },
    { label: '产品编号', value: record.code },
    { label: '产品ID', value: record.id },
    { label: '负责人', value: record.owner },
    { label: '产品阶段', value: record.stage },
    { label: '外部可见', value: record.externalVisible },
    { label: '所属业务线', value: getProductBusinessLine(productType) },
    { label: '默认商品类型', value: getDefaultCommodityTypes(productType) },
    { label: '关联商品数', value: `${relatedCommodities.length} 个` },
    { label: '已发布商品数', value: `${publishedCount} 个` },
    { label: '计费状态', value: relatedCommodities.length > 0 ? '已配置' : '待配置' },
    { label: '税率', value: productTaxRateByType[productType] },
    { label: '版本策略', value: record.stage === 'GA' ? '正式版本' : '迭代版本' },
    { label: '创建时间', value: record.createdAt },
    { label: '更新时间', value: record.updatedAt },
  ]
}

function createProductVersionRecords(record: ProductRecord): ProductVersionRecord[] {
  return [
    {
      version: 'v2.0-draft',
      versionType: '草稿版本',
      status: '草稿',
      summary: '补充产品阶段与外部可见配置，准备联动商品目录展示。',
      creator: record.owner,
      createdAt: '2026-06-09 09:18',
      publishedAt: '-',
      effectiveAt: '-',
    },
    {
      version: 'v1.3',
      versionType: '正式版本',
      status: record.stage === '待发布' ? '已失效' : '已发布',
      summary: '同步产品负责人、商品目录和版本说明字段。',
      creator: record.owner,
      createdAt: '2026-05-16 14:20',
      publishedAt: record.stage === '待发布' ? '-' : '2026-05-22 10:00',
      effectiveAt: record.stage === '待发布' ? '-' : '2026-05-22 00:00',
    },
    {
      version: 'v1.0',
      versionType: '正式版本',
      status: '已失效',
      summary: '产品首次建档，建立基础产品信息和商品映射关系。',
      creator: record.owner,
      createdAt: record.createdAt,
      publishedAt: '2026-04-30 10:00',
      effectiveAt: '2026-05-01 00:00',
    },
  ]
}

function getProductTypeForRecord(record: ProductRecord): ProductType {
  if (record.name === 'BioMap Agent') {
    return '通用产品'
  }

  return record.name as ProductType
}

function getProductBusinessLine(productType: ProductType) {
  switch (productType) {
    case '虚拟细胞':
      return 'AI for Cell'
    case '蛋白药物':
      return 'AI for Protein Therapeutics'
    case '合成生物':
      return 'AI for Synthetic Biology'
    case '农业智能':
      return 'AI for Agriculture'
    case '通用产品':
      return 'Enterprise AI Platform'
  }
}

function getDefaultCommodityTypes(productType: ProductType) {
  return productType === '通用产品' ? 'SaaS' : 'SaaS / 私有化部署'
}

function createCommodityCode(record: CommodityRecord, recordIndex: number) {
  return `${productCodeByType[record.productType]}-COMM-${String(
    recordIndex + 1,
  ).padStart(3, '0')}`
}

function createCommodityDescription(record: CommodityRecord) {
  const suffix = getCommodityMode(record)

  if (record.name === 'BioMap Agent - SaaS') {
    return '面向企业级智能体工作流编排的 SaaS 商品，覆盖知识库、自动化任务与团队协作。'
  }

  return `${productDescriptionByType[record.productType]} ${suffix} 商品，覆盖销售报价、交付核算与续约管理。`
}

function createOverviewFields(
  record: CommodityRecord,
  code: string,
  billingItems: BillingItemRecord[],
): CommodityOverviewField[] {
  const mode = getCommodityMode(record)

  return [
    { label: '商品名称', value: record.name },
    { label: '商品编号', value: code },
    { label: '商品ID', value: record.id },
    { label: '所属产品', value: record.productType },
    { label: '商品负责人', value: record.owner },
    { label: '状态', value: record.status },
    { label: '销售模式', value: mode },
    { label: '计费模式', value: getBillingMode(record) },
    { label: '税率', value: productTaxRateByType[record.productType] },
    { label: '币种', value: 'CNY' },
    { label: '结算周期', value: mode === 'SaaS' ? '月度 / 年度' : '项目制' },
    { label: '计费项数量', value: `${billingItems.length} 项` },
    { label: '生效时间', value: record.status === '已发布' ? '2026-06-01 00:00' : '-' },
    { label: '创建时间', value: record.createdAt },
    { label: '更新时间', value: record.updatedAt },
    { label: '客户可见', value: record.status === '已发布' ? '是' : '否' },
  ]
}

function createBillingItems(
  record: CommodityRecord,
  commodityCode: string,
): BillingItemRecord[] {
  const baseName = getBaseName(record)
  const prefix = `${commodityCode}-BI`

  if (record.name === 'BioMap Agent - SaaS') {
    return [
      createBillingItem(prefix, 1, 'Agent 基础订阅', '订阅授权', '租户/月', '按租户开通时长计量', '预付费', '月度 / 年度', '¥18,000 / 月'),
      createBillingItem(prefix, 2, 'Agent 工作流执行量', '模型调用', '千次执行', '按成功完成的工作流执行次数计量', '后付费', '月度', '¥220 / 千次'),
      createBillingItem(prefix, 3, '知识库容量', '存储资源', '100GB/月', '按企业知识库实际占用容量计量', '后付费', '月度', '¥480 / 100GB'),
      createBillingItem(prefix, 4, '企业集成服务', '专业服务', '人天', '按集成实施与验收人天计量', '预付费', '项目制', '¥6,000 / 人天'),
    ]
  }

  if (record.name.includes('SaaS')) {
    if (record.id === 'commodity-virtual-cell-saas') {
      return [
        createBillingItem(prefix, 1, '虚拟细胞积分资源包-10000', '算力资源', '积分', '按虚拟细胞平台积分消耗计量', '预付费', '资源包', '¥9,800 / 包'),
        createBillingItem(prefix, 2, '虚拟细胞积分资源包-50000', '算力资源', '积分', '按虚拟细胞平台积分消耗计量', '预付费', '资源包', '¥45,000 / 包'),
        createBillingItem(prefix, 3, '虚拟细胞积分资源包-100000', '算力资源', '积分', '按虚拟细胞平台积分消耗计量', '预付费', '资源包', '¥86,000 / 包'),
        createBillingItem(prefix, 4, `${baseName}基础订阅`, '订阅授权', '租户/月', '按租户开通时长计量', '预付费', '月度 / 年度', '¥36,000 / 月'),
        createBillingItem(prefix, 5, '工作空间席位', '订阅授权', '席位/月', '按启用用户席位计量', '预付费', '月度 / 年度', '¥1,200 / 席位/月'),
        createBillingItem(prefix, 6, '模型推理调用量', '模型调用', '万次调用', '按模型 API 成功调用次数计量', '后付费', '月度', '¥860 / 万次'),
        createBillingItem(prefix, 7, '高性能计算资源包', '算力资源', '千核时', '按 CPU/GPU 归一化核时计量', '后付费', '月度', '¥2,400 / 千核时'),
      ]
    }

    return [
      createBillingItem(prefix, 1, `${baseName}基础订阅`, '订阅授权', '租户/月', '按租户开通时长计量', '预付费', '月度 / 年度', '¥36,000 / 月'),
      createBillingItem(prefix, 2, '工作空间席位', '订阅授权', '席位/月', '按启用用户席位计量', '预付费', '月度 / 年度', '¥1,200 / 席位/月'),
      createBillingItem(prefix, 3, '模型推理调用量', '模型调用', '万次调用', '按模型 API 成功调用次数计量', '后付费', '月度', '¥860 / 万次'),
      createBillingItem(prefix, 4, '高性能计算资源包', '算力资源', '千核时', '按 CPU/GPU 归一化核时计量', '后付费', '月度', '¥2,400 / 千核时'),
    ]
  }

  if (record.name.includes('私部订阅')) {
    return [
      createBillingItem(prefix, 1, `${baseName}专属环境订阅`, '订阅授权', '环境/月', '按专属部署环境开通时长计量', '预付费', '年度', '¥480,000 / 年'),
      createBillingItem(prefix, 2, '私有算力资源', '算力资源', '节点/月', '按私有计算节点规格与数量计量', '预付费', '年度', '¥36,000 / 节点/月'),
      createBillingItem(prefix, 3, '数据隔离存储', '存储资源', 'TB/月', '按隔离存储容量峰值计量', '后付费', '月度', '¥1,800 / TB/月'),
      createBillingItem(prefix, 4, '运维支持包', '维保服务', '服务包/年', '按 SLA 服务包年度计量', '预付费', '年度', '¥120,000 / 年'),
    ]
  }

  if (record.name.includes('私部买断')) {
    return [
      createBillingItem(prefix, 1, `${baseName}平台买断许可`, '订阅授权', '套', '按一次性软件许可计量', '预付费', '一次性', '¥2,800,000 / 套'),
      createBillingItem(prefix, 2, '初始化部署', '交付实施', '项目', '按部署项目范围计量', '预付费', '项目制', '¥360,000 / 项目'),
      createBillingItem(prefix, 3, '专属模型适配', '专业服务', '人天', '按模型适配专家投入计量', '预付费', '项目制', '¥8,000 / 人天'),
      createBillingItem(prefix, 4, '年度维保', '维保服务', '年', '按买断后年度维保计量', '预付费', '年度', '¥320,000 / 年'),
    ]
  }

  if (record.name.includes('维保')) {
    return [
      createBillingItem(prefix, 1, `${baseName}标准维保`, '维保服务', '年', '按标准维保年度计量', '预付费', '年度', '¥180,000 / 年'),
      createBillingItem(prefix, 2, 'SLA 响应服务', '维保服务', '服务包/年', '按响应等级与服务包计量', '预付费', '年度', '¥90,000 / 年'),
      createBillingItem(prefix, 3, '版本升级服务', '专业服务', '人天', '按升级评估与执行人天计量', '后付费', '项目制', '¥6,500 / 人天'),
    ]
  }

  return [
    createBillingItem(prefix, 1, 'L1 科学支持', '专业服务', '人天', '按 L1 科学支持人天计量', '后付费', '项目制', '¥4,500 / 人天'),
    createBillingItem(prefix, 2, 'L2 方案专家', '专业服务', '人天', '按 L2 方案专家人天计量', '后付费', '项目制', '¥7,500 / 人天'),
    createBillingItem(prefix, 3, 'CSM 项目治理', '专业服务', '人天', '按 CSM 项目管理人天计量', '后付费', '项目制', '¥5,500 / 人天'),
    createBillingItem(prefix, 4, '交付实施', '交付实施', '人天', '按交付实施人天计量', '后付费', '项目制', '¥6,000 / 人天'),
  ]
}

function createBillingItem(
  codePrefix: string,
  itemIndex: number,
  name: string,
  type: BillingItemType,
  unit: string,
  meter: string,
  paymentType: PaymentType,
  billingCycle: string,
  publishedPrice: string,
): BillingItemRecord {
  const code = `${codePrefix}-${String(itemIndex).padStart(3, '0')}`
  const chargeType = getBillingChargeType(name, unit, billingCycle)

  return {
    id: `${code.toLowerCase()}-id`,
    code,
    name,
    type,
    meteringContent: getMeteringContent(name, type),
    chargeType,
    chargeSpec: getChargeSpec(chargeType, name, unit, billingCycle),
    unit,
    meter,
    paymentType,
    billingCycle,
    currency: 'CNY',
    publishedPrice,
    discountBasis: getDiscountBasis(paymentType, chargeType),
    minimumPurchase: getMinimumPurchase(chargeType, unit),
    status: '启用',
    updatedAt: '2026-06-09 10:00',
    description: getBillingItemDescription(name, type),
  }
}

function createCostDiscountRecord(
  item: BillingItemRecord,
  record: CommodityRecord,
  index: number,
): CostDiscountRecord {
  const isUsage = item.paymentType === '后付费'
  const daySeed = index + 1

  return {
    billingItemName: item.name,
    billingItemCode: item.code,
    freeDiscountLine: isUsage ? '8.8折' : '8.5折',
    standardDiscountLine: isUsage ? '7.8折' : '7.5折',
    productDiscountLine: isUsage ? '6.8折' : '6.5折',
    factoryDiscountLine: isUsage ? '5.8折' : '5.5折',
    totalTargetCost: `¥${(42 + daySeed * 8).toLocaleString('zh-CN')},000`,
    resourceCost: `¥${(28 + daySeed * 5).toLocaleString('zh-CN')},000`,
    l1Days: formatWorkDays(daySeed * 1.5),
    l2Days: formatWorkDays(daySeed * 1.2),
    csmDays: formatWorkDays(daySeed),
    deliveryDays: formatWorkDays(daySeed * 2),
    freeGrossMargin: isUsage ? '48%' : '52%',
    standardGrossMargin: isUsage ? '41%' : '45%',
    productGrossMargin: isUsage ? '33%' : '36%',
    factoryGrossMargin: isUsage ? '22%' : '25%',
    costBasis: getCostBasis(item, record),
    updatedAt: '2026-06-09 10:12',
  }
}

function formatWorkDays(days: number) {
  return Number(days.toFixed(1)).toString()
}

function createVersionRecords(record: CommodityRecord): CommodityVersionRecord[] {
  return [
    {
      version: 'v1.2-draft',
      versionType: '草稿版本',
      status: '草稿',
      summary: '新增算力资源包阶梯口径，调整后付费计量说明。',
      creator: record.owner,
      createdAt: '2026-06-09 09:30',
      publishedAt: '-',
      effectiveAt: '-',
    },
    {
      version: 'v1.1',
      versionType: '正式版本',
      status: record.status === '已发布' ? '已发布' : '已失效',
      summary: '同步最新刊例价、折扣线和交付成本口径。',
      creator: record.owner,
      createdAt: '2026-05-20 14:12',
      publishedAt: '2026-06-01 10:00',
      effectiveAt: '2026-06-01 00:00',
    },
    {
      version: 'v1.0',
      versionType: '正式版本',
      status: '已失效',
      summary: '商品首次建档，建立基础计费项和成本模型。',
      creator: record.owner,
      createdAt: record.createdAt,
      publishedAt: '2026-05-01 10:00',
      effectiveAt: '2026-05-01 00:00',
    },
  ]
}

function getBaseName(record: CommodityRecord) {
  if (record.name === 'BioMap Agent - SaaS') {
    return 'BioMap Agent'
  }

  return record.name.split('-')[0] ?? record.name
}

function getCommodityMode(record: CommodityRecord) {
  if (record.name.includes('SaaS')) {
    return 'SaaS'
  }

  if (record.name.includes('私部订阅')) {
    return '私部订阅'
  }

  if (record.name.includes('私部买断')) {
    return '私部买断'
  }

  if (record.name.includes('维保')) {
    return '维保'
  }

  return '人力服务'
}

function getBillingMode(record: CommodityRecord) {
  if (record.name.includes('SaaS')) {
    return '订阅 + 按量'
  }

  if (record.name.includes('人力服务')) {
    return '后付费'
  }

  return '预付费为主'
}

function getBillingChargeType(
  name: string,
  unit: string,
  billingCycle: string,
): BillingChargeType {
  if (
    name.includes('资源包') ||
    name.includes('模型推理') ||
    name.includes('工作流执行') ||
    name.includes('容量') ||
    unit.includes('万次') ||
    unit.includes('千次') ||
    unit.includes('核时') ||
    unit.includes('GB') ||
    unit.includes('TB') ||
    unit.includes('人天')
  ) {
    return '资源包'
  }

  if (
    billingCycle.includes('月') ||
    billingCycle.includes('年度') ||
    unit.includes('/月') ||
    unit.includes('/年') ||
    name.includes('订阅') ||
    name.includes('维保')
  ) {
    return '包月'
  }

  return '资源包'
}

function getMeteringContent(name: string, type: BillingItemType) {
  if (name.includes('虚拟细胞平台') && name.includes('基础订阅')) {
    return '虚拟细胞建模工作空间'
  }

  if (name.includes('Agent 基础订阅')) {
    return 'Agent 工作空间租户'
  }

  if (name.includes('工作流执行')) {
    return 'Agent 工作流成功执行次数'
  }

  if (name.includes('知识库')) {
    return '企业知识库实际容量'
  }

  if (name.includes('席位')) {
    return '启用用户席位数量'
  }

  if (name.includes('模型推理')) {
    return '模型推理 API 调用次数'
  }

  if (name.includes('高性能计算') || name.includes('算力')) {
    return 'CPU/GPU 归一化算力'
  }

  if (name.includes('积分资源包')) {
    return '虚拟细胞平台积分'
  }

  if (name.includes('存储')) {
    return '隔离数据存储容量'
  }

  if (type === '专业服务' || type === '交付实施') {
    return '专家交付人天'
  }

  if (type === '维保服务') {
    return '年度维保服务范围'
  }

  return '商品授权使用量'
}

function getBillingItemDescription(name: string, type: BillingItemType) {
  const content = getMeteringContent(name, type)

  if (name.includes('积分资源包')) {
    return `${content}资源包，用于抵扣虚拟细胞建模、仿真和推理任务的积分消耗。`
  }

  if (type === '算力资源') {
    return `${content}，用于支撑模型推理、批量仿真和高性能计算任务。`
  }

  if (type === '模型调用') {
    return `${content}，按调用成功次数进入费用核算。`
  }

  if (type === '订阅授权') {
    return `${content}，按租户、席位或环境开通周期计费。`
  }

  if (type === '存储资源') {
    return `${content}，按计费周期内资源容量核算。`
  }

  if (type === '维保服务') {
    return `${content}，覆盖版本升级、SLA 响应和日常运维支持。`
  }

  return `${content}，按项目实际投入和验收范围核算。`
}

function getChargeSpec(
  chargeType: BillingChargeType,
  name: string,
  unit: string,
  billingCycle: string,
) {
  if (chargeType === '包月') {
    return billingCycle.includes('年度') ? '12个月' : '1个月'
  }

  if (name.includes('模型推理')) {
    return '100万次调用'
  }

  if (name.includes('积分资源包-100000')) {
    return '100,000积分'
  }

  if (name.includes('积分资源包-50000')) {
    return '50,000积分'
  }

  if (name.includes('积分资源包-10000')) {
    return '10,000积分'
  }

  if (name.includes('工作流执行')) {
    return '10万次执行'
  }

  if (name.includes('高性能计算') || unit.includes('千核时')) {
    return '10,000核时'
  }

  if (unit.includes('TB')) {
    return '10TB'
  }

  if (unit.includes('100GB')) {
    return '1TB'
  }

  if (unit.includes('人天')) {
    return '10人天'
  }

  if (unit.includes('项目')) {
    return '1个项目'
  }

  if (unit.includes('套')) {
    return '1套'
  }

  return '1个资源包'
}

function getDiscountBasis(
  paymentType: PaymentType,
  chargeType: BillingChargeType,
) {
  if (paymentType === '后付费') {
    return '按刊例价折扣'
  }

  return chargeType === '包月' ? '按订阅刊例价折扣' : '按刊例价折扣'
}

function getMinimumPurchase(chargeType: BillingChargeType, unit: string) {
  if (chargeType === '包月') {
    return '1个月'
  }

  if (unit.includes('人天')) {
    return '1人天'
  }

  if (unit.includes('项目')) {
    return '1个项目'
  }

  return '1个资源包'
}

function getCostBasis(item: BillingItemRecord, record: CommodityRecord) {
  if (item.type === '算力资源' || item.type === '模型调用') {
    return '按年度容量预算'
  }

  if (item.type === '专业服务' || item.type === '交付实施') {
    return '按标准人天成本'
  }

  if (record.name.includes('买断')) {
    return '按项目一次性交付成本'
  }

  return '按年度订阅成本'
}
