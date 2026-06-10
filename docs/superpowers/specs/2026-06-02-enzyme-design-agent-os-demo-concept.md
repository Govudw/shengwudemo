# Enzyme Design Agent OS Demo Concept

## 目标

新增一个面向工业酶设计的 mock Project 体验，用 BioMap OS + Agent OS 的方式展示酶设计从需求定义、模型设计、实验执行、结果分析到下一轮迭代的完整数字化闭环。

这个 Demo 面向类似安琪酵母这类发酵、生物制造、食品加工和工业生物技术企业的客户画像。文档不依赖某一家公司的真实内部业务，而是抽象出这类企业常见的酶研发和产业化需求：提高催化效率、适配工业工况、降低成本、缩短实验迭代周期，并把每轮实验数据沉淀成可复用的资产。

核心表达不是“AI 自动发明一个最优酶”，而是：

- Main Agent 把复杂研发流程组织成可追踪的 Project、Thread、Workflow、Asset 和 Approval。
- BioMap OS 原版功能提供项目管理、蛋白设计、智能实验和模型平台等可调用模块。
- 知识和数据层由新的 Agent-Managed Knowledge/Data Layer 接管：项目知识、历史实验、输入文件、分析结论和迭代记忆都在 Agent 的 Project/Thread 上下文中吸纳和组织，不依赖 BioMap OS 原版知识助手或数据平台作为主链路。
- 人类专家在目标设定、实验边界、异常解释和迭代决策中持续参与。
- 每一轮设计和实验结果都会沉淀为下一轮设计的上下文，而不是散落在表格、邮件和会议记录里。

## 已收敛的 Grill 决策

首版 Demo 使用以下决策作为实现边界：

- 场景选择：**工业工况适配型酶优化**，不是从零发现一个全新酶，也不是单纯活性预测。
- Mock 客户：面向食品发酵、酵母、生物制造类企业，但不绑定真实企业配方、真实产线或真实商业机密。
- 具体故事：以食品/发酵工艺中的弱酸、高温、高底物浓度条件为 mock 工况；酶类型可设为糖苷水解酶或淀粉糖化相关酶，但不声称对应某家客户真实业务。
- 首版信息架构：用 4 个完整 mock Thread，其中 1 个展示完整流程闭环，另外 3 个分别拆解设计、实验、分析结论三段流程。4 个 Thread 都按 19 轮完整对话设计，不做短摘要版。
- 项目对象一致性：4 个 Thread 共享同一套 Project Files、候选 ID、Experiment Order、Experiment Task、CRO Order、Experiment Result Package、Analysis Report 和 Iteration Decision Log；不同 Thread 只是同一项目对象的不同叙事视角。
- 人机协作：Agent 可以组织证据、生成候选、准备实验订单和分析结果，但目标权重、候选规模、实验提交、异常点处理、结论边界和下一轮方向都必须保留 human-in-loop。每条完整 Thread 包含 4-5 个 human-in-loop 节点，避免 Demo 显得 Agent 在无法验证的地方全自动判断。
- Run Inspector 深度：4 个 Thread 都使用完整 Run Inspector；全流程 Thread 和实验拆解 Thread 额外展示 Experiment Operational Records 索引，用来体现智能实验原版记录的可追溯性。
- Capability Run Replay 命名：优先使用 BioMap OS 原版模块前缀，例如 `ProteinDesign.*`、`ModelHub.*`、`SmartExperiment.*`；实验状态回放使用 `ExperimentTaskReplay.*`；实验后分析不伪装成原版数据中心能力，使用 Agent 数据层或分析能力命名。
- 项目落点：升级现有 `enzyme-discovery` seed project slot，把显示名从 `Enzyme Discovery` 改为 `Industrial Enzyme Design`，并用 4 条完整 Thread 替换原有 3 条轻量 placeholder Thread。
- 实现契约：每条 Thread 目标 19 轮 transcript、5 个 user turn、7 张 Scientific Figure、完整 Run Inspector 和 8-12 条 Capability Run Replay。
- UI block 契约：酶候选不能直接复用写死 `Kd` 表头的抗体候选表；新增 domain-neutral 的 `candidateEvidenceTable` block，展示 activity、kcat/Km proxy、Tm、pH window、expression risk、rationale 等酶相关 readouts。
- 原版系统结合：Agent OS 是 BioMap OS 原版执行型模块之上的编排层，不另起一套完全独立系统。
- 知识/数据边界：知识和数据的吸纳、分析、记忆由 Agent-Managed Knowledge/Data Layer 接管，不把 BioMap OS 原版知识助手或数据中心作为主链路。

## BioMap OS 原版功能边界

这个 Demo 的定位是 **Agent OS 编排 BioMap OS 原版执行型模块**，而不是重做一个独立酶设计平台。

沿用原版能力：

- `项目管理`：承载客户项目、成员、状态、里程碑、CRO 和实验进度概览。
- `蛋白设计`：承载酶相关序列、结构、资产树、3D/序列视图，以及 DISCOVER、FOLD、Editor、GEN、MOO、EVAL 风格的干实验设计入口。
- `智能实验`：承载分子注册、实验订单、实验任务、实验调度、CRO 订单、实验记录、库存、孔板、物料、设备和实验工作流。
- `模型平台 / Model Hub`：承载 xTrimo 平台模型调用、项目模型引用和模型资产展示。

不作为主链路依赖的原版能力：

- `知识助手`：不作为这个 Demo 的知识问答入口。Agent 自己吸纳项目知识、行业背景、SOP、历史结果和设计假设。
- `数据中心`：不作为这个 Demo 的数据沉淀和分析入口。Agent 自己管理 Project Files、AI-ready analysis tables、assumption logs、iteration memory 和分析报告。

谨慎使用的原版能力：

- `Model Builder`：可以作为未来扩展或 mock 展示的项目模型校准入口，但首版不要承诺自动 fine-tuning 已经完整打通。BioMap OS 原版资料中 Model Builder 的任务创建路径仍需验证。
- `Data Insight`：不要作为首版核心路径。实验后分析应在 Agent Thread 和 Agent-Managed Knowledge/Data Layer 中呈现。

因此文档后续所有“知识”“数据”“分析资产”的表达，都应优先落到 Agent-Managed Knowledge/Data Layer，而不是让用户跳转到 BioMap OS 原版知识助手或数据平台。

### 原版模块映射表

| Demo 能力 | BioMap OS 原版模块 | 原版承接点 | Agent OS 叠加 | 风险和边界 |
| --- | --- | --- | --- | --- |
| 客户项目组织 | 项目管理 | 项目、成员、状态、实验进度、CRO 概览 | 将 Thread、Run Inspector、交付物挂到同一 Project | 不把 Project 当成 Thread 或 Task |
| 酶序列/结构设计 | 蛋白设计 | 资产树、序列/结构视图、DISCOVER、FOLD、GEN、MOO、EVAL | 把多模型、多目标设计组织成 Thread 内的设计叙事和候选包 | 不声称原版已完整支持所有酶专用 pipeline，只展示可解释 mock replay |
| 模型调用 | 模型平台 / Model Hub | xTrimo 平台模型、模型列表、项目模型引用 | Main Agent 选择、组合、解释多个模型结果 | 不把模型分数写成机制证明或终局判断 |
| 项目模型校准 | 模型平台 / Model Builder | 项目模型/Model Builder 入口 | 作为未来或可选 mock 能力，用实验结果做校准建议 | 首版不承诺自动 fine-tuning 可真实执行 |
| 实验订单和执行 | 智能实验 | Experiment Order、Experiment Task、CRO Order、调度、记录 | Agent 从设计包生成订单草稿、解释状态、触发审批 | 订单提交必须经过 Approval Gate |
| 实验原始记录 | 智能实验 | 样本、物料、孔板、设备、线路、Workflow、过程记录 | Assets Workbench 后续可显示 Experiment Operational Records | 这些记录不是 Agent 分析结论 |
| 结果吸纳和分析 | Agent-Managed Knowledge/Data Layer | 不依赖原版数据中心 | 读取 Result Package，做 QC、拟合、共识评分、迭代记忆 | 不把 Data Center 写成主链路 |
| 知识问答和假设记忆 | Agent-Managed Knowledge/Data Layer | 不依赖原版知识助手 | 吸纳 SOP、历史结果、用户判断、假设 log | 不把 Knowledge Assistant 写成主入口 |
| 资产沉淀 | Assets Workbench + Project Files | 后续产品区承载 durable artifacts | 显示报告、设计包、结果包、Operational Records 索引 | Assets 还未完整设计，首版只定义信息架构 |

### 实验记录与 Agent 数据层的分工

智能实验仍然是实验执行系统和原始实验记录来源。酶设计 Demo 中的以下对象应映射到 BioMap OS 原版智能实验：

- 分子注册记录
- Experiment Order
- Experiment Task
- CRO Order
- 实验调度记录
- 实验记录
- 样本记录
- 样本库存记录
- 物料记录
- 物料库存记录
- 孔板记录
- 样本-孔板关联记录
- 设备记录
- 实验点位记录
- 实验线路记录
- Experiment Workflow 配置

Agent-Managed Knowledge/Data Layer 接管的是实验结果回收后的吸纳、理解、分析和迭代记忆：

- Experiment Result Package 的读取和摘要
- AI-ready analysis table
- curve fitting summary
- outlier policy
- assay QC interpretation
- model consensus result
- hypothesis log
- iteration decision log
- next-round design context

后续 Assets Workbench 设计时，可以把智能实验原版表记录作为 **Experiment Operational Records** 显示，例如设备表、物料表、孔板表、实验过程表、CRO 订单表和实验记录表。但这些记录在本 Demo 中主要作为可追溯的实验执行证据，不替代 Agent 自己管理的分析数据层。

## Demo Project 定位

Project：

`Industrial Enzyme Design`

中文可显示为：

`工业酶设计`

这个 Project 不应只是“酶模型展示页”，而应该是一个完整研发项目容器，包含设计、实验、分析、结论和下一轮迭代。

### 现有项目落点

当前 mock data 中已经存在一个轻量占位项目：

- project id：`enzyme-discovery`
- display name：`Enzyme Discovery`
- placeholder Threads：`enzyme-family`、`screening-plan`、`enzymekcat`

首版实现不新增第二个酶项目，直接升级现有 `enzyme-discovery` project slot：

- 保留 project id `enzyme-discovery`，降低本地持久化状态和测试更新风险。
- 将 display name 改为 `Industrial Enzyme Design`。
- 删除或替换原有 3 条 placeholder Thread，不在首版 sidebar 同时展示旧的 `Enzyme Discovery` 轻量内容。
- 新增 4 条完整 mock Thread，全部属于同一个 `enzyme-discovery` Project。

这样 sidebar 不会同时出现 `Enzyme Discovery` 和 `Industrial Enzyme Design` 两个酶项目，也不会让用户误以为这是两个独立研发线。

### Seed persistence 迁移

当前 store 会把持久化项目和当前 seed 合并，并保留“当前 seed 中找不到的旧 Thread”。这对用户自建 Thread 是正确的，但会导致旧的 enzyme placeholder Thread 在本地状态里残留。

实现时需要增加一个窄范围迁移规则：

- 当 `enzyme-discovery` 升级为 `Industrial Enzyme Design` 时，移除这些已知旧 seed placeholders：`enzyme-family`、`screening-plan`、`enzymekcat`。
- 不移除用户自建 Thread，也不移除其他 Project 的旧内容。
- 可以通过专门的 obsolete seed id allowlist 实现，不要写成“删除所有 current seed 中不存在的 Thread”。
- `selectedThreadId` 如果指向被移除的旧 placeholder，应回到 `New Thread Draft`，保持默认首页不展示任何 mock Thread。
- 测试需要覆盖同版本 persisted state 中旧 enzyme placeholders 被清理、用户自建 Thread 保留、4 条新 enzyme Thread 自动补齐。

### 具体 mock 工况

首版不要只写“工业酶”，需要固定一个足够具体、但不绑定真实客户机密的工况：

- Parent enzyme：`ENZ-P0`，一个 GH15-like 糖苷水解酶 / 淀粉糖化相关酶 parent。
- 目标反应：食品/发酵工艺中的麦芽糊精或可溶性淀粉底物转化。
- 工况窗口：pH 4.5，58-62 C，高底物浓度，2 小时反应窗口。
- 表达体系：yeast-compatible secretion host，用于表达可行性和生产成本评估。
- 首轮库规模：48 variants，分为活性位点微调、稳定性增强、工况适配、组合突变和 rollback controls。
- 主要 readouts：relative activity、kcat/Km proxy、pH profile、temperature profile、60 C half-life、expression titer、purity/aggregation、substrate panel。

首版成功标准是找到“值得进入下一轮的设计方向”，不是找到最优工业酶：

- `ENZ-MUT-021`：热稳定性和 60 C half-life 信号较稳，但活性提升中等。
- `ENZ-MUT-033`：弱酸高温工况适配信号较稳，表达风险可控。
- `ENZ-MUT-007`：室温活性高，但 thermal margin 和表达风险不适合直接推进。
- `ENZ-MUT-046`：模型分数高但 wet-lab readout 分歧大，只能作为假设保留。

下一轮建议停在 human review：围绕 `ENZ-MUT-021` 和 `ENZ-MUT-033` 两个方向设计 24 个保守组合变体，不自动提交新实验。

## 目标客户画像

目标客户是有真实产业化压力的工业生物技术公司。典型场景包括食品加工、发酵生产、营养健康、饲料、烘焙、酿造、生物催化或原料转化。

这类客户关心的不只是序列活性，还包括：

- 在目标底物上的催化效率，例如 kcat、Km、kcat/Km。
- 在工业工况下的表现，例如温度、pH、盐、糖、乙醇、金属离子、抑制物。
- 表达和生产可行性，例如宿主表达量、分泌效率、纯化难度、发酵成本。
- 稳定性和货架期，例如热稳定性、蛋白酶耐受、配方稳定性。
- 质量和合规，例如批间一致性、数据可追溯、实验 SOP、审批记录。
- 研发管理，例如跨团队协作、实验排期、CRO 管理、数据复用和项目里程碑。

因此这个 Demo 的重点应该是“研发闭环管理 + AI 辅助设计”，不是单点模型预测。

## Demo 主线

首版使用一个具体但不绑定真实商业机密的故事：

> 为食品发酵工艺设计一组更适合弱酸、高温和高底物浓度条件的候选酶。目标是在保持表达可行性的前提下，提高底物转化效率并增强热稳定性。

叙事主线：

1. 用户上传历史酶库、工艺条件和 assay SOP。
2. Main Agent 总结目标：活性、稳定性、工况适配和表达成本四目标。
3. Main Agent 发现历史数据不足以直接训练强预测模型，只适合做 evidence-guided design。
4. Main Agent 调用 xTrimo 平台模型和项目内 Oracle，生成候选设计空间。
5. 用户修正目标：工业工况稳定性优先级高于室温最高活性。
6. Main Agent 收敛成 48 或 96 个候选酶设计。
7. Main Agent 生成 `Enzyme_Candidate_Design_Package.md`。
8. 用户确认预算、候选数量和 assay panel。
9. Main Agent 生成 `Enzyme_Experiment_Order_Draft.md`。
10. 用户审批提交。
11. Main Agent 回放实验执行和结果回收。
12. Main Agent 做 Preset QC Check。
13. Main Agent 做曲线拟合和多模型分析。
14. 用户确认异常点处理和结论边界。
15. Main Agent 输出分析报告和下一轮迭代建议。
16. 用户确认下一轮只推进两个设计方向，不直接提交新实验。

## 首版 Thread 结构

首版放 4 个完整 mock Thread，但它们不是 4 个互相独立的项目，而是 **1 个完整流程 Thread + 3 个拆解 Thread**。每个 Thread 都按 19 轮完整对话设计，配套 Run Inspector、Capability Run Replay、human-in-loop 节点、输出物和 mock 科学图。这样首页侧边栏既能直接展示一个完整 Demo，也能让用户点进每个关键环节看更细的 pipeline、工具调用、human-in-loop 和输出物。

1. `工业酶设计全流程闭环`
2. `设计拆解：目标定义与候选生成`
3. `实验拆解：酶库订单与执行回收`
4. `分析拆解：结果解释与迭代结论`

稳定 seed IDs：

| Thread title | Thread id | Transcript contract |
| --- | --- | --- |
| `工业酶设计全流程闭环` | `enzyme-full-loop` | 19 turns，5 user turns，7 Scientific Figures |
| `设计拆解：目标定义与候选生成` | `enzyme-design-breakdown` | 19 turns，5 user turns，7 Scientific Figures |
| `实验拆解：酶库订单与执行回收` | `enzyme-experiment-execution` | 19 turns，5 user turns，7 Scientific Figures |
| `分析拆解：结果解释与迭代结论` | `enzyme-analysis-iteration` | 19 turns，5 user turns，7 Scientific Figures |

第 1 个 Thread 负责演示从一句需求到下一轮迭代建议的完整闭环。第 2 到第 4 个 Thread 是同一个项目的深挖视角，不是另一个重复项目；它们可以引用全流程 Thread 中出现的同一批 Project Files、Experiment Order、Experiment Result Package 和 Analysis Report。为避免重复，4 个 Thread 的叙事焦点必须错开：全流程 Thread 展示端到端闭环，设计拆解 Thread 展示干实验和模型证据，实验拆解 Thread 展示智能实验和执行记录，分析拆解 Thread 展示实验后模型分析和迭代结论。

### Transcript 和 block 契约

4 条 Thread 都是完整 mock，不是摘要 Thread。后续实现时应用测试固定这些契约：

| Thread id | Turns | User turns | Scientific Figures | Capability Run Replay | Human Confirmation | Approval Request | Elapsed Work Replay | 特殊 block |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `enzyme-full-loop` | 19 | 5 | 7 | 10-12 | 4 | 1 | 2 | Experiment Order Draft、Result Package Project Files、Operational Record Index |
| `enzyme-design-breakdown` | 19 | 5 | 7 | 10-12 | 5 | 0 | 0 | Candidate Evidence Table、Design Package Project Files |
| `enzyme-experiment-execution` | 19 | 5 | 7 | 10-12 | 4 | 1 | 2 | Experiment Order Draft、Operational Records、Result Package Project Files |
| `enzyme-analysis-iteration` | 19 | 5 | 7 | 10-12 | 4 | 1 | 0 | Candidate Evidence Table、analysis-ready table、report release |

当前代码里的 `candidateMoleculeTable` 组件表头包含 `Kd`，这是抗体语境。酶设计 Demo 不应硬套这个表头。实现时应新增 `candidateEvidenceTable` block，用于 enzyme activity、kcat/Km proxy、Tm、pH window、expression risk、model disagreement 和 rationale。保留旧的 `candidateMoleculeTable` 不动，避免影响现有抗体 mock Thread。

`candidateEvidenceTable` 不能表现为“单分数选出最优酶”。它应该展示多 readout evidence 和风险标签。

### 测试契约

后续实现应先写 seed contract tests，再写 mock data：

- `Industrial Enzyme Design` 使用 project id `enzyme-discovery`，display name 为 `Industrial Enzyme Design`。
- `enzyme-discovery` 下只包含 4 条新 seed Thread，不再包含 `enzyme-family`、`screening-plan`、`enzymekcat`。
- 初始状态仍然是 `selectedThreadId === null` 和 `isDraftingNewThread === true`。
- 4 条 Thread 都是 19 turns、5 user turns、7 Scientific Figures。
- 4 条 Thread 都引用 canonical objects，例如 `ENZ-LIB-20260602-048`、`BM-LAB-ENZ-20260602-001`、`ENZ-EXPTASK-20260602-001`、`Enzyme_Experiment_Result_Package.xlsx`。
- `enzyme-design-breakdown` 和 `enzyme-analysis-iteration` 使用 `candidateEvidenceTable`，不使用抗体专用 `candidateMoleculeTable`。
- `enzyme-full-loop` 和 `enzyme-experiment-execution` 含有 `experimentOrderDraft`、`approvalRequestReplay`、`elapsedWorkReplay` 和 Operational Records 相关 outputs。
- 每条 Thread 的 Run Inspector 都有 summary、7-9 progress steps、outputs、approvals 和 8-12 capability runs。
- capability run names 不包含 `DataCenter.*`、`KnowledgeAssistant.*`、`PredictBestEnzyme.*`、`ProveMechanism.*` 或 `AutoSelectLead.*`。
- persisted old enzyme placeholders 会被清理，但用户自建 Thread 保留。

### 共享项目对象集

4 个 Thread 必须共享同一套项目对象，后续实现时应在 seed data 中把这些 ID 和文件名保持一致：

| 对象类型 | Canonical object |
| --- | --- |
| Project | `Industrial Enzyme Design` / `工业酶设计` |
| baseline enzyme | `ENZ-P0` |
| candidate library | `ENZ-LIB-20260602-048` |
| selected candidates | `ENZ-MUT-001` 至 `ENZ-MUT-048` |
| design brief | `Enzyme_Industrial_Design_Brief.md` |
| design package | `Enzyme_Candidate_Design_Package.md` |
| experiment order | `BM-LAB-ENZ-20260602-001` |
| experiment task | `ENZ-EXPTASK-20260602-001` |
| CRO order | `CRO-ENZ-20260602-001` |
| plate map | `ENZ-PLATEMAP-20260602-001.csv` |
| result package | `Enzyme_Experiment_Result_Package.xlsx` |
| QC and curve summary | `Enzyme_Curve_Fit_and_QC_Summary.xlsx` |
| analysis report | `Enzyme_Post_Experiment_Analysis_Report.md` |
| consensus table | `Enzyme_Candidate_Consensus_Score_Table.csv` |
| iteration log | `Enzyme_Iteration_Decision_Log.md` |
| operational record index | `Enzyme_Operational_Record_Index.csv` |
| figure bundle | `Enzyme_Analysis_Figure_Bundle.png` |

Thread 可以选择性展示这些对象，但不能改名、改 ID 或创造彼此冲突的替代对象。拆解 Thread 如果需要更细的中间文件，可以追加辅助对象，但必须能追溯到这套 canonical objects。

### Human-in-loop 密度

4 个完整 Thread 都应保留 4-5 个 human-in-loop 节点。这里的 human-in-loop 分成两类：

- **Human Confirmation**：轻量确认，用于目标权重、候选边界、异常处理、结论边界和下一轮方向。
- **Approval Request**：正式审批，用于提交 Experiment Order、发布客户报告、注册公共资产或更新 Project Oracle。

每条 Thread 的分布：

| Thread | Human-in-loop 节点 | 用途 |
| --- | --- | --- |
| `工业酶设计全流程闭环` | 5 个 | 目标权重、候选规模、Experiment Order 审批、outlier policy、下一轮方向 |
| `设计拆解：目标定义与候选生成` | 4-5 个 | 工业约束、目标函数权重、突变空间、control 分组、候选包确认 |
| `实验拆解：酶库订单与执行回收` | 4-5 个 | assay panel、预算周期、Experiment Order 审批、异常批次处理、结果包接收 |
| `分析拆解：结果解释与迭代结论` | 4-5 个 | outlier policy、模型分歧处理、结构假设边界、结论发布、迭代方向 |

这些节点不应只是“用户说 OK”。每个节点都要让用户对真实研发风险做一个小判断，例如牺牲最高活性换稳定性、是否排除异常 replicate、是否扩大候选库、是否把结构解释降级为 hypothesis。

### Thread 1：工业酶设计全流程闭环

这个 Thread 是 Demo 的主入口。它展示客户如何用一句产业化目标启动完整 Agent OS 流程：

> 为食品发酵工艺设计一组更适合弱酸、高温和高底物浓度条件的候选酶。目标是在保持表达可行性的前提下，提高底物转化效率并增强热稳定性。

主线应该压缩展示完整链路：

1. 用户上传历史酶库、工艺条件和 assay SOP。
2. Main Agent 将目标拆成活性、稳定性、工况适配、表达成本四个目标。
3. 用户修正目标权重，例如工业工况稳定性优先于室温最高活性。
4. Main Agent 调用蛋白设计和模型平台能力，生成候选设计空间。
5. 用户确认首轮候选规模和 controls。
6. Main Agent 生成 `Enzyme_Candidate_Design_Package.md`。
7. Main Agent 生成 `Enzyme_Experiment_Order_Draft.md`。
8. 用户审批提交 Experiment Order。
9. Main Agent 回放 Experiment Task、CRO Order、plate map、实验异常和结果回收。
10. Main Agent 读取 `Enzyme_Experiment_Result_Package.xlsx`。
11. Main Agent 完成 Preset QC Check、曲线拟合、多模型共识分析。
12. 用户确认 outlier policy 和结论边界。
13. Main Agent 输出分析报告和下一轮迭代建议。
14. 用户确认下一轮推进方向，但不自动提交新实验。

这个 Thread 的价值是“看完就懂 BioMap OS + Agent OS 如何跑完整酶设计闭环”。它仍然是完整 19 轮对话，但每个环节只展开到足以理解决策流，不抢拆解 Thread 的深度。

主要输出：

- `Enzyme_Industrial_Design_Brief.md`
- `Enzyme_Candidate_Design_Package.md`
- `Enzyme_Experiment_Order_Draft.md`
- `Enzyme_Experiment_Result_Package.xlsx`
- `Enzyme_Post_Experiment_Analysis_Report.md`
- `Enzyme_Iteration_Decision_Log.md`

Human-in-loop 节点：

- 确认工业目标权重。
- 确认候选数量、预算和 control 设计。
- 审批 Experiment Order。
- 确认 outlier policy。
- 确认下一轮迭代方向。

### Thread 2：设计拆解：目标定义与候选生成

这个 Thread 深挖设计环节，展示 BioMap OS 的蛋白设计和模型平台能力如何被 Main Agent 编排。

用户从产业化目标开始：

> 设计一个更耐高温、适配弱酸 pH、对目标底物转化率更高的候选酶，要求可以进入小试验证。

Main Agent 首先把目标拆成可执行的研发约束：

- 酶类型：糖苷水解酶或淀粉糖化相关酶。
- 底物和反应体系：底物结构、杂质、工艺条件、反应时间。
- 成功指标：活性、选择性、稳定性、表达、成本、工艺窗口。
- 实验边界：候选数量、可用宿主、可用 assay、预算和周期。
- 数据输入：历史酶库、同源序列、结构、文献、历史实验结果、工艺 SOP。

Main Agent 读取 Project Files 和 Assets：

- `enzyme_baseline_activity.xlsx`
- `industrial_process_conditions.md`
- `substrate_panel.csv`
- `enzyme_family_sequences.fasta`
- `known_structure_or_model.pdb`
- `assay_sop.pdf`

然后组织一组设计分析：

- 同源序列检索和家族聚类，对应 DISCOVER 风格能力。
- 结构预测和复合物/口袋观察，对应 FOLD 和结构视图。
- 活性位点、底物口袋、保守位点和可变区分析。
- pH / 温度 / 蛋白酶耐受预测。
- kcat / Km 或活性 proxy 预测。
- 表达风险、疏水性、自然度、可制造性评估。
- 多目标 Pareto 排序，对应 MOO / EVAL 风格能力。

可调用或 mock replay 的模型资产可以包括：

- `xTrimoEnzymeKcat`
- `xTrimoEnzymeTm`
- `xTrimoEnzymePH`
- `xTrimoStability`
- `xTrimoFold`
- `xTrimoHydro`
- `xTrimoNaturalness`
- 项目内 `Enzyme Activity Oracle`

设计输出应该是候选设计空间，而不是单一“答案”：

- 12 个活性位点微调候选。
- 12 个稳定性增强候选。
- 12 个工况适配候选。
- 12 个组合突变和 rollback controls。

最终生成 `Enzyme_Candidate_Design_Package.md`，包含：

- 候选酶列表
- 设计 rationale
- 风险标签
- assay panel
- controls
- 决策标准

Human-in-loop 节点：

- 用户确认目标权重，例如“60 C 下 2 小时稳定性优先于室温最高活性”。
- 用户确认实验预算和首轮候选规模，例如 48 个候选而不是 384 个候选。
- 用户确认是否保守推进还是扩大突变空间。
- 用户确认 control 分组和 rollback candidates。
- 用户指出模型没有覆盖的业务约束，例如某些表达体系或法规限制。

这里要明确：Main Agent 是把多个模型和历史证据组织成实验设计，不声称准确预测产业化最优酶。

### Thread 3：实验拆解：酶库订单与执行回收

这个 Thread 深挖实验环节，展示 BioMap OS 智能实验如何把设计包转成可审批、可执行、可回收数据的实验流程。

Main Agent 基于 `Enzyme_Candidate_Design_Package.md` 创建 `Enzyme_Experiment_Order_Draft.md`：

- DNA 合成或突变构建。
- 表达宿主和载体。
- 小规模表达和纯化。
- 标准活性 assay。
- kcat / Km 或反应速率测定。
- pH profile。
- temperature profile。
- 热稳定性和半衰期。
- 工艺条件 stress test。
- substrate specificity panel。
- controls 和 replicates。

用户确认预算、周期、候选数量和 assay 范围后，Main Agent 发起 Approval Request。审批通过后，Experiment Order 进入智能实验执行。

实验执行可以走内部实验平台或 CRO：

- 样本和 plate map 生成。
- 实验方法和 SOP 锁定。
- 物料和仪器检查。
- Experiment Task 分配。
- CRO Order 跟踪。
- 实验进度回放。
- 异常提醒，例如表达失败、plate edge effect、底物批次问题。
- 结果文件回收。

返回内容形成 `Enzyme_Experiment_Result_Package.xlsx` 和配套文件：

- raw activity table
- kinetics fitting table
- pH / temperature profile
- expression and purification QC
- stability assay result
- substrate specificity matrix
- experiment QC report
- figure bundle

这一阶段的价值是管理实验执行和数据回收，不做机制解释和下一轮设计。

实验执行阶段的原始状态和资源记录归属于 BioMap OS 智能实验；Agent 在 Thread 中只做编排、摘要和状态解释。后续如果 Assets Workbench 展示设备表、样本表、孔板表、实验过程表等记录，应把它们作为可追溯的 Experiment Operational Records，而不是 Agent 生成的分析结论。

Human-in-loop 节点：

- 用户确认 assay panel 和 readout 优先级。
- 用户批准 Experiment Order Draft 才能提交。
- 用户确认 CRO、周期、成本和 assay 范围。
- 用户决定是否接受异常批次继续进入分析。
- 用户确认 Experiment Result Package 可以进入分析 Thread。

### Thread 4：分析拆解：结果解释与迭代结论

这个 Thread 深挖实验结果回来之后的纯分析流程。Main Agent 读取 `Enzyme_Experiment_Result_Package.xlsx`，先做 Preset QC Check，再做多模型分析。

分析内容包括：

- 文件完整性和 assay completeness。
- replicate consistency。
- outlier 和 plate effect 检查。
- 酶活曲线拟合。
- kcat / Km / kcat/Km 估计。
- pH 和温度响应曲线拟合。
- 热稳定性半衰期估计。
- 表达量、纯度和活性之间的 trade-off。
- 多目标 consensus scoring。
- 与设计假设的对照。
- 不确定性和 sensitivity analysis。

分析输出应该分层：

- `Observed result`：实验直接支持的结果。
- `Model-supported pattern`：多个模型共同支持但仍有不确定性的模式。
- `Hypothesis`：对活性位点、底物口袋或稳定性变化的假设性解释。
- `Human decision required`：是否推进、是否补实验、是否进入下一轮设计。

最终生成：

- `Enzyme_Post_Experiment_Analysis_Report.md`
- `Enzyme_Candidate_Consensus_Score_Table.csv`
- `Enzyme_Curve_Fit_and_QC_Summary.xlsx`
- `Enzyme_Iteration_Decision_Log.md`
- `Enzyme_Analysis_Figure_Bundle.png`
- `Enzyme_Operational_Record_Index.csv`

下一轮迭代是这个 Demo 的关键。工业酶设计通常不是一轮完成，而是多轮实验和模型更新。

Main Agent 应将分析结果转化为下一轮可执行输入：

- 保留有效设计方向。
- 降权失败突变类型。
- 标记 assay 噪声和数据缺口。
- 更新目标函数权重。
- 更新 Project Asset 和 Data Asset。
- 生成下一轮 `Experiment Design Package` 草案。
- 如数据量足够，只提出 Project Model / Oracle 校准建议，不默认执行自动 fine-tuning。

下一轮设计不应自动提交。它应该停在 human review：

- 是否继续同一酶家族。
- 是否扩大同源搜索。
- 是否切换宿主或表达体系。
- 是否增加工况 stress test。
- 是否进入中试前验证。

Human-in-loop 节点：

- 用户确认 outlier policy。
- 用户确认模型分歧处理方式，例如是否降权与 wet-lab readout 冲突的模型。
- 用户确认哪些结论只是模型支持的假设，哪些结论可用于下一轮设计。
- 用户确认分析报告是否可以作为客户可见交付物。
- 用户选择下一轮推进方向，但不让 Agent 直接提交新实验订单。

## Agent OS 产品结构

### Project

`工业酶设计` 是长期业务容器，代表客户的一条酶设计研发线。

Project 内保存：

- 目标和里程碑
- Threads
- Project Files
- Data Assets
- Model Assets / Oracles
- Experiment Orders
- Experiment Result Packages
- Analysis Reports
- Approval history

### Run Inspector

每个 Thread 的右侧 Run Inspector 负责呈现用户可理解的运行状态：

- 当前阶段，例如目标定义、候选生成、订单草稿、实验回收、结果分析。
- 已完成的 Capability Run Replay，例如 `DISCOVER.homologSearch`、`FOLD.structureModel`、`MOO.rankCandidates`、`SmartExperiment.createOrderDraft`。
- 需要确认的 Human Confirmation。
- 需要正式审批的 Approval Request。
- 输出物列表和下载入口。
- 风险、限制和未完成项。

Run Inspector 不是系统 trace，也不是持久 Task 日志。它应该把复杂 pipeline 压缩为可审计、可理解的高层状态。

首版酶设计 Demo 的 Run Inspector 采用增强版：

- 每条 Thread 都有 `summary`，包含 stage、status、completedSteps、totalSteps、outputCount 和 pendingCount。
- 每条 Thread 都有 7-9 个 progress steps，并与 transcript 中的关键过程对应。
- 每条 Thread 都有 outputs，至少覆盖本 Thread 的主要 Project Files、reports、figures 或 experiment objects。
- 每条 Thread 都有 approvals，区分 Human Confirmation 和 Approval Request。
- 每条 Thread 都有 8-12 条 capability runs，并与 transcript 中的 Capability Run Replay 一一呼应。
- capability runs 的命名要体现原版模块边界，例如 `ProteinDesign.discoverHomologs`、`ProteinDesign.foldStructure`、`ModelHub.scoreCandidates`、`SmartExperiment.createOrderDraft`、`ExperimentTaskReplay.syncStatus`、`SmartExperiment.evaluatePresetQc`。
- capability run output 里可以包含 mock ID、文件名、状态和摘要，但不要伪装成真实系统 trace。

### Capability Run Replay 命名边界

Capability Run Replay 的命名要让用户看出 Agent 正在编排 BioMap OS 原版能力，而不是随便创造一组工具名。命名优先使用原版模块前缀：

| 前缀 | 用途 | 示例 |
| --- | --- | --- |
| `ProjectManagement.*` | 项目、成员、里程碑、CRO 概览 | `ProjectManagement.updateMilestone` |
| `ProteinDesign.*` | 蛋白设计工作台相关设计动作 | `ProteinDesign.discoverHomologs`、`ProteinDesign.foldStructure`、`ProteinDesign.rankMooCandidates` |
| `ModelHub.*` | 平台模型或项目模型调用 | `ModelHub.scoreKcatTmPh`、`ModelHub.compareNaturalness` |
| `SmartExperiment.*` | 智能实验对象创建和执行准备 | `SmartExperiment.createOrderDraft`、`SmartExperiment.generatePlateMap`、`SmartExperiment.lockWorkflow` |
| `ExperimentTaskReplay.*` | Thread 内实验任务状态回放 | `ExperimentTaskReplay.syncStatus`、`ExperimentTaskReplay.importResultPackage` |
| `AgentDataLayer.*` | Agent-Managed Knowledge/Data Layer 的吸纳、分析和记忆 | `AgentDataLayer.buildAnalysisReadyTable`、`AgentDataLayer.saveIterationMemory` |
| `AnalysisWorkflow.*` | 实验后分析流程 | `AnalysisWorkflow.fitKineticsCurves`、`AnalysisWorkflow.runSensitivityAnalysis` |

禁止使用的命名方式：

- 不使用 `DataCenter.*` 或 `KnowledgeAssistant.*`，因为这个 Demo 的知识和数据主链路不依赖 BioMap OS 原版知识助手或数据中心。
- 不使用过强结论名称，例如 `PredictBestEnzyme.run`、`ProveMechanism.run`、`AutoSelectLead.run`。
- 不把 `ExperimentTaskReplay.*` 写成真实后台 trace。它只是 Thread 中对智能实验执行状态的用户可见 replay。
- 不把 `AgentDataLayer.*` 写成 BioMap OS 原版模块。它是 Agent 管理项目知识、分析数据和迭代记忆的层。

增强 Run Inspector 还要显示 Experiment Operational Records 索引，但只在合适的 Thread 展开：

| Thread | Run Inspector 深度 | Operational Records 展示 |
| --- | --- | --- |
| `工业酶设计全流程闭环` | 完整 Run Inspector | 展示精简索引：Experiment Order、Experiment Task、CRO Order、plate map、result package、operational record index |
| `设计拆解：目标定义与候选生成` | 完整 Run Inspector | 不展开实验执行记录，只引用 design package 和候选库 |
| `实验拆解：酶库订单与执行回收` | 完整 Run Inspector + operational records | 展示样本、物料、孔板、设备、实验线路、workflow、调度、CRO、过程记录索引 |
| `分析拆解：结果解释与迭代结论` | 完整 Run Inspector | 引用 operational record index 作为数据 lineage，不把它当分析结论 |

Operational Records 在 Run Inspector 中应作为可追溯的实验执行证据出现，例如：

- `sample_records_ENZ-EXPTASK-20260602-001.csv`
- `material_lot_records_ENZ-EXPTASK-20260602-001.csv`
- `plate_records_ENZ-PLATEMAP-20260602-001.csv`
- `device_records_ENZ-EXPTASK-20260602-001.csv`
- `experiment_workflow_record_ENZ-EXPTASK-20260602-001.md`
- `cro_tracking_CRO-ENZ-20260602-001.csv`
- `experiment_process_log_ENZ-EXPTASK-20260602-001.md`
- `Enzyme_Operational_Record_Index.csv`

这些记录可以在 Thread 中通过 Project File、Run Inspector output 或科学运营图呈现。它们不替代 Agent-Managed Knowledge/Data Layer 中的 analysis-ready table、curve fitting summary、model consensus result 或 iteration memory。

### Assets

Project 中会逐步沉淀：

- AI-Ready Dataset：历史酶活数据、实验结果矩阵、工艺条件表。
- Model Asset：项目内活性预测头、稳定性评估模型。
- Oracle：综合活性、稳定性、表达和工艺适配性的决策模型。
- Experiment Asset：Experiment Order、Experiment Task、CRO Order、plate map、sample record。
- Experiment Operational Records：设备、样本、物料、孔板、实验线路、工作流、实验调度、实验过程和 CRO 跟踪等原版智能实验记录，后续由 Assets Workbench 展示。
- File Asset：设计包、报告、图集、SOP。

### Workflows / Pipelines

可表达为几个可复用 Workflow：

- `Enzyme Design Workflow`
- `Enzyme Library Experiment Workflow`
- `Experiment Result Analysis Workflow`
- `Model-to-Oracle Calibration Workflow`
- `CRO Experiment Orchestration Workflow`

在 Demo 里，Main Agent 可以显示 Capability Run Replay，但不要把所有细节都说成真实后端执行。当前仍是 mock replay。

### Approvals

需要正式 Approval Request 的场景：

- 提交 Experiment Order。
- 将分析结果发布给客户或跨项目共享。
- 将 Project Dataset 注册为公共 Data Asset。
- 发布或更新 Project Oracle。

轻量 Human Confirmation 的场景：

- 确认设计目标权重。
- 确认候选数量和预算。
- 确认 outlier 处理方式。
- 确认下一轮迭代方向。

## 需要生成的 mock 科学图

这个 Demo 优先追求仿真感，不按图片生产成本收敛。4 个完整 Thread 每条目标 7 张 Scientific Figure，整体 28 张图。图片可以由 imagegen 生成后作为静态 PNG 引入，但必须保持科研报告风格，不做营销海报、品牌宣传图或装饰性背景图。

图片资产目录固定为：

`src/assets/mock-science/enzyme/`

所有 enzyme Demo 的 Scientific Figure 都放在这个目录下，不分散到 `mock-biomap-os` 或其他项目目录。

每张图都应该回答一个具体研发问题，而不是只增加视觉密度：

- 结构图回答“突变位点、底物口袋或稳定性界面在哪里”。
- 数据图回答“实验 readout、模型分数、QC 或不确定性如何分布”。
- 运营图回答“Experiment Order、Experiment Task、CRO、样本、孔板、设备和结果包如何流转”。
- 决策图回答“为什么要停下来让人确认，而不是让 Agent 自动推进”。

### Thread 1 图像：工业酶设计全流程闭环

目标 7 张图，覆盖端到端全链路：

- `enzyme-full-loop-project-map.png`：从需求、设计、实验、分析到下一轮迭代的 Project lineage 图。
- `enzyme-industrial-objective-tradeoff.png`：活性、热稳定性、pH、表达成本四目标 trade-off 图。
- `enzyme-candidate-library-overview.png`：`ENZ-LIB-20260602-048` 候选分组概览。
- `enzyme-order-to-task-flow.png`：`BM-LAB-ENZ-20260602-001` 到 `ENZ-EXPTASK-20260602-001` 的执行流。
- `enzyme-result-package-summary.png`：`Enzyme_Experiment_Result_Package.xlsx` 结果包组成。
- `enzyme-consensus-and-iteration-summary.png`：多模型共识结果和下一轮方向摘要。
- `enzyme-human-gates-map.png`：全流程 human-in-loop 节点地图。

### Thread 2 图像：设计拆解

目标 7 张图，重点展示干实验设计和模型证据：

- `enzyme-family-clustering.png`：酶家族和同源序列聚类图。
- `enzyme-active-site-pocket-map.png`：活性位点 / 底物口袋结构图。
- `enzyme-conserved-and-mutable-sites.png`：保守位点、可变位点和不可触碰位点图。
- `enzyme-mutation-design-map.png`：候选突变位点设计图。
- `enzyme-model-score-panel.png`：kcat、Tm、pH、naturalness、expression risk 多模型评分面板。
- `enzyme-pareto-ranking.png`：多目标 Pareto ranking 图。
- `enzyme-library-design-matrix.png`：48 variant library matrix 和 rollback controls。

### Thread 3 图像：实验拆解

目标 7 张图，重点展示智能实验和执行记录：

- `enzyme-experiment-order-draft.png`：Experiment Order Draft 摘要视图。
- `enzyme-assay-panel-design.png`：activity、kinetics、pH profile、temperature profile、stress test 的 assay panel。
- `enzyme-plate-map.png`：96-well 或 384-well plate map。
- `enzyme-sample-material-device-flow.png`：样本、物料、设备、实验线路和 workflow 记录流转图。
- `enzyme-cro-task-status.png`：CRO Order 和 Experiment Task 状态回放图。
- `enzyme-experiment-anomaly-log.png`：表达失败、plate edge effect、底物批次问题等异常记录图。
- `enzyme-result-ingestion-checklist.png`：结果文件导入和 Result Package completeness 图。

### Thread 4 图像：分析拆解

目标 7 张图，重点展示实验后分析、模型分歧和迭代结论：

- `enzyme-result-package-qc-overview.png`：文件完整性、assay completeness、replicate consistency QC overview。
- `enzyme-kinetics-curve-fitting.png`：酶活曲线和 kinetics fitting 图。
- `enzyme-ph-temperature-profile.png`：pH / temperature profile heatmap。
- `enzyme-stability-half-life.png`：热稳定性半衰期和 stress condition survival 图。
- `enzyme-model-consensus-matrix.png`：多模型 consensus score matrix。
- `enzyme-uncertainty-sensitivity-analysis.png`：outlier、模型权重、阈值变化的 sensitivity analysis。
- `enzyme-iteration-decision-tree.png`：下一轮迭代 decision tree。

### 图像质量边界

- 图应像科研报告、实验运营报表或分析结果图，不像网页 hero、营销 banner 或抽象插画。
- 图中可出现少量清晰英文标签和 ID，但不要依赖大量小字传递关键信息。
- 图需要和 canonical objects 对齐，例如候选 ID、订单 ID、结果包文件名不能自造另一套。
- 结构解释图必须标注为 hypothesis 或 model-supported pattern，不能暗示机制已经被证明。
- 实验运营图必须区分 Experiment Order、Experiment Task、CRO Order、Experiment Operational Records 和 Project Files。
- 分析图必须保留 uncertainty、confidence、outlier 或 sensitivity 信息，避免单一 winner 图。

## 不应承诺的内容

这个 Demo 必须避免以下误导：

- 不说 BioMap OS 能一次性准确预测最优工业酶。
- 不把结构模型解释说成机制证明。
- 不把 single score 当成项目自动决策。
- 不跳过人类专家对目标、预算、异常点和下一轮方向的判断。
- 不把 Experiment Result Package 自动等同于 Asset，除非后续明确注册。
- 不把 Experiment Task 说成 Main Agent 的 Task。
- 不说 BioMap OS 原版知识助手或数据中心是这个 Demo 的主知识/数据链路。
- 不说 Model Builder 已经自动完成项目 fine-tuning，除非后续真实功能确认。
- 不说 Assets Workbench 已经完成实验表全量设计；目前只定义后续展示 Experiment Operational Records 的方向。

正确叙事是：

> BioMap OS 把酶设计的知识、数据、模型、实验和管理动作组织成一个可追踪、可复用、可迭代的 Agent OS 闭环。它让专家更快地看清证据、提出设计、执行实验、解释结果和进入下一轮，而不是替代专家做不可验证的终局判断。

## 第一版 Demo 成功标准

第一版如果实现，应满足：

- 将现有 `enzyme-discovery` project slot 升级为 `Industrial Enzyme Design`，不额外新增第二个酶项目。
- Project 内包含 4 个完整 mock Thread：1 个完整流程闭环 Thread，3 个拆解 Thread 分别覆盖设计、实验、分析结论；每个 Thread 19 轮对话。
- 4 个 Thread 共享同一套 candidate library、Experiment Order、Experiment Task、Experiment Result Package、Analysis Report 和 Iteration Decision Log。
- 每个 Thread 都有 4-5 个明确 human-in-loop 节点，并区分 Human Confirmation 与 Approval Request。
- 每个 Thread 有 7 张 mock Scientific Figure，整体 28 张图，且图像必须和 canonical objects 对齐。
- 每个 Thread 都有完整 Run Inspector；全流程和实验拆解 Thread 额外展示 Experiment Operational Records 索引。
- 设计环节能体现多模型、多目标和工业约束。
- 实验环节能体现 Experiment Order、Approval、Experiment Task、CRO Order、Operational Records 和 Result Package。
- 分析环节能体现 QC、curve fitting、multi-model consensus、uncertainty 和下一轮迭代。
- 输出物能沉淀为 Project Files / Assets，而不是只停留在聊天记录。
- 默认首页仍保持 New Thread Draft，不自动打开任何 mock Thread。
