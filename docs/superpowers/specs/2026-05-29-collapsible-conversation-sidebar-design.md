# Collapsible Conversation Sidebar 设计

## 状态

本 spec 定义 BioMap Agent Demo 左侧侧栏的紧凑化与收起态设计。它只改导航外壳，不重新设计 EGFR 对话、Run Inspector、顶部导航或 mock 数据内容。

本次术语统一：

- `Thread` 在 UI 文案中统一称为 **对话**。
- 当前主按钮保持 `新对话`。
- ChatGPT 的“最近聊天”概念在本 Demo 中称为 `最近对话`。
- 代码层可以继续使用现有 `Thread` 类型，不强制重命名数据模型。
- `任务` 保留给领域里的 **Task**，不能用于表示 Thread。
- `工作` 不作为本轮侧栏 UI 口径，避免和 **Workflow** / `工作流` 混淆。

## 目标

1. 缩小展开态 `新对话`按钮，减少左侧顶部空间占用。
2. 给左侧侧栏增加展开 / 收起能力。
3. 收起态保留一条类似 ChatGPT Web 的 icon rail，而不是完全隐藏。
4. 收起态仍能快速新建对话、进入搜索、查看最近对话。
5. 侧栏收起 / 展开状态用 Zustand 持久化，刷新后保持。

## 范围

包含：

- `Sidebar` 增加展开态和收起态两种布局。
- `App` / store 增加 `sidebarCollapsed` 状态和切换动作。
- `demoStoreLogic` 增加最近对话 selector，统一过滤、排序和数量限制。
- 展开态主按钮文案保持 `新对话`，高度缩小到接近文字高度。
- 收起态显示 icon rail。
- 收起态 `最近对话` hover / focus 时显示 popover。
- 收起态 `搜索`点击后展开完整侧栏并进入现有搜索态。
- 侧栏内对话类文案保持对话口径。
- 更新测试覆盖持久化和基础交互。

不包含：

- 重新设计顶部 `TopNav`。
- 重命名代码里的 `Thread`、`DemoThread`、`New Thread Draft` 等类型。
- 给收起态实现完整项目树。
- 在收起态 popover 里提供三点菜单、置顶、重命名、删除。
- 新增真实快捷键系统。
- 改动 Run Inspector 的侧栏行为。
- 创建或展示真实 **Task** 记录。

## 设计原则

- 收起态是快速入口，不是另一套完整导航。
- 展开态保留项目 / 对话列表的完整可管理能力。
- 收起态只承担入口和快速跳转，避免复杂菜单。
- 主内容区应随着侧栏收起自然变宽。
- 交互以鼠标为主，同时保留键盘可达性。
- 不使用 ARIA `menu/menuitem`，除非实现完整菜单键盘模式；本次继续使用原生 button/list 语义。

## 展开态侧栏

### 顶部区域

展开态顶部包含：

```text
[新对话]                                      [收起按钮]
```

具体实现必须是同一行：`新对话`占据主要宽度，收起按钮在右侧保持固定方形尺寸。关键要求：

- `新对话`仍是蓝色主按钮。
- 文案保持 `新对话`。
- 高度从当前约 `42px` 缩小到 `32px` 到 `34px`。
- padding 更紧，圆角建议 `7px` 到 `8px`。
- 图标仍用加号。
- 顶部区域整体 padding 缩小，避免大块空白。
- `新对话`和收起按钮之间保留 `8px` 左右间距。

收起按钮：

- 使用侧栏 / panel 图标，不使用文字按钮。
- `aria-label="收起侧栏"`。
- `aria-expanded={true}`。
- hover 时显示浅背景。
- 点击后进入 icon rail 收起态。

### 项目区域

展开态项目区域沿用当前结构：

- `项目`标题行。
- 搜索图标在 `项目`同一行。
- 项目文件夹。
- 项目下对话列表。
- 置顶区如果有置顶对话则显示。
- Thread/对话行 hover 时显示置顶和三点按钮。

改动：

- 对话行的 UI 文案不用出现 `Thread`。
- 搜索框 placeholder / aria label 保持 `搜索对话`。
- 搜索无结果文案保持 `未找到相关对话`。
- 空项目文案保持 `暂无对话`。
- 重命名弹窗文案保持 `编辑对话名称`。
- 删除弹窗文案保持 `确定删除对话？`，说明文字使用 `删除后，此对话的记录和上下文将不可恢复。`
- 三点菜单 aria label 保持 `打开对话菜单`。

## 收起态 icon rail

### 布局

收起态保留一条固定宽度 icon rail：

```text
[展开]

[新对话]
[搜索]
[最近对话]
```

要求：

- 宽度建议 `60px` 到 `64px`。
- 高度仍占满 TopNav 下方区域。
- 保留右侧 `1px` 分割线。
- 背景沿用侧栏背景。
- 不显示 BioMap Agent logo，Logo 仍由顶部导航承担。
- 主内容区域 grid 从 `270px + 1fr` 切换为 `64px + 1fr`。
- 收起状态下隐藏项目树、置顶区、对话列表和展开态搜索框。

### 按钮

rail 中固定显示 4 个按钮：

1. 展开侧栏
2. 新对话
3. 搜索
4. 最近对话

按钮要求：

- 每个按钮是方形 icon button，建议 `36px` 到 `40px`。
- 默认透明背景。
- hover / focus 时显示浅色 pill 背景。
- 当前有选中对话时，`最近对话`按钮可以显示轻微 active 态。
- 每个按钮都有明确 `aria-label`。

Tooltip / hover 内容：

- `展开侧栏`按钮 hover 显示黑色 tooltip：`展开侧栏`。
- `新对话`按钮 hover 显示黑色 tooltip：`新对话`。
- `搜索`按钮 hover 显示黑色 tooltip：`搜索对话`。
- `最近对话`按钮 hover / focus 显示 popover，而不是只显示短 tooltip。

## 收起态交互

### 展开按钮

点击后：

- `sidebarCollapsed=false`。
- 侧栏回到完整展开态。
- 原有项目展开状态保持。
- 如果之前处于搜索态，搜索态是否保持由当前 search state 决定；不额外清空。

### 新对话按钮

点击后：

- 调用现有 `startNewThread()`。
- 主内容进入 New Thread Draft composer。
- 此时还没有创建 durable Thread；只有提交后才会新增 Thread / 对话。
- 侧栏保持收起，不强制展开。
- New Thread Draft composer 中的项目选择逻辑不变。

### 搜索按钮

点击后：

- 先展开侧栏。
- 再进入现有搜索态。
- 聚焦搜索输入框。
- 搜索框文案使用 `搜索对话`。

理由：搜索需要输入框和结果列表，放进窄 popover 会拥挤；复用展开态搜索最稳。

### 最近对话按钮与 Popover

hover / focus 最近对话按钮时显示 popover：

```text
最近对话

EGFR 抗体亲和力优化        18 小时
Antibody Optimization

CD3 双抗序列优化分析       19 小时
Antibody Optimization

...
```

规则：

- 最多显示 8 条。
- 数据来自所有未归档 Thread；已归档和已删除 Thread 不显示。
- New Thread Draft 不显示在最近对话里。
- 排序按 **Thread Last Activity** 从新到旧，不按创建时间。
- Pinned Thread 可以出现在最近对话里，但不做置顶分组，仍按 **Thread Last Activity** 排序。
- 每行显示对话标题、项目名小字、相对时间。
- 当前选中对话可用浅背景或左侧细线标识；New Thread Draft 状态下不显示选中项。
- 点击对话后调用现有 `selectThread(projectId, threadId)`。
- 点击对话后 popover 关闭，侧栏保持收起。
- 如果没有对话，显示 `暂无对话`。
- 不展示置顶、归档、删除、重命名等管理操作。

Popover 行为：

- 鼠标 hover 最近对话按钮时打开。
- 鼠标移入 popover 时保持打开。
- 鼠标离开按钮和 popover 后关闭。
- 最近对话按钮获得键盘 focus 时打开。
- `Escape` 关闭。
- 点击外部关闭。
- Tab 可以进入 popover 内的对话按钮；不使用 ARIA menu 模式。

视觉：

- popover 从 rail 右侧弹出。
- 宽度建议 `300px` 到 `340px`。
- 最大高度建议 `min(520px, calc(100vh - 120px))`，超出内部滚动。
- 圆角建议 `14px` 到 `16px`。
- 使用白色背景、细边框、轻阴影。
- 不遮挡 rail 本身。

## 状态持久化

新增 UI 状态：

```ts
sidebarCollapsed: boolean
```

新增动作：

```ts
toggleSidebarCollapsed(collapsed: boolean): void
```

持久化规则：

- `sidebarCollapsed` 写入 Zustand persist。
- 默认值为 `false`，首次进入保持展开态。
- `reset()` 清理 localStorage 后回到展开态。
- 删除 Thread 不影响 `sidebarCollapsed`。
- 侧栏状态和 Run Inspector 状态互不影响。
- 侧栏状态不按 Thread 区分，是整个 Demo 的全局浏览状态。

## 组件边界

### `App`

负责：

- 从 store 读取 `sidebarCollapsed`。
- 把状态和切换动作传给 `Sidebar`。
- 根据 `sidebarCollapsed` 给 `agent-shell` 增加 class。

建议 class：

```tsx
className={`agent-shell${sidebarCollapsed ? ' agent-shell--sidebar-collapsed' : ''}`}
```

### `Sidebar`

负责：

- 渲染展开态侧栏。
- 渲染收起态 icon rail。
- 管理最近对话 popover 的临时打开状态。
- 复用现有 `onNewThread`、`onSearchOpenChange`、`onSelectThread`。
- 接收 `sidebarCollapsed` 和 `onSidebarCollapsedChange` props，不直接读写 store。

建议拆分内部小组件：

- `SidebarRail`
- `RecentConversationsPopover`

如果实现时文件变大明显，优先拆到独立组件，避免 `Sidebar.tsx` 继续膨胀。

### Store

修改：

- `DemoStateSnapshot` 增加 `sidebarCollapsed`。
- `createInitialDemoState` 默认 `false`。
- `sanitizeDemoState` 接受 boolean，否则回退默认。
- `partialize` 包含 `sidebarCollapsed`。
- `merge` 恢复 `sidebarCollapsed`。

新增 selector：

```ts
getRecentThreadEntries(projects: DemoProject[], limit = 8): ThreadEntry[]
```

规则：

- 过滤 `archived` Thread。
- 按 `lastActivityAt` 从新到旧排序。
- 截断到 `limit` 条。
- 不按 `pinnedAt` 重新排序。

理由：最近对话是领域派生数据，放在 `demoStoreLogic` 里比在 `Sidebar` 组件里临时计算更容易测试，也能避免 popover 和展开态列表各自实现一套排序规则。

## CSS 规格

关键尺寸：

- 展开态 sidebar 宽度：沿用当前 `270px`。
- 收起态 rail 宽度：`64px`。
- 展开态 `新对话`按钮高度：`32px` 到 `34px`。
- rail icon button：`38px` 左右。
- 最近对话 popover：`320px` 左右。

关键 class 建议：

```css
.agent-shell--sidebar-collapsed
.sidebar--collapsed
.sidebar__rail
.sidebar__rail-button
.sidebar__rail-tooltip
.sidebar__recent-conversation-popover
.sidebar__recent-conversation-item
.sidebar__recent-conversation-item--selected
```

响应式：

- 桌面按 `270px / 64px` 切换。
- 小屏展开态可以继续使用现有窄侧栏策略，但收起态固定优先使用 `64px` rail。
- 窄屏不新增底部导航。

## 可访问性

- 所有 icon button 必须有 `aria-label`。
- 收起/展开按钮使用 `aria-expanded` 表达当前侧栏展开状态。
- 最近对话 popover 不使用 `role="menu"`。
- 最近对话列表使用普通 button 列表即可。
- `Escape` 能关闭最近对话 popover。
- 搜索按钮点击展开后，搜索 input 应获得 focus。
- 键盘用户可以 Tab 到 rail 按钮和 popover 内对话。

## 测试计划

### Store 测试

新增/更新：

- 初始 `sidebarCollapsed` 为 `false`。
- `toggleSidebarCollapsedSnapshot(state, true)` 后状态为 `true`。
- Zustand persist partialize 包含 `sidebarCollapsed`。
- merge 恢复合法 boolean。
- 非 boolean persisted value 回退默认。
- `getRecentThreadEntries` 过滤归档 Thread。
- `getRecentThreadEntries` 按 `lastActivityAt` 降序排序。
- `getRecentThreadEntries` 默认最多返回 8 条。

### Component 测试

新增/更新：

- 展开态渲染 `新对话`。
- 展开态点击收起按钮后调用 `onSidebarCollapsedChange(true)`。
- 收起态只显示 rail，不显示项目树。
- 收起态点击 `新对话`调用 `onNewThread`，不强制展开。
- 收起态点击 `搜索对话`调用展开和搜索打开。
- hover / focus 最近对话按钮显示 `最近对话` popover。
- 最近对话 popover 最多渲染 8 条。
- 点击最近对话调用 `onSelectThread(projectId, threadId)`。

### Browser 验证

在 `http://localhost:5173/` 验证：

1. 展开态 `新对话`按钮更紧凑。
2. 点击收起按钮后左侧变成 icon rail。
3. 主内容区宽度增加。
4. rail 上 hover 显示 tooltip / 最近对话 popover。
5. 点击搜索后侧栏展开并聚焦搜索框。
6. 刷新后侧栏保持收起或展开状态。
7. `reset()` 后恢复展开态。

## 非目标与风险

- 本次不做完整快捷键提示，避免显示不存在的快捷键。
- 最近对话 popover 不做管理功能，避免和完整侧栏重复。
- 收起态不显示项目树；用户需要管理项目时应展开侧栏。
- 如果 hover popover 在边界上出现抖动，实现时需要让按钮和 popover 共同组成 hover 区域，或加入极短关闭延迟。
