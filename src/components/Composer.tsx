import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import type { KeyboardEvent } from 'react'
import type { DemoProject } from '../store/demoStoreLogic'
import { ChevronDownIcon, FolderIcon, PlusIcon, SendIcon } from './icons'

type ComposerProps = {
  projects: DemoProject[]
  selectedProjectId: string
  isDraftingNewThread: boolean
  draft: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  projectMenuOpen: boolean
  onDraftChange: (draft: string) => void
  onProjectMenuOpenChange: (open: boolean) => void
  onProjectChange: (projectId: string) => void
  onSubmit: () => void
  onNotify: (message: string) => void
}

function Composer({
  projects,
  selectedProjectId,
  isDraftingNewThread,
  draft,
  textareaRef,
  projectMenuOpen,
  onDraftChange,
  onProjectMenuOpenChange,
  onProjectChange,
  onSubmit,
  onNotify,
}: ComposerProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const canSubmit = draft.trim().length > 0

  useEffect(() => {
    if (!projectMenuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        onProjectMenuOpenChange(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        onProjectMenuOpenChange(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onProjectMenuOpenChange, projectMenuOpen])

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (canSubmit) {
        onSubmit()
      }
    }
  }

  return (
    <section className="composer" aria-label="Agent composer">
      <h1 className="composer__heading">我能为你的研发做什么？</h1>

      <div className="composer__panel composer-panel">
        <div className="composer__input-area">
          <textarea
            className="composer__textarea"
            ref={textareaRef}
            value={draft}
            aria-label="研发目标或对话内容"
            placeholder={
              isDraftingNewThread
                ? '描述一个研发目标，或继续一个对话'
                : '继续推进这个对话...'
            }
            rows={4}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
          />

          <div className="composer__input-actions">
            <button
              type="button"
              className="composer__context-button"
              aria-label="Add context"
              onClick={() => onNotify('Add context 将在后续 Demo 中展开')}
            >
              <PlusIcon className="composer__icon" />
            </button>

            <button
              type="button"
              className="composer__send-button"
              aria-label="Send"
              disabled={!canSubmit}
              onClick={onSubmit}
            >
              <SendIcon className="composer__icon" />
            </button>
          </div>
        </div>

        <div className="composer__project-selector" ref={menuRef}>
          <button
            type="button"
            className="composer__project-button"
            aria-label={`选择项目，当前项目 ${selectedProject?.name ?? '未选择'}`}
            aria-haspopup="listbox"
            aria-expanded={projectMenuOpen}
            onClick={() => onProjectMenuOpenChange(!projectMenuOpen)}
          >
            <FolderIcon className="composer__project-icon" />
            <span>{selectedProject?.name ?? '选择项目'}</span>
            <ChevronDownIcon className="composer__chevron" />
          </button>

          {projectMenuOpen ? (
            <div className="composer__project-menu" role="listbox">
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  className={`composer__project-option${
                    project.id === selectedProjectId
                      ? ' composer__project-option--selected selected'
                      : ''
                  }`}
                  role="option"
                  aria-selected={project.id === selectedProjectId}
                  onClick={() => {
                    onProjectChange(project.id)
                    onProjectMenuOpenChange(false)
                  }}
                >
                  {project.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

export default Composer
