import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { PlusIcon, SendIcon } from './icons'

type ThreadComposerProps = {
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: () => void
}

function ThreadComposer({
  draft,
  onDraftChange,
  onSubmit,
}: ThreadComposerProps) {
  const [attachmentStatusVisible, setAttachmentStatusVisible] = useState(false)
  const canSubmit = draft.trim().length > 0

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (canSubmit) {
        onSubmit()
      }
    }
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
          <button
            type="button"
            className="thread-composer__context-button"
            aria-label="Add context"
            onClick={() => setAttachmentStatusVisible(true)}
          >
            <PlusIcon className="thread-composer__icon" />
          </button>
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
      {attachmentStatusVisible ? (
        <p className="thread-composer__status">
          附件上传会进入当前项目文件区。第一版 Demo 仅展示 Mock 附件。
        </p>
      ) : null}
    </section>
  )
}

export default ThreadComposer
