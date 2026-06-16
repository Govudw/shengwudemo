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
import { CardIcon, ChevronDownIcon, SearchIcon } from './icons'

const templatesPerPage = 30
const tagToneKeywords = [
  { tone: 'amber', keywords: ['风险', '审查', '审批', '异常', '偏差'] },
  { tone: 'blue', keywords: ['数据', 'QC', '质控', '模型', 'Oracle'] },
  { tone: 'violet', keywords: ['项目', '交接', '协同', '会议', '周报'] },
  { tone: 'cyan', keywords: ['靶点', '抗体', '设计', '表位', '机制'] },
  { tone: 'teal', keywords: ['实验', '发酵', '菌株', '育种', '酶'] },
] as const

type TagTone = (typeof tagToneKeywords)[number]['tone']

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
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false)
  const advancedFiltersActive = type !== '全部类型'
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
    <section className="template-section" aria-label="模板区">
      <div
        className={`template-section__toolbar${
          advancedFiltersOpen ? ' template-section__toolbar--expanded' : ''
        }`}
      >
        <div className="template-section__primary-controls">
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

          <div className="template-section__advanced-control">
            <button
              type="button"
              className={`template-section__advanced-toggle${
                advancedFiltersActive && !advancedFiltersOpen
                  ? ' template-section__advanced-toggle--active'
                  : ''
              }`}
              aria-label={advancedFiltersOpen ? '收起更多筛选' : '展开更多筛选'}
              aria-expanded={advancedFiltersOpen}
              aria-controls="template-advanced-filters"
              onClick={() => setAdvancedFiltersOpen((open) => !open)}
            >
              <ChevronDownIcon className="template-section__advanced-icon" />
              {advancedFiltersActive && !advancedFiltersOpen ? (
                <span className="template-section__advanced-dot" aria-hidden="true" />
              ) : null}
            </button>
          </div>
        </div>

        <label className="template-section__search">
          <SearchIcon className="template-section__search-icon" />
          <input
            type="search"
            aria-label="搜索模板"
            value={query}
            placeholder="搜索模板"
            onChange={(event) => updateQuery(event.target.value)}
          />
        </label>

        {advancedFiltersOpen ? (
          <div
            id="template-advanced-filters"
            className="template-section__advanced-panel"
          >
            <span className="template-section__advanced-label">类型</span>
            <FilterGroup
              ariaLabel="模板类型"
              options={typeFilterOptions}
              value={type}
              onChange={(value) => updateFilter(setType, value)}
            />
          </div>
        ) : null}
      </div>

      <div className="template-section__results">
        {templatePage.items.length > 0 ? (
          <div className="template-section__grid">
            {templatePage.items.map((template) => (
              <button
                key={template.id}
                type="button"
                className={`template-card template-card--${template.tone}`}
                onClick={() => onTemplateSelect(template)}
              >
                <span className="template-card__header">
                  <span className="template-card__icon">
                    <CardIcon
                      icon={template.icon}
                      className="template-card__icon-svg"
                    />
                  </span>
                  <span className="template-card__title">{template.title}</span>
                </span>
                <span className="template-card__summary">
                  {template.summary}
                </span>
                <span className="template-card__detail">
                  <span className="template-card__label">输入</span>
                  <span>{template.input}</span>
                </span>
                <span className="template-card__detail">
                  <span className="template-card__label">输出</span>
                  <span>{template.output}</span>
                </span>
                <span className="template-card__tag-row">
                  {template.displayTags.map((tag) => (
                    <span
                      key={tag}
                      className={`template-card__tag template-card__tag--${getTagTone(tag)}`}
                    >
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
      </div>

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
      className="template-section__filter-group"
      role="group"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const isSelected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            className={`template-section__filter${
              isSelected ? ' template-section__filter--selected' : ''
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

function getTagTone(tag: string): TagTone {
  return (
    tagToneKeywords.find(({ keywords }) =>
      keywords.some((keyword) => tag.includes(keyword)),
    )?.tone ?? 'teal'
  )
}

export default TemplateSection
