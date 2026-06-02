import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { projects as seedProjects } from '../data/mockData'
import {
  archiveThreadSnapshot,
  createProjectSnapshot,
  createInitialDemoState,
  deleteThreadSnapshot,
  renameThreadSnapshot,
  sanitizeDemoState,
  selectTopNavSnapshot,
  selectThreadSnapshot,
  setAssetsFileViewModeSnapshot,
  setAssetsOpenFolderSnapshot,
  setAssetsSelectionSnapshot,
  setSelectedProjectSnapshot,
  startNewThreadSnapshot,
  submitDraftSnapshot,
  togglePinnedSnapshot,
  toggleProjectSnapshot,
  toggleRunInspectorSnapshot,
  toggleSidebarCollapsedSnapshot,
} from './demoStoreLogic'
import type {
  ActiveTopNav,
  AssetMenuItemId,
  AssetsFileViewMode,
  AssetsSection,
  DemoProject,
  DemoStateSnapshot,
  DemoThread,
} from './demoStoreLogic'

export const demoStorePersistKey = 'biomap-agent-demo-store-v2'
export const demoStorePersistVersion = 3

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
  setAssetsOpenFolder: (folderId: string | null) => void
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
          submitDraftSnapshot(state, Date.now(), createThreadId),
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
      setAssetsOpenFolder: (folderId) =>
        set((state) => setAssetsOpenFolderSnapshot(state, folderId)),
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
        assetsOpenFolderId: state.assetsOpenFolderId,
      }),
      merge: (persistedState, currentState) => {
        const restoredState = (persistedState ?? {}) as Partial<DemoStateSnapshot>
        const mergedState: DemoStateSnapshot = {
          ...currentState,
          ...restoredState,
          projects: isDemoProjectArray(restoredState.projects)
            ? mergeProjectsWithCurrentSeed(
                restoredState.projects,
                currentState.projects,
              )
            : currentState.projects,
          selectedProjectId:
            restoredState.selectedProjectId ?? currentState.selectedProjectId,
          selectedThreadId:
            restoredState.selectedThreadId ?? currentState.selectedThreadId,
          isDraftingNewThread:
            restoredState.isDraftingNewThread ??
            currentState.isDraftingNewThread,
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
          assetsOpenFolderId:
            restoredState.assetsOpenFolderId ?? currentState.assetsOpenFolderId,
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

function createThreadId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `thread-${crypto.randomUUID().slice(0, 8)}`
  }

  return `thread-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
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

    const currentSeedThreadsById = new Map(
      currentProject.threads.map((thread) => [thread.id, thread]),
    )
    const mergedThreadIds = new Set<string>()
    const restoredOrSeededThreads = restoredProject.threads.map((thread) => {
      const currentSeedThread = currentSeedThreadsById.get(thread.id)

      if (!currentSeedThread) {
        mergedThreadIds.add(thread.id)
        return thread
      }

      mergedThreadIds.add(currentSeedThread.id)
      return mergeSeedThread(currentSeedThread, thread)
    })
    const missingSeedThreads = currentProject.threads.filter(
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

  return [...userCreatedProjects, ...mergedProjects]
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
