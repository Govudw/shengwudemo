import type { JSONContent } from '@tiptap/core'
import type { SideWindowElnDocument } from '../../data/workspaceSideWindowMockData'

export type ElnDocumentOutlineItem = {
  id: string
  level: number
  title: string
}

export type ElnInsertableBlockTemplate = {
  id: string
  label: string
  node: JSONContent
}

export function countElnDocumentCharacters(document: JSONContent | undefined) {
  if (!document) {
    return 0
  }

  return collectText(document).trim().length
}

export function extractDocumentOutline(document: JSONContent | undefined) {
  const outline: ElnDocumentOutlineItem[] = []

  if (!document?.content) {
    return outline
  }

  document.content.forEach((node, index) => {
    if (node.type !== 'heading') {
      return
    }

    const level = typeof node.attrs?.level === 'number' ? node.attrs.level : 1
    const title = collectText(node).trim()

    if (!title) {
      return
    }

    const id =
      typeof node.attrs?.elnHeadingId === 'string'
        ? node.attrs.elnHeadingId
        : `heading-${index}`

    outline.push({
      id,
      level,
      title,
    })
  })

  return outline
}

export function getDefaultElnDocument(fileName = '未命名 ELN'): SideWindowElnDocument {
  return {
    formatVersion: 'bmeln.v1',
    revision: 1,
    schemaVersion: 'biomap.eln.v1',
    revisionLabel: 'Draft',
    notebook: {
      notebookId: 'ELN-DRAFT',
      runId: 'RUN-DRAFT',
      projectName: 'BioMap Agent',
      status: 'draft',
      owner: 'BioMap Agent',
      generatedAt: '',
    },
    sections: [],
    document: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: fileName }],
        },
        {
          type: 'paragraph',
          content: [],
        },
      ],
    },
  }
}

export function getInsertableBlockTemplates(): ElnInsertableBlockTemplate[] {
  return [
    { id: 'table', label: '普通表格', node: buildDefaultTableNode() },
    { id: 'image', label: '图片块', node: buildDefaultImageNode() },
    { id: 'chart', label: 'Chart Block', node: buildDefaultChartNode() },
    { id: 'signature', label: 'Signature Block', node: buildDefaultSignatureNode() },
    { id: 'attachment', label: '附件引用块', node: buildDefaultAttachmentNode() },
  ]
}

export function buildDefaultTableNode(): JSONContent {
  const rows = [
    ['字段', '值', '来源'],
    ['', '', ''],
    ['', '', ''],
  ]

  return {
    type: 'table',
    content: rows.map((row) => ({
      type: 'tableRow',
      content: row.map((text) => ({
        type: 'tableCell',
        content: [
          {
            type: 'paragraph',
            content: text ? [{ type: 'text', text }] : [],
          },
        ],
      })),
    })),
  }
}

export function buildDefaultChartNode(): JSONContent {
  return {
    type: 'elnChartBlock',
    attrs: {
      title: '预设数据图表',
      chartType: 'bar',
      sourceRef: 'mock-data-source',
      updatedAt: '未更新',
      option: {
        xAxis: { type: 'category', data: ['A', 'B', 'C'] },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: [1, 2, 3] }],
      },
    },
  }
}

export function buildDefaultSignatureNode(): JSONContent {
  return {
    type: 'elnSignatureBlock',
    attrs: {
      role: '复核人',
      signer: '未指定',
      status: 'pending_review',
      signedAt: '',
      sourceRef: 'approval-artifact',
      meaning: '预留复核签名位。',
    },
  }
}

export function buildDefaultImageNode(): JSONContent {
  return {
    type: 'elnImageBlock',
    attrs: {
      src: '',
      alt: 'ELN 图片',
      caption: '图：待补充说明。',
      assetRef: '',
      sourceRef: 'object-storage',
    },
  }
}

export function buildDefaultAttachmentNode(): JSONContent {
  return {
    type: 'elnAttachmentBlock',
    attrs: {
      fileName: 'attachment.json',
      fileType: 'json',
      objectPath: 'Runs/example/attachment.json',
      status: 'linked',
      summary: '待补充附件摘要。',
      sourceRef: 'object-storage',
    },
  }
}

function collectText(node: JSONContent): string {
  const currentText = typeof node.text === 'string' ? node.text : ''
  const childText = Array.isArray(node.content)
    ? node.content.map((child) => collectText(child)).join(' ')
    : ''
  const attrsText = collectAttrText(node.attrs)

  return [currentText, childText, attrsText].filter(Boolean).join(' ')
}

function collectAttrText(attrs: JSONContent['attrs']) {
  if (!attrs) {
    return ''
  }

  return ['caption', 'title', 'sourceRef', 'fileName', 'objectPath', 'summary', 'signer']
    .map((key) => attrs[key])
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
}
