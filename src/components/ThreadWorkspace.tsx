import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { ProjectFileBlock } from '../data/conversationTypes'
import { buildThreadObjectStorageFiles } from '../data/workspaceSideWindowMockData'
import type { DemoThread } from '../store/demoStoreLogic'
import ConversationTranscript from './ConversationTranscript'
import {
  ArchiveIcon,
  InfoIcon,
  MoreHorizontalIcon,
  PanelRightIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
  WarningIcon,
  WorkspaceToolWindowIcon,
} from './icons'
import RunInspector from './RunInspector'
import ThreadComposer from './ThreadComposer'
import WorkspaceSideWindow from './WorkspaceSideWindow'
import type { WorkspaceSideWindowThreadState } from './WorkspaceSideWindow'

type ThreadWorkspaceProps = {
  thread: DemoThread
  projectName: string
  draft: string
  onDraftChange: (draft: string) => void
  onSubmit: () => void
  onRenameThread: (threadId: string, title: string) => void
  onArchiveThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => void
  onNotify: (message: string) => void
  runInspectorOpen: boolean
  onRunInspectorOpenChange: (open: boolean) => void
}

function ThreadWorkspace(props: ThreadWorkspaceProps) {
  const {
    thread,
    projectName,
    draft,
    onDraftChange,
    onSubmit,
    onRenameThread,
    onArchiveThread,
    onDeleteThread,
    onNotify,
    runInspectorOpen,
    onRunInspectorOpenChange,
  } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const renameDialogRef = useRef<HTMLFormElement>(null)
  const deleteDialogRef = useRef<HTMLDivElement>(null)
  const runInfoButtonRef = useRef<HTMLButtonElement>(null)
  const sideWindowButtonRef = useRef<HTMLButtonElement>(null)
  const runInspectorPanelRef = useRef<HTMLElement>(null)
  const sideWindowPanelRef = useRef<HTMLElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null)
  const [runInspectorDrawer, setRunInspectorDrawer] = useState(false)
  const [sideWindowOpen, setSideWindowOpen] = useState(false)
  const [sideWindowStateByThreadId, setSideWindowStateByThreadId] = useState<
    Record<string, WorkspaceSideWindowThreadState>
  >({})
  const previousRunInspectorOpenRef = useRef<boolean | null>(null)
  const statusBadges = getThreadStatusBadges(thread)
  const infoTooltip = `${projectName} · ${thread.transcript.length} 轮对话`
  const sideWindowState =
    sideWindowStateByThreadId[thread.id] ?? getDefaultSideWindowThreadState()
  const sideWindowFiles = useMemo(
    () => buildThreadObjectStorageFiles(projectName, thread.id),
    [projectName, thread.id],
  )

  const closeRunInspector = useCallback(() => {
    onRunInspectorOpenChange(false)
    window.setTimeout(() => {
      runInfoButtonRef.current?.focus()
    }, 0)
  }, [onRunInspectorOpenChange])

  const closeSideWindow = useCallback(() => {
    setSideWindowOpen(false)

    if (previousRunInspectorOpenRef.current) {
      onRunInspectorOpenChange(true)
    }

    previousRunInspectorOpenRef.current = null

    window.setTimeout(() => {
      sideWindowButtonRef.current?.focus()
    }, 0)
  }, [onRunInspectorOpenChange])

  useEffect(() => {
    previousRunInspectorOpenRef.current = null
  }, [thread.id])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element)) {
        return
      }

      if (
        event.target.closest('.thread-workspace__menu') ||
        event.target.closest('.thread-workspace__menu-button')
      ) {
        return
      }

      setMenuOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    if (!renameOpen) {
      return
    }

    window.setTimeout(() => {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }, 0)
  }, [renameOpen])

  useEffect(() => {
    if (!deleteOpen) {
      return
    }

    window.setTimeout(() => {
      cancelDeleteButtonRef.current?.focus()
    }, 0)
  }, [deleteOpen])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1460px)')
    const updateDrawerMode = () => setRunInspectorDrawer(mediaQuery.matches)

    updateDrawerMode()
    mediaQuery.addEventListener('change', updateDrawerMode)

    return () => {
      mediaQuery.removeEventListener('change', updateDrawerMode)
    }
  }, [])

  useEffect(() => {
    if (!runInspectorOpen || !runInspectorDrawer) {
      return
    }

    window.setTimeout(() => {
      runInspectorPanelRef.current?.focus()
    }, 0)
  }, [runInspectorDrawer, runInspectorOpen])

  useEffect(() => {
    if (!sideWindowOpen || !runInspectorDrawer) {
      return
    }

    window.setTimeout(() => {
      sideWindowPanelRef.current?.focus()
    }, 0)
  }, [runInspectorDrawer, sideWindowOpen])

  useEffect(() => {
    if (!runInspectorOpen || renameOpen || deleteOpen) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeRunInspector()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeRunInspector, deleteOpen, renameOpen, runInspectorOpen])

  useEffect(() => {
    if (!sideWindowOpen || renameOpen || deleteOpen) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeSideWindow()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeSideWindow, deleteOpen, renameOpen, sideWindowOpen])

  function openSideWindow() {
    previousRunInspectorOpenRef.current = runInspectorOpen
    onRunInspectorOpenChange(false)
    setSideWindowOpen(true)
  }

  function handleSideWindowButtonClick() {
    if (sideWindowOpen) {
      closeSideWindow()
      return
    }

    openSideWindow()
  }

  function handleRunInspectorButtonClick() {
    if (sideWindowOpen) {
      previousRunInspectorOpenRef.current = null
      setSideWindowOpen(false)
      onRunInspectorOpenChange(true)
      return
    }

    onRunInspectorOpenChange(!runInspectorOpen)
  }

  function handleProjectFileOpen(block: ProjectFileBlock) {
    const matchedFile = sideWindowFiles.find(
      (file) => file.fileName === block.fileName,
    )

    updateSideWindowState({
      ...sideWindowState,
      mode: 'files',
      selectedFileId: matchedFile?.id ?? null,
      searchQuery: '',
      fileTreeCollapsed: true,
    })
    openSideWindow()
  }

  function updateSideWindowState(nextState: WorkspaceSideWindowThreadState) {
    setSideWindowStateByThreadId((current) => ({
      ...current,
      [thread.id]: nextState,
    }))
  }

  function submitRename() {
    const nextTitle = renameValue.trim().replace(/\s+/g, ' ')

    if (!nextTitle) {
      onNotify('名称不能为空')
      return
    }

    onRenameThread(thread.id, nextTitle)
    setRenameOpen(false)
  }

  return (
    <section
      className={`thread-workspace${
        runInspectorOpen ? ' thread-workspace--run-inspector-open' : ''
      }${sideWindowOpen ? ' thread-workspace--side-window-open' : ''
      }`}
      aria-label={thread.title}
    >
      <header className="thread-workspace__header">
        <div className="thread-workspace__title-row">
          <h1>{thread.title}</h1>
          <span
            className="thread-workspace__info"
            tabIndex={0}
            aria-label={infoTooltip}
          >
            <InfoIcon className="thread-workspace__info-icon" />
            <span className="thread-workspace__info-tooltip" role="tooltip">
              <span>项目：{projectName}</span>
              <span>对话轮次：{thread.transcript.length}</span>
            </span>
          </span>
          {statusBadges.length > 0 ? (
            <span className="thread-workspace__status" aria-label="当前状态">
              {statusBadges.map((badge) => (
                <span
                  key={badge.label}
                  className={`thread-workspace__status-badge thread-workspace__status-badge--${badge.tone}`}
                >
                  {badge.label}
                </span>
              ))}
            </span>
          ) : null}
        </div>
        <div className="thread-workspace__actions">
          <button
            ref={runInfoButtonRef}
            type="button"
            className="thread-workspace__run-info-button"
            aria-label={runInspectorOpen ? '关闭运行信息' : '打开运行信息'}
            aria-expanded={runInspectorOpen}
            aria-controls="thread-run-inspector"
            title={runInspectorOpen ? '关闭运行信息' : '打开运行信息'}
            onClick={handleRunInspectorButtonClick}
          >
            <PanelRightIcon className="thread-workspace__run-info-icon" />
            <span>运行信息</span>
          </button>
          <button
            ref={sideWindowButtonRef}
            type="button"
            className="thread-workspace__side-window-button"
            aria-label={sideWindowOpen ? '关闭侧窗' : '打开侧窗'}
            aria-expanded={sideWindowOpen}
            aria-controls="thread-workspace-side-window"
            title={sideWindowOpen ? '关闭侧窗' : '打开侧窗'}
            onClick={handleSideWindowButtonClick}
          >
            <WorkspaceToolWindowIcon className="thread-workspace__side-window-icon" />
          </button>
          <button
            type="button"
            className="thread-workspace__menu-button"
            aria-label={`打开${thread.title}菜单`}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreHorizontalIcon className="thread-workspace__menu-icon" />
          </button>
          {menuOpen ? (
            <div className="thread-workspace__menu">
              <button
                type="button"
                className="sidebar__menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  onNotify('分享功能将在后续版本开放')
                }}
              >
                <ShareIcon className="sidebar__menu-icon" />
                <span>分享</span>
              </button>
              <button
                type="button"
                className="sidebar__menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  setRenameValue(thread.title)
                  setRenameOpen(true)
                }}
              >
                <PencilIcon className="sidebar__menu-icon" />
                <span>重命名</span>
              </button>
              <button
                type="button"
                className="sidebar__menu-item"
                onClick={() => {
                  setMenuOpen(false)
                  onArchiveThread(thread.id)
                }}
              >
                <ArchiveIcon className="sidebar__menu-icon" />
                <span>归档</span>
              </button>
              <button
                type="button"
                className="sidebar__menu-item sidebar__menu-item--danger"
                onClick={() => {
                  setMenuOpen(false)
                  setDeleteOpen(true)
                }}
              >
                <TrashIcon className="sidebar__menu-icon" />
                <span>删除</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="thread-workspace__conversation-column">
        {thread.transcript.length > 0 ? (
          <ConversationTranscript
            turns={thread.transcript}
            onProjectFileOpen={handleProjectFileOpen}
          />
        ) : (
          <div className="thread-workspace__empty">
            这个对话暂未制作内容
          </div>
        )}

        <ThreadComposer
          draft={draft}
          onDraftChange={onDraftChange}
          onSubmit={onSubmit}
          onNotify={onNotify}
        />
      </div>

      {runInspectorOpen ? (
        <>
          <button
            type="button"
            className="thread-workspace__drawer-backdrop"
            aria-label="关闭运行信息"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeRunInspector}
          />
          <aside
            ref={runInspectorPanelRef}
            id="thread-run-inspector"
            className="thread-workspace__run-inspector"
            role={runInspectorDrawer ? 'dialog' : 'complementary'}
            aria-modal={runInspectorDrawer ? true : undefined}
            aria-label="运行信息"
            tabIndex={runInspectorDrawer ? -1 : undefined}
            onKeyDown={(event) => {
              if (runInspectorDrawer) {
                trapDialogFocus(event, runInspectorPanelRef.current, closeRunInspector)
              }
            }}
          >
            <RunInspector data={thread.runInspector} />
          </aside>
        </>
      ) : null}

      {sideWindowOpen ? (
        <>
          <button
            type="button"
            className="thread-workspace__drawer-backdrop thread-workspace__side-window-backdrop"
            aria-label="关闭侧窗"
            aria-hidden="true"
            tabIndex={-1}
            onClick={closeSideWindow}
          />
          <aside
            ref={sideWindowPanelRef}
            id="thread-workspace-side-window"
            className="thread-workspace__side-window"
            role={runInspectorDrawer ? 'dialog' : 'complementary'}
            aria-modal={runInspectorDrawer ? true : undefined}
            aria-label="Workspace 侧窗"
            tabIndex={runInspectorDrawer ? -1 : undefined}
            onKeyDown={(event) => {
              if (runInspectorDrawer) {
                trapDialogFocus(event, sideWindowPanelRef.current, closeSideWindow)
              }
            }}
          >
            <WorkspaceSideWindow
              projectName={projectName}
              state={sideWindowState}
              files={sideWindowFiles}
              onStateChange={updateSideWindowState}
              onClose={closeSideWindow}
            />
          </aside>
        </>
      ) : null}

      {renameOpen ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thread-rename-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRenameOpen(false)
            }
          }}
        >
          <form
            ref={renameDialogRef}
            className="dialog-panel dialog-panel--rename"
            onSubmit={(event) => {
              event.preventDefault()
              submitRename()
            }}
            onKeyDown={(event) =>
              trapDialogFocus(event, renameDialogRef.current, () =>
                setRenameOpen(false),
              )
            }
          >
            <div className="dialog-header">
              <h2 id="thread-rename-dialog-title">编辑对话名称</h2>
              <button
                type="button"
                className="dialog-close"
                aria-label="关闭"
                onClick={() => setRenameOpen(false)}
              >
                ×
              </button>
            </div>
            <input
              ref={renameInputRef}
              className="dialog-input"
              aria-label="对话名称"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  setRenameOpen(false)
                }
              }}
            />
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-button"
                onClick={() => setRenameOpen(false)}
              >
                取消
              </button>
              <button type="submit" className="dialog-button dialog-button--primary">
                确定
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="thread-delete-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteOpen(false)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setDeleteOpen(false)
            }
          }}
        >
          <div
            ref={deleteDialogRef}
            className="dialog-panel dialog-panel--delete"
            onKeyDown={(event) =>
              trapDialogFocus(event, deleteDialogRef.current, () =>
                setDeleteOpen(false),
              )
            }
          >
            <div className="dialog-warning-row">
              <span className="dialog-warning-icon">
                <WarningIcon className="dialog-warning-svg" />
              </span>
              <div>
                <h2 id="thread-delete-dialog-title">确定删除对话？</h2>
                <p>删除后，此对话的记录和上下文将不可恢复。</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button
                ref={cancelDeleteButtonRef}
                type="button"
                className="dialog-button"
                onClick={() => setDeleteOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="dialog-button dialog-button--danger"
                onClick={() => {
                  onDeleteThread(thread.id)
                  setDeleteOpen(false)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

function getDefaultSideWindowThreadState(): WorkspaceSideWindowThreadState {
  return {
    mode: 'launcher',
    selectedFileId: null,
    searchQuery: '',
    fileTreeCollapsed: false,
  }
}

function getThreadStatusBadges(thread: DemoThread) {
  const approvals = thread.runInspector?.approvals ?? []
  const hasPendingApproval = approvals.some(
    (approval) =>
      approval.kind === 'approvalRequest' && approval.status === 'pending',
  )
  const needsHumanConfirmation = approvals.some(
    (approval) =>
      approval.kind === 'humanConfirmation' && approval.status === 'pending',
  )

  return [
    ...(hasPendingApproval
      ? [{ label: '待审批', tone: 'approval' as const }]
      : []),
    ...(needsHumanConfirmation
      ? [{ label: '待确认', tone: 'confirm' as const }]
      : []),
  ]
}

function trapDialogFocus(
  event: ReactKeyboardEvent<HTMLElement>,
  dialogElement: HTMLElement | null,
  closeDialog: () => void,
) {
  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
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
  const activeElement = document.activeElement

  if (!activeElement || !focusableElements.includes(activeElement as HTMLElement)) {
    event.preventDefault()
    if (event.shiftKey) {
      lastElement.focus()
    } else {
      firstElement.focus()
    }
    return
  }

  if (event.shiftKey && activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

export default ThreadWorkspace
