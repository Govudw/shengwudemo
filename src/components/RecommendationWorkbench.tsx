import type {
  HomeRecommendationItem,
  StarterRecommendationGroup,
} from '../data/homeRecommendations'
import RecommendationCard from './RecommendationCard'
import RecommendationStarterGrid from './RecommendationStarterGrid'

type RecommendationWorkbenchProps = {
  sections: {
    todayAttention: HomeRecommendationItem[]
    continueWork: HomeRecommendationItem[]
    smartSuggestions: HomeRecommendationItem[]
  }
  starterGroups: StarterRecommendationGroup[]
  onPromptFill: (item: HomeRecommendationItem) => void
  onViewAllTemplates: () => void
}

function RecommendationWorkbench({
  sections,
  starterGroups,
  onPromptFill,
  onViewAllTemplates,
}: RecommendationWorkbenchProps) {
  return (
    <section className="recommendation-workbench" aria-label="推荐工作建议">
      <section className="recommendation-workbench__section">
        <h3>今日需要关注</h3>
        <div className="recommendation-workbench__attention-grid">
          {sections.todayAttention.map((item) => (
            <RecommendationCard
              key={item.id}
              item={item}
              variant="attention"
              onPromptFill={onPromptFill}
            />
          ))}
        </div>
      </section>

      <div className="recommendation-workbench__work-grid">
        <section className="recommendation-workbench__section">
          <h3>继续推进</h3>
          <div className="recommendation-workbench__compact-list">
            {sections.continueWork.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                variant="compact"
                onPromptFill={onPromptFill}
              />
            ))}
          </div>
        </section>

        <section className="recommendation-workbench__section">
          <h3>智能建议</h3>
          <div className="recommendation-workbench__suggestion-list">
            {sections.smartSuggestions.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                variant="suggestion"
                onPromptFill={onPromptFill}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="recommendation-workbench__section recommendation-workbench__starter-section">
        <div className="recommendation-workbench__section-heading">
          <h3>开始新工作</h3>
          <button
            type="button"
            className="recommendation-workbench__template-shortcut"
            onClick={onViewAllTemplates}
          >
            查看模板
          </button>
        </div>
        <RecommendationStarterGrid
          groups={starterGroups}
          onPromptFill={onPromptFill}
        />
      </section>
    </section>
  )
}

export default RecommendationWorkbench
