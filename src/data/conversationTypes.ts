export type ConversationRole = 'user' | 'mainAgent'

export type RunInspectorData = {
  summary: {
    stage: string
    status: 'notStarted' | 'running' | 'waiting' | 'completed' | 'blocked'
    completedSteps: number
    totalSteps: number
    outputCount: number
    pendingCount: number
  }
  progress: RunInspectorProgressItem[]
  outputs: RunInspectorOutputItem[]
  approvals: RunInspectorApprovalItem[]
  capabilityRuns: RunInspectorCapabilityRunItem[]
}

export type RunInspectorProgressItem = {
  id: string
  title: string
  status: 'done' | 'active' | 'waiting' | 'blocked'
  meta?: string
  detail?: string
}

export type RunInspectorOutputItem = {
  id: string
  name: string
  kind: 'projectFile' | 'experimentOrder' | 'report' | 'dataset' | 'figure'
  location: string
  status: 'draft' | 'saved' | 'submitted' | 'completed'
}

export type RunInspectorApprovalItem = {
  id: string
  kind: 'humanConfirmation' | 'approvalRequest'
  title: string
  status: 'pending' | 'confirmed' | 'approved'
  actor?: string
  decidedAt?: string
}

export type RunInspectorCapabilityRunItem = {
  id: string
  commandName: string
  status: 'success' | 'failed' | 'warning'
  summary: string
  duration: string
  input: Record<string, string | string[] | number | boolean>
  output: Record<string, string | string[] | number | boolean>
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
  }>
}

export type ConversationTurn = {
  id: string
  role: ConversationRole
  markdown?: string
  contentBlocks?: ConversationBlock[]
}

export type ConversationBlock =
  | ProjectFileBlock
  | MainAgentProgressBlock
  | CommandPreviewBlock
  | VisualEvidenceBlock
  | CandidateMoleculeTableBlock
  | CandidateEvidenceTableBlock
  | ExperimentOrderDraftBlock
  | ApprovalGatePreviewBlock
  | CapabilityRunReplayBlock
  | HumanConfirmationBlock
  | ApprovalRequestReplayBlock
  | ElapsedWorkReplayBlock
  | ScientificFigureBlock

export type ProjectFileBlock = {
  type: 'projectFile'
  fileName: string
  fileKind: 'pdf' | 'xlsx' | 'csv' | 'png' | 'jpg' | 'fasta' | 'pdb' | 'md'
  location: string
  note: string
}

export type MainAgentProgressBlock = {
  type: 'mainAgentProgress'
  title: string
  steps: Array<{ label: string; state: 'done' | 'active' | 'queued' }>
}

export type CommandPreviewBlock = {
  type: 'commandPreview'
  commandName: string
  description: string
  parameters: Array<{ label: string; value: string }>
}

export type VisualEvidenceBlock = {
  type: 'visualEvidence'
  title: string
  caption: string
}

export type CandidateMoleculeTableBlock = {
  type: 'candidateMoleculeTable'
  title: string
  rows: Array<{
    id: string
    mutation: string
    predictedKd: string
    risk: 'low' | 'medium' | 'high'
    rationale: string
  }>
}

export type CandidateEvidenceTableBlock = {
  type: 'candidateEvidenceTable'
  title: string
  columns: Array<{ key: string; label: string }>
  rows: Array<{
    id: string
    group: string
    evidence: Record<string, string>
    risk: 'low' | 'medium' | 'high'
    rationale: string
  }>
}

export type ExperimentOrderDraftBlock = {
  type: 'experimentOrderDraft'
  title: string
  orderId: string
  status: 'draft' | 'submitted'
  items: Array<{ label: string; value: string }>
}

export type ApprovalGatePreviewBlock = {
  type: 'approvalGatePreview'
  title: string
  description: string
  approvalType: 'experimentOrder' | 'dataPublish' | 'modelRelease'
}

export type CapabilityRunReplayBlock = {
  type: 'capabilityRunReplay'
  commandName: string
  status: 'success' | 'failed' | 'warning'
  summary: string
  defaultCollapsed: true
  input: Record<string, string | string[] | number | boolean>
  output: Record<string, string | string[] | number | boolean>
  duration: string
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
    description: string
  }>
}

export type HumanConfirmationBlock = {
  type: 'humanConfirmation'
  title: string
  confirmedBy: string
  confirmedAt: string
  decision: string
}

export type ApprovalRequestReplayBlock = {
  type: 'approvalRequestReplay'
  title: string
  approvalType: 'experimentOrder' | 'dataPublish' | 'modelRelease'
  status: 'approved'
  decidedBy: string
  decidedAt: string
  decision: string
  requestSummary: string
}

export type ElapsedWorkReplayBlock = {
  type: 'elapsedWorkReplay'
  target: string
  elapsed: string
  status: 'completed'
  summary: string
}

export type ScientificFigureBlock = {
  type: 'scientificFigure'
  figureId: string
  title: string
  description: string
  imagegenPrompt: string
  placeholder: string
  src?: string
  width: number
  height: number
  alt: string
}
