import { describe, expect, it } from 'vitest'
import {
  filterTemplates,
  getFilteredTemplates,
  getTemplatePage,
  homeTemplateBatches,
  homeTemplates,
  scopeFilterOptions,
  sortTemplates,
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
    directionTags: ['蛋白药物'],
    typeTags: ['完整工作流'],
    displayTags: ['推荐', '蛋白药物'],
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
    directionTags: ['其他'],
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
    directionTags: ['虚拟细胞'],
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

  it('aggregates 20 ordered batches into 100 templates', () => {
    expect(homeTemplateBatches).toHaveLength(20)
    expect(homeTemplateBatches.every((batch) => batch.length === 5)).toBe(true)
    expect(homeTemplates).toHaveLength(100)
    expect(homeTemplates).toEqual(homeTemplateBatches.flat())
  })

  it('assigns unique ids spanning home-template-001 through home-template-100', () => {
    const ids = homeTemplates.map((template) => template.id)

    expect(new Set(ids).size).toBe(100)
    expect(ids[0]).toBe('home-template-001')
    expect(ids.at(-1)).toBe('home-template-100')
    expect(ids).toEqual(
      Array.from({ length: 100 }, (_, index) => `home-template-${String(index + 1).padStart(3, '0')}`),
    )
  })

  it('keeps sortOrder aligned to the id suffix from 1 through 100', () => {
    expect(homeTemplates.map((template) => template.sortOrder)).toEqual(
      Array.from({ length: 100 }, (_, index) => index + 1),
    )

    homeTemplates.forEach((template, index) => {
      expect(Number(template.id.slice(-3))).toBe(index + 1)
      expect(template.sortOrder).toBe(index + 1)
    })
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
      '蛋白药物',
      '虚拟细胞',
      '合成生物学',
      '农业育种',
      '其他',
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

  it('ensures every filter option value has at least one matching template', () => {
    expect(filterTemplates(homeTemplates, { scope: '推荐' }).length).toBeGreaterThan(0)
    expect(filterTemplates(homeTemplates, { scope: '日常' }).length).toBeGreaterThan(0)
    expect(filterTemplates(homeTemplates, { scope: '生物' }).length).toBeGreaterThan(0)

    for (const direction of directionFilterOptions.map((option) => option.value).filter(isDirectionValue)) {
      expect(filterTemplates(homeTemplates, { direction }).length).toBeGreaterThan(0)
    }

    for (const type of typeFilterOptions.map((option) => option.value).filter(isTypeValue)) {
      expect(filterTemplates(homeTemplates, { type }).length).toBeGreaterThan(0)
    }
  })

  it('stays within the expected featured and scope distribution', () => {
    const featuredCount = homeTemplates.filter((template) => template.featured).length
    const bioCount = homeTemplates.filter((template) => template.scopeTags.includes('生物')).length
    const dailyCount = homeTemplates.filter((template) => template.scopeTags.includes('日常')).length

    expect(featuredCount).toBeGreaterThanOrEqual(18)
    expect(featuredCount).toBeLessThanOrEqual(24)
    expect(bioCount).toBeGreaterThanOrEqual(65)
    expect(dailyCount).toBeGreaterThanOrEqual(25)
  })

  it('classifies every template into the new high-level direction taxonomy', () => {
    const deprecatedDirections = new Set(['抗体', '细胞', '酶', '菌株', '发酵', '育种'])
    const allowedDirections = new Set(
      directionFilterOptions
        .map((option) => option.value)
        .filter((value) => value !== '全部方向'),
    )

    homeTemplates.forEach((template) => {
      expect(template.directionTags.length).toBeGreaterThan(0)
      expect(template.directionTags.every((direction) => allowedDirections.has(direction))).toBe(true)
      expect(template.directionTags.some((direction) => deprecatedDirections.has(direction))).toBe(false)
    })
  })

  it('uses user-command language in prompts without asking 需要你提供', () => {
    homeTemplates.forEach((template) => {
      expect(template.prompt).toContain('我的')
      expect(template.prompt).toContain('请你作为Agent')
      expect(template.prompt).not.toContain('需要你提供')
    })
  })

  it('keeps display tags between two and four entries and excludes 推荐 from scope tags', () => {
    homeTemplates.forEach((template) => {
      expect(template.displayTags.length).toBeGreaterThanOrEqual(2)
      expect(template.displayTags.length).toBeLessThanOrEqual(4)
      expect(template.scopeTags).not.toContain('推荐')
    })
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
        direction: '虚拟细胞',
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
      directionTags: ['合成生物学'],
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

  it('keeps the default first page mixed across scope and multiple tag families', () => {
    const firstPage = getTemplatePage(sortTemplates(homeTemplates), 1, 30).items
    const pageScopes = new Set(firstPage.flatMap((template) => template.scopeTags))
    const pageDirections = new Set(firstPage.flatMap((template) => template.directionTags))
    const pageTypes = new Set(firstPage.flatMap((template) => template.typeTags))
    const pageDisplayTags = new Set(firstPage.flatMap((template) => template.displayTags))

    expect(firstPage).toHaveLength(30)
    expect(pageScopes).toEqual(new Set(['日常', '生物']))
    expect(pageDirections.size).toBeGreaterThanOrEqual(3)
    expect(pageTypes.size).toBeGreaterThanOrEqual(3)
    expect(pageDisplayTags.size).toBeGreaterThanOrEqual(8)
  })

  it('searches, filters, sorts, and paginates correctly against the real dataset', () => {
    const filtered = getFilteredTemplates(
      homeTemplates,
      {
        scope: '生物',
        direction: '蛋白药物',
        type: '研究设计',
      },
      '设计',
    )

    expect(filtered.length).toBeGreaterThan(0)
    expect(filtered.every((template) => template.scopeTags.includes('生物'))).toBe(true)
    expect(filtered.every((template) => template.directionTags.includes('蛋白药物'))).toBe(true)
    expect(filtered.every((template) => template.typeTags.includes('研究设计'))).toBe(true)
    expect(filtered.every((template) => template.title.includes('设计') || template.summary.includes('设计') || template.input.includes('设计') || template.output.includes('设计') || template.displayTags.some((tag) => tag.includes('设计')))).toBe(true)

    const page = getTemplatePage(filtered, 1, 30)
    expect(page.items).toEqual(filtered)
    expect(page.totalItems).toBe(filtered.length)
    expect(page.totalPages).toBe(1)
  })
})

function searchIds(query: string) {
  return getFilteredTemplates(templates, {}, query).map((template) => template.id)
}

function isDirectionValue(
  value: string,
): value is Exclude<(typeof directionFilterOptions)[number]['value'], '全部方向'> {
  return value !== '全部方向'
}

function isTypeValue(
  value: string,
): value is Exclude<(typeof typeFilterOptions)[number]['value'], '全部类型'> {
  return value !== '全部类型'
}
