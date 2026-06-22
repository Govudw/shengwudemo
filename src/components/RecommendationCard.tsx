import type { HomeRecommendationItem } from '../data/homeRecommendations'

type RecommendationCardProps = {
  item: HomeRecommendationItem
  variant: 'attention' | 'compact' | 'suggestion' | 'starter'
  highlighted?: boolean
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
  highlighted = false,
  onPromptFill,
}: RecommendationCardProps) {
  function fillPrompt() {
    onPromptFill(item)
  }

  return (
    <button
      type="button"
      aria-label={`${item.primaryActionLabel}：${item.title}`}
      className={`recommendation-card recommendation-card--${variant} recommendation-card--${item.accent}${
        highlighted ? ' recommendation-highlight' : ''
      }`}
      data-section={item.section}
      data-recommendation-target={item.id}
      onClick={fillPrompt}
    >
      <span className="recommendation-card__meta">
        <span className="recommendation-card__badge">{typeLabels[item.type]}</span>
        {variant === 'attention' ? (
          <span className="recommendation-card__priority">
            优先级 {priorityLabels[item.recommendationPriority]}
          </span>
        ) : null}
      </span>
      <span className="recommendation-card__title">{item.title}</span>
      <span className="recommendation-card__summary">{item.summary}</span>
      <span className="recommendation-card__action">
        {item.primaryActionLabel}
      </span>
    </button>
  )
}

export default RecommendationCard
