import type { ConversationBlock } from '../data/conversationTypes'
import { memo } from 'react'
import EChartDataChart from './EChartDataChart'
import PipelineDagBlock from './PipelineDagBlock'

type ConversationBlocksProps = {
  blocks: ConversationBlock[]
  onProjectFileOpen?: (block: BlockOf<'projectFile'>) => void
  replayStepMetadata?: {
    turnId: string
    activeReplayStepId?: string | null
  }
}

type BlockOf<T extends ConversationBlock['type']> = Extract<ConversationBlock, { type: T }>

const riskLabels: Record<'low' | 'medium' | 'high', string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const progressLabels: Record<'done' | 'active' | 'queued', string> = {
  done: 'Done',
  active: 'Active',
  queued: 'Queued',
}

const eventStatusLabels: Record<'success' | 'failed' | 'warning', string> = {
  success: 'success',
  failed: 'failed',
  warning: 'warning',
}

const approvalStatusLabels: Record<
  BlockOf<'approvalGateCard'>['status'],
  string
> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  blocked: 'BLOCKED',
}

function ConversationBlocks({
  blocks,
  onProjectFileOpen,
  replayStepMetadata,
}: ConversationBlocksProps) {
  return (
    <div className="conversation-blocks">
      {blocks.map((block, index) => {
        const blockView = (
          <MemoizedConversationBlockView
            block={block}
            onProjectFileOpen={onProjectFileOpen}
          />
        )

        if (!replayStepMetadata) {
          return (
            <MemoizedConversationBlockView
              key={`${block.type}-${index}`}
              block={block}
              onProjectFileOpen={onProjectFileOpen}
            />
          )
        }

        const stepId = `${replayStepMetadata.turnId}:block:${index}`
        const isActive = stepId === replayStepMetadata.activeReplayStepId

        return (
          <div
            key={`${block.type}-${index}`}
            className={[
              'conversation-blocks__item',
              'conversation-replay-step',
              isActive ? 'conversation-blocks__item--active' : null,
              isActive ? 'conversation-replay-step--active' : null,
            ]
              .filter(Boolean)
              .join(' ')}
            data-replay-step-id={stepId}
          >
            {blockView}
          </div>
        )
      })}
    </div>
  )
}

function ConversationBlockView({
  block,
  onProjectFileOpen,
}: {
  block: ConversationBlock
  onProjectFileOpen?: (block: BlockOf<'projectFile'>) => void
}) {
  switch (block.type) {
    case 'projectFile':
      return (
        <button
          type="button"
          className="project-file-block"
          aria-label={block.fileName}
          onClick={() => onProjectFileOpen?.(block)}
        >
          <div className="project-file-block__kind">{block.fileKind}</div>
          <div className="project-file-block__body">
            <div className="project-file-block__name">{block.fileName}</div>
            <div className="project-file-block__location">{block.location}</div>
            <p>{block.note}</p>
          </div>
        </button>
      )

    case 'mainAgentProgress':
      return (
        <section className="agent-progress-block" aria-label={block.title}>
          <h3>{block.title}</h3>
          <ol>
            {block.steps.map((step) => (
              <li
                key={step.label}
                className={`agent-progress-block__step agent-progress-block__step--${step.state}`}
              >
                <span className="agent-progress-block__marker" />
                <span className="agent-progress-block__label">{step.label}</span>
                <span className="agent-progress-block__state">
                  {progressLabels[step.state]}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )

    case 'commandPreview':
      return (
        <section className="command-preview-block" aria-label={block.commandName}>
          <div className="command-preview-block__eyebrow">Capability Command</div>
          <h3>{block.commandName}</h3>
          <p>{block.description}</p>
          <dl>
            {block.parameters.map((parameter) => (
              <div key={parameter.label} className="command-preview-block__row">
                <dt>{parameter.label}</dt>
                <dd>{parameter.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )

    case 'visualEvidence':
      return (
        <pre className="image-placeholder-block" aria-label={block.title}>
          <code>{JSON.stringify({ image: `图片：${block.caption}` })}</code>
        </pre>
      )

    case 'candidateMoleculeTable':
      return (
        <section className="candidate-table-block" aria-label={block.title}>
          <h3>{block.title}</h3>
          <div className="candidate-table-block__scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mutation</th>
                  <th>Kd</th>
                  <th>Risk</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="candidate-table-block__id">{row.id}</td>
                    <td>{row.mutation}</td>
                    <td>{row.predictedKd}</td>
                    <td>
                      <span
                        className={`candidate-table-block__risk candidate-table-block__risk--${row.risk}`}
                      >
                        {riskLabels[row.risk]}
                      </span>
                    </td>
                    <td>{row.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )

    case 'candidateEvidenceTable':
      return (
        <section className="candidate-evidence-table-block" aria-label={block.title}>
          <h3>{block.title}</h3>
          <div className="candidate-evidence-table-block__scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Group</th>
                  {block.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Risk</th>
                  <th>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="candidate-evidence-table-block__id">{row.id}</td>
                    <td>{row.group}</td>
                    {block.columns.map((column) => (
                      <td key={column.key}>{row.evidence[column.key] ?? ''}</td>
                    ))}
                    <td>
                      <span
                        className={`candidate-evidence-table-block__risk candidate-evidence-table-block__risk--${row.risk}`}
                      >
                        {riskLabels[row.risk]}
                      </span>
                    </td>
                    <td>{row.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )

    case 'experimentOrderDraft':
      return (
        <section className="experiment-order-block" aria-label={block.title}>
          <div className="experiment-order-block__header">
            <div>
              <div className="experiment-order-block__eyebrow">Experiment Order Draft</div>
              <h3>{block.title}</h3>
              <p>{block.orderId}</p>
            </div>
            <span className={`experiment-order-block__status experiment-order-block__status--${block.status}`}>
              {block.status}
            </span>
          </div>
          <dl>
            {block.items.map((item) => (
              <div key={item.label} className="experiment-order-block__row">
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )

    case 'approvalGatePreview':
      return (
        <section className="approval-gate-block" aria-label={block.title}>
          <div className="approval-gate-block__type">{block.approvalType}</div>
          <h3>{block.title}</h3>
          <p>{block.description}</p>
          <button type="button" disabled>
            Awaiting approval
          </button>
        </section>
      )

    case 'designHandoffBrief':
      return <DesignHandoffBrief block={block} />

    case 'experimentOrderSummary':
      return <ExperimentOrderSummary block={block} />

    case 'sampleScopePanel':
      return <SampleScopePanel block={block} />

    case 'assayPanelTable':
      return <AssayPanelTable block={block} />

    case 'plateMapMini':
      return <PlateMapMini block={block} />

    case 'sampleInventoryLink':
      return <SampleInventoryLink block={block} />

    case 'materialSopReadiness':
      return <MaterialSopReadiness block={block} />

    case 'approvalGateCard':
      return <ApprovalGateCard block={block} />

    case 'executionTaskStatus':
      return <ExecutionTaskStatus block={block} />

    case 'experimentNotebookSummary':
      return <ExperimentNotebookSummary block={block} />

    case 'runLogTable':
      return <RunLogTable block={block} />

    case 'anomalyReviewTable':
      return <AnomalyReviewTable block={block} />

    case 'resultPackageChecklist':
      return <ResultPackageChecklist block={block} />

    case 'dataChart':
      return <EChartDataChart block={block} />

    case 'capabilityRunReplay':
      return (
        <details className="capability-run-block">
          <summary className="capability-run-block__summary">
            <span>{block.commandName}</span>
            {' · '}
            <span>{eventStatusLabels[block.status]}</span>
            {' · '}
            <span>{block.summary}</span>
          </summary>
          <dl className="capability-run-block__details">
            <ReplayDetail label="Capability" value={block.commandName} />
            <ReplayDetail label="Status" value={eventStatusLabels[block.status]} />
            <ReplayDetail label="Input" value={block.input} />
            <ReplayDetail label="Output" value={block.output} />
            <ReplayDetail label="Duration" value={block.duration} />
            <ReplayDetail
              label="Artifacts"
              value={
                block.artifacts?.length
                  ? block.artifacts.map((artifact) => ({
                      name: artifact.name,
                      kind: artifact.kind,
                      description: artifact.description,
                    }))
                  : 'None'
              }
            />
          </dl>
        </details>
      )

    case 'humanConfirmation':
      return (
        <section className="event-replay-block event-replay-block--confirmation">
          <div className="event-replay-block__title">{block.title}</div>
          <div className="event-replay-block__meta">
            {block.confirmedBy} · {block.confirmedAt}
          </div>
          <p>{block.decision}</p>
        </section>
      )

    case 'approvalRequestReplay':
      return (
        <section className="event-replay-block event-replay-block--approval">
          <div className="event-replay-block__title">{block.title}</div>
          <div className="event-replay-block__meta">
            {block.approvalType} · {block.status} · {block.decidedBy} ·{' '}
            {block.decidedAt}
          </div>
          <p>{block.decision}</p>
          <p>{block.requestSummary}</p>
        </section>
      )

    case 'elapsedWorkReplay':
      return (
        <section className="event-replay-block event-replay-block--elapsed">
          <div className="event-replay-block__title">{block.target}</div>
          <div className="event-replay-block__meta">
            {block.status} · {block.elapsed}
          </div>
          <p>{block.summary}</p>
        </section>
      )

    case 'scientificFigure':
      return (
        <figure className="scientific-figure-block">
          {block.src ? (
            <img
              src={block.src}
              alt={block.alt}
              width={block.width}
              height={block.height}
              loading="lazy"
              decoding="async"
              style={{ aspectRatio: `${block.width} / ${block.height}` }}
            />
          ) : (
            <pre className="image-placeholder-block" aria-label={block.title}>
              <code>
                {JSON.stringify(
                  {
                    figure: block.figureId,
                    title: block.title,
                    description: block.description,
                    placeholder: block.placeholder,
                  },
                  null,
                  2,
                )}
              </code>
            </pre>
          )}
          <figcaption>
            <span>{block.title}</span>
            {block.description}
          </figcaption>
        </figure>
      )

    case 'pipelineDag':
      return <PipelineDagBlock block={block} />
  }
}

function ReplayDetail({
  label,
  value,
}: {
  label: string
  value: unknown
}) {
  return (
    <div className="capability-run-block__row">
      <dt>{label}</dt>
      <dd>{formatReplayValue(value)}</dd>
    </div>
  )
}

function formatReplayValue(value: unknown) {
  if (typeof value === 'string') {
    return value
  }

  return JSON.stringify(value, null, 2)
}

function DesignHandoffBrief({
  block,
}: {
  block: BlockOf<'designHandoffBrief'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--handoff"
      aria-label={block.designPackage}
    >
      <ExperimentModuleHeader
        eyebrow="Design Handoff"
        title={block.designPackage}
        meta={`${block.libraryId} · ${block.parentEnzyme}`}
      />
      <KeyValueGrid
        rows={[
          ['Variant range', block.variantRange],
          ['Source files', block.sourceFiles.join(' / ')],
        ]}
      />
      <div className="experiment-module-block__section-grid">
        <ModuleList title="Execution constraints" items={block.executionConstraints} />
        <ModuleList title="Forbidden actions" items={block.forbiddenActions} />
      </div>
    </section>
  )
}

function ExperimentOrderSummary({
  block,
}: {
  block: BlockOf<'experimentOrderSummary'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--order"
      aria-label={block.orderId}
    >
      <ExperimentModuleHeader
        eyebrow="Experiment Order"
        title={block.title}
        meta={block.orderId}
        status={`${block.status} · review ${block.reviewStatus}`}
      />
      <KeyValueGrid
        rows={[
          ['Project', block.projectId],
          ['Library', block.libraryId],
          ['Parent enzyme', block.parentEnzyme],
          ['Owner', block.owner],
          ['Created', block.createdAt],
          ['Due', block.dueAt],
          ['Scope lock', block.scopeLock],
          ['Purpose', block.purpose],
          ...block.rows.map((row) => [row.label, row.value] as [string, string]),
        ]}
      />
    </section>
  )
}

function SampleScopePanel({
  block,
}: {
  block: BlockOf<'sampleScopePanel'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--sample"
      aria-label={block.libraryId}
    >
      <ExperimentModuleHeader
        eyebrow="Sample Scope"
        title={block.libraryId}
        meta={`${block.variantCount} variants · locked by ${block.lockedBy}`}
      />
      <KeyValueGrid
        rows={[
          ['Variant range', block.variantRange],
          ['Sample source', block.sampleSource],
          ['Replicates', block.replicatePlan],
          ['Controls', block.controls.join(' / ')],
        ]}
      />
      <ModuleList title="Exclusions" items={block.exclusions} />
    </section>
  )
}

function AssayPanelTable({
  block,
}: {
  block: BlockOf<'assayPanelTable'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--assay"
      aria-label={block.sopReference}
    >
      <ExperimentModuleHeader
        eyebrow="Assay Panel"
        title={block.sopReference}
        meta={block.panelStatus}
      />
      <div className="experiment-module-table-scroll">
        <table className="experiment-module-table">
          <thead>
            <tr>
              <th>Assay</th>
              <th>Purpose</th>
              <th>Readout</th>
              <th>Method</th>
              <th>Replicates</th>
              <th>QC rule</th>
            </tr>
          </thead>
          <tbody>
            {block.assays.map((assay) => (
              <tr key={assay.name}>
                <td className="experiment-module-table__id">{assay.name}</td>
                <td>{assay.purpose}</td>
                <td>{assay.readout}</td>
                <td>{assay.method}</td>
                <td>{assay.replicateCount}</td>
                <td>{assay.qcRule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PlateMapMini({
  block,
}: {
  block: BlockOf<'plateMapMini'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--plate"
      aria-label={block.plateMapId}
    >
      <ExperimentModuleHeader
        eyebrow="Plate Map"
        title={block.plateMapId}
        meta={`${block.plateCount} plates · ${block.dimensions} · ${block.locked ? 'locked' : 'open'}`}
      />
      <div className="experiment-module-block__plate">
        {block.wells.map((well) => (
          <span key={well.position} className="experiment-module-block__well">
            <strong>{well.position}</strong>
            {well.label}
            <small>{well.group}</small>
          </span>
        ))}
      </div>
      <div className="experiment-module-block__legend">
        {block.legend.map((item) => (
          <span key={item.label}>
            <i aria-hidden="true" data-color={item.color} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  )
}

function SampleInventoryLink({
  block,
}: {
  block: BlockOf<'sampleInventoryLink'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--inventory"
      aria-label={block.sampleBatchId}
    >
      <ExperimentModuleHeader
        eyebrow="Sample Inventory"
        title={block.sampleBatchId}
        meta={block.inventoryStatus}
      />
      <KeyValueGrid
        rows={[
          ['Storage', block.storageCondition],
          ['Aliquot plan', block.aliquotPlan],
          ['Plate link', block.plateLinkRecord],
          [
            'Missing items',
            block.missingItems.length ? block.missingItems.join(' / ') : 'None',
          ],
        ]}
      />
    </section>
  )
}

function MaterialSopReadiness({
  block,
}: {
  block: BlockOf<'materialSopReadiness'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--readiness"
      aria-label={block.workflowTemplate}
    >
      <ExperimentModuleHeader
        eyebrow="Material / SOP / Route"
        title={block.workflowTemplate}
        meta={`${block.deviceType} · ${block.deviceId}`}
      />
      <KeyValueGrid
        rows={[
          ['Substrate lot', block.substrateLot],
          ['Buffer', block.buffer],
          ['SOP', block.sopVersion],
          ['Location', block.labLocation],
          ['Route', block.experimentRoute],
        ]}
      />
      <ModuleList title="Readiness checks" items={block.readinessChecks} />
    </section>
  )
}

function ApprovalGateCard({
  block,
}: {
  block: BlockOf<'approvalGateCard'>
}) {
  const detailRows =
    block.details?.map((item) => [item.label, item.value] as [string, string]) ?? []
  const detailLabels = new Set(detailRows.map(([label]) => label))
  const fallbackRows: Array<[string, string]> = [
    ...(!detailLabels.has('审批人') && block.approver
      ? ([['审批人', block.approver]] as Array<[string, string]>)
      : []),
    ...(block.status === 'approved' &&
    block.decidedAt &&
    !detailLabels.has('审批通过时间')
      ? ([['审批通过时间', block.decidedAt]] as Array<[string, string]>)
      : []),
    ['处理结果', block.decision ?? '等待审批人处理'],
  ]

  return (
    <section
      className={`approval-module-block approval-module-block--${block.status}`}
      aria-label={block.title}
    >
      <div className="approval-module-block__header">
        <div>
          <div className="approval-module-block__eyebrow">
            Formal Approval · {block.approvalType}
          </div>
          <h3>{block.title}</h3>
          <p>{block.riskSummary}</p>
        </div>
        <span>{approvalStatusLabels[block.status]}</span>
      </div>
      <KeyValueGrid
        rows={[
          ...(block.approvalAdvice ? [['审批建议', block.approvalAdvice] as [string, string]] : []),
          ...detailRows,
          ...fallbackRows,
        ]}
      />
      <ModuleList title="Checklist" items={block.checklist} />
    </section>
  )
}

function ExecutionTaskStatus({
  block,
}: {
  block: BlockOf<'executionTaskStatus'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--task"
      aria-label={block.taskId}
    >
      <ExperimentModuleHeader
        eyebrow="Experiment Task"
        title={block.taskId}
        meta={`${block.stage} · ${block.status}`}
      />
      <KeyValueGrid
        rows={[
          ['Order', block.orderId],
          ['Execution ref', block.croRef],
          ['Owner', block.owner],
          ['Started', block.startedAt],
          ['Completed', block.completedAt ?? 'In progress'],
        ]}
      />
      <ModuleList title="Records" items={block.records} />
    </section>
  )
}

function ExperimentNotebookSummary({
  block,
}: {
  block: BlockOf<'experimentNotebookSummary'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--notebook"
      aria-label={block.notebookId}
    >
      <ExperimentModuleHeader
        eyebrow="Experiment Notebook"
        title={block.notebookId}
        meta={`${block.taskId} · ${block.status}`}
        status="callback ingested"
      />
      <KeyValueGrid
        rows={[
          ['Order', block.orderId],
          ['Estimated submit by', block.estimatedSubmitBy],
          ['Submitted at', block.submittedAt],
          ['Submitted by', block.submittedBy],
          ['Callback', block.callbackId],
        ]}
      />
      <div className="experiment-module-table-scroll">
        <table className="experiment-module-table experiment-module-table--notebook">
          <thead>
            <tr>
              <th>Section</th>
              <th>Summary</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {block.recordSections.map((section) => (
              <tr key={section.label}>
                <td className="experiment-module-table__id">{section.label}</td>
                <td>{section.value}</td>
                <td>{section.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="experiment-module-block__section-grid">
        <ModuleList title="Observations" items={block.observations} />
        <ModuleList title="Attachments" items={block.attachments} />
      </div>
    </section>
  )
}

function RunLogTable({
  block,
}: {
  block: BlockOf<'runLogTable'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--runlog"
      aria-label={block.logId}
    >
      <ExperimentModuleHeader eyebrow="Run Log" title={block.logId} meta={block.taskId} />
      <div className="experiment-module-table-scroll">
        <table className="experiment-module-table experiment-module-table--run-log">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>System</th>
              <th>Event</th>
              <th>Record</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={`${row.time}-${row.recordId}`}>
                <td>{row.time}</td>
                <td>{row.actor}</td>
                <td>{row.system}</td>
                <td>{row.event}</td>
                <td className="experiment-module-table__id">{row.recordId}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AnomalyReviewTable({
  block,
}: {
  block: BlockOf<'anomalyReviewTable'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--anomaly"
      aria-label={block.anomalyLogId}
    >
      <ExperimentModuleHeader
        eyebrow="Anomaly Review"
        title={block.anomalyLogId}
        meta={block.policy}
      />
      <div className="experiment-module-table-scroll">
        <table className="experiment-module-table experiment-module-table--anomaly">
          <thead>
            <tr>
              <th>Sample</th>
              <th>Well</th>
              <th>Anomaly</th>
              <th>Raw kept</th>
              <th>Auto excluded</th>
              <th>Owner</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={`${row.sampleId}-${row.well}`}>
                <td className="experiment-module-table__id">{row.sampleId}</td>
                <td>{row.well}</td>
                <td>{row.anomalyType}</td>
                <td>{row.rawReadingPreserved}</td>
                <td>{row.autoExcluded}</td>
                <td>{row.reviewOwner}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ResultPackageChecklist({
  block,
}: {
  block: BlockOf<'resultPackageChecklist'>
}) {
  return (
    <section
      className="experiment-module-block experiment-module-block--result"
      aria-label={block.packageName}
    >
      <ExperimentModuleHeader
        eyebrow="Result Package"
        title={block.packageName}
        meta={`${block.receivedAt} · ${block.readyForAnalysis ? 'ready for analysis' : 'not ready'}`}
      />
      <div className="experiment-module-block__section-grid">
        <ModuleList title="Files" items={block.files} />
        <ModuleList title="Schema checks" items={block.schemaChecks} />
        <ModuleList
          title="Missing items"
          items={block.missingItems.length ? block.missingItems : ['None']}
        />
        <ModuleList title="Archive locations" items={block.archiveLocations} />
      </div>
    </section>
  )
}

function ExperimentModuleHeader({
  eyebrow,
  title,
  meta,
  status,
}: {
  eyebrow: string
  title: string
  meta?: string
  status?: string
}) {
  return (
    <div className="experiment-module-block__header">
      <div>
        <div className="experiment-module-block__eyebrow">{eyebrow}</div>
        <h3>{title}</h3>
        {meta ? <p>{meta}</p> : null}
      </div>
      {status ? <span className="experiment-module-block__status">{status}</span> : null}
    </div>
  )
}

function KeyValueGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <dl className="experiment-module-block__grid">
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="experiment-module-block__row">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function ModuleList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="experiment-module-block__list">
      <div className="experiment-module-block__list-title">{title}</div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const MemoizedConversationBlockView = memo(ConversationBlockView)
const MemoizedConversationBlocks = memo(ConversationBlocks)

export { MemoizedConversationBlockView as ConversationBlockView }
export default MemoizedConversationBlocks
