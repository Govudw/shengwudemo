import { useEffect, useRef } from 'react'
import {
  directionFilterOptions,
  scopeFilterOptions,
  typeFilterOptions,
} from '../data/homeTemplates'
import type {
  DirectionFilterValue,
  ScopeFilterValue,
  TemplateFilterOption,
  TypeFilterValue,
} from '../data/homeTemplates'
import type { HomeMode } from '../store/demoStoreLogic'
import { ChevronDownIcon, SearchIcon } from './icons'

type HomeControlBarProps = {
  homeMode: HomeMode
  scope: ScopeFilterValue
  direction: DirectionFilterValue
  type: TypeFilterValue
  query: string
  advancedFiltersOpen: boolean
  onHomeModeChange: (mode: HomeMode) => void
  onScopeChange: (scope: ScopeFilterValue) => void
  onDirectionChange: (direction: DirectionFilterValue) => void
  onTypeChange: (type: TypeFilterValue) => void
  onQueryChange: (query: string) => void
  onAdvancedFiltersOpenChange: (open: boolean) => void
  onResetFilters: () => void
}

function HomeControlBar({
  homeMode,
  scope,
  direction,
  type,
  query,
  advancedFiltersOpen,
  onHomeModeChange,
  onScopeChange,
  onDirectionChange,
  onTypeChange,
  onQueryChange,
  onAdvancedFiltersOpenChange,
  onResetFilters,
}: HomeControlBarProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const advancedFilterCount = type === '全部类型' ? 0 : 1
  const moreFilterLabel =
    advancedFilterCount > 0 ? `更多筛选 ${advancedFilterCount}` : '更多筛选'

  useEffect(() => {
    if (!advancedFiltersOpen) {
      return undefined
    }

    function handlePointerDown(event: MouseEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        popoverRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return
      }

      onAdvancedFiltersOpenChange(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onAdvancedFiltersOpenChange(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [advancedFiltersOpen, onAdvancedFiltersOpenChange])

  return (
    <section className="home-control-bar" aria-label="首页控制栏">
      <div className="home-mode-switch">
        <div
          className="home-mode-switch__control"
          role="group"
          aria-label="首页模式"
        >
          <button
            type="button"
            className={`home-mode-switch__button${
              homeMode === 'recommendations'
                ? ' home-mode-switch__button--active'
                : ''
            }`}
            aria-pressed={homeMode === 'recommendations'}
            onClick={() => onHomeModeChange('recommendations')}
          >
            推荐
          </button>
          <button
            type="button"
            className={`home-mode-switch__button${
              homeMode === 'templates' ? ' home-mode-switch__button--active' : ''
            }`}
            aria-pressed={homeMode === 'templates'}
            onClick={() => onHomeModeChange('templates')}
          >
            模板
          </button>
        </div>
      </div>

      {homeMode === 'templates' ? (
        <div className="home-template-controls">
          <div className="home-template-controls__filter-strip">
            <FilterGroup
              ariaLabel="模板类别"
              options={scopeFilterOptions}
              value={scope}
              onChange={onScopeChange}
            />
            <FilterGroup
              ariaLabel="模板方向"
              options={directionFilterOptions}
              value={direction}
              onChange={onDirectionChange}
            />
          </div>
          <div className="home-template-controls__advanced">
            <button
              ref={triggerRef}
              type="button"
              className={`home-template-controls__advanced-toggle${
                advancedFilterCount > 0
                  ? ' home-template-controls__advanced-toggle--active'
                  : ''
              }`}
              aria-label={advancedFiltersOpen ? '收起更多筛选' : '展开更多筛选'}
              aria-expanded={advancedFiltersOpen}
              aria-controls="home-template-advanced-filters"
              onClick={() => onAdvancedFiltersOpenChange(!advancedFiltersOpen)}
            >
              <span>{moreFilterLabel}</span>
              <ChevronDownIcon className="home-template-controls__advanced-icon" />
            </button>
            {advancedFiltersOpen ? (
              <div
                ref={popoverRef}
                id="home-template-advanced-filters"
                className="home-template-controls__popover"
              >
                <span className="home-template-controls__popover-label">
                  类型
                </span>
                <FilterGroup
                  ariaLabel="模板类型"
                  options={typeFilterOptions}
                  value={type}
                  onChange={onTypeChange}
                />
                <button
                  type="button"
                  className="home-template-controls__reset"
                  onClick={onResetFilters}
                >
                  重置筛选
                </button>
              </div>
            ) : null}
          </div>

          <label className="home-template-controls__search">
            <SearchIcon className="home-template-controls__search-icon" />
            <input
              type="search"
              aria-label="搜索模板"
              value={query}
              placeholder="搜索模板"
              onChange={(event) => onQueryChange(event.target.value)}
            />
          </label>
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

export default HomeControlBar
