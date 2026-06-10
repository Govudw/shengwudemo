# Projects Management Implementation Plan

## Goal

Implement the `Projects` top-nav menu as a full-page project management experience in the current worktree.

The page must use the agreed product shape:

- `Projects` is a first-class top-nav destination.
- No left-side Projects navigation.
- The page homepage is the project list.
- The list keeps `全部`, `我的收藏`, and `回收站`; it has no draft concept.
- Clicking a project opens an in-page detail view, with no route change.
- The detail view can jump into `Workspace` for a selected project/thread and into the existing `Assets` workbench for asset summaries.

## Contract

### Top Navigation

```ts
type ActiveTopNav = 'Workspace' | 'Projects' | 'Assets' | 'Capabilities'
```

`Projects` must be accepted by the store, hydrated safely from persistence, and shown as the active top-nav item.

### Project Management Data

Create a separate project-management data layer instead of overloading the existing workspace project shape:

```ts
type ProjectStatus = 'active' | 'atRisk' | 'completed' | 'archived'

type ProjectManagementRecord = {
  projectId: string
  name: string
  description: string
  tags: string[]
  status: ProjectStatus
  responsibleMember: ProjectMember
  readOnlyPermissionMembers: ProjectMember[]
  editPermissionMembers: ProjectMember[]
  favoritedByCurrentUser: boolean
  trashed: boolean
  createdAt: number
  lastActivityAt: number
  threadCount: number
  assetSummary: ProjectAssetSummary
  contextSummary: ProjectContextSummary
}
```

Rules:

- `responsibleMember` is the only owner-like member.
- `readOnlyPermissionMembers` excludes the responsible member and edit-permission members.
- `editPermissionMembers` excludes the responsible member.
- `lastActivityAt` is project last activity, normally derived from project threads when available.
- `assetSummary` is a Project Asset Summary, not an Assets clone.

### Projects Page

Create a page component:

```tsx
<ProjectsPage
  projects={projects}
  onNotify={showStatus}
  onStartThread={handleStartProjectThread}
  onOpenThread={handleOpenProjectThread}
  onOpenAssets={handleOpenProjectAssets}
/>
```

Local state is acceptable for:

- Active project tab.
- Search and filters.
- List/detail view.
- Detail tab.

### App Wiring

Use existing store actions:

```ts
function handleStartProjectThread(projectId: string) {
  setSelectedProject(projectId)
  startNewThread()
  selectTopNav('Workspace')
}

function handleOpenProjectThread(projectId: string, threadId: string) {
  selectThread(projectId, threadId)
  selectTopNav('Workspace')
}

function handleOpenProjectAssets(section, item, folderId) {
  setAssetsSelection(section, item)
  setAssetsOpenFolder(folderId)
  selectTopNav('Assets')
}
```

For Project Files, `folderId` should be `project-${projectId}` when that folder exists.

## TDD Steps

1. Add store and persistence red tests for `Projects` as an accepted top-nav state.
2. Add app-level red tests for opening the Projects page, tabs, list columns, detail tabs, new thread handoff, related conversation handoff, and asset summary handoff.
3. Implement `Projects` in the top-nav/store state.
4. Implement the project-management records and Projects page.
5. Wire `ProjectsPage` into `App`.
6. Add responsive, dense management-page CSS under a `projects-*` namespace.
7. Run targeted tests, full test suite, lint, build, and browser verification.

## Review Points

- Ensure no Projects left sidebar exists.
- Ensure no `草稿` label or draft tab exists on the Projects page.
- Ensure the detail view stays in the same full page.
- Ensure `Workspace` handoff preserves `selectedProjectId` and starts a new draft.
- Ensure related thread handoff selects the thread rather than only showing a toast.
- Ensure `Project File` asset summary opens Assets > 文件 > 项目文件 with the project folder.
