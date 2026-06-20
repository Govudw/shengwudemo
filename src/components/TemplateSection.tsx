import { useMemo, useRef, type WheelEvent } from 'react'
import {
  getFilteredTemplates,
  getTemplatePage,
} from '../data/homeTemplates'
import type {
  HomeTemplate,
  HomeTemplateFilters,
} from '../data/homeTemplates'
import { CardIcon } from './icons'

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
  filters: HomeTemplateFilters
  query: string
  page: number
  onPageChange: (page: number) => void
  onTemplateSelect: (template: HomeTemplate) => void
}

function TemplateSection({
  templates,
  filters,
  query,
  page,
  onPageChange,
  onTemplateSelect,
}: TemplateSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const filteredTemplates = useMemo(
    () => getFilteredTemplates(templates, filters, query),
    [filters, query, templates],
  )
  const templatePage = getTemplatePage(filteredTemplates, page, templatesPerPage)
  const showPagination = templatePage.totalItems > templatesPerPage

  function handleResultsWheel(event: WheelEvent<HTMLDivElement>) {
    if (event.deltaY <= 0) {
      return
    }

    const section = sectionRef.current
    const scrollContainer = section?.closest<HTMLElement>('.workspace-main')
    const controlBar =
      section?.parentElement?.querySelector<HTMLElement>('.home-control-bar')

    if (!section || !scrollContainer || !controlBar) {
      return
    }

    const remainingOuterScroll =
      scrollContainer.scrollHeight -
      scrollContainer.clientHeight -
      scrollContainer.scrollTop

    if (remainingOuterScroll <= 0) {
      return
    }

    const controlBarRect = controlBar.getBoundingClientRect()
    const scrollContainerRect = scrollContainer.getBoundingClientRect()
    const distanceToPinned =
      controlBarRect.top - scrollContainerRect.top - stickyControlBarOffset

    if (distanceToPinned <= 1) {
      return
    }

    const outerScrollStep = Math.min(
      remainingOuterScroll,
      distanceToPinned,
      event.deltaY,
      maxOuterWheelStep,
    )

    if (outerScrollStep <= 0) {
      return
    }

    event.preventDefault()
    scrollContainer.scrollBy({
      top: outerScrollStep,
      left: 0,
      behavior: 'auto',
    })
  }

  return (
    <section ref={sectionRef} className="template-section" aria-label="模板区">
      <div className="template-section__results" onWheel={handleResultsWheel}>
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
                onClick={() => onPageChange(pageNumber)}
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

const stickyControlBarOffset = 8
const maxOuterWheelStep = 96

function getTagTone(tag: string): TagTone {
  return (
    tagToneKeywords.find(({ keywords }) =>
      keywords.some((keyword) => tag.includes(keyword)),
    )?.tone ?? 'teal'
  )
}

export default TemplateSection
