import { describe, expect, it } from 'vitest'
import { projects } from './mockData'
import { capabilityEntries } from './mockCapabilities'
import { buildThreadObjectStorageFiles } from './workspaceSideWindowMockData'

describe('Enzyme Synthesis Ops mock demo', () => {
  it('registers one LIMS execution thread under Enzyme Synthesis Ops', () => {
    const project = projects.find((item) => item.id === 'enzyme-synthesis-ops')
    const thread = project?.threads.find((item) => item.id === 'lims-flow-run')

    expect(project?.name).toBe('Enzyme Synthesis Ops')
    expect(project?.threads).toHaveLength(1)
    expect(thread?.title).toBe('LIMS 流程运行')
    expect(thread?.transcript?.length).toBeGreaterThanOrEqual(35)
    expect(thread?.transcript?.length).toBeLessThanOrEqual(45)
    expect(thread?.runInspector?.summary).toMatchObject({
      stage: 'LIMS Pipeline 运行',
      status: 'completed',
      completedSteps: 15,
      totalSteps: 15,
    })
    expect(thread?.runInspector?.progress.map((item) => item.title)).toEqual(
      expect.arrayContaining([
        '输入表单补齐',
        '质检审批与回退',
        '质检摘要回调',
        '结果释放审批与效率分析',
      ]),
    )
  })

  it('adds a Capabilities pipeline with compressed DAG gates and approvals', () => {
    const pipeline = capabilityEntries.find(
      (item) => item.id === 'pipeline-enzyme-synthesis-lims',
    )

    expect(pipeline).toMatchObject({
      kind: 'pipeline',
      name: 'LIMS 酶合成执行 Pipeline',
      status: 'active',
      source: 'created',
      owner: 'LabOps Automation',
    })
    expect(pipeline?.dag?.nodes.length).toBeGreaterThanOrEqual(14)
    expect(pipeline?.dag?.nodes.length).toBeLessThanOrEqual(18)
    expect(pipeline?.dag?.nodes.map((node) => node.title)).toEqual(
      expect.arrayContaining([
        '启动审批',
        '质检审批',
        '结果释放审批',
        '构建 QC',
        '纯化 QC',
        '数据完整性检查',
      ]),
    )
    expect(pipeline?.dag?.nodes.map((node) => node.title)).not.toContain(
      '表达 QC',
    )
  })

  it('keeps chart and approval moments visible in the transcript', () => {
    const thread = projects
      .find((project) => project.id === 'enzyme-synthesis-ops')
      ?.threads.find((item) => item.id === 'lims-flow-run')
    const transcriptText = thread?.transcript
      ?.map((turn) => turn.markdown ?? '')
      .join('\n')
    const blocks = thread?.transcript?.flatMap((turn) => turn.contentBlocks ?? [])
    const chartTypes = blocks
      ?.filter((block) => block.type === 'dataChart')
      .map((block) => block.chartType)

    expect(transcriptText).toContain('run_start')
    expect(transcriptText).toContain('rework_authorization')
    expect(transcriptText).toContain('result_release')
    expect(transcriptText).toContain('质检数据回调卡如下')
    expect(transcriptText).not.toContain('返工审批')
    expect(transcriptText).not.toContain('返工授权审批')
    expect(chartTypes).toEqual(expect.arrayContaining(['line', 'bar', 'pie']))
  })

  it('shows a cumulative node-throughput comparison in the efficiency review', () => {
    const thread = projects
      .find((project) => project.id === 'enzyme-synthesis-ops')
      ?.threads.find((item) => item.id === 'lims-flow-run')
    const blocks = thread?.transcript?.flatMap((turn) => turn.contentBlocks ?? [])
    const efficiencyChart = blocks?.find(
      (block) =>
        block.type === 'dataChart' &&
        block.title === 'LIMS 节点通过效率对比',
    )
    const transcriptText = thread?.transcript
      ?.map((turn) => turn.markdown ?? '')
      .join('\n')

    expect(efficiencyChart).toMatchObject({
      chartType: 'line',
      xLabel: '累计耗时 (min)',
      yLabel: '已通过节点数',
      series: expect.arrayContaining([
        expect.objectContaining({ label: '本轮 RUN-ENZ-SYN-20260604-001' }),
        expect.objectContaining({ label: '上一轮 RUN-ENZ-SYN-20260531-004' }),
        expect.objectContaining({ label: '最近 5 轮均值' }),
      ]),
    })
    expect(
      efficiencyChart?.type === 'dataChart'
        ? efficiencyChart.series.every((serie) => serie.points.length >= 6)
        : false,
    ).toBe(true)
    if (efficiencyChart?.type !== 'dataChart') {
      throw new Error('Missing efficiency chart')
    }

    const currentRun = efficiencyChart.series.find((serie) =>
      serie.label.includes('20260604'),
    )
    const previousRun = efficiencyChart.series.find((serie) =>
      serie.label.includes('20260531'),
    )
    const recentMean = efficiencyChart.series.find((serie) =>
      serie.label.includes('最近 5 轮'),
    )
    const currentFinal = Number(currentRun?.points.at(-1)?.label)
    const previousFinal = Number(previousRun?.points.at(-1)?.label)
    const recentMeanFinal = Number(recentMean?.points.at(-1)?.label)
    const currentConstructionCheckpoint = Number(currentRun?.points[2]?.label)
    const previousConstructionCheckpoint = Number(previousRun?.points[2]?.label)

    expect(currentFinal).toBeLessThan(recentMeanFinal)
    expect(recentMeanFinal).toBeLessThan(previousFinal)
    expect(previousConstructionCheckpoint - currentConstructionCheckpoint).toBeGreaterThanOrEqual(
      40,
    )
    expect(transcriptText).toContain('卡点主要在构建与质检等待段')
    expect(transcriptText).toContain('比最近 5 轮均值快 74 min')
    expect(transcriptText).toContain('比上一轮快 141 min')
    expect(transcriptText).toContain('检测与入库比最近 5 轮均值快')
  })

  it('keeps the substrate lot user question direct during approval waiting', () => {
    const thread = projects
      .find((project) => project.id === 'enzyme-synthesis-ops')
      ?.threads.find((item) => item.id === 'lims-flow-run')
    const substrateQuestion = thread?.transcript?.find(
      (turn) =>
        turn.role === 'user' &&
        turn.markdown?.includes('SUB-LOT-202606-A 这个底物批次'),
    )

    expect(substrateQuestion?.markdown).toBe(
      'SUB-LOT-202606-A 这个底物批次是什么状态？',
    )
    expect(substrateQuestion?.markdown).not.toContain('审批等待期间')
  })

  it('adds collapsed DAG progress snapshots after pipeline nodes complete', () => {
    const thread = projects
      .find((project) => project.id === 'enzyme-synthesis-ops')
      ?.threads.find((item) => item.id === 'lims-flow-run')
    const dagBlocks = thread?.transcript?.flatMap(
      (turn) =>
        turn.contentBlocks?.filter((block) => block.type === 'pipelineDag') ??
        [],
    )
    const progressDagBlocks = dagBlocks?.filter((block) => block.defaultCollapsed)

    expect(dagBlocks?.length).toBeGreaterThanOrEqual(10)
    expect(progressDagBlocks?.length).toBeGreaterThanOrEqual(9)
    expect(dagBlocks?.[0]?.defaultCollapsed).not.toBe(true)
    expect(progressDagBlocks?.every((block) => block.progressSummary)).toBe(true)
    expect(
      progressDagBlocks?.every((block) => block.completedNodeIds?.length),
    ).toBe(true)
    expect(progressDagBlocks?.map((block) => block.progressSummary)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('样本注册完成'),
        expect.stringContaining('工单包生成完成'),
        expect.stringContaining('结果包生成完成'),
      ]),
    )
  })

  it('shows collected output files inline in the LIMS thread transcript', () => {
    const thread = projects
      .find((project) => project.id === 'enzyme-synthesis-ops')
      ?.threads.find((item) => item.id === 'lims-flow-run')
    const fileBlocks = thread?.transcript?.flatMap(
      (turn) =>
        turn.contentBlocks?.filter((block) => block.type === 'projectFile') ??
        [],
    )
    const fileNames = fileBlocks?.map((block) => block.fileName)

    expect(fileNames).toEqual(
      expect.arrayContaining([
        'RUN-ENZ-SYN-20260604-001_input_package.md',
        'APPROVAL-run_start-20260604-0918.json',
        'WO-BUNDLE-ENZ-SYN-001.json',
        'CALLBACK-QC-204_summary.json',
        'CALLBACK-QC-204_activity_timeline.png',
        'ANOMALY-ENZ-SYN-20260604-001.md',
        'data_integrity_qc.png',
        'anomaly_distribution.png',
        'Enzyme_Synthesis_Result_Package.xlsx',
        'structured_readouts.json',
        'ops_efficiency_breakdown.png',
        'RUN-ENZ-SYN-20260604-001_efficiency_review.md',
      ]),
    )
    expect(fileBlocks?.length).toBeGreaterThanOrEqual(10)
    expect(
      fileBlocks?.every((block) =>
        block.location.startsWith('Enzyme Synthesis Ops / Runs / RUN-ENZ-SYN-20260604-001 /'),
      ),
    ).toBe(true)
  })

  it('exposes run-scoped object storage assets for the side window', () => {
    const files = buildThreadObjectStorageFiles('Enzyme Synthesis Ops', 'lims-flow-run')

    expect(files.length).toBeGreaterThanOrEqual(28)
    expect(files.length).toBeLessThanOrEqual(34)
    expect(new Set(files.map((file) => file.directory))).toEqual(
      new Set([
        'Runs/RUN-ENZ-SYN-20260604-001/inputs',
        'Runs/RUN-ENZ-SYN-20260604-001/approvals',
        'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
        'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
        'Runs/RUN-ENZ-SYN-20260604-001/qc',
        'Runs/RUN-ENZ-SYN-20260604-001/exceptions',
        'Runs/RUN-ENZ-SYN-20260604-001/results',
        'Runs/RUN-ENZ-SYN-20260604-001/analysis',
      ]),
    )
    expect(files[0].objectPath).toMatch(
      /^Enzyme Synthesis Ops\/Runs\/RUN-ENZ-SYN-20260604-001\//,
    )
    expect(files.map((file) => file.fileName)).toEqual(
      expect.arrayContaining([
        'RUN-ENZ-SYN-20260604-001_run_manifest.json',
        'RESOURCE-LOCK-ENZ-SYN-20260604.json',
        'WO-EXPRESS-20260604-102.md',
        'WO-PURIFY-20260604-103.md',
        'WO-INGEST-20260604-105.md',
        'CALLBACK-ASSAY-104.json',
        'CALLBACK-INGEST-105.json',
        'RESULT-RELEASE-MANIFEST-20260604.json',
      ]),
    )
    expect(files.some((file) => file.previewKind === 'markdown')).toBe(true)
    expect(files.some((file) => file.previewKind === 'json')).toBe(true)
    expect(files.some((file) => file.previewKind === 'image')).toBe(true)
    expect(files.some((file) => file.previewKind === 'unsupported')).toBe(true)
  })
})
