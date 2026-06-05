// @vitest-environment happy-dom

import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { projects } from '../data/mockData'
import type { PipelineDag } from '../data/mockCapabilities'
import type { ConversationBlock } from '../data/conversationTypes'
import type { DemoThread } from '../store/demoStoreLogic'
import ThreadWorkspace from './ThreadWorkspace'

const thread: DemoThread = {
  id: 'egfr-affinity',
  title: 'EGFR 抗体亲和力优化',
  lastActivityAt: 0,
  pinned: false,
  pinnedAt: null,
  archived: false,
  createdAt: 0,
  transcript: [],
  runInspector: {
    summary: {
      stage: '已完成干湿闭环',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 1,
      pendingCount: 0,
    },
    progress: [],
    outputs: [],
    approvals: [],
    capabilityRuns: [
      {
        id: 'read-baseline',
        commandName: '读取基线数据',
        summary: '读取项目文件并提取亲和力基线',
        duration: '12s',
        status: 'success',
        input: { file: 'EGFR_parent_antibody_baseline.xlsx' },
        output: { parentAntibody: 'EGFR-P0' },
        artifacts: [{ name: 'EGFR_parent_antibody_baseline.xlsx', kind: 'xlsx' }],
      },
    ],
  },
}

const noop = () => undefined

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('ThreadWorkspace', () => {
  it('renders enzyme experiment execution module blocks as atomic transcript cards', () => {
    const experimentThread: DemoThread = {
      ...thread,
      id: 'enzyme-experiment-execution',
      title: '酶库订单与实验执行',
      transcript: [
        {
          id: 'execution-modules',
          role: 'mainAgent',
          contentBlocks: [
            {
              type: 'designHandoffBrief',
              designPackage: 'ENZ-P0 设计交接包',
              libraryId: 'ENZ-LIB-20260602-048',
              parentEnzyme: 'ENZ-P0',
              variantRange: '48 个候选酶变体',
              executionConstraints: ['只执行小规模验证', '不自动进入下一轮设计'],
              forbiddenActions: ['不自动提交后续实验'],
              sourceFiles: ['ENZ-LIB-20260602-048_design_brief.md'],
            },
            {
              type: 'experimentOrderSummary',
              title: 'Experiment Order Draft',
              orderId: 'BM-LAB-ENZ-20260602-001',
              status: 'draft',
              reviewStatus: 'pending',
              projectId: 'industrial-enzyme-design',
              libraryId: 'ENZ-LIB-20260602-048',
              parentEnzyme: 'ENZ-P0',
              purpose: '验证 48 个候选酶在工业底物下的活性与稳定性',
              scopeLock: '仅执行确认后的读数面板',
              owner: '实验运营',
              createdAt: '2026-06-02 10:15',
              dueAt: '2026-06-10 18:00',
              rows: [
                { label: 'Assay panel', value: 'Activity, kinetics, pH, temperature' },
              ],
            },
            {
              type: 'sampleScopePanel',
              libraryId: 'ENZ-LIB-20260602-048',
              variantCount: 48,
              variantRange: 'ENZ-V001 至 ENZ-V048',
              controls: ['ENZ-P0 parent', 'heat-inactivated ENZ-P0'],
              replicatePlan: '2 biological replicates, duplicate readouts',
              sampleSource: 'Design Package and Project Files',
              exclusions: ['底物批次 QC 未通过样本不得进入活性测定'],
              lockedBy: '研发负责人',
            },
            {
              type: 'assayPanelTable',
              panelStatus: 'locked',
              sopReference: 'Enzyme_Assay_SOP_v3',
              assays: [
                {
                  name: 'Activity Assay',
                  purpose: '总体催化活性',
                  readout: 'Relative Activity (%)',
                  method: '96-well fluorogenic assay',
                  replicateCount: 2,
                  qcRule: 'Z-factor >= 0.6',
                },
              ],
            },
            {
              type: 'plateMapMini',
              plateMapId: 'PM-ENZ-20260602-001',
              plateCount: 2,
              dimensions: '96-well',
              wells: [
                { position: 'A1', label: 'ENZ-P0', group: 'Control' },
                { position: 'B1', label: 'ENZ-V001', group: 'Active-site tuning' },
              ],
              legend: [
                { label: 'Control', color: 'teal' },
                { label: 'Active-site tuning', color: 'orange' },
              ],
              locked: true,
            },
            {
              type: 'sampleInventoryLink',
              sampleBatchId: 'SB-ENZ-20260602-004',
              inventoryStatus: 'ready',
              storageCondition: '4 C short hold; -80 C backup aliquot',
              aliquotPlan: '每个变体 2 管工作液 + 1 管备份',
              plateLinkRecord: 'PLATE-LINK-ENZ-048',
              missingItems: [],
            },
            {
              type: 'materialSopReadiness',
              substrateLot: 'SUB-LOT-202606',
              buffer: '50 mM Tris pH 8.0, 300 mM NaCl',
              sopVersion: 'Enzyme_Assay_SOP_v3',
              deviceType: 'Plate reader',
              deviceId: 'PR-3107',
              labLocation: 'Lab B / Enzyme bench 03',
              experimentRoute: 'sample-prep -> assay -> raw-data-return',
              workflowTemplate: 'SmartExperiment enzyme small-scale assay',
              readinessChecks: ['底物放行', '设备校准有效', 'SOP 生效'],
            },
            {
              type: 'approvalGateCard',
              title: '订单提交审批',
              approvalType: 'experimentOrder',
              status: 'pending',
              approver: '实验负责人',
              details: [
                { label: '发起人', value: 'ProteinDesign Agent' },
                { label: '审批对象', value: 'BM-LAB-ENZ-20260602-001' },
                { label: '发起时间', value: '2026-06-02 11:01' },
                { label: '当前动作', value: '发起审批，不创建 Experiment Task' },
              ],
              checklist: ['订单边界资料已提交', '样本与板图资料已提交'],
              riskSummary: '审批发起资料已提交，当前还没有创建实验任务。',
              decision: '审批流程已发起，等待审批人处理',
            },
            {
              type: 'approvalGateCard',
              title: '订单提交审批',
              approvalType: 'experimentOrder',
              status: 'approved',
              approver: '实验负责人',
              decidedAt: '2026-06-02 11:04',
              checklist: ['范围确认', '样本与板图确认', '异常处理策略确认'],
              riskSummary: '提交后仅创建本轮实验任务，不触发下一轮设计。',
              decision: '批准提交 BM-LAB-ENZ-20260602-001',
            },
            {
              type: 'executionTaskStatus',
              taskId: 'EXP-TASK-ENZ-20260602-001',
              orderId: 'BM-LAB-ENZ-20260602-001',
              croRef: 'SmartExperiment / internal execution',
              stage: 'result-returned',
              status: 'completed',
              owner: '实验运营',
              startedAt: '2026-06-03 09:10',
              completedAt: '2026-06-04 15:20',
              records: ['Sample prep complete', 'Assay run complete', 'Result package returned'],
            },
            {
              type: 'runLogTable',
              logId: 'RUNLOG-ENZ-20260604-001',
              taskId: 'EXP-TASK-ENZ-20260602-001',
              rows: [
                {
                  time: '2026-06-04 10:40',
                  actor: 'SmartExperiment',
                  system: 'PlateReader',
                  event: 'Activity plate read complete',
                  recordId: 'REC-ACT-001',
                  status: 'done',
                },
              ],
            },
            {
              type: 'anomalyReviewTable',
              anomalyLogId: 'ANOM-ENZ-20260604-001',
              policy: '原始读数保留，异常孔进入人工复核，不自动剔除。',
              rows: [
                {
                  sampleId: 'ENZ-V017',
                  well: 'G8',
                  anomalyType: 'edge-effect',
                  rawReadingPreserved: 'yes',
                  autoExcluded: 'no',
                  reviewOwner: '实验负责人',
                  status: 'reviewed',
                },
              ],
            },
            {
              type: 'resultPackageChecklist',
              packageName: 'Enzyme_Experiment_Result_Package.xlsx',
              receivedAt: '2026-06-04 15:22',
              files: ['raw_activity.csv', 'plate_map.csv', 'anomaly_log.csv'],
              schemaChecks: ['样本 ID 对齐', '板位映射完整', '异常记录可追溯'],
              missingItems: [],
              archiveLocations: ['Project Files / Results', 'Operational Record Index'],
              readyForAnalysis: true,
            },
          ] satisfies ConversationBlock[],
        },
      ],
    }

    const html = renderToString(
      <ThreadWorkspace
        thread={experimentThread}
        projectName="Industrial Enzyme Design"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('ENZ-P0 设计交接包')
    expect(html).toContain('BM-LAB-ENZ-20260602-001')
    expect(html).toContain('ENZ-V001 至 ENZ-V048')
    expect(html).toContain('Activity Assay')
    expect(html).toContain('PM-ENZ-20260602-001')
    expect(html).toContain('SB-ENZ-20260602-004')
    expect(html).toContain('PR-3107')
    expect(html).toContain('PENDING')
    expect(html).toContain('发起时间')
    expect(html).toContain('2026-06-02 11:01')
    expect(html).toContain('APPROVED')
    expect(html).toContain('审批通过时间')
    expect(html).toContain('2026-06-02 11:04')
    expect(html).toContain('批准提交 BM-LAB-ENZ-20260602-001')
    expect(html).not.toContain('Decided at')
    expect(html).not.toContain('Approver')
    expect(html).toContain('EXP-TASK-ENZ-20260602-001')
    expect(html).toContain('RUNLOG-ENZ-20260604-001')
    expect(html).toContain('ANOM-ENZ-20260604-001')
    expect(html).toContain('Enzyme_Experiment_Result_Package.xlsx')
    expect(html).not.toContain('Enzyme Experiment Order Draft')
  })

  it('renders candidate evidence table blocks with configured enzyme columns', () => {
    const enzymeThread: DemoThread = {
      ...thread,
      id: 'enzyme-design',
      title: 'Enzyme design evidence',
      transcript: [
        {
          id: 'enzyme-candidates',
          role: 'mainAgent',
          contentBlocks: [
            {
              type: 'candidateEvidenceTable',
              title: 'Enzyme candidate evidence',
              columns: [
                { key: 'kcatKmProxy', label: 'kcat/Km proxy' },
                { key: 'tm', label: 'Tm' },
                { key: 'phWindow', label: 'pH window' },
              ],
              rows: [
                {
                  id: 'ENZ-MUT-021',
                  group: 'active-site loop',
                  evidence: {
                    kcatKmProxy: '+2.1x',
                    tm: '68 C',
                    phWindow: '6.5-8.0',
                  },
                  risk: 'medium',
                  rationale: 'Improves turnover proxy while preserving thermostability.',
                },
              ],
            },
          ],
        },
      ],
    }

    const html = renderToString(
      <ThreadWorkspace
        thread={enzymeThread}
        projectName="Enzyme Design"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('kcat/Km proxy')
    expect(html).toContain('Tm')
    expect(html).toContain('pH window')
    expect(html).toContain('ENZ-MUT-021')
  })

  it('renders pipeline DAG blocks as structured transcript content', () => {
    const substrateDag: PipelineDag = {
      nodes: [
        {
          id: 'substrate-confirmation',
          kind: 'input',
          subtype: 'data',
          title: '底物与反应体系确认',
          shortTitle: '底物确认',
          description: '确认底物、缓冲体系和目标反应窗口。',
          inputs: ['候选底物', '反应条件'],
          outputs: ['确认后的底物清单'],
          prerequisites: ['项目目标已确认'],
          layout: { row: 0, column: 0 },
        },
        {
          id: 'human-gate',
          kind: 'human-gate',
          subtype: 'data',
          title: 'Human Gate: 反应体系确认',
          shortTitle: 'Human Gate',
          description: '负责人确认底物与反应体系后继续执行。',
          inputs: ['确认后的底物清单'],
          outputs: ['人工确认记录'],
          prerequisites: ['底物确认完成'],
          control: {
            kind: 'human-confirmation',
            summary: '研发负责人确认底物与反应体系。',
          },
          layout: { row: 1, column: 0 },
        },
        {
          id: 'execution',
          kind: 'operation',
          subtype: 'lab-operation',
          title: '反应执行',
          shortTitle: '反应执行',
          description: '执行小规模反应并记录原始数据。',
          inputs: ['人工确认记录'],
          outputs: ['原始反应数据'],
          prerequisites: ['Human Gate 已通过'],
          layout: { row: 2, column: 0 },
        },
      ],
      edges: [
        {
          from: 'substrate-confirmation',
          to: 'human-gate',
          label: '待确认',
        },
        { from: 'human-gate', to: 'execution', label: '通过' },
      ],
    }
    const pipelineThread: DemoThread = {
      ...thread,
      id: 'enzyme-pipeline',
      title: 'Enzyme pipeline build',
      transcript: [
        {
          id: 'pipeline-dag',
          role: 'mainAgent',
          contentBlocks: [
            {
              type: 'pipelineDag',
              title: '底物与反应体系确认',
              version: 'v0.2',
              status: 'validated',
              summary: '3 个节点串联输入确认、人工门禁和执行步骤。',
              dag: substrateDag,
            },
          ],
        },
      ],
    }

    const html = renderToString(
      <ThreadWorkspace
        thread={pipelineThread}
        projectName="Enzyme Design"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('DAG v0.2')
    expect(html).toContain('validated')
    expect(html).toContain('底物与反应体系确认')
    expect(html).toContain('Human Gate')
    expect(html).not.toContain('<img')
  })

  it('renders the compact run info action while closed', () => {
    const html = renderToString(
      <ThreadWorkspace
        thread={thread}
        projectName="Antibody Optimization"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('aria-label="打开运行信息"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('运行信息')
    expect(html).not.toContain('id="thread-run-inspector"')
  })

  it('renders the run inspector panel when open', () => {
    const html = renderToString(
      <ThreadWorkspace
        thread={thread}
        projectName="Antibody Optimization"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('aria-label="关闭运行信息"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('id="thread-run-inspector"')
    expect(html).toContain('已完成干湿闭环')
  })

  it('opens the workspace side window from a dedicated header button', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      initialRunInspectorOpen: true,
    })

    expect(container.querySelector('#thread-run-inspector')).not.toBeNull()

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await waitForTimers()

    expect(container.querySelector('#thread-run-inspector')).toBeNull()
    expect(container.querySelector('.workspace-side-window')).not.toBeNull()
    expect(getButton(container, '文件')).toBeTruthy()
    expect(getButton(container, '侧边聊天')).toBeTruthy()
    expect(container.textContent).toContain('浏览项目文件')
    expect(container.textContent).toContain('发起侧边对话')

    root.unmount()
  })

  it('toggles the workspace side window from the dedicated header button', async () => {
    const { container, root } = renderInteractiveThreadWorkspace()

    const sideWindowButton = container.querySelector<HTMLButtonElement>(
      '.thread-workspace__side-window-button',
    )
    expect(sideWindowButton).not.toBeNull()
    expect(sideWindowButton?.getAttribute('aria-label')).toBe('打开侧窗')

    await act(async () => {
      sideWindowButton?.click()
    })

    expect(container.querySelector('.workspace-side-window')).not.toBeNull()
    expect(sideWindowButton?.getAttribute('aria-label')).toBe('关闭侧窗')

    await act(async () => {
      sideWindowButton?.click()
    })
    await waitForTimers()

    expect(container.querySelector('.workspace-side-window')).toBeNull()
    expect(sideWindowButton?.getAttribute('aria-label')).toBe('打开侧窗')

    root.unmount()
  })

  it('renders file mode with an empty preview and right-side object tree', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'enzyme-experiment-execution',
        title: '酶库订单与实验执行',
      },
      projectName: 'Industrial Enzyme Design',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })

    expect(container.querySelector('.workspace-file-browser')).not.toBeNull()
    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      '打开文件',
    )
    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      '从右侧对象树选择文件',
    )
    expect(container.querySelector('.workspace-file-tree')).not.toBeNull()
    expect(container.textContent).toContain('Industrial Enzyme Design /')
    expect(container.textContent).toContain('Design')
    expect(container.textContent).toContain('Execution')
    expect(container.querySelector('.workspace-file-tree')?.textContent).toContain(
      'BM-LAB-ENZ-20260602-001_order_summary.md',
    )
    expect(container.querySelector('.workspace-file-tree')?.textContent).not.toContain(
      'Current Thread · 已保存',
    )
    expect(container.querySelector('.workspace-file-tree')?.textContent).not.toContain(
      'Industrial Enzyme Design/Execution/BM-LAB-ENZ-20260602-001_order_summary.md',
    )

    root.unmount()
  })

  it('renders LIMS run-scoped object storage directories in the side window file tree', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'lims-flow-run',
        title: 'LIMS 流程运行',
      },
      projectName: 'Enzyme Synthesis Ops',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })

    const fileTreeText = container.querySelector('.workspace-file-tree')?.textContent

    expect(fileTreeText).toContain('Runs/RUN-ENZ-SYN-20260604-001/inputs')
    expect(fileTreeText).toContain('RUN-ENZ-SYN-20260604-001_input_package.md')
    expect(fileTreeText).toContain('Runs/RUN-ENZ-SYN-20260604-001/work_orders')
    expect(fileTreeText).toContain('WO-BUNDLE-ENZ-SYN-001.json')
    expect(fileTreeText).toContain('Runs/RUN-ENZ-SYN-20260604-001/qc')
    expect(fileTreeText).toContain('construction_qc_summary.md')
    expect(fileTreeText).toContain('Runs/RUN-ENZ-SYN-20260604-001/analysis')
    expect(fileTreeText).toContain('RUN-ENZ-SYN-20260604-001_efficiency_review.md')
    expect(fileTreeText).not.toContain('Enzyme Synthesis Ops/Runs/')

    root.unmount()
  })

  it('renders markdown json and image file previews from the side window', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'enzyme-experiment-execution',
        title: '酶库订单与实验执行',
      },
      projectName: 'Industrial Enzyme Design',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })
    await act(async () => {
      getButton(container, 'BM-LAB-ENZ-20260602-001_order_summary.md').click()
    })

    expect(container.querySelector('.workspace-side-window__path')?.textContent).toBe(
      'Industrial Enzyme Design / BM-LAB-ENZ-20260602-001_order_summary.md',
    )
    expect(container.querySelector('.workspace-file-preview__header')).toBeNull()
    expect(container.querySelector('.workspace-file-preview__kind')).toBeNull()
    expect(container.querySelector('.workspace-file-preview')?.textContent).not.toContain(
      'Industrial Enzyme Design/Execution/BM-LAB-ENZ-20260602-001_order_summary.md',
    )
    expect(container.querySelector('.workspace-file-preview h1')?.textContent).toContain(
      'BM-LAB-ENZ-20260602-001 Order Summary',
    )
    expect(container.querySelector('.workspace-file-preview table')).not.toBeNull()

    await act(async () => {
      getButton(container, 'BM-LAB-ENZ-20260602-001_order_payload.json').click()
    })

    expect(container.querySelector('.workspace-file-preview__json-key')?.textContent).toContain(
      '"orderId"',
    )
    expect(container.querySelector('.workspace-file-preview__json-string')?.textContent).toContain(
      '"BM-LAB-ENZ-20260602-001"',
    )
    expect(container.querySelector('.workspace-side-window__path')?.textContent).toBe(
      'Industrial Enzyme Design / BM-LAB-ENZ-20260602-001_order_payload.json',
    )

    await act(async () => {
      getButton(container, 'enzyme-experiment-record-summary.png').click()
    })

    expect(container.querySelector('.workspace-file-preview img')).not.toBeNull()
    expect(container.querySelector('.workspace-file-preview figcaption')).toBeNull()
    expect(container.querySelector('.workspace-side-window__path')?.textContent).toBe(
      'Industrial Enzyme Design / enzyme-experiment-record-summary.png',
    )

    root.unmount()
  })

  it('renders CSV and Excel mock files as spreadsheet previews', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'enzyme-experiment-execution',
        title: '酶库订单与实验执行',
      },
      projectName: 'Industrial Enzyme Design',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })
    await act(async () => {
      getButton(container, 'Enzyme_Experiment_Result_Package.xlsx').click()
    })

    let spreadsheetPreview = container.querySelector('.workspace-file-preview__sheet')
    expect(spreadsheetPreview).not.toBeNull()
    expect(spreadsheetPreview?.textContent).toContain(
      'Enzyme_Experiment_Result_Package.xlsx',
    )
    expect(spreadsheetPreview?.textContent).toContain('Sheet: Summary')
    expect(spreadsheetPreview?.textContent).toContain('ENZ-MUT-017')
    expect(spreadsheetPreview?.textContent).toContain('activity_pct')
    expect(spreadsheetPreview?.textContent).not.toContain('当前版本暂不支持内嵌预览')

    await act(async () => {
      getButton(container, 'ENZ_raw_readout_summary.csv').click()
    })

    spreadsheetPreview = container.querySelector('.workspace-file-preview__sheet')
    expect(spreadsheetPreview).not.toBeNull()
    expect(spreadsheetPreview?.textContent).toContain('ENZ_raw_readout_summary.csv')
    expect(spreadsheetPreview?.textContent).toContain('Sheet: CSV preview')
    expect(spreadsheetPreview?.textContent).toContain('well')
    expect(spreadsheetPreview?.textContent).toContain('A03')
    expect(spreadsheetPreview?.textContent).not.toContain('当前版本暂不支持内嵌预览')

    await act(async () => {
      getButton(container, 'approval_decision_record.pdf').click()
    })

    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      '当前版本暂不支持内嵌预览',
    )
    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      'Industrial Enzyme Design/Reports/approval_decision_record.pdf',
    )

    await act(async () => {
      getButton(container, 'ELN-ENZ-20260602-117_attachment_bundle.zip').click()
    })

    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      '当前版本暂不支持内嵌预览',
    )
    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      'Industrial Enzyme Design/ELN/ELN-ENZ-20260602-117_attachment_bundle.zip',
    )

    root.unmount()
  })

  it('renders the LIMS sample manifest workbook as a compact spreadsheet preview', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'lims-flow-run',
        title: 'LIMS 流程运行',
      },
      projectName: 'Enzyme Synthesis Ops',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })
    await act(async () => {
      getButton(container, 'ENZ-SYN-BATCH-048_sample_manifest.xlsx').click()
    })

    const spreadsheetPreview = container.querySelector('.workspace-file-preview__sheet')
    expect(spreadsheetPreview).not.toBeNull()
    expect(spreadsheetPreview?.textContent).toContain(
      'ENZ-SYN-BATCH-048_sample_manifest.xlsx',
    )
    expect(spreadsheetPreview?.textContent).toContain('Sheet: Sample Manifest')
    expect(spreadsheetPreview?.textContent).toContain('ENZ-SYN-019')
    expect(spreadsheetPreview?.textContent).toContain('样本登记')
    expect(spreadsheetPreview?.textContent).not.toContain('当前版本暂不支持内嵌预览')

    root.unmount()
  })

  it('opens a clicked transcript file in the side window with the file tree hidden', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: getProjectThreadFixture(
        'enzyme-synthesis-ops',
        'lims-flow-run',
      ),
      projectName: 'Enzyme Synthesis Ops',
    })

    expect(container.querySelector('.workspace-side-window')).toBeNull()

    await act(async () => {
      getButton(container, 'RUN-ENZ-SYN-20260604-001_input_package.md').click()
    })

    expect(container.querySelector('.workspace-side-window')).not.toBeNull()
    expect(container.querySelector('.workspace-file-browser')).not.toBeNull()
    expect(container.querySelector('.workspace-file-browser--tree-collapsed')).not.toBeNull()
    expect(container.querySelector('.workspace-file-tree')).toBeNull()
    expect(container.querySelector('.workspace-side-window__path')?.textContent).toBe(
      'Enzyme Synthesis Ops / RUN-ENZ-SYN-20260604-001_input_package.md',
    )
    expect(
      container.querySelector('.workspace-side-window__path button[aria-label="展开文件树"]'),
    ).not.toBeNull()
    expect(container.querySelector('.workspace-file-preview')?.textContent).toContain(
      'RUN-ENZ-SYN-20260604-001 Input Package',
    )

    root.unmount()
  })

  it('filters and collapses the side window file tree', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      threadOverride: {
        ...thread,
        id: 'enzyme-experiment-execution',
        title: '酶库订单与实验执行',
      },
      projectName: 'Industrial Enzyme Design',
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '文件').click()
    })

    const searchInput = container.querySelector<HTMLInputElement>(
      'input[aria-label="筛选文件"]',
    )
    expect(searchInput).not.toBeNull()

    await act(async () => {
      searchInput!.value = 'lab owner'
      searchInput!.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(container.textContent).toContain('Enzyme_Assay_SOP_v3.md')
    expect(container.textContent).not.toContain(
      'BM-LAB-ENZ-20260602-001_order_summary.md',
    )

    await act(async () => {
      searchInput!.value = 'not-a-real-file'
      searchInput!.dispatchEvent(new Event('input', { bubbles: true }))
    })
    expect(container.textContent).toContain('没有匹配的文件')

    await act(async () => {
      getButton(container, '收起文件树').click()
    })
    expect(container.querySelector('.workspace-file-browser--tree-collapsed')).not.toBeNull()
    expect(container.querySelector('.workspace-file-tree')).toBeNull()
    expect(
      container.querySelector('.workspace-side-window__path button[aria-label="展开文件树"]'),
    ).not.toBeNull()

    await act(async () => {
      getButton(container, '展开文件树').click()
    })

    expect(container.querySelector('.workspace-file-tree')).not.toBeNull()

    root.unmount()
  })

  it('renders side chat as a disabled empty state', async () => {
    const { container, root } = renderInteractiveThreadWorkspace()

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    await act(async () => {
      getButton(container, '侧边聊天').click()
    })

    const input = container.querySelector<HTMLInputElement>(
      'input[placeholder="侧边聊天将在后续接入"]',
    )

    expect(container.querySelector('.workspace-side-chat-placeholder')).not.toBeNull()
    expect(input).not.toBeNull()
    expect(input?.disabled).toBe(true)
    expect(container.textContent).not.toContain('Lab Owner')

    root.unmount()
  })

  it('restores the previous run inspector state when the side window closes', async () => {
    const { container, root } = renderInteractiveThreadWorkspace({
      initialRunInspectorOpen: true,
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    expect(container.querySelector('#thread-run-inspector')).toBeNull()

    await act(async () => {
      getButton(container, '关闭侧窗').click()
    })
    await waitForTimers()

    expect(container.querySelector('.workspace-side-window')).toBeNull()
    expect(container.querySelector('#thread-run-inspector')).not.toBeNull()

    root.unmount()
  })

  it('does not restore a previous thread run inspector after switching threads inside an open side window', async () => {
    const { container, root } = renderSwitchingThreadWorkspace()

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    expect(container.querySelector('#thread-run-inspector')).toBeNull()

    await act(async () => {
      getButton(container, '切换线程').click()
    })
    await act(async () => {
      getButton(container, '关闭侧窗').click()
    })
    await waitForTimers()

    expect(container.textContent).toContain('结果解释与下一轮建议')
    expect(container.querySelector('#thread-run-inspector')).toBeNull()

    root.unmount()
  })

  it('opens run info when the user clicks it while the side window is open', async () => {
    const { container, root } = renderInteractiveThreadWorkspace()

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })
    expect(container.querySelector('.workspace-side-window')).not.toBeNull()

    await act(async () => {
      getButton(container, '打开运行信息').click()
    })

    expect(container.querySelector('.workspace-side-window')).toBeNull()
    expect(container.querySelector('#thread-run-inspector')).not.toBeNull()

    root.unmount()
  })

  it('closes the side window once when Escape is pressed in drawer mode', async () => {
    const closeCalls: boolean[] = []
    const { container, root } = renderInteractiveThreadWorkspace({
      onRunInspectorChange: (open) => closeCalls.push(open),
    })

    await act(async () => {
      getButton(container, '打开侧窗').click()
    })

    const panel = container.querySelector<HTMLElement>('#thread-workspace-side-window')
    expect(panel).not.toBeNull()

    await act(async () => {
      panel?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    await waitForTimers()

    expect(container.querySelector('.workspace-side-window')).toBeNull()
    expect(closeCalls).toEqual([false])

    root.unmount()
  })

  it('keeps keyboard focus inside the run inspector drawer and restores it on close', async () => {
    const { container, root } = renderInteractiveThreadWorkspace()

    const runInfoButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="打开运行信息"]',
    )
    expect(runInfoButton).not.toBeNull()

    await act(async () => {
      runInfoButton?.click()
    })
    await waitForTimers()

    const panel = container.querySelector<HTMLElement>('#thread-run-inspector')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(document.activeElement).toBe(panel)

    const focusableButtons = Array.from(
      panel?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
    )
    expect(focusableButtons.length).toBeGreaterThan(0)

    await act(async () => {
      panel?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(document.activeElement).toBe(focusableButtons.at(-1))

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(document.activeElement).toBe(focusableButtons[0])

    await act(async () => {
      panel?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    await waitForTimers()

    expect(container.querySelector('#thread-run-inspector')).toBeNull()
    expect(document.activeElement).toBe(
      container.querySelector('button[aria-label="打开运行信息"]'),
    )

    root.unmount()
  })

  it('opens attachment actions from the thread composer plus button', () => {
    const notifications: string[] = []
    const { container, root } = renderInteractiveThreadWorkspace({
      onNotify: (message) => notifications.push(message),
    })

    act(() => {
      getButton(container, 'Add context').click()
    })

    expect(container.querySelector('.attachment-menu')).not.toBeNull()
    expect(getButton(container, '从资产添加')).toBeTruthy()
    expect(getButton(container, '上传文件或图片')).toBeTruthy()
    expect(container.textContent).not.toContain('附件上传会进入当前项目文件区')

    act(() => {
      getButton(container, '上传文件或图片').click()
    })

    expect(container.querySelector('.attachment-menu')).toBeNull()
    expect(notifications).toContain('上传文件或图片将在后续 Demo 中展开')

    root.unmount()
  })
})

function renderInteractiveThreadWorkspace({
  onNotify = noop,
  onRunInspectorChange,
  initialRunInspectorOpen = false,
  projectName = 'Antibody Optimization',
  threadOverride = thread,
}: {
  onNotify?: (message: string) => void
  onRunInspectorChange?: (open: boolean) => void
  initialRunInspectorOpen?: boolean
  projectName?: string
  threadOverride?: DemoThread
} = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  function Harness() {
    const [open, setOpen] = useState(initialRunInspectorOpen)

    function handleRunInspectorChange(nextOpen: boolean) {
      onRunInspectorChange?.(nextOpen)
      setOpen(nextOpen)
    }

    return (
      <ThreadWorkspace
        thread={threadOverride}
        projectName={projectName}
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={onNotify}
        runInspectorOpen={open}
        onRunInspectorOpenChange={handleRunInspectorChange}
      />
    )
  }

  act(() => {
    root.render(<Harness />)
  })

  return { container, root }
}

function getProjectThreadFixture(projectId: string, threadId: string): DemoThread {
  const sourceThread = projects
    .find((project) => project.id === projectId)
    ?.threads.find((item) => item.id === threadId)

  if (!sourceThread) {
    throw new Error(`Missing thread fixture: ${projectId}/${threadId}`)
  }

  return {
    ...thread,
    id: sourceThread.id,
    title: sourceThread.title,
    transcript: sourceThread.transcript ?? [],
    runInspector: sourceThread.runInspector,
  }
}

function renderSwitchingThreadWorkspace() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const firstThread: DemoThread = {
    ...thread,
    id: 'enzyme-experiment-execution',
    title: '酶库订单与实验执行',
  }
  const secondThread: DemoThread = {
    ...thread,
    id: 'enzyme-analysis-iteration',
    title: '结果解释与下一轮建议',
  }

  function Harness() {
    const [currentThread, setCurrentThread] = useState(firstThread)
    const [open, setOpen] = useState(true)

    return (
      <>
        <button type="button" onClick={() => setCurrentThread(secondThread)}>
          切换线程
        </button>
        <ThreadWorkspace
          thread={currentThread}
          projectName="Industrial Enzyme Design"
          draft=""
          onDraftChange={noop}
          onSubmit={noop}
          onRenameThread={noop}
          onArchiveThread={noop}
          onDeleteThread={noop}
          onNotify={noop}
          runInspectorOpen={open}
          onRunInspectorOpenChange={setOpen}
        />
      </>
    )
  }

  act(() => {
    root.render(<Harness />)
  })

  return { container, root }
}

function waitForTimers() {
  return act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0)
    })
  })
}

function findButton(container: HTMLElement, name: string) {
  return Array.from(container.querySelectorAll('button')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name,
  )
}

function getButton(container: HTMLElement, name: string) {
  const button = findButton(container, name)

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}
