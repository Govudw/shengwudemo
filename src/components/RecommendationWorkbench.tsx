import { useCallback, useEffect, useRef, useState } from 'react'
import type {
  HomeInsightWidget,
  HomeRecommendationFeedCard,
  HomeSignalFilterKind,
} from '../data/homeRecommendations'
import {
  HOME_RECOMMENDATION_FEED_BATCH_COUNT,
  HOME_RECOMMENDATION_FEED_INITIAL_COUNT,
  HOME_RECOMMENDATION_FEED_MAX_COUNT,
} from '../data/homeRecommendations'
import RecommendationFeedCard from './RecommendationFeedCard'
import RecommendationInsightRail from './RecommendationInsightRail'

const signalFilterHeadingLabels: Record<HomeSignalFilterKind, string> = {
  risk: '风险相关推荐',
  review: '待复核相关推荐',
  approval: '审批相关推荐',
  asset: '资产相关推荐',
}

type RecommendationWorkbenchProps = {
  insights: HomeInsightWidget[]
  feedCards: HomeRecommendationFeedCard[]
  highlightedTargetId?: string | null
  selectedSignalKind?: HomeSignalFilterKind | null
  onPromptFill: (item: HomeInsightWidget) => void
  onTargetFocus: (targetId: string) => void
  onFeedCardSelect: (item: HomeRecommendationFeedCard) => void
}

function RecommendationWorkbench({
  insights,
  feedCards,
  highlightedTargetId = null,
  selectedSignalKind = null,
  onPromptFill,
  onTargetFocus,
  onFeedCardSelect,
}: RecommendationWorkbenchProps) {
  const filteredCards = selectedSignalKind
    ? feedCards.filter((card) => card.filterKinds.includes(selectedSignalKind))
    : feedCards
  const [visibleCount, setVisibleCount] = useState(
    Math.min(HOME_RECOMMENDATION_FEED_INITIAL_COUNT, filteredCards.length),
  )
  const [loadingMore, setLoadingMore] = useState(false)
  const loadMoreTimeoutRef = useRef<number | null>(null)
  const lastAutoLoadScrollTopRef = useRef(0)
  const dailyUpdateTime = getLatestDailyUpdateTime()
  const boundedVisibleCount = Math.min(visibleCount, filteredCards.length)
  const visibleCards = filteredCards.slice(0, boundedVisibleCount)
  const masonryColumns = getMasonryColumns(visibleCards)
  const hasMore =
    boundedVisibleCount < filteredCards.length &&
    boundedVisibleCount < HOME_RECOMMENDATION_FEED_MAX_COUNT

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current !== null) {
        window.clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [])

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || loadMoreTimeoutRef.current !== null) {
      return
    }

    setLoadingMore(true)
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((currentCount) =>
        Math.min(
          currentCount + HOME_RECOMMENDATION_FEED_BATCH_COUNT,
          filteredCards.length,
          HOME_RECOMMENDATION_FEED_MAX_COUNT,
        ),
      )
      setLoadingMore(false)
      loadMoreTimeoutRef.current = null
    }, 360)
  }, [filteredCards.length, hasMore, loadingMore])

  useEffect(() => {
    function handleScroll(event: Event) {
      if (!hasMore || loadingMore || loadMoreTimeoutRef.current !== null) {
        return
      }

      const target =
        event.target instanceof HTMLElement
          ? event.target
          : document.scrollingElement

      if (!target || !target.classList.contains('workspace-main')) {
        return
      }

      const distanceToBottom =
        target.scrollHeight - target.scrollTop - target.clientHeight

      if (
        distanceToBottom < 420 &&
        target.scrollTop > lastAutoLoadScrollTopRef.current + 120
      ) {
        lastAutoLoadScrollTopRef.current = target.scrollTop
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll, true)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [hasMore, loadMore, loadingMore])
  const filterHeading = selectedSignalKind
    ? signalFilterHeadingLabels[selectedSignalKind]
    : null

  return (
    <section className="recommendation-workbench" aria-label="推荐工作建议">
      <section className="recommendation-workbench__section">
        <div className="recommendation-workbench__section-heading recommendation-workbench__section-heading--meta">
          <h3>今日关注</h3>
          <time
            className="recommendation-workbench__updated-at"
            dateTime={dailyUpdateTime.replace(' ', 'T')}
          >
            更新于 {dailyUpdateTime}
          </time>
        </div>
        <RecommendationInsightRail
          widgets={insights}
          highlightedTargetId={highlightedTargetId}
          onPromptFill={onPromptFill}
          onTargetFocus={onTargetFocus}
        />
      </section>

      <section className="recommendation-workbench__feed" aria-label="推荐瀑布流">
        {filterHeading ? (
          <div className="recommendation-workbench__feed-heading">
            {filterHeading}
          </div>
        ) : null}
        <div className="recommendation-workbench__masonry">
          {masonryColumns.map((column, columnIndex) => (
            <div
              key={`recommendation-column-${columnIndex}`}
              className="recommendation-workbench__masonry-column"
            >
              {column.map((card) => (
                <RecommendationFeedCard
                  key={card.id}
                  card={card}
                  onSelect={onFeedCardSelect}
                />
              ))}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="recommendation-workbench__load-more"
          disabled={!hasMore || loadingMore}
          onClick={loadMore}
        >
          {hasMore
            ? loadingMore
              ? '正在刷新推荐...'
              : '加载更多推荐'
            : '到底了'}
        </button>
      </section>
    </section>
  )
}

function getMasonryColumns(cards: HomeRecommendationFeedCard[]) {
  return cards.reduce<HomeRecommendationFeedCard[][]>(
    (columns, card, index) => {
      columns[index % columns.length].push(card)
      return columns
    },
    [[], [], []],
  )
}

function getLatestDailyUpdateTime(now = new Date()) {
  const updateTime = new Date(now)

  if (updateTime.getHours() < 7) {
    updateTime.setDate(updateTime.getDate() - 1)
  }

  updateTime.setHours(7, 0, 0, 0)

  return [
    updateTime.getFullYear(),
    padDatePart(updateTime.getMonth() + 1),
    padDatePart(updateTime.getDate()),
  ].join('-') + ' 07:00:00'
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0')
}

export default RecommendationWorkbench
