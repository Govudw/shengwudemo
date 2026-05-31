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

    expect(container.textContent).toContain('Pipelines')
    expect(container.textContent).toContain('EGFR Antibody Affinity Optimization')
    expect(getButtonContaining(container, 'Plugins').textContent).toContain(
      'Preview',
    )

    root.unmount()
  })

  it('supports Codex-style Skill browsing, details, toggles, and build action', () => {
    const onNotify = vi.fn()
    const { container, root } = renderCapabilitiesPage({ onNotify })

    act(() => {
      getButtonContaining(container, 'Skills').click()
    })

    expect(container.querySelector('input[placeholder="Search skills"]')).not.toBeNull()
    expect(container.textContent).toContain('Operate Protein Design')

    const skillSwitch = getSwitch(container, 'Enabled for Main Agent')
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
      getClickableContaining(container, 'Operate Protein Design').click()
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(container.textContent).toContain('Instructions')
    expect(container.textContent).toContain('Triggers')
    expect(container.textContent).toContain('Examples')
    expect(
      container.querySelector('.capabilities-workspace')?.getAttribute('inert'),
    ).toBe('')

    act(() => {
      getButtonContaining(container, 'Pipelines').click()
    })

    act(() => {
      getButtonContaining(container, 'Build Pipeline with Agent').click()
    })

    expect(onNotify).toHaveBeenCalledWith(
      'Agent Builder 会在后续 Demo 中连接到 Pipeline 创建流程',
    )

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
