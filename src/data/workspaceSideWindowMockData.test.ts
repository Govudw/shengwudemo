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
    expect(getPreviewKindByExtension('eln')).toBe('unsupported')
    expect(getPreviewKindByExtension('bmeln')).toBe('eln')
    expect(getPreviewKindByExtension('xlsx')).toBe('spreadsheet')
    expect(getPreviewKindByExtension('csv')).toBe('spreadsheet')
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

  it('includes preview payloads for md json images and spreadsheets while preserving unsupported metadata', () => {
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
    const csv = files.find(
      (file) => file.fileName === 'ENZ_raw_readout_summary.csv',
    )
    const unsupported = files.find(
      (file) => file.fileName === 'approval_decision_record.pdf',
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
      previewKind: 'spreadsheet',
      fileName: 'Enzyme_Experiment_Result_Package.xlsx',
      objectPath:
        'Industrial Enzyme Design/Results/Enzyme_Experiment_Result_Package.xlsx',
      sourceLabel: expect.any(String),
      sizeLabel: expect.any(String),
      updatedAt: expect.any(String),
      statusLabel: expect.any(String),
      spreadsheetPreview: expect.objectContaining({
        sheetName: 'Summary',
        columns: expect.arrayContaining(['variant_id', 'activity_pct']),
        rows: expect.arrayContaining([
          expect.arrayContaining(['ENZ-MUT-017']),
        ]),
      }),
    })
    expect(workbook?.content).toBeUndefined()
    expect(workbook?.imageSrc).toBeUndefined()
    expect(csv).toMatchObject({
      previewKind: 'spreadsheet',
      spreadsheetPreview: expect.objectContaining({
        sheetName: 'CSV preview',
        columns: expect.arrayContaining(['well', 'variant_id']),
        rows: expect.arrayContaining([
          expect.arrayContaining(['A03', 'ENZ-MUT-017']),
        ]),
      }),
    })
    expect(unsupported).toMatchObject({
      previewKind: 'unsupported',
      fileName: 'approval_decision_record.pdf',
    })
  })

  it('builds the LIMS ELN asset from the full experiment notebook outline', () => {
    const files = buildThreadObjectStorageFiles('Enzyme Synthesis Ops', 'lims-flow-run')
    const eln = files.find(
      (file) => file.fileName === 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
    )
    const documentContent = eln?.elnDocument?.document.content ?? []
    const nodesByType = new Map<string, Array<Record<string, unknown>>>()
    const collectNodes = (nodes: Array<Record<string, unknown>>) => {
      for (const node of nodes) {
        if (typeof node.type === 'string') {
          nodesByType.set(node.type, [...(nodesByType.get(node.type) ?? []), node])
        }
        if (Array.isArray(node.content)) {
          collectNodes(node.content as Array<Record<string, unknown>>)
        }
      }
    }
    collectNodes(documentContent)
    const firstHeading = documentContent.find((node) => node.type === 'heading')
    const firstHeadingText = Array.isArray(firstHeading?.content)
      ? firstHeading.content
          .map((node) => {
            if (typeof node !== 'object' || node === null || !('text' in node)) {
              return ''
            }
            const text = (node as { text?: unknown }).text
            return typeof text === 'string' ? text : ''
          })
          .join('')
      : ''
    const headingText = (nodesByType.get('heading') ?? []).map((heading) =>
      Array.isArray(heading.content)
        ? heading.content
            .map((node) => {
              if (typeof node !== 'object' || node === null || !('text' in node)) {
                return ''
              }
              const text = (node as { text?: unknown }).text
              return typeof text === 'string' ? text : ''
            })
            .join('')
        : '',
    )
    const collectText = (node: unknown): string => {
      if (typeof node === 'string') return node
      if (typeof node !== 'object' || node === null) return ''
      const record = node as Record<string, unknown>
      const ownText = typeof record.text === 'string' ? record.text : ''
      const contentText = Array.isArray(record.content)
        ? record.content.map(collectText).join(' ')
        : ''
      const attrsText =
        typeof record.attrs === 'object' && record.attrs !== null
          ? Object.values(record.attrs as Record<string, unknown>)
              .map((value) =>
                typeof value === 'string' || typeof value === 'number' ? String(value) : '',
              )
              .join(' ')
          : ''
      return [ownText, attrsText, contentText].filter(Boolean).join(' ')
    }
    const documentText = documentContent.map(collectText).join('\n')

    expect(eln).toMatchObject({
      previewKind: 'eln',
      extension: 'bmeln',
      objectPath:
        'Enzyme Synthesis Ops/Runs/RUN-ENZ-SYN-20260604-001/eln/RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
      elnDocument: expect.objectContaining({
        formatVersion: 'bmeln.v1',
        revision: 1,
      }),
    })
    expect(firstHeadingText).toBe('酶合成实验记录')
    expect(headingText).not.toEqual(
      expect.arrayContaining([
        '0. ELN Header',
        '1. Run Setup Snapshot',
        '2. Approval Records',
        '14. Audit Trail',
      ]),
    )
    expect(
      (nodesByType.get('heading') ?? []).filter((node) => {
        const level = (node.attrs as { level?: unknown } | undefined)?.level
        return level === 1 || level === 2
      }).length,
    ).toBeGreaterThanOrEqual(12)
    expect((nodesByType.get('table') ?? []).length).toBeGreaterThanOrEqual(12)
    expect((nodesByType.get('elnImageBlock') ?? []).length).toBe(0)
    expect((nodesByType.get('elnChartBlock') ?? []).length).toBeGreaterThanOrEqual(14)
    expect((nodesByType.get('elnSignatureBlock') ?? []).length).toBeGreaterThanOrEqual(4)
    expect((nodesByType.get('elnAttachmentBlock') ?? []).length).toBe(0)
    expect(documentText).toContain('启动输入包内容已直接写入本记录')
    expect(documentText).toContain('WO-CONSTRUCT-20260604-101')
    expect(documentText).toContain('CALLBACK-QC-204 的摘要已直接写入本节')
    expect(documentText).toContain('结果包发布结论')
    expect(documentText).toContain('方法条件与判定阈值')
    expect(documentText).toContain('QC 判定阈值')
    expect(documentText).toContain('代表性读数摘要')
    expect(documentText).toContain('异常影响评估')
    expect(documentText).toContain('原始数据索引')
  })

  it('builds the LIMS ELN as an evidence-dense v2 experiment record', () => {
    const files = buildThreadObjectStorageFiles('Enzyme Synthesis Ops', 'lims-flow-run')
    const eln = files.find(
      (file) => file.fileName === 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
    )
    const documentContent = eln?.elnDocument?.document.content ?? []
    const nodesByType = new Map<string, Array<Record<string, unknown>>>()
    const collectNodes = (nodes: Array<Record<string, unknown>>) => {
      for (const node of nodes) {
        if (typeof node.type === 'string') {
          nodesByType.set(node.type, [...(nodesByType.get(node.type) ?? []), node])
        }
        if (Array.isArray(node.content)) {
          collectNodes(node.content as Array<Record<string, unknown>>)
        }
      }
    }
    const collectText = (node: unknown): string => {
      if (typeof node === 'string') return node
      if (typeof node !== 'object' || node === null) return ''
      const record = node as Record<string, unknown>
      const ownText = typeof record.text === 'string' ? record.text : ''
      const contentText = Array.isArray(record.content)
        ? record.content.map(collectText).join(' ')
        : ''
      const attrsText =
        typeof record.attrs === 'object' && record.attrs !== null
          ? Object.values(record.attrs as Record<string, unknown>)
              .map((value) =>
                typeof value === 'string' || typeof value === 'number' ? String(value) : '',
              )
              .join(' ')
          : ''
      return [ownText, attrsText, contentText].filter(Boolean).join(' ')
    }
    collectNodes(documentContent)

    const headings = (nodesByType.get('heading') ?? []).map((heading) =>
      Array.isArray(heading.content) ? heading.content.map(collectText).join('') : '',
    )
    const documentText = documentContent.map(collectText).join('\n')
    const chartTitles = (nodesByType.get('elnChartBlock') ?? []).map((node) => {
      const attrs = node.attrs
      if (typeof attrs !== 'object' || attrs === null) return ''
      const title = (attrs as { title?: unknown }).title
      return typeof title === 'string' ? title : ''
    })
    const signatureMeanings = (nodesByType.get('elnSignatureBlock') ?? []).map((node) => {
      const attrs = node.attrs
      if (typeof attrs !== 'object' || attrs === null) return ''
      const meaning = (attrs as { meaning?: unknown }).meaning
      return typeof meaning === 'string' ? meaning : ''
    })

    expect(headings).toEqual(
      expect.arrayContaining([
        '实验基本信息',
        '实验目的与边界',
        '材料、设备与执行条件',
        '样本登记与板图',
        '实验流程与时间线',
        '构建执行与返工记录',
        '表达记录',
        '纯化记录',
        '质量分析与表征',
        '结果与原始数据',
        '异常与偏差记录',
        '结果包与数据追溯',
        '效率复盘与下一步计划',
        '审核与签名',
      ]),
    )
    expect((nodesByType.get('elnImageBlock') ?? []).length).toBe(0)
    expect((nodesByType.get('elnChartBlock') ?? []).length).toBeGreaterThanOrEqual(14)
    expect(chartTitles).toEqual(
      expect.arrayContaining([
        '实验阶段时间线',
        '样本角色分布',
        '板图孔位布局摘要',
        '设备窗口占用',
        '构建 QC 状态',
        '表达记录分布',
        '纯化收率分布',
        'QC 门控结果',
        'PR-3107 活性读数时间线',
        '候选分组表现',
        'Activity 与 Tm 关系',
        '异常处理状态',
        '异常类型分布',
        '阶段耗时对比',
      ]),
    )
    expect(documentText).toContain('板图角色')
    expect(documentText).toContain('设备窗口')
    expect(documentText).toContain('数据完整性检查项')
    expect(documentText).toContain('异常处理策略')
    expect(documentText).not.toContain('图 1：样本登记、板图和结果记录摘要')
    expect(documentText).not.toContain('图 1b：资源准备与执行路线')
    expect(documentText).not.toContain('图 2：结果包 QC 总览')
    expect(documentText).not.toContain('图 3：异常 flag 分布')
    expect(documentText).toContain('代表性读数')
    expect(documentText).toContain('parent control')
    expect(documentText).toContain('高活性候选')
    expect(documentText).toContain('低收率 flag 样本')
    expect(documentText).toContain('返工样本')
    expect(documentText).toContain('612 条结构化读数不在正文全文展开')
    expect(documentText).toContain('原始读数保留，不自动剔除')
    expect(documentText).toContain('不建议直接扩大到新一轮 96 样本')
    expect(documentText).toContain('本轮 mock 未提供宿主菌株、质粒载体、克隆序列和表达宿主信息')
    expect(documentText).toContain('反应体积')
    expect(documentText).toContain('检测波长')
    expect(documentText).toContain('阳性对照活性')
    expect(documentText).toContain('均值 ± SD')
    expect(documentText).toContain('图表结论')
    expect(documentText).not.toMatch(/BL21|DH5α|pET|宿主菌株：|质粒编号：|载体编号：/)
    expect(signatureMeanings).toEqual(
      expect.arrayContaining([
        '确认本轮输入范围、执行边界和自动派发权限。',
        '确认返工范围仅限 ENZ-SYN-017 与 ENZ-SYN-032。',
        '确认结果包可以释放至项目交付区。',
      ]),
    )
  })

  it('keeps the LIMS ELN v2 content consistent with traceable run assets', () => {
    const files = buildThreadObjectStorageFiles('Enzyme Synthesis Ops', 'lims-flow-run')
    const fileByName = new Map(files.map((file) => [file.fileName, file]))
    const eln = fileByName.get('RUN-ENZ-SYN-20260604-001_experiment_record.bmeln')
    const documentContent = eln?.elnDocument?.document.content ?? []
    const collectText = (node: unknown): string => {
      if (typeof node === 'string') return node
      if (typeof node !== 'object' || node === null) return ''
      const record = node as Record<string, unknown>
      const ownText = typeof record.text === 'string' ? record.text : ''
      const contentText = Array.isArray(record.content)
        ? record.content.map(collectText).join(' ')
        : ''
      const attrsText =
        typeof record.attrs === 'object' && record.attrs !== null
          ? Object.values(record.attrs as Record<string, unknown>)
              .map((value) =>
                typeof value === 'string' || typeof value === 'number' ? String(value) : '',
              )
              .join(' ')
          : ''
      return [ownText, attrsText, contentText].filter(Boolean).join(' ')
    }
    const documentText = documentContent.map(collectText).join('\n')
    const runManifest = JSON.parse(
      fileByName.get('RUN-ENZ-SYN-20260604-001_run_manifest.json')?.content ?? '{}',
    ) as { controls?: string[] }
    const expressionOrder = fileByName.get('WO-EXPRESS-20260604-102.md')?.content ?? ''
    const purificationOrder = fileByName.get('WO-PURIFY-20260604-103.md')?.content ?? ''
    const anomalyLog = fileByName.get('ANOMALY-ENZ-SYN-20260604-001.md')?.content ?? ''

    expect(eln?.elnDocument?.revisionLabel).toContain('final review pending')
    expect(eln?.elnDocument?.notebook.status).toContain('review pending')
    expect(documentText).not.toMatch(/136\.2|66\.5|82\.7|69\.2|91\.4|61\.0|47\.3|58\.6/)
    expect(documentText).not.toContain('BUF-ENZ-202606-02')
    expect(documentText).not.toContain('25 C 台面暴露不超过 45 分钟')
    expect(runManifest.controls).toEqual(
      expect.arrayContaining([
        'ENZ-P0 parent',
        'blank buffer',
        'inactive enzyme',
        'process control',
      ]),
    )
    expect(expressionOrder).toContain('52 verified samples including controls')
    expect(expressionOrder).toContain('52 expression records returned')
    expect(purificationOrder).toContain('52 assay inputs released; 2 low-yield flags retained')
    expect(anomalyLog).toContain('edge effect')
    expect(anomalyLog).toContain('attachment supplement')
  })
})
