import { describe, expect, it } from 'vitest'
import { projects as seedProjects } from './mockData'
import {
  getProjectFileFolderId,
  getProjectManagementRecords,
} from './projectsMockData'

const now = Date.parse('2026-05-27T10:00:00+08:00')

describe('Projects management data', () => {
  it('builds project management records from workspace projects without merging permission roles', () => {
    const records = getProjectManagementRecords(seedProjects, now)
    const antibody = records.find(
      (record) => record.projectId === 'antibody-optimization',
    )

    expect(antibody).toMatchObject({
      name: 'Antibody Optimization',
      status: 'active',
      favoritedByCurrentUser: true,
      trashed: false,
    })
    expect(antibody?.threadCount).toBeGreaterThan(0)
    expect(antibody?.responsibleMember.name).toBe('ABot-智能助手')
    expect(
      antibody?.readOnlyPermissionMembers.some(
        (member) => member.id === antibody.responsibleMember.id,
      ),
    ).toBe(false)
    expect(
      antibody?.editPermissionMembers.some(
        (member) => member.id === antibody.responsibleMember.id,
      ),
    ).toBe(false)
    expect(
      antibody?.readOnlyPermissionMembers.some((readMember) =>
        antibody.editPermissionMembers.some(
          (editMember) => editMember.id === readMember.id,
        ),
      ),
    ).toBe(false)
    expect(antibody?.assetSummary.files).toBeGreaterThan(0)
    expect(antibody?.contextSummary.projectContext).toContain('项目描述')
  })

  it('keeps trashed projects as separate project management records', () => {
    const records = getProjectManagementRecords(seedProjects, now)
    const trashedRecords = records.filter((record) => record.trashed)

    expect(trashedRecords).toHaveLength(1)
    expect(trashedRecords[0].status).toBe('archived')
    expect(trashedRecords[0].threadCount).toBe(0)
  })

  it('builds the Pipeline Build project management record without a Project File folder', () => {
    const records = getProjectManagementRecords(seedProjects, now)
    const pipelineBuild = records.find(
      (record) => record.projectId === 'pipeline-build',
    )

    expect(pipelineBuild).toMatchObject({
      name: 'Pipeline Build',
      status: 'active',
      threadCount: 2,
      assetSummary: {
        files: 3,
      },
      recentActivityThreadTitle: 'LIMS 酶合成执行编排',
    })
    expect(pipelineBuild?.threads).toHaveLength(2)
    expect(pipelineBuild?.threads.map((thread) => thread.title)).toEqual([
      'LIMS 酶合成执行编排',
      'ENZ-P0 实验流程编排',
    ])
    expect(getProjectFileFolderId('pipeline-build')).toBeNull()
  })

  it('maps project ids to existing Project File folder ids', () => {
    expect(getProjectFileFolderId('antibody-optimization')).toBe(
      'project-antibody-optimization',
    )
    expect(getProjectFileFolderId('legacy-target-cleanup')).toBeNull()
  })
})
