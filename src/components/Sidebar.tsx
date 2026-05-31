import { useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import type { DemoProject, ThreadEntry } from '../store/demoStoreLogic'
import {
  formatRelativeActivity,
  getPinnedThreadEntries,
  getRecentThreadEntries,
  getSearchView,
} from '../store/demoStoreLogic'
import {
  ArchiveIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  FolderIcon,
  MessageCircleIcon,
  MoreHorizontalIcon,
  PanelRightIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  ShareIcon,
  TrashIcon,
  WarningIcon,
} from './icons'

type SidebarProps = {
  projects: DemoProject[]
  selectedThreadId: string | null
  searchOpen: boolean
  searchQuery: string
  expandedProjectIds: string[]
  sidebarCollapsed: boolean
  onSidebarCollapsedChange: (collapsed: boolean) => void
  onNewThread: () => void
  onSearchOpenChange: (open: boolean) => void
  onSearchQueryChange: (query: string) => void
  onToggleProject: (projectId: string) => void
  onSelectThread: (projectId: string, threadId: string) => void
  onTogglePinned: (threadId: string) => void
  onRenameThread: (threadId: string, title: string) => void
  onArchiveThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => void
  onNotify: (message: string) => void
}

type ThreadRowSource = 'pinned' | 'project'

function Sidebar({
  projects,
  selectedThreadId,
  searchOpen,
  searchQuery,
  expandedProjectIds,
  sidebarCollapsed,
  onSidebarCollapsedChange,
  onNewThread,
  onSearchOpenChange,
  onSearchQueryChange,
  onToggleProject,
  onSelectThread,
  onTogglePinned,
  onRenameThread,
  onArchiveThread,
  onDeleteThread,
  onNotify,
}: SidebarProps) {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)
  const [recentPopoverOpen, setRecentPopoverOpen] = useState(false)
  const [renameEntry, setRenameEntry] = useState<ThreadEntry | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteEntry, setDeleteEntry] = useState<ThreadEntry | null>(null)
  const renameDialogRef = useRef<HTMLFormElement>(null)
  const deleteDialogRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null)
  const recentPopoverRef = useRef<HTMLDivElement>(null)
  const recentCloseTimeoutRef = useRef<number | null>(null)
  const normalizedSearchQuery = searchQuery.trim()
  const searchView = useMemo(
    () => getSearchView(projects, searchQuery),
    [projects, searchQuery],
  )
  const pinnedThreadEntries = searchOpen
    ? searchView.pinnedThreadEntries
    : getPinnedThreadEntries(projects)
  const visibleProjects = searchOpen
    ? searchView.projects
    : projects.map((project) => ({
        ...project,
        threads: project.threads.filter((thread) => !thread.archived),
      }))
  const hasSearchResults =
    pinnedThreadEntries.length > 0 ||
    visibleProjects.some((project) => project.threads.length > 0)
  const showNoSearchResults =
    searchOpen && normalizedSearchQuery.length > 0 && !hasSearchResults
  const recentThreadEntries = useMemo(
    () => getRecentThreadEntries(projects),
    [projects],
  )

  useEffect(() => {
    if (!openMenuKey) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element)) {
        return
      }

      if (
        event.target.closest('.sidebar__thread-menu') ||
        event.target.closest('.sidebar__thread-menu-button')
      ) {
        return
      }

      setOpenMenuKey(null)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenMenuKey(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenuKey])

  useEffect(() => {
    if (!recentPopoverOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (!(event.target instanceof Element)) {
        return
      }

      if (event.target.closest('.sidebar__rail-recent')) {
        return
      }

      setRecentPopoverOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setRecentPopoverOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [recentPopoverOpen])

  useEffect(() => {
    if (!renameEntry) {
      return
    }

    window.setTimeout(() => {
      renameInputRef.current?.focus()
      renameInputRef.current?.select()
    }, 0)
  }, [renameEntry])

  useEffect(() => {
    if (!deleteEntry) {
      return
    }

    window.setTimeout(() => {
      cancelDeleteButtonRef.current?.focus()
    }, 0)
  }, [deleteEntry])

  useEffect(
    () => () => {
      if (recentCloseTimeoutRef.current !== null) {
        window.clearTimeout(recentCloseTimeoutRef.current)
      }
    },
    [],
  )

  function closeSearch() {
    onSearchQueryChange('')
    onSearchOpenChange(false)
  }

  function closeRecentPopoverAfterFocusLeaves() {
    window.requestAnimationFrame(() => {
      const activeElement = document.activeElement

      if (
        activeElement instanceof Element &&
        recentPopoverRef.current?.contains(activeElement)
      ) {
        return
      }

      setRecentPopoverOpen(false)
    })
  }

  function keepRecentPopoverOpen() {
    if (recentCloseTimeoutRef.current !== null) {
      window.clearTimeout(recentCloseTimeoutRef.current)
      recentCloseTimeoutRef.current = null
    }

    setRecentPopoverOpen(true)
  }

  function closeRecentPopoverSoon() {
    if (recentCloseTimeoutRef.current !== null) {
      window.clearTimeout(recentCloseTimeoutRef.current)
    }

    recentCloseTimeoutRef.current = window.setTimeout(() => {
      setRecentPopoverOpen(false)
      recentCloseTimeoutRef.current = null
    }, 120)
  }

  function makeMenuKey(source: ThreadRowSource, threadId: string) {
    return `${source}:${threadId}`
  }

  function openRenameDialog(entry: ThreadEntry) {
    setRenameEntry(entry)
    setRenameValue(entry.thread.title)
  }

  function submitRename() {
    const nextTitle = renameValue.trim().replace(/\s+/g, ' ')

    if (!renameEntry) {
      return
    }

    if (!nextTitle) {
      onNotify('名称不能为空')
      return
    }

    onRenameThread(renameEntry.thread.id, nextTitle)
    setRenameEntry(null)
  }

  function renderThreadRow(entry: ThreadEntry, source: ThreadRowSource) {
    const { projectId, thread } = entry
    const isSelected = thread.id === selectedThreadId
    const menuKey = makeMenuKey(source, thread.id)
    const isMenuOpen = openMenuKey === menuKey

    return (
      <div
        key={`${source}-${projectId}-${thread.id}`}
        className={`sidebar__thread${isSelected ? ' sidebar__thread--selected selected' : ''}`}
      >
        <button
          type="button"
          className="sidebar__thread-select"
          aria-current={isSelected ? 'page' : undefined}
          onClick={() => onSelectThread(projectId, thread.id)}
        >
          <span className="sidebar__thread-title">{thread.title}</span>
          <span className="sidebar__thread-time">
            {formatRelativeActivity(thread.lastActivityAt)}
          </span>
        </button>

        <span className="sidebar__thread-tools">
          <button
            type="button"
            className={`sidebar__thread-tool${thread.pinned ? ' sidebar__thread-tool--active' : ''}`}
            aria-label={thread.pinned ? '取消置顶' : '置顶'}
            onClick={(event) => {
              event.stopPropagation()
              onTogglePinned(thread.id)
            }}
          >
            <PinIcon className="sidebar__thread-tool-icon" />
          </button>
          <button
            type="button"
            className="sidebar__thread-tool sidebar__thread-menu-button"
            aria-label={`打开${thread.title}菜单`}
            aria-expanded={isMenuOpen}
            onClick={(event) => {
              event.stopPropagation()
              setOpenMenuKey(isMenuOpen ? null : menuKey)
            }}
          >
            <MoreHorizontalIcon className="sidebar__thread-tool-icon" />
          </button>
        </span>

        {isMenuOpen ? (
          <div className="sidebar__thread-menu">
            <button
              type="button"
              className="sidebar__menu-item"
              onClick={() => {
                setOpenMenuKey(null)
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
                setOpenMenuKey(null)
                openRenameDialog(entry)
              }}
            >
              <PencilIcon className="sidebar__menu-icon" />
              <span>重命名</span>
            </button>
            <button
              type="button"
              className="sidebar__menu-item"
              onClick={() => {
                setOpenMenuKey(null)
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
                setOpenMenuKey(null)
                setDeleteEntry(entry)
              }}
            >
              <TrashIcon className="sidebar__menu-icon" />
              <span>删除</span>
            </button>
          </div>
        ) : null}
      </div>
    )
  }

  if (sidebarCollapsed) {
    return (
      <aside className="sidebar sidebar--collapsed" aria-label="对话侧栏">
        <div className="sidebar__rail">
          <button
            type="button"
            className="sidebar__rail-button"
            aria-label="展开侧栏"
            aria-expanded={false}
            onClick={() => onSidebarCollapsedChange(false)}
          >
            <PanelRightIcon className="sidebar__rail-icon" />
            <span className="sidebar__rail-tooltip">展开侧栏</span>
          </button>

          <div className="sidebar__rail-group">
            <button
              type="button"
              className="sidebar__rail-button"
              aria-label="新对话"
              onClick={onNewThread}
            >
              <PlusIcon className="sidebar__rail-icon" />
              <span className="sidebar__rail-tooltip">新对话</span>
            </button>
            <button
              type="button"
              className="sidebar__rail-button"
              aria-label="搜索对话"
              onClick={() => {
                onSidebarCollapsedChange(false)
                onSearchOpenChange(true)
              }}
            >
              <SearchIcon className="sidebar__rail-icon" />
              <span className="sidebar__rail-tooltip">搜索对话</span>
            </button>
            <div
              ref={recentPopoverRef}
              className="sidebar__rail-recent"
              onMouseEnter={keepRecentPopoverOpen}
              onMouseLeave={closeRecentPopoverSoon}
            >
              <button
                type="button"
                className={`sidebar__rail-button${
                  selectedThreadId ? ' sidebar__rail-button--active' : ''
                }`}
                aria-label="最近对话"
                aria-expanded={recentPopoverOpen}
                onFocus={keepRecentPopoverOpen}
                onBlur={closeRecentPopoverAfterFocusLeaves}
              >
                <MessageCircleIcon className="sidebar__rail-icon" />
                <span className="sidebar__rail-tooltip">最近对话</span>
              </button>

              {recentPopoverOpen ? (
                <section
                  className="sidebar__recent-conversation-popover"
                  aria-label="最近对话"
                  onMouseEnter={keepRecentPopoverOpen}
                  onMouseLeave={closeRecentPopoverSoon}
                >
                  <div className="sidebar__recent-conversation-title">
                    最近对话
                  </div>
                  <div className="sidebar__recent-conversation-list">
                    {recentThreadEntries.length > 0 ? (
                      recentThreadEntries.map((entry) => (
                        <button
                          key={`${entry.projectId}-${entry.thread.id}`}
                          type="button"
                          aria-label={entry.thread.title}
                          aria-current={
                            entry.thread.id === selectedThreadId ? 'page' : undefined
                          }
                          className={`sidebar__recent-conversation-item${
                            entry.thread.id === selectedThreadId
                              ? ' sidebar__recent-conversation-item--selected'
                              : ''
                          }`}
                          onClick={() => {
                            onSelectThread(entry.projectId, entry.thread.id)
                            setRecentPopoverOpen(false)
                          }}
                        >
                          <span className="sidebar__recent-conversation-main">
                            <span className="sidebar__recent-conversation-name">
                              {entry.thread.title}
                            </span>
                            <span className="sidebar__recent-conversation-time">
                              {formatRelativeActivity(entry.thread.lastActivityAt)}
                            </span>
                          </span>
                          <span className="sidebar__recent-conversation-project">
                            {entry.projectName}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="sidebar__recent-conversation-empty">
                        暂无对话
                      </div>
                    )}
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="sidebar" aria-label="对话侧栏">
      <div className="sidebar__top-controls">
        <button type="button" className="sidebar__new-thread" onClick={onNewThread}>
          <PlusIcon className="sidebar__control-icon" />
          <span>新对话</span>
        </button>
        <button
          type="button"
          className="sidebar__collapse-button"
          aria-label="收起侧栏"
          aria-expanded={true}
          onClick={() => onSidebarCollapsedChange(true)}
        >
          <PanelRightIcon className="sidebar__control-icon" />
        </button>
      </div>

      <div className="sidebar__project-section sidebar-scroll">
        {pinnedThreadEntries.length > 0 ? (
          <section className="sidebar__pinned-section" aria-label="置顶对话">
            <div className="sidebar__section-title">置顶</div>
            <div className="sidebar__thread-list sidebar__thread-list--pinned">
              {pinnedThreadEntries.map((entry) => renderThreadRow(entry, 'pinned'))}
            </div>
          </section>
        ) : null}

        <div className="sidebar__project-title-row">
          {searchOpen ? (
            <label className="sidebar__search-field">
              <SearchIcon className="sidebar__control-icon" />
              <input
                className="sidebar__search-input"
                type="search"
                value={searchQuery}
                autoFocus
                aria-label="搜索对话"
                placeholder="搜索对话"
                onChange={(event) => onSearchQueryChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') {
                    closeSearch()
                  }
                }}
              />
              <button
                type="button"
                className="sidebar__search-clear"
                aria-label="关闭搜索"
                onClick={closeSearch}
              >
                ×
              </button>
            </label>
          ) : (
            <>
              <div className="sidebar__section-title">项目</div>
              <button
                type="button"
                className="sidebar__search-button"
                aria-label="打开搜索"
                onClick={() => onSearchOpenChange(true)}
              >
                <SearchIcon className="sidebar__control-icon" />
              </button>
            </>
          )}
        </div>

        {showNoSearchResults ? (
          <div className="sidebar__empty">未找到相关对话</div>
        ) : null}

        <div className="sidebar__project-list">
          {visibleProjects.map((project) => {
            const isExpanded =
              searchOpen || expandedProjectIds.includes(project.id)

            return (
              <section
                key={project.id}
                className={`sidebar__project${isExpanded ? ' sidebar__project--expanded' : ''}`}
              >
                <button
                  type="button"
                  className="sidebar__project-header"
                  onClick={() => {
                    if (!searchOpen) {
                      onToggleProject(project.id)
                    }
                  }}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDownIcon className="sidebar__project-arrow" />
                  ) : (
                    <ChevronRightIcon className="sidebar__project-arrow" />
                  )}
                  <FolderIcon className="sidebar__project-icon" />
                  <span className="sidebar__project-name">{project.name}</span>
                </button>

                {isExpanded ? (
                  <div className="sidebar__thread-list">
                    {project.threads.length > 0
                      ? project.threads.map((thread) =>
                          renderThreadRow(
                            {
                              projectId: project.id,
                              projectName: project.name,
                              thread,
                            },
                            'project',
                          ),
                        )
                      : !searchOpen && (
                          <div className="sidebar__project-empty">暂无对话</div>
                        )}
                  </div>
                ) : null}
              </section>
            )
          })}
        </div>
      </div>

      {renameEntry ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rename-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setRenameEntry(null)
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
                setRenameEntry(null),
              )
            }
          >
            <div className="dialog-header">
              <h2 id="rename-dialog-title">编辑对话名称</h2>
              <button
                type="button"
                className="dialog-close"
                aria-label="关闭"
                onClick={() => setRenameEntry(null)}
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
                  setRenameEntry(null)
                }
              }}
            />
            <div className="dialog-actions">
              <button
                type="button"
                className="dialog-button"
                onClick={() => setRenameEntry(null)}
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

      {deleteEntry ? (
        <div
          className="dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setDeleteEntry(null)
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              setDeleteEntry(null)
            }
          }}
        >
          <div
            ref={deleteDialogRef}
            className="dialog-panel dialog-panel--delete"
            onKeyDown={(event) =>
              trapDialogFocus(event, deleteDialogRef.current, () =>
                setDeleteEntry(null),
              )
            }
          >
            <div className="dialog-warning-row">
              <span className="dialog-warning-icon">
                <WarningIcon className="dialog-warning-svg" />
              </span>
              <div>
                <h2 id="delete-dialog-title">确定删除对话？</h2>
                <p>删除后，此对话的记录和上下文将不可恢复。</p>
              </div>
            </div>
            <div className="dialog-actions">
              <button
                ref={cancelDeleteButtonRef}
                type="button"
                className="dialog-button"
                onClick={() => setDeleteEntry(null)}
              >
                取消
              </button>
              <button
                type="button"
                className="dialog-button dialog-button--danger"
                onClick={() => {
                  onDeleteThread(deleteEntry.thread.id)
                  setDeleteEntry(null)
                }}
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  )
}

function trapDialogFocus(
  event: ReactKeyboardEvent<HTMLElement>,
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

export default Sidebar
