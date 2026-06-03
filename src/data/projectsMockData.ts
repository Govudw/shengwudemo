import { fileAssetRecords, projectFileFolders } from './assetsMockData'

export type ProjectManagementStatus =
  | 'active'
  | 'atRisk'
  | 'completed'
  | 'archived'

export type ProjectMember = {
  id: string
  name: string
  title: string
}

export type ProjectAssetSummary = {
  files: number
  data: number
  experiments: number
  models: number
}

export type ProjectContextSummary = {
  projectContext: string
  objective: string
  constraints: string[]
  deliverables: string[]
}

export type ProjectManagementThread = {
  id: string
  title: string
  lastActivity: string
  lastActivityAt: number
}

export type ProjectManagementRecord = {
  projectId: string
  name: string
  status: ProjectManagementStatus
  favoritedByCurrentUser: boolean
  trashed: boolean
  responsibleMember: ProjectMember
  readOnlyPermissionMembers: ProjectMember[]
  editPermissionMembers: ProjectMember[]
  threads: ProjectManagementThread[]
  threadCount: number
  assetSummary: ProjectAssetSummary
  contextSummary: ProjectContextSummary
  createdAt: number
  lastActivityAt: number
  recentActivity: string
  recentActivityAt: number
  recentActivityThreadTitle: string | null
  description: string
  tags: string[]
}

export type ProjectManagementSeedThread = {
  id: string
  title: string
  lastActivity?: string
  lastActivityAt?: number
  archived?: boolean
}

export type ProjectManagementSeedProject = {
  id: string
  name: string
  threads: readonly ProjectManagementSeedThread[]
}

type ProjectManagementProfile = {
  status: ProjectManagementStatus
  favoritedByCurrentUser: boolean
  trashed: boolean
  responsibleMember: ProjectMember
  readOnlyPermissionMembers: ProjectMember[]
  editPermissionMembers: ProjectMember[]
  assetSummary: Omit<ProjectAssetSummary, 'files'> & { files?: number }
  contextSummary: ProjectContextSummary
  description: string
  tags: string[]
}

const minute = 60 * 1000
const hour = 60 * minute
const day = 24 * hour

const projectFileFolderNamesByProjectId = {
  'antibody-optimization': 'Antibody Optimization',
  'enzyme-discovery': 'Enzyme Discovery',
  'data-assetization': 'Data Assetization',
  'model-to-oracle': 'Model-to-Oracle',
} as const

const memberDirectory = {
  abot: {
    id: 'abot',
    name: 'ABot-智能助手',
    title: '项目负责人',
  },
  zhengjun: {
    id: 'zhengjun',
    name: 'zhengjun',
    title: '项目 Owner',
  },
  mainAgent: {
    id: 'main-agent',
    name: 'Main Agent',
    title: '执行代理',
  },
  labOps: {
    id: 'labops',
    name: 'LabOps',
    title: '实验协作方',
  },
  dataAgent: {
    id: 'data-agent',
    name: 'Data Agent',
    title: '数据治理',
  },
  modelTeam: {
    id: 'model-team',
    name: 'Model Team',
    title: '模型平台',
  },
  researchLead: {
    id: 'research-lead',
    name: 'Research Lead',
    title: '研究负责人',
  },
  platformOps: {
    id: 'platform-ops',
    name: 'Platform Ops',
    title: '平台运营',
  },
  processDev: {
    id: 'process-dev',
    name: 'Process Development',
    title: '流程开发负责人',
  },
} as const satisfies Record<string, ProjectMember>

const projectProfiles = {
  'antibody-optimization': {
    status: 'active',
    favoritedByCurrentUser: true,
    trashed: false,
    responsibleMember: memberDirectory.abot,
    readOnlyPermissionMembers: [
      memberDirectory.zhengjun,
      memberDirectory.labOps,
      memberDirectory.dataAgent,
      memberDirectory.mainAgent,
    ],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.modelTeam],
    assetSummary: {
      data: 3,
      experiments: 2,
      models: 4,
    },
    contextSummary: {
      projectContext:
        '项目描述：围绕 EGFR、IL-17A 与 HER2 抗体进行亲和力、表达量和 developability 的干湿闭环优化。',
      objective: '将候选抗体亲和力推进到 1 nM 以下，并保留表达量、纯度和稳定性约束。',
      constraints: [
        'BLI KD < 1 nM',
        '表达量不低于 35 mg/L',
        'SEC-HPLC monomer 不低于 95%',
      ],
      deliverables: [
        '候选分子排序',
        '湿实验订单',
        '实验结果报告',
        '下一轮局部优化计划',
      ],
    },
    description: 'EGFR、IL-17A、HER2 抗体候选的优化与实验验证项目。',
    tags: ['抗体', '亲和力', '干湿闭环'],
  },
  'enzyme-discovery': {
    status: 'atRisk',
    favoritedByCurrentUser: false,
    trashed: false,
    responsibleMember: memberDirectory.researchLead,
    readOnlyPermissionMembers: [memberDirectory.zhengjun, memberDirectory.platformOps],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.modelTeam],
    assetSummary: {
      data: 2,
      experiments: 1,
      models: 2,
    },
    contextSummary: {
      projectContext:
        '项目描述：围绕新型噬酸酶家族开展序列调研、结构建模和活性筛选设计。',
      objective: '识别可进入实验验证的酶家族成员与突变组合。',
      constraints: ['优先保留催化口袋保守性', '筛选方案需覆盖阴性对照', '候选数量控制在 24 个以内'],
      deliverables: ['酶家族证据表', '结构风险标注', '筛选实验方案'],
    },
    description: '酶家族调研、结构分析和实验筛选策略。',
    tags: ['酶', '结构', '筛选'],
  },
  'pipeline-build': {
    status: 'active',
    favoritedByCurrentUser: false,
    trashed: false,
    responsibleMember: memberDirectory.processDev,
    readOnlyPermissionMembers: [memberDirectory.zhengjun, memberDirectory.labOps],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.platformOps],
    assetSummary: {
      files: 3,
      data: 0,
      experiments: 0,
      models: 0,
    },
    contextSummary: {
      projectContext:
        '项目描述：围绕 ENZ-P0 候选酶实验过程，把输入文件、人工确认点、QC 分流和结果包归档固化为可复用 Pipeline。',
      objective: '让候选酶表征实验从需求澄清到 DAG 保存形成可追溯流程。',
      constraints: [
        '活性测定前必须确认底物批次与反应体系',
        '表达与纯化 QC 未通过样本不进入活性测定',
        '异常样本复测需由实验负责人确认',
      ],
      deliverables: [
        'ENZ-P0 Assay Characterization Pipeline v1.0',
        'Pipeline DAG v0.2',
        '确认点与依赖校验记录',
      ],
    },
    description: '候选酶实验流程编排、DAG 生成和 Pipeline 保存项目。',
    tags: ['Pipeline', '流程编排', '酶实验'],
  },
  'data-assetization': {
    status: 'active',
    favoritedByCurrentUser: true,
    trashed: false,
    responsibleMember: memberDirectory.dataAgent,
    readOnlyPermissionMembers: [
      memberDirectory.zhengjun,
      memberDirectory.labOps,
      memberDirectory.platformOps,
    ],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.modelTeam],
    assetSummary: {
      data: 5,
      experiments: 2,
      models: 1,
    },
    contextSummary: {
      projectContext:
        '项目描述：将 SEC-HPLC、BLI 和细胞实验结果标准化为可检索、可复用的数据资产。',
      objective: '沉淀跨项目可复用的数据结构、质控口径和数据目录。',
      constraints: ['保留原始文件追溯', '字段命名与数据目录一致', '分析结果需要能回链项目文件'],
      deliverables: ['数据集登记', '质控分析结果', '数据目录条目'],
    },
    description: '实验数据标准化、质控和资产登记项目。',
    tags: ['数据资产', '质控', '目录'],
  },
  'model-to-oracle': {
    status: 'completed',
    favoritedByCurrentUser: false,
    trashed: false,
    responsibleMember: memberDirectory.modelTeam,
    readOnlyPermissionMembers: [memberDirectory.zhengjun, memberDirectory.dataAgent],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.platformOps],
    assetSummary: {
      data: 2,
      experiments: 0,
      models: 5,
    },
    contextSummary: {
      projectContext:
        '项目描述：将模型评估、知识图谱和 Oracle 发布流程串联为可调用的研发能力。',
      objective: '完成模型基准、Oracle 准入和发布前评估。',
      constraints: ['保留训练/验证数据版本', 'Oracle 输出需可解释', '发布前完成性能基准'],
      deliverables: ['模型评估报告', 'Oracle 发布清单', '知识图谱构建计划'],
    },
    description: '模型评估、Oracle 发布和知识图谱准备。',
    tags: ['模型', 'Oracle', '评估'],
  },
  'protein-delivery': {
    status: 'archived',
    favoritedByCurrentUser: false,
    trashed: false,
    responsibleMember: memberDirectory.researchLead,
    readOnlyPermissionMembers: [memberDirectory.zhengjun, memberDirectory.platformOps],
    editPermissionMembers: [memberDirectory.mainAgent, memberDirectory.labOps],
    assetSummary: {
      files: 0,
      data: 1,
      experiments: 2,
      models: 1,
    },
    contextSummary: {
      projectContext:
        '项目描述：围绕蛋白递送载体、AAV 包装和体内分布结果进行早期方案管理。',
      objective: '等待下一批体内分布数据后恢复候选路线决策。',
      constraints: ['递送载体设计需经过安全性复核', '实验资源排期暂停', '先保留历史记录'],
      deliverables: ['载体设计讨论记录', '包装实验方案', '体内分布分析'],
    },
    description: '蛋白递送载体和 AAV 包装方案，当前暂停等待新数据。',
    tags: ['递送', 'AAV', '暂停'],
  },
} as const satisfies Record<string, ProjectManagementProfile>

const legacyTrashedProject: ProjectManagementRecord = {
  projectId: 'legacy-target-cleanup',
  name: 'Legacy Target Cleanup',
  status: 'archived',
  favoritedByCurrentUser: false,
  trashed: true,
  responsibleMember: memberDirectory.platformOps,
  readOnlyPermissionMembers: [memberDirectory.zhengjun, memberDirectory.dataAgent],
  editPermissionMembers: [memberDirectory.mainAgent],
  threads: [],
  threadCount: 0,
  assetSummary: {
    files: 0,
    data: 0,
    experiments: 0,
    models: 0,
  },
  contextSummary: {
    projectContext:
      '项目描述：旧靶点清理项目，已归档到回收站，仅保留权限和审计信息。',
    objective: '保留历史项目壳和删除态，用于项目管理页验证回收站行为。',
    constraints: ['不可新建对话', '不可写入资产', '仅管理员可恢复'],
    deliverables: ['归档记录', '权限快照'],
  },
  recentActivity: '45 天前',
  recentActivityAt: Date.parse('2026-04-12T10:00:00+08:00'),
  createdAt: Date.parse('2025-11-18T10:00:00+08:00'),
  lastActivityAt: Date.parse('2026-04-12T10:00:00+08:00'),
  recentActivityThreadTitle: null,
  description: '旧靶点清理项目，已进入回收站。',
  tags: ['归档', '回收站'],
}

export function getProjectManagementRecords(
  seedProjects: readonly ProjectManagementSeedProject[],
  now = Date.now(),
): ProjectManagementRecord[] {
  const records = seedProjects.map((project, projectIndex) =>
    createProjectManagementRecord(project, now, projectIndex),
  )

  if (records.some((record) => record.projectId === legacyTrashedProject.projectId)) {
    return records
  }

  return [...records, legacyTrashedProject]
}

export function getProjectFileFolderId(projectId: string): string | null {
  const folderName =
    projectFileFolderNamesByProjectId[
      projectId as keyof typeof projectFileFolderNamesByProjectId
    ]

  if (!folderName) {
    return null
  }

  return (
    projectFileFolders.find((folder) => folder.projectName === folderName)?.id ?? null
  )
}

function createProjectManagementRecord(
  project: ProjectManagementSeedProject,
  now: number,
  projectIndex: number,
): ProjectManagementRecord {
  const profile = getProjectProfile(project)
  const threads = project.threads
    .filter((thread) => !thread.archived)
    .map((thread, threadIndex) => toProjectManagementThread(thread, now, threadIndex))
    .sort((left, right) => right.lastActivityAt - left.lastActivityAt)
  const recentThread = threads[0]
  const folderId = getProjectFileFolderId(project.id)
  const fileCount =
    profile.assetSummary.files ??
    (folderId
      ? fileAssetRecords.filter((record) => record.folderId === folderId).length
      : 0)
  const createdAt = now - (projectIndex + 120) * day
  const recentActivityAt =
    recentThread?.lastActivityAt ?? now - (projectIndex + 30) * day
  const editPermissionMembers = getPermissionMembers(
    profile.editPermissionMembers,
    profile.responsibleMember,
  )
  const readOnlyPermissionMembers = getPermissionMembers(
    profile.readOnlyPermissionMembers,
    profile.responsibleMember,
    new Set(editPermissionMembers.map((member) => member.id)),
  )

  return {
    projectId: project.id,
    name: project.name,
    status: profile.status,
    favoritedByCurrentUser: profile.favoritedByCurrentUser,
    trashed: profile.trashed,
    responsibleMember: profile.responsibleMember,
    readOnlyPermissionMembers,
    editPermissionMembers,
    threads,
    threadCount: threads.length,
    assetSummary: {
      files: fileCount,
      data: profile.assetSummary.data,
      experiments: profile.assetSummary.experiments,
      models: profile.assetSummary.models,
    },
    contextSummary: profile.contextSummary,
    createdAt,
    lastActivityAt: recentActivityAt,
    recentActivity: recentThread?.lastActivity ?? formatRelativeActivity(recentActivityAt, now),
    recentActivityAt,
    recentActivityThreadTitle: recentThread?.title ?? null,
    description: profile.description,
    tags: profile.tags,
  }
}

function getProjectProfile(project: ProjectManagementSeedProject): ProjectManagementProfile {
  const profile = projectProfiles[project.id as keyof typeof projectProfiles]

  if (profile) {
    return profile
  }

  return {
    status: 'active',
    favoritedByCurrentUser: false,
    trashed: false,
    responsibleMember: memberDirectory.mainAgent,
    readOnlyPermissionMembers: [memberDirectory.zhengjun],
    editPermissionMembers: [memberDirectory.platformOps],
    assetSummary: {
      files: 0,
      data: 0,
      experiments: 0,
      models: 0,
    },
    contextSummary: {
      projectContext: `项目描述：${project.name} 的项目上下文仍在整理中。`,
      objective: '维护项目对话、权限和资产入口。',
      constraints: ['保持负责人唯一', '读取权限与编辑权限不自动合并'],
      deliverables: ['项目上下文', '相关对话', '资产入口'],
    },
    description: `${project.name} 的项目管理记录。`,
    tags: ['项目'],
  }
}

function toProjectManagementThread(
  thread: ProjectManagementSeedThread,
  now: number,
  threadIndex: number,
): ProjectManagementThread {
  const lastActivityAt = getThreadActivityAt(thread, now, threadIndex)

  return {
    id: thread.id,
    title: thread.title,
    lastActivity:
      thread.lastActivity ?? formatRelativeActivity(lastActivityAt, now),
    lastActivityAt,
  }
}

function getThreadActivityAt(
  thread: ProjectManagementSeedThread,
  now: number,
  threadIndex: number,
) {
  if (
    typeof thread.lastActivityAt === 'number' &&
    Number.isFinite(thread.lastActivityAt)
  ) {
    return thread.lastActivityAt
  }

  if (thread.lastActivity) {
    return parseActivityLabel(thread.lastActivity, now, threadIndex)
  }

  return now - (threadIndex + 1) * minute
}

function parseActivityLabel(label: string, now: number, seedOrder: number) {
  if (label === '刚刚') {
    return now
  }

  if (label === '昨天') {
    return now - day
  }

  const minuteMatch = label.match(/^(\d+)\s*分钟(?:前)?$/)
  if (minuteMatch) {
    return now - Number(minuteMatch[1]) * minute
  }

  const hourMatch = label.match(/^(\d+)\s*小时(?:前)?$/)
  if (hourMatch) {
    return now - Number(hourMatch[1]) * hour
  }

  const dayMatch = label.match(/^(\d+)\s*天前$/)
  if (dayMatch) {
    return now - Number(dayMatch[1]) * day
  }

  return now - (seedOrder + 1) * minute
}

function formatRelativeActivity(lastActivityAt: number, now: number) {
  const elapsed = Math.max(0, now - lastActivityAt)

  if (elapsed < minute) {
    return '刚刚'
  }

  if (elapsed < hour) {
    return `${Math.max(1, Math.floor(elapsed / minute))} 分钟`
  }

  if (elapsed < day) {
    return `${Math.max(1, Math.floor(elapsed / hour))} 小时`
  }

  if (elapsed < 2 * day) {
    return '昨天'
  }

  return `${Math.max(2, Math.floor(elapsed / day))} 天前`
}

function getPermissionMembers(
  members: readonly ProjectMember[],
  responsibleMember: ProjectMember,
  excludedMemberIds = new Set<string>(),
): ProjectMember[] {
  const seenMemberIds = new Set<string>()

  return members.filter((member) => {
    if (
      member.id === responsibleMember.id ||
      seenMemberIds.has(member.id) ||
      excludedMemberIds.has(member.id)
    ) {
      return false
    }

    seenMemberIds.add(member.id)
    return true
  })
}
