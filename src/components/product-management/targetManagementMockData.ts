import {
  commodityRecords,
  getCommodityDetail,
  getProductTypeByProductId,
  productRecords,
  type BillingItemRecord,
  type CommodityRecord,
  type ProductType,
} from './productManagementMockData'
import {
  costModelRecords,
  costSubjects,
  type CostModelRecord,
  type CostSubject,
} from './costManagementMockData'

export type TargetSection =
  | 'overview'
  | 'quarterly'
  | 'contributions'
  | 'margins'
  | 'versions'
export type TargetRiskStatus = '正常' | '关注' | '风险'
export type TargetStatus = '草稿' | '进行中' | '已完成' | '已锁定'
export type VarianceType = '正向' | '轻微负向' | '重大负向'
export type TargetVersionStatus = '草稿' | '已生效' | '已归档'

export type QuarterlyTargetRecord = {
  targetId: string
  targetName: string
  targetCode: string
  productId: string
  productName: string
  productOwner: string
  year: '2026'
  quarter: 'Q2' | 'Q3'
  revenueTarget: string
  achievedRevenue: string
  attainmentRate: string
  costBudget: string
  confirmedCost: string
  costUsageRate: string
  targetGrossProfit: string
  actualGrossProfit: string
  targetGrossMargin: string
  actualGrossMargin: string
  forecastAttainmentRate: string
  riskStatus: TargetRiskStatus
  status: TargetStatus
  updatedAt: string
}

export type TargetMonthlyTrendRecord = {
  targetId: string
  productId: string
  month: '2026-04' | '2026-05' | '2026-06' | '2026-07' | '2026-08' | '2026-09'
  monthlyTarget: string
  actualRevenue: string
  monthlyCost: string
  monthlyGrossMargin: string
  cumulativeAttainmentRate: string
}

export type TargetRiskNoteRecord = {
  targetId: string
  productId: string
  riskLevel: TargetRiskStatus
  reason: string
  impactTarget: string
  suggestedAction: string
  owner: string
  updatedAt: string
}

export type TargetDetailRecord = {
  targetId: string
  monthlyTrends: TargetMonthlyTrendRecord[]
  commodityContributions: TargetCommodityContributionRecord[]
  costStructure: TargetCostStructureRecord[]
  versions: TargetVersionRecord[]
  riskNotes: TargetRiskNoteRecord[]
}

export type TargetCommodityContributionRecord = {
  id: string
  targetId: string
  productId: string
  productName: string
  commodityId: string
  commodityName: string
  billingItemCode: string
  billingItemName: string
  costModelId: string
  costVersion: string
  revenueTarget: string
  achievedRevenue: string
  contributionRate: string
  costBudget: string
  confirmedCost: string
  grossMargin: string
  riskStatus: TargetRiskStatus
  updatedAt: string
}

export type TargetCostStructureRecord = {
  id: string
  targetId: string
  productId: string
  productName: string
  costSubject: CostSubject
  targetCost: string
  confirmedCost: string
  usageRate: string
  allocationBasis: string
  riskStatus: TargetRiskStatus
  owner: string
  updatedAt: string
}

export type TargetMarginVarianceRecord = {
  id: string
  targetId: string
  productId: string
  productName: string
  commodityId: string
  commodityName: string
  billingItemCode: string
  billingItemName: string
  costModelId: string
  costVersion: string
  targetCost: string
  actualCost: string
  costVariance: string
  targetGrossMargin: string
  actualGrossMargin: string
  marginVariance: string
  varianceType: VarianceType
  reason: string
  suggestedAction: string
  updatedAt: string
}

export type TargetVersionRecord = {
  targetVersion: string
  targetId: string
  productId: string
  productName: string
  commodityId: string
  commodityName: string
  billingItemCode: string
  billingItemName: string
  costModelId: string
  costVersion: string
  changeType: '创建' | '目标调整' | '成本预算调整' | '预测调整' | '锁定' | '复盘'
  status: TargetVersionStatus
  impactRevenue: string
  impactCost: string
  impactGrossMargin: string
  effectiveAt: string
  creator: string
  createdAt: string
  description: string
}

export type TargetOverviewRecord = {
  targetId: string
  productId: string
  productName: string
  productOwner: string
  quarter: 'Q2' | 'Q3'
  revenueTarget: string
  achievedRevenue: string
  attainmentRate: string
  costBudget: string
  confirmedCost: string
  costUsageRate: string
  targetGrossProfit: string
  actualGrossProfit: string
  targetGrossMargin: string
  actualGrossMargin: string
  forecastAttainmentRate: string
  riskStatus: TargetRiskStatus
  updatedAt: string
}

export const targetSections: { id: TargetSection; label: string }[] = [
  { id: 'overview', label: '目标总览' },
  { id: 'quarterly', label: '季度目标' },
  { id: 'contributions', label: '商品贡献' },
  { id: 'margins', label: '成本与毛利' },
  { id: 'versions', label: '目标版本记录' },
]

export const targetRiskStatuses: TargetRiskStatus[] = ['正常', '关注', '风险']

export const quarterlyTargetRecords: QuarterlyTargetRecord[] = productRecords.flatMap(
  (product, index) => [
    createQuarterlyTarget(product, index, 'Q2'),
    createQuarterlyTarget(product, index, 'Q3'),
  ],
)

export const targetDetailsById: Record<string, TargetDetailRecord> =
  Object.fromEntries(
    quarterlyTargetRecords.map((target) => [
      target.targetId,
      {
        targetId: target.targetId,
        monthlyTrends: createMonthlyTrends(target),
        commodityContributions: createDetailCommodityContributions(target),
        costStructure: createTargetCostStructure(target),
        versions: createDetailTargetVersions(target),
        riskNotes: createRiskNotes(target),
      },
    ]),
  )

export function getTargetDetail(targetId: string | null) {
  if (!targetId) {
    return null
  }

  return targetDetailsById[targetId] ?? null
}

export const targetCommodityContributionRecords: TargetCommodityContributionRecord[] =
  (['Q2', 'Q3'] as const).flatMap((quarter) =>
    commodityRecords.map((commodity, index) => {
      const model = getPrimaryModelForCommodity(commodity.id)
      const target = getQuarterlyTargetForProduct(model.productId, quarter)
      const productCommodities = commodityRecords.filter(
        (record) => record.productType === commodity.productType,
      )
      const commodityIndex = productCommodities.findIndex(
        (record) => record.id === commodity.id,
      )
      const allocationWeights = productCommodities.map(
        (_, weightIndex) => weightIndex + 1,
      )
      const totalWeight = allocationWeights.reduce((sum, weight) => sum + weight, 0)
      const allocationWeight = allocationWeights[commodityIndex] ?? 1
      const revenueTarget = Math.round(
        parseCurrency(target.revenueTarget) * 0.96 * (allocationWeight / totalWeight),
      )
      const achievedRevenue =
        quarter === 'Q3'
          ? 0
          : Math.round(revenueTarget * (0.58 + (index % 5) * 0.06))
      const confirmedCost =
        quarter === 'Q3'
          ? 0
          : Math.round(achievedRevenue * (0.28 + (index % 4) * 0.03))

      return {
        id: `target-contribution-${quarter.toLowerCase()}-${String(index + 1).padStart(3, '0')}`,
        targetId: target.targetId,
        productId: model.productId,
        productName: model.productName,
        commodityId: commodity.id,
        commodityName: commodity.name,
        billingItemCode: model.billingItemCode,
        billingItemName: model.billingItemName,
        costModelId: model.costModelId,
        costVersion: model.costVersion,
        revenueTarget: formatCurrency(revenueTarget),
        achievedRevenue: quarter === 'Q3' ? '0' : formatCurrency(achievedRevenue),
        contributionRate:
          quarter === 'Q3'
            ? '0'
            : `${Math.round((achievedRevenue / revenueTarget) * 100)}%`,
        costBudget: formatCurrency(Math.round(revenueTarget * 0.36)),
        confirmedCost: quarter === 'Q3' ? '0' : formatCurrency(confirmedCost),
        grossMargin:
          quarter === 'Q3'
            ? '-'
            : `${Math.round(((achievedRevenue - confirmedCost) / achievedRevenue) * 100)}%`,
        riskStatus:
          quarter === 'Q3'
            ? target.riskStatus
            : index % 6 === 0
              ? '风险'
              : index % 4 === 0
                ? '关注'
                : '正常',
        updatedAt:
          quarter === 'Q3'
            ? '2026-06-10 15:30'
            : `2026-06-${String((index % 9) + 1).padStart(2, '0')} 15:30`,
      }
    }),
  )

const marginVarianceModelKeys = [
  'VCELL-COMM-001-BI-001',
  'VCELL-COMM-001-BI-002',
  'VCELL-COMM-001-BI-003',
  'VCELL-COMM-001-BI-004',
  'VCELL-COMM-001-BI-005',
  'VCELL-COMM-001-BI-006',
  'SYNBIO-COMM-006-BI-001',
  'PDRUG-COMM-011-BI-001',
  'AGRI-COMM-015-BI-001',
  'GEN-COMM-017-BI-001',
]

export const targetMarginVarianceRecords: TargetMarginVarianceRecord[] =
  marginVarianceModelKeys.map((billingItemCode, index) => {
    const model = getCostModelByBillingItemCode(billingItemCode)
    const target = getQuarterlyTargetForProduct(model.productId, 'Q2')
    const targetCost = 72000 + index * 18000
    const actualCost =
      index % 3 === 0 ? Math.round(targetCost * 1.18) : Math.round(targetCost * 0.92)
    const variance = actualCost - targetCost

    return {
      id: `target-margin-${String(index + 1).padStart(3, '0')}`,
      targetId: target.targetId,
      productId: model.productId,
      productName: model.productName,
      commodityId: model.commodityId,
      commodityName: model.commodityName,
      billingItemCode: model.billingItemCode,
      billingItemName: model.billingItemName,
      costModelId: model.costModelId,
      costVersion: model.costVersion,
      targetCost: formatCurrency(targetCost),
      actualCost: formatCurrency(actualCost),
      costVariance: `${variance >= 0 ? '+' : '-'}${formatCurrency(Math.abs(variance))}`,
      targetGrossMargin: `${62 - (index % 4)}%`,
      actualGrossMargin: `${variance > 0 ? 56 - (index % 4) : 66 - (index % 3)}%`,
      marginVariance: variance > 0 ? `-${3 + (index % 4)}pt` : `+${2 + (index % 3)}pt`,
      varianceType: getVarianceType(variance, targetCost),
      reason:
        variance > 0
          ? '资源使用和共享成本分摊高于目标口径'
          : '资源包消耗低于预测且交付复用率提升',
      suggestedAction:
        variance > 0
          ? '复核高消耗租户、锁定折扣线并调整下月资源预算'
          : '保留当前成本口径并扩大同类商品销售',
      updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')} 17:10`,
    }
  })

export const targetVersionRecords: TargetVersionRecord[] = (['Q2', 'Q3'] as const)
  .flatMap((quarter) =>
    costModelRecords.slice(0, 15).map((model, index) => {
      const target = getQuarterlyTargetForProduct(model.productId, quarter)

      return {
        targetVersion: `TV-2026${quarter}-${String(index + 1).padStart(3, '0')}`,
        targetId: target.targetId,
        productId: model.productId,
        productName: model.productName,
        commodityId: model.commodityId,
        commodityName: model.commodityName,
        billingItemCode: model.billingItemCode,
        billingItemName: model.billingItemName,
        costModelId: model.costModelId,
        costVersion: model.costVersion,
        changeType: getTargetVersionChangeType(index),
        status:
          quarter === 'Q3'
            ? '草稿'
            : index % 6 === 0
              ? '草稿'
              : index % 5 === 0
                ? '已归档'
                : '已生效',
        impactRevenue: formatCurrency(60000 + index * 12000),
        impactCost: formatCurrency(12000 + index * 4800),
        impactGrossMargin: `${index % 3 === 0 ? '-' : '+'}${(1.2 + index * 0.1).toFixed(1)}pt`,
        effectiveAt:
          quarter === 'Q3'
            ? '2026-07-01 00:00'
            : index % 4 === 0
              ? '2026-07-01 00:00'
              : '2026-06-01 00:00',
        creator: model.productName === 'BioMap Agent' ? '宋旭政俊' : model.productName,
        createdAt:
          quarter === 'Q3'
            ? `2026-06-${String((index % 15) + 10).padStart(2, '0')} 11:00`
            : `2026-06-${String((index % 15) + 1).padStart(2, '0')} 11:00`,
        description: `${model.commodityName} ${quarter} 商品贡献、成本预算与毛利目标版本更新。`,
      }
    }),
  )

export const targetOverviewRecords: TargetOverviewRecord[] = quarterlyTargetRecords.map((target) => ({
  targetId: target.targetId,
  productId: target.productId,
  productName: target.productName,
  productOwner: target.productOwner,
  quarter: target.quarter,
  revenueTarget: target.revenueTarget,
  achievedRevenue: target.achievedRevenue,
  attainmentRate: target.attainmentRate,
  costBudget: target.costBudget,
  confirmedCost: target.confirmedCost,
  costUsageRate: target.costUsageRate,
  targetGrossProfit: target.targetGrossProfit,
  actualGrossProfit: target.actualGrossProfit,
  targetGrossMargin: target.targetGrossMargin,
  actualGrossMargin: target.actualGrossMargin,
  forecastAttainmentRate: target.forecastAttainmentRate,
  riskStatus: target.riskStatus,
  updatedAt: target.updatedAt,
}))

function createQuarterlyTarget(
  product: (typeof productRecords)[number],
  index: number,
  quarter: 'Q2' | 'Q3',
): QuarterlyTargetRecord {
  const revenueTargetValue = quarter === 'Q2' ? 1280000 + index * 320000 : 1560000 + index * 360000
  const costBudgetValue = Math.round(revenueTargetValue * (0.34 + index * 0.015))
  const targetGrossProfitValue = revenueTargetValue - costBudgetValue
  const isQ3 = quarter === 'Q3'
  const achievedRevenueValue = Math.round(revenueTargetValue * (0.62 + index * 0.045))
  const confirmedCostValue = Math.round(costBudgetValue * (0.56 + index * 0.04))
  const actualGrossProfitValue = achievedRevenueValue - confirmedCostValue

  return {
    targetId: `target-${product.id}-${quarter.toLowerCase()}`,
    targetName: `${product.name} 2026 ${quarter} 经营目标`,
    targetCode: `TG-2026-${quarter}-${String(index + 1).padStart(2, '0')}`,
    productId: product.id,
    productName: product.name,
    productOwner: product.owner,
    year: '2026',
    quarter,
    revenueTarget: formatCurrency(revenueTargetValue),
    achievedRevenue: isQ3 ? '0' : formatCurrency(achievedRevenueValue),
    attainmentRate: isQ3 ? '0' : `${Math.round((achievedRevenueValue / revenueTargetValue) * 100)}%`,
    costBudget: formatCurrency(costBudgetValue),
    confirmedCost: isQ3 ? '0' : formatCurrency(confirmedCostValue),
    costUsageRate: isQ3 ? '0' : `${Math.round((confirmedCostValue / costBudgetValue) * 100)}%`,
    targetGrossProfit: formatCurrency(targetGrossProfitValue),
    actualGrossProfit: isQ3 ? '0' : formatCurrency(actualGrossProfitValue),
    targetGrossMargin: `${Math.round((targetGrossProfitValue / revenueTargetValue) * 100)}%`,
    actualGrossMargin: isQ3
      ? '-'
      : `${Math.round((actualGrossProfitValue / achievedRevenueValue) * 100)}%`,
    forecastAttainmentRate: isQ3 ? `${78 + index * 3}%` : `${86 + index * 2}%`,
    riskStatus: isQ3 ? (index >= 3 ? '关注' : '正常') : index % 4 === 0 ? '关注' : '正常',
    status: isQ3 ? '草稿' : '进行中',
    updatedAt: isQ3 ? '2026-06-10 09:00' : '2026-06-10 18:00',
  }
}

function createMonthlyTrends(
  target: QuarterlyTargetRecord,
): TargetMonthlyTrendRecord[] {
  const months =
    target.quarter === 'Q2'
      ? (['2026-04', '2026-05', '2026-06'] as const)
      : (['2026-07', '2026-08', '2026-09'] as const)

  return months.map((month, index) => ({
    targetId: target.targetId,
    productId: target.productId,
    month,
    monthlyTarget: formatCurrency(320000 + index * 90000),
    actualRevenue: target.quarter === 'Q3' ? '0' : formatCurrency(240000 + index * 76000),
    monthlyCost: target.quarter === 'Q3' ? '0' : formatCurrency(82000 + index * 22000),
    monthlyGrossMargin: target.quarter === 'Q3' ? '-' : `${61 + index}%`,
    cumulativeAttainmentRate: target.quarter === 'Q3' ? '0' : `${42 + index * 23}%`,
  }))
}

function createRiskNotes(target: QuarterlyTargetRecord): TargetRiskNoteRecord[] {
  return [
    {
      targetId: target.targetId,
      productId: target.productId,
      riskLevel: target.riskStatus,
      reason:
        target.quarter === 'Q3'
          ? '季度尚未开始确认实际收入，预测依赖销售漏斗和成本模型锁定。'
          : '部分商品收入确认节奏慢于目标，需关注成本使用率。',
      impactTarget:
        target.quarter === 'Q3' ? '预测达成率波动' : '季度收入和实际毛利率',
      suggestedAction:
        target.quarter === 'Q3'
          ? '锁定重点客户商机和资源预算上限。'
          : '复核高风险商品折扣线并推动账单确认。',
      owner: target.productOwner,
      updatedAt: target.updatedAt,
    },
  ]
}

type DetailContributionInput = {
  commodity: CommodityRecord
  billingItem: BillingItemRecord
  model: CostModelRecord
}

function createDetailCommodityContributions(
  target: QuarterlyTargetRecord,
): TargetCommodityContributionRecord[] {
  return getDetailContributionInputs(target).map((input, index) =>
    createDetailCommodityContribution(target, input, index),
  )
}

function createDetailCommodityContribution(
  target: QuarterlyTargetRecord,
  input: DetailContributionInput,
  index: number,
): TargetCommodityContributionRecord {
  const targetSequence = getTargetSequence(target)
  const revenueTarget = 160000 + targetSequence * 18000 + index * 32000
  const achievedRevenue =
    target.quarter === 'Q3'
      ? 0
      : Math.round(revenueTarget * (0.54 + (index % 4) * 0.07))
  const confirmedCost =
    target.quarter === 'Q3'
      ? 0
      : Math.round(achievedRevenue * (0.3 + (index % 4) * 0.03))

  return {
    id: `${target.targetId}-contribution-${String(index + 1).padStart(3, '0')}`,
    targetId: target.targetId,
    productId: target.productId,
    productName: target.productName,
    commodityId: input.commodity.id,
    commodityName: input.commodity.name,
    billingItemCode: input.billingItem.code,
    billingItemName: input.billingItem.name,
    costModelId: input.model.costModelId,
    costVersion: input.model.costVersion,
    revenueTarget: formatCurrency(revenueTarget),
    achievedRevenue: target.quarter === 'Q3' ? '0' : formatCurrency(achievedRevenue),
    contributionRate:
      target.quarter === 'Q3'
        ? '0'
        : `${Math.round((achievedRevenue / revenueTarget) * 100)}%`,
    costBudget: formatCurrency(Math.round(revenueTarget * 0.36)),
    confirmedCost: target.quarter === 'Q3' ? '0' : formatCurrency(confirmedCost),
    grossMargin:
      target.quarter === 'Q3'
        ? '-'
        : `${Math.round(((achievedRevenue - confirmedCost) / achievedRevenue) * 100)}%`,
    riskStatus: getDetailRiskStatus(target, index),
    updatedAt: target.updatedAt,
  }
}

function createTargetCostStructure(
  target: QuarterlyTargetRecord,
): TargetCostStructureRecord[] {
  const targetSequence = getTargetSequence(target)

  return costSubjects.map((costSubject, index) => {
    const targetCost = 58000 + targetSequence * 9000 + index * 24000
    const confirmedCost =
      target.quarter === 'Q3'
        ? 0
        : Math.round(targetCost * (0.5 + (index % 4) * 0.06))

    return {
      id: `${target.targetId}-cost-structure-${String(index + 1).padStart(3, '0')}`,
      targetId: target.targetId,
      productId: target.productId,
      productName: target.productName,
      costSubject,
      targetCost: formatCurrency(targetCost),
      confirmedCost: target.quarter === 'Q3' ? '0' : formatCurrency(confirmedCost),
      usageRate:
        target.quarter === 'Q3'
          ? '0'
          : `${Math.round((confirmedCost / targetCost) * 100)}%`,
      allocationBasis: getCostStructureBasis(costSubject),
      riskStatus: getDetailRiskStatus(target, index),
      owner: target.productOwner,
      updatedAt: target.updatedAt,
    }
  })
}

function createDetailTargetVersions(
  target: QuarterlyTargetRecord,
): TargetVersionRecord[] {
  const contributionInputs = getDetailContributionInputs(target)
  const targetSequence = getTargetSequence(target)

  return Array.from({ length: 3 }, (_, index) => {
    const input = contributionInputs[index % contributionInputs.length]

    return {
      targetVersion: `TV-2026${target.quarter}-${target.productId}-${String(index + 1).padStart(3, '0')}`,
      targetId: target.targetId,
      productId: target.productId,
      productName: target.productName,
      commodityId: input.commodity.id,
      commodityName: input.commodity.name,
      billingItemCode: input.billingItem.code,
      billingItemName: input.billingItem.name,
      costModelId: input.model.costModelId,
      costVersion: input.model.costVersion,
      changeType: getTargetVersionChangeType(targetSequence + index),
      status: getDetailVersionStatus(target, index),
      impactRevenue: formatCurrency(52000 + targetSequence * 6000 + index * 14000),
      impactCost: formatCurrency(9000 + targetSequence * 2400 + index * 5200),
      impactGrossMargin: `${index === 1 ? '-' : '+'}${(0.8 + index * 0.4).toFixed(1)}pt`,
      effectiveAt: target.quarter === 'Q3' ? '2026-07-01 00:00' : '2026-06-01 00:00',
      creator: target.productOwner,
      createdAt: `2026-06-${String(6 + targetSequence + index).padStart(2, '0')} 11:00`,
      description: `${target.productName} ${target.quarter} 目标详情、商品贡献与成本结构版本更新。`,
    }
  })
}

function getDetailContributionInputs(
  target: QuarterlyTargetRecord,
): DetailContributionInput[] {
  const primaryInputs = getCommoditiesForTarget(target).map((commodity) => {
    const billingItem = getCommodityDetail(commodity.id)?.billingItems[0]

    if (!billingItem) {
      return null
    }

    return createDetailContributionInput(commodity, billingItem)
  })
  const extraInputs = getCommoditiesForTarget(target).flatMap((commodity) =>
    (getCommodityDetail(commodity.id)?.billingItems ?? [])
      .slice(1)
      .map((billingItem) => createDetailContributionInput(commodity, billingItem)),
  )
  const inputs = primaryInputs.filter(
    (input): input is DetailContributionInput => input !== null,
  )

  for (const input of extraInputs) {
    if (inputs.length >= 3) {
      break
    }

    inputs.push(input)
  }

  if (inputs.length === 0) {
    throw new Error(`Commodity contribution inputs not found for ${target.targetId}`)
  }

  while (inputs.length < 3) {
    inputs.push(inputs[inputs.length % inputs.length])
  }

  return inputs
}

function createDetailContributionInput(
  commodity: CommodityRecord,
  billingItem: BillingItemRecord,
): DetailContributionInput {
  const model =
    costModelRecords.find((record) => record.billingItemCode === billingItem.code) ??
    getPrimaryModelForCommodity(commodity.id)

  return { commodity, billingItem, model }
}

function getCommoditiesForTarget(target: QuarterlyTargetRecord) {
  const productType = getProductTypeForTarget(target)

  return commodityRecords.filter((record) => record.productType === productType)
}

function getProductTypeForTarget(target: QuarterlyTargetRecord): ProductType {
  return getProductTypeByProductId(target.productId)
}

function getTargetSequence(target: QuarterlyTargetRecord) {
  const index = quarterlyTargetRecords.findIndex(
    (record) => record.targetId === target.targetId,
  )

  return index >= 0 ? index : 0
}

function getDetailRiskStatus(
  target: QuarterlyTargetRecord,
  index: number,
): TargetRiskStatus {
  if (target.riskStatus === '风险' || index % 5 === 0) {
    return target.riskStatus
  }

  return index % 3 === 0 ? '关注' : '正常'
}

function getDetailVersionStatus(
  target: QuarterlyTargetRecord,
  index: number,
): TargetVersionStatus {
  if (index === 0) {
    return '已生效'
  }

  if (index === 1) {
    return '已归档'
  }

  return target.quarter === 'Q3' ? '草稿' : '已生效'
}

function getCostStructureBasis(costSubject: CostSubject) {
  switch (costSubject) {
    case '资源成本':
      return '按计费项用量和资源包消耗归集'
    case '人力成本':
      return '按售前、方案和客户成功人天归集'
    case '交付成本':
      return '按项目实施、验收和培训工作包归集'
    case '运维成本':
      return '按环境运行、监控审计和版本升级归集'
    case '第三方成本':
      return '按外部数据、知识库和供应商报价归集'
    case '共享成本':
      return '按季度共享池分摊规则归集'
  }
}

function getPrimaryModelForCommodity(commodityId: string): CostModelRecord {
  const model = costModelRecords.find((record) => record.commodityId === commodityId)

  if (!model) {
    throw new Error(`Cost model not found for commodity ${commodityId}`)
  }

  return model
}

function getCostModelByBillingItemCode(billingItemCode: string): CostModelRecord {
  const model = costModelRecords.find(
    (record) => record.billingItemCode === billingItemCode,
  )

  if (!model) {
    throw new Error(`Cost model not found for billing item ${billingItemCode}`)
  }

  return model
}

function getQuarterlyTargetForProduct(
  productId: string,
  quarter: 'Q2' | 'Q3',
): QuarterlyTargetRecord {
  const target = quarterlyTargetRecords.find(
    (record) => record.productId === productId && record.quarter === quarter,
  )

  if (!target) {
    throw new Error(`Target not found for product ${productId} ${quarter}`)
  }

  return target
}

function getVarianceType(variance: number, targetCost: number): VarianceType {
  if (variance <= 0) {
    return '正向'
  }

  if (variance / targetCost > 0.12) {
    return '重大负向'
  }

  return '轻微负向'
}

function getTargetVersionChangeType(
  index: number,
): TargetVersionRecord['changeType'] {
  const values: TargetVersionRecord['changeType'][] = [
    '创建',
    '目标调整',
    '成本预算调整',
    '预测调整',
    '锁定',
    '复盘',
  ]

  return values[index % values.length]
}

function parseCurrency(value: string) {
  const parsedValue = Number(value.replace(/[^\d.-]/g, ''))

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}
