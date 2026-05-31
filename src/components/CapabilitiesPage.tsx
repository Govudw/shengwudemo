import { useMemo, useState } from 'react'
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
import {
  capabilityEntries,
  capabilityTypeDescriptions,
  capabilityTypeLabels,
  capabilityTypeOrder,
} from '../data/mockCapabilities'
import type {
  CapabilityEntryKind,
  CapabilitySource,
  CapabilityStatus,
  MockCapabilityEntry,
} from '../data/mockCapabilities'

type CapabilitiesPageProps = {
  onNotify: (message: string) => void
}

type FilterValue = 'all'

const sourceLabels: Record<CapabilitySource, string> = {
  created: 'Created',
  installed: 'Installed',
  preset: 'Preset',
  system: 'System',
}

const statusLabels: Record<CapabilityStatus, string> = {
  active: 'Active',
  draft: 'Draft',
  inactive: 'Inactive',
  'needs-review': 'Needs review',
}

const singularKindLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Pipeline',
  skill: 'Skill',
  'mcp-server': 'MCP Server',
  plugin: 'Plugin',
}

const actionLabels: Record<CapabilityEntryKind, string> = {
  pipeline: 'Build Pipeline with Agent',
  skill: 'Create Skill with Agent',
  'mcp-server': 'Connect MCP Server',
  plugin: 'Request Plugin Access',
}

const actionMessages: Record<CapabilityEntryKind, string> = {
  pipeline: 'Agent Builder 会在后续 Demo 中连接到 Pipeline 创建流程',
  skill: 'Agent Builder 会在后续 Demo 中连接到 Skill 创建流程',
  'mcp-server': 'MCP 连接向导会在后续 Demo 中展开',
  plugin: 'Plugin 申请流程会在后续 Demo 中展开',
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
  const [skillDialogId, setSkillDialogId] = useState<string | null>(null)
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

  const openSkill =
    capabilityEntries.find(
      (entry) => entry.kind === 'skill' && entry.id === skillDialogId,
    ) ?? null

  function handleKindChange(kind: CapabilityEntryKind) {
    setActiveKind(kind)
    setQuery('')
    setSourceFilter('all')
    setStatusFilter('all')
    setSkillDialogId(null)
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

  return (
    <main className="capabilities-page" aria-label="Capabilities management">
      <aside
        className="capabilities-nav"
        aria-label="Capability types"
        aria-hidden={openSkill ? true : undefined}
        inert={openSkill ? true : undefined}
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
                      ? 'Preview'
                      : `${count} configured`}
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
        aria-hidden={openSkill ? true : undefined}
        inert={openSkill ? true : undefined}
      >
        <header className="capabilities-header">
          <div className="capabilities-header__copy">
            <p className="capabilities-eyebrow">
              {singularKindLabels[activeKind]} management
            </p>
            <h1>{capabilityTypeLabels[activeKind]}</h1>
            <p>{capabilityTypeDescriptions[activeKind]}</p>
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
                  ? 'Search skills'
                  : `Search ${capabilityTypeLabels[activeKind].toLowerCase()}`
              }
              aria-label={`Search ${capabilityTypeLabels[activeKind]}`}
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
            <option value="all">All sources</option>
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
            <option value="all">All status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {activeKind === 'skill' ? (
          <SkillList
            entries={visibleEntries}
            enabledById={enabledById}
            onOpen={setSkillDialogId}
            onToggle={handleSkillSwitch}
          />
        ) : (
          <CapabilityInspectorLayout
            entries={visibleEntries}
            selectedEntry={selectedEntry}
            activeKind={activeKind}
            onSelect={handleSelectEntry}
            onNotify={onNotify}
          />
        )}
      </section>

      {openSkill ? (
        <SkillDialog
          entry={openSkill}
          enabled={Boolean(enabledById[openSkill.id])}
          onToggle={(enabled, event) =>
            handleSkillSwitch(openSkill, enabled, event)
          }
          onClose={() => setSkillDialogId(null)}
          onNotify={onNotify}
        />
      ) : null}
    </main>
  )
}

function SkillList({
  entries,
  enabledById,
  onOpen,
  onToggle,
}: {
  entries: MockCapabilityEntry[]
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
    <div className="capabilities-skill-list" aria-label="Skills list">
      {entries.map((entry) => {
        const enabled = Boolean(enabledById[entry.id])

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
            <SwitchControl
              label={`Enabled for Main Agent: ${entry.name}`}
              checked={enabled}
              onChange={(nextChecked, event) =>
                onToggle(entry, nextChecked, event)
              }
            />
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
  onNotify,
}: {
  entries: MockCapabilityEntry[]
  selectedEntry?: MockCapabilityEntry
  activeKind: CapabilityEntryKind
  onSelect: (entry: MockCapabilityEntry) => void
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
          onNotify={onNotify}
        />
      ) : null}
    </div>
  )
}

function DetailPanel({
  entry,
  activeKind,
  onNotify,
}: {
  entry: MockCapabilityEntry
  activeKind: CapabilityEntryKind
  onNotify: (message: string) => void
}) {
  const detailList =
    activeKind === 'pipeline'
      ? entry.steps
      : activeKind === 'mcp-server'
        ? entry.tools
        : [entry.placeholderState ?? 'Preview only']

  return (
    <aside className="capabilities-detail" aria-label={`${entry.name} details`}>
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
          aria-label={`More actions for ${entry.name}`}
          onClick={() =>
            onNotify(`${entry.name} 的更多操作会在后续 Demo 中展开`)
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
              ? 'Connected'
              : entry.connectionStatus === 'needs-review'
                ? 'Needs review'
                : 'Inactive'}
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

      <DetailSection title="Interface">
        <DetailColumn label="Inputs" items={entry.interface.inputs} />
        <DetailColumn label="Outputs" items={entry.interface.outputs} />
        <DetailColumn label="Permissions" items={entry.interface.permissions} />
      </DetailSection>

      <DetailSection
        title={
          activeKind === 'pipeline'
            ? 'Steps'
            : activeKind === 'mcp-server'
              ? 'Tools'
              : 'Plugin preview'
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

      {entry.resources?.length ? (
        <DetailSection title="Resources">
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

      <DetailSection title="Recent activity">
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
              ? `${entry.name} 的禁用动作会在后续 Demo 中展开`
              : activeKind === 'mcp-server'
                ? `${entry.name} 的连接设置会在后续 Demo 中展开`
                : `${entry.name} 目前是占位预览`,
          )
        }
      >
        {activeKind === 'pipeline'
          ? 'Disable Pipeline'
          : activeKind === 'mcp-server'
            ? 'Disable connection'
            : 'View placeholder'}
      </button>
    </aside>
  )
}

function SkillDialog({
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
        aria-labelledby="skill-dialog-title"
      >
        <button
          type="button"
          className="dialog-close capabilities-skill-modal__close"
          aria-label="Close Skill details"
          onClick={onClose}
        >
          ×
        </button>

        <div className="capabilities-skill-modal__hero">
          <span className="capabilities-skill-modal__icon" aria-hidden="true">
            <PackageIcon className="capabilities-icon" />
          </span>
          <div className="capabilities-skill-modal__title-row">
            <h2 id="skill-dialog-title">{entry.name}</h2>
            <span>Skill</span>
          </div>
          <p>{entry.description}</p>
          <div className="capabilities-skill-modal__controls">
            <SwitchControl
              label={`Enabled for Main Agent: ${entry.name}`}
              checked={enabled}
              onChange={onToggle}
            />
            <button
              type="button"
              className="capabilities-icon-button"
              aria-label={`More actions for ${entry.name}`}
              onClick={() =>
                onNotify(`${entry.name} 的更多操作会在后续 Demo 中展开`)
              }
            >
              <MoreHorizontalIcon className="capabilities-icon" />
            </button>
          </div>
        </div>

        <div className="capabilities-skill-modal__body">
          <DetailSection title="Instructions">
            <InstructionBlock items={entry.instructions ?? []} />
          </DetailSection>
          <DetailSection title="Triggers">
            <ul className="capabilities-inline-list">
              {(entry.triggers ?? []).map((trigger) => (
                <li key={trigger}>{trigger}</li>
              ))}
            </ul>
          </DetailSection>
          <DetailSection title="Examples">
            <ul className="capabilities-detail-list">
              {(entry.examples ?? []).map((example) => (
                <li key={example}>{example}</li>
              ))}
            </ul>
          </DetailSection>
          <DetailSection title="Access">
            <DetailColumn label="Permissions" items={entry.interface.permissions} />
          </DetailSection>
        </div>

        <footer className="capabilities-skill-modal__footer">
          {!entry.presetLocked ? (
            <button
              type="button"
              className="capabilities-danger-action"
              onClick={() =>
                onNotify(`${entry.name} 的移除动作会在后续 Demo 中展开`)
              }
            >
              Remove
            </button>
          ) : (
            <span className="capabilities-skill-modal__locked">
              Preset Skill
            </span>
          )}
          <button
            type="button"
            className="capabilities-primary-dark-action"
            onClick={() =>
              onNotify(`${entry.name} 会在后续 Demo 中进入对话试用`)
            }
          >
            Try in conversation
          </button>
        </footer>
      </section>
    </div>
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
      <h2>No matching capabilities</h2>
      <p>Adjust search or filters to return demo entries.</p>
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

export default CapabilitiesPage
