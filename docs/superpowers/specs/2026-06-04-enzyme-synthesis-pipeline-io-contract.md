# 酶合成实验流程 Pipeline I/O 设计

日期：2026-06-04  
范围：新的 `Enzyme Synthesis Ops` 项目。本文只设计 Pipeline 节点的 input/output 契约，不进入 UI 或代码实现。

## 结论

这条 LIMS Pipeline 可以加入现有 Pipeline 系统，而且应该加入。

原因不是因为它有一张 DAG 图，而是因为它具备 Pipeline 系统最需要展示的三件事：

1. **每个节点有明确输入和输出**：不是“Agent 说自己做了什么”，而是能追溯到对象存储资产、数据表记录、工单记录、设备回调和日志追加。
2. **每个节点的输出可以成为下游节点输入**：例如样本注册节点输出 `sample_registry` 记录和 `barcode_manifest.json`，后续工单、设备回调和结果包都引用这些对象。
3. **Pipeline 能管理真实执行状态**：节点不是静态步骤，而是能创建工单、等待 callback、更新记录、追加执行日志、触发异常分支和生成效率指标。

因此，这个 Demo 适合定义成一个 `pipeline` capability，例如：

```text
LIMS 酶合成执行 Pipeline
```

它在 Capabilities 里展示 DAG、输入输出契约和权限边界；在 Thread 里展示一次真实运行过程；在 Assets / Workspace Side Window 里展示运行过程中产生的对象存储文件和结构化记录。

## Demo 叙事定位

Project Owner 是实验室负责人。

他已经通过编排能力配置好一条标准 LIMS 工作流。新的 Thread 不是让 AI 重新设计实验，而是让 Agent 按这条 Pipeline 运行一个实验批次：

1. 读取 Pipeline 契约。
2. 锁定本轮实验范围。
3. 自动生成工单。
4. 监控库存、设备、人员和实验系统。
5. 等待设备和 LIMS/ELN callback。
6. 处理 QC gate 和异常分支。
7. 把对象存储文件、数据表记录、日志和结果包统一归档。
8. 给负责人输出运行摘要和效率分析。

科学设计能力可以作为负责人背景出现，但这条 Thread 的重点不是分子设计，而是实验流程操作系统。

## 与现有 Demo 系统的结合

### Project

新 Project 命名为：

```text
Enzyme Synthesis Ops
```

中文说明可写作“酶合成实验流程”，但界面中的项目名不要再同时展示第二个名称，避免看起来像说明文案。

Thread 命名为：

```text
LIMS 流程运行
```

### Thread

建议只做这一个主 Thread。

该 Thread 负责展示一次完整运行：从 Pipeline 启动到工单派发、设备回调、数据入库、异常处理、结果包和效率分析。

启动方式不是从 Thread 里跳转到 Capabilities 页面，而是由用户第一句话直接启动 Pipeline 运行。用户会用自然语言指定流程和输入，例如：

```text
使用 LIMS 酶合成执行 Pipeline，输入是实验订单 ORD-ENZ-SYN-20260604-001、样本批次 BATCH-ENZ-SYN-20260604、SOP v3、库存批次 SUB-LOT-0604、设备排期今天可用，工单模板 Work_Order_Templates_ENZ_v3.json。请启动本轮流程。
```

Agent 需要把这句话解析成 Pipeline 启动表单：

1. Pipeline 名称或版本。
2. 实验订单记录。
3. 样本批次记录。
4. 库存批次。
5. 设备排期。
6. SOP。
7. 工单模板。
8. QC 阈值。
9. 交付物。
10. 默认负责人和权限策略。

如果用户第一句话缺少必填输入，Agent 不应直接进入执行，也不应假装补齐。它应返回一个轻量表单，明确哪些字段已识别、哪些字段缺失，并要求用户继续补充。

示例：

```text
我可以启动这条 Pipeline，但还缺一项输入：QC 阈值。已识别的输入包括订单、样本批次、SOP、库存批次、设备排期和工单模板。

请补充：
- QC 阈值：例如 QC_Threshold_Profile_ENZ_v3.json
```

只有当必填输入齐全后，Agent 才进入后续几轮 input 反问和边界确认。

本 Thread 开场应故意只缺 `QC 阈值` 一个字段。这样既能展示 Agent 的启动表单校验能力，又不会让开场变成反复补材料。

用户补充 `QC_Threshold_Profile_ENZ_v3.json` 后，Agent 需要先做一次启动前数据质量检查，再进入 4 轮 input 边界确认。检查重点：

1. QC 阈值文件是否适用于当前 Pipeline 版本。
2. QC 阈值文件是否与 SOP v3 的检测项目一致。
3. QC 阈值文件是否覆盖工单模板里要求的构建 QC、表达状态检查、纯化 QC 和检测 QC flags。
4. 阈值文件是否包含必要字段，例如 `activity_min`、`expression_min`、`purity_min`、`plate_z_factor_min`、`callback_schema_version`。
5. 阈值文件是否存在明显版本冲突或缺失项。
6. 阈值文件是否存在非阻塞 warning，例如阈值比历史默认更严格、会增加返工概率，但不影响启动。

这次检查不要写成长审计报告。Agent 应输出一条简短校验摘要，并以反问确认模式让用户确认：

```text
我已读取 QC_Threshold_Profile_ENZ_v3.json，并和 SOP v3、Work_Order_Templates_ENZ_v3.json 做了一次启动前数据质量检查。

结果：阈值文件版本匹配，覆盖构建、表达、纯化、检测四类 QC；plate z-factor、表达量、纯度和活性阈值都存在。

有一个不阻塞启动的 warning：`purity_min` 是 85%，比历史默认 80% 高 5%。这会让纯化 QC 更严格，后续可能增加返工概率，但能减少低纯度样本进入检测阶段。

另外，这份阈值会把构建条码/板位不一致视为 blocking 异常，后续会进入异常资料包和审批节点。

我建议选 A：按这个阈值文件启动，保留 85% 纯度阈值，并保留 blocking 异常进入审批的规则。这样会稍微提高返工概率，但能减少低质量样本进入后续检测。
B 是把纯度阈值临时降回 80%，但保留 blocking 异常规则。
C 是暂停，换一份 QC 阈值文件。
```

### Capabilities

新增一个 Pipeline capability：

```text
LIMS 酶合成执行 Pipeline
```

它的 `interface.inputs` 不应只写“文件”，而应写成业务输入：

1. 实验订单记录。
2. 样本批次记录。
3. Pipeline 版本。
4. 库存批次和设备排期状态。
5. SOP / 工单模板 / QC 阈值。

它的 `interface.outputs` 也不应只写“结果文件”，而应写成：

1. 工单包和工单记录。
2. 设备 callback 记录。
3. 样本状态更新。
4. LIMS / ELN 标准化数据。
5. 结果包。
6. 效率分析快照。
7. 异常和返工记录。

### Assets / Workspace Side Window

对象存储里展示 durable files，例如：

1. `Pipeline_Run_Contract.json`
2. `Work_Order_Bundle.json`
3. `Barcode_Manifest.json`
4. `Device_Callback_Batch.json`
5. `LIMS_Ingest_Normalized.json`
6. `Result_Package.xlsx`
7. `Run_Efficiency_Report.md`

对象存储第一版按本次 run 归档，不按全局资产类型或 Pipeline 节点编号归档。推荐目录结构：

```text
Enzyme Synthesis Ops/
  Runs/
    RUN-ENZ-SYN-20260604-001/
      inputs/
      approvals/
      work_orders/
      callbacks/
      qc/
      exceptions/
      results/
      analysis/
```

这样文件窗口打开后，用户能先看到“这次流程运行产生了什么”，再展开查看输入、审批、工单、回调、QC、异常、结果和效率分析。结构化表记录仍由 Assets 权限系统管理；文件窗口只展示 durable object assets 和可预览文件。

本次 run 的 mock 文件数量控制在 20-25 个。每个目录放 2-4 个代表文件即可，不把所有底层日志、每个设备读数和每条表记录都展开成文件。建议分布：

1. `inputs/`：Run input package、SOP、QC threshold、pipeline contract。
2. `approvals/`：启动审批、质检审批 rejected、质检审批 approved。
3. `work_orders/`：工单包、关键构建工单、返工工单、检测工单。
4. `callbacks/`：构建 callback、返工 callback、ELN callback、QC summary callback。
5. `qc/`：construction QC、purification QC、assay QC flags。
6. `exceptions/`：construction exception package、rework boundary revision。
7. `results/`：result package、normalized ingest、curve fits。
8. `analysis/`：efficiency report、next-run recommendation。

文件窗口里 MD、JSON 和 PNG 可以预览；XLSX、CSV 等先显示为资产占位，不做内嵌表格预览。

文件窗口默认打开时保持空预览状态：左侧显示“打开文件 / 从右侧文件树选择文件”的空状态，右侧文件树展开到 `Enzyme Synthesis Ops / Runs / RUN-ENZ-SYN-20260604-001`。不要默认打开 `Run_Input_Package_Summary.md` 或 `Result_Package_Summary.md`，避免文件窗口看起来像固定报告页。

结构化数据表记录不一定都显示成文件。它们可以在 Assets 未来的表视图里显示，也可以在文件预览卡中引用。

### Workspace Side Chat

本 Demo 可以轻量展示一次侧边聊天能力，但它不能抢主 Thread 的叙事。建议放在主流程等待构建 callback 或返工 callback 时：

```text
用户在侧边聊天中问：这两个返工样本为什么不直接丢弃？
```

侧边聊天回答本地解释，不改变主流程：

```text
这两个样本不是活性失败，而是条码/板位记录不一致。直接丢弃会让 96 个样本的板图和订单范围不完整，也会影响后续结果包追溯。当前 DAG 选择只返工 017 和 044，并把返工边界写入审批资料包。

这次解释不会暂停主 Thread；构建 callback 和审批等待仍会继续。
```

侧边聊天规则：

1. 只解释局部对象、QC 原因、文件含义或当前状态。
2. 不发起审批、不修改 Run Input Package、不派发工单。
3. 如果用户在侧边聊天里明确要求暂停、撤回或修改范围，需要提示用户回到主 Thread 确认，避免旁路改变运行状态。
4. 主 Thread 的 callback、审批和设备等待仍按原时间线推进。

### Run Inspector

Run Inspector 展示本次运行状态：

1. completed steps / total steps。
2. outputs。
3. pending callback。
4. 审批请求和审批结果。
5. capability calls。
6. 异常分支。
7. 质检摘要回调。

Run Inspector 不是主数据源。主数据源是节点 I/O 指向的对象存储和数据表记录。

质检摘要回调在 Run Inspector 中显示为一个 progress item，例如：

```text
质检摘要回调 · completed · CALLBACK-QC-SUMMARY-20260604-001
```

右侧运行信息只展示状态、回调 ID 和完成情况。详细质检摘要仍在 Thread 中以“质检数据回调卡”展示，避免 Run Inspector 变成质检报告页面。

Run Inspector 的步骤数先采用 12-15 个高层步骤，不和 35-45 轮 Thread 对话一一对应。当前默认建议 15 步，后续可以再调整粒度：

1. 输入表单补齐。
2. Run Input Package 确认。
3. 启动审批。
4. 样本注册。
5. 库存与设备准备。
6. 工单包生成。
7. 构建工单与 callback。
8. 构建 QC 与异常资料包。
9. 质检审批与回退。
10. 返工工单与复查 QC。
11. 表达与纯化执行。
12. 检测与数据分析。
13. 质检摘要回调。
14. 结果包生成。
15. 结果释放审批与效率分析。

右侧每个步骤只显示短标题、状态、摘要和关键输出数量。详细卡片、图表和用户插话只在 Thread 中展示。

Run Inspector 的 step 状态先固定为五种：

1. `pending`：步骤还没有开始，等待上游节点产物或流程推进。
2. `running`：Agent、设备、工单或数据处理正在执行。
3. `waiting`：流程已经发出请求，但正在等待外部结果，例如审批、设备回调、实验记录本 callback 或人工补充资料。
4. `completed`：步骤完成，并且至少写入一条执行记录 output。
5. `blocked`：流程被拒绝、QC 失败、缺少关键资料或权限不足，需要返工、回退或重新发起审批。

`waiting` 和 `blocked` 要分开：`waiting` 表示系统仍在正常等待，不需要用户立即修正；`blocked` 表示当前路径不能继续，必须进入异常分支、返工工单或重新审批。审批 rejected、QC failed、关键 input 缺失都显示为 `blocked`，直到 Agent 完成回退处理并重新推进。

## Pipeline I/O 引用类型

每个节点的 input/output 建议不要只是字符串，而是可表达“引用”的结构。当前前端可以先显示为文字，未来可以升级为结构化对象。

### 1. Object Storage Asset

用于表示对象存储文件。

```text
object_asset: Enzyme Synthesis Ops/Runs/RUN-ENZ-SYN-20260604-001/Work_Order_Bundle.json
```

适合：

1. Pipeline 契约。
2. 工单包。
3. 条码清单。
4. 设备 callback 汇总。
5. 结果包。
6. 分析报告。

### 2. Table Record

用于表示已有结构化数据表中的一条记录。

```text
table_record: inventory_lots.SUB-LOT-202606
table_record: equipment.PR-3107
table_record: experiment_orders.ORD-ENZ-SYN-20260604-001
```

适合节点输入。比如库存检查节点读取库存批次记录，设备排期节点读取设备记录。

### 3. Table Query

用于表示一组符合条件的表记录。

```text
table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001
```

适合样本集合、工单集合、callback 集合、异常集合。

### 4. Record Update

用于表示更新已有记录。

```text
record_update: inventory_lots.SUB-LOT-202606.available_volume_ml -= 12
record_update: sample_registry.SMP-ENZ-001.status = "construction_qc_passed"
record_update: equipment.PR-3107.status = "reserved"
```

适合：

1. 扣减库存。
2. 更新样本状态。
3. 更新设备占用状态。
4. 更新工单状态。
5. 更新订单状态。

### 5. Table Append

用于表示向结构化表追加一条新记录。

```text
table_append: work_order_logs
table_append: device_callback_logs
table_append: pipeline_run_events
table_append: efficiency_metrics
```

适合：

1. 工单执行日志。
2. 设备回调日志。
3. Pipeline 运行事件。
4. 异常复核记录。
5. 效率指标快照。

### 6. Work Order Record

工单本质上是表记录，但在 Demo 中可以单独强调。

```text
work_order: WO-ENZ-SYN-001-DNA
work_order: WO-ENZ-SYN-002-EXP
work_order: WO-ENZ-SYN-003-ASSAY
```

工单输出通常同时包含：

1. `table_append: work_orders`
2. `object_asset: Work_Order_Bundle.json`
3. `table_append: work_order_logs`

### 7. Callback Event

用于表示设备、LIMS、ELN 或人工任务回调。

```text
callback_event: CALLBACK-BIOREACTOR-20260604-008
callback_event: CALLBACK-PLATEREADER-20260604-019
callback_event: CALLBACK-ELN-20260604-022
```

Callback 进入系统后通常转成：

1. `table_append: device_callback_logs`
2. `record_update: work_orders.<id>.status`
3. `object_asset: Device_Callback_Batch.json`

### 8. Approval Request / Approval Result

用于表示所有涉及人类或外部审批系统的节点。

```text
approval_request: APR-ENZ-SYN-20260604-001
approval_result: APR-ENZ-SYN-20260604-001.approved
approval_result_package: Approval_Result_Package_APR-ENZ-SYN-20260604-001.json
```

审批节点在 Pipeline 内部保持极简，不枚举审批子类型，也不理解审批系统内部细节。

Capabilities 主 DAG 中只显式展示 3 类审批节点：

1. `run_start`：启动审批，确认本次 run 可以按锁定范围进入执行。
2. `rework_authorization`：质检审批，确认 QC 异常样本是否允许进入返工分支。
3. `result_release`：结果释放审批，确认结果包可以释放给负责人并进入下一轮决策。

其他潜在审批，例如数据追补、设备延期、资源变更、人工放行，可以保留在节点 JSON、Thread 状态行或外部审批系统记录中；第一版主 DAG 不单独画出来。

审批节点只关心三项输入：

1. 审批人。
2. 审批类型。
3. 资料包。

审批系统返回两类输出：

1. 审批结果。
2. 结果资料包。

DAG 只根据审批结果画两类线：

1. 审批通过。
2. 审批不通过。

审批不通过可以回退到前序节点，例如回到输入包、范围锁定、工单包生成、返工工单生成或数据追补节点。具体回退到哪里由 DAG edge 定义，不由审批节点内部判断。

## 建议的数据表

这些表可以先作为 Demo 里的 mock 数据概念，不要求真实数据库实现。

### `pipeline_registry`

记录已保存的 Pipeline。

关键字段：

1. `pipeline_id`
2. `name`
3. `version`
4. `owner`
5. `status`
6. `dag_asset_path`
7. `input_contract_asset_path`
8. `created_at`
9. `updated_at`

### `pipeline_runs`

记录每次 Pipeline 运行。

关键字段：

1. `run_id`
2. `pipeline_id`
3. `project_id`
4. `thread_id`
5. `experiment_order_id`
6. `status`
7. `started_at`
8. `completed_at`
9. `current_node_id`
10. `pending_callbacks`
11. `exception_count`

### `pipeline_run_input_bindings`

记录一次运行绑定的完整输入集合。

这张表不是给某个单一节点使用，而是给 Assets 权限、Pipeline 追溯和 Thread 展示使用。`Run Input Package` 节点会把管理者提供或确认的输入逐条写入这里。

关键字段：

1. `binding_id`
2. `run_id`
3. `node_id`
4. `input_ref_type`
5. `input_ref`
6. `input_role`
7. `node_owner_user_id`
8. `visibility_policy`
9. `downstream_owner_access_policy`
10. `bound_by`
11. `bound_at`

示例：

```text
input_ref_type = "table_record"
input_ref = "experiment_orders.ORD-ENZ-SYN-20260604-001"
input_role = "experiment_order"
node_owner_user_id = "LAB_OWNER_A"
visibility_policy = "owner_visible"
downstream_owner_access_policy = "selected_node_owners_only"
```

### `pipeline_node_execution_records`

记录每个节点的执行记录。

所有节点都必须至少输出一条执行记录。即使节点没有产生文件、没有更新业务记录，也要写入本表，证明该节点被执行、跳过、等待、失败或回退。

关键字段：

1. `execution_record_id`
2. `run_id`
3. `node_id`
4. `node_type`
5. `node_owner_user_id`
6. `status`
7. `started_at`
8. `ended_at`
9. `duration_ms`
10. `executor`
11. `input_refs`
12. `output_refs`
13. `visibility_policy`
14. `summary`

说明：

1. 这张表是所有节点的最低 output。
2. `summary` 可以保存 Agent 对该节点执行结果的短摘要。
3. 下游节点默认不能读取上游节点的完整执行记录，除非下游节点负责人在 Assets 中拥有对应权限。
4. 负责人可以在 Project / Assets 中查看完整执行记录。
5. 如果 Pipeline 节点没有显式填写负责人，`node_owner_user_id` 默认为本次 run 的发起者。
6. 如果某个 output 没有显式配置对下游节点的访问限制，则下游节点负责人默认拥有 read 权限。
7. 如果某个 output 显式配置了限制，则以 Assets 中该 output 的权限策略为准。

### `experiment_orders`

记录本轮实验订单。

关键字段：

1. `experiment_order_id`
2. `owner`
3. `pipeline_id`
4. `sample_batch_id`
5. `priority`
6. `scope`
7. `status`
8. `expected_due_at`
9. `result_package_asset_path`

### `sample_registry`

记录样本、条码、批次和状态。

关键字段：

1. `sample_id`
2. `run_id`
3. `barcode`
4. `batch_id`
5. `construct_id`
6. `plate_id`
7. `well_position`
8. `current_status`
9. `last_work_order_id`
10. `qc_status`

### `inventory_lots`

记录库存和批次。

关键字段：

1. `lot_id`
2. `material_name`
3. `available_volume_ml`
4. `available_units`
5. `qc_release_status`
6. `expires_at`
7. `storage_location`
8. `reserved_by_run_id`

### `equipment_schedule`

记录设备预约、占用和可用性。

关键字段：

1. `equipment_id`
2. `equipment_type`
3. `status`
4. `reserved_start`
5. `reserved_end`
6. `assigned_run_id`
7. `calibration_status`
8. `last_maintenance_at`

### `work_orders`

记录工单本体。

关键字段：

1. `work_order_id`
2. `run_id`
3. `node_id`
4. `work_order_type`
5. `assignee_type`
6. `assignee_id`
7. `status`
8. `created_at`
9. `started_at`
10. `completed_at`
11. `callback_expected`
12. `callback_id`

### `work_order_logs`

追加式日志表。不要覆盖旧日志。

关键字段：

1. `log_id`
2. `work_order_id`
3. `run_id`
4. `event_type`
5. `actor`
6. `message`
7. `timestamp`
8. `payload_asset_path`

### `device_callback_logs`

记录设备、LIMS、ELN 回调。

关键字段：

1. `callback_id`
2. `run_id`
3. `work_order_id`
4. `source_system`
5. `equipment_id`
6. `callback_type`
7. `received_at`
8. `status`
9. `raw_payload_asset_path`
10. `normalized_payload_asset_path`

### `pipeline_run_events`

记录 Pipeline 运行事件。

关键字段：

1. `event_id`
2. `run_id`
3. `node_id`
4. `event_type`
5. `severity`
6. `summary`
7. `created_at`
8. `related_record_ref`

### `approval_requests`

记录发往外部审批系统的审批请求。

关键字段：

1. `approval_request_id`
2. `run_id`
3. `node_id`
4. `approver`
5. `approval_type`
6. `package_asset_path`
7. `status`
8. `created_at`
9. `external_approval_system`
10. `external_ticket_id`

### `approval_results`

记录外部审批系统返回的审批结果。

关键字段：

1. `approval_result_id`
2. `approval_request_id`
3. `run_id`
4. `node_id`
5. `decision`
6. `result_package_asset_path`
7. `decided_by`
8. `decided_at`
9. `comment`

说明：

1. `decision` 只需要表达 `approved` 或 `rejected`。
2. 结果资料包可以包含外部审批系统生成的审批意见、签名、附件、驳回原因和可追溯 ID。
3. Pipeline 不读取审批系统内部字段，只读取审批结果和结果资料包引用。

### `qc_results`

记录系统自动 QC gate 的检查结果。

QC gate 不是审批节点。它只输出检查结果、阈值依据和异常资料包。如果后续需要人类或外部审批系统介入，DAG 应进入一个独立的审批节点。

Capabilities 主 DAG 里只保留 3 个显式 QC gate：

1. 构建 QC：负责条码、板位、构建 callback 和样本范围一致性；本 Demo 的返工分支从这里触发。
2. 纯化 QC：负责 purity 阈值、低纯度样本标记和是否进入检测的分支判断。
3. 数据完整性检查：负责结果包生成前的读数完整性、表记录一致性和缺口追补。

表达 QC 不作为主 DAG 节点，压缩为表达执行后的状态行和 `Expression_QC_Report.md` output。检测 QC flags 也不单独成节点，作为检测执行的 `Assay_QC_Flags.json` output 和后续数据入库输入。

关键字段：

1. `qc_result_id`
2. `run_id`
3. `node_id`
4. `decision`
5. `basis`
6. `threshold_ref`
7. `report_asset_path`
8. `created_at`

说明：

1. `decision` 可以是 `passed`、`failed`、`needs_approval`。
2. `failed` 不等于自动返工。是否返工由后续审批节点或 DAG 分支决定。
3. 系统 QC 输出可以作为审批节点的资料包输入。

### `efficiency_metrics`

记录效率分析快照。

关键字段：

1. `metric_id`
2. `run_id`
3. `stage`
4. `tat_minutes`
5. `queue_minutes`
6. `failure_count`
7. `rework_count`
8. `bottleneck_reason`
9. `created_at`

## 节点级 I/O 契约

下面按 DAG 顺序设计。每个节点都包含输入、输出和写入语义。

全局输出规则：

1. 所有节点都必须输出 `table_append: pipeline_node_execution_records`。
2. 这个执行记录是最低 output，即使节点没有产生业务文件、没有更新业务表，也必须写入。
3. 节点列表中会重点列业务 output；执行记录作为全局 output 不在每个节点重复展开。
4. 下游节点默认不能读取上游节点的完整执行记录。执行耗时、内部日志、管理者可见摘要等访问权限由 Assets 系统管理。
5. 每个节点都必须有负责人。若节点未显式填写负责人，默认负责人是本次 Pipeline run 的发起者。
6. 下游节点能否读取某个上游 output，实际含义是“下游节点负责人这个 user 是否对该对象资产或表记录有访问权限”。
7. 权限主体是 user，不是 Pipeline node。Pipeline node 只携带 `node_owner_user_id` 并引用 Assets 权限判断结果。
8. 如果 output 没有写对下游节点的权限限制，下游节点负责人默认拥有 read 权限。
9. 如果没有特殊配置，Pipeline 发起人对本次 run 产生的对象资产和结构化记录默认拥有 owner 权限。

### Node 01：Run Input Package 确认

目的：管理者提供或确认本次 Pipeline 运行所需的完整输入集合。这个节点不是简单“点击启动”，而是把本轮运行的订单、样本、库存、设备、SOP、工单模板、QC 阈值、交付物和权限策略绑定到同一个 run。

Inputs：

1. `table_record: pipeline_registry.PIPE-ENZ-SYN-LIMS-v1`
2. `table_record: experiment_orders.ORD-ENZ-SYN-20260604-001`
3. `table_query: sample_registry where batch_id = BATCH-ENZ-SYN-20260604`
4. `table_query: inventory_lots where required_by = ORD-ENZ-SYN-20260604-001`
5. `table_query: equipment_schedule where equipment_type in required_equipment`
6. `table_query: user_roster where role in required_roles`
7. `object_asset: SOP_Enzyme_Synthesis_LIMS_v3.md`
8. `object_asset: Work_Order_Templates.json`
9. `object_asset: QC_Threshold_Profile.json`
10. `table_record: user_profiles.LAB_OWNER_A`

Outputs：

1. `object_asset: Enzyme Synthesis Ops/Runs/RUN-ENZ-SYN-20260604-001/Run_Input_Package.json`
2. `object_asset: Enzyme Synthesis Ops/Runs/RUN-ENZ-SYN-20260604-001/Run_Input_Package_Summary.md`
3. `table_append: pipeline_run_input_bindings`
   - 每个输入引用写一条 binding。
4. `table_append: pipeline_node_execution_records`
   - node_id: `run-input-package`
   - status: `completed`
   - summary: Agent 对输入包的短摘要。
5. `table_append: pipeline_run_events`
   - event_type: `run_input_package_bound`
6. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.status = "input_bound"`
7. `record_update: experiment_orders.ORD-ENZ-SYN-20260604-001.status = "input_bound"`

写入语义：

1. `Run_Input_Package.json` 保存机器可读输入包，包括所有输入引用和权限策略。
2. `Run_Input_Package_Summary.md` 保存语言模型生成的自然语言摘要，给负责人在 Thread 和 Assets 中阅读。
3. `pipeline_run_input_bindings` 逐条保存输入绑定，供权限、追溯和下游节点选择性读取。
4. `pipeline_node_execution_records` 写入该节点执行记录，满足所有节点 output 必不为空。
5. 下游节点不自动获得输入包内全部内容，只能读取被授权的 input refs。

语言模型摘要要求：

1. 摘要必须说明本次运行绑定了哪个 Pipeline 版本。
2. 摘要必须说明实验订单、样本集合、库存批次、设备/人员约束、SOP、工单模板和 QC 阈值。
3. 摘要必须说明哪些输入是对象存储资产，哪些输入是结构化数据表记录或查询。
4. 摘要必须说明哪些内容只对管理者可见，哪些内容允许下游节点读取。
5. 摘要不能声称实验已经开始，只能说明“输入包已确认/绑定”。

Thread 展示示例：

```text
我已形成本轮 Run Input Package。它绑定 PIPE-ENZ-SYN-LIMS-v1、订单 ORD-ENZ-SYN-20260604-001、样本批次 BATCH-ENZ-SYN-20260604、库存批次、设备排期、SOP v3、工单模板和 QC 阈值。

我同时写入了 Run_Input_Package.json、Run_Input_Package_Summary.md，并向 pipeline_run_input_bindings 追加了 18 条输入绑定记录。下游工单节点只能读取被授权的样本、工单模板和设备约束，不能读取管理者可见的完整执行耗时和输入包审计记录。
```

### Node 02：读取已编排 Pipeline

目的：Agent 读取 Pipeline DAG、节点契约、SOP、工单模板和权限边界。

Inputs：

1. `table_record: pipeline_registry.PIPE-ENZ-SYN-LIMS-v1`
2. `object_asset: Run_Input_Package.json`
3. `table_query: pipeline_run_input_bindings where run_id = RUN-ENZ-SYN-20260604-001`
4. `object_asset: Pipeline_DAG_v1.json`
5. `object_asset: Pipeline_Input_Output_Contract.json`
6. `object_asset: Work_Order_Templates.json`

Outputs：

1. `object_asset: Pipeline_Run_Contract.json`
2. `table_append: pipeline_node_execution_records`
   - node_id: `load-pipeline-contract`
   - status: `completed`
3. `table_append: pipeline_run_events`
   - event_type: `pipeline_contract_loaded`
4. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.status = "contract_loaded"`

写入语义：

1. 新增本次运行契约文件。
2. 新增节点执行记录。
3. 新增运行事件。
4. 更新 run 状态。

### Node 03：锁定本轮实验范围

目的：锁定样本、批次、交付物、SLA 和可执行边界。

Inputs：

1. `table_record: experiment_orders.ORD-ENZ-SYN-20260604-001`
2. `table_query: sample_registry where batch_id = BATCH-ENZ-SYN-20260604`
3. `object_asset: Pipeline_Run_Contract.json`

Outputs：

1. `object_asset: Run_Scope_Lock.md`
2. `object_asset: Approval_Package_Run_Start.md`
3. `record_update: experiment_orders.ORD-ENZ-SYN-20260604-001.scope_status = "locked"`
4. `table_append: pipeline_run_events`
   - event_type: `scope_locked`

写入语义：

1. 更新订单范围状态。
2. 输出范围锁定说明。
3. 输出启动审批资料包，供下一个审批节点发送给外部审批系统。
4. 后续节点只引用锁定范围，不重新扩大样本集合。

### Node 04：启动审批节点

目的：把启动请求发送给外部审批系统。审批节点不理解审批细节，只负责把审批人、审批类型和资料包交给审批系统，并接收审批结果和结果资料包。

Inputs：

1. `table_record: user_profiles.LAB_OWNER_A`
   - role: `approver`
2. `approval_type: run_start`
3. `object_asset: Approval_Package_Run_Start.md`

Outputs：

1. `table_append: approval_requests`
   - approval_request_id: `APR-ENZ-SYN-20260604-001`
   - approver: `LAB_OWNER_A`
   - approval_type: `run_start`
   - package_asset_path: `Approval_Package_Run_Start.md`
2. `object_asset: Approval_Request_Package_APR-ENZ-SYN-20260604-001.json`
3. `table_append: pipeline_run_events`
   - event_type: `approval_requested`
4. `callback_event: APPROVAL-CALLBACK-APR-ENZ-SYN-20260604-001`
5. `table_append: approval_results`
   - decision: `approved` or `rejected`
   - result_package_asset_path: `Approval_Result_Package_APR-ENZ-SYN-20260604-001.json`
6. `object_asset: Approval_Result_Package_APR-ENZ-SYN-20260604-001.json`

写入语义：

1. 审批节点只需要三项输入：审批人、审批类型、资料包。
2. 审批节点不关心审批系统内部如何流转。
3. 审批通过的 DAG 线进入 Node 05。
4. 审批不通过的 DAG 线回退到 Node 01 或 Node 03，具体回退点由 edge 定义。
5. 审批结果和结果资料包是该节点的关键 output。

### Node 05：样本注册与条码生成

目的：为本轮样本创建可追溯执行单元。

Inputs：

1. `table_query: sample_registry where batch_id = BATCH-ENZ-SYN-20260604`
2. `object_asset: Run_Scope_Lock.md`
3. `table_record: experiment_orders.ORD-ENZ-SYN-20260604-001`

Outputs：

1. `record_update: sample_registry.<sample_id>.barcode = <generated_barcode>`
2. `record_update: sample_registry.<sample_id>.current_status = "registered"`
3. `object_asset: Barcode_Manifest.json`
4. `object_asset: Sample_Execution_Table.csv`
5. `table_append: pipeline_run_events`
   - event_type: `samples_registered`

写入语义：

1. 更新已有样本记录。
2. 输出条码清单和执行表。
3. 后续工单必须引用 `sample_id + barcode + run_id`。

### Node 06：库存与物料检查

目的：检查试剂、耗材、培养基、底物、纯化柱等是否可用。

Inputs：

1. `table_query: inventory_lots where required_by = ORD-ENZ-SYN-20260604-001`
2. `object_asset: Pipeline_Run_Contract.json`
3. `object_asset: Work_Order_Templates.json`

Outputs：

1. `record_update: inventory_lots.<lot_id>.reserved_by_run_id = RUN-ENZ-SYN-20260604-001`
2. `record_update: inventory_lots.<lot_id>.available_volume_ml -= reserved_amount`
3. `object_asset: Inventory_Readiness_Report.md`
4. `table_append: pipeline_run_events`
   - event_type: `inventory_checked`

异常输出：

1. `work_order: WO-ENZ-SYN-REPLENISH-001`
2. `table_append: work_orders`
   - type: `replenishment_or_lot_replacement`
3. `table_append: work_order_logs`
   - message: `material shortage detected`

写入语义：

1. 正常情况更新库存锁定。
2. 不足时创建补料或替代批次工单。
3. 不能静默通过库存不足。

### Node 07：设备与人员排期

目的：锁定机器人、培养设备、纯化设备、读板仪和技术员窗口。

Inputs：

1. `table_query: equipment_schedule where equipment_type in required_equipment`
2. `table_query: user_roster where role in required_roles`
3. `object_asset: Pipeline_Run_Contract.json`

Outputs：

1. `record_update: equipment_schedule.<equipment_id>.assigned_run_id = RUN-ENZ-SYN-20260604-001`
2. `record_update: equipment_schedule.<equipment_id>.status = "reserved"`
3. `object_asset: Equipment_Reservation_Plan.json`
4. `table_append: pipeline_run_events`
   - event_type: `resources_scheduled`

写入语义：

1. 更新设备排期记录。
2. 不直接执行设备动作，只做预约和资源锁定。

### Node 08：生成执行工单包

目的：把范围、样本、物料、设备、工单模板合成为可执行工单包。

Inputs：

1. `object_asset: Barcode_Manifest.json`
2. `object_asset: Inventory_Readiness_Report.md`
3. `object_asset: Equipment_Reservation_Plan.json`
4. `object_asset: Work_Order_Templates.json`

Outputs：

1. `object_asset: Work_Order_Bundle.json`
2. `table_append: work_orders`
   - `WO-ENZ-SYN-001-DNA`
   - `WO-ENZ-SYN-002-EXP`
   - `WO-ENZ-SYN-003-ASSAY`
3. `table_append: work_order_logs`
   - event_type: `work_order_created`
4. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.current_node_id = "work-order-dispatch"`

写入语义：

1. 创建多条工单记录。
2. 输出一个对象存储工单包。
3. Thread 中展示“Agent 已派发工单”。

### Node 09：工单 01 构建准备

目的：派发 DNA/构建准备任务。

Inputs：

1. `work_order: WO-ENZ-SYN-001-DNA`
2. `object_asset: Barcode_Manifest.json`
3. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`

Outputs：

1. `record_update: work_orders.WO-ENZ-SYN-001-DNA.status = "dispatched"`
2. `table_append: work_order_logs`
   - event_type: `dispatched`
3. `object_asset: DNA_Construct_Work_Order.md`

Callback Inputs：

1. `callback_event: CALLBACK-CONSTRUCT-20260604-001`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `record_update: work_orders.WO-ENZ-SYN-001-DNA.status = "callback_received"`
3. `object_asset: Construct_Callback_Raw.json`
4. `object_asset: Construct_Callback_Normalized.json`

写入语义：

1. 先派工单。
2. 后续等待构建系统 callback。
3. callback 到达后才进入构建 QC。

### Node 10：工单 02 表达准备

目的：派发表达准备任务。

Inputs：

1. `work_order: WO-ENZ-SYN-002-EXP`
2. `table_query: sample_registry where current_status = "registered"`
3. `object_asset: Equipment_Reservation_Plan.json`

Outputs：

1. `record_update: work_orders.WO-ENZ-SYN-002-EXP.status = "dispatched"`
2. `table_append: work_order_logs`
3. `object_asset: Expression_Setup_Work_Order.md`

Callback Inputs：

1. `callback_event: CALLBACK-EXPRESSION-SETUP-20260604-002`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Expression_Setup_Callback_Normalized.json`
3. `record_update: work_orders.WO-ENZ-SYN-002-EXP.status = "setup_ready"`

### Node 11：工单 03 检测准备

目的：派发检测准备任务，包括板图、读数方法和 QC 配置。

Inputs：

1. `work_order: WO-ENZ-SYN-003-ASSAY`
2. `object_asset: Barcode_Manifest.json`
3. `object_asset: Pipeline_Run_Contract.json`
4. `table_record: equipment_schedule.PR-3107`

Outputs：

1. `record_update: work_orders.WO-ENZ-SYN-003-ASSAY.status = "dispatched"`
2. `object_asset: Assay_Setup_Work_Order.md`
3. `object_asset: Plate_Map.json`
4. `table_append: work_order_logs`

Callback Inputs：

1. `callback_event: CALLBACK-ASSAY-SETUP-20260604-003`

Callback Outputs：

1. `object_asset: Assay_Setup_Callback_Normalized.json`
2. `record_update: work_orders.WO-ENZ-SYN-003-ASSAY.status = "assay_ready"`
3. `table_append: device_callback_logs`

### Node 12：构建 QC

目的：检查构建是否通过。

Inputs：

1. `object_asset: Construct_Callback_Normalized.json`
2. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`
3. `object_asset: Pipeline_Run_Contract.json`

Outputs if passed：

1. `table_append: qc_results`
   - decision: `passed`
2. `record_update: sample_registry.<sample_id>.current_status = "construction_qc_passed"`
3. `object_asset: Construction_QC_Report.md`

Outputs if failed：

1. `table_append: qc_results`
   - decision: `failed`
2. `object_asset: Construction_QC_Exception_Package.md`
3. `record_update: sample_registry.<sample_id>.current_status = "construction_qc_failed_pending_approval"`
4. `table_append: pipeline_run_events`
   - event_type: `construction_qc_failed`

写入语义：

1. 通过时更新样本状态。
2. 失败时不直接创建返工工单，而是输出异常资料包并进入审批节点。
3. 审批通过的 DAG 线进入返工工单节点。
4. 审批不通过的 DAG 线回退到构建准备或终止本批次，具体由 edge 定义。
5. 本 Demo 固定在构建 QC 触发一次异常：`ENZ-SYN-0604-017` 和 `ENZ-SYN-0604-044` 存在条码/板位不一致。
6. 这次异常承接 `CALLBACK-CONSTRUCT-20260604-001` 的返回摘要，不是凭空制造失败。
7. 构建 QC 先生成 `Construction_QC_Exception_Package.md`，再进入 `rework_authorization` 审批。
8. 第一次 `rework_authorization` 审批被外部审批系统拒绝，原因是异常样本范围和返工边界标注不够清楚。
9. Agent 按 DAG 回退线修正异常资料包，只补充异常范围、受影响孔位和返工边界，不扩大实验范围。
10. Agent 重新发起同类型审批，第二次审批通过后进入返工工单节点。

### Node 12a：构建返工工单（分支）

目的：在 `rework_authorization` 审批通过后，只针对授权的异常样本创建返工工单。该节点是构建 QC 的异常分支，不改变主线节点编号。

Inputs：

1. `approval_result: APR-ENZ-SYN-REWORK-002.approved`
2. `object_asset: Approval_Result_Package_APR-ENZ-SYN-REWORK-002.json`
3. `object_asset: Construction_QC_Exception_Package.md`
4. `table_query: sample_registry where sample_id in ("ENZ-SYN-0604-017", "ENZ-SYN-0604-044")`
5. `object_asset: Barcode_Manifest.json`

Outputs：

1. `work_order: WO-ENZ-SYN-REWORK-001`
2. `table_append: work_orders`
3. `record_update: work_orders.WO-ENZ-SYN-REWORK-001.status = "dispatched"`
4. `table_append: work_order_logs`
5. `object_asset: Construction_Rework_Work_Order.md`
6. `record_update: sample_registry.ENZ-SYN-0604-017.current_status = "rework_dispatched"`
7. `record_update: sample_registry.ENZ-SYN-0604-044.current_status = "rework_dispatched"`

Callback Inputs：

1. `callback_event: CALLBACK-CONSTRUCT-REWORK-20260604-001`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Construction_Rework_Callback_Normalized.json`
3. `record_update: work_orders.WO-ENZ-SYN-REWORK-001.status = "callback_received"`
4. 返回构建 QC 重新检查这 2 个样本。

写入语义：

1. 返工工单只覆盖审批结果资料包授权的 2 个样本。
2. 不重新创建整批样本工单。
3. assignee 只读取异常样本、孔位、返工说明和必要条码，不读取完整输入包审计记录。
4. 审批意见和返工边界必须写入工单日志，便于后续追溯。

### Node 13：表达与培养执行

目的：执行表达与培养阶段。

Inputs：

1. `table_query: sample_registry where current_status = "construction_qc_passed"`
2. `record_update refs from equipment_schedule`
3. `object_asset: Expression_Setup_Callback_Normalized.json`

Outputs：

1. `record_update: work_orders.WO-ENZ-SYN-002-EXP.status = "running"`
2. `table_append: work_order_logs`
3. `object_asset: Expression_Run_Config.json`

Callback Inputs：

1. `callback_event: CALLBACK-BIOREACTOR-20260604-008`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Expression_Batch_Log_Raw.json`
3. `object_asset: Expression_Batch_Log_Normalized.json`
4. `record_update: work_orders.WO-ENZ-SYN-002-EXP.status = "callback_received"`

### Node 14：表达状态检查（非主 DAG QC）

目的：根据表达数据决定样本是否进入纯化。该检查作为表达执行后的状态检查和 output 保留，不作为 Capabilities 主 DAG 的显式 QC gate。

Inputs：

1. `object_asset: Expression_Batch_Log_Normalized.json`
2. `object_asset: Pipeline_Run_Contract.json`
3. `table_query: sample_registry where current_status = "construction_qc_passed"`

Outputs if passed：

1. `table_append: qc_results`
   - decision: `passed`
2. `record_update: sample_registry.<sample_id>.current_status = "expression_passed"`
3. `object_asset: Expression_QC_Report.md`

Outputs if failed：

1. `table_append: qc_results`
   - decision: `failed`
2. `object_asset: Expression_Exception_Package.md`
3. `record_update: sample_registry.<sample_id>.current_status = "expression_failed_pending_approval"`
4. `table_append: pipeline_run_events`
   - event_type: `expression_exception_detected`

写入语义：

1. 表达通过时写入 `Expression_QC_Report.md`，但主 DAG 不单独画“表达 QC”节点。
2. 表达失败只生成异常资料包和状态更新。
3. 是否重跑、终止或人工放行，可以由节点 JSON 中的潜在审批或外部审批系统处理。
4. 第一版 Thread 不展开表达失败审批分支，避免和构建质检审批重复。

### Node 15：纯化工单

目的：派发纯化任务。

Inputs：

1. `table_query: sample_registry where current_status = "expression_passed"`
2. `table_record: equipment_schedule.PURIFICATION-STATION-01`
3. `object_asset: Expression_QC_Report.md`

Outputs：

1. `work_order: WO-ENZ-SYN-004-PURIFICATION`
2. `table_append: work_orders`
3. `record_update: work_orders.WO-ENZ-SYN-004-PURIFICATION.status = "dispatched"`
4. `object_asset: Purification_Work_Order.md`
5. `table_append: work_order_logs`

Callback Inputs：

1. `callback_event: CALLBACK-PURIFICATION-20260604-014`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Purification_Callback_Raw.json`
3. `object_asset: Purification_Callback_Normalized.json`

### Node 16：纯化 QC

目的：判断收率、纯度和追溯是否达标。

Inputs：

1. `object_asset: Purification_Callback_Normalized.json`
2. `table_query: sample_registry where current_status = "expression_passed"`
3. `object_asset: Pipeline_Run_Contract.json`

Outputs if passed：

1. `table_append: qc_results`
2. `record_update: sample_registry.<sample_id>.current_status = "purification_passed"`
3. `object_asset: Purification_QC_Report.md`

Outputs if failed：

1. `table_append: qc_results`
   - decision: `failed`
2. `object_asset: Purification_Exception_Package.md`
3. `record_update: sample_registry.<sample_id>.current_status = "purification_failed_pending_approval"`
4. `table_append: pipeline_run_events`
   - event_type: `purification_qc_failed`

写入语义：

1. 纯化失败只生成异常资料包。
2. 是否补跑纯化由纯化分支策略、节点 JSON 中的潜在审批或外部审批系统决定。
3. 第一版主 DAG 不额外展开纯化补跑审批节点。
4. 本 Demo 运行中，低纯度样本主要进入 hold / re-purification 建议，不作为主线审批失败分支展示。

### Node 17：酶活与稳定性检测

目的：执行读板、DSF 或其他检测面板。

Inputs：

1. `table_query: sample_registry where current_status = "purification_passed"`
2. `object_asset: Plate_Map.json`
3. `table_record: equipment_schedule.PR-3107`
4. `object_asset: Assay_Setup_Callback_Normalized.json`
5. `object_asset: Purification_QC_Report.md`

Outputs：

1. `record_update: work_orders.WO-ENZ-SYN-003-ASSAY.status = "running"`
2. `table_append: work_order_logs`
3. `object_asset: Assay_Run_Config.json`

Callback Inputs：

1. `callback_event: CALLBACK-PLATEREADER-20260604-019`
2. `callback_event: CALLBACK-DSF-20260604-020`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Assay_Raw_Reads.csv`
3. `object_asset: Assay_Curve_Fits.json`
4. `object_asset: Assay_QC_Flags.json`
5. `record_update: work_orders.WO-ENZ-SYN-003-ASSAY.status = "callback_received"`

### Node 18：数据入库与标准化

目的：把设备回调、ELN 记录、读数和样本状态统一写入 LIMS/ELN ingest。

Inputs：

1. `object_asset: Assay_Raw_Reads.csv`
2. `object_asset: Assay_Curve_Fits.json`
3. `object_asset: Assay_QC_Flags.json`
4. `table_query: device_callback_logs where run_id = RUN-ENZ-SYN-20260604-001`
5. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`

Outputs：

1. `object_asset: LIMS_Ingest_Normalized.json`
2. `object_asset: ELN_Run_Record.md`
3. `record_update: sample_registry.<sample_id>.current_status = "data_ingested"`
4. `table_append: pipeline_run_events`
   - event_type: `data_ingested`
5. `table_append: work_order_logs`
   - event_type: `data_ingest_completed`

写入语义：

1. 原始数据保留在对象存储。
2. 标准化输出形成单独资产。
3. 样本状态更新为已入库。

### Node 19：数据完整性检查

目的：检查样本、板位、回调、读数、QC flag、ELN 记录是否完整一致。

Inputs：

1. `object_asset: LIMS_Ingest_Normalized.json`
2. `object_asset: ELN_Run_Record.md`
3. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`
4. `table_query: device_callback_logs where run_id = RUN-ENZ-SYN-20260604-001`

Outputs if passed：

1. `table_append: qc_results`
   - decision: `data_integrity_passed`
2. `object_asset: Data_Integrity_Report.md`
3. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.status = "ready_for_result_package"`

Outputs if failed：

1. `table_append: qc_results`
   - decision: `data_integrity_failed`
2. `object_asset: Data_Gap_Report.md`
3. `object_asset: Data_Gap_Approval_Package.md`
4. `table_append: pipeline_run_events`
   - event_type: `data_gap_detected`

### Node 20：可选数据追补工单（本次 Thread 不展开）

目的：当数据完整性检查失败时，对缺失、冲突或未回调的数据创建追补任务。该节点是可选分支，第一版 Thread 不展开；主线按数据完整性通过进入结果包生成。

Inputs：

1. `object_asset: Data_Gap_Report.md`
2. `table_query: device_callback_logs where status in ("missing", "conflict")`
3. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`
4. 可选：外部审批系统返回的数据追补授权结果。该授权不在 Capabilities 主 DAG 中显式画审批节点。

Outputs：

1. `work_order: WO-ENZ-SYN-DATA-FOLLOWUP-001`
2. `table_append: work_orders`
3. `record_update: work_orders.WO-ENZ-SYN-DATA-FOLLOWUP-001.status = "dispatched"`
4. `table_append: work_order_logs`
5. `object_asset: Data_Followup_Request.md`

Callback Inputs：

1. `callback_event: CALLBACK-DATA-FOLLOWUP-20260604-022`

Callback Outputs：

1. `table_append: device_callback_logs`
2. `object_asset: Data_Followup_Callback_Normalized.json`
3. `record_update: work_orders.WO-ENZ-SYN-DATA-FOLLOWUP-001.status = "completed"`
4. 返回 Node 18 或 Node 19 重新检查。

### Node 21：结果包生成

目的：生成本轮实验结果包。

Inputs：

1. `object_asset: Data_Integrity_Report.md`
2. `object_asset: LIMS_Ingest_Normalized.json`
3. `object_asset: Assay_Curve_Fits.json`
4. `table_query: sample_registry where run_id = RUN-ENZ-SYN-20260604-001`
5. `table_query: qc_results where run_id = RUN-ENZ-SYN-20260604-001`

Outputs：

1. `object_asset: Result_Package.xlsx`
2. `object_asset: Result_Package_Summary.md`
3. `record_update: experiment_orders.ORD-ENZ-SYN-20260604-001.status = "result_package_ready"`
4. `record_update: experiment_orders.ORD-ENZ-SYN-20260604-001.result_package_asset_path = <path>`
5. `table_append: pipeline_run_events`
   - event_type: `result_package_created`

### Node 22：结果释放审批

目的：把结果包交给外部审批系统确认是否可以释放给负责人和下一轮决策。

Inputs：

1. `table_record: user_profiles.LAB_OWNER_A`
   - role: `approver`
2. `approval_type: result_release`
3. `object_asset: Result_Package.xlsx`
4. `object_asset: Result_Package_Summary.md`
5. `object_asset: QC_Owner_Callback_Summary.md`

Outputs：

1. `table_append: approval_requests`
   - approval_type: `result_release`
   - package_asset_path: `Approval_Package_Result_Release.md`
2. `object_asset: Approval_Package_Result_Release.md`
3. `callback_event: APPROVAL-CALLBACK-RESULT-RELEASE-20260604-001`
4. `table_append: approval_results`
   - decision: `approved`
   - result_package_asset_path: `Approval_Result_Package_Result_Release.json`
5. `object_asset: Approval_Result_Package_Result_Release.json`
6. `record_update: experiment_orders.ORD-ENZ-SYN-20260604-001.result_release_status = "released"`
7. `table_append: pipeline_run_events`
   - event_type: `result_released`

写入语义：

1. `result_release` 是 Capabilities 主 DAG 中显式展示的 3 类审批节点之一。
2. 该节点不展开审批系统内部流转，只读取审批结果和结果资料包。
3. 结果释放通过后，Thread 才进入效率分析和负责人最终摘要。
4. 第一版不演示 result_release 被驳回；审批失败路径可以在 DAG 上保留为回退到结果包生成节点。

### Node 23：效率分析

目的：分析本轮流程的效率、瓶颈和失败模式。

Inputs：

1. `table_query: work_order_logs where run_id = RUN-ENZ-SYN-20260604-001`
2. `table_query: device_callback_logs where run_id = RUN-ENZ-SYN-20260604-001`
3. `table_query: pipeline_run_events where run_id = RUN-ENZ-SYN-20260604-001`
4. `table_query: qc_results where run_id = RUN-ENZ-SYN-20260604-001`
5. `object_asset: Result_Package_Summary.md`
6. `approval_result: result_release.approved`

Outputs：

1. `table_append: efficiency_metrics`
   - stage: `construction`
   - stage: `expression`
   - stage: `purification`
   - stage: `assay`
   - stage: `data_ingest`
2. `object_asset: Run_Efficiency_Report.md`
3. `object_asset: Bottleneck_Timeline.json`
4. `table_append: pipeline_run_events`
   - event_type: `efficiency_analysis_completed`

写入语义：

1. 效率指标是 append，不覆盖历史运行。
2. 后续 Project 可以按多个 runs 聚合效率趋势。

### Node 24：负责人摘要

目的：用自然语言总结本轮运行。

Inputs：

1. `object_asset: Result_Package_Summary.md`
2. `object_asset: Run_Efficiency_Report.md`
3. `object_asset: Approval_Result_Package_Result_Release.json`
4. `table_query: pipeline_run_events where run_id = RUN-ENZ-SYN-20260604-001`
5. `table_query: qc_results where run_id = RUN-ENZ-SYN-20260604-001`

Outputs：

1. `object_asset: Owner_Run_Summary.md`
2. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.status = "completed"`
3. `record_update: pipeline_runs.RUN-ENZ-SYN-20260604-001.completed_at = <timestamp>`
4. `table_append: pipeline_run_events`
   - event_type: `run_completed`

Thread 展示：

1. 本轮实验已完成。
2. 哪些工单按时完成。
3. 哪些 callback 延迟。
4. 哪些 QC gate 触发返工。
5. 结果包位置。
6. 效率瓶颈和下一轮流程优化建议。
7. 下一轮 Pipeline 优化建议只给 3 条短建议，不写长复盘：
   - 条码复核前置到构建工单提交前。
   - 纯化设备 `PUR-04` 提前预约，减少排队等待。
   - 低纯度样本不进入检测阶段，先进入 hold / re-purification 分支。

## Pipeline 页面展示建议

Capabilities 里的 Pipeline 页面是模板/编排视图，不是某次运行实例的日志页。它应该回答：

本 Demo 需要在 Capabilities 中同步提供一条实际 Pipeline 模板：

```text
LIMS 酶合成执行 Pipeline
Pipeline ID: PIPE-ENZ-SYN-LIMS-v1
Project: Enzyme Synthesis Ops
Template type: LIMS execution workflow
```

Capabilities 页面展示这条模板的 DAG、节点 input/output、审批节点和回退线；Thread 展示 `RUN-ENZ-SYN-20260604-001` 这一次运行实例。两者不能混用：模板负责说明“流程怎么被编排”，Thread 负责说明“这次流程实际跑到了哪里、产生了什么资产、遇到了什么异常”。

1. 这个 Pipeline 有哪些节点。
2. 节点之间如何分支、回退和进入审批。
3. 每个节点需要哪些 input。
4. 每个节点会产生哪些 output。
5. 节点背后的 JSON 是否存在、是否完整。

Thread 是运行实例视图。它应该回答：

1. 本次 run 实际绑定了哪些订单、样本、设备、人员和 SOP。
2. 哪些工单已经派发。
3. 哪些 callback 正在等待或已经返回。
4. 哪个 QC gate 失败。
5. 哪个审批被拒绝或通过。
6. 哪个资料包被修正。
7. 本轮运行最终产出了什么结果包和效率分析。

因此，Pipeline 页面只显示节点级摘要和 input/output 名称，不显示完整运行卡片。Run Input Package、审批、工单包、callback、QC、异常资料包、结果包和效率分析这些卡片属于 Thread 运行实例。

Thread 运行过程中不需要主动插入“查看 Capabilities 模板”的跳转入口。正常交互是：用户用第一句话指定流程和输入，Agent 在后台读取对应 Pipeline 模板、校验启动表单、补齐缺失字段，并在 Thread 中推进 run。Capabilities 页面作为模板管理入口存在，但不打断本次运行对话。

在 Capabilities 的 Pipeline 详情页，除了现有 DAG，可以增加一个节点详情区。点击节点时展示：

1. 节点名称。
2. 节点类型：operation / approval / system-qc / callback wait / output。
3. Inputs：只展示 input 名称列表。
4. Outputs：只展示 output 名称列表。
5. 节点背后的 JSON：提供轻量查看入口，不作为主展示重点。

不要在节点详情 UI 里按对象存储、表记录、表查询、record update、日志追加等类型做复杂分组。类型、权限、负责人、record update、table append、callback、审批请求等都放在节点 JSON 里表达。

节点详情里的 input/output 应保持通用：

```text
Inputs
- Run_Input_Package.json
- experiment_orders.ORD-ENZ-SYN-20260604-001
- sample_registry query

Outputs
- Pipeline_Run_Contract.json
- pipeline_node_execution_records append
- pipeline_run_events append
```

底层 JSON 可以包含：

1. `node_owner_user_id`
2. `inputs[].ref_type`
3. `inputs[].ref`
4. `outputs[].ref_type`
5. `outputs[].ref`
6. `outputs[].access_policy`
7. `outputs[].write_mode`
8. `approval_request`
9. `callback_event`
10. `execution_record`

DAG 主图只展示轻量权限标记，不在每条边上展开完整可访问 output。节点详情里只展示 input/output 名称，完整权限策略、可见性、下游访问控制和审计记录由 Assets 系统管理，并在节点 JSON 中保留引用。

节点 JSON 的主要消费者不是人类 UI，而是 LLM / Agent 执行器和对应 skill。LLM 在使用 Pipeline 时由 main agent 自行读取 JSON 并按约束执行。Pipeline 页面只需要表达“背后有完整数据对象结构”，不需要把 JSON 做成复杂的主展示，也不需要默认展示 LLM 对 JSON 的摘要。

第一版 Demo 可以只展示 input/output 名称和一个轻量 JSON 查看入口，不必实现复杂交互。Thread 运行时由对话式 main agent 根据当前上下文自然解释正在做的动作，不专门输出“节点 JSON 摘要”。

### DAG 节点粒度

主 DAG 采用 14 到 18 个业务节点，不把每台机器、每个系统 callback 都展开成主图节点。

视觉复杂度控制规则：

1. 主图只展示业务节点、审批菱形、关键 QC gate 和失败回退线。
2. 每个节点只写短标题和一句副标题，不在节点卡片里塞 input/output 列表。
3. 审批节点统一用菱形或明显审批样式；通过线继续向下，不通过线回退到需要修正的资料包或工单节点。
4. callback、执行日志、设备耗时、权限、负责人、表记录追加等复杂信息只放节点详情或 Thread 运行消息。
5. 不在边上标注完整数据资产，只允许少量短标签，例如 `approved`、`rejected`、`callback ingested`、`QC failed`。

主图应覆盖：

1. Run Input Package。
2. 启动审批 `run_start`。
3. 样本注册。
4. 库存和设备准备。
5. 工单包生成。
6. 构建执行。
7. 构建 QC。
8. 质检审批 `rework_authorization`。
9. 表达执行。
10. 纯化执行。
11. 纯化 QC。
12. 检测执行。
13. 数据入库。
14. 数据完整性检查。
15. 可选数据追补分支。
16. 结果包生成。
17. 结果释放审批 `result_release`。
18. 效率分析。

机器、系统 callback、人员任务、设备耗时、执行日志和详细数据表更新放入节点详情或 Thread 运行消息中，不作为主图节点铺开。这样能保留真实运行感，同时避免 DAG 图变成不可读的设备血缘图。

### 节点负责人展示

主 DAG 不直接显示节点负责人，避免节点卡片过度拥挤。

节点详情中展示：

1. 节点负责人：`node_owner_user_id`。
2. 负责人来源：显式设置 / 继承发起者。
3. 简短 input 名称。
4. 简短 output 名称。
5. 节点 JSON。
6. 默认权限规则：
   - output 未显式限制时，下游节点负责人默认 read。
   - output 显式限制时，按 Assets 权限策略执行。
   - run 发起人默认 owner，除非 Assets 特别覆盖。

## Thread 展示建议

Thread 里 Agent 的表达要像一个真实运行中的操作系统：

1. 先说明读取了哪个 Pipeline。
2. 一次只推进一个主要执行模块。
3. 派发工单时显示工单卡。
4. 等 callback 时显示 callback pending 卡。
5. 收到 callback 后显示 callback ingested 卡。
6. 更新表记录时明确说“我更新了哪些记录”。
7. 追加日志时明确说“我追加了哪张日志表”。
8. 出现异常时不要说“已自动解决”，而是显示返工工单、负责人可见原因和后续路径。
9. 最后输出结果包和效率分析，而不是只说实验完成。
10. 不要在每个节点显式说“我读取了节点 JSON”。Thread 是对话式 Agent 系统，Agent 应只说业务动作和关键约束。

Thread 的执行节奏采用“说明动作 -> 状态推进 -> 对象展示”的模式：

1. 每个大阶段先用一句自然语言说明当前要做什么，以及为什么现在做这一步。
2. 随后连续输出 2-4 条短 tool/status 行，模拟 Agent 正在调用系统、派发工单、等待 callback、更新表记录或写入对象存储。
3. 如果该阶段产生关键运行对象，再展示卡片、MD 表格或小图表。
4. 普通节点不要强行做大段解释；关键节点也不要只贴卡片。Agent 需要用简短文字把人带到下一张卡或下一次回调。

示例节奏：

```text
我先把本轮构建工单派发出去，并订阅 LIMS callback。这里不会释放检测任务，必须等构建 QC 通过。

WorkOrderGateway.create · success · 已创建 WO-ENZ-SYN-001-DNA
CallbackRegistry.subscribe · success · CALLBACK-CONSTRUCT-20260604-001
AssetPermission.apply · success · Tech_A 获得样本清单 read 权限

构建工单卡如下：
```

运行过程中允许用户临时插话，但默认不打断 Pipeline。Agent 的处理规则是：

1. 如果用户只是询问某个 input、批次、样本、设备窗口或当前状态，Agent 直接回答，并补一句当前工单、审批或 callback 不会因此暂停。
2. 如果用户明确说“暂停”“撤回”“修改范围”“不要继续”“重新审批”，Agent 才把相关 Run Inspector step 标记为 `blocked` 或进入回退分支。
3. 用户插话产生的回答不写成节点 output，除非 Agent 真的读取了对象存储、数据表记录或更新了执行日志。
4. 后台审批、callback 和设备等待仍按原时间线继续；Thread 可以在用户问题之后继续接收外部回调。

示例：

```text
你问的是 `SUB-LOT-0604` 的底物批次。我读取到它绑定的是 4-MU substrate，放行状态为 released，库存表显示本轮占用 2.4 mL，剩余 7.6 mL。

这次查询不会暂停当前 run_start 审批；我会继续等待审批系统回调。
```

Thread 中不要给每个 Pipeline 节点都做结构化卡片。卡片只用于关键运行对象，其他过程用简短文字和 tool/status 行表达。

建议做成结构化卡片的对象：

1. Run Input Package：显示本轮绑定的订单、样本范围、SOP、QC 阈值、交付物和默认权限规则。
2. 审批：pending / approved / rejected 三种状态，显示审批人、审批类型、资料包、发起时间、审批时间、审批结果和结果资料包。
3. 样本注册 / 条码清单：显示样本数、板数、条码范围、注册表更新和输出文件。
4. 工单包：显示本轮生成了哪些工单、对应节点、负责人、预计完成时间和 callback 订阅。
5. 单个关键工单：只挑构建、表达、纯化、检测或返工中的关键节点展示，不把所有工单都做大卡。
6. callback：pending / ingested 两种状态，显示等待对象、预估回调时间、实际回调时间、来源系统和绑定记录。
7. QC 结果：显示通过/失败、阈值依据、影响样本、异常等级和下一条 DAG 分支。
8. 异常资料包：显示异常范围、证据、建议处理方式、风险说明和可见权限。
9. 结果包：显示入库表、对象存储文件、交付物清单和释放状态。
10. 效率分析：显示节点耗时、等待时间、返工影响、设备利用率和下一轮优化建议。

每张结构化卡片前都要有一句自然语言承接，例如：

1. `Run Input Package 基线卡如下：`
2. `样本注册和条码清单卡如下：`
3. `本轮工单包卡如下：`
4. `审批结果卡如下：`
5. `callback 回调卡如下：`

卡片不要裸露插入对话流。Agent 需要先用一句话说明为什么现在展示这张卡、它代表哪个运行对象。

### 图表与数据展示组件

Thread 中可以使用小型数据展示组件，但不能为了装饰而随机放图。图表必须服务于当前节点的数据解释，并和 MD 表格互补。

建议封装 3 类 ECharts 小组件：

1. 折线图组件：展示时间序列或过程趋势。
2. 柱状图组件：展示分组对比或阶段对比。
3. 饼图组件：展示组成比例或分类占比。

整个 Demo 至少体现一次：

1. MD 表格数据。
2. 折线图。
3. 柱状图。
4. 饼图。

图表使用建议：

1. 折线图：放在检测阶段，展示活性读数或稳定性随时间/温度变化的趋势。例如 4 个代表性 variant 的 activity trace 或 temperature stability profile。
2. 柱状图：放在检测结果摘要或效率分析里，比较 Top variants 的 activity、purity 或 throughput。柱状图适合展示少量候选之间的差异。
3. 饼图：放在结果包或效率分析里，展示样本状态组成，例如 passed、rework recovered、failed、held for review 的比例。饼图只用于组成比例，不用于趋势或精确比较。
4. MD 表格：放在检测结果摘要里，列出 Top 8 或 Top 10 样本的关键数值，例如 activity、purity、expression、QC status、recommendation。表格负责精确数值，图表负责快速判断。

图表前也需要自然语言承接，例如：

```text
下面先用表格列出 Top variants 的关键读数，再用柱状图看活性差异。
```

图表不要和卡片抢占同一段信息。一个节点里如果已经有大卡片，图表应放在卡片之后，用于解释卡片里的数据结果。

结果包和效率分析阶段最多再使用一个轻量图表。检测阶段已经承担主要数据展示，尾段只用于管理视角补充，例如阶段耗时柱状图或等待时间来源饼图。不要在结尾继续增加新的大表或多图组合。

不建议做成卡片的内容：

1. 每条执行日志。
2. 每次表记录 append。
3. 每个低风险设备状态。
4. 每个中间文件。
5. 每条 DAG 边的权限细节。
6. 库存与设备准备节点的大卡片。

这些内容可以用文字、工具执行行、状态行或文件/Assets 引用表达。这样 Thread 有足够系统感，但不会变成一页密集仪表盘。

库存与设备准备不做结构化大卡。原因是库存和设备已经在 Run Input Package、前置确认和审批 pending 期间的用户追问中出现过；这里再做大卡会增加视觉负担。建议用 2-3 条状态行和一句短摘要表达。

示例：

```text
我继续锁定本轮库存和设备窗口，不额外展示大卡，下面是准备状态：

Inventory.reserveLot · success · SUB-LOT-0604 已锁定 6.2 g，保留返工余量
EquipmentScheduler.reserve · success · LHS-02 / PR-3107 / PUR-04 已占用本轮窗口
UserRoster.assign · success · Tech_A 为默认节点负责人，Tech_B 作为检测窗口备份

库存、设备和人员窗口都已满足本轮执行要求，我会进入工单包生成。
```

工单包生成需要展示结构化卡片。它代表 Agent 从“输入与资源准备”进入“执行派发”。展示前用自然语言承接：

```text
我已根据样本注册表、资源窗口和工单模板生成本轮执行工单包。这里先展示工单包总览，不展开每个工单的全部字段。本轮工单包卡如下：
```

工单包卡内容：

1. 工单包 ID：`WOB-ENZ-SYN-20260604-001`。
2. 关联 Run：`RUN-ENZ-SYN-20260604-001`。
3. 工单总数：建议 `5` 或 `6` 个。
4. 输出对象：`Work_Order_Bundle.json`。
5. 关联样本：`Barcode_Manifest.json`。
6. 负责人和 assignee 概览。
7. 预计完成窗口。
8. callback 订阅列表。
9. 失败或延迟时的 fallback 规则。

建议工单列表：

| Work Order | 阶段 | Assignee | 预计完成 | Callback |
|---|---|---|---|---|
| `WO-ENZ-SYN-001-DNA` | 构建准备 / 条码核对 | `Tech_A` | 2026-06-04 14:30 | `CALLBACK-CONSTRUCT-20260604-001` |
| `WO-ENZ-SYN-002-EXP` | 表达准备 | `Tech_B` | 2026-06-04 18:00 | `CALLBACK-EXPRESSION-SETUP-20260604-002` |
| `WO-ENZ-SYN-003-PUR` | 纯化窗口 | `Tech_C` | 2026-06-05 11:00 | `CALLBACK-PURIFICATION-20260604-014` |
| `WO-ENZ-SYN-004-ASSAY` | 活性 / 稳定性检测 | `Tech_D` | 2026-06-05 17:30 | `CALLBACK-PLATEREADER-20260604-019` |
| `WO-ENZ-SYN-005-ELN` | 实验记录本回收 | `LabOps` | 2026-06-05 18:00 | `CALLBACK-ELN-20260604-022` |

这张卡只展示工单包总览。后续只挑关键工单或异常工单做单卡，不把所有工单都展开成大卡。

工单包之后展示一个关键工单单卡，固定选择 `WO-ENZ-SYN-001-DNA`。它是第一个真正进入执行的工单，后续构建 callback 和构建 QC 都从它开始。

展示前用自然语言承接：

```text
我先展开第一个关键工单，后续 callback 和构建 QC 都会从这个工单进入。本轮构建准备工单卡如下：
```

关键工单单卡内容：

1. Work Order：`WO-ENZ-SYN-001-DNA`。
2. 阶段：构建准备 / 条码核对。
3. 关联 Run：`RUN-ENZ-SYN-20260604-001`。
4. 关联样本：`Barcode_Manifest.json`。
5. Assignee：`Tech_A`。
6. 节点负责人：默认继承 `LAB_OWNER_A`，或按 Run Input Package 中设置。
7. 输入：条码清单、构建 SOP、底物批次、工作台窗口。
8. 输出：`work_orders.WO-ENZ-SYN-001-DNA.status = dispatched`、构建执行日志、构建 callback。
9. 预计完成：`2026-06-04 14:30`。
10. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
11. 下一步：等待 callback 后进入构建 QC。

这张单卡不要展开所有样本，只突出“第一个执行工单已经派发，系统正在等构建回调”。

关键工单派发后，callback 等待采用短等待模式：先 pending 卡，再 2-3 条 Agent 监控状态，最后 ingested 卡。不要让工单一发就秒回，也不要写成长轮询。

展示前用自然语言承接：

```text
构建准备工单已经派发，我会订阅构建系统回调。callback pending 卡如下：
```

callback pending 卡内容：

1. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
2. 等待对象：`WO-ENZ-SYN-001-DNA`。
3. 来源系统：`ConstructStation / LIMS adapter`。
4. 预估回调时间：`2026-06-04 14:30`。
5. 当前状态：`pending`。
6. 绑定记录：`work_orders.WO-ENZ-SYN-001-DNA`、`pending_callbacks`。
7. 超时策略：超过预计时间 20 分钟生成提醒，不自动重派工单。

pending 卡后插入 2-3 条状态更新：

```text
ConstructStation.monitor · running · 已收到工单，正在核对条码清单
ConstructStation.monitor · running · 96 个样本条码已读取，等待板位写回
PipelineRun.waitCallback · pending · 继续等待 CALLBACK-CONSTRUCT-20260604-001
```

收到回调后展示 ingested 卡，承接语：

```text
构建系统已经回调，我已解析并写入回调记录。callback 回调卡如下：
```

callback ingested 卡内容：

1. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
2. 状态：`ingested`。
3. 实际回调时间：`2026-06-04 14:41`。
4. 来源系统：`ConstructStation / LIMS adapter`。
5. 写入表：`device_callback_logs`。
6. 更新工单：`work_orders.WO-ENZ-SYN-001-DNA.status = callback_received`。
7. 返回摘要：96 个样本完成构建准备，2 个样本条码/板位需要复核。
8. 下一步：进入构建 QC。

示例 Agent 语气：

```text
我已读取 PIPE-ENZ-SYN-LIMS-v1 的运行契约。本轮不会重新设计实验，只运行已编排的 LIMS 流程。

现在我会先确认本轮输入包：订单、样本批次、库存批次、设备排期、SOP、工单模板和 QC 阈值。后续只对已授权样本派发工单，不扩大实验范围。
```

## 关键设计原则

### DAG 轻量表达权限，Assets 管完整权限

DAG 图不应该变成完整数据血缘图。

主图只表达：

1. 节点顺序。
2. 审批通过 / 审批不通过。
3. QC 通过 / QC 失败。
4. callback 返回。
5. 返工或回退线。
6. 轻量权限标签。

节点详情表达：

1. input 名称列表。
2. output 名称列表。
3. 节点负责人。
4. 节点 JSON 预览。

节点 JSON 表达：

1. 哪些 input refs 被该节点读取。
2. 哪些 output refs 被该节点生成。
3. 哪些 output 是 `manager_visible`。
4. 哪些 output 是 `downstream_owner_access`。
5. 哪些 output 是 `restricted`。
6. 哪些 output 只能 `append_only`。
7. 哪些 output 需要 `approval_required`。
8. 未显式设置负责人时是否继承 run initiator。

完整权限、可见性、审计、下游访问授权由 Assets 系统管理。Pipeline 只引用这些策略，不在 DAG edge 上复制完整权限规则。

### 权限主体是 user，不是节点

Assets 权限基于 user。

每个 user 可以对以下对象拥有不同权限：

1. 对象存储资产。
2. 某张数据表。
3. 某张数据表中的某条记录。
4. 某张结构化日志表的 append 权限。

因此，Pipeline 中“下个节点是否有某个 output 产物的权限”这句话应解释为：

```text
下个节点负责人这个 user 是否对该 output 引用的对象资产或表记录有权限。
```

每个节点必须有负责人：

1. 显式填写时使用节点自己的 `node_owner_user_id`。
2. 未填写时默认继承本次 run 的发起者。
3. 审批节点的审批人不等于节点负责人。审批人是审批系统输入，节点负责人是 Pipeline 执行和访问权限主体。
4. 工单节点的 assignee 不一定等于节点负责人。assignee 负责执行工单，node owner 负责该节点在 Pipeline 中的访问与审计归属。

默认权限规则：

1. 如果 output 没有写对下游节点的权限限制，下游节点负责人默认拥有 read 权限。
2. 如果 output 写了限制，则下游节点负责人必须通过 Assets 权限判断。
3. 如果没有特殊配置，流程发起人对本次 run 的对象存储资产、数据表记录和执行记录默认拥有 owner 权限。
4. owner 权限可以被 Assets 系统的特殊策略覆盖，但 Pipeline 本身不处理覆盖逻辑。

### 不把文件当成唯一输入

文件只是输入来源之一。

真正的 Pipeline input 应该是：

1. 已锁定的实验订单记录。
2. 已注册的样本记录。
3. 已放行的库存批次记录。
4. 已预约的设备记录。
5. 已版本化的 Pipeline 契约。

### 更新和追加必须区分

更新已有记录：

```text
record_update: sample_registry.SMP-ENZ-001.current_status = "purification_passed"
```

追加日志：

```text
table_append: work_order_logs
```

这两个不能混用。状态表记录可以更新，日志表必须 append。

### Callback 是一等输入

设备和外部系统 callback 不应被当成普通文本消息。

它是节点输入：

```text
callback_event: CALLBACK-PLATEREADER-20260604-019
```

也是后续标准化数据、日志和状态更新的触发源。

质检数据也可以通过负责人可见 callback 回传到 Thread。这个 callback 不是审批，也不是用户手动确认；它是 QC 子系统把阶段性质检摘要推回给本轮负责人和 Run Inspector。

示例：

```text
callback_event: CALLBACK-QC-SUMMARY-20260604-001
```

质检回调应包含：

1. `run_id`
2. `qc_stage`
3. `summary_status`
4. `passed_count`
5. `failed_count`
6. `warning_count`
7. `affected_samples`
8. `report_asset_path`
9. `owner_visible = true`

Thread 中展示时可以叫“质检数据回调”或“QC Summary Callback”。它只做负责人可见摘要，不代替 `qc_results` 表，也不改变审批节点的输入输出。

### Object Storage 负责可追溯文件

对象存储保存 durable files：

1. 原始回调 payload。
2. 标准化 payload。
3. 工单包。
4. 报告。
5. 结果包。

结构化表保存状态和关系：

1. 谁执行。
2. 当前状态。
3. 哪条记录被更新。
4. 哪个工单等待 callback。
5. 哪个 gate 触发返工。

### Agent 不是万能判断器

Agent 可以：

1. 检查阈值。
2. 派发工单。
3. 等待 callback。
4. 追加日志。
5. 生成效率分析。
6. 标记异常。

Agent 不应：

1. 静默扩大实验范围。
2. 静默跳过负责人 gate。
3. 静默删除异常数据。
4. 把 QC 失败样本直接当成成功样本。
5. 用一句话掩盖复杂 pipeline 执行。

## Thread 规模

本 Demo 选择完整对话规模，不采用最小压缩版。

建议 Thread 包含 35-45 轮对话，尽可能完整展示：

1. 用户第一句话指定 Pipeline 和输入。
2. Agent 解析启动表单。
3. 如输入缺失，Agent 返回缺失字段表单并等待补充。
4. Run Input Package 边界确认。
5. 启动审批。
6. 审批 pending 期间用户插入一个 input 细节追问。
7. 审批结果回调。
8. Run Input Package 基线卡。
9. 样本注册。
10. 库存与设备准备。
11. 工单包生成。
12. 多个工单派发。
13. callback pending。
14. callback ingested。
15. 构建 QC。
16. QC 失败异常资料包。
17. 质检审批 `rework_authorization`。
18. 审批不通过后的 DAG 回退、资料包修正和重新审批通过。
19. 返工工单。
20. 表达执行。
21. 纯化执行。
22. 检测执行。
23. 数据入库。
24. 数据完整性检查。
25. 质检摘要 callback。
26. 结果包生成。
27. 结果释放审批。
28. 效率分析。
29. 负责人最终摘要。
30. 一次轻量侧边聊天解释，不改变主流程。

这个 Thread 的目标不是短平快，而是让 Demo 看起来像一个真正的实验流程操作系统。35-45 轮的长度来自流程本身：补 input、确认边界、审批、工单、callback、QC、返工、结果释放和复盘都需要被看见；不要为了堆轮次加入无意义闲聊。

结构化卡片的出现节奏跟关键运行对象走，不跟每个 Pipeline 节点走。Run Input Package、审批、工单包、关键工单、callback、QC、异常资料包、结果包和效率分析需要卡片；普通执行日志、低风险中间状态和表记录追加用文字或状态行表达。

Thread 中应展示一次“审批不通过 -> DAG 回退 -> Agent 修正资料包 -> 重新审批通过”的分支。建议放在构建 QC 后的质检审批，不放在启动审批。

推荐节奏：

1. 构建 QC 发现一组样本条码/板位记录不一致，Agent 生成 `Construction_QC_Exception_Package.md`。
2. Agent 自动发起 `rework_authorization` 审批，资料包包含异常样本、影响范围、建议返工路径和不返工风险。
3. 外部审批系统返回 `rejected`，结果资料包说明：异常样本范围不够清楚，返工工单边界需要重新标注。
4. DAG 按回退线回到构建 QC 异常资料包整理节点，Agent 只修正资料包和返工边界，不扩大实验范围。
5. Agent 重新发起同类型审批。
6. 外部审批系统返回 `approved`，DAG 进入返工工单节点。

这条分支只出现一次。它的作用是证明系统支持审批失败、资料包修正和 DAG 回退，不要把整条 Thread 写成事故复盘。

## Human-in-loop 分布

人类负责人主要参与前置输入确认和启动审批确认，不在后续每个审批节点里频繁插话。

前置阶段分成两步：先补齐启动表单，再做 input 边界确认。

启动表单补齐规则：

1. 用户第一句话可以直接启动 Pipeline，例如“使用某流程，输入是某订单、某批次、某 SOP……”。
2. Agent 先解析出已填写字段和缺失字段。
3. 如果缺少必填输入，Agent 返回一个轻量表单，要求用户继续填写。
4. 用户补齐后，Agent 再次确认字段已齐，不直接跳过确认。
5. 只缺一个字段时，也要明确指出缺的字段，并等待用户补充或确认默认值来源。

本 Thread 只演示一次启动表单补齐，缺失字段固定为 `QC 阈值`。用户补充 `QC_Threshold_Profile_ENZ_v3.json` 后，Agent 先做启动前数据质量检查，并用推荐 A / 备选 B/C 的反问确认模式让用户确认阈值处理方式。确认后，Agent 才进入 4 轮 input 边界确认。

启动前数据质量检查不要求用户阅读长报告。Agent 只展示：

1. 检查了哪些对象：QC 阈值、SOP、工单模板、Pipeline 版本。
2. 发现的主要结论。
3. 哪个规则会影响后续 DAG 分支。
4. Agent 的推荐处理方式。
5. 1-2 个备选处理方式。

本 Thread 的数据质量检查应包含一个非阻塞 warning：`purity_min` 为 85%，比历史默认 80% 高 5%。Agent 推荐保留 85%，并提醒这可能增加纯化返工概率，但能减少低质量样本进入检测阶段。这个 warning 必须进入反问确认，不由 Agent 静默处理。

启动表单齐全后，前置输入确认建议约 4 轮：

1. 确认本轮 Pipeline 版本、实验订单和样本批次。
2. 确认库存批次、设备排期和人员约束。
3. 确认 SOP、工单模板、QC 阈值和交付物。
4. 确认 Run Input Package 写入，并允许 Agent 发起启动审批。

这 4 轮固定保留 A/B/C 反问确认模式，不改成用户连续说 `OK`。Agent 每轮只确认一个核心点，给出一个推荐方案，并补 1-2 个备选项，像 `grill me` 一样帮助负责人快速判断，但不要把选项写成生硬表单。

启动前数据质量检查的 A/B/C 是“阈值处理方式确认”。后续 4 轮 input 确认是“运行边界确认”。两者不要合并，否则用户会看不清自己到底是在确认阈值，还是在确认本轮运行范围。

建议写法：

1. 先用自然语言说明 Agent 已经读取或绑定了哪些资料。
2. 再说明本轮只需要负责人确认哪个边界。
3. 给出推荐 A 和简短原因。
4. 给出 B/C 备选，但保持克制，避免看起来像问卷。

示例节奏：

1. `我已经把 Pipeline v3.2、订单 BM-LAB-ENZ-20260604-001 和样本批次 ENZ-BATCH-0604 绑定到本轮运行。这里先确认实验范围。我建议选 A：按订单内 96 个样本执行，不自动扩大到备用样本；这样后续工单、审批和结果包都能保持同一边界。B 是把备用样本也纳入；C 是暂停，等你补充样本清单。`
2. `库存和设备我先按当前 Assets 里的可用记录处理。建议 A：使用 SUB-LOT-0604、液体处理站 LHS-02、读板仪 PR-3107，并把 Tech_A 设为默认节点负责人；这样下游节点默认继承 read 权限。B 是仅锁定库存，不锁定设备；C 是等排班表更新后再启动。`
3. `SOP、工单模板和 QC 阈值这里我需要再确认一次。建议 A：使用 SOP v3.1、构建/表达/纯化/检测四类工单模板，QC 失败进入异常资料包和审批节点；这样不会让 Agent 直接判断返工。B 是 QC 失败直接停止；C 是放宽阈值但需要你补充依据。`
4. `如果这些都没问题，我会写入 Run Input Package，并发起 run_start 审批。建议 A：写入并发起审批；审批通过后我会按 DAG 自动派发后续工单。B 是只写入不审批；C 是回到前面修改范围。`

用户回复节奏：

1. 启动前数据质量检查：用户回复 `A`。
2. input 确认第 1 轮：用户回复 `A`。
3. input 确认第 2 轮：用户回复 `A`。
4. input 确认第 3 轮：用户回复 `A`。
5. input 确认第 4 轮：用户回复 `确认，发起审批`。

前几轮用简短 `A` 保持节奏，最后一轮用自然语言明确授权 Agent 写入 Run Input Package 并发起 `run_start` 审批。

启动审批确认：

1. 人类负责人确认 Agent 可以发起 `run_start` 审批。
2. Agent 随后创建审批请求并等待外部审批系统回调。
3. 审批结果不是人类在 Thread 里手动回复，而是审批系统回调进入 Thread。

启动审批在 Thread 中展示两张审批卡：

1. `pending` 审批卡：Agent 已发起 `run_start` 审批，等待外部审批系统回调。
2. `approved` 审批卡：外部审批系统返回通过，DAG 可以进入样本注册和工单生成。

`pending` 卡内容：

1. 状态：`PENDING`。
2. 审批类型：`run_start`。
3. 审批人：`LAB_OWNER_A` 或对应负责人。
4. 发起人：`ProteinDesign Agent`。
5. 发起时间。
6. 资料包：`Approval_Package_Run_Start.md`。
7. 当前动作：只发起审批，不创建实验任务。
8. 等待项：外部审批系统结果回调。

`pending` 卡不要写审批建议。用户回复“确认，发起审批”只是允许 Agent 发起 pending 流程，不代表审批已经通过。

审批 pending 期间可以模拟用户继续对话一次，证明对话不阻塞外部回调和 Pipeline/PPL 执行状态。建议插在 `pending` 卡之后、`approved` 回调之前。

这次插话只做信息查询，不进入审批节点，也不改变审批资料包。Agent 回答后需要明确说明：当前 `run_start` 审批仍在等待外部回调，Pipeline 没有暂停。

示例：

```text
用户：刚才库存批次 SUB-LOT-0604 里面的底物批次是什么情况？

AI：我查了一下本轮输入包里绑定的库存记录。这个问题不会打断 run_start 审批，审批回调还在等待。

摘要：
- 底物批次：SUB-LOT-0604
- 可用量：18.4 g
- 本轮预计占用：6.2 g
- CoA 状态：已上传
- 放行状态：released
- 关联 SOP：SOP v3 / substrate section 2.1

结论：这批底物足够覆盖本轮 96 个样本和返工预留，不需要更换库存批次。
```

这类插话只做短文本分析和列表摘要，不改变 Run Input Package，不触发新的审批，也不重排 DAG。Agent 可以说明“我继续等待审批回调”，让用户感到对话和异步流程是并行的。

`approved` 卡内容：

1. 状态：`APPROVED`。
2. 审批类型：`run_start`。
3. 审批人。
4. 发起时间。
5. 审批通过时间。
6. 审批结果：允许本轮 Pipeline 进入执行。
7. 结果资料包：`Approval_Result_Package_APR-ENZ-SYN-20260604-001.json`。
8. 审批意见短句：例如“输入包完整，样本范围、QC 阈值和权限边界清楚，可启动本轮实验执行。”

Thread 中应先显示 pending 卡，再用一条外部回调状态行说明审批系统返回结果，最后显示 approved 卡。不要把 pending 和 approved 合并成一张卡。

启动审批通过后，Agent 应立即展示 Run Input Package 卡，作为本轮正式运行基线，然后再进入样本注册。它不是审批资料包，而是本次 run 后续工单、权限、callback、QC 和结果包共同引用的基线对象。

Run Input Package 卡内容：

1. Run ID：`RUN-ENZ-SYN-20260604-001`。
2. Pipeline：`PIPE-ENZ-SYN-LIMS-v1`。
3. 实验订单：`ORD-ENZ-SYN-20260604-001`。
4. 样本范围：`BATCH-ENZ-SYN-20260604 / 96 samples`。
5. SOP：`SOP_Enzyme_Synthesis_LIMS_v3.md`。
6. 工单模板：`Work_Order_Templates_ENZ_v3.json`。
7. QC 阈值：`QC_Threshold_Profile_ENZ_v3.json`，含 `purity_min = 85%` warning 已确认。
8. 库存与设备：`SUB-LOT-0604`、`LHS-02`、`PR-3107` 等。
9. 默认节点负责人和权限规则。
10. 输出对象：`Run_Input_Package.json`、`Run_Input_Package_Summary.md`、`pipeline_run_input_bindings`。

卡片下方可以接一句：`后续节点只读取被授权的 input refs；完整输入包和执行审计记录由发起人保留 owner 权限。`

随后 Agent 进入样本注册。展示卡片前先用文字承接：

```text
我已经把本轮样本注册为可执行单元，并生成条码清单。样本注册和条码清单卡如下：
```

样本注册 / 条码清单卡内容：

1. 注册批次：`BATCH-ENZ-SYN-20260604`。
2. 样本数：`96`。
3. 板数：`1 x 96-well plate`，如需返工预留可显示 `reserved wells`。
4. 条码范围：`ENZ-SYN-0604-001` 到 `ENZ-SYN-0604-096`。
5. 注册表更新：`sample_registry` append/update。
6. 样本状态：`registered`。
7. 输出文件：`Barcode_Manifest.json`、`Sample_Execution_Table.csv`。
8. 下游引用：构建、表达、纯化、检测工单均引用该条码清单。
9. 权限说明：工单节点可读取条码和样本状态，不读取完整输入包审计记录。

这张卡只做汇总，不展开每个样本或每个孔位的完整表格。

样本注册后进入库存与设备准备。这里不展示大卡，只用文字和状态行承接：

```text
我继续锁定库存、设备和人员窗口。这里不展开卡片，只列出本轮准备状态：

Inventory.reserveLot · success · SUB-LOT-0604 已锁定 6.2 g，保留返工余量
EquipmentScheduler.reserve · success · LHS-02 / PR-3107 / PUR-04 已占用本轮窗口
UserRoster.assign · success · Tech_A 为默认节点负责人，Tech_B 作为检测窗口备份

库存、设备和人员窗口都已满足本轮执行要求，我会进入工单包生成。
```

随后 Agent 生成工单包，并展示工单包总览卡：

```text
我已根据样本注册表、资源窗口和工单模板生成本轮执行工单包。这里先展示工单包总览，不展开每个工单的全部字段。本轮工单包卡如下：
```

工单包卡内容：

1. 工单包 ID：`WOB-ENZ-SYN-20260604-001`。
2. 关联 Run：`RUN-ENZ-SYN-20260604-001`。
3. 工单总数：`5`。
4. 输出对象：`Work_Order_Bundle.json`。
5. 关联样本：`Barcode_Manifest.json`。
6. 工单列表：构建准备、表达准备、纯化窗口、检测执行、实验记录本回收。
7. 负责人和 assignee 概览。
8. 预计完成窗口。
9. callback 订阅列表。
10. 失败或延迟时的 fallback 规则。

随后 Agent 展示第一个关键工单单卡：

```text
我先展开第一个关键工单，后续 callback 和构建 QC 都会从这个工单进入。本轮构建准备工单卡如下：
```

关键工单单卡内容：

1. Work Order：`WO-ENZ-SYN-001-DNA`。
2. 阶段：构建准备 / 条码核对。
3. Assignee：`Tech_A`。
4. 关联样本：`Barcode_Manifest.json`。
5. 输入：条码清单、构建 SOP、底物批次、工作台窗口。
6. 输出：工单状态更新、构建执行日志、构建 callback。
7. 预计完成：`2026-06-04 14:30`。
8. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
9. 下一步：等待 callback 后进入构建 QC。

关键工单派发后，Agent 进入 callback 等待：

```text
构建准备工单已经派发，我会订阅构建系统回调。callback pending 卡如下：
```

callback pending 卡内容：

1. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
2. 等待对象：`WO-ENZ-SYN-001-DNA`。
3. 来源系统：`ConstructStation / LIMS adapter`。
4. 预估回调时间：`2026-06-04 14:30`。
5. 当前状态：`pending`。
6. 超时策略：超过预计时间 20 分钟提醒，不自动重派工单。

pending 后插入短状态更新：

```text
ConstructStation.monitor · running · 已收到工单，正在核对条码清单
ConstructStation.monitor · running · 96 个样本条码已读取，等待板位写回
PipelineRun.waitCallback · pending · 继续等待 CALLBACK-CONSTRUCT-20260604-001
```

收到回调后展示 ingested 卡：

```text
构建系统已经回调，我已解析并写入回调记录。callback 回调卡如下：
```

callback ingested 卡内容：

1. Callback：`CALLBACK-CONSTRUCT-20260604-001`。
2. 状态：`ingested`。
3. 实际回调时间：`2026-06-04 14:41`。
4. 写入表：`device_callback_logs`。
5. 更新工单：`work_orders.WO-ENZ-SYN-001-DNA.status = callback_received`。
6. 返回摘要：96 个样本完成构建准备，2 个样本条码/板位需要复核。
7. 下一步：进入构建 QC。

callback ingested 后，Agent 立即运行构建 QC。这个节点触发本 Thread 唯一一次审批失败回退。

承接语：

```text
我开始对构建回调做 QC。这里会按刚才确认的 blocking 规则检查条码和板位一致性。构建 QC 结果卡如下：
```

构建 QC 结果卡内容：

1. QC：`Construction_QC`。
2. 状态：`failed / needs approval`。
3. 阈值依据：`QC_Threshold_Profile_ENZ_v3.json`。
4. 通过样本：`94 / 96`。
5. 异常样本：`ENZ-SYN-0604-017`、`ENZ-SYN-0604-044`。
6. 异常类型：条码/板位不一致。
7. 影响范围：只影响构建准备阶段，不扩大到整批样本。
8. 下一条 DAG 分支：生成异常资料包并进入质检审批。

然后展示异常资料包卡：

```text
我不会直接创建返工工单，会先生成异常资料包并发起质检审批。异常资料包卡如下：
```

异常资料包卡内容：

1. 资料包：`Construction_QC_Exception_Package.md`。
2. 来源：`CALLBACK-CONSTRUCT-20260604-001` + `Construction_QC`。
3. 异常样本：`ENZ-SYN-0604-017`、`ENZ-SYN-0604-044`。
4. 证据：回调板位与 `Barcode_Manifest.json` 不一致。
5. 建议处理：仅对 2 个样本发起构建复核/返工。
6. 风险：如果放行，后续表达和检测结果可能无法追溯到正确样本。
7. 权限：负责人可见完整证据；返工工单 assignee 只读取异常样本和返工说明。

随后 Agent 自动发起 `rework_authorization` 审批，并展示 pending 卡。审批结果第一次返回 `rejected`：

```text
外部审批系统返回了拒绝结果。审批结果卡如下：
```

`rejected` 审批卡内容：

1. 审批类型：`rework_authorization`。
2. 状态：`REJECTED`。
3. 审批人：`Lab Owner` 或外部审批系统指定人。
4. 结果资料包：`Approval_Result_Package_APR-ENZ-SYN-REWORK-001.json`。
5. 驳回原因：异常样本范围描述不够清楚，返工边界没有明确到孔位。
6. DAG 分支：回退到异常资料包整理节点。

Agent 需要说明回退动作：

```text
我会按审批结果回退到异常资料包整理节点，只补充异常范围和返工边界，不扩大实验范围。
```

修正后重新展示一条短状态和 approved 卡：

```text
ExceptionPackage.revise · success · 已补充 A17 / D08 孔位、样本条码和返工边界
ApprovalGateway.submit · success · 已重新发起 rework_authorization 审批
```

`approved` 审批卡内容：

1. 审批类型：`rework_authorization`。
2. 状态：`APPROVED`。
3. 结果资料包：`Approval_Result_Package_APR-ENZ-SYN-REWORK-002.json`。
4. 审批意见：异常范围和返工边界已明确，只授权 2 个样本返工。
5. DAG 分支：进入返工工单节点。

审批通过后展示返工工单单卡，不生成返工工单包。承接语：

```text
质检审批已经通过。我只会为审批授权的 2 个样本创建返工工单，不会重做整批样本。返工工单卡如下：
```

返工工单单卡内容：

1. Work Order：`WO-ENZ-SYN-REWORK-001`。
2. 类型：构建复核 / 返工。
3. 授权来源：`Approval_Result_Package_APR-ENZ-SYN-REWORK-002.json`。
4. 样本范围：`ENZ-SYN-0604-017`、`ENZ-SYN-0604-044`。
5. 孔位范围：`A17`、`D08`。
6. Assignee：`Tech_A`。
7. 输入：修正后的 `Construction_QC_Exception_Package.md`、条码清单、返工边界。
8. 输出：`Construction_Rework_Work_Order.md`、工单状态更新、返工 callback。
9. Callback：`CALLBACK-CONSTRUCT-REWORK-20260604-001`。
10. 权限：assignee 只读取异常样本和返工说明，不读取完整输入包审计记录。
11. 下一步：等待返工 callback，并回到构建 QC 只复查这 2 个样本。

返工 callback 和复查 QC 不再完整重复 pending / ingested 卡。这里用 2 条状态行 + 一张小 QC passed 卡压缩展示，重点证明返工范围受控且已经回到主线。

状态行：

```text
ConstructStation.reworkCallback · success · CALLBACK-CONSTRUCT-REWORK-20260604-001 已返回，2 个样本返工完成
ConstructionQC.recheck · success · ENZ-SYN-0604-017 / ENZ-SYN-0604-044 条码与板位复查通过
```

复查 QC 小卡内容：

1. QC：`Construction_QC_Recheck`。
2. 状态：`passed`。
3. 样本范围：`2 / 2`。
4. 复查样本：`ENZ-SYN-0604-017`、`ENZ-SYN-0604-044`。
5. 写入：`qc_results` append。
6. 状态更新：2 个样本从 `rework_dispatched` 更新为 `construction_qc_passed`。
7. 下一步：整批 96 个样本进入表达执行主线。

表达与纯化阶段不再重复完整工单、callback、QC 卡片。前面已经展示过工单派发、callback、QC、审批和返工闭环，后续要推进到检测数据和结果。

表达阶段压缩展示：

```text
我继续推进表达阶段。这里不重复展示工单卡，只列出执行状态：

ExpressionWorkOrder.dispatch · success · WO-ENZ-SYN-002-EXP 已派发给 Tech_B
BioreactorCallback.ingest · success · CALLBACK-BIOREACTOR-20260604-008 已入库
ExpressionQC.evaluate · success · 96/96 样本表达记录完整，92 个达到表达阈值，4 个标记为低表达但允许进入纯化观察
```

纯化阶段压缩展示：

```text
我继续推进纯化阶段。注意前置 warning 里的 85% purity_min 已生效。

PurificationWorkOrder.dispatch · success · WO-ENZ-SYN-003-PUR 已派发给 Tech_C
PurificationCallback.ingest · success · CALLBACK-PURIFICATION-20260604-014 已入库
PurificationQC.evaluate · success · 89/96 样本纯度 >= 85%，7 个样本低于阈值并标记为 low_purity
```

检测阶段需要展开一些，因为这里开始产生负责人最关心的数据。先用文字承接：

```text
表达和纯化主线已经完成，我会进入活性和稳定性检测。这里会展示表格和几个小图，帮助你快速看结果，而不是只给一段结论。
```

检测阶段建议展示一个 MD 表格：

| Variant | Activity % | Purity % | Expression | Stability Tm | QC status | Recommendation |
|---|---:|---:|---:|---:|---|---|
| `ENZ-SYN-0604-011` | 142 | 91 | high | 67.2 | passed | advance |
| `ENZ-SYN-0604-028` | 136 | 88 | high | 66.1 | passed | advance |
| `ENZ-SYN-0604-044` | 131 | 87 | medium | 65.8 | rework recovered | advance |
| `ENZ-SYN-0604-017` | 126 | 86 | medium | 64.9 | rework recovered | monitor |
| `ENZ-SYN-0604-073` | 119 | 84 | high | 63.5 | low purity | hold |

检测阶段图表安排：

1. 折线图：展示 `ENZ-SYN-0604-011`、`028`、`044`、`017` 在 0-60 min 的相对活性保持率，说明稳定性趋势。
2. 柱状图：展示 Top 8 variants 的 Activity %，突出领先样本和返工恢复样本。
3. 饼图：展示 96 个样本的状态组成：passed、rework recovered、low purity、held for review。

图表承接语示例：

```text
表格给出精确读数。下面我用三个小图分别看趋势、分组对比和样本状态组成。
```

图表之后 Agent 给短结论：

```text
初步结论：011 和 028 是最稳的 advance 候选；044 经过返工后进入 advance，但需要在下一轮重点复核条码追溯；017 可以保留观察；低纯度样本不进入本轮推荐列表。
```

检测图表之后，插入一次负责人可见的质检数据回调。这个回调表示 QC 子系统把本轮质检摘要推回 Thread，不是让负责人审批。

承接语：

```text
质检系统也回传了本轮 QC 摘要。我把这次质检数据回调展示出来，方便你看到哪些 gate 影响了结果包。质检数据回调卡如下：
```

质检数据回调卡内容：

1. Callback：`CALLBACK-QC-SUMMARY-20260604-001`。
2. 来源系统：`QC Orchestrator`。
3. 回调对象：`RUN-ENZ-SYN-20260604-001`。
4. QC 阶段：construction、expression、purification、assay、data integrity。
5. 总体状态：`completed_with_warnings`。
6. 通过：`89`。
7. 返工后恢复：`2`。
8. 低纯度保留：`7`。
9. 负责人可见报告：`QC_Owner_Callback_Summary.md`。
10. 写入：`qc_results` append + `pipeline_run_events` append。

Agent 短结论：

```text
这次 QC 回调不会暂停流程。它只把质检摘要回传给你；结果包仍会按 passed、rework recovered 和 held 状态生成。
```

结果包和效率分析阶段继续收束，不再新增第三套大表。检测阶段已经展示 MD 表格和三类图，尾段重点是交付物沉淀和管理视角。

结果包卡承接语：

```text
我已把检测结果、QC 记录、回调数据和异常处理链路整理成结果包。结果包卡如下：
```

结果包卡内容：

1. 结果包：`Result_Package.xlsx`。
2. 摘要文件：`Result_Package_Summary.md`。
3. 标准化数据：`LIMS_Ingest_Normalized.json`。
4. 曲线拟合：`Assay_Curve_Fits.json`。
5. QC 记录：`qc_results`。
6. 异常链路：构建 QC 失败、审批回退、2 个样本返工、复查通过。
7. 推荐候选：`ENZ-SYN-0604-011`、`028`、`044`。
8. 状态：`result_package_ready`。
9. 写入：`experiment_orders.ORD-ENZ-SYN-20260604-001.result_package_asset_path`。

结果包生成后，Agent 自动发起 `result_release` 审批。这里需要展示一张 pending 卡和一张 approved 卡，但不再像质检审批那样展开长等待或失败重提交流程。

结果释放审批 pending 承接语：

```text
结果包已经生成，但我还不能直接释放给下一轮决策。我会发起 result_release 审批，审批通过后再输出负责人摘要。结果释放审批卡如下：
```

`result_release` pending 卡内容：

1. 状态：`PENDING`。
2. 审批类型：`result_release`。
3. 审批人：`LAB_OWNER_A` 或结果释放负责人。
4. 发起人：`ProteinDesign Agent`。
5. 资料包：`Approval_Package_Result_Release.md`。
6. 绑定结果包：`Result_Package.xlsx`、`Result_Package_Summary.md`。
7. 当前动作：等待外部审批系统确认是否释放结果包。
8. 发起时间。

结果释放审批 approved 承接语：

```text
result_release 审批已经通过。结果包现在可以释放给负责人，并进入本轮效率分析和下一轮建议。审批结果卡如下：
```

`result_release` approved 卡内容：

1. 状态：`APPROVED`。
2. 审批类型：`result_release`。
3. 审批结果：`approved`。
4. 审批意见：结果包、QC 摘要和异常链路完整；允许释放给本项目负责人。
5. 审批通过时间。
6. 结果资料包：`Approval_Result_Package_Result_Release.json`。
7. 写入：`approval_results` append + `experiment_orders.<id>.result_release_status = released`。

效率分析只补一个轻量图表，不再新增大表。建议用柱状图展示各阶段耗时或用饼图展示等待时间来源，二选一即可。推荐使用柱状图：

```text
我再补一张轻量效率图，帮助你看本轮瓶颈，不展开新的明细表。
```

效率分析柱状图：

1. x 轴：construction、rework、expression、purification、assay、data ingest。
2. y 轴：耗时分钟。
3. 标注：rework 增加 38 min，purification queue 增加 52 min。
4. 结论：最大瓶颈是纯化排队，其次是构建返工；下一轮可以提前预留 PUR-04 和将条码复核前置到构建工单提交前。

如果检测阶段已经使用过柱状图，尾段可以改用饼图展示等待时间来源，但不能再同时堆多个图。

最后负责人摘要承接语：

```text
本轮 Pipeline 已完成。我把结果包、QC 回调、返工链路和效率分析合并成负责人摘要，最后给 3 条下一轮流程优化建议。
```

负责人摘要建议：

1. 条码复核前置：在构建工单提交前增加自动条码/板位复核，避免进入构建 QC 后再触发质检审批。
2. 纯化设备提前预约：本轮 `PUR-04` 排队增加 52 min，下一轮在 Run Input Package 确认后提前锁定纯化窗口。
3. 低纯度样本分支前移：低于 85% purity 的样本不直接进入检测，先进入 hold / re-purification 分支，减少检测资源占用。

这 3 条建议需要明确区分：

1. Pipeline 模板调整：条码复核前置、低纯度样本分支前移。它们会改变下一轮 DAG 或节点契约。
2. 本次 run 执行建议：纯化设备提前预约。它主要改变资源排期策略，不一定修改 Pipeline 模板。

Agent 结尾不能只说“建议优化流程”。必须说明哪些建议可以沉淀到 Capabilities Pipeline，哪些只是本次运行的运营复盘。

后续审批规则：

1. 启动审批、质检审批、结果释放审批这 3 类显式审批节点，在 DAG 需要启动时由 Agent 自动发起。
2. 人类负责人不需要在 Thread 中逐个说“发起审批”。
3. 审批结果由外部审批系统返回，Thread 只展示 pending、callback ingested、approved/rejected 和结果资料包。
4. 如果审批不通过，DAG 按回退线回到前序节点或进入终止/返工路径。
5. Thread 中只需要展示一次真实的审批不通过分支，建议放在构建 QC 后的质检审批。审批被拒后，Agent 根据结果资料包修正异常范围和返工边界，再重新发起审批。
6. 数据追补、设备延期、资源变更等潜在审批保留在节点 JSON 或外部审批系统记录里，第一版 Demo 不在主 DAG 和 Thread 中额外展开。

这样可以保留真实审批系统的存在感，同时避免 Thread 变成审批聊天记录。

这样既能看起来像真实系统，又不会把实现范围扩散到完整 LIMS。
