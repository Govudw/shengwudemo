import type {
  DirectionFilterValue,
  HomeTemplate,
  HomeTemplateFilters,
  ScopeFilterValue,
  TemplatePage,
  TypeFilterValue,
} from './types'

const defaultTemplatesPerPage = 30

export function sortTemplates(templates: HomeTemplate[]) {
  return [...templates].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1
    }

    return left.sortOrder - right.sortOrder
  })
}

export function filterTemplates(
  templates: HomeTemplate[],
  filters: HomeTemplateFilters,
) {
  return templates.filter((template) => {
    return (
      matchesScope(template, filters.scope) &&
      matchesDirection(template, filters.direction) &&
      matchesType(template, filters.type)
    )
  })
}

export function searchTemplates(templates: HomeTemplate[], query: string) {
  const normalizedTerms = query
    .trim()
    .toLocaleLowerCase()
    .split(/\s+/)
    .filter(Boolean)

  if (normalizedTerms.length === 0) {
    return [...templates]
  }

  return templates.filter((template) => {
    const visibleText = [
      template.title,
      template.summary,
      template.input,
      template.output,
      ...template.displayTags,
    ]
      .join(' ')
      .toLocaleLowerCase()

    return normalizedTerms.every((term) => visibleText.includes(term))
  })
}

export function getTemplatePage(
  templates: HomeTemplate[],
  page: number,
  perPage: number,
): TemplatePage<HomeTemplate> {
  const totalItems = templates.length
  const safePerPage = sanitizePerPage(perPage)
  const totalPages = Math.max(1, Math.ceil(totalItems / safePerPage))
  const safePage = clampPage(page, totalPages)
  const startIndex = (safePage - 1) * safePerPage

  return {
    items: templates.slice(startIndex, startIndex + safePerPage),
    page: safePage,
    totalPages,
    totalItems,
    perPage: safePerPage,
  }
}

export function getFilteredTemplates(
  templates: HomeTemplate[],
  filters: HomeTemplateFilters,
  query: string,
) {
  return sortTemplates(searchTemplates(filterTemplates(templates, filters), query))
}

function matchesScope(template: HomeTemplate, scope: ScopeFilterValue | undefined) {
  if (!scope || scope === '全部类别') {
    return true
  }

  return template.scopeTags.includes(scope)
}

function matchesDirection(
  template: HomeTemplate,
  direction: DirectionFilterValue | undefined,
) {
  if (!direction || direction === '全部方向') {
    return true
  }

  return template.directionTags.includes(direction)
}

function matchesType(template: HomeTemplate, type: TypeFilterValue | undefined) {
  if (!type || type === '全部类型') {
    return true
  }

  return template.typeTags.includes(type)
}

function clampPage(page: number, totalPages: number) {
  if (!Number.isFinite(page)) {
    return 1
  }

  return Math.min(Math.max(1, Math.trunc(page)), totalPages)
}

function sanitizePerPage(perPage: number) {
  if (!Number.isFinite(perPage) || perPage < 1) {
    return defaultTemplatesPerPage
  }

  return Math.trunc(perPage)
}
