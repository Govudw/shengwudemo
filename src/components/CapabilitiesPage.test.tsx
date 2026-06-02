// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(
      getCssRule(appCss, '.capabilities-dag-canvas--preview .capabilities-dag-node'),
    ).toContain('min-height: 24px;')
    expect(
      getCssRule(appCss, '.capabilities-dag-canvas--preview .capabilities-dag-node__subtype'),
    ).toContain('display: none;')
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

    expect(onNotify).toHaveBeenCalledWith(
      'Agent Builder 会在后续演示中连接 Pipeline 创建流程',
    )

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

  it('shows a DAG preview for the default Pipeline without duplicating the linear steps section', () => {
    const { container, root } = renderCapabilitiesPage()

    expect(getDetailSectionTitles(container)).toContain('执行 DAG')
    expect(getDetailSectionTitles(container)).not.toContain('步骤')
    expect(container.textContent).toContain('Human Gate')
    expect(container.textContent).toContain('人工确认')
    expect(container.textContent).toContain('QC')
    expect(container.textContent).toContain('QC 判断')

    root.unmount()
  })

  it('opens the read-only Pipeline DAG Viewer and shows selected node execution details', () => {
    const { container, root } = renderCapabilitiesPage()

    act(() => {
      getButtonContaining(container, '最大化查看').click()
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
      getButtonContaining(container, '最大化查看').click()
    })

    act(() => {
      getButtonContaining(container, 'QC Decision').click()
    })

    expect(container.textContent).toContain('preset-qc-check')
    expect(getDagViewport(container).dataset.viewport).toBe('default')
    expect(getDagViewport(container).style.transform).toBe('')

    act(() => {
      getButtonContaining(container, 'Fit').click()
    })

    expect(getDagViewport(container).dataset.viewport).toBe('fit')
    expect(getDagViewport(container).style.transform).not.toBe('')
    expect(container.textContent).toContain('preset-qc-check')

    act(() => {
      getButtonContaining(container, 'Reset').click()
    })

    expect(getDagViewport(container).dataset.viewport).toBe('default')
    expect(getDagViewport(container).style.transform).toBe('')
    expect(container.textContent).toContain('选择一个节点查看执行条件。')

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(container.querySelector('[role="dialog"]')).toBeNull()

    root.unmount()
  })

  it('shows the DAG template for every Pipeline entry', () => {
    const { container, root } = renderCapabilitiesPage()
    const pipelineNames = [
      'EGFR 抗体亲和力优化 Pipeline',
      '蛋白稳定性改造 Pipeline',
      '湿实验验证订单 Pipeline',
      'AI-ready 数据集整理 Pipeline',
      '分子候选筛选 Pipeline',
    ]

    pipelineNames.forEach((name) => {
      act(() => {
        getButtonContaining(container, name).click()
      })

      expect(getDetailSectionTitles(container)).toContain('执行 DAG')
      expect(getDetailSectionTitles(container)).not.toContain('步骤')
      expect(container.textContent).toContain('Human Gate')
      expect(container.textContent).toContain('QC Decision')
    })

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
