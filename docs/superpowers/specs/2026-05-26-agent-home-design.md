# BioMap Agent 首页 Demo 设计

## 目标

实现 BioMap Agent 的第一个可运行首页 Demo。页面以当前确认的 UI 图为准，提供轻交互体验，重点表达 BioMap Agent 是一个以 Project 和 Thread 为组织方式的研发 Agent Workspace，而不是传统模块入口或任务列表。

第一版范围是轻交互首页，不包含真实后端、真实 Agent 执行、真实审批流程或 Thread 详情页跳转。

## 设计原则

- 保持简洁：首页只呈现用户下一步最可能需要的入口。
- Project 是文件夹式业务上下文，Thread 是对话式工作记录。
- Task 不在左侧导航中出现。
- 通知入口只保留顶部铃铛和红色 Notification Count，不再出现右侧浮动 Approval 卡片。
- 案例卡用于引导用户输入目标，不展示审批状态。
- 保留 Codex 风格的新对话体验：大输入框下方有项目选择行。

## 页面结构

### 顶部导航

顶部导航横跨全页，保持固定高度和轻量边框。

内容包括：
- 左侧 BioMap Agent 完整 logo lockup。该图片必须从当前确认的原型图左上角裁剪，包含点阵图标和 `BioMap Agent` 文字；代码里不再额外渲染一份产品名。
- 中间导航项：Agent、Projects、Assets、Pipelines。
- Agent 为当前激活状态，对应领域里的 Agent Workspace。`Agent` 是单一工作台入口，不表示多 Agent 管理，也不展示 Research Agent、Design Agent 或 Data Agent。
- 右侧 Notification Center 铃铛图标按钮，带红色 badge `3`，不显示文字。badge 表示未读或未处理 Notification 总数，不是待审批数量。Approval Request 是通知类型之一，但铃铛不等同于 Approval 专用入口。
- 用户头像 `Z`、用户名 `zhengjun`、下拉箭头。

第一版交互：
- `Agent` 保持 active。
- `Projects`、`Assets`、`Pipelines` 不跳转页面，hover 有轻微反馈。
- 点击非当前导航项时显示轻量状态文案：`该模块将在后续 Demo 中展开`。
- 点击顶部铃铛图标时显示轻量状态文案：`Notification Center 将在后续 Demo 中展开`。
- 点击用户区时显示轻量状态文案：`Account menu 将在后续 Demo 中展开`。
- 第一版不展示真实用户菜单，不做登录或退出。
- 第一版不新增路由或空白模块页。

### 左侧栏

左侧栏宽度固定，采用浅灰背景。

顶部区域固定，不参与滚动：
- `+ 新对话` 主按钮。
- `搜索` 按钮，点击后展开搜索输入。

点击 `+ 新对话` 后进入 New Thread Draft 状态：
- 清空 `selectedThreadId`，左侧不高亮任何已有 Thread。
- 保留当前 `selectedProjectId`；如果此前选中过 Thread，则保留该 Thread 所属 Project。
- 不向左侧列表插入新的假 Thread。

滚动区域从 `项目` 标题开始，不从侧栏顶部开始。滚动区域不使用底部渐隐。

项目以文件夹组织，线程以会话行展示：
- Antibody Optimization
- Enzyme Discovery
- Data Assetization
- Model-to-Oracle
- Protein Delivery

Project 文件夹交互：
- 默认全部展开。
- 点击 Project 行左侧箭头折叠或展开该 Project。
- 折叠包含当前 `selectedThreadId` 的 Project 时，选中状态保留但不显示在线程列表里。
- 搜索状态下，只显示有匹配 Thread 的 Project，并强制展开匹配结果，避免搜索结果被折叠隐藏。

线程行包含：
- 线程标题。
- Thread Last Activity 短格式时间：`2 分钟`、`1 小时`、`昨天`、`2 天前`。
- 当前选中态浅蓝高亮。
- 选中线程可显示 pin 和归档小图标。

Thread 行工具：
- pin 和归档小图标仅在当前选中 Thread 行展示，作为视觉 affordance。
- 第一版不实现真实 pin、归档、排序或隐藏逻辑。
- 点击这些图标时显示轻量状态文案：`Thread tools 将在后续 Demo 中展开`。
- 这些图标不代表 Task 或 Approval。

每个 Project 内的 Thread 按 Thread Last Activity 降序排列。

点击 Thread 行：
- 更新 `selectedThreadId` 和左侧高亮。
- 同步 `selectedProjectId` 为该 Thread 所属 Project。
- 主工作区仍保持首页 Composer，不切换到 Thread 详情页。
- 主标题不改成 Thread 标题。

搜索交互：
- 顶部固定区保持两列：左侧 `+ 新对话`，右侧搜索区域。
- 未展开时，右侧是 `搜索` 按钮。
- 点击 `搜索` 后，右侧区域替换为紧凑输入框，不挤压 `+ 新对话`。
- 搜索输入 placeholder 为 `搜索 Thread`，带清除 `x`。
- 输入关键字后，只按线程标题过滤各项目下的线程，不过滤时间和 Project 名。
- 输入为空时显示全部 Thread。
- 按 Esc 或点击 `x` 清空并收起搜索。
- 没有匹配时显示简短空状态。

### 主工作区

主工作区占据剩余空间，视觉中心略低于屏幕中线，使输入框更接近页面中心。整个 app 使用 `100svh` 高度，顶栏固定高度，主工作区是独立滚动容器。

主工作区从上到下包括：
- 标题：`我能为你的研发做什么？`。标题文案锁定，不出现 `BioMapAgent` 或 `BioMap Agent`。
- 大对话输入框。
- 输入框下方 Codex 风格项目选择行。
- 能力 chips。
- 固定三列案例卡片区。

主工作区状态文案：
- 使用不占文档流的轻量 floating toast。
- 位置在 Composer 区域右上方附近，不推动输入框、chips 或案例卡。
- 同一时间只显示一条，后触发覆盖前一条。
- toast 自动 2 秒淡出。

### 对话输入框

输入框是首页核心入口。

内容和交互：
- placeholder：`描述一个研发目标，或继续一个 Thread`
- 左下角有加号按钮，表示 Add Context 占位入口。
- 右下角有圆形发送按钮。
- 不显示 `受控访问`。
- 不显示 `5.5 超高` 或任何模型选择器。
- 支持用户输入文本。
- `draft.trim().length === 0` 时，发送按钮 disabled，颜色更浅，点击无状态文案。
- 输入非空后发送按钮变成主色。
- 点击发送且文本非空时，显示轻量状态文案：`已创建 Thread 草稿`，并清空输入框。
- 按 Enter 发送；按 Shift+Enter 换行。
- 发送不跳转页面，不调用后端。
- 点击加号显示轻量状态文案：`Add context 将在后续 Demo 中展开`。
- 第一版不打开文件选择器，不做附件列表。

### 项目选择行

项目选择行紧贴输入框下方，风格参考 Codex。它显示当前新 Thread 将归属的真实 Project，不显示产品名 `BioMap Agent`。

视觉：
- 与输入框同宽。
- 浅灰背景。
- 圆角底边。
- 左侧文件夹图标。
- 当前项目名：`Antibody Optimization`。
- 右侧小下拉箭头。

交互：
- 点击后展开项目菜单。
- 菜单项来自左侧已展示的 Project 列表。
- 选择项目后更新项目选择行文本，表示后续新 Thread 的目标 Project。
- 点击菜单项后关闭菜单。
- 点击菜单外区域或按 Esc 关闭菜单。
- 菜单定位在项目选择行下方左侧，不遮挡输入框。
- 点击左侧 Thread 后，同步项目选择行为该 Thread 所属 Project。
- 手动切换项目不强行改变左侧当前 Thread 选中态。
- 第一版不支持新建 Project，也不在 mockData 中放置空 Project。

### 能力 Chips

能力 chips 位于项目选择行下方，居中排列。

第一版包含：
- 靶点调研
- 设计到湿实验
- 数据资产化
- 模型复用
- 项目交付
- 更多

交互：
- 点击 `靶点调研`、`设计到湿实验`、`数据资产化`、`模型复用`、`项目交付` 后，将对应自然语言研发目标填入输入框。
- 点击 `更多` 显示轻量状态文案：`更多 Capability 将在后续 Demo 中展开`，不改变输入框内容。
- 不立即发送。

### 案例卡片

案例卡固定为三列布局。卡片区位于 chips 下方。

每张卡包含：
- 圆形图标。
- 标题。
- `输入` 说明一行。
- `输出` 说明一行。

卡片文案约束：
- `输入` 和 `输出` 文案必须短，不超过一行。
- 文案用于说明 Agent 可以接收的上下文和可能产出的结果。
- 不写营销式解释文本。

每张卡不包含：
- `审批` 行。
- 橙色审批点。
- Approval 标签。

第一版案例：
- 调研靶点机制与竞品
- 从候选分子生成湿实验订单
- 整理实验结果为 AI-Ready Dataset
- 用实验数据微调 Oracle
- 生成项目周报与风险列表
- 项目交付追踪

底部卡片显示策略：
- 首页视口内第一排完整可见。
- 第二排只露出上半部分或更少。
- 通过主工作区自然 overflow 传达下方可以继续滚动，不额外加“更多”模块。
- 用户滚动主工作区后，可以看到完整第二排卡片。
- 卡片区不使用渐隐。

点击卡片后：
- 将对应案例的自然语言研发目标填入输入框。
- 不立即发送。

示例：点击 `从候选分子生成湿实验订单` 后，输入框填入 `基于当前项目的候选分子，帮我生成一份湿实验验证方案和实验订单草稿。`

## 组件拆分

采用轻组件化方案，避免单个 `App.tsx` 过大。

实现文件：
- `src/App.tsx`：页面组合与轻交互状态。
- `src/data/mockData.ts`：项目、线程、chips、案例卡数据。
- `src/components/TopNav.tsx`：顶部导航。
- `src/components/Sidebar.tsx`：项目与线程列表、搜索。
- `src/components/Composer.tsx`：标题、输入框、项目选择行。
- `src/components/UseCaseGrid.tsx`：chips 与案例卡片。
- `src/App.css`：页面级布局和组件样式。
- `src/index.css`：全局 reset、字体、颜色变量。
- `src/assets/biomap-agent-logo.png`：从原型图左上角裁剪得到的 BioMap Agent 完整 logo lockup，包含点阵图标和产品名文字。

不引入 UI 框架。除 BioMap Agent logo 使用裁剪图片外，其他图标使用统一线性 inline SVG：
- stroke 宽度约 `1.8-2px`。
- 使用圆角端点和圆角连接。
- 常规图标色为深蓝 `#11315f`。
- 强调图标色使用青蓝 `#0897bf` 或 `#19a7c8`。
- 案例卡图标放在浅色圆形底内。

## 状态模型

首页只需要前端本地状态：
- `selectedThreadId`：左侧当前线程。
- `isDraftingNewThread`：是否处于 New Thread Draft 状态。
- `searchOpen`：搜索是否展开。
- `searchQuery`：搜索关键字。
- `selectedProjectId`：输入框下方当前项目。
- `projectMenuOpen`：项目菜单是否展开。
- `draft`：输入框文本。
- `statusMessage`：发送后的轻量状态文案。

## 响应式要求

第一版以桌面演示为主，目标宽度接近 16:9 演示画布。

基础响应式：
- 宽屏保持左侧栏 + 主区布局。
- 中等宽度下缩小主区最大宽度和卡片间距。
- 小屏下左侧栏缩窄，卡片从三列降为一列。小屏不是第一版验收重点。

## 验收标准

- 页面启动后不再出现 Vite 模板内容。
- 顶栏顺序为 `Agent`、`Projects`、`Assets`、`Pipelines`，且只高亮 `Agent`。
- 顶栏 Notification Center 入口只出现一次，表现为铃铛图标加红色 badge，右侧浮动 Approval 卡片不存在。
- 左侧滚动条从 `项目` 区域开始，不覆盖顶部按钮区。
- 左侧滚动区没有底部渐隐。
- 主对话区相对居中，输入框下方有项目选择行。
- 不显示 `受控访问`、`5.5 超高` 或模型选择器。
- 案例卡固定三列。
- 每张案例卡都没有 `审批` 行。
- 第二排案例卡在首屏底部被部分裁切。
- 输入、发送、线程选择、搜索、项目选择、chip 点击、卡片点击都有轻交互反馈。
- `npm run lint` 通过。
- `npm run build` 通过。
- 浏览器检查首页无明显布局破损和控制台错误。

## 非目标

第一版不实现：
- 真实 Agent 调用。
- 真实 Thread 创建或详情页。
- 真实 Notification Center 或 Approval 审批队列。
- 后端 API。
- 登录鉴权。
- BioMap OS 旧模块页面。
- 复杂移动端适配。
