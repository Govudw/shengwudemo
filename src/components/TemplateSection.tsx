import { useMemo, useState } from 'react'
import {
  directionFilterOptions,
  getFilteredTemplates,
  getTemplatePage,
  scopeFilterOptions,
  typeFilterOptions,
} from '../data/homeTemplates'
import type {
  DirectionFilterValue,
  HomeTemplate,
  ScopeFilterValue,
  TemplateFilterOption,
  TypeFilterValue,
} from '../data/homeTemplates'
import { CardIcon } from './icons'

const templatesPerPage = 30

type TemplateSectionProps = {
  templates: HomeTemplate[]
  onTemplateSelect: (template: HomeTemplate) => void
}

function TemplateSection({ templates, onTemplateSelect }: TemplateSectionProps) {
  const [scope, setScope] = useState<ScopeFilterValue>('全部类别')
  const [direction, setDirection] =
    useState<DirectionFilterValue>('全部方向')
  const [type, setType] = useState<TypeFilterValue>('全部类型')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const filteredTemplates = useMemo(
    () => getFilteredTemplates(templates, { scope, direction, type }, query),
    [direction, query, scope, templates, type],
  )
  const templatePage = getTemplatePage(filteredTemplates, page, templatesPerPage)
  const showPagination = templatePage.totalItems > templatesPerPage

  function updateFilter<TValue extends string>(
    setter: (value: TValue) => void,
    value: TValue,
  ) {
    setter(value)
    setPage(1)
  }

  function updateQuery(value: string) {
    setQuery(value)
    setPage(1)
  }

  return (
    <section className="template-section use-case-section" aria-label="模板区">
      <div className="template-section__toolbar">
        <label className="template-section__search">
          <input
            type="search"
            aria-label="搜索模板"
            value={query}
            placeholder="搜索模板"
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>

        <div className="template-section__filters">
          <FilterGroup
            ariaLabel="模板类别"
            options={scopeFilterOptions}
            value={scope}
            onChange={(value) => updateFilter(setScope, value)}
          />
          <FilterGroup
            ariaLabel="模板方向"
            options={directionFilterOptions}
            value={direction}
            onChange={(value) => updateFilter(setDirection, value)}
          />
          <FilterGroup
            ariaLabel="模板类型"
            options={typeFilterOptions}
            value={type}
            onChange={(value) => updateFilter(setType, value)}
          />
        </div>
      </div>

      <div className="template-section__meta" aria-live="polite">
        {templatePage.totalItems} 个模板
      </div>

      {templatePage.items.length > 0 ? (
        <div className="template-section__grid use-case-grid">
          {templatePage.items.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-card use-case-card template-card--${template.tone}`}
              onClick={() => onTemplateSelect(template)}
            >
              <span className="template-card__header use-case-grid__card-header">
                <span className="template-card__icon use-case-grid__card-icon">
                  <CardIcon
                    icon={template.icon}
                    className="template-card__icon-svg use-case-grid__icon"
                  />
                </span>
                <span className="template-card__title use-case-grid__card-title">
                  {template.title}
                </span>
              </span>
              <span className="template-card__summary use-case-grid__card-summary">
                {template.summary}
              </span>
              <span className="template-card__detail use-case-grid__card-detail">
                <span className="template-card__label use-case-grid__card-label">
                  输入
                </span>
                <span>{template.input}</span>
              </span>
              <span className="template-card__detail use-case-grid__card-detail">
                <span className="template-card__label use-case-grid__card-label">
                  输出
                </span>
                <span>{template.output}</span>
              </span>
              <span className="template-card__tag-row">
                {template.displayTags.map((tag) => (
                  <span key={tag} className="template-card__tag">
                    {tag}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="template-section__empty">未找到匹配模板</p>
      )}

      {showPagination ? (
        <div className="template-section__pagination" aria-label="模板分页">
          {Array.from({ length: templatePage.totalPages }, (_, index) => {
            const pageNumber = index + 1

            return (
              <button
                key={pageNumber}
                type="button"
                className="template-section__page"
                aria-label={`第 ${pageNumber} 页`}
                aria-current={templatePage.page === pageNumber ? 'page' : undefined}
                onClick={() => setPage(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

type FilterGroupProps<TValue extends string> = {
  ariaLabel: string
  options: TemplateFilterOption<TValue>[]
  value: TValue
  onChange: (value: TValue) => void
}

function FilterGroup<TValue extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: FilterGroupProps<TValue>) {
  return (
    <div
      className="template-section__filter-group capability-row"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            className={`template-section__filter use-case-grid__chip${
              isSelected ? ' template-section__filter--selected selected' : ''
            }`}
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export default TemplateSection
