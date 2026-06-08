# LIMS ELN 富文档设计规格

日期：2026-06-07

范围：`Enzyme Synthesis Ops / LIMS 流程运行` Thread 中生成的 ELN Document 和右侧可视化编辑器。

目标文件：`RUN-ENZ-SYN-20260604-001_experiment_record.bmeln`

## 一句话目标

把当前 ELN Document 从“带很多产品头部和摘要卡的预览页”改成“飞书文档式富文本实验记录”：打开后直接进入正文，正文中混排标题、表格、图片、Chart Block、签名块和附件引用，并且内容像真实 ELN，而不是 Agent 对话摘要。

## 核心边界

### Thread 不是 ELN Document

`LIMS 流程运行` 是一个实验执行编排 Thread。它负责呈现 Agent 与 Experiment Owner 的对话，并承载输入确认、审批发起、工单派发、回调接收、结果统计和异常监控。

`ProteinOps Agent` 是当前 `LIMS 流程运行` Thread 中的具体 Agent 名称，不是 ELN Document 的领域术语。ELN Document 可以说明它由 Agent 维护，但正文应记录实验事实。

Run 是 Agent 在 Thread 中编排和监控的一次具体执行实例；Experiment 是 ELN Document 记录的实验内容。Work Order 是 Run 中面向具体实验阶段派发的操作任务。ELN Document 是 Run 过程中生成的实验记录本文档，它可以引用 Work Order、回调、数据集和 Object Storage Asset 作为追溯来源，但文档形态应该接近真实实验记录：

- 实验目的
- 材料与试剂
- 方法与流程
- 实验过程
- 观察与偏差
- 图谱与结果
- 结论与后续计划
- 审核、签名和附件

ELN Document 不应该写成“Agent 说了什么、用户点了什么”的聊天复盘，也不应该把 Run 编排日志直接当成实验记录正文。

### 当前版本不改 Thread

本规格后续实现时不重写 `src/data/enzymeSynthesisOpsMockData.ts` 中现有 Thread 的对话流程、turn 顺序和叙事结构。ELN Document 入口直接使用 `.bmeln` Project File。后续只改：

- ELN Document 内容数据
- ELN 编辑器组件
- ELN 相关样式
- ELN 相关测试
- 必要的文档模型类型

### 文件框架保留

右侧 Side Window 外层文件框架保留，例如：

```text
Enzyme Synthesis Ops / RUN-ENZ-SYN-20260604-001_experiment_record.bmeln
```

这是标准文件预览框架，不属于 ELN 正文。不要额外定制或隐藏。

### ELN 内部不保留产品头

ELN 编辑器内部不再显示当前的大标题区、版本 chip、作者 chip、字符数 chip、章节摘要卡。实验编号、状态、审批、审计等信息应该成为正文块，而不是编辑器外壳。

打开 `.bmeln` 后，正文第一屏应该像飞书文档一样从标题和内容开始。

## 参考原则

### 飞书文档手感

本规格参考飞书文档的操作手感，但不照搬视觉皮肤。

关键原则：

1. 文档是块编辑器，不是普通文本框。
2. 图片、表格、附件、图表和签名对象都是正文块。
3. H1-H6 标题层级接近 Markdown，但内部文档模型比 Markdown 更丰富。
4. `/` 快速插入、行首 `+` 插入和块 hover 选中态作为本版本 P1 能力实现；完整飞书级文档编辑能力进入后续计划。
5. 图片和其他 Document Block 应自然嵌入正文，而不是出现在文档外部侧栏。

参考资料：

- 飞书文档支持用 `/` 插入图片、表格、多维表格等内容块，并支持快速搜索。
- 飞书文档支持图片作为文档内容插入，并可和文字组成复杂排版。
- 飞书文档支持页面宽度调整；ELN 因为有图谱和表格，后续应考虑较宽或全宽阅读模式。

### 真实 ELN 实践

真实 ELN 不会把所有原始数据逐行塞进正文，而是把实验记录、关键结果、代表性数据、图谱、附件和结构化数据引用放在同一上下文中。

本规格参考以下实践：

- LabArchives 示例实验页把实验记录拆成实验设计、观察、原始数据与分析、最终数据与结论，并允许图片、Office 文件、Excel 文件作为页面内容。
- TeselaGen ELN 支持 `/` 插入块、`@` 引用实验对象、表格、孔板格式、图片标注和历史版本。
- eLabJournal 图片区块支持图注、缩放、排序、放大和历史版本；第一版只取“图片块 + 图注”的核心。
- Benchling Notebook 可以插入普通表格、结构化结果表、附件、代码块和实验数据对象；Results Table 用 schema 约束结果数据，并可关联注册实体。

## 产品目标

1. 让用户点开 `.bmeln` Project File 后看到的是一份可信的酶合成实验记录，而不是一个 Agent 流程摘要。
2. 让 ELN Document 像飞书文档：标题、正文、表格、图片、图表、Document Block 和附件引用混排。
3. 让图片和 Chart Block 成为正文里的一等块，Chart Block 第一版使用 ECharts 渲染。
4. 让签名成为特殊 Document Block，而不是纯文字字段。
5. 保持 Thread 不变，只让 ELN Document 本身更真实、更丰富。
6. 保留后续扩展到更强富文本编辑器的空间。

## 非目标

第一版不做以下能力：

- 不重写 `LIMS 流程运行` Thread 的对话流程、turn 顺序和叙事结构。
- 不新增或生成新的图片资产。
- 不做真实图片上传。
- 不做图片裁剪、标注、拖拽缩放和替换。
- 不做真实电子签名合规。
- 不做 Signature Block 反写 Approval 子系统。
- 不做 Chart Block 配置编辑器。
- 不做图表数据源重绑。
- 不做 Object Storage 真实跳转联动。
- 不展开 612 条结构化读数的全部明细。
- 不做完整飞书式 slash command 插入系统，只做本规格定义的 P1 插入菜单雏形。
- 不做多人协作、版本冲突处理和自动保存合并。

## 本版本交付范围

本版本按 P0 + P1 一起交付。目标是基于现有项目改造 `.bmeln` ELN 编辑器，让它具备飞书式文档的核心阅读和基础编辑手感，而不是只做静态预览。

这里的“飞书式文档手感”只指 `.bmeln` ELN Editing Experience 的局部编辑体验，不指完整复刻飞书文档产品。

当前纳入范围：

- 正文即编辑器，不做预览/编辑两态割裂。
- 光标附近插入、`/` 插入菜单、行首 `+` 插入按钮。
- 块 hover 后出现轻量操作入口。
- H1-H6 驱动 Document Outline。
- 工具栏保持轻量，不抢正文注意力。
- 图片、普通表格、Chart Block、Signature Block 和附件引用块像正文块一样嵌入。

当前不纳入范围：

- 多人协作光标。
- 评论线程。
- 历史版本浏览、恢复和 diff。
- 权限体系。
- 文档分享。
- 完整块拖拽排序。
- 飞书级数据库、多维表格、审批套件集成。

保存语义沿用现有 Agent 项目的标准文件显示框架：

- `.bmeln` 正文点击即可编辑，不需要进入独立编辑模式。
- 内容变更后，外层文件框架显示“有未保存编辑”。
- 保存、关闭、切换文件时的 dirty state 由现有文件框架处理。
- `.bmeln` 编辑器内部负责把 Tiptap JSON 变更回传给文件框架。
- P0/P1 不做自动保存、历史版本浏览、恢复、diff 和冲突处理。

打开状态采用阅读式可编辑文档，而不是传统表单编辑器：

- 打开 `.bmeln` 后，正文以文档姿态展示，不自动聚焦标题或第一段。
- 用户点击正文任意位置后，出现光标并可直接编辑。
- 只有当前块被 focus 或 hover 时，才显示对应的块操作入口。
- 轻量工具栏可以常驻或吸顶，但不能表现成强编辑模式面板。
- 切换文件后再返回时，若存在未保存编辑，可以恢复上次光标位置；否则仍以阅读姿态打开。

`.bmeln` 需要区分三种版本语义：

- ELN Format Version：必须存在，例如 `formatVersion: "bmeln.v1"`，用于说明当前文件的 Document Block schema 版本。
- ELN Revision：建议存在，例如 `revision: 1`，用于表示当前保存状态的修订号，由标准文件框架管理。
- 历史版本：P0/P1 不实现；不提供历史保存点浏览、恢复、对比或审计回放。

### P0：必须完成

1. 块级渲染与基础编辑：段落、H1-H6、列表、普通表格、图片块、Chart Block、Signature Block 和附件引用块都按 Document Block 渲染；正文、标题、列表、图注至少可编辑。
2. Document Outline：由 H1-H6 生成，非最大化默认收起，最大化默认展开，并与 Object Storage 文件树互斥。
3. 轻量块工具栏：提供正文、H1/H2/H3、加粗、列表、表格等基础操作，视觉上接近文档编辑器。
4. 图片块展示：使用现有资产渲染图片和图注，支持点击查看大图；不做上传、裁剪、标注、替换。
5. Chart Block：全部使用 ECharts 渲染，支持 tooltip、legend、hover 高亮和响应式尺寸。

### P1：一起完成

1. Slash Command 雏形：在正文输入 `/` 弹出插入菜单，支持标题、列表、普通表格、图片块、Chart Block、Signature Block、附件引用块。
2. 行首 `+` 插入按钮：空行或块间 hover 时出现 `+`，点击打开与 Slash Command 相同的插入菜单。
3. 块 hover 选中态：图片块、Chart Block、Signature Block、附件引用块在 hover 时显示轻量边框和块操作入口，让用户感知它们是可操作文档块。
4. 基础表格编辑：表格单元格可编辑，支持新增行和删除行；不要求合并单元格、冻结表头或复杂 Excel 粘贴。

## 文档模型

### 主格式

`.bmeln` 主格式是结构化富文本 JSON，不是纯 Markdown。

`.bmeln` 是 BioMap Agent 为当前 ELN Document 定义的项目内文档类型，不是市面通用文件格式。只有本 Agent 项目知道如何解释和渲染其中的 Document Block。不要使用通用 `.eln` 扩展名，以免被误判为外部 ELN 标准或纯文本记录。

当前实现载体继续使用 Tiptap JSON。Markdown 只是可导出格式，不是主存储模型。

第一版 `.bmeln` 顶层结构需要包含：

- `formatVersion`：ELN Format Version，标识 `.bmeln` schema 版本。
- `revision`：ELN Revision，标识当前保存状态的文档修订号。
- `document`：Tiptap JSON 正文。

原因：

- 图片需要 `src`、`assetRef`、图注、来源、尺寸策略。
- Chart Block 需要图表类型、ECharts 配置、数据源引用。
- Signature Block 需要角色、签署人、状态、时间、来源 Approval artifact。
- 附件引用需要对象路径、文件类型、状态和来源。
- 表格需要结构化行列，而不是脆弱字符串。

### 基础节点

Document Block 只属于 ELN Document。它不改变 Markdown、JSON、spreadsheet、image 等其他 Project File 的展示模型。

第一版正文应支持：

| 节点 | 用途 |
| --- | --- |
| 标题 H1-H6 | 文档标题、章节、小节 |
| 段落 | 普通实验记录 |
| 无序列表 | 步骤、观察点、注意事项 |
| 有序列表 | 实验步骤 |
| 普通表格 | 样本、试剂、工单、QC、结果摘要 |
| 图片块 | 实验图、流程图、QC 图、异常图 |
| 图注 | 图片说明 |
| Chart Block | 使用 ECharts 渲染的交互式统计图 |
| Signature Block / 签名块 | 实验者确认、审批确认、结果放行 |
| 附件引用块 | Object Storage 文件引用 |
| 提示块 | 偏差说明、注意事项、复核提示 |
| 分割线 | 章节内结构分隔 |

### 自定义节点建议

#### 图片块

```json
{
  "type": "elnImageBlock",
  "attrs": {
    "src": "enzyme-result-package-qc-overview.png",
    "alt": "结果包 QC 总览",
    "caption": "图 4：结果包 QC 总览，显示构建 QC、纯化 QC、数据完整性和附件状态。",
    "assetRef": "Runs/RUN-ENZ-SYN-20260604-001/results/enzyme-result-package-qc-overview.png",
    "sourceRef": "Runs/RUN-ENZ-SYN-20260604-001/results"
  }
}
```

第一版行为：

- 正文内展示图片、图注和来源。
- 宽度随文档容器自适应。
- 图注显示在图片下方。
- 图注文本可编辑。
- 点击图片进入大图查看层。
- 大图查看层支持关闭。
- 大图查看层不改变 `.bmeln` 内容，不触发 dirty state。
- 图片块 hover 显示轻量块菜单。
- 图片顺序由文档块顺序决定。
- `.bmeln` 不存 base64 图片正文，只保存资产引用和元数据。
- 图片本体不支持裁剪、上传替换和拖拽缩放。
- 图片本体不支持标注、旋转、缩放控制和排序。

#### Chart Block

```json
{
  "type": "elnChartBlock",
  "attrs": {
    "title": "实验阶段时间轴",
    "chartKind": "bar",
    "sourceRef": "DS-ENZ-SYN-20260604-001",
    "updatedAt": "2026-06-04 16:18",
    "option": {}
  }
}
```

第一版行为：

- 正文内使用 ECharts 渲染。
- 支持 tooltip、legend 开关、hover 高亮和响应式尺寸。
- 底部展示数据来源和更新时间。
- 点击 Chart Block 进入选中态。
- 块菜单支持查看详情、复制块信息、删除块。
- `/` 或行首 `+` 插入 Chart Block 时，插入预设 mock 图表。
- 图表标题和图注可以编辑。
- `sourceRef` 只展示，不做真实跳转。
- 不允许用户编辑图表配置。
- 不做数据源重绑定。
- 不做图表类型切换。
- 不做导出图片。

#### Signature Block / 签名块

```json
{
  "type": "elnSignatureBlock",
  "attrs": {
    "kind": "结果放行",
    "role": "复核人审批",
    "signer": "Project Owner",
    "status": "已通过",
    "signedAt": "2026-06-04 17:10",
    "sourceRef": "APPROVAL-result_release-20260604-1710.pdf",
    "note": "结果包通过发布审批，允许进入结果目录。"
  }
}
```

第一版行为：

- 在正文中显示为一行紧凑 Document Block。
- 展示签署类型、角色、签署人、状态、时间、来源 Approval artifact 和备注。
- 点击后可展开详情。
- hover 显示块菜单。
- `/` 或行首 `+` 插入 Signature Block 时，插入 mock 签名块模板。
- 用户可以编辑备注类文本。
- 用户不能直接把签名状态从“待确认”改成“已通过”来伪造审批。
- 不做真实签名提交。
- 不做合规级审计锁定。
- 不反写 Approval 子系统。

#### 附件引用块

附件引用块是一种 Document Block，用来在 ELN Document 正文内引用 Object Storage Asset。它不创建新的资产，也不替代 Project File。

```json
{
  "type": "elnAttachmentBlock",
  "attrs": {
    "fileName": "structured_readouts.json",
    "fileKind": "JSON",
    "sourceRef": "Runs/RUN-ENZ-SYN-20260604-001/results",
    "summary": "612 条结构化读数，包含 activity、kcat/Km proxy、Tm、pH window 和 expression。"
  }
}
```

第一版行为：

- 正文中显示文件名、类型、路径和摘要。
- 暂不做点击跳转。
- 正文可以出现 `WO-PUR-20260604-003`、`DS-ENZ-SYN-20260604-001` 等普通文本 ID。
- P0/P1 不做 `@` 对象引用输入法。
- P0/P1 不做点击 ID 跳转、对象 hover card 或对象引用反向关系。
- 后续可接入 Side Window 文件打开逻辑。

## 编辑器体验

### 第一屏

第一屏不显示独立 ELN header。正文建议从 H1 开始：

```text
酶合成实验记录

1. 实验基本信息
```

文档状态、编号、负责人、日期等进入“实验基本信息”表格。

### 空状态和占位提示

P0/P1 使用轻量中文占位提示帮助用户发现插入能力。

规则：

- 空文档第一段显示占位：`输入 / 插入内容`。
- 空段落获得焦点时显示同样占位。
- 占位文本不进入 `.bmeln` 内容。
- 占位文本不影响复制。
- 已有内容的段落不显示占位。
- 特殊块内部不显示通用占位；它们使用各自的空状态。

### 响应式边界

P0/P1 只保证桌面 Workspace Side Window 的非最大化和最大化两种状态，不额外设计手机端触屏交互。

窄宽度规则：

- 非最大化 Workspace Side Window 中，Document Outline 默认收起。
- 顶部工具栏允许横向滚动或折叠为更多菜单。
- 行首 `+` 插入按钮只显示图标。
- Slash Command 菜单宽度不超过编辑器正文宽度。
- 宽表横向滚动。
- Chart Block 响应式缩放。
- 图片不超过正文宽度，点击后可通过大图查看层查看。
- 最大化时，块把手显示在正文块左侧外缘。
- 非最大化时，块把手显示在块左上角内侧，避免压缩正文。

不做：

- 手机端触屏专门交互。
- 移动端工具栏重排方案。

### 工具栏

本版本保留轻量块工具栏，但视觉上应更像文档编辑器，不应像独立产品卡片。

工具栏策略：

- P0 保留顶部轻量工具栏，保证基础编辑能力可发现。
- P1 可以增加文本选区浮动菜单，但只提供最小格式能力。
- 工具栏视觉要弱，像文档编辑辅助，不像文件属性面板。
- 工具栏不显示文件元数据；文件名、保存状态和文件框架头继续由外层标准文件显示框架负责。

建议按钮：

- 正文
- H1
- H2
- H3
- 加粗
- 列表
- 表格

文本选区浮动菜单：

- 加粗
- H2
- H3
- 列表

不做：

- 复杂颜色。
- 字体。
- 字号。
- 对齐。
- 缩进。
- 链接。
- 评论。

工具栏不替代 Slash Command 和行首 `+` 插入按钮。它只承担常用格式切换，复杂 Document Block 插入通过插入菜单完成。

### Slash Command 和插入菜单

本版本实现 Slash Command 雏形。用户在正文中输入 `/` 时，弹出一个轻量插入菜单。

菜单项：

基础：

- 正文
- H1
- H2
- H3
- 无序列表
- 有序列表
- 分割线

实验记录：

- 普通表格
- 图片块
- 附件引用块
- 提示块

数据与确认：

- Chart Block
- Signature Block

行为：

- 输入 `/` 后菜单在当前光标附近出现。
- 支持键盘上下选择和回车插入。
- 支持鼠标点击插入。
- 插入普通表格时使用默认 3 列 3 行结构。
- 插入图片块、Chart Block、Signature Block、附件引用块时，第一版可插入预设 mock 块或打开最小选择菜单，不要求完整数据源绑定。
- Slash Command 菜单只服务 ELN Document，不影响 Markdown、JSON、spreadsheet、image 等其他 Project File 预览。
- Slash Command 菜单不提供通用文档产品块库；代码块、Todo、引用块、分栏、复杂 Callout、数据库、多维表格和第三方插件不进入 P1。

插入结果规则：

- 文本类块：插入空内容并聚焦。
- 普通表格：插入 3x3 空表格，表头可编辑。
- 图片块：插入预设 mock 图片块或打开最小选择菜单；不做上传。
- Chart Block：插入预设 mock ECharts 图表。
- Signature Block：插入 mock 签名块模板，但用户不能伪造真实已签状态。
- 附件引用块：插入预设 mock 附件引用或打开最小选择菜单。
- 提示块：插入空提示块并聚焦文本。
- 分割线：直接插入。

### 键盘体验

P0/P1 实现最小 Markdown-like 输入和菜单键盘控制。

输入转换：

- `#` + 空格生成 H1。
- `##` + 空格生成 H2。
- `###` + 空格生成 H3。
- `-` + 空格生成无序列表。
- `1.` + 空格生成有序列表。

编辑行为：

- `/` 打开 Slash Command 菜单。
- Slash Command 菜单支持上下方向键、Enter 和 Esc。
- Enter 在段落中新建段落。
- Enter 在列表项中新建列表项。
- 空列表项按 Enter 退出列表。
- Tab 和 Shift+Tab 只用于列表层级缩进，不用于普通段落缩进。

不做：

- 复杂快捷键体系。
- 普通段落缩进。
- 全局命令面板。

### 粘贴行为

P0/P1 只做基础粘贴，不做飞书式智能粘贴。

范围：

- 粘贴纯文本时保留换行，并进入段落。
- 粘贴简单富文本时尽量保留加粗、列表、标题；不能保留时降级为纯文本。
- 粘贴网页复杂 HTML 时清洗为安全的基础文本、列表或标题。
- 粘贴内容触发 dirty state。

不做：

- 整段 Markdown 智能解析。
- 粘贴图片自动生成图片块。
- 粘贴 Excel/CSV 自动生成或扩展表格。
- 粘贴网页复杂布局。

### 可编辑与只读边界

`.bmeln` 是可编辑实验记录，但系统来源字段需要保持可信边界。

可编辑：

- 标题。
- 段落。
- 列表。
- 图注。
- 表格单元格。
- 提示块文本。
- Signature Block 备注。

只读：

- Chart Block 的 ECharts 配置。
- `sourceRef`。
- `assetRef`。
- Signature Block 状态。
- Signature Block 签署人。
- Signature Block 签署时间。
- 附件引用块路径。

允许删除：

- 图片块。
- Chart Block。
- Signature Block。
- 附件引用块。

删除规则：

- 删除需要进入当前文档编辑器 undo 栈。
- 只读字段仍可在详情面板中展示和复制。
- 用户不能通过普通编辑把“审批通过”“签署完成”等系统状态改成伪造状态。

### 撤销与重做

P0/P1 支持编辑器内 undo/redo，但不提供历史版本能力。

进入 undo 栈：

- 文本编辑。
- 插入块。
- 删除块。
- 新增表格行。
- 删除表格行。

不进入 undo 栈：

- 查看大图。
- 展开或收起 Signature Block 详情。
- 展开或收起 Document Outline。
- 展开或收起 Object Storage 文件树。

快捷键：

- `Cmd/Ctrl+Z` 撤销。
- `Cmd/Ctrl+Shift+Z` 或 `Cmd/Ctrl+Y` 重做。

不做：

- 跨文件 undo。
- 保存后历史恢复。
- 历史版本浏览。

### 行首 `+` 插入按钮

本版本实现行首 `+` 插入按钮，作为 Slash Command 的可视化入口。

行为：

- 空行或块间 hover 时出现 `+`。
- 普通正文行 hover 时不显示 `+`，避免干扰阅读。
- 段落之间、标题前后、特殊块上下的空白区域 hover 时显示 `+`。
- 空段落获得焦点时显示 `+`。
- 点击 `+` 打开与 Slash Command 相同的插入菜单。
- 插入普通文本类块后，新块进入可编辑状态。
- 插入 Chart Block、Signature Block、附件引用块等特殊块后，新块进入选中态并显示轻量块菜单。
- `+` 按钮不占用正文布局，不导致文本重排。
- 非最大化 Workspace Side Window 中，`+` 只显示小图标，不显示文字标签。
- 非最大化 Workspace Side Window 中，`+` 按钮需要保持紧凑，避免和 Document Outline rail 抢宽度。

### 块 hover 选中态

图片块、Chart Block、Signature Block、附件引用块在 hover 时显示轻量选中态。

行为：

- hover 时出现细边框或浅色背景。
- 块左侧显示小型块把手或操作点位，但当前不支持拖拽。
- 最大化时，块把手显示在正文块左侧外缘；非最大化时，块把手显示在块左上角内侧。
- 把手只在 hover 或 focus 时显示。
- 把手尺寸固定，不随文本长度变化。
- 把手不参与文档内容复制。
- 点击块把手打开小菜单。
- 小菜单至少支持“查看详情”“复制块信息”“删除块”。
- 删除块需要进入当前文档编辑器 undo 栈。
- 段落、标题、列表先不显示块菜单，避免正文操作入口过密。
- hover 选中态不改变正文布局尺寸。

### 基础表格编辑

本版本实现基础表格编辑。

范围：

- 单元格内容可编辑。
- 支持新增行。
- 支持删除行。
- 保留表格表头视觉。
- 宽表在 Workspace Side Window 内横向滚动，不挤压正文页面。

不做：

- 新增列。
- 删除列。
- 合并单元格。
- 冻结表头。
- 从 Excel/CSV 复杂粘贴。
- 表格内插入任意 Document Block。
- 表格和 Object Storage 文件联动。

### Document Outline / 文档导航

ELN 编辑器应提供飞书文档式的左侧可折叠 Document Outline。Document Outline 只由正文标题生成，支持 H1-H6，不列出图片块、Chart Block、Signature Block、附件引用块等具体 Document Block。

Document Outline 行为：

- 非最大化 Workspace Side Window 中，考虑到横向宽度有限，Document Outline 默认收起。
- 最大化 Workspace Side Window 时，Document Outline 默认展开。
- 打开 `.bmeln` Project File 时，Object Storage 文件树默认收起。
- Document Outline 与 Object Storage 文件树互斥展开，避免左侧 Document Outline、中间正文、右侧文件树三栏同时挤压正文。
- 用户展开 Object Storage 文件树时，Document Outline 自动收起。
- 用户展开 Document Outline 时，Object Storage 文件树保持收起。
- 用户可以手动展开或收起文档导航。
- 点击导航项滚动到对应标题。
- 导航层级按 H1-H6 缩进展示。
- 当前滚动位置对应的标题应有轻量高亮。
- 正文标题文本变化后，Document Outline 自动更新。
- 正文新增或删除标题后，Document Outline 自动更新。
- Document Outline 不支持直接编辑标题文本。
- Document Outline 不支持拖拽章节重排。
- Document Outline 不折叠正文内容，只折叠导航树显示。

收起态样式参考飞书文档：

- 左侧只保留一个很窄的 rail，不显示完整标题列表。
- rail 顶部显示三横线或双箭头一类的导航展开按钮。
- 正文区域继续居中显示，不因为隐藏导航而贴边。
- 按钮需要有明确 hover/active 状态，但不要变成大工具栏。
- 收起态不展示 H1-H6 标题文本，只作为打开 Document Outline 的入口。

Document Outline 不是 ELN Document 的内容，不保存到 `.bmeln` 文档正文中；它是 ELN 编辑器根据标题节点派生出来的阅读辅助。

### 标题层级

使用类似 Markdown 的层级：

- H1：文档标题。
- H2：12 个主章节。
- H3：章节内小节。
- H4-H6：保留给后续更复杂结构。

正文所有标题和段落必须使用中文。技术标识、文件名、样本编号、数据集编号可以保留原始英文或编号。

## ELN 正文结构

采用 12 个主章节。章节贴合当前 LIMS mock，不照搬外部模板中不存在的实体。

内容密度采用“6 个高密度章节 + 6 个短章节”。高密度章节承载主要表格、图片、Chart Block 和异常/结果细节；短章节保留真实 ELN 必需信息，但不把右侧窗撑成完整报告。

高密度章节：

- 实验基本信息
- 实验流程概览
- 构建执行与样本确认
- 酶的质量分析与表征
- 结果与原始数据
- 异常与偏差记录

短章节：

- 材料与试剂
- 酶的表达
- 酶的纯化
- 结论与下一步计划
- 审核与审批记录
- 附件与引用

### H1：酶合成实验记录

文档标题使用中文，不使用文件名作为正文大标题。

### 1. 实验基本信息

目的：打开文档后快速知道这是什么实验、为什么做、谁负责、什么时候完成。

内容块：

1. 实验基本信息表。
2. 实验目的与原理简述。
3. 阶段目标。
4. 记录来源说明。
5. 实验者确认 Signature Block。

建议表格字段：

| 字段 | 内容 |
| --- | --- |
| 实验编号 | `RUN-ENZ-SYN-20260604-001` |
| ELN 编号 | `ELN-RUN-ENZ-SYN-20260604-001` |
| 实验名称 | 酶合成执行与活性表征 |
| 关联项目 | Enzyme Synthesis Ops |
| 样本批次 | `ENZ-SYN-BATCH-048` |
| 样本范围 | 48 个候选 + 4 个对照 |
| 状态 | 已完成，可编辑 |
| 开始时间 | 2026-06-04 09:18 |
| 结束时间 | 2026-06-04 17:10 |

Agent 只在“记录来源说明”中低频出现：

```text
本记录由 ProteinOps Agent 根据 LIMS 执行流程、工单回调和结果数据自动维护，并保留人工补充与复核空间。
```

### 2. 材料与试剂

目的：记录执行环境，避免结果脱离物料、设备和 SOP 背景。

内容块：

1. 材料与试剂表。
2. 设备与耗材表。
3. SOP 与资源锁定说明。
4. 普通图片块：资源准备或物料路线图。

必须使用当前 mock 已有信息：

- 库存记录：`INV-ENZ-SYN-202606`
- 底物批次：`SUB-LOT-202606-A`
- 备用批次：`SUB-LOT-202606-B`
- SOP：`SOP v4`
- 设备：`LCQ-03`、`PR-3107`
- 缓冲液批次：可使用当前对象存储中已有的 `BUF-ENZ-202606-02`

不引入不存在的具体宿主菌株、细胞系、质粒或载体编号。

### 3. 实验流程概览

目的：让读者先理解本轮实验如何从输入确认走到结果释放。

内容块：

1. 整体流程段落。
2. 实验阶段时间线表。
3. Chart Block：实验阶段时间轴图。
4. 普通图片块：实验流程图，优先复用现有资产。

阶段包括：

- 输入确认
- 样本注册
- 资源准备
- 构建执行
- 构建 QC
- 返工
- 表达
- 纯化
- 活性检测
- 数据入库
- 结果包生成
- 结果放行

### 4. 构建执行与样本确认

目的：替代外部模板中的“菌株/质粒构建”，贴合当前 mock 中真实存在的构建工单和样本确认过程。

内容块：

1. 构建执行来源表。
2. 样本登记摘要表。
3. 构建 QC 结果表。
4. 返工说明。
5. 附件引用块：`WO-CONSTRUCT-20260604-101.md`、`construction_qc_summary.md`。

必须包含：

- `WO-CONSTRUCT-20260604-101`
- `DNA assembly / clone verification`
- `ENZ-SYN-017` 和 `ENZ-SYN-032` 覆盖不足
- 返工后通过
- 构建 QC 通过后进入表达队列

明确说明：

```text
当前 mock 未提供具体宿主菌株、质粒编号和载体编号；本 ELN 不补编这些实体。后续如果 LIMS/Registry 提供，可作为实验对象引用块补充。
```

### 5. 酶的表达

目的：记录表达阶段的条件、样本进入情况和表达结果摘要。

内容块：

1. 表达执行来源表。
2. 表达条件表。
3. 取样与生物量监测摘要。
4. Chart Block：表达状态分布图。
5. 附件引用块：`WO-EXPRESS-20260604-102.md`。

必须使用当前 mock 信息：

- 表达工单：`WO-EXPRESS-20260604-102`
- 输入：构建 QC 通过样本
- 表达记录：52 个 expression records
- 表达作为输出指标，不作为主 QC gate

不要编造具体培养温度、诱导剂浓度或宿主菌株；如果需要呈现条件，写成“LIMS 记录未展开具体条件，详见表达工单附件”。

### 6. 酶的纯化

目的：记录纯化方法、低收率样本和进入检测的样本状态。

内容块：

1. 纯化执行来源表。
2. 纯化步骤表。
3. 组分收集与合并说明。
4. Chart Block：纯化收率分布图。
5. 附件引用块：`WO-PURIFY-20260604-103.md`、`purification_qc_summary.json`。

必须包含：

- `WO-PURIFY-20260604-103`
- AKTA small-column purification
- `ENZ-SYN-006` 和 `ENZ-SYN-041` 低收率 flag
- 低收率不阻断活性检测

### 7. 酶的质量分析与表征

目的：记录 QC、活性、稳定性和动力学初步评价。

内容块：

1. QC gate 表。
2. 指标说明表。
3. Chart Block：关键指标概览图。
4. 普通图片块：QC 总览图。
5. 附件引用块：`CALLBACK-QC-204_summary.json`。

指标包括：

- activity
- kcat/Km proxy
- Tm
- pH window
- expression

策略：

- 不全文展开 612 条读数。
- 显示统计摘要和代表性结果。
- 异常样本保留 flag。

### 8. 结果与原始数据

目的：让 ELN 同时呈现关键结果和原始数据追溯入口。

内容块：

1. 结果摘要表。
2. 代表性读数表，建议 6-10 行。
3. Chart Block：候选表现 Top-N 图。
4. 普通图片块：结果包摘要或活性曲线。
5. 结构化数据附件块。
6. 文件索引表。

数据呈现策略：

- `612` 条结构化读数不全文展开。
- 正文展示关键摘要、代表性样本和统计图。
- 完整数据通过 `structured_readouts.json`、结果包和回调文件引用。

代表性行应包含：

- parent control
- 高活性候选
- 稳定性较好候选
- 低收率 flag 样本
- 返工样本

### 9. 异常与偏差记录

目的：让异常作为可复核对象存在，而不是在结果汇总中被抹掉。

内容块：

1. 异常偏差表。
2. 即时处理措施。
3. Chart Block：异常类型分布图。
4. 普通图片块：异常分布图。
5. 提示块：异常不自动剔除策略。
6. 附件引用块：`ANOMALY-ENZ-SYN-20260604-001.md`。

必须包含：

| 样本 | 异常 | 状态 |
| --- | --- | --- |
| `ENZ-SYN-006` | 低收率 | 保留 flag |
| `ENZ-SYN-017` | 构建覆盖不足 | 返工后 resolved |
| `ENZ-SYN-032` | 构建覆盖不足 | 返工后 resolved |
| `ENZ-SYN-041` | 低收率 | 保留 flag |

固定原则：

- 原始读数保留。
- 不自动剔除异常样本。
- 不由 Agent 自动扩大下一轮样本范围。

### 10. 结论与下一步计划

目的：让 ELN 不只是记录，也承接下一轮实验判断。

内容块：

1. 实验结论摘要。
2. 阶段目标达成表。
3. 效率复盘表。
4. Chart Block：效率对比图。
5. 下一步建议。

必须包含：

- 本轮总耗时 `471 min`
- 比最近 5 轮均值快 `74 min`
- 比上一轮快 `141 min`
- 卡点主要在构建与质检等待段
- 下一轮优先复核低收率样本和活性高但 Tm 较低的候选
- 不建议直接扩大到新一轮 96 样本

### 11. 审核与审批记录

目的：把 Approval 子系统产生的审批结果以文档内 Signature Block 呈现，而不是把审批和签名写成纯文字。

内容块：

1. 审批记录表。
2. 三个 Signature Block。
3. 审核意见可编辑区。

审批记录：

| 节点 | 审批人 | 决策 | 时间 | 关联文件 |
| --- | --- | --- | --- | --- |
| `run_start` | Lab Owner | 通过 | 2026-06-04 09:18 | `APPROVAL-run_start-20260604-0918.json` |
| `rework_authorization` | Lab Owner | 通过 | 2026-06-04 12:44 | `APPROVAL-rework_authorization-20260604-1244.json` |
| `result_release` | Project Owner | 通过 | 2026-06-04 17:10 | `APPROVAL-result_release-20260604-1710.pdf` |

Signature Block：

- 启动审批：Lab Owner，已通过。
- 返工审批：Lab Owner，已通过。
- 结果放行：Project Owner，已通过。

另有一个“实验者确认”Signature Block 放在第 1 章末尾。

### 12. 附件与引用

目的：集中列出 ELN 依赖的工单、回调、结果包、图像和数据文件。

内容块：

1. 附件索引表。
2. 附件引用块列表。
3. 数据集引用说明。
4. 参考 SOP 和文件路径。

必须包含分组：

- 输入文件
- 审批文件
- 工单文件
- 回调文件
- QC 文件
- 异常文件
- ELN Document
- 结果文件
- 分析文件

## 图片块规划

第一版插入 4-6 个普通图片块，优先使用现有图片资产，不生成新图。

候选图片：

| 章节 | 图片 |
| --- | --- |
| 实验流程概览 | `enzyme-order-to-task-flow.png` |
| 材料与试剂 / 流程概览 | `enzyme-experiment-notebook-polling.png` |
| 质量分析与表征 | `enzyme-result-package-qc-overview.png` |
| 异常与偏差记录 | `enzyme-experiment-anomaly-log.png` |
| 结果与原始数据 | `enzyme-experiment-record-summary.png` |

如果某个 Thread 中提到的图片没有 `imageSrc`，第一版只做附件引用块，不直接渲染图片。

## Chart Block 规划

第一版插入 6 个 Chart Block，并全部使用 ECharts 渲染。

| 章节 | 图表 | 类型 | 数据来源 |
| --- | --- | --- | --- |
| 3. 实验流程概览 | 实验阶段时间轴图 | 横向条形图或时间轴图 | LIMS 阶段时间 |
| 5. 酶的表达 | 表达状态分布图 | 柱状图或饼图 | expression records |
| 6. 酶的纯化 | 纯化收率分布图 | 柱状图 | purification QC |
| 7. 酶的质量分析与表征 | 关键指标概览图 | 雷达图或多指标柱状图 | structured readouts |
| 8. 结果与原始数据 | 候选表现 Top-N 图 | 条形图 | structured readouts |
| 9. 异常与偏差记录 | 异常类型分布图 | 饼图或条形图 | anomaly log / QC callback |
| 10. 结论与下一步计划 | 效率对比图 | 分组柱状图 | efficiency review |

说明：如果实现压力需要收敛，最低可保留前 6 个；但 spec 的完整目标是 7 个，其中效率对比图对“下一步计划”价值很高。

每个图表块底部显示：

```text
数据来源：DS-ENZ-SYN-20260604-001 / structured_readouts.json
更新时间：2026-06-04 16:18
```

或：

```text
数据来源：ANOMALY-ENZ-SYN-20260604-001.md / CALLBACK-QC-204_summary.json
更新时间：2026-06-04 15:22
```

## Signature Block 设计

### 视觉

Signature Block 是一行紧凑 Document Block，不是大卡片。

建议外观：

```text
[签名] 实验者确认    ProteinOps Agent    已确认    2026-06-04 17:10    查看详情
```

审批签名：

```text
[签名] 结果放行      Project Owner       已通过    2026-06-04 17:10    查看详情
```

视觉原则：

- 高度接近一行表格或附件卡。
- 左侧有“签名”对象标识。
- 中间展示签名用途、签署人、状态、时间。
- 状态颜色克制：已通过绿色，待签署灰色，已驳回红色。
- 右侧为轻量操作入口。

### 展开详情

点击 Signature Block 后可展开详情：

```text
签名对象
类型：结果放行
签署人：Project Owner
决策：已通过
时间：2026-06-04 17:10
来源：APPROVAL-result_release-20260604-1710.pdf
说明：结果包通过发布审批，允许进入结果目录。
```

第一版不做真实签名动作，不反写 Approval 子系统。

## 表格策略

本版本使用普通表格块，并实现基础表格编辑。

建议正文中包含 8-12 个表格：

1. 实验基本信息表。
2. 材料与试剂表。
3. 设备与耗材表。
4. 实验阶段时间线表。
5. 构建执行来源表。
6. 表达条件或表达记录表。
7. 纯化步骤表。
8. QC gate 表。
9. 结果摘要表。
10. 代表性读数表。
11. 异常偏差表。
12. 附件索引表。

当前表格编辑范围：

- 单元格内容编辑。
- 新增行。
- 删除行。

后续高级表格计划：

- 新增/删除列。
- 单元格合并。
- 表头冻结。
- 从 Excel/CSV 粘贴。
- 表格块工具栏。
- 表格和 Object Storage 文件联动。

## 数据呈现策略

ELN 正文不展开所有原始数据。

对于 `612` 条结构化读数，第一版采用三层呈现：

1. 结果摘要表：展示 activity、kcat/Km proxy、Tm、pH window、expression 的样本数、来源和状态。
2. 代表性读数表：展示 6-10 行，包括 parent control、高活性候选、稳定性候选、低收率 flag 样本、返工样本。
3. 结构化数据附件块：展示数据集 ID、行数、schema、来源和关联文件。

这个策略接近 Benchling Results Table 的精神：ELN 中呈现结构化结果对象和摘要，但大规模数据保留为可追溯数据集。

## Agent 存在感策略

ELN 正文中 Agent 低频出现，实验事实高频出现。

允许出现：

- “本记录由 ProteinOps Agent 根据 LIMS 执行流程、工单回调和结果数据自动维护。”
- 审计轨迹中说明某章节由系统自动更新。
- 实验者确认 Signature Block 中的系统生成者。

避免出现：

- “Agent 派发了工单。”
- “Agent 收到了回调。”
- “Agent 生成了结果包。”

改写为实验事实：

```text
构建工单 WO-CONSTRUCT-20260604-101 完成，构建 QC 显示 ENZ-SYN-017 与 ENZ-SYN-032 覆盖不足，返工后通过。
```

## 后续富文本编辑器计划

本版本已包含 P0 和 P1 的飞书式基础手感。后续可以继续增强：

1. 图片块工具栏：替换、裁剪、标注、缩放、下载。
2. 完整表格编辑：新增/删除列、合并单元格、冻结表头、复杂 Excel 粘贴。
3. Chart Block 配置编辑器。
4. Object Storage 文件引用跳转。
5. 实验对象引用：样本、孔板、设备、Work Order、数据集。
6. Document Block 拖拽排序和跨章节移动。
7. 版本历史和修订记录。
8. 自动保存和保存状态。
9. 审核签名工作流和权限控制。
10. 多人协作、评论和权限控制。

## 验收标准

### 内容验收

- `.bmeln` 正文全中文，只有文件名、样本编号、数据集编号、产品名和技术标识保留原文。
- 正文从 H1 文档标题开始，不出现独立 ELN 产品头。
- 包含 12 个主章节。
- 12 个主章节按 6 个高密度章节和 6 个短章节组织，不要求每章都铺满图表和表格。
- 第 4 章是“构建执行与样本确认”，不是“菌株/质粒构建”。
- 不编造当前 mock 中不存在的宿主菌株、质粒、载体编号。
- 至少包含 8 个表格。
- 至少包含 4 个普通图片块。
- 至少包含 6 个 Chart Block。
- 至少包含 4 个 Signature Block。
- 包含可供 Slash Command 和行首 `+` 插入菜单使用的默认 Document Block 模板。
- `612` 条读数不全文展开，只做摘要、代表性读数和数据引用。

### 交互验收

- 点击 Thread 中现有 `.bmeln` Project File 后，右侧 Side Window 打开 ELN 编辑器。
- 右侧外层路径栏保持原样。
- ELN 编辑器内部不显示大 header、meta chip 和章节摘要卡。
- 非最大化 Workspace Side Window 中，ELN Document Outline 默认收起。
- 最大化 Workspace Side Window 中，ELN Document Outline 默认展开。
- Document Outline 由 H1-H6 标题生成，不包含具体 Document Block。
- 打开 `.bmeln` Project File 时，Object Storage 文件树默认收起。
- Document Outline 与 Object Storage 文件树不会同时展开。
- 正文可编辑。
- 轻量块工具栏支持正文、H1/H2/H3、加粗、列表、表格等基础格式操作。
- 输入 `/` 可以打开 Slash Command 插入菜单，并能插入本规格定义的基础 Document Block。
- 空行或块间 hover 时显示行首 `+` 插入按钮，点击后打开同一套插入菜单。
- 图片块、Chart Block、Signature Block、附件引用块在 hover 时显示轻量选中态和块操作入口。
- 普通表格支持单元格编辑、新增行和删除行。
- 图片块在正文内渲染并显示图注、来源。
- 点击图片块可以打开大图查看层，关闭大图查看层不触发 dirty state。
- Chart Block 在正文内使用 ECharts 渲染，支持 tooltip、legend 和响应式尺寸。
- Signature Block 可展开详情。
- 附件引用块显示文件名、类型、路径和摘要。

### ELN Editing Experience 验收

- 打开 `.bmeln` 后不自动聚焦，点击正文才出现光标。
- 编辑后外层文件框架显示“有未保存编辑”。
- `/` 菜单支持键盘选择和插入。
- 行首 `+` 只在空行或块间 hover 出现。
- 图片块、Chart Block、Signature Block 和附件引用块 hover 时出现边框和块把手。
- 块菜单能查看详情、复制块信息、删除块。
- 删除块可以 undo。
- 图片点击打开大图，关闭大图不触发 dirty state。
- Chart Block 使用 ECharts 渲染，并支持 hover、tooltip、legend 和响应式尺寸。
- Signature Block 可展开详情，但不能伪造签署状态。
- Document Outline 只导航，不编辑标题、不拖拽章节、不折叠正文内容。
- 宽表横向滚动，不挤压正文。
- `Cmd/Ctrl+Z` 对文本、块插入、块删除、新增表格行和删除表格行生效。

### 测试验收

需要增加或更新测试：

1. `.bmeln` Project File 仍能从 Thread 点击打开。
2. ELN 编辑器内部不再渲染旧 header/meta/section card。
3. ELN 正文包含 12 个中文主章节。
4. ELN 正文包含图片块、Chart Block、Signature Block 和附件引用块。
5. Chart Block 显示 `sourceRef`。
6. Signature Block 显示签署人、状态、时间，并能展开详情。
7. ELN Document Outline 在非最大化 Workspace Side Window 中默认收起，在最大化 Workspace Side Window 中默认展开，并能根据 H1-H6 标题生成导航项。
8. ELN Document Outline 与 Object Storage 文件树互斥展开。
9. 输入 `/` 会打开 Slash Command 插入菜单，菜单项包含标题、列表、普通表格、图片块、Chart Block、Signature Block、附件引用块。
10. 行首 `+` 插入按钮打开与 Slash Command 相同的插入菜单。
11. 关键 Document Block hover 时显示选中态，不造成布局跳动。
12. 普通表格支持单元格编辑、新增行和删除行。
13. Thread 的 turn 顺序和叙事文本不重写；只允许把 ELN Document 的 Project File 名称和同名引用从通用 `.eln` 迁移为 `.bmeln`。

## 规格自检

- 没有要求修改 Thread。
- 没有把 LIMS 对话流程当成 ELN 正文。
- 没有编造菌株、质粒、载体等当前 mock 不存在的实体。
- 没有把 `.bmeln` 定义成纯 Markdown。
- 图片、Chart Block、签名和附件都作为富文本块设计。
- 第一版范围以展示和基础编辑为主，复杂编辑能力进入后续计划。
