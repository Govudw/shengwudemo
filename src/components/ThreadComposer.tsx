import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import AttachmentMenu from './AttachmentMenu'
import type { AttachmentAction } from './AttachmentMenu'
import { PlusIcon, SendIcon } from './icons'
import { useAutoGrowTextarea } from './useAutoGrowTextarea'

type ThreadComposerProps = {
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: () => void
  onNotify: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

function ThreadComposer({
  draft,
  onDraftChange,
  onSubmit,
  onNotify,
  disabled = false,
  placeholder = '继续推进这个对话...',
}: ThreadComposerProps) {
  const attachmentMenuRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const canSubmit = !disabled && draft.trim().length > 0
  const attachmentMenuVisible = attachmentMenuOpen && !disabled

  useAutoGrowTextarea(textareaRef, draft)

  useEffect(() => {
    if (!disabled || !attachmentMenuOpen) {
      return undefined
    }

    const closeTimer = window.setTimeout(() => {
      setAttachmentMenuOpen(false)
    }, 0)

    return () => window.clearTimeout(closeTimer)
  }, [attachmentMenuOpen, disabled])

  useEffect(() => {
    if (!attachmentMenuVisible) {
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
  }, [attachmentMenuVisible])

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (disabled) {
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (canSubmit) {
        onSubmit()
      }
    }
  }

  function selectAttachmentAction(action: AttachmentAction) {
    if (disabled) {
      setAttachmentMenuOpen(false)
      return
    }

    setAttachmentMenuOpen(false)
    onNotify(
      action === 'asset'
        ? '从资产添加尚未接入当前工作区'
        : '上传文件或图片尚未接入当前工作区',
    )
  }

  return (
    <section className="thread-composer" aria-label="对话输入框">
      <div className="thread-composer__panel">
        <textarea
          className="thread-composer__textarea"
          ref={textareaRef}
          value={draft}
          aria-label="继续推进这个对话"
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          onChange={(event) => {
            if (disabled) {
              return
            }

            onDraftChange(event.target.value)
          }}
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
              aria-expanded={attachmentMenuVisible}
              aria-controls="thread-composer-attachment-menu"
              disabled={disabled}
              onClick={() => {
                if (disabled) {
                  return
                }

                setAttachmentMenuOpen((open) => !open)
              }}
            >
              <PlusIcon className="thread-composer__icon" />
            </button>

            {attachmentMenuVisible ? (
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
            onClick={() => {
              if (canSubmit) {
                onSubmit()
              }
            }}
          >
            <SendIcon className="thread-composer__icon" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default ThreadComposer
