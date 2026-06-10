# Run Inspector 设计

## 状态

本 spec 定义选中 Thread 后的紧凑标题栏与右侧 **Run Inspector**。它建立在 `2026-05-28-egfr-agentic-workflow-replay-design.md` 的 EGFR 回放基础上，不重新设计 EGFR 对话内容。

术语遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md)：

- **Run Inspector**：Thread 级侧栏，用于汇总用户可见的运行状态。
- 中文 UI 文案使用 `运行信息`。
- UI 不出现 `Inspector`、`执行日志`、`系统日志`、`Trace`。
- Run Inspector 不是 **Task**、不是系统 trace、不是 debug console、也不是完整 Thread context。

## 目标

把选中 Thread 后的主工作区改成更接近 Codex 的工作台结构：

1. 顶部是一条贯穿主工作区左右的轻量标题栏。
2. 标题进一步缩小，贴近左侧；操作按钮贴近右侧。
3. 标题旁的 `i` 只做轻量元信息 tooltip。
4. 右侧新增 Thread 级 `运行信息`侧栏。
5. 侧栏展开时，优先消耗对话区左右留白；留白不足时才压缩对话列。

第一版仍是纯前端 Demo，不接后端、不调用真实运行日志、不创建真实审批或订单。

## 范围

包含：

- 调整 `ThreadWorkspace` 顶部标题栏布局。
- 新增右侧 `运行信息`图标按钮。
- 新增 Run Inspector 侧栏组件。
- 新增 Thread 级 Run Inspector 开关状态，并用 Zustand 持久化。
- 在 EGFR mock Thread 上补结构化 `runInspector` 数据。
- Run Inspector 展示进度、输出、审批、能力调用回放。
- 更新测试覆盖持久化、布局状态和基础交互。

不包含：

- 真实 Agent runtime。
- 真实工具调用 trace。
- 真实审批系统。
- 真实项目文件系统。
- 给所有 Thread 补完整 Run Inspector 内容。
- 重做 EGFR 对话轮内容。
- 新增 Tab 式复杂导航。

## 设计原则

- 对话区仍是主体；Run Inspector 是辅助信息窗。
- Mock Demo 首次进入 EGFR Thread 时，Run Inspector 默认关闭。
- 用户手动打开或关闭后，状态按 Thread 持久化。
- 后续真实运行态可以在 Agent 执行时自动展开 Run Inspector，但本次 mock 不自动展开。
- Run Inspector 内容来自结构化 mock data，不从对话文本反向解析。
- 标题栏只服务当前 Thread，不替代全局顶部导航。
- 标题旁 `i` 和右侧 `运行信息`按钮必须视觉上区分。
- 左侧项目栏不参与移动，避免页面整体漂移。

## 顶部标题栏

### 布局目标

选中 Thread 后，主工作区顶部是一条横贯左右的工作标题栏：

```text
EGFR 抗体亲和力优化  i                                      [运行信息] [...]
```

这条标题栏参考 Codex 的位置关系：左侧标题贴边，右侧按钮贴边，中间不再把标题区域包成居中大块。这里只参考左右贴边和贯穿感，不照抄 Codex 的按钮样式。

要求：

- 标题栏横向贯穿 `workspace-main` 的可用宽度。
- 标题栏高度紧凑，建议 `48px` 到 `52px`。
- 标题栏底部保留 `1px` 轻分割线。
- 标题靠左，右侧按钮靠右。
- 标题单行显示，溢出省略。
- 标题字号建议 `18px`，最大不超过 `20px`。
- 标题字重建议 `750` 到 `800`，不能再像页面 hero。
- 标题栏不使用卡片、阴影、圆角或大块背景。

### 标题元信息

标题旁保留小 `i`，只做 hover / focus tooltip。

Tooltip 内容：

```text
项目：Antibody Optimization
对话轮次：19
```

边界：

- 不点击打开复杂内容。
- 不显示进度、输出、审批、能力调用。
- 不承担 Run Inspector 的职责。
- 不使用醒目的按钮背景，默认应像轻量辅助信息。

### 状态文字

标题行支持可选状态：

- 默认不显示状态。
- 如果当前 Thread 有待审批，标题旁显示 `待审批` 高亮文字。
- 如果当前 Thread 有待确认，标题旁显示 `待确认` 高亮文字。

EGFR 当前完成态不显示状态。

状态来源：

- 优先从 `runInspector.approvals` 中的 pending 项派生。
- `approvalRequest` pending 时显示 `待审批`。
- `humanConfirmation` pending 时显示 `待确认`。
- 两者同时存在时显示两个状态，但第一版 mock 不需要制造这种场景。

### 右侧按钮

右侧按钮顺序：

```text
[运行信息] [...]
```

`运行信息`按钮：

- 使用侧栏 / panel-right 图标，不使用 `i`。
- 图标语义是“打开右侧运行信息窗”，不是“更多信息”。
- 默认透明背景，hover 后出现浅背景。
- 打开后显示 active 态，可用浅蓝背景或更深图标色，但不要强色块。
- Tooltip 文案：
  - 关闭时：`打开运行信息`
  - 打开时：`关闭运行信息`

`...` 菜单沿用当前 Thread 菜单能力：

- 分享
- 重命名
- 归档
- 删除

`...` 菜单必须仍在最右侧；`运行信息`按钮在它左侧。

## 主工作区布局

### 默认关闭态

Run Inspector 关闭时：

```text
TopNav
Sidebar | ThreadWorkspace
          ├─ ThreadTitleBar
          ├─ ConversationTranscript
          └─ ThreadComposer
```

视觉要求：

- ThreadTitleBar 贯穿主区宽度。
- ConversationTranscript 仍保持内容列宽控制，正文 max width 建议 `840px` 到 `880px`。
- ThreadComposer 与对话正文列对齐，不需要铺满全宽。

### 桌面展开态

Run Inspector 打开且宽度充足时：

```text
TopNav
Sidebar | ThreadWorkspace
          ├─ ThreadTitleBar spans all columns
          ├─ ConversationColumn | RunInspector
          └─ ComposerColumn     | RunInspector
```

要求：

- Run Inspector 宽度建议 `360px`。
- Run Inspector 右边贴近主工作区右侧。
- ConversationColumn 优先吃掉原来的左右留白，而不是立即压缩正文。
- 对话正文最小可读宽度不低于 `720px`。
- Composer 对齐 ConversationColumn，不延伸到 Run Inspector 下方。
- 左侧项目栏宽度和位置不变。

### 中等宽度

当主工作区宽度不足以同时容纳 `720px` 对话正文、`360px` Run Inspector 和必要 gutter 时，Run Inspector 改为右侧浮层抽屉：

- 抽屉覆盖主区右侧，不继续压缩对话正文。
- 抽屉宽度仍优先 `360px`。
- 背景不加重遮罩，最多使用极轻透明层；保持工作台感。
- 点击外部或 `Escape` 可关闭。

建议触发条件：

- CSS media/container 判断主工作区小于约 `1180px`。
- 或实现时用更稳定的 class / media query 近似，不需要运行时测量。

### 窄屏

当前 Demo 主要面向桌面。窄屏沿用右侧浮层抽屉策略：

- 宽度为 `min(360px, calc(100vw - 32px))`。
- 右侧贴边。
- 不要求移动端做完整重排。

## Run Inspector 视觉设计

### 面板本体

Run Inspector 是侧边工作面板，不是浮动卡片。

桌面展开态：

- 右侧贴边。
- 左侧 `1px` 分割线。
- 背景使用页面 surface 色。
- 不使用外层圆角。
- 不使用大阴影。
- 自己独立滚动。
- 高度占满标题栏下方到主工作区底部。
- ThreadComposer 位于左侧对话列底部；Run Inspector 不在 composer 下方，也不被 composer 截断。

中等宽度浮层态：

- 可以使用轻阴影表示覆盖关系。
- 右侧贴边。
- 圆角只允许出现在左上 / 左下的小半径，建议不超过 `8px`。

### 信息层级

Run Inspector 内部不要堆大卡片。推荐结构：

```text
运行信息
已完成干湿闭环
7 / 7 步 · 6 个输出 · 0 个待处理

进度
  ✓ 读取上下文
  ✓ 结构分析
  ✓ 候选生成

输出
  report.md
  results.xlsx

审批
  已确认 Top 3
  已审批实验订单

能力调用
  ▸ StructureAnalyzer.run
  ▸ ExperimentOrderDraft.create
```

视觉要求：

- 分区之间用轻分割线或自然间距，不用重卡片。
- 标题字号小于主对话标题，建议 `13px` 到 `14px`。
- 正文和 meta 使用灰色层级，避免和主对话抢视觉焦点。
- 状态色只用于关键状态点，不铺满整行。
- 列表行可 hover，但第一版不需要真实跳转。

### 顶部摘要

摘要区域显示：

- 面板标题：`运行信息`
- 当前阶段
- 已完成步骤数 / 总步骤数
- 产物数量
- 待处理审批或确认数量

EGFR 完成态示例：

```text
运行信息
已完成干湿闭环
7 / 7 步 · 6 个输出 · 0 个待处理
```

如果当前 Thread 没有结构化 `runInspector` 数据：

```text
运行信息
暂无运行信息
这个对话还没有可展示的运行状态。
```

### 进度

进度展示为紧凑 timeline 或步骤列表。

每个步骤包含：

- 标题
- 状态
- 可选耗时或时间
- 可选一句说明

状态：

- `done`
- `active`
- `waiting`
- `blocked`

EGFR mock 可包含：

1. 读取项目上下文与用户上传基线表。
2. 运行结构分析与突变热点定位。
3. 生成并筛选 MOO 候选。
4. 用户确认 Top 3 候选。
5. 生成并修正 Experiment Order Draft。
6. 审批通过并提交实验订单。
7. 导入湿实验结果并生成结论。

### 输出

输出展示 Agent 已生成或保存的对象。每条输出包含：

- 名称
- 类型
- 保存位置
- 状态

EGFR mock 可包含：

- `EGFR_candidate_ranked_summary.md`
- `EGFR_top3_wetlab_order_draft.json`
- `BM-LAB-EGFR-20260528-001`
- `EGFR_BLI_SEC_HPLC_results.xlsx`
- `EGFR_optimization_report.md`
- Scientific Figure 条目。

输出只是 Demo 中的结构化条目，不需要真实文件可下载。

### 审批

审批区同时放轻量确认和正式审批，但视觉上区分：

- Human Confirmation：轻量确认。
- Approval Request：正式审批。

EGFR mock 包含：

- 已确认 Top 3 候选进入湿实验验证。
- 已审批提交 Experiment Order。

如果未来存在待处理项，标题栏状态应显示 `待确认` 或 `待审批`。

### 能力调用回放

能力调用回放用于表达 Main Agent 调用 **Capability Command** 的用户可见轨迹。默认每条调用收起。

收起态示例：

```text
▸ StructureAnalyzer.run · success · 12.4s
```

展开态包含：

- capability / tool 名称
- status
- input 摘要
- output 摘要
- duration
- artifacts

第一版的折叠状态只保存在组件本地，不持久化。

## 数据模型

在 `src/data/conversationTypes.ts` 增加 Run Inspector 相关类型。

建议：

```ts
export type RunInspectorData = {
  summary: {
    stage: string
    status: 'notStarted' | 'running' | 'waiting' | 'completed' | 'blocked'
    completedSteps: number
    totalSteps: number
    outputCount: number
    pendingCount: number
  }
  progress: RunInspectorProgressItem[]
  outputs: RunInspectorOutputItem[]
  approvals: RunInspectorApprovalItem[]
  capabilityRuns: RunInspectorCapabilityRunItem[]
}

export type RunInspectorProgressItem = {
  id: string
  title: string
  status: 'done' | 'active' | 'waiting' | 'blocked'
  meta?: string
  detail?: string
}

export type RunInspectorOutputItem = {
  id: string
  name: string
  kind: 'projectFile' | 'experimentOrder' | 'report' | 'dataset' | 'figure'
  location: string
  status: 'draft' | 'saved' | 'submitted' | 'completed'
}

export type RunInspectorApprovalItem = {
  id: string
  kind: 'humanConfirmation' | 'approvalRequest'
  title: string
  status: 'pending' | 'confirmed' | 'approved'
  actor?: string
  decidedAt?: string
}

export type RunInspectorCapabilityRunItem = {
  id: string
  commandName: string
  status: 'success' | 'failed' | 'warning'
  summary: string
  duration: string
  input: Record<string, string | number | boolean | string[]>
  output: Record<string, string | number | boolean | string[]>
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
  }>
}
```

`DemoThread` 增加可选字段：

```ts
runInspector?: RunInspectorData
```

结构化数据放在 mock data 中，优先只给 EGFR Thread 填完整内容。其他 Thread 可以不填。

### 数据边界

- Thread Transcript 负责对话叙事与内容展示。
- Run Inspector 负责结构化运行状态。
- 两边可以共享 ID 或名称，但渲染时不要从一边解析另一边。
- 不把 UI 文案硬编码在组件里；组件只消费 `mockData` 的结构化字段。
- Run Inspector 里的能力调用是 **Capability Run Replay** 的侧栏摘要，不是系统 trace。

## 持久化状态

Run Inspector 是 Thread 级状态，不是全局状态。

建议：

```ts
type RunInspectorUiState = {
  open: boolean
}

type DemoStateSnapshot = {
  runInspectorByThreadId: Record<string, RunInspectorUiState>
}
```

规则：

- EGFR mock Thread 首次进入默认 `open: false`。
- 用户打开后，只记录当前 Thread 的 open 状态。
- 切换 Thread 时读取该 Thread 自己的 open 状态。
- 其他 Thread 如果没有记录，默认关闭。
- 第一版只持久化 open 状态。
- 能力调用折叠状态不持久化，刷新后恢复默认收起。
- Zustand `partialize` 加入 `runInspectorByThreadId`。
- `reset()` 清空持久化状态并回到默认关闭。

## 组件拆分

建议新增：

- `src/components/RunInspector.tsx`
- `src/components/RunInspectorSection.tsx`，如果单文件过长再拆。

建议调整：

- `src/components/ThreadWorkspace.tsx`
  - 接收 `runInspectorOpen`。
  - 接收 `onRunInspectorOpenChange`。
  - 渲染 `运行信息`按钮。
  - 根据状态渲染 `RunInspector`。
- `src/store/demoStoreLogic.ts`
  - 增加 run inspector UI state 类型和 reducer。
- `src/store/useDemoStore.ts`
  - 持久化 `runInspectorByThreadId`。
- `src/data/mockData.ts`
  - 给 EGFR Thread 添加 `runInspector` 数据。
- `src/components/icons.tsx`
  - 增加 panel / run inspector 图标。

## 交互细节

- 打开 Run Inspector 后，标题栏按钮 active。
- 切换 Thread 时，是否打开由新 Thread 的持久化状态决定。
- 如果当前 Thread 没有 `runInspector` 数据但 open 为 true，面板显示空状态。
- `...` 菜单和 Run Inspector 互不影响。
- 重命名、归档、删除弹窗优先级高于 Run Inspector。
- 删除 Thread 后，相关 `runInspectorByThreadId[threadId]` 应清理。
- 归档 Thread 后可保留 Run Inspector 状态；如果未来恢复归档，状态仍可用。
- 面板打开时不要触发右上角 toast。

## 性能要求

- Run Inspector 不应导致对话滚动变卡。
- ConversationTranscript 仍保持独立滚动容器。
- Run Inspector 自己使用独立滚动容器。
- 能力调用详情默认收起，避免一次性渲染大量 input/output。
- 可以继续使用 `memo`、稳定 props 和 `content-visibility` 优化长内容。

## 可访问性

- `运行信息`按钮需要 `aria-label` 和 `aria-expanded`。
- Run Inspector 面板需要可读标题，例如 `aria-label="运行信息"`。
- 可折叠能力调用条目使用 button，带 `aria-expanded`。
- Tooltip 支持 hover 和 focus-visible。
- `Escape` 关闭 Run Inspector 时不影响已有 rename/delete dialog 的键盘处理。
- 浮层态点击外部关闭时，焦点应回到 `运行信息`按钮。

## 测试计划

单元测试：

- `createInitialDemoState` 初始化时 `runInspectorByThreadId` 为空或默认关闭。
- `toggleRunInspectorSnapshot` 只影响指定 Thread。
- 切换 Thread 不改变各 Thread 已保存的 Run Inspector open 状态。
- 删除 Thread 清理对应 Run Inspector 状态。
- Zustand `partialize` 包含 `runInspectorByThreadId`。

组件/集成测试：

- EGFR Thread 初次打开时 Run Inspector 不显示。
- 点击 `运行信息`按钮后面板显示。
- 再次点击后面板关闭。
- 刷新后保持 EGFR Thread 的 Run Inspector 开关状态。
- 无 `runInspector` 数据的 Thread 打开后显示空状态。
- `...` 菜单仍可打开，并且菜单项不受 Run Inspector 影响。

浏览器验证：

- 使用本地 `localhost:5173` 打开 Demo。
- 进入 EGFR Thread，确认标题栏横贯左右、标题更小。
- 打开 Run Inspector，确认对话区没有被压到低于合理宽度。
- 改变浏览器宽度，确认中等宽度进入右侧浮层抽屉策略。
- 检查滚动性能：对话滚动和 Run Inspector 滚动互不拖慢。

## 实施顺序

1. 增加 Run Inspector 类型和 EGFR mock `runInspector` data。
2. 增加 Thread 级 Run Inspector UI state 与 Zustand 持久化。
3. 新建 `RunInspector` 渲染顶部摘要和四个分区。
4. 调整 `ThreadWorkspace` 标题栏、按钮与布局结构。
5. 补 CSS：标题栏、Run Inspector、响应式布局。
6. 补单元测试和组件行为验证。
7. 启动本地服务，用浏览器验证布局和交互。

## 自检

- 没有把 Run Inspector 设计成全局状态。
- 没有让 EGFR mock 首次进入时自动展开。
- 没有复用标题旁 `i` 作为运行信息按钮。
- 没有要求从对话文本解析运行信息。
- 没有引入真实后端、真实审批或真实工具执行。
- 没有改变左侧项目栏宽度和行为。
- 没有把侧栏设计成系统日志、Task 面板或 debug console。
