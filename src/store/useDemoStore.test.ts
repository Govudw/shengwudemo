import { beforeEach, describe, expect, it, vi } from 'vitest'
import { projects as seedProjects } from '../data/mockData'
import type { DemoProject } from './demoStoreLogic'

class MemoryStorage implements Storage {
  private values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe('demo store persistence', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('localStorage', new MemoryStorage())
  })

  it('does not let old persisted EGFR data override the current replay seed', async () => {
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: createOldEgfrPersistedState(),
      version: 2,
    })

    const customThread = useDemoStore
      .getState()
      .projects.flatMap((project) => project.threads)
      .find((thread) => thread.id === 'custom-thread')

    expect(customThread?.title).toBe('用户新增的自定义对话')
    expectCurrentEgfrReplaySeed(useDemoStore.getState().projects)
  })

  it('refreshes stale same-version EGFR seed data while keeping persisted projects valid', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: createOldEgfrPersistedState(),
      version: demoStorePersistVersion,
    })

    const state = useDemoStore.getState()
    const customThread = state.projects
      .flatMap((project) => project.threads)
      .find((thread) => thread.id === 'custom-thread')

    expect(customThread?.title).toBe('用户新增的自定义对话')
    expectCurrentEgfrReplaySeed(state.projects)
  })

  it('hydrates safely when persisted projects contain invalid Thread entries', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        projects: [
          {
            id: 'antibody-optimization',
            name: 'Antibody Optimization',
            threads: [null],
          },
        ],
        selectedProjectId: 'antibody-optimization',
        selectedThreadId: 'egfr-affinity',
        isDraftingNewThread: false,
        draft: '',
        expandedProjectIds: ['antibody-optimization'],
      },
      version: demoStorePersistVersion,
    })

    expectCurrentEgfrReplaySeed(useDemoStore.getState().projects)
  })

  it('keeps turns appended after the current seeded EGFR replay during hydrate', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const extraTurns = [
      {
        id: 'turn-extra-user',
        role: 'user',
        markdown: '追加分析 AF-01 的 developability 风险',
      },
      {
        id: 'turn-extra-main-agent',
        role: 'mainAgent',
        markdown: '已记录追加分析请求。',
      },
    ]
    const currentEgfrSeed = seedProjects[0].threads[0]
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        projects: [
          {
            id: 'antibody-optimization',
            name: 'Antibody Optimization',
            threads: [
              {
                id: 'egfr-affinity',
                title: currentEgfrSeed.title,
                lastActivityAt: 123,
                pinned: false,
                pinnedAt: null,
                archived: false,
                createdAt: 1,
                transcript: [...(currentEgfrSeed.transcript ?? []), ...extraTurns],
              },
            ],
          },
        ],
      },
      version: demoStorePersistVersion,
    })

    const egfrThread = useDemoStore
      .getState()
      .projects.flatMap((project) => project.threads)
      .find((thread) => thread.id === 'egfr-affinity')
    const blocks =
      egfrThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []

    expect(egfrThread?.transcript).toHaveLength(
      (currentEgfrSeed.transcript?.length ?? 0) + extraTurns.length,
    )
    expect(egfrThread?.transcript.at(-2)).toMatchObject(extraTurns[0])
    expect(egfrThread?.transcript.at(-1)).toMatchObject(extraTurns[1])
    expect(blocks.some((block) => block.type === 'visualEvidence')).toBe(false)
    expect(egfrThread?.runInspector).toEqual(currentEgfrSeed.runInspector)
  })

  it('persists Run Inspector state while resetting it with demo state', async () => {
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        runInspectorByThreadId: {
          'egfr-affinity': { open: true },
        },
      },
      version: 3,
    })

    expect(useDemoStore.getState().runInspectorByThreadId['egfr-affinity']).toEqual({
      open: true,
    })

    useDemoStore.getState().toggleRunInspector('egfr-affinity', false)
    expect(useDemoStore.getState().runInspectorByThreadId['egfr-affinity']).toEqual({
      open: false,
    })

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().runInspectorByThreadId).toEqual({})
  })

  it('persists sidebar collapsed state and resets it with demo state', async () => {
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        sidebarCollapsed: true,
      },
      version: 3,
    })

    expect(useDemoStore.getState().sidebarCollapsed).toBe(true)

    useDemoStore.getState().toggleSidebarCollapsed(false)
    expect(useDemoStore.getState().sidebarCollapsed).toBe(false)

    useDemoStore.getState().toggleSidebarCollapsed(true)
    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.sidebarCollapsed).toBe(true)

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().sidebarCollapsed).toBe(false)
  })

  it('persists Assets navigation and view state', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'model',
        assetsActiveItem: 'oracles',
        assetsFileViewMode: 'grid',
        assetsOpenFolderId: 'project-antibody-optimization',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Assets')
    expect(useDemoStore.getState().assetsActiveSection).toBe('model')
    expect(useDemoStore.getState().assetsActiveItem).toBe('oracles')
    expect(useDemoStore.getState().assetsFileViewMode).toBe('grid')
    expect(useDemoStore.getState().assetsOpenFolderId).toBeNull()

    useDemoStore.getState().setAssetsSelection('experiment', 'execution')
    useDemoStore.getState().setAssetsFileViewMode('list')
    useDemoStore.getState().setAssetsOpenFolder(null)

    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.assetsActiveSection).toBe('experiment')
    expect(persistedPayload.state.assetsActiveItem).toBe('execution')
    expect(persistedPayload.state.assetsFileViewMode).toBe('list')
    expect(persistedPayload.state.assetsOpenFolderId).toBeNull()

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
    expect(useDemoStore.getState().assetsActiveSection).toBe('file')
    expect(useDemoStore.getState().assetsActiveItem).toBe('project-files')
  })

  it('sanitizes invalid persisted Assets state', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Admin',
        assetsActiveSection: 'private',
        assetsActiveItem: 'templates',
        assetsFileViewMode: 'kanban',
        assetsOpenFolderId: 123,
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
    expect(useDemoStore.getState().assetsActiveSection).toBe('file')
    expect(useDemoStore.getState().assetsActiveItem).toBe('project-files')
    expect(useDemoStore.getState().assetsFileViewMode).toBe('list')
    expect(useDemoStore.getState().assetsOpenFolderId).toBeNull()
  })

  it('clears a persisted project folder when the active Assets menu is not project files', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'file',
        assetsActiveItem: 'public-files',
        assetsOpenFolderId: 'project-antibody-optimization',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().assetsActiveItem).toBe('public-files')
    expect(useDemoStore.getState().assetsOpenFolderId).toBeNull()
  })

  it('ignores invalid persisted sidebar collapsed values', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        sidebarCollapsed: 'true',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().sidebarCollapsed).toBe(false)
  })

  it('keeps sidebar collapsed state when deleting a Thread', async () => {
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        sidebarCollapsed: true,
      },
      version: 3,
    })

    useDemoStore.getState().deleteThread('custom-thread')

    expect(useDemoStore.getState().sidebarCollapsed).toBe(true)
  })

  it('preserves renamed seeded Thread titles during hydrate', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const oldState = createOldEgfrPersistedState()
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...oldState,
        projects: [
          {
            ...oldState.projects[0],
            threads: oldState.projects[0].threads.map((thread) =>
              thread.id === 'egfr-affinity'
                ? { ...thread, title: '用户重命名 EGFR 对话' }
                : thread,
            ),
          },
        ],
      },
      version: demoStorePersistVersion,
    })

    const egfrThread = useDemoStore
      .getState()
      .projects.flatMap((project) => project.threads)
      .find((thread) => thread.id === 'egfr-affinity')

    expect(egfrThread?.title).toBe('用户重命名 EGFR 对话')
  })

  it('keeps user-created Projects when hydrating with the current seed data', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const oldState = createOldEgfrPersistedState()
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...oldState,
        projects: [
          ...oldState.projects,
          {
            id: 'project-assay-automation',
            name: 'Assay Automation',
            threads: [],
          },
        ],
        selectedProjectId: 'project-assay-automation',
        selectedThreadId: null,
        isDraftingNewThread: true,
        expandedProjectIds: [
          ...oldState.expandedProjectIds,
          'project-assay-automation',
        ],
      },
      version: demoStorePersistVersion,
    })

    const state = useDemoStore.getState()

    expect(state.projects.map((project) => project.name)).toContain(
      'Assay Automation',
    )
    expect(state.selectedProjectId).toBe('project-assay-automation')
    expect(state.expandedProjectIds).toContain('project-assay-automation')
  })
})

async function loadStoreWithPersistedState(persistedValue: unknown) {
  const { demoStorePersistKey } = await import('./useDemoStore')
  vi.resetModules()

  localStorage.setItem(demoStorePersistKey, JSON.stringify(persistedValue))

  return import('./useDemoStore')
}

function createOldEgfrPersistedState() {
  return {
    projects: [
      {
        id: 'antibody-optimization',
        name: 'Antibody Optimization',
        threads: [
          {
            id: 'egfr-affinity',
            title: 'EGFR 抗体亲和力优化',
            lastActivityAt: 0,
            pinned: false,
            pinnedAt: null,
            archived: false,
            createdAt: 0,
            transcript: [
              {
                id: 'old-egfr-turn',
                role: 'mainAgent',
                markdown: '旧版对话',
                contentBlocks: [
                  {
                    type: 'visualEvidence',
                    title: 'Old BioMap OS screenshot',
                    caption: '旧截图证据',
                  },
                ],
              },
            ],
          },
          {
            id: 'custom-thread',
            title: '用户新增的自定义对话',
            lastActivityAt: 1,
            pinned: false,
            pinnedAt: null,
            archived: false,
            createdAt: 1,
            transcript: [],
          },
        ],
      },
    ],
    selectedProjectId: 'antibody-optimization',
    selectedThreadId: 'egfr-affinity',
    isDraftingNewThread: false,
    draft: '',
    expandedProjectIds: ['antibody-optimization'],
  }
}

function expectCurrentEgfrReplaySeed(projects: DemoProject[]) {
  const egfrThread = projects
    .flatMap((project) => project.threads)
    .find((thread) => thread.id === 'egfr-affinity')
  const blocks =
    egfrThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
  const runInspector = egfrThread?.runInspector

  expect(egfrThread?.transcript).toHaveLength(19)
  expect(runInspector).toBeDefined()
  expect(runInspector?.summary).toMatchObject({
    stage: '已完成干湿闭环',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 6,
    pendingCount: 0,
  })
  expect(runInspector?.outputs).toHaveLength(runInspector?.summary.outputCount ?? 0)
  expect(runInspector?.outputs).toEqual(
    expect.arrayContaining([expect.objectContaining({ kind: 'experimentOrder' })]),
  )
  expect(blocks.some((block) => block.type === 'visualEvidence')).toBe(false)
  expect(blocks.filter((block) => block.type === 'capabilityRunReplay')).toHaveLength(11)
  expect(runInspector?.capabilityRuns).toHaveLength(11)
}
