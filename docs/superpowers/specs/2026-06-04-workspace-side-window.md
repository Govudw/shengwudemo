# Workspace 侧窗 Spec

日期：2026-06-04  
范围：Workspace Thread 页面右侧扩展窗体，覆盖文件浏览与侧边聊天两个能力。

## 背景

当前 Thread 页面右侧已有“运行信息”面板，用来展示 Agent 执行进度、输出和待处理事项。新的需求是在同一区域增加一个额外侧窗，用来承载项目文件浏览和侧边聊天。这个入口不能放进 `...` 菜单，因为 `...` 后续还会承载更多操作；也不能做成小浮层，因为文件和聊天都需要稳定的阅读空间。

本功能先以“酶库订单与实验执行”线程作为完整样例，但入口应对所有 Thread 可用。不同 Thread 的文件内容可以不同，不能把同一批文件硬塞给所有线程。

## 目标

1. 在 Thread 顶部右侧增加一个纯图标按钮，位置在 `...` 左侧，悬停提示为“打开侧窗”。
2. 点击按钮后，在页面右侧展开侧窗，侧窗中提供“文件”和“侧边聊天”两个入口。
3. 侧窗打开时隐藏“运行信息”；关闭侧窗后恢复用户打开侧窗之前的运行信息状态。
4. 文件窗口按对象存储结构展示项目资产，支持预览 `md`、`json`、图片文件。
5. 侧边聊天先做空态入口，不展示假对话内容。

## 术语

本文使用 `CONTEXT.md` 中的术语：

1. `Run Inspector` 对应界面里的 `运行信息`。
2. `Workspace Side Window` 对应本文的 `侧窗`，不是 `...` 菜单，也不是运行信息。
3. `Object Storage Asset` 对应按对象路径展示的项目文件资产。

## 非目标

1. 不实现真实对象存储、权限系统或文件下载。
2. 不实现真实侧边聊天消息流。
3. 不支持 `xlsx`、`csv`、`pdf` 的内嵌预览。它们可以出现在文件树里，但点击后只显示不支持预览的结构化说明。
4. 不改变 Assets 顶级页面的信息架构。本功能是 Thread 内的上下文侧窗。
5. 不把对话中的 `projectFile` block 改成可点击文件链接。第一版通过顶部侧窗入口进入文件窗口。

## 文档归档

这类功能 spec 需要跟随实现一起进入 Git。仓库仍然默认忽略本地文档，但 `.gitignore` 对 `docs/superpowers/specs/*.md` 设例外，只允许项目 spec 进入版本控制。

## 入口与状态关系

### 顶部入口

Thread 标题栏右侧按钮顺序应为：

1. `运行信息`
2. `打开侧窗` 图标按钮
3. `...`

`打开侧窗` 使用纯图标，不显示文字。图标建议使用分栏、窗口或面板类图标，视觉重量与 `运行信息`、`...` 保持一致。

不要复用 `运行信息` 的现有面板图标。两个相邻按钮如果使用同一个图标，会让用户误以为它们只是同一面板的两个状态。建议新增一个 `WorkspaceToolWindowIcon`，图形可以是右侧窗体加文件/聊天工具位。

### 与运行信息互斥

侧窗和运行信息不能同时打开。

状态规则：

1. 用户点击“打开侧窗”时，记录当前 `runInspectorOpen` 状态，然后关闭运行信息并打开侧窗。
2. 用户关闭侧窗时，恢复打开侧窗之前的 `runInspectorOpen` 状态。
3. 用户在侧窗打开时点击“运行信息”，立即关闭侧窗并打开运行信息；这次切换不再恢复旧的侧窗状态。
4. 切换 Thread 后，各 Thread 可以保留自己的侧窗模式、文件选择和搜索状态，但运行信息恢复标记只在当前打开动作内有效，不应持久化。
5. 刷新浏览器后，侧窗默认关闭。侧窗状态只在当前页面生命周期内保留，不写入持久化 snapshot。
6. 侧窗打开时切换到另一个 Thread，侧窗保持打开，内容切换为新 Thread 的侧窗状态；新 Thread 没有状态时显示侧窗首页。
7. 进入“新对话”时关闭侧窗。

## 侧窗结构

侧窗是右侧布局区域，不是菜单、弹窗或 toast。

桌面端：

1. 默认宽度约 `720px`。
2. 最小宽度约 `560px`。
3. 打开时压缩中间对话区域，行为类似当前运行信息面板。
4. 右上角提供关闭按钮。
5. 不做全屏、最大化或多窗口。

小屏端：

1. 使用和当前运行信息一致的响应式断点，建议沿用 `1460px`。
2. 以右侧 drawer 覆盖展示。
3. 关闭后回到完整对话区域。
4. 文件树收起能力仍然保留。

## 侧窗首页

首次打开侧窗时显示一个轻量选择页，参考 Codex 右侧窗体的布局感觉，但不复制其功能细节。

顶部显示两个模式入口：

1. `文件`
2. `侧边聊天`

主体显示两张大入口卡：

1. 文件：浏览项目文件。
2. 侧边聊天：发起侧边对话。

点击顶部入口或大卡都进入对应模式。进入模式后，顶部仍可在“文件”和“侧边聊天”之间切换。

侧窗顶部可以显示当前项目根路径。文件模式进入前显示：

```text
Industrial Enzyme Design /
```

不要显示本地路径，也不要显示裸 `/` 让用户误以为是本机文件系统根目录。

## 文件窗口

### 布局

文件模式采用两栏布局：

1. 左侧：文件预览区。
2. 右侧：对象存储文件树。

这和参考图一致：文件内容在左，树在右。

右侧文件树支持收起。收起后只保留窄图标按钮或窄栏，左侧预览区域自动变宽。收起的是文件树，不是整个侧窗。

### 默认状态

进入文件模式后，如果尚未选择文件，左侧预览区显示空态：

标题：`打开文件`  
说明：`从右侧对象树选择文件`

默认不自动打开第一个文件，避免用户误以为系统已经选中了某个资产。

### 文件树组织

文件树按对象存储路径组织，不按 Thread 来源组织。

建议目录：

1. `Design/`
2. `Execution/`
3. `ELN/`
4. `Results/`
5. `Reports/`
6. `Figures/`

目录默认全部展开。文件数量保持中等密度，建议 22 到 28 个文件。这样看起来有真实项目资产规模，但不会压过主流程。

文件树中的每个文件项只展示：

1. 目录层级。
2. 文件类型图标或后缀。
3. 文件名。

来源、状态和对象存储路径不要显示在文件树列表里，避免信息密度过高；这些信息只在用户点开文件后的预览区或不支持预览卡中展示。

搜索框过滤范围：

1. 文件名。
2. 对象存储路径。
3. 来源标签。

搜索可以按对象路径和来源标签命中，即使这些字段不直接显示在文件树列表中。

搜索交互：

1. 搜索时只展示命中文件和包含命中文件的目录。
2. 搜索无结果时，文件树区域显示空态：`没有匹配的文件`。
3. 搜索不会清空当前预览选择；如果当前文件被过滤掉，左侧仍保持原预览，直到用户选择新的文件。

### 文件来源

文件聚合顺序：

1. 当前 Thread 对话中的 `projectFile` 块。
2. 当前 Thread 的运行输出，例如 `runInspector.outputs`。
3. 同项目其他 Thread 已产生的关键资产。
4. 项目成员补充的资产，例如实验负责人、数据管理员或分析负责人上传的文件。

“酶库订单与实验执行”线程应拥有最完整的文件树；其他 Thread 根据上下文展示较少资产，不要全量复用。

当前 `projectFile` 和 `runInspector.outputs` 只提供文件名、位置、类型和状态，不提供可渲染的预览内容。因此实现时需要一个侧窗文件 manifest，将现有输出和补充资产映射成 `SideWindowFileAsset`。不要把 Markdown、JSON 或图片预览内容硬塞进对话 block。

对象路径显示为项目内路径，不显示本地磁盘路径。建议格式：

```text
Industrial Enzyme Design/Execution/BM-LAB-ENZ-20260602-001_order_summary.md
```

来源标签只说明资产来源，例如 `当前 Thread`、`设计 Thread`、`分析 Thread`、`Lab Owner`、`Data Steward`，不要显示演示标记、内部数据标签或本地生成状态。

### 预览规则

支持内嵌预览：

1. `md`：渲染为 Markdown，保留标题、表格、列表和代码块。
2. `json`：格式化展示，使用等宽字体和轻量语法分色。
3. `png`、`jpg`、`jpeg`：图片居中展示，支持适配宽度。

可预览文件必须有真实信息量：

1. Markdown 至少包含标题、摘要和 1 个结构化表格或列表。
2. JSON 至少包含 6 个以上字段，并能体现该资产的业务含义。
3. 图片使用现有 `src/assets/mock-science` 里的项目图片或新生成的项目图片，不使用空白占位图。

暂不支持内嵌预览：

1. `xlsx`
2. `csv`
3. `pdf`
4. `zip`
5. 其他未知格式

不支持的文件点击后仍然打开结构化占位卡，不使用 toast 作为唯一反馈。占位卡内容包括：

1. 文件名。
2. 类型。
3. 大小。
4. 来源。
5. 对象路径。
6. 状态。
7. 说明：`当前版本暂不支持内嵌预览`。

## “酶库订单与实验执行”文件样例

这个线程用于展示最完整的对象存储组织。建议文件如下。

### Design

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `ENZ-LIB-20260602-048_design_brief.md` | md | 设计 Thread | 已保存 |
| `ENZ-P0_variant_boundary.json` | json | 当前 Thread | 已保存 |
| `ENZ-MUT-001_to_048_variant_table.xlsx` | xlsx | 设计 Thread | 只读 |
| `active_site_constraints.json` | json | ProteinDesign Agent | 已保存 |

### Execution

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `BM-LAB-ENZ-20260602-001_order_summary.md` | md | 当前 Thread | 已保存 |
| `BM-LAB-ENZ-20260602-001_order_payload.json` | json | 当前 Thread | 已保存 |
| `ENZ-PLATEMAP-20260602-001.json` | json | 当前 Thread | 已保存 |
| `Enzyme_Assay_SOP_v3.md` | md | Lab Owner | 已归档 |
| `Substrate_Lot_QC_202606.xlsx` | xlsx | Lab Owner | 只读 |
| `PR-3107_material_route.json` | json | Data Steward | 已保存 |

### ELN

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `ELN-ENZ-20260602-117_summary.md` | md | 当前 Thread | 已保存 |
| `ELN-ENZ-20260602-117_raw_record.json` | json | 实验室回调 | 已保存 |
| `CALLBACK-ELN-ENZ-20260602-117.json` | json | 实验室回调 | 已保存 |
| `lab_exception_flags.md` | md | Lab Owner | 待确认 |

### Results

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `activity_normalized_matrix.json` | json | 当前 Thread | 已保存 |
| `kcatKm_proxy_fit_summary.json` | json | 当前 Thread | 已保存 |
| `Tm_pH_expression_qc.json` | json | 当前 Thread | 已保存 |
| `Enzyme_Experiment_Result_Package.xlsx` | xlsx | 当前 Thread | 只读 |

### Reports

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `experiment_execution_report.md` | md | 当前 Thread | 已保存 |
| `approval_decision_record.md` | md | Lab Owner | 已归档 |
| `next_iteration_recommendation.md` | md | 分析 Thread | 已保存 |

### Figures

| 文件 | 类型 | 来源 | 状态 |
| --- | --- | --- | --- |
| `enzyme-experiment-record-summary.png` | png | 当前 Thread | 已保存 |
| `enzyme-experiment-notebook-polling.png` | png | 当前 Thread | 已保存 |
| `enzyme-result-package-qc-overview.png` | png | 分析 Thread | 已保存 |
| `enzyme-order-to-task-flow.png` | png | 当前 Thread | 已归档 |

## 侧边聊天

侧边聊天使用同一个右侧窗体，不和文件窗口并排显示。用户切换到“侧边聊天”后，文件预览区和文件树都隐藏。

当前版本只做空态：

1. 标题：`侧边聊天`
2. 说明：`侧边聊天将在后续接入`
3. 输入框存在但禁用，placeholder 为 `侧边聊天将在后续接入`

不放假消息，不模拟真实聊天历史。

## 数据模型建议

新增侧窗文件资产类型：

```ts
type SideWindowFilePreviewKind = "markdown" | "json" | "image" | "unsupported";

type SideWindowFileAsset = {
  id: string;
  name: string;
  extension: string;
  directory: "Design" | "Execution" | "ELN" | "Results" | "Reports" | "Figures";
  objectPath: string;
  sourceLabel: string;
  status: "已保存" | "已归档" | "待确认" | "只读";
  sizeLabel: string;
  previewKind: SideWindowFilePreviewKind;
  content?: string;
  imageSrc?: string;
};
```

侧窗状态建议：

```ts
type WorkspaceSideWindowMode = "launcher" | "files" | "sideChat";

type WorkspaceSideWindowThreadState = {
  mode: WorkspaceSideWindowMode;
  selectedFileId: string | null;
  searchQuery: string;
  fileTreeCollapsed: boolean;
};

type WorkspaceSideWindowState = {
  open: boolean;
  activeThreadId: string | null;
  byThreadId: Record<string, WorkspaceSideWindowThreadState>;
};
```

状态归属：

1. 侧窗状态按 Thread 保存在当前页面生命周期内，不进入持久化 snapshot。推荐由 `ThreadWorkspace` 维护一个按 `thread.id` 分组的本地 state map。
2. 刷新浏览器后，所有 Thread 的侧窗回到关闭状态。
3. `runInspectorOpen` 的恢复值不要长期写入 store。它应当是一次打开侧窗期间的临时值，避免用户切换 Thread 后出现旧状态误恢复。
4. 文件 manifest 是展示数据，不写回现有 `ConversationBlock` 或 `RunInspectorData`。
5. 首次打开某个 Thread 的侧窗时进入 `launcher`；如果当前页面生命周期内该 Thread 已经使用过侧窗，则恢复它上次的模式、搜索词、文件选择和文件树折叠状态。

## 实现建议

组件拆分：

1. `WorkspaceSideWindow`
2. `WorkspaceSideWindowLauncher`
3. `WorkspaceFileBrowser`
4. `WorkspaceFileTree`
5. `WorkspaceFilePreview`
6. `WorkspaceSideChatPlaceholder`

数据构建 helper：

1. `src/data/workspaceSideWindowMockData.ts`：放侧窗文件 manifest 和补充资产内容。
2. `buildThreadObjectStorageFiles(project, thread)`：按项目和 Thread 生成文件树。
3. `getPreviewKindByExtension(extension)`：根据扩展名判断预览类型。
4. `filterSideWindowFiles(files, query)`：按文件名、对象路径和来源标签过滤。

样式原则：

1. 侧窗保持工作台风格，克制、清晰、密度适中。
2. 文件树右置，预览左置。
3. 不做卡片套卡片。
4. Unsupported 文件也要有稳定占位，不出现空白。
5. 图标按钮必须有 `aria-label` 和 `title`。

交互与无障碍：

1. 桌面侧窗使用 `complementary` 语义。
2. 小屏 drawer 使用 `dialog` 语义并 trap focus。
3. `Escape` 关闭侧窗，关闭后焦点回到“打开侧窗”按钮。
4. 文件树、模式切换、文件树收起按钮都需要明确的 `aria-label`。
5. 不支持预览的文件仍然移动选择状态，预览区显示占位卡。

## 验收标准

功能验收：

1. 所有 Thread 顶部都能看到“打开侧窗”图标按钮，且位置在 `...` 左侧。
2. 点击“打开侧窗”后右侧展开侧窗，运行信息立即隐藏。
3. 关闭侧窗后，运行信息恢复到打开侧窗前的状态。
4. 侧窗打开时点击“运行信息”，侧窗关闭，运行信息打开。
5. 侧窗首页显示“文件”和“侧边聊天”两个入口。
6. 侧窗打开时切换 Thread，侧窗保持打开并切换为新 Thread 的文件集合。
7. 进入新对话时侧窗关闭。
8. 文件模式默认不选中文件，左侧显示空态。
9. 文件树在右侧，预览在左侧。
10. 文件树可以收起，收起后预览区域变宽。
11. `md`、`json`、图片可以内嵌预览。
12. `xlsx`、`csv`、`pdf`、`zip` 点击后显示结构化不支持预览卡。
13. 搜索可以按文件名、对象路径、来源标签过滤。
14. 侧边聊天显示空态和禁用输入框，不出现假聊天内容。

视觉验收：

1. 打开侧窗后主对话区域不被遮挡到无法阅读。
2. 文件树和预览区在桌面端比例稳定，窄屏使用 drawer。
3. 顶部按钮、关闭按钮、文件树收起按钮状态清楚。
4. Unsupported 预览卡不会让用户误以为文件加载失败。

测试建议：

1. 补充 `ThreadWorkspace` 测试：入口按钮、运行信息互斥、关闭恢复。
2. 补充文件浏览测试：默认空态、选择 md/json/image、unsupported 占位、搜索过滤、文件树收起。
3. 补充侧边聊天测试：空态和禁用输入框。
4. 补充数据 helper 测试：不同 Thread 的文件集合不同，酶库订单线程文件最多，搜索不区分大小写。
5. 运行 `npm test -- --run`。
6. 运行 `npm run lint`。
7. 运行 `npm run build`。
