import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  ComponentType,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react'
import type {
  ActiveTopNav,
  DemoProject,
  ThreadEntry,
} from '../store/demoStoreLogic'
import {
  formatRelativeActivity,
  getPinnedThreadEntries,
  getRecentThreadEntries,
  getSearchView,
} from '../store/demoStoreLogic'
import type { AccountMenuItem, TopNavItem } from './TopNav'
import {
  ArchiveIcon,
  AssetsIcon,
  BellIcon,
  CapabilitiesNavIcon,
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
  activeItem: ActiveTopNav
  searchOpen: boolean
  searchQuery: string
  expandedProjectIds: string[]
  sidebarCollapsed: boolean
  notificationActionRequiredCount: number
  onSidebarCollapsedChange: (collapsed: boolean) => void
  onNewThread: () => void
  onCreateProject: () => void
  onPrimaryNav: (item: TopNavItem) => void
  onSearchOpenChange: (open: boolean) => void
  onSearchQueryChange: (query: string) => void
  onToggleProject: (projectId: string) => void
  onSelectThread: (projectId: string, threadId: string) => void
  onTogglePinned: (threadId: string) => void
  onRenameThread: (threadId: string, title: string) => void
  onArchiveThread: (threadId: string) => void
  onDeleteThread: (threadId: string) => void
  onNotificationCenterOpen: () => void
  onAccountMenuSelect: (item: AccountMenuItem) => void
  onNotify: (message: string) => void
}

type ThreadRowSource = 'pinned' | 'project'
type SidebarNavItem = {
  id: TopNavItem
  label: string
  Icon: ComponentType<{ className?: string }>
}

type ProjectScrollbarMetrics = {
  isScrollable: boolean
  thumbHeight: number
  thumbTop: number
  valueNow: number
}

const projectScrollbarMinThumbHeight = 36
const projectScrollbarTrackInset = 6
const projectScrollbarKeyboardStep = 40

const initialProjectScrollbarMetrics: ProjectScrollbarMetrics = {
  isScrollable: false,
  thumbHeight: 0,
  thumbTop: 0,
  valueNow: 0,
}

const primaryNavItems: SidebarNavItem[] = [
  { id: 'Projects', label: 'Projects', Icon: FolderIcon },
  { id: 'Assets', label: 'Assets', Icon: AssetsIcon },
  { id: 'Capabilities', label: 'Capabilities', Icon: CapabilitiesNavIcon },
]

const accountMenuOptions: { id: AccountMenuItem; label: string }[] = [
  { id: 'notification-center', label: '通知中心' },
  { id: 'approval-center', label: '审批中心' },
  { id: 'billing-center', label: '费用中心' },
  { id: 'product-management-platform', label: '管理后台' },
]

function getProjectScrollbarMetrics(
  scrollElement: HTMLElement | null,
): ProjectScrollbarMetrics {
  if (!scrollElement) {
    return initialProjectScrollbarMetrics
  }

  const { clientHeight, scrollHeight, scrollTop } = scrollElement
  const maxScrollTop = Math.max(scrollHeight - clientHeight, 0)
  const isScrollable = maxScrollTop > 0
  const safeClientHeight = Math.max(clientHeight, 1)
  const safeScrollHeight = Math.max(scrollHeight, safeClientHeight)
  const trackHeight = Math.max(
    safeClientHeight - projectScrollbarTrackInset * 2,
    1,
  )
  const thumbHeight = isScrollable
    ? Math.max(
        (safeClientHeight / safeScrollHeight) * trackHeight,
        projectScrollbarMinThumbHeight,
      )
    : 0
  const maxThumbTop = Math.max(trackHeight - thumbHeight, 0)
  const thumbTop =
    isScrollable && maxScrollTop > 0
      ? (scrollTop / maxScrollTop) * maxThumbTop
      : 0
  const valueNow =
    isScrollable && maxScrollTop > 0
      ? Math.round((scrollTop / maxScrollTop) * 100)
      : 0

  return {
    isScrollable,
    thumbHeight,
    thumbTop,
    valueNow,
  }
}

function areProjectScrollbarMetricsEqual(
  currentMetrics: ProjectScrollbarMetrics,
  nextMetrics: ProjectScrollbarMetrics,
) {
  return (
    currentMetrics.isScrollable === nextMetrics.isScrollable &&
    currentMetrics.thumbHeight === nextMetrics.thumbHeight &&
    currentMetrics.thumbTop === nextMetrics.thumbTop &&
    currentMetrics.valueNow === nextMetrics.valueNow
  )
}

function Sidebar({
  projects,
  selectedThreadId,
  activeItem,
  searchOpen,
  searchQuery,
  expandedProjectIds,
  sidebarCollapsed,
  notificationActionRequiredCount,
  onSidebarCollapsedChange,
  onNewThread,
  onCreateProject,
  onPrimaryNav,
  onSearchOpenChange,
  onSearchQueryChange,
  onToggleProject,
  onSelectThread,
  onTogglePinned,
  onRenameThread,
  onArchiveThread,
  onDeleteThread,
  onNotificationCenterOpen,
  onAccountMenuSelect,
  onNotify,
}: SidebarProps) {
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null)
  const [recentPopoverOpen, setRecentPopoverOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [renameEntry, setRenameEntry] = useState<ThreadEntry | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteEntry, setDeleteEntry] = useState<ThreadEntry | null>(null)
  const renameDialogRef = useRef<HTMLFormElement>(null)
  const deleteDialogRef = useRef<HTMLDivElement>(null)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const cancelDeleteButtonRef = useRef<HTMLButtonElement>(null)
  const recentPopoverRef = useRef<HTMLDivElement>(null)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const recentCloseTimeoutRef = useRef<number | null>(null)
  const projectScrollViewportRef = useRef<HTMLDivElement>(null)
  const projectScrollbarMetricsRef = useRef(initialProjectScrollbarMetrics)
  const [projectScrollbarMetrics, setProjectScrollbarMetrics] = useState(
    initialProjectScrollbarMetrics,
  )
  const [projectScrollbarDragging, setProjectScrollbarDragging] = useState(false)
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

  const updateProjectScrollbarMetrics = useCallback(() => {
    const nextMetrics = getProjectScrollbarMetrics(
      projectScrollViewportRef.current,
    )

    if (
      areProjectScrollbarMetricsEqual(
        projectScrollbarMetricsRef.current,
        nextMetrics,
      )
    ) {
      return
    }

    projectScrollbarMetricsRef.current = nextMetrics
    setProjectScrollbarMetrics(nextMetrics)
  }, [])

  useEffect(() => {
    updateProjectScrollbarMetrics()
  })

  useEffect(() => {
    const scrollElement = projectScrollViewportRef.current

    if (!scrollElement) {
      return undefined
    }

    const resizeObserver =
      typeof ResizeObserver === 'function'
        ? new ResizeObserver(updateProjectScrollbarMetrics)
        : null

    resizeObserver?.observe(scrollElement)
    if (scrollElement.firstElementChild) {
      resizeObserver?.observe(scrollElement.firstElementChild)
    }
    window.addEventListener('resize', updateProjectScrollbarMetrics)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateProjectScrollbarMetrics)
    }
  }, [updateProjectScrollbarMetrics])

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
    if (!accountMenuOpen) {
      return undefined
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setAccountMenuOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [accountMenuOpen])

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

  function toggleSearch() {
    if (searchOpen) {
      closeSearch()
      return
    }

    onSearchOpenChange(true)
  }

  function handleAccountMenuSelect(item: AccountMenuItem) {
    setAccountMenuOpen(false)
    onAccountMenuSelect(item)
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

  function handleProjectScrollbarPointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const scrollElement = projectScrollViewportRef.current

    if (!scrollElement || !projectScrollbarMetrics.isScrollable) {
      return
    }

    event.preventDefault()
    setProjectScrollbarDragging(true)

    const scrollbarRect = event.currentTarget.getBoundingClientRect()
    const maxScrollTop = Math.max(
      scrollElement.scrollHeight - scrollElement.clientHeight,
      0,
    )
    const trackHeight = Math.max(scrollbarRect.height, 1)
    const maxThumbTop = Math.max(
      trackHeight - projectScrollbarMetrics.thumbHeight,
      0,
    )
    const targetThumb =
      event.target instanceof Element
        ? event.target.closest('.sidebar__project-scrollbar-thumb')
        : null
    const thumbOffset = targetThumb
      ? event.clientY - targetThumb.getBoundingClientRect().top
      : projectScrollbarMetrics.thumbHeight / 2

    if (maxScrollTop <= 0 || maxThumbTop <= 0) {
      setProjectScrollbarDragging(false)
      return
    }

    const syncScrollFromPointer = (clientY: number) => {
      const nextThumbTop = Math.min(
        Math.max(clientY - scrollbarRect.top - thumbOffset, 0),
        maxThumbTop,
      )

      scrollElement.scrollTop = (nextThumbTop / maxThumbTop) * maxScrollTop
      updateProjectScrollbarMetrics()
    }

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      syncScrollFromPointer(pointerEvent.clientY)
    }

    const handlePointerUp = () => {
      setProjectScrollbarDragging(false)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }

    syncScrollFromPointer(event.clientY)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  function handleProjectScrollbarKeyDown(
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) {
    const scrollElement = projectScrollViewportRef.current

    if (!scrollElement || !projectScrollbarMetrics.isScrollable) {
      return
    }

    const maxScrollTop = Math.max(
      scrollElement.scrollHeight - scrollElement.clientHeight,
      0,
    )
    let nextScrollTop = scrollElement.scrollTop

    switch (event.key) {
      case 'ArrowDown':
        nextScrollTop += projectScrollbarKeyboardStep
        break
      case 'ArrowUp':
        nextScrollTop -= projectScrollbarKeyboardStep
        break
      case 'PageDown':
        nextScrollTop += scrollElement.clientHeight
        break
      case 'PageUp':
        nextScrollTop -= scrollElement.clientHeight
        break
      case 'Home':
        nextScrollTop = 0
        break
      case 'End':
        nextScrollTop = maxScrollTop
        break
      default:
        return
    }

    event.preventDefault()
    scrollElement.scrollTop = Math.min(Math.max(nextScrollTop, 0), maxScrollTop)
    updateProjectScrollbarMetrics()
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

          <nav className="sidebar__rail-group" aria-label="主导航">
            {primaryNavItems.map(({ id, label, Icon }) => {
              const isActive = activeItem === id

              return (
                <button
                  key={id}
                  type="button"
                  className={`sidebar__rail-button${
                    isActive ? ' sidebar__rail-button--active' : ''
                  }`}
                  aria-label={label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onPrimaryNav(id)}
                >
                  <Icon className="sidebar__rail-icon" />
                  <span className="sidebar__rail-tooltip">{label}</span>
                </button>
              )
            })}
          </nav>

          <div className="sidebar__rail-footer">
            <button
              type="button"
              className="sidebar__rail-button sidebar__rail-bell"
              aria-label="打开通知"
              onClick={onNotificationCenterOpen}
            >
              <BellIcon className="sidebar__rail-icon" />
              {notificationActionRequiredCount > 0 ? (
                <span className="sidebar__rail-badge">
                  {notificationActionRequiredCount}
                </span>
              ) : null}
              <span className="sidebar__rail-tooltip">打开通知</span>
            </button>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="sidebar" aria-label="对话侧栏">
      <div className="sidebar__header">
        <button
          type="button"
          className={`sidebar__brand${
            activeItem === 'Workspace' ? ' sidebar__brand--active' : ''
          }`}
          aria-label="Workspace"
          aria-current={activeItem === 'Workspace' ? 'page' : undefined}
          onClick={() => onPrimaryNav('Workspace')}
        >
          <span className="sidebar__brand-mark" aria-hidden="true">
            <span className="sidebar__brand-dot-cloud" />
          </span>
          <span className="sidebar__brand-text">BioMap Agent</span>
          <span className="visually-hidden">Workspace</span>
        </button>

        <div className="sidebar__header-actions">
          <button
            type="button"
            className={`sidebar__icon-button${
              searchOpen ? ' sidebar__icon-button--active' : ''
            }`}
            aria-label={searchOpen ? '关闭搜索' : '搜索对话'}
            aria-expanded={searchOpen}
            onClick={toggleSearch}
          >
            <SearchIcon className="sidebar__control-icon" />
          </button>
          <button
            type="button"
            className="sidebar__icon-button"
            aria-label="收起侧栏"
            aria-expanded={true}
            onClick={() => onSidebarCollapsedChange(true)}
          >
            <PanelRightIcon className="sidebar__control-icon" />
          </button>
        </div>
      </div>

      <div className="sidebar__top-controls">
        <button type="button" className="sidebar__new-thread" onClick={onNewThread}>
          <PlusIcon className="sidebar__control-icon" />
          <span>新对话</span>
        </button>
      </div>

      <nav className="sidebar__primary-nav" aria-label="主导航">
        {primaryNavItems.map(({ id, label, Icon }) => {
          const isActive = activeItem === id

          return (
            <button
              key={id}
              type="button"
              className={`sidebar__primary-nav-item${
                isActive ? ' sidebar__primary-nav-item--active' : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onPrimaryNav(id)}
            >
              <Icon className="sidebar__primary-nav-icon" />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar__project-scroll-shell">
        <div
          id="sidebar-project-scroll"
          className="sidebar__project-section sidebar-scroll"
          aria-label="项目对话列表"
          onScroll={updateProjectScrollbarMetrics}
          ref={projectScrollViewportRef}
        >
          {pinnedThreadEntries.length > 0 ? (
            <section className="sidebar__pinned-section" aria-label="置顶对话">
              <div className="sidebar__section-title">置顶</div>
              <div className="sidebar__thread-list sidebar__thread-list--pinned">
                {pinnedThreadEntries.map((entry) =>
                  renderThreadRow(entry, 'pinned'),
                )}
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
                <div className="sidebar__section-heading">
                  <ChevronDownIcon className="sidebar__section-heading-icon" />
                  <span>项目</span>
                </div>
                <button
                  type="button"
                  className="sidebar__project-add-button"
                  aria-label="新建项目"
                  onClick={onCreateProject}
                >
                  <PlusIcon className="sidebar__control-icon" />
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

          <div className="sidebar__conversation-title-row">
            <div className="sidebar__section-heading">
              <ChevronDownIcon className="sidebar__section-heading-icon" />
              <span>对话</span>
            </div>
          </div>
        </div>

        <div
          aria-controls="sidebar-project-scroll"
          aria-label="项目对话滚动条"
          aria-orientation="vertical"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={projectScrollbarMetrics.valueNow}
          className={`sidebar__project-scrollbar${
            projectScrollbarMetrics.isScrollable
              ? ' sidebar__project-scrollbar--scrollable'
              : ''
          }${
            projectScrollbarDragging
              ? ' sidebar__project-scrollbar--dragging'
              : ''
          }`}
          onKeyDown={handleProjectScrollbarKeyDown}
          onPointerDown={handleProjectScrollbarPointerDown}
          role="scrollbar"
          tabIndex={projectScrollbarMetrics.isScrollable ? 0 : -1}
        >
          <span
            className="sidebar__project-scrollbar-thumb"
            style={{
              height: `${projectScrollbarMetrics.thumbHeight}px`,
              transform: `translateY(${projectScrollbarMetrics.thumbTop}px)`,
            }}
          />
        </div>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__account" ref={accountMenuRef}>
          <button
            type="button"
            className="sidebar__account-button top-nav__user"
            aria-haspopup="menu"
            aria-expanded={accountMenuOpen}
            onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
          >
            <span className="sidebar__avatar" aria-hidden="true">
              Z
            </span>
            <span className="sidebar__account-copy">
              <span className="sidebar__username">zhengjun</span>
              <span className="sidebar__account-subtitle">个人账户</span>
            </span>
          </button>
          {accountMenuOpen ? (
            <div className="sidebar__account-menu" role="menu">
              {accountMenuOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="menuitem"
                  className="sidebar__account-menu-item"
                  onClick={() => handleAccountMenuSelect(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="sidebar__bell"
          aria-label="打开通知"
          onClick={onNotificationCenterOpen}
        >
          <BellIcon className="sidebar__bell-icon" />
          {notificationActionRequiredCount > 0 ? (
            <span className="sidebar__badge">{notificationActionRequiredCount}</span>
          ) : null}
        </button>
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
