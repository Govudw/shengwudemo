# Experiment Assets Workbench Design

## 目标

在 `Assets > 实验` 下设计一版清晰、可交互、适合 Agent Demo 的实验资产系统。

这个设计参考 BioMap OS Auto 项目中的智能实验操作手册，但不复刻完整 LIMS。Demo 需要把 BioMap OS 原版“智能实验”里的对象抽象成 Agent 可浏览、可引用、可发起操作的资产目录，并让用户能在卡片视图和表格视图之间切换。

核心目标：

- 把当前粗粒度的 `需求 / 执行 / 库存 / 配置` 改成更清晰的实验资产信息架构，并将第一栏命名为 `实验列表`。
- 将 `配置` 改名为 `设备`，只表达设备、点位、可用窗口等执行资源。
- 新增 `配方` 资产对象，表达可复用实验方法、参数模板、质控阈值和工作流规则。
- 主视图支持 `卡片 / 表格` 切换，并用 Zustand 持久化切换状态。
- 第一版只做 mock Demo，不触发真实 BioMap OS 写操作。

## 参考来源

本 spec 参考：

- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/BiomapOS_操作手册.md`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/BiomapOS_探索报告.md`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-smart-experiment-home.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-molecule-registration.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-experiment-orders.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-experiment-tasks.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-scheduling.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-cro-orders.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-records.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-sample-info.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-material-inventory.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-plate-info.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-device-info.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-location-info.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-experiment-route.png`
- `/Users/songxuzhengjun/Documents/BiomapOSAuto/output/screenshots/04-exp-workflow.png`

这些文件只提供结构和术语参考。Demo 数据必须继续使用 mock 数据，避免混入真实人员、真实邮箱或真实业务数据。

## 已收敛的 Grill 决策

- 第一栏不用 `需求`，统一命名为 `实验列表` / `Experiment List`。
- `实验列表` 只展示实验/订单级对象，不展示单个 `Candidate Molecule` 主卡片。
- `Experiment Task` 属于 `执行`，不属于 `实验列表`。
- `Experiment Order Draft` 可以作为 project-scoped Experiment Asset 出现在实验列表，但必须标为 `订单草稿`。
- `配置` 不再作为实验菜单；改为 `设备` / `Experiment Equipment`。
- `设备` 只承载设备类型、设备实例、点位和可用窗口，不承载实验方法模板。
- 新增 `配方` / `Experiment Recipe`，作为 Agent 可引用的实验方法资产。
- `Experiment Recipe` 可以关联 BioMap OS 原版 `Experiment Workflow`，但二者不是同一个概念。
- `Experiment Recipe` 支持 public 和 project scope；Agent 生成订单时优先使用 project recipe。
- 执行、库存、设备中的多数对象是 `Experiment Operational Record`，不是 Agent 分析资产。
- 实验资产视图模式在五个实验子菜单之间共享并持久化；类型/状态筛选不持久化。

## 术语

`实验资产`：Agent Demo 中可被浏览、搜索、引用和追踪的实验相关对象。它可以来自 BioMap OS 原版智能实验的 LIMS 表，也可以是 Agent OS 新抽象出的可复用对象。

`设备` / `Experiment Equipment`：实验执行资源，包括设备类型、设备实例、实验点位和可预约窗口。不要再使用 `配置` 作为菜单名，设备页也不承载配方、实验线路或工作流方法模板。

`配方` / `Experiment Recipe`：新增资产对象。原版 BioMap OS 中有实验线路、工作流和方法参数，但没有明确叫“配方”的资产。Demo 中把这些可复用方法抽象为配方，例如 `BLI_KD_v2`、`SEC_HPLC_QC_v1`、`Expression_Purification_v1`。

`配方`不是文件，也不是单纯 SOP 文档。它是可被 Agent 调用的实验方法资产，包含参数、质控阈值、物料消耗规则，并可关联 BioMap OS 原版 `Experiment Workflow`。

## 信息架构

`Assets > 实验` 左侧二级菜单改为 5 类：

| 菜单 | 含义 | 对应 BioMap OS 原版对象 | Demo 重点 |
| --- | --- | --- | --- |
| 实验列表 | 实验意图和订单入口 | 实验订单，引用分子注册记录；Agent 设计包和订单草稿 | 从候选分子字段到订单草稿 |
| 执行 | 已进入执行链路的任务和记录 | 实验调度、CRO 订单、实验记录 | 排期、CRO、结果回收 |
| 库存 | 样本、物料、孔板和位置 | 样本信息、样本库存、物料、孔板、样本-孔板关联 | Agent 下单前检查可用资源 |
| 设备 | 实验执行资源和点位 | 设备类型、设备信息、实验点位 | 可用窗口、维护状态、自动化对接 |
| 配方 | 可复用实验方法资产 | 实验线路、工作流、方法参数的 Agent 抽象 | Agent 生成订单时引用的 Experiment Recipe |

## 资产对象定义

实验资产在 UI 中统一出现在 `Assets > 实验`，但领域上分两层：

- 资产级对象：`Experiment Design Package`、`Experiment Order Draft`、`Experiment Order`、`Experiment Recipe`。这些对象更适合作为 Agent 生成、引用或准备提交的 durable artifacts。
- Operational Record：执行、库存、设备中的多数对象，例如 `Experiment Task`、调度记录、CRO tracking、实验记录、样本记录、物料记录、孔板记录、设备记录和点位记录。它们来自 BioMap OS Smart Experiment 的执行状态或资源记录，不等同于 Agent 生成的分析资产。

UI 可以统一称为“实验资产”，但对象类型字段必须保留 `订单草稿 / CRO订单 / 样本记录 / 设备记录 / 配方` 等具体类型，避免把执行资源和分析资产混在一起。

所有实验资产沿用全局 Asset Scope：只有 `public` 和 `project` 两种范围，不新增个人范围。个人使用场景仍通过个人项目承载。

Scope 默认规则：

- `Experiment Order Draft`、`Experiment Order`、`Experiment Task`、`Schedule`、`CRO Order`、`Experiment Record` 默认是 `project`。
- 样本、孔板、板位映射默认是 `project`，除非是组织级共享标准样本。
- 设备、设备类型、公开配方可以是 `public`。
- 项目定制配方、项目专用消耗规则必须是 `project`。

### 实验列表

`实验列表` 页展示三类对象：

- `Experiment Design Package`：实验前设计包，记录假设、readout、controls 和决策标准。
- `Experiment Order Draft`：提交前的实验订单草稿。
- `Experiment Order`：已进入 review/submission 的实验请求。

`实验列表` 不展示单个 `Candidate Molecule` 主卡片。候选分子作为实验/订单对象的字段出现，例如 `4 molecules: AF-14, AF-21, AF-38, AF-52`。如果后续需要单独分子库，应另行设计，不在本页混入。

`Experiment Order Draft` 可以在实验列表中作为 project-scoped Experiment Asset 显示，但类型必须标为 `订单草稿`，不能混成正式 `Experiment Order`。只有用户提交后才进入 review/submission，并可能产生 `Approval Request`。

卡片字段：

- 标题：设计包名、订单草稿号或订单号。
- 类型：`设计包 / 订单草稿 / 订单`。
- 状态：`草稿 / 待确认 / 待审批 / 已提交 / 已生成任务`。
- 项目：如 `Antibody Optimization`。
- 关键内容：分子数量、实验类型、readout、候选范围。
- 更新时间。

表格字段：

`名称 / 类型 / 状态 / 项目 / 分子数 / 实验类型 / 负责人 / 更新时间 / 操作`

推荐 mock 对象：

- `EGFR Affinity Validation Design Package`
- `BM-LAB-EGFR-20260528-001 Draft`
- `HER2 Wet-lab Validation Order`
- `IL17A 48-variant Library Design Review`

### 执行

`执行` 页展示三类对象：

- `Schedule`：实验调度。
- `CRO Order`：外包实验订单。
- `Experiment Record`：实验执行记录和结果入口。

卡片字段：

- 标题：调度名、CRO 订单号或实验记录名。
- 类型：`调度 / CRO / 记录`。
- 状态：`待排期 / 进行中 / CRO 已接单 / 结果回传 / 已完成 / 异常`。
- 项目。
- 设备或 CRO。
- 计划时间或完成时间。
- 关联订单或任务。

表格字段：

`名称 / 类型 / 状态 / 项目 / CRO或设备 / 关联任务 / 时间 / 负责人 / 操作`

推荐 mock 对象：

- `EGFR BLI KD Validation Schedule`
- `CRO-EGFR-20260528-001`
- `HER2-EXPTASK-20260531-001`
- `HER2 Wet-lab Result Record`

### 库存

`库存` 页展示四类对象：

- `Sample`：样本档案。
- `Material`：试剂、耗材、培养基、buffer 等物料。
- `Plate`：孔板资产。
- `Plate Link`：样本与孔板位置映射。

卡片字段：

- 标题：样本名、物料名、孔板 ID 或映射名。
- 类型：`样本 / 物料 / 孔板 / 板位映射`。
- 状态：`可用 / 低库存 / 锁定 / 已预约 / 已耗尽 / 待盘点`。
- 项目或范围。
- 库存/位置/批次。
- 更新时间。

表格字段：

`名称 / 类型 / 状态 / 范围 / 位置 / 批次 / 数量 / 更新时间 / 操作`

推荐 mock 对象：

- `EGFR_AF14_sample_batch_A`
- `HEK293 Expression Cell Stock`
- `BLI Sensor Chip SA`
- `Plate-96-EGFR-BLI-0528`
- `EGFR_BLI_plate_map_0528`

### 设备

`设备` 页展示四类对象：

- `Device Type`：设备类型。
- `Device`：设备实例。
- `Location`：实验点位。
- `Availability Window`：设备可预约窗口。

设备页不展示实验线路、工作流或方法参数。这些内容属于 `Experiment Recipe`，即左侧 `配方` 页。

卡片字段：

- 标题：设备类型、设备编号、点位或预约窗口。
- 类型：`设备类型 / 设备 / 点位 / 预约窗口`。
- 状态：`可用 / 已预约 / 维护中 / 停用 / CRO 可用`。
- 位置。
- 支持实验。
- 自动化状态。
- 更新时间。

表格字段：

`名称 / 类型 / 状态 / 位置 / 支持实验 / 自动化 / 下个可用窗口 / 更新时间 / 操作`

推荐 mock 对象：

- `Octet R8 - BLI`
- `Agilent 1260 Infinity II - SEC-HPLC`
- `AKTA Pure - Purification`
- `Lab A / Bench 03`
- `CRO Shanghai BLI Window`

### 配方

`配方` 页展示五类对象：

- `Assay Recipe`：实验配方，例如 BLI、SEC-HPLC、DSF、ELISA。
- `Parameter Template`：参数模板，例如浓度梯度、buffer、时间、温度。
- `Workflow Recipe`：节点化工作流，例如表达、纯化、测定、质控、回传。
- `QC Rule`：质控阈值，例如 monomer%、CV、curve fit R2。
- `Consumption Rule`：样本和物料消耗规则。

`Experiment Recipe` 支持 public 和 project 两种 scope：

- `public`：平台或组织发布的标准配方，默认可复用。
- `project`：某个 Project 内调整过的配方，只对项目成员可见。
- 当同一实验方法同时存在 public 和 project 配方时，Agent 生成实验订单时优先使用 project 配方；没有 project 配方时再使用 public 配方。
- UI 卡片和表格必须显示范围，避免把项目定制配方误认为组织标准配方。

卡片字段：

- 标题：配方名。
- 类型：`实验配方 / 参数模板 / 工作流 / 质控规则 / 消耗规则`。
- 状态：`已发布 / 草稿 / 待复核 / 已归档`。
- 范围：`公开 / 项目`。
- 适用实验。
- 关键参数。
- 版本。
- 更新时间。

表格字段：

`名称 / 类型 / 状态 / 范围 / 适用实验 / 版本 / 关键参数 / 维护人 / 更新时间 / 操作`

推荐 mock 对象：

- `BLI_KD_v2`
- `SEC_HPLC_QC_v1`
- `Expression_Purification_v1`
- `DSF_Tm_Screen_v1`
- `ELISA_Blocking_v1`
- `BLI_CurveFit_QC_Rule`

## 主视图布局

所有实验资产页共用一个主视图框架：

1. 顶部标题栏沿用当前 Assets 工作区 header。
2. 标题显示当前二级菜单：`实验列表`、`执行`、`库存`、`设备`、`配方`。
3. 工具栏包含：
   - 搜索框：placeholder 为 `搜索实验资产`。
   - 类型筛选：不同菜单显示不同类型。
   - 状态筛选：显示当前菜单下的状态集合。
   - `卡片 / 表格` view toggle。
4. 内容区：
   - 卡片视图用 3 列密度，不要过高，不做营销卡。
   - 表格视图使用横向可滚动表格。
   - 空状态文案：`当前筛选下暂无实验资产`。

视图切换要求：

- `卡片 / 表格` 切换只影响实验资产，不影响文件资产原有切换。
- 状态写入 Zustand 并持久化。
- 建议 key：`assetsExperimentViewMode: 'grid' | 'table'`。
- 默认值：`grid`。
- 该 view mode 在 `实验列表 / 执行 / 库存 / 设备 / 配方` 五个菜单之间共享；用户切到表格后，切换实验子菜单仍保持表格视图。
- 类型筛选和状态筛选不持久化。切换实验子菜单时重置为 `全部`，避免一个菜单的筛选条件污染另一个菜单。
- 状态不要做全局统一枚举。不同对象保留领域状态，例如订单用 `订单草稿 / 待审批 / 已提交`，库存用 `可用 / 低库存 / 已预约`，设备用 `可用 / 维护中 / 停用`。状态筛选项从当前菜单下的 records 动态生成。

## Mock 数据结构

建议将现有 `ExperimentAssetRecord` 扩展为更具体结构：

```ts
export type ExperimentAssetKind =
  | 'experimentDesignPackage'
  | 'experimentOrderDraft'
  | 'experimentOrder'
  | 'experimentTask'
  | 'schedule'
  | 'croOrder'
  | 'experimentRecord'
  | 'sample'
  | 'material'
  | 'plate'
  | 'plateLink'
  | 'deviceType'
  | 'device'
  | 'location'
  | 'availabilityWindow'
  | 'assayRecipe'
  | 'parameterTemplate'
  | 'workflowRecipe'
  | 'qcRule'
  | 'consumptionRule'

export type ExperimentAssetRecord = {
  id: string
  name: string
  category: ExperimentAssetItemId
  kind: ExperimentAssetKind
  scope: AssetScope
  projectName?: string
  owner: string
  status: string
  updatedAt: string
  description: string
  primaryMeta: string
  secondaryMeta: string
  tertiaryMeta?: string
}
```

这个结构足够支撑首版卡片和表格，不需要为每种对象拆 19 个独立 Type。后续如要做详情页，再按对象类型加 discriminated union。

`ExperimentAssetItemId` 改为：

```ts
export type ExperimentAssetItemId =
  | 'experiment-list'
  | 'execution'
  | 'inventory'
  | 'equipment'
  | 'recipe'
```

`assetMenuItemsBySection.experiment` 改为：

```ts
experiment: ['experiment-list', 'execution', 'inventory', 'equipment', 'recipe']
```

`assetMenuSections` 中实验菜单：

```ts
{
  id: 'experiment',
  label: '实验',
  description: '实验列表、执行、库存、设备与配方',
  items: [
    { id: 'experiment-list', label: '实验列表' },
    { id: 'execution', label: '执行' },
    { id: 'inventory', label: '库存' },
    { id: 'equipment', label: '设备' },
    { id: 'recipe', label: '配方' },
  ],
}
```

## 交互边界

第一版只做浏览和轻交互：

- 搜索可用。
- 类型筛选可用。
- 状态筛选可用。
- 卡片/表格切换可用。
- `新建`、`上传`、行操作、卡片操作只触发 mock notify，不创建真实对象。
- 点击配方、设备、订单等对象暂不打开详情页。

上传边界：

- 实验页可以保留 `上传` 按钮，用于视觉上保持 Assets header 一致。
- 第一版点击上传只打开现有 mock 上传提示或 mock notify。
- 即使后续实现真实上传，上传文件也应先成为 `Project File`，不能自动变成 `Experiment Asset`。
- 只有经过解析、登记或用户确认后，文件内容才可能生成实验列表、库存记录或配方对象。

新建边界：

- `新建` 菜单应按当前实验子菜单显示 mock action，避免所有页面都显示同一组文件类操作。
- `实验列表`：`新建实验订单草稿`、`新建设计包`。
- `执行`：`登记实验记录`、`创建调度占位`。
- `库存`：`登记样本`、`登记物料`、`新增孔板`。
- `设备`：`登记设备`、`新增可用窗口`。
- `配方`：`新建配方`、`复制公开配方到项目`。
- 第一版所有新建 action 只触发 mock notify，不改变数据。

后续可扩展：

- 实验订单详情抽屉。
- 配方详情页。
- 设备预约窗口详情。
- 从 Agent Thread 跳转到对应实验资产。
- 从实验资产反向查看关联 Thread、Run Inspector 或 Approval。

## Demo 故事线

第一版推荐围绕 `EGFR 抗体亲和力优化` 填充 mock 数据：

1. `实验列表` 中出现 `EGFR 亲和力复测订单草稿`。
2. `实验列表` 中的订单和设计包字段显示 AF-14、AF-21、AF-38、AF-52 候选分子。
3. `执行` 中出现 `EGFR BLI KD Validation Schedule` 和 `CRO-EGFR-20260528-001`。
4. `库存` 中出现 EGFR 样本、BLI 芯片、96 孔板和 plate map。
5. `设备` 中出现 Octet、SEC-HPLC、点位和 CRO 设备窗口。
6. `配方` 中出现 `BLI_KD_v2`、`SEC_HPLC_QC_v1`、`BLI_CurveFit_QC_Rule`。

Agent 对话中后续可引用这些对象，例如：

> 我调用 `BLI_KD_v2` 配方，检查 `Octet R8` 可用窗口和 `EGFR_AF14_sample_batch_A` 样本库存后，生成了 `BM-LAB-EGFR-20260528-001` 订单草稿。

## UI 风格

实验资产 UI 应保持当前 Assets 页的工作台风格：

- 不做大型 hero，不做营销式解释。
- 页面信息密度接近 Capabilities 和当前 xTrimo 目录。
- 卡片边框 8px radius 或以下。
- 卡片高度控制在 160-190px 左右，不要像 ModelHub 图片卡那样变高。
- 表格行高 56-64px。
- 状态 badge 使用低饱和底色，审批/异常/低库存可以使用高亮但不要过度。
- 类型筛选和状态筛选沿用 xTrimo filter bar 的紧凑 pill 风格，或使用当前 toolbar 的 select 风格。首版推荐 pill 风格，便于展示“对象类型”的语义。

## 测试要求

新增或更新测试覆盖：

- `Assets > 实验` 左侧菜单包含 `实验列表 / 执行 / 库存 / 设备 / 配方`。
- 不再出现 `配置` 实验菜单。
- `配方` 页能显示 `BLI_KD_v2` 或类似 mock 配方对象。
- `设备` 页能显示 `Octet R8` 或类似 mock 设备对象。
- 实验页存在 `卡片 / 表格` 切换。
- 切换到表格后出现实验资产表格。
- 搜索能过滤实验资产。
- `reset()` 后实验视图模式回到默认 `grid`。

验证命令：

```bash
npm test -- src/App.test.tsx
npm run lint
npm run build
```

完成后使用 in-app Browser 或 Chrome Use 验证：

- 进入 `http://localhost:5173/`。
- 点击 `Assets`。
- 点击左侧 `实验`。
- 分别查看 `实验列表 / 执行 / 库存 / 设备 / 配方`。
- 切换卡片和表格视图。
- 确认布局没有溢出、文字不重叠、滚动不卡顿。

## 非目标

第一版不做：

- 真实 BioMap OS 接口调用。
- 真实订单创建、提交、审批。
- 实验资产详情页。
- 拖拽排期。
- 设备预约真实冲突检测。
- 配方编辑器。
- 单独的 LIMS 权限系统。
- 使用真实截图作为实验资产卡片内容。

## 实施建议

建议实现顺序：

1. 更新 `ExperimentAssetItemId` 和 `assetMenuItemsBySection`。
2. 更新 `assetMenuSections` 中实验菜单。
3. 扩展 `ExperimentAssetRecord`。
4. 补齐五类 mock 数据。
5. 新增实验资产视图模式状态并持久化。
6. 改造 `ExperimentAssetsView`，加入工具栏、类型筛选、状态筛选和卡片/表格切换。
7. 新增表格渲染组件。
8. 补测试。
9. 运行测试、lint、build 和浏览器验证。
