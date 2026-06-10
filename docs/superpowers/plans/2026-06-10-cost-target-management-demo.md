# Cost And Target Management Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complex DEMO for `成本管理` and new `目标管理` inside the existing 产品管理平台, aligned with the current 5 products, 17 commodities, virtual-cell SaaS billing items, and billing center facts.

**Architecture:** Keep the existing platform shell in `ProductManagementPlatformPage.tsx`, but move new module views into focused files. Product/commodity/billing base data stays in `productManagementMockData.ts`; cost and target data live in separate mock modules with stable cross-object IDs. Cost and target views are read-only management surfaces with filters, pagination, dashboards, details, and regression tests.

**Tech Stack:** React 19, TypeScript, Vite, Vitest with happy-dom, one shared `src/App.css` stylesheet.

---

## File Structure

- Modify `src/components/product-management/productManagementMockData.ts`
  - Add `ProductPlatformTab = 'target'`.
  - Insert `{ id: 'target', label: '目标管理' }` after `成本管理`.
  - Keep product, commodity, billing, and commodity detail data here.
- Create `src/components/product-management/costManagementMockData.ts`
  - Export cost item, model, allocation, version, overview, and enum data.
  - Reuse `productRecords`, `commodityRecords`, and `getCommodityDetail`.
  - Preserve stable IDs: `productId`, `commodityId`, `billingItemCode`, `costModelId`, `costVersion`, `allocationRuleId`.
- Create `src/components/product-management/targetManagementMockData.ts`
  - Export quarterly targets, target details, commodity contributions, margin variance, target versions, and enum data.
  - Reuse current products and commodities.
  - Preserve stable IDs: `targetId`, `productId`, `commodityId`, `billingItemCode`, `costModelId`, `costVersion`.
- Create `src/components/product-management/CostManagementViews.tsx`
  - Render cost overview, cost items, cost models with detail, allocation rules, and cost versions.
- Create `src/components/product-management/TargetManagementViews.tsx`
  - Render target overview, quarterly targets with detail, commodity contribution, cost/gross margin variance, and target versions.
- Modify `src/components/product-management/ProductManagementPlatformPage.tsx`
  - Own only top tab routing, cost/target side navigation state, and existing product/commodity/billing state.
  - Delegate new module content to `CostManagementViews` and `TargetManagementViews`.
- Modify `src/components/product-management/ProductManagementPlatformPage.test.tsx`
  - Replace the old “成本管理 has empty sidebar” test.
  - Add cost, target, invariant, and regression coverage.
- Modify `src/App.css`
  - Add shared management dashboard/table/detail styles.
  - Add cost/target canvas scrolling/padding.

## Task 1: Data Models And Mock Invariants

**Files:**
- Modify: `src/components/product-management/productManagementMockData.ts`
- Create: `src/components/product-management/costManagementMockData.ts`
- Create: `src/components/product-management/targetManagementMockData.ts`
- Modify/Test: `src/components/product-management/ProductManagementPlatformPage.test.tsx`

- [ ] **Step 1: Write failing data invariant tests**

Add imports near the existing test imports:

```ts
import {
  costAllocationRecords,
  costItemRecords,
  costModelRecords,
  costVersionRecords,
} from './costManagementMockData'
import {
  targetCommodityContributionRecords,
  targetMarginVarianceRecords,
  targetVersionRecords,
  quarterlyTargetRecords,
} from './targetManagementMockData'
import { commodityRecords, productPlatformTabs, productRecords } from './productManagementMockData'
```

Add tests inside the existing `describe('ProductManagementPlatformPage', () => { ... })`:

```ts
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

  expect(new Set(costModelRecords.map((record) => record.productId))).toEqual(productIds)
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

  const firstThreeModelNames = costModelRecords.slice(0, 3).map((record) => record.billingItemName)
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
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: FAIL because `costManagementMockData.ts`, `targetManagementMockData.ts`, and `目标管理` tab do not exist yet.

- [ ] **Step 3: Implement product tab and cost mock data**

In `productManagementMockData.ts`, update:

```ts
export type ProductPlatformTab = 'product' | 'commodity' | 'cost' | 'target' | 'billing'
```

Update `productPlatformTabs`:

```ts
export const productPlatformTabs: { id: ProductPlatformTab; label: string }[] = [
  { id: 'product', label: '产品管理' },
  { id: 'commodity', label: '商品管理' },
  { id: 'cost', label: '成本管理' },
  { id: 'target', label: '目标管理' },
  { id: 'billing', label: '费用中心' },
]
```

Create `costManagementMockData.ts` with exported types and arrays. Use these exact exported names:

```ts
import {
  commodityRecords,
  getCommodityDetail,
  productRecords,
  type CommoditySaleType,
  type ProductType,
} from './productManagementMockData'

export type CostSection = 'overview' | 'items' | 'models' | 'allocations' | 'versions'
export type CostSubject = '资源成本' | '人力成本' | '交付成本' | '运维成本' | '第三方成本' | '共享成本'
export type CostScope = '全局标准' | '产品专属' | '商品专属' | '共享成本'
export type CostSource = '云资源账单' | '内部人力标准' | '供应商报价' | '财务测算' | '历史项目均摊'
export type CostAllocationMethod = '直接归属' | '按用量' | '按收入' | '按席位' | '按项目' | '按人天'
export type CostRecordStatus = '生效中' | '待生效' | '已失效'
export type CostRiskStatus = '正常' | '关注' | '风险'
export type CostModelStatus = '草稿' | '生效中' | '已归档'
export type AllocationTarget = '产品' | '商品' | '计费项'
export type AllocationDriver = '收入占比' | '用量占比' | '席位占比' | '存储占比' | '项目人天占比' | '平均分摊'
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
```

Complete the file with at least 24 `costItemRecords`, at least 20 `costModelRecords`, at least 12 `costAllocationRecords`, at least 18 `costVersionRecords`, and summary helpers. The first 7 cost models must come from `getCommodityDetail('commodity-virtual-cell-saas')?.billingItems` in billing item order, so the first 3 are the virtual cell point resource packages.

- [ ] **Step 4: Implement target mock data**

Create `targetManagementMockData.ts` with exported types and arrays. Use these exact exported names:

```ts
import { commodityRecords, productRecords } from './productManagementMockData'
import { costModelRecords } from './costManagementMockData'

export type TargetSection = 'overview' | 'quarterly' | 'contributions' | 'margins' | 'versions'
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
```

Complete the file with 10 quarterly targets, 17 commodity contributions, 10 margin variance records, 15 target versions, and details for every target. Set Q3 actual-like fields to `0` or `-`; Q2 can contain actuals.

- [ ] **Step 5: Run invariant tests**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: data invariant tests PASS. UI tests may still fail for the new `目标管理` tab until Task 2 updates rendering.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/components/product-management/productManagementMockData.ts src/components/product-management/costManagementMockData.ts src/components/product-management/targetManagementMockData.ts src/components/product-management/ProductManagementPlatformPage.test.tsx
git commit -m "feat: add cost and target mock data"
```

## Task 2: Platform Navigation And Sidebars

**Files:**
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Modify/Test: `src/components/product-management/ProductManagementPlatformPage.test.tsx`

- [ ] **Step 1: Replace the old empty cost tab test and add target navigation test**

Replace the test named `switches the active top tab without adding left navigation content` with:

```ts
it('renders cost management navigation instead of the old empty cost tab', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getTabButton(container, '成本管理').click()
  })

  expect(getTabButton(container, '成本管理').getAttribute('aria-selected')).toBe('true')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本总览')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本项管理')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本模型')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本分摊规则')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本版本记录')
  expect(getButton(container, '成本总览').getAttribute('aria-current')).toBe('page')

  root.unmount()
})

it('renders target management as a top-level tab with its own navigation', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getTabButton(container, '目标管理').click()
  })

  expect(getTabButton(container, '目标管理').getAttribute('aria-selected')).toBe('true')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('目标总览')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('季度目标')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('商品贡献')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('成本与毛利')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('目标版本记录')
  expect(getButton(container, '目标总览').getAttribute('aria-current')).toBe('page')

  root.unmount()
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: FAIL because sidebars and delegated view scaffolds are not wired.

- [ ] **Step 3: Add navigation state and delegated view scaffolds**

In `ProductManagementPlatformPage.tsx`, import:

```ts
import { CostManagementView } from './CostManagementViews'
import { TargetManagementView } from './TargetManagementViews'
import type { CostSection } from './costManagementMockData'
import type { TargetSection } from './targetManagementMockData'
```

Add state:

```ts
const [activeCostSection, setActiveCostSection] = useState<CostSection>('overview')
const [activeTargetSection, setActiveTargetSection] = useState<TargetSection>('overview')
```

Add side navigation blocks following the existing billing nav pattern:

```tsx
{activeTab === 'cost' ? (
  <nav className="product-platform-side-menu" aria-label="成本管理左侧导航">
    {[
      ['overview', '成本总览'],
      ['items', '成本项管理'],
      ['models', '成本模型'],
      ['allocations', '成本分摊规则'],
      ['versions', '成本版本记录'],
    ].map(([id, label]) => (
      <button
        key={id}
        type="button"
        className={`product-platform-side-menu__item${
          activeCostSection === id ? ' product-platform-side-menu__item--active' : ''
        }`}
        aria-current={activeCostSection === id ? 'page' : undefined}
        onClick={() => setActiveCostSection(id as CostSection)}
      >
        {label}
      </button>
    ))}
  </nav>
) : null}
```

Add equivalent `target` nav with labels `目标总览`, `季度目标`, `商品贡献`, `成本与毛利`, `目标版本记录`.

Render delegated views:

```tsx
{activeTab === 'cost' ? (
  <CostManagementView
    activeSection={activeCostSection}
    onNotify={onNotify}
  />
) : null}
{activeTab === 'target' ? (
  <TargetManagementView
    activeSection={activeTargetSection}
    onNotify={onNotify}
  />
) : null}
```

Add canvas modifiers for `cost` and `target`.

- [ ] **Step 4: Create delegated view scaffold files**

Create `CostManagementViews.tsx`:

```tsx
import type { CostSection } from './costManagementMockData'

type CostManagementViewProps = {
  activeSection: CostSection
  onNotify: (message: string) => void
}

export function CostManagementView({ activeSection }: CostManagementViewProps) {
  const titleBySection: Record<CostSection, string> = {
    overview: '成本总览',
    items: '成本项管理',
    models: '成本模型',
    allocations: '成本分摊规则',
    versions: '成本版本记录',
  }

  return (
    <div className="management-workspace">
      <h1>{titleBySection[activeSection]}</h1>
    </div>
  )
}
```

Create `TargetManagementViews.tsx` similarly.

- [ ] **Step 5: Run navigation tests**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: navigation tests PASS. Later content tests can still fail after they are added.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/components/product-management/ProductManagementPlatformPage.tsx src/components/product-management/CostManagementViews.tsx src/components/product-management/TargetManagementViews.tsx src/components/product-management/ProductManagementPlatformPage.test.tsx
git commit -m "feat: add cost and target platform navigation"
```

## Task 3: Cost Management Views

**Files:**
- Modify: `src/components/product-management/CostManagementViews.tsx`
- Modify/Test: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add failing cost view tests**

Add tests:

```ts
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
  expect(getCommodityRowTexts(container).every((text) => text.includes('资源成本'))).toBe(true)

  act(() => {
    getButton(container, '成本模型').click()
  })
  setSearchInput(container, '搜索成本模型', '虚拟细胞积分资源包')
  expect(getCommodityRowTexts(container).slice(0, 3).map((text) => text.match(/虚拟细胞积分资源包-\\d+/)?.[0])).toEqual([
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
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: FAIL because cost views still only render section headings.

- [ ] **Step 3: Implement cost views**

In `CostManagementViews.tsx`, implement:

- Internal state for each view’s filters, search, page, and selected cost model.
- Reusable local components: `MetricGrid`, `ManagementToolbar`, `ManagementTable`, `StatusPill`, `Pagination`.
- `CostOverviewView`.
- `CostItemsView`.
- `CostModelsView` with detail state and back button.
- `CostAllocationsView`.
- `CostVersionsView`.

Use existing class naming style with `management-workspace`, `management-toolbar`, `management-table`, `management-detail`.

- [ ] **Step 4: Add CSS for shared management views**

In `App.css`, add styles for:

- `.product-platform-canvas--cost`
- `.product-platform-canvas--target`
- `.management-workspace`
- `.management-metrics`
- `.management-card`
- `.management-toolbar`
- `.management-table-wrap`
- `.management-table`
- `.management-status`
- `.management-detail`
- `.management-detail__tabs`
- `.management-detail__section`

Keep radius at 8px or less and reuse existing colors.

- [ ] **Step 5: Run cost tests**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: cost view tests PASS.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add src/components/product-management/CostManagementViews.tsx src/components/product-management/ProductManagementPlatformPage.test.tsx src/App.css
git commit -m "feat: add cost management views"
```

## Task 4: Target Management Views

**Files:**
- Modify: `src/components/product-management/TargetManagementViews.tsx`
- Modify/Test: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add failing target view tests**

Add tests:

```ts
it('renders target overview metrics and quarterly attainment rows', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getTabButton(container, '目标管理').click()
  })

  expect(container.textContent).toContain('本季度业绩目标')
  expect(container.textContent).toContain('目标达成率')
  expect(container.textContent).toContain('实际毛利率')
  expect(container.textContent).toContain('虚拟细胞')
  expect(container.textContent).toContain('BioMap Agent')

  root.unmount()
})

it('renders quarterly targets with filters and opens target detail tabs', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getTabButton(container, '目标管理').click()
  })
  act(() => {
    getButton(container, '季度目标').click()
  })

  expect(getTableHeaders(container)).toContain('目标名称')
  expect(getTableHeaders(container)).toContain('达成率')
  expect(getTableHeaders(container)).toContain('成本使用率')
  setSelect(container, '筛选目标季度', 'Q3')
  expect(getCommodityRowTexts(container).every((text) => text.includes('Q3'))).toBe(true)
  expect(container.textContent).toContain('-')

  setSelect(container, '筛选目标季度', 'Q2')
  act(() => {
    getButtons(container, '查看')[0].click()
  })
  expect(container.textContent).toContain('目标详情')
  expect(container.textContent).toContain('目标概览')
  expect(container.textContent).toContain('月度拆分')
  expect(container.textContent).toContain('商品贡献')
  expect(container.textContent).toContain('成本结构')
  expect(container.textContent).toContain('版本记录')

  root.unmount()
})

it('renders target commodity contribution and margin variance tables', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getTabButton(container, '目标管理').click()
  })
  act(() => {
    getButton(container, '商品贡献').click()
  })
  expect(container.textContent).toContain('BioMap Agent - SaaS')
  expect(getTableHeaders(container)).toContain('贡献达成率')

  act(() => {
    getButton(container, '成本与毛利').click()
  })
  expect(getTableHeaders(container)).toContain('毛利率差异')
  expect(container.textContent).toContain('建议动作')

  root.unmount()
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: FAIL because target views still only render section headings.

- [ ] **Step 3: Implement target views**

In `TargetManagementViews.tsx`, implement:

- Internal filters/search/page state.
- `TargetOverviewView`.
- `QuarterlyTargetsView` with detail state and detail tabs.
- `TargetContributionView`.
- `TargetMarginsView`.
- `TargetVersionsView`.

Use the same shared CSS classes from Task 3.

- [ ] **Step 4: Run target tests**

Run:

```bash
npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx
```

Expected: target view tests PASS.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/components/product-management/TargetManagementViews.tsx src/components/product-management/ProductManagementPlatformPage.test.tsx src/App.css
git commit -m "feat: add target management views"
```

## Task 5: Regression, Complexity Audit, And Browser QA

**Files:**
- Review/modify: `src/components/product-management/CostManagementViews.tsx`
- Review/modify: `src/components/product-management/TargetManagementViews.tsx`
- Review/modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Review/modify: `src/components/product-management/costManagementMockData.ts`
- Review/modify: `src/components/product-management/targetManagementMockData.ts`
- Review/modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Review/modify: `src/App.css`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 2: Run complexity audit from source**

Run:

```bash
node -e "import('./src/components/product-management/costManagementMockData.ts').catch(()=>{})"
```

If direct Node TypeScript import fails, use tests instead. Add or adjust Vitest data invariant tests so they prove:

- `costItemRecords.length >= 24`
- `costModelRecords.length >= 20`
- `costAllocationRecords.length >= 12`
- `costVersionRecords.length >= 18`
- `quarterlyTargetRecords.length >= 10`
- `targetCommodityContributionRecords.length >= 17`
- `targetMarginVarianceRecords.length >= 10`
- `targetVersionRecords.length >= 15`
- all 5 products are represented
- all 17 commodities are represented
- virtual cell SaaS 7 billing items are represented

- [ ] **Step 3: Manual browser QA**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open `/product-management-platform` in the in-app browser. Verify:

- Top tabs show 产品管理、商品管理、成本管理、目标管理、费用中心.
- 成本管理 has 5 left nav items and every item renders meaningful content.
- 目标管理 has 5 left nav items and every item renders meaningful content.
- Cost model detail and target detail are readable and not empty.
- Tables scroll horizontally where needed.
- No visible “Demo后要看到” or other demo-explaining text appears.
- Text does not overlap buttons, headers, table cells, or pagination.

- [ ] **Step 4: Final commit**

If Task 5 changes files:

```bash
git add src/components/product-management src/App.css
git commit -m "test: verify cost and target management demo"
```

If Task 5 only verifies, do not create an empty commit.
