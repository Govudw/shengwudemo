import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  getExternalPath,
  getInternalPathname,
  normalizeAppBasePath,
} from './appRouting'
import ApprovalCenterPage from './components/approval/ApprovalCenterPage'
import AssetsPage from './components/assets/AssetsPage'
import BillingCenterPage from './components/billing-center/BillingCenterPage'
import Composer from './components/Composer'
import CapabilitiesPage from './components/CapabilitiesPage'
import HomeControlBar from './components/HomeControlBar'
import NotificationCenterDrawer from './components/notifications/NotificationCenterDrawer'
import NotificationCenterPage from './components/notifications/NotificationCenterPage'
import ProductManagementPlatformPage from './components/product-management/ProductManagementPlatformPage'
import RecommendationAssetDetailPage from './components/RecommendationAssetDetailPage'
import RecommendationSkillDetailPage from './components/RecommendationSkillDetailPage'
import ProjectsPage from './components/projects/ProjectsPage'
import RecommendationWorkbench from './components/RecommendationWorkbench'
import Sidebar from './components/Sidebar'
import TemplateSection from './components/TemplateSection'
import ThreadWorkspace from './components/ThreadWorkspace'
import TopNav from './components/TopNav'
import type { AccountMenuItem, TopNavItem } from './components/TopNav'
import { homeTemplates } from './data/homeTemplates'
import type { HomeTemplate } from './data/homeTemplates'
import {
  getHomeRecommendationAssetDetail,
  getHomeRecommendationFeedCards,
  getHomeRecommendationSkillDetail,
  HOME_RECOMMENDATION_FEED_MAX_COUNT,
  homeRecommendationInsights,
  homeRecommendationSignals,
} from './data/homeRecommendations'
import type {
  HomeRecommendationFeedCard,
  HomeInsightWidget,
  HomeSignalFilterKind,
  HomeSignalItem,
} from './data/homeRecommendations'
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
const assetDetailPathPattern = /^\/assets\/([a-z0-9-]+)\/?$/
const skillDetailPathPattern = /^\/capabilities\/([a-z0-9-]+)\/?$/
const appBasePath = normalizeAppBasePath(import.meta.env.BASE_URL)
const homeRecommendationFeedCards = getHomeRecommendationFeedCards(
  HOME_RECOMMENDATION_FEED_MAX_COUNT,
)

function App() {
  const [pathname, setPathname] = useState(() =>
    getInternalPathname(window.location.pathname, appBasePath),
  )
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [homeTemplatePage, setHomeTemplatePage] = useState(1)
  const [highlightedRecommendationTargetId, setHighlightedRecommendationTargetId] =
    useState<string | null>(null)
  const [selectedRecommendationSignalKind, setSelectedRecommendationSignalKind] =
    useState<HomeSignalFilterKind | null>(null)
  const composerTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const recommendationHighlightTimeoutRef = useRef<number | null>(null)
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
  const xtrimoRecommendationsExpanded = useDemoStore(
    (state) => state.xtrimoRecommendationsExpanded,
  )
  const approvalActiveSection = useDemoStore(
    (state) => state.approvalActiveSection,
  )
  const approvalInspectorOpen = useDemoStore(
    (state) => state.approvalInspectorOpen,
  )
  const approvalSelectedObjectId = useDemoStore(
    (state) => state.approvalSelectedObjectId,
  )
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
  const notificationCenterReadStatusFilter = useDemoStore(
    (state) => state.notificationCenterReadStatusFilter,
  )
  const notificationCenterBusinessStatusFilter = useDemoStore(
    (state) => state.notificationCenterBusinessStatusFilter,
  )
  const notificationCenterSourceFilter = useDemoStore(
    (state) => state.notificationCenterSourceFilter,
  )
  const notificationCenterTypeFilter = useDemoStore(
    (state) => state.notificationCenterTypeFilter,
  )
  const notificationCenterTimeFilter = useDemoStore(
    (state) => state.notificationCenterTimeFilter,
  )
  const notificationCenterAdvancedFiltersOpen = useDemoStore(
    (state) => state.notificationCenterAdvancedFiltersOpen,
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
  const billingCenterActiveTab = useDemoStore(
    (state) => state.billingCenterActiveTab,
  )
  const billingCenterRole = useDemoStore((state) => state.billingCenterRole)
  const billingCenterSelectedServiceId = useDemoStore(
    (state) => state.billingCenterSelectedServiceId,
  )
  const billingCenterSelectedBillLineId = useDemoStore(
    (state) => state.billingCenterSelectedBillLineId,
  )
  const billingCenterSelectedBudgetId = useDemoStore(
    (state) => state.billingCenterSelectedBudgetId,
  )
  const billingCenterInspectorOpen = useDemoStore(
    (state) => state.billingCenterInspectorOpen,
  )
  const billingCenterServiceSearch = useDemoStore(
    (state) => state.billingCenterServiceSearch,
  )
  const billingCenterBillSearch = useDemoStore(
    (state) => state.billingCenterBillSearch,
  )
  const billingCenterUsageSearch = useDemoStore(
    (state) => state.billingCenterUsageSearch,
  )
  const billingCenterBudgetSearch = useDemoStore(
    (state) => state.billingCenterBudgetSearch,
  )
  const homeMode = useDemoStore((state) => state.homeMode)
  const homeTemplateScopeFilter = useDemoStore(
    (state) => state.homeTemplateScopeFilter,
  )
  const homeTemplateDirectionFilter = useDemoStore(
    (state) => state.homeTemplateDirectionFilter,
  )
  const homeTemplateTypeFilter = useDemoStore(
    (state) => state.homeTemplateTypeFilter,
  )
  const homeTemplateSearchQuery = useDemoStore(
    (state) => state.homeTemplateSearchQuery,
  )
  const homeTemplateAdvancedFiltersOpen = useDemoStore(
    (state) => state.homeTemplateAdvancedFiltersOpen,
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
  const setXtrimoRecommendationsExpanded = useDemoStore(
    (state) => state.setXtrimoRecommendationsExpanded,
  )
  const setApprovalCenterSection = useDemoStore(
    (state) => state.setApprovalCenterSection,
  )
  const selectApprovalCenterObject = useDemoStore(
    (state) => state.selectApprovalCenterObject,
  )
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
  const setNotificationCenterReadStatusFilter = useDemoStore(
    (state) => state.setNotificationCenterReadStatusFilter,
  )
  const setNotificationCenterBusinessStatusFilter = useDemoStore(
    (state) => state.setNotificationCenterBusinessStatusFilter,
  )
  const setNotificationCenterSourceFilter = useDemoStore(
    (state) => state.setNotificationCenterSourceFilter,
  )
  const setNotificationCenterTypeFilter = useDemoStore(
    (state) => state.setNotificationCenterTypeFilter,
  )
  const setNotificationCenterTimeFilter = useDemoStore(
    (state) => state.setNotificationCenterTimeFilter,
  )
  const setNotificationCenterAdvancedFiltersOpen = useDemoStore(
    (state) => state.setNotificationCenterAdvancedFiltersOpen,
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
  const setBillingCenterTab = useDemoStore((state) => state.setBillingCenterTab)
  const setBillingCenterRole = useDemoStore((state) => state.setBillingCenterRole)
  const selectBillingCenterService = useDemoStore(
    (state) => state.selectBillingCenterService,
  )
  const selectBillingCenterBillLine = useDemoStore(
    (state) => state.selectBillingCenterBillLine,
  )
  const selectBillingCenterBudget = useDemoStore(
    (state) => state.selectBillingCenterBudget,
  )
  const setBillingCenterSearch = useDemoStore(
    (state) => state.setBillingCenterSearch,
  )
  const setHomeMode = useDemoStore((state) => state.setHomeMode)
  const setHomeTemplateScopeFilter = useDemoStore(
    (state) => state.setHomeTemplateScopeFilter,
  )
  const setHomeTemplateDirectionFilter = useDemoStore(
    (state) => state.setHomeTemplateDirectionFilter,
  )
  const setHomeTemplateTypeFilter = useDemoStore(
    (state) => state.setHomeTemplateTypeFilter,
  )
  const setHomeTemplateSearchQuery = useDemoStore(
    (state) => state.setHomeTemplateSearchQuery,
  )
  const setHomeTemplateAdvancedFiltersOpen = useDemoStore(
    (state) => state.setHomeTemplateAdvancedFiltersOpen,
  )
  const resetHomeTemplateFilters = useDemoStore(
    (state) => state.resetHomeTemplateFilters,
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
    return () => {
      if (recommendationHighlightTimeoutRef.current !== null) {
        window.clearTimeout(recommendationHighlightTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isProductManagementRoute(pathname)) {
      return
    }

    if (getAssetDetailId(pathname)) {
      selectTopNav('Assets')
      return
    }

    if (getSkillDetailId(pathname)) {
      selectTopNav('Capabilities')
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
        currentTopNav === 'NotificationCenter' ||
        currentTopNav === 'BillingCenter'
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
    showStatus('对话不存在或已被删除')

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

  function fillComposerWithPrompt(prompt: string, message = '已填入指令，可直接发送') {
    setDraft(prompt)
    showStatus(message)

    window.requestAnimationFrame(() => {
      const textarea = composerTextAreaRef.current

      if (!textarea) {
        return
      }

      textarea.focus()
      textarea.setSelectionRange(prompt.length, prompt.length)
      textarea.scrollIntoView?.({ block: 'nearest' })
    })
  }

  function appendComposerPrompt(prompt: string) {
    const currentDraft = useDemoStore.getState().draft
    const nextDraft = currentDraft.trim()
      ? `${currentDraft}\n\n${prompt}`
      : prompt

    setDraft(nextDraft)
    showStatus('已填入指令，可直接发送')

    window.requestAnimationFrame(() => {
      const textarea = composerTextAreaRef.current

      if (!textarea) {
        return
      }

      textarea.focus()
      textarea.setSelectionRange(nextDraft.length, nextDraft.length)
      textarea.scrollIntoView?.({ block: 'nearest' })
    })
  }

  function handleRecommendationPromptFill(item: HomeInsightWidget) {
    appendComposerPrompt(item.prompt)
  }

  function handleRecommendationFeedCardSelect(card: HomeRecommendationFeedCard) {
    if (card.kind === 'new-task') {
      fillComposerWithPrompt(card.prompt)
      return
    }

    if (card.kind === 'new-asset') {
      const assetId = card.target.assetId ?? card.target.relatedIds?.[0]

      if (!assetId) {
        fillComposerWithPrompt(card.prompt)
        return
      }

      selectTopNav('Assets')
      navigateToPath(`/assets/${assetId}`)
      showStatus('已打开资产详情')
      return
    }

    if (card.kind === 'new-skill') {
      const skillId = card.target.skillId ?? card.target.relatedIds?.find((id) =>
        id.startsWith('skill-'),
      )

      if (!skillId) {
        fillComposerWithPrompt(card.prompt)
        return
      }

      selectTopNav('Capabilities')
      navigateToPath(`/capabilities/${skillId}`)
      showStatus('已打开 Skill 详情')
      return
    }

    const threadId = card.target.threadId
    const entry = threadId
      ? findThreadById(projects, threadId) ?? findThreadByRouteId(projects, threadId)
      : null

    if (entry && (!card.target.projectId || entry.project.id === card.target.projectId)) {
      selectThread(entry.project.id, entry.thread.id)
      selectTopNav('Workspace')
      navigateToPath(getThreadPath(entry.thread.routeId))
      return
    }

    fillComposerWithPrompt(card.prompt, '相关对话不存在，已改为新任务草稿')
  }

  function handleRecommendationSignalSelect(signal: HomeSignalItem) {
    setSelectedRecommendationSignalKind((currentSignalKind) =>
      currentSignalKind === signal.filterKind ? null : signal.filterKind,
    )
    handleRecommendationTargetFocus(signal.targetId)
  }

  function handleRecommendationTargetFocus(targetId: string) {
    if (recommendationHighlightTimeoutRef.current !== null) {
      window.clearTimeout(recommendationHighlightTimeoutRef.current)
    }

    setHighlightedRecommendationTargetId(targetId)

    window.requestAnimationFrame(() => {
      const escapedTargetId =
        typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
          ? CSS.escape(targetId)
          : targetId.replace(/["\\]/g, '\\$&')
      const target = document.querySelector<HTMLElement>(
        `[data-recommendation-target="${escapedTargetId}"]`,
      )

      target?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
    })

    recommendationHighlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedRecommendationTargetId((currentTargetId) =>
        currentTargetId === targetId ? null : currentTargetId,
      )
      recommendationHighlightTimeoutRef.current = null
    }, 1600)
  }

  function handleHomeTemplateScopeFilterChange(
    filter: typeof homeTemplateScopeFilter,
  ) {
    setHomeTemplateScopeFilter(filter)
    setHomeTemplatePage(1)
  }

  function handleHomeTemplateDirectionFilterChange(
    filter: typeof homeTemplateDirectionFilter,
  ) {
    setHomeTemplateDirectionFilter(filter)
    setHomeTemplatePage(1)
  }

  function handleHomeTemplateTypeFilterChange(
    filter: typeof homeTemplateTypeFilter,
  ) {
    setHomeTemplateTypeFilter(filter)
    setHomeTemplatePage(1)
  }

  function handleHomeTemplateSearchQueryChange(query: string) {
    setHomeTemplateSearchQuery(query)
    setHomeTemplatePage(1)
  }

  function handleResetHomeTemplateFilters() {
    resetHomeTemplateFilters()
    setHomeTemplatePage(1)
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

    if (item === 'billing-center') {
      if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
        navigateToPathWithoutRootSync('/')
      }
      closeNotificationDrawer()
      selectTopNav('BillingCenter')
      return
    }

    if (item === 'product-management-platform') {
      clearNotificationCenterSelection()
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
        showStatus('相关对话不存在或已被删除')
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

  function handleOpenFullNotificationCenter(notificationId?: string) {
    if (getInternalPathname(window.location.pathname, appBasePath) !== '/') {
      navigateToPathWithoutRootSync('/')
    }
    openNotificationCenterPageFromDrawer()

    if (notificationId) {
      selectNotificationCenterItem(notificationId, true)
    }
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

  function handleSelectBillingCenterService(
    serviceId: string | null,
    inspectorOpen?: boolean,
  ) {
    selectBillingCenterBillLine(null, false)
    selectBillingCenterBudget(null, false)
    selectBillingCenterService(serviceId, inspectorOpen)
  }

  function handleSelectBillingCenterBillLine(
    lineId: string | null,
    inspectorOpen?: boolean,
  ) {
    selectBillingCenterService(null, false)
    selectBillingCenterBudget(null, false)
    selectBillingCenterBillLine(lineId, inspectorOpen)
  }

  function handleSelectBillingCenterBudget(
    budgetId: string | null,
    inspectorOpen?: boolean,
  ) {
    selectBillingCenterService(null, false)
    selectBillingCenterBillLine(null, false)
    selectBillingCenterBudget(budgetId, inspectorOpen)
  }

  const isProductManagementCommodityListRoute =
    pathname === productManagementCommodityListPath
  const productManagementProductId = getProductManagementProductId(pathname)
  const productManagementCommodityId = getProductManagementCommodityId(pathname)
  const recommendationAssetDetailId = getAssetDetailId(pathname)
  const recommendationSkillDetailId = getSkillDetailId(pathname)
  const recommendationAssetDetail = recommendationAssetDetailId
    ? getHomeRecommendationAssetDetail(recommendationAssetDetailId)
    : undefined
  const recommendationSkillDetail = recommendationSkillDetailId
    ? getHomeRecommendationSkillDetail(recommendationSkillDetailId)
    : undefined
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
      {recommendationAssetDetailId ? (
        recommendationAssetDetail ? (
          <RecommendationAssetDetailPage
            asset={recommendationAssetDetail}
            onBack={() => {
              selectTopNav('Assets')
              navigateToPathWithoutRootSync('/')
            }}
          />
        ) : (
          <RecommendationMissingDetailPage
            label="资产"
            onBack={() => {
              selectTopNav('Assets')
              navigateToPathWithoutRootSync('/')
            }}
          />
        )
      ) : recommendationSkillDetailId ? (
        recommendationSkillDetail ? (
          <RecommendationSkillDetailPage
            skill={recommendationSkillDetail}
            onBack={() => {
              selectTopNav('Capabilities')
              navigateToPathWithoutRootSync('/')
            }}
          />
        ) : (
          <RecommendationMissingDetailPage
            label="Skill"
            onBack={() => {
              selectTopNav('Capabilities')
              navigateToPathWithoutRootSync('/')
            }}
          />
        )
      ) : activeTopNav === 'NotificationCenter' ? (
        <NotificationCenterPage
          notifications={notifications}
          preset={notificationCenterPreset}
          search={notificationCenterSearchQuery}
          statusFilter={notificationCenterStatusFilter}
          readStatusFilter={notificationCenterReadStatusFilter}
          businessStatusFilter={notificationCenterBusinessStatusFilter}
          sourceFilter={notificationCenterSourceFilter}
          typeFilter={notificationCenterTypeFilter}
          timeFilter={notificationCenterTimeFilter}
          advancedFiltersOpen={notificationCenterAdvancedFiltersOpen}
          selectedNotificationId={notificationCenterSelectedId}
          selectedNotificationIds={notificationCenterSelectedIds}
          detailOpen={notificationCenterDetailOpen}
          onPresetChange={setNotificationCenterPreset}
          onSearchChange={setNotificationCenterSearchQuery}
          onStatusFilterChange={setNotificationCenterStatusFilter}
          onReadStatusFilterChange={setNotificationCenterReadStatusFilter}
          onBusinessStatusFilterChange={setNotificationCenterBusinessStatusFilter}
          onSourceFilterChange={setNotificationCenterSourceFilter}
          onTypeFilterChange={setNotificationCenterTypeFilter}
          onTimeFilterChange={setNotificationCenterTimeFilter}
          onAdvancedFiltersOpenChange={setNotificationCenterAdvancedFiltersOpen}
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
        <ApprovalCenterPage
          activeSection={approvalActiveSection}
          inspectorOpen={approvalInspectorOpen}
          selectedObjectId={approvalSelectedObjectId}
          onSectionChange={setApprovalCenterSection}
          onSelectObject={selectApprovalCenterObject}
          onNotify={showStatus}
        />
      ) : activeTopNav === 'BillingCenter' ? (
        <BillingCenterPage
          activeTab={billingCenterActiveTab}
          role={billingCenterRole}
          selectedServiceId={billingCenterSelectedServiceId}
          selectedBillLineId={billingCenterSelectedBillLineId}
          selectedBudgetId={billingCenterSelectedBudgetId}
          inspectorOpen={billingCenterInspectorOpen}
          serviceSearch={billingCenterServiceSearch}
          billSearch={billingCenterBillSearch}
          usageSearch={billingCenterUsageSearch}
          budgetSearch={billingCenterBudgetSearch}
          onTabChange={setBillingCenterTab}
          onRoleChange={setBillingCenterRole}
          onSelectService={handleSelectBillingCenterService}
          onSelectBillLine={handleSelectBillingCenterBillLine}
          onSelectBudget={handleSelectBillingCenterBudget}
          onSearchChange={setBillingCenterSearch}
          onNotify={showStatus}
        />
      ) : activeTopNav === 'Assets' ? (
        <AssetsPage
          activeSection={assetsActiveSection}
          activeItem={assetsActiveItem}
          fileViewMode={assetsFileViewMode}
          experimentViewMode={assetsExperimentViewMode}
          openFolderId={assetsOpenFolderId}
          xtrimoRecommendationsExpanded={xtrimoRecommendationsExpanded}
          onSelectionChange={setAssetsSelection}
          onFileViewModeChange={setAssetsFileViewMode}
          onExperimentViewModeChange={setAssetsExperimentViewMode}
          onOpenFolderChange={setAssetsOpenFolder}
          onXtrimoRecommendationsExpandedChange={setXtrimoRecommendationsExpanded}
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
                <section className="home-surface" aria-label="首页工作区">
                  <HomeControlBar
                    homeMode={homeMode}
                    signals={homeRecommendationSignals}
                    selectedSignalKind={selectedRecommendationSignalKind}
                    scope={homeTemplateScopeFilter}
                    direction={homeTemplateDirectionFilter}
                    type={homeTemplateTypeFilter}
                    query={homeTemplateSearchQuery}
                    advancedFiltersOpen={homeTemplateAdvancedFiltersOpen}
                    onHomeModeChange={setHomeMode}
                    onSignalSelect={handleRecommendationSignalSelect}
                    onScopeChange={handleHomeTemplateScopeFilterChange}
                    onDirectionChange={handleHomeTemplateDirectionFilterChange}
                    onTypeChange={handleHomeTemplateTypeFilterChange}
                    onQueryChange={handleHomeTemplateSearchQueryChange}
                    onAdvancedFiltersOpenChange={
                      setHomeTemplateAdvancedFiltersOpen
                    }
                    onResetFilters={handleResetHomeTemplateFilters}
                  />

                  {homeMode === 'recommendations' ? (
                    <RecommendationWorkbench
                      key={selectedRecommendationSignalKind ?? 'all-recommendations'}
                      insights={homeRecommendationInsights}
                      feedCards={homeRecommendationFeedCards}
                      highlightedTargetId={highlightedRecommendationTargetId}
                      selectedSignalKind={selectedRecommendationSignalKind}
                      onPromptFill={handleRecommendationPromptFill}
                      onTargetFocus={handleRecommendationTargetFocus}
                      onFeedCardSelect={handleRecommendationFeedCardSelect}
                    />
                  ) : (
                    <TemplateSection
                      templates={homeTemplates}
                      filters={{
                        scope: homeTemplateScopeFilter,
                        direction: homeTemplateDirectionFilter,
                        type: homeTemplateTypeFilter,
                      }}
                      query={homeTemplateSearchQuery}
                      page={homeTemplatePage}
                      onPageChange={setHomeTemplatePage}
                      onTemplateSelect={handleTemplateSelect}
                    />
                  )}
                </section>
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

function getAssetDetailId(pathname: string) {
  const assetId = assetDetailPathPattern.exec(pathname)?.[1] ?? null

  return assetId ? decodeURIComponent(assetId) : null
}

function getSkillDetailId(pathname: string) {
  const skillId = skillDetailPathPattern.exec(pathname)?.[1] ?? null

  return skillId ? decodeURIComponent(skillId) : null
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

function RecommendationMissingDetailPage({
  label,
  onBack,
}: {
  label: string
  onBack: () => void
}) {
  return (
    <main className="recommendation-detail-page recommendation-detail-page--missing">
      <section className="recommendation-detail-hero">
        <button
          type="button"
          className="recommendation-detail-back"
          onClick={onBack}
        >
          返回
        </button>
        <div className="recommendation-detail-hero__copy">
          <p>{label} 详情</p>
          <h1>{label}不存在或已被删除</h1>
          <span>这个 Demo 路由保留了直达入口，当前 mock 数据里没有对应记录。</span>
        </div>
      </section>
    </main>
  )
}

export default App
