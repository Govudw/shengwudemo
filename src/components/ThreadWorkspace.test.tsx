// @vitest-environment happy-dom

import { act, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DemoThread } from '../store/demoStoreLogic'
import ThreadWorkspace from './ThreadWorkspace'

const thread: DemoThread = {
  id: 'egfr-affinity',
  title: 'EGFR 抗体亲和力优化',
  lastActivityAt: 0,
  pinned: false,
  pinnedAt: null,
  archived: false,
  createdAt: 0,
  transcript: [],
  runInspector: {
    summary: {
      stage: '已完成干湿闭环',
      status: 'completed',
      completedSteps: 7,
      totalSteps: 7,
      outputCount: 1,
      pendingCount: 0,
    },
    progress: [],
    outputs: [],
    approvals: [],
    capabilityRuns: [
      {
        id: 'read-baseline',
        commandName: '读取基线数据',
        summary: '读取项目文件并提取亲和力基线',
        duration: '12s',
        status: 'success',
        input: { file: 'EGFR_parent_antibody_baseline.xlsx' },
        output: { parentAntibody: 'EGFR-P0' },
        artifacts: [{ name: 'EGFR_parent_antibody_baseline.xlsx', kind: 'xlsx' }],
      },
    ],
  },
}

const noop = () => undefined

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('ThreadWorkspace', () => {
  it('renders candidate evidence table blocks with configured enzyme columns', () => {
    const enzymeThread: DemoThread = {
      ...thread,
      id: 'enzyme-design',
      title: 'Enzyme design evidence',
      transcript: [
        {
          id: 'enzyme-candidates',
          role: 'mainAgent',
          contentBlocks: [
            {
              type: 'candidateEvidenceTable',
              title: 'Enzyme candidate evidence',
              columns: [
                { key: 'kcatKmProxy', label: 'kcat/Km proxy' },
                { key: 'tm', label: 'Tm' },
                { key: 'phWindow', label: 'pH window' },
              ],
              rows: [
                {
                  id: 'ENZ-MUT-021',
                  group: 'active-site loop',
                  evidence: {
                    kcatKmProxy: '+2.1x',
                    tm: '68 C',
                    phWindow: '6.5-8.0',
                  },
                  risk: 'medium',
                  rationale: 'Improves turnover proxy while preserving thermostability.',
                },
              ],
            },
          ],
        },
      ],
    }

    const html = renderToString(
      <ThreadWorkspace
        thread={enzymeThread}
        projectName="Enzyme Design"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('kcat/Km proxy')
    expect(html).toContain('Tm')
    expect(html).toContain('pH window')
    expect(html).toContain('ENZ-MUT-021')
  })

  it('renders the compact run info action while closed', () => {
    const html = renderToString(
      <ThreadWorkspace
        thread={thread}
        projectName="Antibody Optimization"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen={false}
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('aria-label="打开运行信息"')
    expect(html).toContain('aria-expanded="false"')
    expect(html).toContain('运行信息')
    expect(html).not.toContain('id="thread-run-inspector"')
  })

  it('renders the run inspector panel when open', () => {
    const html = renderToString(
      <ThreadWorkspace
        thread={thread}
        projectName="Antibody Optimization"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={noop}
        runInspectorOpen
        onRunInspectorOpenChange={noop}
      />,
    )

    expect(html).toContain('aria-label="关闭运行信息"')
    expect(html).toContain('aria-expanded="true"')
    expect(html).toContain('id="thread-run-inspector"')
    expect(html).toContain('已完成干湿闭环')
  })

  it('keeps keyboard focus inside the run inspector drawer and restores it on close', async () => {
    const { container, root } = renderInteractiveThreadWorkspace()

    const runInfoButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="打开运行信息"]',
    )
    expect(runInfoButton).not.toBeNull()

    await act(async () => {
      runInfoButton?.click()
    })
    await waitForTimers()

    const panel = container.querySelector<HTMLElement>('#thread-run-inspector')
    expect(panel).not.toBeNull()
    expect(panel?.getAttribute('role')).toBe('dialog')
    expect(document.activeElement).toBe(panel)

    const focusableButtons = Array.from(
      panel?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? [],
    )
    expect(focusableButtons.length).toBeGreaterThan(0)

    await act(async () => {
      panel?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: true,
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(document.activeElement).toBe(focusableButtons.at(-1))

    await act(async () => {
      document.activeElement?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Tab',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    expect(document.activeElement).toBe(focusableButtons[0])

    await act(async () => {
      panel?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      )
    })
    await waitForTimers()

    expect(container.querySelector('#thread-run-inspector')).toBeNull()
    expect(document.activeElement).toBe(
      container.querySelector('button[aria-label="打开运行信息"]'),
    )

    root.unmount()
  })

  it('opens attachment actions from the thread composer plus button', () => {
    const notifications: string[] = []
    const { container, root } = renderInteractiveThreadWorkspace({
      onNotify: (message) => notifications.push(message),
    })

    act(() => {
      getButton(container, 'Add context').click()
    })

    expect(container.querySelector('.attachment-menu')).not.toBeNull()
    expect(getButton(container, '从资产添加')).toBeTruthy()
    expect(getButton(container, '上传文件或图片')).toBeTruthy()
    expect(container.textContent).not.toContain('附件上传会进入当前项目文件区')

    act(() => {
      getButton(container, '上传文件或图片').click()
    })

    expect(container.querySelector('.attachment-menu')).toBeNull()
    expect(notifications).toContain('上传文件或图片将在后续 Demo 中展开')

    root.unmount()
  })
})

function renderInteractiveThreadWorkspace({
  onNotify = noop,
}: {
  onNotify?: (message: string) => void
} = {}) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)

  function Harness() {
    const [open, setOpen] = useState(false)

    return (
      <ThreadWorkspace
        thread={thread}
        projectName="Antibody Optimization"
        draft=""
        onDraftChange={noop}
        onSubmit={noop}
        onRenameThread={noop}
        onArchiveThread={noop}
        onDeleteThread={noop}
        onNotify={onNotify}
        runInspectorOpen={open}
        onRunInspectorOpenChange={setOpen}
      />
    )
  }

  act(() => {
    root.render(<Harness />)
  })

  return { container, root }
}

function waitForTimers() {
  return act(async () => {
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0)
    })
  })
}

function findButton(container: HTMLElement, name: string) {
  return Array.from(container.querySelectorAll('button')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name,
  )
}

function getButton(container: HTMLElement, name: string) {
  const button = findButton(container, name)

  if (!button) {
    throw new Error(`Button not found: ${name}`)
  }

  return button
}
