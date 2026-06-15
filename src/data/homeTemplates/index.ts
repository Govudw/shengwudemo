import type { HomeTemplate } from './types'

export const homeTemplates: HomeTemplate[] = []

export {
  directionFilterOptions,
  scopeFilterOptions,
  typeFilterOptions,
} from './types'

export type {
  DirectionFilterValue,
  HomeTemplate,
  HomeTemplateFilters,
  ScopeFilterValue,
  TemplateCardIcon,
  TemplateDirectionTag,
  TemplateFilterOption,
  TemplatePage,
  TemplateScopeTag,
  TemplateTypeTag,
  TypeFilterValue,
} from './types'

export {
  filterTemplates,
  getFilteredTemplates,
  getTemplatePage,
  searchTemplates,
  sortTemplates,
} from './filtering'
