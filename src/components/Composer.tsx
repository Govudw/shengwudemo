import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { KeyboardEvent } from 'react'
import type { DemoProject } from '../store/demoStoreLogic'
import AttachmentMenu from './AttachmentMenu'
import type { AttachmentAction } from './AttachmentMenu'
import {
  ChevronDownIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  XIcon,
} from './icons'

type ComposerProps = {
  projects: DemoProject[]
  selectedProjectId: string
  isDraftingNewThread: boolean
  draft: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  projectMenuOpen: boolean
  activeCapabilityLabel: string | null
  onDraftChange: (draft: string) => void
  onProjectMenuOpenChange: (open: boolean) => void
  onProjectChange: (projectId: string) => void
  onCreateProject: (name: string) => void
  onRemoveCapability: () => void
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
  activeCapabilityLabel,
  onDraftChange,
  onProjectMenuOpenChange,
  onProjectChange,
  onCreateProject,
  onRemoveCapability,
  onSubmit,
  onNotify,
}: ComposerProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const attachmentMenuRef = useRef<HTMLDivElement>(null)
  const newProjectDialogRef = useRef<HTMLFormElement>(null)
  const newProjectInputRef = useRef<HTMLInputElement>(null)
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false)
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('New project')
  const [projectSearchQuery, setProjectSearchQuery] = useState('')
  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const normalizedProjectSearchQuery = projectSearchQuery.trim().toLowerCase()
  const visibleProjects = normalizedProjectSearchQuery
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(normalizedProjectSearchQuery),
      )
    : projects
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
        setProjectSearchQuery('')
        onProjectMenuOpenChange(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') {
        setProjectSearchQuery('')
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

  useEffect(() => {
    if (!newProjectDialogOpen) {
      return
    }

    window.setTimeout(() => {
      newProjectInputRef.current?.focus()
      newProjectInputRef.current?.select()
    }, 0)
  }, [newProjectDialogOpen])

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()

      if (canSubmit) {
        onSubmit()
      }
    }
  }

  function openNewProjectDialog() {
    setNewProjectName('New project')
    closeProjectMenu()
    setNewProjectDialogOpen(true)
  }

  function openProjectMenu() {
    setProjectSearchQuery('')
    setAttachmentMenuOpen(false)
    onProjectMenuOpenChange(true)
  }

  function closeProjectMenu() {
    setProjectSearchQuery('')
    onProjectMenuOpenChange(false)
  }

  function submitNewProject() {
    const nextName = newProjectName.trim().replace(/\s+/g, ' ')

    if (!nextName) {
      onNotify('项目名称不能为空')
      return
    }

    onCreateProject(nextName)
    setNewProjectDialogOpen(false)
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
            <div className="composer__left-actions">
              <div className="composer__attachment-control" ref={attachmentMenuRef}>
                <button
                  type="button"
                  className="composer__context-button"
                  aria-label="Add context"
                  aria-haspopup="menu"
                  aria-expanded={attachmentMenuOpen}
                  aria-controls="composer-attachment-menu"
                  onClick={() => {
                    closeProjectMenu()
                    setAttachmentMenuOpen((open) => !open)
                  }}
                >
                  <PlusIcon className="composer__icon" />
                </button>

                {attachmentMenuOpen ? (
                  <AttachmentMenu
                    id="composer-attachment-menu"
                    onSelect={selectAttachmentAction}
                  />
                ) : null}
              </div>

              {activeCapabilityLabel ? (
                <span className="composer__capability-tag">
                  <span className="composer__capability-marker">
                    <span className="composer__capability-symbol" aria-hidden="true">
                      ✦
                    </span>
                    <button
                      type="button"
                      className="composer__capability-remove"
                      aria-label={`移除${activeCapabilityLabel}能力标签`}
                      onClick={onRemoveCapability}
                    >
                      <XIcon className="composer__capability-remove-icon" />
                    </button>
                  </span>
                  <span className="composer__capability-label">
                    {activeCapabilityLabel}
                  </span>
                </span>
              ) : null}
            </div>

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
            onClick={() => {
              if (projectMenuOpen) {
                closeProjectMenu()
              } else {
                openProjectMenu()
              }
            }}
          >
            <FolderIcon className="composer__project-icon" />
            <span>{selectedProject?.name ?? '选择项目'}</span>
            <ChevronDownIcon className="composer__chevron" />
          </button>

          {projectMenuOpen ? (
            <div className="composer__project-menu">
              <label className="composer__project-search">
                <SearchIcon className="composer__project-search-icon" />
                <input
                  type="search"
                  aria-label="搜索项目"
                  placeholder="搜索项目"
                  value={projectSearchQuery}
                  onChange={(event) => setProjectSearchQuery(event.target.value)}
                />
              </label>
              <div
                className="composer__project-option-list"
                role="listbox"
                aria-label="项目列表"
              >
                {visibleProjects.length > 0 ? (
                  visibleProjects.map((project) => {
                    const isSelected = project.id === selectedProjectId

                    return (
                      <button
                        key={project.id}
                        type="button"
                        className={`composer__project-option${
                          isSelected
                            ? ' composer__project-option--selected selected'
                            : ''
                        }`}
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          onProjectChange(project.id)
                          closeProjectMenu()
                        }}
                      >
                        <FolderIcon className="composer__project-option-icon" />
                        <span>{project.name}</span>
                        {isSelected ? (
                          <span
                            className="composer__project-option-check"
                            aria-hidden="true"
                          >
                            ✓
                          </span>
                        ) : null}
                      </button>
                    )
                  })
                ) : (
                  <div className="composer__project-empty">未找到项目</div>
                )}
              </div>
              <div className="composer__project-menu-separator" />
              <button
                type="button"
                className="composer__project-create-button"
                onClick={openNewProjectDialog}
              >
                <PlusIcon className="composer__project-create-icon" />
                <span>新项目</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {newProjectDialogOpen ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-create-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setNewProjectDialogOpen(false)
            }
          }}
        >
          <form
            ref={newProjectDialogRef}
            className="dialog-panel dialog-panel--project"
            onSubmit={(event) => {
              event.preventDefault()
              submitNewProject()
            }}
            onKeyDown={(event) =>
              trapDialogFocus(event, newProjectDialogRef.current, () =>
                setNewProjectDialogOpen(false),
              )
            }
          >
            <div className="dialog-header dialog-header--project">
              <div>
                <h2 id="project-create-dialog-title">为项目命名</h2>
                <p className="dialog-subtitle">保持简短且易识别</p>
              </div>
              <button
                type="button"
                className="dialog-close"
                aria-label="关闭"
                onClick={() => setNewProjectDialogOpen(false)}
              >
                ×
              </button>
            </div>
            <input
              ref={newProjectInputRef}
              className="dialog-input dialog-input--project"
              aria-label="项目名称"
              value={newProjectName}
              onChange={(event) => setNewProjectName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setNewProjectDialogOpen(false)
                }
              }}
            />
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-button"
                onClick={() => setNewProjectDialogOpen(false)}
              >
                取消
              </button>
              <button type="submit" className="dialog-button dialog-button--dark">
                保存
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  )
}

function trapDialogFocus(
  event: KeyboardEvent<HTMLElement>,
  dialogElement: HTMLElement | null,
  closeDialog: () => void,
) {
  if (event.key === 'Escape') {
    closeDialog()
    return
  }

  if (event.key !== 'Tab' || !dialogElement) {
    return
  }

  const focusableElements = Array.from(
    dialogElement.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.getAttribute('aria-hidden') !== 'true')

  if (focusableElements.length === 0) {
    event.preventDefault()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

export default Composer
