# BioMap Agent Proposal v1 补充建议稿

用途：这份文档不是完整计划书，而是给现有 `BioMap Agent Proposal v1` 补骨架。可以先挑选其中几段放回原文，再继续改。

---

## 1. 建议先补的章节顺序

当前 v1 的背景和商业价值已经能说明“为什么做”，但产品和研发落地部分还偏提纲。建议先补这四块：

1. **产品业务架构说明**
   架构图已经改成分层式，下一步要解释每一层的作用，以及层与层之间怎么配合。

2. **核心模块定义**
   重点补 Workspace、Projects、Assets、Pipelines、Approvals 五个模块。Capabilities 更适合放在架构中的能力层，不一定作为用户侧一级模块。

3. **核心对象关系**
   需要讲清楚 Project、Thread、Task、Pipeline Run、Asset、Approval Request 的边界，否则读者会混淆“线程”“任务”“传统模块任务”。

4. **Demo 主线**
   Demo 不要先列所有能做的能力，先讲一条完整闭环：候选分子 -> 湿实验订单 -> Approval -> 实验 / CRO -> AI-Ready Dataset -> Oracle -> 下一轮设计。

---

## 2. 产品业务架构补充说明

BioMap Agent 的产品业务架构可以按“业务场景 -> 产品模块 -> Agent 执行层 -> Workflow / Tool 层 -> BioMapOS 能力层 -> 数据资产底座 -> 模型底座”来理解。

### 2.1 业务场景层

业务场景层回答的是：BioMap Agent 第一阶段到底服务哪些研发工作。

第一阶段建议聚焦五类场景：

- 蛋白工程闭环：从候选设计、结构预测、性质评分到湿实验验证和下一轮设计。
- CRO 实验协同：从实验方案、CRO RFQ、订单跟踪到数据回收和交付复盘。
- 实验数据资产化：将 BLI、SEC-HPLC、表达、纯化、CRO 反馈等结果整理为 AI-Ready Dataset。
- 模型复利 / Oracle：用新实验数据微调模型，并将模型部署回蛋白设计流程作为 Oracle。
- BD-ready 证据包：把项目 rationale、实验数据、模型结果和审计轨迹整理成可对外解释的证据材料。

这里不要把所有科研工作都纳入第一阶段。首个演示和首个研发闭环建议选 `design_to_wet_lab_order`，因为它最能体现 BioMapOS 现有蛋白设计、智能实验、数据平台和审批能力的连接价值。

### 2.2 产品业务模块层

产品模块层回答的是：用户在前台看到什么、在哪里推进工作。

建议保留五个核心模块：

- Workspace：Main Agent 工作区。用户在这里描述研发目标、创建或继续 Thread、查看 Task 执行过程。
- Projects：项目管理和交付视图。聚合项目里的 Thread、Task、资产、审批、风险和交付物。
- Assets：研发资产库。管理分子、实验、订单、数据集、模型、Oracle、报告和决策记录。
- Pipelines：可复用流程管理。管理 workflow 模板、运行状态、版本、审批节点和失败恢复。
- Approvals：审批和治理中心。集中处理湿实验、CRO 下单、预算、模型发布、Oracle 部署和对外报告。

Capabilities 不建议作为普通用户第一眼看到的主模块。它更像后台能力中心，负责管理 Workflow、Skill、MCP、Plugin、CLI/API 和 Capability Command。对用户来说，能力应该通过 Workspace、Pipelines 和 Assets 被自然调用，而不是让用户自己选择底层能力。

### 2.3 Agent 执行与治理层

Agent 执行层回答的是：Main Agent 如何真正推进一件研发任务。

建议拆成五个核心单元：

- Main Agent：用户可感知的协作对象，负责对话、解释、计划展示、审批请求和结果总结。
- Loop Agent Runtime：执行 observe / plan / act / evaluate / checkpoint 循环，支持暂停、恢复、重试和长任务。
- Task Planner：将用户目标拆成阶段，选择合适的 Pipeline、Skill、Capability Command 或旧系统入口。
- Memory Control：维护 Project、Thread、Asset、Decision 和 Execution Memory，避免 Agent 每次都从零开始。
- Approval Policy / Trace：在高风险动作前触发审批，并记录完整执行轨迹、证据、错误和恢复点。

这一层是 BioMap Agent 研发的重点。它决定了系统是不是只是“会聊天”，还是能稳定执行跨模块流程。

### 2.4 Workflow / Tool 层

Workflow / Tool 层回答的是：旧系统能力如何被 Agent 稳定调用。

建议把高频流程分三层封装：

- Skill Runtime：封装经典流程、脚本、校验逻辑和示例输入输出。
- Pipeline Runner：负责流程运行状态、步骤恢复、审批暂停和失败处理。
- Capability Command：为每个能力定义标准输入输出 Schema、权限要求、风险等级、审批策略、fallback 和审计事件。

这一层要避免让 Agent 直接操作旧页面。旧模块应该优先 CLI / API 化，前端复杂结果用 Visual Components 展示，例如蛋白 3D、模型柱状图、富表格、实验方案表和数据质量报告。

### 2.5 BioMapOS 能力层

BioMapOS 能力层回答的是：旧系统如何保留和复用。

BioMap Agent 不应推倒重做 BioMapOS。知识助手、蛋白设计、智能实验、数据平台、模型平台、项目管理都应继续存在，但它们的主要能力需要逐步封装成 Agent 可调用的命令接口：

- 知识助手：文献、靶点、生信、实验设计。
- 蛋白设计：GEN、MOO、DISCOVER、FOLD、EVAL、FILTER。
- 智能实验：分子注册、实验订单、CRO、库存、实验记录。
- 数据平台：Dashboard、Data Catalog、Data Agent、AI-Ready Dataset。
- 模型平台：Model Hub、Model Builder、Registry、Inference、Deploy。
- 项目管理：项目卡片、分子主表、CRO 进度、实验进度。

旧系统页面仍然有价值，尤其是专业查看、人工接手、配置、排错和审计场景。Agent 默认调用 CLI/API，必要时跳回旧页面。

### 2.6 数据资产和模型底座

数据资产底座回答的是：Agent 执行之后留下什么。

每次 Agent 运行都应该留下结构化记录，而不是只留下聊天文本。至少需要记录：

- Raw Data：仪器文件、CRO 报告、Excel、PDF、图片。
- Structured Data：标准字段、单位、元数据、样本映射。
- AI-Ready Dataset：训练集、验证集、权限、版本。
- Asset Graph & Lineage：分子、实验、数据集、模型、报告之间的关系。
- Trajectory：工具调用、脚本、审批、产物、错误、恢复点。
- Memory：Project Memory、Thread Memory、Decision Memory、Execution Memory。

模型底座包括 BioMap 蛋白基础模型、各类任务模型、Main Agent LLM 和项目专属 Oracle。Agent 的长期价值不只来自模型本身，还来自“实验数据 -> 数据集 -> 模型微调 -> Oracle -> 下一轮设计”的反馈路径。

---

## 3. 核心对象关系补充

建议在产品架构后面单独补一小节，避免读者混淆 Project、Thread 和 Task。

### 3.1 Project

Project 是长期业务容器，通常对应一个客户项目、内部研发项目或交付项目。Project 管理项目目标、权限、预算、成员、里程碑、资产和交付物。

一个 Project 可以包含多个 Thread、多个 Pipeline Run、多个 Asset 和多个 Approval Request。

### 3.2 Thread

Thread 是 Project 内的连续协作上下文，不等同于一次任务，也不等同于普通聊天记录。它更像一个长期工作位：用户和 Main Agent 可以围绕同一个研发目标持续对话、选入上下文、发起多个 Task、沉淀决策和关联资产。

例如 `EGFR 抗体亲和力优化` 可以是一个 Thread。这个 Thread 里可以先做靶点调研，再做候选设计，再发起湿实验订单，再做数据资产化和模型微调。

### 3.3 Task

Task 是 Main Agent 在 Thread 中发起的一次执行记录。它有明确目标、计划、状态、工具调用、审批节点、产物和错误记录。

例如：

- 生成湿实验订单草稿。
- 将 BLI 数据整理为 AI-Ready Dataset。
- 用最新实验数据微调稳定性 Oracle。
- 生成项目周报和风险列表。

Task 不是传统项目管理里的人工任务，也不是智能实验里的 Experiment Task。它是 Agentic execution 的运行记录。

### 3.4 Pipeline Run

Pipeline Run 是 Task 调用某个 Workflow 后产生的流程运行实例。一个 Task 可以调用一个或多个 Pipeline Run。

例如用户在 Thread 里说“帮我从候选分子生成实验订单”，Main Agent 创建一个 Task，并启动 `design_to_wet_lab_order` Pipeline Run。这个 Pipeline Run 包含候选校验、实验方案生成、成本估算、审批、订单草稿生成等步骤。

### 3.5 Asset

Asset 是可复用的研发产物或证据对象。它包括 Molecule、ExperimentOrder、CROOrder、ExperimentRecord、Dataset、Model、Oracle、Report、Decision 等。

Agent 的关键输出应进入 Assets，而不是只留在 Thread 对话里。这样后续 Task、Pipeline、报告和审计才能复用。

### 3.6 Approval Request

Approval Request 是对高风险动作的审批请求。它由 Task 或 Pipeline Run 触发，并关联 Project、Thread、输入资产、输出资产、风险、成本、审批人和审计记录。

需要审批的动作包括湿实验提交、CRO 下单、预算承诺、库存占用、模型发布、Oracle 部署、对外报告和审批策略变更。

---

## 4. 模块补充稿

### 4.1 Workspace

Workspace 是 BioMap Agent 的默认主入口。用户在这里描述研发目标，选择 Project，创建或继续 Thread，并查看 Main Agent 的计划、执行过程、审批请求和产物。

第一阶段 Workspace 需要重点支持：

- Project / Thread 左侧栏。
- 中心目标输入框。
- Use Case Cards，用于启动高频 workflow。
- Thread 工作区，展示对话、Context Pack、Task List、Execution Timeline 和关联资产。
- Task Detail，展示计划、步骤、工具调用、审批状态、产物和失败恢复。

Workspace 的核心价值是把用户从“我该去哪个模块”切换到“我在这个 Project / Thread 中要推进什么研发目标”。它不替代所有专业页面，但要成为发起和恢复研发流程的默认入口。

### 4.2 Projects

Projects 是业务归属和交付管理层。它负责聚合一个 Project 下的 Thread、Task、Pipeline Run、Assets、Approvals、风险和交付物。

Projects 第一阶段需要支持：

- Project 列表和项目详情。
- 项目下 Thread 聚合。
- 活跃 Task、等待审批、CRO 阻塞、实验进度和模型状态摘要。
- 项目资产索引，包括分子、实验订单、数据集、模型、报告。
- 项目周报、风险列表和交付包草稿。

现有项目管理模块里的项目卡片、分子主表、CRO 订单进度和实验进度不需要重做。它们应该作为 Project Context 接入 Agent，让 Main Agent 可以读取、汇总和跳转。

### 4.3 Assets

Assets 是研发资产库，负责管理 Agent 运行过程中产生或引用的关键对象。

第一阶段建议优先支持五类资产：

- Molecule / ProteinSequence：序列、构型、来源、评分、结构预测。
- ExperimentOrder：实验目标、分子、制备步骤、测定性质、审批状态。
- Dataset：Raw / Structured / AI-Ready 状态、Schema、字段、标签、权限、版本。
- Model / Oracle：模型版本、训练数据、评估指标、部署状态、调用记录。
- Report / Decision：报告、结论、引用资产、审批状态、决策理由。

每个 Asset Detail 建议采用统一结构：

- Overview：这个资产是什么。
- Lineage：从哪里来，被哪些 Task / Pipeline 使用过。
- Evidence：相关数据、文件、模型、实验记录。
- Actions：可执行动作，例如进入实验、注册数据集、发起训练、生成报告。
- Permissions：谁能看、谁能用、谁能改。
- Timeline：版本和关键变更。

### 4.4 Pipelines

Pipelines 是可复用流程管理模块。它负责管理 workflow 模板、运行状态、审批节点、版本和失败恢复。

第一阶段建议优先做三条 Pipeline：

- `design_to_wet_lab_order`：从候选分子生成湿实验方案和订单草稿。
- `experiment_result_to_ai_ready_dataset`：从实验记录和 CRO 文件生成 AI-Ready Dataset。
- `model_release_to_oracle`：从 AI-Ready Dataset 训练模型，并生成 Oracle 发布草稿。

Pipeline Run 需要展示：

- 输入资产。
- 步骤列表。
- 当前状态：Draft、Running、Waiting Approval、Waiting External、Completed、Failed、Handoff。
- 每一步调用的 Skill、Capability Command、CLI/API 和脚本。
- 审批节点。
- 输出资产。
- 失败原因、重试方案和人工接手入口。

Pipelines 是未来 workflow pack 产品化的核心模块。交付团队可以基于它把客户需求配置成可复用流程，而不是每次做定制开发。

### 4.5 Approvals

Approvals 是审批和治理中心。它负责集中处理 Agent 发起的高风险动作，保证系统可以进入真实研发和交付流程。

第一阶段需要支持：

- Approval Queue：按项目、类型、风险、到期时间、审批人分组。
- Approval Detail：展示 Agent 想做什么、为什么做、使用哪些资产、预计成本、风险、替代方案和不做的影响。
- 审批操作：批准、驳回、修改、分派。
- 审批结果写入 Task、Pipeline Run、Trajectory 和 Audit Log。

Approvals 不是对自动化的阻碍，而是生命科学场景里的安全阀。湿实验、CRO 下单、预算承诺、模型发布、Oracle 部署、对外报告都必须经过审批。

---

## 5. Demo 主线补充

当前 Demo 部分可以从“能力列表”改成“一条主线 + 可扩展能力”。

### 5.1 推荐主线：候选分子到下一轮设计

演示脚本：

1. 用户进入 `Antibody Optimization` Project。
2. 用户在 Workspace 输入：`基于当前候选分子，帮我生成湿实验验证方案和订单草稿。`
3. Main Agent 读取候选分子、结构预测、评分卡、项目约束和历史实验记录。
4. Main Agent 创建 Task：`生成湿实验订单草稿`。
5. Task 启动 `design_to_wet_lab_order` Pipeline Run。
6. Pipeline 完成候选校验、实验方案生成、成本估算和风险提示。
7. 系统生成 Approval Request，请实验负责人确认实验方案、预算和 CRO / 内部实验路径。
8. 审批通过后，生成 ExperimentOrder，并进入智能实验或 CRO 流程。
9. 实验结果回流后，Agent 启动 `experiment_result_to_ai_ready_dataset`。
10. 数据集生成后，Agent 建议启动 `model_release_to_oracle`。
11. Oracle 发布后，Main Agent 生成下一轮候选设计建议和项目周报。

### 5.2 可扩展能力

主线之外，可以列出可扩展能力，但不要喧宾夺主：

- 联网搜索和靶点调研。
- 生物知识问答。
- 编写项目报告。
- 统计项目实验数和蛋白设计任务数。
- 发送邮件 / IM 推送。
- 创建新的研究流程。
- 使用 Skill，例如已有的 cellclaw Skill。

---

## 6. 商业价值指标补充建议

当前 v1 里有一些数字很有冲击力，例如 500%+、80%、300%+、99.9%+。建议先把这些数字改成“目标指标”或“验证指标”，避免被追问来源。

可以这样写：

| 价值方向 | 建议指标口径 |
|---|---|
| 科研操作效率 | 从研发目标输入到实验订单草稿生成的时间；人工跨模块点击 / 填表次数；一个 scientist 每周可推进的 Task 数 |
| 交付效率 | 一个 FDE 可同时支持的项目数；从客户需求到 workflow pack 初版的时间；定制开发需求中可由配置解决的比例 |
| 数据飞轮 | Trajectory 覆盖率；AI-Ready Dataset 生成数；Rollout Data 转成评测用例的数量；workflow 复用率 |
| 产研效率 | 新 Capability Command 接入时间；新增 Visual Component 时间；同类 CRUD / 表单变更由 Agent builder 完成的比例 |
| 执行准确率 | Workflow 成功率；审批驳回率；人工接手率；关键字段抽取准确率；单位换算错误率 |

示例表述：

> 第一阶段不直接承诺“效率提升 500%+”。建议把它拆成可验证指标：从目标输入到实验订单草稿的时间、人工跨模块操作次数、数据资产化时间、workflow 复用率和单 FDE 支持项目数。先用内部 dogfooding 和 2-3 个 pilot 建立基线，再对外使用更稳的提升数字。

---

## 7. 研发环节备忘录补充建议

当前研发备忘录方向对，但第 7 点“99.9%+”建议改得更可执行。

建议补成：

### 7.1 评测和优化

Approval 是安全阀，但不能代替执行准确率。团队需要建立三类评测：

- Flow Stability Eval：验证 workflow 是否能稳定运行，包括 CLI 成功率、重试成功率、审批暂停后恢复成功率、fallback 命中率。
- Data Analysis Eval：验证字段抽取、单位换算、Schema 映射、统计分析和模型指标是否正确。
- Writing / Knowledge Eval：验证报告事实性、引用覆盖率、术语一致性和建议可执行性。

建议第一阶段不要写“务必优化到 99.9%+”。可以改成：

> 对高频 workflow 建立通过率、人工接手率和审批驳回率基线。第一阶段先确保核心演示 workflow 稳定可复现，后续再按业务风险等级设定不同准确率目标。

### 7.2 可观测性

Agent 体验会被慢工具、慢网络、慢脚本拖垮。第一版就要记录：

- tool latency；
- script runtime；
- workflow completion time；
- 失败率；
- 重试次数；
- 人工接手次数；
- 审批等待时间；
- checkpoint 恢复成功率。

这些指标要能回到具体 Task、Pipeline Run、Skill、Capability Command 和旧系统接口，方便研发定位慢节点和失败节点。
