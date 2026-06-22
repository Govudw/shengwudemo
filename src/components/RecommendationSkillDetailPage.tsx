import type { HomeRecommendationSkillDetail } from '../data/homeRecommendations'

type RecommendationSkillDetailPageProps = {
  skill: HomeRecommendationSkillDetail
  onBack: () => void
}

function RecommendationSkillDetailPage({
  skill,
  onBack,
}: RecommendationSkillDetailPageProps) {
  return (
    <main className="recommendation-detail-page" aria-label={`${skill.name} 详情`}>
      <section className="recommendation-detail-hero recommendation-detail-hero--skill">
        <button
          type="button"
          className="recommendation-detail-back"
          onClick={onBack}
        >
          返回能力
        </button>
        <div className="recommendation-detail-hero__copy">
          <p>Skill · {skill.version} · {skill.owner}</p>
          <h1>{skill.name}</h1>
          <span>{skill.description}</span>
        </div>
      </section>
      <section className="recommendation-detail-grid">
        <article className="recommendation-detail-panel">
          <h2>输入输出</h2>
          <dl className="recommendation-detail-list">
            <div>
              <dt>输入</dt>
              <dd>{skill.inputs.join(' / ')}</dd>
            </div>
            <div>
              <dt>输出</dt>
              <dd>{skill.outputs.join(' / ')}</dd>
            </div>
          </dl>
        </article>
        <article className="recommendation-detail-panel">
          <h2>近期使用</h2>
          <ul className="recommendation-detail-activity">
            {skill.recentActivity.map((activity) => (
              <li key={activity}>{activity}</li>
            ))}
          </ul>
        </article>
        <article className="recommendation-detail-panel">
          <h2>标签</h2>
          <div className="recommendation-detail-chip-row">
            {skill.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </article>
        <article className="recommendation-detail-panel">
          <h2>指标</h2>
          <dl className="recommendation-detail-list">
            {skill.metrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </section>
    </main>
  )
}

export default RecommendationSkillDetailPage
