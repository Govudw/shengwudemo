import { describe, expect, it } from 'vitest'
import { projects as seedProjects } from '../data/mockData'
import {
  archiveThreadSnapshot,
  createInitialDemoState,
  deleteThreadSnapshot,
  findThreadById,
  formatRelativeActivity,
  getPinnedThreadEntries,
  getRecentThreadEntries,
  getSearchView,
  renameThreadSnapshot,
  selectTopNavSnapshot,
  selectThreadSnapshot,
  setAssetsFileViewModeSnapshot,
  setAssetsSelectionSnapshot,
  setSelectedProjectSnapshot,
  submitDraftSnapshot,
  toggleSidebarCollapsedSnapshot,
  toggleRunInspectorSnapshot,
  togglePinnedSnapshot,
} from './demoStoreLogic'

const now = Date.parse('2026-05-27T10:00:00+08:00')

describe('demo store logic', () => {
  it('creates demo state from seed projects without mutating seed data', () => {
    const state = createInitialDemoState(seedProjects, now)
    const firstThread = state.projects[0].threads[0]

    expect(state.selectedProjectId).toBe('antibody-optimization')
    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(state.sidebarCollapsed).toBe(false)
    expect(state.activeTopNav).toBe('Workspace')
    expect(state.assetsActiveSection).toBe('file')
    expect(state.assetsActiveItem).toBe('project-files')
    expect(state.assetsFileViewMode).toBe('list')
    expect(state.assetsOpenFolderId).toBeNull()
    expect(state.expandedProjectIds).toEqual(seedProjects.map((project) => project.id))
    expect(firstThread).toMatchObject({
      id: 'egfr-affinity',
      title: 'EGFR 抗体亲和力优化',
      pinned: false,
      pinnedAt: null,
      archived: false,
    })
    expect(firstThread.lastActivityAt).toBe(now - 2 * 60 * 1000)
    expect(formatRelativeActivity(firstThread.lastActivityAt, now)).toBe('2 分钟')
    expect('pinned' in seedProjects[0].threads[0]).toBe(false)
    expect(firstThread.transcript.length).toBeGreaterThan(0)
    expect(firstThread.transcript).not.toBe(seedProjects[0].threads[0].transcript)
  })

  it('switches between Workspace and Assets without changing conversation state', () => {
    const selected = selectThreadSnapshot(
      createInitialDemoState(seedProjects, now),
      'antibody-optimization',
      'egfr-affinity',
    )

    const assets = selectTopNavSnapshot(selected, 'Assets')
    const workspace = selectTopNavSnapshot(assets, 'Workspace')

    expect(assets.activeTopNav).toBe('Assets')
    expect(assets.selectedThreadId).toBe('egfr-affinity')
    expect(assets.isDraftingNewThread).toBe(false)
    expect(workspace.activeTopNav).toBe('Workspace')
    expect(workspace.selectedThreadId).toBe('egfr-affinity')
  })

  it('persists the current Assets menu item and file view mode as plain state', () => {
    const state = createInitialDemoState(seedProjects, now)
    const selectedExperiment = setAssetsSelectionSnapshot(
      state,
      'experiment',
      'execution',
    )
    const gridMode = setAssetsFileViewModeSnapshot(selectedExperiment, 'grid')

    expect(selectedExperiment.assetsActiveSection).toBe('experiment')
    expect(selectedExperiment.assetsActiveItem).toBe('execution')
    expect(gridMode.assetsFileViewMode).toBe('grid')
  })

  it('toggles the persisted sidebar collapsed state without changing Thread selection', () => {
    const state = selectThreadSnapshot(
      createInitialDemoState(seedProjects, now),
      'antibody-optimization',
      'egfr-affinity',
    )

    const collapsed = toggleSidebarCollapsedSnapshot(state, true)
    const expanded = toggleSidebarCollapsedSnapshot(collapsed, false)

    expect(collapsed.sidebarCollapsed).toBe(true)
    expect(collapsed.selectedThreadId).toBe('egfr-affinity')
    expect(collapsed.isDraftingNewThread).toBe(false)
    expect(expanded.sidebarCollapsed).toBe(false)
    expect(expanded.selectedThreadId).toBe('egfr-affinity')
  })

  it('selects the seeded EGFR Thread Transcript without keeping New Thread Draft selected', () => {
    const state = createInitialDemoState(seedProjects, now)

    const selected = selectThreadSnapshot(
      state,
      'antibody-optimization',
      'egfr-affinity',
    )
    const selectedThread = findThreadById(selected.projects, 'egfr-affinity')?.thread

    expect(selected.selectedProjectId).toBe('antibody-optimization')
    expect(selected.selectedThreadId).toBe('egfr-affinity')
    expect(selected.isDraftingNewThread).toBe(false)
    expect(selectedThread?.transcript.length).toBeGreaterThan(0)
  })

  it('seeds the EGFR agentic workflow replay with canonical block types', () => {
    const state = createInitialDemoState(seedProjects, now)
    const egfrThread = findThreadById(state.projects, 'egfr-affinity')?.thread
    const blocks = egfrThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )

    expect(egfrThread?.transcript).toHaveLength(19)
    expect(blocks.filter((block) => block.type === 'capabilityRunReplay')).toHaveLength(11)
    expect(blocks.filter((block) => block.type === 'humanConfirmation')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(1)
    expect(scientificFigures).toHaveLength(8)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.some((block) => block.type === 'visualEvidence')).toBe(false)
    expect(blocks.some((block) => block.type === 'approvalGatePreview')).toBe(false)
  })

  it('seeds structured Run Inspector data for the EGFR replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const egfrThread = findThreadById(state.projects, 'egfr-affinity')?.thread
    const runInspector = egfrThread?.runInspector

    expect(state.runInspectorByThreadId).toEqual({})
    expect(runInspector).toBeDefined()
    expect(runInspector?.summary).toMatchObject({
      stage: '已完成干湿闭环',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 6,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.progress[0]).toMatchObject({
      title: '读取上下文',
      status: 'done',
    })
    expect(runInspector?.outputs).toHaveLength(runInspector?.summary.outputCount ?? 0)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'report' }),
        expect.objectContaining({ kind: 'experimentOrder' }),
        expect.objectContaining({ kind: 'dataset' }),
        expect.objectContaining({ kind: 'figure' }),
        expect.objectContaining({ name: 'BM-LAB-EGFR-20260528-001_draft.md' }),
      ]),
    )
    expect(runInspector?.approvals).toHaveLength(2)
    expect(runInspector?.approvals[0]).toMatchObject({
      kind: 'humanConfirmation',
      status: 'confirmed',
    })
    expect(runInspector?.capabilityRuns).toHaveLength(11)
    expect(runInspector?.capabilityRuns[0].artifacts?.[0]).toEqual({
      name: 'EGFR_baseline_extract.json',
      kind: 'json',
    })
  })

  it('toggles Run Inspector open state and clears it when a Thread is deleted', () => {
    const state = createInitialDemoState(seedProjects, now)

    const opened = toggleRunInspectorSnapshot(state, 'egfr-affinity', true)
    expect(opened.runInspectorByThreadId['egfr-affinity']).toEqual({ open: true })

    const closed = toggleRunInspectorSnapshot(opened, 'egfr-affinity', false)
    expect(closed.runInspectorByThreadId['egfr-affinity']).toEqual({ open: false })

    const deleted = deleteThreadSnapshot(opened, 'egfr-affinity')
    expect(deleted.runInspectorByThreadId['egfr-affinity']).toBeUndefined()
  })

  it('creates and selects a new Thread from a New Thread Draft', () => {
    const state = {
      ...createInitialDemoState(seedProjects, now),
      draft: '  评估 EGFR 新候选抗体\n请补充风险  ',
    }

    const next = submitDraftSnapshot(state, now + 1000, () => 'thread-new')
    const firstThread = next.projects[0].threads[0]

    expect(firstThread).toMatchObject({
      id: 'thread-new',
      title: '评估 EGFR 新候选抗体',
      lastActivityAt: now + 1000,
      pinned: false,
      pinnedAt: null,
      archived: false,
      createdAt: now + 1000,
    })
    expect(firstThread.transcript).toEqual([
      {
        id: `turn-${now + 1000}-user`,
        role: 'user',
        markdown: '评估 EGFR 新候选抗体 请补充风险',
      },
      {
        id: `turn-${now + 1000}-main-agent`,
        role: 'mainAgent',
        markdown:
          '已记录到当前对话。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。',
      },
    ])
    expect(next.selectedThreadId).toBe('thread-new')
    expect(next.isDraftingNewThread).toBe(false)
    expect(next.draft).toBe('')
    expect(next.statusMessage).toBe('')
  })

  it('submits into the selected Thread without creating another Thread', () => {
    const draftText = '继续分析筛选窗口'
    const selected = {
      ...selectThreadSnapshot(
        createInitialDemoState(seedProjects, now),
        'enzyme-discovery',
        'screening-plan',
      ),
      draft: draftText,
    }
    const beforeCount = selected.projects[1].threads.length

    const next = submitDraftSnapshot(selected, now + 5000, () => 'unused-id')

    expect(next.projects[1].threads).toHaveLength(beforeCount)
    expect(next.projects[1].threads[0].id).toBe('screening-plan')
    expect(next.projects[1].threads[0].lastActivityAt).toBe(now + 5000)
    expect(next.selectedThreadId).toBe('screening-plan')
    expect(next.isDraftingNewThread).toBe(false)
    expect(next.draft).toBe('')
    expect(next.statusMessage).toBe('')
    expect(next.projects[1].threads[0].transcript.at(-2)).toMatchObject({
      role: 'user',
      markdown: draftText,
    })
    expect(next.projects[1].threads[0].transcript.at(-1)).toMatchObject({
      role: 'mainAgent',
      markdown:
        '已记录到当前对话。第一版 Demo 先把这条输入加入对话历史，不触发真实 BioMap OS 操作。',
    })
  })

  it('switches Project selector into New Thread Draft only when selecting a different Project', () => {
    const selected = {
      ...selectThreadSnapshot(
        createInitialDemoState(seedProjects, now),
        'antibody-optimization',
        'egfr-affinity',
      ),
      draft: '保留这段输入',
    }

    const sameProject = setSelectedProjectSnapshot(selected, 'antibody-optimization')
    const otherProject = setSelectedProjectSnapshot(selected, 'data-assetization')

    expect(sameProject.selectedThreadId).toBe('egfr-affinity')
    expect(sameProject.isDraftingNewThread).toBe(false)
    expect(otherProject.selectedProjectId).toBe('data-assetization')
    expect(otherProject.selectedThreadId).toBeNull()
    expect(otherProject.isDraftingNewThread).toBe(true)
    expect(otherProject.draft).toBe('保留这段输入')
    expect(otherProject.expandedProjectIds).toContain('data-assetization')
  })

  it('pins, renames, archives, and deletes one canonical Thread', () => {
    const pinned = togglePinnedSnapshot(
      createInitialDemoState(seedProjects, now),
      'egfr-affinity',
      now + 10_000,
    )
    expect(getPinnedThreadEntries(pinned.projects).map((entry) => entry.thread.id)).toEqual([
      'egfr-affinity',
    ])

    const renamed = renameThreadSnapshot(pinned, 'egfr-affinity', '  新 EGFR 名称  ')
    expect(findThreadById(renamed.projects, 'egfr-affinity')?.thread.title).toBe(
      '新 EGFR 名称',
    )
    expect(getPinnedThreadEntries(renamed.projects)[0].thread.title).toBe('新 EGFR 名称')

    const archived = archiveThreadSnapshot(renamed, 'egfr-affinity')
    expect(findThreadById(archived.projects, 'egfr-affinity')?.thread.archived).toBe(true)
    expect(getPinnedThreadEntries(archived.projects)).toHaveLength(0)

    const deleted = deleteThreadSnapshot(archived, 'egfr-affinity')
    expect(findThreadById(deleted.projects, 'egfr-affinity')).toBeUndefined()
    expect(deleted.statusMessage).toBe('')
  })

  it('builds recent conversation entries from unarchived Threads by last activity', () => {
    const state = createInitialDemoState(seedProjects, now)
    const updatedProjects = state.projects.map((project) => ({
      ...project,
      threads: project.threads.map((thread, index) => ({
        ...thread,
        lastActivityAt: now + index,
        archived: thread.id === 'egfr-affinity',
        pinned: thread.id === 'screening-plan',
        pinnedAt: thread.id === 'screening-plan' ? now + 100_000 : null,
      })),
    }))

    const recentEntries = getRecentThreadEntries(updatedProjects, 3)

    expect(recentEntries).toHaveLength(3)
    expect(recentEntries.some((entry) => entry.thread.id === 'egfr-affinity')).toBe(false)
    expect(recentEntries.map((entry) => entry.thread.lastActivityAt)).toEqual(
      recentEntries
        .map((entry) => entry.thread.lastActivityAt)
        .toSorted((left, right) => right - left),
    )
    expect(recentEntries.map((entry) => entry.projectName)).toEqual(
      expect.arrayContaining(['Antibody Optimization', 'Enzyme Discovery']),
    )
  })

  it('limits recent conversation entries to eight by default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const project = {
      ...state.projects[0],
      threads: Array.from({ length: 10 }, (_, index) => ({
        ...state.projects[0].threads[0],
        id: `thread-${index}`,
        title: `对话 ${index}`,
        lastActivityAt: now + index,
      })),
    }

    const recentEntries = getRecentThreadEntries([project])

    expect(recentEntries).toHaveLength(8)
    expect(recentEntries[0].thread.id).toBe('thread-9')
    expect(recentEntries.at(-1)?.thread.id).toBe('thread-2')
  })

  it('preserves untouched Thread transcripts through rename, pin, archive, and delete paths', () => {
    const state = createInitialDemoState(seedProjects, now)
    const originalTranscript = findThreadById(state.projects, 'egfr-affinity')?.thread.transcript

    const otherPinned = togglePinnedSnapshot(state, 'cd3-bispecific', now + 10_000)
    const otherRenamed = renameThreadSnapshot(otherPinned, 'cd3-bispecific', 'CD3 新名称')
    const otherArchived = archiveThreadSnapshot(otherRenamed, 'cd3-bispecific')
    const otherDeleted = deleteThreadSnapshot(otherArchived, 'cd3-bispecific')
    const egfrThread = findThreadById(otherDeleted.projects, 'egfr-affinity')?.thread

    expect(egfrThread?.transcript).toEqual(originalTranscript)
    expect(egfrThread?.transcript.length).toBeGreaterThan(0)
  })

  it('searches pinned and Project Thread lists with the same query', () => {
    const state = togglePinnedSnapshot(
      createInitialDemoState(seedProjects, now),
      'egfr-affinity',
      now + 10_000,
    )

    const matched = getSearchView(state.projects, 'egfr')
    const empty = getSearchView(state.projects, 'not-a-thread')

    expect(matched.pinnedThreadEntries.map((entry) => entry.thread.id)).toEqual([
      'egfr-affinity',
    ])
    expect(matched.projects).toHaveLength(1)
    expect(matched.projects[0].threads.map((thread) => thread.id)).toEqual(['egfr-affinity'])
    expect(empty.pinnedThreadEntries).toHaveLength(0)
    expect(empty.projects).toHaveLength(0)
  })
})
