# LIMS Mock ELN 大纲

日期：2026-06-07
范围：`Enzyme Synthesis Ops / LIMS 流程运行` mock Thread 中的可编辑 `.eln` 实验记录大纲。
文件示例：`RUN-ENZ-SYN-20260604-001_experiment_record.eln`

## 设计目标

这份 ELN 不是结果包的附属说明，而是实验运行过程中被 Agent 持续维护的实验记录。

核心效果：

1. `run_start` 审批通过后，Agent 立刻创建 ELN 文件。
2. 后续样本注册、资源准备、工单派发、回调、QC、异常和结果交接持续写入同一份 ELN。
3. 因为当前是 completed mock，最终展示时 ELN 可以一次性填完整，但叙事上应保留“过程中持续更新”的感觉。
4. 人打开右侧 Workspace Side Window 后，可以像编辑实验记录本一样直接修改正文。

## 记录原则

1. **保留过程，不只保留结果**：每个关键节点至少有时间、来源、动作、输出、状态。
2. **异常不消失**：返工、低收率、边缘孔波动、附件补录都保留为 flag，不自动剔除原始读数。
3. **审批和 QC 独立成章**：run_start、rework_authorization、result_release 不混在普通日志里。
4. **对象路径可回链**：ELN 中引用的文件要能回到 Object Storage Asset。
5. **人工可补充**：每个关键阶段保留 `Human notes` 或 `Reviewer notes` 区域，体现可编辑性。

## 顶层结构

### 0. ELN Header

用途：让用户打开文件后立刻知道这是哪一轮实验记录、处于什么状态。

建议字段：

| 字段 | 说明 |
| --- | --- |
| ELN ID | `ELN-RUN-ENZ-SYN-20260604-001` |
| Run ID | `RUN-ENZ-SYN-20260604-001` |
| Project | `Enzyme Synthesis Ops` |
| Pipeline | `LIMS 酶合成执行 Pipeline v1.0` |
| Current status | `Running` / `Completed` / `Released` |
| Created by | `ProteinOps Agent` |
| Created at | run_start 审批通过后 |
| Last updated at | 最近一次 Agent 或人工编辑时间 |
| Editable by | Project Owner / Lab Owner / authorized operator |

### 1. Run Setup Snapshot

用途：记录实验启动时锁定的输入边界。

包含内容：

1. 用户启动语句。
2. 输入确认轮次摘要。
3. 样本范围：48 个候选 + 4 个对照。
4. 库存记录：`INV-ENZ-SYN-202606`。
5. 底物批次：`SUB-LOT-202606-A`，备用批次说明。
6. SOP 和设备窗口：`SOP v4`、`LCQ-03`、`PR-3107`。
7. 结果交付边界：结果包、QC 摘要、异常清单、图表、效率复盘。

建议子块：

- `Locked inputs`
- `Assumptions`
- `Human confirmations`
- `Linked files`

### 2. Approval Records

用途：独立记录所有人类审批，不让审批被普通执行日志淹没。

建议子章节：

1. `run_start`
   - 审批人：Lab Owner
   - 决策：Approved
   - 决策时间
   - 授权边界：仅限已锁定样本、设备窗口和结果包边界
   - 关联文件：`APPROVAL-run_start-20260604-0918.json`

2. `rework_authorization`
   - 审批对象：`ENZ-SYN-017 / ENZ-SYN-032`
   - 触发原因：构建 QC 覆盖不足
   - 决策：Approved
   - 回退节点：构建执行
   - 关联文件：`APPROVAL-rework_authorization-20260604-1244.json`

3. `result_release`
   - 审批对象：`Enzyme_Synthesis_Result_Package.xlsx`
   - 决策：Approved
   - 发布位置：`Runs/RUN-ENZ-SYN-20260604-001/results`
   - 关联文件：`APPROVAL-result_release-20260604-1710.pdf`

### 3. Sample Registry And Plate Map

用途：记录样本、条码和板图从哪里来，后续读数如何追溯。

包含内容：

1. 样本批次：`ENZ-SYN-BATCH-048`。
2. 样本数量：52。
3. 条码批次：`BAR-ENZ-SYN-20260604-001`。
4. 板图策略：两块 96-well 板，候选按行展开，对照分散布置。
5. 控制组：parent、blank、inactive enzyme 等。
6. 关联文件：`ENZ-SYN-BATCH-048_sample_manifest.xlsx`。

建议表格：

| 样本组 | 数量 | 来源 | 板图策略 | 状态 |
| --- | ---: | --- | --- | --- |
| Candidate variants | 48 | Sample Registry | row-wise | registered |
| Controls | 4 | locked input | dispersed | registered |

### 4. Materials, Resources, And SOP

用途：记录执行环境，避免结果脱离物料和设备上下文。

包含内容：

1. 底物、缓冲液、备用批次。
2. SOP 版本。
3. 设备和有效窗口。
4. 设备校准状态。
5. 人员与交接窗口。
6. 资源锁定记录：`RESOURCE-LOCK-ENZ-SYN-20260604.json`。

建议子块：

- `Material release status`
- `Equipment readiness`
- `Operator handoff`
- `Deviation notes`

### 5. Work Order Bundle

用途：把 Agent 派发的工单拆清楚，后续回调和执行日志能对齐。

包含工单：

| 工单 | 阶段 | Owner | 回调 | 状态 |
| --- | --- | --- | --- | --- |
| `WO-CONSTRUCT-20260604-101` | DNA assembly / clone verification | Tech_A | `CALLBACK-CONSTRUCT-101` | complete |
| `WO-EXPRESS-20260604-102` | expression | Tech_B | expression record | complete |
| `WO-PURIFY-20260604-103` | purification | Tech_C | purification record | complete |
| `WO-ASSAY-20260604-104` | assay | PR-3107 | `CALLBACK-ASSAY-104` | complete |
| `WO-INGEST-20260604-105` | data ingest | DataOps | `CALLBACK-INGEST-105` | complete |

关联文件：

- `WO-BUNDLE-ENZ-SYN-001.json`
- `WO-CONSTRUCT-20260604-101.md`
- `WO-EXPRESS-20260604-102.md`
- `WO-PURIFY-20260604-103.md`
- `WO-ASSAY-20260604-104.csv`
- `WO-INGEST-20260604-105.md`

### 6. Execution Timeline

用途：提供按时间读的实验过程记录。

建议以事件流呈现：

| 时间 | Actor | System | Event | Record ID | Status |
| --- | --- | --- | --- | --- | --- |
| 09:18 | Lab Owner | Approval Gateway | run_start approved | approval id | approved |
| 10:02 | Tech_A | LIMS | construction started | work order id | running |
| 10:30 | QC Rule Engine | QC | coverage flag detected | QC flag id | flagged |
| 13:05 | Tech_B | ELN | expression record submitted | expression id | complete |
| 14:12 | AKTA Pure | Device | purification curve returned | purification id | complete |
| 15:22 | QC Rule Engine | QC | QC summary callback | callback id | passed |

注意：这里是主时间线，不展开所有读数明细；读数明细放到后续 assay/readout section。

### 7. QC Gates And Decisions

用途：明确每个 QC gate 的判定依据、结论和后续动作。

建议子章节：

1. `Construction QC`
   - 触发：构建回调。
   - 结果：2 个样本覆盖不足。
   - 决策：进入 rework_authorization。
   - 状态：返工后 resolved。

2. `Purification QC`
   - 触发：纯化回调。
   - 结果：2 个低收率样本 flag。
   - 决策：不阻断检测。
   - 状态：passed with flags。

3. `Data Integrity QC`
   - 触发：数据入库完成。
   - 检查：缺失字段、重复孔一致性、异常 flag、权限边界。
   - 结果：passed。
   - 关联文件：`CALLBACK-QC-204_summary.json`。

### 8. Assay And Readout Summary

用途：用摘要方式呈现读数，不把 ELN 变成完整数据表。

包含读数面板：

| 指标 | 样本数 | 来源 | 备注 |
| --- | ---: | --- | --- |
| activity | 52 | PR-3107 | 含 4 个对照 |
| kcat/Km proxy | 48 | PR-3107 | 候选统计 |
| Tm | 48 | assay panel | 低收率样本保留 flag |
| pH window | 48 | assay panel | pH 5.5-9.0 |
| expression | 52 | expression record | 作为输出，不作为主 QC 节点 |

建议保留：

- `Readout summary`
- `Control behavior`
- `Top-level observations`
- `Linked dataset`: `structured_readouts.json`

### 9. Exceptions And Flags

用途：把异常作为可复核对象集中展示。

建议表格：

| Sample | Well | Flag | Source | Raw reading preserved | Auto excluded | Status |
| --- | --- | --- | --- | --- | --- | --- |
| `ENZ-SYN-006` | `B08` | low yield | purification QC | yes | no | flagged |
| `ENZ-SYN-017` | `D04` | construction rework | construction QC | yes | no | resolved |
| `ENZ-SYN-032` | `F10` | construction rework | construction QC | yes | no | resolved |
| `ENZ-SYN-041` | TBD | low yield | purification QC | yes | no | flagged |

需要强调的固定策略：

1. 异常不自动剔除。
2. 原始读数保留。
3. 下一轮由负责人复核，不由 Agent 自动扩大样本。

### 10. Data Ingest And Object Storage Links

用途：连接 ELN、结构化数据集和对象存储资产。

包含内容：

1. 数据入库服务：Data Ingest Service。
2. 结构化数据集 ID。
3. 数据行数：612。
4. schema version。
5. 对象存储清单。
6. 关键文件回链。

建议文件链接分组：

- `inputs`
- `approvals`
- `work_orders`
- `callbacks`
- `qc`
- `exceptions`
- `eln`
- `results`
- `analysis`

### 11. Result Package And Release

用途：记录结果包生成、检查和发布审批。

包含内容：

1. 结果包名称：`Enzyme_Synthesis_Result_Package.xlsx`。
2. 结果包内容：结构化读数、QC 摘要、异常清单、图表、效率复盘。
3. schema checks。
4. missing items。
5. release approval。
6. 发布位置。

建议子块：

- `Package contents`
- `Schema checks`
- `Release approval`
- `Post-release notes`

### 12. Efficiency Review And Next-Round Notes

用途：让 ELN 不只是合规记录，也能承接下一轮实验决策。

包含内容：

1. 本轮总耗时：471 min。
2. 对比上一轮和最近 5 轮均值。
3. 卡点：构建与质检等待段。
4. 改进点：构建 QC 条码复核前移，预留小设备窗口。
5. 下一轮候选注意事项。

关联文件：

- `RUN-ENZ-SYN-20260604-001_efficiency_review.md`
- `ops_efficiency_breakdown.png`
- `next_round_candidate_notes.md`

### 13. Human Notes

用途：体现 ELN 是可编辑记录，不是只读报告。

建议固定区域：

```text
Lab Owner notes:

Project Owner notes:

Data Steward notes:

Follow-up questions:
```

这部分在 mock 里可以留空或写轻量 placeholder，编辑器中必须可直接编辑。

### 14. Audit Trail

用途：支撑“Agent 持续更新 ELN”的产品叙事。

建议记录：

| 时间 | Actor | Action | Section | Summary |
| --- | --- | --- | --- | --- |
| run_start approved | ProteinOps Agent | created | ELN Header | created editable ELN shell |
| sample registry done | ProteinOps Agent | updated | Sample Registry | added batch and barcode summary |
| work order bundle dispatched | ProteinOps Agent | updated | Work Orders | added 5 work orders |
| QC callback received | ProteinOps Agent | updated | QC Gates | added CALLBACK-QC-204 |
| result package generated | ProteinOps Agent | updated | Result Package | added package and release notes |
| manual edit | Human | edited | Human Notes | user-entered note |

## Agent 更新节奏

| Thread 阶段 | ELN 动作 | 用户感知 |
| --- | --- | --- |
| `run_start` 审批通过 | 创建 ELN shell，写入 Header、Run Setup、Approval | 文件立刻出现在 Thread 和侧窗 |
| 样本注册完成 | 更新 Sample Registry And Plate Map | ELN 不是空文件，开始积累实验上下文 |
| 工单包生成 | 更新 Work Order Bundle | 用户能看到执行拆分 |
| 构建 / 表达 / 纯化回调 | 更新 Execution Timeline | 形成过程记录 |
| QC gate 通过或触发审批 | 更新 QC Gates、Exceptions | 异常被保留，不被掩盖 |
| 数据入库完成 | 更新 Assay And Readout Summary、Object Storage Links | ELN 与结构化数据联动 |
| 结果包生成 | 更新 Result Package、Efficiency Review | completed mock 中展示完整内容 |
| 人工编辑 | 更新 Human Notes、Audit Trail | 表示人可直接介入记录 |

## 右侧编辑器呈现建议

第一屏建议显示：

1. ELN Header：文件名、Run ID、状态、最后更新时间。
2. 章节状态卡：Setup、Execution、QC、Results。
3. 可编辑正文区域：从 `Run Setup Snapshot` 开始。
4. 轻量格式工具栏：粗体、标题、列表即可。

不要第一版就做：

1. 实时多人协作。
2. 完整表格编辑器。
3. 自动保存冲突解决。
4. 审批签名系统。
5. 从 ELN 反向修改 LIMS 记录。

## 当前 mock 的推荐完成态

虽然产品叙事是“实验过程中持续更新”，当前 LIMS mock 已经完成，因此 `.eln` 文件打开时可以一次性展示完整内容：

1. Header 显示 `Completed / editable`。
2. Audit Trail 体现它从 run_start 开始被创建，并在每个阶段更新。
3. Human Notes 保留可编辑空白区域。
4. Result Package 和 Efficiency Review 已填入。
5. Exceptions 保留 flag 和 resolved 状态。

这样既不需要模拟真实异步写入，也能让用户一眼理解：ELN 是 Agent 从实验启动后一路维护下来的实验记录。
