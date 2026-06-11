# Knowledge Base Assets Design

## Goal

Add **知识库** as a first-class asset category in the Assets workspace. A knowledge base is an asset object that can be referenced by Agent workflows for retrieval, reasoning, traceability, and biological context grounding.

This feature is a demo surface, not a real indexing pipeline. It should make the product concept clear: BioMap Agent can manage biological knowledge bases built from files, structured data, experiment records, model documentation, and project artifacts.

## Navigation

Assets left navigation order:

1. 文件
2. 知识库
3. 数据
4. 实验
5. 模型

知识库 is an independent top-level Assets section because it is not a raw file or table. It is a reusable knowledge asset generated from source materials.

知识库 submenu:

- 全部知识库
- RAG
- 知识图谱
- GraphRAG

Each submenu filters the same asset collection by knowledge base type. The default item is 全部知识库.

## Asset Model

Knowledge base categories:

- `RAG`: document-centric retrieval assets, useful for SOP, manuals, project notes, model docs, protocol references.
- `知识图谱`: entity and relationship assets, useful for molecules, targets, assays, samples, pathways, orders, and experimental lineage.
- `GraphRAG`: hybrid retrieval over documents plus graph structure, useful for complex project reasoning and traceability.

Knowledge base scope:

- 公开范围: accessible to all users in the organization.
- 项目范围: accessible to members of the linked project.

There is no personal scope. If a user wants a private workspace, they can create a personal project and keep project-scoped assets there.

Suggested TypeScript shape:

```ts
type KnowledgeBaseKind = 'rag' | 'knowledgeGraph' | 'graphRag'

type KnowledgeBaseStatus = '已构建' | '构建中' | '需重建' | '失败'

type KnowledgeBaseRecord = {
  id: string
  name: string
  category: 'all-knowledge' | KnowledgeBaseKind
  kind: KnowledgeBaseKind
  scope: 'public' | 'project'
  projectName?: string
  owner: string
  status: KnowledgeBaseStatus
  version: string
  fileCount: number
  entityCount?: number
  relationCount?: number
  chunkCount?: number
  updatedAt: string
  lastBuildAt: string
  description: string
  sourceFileIds: string[]
  overview: string[]
  versions: KnowledgeBaseVersion[]
}

type KnowledgeBaseVersion = {
  version: string
  builtAt: string
  summary: string
  fileDelta: string
  entityDelta?: string
  status: KnowledgeBaseStatus
}
```

## List Page

The list page is table-first. Do not use large cards. This should feel like an operational asset registry.

Toolbar:

- Search input: `搜索知识库`
- Type filter: 全部 / RAG / 知识图谱 / GraphRAG
- Scope filter: 全部范围 / 公开范围 / 项目范围
- Status filter: 全部状态 / 已构建 / 构建中 / 需重建 / 失败
- Primary action: 新建知识库
- Secondary action: 上传来源文件

Table columns:

- 名称
- 类型
- 范围
- 关联项目
- 文件数
- 实体 / 关系
- 最近构建
- 状态
- 操作

Rows are clickable. Clicking a row opens the knowledge base detail page inside the Assets main panel.

Example mock records:

| Name | Type | Scope | Project | Files | Entities | Relations | Status |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| EGFR 抗体亲和力优化知识库 | GraphRAG | 项目范围 | Antibody Optimization | 42 | 186 | 524 | 已构建 |
| xTrimo API 与模型调用知识库 | RAG | 公开范围 | - | 18 | - | - | 已构建 |
| CRO 实验服务与订单 SOP | RAG | 公开范围 | - | 26 | - | - | 已构建 |
| 抗体 Developability 知识图谱 | 知识图谱 | 公开范围 | - | 64 | 1,420 | 5,860 | 已构建 |
| 酶家族功能注释知识库 | GraphRAG | 项目范围 | Enzyme Discovery | 39 | 312 | 1,108 | 构建中 |
| SEC-HPLC 与 BLI 数据解释知识库 | RAG | 项目范围 | Data Assetization | 21 | - | - | 需重建 |

## Detail Page

The detail page should borrow the structure of a product detail page: a compact summary area on top, then tabbed detail sections below. It should not look like a chat page.

### Summary Header

Show:

- Knowledge base name
- Type badge: RAG / 知识图谱 / GraphRAG
- Scope badge
- Status badge
- Linked project
- Owner
- Current version
- Last build time
- File count
- Entity count and relation count when applicable
- Short description

Actions:

- 重新构建
- 编辑来源
- 更多

For demo behavior, these actions only trigger a lightweight status message. They do not start a real build.

### Tabs

Tabs:

1. 知识库概览
2. 使用文件
3. 版本记录

The selected tab can be local component state. It does not need persistence in the first version.

## Tab Content

### 知识库概览

Show a concise explanation of what this knowledge base covers and how Agent can use it.

For `EGFR 抗体亲和力优化知识库`, mock content:

- 覆盖 EGFR parent antibody、亲和力优化候选、BLI/SEC-HPLC 结果、CRO 订单草稿和实验配方。
- 支持 Agent 回答候选分子为什么被优先选择、哪些实验支持当前判断、哪些文件可追溯到订单或数据集。
- 主要实体：抗体、抗原、突变位点、实验方法、检测结果、数据集、订单、实验配方。
- 推荐用途：候选解释、实验方案生成、结果追溯、订单草稿生成。

For GraphRAG and 知识图谱 assets, show an entity summary:

- 抗体: 36
- 靶点: 4
- 实验方法: 12
- 数据集: 18
- 订单: 6
- 配方: 9

Also show a small relationship summary:

- `candidate -> measured_by -> assay`
- `assay -> generated -> dataset`
- `dataset -> supports -> decision`
- `order -> uses -> recipe`

This can be text-only in the first implementation.

### 使用文件

Show a dense table of source files used by the knowledge base.

Columns:

- 文件名
- 类型
- 来源空间
- 贡献内容
- 最近同步
- 状态

Example rows for EGFR:

- `EGFR_parent_antibody_baseline.xlsx`: parent antibody baseline, historical BLI KD, expression, stability.
- `BLI_run_0528.csv`: BLI sensorgram curves and fitted KD.
- `EGFR_MOO_candidate_summary.parquet`: multi-objective optimization candidate table.
- `BM-LAB-EGFR-20260528-001_draft.md`: wet-lab order draft.
- `SEC_HPLC_overlay.png`: aggregation and monomer percentage visual evidence.
- `BLI_KD_v2_recipe.md`: BLI assay recipe and parameter template.

Rows should reference existing mock file ids where available. New source file ids can be introduced as mock-only assets if needed.

### 版本记录

Show a build-history table.

Columns:

- 版本
- 构建时间
- 变更摘要
- 文件变化
- 实体变化
- 状态

Example:

- `v3`: 新增 BLI_run_0528.csv，更新候选分子证据链。
- `v2`: 加入 EGFR_MOO_candidate_summary.parquet，新增候选排序关系。
- `v1`: 从 parent antibody baseline 初始化知识库。

## Interaction Rules

- Selecting 知识库 in the left menu opens 全部知识库 by default.
- Selecting a knowledge base row opens its detail page.
- Detail page has a back control returning to the current filtered list.
- Search filters both list rows and source files.
- New/rebuild/edit actions are demo-only and show non-toast local status messaging consistent with the existing Assets mock action pattern.
- No image generation is required for this feature.

## Visual Direction

Use the existing Assets visual system:

- Same left sidebar.
- Same top workspace-bar header style.
- Same table density as experiment assets.
- Detail summary should be compact, not a marketing hero.
- Cards are acceptable only for small metric summaries inside the detail header or overview tab.
- Avoid large empty vertical spacing.

The knowledge base detail page should feel like an enterprise asset detail page: structured, inspectable, and built for repeated use.

## Implementation Scope

In scope:

- Add `knowledge` as a new `AssetsSection`.
- Add knowledge base menu ids to store logic and validation.
- Add mock knowledge base records and source file references.
- Add knowledge base list view.
- Add detail view with summary and three tabs.
- Add tests for initial state compatibility, menu validation, and basic rendering.

Out of scope:

- Real RAG indexing.
- Real graph visualization.
- Real document parsing.
- Real rebuild workflow.
- Persisting selected detail tab.
- Uploading or editing actual source files.

## Acceptance Criteria

- Assets sidebar shows 知识库 immediately below 文件.
- 知识库 has four submenu items: 全部知识库, RAG, 知识图谱, GraphRAG.
- Knowledge base list renders realistic biological mock records.
- Clicking a record opens a detail page with summary, tabs, source files, and version history.
- Detail page can return to the list.
- Existing file, data, experiment, and model asset pages keep working.
- Tests, lint, and build pass.
