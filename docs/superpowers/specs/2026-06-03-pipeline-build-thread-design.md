# Pipeline Build 单线程设计

## 状态

本 spec 定义一个新的 Workspace project：**Pipeline Build**。它只有一个 thread：**ENZ-P0 实验流程编排**。

**Pipeline Build** 是一个 R&D enablement Project：它用于沉淀可复用实验 Pipeline，而不是 Capabilities 页面、Agent Builder 模式或产品功能入口。

这个 thread 演示用户通过自然语言和 Main Agent 共创一条固定 Pipeline：用户先提出模糊需求，Agent 每轮只确认一个关键决策，并给出最推荐方案和备选方案；确认完成后，Agent 生成 DAG 草稿，用户提出修改，Agent 修订 DAG，最后保存为 Pipelines 中的可复用 Pipeline capability。

对用户可见的 thread 文案不能出现 `demo`、`mock`、`模拟` 等削弱真实感的词。内部文件名、测试名和 spec 可以使用 mock 语义。

## 目标

1. 新增一个短项目名 **Pipeline Build**，用于承载自然语言创建 Pipeline 的演示。
2. 项目下只新增一个 thread：**ENZ-P0 实验流程编排**。
3. Thread 对话从模糊需求开始，经过多轮 one-question-at-a-time 的需求澄清，收敛成可保存的实验 Pipeline。
4. 每轮 Agent 追问都采用 grill-me 风格：明确一个最推荐方案、1-2 个备选方案、推荐理由，并要求用户确认。
5. 对话中展示两个结构化 DAG 块：草稿 `v0.1` 和修订 `v0.2`。
6. 用户确认后，Agent 将修订版保存为 **ENZ-P0 Assay Characterization Pipeline v1.0**。
7. Pipelines 管理页新增同名 created Pipeline entry，能展示同一条 DAG。
8. 右侧 Run Inspector 展示 Pipeline Builder 的执行轨迹、输出和确认记录。
9. 网站进入主页时仍默认展示 **新对话**，不默认打开任何 mock thread；用户点击该 thread 后才展示内容。

## 非目标

- 不实现真实后端持久化。
- 不实现真实 Pipeline 编辑器、拖拽连线或节点配置表单。
- 不接真实 Agent Builder、真实实验系统、真实 LIMS、真实设备或真实 Pipelines API。
- 不把本 thread 做成实验执行过程。它的核心是 **Pipeline capability 创建和保存**。
- 不覆盖上游酶设计和下游完整数据分析。实验结果分析只作为 Pipeline 输出契约的一部分出现。
- 不更改现有首页默认状态规则。

## 产品边界

本轮要表达的是：Main Agent 能把用户的自然语言目标转化为可治理的 Pipeline capability。

这次交互属于 **Agent Builder** 创建流的一种表现，但对话里仍只有 **Main Agent** 一个用户可见协作者。不要写成另一个 specialist agent、Pipeline agent 或 Builder agent 在接管工作。

这条 Pipeline 按执行型 Pipeline 的语义组织 DAG：固定实验控制点、Human Gate、QC Decision、Lab Resource 和结果交接。但用户可见命名统一使用 **Pipeline**，不在 thread 标题、对话正文或 Pipelines 列表中额外显示 `Execution Pipeline`。

Main Agent 的责任边界是把用户确认过的实验约束、SOP 片段和输入文件编排成可治理 Pipeline。它不声称替用户判断底物批次、反应体系、对照设置或异常复测的科学合理性；这些高影响条件必须通过 Human Gate 固定为人工确认点。

因此 thread 的主线不是“AI 直接执行实验”，而是：

```text
模糊需求
  -> 单点追问
  -> 输入文件确认
  -> 实验范围确认
  -> QC / 人工确认点确认
  -> 生成 DAG v0.1
  -> 用户提出修改
  -> 生成 DAG v0.2
  -> 用户确认
  -> 保存为 Pipeline v1.0
```

保存动作在前端 mock 中要形成闭环：thread 里说“已保存到 Pipelines”，同时 `Capabilities / Pipelines` 页面能看到 **ENZ-P0 Assay Characterization Pipeline**。

## 信息架构

### Project

新增 project：

- `id`: `pipeline-build`
- `name`: `Pipeline Build`
- `threads`: 1 个

### Thread

新增 thread：

- `id`: `pipeline-enz-p0-experiment-flow`
- `title`: `ENZ-P0 实验流程编排`
- `lastActivity`: 使用相对时间，例如 `刚刚`
- `pinned`: 可设为 `false`
- `archived`: `false`

Thread 只属于 `Pipeline Build` project，不放进现有 `Industrial Enzyme Design` 项目，避免和全链路酶优化案例混淆。`Pipeline Build` 的语义是流程开发团队的 R&D enablement Project，不是顶层产品模块。

### Pipeline Entry

Pipelines 页新增 entry：

- `id`: `pipeline-enz-p0-assay-characterization`
- `kind`: `pipeline`
- `name`: `ENZ-P0 Assay Characterization Pipeline`
- `status`: `active`
- `source`: `created`
- `owner`: `Process Development Team`
- `version`: `v1.0`
- `tags`: `['酶工程', '实验表征', '流程编排']`
- `lastUsedAt`: `刚刚`
- `updatedAt`: `2026-06-03`

接口说明：

- Inputs: `候选酶变体表`, `实验 SOP`, `底物批次 QC`, `项目约束`
- Outputs: `标准化实验订单`, `QC 状态表`, `结果包`, `Pipeline 版本记录`
- Permissions: `底物批次与反应体系需人工确认`, `异常样本复测需人工确认`, `Pipeline 生效需用户确认`

Permissions 文案应表达责任边界：Main Agent 可以校验依赖和格式，但不能自动替用户决定实验条件是否科学合理。

## 对话设计

### 轮数

目标为 14-16 轮：

- 用户：6-7 轮
- Agent：8-9 轮

这样足够展示“反复打磨”，但不会让单 thread 过长。

### 起始输入

用户第一轮应故意偏模糊，例如：

> 我想把 ENZ-P0 这一批候选酶后面的实验流程固化成一个 Pipeline，后面团队可以直接复用。你先帮我一起把流程确认清楚。

不要让用户一开始就给出完整 SOP。Agent 必须通过追问把目标转成固定流程。

### Agent 追问格式

每次只确认一个决策点。推荐写法：

```text
我建议选 A：<推荐方案>，原因是 <一句具体理由>。

也可以选 B：<备选方案>，适合 <取舍>。
如果你希望更保守，也可以选 C：<备选方案>，但会 <代价>。

我先按 A 推进，可以吗？
```

要求：

- 推荐项必须明确，不只平铺选项。
- 每轮只问一个问题。
- 备选项最多 2 个。
- 推荐理由要贴合实验流程设计，不写泛泛的“更好、更完整”。
- 不使用 “demo / mock / 模拟 / 回放” 等对用户可见词。

### 对话主线

建议按以下节奏编写：

1. 用户提出模糊需求：想把 ENZ-P0 候选酶实验流程固化成 Pipeline。
2. Agent 追问实验范围。推荐覆盖表达/纯化 QC、酶活、pH/温度、半衰期和结果包归档；备选只做活性 assay 或扩到分析决策。
3. 用户确认推荐范围。
4. Agent 追问输入文件。推荐使用候选变体表、SOP、底物批次 QC 三类 Project Files；备选只用候选表或额外加入历史结果包。
5. 用户补充输入文件，并用 `projectFile` blocks 展示：
   - `ENZ-P0_candidate_variants.xlsx`
   - `Enzyme_Assay_SOP_v3.md`
   - `Substrate_Lot_QC_202606.xlsx`
6. Agent 读取输入文件，追问 QC 策略。推荐把表达/纯化 QC 作为进入活性测定的前置节点；备选为只记录不阻断或所有样本都进入活性。
7. 用户确认推荐策略。
8. Agent 追问人工确认点。推荐在样本接收后、活性测定前、异常复测前和保存生效前设置确认点；备选更少或更多。
9. 用户确认，但希望先看 DAG 草稿。
10. Agent 生成 DAG `v0.1`，展示结构化 DAG block 和简短说明。
11. 用户提出一句修改：活性测定前要补一个确认底物批次、反应体系、阳性/阴性对照的节点。
12. Agent 说明已插入该 human gate，生成 DAG `v0.2`。
13. Agent 追问是否保存为 `ENZ-P0 Assay Characterization Pipeline v1.0`。推荐保存并启用；备选保存草稿或只导出 JSON。
14. 用户确认保存。
15. Agent 显示保存结果：已保存到 Pipelines，版本 `v1.0`，并列出输入、输出、人工确认点和后续可复用入口。

最终保存文案使用 `已保存到 Pipelines，来源为自建，版本 v1.0`。不要新增 `Agent-built`、`AI-generated` 或类似来源词；来源 taxonomy 继续沿用 Capabilities 页已有的 `created`。

输入文件在对话里称为 **Project Files** 或“输入文件”，不称为 **Assets**。保存后的 Pipeline 才进入 Pipelines 管理页，作为可治理的 Pipeline capability。这样避免把临时上传或项目文件误认为 Durable Asset。

## DAG 设计

### 版本语义

`v0.1` 和 `v0.2` 是对话内 **Pipeline DAG Block** 的草稿版本，用来展示用户修改前后的拓扑变化。`v1.0` 是用户确认后保存到 Pipelines 的 Pipeline capability 版本。

不要把 `DAG v0.2` 显示成最终 Pipeline version；最终保存结果应写作 `ENZ-P0 Assay Characterization Pipeline v1.0`，其 DAG 来源于对话中校验通过的 `v0.2`。

### 数据模型

对话内 DAG 组件复用 `src/data/mockCapabilities.ts` 中的 `PipelineDag` 数据结构：

- `nodes`
- `edges`
- `PipelineDagNode.kind`
- `PipelineDagNode.subtype`
- `PipelineDagNode.control`
- `PipelineDagNode.resources`
- `PipelineDagNode.layout`

新增 **Pipeline DAG Block** 对话内容块类型时，不复制另一套 DAG schema。建议新增：

```ts
type PipelineDagBlock = {
  type: 'pipelineDag'
  title: string
  version: string
  status: 'draft' | 'validated' | 'saved'
  summary: string
  dag: PipelineDag
}
```

并新增封装组件，例如：

```text
src/components/PipelineDagBlock.tsx
```

该组件负责 DAG canvas、节点卡片、边线、legend、版本标记和保存状态展示。`ConversationBlocks.tsx` 只负责 switch 到这个组件，不承载绘图细节。

### DAG v0.1 节点

草稿 `v0.1` 建议包含 8 个节点：

1. `输入文件确认`
   - kind: `input`
   - 输入候选变体表、SOP、底物 QC、项目约束。
2. `实验范围锁定`
   - kind: `human-gate`
   - 确认本 Pipeline 覆盖表达/纯化 QC、酶活、pH/温度、半衰期和结果包归档。
3. `样本接收与条码映射`
   - kind: `operation`
   - subtype: `sample`
4. `表达与纯化 QC`
   - kind: `qc-decision`
   - subtype: `lab-operation`
5. `酶活测定`
   - kind: `operation`
   - subtype: `lab-operation`
6. `pH / 温度 / 半衰期面板`
   - kind: `operation`
   - subtype: `lab-operation`
7. `异常复核与复测判断`
   - kind: `human-gate`
   - control: `human-confirmation`
8. `结果包与版本记录`
   - kind: `output`
   - subtype: `report`

节点 `kind` 只表达流程角色，`subtype` 只表达展示层分类。设备、LIMS、板位、样本库或自动化工作站属于 `resources`，不要作为新的 node kind 或 subtype 写进 schema。

### DAG v0.2 节点

修订 `v0.2` 在 `表达与纯化 QC` 和 `酶活测定` 之间新增一个 human gate：

`底物与反应体系确认`

确认内容：

- 底物批次是否使用 `Substrate_Lot_QC_202606.xlsx` 中的合格批次。
- 反应体系是否采用 SOP v3 的默认缓冲液、温度、反应时间。
- 阳性对照和阴性对照是否齐全。
- 如果底物 QC 过期或对照缺失，Pipeline 暂停并要求人工处理。

最终 `v0.2` 共 9 个节点。用户确认后保存为 Pipeline entry 的 `dag`。

### 视觉要求

- 对话内 DAG 不是截图或生成图片，而是结构化可视组件。
- 节点卡片要能区分 `input`、`operation`、`human-gate`、`qc-decision`、`output`。
- Human gate 和 QC decision 要有明显但克制的视觉标识。
- 组件在桌面宽度下横向或纵向都可以，但不得文本溢出、节点重叠或边线遮挡标题。
- 移动端可横向滚动，不强行压缩到不可读。
- 标题、版本号和状态要固定展示，例如 `DAG v0.2 · validated`。

## Run Inspector

该 thread 的 Run Inspector 表达 Pipeline Builder 的轨迹，而不是实验执行轨迹。

用户可见对话和 Run Inspector 标题不引入 **Task** 概念。`Pipeline Builder` 只是这次 Main Agent 工作的 run stage label，不显示为单独 Task，也不在侧栏或 transcript 中创建 Task 卡片。

建议 summary：

- `stage`: `Pipeline Builder`
- `status`: `completed`
- `completedSteps`: 7
- `totalSteps`: 7
- `outputCount`: 3
- `pendingCount`: 0

Progress：

1. `需求范围澄清`
2. `输入文件读取`
3. `QC 策略确认`
4. `人工确认点插入`
5. `DAG 草稿生成`
6. `DAG 修订校验`
7. `保存到 Pipelines`

Outputs：

- `ENZ-P0 Assay Characterization Pipeline v1.0`
- `Pipeline_DAG_v0.2.json`
- `Pipeline_Build_Decision_Log.md`

Approvals / confirmations：

- `确认实验范围`
- `确认输入文件`
- `确认底物与反应体系 gate`
- `确认保存并启用 Pipeline v1.0`

这些记录使用 **Human Confirmation** 语义，不创建正式 **Approval Request**。本 thread 不涉及提交实验订单、对外发布结果或其他高影响动作；保存 Pipeline v1.0 是用户确认后的产品内配置生效。

Capability runs：

- `FileReader.extractPipelineInputs`
- `SopParser.extractExperimentSections`
- `PipelinePlanner.generateDraftDag`
- `HumanGatePlanner.insertControlPoint`
- `PipelineDagValidator.validateDependencies`
- `PipelineRegistry.savePipeline`

## Pipelines 页联动

新增 Pipeline entry 后，用户切到 `Capabilities / Pipelines` 时应能看到：

- 列表中有 `ENZ-P0 Assay Characterization Pipeline`
- 来源为 `自建` 或 existing source label 对应的 `created`
- 状态为 `启用中`
- 版本为 `v1.0`
- 详情面板展示输入、输出、权限边界、步骤和 recent activity
- DAG preview 使用 v0.2 对应 DAG

Recent activity 建议：

- `从 ENZ-P0 实验流程编排保存`
- `插入底物与反应体系人工确认点`
- `完成 DAG 依赖校验`

## 组件设计

### 新增 PipelineDagBlock

新增独立组件：

```text
src/components/PipelineDagBlock.tsx
```

职责：

- 接收 `PipelineDagBlock` 数据，表达 **Pipeline DAG Block**。
- 渲染标题、版本、状态、摘要。
- 渲染 DAG canvas。
- 支持节点 kind/subtype 的视觉区分。
- 对长标题和长描述做截断或换行控制。
- 不依赖 Capabilities 页面状态。

### 复用关系

优先把 Capabilities 页现有 DAG canvas 的可复用部分抽到共享组件，避免出现两套 DAG 绘图逻辑。

建议方向：

```text
src/components/PipelineDagCanvas.tsx
```

由以下调用方复用：

- `CapabilitiesPage.tsx`
- `PipelineDagBlock.tsx`

如果抽离成本过高，可以先新增 `PipelineDagBlock.tsx`，但仍应复用 `PipelineDag` 类型，保持数据结构一致。

### ConversationBlocks 集成

`src/data/conversationTypes.ts` 新增 `PipelineDagBlock` union。

`src/components/ConversationBlocks.tsx` 新增 case：

```ts
case 'pipelineDag':
  return <PipelineDagBlock block={block} />
```

`ConversationBlocks.tsx` 不写 DAG layout 算法。

## 数据实现建议

建议新增独立数据文件，避免继续扩大 `mockData.ts`：

```text
src/data/pipelineBuildMockData.ts
```

导出：

```ts
export const pipelineBuildThreads = [...]
export const enzP0AssayCharacterizationPipeline = ...
```

然后：

- `src/data/mockData.ts` import project/thread 并加入 `projects`
- `src/data/mockCapabilities.ts` import pipeline entry 并加入 `capabilityEntries`

如果出现循环依赖，就把 Pipeline entry 放在 `mockCapabilities.ts`，DAG 常量放在独立 `pipelineDagMocks.ts`。

保存闭环通过 seed mock 数据一致性表达，不要求实现运行时写入。Thread 最后一轮说“已保存到 Pipelines”时，Pipelines 页面中的 entry 应已由同一组 seed 数据提供。推荐把 `v0.2` DAG 常量抽到独立文件，由 thread block 和 Pipeline entry 共同引用或复制自同一源，避免两处拓扑不一致。

## 测试要求

新增或更新测试覆盖：

1. `Pipeline Build` project 存在，且只有一个 thread。
2. Thread 标题为 `ENZ-P0 实验流程编排`。
3. 首页默认仍是新对话，不默认选中该 thread。
4. Thread transcript 包含 14-16 轮。
5. 用户轮数为 6-7，Agent 轮数为 8-9。
6. Transcript 中至少包含两个 `pipelineDag` blocks：`v0.1` 和 `v0.2`。
7. `v0.2` DAG 比 `v0.1` 多 `底物与反应体系确认` human gate。
8. Transcript 可见文案不包含 `demo`、`mock`、`模拟`。
9. `Capabilities / Pipelines` 中存在 `ENZ-P0 Assay Characterization Pipeline`。
10. 该 Pipeline 的 `source` 为 `created`，`version` 为 `v1.0`，且有 DAG。
11. `RunInspector` summary 为 completed，并包含 `保存到 Pipelines` progress item。
12. Transcript 和 Pipelines entry 不出现 `Agent-built` 或 `AI-generated` 作为来源词。
13. 运行 `npm test -- --run` 和 `npm run build` 通过。

## 可验收标准

- 用户打开页面时仍看到新对话首页。
- 左侧项目中出现 `Pipeline Build`。
- 点击 `Pipeline Build / ENZ-P0 实验流程编排` 后，能看到从模糊需求到保存 Pipeline 的完整对话。
- Agent 每轮追问都明确一个推荐方案和最多两个备选方案。
- 对话中出现 DAG `v0.1` 和 DAG `v0.2` 两个结构化可视块。
- 用户一句修改能在 `v0.2` 中反映为新增 human gate。
- 最后一轮 Agent 说明 Pipeline 已保存到 Pipelines，版本为 `v1.0`。
- 切到 Pipelines 管理页能看到同名 Pipeline 和同一条 DAG。
- 右侧 Run Inspector 展示 Pipeline Builder 轨迹。
- 对用户可见内容不出现 `demo`、`mock`、`模拟`。

## 风险与约束

- 现有 Capabilities DAG canvas 写在 `CapabilitiesPage.tsx` 中，抽离时要避免破坏现有 Capabilities 测试。
- 对话内 DAG 组件如果复用 CSS，需要避免 Capabilities 页面样式泄漏到 Workspace。
- 如果 DAG 节点文字过长，容易在对话宽度下溢出；实现时必须做响应式和文本折行验证。
- 保存动作没有真实后端，必须通过 mock 数据闭环保证产品上不穿帮。
- 本 thread 是 Pipeline 创建场景，不要写成酶实验执行结果分析场景，避免和已有工业酶优化案例重叠。
