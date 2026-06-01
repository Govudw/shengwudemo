import { useMemo, useState } from 'react'
import {
  assetMenuSections,
  dataAssetRecords,
  experimentAssetRecords,
  fileAssetRecords,
  getAssetMenuItem,
  getAssetSection,
  isFileAssetItem,
  modelAssetRecords,
  projectFileFolders,
  xtrimoModelRecords,
} from '../../data/assetsMockData'
import type {
  DataAssetRecord,
  ExperimentAssetRecord,
  FileAssetRecord,
  ModelAssetRecord,
  XtrimoCapability,
  XtrimoEntity,
  XtrimoModelRecord,
  XtrimoModelStatus,
} from '../../data/assetsMockData'
import type {
  AssetMenuItemId,
  AssetsFileViewMode,
  AssetsSection,
} from '../../store/demoStoreLogic'
import {
  ArchiveIcon,
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
  openFolderId: string | null
  onSelectionChange: (section: AssetsSection, item: AssetMenuItemId) => void
  onFileViewModeChange: (mode: AssetsFileViewMode) => void
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
  openFolderId,
  onSelectionChange,
  onFileViewModeChange,
  onOpenFolderChange,
  onNotify,
}: AssetsPageProps) {
  const [query, setQuery] = useState('')
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const activeSectionMeta = getAssetSection(activeSection)
  const activeItemMeta = getAssetMenuItem(activeSection, activeItem)
  const isXtrimoView = activeSection === 'model' && activeItem === 'xtrimo'

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

      <main className="assets-main" aria-label="Assets workbench">
        <header className="assets-main__header">
          <div className="assets-main__title">
            <span className="assets-main__eyebrow">
              {activeSectionMeta?.label} / {activeItemMeta?.label}
            </span>
            <h1>{activeItemMeta?.label}</h1>
            <p>{activeSectionMeta?.description}</p>
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
                      <button
                        type="button"
                        onClick={() => handleMockAction('新建文件夹将在后续 Demo 中展开')}
                      >
                        新建文件夹
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockAction('新建数据集将在后续 Demo 中展开')}
                      >
                        新建数据集
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockAction('新建实验需求将在后续 Demo 中展开')}
                      >
                        新建实验需求
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMockAction('注册模型将在后续 Demo 中展开')}
                      >
                        注册模型
                      </button>
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

        <section className="assets-toolbar" aria-label="Assets tools">
          <label className="assets-search">
            <SearchIcon className="assets-search__icon" />
            <input
              aria-label="搜索当前资产"
              value={query}
              placeholder="搜索当前资产"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          {isFileAssetItem(activeItem) ? (
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

        <AssetContent
          activeItem={activeItem}
          fileViewMode={fileViewMode}
          openFolderId={openFolderId}
          query={query}
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
  openFolderId,
  query,
  onOpenFolderChange,
  onNotify,
}: {
  activeItem: AssetMenuItemId
  fileViewMode: AssetsFileViewMode
  openFolderId: string | null
  query: string
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

  if (['request', 'execution', 'inventory', 'configuration'].includes(activeItem)) {
    return (
      <ExperimentAssetsView
        item={activeItem as ExperimentAssetRecord['category']}
        query={query}
      />
    )
  }

  return (
    <ModelAssetsView
      item={activeItem as ModelAssetRecord['category']}
      query={query}
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

function ExperimentAssetsView({
  item,
  query,
}: {
  item: ExperimentAssetRecord['category']
  query: string
}) {
  const records = experimentAssetRecords.filter(
    (record) => record.category === item && experimentMatches(record, query),
  )

  return (
    <section className="assets-content">
      <AssetListHeader title="实验对象" count={records.length} />
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

function ModelAssetsView({
  item,
  query,
  onNotify,
}: {
  item: ModelAssetRecord['category']
  query: string
  onNotify: (message: string) => void
}) {
  if (item === 'xtrimo') {
    return <XtrimoModelAssetsView query={query} onNotify={onNotify} />
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
  onNotify,
}: {
  query: string
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

  function handleStatusChange(status: XtrimoModelStatus | 'all') {
    setSelectedStatus(status)

    if (status !== 'all') {
      setSelectedCapability('all')
      setSelectedEntity('all')
    }
  }

  return (
    <section className="assets-content assets-content--xtrimo">
      <div className="assets-xtrimo-header">
        <h2>xTrimo 平台模型目录</h2>
        <p>
          BioMap 自研生命科学基础模型与任务模型家族，覆盖结构、亲和力、稳定性、成药性和实验设计等研发流程。
        </p>
      </div>

      <div className="assets-xtrimo-stats" aria-label="xTrimo 模型统计">
        <span>33 模型</span>
        <span>24 已上线</span>
        <span>9 即将上线</span>
        <span>14 能力类型</span>
        <span>7 实体类型</span>
        <span>24 可调用</span>
        <span>6 Agent 推荐</span>
      </div>

      <section className="assets-xtrimo-recommendations" aria-label="Agent 推荐">
        <div className="assets-list-header">
          <h2>Agent 推荐</h2>
          <span>{recommendedRecords.length} 项</span>
        </div>
        <div className="assets-record-grid assets-record-grid--dense">
          {recommendedRecords.map((record) => (
            <XtrimoModelCard key={record.id} record={record} onNotify={onNotify} />
          ))}
        </div>
      </section>

      <div className="assets-xtrimo-filters" aria-label="xTrimo 模型筛选">
        <div className="assets-xtrimo-filter-row">
          <span>能力</span>
          <button
            type="button"
            className={selectedCapability === 'all' ? 'active' : ''}
            onClick={() => setSelectedCapability('all')}
          >
            全部能力
          </button>
          {xtrimoCapabilities.map((capability) => (
            <button
              type="button"
              key={capability}
              className={selectedCapability === capability ? 'active' : ''}
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
            onClick={() => setSelectedEntity('all')}
          >
            全部实体
          </button>
          {xtrimoEntities.map((entity) => (
            <button
              type="button"
              key={entity}
              className={selectedEntity === entity ? 'active' : ''}
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
            onClick={() => handleStatusChange('all')}
          >
            全部状态
          </button>
          <button
            type="button"
            className={selectedStatus === 'online' ? 'active' : ''}
            onClick={() => handleStatusChange('online')}
          >
            已上线
          </button>
          <button
            type="button"
            className={selectedStatus === 'comingSoon' ? 'active' : ''}
            onClick={() => handleStatusChange('comingSoon')}
          >
            即将上线
          </button>
        </div>
      </div>

      <AssetListHeader title="模型目录" count={filteredRecords.length} />
      <div className="assets-record-grid assets-record-grid--dense">
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
  onNotify,
}: {
  record: XtrimoModelRecord
  onNotify: (message: string) => void
}) {
  const isCallable = record.callability === 'callable'

  return (
    <button
      type="button"
      className="assets-record-card assets-record-card--generic assets-record-card--xtrimo"
      onClick={() =>
        onNotify(
          isCallable
            ? '模型详情将在后续 Demo 中展开'
            : '该模型即将上线，当前仅支持预览',
        )
      }
    >
      <div className="assets-record-card__top">
        <PackageIcon className="assets-record-card__icon" />
        <span className="assets-record-card__badge">
          {record.status === 'online' ? '已上线' : '即将上线'}
        </span>
        <span className="assets-record-card__badge">
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
    </button>
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
    [record.name, record.description, record.owner, record.status, record.scope],
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

export default AssetsPage
