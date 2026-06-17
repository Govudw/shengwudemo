import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { projects as seedProjects } from '../data/mockData'
import {
  archiveThreadSnapshot,
  createProjectSnapshot,
  createInitialDemoState,
  clearNotificationCenterSelectionSnapshot,
  deleteThreadSnapshot,
  markAllNotificationsReadSnapshot,
  markNotificationClearedSnapshot,
  markNotificationReadSnapshot,
  markNotificationResolvedSnapshot,
  openNotificationCenterFromDrawerSnapshot,
  renameThreadSnapshot,
  sanitizeDemoState,
  selectNotificationCenterItemSnapshot,
  selectTopNavSnapshot,
  selectThreadSnapshot,
  setAssetsExperimentViewModeSnapshot,
  setAssetsFileViewModeSnapshot,
  setAssetsOpenFolderSnapshot,
  setAssetsSelectionSnapshot,
  setNotificationDrawerOpenSnapshot,
  setNotificationFilterSnapshot,
  setNotificationCenterBusinessStatusFilterSnapshot,
  setNotificationCenterAdvancedFiltersOpenSnapshot,
  setNotificationCenterPresetSnapshot,
  setNotificationCenterReadStatusFilterSnapshot,
  setNotificationCenterSearchQuerySnapshot,
  setNotificationCenterSourceFilterSnapshot,
  setNotificationCenterStatusFilterSnapshot,
  setNotificationCenterTimeFilterSnapshot,
  setNotificationCenterTypeFilterSnapshot,
  setNotificationCenterSelectedIdSnapshot,
  setSelectedProjectSnapshot,
  startNewThreadSnapshot,
  submitDraftSnapshot,
  togglePinnedSnapshot,
  toggleProjectSnapshot,
  toggleNotificationCenterSelectedIdSnapshot,
  toggleRunInspectorSnapshot,
  toggleSidebarCollapsedSnapshot,
  createStableThreadRouteId,
} from './demoStoreLogic'
import type {
  ActiveTopNav,
  AssetMenuItemId,
  AssetsExperimentViewMode,
  AssetsFileViewMode,
  AssetsSection,
  CreateThreadRouteId,
  DemoProject,
  DemoStateSnapshot,
  DemoThread,
} from './demoStoreLogic'
import { notificationCenterSeedItems } from '../data/notificationCenterMockData'
import type {
  NotificationCenterBusinessStatusFilter,
  NotificationCenterPreset,
  NotificationCenterReadStatusFilter,
  NotificationCenterReminderStatusFilter,
  NotificationCenterSourceFilter,
  NotificationCenterTimeFilter,
  NotificationCenterTypeFilter,
  NotificationFilter,
} from '../data/notificationCenterMockData'

export const demoStorePersistKey = 'biomap-agent-demo-store-v2'
export const demoStorePersistVersion = 4

const obsoleteSeedThreadIdsByProjectId: Record<string, ReadonlySet<string>> = {
  'enzyme-discovery': new Set([
    'enzyme-family',
    'screening-plan',
    'enzymekcat',
  ]),
}

type DemoStoreState = DemoStateSnapshot & {
  startNewThread: () => void
  selectThread: (projectId: string, threadId: string) => void
  setSelectedProject: (projectId: string) => void
  setDraft: (draft: string) => void
  submitDraft: () => void
  createProject: (name: string) => void
  toggleProject: (projectId: string) => void
  togglePinned: (threadId: string) => void
  renameThread: (threadId: string, title: string) => void
  archiveThread: (threadId: string) => void
  deleteThread: (threadId: string) => void
  toggleRunInspector: (threadId: string, open: boolean) => void
  toggleSidebarCollapsed: (sidebarCollapsed: boolean) => void
  selectTopNav: (activeTopNav: ActiveTopNav) => void
  setAssetsSelection: (section: AssetsSection, item: AssetMenuItemId) => void
  setAssetsFileViewMode: (mode: AssetsFileViewMode) => void
  setAssetsExperimentViewMode: (mode: AssetsExperimentViewMode) => void
  setAssetsOpenFolder: (folderId: string | null) => void
  openNotificationDrawer: () => void
  closeNotificationDrawer: () => void
  setNotificationFilter: (filter: NotificationFilter) => void
  markNotificationRead: (notificationId: string) => void
  markAllNotificationsRead: () => void
  markNotificationCleared: (notificationId: string) => void
  markNotificationResolved: (notificationId: string) => void
  openNotificationCenterPageFromDrawer: () => void
  setNotificationCenterPreset: (preset: NotificationCenterPreset) => void
  setNotificationCenterSearchQuery: (query: string) => void
  setNotificationCenterStatusFilter: (
    filter: NotificationCenterReminderStatusFilter,
  ) => void
  setNotificationCenterReadStatusFilter: (
    filter: NotificationCenterReadStatusFilter,
  ) => void
  setNotificationCenterBusinessStatusFilter: (
    filter: NotificationCenterBusinessStatusFilter,
  ) => void
  setNotificationCenterSourceFilter: (
    filter: NotificationCenterSourceFilter,
  ) => void
  setNotificationCenterTypeFilter: (
    filter: NotificationCenterTypeFilter,
  ) => void
  setNotificationCenterTimeFilter: (
    filter: NotificationCenterTimeFilter,
  ) => void
  setNotificationCenterAdvancedFiltersOpen: (open: boolean) => void
  selectNotificationCenterItem: (
    notificationId: string | null,
    detailOpen?: boolean,
  ) => void
  toggleNotificationCenterSelectedId: (notificationId: string) => void
  setNotificationCenterSelectedId: (
    notificationId: string,
    selected: boolean,
  ) => void
  clearNotificationCenterSelection: () => void
  showStatus: (message: string) => void
  clearStatus: () => void
  resetDemoState: () => void
}

const createInitialState = () => createInitialDemoState(seedProjects, Date.now())

export const useDemoStore = create<DemoStoreState>()(
  persist(
    (set) => ({
      ...createInitialState(),
      startNewThread: () => set((state) => startNewThreadSnapshot(state)),
      selectThread: (projectId, threadId) =>
        set((state) => selectThreadSnapshot(state, projectId, threadId)),
      setSelectedProject: (projectId) =>
        set((state) => setSelectedProjectSnapshot(state, projectId)),
      setDraft: (draft) => set({ draft }),
      submitDraft: () =>
        set((state) =>
          submitDraftSnapshot(
            state,
            Date.now(),
            createThreadId,
            createThreadRouteId,
          ),
        ),
      createProject: (name) =>
        set((state) =>
          createProjectSnapshot(state, name, createProjectId(name)),
        ),
      toggleProject: (projectId) =>
        set((state) => toggleProjectSnapshot(state, projectId)),
      togglePinned: (threadId) =>
        set((state) => togglePinnedSnapshot(state, threadId, Date.now())),
      renameThread: (threadId, title) =>
        set((state) => renameThreadSnapshot(state, threadId, title)),
      archiveThread: (threadId) =>
        set((state) => archiveThreadSnapshot(state, threadId)),
      deleteThread: (threadId) =>
        set((state) => deleteThreadSnapshot(state, threadId)),
      toggleRunInspector: (threadId, open) =>
        set((state) => toggleRunInspectorSnapshot(state, threadId, open)),
      toggleSidebarCollapsed: (sidebarCollapsed) =>
        set((state) => toggleSidebarCollapsedSnapshot(state, sidebarCollapsed)),
      selectTopNav: (activeTopNav) =>
        set((state) => selectTopNavSnapshot(state, activeTopNav)),
      setAssetsSelection: (section, item) =>
        set((state) => setAssetsSelectionSnapshot(state, section, item)),
      setAssetsFileViewMode: (mode) =>
        set((state) => setAssetsFileViewModeSnapshot(state, mode)),
      setAssetsExperimentViewMode: (mode) =>
        set((state) => setAssetsExperimentViewModeSnapshot(state, mode)),
      setAssetsOpenFolder: (folderId) =>
        set((state) => setAssetsOpenFolderSnapshot(state, folderId)),
      openNotificationDrawer: () =>
        set((state) => setNotificationDrawerOpenSnapshot(state, true)),
      closeNotificationDrawer: () =>
        set((state) => setNotificationDrawerOpenSnapshot(state, false)),
      setNotificationFilter: (filter) =>
        set((state) => setNotificationFilterSnapshot(state, filter)),
      markNotificationRead: (notificationId) =>
        set((state) => markNotificationReadSnapshot(state, notificationId)),
      markAllNotificationsRead: () =>
        set((state) =>
          markAllNotificationsReadSnapshot(
            state,
            notificationCenterSeedItems.map((item) => item.id),
          ),
        ),
      markNotificationResolved: (notificationId) =>
        set((state) => markNotificationResolvedSnapshot(state, notificationId)),
      markNotificationCleared: (notificationId) =>
        set((state) => markNotificationClearedSnapshot(state, notificationId)),
      openNotificationCenterPageFromDrawer: () =>
        set((state) => openNotificationCenterFromDrawerSnapshot(state)),
      setNotificationCenterPreset: (preset) =>
        set((state) => setNotificationCenterPresetSnapshot(state, preset)),
      setNotificationCenterSearchQuery: (query) =>
        set((state) => setNotificationCenterSearchQuerySnapshot(state, query)),
      setNotificationCenterStatusFilter: (filter) =>
        set((state) => setNotificationCenterStatusFilterSnapshot(state, filter)),
      setNotificationCenterReadStatusFilter: (filter) =>
        set((state) =>
          setNotificationCenterReadStatusFilterSnapshot(state, filter),
        ),
      setNotificationCenterBusinessStatusFilter: (filter) =>
        set((state) =>
          setNotificationCenterBusinessStatusFilterSnapshot(state, filter),
        ),
      setNotificationCenterSourceFilter: (filter) =>
        set((state) => setNotificationCenterSourceFilterSnapshot(state, filter)),
      setNotificationCenterTypeFilter: (filter) =>
        set((state) => setNotificationCenterTypeFilterSnapshot(state, filter)),
      setNotificationCenterTimeFilter: (filter) =>
        set((state) => setNotificationCenterTimeFilterSnapshot(state, filter)),
      setNotificationCenterAdvancedFiltersOpen: (open) =>
        set((state) =>
          setNotificationCenterAdvancedFiltersOpenSnapshot(state, open),
        ),
      selectNotificationCenterItem: (notificationId, detailOpen) =>
        set((state) =>
          selectNotificationCenterItemSnapshot(
            state,
            notificationId,
            detailOpen,
          ),
        ),
      toggleNotificationCenterSelectedId: (notificationId) =>
        set((state) =>
          toggleNotificationCenterSelectedIdSnapshot(state, notificationId),
        ),
      setNotificationCenterSelectedId: (notificationId, selected) =>
        set((state) =>
          setNotificationCenterSelectedIdSnapshot(
            state,
            notificationId,
            selected,
          ),
        ),
      clearNotificationCenterSelection: () =>
        set((state) => clearNotificationCenterSelectionSnapshot(state)),
      showStatus: (message) => set({ statusMessage: message }),
      clearStatus: () => set({ statusMessage: '' }),
      resetDemoState: () => set(createInitialState()),
    }),
    {
      name: demoStorePersistKey,
      version: demoStorePersistVersion,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => persistedState,
      partialize: (state) => ({
        projects: state.projects,
        selectedProjectId: state.selectedProjectId,
        selectedThreadId: state.selectedThreadId,
        isDraftingNewThread: state.isDraftingNewThread,
        draft: state.draft,
        expandedProjectIds: state.expandedProjectIds,
        sidebarCollapsed: state.sidebarCollapsed,
        runInspectorByThreadId: state.runInspectorByThreadId,
        activeTopNav: state.activeTopNav,
        assetsActiveSection: state.assetsActiveSection,
        assetsActiveItem: state.assetsActiveItem,
        assetsFileViewMode: state.assetsFileViewMode,
        assetsExperimentViewMode: state.assetsExperimentViewMode,
        assetsOpenFolderId: state.assetsOpenFolderId,
        notificationDrawerOpen: state.notificationDrawerOpen,
        notificationFilter: state.notificationFilter,
        notificationReadById: state.notificationReadById,
        notificationClearedById: state.notificationClearedById,
        notificationResolvedById: state.notificationResolvedById,
        notificationCenterPreset: state.notificationCenterPreset,
        notificationCenterSearchQuery: state.notificationCenterSearchQuery,
        notificationCenterStatusFilter: state.notificationCenterStatusFilter,
        notificationCenterReadStatusFilter:
          state.notificationCenterReadStatusFilter,
        notificationCenterBusinessStatusFilter:
          state.notificationCenterBusinessStatusFilter,
        notificationCenterSourceFilter: state.notificationCenterSourceFilter,
        notificationCenterTypeFilter: state.notificationCenterTypeFilter,
        notificationCenterTimeFilter: state.notificationCenterTimeFilter,
        notificationCenterAdvancedFiltersOpen:
          state.notificationCenterAdvancedFiltersOpen,
        notificationCenterSelectedId: state.notificationCenterSelectedId,
        notificationCenterDetailOpen: state.notificationCenterDetailOpen,
      }),
      merge: (persistedState, currentState) => {
        const restoredState = (persistedState ?? {}) as Partial<DemoStateSnapshot> & {
          notificationCenterStatusFilter?: unknown
          notificationCenterReadStatusFilter?: unknown
        }
        const selectedProjectId =
          restoredState.selectedProjectId ?? currentState.selectedProjectId
        const selectedThreadId =
          restoredState.selectedThreadId ?? currentState.selectedThreadId
        const selectedObsoleteThread = isObsoleteSeedThreadId(
          selectedProjectId,
          selectedThreadId,
        )
        const legacyReadStatusFilter = getLegacyNotificationCenterReadStatusFilter(
          restoredState.notificationCenterStatusFilter,
        )
        const restoredReminderStatusFilter =
          legacyReadStatusFilter ||
          !isNotificationCenterReminderStatusFilter(
            restoredState.notificationCenterStatusFilter,
          )
            ? currentState.notificationCenterStatusFilter
            : restoredState.notificationCenterStatusFilter
        const restoredReadStatusFilter = isNotificationCenterReadStatusFilter(
          restoredState.notificationCenterReadStatusFilter,
        )
          ? restoredState.notificationCenterReadStatusFilter
          : (legacyReadStatusFilter ?? currentState.notificationCenterReadStatusFilter)
        const mergedState: DemoStateSnapshot = {
          ...currentState,
          ...restoredState,
          projects: isDemoProjectArray(restoredState.projects)
            ? mergeProjectsWithCurrentSeed(
                restoredState.projects,
                currentState.projects,
              )
            : currentState.projects,
          selectedProjectId,
          selectedThreadId: selectedObsoleteThread ? null : selectedThreadId,
          isDraftingNewThread:
            selectedObsoleteThread
              ? true
              : (restoredState.isDraftingNewThread ??
                currentState.isDraftingNewThread),
          draft: restoredState.draft ?? currentState.draft,
          expandedProjectIds:
            restoredState.expandedProjectIds ?? currentState.expandedProjectIds,
          sidebarCollapsed:
            typeof restoredState.sidebarCollapsed === 'boolean'
              ? restoredState.sidebarCollapsed
              : currentState.sidebarCollapsed,
          runInspectorByThreadId: isRunInspectorStateRecord(
            restoredState.runInspectorByThreadId,
          )
            ? restoredState.runInspectorByThreadId
            : currentState.runInspectorByThreadId,
          activeTopNav:
            restoredState.activeTopNav ?? currentState.activeTopNav,
          assetsActiveSection:
            restoredState.assetsActiveSection ?? currentState.assetsActiveSection,
          assetsActiveItem:
            restoredState.assetsActiveItem ?? currentState.assetsActiveItem,
          assetsFileViewMode:
            restoredState.assetsFileViewMode ?? currentState.assetsFileViewMode,
          assetsExperimentViewMode:
            restoredState.assetsExperimentViewMode ??
            currentState.assetsExperimentViewMode,
          assetsOpenFolderId:
            restoredState.assetsOpenFolderId ?? currentState.assetsOpenFolderId,
          notificationDrawerOpen:
            restoredState.notificationDrawerOpen ??
            currentState.notificationDrawerOpen,
          notificationFilter:
            restoredState.notificationFilter ?? currentState.notificationFilter,
          notificationReadById:
            restoredState.notificationReadById ??
            currentState.notificationReadById,
          notificationClearedById:
            restoredState.notificationClearedById ??
            restoredState.notificationResolvedById ??
            currentState.notificationClearedById,
          notificationResolvedById:
            restoredState.notificationResolvedById ??
            restoredState.notificationClearedById ??
            currentState.notificationResolvedById,
          notificationCenterPreset:
            restoredState.notificationCenterPreset ??
            currentState.notificationCenterPreset,
          notificationCenterSearchQuery:
            restoredState.notificationCenterSearchQuery ??
            currentState.notificationCenterSearchQuery,
          notificationCenterStatusFilter: restoredReminderStatusFilter,
          notificationCenterReadStatusFilter: restoredReadStatusFilter,
          notificationCenterBusinessStatusFilter:
            restoredState.notificationCenterBusinessStatusFilter ??
            currentState.notificationCenterBusinessStatusFilter,
          notificationCenterSourceFilter:
            restoredState.notificationCenterSourceFilter ??
            currentState.notificationCenterSourceFilter,
          notificationCenterTypeFilter:
            restoredState.notificationCenterTypeFilter ??
            currentState.notificationCenterTypeFilter,
          notificationCenterTimeFilter:
            restoredState.notificationCenterTimeFilter ??
            currentState.notificationCenterTimeFilter,
          notificationCenterAdvancedFiltersOpen:
            restoredState.notificationCenterAdvancedFiltersOpen ??
            currentState.notificationCenterAdvancedFiltersOpen,
          notificationCenterSelectedId:
            restoredState.notificationCenterSelectedId ??
            currentState.notificationCenterSelectedId,
          notificationCenterSelectedIds: [],
          notificationCenterDetailOpen:
            restoredState.notificationCenterDetailOpen ??
            currentState.notificationCenterDetailOpen,
          statusMessage: '',
        }

        return {
          ...currentState,
          ...sanitizeDemoState(mergedState),
        }
      },
    },
  ),
)

export function resetPersistedDemoStore() {
  localStorage.removeItem(demoStorePersistKey)
  useDemoStore.getState().resetDemoState()
  window.location.reload()
}

function isRunInspectorStateRecord(
  value: unknown,
): value is DemoStateSnapshot['runInspectorByThreadId'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as { open?: unknown }).open === 'boolean',
    )
  )
}

function isNotificationCenterReminderStatusFilter(
  value: unknown,
): value is NotificationCenterReminderStatusFilter {
  return value === 'all' || value === 'actionRequired' || value === 'cleared'
}

function isNotificationCenterReadStatusFilter(
  value: unknown,
): value is NotificationCenterReadStatusFilter {
  return value === 'all' || value === 'read' || value === 'unread'
}

function getLegacyNotificationCenterReadStatusFilter(
  value: unknown,
): NotificationCenterReadStatusFilter | undefined {
  return value === 'read' || value === 'unread' ? value : undefined
}

function createThreadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `thread-${crypto.randomUUID().slice(0, 8)}`
  }

  return `thread-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

const threadRouteAlphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'

const createThreadRouteId: CreateThreadRouteId = (existingRouteIds, seed) => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const values = new Uint8Array(16)
      crypto.getRandomValues(values)
      const routeId = Array.from(values, (value) =>
        threadRouteAlphabet[value % threadRouteAlphabet.length],
      ).join('')

      if (!existingRouteIds.has(routeId)) {
        return routeId
      }
    }
  }

  return createStableThreadRouteId(existingRouteIds, seed)
}

function createProjectId(name: string) {
  const normalizedName = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 36)
  const prefix = normalizedName || 'project'

  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `project-${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }

  return `project-${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

function isDemoProjectArray(value: unknown): value is DemoProject[] {
  return (
    Array.isArray(value) &&
    value.every(
      (project) =>
        typeof project === 'object' &&
        project !== null &&
        typeof (project as DemoProject).id === 'string' &&
        typeof (project as DemoProject).name === 'string' &&
        Array.isArray((project as DemoProject).threads) &&
        (project as DemoProject).threads.every(isDemoThreadLike),
    )
  )
}

function isDemoThreadLike(value: unknown): value is DemoThread {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const thread = value as DemoThread

  return (
    typeof thread.id === 'string' &&
    typeof thread.title === 'string' &&
    typeof thread.lastActivityAt === 'number' &&
    typeof thread.pinned === 'boolean' &&
    (typeof thread.pinnedAt === 'number' || thread.pinnedAt === null) &&
    typeof thread.archived === 'boolean' &&
    typeof thread.createdAt === 'number' &&
    Array.isArray(thread.transcript)
  )
}

function mergeProjectsWithCurrentSeed(
  restoredProjects: DemoProject[],
  currentProjects: DemoProject[],
): DemoProject[] {
  const restoredProjectsById = new Map(
    restoredProjects.map((project) => [project.id, project]),
  )

  const mergedProjects = currentProjects.map((currentProject) => {
    const restoredProject = restoredProjectsById.get(currentProject.id)

    if (!restoredProject) {
      return currentProject
    }

    const obsoleteThreadIds = obsoleteSeedThreadIdsByProjectId[currentProject.id]
    const currentSeedThreads = obsoleteThreadIds
      ? currentProject.threads.filter((thread) => !obsoleteThreadIds.has(thread.id))
      : currentProject.threads
    const restoredThreads = obsoleteThreadIds
      ? restoredProject.threads.filter((thread) => !obsoleteThreadIds.has(thread.id))
      : restoredProject.threads
    const currentSeedThreadsById = new Map(
      currentSeedThreads.map((thread) => [thread.id, thread]),
    )
    const mergedThreadIds = new Set<string>()
    const restoredOrSeededThreads = restoredThreads.map((thread) => {
      const currentSeedThread = currentSeedThreadsById.get(thread.id)

      if (!currentSeedThread) {
        mergedThreadIds.add(thread.id)
        return thread
      }

      mergedThreadIds.add(currentSeedThread.id)
      return mergeSeedThread(currentSeedThread, thread)
    })
    const missingSeedThreads = currentSeedThreads.filter(
      (thread) => !mergedThreadIds.has(thread.id),
    )

    return {
      ...currentProject,
      threads: [...restoredOrSeededThreads, ...missingSeedThreads],
    }
  })

  const currentProjectIds = new Set(
    currentProjects.map((currentProject) => currentProject.id),
  )
  const userCreatedProjects = restoredProjects.filter(
    (restoredProject) => !currentProjectIds.has(restoredProject.id),
  )

  return [...mergedProjects, ...userCreatedProjects]
}

function isObsoleteSeedThreadId(
  projectId: string | null,
  threadId: string | null,
): boolean {
  if (!projectId || !threadId) {
    return false
  }

  return obsoleteSeedThreadIdsByProjectId[projectId]?.has(threadId) ?? false
}

function mergeSeedThread(
  currentSeedThread: DemoThread,
  restoredThread: DemoThread,
): DemoThread {
  return {
    ...currentSeedThread,
    title: restoredThread.title ?? currentSeedThread.title,
    lastActivityAt: restoredThread.lastActivityAt ?? currentSeedThread.lastActivityAt,
    pinned: restoredThread.pinned ?? currentSeedThread.pinned,
    pinnedAt: restoredThread.pinned
      ? (restoredThread.pinnedAt ?? currentSeedThread.pinnedAt)
      : currentSeedThread.pinnedAt,
    archived: restoredThread.archived ?? currentSeedThread.archived,
    createdAt: restoredThread.createdAt ?? currentSeedThread.createdAt,
    transcript: mergeSeedTranscript(currentSeedThread, restoredThread),
  }
}

function mergeSeedTranscript(
  currentSeedThread: DemoThread,
  restoredThread: DemoThread,
): DemoThread['transcript'] {
  if (!hasCurrentSeedTranscriptPrefix(restoredThread, currentSeedThread)) {
    return currentSeedThread.transcript
  }

  return [
    ...currentSeedThread.transcript,
    ...restoredThread.transcript.slice(currentSeedThread.transcript.length),
  ]
}

function hasCurrentSeedTranscriptPrefix(
  restoredThread: DemoThread,
  currentSeedThread: DemoThread,
): boolean {
  if (restoredThread.transcript.length < currentSeedThread.transcript.length) {
    return false
  }

  return currentSeedThread.transcript.every((currentTurn, index) => {
    const restoredTurn = restoredThread.transcript[index]

    return (
      restoredTurn?.id === currentTurn.id &&
      restoredTurn.role === currentTurn.role &&
      contentBlockTypes(restoredTurn).join('|') ===
        contentBlockTypes(currentTurn).join('|')
    )
  })
}

function contentBlockTypes(turn: DemoThread['transcript'][number]): string[] {
  return turn.contentBlocks?.map((block) => block.type) ?? []
}

declare global {
  interface Window {
    reset?: () => void
  }
}
