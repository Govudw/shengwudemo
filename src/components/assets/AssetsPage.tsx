import { useMemo, useState } from 'react'
import {
  assetMenuSections,
  dataAssetRecords,
  experimentAssetRecords,
  fileAssetRecords,
  getAssetMenuItem,
  isFileAssetItem,
  modelAssetRecords,
  projectFileFolders,
  xtrimoModelRecords,
} from '../../data/assetsMockData'
import type {
  DataAssetRecord,
  ExperimentAssetRecord,
  ExperimentAssetKind,
  FileAssetRecord,
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
  onSelectionChange: (section: AssetsSection, item: AssetMenuItemId) => void
  onFileViewModeChange: (mode: AssetsFileViewMode) => void
  onExperimentViewModeChange: (mode: AssetsExperimentViewMode) => void
  onOpenFolderChange: (folderId: string | null) => void
  onNotify: (message: string) => void
}

const assetScopeLabel = {
  public: '公开范围',
  project: '项目范围',
} as const

function AssetsPage({
  activeSection,
  activeItem,
  fileViewMode,
  experimentViewMode,
  openFolderId,
  onSelectionChange,
  onFileViewModeChange,
  onExperimentViewModeChange,
  onOpenFolderChange,
  onNotify,
}: AssetsPageProps) {
  const [query, setQuery] = useState('')
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const activeItemMeta = getAssetMenuItem(activeSection, activeItem)
  const isXtrimoView = activeSection === 'model' && activeItem === 'xtrimo'
  const isExperimentView = activeSection === 'experiment'
  const newAssetActions = getNewAssetMenuActions(activeSection, activeItem)

  function handleSelection(section: AssetsSection, item: AssetMenuItemId) {
    setQuery('')
    setNewMenuOpen(false)
    setMoreMenuOpen(false)
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
            {!isXtrimoView ? (
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
                <button
                  type="button"
                  className="assets-action-button"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  上传
                </button>
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
                    onClick={() => handleMockAction('分享视图将在后续 Demo 中展开')}
                  >
                    分享当前视图
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockAction('资产导出将在后续 Demo 中展开')}
                  >
                    导出清单
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMockAction('显示字段将在后续 Demo 中展开')}
                  >
                    显示字段
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {!isXtrimoView ? (
          <section className="assets-toolbar" aria-label="Assets tools">
            <label className="assets-search">
              <SearchIcon className="assets-search__icon" />
              <input
                aria-label={isExperimentView ? '搜索实验资产' : '搜索当前资产'}
                value={query}
                placeholder={isExperimentView ? '搜索实验资产' : '搜索当前资产'}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            {isExperimentView ? (
              <div className="assets-view-toggle" aria-label="实验资产显示方式">
                <button
                  type="button"
                  className={experimentViewMode === 'grid' ? 'active' : ''}
                  aria-pressed={experimentViewMode === 'grid'}
                  onClick={() => onExperimentViewModeChange('grid')}
                >
                  卡片
                </button>
                <button
                  type="button"
                  className={experimentViewMode === 'table' ? 'active' : ''}
                  aria-pressed={experimentViewMode === 'table'}
                  onClick={() => onExperimentViewModeChange('table')}
                >
                  表格
                </button>
              </div>
            ) : isFileAssetItem(activeItem) ? (
              <div className="assets-view-toggle" aria-label="文件显示方式">
                <button
                  type="button"
                  className={fileViewMode === 'list' ? 'active' : ''}
                  onClick={() => onFileViewModeChange('list')}
                >
                  列表
                </button>
                <button
                  type="button"
                  className={fileViewMode === 'grid' ? 'active' : ''}
                  onClick={() => onFileViewModeChange('grid')}
                >
                  网格
                </button>
              </div>
            ) : null}
          </section>
        ) : null}

        <AssetContent
          activeItem={activeItem}
          fileViewMode={fileViewMode}
          experimentViewMode={experimentViewMode}
          openFolderId={openFolderId}
          query={query}
          onQueryChange={setQuery}
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

function AssetContent({
  activeItem,
  fileViewMode,
  experimentViewMode,
  openFolderId,
  query,
  onQueryChange,
  onOpenFolderChange,
  onNotify,
}: {
  activeItem: AssetMenuItemId
  fileViewMode: AssetsFileViewMode
  experimentViewMode: AssetsExperimentViewMode
  openFolderId: string | null
  query: string
  onQueryChange: (query: string) => void
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
        onOpenFolderChange={onOpenFolderChange}
        onNotify={onNotify}
      />
    )
  }

  if (['datasets', 'tables', 'analysis-results', 'catalog'].includes(activeItem)) {
    return <DataAssetsView item={activeItem as DataAssetRecord['category']} query={query} />
  }

  if (isExperimentAssetItem(activeItem)) {
    return (
      <ExperimentAssetsView
        item={activeItem}
        viewMode={experimentViewMode}
        query={query}
        onNotify={onNotify}
      />
    )
  }

  return (
    <ModelAssetsView
      item={activeItem as ModelAssetRecord['category']}
      query={query}
      onQueryChange={onQueryChange}
      onNotify={onNotify}
    />
  )
}

function FileSpaceView({
  item,
  viewMode,
  openFolderId,
  query,
  onOpenFolderChange,
  onNotify,
}: {
  item: FileAssetRecordMenuItem
  viewMode: AssetsFileViewMode
  openFolderId: string | null
  query: string
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
    () => getFileRecordsForItem(item, openFolderId).filter((record) => fileMatches(record, query)),
    [item, openFolderId, query],
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
                {folder.itemCount} 项 · {folder.modifiedAt}
              </span>
              <span className="assets-folder-card__desc">{folder.description}</span>
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
            <span role="columnheader">空间类型</span>
            <span role="columnheader">文件类型</span>
            <span role="columnheader">更新时间</span>
            <span role="columnheader">操作</span>
          </div>
          {records.map((record) => (
            <div className="assets-table__row" role="row" key={record.id}>
              <span className="assets-table__name" role="cell">
                <FileKindIcon kind={record.fileSpaceKind} />
                <span>
                  <strong>{record.name}</strong>
                  <small>{record.description}</small>
                </span>
              </span>
              <span role="cell">{assetScopeLabel[record.scope]}</span>
              <span role="cell">
                {record.fileSpaceKind === 'fileAsset' ? 'File Asset' : 'Project File'}
              </span>
              <span role="cell">{record.kind.toUpperCase()}</span>
              <span role="cell">{record.modifiedAt}</span>
              <span role="cell">
                <button
                  type="button"
                  className="assets-row-action"
                  onClick={() => onNotify('资产操作将在后续 Demo 中展开')}
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
}: {
  item: DataAssetRecord['category']
  query: string
}) {
  const records = dataAssetRecords.filter(
    (record) => record.category === item && dataMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title="数据资产" count={records.length} />
      <div className="assets-record-grid assets-record-grid--dense">
        {records.map((record) => (
          <GenericRecordCard
            key={record.id}
            title={record.name}
            badge={assetScopeLabel[record.scope]}
            meta={`${record.rows} · ${record.updatedAt}`}
            description={record.description}
          />
        ))}
      </div>
      {records.length === 0 ? <EmptyState /> : null}
    </section>
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
  onNotify,
}: {
  item: ExperimentAssetRecord['category']
  viewMode: AssetsExperimentViewMode
  query: string
  onNotify: (message: string) => void
}) {
  const [filterState, setFilterState] = useState<{
    item: ExperimentAssetRecord['category']
    kind: ExperimentAssetKind | 'all'
    status: string
  }>({ item, kind: 'all', status: 'all' })
  const selectedKind = filterState.item === item ? filterState.kind : 'all'
  const selectedStatus = filterState.item === item ? filterState.status : 'all'
  const baseRecords = useMemo(
    () => experimentAssetRecords.filter((record) => record.category === item),
    [item],
  )
  const kindOptions = useMemo(
    () => Array.from(new Set(baseRecords.map((record) => record.kind))),
    [baseRecords],
  )
  const statusOptions = useMemo(
    () => Array.from(new Set(baseRecords.map((record) => record.status))),
    [baseRecords],
  )
  const records = baseRecords.filter(
    (record) =>
      (selectedKind === 'all' || record.kind === selectedKind) &&
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      experimentMatches(record, query),
  )

  return (
    <section className="assets-content">
      <div className="assets-experiment-filter-bar" aria-label="实验资产筛选">
        <div className="assets-experiment-filter-row">
          <span>类型</span>
          <button
            type="button"
            className={selectedKind === 'all' ? 'active' : ''}
            aria-pressed={selectedKind === 'all'}
            onClick={() => setFilterState({ item, kind: 'all', status: selectedStatus })}
          >
            全部类型
          </button>
          {kindOptions.map((kind) => (
            <button
              type="button"
              key={kind}
              className={selectedKind === kind ? 'active' : ''}
              aria-pressed={selectedKind === kind}
              onClick={() => setFilterState({ item, kind, status: selectedStatus })}
            >
              {experimentKindLabels[kind]}
            </button>
          ))}
        </div>
        <div className="assets-experiment-filter-row">
          <span>状态</span>
          <button
            type="button"
            className={selectedStatus === 'all' ? 'active' : ''}
            aria-pressed={selectedStatus === 'all'}
            onClick={() => setFilterState({ item, kind: selectedKind, status: 'all' })}
          >
            全部状态
          </button>
          {statusOptions.map((status) => (
            <button
              type="button"
              key={status}
              className={selectedStatus === status ? 'active' : ''}
              aria-pressed={selectedStatus === status}
              onClick={() => setFilterState({ item, kind: selectedKind, status })}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

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
        <ExperimentAssetsTable item={item} records={records} onNotify={onNotify} />
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
  onQueryChange,
  onNotify,
}: {
  item: ModelAssetRecord['category']
  query: string
  onQueryChange: (query: string) => void
  onNotify: (message: string) => void
}) {
  if (item === 'xtrimo') {
    return (
      <XtrimoModelAssetsView
        query={query}
        onQueryChange={onQueryChange}
        onNotify={onNotify}
      />
    )
  }

  const records = modelAssetRecords.filter(
    (record) => record.category === item && modelMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title="模型资产" count={records.length} />
      <div className="assets-record-grid assets-record-grid--dense">
        {records.map((record) => (
          <GenericRecordCard
            key={record.id}
            title={record.name}
            badge={record.status}
            meta={`${assetScopeLabel[record.scope]} · ${record.updatedAt}`}
            description={record.description}
          />
        ))}
      </div>
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
  onQueryChange,
  onNotify,
}: {
  query: string
  onQueryChange: (query: string) => void
  onNotify: (message: string) => void
}) {
  const [selectedCapability, setSelectedCapability] = useState<
    XtrimoCapability | 'all'
  >('all')
  const [selectedEntity, setSelectedEntity] = useState<XtrimoEntity | 'all'>('all')
  const [selectedStatus, setSelectedStatus] = useState<XtrimoModelStatus | 'all'>(
    'all',
  )
  const recommendedRecords = xtrimoModelRecords.filter(
    (record) => record.projectFit === 'recommended',
  )
  const filteredRecords = xtrimoModelRecords.filter(
    (record) =>
      (selectedCapability === 'all' ||
        record.capabilities.includes(selectedCapability)) &&
      (selectedEntity === 'all' || record.entities.includes(selectedEntity)) &&
      (selectedStatus === 'all' || record.status === selectedStatus) &&
      xtrimoModelMatches(record, query),
  )

  return (
    <section className="assets-content assets-content--xtrimo">
      <div className="assets-xtrimo-filters xtrimo-filter-bar" aria-label="xTrimo 模型筛选">
        <div className="assets-xtrimo-filter-search">
          <button
            type="button"
            className="assets-xtrimo-search-scope"
            aria-haspopup="listbox"
            onClick={() => onNotify('搜索范围切换将在后续 Demo 中展开')}
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
        <div className="assets-xtrimo-filter-row">
          <span>能力</span>
          <button
            type="button"
            className={selectedCapability === 'all' ? 'active' : ''}
            aria-pressed={selectedCapability === 'all'}
            onClick={() => setSelectedCapability('all')}
          >
            全部能力
          </button>
          {xtrimoCapabilities.map((capability) => (
            <button
              type="button"
              key={capability}
              className={selectedCapability === capability ? 'active' : ''}
              aria-pressed={selectedCapability === capability}
              onClick={() => setSelectedCapability(capability)}
            >
              {capability}
            </button>
          ))}
        </div>
        <div className="assets-xtrimo-filter-row">
          <span>实体</span>
          <button
            type="button"
            className={selectedEntity === 'all' ? 'active' : ''}
            aria-pressed={selectedEntity === 'all'}
            onClick={() => setSelectedEntity('all')}
          >
            全部实体
          </button>
          {xtrimoEntities.map((entity) => (
            <button
              type="button"
              key={entity}
              className={selectedEntity === entity ? 'active' : ''}
              aria-pressed={selectedEntity === entity}
              onClick={() => setSelectedEntity(entity)}
            >
              {entity}
            </button>
          ))}
        </div>
        <div className="assets-view-toggle" aria-label="xTrimo 生命周期">
          <button
            type="button"
            className={selectedStatus === 'all' ? 'active' : ''}
            aria-pressed={selectedStatus === 'all'}
            onClick={() => setSelectedStatus('all')}
          >
            全部状态
          </button>
          <button
            type="button"
            className={selectedStatus === 'online' ? 'active' : ''}
            aria-pressed={selectedStatus === 'online'}
            onClick={() => setSelectedStatus('online')}
          >
            已上线
          </button>
          <button
            type="button"
            className={selectedStatus === 'comingSoon' ? 'active' : ''}
            aria-pressed={selectedStatus === 'comingSoon'}
            onClick={() => setSelectedStatus('comingSoon')}
          >
            即将上线
          </button>
        </div>
      </div>

      <section
        className="assets-xtrimo-recommendations xtrimo-recommendations"
        aria-label="Agent 推荐"
      >
        <div className="assets-list-header">
          <h2>Agent 推荐</h2>
          <span>{recommendedRecords.length} 项</span>
        </div>
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
        onClick={() => onNotify('资产操作将在后续 Demo 中展开')}
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
      <p>{record.description}</p>
      <div className="assets-record-card__meta assets-record-card__meta--stacked">
        <span>{record.primaryMeta}</span>
        <span>{record.secondaryMeta}</span>
        {record.tertiaryMeta ? <span>{record.tertiaryMeta}</span> : null}
      </div>
      <div className="assets-record-card__meta">
        <span>{assetScopeLabel[record.scope]}</span>
        <span>{record.projectName ?? '公共资产'}</span>
        <span>{record.updatedAt}</span>
      </div>
      <button
        type="button"
        className="assets-record-card__action"
        onClick={() => onNotify('实验资产详情将在后续 Demo 中展开')}
      >
        查看详情
      </button>
    </article>
  )
}

function ExperimentAssetsTable({
  item,
  records,
  onNotify,
}: {
  item: ExperimentAssetRecord['category']
  records: ExperimentAssetRecord[]
  onNotify: (message: string) => void
}) {
  const columns = getExperimentTableColumns(item)
  const rowClassName = `assets-table__row assets-table__row--experiment assets-table__row--experiment-${columns.length}`

  return (
    <div className="assets-table assets-experiment-table" role="table" aria-label="实验资产表格">
      <div
        className={`assets-table__row--head ${rowClassName}`}
        role="row"
      >
        <span role="columnheader">名称</span>
        {columns.map((column) => (
          <span role="columnheader" key={column.header}>
            {column.header}
          </span>
        ))}
        <span role="columnheader">操作</span>
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
              <small>{record.description}</small>
            </span>
          </span>
          {columns.map((column) => (
            <span role="cell" key={column.header}>
              {column.value(record)}
            </span>
          ))}
          <span role="cell">
            <button
              type="button"
              className="assets-row-action"
              onClick={() => onNotify('实验资产详情将在后续 Demo 中展开')}
            >
              <MoreHorizontalIcon className="assets-row-action__icon" />
            </button>
          </span>
        </div>
      ))}
    </div>
  )
}

function GenericRecordCard({
  title,
  badge,
  meta,
  description,
}: {
  title: string
  badge: string
  meta: string
  description: string
}) {
  return (
    <article className="assets-record-card assets-record-card--generic">
      <div className="assets-record-card__top">
        <PackageIcon className="assets-record-card__icon" />
        <span className="assets-record-card__badge">{badge}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="assets-record-card__meta">
        <span>{meta}</span>
      </div>
    </article>
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
        <span
          className={`assets-record-card__badge xtrimo-model-card__badge ${
            isCallable
              ? 'xtrimo-model-card__badge--callable'
              : 'xtrimo-model-card__badge--preview'
          }`}
        >
          {isCallable ? '可调用' : '仅预览'}
        </span>
      </div>
      <h3>{record.name}</h3>
      <p>{record.agentUse}</p>
      <div className="assets-record-card__meta">
        <span>{record.capabilities.join(' / ')}</span>
        <span>{record.entities.join(' / ')}</span>
        <span>{record.version}</span>
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
              ? '模型详情将在后续 Demo 中展开'
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

type ExperimentTableColumn = {
  header: string
  value: (record: ExperimentAssetRecord) => string
}

function getExperimentTableColumns(
  item: ExperimentAssetRecord['category'],
): ExperimentTableColumn[] {
  if (item === 'experiment-list') {
    return [
      { header: '类型', value: (record) => experimentKindLabels[record.kind] },
      { header: '状态', value: (record) => record.status },
      { header: '项目', value: (record) => record.projectName ?? '公共资产' },
      { header: '分子数', value: (record) => getMetaPart(record.primaryMeta, 0) },
      { header: '实验类型', value: (record) => getMetaPart(record.primaryMeta, 1) },
      { header: '负责人', value: (record) => record.owner },
      { header: '更新时间', value: (record) => record.updatedAt },
    ]
  }

  if (item === 'execution') {
    return [
      { header: '类型', value: (record) => experimentKindLabels[record.kind] },
      { header: '状态', value: (record) => record.status },
      { header: '项目', value: (record) => record.projectName ?? '公共资产' },
      { header: 'CRO或设备', value: (record) => getMetaPart(record.primaryMeta, 0) },
      { header: '关联任务', value: (record) => record.secondaryMeta },
      { header: '时间', value: (record) => record.updatedAt },
      { header: '负责人', value: (record) => record.owner },
    ]
  }

  if (item === 'inventory') {
    return [
      { header: '类型', value: (record) => experimentKindLabels[record.kind] },
      { header: '状态', value: (record) => record.status },
      { header: '范围', value: (record) => assetScopeLabel[record.scope] },
      { header: '位置', value: (record) => record.secondaryMeta },
      { header: '批次', value: (record) => record.tertiaryMeta ?? record.projectName ?? '公共资产' },
      { header: '数量', value: (record) => record.primaryMeta },
      { header: '更新时间', value: (record) => record.updatedAt },
    ]
  }

  if (item === 'equipment') {
    return [
      { header: '类型', value: (record) => experimentKindLabels[record.kind] },
      { header: '状态', value: (record) => record.status },
      { header: '位置', value: (record) => record.primaryMeta },
      { header: '支持实验', value: (record) => record.secondaryMeta },
      { header: '自动化', value: (record) => record.tertiaryMeta ?? '未接入' },
      { header: '下个可用窗口', value: (record) => getEquipmentWindow(record) },
      { header: '更新时间', value: (record) => record.updatedAt },
    ]
  }

  return [
    { header: '类型', value: (record) => experimentKindLabels[record.kind] },
    { header: '状态', value: (record) => record.status },
    { header: '范围', value: (record) => assetScopeLabel[record.scope] },
    { header: '适用实验', value: (record) => record.primaryMeta },
    { header: '版本', value: (record) => getMetaPart(record.secondaryMeta, 0) },
    { header: '关键参数', value: (record) => record.tertiaryMeta ?? getMetaPart(record.secondaryMeta, 1) },
    { header: '维护人', value: (record) => record.owner },
    { header: '更新时间', value: (record) => record.updatedAt },
  ]
}

function getMetaPart(value: string, index: number) {
  return value.split(' · ')[index]?.trim() || value
}

function getEquipmentWindow(record: ExperimentAssetRecord) {
  if (record.kind === 'availabilityWindow') {
    return record.primaryMeta
  }

  if (record.secondaryMeta.startsWith('Next window:')) {
    return record.secondaryMeta.replace('Next window:', '').trim()
  }

  return record.status === '可用' || record.status === 'CRO 可用' ? '当前可用' : record.status
}

function getNewAssetMenuActions(
  section: AssetsSection,
  item: AssetMenuItemId,
): { label: string; message: string }[] {
  if (section === 'experiment' && isExperimentAssetItem(item)) {
    if (item === 'experiment-list') {
      return [
        {
          label: '新建实验订单草稿',
          message: '新建实验订单草稿将在后续 Demo 中展开',
        },
        {
          label: '新建设计包',
          message: '新建设计包将在后续 Demo 中展开',
        },
      ]
    }

    if (item === 'execution') {
      return [
        {
          label: '登记实验记录',
          message: '登记实验记录将在后续 Demo 中展开',
        },
        {
          label: '创建调度占位',
          message: '创建调度占位将在后续 Demo 中展开',
        },
      ]
    }

    if (item === 'inventory') {
      return [
        { label: '登记样本', message: '登记样本将在后续 Demo 中展开' },
        { label: '登记物料', message: '登记物料将在后续 Demo 中展开' },
        { label: '新增孔板', message: '新增孔板将在后续 Demo 中展开' },
      ]
    }

    if (item === 'equipment') {
      return [
        { label: '登记设备', message: '登记设备将在后续 Demo 中展开' },
        {
          label: '新增可用窗口',
          message: '新增可用窗口将在后续 Demo 中展开',
        },
      ]
    }

    return [
      { label: '新建配方', message: '新建配方将在后续 Demo 中展开' },
      {
        label: '复制公开配方到项目',
        message: '复制公开配方到项目将在后续 Demo 中展开',
      },
    ]
  }

  if (section === 'file') {
    return [
      { label: '新建文件夹', message: '新建文件夹将在后续 Demo 中展开' },
      { label: '新建文档', message: '新建文档将在后续 Demo 中展开' },
    ]
  }

  if (section === 'data') {
    return [
      { label: '新建数据集', message: '新建数据集将在后续 Demo 中展开' },
      { label: '登记数据表', message: '登记数据表将在后续 Demo 中展开' },
    ]
  }

  return [
    { label: '注册模型', message: '注册模型将在后续 Demo 中展开' },
    { label: '新建 Oracle', message: '新建 Oracle 将在后续 Demo 中展开' },
  ]
}

function fileMatches(record: FileAssetRecord, query: string) {
  return matchesQuery(
    [record.name, record.description, record.owner, record.kind, record.scope],
    query,
  )
}

function dataMatches(record: DataAssetRecord, query: string) {
  return matchesQuery(
    [record.name, record.description, record.owner, record.rows, record.scope],
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

export default AssetsPage
