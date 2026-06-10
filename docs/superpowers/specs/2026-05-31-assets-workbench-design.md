# Assets Workbench 设计

## 状态

本 spec 定义 BioMap Agent Demo 顶部导航 `Assets` 页面。它建立在当前 Agent Workspace、项目 / 对话侧栏、EGFR 对话回放和 Run Inspector 之后，新增一个轻交互的资产工作台。

术语遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md)：

- **Asset**：Main Agent 可引用、调用、生成或复用的持久化研发资产。
- **Assets Workbench**：用于查找持久研发资产和相关文件资源的顶层产品区域。
- **File Space**：Assets Workbench 内的文件管理区，可以展示 Project Files 和 File Assets。
- **Project File**：项目下的文件对象，可以被 Thread 引用，但默认不是 Asset。
- **File Asset**：已经登记为可复用或可引用的持久文件类资产。
- **Data Asset**、**Experiment Asset**、**Model Asset** 分别对应数据、实验和模型资产。
- **Experiment Order**、**Experiment Task**、**CRO Order**、**Experiment Workflow**、**Candidate Molecule** 等实验对象沿用现有领域定义。
- 中文 UI 中 `Thread` 仍称为 `对话`，本 spec 不改对话侧栏。

第一版 Assets 是纯前端 Demo：用 mock data 表达资产类型、文件资源、组织方式和轻量交互，不接后端、不做真实上传、不做真实权限系统。

## 目标

1. 顶部导航点击 `Assets` 后进入一个独立资产工作台页面。
2. 表达 BioMap Agent 的资产范围不只是云盘文件，而是 File Space、Data Assets、Experiment Assets、Model Assets 四类可调用资源 / 资产视图。
3. 参考飞书云盘的文件组织方式，但不把整个 Assets 做成单纯对象存储。
4. 支持公共范围和项目范围两类资产可见性，不引入个人资产层级。
5. 左侧是纯资产菜单，不重复 `Projects` 顶导里的项目列表。
6. 第一版实现轻交互：菜单切换、搜索过滤、选中视图、mock 弹窗和 Zustand 持久化。

## 非目标

不包含：

- 真实文件上传、下载、预览和删除恢复。
- 真实权限校验、共享链接、组织通讯录或项目成员管理。
- 真实 BioMap OS 数据中心、智能实验、模型平台后端接口。
- 完整 Experiment Asset CRUD。
- 完整模型训练、发布、部署和推理任务。
- 新增 `Templates` / `模板` 一级菜单。
- 在 Assets 左侧展示项目列表。
- 重做当前 Workspace 首页、Thread 对话区、Run Inspector 或 Pipelines 页面。

## 资产范围

Assets Workbench 只支持两个可见范围：

- **公共范围**：系统或组织级范围，所有有权限成员可访问。示例：公共 File Assets、公共 Data Assets、公开 Model Assets、xTrimo 模型说明、通用 SOP。
- **项目范围**：项目级范围，加入项目的成员可访问。示例：Project Files、项目 Data Assets、Experiment Orders、Experiment Records、项目微调 Model Assets。

不存在个人资产层级。若用户需要个人资产区，应创建一个个人项目，通过项目范围承载。

范围在 UI 中作为筛选、标签或路径信息出现，不作为顶层导航。第一版不做个人私有空间。

该边界记录在 [ADR 0001](/Users/songxuzhengjun/Documents/BioMapAgent/docs/adr/0001-assets-scope-public-project.md)。

## 顶层信息架构

`Assets` 页左侧是纯菜单，一级菜单固定为：

```text
文件
数据
实验
模型
```

删除 `模板` 一级菜单。模板类内容后续按资产性质归入其他位置：

- SOP / 方案文档可以放入 `文件`。
- 数据处理模板可以放入 `数据`。
- 实验工作流模板可以放入 `实验 > 配置`。
- Agent Skill / Prompt 模板第一版不进入 Assets，可留给后续能力市场或 Pipelines 讨论。

一级菜单的 UI 标签保持简洁，但领域含义如下：

- `文件` = **File Space**，展示文件资源和 File Assets。
- `数据` = **Data Assets**。
- `实验` = **Experiment Assets**。
- `模型` = **Model Assets**。

## 左侧菜单

左侧菜单不展示项目列表，只展示资产类型和二级入口。

```text
文件
  公共文件
  项目文件
  最近上传
  归档

数据
  数据集
  数据表
  分析结果
  数据目录

实验
  需求
  执行
  库存
  配置

模型
  xTrimo
  公开模型
  项目模型
  Oracle
```

### 菜单规则

- 左侧菜单是 Assets 页自己的导航，不影响 Workspace 的对话侧栏状态。
- 当前一级和二级菜单有选中态。
- 菜单切换后主内容区替换为对应视图。
- 一级菜单点击时，默认进入该组第一个二级入口：
  - 文件 -> 项目文件
  - 数据 -> 数据集
  - 实验 -> 需求
  - 模型 -> xTrimo
- 选中菜单状态需要持久化，刷新后回到用户上次浏览的 Assets 位置。

## 默认页面

点击顶栏 `Assets` 后默认进入：

```text
文件 > 项目文件
```

如果用户之前浏览过 Assets 且持久化状态有效，则恢复上次选中的菜单。

默认页面采用飞书云盘式结构：

- 左侧资产菜单。
- 主内容区顶部标题 `项目文件`。
- 顶部操作卡 / 工具条。
- 项目文件夹卡片区。
- 文件列表区。

顶部可以展示轻量资产概览，让页面看起来是 BioMap 的资产中心，而不是普通网盘：

```text
项目文件资源 128
数据集 24
实验资产 312
模型 53
```

概览数据来自 mock，不需要可点击。

## 页面骨架

Assets 采用统一工作台骨架，不同资产类型使用不同主内容视图。

```text
TopNav
AssetsShell
  ├─ AssetsSidebar
  └─ AssetsMain
      ├─ AssetsHeader
      ├─ AssetsToolbar
      ├─ OptionalSummary
      └─ AssetContent
```

### TopNav

- `Assets` tab 点击后进入 Assets 页面并显示选中态。
- `Workspace`、`Projects`、`Pipelines` 保持现有行为。
- 不新增二级顶栏。

### AssetsSidebar

- 宽度建议 `240px` 到 `260px`，比当前 Workspace 对话侧栏略窄或接近。
- 背景可沿用现有侧栏浅色。
- 不显示 BioMap Agent logo。
- 不显示项目树。
- 菜单行使用 icon + 文案。
- 二级菜单缩进清晰，但不要做成复杂树控件。

### AssetsMain

- 背景保持白色或极浅灰。
- 主内容区不做大 hero。
- 使用 ToB 工作台布局：标题、工具、筛选、内容。
- 卡片圆角不超过现有系统风格，建议 `8px`。
- 表格 / 列表比营销卡片更重要，信息密度应适中。

## 文件视图

文件视图是 **File Space**，也是最接近飞书云盘的部分，支持文件夹卡片和文件列表。

重要边界：

- File Space 可以展示公共文件、Project Files 和 File Assets。
- Thread 上传附件默认是 Project File，不自动成为 File Asset。
- 只有被保存、归档、登记或发布为可复用文件类产物后，才称为 File Asset。
- 因此 `文件` 是 Assets Workbench 内的文件资源视图，不代表“所有文件都是 Asset”。

### 二级入口

#### 公共文件

组织级公共 File Space。示例：

- `标准 SOP`
- `公共抗体资料`
- `平台说明文档`
- `合规模板`

主内容区显示：

- 文件夹卡片。
- 文档列表。
- 范围标签 `公共`。

#### 项目文件

项目范围 File Space，但左侧不展开项目列表。主内容区第一层展示项目文件夹卡片。

项目文件夹卡片是内容区里的文件路径入口，不是 `Projects` 顶导的项目管理列表。`Projects` 负责项目元数据、成员和进度；`Assets > 文件 > 项目文件` 只负责项目范围文件资源。

示例文件夹：

- `Antibody Optimization`
- `Enzyme Discovery`
- `Data Assetization`
- `Model-to-Oracle`
- `Protein Delivery`

进入某个项目文件夹第一版可以只做选中 / 面包屑视觉状态，不必须做深层路由。

项目文件 / File Asset 示例：

- `EGFR_parent_antibody_baseline.xlsx`
- `BLI_raw_export_2026-05-22.csv`
- `SEC_HPLC_report.pdf`
- `MOO_candidates_ranked.xlsx`
- `Experiment_Order_Draft_EGFR-0529.docx`

#### 最近上传

显示用户有权限访问范围内的最近上传文件资源。

规则：

- 按上传时间倒序。
- 同时包含公共文件资源和项目文件资源。
- 每行显示范围、所属项目或公共目录、文件类型和上传者。

#### 归档

显示低频访问或已归档文件。

第一版只展示 mock 列表，不实现恢复、彻底删除或归档权限。

### 文件工具条

文件页工具条建议包含：

- `新建`：mock dropdown，可显示 `文件夹`、`文档`、`数据表`。
- `上传`：mock 弹窗，不真正选择文件。
- `搜索`：过滤当前文件列表。
- `排序`：mock dropdown，支持 `最近修改`、`名称`、`创建时间`。
- `视图切换`：列表 / 网格，状态持久化。

## 数据视图

数据视图展示 **Data Assets**，不是单纯文件表格，也不是原始上传文件列表。原始 CSV/XLSX 上传后仍是 Project File；清洗、标准化、登记后才成为 Data Asset。

### 二级入口

#### 数据集

用于展示 AI-ready dataset、训练集、验证集、公共数据集。

字段建议：

- 名称
- 范围：公共 / 项目
- 来源：实验记录、上传、清洗流程、外部导入
- 实体类型：Antibody、Protein、Assay、Omics 等
- 样本量
- 状态：草稿、可用、需清洗、已归档
- 最近更新

#### 数据表

用于展示结构化表格资产。

示例：

- `BLI kinetic table`
- `SEC-HPLC purity table`
- `Expression yield matrix`
- `MOO score matrix`

字段建议：

- 表名
- 行数 / 列数
- 所属项目
- 数据类型
- 最近更新

#### 分析结果

用于展示图表、统计分析、Notebook 输出和 Insight 报告。

示例：

- `EGFR affinity Pareto analysis`
- `SEC-HPLC outlier detection`
- `Yield vs Stability correlation`

内容形态可以是卡片 + 列表混合，不做真实图表渲染。

#### 数据目录

用于展示跨项目、跨来源的数据 catalog。

字段建议：

- 实体
- 来源模块：蛋白设计、智能实验、文件上传、模型推理
- 标准化状态
- 关联资产数量
- 权限范围

## 实验视图

实验视图展示 **Experiment Assets**。菜单基于 BioMap OS 智能实验手册收敛，不在左侧展开十几个对象。左侧只显示四个入口：

```text
需求
执行
库存
配置
```

具体对象在右侧主内容区展示。

实验视图不负责直接运行真实湿实验；它展示可引用、可追踪或可复用的实验域对象。发起真实流程属于后续 Capability / Pipeline / 后端集成范围。

### 需求

表示实验需求从分子到订单再到任务的入口。

右侧可以用三个对象 Tab 或对象卡：

- **分子**：来自分子注册，支持单抗、双抗、抗原融合蛋白等分类。
- **实验订单**：选择分子和实验目标后提交审核的对象。
- **实验任务**：多个目标一致的订单合并后形成的执行对象，即 Experiment Task。

第一版默认展示 `实验订单` 列表，因为它最能表达 Agent 后续可以“发起订单”和“等待审核”。

订单字段建议：

- 订单 ID
- 项目
- 分子数
- 蛋白制备步骤
- 测定性质
- 状态：草稿、待审核、已通过、已取消
- 创建人
- 更新时间

### 执行

表示实验实际落地和结果回收。

对象：

- **实验调度**：内部执行任务卡片。
- **CRO 订单**：外包实验订单状态。
- **实验记录**：完成后的实验归档和结果。

第一版默认展示 `实验记录` 或 `CRO 订单` 列表。建议默认 `实验记录`，因为它更像资产沉淀。

### 库存

表示实验资源资产。

对象：

- **样本**
- **物料**
- **孔板**

库存对象字段建议：

- 名称 / 编号
- 类型
- 所属项目
- 位置
- 数量 / 状态
- 最近操作

样本-孔板关联第一版可以作为孔板详情提示，不单独放左侧菜单。

### 配置

表示实验流程基础数据。

对象：

- **设备**
- **点位**
- **线路**
- **实验工作流**

注意：

- 这里的 `实验工作流` 是智能实验里的实验方法 / 节点模板，不等同于顶导 `Pipelines`。
- UI 中可以显示 `实验工作流`，避免和全局 Pipelines 混淆。

## 模型视图

模型视图展示 **Model Assets**：可被 Main Agent 调用、比较、复用或部署的模型资产。它不是完整模型训练平台，也不展示临时推理任务或训练日志。

### 二级入口

#### xTrimo

BioMap 自研基础模型和专用模型。

第一版实现需要展示更真实的 xTrimo 模型资产目录，而不是只放少量示例模型。详细范围、模型清单、信息密度和交互设计见增量 spec：

[2026-06-01-xtrimo-model-assets-design.md](/Users/songxuzhengjun/Documents/BioMapAgent/docs/superpowers/specs/2026-06-01-xtrimo-model-assets-design.md)

#### 公开模型

开源、论文模型或外部模型引用。

字段建议：

- 模型名称
- 来源
- License
- 支持任务
- 接入状态

#### 项目模型

项目内微调、私有训练或版本化模型。

字段建议：

- 模型名称
- 所属项目
- 底座模型
- 任务类型
- 指标
- 部署状态
- 最近更新

#### Oracle

面向性质预测、打分、筛选的任务模型。

示例：

- `EGFR Affinity Oracle`
- `Expression Yield Oracle`
- `Aggregation Risk Oracle`
- `Developability Oracle`

Oracle 视图应强调可调用性和最近使用，而不是训练过程。Oracle 是 task-specific Model Asset，不是单独的系统角色。

## 搜索与筛选

第一版搜索是当前二级入口内的本地过滤。

规则：

- 搜索框位于主内容区工具条。
- 输入时过滤当前 mock 数据。
- 支持按名称、ID、项目、标签、状态等文本字段匹配。
- 切换左侧菜单时搜索词默认清空。
- 搜索词可以不持久化，避免刷新后页面变空。

筛选：

- 每个视图可有轻量状态筛选，如 `全部 / 公共 / 项目` 或 `全部 / 可用 / 待审核 / 已归档`。
- 第一版筛选只影响 mock 列表，不需要复杂组合查询。

## Mock 数据

新增或扩展 mock data 时，建议使用结构化类型，而不是把文案写死在组件里。

建议类型：

```ts
type AssetScope = "public" | "project"

type ScopedResourceBase = {
  id: string
  name: string
  scope: AssetScope
  projectId?: string
  projectName?: string
  updatedAt: string
  owner: string
  status?: string
  tags?: string[]
}

type FileResource = ScopedResourceBase & {
  kind: "file"
  resourceType: "projectFile" | "fileAsset"
  fileType: "folder" | "xlsx" | "csv" | "pdf" | "docx" | "image" | "other"
  size?: string
  path: string[]
}

type DataAsset = ScopedResourceBase & {
  kind: "data"
  dataType: "dataset" | "table" | "analysisResult" | "catalogEntry"
  entityType: string
  rows?: number
  source?: string
}

type ExperimentAsset = ScopedResourceBase & {
  kind: "experiment"
  domain: "request" | "execution" | "inventory" | "configuration"
  objectType: "molecule" | "experimentOrder" | "experimentTask" | "schedule" | "croOrder" | "record" | "sample" | "material" | "plate" | "device" | "location" | "route" | "experimentWorkflow"
}

type ModelAsset = ScopedResourceBase & {
  kind: "model"
  modelGroup: "xTrimo" | "public" | "project" | "oracle"
  taskType: string
  version?: string
  metric?: string
}
```

实现时可以按现有代码风格拆成更小类型，不强制完全照抄。

## Zustand 状态

需要持久化：

- 当前 Assets 一级菜单。
- 当前 Assets 二级菜单。
- 文件视图模式：列表 / 网格。
- 最近打开的项目文件夹视觉状态，如果第一版实现文件夹进入。

不持久化：

- 搜索词。
- 当前打开的 mock 弹窗。
- 当前打开的更多菜单。
- hover / focus 状态。
- mock 上传中的临时表单。

状态应放入现有 demo store 或 Assets 专用 store。第一版建议复用现有 Zustand store，但用清晰命名隔离：

```ts
assetsActiveSection
assetsActiveItem
assetsFileViewMode
```

## 轻交互

第一版实现以下交互：

- 顶导 `Assets` 可进入 Assets 页面。
- 左侧菜单可切换一级 / 二级入口。
- 选中态刷新后保持。
- 文件页列表 / 网格切换刷新后保持。
- 搜索当前列表。
- `新建`、`上传`、`更多`可打开 mock 弹窗或 dropdown。
- 文件夹卡片可选中；项目文件夹可进入一级 mock 面包屑。

不实现：

- 真实上传文件。
- 真实创建资产。
- 真实删除 / 归档 / 恢复。
- 拖拽移动。
- 批量选择。
- 真实表格分页或服务端排序。

## 空状态与错误状态

空状态文案应按资产类型写清楚，不使用泛泛的 `暂无数据`：

- 文件：`当前目录还没有文件`
- 数据集：`还没有可复用的数据集`
- 实验：`还没有关联的实验资产`
- 模型：`还没有可调用的模型资产`

错误状态第一版不需要真实触发，可保留组件边界：

- mock 上传失败。
- mock 新建失败。
- 数据加载失败。

## 视觉方向

- 整体是 BioMap Agent 的 ToB 资产工作台，不是营销页。
- 文件页参考飞书云盘：操作卡、文件夹卡片、文件列表。
- 数据、实验、模型页使用更接近 catalog / table / card 的结构。
- 卡片不要过度装饰，信息密度要比首页案例卡更高。
- 图标使用现有 icon 体系或 lucide，不手画复杂 SVG。
- 避免大面积单一蓝色，保留 BioMap 当前蓝绿色主色作为动作色。

## 测试策略

需要补充测试：

- 顶导点击 `Assets` 后显示 Assets 页面和选中态。
- 默认进入 `文件 > 项目文件`。
- 左侧菜单切换后主标题和内容变化。
- 搜索过滤当前 mock 列表。
- 文件视图模式切换并持久化。
- 选中 Assets 菜单刷新后恢复。
- `模板` 不作为一级菜单出现。
- `实验` 左侧只显示 `需求 / 执行 / 库存 / 配置`，不直接铺开分子、订单、样本等对象。
- `文件` 视图能区分 Project File 和 File Asset，不把所有上传文件都叫 Asset。
- 不出现个人资产 / 私人空间入口。

## 实施建议

建议分两步实施：

1. 建立 Assets 页面壳、路由 / tab 状态、左侧菜单和文件默认页。
2. 补齐数据、实验、模型三类视图和轻交互状态持久化。

如果一次完成，仍应保持文件拆分清晰：

- `src/data/assetsMockData.ts`
- `src/components/assets/AssetsPage.tsx`
- `src/components/assets/AssetsSidebar.tsx`
- `src/components/assets/AssetsToolbar.tsx`
- `src/components/assets/FileSpaceView.tsx`
- `src/components/assets/DataAssetsView.tsx`
- `src/components/assets/ExperimentAssetsView.tsx`
- `src/components/assets/ModelAssetsView.tsx`

具体文件名可按现有项目风格调整。

## Self Review

- 没有占位符或未完成条目。
- Asset Scope 明确为公共和项目两级，没有个人层级。
- 一级菜单明确为文件、数据、实验、模型，已删除模板。
- `文件` 已明确为 File Space，不再暗示所有项目文件都是 Asset。
- 实验菜单按 BioMap OS 智能实验手册收敛为需求、执行、库存、配置。
- 左侧不展示项目列表，项目文件通过右侧项目文件夹表达。
- 第一版范围限定为轻交互 Demo，不承诺真实后端能力。
