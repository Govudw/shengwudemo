import { beforeEach, describe, expect, it, vi } from 'vitest'
import { projects as seedProjects } from '../data/mockData'
import { createInitialDemoState } from './demoStoreLogic'
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
    expect(customThread?.routeId).toMatch(/^[a-z0-9]{16}$/)
    expectCurrentEgfrReplaySeed(useDemoStore.getState().projects)
  })

  it('repairs duplicate persisted route ids without dropping user Threads', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const duplicateRouteId = 'abcdefghijklmnop'
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        projects: [
          {
            id: 'custom-project',
            name: '用户自建项目',
            threads: [
              {
                ...createPersistedThread('custom-a', '自定义对话 A', 1),
                routeId: duplicateRouteId,
              },
              {
                ...createPersistedThread('custom-b', '自定义对话 B', 2),
                routeId: duplicateRouteId,
              },
            ],
          },
        ],
        selectedProjectId: 'custom-project',
        selectedThreadId: 'custom-b',
        isDraftingNewThread: false,
        draft: '',
        expandedProjectIds: ['custom-project'],
      },
      version: demoStorePersistVersion,
    })

    const customThreads = useDemoStore
      .getState()
      .projects.find((project) => project.id === 'custom-project')
      ?.threads ?? []
    const routeIds = customThreads.map((thread) => thread.routeId)

    expect(customThreads.map((thread) => thread.id)).toEqual([
      'custom-a',
      'custom-b',
    ])
    expect(routeIds.every((routeId) => /^[a-z0-9]{16}$/.test(routeId))).toBe(
      true,
    )
    expect(new Set(routeIds).size).toBe(routeIds.length)
    expect(useDemoStore.getState().selectedThreadId).toBe('custom-b')
  })

  it('keeps seed route ids when persisted user Threads collide with them', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const seedState = createInitialDemoState(seedProjects, Date.now())
    const seedThread = seedState.projects
      .find((project) => project.id === 'pipeline-build')
      ?.threads.find(
        (thread) => thread.id === 'pipeline-build-lims-enzyme-synthesis',
      )

    if (!seedThread) {
      throw new Error('Seed thread missing')
    }

    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        projects: [
          {
            id: 'custom-project',
            name: '用户自建项目',
            threads: [
              {
                ...createPersistedThread('custom-collision', '撞 URL 的旧对话', 1),
                routeId: seedThread.routeId,
              },
            ],
          },
        ],
        selectedProjectId: 'custom-project',
        selectedThreadId: 'custom-collision',
        isDraftingNewThread: false,
        draft: '',
        expandedProjectIds: ['custom-project'],
      },
      version: demoStorePersistVersion,
    })

    const state = useDemoStore.getState()
    const hydratedSeedThread = state.projects
      .find((project) => project.id === 'pipeline-build')
      ?.threads.find(
        (thread) => thread.id === 'pipeline-build-lims-enzyme-synthesis',
      )
    const customThread = state.projects
      .find((project) => project.id === 'custom-project')
      ?.threads.find((thread) => thread.id === 'custom-collision')

    expect(hydratedSeedThread?.routeId).toBe(seedThread.routeId)
    expect(customThread?.routeId).toMatch(/^[a-z0-9]{16}$/)
    expect(customThread?.routeId).not.toBe(seedThread.routeId)
    expect(state.selectedThreadId).toBe('custom-collision')
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

  it('removes obsolete enzyme placeholder Threads during hydrate while preserving user Threads', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: createOldEnzymePersistedState(),
      version: demoStorePersistVersion,
    })

    const state = useDemoStore.getState()
    const enzymeProject = state.projects.find(
      (project) => project.id === 'enzyme-discovery',
    )
    const antibodyProject = state.projects.find(
      (project) => project.id === 'antibody-optimization',
    )
    const projectIds = state.projects.map((project) => project.id)

    expect(enzymeProject?.threads.map((thread) => thread.id)).not.toEqual(
      expect.arrayContaining(['enzyme-family', 'screening-plan', 'enzymekcat']),
    )
    expect(enzymeProject?.threads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'custom-enzyme-thread' }),
      ]),
    )
    expect(antibodyProject?.threads).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'custom-antibody-thread' }),
      ]),
    )
    expect(projectIds).toEqual(seedProjects.map((project) => project.id))
    expect(antibodyProject?.threads).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: 'egfr-affinity' })]),
    )
    expect(state.selectedProjectId).toBe('enzyme-discovery')
    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
  })

  it('adds the Pipeline Build seed project during hydrate without selecting it', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: createOldEgfrPersistedState(),
      version: demoStorePersistVersion,
    })

    const state = useDemoStore.getState()
    const pipelineProject = state.projects.find(
      (project) => project.id === 'pipeline-build',
    )

    expect(state.projects.map((project) => project.id)).toEqual(
      seedProjects.map((project) => project.id),
    )
    expect(pipelineProject).toMatchObject({
      name: 'Pipeline Build',
      threads: [
        expect.objectContaining({
          id: 'pipeline-build-lims-enzyme-synthesis',
          title: 'LIMS 酶合成执行编排',
        }),
        expect.objectContaining({
          id: 'pipeline-build-enz-p0-flow',
          title: 'ENZ-P0 实验流程编排',
        }),
      ],
    })
    expect(pipelineProject?.threads).toHaveLength(2)
    expect(state.selectedProjectId).not.toBe('pipeline-build')
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
    const currentEgfrSeed = seedProjects
      .find((project) => project.id === 'antibody-optimization')
      ?.threads.find((thread) => thread.id === 'egfr-affinity')
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
                title: currentEgfrSeed?.title ?? 'EGFR 抗体亲和力优化',
                lastActivityAt: 123,
                pinned: false,
                pinnedAt: null,
                archived: false,
                createdAt: 1,
                transcript: [...(currentEgfrSeed?.transcript ?? []), ...extraTurns],
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
      (currentEgfrSeed?.transcript?.length ?? 0) + extraTurns.length,
    )
    expect(egfrThread?.transcript.at(-2)).toMatchObject(extraTurns[0])
    expect(egfrThread?.transcript.at(-1)).toMatchObject(extraTurns[1])
    expect(blocks.some((block) => block.type === 'visualEvidence')).toBe(false)
    expect(egfrThread?.runInspector).toEqual(currentEgfrSeed?.runInspector)
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
        assetsExperimentViewMode: 'table',
        assetsOpenFolderId: 'project-antibody-optimization',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Assets')
    expect(useDemoStore.getState().assetsActiveSection).toBe('model')
    expect(useDemoStore.getState().assetsActiveItem).toBe('oracles')
    expect(useDemoStore.getState().assetsFileViewMode).toBe('grid')
    expect(useDemoStore.getState().assetsExperimentViewMode).toBe('table')
    expect(useDemoStore.getState().assetsOpenFolderId).toBeNull()

    useDemoStore.getState().setAssetsSelection('experiment', 'execution')
    useDemoStore.getState().setAssetsFileViewMode('list')
    useDemoStore.getState().setAssetsExperimentViewMode('grid')
    useDemoStore.getState().setAssetsOpenFolder(null)

    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.assetsActiveSection).toBe('experiment')
    expect(persistedPayload.state.assetsActiveItem).toBe('execution')
    expect(persistedPayload.state.assetsFileViewMode).toBe('list')
    expect(persistedPayload.state.assetsExperimentViewMode).toBe('grid')
    expect(persistedPayload.state.assetsOpenFolderId).toBeNull()

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
    expect(useDemoStore.getState().assetsActiveSection).toBe('file')
    expect(useDemoStore.getState().assetsActiveItem).toBe('project-files')
    expect(useDemoStore.getState().assetsExperimentViewMode).toBe('grid')
  })

  it('persists Knowledge Base asset navigation and sanitizes invalid pairs during hydrate', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'knowledge',
        assetsActiveItem: 'project-files',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().assetsActiveSection).toBe('knowledge')
    expect(useDemoStore.getState().assetsActiveItem).toBe('all-knowledge')

    useDemoStore.getState().setAssetsSelection('knowledge', 'rag')

    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.assetsActiveSection).toBe('knowledge')
    expect(persistedPayload.state.assetsActiveItem).toBe('rag')
  })

  it('persists xTrimo recommendation expansion without affecting notification batch state', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'model',
        assetsActiveItem: 'xtrimo',
        xtrimoRecommendationsExpanded: true,
        notificationCenterSelectedIds: ['notification-approval-egfr-order'],
      },
      version: demoStorePersistVersion,
    })
    type XtrimoRecommendationState = ReturnType<typeof useDemoStore.getState> & {
      xtrimoRecommendationsExpanded?: boolean
      setXtrimoRecommendationsExpanded?: (expanded: boolean) => void
    }

    expect(
      (useDemoStore.getState() as XtrimoRecommendationState)
        .xtrimoRecommendationsExpanded,
    ).toBe(true)
    expect(useDemoStore.getState().notificationCenterSelectedIds).toEqual([])

    const setXtrimoRecommendationsExpanded = (
      useDemoStore.getState() as XtrimoRecommendationState
    ).setXtrimoRecommendationsExpanded

    expect(typeof setXtrimoRecommendationsExpanded).toBe('function')

    setXtrimoRecommendationsExpanded?.(false)

    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.xtrimoRecommendationsExpanded).toBe(false)
    expect(persistedPayload.state).not.toHaveProperty(
      'notificationCenterSelectedIds',
    )

    useDemoStore.getState().resetDemoState()
    expect(
      (useDemoStore.getState() as XtrimoRecommendationState)
        .xtrimoRecommendationsExpanded,
    ).toBe(false)
  })

  it('hydrates Projects as a valid top navigation destination', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Projects',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Projects')

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
  })

  it('hydrates Approval Center as a valid account-menu destination', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'ApprovalCenter',
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('ApprovalCenter')

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
  })

  it('persists notification drawer, full-page filters, detail, read, and cleared demo state without batch selection', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        notificationDrawerOpen: true,
        notificationFilter: 'agent',
        notificationReadById: {
          'notification-agent-egfr-confirmation': true,
        },
        notificationResolvedById: {
          'notification-agent-egfr-confirmation': true,
        },
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().notificationDrawerOpen).toBe(true)
    expect(useDemoStore.getState().notificationFilter).toBe('agent')
    expect(useDemoStore.getState().notificationReadById).toEqual({
      'notification-agent-egfr-confirmation': true,
    })
    expect(useDemoStore.getState().notificationResolvedById).toEqual({
      'notification-agent-egfr-confirmation': true,
    })
    expect(useDemoStore.getState().notificationClearedById).toEqual({
      'notification-agent-egfr-confirmation': true,
    })

    useDemoStore.getState().closeNotificationDrawer()
    useDemoStore.getState().setNotificationFilter('asset')
    useDemoStore.getState().setNotificationCenterPreset('approval')
    useDemoStore.getState().setNotificationCenterSearchQuery('EGFR')
    useDemoStore.getState().setNotificationCenterStatusFilter('actionRequired')
    useDemoStore
      .getState()
      .setNotificationCenterBusinessStatusFilter('approvalPending')
    useDemoStore.getState().setNotificationCenterSourceFilter('project')
    const notificationExtraState = useDemoStore.getState() as ReturnType<
      typeof useDemoStore.getState
    > &
      NotificationExtraFilterStore
    expect(typeof notificationExtraState.setNotificationCenterTypeFilter).toBe(
      'function',
    )
    notificationExtraState.setNotificationCenterTypeFilter('agent')
    useDemoStore.getState().setNotificationCenterTimeFilter('today')
    const notificationUiState = useDemoStore.getState() as ReturnType<
      typeof useDemoStore.getState
    > &
      NotificationExtraFilterStore
    expect(notificationUiState.notificationCenterAdvancedFiltersOpen).toBe(false)
    expect(typeof notificationUiState.setNotificationCenterAdvancedFiltersOpen).toBe(
      'function',
    )
    notificationUiState.setNotificationCenterAdvancedFiltersOpen(true)
    expect(typeof notificationUiState.setNotificationCenterReadStatusFilter).toBe(
      'function',
    )
    notificationUiState.setNotificationCenterReadStatusFilter('unread')
    useDemoStore
      .getState()
      .selectNotificationCenterItem('notification-approval-egfr-order')
    useDemoStore
      .getState()
      .toggleNotificationCenterSelectedId('notification-approval-egfr-order')
    useDemoStore
      .getState()
      .markNotificationRead('notification-approval-egfr-order')
    useDemoStore
      .getState()
      .markNotificationResolved('notification-approval-egfr-order')

    const { demoStorePersistKey } = await import('./useDemoStore')
    const persistedPayload = JSON.parse(localStorage.getItem(demoStorePersistKey) ?? '{}')

    expect(persistedPayload.state.notificationDrawerOpen).toBe(false)
    expect(persistedPayload.state.notificationFilter).toBe('asset')
    expect(persistedPayload.state.notificationReadById).toMatchObject({
      'notification-agent-egfr-confirmation': true,
      'notification-approval-egfr-order': true,
    })
    expect(persistedPayload.state.notificationResolvedById).toMatchObject({
      'notification-agent-egfr-confirmation': true,
      'notification-approval-egfr-order': true,
    })
    expect(persistedPayload.state.notificationClearedById).toMatchObject({
      'notification-agent-egfr-confirmation': true,
      'notification-approval-egfr-order': true,
    })
    expect(persistedPayload.state.notificationCenterPreset).toBe('approval')
    expect(persistedPayload.state.notificationCenterSearchQuery).toBe('EGFR')
    expect(persistedPayload.state.notificationCenterStatusFilter).toBe(
      'actionRequired',
    )
    expect(persistedPayload.state.notificationCenterReadStatusFilter).toBe(
      'unread',
    )
    expect(persistedPayload.state.notificationCenterBusinessStatusFilter).toBe(
      'approvalPending',
    )
    expect(persistedPayload.state.notificationCenterSourceFilter).toBe('project')
    expect(persistedPayload.state.notificationCenterTypeFilter).toBe('agent')
    expect(persistedPayload.state.notificationCenterTimeFilter).toBe('today')
    expect(persistedPayload.state.notificationCenterAdvancedFiltersOpen).toBe(true)
    expect(persistedPayload.state.notificationCenterSelectedId).toBe(
      'notification-approval-egfr-order',
    )
    expect(persistedPayload.state).not.toHaveProperty(
      'notificationCenterSelectedIds',
    )
    expect(persistedPayload.state.notificationCenterDetailOpen).toBe(true)

    useDemoStore.getState().resetDemoState()
    expect(useDemoStore.getState().notificationDrawerOpen).toBe(false)
    expect(useDemoStore.getState().notificationFilter).toBe('all')
    expect(useDemoStore.getState().notificationReadById).toEqual({})
    expect(useDemoStore.getState().notificationResolvedById).toEqual({})
    expect(useDemoStore.getState().notificationClearedById).toEqual({})
    expect(useDemoStore.getState().notificationCenterPreset).toBe('all')
    expect(useDemoStore.getState().notificationCenterSearchQuery).toBe('')
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> &
          NotificationExtraFilterStore
      ).notificationCenterReadStatusFilter,
    ).toBe('all')
    expect(useDemoStore.getState().notificationCenterSelectedId).toBeNull()
    expect(useDemoStore.getState().notificationCenterSelectedIds).toEqual([])
    expect(useDemoStore.getState().notificationCenterDetailOpen).toBe(false)
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> &
          NotificationExtraFilterStore
      ).notificationCenterAdvancedFiltersOpen,
    ).toBe(false)
  })

  it('does not hydrate old persisted notification center batch selection', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        notificationCenterPreset: 'approval',
        notificationCenterSearchQuery: 'EGFR',
        notificationCenterStatusFilter: 'actionRequired',
        notificationCenterBusinessStatusFilter: 'approvalPending',
        notificationCenterSourceFilter: 'project',
        notificationCenterTypeFilter: 'agent',
        notificationCenterTimeFilter: 'today',
        notificationCenterAdvancedFiltersOpen: true,
        notificationCenterSelectedId: 'notification-approval-egfr-order',
        notificationCenterSelectedIds: ['notification-approval-egfr-order'],
        notificationCenterDetailOpen: true,
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().notificationCenterPreset).toBe('approval')
    expect(useDemoStore.getState().notificationCenterSearchQuery).toBe('EGFR')
    expect(useDemoStore.getState().notificationCenterStatusFilter).toBe(
      'actionRequired',
    )
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> &
          NotificationExtraFilterStore
      ).notificationCenterReadStatusFilter,
    ).toBe('all')
    expect(useDemoStore.getState().notificationCenterBusinessStatusFilter).toBe(
      'approvalPending',
    )
    expect(useDemoStore.getState().notificationCenterSourceFilter).toBe('project')
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> &
          NotificationExtraFilterStore
      ).notificationCenterTypeFilter,
    ).toBe('agent')
    expect(useDemoStore.getState().notificationCenterTimeFilter).toBe('today')
    expect(
      (
        useDemoStore.getState() as ReturnType<typeof useDemoStore.getState> &
          NotificationExtraFilterStore
      ).notificationCenterAdvancedFiltersOpen,
    ).toBe(true)
    expect(useDemoStore.getState().notificationCenterSelectedId).toBe(
      'notification-approval-egfr-order',
    )
    expect(useDemoStore.getState().notificationCenterDetailOpen).toBe(true)
    expect(useDemoStore.getState().notificationCenterSelectedIds).toEqual([])
  })

  it('migrates legacy persisted read status filter into the split read filter', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        notificationCenterStatusFilter: 'unread',
        notificationCenterSelectedIds: ['notification-approval-egfr-order'],
      },
      version: demoStorePersistVersion,
    })
    const notificationState = useDemoStore.getState() as ReturnType<
      typeof useDemoStore.getState
    > &
      NotificationExtraFilterStore

    expect(notificationState.notificationCenterStatusFilter).toBe('all')
    expect(notificationState.notificationCenterReadStatusFilter).toBe('unread')
    expect(notificationState.notificationCenterSelectedIds).toEqual([])
  })

  it('clears stale persisted notification center detail selection during hydrate', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const { useDemoStore } = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'NotificationCenter',
        notificationCenterSelectedId: 'notification-no-longer-seeded',
        notificationCenterDetailOpen: true,
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('NotificationCenter')
    expect(useDemoStore.getState().notificationCenterSelectedId).toBeNull()
    expect(useDemoStore.getState().notificationCenterDetailOpen).toBe(false)
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
        assetsExperimentViewMode: 'board',
        assetsOpenFolderId: 123,
      },
      version: demoStorePersistVersion,
    })

    expect(useDemoStore.getState().activeTopNav).toBe('Workspace')
    expect(useDemoStore.getState().assetsActiveSection).toBe('file')
    expect(useDemoStore.getState().assetsActiveItem).toBe('project-files')
    expect(useDemoStore.getState().assetsFileViewMode).toBe('list')
    expect(useDemoStore.getState().assetsExperimentViewMode).toBe('grid')
    expect(useDemoStore.getState().assetsOpenFolderId).toBeNull()
  })

  it('migrates legacy Experiment asset menu ids during hydrate', async () => {
    const { demoStorePersistVersion } = await import('./useDemoStore')
    const requestState = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'experiment',
        assetsActiveItem: 'request',
      },
      version: demoStorePersistVersion,
    })

    expect(requestState.useDemoStore.getState().assetsActiveItem).toBe(
      'experiment-list',
    )

    vi.resetModules()
    localStorage.clear()
    const configurationState = await loadStoreWithPersistedState({
      state: {
        ...createOldEgfrPersistedState(),
        activeTopNav: 'Assets',
        assetsActiveSection: 'experiment',
        assetsActiveItem: 'configuration',
      },
      version: demoStorePersistVersion,
    })

    expect(configurationState.useDemoStore.getState().assetsActiveItem).toBe(
      'recipe',
    )
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

function createOldEnzymePersistedState() {
  return {
    projects: [
      {
        id: 'enzyme-discovery',
        name: 'Industrial Enzyme Discovery',
        threads: [
          createPersistedThread('enzyme-family', '新型噬酸酶家族调研', 0),
          createPersistedThread('screening-plan', '底盘筛选实验方案', 1),
          createPersistedThread('enzymekcat', 'EnzymeKcat 模型探索', 2),
          createPersistedThread(
            'custom-enzyme-thread',
            '用户新增的酶设计对话',
            3,
          ),
        ],
      },
      {
        id: 'antibody-optimization',
        name: 'Antibody Optimization',
        threads: [
          createPersistedThread(
            'custom-antibody-thread',
            '用户新增的抗体项目对话',
            4,
          ),
        ],
      },
    ],
    selectedProjectId: 'enzyme-discovery',
    selectedThreadId: 'screening-plan',
    isDraftingNewThread: false,
    draft: '',
    expandedProjectIds: ['enzyme-discovery'],
  }
}

function createPersistedThread(id: string, title: string, timestamp: number) {
  return {
    id,
    title,
    lastActivityAt: timestamp,
    pinned: false,
    pinnedAt: null,
    archived: false,
    createdAt: timestamp,
    transcript: [],
  }
}

type NotificationExtraFilterStore = {
  notificationCenterTypeFilter?: 'all' | 'approval' | 'agent' | 'asset' | 'system'
  setNotificationCenterTypeFilter?: (
    filter: 'all' | 'approval' | 'agent' | 'asset' | 'system',
  ) => void
  notificationCenterReadStatusFilter?: 'all' | 'read' | 'unread'
  setNotificationCenterReadStatusFilter?: (
    filter: 'all' | 'read' | 'unread',
  ) => void
  notificationCenterAdvancedFiltersOpen?: boolean
  setNotificationCenterAdvancedFiltersOpen?: (open: boolean) => void
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
