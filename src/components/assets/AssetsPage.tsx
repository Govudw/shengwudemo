import { useMemo, useState } from 'react'
import {
  assetMenuSections,
  dataAssetRecords,
  experimentAssetRecords,
  fileAssetRecords,
  getAssetMenuItem,
  isFileAssetItem,
  knowledgeBaseRecords,
  modelAssetRecords,
  projectFileFolders,
  xtrimoModelRecords,
} from '../../data/assetsMockData'
import type {
  AssetScope,
  DataAssetRecord,
  ExperimentAssetRecord,
  ExperimentAssetKind,
  FileAssetRecord,
  KnowledgeBaseKind,
  KnowledgeBaseRecord,
  KnowledgeBaseStatus,
  ModelAssetRecord,
  XtrimoCapability,
  XtrimoEntity,
  XtrimoModelRecord,
  XtrimoModelStatus,
} from '../../data/assetsMockData'
import type {
  AssetMenuItemId,
  AssetsExperimentViewMode,
  AssetsFileViewMode,
  AssetsSection,
  KnowledgeAssetItemId,
} from '../../store/demoStoreLogic'
import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FolderIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
} from '../icons'

type AssetsPageProps = {
  activeSection: AssetsSection
  activeItem: AssetMenuItemId
  fileViewMode: AssetsFileViewMode
  experimentViewMode: AssetsExperimentViewMode
  openFolderId: string | null
  xtrimoRecommendationsExpanded: boolean
  onSelectionChange: (section: AssetsSection, item: AssetMenuItemId) => void
  onFileViewModeChange: (mode: AssetsFileViewMode) => void
  onExperimentViewModeChange: (mode: AssetsExperimentViewMode) => void
  onOpenFolderChange: (folderId: string | null) => void
  onXtrimoRecommendationsExpandedChange: (expanded: boolean) => void
  onNotify: (message: string) => void
}

const assetScopeLabel = {
  public: '公开范围',
  project: '项目范围',
} as const

type KnowledgeDetailTab = 'overview' | 'files' | 'versions'
type FileUpdatedTimeFilter = 'all' | 'last30Minutes' | 'lastHour' | 'today'

function AssetsPage({
  activeSection,
  activeItem,
  fileViewMode,
  experimentViewMode,
  openFolderId,
  xtrimoRecommendationsExpanded,
  onSelectionChange,
  onFileViewModeChange,
  onExperimentViewModeChange,
  onOpenFolderChange,
  onXtrimoRecommendationsExpandedChange,
  onNotify,
}: AssetsPageProps) {
  const [query, setQuery] = useState('')
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const [selectedFileKind, setSelectedFileKind] = useState('all')
  const [selectedFileScope, setSelectedFileScope] = useState<AssetScope | 'all'>(
    'all',
  )
  const [selectedFileStatus, setSelectedFileStatus] = useState('all')
  const [selectedFileUpdatedTime, setSelectedFileUpdatedTime] =
    useState<FileUpdatedTimeFilter>('all')
  const [selectedKnowledgeKind, setSelectedKnowledgeKind] = useState<
    KnowledgeBaseKind | 'all'
  >('all')
  const [selectedKnowledgeStatus, setSelectedKnowledgeStatus] =
    useState<KnowledgeBaseStatus | 'all'>('all')
  const [selectedKnowledgeScope, setSelectedKnowledgeScope] = useState<
    AssetScope | 'all'
  >('all')
  const [selectedDataScope, setSelectedDataScope] = useState<AssetScope | 'all'>(
    'all',
  )
  const [selectedDataOwner, setSelectedDataOwner] = useState('all')
  const [selectedExperimentKind, setSelectedExperimentKind] = useState<
    ExperimentAssetKind | 'all'
  >('all')
  const [selectedExperimentStatus, setSelectedExperimentStatus] = useState('all')
  const [selectedExperimentScope, setSelectedExperimentScope] = useState<
    AssetScope | 'all'
  >('all')
  const [selectedModelStatus, setSelectedModelStatus] = useState('all')
  const [selectedModelScope, setSelectedModelScope] = useState<AssetScope | 'all'>(
    'all',
  )
  const [selectedKnowledgeBaseId, setSelectedKnowledgeBaseId] = useState<string | null>(
    null,
  )
  const [selectedKnowledgeTab, setSelectedKnowledgeTab] =
    useState<KnowledgeDetailTab>('overview')
  const activeItemMeta = getAssetMenuItem(activeSection, activeItem)
  const isXtrimoView = activeSection === 'model' && activeItem === 'xtrimo'
  const isOracleView = activeSection === 'model' && activeItem === 'oracles'
  const hideUploadAction =
    isXtrimoView || (activeSection === 'model' && activeItem === 'public-models')
  const newAssetActions = getNewAssetMenuActions(activeSection, activeItem)

  function resetAssetFilters() {
    setAdvancedFiltersOpen(false)
    setSelectedFileKind('all')
    setSelectedFileScope('all')
    setSelectedFileStatus('all')
    setSelectedFileUpdatedTime('all')
    setSelectedKnowledgeKind('all')
    setSelectedKnowledgeStatus('all')
    setSelectedKnowledgeScope('all')
    setSelectedDataScope('all')
    setSelectedDataOwner('all')
    setSelectedExperimentKind('all')
    setSelectedExperimentStatus('all')
    setSelectedExperimentScope('all')
    setSelectedModelStatus('all')
    setSelectedModelScope('all')
  }

  function handleSelection(section: AssetsSection, item: AssetMenuItemId) {
    setQuery('')
    setNewMenuOpen(false)
    setMoreMenuOpen(false)
    resetAssetFilters()
    setSelectedKnowledgeBaseId(null)
    setSelectedKnowledgeTab('overview')
    onSelectionChange(section, item)
  }

  function handleMockAction(message: string) {
    setNewMenuOpen(false)
    setMoreMenuOpen(false)
    setUploadDialogOpen(false)
    onNotify(message)
  }

  return (
    <div className="assets-workbench">
      <aside className="assets-sidebar" aria-label="Assets navigation">
        <div className="assets-sidebar__heading">
          <span className="assets-sidebar__eyebrow">Assets</span>
          <strong>资产工作台</strong>
        </div>
        <nav className="assets-sidebar__nav">
          {assetMenuSections.map((section) => (
            <div className="assets-sidebar__section" key={section.id}>
              <button
                type="button"
                className={`assets-sidebar__section-button${
                  section.id === activeSection
                    ? ' assets-sidebar__section-button--active'
                    : ''
                }`}
                aria-label={section.label}
                onClick={() => handleSelection(section.id, section.items[0].id)}
              >
                <AssetSectionIcon section={section.id} />
                <span>{section.label}</span>
                <ChevronRightIcon className="assets-sidebar__chevron" />
              </button>
              {section.id === activeSection ? (
                <div className="assets-sidebar__items">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`assets-sidebar__item${
                        item.id === activeItem ? ' assets-sidebar__item--active' : ''
                      }`}
                      onClick={() => handleSelection(section.id, item.id)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </aside>

      <main
        className={`assets-main${isXtrimoView ? ' assets-main--xtrimo' : ''}`}
        aria-label="Assets workbench"
      >
        <header className="assets-main__header assets-main__header--workspace-bar">
          <div className="assets-main__title">
            <h1>{activeItemMeta?.label}</h1>
          </div>
          <div className="assets-main__actions">
            {!isXtrimoView && !isOracleView ? (
              <>
                <div className="assets-action-menu">
                  <button
                    type="button"
                    className="assets-action-button assets-action-button--primary"
                    aria-haspopup="menu"
                    aria-expanded={newMenuOpen}
                    onClick={() => {
                      setNewMenuOpen((isOpen) => !isOpen)
                      setMoreMenuOpen(false)
                    }}
                  >
                    <PlusIcon className="assets-action-button__icon" />
                    新建
                  </button>
                  {newMenuOpen ? (
                    <div className="assets-popover assets-popover--compact">
                      {newAssetActions.map((action) => (
                        <button
                          type="button"
                          key={action.label}
                          onClick={() => handleMockAction(action.message)}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                {!hideUploadAction ? (
                  <button
                    type="button"
                    className="assets-action-button"
                    onClick={() => setUploadDialogOpen(true)}
                  >
                    上传
                  </button>
                ) : null}
              </>
            ) : null}
            <div className="assets-action-menu">
              <button
                type="button"
                className="assets-icon-button"
                aria-label="更多资产操作"
                aria-haspopup="menu"
                aria-expanded={moreMenuOpen}
                onClick={() => {
                  setMoreMenuOpen((isOpen) => !isOpen)
                  setNewMenuOpen(false)
                }}
              >
                <MoreHorizontalIcon className="assets-icon-button__icon" />
              </button>
              {moreMenuOpen ? (
                <div className="assets-popover assets-popover--compact assets-popover--right">
                  <button
                    type="button"
                    onClick={() => handleMockAction('分享视图尚未接入当前工作区')}
                  >
                    分享当前视图
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockAction('资产导出尚未接入当前工作区')}
                  >
                    导出清单
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockAction('显示字段尚未接入当前工作区')}
                  >
                    显示字段
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {!isXtrimoView ? (
          <AssetsToolbar
            activeSection={activeSection}
            activeItem={activeItem}
            query={query}
            advancedFiltersOpen={advancedFiltersOpen}
            fileViewMode={fileViewMode}
            experimentViewMode={experimentViewMode}
            selectedFileKind={selectedFileKind}
            selectedFileScope={selectedFileScope}
            selectedFileStatus={selectedFileStatus}
            selectedFileUpdatedTime={selectedFileUpdatedTime}
            selectedKnowledgeKind={selectedKnowledgeKind}
            selectedKnowledgeStatus={selectedKnowledgeStatus}
            selectedKnowledgeScope={selectedKnowledgeScope}
            selectedDataScope={selectedDataScope}
            selectedDataOwner={selectedDataOwner}
            selectedExperimentKind={selectedExperimentKind}
            selectedExperimentStatus={selectedExperimentStatus}
            selectedExperimentScope={selectedExperimentScope}
            selectedModelStatus={selectedModelStatus}
            selectedModelScope={selectedModelScope}
            onQueryChange={setQuery}
            onAdvancedFiltersOpenChange={setAdvancedFiltersOpen}
            onFileViewModeChange={onFileViewModeChange}
            onExperimentViewModeChange={onExperimentViewModeChange}
            onFileKindChange={setSelectedFileKind}
            onFileScopeChange={setSelectedFileScope}
            onFileStatusChange={setSelectedFileStatus}
            onFileUpdatedTimeChange={setSelectedFileUpdatedTime}
            onKnowledgeKindChange={setSelectedKnowledgeKind}
            onKnowledgeStatusChange={setSelectedKnowledgeStatus}
            onKnowledgeScopeChange={setSelectedKnowledgeScope}
            onDataScopeChange={setSelectedDataScope}
            onDataOwnerChange={setSelectedDataOwner}
            onExperimentKindChange={setSelectedExperimentKind}
            onExperimentStatusChange={setSelectedExperimentStatus}
            onExperimentScopeChange={setSelectedExperimentScope}
            onModelStatusChange={setSelectedModelStatus}
            onModelScopeChange={setSelectedModelScope}
          />
        ) : null}

        <AssetContent
          activeItem={activeItem}
          fileViewMode={fileViewMode}
          experimentViewMode={experimentViewMode}
          openFolderId={openFolderId}
          query={query}
          selectedFileKind={selectedFileKind}
          selectedFileScope={selectedFileScope}
          selectedFileStatus={selectedFileStatus}
          selectedFileUpdatedTime={selectedFileUpdatedTime}
          selectedKnowledgeKind={selectedKnowledgeKind}
          selectedKnowledgeStatus={selectedKnowledgeStatus}
          selectedKnowledgeScope={selectedKnowledgeScope}
          selectedDataScope={selectedDataScope}
          selectedDataOwner={selectedDataOwner}
          selectedExperimentKind={selectedExperimentKind}
          selectedExperimentStatus={selectedExperimentStatus}
          selectedExperimentScope={selectedExperimentScope}
          selectedModelStatus={selectedModelStatus}
          selectedModelScope={selectedModelScope}
          xtrimoRecommendationsExpanded={xtrimoRecommendationsExpanded}
          selectedKnowledgeBaseId={selectedKnowledgeBaseId}
          selectedKnowledgeTab={selectedKnowledgeTab}
          onKnowledgeBaseSelect={(recordId) => {
            setSelectedKnowledgeBaseId(recordId)
            setSelectedKnowledgeTab('overview')
          }}
          onKnowledgeBaseBack={() => {
            setSelectedKnowledgeBaseId(null)
            setSelectedKnowledgeTab('overview')
          }}
          onKnowledgeTabChange={setSelectedKnowledgeTab}
          onQueryChange={setQuery}
          onXtrimoRecommendationsExpandedChange={
            onXtrimoRecommendationsExpandedChange
          }
          onOpenFolderChange={onOpenFolderChange}
          onNotify={onNotify}
        />
      </main>

      {uploadDialogOpen ? (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="dialog-panel dialog-panel--assets-upload"
            role="dialog"
            aria-modal="true"
            aria-labelledby="assets-upload-title"
          >
            <div className="dialog-header">
              <h2 id="assets-upload-title">上传到文件空间</h2>
              <button
                type="button"
                className="dialog-close"
                aria-label="关闭上传弹窗"
                onClick={() => setUploadDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <p className="assets-upload__hint">
              支持文档、数据表格和图像文件。上传后的对象默认进入项目文件空间，
              需要资产化时再登记为 File Asset。
            </p>
            <div className="assets-upload__types">
              <span>PDF / DOCX / MD</span>
              <span>CSV / XLSX / PARQUET</span>
              <span>PNG / JPG / SVG</span>
            </div>
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-button"
                onClick={() => setUploadDialogOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="dialog-button dialog-button--primary"
                onClick={() => handleMockAction('模拟上传已完成')}
              >
                模拟上传
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

function AssetsToolbar({
  activeSection,
  activeItem,
  query,
  advancedFiltersOpen,
  fileViewMode,
  experimentViewMode,
  selectedFileKind,
  selectedFileScope,
  selectedFileStatus,
  selectedFileUpdatedTime,
  selectedKnowledgeKind,
  selectedKnowledgeStatus,
  selectedKnowledgeScope,
  selectedDataScope,
  selectedDataOwner,
  selectedExperimentKind,
  selectedExperimentStatus,
  selectedExperimentScope,
  selectedModelStatus,
  selectedModelScope,
  onQueryChange,
  onAdvancedFiltersOpenChange,
  onFileViewModeChange,
  onExperimentViewModeChange,
  onFileKindChange,
  onFileScopeChange,
  onFileStatusChange,
  onFileUpdatedTimeChange,
  onKnowledgeKindChange,
  onKnowledgeStatusChange,
  onKnowledgeScopeChange,
  onDataScopeChange,
  onDataOwnerChange,
  onExperimentKindChange,
  onExperimentStatusChange,
  onExperimentScopeChange,
  onModelStatusChange,
  onModelScopeChange,
}: {
  activeSection: AssetsSection
  activeItem: AssetMenuItemId
  query: string
  advancedFiltersOpen: boolean
  fileViewMode: AssetsFileViewMode
  experimentViewMode: AssetsExperimentViewMode
  selectedFileKind: string
  selectedFileScope: AssetScope | 'all'
  selectedFileStatus: string
  selectedFileUpdatedTime: FileUpdatedTimeFilter
  selectedKnowledgeKind: KnowledgeBaseKind | 'all'
  selectedKnowledgeStatus: KnowledgeBaseStatus | 'all'
  selectedKnowledgeScope: AssetScope | 'all'
  selectedDataScope: AssetScope | 'all'
  selectedDataOwner: string
  selectedExperimentKind: ExperimentAssetKind | 'all'
  selectedExperimentStatus: string
  selectedExperimentScope: AssetScope | 'all'
  selectedModelStatus: string
  selectedModelScope: AssetScope | 'all'
  onQueryChange: (query: string) => void
  onAdvancedFiltersOpenChange: (isOpen: boolean) => void
  onFileViewModeChange: (mode: AssetsFileViewMode) => void
  onExperimentViewModeChange: (mode: AssetsExperimentViewMode) => void
  onFileKindChange: (kind: string) => void
  onFileScopeChange: (scope: AssetScope | 'all') => void
  onFileStatusChange: (status: string) => void
  onFileUpdatedTimeChange: (updatedTime: FileUpdatedTimeFilter) => void
  onKnowledgeKindChange: (kind: KnowledgeBaseKind | 'all') => void
  onKnowledgeStatusChange: (status: KnowledgeBaseStatus | 'all') => void
  onKnowledgeScopeChange: (scope: AssetScope | 'all') => void
  onDataScopeChange: (scope: AssetScope | 'all') => void
  onDataOwnerChange: (owner: string) => void
  onExperimentKindChange: (kind: ExperimentAssetKind | 'all') => void
  onExperimentStatusChange: (status: string) => void
  onExperimentScopeChange: (scope: AssetScope | 'all') => void
  onModelStatusChange: (status: string) => void
  onModelScopeChange: (scope: AssetScope | 'all') => void
}) {
  const fileKindOptions = Array.from(
    new Set(fileAssetRecords.map((record) => record.kind)),
  ).sort((left, right) => left.localeCompare(right))
  const dataOwnerOptions = Array.from(
    new Set(dataAssetRecords.map((record) => record.owner)),
  ).sort((left, right) => left.localeCompare(right))
  const experimentRecordsForItem = isExperimentAssetItem(activeItem)
    ? experimentAssetRecords.filter((record) => record.category === activeItem)
    : []
  const experimentKindOptions = Array.from(
    new Set(experimentRecordsForItem.map((record) => record.kind)),
  )
  const experimentStatusOptions = Array.from(
    new Set(experimentRecordsForItem.map((record) => record.status)),
  )
  const modelRecordsForItem =
    activeSection === 'model'
      ? getModelRecordsForItem(activeItem as ModelAssetRecord['category'])
      : []
  const modelStatusOptions = Array.from(
    new Set(modelRecordsForItem.map((record) => record.status)),
  )
  const searchLabel = getAssetsSearchLabel(activeSection)
  const advancedFilterCount = getAssetsAdvancedFilterCount(
    activeSection,
    selectedFileScope,
    selectedFileStatus,
    selectedKnowledgeScope,
    selectedExperimentScope,
  )
  const advancedFilterLabel =
    advancedFilterCount > 0 ? `更多筛选 ${advancedFilterCount}` : '更多筛选'
  const hasAdvancedFilters =
    isFileAssetItem(activeItem) ||
    isKnowledgeBaseItem(activeItem) ||
    isExperimentAssetItem(activeItem)

  return (
    <section className="assets-toolbar" aria-label="Assets tools">
      <label className="assets-search">
        <SearchIcon className="assets-search__icon" />
        <input
          aria-label={searchLabel}
          value={query}
          placeholder={searchLabel}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>

      <div className="assets-toolbar__controls">
        {isFileAssetItem(activeItem) ? (
          <>
            <select
              className="assets-filter-select"
              aria-label="筛选文件类型"
              value={selectedFileKind}
              onChange={(event) => onFileKindChange(event.currentTarget.value)}
            >
              <option value="all">全部类型</option>
              {fileKindOptions.map((kind) => (
                <option key={kind} value={kind}>
                  {kind.toUpperCase()}
                </option>
              ))}
            </select>
            <select
              className="assets-filter-select"
              aria-label="筛选文件更新时间"
              value={selectedFileUpdatedTime}
              onChange={(event) =>
                onFileUpdatedTimeChange(
                  event.currentTarget.value as FileUpdatedTimeFilter,
                )
              }
            >
              <option value="all">全部更新时间</option>
              <option value="last30Minutes">近 30 分钟</option>
              <option value="lastHour">近 1 小时</option>
              <option value="today">今天</option>
            </select>
          </>
        ) : null}

        {isKnowledgeBaseItem(activeItem) ? (
          <>
            <select
              className="assets-filter-select"
              aria-label="筛选知识库类型"
              value={selectedKnowledgeKind}
              onChange={(event) =>
                onKnowledgeKindChange(
                  event.currentTarget.value as KnowledgeBaseKind | 'all',
                )
              }
            >
              <option value="all">全部类型</option>
              {Object.entries(knowledgeKindLabels).map(([kind, label]) => (
                <option key={kind} value={kind}>
                  {label}
                </option>
              ))}
            </select>
            <select
              className="assets-filter-select"
              aria-label="筛选知识库状态"
              value={selectedKnowledgeStatus}
              onChange={(event) =>
                onKnowledgeStatusChange(
                  event.currentTarget.value as KnowledgeBaseStatus | 'all',
                )
              }
            >
              {knowledgeStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? '全部状态' : status}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {['datasets', 'tables', 'analysis-results', 'catalog'].includes(
          activeItem,
        ) ? (
          <>
            <ScopeSelect
              value={selectedDataScope}
              ariaLabel="筛选数据范围"
              onChange={onDataScopeChange}
            />
            <select
              className="assets-filter-select"
              aria-label="筛选数据负责人"
              value={selectedDataOwner}
              onChange={(event) => onDataOwnerChange(event.currentTarget.value)}
            >
              <option value="all">全部负责人</option>
              {dataOwnerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {isExperimentAssetItem(activeItem) ? (
          <>
            <select
              className="assets-filter-select"
              aria-label="筛选实验类型"
              value={selectedExperimentKind}
              onChange={(event) =>
                onExperimentKindChange(
                  event.currentTarget.value as ExperimentAssetKind | 'all',
                )
              }
            >
              <option value="all">全部类型</option>
              {experimentKindOptions.map((kind) => (
                <option key={kind} value={kind}>
                  {experimentKindLabels[kind]}
                </option>
              ))}
            </select>
            <select
              className="assets-filter-select"
              aria-label="筛选实验状态"
              value={selectedExperimentStatus}
              onChange={(event) => onExperimentStatusChange(event.currentTarget.value)}
            >
              <option value="all">全部状态</option>
              {experimentStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </>
        ) : null}

        {activeSection === 'model' && activeItem !== 'xtrimo' ? (
          <>
            <select
              className="assets-filter-select"
              aria-label="筛选模型状态"
              value={selectedModelStatus}
              onChange={(event) => onModelStatusChange(event.currentTarget.value)}
            >
              <option value="all">全部状态</option>
              {modelStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <ScopeSelect
              value={selectedModelScope}
              ariaLabel="筛选模型范围"
              onChange={onModelScopeChange}
            />
          </>
        ) : null}

        {hasAdvancedFilters ? (
          <div className="assets-filter-menu">
            <button
              type="button"
              className="assets-filter-select assets-more-filter-button"
              aria-expanded={advancedFiltersOpen}
              onClick={() => onAdvancedFiltersOpenChange(!advancedFiltersOpen)}
            >
              {advancedFilterLabel}
            </button>
            {advancedFiltersOpen ? (
              <div className="assets-advanced-filters" aria-label="更多筛选">
                {isFileAssetItem(activeItem) ? (
                  <>
                    <label>
                      <span>范围</span>
                      <ScopeSelect
                        value={selectedFileScope}
                        ariaLabel="筛选文件范围"
                        onChange={onFileScopeChange}
                      />
                    </label>
                    <label>
                      <span>状态</span>
                      <select
                        className="assets-filter-select"
                        aria-label="筛选文件状态"
                        value={selectedFileStatus}
                        onChange={(event) =>
                          onFileStatusChange(event.currentTarget.value)
                        }
                      >
                        <option value="all">全部状态</option>
                        <option value="ready">可用</option>
                        <option value="processing">处理中</option>
                        <option value="archived">已归档</option>
                      </select>
                    </label>
                    <label>
                      <span>显示方式</span>
                      <ViewModeToggle
                        label="文件显示方式"
                        leftLabel="列表"
                        rightLabel="网格"
                        activeValue={fileViewMode}
                        leftValue="list"
                        rightValue="grid"
                        onChange={onFileViewModeChange}
                      />
                    </label>
                  </>
                ) : null}
                {isKnowledgeBaseItem(activeItem) ? (
                  <label>
                    <span>范围</span>
                    <ScopeSelect
                      value={selectedKnowledgeScope}
                      ariaLabel="筛选知识库范围"
                      onChange={onKnowledgeScopeChange}
                    />
                  </label>
                ) : null}
                {isExperimentAssetItem(activeItem) ? (
                  <>
                    <label>
                      <span>范围</span>
                      <ScopeSelect
                        value={selectedExperimentScope}
                        ariaLabel="筛选实验范围"
                        onChange={onExperimentScopeChange}
                      />
                    </label>
                    <label>
                      <span>显示方式</span>
                      <ViewModeToggle
                        label="实验资产显示方式"
                        leftLabel="卡片"
                        rightLabel="表格"
                        activeValue={experimentViewMode}
                        leftValue="grid"
                        rightValue="table"
                        onChange={onExperimentViewModeChange}
                      />
                    </label>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function ScopeSelect({
  value,
  ariaLabel,
  onChange,
}: {
  value: AssetScope | 'all'
  ariaLabel: string
  onChange: (scope: AssetScope | 'all') => void
}) {
  return (
    <select
      className="assets-filter-select"
      aria-label={ariaLabel}
      value={value}
      onChange={(event) =>
        onChange(event.currentTarget.value as AssetScope | 'all')
      }
    >
      <option value="all">全部范围</option>
      <option value="public">公开范围</option>
      <option value="project">项目范围</option>
    </select>
  )
}

function ViewModeToggle<Value extends string>({
  label,
  leftLabel,
  rightLabel,
  activeValue,
  leftValue,
  rightValue,
  onChange,
}: {
  label: string
  leftLabel: string
  rightLabel: string
  activeValue: Value
  leftValue: Value
  rightValue: Value
  onChange: (value: Value) => void
}) {
  return (
    <div className="assets-view-toggle" aria-label={label}>
      <button
        type="button"
        className={activeValue === leftValue ? 'active' : ''}
        aria-pressed={activeValue === leftValue}
        onClick={() => onChange(leftValue)}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        className={activeValue === rightValue ? 'active' : ''}
        aria-pressed={activeValue === rightValue}
        onClick={() => onChange(rightValue)}
      >
        {rightLabel}
      </button>
    </div>
  )
}

function AssetContent({
  activeItem,
  fileViewMode,
  experimentViewMode,
  openFolderId,
  query,
  selectedFileKind,
  selectedFileScope,
  selectedFileStatus,
  selectedFileUpdatedTime,
  selectedKnowledgeKind,
  selectedKnowledgeStatus,
  selectedKnowledgeScope,
  selectedDataScope,
  selectedDataOwner,
  selectedExperimentKind,
  selectedExperimentStatus,
  selectedExperimentScope,
  selectedModelStatus,
  selectedModelScope,
  xtrimoRecommendationsExpanded,
  selectedKnowledgeBaseId,
  selectedKnowledgeTab,
  onKnowledgeBaseSelect,
  onKnowledgeBaseBack,
  onKnowledgeTabChange,
  onQueryChange,
  onXtrimoRecommendationsExpandedChange,
  onOpenFolderChange,
  onNotify,
}: {
  activeItem: AssetMenuItemId
  fileViewMode: AssetsFileViewMode
  experimentViewMode: AssetsExperimentViewMode
  openFolderId: string | null
  query: string
  selectedFileKind: string
  selectedFileScope: AssetScope | 'all'
  selectedFileStatus: string
  selectedFileUpdatedTime: FileUpdatedTimeFilter
  selectedKnowledgeKind: KnowledgeBaseKind | 'all'
  selectedKnowledgeStatus: KnowledgeBaseStatus | 'all'
  selectedKnowledgeScope: AssetScope | 'all'
  selectedDataScope: AssetScope | 'all'
  selectedDataOwner: string
  selectedExperimentKind: ExperimentAssetKind | 'all'
  selectedExperimentStatus: string
  selectedExperimentScope: AssetScope | 'all'
  selectedModelStatus: string
  selectedModelScope: AssetScope | 'all'
  xtrimoRecommendationsExpanded: boolean
  selectedKnowledgeBaseId: string | null
  selectedKnowledgeTab: KnowledgeDetailTab
  onKnowledgeBaseSelect: (recordId: string) => void
  onKnowledgeBaseBack: () => void
  onKnowledgeTabChange: (tab: KnowledgeDetailTab) => void
  onQueryChange: (query: string) => void
  onXtrimoRecommendationsExpandedChange: (expanded: boolean) => void
  onOpenFolderChange: (folderId: string | null) => void
  onNotify: (message: string) => void
}) {
  if (isFileAssetItem(activeItem)) {
    return (
      <FileSpaceView
        item={activeItem}
        viewMode={fileViewMode}
        openFolderId={openFolderId}
        query={query}
        selectedKind={selectedFileKind}
        selectedScope={selectedFileScope}
        selectedStatus={selectedFileStatus}
        selectedUpdatedTime={selectedFileUpdatedTime}
        onOpenFolderChange={onOpenFolderChange}
        onNotify={onNotify}
      />
    )
  }

  if (isKnowledgeBaseItem(activeItem)) {
    return (
      <KnowledgeBaseAssetsView
        item={activeItem}
        query={query}
        selectedKind={selectedKnowledgeKind}
        selectedStatus={selectedKnowledgeStatus}
        selectedScope={selectedKnowledgeScope}
        selectedRecordId={selectedKnowledgeBaseId}
        selectedTab={selectedKnowledgeTab}
        onRecordSelect={onKnowledgeBaseSelect}
        onBack={onKnowledgeBaseBack}
        onTabChange={onKnowledgeTabChange}
        onNotify={onNotify}
      />
    )
  }

  if (['datasets', 'tables', 'analysis-results', 'catalog'].includes(activeItem)) {
    return (
      <DataAssetsView
        item={activeItem as DataAssetRecord['category']}
        query={query}
        selectedScope={selectedDataScope}
        selectedOwner={selectedDataOwner}
        onNotify={onNotify}
      />
    )
  }

  if (isExperimentAssetItem(activeItem)) {
    return (
      <ExperimentAssetsView
        item={activeItem}
        viewMode={experimentViewMode}
        query={query}
        selectedKind={selectedExperimentKind}
        selectedStatus={selectedExperimentStatus}
        selectedScope={selectedExperimentScope}
        onNotify={onNotify}
      />
    )
  }

  return (
    <ModelAssetsView
      item={activeItem as ModelAssetRecord['category']}
      query={query}
      selectedStatus={selectedModelStatus}
      selectedScope={selectedModelScope}
      xtrimoRecommendationsExpanded={xtrimoRecommendationsExpanded}
      onQueryChange={onQueryChange}
      onXtrimoRecommendationsExpandedChange={onXtrimoRecommendationsExpandedChange}
      onNotify={onNotify}
    />
  )
}

function FileSpaceView({
  item,
  viewMode,
  openFolderId,
  query,
  selectedKind,
  selectedScope,
  selectedStatus,
  selectedUpdatedTime,
  onOpenFolderChange,
  onNotify,
}: {
  item: FileAssetRecordMenuItem
  viewMode: AssetsFileViewMode
  openFolderId: string | null
  query: string
  selectedKind: string
  selectedScope: AssetScope | 'all'
  selectedStatus: string
  selectedUpdatedTime: FileUpdatedTimeFilter
  onOpenFolderChange: (folderId: string | null) => void
  onNotify: (message: string) => void
}) {
  const activeFolder = projectFileFolders.find((folder) => folder.id === openFolderId)
  const folders = useMemo(
    () =>
      projectFileFolders.filter((folder) =>
        matchesQuery([folder.name, folder.projectName, folder.description], query),
      ),
    [query],
  )
  const records = useMemo(
    () =>
      getFileRecordsForItem(item, openFolderId).filter(
        (record) =>
          (selectedKind === 'all' || record.kind === selectedKind) &&
          (selectedScope === 'all' || record.scope === selectedScope) &&
          (selectedStatus === 'all' || record.status === selectedStatus) &&
          fileUpdatedTimeMatches(record.modifiedAt, selectedUpdatedTime) &&
          fileMatches(record, query),
      ),
    [
      item,
      openFolderId,
      query,
      selectedKind,
      selectedScope,
      selectedStatus,
      selectedUpdatedTime,
    ],
  )
  const showFolders = item === 'project-files' && !activeFolder

  return (
    <section className="assets-content">
      {activeFolder ? (
        <div className="assets-folder-path">
          <button type="button" onClick={() => onOpenFolderChange(null)}>
            项目文件
          </button>
          <ChevronRightIcon className="assets-folder-path__icon" />
          <span>{activeFolder.name}</span>
        </div>
      ) : null}
      {showFolders ? (
        <div className="assets-folder-grid" aria-label="项目文件夹">
          {folders.map((folder) => (
            <button
              type="button"
              className="assets-folder-card"
              key={folder.id}
              onClick={() => onOpenFolderChange(folder.id)}
            >
              <FolderIcon className="assets-folder-card__icon" />
              <span className="assets-folder-card__name">{folder.name}</span>
              <span className="assets-folder-card__meta">
                项目范围 · {folder.modifiedAt}
              </span>
              <span className="assets-folder-card__desc">{folder.itemCount} 项</span>
            </button>
          ))}
        </div>
      ) : null}
      <AssetListHeader
        title={activeFolder ? `${activeFolder.name} 文件` : getFileListTitle(item)}
        count={records.length}
      />
      {viewMode === 'grid' ? (
        <div className="assets-record-grid">
          {records.map((record) => (
            <FileRecordCard key={record.id} record={record} onNotify={onNotify} />
          ))}
        </div>
      ) : (
        <div className="assets-table" role="table" aria-label="文件列表">
          <div className="assets-table__row assets-table__row--head" role="row">
            <span role="columnheader">名称</span>
            <span role="columnheader">范围</span>
            <span role="columnheader">类型</span>
            <span role="columnheader">更新时间</span>
            <span role="columnheader">更多</span>
          </div>
          {records.map((record) => (
            <div className="assets-table__row" role="row" key={record.id}>
              <span className="assets-table__name" role="cell">
                <FileKindIcon kind={record.fileSpaceKind} />
                <span>
                  <strong>{record.name}</strong>
                </span>
              </span>
              <span role="cell">{assetScopeLabel[record.scope]}</span>
              <span role="cell">{record.kind.toUpperCase()}</span>
              <span role="cell">{record.modifiedAt}</span>
              <span role="cell">
                <button
                  type="button"
                  className="assets-row-action"
                  aria-label={`查看 ${record.name} 的更多操作`}
                  onClick={() => onNotify('资产操作尚未接入当前工作区')}
                >
                  <MoreHorizontalIcon className="assets-row-action__icon" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
      {records.length === 0 && (!showFolders || folders.length === 0) ? <EmptyState /> : null}
    </section>
  )
}

function DataAssetsView({
  item,
  query,
  selectedScope,
  selectedOwner,
  onNotify,
}: {
  item: DataAssetRecord['category']
  query: string
  selectedScope: AssetScope | 'all'
  selectedOwner: string
  onNotify: (message: string) => void
}) {
  const records = dataAssetRecords.filter(
    (record) =>
      record.category === item &&
      (selectedScope === 'all' || record.scope === selectedScope) &&
      (selectedOwner === 'all' || record.owner === selectedOwner) &&
      dataMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title="数据资产" count={records.length} />
      <div className="assets-table data-assets-table" role="table" aria-label="数据资产列表">
        <div
          className="assets-table__row assets-table__row--head assets-table__row--data"
          role="row"
        >
          <span role="columnheader">名称</span>
          <span role="columnheader">类型</span>
          <span role="columnheader">范围</span>
          <span role="columnheader">数量</span>
          <span role="columnheader">更新时间</span>
          <span role="columnheader">更多</span>
        </div>
        {records.map((record) => (
          <div
            className="assets-table__row assets-table__row--data"
            role="row"
            key={record.id}
          >
            <span className="assets-table__name" role="cell">
              <DatabaseIcon className="assets-record-card__icon" />
              <span>
                <strong>{record.name}</strong>
              </span>
            </span>
            <span role="cell">{dataAssetTypeLabels[record.category]}</span>
            <span role="cell">{assetScopeLabel[record.scope]}</span>
            <span role="cell">{record.rows}</span>
            <span role="cell">{record.updatedAt}</span>
            <span role="cell">
              <button
                type="button"
                className="assets-row-action"
                aria-label={`查看 ${record.name} 的更多操作`}
                onClick={() => onNotify('数据资产详情尚未接入当前工作区')}
              >
                <MoreHorizontalIcon className="assets-row-action__icon" />
              </button>
            </span>
          </div>
        ))}
      </div>
      {records.length === 0 ? <EmptyState /> : null}
    </section>
  )
}

const dataAssetTypeLabels: Record<DataAssetRecord['category'], string> = {
  datasets: '数据集',
  tables: '数据表',
  'analysis-results': '分析结果',
  catalog: '数据目录',
}

const knowledgeKindLabels: Record<KnowledgeBaseKind, string> = {
  rag: 'RAG',
  knowledgeGraph: '知识图谱',
  graphRag: 'GraphRAG',
}

const knowledgeStatusOptions: (KnowledgeBaseStatus | 'all')[] = [
  'all',
  '已构建',
  '构建中',
  '需重建',
  '失败',
]

function KnowledgeBaseAssetsView({
  item,
  query,
  selectedKind,
  selectedStatus,
  selectedScope,
  selectedRecordId,
  selectedTab,
  onRecordSelect,
  onBack,
  onTabChange,
  onNotify,
}: {
  item: KnowledgeAssetItemId
  query: string
  selectedKind: KnowledgeBaseKind | 'all'
  selectedStatus: KnowledgeBaseStatus | 'all'
  selectedScope: AssetScope | 'all'
  selectedRecordId: string | null
  selectedTab: KnowledgeDetailTab
  onRecordSelect: (recordId: string) => void
  onBack: () => void
  onTabChange: (tab: KnowledgeDetailTab) => void
  onNotify: (message: string) => void
}) {
  const selectedRecord = selectedRecordId
    ? knowledgeBaseRecords.find((record) => record.id === selectedRecordId)
    : null

  if (selectedRecord) {
    return (
      <KnowledgeBaseDetailView
        record={selectedRecord}
        selectedTab={selectedTab}
        onBack={onBack}
        onTabChange={onTabChange}
      />
    )
  }

  const records = knowledgeBaseRecords.filter(
    (record) =>
      (item === 'all-knowledge' || record.category === item) &&
      (selectedKind === 'all' || record.kind === selectedKind) &&
      (selectedScope === 'all' || record.scope === selectedScope) &&
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      knowledgeBaseMatches(record, query),
  )

  return (
    <section className="assets-content knowledge-assets">
      <AssetListHeader title={getKnowledgeListTitle(item)} count={records.length} />
      <div
        className="assets-table knowledge-assets-table"
        role="table"
        aria-label="知识库列表"
      >
        <div className="assets-table__row assets-table__row--head knowledge-assets-table__row" role="row">
          <span role="columnheader">名称</span>
          <span role="columnheader">类型</span>
          <span role="columnheader">范围</span>
          <span role="columnheader">状态</span>
          <span role="columnheader">更新时间</span>
          <span role="columnheader">更多</span>
        </div>
        {records.map((record) => (
          <div
            className="assets-table__row knowledge-assets-table__row knowledge-assets-table__row--body"
            role="row"
            key={record.id}
            tabIndex={0}
            onClick={() => onRecordSelect(record.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onRecordSelect(record.id)
              }
            }}
          >
            <span className="assets-table__name" role="cell">
              <DatabaseIcon className="assets-record-card__icon" />
              <span>
                <strong>{record.name}</strong>
              </span>
            </span>
            <span role="cell">{knowledgeKindLabels[record.kind]}</span>
            <span role="cell">{assetScopeLabel[record.scope]}</span>
            <span className="assets-table__cell-stack" role="cell">
              <span className={`knowledge-status knowledge-status--${getKnowledgeStatusTone(record.status)}`}>
                {record.status}
              </span>
            </span>
            <span role="cell">{record.updatedAt}</span>
            <span role="cell">
              <button
                type="button"
                className="assets-record-card__action knowledge-row-open"
                aria-label={`打开 ${record.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onRecordSelect(record.id)
                }}
              >
                打开
              </button>
            </span>
          </div>
        ))}
      </div>
      {records.length === 0 ? <EmptyState /> : null}
      <button
        type="button"
        className="assets-record-card__action knowledge-build-placeholder"
        onClick={() => onNotify('知识库构建尚未接入当前工作区')}
      >
        构建设置
      </button>
    </section>
  )
}

function KnowledgeBaseDetailView({
  record,
  selectedTab,
  onBack,
  onTabChange,
}: {
  record: KnowledgeBaseRecord
  selectedTab: KnowledgeDetailTab
  onBack: () => void
  onTabChange: (tab: KnowledgeDetailTab) => void
}) {
  return (
    <section className="assets-content knowledge-detail">
      <button
        type="button"
        className="assets-record-card__action knowledge-detail__back"
        onClick={onBack}
      >
        返回知识库列表
      </button>

      <div className="knowledge-detail__summary">
        <div>
          <span className="knowledge-detail__eyebrow">
            {knowledgeKindLabels[record.kind]} · {assetScopeLabel[record.scope]}
          </span>
          <h2>{record.name}</h2>
          <p>{record.description}</p>
        </div>
        <div className="knowledge-detail__stats" aria-label="知识库摘要">
          <span>
            <strong>{record.sourceFiles.length}</strong>
            文件
          </span>
          <span>
            <strong>{record.versions[0]?.version ?? '-'}</strong>
            当前版本
          </span>
          <span>
            <strong>{record.status}</strong>
            状态
          </span>
        </div>
      </div>

      <div className="knowledge-tabs" role="tablist" aria-label="知识库详情">
        {knowledgeDetailTabs.map((tab) => (
          <button
            type="button"
            role="tab"
            key={tab.id}
            aria-selected={selectedTab === tab.id}
            className={selectedTab === tab.id ? 'active' : ''}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {selectedTab === 'overview' ? <KnowledgeOverview record={record} /> : null}
      {selectedTab === 'files' ? <KnowledgeSourceFilesTable record={record} /> : null}
      {selectedTab === 'versions' ? <KnowledgeVersionsTable record={record} /> : null}
    </section>
  )
}

const knowledgeDetailTabs: { id: KnowledgeDetailTab; label: string }[] = [
  { id: 'overview', label: '知识库概览' },
  { id: 'files', label: '使用文件' },
  { id: 'versions', label: '版本记录' },
]

function KnowledgeOverview({ record }: { record: KnowledgeBaseRecord }) {
  return (
    <div className="knowledge-detail-panel knowledge-overview">
      <div className="knowledge-overview__bullets">
        {splitKnowledgeOverview(record.overview).map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
      <div className="knowledge-overview__summary">
        <section>
          <h3>实体摘要</h3>
          <p>{record.entitySummary}</p>
        </section>
        <section>
          <h3>关系摘要</h3>
          <p>{record.relationshipSummary}</p>
        </section>
      </div>
    </div>
  )
}

function KnowledgeSourceFilesTable({ record }: { record: KnowledgeBaseRecord }) {
  return (
    <div
      className="assets-table knowledge-detail-table"
      role="table"
      aria-label="知识库使用文件"
    >
      <div className="assets-table__row assets-table__row--head knowledge-detail-table__row" role="row">
        <span role="columnheader">文件名</span>
        <span role="columnheader">类型</span>
        <span role="columnheader">用途</span>
        <span role="columnheader">更新时间</span>
      </div>
      {record.sourceFiles.map((file) => (
        <div
          className="assets-table__row knowledge-detail-table__row"
          role="row"
          key={file.name}
        >
          <span className="assets-table__name" role="cell">
            <FileKindIcon kind="projectFile" />
            <span>
              <strong>{file.name}</strong>
            </span>
          </span>
          <span role="cell">{file.kind.toUpperCase()}</span>
          <span role="cell">{file.role}</span>
          <span role="cell">{file.updatedAt}</span>
        </div>
      ))}
    </div>
  )
}

function KnowledgeVersionsTable({ record }: { record: KnowledgeBaseRecord }) {
  return (
    <div
      className="assets-table knowledge-detail-table knowledge-versions-table"
      role="table"
      aria-label="知识库版本记录"
    >
      <div className="assets-table__row assets-table__row--head knowledge-detail-table__row" role="row">
        <span role="columnheader">版本</span>
        <span role="columnheader">构建轮次</span>
        <span role="columnheader">构建时间</span>
        <span role="columnheader">变更摘要</span>
        <span role="columnheader">状态</span>
      </div>
      {record.versions.map((version) => (
        <div
          className="assets-table__row knowledge-detail-table__row"
          role="row"
          key={version.version}
        >
          <span role="cell">{version.version}</span>
          <span role="cell">{getKnowledgeVersionBuildLabel(version.version)}</span>
          <span role="cell">{version.builtAt}</span>
          <span role="cell">{version.changeSummary}</span>
          <span role="cell">{version.status}</span>
        </div>
      ))}
    </div>
  )
}

const experimentKindLabels: Record<ExperimentAssetKind, string> = {
  experimentDesignPackage: '设计包',
  experimentOrderDraft: '订单草稿',
  experimentOrder: '订单',
  experimentTask: '实验任务',
  schedule: '调度',
  croOrder: 'CRO订单',
  experimentRecord: '实验记录',
  sample: '样本',
  material: '物料',
  plate: '孔板',
  plateLink: '板位映射',
  deviceType: '设备类型',
  device: '设备',
  location: '点位',
  availabilityWindow: '预约窗口',
  assayRecipe: '实验配方',
  parameterTemplate: '参数模板',
  workflowRecipe: '工作流配方',
  qcRule: '质控规则',
  consumptionRule: '消耗规则',
}

function ExperimentAssetsView({
  item,
  viewMode,
  query,
  selectedKind,
  selectedStatus,
  selectedScope,
  onNotify,
}: {
  item: ExperimentAssetRecord['category']
  viewMode: AssetsExperimentViewMode
  query: string
  selectedKind: ExperimentAssetKind | 'all'
  selectedStatus: string
  selectedScope: AssetScope | 'all'
  onNotify: (message: string) => void
}) {
  const baseRecords = useMemo(
    () => experimentAssetRecords.filter((record) => record.category === item),
    [item],
  )
  const records = baseRecords.filter(
    (record) =>
      (selectedKind === 'all' || record.kind === selectedKind) &&
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      (selectedScope === 'all' || record.scope === selectedScope) &&
      experimentMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title={getExperimentListTitle(item)} count={records.length} />
      {viewMode === 'grid' ? (
        <div className="assets-record-grid assets-record-grid--dense assets-record-grid--experiment">
          {records.map((record) => (
            <ExperimentRecordCard
              key={record.id}
              record={record}
              onNotify={onNotify}
            />
          ))}
        </div>
      ) : (
        <ExperimentAssetsTable records={records} onNotify={onNotify} />
      )}
      {records.length === 0 ? (
        <div className="assets-empty">当前筛选下暂无实验资产</div>
      ) : null}
    </section>
  )
}

function ModelAssetsView({
  item,
  query,
  selectedStatus,
  selectedScope,
  xtrimoRecommendationsExpanded,
  onQueryChange,
  onXtrimoRecommendationsExpandedChange,
  onNotify,
}: {
  item: ModelAssetRecord['category']
  query: string
  selectedStatus: string
  selectedScope: AssetScope | 'all'
  xtrimoRecommendationsExpanded: boolean
  onQueryChange: (query: string) => void
  onXtrimoRecommendationsExpandedChange: (expanded: boolean) => void
  onNotify: (message: string) => void
}) {
  if (item === 'xtrimo') {
    return (
      <XtrimoModelAssetsView
        query={query}
        recommendationsExpanded={xtrimoRecommendationsExpanded}
        onQueryChange={onQueryChange}
        onRecommendationsExpandedChange={onXtrimoRecommendationsExpandedChange}
        onNotify={onNotify}
      />
    )
  }

  const records = getModelRecordsForItem(item).filter(
    (record) =>
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      (selectedScope === 'all' || record.scope === selectedScope) &&
      modelMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title="模型资产" count={records.length} />
      <ModelAssetsTable records={records} onNotify={onNotify} />
      {records.length === 0 ? <EmptyState /> : null}
    </section>
  )
}

const xtrimoCapabilities = Array.from(
  new Set(xtrimoModelRecords.flatMap((record) => record.capabilities)),
)
const xtrimoEntities = Array.from(
  new Set(xtrimoModelRecords.flatMap((record) => record.entities)),
)

function XtrimoModelAssetsView({
  query,
  recommendationsExpanded,
  onQueryChange,
  onRecommendationsExpandedChange,
  onNotify,
}: {
  query: string
  recommendationsExpanded: boolean
  onQueryChange: (query: string) => void
  onRecommendationsExpandedChange: (expanded: boolean) => void
  onNotify: (message: string) => void
}) {
  const [selectedCapability, setSelectedCapability] = useState<
    XtrimoCapability | 'all'
  >('all')
  const [selectedEntity, setSelectedEntity] = useState<XtrimoEntity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<XtrimoModelStatus | 'all'>(
    'all',
  )
  const [selectedCallability, setSelectedCallability] = useState<
    XtrimoModelRecord['callability'] | 'all'
  >('all')
  const [selectedProjectFit, setSelectedProjectFit] = useState<
    XtrimoModelRecord['projectFit'] | 'all'
  >('all')
  const [selectedVersion, setSelectedVersion] = useState('all')
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const recommendedRecords = xtrimoModelRecords.filter(
    (record) => record.projectFit === 'recommended',
  )
  const versionOptions = Array.from(
    new Set(xtrimoModelRecords.map((record) => record.version)),
  ).sort((left, right) => left.localeCompare(right))
  const filteredRecords = xtrimoModelRecords.filter(
    (record) =>
      (selectedCapability === 'all' ||
        record.capabilities.includes(selectedCapability)) &&
      (selectedEntity === 'all' || record.entities.includes(selectedEntity)) &&
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      (selectedCallability === 'all' ||
        record.callability === selectedCallability) &&
      (selectedProjectFit === 'all' || record.projectFit === selectedProjectFit) &&
      (selectedVersion === 'all' || record.version === selectedVersion) &&
      xtrimoModelMatches(record, query),
  )
  const advancedFilterCount =
    Number(selectedStatus !== 'all') +
    Number(selectedCallability !== 'all') +
    Number(selectedProjectFit !== 'all') +
    Number(selectedVersion !== 'all')
  const advancedFilterLabel =
    advancedFilterCount > 0 ? `更多筛选 ${advancedFilterCount}` : '更多筛选'

  return (
    <section className="assets-content assets-content--xtrimo">
      <div className="assets-xtrimo-filters xtrimo-filter-bar" aria-label="xTrimo 模型筛选">
        <div className="assets-xtrimo-filter-search">
          <button
            type="button"
            className="assets-xtrimo-search-scope"
            aria-haspopup="listbox"
            onClick={() => onNotify('搜索范围切换尚未接入当前工作区')}
          >
            <span>综合</span>
            <ChevronDownIcon className="assets-xtrimo-search-scope__icon" />
          </button>
          <label className="assets-xtrimo-search-field">
            <input
              aria-label="搜索xTrimo模型"
              value={query}
              placeholder="搜索关键词"
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
        </div>
        <div className="assets-xtrimo-core-controls">
          <select
            className="assets-filter-select"
            aria-label="筛选xTrimo能力"
            value={selectedCapability}
            onChange={(event) =>
              setSelectedCapability(event.currentTarget.value as XtrimoCapability | 'all')
            }
          >
            <option value="all">全部能力</option>
            {xtrimoCapabilities.map((capability) => (
              <option key={capability} value={capability}>
                {capability}
              </option>
            ))}
          </select>
          <select
            className="assets-filter-select"
            aria-label="筛选xTrimo实体"
            value={selectedEntity}
            onChange={(event) =>
              setSelectedEntity(event.currentTarget.value as XtrimoEntity | 'all')
            }
          >
            <option value="all">全部实体</option>
            {xtrimoEntities.map((entity) => (
              <option key={entity} value={entity}>
                {entity}
              </option>
            ))}
          </select>
          <div className="assets-filter-menu">
            <button
              type="button"
              className="assets-filter-select assets-more-filter-button"
              aria-expanded={advancedFiltersOpen}
              onClick={() => setAdvancedFiltersOpen((isOpen) => !isOpen)}
            >
              {advancedFilterLabel}
            </button>
            {advancedFiltersOpen ? (
              <div className="assets-advanced-filters" aria-label="更多筛选">
                <label>
                  <span>状态</span>
                  <select
                    className="assets-filter-select"
                    aria-label="筛选xTrimo状态"
                    value={selectedStatus}
                    onChange={(event) =>
                      setSelectedStatus(
                        event.currentTarget.value as XtrimoModelStatus | 'all',
                      )
                    }
                  >
                    <option value="all">全部状态</option>
                    <option value="online">已上线</option>
                    <option value="comingSoon">即将上线</option>
                  </select>
                </label>
                <label>
                  <span>调用状态</span>
                  <select
                    className="assets-filter-select"
                    aria-label="筛选xTrimo调用状态"
                    value={selectedCallability}
                    onChange={(event) =>
                      setSelectedCallability(
                        event.currentTarget.value as XtrimoModelRecord['callability'] | 'all',
                      )
                    }
                  >
                    <option value="all">全部调用状态</option>
                    <option value="callable">可调用</option>
                    <option value="previewOnly">仅预览</option>
                  </select>
                </label>
                <label>
                  <span>版本</span>
                  <select
                    className="assets-filter-select"
                    aria-label="筛选xTrimo版本"
                    value={selectedVersion}
                    onChange={(event) =>
                      setSelectedVersion(event.currentTarget.value)
                    }
                  >
                    <option value="all">全部版本</option>
                    {versionOptions.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>推荐</span>
                  <select
                    className="assets-filter-select"
                    aria-label="筛选xTrimo推荐"
                    value={selectedProjectFit}
                    onChange={(event) =>
                      setSelectedProjectFit(
                        event.currentTarget.value as XtrimoModelRecord['projectFit'] | 'all',
                      )
                    }
                  >
                    <option value="all">全部模型</option>
                    <option value="recommended">Agent 推荐</option>
                    <option value="useful">项目可用</option>
                    <option value="general">通用模型</option>
                  </select>
                </label>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <section
        className="assets-xtrimo-recommendations xtrimo-recommendations"
        aria-label="推荐用于当前项目"
      >
        <button
          type="button"
          className="xtrimo-recommendations__toggle"
          aria-label={recommendationsExpanded ? '收起推荐' : '展开推荐'}
          aria-expanded={recommendationsExpanded}
          onClick={() =>
            onRecommendationsExpandedChange(!recommendationsExpanded)
          }
        >
          <span>推荐用于当前项目的 {recommendedRecords.length} 个模型</span>
          <strong>{recommendationsExpanded ? '收起推荐' : '展开推荐'}</strong>
        </button>
        {recommendationsExpanded ? (
          <div className="assets-record-grid assets-record-grid--dense xtrimo-card-grid">
            {recommendedRecords.map((record) => (
              <XtrimoModelCard
                key={record.id}
                record={record}
                density="compact"
                onNotify={onNotify}
              />
            ))}
          </div>
        ) : null}
      </section>

      <AssetListHeader title="模型目录" count={filteredRecords.length} />
      <div className="assets-record-grid assets-record-grid--dense xtrimo-card-grid">
        {filteredRecords.map((record) => (
          <XtrimoModelCard key={record.id} record={record} onNotify={onNotify} />
        ))}
      </div>
      {filteredRecords.length === 0 ? <EmptyState /> : null}
    </section>
  )
}

function AssetListHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="assets-list-header">
      <h2>{title}</h2>
      <span>{count} 项</span>
    </div>
  )
}

function FileRecordCard({
  record,
  onNotify,
}: {
  record: FileAssetRecord
  onNotify: (message: string) => void
}) {
  return (
    <article className="assets-record-card">
      <div className="assets-record-card__top">
        <FileKindIcon kind={record.fileSpaceKind} />
        <span className="assets-record-card__badge">
          {record.fileSpaceKind === 'fileAsset' ? 'File Asset' : 'Project File'}
        </span>
      </div>
      <h3>{record.name}</h3>
      <p>{record.description}</p>
      <div className="assets-record-card__meta">
        <span>{assetScopeLabel[record.scope]}</span>
        <span>{record.kind.toUpperCase()}</span>
        <span>{record.modifiedAt}</span>
      </div>
      <button
        type="button"
        className="assets-record-card__action"
        onClick={() => onNotify('资产操作尚未接入当前工作区')}
      >
        查看详情
      </button>
    </article>
  )
}

function ExperimentRecordCard({
  record,
  onNotify,
}: {
  record: ExperimentAssetRecord
  onNotify: (message: string) => void
}) {
  return (
    <article className="assets-record-card assets-record-card--experiment">
      <div className="assets-record-card__top">
        <PackageIcon className="assets-record-card__icon" />
        <span className="assets-record-card__badge assets-record-card__badge--muted">
          {experimentKindLabels[record.kind]}
        </span>
        <span className="assets-record-card__badge">{record.status}</span>
      </div>
      <h3>{record.name}</h3>
      <div className="assets-record-card__meta assets-record-card__meta--stacked">
        <span>{getExperimentKeyObject(record)}</span>
        <span>{record.updatedAt}</span>
      </div>
      <button
        type="button"
        className="assets-record-card__action"
        onClick={() => onNotify('实验资产详情尚未接入当前工作区')}
      >
        查看详情
      </button>
    </article>
  )
}

function ExperimentAssetsTable({
  records,
  onNotify,
}: {
  records: ExperimentAssetRecord[]
  onNotify: (message: string) => void
}) {
  const rowClassName = 'assets-table__row assets-table__row--experiment'

  return (
    <div className="assets-table assets-experiment-table" role="table" aria-label="实验资产表格">
      <div
        className={`assets-table__row--head ${rowClassName}`}
        role="row"
      >
        <span role="columnheader">名称</span>
        <span role="columnheader">类型</span>
        <span role="columnheader">状态</span>
        <span role="columnheader">关键对象</span>
        <span role="columnheader">更新时间</span>
        <span role="columnheader">更多</span>
      </div>
      {records.map((record) => (
        <div
          className={rowClassName}
          role="row"
          key={record.id}
        >
          <span className="assets-table__name" role="cell">
            <PackageIcon className="assets-record-card__icon" />
            <span>
              <strong>{record.name}</strong>
            </span>
          </span>
          <span role="cell">{experimentKindLabels[record.kind]}</span>
          <span role="cell">{record.status}</span>
          <span role="cell">{getExperimentKeyObject(record)}</span>
          <span role="cell">{record.updatedAt}</span>
          <span role="cell">
            <button
              type="button"
              className="assets-row-action"
              aria-label={`查看 ${record.name} 的更多操作`}
              onClick={() => onNotify('实验资产详情尚未接入当前工作区')}
            >
              <MoreHorizontalIcon className="assets-row-action__icon" />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function ModelAssetsTable({
  records,
  onNotify,
}: {
  records: ModelAssetRecord[]
  onNotify: (message: string) => void
}) {
  return (
    <div className="assets-table model-assets-table" role="table" aria-label="模型资产列表">
      <div className="assets-table__row assets-table__row--head" role="row">
        <span role="columnheader">名称</span>
        <span role="columnheader">状态</span>
        <span role="columnheader">范围</span>
        <span role="columnheader">更新时间</span>
        <span role="columnheader">更多</span>
      </div>
      {records.map((record) => (
        <div className="assets-table__row" role="row" key={record.id}>
          <span className="assets-table__name" role="cell">
            <PackageIcon className="assets-record-card__icon" />
            <span>
              <strong>{record.name}</strong>
            </span>
          </span>
          <span role="cell">{record.status}</span>
          <span role="cell">{assetScopeLabel[record.scope]}</span>
          <span role="cell">{record.updatedAt}</span>
          <span role="cell">
            <button
              type="button"
              className="assets-row-action"
              aria-label={`查看 ${record.name} 的更多操作`}
              onClick={() => onNotify('模型资产详情尚未接入当前工作区')}
            >
              <MoreHorizontalIcon className="assets-row-action__icon" />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function XtrimoModelCard({
  record,
  density = 'normal',
  onNotify,
}: {
  record: XtrimoModelRecord
  density?: 'normal' | 'compact'
  onNotify: (message: string) => void
}) {
  const isCallable = record.callability === 'callable'

  return (
    <article
      className={`assets-record-card assets-record-card--generic assets-record-card--xtrimo xtrimo-model-card${
        density === 'compact' ? ' xtrimo-model-card--compact' : ''
      }`}
    >
      <div className="assets-record-card__top">
        <PackageIcon className="assets-record-card__icon" />
        <span className="assets-record-card__badge xtrimo-model-card__badge">
          {record.status === 'online' ? '已上线' : '即将上线'}
        </span>
      </div>
      <h3>{record.name}</h3>
      <p>{record.agentUse}</p>
      <div className="assets-record-card__meta">
        <span>{record.capabilities.join(' / ')}</span>
        <span>{record.entities.join(' / ')}</span>
        <span>{record.version}</span>
        <span>{isCallable ? '可调用' : '仅预览'}</span>
      </div>
      <div className="assets-record-card__meta">
        <span>输入：{record.input}</span>
        <span>输出：{record.output}</span>
      </div>
      <div className="xtrimo-model-card__thumbnail">
        <img
          className="xtrimo-model-card__thumbnail-image"
          src={record.thumbnailSrc}
          alt={`${record.name} ModelHub preview`}
          loading="lazy"
        />
      </div>
      <button
        type="button"
        className="assets-record-card__action"
        onClick={() =>
          onNotify(
            isCallable
              ? '模型详情尚未接入当前工作区'
              : '该模型即将上线，当前仅支持预览',
          )
        }
      >
        {isCallable ? '查看详情' : '预览模型'}
      </button>
    </article>
  )
}

function EmptyState() {
  return <div className="assets-empty">当前筛选下暂无资产</div>
}

function AssetSectionIcon({ section }: { section: AssetsSection }) {
  const className = 'assets-sidebar__icon'

  if (section === 'file') {
    return <FolderIcon className={className} />
  }

  if (section === 'data') {
    return <DatabaseIcon className={className} />
  }

  if (section === 'experiment') {
    return <ArchiveIcon className={className} />
  }

  return <ShareIcon className={className} />
}

function FileKindIcon({ kind }: { kind: FileAssetRecord['fileSpaceKind'] }) {
  return kind === 'fileAsset' ? (
    <DatabaseIcon className="assets-record-card__icon" />
  ) : (
    <FolderIcon className="assets-record-card__icon" />
  )
}

function getFileRecordsForItem(
  item: FileRecordMenuItem,
  openFolderId: string | null,
): FileAssetRecord[] {
  if (item === 'public-files') {
    return fileAssetRecords.filter(
      (record) => record.scope === 'public' && record.status !== 'archived',
    )
  }

  if (item === 'recent-uploads') {
    return fileAssetRecords.filter((record) => record.status !== 'archived').slice(0, 6)
  }

  if (item === 'archived-files') {
    return fileAssetRecords.filter((record) => record.status === 'archived')
  }

  return fileAssetRecords.filter(
    (record) =>
      record.scope === 'project' &&
      record.status !== 'archived' &&
      (!openFolderId || record.folderId === openFolderId),
  )
}

function getFileListTitle(item: FileRecordMenuItem) {
  if (item === 'public-files') {
    return '公共文件'
  }

  if (item === 'recent-uploads') {
    return '最近上传'
  }

  if (item === 'archived-files') {
    return '归档文件'
  }

  return '项目文件'
}

function getModelRecordsForItem(item: ModelAssetRecord['category']) {
  const records = modelAssetRecords.filter((record) => record.category === item)

  if (item === 'oracles') {
    return records.filter((record) => record.status === '已发布')
  }

  return records
}

function getExperimentListTitle(item: ExperimentAssetRecord['category']) {
  if (item === 'experiment-list') {
    return '实验列表'
  }

  if (item === 'execution') {
    return '执行记录'
  }

  if (item === 'inventory') {
    return '库存资产'
  }

  if (item === 'equipment') {
    return '设备资产'
  }

  return '实验配方'
}

function getExperimentKeyObject(record: ExperimentAssetRecord) {
  if (record.projectName) {
    return record.projectName
  }

  return record.primaryMeta
}

function getAssetsSearchLabel(section: AssetsSection) {
  if (section === 'knowledge') {
    return '搜索知识库'
  }

  if (section === 'experiment') {
    return '搜索实验资产'
  }

  if (section === 'model') {
    return '搜索模型资产'
  }

  if (section === 'data') {
    return '搜索数据资产'
  }

  return '搜索当前资产'
}

function getAssetsAdvancedFilterCount(
  section: AssetsSection,
  selectedFileScope: AssetScope | 'all',
  selectedFileStatus: string,
  selectedKnowledgeScope: AssetScope | 'all',
  selectedExperimentScope: AssetScope | 'all',
) {
  if (section === 'file') {
    return Number(selectedFileScope !== 'all') + Number(selectedFileStatus !== 'all')
  }

  if (section === 'knowledge') {
    return Number(selectedKnowledgeScope !== 'all')
  }

  if (section === 'experiment') {
    return Number(selectedExperimentScope !== 'all')
  }

  return 0
}

function getNewAssetMenuActions(
  section: AssetsSection,
  item: AssetMenuItemId,
): { label: string; message: string }[] {
  if (section === 'knowledge' && isKnowledgeBaseItem(item)) {
    return [
      { label: '新建 RAG 知识库', message: '新建 RAG 知识库尚未接入当前工作区' },
      {
        label: '新建知识图谱',
        message: '新建知识图谱尚未接入当前工作区',
      },
      {
        label: '新建 GraphRAG',
        message: '新建 GraphRAG 尚未接入当前工作区',
      },
    ]
  }

  if (section === 'experiment' && isExperimentAssetItem(item)) {
    if (item === 'experiment-list') {
      return [
        {
          label: '新建实验订单草稿',
          message: '新建实验订单草稿尚未接入当前工作区',
        },
        {
          label: '新建设计包',
          message: '新建设计包尚未接入当前工作区',
        },
      ]
    }

    if (item === 'execution') {
      return [
        {
          label: '登记实验记录',
          message: '登记实验记录尚未接入当前工作区',
        },
        {
          label: '创建调度占位',
          message: '创建调度占位尚未接入当前工作区',
        },
      ]
    }

    if (item === 'inventory') {
      return [
        { label: '登记样本', message: '登记样本尚未接入当前工作区' },
        { label: '登记物料', message: '登记物料尚未接入当前工作区' },
        { label: '新增孔板', message: '新增孔板尚未接入当前工作区' },
      ]
    }

    if (item === 'equipment') {
      return [
        { label: '登记设备', message: '登记设备尚未接入当前工作区' },
        {
          label: '新增可用窗口',
          message: '新增可用窗口尚未接入当前工作区',
        },
      ]
    }

    return [
      { label: '新建配方', message: '新建配方尚未接入当前工作区' },
      {
        label: '复制公开配方到项目',
        message: '复制公开配方到项目尚未接入当前工作区',
      },
    ]
  }

  if (section === 'file') {
    return [
      { label: '新建文件夹', message: '新建文件夹尚未接入当前工作区' },
      { label: '新建文档', message: '新建文档尚未接入当前工作区' },
    ]
  }

  if (section === 'data') {
    return [
      { label: '新建数据集', message: '新建数据集尚未接入当前工作区' },
      { label: '登记数据表', message: '登记数据表尚未接入当前工作区' },
    ]
  }

  return [
    { label: '注册模型', message: '注册模型尚未接入当前工作区' },
    { label: '新建 Oracle', message: '新建 Oracle 尚未接入当前工作区' },
  ]
}

function fileMatches(record: FileAssetRecord, query: string) {
  return matchesQuery(
    [record.name, record.description, record.owner, record.kind, record.scope],
    query,
  )
}

function fileUpdatedTimeMatches(
  modifiedAt: string,
  selectedUpdatedTime: FileUpdatedTimeFilter,
) {
  if (selectedUpdatedTime === 'all') {
    return true
  }

  const ageMinutes = getRelativeAgeMinutes(modifiedAt)

  if (selectedUpdatedTime === 'last30Minutes') {
    return ageMinutes <= 30
  }

  if (selectedUpdatedTime === 'lastHour') {
    return ageMinutes <= 60
  }

  return ageMinutes < 24 * 60
}

function getRelativeAgeMinutes(relativeTime: string) {
  const minutes = /^(\d+)\s*分钟前$/.exec(relativeTime)?.[1]

  if (minutes) {
    return Number(minutes)
  }

  const hours = /^(\d+)\s*小时前$/.exec(relativeTime)?.[1]

  if (hours) {
    return Number(hours) * 60
  }

  if (relativeTime === '昨天') {
    return 24 * 60
  }

  const days = /^(\d+)\s*天前$/.exec(relativeTime)?.[1]

  if (days) {
    return Number(days) * 24 * 60
  }

  return Number.POSITIVE_INFINITY
}

function dataMatches(record: DataAssetRecord, query: string) {
  return matchesQuery(
    [
      record.name,
      record.description,
      record.owner,
      record.rows,
      record.scope,
      dataAssetTypeLabels[record.category],
    ],
    query,
  )
}

function experimentMatches(record: ExperimentAssetRecord, query: string) {
  return matchesQuery(
    [
      record.name,
      record.description,
      record.owner,
      record.status,
      record.scope,
      experimentKindLabels[record.kind],
      record.projectName ?? '',
      record.primaryMeta,
      record.secondaryMeta,
      record.tertiaryMeta ?? '',
    ],
    query,
  )
}

function knowledgeBaseMatches(record: KnowledgeBaseRecord, query: string) {
  return matchesQuery(
    [
      record.name,
      record.description,
      record.overview,
      record.entitySummary,
      record.relationshipSummary,
      record.owner,
      record.status,
      record.scope,
      record.projectName ?? '',
      knowledgeKindLabels[record.kind],
      ...record.sourceFiles.map((file) => file.name),
    ],
    query,
  )
}

function modelMatches(record: ModelAssetRecord, query: string) {
  return matchesQuery(
    [record.name, record.description, record.owner, record.status, record.scope],
    query,
  )
}

function xtrimoModelMatches(record: XtrimoModelRecord, query: string) {
  return matchesQuery(
    [
      record.name,
      record.agentUse,
      record.input,
      record.output,
      ...record.capabilities,
      ...record.entities,
    ],
    query,
  )
}

function matchesQuery(values: string[], query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return true
  }

  return values.some((value) => value.toLowerCase().includes(normalizedQuery))
}

function getKnowledgeListTitle(item: KnowledgeAssetItemId) {
  if (item === 'rag') {
    return 'RAG 知识库'
  }

  if (item === 'knowledge-graph') {
    return '知识图谱'
  }

  if (item === 'graph-rag') {
    return 'GraphRAG 知识库'
  }

  return '全部知识库'
}

function getKnowledgeStatusTone(status: KnowledgeBaseStatus) {
  if (status === '已构建') {
    return 'ready'
  }

  if (status === '构建中') {
    return 'building'
  }

  if (status === '失败') {
    return 'failed'
  }

  return 'stale'
}

function getKnowledgeVersionBuildLabel(version: string) {
  const minorVersion = /^v\d+\.(\d+)/.exec(version)?.[1]

  return minorVersion ? `v${minorVersion}` : version
}

function splitKnowledgeOverview(overview: string) {
  return overview
    .split('，')
    .map((part) => part.trim())
    .filter(Boolean)
}

type FileAssetRecordMenuItem = Extract<
  AssetMenuItemId,
  'public-files' | 'project-files' | 'recent-uploads' | 'archived-files'
>
type FileRecordMenuItem = FileAssetRecordMenuItem

function isExperimentAssetItem(
  item: AssetMenuItemId,
): item is ExperimentAssetRecord['category'] {
  return ['experiment-list', 'execution', 'inventory', 'equipment', 'recipe'].includes(
    item,
  )
}

function isKnowledgeBaseItem(item: AssetMenuItemId): item is KnowledgeAssetItemId {
  return ['all-knowledge', 'rag', 'knowledge-graph', 'graph-rag'].includes(item)
}

export default AssetsPage
