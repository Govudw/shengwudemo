import type {
  ConversationBlock,
  ConversationRole,
  ReplayRunInspectorMarker,
  ConversationTurn,
  RunInspectorApprovalItem,
  RunInspectorData,
  RunInspectorProgressItem,
} from '../data/conversationTypes'

export type ThreadReplayStep =
  | {
      id: string
      turnId: string
      role: ConversationRole
      kind: 'turn'
      replayRunInspector?: ReplayRunInspectorMarker
    }
  | {
      id: string
      turnId: string
      role: ConversationRole
      kind: 'markdown'
      markdownSegmentIndex: number
      replayRunInspector?: ReplayRunInspectorMarker
    }
  | {
      id: string
      turnId: string
      role: ConversationRole
      kind: 'block'
      blockIndex: number
      block: ConversationBlock
      replayRunInspector?: ReplayRunInspectorMarker
    }

export type MarkdownSegment =
  | { type: 'paragraph'; text: string; raw: string }
  | { type: 'list'; ordered: boolean; items: string[]; raw: string }
  | { type: 'code'; code: string; raw: string }
  | {
      type: 'table'
      headers: string[]
      alignments: Array<'left' | 'right' | 'center'>
      rows: string[][]
      raw: string
    }

type PartialTurnState = {
  markdownSegmentIndexes: Set<number>
  blockIndexes: Set<number>
}

type VisibleOutputSpec = {
  name: string
  location?: string
}

type VisibleCapabilityRunSpec = {
  commandName: string
  summary?: string
  status?: string
  duration?: string
}

type VisibleApprovalSpec = {
  kind?: RunInspectorApprovalItem['kind']
  title?: string
  approvalType?: string
  status?: RunInspectorApprovalItem['status']
  actor?: string
  decidedAt?: string
}

export function buildThreadReplaySteps(
  turns: ConversationTurn[],
): ThreadReplayStep[] {
  return turns.flatMap((turn): ThreadReplayStep[] => {
    const markdownSteps = parseMarkdownSegments(turn.markdown ?? '').map(
      (_segment, index) =>
        ({
          id: `${turn.id}:markdown:${index}`,
          turnId: turn.id,
          role: turn.role,
          kind: 'markdown',
          markdownSegmentIndex: index,
          replayRunInspector: turn.replayRunInspector,
        }) satisfies ThreadReplayStep,
    )
    const blockSteps =
      turn.contentBlocks?.map(
        (block, index) =>
          ({
            id: `${turn.id}:block:${index}`,
            turnId: turn.id,
            role: turn.role,
            kind: 'block',
            blockIndex: index,
            block,
            replayRunInspector: mergeReplayRunInspectorMarkers(
              turn.replayRunInspector,
              getBlockReplayRunInspectorMarker(block),
            ),
        }) satisfies ThreadReplayStep,
      ) ?? []
    const steps: ThreadReplayStep[] = [...markdownSteps, ...blockSteps]

    if (steps.length) {
      return steps
    }

    return [
      {
        id: `${turn.id}:turn`,
        turnId: turn.id,
        role: turn.role,
        kind: 'turn',
        replayRunInspector: turn.replayRunInspector,
      } satisfies ThreadReplayStep,
    ]
  })
}

export function deriveReplayTranscript(
  turns: ConversationTurn[],
  steps: ThreadReplayStep[],
  visibleCount: number,
): ConversationTurn[] {
  if (visibleCount <= 0) {
    return []
  }

  if (visibleCount >= steps.length) {
    const visibleTurns = turns.filter(hasRenderableTurn)
    return visibleTurns.length === turns.length ? turns : visibleTurns
  }

  const visibleStepStates = steps
    .slice(0, Math.max(0, visibleCount))
    .reduce((states, step) => {
      if (step.kind === 'turn') {
        return states
      }

      const state =
        states.get(step.turnId) ??
        {
          markdownSegmentIndexes: new Set<number>(),
          blockIndexes: new Set<number>(),
        }

      if (step.kind === 'markdown') {
        state.markdownSegmentIndexes.add(step.markdownSegmentIndex)
      } else if (step.kind === 'block') {
        state.blockIndexes.add(step.blockIndex)
      }

      states.set(step.turnId, state)
      return states
    }, new Map<string, PartialTurnState>())

  return turns.flatMap((turn) => {
    const state = visibleStepStates.get(turn.id)
    if (!state) {
      return []
    }

    const replayTurn: ConversationTurn = {
      id: turn.id,
      role: turn.role,
    }

    if (state.markdownSegmentIndexes.size && turn.markdown) {
      const visibleMarkdown = serializeMarkdownSegments(
        parseMarkdownSegments(turn.markdown).filter((_segment, index) =>
          state.markdownSegmentIndexes.has(index),
        ),
      )

      if (visibleMarkdown) {
        replayTurn.markdown = visibleMarkdown
      }
    }

    if (state.blockIndexes.size && turn.contentBlocks?.length) {
      replayTurn.contentBlocks = turn.contentBlocks.filter((_block, index) =>
        state.blockIndexes.has(index),
      )
    }

    if (replayTurn.markdown || replayTurn.contentBlocks?.length) {
      return [replayTurn]
    }

    return []
  })
}

function hasRenderableTurn(turn: ConversationTurn): boolean {
  return (
    parseMarkdownSegments(turn.markdown ?? '').length > 0 ||
    Boolean(turn.contentBlocks?.length)
  )
}

export function deriveReplayRunInspector(
  fullInspector: RunInspectorData | undefined,
  steps: ThreadReplayStep[],
  visibleCount: number,
): RunInspectorData | undefined {
  if (!fullInspector) {
    return undefined
  }

  if (visibleCount >= steps.length) {
    return fullInspector
  }

  const visibleSteps = steps.slice(0, Math.max(0, visibleCount))
  const visibleBlocks = visibleSteps
    .filter((step): step is Extract<ThreadReplayStep, { kind: 'block' }> => {
      return step.kind === 'block'
    })
    .map((step) => step.block)

  const visibleCapabilityRunSpecs: VisibleCapabilityRunSpec[] = []
  const visibleOutputSpecs: VisibleOutputSpec[] = []
  const visibleApprovalSpecs: VisibleApprovalSpec[] = []
  const completedProgressIdentifiers = new Set<string>()
  let activeProgressIdentifier: string | undefined

  visibleSteps.forEach((step) => {
    step.replayRunInspector?.completedProgressIds?.forEach((id) => {
      completedProgressIdentifiers.add(id)
    })
    if (step.replayRunInspector?.activeProgressId) {
      activeProgressIdentifier = step.replayRunInspector.activeProgressId
    }
  })

  visibleBlocks.forEach((block) => {
    if (block.type === 'capabilityRunReplay') {
      visibleCapabilityRunSpecs.push({
        commandName: block.commandName,
        summary: block.summary,
        status: block.status,
        duration: block.duration,
      })
      return
    }

    if (block.type === 'projectFile') {
      visibleOutputSpecs.push({
        name: block.fileName,
        location: block.location,
      })
      return
    }

    if (isApprovalRelatedBlock(block)) {
      visibleApprovalSpecs.push(createApprovalSpec(block))
      return
    }

    if (block.type === 'pipelineDag') {
      block.completedNodeIds?.forEach((id) => completedProgressIdentifiers.add(id))
      activeProgressIdentifier = block.activeNodeId
    }
  })

  const progress = deriveVisibleProgress(
    fullInspector.progress,
    completedProgressIdentifiers,
    activeProgressIdentifier,
  )
  const outputs = takeMatchingInspectorItems(
    fullInspector.outputs,
    visibleOutputSpecs,
    matchesOutputSpec,
  )
  const approvals = takeMatchingInspectorItems(
    fullInspector.approvals,
    visibleApprovalSpecs,
    matchesApprovalSpec,
  )
  const capabilityRuns = takeMatchingInspectorItems(
    fullInspector.capabilityRuns,
    visibleCapabilityRunSpecs,
    matchesCapabilityRunSpec,
  )

  return {
    summary: {
      ...fullInspector.summary,
      status: 'running',
      completedSteps: progress.filter((item) => item.status === 'done').length,
      outputCount: outputs.length,
      pendingCount: approvals.filter((item) => item.status === 'pending').length,
    },
    progress,
    outputs,
    approvals,
    capabilityRuns,
  }
}

function getBlockReplayRunInspectorMarker(
  block: ConversationBlock,
): ReplayRunInspectorMarker | undefined {
  if (
    block.type === 'capabilityRunReplay' ||
    block.type === 'humanConfirmation'
  ) {
    return block.replayRunInspector
  }

  return undefined
}

function mergeReplayRunInspectorMarkers(
  turnMarker: ReplayRunInspectorMarker | undefined,
  blockMarker: ReplayRunInspectorMarker | undefined,
): ReplayRunInspectorMarker | undefined {
  const completedProgressIds = [
    ...(turnMarker?.completedProgressIds ?? []),
    ...(blockMarker?.completedProgressIds ?? []),
  ]
  const activeProgressId =
    blockMarker?.activeProgressId ?? turnMarker?.activeProgressId

  if (!completedProgressIds.length && !activeProgressId) {
    return undefined
  }

  return {
    ...(completedProgressIds.length ? { completedProgressIds } : {}),
    ...(activeProgressId ? { activeProgressId } : {}),
  }
}

function deriveVisibleProgress(
  fullProgress: RunInspectorProgressItem[],
  completedIdentifiers: Set<string>,
  activeIdentifier: string | undefined,
): RunInspectorProgressItem[] {
  const progress: RunInspectorProgressItem[] = []

  fullProgress.forEach((item) => {
    const isCompleted = Array.from(completedIdentifiers).some((identifier) =>
      matchesProgressIdentifier(item, identifier),
    )
    const isActive =
      activeIdentifier !== undefined &&
      matchesProgressIdentifier(item, activeIdentifier)

    if (isCompleted) {
      progress.push({ ...item, status: 'done' })
      return
    }

    if (isActive) {
      progress.push({ ...item, status: 'active' })
    }
  })

  return progress
}

function matchesProgressIdentifier(
  item: RunInspectorProgressItem,
  identifier: string,
): boolean {
  const normalizedIdentifier = normalizeMatcherValue(identifier)
  if (!normalizedIdentifier) {
    return false
  }

  return [item.id, item.title, item.meta].some((value) => {
    const normalizedValue = normalizeMatcherValue(value)
    if (!normalizedValue) {
      return false
    }

    return normalizedValue === normalizedIdentifier
  })
}

function takeMatchingInspectorItems<T, Spec>(
  items: T[],
  specs: Spec[],
  matches: (item: T, spec: Spec) => boolean,
): T[] {
  const usedIndexes = new Set<number>()

  return specs.flatMap((spec) => {
    const matchIndex = items.findIndex(
      (item, index) => !usedIndexes.has(index) && matches(item, spec),
    )

    if (matchIndex === -1) {
      return []
    }

    usedIndexes.add(matchIndex)
    return [items[matchIndex]]
  })
}

function matchesOutputSpec(
  output: RunInspectorData['outputs'][number],
  spec: VisibleOutputSpec,
): boolean {
  if (output.name !== spec.name) {
    return false
  }

  if (spec.location) {
    return output.location === spec.location
  }

  return true
}

function matchesCapabilityRunSpec(
  run: RunInspectorData['capabilityRuns'][number],
  spec: VisibleCapabilityRunSpec,
): boolean {
  if (run.commandName !== spec.commandName) {
    return false
  }

  if (spec.summary && run.summary !== spec.summary) {
    return false
  }

  if (spec.status && run.status !== spec.status) {
    return false
  }

  if (spec.duration && run.duration !== spec.duration) {
    return false
  }

  return true
}

function isApprovalRelatedBlock(block: ConversationBlock): boolean {
  return (
    block.type === 'approvalGateCard' ||
    block.type === 'approvalGatePreview' ||
    block.type === 'approvalRequestReplay' ||
    block.type === 'humanConfirmation'
  )
}

function createApprovalSpec(block: ConversationBlock): VisibleApprovalSpec {
  if (block.type === 'approvalGateCard') {
    return {
      kind: 'approvalRequest',
      title: block.title,
      approvalType: block.approvalType,
      status: block.status === 'approved' ? 'approved' : 'pending',
      actor: block.approver,
      decidedAt: block.status === 'approved' ? block.decidedAt : undefined,
    }
  }

  if (block.type === 'approvalGatePreview') {
    return {
      kind: 'approvalRequest',
      title: block.title,
      approvalType: block.approvalType,
      status: 'pending',
    }
  }

  if (block.type === 'approvalRequestReplay') {
    return {
      kind: 'approvalRequest',
      title: block.title,
      approvalType: block.approvalType,
      status: 'approved',
      actor: block.decidedBy,
      decidedAt: block.decidedAt,
    }
  }

  if (block.type === 'humanConfirmation') {
    return {
      kind: 'humanConfirmation',
      title: block.title,
      status: 'confirmed',
      actor: block.confirmedBy,
      decidedAt: block.confirmedAt,
    }
  }

  return {}
}

function matchesApprovalSpec(
  approval: RunInspectorApprovalItem,
  spec: VisibleApprovalSpec,
): boolean {
  if (spec.kind && approval.kind !== spec.kind) {
    return false
  }

  if (spec.status && approval.status !== spec.status) {
    return false
  }

  if (
    !matchesAny(approval.title, [spec.title, spec.approvalType]) &&
    !matchesAny(approval.id, [spec.title, spec.approvalType])
  ) {
    return false
  }

  if (
    spec.actor &&
    approval.actor &&
    normalizeMatcherValue(spec.actor) !== normalizeMatcherValue(approval.actor)
  ) {
    return false
  }

  if (spec.decidedAt && approval.decidedAt !== spec.decidedAt) {
    return false
  }

  return true
}

function matchesAny(
  value: string | undefined,
  candidates: Array<string | undefined>,
): boolean {
  const normalizedValue = normalizeMatcherValue(value)
  if (!normalizedValue) {
    return false
  }

  return candidates.some((candidate) => {
    const normalizedCandidate = normalizeMatcherValue(candidate)
    return normalizedCandidate && normalizedCandidate === normalizedValue
  })
}

function normalizeMatcherValue(value: string | undefined): string {
  return value?.trim().toLowerCase().replace(/\s+/g, '-') ?? ''
}

export function parseMarkdownSegments(markdown: string): MarkdownSegment[] {
  const normalizedMarkdown = markdown.replace(/\r\n/g, '\n')
  if (!normalizedMarkdown.trim()) {
    return []
  }

  const lines = normalizedMarkdown.split('\n')
  const segments: MarkdownSegment[] = []
  let lineIndex = 0

  while (lineIndex < lines.length) {
    const line = lines[lineIndex]

    if (!line.trim()) {
      lineIndex += 1
      continue
    }

    if (isFenceLine(line)) {
      const startIndex = lineIndex
      lineIndex += 1

      while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex]
        lineIndex += 1

        if (isFenceLine(currentLine)) {
          break
        }
      }

      const rawLines = lines.slice(startIndex, lineIndex)
      const hasClosingFence = rawLines.length > 1 && isFenceLine(rawLines.at(-1) ?? '')
      const codeLines = rawLines.slice(1, hasClosingFence ? -1 : undefined)
      segments.push({
        type: 'code',
        code: codeLines.join('\n'),
        raw: rawLines.join('\n'),
      })
      continue
    }

    if (isTableHeaderLine(line, lines[lineIndex + 1])) {
      const headers = splitTableRow(line)
      const alignments = parseTableAlignments(lines[lineIndex + 1])
      const rows: string[][] = []
      const startIndex = lineIndex
      lineIndex += 2

      while (lineIndex < lines.length && isTableContentLine(lines[lineIndex])) {
        const row = splitTableRow(lines[lineIndex])
        rows.push(headers.map((_header, cellIndex) => row[cellIndex] ?? ''))
        lineIndex += 1
      }

      segments.push({
        type: 'table',
        headers,
        alignments,
        rows,
        raw: lines.slice(startIndex, lineIndex).join('\n'),
      })
      continue
    }

    const listMatch = getListLineMatch(line)
    if (listMatch) {
      const startIndex = lineIndex
      const ordered = listMatch.ordered
      lineIndex += 1

      while (lineIndex < lines.length) {
        const currentLine = lines[lineIndex]
        const currentListMatch = getListLineMatch(currentLine)

        if (!currentLine.trim()) {
          break
        }

        if (
          isFenceLine(currentLine) ||
          isTableHeaderLine(currentLine, lines[lineIndex + 1])
        ) {
          break
        }

        if (currentListMatch) {
          const leadingWhitespace = currentLine.match(/^\s*/)?.[0] ?? ''
          if (currentListMatch.ordered !== ordered && !leadingWhitespace) {
            break
          }

          lineIndex += 1
          continue
        }

        if (/^\s+/.test(currentLine)) {
          lineIndex += 1
          continue
        }

        break
      }

      const rawLines = lines.slice(startIndex, lineIndex)
      segments.push({
        type: 'list',
        ordered,
        items: rawLines.flatMap((rawLine) => getListLineMatch(rawLine)?.item ?? []),
        raw: rawLines.join('\n'),
      })
      continue
    }

    const startIndex = lineIndex
    lineIndex += 1

    while (lineIndex < lines.length) {
      const currentLine = lines[lineIndex]

      if (
        !currentLine.trim() ||
        isFenceLine(currentLine) ||
        isTableHeaderLine(currentLine, lines[lineIndex + 1]) ||
        getListLineMatch(currentLine)
      ) {
        break
      }

      lineIndex += 1
    }

    const raw = lines.slice(startIndex, lineIndex).join('\n')
    segments.push({
      type: 'paragraph',
      text: raw
        .split('\n')
        .map((paragraphLine) => paragraphLine.trim())
        .join(' '),
      raw,
    })
  }

  return segments
}

export function serializeMarkdownSegments(segments: MarkdownSegment[]): string {
  return segments.map(serializeMarkdownSegment).join('\n\n')
}

function serializeMarkdownSegment(segment: MarkdownSegment): string {
  return segment.raw
}

function isFenceLine(line: string): boolean {
  return line.trim().startsWith('```')
}

function getListLineMatch(
  line: string,
): { ordered: boolean; item: string } | null {
  const unorderedListMatch = line.match(/^\s*[-*]\s+(.+)$/)
  if (unorderedListMatch) {
    return { ordered: false, item: unorderedListMatch[1] }
  }

  const orderedListMatch = line.match(/^\s*\d+\.\s+(.+)$/)
  if (orderedListMatch) {
    return { ordered: true, item: orderedListMatch[1] }
  }

  return null
}

function isTableHeaderLine(line: string, nextLine?: string): nextLine is string {
  return (
    line.includes('|') &&
    typeof nextLine === 'string' &&
    isTableSeparatorLine(nextLine) &&
    splitTableRow(line).length === splitTableRow(nextLine).length
  )
}

function isTableSeparatorLine(line: string): boolean {
  const cells = splitTableRow(line)

  return (
    cells.length > 1 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
  )
}

function isTableContentLine(line: string): boolean {
  return line.trim().length > 0 && line.includes('|')
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function parseTableAlignments(
  separatorLine: string,
): Array<'left' | 'right' | 'center'> {
  return splitTableRow(separatorLine).map((cell) => {
    const marker = cell.replace(/\s/g, '')
    const startsWithColon = marker.startsWith(':')
    const endsWithColon = marker.endsWith(':')

    if (startsWithColon && endsWithColon) {
      return 'center'
    }

    if (endsWithColon) {
      return 'right'
    }

    return 'left'
  })
}
