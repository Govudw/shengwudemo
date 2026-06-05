import { memo, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { ConversationBlock, ConversationTurn } from '../data/conversationTypes'
import ConversationBlocks from './ConversationBlocks'

type ConversationTranscriptProps = {
  turns: ConversationTurn[]
  onProjectFileOpen?: (
    block: Extract<ConversationBlock, { type: 'projectFile' }>,
  ) => void
}

type MarkdownSegment =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; code: string }
  | {
      type: 'table'
      headers: string[]
      alignments: Array<'left' | 'right' | 'center'>
      rows: string[][]
    }

function ConversationTranscript({
  turns,
  onProjectFileOpen,
}: ConversationTranscriptProps) {
  return (
    <div className="conversation-transcript" aria-label="对话记录">
      <div className="conversation-transcript__inner">
        {turns.map((turn) => (
          <article
            key={turn.id}
            className={`conversation-turn conversation-turn--${turn.role}`}
          >
            {turn.markdown ? (
              <MarkdownContent
                markdown={turn.markdown}
                className="conversation-turn__markdown"
              />
            ) : null}

            {turn.contentBlocks?.length ? (
              <ConversationBlocks
                blocks={turn.contentBlocks}
                onProjectFileOpen={onProjectFileOpen}
              />
            ) : null}
          </article>
        ))}
      </div>
    </div>
  )
}

function MarkdownContent({
  markdown,
  className,
}: {
  markdown: string
  className: string
}) {
  const segments = useMemo(() => parseMarkdown(markdown), [markdown])

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === 'code') {
          return (
            <pre key={index}>
              <code>{segment.code}</code>
            </pre>
          )
        }

        if (segment.type === 'list') {
          const ListTag = segment.ordered ? 'ol' : 'ul'

          return (
            <ListTag key={index}>
              {segment.items.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ListTag>
          )
        }

        if (segment.type === 'table') {
          return (
            <div key={index} className="conversation-markdown-table__scroll">
              <table className="conversation-markdown-table">
                <thead>
                  <tr>
                    {segment.headers.map((header, cellIndex) => (
                      <th
                        key={`${header}-${cellIndex}`}
                        style={{ textAlign: segment.alignments[cellIndex] }}
                      >
                        {renderInlineMarkdown(header)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {segment.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {segment.headers.map((_, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{ textAlign: segment.alignments[cellIndex] }}
                        >
                          {renderInlineMarkdown(row[cellIndex] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        return <p key={index}>{renderInlineMarkdown(segment.text)}</p>
      })}
    </div>
  )
}

function parseMarkdown(markdown: string): MarkdownSegment[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const segments: MarkdownSegment[] = []
  let paragraph: string[] = []
  let list: { ordered: boolean; items: string[] } | null = null
  let codeLines: string[] = []
  let inCodeBlock = false

  const flushParagraph = () => {
    if (paragraph.length) {
      segments.push({ type: 'paragraph', text: paragraph.join(' ') })
      paragraph = []
    }
  }

  const flushList = () => {
    if (list?.items.length) {
      segments.push({ type: 'list', ordered: list.ordered, items: list.items })
      list = null
    }
  }

  const pushListItem = (item: string, ordered: boolean) => {
    if (list && list.ordered !== ordered) {
      flushList()
    }

    if (!list) {
      list = { ordered, items: [] }
    }

    list.items.push(item)
  }

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex]

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        segments.push({ type: 'code', code: codeLines.join('\n') })
        codeLines = []
        inCodeBlock = false
      } else {
        flushParagraph()
        flushList()
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (isTableHeaderLine(line, lines[lineIndex + 1])) {
      flushParagraph()
      flushList()

      const headers = splitTableRow(line)
      const alignments = parseTableAlignments(lines[lineIndex + 1])
      const rows: string[][] = []
      lineIndex += 2

      while (lineIndex < lines.length && isTableContentLine(lines[lineIndex])) {
        const row = splitTableRow(lines[lineIndex])
        rows.push(headers.map((_, cellIndex) => row[cellIndex] ?? ''))
        lineIndex += 1
      }

      segments.push({ type: 'table', headers, alignments, rows })
      lineIndex -= 1
      continue
    }

    const unorderedListMatch = line.match(/^\s*[-*]\s+(.+)$/)
    if (unorderedListMatch) {
      flushParagraph()
      pushListItem(unorderedListMatch[1], false)
      continue
    }

    const orderedListMatch = line.match(/^\s*\d+\.\s+(.+)$/)
    if (orderedListMatch) {
      flushParagraph()
      pushListItem(orderedListMatch[1], true)
      continue
    }

    if (!line.trim()) {
      flushParagraph()
      flushList()
      continue
    }

    flushList()
    paragraph.push(line.trim())
  }

  if (inCodeBlock && codeLines.length) {
    segments.push({ type: 'code', code: codeLines.join('\n') })
  }
  flushParagraph()
  flushList()

  return segments
}

function isTableHeaderLine(line: string, nextLine?: string): nextLine is string {
  return (
    line.includes('|') &&
    typeof nextLine === 'string' &&
    isTableSeparatorLine(nextLine) &&
    splitTableRow(line).length === splitTableRow(nextLine).length
  )
}

function isTableSeparatorLine(line: string): boolean {
  const cells = splitTableRow(line)

  return (
    cells.length > 1 &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s/g, '')))
  )
}

function isTableContentLine(line: string): boolean {
  return line.trim().length > 0 && line.includes('|')
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function parseTableAlignments(
  separatorLine: string,
): Array<'left' | 'right' | 'center'> {
  return splitTableRow(separatorLine).map((cell) => {
    const marker = cell.replace(/\s/g, '')
    const startsWithColon = marker.startsWith(':')
    const endsWithColon = marker.endsWith(':')

    if (startsWithColon && endsWithColon) {
      return 'center'
    }

    if (endsWithColon) {
      return 'right'
    }

    return 'left'
  })
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)

  return parts.filter(Boolean).map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={index}>{part.slice(1, -1)}</code>
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }

    return part
  })
}

export default memo(ConversationTranscript)
