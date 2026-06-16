export type TemplateScopeTag = '日常' | '生物' | '飞书' | '其他'

export type TemplateDirectionTag =
  | '蛋白药物'
  | '虚拟细胞'
  | '合成生物学'
  | '农业育种'
  | '其他'

export type TemplateTypeTag =
  | '完整工作流'
  | '研究设计'
  | '实验'
  | '结果分析'
  | '模型优化'

export type TemplateCardIcon =
  | 'target'
  | 'flask'
  | 'database'
  | 'brain'
  | 'report'
  | 'package'
  | 'workflow'
  | 'cells'
  | 'culture'
  | 'chart'

export type HomeTemplateTone = 'cyan' | 'blue' | 'teal' | 'violet' | 'amber'

export type ScopeFilterValue = '全部类别' | '推荐' | TemplateScopeTag
export type DirectionFilterValue = '全部方向' | TemplateDirectionTag
export type TypeFilterValue = '全部类型' | TemplateTypeTag

export interface HomeTemplate {
  id: string
  title: string
  summary: string
  input: string
  output: string
  prompt: string
  icon: TemplateCardIcon
  tone: HomeTemplateTone
  scopeTags: TemplateScopeTag[]
  directionTags: TemplateDirectionTag[]
  typeTags: TemplateTypeTag[]
  displayTags: string[]
  featured: boolean
  sortOrder: number
}

export interface TemplateFilterOption<TValue extends string> {
  label: TValue
  value: TValue
}

export interface HomeTemplateFilters {
  scope?: ScopeFilterValue
  direction?: DirectionFilterValue
  type?: TypeFilterValue
}

export interface TemplatePage<TItem> {
  items: TItem[]
  page: number
  totalPages: number
  totalItems: number
  perPage: number
}

export const scopeFilterOptions: TemplateFilterOption<ScopeFilterValue>[] = [
  { label: '全部类别', value: '全部类别' },
  { label: '推荐', value: '推荐' },
  { label: '日常', value: '日常' },
  { label: '生物', value: '生物' },
  { label: '飞书', value: '飞书' },
  { label: '其他', value: '其他' },
]

export const directionFilterOptions: TemplateFilterOption<DirectionFilterValue>[] = [
  { label: '全部方向', value: '全部方向' },
  { label: '蛋白药物', value: '蛋白药物' },
  { label: '虚拟细胞', value: '虚拟细胞' },
  { label: '合成生物学', value: '合成生物学' },
  { label: '农业育种', value: '农业育种' },
  { label: '其他', value: '其他' },
]

export const typeFilterOptions: TemplateFilterOption<TypeFilterValue>[] = [
  { label: '全部类型', value: '全部类型' },
  { label: '完整工作流', value: '完整工作流' },
  { label: '研究设计', value: '研究设计' },
  { label: '实验', value: '实验' },
  { label: '结果分析', value: '结果分析' },
  { label: '模型优化', value: '模型优化' },
]
