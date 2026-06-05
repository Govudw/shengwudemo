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

export function getDagNodePositions(dag: PipelineDag) {
  if (!dag.nodes.length) {
    return {}
  }

  const columnGap = 230
  const rowGap = 96
  const marginX = 94
  const marginY = 58

  return Object.fromEntries(
    dag.nodes.map((node) => {
      const x = marginX + node.layout.column * columnGap
      const y = marginY + node.layout.row * rowGap

      return [node.id, { x, y }]
    }),
  ) as Record<string, { x: number; y: number }>
}

export function getDagCanvasSize(
  positions: Record<string, { x: number; y: number }>,
) {
  const points = Object.values(positions)

  if (!points.length) {
    return { width: 720, height: 320 }
  }

  const maxX = Math.max(...points.map((point) => point.x))
  const maxY = Math.max(...points.map((point) => point.y))

  return {
    width: Math.max(720, maxX + 180),
    height: Math.max(320, maxY + 110),
  }
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
  const widthSpan = Math.max(maxX - minX, 240)
  const heightSpan = Math.max(maxY - minY, 180)
  const scale = Math.min(1, 920 / widthSpan, 560 / heightSpan)

  return {
    transform: `translate(${24 - minX * scale}px, ${24 - minY * scale}px) scale(${scale.toFixed(3)})`,
  }
}
