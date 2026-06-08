import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
} from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { SideWindowFileAsset } from '../data/workspaceSideWindowMockData'
import { createElnEditorExtensions } from './eln/ElnEditorExtensions'
import {
  buildDefaultChartNode,
  buildDefaultImageNode,
  buildDefaultSignatureNode,
  buildDefaultTableNode,
  extractDocumentOutline,
  type ElnDocumentOutlineItem,
  getDefaultElnDocument,
} from './eln/elnDocumentModel'

export type ElnHeadingScrollRequest = {
  id: string
  requestId: number
}

type ElnEditorPreviewProps = {
  file: SideWindowFileAsset
  onDirtyStateChange?: (statusLabel: string) => void
  onDocumentOutlineChange?: (outline: ElnDocumentOutlineItem[]) => void
  headingScrollRequest?: ElnHeadingScrollRequest | null
}

type InsertMenuItem = {
  id: string
  label: string
  group: string
  run: () => void
}

type PreviewImage = {
  src: string
  alt: string
  caption: string
  sourceRef: string
  assetRef: string
}

type InsertPlacement = 'selection' | 'document-end'

type HoverInsertPosition = {
  top: number
  label: string
  menuLeft: number
}

const INSERT_MENU_DEFAULT_LEFT = -254
const INSERT_MENU_VIEWPORT_MARGIN = 16

function ElnEditorPreview({
  file,
  onDirtyStateChange,
  onDocumentOutlineChange,
  headingScrollRequest,
}: ElnEditorPreviewProps) {
  const editorResetKey = [
    file.id,
    file.elnDocument?.revision ?? 0,
    file.statusLabel,
  ].join(':')

  return (
    <ElnEditorPreviewInner
      key={editorResetKey}
      file={file}
      onDirtyStateChange={onDirtyStateChange}
      onDocumentOutlineChange={onDocumentOutlineChange}
      headingScrollRequest={headingScrollRequest}
    />
  )
}

function ElnEditorPreviewInner({
  file,
  onDirtyStateChange,
  onDocumentOutlineChange,
  headingScrollRequest,
}: ElnEditorPreviewProps) {
  const elnDocument = file.elnDocument
  const editorShellRef = useRef<HTMLDivElement>(null)
  const bodyShellRef = useRef<HTMLDivElement>(null)
  const [insertMenuOpen, setInsertMenuOpen] = useState(false)
  const [insertPlacement, setInsertPlacement] =
    useState<InsertPlacement>('selection')
  const [selectedInsertIndex, setSelectedInsertIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState<PreviewImage | null>(null)
  const [hoverInsertPosition, setHoverInsertPosition] =
    useState<HoverInsertPosition | null>(null)
  const extensions = useMemo(() => createElnEditorExtensions(), [])
  const editorContent = useMemo(
    () =>
      withHeadingIds(
        (elnDocument?.document ??
          getDefaultElnDocument(file.fileName).document) as JSONContent,
      ),
    [elnDocument?.document, file.fileName],
  )
  const publishEditorOutline = useCallback(
    (currentEditor: Editor) => {
      const outline = extractDocumentOutline(currentEditor.getJSON())
      onDocumentOutlineChange?.(outline)
    },
    [onDocumentOutlineChange],
  )
  const publishDomOutline = useCallback(() => {
    const editorRoot = editorShellRef.current?.querySelector<HTMLElement>(
      '.workspace-file-preview__eln-prosemirror',
    )

    if (!editorRoot) {
      return
    }

    const outline = Array.from(
      editorRoot.querySelectorAll<HTMLElement>(
        [
          'h1[data-eln-heading-id]',
          'h2[data-eln-heading-id]',
          'h3[data-eln-heading-id]',
          'h4[data-eln-heading-id]',
          'h5[data-eln-heading-id]',
          'h6[data-eln-heading-id]',
        ].join(', '),
      ),
    )
      .filter((headingElement) => !headingElement.closest('[data-eln-block]'))
      .map((headingElement, index): ElnDocumentOutlineItem => {
        const level = Number(headingElement.tagName.slice(1))

        return {
          id: headingElement.dataset.elnHeadingId ?? `heading-${index}`,
          level: Number.isFinite(level) ? level : 1,
          title: headingElement.textContent?.trim() ?? '',
        }
      })
      .filter((item) => item.title)

    onDocumentOutlineChange?.(outline)
  }, [onDocumentOutlineChange])
  const editor = useEditor(
    {
      extensions,
      content: editorContent,
      immediatelyRender: true,
      editorProps: {
        attributes: {
          class: 'workspace-file-preview__eln-prosemirror',
          'aria-label': `${file.fileName} ELN 正文编辑器`,
        },
      },
      onUpdate({ editor: currentEditor }) {
        onDirtyStateChange?.('有未保存编辑')

        if (ensureEditorHeadingIds(currentEditor)) {
          return
        }

        publishEditorOutline(currentEditor)
      },
    },
    [file.id, publishEditorOutline],
  )

  const runEditorCommand = useCallback((command: () => void) => {
    if (!editor) {
      return
    }

    command()
  }, [editor])

  const closeInsertMenu = useCallback(() => {
    setInsertMenuOpen(false)
    setSelectedInsertIndex(0)
  }, [])

  const openInsertMenu = useCallback((placement: InsertPlacement = 'selection') => {
    setInsertPlacement(placement)
    setSelectedInsertIndex(0)
    setInsertMenuOpen(true)
  }, [])

  const clearHoverInsertPosition = useCallback(() => {
    setHoverInsertPosition(null)
  }, [])

  const updateHoverInsertPosition = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (isInsertControlTarget(event.target)) {
        return
      }

      const shell = bodyShellRef.current
      const hoveredBlock = findHoveredEditorBlock(
        event.target,
        editorShellRef.current,
      )

      if (!shell || !hoveredBlock) {
        if (!insertMenuOpen) {
          clearHoverInsertPosition()
        }
        return
      }

      const shellRect = shell.getBoundingClientRect()
      const blockRect = hoveredBlock.getBoundingClientRect()
      const lineOffset = Math.max(0, Math.min(8, blockRect.height / 2 - 13))
      const top = Math.max(0, Math.round(blockRect.top - shellRect.top + lineOffset))
      const label = getEditorBlockStructureLabel(hoveredBlock)
      const menuLeft = getContextualInsertMenuLeft(shellRect.left)

      setHoverInsertPosition((current) =>
        current?.top === top &&
        current.label === label &&
        current.menuLeft === menuLeft
          ? current
          : { top, label, menuLeft },
      )
    },
    [clearHoverInsertPosition, insertMenuOpen],
  )
  const handleEditorMouseLeave = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const relatedTarget = event.relatedTarget
      const shell = bodyShellRef.current

      if (relatedTarget instanceof Node && shell?.contains(relatedTarget)) {
        return
      }

      if (!insertMenuOpen) {
        clearHoverInsertPosition()
      }
    },
    [clearHoverInsertPosition, insertMenuOpen],
  )

  function canOpenSlashMenu(event: ReactKeyboardEvent<HTMLDivElement>) {
    const selection = window.getSelection()
    const activeRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null

    if (activeRange && event.currentTarget.contains(activeRange.startContainer)) {
      if (activeRange.startContainer.nodeType === Node.TEXT_NODE) {
        return activeRange.startOffset === 0
      }

      return activeRange.startOffset === 0
    }

    const editorSelection = editor?.state.selection

    if (!editorSelection || !editorSelection.empty) {
      return false
    }

    return (
      editorSelection.$from.parentOffset === 0 ||
      editorSelection.$from.parent.textContent.trim().length === 0
    )
  }

  const insertNode = useCallback(
    (node: JSONContent, placement = insertPlacement) => {
      runEditorCommand(() => {
        if (!editor) {
          return
        }

        const chain = editor.chain().focus()

        if (placement === 'document-end') {
          chain.insertContentAt(editor.state.doc.content.size, node).run()
          return
        }

        chain.insertContent(node).run()
      })
      closeInsertMenu()
    },
    [closeInsertMenu, editor, insertPlacement, runEditorCommand],
  )

  const insertMenuItems = useMemo<InsertMenuItem[]>(
    () => [
      {
        id: 'paragraph',
        label: '正文',
        group: '基础',
        run: () => insertNode({ type: 'paragraph' }),
      },
      {
        id: 'h1',
        label: 'H1',
        group: '基础',
        run: () => insertNode({ type: 'heading', attrs: { level: 1 } }),
      },
      {
        id: 'h2',
        label: 'H2',
        group: '基础',
        run: () => insertNode({ type: 'heading', attrs: { level: 2 } }),
      },
      {
        id: 'h3',
        label: 'H3',
        group: '基础',
        run: () => insertNode({ type: 'heading', attrs: { level: 3 } }),
      },
      {
        id: 'bullet-list',
        label: '无序列表',
        group: '基础',
        run: () =>
          insertNode({
            type: 'bulletList',
            content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
          }),
      },
      {
        id: 'ordered-list',
        label: '有序列表',
        group: '基础',
        run: () =>
          insertNode({
            type: 'orderedList',
            content: [{ type: 'listItem', content: [{ type: 'paragraph' }] }],
          }),
      },
      {
        id: 'divider',
        label: '分割线',
        group: '基础',
        run: () => insertNode({ type: 'horizontalRule' }),
      },
      {
        id: 'table',
        label: '普通表格',
        group: '实验记录',
        run: () => insertNode(buildDefaultTableNode()),
      },
      {
        id: 'image',
        label: '图片块',
        group: '实验记录',
        run: () => insertNode(buildDefaultImageNode()),
      },
      {
        id: 'callout',
        label: '提示块',
        group: '实验记录',
        run: () =>
          insertNode({
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '提示：' }],
              },
            ],
          }),
      },
      {
        id: 'chart',
        label: 'Chart Block',
        group: '数据与确认',
        run: () => insertNode(buildDefaultChartNode()),
      },
      {
        id: 'signature',
        label: 'Signature Block',
        group: '数据与确认',
        run: () => insertNode(buildDefaultSignatureNode()),
      },
    ],
    [insertNode],
  )

  function handleEditorKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!editor) {
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
      event.preventDefault()
      if (event.shiftKey) {
        editor.chain().focus().redo().run()
      } else {
        editor.chain().focus().undo().run()
      }
      return
    }

    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
      event.preventDefault()
      editor.chain().focus().redo().run()
      return
    }

    if (event.key === '/' && canOpenSlashMenu(event)) {
      event.preventDefault()
      openInsertMenu('selection')
      return
    }

    if (!insertMenuOpen) {
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setSelectedInsertIndex((current) => (current + 1) % insertMenuItems.length)
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setSelectedInsertIndex(
        (current) => (current - 1 + insertMenuItems.length) % insertMenuItems.length,
      )
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      insertMenuItems[selectedInsertIndex]?.run()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      closeInsertMenu()
    }
  }

  useEffect(() => {
    function handleOpenImage(event: Event) {
      const detail = (event as CustomEvent<PreviewImage>).detail

      if (!detail?.src) {
        return
      }

      setPreviewImage(detail)
    }

    window.addEventListener('bmeln:open-image', handleOpenImage)

    return () => window.removeEventListener('bmeln:open-image', handleOpenImage)
  }, [])

  useEffect(() => {
    if (!insertMenuOpen) {
      return
    }

    function handleInsertMenuOutsidePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      const shell = editorShellRef.current
      const insertMenu = shell?.querySelector(
        '.workspace-file-preview__eln-insert-menu',
      )
      const insertButton = shell?.querySelector(
        '.workspace-file-preview__eln-plus-button',
      )

      if (insertMenu?.contains(target) || insertButton?.contains(target)) {
        return
      }

      closeInsertMenu()
      clearHoverInsertPosition()
    }

    document.addEventListener('pointerdown', handleInsertMenuOutsidePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handleInsertMenuOutsidePointerDown)
    }
  }, [clearHoverInsertPosition, closeInsertMenu, insertMenuOpen])

  useEffect(() => {
    if (!editor || elnDocument?.document) {
      return
    }

    editor.commands.setTextSelection(editor.state.doc.content.size)
  }, [editor, elnDocument?.document])

  useEffect(() => {
    if (!editor) {
      return
    }

    publishEditorOutline(editor)
  }, [editor, publishEditorOutline])

  useEffect(() => {
    if (!headingScrollRequest) {
      return
    }

    const target = editorShellRef.current?.querySelector<HTMLElement>(
      `[data-eln-heading-id="${escapeCssIdentifier(headingScrollRequest.id)}"]`,
    )

    if (typeof target?.scrollIntoView === 'function') {
      target.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
  }, [headingScrollRequest])

  const groupedInsertMenuItems = insertMenuItems.reduce<Record<string, InsertMenuItem[]>>(
    (groups, item) => {
      groups[item.group] = [...(groups[item.group] ?? []), item]
      return groups
    },
    {},
  )
  const showContextInsert = Boolean(hoverInsertPosition)
  const contextInsertTop = hoverInsertPosition?.top ?? 0
  const contextInsertLabel = hoverInsertPosition?.label ?? '+'
  const insertMenuTop = hoverInsertPosition ? contextInsertTop + 34 : undefined
  const insertMenuLeft = hoverInsertPosition?.menuLeft
  const insertMenuStyle =
    insertMenuTop === undefined && insertMenuLeft === undefined
      ? undefined
      : {
          ...(insertMenuTop === undefined ? {} : { top: insertMenuTop }),
          ...(insertMenuLeft === undefined ? {} : { left: insertMenuLeft }),
        }

  return (
    <div className="workspace-file-preview__eln-editor" ref={editorShellRef}>
      <div
        className="workspace-file-preview__eln-body-shell"
        ref={bodyShellRef}
        onMouseMove={updateHoverInsertPosition}
        onMouseLeave={() => {
          if (!insertMenuOpen) {
            clearHoverInsertPosition()
          }
        }}
      >
        {showContextInsert ? (
          <div
            className="workspace-file-preview__eln-context-insert"
            data-context-block="current"
            style={{ top: contextInsertTop }}
          >
            <button
              type="button"
              className="workspace-file-preview__eln-plus-button"
              aria-label="插入内容"
              title="插入内容"
              onClick={() => {
                if (insertMenuOpen) {
                  closeInsertMenu()
                  return
                }

                openInsertMenu('document-end')
              }}
            >
              {contextInsertLabel}
            </button>
          </div>
        ) : null}
        <EditorContent
          editor={editor}
          className="workspace-file-preview__eln-content"
          onKeyDown={handleEditorKeyDown}
          onInput={publishDomOutline}
          onMouseLeave={handleEditorMouseLeave}
        />
        {insertMenuOpen ? (
          <div
            className="workspace-file-preview__eln-insert-menu"
            role="menu"
            aria-label="插入内容"
            style={insertMenuStyle}
          >
            {Object.entries(groupedInsertMenuItems).map(([group, items]) => (
              <div
                key={group}
                className="workspace-file-preview__eln-insert-menu-group"
              >
                <p>{group}</p>
                {items.map((item) => {
                  const itemIndex = insertMenuItems.findIndex(
                    (candidate) => candidate.id === item.id,
                  )

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      aria-label={item.label}
                      className={
                        itemIndex === selectedInsertIndex ? 'is-selected' : ''
                      }
                      onClick={item.run}
                    >
                      {item.label}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {previewImage ? (
        <div
          className="workspace-file-preview__eln-image-viewer"
          role="dialog"
          aria-label="图片预览"
          aria-modal="true"
        >
          <button
            type="button"
            aria-label="关闭图片预览"
            onClick={() => setPreviewImage(null)}
          >
            关闭
          </button>
          <figure>
            <img
              src={previewImage.src}
              alt={previewImage.alt || previewImage.caption || 'ELN image'}
            />
            {previewImage.caption ? <figcaption>{previewImage.caption}</figcaption> : null}
            {[previewImage.sourceRef, previewImage.assetRef].filter(Boolean).map((value) => (
              <p key={value}>{value}</p>
            ))}
          </figure>
        </div>
      ) : null}
    </div>
  )
}

function findHoveredEditorBlock(
  target: EventTarget | null,
  editorShell: HTMLElement | null,
) {
  if (!(target instanceof HTMLElement)) {
    return null
  }

  const editorRoot = editorShell?.querySelector<HTMLElement>(
    '.workspace-file-preview__eln-prosemirror',
  )

  if (!editorRoot?.contains(target) || target === editorRoot) {
    return null
  }

  const specialBlock = target.closest<HTMLElement>('[data-eln-block]')

  if (specialBlock && editorRoot.contains(specialBlock)) {
    return specialBlock
  }

  let block: HTMLElement | null = target

  while (block?.parentElement && block.parentElement !== editorRoot) {
    block = block.parentElement
  }

  if (!block || block === editorRoot) {
    return null
  }

  return block
}

function isInsertControlTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    Boolean(
      target.closest(
        [
          '.workspace-file-preview__eln-context-insert',
          '.workspace-file-preview__eln-insert-menu',
        ].join(', '),
      ),
    )
  )
}

function getContextualInsertMenuLeft(shellViewportLeft: number) {
  return Math.max(
    INSERT_MENU_DEFAULT_LEFT,
    INSERT_MENU_VIEWPORT_MARGIN - shellViewportLeft,
  )
}

function getEditorBlockStructureLabel(block: HTMLElement) {
  const elnBlock = block.dataset.elnBlock

  if (elnBlock) {
    const blockLabels: Record<string, string> = {
      image: '图',
      chart: '图',
      signature: '签',
      attachment: '附',
    }

    return blockLabels[elnBlock] ?? '块'
  }

  const tagName = block.tagName.toLowerCase()

  if (tagName === 'div' && block.querySelector('table')) {
    return '表'
  }

  if (/^h[1-6]$/.test(tagName)) {
    return tagName.toUpperCase()
  }

  const labels: Record<string, string> = {
    blockquote: '引',
    hr: '线',
    ol: '列',
    p: 'T',
    table: '表',
    ul: '列',
  }

  return labels[tagName] ?? '块'
}

function withHeadingIds(document: JSONContent): JSONContent {
  if (!Array.isArray(document.content)) {
    return document
  }

  return {
    ...document,
    content: document.content.map((node, index) => {
      if (node.type !== 'heading') {
        return node
      }

      const existingId = node.attrs?.elnHeadingId

      return {
        ...node,
        attrs: {
          ...node.attrs,
          elnHeadingId:
            typeof existingId === 'string' && existingId
              ? existingId
              : `heading-${index}`,
        },
      }
    }),
  }
}

function ensureEditorHeadingIds(editor: Editor) {
  const transaction = editor.state.tr
  const seenIds = new Set<string>()
  let changed = false

  editor.state.doc.descendants((node, position) => {
    if (node.type.name !== 'heading') {
      return
    }

    const existingId = node.attrs.elnHeadingId

    if (
      typeof existingId === 'string' &&
      existingId &&
      !seenIds.has(existingId)
    ) {
      seenIds.add(existingId)
      return
    }

    transaction.setNodeMarkup(position, undefined, {
      ...node.attrs,
      elnHeadingId: createRuntimeHeadingId(position, seenIds),
    })
    changed = true
  })

  if (changed) {
    editor.view.dispatch(transaction.setMeta('addToHistory', false))
  }

  return changed
}

function createRuntimeHeadingId(position: number, seenIds: Set<string>) {
  const baseId = `heading-${position}`
  let candidateId = baseId
  let suffix = 2

  while (seenIds.has(candidateId)) {
    candidateId = `${baseId}-${suffix}`
    suffix += 1
  }

  seenIds.add(candidateId)
  return candidateId
}

function escapeCssIdentifier(value: string) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value)
  }

  return value.replace(/["\\]/g, '\\$&')
}

export default ElnEditorPreview
