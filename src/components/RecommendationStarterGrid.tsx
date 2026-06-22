import type {
  HomeRecommendationItem,
  StarterRecommendationGroup,
} from '../data/homeRecommendations'
import RecommendationCard from './RecommendationCard'

type RecommendationStarterGridProps = {
  groups: StarterRecommendationGroup[]
  highlightedTargetId?: string | null
  onPromptFill: (item: HomeRecommendationItem) => void
}

function RecommendationStarterGrid({
  groups,
  highlightedTargetId = null,
  onPromptFill,
}: RecommendationStarterGridProps) {
  return (
    <div className="recommendation-workbench__starter-grid">
      {groups.map((group) => (
        <section
          key={group.id}
          className="recommendation-workbench__starter-group"
        >
          <h4>{group.title}</h4>
          <div className="recommendation-workbench__starter-list">
            {group.items.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                variant="starter"
                highlighted={highlightedTargetId === item.id}
                onPromptFill={onPromptFill}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default RecommendationStarterGrid
