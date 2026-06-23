import { describe, expect, it } from 'vitest'
import {
  homeTemplates,
  type HomeTemplate,
} from './homeTemplates'
import {
  getHomeRecommendationFeedCards,
  getHomeRecommendationFeedHasMore,
  homeRecommendationFeedBaseCards,
  homeRecommendationInsights,
  homeRecommendationSections,
  homeRecommendationSignals,
  homeRecommendations,
  starterRecommendationGroups,
} from './homeRecommendations'

const forbiddenActionWords = ['查看', '打开', '进入', '处理审批', '完成任务']

describe('homeRecommendations', () => {
  it('provides the recommendation waterfall feed contract', () => {
    expect(homeRecommendationFeedBaseCards).toHaveLength(32)

    const firstBatch = getHomeRecommendationFeedCards(24)
    const fullBatch = getHomeRecommendationFeedCards(260)

    expect(firstBatch).toHaveLength(24)
    expect(fullBatch).toHaveLength(240)
    expect(getHomeRecommendationFeedHasMore(24)).toBe(true)
    expect(getHomeRecommendationFeedHasMore(240)).toBe(false)
    expect(new Set(fullBatch.map((item) => item.id)).size).toBe(240)
    expect(
      new Set(homeRecommendationFeedBaseCards.map((item) => item.kind)),
    ).toEqual(new Set(['continue-task', 'new-task', 'new-asset', 'new-skill']))
    expect(homeRecommendationFeedBaseCards.slice(0, 6).map((item) => item.title)).toEqual([
      'HER2 BLI 复核',
      'EGFR 审批材料包',
      '工业酶 CRO 交接',
      '靶点竞品研究',
      '抗体研发设计',
      '流程编排',
    ])

    fullBatch.forEach((item) => {
      expect(item.tagLabel).toMatch(/^(继续任务|新任务|新资产|新 Skill)$/)
      expect(item.reason).toMatch(/^来自/)
      expect(item.ctaLabel).toMatch(/^(继续 Thread|开始任务|查看资产|查看 Skill)$/)
      expect(item.posterTitle).toBeTruthy()
      expect(item.posterLines.length).toBeGreaterThanOrEqual(2)
      expect(item.bodySections.length).toBeGreaterThanOrEqual(2)
      expect(item.chips.length).toBeGreaterThanOrEqual(2)

      if (item.kind === 'new-task') {
        expect(item.prompt).toMatch(/^请/)
      }

      if (item.kind === 'new-asset') {
        expect(item.target.assetId).toBeTruthy()
      }

      if (item.kind === 'new-skill') {
        expect(item.target.skillId).toMatch(/^skill-/)
      }
    })
  })

  it('provides the light-usage workbench density required by the home spec', () => {
    expect(homeRecommendationSections.todayAttention).toHaveLength(4)
    expect(homeRecommendationSections.continueWork.length).toBeGreaterThanOrEqual(2)
    expect(homeRecommendationSections.continueWork.length).toBeLessThanOrEqual(3)
    expect(homeRecommendationSections.smartSuggestions).toHaveLength(2)
    expect(starterRecommendationGroups).toHaveLength(4)
    expect(starterRecommendationGroups.flatMap((group) => group.items)).toHaveLength(
      12,
    )
    starterRecommendationGroups.forEach((group) => {
      expect(group.items).toHaveLength(3)
    })
  })

  it('uses complete recommendation item records without navigation action labels', () => {
    expect(homeRecommendations.length).toBe(21)

    homeRecommendations.forEach((item) => {
      expect(item.id).toBeTruthy()
      expect(item.section).toBeTruthy()
      expect(item.type).toBeTruthy()
      expect(item.recommendationPriority).toBeTruthy()
      expect(item.recommendationStatus).toBeTruthy()
      expect(item.sourceStatus).toBeDefined()
      expect(item.title).toBeTruthy()
      expect(item.summary).toBeTruthy()
      expect(item.reason).toBeDefined()
      expect(item.sourceLabel).toBeDefined()
      expect(item.sourceSurface).toBeTruthy()
      expect(item.sourceObjectType).toBeTruthy()
      expect(item.relatedObject).toBeDefined()
      expect(item.primaryActionLabel).toBeTruthy()
      if (item.section === 'starter-work') {
        expect(item.prompt).toContain('请你作为Agent')
      } else {
        expect(item.prompt).toMatch(/^请帮我/)
      }
      expect(item.accent).toBeTruthy()
      expect(item).toHaveProperty('templateId')
      expect(
        forbiddenActionWords.some((word) => item.primaryActionLabel.includes(word)),
      ).toBe(false)
    })
  })

  it('keeps starter work items aligned with their source templates', () => {
    const templatesById = new Map<string, HomeTemplate>(
      homeTemplates.map((template) => [template.id, template]),
    )

    starterRecommendationGroups
      .flatMap((group) => group.items)
      .forEach((item) => {
        const template = templatesById.get(item.templateId)

        expect(template, `template for ${item.id}`).toBeDefined()
        expect(item.title).toBe(template?.title)
        expect(item.summary).toBe(template?.summary)
        expect(item.prompt).toBe(template?.prompt)
        expect(item.relatedObject).toBe(template?.title)
        expect(item.primaryActionLabel).toBe('使用模板')
      })
  })

  it('sorts today attention by recommendation priority', () => {
    expect(
      homeRecommendationSections.todayAttention.map(
        (item) => item.recommendationPriority,
      ),
    ).toEqual(['high', 'high', 'medium', 'medium'])
  })

  it('provides deterministic compact signals for the visual workbench', () => {
    expect(homeRecommendationSignals).toHaveLength(4)
    expect(homeRecommendationSignals.map((signal) => signal.label)).toEqual([
      '风险',
      '待复核',
      '审批',
      '资产',
    ])
    expect(homeRecommendationSignals.map((signal) => signal.value)).toEqual([
      '3',
      '2',
      '1',
      '78%',
    ])
    expect(homeRecommendationSignals.map((signal) => signal.tone)).toEqual([
      'risk',
      'review',
      'approval',
      'asset',
    ])

    homeRecommendationSignals.forEach((signal) => {
      expect(signal.id).toBeTruthy()
      expect(signal.targetId).toBeTruthy()
      expect(signal.targetLabel).toBeTruthy()
      expect(signal.filterKind).toBeTruthy()
      expect(
        homeRecommendationInsights.some((widget) => widget.id === signal.targetId),
      ).toBe(true)
    })
  })

  it('provides deterministic insight widgets for the visual workbench', () => {
    expect(homeRecommendationInsights.map((widget) => widget.title)).toEqual([
      '今日优先级',
      '项目流转',
      '回传时间线',
      '资产健康度',
    ])

    homeRecommendationInsights.forEach((widget) => {
      expect(widget.prompt).toBeTruthy()
      expect(widget.targetId).toBeTruthy()
      expect(widget.entries.length).toBeGreaterThan(0)

      widget.entries.forEach((entry) => {
        expect(entry.id).toBeTruthy()
        expect(entry.label).toBeTruthy()
        expect(entry.detail).toBeTruthy()
        expect(entry.status).toBeTruthy()
        expect(entry.tone).toBeTruthy()
        expect(entry.targetId).toBeTruthy()
      })
    })

    const widgetTargetIds = homeRecommendationInsights.map(
      (widget) => widget.targetId,
    )

    expect(new Set(widgetTargetIds).size).toBe(widgetTargetIds.length)
    expect(widgetTargetIds).toEqual(homeRecommendationInsights.map((widget) => widget.id))

    const visibleRecommendationTargetIds = new Set([
      ...homeRecommendationInsights.map((widget) => widget.id),
      ...homeRecommendationFeedBaseCards.map((item) => item.id),
      ...homeRecommendationSections.continueWork.map((item) => item.id),
      ...homeRecommendationSections.smartSuggestions.map((item) => item.id),
      ...starterRecommendationGroups.flatMap((group) =>
        group.items.map((item) => item.id),
      ),
    ])

    homeRecommendationInsights
      .flatMap((widget) => widget.entries)
      .forEach((entry) => {
        expect(
          visibleRecommendationTargetIds.has(entry.targetId),
          `visible target for ${entry.id}`,
        ).toBe(true)
      })
  })
})
