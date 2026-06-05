import {
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { PipelineDag } from '../data/mockCapabilities'
import {
  dagNodeKindLabels,
  dagNodeSubtypeLabels,
  getDagCanvasSize,
  getDagNodePositions,
} from './pipelineDagCanvasUtils'

type PipelineDagCanvasMode = 'preview' | 'modal' | 'conversation'

type PipelineDagCanvasProps = {
  dag: PipelineDag
  mode: PipelineDagCanvasMode
  viewportMode?: 'default' | 'fit'
  completedNodeIds?: string[]
  activeNodeId?: string
  selectedNodeId?: string | null
  onSelectNode?: (id: string) => void
}

function PipelineDagCanvas({
  dag,
  mode,
  viewportMode = 'default',
  completedNodeIds = [],
  activeNodeId,
  selectedNodeId,
  onSelectNode,
}: PipelineDagCanvasProps) {
  const positions = useMemo(() => getDagNodePositions(dag), [dag])
  const completedNodeIdSet = useMemo(
    () => new Set(completedNodeIds),
    [completedNodeIds],
  )
  const canvasSize = useMemo(() => getDagCanvasSize(positions), [positions])
  const graphBounds = useMemo(() => getDagGraphBounds(positions), [positions])
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const defaultView = useMemo(
    () => getDefaultCanvasView(mode, canvasSize),
    [mode, canvasSize],
  )
  const fitView = useMemo(
    () => getFitCanvasView(mode, graphBounds, containerSize),
    [mode, graphBounds, containerSize],
  )
  const [view, setView] = useState(
    viewportMode === 'fit' ? fitView : defaultView,
  )
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{
    startX: number
    startY: number
    originX: number
    originY: number
  } | null>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current

    if (!canvasElement) {
      return undefined
    }

    const measuredElement = canvasElement

    function updateContainerSize() {
      const { width, height } = measuredElement.getBoundingClientRect()
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)

      if (nextWidth <= 0 || nextHeight <= 0) {
        return
      }

      setContainerSize((currentSize) =>
        currentSize.width === nextWidth && currentSize.height === nextHeight
          ? currentSize
          : { width: nextWidth, height: nextHeight },
      )

      if (viewportMode === 'fit') {
        setView(
          getFitCanvasView(mode, graphBounds, {
            width: nextWidth,
            height: nextHeight,
          }),
        )
      }
    }

    const initialMeasureFrame = window.requestAnimationFrame(updateContainerSize)

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        window.cancelAnimationFrame(initialMeasureFrame)
      }
    }

    const resizeObserver = new ResizeObserver(updateContainerSize)
    resizeObserver.observe(canvasElement)

    return () => {
      window.cancelAnimationFrame(initialMeasureFrame)
      resizeObserver.disconnect()
    }
  }, [graphBounds, mode, viewportMode])

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const dragState = dragRef.current

      if (!dragState) {
        return
      }

      setView((currentView) => ({
        ...currentView,
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      }))
    }

    function handleMouseUp() {
      dragRef.current = null
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  function handleMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return
    }

    const target = event.target as HTMLElement

    if (target.closest('.capabilities-dag-node')) {
      return
    }

    event.preventDefault()
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    }
    setIsDragging(true)
  }

  const viewportStyle = {
    width: `${canvasSize.width}px`,
    height: `${canvasSize.height}px`,
    transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
  }

  return (
    <div
      className={`capabilities-dag-canvas capabilities-dag-canvas--${mode}`}
      data-dragging={isDragging ? 'true' : 'false'}
      aria-label="可拖拽 Pipeline DAG 画布"
      ref={canvasRef}
      onMouseDown={handleMouseDown}
    >
      <div
        className="capabilities-dag-canvas__viewport"
        data-viewport={mode === 'modal' ? viewportMode : mode}
        style={viewportStyle}
      >
        <svg
          className="capabilities-dag-canvas__edges"
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
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
          const isCompleted = completedNodeIdSet.has(node.id)
          const isActive = node.id === activeNodeId
          const nodeClassName = `capabilities-dag-node capabilities-dag-node--${node.kind}${
            isSelected ? ' capabilities-dag-node--selected' : ''
          }${isCompleted ? ' capabilities-dag-node--completed' : ''}${
            isActive ? ' capabilities-dag-node--active' : ''
          }`
          const nodeStyle = {
            left: position.x,
            top: position.y,
          }
          const nodeContent = (
            <>
              {isCompleted ? (
                <span
                  className="capabilities-dag-node__completion-mark"
                  aria-hidden="true"
                >
                  ✅
                </span>
              ) : null}
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
                aria-label={`${node.title}，${dagNodeKindLabels[node.kind]}${
                  isCompleted ? '，已通过' : ''
                }`}
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
              aria-label={`${node.title}，${dagNodeKindLabels[node.kind]}${
                isCompleted ? '，已通过' : ''
              }`}
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

type DagCanvasView = {
  x: number
  y: number
  scale: number
}

type DagGraphBounds = {
  left: number
  top: number
  width: number
  height: number
}

function getDagGraphBounds(
  positions: Record<string, { x: number; y: number }>,
): DagGraphBounds {
  const points = Object.values(positions)

  if (!points.length) {
    return { left: 0, top: 0, width: 720, height: 320 }
  }

  const nodeHorizontalPadding = 78
  const nodeVerticalPadding = 46
  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const left = minX - nodeHorizontalPadding
  const top = minY - nodeVerticalPadding

  return {
    left,
    top,
    width: maxX - minX + nodeHorizontalPadding * 2,
    height: maxY - minY + nodeVerticalPadding * 2,
  }
}

function getDefaultCanvasView(
  mode: PipelineDagCanvasMode,
  canvasSize: { width: number; height: number },
): DagCanvasView {
  if (mode === 'preview') {
    return {
      x: 18,
      y: 18,
      scale: canvasSize.width > 980 ? 0.74 : 0.9,
    }
  }

  if (mode === 'conversation') {
    return {
      x: 18,
      y: 18,
      scale: canvasSize.width > 760 ? 0.86 : 1,
    }
  }

  return { x: 28, y: 28, scale: 1 }
}

function getFitCanvasView(
  mode: PipelineDagCanvasMode,
  graphBounds: DagGraphBounds,
  containerSize: { width: number; height: number },
): DagCanvasView {
  const fallbackTarget =
    mode === 'preview'
      ? { width: 980, height: 260 }
      : mode === 'conversation'
        ? { width: 720, height: 390 }
        : { width: 860, height: 676 }
  const target =
    containerSize.width > 0 && containerSize.height > 0
      ? containerSize
      : fallbackTarget
  const padding =
    mode === 'preview' ? 18 : mode === 'conversation' ? 24 : 32
  const availableWidth = Math.max(160, target.width - padding * 2)
  const availableHeight = Math.max(160, target.height - padding * 2)
  const scale = Math.min(
    1,
    availableWidth / Math.max(graphBounds.width, 1),
    availableHeight / Math.max(graphBounds.height, 1),
  )

  return {
    x: Number(
      (
        (target.width - graphBounds.width * scale) / 2 -
        graphBounds.left * scale
      ).toFixed(2),
    ),
    y: Number(
      (
        (target.height - graphBounds.height * scale) / 2 -
        graphBounds.top * scale
      ).toFixed(2),
    ),
    scale: Number(scale.toFixed(3)),
  }
}
