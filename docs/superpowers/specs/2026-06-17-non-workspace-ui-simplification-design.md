# Non-Workspace UI Simplification Design

## 状态

本 spec 定义 BioMap Agent Demo 中 **Workspace 之外的主应用页面** 的简洁化改造。

本轮基于 2026-06-17 Chrome 视觉巡检，当前桌面视口约 `1512 x 721`。巡检范围包括：

- `Projects`
- `Assets`，包含文件、知识库、数据、实验、模型、xTrimo、公开模型、项目模型、Oracle
- `Capabilities`，包含 Pipeline、Skill、MCP Server、Plugin
- `Approval Center`
- Bell 通知抽屉
- Full-page Notification Center

明确不纳入本轮问题范围：

- 管理后台与主应用割裂。管理后台本身就是另一个系统，可以保留独立 shell 和独立信息架构。
- Workspace 首页、Thread / 对话区、Run Inspector、Composer、左侧对话侧栏。
- 真实后端、真实权限、真实审批、真实通知推送。

术语遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md)。资产范围遵循 [ADR 0001](/Users/songxuzhengjun/Documents/BioMapAgent/docs/adr/0001-assets-scope-public-project.md)：只支持公开范围和项目范围，不引入个人资产层级。

## 目标

把当前 Workspace 之外的页面从“所有信息全部摊开”改成“默认简洁、需要时展开”的工作台体验。

目标体验：

1. 首屏只展示用户最常用的浏览、搜索、筛选和主操作。
2. 长字段、低频筛选、复杂图、详情信息进入折叠区、Page Inspector 或 hover 信息。
3. 各系统使用一致的筛选、详情、表格、卡片和更多菜单模式。
4. 保留 ToB 信息密度，但减少浅蓝胶囊、重复标题、冗余按钮和长文本。
5. Demo 看起来像一个成熟的企业研发操作系统，而不是每个功能页各自堆组件。

## 问题分级

### P0

- 当前视口下关键页面不应出现主页面横向溢出，主要操作不能被截断。
- Notification Center、Approval Center、Assets、Capabilities 的主内容区必须有可用滚动，不允许底部内容被浏览器边缘遮住。
- Bell 通知抽屉和 Full Notification Center 的职责必须分清：抽屉只做快速 triage，全屏页做完整检索和管理。

### P1

- 默认筛选区过高，不能占据两行以上的首屏空间。
- 表格默认列过多，长字段、对象 ID、endpoint 和完整 metadata 不应直接铺开。
- 卡片内 badge、按钮和浅蓝视觉元素过多，导致主次关系不清。
- Pipeline、xTrimo、知识库、实验等页面的详情信息必须进入渐进披露，不应默认压住主列表。

### P2

- 中英文术语混用需要统一。
- 各页面的更多菜单、Inspector、状态 badge 和 hover 信息需要一致。
- 小组件样式需要收敛，避免每个资产类型像不同产品。

## 设计原则

### 统一筛选模型

所有非 Workspace 页面默认使用同一套筛选层级：

```text
Search + 2 个核心筛选 + 更多筛选
```

规则：

- 搜索框始终在筛选行最左侧。
- 最多外露 2 个高频筛选。
- 其他筛选收进 `更多筛选` 弹出层或折叠行。
- `更多筛选` 中允许展示当前页面的完整筛选集合。
- 如果用户选择了高级筛选，按钮上显示已选数量，例如 `更多筛选 3`。
- 桌面优先使用弹出层，不默认把高级筛选展开成第二行。
- 已选高级筛选只显示摘要数量，不把所有筛选 chip 铺到筛选行。

### 统一详情 Inspector

需要查看完整信息的页面统一使用右侧 Inspector：

```text
Main content + optional right inspector
```

适用：

- Notification Center 的提醒详情。
- Capabilities 的 Pipeline / MCP / Plugin 详情。
- Assets 的知识库、实验、模型详情。
- Projects 的项目详情。

这里的 Inspector 是通用页面详情模式，组件名建议为 `PageInspector`。它不是 `Run Inspector`，不承载 Agent Run 的进度、输出、审批和能力调用流。用户可见文案统一使用 `详情`，不要把普通资产/项目详情写成 `运行信息`。

规则：

- Inspector 默认关闭。行点击、详情按钮或从通知入口进入具体对象时可以打开。
- 打开状态按页面或对象类型持久化到 Zustand。
- 如果持久化的选中对象不存在，保持 Inspector 关闭，不自动选择第一条造成误导。
- Inspector 宽度建议 `320px-380px`。
- Inspector 不抢主内容滚动权，内部独立滚动。
- 标题、关键状态、主操作在顶部；长描述、endpoint、完整 metadata 放在下方分组。

### 统一表格默认列

表格默认只展示核心列：

```text
名称 / 状态 / 来源或负责人 / 更新时间 / 主操作 / 更多
```

规则：

- 长英文标题、URL、模板 ID、权限成员、完整资产统计不在默认表格中展开。
- 每行最多一个文字主操作。
- 次级操作进入 `...` 菜单。
- 行点击或详情按钮打开 Inspector。
- 表格可保留横向滚动作为兜底，但默认桌面视口不应依赖横向滚动才能完成主要阅读。

### 统一卡片默认信息

卡片只展示：

- 名称。
- 一行描述。
- 一个主状态。
- 1-2 行关键 metadata。
- 一个主操作或 `...` 菜单。

不在卡片里堆：

- 多个状态 badge。
- 完整输入输出描述。
- 完整权限信息。
- 长 URL。
- 多个文字按钮。

### 视觉降噪

规则：

- 主色只用于：当前选中、主按钮、关键状态、必要提醒。
- 普通 metadata 使用灰色文本，不使用浅蓝胶囊。
- badge 只保留业务状态，例如 `进行中`、`待审批`、`已发布`、`异常`。
- 类型、范围、来源、版本优先使用灰色文本或 hover 信息。
- 卡片圆角和描边统一，避免每个模块都像一套独立设计。
- 页面标题不要重复，列表区只显示 `N 项` 或 `共 N 项`。

### 术语统一

UI 文案统一为中文业务口径：

| 当前混用词 | UI 建议 |
| --- | --- |
| Thread | 对话 |
| Provider | 来源 |
| healthy | 正常 |
| warning | 异常 |
| disabled | 停用 |
| node-level | 节点级 |
| result-level | 结果级 |
| Action Required | 待关注 |

内部代码可以保留英文类型名，但用户可见 UI 不应暴露不必要英文。
上表中的英文词可以出现在代码、类型名、spec 说明和开发文档中；验收时只检查用户可见 UI。

`Thread` 仍是内部领域概念和代码概念。用户可见 UI 统一写 `对话`，不要写 `任务`；`任务` 保留给实验任务、Work Order、Agent 执行步骤等操作对象。

`Capability Provider` 是领域概念，可以在文档和代码中保留；普通筛选和表格列的用户可见文案使用 `来源`。

### 数据不丢失原则

本轮是信息架构和视觉降噪，不是删除业务信息：

- 从默认列表或卡片中移走的字段，必须能在 Inspector、详情页、`...` 菜单、hover 信息或高级筛选中找到。
- 会改变源业务对象的动作必须保留明确入口和状态反馈。
- 清除通知、关闭 Inspector、折叠推荐区等 UI 动作不能改变 Approval Request、Run、Asset、Project 等源对象。

## Scope

### Included

- 新增或重构共享筛选组件。
- 新增或重构共享 Inspector 组件模式。
- 简化 Projects 表格列和筛选区。
- 简化 Assets 各资产类别的标题、筛选、卡片和表格。
- 简化 xTrimo 模型页，减少首屏视觉噪声。
- 简化 Capabilities，尤其是 Pipeline 默认视图和 DAG 展示。
- 重组 Approval Center 左侧菜单分组，减少表格默认列。
- 简化通知抽屉和 Notification Center 全屏页。
- 修正用户可见中英文术语混用。
- 用 Zustand 持久化关键 UI 展开状态。
- 更新相关测试。

### Not Included

- 管理后台 shell 统一化。
- 真实数据接口。
- 真实审批流程执行。
- 真实通知推送。
- 真实资产详情编辑。
- 重写 Workspace 对话体验。
- 引入新的路由库。
- 大规模 CSS 主题系统重写。

## Projects 改造

### 当前问题

Projects 表格默认展示了项目、状态、负责人、读写权限、对话、资产、最近活动、标签和更多操作。首屏信息过多，用户很难快速判断“我该打开哪个项目”。

### 新默认布局

顶部：

```text
项目管理                                      [导出] [新建项目]
[全部] [我的收藏] [回收站]
[搜索项目、负责人或成员] [状态 v] [负责人 v] [更多筛选]
```

默认表格列：

```text
项目 / 状态 / 负责人 / 最近活动 / 更多
```

进入 Inspector 或行展开后展示：

- 标签。
- 读权限。
- 写权限。
- 对话数。
- 文件、数据、实验、模型数量。
- 成员。
- 完整最近活动。

### 行内操作

默认行内只保留：

- 点击项目名称进入项目。
- `...` 菜单。

`...` 菜单包含：

- 查看详情。
- 收藏 / 取消收藏。
- 编辑项目。
- 归档。

## Assets 改造

Assets 改造必须保留既有领域边界：

- `文件` 是 File Space，可以展示 Project Files 和 File Assets，但不表示所有文件都是 Asset。
- `知识库` 是 Knowledge Base 资产，不是原始文件夹。
- `数据` 是 Data Asset。
- `实验` 是 Experiment Asset。
- `模型` 是 Model Asset。
- Asset Scope 只有 `公开范围` 和 `项目范围` 两级。

### 统一资产页面壳

右侧主内容统一结构：

```text
Header
  Title
  Primary actions
FilterBar
Content
Inspector optional
```

标题区：

- 只显示一个主标题。
- 不重复显示列表标题。
- 列表数量放在标题右侧或内容区右上角，例如 `6 项`。

动作区：

- `新建` 和 `上传` 根据资产类型显示。
- `xTrimo`、`公开模型` 不显示 `上传`。
- `Oracle` 第一版只展示可调用资产，不显示训练或发布动作。

### 文件

默认视图：

```text
公共文件
[搜索文件] [文件类型 v] [更新时间 v] [更多筛选]
```

默认表格列：

```text
名称 / 范围 / 类型 / 更新时间 / 更多
```

项目文件保留文件夹卡片，但卡片只展示：

- 文件夹名。
- 项目范围。
- 最近更新时间。
- 文件数量。

### 知识库

默认视图：

```text
全部知识库
[搜索知识库] [类型 v] [状态 v] [更多筛选]
```

默认表格列：

```text
名称 / 类型 / 范围 / 状态 / 更新时间 / 更多
```

长描述、内容规模、关联文件、版本记录进入详情页或 Inspector。

知识库详情页保持：

- 顶部摘要信息。
- Tab：`知识库概览`、`使用文件`、`版本记录`。

详情页摘要区不要做大商品页 hero，保持工作台密度。

### 数据

数据资产页默认保留列表式表达：

```text
数据集 / 数据表 / 分析结果 / 数据目录
```

每个对象默认展示：

- 名称。
- 类型。
- 范围。
- 行数或结果数量。
- 更新时间。

完整 schema、字段、来源任务进入 Inspector。

### 实验

左侧二级菜单保持：

```text
实验列表
执行
库存
设备
配方
```

`设备` 不再写成 `配置`。

默认支持卡片 / 表格切换，但两种视图都要降噪：

- 卡片默认展示名称、类型、状态、关键对象、更新时间。
- 表格默认展示名称、类型、状态、关联项目、更新时间、更多。
- 实验参数、设备能力、库存位置、配方步骤进入 Inspector。

实验筛选：

```text
[搜索实验资产] [类型 v] [状态 v] [更多筛选]
```

### 模型 / xTrimo

#### xTrimo 页面

当前 `xTrimo` 的三行筛选 chip、Agent 推荐横向卡片、模型目录大图卡片同时出现，首屏视觉噪声较高。

新结构：

```text
xTrimo                                      [...]
[综合 v] [搜索关键词]
[能力 v] [实体 v] [更多筛选]

[推荐用于当前项目的 6 个模型  >]   默认折叠

模型目录                                             33 项
ModelCard grid
```

默认外露筛选：

- 能力。
- 实体。

收进 `更多筛选`：

- 状态。
- 版本。
- 是否可调用。
- 是否 Agent 推荐。

Agent 推荐：

- 默认折叠成一行。
- 点击后展开横向推荐区。
- 展开状态持久化。
- 推荐区卡片高度比目录卡片更低，不抢主视图。

模型卡片：

- 图片保留，但高度统一。
- 状态只保留 `已上线` 或 `即将上线`。
- `可调用` 改为灰色 metadata 或详情信息，不作为第二个 badge。
- 输入输出信息只保留一行。
- 详情按钮保留。

#### 公开模型 / 项目模型 / Oracle

默认采用统一列表：

```text
模型资产 N 项
名称 / 状态 / 范围 / 更新时间 / 更多
```

模型说明、输入输出、适用场景进入 Inspector。

## Capabilities 改造

Capabilities 改造必须保留既有领域边界：

- `Capability` 是 Agent 可复用能力，不是页面模块。
- `Pipeline` 是受治理的流程能力，不是 Approval Flow，也不是静态 DAG 图片。
- `Skill` 是 Agent 指令包，不是 Pipeline。
- `MCP Server` 是 Capability Provider。
- `Plugin` 是扩展面，不是 Document Block，也不是 MCP Server。
- Capabilities 不是 Assets。Capability 可以引用 Asset，但不作为资产类别出现在 Assets Workbench 中。

### 当前问题

Pipeline 页面同时展示类型导航、列表、详情、统计卡和 DAG，且列表和 DAG 都有独立滚动。默认页更像调试界面，不像能力资产管理页。

### 页面模型

Capabilities 使用两层结构：

```text
TypeNav + MainList + optional Inspector
```

左侧类型导航保持：

- Pipeline
- Skill
- MCP Server
- Plugin

主区默认只做浏览和筛选：

```text
Pipelines                                  [用 Agent 构建 Pipeline]
[搜索 Pipeline] [来源 v] [状态 v] [更多筛选]
List
```

### Pipeline

默认列表行展示：

- 名称。
- 状态。
- 一行描述。
- 来源。
- 最近更新时间。
- 更多。

选中后打开 Inspector：

- 名称、状态、版本。
- 简介。
- 关键统计：步骤数、审批点、最近运行。
- 调用入口。
- DAG 摘要。

DAG 默认折叠：

```text
执行 DAG  7 步 · 1 个审批点 · 最近运行 14 次  [展开] [最大化]
```

展开后才显示 canvas。这样默认列表页不被大图占据。

### Skill / MCP Server / Plugin

三类页面统一列表密度：

```text
名称 / 状态 / 来源 / 更新时间 / 更多
```

Skill 保留详情弹窗也可以，但入口和信息密度要和 MCP / Plugin 一致。

`MCP Server` 和 `Plugin` 的来源、连接状态、工具数、权限等进入 Inspector，不在列表中全部铺开。

## Approval Center 改造

Approval Center 遵循 [ADR 0003](/Users/songxuzhengjun/Documents/BioMapAgent/docs/adr/0003-external-approval-connectors-are-black-box.md)：外部企业审批系统对 BioMap 可以是不透明黑盒。BioMap 负责发起、撤回通知、接收回调、记录结果和审计完整度，不在平台内复刻外部系统的内部阶段、处理人和流转规则。

### 信息架构

左侧菜单从 10 个平铺项改为分组：

```text
审批工作台
  总览
  待处理
  我发起的

记录
  审批记录
  审计日志

配置
  操作规则
  审批流程
  审批人组

集成
  外部审批
  模拟测试
```

分组标题使用小号灰色文本，菜单仍保持单列。

### 表格降噪

所有审批表格默认只展示核心列：

```text
标题 / 类型 / 状态 / 当前节点或结果 / 更新时间 / 更多
```

进入 Inspector 后展示：

- 审批编号。
- 项目。
- 发起人。
- 审批路线。
- 风险等级。
- 资料包模板。
- 审计完整度。
- 外部流程编号。

### 外部审批

外部审批连接器表格不要直接摊完整 endpoint。

默认列：

```text
连接器 / 来源 / 状态 / 外部流程 / 同步策略 / 审计 / 更多
```

endpoint 展示为：

```text
已配置 3 个端点
```

点击 Inspector 后展示：

- 提交端点。
- 回调端点。
- 撤回端点。
- 最近同步时间。
- 错误策略。
- 审计策略。

撤回对接外部审批时，BioMap 的动作是向外部系统发送撤回通知并记录结果，不把外部撤回链路建模为 BioMap 内部 Approval Flow。

## Notification 改造

### Bell 通知抽屉

通知抽屉只用于快速 triage。

抽屉展示：

```text
通知                         [查看全部] [全部已读]
[全部] [待关注] [审批] [Agent] [资产] [系统]
List
```

每条通知只展示：

- 标题。
- 状态。
- 来源。
- 时间。
- 一个主操作。

不展示：

- 长摘要。
- 多个操作按钮。
- 完整对象 ID。
- 复杂业务状态。

摘要文字最多一行，超出后截断。完整内容进入通知中心 Inspector。

### Full Notification Center

顶部：

```text
通知中心
待关注 3 · 未读 4 · 今日 7 · 异常 1
```

筛选区：

```text
[全部] [待关注] [未读] [审批] [Agent] [资产] [系统]
[搜索通知、项目、对象] [提醒状态 v] [时间 v] [更多筛选]
```

收进更多筛选：

- 业务状态。
- 来源。
- 类型。
- 已读状态。

批量操作：

- 默认隐藏。
- 选中至少一条通知后显示 `全部已读`、`批量清除提醒`。
- `批量清除提醒` 只改变通知提醒状态，不改变业务对象。
- 批量选择状态不持久化，离开页面或刷新后清空。

表格默认列：

```text
提醒 / 类型 / 通知内容 / 来源 / 时间 / 主操作 / 更多
```

业务状态、对象 ID、完整来源进入 Inspector。

### 通知中心 Inspector

Inspector 展示：

- 标题。
- 类型。
- 提醒状态。
- 业务状态。
- 来源。
- 对象。
- 时间。
- 摘要。
- 主操作按钮。
- 清除提醒按钮。

进入 Notification Center 时默认不打开 Inspector。用户点击通知行、点击 Bell 抽屉中的具体通知，或通过 URL / 路由状态带入通知 ID 时，才打开对应 Inspector。用户关闭 Inspector 后写入 Zustand，后续进入同一页面保持关闭。

主操作文案统一：

- `去审批`
- `打开对话`
- `查看资产`
- `查看详情`

不再出现 `打开 Thread`。

## Zustand 状态

新增或调整 UI 状态：

```ts
type SimplifiedUiState = {
  projectsInspectorOpen: boolean
  projectsSelectedId?: string
  projectsAdvancedFiltersOpen: boolean

  assetsInspectorOpenBySection: Record<string, boolean>
  assetsSelectedObjectIdBySection: Record<string, string | undefined>
  assetsAdvancedFilterOpenBySection: Record<string, boolean>
  assetsViewModeBySection: Record<string, 'table' | 'card'>
  xtrimoRecommendationsExpanded: boolean

  capabilitiesInspectorOpen: boolean
  capabilitiesSelectedIdByType: Record<string, string | undefined>
  capabilitiesDagExpandedById: Record<string, boolean>
  capabilitiesAdvancedFiltersOpenByType: Record<string, boolean>

  approvalMenuGroupsCollapsed: Record<string, boolean>
  approvalInspectorOpen: boolean
  approvalSelectedObjectId?: string
  approvalAdvancedFiltersOpen: boolean

  notificationCenterInspectorOpen: boolean
  notificationCenterSelectedId?: string
  notificationCenterAdvancedFiltersOpen: boolean
}
```

持久化规则：

- Inspector 开关可以持久化。
- 选中对象可以持久化，但对象不存在时清空选中对象并关闭 Inspector。
- 高级筛选展开状态可以持久化。
- 表格 / 卡片视图偏好可以持久化。
- 批量选择状态不持久化。
- 通知和审批的业务状态不在这里持久化，仍来自 mock 数据或后续真实服务。

## Component Plan

建议新增或抽象以下共享组件：

- `CompactFilterBar`
- `AdvancedFilterPanel`
- `PageInspector`
- `CompactDataTable`
- `RowOverflowMenu`
- `StatusBadge`
- `MetadataText`
- `PageSectionHeader`

这些组件不是为了重做设计系统，而是为了让本轮降噪有统一实现入口。

## Testing

需要覆盖：

- Projects 默认列减少，详情信息进入 Inspector。
- Assets 各 section 切换仍正常。
- xTrimo 推荐区默认折叠，点击后展开并持久化。
- Capabilities Pipeline 默认不展开 DAG，点击后展开。
- Approval Center 分组菜单可访问所有原有页面。
- 外部审批 endpoint 默认不直接摊开，Inspector 可见完整信息。
- Notification Center 默认批量操作隐藏，选中后显示。
- Notification Center 默认 Inspector 关闭，点击行后打开，关闭后状态可持久化。
- Bell 通知抽屉能进入 Full Notification Center，并可带入具体通知打开详情。
- `打开 Thread` 不再出现在用户可见 UI 中。
- 关键页面在 `1512 x 721` 视口下无横向页面溢出。
- 关键页面主内容和 Inspector 都可以独立滚动，底部内容不会被浏览器边缘遮住。

## Acceptance Criteria

1. Workspace 外主应用页面的筛选区不再出现三行以上默认筛选。
2. `Projects` 默认表格列减少到核心阅读路径。
3. `Assets > xTrimo` 首屏默认不同时展开 Agent 推荐和完整筛选 chip。
4. `Capabilities > Pipeline` 默认不显示完整 DAG canvas。
5. `Approval Center` 左侧菜单有明确分组。
6. `Notification Center` 全屏页默认批量操作不抢首屏。
7. Bell 通知抽屉只做快速提醒，不复制完整通知中心能力。
8. 用户可见 UI 不再出现 `Thread`、`healthy`、`warning`、`disabled`、`Provider` 等未必要英文。
9. 主要页面仍保留 ToB 信息密度，不改成低密度营销页。
10. 管理后台保持独立系统，不在本轮统一到 BioMap Agent 主应用 shell。
11. 所有从默认列表中移出的字段仍可通过 Inspector、详情页、高级筛选、hover 或更多菜单访问。
12. 外部审批连接器不展示外部企业审批的内部阶段模型，只展示 BioMap 侧提交、撤回、回调、结果和审计状态。

## Open Decisions Resolved

- 管理后台独立不是问题，本轮不调整。
- 本轮重点是简洁性和一致性，不改变 mock 数据的业务含义。
- 默认采用“保留信息密度 + 渐进披露”，不是删掉功能。
- 先做桌面端当前 Demo 视口体验，不做移动端专项。
