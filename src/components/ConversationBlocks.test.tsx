// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { ConversationBlock } from '../data/conversationTypes'
import type { PipelineDag } from '../data/mockCapabilities'
import ConversationBlocks from './ConversationBlocks'
import { getChartOption } from './eChartDataChartOption'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
})

describe('ConversationBlocks data charts', () => {
  it('renders data charts through the ECharts display shell', () => {
    const { container, root } = renderConversationBlocks([
      {
        type: 'dataChart',
        title: 'PR-3107 活性读数时间线',
        chartType: 'line',
        xLabel: '读数批次',
        yLabel: 'median relative activity',
        series: [
          {
            label: '候选中位活性',
            color: '#2563eb',
            points: [
              { label: '13:40', value: 42 },
              { label: '14:00', value: 57 },
            ],
          },
          {
            label: 'parent control',
            color: '#64748b',
            points: [
              { label: '13:40', value: 50 },
              { label: '14:00', value: 51 },
            ],
          },
        ],
      },
      {
        type: 'dataChart',
        title: '候选分组检测摘要',
        chartType: 'bar',
        xLabel: '候选分组',
        yLabel: 'normalized score',
        series: [
          {
            label: 'activity',
            color: '#0891b2',
            points: [
              { label: 'Active-site', value: 78 },
              { label: 'Stability', value: 64 },
            ],
          },
        ],
      },
      {
        type: 'dataChart',
        title: '异常 flag 类型分布',
        chartType: 'pie',
        series: [
          {
            label: '异常类型',
            points: [
              { label: '构建返工', value: 2 },
              { label: '低收率', value: 1 },
              { label: '附件补录', value: 1 },
            ],
          },
        ],
      },
    ])

    expect(container.querySelectorAll('.data-chart-block__echarts')).toHaveLength(3)
    expect(container.querySelector('.data-chart-block__svg')).toBeNull()
    expect(container.querySelectorAll('[data-chart-type="line"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-chart-type="bar"]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-chart-type="pie"]')).toHaveLength(1)
    expect(container.querySelector('.data-chart-block__summary')?.textContent).toContain(
      'latest 57',
    )
    expect(container.textContent).toContain('构建返工 2')
    expect(container.textContent).toContain('50%')

    root.unmount()
  })

  it('uses per-series numeric x values for cumulative line charts', () => {
    const block: ConversationBlock = {
      type: 'dataChart',
      title: 'LIMS 节点通过效率对比',
      chartType: 'line',
      xLabel: '累计耗时 (min)',
      yLabel: '已通过节点数',
      series: [
        {
          label: '本轮',
          color: '#16a34a',
          points: [
            { label: '0', value: 0 },
            { label: '18', value: 3 },
            { label: '186', value: 7 },
          ],
        },
        {
          label: '上一轮',
          color: '#2563eb',
          points: [
            { label: '0', value: 0 },
            { label: '34', value: 3 },
            { label: '252', value: 7 },
          ],
        },
      ],
    }
    const option = getChartOption(block) as {
      xAxis: { type: string; name?: string }
      series: Array<{ data: Array<[number, number]> }>
    }

    expect(option.xAxis).toMatchObject({
      type: 'value',
      name: '累计耗时 (min)',
    })
    expect(option.series[0].data).toEqual([
      [0, 0],
      [18, 3],
      [186, 7],
    ])
    expect(option.series[1].data).toEqual([
      [0, 0],
      [34, 3],
      [252, 7],
    ])
  })
})

describe('ConversationBlocks Pipeline DAG progress', () => {
  it('renders collapsed progress summaries and completed node markers', () => {
    const dag: PipelineDag = {
      nodes: [
        {
          id: 'input',
          kind: 'input',
          subtype: 'data',
          title: '输入包',
          shortTitle: '输入包',
          description: '输入资料包。',
          inputs: ['启动语句'],
          outputs: ['输入包'],
          prerequisites: [],
          layout: { row: 0, column: 0 },
        },
        {
          id: 'approval',
          kind: 'human-gate',
          subtype: 'data',
          title: '启动审批',
          shortTitle: '启动审批',
          description: '审批通过后运行。',
          inputs: ['输入包'],
          outputs: ['审批记录'],
          prerequisites: ['输入包锁定'],
          layout: { row: 1, column: 0 },
        },
      ],
      edges: [{ from: 'input', to: 'approval', label: '提交审批' }],
    }
    const { container, root } = renderConversationBlocks([
      {
        type: 'pipelineDag',
        title: 'LIMS 酶合成执行 Pipeline',
        version: 'v1.0',
        status: 'validated',
        summary: '启动审批已通过。',
        dag,
        progressSummary: '启动审批通过 · 下一步样本注册',
        completedNodeIds: ['input', 'approval'],
        activeNodeId: 'approval',
        defaultCollapsed: true,
      },
    ])

    const details = container.querySelector('details.pipeline-dag-block')

    expect(details?.hasAttribute('open')).toBe(false)
    expect(container.querySelector('.pipeline-dag-block__summary-line')?.textContent).toContain(
      '✅',
    )
    expect(container.textContent).toContain('启动审批通过 · 下一步样本注册')
    expect(
      container.querySelectorAll('.capabilities-dag-node__completion-mark'),
    ).toHaveLength(2)
    expect(
      container.querySelectorAll('.capabilities-dag-node--completed'),
    ).toHaveLength(2)

    root.unmount()
  })
})

function renderConversationBlocks(blocks: ConversationBlock[]) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<ConversationBlocks blocks={blocks} />)
  })

  return { container, root }
}
