import { describe, expect, it } from 'vitest'
import {
  buildThreadObjectStorageFiles,
  filterSideWindowFiles,
  getPreviewKindByExtension,
} from './workspaceSideWindowMockData'

const projectName = 'Industrial Enzyme Design'
const executionThreadId = 'enzyme-experiment-execution'

describe('workspace side window file data', () => {
  it('maps file extensions to preview kinds', () => {
    expect(getPreviewKindByExtension('md')).toBe('markdown')
    expect(getPreviewKindByExtension('.json')).toBe('json')
    expect(getPreviewKindByExtension('PNG')).toBe('image')
    expect(getPreviewKindByExtension('xlsx')).toBe('unsupported')
    expect(getPreviewKindByExtension('csv')).toBe('unsupported')
    expect(getPreviewKindByExtension('pdf')).toBe('unsupported')
    expect(getPreviewKindByExtension('zip')).toBe('unsupported')
  })

  it('filters files by filename, object path, and source label case-insensitively', () => {
    const files = buildThreadObjectStorageFiles(projectName, executionThreadId)

    expect(filterSideWindowFiles(files, 'ENZ-PLATEMAP')).toEqual([
      expect.objectContaining({ fileName: 'ENZ-PLATEMAP-20260602-001.json' }),
    ])
    expect(filterSideWindowFiles(files, 'execution')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          objectPath: expect.stringContaining('Execution'),
        }),
      ]),
    )
    expect(filterSideWindowFiles(files, 'lab owner')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceLabel: 'Lab Owner',
        }),
      ]),
    )
    expect(filterSideWindowFiles(files, '   ')).toHaveLength(files.length)
  })

  it('returns the largest enzyme file manifest for the order and experiment execution thread', () => {
    const executionFiles = buildThreadObjectStorageFiles(
      projectName,
      executionThreadId,
    )
    const fullLoopFiles = buildThreadObjectStorageFiles(projectName, 'enzyme-full-loop')
    const designFiles = buildThreadObjectStorageFiles(
      projectName,
      'enzyme-design-breakdown',
    )
    const analysisFiles = buildThreadObjectStorageFiles(
      projectName,
      'enzyme-analysis-iteration',
    )

    expect(executionFiles.length).toBeGreaterThanOrEqual(22)
    expect(executionFiles.length).toBeLessThanOrEqual(28)
    expect(executionFiles.length).toBeGreaterThan(fullLoopFiles.length)
    expect(executionFiles.length).toBeGreaterThan(designFiles.length)
    expect(executionFiles.length).toBeGreaterThan(analysisFiles.length)
    expect(new Set(executionFiles.map((file) => file.directory))).toEqual(
      new Set(['Design', 'Execution', 'ELN', 'Results', 'Reports', 'Figures']),
    )
  })

  it('keeps object paths project-scoped and source labels production-like', () => {
    const files = buildThreadObjectStorageFiles(projectName, executionThreadId)

    for (const file of files) {
      expect(file.objectPath).toMatch(/^Industrial Enzyme Design\//)
      expect(file.objectPath).not.toMatch(/^\/|^[A-Za-z]:\\|localhost|file:\/\//)
      expect(file.sourceLabel).not.toMatch(/mock|demo|local|generated/i)
    }
  })

  it('includes preview payloads for md json and images while preserving unsupported metadata', () => {
    const files = buildThreadObjectStorageFiles(projectName, executionThreadId)

    const markdown = files.find(
      (file) => file.fileName === 'BM-LAB-ENZ-20260602-001_order_summary.md',
    )
    const json = files.find(
      (file) => file.fileName === 'BM-LAB-ENZ-20260602-001_order_payload.json',
    )
    const image = files.find((file) => file.extension === 'png')
    const workbook = files.find(
      (file) => file.fileName === 'Enzyme_Experiment_Result_Package.xlsx',
    )

    expect(markdown).toMatchObject({
      previewKind: 'markdown',
      content: expect.stringContaining('BM-LAB-ENZ-20260602-001'),
    })
    expect(json).toMatchObject({
      previewKind: 'json',
      content: expect.stringContaining('ENZ-EXPTASK-20260602-001'),
    })
    expect(image).toMatchObject({
      previewKind: 'image',
      imageSrc: expect.stringMatching(/enzyme-/),
    })
    expect(workbook).toMatchObject({
      previewKind: 'unsupported',
      fileName: 'Enzyme_Experiment_Result_Package.xlsx',
      objectPath:
        'Industrial Enzyme Design/Results/Enzyme_Experiment_Result_Package.xlsx',
      sourceLabel: expect.any(String),
      sizeLabel: expect.any(String),
      updatedAt: expect.any(String),
      statusLabel: expect.any(String),
    })
    expect(workbook?.content).toBeUndefined()
    expect(workbook?.imageSrc).toBeUndefined()
  })
})
