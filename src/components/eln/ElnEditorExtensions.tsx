import { Extension, Node, mergeAttributes, type Extensions } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import { Plugin } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  ElnAttachmentBlockView,
  ElnChartBlockView,
  ElnImageBlockView,
  ElnSignatureBlockView,
} from './ElnEditorBlocks'

const commonBlockAttrs = {
  sourceRef: {
    default: '',
  },
}

const ElnHeadingIds = Extension.create({
  name: 'elnHeadingIds',

  addGlobalAttributes() {
    return [
      {
        types: ['heading'],
        attributes: {
          elnHeadingId: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-eln-heading-id'),
            renderHTML: (attributes) => {
              const headingId = attributes.elnHeadingId

              if (typeof headingId !== 'string' || !headingId) {
                return {}
              }

              return { 'data-eln-heading-id': headingId }
            },
          },
        },
      },
    ]
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        appendTransaction(transactions, _oldState, newState) {
          if (!transactions.some((transaction) => transaction.docChanged)) {
            return null
          }

          const transaction = newState.tr
          const seenIds = new Set<string>()

          newState.doc.descendants((node, position) => {
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
              elnHeadingId: createHeadingId(position, seenIds),
            })
          })

          return transaction.docChanged ? transaction : null
        },
      }),
    ]
  },
})

function createHeadingId(position: number, seenIds: Set<string>) {
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

export const ElnImageBlock = Node.create({
  name: 'elnImageBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ...commonBlockAttrs,
      src: { default: '' },
      alt: { default: '' },
      caption: { default: '' },
      assetRef: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-eln-block="image"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['figure', mergeAttributes(HTMLAttributes, { 'data-eln-block': 'image' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ElnImageBlockView)
  },
})

export const ElnChartBlock = Node.create({
  name: 'elnChartBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ...commonBlockAttrs,
      title: { default: '' },
      chartType: { default: 'bar' },
      chartKind: { default: '' },
      updatedAt: { default: '' },
      option: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'section[data-eln-block="chart"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['section', mergeAttributes(HTMLAttributes, { 'data-eln-block': 'chart' })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ElnChartBlockView)
  },
})

export const ElnSignatureBlock = Node.create({
  name: 'elnSignatureBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ...commonBlockAttrs,
      kind: { default: '' },
      role: { default: '' },
      signer: { default: '' },
      status: { default: '' },
      signedAt: { default: '' },
      note: { default: '' },
      meaning: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'section[data-eln-block="signature"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, { 'data-eln-block': 'signature' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ElnSignatureBlockView)
  },
})

export const ElnAttachmentBlock = Node.create({
  name: 'elnAttachmentBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      ...commonBlockAttrs,
      fileName: { default: '' },
      fileKind: { default: '' },
      fileType: { default: '' },
      objectPath: { default: '' },
      status: { default: '' },
      summary: { default: '' },
    }
  },

  parseHTML() {
    return [{ tag: 'section[data-eln-block="attachment"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'section',
      mergeAttributes(HTMLAttributes, { 'data-eln-block': 'attachment' }),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(ElnAttachmentBlockView)
  },
})

export function createElnEditorExtensions(): Extensions {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6],
      },
    }),
    ElnHeadingIds,
    Table.configure({
      resizable: false,
    }),
    TableRow,
    TableHeader,
    TableCell,
    ElnImageBlock,
    ElnChartBlock,
    ElnSignatureBlock,
    ElnAttachmentBlock,
    Placeholder.configure({
      placeholder: '输入 / 插入内容',
    }),
  ]
}
