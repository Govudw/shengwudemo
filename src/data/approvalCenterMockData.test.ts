import { describe, expect, it } from 'vitest'
import {
  approvalCenterSections,
  approvalRecords,
  approvalRules,
  getApprovalOverviewMetrics,
  getApprovalRecordsBySection,
  runApprovalSimulation,
} from './approvalCenterMockData'

describe('approvalCenterMockData', () => {
  it('keeps Approval Center IA labels in the spec order', () => {
    expect(approvalCenterSections.map((section) => section.label)).toEqual([
      '总览',
      '待处理',
      '我发起的',
      '审批记录',
      '操作规则',
      '审批流程',
      '审批人组',
      '外部审批',
      '审计日志',
      '模拟测试',
    ])
  })

  it('separates approval lifecycle status from external sync status', () => {
    expect(
      approvalRecords.find((record) => record.id === 'BM-APR-20260615-007'),
    ).toMatchObject({
      status: 'pending',
      syncStatus: 'callbackFailed',
      route: 'external',
    })
  })

  it('returns actionable pending records separately from immutable records', () => {
    expect(
      getApprovalRecordsBySection('pending').every(
        (record) => record.status === 'pending',
      ),
    ).toBe(true)
    expect(
      getApprovalRecordsBySection('records').some(
        (record) => record.status === 'approved',
      ),
    ).toBe(true)
  })

  it('computes overview metrics from seeded approval records', () => {
    expect(getApprovalOverviewMetrics()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '待处理审批' }),
        expect.objectContaining({ label: '外部同步异常' }),
      ]),
    )
  })

  it('simulates rule matching for a CRO order as an external approval route', () => {
    expect(runApprovalSimulation({ operationType: 'createCroOrder' })).toMatchObject({
      route: 'external',
      connectorName: '企业微信 CRO 审批流',
      expectedPendingApprovers: [],
    })
  })

  it('keeps withdrawn external records tied to an external approval rule', () => {
    expect(approvalRules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: '旧候选数据集外部删除审批',
          operationType: 'deleteKeyAsset',
          route: 'external',
          version: 'v1',
        }),
      ]),
    )
    expect(
      approvalRecords.find((record) => record.id === 'BM-APR-20260615-006'),
    ).toMatchObject({
      operationType: 'deleteKeyAsset',
      route: 'external',
      syncStatus: 'withdrawRequested',
      ruleVersion: '旧候选数据集外部删除审批 v1',
    })
  })
})
