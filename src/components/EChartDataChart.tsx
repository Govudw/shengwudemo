import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import { useEffect, useMemo, useRef } from 'react'
import type { DataChartBlock } from '../data/conversationTypes'
import { getChartOption, getDataChartSummary } from './eChartDataChartOption'

echarts.use([
  BarChart,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  SVGRenderer,
  TitleComponent,
  TooltipComponent,
])

type EChartDataChartProps = {
  block: DataChartBlock
}

function EChartDataChart({ block }: EChartDataChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const option = useMemo(() => getChartOption(block), [block])
  const chartHeight = block.chartType === 'pie' ? 380 : 340

  useEffect(() => {
    const chartElement = chartRef.current

    if (!chartElement) {
      return undefined
    }

    const chart = echarts.init(chartElement, undefined, { renderer: 'svg' })
    chart.setOption(option, true)

    function resizeChart() {
      chart.resize()
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
      chart.dispose()
    }
  }, [option])

  return (
    <section className="data-chart-block" aria-label={block.title}>
      <div className="data-chart-block__header">
        <div>
          <div className="data-chart-block__eyebrow">{block.chartType}</div>
          <h3>{block.title}</h3>
        </div>
      </div>
      <div
        className={`data-chart-block__echarts data-chart-block__echarts--${block.chartType}`}
        data-chart-type={block.chartType}
        ref={chartRef}
        role="img"
        aria-label={`${block.title} ${block.chartType} chart`}
        style={{ height: chartHeight }}
      />
      <div className="data-chart-block__summary">
        {getDataChartSummary(block)}
      </div>
      {(block.xLabel || block.yLabel) && (
        <div className="data-chart-block__axis-note">
          {[block.xLabel, block.yLabel].filter(Boolean).join(' / ')}
        </div>
      )}
    </section>
  )
}

export default EChartDataChart
