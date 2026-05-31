import { useEffect, useRef, useState } from 'react'
import './App.css'
import Composer from './components/Composer'
import CapabilitiesPage from './components/CapabilitiesPage'
import Sidebar from './components/Sidebar'
import ThreadWorkspace from './components/ThreadWorkspace'
import TopNav from './components/TopNav'
import type { TopNavItem } from './components/TopNav'
import UseCaseGrid from './components/UseCaseGrid'
import { capabilityChips, useCases } from './data/mockData'
import {
  resetPersistedDemoStore,
  useDemoStore,
} from './store/useDemoStore'
import type { DemoProject } from './store/demoStoreLogic'

function App() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [activeTopNavItem, setActiveTopNavItem] =
    useState<TopNavItem>('Workspace')
  const composerTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const projects = useDemoStore((state) => state.projects)
  const selectedProjectId = useDemoStore((state) => state.selectedProjectId)
  const selectedThreadId = useDemoStore((state) => state.selectedThreadId)
  const isDraftingNewThread = useDemoStore((state) => state.isDraftingNewThread)
  const draft = useDemoStore((state) => state.draft)
  const expandedProjectIds = useDemoStore((state) => state.expandedProjectIds)
  const sidebarCollapsed = useDemoStore((state) => state.sidebarCollapsed)
  const statusMessage = useDemoStore((state) => state.statusMessage)
  const startNewThread = useDemoStore((state) => state.startNewThread)
  const selectThread = useDemoStore((state) => state.selectThread)
  const setSelectedProject = useDemoStore((state) => state.setSelectedProject)
  const setDraft = useDemoStore((state) => state.setDraft)
  const submitDraft = useDemoStore((state) => state.submitDraft)
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
    setDraft(prompt)

    window.requestAnimationFrame(() => {
      composerTextAreaRef.current?.focus()
    })
  }

  function handleSubmit() {
    submitDraft()
  }

  return (
    <div className="agent-app">
      <TopNav
        activeItem={activeTopNavItem}
        onNavigate={setActiveTopNavItem}
        onNotify={showStatus}
      />
      {statusMessage ? (
        <div className="status-toast" role="status" aria-live="polite">
          {statusMessage}
        </div>
      ) : null}
      {activeTopNavItem === 'Workspace' ? (
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
                  onSubmit={handleSubmit}
                  onNotify={showStatus}
                />
                <UseCaseGrid
                  chips={capabilityChips}
                  useCases={useCases}
                  onPromptSelect={handlePromptSelect}
                  onNotify={showStatus}
                />
              </section>
            )}
          </main>
        </div>
      ) : (
        <CapabilitiesPage onNotify={showStatus} />
      )}
    </div>
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
