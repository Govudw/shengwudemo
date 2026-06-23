import type { HomeInsightWidget } from '../data/homeRecommendations'
import RecommendationInsightWidget from './RecommendationInsightWidget'

type RecommendationInsightRailProps = {
  widgets: HomeInsightWidget[]
  highlightedTargetId: string | null
  onPromptFill: (widget: HomeInsightWidget) => void
  onTargetFocus: (targetId: string) => void
}

function RecommendationInsightRail({
  widgets,
  highlightedTargetId,
  onPromptFill,
  onTargetFocus,
}: RecommendationInsightRailProps) {
  return (
    <div className="recommendation-insight-grid" aria-label="今日关注小组件">
      {widgets.map((widget) => (
        <RecommendationInsightWidget
          key={widget.id}
          widget={widget}
          highlighted={highlightedTargetId === widget.targetId}
          onPromptFill={onPromptFill}
          onTargetFocus={onTargetFocus}
        />
      ))}
    </div>
  )
}

export default RecommendationInsightRail
