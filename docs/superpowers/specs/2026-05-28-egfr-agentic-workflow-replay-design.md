# EGFR Agentic Workflow Replay 设计

## 状态

本 spec 替代 `2026-05-28-egfr-thread-mock-conversation-design.md` 中关于 `EGFR 抗体亲和力优化` 对话内容的设计。旧 spec 保留为历史记录；本 spec 是后续实现依据。

## 目标

把 `Antibody Optimization / EGFR 抗体亲和力优化` 改造成一个高仿真的 Agent 工作流回放。用户点击这条对话后，右侧主区不再是普通问答，而是看到 Agent 完成了一个端到端干湿闭环：

1. 读取用户上传的基线文件和项目上下文。
2. 以 **Capability Run Replay** 形式展示结构分析、突变位点标注、候选生成等能力运行回放。
3. 记录 **Human Confirmation**，确认 Top 3 候选。
4. 生成 Experiment Order Draft，遇到一次可解释的样本量问题并重试。
5. 通过已批准的 **Approval Request** 回放，确认提交 Experiment Order。
6. 用 **Elapsed Work Replay** 表达实验执行经过 7 天后完成。
7. 导入 BLI、SEC-HPLC、表达量、稳定性等实验结果。
8. 分析结果、给出候选推荐、写回项目文件区。

本阶段仍是纯前端 Demo，不接后端、不调用真实 LLM、不提交真实 Experiment Order、不使用真实客户序列或真实实验数据。

## 范围

本次只替换 EGFR 这条对话的 seed mock data 和对应渲染能力。

包含：

- EGFR 对话从当前短 mock 改为 19 轮完整回放。
- 新增 Capability Run Replay、Human Confirmation、Approval Request、Elapsed Work Replay、Scientific Figure 渲染块。
- 生成并接入 8 张 imagegen mock 科学图或数据图。
- 移除 EGFR 对话里旧的 BioMap OS 截图式视觉证据。
- 保持首页、左侧栏、顶部导航、其他对话现有行为。

不包含：

- 真实 Agent runtime。
- 真实 Capability Command 执行。
- 真实审批系统。
- 真实文件上传。
- 真实 Experiment Order 提交。
- 给所有其他对话补完整内容。
- 改首页案例卡或能力 chips。

## 设计原则

- 这是完整回放记录，不是需要用户逐步点击推进的交互流程。
- 对话看起来像 Agent 已经通过多个 Capability 完成任务，而不是知识问答。
- 语言说明全部用普通 Markdown 文本输出，不把说明文字塞进卡片里。
- Capability Run Replay 全部保留，但默认收起，避免页面显得乱。
- Human Confirmation、Approval Request 和 Elapsed Work Replay 是关键流程节点，默认展开显示。
- Scientific Figure 只用于表达生物学结构、实验数据和分析图，不承载关键结论。
- 关键数值、候选 ID、实验结论必须在文本或 Capability Run Replay 输出里写清楚。
- 页面可见文案不出现 `Thread`、`THREAD`、`Main Agent`。
- 内部类型名可以继续用 `Thread` 或 `mainAgent`，但不能泄露到 UI。

## 领域术语对齐

本 spec 遵循根目录 [CONTEXT.md](/Users/songxuzhengjun/Documents/BioMapAgent/CONTEXT.md) 中的术语：

- **Thread Transcript**：右侧可见对话记录和渲染块；不是完整 Thread 上下文。
- **Capability Run Replay**：对 Main Agent 能力运行的用户可见回放；本 Demo 中是 mock replay，不是后端执行日志、系统 trace 或 Task。
- **Human Confirmation**：用户在对话中确认某个轻量决策；不是正式 Approval Request。
- **Approval Request**：提交 Experiment Order 这类高影响动作的正式审批请求；在本回放中展示为已批准状态，不连接真实审批系统。
- **Elapsed Work Replay**：对异步工作耗时的回放标记；不是真实计时器、调度器或轮询结果。
- **Scientific Figure**：生物结构、实验数据或分析结果的科学图；属于 Visual Evidence，但不是 Project File 或 Asset。
- **Project File**：项目下的文件对象，可以由用户上传或 Agent 生成；不等同于 Asset。
- **Experiment Order Draft**：提交前的实验订单草稿；只有进入正式 review flow 后才成为 Experiment Order。

## 页面状态

### 新对话首页

保持现状：

- 中间显示首页标题和大输入框。
- 左侧不高亮任何对话。
- Use Case Cards 保持现状。

### 选中 EGFR 对话

点击 `EGFR 抗体亲和力优化` 后，主区显示完整回放。

顶部结构：

```text
EGFR 抗体亲和力优化   Antibody Optimization
19 轮对话 · 已完成干湿闭环 · 1 次确认 · 1 次审批
```

要求：

- 不显示 `THREAD`。
- `Antibody Optimization` 显示在标题右侧，字号小、颜色淡。
- 第二行是流程状态元信息，不使用英文 `turns`。
- 不显示 `Main Agent` 身份标题。

### 其他对话

其他对话保持空状态或现有行为：

```text
这个对话暂未制作内容
```

底部 compact composer 仍可见，用户可以输入并追加一条简单消息。

## 对话视觉

### 用户消息

用户消息继续右侧小气泡，内容简洁。

示例：

```text
帮我把 EGFR 抗体亲和力优化到 1 nM 以下，优先不要牺牲表达量和稳定性。
```

用户上传附件在气泡下方显示为紧凑 Project File 条。第一轮至少展示一个 mock 上传文件：

```text
EGFR_parent_antibody_baseline.xlsx
XLSX · 42 KB · 已保存为 Project File
Antibody Optimization / Files / Inputs
```

后续真实上传功能不在本次范围，但 spec 保留附件类型边界：

- 文档类：`pdf`、`docx`、`txt`、`md`
- 数据表格类：`xlsx`、`csv`、`tsv`
- 图像类：`png`、`jpg`、`jpeg`
- 生物序列或结构类可作为后续扩展：`fasta`、`pdb`

### Agent 文本输出

Agent 输出直接显示在内容流内，不显示头像、身份标题或外层消息卡。

支持：

- 段落
- 加粗
- 列表
- 内联代码
- 代码块
- Markdown 表格

当前 Markdown 渲染器如果不支持表格，实现时需要补一个轻量表格解析。候选对比和实验结果摘要优先用 Markdown 表格表达，不再使用专门的大型候选表组件。

### Capability Run Replay

能力运行回放合并成一个可折叠块，不拆成 `tool.call` 和 `tool.result` 两个块。它表示 Main Agent 在回放中运行了某个 Capability Command，但本 Demo 不产生真实后端执行记录。

默认收起态：

```text
▸ StructureAnalyzer.run · success · 识别 7 个抗原接触位点
```

展开态：

```text
capability: StructureAnalyzer.run
status: success
input:
  structure: BM-EGFR-01_AF2_complex.pdb
  antigen: EGFR_ECD
output:
  contact_sites: 7
  priority_regions: HCDR3, LCDR1
duration: 12.4s
artifacts:
  - EGFR_structure_contact_map.json
```

视觉要求：

- 字号比正文小一号。
- 文本颜色更灰。
- 等宽字体。
- 背景浅灰。
- 边框很轻，不使用醒目的状态色块。
- 左侧有折叠符号。
- 默认全部收起。
- 点击 header 展开或收起。
- 展开状态只保存在当前页面运行时，不需要 Zustand 持久化。

状态：

- `success`
- `failed`
- `warning`

本次回放必须包含一次失败再重试。失败原因是业务约束不满足，不是系统崩溃。

### Human Confirmation

Human Confirmation 不折叠，直接显示为轻量日志块。它表示用户确认了 Demo 流程中的轻量决策，不等同于正式 Approval Request。

```text
human.confirmed · 选择 Top 3 候选进入湿实验验证
确认人：zhengjun
确认时间：2026-05-28 14:16
decision: EGFR-AF-01、EGFR-AF-02、EGFR-AF-03 进入湿实验验证
```

本次回放包含一次 Human Confirmation：

1. 设计候选完成后，确认 Top 3 候选进入湿实验验证。

### Approval Request

提交 Experiment Order 属于高影响动作，必须展示为 Approval Request，而不是普通 Human Confirmation。本次回放不连接真实审批系统，只显示审批已通过的回放结果。

```text
approval.approved · 提交 Experiment Order
审批人：zhengjun
审批时间：2026-05-28 14:24
approvalType: experimentOrder
decision: 确认提交 BM-LAB-EGFR-20260528-001
```

### Elapsed Work Replay

Elapsed Work Replay 不折叠，用来表达时间跳跃，不制造真实延迟，也不代表真实 scheduler 或 Task 状态。

```text
waiting · ExperimentTask.execution
elapsed: 7 days
status: completed
summary: 表达、小量纯化、BLI、SEC-HPLC、DSF 已完成，结果文件已回传。
```

### Scientific Figure

本次最终实现接入 8 张 imagegen 生成的 mock Scientific Figure。图像资产必须放在独立 mock 目录，不混入真实品牌资产或旧 BioMap OS 截图资源。

建议目录：

```text
src/assets/mock-science/egfr/
```

图像清单：

1. `egfr-antibody-antigen-complex.png`：抗体-抗原复合物结构图。
2. `egfr-cdr-mutation-map.png`：CDR 突变位点标注图。
3. `egfr-pareto-optimization.png`：Pareto 多目标优化散点图。
4. `egfr-candidate-heatmap.png`：候选分子综合评分热力图。
5. `egfr-order-workflow.png`：Experiment Order Draft 设计流程图。
6. `egfr-bli-sensorgram.png`：BLI sensorgram 曲线。
7. `egfr-sec-hplc-chromatogram.png`：SEC-HPLC chromatogram 曲线。
8. `egfr-result-summary-chart.png`：表达量、纯度、稳定性综合结果图。

图像风格：

- 科学报告图和能力输出图混合。
- 视觉可信，但不依赖小字精确可读。
- 不出现真实品牌 UI。
- 不包含真实客户序列、真实实验数据或可识别隐私。
- 关键结论由文字和 Capability Run Replay 输出承载。

渲染 fallback：

如果某张图片资源还未接入，`ScientificFigureBlock` 可以显示 JSON 形态的占位说明，便于开发中验证布局：

```json
{"image":"图片：BLI sensorgram 曲线，比较 EGFR-P0、EGFR-AF-01、EGFR-AF-02、EGFR-AF-03 与 EGFR-ECD 的结合和解离过程"}
```

但最终验收需要 8 张 imagegen Scientific Figure 实际显示。

## 数据模型

现有 `ConversationTurn` 可以继续保留：

```ts
type ConversationTurn = {
  id: string
  role: 'user' | 'mainAgent'
  markdown?: string
  contentBlocks?: ConversationBlock[]
}
```

`role: 'mainAgent'` 只作为内部实现，UI 不显示这个词。

建议把 EGFR 需要的 `ConversationBlock` 调整为：

```ts
type ConversationBlock =
  | ProjectFileBlock
  | CapabilityRunReplayBlock
  | HumanConfirmationBlock
  | ApprovalRequestReplayBlock
  | ElapsedWorkReplayBlock
  | ScientificFigureBlock

type ProjectFileBlock = {
  type: 'projectFile'
  fileName: string
  fileKind: 'pdf' | 'xlsx' | 'csv' | 'png' | 'jpg' | 'fasta' | 'pdb' | 'md'
  location: string
  note: string
}

type CapabilityRunReplayBlock = {
  type: 'capabilityRunReplay'
  commandName: string
  status: 'success' | 'failed' | 'warning'
  summary: string
  defaultCollapsed: true
  input: Record<string, string | string[] | number | boolean>
  output: Record<string, string | string[] | number | boolean>
  duration: string
  artifacts?: Array<{
    name: string
    kind: 'json' | 'csv' | 'xlsx' | 'md' | 'png' | 'pdb' | 'fasta'
    description: string
  }>
}

type HumanConfirmationBlock = {
  type: 'humanConfirmation'
  title: string
  confirmedBy: string
  confirmedAt: string
  decision: string
}

type ApprovalRequestReplayBlock = {
  type: 'approvalRequestReplay'
  title: string
  approvalType: 'experimentOrder' | 'dataPublish' | 'modelRelease'
  status: 'approved'
  decidedBy: string
  decidedAt: string
  decision: string
  requestSummary: string
}

type ElapsedWorkReplayBlock = {
  type: 'elapsedWorkReplay'
  target: string
  elapsed: string
  status: 'completed'
  summary: string
}

type ScientificFigureBlock = {
  type: 'scientificFigure'
  figureId: string
  title: string
  description: string
  imagegenPrompt: string
  placeholder: string
  src?: string
  alt: string
}
```

旧块迁移：

- EGFR 对话不再使用 `mainAgentProgress`、`commandPreview`、`candidateMoleculeTable`、`experimentOrderDraft`、`approvalGatePreview`、`visualEvidence`。
- 这些旧块如果其他代码仍引用，可以暂时保留类型和渲染，避免扩大改动范围。
- EGFR 内容统一使用新的 Capability Run Replay、Human Confirmation、Approval Request Replay、Elapsed Work Replay、Scientific Figure 和 Project File 块。

## EGFR 回放内容

本次 EGFR 对话固定为 19 轮。每轮是一个 `ConversationTurn`，Capability Run Replay、Human Confirmation、Approval Request Replay、Elapsed Work Replay、Scientific Figure 作为 `contentBlocks` 插入 Agent 输出流。

### Turn 1: 用户提出目标并上传基线文件

用户消息：

```text
帮我把 EGFR 抗体亲和力优化到 1 nM 以下，优先不要牺牲表达量和稳定性。
```

Project File：

```text
EGFR_parent_antibody_baseline.xlsx
XLSX · 42 KB · 已保存为 Project File
Antibody Optimization / Files / Inputs
```

### Turn 2: Agent 读取目标和基线

Markdown：

```md
我读取了当前项目和你上传的基线表。这个对话里已有一个 parent antibody，可以复用上一轮 MOO 结果和实验基线。

目标约束：

- 主目标：BLI KD < **1 nM**
- 表达量：不低于 **35 mg/L**
- SEC-HPLC monomer：不低于 **95%**
- Tm 下降：不超过 **2 C**
- 聚集风险：排除 High
```

Capability Run Replay：

```text
FileReader.extractBaseline · success · 提取 parent antibody 和上一轮实验基线
```

展开数据要包含：

- Parent antibody: `EGFR-P0`
- 历史 BLI KD: `8.4 nM`
- 表达量: `42 mg/L`
- SEC-HPLC monomer: `96.8%`
- Tm: `66.1 C`

### Turn 3: Agent 分析抗体-抗原结构

Markdown：

```text
我先检查 parent antibody 与 EGFR-ECD 的复合物结构，重点看 CDR 接触面和可变区风险位点。
```

Capability Run Replay：

```text
StructureAnalyzer.run · success · 识别 7 个抗原接触位点
```

Scientific Figure：

```text
egfr-antibody-antigen-complex.png
```

### Turn 4: Agent 给出结构解释

Markdown：

```md
结构检查显示，HCDR3 和 LCDR1 是主要可优化区域。HCDR3 Y102 附近存在可增强疏水接触的空间，但不建议大幅增加侧链体积。

我会把候选限制在低风险小步突变：

- 优先 HCDR3: Y102 / D100a
- 次优先 LCDR1: S31
- 避免 framework 区域突变
- 避免引入明显聚集热点
```

### Turn 5: Agent 标注 CDR 突变位点

Capability Run Replay：

```text
MutationSiteMapper.mapCdrHotspots · success · 标注 5 个可设计位点和 3 个禁用位点
```

Scientific Figure：

```text
egfr-cdr-mutation-map.png
```

### Turn 6: Agent 生成候选分子

Markdown：

```text
我基于结构约束、上一轮实验基线和自然性评分生成候选组合，并用多目标优化排序。
```

Capability Run Replay：

```text
AffinityOptimizer.generateCandidates · success · 生成 64 个候选并筛出 8 个低风险组合
```

Scientific Figure：

```text
egfr-pareto-optimization.png
```

### Turn 7: Agent 输出候选摘要

Markdown：

```md
候选分子初筛结果：

| Candidate | Mutation | Predicted KD | Expression risk | Stability risk | Recommendation |
| --- | --- | ---: | --- | --- | --- |
| EGFR-AF-01 | H:Y102F + L:S31Y | 0.42 nM | Low | Low | Top 1 |
| EGFR-AF-02 | H:D100aN + H:Y102W | 0.55 nM | Medium | Medium | Top 2 |
| EGFR-AF-03 | L:S31Y + L:N92D | 0.68 nM | Low | Low | Top 3 |
| EGFR-AF-04 | H:Y102F + H:T57S | 0.74 nM | Low | Medium | Backup |

我建议先推进 EGFR-AF-01、EGFR-AF-02、EGFR-AF-03。EGFR-AF-04 保留为备选，不进入第一批湿实验。
```

Scientific Figure：

```text
egfr-candidate-heatmap.png
```

### Turn 8: Human Confirmation 确认 Top 3 候选

Human Confirmation：

```text
human.confirmed · 选择 Top 3 候选进入湿实验验证
确认人：zhengjun
确认时间：2026-05-28 14:16
decision: EGFR-AF-01、EGFR-AF-02、EGFR-AF-03 进入湿实验验证
```

### Turn 9: Agent 创建 Experiment Order Draft 并遇到失败

Markdown：

```text
我开始生成 Experiment Order Draft。验证项目包括表达、小量纯化、BLI、SEC-HPLC 和 DSF。
```

Capability Run Replay：

```text
ExperimentOrderDraft.create · failed · 样本量不足，无法覆盖 3 个候选的 BLI 三重复
```

Agent 解释：

```text
失败原因不是系统异常，而是当前样本需求和验证范围不匹配。我会调整样本量和 replicate 设计后重试。
```

### Turn 10: Agent 调整实验设计

Capability Run Replay：

```text
SampleRequirementEstimator.recalculate · success · 将 BLI 三重复保留，表达和纯化按候选分子独立批次执行
```

Markdown：

```text
我保留 BLI 三重复，因为这是亲和力优化判断的核心证据。表达和纯化采用独立小量批次，避免 AF-02 的潜在表达风险影响其他候选。
```

### Turn 11: Agent 重新生成 Experiment Order Draft

Capability Run Replay：

```text
ExperimentOrderDraft.create · success · 生成 Experiment Order Draft
```

Markdown：

```md
Experiment Order Draft：

- Order ID: `BM-LAB-EGFR-20260528-001`
- Molecules: EGFR-P0, EGFR-AF-01, EGFR-AF-02, EGFR-AF-03
- Assays: expression, small-scale purification, BLI, SEC-HPLC, DSF
- BLI design: 3 repeats, EGFR-ECD antigen, kinetic fit by 1:1 binding model
- Acceptance criteria: KD < 1 nM, monomer > 95%, expression > 35 mg/L
```

Scientific Figure：

```text
egfr-order-workflow.png
```

### Turn 12: Approval Request 批准提交 Experiment Order

Approval Request Replay：

```text
approval.approved · 提交 Experiment Order
审批人：zhengjun
审批时间：2026-05-28 14:24
approvalType: experimentOrder
decision: 确认提交 BM-LAB-EGFR-20260528-001
```

### Turn 13: Agent 提交 Experiment Order

Capability Run Replay：

```text
ExperimentOrder.submit · success · 已提交 Experiment Order 并锁定 CRO 路由
```

Markdown：

```text
订单已提交。接下来进入湿实验执行阶段，预计 7 天返回表达、纯化、BLI、SEC-HPLC 和 DSF 数据。
```

### Turn 14: Elapsed Work Replay 表达实验完成

Elapsed Work Replay：

```text
waiting · ExperimentTask.execution
elapsed: 7 days
status: completed
summary: 表达、小量纯化、BLI、SEC-HPLC、DSF 已完成，结果文件已回传。
```

### Turn 15: Agent 导入实验结果

Capability Run Replay：

```text
ExperimentResultReader.importResults · success · 导入 4 个分子的表达、BLI、SEC-HPLC 和 DSF 结果
```

Scientific Figure：

```text
egfr-bli-sensorgram.png
```

### Turn 16: Agent 分析实验数据

Capability Run Replay：

```text
BioDataAnalyzer.summarizeAssays · success · 汇总亲和力、表达量、纯度和稳定性结果
```

Markdown：

```md
实验结果摘要：

| Molecule | BLI KD | Expression | SEC-HPLC monomer | Tm | Decision |
| --- | ---: | ---: | ---: | ---: | --- |
| EGFR-P0 | 8.4 nM | 42 mg/L | 96.8% | 66.1 C | Baseline |
| EGFR-AF-01 | 0.61 nM | 39 mg/L | 96.2% | 65.4 C | 推荐推进 |
| EGFR-AF-02 | 0.48 nM | 28 mg/L | 91.7% | 63.2 C | 暂缓 |
| EGFR-AF-03 | 0.79 nM | 41 mg/L | 95.9% | 65.7 C | 推荐推进 |

AF-02 的亲和力最好，但表达量和 SEC-HPLC monomer 同时下降，不建议直接进入下一轮开发。
```

Scientific Figure：

```text
egfr-sec-hplc-chromatogram.png
```

### Turn 17: Agent 输出综合结果图和判断

Scientific Figure：

```text
egfr-result-summary-chart.png
```

Markdown：

```md
综合判断：

- EGFR-AF-01 达到 KD < 1 nM，表达量和稳定性损失可接受，是当前最稳妥的推进候选。
- EGFR-AF-03 同样达到目标，且开发风险最低，适合作为下一轮 backup lead。
- EGFR-AF-02 虽然亲和力最好，但表达和纯度风险明显，不建议直接推进。
```

### Turn 18: Agent 写回项目文件

Capability Run Replay：

```text
ProjectFile.save · success · 已写回实验结果摘要、优化报告和下一轮设计计划
```

Artifacts：

```text
EGFR_affinity_optimization_report.md
EGFR_round2_experiment_results.csv
EGFR_next_round_design_plan.md
```

### Turn 19: Agent 给出最终交付

Markdown：

```md
这个闭环已经完成。

最终建议：

1. 推进 `EGFR-AF-01` 作为主候选进入下一轮 developability profiling。
2. 保留 `EGFR-AF-03` 作为 backup lead。
3. 暂缓 `EGFR-AF-02`，除非下一轮专门解决表达量和 SEC-HPLC 纯度问题。

下一步行动：

- 对 EGFR-AF-01 做更完整的 developability panel。
- 对 EGFR-AF-03 做确认性 BLI 和热稳定性复测。
- 基于 AF-01 的 H:Y102F + L:S31Y 组合，生成更保守的第三轮局部优化方案。

已保存到项目文件区：

- `EGFR_affinity_optimization_report.md`
- `EGFR_round2_experiment_results.csv`
- `EGFR_next_round_design_plan.md`
```

## Capability Command 名称清单

本次 mock 回放使用这些产品化 Capability Command 名称。它们只出现在 Capability Run Replay 中，不代表前端真的调用后端接口：

```text
FileReader.extractBaseline
StructureAnalyzer.run
MutationSiteMapper.mapCdrHotspots
AffinityOptimizer.generateCandidates
ExperimentOrderDraft.create
SampleRequirementEstimator.recalculate
ExperimentOrder.submit
ExperimentResultReader.importResults
BioDataAnalyzer.summarizeAssays
ProjectFile.save
```

所有 Capability Run Replay 都是前端 mock，不发起真实请求。

## Imagegen Prompt

每张图都必须是 mock 科学图或数据图，不要生成真实品牌 UI，不要使用真实客户序列。

### egfr-antibody-antigen-complex.png

```text
Scientific report-style molecular visualization of an antibody-antigen complex, EGFR extracellular domain bound by an antibody variable region, highlighted contact interface, clean white background, soft blue antibody, teal antigen, annotated CDR loops, high-resolution biomedical illustration, no brand UI, no real sequence text.
```

### egfr-cdr-mutation-map.png

```text
Scientific diagram showing antibody CDR mutation hotspot map, HCDR3 and LCDR1 highlighted, colored markers for priority design sites and disabled risk sites, clean biomedical report figure, labels large enough to imply regions but not requiring exact readable text.
```

### egfr-pareto-optimization.png

```text
Multi-objective optimization Pareto scatter plot for antibody candidates, axes for predicted affinity and developability risk, highlighted top candidates, professional scientific data visualization, clean grid, muted colors, no brand UI, synthetic data.
```

### egfr-candidate-heatmap.png

```text
Candidate molecule scoring heatmap comparing antibody variants across affinity, stability, expression, aggregation, naturalness, and specificity, scientific report style, blue-green-orange scale, synthetic values, clear but not tiny labels.
```

### egfr-order-workflow.png

```text
Wet lab experiment order workflow diagram for antibody validation, showing candidate molecules flowing through expression, small-scale purification, BLI, SEC-HPLC, DSF, and report delivery, clean lab operations process figure, scientific product demo style.
```

### egfr-bli-sensorgram.png

```text
BLI sensorgram curves comparing parent antibody and three EGFR affinity matured variants, association and dissociation phases, multiple colored curves, scientific assay report style, synthetic data, clean axes.
```

### egfr-sec-hplc-chromatogram.png

```text
SEC-HPLC chromatogram comparing parent antibody and three variants, main monomer peak and small aggregate shoulder peaks, scientific assay report style, synthetic data, clean axes and legend.
```

### egfr-result-summary-chart.png

```text
Composite developability summary chart for antibody variants, grouped bars for expression, purity, thermal stability, and affinity improvement, professional biomedical report visualization, synthetic data, clean layout.
```

## 状态和持久化

- `reset()` 恢复新的 EGFR 高仿真回放 seed。
- 用户在 EGFR 对话继续输入后，追加用户消息和一条简单 Agent 回复。
- 新追加回复不自动生成完整能力运行链路。
- 追加回复的可见文案不能出现 `Thread`，应使用 `当前对话`。
- Capability Run Replay 展开或收起状态不持久化。
- imagegen 资产作为静态资源随源码打包。

## 性能要求

- Capability Run Replay 默认收起，减少首屏复杂度。
- 图片使用 `loading="lazy"` 和 `decoding="async"`。
- 生成图资产接入前要压缩，单张建议控制在 500KB 以内。
- 对话滚动容器保持独立滚动，不影响左侧栏。
- 大块内容使用 CSS containment 或等价手段减少滚动重绘。
- 不一次性渲染真实大图原尺寸，使用 CSS 限定展示宽高。

## 验收标准

- 打开 EGFR 对话后，显示 19 轮完整回放。
- 页面可见文案不出现 `THREAD`、`Thread`、`Main Agent`。
- 标题右侧显示 `Antibody Optimization` 小字。
- Agent 文本不带头像、不带身份标题、不包在大气泡或大卡片里。
- 用户消息右侧气泡显示，第一轮带紧凑 Project File 条。
- Markdown 表格可以正确显示候选摘要和实验结果摘要。
- Capability Run Replay 全部默认收起。
- 点击 Capability Run Replay header 可以展开详情，再次点击可以收起。
- Human Confirmation 直接可见，且出现 1 次。
- Approval Request Replay 直接可见，且出现 1 次，状态为 `approved`。
- Elapsed Work Replay 直接可见，且显示 `elapsed: 7 days` 和 `status: completed`。
- 包含一次 failed Capability Run Replay 和一次 success 重试。
- 8 张 imagegen 科学图全部显示在对应轮次。
- 不再显示旧 BioMap OS 截图式 `visualEvidence`。
- 最终输出包含候选推荐、实验结果摘要、风险解释、下一轮行动计划、写回项目文件清单。
- 首页和其他对话不受影响。
- 用户继续输入后，追加回复不显示 `Thread`，也不弹出创建或删除 toast。
- `reset()` 恢复 seed 数据和 19 轮 EGFR 回放。
- `npm run lint` 通过。
- `npm test -- --run` 通过。
- `npm run build` 通过。
- 使用浏览器验证 `http://localhost:5173/`：能打开 EGFR 对话、滚动、展开 Capability Run Replay、回到新对话首页。
