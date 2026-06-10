# Capabilities 管理页设计

## 状态

本 spec 定义 BioMap Agent Demo 的 **Capabilities** 管理页。它把顶部导航中的 `Capabilities` 从占位入口扩展为一个独立的能力资产与供应方管理界面，用于展示和轻量管理已经编排好的 Pipelines、Skills、MCP Servers 和 Plugins。

术语遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/.worktrees/capabilities/CONTEXT.md)：

- **Capability**：Main Agent 可用于完成用户 R&D 目标的领域能力。
- **Pipeline**：用户定下的产品命名，表示一种特殊的生物学流程能力，可以编辑一系列生物工具调用。
- **Skill**：经典 AI 平台概念，表示可复用的 agent 指令包，可以由 Main Agent 按需加载和应用。Skill 可以是预设的、用户自己创建的，或从外部安装的。
- **Capability Provider**：为 Main Agent 暴露 Capability Commands 或支持功能的供应方。
- **MCP Server**：经典 Agent MCP 连接，是一种 Capability Provider，暴露工具、资源和权限边界。
- **Plugin**：额外插件能力扩展位，是一种 Capability Provider，本轮先做 Placeholder。

本轮仍是纯前端 Demo，不接真实 Agent Builder、真实 MCP 连接、真实工具调用、真实权限系统或真实持久化后端。

## 目标

1. 点击顶部 `Capabilities` 后进入独立管理页，而不是停留在 Workspace 对话壳里。
2. 管理页左侧提供能力与供应方类型导航：`Pipelines / Skills / MCP Servers / Plugins`。
3. 默认打开 `Pipelines`，突出 BioMap 的生物学流程编排能力。
4. 用管理台结构展示能力库：Pipelines、MCP Servers、Plugins 使用类型导航、能力列表、详情面板；Skills 使用 Codex 风格列表和详情弹窗。
5. 展示已编排能力的管理感：查看、搜索、筛选、编辑入口、复制、禁用、测试运行占位。
6. 明确能力可以通过 Main Agent 的自然语言 build 能力创建或调整。
7. 展示预设 Skills，例如蛋白设计、实验操作、实验数据分析等，但不实现真实执行。

## 范围

包含：

- 顶部导航支持 `Workspace` 和 `Capabilities` 两个页面状态。
- `Capabilities` active 后替换主工作区内容。
- Capabilities 页面左侧类型导航。
- Pipelines、Skills、MCP Servers、Plugins 四类 mock 数据，其中 Pipelines 是治理过的生物流程能力，Skills 是可复用 agent 指令包，MCP Servers 和 Plugins 是 Capability Providers。
- 中间列表支持类型切换、选择条目、基础搜索和轻量筛选。
- 右侧详情面板展示选中 Pipeline、MCP Server 或 Plugin 的结构化信息。
- Skills 使用 Codex 风格列表和详情弹窗，不强制展示右侧详情面板。
- `Build with Agent` 主入口和轻量操作按钮。
- Demo 级本地交互反馈，例如 toast、选中状态、mock 状态变化。
- 测试覆盖关键导航、默认页、类型切换、详情更新和预设 Skill 操作限制。

不包含：

- 引入 React Router。
- 接入真实后端、真实 Agent Builder 或真实工作流编排引擎。
- 真实新增、删除、保存或执行能力。
- 完整 Pipeline 图编辑器。
- 完整 Skill/MCP 配置表单。
- 真实 MCP auth、连接测试或权限管理。
- Plugins 的真实安装和卸载。
- 重做 Workspace、Sidebar、ThreadWorkspace 或 Run Inspector。

## 页面边界

Capabilities 是跨项目的能力资产与供应方管理页，不属于某个 Project 或 Thread。UI 标题保持 `Capabilities`，不显示更复杂的 `Capabilities and Providers`。

能力条目可以显示使用上下文，例如最近被哪个 Thread 或 Project 使用过，但这不是归属关系。Capability 的 owner 使用团队、系统或个人，不使用 Project。

点击顶部 `Capabilities` 后：

- 顶部 `Capabilities` 进入 active 态。
- 主区域展示 Capabilities 管理页。
- 不显示 Workspace 的项目 / 对话侧栏。
- 不显示 New Thread composer。
- 不改变当前 Workspace 中已选 Thread 或 draft。

点击顶部 `Workspace` 后：

- 回到现有 Workspace 页面。
- 保留原来的对话侧栏、composer 和 Thread 状态。
- Capabilities 页面内部选中项可以保留在前端状态里，但不需要持久化。

当前项目没有路由系统。本轮使用 `App` 内部页面状态实现 `Workspace` / `Capabilities` 切换，不引入 React Router。

## 信息架构

Pipelines、MCP Servers 和 Plugins 采用三栏基础结构：

```text
TopNav
CapabilitiesPage
  ├─ TypeNav
  │   ├─ Pipelines
  │   ├─ Skills
  │   ├─ MCP Servers
  │   └─ Plugins
  ├─ CapabilityList
  │   ├─ Toolbar
  │   └─ Capability rows
  └─ CapabilityDetail
      ├─ Overview
      ├─ Interface
      ├─ Steps / Tools
      ├─ Usage
      ├─ Access
      └─ Recent activity
```

### 左侧类型导航

导航项：

1. `Pipelines`
2. `Skills`
3. `MCP Servers`
4. `Plugins`

要求：

- 默认选中 `Pipelines`。
- 每项显示数量 badge。
- 当前项有明确 active 态。
- `Plugins` 显示 `Preview` 小标签，仍可点击并展示 placeholder 列表。
- 左侧栏是 Capabilities 页面内部导航，不复用 Workspace 的对话侧栏。

### 中间列表

列表顶部包含：

- 页面标题，随类型变化。
- 简短说明，说明该类型如何被 Main Agent 使用，或如何向 Main Agent 暴露能力。
- `Build with Agent` 主按钮。
- 搜索框。
- 状态筛选。
- 来源筛选。

列表条目采用紧凑 row / card hybrid，不做大营销卡片。每条显示：

- 名称。
- 类型或来源徽标。
- 状态。
- 简短描述。
- 关键 meta，例如 steps、tools、last used、owner。
- 最近活动时间。

默认排序：

1. Active 在前。
2. Preset / System 重要条目靠前。
3. 最近使用靠前。

状态用于表达管理状态，不用于表达 Skill 是否允许 Main Agent 使用：

- `Active`：当前可用。
- `Draft`：草稿或未完成配置。
- `Inactive`：已停用。
- `Needs review`：需要权限或配置审查。

Skill 的 enabled 开关是额外字段，语义是 `Enabled for Main Agent`。一个 Skill 可以是 `Active` 但被用户关闭 enabled。

### 右侧详情面板

右侧详情面板用于 Pipelines、MCP Servers 和 Plugins，随中间列表选中项更新。没有选中项时自动选中当前类型第一条。

详情面板分区：

- `Overview`：名称、描述、状态、来源、owner、版本。
- `Interface`：Main Agent 调用该能力时的输入、输出、权限边界。
- `Steps / Tools`：Pipeline 的步骤；或 MCP 的 tools/resources；或 Plugin 的 placeholder 能力说明。
- `Usage`：适用场景、被哪些 demo Thread 或 Project 使用过。
- `Access`：可自动调用、需确认、需审批、只读等轻量使用策略。
- `Recent activity`：最近更新、最近测试、最近被调用。

详情面板不是浮动卡片，不做复杂 tab。它应像管理台 inspector：右侧贴边、信息密度高、滚动独立、层级清晰。

Skills 是例外：Skills 类型直接参考 Codex 的技能管理页，使用列表 + 启用开关 + 详情弹窗，而不是强制显示右侧详情面板。用户点击 Skill 行时打开居中的详情弹窗，背景列表保留并轻度遮罩。

## 类型内容

### Pipelines

默认类型。对象名直接叫 **Pipeline**。

Pipelines 表达 BioMap 的生物学流程编排能力：它们可以串联结构分析、候选排序、实验订单草稿、数据资产化等工具调用，供 Main Agent 在对话中自然调用。

Pipeline 详情可以展示稳定的 command-like 调用接口，例如 `pipeline.egfrAffinity.optimize`。这里可以使用 `Capability Command` 语言，因为 Pipeline 是可启动、可运行、可治理的流程能力。

示例 mock：

- `EGFR Antibody Affinity Optimization`
- `Protein Stability Redesign`
- `Wet-lab Validation Order Pipeline`
- `AI-ready Dataset Curation`
- `Molecule Candidate Triage`

每个 Pipeline 展示：

- `steps`：例如 Context intake、Structure analysis、Candidate ranking、Wet-lab order drafting。
- `inputs`：序列、候选分子、实验约束、项目文件等。
- `outputs`：候选列表、实验订单草稿、报告、AI-ready dataset 等。
- `policy`：自动调用 / 需要 Human Confirmation / 需要 Approval Gate Preview。
- `recent usage`：最近在哪个 demo Thread 中被调用。

操作：

- `Build with Agent`
- `Edit`
- `Duplicate`
- `Test run`
- `Disable Pipeline`

`Delete` 不作为主操作出现，避免 Demo 管理页显得高风险。

Pipeline 列表行不显示类似 Skills 的 enabled 开关。Pipeline 的启停属于管理动作，通过详情面板或更多菜单里的 `Disable Pipeline` 承担，避免把治理过的流程能力降级成轻量开关。

### Skills

Skills 展示经典 Skill。Skill 是 AI 平台里用户可理解的能力组织方式，重点是让 Main Agent 按需加载可复用的操作知识，而不是把每一步固化成 Pipeline。

Skill 不强行展示 `Capability Command`。Skill 详情重点展示 `Instructions`、`Triggers`、`Examples` 和启用状态，避免把 Skill 误导成 API 或工具调用。

Skills 页面直接参考 Codex 技能管理界面：

- 只参考 Skill 的列表呈现、搜索、启用开关和详情弹窗，不复制 Codex 的顶层横向分类。
- Capabilities 页的类型切换仍由左侧 `Pipelines / Skills / MCP Servers / Plugins` 承担，Skills 内容区内部不再出现另一套跨类型 tabs。
- 内容区顶部保留当前类型标题、数量和搜索框。
- Skill 列表使用宽松行布局，不使用三栏 inspector。
- 每行左侧是 Skill 图标，中间是名称和单行/两行描述，右侧是来源标签和启用开关。
- 当前 hover 或选中行使用浅背景高亮，圆角不超过 `8px`。
- 启用开关是主要轻交互，语义是 `Enabled for Main Agent`，不是安装状态。
- `Installed` 是来源；`Enabled` 是是否允许 Main Agent 加载和使用。
- Preset Skill 默认开启，但也允许关闭；Preset 原件仍不可删除、不可直接编辑。
- Installed / Created Skill 可以切换 mock enabled 状态。
- 点击行主体打开详情弹窗；点击开关只切换状态，不打开弹窗。

预设 Skills 示例：

- `Operate Protein Design`
- `Operate Wet-lab Experiments`
- `Analyze Experimental Data`
- `Prepare R&D Report`

自己创建或安装的 Skills 示例：

- `EGFR Candidate Review Checklist`
- `CRO Handoff Formatter`

每个 Skill 展示：

- instruction 摘要。
- 适用场景。
- triggers / 触发条件。
- examples / 示例用法。
- 输入要求。
- 输出类型。
- 是否允许 Main Agent 自动调用。
- 来源：`Preset`、`Created` 或 `Installed`。
- 启用状态。

预设 Skill 规则：

- 显示 `Preset` 徽标。
- 可以查看。
- 可以 `Duplicate` 后定制。
- 可以 `Customize with Agent`。
- 可以通过开关关闭 Main Agent 使用。
- 不显示 destructive 操作。
- 不允许 `Delete` 或直接改原件。

自己创建或安装的 Skill 可以显示 `Edit`、`Duplicate`、`Remove`。启停只通过 enabled 开关表达，不再额外提供 `Disable` 动作。

### Skill 详情弹窗

Skill 详情弹窗参考 Codex 的详情页，而不是右侧 inspector。

弹窗结构：

```text
[icon]
Skill name       Skill                         [Enabled for Main Agent] [...]
Short description

[instruction / readme preview]

[Remove]                                  [Try in conversation]
```

要求：

- 弹窗居中，宽度约 `720px` 到 `820px`。
- 背景页面使用轻遮罩，仍可看见 Skills 列表。
- 右上角有关闭按钮。
- 标题行显示 Skill 名称和 `Skill` 类型文字。
- 标题行右侧显示 enabled switch 和更多菜单。
- 主体显示 instruction / README preview，使用浅边框内容区。
- 底部主操作是 `Try in conversation` 或 `Customize with Agent`。
- `Try in conversation` 和 `Customize with Agent` 本轮只触发 toast，不进入 Workspace、不创建 Thread。
- Preset Skill 不显示 `Remove`，可以显示 `Customize with Agent`。
- Created / Installed Skill 可以显示 `Remove` mock 操作；启停仍通过 enabled switch。

### MCP Servers

MCP Servers 展示经典 Agent MCP 连接。MCP Server 是 Capability Provider，不是领域能力本身；它通过 tools 和 resources 向 Main Agent 暴露可用功能。

示例 mock：

- `BioMap Structure Tools`
- `Experiment Order System`
- `Dataset Registry`
- `Literature Search Gateway`

每个 MCP Server 展示：

- 连接状态：Connected、Needs review、Inactive。
- 暴露工具数。
- 暴露 resources 数。
- auth / permission mock 信息。
- Main Agent 可调用范围。

MCP Server 列表使用连接状态 badge，不显示行级 enabled 开关。MCP 的启停影响其暴露的 tools/resources，语义重于 Skill 的加载开关。

详情中展示：

- Tools 列表，例如 `structure.analyze`、`order.createDraft`。
- Resources 列表，例如 `project-files`、`registered-datasets`。
- 权限边界，例如 read-only、draft-only、approval required。

操作：

- `View tools`
- `Test connection`
- `Disable connection`
- `Review permissions`

这些操作只做 toast 或 mock 状态反馈，不做真实连接。

### Plugins

Plugins 本轮是额外插件功能的 placeholder，但不能是空页面。Plugin 是 Capability Provider，不是领域能力本身；后续插件可以安装、托管或扩展 Main Agent 可用的能力。

示例 mock：

- `Sequence Viewer Plugin`
- `Molecule Visualization Plugin`
- `External CRO Connector`

页面表现：

- 显示 `Coming soon` 或 `Placeholder` 徽标。
- 左侧 `Plugins` 导航项显示 `Preview`，但不是 disabled。
- 保持和其他类型一致的列表 / 详情结构。
- 详情说明这是额外功能扩展位，后续可由 Agent 或管理员安装和配置。
- 不把 placeholder 条目伪装成真实已安装插件。

操作：

- `Request plugin`
- `View placeholder`

仅展示 toast，不做真实安装。

## 交互设计

### Build with Agent

`Build with Agent` 是 Capabilities 页的主操作。它强调能力本身可以通过 Main Agent 的自然语言 build 能力搭建。

点击后：

- 展示 toast，例如 `Agent Builder 将通过自然语言创建新的 Pipeline`。
- 可在当前页面展示一个轻量 callout，提示用户可以描述目标能力。
- 本轮不跳转真实对话，不创建真实 Thread。
- 本轮不进入 Workspace，不改 Project 归属，不保存任何新能力。
- `Build with Agent` 只表达产品方向，不承担真实创建流程。

按钮文案可随类型变化：

- Pipelines：`Build Pipeline with Agent`
- Skills：`Build Skill with Agent`
- MCP Servers：`Connect MCP with Agent`
- Plugins：`Request Plugin`

### 搜索与筛选

搜索：

- 根据名称、描述、标签过滤当前类型 mock 数据。
- 搜索为空时显示完整列表。
- 无结果时显示 `No capabilities found` 和清除搜索入口。

状态筛选：

- `All`
- `Active`
- `Draft`
- `Inactive`
- `Needs review`

来源筛选：

- `All sources`
- `Preset`
- `Created`
- `Installed`
- `System`

来源分类适用于 Capabilities 页面里的所有条目，不只适用于 Skills：

- Pipelines 可以是 `Preset`、`Created` 或 `Installed`。
- Skills 可以是 `Preset`、`Created` 或 `Installed`。
- MCP Servers 通常是 `Installed` 或 `System`。
- Plugins 通常是 `Installed` 或 `System`。

`Created` 表示用户或团队在产品内创建的条目，创建方式可以是自然语言 Agent Builder，也可以是未来的其他产品内创建方式。`Agent-built` 不作为来源筛选词。

第一版可以只实现轻量前端过滤；若某些筛选没有命中，展示空状态即可。

### 操作反馈

所有管理操作必须反馈，但不需要真实后端：

- `Edit`：打开轻量编辑占位区或 toast。
- `Duplicate`：toast，必要时可在列表里临时插入 copy mock。
- `Test run`：toast，显示 demo test queued / completed。
- `Disable Pipeline`：可切换本地状态为 `Inactive`，或 toast 后保持不变。
- `Disable connection`：用于 MCP Server，可切换本地连接状态为 `Inactive`，或 toast 后保持不变。
- Skill enabled switch：只切换本地 enabled 状态，不改变 source 或 installed 状态。
- `Review permissions`：toast 或详情中高亮 Access 区域。

不要用浏览器 alert。沿用现有 `statusMessage` toast 风格。

## 视觉设计

Capabilities 是管理台，不是 landing page。

要求：

- 保持当前 BioMap Agent 的安静、工作台式视觉。
- 不做 hero。
- 不做大面积装饰图。
- 不堆嵌套卡片。
- Pipelines、MCP Servers、Plugins 三栏布局清晰，信息密度高但不拥挤。
- 左侧导航宽度建议 `220px` 到 `240px`。
- 中间列表最小可读宽度建议 `420px`。
- 右侧详情面板宽度建议 `360px` 到 `400px`。
- Skills 内容区参考 Codex：列表居中偏宽，搜索框在顶部，详情使用居中弹窗。
- 分割线、浅背景、active 态和 badge 足够表达层级。
- 卡片/行圆角不超过现有系统习惯，建议不超过 `8px`。
- 避免单一紫蓝或深蓝主题，继续使用当前中性色和少量状态色。

### 响应式

本 Demo 主要面向桌面。

桌面：

- Pipelines、MCP Servers、Plugins 三栏并排。
- Pipelines、MCP Servers、Plugins 的中间列表和右侧详情独立滚动。
- Skills 使用单列表布局，详情以弹窗覆盖。

中等宽度：

- 保留左侧类型导航。
- Pipelines、MCP Servers、Plugins 的右侧详情可变为覆盖式 inspector 或移到列表下方，优先推荐覆盖式 inspector。
- Skills 保持列表 + 弹窗，弹窗宽度收敛到视口内。

窄屏：

- 不要求完整移动端体验。
- 至少保证文字不溢出、类型切换可用、详情可读。

## 数据模型

推荐新增展示层 mock 类型，不改现有 Thread 数据模型：

```ts
type CapabilityEntryKind = 'pipeline' | 'skill' | 'mcp-server' | 'plugin'
type CapabilityStatus = 'active' | 'draft' | 'inactive' | 'needs-review'
type CapabilitySource = 'preset' | 'created' | 'installed' | 'system'
type ProviderConnectionStatus = 'connected' | 'needs-review' | 'inactive'

type MockCapabilityEntry = {
  id: string
  kind: CapabilityEntryKind
  name: string
  description: string
  status: CapabilityStatus
  source: CapabilitySource
  connectionStatus?: ProviderConnectionStatus
  owner: string
  version: string
  tags: string[]
  enabledForMainAgent?: boolean
  lastUsedAt?: string
  updatedAt: string
  metrics: Array<{ label: string; value: string }>
  interface: {
    inputs: string[]
    outputs: string[]
    permissions: string[]
  }
  sections: Array<{
    title: string
    items: string[]
  }>
  recentActivity: string[]
}
```

实现时可以按类型扩展：

- Pipeline 增加 `steps`。
- Skill 增加 `presetLocked`、`instructions`、`triggers`、`examples` 和 `enabledForMainAgent`。
- MCP 增加 `tools`、`resources` 和 `connectionStatus`。
- Plugin 增加 `placeholderState`。

数据放在 `src/data/mockCapabilities.ts`，避免塞进现有 `mockData.ts` 导致文件继续膨胀。

## 组件边界

推荐新增：

- `CapabilitiesPage`
- `CapabilitiesTypeNav`
- `CapabilityList`
- `CapabilityDetail`
- `CapabilityToolbar`
- `SkillList`
- `SkillDetailModal`

`App` 负责：

- 当前顶层页面状态。
- 把 `showStatus` 传给 Capabilities 页面。

`TopNav` 负责：

- 接收当前 active item。
- 点击 item 时通知 `App` 切页或展示占位 toast。
- 不直接拥有页面状态。

现有 `Sidebar`、`ThreadWorkspace`、`RunInspector` 不需要为 Capabilities 改造。

## 文案

顶部导航：

- `Workspace`
- `Projects`
- `Assets`
- `Capabilities`

Capabilities 页面标题：

- `Capabilities`

类型说明：

- Pipelines：`Manage biological pipelines that the Main Agent can run or adapt during R&D work.`
- Skills：`Manage reusable Skills, including BioMap presets, user-created skills, and installed skills.`
- MCP Servers：`Review connected MCP servers, exposed tools, resources, and permission boundaries.`
- Plugins：`Manage additional plugin extensions. Placeholder entries are shown for the demo.`

主操作：

- `Build Pipeline with Agent`
- `Build Skill with Agent`
- `Connect MCP with Agent`
- `Request Plugin`

状态：

- `Active`
- `Draft`
- `Inactive`
- `Needs review`

来源：

- `Preset`
- `Created`
- `Installed`
- `System`

这套来源分类适用于 Pipelines、Skills、MCP Servers 和 Plugins。不要为不同类型创造额外来源词，避免筛选逻辑和文案分裂。

`Created` 是用户视角来源，不等同于实现方式；`Build with Agent` 是创建入口，不是 source 值。

## 测试计划

新增或更新测试覆盖：

1. 顶部 `Capabilities` 点击后进入 Capabilities 页面并显示 active 态。
2. 默认显示 `Pipelines`。
3. 左侧切换到 `Skills` 后显示 Codex 风格 Skill 列表。
4. 选择不同 Pipeline、MCP Server 或 Plugin 后右侧详情更新。
5. 预设 Skill 显示 `Preset` 徽标和 enabled 开关，但不显示 `Remove`、`Delete` 或直接编辑原件的操作。
6. 点击 Skill 行主体打开详情弹窗，点击启用开关只切换 mock enabled 状态。
7. `Build with Agent` 点击后触发状态 toast。
8. 搜索能过滤当前类型能力。
9. `npm test`、`npm run build`、`npm run lint` 通过。

## 后续扩展

本轮只做展示层级和轻量交互。后续可以逐步接入：

- 自然语言 Agent Builder 对话入口。
- Pipeline step 图编辑器。
- Skill instruction 编辑器。
- MCP 连接配置和权限审查。
- Plugin 安装、启用、卸载流程。
- Capabilities 与真实 Thread / Run Inspector 的调用记录联动。
