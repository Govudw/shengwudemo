import type { HomeRecommendationFeedCard } from '../data/homeRecommendations'

type RecommendationFeedCardProps = {
  card: HomeRecommendationFeedCard
  onSelect: (card: HomeRecommendationFeedCard) => void
}

function RecommendationFeedCard({ card, onSelect }: RecommendationFeedCardProps) {
  return (
    <button
      type="button"
      className={`recommendation-feed-card recommendation-feed-card--${card.kind} recommendation-feed-card--${card.posterVariant}`}
      aria-label={`${card.actionLabel}：${card.title}`}
      data-recommendation-target={card.id}
      data-recommendation-kind={card.kind}
      onClick={() => onSelect(card)}
    >
      <span className="recommendation-feed-card__poster" aria-hidden="true">
        <span className="recommendation-feed-card__kicker">{card.posterKicker}</span>
        <span className="recommendation-feed-card__tag">{card.tagLabel}</span>
        <span className="recommendation-feed-card__poster-title">
          {card.posterTitle}
        </span>
        <span className="recommendation-feed-card__poster-lines">
          {card.posterLines.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      </span>
      <span className="recommendation-feed-card__body">
        <span className="recommendation-feed-card__title">{card.title}</span>
        <span className="recommendation-feed-card__subtitle">{card.subtitle}</span>
        <span className="recommendation-feed-card__sections">
          {card.bodySections.map((section) => (
            <span key={`${section.label}-${section.value}`} className="recommendation-feed-card__section">
              <span>{section.label}</span>
              <span>{section.value}</span>
            </span>
          ))}
        </span>
        <span className="recommendation-feed-card__chips">
          {card.chips.slice(0, 4).map((chip) => (
            <span key={chip}>{chip}</span>
          ))}
        </span>
      </span>
    </button>
  )
}

export default RecommendationFeedCard
