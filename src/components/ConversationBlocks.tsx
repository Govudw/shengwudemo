import type { ConversationBlock } from '../data/conversationTypes'
import { memo } from 'react'

type ConversationBlocksProps = {
  blocks: ConversationBlock[]
}

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

function ConversationBlocks({ blocks }: ConversationBlocksProps) {
  return (
    <div className="conversation-blocks">
      {blocks.map((block, index) => (
        <MemoizedConversationBlockView key={`${block.type}-${index}`} block={block} />
      ))}
    </div>
  )
}

function ConversationBlockView({ block }: { block: ConversationBlock }) {
  switch (block.type) {
    case 'projectFile':
      return (
        <div className="project-file-block">
          <div className="project-file-block__kind">{block.fileKind}</div>
          <div className="project-file-block__body">
            <div className="project-file-block__name">{block.fileName}</div>
            <div className="project-file-block__location">{block.location}</div>
            <p>{block.note}</p>
          </div>
        </div>
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

const MemoizedConversationBlockView = memo(ConversationBlockView)
const MemoizedConversationBlocks = memo(ConversationBlocks)

export { MemoizedConversationBlockView as ConversationBlockView }
export default MemoizedConversationBlocks
