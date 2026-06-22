import type { HomeInsightWidget } from '../data/homeRecommendations'

const projectPhases = ['设计', '实验', '数据', '审批', '交付']

type RecommendationInsightWidgetProps = {
  widget: HomeInsightWidget
  highlighted: boolean
  onPromptFill: (widget: HomeInsightWidget) => void
  onTargetFocus: (targetId: string) => void
}

function RecommendationInsightWidget({
  widget,
  highlighted,
  onPromptFill,
  onTargetFocus,
}: RecommendationInsightWidgetProps) {
  return (
    <article
      className={`recommendation-insight-widget recommendation-insight-widget--${widget.kind} recommendation-insight-widget--${widget.accent}${
        highlighted ? ' recommendation-highlight' : ''
      }`}
      data-recommendation-target={widget.targetId}
    >
      <div className="recommendation-insight-widget__header">
        <span className="recommendation-insight-widget__title">{widget.title}</span>
        <button
          type="button"
          className="recommendation-insight-widget__action"
          onClick={() => onPromptFill(widget)}
        >
          {widget.primaryActionLabel}
        </button>
      </div>
      <p className="recommendation-insight-widget__summary">{widget.summary}</p>
      <div className="recommendation-insight-widget__body">
        {widget.kind === 'project-flow'
          ? renderProjectFlow(widget, onTargetFocus)
          : widget.kind === 'timeline'
            ? renderTimeline(widget, onTargetFocus)
            : widget.kind === 'asset-health'
              ? renderAssetHealth(widget, onTargetFocus)
              : renderPriority(widget, onTargetFocus)}
      </div>
    </article>
  )
}

function renderPriority(
  widget: HomeInsightWidget,
  onTargetFocus: (targetId: string) => void,
) {
  return (
    <div className="recommendation-insight-widget__entries">
      {widget.entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className={`recommendation-insight-widget__entry recommendation-insight-widget__entry--${entry.tone}`}
          onClick={() => onTargetFocus(entry.targetId)}
        >
          <span className="recommendation-insight-widget__entry-title">
            {entry.label}
          </span>
          <span className="recommendation-insight-widget__entry-status">
            {entry.status}
          </span>
        </button>
      ))}
    </div>
  )
}

function renderProjectFlow(
  widget: HomeInsightWidget,
  onTargetFocus: (targetId: string) => void,
) {
  return (
    <div className="recommendation-insight-widget__flow-list">
      {widget.entries.map((entry, entryIndex) => (
        <button
          key={entry.id}
          type="button"
          className="recommendation-insight-widget__flow-row"
          onClick={() => onTargetFocus(entry.targetId)}
        >
          <span className="recommendation-insight-widget__flow-label">
            {entry.label}
          </span>
          <span className="recommendation-insight-widget__phase-track">
            {projectPhases.map((phase, phaseIndex) => {
              const activeIndex = Math.min(entryIndex + 1, projectPhases.length - 1)

              return (
                <span
                  key={phase}
                  className={`recommendation-insight-widget__phase${
                    phaseIndex <= activeIndex
                      ? ' recommendation-insight-widget__phase--active'
                      : ''
                  }`}
                >
                  {phase}
                </span>
              )
            })}
          </span>
          <span className="recommendation-insight-widget__entry-status">
            {entry.status}
          </span>
        </button>
      ))}
    </div>
  )
}

function renderTimeline(
  widget: HomeInsightWidget,
  onTargetFocus: (targetId: string) => void,
) {
  return (
    <div className="recommendation-insight-widget__timeline">
      {widget.entries.map((entry) => (
        <button
          key={entry.id}
          type="button"
          className="recommendation-insight-widget__timeline-row"
          onClick={() => onTargetFocus(entry.targetId)}
        >
          <span className="recommendation-insight-widget__time">{entry.label}</span>
          <span className="recommendation-insight-widget__timeline-detail">
            {entry.status}
          </span>
        </button>
      ))}
    </div>
  )
}

function renderAssetHealth(
  widget: HomeInsightWidget,
  onTargetFocus: (targetId: string) => void,
) {
  return (
    <div className="recommendation-insight-widget__asset-health">
      <span className="recommendation-insight-widget__asset-score">78%</span>
      <div className="recommendation-insight-widget__checks">
        {widget.entries.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="recommendation-insight-widget__check"
            onClick={() => onTargetFocus(entry.targetId)}
          >
            <span>{entry.label}</span>
            <span>{entry.status}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RecommendationInsightWidget
