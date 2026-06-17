// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { capabilityEntries } from '../data/mockCapabilities'
import CapabilitiesPage from './CapabilitiesPage'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('CapabilitiesPage', () => {
  it('opens on Pipelines with preview Plugins visible in the left nav', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(container.textContent).toContain('Pipeline')
    expect(container.textContent).toContain('EGFR 抗体亲和力优化 Pipeline')
    expect(getButtonContaining(container, 'Plugin').textContent).toContain(
      '预览',
    )

    root.unmount()
  })

  it('uses one-line plural titles in capability section headers', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(getHeaderTitle(container)).toBe('Pipelines')
    expect(getCapabilitiesHeader(container).textContent).not.toContain(
      'Pipeline 管理',
    )
    expect(getCapabilitiesHeader(container).textContent).not.toContain(
      '管理主 Agent 可在研发任务中运行或按需改造的生物学 Pipeline。',
    )

    act(() => {
      getButtonContaining(container, 'Skill').click()
    })

    expect(getHeaderTitle(container)).toBe('Skills')
    expect(getCapabilitiesHeader(container).textContent).not.toContain(
      'Skill 管理',
    )
    expect(getCapabilitiesHeader(container).textContent).not.toContain(
      '管理可复用的 Skill，包括 BioMap 预设、自建和已安装 Skill。',
    )

    root.unmount()
  })

  it('matches the compact workspace title bar sizing', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.capabilities-header')).toContain(
      'min-height: 52px;',
    )
    expect(getCssRule(appCss, '.capabilities-header')).toContain(
      'padding: 0 34px;',
    )
    expect(getCssRule(appCss, '.capabilities-header h1')).toContain(
      'font-size: 24px;',
    )
    expect(
      getCssRule(appCss, '.capabilities-header .capabilities-primary-action'),
    ).toContain('min-height: 34px;')
  })

  it('keeps the default Pipeline DAG preview compact inside the detail panel', async () => {
    const appCss = await readAppCss()

    expect(getCssRule(appCss, '.capabilities-dag-canvas--preview')).toContain(
      'height: 260px;',
    )
    expect(getCssRule(appCss, '.capabilities-dag-canvas')).toContain(
      'cursor: grab;',
    )
    expect(
      getCssRule(appCss, '.capabilities-dag-canvas--preview .capabilities-dag-node'),
    ).toContain('min-height: 36px;')
    expect(
      getCssRule(appCss, '.capabilities-dag-canvas--preview .capabilities-dag-node__subtype'),
    ).toContain('display: none;')
  })

  it('keeps advanced capability filters collapsed by default', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(container.textContent).toContain('更多筛选')
    expect(container.textContent).not.toContain('全部版本')
    expect(container.textContent).not.toContain('全部权限')
    expect(container.textContent).not.toContain('全部负责人')

    act(() => {
      getButtonContaining(container, '更多筛选').click()
    })

    expect(container.textContent).toContain('全部版本')
    expect(container.textContent).toContain('全部权限')
    expect(container.textContent).toContain('全部负责人')

    root.unmount()
  })

  it('applies the advanced version filter to the capability list', () => {
    const { container, root } = renderCapabilitiesPage()

    openAdvancedCapabilityFilters(container)
    changeSelect(container, '按版本筛选', 'draft')

    expect(getButtonContaining(container, '更多筛选').textContent).toContain('1')
    expect(container.textContent).toContain('分子候选筛选 Pipeline')
    expect(container.textContent).not.toContain('EGFR 抗体亲和力优化 Pipeline')

    root.unmount()
  })

  it('applies the advanced permission filter to the capability list', () => {
    const { container, root } = renderCapabilitiesPage()

    openAdvancedCapabilityFilters(container)
    changeSelect(container, '按权限筛选', 'approval')

    expect(getButtonContaining(container, '更多筛选').textContent).toContain('1')
    expect(container.textContent).toContain('EGFR 抗体亲和力优化 Pipeline')
    expect(container.textContent).not.toContain('蛋白稳定性改造 Pipeline')

    root.unmount()
  })

  it('applies the advanced owner filter to the capability list', () => {
    const { container, root } = renderCapabilitiesPage()

    openAdvancedCapabilityFilters(container)
    changeSelect(container, '按负责人筛选', 'platform')

    expect(getButtonContaining(container, '更多筛选').textContent).toContain('1')
    expect(container.textContent).toContain('EGFR 抗体亲和力优化 Pipeline')
    expect(container.textContent).not.toContain('蛋白稳定性改造 Pipeline')

    root.unmount()
  })

  it('does not open a Pipeline detail panel when filters hide the selected Pipeline', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(container.querySelector('.capabilities-detail')).not.toBeNull()

    changeSelect(container, '按来源筛选', 'created')

    expect(container.textContent).toContain('酶库订单与实验执行 Pipeline')
    expect(container.textContent).not.toContain('EGFR 抗体亲和力优化 Pipeline')
    expect(container.querySelector('.capabilities-detail')).toBeNull()

    root.unmount()
  })

  it('supports Codex-style Skill browsing, details, toggles, and build action', () => {
    const onNotify = vi.fn()
    const { container, root } = renderCapabilitiesPage({ onNotify })

    act(() => {
      getButtonContaining(container, 'Skill').click()
    })

    expect(container.querySelector('input[placeholder="搜索 Skill"]')).not.toBeNull()
    expect(container.textContent).toContain('蛋白设计操作 Skill')

    const skillSwitch = getSwitch(container, '主 Agent 启用')
    expect(skillSwitch.getAttribute('aria-checked')).toBe('true')

    act(() => {
      skillSwitch.click()
    })

    expect(skillSwitch.getAttribute('aria-checked')).toBe('false')
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      skillSwitch.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: ' ',
          bubbles: true,
          cancelable: true,
        }),
      )
    })

    expect(skillSwitch.getAttribute('aria-checked')).toBe('true')
    expect(container.querySelector('[role="dialog"]')).toBeNull()

    act(() => {
      getClickableContaining(container, '蛋白设计操作 Skill').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.textContent).toContain('指令')
    expect(container.textContent).toContain('触发条件')
    expect(container.textContent).toContain('示例')
    expect(
      container.querySelector('.capabilities-workspace')?.getAttribute('inert'),
    ).toBe('')

    act(() => {
      getButtonContaining(container, 'Pipeline').click()
    })

    act(() => {
      getButtonContaining(container, '用 Agent 构建 Pipeline').click()
    })

    expect(onNotify).toHaveBeenCalledWith('Pipeline Builder 尚未接入当前工作区')

    root.unmount()
  })

  it('shows MCP and Plugin with the same wide list and modal pattern as Skill', () => {
    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, 'MCP Server').click()
    })

    expect(container.querySelector('.capabilities-skill-list')).not.toBeNull()
    expect(container.querySelector('.capabilities-browser')).toBeNull()
    expect(container.textContent).toContain('BioMap 结构工具 MCP')

    act(() => {
      getClickableContaining(container, 'BioMap 结构工具 MCP').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.textContent).toContain('工具')
    expect(container.textContent).toContain('资源')
    expect(container.textContent).toContain('访问控制')

    act(() => {
      getButtonByLabel(container, '关闭详情').click()
    })

    act(() => {
      getButtonContaining(container, 'Plugin').click()
    })

    expect(container.querySelector('.capabilities-skill-list')).not.toBeNull()
    expect(container.querySelector('.capabilities-browser')).toBeNull()
    expect(container.textContent).toContain('序列查看器 Plugin')

    act(() => {
      getClickableContaining(container, '序列查看器 Plugin').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.textContent).toContain('Plugin 预览')
    expect(container.textContent).toContain('仅占位')

    root.unmount()
  })

  it('collapses pipeline dag details by default', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(getDetailSectionTitles(container)).toContain('执行 DAG')
    expect(getDetailSectionTitles(container)).not.toContain('步骤')
    expect(container.textContent).toContain(
      '执行 DAG 7 步 · 1 个审批点 · 最近运行 14 次',
    )
    expect(container.querySelector('.capabilities-dag-canvas--preview')).toBeNull()

    act(() => {
      getButtonContaining(container, '展开').click()
    })

    expect(container.querySelector('.capabilities-dag-canvas--preview')).not.toBeNull()
    expect(container.textContent).toContain('候选确认')
    expect(container.textContent).toContain('Human Gate')
    expect(container.textContent).toContain('人工确认')
    expect(container.textContent).toContain('QC')
    expect(container.textContent).toContain('QC 判断')
    expect(getButtonContaining(container, '最大化')).toBeTruthy()

    root.unmount()
  })

  it('opens the maximized Pipeline DAG Viewer without expanding the inline canvas', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(container.querySelector('.capabilities-dag-canvas--preview')).toBeNull()

    act(() => {
      getButtonContaining(container, '最大化').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.querySelector('.capabilities-dag-canvas--modal')).not.toBeNull()
    expect(container.querySelector('.capabilities-dag-canvas--preview')).toBeNull()

    root.unmount()
  })

  it('opens the read-only Pipeline DAG Viewer and shows selected node execution details', () => {
    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, '最大化').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.querySelector('[aria-modal="true"]')).not.toBeNull()
    expect(document.activeElement).toBe(
      getButtonByLabel(container, '关闭 Pipeline DAG Viewer'),
    )
    expect(container.textContent).toContain('选择一个节点查看执行条件。')
    expect(container.textContent).toContain('Human Gate')
    expect(container.textContent).toContain('QC Decision')
    expect(container.textContent).toContain('Lab Resources')

    act(() => {
      getButtonContaining(container, 'Human Gate').click()
    })

    expect(container.textContent).toContain('名称')
    expect(container.textContent).toContain('输入')
    expect(container.textContent).toContain('输出')
    expect(container.textContent).toContain('前置条件')
    expect(container.textContent).toContain('控制条件')
    expect(container.textContent).toContain('human-confirmation')

    act(() => {
      getButtonByLabel(container, '关闭 Pipeline DAG Viewer').click()
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()
    expect(container.textContent).toContain('EGFR 抗体亲和力优化 Pipeline')

    root.unmount()
  })

  it('closes the Pipeline DAG Viewer with Escape and supports Fit and Reset controls', () => {
    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, '最大化').click()
    })

    act(() => {
      getButtonContaining(container, 'QC Decision').click()
    })

    expect(container.textContent).toContain('preset-qc-check')
    expect(getDagViewport(container).dataset.viewport).toBe('fit')
    expect(getDagViewport(container).style.transform).toContain('translate')

    act(() => {
      getButtonContaining(container, '居中').click()
    })

    expect(getDagViewport(container).dataset.viewport).toBe('fit')
    expect(getDagViewport(container).style.transform).not.toBe('')
    expect(container.textContent).toContain('preset-qc-check')

    act(() => {
      getButtonContaining(container, '重置').click()
    })

    expect(getDagViewport(container).dataset.viewport).toBe('fit')
    expect(getDagViewport(container).style.transform).toContain('translate')
    expect(container.textContent).toContain('选择一个节点查看执行条件。')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    root.unmount()
  })

  it('pans the Pipeline DAG canvas by dragging the background', () => {
    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, '最大化').click()
    })

    const canvas = getDagCanvas(container)
    const beforeTransform = getDagViewport(container).style.transform

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          button: 0,
          clientX: 100,
          clientY: 120,
        }),
      )
      window.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 145,
          clientY: 152,
        }),
      )
      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    })

    expect(getDagViewport(container).style.transform).not.toBe(beforeTransform)
    expect(getDagCanvas(container).dataset.dragging).toBe('false')

    root.unmount()
  })

  it('shows the DAG template for every Pipeline entry', () => {
    const { container, root } = renderCapabilitiesPage()
    const pipelineNames = [
      'EGFR 抗体亲和力优化 Pipeline',
      '蛋白稳定性改造 Pipeline',
      '酶库订单与实验执行 Pipeline',
      'AI-ready 数据集整理 Pipeline',
      '分子候选筛选 Pipeline',
      'ENZ-P0 Assay Characterization Pipeline',
    ]

    pipelineNames.forEach((name) => {
      act(() => {
        getButtonContaining(container, name).click()
      })

      expect(getDetailSectionTitles(container)).toContain('执行 DAG')
      expect(getDetailSectionTitles(container)).not.toContain('步骤')
      expect(container.querySelector('.capabilities-dag-canvas--preview')).toBeNull()

      act(() => {
        getButtonContaining(container, '展开').click()
      })

      expect(container.textContent).toContain('Human Gate')
      expect(container.textContent).toContain('QC Decision')
    })

    root.unmount()
  })

  it('renders the wet-lab order Pipeline as the enzyme experiment execution contract', () => {
    const wetlabPipeline = capabilityEntries.find(
      (entry) => entry.id === 'pipeline-wetlab-order',
    )
    const expectedExecutionSteps = [
      '读取设计交接',
      '确认订单边界',
      '固化样本范围',
      '固化读数面板',
      '生成板图',
      '检查样本库存与孔板关联',
      '检查物料/SOP/设备/线路',
      '订单提交审批',
      '创建 Experiment Task',
      '同步样本准备',
      '同步 assay 执行',
      '回收结果包',
      '记录异常事件',
      '校验结果包 schema',
      '归档操作索引',
    ]

    expect(wetlabPipeline).toMatchObject({
      name: '酶库订单与实验执行 Pipeline',
      kind: 'pipeline',
      source: 'created',
      version: 'v1.0',
    })
    expect(wetlabPipeline?.metrics).toEqual(
      expect.arrayContaining([
        { label: '步骤', value: '15' },
        { label: '正式审批', value: '1' },
      ]),
    )
    expect(wetlabPipeline?.interface.inputs).toEqual(
      expect.arrayContaining([
        '设计交接包：ENZ-LIB-20260602-048、parent enzyme、候选变体范围和禁止自动动作',
        '样本与库存：48 个候选酶、对照、分装计划、样本批次和孔板关联记录',
        '实验约束：读数面板、SOP v3、底物批次 QC、设备与实验线路',
      ]),
    )
    expect(wetlabPipeline?.interface.outputs).toEqual(
      expect.arrayContaining([
        '已提交实验订单：BM-LAB-ENZ-20260602-001 及审批记录',
        '执行记录索引：Experiment Task、运行日志、异常复核记录和样本追踪',
        '结果包：原始读数、板图映射、QC/异常表、schema 校验结果和 Enzyme_Experiment_Result_Package.xlsx',
      ]),
    )
    expect(wetlabPipeline?.interface.permissions).toEqual(
      expect.arrayContaining([
        '订单提交必须通过正式 Approval Gate',
        '异常孔不得自动剔除，必须保留原始读数并进入人工复核',
        '不得自动进入下一轮设计或自动提交后续实验',
      ]),
    )
    expect(wetlabPipeline?.steps).toEqual(expectedExecutionSteps)
    expect(wetlabPipeline?.dag?.nodes.map((node) => node.title)).toEqual(
      expect.arrayContaining([
        '读取设计交接',
        '订单提交审批',
        '归档操作索引',
      ]),
    )

    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, '酶库订单与实验执行 Pipeline').click()
    })

    expect(container.textContent).toContain('v1.0')
    expect(container.textContent).toContain('正式审批')
    expect(container.textContent).toContain('异常孔不得自动剔除')

    act(() => {
      getButtonContaining(container, '展开').click()
    })

    expect(container.textContent).toContain('读取设计交接')
    expect(container.textContent).toContain('归档操作索引')
    expect(container.textContent).not.toContain('CRO connector 权限复核')

    root.unmount()
  })

  it('renders the saved ENZ-P0 Pipeline capability with its final DAG contract', () => {
    const savedPipeline = capabilityEntries.find(
      (entry) => entry.id === 'pipeline-enz-p0-assay-characterization',
    )
    const substrateGate = savedPipeline?.dag?.nodes.find(
      (node) => node.title === '底物与反应体系确认',
    )

    expect(savedPipeline).toMatchObject({
      name: 'ENZ-P0 Assay Characterization Pipeline',
      kind: 'pipeline',
      source: 'created',
      version: 'v1.0',
    })
    expect(savedPipeline?.interface.inputs).toEqual(
      expect.arrayContaining([
        expect.stringContaining('候选酶集合'),
        expect.stringContaining('样本与板位映射'),
        expect.stringContaining('酶活测定配置'),
      ]),
    )
    expect(savedPipeline?.interface.inputs.join('\n')).not.toContain(
      'ENZ-P0_candidate_variants.xlsx',
    )
    expect(savedPipeline?.interface.outputs).toEqual(
      expect.arrayContaining([
        expect.stringContaining('酶活结果'),
        expect.stringContaining('稳定性结果'),
        expect.stringContaining('异常与复测决策'),
        expect.stringContaining('输出文件'),
      ]),
    )
    expect(savedPipeline?.dag?.nodes.length).toBeGreaterThan(0)
    expect(substrateGate).toMatchObject({
      kind: 'human-gate',
      control: {
        kind: 'human-confirmation',
      },
    })
    expect(savedPipeline?.dag?.edges).toContainEqual({
      from: 'substrate-reaction-system-gate',
      to: 'enzyme-activity-assay',
      label: '体系确认',
    })

    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(
        container,
        'ENZ-P0 Assay Characterization Pipeline',
      ).click()
    })

    expect(getDetailSectionTitles(container)).toContain('执行 DAG')
    expect(container.textContent).toContain('v1.0')

    act(() => {
      getButtonContaining(container, '展开').click()
    })

    expect(container.textContent).toContain('体系确认')
    expect(container.textContent).toContain('Human Gate')

    act(() => {
      getButtonContaining(container, '最大化').click()
    })

    act(() => {
      getButtonContaining(container, '体系确认').click()
    })

    expect(container.textContent).toContain('底物与反应体系确认')
    expect(container.textContent).toContain('human-confirmation')

    root.unmount()
  })
})

function renderCapabilitiesPage(
  props: Partial<React.ComponentProps<typeof CapabilitiesPage>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  act(() => {
    root.render(<CapabilitiesPage onNotify={() => undefined} {...props} />)
  })

  return { container, root }
}

function getCapabilitiesHeader(container: HTMLElement) {
  const header = container.querySelector<HTMLElement>('.capabilities-header')

  if (!header) {
    throw new Error('Capabilities header not found')
  }

  return header
}

function getHeaderTitle(container: HTMLElement) {
  return getHeaderTitleElement(container).textContent
}

function getHeaderTitleElement(container: HTMLElement) {
  const heading = getCapabilitiesHeader(container).querySelector('h1')

  if (!heading) {
    throw new Error('Capabilities header title not found')
  }

  return heading
}

async function readAppCss() {
  // @ts-expect-error Vitest runs this test in Node, while app tsconfig omits Node built-in types.
  const { readFileSync } = await import('node:fs')

  return readFileSync('src/App.css', 'utf8') as string
}

function getCssRule(appCss: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = appCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  if (!match) {
    throw new Error(`CSS rule not found: ${selector}`)
  }

  return match[1]
}

function getButtonContaining(container: HTMLElement, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.textContent?.includes(text),
  )

  if (!button) {
    throw new Error(`Button not found containing: ${text}`)
  }

  return button
}

function openAdvancedCapabilityFilters(container: HTMLElement) {
  act(() => {
    getButtonContaining(container, '更多筛选').click()
  })
}

function changeSelect(container: HTMLElement, label: string, value: string) {
  const select = getSelectByLabel(container, label)

  act(() => {
    select.value = value
    select.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

function getSelectByLabel(container: HTMLElement, label: string) {
  const select = Array.from(container.querySelectorAll('select')).find(
    (element) => element.getAttribute('aria-label') === label,
  )

  if (!select) {
    throw new Error(`Select not found with label: ${label}`)
  }

  return select
}

function getClickableContaining(container: HTMLElement, text: string) {
  const control = Array.from(
    container.querySelectorAll<HTMLElement>('button, [role="button"]'),
  ).find((element) => element.textContent?.includes(text))

  if (!control) {
    throw new Error(`Clickable control not found containing: ${text}`)
  }

  return control
}

function getSwitch(container: HTMLElement, name: string) {
  const switchControl = Array.from(
    container.querySelectorAll<HTMLElement>('[role="switch"]'),
  ).find((element) => element.getAttribute('aria-label')?.includes(name))

  if (!switchControl) {
    throw new Error(`Switch not found: ${name}`)
  }

  return switchControl
}

function getDagViewport(container: HTMLElement) {
  const viewport = container.querySelector<HTMLElement>(
    '.capabilities-dag-canvas--modal .capabilities-dag-canvas__viewport',
  )

  if (!viewport) {
    throw new Error('DAG viewport not found')
  }

  return viewport
}

function getDagCanvas(container: HTMLElement) {
  const canvas = container.querySelector<HTMLElement>(
    '.capabilities-dag-canvas--modal',
  )

  if (!canvas) {
    throw new Error('DAG canvas not found')
  }

  return canvas
}

function getButtonByLabel(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === label,
  )

  if (!button) {
    throw new Error(`Button not found with label: ${label}`)
  }

  return button
}

function getDetailSectionTitles(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>('.capabilities-detail-section h3'),
  ).map((heading) => heading.textContent)
}
