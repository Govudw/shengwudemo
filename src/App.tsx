import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  getExternalPath,
  getInternalPathname,
  normalizeAppBasePath,
} from './appRouting'
import ApprovalCenterPage from './components/approval/ApprovalCenterPage'
import AssetsPage from './components/assets/AssetsPage'
import Composer from './components/Composer'
import CapabilitiesPage from './components/CapabilitiesPage'
import NotificationCenterDrawer from './components/notifications/NotificationCenterDrawer'
import NotificationCenterPage from './components/notifications/NotificationCenterPage'
import ProductManagementPlatformPage from './components/product-management/ProductManagementPlatformPage'
import ProjectsPage from './components/projects/ProjectsPage'
import Sidebar from './components/Sidebar'
import ThreadWorkspace from './components/ThreadWorkspace'
import TopNav from './components/TopNav'
import type { AccountMenuItem, TopNavItem } from './components/TopNav'
import UseCaseGrid from './components/UseCaseGrid'
import { capabilityChips, useCases } from './data/mockData'
import type { CapabilityChip } from './data/mockData'
import {
  applyNotificationOverrides,
  countActionRequiredNotifications,
  notificationCenterSeedItems,
} from './data/notificationCenterMockData'
import type { NotificationItem } from './data/notificationCenterMockData'
import {
  resetPersistedDemoStore,
  useDemoStore,
} from './store/useDemoStore'
import type {
  AssetMenuItemId,
  AssetsSection,
  DemoProject,
} from './store/demoStoreLogic'
import {
  findThreadById,
  findThreadByRouteId,
  isThreadRouteId,
} from './store/demoStoreLogic'

const productManagementPlatformPath = '/product-management-platform'
const productManagementProductPathPrefix = `${productManagementPlatformPath}/products/`
const productManagementCommodityListPath = `${productManagementPlatformPath}/commodities`
const productManagementCommodityPathPrefix = `${productManagementCommodityListPath}/`
const threadPathPattern = /^\/c\/([a-z0-9]{16})\/?$/
const legacyThreadPathPattern = /^\/([a-z0-9]{16})\/?$/
const appBasePath = normalizeAppBasePath(import.meta.env.BASE_URL)

function App() {
  const [pathname, setPathname] = useState(() =>
    getInternalPathname(window.location.pathname, appBasePath),
  )
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [activeCapabilityTag, setActiveCapabilityTag] =
    useState<CapabilityChip | null>(null)
  const composerTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const skipNextRootRouteSyncRef = useRef(false)
  const projects = useDemoStore((state) => state.projects)
  const selectedProjectId = useDemoStore((state) => state.selectedProjectId)
  const selectedThreadId = useDemoStore((state) => state.selectedThreadId)
  const isDraftingNewThread = useDemoStore((state) => state.isDraftingNewThread)
  const draft = useDemoStore((state) => state.draft)
  const expandedProjectIds = useDemoStore((state) => state.expandedProjectIds)
  const sidebarCollapsed = useDemoStore((state) => state.sidebarCollapsed)
  const activeTopNav = useDemoStore((state) => state.activeTopNav)
  const assetsActiveSection = useDemoStore((state) => state.assetsActiveSection)
  const assetsActiveItem = useDemoStore((state) => state.assetsActiveItem)
  const assetsFileViewMode = useDemoStore((state) => state.assetsFileViewMode)
  const assetsExperimentViewMode = useDemoStore(
    (state) => state.assetsExperimentViewMode,
  )
  const assetsOpenFolderId = useDemoStore((state) => state.assetsOpenFolderId)
  const notificationDrawerOpen = useDemoStore(
    (state) => state.notificationDrawerOpen,
  )
  const notificationFilter = useDemoStore((state) => state.notificationFilter)
  const notificationReadById = useDemoStore((state) => state.notificationReadById)
  const notificationClearedById = useDemoStore(
    (state) => state.notificationClearedById,
  )
  const notificationResolvedById = useDemoStore(
    (state) => state.notificationResolvedById,
  )
  const notificationCenterPreset = useDemoStore(
    (state) => state.notificationCenterPreset,
  )
  const notificationCenterSearchQuery = useDemoStore(
    (state) => state.notificationCenterSearchQuery,
  )
  const notificationCenterStatusFilter = useDemoStore(
    (state) => state.notificationCenterStatusFilter,
  )
  const notificationCenterBusinessStatusFilter = useDemoStore(
    (state) => state.notificationCenterBusinessStatusFilter,
  )
  const notificationCenterSourceFilter = useDemoStore(
    (state) => state.notificationCenterSourceFilter,
  )
  const notificationCenterTimeFilter = useDemoStore(
    (state) => state.notificationCenterTimeFilter,
  )
  const notificationCenterSelectedId = useDemoStore(
    (state) => state.notificationCenterSelectedId,
  )
  const notificationCenterSelectedIds = useDemoStore(
    (state) => state.notificationCenterSelectedIds,
  )
  const notificationCenterDetailOpen = useDemoStore(
    (state) => state.notificationCenterDetailOpen,
  )
  const statusMessage = useDemoStore((state) => state.statusMessage)
  const startNewThread = useDemoStore((state) => state.startNewThread)
  const selectThread = useDemoStore((state) => state.selectThread)
  const setSelectedProject = useDemoStore((state) => state.setSelectedProject)
  const setDraft = useDemoStore((state) => state.setDraft)
  const submitDraft = useDemoStore((state) => state.submitDraft)
  const createProject = useDemoStore((state) => state.createProject)
  const toggleProject = useDemoStore((state) => state.toggleProject)
  const togglePinned = useDemoStore((state) => state.togglePinned)
  const renameThread = useDemoStore((state) => state.renameThread)
  const archiveThread = useDemoStore((state) => state.archiveThread)
  const deleteThread = useDemoStore((state) => state.deleteThread)
  const runInspectorByThreadId = useDemoStore((state) => state.runInspectorByThreadId)
  const toggleRunInspector = useDemoStore((state) => state.toggleRunInspector)
  const toggleSidebarCollapsed = useDemoStore(
    (state) => state.toggleSidebarCollapsed,
  )
  const selectTopNav = useDemoStore((state) => state.selectTopNav)
  const setAssetsSelection = useDemoStore((state) => state.setAssetsSelection)
  const setAssetsFileViewMode = useDemoStore((state) => state.setAssetsFileViewMode)
  const setAssetsExperimentViewMode = useDemoStore(
    (state) => state.setAssetsExperimentViewMode,
  )
  const setAssetsOpenFolder = useDemoStore((state) => state.setAssetsOpenFolder)
  const openNotificationDrawer = useDemoStore(
    (state) => state.openNotificationDrawer,
  )
  const closeNotificationDrawer = useDemoStore(
    (state) => state.closeNotificationDrawer,
  )
  const setNotificationFilter = useDemoStore(
    (state) => state.setNotificationFilter,
  )
  const markNotificationRead = useDemoStore(
    (state) => state.markNotificationRead,
  )
  const markAllNotificationsRead = useDemoStore(
    (state) => state.markAllNotificationsRead,
  )
  const markNotificationCleared = useDemoStore(
    (state) => state.markNotificationCleared,
  )
  const openNotificationCenterPageFromDrawer = useDemoStore(
    (state) => state.openNotificationCenterPageFromDrawer,
  )
  const setNotificationCenterPreset = useDemoStore(
    (state) => state.setNotificationCenterPreset,
  )
  const setNotificationCenterSearchQuery = useDemoStore(
    (state) => state.setNotificationCenterSearchQuery,
  )
  const setNotificationCenterStatusFilter = useDemoStore(
    (state) => state.setNotificationCenterStatusFilter,
  )
  const setNotificationCenterBusinessStatusFilter = useDemoStore(
    (state) => state.setNotificationCenterBusinessStatusFilter,
  )
  const setNotificationCenterSourceFilter = useDemoStore(
    (state) => state.setNotificationCenterSourceFilter,
  )
  const setNotificationCenterTimeFilter = useDemoStore(
    (state) => state.setNotificationCenterTimeFilter,
  )
  const selectNotificationCenterItem = useDemoStore(
    (state) => state.selectNotificationCenterItem,
  )
  const setNotificationCenterSelectedId = useDemoStore(
    (state) => state.setNotificationCenterSelectedId,
  )
  const clearNotificationCenterSelection = useDemoStore(
    (state) => state.clearNotificationCenterSelection,
  )
  const showStatus = useDemoStore((state) => state.showStatus)
  const clearStatus = useDemoStore((state) => state.clearStatus)

  const selectedThreadEntry = getSelectedThreadEntry(projects, selectedThreadId)
  const selectedThread = selectedThreadEntry?.thread
  const selectedThreadTitle = selectedThread?.title
  const showThreadWorkspace = Boolean(selectedThreadEntry && !isDraftingNewThread)
  const runInspectorOpen = selectedThreadId
    ? Boolean(runInspectorByThreadId[selectedThreadId]?.open)
    : false
  const notifications = applyNotificationOverrides(notificationCenterSeedItems, {
    readById: notificationReadById,
    clearedById: notificationClearedById,
    resolvedById: notificationResolvedById,
  })
  const notificationActionRequiredCount =
    countActionRequiredNotifications(notifications)

  useEffect(() => {
    window.reset = resetPersistedDemoStore

    return () => {
      delete window.reset
    }
  }, [])

  useEffect(() => {
    function handlePopState() {
      setPathname(getInternalPathname(window.location.pathname, appBasePath))
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    if (!statusMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      clearStatus()
    }, 2000)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [clearStatus, statusMessage])

  useEffect(() => {
    if (isProductManagementRoute(pathname)) {
      return
    }

    if (pathname === '/') {
      if (skipNextRootRouteSyncRef.current) {
        skipNextRootRouteSyncRef.current = false
        return
      }

      const currentTopNav = useDemoStore.getState().activeTopNav

      if (
        currentTopNav === 'ApprovalCenter' ||
        currentTopNav === 'NotificationCenter'
      ) {
        return
      }

      startNewThread()
      selectTopNav('Workspace')
      return
    }

    const routeId = getThreadRouteId(pathname)

    if (!routeId) {
      return
    }

    const entry = findThreadByRouteId(projects, routeId)

    if (entry) {
      selectThread(entry.project.id, entry.thread.id)
      selectTopNav('Workspace')
      return
    }

    startNewThread()
    selectTopNav('Workspace')
    showStatus('Thread 不存在或已被删除')

    if (pathname !== '/') {
      window.history.replaceState(null, '', getExternalPath('/', appBasePath))
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [
    pathname,
    projects,
    selectThread,
    selectTopNav,
    showStatus,
    startNewThread,
  ])

  function handleNewThread() {
    startNewThread()
    navigateToPath('/')
  }

  function handleSelectThread(projectId: string, threadId: string) {
    selectThread(projectId, threadId)
    navigateToThreadPath(threadId)
  }

  function handlePromptSelect(prompt: string) {
    setActiveCapabilityTag(null)
    setDraft(prompt)

    window.requestAnimationFrame(() => {
      composerTextAreaRef.current?.focus()
    })
  }

  function handleCapabilitySelect(chip: CapabilityChip) {
    if (!chip.prompt) {
      return
    }

    setActiveCapabilityTag(chip)
    setDraft(chip.prompt)

    window.requestAnimationFrame(() => {
      composerTextAreaRef.current?.focus()
    })
  }

  function handleSubmit() {
    const wasDraftingNewThread = isDraftingNewThread
    submitDraft()

    if (wasDraftingNewThread) {
      const state = useDemoStore.getState()
      const entry = getSelectedThreadEntry(state.projects, state.selectedThreadId)

      if (entry) {
        navigateToPath(getThreadPath(entry.thread.routeId))
      }
    }
  }

  function handleStartProjectThread(projectId: string) {
    setSelectedProject(projectId)
    startNewThread()
    selectTopNav('Workspace')
  }

  function handleOpenProjectThread(projectId: string, threadId: string) {
    selectThread(projectId, threadId)
    selectTopNav('Workspace')
    navigateToThreadPath(threadId)
  }

  function handleOpenProjectAssets(
    section: AssetsSection,
    item: AssetMenuItemId,
    folderId: string | null,
  ) {
    setAssetsSelection(section, item)
    setAssetsOpenFolder(folderId)
    selectTopNav('Assets')
  }

  function navigateToPath(path: string) {
    const currentPath = getInternalPathname(
      window.location.pathname,
      appBasePath,
    )

    if (currentPath !== path) {
      window.history.pushState(null, '', getExternalPath(path, appBasePath))
    }

    setPathname(path)
  }

  function navigateToPathWithoutRootSync(path: string) {
    if (path === '/') {
      skipNextRootRouteSyncRef.current = true
    }

    navigateToPath(path)
  }

  function navigateToThreadPath(threadId: string) {
    const entry = getSelectedThreadEntry(projects, threadId)

    if (entry) {
      navigateToPath(getThreadPath(entry.thread.routeId))
    }
  }

  function handleArchiveThread(threadId: string) {
    archiveThread(threadId)

    if (threadId === selectedThreadId) {
      navigateToPath('/')
    }
  }

  function handleDeleteThread(threadId: string) {
    deleteThread(threadId)

    if (threadId === selectedThreadId) {
      navigateToPath('/')
    }
  }

  function handlePrimaryNav(item: TopNavItem) {
    if (item === 'Workspace') {
      selectTopNav(item)

      if (selectedThreadId && !isDraftingNewThread) {
        navigateToThreadPath(selectedThreadId)
      } else {
        navigateToPath('/')
      }

      return
    }

    if (item === 'Projects' || item === 'Assets' || item === 'Capabilities') {
      if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
        navigateToPathWithoutRootSync('/')
      }
      selectTopNav(item)
      return
    }

    showStatus('该模块尚未接入当前工作区')
  }

  function handleAccountMenuSelect(item: AccountMenuItem) {
    if (item === 'notification-center') {
      if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
        navigateToPathWithoutRootSync('/')
      }
      closeNotificationDrawer()
      selectTopNav('NotificationCenter')
      return
    }

    if (item === 'approval-center') {
      if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
        navigateToPathWithoutRootSync('/')
      }
      selectTopNav('ApprovalCenter')
      return
    }

    if (item === 'product-management-platform') {
      navigateToPath(productManagementPlatformPath)
      return
    }
  }

  function handleNotificationPrimaryAction(notification: NotificationItem) {
    const { target } = notification

    if (target.surface === 'approvalCenter') {
      if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
        navigateToPathWithoutRootSync('/')
      }
      selectTopNav('ApprovalCenter')
      showStatus('已打开审批中心')
      return
    }

    if (target.surface === 'thread' || target.surface === 'runInspector') {
      const entry = findThreadById(projects, target.threadId)

      if (!entry || entry.project.id !== target.projectId) {
        showStatus('相关 Thread 不存在或已被删除')
        return
      }

      selectThread(entry.project.id, entry.thread.id)
      selectTopNav('Workspace')
      navigateToPath(getThreadPath(entry.thread.routeId))

      if (target.surface === 'runInspector') {
        toggleRunInspector(entry.thread.id, true)
      }

      return
    }

    if (target.surface === 'asset') {
      const assetSelection = getAssetSelectionForNotification(target.assetSection)
      setAssetsSelection(assetSelection.section, assetSelection.item)
      setAssetsOpenFolder(null)
      selectTopNav('Assets')
      showStatus('已打开相关资产视图')
      return
    }

    showStatus('已打开管理后台详情')
  }

  function handleOpenFullNotificationCenter() {
    if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
      navigateToPathWithoutRootSync('/')
    }
    openNotificationCenterPageFromDrawer()
  }

  function handleBatchClearNotificationReminders(notificationIds: string[]) {
    notificationIds.forEach((notificationId) => {
      markNotificationCleared(notificationId)
    })
    clearNotificationCenterSelection()
  }

  function handleClearNotificationReminder(notificationId: string) {
    markNotificationCleared(notificationId)

    if (
      useDemoStore
        .getState()
        .notificationCenterSelectedIds.includes(notificationId)
    ) {
      setNotificationCenterSelectedId(notificationId, false)
    }
  }

  function handleNotificationCenterDetailOpenChange(open: boolean) {
    selectNotificationCenterItem(
      useDemoStore.getState().notificationCenterSelectedId,
      open,
    )
  }

  function handleNotificationCenterPrimaryAction(notification: NotificationItem) {
    markNotificationRead(notification.id)
    handleNotificationPrimaryAction(notification)
  }

  const isProductManagementCommodityListRoute =
    pathname === productManagementCommodityListPath
  const productManagementProductId = getProductManagementProductId(pathname)
  const productManagementCommodityId = getProductManagementCommodityId(pathname)
  const isProductManagementPlatformRoute =
    pathname === productManagementPlatformPath ||
    productManagementProductId !== null ||
    isProductManagementCommodityListRoute ||
    productManagementCommodityId !== null

  if (isProductManagementPlatformRoute) {
    return (
      <div className="agent-app">
        {statusMessage ? (
          <div className="status-toast" role="status" aria-live="polite">
            {statusMessage}
          </div>
        ) : null}
        <ProductManagementPlatformPage
          key={
            productManagementProductId ??
            productManagementCommodityId ??
            (isProductManagementCommodityListRoute
              ? 'product-management-commodities'
              : 'product-management-platform')
          }
          initialProductId={productManagementProductId}
          initialCommodityId={productManagementCommodityId}
          initialTab={
            isProductManagementCommodityListRoute || productManagementCommodityId
              ? 'commodity'
              : 'product'
          }
          onNotify={showStatus}
          onOpenProductList={() => navigateToPath(productManagementPlatformPath)}
          onOpenProduct={(productId) =>
            navigateToPath(`${productManagementProductPathPrefix}${productId}`)
          }
          onCloseProduct={() => navigateToPath(productManagementPlatformPath)}
          onOpenCommodityList={() => navigateToPath(productManagementCommodityListPath)}
          onOpenCommodity={(commodityId) =>
            navigateToPath(`${productManagementCommodityPathPrefix}${commodityId}`)
          }
          onCloseCommodity={() => navigateToPath(productManagementCommodityListPath)}
        />
      </div>
    )
  }

  return (
    <div className="agent-app">
      <TopNav
        activeItem={activeTopNav}
        onNavigate={handlePrimaryNav}
        notificationActionRequiredCount={notificationActionRequiredCount}
        onNotificationCenterOpen={openNotificationDrawer}
        onAccountMenuSelect={handleAccountMenuSelect}
      />
      {statusMessage ? (
        <div className="status-toast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
      {activeTopNav === 'NotificationCenter' ? (
        <NotificationCenterPage
          notifications={notifications}
          preset={notificationCenterPreset}
          search={notificationCenterSearchQuery}
          statusFilter={notificationCenterStatusFilter}
          businessStatusFilter={notificationCenterBusinessStatusFilter}
          sourceFilter={notificationCenterSourceFilter}
          timeFilter={notificationCenterTimeFilter}
          selectedNotificationId={notificationCenterSelectedId}
          selectedNotificationIds={notificationCenterSelectedIds}
          detailOpen={notificationCenterDetailOpen}
          onPresetChange={setNotificationCenterPreset}
          onSearchChange={setNotificationCenterSearchQuery}
          onStatusFilterChange={setNotificationCenterStatusFilter}
          onBusinessStatusFilterChange={setNotificationCenterBusinessStatusFilter}
          onSourceFilterChange={setNotificationCenterSourceFilter}
          onTimeFilterChange={setNotificationCenterTimeFilter}
          onSelectNotification={selectNotificationCenterItem}
          onToggleNotification={(notificationId, selected) =>
            setNotificationCenterSelectedId(notificationId, selected)
          }
          onDetailOpenChange={handleNotificationCenterDetailOpenChange}
          onMarkAllRead={markAllNotificationsRead}
          onBatchClearReminders={handleBatchClearNotificationReminders}
          onMarkRead={markNotificationRead}
          onClearReminder={handleClearNotificationReminder}
          onPrimaryAction={handleNotificationCenterPrimaryAction}
        />
      ) : activeTopNav === 'ApprovalCenter' ? (
        <ApprovalCenterPage onNotify={showStatus} />
      ) : activeTopNav === 'Assets' ? (
        <AssetsPage
          activeSection={assetsActiveSection}
          activeItem={assetsActiveItem}
          fileViewMode={assetsFileViewMode}
          experimentViewMode={assetsExperimentViewMode}
          openFolderId={assetsOpenFolderId}
          onSelectionChange={setAssetsSelection}
          onFileViewModeChange={setAssetsFileViewMode}
          onExperimentViewModeChange={setAssetsExperimentViewMode}
          onOpenFolderChange={setAssetsOpenFolder}
          onNotify={showStatus}
        />
      ) : activeTopNav === 'Projects' ? (
        <ProjectsPage
          projects={projects}
          onNotify={showStatus}
          onStartThread={handleStartProjectThread}
          onOpenThread={handleOpenProjectThread}
          onOpenAssets={handleOpenProjectAssets}
        />
      ) : activeTopNav === 'Capabilities' ? (
        <CapabilitiesPage onNotify={showStatus} />
      ) : (
        <div
          className={`agent-shell${
            sidebarCollapsed ? ' agent-shell--sidebar-collapsed' : ''
          }`}
        >
          <Sidebar
            projects={projects}
            selectedThreadId={selectedThreadId}
            searchOpen={searchOpen}
            searchQuery={searchQuery}
            expandedProjectIds={expandedProjectIds}
            sidebarCollapsed={sidebarCollapsed}
            onSidebarCollapsedChange={toggleSidebarCollapsed}
            onNewThread={handleNewThread}
            onSearchOpenChange={setSearchOpen}
            onSearchQueryChange={setSearchQuery}
            onToggleProject={toggleProject}
            onSelectThread={handleSelectThread}
            onTogglePinned={togglePinned}
            onRenameThread={renameThread}
            onArchiveThread={handleArchiveThread}
            onDeleteThread={handleDeleteThread}
            onNotify={showStatus}
          />
          <main
            className={`workspace-main${
              showThreadWorkspace ? ' workspace-main--thread' : ''
            }`}
            aria-label={
              selectedThreadTitle
                ? `Workspace for ${selectedThreadTitle}`
                : 'New conversation workspace'
            }
            data-drafting-new-thread={isDraftingNewThread}
          >
            {selectedThreadEntry && !isDraftingNewThread ? (
              <ThreadWorkspace
                thread={selectedThreadEntry.thread}
                projectName={selectedThreadEntry.project.name}
                draft={draft}
                onDraftChange={setDraft}
                onSubmit={handleSubmit}
                onRenameThread={renameThread}
                onArchiveThread={handleArchiveThread}
                onDeleteThread={handleDeleteThread}
                onNotify={showStatus}
                runInspectorOpen={runInspectorOpen}
                onRunInspectorOpenChange={(open) =>
                  toggleRunInspector(selectedThreadEntry.thread.id, open)
                }
                sidebarCollapsed={sidebarCollapsed}
                onSidebarCollapsedChange={toggleSidebarCollapsed}
              />
            ) : (
              <section className="workspace-inner">
                <Composer
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  isDraftingNewThread={isDraftingNewThread}
                  draft={draft}
                  textareaRef={composerTextAreaRef}
                  projectMenuOpen={projectMenuOpen}
                  activeCapabilityLabel={activeCapabilityTag?.label ?? null}
                  onDraftChange={setDraft}
                  onProjectMenuOpenChange={setProjectMenuOpen}
                  onProjectChange={setSelectedProject}
                  onCreateProject={createProject}
                  onRemoveCapability={() => setActiveCapabilityTag(null)}
                  onSubmit={handleSubmit}
                  onNotify={showStatus}
                />
                <UseCaseGrid
                  chips={capabilityChips}
                  useCases={useCases}
                  onCapabilitySelect={handleCapabilitySelect}
                  onPromptSelect={handlePromptSelect}
                  onNotify={showStatus}
                />
              </section>
            )}
          </main>
        </div>
      )}
      <NotificationCenterDrawer
        open={notificationDrawerOpen}
        notifications={notifications}
        filter={notificationFilter}
        onFilterChange={setNotificationFilter}
        onClose={closeNotificationDrawer}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onMarkResolved={markNotificationCleared}
        onPrimaryAction={handleNotificationPrimaryAction}
        onOpenFullPage={handleOpenFullNotificationCenter}
      />
    </div>
  )
}

function getAssetSelectionForNotification(
  assetSection: Extract<
    NotificationItem['target'],
    { surface: 'asset' }
  >['assetSection'],
): { section: AssetsSection; item: AssetMenuItemId } {
  if (assetSection === 'knowledgeBase') {
    return { section: 'knowledge', item: 'all-knowledge' }
  }

  if (assetSection === 'data') {
    return { section: 'data', item: 'datasets' }
  }

  if (assetSection === 'model') {
    return { section: 'model', item: 'xtrimo' }
  }

  if (assetSection === 'experiment') {
    return { section: 'experiment', item: 'execution' }
  }

  return { section: 'file', item: 'project-files' }
}

function getProductManagementProductId(pathname: string) {
  if (!pathname.startsWith(productManagementProductPathPrefix)) {
    return null
  }

  const productId = pathname.slice(productManagementProductPathPrefix.length)

  return productId ? decodeURIComponent(productId) : null
}

function getProductManagementCommodityId(pathname: string) {
  if (!pathname.startsWith(productManagementCommodityPathPrefix)) {
    return null
  }

  const commodityId = pathname.slice(productManagementCommodityPathPrefix.length)

  return commodityId ? decodeURIComponent(commodityId) : null
}

function getThreadRouteId(pathname: string) {
  const routeId =
    threadPathPattern.exec(pathname)?.[1] ??
    legacyThreadPathPattern.exec(pathname)?.[1] ??
    null

  return routeId && isThreadRouteId(routeId) ? routeId : null
}

function getThreadPath(routeId: string) {
  return `/c/${routeId}`
}

function isProductManagementRoute(pathname: string) {
  return (
    pathname === productManagementPlatformPath ||
    pathname.startsWith(`${productManagementPlatformPath}/`)
  )
}

function getSelectedThreadEntry(
  projects: DemoProject[],
  selectedThreadId: string | null,
) {
  if (!selectedThreadId) {
    return undefined
  }

  for (const project of projects) {
    const thread = project.threads.find(
      (currentThread) => currentThread.id === selectedThreadId,
    )

    if (thread) {
      return { project, thread }
    }
  }

  return undefined
}

export default App
