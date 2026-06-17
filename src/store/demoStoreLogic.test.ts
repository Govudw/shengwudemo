import { describe, expect, it } from 'vitest'
import { projects as seedProjects } from '../data/mockData'
import {
  archiveThreadSnapshot,
  createInitialDemoState,
  deleteThreadSnapshot,
  findThreadById,
  findThreadByRouteId,
  formatRelativeActivity,
  getPinnedThreadEntries,
  getRecentThreadEntries,
  getSearchView,
  renameThreadSnapshot,
  sanitizeDemoState,
  selectTopNavSnapshot,
  selectThreadSnapshot,
  setAssetsExperimentViewModeSnapshot,
  setAssetsFileViewModeSnapshot,
  setAssetsSelectionSnapshot,
  setSelectedProjectSnapshot,
  submitDraftSnapshot,
  toggleSidebarCollapsedSnapshot,
  toggleRunInspectorSnapshot,
  togglePinnedSnapshot,
} from './demoStoreLogic'

const now = Date.parse('2026-06-02T18:30:00+08:00')
const industrialEnzymeThreadIds = [
  'enzyme-full-loop',
  'enzyme-design-breakdown',
  'enzyme-experiment-execution',
  'enzyme-analysis-iteration',
]
const forbiddenEnzymeCapabilityPrefixes = [
  'DataCenter.',
  'KnowledgeAssistant.',
  'PredictBestEnzyme.',
  'ProveMechanism.',
  'AutoSelectLead.',
]
const forbiddenEnzymeOutputClaims = [
  'mechanismProven',
  'predictedWinner',
  'recommendedLead',
  'finalLead',
  'leadAutoSelected',
  'bestEnzymeClaimed',
  'autoSelectLead',
]
const expectedExperimentExecutionBlockTypes = [
  'designHandoffBrief',
  'experimentOrderSummary',
  'sampleScopePanel',
  'assayPanelTable',
  'plateMapMini',
  'sampleInventoryLink',
  'materialSopReadiness',
  'approvalGateCard',
  'executionTaskStatus',
  'experimentNotebookSummary',
  'runLogTable',
  'anomalyReviewTable',
  'resultPackageChecklist',
]
const expectedExperimentExecutionProgressTitles = [
  '读取设计交接',
  '确认订单边界',
  '固化样本范围',
  '固化读数面板',
  '生成板图',
  '检查样本库存与孔板关联',
  '检查物料/SOP/设备/线路',
  '订单提交审批',
  '创建 Experiment Task',
  '监控实验记录本',
  '同步 assay 执行',
  '回收结果包',
  '记录异常事件',
  '校验结果包 schema',
  '归档操作索引',
]
const expectedExperimentExecutionCommands = [
  'DesignHandoffReader.extractExecutionScope',
  'ExperimentOrderBuilder.composeBoundary',
  'SampleInventoryResolver.checkAvailability',
  'PlateMapGenerator.assignControls',
  'MaterialSopReadinessChecker.validate',
  'LabOrderGateway.submitApprovedOrder',
  'ExperimentTaskTracker.createTask',
  'ExperimentNotebookMonitor.schedulePolling',
  'ExperimentNotebookMonitor.checkSubmission',
  'ExperimentNotebookCallback.ingestRecord',
  'ExperimentTaskTracker.syncAssayExecution',
  'AnomalyLogger.captureExecutionEvents',
  'ResultPackageReceiver.validateSchema',
  'OperationalRecordIndexer.writeTraceability',
]

function parseDemoDateTime(value: string) {
  return Date.parse(`${value.replace(' ', 'T')}:00+08:00`)
}

function collectStringValues(value: unknown): string[] {
  if (typeof value === 'string') {
    return [value]
  }

  if (Array.isArray(value)) {
    return value.flatMap(collectStringValues)
  }

  if (value && typeof value === 'object') {
    return Object.values(value).flatMap(collectStringValues)
  }

  return []
}

describe('demo store logic', () => {
  it('hydrates every seed Thread with a unique URL route id', () => {
    const state = createInitialDemoState(seedProjects, now)
    const routeIds = state.projects.flatMap((project) =>
      project.threads.map((thread) => thread.routeId),
    )

    expect(routeIds.every((routeId) => /^[a-z0-9]{16}$/.test(routeId))).toBe(
      true,
    )
    expect(new Set(routeIds).size).toBe(routeIds.length)
  })

  it('finds a non-archived Thread by URL route id', () => {
    const state = createInitialDemoState(seedProjects, now)
    const egfrThread = findThreadById(state.projects, 'egfr-affinity')?.thread

    expect(egfrThread?.routeId).toMatch(/^[a-z0-9]{16}$/)
    expect(
      findThreadByRouteId(state.projects, egfrThread?.routeId ?? '')?.thread.id,
    ).toBe('egfr-affinity')

    const archived = archiveThreadSnapshot(state, 'egfr-affinity')
    expect(
      findThreadByRouteId(archived.projects, egfrThread?.routeId ?? ''),
    ).toBeUndefined()
  })

  it('places Pipeline Build and Enzyme Synthesis Ops at the top of the workspace sidebar', () => {
    const state = createInitialDemoState(seedProjects, now)

    expect(state.projects.slice(0, 2).map((project) => project.id)).toEqual([
      'pipeline-build',
      'enzyme-synthesis-ops',
    ])
  })

  it('creates demo state from seed projects without mutating seed data', () => {
    const state = createInitialDemoState(seedProjects, now)
    const egfrThread = findThreadById(state.projects, 'egfr-affinity')?.thread
    const egfrSeedThread = seedProjects
      .find((project) => project.id === 'antibody-optimization')
      ?.threads.find((thread) => thread.id === 'egfr-affinity')

    expect(state.selectedProjectId).toBe('pipeline-build')
    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(state.sidebarCollapsed).toBe(false)
    expect(state.activeTopNav).toBe('Workspace')
    expect(state.assetsActiveSection).toBe('file')
    expect(state.assetsActiveItem).toBe('project-files')
    expect(state.assetsFileViewMode).toBe('list')
    expect(state.assetsExperimentViewMode).toBe('grid')
    expect(state.assetsOpenFolderId).toBeNull()
    expect(state.expandedProjectIds).toEqual(seedProjects.map((project) => project.id))
    expect(egfrThread).toMatchObject({
      id: 'egfr-affinity',
      title: 'EGFR 抗体亲和力优化',
      pinned: false,
      pinnedAt: null,
      archived: false,
    })
    expect(egfrThread?.lastActivityAt).toBe(now - 2 * 60 * 1000)
    expect(formatRelativeActivity(egfrThread?.lastActivityAt ?? 0, now)).toBe(
      '2 分钟',
    )
    expect('pinned' in (egfrSeedThread ?? {})).toBe(false)
    expect(egfrThread?.transcript.length).toBeGreaterThan(0)
    expect(egfrThread?.transcript).not.toBe(egfrSeedThread?.transcript)
  })

  it('switches between Workspace, Projects, Assets and Approval Center without changing conversation state', () => {
    const selected = selectThreadSnapshot(
      createInitialDemoState(seedProjects, now),
      'antibody-optimization',
      'egfr-affinity',
    )

    const projects = selectTopNavSnapshot(selected, 'Projects')
    const assets = selectTopNavSnapshot(projects, 'Assets')
    const approvalCenter = selectTopNavSnapshot(assets, 'ApprovalCenter')
    const workspace = selectTopNavSnapshot(approvalCenter, 'Workspace')

    expect(projects.activeTopNav).toBe('Projects')
    expect(projects.selectedThreadId).toBe('egfr-affinity')
    expect(projects.isDraftingNewThread).toBe(false)
    expect(assets.activeTopNav).toBe('Assets')
    expect(assets.selectedThreadId).toBe('egfr-affinity')
    expect(assets.isDraftingNewThread).toBe(false)
    expect(approvalCenter.activeTopNav).toBe('ApprovalCenter')
    expect(approvalCenter.selectedThreadId).toBe('egfr-affinity')
    expect(approvalCenter.isDraftingNewThread).toBe(false)
    expect(workspace.activeTopNav).toBe('Workspace')
    expect(workspace.selectedThreadId).toBe('egfr-affinity')
  })

  it('clears Notification Center batch selection when leaving the page', () => {
    const state = {
      ...createInitialDemoState(seedProjects, now),
      activeTopNav: 'NotificationCenter' as const,
      notificationCenterSelectedId: 'notification-approval-egfr-order',
      notificationCenterSelectedIds: [
        'notification-approval-egfr-order',
        'notification-agent-egfr-confirmation',
      ],
      notificationCenterDetailOpen: true,
    }

    const projects = selectTopNavSnapshot(state, 'Projects')
    const notificationCenter = selectTopNavSnapshot(
      projects,
      'NotificationCenter',
    )

    expect(projects.activeTopNav).toBe('Projects')
    expect(projects.notificationCenterSelectedIds).toEqual([])
    expect(projects.notificationCenterSelectedId).toBe(
      'notification-approval-egfr-order',
    )
    expect(projects.notificationCenterDetailOpen).toBe(true)
    expect(notificationCenter.notificationCenterSelectedIds).toEqual([])
  })

  it('persists the current Assets menu item and view modes as plain state', () => {
    const state = createInitialDemoState(seedProjects, now)
    const selectedExperiment = setAssetsSelectionSnapshot(
      state,
      'experiment',
      'execution',
    )
    const gridMode = setAssetsFileViewModeSnapshot(selectedExperiment, 'grid')
    const experimentTableMode = setAssetsExperimentViewModeSnapshot(gridMode, 'table')

    expect(selectedExperiment.assetsActiveSection).toBe('experiment')
    expect(selectedExperiment.assetsActiveItem).toBe('execution')
    expect(gridMode.assetsFileViewMode).toBe('grid')
    expect(experimentTableMode.assetsExperimentViewMode).toBe('table')
  })

  it('selects Knowledge Base asset menu items as plain state', () => {
    const state = createInitialDemoState(seedProjects, now)
    const allKnowledge = setAssetsSelectionSnapshot(
      state,
      'knowledge',
      'all-knowledge',
    )
    const rag = setAssetsSelectionSnapshot(allKnowledge, 'knowledge', 'rag')

    expect(allKnowledge.assetsActiveSection).toBe('knowledge')
    expect(allKnowledge.assetsActiveItem).toBe('all-knowledge')
    expect(rag.assetsActiveSection).toBe('knowledge')
    expect(rag.assetsActiveItem).toBe('rag')
  })

  it('sanitizes invalid persisted Knowledge Base asset menu pairs', () => {
    const state = createInitialDemoState(seedProjects, now)
    const sanitized = sanitizeDemoState({
      ...state,
      assetsActiveSection: 'knowledge',
      assetsActiveItem: 'project-files',
    })

    expect(sanitized.assetsActiveSection).toBe('knowledge')
    expect(sanitized.assetsActiveItem).toBe('all-knowledge')
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

  it('seeds the IL-17A analysis-design Thread without changing the New Thread Draft default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const il17aThread = findThreadById(state.projects, 'il17a-affinity-design')?.thread
    const blocks = il17aThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )

    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(il17aThread?.title).toBe('IL-17A 亲和力成熟实验设计')
    expect(il17aThread?.transcript).toHaveLength(19)
    expect(il17aThread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(4)
    expect(scientificFigures).toHaveLength(5)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'approvalGatePreview')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(0)
  })

  it('seeds structured Run Inspector data for the IL-17A analysis design replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const il17aThread = findThreadById(state.projects, 'il17a-affinity-design')?.thread
    const runInspector = il17aThread?.runInspector

    expect(runInspector?.summary).toMatchObject({
      stage: '实验前分析设计完成',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 4,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.outputs).toHaveLength(4)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'IL17A_affinity_maturation_design_package.md',
          kind: 'report',
        }),
        expect.objectContaining({
          name: 'IL17A_library_design_matrix.csv',
          kind: 'dataset',
        }),
        expect.objectContaining({
          name: 'IL17A_assay_readout_plan.xlsx',
          kind: 'projectFile',
        }),
        expect.objectContaining({
          name: 'IL17A_scientific_figures.png',
          kind: 'figure',
        }),
      ]),
    )
    expect(runInspector?.approvals).toEqual([
      expect.objectContaining({
        kind: 'humanConfirmation',
        title: '确认 Experiment Design Package',
        status: 'confirmed',
      }),
    ])
    expect(runInspector?.capabilityRuns).toHaveLength(8)
    expect(
      runInspector?.capabilityRuns.every(
        (run) =>
          !JSON.stringify(run.output).includes('predictedWinner') &&
          !JSON.stringify(run.output).includes('provenCause'),
      ),
    ).toBe(true)
  })

  it('seeds the HER2 wet-lab execution Thread without changing the New Thread Draft default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2Thread = findThreadById(state.projects, 'her2-wetlab-validation')?.thread
    const blocks = her2Thread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )
    const allText = her2Thread?.transcript.map((turn) => turn.markdown ?? '').join('\n') ?? ''

    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(her2Thread?.id).toBe('her2-wetlab-validation')
    expect(her2Thread?.title).toBe('HER2 抗体候选湿实验验证')
    expect(her2Thread?.transcript).toHaveLength(19)
    expect(her2Thread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(5)
    expect(scientificFigures).toHaveLength(5)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.filter((block) => block.type === 'experimentOrderDraft')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(1)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(2)
    expect(blocks.filter((block) => block.type === 'humanConfirmation')).toHaveLength(3)
    expect(blocks.filter((block) => block.type === 'approvalGatePreview')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'candidateMoleculeTable')).toHaveLength(0)
    expect(allText).toContain('HER2-EXPTASK-20260531-001')
    expect(allText).toContain('Preset QC Check')
    expect(allText).toContain('Experiment Result Package')
    expect(allText).not.toContain('最佳突变组合')
    expect(allText).not.toContain('下一轮设计')
  })

  it('seeds structured Run Inspector data for the HER2 wet-lab execution replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2Thread = findThreadById(state.projects, 'her2-wetlab-validation')?.thread
    const runInspector = her2Thread?.runInspector

    expect(runInspector?.summary).toMatchObject({
      stage: '湿实验验证完成',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 5,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.progress[3]).toMatchObject({
      title: 'Experiment Task 执行回放',
      status: 'done',
    })
    expect(runInspector?.outputs).toHaveLength(5)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'BM-LAB-HER2-20260531-001',
          kind: 'experimentOrder',
          status: 'submitted',
        }),
        expect.objectContaining({
          name: 'HER2_wetlab_raw_result_bundle.xlsx',
          kind: 'dataset',
          status: 'completed',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_qc_report.md',
          kind: 'report',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_summary_report.md',
          kind: 'report',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_experiment_result_package_figures.png',
          kind: 'figure',
          status: 'saved',
        }),
      ]),
    )
    expect(runInspector?.outputs.some((output) => output.name.includes('EXPTASK'))).toBe(false)
    expect(runInspector?.approvals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'approvalRequest',
          title: '提交 HER2 Experiment Order',
          status: 'approved',
        }),
      ]),
    )
    expect(runInspector?.approvals).toHaveLength(4)
    expect(runInspector?.capabilityRuns).toHaveLength(9)
    expect(runInspector?.capabilityRuns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ commandName: 'ExperimentTaskReplay.syncStatus' }),
        expect.objectContaining({ commandName: 'PresetQcChecker.evaluateAssayFiles' }),
      ]),
    )
    expect(
      runInspector?.capabilityRuns.some((run) =>
        JSON.stringify(run.output).includes('HER2-EXPTASK-20260531-001'),
      ),
    ).toBe(true)
    expect(
      runInspector?.capabilityRuns.every(
        (run) =>
          !JSON.stringify(run.output).includes('recommendedLead') &&
          !JSON.stringify(run.output).includes('mechanismExplanation') &&
          !JSON.stringify(run.output).includes('nextRoundDesign'),
      ),
    ).toBe(true)
  })

  it('seeds the HER2 post-experiment multi-model analysis Thread as analysis only', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2AnalysisThread = findThreadById(
      state.projects,
      'her2-post-experiment-analysis',
    )?.thread
    const blocks =
      her2AnalysisThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const scientificFigures = blocks.filter(
      (block) => block.type === 'scientificFigure',
    )
    const allText =
      her2AnalysisThread?.transcript.map((turn) => turn.markdown ?? '').join('\n') ?? ''

    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(her2AnalysisThread?.title).toBe('HER2 实验结果多模型分析')
    expect(her2AnalysisThread?.transcript).toHaveLength(19)
    expect(her2AnalysisThread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(4)
    expect(scientificFigures).toHaveLength(5)
    expect(
      scientificFigures.every(
        (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
      ),
    ).toBe(true)
    expect(blocks.filter((block) => block.type === 'capabilityRunReplay')).toHaveLength(10)
    expect(blocks.filter((block) => block.type === 'humanConfirmation')).toHaveLength(3)
    expect(blocks.filter((block) => block.type === 'experimentOrderDraft')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(0)
    expect(blocks.filter((block) => block.type === 'elapsedWorkReplay')).toHaveLength(0)
    expect(allText).toContain('Experiment Result Package')
    expect(allText).toContain('multi-model consensus')
    expect(allText).toContain('假设性解释')
    expect(allText).not.toContain('提交 Experiment Order')
    expect(allText).not.toContain('下一轮实验设计')
    expect(allText).not.toContain('最佳突变组合')
  })

  it('seeds structured Run Inspector data for the HER2 post-experiment analysis replay', () => {
    const state = createInitialDemoState(seedProjects, now)
    const her2AnalysisThread = findThreadById(
      state.projects,
      'her2-post-experiment-analysis',
    )?.thread
    const runInspector = her2AnalysisThread?.runInspector

    expect(runInspector?.summary).toMatchObject({
      stage: '实验后结果分析完成',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 5,
      pendingCount: 0,
    })
    expect(runInspector?.progress).toHaveLength(7)
    expect(runInspector?.progress[2]).toMatchObject({
      title: '多模型分析执行',
      status: 'done',
    })
    expect(runInspector?.outputs).toHaveLength(5)
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'HER2_post_experiment_multimodel_analysis_report.md',
          kind: 'report',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_model_consensus_score_table.csv',
          kind: 'dataset',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_curve_fit_and_qc_summary.xlsx',
          kind: 'projectFile',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_post_analysis_figure_bundle.png',
          kind: 'figure',
          status: 'saved',
        }),
        expect.objectContaining({
          name: 'HER2_analysis_assumption_log.md',
          kind: 'report',
          status: 'saved',
        }),
      ]),
    )
    expect(runInspector?.outputs.some((output) => output.kind === 'experimentOrder')).toBe(false)
    expect(runInspector?.approvals).toHaveLength(3)
    expect(runInspector?.approvals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'humanConfirmation',
          title: '确认异常点处理边界',
          status: 'confirmed',
        }),
        expect.objectContaining({
          kind: 'humanConfirmation',
          title: '确认模型解释边界',
          status: 'confirmed',
        }),
        expect.objectContaining({
          kind: 'humanConfirmation',
          title: '确认分析报告归档',
          status: 'confirmed',
        }),
      ]),
    )
    expect(runInspector?.capabilityRuns).toHaveLength(10)
    expect(runInspector?.capabilityRuns).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ commandName: 'ResultPackageReader.loadHer2Package' }),
        expect.objectContaining({ commandName: 'KineticsModel.fitBliCurves' }),
        expect.objectContaining({ commandName: 'ModelConsensusAnalyzer.integrateSignals' }),
        expect.objectContaining({ commandName: 'UncertaintyAnalyzer.runSensitivityCheck' }),
      ]),
    )
    expect(
      runInspector?.capabilityRuns.every(
        (run) =>
          !JSON.stringify(run.output).includes('recommendedLead') &&
          !JSON.stringify(run.output).includes('mechanismProven') &&
          !JSON.stringify(run.output).includes('nextRoundDesign'),
      ),
    ).toBe(true)
  })

  it('seeds the Industrial Enzyme Design project with four complete Agent OS Threads', () => {
    const state = createInitialDemoState(seedProjects, now)
    const enzymeProject = state.projects.find(
      (project) => project.id === 'enzyme-discovery',
    )

    expect(enzymeProject?.name).toBe('Industrial Enzyme Design')
    expect(enzymeProject?.threads.map((thread) => thread.id)).toEqual(
      industrialEnzymeThreadIds,
    )
    expect(enzymeProject?.threads.map((thread) => thread.title)).toEqual([
      'ENZ-P0 工业酶优化闭环',
      '目标定义与候选设计',
      '酶库订单与实验执行',
      '结果分析与迭代决策',
    ])
    expect(enzymeProject?.threads.map((thread) => thread.id)).not.toEqual(
      expect.arrayContaining(['enzyme-family', 'screening-plan', 'enzymekcat']),
    )

    for (const thread of enzymeProject?.threads ?? []) {
      const blocks = thread.transcript.flatMap((turn) => turn.contentBlocks ?? [])
      const runInspector = thread.runInspector
      const isExperimentExecution = thread.id === 'enzyme-experiment-execution'
      const scientificFigures = blocks.filter(
        (block) => block.type === 'scientificFigure',
      )
      const elapsedBlocks = blocks.filter((block) => block.type === 'elapsedWorkReplay')
      const blockTypes = blocks.map((block) => block.type)
      const blockEventTimes = blocks.flatMap((block) => {
        if (block.type === 'humanConfirmation') {
          return [block.confirmedAt]
        }
        if (block.type === 'approvalRequestReplay') {
          return [block.decidedAt]
        }
        return []
      })
      const inspectorEventTimes =
        runInspector?.approvals.flatMap((approval) => approval.decidedAt ?? []) ?? []
      const markdownText = thread.transcript.map((turn) => turn.markdown ?? '').join('\n')
      const visibleText = collectStringValues(thread.transcript).join('\n')

      if (isExperimentExecution) {
        expect(thread.transcript.length).toBeGreaterThanOrEqual(55)
        expect(thread.transcript.filter((turn) => turn.role === 'user')).toHaveLength(9)
        expect(blockTypes).toEqual(
          expect.arrayContaining(expectedExperimentExecutionBlockTypes),
        )
        expect(scientificFigures.length).toBeGreaterThanOrEqual(3)
        expect(scientificFigures.map((block) => block.figureId)).toEqual(
          expect.arrayContaining([
            'enzyme-experiment-notebook-polling',
            'enzyme-experiment-record-summary',
            'enzyme-assay-execution-readout-summary',
          ]),
        )
        expect(
          scientificFigures.some(
            (block) => block.figureId === 'enzyme-experiment-order-draft',
          ),
        ).toBe(false)
        expect(blocks.filter((block) => block.type === 'experimentOrderDraft')).toHaveLength(
          0,
        )
        expect(
          blocks
            .filter((block) => block.type === 'approvalGateCard')
            .map((block) => ('status' in block ? block.status : undefined)),
        ).toEqual(['pending', 'approved'])
        expect(thread.transcript.at(-1)?.markdown).toContain(
          '结果包已准备进入分析',
        )
        expect(thread.transcript.at(-1)?.markdown).not.toMatch(/推荐|排名|自动进入下一轮/)
        expect(markdownText).not.toMatch(/demo/i)
        expect(markdownText).not.toMatch(/mock/i)
        expect(visibleText).not.toContain('模拟')
      } else {
        expect(thread.transcript).toHaveLength(19)
        expect(thread.transcript.filter((turn) => turn.role === 'user')).toHaveLength(5)
        expect(scientificFigures).toHaveLength(7)
      }
      expect(
        scientificFigures.every(
          (block) => block.width > 0 && block.height > 0 && Boolean(block.src),
        ),
      ).toBe(true)
      expect(elapsedBlocks.every((block) => !block.elapsed.includes('天'))).toBe(true)
      for (const eventTime of [...blockEventTimes, ...inspectorEventTimes]) {
        const timestamp = parseDemoDateTime(eventTime)

        expect(Number.isNaN(timestamp)).toBe(false)
        expect(timestamp).toBeLessThanOrEqual(thread.lastActivityAt)
      }
      expect(markdownText).toContain('ENZ-LIB-20260602-048')
      expect(markdownText).toContain('BM-LAB-ENZ-20260602-001')
      expect(markdownText).toContain('Enzyme_Experiment_Result_Package.xlsx')

      expect(runInspector).toBeDefined()
      expect(runInspector?.summary).toBeDefined()
      if (isExperimentExecution) {
        expect(runInspector?.summary).toMatchObject({
          stage: '实验执行模块',
          status: 'completed',
          completedSteps: expectedExperimentExecutionProgressTitles.length,
          totalSteps: expectedExperimentExecutionProgressTitles.length,
          pendingCount: 0,
        })
        expect(runInspector?.progress.map((item) => item.title)).toEqual(
          expectedExperimentExecutionProgressTitles,
        )
        expect(runInspector?.approvals.filter((approval) => approval.kind === 'approvalRequest')).toHaveLength(
          1,
        )
        expect(runInspector?.approvals).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              kind: 'approvalRequest',
              title: '订单提交审批',
              status: 'approved',
            }),
          ]),
        )
        expect(runInspector?.capabilityRuns.map((run) => run.commandName)).toEqual(
          expectedExperimentExecutionCommands,
        )
        expect(runInspector?.outputs).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              kind: 'experimentOrder',
              name: 'BM-LAB-ENZ-20260602-001',
              status: 'submitted',
            }),
            expect.objectContaining({
              kind: 'dataset',
              name: 'Enzyme_Experiment_Result_Package.xlsx',
              status: 'completed',
            }),
          ]),
        )
      } else {
        expect(runInspector?.progress.length).toBeGreaterThanOrEqual(7)
        expect(runInspector?.progress.length).toBeLessThanOrEqual(9)
        expect(runInspector?.capabilityRuns.length).toBeGreaterThanOrEqual(8)
        expect(runInspector?.capabilityRuns.length).toBeLessThanOrEqual(12)
      }
      expect(runInspector?.outputs.length).toBe(runInspector?.summary.outputCount)
      expect(runInspector?.outputs.length).toBeGreaterThan(0)
      expect(runInspector?.approvals.length).toBeGreaterThan(0)
      expect(
        runInspector?.capabilityRuns.every((run) =>
          forbiddenEnzymeCapabilityPrefixes.every(
            (prefix) => !run.commandName.startsWith(prefix),
          ),
        ),
      ).toBe(true)
      expect(
        forbiddenEnzymeOutputClaims.every(
          (claim) => !JSON.stringify(runInspector?.capabilityRuns).includes(claim),
        ),
      ).toBe(true)
    }
  })

  it('seeds Pipeline Build with the ENZ-P0 completed Pipeline Builder replay without changing the draft default', () => {
    const state = createInitialDemoState(seedProjects, now)
    const pipelineProject = state.projects.find(
      (project) => project.id === 'pipeline-build',
    )
    const pipelineThread = pipelineProject?.threads.find(
      (thread) => thread.id === 'pipeline-build-enz-p0-flow',
    )
    const blocks = pipelineThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const pipelineDagBlocks = blocks.filter((block) => block.type === 'pipelineDag')
    const v01DagBlock = pipelineDagBlocks.find((block) => block.version === 'v0.1')
    const v02DagBlock = pipelineDagBlocks.find((block) => block.version === 'v0.2')
    const v02Gate = v02DagBlock?.dag.nodes.find(
      (node) => node.title === '底物与反应体系确认',
    )
    const expressionQc = v02DagBlock?.dag.nodes.find(
      (node) => node.title === '表达与纯化 QC',
    )
    const enzymeAssay = v02DagBlock?.dag.nodes.find((node) => node.title === '酶活测定')
    const visibleText = collectStringValues(pipelineThread?.transcript ?? []).join('\n')
    const inputFileBlocks = blocks.filter((block) => block.type === 'projectFile')
    const runInspector = pipelineThread?.runInspector
    const finalTurn = pipelineThread?.transcript.at(-1)
    const uploadTurnIndex = pipelineThread?.transcript.findIndex((turn) =>
      turn.contentBlocks?.some(
        (block) =>
          block.type === 'projectFile' &&
          block.fileName === 'ENZ-P0_candidate_variants.xlsx',
      ),
    )
    const inputExtractionTurnIndex = pipelineThread?.transcript.findIndex((turn) =>
      turn.contentBlocks?.some(
        (block) =>
          block.type === 'capabilityRunReplay' &&
          block.commandName === 'PipelineBuilder.extractInputs',
      ),
    )
    const inputConfirmationTurns =
      uploadTurnIndex === undefined ||
      inputExtractionTurnIndex === undefined ||
      uploadTurnIndex < 0 ||
      inputExtractionTurnIndex < 0
        ? []
        : pipelineThread?.transcript.slice(uploadTurnIndex + 1, inputExtractionTurnIndex) ?? []
    const inputConfirmationText = inputConfirmationTurns
      .map((turn) => turn.markdown)
      .join('\n')
    const finalDagBlock = finalTurn?.contentBlocks?.find(
      (block) => block.type === 'pipelineDag',
    )
    const v01Turn = pipelineThread?.transcript.find((turn) =>
      turn.contentBlocks?.some(
        (block) => block.type === 'pipelineDag' && block.version === 'v0.1',
      ),
    )

    expect(seedProjects[0]?.id).toBe('pipeline-build')
    expect(state.selectedThreadId).toBeNull()
    expect(state.isDraftingNewThread).toBe(true)
    expect(pipelineProject?.name).toBe('Pipeline Build')
    expect(pipelineProject?.threads.length).toBeGreaterThanOrEqual(2)
    expect(pipelineThread?.title).toBe('ENZ-P0 实验流程编排')
    expect(pipelineThread?.transcript).toHaveLength(25)
    expect(pipelineThread?.transcript.filter((turn) => turn.role === 'user')).toHaveLength(11)
    expect(pipelineThread?.transcript.filter((turn) => turn.role === 'mainAgent')).toHaveLength(
      14,
    )
    expect(uploadTurnIndex).toBeGreaterThanOrEqual(0)
    expect(inputExtractionTurnIndex).toBeGreaterThan(uploadTurnIndex ?? -1)
    expect(inputConfirmationTurns).toHaveLength(10)
    expect(inputConfirmationTurns.filter((turn) => turn.role === 'mainAgent')).toHaveLength(5)
    expect(inputConfirmationTurns.filter((turn) => turn.role === 'user')).toHaveLength(5)
    expect(
      inputConfirmationTurns
        .filter((turn) => turn.role === 'mainAgent')
        .every(
          (turn) =>
            (turn.markdown ?? '').includes('**推荐 A：**') &&
            (turn.markdown ?? '').includes('B：') &&
            (turn.markdown ?? '').includes('C：'),
        ),
    ).toBe(true)
    expect(inputConfirmationText).toContain('我担心')
    expect(inputConfirmationText).toContain('候选酶集合')
    expect(inputConfirmationText).toContain('反应体系')
    expect(inputConfirmationText).toContain('输出字段契约')
    expect(pipelineDagBlocks).toHaveLength(3)
    expect(v01DagBlock).toBeDefined()
    expect(v02DagBlock).toBeDefined()
    expect(v02DagBlock?.dag.nodes).toHaveLength((v01DagBlock?.dag.nodes.length ?? 0) + 1)
    expect(v02Gate).toMatchObject({
      kind: 'human-gate',
      control: { kind: 'human-confirmation' },
    })
    expect(v02DagBlock?.dag.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: expressionQc?.id, to: v02Gate?.id }),
        expect.objectContaining({ from: v02Gate?.id, to: enzymeAssay?.id }),
      ]),
    )
    expect(v01Turn?.markdown).toContain('推荐 A')
    expect(v01Turn?.markdown).toContain('B：')
    expect(v01Turn?.markdown).toContain('C：')
    expect(finalTurn?.markdown).not.toContain('本次流程总结')
    expect(finalTurn?.markdown).toContain('Pipeline Input')
    expect(finalTurn?.markdown).toContain('Pipeline Output')
    expect(finalTurn?.markdown).toContain('Pipeline 流程')
    expect(finalTurn?.markdown).toContain('候选酶集合')
    expect(finalTurn?.markdown).toContain('样本与板位映射')
    expect(finalTurn?.markdown).toContain('酶活测定配置')
    expect(finalTurn?.markdown).toContain('输出字段契约')
    expect(finalTurn?.markdown).toContain('酶活结果')
    expect(finalTurn?.markdown).toContain('稳定性结果')
    expect(finalTurn?.markdown).toContain('异常与复测决策')
    expect(finalTurn?.markdown).toContain('标准化结果包')
    expect(finalTurn?.markdown).toContain('输出文件')
    expect(finalTurn?.markdown).toContain('ENZ-P0_Assay_Result_Package.xlsx')
    expect(finalTurn?.markdown).toContain('Pipeline_DAG_v0.2.json')
    expect(finalDagBlock).toMatchObject({
      version: 'v0.2',
      status: 'saved',
      dag: v02DagBlock?.dag,
    })
    expect(visibleText).toContain('已保存到 Pipelines，来源为自建，版本 v1.0')
    expect(visibleText).not.toMatch(/demo/i)
    expect(visibleText).not.toMatch(/mock/i)
    expect(visibleText).not.toContain('模拟')
    expect(visibleText).not.toContain('Agent-built')
    expect(visibleText).not.toContain('AI-generated')
    expect(inputFileBlocks).not.toHaveLength(0)
    expect(inputFileBlocks.every((block) => block.location.includes('Project Files / 输入文件'))).toBe(
      true,
    )
    expect(inputFileBlocks.some((block) => block.location.includes('Assets'))).toBe(false)
    expect(runInspector?.summary).toMatchObject({
      stage: 'Pipeline Builder',
      status: 'completed',
      pendingCount: 0,
    })
    expect(runInspector?.progress).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: '保存到 Pipelines', status: 'done' }),
      ]),
    )
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'ENZ-P0 Assay Characterization Pipeline v1.0',
        }),
      ]),
    )
    expect(runInspector?.approvals.length).toBeGreaterThan(0)
    expect(runInspector?.approvals.every((approval) => approval.kind === 'humanConfirmation')).toBe(
      true,
    )
  })

  it('seeds the LIMS enzyme synthesis Pipeline Build Thread from real-run evidence into the existing LIMS Pipeline', () => {
    const state = createInitialDemoState(seedProjects, now)
    const pipelineProject = state.projects.find(
      (project) => project.id === 'pipeline-build',
    )
    const limsThread = pipelineProject?.threads.find(
      (thread) => thread.id === 'pipeline-build-lims-enzyme-synthesis',
    )
    const blocks = limsThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const projectFiles = blocks.filter((block) => block.type === 'projectFile')
    const capabilityRuns = blocks.filter((block) => block.type === 'capabilityRunReplay')
    const pipelineDagBlocks = blocks.filter((block) => block.type === 'pipelineDag')
    const firstDag = pipelineDagBlocks.find((block) => block.version === 'v0.1')
    const finalDag = pipelineDagBlocks.find((block) => block.version === 'v1.0')
    const visibleText = collectStringValues(limsThread?.transcript ?? []).join('\n')
    const firstDagTurnIndex = limsThread?.transcript.findIndex((turn) =>
      turn.contentBlocks?.some(
        (block) => block.type === 'pipelineDag' && block.version === 'v0.1',
      ),
    )
    const turnsBeforeFirstDag =
      firstDagTurnIndex === undefined || firstDagTurnIndex < 0
        ? []
        : limsThread?.transcript.slice(0, firstDagTurnIndex) ?? []
    const agentConfirmationTurns = turnsBeforeFirstDag.filter(
      (turn) =>
        turn.role === 'mainAgent' &&
        (turn.markdown ?? '').includes('推荐 A') &&
        (turn.markdown ?? '').includes('B：') &&
        (turn.markdown ?? '').includes('C：'),
    )
    const dataIntegrityNode = finalDag?.dag.nodes.find(
      (node) => node.title === '数据完整性检查',
    )
    const runInspector = limsThread?.runInspector
    const finalTurn = limsThread?.transcript.at(-1)

    expect(pipelineProject?.name).toBe('Pipeline Build')
    expect(limsThread?.title).toBe('LIMS 酶合成执行编排')
    expect(limsThread?.transcript.length).toBeGreaterThanOrEqual(22)
    expect(limsThread?.transcript.length).toBeLessThanOrEqual(30)
    expect(projectFiles.map((block) => block.fileName)).toEqual(
      expect.arrayContaining([
        'RUN-ENZ-SYN-20260604_experiment_retro.md',
        'LIMS_work_orders_export.csv',
        'ELN_callback_records.json',
        'QC_gate_summary.xlsx',
        'approval_events.json',
        'asset_object_manifest.json',
      ]),
    )
    expect(visibleText).toContain('可以直接固化的事实')
    expect(visibleText).toContain('需要你确认的缺口')
    expect(agentConfirmationTurns).toHaveLength(6)
    expect(visibleText).toContain('完整 LIMS 执行闭环')
    expect(visibleText).toContain('审批人、审批类型和资料包')
    expect(visibleText).toContain('质检审批')
    expect(visibleText).toContain('发起人默认 owner')
    expect(visibleText).toContain(
      'ELN 回调、仪器读数和工单状态三方一致',
    )
    expect(pipelineDagBlocks).toHaveLength(3)
    expect(firstDag).toMatchObject({
      title: 'LIMS 酶合成执行 Pipeline DAG',
      version: 'v0.1',
      status: 'draft',
    })
    expect(finalDag).toMatchObject({
      title: 'LIMS 酶合成执行 Pipeline DAG',
      version: 'v1.0',
      status: 'saved',
    })
    expect(dataIntegrityNode?.inputs).toEqual(
      expect.arrayContaining(['ELN 回调数据', '仪器读数回调', '工单状态记录']),
    )
    expect(dataIntegrityNode?.description).toContain('三方一致')
    expect(capabilityRuns.map((block) => block.commandName)).toEqual(
      expect.arrayContaining([
        'RealRunEvidenceExtractor.extractLimsFlow',
        'PipelinePlanner.generateLimsDraftDag',
        'PipelineDagValidator.validateLimsDag',
        'PipelineRegistry.savePipeline',
      ]),
    )
    expect(runInspector?.summary).toMatchObject({
      stage: 'Pipeline 编排',
      status: 'completed',
      completedSteps: 12,
      totalSteps: 12,
      pendingCount: 0,
    })
    expect(runInspector?.progress.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        '读取真实运行资料包',
        '确认工单和回调模型',
        '修订数据完整性 QC',
        '保存 Pipeline v1.0',
      ]),
    )
    expect(runInspector?.outputs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'LIMS 酶合成执行 Pipeline v1.0',
        }),
        expect.objectContaining({
          name: 'LIMS_Enzyme_Synthesis_Pipeline_v1.0.json',
        }),
      ]),
    )
    expect(finalTurn?.markdown).toContain('Pipeline Input')
    expect(finalTurn?.markdown).toContain('Pipeline Output')
    expect(finalTurn?.markdown).toContain('Pipeline Flow')
    expect(finalTurn?.markdown).toContain('LIMS 酶合成执行 Pipeline v1.0')
    expect(visibleText).not.toMatch(/demo/i)
    expect(visibleText).not.toMatch(/mock/i)
    expect(visibleText).not.toContain('模拟')
  })

  it('seeds enzyme thread-specific human boundaries and candidate evidence blocks', () => {
    const state = createInitialDemoState(seedProjects, now)
    const fullLoopThread = findThreadById(state.projects, 'enzyme-full-loop')?.thread
    const designThread = findThreadById(state.projects, 'enzyme-design-breakdown')?.thread
    const experimentThread = findThreadById(
      state.projects,
      'enzyme-experiment-execution',
    )?.thread
    const analysisThread = findThreadById(state.projects, 'enzyme-analysis-iteration')?.thread
    const designBlocks = designThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const analysisBlocks =
      analysisThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []

    const fullLoopBlocks =
      fullLoopThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []
    const experimentBlocks =
      experimentThread?.transcript.flatMap((turn) => turn.contentBlocks ?? []) ?? []

    expect(fullLoopBlocks.filter((block) => block.type === 'experimentOrderDraft')).toHaveLength(
      1,
    )
    expect(fullLoopBlocks.filter((block) => block.type === 'approvalRequestReplay')).toHaveLength(
      1,
    )
    expect(
      fullLoopBlocks.filter((block) => block.type === 'elapsedWorkReplay').length,
    ).toBeGreaterThan(0)
    expect(fullLoopBlocks.filter((block) => block.type === 'projectFile').length).toBeGreaterThan(
      0,
    )

    expect(experimentBlocks.map((block) => block.type)).toEqual(
      expect.arrayContaining(expectedExperimentExecutionBlockTypes),
    )
    expect(experimentBlocks.filter((block) => block.type === 'approvalGateCard')).toHaveLength(2)
    expect(
      experimentBlocks.filter((block) => block.type === 'humanConfirmation').length,
    ).toBe(7)
    expect(
      experimentBlocks.filter((block) => block.type === 'experimentNotebookSummary'),
    ).toHaveLength(1)
    expect(experimentBlocks.filter((block) => block.type === 'projectFile').length).toBeGreaterThan(
      0,
    )

    for (const blocks of [designBlocks, analysisBlocks]) {
      expect(blocks.filter((block) => block.type === 'candidateEvidenceTable')).toHaveLength(1)
      expect(blocks.filter((block) => block.type === 'candidateMoleculeTable')).toHaveLength(0)
    }
  })

  it('structures enzyme experiment confirmation prompts with recommended rationale', () => {
    const state = createInitialDemoState(seedProjects, now)
    const experimentThread = findThreadById(
      state.projects,
      'enzyme-experiment-execution',
    )?.thread
    const confirmationPrompts =
      experimentThread?.transcript.filter(
        (turn) => turn.role === 'mainAgent' && (turn.markdown ?? '').includes('请确认'),
      ) ?? []
    const directApprovalPrompt = confirmationPrompts.find((turn) =>
      (turn.markdown ?? '').includes('模块 08 订单提交审批'),
    )
    const optionPrompts = confirmationPrompts.filter(
      (turn) => turn.id !== directApprovalPrompt?.id,
    )
    const okTurn = experimentThread?.transcript.find(
      (turn) => turn.id === 'enzyme-experiment-execution-turn-031',
    )
    const pendingApprovalTurn = experimentThread?.transcript.find(
      (turn) => turn.id === 'enzyme-experiment-execution-turn-032',
    )
    const approvedApprovalTurn = experimentThread?.transcript.find(
      (turn) => turn.id === 'enzyme-experiment-execution-turn-033',
    )

    const postApprovalTurns =
      experimentThread?.transcript.filter((turn) => {
        const turnNumber = Number(turn.id.split('-').at(-1))

        return turnNumber >= 34
      }) ?? []
    const postApprovalMarkdown = postApprovalTurns.map((turn) => turn.markdown ?? '').join('\n')
    const postApprovalBlocks = postApprovalTurns.flatMap((turn) => turn.contentBlocks ?? [])
    const notebookSummaryIndex = postApprovalBlocks.findIndex(
      (block) => block.type === 'experimentNotebookSummary',
    )
    const notebookPollingFigureIndex = postApprovalBlocks.findIndex(
      (block) =>
        block.type === 'scientificFigure' &&
        block.figureId === 'enzyme-experiment-notebook-polling',
    )

    expect(confirmationPrompts).toHaveLength(8)
    expect(optionPrompts).toHaveLength(7)
    expect(
      optionPrompts.every((turn) => {
        const markdown = turn.markdown ?? ''

        return (
          markdown.includes('\n\n- 推荐 A：') &&
          markdown.includes('\n  原因：') &&
          markdown.includes('\n- B：') &&
          markdown.includes('\n- C：') &&
          !markdown.includes('请确认：') &&
          !markdown.includes('**推荐理由：**')
        )
      }),
    ).toBe(true)
    expect(confirmationPrompts[0]?.markdown).toContain(
      '只抽取执行边界能避免把设计阶段的假设误写成实验结论',
    )
    expect(confirmationPrompts[0]?.markdown).toContain('请确认处理方式')
    expect(directApprovalPrompt?.markdown).toContain('请确认是否可以提交订单')
    expect(directApprovalPrompt?.markdown).toContain('请重点检查')
    expect(directApprovalPrompt?.markdown).toContain('BM-LAB-ENZ-20260602-001')
    expect(directApprovalPrompt?.markdown).not.toContain('推荐 A')
    expect(directApprovalPrompt?.markdown).not.toContain('- B：')
    expect(directApprovalPrompt?.markdown).not.toContain('- C：')
    expect(directApprovalPrompt?.contentBlocks).toBeUndefined()
    expect(okTurn?.markdown).toBe('OK。')
    expect(pendingApprovalTurn?.markdown).toContain('我已提交审批')
    expect(pendingApprovalTurn?.markdown).toContain('我会等待审批结束')
    expect(pendingApprovalTurn?.markdown).toContain('撤回并修改')
    expect(pendingApprovalTurn?.contentBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'approvalGateCard',
          status: 'pending',
          riskSummary: expect.stringContaining('审批发起资料'),
          details: expect.arrayContaining([
            expect.objectContaining({
              label: '审批对象',
              value: 'BM-LAB-ENZ-20260602-001',
            }),
            expect.objectContaining({
              label: '发起时间',
              value: '2026-06-02 11:31',
            }),
            expect.objectContaining({
              label: '当前动作',
              value: '发起审批，不创建 Experiment Task',
            }),
          ]),
          decision: '审批流程已发起，等待审批人处理',
        }),
      ]),
    )
    expect(
      pendingApprovalTurn?.contentBlocks?.some(
        (block) => block.type === 'approvalGateCard' && 'approvalAdvice' in block,
      ),
    ).toBe(false)
    expect(approvedApprovalTurn?.markdown).toContain('已经通过审批，这是审批建议和结果')
    expect(approvedApprovalTurn?.contentBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'approvalGateCard',
          status: 'approved',
          approvalAdvice: '建议通过；实验范围、样本、板图和物料检查均满足提交条件。',
          details: expect.arrayContaining([
            expect.objectContaining({
              label: '审批通过时间',
              value: '2026-06-02 11:34',
            }),
            expect.objectContaining({
              label: '生效动作',
              value: '创建 ENZ-EXPTASK-20260602-001',
            }),
            expect.objectContaining({
              label: '限制条件',
              value: '只授权本轮执行，不触发后续设计或额外订单',
            }),
          ]),
          decision: '批准提交 BM-LAB-ENZ-20260602-001',
        }),
      ]),
    )
    expect(postApprovalTurns.filter((turn) => turn.role === 'user')).toHaveLength(0)
    expect(postApprovalMarkdown).toContain('模块 09 创建 Experiment Task')
    expect(postApprovalMarkdown).toContain('我直接创建')
    expect(postApprovalMarkdown).toContain('模块 10 实验记录本')
    expect(postApprovalMarkdown).toContain('预计提交时间')
    expect(postApprovalMarkdown).toContain('轮询任务')
    expect(postApprovalMarkdown).toContain('尚未提交实验记录')
    expect(postApprovalMarkdown).toContain('回调任务')
    expect(postApprovalMarkdown).toContain('实验记录数据摘要')
    expect(postApprovalMarkdown).not.toMatch(/推荐 A|请确认|- B：|- C：/)
    expect(postApprovalBlocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'experimentNotebookSummary',
          notebookId: 'ELN-ENZ-20260602-117',
          estimatedSubmitBy: '2026-06-02 14:40',
          callbackId: 'CALLBACK-ELN-ENZ-20260602-117',
          recordSections: expect.arrayContaining([
            expect.objectContaining({
              label: '样本处理',
              value: expect.stringContaining('48 个候选'),
            }),
            expect.objectContaining({
              label: '读数记录',
              value: expect.stringContaining('Activity'),
            }),
          ]),
        }),
        expect.objectContaining({
          type: 'scientificFigure',
          figureId: 'enzyme-experiment-record-summary',
        }),
      ]),
    )
    expect(notebookSummaryIndex).toBeGreaterThanOrEqual(0)
    expect(notebookPollingFigureIndex).toBeGreaterThan(notebookSummaryIndex)
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
      routeId: expect.stringMatching(/^[a-z0-9]{16}$/),
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
          '已记录到当前对话。本次输入已加入线程历史，当前未触发新的 BioMap OS 操作。',
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
        'enzyme-full-loop',
      ),
      draft: draftText,
    }
    const beforeCount =
      selected.projects.find((project) => project.id === 'enzyme-discovery')
        ?.threads.length ?? 0

    const next = submitDraftSnapshot(selected, now + 5000, () => 'unused-id')
    const enzymeProject = next.projects.find(
      (project) => project.id === 'enzyme-discovery',
    )
    const selectedThread = findThreadById(next.projects, 'enzyme-full-loop')?.thread

    expect(enzymeProject?.threads).toHaveLength(beforeCount)
    expect(selectedThread?.id).toBe('enzyme-full-loop')
    expect(selectedThread?.lastActivityAt).toBe(now + 5000)
    expect(next.selectedThreadId).toBe('enzyme-full-loop')
    expect(next.isDraftingNewThread).toBe(false)
    expect(next.draft).toBe('')
    expect(next.statusMessage).toBe('')
    expect(selectedThread?.transcript.at(-2)).toMatchObject({
      role: 'user',
      markdown: draftText,
    })
    expect(selectedThread?.transcript.at(-1)).toMatchObject({
      role: 'mainAgent',
      markdown:
        '已记录到当前对话。本次输入已加入线程历史，当前未触发新的 BioMap OS 操作。',
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
        lastActivityAt: thread.id === 'enzyme-full-loop' ? now + 10_000 : now + index,
        archived: thread.id === 'egfr-affinity',
        pinned: thread.id === 'enzyme-full-loop',
        pinnedAt: thread.id === 'enzyme-full-loop' ? now + 100_000 : null,
      })),
    }))

    const recentEntries = getRecentThreadEntries(updatedProjects, 5)

    expect(recentEntries).toHaveLength(5)
    expect(recentEntries.some((entry) => entry.thread.id === 'egfr-affinity')).toBe(false)
    expect(recentEntries.map((entry) => entry.thread.lastActivityAt)).toEqual(
      recentEntries
        .map((entry) => entry.thread.lastActivityAt)
        .toSorted((left, right) => right - left),
    )
    expect(recentEntries.map((entry) => entry.projectName)).toEqual(
      expect.arrayContaining(['Antibody Optimization', 'Industrial Enzyme Design']),
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
