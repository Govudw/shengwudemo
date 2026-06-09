import { useEffect, useRef, useState } from 'react'
import './App.css'
import AssetsPage from './components/assets/AssetsPage'
import Composer from './components/Composer'
import CapabilitiesPage from './components/CapabilitiesPage'
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
  resetPersistedDemoStore,
  useDemoStore,
} from './store/useDemoStore'
import type {
  AssetMenuItemId,
  AssetsSection,
  DemoProject,
} from './store/demoStoreLogic'

const productManagementPlatformPath = '/product-management-platform'
const productManagementProductPathPrefix = `${productManagementPlatformPath}/products/`
const productManagementCommodityListPath = `${productManagementPlatformPath}/commodities`
const productManagementCommodityPathPrefix = `${productManagementCommodityListPath}/`

function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [activeCapabilityTag, setActiveCapabilityTag] =
    useState<CapabilityChip | null>(null)
  const composerTextAreaRef = useRef<HTMLTextAreaElement>(null)
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
      setPathname(window.location.pathname)
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

  function handleNewThread() {
    startNewThread()
  }

  function handleSelectThread(projectId: string, threadId: string) {
    selectThread(projectId, threadId)
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
    submitDraft()
  }

  function handleStartProjectThread(projectId: string) {
    setSelectedProject(projectId)
    startNewThread()
    selectTopNav('Workspace')
  }

  function handleOpenProjectThread(projectId: string, threadId: string) {
    selectThread(projectId, threadId)
    selectTopNav('Workspace')
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
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }

    setPathname(path)
  }

  function handlePrimaryNav(item: TopNavItem) {
    if (
      item === 'Workspace' ||
      item === 'Projects' ||
      item === 'Assets' ||
      item === 'Capabilities'
    ) {
      selectTopNav(item)
      return
    }

    showStatus('该模块尚未接入当前工作区')
  }

  function handleAccountMenuSelect(item: AccountMenuItem) {
    if (item === 'product-management-platform') {
      navigateToPath(productManagementPlatformPath)
      return
    }

    const unavailableMessages: Record<Exclude<AccountMenuItem, 'product-management-platform'>, string> = {
      'system-settings': '系统设置尚未接入当前工作区',
      'billing-center': '费用中心尚未接入当前工作区',
      'permissions-security': '权限与安全尚未接入当前工作区',
    }

    showStatus(unavailableMessages[item])
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
      {activeTopNav === 'Assets' ? (
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
            onArchiveThread={archiveThread}
            onDeleteThread={deleteThread}
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
                onArchiveThread={archiveThread}
                onDeleteThread={deleteThread}
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
