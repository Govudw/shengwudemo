import type { EChartsCoreOption } from 'echarts/core'
import type { DataChartBlock } from '../data/conversationTypes'

const chartPalette = ['#256fd4', '#13945f', '#c56f02', '#7a4bd8', '#c93737']

export function getChartOption(block: DataChartBlock): EChartsCoreOption {
  const colors = getChartColors(block)
  const textColor = '#10213a'
  const mutedColor = '#708195'
  const lineColor = '#dce7ef'
  const axisColor = '#8a9bae'
  const commonOption: EChartsCoreOption = {
    animationDuration: 460,
    backgroundColor: 'transparent',
    color: colors,
    textStyle: {
      color: textColor,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontWeight: 700,
    },
    tooltip: {
      confine: true,
      trigger: block.chartType === 'pie' ? 'item' : 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      borderColor: '#d8e4ec',
      borderWidth: 1,
      padding: [8, 10],
      textStyle: {
        color: textColor,
        fontSize: 12,
        fontWeight: 760,
      },
      extraCssText:
        'box-shadow: 0 12px 28px rgba(16,35,63,0.12); border-radius: 8px;',
    },
  }

  if (block.chartType === 'line') {
    const usesNumericXAxis = hasNumericLineXAxis(block)

    return {
      ...commonOption,
      legend: getHorizontalLegend(),
      grid: getCartesianGrid(),
      xAxis: usesNumericXAxis
        ? {
            type: 'value',
            name: block.xLabel,
            nameLocation: 'middle',
            nameGap: 30,
            min: 0,
            nameTextStyle: { color: axisColor, fontWeight: 800 },
            axisTick: { show: false },
            axisLine: { lineStyle: { color: lineColor } },
            axisLabel: { color: axisColor, fontWeight: 780 },
            splitLine: { lineStyle: { color: '#eef3f7' } },
          }
        : {
            type: 'category',
            name: block.xLabel,
            nameLocation: 'middle',
            nameGap: 30,
            boundaryGap: false,
            data: getCategoryLabels(block),
            axisTick: { show: false },
            axisLine: { lineStyle: { color: lineColor } },
            axisLabel: { color: axisColor, fontWeight: 780 },
          },
      yAxis: {
        type: 'value',
        name: block.yLabel,
        nameTextStyle: { color: axisColor, fontWeight: 800 },
        splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
        axisLabel: { color: axisColor, fontWeight: 780 },
      },
      series: block.series.map((serie, index) => ({
        name: serie.label,
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: index === 0 ? 9 : 7,
        lineStyle: {
          width: index === 0 ? 4 : 3,
          type: serie.label.includes('最近') ? 'dashed' : 'solid',
          cap: 'round',
          join: 'round',
        },
        areaStyle: index === 0 ? { opacity: 0.1 } : undefined,
        label: {
          show: true,
          position: 'top',
          color: textColor,
          fontSize: 11,
          fontWeight: 850,
          formatter: (params: { value?: unknown; dataIndex?: number }) =>
            formatLineDataLabel(params, serie.points.length, index),
        },
        encode: usesNumericXAxis ? { x: 0, y: 1 } : undefined,
        data: usesNumericXAxis
          ? serie.points.map((point) => [Number(point.label), point.value])
          : serie.points.map((point) => point.value),
      })),
    }
  }

  if (block.chartType === 'bar') {
    return {
      ...commonOption,
      legend: getHorizontalLegend(),
      grid: getCartesianGrid(),
      xAxis: {
        type: 'category',
        data: getCategoryLabels(block),
        axisTick: { show: false },
        axisLine: { lineStyle: { color: lineColor } },
        axisLabel: { color: axisColor, fontWeight: 780 },
      },
      yAxis: {
        type: 'value',
        name: block.yLabel,
        nameTextStyle: { color: axisColor, fontWeight: 800 },
        splitLine: { lineStyle: { color: lineColor, type: 'dashed' } },
        axisLabel: { color: axisColor, fontWeight: 780 },
      },
      series: block.series.map((serie) => ({
        name: serie.label,
        type: 'bar',
        barMaxWidth: 34,
        itemStyle: {
          borderRadius: [7, 7, 0, 0],
          shadowBlur: 8,
          shadowColor: 'rgba(16,35,63,0.08)',
        },
        label: {
          show: true,
          position: 'top',
          color: textColor,
          fontSize: 11,
          fontWeight: 850,
          formatter: '{c}',
        },
        data: serie.points.map((point) => point.value),
      })),
    }
  }

  const points = block.series.flatMap((serie) => serie.points)
  const total = points.reduce((sum, point) => sum + point.value, 0)

  return {
    ...commonOption,
    title: {
      text: formatChartValue(total),
      subtext: 'total flags',
      left: '39%',
      top: '41%',
      textAlign: 'center',
      textStyle: {
        color: textColor,
        fontSize: 30,
        fontWeight: 900,
      },
      subtextStyle: {
        color: mutedColor,
        fontSize: 13,
        fontWeight: 800,
      },
    },
    legend: {
      orient: 'vertical',
      right: 16,
      top: 18,
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: {
        color: mutedColor,
        fontSize: 12,
        fontWeight: 780,
      },
      formatter: (name: string) => {
        const point = points.find((candidate) => candidate.label === name)
        return point
          ? `${name}  ${formatChartValue(point.value)} / ${getChartPercentage(
              point.value,
              total,
            )}%`
          : name
      },
    },
    series: [
      {
        name: block.series[0]?.label ?? block.title,
        type: 'pie',
        radius: ['43%', '64%'],
        center: ['40%', '53%'],
        minAngle: 8,
        avoidLabelOverlap: true,
        itemStyle: {
          borderColor: '#ffffff',
          borderRadius: 4,
          borderWidth: 2,
        },
        label: {
          show: true,
          color: textColor,
          fontSize: 13,
          fontWeight: 850,
          formatter: '{b}\n{c} ({d}%)',
        },
        labelLine: {
          length: 18,
          length2: 14,
          lineStyle: { width: 1.5 },
        },
        data: points.map((point) => ({
          name: point.label,
          value: point.value,
        })),
      },
    ],
  }
}

export function getDataChartSummary(block: DataChartBlock) {
  if (block.chartType === 'line') {
    return block.series
      .map((serie) => {
        const latestPoint = serie.points.at(-1)
        const maxPoint = getMaxPoint(serie.points)

        if (!latestPoint) {
          return `${serie.label}: no data`
        }

        return `${serie.label}: latest ${formatChartValue(
          latestPoint.value,
        )}, peak ${formatChartValue(maxPoint.value)} at ${maxPoint.label}`
      })
      .join(' · ')
  }

  if (block.chartType === 'bar') {
    const allPoints = block.series.flatMap((serie) =>
      serie.points.map((point) => ({ ...point, serie: serie.label })),
    )
    const topPoint = getMaxPoint(allPoints)

    return `Top group: ${topPoint.label} ${formatChartValue(
      topPoint.value,
    )} (${topPoint.serie})`
  }

  const points = block.series.flatMap((serie) => serie.points)
  const total = Math.max(1, points.reduce((sum, point) => sum + point.value, 0))
  const topPoint = getMaxPoint(points)

  return `Total ${formatChartValue(total)} flags · largest: ${
    topPoint.label
  } ${formatChartValue(topPoint.value)} (${getChartPercentage(topPoint.value, total)}%)`
}

function getHorizontalLegend() {
  return {
    top: 4,
    right: 10,
    itemWidth: 16,
    itemHeight: 8,
    textStyle: {
      color: '#708195',
      fontSize: 12,
      fontWeight: 800,
    },
  }
}

function getCartesianGrid() {
  return {
    top: 64,
    right: 24,
    bottom: 42,
    left: 54,
    containLabel: true,
  }
}

function getCategoryLabels(block: DataChartBlock) {
  return block.series[0]?.points.map((point) => point.label) ?? []
}

function hasNumericLineXAxis(block: DataChartBlock) {
  return block.series.every((serie) =>
    serie.points.every(
      (point) =>
        point.label.trim().length > 0 && Number.isFinite(Number(point.label)),
    ),
  )
}

function formatLineDataLabel(
  params: { value?: unknown; dataIndex?: number },
  pointsLength: number,
  seriesIndex: number,
) {
  if (params.dataIndex === 0) {
    return ''
  }

  if (seriesIndex > 0 && params.dataIndex !== pointsLength - 1) {
    return ''
  }

  if (Array.isArray(params.value)) {
    const yValue = Number(params.value[1])
    return Number.isFinite(yValue) ? formatChartValue(yValue) : ''
  }

  if (typeof params.value === 'number') {
    return formatChartValue(params.value)
  }

  return ''
}

function getChartColors(block: DataChartBlock) {
  if (block.chartType === 'pie') {
    return chartPalette
  }

  return block.series.map(
    (serie, index) => serie.color ?? chartPalette[index % chartPalette.length],
  )
}

function getMaxPoint<T extends { value: number }>(points: T[]): T {
  if (!points.length) {
    return { value: 0 } as T
  }

  return points.reduce((maxPoint, point) =>
    point.value > maxPoint.value ? point : maxPoint,
  )
}

function formatChartValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function getChartPercentage(value: number, total: number) {
  return Math.round((value / Math.max(1, total)) * 100)
}
