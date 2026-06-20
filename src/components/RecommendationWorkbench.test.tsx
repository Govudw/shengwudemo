// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  homeRecommendationSections,
  starterRecommendationGroups,
  type HomeRecommendationItem,
} from '../data/homeRecommendations'
import RecommendationWorkbench from './RecommendationWorkbench'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('RecommendationWorkbench', () => {
  it('renders the required workbench sections and counts', () => {
    const { container, root } = renderWorkbench()

    expect(container.textContent).not.toContain('工作建议')
    expect(container.textContent).not.toContain('今日工作台')
    expect(container.textContent).toContain('今日需要关注')
    expect(container.textContent).toContain('继续推进')
    expect(container.textContent).toContain('智能建议')
    expect(container.textContent).toContain('开始新工作')
    expect(
      container.querySelectorAll('[data-section="today-attention"]'),
    ).toHaveLength(4)
    expect(container.querySelectorAll('[data-section="continue-work"]').length).toBe(
      homeRecommendationSections.continueWork.length,
    )
    expect(container.querySelectorAll('[data-section="smart-suggestions"]')).toHaveLength(
      2,
    )
    expect(container.querySelectorAll('[data-section="starter-work"]')).toHaveLength(
      12,
    )

    root.unmount()
  })

  it('fills prompts through one callback for card and primary action clicks', () => {
    const onPromptFill = vi.fn()
    const { container, root } = renderWorkbench({ onPromptFill })
    const firstItem = homeRecommendationSections.todayAttention[0]
    const card = getCard(container, firstItem.title)

    act(() => {
      card.click()
    })

    expect(onPromptFill).toHaveBeenCalledWith(firstItem)

    expect(card.getAttribute('aria-label')).toBe(firstItem.primaryActionLabel)
    const action = getActionText(card, firstItem.primaryActionLabel)
    act(() => {
      action.click()
    })

    expect(onPromptFill).toHaveBeenCalledTimes(2)
    expect(onPromptFill).toHaveBeenLastCalledWith(firstItem)

    root.unmount()
  })

  it('exposes the secondary template-library shortcut callback', () => {
    const onViewAllTemplates = vi.fn()
    const { container, root } = renderWorkbench({ onViewAllTemplates })

    act(() => {
      getButtonContaining(container, '查看模板').click()
    })

    expect(onViewAllTemplates).toHaveBeenCalledTimes(1)

    root.unmount()
  })
})

function renderWorkbench({
  onPromptFill = vi.fn(),
  onViewAllTemplates = vi.fn(),
}: {
  onPromptFill?: (item: HomeRecommendationItem) => void
  onViewAllTemplates?: () => void
} = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)

  act(() => {
    root.render(
      <RecommendationWorkbench
        sections={homeRecommendationSections}
        starterGroups={starterRecommendationGroups}
        onPromptFill={onPromptFill}
        onViewAllTemplates={onViewAllTemplates}
      />,
    )
  })

  return { container: host, root }
}

function getCard(container: ParentNode, title: string) {
  const card = Array.from(container.querySelectorAll('button')).find((button) =>
    button.textContent?.includes(title),
  ) ?? Array.from(
    container.querySelectorAll<HTMLElement>('.recommendation-card'),
  ).find((element) => element.textContent?.includes(title))

  if (!card) {
    throw new Error(`Unable to find card for ${title}`)
  }

  return card
}

function getButtonContaining(container: ParentNode, text: string) {
  const button = Array.from(container.querySelectorAll('button')).find((element) =>
    element.textContent?.includes(text),
  )

  if (!button) {
    throw new Error(`Unable to find button containing ${text}`)
  }

  return button
}

function getActionText(container: ParentNode, text: string) {
  const action = Array.from(
    container.querySelectorAll<HTMLElement>('.recommendation-card__action'),
  ).find((element) => element.textContent?.includes(text))

  if (!action) {
    throw new Error(`Unable to find action text containing ${text}`)
  }

  return action
}
