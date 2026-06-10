# Capabilities Management Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the demo Capabilities management page with Pipelines, Skills, MCP Servers, and Plugins, including Codex-style Skills list/detail behavior.

**Architecture:** Keep the feature as front-end demo state. `App` owns top-level page selection and status toast. `TopNav` becomes controlled by `App`. New mock data lives in `src/data/mockCapabilities.ts`; new UI lives in `src/components/CapabilitiesPage.tsx`; styles are appended to `src/App.css`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, happy-dom, existing CSS variables and hand-rolled icon set.

---

### Task 1: Top-Level Navigation

**Files:**
- Modify: `src/components/TopNav.tsx`
- Modify: `src/components/TopNav.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing TopNav controlled-state test**

Add tests that render `TopNav` with `activeItem="Capabilities"` and assert `Capabilities` has `aria-current="page"`, `Workspace` does not, and clicking `Workspace` calls `onNavigate('Workspace')`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/TopNav.test.tsx`
Expected: FAIL because `TopNav` does not accept `activeItem` or `onNavigate`.

- [ ] **Step 3: Implement controlled TopNav**

Make `TopNav` accept:

```ts
type TopNavItem = 'Workspace' | 'Projects' | 'Assets' | 'Capabilities'

type TopNavProps = {
  activeItem: TopNavItem
  onNavigate: (item: TopNavItem) => void
  onNotify: (message: string) => void
}
```

`Workspace` and `Capabilities` call `onNavigate`; `Projects` and `Assets` continue to show demo toast.

- [ ] **Step 4: Wire App top-level page state**

Add `const [activeTopNavItem, setActiveTopNavItem] = useState<TopNavItem>('Workspace')` in `App`. Pass it to `TopNav`. Render the existing Workspace shell only when `activeTopNavItem === 'Workspace'`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/TopNav.test.tsx`
Expected: PASS.

### Task 2: Mock Capability Data

**Files:**
- Create: `src/data/mockCapabilities.ts`

- [ ] **Step 1: Create typed mock data**

Define `CapabilityEntryKind`, `CapabilityStatus`, `CapabilitySource`, `ProviderConnectionStatus`, and `MockCapabilityEntry` matching the spec. Include `enabledForMainAgent?: boolean`, `steps?: string[]`, `instructions?: string[]`, `triggers?: string[]`, `examples?: string[]`, `tools?: string[]`, `resources?: string[]`, `connectionStatus?: ProviderConnectionStatus`, and `placeholderState?: string`.

- [ ] **Step 2: Add representative entries**

Add at least:

- 5 Pipelines, including `EGFR Antibody Affinity Optimization`
- 6 Skills, including `Operate Protein Design`, `Operate Wet-lab Experiments`, `Analyze Experimental Data`
- 4 MCP Servers, including `BioMap Structure Tools`
- 3 Plugins, marked placeholder / preview

- [ ] **Step 3: Keep data display-ready**

Every entry must have name, description, status, source, owner, version, tags, updatedAt, metrics, interface, sections, recentActivity.

### Task 3: Capabilities Page Tests

**Files:**
- Create: `src/components/CapabilitiesPage.test.tsx`
- Create: `src/components/CapabilitiesPage.tsx`

- [ ] **Step 1: Write failing render tests**

Tests should mount `CapabilitiesPage` with `onNotify={vi.fn()}` and assert:

- default view shows `Pipelines`
- `EGFR Antibody Affinity Optimization` appears
- `Plugins` left nav shows `Preview`

- [ ] **Step 2: Write failing interaction tests**

Assert:

- clicking `Skills` shows a Codex-style Skills list and `Operate Protein Design`
- clicking a Skill row opens a dialog with `Instructions`, `Triggers`, `Examples`
- clicking the Skill enabled switch changes its accessible checked state without opening the dialog
- clicking `Build Pipeline with Agent` calls `onNotify`

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run src/components/CapabilitiesPage.test.tsx`
Expected: FAIL because the component is not implemented yet.

### Task 4: Capabilities Page Component

**Files:**
- Modify: `src/components/CapabilitiesPage.tsx`
- Modify: `src/components/icons.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Implement page shell**

Render left type nav, main toolbar, search, source/status filters, and content area. Use local state for selected type, selected entry, search query, filters, Skill modal, and `enabledById`.

- [ ] **Step 2: Implement Pipelines/MCP/Plugins detail flow**

For these types, show a middle list and right detail panel. Detail sections: Overview, Interface, Steps / Tools, Usage, Access, Recent activity.

- [ ] **Step 3: Implement Codex-style Skills flow**

For Skills, render a wide list with icon, name, description, source label, and a switch with `role="switch"`. Row click opens a modal. Switch click stops propagation.

- [ ] **Step 4: Implement Skill modal**

Show Skill title, `Skill` type label, enabled switch, instruction preview, Triggers, Examples, and footer actions. Preset Skills must not show `Remove`.

- [ ] **Step 5: Add needed icons**

Reuse existing icons where possible. Add simple `BoxIcon` / `PlugIcon` / `WorkflowIcon` only if existing icons cannot cover the UI.

- [ ] **Step 6: Wire `App`**

Import `CapabilitiesPage`; render it when top nav item is `Capabilities`; keep Workspace behavior unchanged otherwise.

- [ ] **Step 7: Run focused tests**

Run: `npx vitest run src/components/TopNav.test.tsx src/components/CapabilitiesPage.test.tsx`
Expected: PASS.

### Task 5: Styling and Responsive Behavior

**Files:**
- Modify: `src/App.css`

- [ ] **Step 1: Add Capabilities layout styles**

Add classes prefixed with `capabilities-`. Pipelines/MCP/Plugins use three columns. Skills use left nav plus wide list and modal.

- [ ] **Step 2: Add controls and chips**

Style type nav, badges, toolbar, search, select filters, row hover, active row, status/source chips, switches, and modal.

- [ ] **Step 3: Add responsive rules**

At medium width, collapse right detail into an overlay-style panel or stack safely. Skills modal width should be `min(820px, calc(100vw - 48px))`. Ensure text truncates or wraps without overlap.

- [ ] **Step 4: Run build**

Run: `npm run build`
Expected: TypeScript and Vite build pass.

### Task 6: Final Verification

**Files:**
- Verify all touched files

- [ ] **Step 1: Run full tests**

Run: `npm test`
Expected: all Vitest tests pass.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no ESLint errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 4: Browser check**

Open the worktree dev server and verify:

- top nav `Capabilities` opens the management page
- default tab is Pipelines
- Skills list looks Codex-like
- Skill row opens detail modal
- Skill switch toggles without opening modal
- Plugin nav shows Preview placeholder
