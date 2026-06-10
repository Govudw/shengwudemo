# BioMap Agent 可交互 Demo 与 Zustand 持久化设计

## 目标

把当前 BioMap Agent 首页从静态 mock Demo 升级为可交互 Demo。用户可以在浏览器里真实创建、选择、置顶、重命名、归档和删除 Thread；这些 Demo State 在刷新后保留。

本阶段仍然是纯前端 Demo，不接入后端、不调用真实 Agent、不实现 Thread 详情页、不实现真实分享或权限体系。

## 设计原则

- `mockData.ts` 是只读 seed，不在运行时直接修改。
- Zustand store 维护 Demo State 中的 Project/Thread 副本和 UI selection 状态。
- 业务对象状态需要持久化；临时 UI 浮层不持久化。
- Project 是稳定容器，本阶段只允许改 Thread，不允许改 Project。
- 置顶和菜单行为要像真实产品，但不要引入过重管理页面。
- `reset()` 是演示前恢复现场的开发者命令，不放进产品 UI。

## 依赖

新增依赖：

```json
{
  "zustand": "^5"
}
```

使用 Zustand `persist` middleware，将 Demo store 写入 `localStorage`。

建议 persist key：

```ts
"biomap-agent-demo-store-v1"
```

persist 配置要求：

- 使用 `version: 1`。
- 使用 `partialize` 只持久化 `projects`、`selectedProjectId`、`selectedThreadId`、`isDraftingNewThread`、`draft`、`expandedProjectIds`。
- `statusMessage`、搜索状态、菜单状态、弹窗状态必须排除在 persist payload 外。
- 如果未来 persist version 不匹配，第一版可以直接丢弃旧 Demo State 并从 seed 重建，不做复杂 migration。

## 数据模型

`src/data/mockData.ts` 继续保留当前 Project、Thread、Capability、UseCase seed 数据。

新增 Demo State 类型建议：

```ts
type DemoThread = {
  id: string
  title: string
  lastActivityAt: number
  pinned: boolean
  pinnedAt: number | null
  archived: boolean
  createdAt: number
}

type DemoProject = {
  id: string
  name: string
  threads: DemoThread[]
}
```

初始化时从 `projects` seed 复制 Demo State：

- 初始 thread `pinned = false`
- 初始 thread `pinnedAt = null`
- 初始 thread `archived = false`
- 初始 thread `lastActivityAt` 从 seed 的 `lastActivity` 标签换算成稳定时间戳，无法可靠换算时按 seed 顺序生成稳定 fallback
- 初始 thread `createdAt` 可以按 seed 顺序生成稳定值

删除 Thread 时直接从 Demo State 中移除，不保留 deleted 列表。

`lastActivityAt` 是持久化的领域时间点；`刚刚`、`2 分钟`、`1 小时`、`昨天`、`2 天前` 等只是 UI 渲染标签，不写入 Demo State。

## 持久化状态

需要持久化：

- `projects`: Demo State 中的 Project/Thread 副本，包括新增、重命名、置顶、归档后的 Thread 状态
- `selectedProjectId`
- `selectedThreadId`
- `isDraftingNewThread`
- `draft`
- `expandedProjectIds`

不持久化：

- `searchOpen`
- `searchQuery`
- `projectMenuOpen`
- 当前打开的三点菜单 id
- 当前打开的重命名弹窗状态
- 当前打开的删除确认弹窗状态
- toast message
- hover/focus 状态

刷新恢复规则：

- 恢复 `selectedProjectId`。
- 如果刷新前选中了 Thread，且该 Thread 仍存在并且未归档，则恢复选中。
- 如果刷新前是新对话状态，则保持新对话，不高亮左侧 Thread。
- 如果选中的 Thread 被归档或删除，则回到新对话状态。
- 恢复 Project 展开/折叠状态。
- 搜索刷新后关闭并清空。

异常恢复规则：

- 如果持久化的 `selectedProjectId` 不存在，回退到第一个 Project。
- 如果持久化的 `expandedProjectIds` 包含不存在的 Project，过滤掉。
- 如果所有 Project 都存在但某个 Project 没有 Thread，仍显示该 Project，并在展开区显示 `暂无对话`。
- 如果 `selectedThreadId` 为空，强制 `isDraftingNewThread = true`。
- 如果 `selectedThreadId` 指向不存在或已归档的 Thread，清空 `selectedThreadId` 并进入 New Thread Draft 状态。
- 如果 `selectedThreadId` 有效，强制 `isDraftingNewThread = false`，并确保该 Thread 所属 Project 在 `expandedProjectIds` 中。

## Store API

新增文件：

```text
src/store/useDemoStore.ts
```

store 建议暴露状态：

- `projects`
- `selectedProjectId`
- `selectedThreadId`
- `isDraftingNewThread`
- `draft`
- `expandedProjectIds`
- `statusMessage`

store 建议暴露 actions：

- `startNewThread()`
- `selectThread(projectId, threadId)`
- `setSelectedProject(projectId)`
- `setDraft(draft)`
- `submitDraft()`
- `toggleProject(projectId)`
- `togglePinned(threadId)`
- `renameThread(threadId, title)`
- `archiveThread(threadId)`
- `deleteThread(threadId)`
- `showStatus(message)`
- `clearStatus()`
- `resetDemoState()`

组件可以通过 props 接收 store 状态和 actions，也可以在组件内直接使用 store selectors。第一版建议由 `App.tsx` 读取主要状态并向子组件传递，避免组件和 store 过早强耦合。

## 提交 Draft

点击发送按钮或在输入框内按 Enter 且 `draft.trim()` 非空时提交 draft。提交行为由当前状态决定。`Shift+Enter` 保留为输入换行，不提交。

### New Thread Draft 状态

行为：

- 从当前 `selectedProjectId` 找到目标 Project。
- 使用 draft 第一行生成 Thread 标题。
- 标题生成规则：
  - trim 首尾空白。
  - 将连续空白压缩为一个空格。
  - 标题超过约 22 个中文字符或 44 个英文字符时截断并加 `...`。
  - 允许重复标题。
- 新 Thread 插入当前 Project 的 Thread 列表顶部。
- 新 Thread 字段：
  - `id`: 时间戳加随机短串。
  - `title`: 生成标题。
  - `lastActivityAt`: 当前时间戳。
  - `pinned`: `false`。
  - `pinnedAt`: `null`。
  - `archived`: `false`。
  - `createdAt`: 当前时间戳。
- 创建后自动选中新 Thread。
- `isDraftingNewThread = false`。
- 清空 `draft`。
- 不显示 toast。
- 刷新后新 Thread 仍存在并保持选中。

### 已选中 Thread 状态

行为：

- 不创建新 Thread。
- 更新当前 Thread 的 `lastActivityAt` 为当前时间戳。
- 将该 Thread 移动到所属 Project 的 Thread 列表顶部。
- 如果该 Thread 是 Pinned Thread，`pinnedAt` 不变，置顶排序不变。
- 清空 `draft`。
- `selectedThreadId` 保持不变。
- `isDraftingNewThread = false`。
- 显示 toast：`已添加到当前 Thread`。
- 第一版不展示消息流，但行为语义是继续当前 Thread。

点击 `+ 新对话`：

- 清空 `selectedThreadId`。
- `isDraftingNewThread = true`。
- 清空 `draft`。
- 保留当前 `selectedProjectId`。
- 左侧不高亮任何 Thread。

从 composer 的 Project selector 选择 Project：

- 如果选择的是当前已选 Thread 所属 Project，不改变 Thread 选中态。
- 如果选择的是不同 Project，设置 `selectedProjectId` 为目标 Project，清空 `selectedThreadId`，并进入 New Thread Draft 状态。
- 在 New Thread Draft 状态下选择任何 Project，设置 `selectedProjectId` 为目标 Project，并保持 New Thread Draft 状态。
- 切换 Project 时保留当前 `draft`。
- 确保目标 Project 在 `expandedProjectIds` 中。
- 进入 New Thread Draft 状态后，左侧不高亮任何 Thread。

## 选中 Thread 后的主区状态

本阶段不实现完整 Thread 详情页，但选中 Thread 后需要有轻量反馈，避免用户感觉选择没有生效。

行为：

- 左侧高亮当前 Thread。
- `selectedProjectId` 同步为该 Thread 所属 Project。
- `isDraftingNewThread = false`。
- 主区仍保留首页 composer 和案例卡结构。
- composer placeholder 从新对话态的 `描述一个研发目标，或继续一个 Thread` 切换为 `继续推进这个 Thread...`。
- Project selector 显示该 Thread 所属 Project。
- 用户可以继续输入并提交；提交会更新当前 Thread 的活动时间，不创建新 Thread。

## 左侧置顶区

初始状态不显示置顶区。

当至少一个 Thread 被置顶后，在左侧滚动区的 `项目` 之上显示 `置顶` 区。

置顶区行为：

- 全局展示所有 pinned 且未 archived 的 Thread。
- 不按 Project 分组。
- 每项只显示 Thread 标题和由 `lastActivityAt` 格式化出的时间标签，不显示 Project 名。
- 点击置顶项后：
  - 选中对应 Thread。
  - 同步 `selectedProjectId` 为该 Thread 所属 Project。
  - `isDraftingNewThread = false`。
- Pinned Thread 在置顶区和 Project 原位置都可点击，二者指向同一个 Thread。
- pinned Thread 仍保留在原 Project 列表中，不从原位置移除。
- 置顶排序按 `pinnedAt` 降序，最近置顶在最上方。
- 取消置顶后从置顶区消失。
- 如果没有 pinned Thread，隐藏整个 `置顶` 区，直接显示 `项目`。

Thread hover 工具区保留 pin 快捷按钮：

- 默认 Thread 行显示标题和时间。
- hover/focus 时隐藏时间，显示工具按钮。
- 第一个工具按钮是 pin。
- 点击 pin 切换置顶/取消置顶，并持久化。
- 置顶状态可以通过 pin 图标的 active 色或常驻弱提示表达。
- 置顶区里的 Thread 行也使用同样的 hover 工具；取消置顶后只从置顶区消失，Project 原位置保留。

## 三点菜单

原归档快捷图标替换为三点菜单按钮。

hover/focus Thread 行时显示：

- pin 快捷按钮
- 三点菜单按钮

三点菜单规则：

- 菜单浮在当前 Thread 行右侧，参考截图样式。
- 菜单可以从 Project Thread 行或置顶区 Thread 行打开。
- 点击三点打开。
- 点击菜单外关闭。
- 按 Esc 关闭。
- 执行菜单项后关闭。
- 同一时间只允许打开一个菜单。
- 菜单打开状态不持久化。
- 不管从哪个入口打开，菜单动作都作用于同一个 Thread。

菜单项：

1. 分享
2. 重命名
3. 归档
4. 删除

分享：

- 点击后显示 toast：`分享功能将在后续版本开放`。
- 不复制剪贴板。
- 不打开系统分享。
- 不持久化。

归档：

- 点击后把 Thread 标记为 `archived = true`。
- 归档后 Thread 从 Project 列表隐藏。
- 如果该 Thread pinned，也从置顶区隐藏。
- 如果从置顶区执行归档，Thread 也从 Project 原位置隐藏。
- Archived Thread 仍保留在 Demo State 中，但第一版首页不提供查看或恢复入口。
- 如果归档的是当前选中 Thread，回到新对话状态，左侧不选中任何 Thread。
- 不改变 `selectedProjectId`。
- 显示 toast：`已归档`。
- 不提供恢复入口。
- 刷新后仍隐藏。

删除：

- 点击后打开删除确认弹窗。
- 不直接执行删除。

## 重命名弹窗

点击菜单 `重命名` 后，屏幕中央弹出重命名弹窗。

弹窗样式参考用户给出的截图：

- 背景有半透明灰色遮罩。
- 弹窗居中。
- 白色面板，圆角，轻阴影。
- 标题：`编辑对话名称`。
- 右上角有关闭 `X`。
- 一个文本输入框，默认值为当前 Thread 标题。
- 底部按钮：`取消`、主按钮 `确定`。

交互：

- 打开后输入框自动 focus，并选中当前标题文本。
- 输入非空标题后点击 `确定` 或按 Enter，更新 Thread title 并持久化。
- 标题保存前 trim 首尾空白，并将连续空白压缩为一个空格。
- 如果该 Thread 在置顶区，置顶区和 Project 原位置同步显示新标题。
- 如果该 Thread 当前被选中，主区 aria label 同步更新。
- 输入为空或全空白时不更新，显示 toast：`名称不能为空`。
- 点击 `取消`、右上角 `X` 或按 Esc 关闭弹窗，不更新。
- 弹窗状态不持久化。

## 删除确认弹窗

点击菜单 `删除` 后，屏幕中央弹出删除确认弹窗。

弹窗样式参考用户给出的截图：

- 背景有半透明灰色遮罩。
- 弹窗居中。
- 白色面板，圆角，轻阴影。
- 左侧橙色警告图标。
- 标题：`确定删除对话？`
- 文案：`删除后，此对话的记录和工作上下文将不可恢复。`
- 底部按钮：`取消`、红色主按钮 `删除`。

交互：

- 打开后默认 focus `取消` 按钮，避免键盘误触直接删除。
- 点击 `取消` 或按 Esc 关闭弹窗，不删除。
- 点击红色 `删除` 后从 Demo State 中移除该 Thread，并持久化。
- 如果被删除 Thread pinned，会自动从置顶区消失。
- 如果从置顶区执行删除，Thread 从 Demo State 中移除，置顶区和 Project 原位置同时消失。
- 如果删除的是当前选中 Thread，回到新对话状态，左侧不选中任何 Thread。
- 不改变 `selectedProjectId`。
- 不显示 toast。
- 删除不可恢复。
- 弹窗状态不持久化。

## Project 列表与空状态

Project 本阶段固定，不允许新建、重命名、删除或排序。

Project 展开区显示未 archived 的 threads。

如果某个 Project 内没有可见 Thread：

- 仍显示 Project 文件夹。
- 展开后显示 `暂无对话`。

搜索状态：

- 搜索只过滤未 archived 的 Thread 标题。
- 搜索同时作用于置顶区和 Project 下的 Thread 列表。
- 搜索开启时，置顶区只显示标题匹配的 Pinned Thread；没有匹配时隐藏置顶区。
- 搜索开启时，Project 列表只显示至少有一个匹配 Thread 的 Project。
- 搜索开启时，不在每个 Project 下显示 `暂无对话`。
- 搜索开启且全局没有匹配 Thread 时，在列表区显示 `未找到相关对话`。
- 搜索关闭后恢复完整置顶区和完整 Project Thread 列表。
- 搜索状态不持久化。

## Composer Draft 持久化

当前 draft 需要持久化。

行为：

- 用户输入 draft 后刷新页面，draft 仍保留。
- 点击能力 chip 或案例卡会覆盖当前 draft。
- 点击发送成功提交 draft 后清空 draft。
- 点击 `+ 新对话` 清空 draft。
- 切换 Project 不清空 draft，只改变新 Thread 的归属上下文。
- Draft 不单独记录 origin Project；它始终提交到当前 `selectedProjectId`。

## reset 命令

在开发者 console 暴露全局命令：

```js
reset()
```

执行后：

- 清空 Zustand persist localStorage key。
- 恢复 mock 初始数据。
- 清空 draft、selection、pinned、archived、renamed、deleted 等运行状态。
- 自动 `window.location.reload()`。

实现方式：

- 在应用启动时挂载 `window.reset`。
- TypeScript 需要为 `Window` 增加类型声明。
- 函数不展示在 UI 中。
- 命令名使用短名 `reset`，不使用 `window.__biomapAgentResetDemo()`。

## 组件调整

`App.tsx`：

- 从 Zustand store 读取 Demo State 中的 projects 和主要状态。
- 移除当前散落的 `useState` 状态。
- 继续负责组合 TopNav、Sidebar、Composer、UseCaseGrid。
- 管理 toast auto-clear 的 effect 可以保留在 App 或 store action 中。

`Sidebar.tsx`：

- 接收 Demo State 中的 projects。
- 支持 pinned section。
- 支持空 Project 状态。
- Thread hover tools 改为 pin + three-dot menu。
- 菜单打开状态可以由 Sidebar 本地 state 管理。
- 重命名和删除弹窗可以由 Sidebar 本地 state 管理，并调用 store actions。

`Composer.tsx`：

- draft 来自 store。
- selectedProjectId 来自 store。
- 发送调用 `submitDraft()`。
- 项目菜单打开状态继续是本地临时 UI 状态，不持久化。

`UseCaseGrid.tsx`：

- 点击 chip/card 调用 `setDraft(prompt)`。
- 如果当前 draft 非空，点击 chip/card 也直接覆盖。
- 覆盖后 composer 获得焦点，用户可以继续编辑。
- 不立即发送。

新增可选组件：

- `ThreadActionMenu.tsx`
- `RenameThreadDialog.tsx`
- `DeleteThreadDialog.tsx`

如果实现量较小，也可以先放在 `Sidebar.tsx` 内，后续再拆出。

## 非目标

本阶段不做：

- 真实后端持久化。
- 真实 Agent response 或消息流。
- Thread 详情页。
- Project 新建、重命名、删除。
- Project 或 Thread 拖拽排序。
- Archive 管理页面或恢复入口。
- 真实分享链接或剪贴板写入。
- 多用户同步。
- URL query/hash 路由状态。

## 验证计划

命令验证：

- `npm run lint`
- `npm run build`

Chrome Use 验证：

1. 初始进入无左侧 Thread 高亮。
2. 输入 draft 并刷新，draft 保留。
3. 发送 draft 后当前 Project 顶部新增 Thread，并自动选中。
4. 刷新后新增 Thread 仍存在并选中。
5. 选中已有 Thread 后输入 draft 并发送，Thread 数量不变，该 Thread 移到所属 Project 顶部，时间更新为 `刚刚`，左侧仍高亮该 Thread。
6. 在已选中 Thread 状态下从 Project selector 选择另一个 Project，左侧 Thread 高亮清除，进入新对话状态，draft 保留，后续提交进入新 Project。
7. hover Thread 后显示 pin + 三点菜单。
8. 点击 pin 后出现 `置顶` 区，刷新后仍保留。
9. Pinned Thread 在置顶区和 Project 原位置都可点击，选中的是同一个 Thread。
10. 再次点击 pin 后置顶区消失，Project 原位置保留。
11. 三点菜单点击分享，只显示 `分享功能将在后续版本开放` toast。
12. 从置顶区三点菜单点击重命名，弹出居中重命名弹窗；确认后置顶区和 Project 原位置标题同步更新并持久化。
13. 重命名为空标题时不更新，并显示 `名称不能为空` toast。
14. 从置顶区三点菜单点击归档，Thread 从置顶区和 Project 列表隐藏；刷新后仍隐藏。
15. 三点菜单点击删除，先弹出确认弹窗；确认后 Thread 删除并持久化，置顶区和 Project 原位置同时消失。
16. 删除或归档当前选中 Thread 后，主区回到新对话，左侧无高亮，Project selector 不变。
17. 空 Project 展开后显示 `暂无对话`。
18. 搜索同时过滤置顶区和 Project Thread 列表；全局无匹配时显示 `未找到相关对话`。
19. 搜索刷新后不恢复，菜单和弹窗刷新后也不恢复。
20. 在创建、置顶、重命名、归档、删除过 Thread 后，console 执行 `reset()`，页面自动刷新，`biomap-agent-demo-store-v1` 被清空，初始 seed 数据恢复，主区回到新对话状态，左侧无 Thread 高亮。
21. Chrome console 无 error。
