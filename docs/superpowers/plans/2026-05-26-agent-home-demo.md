# BioMap Agent Home Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first runnable BioMap Agent homepage demo as a React + TypeScript light-interaction Agent home screen.

**Architecture:** Replace the Vite starter UI with a focused app shell split into top navigation, sidebar, composer, and use-case grid components. Keep all data local in `mockData.ts`, use React state for lightweight interactions, and use CSS for the high-fidelity desktop layout.

**Tech Stack:** Vite, React 19, TypeScript, CSS, inline SVG icons, `sips` for cropping the logo asset from the approved mockup.

---

## File Structure

- Create `src/assets/biomap-agent-logo.png`: cropped logo lockup from the approved mockup.
- Create `src/data/mockData.ts`: typed mock projects, threads, chips, and use-case cards.
- Create `src/components/icons.tsx`: shared inline SVG icon components.
- Create `src/components/TopNav.tsx`: logo, nav tabs, Notification Center bell, user area.
- Create `src/components/Sidebar.tsx`: new thread, search, project folders, thread rows, thread tools.
- Create `src/components/Composer.tsx`: heading, textarea, send button, Add Context button, project selector menu.
- Create `src/components/UseCaseGrid.tsx`: capability chips and fixed three-column card grid.
- Modify `src/App.tsx`: compose components and own all homepage state.
- Replace `src/App.css`: full page layout and component styles.
- Replace `src/index.css`: global reset, color variables, font smoothing, root sizing.
- Leave `src/main.tsx`, `package.json`, and Vite config unchanged.

---

### Task 1: Create the Logo Asset

**Files:**
- Create: `src/assets/biomap-agent-logo.png`

- [ ] **Step 1: Crop the approved mockup logo**

Run:

```bash
sips --cropToHeightWidth 72 260 --cropOffset 0 20 /Users/songxuzhengjun/.codex/generated_images/019e629c-d0a4-7c11-970a-828830337b55/ig_016db41e1770c64a016a1533c9bca0819a876f4a4da0b42c41.png --out src/assets/biomap-agent-logo.png
```

Expected: `src/assets/biomap-agent-logo.png` exists and contains the top-left logo lockup area from the approved mockup.

- [ ] **Step 2: Inspect the crop**

Run:

```bash
sips -g pixelWidth -g pixelHeight src/assets/biomap-agent-logo.png
```

Expected: `pixelWidth: 260` and `pixelHeight: 72`.

---

### Task 2: Add Mock Data

**Files:**
- Create: `src/data/mockData.ts`

- [ ] **Step 1: Create local typed demo data**

Create `src/data/mockData.ts` with:

```ts
export type Thread = {
  id: string
  title: string
  lastActivity: string
}

export type Project = {
  id: string
  name: string
  threads: Thread[]
}

export type CapabilityChip = {
  id: string
  label: string
  prompt?: string
}

export type UseCaseCard = {
  id: string
  icon: 'target' | 'flask' | 'database' | 'brain' | 'report' | 'package'
  tone: 'cyan' | 'blue' | 'teal' | 'violet' | 'amber'
  title: string
  input: string
  output: string
  prompt: string
}

export const projects: Project[] = [
  {
    id: 'antibody-optimization',
    name: 'Antibody Optimization',
    threads: [
      { id: 'egfr-affinity', title: 'EGFR 抗体亲和力优化', lastActivity: '2 分钟' },
      { id: 'cd3-bispecific', title: 'CD3 双抗序列优化分析', lastActivity: '1 小时' },
      { id: 'affinity-maturation', title: '亲和力成熟实验方案', lastActivity: '昨天' },
    ],
  },
  {
    id: 'enzyme-discovery',
    name: 'Enzyme Discovery',
    threads: [
      { id: 'enzyme-family', title: '新型噬酸酶家族调研', lastActivity: '3 小时' },
      { id: 'screening-plan', title: '酶活性筛选方案讨论', lastActivity: '昨天' },
      { id: 'enzymekcat', title: 'EnzymeKcat 模型探索', lastActivity: '2 天前' },
    ],
  },
  {
    id: 'data-assetization',
    name: 'Data Assetization',
    threads: [
      { id: 'sec-hplc', title: 'SEC-HPLC 数据资产化', lastActivity: '1 小时' },
      { id: 'bli-cleanup', title: 'BLI 数据整理', lastActivity: '3 小时' },
      { id: 'cell-assay-standard', title: '细胞实验结果标准化', lastActivity: '昨天' },
    ],
  },
  {
    id: 'model-to-oracle',
    name: 'Model-to-Oracle',
    threads: [
      { id: 'oracle-release', title: 'Oracle 发布准备', lastActivity: '2 小时' },
      { id: 'model-baseline', title: '模型评估与性能基准', lastActivity: '昨天' },
      { id: 'knowledge-map', title: '知识图谱构建计划', lastActivity: '2 天前' },
    ],
  },
  {
    id: 'protein-delivery',
    name: 'Protein Delivery',
    threads: [
      { id: 'vector-design', title: '递送载体设计讨论', lastActivity: '3 小时' },
      { id: 'aav-packaging', title: 'AAV 包装实验方案', lastActivity: '昨天' },
      { id: 'biodistribution', title: '体内分布结果分析', lastActivity: '5 天前' },
    ],
  },
]

export const capabilityChips: CapabilityChip[] = [
  {
    id: 'target-research',
    label: '靶点调研',
    prompt: '帮我围绕当前项目梳理靶点机制、疾病背景、竞品管线和关键证据缺口。',
  },
  {
    id: 'wet-lab',
    label: '设计到湿实验',
    prompt: '基于当前候选分子，帮我设计一份可提交评审的湿实验验证方案草稿。',
  },
  {
    id: 'data-asset',
    label: '数据资产化',
    prompt: '帮我把当前实验结果整理成可复用的 AI-Ready Dataset，并列出缺失元数据。',
  },
  {
    id: 'model-reuse',
    label: '模型复用',
    prompt: '帮我评估当前项目里哪些已有模型或 Oracle 可以复用，并给出验证计划。',
  },
  {
    id: 'delivery',
    label: '项目交付',
    prompt: '帮我生成当前项目的周报、风险列表和下一步行动建议。',
  },
  { id: 'more', label: '更多' },
]

export const useCases: UseCaseCard[] = [
  {
    id: 'target-evidence',
    icon: 'target',
    tone: 'cyan',
    title: '调研靶点机制与竞品',
    input: '靶点名称 / 疾病背景 / 研究问题',
    output: '机制解析 / 竞品对比 / 文献摘要',
    prompt: '帮我围绕当前项目调研靶点机制、疾病背景、竞品进展和关键证据缺口。',
  },
  {
    id: 'wet-order',
    icon: 'flask',
    tone: 'blue',
    title: '从候选分子生成湿实验订单',
    input: '分子结构 / 实验类型 / 条件',
    output: '实验方案 / CRO 订单 / 物料清单',
    prompt: '基于当前项目的候选分子，帮我生成一份湿实验验证方案和实验订单草稿。',
  },
  {
    id: 'ai-ready-dataset',
    icon: 'database',
    tone: 'teal',
    title: '整理实验结果为 AI-Ready Dataset',
    input: '实验数据 / 元数据 / 质控信息',
    output: '标准化数据集 / 可视化报告',
    prompt: '帮我把当前实验结果整理成 AI-Ready Dataset，并输出质控问题和可视化报告框架。',
  },
  {
    id: 'oracle-tuning',
    icon: 'brain',
    tone: 'violet',
    title: '用实验数据微调 Oracle',
    input: '训练数据集 / 预测模型 / 评估集',
    output: '微调模型 / 性能评估 / 部署包',
    prompt: '帮我评估这批实验数据是否适合微调 Oracle，并生成训练与评估计划。',
  },
  {
    id: 'weekly-risk',
    icon: 'report',
    tone: 'amber',
    title: '生成项目周报与风险列表',
    input: '项目进展 / 里程碑 / 风险事件',
    output: '周报文档 / 风险列表 / 行动建议',
    prompt: '帮我基于当前项目进展生成项目周报、风险列表和下一步行动建议。',
  },
  {
    id: 'delivery-tracking',
    icon: 'package',
    tone: 'cyan',
    title: '项目交付追踪',
    input: '里程碑计划 / 交付物 / 依赖关系',
    output: '交付清单 / 延误风险 / 跟进动作',
    prompt: '帮我检查当前项目交付物、依赖关系和潜在延误风险，并给出跟进动作。',
  },
]

export const initialThreadId = 'egfr-affinity'
```

- [ ] **Step 2: Run TypeScript through build later**

No command in this task. This data is compiled by Task 8.

---

### Task 3: Add Shared Icons

**Files:**
- Create: `src/components/icons.tsx`

- [ ] **Step 1: Create reusable inline SVG icons**

Create `src/components/icons.tsx` with icon components for `PlusIcon`, `SearchIcon`, `FolderIcon`, `ChevronDownIcon`, `ChevronRightIcon`, `BellIcon`, `SendIcon`, `PinIcon`, `ArchiveIcon`, `MicIcon`, `TargetIcon`, `FlaskIcon`, `DatabaseIcon`, `BrainIcon`, `ReportIcon`, and `PackageIcon`.

Implementation requirements:
- Each component accepts `className?: string`.
- SVGs use `fill="none"`, `stroke="currentColor"`, `strokeWidth={1.9}`, `strokeLinecap="round"`, and `strokeLinejoin="round"`.
- Export a `CardIcon` component that maps the `UseCaseCard['icon']` names to card icons.

Use this exact helper signature:

```tsx
type IconProps = {
  className?: string
}
```

- [ ] **Step 2: Verify import names**

Expected exports:

```ts
export {
  ArchiveIcon,
  BellIcon,
  BrainIcon,
  CardIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  FlaskIcon,
  FolderIcon,
  MicIcon,
  PackageIcon,
  PinIcon,
  PlusIcon,
  ReportIcon,
  SearchIcon,
  SendIcon,
  TargetIcon,
}
```

---

### Task 4: Build Components

**Files:**
- Create: `src/components/TopNav.tsx`
- Create: `src/components/Sidebar.tsx`
- Create: `src/components/Composer.tsx`
- Create: `src/components/UseCaseGrid.tsx`

- [ ] **Step 1: Implement `TopNav.tsx`**

Required props:

```ts
type TopNavProps = {
  onNotify: (message: string) => void
}
```

Required behavior:
- Render cropped logo image from `../assets/biomap-agent-logo.png`.
- Render nav items `Agent`, `Projects`, `Assets`, `Pipelines`.
- `Agent` has active class.
- Non-active nav buttons call `onNotify('该模块将在后续 Demo 中展开')`.
- Bell button displays badge `3` and calls `onNotify('Notification Center 将在后续 Demo 中展开')`.
- User button displays `Z`, `zhengjun`, chevron, and calls `onNotify('Account menu 将在后续 Demo 中展开')`.

- [ ] **Step 2: Implement `Sidebar.tsx`**

Required props:

```ts
import type { Project } from '../data/mockData'

type SidebarProps = {
  projects: Project[]
  selectedThreadId: string | null
  searchOpen: boolean
  searchQuery: string
  expandedProjectIds: string[]
  onNewThread: () => void
  onSearchOpenChange: (open: boolean) => void
  onSearchQueryChange: (query: string) => void
  onToggleProject: (projectId: string) => void
  onSelectThread: (projectId: string, threadId: string) => void
  onNotify: (message: string) => void
}
```

Required behavior:
- Fixed top controls: `+ 新对话`, search button/input.
- Scrollable project list starts at the `项目` section.
- Search filters only thread titles.
- Search mode shows only projects with matching threads and forces those projects visually expanded.
- Project arrow toggles expanded state outside search.
- Selected thread row shows pin and archive buttons.
- Pin/archive buttons stop row click propagation and call `onNotify('Thread tools 将在后续 Demo 中展开')`.

- [ ] **Step 3: Implement `Composer.tsx`**

Required props:

```ts
import type { Project } from '../data/mockData'

type ComposerProps = {
  projects: Project[]
  selectedProjectId: string
  draft: string
  projectMenuOpen: boolean
  onDraftChange: (draft: string) => void
  onProjectMenuOpenChange: (open: boolean) => void
  onProjectChange: (projectId: string) => void
  onSubmit: () => void
  onNotify: (message: string) => void
}
```

Required behavior:
- Heading text exactly `我能为你的研发做什么？`.
- Textarea placeholder exactly `描述一个研发目标，或继续一个 Thread`.
- Plus button calls `onNotify('Add context 将在后续 Demo 中展开')`.
- Send button disabled when `draft.trim().length === 0`.
- Enter submits; Shift+Enter inserts newline.
- Project selector row opens/closes menu, lists projects, closes on selection.
- Use a `useEffect` outside-click listener and Escape key listener for closing the menu.

- [ ] **Step 4: Implement `UseCaseGrid.tsx`**

Required props:

```ts
import type { CapabilityChip, UseCaseCard } from '../data/mockData'

type UseCaseGridProps = {
  chips: CapabilityChip[]
  useCases: UseCaseCard[]
  onPromptSelect: (prompt: string) => void
  onNotify: (message: string) => void
}
```

Required behavior:
- Render chips in the spec order.
- Chips with prompts call `onPromptSelect(prompt)`.
- `更多` calls `onNotify('更多 Capability 将在后续 Demo 中展开')`.
- Render cards in fixed three-column grid on desktop.
- Cards show icon, title, `输入`, and `输出`.
- Cards never render `审批`, orange approval dots, or Approval labels.
- Card click calls `onPromptSelect(card.prompt)`.

---

### Task 5: Compose State in App

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace the Vite starter component**

`src/App.tsx` should:
- Import `useEffect`, `useMemo`, and `useState`.
- Import `TopNav`, `Sidebar`, `Composer`, `UseCaseGrid`.
- Import `projects`, `capabilityChips`, `useCases`, and `initialThreadId`.
- Own all state from the spec.

Required state:

```ts
const [selectedThreadId, setSelectedThreadId] = useState<string | null>(initialThreadId)
const [isDraftingNewThread, setIsDraftingNewThread] = useState(false)
const [searchOpen, setSearchOpen] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id)
const [projectMenuOpen, setProjectMenuOpen] = useState(false)
const [draft, setDraft] = useState('')
const [statusMessage, setStatusMessage] = useState('')
const [expandedProjectIds, setExpandedProjectIds] = useState(() => projects.map((project) => project.id))
```

Required handlers:
- `showStatus(message)` sets `statusMessage`.
- `useEffect` clears `statusMessage` after 2 seconds.
- `handleNewThread()` clears selected thread, sets draft mode, keeps selected project.
- `handleSelectThread(projectId, threadId)` sets selected thread, clears draft mode, syncs selected project.
- `handleToggleProject(projectId)` toggles expanded project ids.
- `handlePromptSelect(prompt)` sets draft to prompt and clears draft mode only if needed.
- `handleSubmit()` ignores empty draft, otherwise shows `已创建 Thread 草稿`, clears draft, and keeps user on homepage.

Expected JSX structure:

```tsx
return (
  <div className="agent-app">
    <TopNav onNotify={showStatus} />
    <div className="agent-shell">
      <Sidebar ... />
      <main className="workspace-main">
        {statusMessage ? <div className="status-toast">{statusMessage}</div> : null}
        <section className="workspace-inner">
          <Composer ... />
          <UseCaseGrid ... />
        </section>
      </main>
    </div>
  </div>
)
```

- [ ] **Step 2: Remove unused starter imports**

Ensure `reactLogo`, `viteLogo`, `heroImg`, and the counter state are gone.

---

### Task 6: Replace Styling

**Files:**
- Replace: `src/index.css`
- Replace: `src/App.css`

- [ ] **Step 1: Replace global CSS**

`src/index.css` must:
- Set `box-sizing: border-box`.
- Set body margin to `0`.
- Set `#root` to `min-height: 100svh`.
- Define CSS variables for navy text, cyan accent, borders, muted backgrounds, and shadows.
- Disable dark-mode inversion from the starter template.

Required variable names:

```css
:root {
  --app-bg: #ffffff;
  --sidebar-bg: #f7f9fb;
  --surface: #ffffff;
  --surface-soft: #f4f7f9;
  --line: #dce5ed;
  --line-strong: #cbd8e3;
  --text: #10233f;
  --muted: #6f7f92;
  --faint: #99a8ba;
  --accent: #0897bf;
  --accent-strong: #0284a8;
  --accent-soft: #e8f7fb;
  --danger: #f43f5e;
  --shadow-soft: 0 18px 44px rgba(16, 35, 63, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

- [ ] **Step 2: Replace app CSS**

`src/App.css` must implement:
- `.agent-app` as `height: 100svh; overflow: hidden;`.
- `.top-nav` fixed-height row.
- `.agent-shell` as two-column layout under nav.
- `.sidebar` fixed width around `368px`.
- `.sidebar-scroll` as the only scrolling sidebar area starting below fixed controls.
- `.workspace-main` as independent scroll container.
- `.workspace-inner` with max width around `1080px`, centered, with top padding enough to visually center composer.
- `.composer-panel` with input and project selector attached.
- `.capability-row` centered.
- `.use-case-grid` as `grid-template-columns: repeat(3, minmax(0, 1fr));`.
- `.use-case-card` with fixed height enough that the second row is partially clipped in the initial viewport.
- Media queries that reduce card columns to one on small screens.

Style constraints:
- No purple-dominant palette.
- No gradient orbs or decorative blobs.
- Cards must not include nested cards.
- Text must not overflow buttons or cards.

---

### Task 7: Verify Interactions Locally

**Files:**
- Modify if failures appear in files from Tasks 2-6.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite reports a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 2: Manual interaction checks in browser**

Check:
- Page no longer shows Vite starter.
- Top nav order is `Agent`, `Projects`, `Assets`, `Pipelines`.
- Bell has a badge `3` and no `Approval` text.
- Right floating Approval card is absent.
- `+ 新对话` clears selected thread.
- Search opens into an input, filters by thread title, and Esc clears/closes it.
- Project folders collapse/expand.
- Project selector opens, closes on outside click/Esc, and changes selected project.
- Chips and cards fill natural-language prompts.
- Empty send is disabled.
- Non-empty send clears input and shows toast.
- First row of cards is visible and second row is partially cut off in the initial desktop viewport.

---

### Task 8: Run Automated Verification

**Files:**
- Modify if failures appear in files from Tasks 2-6.

- [ ] **Step 1: Run lint**

Run:

```bash
npm run lint
```

Expected: command exits with code 0 and no ESLint errors.

- [ ] **Step 2: Run build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Browser smoke check**

Open the local Vite URL and verify:
- No console errors.
- Main screenshot visually matches the approved mockup direction.
- Sidebar and main workspace scroll independently.
- The logo crop renders without extra duplicate product text.

---

## Self-Review

- Spec coverage: the plan covers logo crop, final nav labels, Notification Center semantics, project/thread behavior, search, project selector, composer, chips, cards, scroll containers, and verification.
- Placeholder scan: the plan contains no unresolved placeholder markers or unspecified future implementation steps.
- Type consistency: `Project`, `Thread`, `CapabilityChip`, and `UseCaseCard` are defined in `mockData.ts` and reused by component props.
