import { describe, expect, it } from 'vitest'
import { projects } from './mockData'
import { buildThreadObjectStorageFiles } from './workspaceSideWindowMockData'

const antibodyThreadIds: Array<
  | 'targetx-antibody-discovery'
  | 'targetx-r1-lims-execution'
  | 'targetx-data-model-finetune'
> = [
  'targetx-antibody-discovery',
  'targetx-r1-lims-execution',
  'targetx-data-model-finetune',
]

function getAntibodyThread(threadId: (typeof antibodyThreadIds)[number]) {
  const project = projects.find((item) => item.id === 'antibody-optimization')
  const thread = project?.threads.find((item) => item.id === threadId)

  if (!thread) {
    throw new Error(`Missing antibody demo thread: ${threadId}`)
  }

  return thread
}

describe('Target-X antibody demo threads', () => {
  it('adds the three Target-X mock threads to Antibody Optimization with realistic transcripts', () => {
    const antibodyProject = projects.find(
      (project) => project.id === 'antibody-optimization',
    )

    expect(antibodyProject?.threads.map((thread) => thread.id)).toEqual(
      expect.arrayContaining(antibodyThreadIds),
    )

    for (const threadId of antibodyThreadIds) {
      const thread = getAntibodyThread(threadId)

      expect(thread.transcript?.length).toBeGreaterThanOrEqual(18)
      expect(thread.runInspector?.summary.totalSteps).toBeGreaterThanOrEqual(8)
      expect(thread.runInspector?.summary.status).toBe('completed')

      const blockTypes =
        thread.transcript?.flatMap((turn) =>
          turn.contentBlocks?.map((block) => block.type) ?? [],
        ) ?? []

      expect(blockTypes).toContain('projectFile')
      expect(blockTypes).toContain('capabilityRunReplay')
      expect(blockTypes).toContain('humanConfirmation')
      expect(blockTypes).toContain('dataChart')
    }
  })

  it('uses specialized blocks that match each Target-X workflow', () => {
    expect(
      getBlockTypes('targetx-antibody-discovery'),
    ).toEqual(
      expect.arrayContaining([
        'candidateEvidenceTable',
        'scientificDiagram',
        'scientificFigure',
        'approvalGateCard',
      ]),
    )

    expect(getBlockTypes('targetx-r1-lims-execution')).toEqual(
      expect.arrayContaining([
        'experimentOrderSummary',
        'sampleScopePanel',
        'plateMapMini',
        'experimentNotebookSummary',
        'resultPackageChecklist',
      ]),
    )

    expect(getBlockTypes('targetx-data-model-finetune')).toEqual(
      expect.arrayContaining([
        'candidateEvidenceTable',
        'approvalGateCard',
        'resultPackageChecklist',
      ]),
    )
  })

  it('renders Target-X scientific figures with concrete image assets', () => {
    const figureBlocks = getBlocks('targetx-antibody-discovery').filter(
      (block) => block.type === 'scientificFigure',
    )

    expect(figureBlocks.length).toBeGreaterThanOrEqual(2)
    expect(figureBlocks.every((block) => Boolean(block.src))).toBe(true)
  })

  it('uses frontend diagram components for the evidence network and epitope hypothesis views', () => {
    const diagramBlocks = getBlocks('targetx-antibody-discovery').filter(
      (block) => block.type === 'scientificDiagram',
    )

    expect(diagramBlocks.map((block) => block.diagramKind)).toEqual([
      'targetxEvidenceNetwork',
      'targetxEpitopeHypothesis',
    ])
  })

  it('expands the discovery thread into a research-length conversation with substantial human input', () => {
    const thread = getAntibodyThread('targetx-antibody-discovery')
    const userTurns = thread.transcript?.filter((turn) => turn.role === 'user') ?? []

    expect(thread.transcript?.length).toBeGreaterThanOrEqual(60)
    expect(userTurns.length).toBeGreaterThanOrEqual(12)
  })

  it('keeps the discovery thread visually and semantically Target-X specific', () => {
    const thread = getAntibodyThread('targetx-antibody-discovery')
    const serializedThread = JSON.stringify(thread).toLowerCase()
    const visualBlockCount = getBlocks('targetx-antibody-discovery').filter(
      (block) =>
        block.type === 'scientificFigure' ||
        block.type === 'scientificDiagram' ||
        block.type === 'dataChart',
    ).length

    expect(serializedThread).not.toContain('egfr')
    expect(visualBlockCount).toBeGreaterThanOrEqual(3)
  })

  it('aligns discovery run inspector with the expanded research workflow', () => {
    const thread = getAntibodyThread('targetx-antibody-discovery')
    const outputNames =
      thread.runInspector?.outputs.map((output) => output.name) ?? []

    expect(thread.runInspector?.summary.totalSteps).toBeGreaterThanOrEqual(12)
    expect(outputNames).toEqual(
      expect.arrayContaining([
        'TargetX_top28_release_package.json',
        'TargetX_R1_LIMS_Submission_Payload.json',
        'TargetX_discovery_decision_log.md',
      ]),
    )
  })

  it('adds xTrimo and open-source model call comparisons to the discovery thread', () => {
    const blocks = getBlocks('targetx-antibody-discovery')
    const modelBlocks = blocks.filter((block) => block.type === 'modelCallComparison')

    expect(modelBlocks.length).toBeGreaterThanOrEqual(5)
    expect(modelBlocks.map((block) => block.primaryModel.name)).toEqual(
      expect.arrayContaining([
        'xTrimoFold',
        'xTrimoAbFold',
        'xTrimoAbAgDock',
        'xTrimoAbGen',
        'xTrimoAbAggregation',
      ]),
    )
    expect(modelBlocks.every((block) => block.primaryModel.provider.includes('xTrimo'))).toBe(
      true,
    )
    expect(modelBlocks.every((block) => block.comparatorModel.provider.includes('Open-source'))).toBe(
      true,
    )
    expect(modelBlocks.every((block) => (block.artifacts?.length ?? 0) > 0)).toBe(true)
    expect(JSON.stringify(modelBlocks)).toContain('wet-lab validation')
  })

  it('tracks Target-X model workbench outputs in the run inspector', () => {
    const thread = getAntibodyThread('targetx-antibody-discovery')
    const progressTitles = thread.runInspector?.progress.map((item) => item.title) ?? []
    const outputNames = thread.runInspector?.outputs.map((output) => output.name) ?? []

    expect(progressTitles).toEqual(
      expect.arrayContaining([
        '模型输入包',
        '抗原结构交叉校验',
        'Fv 结构交叉校验',
        'Docking 与表位一致性',
        '候选生成模型对照',
        '可开发性模型栈',
        '模型共识矩阵',
      ]),
    )
    expect(outputNames).toEqual(
      expect.arrayContaining([
        'TargetX_model_input_batch.json',
        'TargetX_xtrimo_fold_antigen.json',
        'TargetX_esmfold_antigen_crosscheck.json',
        'TargetX_xtrimo_abfold_results.json',
        'TargetX_igfold_crosscheck.json',
        'TargetX_xtrimo_abagdock_results.json',
        'TargetX_haddock_crosscheck.json',
        'TargetX_abgen_candidate_batch.json',
        'TargetX_iglm_plausibility_check.csv',
        'TargetX_xtrimo_aggregation_risk.json',
        'TargetX_developability_rule_flags.csv',
        'TargetX_model_consensus_matrix.csv',
        'TargetX_model_call_audit.json',
        'TargetX_candidate_model_decision_log.md',
      ]),
    )
  })

  it('provides object-storage files for the side window of each Target-X thread', () => {
    for (const threadId of antibodyThreadIds) {
      const files = buildThreadObjectStorageFiles('Antibody Optimization', threadId)

      expect(files.length).toBeGreaterThanOrEqual(6)
      expect(files.map((file) => file.previewKind)).toEqual(
        expect.arrayContaining(['markdown', 'json', 'spreadsheet']),
      )
      expect(files.every((file) => file.objectPath.startsWith('Antibody Optimization/'))).toBe(
        true,
      )
    }
  })

  it('provides expanded discovery assets in the side window file tree', () => {
    const files = buildThreadObjectStorageFiles(
      'Antibody Optimization',
      'targetx-antibody-discovery',
    )
    const fileNames = files.map((file) => file.fileName)
    const modelArtifactNames = getBlocks('targetx-antibody-discovery')
      .filter((block) => block.type === 'modelCallComparison')
      .flatMap((block) => block.artifacts?.map((artifact) => artifact.name) ?? [])

    expect(fileNames).toEqual(
      expect.arrayContaining([
        'TargetX_research_brief.md',
        'TargetX_target_profile.json',
        'TargetX_evidence_network.json',
        'TargetX_patent_similarity_review.md',
        'TargetX_antigen_strategy.md',
        'TargetX_counter_screen_plan.json',
        'TargetX_epitope_hypothesis.json',
        'TargetX_candidate_pool_manifest.json',
        'TargetX_developability_filter_log.csv',
        'TargetX_candidate_ranking.xlsx',
        'TargetX_candidate_decision_log.md',
        'TargetX_top28_release_package.json',
        'TargetX_R1_LIMS_Submission_Payload.json',
        'TargetX_discovery_evidence_index.json',
        'TargetX_model_input_batch.json',
        'TargetX_xtrimo_fold_antigen.json',
        'TargetX_esmfold_antigen_crosscheck.json',
        'TargetX_xtrimo_abfold_results.json',
        'TargetX_igfold_crosscheck.json',
        'TargetX_xtrimo_abagdock_results.json',
        'TargetX_haddock_crosscheck.json',
        'TargetX_abgen_candidate_batch.json',
        'TargetX_iglm_plausibility_check.csv',
        'TargetX_xtrimo_aggregation_risk.json',
        'TargetX_developability_rule_flags.csv',
        'TargetX_model_consensus_matrix.csv',
        'TargetX_model_call_audit.json',
        'TargetX_candidate_model_decision_log.md',
      ]),
    )
    expect(fileNames).toEqual(expect.arrayContaining(modelArtifactNames))
  })

  it('keeps the Target-X model workbench language production-like', () => {
    const thread = getAntibodyThread('targetx-antibody-discovery')
    const files = buildThreadObjectStorageFiles(
      'Antibody Optimization',
      'targetx-antibody-discovery',
    )
    const serializedModelWorkbench = JSON.stringify({ thread, files })

    expect(serializedModelWorkbench).not.toContain('mockOnly')
    expect(serializedModelWorkbench).not.toContain('noRealApiCall')
    expect(serializedModelWorkbench).not.toContain('mock-2026.06')
  })
})

function getBlockTypes(threadId: (typeof antibodyThreadIds)[number]) {
  return getBlocks(threadId).map((block) => block.type)
}

function getBlocks(threadId: (typeof antibodyThreadIds)[number]) {
  return (
    getAntibodyThread(threadId).transcript?.flatMap(
      (turn) => turn.contentBlocks ?? [],
    ) ?? []
  )
}
