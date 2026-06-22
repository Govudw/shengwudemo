import type { HomeSignalItem } from '../data/homeRecommendations'

type HomeSignalStripProps = {
  signals: HomeSignalItem[]
  onSignalSelect: (targetId: string) => void
}

function HomeSignalStrip({ signals, onSignalSelect }: HomeSignalStripProps) {
  return (
    <div className="home-signal-strip" aria-label="今日信号">
      {signals.map((signal) => (
        <button
          key={signal.id}
          type="button"
          className={`home-signal-strip__button home-signal-strip__button--${signal.tone}`}
          aria-label={`${signal.label} ${signal.value}`}
          title={signal.targetLabel}
          onClick={() => onSignalSelect(signal.targetId)}
        >
          <span className="home-signal-strip__label">{signal.label}</span>
          <span className="home-signal-strip__value">{signal.value}</span>
        </button>
      ))}
    </div>
  )
}

export default HomeSignalStrip
