# EGFR Thread Mock Conversation 设计

## 目标

把当前 BioMap Agent Demo 从“首页工作台”推进到第一个真实感 Thread 详情样例。点击 `EGFR 抗体亲和力优化` Thread 后，右侧主区显示一段可滚动的研发协作对话，内容围绕 EGFR 抗体亲和力优化，从用户上传基线数据开始，到 Main Agent 分析 MOO Candidate Molecules、展示 BioMap OS 证据图、生成 Experiment Order Draft，并停在 Approval Gate Preview。

本阶段仍是纯前端 Demo，不接入后端、不调用真实 LLM、不执行真实 CLI、不创建真实实验订单、不打开真实文件上传器。

## 设计原则

- EGFR Thread 是第一条高质量打样，不要求所有 Thread 都有完整内容。
- Thread 详情页是连续协作记录，不是首页案例卡的延伸。
- Main Agent 消息不要使用头像和外层消息卡片，直接在内容流里输出 Markdown 和组件。
- 用户消息使用右侧小气泡，用户上传形成的 Project File 以紧凑文件条展示。
- 生物学证据和 BioMap OS 操作节点用真实手册截图裁剪和原生 Demo 组件混合呈现。
- 所有业务数据使用合成但生物学合理的 mock 数据，不使用真实客户序列或真实实验数据。
- mock 截图资源必须放入单独目录并带 `mock` 命名，不能混入真实品牌资产或通用 UI 资源。
- 用户在 Thread 详情页继续输入后，追加到当前 Thread 并持久化；控制台 `reset()` 恢复 seed mockData。

## Domain Language

本 spec 遵循 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md) 中的产品语言：

- **Thread Transcript**：Thread 里可见的对话和渲染块，不等于完整 Thread 上下文。
- **Project File**：用户上传并存入 Project 的文件对象，不直接叫 Asset。
- **Visual Evidence**：Thread 中用于支撑 Main Agent 解释的截图、结构视图或表格等视觉证据，不直接叫 Asset。
- **Main Agent Progress**：对话中的轻量进度提示，不是完整 Trajectory 或 Task 记录。
- **Command Preview**：非执行命令块，不是 Capability Command 执行记录。
- **Candidate Molecule**：被筛选用于比较或湿实验验证的候选分子。
- **Experiment Order Draft**：提交前的实验需求单草稿，不是真实 Experiment Order。
- **Approval Gate Preview**：展示未来会发生审批暂停的位置，不代表已经创建 Approval Request。

## 页面状态

### New Thread Draft 状态

保持现有首页：

- 中间显示 `我能为你的研发做什么？`
- 显示大输入框、项目选择行、能力 chips 和 Use Case Cards
- 左侧不高亮任何 Thread

### 已选 EGFR Thread

点击 `Antibody Optimization / EGFR 抗体亲和力优化` 后，主区切换为 Thread 详情页：

- 不显示首页标题
- 不显示首页大输入框
- 不显示 Use Case Cards
- 顶部显示 Thread 标题和轻量元信息
- 中间显示可滚动对话流
- 底部显示 compact composer，用于继续当前 Thread

建议顶部结构：

```text
EGFR 抗体亲和力优化
Antibody Optimization · 9 turns · 停在 Experiment Order Draft 提交审批前
```

### 其他 Thread

其他未打样 Thread 点击后不回到首页，也不自动生成假内容。右侧显示 Thread 详情空状态：

```text
这个 Thread 暂未制作对话内容
```

底部 compact composer 仍可见，用户可以输入并追加一条简单消息。

## 对话视觉

对话区整体接近 Codex 输出风格：

- 内容列居中，最大宽度约 `960-1080px`。
- Main Agent 输出无头像、无外层边框、无大气泡。
- Main Agent 文本支持 Markdown，包括加粗、列表、内联代码、代码块。
- 前端组件直接插入 Main Agent 输出流中，像代码块或图片一样成为内容的一部分。
- 用户消息右侧对齐，使用浅灰小气泡。
- 用户上传形成的 Project File 显示在气泡下方的小文件条，不做大预览。
- 对话区使用主区滚动，不影响左侧栏滚动。
- 底部 compact composer sticky 在主区底部，比首页输入框更小。

## Mock UI Image Resources

新增目录：

```text
src/assets/mock-biomap-os/
```

该目录只放本 Demo 的 mock/source-derived 截图资源。这里的 `assets` 是前端工程目录名，不表示领域里的 **Asset**。建议命名：

```text
mock-protein-moo-results-overview.png
mock-protein-surface-coloring-detail.png
mock-submit-to-wet-lab-menu.png
mock-experiment-order-detail.png
mock-cro-route-config.png
```

推荐素材来源：

- `/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/蛋白设计-用户手册.pdf`
  - 第 19 页：MOO 结果页总览，含 3D 结构、Pareto Front、Candidate Molecule Table
  - 第 21 页：Surface Coloring / pKa Shift 局部
  - 第 25 页：Submit to Wet Lab 下拉局部
- `/Users/songxuzhengjun/Documents/wechat_cli/BioMapOS手册-V1.0/智能实验-用户手册.pdf`
  - 第 6 页：实验订单详情和分子列表
  - 第 11 页：实验线路或 CRO 配置弹窗，可选

实现时可以用 macOS PDFKit/Swift、截图工具或浏览器截图裁剪这些局部。最终 app 不依赖 `/tmp` 渲染文件，只引用 `src/assets/mock-biomap-os/` 下的静态资源。

## 数据模型

现有 `Thread` seed 增加可选 `transcript` 字段，对应领域里的 Thread Transcript。运行时 `DemoThread` 也需要携带 transcript，并被 Zustand persist 保存。

建议类型：

```ts
type Thread = {
  id: string
  title: string
  lastActivity: string
  transcript?: ConversationTurn[]
}

type ConversationTurn = {
  id: string
  role: 'user' | 'mainAgent'
  markdown?: string
  contentBlocks?: ConversationBlock[]
}

type ConversationBlock =
  | ProjectFileBlock
  | MainAgentProgressBlock
  | CommandPreviewBlock
  | VisualEvidenceBlock
  | CandidateMoleculeTableBlock
  | ExperimentOrderDraftBlock
  | ApprovalGatePreviewBlock
```

`contentBlocks` 是渲染块，不等同于文件附件。用户上传后沉淀到 Project 的文件对象以 `projectFile` block 渲染。

### Project File

```ts
type ProjectFileBlock = {
  type: 'projectFile'
  projectFileId: string
  fileName: string
  fileType: 'xlsx' | 'csv' | 'pdf' | 'docx' | 'png' | 'jpg'
  sizeLabel: string
  pathLabel: string
  statusLabel: string
}
```

第一版只在 seed Thread Transcript 中展示一次用户上传后形成的 Project File，不实现真实上传。后续真实上传限制类型：

- 文档类：`pdf`、`docx`、`txt`、`md`
- 数据表格类：`xlsx`、`csv`、`tsv`
- 图像类：`png`、`jpg`、`jpeg`

### Main Agent Progress

```ts
type MainAgentProgressBlock = {
  type: 'mainAgentProgress'
  steps: Array<{
    label: string
    state: 'done' | 'current' | 'pending'
  }>
}
```

它只出现在关键 Main Agent 消息中，用于表示简化的 Main Agent Progress，而不是完整执行日志。例如：

```text
读取项目上下文 -> 分析 MOO 结果 -> 生成 Experiment Order Draft -> 等待用户确认
```

### Command Preview

```ts
type CommandPreviewBlock = {
  type: 'commandPreview'
  language: 'bash'
  code: string
}
```

Command Preview 直接显示，不做折叠。它是 mock 命令，不执行。
它不是 Capability Command 执行记录，也不产生真实后端副作用。

### Visual Evidence

```ts
type VisualEvidenceBlock = {
  type: 'visualEvidence'
  src: string
  alt: string
  caption: string
  sourceLabel: string
}
```

`sourceLabel` 用于标明这是 mock/source-derived visual evidence，例如：

```text
Mock visual evidence · Protein Design MOO results
```

### Candidate Molecule Table

```ts
type CandidateMoleculeTableBlock = {
  type: 'candidateMoleculeTable'
  title: string
  columns: Array<{ key: string; label: string }>
  rows: Array<Record<string, string>>
}
```

### Experiment Order Draft

```ts
type ExperimentOrderDraftBlock = {
  type: 'experimentOrderDraft'
  title: string
  orderId: string
  status: 'draft'
  sections: Array<{
    title: string
    items: Array<{ label: string; value: string }>
  }>
  actions: Array<{ label: string; variant: 'primary' | 'secondary' }>
}
```

按钮第一版只做视觉，不创建真实审批或订单。

### Approval Gate Preview

```ts
type ApprovalGatePreviewBlock = {
  type: 'approvalGatePreview'
  title: string
  description: string
  statusLabel: string
  approverLabel: string
}
```

Approval Gate Preview 不创建真实 Approval Request，不更新顶部铃铛数量，不打开 Notification Center。

## EGFR Thread Transcript 脚本

目标是 8-10 个对话节点，形成一个完整但不过重的研发推进闭环。

### Turn 1: 用户上传基线数据并提出目标

用户右侧气泡：

```text
帮我把 EGFR 抗体亲和力优化到 1 nM 以下，优先不要牺牲表达量和稳定性。
```

Project File block：

```text
EGFR_parent_antibody_baseline.xlsx
XLSX · 42 KB · 已保存为 Project File
Antibody Optimization / Files / Inputs
```

### Turn 2: Main Agent 读取上下文和 Project File

Main Agent Markdown：

```text
我读取了当前 Project 和你上传的基线表。这个 Thread 里已有一个 parent antibody 和一批 MOO 结果可以复用。

从 `EGFR_parent_antibody_baseline.xlsx` 提取到的关键基线：

- Parent antibody: `EGFR-P0`
- 历史 BLI KD: **8.4 nM**
- 表达量: **42 mg/L**
- SEC-HPLC 纯度: **96.8%**
- Tm: **66.1 C**
```

Execution status：

```text
读取项目上下文 done
保存为 Project File done
解析基线数据 current
```

### Turn 3: Main Agent 轻量澄清目标

Main Agent Markdown：

```text
建议这次筛选先按下面的约束推进：

- 主目标：BLI KD < **1 nM**
- 稳定性：Tm 下降不超过 **2 C**
- 表达量：不低于 **35 mg/L**
- 聚集风险：排除 High
- Naturalness score 保持在 **0.70** 以上

如果你确认，我会基于现有 MOO 结果筛出 3 个 Candidate Molecules，并生成 Experiment Order Draft。
```

### Turn 4: 用户确认

用户右侧气泡：

```text
OK，按这个标准筛。BLI 优先，ELISA 可以作为备选。
```

### Turn 5: Main Agent 展示命令和 MOO 证据

Command Preview：

```bash
biomap design moo-results summarize \
  --project antibody-optimization \
  --target EGFR \
  --seed EGFR-P0 \
  --objective affinity \
  --constraints "kd<1nM,tm_drop<=2C,expression>=35mg/L,aggregation!=High"
```

Visual Evidence：

- `mock-protein-moo-results-overview.png`
- caption: `MOO 结果页显示 Candidate Molecules 的 3D 结构、Pareto Front 和候选表。`

### Turn 6: Main Agent 给出 Candidate Molecule Table

Main Agent Markdown：

```text
我先筛出 3 个候选。它们不是单纯按亲和力排序，而是在亲和力、稳定性、表达和聚集风险之间做了平衡。
```

Candidate table rows:

| Candidate | Predicted KD | Delta vs Parent | Tm | Expression | Purity | Naturalness | Aggregation | Recommendation |
|---|---:|---:|---:|---:|---:|---:|---|---|
| EGFR-MOO-017 | 0.82 nM | 10.2x | 65.4 C | 38 mg/L | 97.1% | 0.78 | Low | Primary |
| EGFR-MOO-024 | 1.10 nM | 7.6x | 66.0 C | 45 mg/L | 96.5% | 0.75 | Medium | Backup |
| EGFR-MOO-031 | 1.46 nM | 5.8x | 64.8 C | 52 mg/L | 97.4% | 0.73 | Low | Backup |

这些数值是合成 mock 数据，用于 Demo 展示。

### Turn 7: Main Agent 展示结构和位点解释

Visual Evidence：

- `mock-protein-surface-coloring-detail.png`
- caption: `Surface Coloring 局部用于解释 Candidate Molecule 的表面电荷和 pKa shift 风险。`

Main Agent Markdown：

```text
结构上，`EGFR-MOO-017` 的优势主要来自 CDR 邻近界面的局部替换。pKa shift 和表面电荷没有出现明显异常，因此它适合作为第一优先级进入 BLI 验证。

我不会把 `EGFR-MOO-024` 直接淘汰。它的表达量更好，适合作为实验备选，防止主候选在表达或纯化环节失败。
```

### Turn 8: Main Agent 生成 Experiment Order Draft

Command Preview：

```bash
biomap experiment-orders create \
  --project antibody-optimization \
  --molecules EGFR-MOO-017,EGFR-MOO-024,EGFR-MOO-031 \
  --base CH1-CL_Fc \
  --prep gene-synthesis,expression,purification \
  --assay BLI \
  --backup-assay ELISA \
  --draft
```

Visual Evidence：

- `mock-submit-to-wet-lab-menu.png`
- caption: `从 Protein Design 结果页发起 Submit to Wet Lab。`

Order draft:

- orderId: `ORD-DRAFT-EGFR-001`
- status: `Draft`
- molecules: `3`
- base: `CH1-CL_Fc`
- expression system: `ExpiCHO`
- prep steps: `Gene synthesis / Protein expression / Purification`
- assay: `BLI Affinity`
- backup assay: `ELISA`
- purity requirement: `>= 95%`
- buffer: `PBS, pH 7.4`
- endotoxin: `<= 1 EU/mg`
- actions: `提交审批`, `继续修改`

### Turn 9: Main Agent 停在 Approval Gate Preview

Visual Evidence:

- `mock-experiment-order-detail.png`
- caption: `智能实验中的实验订单详情和分子列表。`

Approval Gate Preview:

```text
待确认：Experiment Order Draft `ORD-DRAFT-EGFR-001`
点击提交审批后才会创建 Approval Request，并进入 Experiment Order 审核；审核通过后再生成 Experiment Task 或 CRO 订单。
审批人：Antibody Optimization Lab Admin
状态：等待用户确认
```

第一版按钮只做视觉，不追加审批消息，不更新 Notification Center。

## 运行时交互

### 继续输入

在 Thread 详情页底部 composer 输入内容并发送：

- 向当前 Thread Transcript 追加一条 `user` turn。
- 再追加一条简单 `mainAgent` turn：

```text
已记录到当前 Thread。第一版 Demo 不调用真实 Main Agent，后续可以基于这条补充继续推进。
```

- 更新该 Thread `lastActivityAt`。
- 将该 Thread 移动到所属 Project 的 Thread 列表顶部；如果该 Thread 已置顶，置顶排序不变。
- 保持当前 Thread 选中。
- 刷新页面后追加消息仍在。
- 不显示 toast，因为新增消息本身就是反馈。
- 执行 `reset()` 后回到 seed Thread Transcript。
- 如果原本是空 Thread，发送后空状态消失，显示刚追加的 Thread Transcript。

### 上传按钮

Thread compact composer 的 `+` 按钮第一版只保留视觉入口。点击后可以显示轻量状态文案：

```text
Project File 上传将在后续 Demo 中展开
```

不打开文件选择器，不校验真实文件。

### 首页发送

New Thread Draft 状态保持现有创建 Thread 行为。新建出来的 Thread 默认没有 Thread Transcript，点击后显示空状态。

## Store 和持久化

当前 Zustand store 已持久化 `projects`，新增 Thread Transcript 后需要保证：

- seed Thread 的 transcript 初始化到 `DemoThread`。
- 用户追加的 runtime turns 写入 `DemoThread.transcript`。
- `partialize` 继续持久化 `projects`，从而保存 runtime turns。
- `reset()` 删除 persisted state 并从 seed 重建。
- 旧 localStorage 中没有 transcript 时，sanitize 逻辑能正常 fallback。

持久化使用新的 key 和版本：

```ts
const demoStorePersistKey = 'biomap-agent-demo-store-v2'
version: 2
```

第一版不迁移旧 `biomap-agent-demo-store-v1` 状态。应用读取不到 v2 状态时直接从 seed 重建；控制台 `reset()` 只需要清理当前 v2 key。

## 组件拆分

建议新增：

```text
src/components/ThreadWorkspace.tsx
src/components/ConversationTranscript.tsx
src/components/ConversationBlocks.tsx
src/components/ThreadComposer.tsx
```

职责：

- `ThreadWorkspace`: 根据 selected Thread 渲染 Thread Transcript、空状态和 compact composer。
- `ConversationTranscript`: 负责用户/Main Agent turn 布局。
- `ConversationBlocks`: 根据 `contentBlocks` 渲染 Project File、Main Agent Progress、命令块、Visual Evidence、Candidate Molecule Table、Experiment Order Draft、Approval Gate Preview。
- `ThreadComposer`: 复用首页 composer 的输入行为，但视觉更紧凑，只用于继续当前 Thread。

`App.tsx` 负责在 New Thread Draft、selected Thread with transcript、selected Thread empty 三种主区状态间切换。

## 不做范围

- 不实现真实文件上传。
- 不解析真实 XLSX。
- 不调用真实 BioMap OS API。
- 不执行 Command Preview。
- 不提交真实 Experiment Order Draft，不创建真实 Experiment Order、Experiment Task、CRO Order。
- 不更新顶部 Notification Center。
- 不做图片点击放大或全屏预览。
- 不给每个 Thread 补完整 Thread Transcript。
- 不实现真实 LLM 回复。

## 验收标准

- 新对话状态仍显示首页标题、输入框、chips 和案例卡。
- 点击 `EGFR 抗体亲和力优化` 后，主区切换到 Thread 详情页。
- EGFR 详情页不显示首页 Use Case Cards。
- 对话区可上下滚动。
- 用户消息为右侧气泡。
- Main Agent 消息无头像、无外层大边框，Markdown 和组件直接显示。
- Project File 条显示 `EGFR_parent_antibody_baseline.xlsx` 和 `已保存为 Project File`。
- 页面中能看到至少 3 张 `src/assets/mock-biomap-os/` 下的 mock/source-derived Visual Evidence 图片。
- 页面中能看到 Command Preview，且不折叠。
- 页面中能看到 Candidate Molecule Table、Experiment Order Draft 和 Approval Gate Preview。
- 其他 Thread 点击后显示空状态，不显示首页案例卡。
- Thread composer 发送后追加用户消息和简单 Main Agent 回复，刷新后仍保留。
- 控制台执行 `reset()` 后恢复 seed Thread Transcript。
- `npm run lint`、`npm run build` 通过。
- 如果测试框架仍存在，相关 store logic 测试通过。
- 使用 Chrome Use 在 `http://127.0.0.1:5173/` 验证关键交互，浏览器控制台无新错误。
