import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import AttachmentMenu from './AttachmentMenu'
import type { AttachmentAction } from './AttachmentMenu'
import { PlusIcon, SendIcon } from './icons'

type ThreadComposerProps = {
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: () => void
  onNotify: (message: string) => void
}

function ThreadComposer({
  draft,
  onDraftChange,
  onSubmit,
  onNotify,
}: ThreadComposerProps) {
  const attachmentMenuRef = useRef<HTMLDivElement>(null)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const canSubmit = draft.trim().length > 0

  useEffect(() => {
    if (!attachmentMenuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !attachmentMenuRef.current?.contains(event.target)
      ) {
        setAttachmentMenuOpen(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setAttachmentMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [attachmentMenuOpen])

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (canSubmit) {
        onSubmit()
      }
    }
  }

  function selectAttachmentAction(action: AttachmentAction) {
    setAttachmentMenuOpen(false)
    onNotify(
      action === 'asset'
        ? '从资产添加将在后续 Demo 中展开'
        : '上传文件或图片将在后续 Demo 中展开',
    )
  }

  return (
    <section className="thread-composer" aria-label="对话输入框">
      <div className="thread-composer__panel">
        <textarea
          className="thread-composer__textarea"
          value={draft}
          aria-label="继续推进这个对话"
          placeholder="继续推进这个对话..."
          rows={2}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleTextareaKeyDown}
        />
        <div className="thread-composer__actions">
          <div
            className="thread-composer__attachment-control"
            ref={attachmentMenuRef}
          >
            <button
              type="button"
              className="thread-composer__context-button"
              aria-label="Add context"
              aria-haspopup="menu"
              aria-expanded={attachmentMenuOpen}
              aria-controls="thread-composer-attachment-menu"
              onClick={() => setAttachmentMenuOpen((open) => !open)}
            >
              <PlusIcon className="thread-composer__icon" />
            </button>

            {attachmentMenuOpen ? (
              <AttachmentMenu
                id="thread-composer-attachment-menu"
                onSelect={selectAttachmentAction}
              />
            ) : null}
          </div>
          <button
            type="button"
            className="thread-composer__send-button"
            aria-label="Send"
            disabled={!canSubmit}
            onClick={onSubmit}
          >
            <SendIcon className="thread-composer__icon" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default ThreadComposer
