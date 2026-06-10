import { commodityRecords, productRecords } from './productManagementMockData'
import { costModelRecords, type CostModelRecord } from './costManagementMockData'

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
  changeType: '目标调整' | '成本预算调整' | '商品贡献调整' | '毛利口径锁定'
  status: TargetVersionStatus
  impactRevenue: string
  impactCost: string
  impactGrossMargin: string
  effectiveAt: string
  creator: string
  createdAt: string
  description: string
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
  commodityRecords.map((commodity, index) => {
    const model = getPrimaryModelForCommodity(commodity.id)
    const target = getQuarterlyTargetForProduct(model.productId, 'Q2')
    const revenueTarget = 180000 + index * 36000
    const achievedRevenue = Math.round(revenueTarget * (0.58 + (index % 5) * 0.06))
    const confirmedCost = Math.round(achievedRevenue * (0.28 + (index % 4) * 0.03))

    return {
      id: `target-contribution-${String(index + 1).padStart(3, '0')}`,
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
      achievedRevenue: formatCurrency(achievedRevenue),
      contributionRate: `${Math.round((achievedRevenue / revenueTarget) * 100)}%`,
      costBudget: formatCurrency(Math.round(revenueTarget * 0.36)),
      confirmedCost: formatCurrency(confirmedCost),
      grossMargin: `${Math.round(((achievedRevenue - confirmedCost) / achievedRevenue) * 100)}%`,
      riskStatus: index % 6 === 0 ? '风险' : index % 4 === 0 ? '关注' : '正常',
      updatedAt: `2026-06-${String((index % 9) + 1).padStart(2, '0')} 15:30`,
    }
  })

const marginVarianceModelIndexes = [0, 1, 2, 3, 4, 5, 11, 16, 20, 22]

export const targetMarginVarianceRecords: TargetMarginVarianceRecord[] =
  marginVarianceModelIndexes.map((modelIndex, index) => {
    const model = costModelRecords[modelIndex]
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

export const targetVersionRecords: TargetVersionRecord[] = costModelRecords
  .slice(0, 15)
  .map((model, index) => {
    const target = getQuarterlyTargetForProduct(model.productId, 'Q2')

    return {
      targetVersion: `TV-2026Q2-${String(index + 1).padStart(3, '0')}`,
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
      status: index % 6 === 0 ? '草稿' : index % 5 === 0 ? '已归档' : '已生效',
      impactRevenue: formatCurrency(60000 + index * 12000),
      impactCost: formatCurrency(12000 + index * 4800),
      impactGrossMargin: `${index % 3 === 0 ? '-' : '+'}${(1.2 + index * 0.1).toFixed(1)}pt`,
      effectiveAt: index % 4 === 0 ? '2026-07-01 00:00' : '2026-06-01 00:00',
      creator: model.productName === 'BioMap Agent' ? '宋旭政俊' : model.productName,
      createdAt: `2026-06-${String((index % 15) + 1).padStart(2, '0')} 11:00`,
      description: `${model.commodityName} 商品贡献、成本预算与毛利目标版本更新。`,
    }
  })

export const targetOverviewRecords = quarterlyTargetRecords.map((target) => ({
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
  actualGrossProfit: target.actualGrossProfit,
  actualGrossMargin: target.actualGrossMargin,
  forecastAttainmentRate: target.forecastAttainmentRate,
  riskStatus: target.riskStatus,
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
    status: isQ3 ? '进行中' : '已完成',
    updatedAt: isQ3 ? '2026-06-10 09:00' : '2026-06-30 20:00',
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

function getPrimaryModelForCommodity(commodityId: string): CostModelRecord {
  const model = costModelRecords.find((record) => record.commodityId === commodityId)

  if (!model) {
    throw new Error(`Cost model not found for commodity ${commodityId}`)
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
    '目标调整',
    '成本预算调整',
    '商品贡献调整',
    '毛利口径锁定',
  ]

  return values[index % values.length]
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}
