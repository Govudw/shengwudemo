// @vitest-environment happy-dom

import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  billingCenterBudgetRules,
  billingCenterMonthlyBills,
  billingCenterServiceInstances,
  getBillingCenterOverviewMetrics,
  type BillingCenterRole,
  type BillingCenterTab,
} from './billingCenterMockData'
import BillingCenterPage from './BillingCenterPage'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('billing center mock data', () => {
  it('uses service instances as the main customer-facing object', () => {
    expect(billingCenterServiceInstances.length).toBeGreaterThanOrEqual(9)
    expect(
      billingCenterServiceInstances.some(
        (record) =>
          record.billingItemCode === 'BM-AGENT-SUB-001' &&
          record.id !== record.billingItemCode,
      ),
    ).toBe(true)
  })

  it('contains bills, usage, and budget rules for dashboard views', () => {
    expect(billingCenterMonthlyBills).toHaveLength(3)
    expect(
      billingCenterMonthlyBills.flatMap((bill) => bill.lineItems).length,
    ).toBeGreaterThanOrEqual(30)
    expect(billingCenterBudgetRules.length).toBeGreaterThanOrEqual(5)

    const metrics = getBillingCenterOverviewMetrics()
    expect(metrics.activeServices).toBeGreaterThan(0)
    expect(metrics.resourceRisks).toBeGreaterThan(0)
    expect(metrics.currentMonthEstimate).toBeGreaterThan(0)
  })
})

describe('BillingCenterPage', () => {
  it('renders compact header tabs and overview metrics', () => {
    const { container, root } = renderBillingCenterPage()

    expect(container.textContent).toContain('费用中心')
    expect(getButton(container, '概览').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(getButton(container, '已开通服务')).not.toBeNull()
    expect(getButton(container, '账单')).not.toBeNull()
    expect(getButton(container, '用量')).not.toBeNull()
    expect(getButton(container, '预算预警')).not.toBeNull()
    expect(container.textContent).toContain('本月预估费用')
    expect(container.textContent).toContain('上月已出账')
    expect(container.textContent).toContain('生效中服务')
    expect(container.textContent).toContain('资源包风险')
    expect(
      container.querySelector('[role="meter"][aria-label="Agent 自动化工作流包 额度使用率"]'),
    ).not.toBeNull()

    act(() => {
      getButtonContaining(container, '基因功能后付费实例超过预算').click()
    })

    expect(getButton(container, '预算预警').getAttribute('aria-current')).toBe(
      'page',
    )
    expect(container.textContent).toContain('预算规则详情')
    expect(container.textContent).toContain('基因功能后付费预算')

    root.unmount()
  })

  it('uses service instances as the main table and opens the service inspector', () => {
    const { container, root } = renderBillingCenterPage()

    act(() => {
      getButton(container, '已开通服务').click()
    })

    expect(getInput(container, '搜索服务实例').value).toBe('')
    expect(container.textContent).toContain('Agent 企业版年度订阅')
    expect(container.textContent).toContain('服务实例')
    expect(container.textContent).not.toContain('商品目录')

    act(() => {
      getRowContaining(container, 'Agent 企业版年度订阅').click()
    })

    expect(container.textContent).toContain('服务实例详情')
    expect(container.textContent).toContain('bi-2026-agent-ent-001')

    act(() => {
      getButton(container, '关闭详情').click()
    })

    expect(container.textContent).not.toContain('服务实例详情')

    expect(getButton(container, '查看 Agent 企业版年度订阅')).not.toBeNull()
    expect(() => getButton(container, '申请退订 Agent 企业版年度订阅')).toThrow()

    act(() => {
      getButton(container, '更多操作 Agent 企业版年度订阅').click()
    })

    expect(getButton(container, '查看账单 Agent 企业版年度订阅')).not.toBeNull()
    expect(getButton(container, '查看用量 Agent 企业版年度订阅')).not.toBeNull()
    expect(getButton(container, '申请退订 Agent 企业版年度订阅')).not.toBeNull()

    act(() => {
      getButton(container, '查看 Agent 企业版年度订阅').click()
    })

    expect(container.textContent).toContain('服务实例详情')
    expect(container.textContent).toContain('bi-2026-agent-ent-001')
    expect(container.textContent).toContain('计费项编码')

    root.unmount()
  })

  it('opens bill line details from the bills tab', () => {
    const { container, root } = renderBillingCenterPage()

    act(() => {
      getButton(container, '账单').click()
    })

    expect(container.textContent).toContain('2026-06')
    expect(container.textContent).toContain('预估中')
    expect(container.textContent).toContain('账单明细')

    act(() => {
      getButton(container, '查看明细 企业版订阅基础席位').click()
    })

    expect(container.textContent).toContain('账单明细详情')
    expect(container.textContent).toContain('bill-2026-06-line-001')
    expect(container.textContent).toContain('计算公式')

    root.unmount()
  })

  it('keeps viewer role read-only for budget management while allowing inspection', () => {
    const { container, root } = renderBillingCenterPage({
      initialRole: 'viewer',
      initialTab: 'budgets',
    })

    expect(getSelect(container, '费用中心角色').value).toBe('viewer')
    expect(container.textContent).toContain('企业月度总预算')
    expect(getButton(container, '编辑 企业月度总预算').disabled).toBe(true)
    expect(getButton(container, '暂停 企业月度总预算').disabled).toBe(true)
    expect(getButton(container, '复制 企业月度总预算').disabled).toBe(true)

    act(() => {
      getButton(container, '查看预算 企业月度总预算').click()
    })

    expect(container.textContent).toContain('预算规则详情')
    expect(container.textContent).toContain('无预算管理权限')

    root.unmount()
  })
})

function renderBillingCenterPage({
  initialRole = 'admin',
  initialTab = 'overview',
}: {
  initialRole?: BillingCenterRole
  initialTab?: BillingCenterTab
} = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const onNotify = vi.fn()

  function Harness() {
    const [activeTab, setActiveTab] = useState<BillingCenterTab>(initialTab)
    const [role, setRole] = useState<BillingCenterRole>(initialRole)
    const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
      null,
    )
    const [selectedBillLineId, setSelectedBillLineId] = useState<string | null>(
      null,
    )
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null)
    const [inspectorOpen, setInspectorOpen] = useState(false)
    const [serviceSearch, setServiceSearch] = useState('')
    const [billSearch, setBillSearch] = useState('')
    const [usageSearch, setUsageSearch] = useState('')
    const [budgetSearch, setBudgetSearch] = useState('')

    return (
      <BillingCenterPage
        activeTab={activeTab}
        role={role}
        selectedServiceId={selectedServiceId}
        selectedBillLineId={selectedBillLineId}
        selectedBudgetId={selectedBudgetId}
        inspectorOpen={inspectorOpen}
        serviceSearch={serviceSearch}
        billSearch={billSearch}
        usageSearch={usageSearch}
        budgetSearch={budgetSearch}
        onTabChange={setActiveTab}
        onRoleChange={setRole}
        onSelectService={(serviceId, open = serviceId !== null) => {
          setSelectedServiceId(serviceId)
          setSelectedBillLineId(null)
          setSelectedBudgetId(null)
          setInspectorOpen(Boolean(serviceId) && open)
        }}
        onSelectBillLine={(lineId, open = lineId !== null) => {
          setSelectedBillLineId(lineId)
          setSelectedServiceId(null)
          setSelectedBudgetId(null)
          setInspectorOpen(Boolean(lineId) && open)
        }}
        onSelectBudget={(budgetId, open = budgetId !== null) => {
          setSelectedBudgetId(budgetId)
          setSelectedServiceId(null)
          setSelectedBillLineId(null)
          setInspectorOpen(Boolean(budgetId) && open)
        }}
        onSearchChange={(scope, value) => {
          if (scope === 'services') {
            setServiceSearch(value)
          } else if (scope === 'bills') {
            setBillSearch(value)
          } else if (scope === 'usage') {
            setUsageSearch(value)
          } else {
            setBudgetSearch(value)
          }
        }}
        onNotify={onNotify}
      />
    )
  }

  act(() => {
    root.render(<Harness />)
  })

  return { container, onNotify, root }
}

function getInput(container: HTMLElement, label: string) {
  const input = container.querySelector<HTMLInputElement>(
    `input[aria-label="${label}"]`,
  )

  if (!input) {
    throw new Error(`Input not found: ${label}`)
  }

  return input
}

function getSelect(container: HTMLElement, label: string) {
  const select = container.querySelector<HTMLSelectElement>(
    `select[aria-label="${label}"]`,
  )

  if (!select) {
    throw new Error(`Select not found: ${label}`)
  }

  return select
}

function getButton(container: HTMLElement, name: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) =>
      element.textContent?.trim() === name ||
      element.getAttribute('aria-label') === name,
  )

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}

function getButtonContaining(container: HTMLElement, text: string) {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button'),
  ).find((element) => element.textContent?.includes(text))

  if (!button) {
    throw new Error(`Button containing text not found: ${text}`)
  }

  return button
}

function getRowContaining(container: HTMLElement, text: string) {
  const row = Array.from(
    container.querySelectorAll<HTMLTableRowElement>('tbody tr'),
  ).find((element) => element.textContent?.includes(text))

  if (!row) {
    throw new Error(`Row containing text not found: ${text}`)
  }

  return row
}
