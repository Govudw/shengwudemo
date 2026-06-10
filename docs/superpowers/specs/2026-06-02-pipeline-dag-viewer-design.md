# Pipeline DAG Viewer 设计

## 状态

本 spec 定义 BioMap Agent Demo 中 `Capabilities > Pipelines` 的明细增强：在 Pipeline 详情面板里展示一个紧凑的竖版 DAG preview，并提供只读最大化 DAG Viewer。该 Viewer 可用于 Pipeline 的拓扑查看，但本轮优先服务 **Execution Pipeline**。

这次设计重新明确 **Execution Pipeline** 的产品语义：它不是 Skill 的知识包，也不是自由发挥的 Agent 说明；它是 **Pipeline** 的执行型子类，用来编排湿实验设备、岛台、小车、CRO Order、Human Gate、QC Decision 和结果回传等步骤，目标是尽量保证实验执行流程正确。Skill 可以帮助 Main Agent 理解、建议和生成操作知识；Execution Pipeline 负责按固定拓扑执行或管理流程。

本轮仍是前端 Demo，不接真实执行引擎、真实设备、真实 CRO 系统、真实调度系统或真实 Pipeline Builder。

## 目标

1. 在 Pipeline 右侧详情面板中，用 DAG preview 替代线性 `步骤` section，让用户一眼看出 Pipeline 是可治理的执行拓扑。
2. DAG preview 采用竖版紧凑布局，不占据过多详情空间。
3. 表达执行顺序、依赖关系、Human Gate 和 QC Decision，突出 Execution Pipeline 相比 Skill 的确定性和流程正确性。
4. 提供最大化只读 DAG Viewer，用于查看后续更复杂的设备、岛台、小车、CRO Handoff、QC Decision 分支流程。
5. 引入可扩展的 mock DAG 数据结构，保留现有 `steps` 作为兼容摘要和 fallback。
6. 不做编辑器，不支持拖节点、连线、保存布局或修改 Pipeline。

## 非目标

- 不实现 Pipeline Builder。
- 不实现节点增删改、拖拽排版、连线编辑、保存、版本管理或撤销。
- 不引入 React Flow、dagre、elkjs 或自动布局库。
- 不模拟真实设备控制、机器人调度、CRO 下单、QC 算法或异常重试。
- 不把 Skill、MCP Server 或 Plugin 改成 DAG 表达。
- 不重做 Capabilities 页面整体布局。

## 产品语义

Execution Pipeline 的核心价值是 **确定执行**，不是“知道怎么做”。在 Demo 文案里应避免把它描述成单纯分析流程，而要强调它能把实验执行中的关键控制点固定下来：

- 样本、候选分子和实验订单参数进入流程。
- 设备、岛台、小车、机器人、CRO Order 或 CRO Handoff 按指定依赖顺序进入执行。
- Human Gate 在关键节点要求人工介入；它可以解析为轻量 Human Confirmation，也可以在高影响动作中升级为 Approval Gate。
- QC Decision 在继续执行前判断样本、数据或结果是否满足预设 QC 条件；它可以引用 Preset QC Check，但不做生物学解释、候选排名或下一轮设计建议。
- 输出结果包、报告和数据资产。

默认的 `EGFR 抗体亲和力优化 Pipeline` 保留现有主线，但 DAG 语义调整为 Execution Pipeline 视角：从候选确认到湿实验订单、样本准备、设备执行、QC、数据回传和报告生成的执行闭环。

Execution Pipeline 可以引用或编排 **Experiment Workflow**，但它不是 Experiment Workflow。Experiment Workflow 是 Smart Experiment 中的湿实验方法或配置模板；Execution Pipeline 是 Main Agent 可管理或调用的执行型能力层，用来把订单、设备、Human Gate、QC Decision、CRO Handoff 和结果交接组织成受治理的流程。

## 信息架构

Pipeline 右侧详情面板当前结构为：

```text
DetailPanel
  ├─ Header
  ├─ Badges
  ├─ Metrics
  ├─ Interface
  ├─ Steps
  ├─ Access / Usage sections
  ├─ Recent activity
  └─ Disable action
```

增强后结构为：

```text
DetailPanel
  ├─ Header
  ├─ Badges
  ├─ Metrics
  ├─ Pipeline DAG preview       仅 Pipeline 且 entry.dag 存在
  ├─ Interface
  ├─ Steps fallback             仅 Pipeline 且 entry.dag 不存在
  ├─ Tools / Plugin preview     非 Pipeline 类型保留现状
  ├─ Access / Usage sections
  ├─ Recent activity
  └─ Disable action
```

`Pipeline DAG preview` 放在 `Metrics` 后、`Interface` 前。它是 Pipeline 明细里的核心差异化表达，应优先于输入输出表格出现。

## DAG Preview

### 展示目标

Preview 只承担“快速理解流程拓扑”的职责，不承担完整配置阅读。

它展示：

- 节点短名。
- 节点类型或 subtype。
- 主执行路径。
- Human Gate。
- QC Decision。
- 关键依赖线。
- 最大化入口。

它不展示：

- 完整边 label。
- 节点全部输入输出。
- 失败分支、重试路径、异常暂停条件。
- 设备参数、权限配置、日志或 SLA。

### 空间约束

Preview 高度控制在约 `260px`。它位于右侧 inspector 内，不应把 `Interface`、访问控制和近期活动挤出首屏太远。

如果 DAG 节点超过 preview 可读范围，本轮优先保持 preview 紧凑而不是把高度撑大。复杂查看交给最大化 Viewer。

### 布局

Preview 使用竖版 DAG：

- 主链从上到下。
- 分支节点使用左右 column 表达。
- `Human Gate` 和 `QC Decision` 使用明显但低饱和的控制点样式。QC Decision 的说明必须指向预设阈值、SOP 窗口或 Preset QC Check。
- 连线使用细 SVG path。
- 节点使用 HTML/CSS 渲染，便于中文文本、hover、选中态和响应式。

视觉风格是紧凑工程图：

- 白底。
- 细线。
- 小圆角节点，圆角不超过 `8px`。
- 低饱和类型色。
- 不使用大型插画、渐变背景或装饰图形。

## 最大化 DAG Viewer

Preview 右上角提供最大化按钮。点击后打开只读大弹窗。

### 弹窗结构

```text
PipelineDagViewerModal
  ├─ Header
  │   ├─ Pipeline name
  │   ├─ Fit
  │   ├─ Reset
  │   └─ Close
  └─ Body
      ├─ DAG canvas
      └─ Selected node details
```

弹窗接近全屏，左侧为 DAG viewer，右侧为节点详情面板。

### 交互

- 点击节点后选中节点。
- 右侧详情显示该节点的执行信息。
- 未选中节点时，右侧显示 Pipeline 执行摘要。
- `Fit` 把图回到适合视口的位置。
- `Reset` 清除选中节点并恢复默认视图。
- `Esc` 或关闭按钮关闭弹窗。

本轮不实现拖节点、保存布局、编辑边、编辑参数、pan/zoom 手势。后续若需要“拖转”，语义限定为拖动画布平移或缩放查看，不表示编辑 Pipeline。

## 节点详情

Preview 中节点 hover 可以显示短 tooltip。最大化 Viewer 中点击节点后显示完整节点详情。

节点详情展示执行关键字段：

- 名称。
- 类型。
- subtype。
- 描述。
- Lab Resources，例如设备、机器人、小车、岛台、样本库、CRO Order 或连接系统。
- 输入。
- 输出。
- 前置条件。
- Human Gate 或 QC Decision 的控制条件。Human Gate 节点需要说明它对应轻量 Human Confirmation 还是正式 Approval Gate。

节点详情不展示完整配置参数、重试策略、权限矩阵、日志、版本、负责人或 SLA。这些会让只读 Demo 看起来像配置系统，偏离本轮目标。

## 数据模型

在 `MockCapabilityEntry` 上新增可选 `dag` 字段。保留 `steps`：

- `dag` 用于 DAG preview 和最大化 Viewer。
- `steps` 继续用于列表摘要、老数据兼容和无 DAG fallback。

建议类型：

```ts
export type PipelineDagNodeKind =
  | 'input'
  | 'operation'
  | 'human-gate'
  | 'qc-decision'
  | 'output'

export type PipelineDagNodeSubtype =
  | 'sample'
  | 'lab-operation'
  | 'transport'
  | 'cro-handoff'
  | 'report'
  | 'data'

export type PipelineDagNodeControl = {
  kind:
    | 'human-confirmation'
    | 'approval-gate'
    | 'preset-qc-check'
    | 'sop-threshold'
  summary: string
}

export type PipelineDagNodeResource = {
  kind:
    | 'device'
    | 'robot'
    | 'transport-vehicle'
    | 'island-bench'
    | 'sample-storage'
    | 'cro-order'
    | 'lab-system'
    | 'data-system'
  name: string
}

export type PipelineDagNode = {
  id: string
  kind: PipelineDagNodeKind
  subtype?: PipelineDagNodeSubtype
  title: string
  shortTitle: string
  resources?: PipelineDagNodeResource[]
  description: string
  inputs: string[]
  outputs: string[]
  prerequisites: string[]
  control?: PipelineDagNodeControl
  layout: {
    row: number
    column: number
  }
}

export type PipelineDagEdge = {
  from: string
  to: string
  label?: string
}

export type PipelineDag = {
  nodes: PipelineDagNode[]
  edges: PipelineDagEdge[]
}
```

### 节点 kind

- `input`：样本、候选、订单参数、实验约束。
- `operation`：确定执行步骤，可引用设备、机器人、小车、CRO Order 或数据系统等 Lab Resources。
- `human-gate`：Human Gate，用于人工确认、人工反馈、订单复核或正式审批暂停点。
- `qc-decision`：QC Decision，基于预设阈值、SOP 窗口或 Preset QC Check 判断流程能否继续。
- `output`：结果包、报告、数据资产、实验订单提交包。

### subtype

`subtype` 是展示层强化执行语义，不改变底层 DAG kind；设备、小车、岛台等物理或系统对象进入 `resources`，不作为节点 subtype：

- `sample`：样本或候选输入。
- `lab-operation`：湿实验执行操作，例如制备、测量、孵育、纯化或读数。
- `transport`：设备间、岛台间或样本库间的受治理转运动作。
- `cro-handoff`：CRO Order、CRO Handoff 或外部执行状态节点。它表示外包执行对象或交接动作，不表示 CRO 组织本身。
- `report`：报告或结果包。
- `data`：数据资产或数据系统。

这样可同时支持实验执行型 Pipeline 和未来分析型 Pipeline。

`resources` 用来描述执行节点引用的 **Lab Resources**，例如 BLI 设备、SEC-HPLC、液体处理工作站、小车、岛台、样本库、CRO Order 或数据系统。资源不是 Pipeline 节点类型；节点是受治理的操作，资源是执行或支撑该操作的对象。

`control` 用来描述 Human Gate 或 QC Decision 的控制条件。Human Gate 节点应说明它对应 `human-confirmation` 还是 `approval-gate`；QC Decision 节点应说明它来自 `preset-qc-check` 还是 `sop-threshold`。

## 默认 mock DAG

默认 `EGFR 抗体亲和力优化 Pipeline` 的 DAG 应从当前 demo 主线抽象成执行闭环：

```text
候选确认
  ↓
湿实验订单参数
  ↓
Human Gate: Top 3 候选确认
  ↓
CRO 订单草稿
  ↓
样本准备 / 转运
  ↓
设备执行: BLI + SEC-HPLC + DSF
  ↓
QC Decision: 数据质量通过
  ↓
结果回传
  ↓
报告与数据资产登记
```

Preview 可以压缩为 7 到 8 个节点：

1. 候选输入。
2. 候选确认。
3. 订单草稿。
4. 样本准备。
5. 设备执行。
6. QC 判断，基于预设数据质量标准。
7. 数据回传。
8. 报告输出。

最大化 Viewer 可以显示这些节点的完整输入输出和控制条件。

其他 Pipeline 可以先提供较简单的 mock DAG，或暂时通过 `steps` fallback。实现时应至少覆盖默认 Pipeline，避免用户进入默认详情时看不到 DAG。

## 组件设计

新增组件：

```text
PipelineDagPreview
  ├─ PipelineDagGraph
  └─ Maximize button

PipelineDagViewerModal
  ├─ PipelineDagGraph
  └─ PipelineDagNodeDetails

PipelineDagGraph
  ├─ SVG edges
  └─ HTML nodes

PipelineDagNodeDetails
```

### PipelineDagPreview

职责：

- 接收 `entry.dag` 和 `entry.name`。
- 渲染固定高度 preview。
- 管理 hover tooltip。
- 打开最大化 Viewer。

不负责：

- 修改 DAG 数据。
- 选择 Capability。
- 保存任何状态到 store。

### PipelineDagGraph

职责：

- 根据 `layout.row` 和 `layout.column` 计算节点位置。
- 使用 SVG 渲染边。
- 使用 HTML/CSS 渲染节点。
- 支持 preview 和 viewer 两种 density。
- 支持节点选中回调。

布局本轮使用手写 row/column，不自动计算拓扑。这样能保证 Demo 中每个图都好看、紧凑、稳定。

### PipelineDagViewerModal

职责：

- 控制最大化查看。
- 管理选中节点。
- 提供 Fit / Reset / Close。
- 使用右侧 `PipelineDagNodeDetails` 展示节点详情。

### PipelineDagNodeDetails

职责：

- 展示节点执行说明。
- 未选中时展示 Pipeline DAG 摘要。
- 对 Human Gate / QC Decision 节点突出控制条件。

## DetailPanel 集成

`DetailPanel` 现有逻辑需要调整：

- `activeKind === 'pipeline' && entry.dag` 时，显示 `PipelineDagPreview`。
- `activeKind === 'pipeline' && !entry.dag` 时，保留原 `步骤` section。
- 非 Pipeline 的 MCP 和 Plugin 继续使用原 `工具` / `Plugin 预览` section。

不要把 DAG 渲染逻辑直接塞在 `DetailPanel` 内部。`DetailPanel` 只做条件分发，图形逻辑由新组件承担。

## 文案

推荐中文文案：

- Section 标题：`执行 DAG`
- Preview action：`最大化查看`
- Viewer 标题：`执行 DAG`
- Empty fallback：`这个 Pipeline 暂未配置 DAG，先展示线性步骤。`
- Unselected node detail：`选择一个节点查看执行条件。`
- Human Gate label：`人工确认`
- QC Decision label：`QC 判断`

主术语保留英文：

- `Pipeline`
- `DAG`
- `Human Gate`
- `QC`
- `CRO`
- `Skill`
- `Capabilities`

其他主体内容保持中文，符合当前 Demo 面向国内开发团队的展示语境。

## 可访问性

- Preview 的最大化按钮需要 `aria-label`，例如 `最大化查看 EGFR 抗体亲和力优化 Pipeline 的执行 DAG`。
- Viewer 使用 `role="dialog"`、`aria-modal="true"` 和明确标题。
- 节点使用 `button` 或 `role="button"`，支持键盘选中。
- 选中节点需要 `aria-pressed` 或明确 active class。
- SVG 连线为装饰元素，使用 `aria-hidden="true"`。
- 关闭按钮使用 `aria-label="关闭执行 DAG"`。

## 测试计划

新增或更新测试：

1. 默认 Pipeline 详情显示 `执行 DAG`，不再显示原线性 `步骤` section。
2. 默认 Pipeline 的 DAG preview 包含 `Human Gate` / `QC 判断` 相关节点或标签。
3. 点击最大化按钮后打开只读 DAG Viewer。
4. Viewer 中点击节点后显示节点详情，包括输入、输出、前置条件或控制条件。
5. 关闭 Viewer 后回到 Pipeline 详情，不影响当前选中 Pipeline。
6. 没有 `dag` 的 Pipeline 使用 `steps` fallback。
7. MCP Server 和 Plugin 详情不受 DAG 改动影响。

验证命令：

```bash
npm test
npm run lint
npm run build
```

实现完成后还应在浏览器中手动确认：

- Preview 高度没有撑爆右侧详情面板。
- 最大化 Viewer 在桌面宽度下清楚可读。
- `Assets`、`Workspace`、`Skills`、`MCP Servers`、`Plugins` 页面没有视觉回归。

## 实施顺序

1. 扩展 mock 数据类型，新增 `PipelineDag` 类型和默认 EGFR Pipeline 的 DAG 数据。
2. 增加 `PipelineDagGraph`，先实现静态 preview 渲染。
3. 在 `DetailPanel` 中接入 `PipelineDagPreview`，并保留无 DAG fallback。
4. 增加最大化 `PipelineDagViewerModal`。
5. 增加节点详情 `PipelineDagNodeDetails`。
6. 调整 CSS，控制 preview 高度、节点密度、弹窗布局和响应式。
7. 补测试并跑完整验证。

## 风险与约束

- 手写 layout 可控但不可自动适配真实复杂 DAG。当前是 Demo，优先稳定展示；真实 Builder 阶段再考虑自动布局。
- 如果 preview 节点过多，会降低可读性。默认 preview 应只展示关键节点，复杂信息放入最大化 Viewer。
- 如果最大化 Viewer 做得像编辑器，会误导用户期待保存和编辑能力。本轮必须保持只读。
- 如果节点类型过于生物学专用，会限制未来分析型 Pipeline。节点 kind 只保留少量执行拓扑角色；更细的实验对象放到 `subtype`、`resources` 和 `control`。

## 验收标准

- 进入 `Capabilities > Pipelines` 默认详情，可以看到紧凑 `执行 DAG` preview。
- Preview 约 `260px` 高，不吞掉整个右侧详情面板。
- Preview 显示主路径、Human Gate 和 QC Decision。
- 线性 `步骤` 不与 DAG 重复出现；没有 DAG 时才 fallback。
- 最大化 Viewer 可打开、查看节点详情、关闭。
- 页面中没有可编辑 DAG 的暗示。
- 所有现有 Capabilities 类型仍可正常切换。
- 自动测试、lint 和 build 通过。
