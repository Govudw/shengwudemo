import type { PipelineDagBlock as PipelineDagBlockData } from '../data/conversationTypes'
import PipelineDagCanvas from './PipelineDagCanvas'

type PipelineDagBlockProps = {
  block: PipelineDagBlockData
}

function PipelineDagBlock({ block }: PipelineDagBlockProps) {
  const metadata = `DAG ${block.version} · ${block.status}`
  const completedCount = block.completedNodeIds?.length ?? 0
  const totalCount = block.dag.nodes.length
  const progressSummary =
    block.progressSummary ??
    (completedCount
      ? `${completedCount} / ${totalCount} 个节点已通过`
      : block.summary)
  const canvas = (
    <div className="pipeline-dag-block__canvas-scroll">
      <PipelineDagCanvas
        dag={block.dag}
        mode="conversation"
        completedNodeIds={block.completedNodeIds}
        activeNodeId={block.activeNodeId}
      />
    </div>
  )

  if (block.defaultCollapsed) {
    return (
      <details className="pipeline-dag-block pipeline-dag-block--progress" aria-label={block.title}>
        <summary className="pipeline-dag-block__summary-line">
          <span className="pipeline-dag-block__summary-check" aria-hidden="true">
            ✅
          </span>
          <span className="pipeline-dag-block__summary-text">
            {progressSummary}
          </span>
          <span className="pipeline-dag-block__summary-count">
            {completedCount}/{totalCount}
          </span>
        </summary>
        <div className="pipeline-dag-block__expanded">
          <div className="pipeline-dag-block__header">
            <div>
              <div className="pipeline-dag-block__eyebrow">Pipeline DAG</div>
              <h3>{block.title}</h3>
              <div className="pipeline-dag-block__meta">{metadata}</div>
            </div>
          </div>
          <p>{block.summary}</p>
          {canvas}
        </div>
      </details>
    )
  }

  return (
    <section className="pipeline-dag-block" aria-label={block.title}>
      <div className="pipeline-dag-block__header">
        <div>
          <div className="pipeline-dag-block__eyebrow">Pipeline DAG</div>
          <h3>{block.title}</h3>
          <div className="pipeline-dag-block__meta">{metadata}</div>
        </div>
      </div>
      <p>{block.summary}</p>
      {canvas}
    </section>
  )
}

export default PipelineDagBlock
