import type { HomeRecommendationItem } from '../data/homeRecommendations'

type RecommendationCardProps = {
  item: HomeRecommendationItem
  variant: 'attention' | 'compact' | 'suggestion' | 'starter'
  onPromptFill: (item: HomeRecommendationItem) => void
}

const typeLabels: Record<HomeRecommendationItem['type'], string> = {
  thread: 'Thread',
  asset: 'Asset',
  'approval-request': 'Approval',
  'experiment-return': 'Experiment',
  'project-risk-signal': 'Risk',
  'agent-suggestion': 'Agent',
  'starter-work-item': 'Starter',
}

const priorityLabels: Record<HomeRecommendationItem['recommendationPriority'], string> =
  {
    high: '高',
    medium: '中',
    low: '低',
  }

function RecommendationCard({
  item,
  variant,
  onPromptFill,
}: RecommendationCardProps) {
  function fillPrompt() {
    onPromptFill(item)
  }

  return (
    <button
      type="button"
      aria-label={item.primaryActionLabel}
      className={`recommendation-card recommendation-card--${variant} recommendation-card--${item.accent}`}
      data-section={item.section}
      onClick={fillPrompt}
    >
      <span className="recommendation-card__meta">
        <span className="recommendation-card__badge">{typeLabels[item.type]}</span>
        {variant === 'attention' ? (
          <span className="recommendation-card__priority">
            优先级 {priorityLabels[item.recommendationPriority]}
          </span>
        ) : null}
        {item.sourceStatus ? (
          <span className="recommendation-card__status">{item.sourceStatus}</span>
        ) : null}
      </span>
      <span className="recommendation-card__title">{item.title}</span>
      {variant === 'starter' ? (
        <span className="recommendation-card__summary">{item.summary}</span>
      ) : (
        <>
          <span className="recommendation-card__reason">
            {variant === 'compact' ? item.summary : item.reason}
          </span>
          <span className="recommendation-card__source">{item.sourceLabel}</span>
        </>
      )}
      <span className="recommendation-card__action">
        {item.primaryActionLabel}
      </span>
    </button>
  )
}

export default RecommendationCard
