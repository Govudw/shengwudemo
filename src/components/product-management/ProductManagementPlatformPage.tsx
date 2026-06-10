import { useMemo, useState } from 'react'
import logoSrc from '../../assets/biomap-agent-logo.png'
import { SearchIcon } from '../icons'
import {
  billRecords,
  billPageSize,
  billingCycles,
  billingInstanceRecords,
  billingInstanceTypes,
  billingItemTypes,
  commodityDetailTabs,
  commodityPageSize,
  commodityRecords,
  commodityStatuses,
  externalVisibleOptions,
  getCommodityDetail,
  getProductDetail,
  paymentTypes,
  productDetailTabs,
  productPlatformTabs,
  productRecords,
  productStages,
  productTypes,
  type BillRecord,
  type BillingCycle,
  type BillingInstanceRecord,
  type BillingInstanceType,
  type BillingSection,
  type BillingItemRecord,
  type BillingItemType,
  type CommodityDetailRecord,
  type CommodityDetailTab,
  type CommodityFilter,
  type CommodityRecord,
  type CommodityStatus,
  type ExternalVisible,
  type PaymentType,
  type ProductDetailRecord,
  type ProductDetailTab,
  type ProductPlatformTab,
  type ProductRecord,
  type ProductStage,
  type ProductType,
} from './productManagementMockData'

type ProductManagementPlatformPageProps = {
  initialCommodityId?: string | null
  initialProductId?: string | null
  initialTab?: ProductPlatformTab
  onNotify?: (message: string) => void
  onOpenProductList?: () => void
  onOpenProduct?: (productId: string) => void
  onCloseProduct?: () => void
  onOpenCommodityList?: () => void
  onOpenCommodity?: (commodityId: string) => void
  onCloseCommodity?: () => void
}

function ProductManagementPlatformPage({
  initialCommodityId = null,
  initialProductId = null,
  initialTab,
  onNotify = () => undefined,
  onOpenProductList,
  onOpenProduct,
  onCloseProduct,
  onOpenCommodityList,
  onOpenCommodity,
  onCloseCommodity,
}: ProductManagementPlatformPageProps) {
  const [activeTab, setActiveTab] = useState<ProductPlatformTab>(
    initialTab ?? (initialCommodityId ? 'commodity' : 'product'),
  )
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProductId,
  )
  const [selectedCommodityId, setSelectedCommodityId] = useState<string | null>(
    initialCommodityId,
  )
  const [productDetailTab, setProductDetailTab] =
    useState<ProductDetailTab>('overview')
  const [detailTab, setDetailTab] = useState<CommodityDetailTab>('overview')
  const [productStageFilter, setProductStageFilter] = useState<
    ProductStage | CommodityFilter
  >('all')
  const [productExternalVisibleFilter, setProductExternalVisibleFilter] = useState<
    ExternalVisible | CommodityFilter
  >('all')
  const [productOwnerFilter, setProductOwnerFilter] = useState<
    string | CommodityFilter
  >('all')
  const [productSearchQuery, setProductSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CommodityStatus | CommodityFilter>(
    'all',
  )
  const [productTypeFilter, setProductTypeFilter] = useState<
    ProductType | CommodityFilter
  >('all')
  const [ownerFilter, setOwnerFilter] = useState<string | CommodityFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeBillingSection, setActiveBillingSection] =
    useState<BillingSection>('instances')
  const [billingInstanceAccountFilter, setBillingInstanceAccountFilter] = useState<
    string | CommodityFilter
  >('all')
  const [billingInstanceCustomerFilter, setBillingInstanceCustomerFilter] = useState<
    string | CommodityFilter
  >('all')
  const [billingInstanceTypeFilter, setBillingInstanceTypeFilter] = useState<
    BillingInstanceType | CommodityFilter
  >('all')
  const [billingInstanceStartDateFilter, setBillingInstanceStartDateFilter] =
    useState('')
  const [billingInstanceEndDateFilter, setBillingInstanceEndDateFilter] = useState('')
  const [billingInstanceSearchQuery, setBillingInstanceSearchQuery] = useState('')
  const [billAccountFilter, setBillAccountFilter] = useState<string | CommodityFilter>(
    'all',
  )
  const [billCustomerFilter, setBillCustomerFilter] = useState<string | CommodityFilter>(
    'all',
  )
  const [billTypeFilter, setBillTypeFilter] = useState<
    BillingInstanceType | CommodityFilter
  >('all')
  const [billCycleFilter, setBillCycleFilter] = useState<
    BillingCycle | CommodityFilter
  >('all')
  const [billStartDateFilter, setBillStartDateFilter] = useState('')
  const [billEndDateFilter, setBillEndDateFilter] = useState('')
  const [billSearchQuery, setBillSearchQuery] = useState('')
  const [currentBillPage, setCurrentBillPage] = useState(1)

  const ownerOptions = useMemo(
    () =>
      Array.from(new Set(commodityRecords.map((record) => record.owner))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [],
  )
  const billingInstanceAccountOptions = useMemo(
    () =>
      Array.from(
        new Set(billingInstanceRecords.map((record) => record.mainAccountId)),
      ).sort((left, right) => left.localeCompare(right)),
    [],
  )
  const billingInstanceCustomerOptions = useMemo(
    () =>
      Array.from(
        new Set(billingInstanceRecords.map((record) => record.customerName)),
      ).sort((left, right) => left.localeCompare(right)),
    [],
  )
  const billAccountOptions = useMemo(
    () =>
      Array.from(new Set(billRecords.map((record) => record.mainAccountId))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [],
  )
  const billCustomerOptions = useMemo(
    () =>
      Array.from(new Set(billRecords.map((record) => record.customerName))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [],
  )
  const productOwnerOptions = useMemo(
    () =>
      Array.from(new Set(productRecords.map((record) => record.owner))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [],
  )
  const visibleProductRecords = useMemo(() => {
    const normalizedQuery = productSearchQuery.trim().toLowerCase()

    return productRecords.filter((record) => {
      if (productStageFilter !== 'all' && record.stage !== productStageFilter) {
        return false
      }

      if (
        productExternalVisibleFilter !== 'all' &&
        record.externalVisible !== productExternalVisibleFilter
      ) {
        return false
      }

      if (productOwnerFilter !== 'all' && record.owner !== productOwnerFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [record.name, record.code, record.owner, record.stage]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [
    productExternalVisibleFilter,
    productOwnerFilter,
    productSearchQuery,
    productStageFilter,
  ])
  const selectedProduct = useMemo(
    () =>
      selectedProductId
        ? productRecords.find((record) => record.id === selectedProductId) ?? null
        : null,
    [selectedProductId],
  )
  const selectedProductDetail = getProductDetail(selectedProductId)
  const selectedCommodity = useMemo(
    () =>
      selectedCommodityId
        ? commodityRecords.find((record) => record.id === selectedCommodityId) ?? null
        : null,
    [selectedCommodityId],
  )
  const selectedCommodityDetail = getCommodityDetail(selectedCommodityId)
  const visibleBillingInstanceRecords = useMemo(() => {
    const normalizedQuery = billingInstanceSearchQuery.trim().toLowerCase()

    return billingInstanceRecords.filter((record) => {
      if (
        billingInstanceAccountFilter !== 'all' &&
        record.mainAccountId !== billingInstanceAccountFilter
      ) {
        return false
      }

      if (
        billingInstanceCustomerFilter !== 'all' &&
        record.customerName !== billingInstanceCustomerFilter
      ) {
        return false
      }

      if (
        billingInstanceTypeFilter !== 'all' &&
        record.billingItemType !== billingInstanceTypeFilter
      ) {
        return false
      }

      if (
        billingInstanceStartDateFilter &&
        record.startTime.slice(0, 10) < billingInstanceStartDateFilter
      ) {
        return false
      }

      if (
        billingInstanceEndDateFilter &&
        record.endTime.slice(0, 10) > billingInstanceEndDateFilter
      ) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [
        record.id,
        record.mainAccountId,
        record.customerName,
        record.billingItemName,
        record.billingItemCode,
        record.billingItemType,
        record.startTime,
        record.endTime,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [
    billingInstanceAccountFilter,
    billingInstanceCustomerFilter,
    billingInstanceEndDateFilter,
    billingInstanceSearchQuery,
    billingInstanceStartDateFilter,
    billingInstanceTypeFilter,
  ])
  const visibleBillRecords = useMemo(() => {
    const normalizedQuery = billSearchQuery.trim().toLowerCase()

    return billRecords.filter((record) => {
      if (billAccountFilter !== 'all' && record.mainAccountId !== billAccountFilter) {
        return false
      }

      if (billCustomerFilter !== 'all' && record.customerName !== billCustomerFilter) {
        return false
      }

      if (billTypeFilter !== 'all' && record.billingItemType !== billTypeFilter) {
        return false
      }

      if (billCycleFilter !== 'all' && record.cycle !== billCycleFilter) {
        return false
      }

      if (billStartDateFilter && record.periodStart.slice(0, 10) < billStartDateFilter) {
        return false
      }

      if (billEndDateFilter && record.periodEnd.slice(0, 10) > billEndDateFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [
        record.id,
        record.mainAccountId,
        record.customerName,
        record.billingItemName,
        record.billingItemCode,
        record.billingItemType,
        record.periodStart,
        record.periodEnd,
        record.cycle,
        record.createdAt,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [
    billAccountFilter,
    billCustomerFilter,
    billCycleFilter,
    billEndDateFilter,
    billSearchQuery,
    billStartDateFilter,
    billTypeFilter,
  ])
  const visibleCommodityRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return commodityRecords.filter((record) => {
      if (statusFilter !== 'all' && record.status !== statusFilter) {
        return false
      }

      if (productTypeFilter !== 'all' && record.productType !== productTypeFilter) {
        return false
      }

      if (ownerFilter !== 'all' && record.owner !== ownerFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [record.name, record.productType, record.commodityType, record.owner]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [ownerFilter, productTypeFilter, searchQuery, statusFilter])
  const pageCount = Math.max(
    1,
    Math.ceil(visibleCommodityRecords.length / commodityPageSize),
  )
  const boundedCurrentPage = Math.min(currentPage, pageCount)
  const pagedCommodityRecords = visibleCommodityRecords.slice(
    (boundedCurrentPage - 1) * commodityPageSize,
    boundedCurrentPage * commodityPageSize,
  )
  const billPageCount = Math.max(1, Math.ceil(visibleBillRecords.length / billPageSize))
  const boundedBillPage = Math.min(currentBillPage, billPageCount)
  const pagedBillRecords = visibleBillRecords.slice(
    (boundedBillPage - 1) * billPageSize,
    boundedBillPage * billPageSize,
  )

  function resetCommodityPage() {
    setCurrentPage(1)
  }

  function resetBillPage() {
    setCurrentBillPage(1)
  }

  function handleRestrictedPermissionRequest() {
    onNotify('权限申请暂未开放')
  }

  function handleCommodityAction(action: 'edit' | 'delete', record: CommodityRecord) {
    onNotify(
      action === 'edit'
        ? `${record.name} 编辑暂未接入`
        : `${record.name} 删除暂未接入`,
    )
  }

  function handleProductAction(record: ProductRecord) {
    onNotify(`${record.name} 编辑暂未接入`)
  }

  function handleBillingInstanceAction(record: BillingInstanceRecord) {
    onNotify(`${record.id} 查看实例暂未接入`)
  }

  function handleBillAction(record: BillRecord) {
    onNotify(`${record.id} 查看账单暂未接入`)
  }

  function handleOpenProduct(record: ProductRecord) {
    setSelectedProductId(record.id)
    setSelectedCommodityId(null)
    setProductDetailTab('overview')
    onOpenProduct?.(record.id)
  }

  function handleCloseProduct() {
    setSelectedProductId(null)
    setProductDetailTab('overview')
    onCloseProduct?.()
  }

  function handleOpenCommodity(record: CommodityRecord) {
    setSelectedCommodityId(record.id)
    setSelectedProductId(null)
    setDetailTab('overview')
    onOpenCommodity?.(record.id)
  }

  function handleCloseCommodity() {
    setSelectedCommodityId(null)
    setDetailTab('overview')
    onCloseCommodity?.()
  }

  function handleTopTabClick(tab: ProductPlatformTab) {
    setActiveTab(tab)

    if (tab === 'commodity') {
      setSelectedCommodityId(null)
      setSelectedProductId(null)
      setDetailTab('overview')
      setProductDetailTab('overview')
      onOpenCommodityList?.()
      return
    }

    setSelectedCommodityId(null)
    setSelectedProductId(null)
    setDetailTab('overview')
    setProductDetailTab('overview')

    if (tab === 'product') {
      onOpenProductList?.()
    }
  }

  return (
    <main className="product-platform-page" aria-label="产品管理平台">
      <header className="product-platform-header">
        <div
          className="product-platform-header__brand"
          role="img"
          aria-label="BioMap Agent"
        >
          <span className="product-platform-header__logo-crop" aria-hidden="true">
            <img className="product-platform-header__logo" src={logoSrc} alt="" />
          </span>
        </div>

        <nav className="product-platform-tabs" aria-label="产品管理平台导航">
          {productPlatformTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`product-platform-tab${
                activeTab === tab.id ? ' product-platform-tab--active' : ''
              }`}
              aria-selected={activeTab === tab.id}
              onClick={() => handleTopTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="product-platform-body" data-active-tab={activeTab}>
        <aside
          className="product-platform-sidebar"
          aria-label="产品管理平台左侧导航"
        >
          {activeTab === 'commodity' ? (
            <nav
              className="product-platform-side-menu"
              aria-label="商品管理左侧导航"
            >
              <button
                type="button"
                className="product-platform-side-menu__item product-platform-side-menu__item--active"
                aria-current="page"
              >
                商品管理
              </button>
              <button
                type="button"
                className="product-platform-side-menu__item product-platform-side-menu__item--disabled"
                aria-disabled="true"
                disabled
                onClick={handleRestrictedPermissionRequest}
              >
                权限申请
              </button>
            </nav>
          ) : null}
          {activeTab === 'billing' ? (
            <nav
              className="product-platform-side-menu"
              aria-label="费用中心左侧导航"
            >
              <button
                type="button"
                className={`product-platform-side-menu__item${
                  activeBillingSection === 'instances'
                    ? ' product-platform-side-menu__item--active'
                    : ''
                }`}
                aria-current={
                  activeBillingSection === 'instances' ? 'page' : undefined
                }
                onClick={() => setActiveBillingSection('instances')}
              >
                实例管理
              </button>
              <button
                type="button"
                className={`product-platform-side-menu__item${
                  activeBillingSection === 'bills'
                    ? ' product-platform-side-menu__item--active'
                    : ''
                }`}
                aria-current={activeBillingSection === 'bills' ? 'page' : undefined}
                onClick={() => setActiveBillingSection('bills')}
              >
                账单管理
              </button>
            </nav>
          ) : null}
        </aside>
        <section
          className={`product-platform-canvas${
            activeTab === 'commodity' ? ' product-platform-canvas--commodity' : ''
          }${activeTab === 'product' ? ' product-platform-canvas--product' : ''}${
            activeTab === 'billing' ? ' product-platform-canvas--billing' : ''
          }`}
          aria-label="产品管理平台内容区"
        >
          {activeTab === 'product' ? (
            selectedProduct && selectedProductDetail ? (
              <ProductDetailView
                key={selectedProduct.id}
                record={selectedProduct}
                detail={selectedProductDetail}
                activeTab={productDetailTab}
                onTabChange={setProductDetailTab}
                onBack={handleCloseProduct}
              />
            ) : (
              <ProductManagementView
                records={visibleProductRecords}
                stageFilter={productStageFilter}
                externalVisibleFilter={productExternalVisibleFilter}
                ownerFilter={productOwnerFilter}
                searchQuery={productSearchQuery}
                ownerOptions={productOwnerOptions}
                onStageFilterChange={setProductStageFilter}
                onExternalVisibleFilterChange={setProductExternalVisibleFilter}
                onOwnerFilterChange={setProductOwnerFilter}
                onSearchQueryChange={setProductSearchQuery}
                onCreateProduct={() => onNotify('新建产品暂未接入')}
                onOpenRecord={handleOpenProduct}
                onRecordAction={handleProductAction}
              />
            )
          ) : null}
          {activeTab === 'commodity' ? (
            selectedCommodity && selectedCommodityDetail ? (
              <CommodityDetailView
                key={selectedCommodity.id}
                record={selectedCommodity}
                detail={selectedCommodityDetail}
                activeTab={detailTab}
                onTabChange={setDetailTab}
                onBack={handleCloseCommodity}
                onUpdate={() => onNotify('更新商品暂未接入')}
              />
            ) : (
              <CommodityManagementView
                records={visibleCommodityRecords}
                pagedRecords={pagedCommodityRecords}
                currentPage={boundedCurrentPage}
                pageCount={pageCount}
                statusFilter={statusFilter}
                productTypeFilter={productTypeFilter}
                ownerFilter={ownerFilter}
                searchQuery={searchQuery}
                productTypeOptions={productTypes}
                ownerOptions={ownerOptions}
                onStatusFilterChange={(value) => {
                  setStatusFilter(value)
                  resetCommodityPage()
                }}
                onProductTypeFilterChange={(value) => {
                  setProductTypeFilter(value)
                  resetCommodityPage()
                }}
                onOwnerFilterChange={(value) => {
                  setOwnerFilter(value)
                  resetCommodityPage()
                }}
                onSearchQueryChange={(value) => {
                  setSearchQuery(value)
                  resetCommodityPage()
                }}
                onPageChange={setCurrentPage}
                onCreateCommodity={() => onNotify('新建商品暂未接入')}
                onOpenRecord={handleOpenCommodity}
                onRecordAction={handleCommodityAction}
              />
            )
          ) : null}
          {activeTab === 'billing' && activeBillingSection === 'instances' ? (
            <BillingInstanceManagementView
              records={visibleBillingInstanceRecords}
              accountFilter={billingInstanceAccountFilter}
              customerFilter={billingInstanceCustomerFilter}
              typeFilter={billingInstanceTypeFilter}
              startDateFilter={billingInstanceStartDateFilter}
              endDateFilter={billingInstanceEndDateFilter}
              searchQuery={billingInstanceSearchQuery}
              accountOptions={billingInstanceAccountOptions}
              customerOptions={billingInstanceCustomerOptions}
              typeOptions={billingInstanceTypes}
              onAccountFilterChange={setBillingInstanceAccountFilter}
              onCustomerFilterChange={setBillingInstanceCustomerFilter}
              onTypeFilterChange={setBillingInstanceTypeFilter}
              onStartDateFilterChange={setBillingInstanceStartDateFilter}
              onEndDateFilterChange={setBillingInstanceEndDateFilter}
              onSearchQueryChange={setBillingInstanceSearchQuery}
              onCreateInstance={() => onNotify('创建实例暂未接入')}
              onRecordAction={handleBillingInstanceAction}
            />
          ) : null}
          {activeTab === 'billing' && activeBillingSection === 'bills' ? (
            <BillManagementView
              records={visibleBillRecords}
              pagedRecords={pagedBillRecords}
              currentPage={boundedBillPage}
              pageCount={billPageCount}
              accountFilter={billAccountFilter}
              customerFilter={billCustomerFilter}
              typeFilter={billTypeFilter}
              cycleFilter={billCycleFilter}
              startDateFilter={billStartDateFilter}
              endDateFilter={billEndDateFilter}
              searchQuery={billSearchQuery}
              accountOptions={billAccountOptions}
              customerOptions={billCustomerOptions}
              typeOptions={billingInstanceTypes}
              cycleOptions={billingCycles}
              onAccountFilterChange={(value) => {
                setBillAccountFilter(value)
                resetBillPage()
              }}
              onCustomerFilterChange={(value) => {
                setBillCustomerFilter(value)
                resetBillPage()
              }}
              onTypeFilterChange={(value) => {
                setBillTypeFilter(value)
                resetBillPage()
              }}
              onCycleFilterChange={(value) => {
                setBillCycleFilter(value)
                resetBillPage()
              }}
              onStartDateFilterChange={(value) => {
                setBillStartDateFilter(value)
                resetBillPage()
              }}
              onEndDateFilterChange={(value) => {
                setBillEndDateFilter(value)
                resetBillPage()
              }}
              onSearchQueryChange={(value) => {
                setBillSearchQuery(value)
                resetBillPage()
              }}
              onPageChange={setCurrentBillPage}
              onCreateBill={() => onNotify('新增账单暂未接入')}
              onRecordAction={handleBillAction}
            />
          ) : null}
        </section>
      </div>
    </main>
  )
}

type BillingInstanceManagementViewProps = {
  records: BillingInstanceRecord[]
  accountFilter: string | CommodityFilter
  customerFilter: string | CommodityFilter
  typeFilter: BillingInstanceType | CommodityFilter
  startDateFilter: string
  endDateFilter: string
  searchQuery: string
  accountOptions: string[]
  customerOptions: string[]
  typeOptions: BillingInstanceType[]
  onAccountFilterChange: (value: string | CommodityFilter) => void
  onCustomerFilterChange: (value: string | CommodityFilter) => void
  onTypeFilterChange: (value: BillingInstanceType | CommodityFilter) => void
  onStartDateFilterChange: (value: string) => void
  onEndDateFilterChange: (value: string) => void
  onSearchQueryChange: (value: string) => void
  onCreateInstance: () => void
  onRecordAction: (record: BillingInstanceRecord) => void
}

function BillingInstanceManagementView({
  records,
  accountFilter,
  customerFilter,
  typeFilter,
  startDateFilter,
  endDateFilter,
  searchQuery,
  accountOptions,
  customerOptions,
  typeOptions,
  onAccountFilterChange,
  onCustomerFilterChange,
  onTypeFilterChange,
  onStartDateFilterChange,
  onEndDateFilterChange,
  onSearchQueryChange,
  onCreateInstance,
  onRecordAction,
}: BillingInstanceManagementViewProps) {
  return (
    <div className="commodity-management">
      <header
        className="billing-instance-management__toolbar"
        aria-label="实例筛选工具"
      >
        <select
          className="commodity-management__select"
          aria-label="筛选实例主账号"
          value={accountFilter}
          onChange={(event) => onAccountFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部主账号</option>
          {accountOptions.map((accountId) => (
            <option key={accountId} value={accountId}>
              {accountId}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选客户名称"
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部客户</option>
          {customerOptions.map((customerName) => (
            <option key={customerName} value={customerName}>
              {customerName}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选计费项类型"
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(
              event.currentTarget.value as BillingInstanceType | CommodityFilter,
            )
          }
        >
          <option value="all">全部计费项类型</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="commodity-management__select"
          aria-label="筛选实例起始日期"
          value={startDateFilter}
          onChange={(event) => onStartDateFilterChange(event.currentTarget.value)}
        />

        <input
          type="date"
          className="commodity-management__select"
          aria-label="筛选实例结束日期"
          value={endDateFilter}
          onChange={(event) => onEndDateFilterChange(event.currentTarget.value)}
        />

        <label className="commodity-management__search">
          <SearchIcon className="commodity-management__search-icon" />
          <input
            type="search"
            aria-label="搜索实例"
            value={searchQuery}
            placeholder="搜索实例id、主账号、客户或计费项"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>

        <button
          type="button"
          className="commodity-management__create-button"
          onClick={onCreateInstance}
        >
          + 创建实例
        </button>
      </header>

      <div className="commodity-management__table-wrap">
        <table className="commodity-management__table">
          <thead>
            <tr>
              <th>实例id</th>
              <th>主账号</th>
              <th>客户名称</th>
              <th>计费项名称</th>
              <th>计费项编号</th>
              <th>计费项类型</th>
              <th>起始时间</th>
              <th>结束时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  <strong>{record.id}</strong>
                </td>
                <td>{record.mainAccountId}</td>
                <td>{record.customerName}</td>
                <td>{record.billingItemName}</td>
                <td>{record.billingItemCode}</td>
                <td>{record.billingItemType}</td>
                <td>{record.startTime}</td>
                <td>{record.endTime}</td>
                <td>
                  <div className="commodity-management__actions">
                    <button
                      type="button"
                      className="commodity-management__action"
                      onClick={() => onRecordAction(record)}
                    >
                      查看
                    </button>
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

type BillManagementViewProps = {
  records: BillRecord[]
  pagedRecords: BillRecord[]
  currentPage: number
  pageCount: number
  accountFilter: string | CommodityFilter
  customerFilter: string | CommodityFilter
  typeFilter: BillingInstanceType | CommodityFilter
  cycleFilter: BillingCycle | CommodityFilter
  startDateFilter: string
  endDateFilter: string
  searchQuery: string
  accountOptions: string[]
  customerOptions: string[]
  typeOptions: BillingInstanceType[]
  cycleOptions: BillingCycle[]
  onAccountFilterChange: (value: string | CommodityFilter) => void
  onCustomerFilterChange: (value: string | CommodityFilter) => void
  onTypeFilterChange: (value: BillingInstanceType | CommodityFilter) => void
  onCycleFilterChange: (value: BillingCycle | CommodityFilter) => void
  onStartDateFilterChange: (value: string) => void
  onEndDateFilterChange: (value: string) => void
  onSearchQueryChange: (value: string) => void
  onPageChange: (page: number) => void
  onCreateBill: () => void
  onRecordAction: (record: BillRecord) => void
}

function BillManagementView({
  records,
  pagedRecords,
  currentPage,
  pageCount,
  accountFilter,
  customerFilter,
  typeFilter,
  cycleFilter,
  startDateFilter,
  endDateFilter,
  searchQuery,
  accountOptions,
  customerOptions,
  typeOptions,
  cycleOptions,
  onAccountFilterChange,
  onCustomerFilterChange,
  onTypeFilterChange,
  onCycleFilterChange,
  onStartDateFilterChange,
  onEndDateFilterChange,
  onSearchQueryChange,
  onPageChange,
  onCreateBill,
  onRecordAction,
}: BillManagementViewProps) {
  return (
    <div className="commodity-management">
      <header
        className="billing-record-management__toolbar"
        aria-label="账单筛选工具"
      >
        <select
          className="commodity-management__select"
          aria-label="筛选账单主账号"
          value={accountFilter}
          onChange={(event) => onAccountFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部主账号</option>
          {accountOptions.map((accountId) => (
            <option key={accountId} value={accountId}>
              {accountId}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选账单客户名称"
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部客户</option>
          {customerOptions.map((customerName) => (
            <option key={customerName} value={customerName}>
              {customerName}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选账单计费项类型"
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(
              event.currentTarget.value as BillingInstanceType | CommodityFilter,
            )
          }
        >
          <option value="all">全部计费项类型</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选计费周期"
          value={cycleFilter}
          onChange={(event) =>
            onCycleFilterChange(
              event.currentTarget.value as BillingCycle | CommodityFilter,
            )
          }
        >
          <option value="all">全部周期</option>
          {cycleOptions.map((cycle) => (
            <option key={cycle} value={cycle}>
              {cycle}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="commodity-management__select"
          aria-label="筛选账单开始日期"
          value={startDateFilter}
          onChange={(event) => onStartDateFilterChange(event.currentTarget.value)}
        />

        <input
          type="date"
          className="commodity-management__select"
          aria-label="筛选账单结束日期"
          value={endDateFilter}
          onChange={(event) => onEndDateFilterChange(event.currentTarget.value)}
        />

        <label className="commodity-management__search">
          <SearchIcon className="commodity-management__search-icon" />
          <input
            type="search"
            aria-label="搜索账单"
            value={searchQuery}
            placeholder="搜索账单id、主账号、客户或计费项"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>

        <button
          type="button"
          className="commodity-management__create-button"
          onClick={onCreateBill}
        >
          + 新增账单
        </button>
      </header>

      <div className="commodity-management__table-wrap">
        <table className="commodity-management__table">
          <thead>
            <tr>
              <th>账单id</th>
              <th>主账号</th>
              <th>客户名称</th>
              <th>计费项名称</th>
              <th>计费项编号</th>
              <th>计费项类型</th>
              <th>计费时间段</th>
              <th>计费周期</th>
              <th>账单创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <strong>{record.id}</strong>
                </td>
                <td>{record.mainAccountId}</td>
                <td>{record.customerName}</td>
                <td>{record.billingItemName}</td>
                <td>{record.billingItemCode}</td>
                <td>{record.billingItemType}</td>
                <td>{`${record.periodStart} ~ ${record.periodEnd}`}</td>
                <td>{record.cycle}</td>
                <td>{record.createdAt}</td>
                <td>
                  <div className="commodity-management__actions">
                    <button
                      type="button"
                      className="commodity-management__action"
                      onClick={() => onRecordAction(record)}
                    >
                      查看
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="commodity-management__pagination">
        <span>共 {records.length} 条</span>
        <div className="commodity-management__pagination-controls">
          <button
            type="button"
            className="commodity-management__page-button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button
            type="button"
            className="commodity-management__page-button"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      </footer>
    </div>
  )
}

type ProductManagementViewProps = {
  records: ProductRecord[]
  stageFilter: ProductStage | CommodityFilter
  externalVisibleFilter: ExternalVisible | CommodityFilter
  ownerFilter: string | CommodityFilter
  searchQuery: string
  ownerOptions: string[]
  onStageFilterChange: (value: ProductStage | CommodityFilter) => void
  onExternalVisibleFilterChange: (value: ExternalVisible | CommodityFilter) => void
  onOwnerFilterChange: (value: string | CommodityFilter) => void
  onSearchQueryChange: (value: string) => void
  onCreateProduct: () => void
  onOpenRecord: (record: ProductRecord) => void
  onRecordAction: (record: ProductRecord) => void
}

function ProductManagementView({
  records,
  stageFilter,
  externalVisibleFilter,
  ownerFilter,
  searchQuery,
  ownerOptions,
  onStageFilterChange,
  onExternalVisibleFilterChange,
  onOwnerFilterChange,
  onSearchQueryChange,
  onCreateProduct,
  onOpenRecord,
  onRecordAction,
}: ProductManagementViewProps) {
  return (
    <div className="commodity-management">
      <header className="commodity-management__toolbar" aria-label="产品筛选工具">
        <label className="commodity-management__search">
          <SearchIcon className="commodity-management__search-icon" />
          <input
            type="search"
            aria-label="搜索产品"
            value={searchQuery}
            placeholder="搜索产品名称、产品编号或负责人"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>

        <select
          className="commodity-management__select"
          aria-label="筛选产品阶段"
          value={stageFilter}
          onChange={(event) =>
            onStageFilterChange(
              event.currentTarget.value as ProductStage | CommodityFilter,
            )
          }
        >
          <option value="all">全部阶段</option>
          {productStages.map((stage) => (
            <option key={stage} value={stage}>
              {stage}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选外部可见"
          value={externalVisibleFilter}
          onChange={(event) =>
            onExternalVisibleFilterChange(
              event.currentTarget.value as ExternalVisible | CommodityFilter,
            )
          }
        >
          <option value="all">全部可见性</option>
          {externalVisibleOptions.map((visible) => (
            <option key={visible} value={visible}>
              {visible}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选产品负责人"
          value={ownerFilter}
          onChange={(event) => onOwnerFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部负责人</option>
          {ownerOptions.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="commodity-management__create-button"
          onClick={onCreateProduct}
        >
          + 新建产品
        </button>
      </header>

      <div className="commodity-management__table-wrap">
        <table className="commodity-management__table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>产品编号</th>
              <th>负责人</th>
              <th>产品阶段</th>
              <th>外部可见</th>
              <th>更新时间</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>
                  <button
                    type="button"
                    className="commodity-management__name-button"
                    onClick={() => onOpenRecord(record)}
                  >
                    <span className="visually-hidden">查看产品详情 </span>
                    <strong>{record.name}</strong>
                  </button>
                </td>
                <td>{record.code}</td>
                <td>{record.owner}</td>
                <td>{record.stage}</td>
                <td>{record.externalVisible}</td>
                <td>{record.updatedAt}</td>
                <td>{record.createdAt}</td>
                <td>
                  <div className="commodity-management__actions">
                    <button
                      type="button"
                      className="commodity-management__action"
                      onClick={() => onRecordAction(record)}
                    >
                      编辑
                    </button>
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

type ProductDetailViewProps = {
  record: ProductRecord
  detail: ProductDetailRecord
  activeTab: ProductDetailTab
  onTabChange: (tab: ProductDetailTab) => void
  onBack: () => void
}

function ProductDetailView({
  record,
  detail,
  activeTab,
  onTabChange,
  onBack,
}: ProductDetailViewProps) {
  return (
    <article className="commodity-detail" aria-label={`${record.name} 产品详情`}>
      <header className="commodity-detail__header">
        <div className="commodity-detail__heading">
          <button
            type="button"
            className="commodity-detail__back-button"
            onClick={onBack}
          >
            返回产品列表
          </button>
          <h1>{record.name}</h1>
          <p>{detail.description}</p>
          <dl className="commodity-detail__summary">
            <div>
              <dt>产品编号</dt>
              <dd>{record.code}</dd>
            </div>
            <div>
              <dt>负责人</dt>
              <dd>{record.owner}</dd>
            </div>
            <div>
              <dt>产品阶段</dt>
              <dd>{record.stage}</dd>
            </div>
            <div>
              <dt>外部可见</dt>
              <dd>{record.externalVisible}</dd>
            </div>
            <div>
              <dt>更新时间</dt>
              <dd>{record.updatedAt}</dd>
            </div>
          </dl>
        </div>
      </header>

      <nav className="commodity-detail__tabs" aria-label="产品详情导航">
        {productDetailTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`commodity-detail__tab${
              activeTab === tab.id ? ' commodity-detail__tab--active' : ''
            }`}
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="commodity-detail__panel">
        {activeTab === 'overview' ? <ProductOverview detail={detail} /> : null}
        {activeTab === 'versions' ? (
          <ProductVersionHistoryTable detail={detail} />
        ) : null}
      </section>
    </article>
  )
}

function ProductOverview({ detail }: { detail: ProductDetailRecord }) {
  return (
    <dl className="commodity-detail__overview-grid">
      {detail.overview.map((field) => (
        <div key={field.label} className="commodity-detail__overview-item">
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ProductVersionHistoryTable({ detail }: { detail: ProductDetailRecord }) {
  return (
    <div className="commodity-detail__table-wrap">
      <table className="commodity-detail__table">
        <thead>
          <tr>
            <th>版本号</th>
            <th>版本类型</th>
            <th>版本状态</th>
            <th>变更摘要</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>发布时间</th>
            <th>生效时间</th>
          </tr>
        </thead>
        <tbody>
          {detail.versions.map((version) => (
            <tr key={version.version}>
              <td>
                <strong>{version.version}</strong>
              </td>
              <td>{version.versionType}</td>
              <td>{version.status}</td>
              <td>{version.summary}</td>
              <td>{version.creator}</td>
              <td>{version.createdAt}</td>
              <td>{version.publishedAt}</td>
              <td>{version.effectiveAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

type CommodityManagementViewProps = {
  records: CommodityRecord[]
  pagedRecords: CommodityRecord[]
  currentPage: number
  pageCount: number
  statusFilter: CommodityStatus | CommodityFilter
  productTypeFilter: ProductType | CommodityFilter
  ownerFilter: string | CommodityFilter
  searchQuery: string
  productTypeOptions: ProductType[]
  ownerOptions: string[]
  onStatusFilterChange: (value: CommodityStatus | CommodityFilter) => void
  onProductTypeFilterChange: (value: ProductType | CommodityFilter) => void
  onOwnerFilterChange: (value: string | CommodityFilter) => void
  onSearchQueryChange: (value: string) => void
  onPageChange: (page: number) => void
  onCreateCommodity: () => void
  onOpenRecord: (record: CommodityRecord) => void
  onRecordAction: (action: 'edit' | 'delete', record: CommodityRecord) => void
}

function CommodityManagementView({
  records,
  pagedRecords,
  currentPage,
  pageCount,
  statusFilter,
  productTypeFilter,
  ownerFilter,
  searchQuery,
  productTypeOptions,
  ownerOptions,
  onStatusFilterChange,
  onProductTypeFilterChange,
  onOwnerFilterChange,
  onSearchQueryChange,
  onPageChange,
  onCreateCommodity,
  onOpenRecord,
  onRecordAction,
}: CommodityManagementViewProps) {
  return (
    <div className="commodity-management">
      <header className="commodity-management__toolbar" aria-label="商品筛选工具">
        <label className="commodity-management__search">
          <SearchIcon className="commodity-management__search-icon" />
          <input
            type="search"
            aria-label="搜索商品"
            value={searchQuery}
            placeholder="搜索商品名称、所属产品或负责人"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>

        <select
          className="commodity-management__select"
          aria-label="筛选商品状态"
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(
              event.currentTarget.value as CommodityStatus | CommodityFilter,
            )
          }
        >
          <option value="all">全部状态</option>
          {commodityStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选所属产品类型"
          value={productTypeFilter}
          onChange={(event) =>
            onProductTypeFilterChange(
              event.currentTarget.value as ProductType | CommodityFilter,
            )
          }
        >
          <option value="all">全部产品类型</option>
          {productTypeOptions.map((productType) => (
            <option key={productType} value={productType}>
              {productType}
            </option>
          ))}
        </select>

        <select
          className="commodity-management__select"
          aria-label="筛选商品负责人"
          value={ownerFilter}
          onChange={(event) => onOwnerFilterChange(event.currentTarget.value)}
        >
          <option value="all">全部负责人</option>
          {ownerOptions.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </select>

        <button
          type="button"
          className="commodity-management__create-button"
          onClick={onCreateCommodity}
        >
          + 新建商品
        </button>
      </header>

      <div className="commodity-management__table-wrap">
        <table className="commodity-management__table">
          <thead>
            <tr>
              <th>商品名称</th>
              <th>所属产品类型</th>
              <th>商品类型</th>
              <th>商品负责人</th>
              <th>更新时间</th>
              <th>创建时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pagedRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <button
                    type="button"
                    className="commodity-management__name-button"
                    onClick={() => onOpenRecord(record)}
                  >
                    <span className="visually-hidden">查看商品详情 </span>
                    <strong>{record.name}</strong>
                  </button>
                </td>
                <td>{record.productType}</td>
                <td>{record.commodityType}</td>
                <td>{record.owner}</td>
                <td>{record.updatedAt}</td>
                <td>{record.createdAt}</td>
                <td>
                  <span
                    className={`commodity-management__status commodity-management__status--${getCommodityStatusClassName(
                      record.status,
                    )}`}
                  >
                    {record.status}
                  </span>
                </td>
                <td>
                  <div className="commodity-management__actions">
                    <button
                      type="button"
                      className="commodity-management__action"
                      onClick={() => onRecordAction('edit', record)}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      className="commodity-management__action commodity-management__action--danger"
                      onClick={() => onRecordAction('delete', record)}
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="commodity-management__pagination">
        <span>共 {records.length} 条</span>
        <div className="commodity-management__pagination-controls">
          <button
            type="button"
            className="commodity-management__page-button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            上一页
          </button>
          <span>{currentPage} / {pageCount}</span>
          <button
            type="button"
            className="commodity-management__page-button"
            disabled={currentPage >= pageCount}
            onClick={() => onPageChange(currentPage + 1)}
          >
            下一页
          </button>
        </div>
      </footer>
    </div>
  )
}

type CommodityDetailViewProps = {
  record: CommodityRecord
  detail: CommodityDetailRecord
  activeTab: CommodityDetailTab
  onTabChange: (tab: CommodityDetailTab) => void
  onBack: () => void
  onUpdate: () => void
}

function CommodityDetailView({
  record,
  detail,
  activeTab,
  onTabChange,
  onBack,
  onUpdate,
}: CommodityDetailViewProps) {
  const [billingTypeFilter, setBillingTypeFilter] = useState<
    BillingItemType | CommodityFilter
  >('all')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<
    PaymentType | CommodityFilter
  >('all')
  const [billingSearchQuery, setBillingSearchQuery] = useState('')
  const visibleBillingItems = useMemo(
    () =>
      filterBillingItems(
        detail.billingItems,
        billingTypeFilter,
        paymentTypeFilter,
        billingSearchQuery,
      ),
    [billingSearchQuery, billingTypeFilter, detail.billingItems, paymentTypeFilter],
  )

  return (
    <article className="commodity-detail" aria-label={`${record.name} 商品详情`}>
      <header className="commodity-detail__header">
        <div className="commodity-detail__heading">
          <button
            type="button"
            className="commodity-detail__back-button"
            onClick={onBack}
          >
            返回商品列表
          </button>
          <h1>{record.name}</h1>
          <p>{detail.description}</p>
          <dl className="commodity-detail__summary">
            <div>
              <dt>所属产品</dt>
              <dd>{record.productType}</dd>
            </div>
            <div>
              <dt>负责人</dt>
              <dd>{record.owner}</dd>
            </div>
            <div>
              <dt>状态</dt>
              <dd>
                <span
                  className={`commodity-management__status commodity-management__status--${getCommodityStatusClassName(
                    record.status,
                  )}`}
                >
                  {record.status}
                </span>
              </dd>
            </div>
            <div>
              <dt>更新时间</dt>
              <dd>{record.updatedAt}</dd>
            </div>
          </dl>
        </div>
        <button
          type="button"
          className="commodity-detail__update-button"
          onClick={onUpdate}
        >
          更新商品
        </button>
      </header>

      <nav className="commodity-detail__tabs" aria-label="商品详情导航">
        {commodityDetailTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={`commodity-detail__tab${
              activeTab === tab.id ? ' commodity-detail__tab--active' : ''
            }`}
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className="commodity-detail__panel">
        {activeTab === 'overview' ? <CommodityOverview detail={detail} /> : null}
        {activeTab === 'billing' ? (
          <BillingItemsTable
            items={visibleBillingItems}
            typeFilter={billingTypeFilter}
            paymentTypeFilter={paymentTypeFilter}
            searchQuery={billingSearchQuery}
            onTypeFilterChange={setBillingTypeFilter}
            onPaymentTypeFilterChange={setPaymentTypeFilter}
            onSearchQueryChange={setBillingSearchQuery}
          />
        ) : null}
        {activeTab === 'cost' ? <CostDiscountTable detail={detail} /> : null}
        {activeTab === 'versions' ? <VersionHistoryTable detail={detail} /> : null}
      </section>
    </article>
  )
}

function CommodityOverview({ detail }: { detail: CommodityDetailRecord }) {
  return (
    <dl className="commodity-detail__overview-grid">
      {detail.overview.map((field) => (
        <div key={field.label} className="commodity-detail__overview-item">
          <dt>{field.label}</dt>
          <dd>{field.value}</dd>
        </div>
      ))}
    </dl>
  )
}

type BillingItemsTableProps = {
  items: BillingItemRecord[]
  typeFilter: BillingItemType | CommodityFilter
  paymentTypeFilter: PaymentType | CommodityFilter
  searchQuery: string
  onTypeFilterChange: (value: BillingItemType | CommodityFilter) => void
  onPaymentTypeFilterChange: (value: PaymentType | CommodityFilter) => void
  onSearchQueryChange: (value: string) => void
}

function BillingItemsTable({
  items,
  typeFilter,
  paymentTypeFilter,
  searchQuery,
  onTypeFilterChange,
  onPaymentTypeFilterChange,
  onSearchQueryChange,
}: BillingItemsTableProps) {
  return (
    <div className="commodity-detail__stack">
      <header
        className="commodity-detail__filters"
        aria-label="计费项筛选工具"
      >
        <label className="commodity-management__search">
          <SearchIcon className="commodity-management__search-icon" />
          <input
            type="search"
            aria-label="搜索计费项"
            value={searchQuery}
            placeholder="搜索计费项名称、计费项编号、描述或费用口径"
            onChange={(event) => onSearchQueryChange(event.currentTarget.value)}
          />
        </label>
        <select
          className="commodity-management__select"
          aria-label="筛选计费项类型"
          value={typeFilter}
          onChange={(event) =>
            onTypeFilterChange(
              event.currentTarget.value as BillingItemType | CommodityFilter,
            )
          }
        >
          <option value="all">全部计费项类型</option>
          {billingItemTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          className="commodity-management__select"
          aria-label="筛选计费项付费类型"
          value={paymentTypeFilter}
          onChange={(event) =>
            onPaymentTypeFilterChange(
              event.currentTarget.value as PaymentType | CommodityFilter,
            )
          }
        >
          <option value="all">全部付费类型</option>
          {paymentTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </header>
      <div className="commodity-detail__table-wrap">
        <table className="commodity-detail__table">
          <thead>
            <tr>
              <th>计费项名称</th>
              <th>计费项编号</th>
              <th>计费类型</th>
              <th>容量/时长</th>
              <th>单位</th>
              <th>计量口径</th>
              <th>付费类型</th>
              <th>结算周期</th>
              <th>币种</th>
              <th>刊例价</th>
              <th>折扣口径</th>
              <th>最小购买量</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>描述</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                </td>
                <td>{item.code}</td>
                <td>{item.chargeType}</td>
                <td>{item.chargeSpec}</td>
                <td>{item.unit}</td>
                <td>{item.meter}</td>
                <td>{item.paymentType}</td>
                <td>{item.billingCycle}</td>
                <td>{item.currency}</td>
                <td>{item.publishedPrice}</td>
                <td>{item.discountBasis}</td>
                <td>{item.minimumPurchase}</td>
                <td>{item.status}</td>
                <td>{item.updatedAt}</td>
                <td>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CostDiscountTable({ detail }: { detail: CommodityDetailRecord }) {
  return (
    <div className="commodity-detail__wide-table-wrap">
      <table className="commodity-detail__table commodity-detail__cost-table">
        <thead>
          <tr>
            <th>计费项</th>
            <th>计费项编号</th>
            <th>自由折扣线</th>
            <th>一般折扣线</th>
            <th>产品折扣线</th>
            <th>出厂价折扣线</th>
            <th>总目标成本</th>
            <th>资源成本</th>
            <th>L1人天</th>
            <th>L2人天</th>
            <th>CSM人天</th>
            <th>交付人天</th>
            <th>自由折扣毛利率</th>
            <th>一般折扣毛利率</th>
            <th>产品折扣毛利率</th>
            <th>出厂价折扣毛利率</th>
            <th>成本口径</th>
            <th>更新时间</th>
          </tr>
        </thead>
        <tbody>
          {detail.costDiscounts.map((record) => (
            <tr key={record.billingItemCode}>
              <td>
                <strong>{record.billingItemName}</strong>
              </td>
              <td>{record.billingItemCode}</td>
              <td>{record.freeDiscountLine}</td>
              <td>{record.standardDiscountLine}</td>
              <td>{record.productDiscountLine}</td>
              <td>{record.factoryDiscountLine}</td>
              <td>{record.totalTargetCost}</td>
              <td>{record.resourceCost}</td>
              <td>{record.l1Days}</td>
              <td>{record.l2Days}</td>
              <td>{record.csmDays}</td>
              <td>{record.deliveryDays}</td>
              <td>{record.freeGrossMargin}</td>
              <td>{record.standardGrossMargin}</td>
              <td>{record.productGrossMargin}</td>
              <td>{record.factoryGrossMargin}</td>
              <td>{record.costBasis}</td>
              <td>{record.updatedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VersionHistoryTable({ detail }: { detail: CommodityDetailRecord }) {
  return (
    <div className="commodity-detail__table-wrap">
      <table className="commodity-detail__table">
        <thead>
          <tr>
            <th>版本号</th>
            <th>版本类型</th>
            <th>版本状态</th>
            <th>变更摘要</th>
            <th>创建人</th>
            <th>创建时间</th>
            <th>发布时间</th>
            <th>生效时间</th>
          </tr>
        </thead>
        <tbody>
          {detail.versions.map((version) => (
            <tr key={version.version}>
              <td>
                <strong>{version.version}</strong>
              </td>
              <td>{version.versionType}</td>
              <td>{version.status}</td>
              <td>{version.summary}</td>
              <td>{version.creator}</td>
              <td>{version.createdAt}</td>
              <td>{version.publishedAt}</td>
              <td>{version.effectiveAt}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function filterBillingItems(
  items: BillingItemRecord[],
  typeFilter: BillingItemType | CommodityFilter,
  paymentTypeFilter: PaymentType | CommodityFilter,
  searchQuery: string,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase()

  return items.filter((item) => {
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false
    }

    if (paymentTypeFilter !== 'all' && item.paymentType !== paymentTypeFilter) {
      return false
    }

    if (!normalizedQuery) {
      return true
    }

    return [
      item.name,
      item.code,
      item.type,
      item.meteringContent,
      item.description,
      item.chargeType,
      item.chargeSpec,
      item.meter,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  })
}

function getCommodityStatusClassName(status: CommodityStatus) {
  switch (status) {
    case '未发布':
      return 'draft'
    case '已发布':
      return 'published'
    case '下架中':
      return 'unpublishing'
    case '下架':
      return 'unpublished'
  }
}

export default ProductManagementPlatformPage
