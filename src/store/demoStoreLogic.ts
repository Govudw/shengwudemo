import type { ConversationTurn, RunInspectorData } from '../data/conversationTypes'
import type { Project } from '../data/mockData'

export type DemoThread = {
  id: string
  routeId: string
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
  assetsExperimentViewMode: AssetsExperimentViewMode
  assetsOpenFolderId: string | null
  statusMessage: string
}

export type ActiveTopNav =
  | 'Workspace'
  | 'Projects'
  | 'Assets'
  | 'Capabilities'
  | 'ApprovalCenter'

export type AssetsSection = 'file' | 'knowledge' | 'data' | 'experiment' | 'model'

export type FileAssetItemId =
  | 'public-files'
  | 'project-files'
  | 'recent-uploads'
  | 'archived-files'

export type KnowledgeAssetItemId =
  | 'all-knowledge'
  | 'rag'
  | 'knowledge-graph'
  | 'graph-rag'

export type DataAssetItemId =
  | 'datasets'
  | 'tables'
  | 'analysis-results'
  | 'catalog'

export type ExperimentAssetItemId =
  | 'experiment-list'
  | 'execution'
  | 'inventory'
  | 'equipment'
  | 'recipe'

export type ModelAssetItemId =
  | 'xtrimo'
  | 'public-models'
  | 'project-models'
  | 'oracles'

export type AssetMenuItemId =
  | FileAssetItemId
  | KnowledgeAssetItemId
  | DataAssetItemId
  | ExperimentAssetItemId
  | ModelAssetItemId

export type AssetsFileViewMode = 'list' | 'grid'
export type AssetsExperimentViewMode = 'grid' | 'table'

export type ThreadEntry = {
  projectId: string
  projectName: string
  thread: DemoThread
}

export type SearchView = {
  pinnedThreadEntries: ThreadEntry[]
  projects: DemoProject[]
}

export type CreateThreadRouteId = (
  existingRouteIds: ReadonlySet<string>,
  seed: string,
) => string

const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour
export const threadRouteIdPattern = /^[a-z0-9]{16}$/
const activeTopNavItems = [
  'Workspace',
  'Projects',
  'Assets',
  'Capabilities',
  'ApprovalCenter',
] as const
const assetsSections = ['file', 'knowledge', 'data', 'experiment', 'model'] as const
const assetsFileViewModes = ['list', 'grid'] as const
const assetsExperimentViewModes = ['grid', 'table'] as const
const assetMenuItemsBySection = {
  file: ['public-files', 'project-files', 'recent-uploads', 'archived-files'],
  knowledge: ['all-knowledge', 'rag', 'knowledge-graph', 'graph-rag'],
  data: ['datasets', 'tables', 'analysis-results', 'catalog'],
  experiment: ['experiment-list', 'execution', 'inventory', 'equipment', 'recipe'],
  model: ['xtrimo', 'public-models', 'project-models', 'oracles'],
} as const satisfies Record<AssetsSection, readonly AssetMenuItemId[]>
const selectedThreadAcknowledgement =
  '已记录到当前对话。本次输入已加入线程历史，当前未触发新的 BioMap OS 操作。'

export function createInitialDemoState(
  seedProjects: Project[],
  now: number,
  createRouteId: CreateThreadRouteId = createStableThreadRouteId,
): DemoStateSnapshot {
  return {
    projects: createInitialDemoProjects(seedProjects, now, createRouteId),
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
    assetsExperimentViewMode: 'grid',
    assetsOpenFolderId: null,
    statusMessage: '',
  }
}

export function createInitialDemoProjects(
  seedProjects: Project[],
  now: number,
  createRouteId: CreateThreadRouteId = createStableThreadRouteId,
): DemoProject[] {
  const usedRouteIds = new Set<string>()

  return seedProjects.map((project, projectIndex) => ({
    id: project.id,
    name: project.name,
    threads: project.threads.map((thread, threadIndex) => {
      const seedOrder = projectIndex * 100 + threadIndex
      const routeId = getUsableThreadRouteId(
        thread.routeId,
        `${project.id}:${thread.id}`,
        usedRouteIds,
        createRouteId,
      )

      return {
        id: thread.id,
        routeId,
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
  createRouteId: CreateThreadRouteId = createStableThreadRouteId,
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
  const existingRouteIds = collectThreadRouteIds(state.projects)
  const newThread: DemoThread = {
    id: threadId,
    routeId: createRouteId(existingRouteIds, `${targetProjectId}:${threadId}`),
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

export function createProjectSnapshot(
  state: DemoStateSnapshot,
  name: string,
  projectId: string,
): DemoStateSnapshot {
  const normalizedName = normalizeWhitespace(name)

  if (!normalizedName) {
    return {
      ...state,
      statusMessage: '项目名称不能为空',
    }
  }

  if (state.projects.some((project) => project.id === projectId)) {
    return {
      ...state,
      statusMessage: '项目 ID 已存在',
    }
  }

  const project: DemoProject = {
    id: projectId,
    name: normalizedName,
    threads: [],
  }

  return {
    ...state,
    projects: [project, ...state.projects],
    selectedProjectId: projectId,
    selectedThreadId: null,
    isDraftingNewThread: true,
    expandedProjectIds: ensureProjectExpanded(
      state.expandedProjectIds,
      projectId,
    ),
    statusMessage: '',
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

export function setAssetsExperimentViewModeSnapshot(
  state: DemoStateSnapshot,
  assetsExperimentViewMode: AssetsExperimentViewMode,
): DemoStateSnapshot {
  if (!isAssetsExperimentViewMode(assetsExperimentViewMode)) {
    return state
  }

  return {
    ...state,
    assetsExperimentViewMode,
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

export function findThreadByRouteId(
  projects: DemoProject[],
  routeId: string,
): (ThreadEntry & { project: DemoProject }) | undefined {
  if (!isThreadRouteId(routeId)) {
    return undefined
  }

  for (const project of projects) {
    const thread = project.threads.find(
      (currentThread) =>
        currentThread.routeId === routeId && !currentThread.archived,
    )

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

export function isThreadRouteId(value: string): boolean {
  return threadRouteIdPattern.test(value)
}

export function collectThreadRouteIds(projects: DemoProject[]): Set<string> {
  return new Set(
    projects.flatMap((project) => project.threads.map((thread) => thread.routeId)),
  )
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
  const usedRouteIds = new Set<string>()

  return projects.map((project) => ({
    ...project,
    threads: project.threads.map((thread) => {
      const routeId = getUsableThreadRouteId(
        (thread as Partial<DemoThread>).routeId,
        `${project.id}:${thread.id}`,
        usedRouteIds,
        createStableThreadRouteId,
      )

      return {
        ...thread,
        routeId,
        transcript: cloneTranscript(thread.transcript),
        runInspector: cloneRunInspector(thread.runInspector),
      }
    }),
  }))
}

function getUsableThreadRouteId(
  candidate: unknown,
  seed: string,
  usedRouteIds: Set<string>,
  createRouteId: CreateThreadRouteId,
): string {
  if (
    typeof candidate === 'string' &&
    isThreadRouteId(candidate) &&
    !usedRouteIds.has(candidate)
  ) {
    usedRouteIds.add(candidate)
    return candidate
  }

  const routeId = createUniqueRouteId(usedRouteIds, seed, createRouteId)
  usedRouteIds.add(routeId)
  return routeId
}

function createUniqueRouteId(
  usedRouteIds: ReadonlySet<string>,
  seed: string,
  createRouteId: CreateThreadRouteId,
): string {
  let routeId = createRouteId(usedRouteIds, seed)
  let attempt = 0

  while (!isThreadRouteId(routeId) || usedRouteIds.has(routeId)) {
    attempt += 1
    routeId = createStableThreadRouteId(usedRouteIds, `${seed}:${attempt}`)
  }

  return routeId
}

export function createStableThreadRouteId(
  existingRouteIds: ReadonlySet<string>,
  seed: string,
): string {
  let attempt = 0

  while (attempt < 1000) {
    const routeId = hashRouteId(attempt === 0 ? seed : `${seed}:${attempt}`)

    if (!existingRouteIds.has(routeId)) {
      return routeId
    }

    attempt += 1
  }

  return hashRouteId(`${seed}:${existingRouteIds.size}:${Date.now()}`)
}

function hashRouteId(seed: string): string {
  let first = 0x811c9dc5
  let second = 0x85ebca6b

  for (let index = 0; index < seed.length; index += 1) {
    const code = seed.charCodeAt(index)
    first ^= code
    first = Math.imul(first, 0x01000193)
    second ^= code + index
    second = Math.imul(second, 0x27d4eb2d)
  }

  const firstPart = (first >>> 0).toString(36).padStart(8, '0').slice(-8)
  const secondPart = (second >>> 0).toString(36).padStart(8, '0').slice(-8)

  return `${firstPart}${secondPart}`.slice(0, 16)
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
  | 'assetsExperimentViewMode'
  | 'assetsOpenFolderId'
> {
  const activeTopNav = isActiveTopNav(state.activeTopNav)
    ? state.activeTopNav
    : 'Workspace'
  const assetsActiveSection = isAssetsSection(state.assetsActiveSection)
    ? state.assetsActiveSection
    : 'file'
  const normalizedAssetMenuItem = normalizeLegacyAssetMenuItem(
    assetsActiveSection,
    state.assetsActiveItem,
  )
  const assetsActiveItem = isAssetMenuItemForSection(
    assetsActiveSection,
    normalizedAssetMenuItem,
  )
    ? normalizedAssetMenuItem
    : getDefaultAssetMenuItem(assetsActiveSection)
  const assetsFileViewMode = isAssetsFileViewMode(state.assetsFileViewMode)
    ? state.assetsFileViewMode
    : 'list'
  const assetsExperimentViewMode = isAssetsExperimentViewMode(
    state.assetsExperimentViewMode,
  )
    ? state.assetsExperimentViewMode
    : 'grid'
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
    assetsExperimentViewMode,
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

function isAssetsExperimentViewMode(
  value: unknown,
): value is AssetsExperimentViewMode {
  return assetsExperimentViewModes.includes(value as AssetsExperimentViewMode)
}

function isAssetMenuItemForSection(
  section: AssetsSection,
  item: unknown,
): item is AssetMenuItemId {
  return (assetMenuItemsBySection[section] as readonly unknown[]).includes(item)
}

function normalizeLegacyAssetMenuItem(
  section: AssetsSection,
  item: unknown,
): unknown {
  if (section !== 'experiment') {
    return item
  }

  if (item === 'request') {
    return 'experiment-list'
  }

  if (item === 'configuration') {
    return 'recipe'
  }

  return item
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
