// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ProductManagementPlatformPage from './ProductManagementPlatformPage'
import {
  costAllocationRecords,
  costItemRecords,
  costModelRecords,
  costSubjects,
  costVersionRecords,
} from './costManagementMockData'
import {
  targetCommodityContributionRecords,
  targetDetailsById,
  targetMarginVarianceRecords,
  targetVersionRecords,
  quarterlyTargetRecords,
} from './targetManagementMockData'
import {
  commodityRecords,
  productPlatformTabs,
  productRecords,
} from './productManagementMockData'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
})

describe('ProductManagementPlatformPage', () => {
  it('defines product platform tabs in the product, commodity, cost, target, billing order', () => {
    expect(productPlatformTabs.map((tab) => tab.label)).toEqual([
      '产品管理',
      '商品管理',
      '成本管理',
      '目标管理',
      '费用中心',
    ])
  })

  it('keeps cost and target mock data aligned with products, commodities, and virtual cell billing items', () => {
    expect(costItemRecords.length).toBeGreaterThanOrEqual(24)
    expect(costModelRecords.length).toBeGreaterThanOrEqual(20)
    expect(costAllocationRecords.length).toBeGreaterThanOrEqual(12)
    expect(costVersionRecords.length).toBeGreaterThanOrEqual(18)
    expect(quarterlyTargetRecords.length).toBeGreaterThanOrEqual(10)
    expect(targetCommodityContributionRecords.length).toBeGreaterThanOrEqual(17)
    expect(targetMarginVarianceRecords.length).toBeGreaterThanOrEqual(10)
    expect(targetVersionRecords.length).toBeGreaterThanOrEqual(15)

    const productIds = new Set(productRecords.map((record) => record.id))
    const commodityIds = new Set(commodityRecords.map((record) => record.id))

    expect(new Set(costModelRecords.map((record) => record.productId))).toEqual(
      productIds,
    )
    expect(
      commodityRecords.every((commodity) =>
        costModelRecords.some((model) => model.commodityId === commodity.id),
      ),
    ).toBe(true)
    expect(
      commodityRecords.every((commodity) =>
        targetCommodityContributionRecords.some(
          (contribution) => contribution.commodityId === commodity.id,
        ),
      ),
    ).toBe(true)

    costModelRecords.forEach((record) => {
      expect(productIds.has(record.productId)).toBe(true)
      expect(commodityIds.has(record.commodityId)).toBe(true)
      expect(record.billingItemCode.length).toBeGreaterThan(0)
      expect(record.costModelId.length).toBeGreaterThan(0)
      expect(record.costVersion.length).toBeGreaterThan(0)
    })
    costVersionRecords.forEach((record) => {
      expect(productIds.has(record.productId)).toBe(true)
      expect(commodityIds.has(record.commodityId)).toBe(true)
      expect(record.billingItemCode.length).toBeGreaterThan(0)
      expect(record.costModelId.length).toBeGreaterThan(0)
      expect(record.costVersion.length).toBeGreaterThan(0)
    })

    const targetIds = new Set(quarterlyTargetRecords.map((record) => record.targetId))

    quarterlyTargetRecords
      .filter((record) => record.quarter === 'Q3')
      .forEach((record) => {
        expect(['0', '-']).toContain(record.achievedRevenue)
        expect(['0', '-']).toContain(record.attainmentRate)
        expect(['0', '-']).toContain(record.confirmedCost)
        expect(['0', '-']).toContain(record.costUsageRate)
        expect(['0', '-']).toContain(record.actualGrossProfit)
        expect(['0', '-']).toContain(record.actualGrossMargin)
      })

    targetCommodityContributionRecords.forEach((record) => {
      expect(targetIds.has(record.targetId)).toBe(true)
      expect(productIds.has(record.productId)).toBe(true)
      expect(commodityIds.has(record.commodityId)).toBe(true)
      expect(record.billingItemCode.length).toBeGreaterThan(0)
      expect(record.costModelId.length).toBeGreaterThan(0)
      expect(record.costVersion.length).toBeGreaterThan(0)
    })
    targetMarginVarianceRecords.forEach((record) => {
      expect(targetIds.has(record.targetId)).toBe(true)
      expect(productIds.has(record.productId)).toBe(true)
      expect(commodityIds.has(record.commodityId)).toBe(true)
      expect(record.billingItemCode.length).toBeGreaterThan(0)
      expect(record.costModelId.length).toBeGreaterThan(0)
      expect(record.costVersion.length).toBeGreaterThan(0)
    })
    targetVersionRecords.forEach((record) => {
      expect(targetIds.has(record.targetId)).toBe(true)
      expect(productIds.has(record.productId)).toBe(true)
      expect(commodityIds.has(record.commodityId)).toBe(true)
      expect(record.billingItemCode.length).toBeGreaterThan(0)
      expect(record.costModelId.length).toBeGreaterThan(0)
      expect(record.costVersion.length).toBeGreaterThan(0)
    })

    const firstThreeModelNames = costModelRecords
      .slice(0, 3)
      .map((record) => record.billingItemName)
    expect(firstThreeModelNames).toEqual([
      '虚拟细胞积分资源包-10000',
      '虚拟细胞积分资源包-50000',
      '虚拟细胞积分资源包-100000',
    ])

    const virtualCellSaasModels = costModelRecords.filter(
      (record) => record.commodityId === 'commodity-virtual-cell-saas',
    )
    expect(virtualCellSaasModels.map((record) => record.billingItemCode)).toEqual([
      'VCELL-COMM-001-BI-001',
      'VCELL-COMM-001-BI-002',
      'VCELL-COMM-001-BI-003',
      'VCELL-COMM-001-BI-004',
      'VCELL-COMM-001-BI-005',
      'VCELL-COMM-001-BI-006',
      'VCELL-COMM-001-BI-007',
    ])
  })

  it('keeps target detail mock data complete for drill-down sections', () => {
    expect(Object.keys(targetDetailsById).sort()).toEqual(
      quarterlyTargetRecords.map((record) => record.targetId).sort(),
    )
    expect(costSubjects).toHaveLength(6)

    Object.values(targetDetailsById).forEach((detail) => {
      const monthlyTrends = readDetailArray(detail, 'monthlyTrends')
      const commodityContributions = readDetailArray(
        detail,
        'commodityContributions',
      )
      const costStructure = readDetailArray(detail, 'costStructure')
      const versions = readDetailArray(detail, 'versions')
      const riskNotes = readDetailArray(detail, 'riskNotes')

      expect(monthlyTrends.length).toBeGreaterThanOrEqual(3)
      expect(commodityContributions.length).toBeGreaterThanOrEqual(3)
      expect(costStructure).toHaveLength(6)
      expect(versions.length).toBeGreaterThanOrEqual(3)
      expect(riskNotes.length).toBeGreaterThanOrEqual(1)
      expectRowsTargetId(monthlyTrends, detail.targetId)
      expectRowsTargetId(commodityContributions, detail.targetId)
      expectRowsTargetId(costStructure, detail.targetId)
      expectRowsTargetId(versions, detail.targetId)
      expectRowsTargetId(riskNotes, detail.targetId)
      expect(
        new Set(
          costStructure.map(
            (record) => (record as { costSubject?: unknown }).costSubject,
          ),
        ),
      ).toEqual(new Set(costSubjects))
    })

    const virtualCellQ2Target = quarterlyTargetRecords.find(
      (record) => record.productName === '虚拟细胞' && record.quarter === 'Q2',
    )
    expect(virtualCellQ2Target).toBeDefined()

    const virtualCellCommodityIds = commodityRecords
      .filter((record) => record.productType === '虚拟细胞')
      .map((record) => record.id)
    const contributionIds = new Set(
      readDetailArray(
        targetDetailsById[virtualCellQ2Target!.targetId],
        'commodityContributions',
      ).map((record) => (record as { commodityId?: string }).commodityId),
    )

    expect(virtualCellCommodityIds).toHaveLength(5)
    virtualCellCommodityIds.forEach((commodityId) => {
      expect(contributionIds.has(commodityId)).toBe(true)
    })
  })

  it('renders the product platform shell with 产品管理 selected by default', () => {
    const { container, root } = renderProductManagementPlatformPage()

    expect(container.querySelector('.product-platform-page')).not.toBeNull()
    expect(getButton(container, '产品管理').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe(
      'false',
    )
    expect(container.querySelector('.product-platform-sidebar')).not.toBeNull()
    expect(container.querySelector('.product-platform-canvas')).not.toBeNull()

    root.unmount()
  })

  it('renders the product management table with filters and a disabled create action', () => {
    const onNotify = vi.fn()
    const { container, root } = renderProductManagementPlatformPage({ onNotify })

    expect(getTableHeaders(container)).toEqual([
      '产品名称',
      '产品编号',
      '负责人',
      '产品阶段',
      '外部可见',
      '更新时间',
      '创建时间',
      '操作',
    ])
    expect(getCommodityRowTexts(container)).toHaveLength(5)
    expect(container.textContent).toContain('虚拟细胞')
    expect(container.textContent).toContain('PROD-VCELL')
    expect(container.textContent).toContain('BioMap Agent')
    expect(
      getCommodityRowTexts(container).find((text) => text.includes('BioMap Agent')),
    ).toContain('否')
    expect(
      getCommodityRowTexts(container).find((text) => text.includes('虚拟细胞')),
    ).toContain('是')
    expect(getSelectOptions(container, '筛选产品阶段')).toEqual([
      '全部阶段',
      '待发布',
      'Alpha',
      'Beta',
      'GA',
    ])

    setSelect(container, '筛选产品阶段', 'Beta')
    expect(getCommodityRowTexts(container)).toHaveLength(2)
    expect(container.textContent).toContain('蛋白药物')
    expect(container.textContent).toContain('合成生物')
    expect(container.textContent).not.toContain('虚拟细胞')

    setSelect(container, '筛选产品阶段', 'all')
    setSelect(container, '筛选外部可见', '否')
    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('BioMap Agent')

    setSelect(container, '筛选外部可见', 'all')
    setSearchInput(container, '搜索产品', 'AGRI')
    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('农业智能')

    act(() => {
      getButton(container, '+ 新建产品').click()
    })

    expect(onNotify).toHaveBeenCalledWith('新建产品暂未接入')

    root.unmount()
  })

  it('opens a read-only product detail page from the product name', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getButton(container, '查看产品详情 虚拟细胞').click()
    })

    expect(container.querySelector('.commodity-detail')).not.toBeNull()
    expect(container.textContent).toContain('虚拟细胞')
    expect(container.textContent).toContain('面向虚拟细胞建模与仿真的产品')
    expect(getButton(container, '返回产品列表')).not.toBeNull()
    expect(getDetailTabButton(container, '产品概览').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.textContent).toContain('产品编号')
    expect(container.textContent).toContain('产品ID')
    expect(container.textContent).toContain('所属业务线')
    expect(container.textContent).toContain('关联商品数')
    expect(container.textContent).not.toContain('更新商品')
    expect(container.textContent).not.toContain('删除')

    act(() => {
      getDetailTabButton(container, '产品版本记录').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '版本号',
      '版本类型',
      '版本状态',
      '变更摘要',
      '创建人',
      '创建时间',
      '发布时间',
      '生效时间',
    ])
    expect(container.textContent).toContain('v2.0-draft')
    expect(container.textContent).toContain('草稿')
    expect(container.textContent).toContain('补充产品阶段与外部可见配置')

    act(() => {
      getButton(container, '返回产品列表').click()
    })

    expect(container.querySelector('.commodity-detail')).toBeNull()
    expect(container.textContent).toContain('+ 新建产品')
    expect(container.textContent).toContain('PROD-VCELL')

    root.unmount()
  })

  it('renders cost management navigation instead of the old empty cost tab', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })

    expect(getTabButton(container, '成本管理').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本总览',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本项管理',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本模型',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本分摊规则',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本版本记录',
    )
    expect(getButton(container, '成本总览').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.textContent).toContain('成本总览')

    act(() => {
      getButton(container, '成本项管理').click()
    })

    expect(getButton(container, '成本项管理').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(getButton(container, '成本总览').getAttribute('aria-current')).toBeNull()
    expect(container.textContent).toContain('成本项管理')

    root.unmount()
  })

  it('renders cost overview metrics, product margin rows, and risk rows', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })

    expect(container.textContent).toContain('本季度目标成本')
    expect(container.textContent).toContain('成本模型覆盖率')
    expect(container.textContent).toContain('产品成本与毛利')
    expect(container.textContent).toContain('虚拟细胞')
    expect(container.textContent).toContain('BioMap Agent')
    expect(container.textContent).toContain('高风险计费项')
    expect(getSelectOptions(container, '筛选成本年度')).toEqual(['2026'])
    expect(getSelectOptions(container, '筛选成本季度')).toEqual(['Q2', 'Q3'])
    expect(getSelectOptions(container, '筛选成本产品')).toContain('虚拟细胞')
    expect(getSelectOptions(container, '筛选成本口径')).toContain('标准用量')
    expect(getSelectOptions(container, '筛选成本总览风险')).toContain('关注')

    setSelect(container, '筛选成本产品', 'BioMap Agent')
    expect(getCommodityRowTexts(container).some((text) => text.includes('BioMap Agent'))).toBe(
      true,
    )
    expect(getCommodityRowTexts(container).some((text) => text.includes('虚拟细胞'))).toBe(
      false,
    )

    root.unmount()
  })

  it('filters cost items by subject and searches cost model resource packages', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })
    act(() => {
      getButton(container, '成本项管理').click()
    })

    expect(getTableHeaders(container)).toContain('成本项名称')
    expect(getSelectOptions(container, '筛选成本科目')).toContain('资源成本')
    setSelect(container, '筛选成本科目', '资源成本')
    expect(getCommodityRowTexts(container).length).toBeGreaterThan(0)
    expect(getCommodityRowTexts(container).every((text) => text.includes('资源成本'))).toBe(
      true,
    )

    act(() => {
      getButton(container, '成本模型').click()
    })
    setSearchInput(container, '搜索成本模型', '虚拟细胞积分资源包')
    expect(
      getCommodityRowTexts(container)
        .slice(0, 3)
        .map((text) => text.match(/虚拟细胞积分资源包-\d+/)?.[0]),
    ).toEqual([
      '虚拟细胞积分资源包-10000',
      '虚拟细胞积分资源包-50000',
      '虚拟细胞积分资源包-100000',
    ])

    root.unmount()
  })

  it('opens a read-only cost model detail with breakdown, pricing simulation, and versions', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })
    act(() => {
      getButton(container, '成本模型').click()
    })
    act(() => {
      getButtons(container, '查看')[0].click()
    })

    expect(container.textContent).toContain('成本模型详情')
    expect(container.textContent).toContain('模型概览')
    expect(container.textContent).toContain('成本拆解')
    expect(container.textContent).toContain('毛利试算')
    expect(container.textContent).toContain('版本记录')
    expect(container.textContent).toContain('VCELL-COMM-001-BI-001')
    expect(container.textContent).toContain('草稿')

    act(() => {
      getButton(container, '返回成本模型列表').click()
    })

    expect(container.textContent).toContain('成本模型名称')
    expect(container.textContent).not.toContain('成本模型详情')

    root.unmount()
  })

  it('keeps cost pagination and reset behavior stable after filtering', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })
    act(() => {
      getButton(container, '成本项管理').click()
    })

    expect(container.textContent).toContain('1 / 3')

    act(() => {
      getButton(container, '下一页').click()
    })

    expect(container.textContent).toContain('2 / 3')

    setSelect(container, '筛选成本科目', '共享成本')

    expect(container.textContent).toContain('1 / 1')
    expect(getCommodityRowTexts(container).every((text) => text.includes('共享成本'))).toBe(
      true,
    )

    root.unmount()
  })

  it('renders allocation rules and cost version records', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '成本管理').click()
    })
    act(() => {
      getButton(container, '成本分摊规则').click()
    })
    expect(getTableHeaders(container)).toContain('共享成本项')
    expect(container.textContent).toContain('分摊完整度')

    act(() => {
      getButton(container, '成本版本记录').click()
    })
    expect(getTableHeaders(container)).toContain('版本号')
    expect(container.textContent).toContain('口径锁定')

    root.unmount()
  })

  it('renders target management as a top-level tab with its own navigation', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })

    expect(getTabButton(container, '目标管理').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '目标总览',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '季度目标',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '商品贡献',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '成本与毛利',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '目标版本记录',
    )
    expect(getButton(container, '目标总览').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.textContent).toContain('目标总览')
    expect(container.textContent).toContain('本季度业绩目标')
    expect(container.textContent).toContain('产品目标达成表')
    expect(container.textContent).toContain('月度趋势表')
    expect(container.textContent).toContain('风险说明表')
    expect(getTableHeaders(container)).toContain('目标毛利率')

    act(() => {
      getButton(container, '季度目标').click()
    })

    expect(getButton(container, '季度目标').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(getButton(container, '目标总览').getAttribute('aria-current')).toBeNull()
    expect(container.textContent).toContain('季度目标')

    root.unmount()
  })

  it('renders the quarterly target list with core financial and status fields', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '季度目标').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '目标名称',
      '目标编号',
      '产品名称',
      '产品负责人',
      '年度',
      '季度',
      '业绩目标',
      '已达成业绩',
      '达成率',
      '成本预算',
      '已确认成本',
      '成本使用率',
      '目标毛利率',
      '实际毛利率',
      '预测达成率',
      '风险状态',
      '目标状态',
      '更新时间',
      '操作',
    ])
    expect(getCommodityRowTexts(container)).toHaveLength(5)
    expect(container.textContent).toContain('虚拟细胞 2026 Q2 经营目标')
    expect(container.textContent).toContain('BioMap Agent 2026 Q2 经营目标')
    expect(container.textContent).toContain('2026')
    expect(container.textContent).toContain('Q2')
    expect(container.textContent).toContain('达成率')
    expect(container.textContent).toContain('成本使用率')
    expect(container.textContent).toContain('目标毛利率')
    expect(container.textContent).toContain('实际毛利率')
    expect(container.textContent).toContain('目标状态')
    expect(container.textContent).toContain('已完成')
    expect((getButton(container, '+ 新建目标') as HTMLButtonElement).disabled).toBe(
      true,
    )

    root.unmount()
  })

  it('opens quarterly target detail with overview, monthly, contribution, cost, and version sections', () => {
    const { container, root } = renderProductManagementPlatformPage()
    const virtualCellQ2Target = quarterlyTargetRecords.find(
      (record) => record.productName === '虚拟细胞' && record.quarter === 'Q2',
    )
    expect(virtualCellQ2Target).toBeDefined()
    const expectedCommodityNames = commodityRecords
      .filter((record) => record.productType === '虚拟细胞')
      .map((record) => record.name)

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '季度目标').click()
    })
    act(() => {
      getButtons(container, '查看')[0].click()
    })

    expect(container.textContent).toContain('目标详情')
    expect(container.textContent).toContain('目标概览')
    expect(container.textContent).toContain('月度拆分')
    expect(container.textContent).toContain('商品贡献')
    expect(container.textContent).toContain('成本结构')
    expect(container.textContent).toContain('版本记录')
    expect(container.textContent).toContain('风险说明')
    expect(getTableHeaders(container)).toEqual(
      expect.arrayContaining([
        '商品类型',
        '贡献占比',
        '毛利额',
        '关联计费项数量',
      ]),
    )
    expect(container.textContent).toContain(virtualCellQ2Target!.targetCode)
    expectedCommodityNames.forEach((name) => {
      expect(container.textContent).toContain(name)
    })

    act(() => {
      getButton(container, '返回季度目标').click()
    })

    expect(container.textContent).toContain('季度目标')
    expect(container.textContent).not.toContain('目标详情')

    root.unmount()
  })

  it('renders target commodity contribution rows including BioMap Agent SaaS', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '商品贡献').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '商品名称',
      '所属产品',
      '商品类型',
      '产品负责人',
      '季度目标贡献',
      '实际贡献',
      '贡献达成率',
      '成本贡献',
      '毛利额',
      '毛利率',
      '贡献占比',
      '主要计费项',
      '风险状态',
      '更新时间',
      '操作',
    ])
    setSearchInput(container, '搜索商品贡献', 'BioMap Agent')
    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('BioMap Agent - SaaS')

    root.unmount()
  })

  it('renders target margin variance with variance type and suggested actions', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '成本与毛利').click()
    })

    expect(getTableHeaders(container)).toContain('差异类型')
    expect(getTableHeaders(container)).toContain('建议动作')
    expect(container.textContent).toContain('正向')
    expect(container.textContent).toContain('复核高消耗租户')

    root.unmount()
  })

  it('renders target version records with statuses and change types', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '目标版本记录').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '版本号',
      '目标编号',
      '产品名称',
      '年度',
      '季度',
      '变更类型',
      '变更前目标',
      '变更后目标',
      '变更前毛利率',
      '变更后毛利率',
      '状态',
      '创建人',
      '创建时间',
      '说明',
      '操作',
    ])
    expect(container.textContent).toContain('已生效')
    expect(container.textContent).toContain('创建')
    expect(container.textContent).toContain('预测调整')
    expect(container.textContent).toContain('锁定')
    expect(container.textContent).toContain('复盘')

    root.unmount()
  })

  it('limits target contribution list to 10 rows per page and paginates results', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '商品贡献').click()
    })

    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('共 17 条')
    expect(container.textContent).toContain('1 / 2')
    expect(container.textContent).not.toContain('BioMap Agent - SaaS')

    act(() => {
      getButton(container, '下一页').click()
    })

    expect(getCommodityRowTexts(container)).toHaveLength(7)
    expect(container.textContent).toContain('2 / 2')
    expect(container.textContent).toContain('BioMap Agent - SaaS')

    root.unmount()
  })

  it('shows Q3 target actual values as zero or empty placeholders', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '目标管理').click()
    })
    act(() => {
      getButton(container, '季度目标').click()
    })
    setSelect(container, '筛选目标季度', 'Q3')

    const rows = getCommodityRowTexts(container)
    expect(rows).toHaveLength(5)
    rows.forEach((row) => {
      expect(row).toContain('Q3')
      expect(row).toContain('0')
      expect(row).toContain('-')
      expect(row).toContain('进行中')
    })

    root.unmount()
  })

  it('renders the billing center tab with instance and bill navigation', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '费用中心').click()
    })

    expect(getTabButton(container, '费用中心').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '实例管理',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '账单管理',
    )
    expect(getButton(container, '实例管理').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.textContent).not.toContain('+ 新建产品')
    expect(container.textContent).not.toContain('+ 新建商品')

    root.unmount()
  })

  it('renders billing instances with filters, search, and disabled actions', () => {
    const onNotify = vi.fn()
    const { container, root } = renderProductManagementPlatformPage({ onNotify })

    act(() => {
      getTabButton(container, '费用中心').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '实例id',
      '主账号',
      '客户名称',
      '计费项名称',
      '计费项编号',
      '计费项类型',
      '起始时间',
      '结束时间',
      '操作',
    ])
    expect(getCommodityRowTexts(container)).toHaveLength(5)
    expect(container.textContent).toContain('测试客户')
    expect(container.textContent).toContain('资源包')
    expect(container.textContent).toContain('包月')
    expect(container.textContent).toContain('BI202606010001AA')
    expect(container.textContent).toContain('虚拟细胞积分资源包-10000')
    expect(container.textContent).toContain('VCELL-COMM-001-BI-001')
    expect(container.textContent).not.toContain('==')
    expect(getSelectOptions(container, '筛选实例主账号')).toEqual([
      '全部主账号',
      'tenant_test_001',
    ])
    expect(getSelectOptions(container, '筛选客户名称')).toEqual([
      '全部客户',
      '测试客户',
    ])
    expect(getSelectOptions(container, '筛选计费项类型')).toEqual([
      '全部计费项类型',
      '资源包',
      '包月',
    ])

    setSelect(container, '筛选计费项类型', '包月')
    expect(getCommodityRowTexts(container)).toHaveLength(2)
    expect(getCommodityRowTexts(container).every((text) => text.includes('包月'))).toBe(
      true,
    )
    expect(container.textContent).not.toContain('BI202606010001AA')

    setSelect(container, '筛选计费项类型', 'all')
    setSearchInput(container, '搜索实例', 'BI202606030003AA')
    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('BI202606030003AA')

    setSearchInput(container, '搜索实例', '')
    setSearchInput(container, '筛选实例起始日期', '2026-06-03')
    expect(getCommodityRowTexts(container)).toHaveLength(3)
    expect(container.textContent).not.toContain('BI202606010001AA')

    act(() => {
      getButton(container, '+ 创建实例').click()
    })
    expect(onNotify).toHaveBeenCalledWith('创建实例暂未接入')

    act(() => {
      getButtons(container, '查看')[0].click()
    })
    expect(onNotify).toHaveBeenCalledWith(
      expect.stringContaining('查看实例暂未接入'),
    )

    root.unmount()
  })

  it('renders billing records with filters, search, and disabled actions', () => {
    const onNotify = vi.fn()
    const { container, root } = renderProductManagementPlatformPage({ onNotify })

    act(() => {
      getTabButton(container, '费用中心').click()
    })
    act(() => {
      getButton(container, '账单管理').click()
    })

    expect(getButton(container, '账单管理').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(getTableHeaders(container)).toEqual([
      '账单id',
      '主账号',
      '客户名称',
      '计费项名称',
      '计费项编号',
      '计费项类型',
      '计费时间段',
      '计费周期',
      '账单创建时间',
      '操作',
    ])
    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('共 30 条')
    expect(container.textContent).toContain('1 / 3')
    expect(container.textContent).toContain('BILL202606010001')
    expect(container.textContent).toContain(
      '2026-06-01 00:00 ~ 2026-06-01 23:59',
    )
    expect(container.textContent).not.toContain('BILL202606110011')
    expect(container.textContent).toContain('虚拟细胞积分资源包-10000')
    expect(container.textContent).toContain('VCELL-COMM-001-BI-001')
    expect(container.textContent).toContain('小时')
    expect(container.textContent).toContain('天')
    expect(container.textContent).toContain('月')
    expect(getSelectOptions(container, '筛选账单主账号')).toEqual([
      '全部主账号',
      'tenant_test_001',
    ])
    expect(getSelectOptions(container, '筛选账单客户名称')).toEqual([
      '全部客户',
      '测试客户',
    ])
    expect(getSelectOptions(container, '筛选账单计费项类型')).toEqual([
      '全部计费项类型',
      '资源包',
      '包月',
    ])
    expect(getSelectOptions(container, '筛选计费周期')).toEqual([
      '全部周期',
      '小时',
      '天',
      '月',
    ])

    act(() => {
      getButton(container, '下一页').click()
    })
    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('2 / 3')
    expect(container.textContent).toContain('BILL202606110011')
    expect(container.textContent).not.toContain('BILL202606010001')

    setSelect(container, '筛选计费周期', '月')
    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('1 / 1')
    expect(container.textContent).toContain('共 10 条')
    expect(getCommodityRowTexts(container).every((text) => text.includes('月'))).toBe(
      true,
    )

    setSelect(container, '筛选计费周期', 'all')
    setSearchInput(container, '搜索账单', 'BILL202606050005')
    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('BILL202606050005')

    setSearchInput(container, '搜索账单', '')
    setSearchInput(container, '筛选账单开始日期', '2026-06-03')
    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('共 28 条')
    expect(container.textContent).not.toContain('BILL202606010001')

    act(() => {
      getButton(container, '+ 新增账单').click()
    })
    expect(onNotify).toHaveBeenCalledWith('新增账单暂未接入')

    act(() => {
      getButtons(container, '查看')[0].click()
    })
    expect(onNotify).toHaveBeenCalledWith(
      expect.stringContaining('查看账单暂未接入'),
    )

    root.unmount()
  })

  it('renders commodity sidebar menu and keeps 权限申请 disabled', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    expect(getTabButton(container, '商品管理').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '商品管理',
    )
    expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain(
      '权限申请',
    )
    expect(getButton(container, '权限申请').getAttribute('aria-disabled')).toBe(
      'true',
    )
    expect((getButton(container, '权限申请') as HTMLButtonElement).disabled).toBe(
      true,
    )

    root.unmount()
  })

  it('shows commodity table columns, statuses, and row actions', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '商品名称',
      '所属产品类型',
      '商品类型',
      '商品负责人',
      '更新时间',
      '创建时间',
      '状态',
      '操作',
    ])
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(getCommodityRowTexts(container)[0]).toContain('SaaS')
    expect(container.textContent).toContain('虚拟细胞平台-私部订阅')
    expect(container.textContent).toContain('虚拟细胞平台-私部买断')
    expect(container.textContent).toContain('虚拟细胞平台-维保')
    expect(container.textContent).toContain('虚拟细胞平台-人力服务')
    expect(
      getCommodityRowTexts(container).find((text) =>
        text.includes('虚拟细胞平台-人力服务'),
      ),
    ).toContain('私有化部署')
    expect(container.textContent).toContain('未发布')
    expect(container.textContent).toContain('已发布')
    expect(container.textContent).toContain('下架中')
    expect(container.textContent).toContain('下架')
    expect(getButtons(container, '编辑').length).toBeGreaterThan(0)
    expect(getButtons(container, '删除').length).toBeGreaterThan(0)

    root.unmount()
  })

  it('uses BioMap product types and keeps virtual cell commodities published', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    expect(getSelectOptions(container, '筛选所属产品类型')).toEqual([
      '全部产品类型',
      '虚拟细胞',
      '蛋白药物',
      '合成生物',
      '农业智能',
      '通用产品',
    ])

    setSelect(container, '筛选所属产品类型', '虚拟细胞')

    expect(getCommodityRowTexts(container)).toHaveLength(5)
    expect(getCommodityRowTexts(container).every((text) => text.includes('已发布'))).toBe(
      true,
    )
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(container.textContent).toContain('虚拟细胞平台-人力服务')

    root.unmount()
  })

  it('uses unified owners for each configured product type', () => {
    const { container, root } = renderProductManagementPlatformPage()
    const expectedOwnersByType = {
      虚拟细胞: '别西',
      合成生物: '李一凡',
      蛋白药物: '王宗安',
      农业智能: '王曼',
    }

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    Object.entries(expectedOwnersByType).forEach(([productType, owner]) => {
      setSelect(container, '筛选所属产品类型', productType)

      expect(getCommodityRowTexts(container).length).toBeGreaterThan(0)
      expect(
        getCommodityRowTexts(container).every((text) => text.includes(owner)),
      ).toBe(true)
    })

    root.unmount()
  })

  it('keeps 通用产品 as a single BioMap Agent SaaS commodity', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    setSelect(container, '筛选所属产品类型', '通用产品')

    expect(getCommodityRowTexts(container)).toHaveLength(1)
    expect(container.textContent).toContain('BioMap Agent - SaaS')
    expect(container.textContent).toContain('宋旭政俊')
    expect(container.textContent).not.toContain('通用产品平台-SaaS')
    expect(container.textContent).not.toContain('通用产品平台-人力服务')

    root.unmount()
  })

  it('filters commodities by status, product type, owner, and search query', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    setSelect(container, '筛选商品状态', '未发布')
    expect(container.textContent).toContain('合成生物平台-私部订阅')
    expect(container.textContent).not.toContain('虚拟细胞平台-SaaS')

    setSelect(container, '筛选商品状态', 'all')
    setSelect(container, '筛选所属产品类型', '合成生物')
    expect(container.textContent).toContain('合成生物平台-SaaS')
    expect(container.textContent).not.toContain('农业智能平台-SaaS')

    setSelect(container, '筛选所属产品类型', 'all')
    setSelect(container, '筛选商品负责人', '王宗安')
    expect(container.textContent).toContain('蛋白药物平台-人力服务')
    expect(container.textContent).not.toContain('合成生物平台-SaaS')

    setSelect(container, '筛选商品负责人', 'all')
    setSearchInput(container, '搜索商品', '合成生物')
    expect(container.textContent).toContain('合成生物平台-SaaS')
    expect(container.textContent).not.toContain('虚拟细胞平台-SaaS')

    root.unmount()
  })

  it('limits the commodity list to 10 rows per page and paginates results', () => {
    const { container, root } = renderProductManagementPlatformPage()

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    expect(getCommodityRowTexts(container)).toHaveLength(10)
    expect(container.textContent).toContain('共 17 条')
    expect(container.textContent).toContain('1 / 2')
    expect(container.textContent).toContain('合成生物平台-人力服务')
    expect(container.textContent).not.toContain('BioMap Agent - SaaS')

    act(() => {
      getButton(container, '下一页').click()
    })

    expect(getCommodityRowTexts(container)).toHaveLength(7)
    expect(container.textContent).toContain('2 / 2')
    expect(container.textContent).toContain('BioMap Agent - SaaS')

    root.unmount()
  })

  it('shows a disabled create flow notice from the 新建商品 toolbar button', () => {
    const onNotify = vi.fn()
    const { container, root } = renderProductManagementPlatformPage({ onNotify })

    act(() => {
      getTabButton(container, '商品管理').click()
    })

    expect(getButton(container, '+ 新建商品')).not.toBeNull()

    act(() => {
      getButton(container, '+ 新建商品').click()
    })

    expect(onNotify).toHaveBeenCalledWith('新建商品暂未接入')
    expect(container.querySelector('.commodity-management__create-button')).not.toBeNull()

    root.unmount()
  })

  it('opens a read-only commodity detail page from the commodity name', () => {
    const onOpenCommodity = vi.fn()
    const { container, root } = renderProductManagementPlatformPage({
      onOpenCommodity,
    })

    act(() => {
      getTabButton(container, '商品管理').click()
    })
    act(() => {
      getButton(container, '查看商品详情 虚拟细胞平台-SaaS').click()
    })

    expect(onOpenCommodity).toHaveBeenCalledWith('commodity-virtual-cell-saas')
    expect(container.querySelector('.commodity-detail')).not.toBeNull()
    expect(container.textContent).toContain('虚拟细胞平台-SaaS')
    expect(container.textContent).toContain('面向虚拟细胞建模与仿真的 SaaS 商品')
    expect(getButton(container, '更新商品')).not.toBeNull()
    expect(getDetailTabButton(container, '商品概览').getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(container.textContent).toContain('商品编号')
    expect(container.textContent).toContain('税率')
    expect(container.textContent).not.toContain('删除')

    root.unmount()
  })

  it('renders billing items with filters inside commodity detail', () => {
    const { container, root } = renderProductManagementPlatformPage({
      initialCommodityId: 'commodity-virtual-cell-saas',
    })

    act(() => {
      getDetailTabButton(container, '计费项').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '计费项名称',
      '计费项编号',
      '计费类型',
      '容量/时长',
      '单位',
      '计量口径',
      '付费类型',
      '结算周期',
      '币种',
      '刊例价',
      '折扣口径',
      '最小购买量',
      '状态',
      '更新时间',
      '描述',
    ])
    expect(getTableHeaders(container)).not.toContain('类型')
    expect(getTableHeaders(container)).not.toContain('计量内容')
    expect(container.textContent).toContain('虚拟细胞平台基础订阅')
    expect(container.textContent).toContain('模型推理调用量')
    expect(getCommodityRowTexts(container)).toHaveLength(7)
    expect(getCommodityRowTexts(container).slice(0, 3).map(getFirstCellText)).toEqual([
      '虚拟细胞积分资源包-10000',
      '虚拟细胞积分资源包-50000',
      '虚拟细胞积分资源包-100000',
    ])
    expect(container.textContent).toContain('虚拟细胞积分资源包-10000')
    expect(container.textContent).toContain('虚拟细胞积分资源包-50000')
    expect(container.textContent).toContain('虚拟细胞积分资源包-100000')
    expect(container.textContent).toContain('10,000积分')
    expect(container.textContent).toContain('50,000积分')
    expect(container.textContent).toContain('100,000积分')
    expect(container.textContent).toContain('虚拟细胞建模工作空间')
    expect(container.textContent).toContain('CPU/GPU 归一化算力')
    expect(container.textContent).toContain('包月')
    expect(container.textContent).toContain('12个月')
    expect(container.textContent).toContain('资源包')
    expect(container.textContent).toContain('100万次调用')
    expect(container.textContent).toContain('按刊例价折扣')
    expect(container.textContent).toContain('1个资源包')
    expect(container.textContent).toContain('预付费')
    expect(container.textContent).toContain('后付费')
    expect(container.textContent).not.toContain('vcell-comm-001-bi-001-id')

    setSelect(container, '筛选计费项付费类型', '后付费')

    expect(getCommodityRowTexts(container).every((text) => text.includes('后付费'))).toBe(
      true,
    )

    setSearchInput(container, '搜索计费项', '算力')

    expect(container.textContent).toContain('高性能计算资源包')
    expect(container.textContent).not.toContain('模型推理调用量')

    root.unmount()
  })

  it('renders cost and discount rows with separate gross margin columns', () => {
    const { container, root } = renderProductManagementPlatformPage({
      initialCommodityId: 'commodity-virtual-cell-saas',
    })

    act(() => {
      getDetailTabButton(container, '成本与折扣').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '计费项',
      '计费项编号',
      '自由折扣线',
      '一般折扣线',
      '产品折扣线',
      '出厂价折扣线',
      '总目标成本',
      '资源成本',
      'L1人天',
      'L2人天',
      'CSM人天',
      '交付人天',
      '自由折扣毛利率',
      '一般折扣毛利率',
      '产品折扣毛利率',
      '出厂价折扣毛利率',
      '成本口径',
      '更新时间',
    ])
    expect(container.querySelector('.commodity-detail__wide-table-wrap')).not.toBeNull()
    expect(container.textContent).toContain('按年度容量预算')
    expect(container.textContent).toContain('3.6')
    expect(container.textContent).toContain('7.2')
    expect(container.textContent).not.toContain('3.5999999999999996')
    expect(container.textContent).not.toContain('7.199999999999999')

    root.unmount()
  })

  it('renders commodity version history including draft versions', () => {
    const { container, root } = renderProductManagementPlatformPage({
      initialCommodityId: 'commodity-virtual-cell-saas',
    })

    act(() => {
      getDetailTabButton(container, '商品版本记录').click()
    })

    expect(getTableHeaders(container)).toEqual([
      '版本号',
      '版本类型',
      '版本状态',
      '变更摘要',
      '创建人',
      '创建时间',
      '发布时间',
      '生效时间',
    ])
    expect(container.textContent).toContain('v1.2-draft')
    expect(container.textContent).toContain('草稿')
    expect(container.textContent).toContain('新增算力资源包阶梯口径')

    root.unmount()
  })
})

function renderProductManagementPlatformPage(
  props: Partial<React.ComponentProps<typeof ProductManagementPlatformPage>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<ProductManagementPlatformPage {...props} />)
  })

  return { container, root }
}

function getButton(container: HTMLElement, name: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.trim() === name,
  )

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}

function getTabButton(container: HTMLElement, name: string) {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button[role="tab"]'),
  ).find((element) => element.textContent?.trim() === name)

  if (!button) {
    throw new Error(`Tab button not found: ${name}`)
  }

  return button
}

function getDetailTabButton(container: HTMLElement, name: string) {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('.commodity-detail__tab'),
  ).find((element) => element.textContent?.trim() === name)

  if (!button) {
    throw new Error(`Detail tab button not found: ${name}`)
  }

  return button
}

function getButtons(container: HTMLElement, name: string) {
  return Array.from(container.querySelectorAll('button')).filter(
    (element) => element.textContent?.trim() === name,
  )
}

function getTableHeaders(container: HTMLElement) {
  return Array.from(container.querySelectorAll('th')).map((element) =>
    element.textContent?.trim(),
  )
}

function getCommodityRowTexts(container: HTMLElement) {
  return Array.from(container.querySelectorAll('tbody tr')).map(
    (element) => element.textContent ?? '',
  )
}

function getFirstCellText(rowText: string) {
  const knownBillingNames = [
    '虚拟细胞积分资源包-100000',
    '虚拟细胞积分资源包-10000',
    '虚拟细胞积分资源包-50000',
    '虚拟细胞平台基础订阅',
    '工作空间席位',
    '模型推理调用量',
    '高性能计算资源包',
  ]

  const match = knownBillingNames.find((name) => rowText.startsWith(name))

  if (!match) {
    throw new Error(`Unknown row text: ${rowText}`)
  }

  return match
}

function readDetailArray(record: unknown, key: string) {
  expect(record).toHaveProperty(key)

  const value = (record as Record<string, unknown>)[key]
  expect(Array.isArray(value)).toBe(true)

  return value as unknown[]
}

function expectRowsTargetId(records: unknown[], targetId: string) {
  records.forEach((record) => {
    expect((record as { targetId?: unknown }).targetId).toBe(targetId)
  })
}

function getSelectOptions(container: HTMLElement, label: string) {
  const select = container.querySelector<HTMLSelectElement>(
    `select[aria-label="${label}"]`,
  )

  if (!select) {
    throw new Error(`Select not found: ${label}`)
  }

  return Array.from(select.options).map((option) => option.textContent)
}

function setSelect(container: HTMLElement, label: string, value: string) {
  act(() => {
    const select = container.querySelector<HTMLSelectElement>(
      `select[aria-label="${label}"]`,
    )

    if (!select) {
      throw new Error(`Select not found: ${label}`)
    }

    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function setSearchInput(container: HTMLElement, label: string, value: string) {
  act(() => {
    const input = container.querySelector<HTMLInputElement>(
      `input[aria-label="${label}"]`,
    )

    if (!input) {
      throw new Error(`Input not found: ${label}`)
    }

    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    )?.set
    valueSetter?.call(input, value)
    input.dispatchEvent(
      new InputEvent('input', {
        bubbles: true,
        data: value,
        inputType: 'insertText',
      }),
    )
  })
}
