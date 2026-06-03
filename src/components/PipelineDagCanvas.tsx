import type { PipelineDag } from '../data/mockCapabilities'
import {
  dagNodeKindLabels,
  dagNodeSubtypeLabels,
  getDagFitViewportStyle,
  getDagNodePositions,
} from './pipelineDagCanvasUtils'

type PipelineDagCanvasMode = 'preview' | 'modal' | 'conversation'

type PipelineDagCanvasProps = {
  dag: PipelineDag
  mode: PipelineDagCanvasMode
  viewportMode?: 'default' | 'fit'
  selectedNodeId?: string | null
  onSelectNode?: (id: string) => void
}

function PipelineDagCanvas({
  dag,
  mode,
  viewportMode = 'default',
  selectedNodeId,
  onSelectNode,
}: PipelineDagCanvasProps) {
  const positions = getDagNodePositions(dag)
  const viewportStyle =
    mode === 'modal' && viewportMode === 'fit'
      ? getDagFitViewportStyle(positions)
      : undefined

  return (
    <div className={`capabilities-dag-canvas capabilities-dag-canvas--${mode}`}>
      <div
        className="capabilities-dag-canvas__viewport"
        data-viewport={mode === 'modal' ? viewportMode : mode}
        style={viewportStyle}
      >
        <svg
          className="capabilities-dag-canvas__edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {dag.edges.map((edge) => {
            const from = positions[edge.from]
            const to = positions[edge.to]

            if (!from || !to) {
              return null
            }

            const midY = (from.y + to.y) / 2

            return (
              <g key={`${edge.from}-${edge.to}`}>
                <path
                  d={`M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`}
                  className="capabilities-dag-edge"
                />
                {edge.label && mode === 'modal' ? (
                  <text
                    x={(from.x + to.x) / 2}
                    y={midY - 1.5}
                    className="capabilities-dag-edge__label"
                  >
                    {edge.label}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
        {dag.nodes.map((node) => {
          const position = positions[node.id]

          if (!position) {
            return null
          }

          const isSelected = node.id === selectedNodeId
          const nodeClassName = `capabilities-dag-node capabilities-dag-node--${node.kind}${
            isSelected ? ' capabilities-dag-node--selected' : ''
          }`
          const nodeStyle = {
            left: `${position.x}%`,
            top: `${position.y}%`,
          }
          const nodeContent = (
            <>
              <span className="capabilities-dag-node__title">
                {node.shortTitle}
              </span>
              <span className="capabilities-dag-node__meta">
                {dagNodeKindLabels[node.kind]}
              </span>
              {node.subtype ? (
                <span className="capabilities-dag-node__subtype">
                  {dagNodeSubtypeLabels[node.subtype]}
                </span>
              ) : null}
            </>
          )

          if (!onSelectNode) {
            return (
              <div
                key={node.id}
                className={nodeClassName}
                style={nodeStyle}
                aria-label={`${node.title}，${dagNodeKindLabels[node.kind]}`}
              >
                {nodeContent}
              </div>
            )
          }

          return (
            <button
              key={node.id}
              type="button"
              className={nodeClassName}
              style={nodeStyle}
              aria-label={`${node.title}，${dagNodeKindLabels[node.kind]}`}
              aria-pressed={isSelected}
              onClick={() => onSelectNode(node.id)}
            >
              {nodeContent}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default PipelineDagCanvas
