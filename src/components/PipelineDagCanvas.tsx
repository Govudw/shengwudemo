import type { CSSProperties } from 'react'
import type {
  PipelineDag,
  PipelineDagNodeKind,
  PipelineDagNodeResource,
  PipelineDagNodeSubtype,
} from '../data/mockCapabilities'

export const dagNodeKindLabels: Record<PipelineDagNodeKind, string> = {
  input: '输入',
  operation: '操作',
  'human-gate': 'Human Gate / 人工确认',
  'qc-decision': 'QC Decision / QC 判断',
  output: '输出',
}

export const dagNodeSubtypeLabels: Record<PipelineDagNodeSubtype, string> = {
  sample: '样本',
  'lab-operation': '实验操作',
  transport: '转运',
  'cro-handoff': 'CRO 交接',
  report: '报告',
  data: '数据',
}

export const dagResourceLabels: Record<PipelineDagNodeResource['kind'], string> =
  {
    device: '设备',
    robot: 'Robot',
    'transport-vehicle': '转运工具',
    'island-bench': '岛式台架',
    'sample-storage': '样本存储',
    'cro-order': 'CRO 订单',
    'lab-system': '实验系统',
    'data-system': '数据系统',
  }

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

export function getDagNodePositions(dag: PipelineDag) {
  if (!dag.nodes.length) {
    return {}
  }

  const maxRow = Math.max(...dag.nodes.map((node) => node.layout.row), 1)
  const maxColumn = Math.max(...dag.nodes.map((node) => node.layout.column), 0)

  return Object.fromEntries(
    dag.nodes.map((node) => {
      const x =
        maxColumn === 0 ? 50 : 12 + (node.layout.column / maxColumn) * 76
      const y = 8 + (node.layout.row / maxRow) * 84

      return [node.id, { x, y }]
    }),
  ) as Record<string, { x: number; y: number }>
}

export function getDagFitViewportStyle(
  positions: Record<string, { x: number; y: number }>,
): CSSProperties {
  const points = Object.values(positions)

  if (!points.length) {
    return {}
  }

  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const widthSpan = Math.max(maxX - minX, 20) + 18
  const heightSpan = Math.max(maxY - minY, 20) + 18
  const scale = Math.min(1, 88 / widthSpan, 88 / heightSpan)

  return {
    transform: `translate(${50 - centerX}%, ${50 - centerY}%) scale(${scale.toFixed(3)})`,
  }
}

export default PipelineDagCanvas
