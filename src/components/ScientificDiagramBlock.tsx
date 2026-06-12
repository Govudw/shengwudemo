import type { ScientificDiagramBlock as ScientificDiagramBlockData } from '../data/conversationTypes'

type ScientificDiagramBlockProps = {
  block: ScientificDiagramBlockData
}

const evidenceNodes = [
  {
    key: 'sequence',
    label: 'Sequence DB',
    note: 'domain boundaries',
    tone: 'structure',
    x: 22,
    y: 32,
  },
  {
    key: 'internal',
    label: 'Internal Biology',
    note: 'D2/D3 hypothesis',
    tone: 'internal',
    x: 26,
    y: 68,
  },
  {
    key: 'structure',
    label: 'Structure Assets',
    note: 'ECD models · confidence mixed',
    tone: 'structure',
    x: 77,
    y: 27,
  },
  {
    key: 'public',
    label: 'Public Antibody Space',
    note: 'family context only',
    tone: 'public',
    x: 82,
    y: 58,
  },
  {
    key: 'patent',
    label: 'Patent / FTO',
    note: 'similarity guardrails',
    tone: 'risk',
    x: 66,
    y: 81,
  },
] as const

const epitopeAnnotations = [
  {
    key: 'e1',
    label: 'E1',
    title: 'E1 · blocking-core hypothesis',
    note: 'Prioritize binders touching D2/D3 interface; validate by functional blocking in R1.',
    tone: 'internal',
  },
  {
    key: 'e2',
    label: 'E2',
    title: 'E2 · adjacent / allosteric region',
    note: 'Keep as backup epitope class if direct blocking surface is too narrow.',
    tone: 'public',
  },
  {
    key: 'e3',
    label: 'E3',
    title: 'E3 · non-blocking control',
    note: 'Reserve for specificity and assay interpretation, not therapeutic ranking.',
    tone: 'control',
  },
] as const

function ScientificDiagramBlock({ block }: ScientificDiagramBlockProps) {
  return (
    <section
      className="scientific-diagram-block"
      data-diagram-kind={block.diagramKind}
      aria-label={block.title}
    >
      <header className="scientific-diagram-block__header">
        <div>
          <div className="scientific-diagram-block__eyebrow">Frontend Diagram</div>
          <h3>{block.title}</h3>
          <p>{block.description}</p>
        </div>
      </header>
      {block.diagramKind === 'targetxEvidenceNetwork' ? (
        <TargetXEvidenceNetwork />
      ) : (
        <TargetXEpitopeHypothesis />
      )}
    </section>
  )
}

function TargetXEvidenceNetwork() {
  return (
    <div className="targetx-evidence-diagram">
      <div className="targetx-evidence-diagram__canvas">
        <svg
          className="targetx-evidence-diagram__links"
          viewBox="0 0 100 100"
          aria-hidden="true"
          focusable="false"
        >
          {evidenceNodes.map((node) => (
            <line
              key={node.key}
              x1="50"
              y1="50"
              x2={node.x}
              y2={node.y}
              className={`targetx-evidence-diagram__link targetx-evidence-diagram__link--${node.tone}`}
            />
          ))}
        </svg>
        <div className="targetx-evidence-diagram__target">
          <span>Target-X</span>
          <small>D1 / D2 / D3 ECD</small>
        </div>
        {evidenceNodes.map((node) => (
          <div
            key={node.key}
            className={`targetx-evidence-node targetx-evidence-node--${node.tone}`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <strong>{node.label}</strong>
            <span>{node.note}</span>
          </div>
        ))}
        <div className="targetx-evidence-diagram__uncertainty">
          <strong>Uncertainty note</strong>
          <span>Blocking epitope remains a hypothesis until R1 assay validation.</span>
        </div>
      </div>
      <div className="targetx-evidence-diagram__legend" aria-label="Evidence color legend">
        <LegendItem tone="internal" label="internal hypothesis" />
        <LegendItem tone="structure" label="structure / sequence" />
        <LegendItem tone="public" label="public antibody space" />
        <LegendItem tone="risk" label="similarity and patent risk" />
      </div>
    </div>
  )
}

function TargetXEpitopeHypothesis() {
  return (
    <div className="targetx-epitope-diagram">
      <div className="targetx-epitope-diagram__track" aria-label="Target-X domain map">
        <div className="targetx-domain targetx-domain--d1">
          <span>D1</span>
          <small>N-terminal domain</small>
        </div>
        <div className="targetx-domain-connector" />
        <div className="targetx-domain targetx-domain--d2">
          <span>D2</span>
          <small>interface-bearing domain</small>
        </div>
        <div className="targetx-domain-connector" />
        <div className="targetx-domain targetx-domain--d3">
          <span>D3</span>
          <small>C-terminal ECD domain</small>
        </div>
        <div className="targetx-epitope-marker targetx-epitope-marker--e1">
          <span>E1</span>
          <small>D2/D3 interface</small>
        </div>
        <div className="targetx-epitope-marker targetx-epitope-marker--e2">
          <span>E2</span>
          <small>adjacent</small>
        </div>
        <div className="targetx-epitope-marker targetx-epitope-marker--e3">
          <span>E3</span>
          <small>control</small>
        </div>
      </div>
      <div className="targetx-epitope-diagram__legend">
        {epitopeAnnotations.map((item) => (
          <div
            key={item.key}
            className={`targetx-epitope-diagram__legend-item targetx-epitope-diagram__legend-item--${item.tone}`}
          >
            <i aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              <span>{item.note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LegendItem({
  tone,
  label,
}: {
  tone: 'internal' | 'structure' | 'public' | 'risk'
  label: string
}) {
  return (
    <span className={`targetx-evidence-diagram__legend-item targetx-evidence-diagram__legend-item--${tone}`}>
      <i aria-hidden="true" />
      {label}
    </span>
  )
}

export default ScientificDiagramBlock
