import type {
  ChangeEvent,
  CSSProperties,
  KeyboardEvent,
  ReactNode,
} from 'react'
import {
  billingCenterBudgetRules,
  billingCenterMonthlyBills,
  billingCenterRiskNotifications,
  billingCenterServiceInstances,
  billingCenterUsageRecords,
  getBillingCenterOverviewMetrics,
  type BillingCenterBillLineItem,
  type BillingCenterBudgetRule,
  type BillingCenterFeeRule,
  type BillingCenterRole,
  type BillingCenterServiceInstance,
  type BillingCenterServiceStatus,
  type BillingCenterTab,
  type BillingCenterUsageRecord,
} from './billingCenterMockData'
import { SearchIcon, XIcon } from '../icons'

type BillingCenterSearchScope = 'services' | 'bills' | 'usage' | 'budgets'

type BillingCenterPageProps = {
  activeTab: BillingCenterTab
  role: BillingCenterRole
  selectedServiceId: string | null
  selectedBillLineId: string | null
  selectedBudgetId: string | null
  inspectorOpen: boolean
  serviceSearch: string
  billSearch: string
  usageSearch: string
  budgetSearch: string
  onTabChange: (tab: BillingCenterTab) => void
  onRoleChange: (role: BillingCenterRole) => void
  onSelectService: (serviceId: string | null, inspectorOpen?: boolean) => void
  onSelectBillLine: (lineId: string | null, inspectorOpen?: boolean) => void
  onSelectBudget: (budgetId: string | null, inspectorOpen?: boolean) => void
  onSearchChange: (scope: BillingCenterSearchScope, value: string) => void
  onNotify: (message: string) => void
}

const tabs: Array<{ id: BillingCenterTab; label: string }> = [
  { id: 'overview', label: '概览' },
  { id: 'services', label: '已开通服务' },
  { id: 'bills', label: '账单' },
  { id: 'usage', label: '用量' },
  { id: 'budgets', label: '预算预警' },
]

const latestBill = billingCenterMonthlyBills.find(
  (bill) => bill.month === '2026-06',
)
const latestBillLines = latestBill?.lineItems ?? []

function BillingCenterPage({
  activeTab,
  role,
  selectedServiceId,
  selectedBillLineId,
  selectedBudgetId,
  inspectorOpen,
  serviceSearch,
  billSearch,
  usageSearch,
  budgetSearch,
  onTabChange,
  onRoleChange,
  onSelectService,
  onSelectBillLine,
  onSelectBudget,
  onSearchChange,
  onNotify,
}: BillingCenterPageProps) {
  const metrics = getBillingCenterOverviewMetrics()
  const selectedService = billingCenterServiceInstances.find(
    (service) => service.id === selectedServiceId,
  )
  const selectedBillLine = billingCenterMonthlyBills
    .flatMap((bill) => bill.lineItems)
    .find((lineItem) => lineItem.id === selectedBillLineId)
  const selectedBudget = billingCenterBudgetRules.find(
    (budget) => budget.id === selectedBudgetId,
  )
  const inspectorMode = getInspectorMode(
    activeTab,
    inspectorOpen,
    selectedService,
    selectedBillLine,
    selectedBudget,
  )

  function handleTabChange(tab: BillingCenterTab) {
    onTabChange(tab)
  }

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    onRoleChange(event.target.value as BillingCenterRole)
  }

  function handleDemoAction(message: string) {
    onNotify(message)
  }

  return (
    <main className="billing-center-page" aria-label="费用中心">
      <header className="billing-center-header">
        <div className="billing-center-header__copy">
          <h1>费用中心</h1>
          <p>企业费用视图 · 本月预估、服务实例、账单和预算预警</p>
        </div>
        <div className="billing-center-header__actions">
          <label className="billing-center-role-select">
            <span>企业角色</span>
            <select
              aria-label="费用中心角色"
              value={role}
              onChange={handleRoleChange}
            >
              <option value="admin">企业管理员</option>
              <option value="viewer">费用查看用户</option>
            </select>
          </label>
          <button
            type="button"
            className="billing-center-secondary-action"
            onClick={() => handleDemoAction('已生成账单导出任务')}
          >
            导出账单
          </button>
          <button
            type="button"
            className="billing-center-secondary-action"
            onClick={() => handleDemoAction('商务支持已收到联系请求')}
          >
            联系商务
          </button>
        </div>
      </header>

      <nav className="billing-center-tabs" aria-label="费用中心视图">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`billing-center-tab${
              activeTab === tab.id ? ' billing-center-tab--active' : ''
            }`}
            aria-current={activeTab === tab.id ? 'page' : undefined}
            onClick={() => handleTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section
        className={`billing-center-content${
          inspectorMode ? ' billing-center-content--with-inspector' : ''
        }`}
      >
        <div className="billing-center-main-panel">
          {activeTab === 'overview' ? (
            <OverviewTab
              metrics={metrics}
              onOpenServices={(serviceId) => {
                onTabChange('services')
                onSelectService(serviceId, true)
              }}
              onOpenBills={() => onTabChange('bills')}
              onOpenBudgets={(budgetId) => {
                onTabChange('budgets')
                if (budgetId) {
                  onSelectBudget(budgetId, true)
                }
              }}
            />
          ) : null}
          {activeTab === 'services' ? (
            <ServicesTab
              role={role}
              search={serviceSearch}
              selectedServiceId={selectedServiceId}
              onSearchChange={(value) => onSearchChange('services', value)}
              onSelectService={onSelectService}
              onOpenBills={(serviceId) => {
                const lineItem = latestBillLines.find(
                  (item) => item.serviceInstanceId === serviceId,
                )
                onTabChange('bills')
                if (lineItem) {
                  onSelectBillLine(lineItem.id, true)
                }
              }}
              onOpenUsage={(serviceId) => {
                onTabChange('usage')
                onSelectService(serviceId, true)
              }}
              onNotify={handleDemoAction}
            />
          ) : null}
          {activeTab === 'bills' ? (
            <BillsTab
              search={billSearch}
              selectedBillLineId={selectedBillLineId}
              onSearchChange={(value) => onSearchChange('bills', value)}
              onSelectBillLine={onSelectBillLine}
              onNotify={handleDemoAction}
            />
          ) : null}
          {activeTab === 'usage' ? (
            <UsageTab
              search={usageSearch}
              onSearchChange={(value) => onSearchChange('usage', value)}
              onSelectService={onSelectService}
            />
          ) : null}
          {activeTab === 'budgets' ? (
            <BudgetsTab
              role={role}
              search={budgetSearch}
              selectedBudgetId={selectedBudgetId}
              onSearchChange={(value) => onSearchChange('budgets', value)}
              onSelectBudget={onSelectBudget}
              onNotify={handleDemoAction}
            />
          ) : null}
        </div>

        {inspectorMode ? (
          <BillingInspector
            mode={inspectorMode}
            role={role}
            service={selectedService}
            billLine={selectedBillLine}
            budget={selectedBudget}
            onClose={() => {
              if (inspectorMode === 'service') {
                onSelectService(null, false)
              } else if (inspectorMode === 'bill') {
                onSelectBillLine(null, false)
              } else {
                onSelectBudget(null, false)
              }
            }}
            onNotify={handleDemoAction}
          />
        ) : null}
      </section>
    </main>
  )
}

type OverviewTabProps = {
  metrics: ReturnType<typeof getBillingCenterOverviewMetrics>
  onOpenServices: (serviceId: string) => void
  onOpenBills: () => void
  onOpenBudgets: (budgetId?: string | null) => void
}

function OverviewTab({
  metrics,
  onOpenServices,
  onOpenBills,
  onOpenBudgets,
}: OverviewTabProps) {
  const topServices = [...billingCenterServiceInstances]
    .sort((left, right) => right.currentMonthCost - left.currentMonthCost)
    .slice(0, 5)
  const totalCost = topServices.reduce(
    (sum, service) => sum + service.currentMonthCost,
    0,
  )
  const packageServices = billingCenterServiceInstances.filter(
    (service) => service.quotaAmount !== null,
  )

  return (
    <div className="billing-center-overview">
      <div className="billing-center-metrics">
        <button
          type="button"
          className="billing-center-metric"
          onClick={onOpenBills}
        >
          <span>本月预估费用</span>
          <strong>{formatCurrency(metrics.currentMonthEstimate)}</strong>
          <small>预算使用率 {metrics.budgetUsageRate}%</small>
        </button>
        <button
          type="button"
          className="billing-center-metric"
          onClick={onOpenBills}
        >
          <span>上月已出账</span>
          <strong>{formatCurrency(metrics.previousMonthBill)}</strong>
          <small>2026-05 已生成</small>
        </button>
        <button
          type="button"
          className="billing-center-metric"
          onClick={() => onOpenServices('svc-agent-enterprise-subscription')}
        >
          <span>生效中服务</span>
          <strong>{metrics.activeServices}</strong>
          <small>服务实例为主对象</small>
        </button>
        <button
          type="button"
          className="billing-center-metric billing-center-metric--risk"
          onClick={() => onOpenBudgets()}
        >
          <span>资源包风险</span>
          <strong>{metrics.resourceRisks}</strong>
          <small>耗尽、超额或预算触发</small>
        </button>
      </div>

      <div className="billing-center-overview-grid">
        <section className="billing-center-section">
          <SectionHeader title="本月费用趋势" meta="2026-06 累计预估" />
          <div className="billing-center-trend" aria-label="本月费用趋势">
            {[42, 48, 55, 61, 69, 78, 83, 94].map((height, index) => (
              <span
                key={height}
                style={{ '--bar-height': `${height}%` } as CSSProperties}
              >
                {index === 6 ? '异常增长' : ''}
              </span>
            ))}
            <i aria-hidden="true" />
          </div>
        </section>

        <section className="billing-center-section">
          <SectionHeader title="费用构成" meta="按服务实例费用拆分" />
          <div className="billing-center-bars">
            {topServices.slice(0, 4).map((service) => (
              <button
                key={service.id}
                type="button"
                className="billing-center-bar-row"
                onClick={() => onOpenServices(service.id)}
              >
                <span>{service.name}</span>
                <div>
                  <i
                    style={
                      {
                        '--bar-width': `${Math.max(
                          8,
                          Math.round(
                            (service.currentMonthCost / totalCost) * 100,
                          ),
                        )}%`,
                      } as CSSProperties
                    }
                  />
                </div>
                <strong>{formatCurrency(service.currentMonthCost)}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="billing-center-section">
          <SectionHeader title="资源包余量" meta="关键额度实例" />
          <div className="billing-center-quota-list">
            {packageServices.slice(0, 5).map((service) => (
              <button
                key={service.id}
                type="button"
                className="billing-center-quota-row"
                onClick={() => onOpenServices(service.id)}
              >
                <span>{service.name}</span>
                <strong>{formatQuotaLeft(service)}</strong>
                <Progress
                  value={getQuotaUsagePercent(service)}
                  label={`${service.name} 额度使用率`}
                />
              </button>
            ))}
          </div>
        </section>

        <section className="billing-center-section">
          <SectionHeader title="费用最高服务 Top 5" meta="点击进入服务实例" />
          <div className="billing-center-table-wrap">
            <table className="billing-center-table billing-center-table--compact">
              <thead>
                <tr>
                  <th>服务实例</th>
                  <th>所属商品</th>
                  <th>本月费用</th>
                  <th>风险</th>
                </tr>
              </thead>
              <tbody>
                {topServices.map((service) => (
                  <tr key={service.id}>
                    <td>
                      <button
                        type="button"
                        className="billing-center-link-button"
                        onClick={() => onOpenServices(service.id)}
                      >
                        {service.name}
                      </button>
                    </td>
                    <td>{service.productName}</td>
                    <td>{formatCurrency(service.currentMonthCost)}</td>
                    <td>
                      <StatusBadge tone={riskTone(service.riskLevel)}>
                        {riskLabel(service.riskLevel)}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="billing-center-section">
        <SectionHeader title="费用风险提示" meta="预算与资源包事件" />
        <div className="billing-center-risk-list">
          {billingCenterRiskNotifications.map((risk) => (
            <button
              key={risk.id}
              type="button"
              className="billing-center-risk-item"
              onClick={() =>
                onOpenBudgets(
                  getPrimaryBudgetForServiceId(risk.serviceInstanceId)?.id,
                )
              }
            >
              <StatusBadge tone={risk.severity === 'critical' ? 'danger' : 'warning'}>
                {risk.severity === 'critical' ? '高风险' : '预警'}
              </StatusBadge>
              <strong>{risk.title}</strong>
              <span>{risk.message}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

type ServicesTabProps = {
  role: BillingCenterRole
  search: string
  selectedServiceId: string | null
  onSearchChange: (value: string) => void
  onSelectService: (serviceId: string | null, inspectorOpen?: boolean) => void
  onOpenBills: (serviceId: string) => void
  onOpenUsage: (serviceId: string) => void
  onNotify: (message: string) => void
}

function ServicesTab({
  role,
  search,
  selectedServiceId,
  onSearchChange,
  onSelectService,
  onOpenBills,
  onOpenUsage,
  onNotify,
}: ServicesTabProps) {
  const rows = filterServices(search)
  const canManage = role !== 'viewer'

  return (
    <div className="billing-center-tab-panel">
      <Toolbar
        title="已开通服务"
        meta={`${rows.length} 个服务实例`}
        searchLabel="搜索服务实例"
        search={search}
        onSearchChange={onSearchChange}
      />
      <div className="billing-center-detail-layout">
        <div className="billing-center-table-wrap">
          <table className="billing-center-table billing-center-services-table">
            <thead>
              <tr>
                <th>服务实例</th>
                <th>所属商品</th>
                <th>费用规则</th>
                <th>状态</th>
                <th>有效期</th>
                <th>总额度</th>
                <th>已用</th>
                <th>剩余</th>
                <th>本月费用</th>
                <th>关联项目</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((service) => (
                <tr
                  key={service.id}
                  tabIndex={0}
                  onClick={() => onSelectService(service.id, true)}
                  onKeyDown={(event) =>
                    handleOpenServiceRow(event, service.id, onSelectService)
                  }
                  className={
                    selectedServiceId === service.id
                      ? 'billing-center-table__row--active'
                      : undefined
                  }
                >
                  <td data-column-key="name">
                    <button
                      type="button"
                      className="billing-center-row-title"
                      onClick={() => onSelectService(service.id, true)}
                    >
                      {service.name}
                    </button>
                    <small>{service.billingInstanceId}</small>
                  </td>
                  <td>{service.productName}</td>
                  <td>{feeRuleLabel(service.feeRule)}</td>
                  <td>
                    <StatusBadge tone={serviceStatusTone(service.status)}>
                      {serviceStatusLabel(service.status)}
                    </StatusBadge>
                  </td>
                  <td>{formatPeriod(service.startsAt, service.endsAt)}</td>
                  <td>{service.quotaLabel}</td>
                  <td>{formatQuantity(service.usedAmount, service.unit)}</td>
                  <td>{formatQuotaLeft(service)}</td>
                  <td>{formatCurrency(service.currentMonthCost)}</td>
                  <td>{service.ownerTeam}</td>
                  <td
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <div className="billing-center-actions">
                      <button
                        type="button"
                        className="billing-center-link-action"
                        aria-label={`查看详情 ${service.name}`}
                        onClick={() => onSelectService(service.id, true)}
                      >
                        查看详情
                      </button>
                      <button
                        type="button"
                        className="billing-center-link-action"
                        aria-label={`查看账单 ${service.name}`}
                        onClick={() => onOpenBills(service.id)}
                      >
                        查看账单
                      </button>
                      <button
                        type="button"
                        className="billing-center-link-action"
                        aria-label={`查看用量 ${service.name}`}
                        onClick={() => onOpenUsage(service.id)}
                      >
                        查看用量
                      </button>
                      <button
                        type="button"
                        className="billing-center-link-action"
                        disabled={!canManage}
                        title={canManage ? undefined : '费用查看用户无管理权限'}
                        aria-label={`续费 ${service.name}`}
                        onClick={() => onNotify('该操作将进入续费订单流程')}
                      >
                        续费
                      </button>
                      <button
                        type="button"
                        className="billing-center-link-action"
                        disabled={!canManage}
                        title={canManage ? undefined : '费用查看用户无管理权限'}
                        aria-label={`扩容 ${service.name}`}
                        onClick={() => onNotify('该操作将进入扩容订单流程')}
                      >
                        扩容
                      </button>
                      <button
                        type="button"
                        className="billing-center-link-action"
                        disabled={!canManage}
                        title={canManage ? undefined : '费用查看用户无管理权限'}
                        aria-label={`申请退订 ${service.name}`}
                        onClick={() => onNotify('申请退订将进入服务退订审批流程')}
                      >
                        申请退订
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

type BillsTabProps = {
  search: string
  selectedBillLineId: string | null
  onSearchChange: (value: string) => void
  onSelectBillLine: (lineId: string | null, inspectorOpen?: boolean) => void
  onNotify: (message: string) => void
}

function BillsTab({
  search,
  selectedBillLineId,
  onSearchChange,
  onSelectBillLine,
  onNotify,
}: BillsTabProps) {
  const lines = filterBillLines(search)

  return (
    <div className="billing-center-tab-panel">
      <Toolbar
        title="账单"
        meta="月度账单和账单明细"
        searchLabel="搜索账单"
        search={search}
        onSearchChange={onSearchChange}
        action={
          <button
            type="button"
            className="billing-center-secondary-action"
            onClick={() => onNotify('已生成账单导出任务')}
          >
            导出
          </button>
        }
      />

      <section className="billing-center-section">
        <SectionHeader title="月度账单列表" meta="支付状态仅展示" />
        <div className="billing-center-table-wrap">
          <table className="billing-center-table">
            <thead>
              <tr>
                <th>账期</th>
                <th>账单状态</th>
                <th>账单金额</th>
                <th>已支付</th>
                <th>待支付</th>
                <th>服务实例数</th>
                <th>生成时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {billingCenterMonthlyBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.month}</td>
                  <td>
                    <StatusBadge tone={bill.status === 'estimated' ? 'warning' : 'success'}>
                      {billStatusLabel(bill.status)}
                    </StatusBadge>
                  </td>
                  <td>{formatCurrency(bill.totalAmount)}</td>
                  <td>{bill.status === 'issued' ? formatCurrency(bill.totalAmount) : '-'}</td>
                  <td>{bill.status === 'estimated' ? formatCurrency(bill.totalAmount) : '-'}</td>
                  <td>{bill.lineItems.filter((item) => item.amount > 0).length}</td>
                  <td>{bill.issuedAt ?? '待生成'}</td>
                  <td>
                    <button
                      type="button"
                      className="billing-center-link-action"
                      onClick={() => onNotify('账单导出已排队')}
                    >
                      导出
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="billing-center-section">
        <SectionHeader title="账单明细" meta="按服务实例解释费用来源" />
        <div className="billing-center-table-wrap">
          <table className="billing-center-table billing-center-bill-line-table">
            <thead>
              <tr>
                <th>账单明细</th>
                <th>服务实例</th>
                <th>所属商品</th>
                <th>费用规则</th>
                <th>用量</th>
                <th>单价</th>
                <th>抵扣</th>
                <th>应付金额</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {lines.map(({ billMonth, line }) => (
                <tr
                  key={line.id}
                  className={
                    selectedBillLineId === line.id
                      ? 'billing-center-table__row--active'
                      : undefined
                  }
                >
                  <td data-column-key="name">
                    <button
                      type="button"
                      className="billing-center-row-title"
                      onClick={() => onSelectBillLine(line.id, true)}
                    >
                      {line.itemName}
                    </button>
                    <small>{billMonth}</small>
                  </td>
                  <td>{line.serviceInstanceName}</td>
                  <td>{line.productName}</td>
                  <td>{feeRuleLabel(line.feeRule)}</td>
                  <td>{formatQuantity(line.quantity, line.unit)}</td>
                  <td>{formatCurrency(line.unitPrice)}</td>
                  <td>{getDeductionLabel(line)}</td>
                  <td>{formatCurrency(line.amount)}</td>
                  <td>
                    <StatusBadge tone={billMonth === '2026-06' ? 'warning' : 'success'}>
                      {billMonth === '2026-06' ? '预估中' : '已出账'}
                    </StatusBadge>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="billing-center-link-action"
                      aria-label={`查看明细 ${line.itemName}`}
                      onClick={() => onSelectBillLine(line.id, true)}
                    >
                      查看明细
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

type UsageTabProps = {
  search: string
  onSearchChange: (value: string) => void
  onSelectService: (serviceId: string | null, inspectorOpen?: boolean) => void
}

function UsageTab({ search, onSearchChange, onSelectService }: UsageTabProps) {
  const rows = filterUsage(search)

  return (
    <div className="billing-center-tab-panel">
      <Toolbar
        title="用量"
        meta={`${rows.length} 条近期用量`}
        searchLabel="搜索用量"
        search={search}
        onSearchChange={onSearchChange}
      />
      <div className="billing-center-table-wrap">
        <table className="billing-center-table billing-center-usage-table">
          <thead>
            <tr>
              <th>服务实例</th>
              <th>资源类型</th>
              <th>日期</th>
              <th>本月用量</th>
              <th>剩余额度</th>
              <th>本月费用</th>
              <th>环比</th>
              <th>风险</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((usage) => {
              const service = getService(usage.serviceInstanceId)

              return (
                <tr key={usage.id}>
                  <td data-column-key="name">
                    <button
                      type="button"
                      className="billing-center-row-title"
                      onClick={() => onSelectService(usage.serviceInstanceId, true)}
                    >
                      {usage.serviceInstanceName}
                    </button>
                  </td>
                  <td>{usage.metricName}</td>
                  <td>{usage.date}</td>
                  <td>{formatQuantity(usage.quantity, usage.unit)}</td>
                  <td>{service ? formatQuotaLeft(service) : '-'}</td>
                  <td>{formatCurrency(usage.estimatedCost)}</td>
                  <td>{service ? formatMonthDelta(service) : '-'}</td>
                  <td>
                    <StatusBadge tone={service ? riskTone(service.riskLevel) : 'neutral'}>
                      {service ? riskLabel(service.riskLevel) : '正常'}
                    </StatusBadge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

type BudgetsTabProps = {
  role: BillingCenterRole
  search: string
  selectedBudgetId: string | null
  onSearchChange: (value: string) => void
  onSelectBudget: (budgetId: string | null, inspectorOpen?: boolean) => void
  onNotify: (message: string) => void
}

function BudgetsTab({
  role,
  search,
  selectedBudgetId,
  onSearchChange,
  onSelectBudget,
  onNotify,
}: BudgetsTabProps) {
  const rows = filterBudgets(search)
  const canManage = role !== 'viewer'
  const activeBudgetCount = billingCenterBudgetRules.filter(
    (budget) => budget.status === 'active',
  ).length
  const triggeredCount = billingCenterBudgetRules.filter(
    (budget) => budget.lastTriggeredAt !== null,
  ).length
  const overBudgetCount = billingCenterBudgetRules.filter(
    (budget) => budget.usedAmount > budget.limitAmount,
  ).length

  return (
    <div className="billing-center-tab-panel">
      <Toolbar
        title="预算预警"
        meta={`${rows.length} 条预算规则`}
        searchLabel="搜索预算"
        search={search}
        onSearchChange={onSearchChange}
        action={
          <button
            type="button"
            className="billing-center-primary-action"
            disabled={!canManage}
            title={canManage ? undefined : '费用查看用户无预算管理权限'}
            onClick={() => onNotify('新建预算将进入预算配置流程')}
          >
            新建预算
          </button>
        }
      />

      <div className="billing-center-budget-summary">
        <SummaryPill label="生效预算" value={String(activeBudgetCount)} />
        <SummaryPill label="已触发预警" value={String(triggeredCount)} />
        <SummaryPill label="预测超支" value={String(overBudgetCount)} />
        <SummaryPill
          label="本月预算使用率"
          value={`${getBudgetUsagePercent(billingCenterBudgetRules[0])}%`}
        />
      </div>

      <div className="billing-center-table-wrap">
        <table className="billing-center-table billing-center-budget-table">
          <thead>
            <tr>
              <th>预算名称</th>
              <th>预算范围</th>
              <th>预算周期</th>
              <th>预算额度</th>
              <th>当前使用</th>
              <th>使用率</th>
              <th>阈值规则</th>
              <th>通知对象</th>
              <th>状态</th>
              <th>最近触发</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((budget) => (
              <tr
                key={budget.id}
                className={
                  selectedBudgetId === budget.id
                    ? 'billing-center-table__row--active'
                    : undefined
                }
              >
                <td data-column-key="name">
                  <button
                    type="button"
                    className="billing-center-row-title"
                    onClick={() => onSelectBudget(budget.id, true)}
                  >
                    {budget.name}
                  </button>
                  <small>{budget.targetName}</small>
                </td>
                <td>{budgetScopeLabel(budget.scope)}</td>
                <td>{budget.period === 'monthly' ? '月度' : '季度'}</td>
                <td>{formatCurrency(budget.limitAmount)}</td>
                <td>{formatCurrency(budget.usedAmount)}</td>
                <td>
                  <div className="billing-center-usage-cell">
                    <span>{getBudgetUsagePercent(budget)}%</span>
                    <Progress
                      value={getBudgetUsagePercent(budget)}
                      label={`${budget.name} 预算使用率`}
                    />
                  </div>
                </td>
                <td>{budget.thresholds.map((threshold) => `${threshold}%`).join(' / ')}</td>
                <td>{budget.recipients.join('、')}</td>
                <td>
                  <StatusBadge tone={budget.status === 'active' ? 'success' : 'neutral'}>
                    {budget.status === 'active' ? '生效中' : '已暂停'}
                  </StatusBadge>
                </td>
                <td>{budget.lastTriggeredAt ? formatDateTime(budget.lastTriggeredAt) : '-'}</td>
                <td>
                  <div className="billing-center-actions">
                    <button
                      type="button"
                      className="billing-center-link-action"
                      aria-label={`查看预算 ${budget.name}`}
                      onClick={() => onSelectBudget(budget.id, true)}
                    >
                      查看预算
                    </button>
                    <BudgetManagementButton
                      action="编辑"
                      budget={budget}
                      canManage={canManage}
                      onNotify={onNotify}
                    />
                    <BudgetManagementButton
                      action="暂停"
                      budget={budget}
                      canManage={canManage}
                      onNotify={onNotify}
                    />
                    <BudgetManagementButton
                      action="复制"
                      budget={budget}
                      canManage={canManage}
                      onNotify={onNotify}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function BillingInspector({
  mode,
  role,
  service,
  billLine,
  budget,
  onClose,
  onNotify,
}: {
  mode: 'service' | 'bill' | 'budget'
  role: BillingCenterRole
  service?: BillingCenterServiceInstance
  billLine?: BillingCenterBillLineItem
  budget?: BillingCenterBudgetRule
  onClose: () => void
  onNotify: (message: string) => void
}) {
  return (
    <aside className="billing-center-inspector" aria-label="费用中心详情">
      <div className="billing-center-inspector__head">
        <div>
          <span>Inspector</span>
          <h2>
            {mode === 'service'
              ? '服务实例详情'
              : mode === 'bill'
                ? '账单明细详情'
                : '预算规则详情'}
          </h2>
        </div>
        <button
          type="button"
          className="billing-center-icon-button"
          aria-label="关闭详情"
          onClick={onClose}
        >
          <XIcon className="billing-center-icon" />
        </button>
      </div>

      {mode === 'service' && service ? (
        <ServiceInspector service={service} onNotify={onNotify} />
      ) : null}
      {mode === 'bill' && billLine ? <BillInspector line={billLine} /> : null}
      {mode === 'budget' && budget ? (
        <BudgetInspector
          budget={budget}
          role={role}
          onNotify={onNotify}
        />
      ) : null}
    </aside>
  )
}

function ServiceInspector({
  service,
  onNotify,
}: {
  service: BillingCenterServiceInstance
  onNotify: (message: string) => void
}) {
  const lineItems = latestBillLines.filter(
    (line) => line.serviceInstanceId === service.id,
  )
  const matchedBudgets = getBudgetsForService(service)

  return (
    <div className="billing-center-inspector__body">
      <h3>{service.name}</h3>
      <p>{service.riskReason ?? '当前服务实例未命中高风险预算或额度事件。'}</p>
      <dl className="billing-center-inspector__meta">
        <Meta label="服务实例 ID" value={service.billingInstanceId} />
        <Meta label="所属商品" value={service.productName} />
        <Meta label="商品编码" value={service.commodityCode} />
        <Meta label="计费项编码" value={service.billingItemCode} />
        <Meta label="费用规则" value={feeRuleLabel(service.feeRule)} />
        <Meta label="开通时间" value={service.startsAt} />
        <Meta label="到期时间" value={service.endsAt ?? '持续后付费'} />
        <Meta label="总额度" value={service.quotaLabel} />
        <Meta label="已用额度" value={formatQuantity(service.usedAmount, service.unit)} />
        <Meta label="剩余额度" value={formatQuotaLeft(service)} />
        <Meta label="本月费用" value={formatCurrency(service.currentMonthCost)} />
        <Meta label="关联项目" value={service.ownerTeam} />
      </dl>
      <section className="billing-center-inspector-block">
        <h4>计费解释</h4>
        <ul>
          <li>本月总用量：{formatQuantity(service.usedAmount, service.unit)}</li>
          <li>资源包抵扣：{service.feeRule === 'prepaidPack' ? '按资源包额度抵扣' : '无资源包抵扣'}</li>
          <li>包月覆盖：{service.feeRule === 'subscription' ? service.quotaLabel : '不适用'}</li>
          <li>超额后付费金额：{service.feeRule === 'postpaid' ? formatCurrency(service.currentMonthCost) : '按合同规则补差'}</li>
        </ul>
      </section>
      <section className="billing-center-inspector-block">
        <h4>已产生账单明细</h4>
        <ul>
          {lineItems.map((line) => (
            <li key={line.id}>
              {line.itemName} · {formatCurrency(line.amount)}
            </li>
          ))}
        </ul>
      </section>
      <section className="billing-center-inspector-block">
        <h4>预算命中记录</h4>
        <ul>
          {matchedBudgets.length > 0 ? (
            matchedBudgets.map((budget) => (
              <li key={budget.id}>
                {budget.name} · 使用率 {getBudgetUsagePercent(budget)}%
              </li>
            ))
          ) : (
            <li>未命中独立预算规则</li>
          )}
        </ul>
      </section>
      <div className="billing-center-inspector__actions">
        <button
          type="button"
          className="billing-center-secondary-action"
          onClick={() => onNotify('已发起商务联系请求')}
        >
          联系商务
        </button>
      </div>
    </div>
  )
}

function BillInspector({ line }: { line: BillingCenterBillLineItem }) {
  const bill = billingCenterMonthlyBills.find((monthlyBill) =>
    monthlyBill.lineItems.some((item) => item.id === line.id),
  )
  const service = getService(line.serviceInstanceId)
  const matchedBudget = billingCenterBudgetRules.find(
    (budget) => budget.targetId === line.serviceInstanceId,
  )

  return (
    <div className="billing-center-inspector__body">
      <h3>{line.itemName}</h3>
      <p>账单来自服务实例用量、资源包抵扣和合同价格规则。</p>
      <dl className="billing-center-inspector__meta">
        <Meta label="账单 ID" value={line.id} />
        <Meta label="账期" value={bill?.month ?? '-'} />
        <Meta label="服务实例" value={line.serviceInstanceName} />
        <Meta label="商品" value={line.productName} />
        <Meta label="计费项编码" value={line.billingItemCode} />
        <Meta label="用量来源" value={service?.ownerTeam ?? line.costCenter} />
        <Meta label="计算公式" value={`${formatQuantity(line.quantity, line.unit)} × ${formatCurrency(line.unitPrice)}`} />
        <Meta label="资源包抵扣" value={getDeductionLabel(line)} />
        <Meta label="应付金额" value={formatCurrency(line.amount)} />
        <Meta label="支付状态" value={bill?.status === 'estimated' ? '预估中' : '已支付'} />
        <Meta label="关联预算" value={matchedBudget?.name ?? '企业月度总预算'} />
      </dl>
    </div>
  )
}

function BudgetInspector({
  budget,
  role,
  onNotify,
}: {
  budget: BillingCenterBudgetRule
  role: BillingCenterRole
  onNotify: (message: string) => void
}) {
  const canManage = role !== 'viewer'

  return (
    <div className="billing-center-inspector__body">
      <h3>{budget.name}</h3>
      <p>
        {canManage
          ? '可在预算配置流程中编辑、暂停或复制规则。'
          : '无预算管理权限，可查看规则与触发记录。'}
      </p>
      <dl className="billing-center-inspector__meta">
        <Meta label="预算范围" value={budgetScopeLabel(budget.scope)} />
        <Meta label="统计对象" value={budget.targetName} />
        <Meta label="预算周期" value={budget.period === 'monthly' ? '月度' : '季度'} />
        <Meta label="预算额度" value={formatCurrency(budget.limitAmount)} />
        <Meta label="当前使用" value={formatCurrency(budget.usedAmount)} />
        <Meta label="使用率" value={`${getBudgetUsagePercent(budget)}%`} />
        <Meta label="阈值规则" value={budget.thresholds.map((threshold) => `${threshold}%`).join(' / ')} />
        <Meta label="通知对象" value={budget.recipients.join('、')} />
        <Meta label="最近触发" value={budget.lastTriggeredAt ? formatDateTime(budget.lastTriggeredAt) : '未触发'} />
      </dl>
      <section className="billing-center-inspector-block">
        <h4>阈值命中记录</h4>
        <div className="billing-center-budget-curve">
          {budget.thresholds.map((threshold) => (
            <span key={threshold}>{threshold}%</span>
          ))}
          <strong style={{ left: `${Math.min(getBudgetUsagePercent(budget), 100)}%` }}>
            当前
          </strong>
        </div>
      </section>
      <div className="billing-center-inspector__actions">
        <BudgetManagementButton
          action="编辑"
          budget={budget}
          canManage={canManage}
          onNotify={onNotify}
        />
        <BudgetManagementButton
          action="暂停"
          budget={budget}
          canManage={canManage}
          onNotify={onNotify}
        />
        <BudgetManagementButton
          action="复制"
          budget={budget}
          canManage={canManage}
          onNotify={onNotify}
        />
      </div>
    </div>
  )
}

function Toolbar({
  title,
  meta,
  searchLabel,
  search,
  action,
  onSearchChange,
}: {
  title: string
  meta: string
  searchLabel: string
  search: string
  action?: ReactNode
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="billing-center-toolbar">
      <div>
        <h2>{title}</h2>
        <span>{meta}</span>
      </div>
      <label className="billing-center-search">
        <SearchIcon className="billing-center-icon" />
        <input
          aria-label={searchLabel}
          value={search}
          placeholder={searchLabel}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label>
      {action ? <div className="billing-center-toolbar__action">{action}</div> : null}
    </div>
  )
}

function SectionHeader({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="billing-center-section__header">
      <h2>{title}</h2>
      <span>{meta}</span>
    </div>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="billing-center-summary-pill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function Progress({
  value,
  label = '使用率',
}: {
  value: number
  label?: string
}) {
  return (
    <div
      className="billing-center-progress"
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.min(100, Math.max(0, value))}
    >
      <span
        style={
          {
            '--progress-width': `${Math.min(100, Math.max(0, value))}%`,
          } as CSSProperties
        }
      />
    </div>
  )
}

function StatusBadge({
  tone,
  children,
}: {
  tone: 'success' | 'warning' | 'danger' | 'neutral'
  children: ReactNode
}) {
  return (
    <span className={`billing-center-status billing-center-status--${tone}`}>
      {children}
    </span>
  )
}

function BudgetManagementButton({
  action,
  budget,
  canManage,
  onNotify,
}: {
  action: '编辑' | '暂停' | '复制'
  budget: BillingCenterBudgetRule
  canManage: boolean
  onNotify: (message: string) => void
}) {
  return (
    <button
      type="button"
      className="billing-center-link-action"
      disabled={!canManage}
      title={canManage ? undefined : '费用查看用户无预算管理权限'}
      aria-label={`${action} ${budget.name}`}
      onClick={() => onNotify(`${action}预算规则将进入预算配置流程`)}
    >
      {action}
    </button>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function handleOpenServiceRow(
  event: KeyboardEvent<HTMLTableRowElement>,
  serviceId: string,
  onSelectService: (serviceId: string | null, inspectorOpen?: boolean) => void,
) {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  onSelectService(serviceId, true)
}

function getInspectorMode(
  activeTab: BillingCenterTab,
  inspectorOpen: boolean,
  service?: BillingCenterServiceInstance,
  billLine?: BillingCenterBillLineItem,
  budget?: BillingCenterBudgetRule,
): 'service' | 'bill' | 'budget' | null {
  if (!inspectorOpen) {
    return null
  }

  if (activeTab === 'bills' && billLine) {
    return 'bill'
  }

  if (activeTab === 'budgets' && budget) {
    return 'budget'
  }

  if (service) {
    return 'service'
  }

  if (billLine) {
    return 'bill'
  }

  if (budget) {
    return 'budget'
  }

  return null
}

function filterServices(search: string) {
  const normalizedSearch = normalizeSearch(search)

  return billingCenterServiceInstances.filter((service) =>
    includesSearch(
      normalizedSearch,
      service.name,
      service.productName,
      service.billingItemCode,
      service.billingInstanceId,
      service.ownerTeam,
      service.costCenter,
    ),
  )
}

function filterBillLines(search: string) {
  const normalizedSearch = normalizeSearch(search)

  return [...billingCenterMonthlyBills].reverse().flatMap((bill) =>
    bill.lineItems
      .filter((line) =>
        includesSearch(
          normalizedSearch,
          bill.month,
          line.itemName,
          line.serviceInstanceName,
          line.productName,
          line.billingItemCode,
          line.costCenter,
        ),
      )
      .map((line) => ({ billMonth: bill.month, line })),
  )
}

function filterUsage(search: string): BillingCenterUsageRecord[] {
  const normalizedSearch = normalizeSearch(search)

  return billingCenterUsageRecords.filter((usage) =>
    includesSearch(
      normalizedSearch,
      usage.serviceInstanceName,
      usage.metricName,
      usage.unit,
      usage.date,
    ),
  )
}

function filterBudgets(search: string) {
  const normalizedSearch = normalizeSearch(search)

  return billingCenterBudgetRules.filter((budget) =>
    includesSearch(
      normalizedSearch,
      budget.name,
      budget.targetName,
      budget.scope,
      budget.recipients.join(' '),
    ),
  )
}

function includesSearch(normalizedSearch: string, ...values: string[]) {
  if (!normalizedSearch) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(normalizedSearch))
}

function normalizeSearch(search: string) {
  return search.trim().toLowerCase()
}

function getService(serviceId: string) {
  return billingCenterServiceInstances.find((service) => service.id === serviceId)
}

function getBudgetsForService(service: BillingCenterServiceInstance) {
  return billingCenterBudgetRules.filter(
    (budget) =>
      budget.targetId === service.id ||
      budget.targetName === service.name ||
      budget.targetId === service.commodityCode ||
      budget.targetId === service.costCenter,
  )
}

function getPrimaryBudgetForServiceId(serviceId: string) {
  const service = getService(serviceId)

  if (!service) {
    return null
  }

  return getBudgetsForService(service)[0] ?? billingCenterBudgetRules[0] ?? null
}

function feeRuleLabel(feeRule: BillingCenterFeeRule) {
  const labels: Record<BillingCenterFeeRule, string> = {
    subscription: '包月',
    prepaidPack: '资源包',
    postpaid: '后付费',
    oneTime: '一次性',
    storage: '后付费',
  }

  return labels[feeRule]
}

function serviceStatusLabel(status: BillingCenterServiceStatus) {
  const labels: Record<BillingCenterServiceStatus, string> = {
    active: '生效中',
    expiring: '即将耗尽',
    overage: '后付费超额',
    paused: '已暂停',
  }

  return labels[status]
}

function serviceStatusTone(
  status: BillingCenterServiceStatus,
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (status === 'active') {
    return 'success'
  }

  if (status === 'overage') {
    return 'danger'
  }

  if (status === 'paused') {
    return 'neutral'
  }

  return 'warning'
}

function billStatusLabel(status: 'issued' | 'estimated') {
  return status === 'estimated' ? '预估中' : '已出账'
}

function riskLabel(risk: BillingCenterServiceInstance['riskLevel']) {
  const labels: Record<BillingCenterServiceInstance['riskLevel'], string> = {
    none: '正常',
    watch: '关注',
    warning: '预警',
    critical: '高风险',
  }

  return labels[risk]
}

function riskTone(
  risk: BillingCenterServiceInstance['riskLevel'],
): 'success' | 'warning' | 'danger' | 'neutral' {
  if (risk === 'critical') {
    return 'danger'
  }

  if (risk === 'warning' || risk === 'watch') {
    return 'warning'
  }

  return 'success'
}

function budgetScopeLabel(scope: BillingCenterBudgetRule['scope']) {
  const labels: Record<BillingCenterBudgetRule['scope'], string> = {
    enterprise: '企业总预算',
    product: '商品',
    serviceInstance: '服务实例',
    costCenter: '项目归因',
  }

  return labels[scope]
}

function getQuotaUsagePercent(service: BillingCenterServiceInstance) {
  if (!service.quotaAmount) {
    return 0
  }

  return Math.round((service.usedAmount / service.quotaAmount) * 100)
}

function getBudgetUsagePercent(budget: BillingCenterBudgetRule) {
  return Math.round((budget.usedAmount / budget.limitAmount) * 100)
}

function formatQuotaLeft(service: BillingCenterServiceInstance) {
  if (!service.quotaAmount) {
    return service.feeRule === 'postpaid' || service.feeRule === 'storage'
      ? '按量累积'
      : '-'
  }

  const left = Math.max(0, service.quotaAmount - service.usedAmount)

  return formatQuantity(left, service.unit)
}

function formatPeriod(startsAt: string, endsAt: string | null) {
  return `${startsAt} - ${endsAt ?? '持续'}`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    maximumFractionDigits: value < 100 ? 2 : 0,
  }).format(value)
}

function formatQuantity(value: number, unit: string) {
  const formatted = new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 1,
  }).format(value)

  return `${formatted} ${unit}`
}

function formatMonthDelta(service: BillingCenterServiceInstance) {
  if (!service.previousMonthCost) {
    return '新增'
  }

  const delta = Math.round(
    ((service.currentMonthCost - service.previousMonthCost) /
      service.previousMonthCost) *
      100,
  )

  return `${delta >= 0 ? '+' : ''}${delta}%`
}

function formatDateTime(value: string) {
  return value.replace('T', ' ').replace('+08:00', '')
}

function getDeductionLabel(line: BillingCenterBillLineItem) {
  if (line.feeRule === 'prepaidPack') {
    return '资源包抵扣'
  }

  if (line.feeRule === 'subscription') {
    return '包月覆盖'
  }

  return '-'
}

export default BillingCenterPage
