import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, MouseEvent, ReactNode } from 'react'
import {
  BrainIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FlaskIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
} from './icons'
import PipelineDagCanvas, {
  dagNodeKindLabels,
  dagNodeSubtypeLabels,
  dagResourceLabels,
} from './PipelineDagCanvas'
import {
  capabilityEntries,
  capabilityTypeLabels,
  capabilityTypeOrder,
} from '../data/mockCapabilities'
import type {
  CapabilityEntryKind,
  CapabilitySource,
  CapabilityStatus,
  MockCapabilityEntry,
  PipelineDag,
  PipelineDagNode,
} from '../data/mockCapabilities'

type CapabilitiesPageProps = {
  onNotify: (message: string) => void
}

type FilterValue = 'all'

const sourceLabels: Record<CapabilitySource, string> = {
  created: '自建',
  installed: '已安装',
  preset: '预设',
  system: '系统',
}

const statusLabels: Record<CapabilityStatus, string> = {
  active: '启用中',
  draft: '草稿',
  inactive: '未启用',
  'needs-review': '待审核',
}

const singularKindLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Pipeline',
  skill: 'Skill',
  'mcp-server': 'MCP Server',
  plugin: 'Plugin',
}

const pageTitleLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Pipelines',
  skill: 'Skills',
  'mcp-server': 'MCP Servers',
  plugin: 'Plugins',
}

const actionLabels: Record<CapabilityEntryKind, string> = {
  pipeline: '用 Agent 构建 Pipeline',
  skill: '用 Agent 创建 Skill',
  'mcp-server': '连接 MCP Server',
  plugin: '申请 Plugin 权限',
}

const actionMessages: Record<CapabilityEntryKind, string> = {
  pipeline: 'Agent Builder 会在后续演示中连接 Pipeline 创建流程',
  skill: 'Agent Builder 会在后续演示中连接 Skill 创建流程',
  'mcp-server': 'MCP 连接向导会在后续演示中展开',
  plugin: 'Plugin 申请流程会在后续演示中展开',
}

function CapabilitiesPage({ onNotify }: CapabilitiesPageProps) {
  const [activeKind, setActiveKind] =
    useState<CapabilityEntryKind>('pipeline')
  const [query, setQuery] = useState('')
  const [sourceFilter, setSourceFilter] =
    useState<CapabilitySource | FilterValue>('all')
  const [statusFilter, setStatusFilter] =
    useState<CapabilityStatus | FilterValue>('all')
  const [selectedByKind, setSelectedByKind] = useState<
    Record<CapabilityEntryKind, string>
  >(() => getInitialSelectedIds())
  const [dialogEntryId, setDialogEntryId] = useState<string | null>(null)
  const [dagDialogEntryId, setDagDialogEntryId] = useState<string | null>(null)
  const dagDialogTriggerRef = useRef<HTMLElement | null>(null)
  const [enabledById, setEnabledById] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      capabilityEntries
        .filter((entry) => entry.kind === 'skill')
        .map((entry) => [entry.id, Boolean(entry.enabledForMainAgent)]),
    ),
  )

  const visibleEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return capabilityEntries.filter((entry) => {
      if (entry.kind !== activeKind) {
        return false
      }

      if (sourceFilter !== 'all' && entry.source !== sourceFilter) {
        return false
      }

      if (statusFilter !== 'all' && entry.status !== statusFilter) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      return [
        entry.name,
        entry.description,
        entry.owner,
        entry.version,
        ...entry.tags,
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    })
  }, [activeKind, query, sourceFilter, statusFilter])

  const selectedEntry =
    visibleEntries.find((entry) => entry.id === selectedByKind[activeKind]) ??
    visibleEntries[0]

  const openDialogEntry =
    capabilityEntries.find(
      (entry) => entry.kind !== 'pipeline' && entry.id === dialogEntryId,
    ) ?? null
  const openDagEntry =
    capabilityEntries.find(
      (entry) =>
        entry.kind === 'pipeline' && entry.id === dagDialogEntryId && entry.dag,
    ) ?? null
  const hasOpenModal = Boolean(openDialogEntry || openDagEntry)

  function handleKindChange(kind: CapabilityEntryKind) {
    setActiveKind(kind)
    setQuery('')
    setSourceFilter('all')
    setStatusFilter('all')
    setDialogEntryId(null)
    setDagDialogEntryId(null)
  }

  function handleSelectEntry(entry: MockCapabilityEntry) {
    setSelectedByKind((current) => ({
      ...current,
      [entry.kind]: entry.id,
    }))
  }

  function handleSkillSwitch(
    entry: MockCapabilityEntry,
    enabled: boolean,
    event?: KeyboardEvent | MouseEvent,
  ) {
    event?.stopPropagation()
    setEnabledById((current) => ({
      ...current,
      [entry.id]: enabled,
    }))
  }

  function handleOpenDag(entryId: string) {
    dagDialogTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setDagDialogEntryId(entryId)
  }

  function handleCloseDag() {
    setDagDialogEntryId(null)
    window.setTimeout(() => {
      dagDialogTriggerRef.current?.focus()
    }, 0)
  }

  return (
    <main className="capabilities-page" aria-label="Capabilities 管理">
      <aside
        className="capabilities-nav"
        aria-label="Capability types"
        aria-hidden={hasOpenModal ? true : undefined}
        inert={hasOpenModal ? true : undefined}
      >
        <div className="capabilities-nav__header">
          <span className="capabilities-nav__label">Capabilities</span>
          <span className="capabilities-nav__count">
            {capabilityEntries.length}
          </span>
        </div>
        <div className="capabilities-nav__list">
          {capabilityTypeOrder.map((kind) => {
            const count = capabilityEntries.filter(
              (entry) => entry.kind === kind,
            ).length
            const isActive = kind === activeKind
            const Icon = getKindIcon(kind)

            return (
              <button
                key={kind}
                type="button"
                className={`capabilities-nav__item${
                  isActive ? ' capabilities-nav__item--active' : ''
                }`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => handleKindChange(kind)}
              >
                <span className="capabilities-nav__icon" aria-hidden="true">
                  <Icon className="capabilities-icon" />
                </span>
                <span className="capabilities-nav__text">
                  <span className="capabilities-nav__name">
                    {capabilityTypeLabels[kind]}
                  </span>
                  <span className="capabilities-nav__description">
                    {kind === 'plugin'
                      ? '预览'
                      : `已配置 ${count} 个`}
                  </span>
                </span>
                <span className="capabilities-nav__number">{count}</span>
              </button>
            )
          })}
        </div>
      </aside>

      <section
        className="capabilities-workspace"
        aria-hidden={hasOpenModal ? true : undefined}
        inert={hasOpenModal ? true : undefined}
      >
        <header className="capabilities-header">
          <div className="capabilities-header__copy">
            <h1>{pageTitleLabels[activeKind]}</h1>
          </div>
          <button
            type="button"
            className="capabilities-primary-action"
            onClick={() => onNotify(actionMessages[activeKind])}
          >
            <PlusIcon className="capabilities-button-icon" />
            <span>{actionLabels[activeKind]}</span>
          </button>
        </header>

        <div className="capabilities-toolbar" aria-label="Capability filters">
          <label className="capabilities-search">
            <SearchIcon className="capabilities-search__icon" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeKind === 'skill'
                  ? '搜索 Skill'
                  : `搜索 ${capabilityTypeLabels[activeKind]}`
              }
              aria-label={`搜索 ${capabilityTypeLabels[activeKind]}`}
            />
          </label>
          <select
            className="capabilities-select"
            value={sourceFilter}
            aria-label="Filter by source"
            onChange={(event) =>
              setSourceFilter(event.target.value as CapabilitySource | FilterValue)
            }
          >
            <option value="all">全部来源</option>
            {Object.entries(sourceLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="capabilities-select"
            value={statusFilter}
            aria-label="Filter by status"
            onChange={(event) =>
              setStatusFilter(event.target.value as CapabilityStatus | FilterValue)
            }
          >
            <option value="all">全部状态</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {activeKind === 'pipeline' ? (
          <CapabilityInspectorLayout
            entries={visibleEntries}
            selectedEntry={selectedEntry}
            activeKind={activeKind}
            onSelect={handleSelectEntry}
            onOpenDag={handleOpenDag}
            onNotify={onNotify}
          />
        ) : (
          <CapabilityBoardList
            entries={visibleEntries}
            activeKind={activeKind}
            enabledById={enabledById}
            onOpen={setDialogEntryId}
            onToggle={handleSkillSwitch}
          />
        )}
      </section>

      {openDialogEntry ? (
        <CapabilityDialog
          entry={openDialogEntry}
          enabled={Boolean(enabledById[openDialogEntry.id])}
          onToggle={(enabled, event) =>
            handleSkillSwitch(openDialogEntry, enabled, event)
          }
          onClose={() => setDialogEntryId(null)}
          onNotify={onNotify}
        />
      ) : null}

      {openDagEntry?.dag ? (
        <PipelineDagViewerModal
          entry={openDagEntry}
          dag={openDagEntry.dag}
          onClose={handleCloseDag}
        />
      ) : null}
    </main>
  )
}

function CapabilityBoardList({
  entries,
  activeKind,
  enabledById,
  onOpen,
  onToggle,
}: {
  entries: MockCapabilityEntry[]
  activeKind: CapabilityEntryKind
  enabledById: Record<string, boolean>
  onOpen: (id: string) => void
  onToggle: (
    entry: MockCapabilityEntry,
    enabled: boolean,
    event?: KeyboardEvent | MouseEvent,
  ) => void
}) {
  if (!entries.length) {
    return <CapabilityEmptyState />
  }

  return (
    <div
      className="capabilities-skill-list"
      aria-label={`${capabilityTypeLabels[activeKind]} 列表`}
    >
      {entries.map((entry) => {
        const enabled = Boolean(enabledById[entry.id])
        const showsSwitch = entry.kind === 'skill'

        return (
          <div
            key={entry.id}
            role="button"
            tabIndex={0}
            className="capabilities-skill-row"
            onClick={() => onOpen(entry.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpen(entry.id)
              }
            }}
          >
            <span className="capabilities-skill-row__icon" aria-hidden="true">
              <PackageIcon className="capabilities-icon" />
            </span>
            <span className="capabilities-skill-row__main">
              <span className="capabilities-skill-row__name">{entry.name}</span>
              <span className="capabilities-skill-row__description">
                {entry.description}
              </span>
            </span>
            <span className="capabilities-skill-row__source">
              {sourceLabels[entry.source]}
            </span>
            {showsSwitch ? (
              <SwitchControl
                label={`主 Agent 启用：${entry.name}`}
                checked={enabled}
                onChange={(nextChecked, event) =>
                  onToggle(entry, nextChecked, event)
                }
              />
            ) : (
              <StatusBadge status={entry.status} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function CapabilityInspectorLayout({
  entries,
  selectedEntry,
  activeKind,
  onSelect,
  onOpenDag,
  onNotify,
}: {
  entries: MockCapabilityEntry[]
  selectedEntry?: MockCapabilityEntry
  activeKind: CapabilityEntryKind
  onSelect: (entry: MockCapabilityEntry) => void
  onOpenDag: (id: string) => void
  onNotify: (message: string) => void
}) {
  if (!entries.length) {
    return <CapabilityEmptyState />
  }

  return (
    <div className="capabilities-browser">
      <div className="capabilities-list" aria-label={capabilityTypeLabels[activeKind]}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`capabilities-list-row${
              entry.id === selectedEntry?.id
                ? ' capabilities-list-row--selected'
                : ''
            }`}
            onClick={() => onSelect(entry)}
          >
            <span className="capabilities-list-row__top">
              <span className="capabilities-list-row__name">{entry.name}</span>
              <StatusBadge status={entry.status} />
            </span>
            <span className="capabilities-list-row__description">
              {entry.description}
            </span>
            <span className="capabilities-list-row__meta">
              <span>{sourceLabels[entry.source]}</span>
              <span>{entry.owner}</span>
              <span>{entry.updatedAt}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedEntry ? (
        <DetailPanel
          entry={selectedEntry}
          activeKind={activeKind}
          onOpenDag={onOpenDag}
          onNotify={onNotify}
        />
      ) : null}
    </div>
  )
}

function DetailPanel({
  entry,
  activeKind,
  onOpenDag,
  onNotify,
}: {
  entry: MockCapabilityEntry
  activeKind: CapabilityEntryKind
  onOpenDag: (id: string) => void
  onNotify: (message: string) => void
}) {
  const detailList =
    activeKind === 'pipeline'
      ? entry.dag
        ? undefined
        : entry.steps
      : activeKind === 'mcp-server'
        ? entry.tools
        : [entry.placeholderState ?? '仅预览']
  const showsDetailList =
    activeKind !== 'pipeline' || !entry.dag || Boolean(detailList?.length)

  return (
    <aside className="capabilities-detail" aria-label={`${entry.name} 详情`}>
      <div className="capabilities-detail__header">
        <div>
          <p className="capabilities-eyebrow">
            {singularKindLabels[entry.kind]}
          </p>
          <h2>{entry.name}</h2>
          <p>{entry.description}</p>
        </div>
        <button
          type="button"
          className="capabilities-icon-button"
          aria-label={`${entry.name} 的更多操作`}
          onClick={() =>
            onNotify(`${entry.name} 的更多操作会在后续演示中展开`)
          }
        >
          <MoreHorizontalIcon className="capabilities-icon" />
        </button>
      </div>

      <div className="capabilities-detail__badges">
        <StatusBadge status={entry.status} />
        <span className="capabilities-chip">{sourceLabels[entry.source]}</span>
        <span className="capabilities-chip">{entry.version}</span>
        {entry.connectionStatus ? (
          <span className="capabilities-chip">
            {entry.connectionStatus === 'connected'
              ? '已连接'
              : entry.connectionStatus === 'needs-review'
                ? '待审核'
                : '未启用'}
          </span>
        ) : null}
      </div>

      <div className="capabilities-metrics">
        {entry.metrics.map((metric) => (
          <div key={metric.label} className="capabilities-metric">
            <span>{metric.value}</span>
            <small>{metric.label}</small>
          </div>
        ))}
      </div>

      {activeKind === 'pipeline' && entry.dag ? (
        <PipelineDagPreview
          entryName={entry.name}
          dag={entry.dag}
          onMaximize={() => onOpenDag(entry.id)}
        />
      ) : null}

      <DetailSection title="接口">
        <DetailColumn label="输入" items={entry.interface.inputs} />
        <DetailColumn label="输出" items={entry.interface.outputs} />
        <DetailColumn label="权限" items={entry.interface.permissions} />
      </DetailSection>

      {showsDetailList ? (
        <DetailSection
          title={
            activeKind === 'pipeline'
              ? '步骤'
              : activeKind === 'mcp-server'
                ? '工具'
                : 'Plugin 预览'
          }
        >
          <ul className="capabilities-detail-list">
            {detailList?.map((item) => (
              <li key={item}>
                <ChevronRightIcon className="capabilities-detail-list__icon" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {entry.resources?.length ? (
        <DetailSection title="资源">
          <ul className="capabilities-inline-list">
            {entry.resources.map((resource) => (
              <li key={resource}>{resource}</li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {entry.sections.map((section) => (
        <DetailSection key={section.title} title={section.title}>
          <ul className="capabilities-detail-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>
      ))}

      <DetailSection title="近期活动">
        <ul className="capabilities-detail-list">
          {entry.recentActivity.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </DetailSection>

      <button
        type="button"
        className="capabilities-secondary-action"
        onClick={() =>
          onNotify(
            activeKind === 'pipeline'
              ? `${entry.name} 的禁用动作会在后续演示中展开`
              : activeKind === 'mcp-server'
                ? `${entry.name} 的连接设置会在后续演示中展开`
                : `${entry.name} 目前是占位预览`,
          )
        }
      >
        {activeKind === 'pipeline'
          ? '禁用 Pipeline'
          : activeKind === 'mcp-server'
            ? '禁用连接'
            : '查看占位内容'}
      </button>
    </aside>
  )
}

function PipelineDagPreview({
  entryName,
  dag,
  onMaximize,
}: {
  entryName: string
  dag: PipelineDag
  onMaximize: () => void
}) {
  return (
    <section className="capabilities-detail-section capabilities-dag-section">
      <div className="capabilities-dag-section__header">
        <h3>执行 DAG</h3>
        <button
          type="button"
          className="capabilities-dag-section__action"
          aria-label={`最大化查看 ${entryName} 的执行 DAG`}
          onClick={onMaximize}
        >
          最大化查看
        </button>
      </div>
      <PipelineDagCanvas dag={dag} mode="preview" />
    </section>
  )
}

function PipelineDagViewerModal({
  entry,
  dag,
  onClose,
}: {
  entry: MockCapabilityEntry
  dag: PipelineDag
  onClose: () => void
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewportMode, setViewportMode] = useState<'default' | 'fit'>('default')
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const selectedNode =
    dag.nodes.find((node) => node.id === selectedNodeId) ?? null

  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function clearSelection() {
    setSelectedNodeId(null)
    setViewportMode('default')
  }

  function handleFit() {
    setViewportMode('fit')
  }

  return (
    <div className="capabilities-modal-backdrop" role="presentation">
      <section
        className="capabilities-dag-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-dag-dialog-title"
      >
        <header className="capabilities-dag-modal__header">
          <div>
            <p className="capabilities-eyebrow">Pipeline DAG Viewer</p>
            <h2 id="pipeline-dag-dialog-title">执行 DAG</h2>
            <p>{entry.name}</p>
          </div>
          <div className="capabilities-dag-modal__actions">
            <button
              type="button"
              className="capabilities-secondary-action"
              onClick={handleFit}
            >
              Fit
            </button>
            <button
              type="button"
              className="capabilities-secondary-action"
              onClick={clearSelection}
            >
              Reset
            </button>
            <button
              type="button"
              className="dialog-close"
              aria-label="关闭 Pipeline DAG Viewer"
              ref={closeButtonRef}
              onClick={onClose}
            >
              ×
            </button>
          </div>
        </header>
        <div className="capabilities-dag-modal__body">
          <div className="capabilities-dag-modal__canvas">
            <PipelineDagCanvas
              dag={dag}
              mode="modal"
              viewportMode={viewportMode}
              selectedNodeId={selectedNodeId}
              onSelectNode={setSelectedNodeId}
            />
          </div>
          <aside
            className="capabilities-dag-modal__details"
            aria-label="Pipeline DAG 节点详情"
          >
            <h3>节点详情</h3>
            {selectedNode ? (
              <PipelineDagNodeDetails node={selectedNode} />
            ) : (
              <PipelineDagSummary dag={dag} />
            )}
          </aside>
        </div>
      </section>
    </div>
  )
}

function PipelineDagSummary({ dag }: { dag: PipelineDag }) {
  const humanGateCount = dag.nodes.filter(
    (node) => node.kind === 'human-gate',
  ).length
  const qcDecisionCount = dag.nodes.filter(
    (node) => node.kind === 'qc-decision',
  ).length
  const resourceNames = Array.from(
    new Set(
      dag.nodes.flatMap((node) =>
        (node.resources ?? []).map((resource) => resource.name),
      ),
    ),
  )

  return (
    <div className="capabilities-dag-summary">
      <p className="capabilities-dag-modal__empty">
        选择一个节点查看执行条件。
      </p>
      <dl className="capabilities-dag-details-list">
        <DetailRow label="节点" value={`${dag.nodes.length} 个`} />
        <DetailRow label="依赖" value={`${dag.edges.length} 条`} />
        <DetailRow label="Human Gate" value={`${humanGateCount} 个`} />
        <DetailRow label="QC Decision" value={`${qcDecisionCount} 个`} />
        <DetailRow
          label="Lab Resources"
          value={resourceNames.length ? resourceNames.join('；') : '无'}
        />
      </dl>
    </div>
  )
}

function PipelineDagNodeDetails({ node }: { node: PipelineDagNode }) {
  return (
    <dl className="capabilities-dag-details-list">
      <DetailRow label="名称" value={node.title} />
      <DetailRow label="类型" value={dagNodeKindLabels[node.kind]} />
      <DetailRow
        label="subtype"
        value={node.subtype ? dagNodeSubtypeLabels[node.subtype] : '未设置'}
      />
      <DetailRow label="描述" value={node.description} />
      <DetailRow
        label="Lab Resources"
        value={
          node.resources?.length
            ? node.resources
                .map(
                  (resource) =>
                    `${dagResourceLabels[resource.kind]}: ${resource.name}`,
                )
                .join('；')
            : '无'
        }
      />
      <DetailRow label="输入" value={node.inputs.join('；')} />
      <DetailRow label="输出" value={node.outputs.join('；')} />
      <DetailRow label="前置条件" value={node.prerequisites.join('；')} />
      <DetailRow
        label="控制条件"
        value={
          node.control
            ? `${node.control.kind}: ${node.control.summary}`
            : '无控制条件'
        }
      />
    </dl>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}

function CapabilityDialog({
  entry,
  enabled,
  onToggle,
  onClose,
  onNotify,
}: {
  entry: MockCapabilityEntry
  enabled: boolean
  onToggle: (
    enabled: boolean,
    event?: KeyboardEvent | MouseEvent,
  ) => void
  onClose: () => void
  onNotify: (message: string) => void
}) {
  return (
    <div className="capabilities-modal-backdrop" role="presentation">
      <section
        className="capabilities-skill-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="capability-dialog-title"
      >
        <button
          type="button"
          className="dialog-close capabilities-skill-modal__close"
          aria-label="关闭详情"
          onClick={onClose}
        >
          ×
        </button>

        <div className="capabilities-skill-modal__hero">
          <span className="capabilities-skill-modal__icon" aria-hidden="true">
            <PackageIcon className="capabilities-icon" />
          </span>
          <div className="capabilities-skill-modal__title-row">
            <h2 id="capability-dialog-title">{entry.name}</h2>
            <span>{singularKindLabels[entry.kind]}</span>
          </div>
          <p>{entry.description}</p>
          <div className="capabilities-skill-modal__controls">
            {entry.kind === 'skill' ? (
              <SwitchControl
                label={`主 Agent 启用：${entry.name}`}
                checked={enabled}
                onChange={onToggle}
              />
            ) : null}
            <button
              type="button"
              className="capabilities-icon-button"
              aria-label={`${entry.name} 的更多操作`}
              onClick={() =>
                onNotify(`${entry.name} 的更多操作会在后续演示中展开`)
              }
            >
              <MoreHorizontalIcon className="capabilities-icon" />
            </button>
          </div>
        </div>

        <div className="capabilities-skill-modal__body">
          {entry.kind === 'skill' ? (
            <>
              <DetailSection title="指令">
                <InstructionBlock items={entry.instructions ?? []} />
              </DetailSection>
              <DetailSection title="触发条件">
                <ul className="capabilities-inline-list">
                  {(entry.triggers ?? []).map((trigger) => (
                    <li key={trigger}>{trigger}</li>
                  ))}
                </ul>
              </DetailSection>
              <DetailSection title="示例">
                <ul className="capabilities-detail-list">
                  {(entry.examples ?? []).map((example) => (
                    <li key={example}>{example}</li>
                  ))}
                </ul>
              </DetailSection>
              <DetailSection title="访问控制">
                <DetailColumn label="权限" items={entry.interface.permissions} />
              </DetailSection>
            </>
          ) : (
            <CapabilityDialogDetails entry={entry} />
          )}
        </div>

        <footer className="capabilities-skill-modal__footer">
          {entry.kind !== 'skill' ? (
            <span className="capabilities-skill-modal__locked">
              {statusLabels[entry.status]}
            </span>
          ) : !entry.presetLocked ? (
            <button
              type="button"
              className="capabilities-danger-action"
              onClick={() =>
                onNotify(`${entry.name} 的移除动作会在后续演示中展开`)
              }
            >
              移除
            </button>
          ) : (
            <span className="capabilities-skill-modal__locked">
              预设 Skill
            </span>
          )}
          <button
            type="button"
            className="capabilities-primary-dark-action"
            onClick={() =>
              onNotify(getDialogActionMessage(entry))
            }
          >
            {getDialogActionLabel(entry)}
          </button>
        </footer>
      </section>
    </div>
  )
}

function CapabilityDialogDetails({ entry }: { entry: MockCapabilityEntry }) {
  return (
    <>
      <DetailSection title="接口">
        <DetailColumn label="输入" items={entry.interface.inputs} />
        <DetailColumn label="输出" items={entry.interface.outputs} />
        <DetailColumn label="权限" items={entry.interface.permissions} />
      </DetailSection>

      {entry.kind === 'mcp-server' && entry.tools?.length ? (
        <DetailSection title="工具">
          <ul className="capabilities-detail-list">
            {entry.tools.map((tool) => (
              <li key={tool}>{tool}</li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {entry.kind === 'plugin' ? (
        <DetailSection title="Plugin 预览">
          <ul className="capabilities-detail-list">
            <li>{entry.placeholderState ?? '仅预览'}</li>
          </ul>
        </DetailSection>
      ) : null}

      {entry.resources?.length ? (
        <DetailSection title="资源">
          <ul className="capabilities-inline-list">
            {entry.resources.map((resource) => (
              <li key={resource}>{resource}</li>
            ))}
          </ul>
        </DetailSection>
      ) : null}

      {entry.sections.map((section) => (
        <DetailSection key={section.title} title={section.title}>
          <ul className="capabilities-detail-list">
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </DetailSection>
      ))}

      <DetailSection title="近期活动">
        <ul className="capabilities-detail-list">
          {entry.recentActivity.map((activity) => (
            <li key={activity}>{activity}</li>
          ))}
        </ul>
      </DetailSection>
    </>
  )
}

function SwitchControl({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (
    checked: boolean,
    event?: KeyboardEvent | MouseEvent,
  ) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      className={`capabilities-switch${
        checked ? ' capabilities-switch--checked' : ''
      }`}
      onClick={(event) => {
        event.stopPropagation()
        onChange(!checked, event)
      }}
      onKeyDown={(event) => {
        event.stopPropagation()

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onChange(!checked, event)
        }
      }}
    >
      <span className="capabilities-switch__thumb" />
    </button>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="capabilities-detail-section">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function DetailColumn({
  label,
  items,
}: {
  label: string
  items: string[]
}) {
  return (
    <div className="capabilities-detail-column">
      <span>{label}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

function InstructionBlock({ items }: { items: string[] }) {
  return (
    <div className="capabilities-instruction-block">
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: CapabilityStatus }) {
  return (
    <span className={`capabilities-status capabilities-status--${status}`}>
      {statusLabels[status]}
    </span>
  )
}

function CapabilityEmptyState() {
  return (
    <div className="capabilities-empty">
      <PackageIcon className="capabilities-empty__icon" />
      <h2>没有匹配的 Capabilities</h2>
      <p>调整搜索或筛选条件后查看演示条目。</p>
    </div>
  )
}

function getKindIcon(kind: CapabilityEntryKind) {
  if (kind === 'pipeline') {
    return FlaskIcon
  }

  if (kind === 'skill') {
    return BrainIcon
  }

  if (kind === 'mcp-server') {
    return DatabaseIcon
  }

  return PackageIcon
}

function getInitialSelectedIds(): Record<CapabilityEntryKind, string> {
  return Object.fromEntries(
    capabilityTypeOrder.map((kind) => [
      kind,
      capabilityEntries.find((entry) => entry.kind === kind)?.id ?? '',
    ]),
  ) as Record<CapabilityEntryKind, string>
}

function getDialogActionLabel(entry: MockCapabilityEntry) {
  if (entry.kind === 'mcp-server') {
    return '查看连接设置'
  }

  if (entry.kind === 'plugin') {
    return '申请权限'
  }

  return '在对话中试用'
}

function getDialogActionMessage(entry: MockCapabilityEntry) {
  if (entry.kind === 'mcp-server') {
    return `${entry.name} 的连接设置会在后续演示中展开`
  }

  if (entry.kind === 'plugin') {
    return `${entry.name} 的权限申请会在后续演示中展开`
  }

  return `${entry.name} 会在后续演示中进入对话试用`
}

export default CapabilitiesPage
