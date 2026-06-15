import { describe, expect, it } from 'vitest'
import {
  filterTemplates,
  getFilteredTemplates,
  getTemplatePage,
  homeTemplates,
  scopeFilterOptions,
  typeFilterOptions,
  directionFilterOptions,
  type HomeTemplate,
  type HomeTemplateTone,
} from './index'

const documentedTones: HomeTemplateTone[] = [
  'cyan',
  'blue',
  'teal',
  'violet',
  'amber',
]

const templates: HomeTemplate[] = [
  {
    id: 'featured-workflow',
    title: '抗体完整工作流',
    summary: '面向抗体项目的端到端编排',
    input: '靶点信息与项目背景',
    output: '实验方案与分析摘要',
    prompt: '仅供系统执行的内部提示词 alpha-secret',
    icon: 'workflow',
    tone: 'cyan',
    scopeTags: ['生物'],
    directionTags: ['抗体'],
    typeTags: ['完整工作流'],
    displayTags: ['推荐', '抗体'],
    featured: true,
    sortOrder: 20,
  },
  {
    id: 'daily-analysis',
    title: '日报结果分析',
    summary: '面向日常运营的结果整理',
    input: '实验记录与日报数据',
    output: '日报总结',
    prompt: 'hidden-daily-term',
    icon: 'chart',
    tone: 'blue',
    scopeTags: ['日常'],
    directionTags: ['发酵'],
    typeTags: ['结果分析'],
    displayTags: ['日报', '推荐候选'],
    featured: false,
    sortOrder: 1,
  },
  {
    id: 'cell-design',
    title: '细胞研究设计',
    summary: '细胞实验设计与变量拆解',
    input: '研究目标与约束条件',
    output: '实验设计草案',
    prompt: 'hidden-cell-term',
    icon: 'cells',
    tone: 'teal',
    scopeTags: ['生物'],
    directionTags: ['细胞'],
    typeTags: ['研究设计'],
    displayTags: ['细胞', '设计'],
    featured: true,
    sortOrder: 5,
  },
]

describe('home template filtering', () => {
  it('exports the documented home template tone tokens', () => {
    expect(documentedTones).toEqual(['cyan', 'blue', 'teal', 'violet', 'amber'])
  })

  it('exports an empty home templates array at this stage', () => {
    expect(homeTemplates).toEqual([])
  })

  it('defines the exact filter option labels', () => {
    expect(scopeFilterOptions.map((option) => option.label)).toEqual([
      '全部类别',
      '推荐',
      '日常',
      '生物',
    ])
    expect(directionFilterOptions.map((option) => option.label)).toEqual([
      '全部方向',
      '抗体',
      '细胞',
      '酶',
      '菌株',
      '发酵',
      '育种',
    ])
    expect(typeFilterOptions.map((option) => option.label)).toEqual([
      '全部类型',
      '完整工作流',
      '研究设计',
      '实验',
      '结果分析',
      '模型优化',
    ])
  })

  it('sorts featured templates before non-featured and then by sort order', () => {
    expect(getFilteredTemplates(templates, {}, '').map((template) => template.id)).toEqual([
      'cell-design',
      'featured-workflow',
      'daily-analysis',
    ])
  })

  it('uses featured state for the 推荐 scope filter', () => {
    expect(
      filterTemplates(templates, {
        scope: '推荐',
      }).map((template) => template.id),
    ).toEqual(['featured-workflow', 'cell-design'])
  })

  it('intersects scope direction and type filters', () => {
    expect(
      filterTemplates(templates, {
        scope: '生物',
        direction: '细胞',
        type: '研究设计',
      }).map((template) => template.id),
    ).toEqual(['cell-design'])
  })

  it('searches visible fields and finds title and display tag terms', () => {
    expect(searchIds('抗体')).toEqual(['featured-workflow'])
    expect(searchIds('日报')).toEqual(['daily-analysis'])
  })

  it('does not match prompt-only hidden terms', () => {
    expect(searchIds('alpha-secret')).toEqual([])
    expect(searchIds('hidden-daily-term')).toEqual([])
  })

  it('uses multi-keyword AND behavior', () => {
    expect(searchIds('细胞 设计')).toEqual(['cell-design'])
    expect(searchIds('细胞 推荐')).toEqual([])
  })

  it('returns paginated items with thirty entries and total pages', () => {
    const pagedTemplates: HomeTemplate[] = Array.from({ length: 65 }, (_, index) => ({
      id: `template-${index + 1}`,
      title: `模板 ${index + 1}`,
      summary: '分页测试',
      input: '输入',
      output: '输出',
      prompt: 'hidden',
      icon: 'package',
      tone: 'violet',
      scopeTags: ['日常'],
      directionTags: ['酶'],
      typeTags: ['实验'],
      displayTags: [`标签 ${index + 1}`],
      featured: false,
      sortOrder: index + 1,
    }))

    expect(getTemplatePage(pagedTemplates, 2, 30)).toMatchObject({
      page: 2,
      totalPages: 3,
      totalItems: 65,
      perPage: 30,
    })
    expect(getTemplatePage(pagedTemplates, 2, 30).items).toHaveLength(30)
    expect(getTemplatePage(pagedTemplates, 99, 30).page).toBe(3)
  })

  it('falls back to a safe default when perPage is NaN', () => {
    const page = getTemplatePage(templates, 1, Number.NaN)

    expect(page).toMatchObject({
      page: 1,
      totalPages: 1,
      totalItems: 3,
      perPage: 30,
    })
    expect(page.items).toEqual(templates)
  })

  it('returns stable pagination metadata for an empty input list', () => {
    expect(getTemplatePage([], 99, 30)).toMatchObject({
      items: [],
      page: 1,
      totalPages: 1,
      totalItems: 0,
      perPage: 30,
    })
  })
})

function searchIds(query: string) {
  return getFilteredTemplates(templates, {}, query).map((template) => template.id)
}
