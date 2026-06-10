import { useMemo, useState, type ReactNode } from 'react'
import { SearchIcon } from '../icons'
import {
  getTargetDetail,
  quarterlyTargetRecords,
  targetCommodityContributionRecords,
  targetOverviewRecords,
  targetRiskStatuses,
  targetVersionRecords,
  type QuarterlyTargetRecord,
  type TargetCommodityContributionRecord,
  type TargetCostStructureRecord,
  type TargetMonthlyTrendRecord,
  type TargetOverviewRecord,
  type TargetRiskNoteRecord,
  type TargetRiskStatus,
  type TargetSection,
  type TargetStatus,
  type TargetVersionRecord,
  type TargetVersionStatus,
  type VarianceType,
} from './targetManagementMockData'
import {
  commodityRecords,
  getCommodityDetail,
  productRecords,
  productStages,
  type CommoditySaleType,
  type ProductStage,
} from './productManagementMockData'

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

type TargetQuarter = QuarterlyTargetRecord['quarter']

type OverviewMonthlyTrendRow = TargetMonthlyTrendRecord & {
  productName: string
  productOwner: string
}

type OverviewRiskNoteRow = TargetRiskNoteRecord & {
  productName: string
}

type MarginVarianceRow = {
  id: string
  productId: string
  productName: string
  year: '2026'
  quarter: TargetQuarter
  revenueTarget: string
  achievedRevenue: string
  revenueVariance: string
  costBudget: string
  confirmedCost: string
  costVariance: string
  targetGrossProfit: string
  actualGrossProfit: string
  grossProfitVariance: string
  targetGrossMargin: string
  actualGrossMargin: string
  marginVariance: string
  varianceType: VarianceType
  reason: string
  suggestedAction: string
  updatedAt: string
  riskStatus: TargetRiskStatus
}

type TargetDisplayChangeType = TargetVersionRecord['changeType']

type TargetVersionDisplayRow = TargetVersionRecord & {
  targetCode: string
  year: '2026'
  quarter: TargetQuarter
  displayChangeType: TargetDisplayChangeType
  beforeTarget: string
  afterTarget: string
  beforeGrossMargin: string
  afterGrossMargin: string
}

type ManagementStatus =
  | TargetRiskStatus
  | TargetStatus
  | TargetVersionStatus
  | VarianceType

type TargetManagementViewProps = {
  activeSection: TargetSection
}

const managementPageSize = 10
const targetYears = ['2026']
const targetQuarters: TargetQuarter[] = ['Q2', 'Q3']
const targetProductNames = productRecords.map((record) => record.name)
const targetOwners = uniqueValues(productRecords.map((record) => record.owner))
const targetStatuses = uniqueValues(quarterlyTargetRecords.map((record) => record.status))
const targetCommodityTypes = uniqueValues(
  commodityRecords.map((record) => record.commodityType),
)
const targetVersionStatuses = uniqueValues(
  targetVersionRecords.map((record) => record.status),
)
const targetVersionDisplayChangeTypes: TargetDisplayChangeType[] = [
  '创建',
  '目标调整',
  '成本预算调整',
  '预测调整',
  '锁定',
  '复盘',
]
const targetVarianceTypes: VarianceType[] = ['正向', '轻微负向', '重大负向']

export function TargetManagementView({ activeSection }: TargetManagementViewProps) {
  return (
    <div className="management-workspace">
      {activeSection === 'overview' ? <TargetOverviewView /> : null}
      {activeSection === 'quarterly' ? <QuarterlyTargetsView /> : null}
      {activeSection === 'contributions' ? <TargetContributionsView /> : null}
      {activeSection === 'margins' ? <TargetMarginsView /> : null}
      {activeSection === 'versions' ? <TargetVersionsView /> : null}
    </div>
  )
}

function TargetOverviewView() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState<TargetQuarter>('Q2')
  const [productFilter, setProductFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const visibleOverviewRecords = useMemo(
    () =>
      targetOverviewRecords.filter((record) => {
        if (record.quarter !== quarterFilter) {
          return false
        }

        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (ownerFilter !== 'all' && record.productOwner !== ownerFilter) {
          return false
        }

        if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'productName',
          'productOwner',
          'riskStatus',
          'forecastAttainmentRate',
        ])
      }),
    [ownerFilter, productFilter, quarterFilter, riskFilter, searchQuery],
  )
  const metrics = useMemo(
    () => createTargetOverviewMetrics(visibleOverviewRecords, yearFilter, quarterFilter),
    [quarterFilter, visibleOverviewRecords, yearFilter],
  )
  const monthlyTrendRows = useMemo(
    () => createOverviewMonthlyTrendRows(visibleOverviewRecords),
    [visibleOverviewRecords],
  )
  const riskNoteRows = useMemo(
    () => createOverviewRiskNoteRows(visibleOverviewRecords),
    [visibleOverviewRecords],
  )

  return (
    <>
      <ManagementHeader
        title="目标总览"
        description="按年度、季度和产品负责人查看业绩目标、成本预算、毛利表现与风险说明。"
      />
      <ManagementToolbar ariaLabel="目标总览筛选工具">
        <SearchField
          label="搜索目标总览"
          value={searchQuery}
          placeholder="搜索产品、负责人、风险或预测达成率"
          onChange={setSearchQuery}
        />
        <FilterSelect
          label="筛选目标总览年度"
          value={yearFilter}
          allLabel="全部年度"
          options={targetYears}
          onChange={setYearFilter}
          includeAll={false}
        />
        <FilterSelect
          label="筛选目标总览季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={targetQuarters}
          onChange={(value) => setQuarterFilter(value as TargetQuarter)}
          includeAll={false}
        />
        <FilterSelect
          label="筛选目标总览产品"
          value={productFilter}
          allLabel="全部产品"
          options={targetProductNames}
          onChange={setProductFilter}
        />
        <FilterSelect
          label="筛选目标负责人"
          value={ownerFilter}
          allLabel="全部负责人"
          options={targetOwners}
          onChange={setOwnerFilter}
        />
        <FilterSelect
          label="筛选目标风险状态"
          value={riskFilter}
          allLabel="全部风险"
          options={targetRiskStatuses}
          onChange={setRiskFilter}
        />
      </ManagementToolbar>
      <MetricGrid metrics={metrics} />
      <ManagementSection title="产品目标达成表">
        <ManagementTable<TargetOverviewRecord>
          records={visibleOverviewRecords}
          getRowKey={(record) => record.targetId}
          minWidth={1380}
          columns={[
            textColumn('productName', '产品名称', (record) => record.productName, true),
            textColumn('productOwner', '负责人', (record) => record.productOwner),
            textColumn('quarter', '季度', (record) => record.quarter),
            textColumn('revenueTarget', '业绩目标', (record) => record.revenueTarget),
            textColumn('achievedRevenue', '已达成业绩', (record) => record.achievedRevenue),
            textColumn('attainmentRate', '目标达成率', (record) => record.attainmentRate),
            textColumn('costBudget', '成本预算', (record) => record.costBudget),
            textColumn('confirmedCost', '已确认成本', (record) => record.confirmedCost),
            textColumn('costUsageRate', '成本使用率', (record) => record.costUsageRate),
            textColumn('actualGrossProfit', '实际毛利额', (record) => record.actualGrossProfit),
            textColumn('targetGrossMargin', '目标毛利率', (record) => record.targetGrossMargin),
            textColumn('actualGrossMargin', '实际毛利率', (record) => record.actualGrossMargin),
            textColumn(
              'forecastAttainmentRate',
              '预测季度达成率',
              (record) => record.forecastAttainmentRate,
            ),
            {
              key: 'riskStatus',
              header: '风险状态',
              render: (record) => <StatusPill status={record.riskStatus} />,
            },
            textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          ]}
        />
      </ManagementSection>
      <ManagementSection title="月度趋势表">
        <ManagementTable<OverviewMonthlyTrendRow>
          records={monthlyTrendRows}
          getRowKey={(record) => `${record.targetId}-${record.month}`}
          minWidth={1080}
          columns={[
            textColumn('productName', '产品名称', (record) => record.productName, true),
            textColumn('month', '月份', (record) => record.month),
            textColumn('monthlyTarget', '月度目标', (record) => record.monthlyTarget),
            textColumn('actualRevenue', '实际收入', (record) => record.actualRevenue),
            textColumn('monthlyCost', '月度成本', (record) => record.monthlyCost),
            textColumn(
              'monthlyGrossMargin',
              '月度毛利率',
              (record) => record.monthlyGrossMargin,
            ),
            textColumn(
              'cumulativeAttainmentRate',
              '累计达成率',
              (record) => record.cumulativeAttainmentRate,
            ),
            textColumn('productOwner', '负责人', (record) => record.productOwner),
          ]}
        />
      </ManagementSection>
      <ManagementSection title="风险说明表">
        <ManagementTable<OverviewRiskNoteRow>
          records={riskNoteRows}
          getRowKey={(record) => `${record.targetId}-${record.reason}`}
          minWidth={1120}
          columns={[
            textColumn('productName', '产品名称', (record) => record.productName, true),
            {
              key: 'riskLevel',
              header: '风险状态',
              render: (record) => <StatusPill status={record.riskLevel} />,
            },
            textColumn('reason', '风险说明', (record) => record.reason),
            textColumn('impactTarget', '影响目标', (record) => record.impactTarget),
            textColumn('suggestedAction', '建议动作', (record) => record.suggestedAction),
            textColumn('owner', '负责人', (record) => record.owner),
            textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          ]}
        />
      </ManagementSection>
      <p className="management-footnote">
        当前快照：{yearFilter} {quarterFilter}，目标数据来自产品经营目标、费用中心确认成本与目标版本记录。
      </p>
    </>
  )
}

function QuarterlyTargetsView() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState<TargetQuarter>('Q2')
  const [productFilter, setProductFilter] = useState('all')
  const [stageFilter, setStageFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedTarget, setSelectedTarget] = useState<QuarterlyTargetRecord | null>(
    null,
  )

  const filteredRecords = useMemo(
    () =>
      quarterlyTargetRecords.filter((record) => {
        if (record.year !== yearFilter) {
          return false
        }

        if (record.quarter !== quarterFilter) {
          return false
        }

        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (stageFilter !== 'all' && getProductStage(record.productId) !== stageFilter) {
          return false
        }

        if (ownerFilter !== 'all' && record.productOwner !== ownerFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'targetName',
          'targetCode',
          'productName',
          'productOwner',
          'riskStatus',
          'status',
        ])
      }),
    [
      ownerFilter,
      productFilter,
      quarterFilter,
      searchQuery,
      stageFilter,
      statusFilter,
      yearFilter,
    ],
  )
  const pageCount = getPageCount(filteredRecords.length)
  const currentPage = Math.min(page, pageCount)
  const pagedRecords = paginate(filteredRecords, currentPage)

  function resetPage() {
    setPage(1)
  }

  if (selectedTarget) {
    return (
      <TargetDetailView
        record={selectedTarget}
        onBack={() => setSelectedTarget(null)}
      />
    )
  }

  return (
    <>
      <ManagementHeader
        title="季度目标"
        description="按产品维护季度业绩、成本、毛利和预测达成目标，当前仅提供只读查看。"
      />
      <ManagementToolbar ariaLabel="季度目标筛选工具">
        <SearchField
          label="搜索季度目标"
          value={searchQuery}
          placeholder="搜索目标、编号、产品或负责人"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选目标年度"
          value={yearFilter}
          allLabel="全部年度"
          options={targetYears}
          onChange={(value) => {
            setYearFilter(value)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选目标季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={targetQuarters}
          onChange={(value) => {
            setQuarterFilter(value as TargetQuarter)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选目标产品"
          value={productFilter}
          allLabel="全部产品"
          options={targetProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选目标产品阶段"
          value={stageFilter}
          allLabel="全部产品阶段"
          options={productStages}
          onChange={(value) => {
            setStageFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选目标负责人"
          value={ownerFilter}
          allLabel="全部负责人"
          options={targetOwners}
          onChange={(value) => {
            setOwnerFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选目标状态"
          value={statusFilter}
          allLabel="全部目标状态"
          options={targetStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <button type="button" className="management-create-button" disabled>
          + 新建目标
        </button>
      </ManagementToolbar>
      <ManagementTable<QuarterlyTargetRecord>
        records={pagedRecords}
        getRowKey={(record) => record.targetId}
        minWidth={1960}
        columns={[
          textColumn('targetName', '目标名称', (record) => record.targetName, true),
          textColumn('targetCode', '目标编号', (record) => record.targetCode),
          textColumn('productName', '产品名称', (record) => record.productName),
          textColumn('productOwner', '产品负责人', (record) => record.productOwner),
          textColumn('year', '年度', (record) => record.year),
          textColumn('quarter', '季度', (record) => record.quarter),
          textColumn('revenueTarget', '业绩目标', (record) => record.revenueTarget),
          textColumn('achievedRevenue', '已达成业绩', (record) => record.achievedRevenue),
          textColumn('attainmentRate', '达成率', (record) => record.attainmentRate),
          textColumn('costBudget', '成本预算', (record) => record.costBudget),
          textColumn('confirmedCost', '已确认成本', (record) => record.confirmedCost),
          textColumn('costUsageRate', '成本使用率', (record) => record.costUsageRate),
          textColumn('targetGrossMargin', '目标毛利率', (record) => record.targetGrossMargin),
          textColumn('actualGrossMargin', '实际毛利率', (record) => record.actualGrossMargin),
          textColumn(
            'forecastAttainmentRate',
            '预测达成率',
            (record) => record.forecastAttainmentRate,
          ),
          {
            key: 'riskStatus',
            header: '风险状态',
            render: (record) => <StatusPill status={record.riskStatus} />,
          },
          {
            key: 'status',
            header: '目标状态',
            render: (record) => <StatusPill status={record.status} />,
          },
          textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
          {
            key: 'action',
            header: '操作',
            render: (record) => (
              <button
                type="button"
                className="management-action"
                onClick={() => setSelectedTarget(record)}
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

function TargetDetailView({
  record,
  onBack,
}: {
  record: QuarterlyTargetRecord
  onBack: () => void
}) {
  const detail = getTargetDetail(record.targetId)
  const overviewFields = [
    ['目标名称', record.targetName],
    ['目标编号', record.targetCode],
    ['产品名称', record.productName],
    ['产品负责人', record.productOwner],
    ['年度季度', `${record.year} ${record.quarter}`],
    ['业绩目标', record.revenueTarget],
    ['已达成业绩', record.achievedRevenue],
    ['目标达成率', record.attainmentRate],
    ['成本预算', record.costBudget],
    ['已确认成本', record.confirmedCost],
    ['成本使用率', record.costUsageRate],
    ['目标毛利额', record.targetGrossProfit],
    ['实际毛利额', record.actualGrossProfit],
    ['目标毛利率', record.targetGrossMargin],
    ['实际毛利率', record.actualGrossMargin],
    ['预测达成率', record.forecastAttainmentRate],
  ]

  return (
    <article className="management-detail" aria-label={`${record.targetName} 详情`}>
      <header className="management-detail__header">
        <div className="management-detail__heading">
          <button
            type="button"
            className="management-detail__back-button"
            onClick={onBack}
          >
            返回季度目标
          </button>
          <h1>目标详情</h1>
          <p>{record.targetName}</p>
          <dl className="management-detail__summary">
            <div>
              <dt>目标编号</dt>
              <dd>{record.targetCode}</dd>
            </div>
            <div>
              <dt>风险状态</dt>
              <dd>
                <StatusPill status={record.riskStatus} />
              </dd>
            </div>
            <div>
              <dt>目标状态</dt>
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
      <nav className="management-detail__tabs" aria-label="目标详情导航">
        {['目标概览', '月度拆分', '商品贡献', '成本结构', '版本记录', '风险说明'].map(
          (label) => (
            <span key={label} className="management-detail__tab">
              {label}
            </span>
          ),
        )}
      </nav>
      <section className="management-detail__section" aria-label="目标概览">
        <h2>目标概览</h2>
        <dl className="management-detail__grid">
          {overviewFields.map(([label, value]) => (
            <div key={label} className="management-detail__field">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="management-detail__section" aria-label="月度拆分">
        <h2>月度拆分</h2>
        <ManagementTable<TargetMonthlyTrendRecord>
          records={detail?.monthlyTrends ?? []}
          getRowKey={(trend) => `${trend.targetId}-${trend.month}`}
          minWidth={760}
          columns={[
            textColumn('month', '月份', (trend) => trend.month, true),
            textColumn('monthlyTarget', '月度目标', (trend) => trend.monthlyTarget),
            textColumn('actualRevenue', '实际收入', (trend) => trend.actualRevenue),
            textColumn('monthlyCost', '月度成本', (trend) => trend.monthlyCost),
            textColumn(
              'monthlyGrossMargin',
              '月度毛利率',
              (trend) => trend.monthlyGrossMargin,
            ),
            textColumn(
              'cumulativeAttainmentRate',
              '累计达成率',
              (trend) => trend.cumulativeAttainmentRate,
            ),
          ]}
        />
      </section>
      <section className="management-detail__section" aria-label="商品贡献">
        <h2>商品贡献</h2>
        <ManagementTable<TargetCommodityContributionRecord>
          records={detail?.commodityContributions ?? []}
          getRowKey={(contribution) => contribution.id}
          minWidth={1480}
          columns={[
            textColumn(
              'commodityName',
              '商品名称',
              (contribution) => contribution.commodityName,
              true,
            ),
            textColumn('commodityType', '商品类型', (contribution) =>
              getCommodityType(contribution.commodityId),
            ),
            textColumn(
              'billingItemName',
              '计费项名称',
              (contribution) => contribution.billingItemName,
            ),
            textColumn(
              'billingItemCode',
              '计费项编号',
              (contribution) => contribution.billingItemCode,
            ),
            textColumn(
              'revenueTarget',
              '业绩目标',
              (contribution) => contribution.revenueTarget,
            ),
            textColumn(
              'achievedRevenue',
              '已达成业绩',
              (contribution) => contribution.achievedRevenue,
            ),
            textColumn(
              'contributionRate',
              '贡献达成率',
              (contribution) => contribution.contributionRate,
            ),
            textColumn('contributionShare', '贡献占比', (contribution) =>
              getContributionShare(contribution),
            ),
            textColumn('costBudget', '成本预算', (contribution) => contribution.costBudget),
            textColumn(
              'confirmedCost',
              '已确认成本',
              (contribution) => contribution.confirmedCost,
            ),
            textColumn('grossProfit', '毛利额', (contribution) =>
              getContributionGrossProfit(contribution),
            ),
            textColumn('grossMargin', '毛利率', (contribution) => contribution.grossMargin),
            textColumn('billingItemCount', '关联计费项数量', (contribution) =>
              String(getCommodityBillingItemCount(contribution.commodityId)),
            ),
            {
              key: 'riskStatus',
              header: '毛利风险',
              render: (contribution) => <StatusPill status={contribution.riskStatus} />,
            },
          ]}
        />
      </section>
      <section className="management-detail__section" aria-label="成本结构">
        <h2>成本结构</h2>
        <ManagementTable<TargetCostStructureRecord>
          records={detail?.costStructure ?? []}
          getRowKey={(cost) => cost.id}
          minWidth={980}
          columns={[
            textColumn('costSubject', '成本科目', (cost) => cost.costSubject, true),
            textColumn('targetCost', '目标成本', (cost) => cost.targetCost),
            textColumn('confirmedCost', '已确认成本', (cost) => cost.confirmedCost),
            textColumn('usageRate', '使用率', (cost) => cost.usageRate),
            textColumn('allocationBasis', '归集口径', (cost) => cost.allocationBasis),
            {
              key: 'riskStatus',
              header: '风险状态',
              render: (cost) => <StatusPill status={cost.riskStatus} />,
            },
            textColumn('owner', '负责人', (cost) => cost.owner),
            textColumn('updatedAt', '更新时间', (cost) => cost.updatedAt),
          ]}
        />
      </section>
      <section className="management-detail__section" aria-label="版本记录">
        <h2>版本记录</h2>
        <ManagementTable<TargetVersionRecord>
          records={detail?.versions ?? []}
          getRowKey={(version) => version.targetVersion}
          minWidth={1260}
          columns={[
            textColumn(
              'targetVersion',
              '版本号',
              (version) => version.targetVersion,
              true,
            ),
            textColumn('commodityName', '商品名称', (version) => version.commodityName),
            textColumn('billingItemName', '计费项名称', (version) => version.billingItemName),
            textColumn('changeType', '变更类型', (version) => version.changeType),
            {
              key: 'status',
              header: '版本状态',
              render: (version) => <StatusPill status={version.status} />,
            },
            textColumn('impactRevenue', '影响收入', (version) => version.impactRevenue),
            textColumn('impactCost', '影响成本', (version) => version.impactCost),
            textColumn(
              'impactGrossMargin',
              '影响毛利率',
              (version) => version.impactGrossMargin,
            ),
            textColumn('effectiveAt', '生效时间', (version) => version.effectiveAt),
            textColumn('creator', '创建人', (version) => version.creator),
          ]}
        />
      </section>
      {(detail?.riskNotes.length ?? 0) > 0 ? (
        <section className="management-detail__section" aria-label="风险说明">
          <h2>风险说明</h2>
          <ManagementTable<TargetRiskNoteRecord>
            records={detail?.riskNotes ?? []}
            getRowKey={(risk) => `${risk.targetId}-${risk.reason}`}
            minWidth={1040}
            columns={[
              {
                key: 'riskLevel',
                header: '风险等级',
                render: (risk) => <StatusPill status={risk.riskLevel} />,
              },
              textColumn('reason', '风险说明', (risk) => risk.reason, true),
              textColumn('impactTarget', '影响目标', (risk) => risk.impactTarget),
              textColumn('suggestedAction', '建议动作', (risk) => risk.suggestedAction),
              textColumn('owner', '负责人', (risk) => risk.owner),
              textColumn('updatedAt', '更新时间', (risk) => risk.updatedAt),
            ]}
          />
        </section>
      ) : null}
    </article>
  )
}

function TargetContributionsView() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState<TargetQuarter>('Q2')
  const [productFilter, setProductFilter] = useState('all')
  const [commodityTypeFilter, setCommodityTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredRecords = useMemo(
    () =>
      targetCommodityContributionRecords.filter((record) => {
        const target = getQuarterlyTarget(record.targetId)
        const commodityType = getCommodityType(record.commodityId)

        if (target?.year !== yearFilter) {
          return false
        }

        if (target?.quarter !== quarterFilter) {
          return false
        }

        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (commodityTypeFilter !== 'all' && commodityType !== commodityTypeFilter) {
          return false
        }

        if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'productName',
          'commodityName',
          'billingItemCode',
          'billingItemName',
        ])
      }),
    [
      commodityTypeFilter,
      productFilter,
      quarterFilter,
      riskFilter,
      searchQuery,
      yearFilter,
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
        title="商品贡献"
        description="按商品和计费项查看季度业绩目标贡献、成本消耗和毛利风险。"
      />
      <ManagementToolbar ariaLabel="商品贡献筛选工具">
        <SearchField
          label="搜索商品贡献"
          value={searchQuery}
          placeholder="搜索商品、计费项、成本模型或版本"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选贡献年度"
          value={yearFilter}
          allLabel="全部年度"
          options={targetYears}
          onChange={(value) => {
            setYearFilter(value)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选贡献季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={targetQuarters}
          onChange={(value) => {
            setQuarterFilter(value as TargetQuarter)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选贡献产品"
          value={productFilter}
          allLabel="全部产品"
          options={targetProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选贡献商品类型"
          value={commodityTypeFilter}
          allLabel="全部商品类型"
          options={targetCommodityTypes}
          onChange={(value) => {
            setCommodityTypeFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选贡献毛利风险"
          value={riskFilter}
          allLabel="全部毛利风险"
          options={targetRiskStatuses}
          onChange={(value) => {
            setRiskFilter(value)
            resetPage()
          }}
        />
      </ManagementToolbar>
      <ManagementTable<TargetCommodityContributionRecord>
        records={pagedRecords}
        getRowKey={(record) => record.id}
        minWidth={1660}
        columns={[
          textColumn('commodityName', '商品名称', (record) => record.commodityName, true),
          textColumn('productName', '所属产品', (record) => record.productName),
          textColumn('commodityType', '商品类型', (record) =>
            getCommodityType(record.commodityId),
          ),
          textColumn('productOwner', '产品负责人', (record) =>
            getProductOwner(record.productId),
          ),
          textColumn('revenueTarget', '季度目标贡献', (record) => record.revenueTarget),
          textColumn('achievedRevenue', '实际贡献', (record) => record.achievedRevenue),
          textColumn('contributionRate', '贡献达成率', (record) => record.contributionRate),
          textColumn('confirmedCost', '成本贡献', (record) => record.confirmedCost),
          textColumn('grossProfit', '毛利额', (record) =>
            getContributionGrossProfit(record),
          ),
          textColumn('grossMargin', '毛利率', (record) => record.grossMargin),
          textColumn('contributionShare', '贡献占比', (record) =>
            getContributionShare(record),
          ),
          textColumn('billingItemName', '主要计费项', (record) => record.billingItemName),
          {
            key: 'riskStatus',
            header: '风险状态',
            render: (record) => <StatusPill status={record.riskStatus} />,
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

function TargetMarginsView() {
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState<TargetQuarter>('Q2')
  const [productFilter, setProductFilter] = useState('all')
  const [varianceTypeFilter, setVarianceTypeFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const marginRows = useMemo(() => createMarginVarianceRows(), [])

  const filteredRecords = useMemo(
    () =>
      marginRows.filter((record) => {
        if (record.year !== yearFilter) {
          return false
        }

        if (record.quarter !== quarterFilter) {
          return false
        }

        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (
          varianceTypeFilter !== 'all' &&
          record.varianceType !== varianceTypeFilter
        ) {
          return false
        }

        if (riskFilter !== 'all' && record.riskStatus !== riskFilter) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'productName',
          'varianceType',
          'reason',
          'suggestedAction',
        ])
      }),
    [
      marginRows,
      productFilter,
      quarterFilter,
      riskFilter,
      searchQuery,
      varianceTypeFilter,
      yearFilter,
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
        title="成本与毛利"
        description="从成本偏差记录派生收入、成本和毛利差异，辅助定位季度目标风险。"
      />
      <ManagementToolbar ariaLabel="成本与毛利筛选工具">
        <SearchField
          label="搜索成本与毛利"
          value={searchQuery}
          placeholder="搜索产品、商品、计费项、原因或建议动作"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选毛利年度"
          value={yearFilter}
          allLabel="全部年度"
          options={targetYears}
          onChange={(value) => {
            setYearFilter(value)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选毛利季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={targetQuarters}
          onChange={(value) => {
            setQuarterFilter(value as TargetQuarter)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选毛利产品"
          value={productFilter}
          allLabel="全部产品"
          options={targetProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选差异类型"
          value={varianceTypeFilter}
          allLabel="全部差异类型"
          options={targetVarianceTypes}
          onChange={(value) => {
            setVarianceTypeFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选毛利风险状态"
          value={riskFilter}
          allLabel="全部风险"
          options={targetRiskStatuses}
          onChange={(value) => {
            setRiskFilter(value)
            resetPage()
          }}
        />
      </ManagementToolbar>
      <ManagementTable<MarginVarianceRow>
        records={pagedRecords}
        getRowKey={(record) => record.id}
        minWidth={1860}
        columns={[
          textColumn('year', '年度', (record) => record.year),
          textColumn('quarter', '季度', (record) => record.quarter),
          textColumn('productName', '产品名称', (record) => record.productName, true),
          textColumn('revenueTarget', '业绩目标', (record) => record.revenueTarget),
          textColumn('achievedRevenue', '已达成业绩', (record) => record.achievedRevenue),
          textColumn('revenueVariance', '收入差异', (record) => record.revenueVariance),
          textColumn('costBudget', '成本预算', (record) => record.costBudget),
          textColumn('confirmedCost', '已确认成本', (record) => record.confirmedCost),
          textColumn('costVariance', '成本差异', (record) => record.costVariance),
          textColumn('targetGrossProfit', '目标毛利额', (record) => record.targetGrossProfit),
          textColumn('actualGrossProfit', '实际毛利额', (record) => record.actualGrossProfit),
          textColumn(
            'grossProfitVariance',
            '毛利额差异',
            (record) => record.grossProfitVariance,
          ),
          textColumn('targetGrossMargin', '目标毛利率', (record) => record.targetGrossMargin),
          textColumn('actualGrossMargin', '实际毛利率', (record) => record.actualGrossMargin),
          textColumn('marginVariance', '毛利率差异', (record) => record.marginVariance),
          {
            key: 'varianceType',
            header: '差异类型',
            render: (record) => <StatusPill status={record.varianceType} />,
          },
          textColumn('reason', '主要原因', (record) => record.reason),
          textColumn('suggestedAction', '建议动作', (record) => record.suggestedAction),
          textColumn('updatedAt', '更新时间', (record) => record.updatedAt),
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

function TargetVersionsView() {
  const [productFilter, setProductFilter] = useState('all')
  const [yearFilter, setYearFilter] = useState('2026')
  const [quarterFilter, setQuarterFilter] = useState<TargetQuarter>('Q2')
  const [statusFilter, setStatusFilter] = useState('all')
  const [changeTypeFilter, setChangeTypeFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const versionRows = useMemo(() => createTargetVersionDisplayRows(), [])

  const filteredRecords = useMemo(
    () =>
      versionRows.filter((record) => {
        if (productFilter !== 'all' && record.productName !== productFilter) {
          return false
        }

        if (record.year !== yearFilter) {
          return false
        }

        if (record.quarter !== quarterFilter) {
          return false
        }

        if (statusFilter !== 'all' && record.status !== statusFilter) {
          return false
        }

        if (
          changeTypeFilter !== 'all' &&
          record.displayChangeType !== changeTypeFilter
        ) {
          return false
        }

        return matchesQuery(record, searchQuery, [
          'targetVersion',
          'targetCode',
          'productName',
          'displayChangeType',
          'creator',
          'description',
        ])
      }),
    [
      changeTypeFilter,
      productFilter,
      quarterFilter,
      searchQuery,
      statusFilter,
      versionRows,
      yearFilter,
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
        title="目标版本记录"
        description="追踪目标调整、成本预算调整、商品贡献调整和毛利口径锁定记录。"
      />
      <ManagementToolbar ariaLabel="目标版本筛选工具">
        <SearchField
          label="搜索目标版本"
          value={searchQuery}
          placeholder="搜索版本、产品、商品、变更类型或说明"
          onChange={(value) => {
            setSearchQuery(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选版本产品"
          value={productFilter}
          allLabel="全部产品"
          options={targetProductNames}
          onChange={(value) => {
            setProductFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选版本年度"
          value={yearFilter}
          allLabel="全部年度"
          options={targetYears}
          onChange={(value) => {
            setYearFilter(value)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选版本季度"
          value={quarterFilter}
          allLabel="全部季度"
          options={targetQuarters}
          onChange={(value) => {
            setQuarterFilter(value as TargetQuarter)
            resetPage()
          }}
          includeAll={false}
        />
        <FilterSelect
          label="筛选版本状态"
          value={statusFilter}
          allLabel="全部版本状态"
          options={targetVersionStatuses}
          onChange={(value) => {
            setStatusFilter(value)
            resetPage()
          }}
        />
        <FilterSelect
          label="筛选目标变更类型"
          value={changeTypeFilter}
          allLabel="全部变更类型"
          options={targetVersionDisplayChangeTypes}
          onChange={(value) => {
            setChangeTypeFilter(value)
            resetPage()
          }}
        />
      </ManagementToolbar>
      <ManagementTable<TargetVersionDisplayRow>
        records={pagedRecords}
        getRowKey={(record) => record.targetVersion}
        minWidth={1640}
        columns={[
          textColumn('targetVersion', '版本号', (record) => record.targetVersion, true),
          textColumn('targetCode', '目标编号', (record) => record.targetCode),
          textColumn('productName', '产品名称', (record) => record.productName),
          textColumn('year', '年度', (record) => record.year),
          textColumn('quarter', '季度', (record) => record.quarter),
          textColumn('displayChangeType', '变更类型', (record) => record.displayChangeType),
          textColumn('beforeTarget', '变更前目标', (record) => record.beforeTarget),
          textColumn('afterTarget', '变更后目标', (record) => record.afterTarget),
          textColumn(
            'beforeGrossMargin',
            '变更前毛利率',
            (record) => record.beforeGrossMargin,
          ),
          textColumn(
            'afterGrossMargin',
            '变更后毛利率',
            (record) => record.afterGrossMargin,
          ),
          {
            key: 'status',
            header: '状态',
            render: (record) => <StatusPill status={record.status} />,
          },
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

function createTargetOverviewMetrics(
  records: TargetOverviewRecord[],
  year: string,
  quarter: TargetQuarter,
): MetricRecord[] {
  const revenueTarget = sumCurrency(records, (record) => record.revenueTarget)
  const achievedRevenue = sumCurrency(records, (record) => record.achievedRevenue)
  const costBudget = sumCurrency(records, (record) => record.costBudget)
  const confirmedCost = sumCurrency(records, (record) => record.confirmedCost)
  const actualGrossProfit = sumCurrency(records, (record) => record.actualGrossProfit)
  const attainmentRate =
    revenueTarget > 0 ? Math.round((achievedRevenue / revenueTarget) * 100) : 0
  const costUsageRate =
    costBudget > 0 ? Math.round((confirmedCost / costBudget) * 100) : 0
  const actualGrossMargin =
    achievedRevenue > 0 ? `${Math.round((actualGrossProfit / achievedRevenue) * 100)}%` : '-'
  const forecastAttainmentRate = weightedAveragePercent(
    records,
    (record) => record.forecastAttainmentRate,
    (record) => record.revenueTarget,
  )
  const riskProductCount = records.filter((record) => record.riskStatus !== '正常').length

  return [
    {
      label: '本季度业绩目标',
      value: formatCurrency(revenueTarget),
      note: `${year} ${quarter} 产品经营目标汇总`,
    },
    {
      label: '已达成业绩',
      value: formatCurrency(achievedRevenue),
      note: '费用中心已确认收入',
    },
    {
      label: '目标达成率',
      value: `${attainmentRate}%`,
      note: '已达成业绩 / 本季度业绩目标',
    },
    {
      label: '成本预算',
      value: formatCurrency(costBudget),
      note: '目标成本预算汇总',
    },
    {
      label: '已确认成本',
      value: formatCurrency(confirmedCost),
      note: '账单、交付和共享分摊确认',
    },
    {
      label: '成本使用率',
      value: `${costUsageRate}%`,
      note: '已确认成本 / 成本预算',
    },
    {
      label: '实际毛利额',
      value: formatCurrency(actualGrossProfit),
      note: '已达成业绩扣除确认成本',
    },
    {
      label: '实际毛利率',
      value: actualGrossMargin,
      note: '实际毛利额 / 已达成业绩',
    },
    {
      label: '预测季度达成率',
      value: `${forecastAttainmentRate}%`,
      note: '按业绩目标加权预测',
    },
    {
      label: '风险产品数',
      value: String(riskProductCount),
      note: '风险状态为关注或风险的产品',
    },
  ]
}

function createOverviewMonthlyTrendRows(
  records: TargetOverviewRecord[],
): OverviewMonthlyTrendRow[] {
  return records.flatMap((record) => {
    const detail = getTargetDetail(record.targetId)

    return (detail?.monthlyTrends ?? []).map((trend) => ({
      ...trend,
      productName: record.productName,
      productOwner: record.productOwner,
    }))
  })
}

function createOverviewRiskNoteRows(records: TargetOverviewRecord[]): OverviewRiskNoteRow[] {
  return records.flatMap((record) => {
    const detail = getTargetDetail(record.targetId)

    return (detail?.riskNotes ?? []).map((risk) => ({
      ...risk,
      productName: record.productName,
    }))
  })
}

function createTargetVersionDisplayRows(): TargetVersionDisplayRow[] {
  return targetVersionRecords.map((record) => {
    const target = getQuarterlyTarget(record.targetId)
    const afterTarget = parseCurrency(target?.revenueTarget ?? record.impactRevenue)
    const impactRevenue = parseCurrency(record.impactRevenue)
    const afterGrossMargin = parsePercent(target?.targetGrossMargin ?? '0')
    const impactGrossMargin = parsePercent(record.impactGrossMargin)

    return {
      ...record,
      targetCode: target?.targetCode ?? '-',
      year: target?.year ?? '2026',
      quarter: target?.quarter ?? 'Q2',
      displayChangeType: record.changeType,
      beforeTarget: formatCurrency(Math.max(0, afterTarget - impactRevenue)),
      afterTarget: formatCurrency(afterTarget),
      beforeGrossMargin: formatPercentValue(afterGrossMargin - impactGrossMargin),
      afterGrossMargin: formatPercentValue(afterGrossMargin),
    }
  })
}

function createMarginVarianceRows(): MarginVarianceRow[] {
  return quarterlyTargetRecords.map((target) => {
    const revenueTarget = parseCurrency(target.revenueTarget)
    const achievedRevenue = parseCurrency(target.achievedRevenue)
    const costBudget = parseCurrency(target.costBudget)
    const confirmedCost = parseCurrency(target.confirmedCost)
    const targetGrossProfit = parseCurrency(target.targetGrossProfit)
    const actualGrossProfit = parseCurrency(target.actualGrossProfit)
    const targetGrossMargin = parsePercent(target.targetGrossMargin)
    const actualGrossMargin = parsePercent(target.actualGrossMargin)
    const isPlanningQuarter = target.quarter === 'Q3'
    const varianceType = isPlanningQuarter
      ? target.riskStatus === '关注'
        ? '轻微负向'
        : '正向'
      : getProductVarianceType(actualGrossProfit - targetGrossProfit, targetGrossProfit)

    return {
      id: `target-margin-${target.targetId}`,
      productId: target.productId,
      productName: target.productName,
      year: target.year,
      quarter: target.quarter,
      revenueTarget: target.revenueTarget,
      achievedRevenue: target.achievedRevenue,
      revenueVariance: isPlanningQuarter
        ? '-'
        : formatSignedCurrency(achievedRevenue - revenueTarget),
      costBudget: target.costBudget,
      confirmedCost: target.confirmedCost,
      costVariance: isPlanningQuarter
        ? '-'
        : formatSignedCurrency(confirmedCost - costBudget),
      targetGrossProfit: target.targetGrossProfit,
      actualGrossProfit: target.actualGrossProfit,
      grossProfitVariance: isPlanningQuarter
        ? '-'
        : formatSignedCurrency(actualGrossProfit - targetGrossProfit),
      targetGrossMargin: target.targetGrossMargin,
      actualGrossMargin: target.actualGrossMargin,
      marginVariance: isPlanningQuarter
        ? '-'
        : formatPointVariance(actualGrossMargin - targetGrossMargin),
      varianceType,
      reason: isPlanningQuarter
        ? '季度尚未开始确认实际收入，当前为目标预算和销售漏斗预测。'
        : '产品收入确认节奏与成本使用率共同影响实际毛利表现。',
      suggestedAction: isPlanningQuarter
        ? '锁定重点客户商机和资源预算上限'
        : '复核高消耗租户、锁定折扣线并调整下月资源预算',
      updatedAt: target.updatedAt,
      riskStatus: isPlanningQuarter ? target.riskStatus : getRiskStatusForVariance(varianceType),
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
      (sum, record) =>
        sum + parsePercent(getPercent(record)) * parseCurrency(getWeight(record)),
      0,
    ) / totalWeight,
  )
}

function formatCurrency(value: number) {
  return `¥${Math.round(value).toLocaleString('zh-CN')}`
}

function formatSignedCurrency(value: number) {
  const sign = value >= 0 ? '+' : '-'

  return `${sign}${formatCurrency(Math.abs(value))}`
}

function getQuarterlyTarget(targetId: string) {
  return quarterlyTargetRecords.find((record) => record.targetId === targetId)
}

function getProductOwner(productId: string) {
  return productRecords.find((record) => record.id === productId)?.owner ?? '-'
}

function getProductStage(productId: string): ProductStage | '-' {
  return productRecords.find((record) => record.id === productId)?.stage ?? '-'
}

function getCommodityType(commodityId: string): CommoditySaleType | '-' {
  return commodityRecords.find((record) => record.id === commodityId)?.commodityType ?? '-'
}

function getCommodityBillingItemCount(commodityId: string) {
  return getCommodityDetail(commodityId)?.billingItems.length ?? 0
}

function getContributionGrossProfit(record: TargetCommodityContributionRecord) {
  return formatCurrency(
    parseCurrency(record.achievedRevenue) - parseCurrency(record.confirmedCost),
  )
}

function getContributionShare(record: TargetCommodityContributionRecord) {
  const target = getQuarterlyTarget(record.targetId)
  const denominator = parseCurrency(target?.revenueTarget ?? '0')

  if (denominator <= 0) {
    return '-'
  }

  return `${Math.round((parseCurrency(record.revenueTarget) / denominator) * 100)}%`
}

function getProductVarianceType(variance: number, targetAmount: number): VarianceType {
  if (variance >= 0) {
    return '正向'
  }

  if (targetAmount > 0 && Math.abs(variance) / targetAmount > 0.12) {
    return '重大负向'
  }

  return '轻微负向'
}

function getRiskStatusForVariance(varianceType: VarianceType): TargetRiskStatus {
  switch (varianceType) {
    case '正向':
      return '正常'
    case '轻微负向':
      return '关注'
    case '重大负向':
      return '风险'
  }
}

function getStatusTone(status: ManagementStatus) {
  switch (status) {
    case '正常':
    case '已完成':
    case '已锁定':
    case '已生效':
    case '正向':
      return 'success'
    case '关注':
    case '进行中':
    case '草稿':
    case '轻微负向':
      return 'warning'
    case '风险':
    case '重大负向':
      return 'danger'
    case '已归档':
      return 'neutral'
  }
}

function formatPercentValue(value: number) {
  const roundedValue = Math.round(value * 10) / 10

  return Number.isInteger(roundedValue) ? `${roundedValue}%` : `${roundedValue.toFixed(1)}%`
}

function formatPointVariance(value: number) {
  const roundedValue = Math.round(Math.abs(value) * 10) / 10
  const formattedValue = Number.isInteger(roundedValue)
    ? String(roundedValue)
    : roundedValue.toFixed(1)

  return `${value >= 0 ? '+' : '-'}${formattedValue}pt`
}
