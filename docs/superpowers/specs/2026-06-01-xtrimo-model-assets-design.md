# xTrimo Model Assets 设计

## 状态

本 spec 是 [Assets Workbench 设计](/Users/songxuzhengjun/Documents/BioMapAgent/docs/superpowers/specs/2026-05-31-assets-workbench-design.md) 的增量设计，聚焦 `Assets > 模型 > xTrimo`。

目标是把当前只有 1 个 `xTrimoPFP` mock 卡片的模型页，升级成更接近真实 BioMap OS Model Hub 的 xTrimo 模型资产目录，同时保持 BioMap Agent Demo 的定位：这是 **Main Agent 可调用模型资产视图**，不是 ModelHub 本体复刻。

## 参考来源

参考用户 Chrome 中的 BioMap OS `Model Hub > 平台模型` 页面，URL 形态：

```text
stage.biomap.com/model-platform?model-platform=%2Fxtrimo%2Fmodels
```

本次只参考：

- xTrimo 模型名称。
- 模型能力类型。
- 模型实体类型。
- 上线状态。
- ModelHub 的密度和筛选维度。

不复制：

- BioMap OS 的整体导航。
- ModelHub 原始卡片视觉。
- 真实服务接口、模型详情页或训练 / 推理任务流程。

> 备注：本轮通过 Chrome 当前标签页读取了 ModelHub 页面内容。macOS `screencapture` 在当前运行环境里返回 `could not create image from display`，因此本 spec 先记录页面结构和模型清单；后续如需要可由用户手动截图或通过浏览器插件能力补采参考图。

## 设计决策

### 视图定位

采用 **Main Agent 可调用模型资产视图**。

`Assets > 模型 > xTrimo` 需要回答：

- Main Agent 可调用哪些 xTrimo 模型？
- 每个模型适合什么研发任务？
- 输入和输出是什么？
- 哪些模型适合当前项目复用？
- 哪些模型已上线，哪些即将上线？

它不需要完整复刻 ModelHub 的模型市场，也不需要展示训练日志、模型详情文档或真实推理入口。

术语约束：

- 文档和数据模型里，调用主体使用 **Main Agent**，符合 `CONTEXT.md`。
- UI 文案里可以使用短标签 `Agent 推荐` / `Agent 用途`，不要在页面上暴露 `Main Agent`。
- `xTrimo` 属于 **Platform Model Asset**，默认公共范围，不是项目上传资产。
- **模型生命周期状态** 和 **Model Callability** 分开：`即将上线` 模型可以展示，但不能被描述为当前可调用。

### 信息密度

页面必须保持 ToB 工作台密度，不做大卡片堆叠。

约束：

- 首屏必须能看到标题区、统计条、推荐区、筛选条和至少 6 个模型条目。
- 桌面宽屏下，首屏理想状态能看到 2 行目录，即 6 个普通模型卡片。
- 普通模型卡片高度建议 `108px-124px`，硬上限 `132px`。
- 推荐模型卡片高度建议 `112px-128px`，硬上限 `140px`。
- 统计条高度建议 `52px-60px`，不要做成大模块。
- 字号沿用当前 Assets 页面，不新增 hero 级大字。
- 不使用大面积插画、渐变背景或单模型超大展示。
- 每张卡片最多展示 2 行描述；更多内容用紧凑 metadata 和标签承载。
- 筛选 chips 必须支持换行，但不要造成首屏高度失控。
- 标签、状态、输入输出都优先用短文本；不为撑满卡片而写长文案。

## xTrimo 模型范围

第一版 mock 建议采用 33 个模型：

- 已上线：24
- 即将上线：9
- 能力类型：14
- 实体类型：7

### 能力类型

```text
结构
亲和力
聚集
催化
Embedding
疏水性
免疫
自然度
可专利性
扰动
特异性
稳定性
细胞活力
产量
```

### 实体类型

```text
细胞
通用蛋白
抗体
酶
TCR-多肽-MHC
功能蛋白
AAV
```

### 模型清单

已上线模型：

| 模型 | 能力 | 实体 | Agent 用途 |
| --- | --- | --- | --- |
| xTrimoGene | Embedding | 细胞 | 单细胞表达表征、细胞状态 embedding |
| xTrimoSingleCellPerturb | 扰动 | 细胞 | 基因扰动转录效应预测 |
| xTrimoMonomer_Fast | 结构 | 通用蛋白 | 快速单链蛋白结构预测 |
| xTrimoMonomer | 结构 | 通用蛋白 | MSA 辅助单链结构预测 |
| xTrimoAbAffinity_DG | 亲和力 | 抗体 | 抗体-抗原结合自由能预测 |
| xTrimoAbAffinity_DDG | 亲和力 | 抗体 | 单点突变亲和力变化预测 |
| xTrimoAbAggregation | 聚集 | 抗体 | 抗体聚集倾向分级 |
| xTrimoEnzymeTm | 催化 | 酶 | 酶催化活性最佳温度预测 |
| xTrimoEnzymeKcat | 催化 | 酶 | 酶 Kcat 值预测 |
| xTrimoHydro | 疏水性 | 通用蛋白 / 酶 / 抗体 | 残基级 RSA / 疏水性风险分析 |
| xTrimoNaturalness | 自然度 | 通用蛋白 / 酶 / 抗体 | 通用蛋白序列自然度评估 |
| xTrimoAbNaturalness | 自然度 | 抗体 | 抗体 VH/VL/VHH 自然度评估 |
| xTrimoAbPatentability | 可专利性 | 抗体 | 抗体专利相似性分析 |
| xTrimoAbSpecificity | 特异性 | 抗体 | 抗体靶点特异性评估 |
| xTrimoEnzymePH | 稳定性 | 酶 | 酶最佳催化 pH 预测 |
| xTrimoStability | 稳定性 | 通用蛋白 / 酶 / 抗体 | 蛋白稳定性预测 |
| xTrimoAbStability | 稳定性 | 抗体 | 抗体 Tm1 热稳定性预测 |
| xTrimoAbAgDock | 结构 | 抗体 | 抗体 Fv-抗原复合物结构预测 |
| xTrimoAbFold | 结构 | 抗体 | 抗体 VH/VL Fv 结构预测 |
| xTrimoVHHFold | 结构 | 抗体 | VHH 结构预测 |
| xTrimoVHHAgDock | 结构 | 抗体 | VHH-抗原复合物结构预测 |
| xTrimoAbGen | 结构 | 抗体 | 抗原约束下抗体骨架和 CDR 设计 |
| xTrimoFold | 结构 | 通用蛋白 / 酶 / 抗体 | 复合物全原子结构预测 |
| xTrimoAbYield | 产量 | 抗体 | 抗体表达产量预测 |

即将上线模型：

| 模型 | 能力 | 实体 | Agent 用途 |
| --- | --- | --- | --- |
| xTrimoTCR-PeptideBinding | 亲和力 | TCR-多肽-MHC | TCR 和多肽结合二分类预测 |
| xTrimoPeptide-HLABinding | 亲和力 | TCR-多肽-MHC | 肽-HLA I 类结合预测 |
| xTrimoNeoantigen | 免疫 | TCR-多肽-MHC | 肿瘤疫苗新抗原肽预测 |
| xTrimoTm | 稳定性 | 通用蛋白 | 序列级热稳定性预测 |
| xTrimoProteaseStability | 稳定性 | 通用蛋白 | 蛋白酶稳定性 EC50 预测 |
| xTrimoAmyloidAgg | 稳定性 | 功能蛋白 | 淀粉样聚集风险预测 |
| xTrimoCollagenTm | 稳定性 | 功能蛋白 | 胶原蛋白熔化温度预测 |
| xTrimoFoldClassification | 结构 | 通用蛋白 | 蛋白折叠类别预测 |
| xTrimoAAVViability | 细胞活力 | AAV | AAV 从质粒库到病毒库的 viability 预测 |

## 页面布局

### 左侧菜单

沿用 Assets 左侧菜单：

```text
模型
  xTrimo
  公开模型
  项目模型
  Oracle
```

无需增加三级菜单。能力类型和实体类型放在主内容区筛选条里。

### 主内容结构

```text
AssetsMain
  Header
  XtrimoStatsStrip
  XtrimoAgentRecommendations
  XtrimoFilterBar
  XtrimoModelCatalog
```

### Header

标题：

```text
xTrimo
```

副标题：

```text
BioMap 自研生命科学基础模型与任务模型家族，覆盖结构、亲和力、稳定性、成药性和实验设计等研发流程。
```

标题区右侧不显示 `新建` 和 `上传`。`xTrimo` 是平台模型目录，不是项目模型上传入口；如果需要操作区，只保留一个低权重 `更多` 菜单用于 mock 后续能力。

通用 Assets 顶部操作需要按菜单上下文切换：

- `项目模型` 可以显示 `新建 / 上传`。
- `公开模型` 和 `xTrimo` 不显示 `上传`。
- `Oracle` 第一版不显示训练 / 发布动作，只展示可调用资产。

### XtrimoStatsStrip

一行紧凑统计，卡片高度建议 `52px-60px`：

```text
33 模型
24 已上线
9 即将上线
14 能力类型
7 实体类型
24 可调用
6 Agent 推荐
```

统计卡不要做大面积彩色块，使用细边框、浅底、紧凑数字。`已上线` 不能直接替代 `可调用`，但第一版 mock 中 24 个已上线模型都设为可调用。

### XtrimoAgentRecommendations

针对当前 Demo 的 `Antibody Optimization` 语境，推荐抗体研发最相关模型。

推荐模型：

- xTrimoAbAffinity_DG
- xTrimoAbAffinity_DDG
- xTrimoAbAggregation
- xTrimoAbStability
- xTrimoAbSpecificity
- xTrimoAbYield

展示方式：

- 一行或两行紧凑推荐卡。
- 每张卡高度建议 `112px-128px`，不要超过 `140px`。
- 字段：模型名、能力标签、实体标签、为什么推荐、输入 / 输出。
- 推荐区标题用 `Agent 推荐`，不要用“热门”“精选”这类市场化文案。
- 宽屏建议 3 列或 6 个紧凑横向单元；如果空间不足，可以只显示前 3 个推荐模型并提供“查看全部推荐”轻量入口，避免推荐区占用整屏。

示例卡片内容：

```text
xTrimoAbAffinity_DDG
亲和力 · 抗体 · 已上线
用于评估 EGFR 候选单点突变对亲和力的影响。
输入：Fv-抗原结构、突变位点
输出：ΔΔG、候选排序
```

### XtrimoFilterBar

筛选条放在推荐区之后，和目录列表之前。

控件：

- 搜索框：按名称 / 描述搜索。
- 能力 chips。
- 实体 chips。
- 状态 segmented control：全部 / 已上线 / 即将上线。

默认状态：

- 搜索为空。
- 能力为全部。
- 实体为全部。
- 状态为全部。

筛选状态第一版不持久化。

### XtrimoModelCatalog

目录是主列表，要求高信息密度。

推荐使用紧凑卡片网格：

- 桌面宽屏：3 列。
- 中等宽度：2 列。
- 小屏：1 列。

卡片字段：

```text
模型名 + 状态 badge
能力标签 / 实体标签
Agent 用途：一行
输入：一行
输出：一行
版本 / 最近更新 / 可调用状态
```

普通卡片高度建议：

- 最小：`104px`
- 默认：`116px`
- 最大：`132px`

如果内容溢出，优先截断描述，不拉高卡片。

目录卡内部布局建议：

```text
模型名                            状态
能力标签 / 实体标签
Agent 用途一句话
输入：...                         输出：...
```

不要在每个卡片里放独立图标大圆块；如果需要图标，只用 16px-20px 线性图标或小型状态点。

## 视觉设计

整体方向：**科研控制台 + 模型资产目录**。

### 应该做

- 保持当前 BioMap Agent 的浅色、冷静、清爽风格。
- 信息密度高，像模型资产管理台，而不是营销页。
- xTrimo 推荐区可以稍微更有辨识度，例如左侧细色条、能力矩阵、小型标签地图。
- 用状态 badge 区分 `已上线` 和 `即将上线`。
- 用能力标签和实体标签帮助快速扫描。
- 卡片视觉以表格式扫描效率为准：小标题、短标签、短字段、低留白。

### 不应该做

- 不做大 hero。
- 不做超高模型卡片。
- 不做 140px 以上的推荐模型格子，普通目录格子不超过 132px。
- 不做单一蓝色渐变背景。
- 不加入大图背景或装饰球。
- 不把 ModelHub 原图卡片直接复刻进 Assets。
- 不在一个卡片里塞完整模型说明。

## 数据结构建议

新增 xTrimo 专用数据结构，不直接复用现有较薄的 `ModelAssetRecord`：

```ts
type XtrimoModelStatus = 'online' | 'comingSoon'
type XtrimoModelCallability = 'callable' | 'previewOnly'

type XtrimoCapability =
  | '结构'
  | '亲和力'
  | '聚集'
  | '催化'
  | 'Embedding'
  | '疏水性'
  | '免疫'
  | '自然度'
  | '可专利性'
  | '扰动'
  | '特异性'
  | '稳定性'
  | '细胞活力'
  | '产量'

type XtrimoEntity =
  | '细胞'
  | '通用蛋白'
  | '抗体'
  | '酶'
  | 'TCR-多肽-MHC'
  | '功能蛋白'
  | 'AAV'

type XtrimoModelRecord = {
  id: string
  name: string
  version: string
  status: XtrimoModelStatus
  callability: XtrimoModelCallability
  scope: 'public'
  capabilities: XtrimoCapability[]
  entities: XtrimoEntity[]
  agentUse: string
  input: string
  output: string
  updatedAt: string
  projectFit: 'recommended' | 'useful' | 'general'
}
```

可以保留现有 `modelAssetRecords` 用于 `公开模型 / 项目模型 / Oracle`，单独新增：

```ts
export const xtrimoModelRecords: XtrimoModelRecord[]
```

这样 xTrimo 页可以用更丰富的数据结构，不强行挤进普通模型卡片字段。所有 xTrimo records 的 `scope` 固定为 `public`，避免误解为项目内资产。

## 交互

第一版交互：

- 点击 `模型 > xTrimo` 显示 xTrimo 专用页。
- 搜索过滤当前 xTrimo 模型。
- 点击能力 chip 过滤模型。
- 点击实体 chip 过滤模型。
- 点击状态 segmented control 过滤模型。
- 点击可调用模型卡暂时只触发 mock toast：`模型详情将在后续 Demo 中展开`。
- 点击 `previewOnly` 模型卡触发 mock toast：`该模型即将上线，当前仅支持预览`。

不做：

- 多选筛选。
- 真实模型调用。
- 模型详情页路由。
- 真实 ModelHub 跳转。
- 训练 / 发布 / 部署流程。
- 在 `xTrimo` 页上传、创建或删除平台模型。

## 公开模型 / 项目模型 / Oracle 数量调整

为避免 `模型` 菜单整体显得空，建议同步补齐 mock 数量。

### 公开模型

建议 8-12 个：

- AlphaFold2
- AlphaFold3
- ESM-2
- ESMFold
- ProteinMPNN
- RFdiffusion
- ColabFold
- DeepFRI
- SaProt
- ProtT5

字段重点：来源、License / 接入状态、支持任务。

### 项目模型

建议 4-6 个：

- EGFR_Affinity_Head_v2
- EGFR_Expression_Risk_v1
- EnzymeKcat_ProjectHead
- SEC_HPLC_QC_Classifier
- AAV_Packaging_Risk_Model

字段重点：所属项目、底座模型、指标、部署状态。

### Oracle

建议 4-5 个：

- EGFR Developability Oracle
- Aggregation Risk Oracle
- Expression Yield Oracle
- Enzyme Activity Oracle
- Delivery Risk Oracle

字段重点：可调用性、输入、输出、最近使用。

## 测试要求

### 数据测试

- `xtrimoModelRecords` 至少 33 条。
- 已上线数量为 24。
- 即将上线数量为 9。
- `callable` 数量为 24。
- `previewOnly` 数量为 9。
- 推荐模型数量为 6。
- 每条模型都有 `name / version / status / callability / scope / capabilities / entities / agentUse / input / output / projectFit`。
- 所有 xTrimo 模型的 `scope` 都是 `public`。

### UI 测试

- 点击 `Assets > 模型 > xTrimo` 能看到 xTrimo 专用页。
- 页面显示统计：`33 模型`、`24 已上线`、`9 即将上线`。
- 页面显示 `24 可调用`。
- 首屏文本中出现至少一个抗体推荐模型，例如 `xTrimoAbAffinity_DDG`。
- 能力筛选 `亲和力` 后，只显示亲和力相关模型。
- 实体筛选 `抗体` 后，显示抗体相关模型。
- 状态筛选 `即将上线` 后，显示 `xTrimoAAVViability` 等即将上线模型。
- `即将上线` 模型不显示可调用状态。
- `xTrimo` 页面不显示 `上传` 主按钮。
- 普通模型目录不显示超长完整说明。

### 视觉回归人工检查

实施后用 Chrome 检查：

- 桌面宽屏下首屏是否能看到 6 个以上模型条目。
- 卡片高度是否紧凑，没有大面积空白。
- 推荐区是否帮助理解 Agent 为什么使用这些模型。
- 左侧菜单没有新增复杂三级导航。

## 开放问题

本 spec 暂不要求用户继续确认的问题：

- 是否要在卡片里加入真实模型图。第一版不加。
- 是否要跳转 BioMap OS ModelHub。第一版不跳。
- 是否要做模型详情抽屉。第一版不做。

这些都可以作为后续迭代。
