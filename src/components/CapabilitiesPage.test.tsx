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

function getButtonByLabel(container: HTMLElement, label: string) {
  const button = Array.from(container.querySelectorAll('button')).find(
    (element) => element.getAttribute('aria-label') === label,
  )

  if (!button) {
    throw new Error(`Button not found with label: ${label}`)
  }

  return button
}
