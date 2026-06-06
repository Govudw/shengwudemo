import type { CapabilityChip, UseCaseCard } from '../data/mockData'
import { CardIcon } from './icons'

type UseCaseGridProps = {
  chips: CapabilityChip[]
  useCases: UseCaseCard[]
  onCapabilitySelect: (chip: CapabilityChip) => void
  onPromptSelect: (prompt: string) => void
  onNotify: (message: string) => void
}

function UseCaseGrid({
  chips,
  useCases,
  onCapabilitySelect,
  onPromptSelect,
  onNotify,
}: UseCaseGridProps) {
  return (
    <section className="use-case-section" aria-label="Use cases">
      <div className="use-case-grid__chips capability-row" aria-label="Capabilities">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="use-case-grid__chip"
            onClick={() => {
              if (chip.prompt) {
                onCapabilitySelect(chip)
              } else {
                onNotify('模型与资产尚未接入当前工作区')
              }
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="use-case-grid use-case-grid__cards">
        {useCases.map((card) => (
          <button
            key={card.id}
            type="button"
            className={`use-case-grid__card use-case-card use-case-grid__card--${card.tone}`}
            onClick={() => onPromptSelect(card.prompt)}
          >
            <span className="use-case-grid__card-header">
              <span className="use-case-grid__card-icon">
                <CardIcon icon={card.icon} className="use-case-grid__icon" />
              </span>
              <span className="use-case-grid__card-title">{card.title}</span>
            </span>
            <span className="use-case-grid__card-summary">{card.summary}</span>
            <span className="use-case-grid__card-detail">
              <span className="use-case-grid__card-label">输入</span>
              <span>{card.input}</span>
            </span>
            <span className="use-case-grid__card-detail">
              <span className="use-case-grid__card-label">输出</span>
              <span>{card.output}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export default UseCaseGrid
