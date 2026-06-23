import type {
  HomeSignalFilterKind,
  HomeSignalItem,
} from '../data/homeRecommendations'

type HomeSignalStripProps = {
  signals: HomeSignalItem[]
  selectedSignalKind: HomeSignalFilterKind | null
  onSignalSelect: (signal: HomeSignalItem) => void
}

function HomeSignalStrip({
  signals,
  selectedSignalKind,
  onSignalSelect,
}: HomeSignalStripProps) {
  return (
    <div className="home-signal-strip" aria-label="今日信号">
      {signals.map((signal) => {
        const selected = selectedSignalKind === signal.filterKind

        return (
          <button
            key={signal.id}
            type="button"
            className={`home-signal-strip__button home-signal-strip__button--${signal.tone}${
              selected ? ' home-signal-strip__button--active' : ''
            }`}
            aria-label={`${signal.label} ${signal.value}`}
            aria-pressed={selected}
            title={signal.targetLabel}
            onClick={() => onSignalSelect(signal)}
          >
            <span className="home-signal-strip__label">{signal.label}</span>
            <span className="home-signal-strip__value">{signal.value}</span>
          </button>
        )
      })}
    </div>
  )
}

export default HomeSignalStrip
