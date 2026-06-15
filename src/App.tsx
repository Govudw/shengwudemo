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
import ProductManagementPlatformPage from './components/product-management/ProductManagementPlatformPage'
import ProjectsPage from './components/projects/ProjectsPage'
import Sidebar from './components/Sidebar'
import TemplateSection from './components/TemplateSection'
import ThreadWorkspace from './components/ThreadWorkspace'
import TopNav from './components/TopNav'
import type { AccountMenuItem, TopNavItem } from './components/TopNav'
import { homeTemplates } from './data/homeTemplates'
import type { HomeTemplate } from './data/homeTemplates'
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
  const showStatus = useDemoStore((state) => state.showStatus)
  const clearStatus = useDemoStore((state) => state.clearStatus)

  const selectedThreadEntry = getSelectedThreadEntry(projects, selectedThreadId)
  const selectedThread = selectedThreadEntry?.thread
  const selectedThreadTitle = selectedThread?.title
  const showThreadWorkspace = Boolean(selectedThreadEntry && !isDraftingNewThread)
  const runInspectorOpen = selectedThreadId
    ? Boolean(runInspectorByThreadId[selectedThreadId]?.open)
    : false

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

      if (useDemoStore.getState().activeTopNav === 'ApprovalCenter') {
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

  function handleTemplateSelect(template: HomeTemplate) {
    setDraft(template.prompt)

    window.requestAnimationFrame(() => {
      const textarea = composerTextAreaRef.current

      if (!textarea) {
        return
      }

      textarea.focus()
      textarea.setSelectionRange(template.prompt.length, template.prompt.length)
      textarea.scrollIntoView?.({ block: 'nearest' })
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
      showStatus('通知中心将在后续 Demo 中展开')
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
        onNotify={showStatus}
        onAccountMenuSelect={handleAccountMenuSelect}
      />
      {statusMessage ? (
        <div className="status-toast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
      {activeTopNav === 'ApprovalCenter' ? (
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
                  onDraftChange={setDraft}
                  onProjectMenuOpenChange={setProjectMenuOpen}
                  onProjectChange={setSelectedProject}
                  onCreateProject={createProject}
                  onSubmit={handleSubmit}
                  onNotify={showStatus}
                />
                <TemplateSection
                  templates={homeTemplates}
                  onTemplateSelect={handleTemplateSelect}
                />
              </section>
            )}
          </main>
        </div>
      )}
    </div>
  )
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
