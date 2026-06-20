import { describe, expect, it } from 'vitest'
import {
  homeRecommendationSections,
  homeRecommendations,
  starterRecommendationGroups,
} from './homeRecommendations'

const forbiddenActionWords = ['查看', '打开', '进入', '处理审批', '完成任务']

describe('homeRecommendations', () => {
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
      expect(item.prompt).toMatch(/^请帮我/)
      expect(item.accent).toBeTruthy()
      expect(item).toHaveProperty('templateId')
      expect(
        forbiddenActionWords.some((word) => item.primaryActionLabel.includes(word)),
      ).toBe(false)
    })
  })

  it('sorts today attention by recommendation priority', () => {
    expect(
      homeRecommendationSections.todayAttention.map(
        (item) => item.recommendationPriority,
      ),
    ).toEqual(['high', 'high', 'medium', 'medium'])
  })
})
