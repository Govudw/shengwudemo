import { useMemo, useState } from 'react'
import type {
  AssetMenuItemId,
  AssetsSection,
} from '../../store/demoStoreLogic'
import {
  getProjectFileFolderId,
  getProjectManagementRecords,
} from '../../data/projectsMockData'
import type {
  ProjectManagementRecord,
  ProjectManagementSeedProject,
  ProjectManagementStatus,
  ProjectManagementThread,
  ProjectMember,
} from '../../data/projectsMockData'
import {
  ArchiveIcon,
  DatabaseIcon,
  FlaskIcon,
  FolderIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  TargetIcon,
} from '../icons'

type ProjectsPageProps = {
  projects: readonly ProjectManagementSeedProject[]
  onNotify: (message: string) => void
  onStartThread: (projectId: string) => void
  onOpenThread: (projectId: string, threadId: string) => void
  onOpenAssets: (
    section: AssetsSection,
    item: AssetMenuItemId,
    folderId: string | null,
  ) => void
}

type ProjectListTab = 'all' | 'favorites' | 'trash'
type ProjectActivityRange = 'all' | 'today' | 'thisWeek' | 'thisMonth'
type ProjectDetailTab =
  | 'overview'
  | 'members'
  | 'context'
  | 'threads'
  | 'assets'
  | 'settings'

const projectListTabs: { id: ProjectListTab; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'favorites', label: '我的收藏' },
  { id: 'trash', label: '回收站' },
]

const projectDetailTabs: { id: ProjectDetailTab; label: string }[] = [
  { id: 'overview', label: '概览' },
  { id: 'members', label: '成员与权限' },
  { id: 'context', label: '项目上下文' },
  { id: 'threads', label: '相关对话' },
  { id: 'assets', label: '资产摘要' },
  { id: 'settings', label: '设置' },
]

const statusLabels = {
  active: '进行中',
  atRisk: '有风险',
  completed: '已完成',
  archived: '已归档',
} as const satisfies Record<ProjectManagementStatus, string>

const statusFilterOptions: { id: 'all' | ProjectManagementStatus; label: string }[] = [
  { id: 'all', label: '全部状态' },
  { id: 'active', label: statusLabels.active },
  { id: 'atRisk', label: statusLabels.atRisk },
  { id: 'completed', label: statusLabels.completed },
  { id: 'archived', label: statusLabels.archived },
]

const activityRangeOptions: { id: ProjectActivityRange; label: string }[] = [
  { id: 'all', label: '最近活动' },
  { id: 'today', label: '今天' },
  { id: 'thisWeek', label: '本周' },
  { id: 'thisMonth', label: '本月' },
]

const dayMs = 24 * 60 * 60 * 1000

function ProjectsPage({
  projects,
  onNotify,
  onStartThread,
  onOpenThread,
  onOpenAssets,
}: ProjectsPageProps) {
  const [activeListTab, setActiveListTab] = useState<ProjectListTab>('all')
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | ProjectManagementStatus>(
    'all',
  )
  const [selectedResponsibleMemberId, setSelectedResponsibleMemberId] =
    useState('all')
  const [selectedActivityRange, setSelectedActivityRange] =
    useState<ProjectActivityRange>('all')
  const [detailProjectId, setDetailProjectId] = useState<string | null>(null)
  const [activeDetailTab, setActiveDetailTab] =
    useState<ProjectDetailTab>('overview')
  const projectRecords = useMemo(
    () => getProjectManagementRecords(projects),
    [projects],
  )
  const tagOptions = useMemo(
    () =>
      Array.from(new Set(projectRecords.flatMap((record) => record.tags))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [projectRecords],
  )
  const responsibleMemberOptions = useMemo(
    () =>
      Array.from(
        new Map(
          projectRecords.map((record) => [
            record.responsibleMember.id,
            record.responsibleMember,
          ]),
        ).values(),
      ).sort((left, right) => left.name.localeCompare(right.name)),
    [projectRecords],
  )
  const workspaceProjectIds = useMemo(
    () => new Set(projects.map((project) => project.id)),
    [projects],
  )
  const activeDetailRecord =
    detailProjectId === null
      ? undefined
      : projectRecords.find((record) => record.projectId === detailProjectId)

  if (activeDetailRecord) {
    return (
      <ProjectDetailPage
        record={activeDetailRecord}
        activeTab={activeDetailTab}
        onBack={() => setDetailProjectId(null)}
        onTabChange={setActiveDetailTab}
        onNotify={onNotify}
        onStartThread={onStartThread}
        onOpenThread={onOpenThread}
        onOpenAssets={onOpenAssets}
        canStartThread={
          workspaceProjectIds.has(activeDetailRecord.projectId) &&
          !activeDetailRecord.trashed
        }
      />
    )
  }

  const visibleRecords = getVisibleProjectRecords(
    projectRecords,
    activeListTab,
    query,
    selectedTag,
    selectedStatus,
    selectedResponsibleMemberId,
    selectedActivityRange,
  )

  function openProject(projectId: string) {
    setDetailProjectId(projectId)
    setActiveDetailTab('overview')
  }

  return (
    <div className="projects-page" aria-label="Projects management">
      <main className="projects-main">
        <header className="projects-main__header projects-main__header--compact">
          <div className="projects-main__title">
            <h1>项目管理</h1>
          </div>
          <div className="projects-main__actions">
            <button
              type="button"
              className="projects-action-button"
              onClick={() => onNotify('项目视图导出将在后续 Demo 中展开')}
            >
              <ShareIcon className="projects-action-button__icon" />
              导出
            </button>
            <button
              type="button"
              className="projects-action-button projects-action-button--primary"
              onClick={() => onNotify('新建项目将在后续 Demo 中展开')}
            >
              <PlusIcon className="projects-action-button__icon" />
              新建项目
            </button>
          </div>
        </header>

        <div className="projects-tabs" role="tablist" aria-label="项目筛选">
          {projectListTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`projects-tab${
                activeListTab === tab.id ? ' projects-tab--active' : ''
              }`}
              aria-label={tab.label}
              aria-selected={activeListTab === tab.id}
              onClick={() => setActiveListTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section className="projects-toolbar" aria-label="项目管理工具">
          <label className="projects-search">
            <SearchIcon className="projects-search__icon" />
            <input
              aria-label="搜索项目"
              value={query}
              placeholder="搜索项目、负责人或权限成员"
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </label>
          <select
            className="projects-filter-select"
            aria-label="筛选标签"
            value={selectedTag}
            onChange={(event) => setSelectedTag(event.currentTarget.value)}
          >
            <option value="all">全部标签</option>
            {tagOptions.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            className="projects-filter-select"
            aria-label="筛选项目状态"
            value={selectedStatus}
            disabled={activeListTab === 'trash'}
            onChange={(event) =>
              setSelectedStatus(event.currentTarget.value as ProjectManagementStatus | 'all')
            }
          >
            {statusFilterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="projects-filter-select"
            aria-label="筛选负责人"
            value={selectedResponsibleMemberId}
            onChange={(event) =>
              setSelectedResponsibleMemberId(event.currentTarget.value)
            }
          >
            <option value="all">全部负责人</option>
            {responsibleMemberOptions.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <select
            className="projects-filter-select"
            aria-label="筛选最近活动"
            value={selectedActivityRange}
            onChange={(event) =>
              setSelectedActivityRange(
                event.currentTarget.value as ProjectActivityRange,
              )
            }
          >
            {activityRangeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </section>

        <ProjectRecordsTable
          records={visibleRecords}
          onOpenProject={openProject}
          onNotify={onNotify}
        />
      </main>
    </div>
  )
}

function ProjectRecordsTable({
  records,
  onOpenProject,
  onNotify,
}: {
  records: ProjectManagementRecord[]
  onOpenProject: (projectId: string) => void
  onNotify: (message: string) => void
}) {
  if (records.length === 0) {
    return <div className="projects-empty-state">没有匹配的项目</div>
  }

  return (
    <div className="projects-table-card">
      <table className="projects-table">
        <thead>
          <tr>
            <th scope="col">项目</th>
            <th scope="col">状态</th>
            <th scope="col">负责人</th>
            <th scope="col">读取权限</th>
            <th scope="col">编辑权限</th>
            <th scope="col">对话</th>
            <th scope="col">资产</th>
            <th scope="col">最近活动</th>
            <th scope="col">更多</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.projectId}>
              <td>
                <button
                  type="button"
                  className="projects-row-button"
                  aria-label={`打开项目 ${record.name}`}
                  onClick={() => onOpenProject(record.projectId)}
                >
                  <span className="projects-row-icon">
                    {record.trashed ? (
                      <ArchiveIcon />
                    ) : (
                      <FolderIcon />
                    )}
                  </span>
                  <span className="projects-row-main">
                    <span className="projects-row-name">{record.name}</span>
                    <span className="projects-row-description">
                      {record.description}
                    </span>
                    <ProjectTags tags={record.tags} />
                  </span>
                </button>
              </td>
              <td>
                <ProjectStatusBadge status={record.status} />
              </td>
              <td>
                <MemberIdentity member={record.responsibleMember} />
              </td>
              <td>
                <MemberList members={record.readOnlyPermissionMembers} />
              </td>
              <td>
                <MemberList members={record.editPermissionMembers} />
              </td>
              <td>
                <strong>{record.threadCount}</strong>
                <span className="projects-table-muted">条相关对话</span>
              </td>
              <td>
                <span>{formatAssetSummary(record)}</span>
              </td>
              <td>
                <span>{record.recentActivity}</span>
                {record.recentActivityThreadTitle ? (
                  <span className="projects-table-muted">
                    {record.recentActivityThreadTitle}
                  </span>
                ) : null}
              </td>
              <td>
                <button
                  type="button"
                  className="projects-row-more"
                  aria-label={`更多项目操作 ${record.name}`}
                  onClick={() => onNotify('更多项目操作将在后续 Demo 中展开')}
                >
                  <MoreHorizontalIcon className="projects-row-more__icon" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProjectDetailPage({
  record,
  activeTab,
  onBack,
  onTabChange,
  onNotify,
  onStartThread,
  onOpenThread,
  onOpenAssets,
  canStartThread,
}: {
  record: ProjectManagementRecord
  activeTab: ProjectDetailTab
  onBack: () => void
  onTabChange: (tab: ProjectDetailTab) => void
  onNotify: (message: string) => void
  onStartThread: (projectId: string) => void
  onOpenThread: (projectId: string, threadId: string) => void
  onOpenAssets: (
    section: AssetsSection,
    item: AssetMenuItemId,
    folderId: string | null,
  ) => void
  canStartThread: boolean
}) {
  return (
    <div className="projects-page">
      <main className="projects-detail-page" aria-label={`项目详情 ${record.name}`}>
        <header className="projects-detail-header projects-detail-header--compact">
          <div className="projects-detail-header__copy">
            <button
              type="button"
              className="projects-detail-back-button"
              aria-label="返回项目管理"
              onClick={onBack}
            >
              {'<'}
            </button>
            <h1>{record.name}</h1>
          </div>
          <div className="projects-detail-header__actions">
            <button
              type="button"
              className="projects-action-button"
              onClick={() => onNotify('项目收藏状态将在后续 Demo 中展开')}
            >
              {record.favoritedByCurrentUser ? '已收藏' : '收藏'}
            </button>
            <button
              type="button"
              className="projects-action-button projects-action-button--primary"
              disabled={!canStartThread}
              onClick={() => onStartThread(record.projectId)}
            >
              <PlusIcon className="projects-action-button__icon" />
              新建对话
            </button>
            <button
              type="button"
              className="projects-icon-button"
              aria-label={`更多项目操作 ${record.name}`}
              onClick={() => onNotify('更多项目操作将在后续 Demo 中展开')}
            >
              <MoreHorizontalIcon className="projects-icon-button__icon" />
            </button>
          </div>
        </header>

        <ProjectDetailMetrics record={record} />

        <div className="projects-detail-tabs" role="tablist" aria-label="项目详情">
          {projectDetailTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              className={`projects-detail-tab${
                activeTab === tab.id ? ' projects-detail-tab--active' : ''
              }`}
              aria-label={tab.label}
              aria-selected={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <ProjectDetailContent
          record={record}
          activeTab={activeTab}
          onNotify={onNotify}
          onOpenThread={onOpenThread}
          onOpenAssets={onOpenAssets}
        />
      </main>
    </div>
  )
}

function ProjectDetailMetrics({ record }: { record: ProjectManagementRecord }) {
  const assetCount =
    record.assetSummary.files +
    record.assetSummary.data +
    record.assetSummary.experiments +
    record.assetSummary.models
  const metrics = [
    { label: '负责人', value: record.responsibleMember.name },
    { label: '读取权限', value: `${record.readOnlyPermissionMembers.length} 人` },
    { label: '编辑权限', value: `${record.editPermissionMembers.length} 人` },
    { label: '相关对话', value: `${record.threadCount}` },
    { label: '资产摘要', value: `${assetCount} 项` },
    { label: '最近活动', value: record.recentActivity },
  ]

  return (
    <section className="projects-detail-metrics" aria-label="项目指标">
      {metrics.map((metric) => (
        <div className="projects-detail-metric" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
        </div>
      ))}
    </section>
  )
}

function ProjectDetailContent({
  record,
  activeTab,
  onNotify,
  onOpenThread,
  onOpenAssets,
}: {
  record: ProjectManagementRecord
  activeTab: ProjectDetailTab
  onNotify: (message: string) => void
  onOpenThread: (projectId: string, threadId: string) => void
  onOpenAssets: (
    section: AssetsSection,
    item: AssetMenuItemId,
    folderId: string | null,
  ) => void
}) {
  if (activeTab === 'members') {
    return <ProjectMembersPanel record={record} />
  }

  if (activeTab === 'context') {
    return <ProjectContextPanel record={record} />
  }

  if (activeTab === 'threads') {
    return <ProjectThreadsPanel record={record} onOpenThread={onOpenThread} />
  }

  if (activeTab === 'assets') {
    return <ProjectAssetsPanel record={record} onOpenAssets={onOpenAssets} />
  }

  if (activeTab === 'settings') {
    return <ProjectSettingsPanel record={record} onNotify={onNotify} />
  }

  return <ProjectOverviewPanel record={record} />
}

function ProjectOverviewPanel({ record }: { record: ProjectManagementRecord }) {
  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>项目概览</h2>
        <p>{record.contextSummary.projectContext}</p>
      </section>
      <section className="projects-detail-section">
        <h3>当前目标</h3>
        <p>{record.contextSummary.objective}</p>
      </section>
      <section className="projects-detail-section">
        <h3>最近活动</h3>
        <p>
          {record.recentActivityThreadTitle
            ? `${record.recentActivityThreadTitle} · ${record.recentActivity}`
            : record.recentActivity}
        </p>
      </section>
    </div>
  )
}

function ProjectMembersPanel({ record }: { record: ProjectManagementRecord }) {
  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>成员与权限</h2>
        <div className="projects-permission-grid">
          <PermissionCard
            title="负责人"
            description="唯一负责成员，和读取/编辑权限分开维护。"
            members={[record.responsibleMember]}
          />
          <PermissionCard
            title="读取权限"
            description="可查看项目上下文、相关对话和项目资产。"
            members={record.readOnlyPermissionMembers}
          />
          <PermissionCard
            title="编辑权限"
            description="可维护项目上下文、发起对话和登记资产。"
            members={record.editPermissionMembers}
          />
          <div className="projects-permission-card">
            <strong>权限边界</strong>
            <p>
              负责人不会自动并入读取或编辑权限，两个权限列表也不会合并展示。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function ProjectContextPanel({ record }: { record: ProjectManagementRecord }) {
  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>项目上下文</h2>
        <p>{record.contextSummary.projectContext}</p>
      </section>
      <section className="projects-detail-section">
        <h3>约束</h3>
        <BulletList values={record.contextSummary.constraints} />
      </section>
      <section className="projects-detail-section">
        <h3>交付物</h3>
        <BulletList values={record.contextSummary.deliverables} />
      </section>
    </div>
  )
}

function ProjectThreadsPanel({
  record,
  onOpenThread,
}: {
  record: ProjectManagementRecord
  onOpenThread: (projectId: string, threadId: string) => void
}) {
  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>相关对话</h2>
        {record.threads.length > 0 ? (
          <div className="projects-thread-list">
            {record.threads.map((thread) => (
              <ProjectThreadButton
                key={thread.id}
                projectId={record.projectId}
                thread={thread}
                onOpenThread={onOpenThread}
              />
            ))}
          </div>
        ) : (
          <p>当前项目没有可打开的相关对话。</p>
        )}
      </section>
    </div>
  )
}

function ProjectAssetsPanel({
  record,
  onOpenAssets,
}: {
  record: ProjectManagementRecord
  onOpenAssets: (
    section: AssetsSection,
    item: AssetMenuItemId,
    folderId: string | null,
  ) => void
}) {
  const projectFileFolderId = getProjectFileFolderId(record.projectId)

  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>资产摘要</h2>
        <div className="projects-asset-summary">
          <AssetSummaryAction
            label="打开项目文件"
            count={record.assetSummary.files}
            description={
              projectFileFolderId ? '进入项目文件夹' : '暂无独立项目文件夹'
            }
            icon={FolderIcon}
            disabled={!projectFileFolderId}
            onClick={() =>
              onOpenAssets('file', 'project-files', projectFileFolderId)
            }
          />
          <AssetSummaryAction
            label="查看数据摘要"
            count={record.assetSummary.data}
            description="进入数据集"
            icon={DatabaseIcon}
            onClick={() => onOpenAssets('data', 'datasets', null)}
          />
          <AssetSummaryAction
            label="查看实验摘要"
            count={record.assetSummary.experiments}
            description="进入实验列表"
            icon={FlaskIcon}
            onClick={() => onOpenAssets('experiment', 'experiment-list', null)}
          />
          <AssetSummaryAction
            label="查看模型摘要"
            count={record.assetSummary.models}
            description="进入项目模型"
            icon={PackageIcon}
            onClick={() => onOpenAssets('model', 'project-models', null)}
          />
        </div>
      </section>
    </div>
  )
}

function ProjectSettingsPanel({
  record,
  onNotify,
}: {
  record: ProjectManagementRecord
  onNotify: (message: string) => void
}) {
  return (
    <div className="projects-detail-content">
      <section className="projects-detail-section">
        <h2>设置</h2>
        <p>项目设置操作暂时以 Demo 通知展示，不修改真实数据。</p>
        <div className="projects-chip-list">
          <button
            type="button"
            className="projects-setting-button"
            onClick={() => onNotify(`${record.name} 的权限设置将在后续 Demo 中展开`)}
          >
            管理权限
          </button>
          <button
            type="button"
            className="projects-setting-button"
            onClick={() => onNotify(`${record.name} 的归档设置将在后续 Demo 中展开`)}
          >
            归档设置
          </button>
        </div>
      </section>
    </div>
  )
}

function ProjectThreadButton({
  projectId,
  thread,
  onOpenThread,
}: {
  projectId: string
  thread: ProjectManagementThread
  onOpenThread: (projectId: string, threadId: string) => void
}) {
  return (
    <button
      type="button"
      className="projects-thread-row"
      aria-label={`打开对话 ${thread.title}`}
      onClick={() => onOpenThread(projectId, thread.id)}
    >
      <MessageCircleIcon className="projects-thread-row__icon" />
      <span>
        <strong>{thread.title}</strong>
        <span>{thread.lastActivity}</span>
      </span>
    </button>
  )
}

function AssetSummaryAction({
  label,
  count,
  description,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string
  count: number
  description: string
  icon: typeof FolderIcon
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className="projects-summary-action"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="projects-summary-action__icon" />
      <span>
        <strong>{label}</strong>
        <span>
          {count} 项 · {description}
        </span>
      </span>
    </button>
  )
}

function PermissionCard({
  title,
  description,
  members,
}: {
  title: string
  description: string
  members: ProjectMember[]
}) {
  return (
    <div className="projects-permission-card">
      <strong>{title}</strong>
      <p>{description}</p>
      <MemberList members={members} />
    </div>
  )
}

function MemberIdentity({ member }: { member: ProjectMember }) {
  return (
    <>
      <strong>{member.name}</strong>
      <span className="projects-table-muted">{member.title}</span>
    </>
  )
}

function MemberList({ members }: { members: ProjectMember[] }) {
  if (members.length === 0) {
    return <span className="projects-member-list">无</span>
  }

  return (
    <span className="projects-member-list">
      {members.map((member) => (
        <span className="projects-member-chip" key={member.id}>
          {member.name}
        </span>
      ))}
    </span>
  )
}

function ProjectTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null
  }

  return (
    <span className="projects-row-tags">
      {tags.map((tag) => (
        <span className="projects-chip" key={tag}>
          {tag}
        </span>
      ))}
    </span>
  )
}

function ProjectStatusBadge({ status }: { status: ProjectManagementStatus }) {
  return (
    <span className={`projects-status ${getStatusClassName(status)}`}>
      <TargetIcon className="projects-status__icon" />
      {statusLabels[status]}
    </span>
  )
}

function BulletList({ values }: { values: string[] }) {
  return (
    <div className="projects-chip-list">
      {values.map((value) => (
        <span className="projects-chip" key={value}>
          {value}
        </span>
      ))}
    </div>
  )
}

function getVisibleProjectRecords(
  records: ProjectManagementRecord[],
  activeTab: ProjectListTab,
  query: string,
  selectedTag: string,
  selectedStatus: 'all' | ProjectManagementStatus,
  selectedResponsibleMemberId: string,
  selectedActivityRange: ProjectActivityRange,
) {
  const normalizedQuery = query.trim().toLowerCase()
  const now = Date.now()

  return records
    .filter((record) => {
      if (activeTab === 'trash') {
        return record.trashed
      }

      if (record.trashed) {
        return false
      }

      if (activeTab === 'favorites') {
        return record.favoritedByCurrentUser
      }

      return true
    })
    .filter((record) =>
      normalizedQuery ? projectRecordMatches(record, normalizedQuery) : true,
    )
    .filter((record) =>
      selectedTag === 'all' ? true : record.tags.includes(selectedTag),
    )
    .filter((record) =>
      activeTab === 'trash' || selectedStatus === 'all'
        ? true
        : record.status === selectedStatus,
    )
    .filter((record) =>
      selectedResponsibleMemberId === 'all'
        ? true
        : record.responsibleMember.id === selectedResponsibleMemberId,
    )
    .filter((record) =>
      projectLastActivityMatchesRange(record, selectedActivityRange, now),
    )
    .sort((left, right) => right.recentActivityAt - left.recentActivityAt)
}

function projectLastActivityMatchesRange(
  record: ProjectManagementRecord,
  selectedActivityRange: ProjectActivityRange,
  now: number,
) {
  if (selectedActivityRange === 'all') {
    return true
  }

  const thresholds = {
    today: now - dayMs,
    thisWeek: now - 7 * dayMs,
    thisMonth: now - 30 * dayMs,
  } as const satisfies Record<Exclude<ProjectActivityRange, 'all'>, number>

  return record.lastActivityAt >= thresholds[selectedActivityRange]
}

function projectRecordMatches(
  record: ProjectManagementRecord,
  normalizedQuery: string,
) {
  return [
    record.name,
    record.description,
    record.responsibleMember.name,
    ...record.readOnlyPermissionMembers.map((member) => member.name),
    ...record.editPermissionMembers.map((member) => member.name),
    ...record.tags,
  ].some((value) => value.toLowerCase().includes(normalizedQuery))
}

function formatAssetSummary(record: ProjectManagementRecord) {
  return [
    `${record.assetSummary.files} 文件`,
    `${record.assetSummary.data} 数据`,
    `${record.assetSummary.experiments} 实验`,
    `${record.assetSummary.models} 模型`,
  ].join(' · ')
}

function getStatusClassName(status: ProjectManagementStatus) {
  if (status === 'atRisk') {
    return 'projects-status--at-risk'
  }

  if (status === 'completed') {
    return 'projects-status--completed'
  }

  if (status === 'archived') {
    return 'projects-status--archived'
  }

  return ''
}

export default ProjectsPage
