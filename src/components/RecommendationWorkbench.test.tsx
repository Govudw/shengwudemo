// @vitest-environment happy-dom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getHomeRecommendationFeedCards,
  homeRecommendationInsights,
  type HomeInsightWidget,
  type HomeRecommendationFeedCard,
} from '../data/homeRecommendations'
import RecommendationWorkbench from './RecommendationWorkbench'

beforeEach(() => {
  ;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
    .IS_REACT_ACT_ENVIRONMENT = true
})

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('RecommendationWorkbench', () => {
  it('renders today focus followed by the unified waterfall feed', () => {
    const { container, root } = renderWorkbench()

    expect(container.textContent).not.toContain('工作建议')
    expect(container.textContent).not.toContain('今日工作台')
    expect(container.textContent).toContain('今日关注')
    expect(container.textContent).not.toContain('今日需要关注')
    expect(container.textContent).not.toContain('为你推荐')
    expect(container.textContent).toContain('今日优先级')
    expect(container.textContent).toContain('项目流转')
    expect(container.textContent).toContain('回传时间线')
    expect(container.textContent).toContain('资产健康度')
    expect(container.textContent).not.toContain('继续推进')
    expect(container.textContent).not.toContain('智能建议')
    expect(container.textContent).not.toContain('开始新工作')
    expect(
      container.querySelector('.recommendation-insight-rail'),
    ).not.toBeNull()
    expect(container.querySelectorAll('.recommendation-insight-widget')).toHaveLength(4)
    expect(container.querySelectorAll('.recommendation-feed-card')).toHaveLength(24)
    expect(container.textContent).toContain('靶点竞品研究')
    expect(container.textContent).toContain('模型调优闭环')
    const columns = container.querySelectorAll('.recommendation-workbench__masonry-column')
    expect(columns).toHaveLength(3)
    expect(columns[0].textContent).toContain('靶点竞品研究')
    expect(columns[1].textContent).toContain('抗体研发设计')
    expect(columns[2].textContent).toContain('流程编排')

    root.unmount()
  })

  it('renders visual insight widgets as compact familiar-user summaries', () => {
    const { container, root } = renderWorkbench()
    const priorityWidget = getInsightWidget(container, '今日优先级')

    expect(priorityWidget.textContent).toContain('HER2 BLI 复核')
    expect(priorityWidget.textContent).toContain('EGFR 审批检查')
    expect(priorityWidget.textContent).toContain('生成今日行动清单')
    expect(priorityWidget.textContent).not.toContain('下一轮候选排序前需要确认')

    root.unmount()
  })

  it('shows the latest daily recommendation update time without pointing to the future', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 5, 21, 8, 15, 12))
    const morningRender = renderWorkbench()

    expect(morningRender.container.textContent).toContain(
      '更新于 2026-06-21 07:00:00',
    )

    morningRender.root.unmount()
    document.body.replaceChildren()

    vi.setSystemTime(new Date(2026, 5, 21, 6, 30, 0))
    const earlyRender = renderWorkbench()

    expect(earlyRender.container.textContent).toContain(
      '更新于 2026-06-20 07:00:00',
    )

    earlyRender.root.unmount()
  })

  it('uses widget actions for prompt fill and widget rows for target focus', () => {
    const onPromptFill = vi.fn()
    const onTargetFocus = vi.fn()
    const { container, root } = renderWorkbench({ onPromptFill, onTargetFocus })
    const firstWidget = homeRecommendationInsights[0]
    const firstEntry = firstWidget.entries[0]

    act(() => {
      getButtonContaining(container, firstWidget.primaryActionLabel).click()
    })

    expect(onPromptFill).toHaveBeenCalledWith(firstWidget)

    act(() => {
      getButtonContaining(container, firstEntry.label).click()
    })

    expect(onTargetFocus).toHaveBeenCalledWith(firstEntry.targetId)

    root.unmount()
  })

  it('selects feed cards through a dedicated feed callback', () => {
    const onFeedCardSelect = vi.fn()
    const feedCards = getHomeRecommendationFeedCards(24)
    const { container, root } = renderWorkbench({ feedCards, onFeedCardSelect })
    const firstItem = feedCards[0]
    const card = getCard(container, firstItem.title)

    act(() => {
      card.click()
    })

    expect(onFeedCardSelect).toHaveBeenCalledWith(firstItem)
    expect(card.getAttribute('aria-label')).toBe(`${firstItem.actionLabel}：${firstItem.title}`)

    root.unmount()
  })

  it('loads the next waterfall batch from the low-presence bottom row', async () => {
    vi.useFakeTimers()
    const { container, root } = renderWorkbench({
      feedCards: getHomeRecommendationFeedCards(48),
    })

    expect(container.querySelectorAll('.recommendation-feed-card')).toHaveLength(24)

    await act(async () => {
      getButtonContaining(container, '加载更多推荐').click()
      vi.advanceTimersByTime(360)
    })

    expect(container.querySelectorAll('.recommendation-feed-card')).toHaveLength(48)

    root.unmount()
  })
})

function renderWorkbench({
  onPromptFill = vi.fn(),
  onTargetFocus = vi.fn(),
  onFeedCardSelect = vi.fn(),
  feedCards = getHomeRecommendationFeedCards(24),
}: {
  onPromptFill?: (item: HomeInsightWidget) => void
  onTargetFocus?: (targetId: string) => void
  onFeedCardSelect?: (item: HomeRecommendationFeedCard) => void
  feedCards?: HomeRecommendationFeedCard[]
} = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  const root = createRoot(host)

  act(() => {
    root.render(
      <RecommendationWorkbench
        insights={homeRecommendationInsights}
        feedCards={feedCards}
        onPromptFill={onPromptFill}
        onTargetFocus={onTargetFocus}
        onFeedCardSelect={onFeedCardSelect}
      />,
    )
  })

  return { container: host, root }
}

function getInsightWidget(container: ParentNode, title: string) {
  const widget = Array.from(
    container.querySelectorAll<HTMLElement>('.recommendation-insight-widget'),
  ).find((element) => element.textContent?.includes(title))

  if (!widget) {
    throw new Error(`Unable to find insight widget for ${title}`)
  }

  return widget
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
