import type { PipelineDag } from './mockCapabilities'

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

export type ReplayRunInspectorMarker = {
  completedProgressIds?: string[]
  activeProgressId?: string
}

export type ConversationTurn = {
  id: string
  role: ConversationRole
  markdown?: string
  contentBlocks?: ConversationBlock[]
  replayRunInspector?: ReplayRunInspectorMarker
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
  | ScientificDiagramBlock
  | ModelCallComparisonBlock
  | PipelineDagBlock
  | DesignHandoffBriefBlock
  | ExperimentOrderSummaryBlock
  | SampleScopePanelBlock
  | AssayPanelTableBlock
  | PlateMapMiniBlock
  | SampleInventoryLinkBlock
  | MaterialSopReadinessBlock
  | ApprovalGateCardBlock
  | ExecutionTaskStatusBlock
  | ExperimentNotebookSummaryBlock
  | RunLogTableBlock
  | AnomalyReviewTableBlock
  | ResultPackageChecklistBlock
  | DataChartBlock

export type ProjectFileBlock = {
  type: 'projectFile'
  fileName: string
  fileKind:
    | 'pdf'
    | 'xlsx'
    | 'csv'
    | 'png'
    | 'jpg'
    | 'fasta'
    | 'pdb'
    | 'bmeln'
    | 'md'
    | 'json'
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
  replayRunInspector?: ReplayRunInspectorMarker
}

export type HumanConfirmationBlock = {
  type: 'humanConfirmation'
  title: string
  confirmedBy: string
  confirmedAt: string
  decision: string
  replayRunInspector?: ReplayRunInspectorMarker
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

export type ScientificDiagramBlock = {
  type: 'scientificDiagram'
  diagramKind: 'targetxEvidenceNetwork' | 'targetxEpitopeHypothesis'
  title: string
  description: string
}

export type ModelCallComparisonBlock = {
  type: 'modelCallComparison'
  title: string
  subtitle: string
  primaryModel: ModelCallSummary
  comparatorModel: ModelCallSummary
  metrics: Array<{
    metric: string
    primaryValue: string
    comparatorValue: string
    agreement: 'agree' | 'partial' | 'disagree'
    interpretation: string
  }>
  decision: 'primary' | 'backup' | 'review' | 'reject' | 'control'
  decisionText: string
  riskNote: string
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
  }>
}

export type ModelCallSummary = {
  name: string
  provider: string
  version: string
  purpose: string
  inputSummary: string
  outputSummary: string
  status: 'success' | 'warning' | 'failed'
}

export type PipelineDagBlock = {
  type: 'pipelineDag'
  title: string
  version: string
  status: 'draft' | 'validated' | 'saved'
  summary: string
  dag: PipelineDag
  progressSummary?: string
  completedNodeIds?: string[]
  activeNodeId?: string
  defaultCollapsed?: boolean
}

export type DesignHandoffBriefBlock = {
  type: 'designHandoffBrief'
  designPackage: string
  libraryId: string
  parentEnzyme: string
  variantRange: string
  executionConstraints: string[]
  forbiddenActions: string[]
  sourceFiles: string[]
}

export type ExperimentOrderSummaryBlock = {
  type: 'experimentOrderSummary'
  title: string
  orderId: string
  status: string
  reviewStatus: string
  projectId: string
  libraryId: string
  subjectLabel?: string
  parentEnzyme: string
  purpose: string
  scopeLock: string
  owner: string
  createdAt: string
  dueAt: string
  rows: Array<{ label: string; value: string }>
}

export type SampleScopePanelBlock = {
  type: 'sampleScopePanel'
  libraryId: string
  variantCount: number
  variantRange: string
  controls: string[]
  replicatePlan: string
  sampleSource: string
  exclusions: string[]
  lockedBy: string
}

export type AssayPanelTableBlock = {
  type: 'assayPanelTable'
  panelStatus: string
  sopReference: string
  assays: Array<{
    name: string
    purpose: string
    readout: string
    method: string
    replicateCount: number
    qcRule: string
  }>
}

export type PlateMapMiniBlock = {
  type: 'plateMapMini'
  plateMapId: string
  plateCount: number
  dimensions: string
  wells: Array<{ position: string; label: string; group: string }>
  legend: Array<{ label: string; color: string }>
  locked: boolean
}

export type SampleInventoryLinkBlock = {
  type: 'sampleInventoryLink'
  sampleBatchId: string
  inventoryStatus: string
  storageCondition: string
  aliquotPlan: string
  plateLinkRecord: string
  missingItems: string[]
}

export type MaterialSopReadinessBlock = {
  type: 'materialSopReadiness'
  substrateLot: string
  buffer: string
  sopVersion: string
  deviceType: string
  deviceId: string
  labLocation: string
  experimentRoute: string
  workflowTemplate: string
  readinessChecks: string[]
}

export type ApprovalGateCardBlock = {
  type: 'approvalGateCard'
  title: string
  approvalType: string
  status: 'pending' | 'approved' | 'rejected' | 'blocked'
  approver?: string
  decidedAt?: string
  approvalAdvice?: string
  details?: Array<{ label: string; value: string }>
  checklist: string[]
  riskSummary: string
  decision?: string
}

export type ExecutionTaskStatusBlock = {
  type: 'executionTaskStatus'
  taskId: string
  orderId: string
  croRef: string
  stage: string
  status: string
  owner: string
  startedAt: string
  completedAt?: string
  records: string[]
}

export type ExperimentNotebookSummaryBlock = {
  type: 'experimentNotebookSummary'
  notebookId: string
  taskId: string
  orderId: string
  status: string
  estimatedSubmitBy: string
  submittedAt: string
  submittedBy: string
  callbackId: string
  recordSections: Array<{
    label: string
    value: string
    status: string
  }>
  observations: string[]
  attachments: string[]
}

export type RunLogTableBlock = {
  type: 'runLogTable'
  logId: string
  taskId: string
  rows: Array<{
    time: string
    actor: string
    system: string
    event: string
    recordId: string
    status: string
  }>
}

export type AnomalyReviewTableBlock = {
  type: 'anomalyReviewTable'
  anomalyLogId: string
  policy: string
  rows: Array<{
    sampleId: string
    well: string
    anomalyType: string
    rawReadingPreserved: string
    autoExcluded: string
    reviewOwner: string
    status: string
  }>
}

export type ResultPackageChecklistBlock = {
  type: 'resultPackageChecklist'
  packageName: string
  receivedAt: string
  files: string[]
  schemaChecks: string[]
  missingItems: string[]
  archiveLocations: string[]
  readyForAnalysis: boolean
}

export type DataChartBlock = {
  type: 'dataChart'
  title: string
  chartType: 'line' | 'bar' | 'pie'
  xLabel?: string
  yLabel?: string
  series: Array<{
    label: string
    color?: string
    points: Array<{ label: string; value: number }>
  }>
}
