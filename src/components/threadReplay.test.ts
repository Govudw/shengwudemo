import { describe, expect, it } from 'vitest'
import type {
  ConversationBlock,
  ConversationTurn,
  RunInspectorData,
} from '../data/conversationTypes'
import { enzymeSynthesisLimsDag, enzymeSynthesisOpsThreads } from '../data/enzymeSynthesisOpsMockData'
import { pipelineBuildThreads } from '../data/pipelineBuildMockData'
import {
  buildThreadReplaySteps,
  deriveReplayRunInspector,
  deriveReplayTranscript,
  parseMarkdownSegments,
  serializeMarkdownSegments,
} from './threadReplay'
import type { ThreadReplayStep } from './threadReplay'

type PipelineDagReplayStep = Extract<ThreadReplayStep, { kind: 'block' }> & {
  block: Extract<ConversationBlock, { type: 'pipelineDag' }>
}

const projectFileBlock: Extract<ConversationBlock, { type: 'projectFile' }> = {
  type: 'projectFile',
  fileName: 'input_package.json',
  fileKind: 'json',
  location: 'Runs/RUN-001/inputs',
  note: 'Locked input package.',
}

const capabilityRunBlock: Extract<
  ConversationBlock,
  { type: 'capabilityRunReplay' }
> = {
  type: 'capabilityRunReplay',
  commandName: 'PipelineInputParser.normalize',
  status: 'success',
  summary: 'Normalized pipeline inputs.',
  defaultCollapsed: true,
  input: { runId: 'RUN-001' },
  output: { missingFields: 0 },
  duration: '18s',
}

const approvalGateBlock: Extract<ConversationBlock, { type: 'approvalGateCard' }> = {
  type: 'approvalGateCard',
  title: 'Run start approval',
  approvalType: 'run_start',
  status: 'approved',
  approver: 'Lab Owner',
  decidedAt: '2026-06-04 09:18',
  checklist: ['Input package complete'],
  riskSummary: 'No open startup risk.',
  decision: 'Approved',
}

const humanConfirmationBlock: Extract<
  ConversationBlock,
  { type: 'humanConfirmation' }
> = {
  type: 'humanConfirmation',
  title: 'Confirm scope',
  confirmedBy: 'Project Lead',
  confirmedAt: '2026-06-04 08:55',
  decision: 'Scope is locked.',
}

const pipelineDagBlock: Extract<ConversationBlock, { type: 'pipelineDag' }> = {
  type: 'pipelineDag',
  title: 'Pipeline DAG',
  version: 'v0.1',
  status: 'validated',
  summary: 'Startup DAG progress.',
  dag: { nodes: [], edges: [] },
  completedNodeIds: ['load-input', 'qc-review'],
  activeNodeId: 'publish-results',
}

const trailingElapsedBlock: Extract<
  ConversationBlock,
  { type: 'elapsedWorkReplay' }
> = {
  type: 'elapsedWorkReplay',
  target: 'Archive run',
  elapsed: '12s',
  status: 'completed',
  summary: 'Archived run metadata.',
}

const replayTurns: ConversationTurn[] = [
  {
    id: 'turn-1',
    role: 'user',
    markdown: 'First paragraph.\n\nSecond paragraph.',
    contentBlocks: [projectFileBlock, capabilityRunBlock],
  },
]

const inspectorTurns: ConversationTurn[] = [
  {
    id: 'inspector-turn',
    role: 'mainAgent',
    markdown: 'Starting run.',
    contentBlocks: [
      capabilityRunBlock,
      projectFileBlock,
      approvalGateBlock,
      humanConfirmationBlock,
      pipelineDagBlock,
      trailingElapsedBlock,
    ],
  },
]

const fullInspector: RunInspectorData = {
  summary: {
    stage: 'Pipeline execution',
    status: 'completed',
    completedSteps: 4,
    totalSteps: 4,
    outputCount: 1,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'load-input',
      title: 'Load input',
      status: 'done',
    },
    {
      id: 'qc-review',
      title: 'QC review',
      status: 'done',
    },
    {
      id: 'publish-results',
      title: 'Publish results',
      status: 'done',
    },
    {
      id: 'archive-run',
      title: 'Archive run',
      status: 'done',
    },
  ],
  outputs: [
    {
      id: 'input-package',
      name: 'input_package.json',
      kind: 'projectFile',
      location: 'Runs/RUN-001/inputs',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'run-start',
      kind: 'approvalRequest',
      title: 'run_start',
      status: 'approved',
      actor: 'Lab Owner',
      decidedAt: '2026-06-04 09:18',
    },
    {
      id: 'scope-confirmation',
      kind: 'humanConfirmation',
      title: 'Confirm scope',
      status: 'confirmed',
      actor: 'Project Lead',
      decidedAt: '2026-06-04 08:55',
    },
  ],
  capabilityRuns: [
    {
      id: 'normalize-inputs',
      commandName: 'PipelineInputParser.normalize',
      status: 'success',
      summary: 'Normalized pipeline inputs.',
      duration: '18s',
      input: { runId: 'RUN-001' },
      output: { missingFields: 0 },
    },
  ],
}

describe('buildThreadReplaySteps', () => {
  it('builds stable sequential steps for markdown segments and blocks', () => {
    const steps = buildThreadReplaySteps(replayTurns)

    expect(steps).toEqual([
      {
        id: 'turn-1:markdown:0',
        turnId: 'turn-1',
        role: 'user',
        kind: 'markdown',
        markdownSegmentIndex: 0,
      },
      {
        id: 'turn-1:markdown:1',
        turnId: 'turn-1',
        role: 'user',
        kind: 'markdown',
        markdownSegmentIndex: 1,
      },
      {
        id: 'turn-1:block:0',
        turnId: 'turn-1',
        role: 'user',
        kind: 'block',
        blockIndex: 0,
        block: projectFileBlock,
      },
      {
        id: 'turn-1:block:1',
        turnId: 'turn-1',
        role: 'user',
        kind: 'block',
        blockIndex: 1,
        block: capabilityRunBlock,
      },
    ])
  })

  it('treats paragraphs, lists, tables, and code fences as display segments', () => {
    const turns: ConversationTurn[] = [
      {
        id: 'mixed-markdown',
        role: 'mainAgent',
        markdown: [
          'Opening paragraph.',
          '',
          '- first',
          '- second',
          '',
          '| Name | Score |',
          '| --- | ---: |',
          '| A | 1 |',
          '',
          '```',
          'const value = 1',
          '```',
        ].join('\n'),
      },
    ]

    const steps = buildThreadReplaySteps(turns)

    expect(steps).toHaveLength(4)
    expect(steps.map((step) => step.kind)).toEqual([
      'markdown',
      'markdown',
      'markdown',
      'markdown',
    ])
    expect(steps.map((step) => step.id)).toEqual([
      'mixed-markdown:markdown:0',
      'mixed-markdown:markdown:1',
      'mixed-markdown:markdown:2',
      'mixed-markdown:markdown:3',
    ])
  })

  it('creates a placeholder step for turns with no visible content', () => {
    const steps = buildThreadReplaySteps([
      {
        id: 'empty-turn',
        role: 'mainAgent',
      },
    ])

    expect(steps).toEqual([
      {
        id: 'empty-turn:turn',
        turnId: 'empty-turn',
        role: 'mainAgent',
        kind: 'turn',
      },
    ])
  })
})

describe('markdown segment helpers', () => {
  it('exports stable parse and serialize helpers for transcript rendering', () => {
    const markdown = [
      'Opening paragraph.',
      '',
      '- first',
      '- second',
      '',
      '| Name | Score |',
      '| --- | ---: |',
      '| A | 1 |',
      '',
      '```',
      'const value = 1',
      '```',
    ].join('\n')

    const segments = parseMarkdownSegments(markdown)

    expect(segments).toEqual([
      {
        type: 'paragraph',
        text: 'Opening paragraph.',
        raw: 'Opening paragraph.',
      },
      {
        type: 'list',
        ordered: false,
        items: ['first', 'second'],
        raw: '- first\n- second',
      },
      {
        type: 'table',
        headers: ['Name', 'Score'],
        alignments: ['left', 'right'],
        rows: [['A', '1']],
        raw: '| Name | Score |\n| --- | ---: |\n| A | 1 |',
      },
      {
        type: 'code',
        code: 'const value = 1',
        raw: '```\nconst value = 1\n```',
      },
    ])
    expect(serializeMarkdownSegments(segments)).toBe(markdown)
  })

  it('preserves raw markdown for fenced languages, numbering, indentation, and table formatting', () => {
    const markdown = [
      'Opening paragraph',
      'with preserved line break.',
      '',
      '```ts',
      'const value = 1',
      '```',
      '',
      '3. third',
      '   1. nested',
      '4. fourth',
      '',
      '| Name | Score |',
      '|:--- | ---:|',
      '| A | 1 |',
    ].join('\n')

    const segments = parseMarkdownSegments(markdown)

    expect(segments.map((segment) => segment.raw)).toEqual([
      'Opening paragraph\nwith preserved line break.',
      '```ts\nconst value = 1\n```',
      '3. third\n   1. nested\n4. fourth',
      '| Name | Score |\n|:--- | ---:|\n| A | 1 |',
    ])
    expect(serializeMarkdownSegments(segments)).toBe(markdown)
  })
})

describe('deriveReplayTranscript', () => {
  const steps = buildThreadReplaySteps(replayTurns)

  it('returns no visible turns when visibleCount is zero', () => {
    expect(deriveReplayTranscript(replayTurns, steps, 0)).toEqual([])
  })

  it('returns only visible markdown segments for partial markdown', () => {
    expect(deriveReplayTranscript(replayTurns, steps, 1)).toEqual([
      {
        id: 'turn-1',
        role: 'user',
        markdown: 'First paragraph.',
      },
    ])
  })

  it('reveals visible blocks in their original order', () => {
    expect(deriveReplayTranscript(replayTurns, steps, 3)).toEqual([
      {
        id: 'turn-1',
        role: 'user',
        markdown: 'First paragraph.\n\nSecond paragraph.',
        contentBlocks: [projectFileBlock],
      },
    ])
  })

  it('returns the original full transcript when all steps are visible', () => {
    expect(deriveReplayTranscript(replayTurns, steps, steps.length)).toBe(replayTurns)
    expect(deriveReplayTranscript(replayTurns, steps, steps.length + 2)).toBe(
      replayTurns,
    )
  })

  it('filters placeholder-only turns when final replay is visible', () => {
    const turns: ConversationTurn[] = [
      {
        id: 'empty-turn',
        role: 'mainAgent',
      },
      {
        id: 'visible-turn',
        role: 'user',
        markdown: 'Visible message.',
      },
    ]
    const placeholderSteps = buildThreadReplaySteps(turns)

    expect(
      deriveReplayTranscript(turns, placeholderSteps, placeholderSteps.length),
    ).toEqual([
      {
        id: 'visible-turn',
        role: 'user',
        markdown: 'Visible message.',
      },
    ])
  })

  it('does not render placeholder-only turns in partial transcripts', () => {
    const turns: ConversationTurn[] = [
      {
        id: 'empty-turn',
        role: 'mainAgent',
      },
      {
        id: 'next-turn',
        role: 'user',
        markdown: 'Visible message.',
      },
      {
        id: 'later-turn',
        role: 'mainAgent',
        markdown: 'Still hidden.',
      },
    ]
    const placeholderSteps = buildThreadReplaySteps(turns)

    expect(deriveReplayTranscript(turns, placeholderSteps, 1)).toEqual([])
    expect(deriveReplayTranscript(turns, placeholderSteps, 2)).toEqual([
      {
        id: 'next-turn',
        role: 'user',
        markdown: 'Visible message.',
      },
    ])
  })

  it('preserves exact raw markdown when deriving partial fenced code and ordered list segments', () => {
    const markdown = [
      'First line',
      'second line',
      '',
      '```ts',
      'const value = 1',
      '```',
      '',
      '3. third',
      '4. fourth',
    ].join('\n')
    const turns: ConversationTurn[] = [
      {
        id: 'raw-markdown-turn',
        role: 'mainAgent',
        markdown,
        contentBlocks: [trailingElapsedBlock],
      },
    ]
    const rawSteps = buildThreadReplaySteps(turns)

    expect(deriveReplayTranscript(turns, rawSteps, 2)).toEqual([
      {
        id: 'raw-markdown-turn',
        role: 'mainAgent',
        markdown: [
          'First line',
          'second line',
          '',
          '```ts',
          'const value = 1',
          '```',
        ].join('\n'),
      },
    ])
    expect(deriveReplayTranscript(turns, rawSteps, 3)).toEqual([
      {
        id: 'raw-markdown-turn',
        role: 'mainAgent',
        markdown,
      },
    ])
  })
})

describe('deriveReplayRunInspector', () => {
  const steps = buildThreadReplaySteps(inspectorTurns)

  it('returns undefined when no full inspector exists', () => {
    expect(deriveReplayRunInspector(undefined, steps, 1)).toBeUndefined()
  })

  it('returns a valid running inspector while replay is partial', () => {
    const inspector = deriveReplayRunInspector(fullInspector, steps, 0)

    expect(inspector).toMatchObject({
      summary: {
        stage: 'Pipeline execution',
        status: 'running',
        completedSteps: 0,
        totalSteps: 4,
        outputCount: 0,
        pendingCount: 0,
      },
      progress: [],
      outputs: [],
      approvals: [],
      capabilityRuns: [],
    })
  })

  it('reveals capability runs, outputs, and approvals from visible blocks', () => {
    const inspector = deriveReplayRunInspector(fullInspector, steps, 5)

    expect(inspector?.capabilityRuns.map((run) => run.commandName)).toEqual([
      'PipelineInputParser.normalize',
    ])
    expect(inspector?.outputs.map((output) => output.name)).toEqual([
      'input_package.json',
    ])
    expect(inspector?.approvals.map((approval) => approval.id)).toEqual([
      'run-start',
      'scope-confirmation',
    ])
    expect(inspector?.summary).toMatchObject({
      status: 'running',
      outputCount: 1,
      pendingCount: 0,
    })
  })

  it('reveals repeated capability runs and outputs by visible occurrence count', () => {
    const duplicateProjectFileBlock: Extract<
      ConversationBlock,
      { type: 'projectFile' }
    > = {
      ...projectFileBlock,
      location: 'Runs/RUN-001/inputs/second',
      note: 'Second copy of the same generated file name.',
    }
    const duplicateCapabilityRunBlock: Extract<
      ConversationBlock,
      { type: 'capabilityRunReplay' }
    > = {
      ...capabilityRunBlock,
      summary: 'Second normalization pass.',
      duration: '11s',
    }
    const turns: ConversationTurn[] = [
      {
        id: 'duplicate-turn',
        role: 'mainAgent',
        contentBlocks: [
          capabilityRunBlock,
          projectFileBlock,
          duplicateCapabilityRunBlock,
          duplicateProjectFileBlock,
          trailingElapsedBlock,
        ],
      },
    ]
    const duplicateInspector: RunInspectorData = {
      ...fullInspector,
      summary: {
        ...fullInspector.summary,
        outputCount: 2,
      },
      outputs: [
        {
          id: 'input-package-first',
          name: 'input_package.json',
          kind: 'projectFile',
          location: 'Runs/RUN-001/inputs',
          status: 'saved',
        },
        {
          id: 'input-package-second',
          name: 'input_package.json',
          kind: 'projectFile',
          location: 'Runs/RUN-001/inputs/second',
          status: 'saved',
        },
      ],
      capabilityRuns: [
        {
          id: 'normalize-inputs-first',
          commandName: 'PipelineInputParser.normalize',
          status: 'success',
          summary: 'Normalized pipeline inputs.',
          duration: '18s',
          input: { runId: 'RUN-001' },
          output: { missingFields: 1 },
        },
        {
          id: 'normalize-inputs-second',
          commandName: 'PipelineInputParser.normalize',
          status: 'success',
          summary: 'Second normalization pass.',
          duration: '11s',
          input: { runId: 'RUN-001' },
          output: { missingFields: 0 },
        },
      ],
    }
    const duplicateSteps = buildThreadReplaySteps(turns)

    const firstOccurrence = deriveReplayRunInspector(
      duplicateInspector,
      duplicateSteps,
      2,
    )
    const secondOccurrence = deriveReplayRunInspector(
      duplicateInspector,
      duplicateSteps,
      4,
    )

    expect(firstOccurrence?.capabilityRuns.map((run) => run.id)).toEqual([
      'normalize-inputs-first',
    ])
    expect(firstOccurrence?.outputs.map((output) => output.id)).toEqual([
      'input-package-first',
    ])
    expect(secondOccurrence?.capabilityRuns.map((run) => run.id)).toEqual([
      'normalize-inputs-first',
      'normalize-inputs-second',
    ])
    expect(secondOccurrence?.outputs.map((output) => output.id)).toEqual([
      'input-package-first',
      'input-package-second',
    ])
  })

  it('matches out-of-order duplicate project files by name and location', () => {
    const matchingFileBlock: Extract<ConversationBlock, { type: 'projectFile' }> = {
      ...projectFileBlock,
      location: 'Runs/RUN-001/inputs/matching',
    }
    const turns: ConversationTurn[] = [
      {
        id: 'out-of-order-file-turn',
        role: 'mainAgent',
        contentBlocks: [matchingFileBlock, trailingElapsedBlock],
      },
    ]
    const duplicateInspector: RunInspectorData = {
      ...fullInspector,
      outputs: [
        {
          id: 'same-name-wrong-location',
          name: 'input_package.json',
          kind: 'projectFile',
          location: 'Runs/RUN-001/inputs/wrong',
          status: 'saved',
        },
        {
          id: 'same-name-matching-location',
          name: 'input_package.json',
          kind: 'projectFile',
          location: 'Runs/RUN-001/inputs/matching',
          status: 'saved',
        },
      ],
    }
    const duplicateSteps = buildThreadReplaySteps(turns)

    const inspector = deriveReplayRunInspector(
      duplicateInspector,
      duplicateSteps,
      1,
    )

    expect(inspector?.outputs.map((output) => output.id)).toEqual([
      'same-name-matching-location',
    ])
  })

  it('matches out-of-order duplicate capability runs by command metadata', () => {
    const matchingRunBlock: Extract<
      ConversationBlock,
      { type: 'capabilityRunReplay' }
    > = {
      ...capabilityRunBlock,
      summary: 'Matching second pass.',
      status: 'warning',
      duration: '9s',
    }
    const turns: ConversationTurn[] = [
      {
        id: 'out-of-order-run-turn',
        role: 'mainAgent',
        contentBlocks: [matchingRunBlock, trailingElapsedBlock],
      },
    ]
    const duplicateInspector: RunInspectorData = {
      ...fullInspector,
      capabilityRuns: [
        {
          id: 'same-command-wrong-metadata',
          commandName: 'PipelineInputParser.normalize',
          status: 'success',
          summary: 'Different first pass.',
          duration: '18s',
          input: { runId: 'RUN-001' },
          output: { missingFields: 1 },
        },
        {
          id: 'same-command-matching-metadata',
          commandName: 'PipelineInputParser.normalize',
          status: 'warning',
          summary: 'Matching second pass.',
          duration: '9s',
          input: { runId: 'RUN-001' },
          output: { missingFields: 0 },
        },
      ],
    }
    const duplicateSteps = buildThreadReplaySteps(turns)

    const inspector = deriveReplayRunInspector(
      duplicateInspector,
      duplicateSteps,
      1,
    )

    expect(inspector?.capabilityRuns.map((run) => run.id)).toEqual([
      'same-command-matching-metadata',
    ])
  })

  it('does not reveal finalized approval state from a pending approval block', () => {
    const pendingApprovalBlock: Extract<
      ConversationBlock,
      { type: 'approvalGateCard' }
    > = {
      ...approvalGateBlock,
      status: 'pending',
      approver: 'Lab Owner',
      decidedAt: undefined,
      approvalAdvice: undefined,
      decision: undefined,
    }
    const approvedApprovalBlock: Extract<
      ConversationBlock,
      { type: 'approvalGateCard' }
    > = {
      ...approvalGateBlock,
      status: 'approved',
      approver: 'Lab Owner',
      decidedAt: '2026-06-04 09:18',
      decision: 'Approved',
    }
    const turns: ConversationTurn[] = [
      {
        id: 'approval-replay-turn',
        role: 'mainAgent',
        contentBlocks: [
          pendingApprovalBlock,
          approvedApprovalBlock,
          trailingElapsedBlock,
        ],
      },
    ]
    const approvalInspector: RunInspectorData = {
      ...fullInspector,
      approvals: [
        {
          id: 'run-start-pending',
          kind: 'approvalRequest',
          title: 'run_start',
          status: 'pending',
          actor: 'Lab Owner',
        },
        {
          id: 'run-start-approved',
          kind: 'approvalRequest',
          title: 'run_start',
          status: 'approved',
          actor: 'Lab Owner',
          decidedAt: '2026-06-04 09:18',
        },
      ],
    }
    const approvalSteps = buildThreadReplaySteps(turns)

    const pendingInspector = deriveReplayRunInspector(
      approvalInspector,
      approvalSteps,
      1,
    )
    const approvedInspector = deriveReplayRunInspector(
      approvalInspector,
      approvalSteps,
      2,
    )

    expect(pendingInspector?.approvals.map((approval) => approval.id)).toEqual([
      'run-start-pending',
    ])
    expect(approvedInspector?.approvals.map((approval) => approval.id)).toEqual([
      'run-start-pending',
      'run-start-approved',
    ])
    expect(pendingInspector?.summary.pendingCount).toBe(1)
    expect(approvedInspector?.summary.pendingCount).toBe(1)
  })

  it('uses visible pipeline DAG progress to reveal completed and active nodes', () => {
    const inspector = deriveReplayRunInspector(fullInspector, steps, 6)

    expect(inspector?.progress).toEqual([
      {
        id: 'load-input',
        title: 'Load input',
        status: 'done',
      },
      {
        id: 'qc-review',
        title: 'QC review',
        status: 'done',
      },
      {
        id: 'publish-results',
        title: 'Publish results',
        status: 'active',
      },
    ])
    expect(inspector?.summary.completedSteps).toBe(2)
  })

  it('keeps LIMS replay run progress aligned with the mock thread DAG cards', () => {
    const limsThread = enzymeSynthesisOpsThreads.find(
      (thread) => thread.id === 'lims-flow-run',
    )
    const limsSteps = buildThreadReplaySteps(limsThread?.transcript ?? [])
    const dagSteps = limsSteps.filter(
      (step): step is PipelineDagReplayStep =>
        step.kind === 'block' && step.block.type === 'pipelineDag',
    )

    expect(limsThread?.runInspector?.summary.totalSteps).toBe(
      enzymeSynthesisLimsDag.nodes.length,
    )
    expect(limsThread?.runInspector?.progress.map((item) => item.id)).toEqual(
      enzymeSynthesisLimsDag.nodes.map((node) => node.id),
    )

    dagSteps.forEach((step) => {
      const visibleCount = limsSteps.findIndex((item) => item.id === step.id) + 1
      const inspector = deriveReplayRunInspector(
        limsThread?.runInspector,
        limsSteps,
        visibleCount,
      )
      const completedIds = new Set(step.block.completedNodeIds ?? [])
      const visibleProgress = new Map(
        inspector?.progress.map((item) => [item.id, item.status]) ?? [],
      )

      expect(inspector?.summary.totalSteps).toBe(step.block.dag.nodes.length)
      expect(inspector?.summary.completedSteps).toBe(completedIds.size)
      completedIds.forEach((id) => {
        expect(visibleProgress.get(id)).toBe('done')
      })
      if (step.block.activeNodeId && !completedIds.has(step.block.activeNodeId)) {
        expect(visibleProgress.get(step.block.activeNodeId)).toBe('active')
      }
    })
  })

  it('keeps LIMS pipeline build replay run progress aligned with the build conversation', () => {
    const limsBuildThread = pipelineBuildThreads.find(
      (thread) => thread.id === 'pipeline-build-lims-enzyme-synthesis',
    )
    const limsBuildSteps = buildThreadReplaySteps(
      limsBuildThread?.transcript ?? [],
    )

    expect(limsBuildThread?.runInspector?.progress.map((item) => item.id)).toEqual([
      'lims-pipeline-build-progress-01',
      'lims-pipeline-build-progress-02',
      'lims-pipeline-build-progress-03',
      'lims-pipeline-build-progress-04',
      'lims-pipeline-build-progress-05',
      'lims-pipeline-build-progress-06',
      'lims-pipeline-build-progress-07',
      'lims-pipeline-build-progress-08',
      'lims-pipeline-build-progress-09',
      'lims-pipeline-build-progress-10',
      'lims-pipeline-build-progress-11',
      'lims-pipeline-build-progress-12',
    ])

    const checkpointExpectations = [
      {
        stepId: 'lims-pipeline-build-turn-001:markdown:0',
        done: [],
        active: 'lims-pipeline-build-progress-01',
      },
      {
        stepId: 'lims-pipeline-build-turn-002:block:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-004:markdown:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-014:markdown:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
          'lims-pipeline-build-progress-04',
          'lims-pipeline-build-progress-05',
          'lims-pipeline-build-progress-06',
          'lims-pipeline-build-progress-07',
          'lims-pipeline-build-progress-08',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-015:block:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
          'lims-pipeline-build-progress-04',
          'lims-pipeline-build-progress-05',
          'lims-pipeline-build-progress-06',
          'lims-pipeline-build-progress-07',
          'lims-pipeline-build-progress-08',
          'lims-pipeline-build-progress-09',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-017:block:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
          'lims-pipeline-build-progress-04',
          'lims-pipeline-build-progress-05',
          'lims-pipeline-build-progress-06',
          'lims-pipeline-build-progress-07',
          'lims-pipeline-build-progress-08',
          'lims-pipeline-build-progress-09',
          'lims-pipeline-build-progress-10',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-018:block:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
          'lims-pipeline-build-progress-04',
          'lims-pipeline-build-progress-05',
          'lims-pipeline-build-progress-06',
          'lims-pipeline-build-progress-07',
          'lims-pipeline-build-progress-08',
          'lims-pipeline-build-progress-09',
          'lims-pipeline-build-progress-10',
          'lims-pipeline-build-progress-11',
        ],
      },
      {
        stepId: 'lims-pipeline-build-turn-021:block:0',
        done: [
          'lims-pipeline-build-progress-01',
          'lims-pipeline-build-progress-02',
          'lims-pipeline-build-progress-03',
          'lims-pipeline-build-progress-04',
          'lims-pipeline-build-progress-05',
          'lims-pipeline-build-progress-06',
          'lims-pipeline-build-progress-07',
          'lims-pipeline-build-progress-08',
          'lims-pipeline-build-progress-09',
          'lims-pipeline-build-progress-10',
          'lims-pipeline-build-progress-11',
          'lims-pipeline-build-progress-12',
        ],
      },
    ]

    checkpointExpectations.forEach(({ stepId, done, active }) => {
      const visibleCount =
        limsBuildSteps.findIndex((item) => item.id === stepId) + 1
      const inspector = deriveReplayRunInspector(
        limsBuildThread?.runInspector,
        limsBuildSteps,
        visibleCount,
      )
      const visibleProgress = new Map(
        inspector?.progress.map((item) => [item.id, item.status]) ?? [],
      )

      expect(visibleCount).toBeGreaterThan(0)
      expect(inspector?.summary.totalSteps).toBe(12)
      expect(inspector?.summary.completedSteps).toBe(done.length)
      done.forEach((id) => {
        expect(visibleProgress.get(id)).toBe('done')
      })
      if (active) {
        expect(visibleProgress.get(active)).toBe('active')
      }
    })
  })

  it('does not reveal unrelated progress from short identifier collisions', () => {
    const collisionDagBlock: Extract<ConversationBlock, { type: 'pipelineDag' }> = {
      ...pipelineDagBlock,
      completedNodeIds: ['run'],
      activeNodeId: undefined,
    }
    const turns: ConversationTurn[] = [
      {
        id: 'collision-turn',
        role: 'mainAgent',
        contentBlocks: [collisionDagBlock, trailingElapsedBlock],
      },
    ]
    const collisionInspector: RunInspectorData = {
      ...fullInspector,
      progress: [
        {
          id: 'run',
          title: 'Run',
          status: 'done',
        },
        {
          id: 'run-start-approval',
          title: 'Run start approval',
          status: 'done',
        },
      ],
    }
    const collisionSteps = buildThreadReplaySteps(turns)

    const inspector = deriveReplayRunInspector(
      collisionInspector,
      collisionSteps,
      1,
    )

    expect(inspector?.progress.map((item) => item.id)).toEqual(['run'])
  })

  it('returns the original full inspector when replay is complete', () => {
    expect(deriveReplayRunInspector(fullInspector, steps, steps.length)).toBe(
      fullInspector,
    )
  })
})
