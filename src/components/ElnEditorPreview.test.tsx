// @vitest-environment happy-dom

import { act } from 'react'
import type { ComponentProps } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildThreadObjectStorageFiles } from '../data/workspaceSideWindowMockData'
import type { SideWindowFileAsset } from '../data/workspaceSideWindowMockData'
import ElnEditorPreview from './ElnEditorPreview'

const echartsMock = vi.hoisted(() => {
  const chart = {
    setOption: vi.fn(),
    dispose: vi.fn(),
    resize: vi.fn(),
  }

  return {
    chart,
    init: vi.fn(() => chart),
    use: vi.fn(),
  }
})

vi.mock('echarts/core', () => ({
  init: echartsMock.init,
  use: echartsMock.use,
}))

const mountedRoots: Array<{ root: Root; mounted: boolean }> = []
const resizeObserverMock = vi.hoisted(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
}))

function getBmelnFile() {
  const files = buildThreadObjectStorageFiles('Enzyme Synthesis Ops', 'lims-flow-run')
  const bmelnFile = files.find(
    (file) => file.fileName === 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
  )
  expect(bmelnFile).toBeDefined()

  return bmelnFile!
}

function getImageBlockFixtureFile(): SideWindowFileAsset {
  const baseFile = getBmelnFile()

  return {
    ...baseFile,
    id: `${baseFile.id}-image-fixture`,
    fileName: 'image-block-fixture.bmeln',
    elnDocument: {
      ...baseFile.elnDocument!,
      revision: baseFile.elnDocument!.revision + 1,
      document: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: '图片块测试记录' }],
          },
          {
            type: 'elnImageBlock',
            attrs: {
              src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
              alt: '图片块测试图',
              caption: '图：单独图片块测试。',
              assetRef: 'Runs/RUN-ENZ-SYN-20260604-001/eln/image-block-fixture.png',
              sourceRef: 'image block fixture',
            },
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: '图片块预览结束。' }],
          },
        ],
      },
    },
  }
}

async function renderPreview(
  file: SideWindowFileAsset,
  props: Partial<ComponentProps<typeof ElnEditorPreview>> = {},
) {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  const mountedRoot = { root, mounted: true }
  mountedRoots.push(mountedRoot)

  await act(async () => {
    root.render(<ElnEditorPreview file={file} {...props} />)
  })

  function unmount() {
    if (!mountedRoot.mounted) {
      return
    }

    mountedRoot.mounted = false
    root.unmount()
  }

  return { container, root, unmount }
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

  expect(button, `button ${name}`).toBeDefined()
  return button!
}

function getMenuButton(menu: Element, name: string) {
  const button = Array.from(menu.querySelectorAll('button')).find(
    (element) =>
      element.getAttribute('aria-label') === name ||
      element.textContent?.trim() === name,
  )

  expect(button, `menu button ${name}`).toBeDefined()
  return button!
}

async function clickElement(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
}

async function pointerDownElement(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }))
  })
}

async function mouseMoveElement(element: Element, options: MouseEventInit = {}) {
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent('mousemove', {
        bubbles: true,
        clientX: 0,
        clientY: 0,
        ...options,
      }),
    )
  })
}

async function mouseLeaveElement(element: Element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
  })
}

async function hoverFirstBodyBlock(container: HTMLElement) {
  const block = container.querySelector<HTMLElement>(
    '.workspace-file-preview__eln-prosemirror p',
  )
  expect(block).not.toBeNull()
  mockElementRect(block!, { top: 120, left: 420, width: 680, height: 56 })
  await mouseMoveElement(block!, { clientY: 132 })

  return block!
}

async function hoverEditorBlock(container: HTMLElement, selector: string) {
  const block = container.querySelector<HTMLElement>(selector)
  expect(block, selector).not.toBeNull()
  mockElementRect(block!, { top: 120, left: 420, width: 680, height: 56 })
  await mouseMoveElement(block!, { clientY: 132 })

  return block!
}

function mockElementRect(
  element: Element,
  rect: Partial<DOMRectReadOnly> & Pick<DOMRectReadOnly, 'top' | 'left'>,
) {
  const width = rect.width ?? 0
  const height = rect.height ?? 0
  const top = rect.top
  const left = rect.left
  const right = rect.right ?? left + width
  const bottom = rect.bottom ?? top + height

  element.getBoundingClientRect = vi.fn(
    () =>
      ({
        top,
        left,
        right,
        bottom,
        width,
        height,
        x: left,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect,
  )
}

async function pressKey(element: Element, key: string, options: KeyboardEventInit = {}) {
  await act(async () => {
    element.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key,
        ...options,
      }),
    )
  })
}

async function waitForEditorEffects() {
  await act(async () => {
    await Promise.resolve()
    await new Promise((resolve) => {
      window.requestAnimationFrame(resolve)
    })
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0)
    })
  })
}

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
  echartsMock.chart.setOption.mockClear()
  echartsMock.chart.dispose.mockClear()
  echartsMock.chart.resize.mockClear()
  echartsMock.init.mockReset()
  echartsMock.init.mockReturnValue(echartsMock.chart)
  echartsMock.use.mockClear()
  resizeObserverMock.observe.mockClear()
  resizeObserverMock.disconnect.mockClear()

  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    value: class ResizeObserverMock {
      observe = resizeObserverMock.observe
      disconnect = resizeObserverMock.disconnect
    },
  })

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
  act(() => {
    mountedRoots.splice(0).forEach((mountedRoot) => {
      if (mountedRoot.mounted) {
        mountedRoot.root.unmount()
        mountedRoot.mounted = false
      }
    })
  })
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('ElnEditorPreview', () => {
  it('renders the LIMS bmeln document as rich body blocks without the old metadata shell', async () => {
    const { container } = await renderPreview(getBmelnFile())

    expect(container.querySelector('.workspace-file-preview__eln-header')).toBeNull()
    expect(container.querySelector('.workspace-file-preview__eln-meta')).toBeNull()
    expect(container.querySelector('.workspace-file-preview__eln-sections')).toBeNull()
    expect(container.querySelector('h1')?.textContent).toBe('酶合成实验记录')

    expect(container.querySelector('.workspace-file-preview__eln-image-block')).toBeNull()
    expect(container.textContent).toContain('板图角色')
    expect(container.textContent).toContain('板图孔位布局摘要')
    expect(container.textContent).toContain('数据完整性检查项')

    const chartBlock = Array.from(
      container.querySelectorAll('.workspace-file-preview__eln-chart-block'),
    ).find((block) => block.textContent?.includes('工单节点完成状态'))
    expect(chartBlock).toBeDefined()
    expect(chartBlock?.textContent).toContain('柱状图')
    expect(chartBlock?.textContent).toContain('工单节点完成状态')
    expect(chartBlock?.textContent).toContain('work order callbacks')
    expect(chartBlock?.textContent).toContain('2026-06-04 16:18')
    expect(
      chartBlock?.querySelector(
        '.workspace-file-preview__eln-chart-echarts[role="img"]',
      ),
    ).not.toBeNull()

    const signatureBlock = container.querySelector(
      '.workspace-file-preview__eln-signature-block',
    )
    expect(signatureBlock).not.toBeNull()
    expect(signatureBlock?.textContent).toContain('Lab Owner')
    expect(signatureBlock?.textContent).toContain('signed')
    expect(signatureBlock?.textContent).toContain('2026-06-04 09:18')

    expect(
      container.querySelector('.workspace-file-preview__eln-attachment-block'),
    ).toBeNull()
    expect(container.textContent).toContain('启动输入包内容已直接写入本记录')
    expect(container.textContent).toContain('构建工单内容已直接并入本节')
    expect(container.textContent).toContain('结果包发布结论')

    expect(container.querySelector('.workspace-file-preview__eln-table-scroll')).toBeNull()
    expect(container.querySelector('.workspace-file-preview__eln-prosemirror table'))
      .not.toBeNull()
  })

  it('publishes a heading-only outline and refreshes after heading text edits', async () => {
    const onDocumentOutlineChange = vi.fn()
    const { container } = await renderPreview(getBmelnFile(), {
      onDocumentOutlineChange,
    } as Partial<ComponentProps<typeof ElnEditorPreview>>)

    await waitForEditorEffects()

    const firstOutline = onDocumentOutlineChange.mock.calls.at(-1)?.[0] ?? []
    const firstOutlineTitles = firstOutline.map((item: { title: string }) => item.title)
    expect(firstOutlineTitles).toContain('酶合成实验记录')
    expect(firstOutlineTitles).toContain('样本登记与板图')
    expect(firstOutlineTitles).toContain('审核与签名')
    expect(firstOutlineTitles).not.toContain(
      '图 1：样本登记、板图和结果记录摘要，显示本轮样本范围与记录状态。',
    )
    expect(firstOutlineTitles).not.toContain('工单节点完成状态')
    expect(firstOutlineTitles).not.toContain('Lab Owner')

    const heading = container.querySelector<HTMLElement>(
      '.workspace-file-preview__eln-prosemirror h1',
    )
    expect(heading).not.toBeNull()
    expect(heading?.dataset.elnHeadingId).toBe('heading-0')

    await act(async () => {
      heading!.textContent = '酶合成实验记录（已编辑）'
      heading!.dispatchEvent(new InputEvent('input', { bubbles: true }))
    })

    const refreshedOutline = onDocumentOutlineChange.mock.calls.at(-1)?.[0] ?? []
    expect(refreshedOutline[0]?.title).toBe('酶合成实验记录（已编辑）')
    expect(refreshedOutline.map((item: { title: string }) => item.title)).not.toContain(
      '工单节点完成状态',
    )
  })

  it('initializes chart blocks and disposes chart instances on unmount', async () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { container, unmount } = await renderPreview(getBmelnFile())

    const chartContainers = container.querySelectorAll(
      '.workspace-file-preview__eln-chart-echarts',
    )
    expect(chartContainers.length).toBeGreaterThan(1)
    expect(echartsMock.init).toHaveBeenCalledTimes(chartContainers.length)
    expect(echartsMock.chart.setOption).toHaveBeenCalledTimes(chartContainers.length)
    expect(resizeObserverMock.observe).toHaveBeenCalledTimes(chartContainers.length)
    expect(
      addEventListenerSpy.mock.calls.filter(([eventName]) => eventName === 'resize'),
    ).toHaveLength(chartContainers.length)

    await act(async () => {
      unmount()
    })

    expect(echartsMock.chart.dispose).toHaveBeenCalledTimes(chartContainers.length)
    expect(resizeObserverMock.disconnect).toHaveBeenCalledTimes(chartContainers.length)
    expect(
      removeEventListenerSpy.mock.calls.filter(([eventName]) => eventName === 'resize'),
    ).toHaveLength(chartContainers.length)
  })

  it('warns without crashing when chart initialization fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    echartsMock.init.mockImplementation(() => {
      throw new Error('chart init failed')
    })

    await renderPreview(getBmelnFile())

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('ELN chart initialization failed'),
      expect.any(Error),
    )
  })

  it('renders without a fixed toolbar and keeps the empty paragraph placeholder', async () => {
    const baseFile = getBmelnFile()
    const { container } = await renderPreview({
      ...baseFile,
      id: `${baseFile.id}-draft`,
      fileName: 'draft-empty.bmeln',
      elnDocument: undefined,
    })

    expect(container.querySelector('.workspace-file-preview__eln-toolbar')).toBeNull()
    expect(
      container.querySelector('p.is-empty[data-placeholder="输入 / 插入内容"]'),
    ).not.toBeNull()
  })

  it('opens the slash command menu from / and inserts the selected command with the keyboard', async () => {
    const onDirtyStateChange = vi.fn()
    const { container } = await renderPreview(getBmelnFile(), { onDirtyStateChange })
    const editorElement = container.querySelector('.workspace-file-preview__eln-prosemirror')
    const headingText = container.querySelector(
      '.workspace-file-preview__eln-prosemirror h1',
    )?.firstChild
    expect(editorElement).not.toBeNull()
    expect(headingText).not.toBeNull()

    const range = document.createRange()
    range.setStart(headingText!, 0)
    range.collapse(true)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    await pressKey(editorElement!, '/')

    const menu = container.querySelector('[role="menu"][aria-label="插入内容"]')
    expect(menu).not.toBeNull()
    ;[
      '正文',
      'H1',
      'H2',
      'H3',
      '无序列表',
      '有序列表',
      '分割线',
      '普通表格',
      '图片块',
      '提示块',
      'Chart Block',
      'Signature Block',
    ].forEach((label) => {
      expect(menu?.textContent).toContain(label)
    })
    expect(menu?.textContent).not.toContain('附件引用块')

    await pressKey(editorElement!, 'ArrowDown')
    await pressKey(editorElement!, 'Enter')

    expect(container.querySelectorAll('.workspace-file-preview__eln-prosemirror h1').length)
      .toBeGreaterThan(1)
    expect(onDirtyStateChange).toHaveBeenCalledWith('有未保存编辑')
  })

  it('assigns scrollable heading ids to headings inserted after initial render', async () => {
    const scrollIntoView = vi.fn()
    Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    })
    const { container, root } = await renderPreview(getBmelnFile())
    const editorElement = container.querySelector('.workspace-file-preview__eln-prosemirror')
    expect(editorElement).not.toBeNull()

    await hoverFirstBodyBlock(container)
    await clickElement(getButton(container, '插入内容'))
    const menu = container.querySelector('[role="menu"][aria-label="插入内容"]')
    expect(menu).not.toBeNull()
    await clickElement(getMenuButton(menu!, 'H1'))
    await waitForEditorEffects()

    const headings = Array.from(
      container.querySelectorAll<HTMLElement>(
        '.workspace-file-preview__eln-prosemirror h1',
      ),
    )
    const insertedHeading = headings.at(-1)
    const insertedHeadingId = insertedHeading?.dataset.elnHeadingId
    expect(insertedHeadingId).toBeTruthy()

    await act(async () => {
      root.render(
        <ElnEditorPreview
          file={getBmelnFile()}
          headingScrollRequest={{ id: insertedHeadingId!, requestId: 1 }}
        />,
      )
    })

    expect(scrollIntoView).toHaveBeenCalled()
  })

  it('opens the shared insert menu from the plus button and inserts default table and blocks by click', async () => {
    const { container } = await renderPreview(getBmelnFile())
    const initialTableCount = container.querySelectorAll(
      '.workspace-file-preview__eln-prosemirror table',
    ).length

    await hoverFirstBodyBlock(container)
    const contextualInsertButton = getButton(container, '插入内容')
    expect(
      contextualInsertButton.closest('.workspace-file-preview__eln-context-insert'),
    ).not.toBeNull()

    await clickElement(contextualInsertButton)
    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).not.toBeNull()
    await clickElement(getButton(container, '普通表格'))
    const tables = Array.from(
      container.querySelectorAll('.workspace-file-preview__eln-prosemirror table'),
    )
    expect(tables.length).toBe(initialTableCount + 1)
    expect(
      tables.some(
        (table) =>
          table.querySelectorAll('tr').length === 3 &&
          table.querySelectorAll('td, th').length === 9,
      ),
    ).toBe(true)

    for (const label of ['Chart Block', '图片块', 'Signature Block']) {
      await hoverFirstBodyBlock(container)
      await clickElement(getButton(container, '插入内容'))
      await clickElement(getButton(container, label))
    }

    expect(container.textContent).toContain('预设数据图表')
    expect(container.textContent).toContain('图：待补充说明。')
    expect(container.textContent).toContain('预留复核签名位。')
    expect(container.textContent).not.toContain('attachment.json')
  })

  it('closes the insert menu when clicking outside it', async () => {
    const { container } = await renderPreview(getBmelnFile())

    await hoverFirstBodyBlock(container)
    await clickElement(getButton(container, '插入内容'))
    const menu = container.querySelector('[role="menu"][aria-label="插入内容"]')
    const editorElement = container.querySelector(
      '.workspace-file-preview__eln-prosemirror',
    )
    expect(menu).not.toBeNull()
    expect(editorElement).not.toBeNull()

    await pointerDownElement(menu!)
    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).not.toBeNull()

    await pointerDownElement(editorElement!)

    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).toBeNull()
  })

  it('toggles the insert menu closed when clicking the plus button again', async () => {
    const { container } = await renderPreview(getBmelnFile())
    await hoverFirstBodyBlock(container)
    const insertButton = getButton(container, '插入内容')

    await clickElement(insertButton)
    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).not.toBeNull()

    await clickElement(insertButton)

    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).toBeNull()
  })

  it('shows the contextual plus only while hovering an editable document block', async () => {
    const { container } = await renderPreview(getBmelnFile())
    const editorElement = container.querySelector(
      '.workspace-file-preview__eln-prosemirror',
    )
    expect(editorElement).not.toBeNull()
    expect(findButton(container, '插入内容')).toBeUndefined()

    const hoveredBlock = await hoverFirstBodyBlock(container)
    const insertButton = getButton(container, '插入内容')
    const insertChrome = insertButton.closest<HTMLElement>(
      '.workspace-file-preview__eln-context-insert',
    )
    expect(insertChrome).not.toBeNull()
    expect(insertChrome?.style.top).toBeTruthy()

    await mouseLeaveElement(editorElement!)

    expect(findButton(container, '插入内容')).toBeUndefined()

    await mouseMoveElement(hoveredBlock, { clientY: 132 })
    await clickElement(getButton(container, '插入内容'))
    await mouseLeaveElement(editorElement!)

    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).not.toBeNull()
    expect(getButton(container, '插入内容')).toBeTruthy()
  })

  it('keeps the contextual insert control reachable when the pointer moves onto it', async () => {
    const { container } = await renderPreview(getBmelnFile())

    await hoverFirstBodyBlock(container)
    const insertButton = getButton(container, '插入内容')

    await mouseMoveElement(insertButton)

    expect(getButton(container, '插入内容')).toBe(insertButton)

    await clickElement(insertButton)

    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).not.toBeNull()
  })

  it('keeps the contextual insert menu inside the viewport margin on narrow rails', async () => {
    const { container } = await renderPreview(getBmelnFile())
    const bodyShell = container.querySelector<HTMLElement>(
      '.workspace-file-preview__eln-body-shell',
    )
    expect(bodyShell).not.toBeNull()
    mockElementRect(bodyShell!, {
      top: 0,
      left: 93,
      width: 482,
      height: 1000,
    })

    await hoverFirstBodyBlock(container)
    await clickElement(getButton(container, '插入内容'))

    const menu = container.querySelector<HTMLElement>(
      '[role="menu"][aria-label="插入内容"]',
    )
    expect(menu).not.toBeNull()
    expect(menu?.style.left).toBe('-77px')
  })

  it('labels the contextual insert control with the hovered block structure', async () => {
    const { container } = await renderPreview(getBmelnFile())

    await hoverEditorBlock(container, '.workspace-file-preview__eln-prosemirror p')
    expect(getButton(container, '插入内容').textContent).toBe('T')

    await hoverEditorBlock(container, '.workspace-file-preview__eln-prosemirror h2')
    expect(getButton(container, '插入内容').textContent).toBe('H2')

    await hoverEditorBlock(container, '.workspace-file-preview__eln-prosemirror table')
    expect(getButton(container, '插入内容').textContent).toBe('表')

    await hoverEditorBlock(
      container,
      '.workspace-file-preview__eln-prosemirror [data-eln-block="chart"]',
    )
    expect(getButton(container, '插入内容').textContent).toBe('图')
  })

  it('does not intercept slash in ordinary text content', async () => {
    const { container } = await renderPreview(getBmelnFile())
    const editorElement = container.querySelector('.workspace-file-preview__eln-prosemirror')
    const paragraphText = container.querySelector(
      '.workspace-file-preview__eln-prosemirror p',
    )?.firstChild
    expect(editorElement).not.toBeNull()
    expect(paragraphText).not.toBeNull()

    const range = document.createRange()
    range.setStart(paragraphText!, paragraphText!.textContent?.length ?? 0)
    range.collapse(true)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: '/',
    })

    await act(async () => {
      editorElement!.dispatchEvent(event)
    })

    expect(event.defaultPrevented).toBe(false)
    expect(container.querySelector('[role="menu"][aria-label="插入内容"]')).toBeNull()
  })

  it('opens and closes the image viewer without marking the document dirty', async () => {
    const onDirtyStateChange = vi.fn()
    const { container } = await renderPreview(getImageBlockFixtureFile(), {
      onDirtyStateChange,
    })

    const image = container.querySelector('.workspace-file-preview__eln-image-block img')
    expect(image).not.toBeNull()
    await clickElement(image!)

    const dialog = container.querySelector('[role="dialog"][aria-label="图片预览"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.querySelector('img')).not.toBeNull()

    await clickElement(getButton(container, '关闭图片预览'))

    expect(container.querySelector('[role="dialog"][aria-label="图片预览"]')).toBeNull()
    expect(container.textContent).not.toContain('有未保存编辑')
    expect(onDirtyStateChange).not.toHaveBeenCalled()
  })

  it('expands read-only signature details from the block menu without dirtying the document', async () => {
    const onDirtyStateChange = vi.fn()
    const { container } = await renderPreview(getBmelnFile(), { onDirtyStateChange })
    const signature = container.querySelector('.workspace-file-preview__eln-signature-block')
    expect(signature).not.toBeNull()

    await clickElement(signature!.querySelector('[aria-label="块操作"]')!)
    await clickElement(getButton(container, '查看详情'))

    expect(signature?.textContent).toContain('状态')
    expect(signature?.textContent).toContain('签署人')
    expect(signature?.textContent).toContain('签署时间')
    expect(signature?.querySelector('input, textarea, select')).toBeNull()
    expect(container.textContent).not.toContain('有未保存编辑')
    expect(onDirtyStateChange).not.toHaveBeenCalled()
  })

  it('resets content without reporting dirty when a new file revision arrives', async () => {
    const baseFile = getBmelnFile()
    const revisedFile: SideWindowFileAsset = {
      ...baseFile,
      statusLabel: '已保存',
      elnDocument: {
        ...baseFile.elnDocument!,
        revision: baseFile.elnDocument!.revision + 1,
        document: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: 1 },
              content: [{ type: 'text', text: '外部刷新后的记录' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '服务器刷新内容' }],
            },
          ],
        },
      },
    }
    const onDirtyStateChange = vi.fn()
    const { container, root } = await renderPreview(baseFile, { onDirtyStateChange })
    const editorElement = container.querySelector('.workspace-file-preview__eln-prosemirror')
    expect(editorElement).not.toBeNull()

    await pressKey(editorElement!, '/')
    await pressKey(editorElement!, 'Enter')

    expect(onDirtyStateChange).toHaveBeenCalledWith('有未保存编辑')

    onDirtyStateChange.mockClear()
    await act(async () => {
      root.render(
        <ElnEditorPreview file={revisedFile} onDirtyStateChange={onDirtyStateChange} />,
      )
    })

    expect(container.textContent).toContain('外部刷新后的记录')
    expect(container.textContent).toContain('服务器刷新内容')
    expect(container.textContent).not.toContain('有未保存编辑')
    expect(onDirtyStateChange).not.toHaveBeenCalled()
  })

  it('shows a copy fallback when clipboard write is rejected', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('clipboard denied'))
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
    const { container } = await renderPreview(getBmelnFile())
    const chartBlock = container.querySelector('.workspace-file-preview__eln-chart-block')
    expect(chartBlock).not.toBeNull()

    await clickElement(chartBlock!.querySelector('[aria-label="块操作"]')!)
    await clickElement(getButton(container, '复制块信息'))
    await act(async () => {
      await Promise.resolve()
    })

    expect(writeText).toHaveBeenCalled()
    expect(chartBlock?.textContent).toContain('复制失败')
  })

  it('deletes a special block through the block menu and restores it with undo', async () => {
    const { container } = await renderPreview(getBmelnFile())
    const editorElement = container.querySelector('.workspace-file-preview__eln-prosemirror')
    expect(editorElement).not.toBeNull()
    expect(container.textContent).toContain('工单节点完成状态')

    const chartBlock = Array.from(
      container.querySelectorAll('.workspace-file-preview__eln-chart-block'),
    ).find((block) => block.textContent?.includes('工单节点完成状态'))
    expect(chartBlock).toBeDefined()
    await clickElement(chartBlock!.querySelector('[aria-label="块操作"]')!)

    const blockMenu = container.querySelector('[role="menu"][aria-label="块操作"]')
    expect(blockMenu?.textContent).toContain('查看详情')
    expect(blockMenu?.textContent).toContain('复制块信息')
    expect(blockMenu?.textContent).toContain('删除块')

    await clickElement(getButton(container, '删除块'))
    expect(container.textContent).not.toContain('工单节点完成状态')

    await pressKey(editorElement!, 'z', { metaKey: true })

    expect(container.textContent).toContain('工单节点完成状态')
  })
})
