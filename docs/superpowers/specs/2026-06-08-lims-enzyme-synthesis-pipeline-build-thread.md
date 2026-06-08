# LIMS Enzyme Synthesis Pipeline Build Thread Spec

## Status

This spec defines a new mock Thread under the existing **Pipeline Build** project:

```text
LIMS 酶合成执行编排
```

The Thread explains how the existing **LIMS 酶合成执行 Pipeline v1.0** was created from real wet-lab execution experience. It is a Pipeline Build conversation, not a Pipeline run.

The correct product timeline is:

```text
真实实验跑通，流程确定
  -> 使用 Agent 把经验固化为 Pipeline DAG
  -> 使用该 Pipeline 执行实验流程
```

The last stage already exists as the `LIMS 流程运行` mock Thread. This new Thread is the build-stage predecessor: it shows how the reusable Pipeline was derived, validated, and saved.

User-visible Thread copy must not use words like `demo`, `mock`, `模拟`, or `前传`. Those words are allowed only in specs, tests, and internal code comments.

## Goal

Create a new Pipeline Build Thread that demonstrates a lab owner using Agent-assisted orchestration to convert a previously successful LIMS enzyme synthesis experiment into a reusable Pipeline capability.

The Thread should make this feel true:

1. The experiment has already run successfully in the real lab.
2. The available records are useful but incomplete.
3. The owner provides both files/table records and verbal corrections.
4. The Agent does not pretend to understand everything at once.
5. The Agent asks one focused question per round, gives A/B/C options, recommends one option, and explains why.
6. The Agent generates a first DAG only after the key uncertainty points are confirmed.
7. The user catches one real operational issue in the DAG.
8. The Agent revises the DAG, validates it, and saves it as the same Pipeline already shown in Capabilities:

```text
LIMS 酶合成执行 Pipeline v1.0
```

## Non-Goals

- Do not implement a new Pipeline execution Thread.
- Do not duplicate the existing `LIMS 流程运行` Thread.
- Do not create a separate new Capability if the existing `LIMS 酶合成执行 Pipeline` can be aligned.
- Do not redesign the whole Capabilities page.
- Do not implement real backend persistence, real LIMS integration, or real approval system calls.
- Do not show large raw I/O JSON inside the conversation. Use readable summaries and file cards.
- Do not make the Agent claim it can judge complex experimental correctness alone. Human confirmation remains explicit.

## Resolved Grill Decisions

- Project: `Pipeline Build`.
- New Thread title: `LIMS 酶合成执行编排`.
- Narrative: real experiment experience is being solidified into a reusable Pipeline.
- Starting materials: a partial real-run evidence package plus owner verbal corrections.
- The Agent must separate “已确认事实” and “仍需确认的缺口”.
- Before the first DAG, the Agent confirms six key points:
  1. Flow boundary.
  2. Input package composition.
  3. Approval node abstraction.
  4. Work order and callback modeling.
  5. QC and rollback strategy.
  6. Asset permission defaults.
- Each Agent question uses A/B/C options, with one recommended option and a short concrete reason.
- The first DAG appears after the six key points are confirmed.
- The user then makes one important correction: data integrity QC must wait for ELN callback, instrument readout, and work order status to match.
- The final Thread saves `LIMS 酶合成执行 Pipeline v1.0`.
- Capabilities should stay aligned with the saved Pipeline. Only necessary copy/data alignment should be made.

## Product Positioning

This Thread belongs to Pipeline construction, not experiment operation.

The user is a lab owner or process owner. They have already seen the wet-lab workflow run successfully once. The next task is not to run another batch; it is to turn the successful run into a governed, repeatable LIMS Pipeline.

The Agent’s role is to:

1. Read the partial evidence package.
2. Extract candidate Pipeline nodes.
3. Identify missing assumptions.
4. Ask the owner for decisions.
5. Convert those decisions into a DAG.
6. Validate I/O, approval, permissions, and rollback paths.
7. Save the Pipeline.

The Agent should not be framed as a specialist sub-agent or separate Pipeline Builder persona. It is still the Main Agent operating in the Thread.

## Information Architecture

### Project

Use the existing project:

```ts
id: 'pipeline-build'
name: 'Pipeline Build'
```

### Thread

Add a new Thread:

```ts
id: 'pipeline-lims-enzyme-synthesis-build'
title: 'LIMS 酶合成执行编排'
lastActivity: '刚刚'
archived: false
```

It should appear near the existing `ENZ-P0 实验流程编排` Thread in the `Pipeline Build` project.

### Capability

The Thread’s final saved output must align with the existing Capability entry:

```ts
id: 'pipeline-enzyme-synthesis-lims'
name: 'LIMS 酶合成执行 Pipeline'
version: 'v1.0'
source: 'created'
owner: 'LabOps Automation'
status: 'active'
```

If the current Capability already has the correct DAG, interface, permissions, and recent activity, do not rewrite it. If the Thread says something that conflicts with Capabilities, update only the minimum fields needed for consistency.

## Starting Evidence Package

The first user message should not be a perfect spec. It should feel like an owner handing over partial records after a real run:

```text
上一轮酶合成实验已经跑通了，我想把这个 LIMS 流程固化成可复用 Pipeline。资料不是特别齐，我先把复盘包、部分 LIMS 工单、QC 摘要、审批事件和对象清单给你。你帮我抽出 DAG，不清楚的地方一项项问我。
```

Show these as Project File cards:

| File | Kind | Location | Purpose |
| --- | --- | --- | --- |
| `RUN-ENZ-SYN-20260604_experiment_retro.md` | MD | `Pipeline Build / Project Files / LIMS 复盘资料` | 上一轮真实实验复盘，包含跑通流程、返工原因和人工判断记录。 |
| `LIMS_work_orders_export.csv` | CSV | `Pipeline Build / Project Files / LIMS 复盘资料` | 构建、表达、纯化、检测工单导出，部分字段缺失。 |
| `ELN_callback_records.json` | JSON | `Pipeline Build / Project Files / LIMS 复盘资料` | 实验记录本回调，字段不完全统一。 |
| `QC_gate_summary.xlsx` | XLSX | `Pipeline Build / Project Files / LIMS 复盘资料` | 构建 QC、纯化 QC、数据完整性 QC 摘要。 |
| `approval_events.json` | JSON | `Pipeline Build / Project Files / LIMS 复盘资料` | 启动审批、质检审批、结果释放审批事件。 |
| `asset_object_manifest.json` | JSON | `Pipeline Build / Project Files / LIMS 复盘资料` | 对象存储文件、表记录和结果包清单。 |

The Agent should then run an extraction step and summarize:

```text
我先把资料分成两类：可以直接固化的事实，和需要你确认的缺口。
```

### Facts The Agent Can Extract

Use a concise list:

- 上一轮流程覆盖 48 个候选酶和 4 个对照。
- 实际运行中出现过构建 QC 异常，并且只返工异常样本。
- LIMS 里存在构建、表达、纯化、检测四类工单。
- 审批事件包括 run_start、rework_authorization、result_release。
- 数据入库前至少需要 ELN 回调和结果包 schema 校验。
- 输出包含工单包、执行记录、QC 结论、结构化数据、结果包和效率复盘。

### Gaps The Agent Must Confirm

Use a concise list:

- Pipeline 边界是否包含结果释放和效率复盘。
- 输入包是否同时包含文件、表记录和负责人语言补充。
- 审批节点是否统一为审批人、审批类型、资料包。
- 工单和回调是否拆成独立节点，还是作为节点 I/O。
- QC 不通过时是返工、隔离继续，还是终止。
- 节点负责人和资产权限默认规则。

## Conversation Length And Rhythm

Target length: **22-26 turns**.

Suggested distribution:

- Opening and evidence package: 2-3 turns.
- Six uncertainty confirmations: 10-12 turns.
- DAG v0.1 generation and user correction: 4-5 turns.
- Validation and save: 4-5 turns.

The Thread should not become 50+ turns. This is a build conversation, not a detailed execution replay.

## Agent Question Format

Every clarification question should:

1. State what the Agent knows from the evidence.
2. State what it is worried about misunderstanding.
3. Ask one decision.
4. Provide A/B/C choices.
5. Mark one recommendation.
6. Give a concrete reason for the recommendation.

Example style:

```text
我从资料里能确定，上一轮最终做到了结果包和效率复盘。但我不确定这条 Pipeline 的边界是否要把“效率复盘”也固化进去。

推荐 A：覆盖完整 LIMS 执行闭环，从输入确认到结果释放和效率复盘。
原因是上一轮真实运行已经产生了效率复盘数据，如果不放进 Pipeline，后续负责人还是要手工拼接运行表现。

B：只覆盖湿实验执行，到检测数据回传为止。
C：覆盖到下一轮分子设计建议。

我建议选 A。
```

Avoid stiff template language like:

```text
请确认：
```

Prefer natural phrasing:

```text
这里我需要先确认流程边界。
```

## Required Confirmation Rounds Before DAG

### Round 1: Flow Boundary

Recommended answer: A.

- A: 完整 LIMS 执行闭环：输入确认、启动审批、样本注册、资源锁定、工单派发、构建/表达/纯化/检测、QC gate、数据入库、结果释放、效率复盘。
- B: 只覆盖湿实验执行段。
- C: 覆盖到下一轮分子设计建议。

### Round 2: Input Package

Recommended answer: A.

- A: 输入包由文件、表记录和负责人语言补充共同组成。
- B: 只使用文件。
- C: 只使用结构化表记录。

The owner should clarify that records are not complete, and some boundaries must come from human operational memory.

### Round 3: Approval Node Model

Recommended answer: A.

- A: 统一审批抽象为 `审批人 + 审批类型 + 资料包`，外部审批系统返回 `审批结果 + 结果资料包 + 执行记录`。
- B: 每个审批节点内置 checklist。
- C: 只保留启动审批。

DAG should later include:

- `启动审批`
- `质检审批`
- `结果释放审批`

Each approval node must have pass and fail lines.

### Round 4: Work Orders And Callbacks

Recommended answer: A.

- A: 工单和回调不完全拆开，但每个执行节点 I/O 明确工单记录、设备/人员/ELN 回调和执行记录。
- B: 每个执行节点拆成派单、等待回调、解析回调三个节点。
- C: 只做一个大工单执行节点。

This keeps the DAG readable while preserving real system behavior.

### Round 5: QC And Rollback

Recommended answer: A.

- A: 区分返工和隔离继续。异常样本可返工，其余样本继续。
- B: 所有 QC 不通过都回到上一个节点重跑。
- C: 所有 QC 不通过都终止 Pipeline。

Use `质检审批`, not `返工审批`, as the visible node name.

### Round 6: Permissions And Assets

Recommended answer: A.

- A: 发起人默认 owner；节点负责人默认拥有所需 read 权限；只有特殊限制才在节点 I/O 中声明。
- B: 每条边都显式声明权限。
- C: 所有节点共享同一权限。

This matches the existing assets permission principle and keeps the Pipeline JSON useful without overloading the UI.

## DAG Generation

### First DAG: v0.1

The Agent should generate `v0.1` only after the six confirmation rounds.

The card summary should say:

```text
第一版 DAG 已生成。它已经覆盖输入包、审批、样本注册、资源准备、工单、构建、表达、纯化、检测、数据入库、结果释放和效率复盘。我还会先标出一个我认为需要你看一眼的风险点：数据完整性 QC 当前只依赖 ELN 回调和结果包 schema。
```

Use a `pipelineDag` content block:

```ts
{
  type: 'pipelineDag',
  title: 'LIMS 酶合成执行 Pipeline DAG',
  version: 'v0.1',
  status: 'draft',
  summary: '基于真实运行资料抽取的第一版 LIMS 执行闭环。',
  dag: limsPipelineBuildDagV01,
}
```

### v0.1 Node Set

Use the existing `enzymeSynthesisLimsDag` as the target shape, but it is acceptable for v0.1 to be slightly less complete.

Recommended v0.1 nodes:

1. `运行输入包`
2. `启动审批`
3. `样本注册与条码生成`
4. `资源准备`
5. `工单包生成`
6. `构建执行`
7. `构建 QC`
8. `质检审批`
9. `表达执行`
10. `纯化执行`
11. `纯化 QC`
12. `活性检测`
13. `数据入库`
14. `数据完整性检查`
15. `结果包生成`
16. `结果释放审批`
17. `效率复盘`

### User Correction

After v0.1, the user should make one correction rooted in real lab experience:

```text
这里要改。数据完整性 QC 不能只等 ELN 和结果包 schema。上一轮仪器读数回传慢，差点提前入库。这里必须等 ELN 回调、仪器读数和工单状态三方一致，再进入数据入库。
```

This is the key human-in-loop moment after DAG visualization.

### Final DAG: v1.0 Source

The Agent revises the DAG and shows a validated DAG block:

```ts
{
  type: 'pipelineDag',
  title: 'LIMS 酶合成执行 Pipeline DAG',
  version: 'v1.0',
  status: 'validated',
  summary: '数据完整性 QC 已改为 ELN、仪器读数和工单状态三方一致后才放行。',
  dag: limsPipelineBuildDagV10,
}
```

The saved Pipeline version is also `v1.0`. This is acceptable here because the Thread is constructing the existing Capability’s first governed version.

The final DAG should align with the existing Capabilities DAG. If the implementation reuses `enzymeSynthesisLimsDag`, ensure the `data-integrity-check` node description, inputs, outputs, and prerequisites express the three-way consistency requirement.

## Validation Before Save

Before saving, the Agent should run and display five concise checks:

1. DAG topology: no orphan nodes and no unresolved rollback lines.
2. I/O contract: every node has non-empty output; input sources are traceable.
3. Approval contract: approver, approval type, and package are present for each approval node.
4. Permission contract: initiator owner, node owner default read, special restrictions declared only where needed.
5. Dry run: previous real-run records can traverse the DAG to result release.

Use a `capabilityRun` block such as:

```text
PipelineDagValidator.validateLimsDag · success · 校验拓扑、I/O、审批、权限和真实运行 dry-run
```

## Final Save

The final user confirmation should be a simple save confirmation:

```text
确认保存。按这个版本进入 Pipelines。
```

The Agent should show a `humanConfirmation` block:

- title: `确认保存 Pipeline`
- confirmedBy: `LabOps Owner`
- decision: `保存为 LIMS 酶合成执行 Pipeline v1.0，并允许后续 Thread 调用。`

Then the Agent should show:

```text
已保存到 Pipelines，来源为自建，版本 v1.0。

保存条目：`LIMS 酶合成执行 Pipeline v1.0`
```

Also show file cards:

| File | Kind | Purpose |
| --- | --- | --- |
| `LIMS_Enzyme_Synthesis_Pipeline_v1.0.json` | JSON | 完整 Pipeline DAG、节点 I/O、审批和权限契约。 |
| `LIMS_Pipeline_Build_Decision_Log.md` | MD | 资料来源、用户确认点、DAG 修改理由和校验记录。 |
| `LIMS_Enzyme_Synthesis_Pipeline_v1.0.md` | MD | 可读版 Pipeline 输入、输出、流程和使用边界。 |

## Final Summary Copy

The Agent’s final message must summarize the Pipeline, not the conversation.

### Pipeline Input

Summarize business inputs, not just file names:

- 真实实验复盘资料：上一轮运行中确认的流程、返工边界、人工判断和效率观察。
- LIMS 工单记录：构建、表达、纯化、检测工单及其状态字段。
- ELN 和设备回调：实验记录本回调、仪器读数回调、回调时间和 schema 版本。
- QC 资料：构建 QC、纯化 QC、数据完整性 QC 的阈值、异常类型和通过/不通过路由。
- 审批输入：审批人、审批类型、资料包。
- 表记录输入：样本批次、库存记录、设备窗口、SOP 版本、工单模板。
- 负责人语言补充：资料缺失时由负责人确认的返工范围、隔离策略、结果释放边界和权限默认值。

### Pipeline Output

Summarize concrete outputs:

- 运行输入包和输入摘要执行记录。
- 样本注册记录、条码批次和板图引用。
- 资源锁定记录和 SLA 计划。
- 工单包及构建、表达、纯化、检测执行记录。
- 设备/人员/ELN 回调数据。
- 构建 QC、纯化 QC、数据完整性 QC 结论。
- 质检审批结果、结果释放审批结果和对应资料包。
- 结构化实验数据集和结果包。
- 异常样本清单、返工记录和隔离记录。
- 效率复盘摘要和下一轮流程建议边界。

### Pipeline Flow

Use prose:

```text
这条 Pipeline 先把负责人启动语句、真实复盘资料、LIMS 表记录和补充说明合并成运行输入包；输入包通过启动审批后，进入样本注册、资源准备和工单包生成。随后 Pipeline 派发构建、表达、纯化和检测相关工单，并把设备、人员和 ELN 回调写回节点输出。构建 QC 和纯化 QC 发现异常时，不默认重跑全流程，而是进入质检审批，根据审批结果返工受影响样本或隔离异常样本继续推进。数据入库前必须等待 ELN 回调、仪器读数和工单状态三方一致，并通过数据完整性检查。最后生成结果包，进入结果释放审批，并输出效率复盘。
```

After this textual summary, show the final DAG block again.

## Visual Components

Use only high-value visual blocks:

- `projectFile` cards for initial evidence.
- `capabilityRun` cards for extraction, DAG generation, validation, and saving.
- `pipelineDag` blocks for v0.1 and final v1.0.
- `humanConfirmation` block for save confirmation.
- `projectFile` or file cards for generated JSON/MD outputs.

Do not use execution approval cards, callback cards, or data charts in this Thread. Those belong to the execution Thread and would blur the product story.

## Run Inspector

This Thread can have a lightweight Run Inspector summary, but it should describe Pipeline Builder activity, not wet-lab execution.

Suggested steps:

1. 读取真实运行资料包。
2. 抽取流程事实和缺口。
3. 确认流程边界。
4. 确认输入包。
5. 确认审批模型。
6. 确认工单和回调模型。
7. 确认 QC 与回退策略。
8. 确认权限和资产规则。
9. 生成 DAG v0.1。
10. 修订数据完整性 QC。
11. 校验 DAG 和 I/O 契约。
12. 保存 Pipeline v1.0。

The Run Inspector title can be:

```text
Pipeline 编排
```

## Data And Code Boundaries For Implementation

Expected files to modify or create:

- `src/data/pipelineBuildMockData.ts`
  - Add the new Thread transcript.
  - Add evidence file cards, capability run blocks, DAG blocks, and final save summary.
- `src/data/pipelineBuildDagData.ts`
  - Add or reuse LIMS build DAG variants if the existing DAG cannot be directly reused.
  - Prefer reusing the existing `enzymeSynthesisLimsDag` final shape where possible.
- `src/data/enzymeSynthesisOpsMockData.ts`
  - Only adjust the existing `enzymeSynthesisLimsPipeline` if necessary to align final text, I/O, node names, or data integrity requirement.
- `src/data/mockCapabilities.ts`
  - Ensure the Capability entry still exposes the aligned `LIMS 酶合成执行 Pipeline`.
- `src/store/demoStoreLogic.test.ts`
  - Add seed/state assertions for the new Thread if this file owns mock project seed tests.
- `src/store/useDemoStore.test.ts`
  - Add project/thread visibility assertions if needed.
- `src/data/enzymeSynthesisOpsMockData.test.ts`
  - Add or update tests only if the final Capability DAG is aligned there.

Do not touch unrelated UI polish, workspace side window behavior, or existing execution transcript unless a test requires a minimal consistency change.

## Acceptance Criteria

- `Pipeline Build` contains a new Thread titled `LIMS 酶合成执行编排`.
- The Thread starts from successful real experiment experience and partial evidence, not from a blank design prompt.
- The Thread does not use user-visible `demo`, `mock`, or `模拟` language.
- The Agent separates extracted facts from missing decisions.
- The Agent asks one focused question per clarification round.
- Each clarification round has A/B/C options, one recommendation, and a concrete reason.
- The first DAG appears only after six key confirmations.
- The first DAG is revised based on the user’s data-integrity correction.
- The final DAG says data入库 requires ELN callback, instrument readout, and work order status consistency.
- The final save target is `LIMS 酶合成执行 Pipeline v1.0`.
- The final summary describes Pipeline input, output, and flow, then shows the final DAG.
- Capabilities still show a coherent `LIMS 酶合成执行 Pipeline` matching this saved output.
- Existing `LIMS 流程运行` remains the execution Thread and is not duplicated.

