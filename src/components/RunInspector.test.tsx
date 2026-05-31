import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { RunInspectorData } from '../data/conversationTypes'
import RunInspector from './RunInspector'

const runInspector: RunInspectorData = {
  summary: {
    stage: '已完成干湿闭环',
    status: 'completed',
    completedSteps: 7,
    totalSteps: 7,
    outputCount: 6,
    pendingCount: 0,
  },
  progress: [
    {
      id: 'context',
      title: '读取上下文',
      status: 'done',
      meta: '项目资料',
      detail: '完成靶点、序列和实验上下文读取。',
    },
  ],
  outputs: [
    {
      id: 'report',
      name: 'EGFR_affinity_optimization_report.md',
      kind: 'report',
      location: '项目文件 / reports',
      status: 'saved',
    },
  ],
  approvals: [
    {
      id: 'top3',
      kind: 'humanConfirmation',
      title: '确认 Top 3 候选',
      status: 'confirmed',
      actor: '宋博士',
      decidedAt: '10:16',
    },
  ],
  capabilityRuns: [
    {
      id: 'structure',
      commandName: 'StructureAnalyzer.run',
      status: 'success',
      summary: '完成结构稳定性评估。',
      duration: '18s',
      input: { candidateCount: 6 },
      output: { selectedCount: 3 },
      artifacts: [{ name: 'structure_scores.json', kind: 'json' }],
    },
  ],
}

describe('RunInspector', () => {
  it('renders summary and default-collapsed capability controls', () => {
    const html = renderToString(<RunInspector data={runInspector} />)

    expect(html).toContain('运行信息')
    expect(html).toContain('已完成干湿闭环')
    expect(html).toContain('7 / 7 步')
    expect(html).toContain('EGFR_affinity_optimization_report.md')
    expect(html).toContain('确认 Top 3 候选')
    expect(html).toContain('StructureAnalyzer.run')
    expect(html).toContain('run-inspector__item-name')
    expect(html).toContain('aria-expanded="false"')
  })

  it('renders an empty state without run inspector data', () => {
    const html = renderToString(<RunInspector data={undefined} />)

    expect(html).toContain('暂无运行信息')
  })
})
