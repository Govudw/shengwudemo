import type { PipelineDagBlock as PipelineDagBlockData } from '../data/conversationTypes'
import PipelineDagCanvas from './PipelineDagCanvas'

type PipelineDagBlockProps = {
  block: PipelineDagBlockData
}

function PipelineDagBlock({ block }: PipelineDagBlockProps) {
  const metadata = `DAG ${block.version} · ${block.status}`

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
      <div className="pipeline-dag-block__canvas-scroll">
        <PipelineDagCanvas dag={block.dag} mode="conversation" />
      </div>
    </section>
  )
}

export default PipelineDagBlock
