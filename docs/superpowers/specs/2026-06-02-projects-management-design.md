# Projects Management 设计

## 状态

本 spec 定义 BioMap Agent Demo 顶部导航 `Projects` 的页面结构。它建立在当前 Workspace、Assets Workbench 和 Capabilities 管理页之后，把 `Projects` 从占位 toast 扩展为独立的项目管理模块。

术语遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md)：

- **Project**：长期 R&D 业务容器，包含多个 **Thread**，并为新对话提供上下文。
- **Favorite Project**：当前用户收藏的 Project，用于个人快速访问，不改变项目归属、权限或生命周期。
- **Project Responsible Member**：Project 的唯一负责人，用于列表和详情标题栏展示。
- **Project Read Permission** / **Project Edit Permission**：Project 内可多人的读取和编辑权限集合。
- **Project Context**：Project 级已确认的描述和补充信息，可作为新对话默认背景。
- **Project Tag**：用于筛选或描述 Project 的轻量标签，不是 Project 名或状态。
- **Project Last Activity**：Project 关联的最近有意义活动时间，不是创建时间。
- **Project Asset Summary**：Projects 内展示的项目范围资产摘要，不替代 Assets Workbench。
- **Thread**：Project 内的持久协作上下文，中文 UI 短标签用 `对话`。
- **Asset**：Main Agent 可引用、调用、生成或复用的持久研发资产。
- **Task**：Main Agent 在 Thread 内创建的执行记录，不用于表示 Project 列表项、对话或工作项。

本轮仍是纯前端 Demo，不接真实后端、不做真实权限校验、不创建真实项目、不修改真实成员关系。

## 目标

1. 点击顶部 `Projects` 后进入一个独立的项目管理列表页。
2. 不使用左侧菜单；`Projects` 模块首页就是项目管理列表。
3. 列表页参考用户提供截图的结构：顶部状态 tabs、搜索筛选、字段丰富的表格列表和行操作，但字段内容必须围绕 BioMap Agent 的 Project 领域重新设计。
4. 标题栏参考当前 Assets 标题栏：左侧 eyebrow、标题和说明，右侧主操作和更多操作；筛选工具放在标题栏下方。
5. 保留 `全部`、`我的收藏`、`回收站` 三个状态 tabs，不使用 `草稿` 状态。
6. 点击项目行后在 `Projects` 模块内部切换到完整项目详情页，不引入路由，不离开 `Projects` 顶导。
7. 项目详情页承载成员、权限、上下文、相关对话、资产摘要和设置，避免把这些做成顶部模块的左侧一级菜单。

## 非目标

不包含：

- 左侧菜单模式。
- `项目成员`、`成员与权限` 或 `项目模板` 作为 `Projects` 模块一级菜单。
- 真实项目创建、删除、恢复、收藏或权限变更。
- 真实用户中心、组织通讯录、账号禁用、组织角色管理。
- 真实文件、数据、实验、模型资产管理。
- 真实路由系统或 URL 切换。
- 重做 Workspace 对话侧栏、Assets Workbench 或 Capabilities 管理页。
- 把 Project 当成 Thread 文件夹、Task 列表或资产目录。

## 顶层信息架构

`Projects` 顶导点击后进入单一模块页面：

```text
TopNav
ProjectsPage
  ├─ List View: 项目管理列表
  └─ Detail View: 项目完整详情页
```

不设置 `ProjectsSidebar`，也不设置左侧二级菜单。

### 页面状态

`ProjectsPage` 只需要两种内部视图状态：

- `list`：项目管理列表，默认进入。
- `detail`：项目完整详情页，由点击项目行进入。

切换规则：

- 顶部 `Projects` 始终保持 active。
- 不改变 URL。
- 不引入 React Router。
- 回到 `Workspace` 后，Workspace 原本选中的 Thread、New Thread Draft、draft 文本和侧栏状态不被清空。
- 从 `Projects` 再次进入时，第一版可以回到列表页；如果后续需要持久化最后打开项目，可单独设计。

## 项目管理列表页

### 标题栏

标题栏沿用 Assets 的信息层级和布局节奏：

```text
Projects / 项目管理
项目管理
管理研发项目、项目上下文、成员权限和协作状态

[新建项目] [...]
```

要求：

- 左侧使用 eyebrow、H1、说明文案。
- 右侧主操作为 `新建项目`。
- 更多操作使用图标按钮，展开 mock 菜单。
- 不放左侧菜单。
- 不使用 hero 或营销式大卡。
- 视觉密度接近 Assets / Capabilities 管理台，而不是 Workspace 首页 composer。

### 状态 tabs

标题栏下方显示状态 tabs：

```text
全部 / 我的收藏 / 回收站
```

语义：

- `全部`：用户有权限查看且未放入回收站的 Project，包括 active、at risk、completed 和 archived Project。
- `我的收藏`：当前用户收藏的、未进入回收站的 Project。收藏是个人视图偏好，不改变 Project 归属、权限、生命周期或负责人。
- `回收站`：已删除进入 trash、等待恢复或彻底删除的 Project。它不是 archived Project 列表。

不使用 `草稿`，因为当前产品语义里 Project 没有草稿状态。

过滤规则：

- `全部`和`我的收藏`都排除 Trashed Project。
- `回收站`只显示 Trashed Project，并忽略 Project Lifecycle Status 筛选。
- Archived Project 留在`全部`和`我的收藏`中，通过 `项目状态`筛选查看。

### 筛选工具栏

状态 tabs 下方是工具栏，参考用户截图的筛选结构，但字段使用 Project 领域口径：

```text
搜索项目
标签
项目状态
负责人
最近活动
```

工具说明：

- `搜索项目`：按项目名称、描述、负责人、标签过滤。
- `标签`：Project Tag，例如 Antibody、Optimization、Wet-lab、Dataset、Oracle。标签不是 Project 名。
- `项目状态`：Project Lifecycle Status，固定为 Active、At Risk、Completed、Archived。Trash 不属于生命周期状态。
- `负责人`：Project Responsible Member，唯一成员。
- `最近活动`：按 Project Last Activity 时间范围筛选；不使用创建时间或截止时间。

第一版筛选以本地 mock 状态为主，不接后端查询。

### 项目表格

表格以 Project 为行主体，字段要服务 BioMap Agent 的项目管理语义。建议字段：

```text
项目
状态
负责人
读取权限
编辑权限
对话
资产
最近活动
更多
```

字段含义：

- `项目`：项目名称、简短描述或 Project Tag；可显示当前用户的收藏星标。
- `状态`：Project Lifecycle Status：Active、At Risk、Completed、Archived。At Risk 表示项目存在需要关注的风险，不等于失败或阻塞。
- `负责人`：Project Responsible Member，单一成员。
- `读取权限`：额外只读成员数量或头像组，不重复负责人，也不重复编辑权限成员。
- `编辑权限`：额外可编辑成员数量或头像组，不重复负责人。编辑权限隐含读取权限。
- `对话`：该 Project 下活跃 Thread 数量，只做数量和入口，不替代 Workspace。
- `资产`：Project Asset Summary，只做摘要，不替代 Assets。
- `最近活动`：Project Last Activity，由 Thread 更新、Project Context 编辑、项目范围 Asset 更新、权限变化或生命周期变化等项目级活动推导，不是创建时间。
- `更多`：收藏、归档、恢复、导出清单等 mock 操作。

不建议字段：

- 不使用 `任务` 表示 Thread 或项目工作。
- 不使用用户截图里的实验流量、进组用户数、运行时间等字段作为照抄字段。
- 不把文件数量拆成完整文件管理。
- 不把成员列表展开成用户中心。

### 行交互

点击项目行主体进入项目详情页。

行内操作：

- 星标按钮：mock 收藏或取消收藏当前用户的 Favorite Project 标记。
- 更多按钮：打开行操作菜单。
- 回收站 tab 只展示 Trashed Project，行操作显示 `恢复项目` 和 `彻底删除` mock 入口，但第一版只触发 toast。

行点击和更多菜单需要分离：点击更多按钮不进入详情页。

## 项目详情页

项目详情页是 `Projects` 模块内部完整页，不是抽屉、弹窗或路由页面。

### 进入和返回

点击项目行后：

```text
← 项目管理

Project Header
Detail Tabs
Detail Content
```

返回入口：

- 文案：`项目管理` 或 `返回项目管理`。
- 点击后回到列表页。
- 保留列表筛选状态是加分项；第一版可以保留本地 state。

### 详情标题栏

详情标题栏展示项目级信息：

```text
项目名
状态 badge / 收藏 / 更多
项目描述
负责人 / 读取权限人数 / 编辑权限人数 / 对话数 / 资产摘要 / 最近活动
```

操作：

- `新建对话`：切到 `Workspace`，进入当前 Project 的 New Thread Draft。它不创建 durable Thread，只有用户提交 composer 后才创建 Thread。
- `编辑项目`：mock。
- 更多菜单：归档、导出项目清单、复制项目链接等 mock 操作。

`新建对话` 前端状态切换：

```text
selectedProjectId = 当前 projectId
selectedThreadId = null
isDraftingNewThread = true
activeTopNav = Workspace
```

### 详情 tabs

项目详情页 tabs：

```text
概览
成员与权限
项目上下文
相关对话
资产摘要
设置
```

#### 概览

展示项目级摘要：

- 项目目标和当前阶段。
- 关键进展。
- 风险提示。
- 最近活动。
- 最近 Main Agent 工作摘要。
- 关联的重点 Thread 和 Asset 摘要。

#### 成员与权限

展示该 Project 内的人和权限关系，不是用户中心：

- 唯一 `负责人`；负责人天然具备读取和编辑能力，但不重复出现在权限列表。
- `编辑权限`额外成员列表；编辑权限隐含读取权限。
- `读取权限`额外只读成员列表；不包含负责人或编辑权限成员。
- 成员姓名或头像。
- 可选责任备注，例如 scientific review、delivery coordination、external CRO contact。
- 最近项目活动。

不提供：

- 创建组织用户。
- 禁用账号。
- 修改组织全局角色。
- 管理登录状态。

#### 项目上下文

展示 Project 级已确认的描述和补充信息：

- 项目描述。
- 额外补充信息。
- 关键目标、边界和约束。
- 已确认的假设和决策边界。
- Main Agent 建议沉淀的上下文候选，但必须标为待确认。

它是 Project 级上下文管理，不是 Thread Transcript、Project File 列表或 Asset 列表。未确认的 Thread 内容不能自动进入 Project Context。

#### 相关对话

聚合该 Project 下的 Thread：

- 标题。
- 最近活动。
- 状态或是否有 Run Inspector 数据。
- 简短摘要。

该 tab 只做 active Thread 聚合和跳转入口，真正对话仍在 `Workspace`。第一版不展示 Archived Thread 管理。

点击某个对话后，切到 `Workspace` 并选中对应 Thread，不复制 Thread 内容到 Projects。

`相关对话`行点击前端状态切换：

```text
activeTopNav = Workspace
selectedProjectId = thread.projectId
selectedThreadId = thread.id
isDraftingNewThread = false
```

#### 资产摘要

展示 Project Asset Summary：

- Project Files 数量。
- Data Assets 数量。
- Experiment Assets 数量。
- Model Assets 或 Oracle 数量。
- 最近更新资产。

完整资产浏览和管理仍在 `Assets`，这里只提供摘要和入口。

资产摘要入口行为：

- 点击 Project Files 摘要，切到 `Assets > 文件 > 项目文件`，并打开当前 Project 文件夹。
- 点击 Data / Experiment / Model 摘要，切到 `Assets` 对应一级 section 的默认视图；第一版不要求实现项目级深筛选。
- 这些入口不在 Projects 内复制资产列表。

#### 设置

项目级配置：

- 项目名称和描述。
- Project Lifecycle Status。
- 当前用户收藏状态。
- 归档或删除；归档进入 Archived Project，删除进入 Trashed Project。
- 可见性摘要。

第一版不做真实保存。

## 数据模型建议

当前 `Project` seed 数据只有：

```ts
type Project = {
  id: string
  name: string
  threads: Thread[]
}
```

Projects 页面需要扩展 mock 数据，但不一定要立刻改变核心 Workspace 的 Project 类型。建议新增 Projects 页面专用 mock 数据或扩展字段，并通过 `projectId` 关联现有 seed projects：

```ts
type ProjectStatus = 'active' | 'atRisk' | 'completed' | 'archived'

type ProjectManagementRecord = {
  projectId: string
  name: string
  description: string
  tags: string[]
  status: ProjectStatus
  responsibleMember: ProjectMember
  readOnlyPermissionMembers: ProjectMember[] // extra read-only members, excluding responsibleMember and editPermissionMembers
  editPermissionMembers: ProjectMember[] // extra edit members, excluding responsibleMember
  favoritedByCurrentUser: boolean
  trashed: boolean
  createdAt: number
  lastActivityAt: number
  assetSummary: ProjectAssetSummary
  contextSummary: ProjectContextSummary
}
```

这样可以避免 Workspace 的 Project / Thread 状态在第一版被项目管理字段污染。

## 状态模型建议

Projects 页面本地 UI 状态：

```ts
type ProjectsTab = 'all' | 'favorites' | 'trash'

type ProjectsViewState =
  | { view: 'list' }
  | { view: 'detail'; projectId: string; activeDetailTab: ProjectDetailTab }
```

建议 store 字段：

```ts
activeTopNav: 'Workspace' | 'Projects' | 'Assets' | 'Capabilities'
projectsActiveTab: ProjectsTab
projectsQuery: string
projectsSelectedTag: string | null
projectsSelectedStatus: string | null
projectsSelectedResponsibleMember: string | null
projectsSelectedActivityRange: 'all' | 'today' | 'thisWeek' | 'thisMonth'
projectsView: ProjectsViewState
```

第一版可以把筛选状态放组件局部 state；如果需要刷新后保留 Projects 位置，再放入 Zustand persist。

## 组件边界建议

建议新增：

- `src/components/projects/ProjectsPage.tsx`
- `src/data/projectsMockData.ts`

如果单文件过大，再拆：

- `ProjectsListView`
- `ProjectsDetailView`
- `ProjectsTable`
- `ProjectDetailTabs`

`App.tsx` 只负责根据 `activeTopNav === 'Projects'` 渲染 `ProjectsPage`，不要把表格和详情内容塞进 `App.tsx`。

## 与其他模块的边界

### Workspace

Workspace 仍然负责对话工作台、New Thread Draft、Thread Transcript 和 Run Inspector。

Projects 里的 `相关对话` 只做 Project 下 Thread 聚合和入口，不替代 Workspace。

### Assets

Assets 仍然负责 File Space、Data Assets、Experiment Assets 和 Model Assets 的完整浏览和管理。

Projects 里的 `资产摘要` 只做项目范围摘要，不重复 Assets 左侧菜单或文件列表。

### Capabilities

Capabilities 仍然是跨项目的能力资产和供应方管理页。

Projects 可以在详情页展示“本项目常用能力”摘要，但不管理 Pipeline、Skill、MCP Server 或 Plugin。

### 用户中心

用户中心如果后续出现，应管理账号、组织角色、部门、登录和全局权限。

Projects 的 `成员与权限` 只管理某个 Project 内的成员关系和项目权限，不创建用户、不禁用账号、不修改组织角色。

## 视觉要求

- 标题栏参考 Assets 的布局和字号层级。
- 项目列表使用管理台表格，不做营销卡片。
- 行高可以略高于普通数据表，方便展示项目描述、标签和头像组。
- 卡片只用于详情页内的摘要块，不要在列表页堆大卡片。
- 圆角沿用现有系统，表格和按钮不超过 8px 为主。
- 保持当前浅色工作台风格，不新增大面积渐变或装饰图形。
- 移动端第一版只需基本可用，桌面演示优先。

## 验收标准

- 顶部点击 `Projects` 后进入项目管理列表页，而不是 toast。
- `Projects` active 时不显示 Workspace 对话侧栏。
- 页面没有左侧 Projects 菜单。
- 标题栏结构与 Assets 标题栏一致：eyebrow、H1、说明、右侧操作。
- 状态 tabs 只有 `全部`、`我的收藏`、`回收站`，没有 `草稿`。
- Archived Project 不进入回收站；Trashed Project 只在 `回收站` tab 出现。
- 项目列表以 Project 为行主体，字段不照抄参考截图里的实验字段。
- 项目列表包含唯一 `负责人`、额外 `读取权限`、额外 `编辑权限`，且负责人不在权限列表重复出现。
- 项目列表使用 Project Tag 筛选，不使用 Project 名作为类型。
- `最近活动` 使用 Project Last Activity，不使用创建时间。
- 点击项目行后在页面内部切换到完整项目详情页，不改 URL。
- 项目详情页包含 `概览`、`成员与权限`、`项目上下文`、`相关对话`、`资产摘要`、`设置`。
- 项目详情页点击 `新建对话` 会切到 Workspace 的 New Thread Draft，并选择当前 Project，但不立即创建 Thread。
- 项目详情页 `相关对话` 点击对话行会切到 Workspace 并选中对应 Thread。
- `相关对话` 不替代 Workspace。
- `资产摘要` 不替代 Assets。
- `资产摘要`入口会切到 Assets 对应位置，但不复制资产列表到 Projects。
- `成员与权限` 不表现为用户中心。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查桌面宽度下列表和详情页无明显布局破损。

## 实施顺序建议

1. 增加 Projects top nav page state，让 `Projects` 从占位 toast 变成页面。
2. 增加 Projects mock 数据和项目管理列表页。
3. 增加 `全部 / 我的收藏 / 回收站` tabs 和搜索筛选。
4. 增加页面内项目详情页状态和返回入口。
5. 增加详情 tabs 的 mock 内容。
6. 实现项目详情页 `新建对话` 切回 Workspace New Thread Draft，并带上当前 Project。
7. 实现项目详情页 `相关对话` 行切回 Workspace 并选中对应 Thread。
8. 更新 store / tests / App navigation tests。
9. 做浏览器视觉检查。
