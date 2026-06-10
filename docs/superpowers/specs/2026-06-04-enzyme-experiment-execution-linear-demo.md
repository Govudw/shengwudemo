# Enzyme Experiment Execution Linear Demo Spec

## Goal

Redesign the `酶库订单与实验执行` Thread into a detailed experiment-operation demo where the Agent and user build and run the wet-lab execution flow step by step.

The current Thread is too compressed. It behaves like a status replay with a large all-in-one order figure. The new Thread should feel like a real Agent OS operating an existing experiment management system: it asks one question at a time, records the user decision, generates one focused module, then moves to the next operational object.

This spec only covers the `enzyme-experiment-execution` Thread and its supporting UI blocks, Run Inspector, and Capability entry updates. It does not change the analysis Thread and does not make scientific candidate-priority conclusions inside this execution Thread.

## Resolved Grill Decisions

- Canonical term: **Experiment Execution Module / 实验执行模块**.
- An Experiment Execution Module is a visual unit in the **Thread Transcript**. It is not a native BioMap OS module, not an **Experiment Operational Record**, and not an **Asset**.
- The Thread should use multiple distinct Experiment Execution Module components, not one generic reusable card.
- The transcript should be long and linear. The target is 55-75 turns, with 6-8 meaningful human-in-loop points.
- Short Agent feedback appears as separate Main Agent turns, not as a new block type.
- Formal approval is reserved for order submission. Other user checkpoints are **Human Confirmations** unless they create or submit a high-impact action.
- The Approval UI should be visually prominent with a yellow/orange treatment.
- Run Inspector and Capabilities must be updated so the system surfaces the same operational sequence in conversation, side panel, and capability description.
- Assets should not be deeply redesigned in this change.

## Core Product Decision

Use **linear Experiment Execution Modules**, not a large multi-element order dashboard.

The existing order illustration contains too many unrelated elements: order summary, workflow, assay table, plate layout, controls, QC, deliverables, approval, and status all compete in one image. That makes the demo look like a static presentation rather than an Agent co-designing and operating a workflow.

The new experience should be:

1. Agent emits short progress feedback.
2. Agent asks one narrow confirmation question with a recommended option and 1-2 alternatives.
3. User confirms or edits.
4. Agent generates one concrete Experiment Execution Module, such as an order boundary, sample scope, plate map, or approval gate.
5. Agent moves to the next module.

The Thread can be long. The target is not a compact 19-turn transcript. A realistic range is **55-75 turns**, with each major module taking 4-6 turns.

## BioMapOSAuto Reference

BioMapOSAuto documentation describes `智能实验` as a LIMS-style system with four domains:

- 需求管理：分子注册、实验订单、实验任务。
- 实验执行：实验调度、CRO 订单、实验记录。
- 库存管理：样本信息、样本库存、物料信息、物料库存、孔板信息、样本-孔板关联。
- 配置中心：设备类型、设备信息、实验点位、实验线路、工作流。

The demo should reference this operational shape but should not force the exact original terminology into every module. The important design principle is that the Agent manages and operates existing system objects:

- It creates and updates an Experiment Order draft.
- It turns an approved order into an Experiment Task.
- It checks sample, material, plate, device, route, and workflow readiness.
- It tracks CRO or internal execution.
- It writes experiment records and operational indexes.
- It receives and validates result packages.

The Agent should not appear to invent a parallel lab-management platform from scratch. It is the orchestration layer over the existing experiment system.

### System Object Mapping

| Experiment Execution Module | Referenced system object shape | BioMapOSAuto domain |
| --- | --- | --- |
| `designHandoffBrief` | Design Package and Project Files | Project / Agent-managed context |
| `experimentOrderSummary` | Experiment Order Draft / Experiment Order | 需求管理 |
| `sampleScopePanel` | molecule/sample records and controls | 需求管理 + 库存管理 |
| `assayPanelTable` | measurement properties and Experiment Recipe assumptions | 需求管理 + 配置中心 |
| `plateMapMini` | plate records and sample-plate linkage | 库存管理 |
| `sampleInventoryLink` | sample inventory and aliquot records | 库存管理 |
| `materialSopReadiness` | material inventory, device info, lab location, route, workflow | 库存管理 + 配置中心 |
| `approvalGateCard` | Approval Request for order submission | 需求管理 |
| `executionTaskStatus` | Experiment Task / CRO Order status | 实验执行 |
| `runLogTable` | experiment records and execution events | 实验执行 |
| `anomalyReviewTable` | experiment process records and anomaly notes | 实验执行 |
| `resultPackageChecklist` | returned files and operational index | 实验记录 + Project Files |

## Scope

In scope:

- Rewrite `enzyme-experiment-execution` transcript into a long linear flow.
- Add several Experiment Execution Module block types with distinct UI.
- Replace the large `enzyme-experiment-order-draft` image as the main order presentation.
- Keep local evidence figures only where useful: plate map, execution status, anomaly log, result ingestion.
- Make the Approval module visually prominent with a yellow/orange treatment.
- Update Run Inspector to match the new Experiment Execution Modules.
- Update the relevant Capability/Pipeline entry so Capabilities do not contradict the Thread.
- Add tests for the new block rendering and seed contract.

Out of scope:

- Do not modify the analysis Thread to include candidate ranking.
- Do not deeply redesign Assets. Assets will eventually show operational records, but this implementation should not commit the full Assets information architecture.
- Do not make real BioMapOS API calls.
- Do not claim automatic experimental control of equipment.
- Do not use BioMap OS original Knowledge Assistant or Data Center as the main knowledge/data layer.

## Thread Narrative

The rewritten Thread should cover a complete experiment execution loop:

1. User asks to move `ENZ-LIB-20260602-048` into wet-lab execution.
2. Agent reads design handoff and emits short feedback.
3. Agent generates a Design Handoff Brief module so the source package and constraints are visible.
4. Agent confirms order boundary.
5. Agent generates an Order Boundary Experiment Execution Module.
6. Agent confirms sample scope and controls.
7. Agent generates a Sample Scope Experiment Execution Module.
8. Agent confirms assay/readout panel.
9. Agent generates an Assay Panel Experiment Execution Module.
10. Agent confirms plate strategy.
11. Agent generates a Plate Map Experiment Execution Module.
12. Agent checks sample inventory and sample-plate linkage.
13. Agent generates a Sample Inventory / Plate Link Experiment Execution Module.
14. Agent confirms material, substrate batch, buffer, SOP, equipment, and route.
15. Agent generates a Material & SOP Readiness Experiment Execution Module.
16. Agent surfaces risk and asks for approval.
17. Agent generates a pending Approval Gate Experiment Execution Module.
18. User approves order submission.
19. Agent generates an approved Approval Gate module, submits the order, and creates `ENZ-EXPTASK-20260602-001`.
20. Agent generates Task Created status module.
21. Agent tracks sample prep.
22. Agent generates Sample Prep status module.
23. Agent tracks assay execution.
24. Agent generates Assay Running / Completed status module.
25. Agent tracks result return.
26. Agent generates Result Returned status module.
27. User gives anomaly handling instruction.
28. Agent generates Anomaly Review module.
29. Agent validates result package schema.
30. Agent generates Result Package module.
31. Agent writes operational record index.
32. User confirms archival boundary.
33. Agent closes the Thread by saying execution artifacts are ready for analysis, without ranking candidates.

## Agent Feedback Rhythm

The Thread should use Codex-like short feedback turns. These are not typewriter text. They are separate short AI messages that help the human operator feel the Agent is working through the system.

Examples:

- `我先读取设计交接包，只确认订单边界，不提交实验。`
- `我找到 3 个必须人工确认的风险点：样本范围、对照策略、异常处理。`
- `板图已生成，但我还没有锁定，因为 ENZ-P0 对照是否每板重复需要你确认。`
- `我正在把订单对象映射到 Experiment Task，不会自动扩展候选库。`
- `结果包已回收；我先做 schema 和追溯校验，不做候选排序。`

Each module should generally follow this rhythm:

1. Short progress feedback.
2. A/B/C confirmation question.
3. User response.
4. Short progress feedback that records the decision.
5. Module block output.
6. Short transition to next question.

Do not add a new `progressFeedback` block type. These should remain ordinary Main Agent markdown turns in the Thread Transcript. Run Inspector can summarize them as progress, but the main interaction should feel conversational rather than like a log viewer.

## Human-In-Loop Points

Use 6-8 human-in-loop points. Each should confirm one operational risk, not a broad bundle.

The transcript can contain more than 8 user responses. Not every user A/B/C response becomes a `humanConfirmation` block. Use visible `humanConfirmation` blocks only for decisions that should be auditable in the demo; keep lower-risk clarifications as ordinary dialogue.

Required gates:

- Order boundary: no automatic expansion beyond `ENZ-LIB-20260602-048`.
- Sample scope: variants, controls, replicates, and sample source.
- Assay panel: activity, kcat/Km proxy, Tm, pH window, expression.
- Plate map and controls: parent control, blank, negative, rollback controls.
- Material/SOP/device readiness: substrate lot, buffer, SOP version, route, device class.
- Submission approval: the only point where the order moves from draft to submitted.
- Anomaly handling: flag and preserve raw readings; no automatic exclusion.
- Result archival: execution Thread ends at records and files, analysis happens later.

Every confirmation question should recommend one option:

- Start with `推荐 A`.
- Include `B：` and optionally `C：`.
- Explain why A is recommended.

### Approval vs Confirmation

Use a formal **Approval Gate** only when the order is submitted from draft/review into execution. That is the point where an **Approval Request** exists.

Represent the formal submission gate with both:

- `approvalGateCard`: the visual Experiment Execution Module showing pending or approved gate state.
- `approvalRequestReplay`: the replay marker showing the approved request decision.

The pending `approvalGateCard` should appear before user approval. After the user approves submission, the Thread should show an approved `approvalGateCard` and an `approvalRequestReplay` record.

Use **Human Confirmation** for the other checkpoints:

- order boundary
- sample scope
- assay panel
- plate map and controls
- material/SOP/device readiness
- anomaly handling
- result archival boundary

These confirmations are still visible and important, but they should not be mislabeled as formal approvals.

## Experiment Execution Modules And Block Types

Add distinct block types instead of using one generic form. This is intentional because the demo should feel like a real experiment system, not a single reusable UI card.

Each block type below is an **Experiment Execution Module**. It can reference BioMap OS Smart Experiment records, Project Files, or Capability Run Replay artifacts, but the module itself is only the visible Thread Transcript representation.

### `designHandoffBrief`

Purpose: show the execution handoff inputs before any order object is created or submitted.

Fields:

- designPackage
- libraryId
- parentEnzyme
- variantRange
- executionConstraints
- forbiddenActions
- sourceFiles

UI:

- Compact handoff summary.
- Explicitly state that the design package is input context, not an Experiment Order.
- Show the no-go boundaries, such as no automatic candidate expansion and no candidate ranking in this Thread.

### `experimentOrderSummary`

Purpose: show the order boundary only.

Fields:

- title
- orderId
- status: `draft | submitted`
- reviewStatus: `not-requested | pending | approved`
- projectId
- libraryId
- parentEnzyme
- purpose
- scopeLock
- owner
- createdAt
- dueAt
- rows: label/value pairs

UI:

- Compact order header.
- Status chip.
- Separate order status from review status; do not use `approved` as the order status.
- Two-column details.
- No workflow, no plate map, no assay table inside this block.

### `sampleScopePanel`

Purpose: show variants, controls, replicates, and sample source.

Fields:

- libraryId
- variantCount
- variantRange
- controls
- replicatePlan
- sampleSource
- exclusions
- lockedBy

UI:

- Small summary metrics.
- Table for controls and replicate rules.
- Clear `Locked` state.

### `assayPanelTable`

Purpose: show readout definitions.

Fields:

- assays: name, purpose, readout, method, replicateCount, qcRule
- panelStatus
- sopReference

UI:

- Table-first layout.
- Keep it smaller than the previous all-in-one image.

### `plateMapMini`

Purpose: show plate layout as a focused Experiment Execution Module.

Fields:

- plateMapId
- plateCount
- dimensions
- wells
- legend
- locked

UI:

- 96-well mini map.
- Legend for candidate groups and controls.
- Stable dimensions so layout does not shift.

### `sampleInventoryLink`

Purpose: show BioMapOS-style sample inventory and sample-plate linkage readiness.

Fields:

- sampleBatchId
- inventoryStatus
- storageCondition
- aliquotPlan
- plateLinkRecord
- missingItems

UI:

- Inventory checklist plus small linkage table.
- Should feel like operating existing inventory records.

### `materialSopReadiness`

Purpose: show materials, substrate lot, buffer, device, SOP, route, and workflow readiness.

Fields:

- substrateLot
- buffer
- sopVersion
- deviceType
- deviceId
- labLocation
- experimentRoute
- workflowTemplate
- readinessChecks

UI:

- Checklist groups: Material, SOP, Device, Route.
- Warnings for unresolved or human-confirmed items.

### `approvalGateCard`

Purpose: make the approval gate prominent and serious.

Fields:

- title
- approvalType
- status: `pending | approved`
- approver
- decidedAt
- checklist
- riskSummary
- decision

UI:

- Yellow/orange visual treatment.
- Strong border and warm background, but not oversized.
- Checklist items with checkboxes or check icons.
- Primary status chip.
- Render one pending card before the user approves submission and one approved card after the user approves it, so the transcript shows the gate state transition clearly.
- If approved, show approver, decision, and timestamp.

### `executionTaskStatus`

Purpose: show state transitions after submission.

Fields:

- taskId
- orderId
- croRef
- stage: `task-created | sample-prep | assay-running | result-returned`
- status
- owner
- startedAt
- completedAt
- records

UI:

- Step/state component, but only for the current execution stage.
- Do not render one giant full-flow diagram.
- Use one module per major status step: `task-created`, `sample-prep`, `assay-running`, and `result-returned`.

### `runLogTable`

Purpose: show execution records from lab or CRO.

Fields:

- logId
- taskId
- rows: time, actor, system, event, recordId, status

UI:

- Dense log table.
- The table should read like an operational audit trail.

### `anomalyReviewTable`

Purpose: show anomaly handling without making automatic conclusions.

Fields:

- anomalyLogId
- policy
- rows: sampleId, well, anomalyType, rawReadingPreserved, autoExcluded, reviewOwner, status

UI:

- Table with risk badges.
- Explicitly show `autoExcluded: false` for preserved raw readings.

### `resultPackageChecklist`

Purpose: show result package receipt, schema validation, and archival target.

Fields:

- packageName
- receivedAt
- files
- schemaChecks
- missingItems
- archiveLocations
- readyForAnalysis

UI:

- File checklist.
- Schema validation status.
- Archive target rows.

## Existing Blocks To Keep

Keep these existing block types:

- `capabilityRunReplay`
- `humanConfirmation`
- `approvalRequestReplay`
- `elapsedWorkReplay`
- `projectFile`
- `scientificFigure`

Use them as supporting evidence, not as the main module UI.

`elapsedWorkReplay` should remain available to indicate that simulated lab execution took time, but it should not replace the more specific `executionTaskStatus` modules.

## Image Strategy

Stop using the current large `enzyme-experiment-order-draft` image in this Thread as the main order presentation. Do not delete the asset file unless it becomes unused across the whole project and a cleanup task explicitly chooses to remove it.

Keep or replace only local evidence images:

- Plate map evidence.
- CRO/task status evidence.
- Anomaly log evidence.
- Result ingestion checklist evidence.

Images should be smaller and attached to the relevant module. They should not duplicate an entire order dashboard.

## Run Inspector

Replace the current 8-step Run Inspector for `enzyme-experiment-execution` with a detailed module-aligned progress list.

Recommended steps:

1. 读取设计交接
2. 确认订单边界
3. 固化样本范围
4. 固化读数面板
5. 生成板图
6. 检查样本库存与孔板关联
7. 检查物料/SOP/设备/线路
8. 订单提交审批
9. 创建 Experiment Task
10. 同步样本准备
11. 同步 assay 执行
12. 回收结果包
13. 记录异常事件
14. 校验结果包 schema
15. 归档操作索引

Outputs should include:

- `BM-LAB-ENZ-20260602-001`
- `ENZ-EXPTASK-20260602-001`
- `CRO-ENZ-20260602-001`
- `ENZ-PLATEMAP-20260602-001.csv`
- `ENZ_Sample_Inventory_Link_Record.csv`
- `ENZ_Material_SOP_Device_Readiness.md`
- `ENZ_execution_anomaly_log.csv`
- `Enzyme_Experiment_Result_Package.xlsx`
- `Enzyme_Curve_Fit_and_QC_Summary.xlsx`
- `Enzyme_Operational_Record_Index.csv`

Run Inspector `approvals` should list both formal Approval Requests and auditable Human Confirmations. The formal Approval Request is the order submission; anomaly handling and archival boundary are Human Confirmations.

## Capability Updates

Update the `pipeline-wetlab-order` entry in `src/data/mockCapabilities.ts`.

The Capability should no longer sound like a five-step lightweight order draft tool. It should become an experiment execution orchestration Pipeline:

- design handoff ingestion
- candidate/library handoff
- order boundary
- sample scope
- assay panel
- plate map
- sample inventory and plate linkage
- material/SOP/device/route readiness
- approval gate
- experiment task creation
- execution tracking
- anomaly handling
- result package validation
- operational record indexing

Do not update Assets deeply in this change.

The user-facing name can remain concise, but the description, steps, DAG nodes, and interface should make clear that this Pipeline manages order-to-result execution, not only draft generation.

## Capability Run Naming

Capability Run Replay entries should read like Agent orchestration over Smart Experiment objects. They do not need to pretend to be exact BioMap OS native API names.

Preferred command naming style:

- `DesignHandoffReader.extractExecutionScope`
- `ExperimentOrderBuilder.composeBoundary`
- `SampleInventoryResolver.checkAvailability`
- `PlateMapGenerator.assignControls`
- `MaterialSopReadinessChecker.validate`
- `LabOrderGateway.submitApprovedOrder`
- `ExperimentTaskTracker.syncStatus`
- `AnomalyLogger.captureExecutionEvents`
- `ResultPackageReceiver.validateSchema`
- `OperationalRecordIndexer.writeTraceability`

Avoid command names that imply autonomous scientific judgment or unrelated original modules:

- `PredictBestEnzyme.*`
- `ProveMechanism.*`
- `AutoSelectLead.*`
- `DataCenter.*`
- `KnowledgeAssistant.*`

## Testing Contract

Add or update tests before implementation.

Store seed tests should assert:

- `enzyme-experiment-execution` still exists under `Industrial Enzyme Design`.
- Thread title remains `酶库订单与实验执行`.
- Transcript has more than the old 19 turns, ideally `>= 55`.
- User turns are more than the old 5, ideally `>= 10`.
- The Thread includes all new Experiment Execution Module block types.
- The Thread does not include the old all-in-one `enzyme-experiment-order-draft` scientific figure.
- `approvalGateCard` appears in both pending and approved states around the order submission turn.
- Final turn explicitly says execution artifacts are ready for analysis and does not rank candidates.
- Run Inspector has at least 14 progress steps.
- Capability run names do not use forbidden autonomous-science claims:
  - `PredictBestEnzyme.*`
  - `ProveMechanism.*`
  - `AutoSelectLead.*`
  - `DataCenter.*`
  - `KnowledgeAssistant.*`

Component tests should assert:

- `designHandoffBrief` renders the source design package and no-go boundaries.
- Each new block renders its title and key fields.
- `approvalGateCard` renders an approval status and checklist.
- `plateMapMini` renders stable well cells and a legend.
- `anomalyReviewTable` shows raw readings are preserved and not auto-excluded.
- `resultPackageChecklist` shows schema status and archive locations.

Capabilities tests should assert:

- The wet-lab order Pipeline describes experiment execution orchestration, not only a lightweight draft.
- It includes sample inventory, material/SOP/device readiness, execution tracking, anomaly handling, and result package validation.

## Implementation Notes

- Keep the implementation local to `conversationTypes.ts`, `ConversationBlocks.tsx`, CSS, `enzymeMockData.ts`, Run Inspector seed data, mock capabilities, and tests.
- Prefer static mock data and deterministic IDs.
- Do not introduce a new runtime dependency.
- Keep block styles dense and operational. Avoid decorative landing-page design.
- Do not put cards inside cards.
- The new block types should remain distinct in `ConversationBlock`, but renderer internals may share small helper components for rows, status chips, and checklists.
- Shared helpers must not collapse the visual design into one generic card.
- Approval module may be visually warmer than the rest of the app, but it should remain compatible with the existing UI.
- Because the existing transcript is long static data, write tests around structure and required content instead of brittle full-string snapshots.

## Acceptance Criteria

- The Thread reads like a real linearly composed experiment execution flow.
- The user can visually see handoff, order, sample, assay, plate, material/SOP, approval, execution, anomaly, and result package modules being built step by step.
- The Agent emits short progress feedback messages between major actions.
- Approval is visually prominent.
- No single image or block tries to show the entire order and workflow.
- The Thread ends before analysis and does not claim candidate priority.
- Run Inspector and Capabilities are consistent with the new flow.
