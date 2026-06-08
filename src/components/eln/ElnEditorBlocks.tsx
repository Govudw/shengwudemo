import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import type { EChartsCoreOption, EChartsType } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'

echarts.use([
  BarChart,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  ScatterChart,
  SVGRenderer,
  TitleComponent,
  TooltipComponent,
])

type ElnBlockAttrs = Record<string, unknown>

type ElnImageBlockAttrs = {
  src: string
  alt: string
  caption: string
  assetRef: string
  sourceRef: string
}

type ElnChartBlockAttrs = {
  title: string
  chartType: string
  sourceRef: string
  updatedAt: string
  option: EChartsCoreOption
}

type ElnSignatureBlockAttrs = {
  kind: string
  role: string
  signer: string
  status: string
  signedAt: string
  sourceRef: string
  note: string
}

type ElnAttachmentBlockAttrs = {
  fileName: string
  fileKind: string
  objectPath: string
  summary: string
  status: string
}

function getAttr(attrs: ElnBlockAttrs, key: string) {
  const value = attrs[key]
  return typeof value === 'string' ? value : ''
}

function getDefaultChartOption(): EChartsCoreOption {
  return {
    xAxis: { type: 'category', data: ['A', 'B', 'C'] },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: [1, 2, 3] }],
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeChartOption(value: unknown): EChartsCoreOption {
  if (!isRecord(value)) {
    return getDefaultChartOption()
  }

  const hasSeries = Array.isArray(value.series)
  const hasAxis = isRecord(value.xAxis) || isRecord(value.yAxis)
  const hasDataset = Array.isArray(value.dataset) || isRecord(value.dataset)

  if (!hasSeries && !hasAxis && !hasDataset) {
    return getDefaultChartOption()
  }

  return value as EChartsCoreOption
}

function normalizeImageAttrs(attrs: ElnBlockAttrs): ElnImageBlockAttrs {
  return {
    src: getAttr(attrs, 'src'),
    alt: getAttr(attrs, 'alt'),
    caption: getAttr(attrs, 'caption'),
    assetRef: getAttr(attrs, 'assetRef'),
    sourceRef: getAttr(attrs, 'sourceRef'),
  }
}

function normalizeChartAttrs(attrs: ElnBlockAttrs): ElnChartBlockAttrs {
  return {
    title: getAttr(attrs, 'title') || 'ELN chart',
    chartType: getAttr(attrs, 'chartType') || getAttr(attrs, 'chartKind') || 'bar',
    sourceRef: getAttr(attrs, 'sourceRef'),
    updatedAt: getAttr(attrs, 'updatedAt'),
    option: normalizeChartOption(attrs.option),
  }
}

function getChartTypeLabel(chartType: string) {
  const labels: Record<string, string> = {
    bar: '柱状图',
    line: '折线图',
    pie: '饼图',
    scatter: '散点图',
  }
  const normalizedChartType = chartType.toLowerCase()
  const fallbackLabel = chartType || '图表'

  return labels[normalizedChartType] ?? fallbackLabel
}

function normalizeSignatureAttrs(attrs: ElnBlockAttrs): ElnSignatureBlockAttrs {
  return {
    kind: getAttr(attrs, 'kind'),
    role: getAttr(attrs, 'role'),
    signer: getAttr(attrs, 'signer'),
    status: getAttr(attrs, 'status'),
    signedAt: getAttr(attrs, 'signedAt'),
    sourceRef: getAttr(attrs, 'sourceRef'),
    note: getAttr(attrs, 'note') || getAttr(attrs, 'meaning'),
  }
}

function normalizeAttachmentAttrs(attrs: ElnBlockAttrs): ElnAttachmentBlockAttrs {
  return {
    fileName: getAttr(attrs, 'fileName'),
    fileKind: getAttr(attrs, 'fileKind') || getAttr(attrs, 'fileType'),
    objectPath: getAttr(attrs, 'objectPath') || getAttr(attrs, 'sourceRef'),
    summary: getAttr(attrs, 'summary'),
    status: getAttr(attrs, 'status'),
  }
}

function stringifyBlockInfo(attrs: ElnBlockAttrs) {
  return JSON.stringify(attrs, null, 2)
}

function deleteCurrentBlock({ editor, getPos, node }: ReactNodeViewProps) {
  if (typeof getPos !== 'function') {
    return
  }

  const position = getPos()

  if (typeof position !== 'number') {
    return
  }

  editor
    .chain()
    .focus()
    .deleteRange({ from: position, to: position + node.nodeSize })
    .run()
}

function BlockActionMenu({
  blockName,
  detailsExpanded,
  onToggleDetails,
  props,
}: {
  blockName: string
  detailsExpanded: boolean
  onToggleDetails: () => void
  props: ReactNodeViewProps
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  function copyBlockInfo() {
    const text = stringifyBlockInfo(props.node.attrs as ElnBlockAttrs)
    setMenuOpen(false)

    if (!navigator.clipboard?.writeText) {
      setCopyStatus('复制失败')
      return
    }

    navigator.clipboard
      .writeText(text)
      .then(() => setCopyStatus('已复制'))
      .catch(() => setCopyStatus('复制失败'))
  }

  function removeBlock() {
    deleteCurrentBlock(props)
    setMenuOpen(false)
  }

  return (
    <div
      className="workspace-file-preview__eln-block-actions"
      contentEditable={false}
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        aria-label="块操作"
        title={`${blockName} 块操作`}
        onClick={() => setMenuOpen((current) => !current)}
      >
        ⋯
      </button>
      {menuOpen ? (
        <div role="menu" aria-label="块操作">
          <button
            type="button"
            role="menuitem"
            aria-label="查看详情"
            aria-pressed={detailsExpanded}
            onClick={() => {
              onToggleDetails()
              setMenuOpen(false)
            }}
          >
            查看详情
          </button>
          <button
            type="button"
            role="menuitem"
            aria-label="复制块信息"
            onClick={copyBlockInfo}
          >
            复制块信息
          </button>
          <button
            type="button"
            role="menuitem"
            aria-label="删除块"
            onClick={removeBlock}
          >
            删除块
          </button>
        </div>
      ) : null}
      {copyStatus ? (
        <span className="workspace-file-preview__eln-block-copy-status">
          {copyStatus}
        </span>
      ) : null}
    </div>
  )
}

export function ElnImageBlockView(props: ReactNodeViewProps) {
  const { node } = props
  const attrs = normalizeImageAttrs(node.attrs as ElnBlockAttrs)
  const alt = attrs.alt || attrs.caption || 'ELN image'
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  function openImagePreview() {
    if (!attrs.src) {
      return
    }

    window.dispatchEvent(
      new CustomEvent('bmeln:open-image', {
        detail: attrs,
      }),
    )
  }

  return (
    <NodeViewWrapper
      as="figure"
      className="workspace-file-preview__eln-image-block"
      data-eln-block="image"
    >
      <BlockActionMenu
        blockName="图片"
        detailsExpanded={detailsExpanded}
        onToggleDetails={() => setDetailsExpanded((current) => !current)}
        props={props}
      />
      {attrs.src ? (
        <img
          src={attrs.src}
          alt={alt}
          loading="lazy"
          role="button"
          tabIndex={0}
          onClick={openImagePreview}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openImagePreview()
            }
          }}
        />
      ) : null}
      {attrs.caption ? <figcaption>{attrs.caption}</figcaption> : null}
      {[attrs.sourceRef, attrs.assetRef].filter(Boolean).map((value) => (
        <p key={value} className="workspace-file-preview__eln-block-source">
          {value}
        </p>
      ))}
      {detailsExpanded ? (
        <dl className="workspace-file-preview__eln-block-details">
          <div>
            <dt>来源</dt>
            <dd>{attrs.sourceRef || '未关联'}</dd>
          </div>
          <div>
            <dt>资产</dt>
            <dd>{attrs.assetRef || '未关联'}</dd>
          </div>
        </dl>
      ) : null}
    </NodeViewWrapper>
  )
}

export function ElnChartBlockView(props: ReactNodeViewProps) {
  const { node } = props
  const attrs = useMemo(
    () => normalizeChartAttrs(node.attrs as ElnBlockAttrs),
    [node.attrs],
  )
  const chartTypeLabel = getChartTypeLabel(attrs.chartType)
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstanceRef = useRef<EChartsType | null>(null)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  useEffect(() => {
    const chartElement = chartRef.current

    if (!chartElement) {
      return undefined
    }

    function resizeChart() {
      chartInstanceRef.current?.resize()
    }

    try {
      chartInstanceRef.current = echarts.init(chartElement, undefined, {
        renderer: 'svg',
      })
    } catch (error) {
      console.warn('ELN chart initialization failed', error)
    }

    const resizeFrame = window.requestAnimationFrame(resizeChart)
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(resizeChart)

    resizeObserver?.observe(chartElement)
    window.addEventListener('resize', resizeChart)

    return () => {
      window.cancelAnimationFrame(resizeFrame)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resizeChart)
      chartInstanceRef.current?.dispose()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartInstanceRef.current

    if (!chart) {
      return
    }

    try {
      chart.setOption(attrs.option, true)
    } catch (error) {
      console.warn('ELN chart option update failed', error)
    }
  }, [attrs.option])

  return (
    <NodeViewWrapper
      as="section"
      className="workspace-file-preview__eln-chart-block"
      data-eln-block="chart"
    >
      <BlockActionMenu
        blockName="图表"
        detailsExpanded={detailsExpanded}
        onToggleDetails={() => setDetailsExpanded((current) => !current)}
        props={props}
      />
      <div className="workspace-file-preview__eln-chart-header">
        <span>{chartTypeLabel}</span>
        <strong>{attrs.title}</strong>
      </div>
      <div
        className="workspace-file-preview__eln-chart-echarts"
        data-chart-type={attrs.chartType}
        ref={chartRef}
        role="img"
        aria-label={`${attrs.title} ${chartTypeLabel}`}
      />
      <p className="workspace-file-preview__eln-block-source">
        {attrs.sourceRef}
        {attrs.sourceRef && attrs.updatedAt ? ' · ' : ''}
        {attrs.updatedAt}
      </p>
      {detailsExpanded ? (
        <dl className="workspace-file-preview__eln-block-details">
          <div>
            <dt>图表类型</dt>
            <dd>{chartTypeLabel}</dd>
          </div>
          <div>
            <dt>来源</dt>
            <dd>{attrs.sourceRef || '未关联'}</dd>
          </div>
          <div>
            <dt>更新时间</dt>
            <dd>{attrs.updatedAt || '未更新'}</dd>
          </div>
        </dl>
      ) : null}
    </NodeViewWrapper>
  )
}

export function ElnSignatureBlockView(props: ReactNodeViewProps) {
  const { node } = props
  const attrs = normalizeSignatureAttrs(node.attrs as ElnBlockAttrs)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  function toggleDetails() {
    setDetailsExpanded((current) => !current)
  }

  return (
    <NodeViewWrapper
      as="section"
      className="workspace-file-preview__eln-signature-block"
      data-eln-block="signature"
      tabIndex={0}
      onClick={toggleDetails}
      onKeyDown={(event: ReactKeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          toggleDetails()
        }
      }}
    >
      <BlockActionMenu
        blockName="Signature"
        detailsExpanded={detailsExpanded}
        onToggleDetails={toggleDetails}
        props={props}
      />
      <div className="workspace-file-preview__eln-signature-main">
        <span>{attrs.kind || attrs.role || '签名'}</span>
        <strong>{attrs.signer || '未指定签署人'}</strong>
        <span>{attrs.status || 'pending'}</span>
        {attrs.signedAt ? <time>{attrs.signedAt}</time> : <time>待签署</time>}
      </div>
      {attrs.note ? <p>{attrs.note}</p> : null}
      {attrs.sourceRef ? (
        <p className="workspace-file-preview__eln-block-source">{attrs.sourceRef}</p>
      ) : null}
      {detailsExpanded ? (
        <dl className="workspace-file-preview__eln-block-details">
          <div>
            <dt>状态</dt>
            <dd>{attrs.status || 'pending'}</dd>
          </div>
          <div>
            <dt>签署人</dt>
            <dd>{attrs.signer || '未指定签署人'}</dd>
          </div>
          <div>
            <dt>签署时间</dt>
            <dd>{attrs.signedAt || '待签署'}</dd>
          </div>
          <div>
            <dt>来源</dt>
            <dd>{attrs.sourceRef || '未关联'}</dd>
          </div>
        </dl>
      ) : null}
    </NodeViewWrapper>
  )
}

export function ElnAttachmentBlockView(props: ReactNodeViewProps) {
  const { node } = props
  const attrs = normalizeAttachmentAttrs(node.attrs as ElnBlockAttrs)
  const [detailsExpanded, setDetailsExpanded] = useState(false)

  return (
    <NodeViewWrapper
      as="section"
      className="workspace-file-preview__eln-attachment-block"
      data-eln-block="attachment"
    >
      <BlockActionMenu
        blockName="附件"
        detailsExpanded={detailsExpanded}
        onToggleDetails={() => setDetailsExpanded((current) => !current)}
        props={props}
      />
      <div className="workspace-file-preview__eln-attachment-main">
        <strong>{attrs.fileName || '未命名附件'}</strong>
        {[attrs.fileKind, attrs.status].filter(Boolean).map((value) => (
          <span key={value}>{value}</span>
        ))}
      </div>
      {attrs.objectPath ? <p>{attrs.objectPath}</p> : null}
      {attrs.summary ? <p>{attrs.summary}</p> : null}
      {detailsExpanded ? (
        <dl className="workspace-file-preview__eln-block-details">
          <div>
            <dt>文件</dt>
            <dd>{attrs.fileName || '未命名附件'}</dd>
          </div>
          <div>
            <dt>路径</dt>
            <dd>{attrs.objectPath || '未关联'}</dd>
          </div>
          <div>
            <dt>状态</dt>
            <dd>{attrs.status || 'unknown'}</dd>
          </div>
        </dl>
      ) : null}
    </NodeViewWrapper>
  )
}
