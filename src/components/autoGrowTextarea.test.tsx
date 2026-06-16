// @vitest-environment happy-dom

import { act, type RefObject, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DemoProject } from '../store/demoStoreLogic'
import Composer from './Composer'
import ThreadComposer from './ThreadComposer'

const projects: DemoProject[] = [
  {
    id: 'project-1',
    name: 'Pipeline Build',
    threads: [],
  },
]

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('auto-growing composer textareas', () => {
  it('keeps the home composer default height until content needs more room, then grows', () => {
    mockTextareaMetrics({
      lineHeight: 24,
      minHeight: 132,
      paddingTop: 20,
      paddingBottom: 58,
    })
    const { container, root } = renderHomeComposer()
    const textarea = getTextarea(container, '研发目标或对话内容')

    expect(textarea.style.height).toBe('132px')
    expect(textarea.style.overflowY).toBe('hidden')

    mockScrollHeight(textarea, 260)

    act(() => {
      setTextareaValue(textarea, '第一行\n第二行\n第三行\n第四行\n第五行')
    })

    expect(textarea.style.height).toBe('260px')
    expect(textarea.style.overflowY).toBe('hidden')

    mockScrollHeight(textarea, 177)

    act(() => {
      setTextareaValue(textarea, '')
    })

    expect(textarea.style.height).toBe('132px')
    expect(textarea.style.overflowY).toBe('hidden')

    root.unmount()
  })

  it('caps thread composer height at ten and a half rendered lines with internal scrolling', () => {
    mockTextareaMetrics({
      lineHeight: 20,
      minHeight: 76,
      paddingTop: 12,
      paddingBottom: 12,
    })
    const { container, root } = renderThreadComposer()
    const textarea = getTextarea(container, '继续推进这个对话')

    mockScrollHeight(textarea, 360)

    act(() => {
      setTextareaValue(
        textarea,
        Array.from({ length: 16 }, () => '你好').join('\n'),
      )
    })

    expect(textarea.style.height).toBe('234px')
    expect(textarea.style.overflowY).toBe('auto')
    expect(textarea.scrollTop).toBe(360)

    root.unmount()
  })
})

function renderHomeComposer() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  function HomeComposerFixture() {
    const [draft, setDraft] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    return (
      <Composer
        projects={projects}
        selectedProjectId="project-1"
        isDraftingNewThread
        draft={draft}
        textareaRef={textareaRef as RefObject<HTMLTextAreaElement | null>}
        projectMenuOpen={false}
        onDraftChange={setDraft}
        onProjectMenuOpenChange={() => undefined}
        onProjectChange={() => undefined}
        onCreateProject={() => undefined}
        onSubmit={() => undefined}
        onNotify={() => undefined}
      />
    )
  }

  act(() => {
    root.render(<HomeComposerFixture />)
  })

  return { container, root }
}

function renderThreadComposer() {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  function ThreadComposerFixture() {
    const [draft, setDraft] = useState('')

    return (
      <ThreadComposer
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={() => undefined}
        onNotify={() => undefined}
      />
    )
  }

  act(() => {
    root.render(<ThreadComposerFixture />)
  })

  return { container, root }
}

function mockTextareaMetrics({
  lineHeight,
  minHeight,
  paddingTop,
  paddingBottom,
}: {
  lineHeight: number
  minHeight: number
  paddingTop: number
  paddingBottom: number
}) {
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    () =>
      ({
        lineHeight: `${lineHeight}px`,
        minHeight: `${minHeight}px`,
        paddingTop: `${paddingTop}px`,
        paddingBottom: `${paddingBottom}px`,
      }) as CSSStyleDeclaration,
  )
}

function mockScrollHeight(textarea: HTMLTextAreaElement, scrollHeight: number) {
  Object.defineProperty(textarea, 'scrollHeight', {
    configurable: true,
    get: () => scrollHeight,
  })
}

function getTextarea(container: HTMLElement, label: string) {
  const textarea = container.querySelector<HTMLTextAreaElement>(
    `textarea[aria-label="${label}"]`,
  )

  if (!textarea) {
    throw new Error(`Textarea not found: ${label}`)
  }

  return textarea
}

function setTextareaValue(textarea: HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    'value',
  )?.set

  valueSetter?.call(textarea, value)
  textarea.dispatchEvent(new Event('input', { bubbles: true }))
}
