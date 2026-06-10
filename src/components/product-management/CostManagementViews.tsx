import { useMemo, useState, type ReactNode } from 'react'
import { SearchIcon } from '../icons'
import {
  costAllocationRecords,
  costItemRecords,
  costModelRecords,
  costOverviewRecords,
  costRiskStatuses,
  costSubjects,
  costVersionRecords,
  type AllocationStatus,
  type CostAllocationRecord,
  type CostBreakdownRecord,
  type CostItemRecord,
  type CostModelRecord,
  type CostModelVersionRecord,
  type CostModelStatus,
  type CostOverviewRecord,
  type CostPricingSimulationRecord,
  type CostRecordStatus,
  type CostRiskStatus,
  type CostSection,
  type CostVersionRecord,
  type CostVersionStatus,
} from './costManagementMockData'
import { productRecords } from './productManagementMockData'

type MetricRecord = {
  label: string
  value: string
  note: string
}

type TableColumn<TRecord> = {
  key: string
  header: string
  render: (record: TRecord) => ReactNode
}

type CostStructureRow = {
  productId: string
  productName: string
  resourceCost: string
  laborCost: string
  deliveryCost: string
  opsAllocation: string
  thirdPartyCost: string
  sharedCost: string
}

const managementPageSize = 10

const costSources = uniqueValues(costItemRecords.map((record) => record.source))
const costRecordStatuses = uniqueValues(costItemRecords.map((record) => record.status))
const costItemUnits = uniqueValues(costItemRecords.map((record) => record.unit))
const costModelProductNames = productRecords.map((record) => record.name)
const costModelCommodityTypes = uniqueValues(
  costModelRecords.map((record) => record.commodityType),
)
const costModelChargeTypes = uniqueValues(costModelRecords.map((record) => record.chargeType))
const costModelStatuses = uniqueValues(costModelRecords.map((record) => record.status))
const allocationTargets = uniqueValues(
  costAllocationRecords.map((record) => record.allocationTarget),
)
const allocationDrivers = uniqueValues(
  costAllocationRecords.map((record) => record.allocationDriver),
)
const allocationStatuses = uniqueValues(
  costAllocationRecords.map((record) => record.status),
)
const costVersionStatuses = uniqueValues(costVersionRecords.map((record) => record.status))
const costVersionChangeTypes = uniqueValues(
  costVersionRecords.map((record) => record.changeType),
)

type CostManagementViewProps = {
  activeSection: CostSection
}

export function CostManagementView({ activeSection }: CostManagementViewProps) {
  return (
    <div className="management-workspace">
      {activeSection === 'overview' ? <CostOverviewView /> : null}
      {activeSection === 'items' ? <CostItemsView /> : null}
      {activeSection === 'models' ? <CostModelsView /> : null}
      {activeSection === 'allocations' ? <CostAllocationsView /> : null}
      {activeSection === 'versions' ? <CostVersionsView /> : null}
    </div>
  )
}

function CostOverviewView() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState('Q2')
  const [productFilter, setProductFilter] = useState('all')
  const [basisFilter, setBasisFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const metrics = useMemo(() => createOverviewMetrics(), [])
  const visibleOverviewRecords = useMemo(
    () =>
      costOverviewRecords.filter((record) => {
        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'productName',
          'owner',
          'riskStatus',
          'marginVariance',
        ])
      }),
    [productFilter, riskFilter, searchQuery],
  )
  const costStructureRows = useMemo(
    () => createCostStructureRows(visibleOverviewRecords),
    [visibleOverviewRecords],
  )
  const riskRows = useMemo(
    () =>
      costModelRecords
        .filter((record) => {
          if (productFilter !== 'all' && record.productName !== productFilter) {
            return false
          }

          if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
            return false
          }

          if (basisFilter !== 'all' && !record.costBasis.includes(basisFilter)) {
            return false
          }

          if (record.riskStatus === '正常') {
            return false
          }

          return matchesQuery(record, searchQuery, [
            'productName',
            'commodityName',
            'billingItemName',
            'billingItemCode',
            'riskStatus',
          ])
        })
        .slice(0, 8),
    [basisFilter, productFilter, riskFilter, searchQuery],
  )
  const selectedScope = `${yearFilter} ${quarterFilter}`

  return (
    <>
      <ManagementHeader
        title="成本总览"
        description="按产品线查看目标成本、已确认成本、成本模型覆盖和毛利风险。"
      />
      <ManagementToolbar ariaLabel="成本总览筛选工具">
        <SearchField
          label="搜索成本总览"
          value={searchQuery}
          placeholder="搜索产品、负责人、商品或计费项"
          onChange={setSearchQuery}
        />
        <FilterSelect
          label="筛选成本年度"
          value={yearFilter}
          allLabel="全部年度"
          options={['2026']}
          onChange={setYearFilter}
          includeAll={false}
        />
        <FilterSelect
          label="筛选成本季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={['Q2', 'Q3']}
          onChange={setQuarterFilter}
          includeAll={false}
        />
        <FilterSelect
          label="筛选成本产品"
          value={productFilter}
          allLabel="全部产品"
          options={costModelProductNames}
          onChange={setProductFilter}
        />
        <FilterSelect
          label="筛选成本口径"
          value={basisFilter}
          allLabel="全部成本口径"
          options={['标准用量', '项目交付']}
          onChange={setBasisFilter}
        />
        <FilterSelect
          label="筛选成本总览风险"
          value={riskFilter}
          allLabel="全部风险"
          options={costRiskStatuses}
          onChange={setRiskFilter}
        />
      </ManagementToolbar>
      <MetricGrid metrics={metrics} />
      <ManagementSection title="产品成本与毛利">
        <ManagementTable<CostOverviewRecord>
          records={visibleOverviewRecords}
          getRowKey={(record) => record.productId}
          minWidth={1200}
          columns={[
            textColumn('productName', '产品名称', (record) => record.productName, true),
            textColumn('owner', '负责人', (record) => record.owner),
            textColumn('targetRevenue', '目标收入', (record) => record.targetRevenue),
            textColumn('actualRevenue', '实际收入', (record) => record.actualRevenue),
            textColumn('targetCost', '目标成本', (record) => record.targetCost),
            textColumn('actualCost', '实际成本', (record) => record.actualCost),
            textColumn('costUsageRate', '成本使用率', (record) => record.costUsageRate),
            textColumn(
              'targetGrossMargin',
              '目标毛利率',
              (record) => record.targetGrossMargin,
            ),
            textColumn(
              'actualGrossMargin',
              '实际毛利率',
              (record) => record.actualGrossMargin,
            ),
            textColumn('marginVariance', '毛利偏差', (record) => record.marginVariance),
            {
              key: 'riskStatus',
              header: '风险状态',
              render: (record) => <StatusPill status={record.riskStatus} />,
            },
          ]}
        />
      </ManagementSection>
      <ManagementSection title="成本结构">
        <ManagementTable<CostStructureRow>
          records={costStructureRows}
          getRowKey={(record) => record.productId}
          minWidth={1080}
          columns={[
            textColumn('productName', '产品', (record) => record.productName, true),
            textColumn('resourceCost', '资源成本', (record) => record.resourceCost),
            textColumn('laborCost', '人力成本', (record) => record.laborCost),
            textColumn('deliveryCost', '交付成本', (record) => record.deliveryCost),
            textColumn('opsAllocation', '运维摊销', (record) => record.opsAllocation),
            textColumn('thirdPartyCost', '第三方成本', (record) => record.thirdPartyCost),
            textColumn('sharedCost', '共享成本', (record) => record.sharedCost),
          ]}
        />
      </ManagementSection>
      <ManagementSection title="高风险计费项">
        <ManagementTable<CostModelRecord>
          records={riskRows}
          getRowKey={(record) => record.costModelId}
          minWidth={1140}
          columns={[
            {
              key: 'riskStatus',
              header: '风险等级',
              render: (record) => <StatusPill status={record.riskStatus} />,
            },
            textColumn('objectType', '对象类型', () => '计费项'),
            textColumn(
              'billingItemName',
              '对象名称',
              (record) => record.billingItemName,
              true,
            ),
            textColumn('reason', '风险原因', (record) =>
              record.riskStatus === '风险'
                ? '预测毛利率低于目标线，需复核成本拆解。'
                : '成本使用率接近预算，需关注后续账单。',
            ),
            textColumn('impactAmount', '影响金额', (record) => record.totalTargetCost),
            textColumn('action', '建议动作', (record) =>
              record.riskStatus === '风险' ? '锁定折扣线并复核资源消耗' : '跟踪分摊完整度',
            ),
            textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          ]}
        />
      </ManagementSection>
      <p className="management-footnote">当前快照：{selectedScope}，数据来源为费用中心账单汇总、成本模型和共享成本分摊结果。</p>
    </>
  )
}

function CostItemsView() {
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredRecords = useMemo(
    () =>
      costItemRecords.filter((record) => {
        if (subjectFilter !== 'all' && record.subject !== subjectFilter) {
          return false
        }

        if (unitFilter !== 'all' && record.unit !== unitFilter) {
          return false
        }

        if (sourceFilter !== 'all' && record.source !== sourceFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'name',
          'code',
          'scope',
          'subject',
          'source',
          'owner',
        ])
      }),
    [searchQuery, sourceFilter, statusFilter, subjectFilter, unitFilter],
  )
  const pageCount = getPageCount(filteredRecords.length)
  const currentPage = Math.min(page, pageCount)
  const pagedRecords = paginate(filteredRecords, currentPage)

  function resetPage() {
    setPage(1)
  }

  return (
    <>
      <ManagementHeader
        title="成本项管理"
        description="维护成本模型引用的资源、人力、交付、运维、第三方和共享成本组件。"
      />
      <ManagementToolbar ariaLabel="成本项筛选工具">
        <SearchField
          label="搜索成本项"
          value={searchQuery}
          placeholder="搜索成本项名称、编号、科目或更新人"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本科目"
          value={subjectFilter}
          allLabel="全部成本科目"
          options={costSubjects}
          onChange={(value) => {
            setSubjectFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选计量单位"
          value={unitFilter}
          allLabel="全部计量单位"
          options={costItemUnits}
          onChange={(value) => {
            setUnitFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本来源"
          value={sourceFilter}
          allLabel="全部成本来源"
          options={costSources}
          onChange={(value) => {
            setSourceFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本项状态"
          value={statusFilter}
          allLabel="全部状态"
          options={costRecordStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <button type="button" className="management-create-button" disabled>
          + 新建成本项
        </button>
      </ManagementToolbar>
      <ManagementTable<CostItemRecord>
        records={pagedRecords}
        getRowKey={(record) => record.id}
        minWidth={1500}
        columns={[
          textColumn('name', '成本项名称', (record) => record.name, true),
          textColumn('code', '成本项编号', (record) => record.code),
          textColumn('scope', '适用范围', (record) => record.scope),
          textColumn('subject', '成本科目', (record) => record.subject),
          textColumn('unit', '单位', (record) => record.unit),
          textColumn('standardUnitCost', '标准单价', (record) => record.standardUnitCost),
          textColumn('currency', '币种', (record) => record.currency),
          textColumn('source', '成本来源', (record) => record.source),
          textColumn('allocationMethod', '分摊方式', (record) => record.allocationMethod),
          textColumn('effectiveAt', '生效时间', (record) => record.effectiveAt),
          textColumn('expiredAt', '失效时间', (record) => record.expiredAt),
          {
            key: 'status',
            header: '状态',
            render: (record) => <StatusPill status={record.status} />,
          },
          textColumn('owner', '更新人', (record) => record.owner),
          textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          actionColumn(),
        ]}
      />
      <Pagination
        total={filteredRecords.length}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </>
  )
}

function CostModelsView() {
  const [productFilter, setProductFilter] = useState('all')
  const [commodityTypeFilter, setCommodityTypeFilter] = useState('all')
  const [chargeTypeFilter, setChargeTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedModel, setSelectedModel] = useState<CostModelRecord | null>(null)

  const filteredRecords = useMemo(
    () =>
      costModelRecords.filter((record) => {
        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (
          commodityTypeFilter !== 'all' &&
          record.commodityType !== commodityTypeFilter
        ) {
          return false
        }

        if (chargeTypeFilter !== 'all' && record.chargeType !== chargeTypeFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'costModelName',
          'costModelCode',
          'productName',
          'commodityName',
          'billingItemName',
          'billingItemCode',
          'costVersion',
        ])
      }),
    [
      chargeTypeFilter,
      commodityTypeFilter,
      productFilter,
      riskFilter,
      searchQuery,
      statusFilter,
    ],
  )
  const pageCount = getPageCount(filteredRecords.length)
  const currentPage = Math.min(page, pageCount)
  const pagedRecords = paginate(filteredRecords, currentPage)

  function resetPage() {
    setPage(1)
  }

  if (selectedModel) {
    return (
      <CostModelDetailView
        record={selectedModel}
        onBack={() => setSelectedModel(null)}
      />
    )
  }

  return (
    <>
      <ManagementHeader
        title="成本模型"
        description="查看产品、商品和计费项如何由成本项组成，并评估目标成本与毛利线。"
      />
      <ManagementToolbar ariaLabel="成本模型筛选工具">
        <SearchField
          label="搜索成本模型"
          value={searchQuery}
          placeholder="搜索模型、商品、计费项或版本"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本模型产品"
          value={productFilter}
          allLabel="全部产品"
          options={costModelProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选商品类型"
          value={commodityTypeFilter}
          allLabel="全部商品类型"
          options={costModelCommodityTypes}
          onChange={(value) => {
            setCommodityTypeFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选计费类型"
          value={chargeTypeFilter}
          allLabel="全部计费类型"
          options={costModelChargeTypes}
          onChange={(value) => {
            setChargeTypeFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选模型状态"
          value={statusFilter}
          allLabel="全部模型状态"
          options={costModelStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本风险"
          value={riskFilter}
          allLabel="全部风险"
          options={costRiskStatuses}
          onChange={(value) => {
            setRiskFilter(value)
            resetPage()
          }}
        />
      </ManagementToolbar>
      <ManagementTable<CostModelRecord>
        records={pagedRecords}
        getRowKey={(record) => record.costModelId}
        minWidth={1580}
        columns={[
          textColumn('costModelName', '成本模型名称', (record) => record.costModelName, true),
          textColumn('costModelCode', '成本模型编号', (record) => record.costModelCode),
          textColumn('productName', '所属产品', (record) => record.productName),
          textColumn('commodityName', '商品名称', (record) => record.commodityName),
          textColumn('billingItemName', '计费项名称', (record) => record.billingItemName),
          textColumn('billingItemCode', '计费项编号', (record) => record.billingItemCode),
          textColumn('chargeType', '计费类型', (record) => record.chargeType),
          textColumn(
            'totalTargetCost',
            '总目标成本',
            (record) => record.totalTargetCost,
          ),
          textColumn(
            'targetGrossMargin',
            '目标毛利率',
            (record) => record.targetGrossMargin,
          ),
          textColumn(
            'forecastGrossMargin',
            '预测毛利率',
            (record) => record.forecastGrossMargin,
          ),
          {
            key: 'riskStatus',
            header: '风险状态',
            render: (record) => <StatusPill status={record.riskStatus} />,
          },
          textColumn('costVersion', '版本', (record) => record.costVersion),
          textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          {
            key: 'action',
            header: '操作',
            render: (record) => (
              <button
                type="button"
                className="management-action"
                onClick={() => setSelectedModel(record)}
              >
                查看
              </button>
            ),
          },
        ]}
      />
      <Pagination
        total={filteredRecords.length}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </>
  )
}

function CostModelDetailView({
  record,
  onBack,
}: {
  record: CostModelRecord
  onBack: () => void
}) {
  const owner = getProductOwner(record.productId)
  const overviewFields = [
    ['模型 owner', owner],
    ['适用周期', '2026 Q2'],
    ['成本口径', record.costBasis],
    ['关联商品', record.commodityName],
    ['关联计费项', `${record.billingItemName} / ${record.billingItemCode}`],
    ['计量假设', record.meteringAssumption],
    ['总目标成本', record.totalTargetCost],
    ['风险状态', record.riskStatus],
  ]

  return (
    <article className="management-detail" aria-label={`${record.costModelName} 详情`}>
      <header className="management-detail__header">
        <div className="management-detail__heading">
          <button
            type="button"
            className="management-detail__back-button"
            onClick={onBack}
          >
            返回成本模型列表
          </button>
          <h1>成本模型详情</h1>
          <p>{record.costModelName}</p>
          <dl className="management-detail__summary">
            <div>
              <dt>模型编号</dt>
              <dd>{record.costModelCode}</dd>
            </div>
            <div>
              <dt>版本</dt>
              <dd>{record.costVersion}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>
                <StatusPill status={record.status} />
              </dd>
            </div>
            <div>
              <dt>更新时间</dt>
              <dd>{record.updatedAt}</dd>
            </div>
          </dl>
        </div>
      </header>
      <nav className="management-detail__tabs" aria-label="成本模型详情导航">
        {['模型概览', '成本拆解', '毛利试算', '版本记录'].map((label) => (
          <span key={label} className="management-detail__tab">
            {label}
          </span>
        ))}
      </nav>
      <section className="management-detail__section" aria-label="模型概览">
        <h2>模型概览</h2>
        <dl className="management-detail__grid">
          {overviewFields.map(([label, value]) => (
            <div key={label} className="management-detail__field">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="management-detail__section" aria-label="成本拆解">
        <h2>成本拆解</h2>
        <ManagementTable<CostBreakdownRecord>
          records={record.breakdown}
          getRowKey={(breakdown) => breakdown.costItemCode}
          minWidth={1040}
          columns={[
            textColumn('costItemName', '成本项名称', (breakdown) => breakdown.costItemName, true),
            textColumn('subject', '科目', (breakdown) => breakdown.subject),
            textColumn('unit', '单位', (breakdown) => breakdown.unit),
            textColumn(
              'quantityAssumption',
              '数量假设',
              (breakdown) => breakdown.quantityAssumption,
            ),
            textColumn('unitCost', '单价', (breakdown) => breakdown.unitCost),
            textColumn('costAmount', '成本金额', (breakdown) => breakdown.costAmount),
            textColumn(
              'allocationMethod',
              '分摊方式',
              (breakdown) => breakdown.allocationMethod,
            ),
            textColumn('note', '备注', (breakdown) => breakdown.note),
          ]}
        />
      </section>
      <section className="management-detail__section" aria-label="毛利试算">
        <h2>毛利试算</h2>
        <ManagementTable<CostPricingSimulationRecord>
          records={record.pricingSimulation}
          getRowKey={(simulation) => simulation.priceLine}
          minWidth={720}
          columns={[
            textColumn('priceLine', '价格线', (simulation) => simulation.priceLine, true),
            textColumn('discount', '折扣', (simulation) => simulation.discount),
            textColumn('price', '价格', (simulation) => simulation.price),
            textColumn('grossMargin', '毛利率', (simulation) => simulation.grossMargin),
          ]}
        />
      </section>
      <section className="management-detail__section" aria-label="版本记录">
        <h2>版本记录</h2>
        <ManagementTable<CostModelVersionRecord>
          records={record.versions}
          getRowKey={(version) => version.costVersion}
          minWidth={860}
          columns={[
            textColumn('costVersion', '版本号', (version) => version.costVersion, true),
            {
              key: 'status',
              header: '版本状态',
              render: (version) => <StatusPill status={version.status} />,
            },
            textColumn('createdAt', '创建时间', (version) => version.createdAt),
            textColumn('effectiveAt', '生效时间', (version) => version.effectiveAt),
            textColumn('creator', '创建人', (version) => version.creator),
            textColumn('summary', '说明', (version) => version.summary),
          ]}
        />
      </section>
    </article>
  )
}

function CostAllocationsView() {
  const [targetFilter, setTargetFilter] = useState('all')
  const [driverFilter, setDriverFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredRecords = useMemo(
    () =>
      costAllocationRecords.filter((record) => {
        if (targetFilter !== 'all' && record.allocationTarget !== targetFilter) {
          return false
        }

        if (driverFilter !== 'all' && record.allocationDriver !== driverFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'ruleName',
          'ruleCode',
          'sharedCostItemName',
          'sharedCostItemCode',
          'productNames',
        ])
      }),
    [driverFilter, searchQuery, statusFilter, targetFilter],
  )
  const pageCount = getPageCount(filteredRecords.length)
  const currentPage = Math.min(page, pageCount)
  const pagedRecords = paginate(filteredRecords, currentPage)

  function resetPage() {
    setPage(1)
  }

  return (
    <>
      <ManagementHeader
        title="成本分摊规则"
        description="展示平台共享成本如何按收入、用量、席位、存储或项目人天进入产品和商品成本。"
      />
      <ManagementToolbar ariaLabel="成本分摊规则筛选工具">
        <SearchField
          label="搜索成本分摊规则"
          value={searchQuery}
          placeholder="搜索规则、共享成本项或覆盖产品"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选分摊对象"
          value={targetFilter}
          allLabel="全部分摊对象"
          options={allocationTargets}
          onChange={(value) => {
            setTargetFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选分摊驱动"
          value={driverFilter}
          allLabel="全部分摊驱动"
          options={allocationDrivers}
          onChange={(value) => {
            setDriverFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选分摊规则状态"
          value={statusFilter}
          allLabel="全部状态"
          options={allocationStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <button type="button" className="management-create-button" disabled>
          + 新建分摊规则
        </button>
      </ManagementToolbar>
      <ManagementTable<CostAllocationRecord>
        records={pagedRecords}
        getRowKey={(record) => record.allocationRuleId}
        minWidth={1320}
        columns={[
          textColumn('ruleName', '规则名称', (record) => record.ruleName, true),
          textColumn('ruleCode', '规则编号', (record) => record.ruleCode),
          textColumn(
            'sharedCostItemName',
            '共享成本项',
            (record) => record.sharedCostItemName,
          ),
          textColumn(
            'allocationTarget',
            '分摊对象',
            (record) => record.allocationTarget,
          ),
          textColumn(
            'allocationDriver',
            '分摊驱动',
            (record) => record.allocationDriver,
          ),
          textColumn('allocationCycle', '分摊周期', (record) => record.allocationCycle),
          textColumn('productNames', '覆盖产品', (record) => record.productNames),
          textColumn(
            'currentAllocatedAmount',
            '本期分摊金额',
            (record) => record.currentAllocatedAmount,
          ),
          textColumn(
            'unallocatedAmount',
            '未分摊金额',
            (record) => record.unallocatedAmount,
          ),
          textColumn(
            'allocationCompleteness',
            '分摊完整度',
            (record) => record.allocationCompleteness,
          ),
          {
            key: 'status',
            header: '状态',
            render: (record) => <StatusPill status={record.status} />,
          },
          textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          actionColumn(),
        ]}
      />
      <Pagination
        total={filteredRecords.length}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </>
  )
}

function CostVersionsView() {
  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [changeTypeFilter, setChangeTypeFilter] = useState('all')
  const [effectiveDateFilter, setEffectiveDateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredRecords = useMemo(
    () =>
      costVersionRecords.filter((record) => {
        const productName = getProductName(record.productId)

        if (productFilter !== 'all' && productName !== productFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        if (changeTypeFilter !== 'all' && record.changeType !== changeTypeFilter) {
          return false
        }

        if (
          effectiveDateFilter &&
          record.effectiveAt.slice(0, 10) !== effectiveDateFilter
        ) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'costVersion',
          'relatedObjectName',
          'relatedObjectId',
          'objectType',
          'changeType',
          'creator',
          'description',
        ])
      }),
    [
      changeTypeFilter,
      effectiveDateFilter,
      productFilter,
      searchQuery,
      statusFilter,
    ],
  )
  const pageCount = getPageCount(filteredRecords.length)
  const currentPage = Math.min(page, pageCount)
  const pagedRecords = paginate(filteredRecords, currentPage)

  function resetPage() {
    setPage(1)
  }

  return (
    <>
      <ManagementHeader
        title="成本版本记录"
        description="追踪成本项、模型、计费项和分摊规则的生效、归档与口径锁定记录。"
      />
      <ManagementToolbar ariaLabel="成本版本筛选工具">
        <SearchField
          label="搜索成本版本"
          value={searchQuery}
          placeholder="搜索版本、关联对象、变更类型或说明"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本版本产品"
          value={productFilter}
          allLabel="全部产品"
          options={costModelProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本版本状态"
          value={statusFilter}
          allLabel="全部版本状态"
          options={costVersionStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选成本变更类型"
          value={changeTypeFilter}
          allLabel="全部变更类型"
          options={costVersionChangeTypes}
          onChange={(value) => {
            setChangeTypeFilter(value)
            resetPage()
          }}
        />
        <input
          type="date"
          className="management-select"
          aria-label="筛选成本版本生效日期"
          value={effectiveDateFilter}
          onChange={(event) => {
            setEffectiveDateFilter(event.currentTarget.value)
            resetPage()
          }}
        />
      </ManagementToolbar>
      <ManagementTable<CostVersionRecord>
        records={pagedRecords}
        getRowKey={(record) => `${record.costVersion}-${record.relatedObjectId}`}
        minWidth={1440}
        columns={[
          textColumn('costVersion', '版本号', (record) => record.costVersion, true),
          textColumn('relatedObjectName', '关联对象', (record) => record.relatedObjectName),
          textColumn('objectType', '对象类型', (record) => record.objectType),
          textColumn('changeType', '变更类型', (record) => record.changeType),
          {
            key: 'status',
            header: '版本状态',
            render: (record) => <StatusPill status={record.status} />,
          },
          textColumn('impactRevenue', '影响收入', (record) => record.impactRevenue),
          textColumn('impactCost', '影响成本', (record) => record.impactCost),
          textColumn(
            'impactGrossMargin',
            '影响毛利率',
            (record) => record.impactGrossMargin,
          ),
          textColumn('effectiveAt', '生效时间', (record) => record.effectiveAt),
          textColumn('creator', '创建人', (record) => record.creator),
          textColumn('createdAt', '创建时间', (record) => record.createdAt),
          textColumn('description', '说明', (record) => record.description),
          actionColumn(),
        ]}
      />
      <Pagination
        total={filteredRecords.length}
        currentPage={currentPage}
        pageCount={pageCount}
        onPageChange={setPage}
      />
    </>
  )
}

function ManagementHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="management-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </header>
  )
}

function ManagementSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="management-section" aria-label={title}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function MetricGrid({ metrics }: { metrics: MetricRecord[] }) {
  return (
    <div className="management-metrics">
      {metrics.map((metric) => (
        <article key={metric.label} className="management-card">
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.note}</small>
        </article>
      ))}
    </div>
  )
}

function ManagementToolbar({
  ariaLabel,
  children,
}: {
  ariaLabel: string
  children: ReactNode
}) {
  return (
    <header className="management-toolbar" aria-label={ariaLabel}>
      {children}
    </header>
  )
}

function SearchField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <label className="management-search">
      <SearchIcon className="management-search__icon" />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  )
}

function FilterSelect({
  label,
  value,
  allLabel,
  options,
  onChange,
  includeAll = true,
}: {
  label: string
  value: string
  allLabel: string
  options: string[]
  onChange: (value: string) => void
  includeAll?: boolean
}) {
  return (
    <select
      className="management-select"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    >
      {includeAll ? <option value="all">{allLabel}</option> : null}
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

function ManagementTable<TRecord>({
  records,
  columns,
  getRowKey,
  minWidth,
}: {
  records: TRecord[]
  columns: TableColumn<TRecord>[]
  getRowKey: (record: TRecord) => string
  minWidth: number
}) {
  return (
    <div className="management-table-wrap">
      <table className="management-table" style={{ minWidth }}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.length > 0 ? (
            records.map((record) => (
              <tr key={getRowKey(record)}>
                {columns.map((column) => (
                  <td key={column.key}>{column.render(record)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length}>暂无数据</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function StatusPill({ status }: { status: ManagementStatus }) {
  return (
    <span className={`management-status management-status--${getStatusTone(status)}`}>
      {status}
    </span>
  )
}

function Pagination({
  total,
  currentPage,
  pageCount,
  onPageChange,
}: {
  total: number
  currentPage: number
  pageCount: number
  onPageChange: (page: number) => void
}) {
  return (
    <footer className="management-pagination">
      <span>共 {total} 条</span>
      <div className="management-pagination__controls">
        <button
          type="button"
          className="management-page-button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          上一页
        </button>
        <span>{currentPage} / {pageCount}</span>
        <button
          type="button"
          className="management-page-button"
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
        >
          下一页
        </button>
      </div>
    </footer>
  )
}

function textColumn<TRecord>(
  key: string,
  header: string,
  getValue: (record: TRecord) => ReactNode,
  strong = false,
): TableColumn<TRecord> {
  return {
    key,
    header,
    render: (record) => {
      const value = getValue(record)

      return strong ? <strong>{value}</strong> : value
    },
  }
}

function actionColumn<TRecord>(): TableColumn<TRecord> {
  return {
    key: 'action',
    header: '操作',
    render: () => (
      <button type="button" className="management-action" disabled>
        查看
      </button>
    ),
  }
}

function createOverviewMetrics(): MetricRecord[] {
  const targetCost = sumCurrency(costOverviewRecords, (record) => record.targetCost)
  const actualCost = sumCurrency(costOverviewRecords, (record) => record.actualCost)
  const costUsageRate = targetCost > 0 ? Math.round((actualCost / targetCost) * 100) : 0
  const unallocatedAmount = sumCurrency(
    costAllocationRecords,
    (record) => record.unallocatedAmount,
  )
  const allocatedAmount = sumCurrency(
    costAllocationRecords,
    (record) => record.currentAllocatedAmount,
  )
  const unallocatedRate =
    allocatedAmount + unallocatedAmount > 0
      ? Math.round((unallocatedAmount / (allocatedAmount + unallocatedAmount)) * 100)
      : 0

  return [
    {
      label: '本季度目标成本',
      value: formatCurrency(targetCost),
      note: '来自 2026 Q2 成本模型',
    },
    {
      label: '已确认成本',
      value: formatCurrency(actualCost),
      note: '账单、交付和共享分摊汇总',
    },
    {
      label: '成本使用率',
      value: `${costUsageRate}%`,
      note: '已确认成本 / 目标成本',
    },
    {
      label: '加权目标毛利率',
      value: `${weightedAveragePercent(
        costOverviewRecords,
        (record) => record.targetGrossMargin,
        (record) => record.targetRevenue,
      )}%`,
      note: '按产品目标收入加权近似',
    },
    {
      label: '实际毛利率',
      value: `${weightedAveragePercent(
        costOverviewRecords,
        (record) => record.actualGrossMargin,
        (record) => record.actualRevenue,
      )}%`,
      note: '费用中心收入扣除确认成本',
    },
    {
      label: '高风险计费项',
      value: String(
        costModelRecords.filter((record) => record.riskStatus === '风险').length,
      ),
      note: '预测毛利率低于目标线',
    },
    {
      label: '未分摊成本占比',
      value: `${unallocatedRate}%`,
      note: '共享成本池待归因金额',
    },
    {
      label: '成本模型覆盖率',
      value: '100%',
      note: '17 个商品主计费项均有模型',
    },
  ]
}

function createCostStructureRows(records: CostOverviewRecord[]): CostStructureRow[] {
  return records.map((overview, index) => {
    const productModels = costModelRecords.filter(
      (record) => record.productId === overview.productId,
    )
    const resourceCost = sumCurrency(productModels, (record) => record.resourceCost)
    const laborCost = sumCurrency(productModels, (record) => record.laborCost)
    const deliveryCost = sumCurrency(productModels, (record) => record.deliveryCost)
    const opsAllocation = sumCurrency(productModels, (record) => record.opsAllocation)
    const sharedCost = sumCurrency(productModels, (record) => record.sharedCost)
    const thirdPartyCost = Math.round((resourceCost + sharedCost) * (0.05 + index * 0.01))

    return {
      productId: overview.productId,
      productName: overview.productName,
      resourceCost: formatCurrency(resourceCost),
      laborCost: formatCurrency(laborCost),
      deliveryCost: formatCurrency(deliveryCost),
      opsAllocation: formatCurrency(opsAllocation),
      thirdPartyCost: formatCurrency(thirdPartyCost),
      sharedCost: formatCurrency(sharedCost),
    }
  })
}

function getPageCount(total: number) {
  return Math.max(1, Math.ceil(total / managementPageSize))
}

function paginate<TRecord>(records: TRecord[], page: number) {
  return records.slice((page - 1) * managementPageSize, page * managementPageSize)
}

function uniqueValues<TValue extends string>(values: TValue[]) {
  return Array.from(new Set(values))
}

function matchesQuery<TRecord extends object>(
  record: TRecord,
  searchQuery: string,
  fields: (keyof TRecord)[],
) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return fields
    .map((field) => String(record[field] ?? ''))
    .join(' ')
    .toLowerCase()
    .includes(normalizedQuery)
}

function parseCurrency(value: string) {
  const parsedValue = Number(value.replace(/[^\d.-]/g, ''))

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function parsePercent(value: string) {
  const parsedValue = Number(value.replace(/[^\d.-]/g, ''))

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function sumCurrency<TRecord>(
  records: TRecord[],
  getValue: (record: TRecord) => string,
) {
  return records.reduce((sum, record) => sum + parseCurrency(getValue(record)), 0)
}

function weightedAveragePercent<TRecord>(
  records: TRecord[],
  getPercent: (record: TRecord) => string,
  getWeight: (record: TRecord) => string,
) {
  const totalWeight = sumCurrency(records, getWeight)

  if (totalWeight <= 0) {
    return 0
  }

  return Math.round(
    records.reduce(
      (sum, record) => sum + parsePercent(getPercent(record)) * parseCurrency(getWeight(record)),
      0,
    ) / totalWeight,
  )
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function getProductOwner(productId: string) {
  return productRecords.find((record) => record.id === productId)?.owner ?? '-'
}

function getProductName(productId: string) {
  return productRecords.find((record) => record.id === productId)?.name ?? '-'
}

type ManagementStatus =
  | CostRecordStatus
  | CostRiskStatus
  | CostModelStatus
  | AllocationStatus
  | CostVersionStatus

function getStatusTone(status: ManagementStatus) {
  switch (status) {
    case '正常':
    case '生效中':
    case '已生效':
      return 'success'
    case '关注':
    case '待生效':
    case '草稿':
    case '待失效':
      return 'warning'
    case '风险':
    case '已失效':
      return 'danger'
    case '已归档':
      return 'neutral'
  }
}
