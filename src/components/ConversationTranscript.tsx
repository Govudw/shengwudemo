import { memo, useEffect, useMemo, useRef } from 'react'
import type { ReactNode } from 'react'
import type { ConversationBlock, ConversationTurn } from '../data/conversationTypes'
import ConversationBlocks from './ConversationBlocks'
import { parseMarkdownSegments } from './threadReplay'
import type { MarkdownSegment } from './threadReplay'

type ConversationTranscriptProps = {
  turns: ConversationTurn[]
  onProjectFileOpen?: (
    block: Extract<ConversationBlock, { type: 'projectFile' }>,
  ) => void
  replayActive?: boolean
  activeReplayStepId?: string | null
}

function ConversationTranscript({
  turns,
  onProjectFileOpen,
  replayActive = false,
  activeReplayStepId,
}: ConversationTranscriptProps) {
  const transcriptRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!replayActive || !activeReplayStepId) {
      return
    }

    const activeStep = Array.from(
      transcriptRef.current?.querySelectorAll<HTMLElement>(
        '[data-replay-step-id]',
      ) ?? [],
    ).find(
      (element) => element.getAttribute('data-replay-step-id') === activeReplayStepId,
    )

    activeStep?.scrollIntoView({
      block: 'end',
      behavior: 'smooth',
      inline: 'nearest',
    })
  }, [activeReplayStepId, replayActive])

  return (
    <div ref={transcriptRef} className="conversation-transcript" aria-label="对话记录">
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
                turnId={turn.id}
                replayActive={replayActive}
                activeReplayStepId={activeReplayStepId}
              />
            ) : null}

            {turn.contentBlocks?.length ? (
              <ConversationBlocks
                blocks={turn.contentBlocks}
                onProjectFileOpen={onProjectFileOpen}
                replayStepMetadata={
                  replayActive
                    ? {
                        turnId: turn.id,
                        activeReplayStepId,
                      }
                    : undefined
                }
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
  turnId,
  replayActive,
  activeReplayStepId,
}: {
  markdown: string
  className: string
  turnId: string
  replayActive?: boolean
  activeReplayStepId?: string | null
}) {
  const segments = useMemo<MarkdownSegment[]>(
    () => parseMarkdownSegments(markdown),
    [markdown],
  )

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        const stepProps = getMarkdownReplayStepProps(
          turnId,
          index,
          replayActive,
          activeReplayStepId,
        )

        if (segment.type === 'code') {
          return (
            <pre key={index} {...stepProps}>
              <code>{segment.code}</code>
            </pre>
          )
        }

        if (segment.type === 'list') {
          const ListTag = segment.ordered ? 'ol' : 'ul'

          return (
            <ListTag key={index} {...stepProps}>
              {segment.items.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ListTag>
          )
        }

        if (segment.type === 'table') {
          return (
            <div
              key={index}
              {...getMarkdownReplayStepProps(
                turnId,
                index,
                replayActive,
                activeReplayStepId,
                'conversation-markdown-table__scroll',
              )}
            >
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

        return (
          <p key={index} {...stepProps}>
            {renderInlineMarkdown(segment.text)}
          </p>
        )
      })}
    </div>
  )
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

function getMarkdownReplayStepProps(
  turnId: string,
  segmentIndex: number,
  replayActive: boolean | undefined,
  activeReplayStepId: string | null | undefined,
  className?: string,
) {
  if (!replayActive) {
    return className ? { className } : {}
  }

  const stepId = `${turnId}:markdown:${segmentIndex}`
  const isActive = stepId === activeReplayStepId

  return {
    className: [
      className,
      'conversation-turn__markdown-segment',
      'conversation-replay-step',
      isActive ? 'conversation-turn__markdown-segment--active' : null,
      isActive ? 'conversation-replay-step--active' : null,
    ]
      .filter(Boolean)
      .join(' '),
    'data-replay-step-id': stepId,
  }
}

export default memo(ConversationTranscript)
