import type {
  AssetMenuItemId,
  AssetsSection,
  DataAssetItemId,
  ExperimentAssetItemId,
  FileAssetItemId,
  ModelAssetItemId,
} from '../store/demoStoreLogic'

export type AssetScope = 'public' | 'project'

export type AssetMenuSection = {
  id: AssetsSection
  label: string
  description: string
  items: {
    id: AssetMenuItemId
    label: string
  }[]
}

export type AssetProjectFolder = {
  id: string
  name: string
  scope: 'project'
  projectName: string
  modifiedAt: string
  itemCount: number
  description: string
}

export type FileAssetRecord = {
  id: string
  name: string
  kind: string
  scope: AssetScope
  fileSpaceKind: 'projectFile' | 'fileAsset'
  folderId: string | null
  owner: string
  size: string
  modifiedAt: string
  status: 'ready' | 'processing' | 'archived'
  description: string
}

export type DataAssetRecord = {
  id: string
  name: string
  category: DataAssetItemId
  scope: AssetScope
  owner: string
  rows: string
  updatedAt: string
  description: string
}

export type ExperimentAssetRecord = {
  id: string
  name: string
  category: ExperimentAssetItemId
  scope: AssetScope
  owner: string
  status: string
  updatedAt: string
  description: string
}

export type ModelAssetRecord = {
  id: string
  name: string
  category: ModelAssetItemId
  scope: AssetScope
  owner: string
  status: string
  updatedAt: string
  description: string
}

export const assetMenuSections: AssetMenuSection[] = [
  {
    id: 'file',
    label: '文件',
    description: '对象存储与项目文件空间',
    items: [
      { id: 'public-files', label: '公共文件' },
      { id: 'project-files', label: '项目文件' },
      { id: 'recent-uploads', label: '最近上传' },
      { id: 'archived-files', label: '归档' },
    ],
  },
  {
    id: 'data',
    label: '数据',
    description: '结构化数据资产',
    items: [
      { id: 'datasets', label: '数据集' },
      { id: 'tables', label: '数据表' },
      { id: 'analysis-results', label: '分析结果' },
      { id: 'catalog', label: '数据目录' },
    ],
  },
  {
    id: 'experiment',
    label: '实验',
    description: '实验需求、执行、库存与配置',
    items: [
      { id: 'request', label: '需求' },
      { id: 'execution', label: '执行' },
      { id: 'inventory', label: '库存' },
      { id: 'configuration', label: '配置' },
    ],
  },
  {
    id: 'model',
    label: '模型',
    description: '基础模型、项目模型和 Oracle',
    items: [
      { id: 'xtrimo', label: 'xTrimo' },
      { id: 'public-models', label: '公开模型' },
      { id: 'project-models', label: '项目模型' },
      { id: 'oracles', label: 'Oracle' },
    ],
  },
]

export const projectFileFolders: AssetProjectFolder[] = [
  {
    id: 'project-antibody-optimization',
    name: 'Antibody Optimization',
    scope: 'project',
    projectName: 'Antibody Optimization',
    modifiedAt: '2 分钟前',
    itemCount: 8,
    description: 'EGFR、CD3 双抗与亲和力优化材料',
  },
  {
    id: 'project-enzyme-discovery',
    name: 'Enzyme Discovery',
    scope: 'project',
    projectName: 'Enzyme Discovery',
    modifiedAt: '3 小时前',
    itemCount: 6,
    description: '酶家族调研、活性筛选与结构建模记录',
  },
  {
    id: 'project-data-assetization',
    name: 'Data Assetization',
    scope: 'project',
    projectName: 'Data Assetization',
    modifiedAt: '1 小时前',
    itemCount: 9,
    description: 'SEC-HPLC、BLI、细胞实验标准化数据',
  },
  {
    id: 'project-model-to-oracle',
    name: 'Model-to-Oracle',
    scope: 'project',
    projectName: 'Model-to-Oracle',
    modifiedAt: '昨天',
    itemCount: 7,
    description: '模型评估、Oracle 发布与性能基准',
  },
]

export const fileAssetRecords: FileAssetRecord[] = [
  {
    id: 'file-egfr-baseline',
    name: 'EGFR_parent_antibody_baseline.xlsx',
    kind: 'xlsx',
    scope: 'project',
    fileSpaceKind: 'projectFile',
    folderId: 'project-antibody-optimization',
    owner: 'zhengjun',
    size: '1.8 MB',
    modifiedAt: '2 分钟前',
    status: 'ready',
    description: 'parent antibody 的 BLI KD、表达量与稳定性基线',
  },
  {
    id: 'file-egfr-bli-run',
    name: 'BLI_run_0528.csv',
    kind: 'csv',
    scope: 'project',
    fileSpaceKind: 'projectFile',
    folderId: 'project-antibody-optimization',
    owner: 'LabOps',
    size: '4.2 MB',
    modifiedAt: '16 分钟前',
    status: 'ready',
    description: '湿实验回传的 sensorgram 原始曲线',
  },
  {
    id: 'file-egfr-candidate-summary',
    name: 'EGFR_MOO_candidate_summary.parquet',
    kind: 'parquet',
    scope: 'project',
    fileSpaceKind: 'fileAsset',
    folderId: 'project-antibody-optimization',
    owner: 'Main Agent',
    size: '18 MB',
    modifiedAt: '32 分钟前',
    status: 'ready',
    description: '多目标优化候选结果，可被数据目录引用',
  },
  {
    id: 'file-egfr-order-draft',
    name: 'BM-LAB-EGFR-20260528-001_draft.md',
    kind: 'md',
    scope: 'project',
    fileSpaceKind: 'projectFile',
    folderId: 'project-antibody-optimization',
    owner: 'Main Agent',
    size: '96 KB',
    modifiedAt: '39 分钟前',
    status: 'ready',
    description: 'CRO 湿实验订单草稿',
  },
  {
    id: 'file-public-cro-catalog',
    name: 'CRO_Assay_Catalog.xlsx',
    kind: 'xlsx',
    scope: 'public',
    fileSpaceKind: 'fileAsset',
    folderId: null,
    owner: 'Platform',
    size: '2.4 MB',
    modifiedAt: '昨天',
    status: 'ready',
    description: '组织内共享的实验服务目录与价格区间',
  },
  {
    id: 'file-public-xtrimo-guide',
    name: 'xTrimo_API_Guide.pdf',
    kind: 'pdf',
    scope: 'public',
    fileSpaceKind: 'fileAsset',
    folderId: null,
    owner: 'Model Team',
    size: '5.6 MB',
    modifiedAt: '2 天前',
    status: 'ready',
    description: 'xTrimo 模型调用、输入格式与配额说明',
  },
  {
    id: 'file-sec-hplc-overlay',
    name: 'SEC_HPLC_overlay.png',
    kind: 'png',
    scope: 'project',
    fileSpaceKind: 'projectFile',
    folderId: 'project-data-assetization',
    owner: 'LabOps',
    size: '780 KB',
    modifiedAt: '1 小时前',
    status: 'ready',
    description: '批次间聚集峰对齐图',
  },
  {
    id: 'file-archived-egfr-notes',
    name: 'EGFR_old_screening_notes.docx',
    kind: 'docx',
    scope: 'project',
    fileSpaceKind: 'projectFile',
    folderId: 'project-antibody-optimization',
    owner: 'zhengjun',
    size: '620 KB',
    modifiedAt: '5 天前',
    status: 'archived',
    description: '旧版筛选记录，保留用于追溯',
  },
]

export const dataAssetRecords: DataAssetRecord[] = [
  {
    id: 'data-egfr-candidates',
    name: 'EGFR_MOO_candidates_v3',
    category: 'datasets',
    scope: 'project',
    owner: 'Main Agent',
    rows: '1,284 rows',
    updatedAt: '32 分钟前',
    description: '亲和力、稳定性、表达量与 developability 评分汇总',
  },
  {
    id: 'data-bli-curves',
    name: 'BLI_sensorgram_curves',
    category: 'tables',
    scope: 'project',
    owner: 'LabOps',
    rows: '18,240 rows',
    updatedAt: '16 分钟前',
    description: 'BLI 原始曲线和拟合参数明细表',
  },
  {
    id: 'data-sec-hplc-qc',
    name: 'SEC_HPLC_QC_summary',
    category: 'analysis-results',
    scope: 'project',
    owner: 'Data Agent',
    rows: '42 reports',
    updatedAt: '1 小时前',
    description: '聚集峰、主峰面积和批次通过率分析结果',
  },
  {
    id: 'data-biologics-catalog',
    name: 'Biologics_Data_Catalog',
    category: 'catalog',
    scope: 'public',
    owner: 'Platform',
    rows: '186 entries',
    updatedAt: '昨天',
    description: '组织内可复用的抗体、蛋白与实验数据目录',
  },
]

export const experimentAssetRecords: ExperimentAssetRecord[] = [
  {
    id: 'experiment-egfr-request',
    name: 'EGFR 亲和力复测需求',
    category: 'request',
    scope: 'project',
    owner: 'zhengjun',
    status: '待确认',
    updatedAt: '39 分钟前',
    description: 'AF-14、AF-21、AF-38、AF-52 的 BLI 与 SEC-HPLC 复测',
  },
  {
    id: 'experiment-egfr-execution',
    name: 'BM-LAB-EGFR-20260528-001',
    category: 'execution',
    scope: 'project',
    owner: 'CRO Ops',
    status: '订单草稿',
    updatedAt: '39 分钟前',
    description: '待审批后提交湿实验执行',
  },
  {
    id: 'experiment-inventory-cells',
    name: 'HEK293 表达库存',
    category: 'inventory',
    scope: 'public',
    owner: 'LabOps',
    status: '可用',
    updatedAt: '昨天',
    description: '表达系统、培养基和可预约时间窗',
  },
  {
    id: 'experiment-bli-config',
    name: 'BLI_KD_Assay_Config',
    category: 'configuration',
    scope: 'public',
    owner: 'Platform',
    status: '已发布',
    updatedAt: '2 天前',
    description: 'BLI KD 实验条件、浓度梯度与质控阈值',
  },
]

export const modelAssetRecords: ModelAssetRecord[] = [
  {
    id: 'model-xtrimo-protein',
    name: 'xTrimoPFP',
    category: 'xtrimo',
    scope: 'public',
    owner: 'Model Team',
    status: '在线',
    updatedAt: '今天',
    description: '蛋白表示、序列性质预测和结构辅助评分',
  },
  {
    id: 'model-esm2',
    name: 'ESM-2 Protein Encoder',
    category: 'public-models',
    scope: 'public',
    owner: 'Open Source',
    status: '可调用',
    updatedAt: '2 天前',
    description: '公开蛋白语言模型，作为 baseline 对照',
  },
  {
    id: 'model-egfr-affinity-head',
    name: 'EGFR_Affinity_Head_v2',
    category: 'project-models',
    scope: 'project',
    owner: 'Antibody Team',
    status: '评估中',
    updatedAt: '3 小时前',
    description: 'EGFR 项目内训练的亲和力预测头',
  },
  {
    id: 'model-egfr-oracle',
    name: 'EGFR Developability Oracle',
    category: 'oracles',
    scope: 'project',
    owner: 'Oracle Agent',
    status: '已发布',
    updatedAt: '昨天',
    description: '综合亲和力、稳定性、表达量和风险评分的决策 Oracle',
  },
]

export function getAssetMenuItem(section: AssetsSection, item: AssetMenuItemId) {
  return assetMenuSections
    .find((currentSection) => currentSection.id === section)
    ?.items.find((currentItem) => currentItem.id === item)
}

export function getAssetSection(section: AssetsSection) {
  return assetMenuSections.find((currentSection) => currentSection.id === section)
}

export function isFileAssetItem(item: AssetMenuItemId): item is FileAssetItemId {
  return ['public-files', 'project-files', 'recent-uploads', 'archived-files'].includes(
    item,
  )
}
