import type { HomeRecommendationAssetDetail } from '../data/homeRecommendations'

type RecommendationAssetDetailPageProps = {
  asset: HomeRecommendationAssetDetail
  onBack: () => void
}

function RecommendationAssetDetailPage({
  asset,
  onBack,
}: RecommendationAssetDetailPageProps) {
  return (
    <main className="recommendation-detail-page" aria-label={`${asset.name} 详情`}>
      <section className="recommendation-detail-hero">
        <button
          type="button"
          className="recommendation-detail-back"
          onClick={onBack}
        >
          返回资产
        </button>
        <div className="recommendation-detail-hero__copy">
          <p>{asset.sectionLabel} · {asset.kindLabel}</p>
          <h1>{asset.name}</h1>
          <span>{asset.description}</span>
        </div>
      </section>
      <section className="recommendation-detail-grid">
        <article className="recommendation-detail-panel">
          <h2>关键字段</h2>
          <dl className="recommendation-detail-list">
            {asset.metadata.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article className="recommendation-detail-panel">
          <h2>推荐标签</h2>
          <div className="recommendation-detail-chip-row">
            {asset.chips.map((chip) => (
              <span key={chip}>{chip}</span>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}

export default RecommendationAssetDetailPage
