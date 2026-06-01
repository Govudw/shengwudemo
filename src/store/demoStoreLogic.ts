import type { ConversationTurn, RunInspectorData } from '../data/conversationTypes'
import type { Project } from '../data/mockData'

export type DemoThread = {
  id: string
  title: string
  lastActivityAt: number
  pinned: boolean
  pinnedAt: number | null
  archived: boolean
  createdAt: number
  transcript: ConversationTurn[]
  runInspector?: RunInspectorData
}

export type DemoProject = {
  id: string
  name: string
  threads: DemoThread[]
}

export type DemoStateSnapshot = {
  projects: DemoProject[]
  selectedProjectId: string
  selectedThreadId: string | null
  isDraftingNewThread: boolean
  draft: string
  expandedProjectIds: string[]
  sidebarCollapsed: boolean
  runInspectorByThreadId: Record<string, { open: boolean }>
  activeTopNav: ActiveTopNav
  assetsActiveSection: AssetsSection
  assetsActiveItem: AssetMenuItemId
  assetsFileViewMode: AssetsFileViewMode
  assetsOpenFolderId: string | null
  statusMessage: string
}

export type ActiveTopNav = 'Workspace' | 'Assets'

export type AssetsSection = 'file' | 'data' | 'experiment' | 'model'

export type FileAssetItemId =
  | 'public-files'
  | 'project-files'
  | 'recent-uploads'
  | 'archived-files'

export type DataAssetItemId =
  | 'datasets'
  | 'tables'
  | 'analysis-results'
  | 'catalog'

export type ExperimentAssetItemId =
  | 'request'
  | 'execution'
  | 'inventory'
  | 'configuration'

export type ModelAssetItemId =
  | 'xtrimo'
  | 'public-models'
  | 'project-models'
  | 'oracles'

export type AssetMenuItemId =
  | FileAssetItemId
  | DataAssetItemId
  | ExperimentAssetItemId
  | ModelAssetItemId

export type AssetsFileViewMode = 'list' | 'grid'

export type ThreadEntry = {
  projectId: string
  projectName: string
  thread: DemoThread
}

export type SearchView = {
  pinnedThreadEntries: ThreadEntry[]
  projects: DemoProject[]
}

const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour
const activeTopNavItems = ['Workspace', 'Assets'] as const
const assetsSections = ['file', 'data', 'experiment', 'model'] as const
const assetsFileViewModes = ['list', 'grid'] as const
const assetMenuItemsBySection = {
  file: ['public-files', 'project-files', 'recent-uploads', 'archived-files'],
  data: ['datasets', 'tables', 'analysis-results', 'catalog'],
  experiment: ['request', 'execution', 'inventory', 'configuration'],
  model: ['xtrimo', 'public-models', 'project-models', 'oracles'],
} as const satisfies Record<AssetsSection, readonly AssetMenuItemId[]>
const selectedThreadAcknowledgement =
  '已记录到当前对话。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。'

export function createInitialDemoState(
  seedProjects: Project[],
  now: number,
): DemoStateSnapshot {
  return {
    projects: createInitialDemoProjects(seedProjects, now),
    selectedProjectId: seedProjects[0]?.id ?? '',
    selectedThreadId: null,
    isDraftingNewThread: true,
    draft: '',
    expandedProjectIds: seedProjects.map((project) => project.id),
    sidebarCollapsed: false,
    runInspectorByThreadId: {},
    activeTopNav: 'Workspace',
    assetsActiveSection: 'file',
    assetsActiveItem: 'project-files',
    assetsFileViewMode: 'list',
    assetsOpenFolderId: null,
    statusMessage: '',
  }
}

export function createInitialDemoProjects(
  seedProjects: Project[],
  now: number,
): DemoProject[] {
  return seedProjects.map((project, projectIndex) => ({
    id: project.id,
    name: project.name,
    threads: project.threads.map((thread, threadIndex) => {
      const seedOrder = projectIndex * 100 + threadIndex

      return {
        id: thread.id,
        title: thread.title,
        lastActivityAt: parseActivityLabel(thread.lastActivity, now, seedOrder),
        pinned: false,
        pinnedAt: null,
        archived: false,
        createdAt: now - (seedOrder + 1) * minute,
        transcript: cloneTranscript(thread.transcript),
        runInspector: cloneRunInspector(thread.runInspector),
      }
    }),
  }))
}

export function formatRelativeActivity(
  lastActivityAt: number,
  now = Date.now(),
): string {
  const elapsed = Math.max(0, now - lastActivityAt)

  if (elapsed < minute) {
    return '刚刚'
  }

  if (elapsed < hour) {
    return `${Math.max(1, Math.floor(elapsed / minute))} 分钟`
  }

  if (elapsed < day) {
    return `${Math.max(1, Math.floor(elapsed / hour))} 小时`
  }

  if (elapsed < 2 * day) {
    return '昨天'
  }

  return `${Math.max(2, Math.floor(elapsed / day))} 天前`
}

export function submitDraftSnapshot(
  state: DemoStateSnapshot,
  now: number,
  createId: () => string,
): DemoStateSnapshot {
  const normalizedDraft = normalizeWhitespace(state.draft)

  if (!normalizedDraft) {
    return state
  }

  const selectedEntry = state.selectedThreadId
    ? findThreadById(state.projects, state.selectedThreadId)
    : undefined

  if (
    selectedEntry &&
    !selectedEntry.thread.archived &&
    !state.isDraftingNewThread
  ) {
    const userTurn: ConversationTurn = {
      id: `turn-${now}-user`,
      role: 'user',
      markdown: normalizedDraft,
    }
    const acknowledgementTurn: ConversationTurn = {
      id: `turn-${now}-main-agent`,
      role: 'mainAgent',
      markdown: selectedThreadAcknowledgement,
    }
    const projects = state.projects.map((project) => {
      if (project.id !== selectedEntry.project.id) {
        return project
      }

      const updatedThreads = project.threads.map((thread) =>
        thread.id === selectedEntry.thread.id
          ? {
              ...thread,
              lastActivityAt: now,
              transcript: [...thread.transcript, userTurn, acknowledgementTurn],
            }
          : thread,
      )
      const currentThread = updatedThreads.find(
        (thread) => thread.id === selectedEntry.thread.id,
      )
      const remainingThreads = updatedThreads.filter(
        (thread) => thread.id !== selectedEntry.thread.id,
      )

      return {
        ...project,
        threads: currentThread ? [currentThread, ...remainingThreads] : updatedThreads,
      }
    })

    return {
      ...state,
      projects,
      selectedProjectId: selectedEntry.project.id,
      selectedThreadId: selectedEntry.thread.id,
      isDraftingNewThread: false,
      draft: '',
      expandedProjectIds: ensureProjectExpanded(
        state.expandedProjectIds,
        selectedEntry.project.id,
      ),
      statusMessage: '',
    }
  }

  const targetProjectId =
    state.projects.some((project) => project.id === state.selectedProjectId)
      ? state.selectedProjectId
      : state.projects[0]?.id

  if (!targetProjectId) {
    return state
  }

  const threadId = createId()
  const newThread: DemoThread = {
    id: threadId,
    title: makeThreadTitle(state.draft),
    lastActivityAt: now,
    pinned: false,
    pinnedAt: null,
    archived: false,
    createdAt: now,
    transcript: [
      {
        id: `turn-${now}-user`,
        role: 'user',
        markdown: normalizedDraft,
      },
      {
        id: `turn-${now}-main-agent`,
        role: 'mainAgent',
        markdown: selectedThreadAcknowledgement,
      },
    ],
  }

  return {
    ...state,
    projects: state.projects.map((project) =>
      project.id === targetProjectId
        ? { ...project, threads: [newThread, ...project.threads] }
        : project,
    ),
    selectedProjectId: targetProjectId,
    selectedThreadId: threadId,
    isDraftingNewThread: false,
    draft: '',
    expandedProjectIds: ensureProjectExpanded(
      state.expandedProjectIds,
      targetProjectId,
    ),
    statusMessage: '',
  }
}

export function selectThreadSnapshot(
  state: DemoStateSnapshot,
  projectId: string,
  threadId: string,
): DemoStateSnapshot {
  const entry = findThreadById(state.projects, threadId)

  if (!entry || entry.project.id !== projectId || entry.thread.archived) {
    return state
  }

  return {
    ...state,
    selectedProjectId: projectId,
    selectedThreadId: threadId,
    isDraftingNewThread: false,
    expandedProjectIds: ensureProjectExpanded(state.expandedProjectIds, projectId),
  }
}

export function setSelectedProjectSnapshot(
  state: DemoStateSnapshot,
  projectId: string,
): DemoStateSnapshot {
  if (!state.projects.some((project) => project.id === projectId)) {
    return state
  }

  const selectedEntry = state.selectedThreadId
    ? findThreadById(state.projects, state.selectedThreadId)
    : undefined

  if (
    selectedEntry &&
    !state.isDraftingNewThread &&
    selectedEntry.project.id === projectId &&
    !selectedEntry.thread.archived
  ) {
    return {
      ...state,
      selectedProjectId: projectId,
      expandedProjectIds: ensureProjectExpanded(state.expandedProjectIds, projectId),
    }
  }

  return {
    ...state,
    selectedProjectId: projectId,
    selectedThreadId: null,
    isDraftingNewThread: true,
    expandedProjectIds: ensureProjectExpanded(state.expandedProjectIds, projectId),
  }
}

export function startNewThreadSnapshot(state: DemoStateSnapshot): DemoStateSnapshot {
  return {
    ...state,
    selectedThreadId: null,
    isDraftingNewThread: true,
    draft: '',
  }
}

export function sanitizeDemoState(state: DemoStateSnapshot): DemoStateSnapshot {
  const projects = normalizeDemoProjects(state.projects)
  const existingProjectIds = projects.map((project) => project.id)
  const selectedProjectId = existingProjectIds.includes(state.selectedProjectId)
    ? state.selectedProjectId
    : existingProjectIds[0] ?? ''
  const selectedEntry = state.selectedThreadId
    ? findThreadById(projects, state.selectedThreadId)
    : undefined
  const hasValidSelectedThread = Boolean(
    selectedEntry && !selectedEntry.thread.archived,
  )
  const sanitizedAssets = sanitizeAssetsStateFields(state)

  if (hasValidSelectedThread && selectedEntry) {
    return {
      ...state,
      projects,
      selectedProjectId: selectedEntry.project.id,
      selectedThreadId: selectedEntry.thread.id,
      isDraftingNewThread: false,
      expandedProjectIds: sanitizeExpandedProjectIds(
        state.expandedProjectIds,
        existingProjectIds,
        selectedEntry.project.id,
      ),
      sidebarCollapsed:
        typeof state.sidebarCollapsed === 'boolean' ? state.sidebarCollapsed : false,
      runInspectorByThreadId: sanitizeRunInspectorByThreadId(
        state.runInspectorByThreadId,
        projects,
      ),
      ...sanitizedAssets,
      statusMessage: '',
    }
  }

  return {
    ...state,
    projects,
    selectedProjectId,
    selectedThreadId: null,
    isDraftingNewThread: true,
    expandedProjectIds: sanitizeExpandedProjectIds(
      state.expandedProjectIds,
      existingProjectIds,
      selectedProjectId,
    ),
    sidebarCollapsed:
      typeof state.sidebarCollapsed === 'boolean' ? state.sidebarCollapsed : false,
    runInspectorByThreadId: sanitizeRunInspectorByThreadId(
      state.runInspectorByThreadId,
      projects,
    ),
    ...sanitizedAssets,
    statusMessage: '',
  }
}

export function selectTopNavSnapshot(
  state: DemoStateSnapshot,
  activeTopNav: ActiveTopNav,
): DemoStateSnapshot {
  if (!isActiveTopNav(activeTopNav)) {
    return state
  }

  return {
    ...state,
    activeTopNav,
  }
}

export function setAssetsSelectionSnapshot(
  state: DemoStateSnapshot,
  section: AssetsSection,
  item: AssetMenuItemId,
): DemoStateSnapshot {
  if (!isAssetsSection(section) || !isAssetMenuItemForSection(section, item)) {
    return state
  }

  return {
    ...state,
    assetsActiveSection: section,
    assetsActiveItem: item,
    assetsOpenFolderId:
      section === 'file' && item === 'project-files'
        ? state.assetsOpenFolderId
        : null,
  }
}

export function setAssetsFileViewModeSnapshot(
  state: DemoStateSnapshot,
  assetsFileViewMode: AssetsFileViewMode,
): DemoStateSnapshot {
  if (!isAssetsFileViewMode(assetsFileViewMode)) {
    return state
  }

  return {
    ...state,
    assetsFileViewMode,
  }
}

export function setAssetsOpenFolderSnapshot(
  state: DemoStateSnapshot,
  assetsOpenFolderId: string | null,
): DemoStateSnapshot {
  if (
    state.assetsActiveSection !== 'file' ||
    state.assetsActiveItem !== 'project-files'
  ) {
    return {
      ...state,
      assetsOpenFolderId: null,
    }
  }

  return {
    ...state,
    assetsOpenFolderId,
  }
}

export function toggleRunInspectorSnapshot(
  state: DemoStateSnapshot,
  threadId: string,
  open: boolean,
): DemoStateSnapshot {
  return {
    ...state,
    runInspectorByThreadId: {
      ...state.runInspectorByThreadId,
      [threadId]: { open },
    },
  }
}

export function toggleSidebarCollapsedSnapshot(
  state: DemoStateSnapshot,
  sidebarCollapsed: boolean,
): DemoStateSnapshot {
  return {
    ...state,
    sidebarCollapsed,
  }
}

export function toggleProjectSnapshot(
  state: DemoStateSnapshot,
  projectId: string,
): DemoStateSnapshot {
  const isExpanded = state.expandedProjectIds.includes(projectId)

  return {
    ...state,
    expandedProjectIds: isExpanded
      ? state.expandedProjectIds.filter((currentProjectId) => currentProjectId !== projectId)
      : [...state.expandedProjectIds, projectId],
  }
}

export function togglePinnedSnapshot(
  state: DemoStateSnapshot,
  threadId: string,
  now: number,
): DemoStateSnapshot {
  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      threads: project.threads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              pinned: !thread.pinned,
              pinnedAt: thread.pinned ? null : now,
            }
          : thread,
      ),
    })),
  }
}

export function renameThreadSnapshot(
  state: DemoStateSnapshot,
  threadId: string,
  title: string,
): DemoStateSnapshot {
  const normalizedTitle = normalizeWhitespace(title)

  if (!normalizedTitle) {
    return {
      ...state,
      statusMessage: '名称不能为空',
    }
  }

  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      threads: project.threads.map((thread) =>
        thread.id === threadId ? { ...thread, title: normalizedTitle } : thread,
      ),
    })),
    statusMessage: '已重命名',
  }
}

export function archiveThreadSnapshot(
  state: DemoStateSnapshot,
  threadId: string,
): DemoStateSnapshot {
  const isSelectedThread = state.selectedThreadId === threadId

  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      threads: project.threads.map((thread) =>
        thread.id === threadId ? { ...thread, archived: true } : thread,
      ),
    })),
    selectedThreadId: isSelectedThread ? null : state.selectedThreadId,
    isDraftingNewThread: isSelectedThread ? true : state.isDraftingNewThread,
    statusMessage: '已归档',
  }
}

export function deleteThreadSnapshot(
  state: DemoStateSnapshot,
  threadId: string,
): DemoStateSnapshot {
  const isSelectedThread = state.selectedThreadId === threadId
  const runInspectorByThreadId = { ...state.runInspectorByThreadId }
  delete runInspectorByThreadId[threadId]

  return {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      threads: project.threads.filter((thread) => thread.id !== threadId),
    })),
    selectedThreadId: isSelectedThread ? null : state.selectedThreadId,
    isDraftingNewThread: isSelectedThread ? true : state.isDraftingNewThread,
    runInspectorByThreadId,
    statusMessage: '',
  }
}

export function findThreadById(
  projects: DemoProject[],
  threadId: string,
): (ThreadEntry & { project: DemoProject }) | undefined {
  for (const project of projects) {
    const thread = project.threads.find((currentThread) => currentThread.id === threadId)

    if (thread) {
      return {
        project,
        projectId: project.id,
        projectName: project.name,
        thread,
      }
    }
  }

  return undefined
}

export function getPinnedThreadEntries(projects: DemoProject[]): ThreadEntry[] {
  return projects
    .flatMap((project) =>
      project.threads
        .filter((thread) => thread.pinned && !thread.archived)
        .map((thread) => ({
          projectId: project.id,
          projectName: project.name,
          thread,
        })),
    )
    .sort((left, right) => (right.thread.pinnedAt ?? 0) - (left.thread.pinnedAt ?? 0))
}

export function getRecentThreadEntries(
  projects: DemoProject[],
  limit = 8,
): ThreadEntry[] {
  return projects
    .flatMap((project) =>
      project.threads
        .filter((thread) => !thread.archived)
        .map((thread) => ({
          projectId: project.id,
          projectName: project.name,
          thread,
        })),
    )
    .sort((left, right) => right.thread.lastActivityAt - left.thread.lastActivityAt)
    .slice(0, limit)
}

export function getSearchView(projects: DemoProject[], query: string): SearchView {
  const normalizedQuery = query.trim().toLowerCase()

  if (!normalizedQuery) {
    return {
      pinnedThreadEntries: getPinnedThreadEntries(projects),
      projects: projects.map((project) => ({
        ...project,
        threads: project.threads.filter((thread) => !thread.archived),
      })),
    }
  }

  const matchesQuery = (thread: DemoThread) =>
    !thread.archived && thread.title.toLowerCase().includes(normalizedQuery)

  return {
    pinnedThreadEntries: getPinnedThreadEntries(projects).filter((entry) =>
      entry.thread.title.toLowerCase().includes(normalizedQuery),
    ),
    projects: projects
      .map((project) => ({
        ...project,
        threads: project.threads.filter(matchesQuery),
      }))
      .filter((project) => project.threads.length > 0),
  }
}

function parseActivityLabel(label: string, now: number, seedOrder: number) {
  if (label === '刚刚') {
    return now
  }

  if (label === '昨天') {
    return now - day
  }

  const minuteMatch = label.match(/^(\d+)\s*分钟$/)
  if (minuteMatch) {
    return now - Number(minuteMatch[1]) * minute
  }

  const hourMatch = label.match(/^(\d+)\s*小时$/)
  if (hourMatch) {
    return now - Number(hourMatch[1]) * hour
  }

  const dayMatch = label.match(/^(\d+)\s*天前$/)
  if (dayMatch) {
    return now - Number(dayMatch[1]) * day
  }

  return now - (seedOrder + 1) * minute
}

function makeThreadTitle(draft: string): string {
  const firstLine = normalizeWhitespace(draft.split('\n')[0] ?? draft)
  return truncateByWeightedLength(firstLine, 44)
}

function truncateByWeightedLength(value: string, maxWeight: number): string {
  let weight = 0
  let output = ''

  for (const char of Array.from(value)) {
    const charWeight = (char.codePointAt(0) ?? 0) > 255 ? 2 : 1

    if (weight + charWeight > maxWeight) {
      return `${output}...`
    }

    weight += charWeight
    output += char
  }

  return output
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, ' ')
}

function ensureProjectExpanded(projectIds: string[], projectId: string): string[] {
  return projectIds.includes(projectId) ? projectIds : [...projectIds, projectId]
}

function normalizeDemoProjects(projects: DemoProject[]): DemoProject[] {
  return projects.map((project) => ({
    ...project,
    threads: project.threads.map((thread) => ({
      ...thread,
      transcript: cloneTranscript(thread.transcript),
      runInspector: cloneRunInspector(thread.runInspector),
    })),
  }))
}

function cloneTranscript(transcript?: ConversationTurn[]): ConversationTurn[] {
  return transcript ? JSON.parse(JSON.stringify(transcript)) : []
}

function cloneRunInspector(runInspector?: RunInspectorData): RunInspectorData | undefined {
  return runInspector ? JSON.parse(JSON.stringify(runInspector)) : undefined
}

function sanitizeRunInspectorByThreadId(
  runInspectorByThreadId: DemoStateSnapshot['runInspectorByThreadId'] | undefined,
  projects: DemoProject[],
): DemoStateSnapshot['runInspectorByThreadId'] {
  if (!runInspectorByThreadId || typeof runInspectorByThreadId !== 'object') {
    return {}
  }

  const threadIds = new Set(
    projects.flatMap((project) => project.threads.map((thread) => thread.id)),
  )

  return Object.fromEntries(
    Object.entries(runInspectorByThreadId).filter(
      ([threadId, value]) =>
        threadIds.has(threadId) &&
        value &&
        typeof value === 'object' &&
        typeof value.open === 'boolean',
    ),
  )
}

function sanitizeAssetsStateFields(
  state: DemoStateSnapshot,
): Pick<
  DemoStateSnapshot,
  | 'activeTopNav'
  | 'assetsActiveSection'
  | 'assetsActiveItem'
  | 'assetsFileViewMode'
  | 'assetsOpenFolderId'
> {
  const activeTopNav = isActiveTopNav(state.activeTopNav)
    ? state.activeTopNav
    : 'Workspace'
  const assetsActiveSection = isAssetsSection(state.assetsActiveSection)
    ? state.assetsActiveSection
    : 'file'
  const assetsActiveItem = isAssetMenuItemForSection(
    assetsActiveSection,
    state.assetsActiveItem,
  )
    ? state.assetsActiveItem
    : getDefaultAssetMenuItem(assetsActiveSection)
  const assetsFileViewMode = isAssetsFileViewMode(state.assetsFileViewMode)
    ? state.assetsFileViewMode
    : 'list'
  const assetsOpenFolderId =
    assetsActiveSection === 'file' &&
    assetsActiveItem === 'project-files' &&
    (typeof state.assetsOpenFolderId === 'string' || state.assetsOpenFolderId === null)
      ? state.assetsOpenFolderId
      : null

  return {
    activeTopNav,
    assetsActiveSection,
    assetsActiveItem,
    assetsFileViewMode,
    assetsOpenFolderId,
  }
}

function isActiveTopNav(value: unknown): value is ActiveTopNav {
  return activeTopNavItems.includes(value as ActiveTopNav)
}

function isAssetsSection(value: unknown): value is AssetsSection {
  return assetsSections.includes(value as AssetsSection)
}

function isAssetsFileViewMode(value: unknown): value is AssetsFileViewMode {
  return assetsFileViewModes.includes(value as AssetsFileViewMode)
}

function isAssetMenuItemForSection(
  section: AssetsSection,
  item: unknown,
): item is AssetMenuItemId {
  return (assetMenuItemsBySection[section] as readonly unknown[]).includes(item)
}

function getDefaultAssetMenuItem(section: AssetsSection): AssetMenuItemId {
  if (section === 'file') {
    return 'project-files'
  }

  return assetMenuItemsBySection[section][0]
}

function sanitizeExpandedProjectIds(
  projectIds: string[],
  existingProjectIds: string[],
  requiredProjectId: string,
): string[] {
  const filteredProjectIds = projectIds.filter((projectId) =>
    existingProjectIds.includes(projectId),
  )

  if (!requiredProjectId || filteredProjectIds.includes(requiredProjectId)) {
    return filteredProjectIds
  }

  return [...filteredProjectIds, requiredProjectId]
}
