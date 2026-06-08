import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import type {
  SideWindowFileAsset,
  SideWindowFileDirectory,
  SideWindowSpreadsheetPreview,
} from '../data/workspaceSideWindowMockData'
import { filterSideWindowFiles } from '../data/workspaceSideWindowMockData'
import ElnEditorPreview, { type ElnHeadingScrollRequest } from './ElnEditorPreview'
import type { ElnDocumentOutlineItem } from './eln/elnDocumentModel'
import {
  ChevronDownIcon,
  FolderIcon,
  MaximizeIcon,
  MessageCircleIcon,
  MinimizeIcon,
  SearchIcon,
} from './icons'

export type WorkspaceSideWindowMode = 'launcher' | 'files' | 'sideChat'

export type WorkspaceSideWindowThreadState = {
  mode: WorkspaceSideWindowMode
  selectedFileId: string | null
  searchQuery: string
  fileTreeCollapsed: boolean
  documentOutlineCollapsed?: boolean
  fileStatusOverrides?: Record<string, string>
}

type WorkspaceSideWindowProps = {
  projectName: string
  state: WorkspaceSideWindowThreadState
  files: SideWindowFileAsset[]
  maximized: boolean
  onStateChange: (nextState: WorkspaceSideWindowThreadState) => void
  onMaximizedChange: (maximized: boolean) => void
}

const preferredDirectories: SideWindowFileDirectory[] = [
  'Design',
  'Execution',
  'ELN',
  'Results',
  'Reports',
  'Figures',
  'Runs/RUN-ENZ-SYN-20260604-001/inputs',
  'Runs/RUN-ENZ-SYN-20260604-001/approvals',
  'Runs/RUN-ENZ-SYN-20260604-001/work_orders',
  'Runs/RUN-ENZ-SYN-20260604-001/callbacks',
  'Runs/RUN-ENZ-SYN-20260604-001/qc',
  'Runs/RUN-ENZ-SYN-20260604-001/exceptions',
  'Runs/RUN-ENZ-SYN-20260604-001/eln',
  'Runs/RUN-ENZ-SYN-20260604-001/results',
  'Runs/RUN-ENZ-SYN-20260604-001/analysis',
]

const preferredDirectorySet = new Set<string>(preferredDirectories)

function WorkspaceSideWindow({
  projectName,
  state,
  files,
  maximized,
  onStateChange,
  onMaximizedChange,
}: WorkspaceSideWindowProps) {
  const mode = state.mode
  const selectedFile =
    mode === 'files'
      ? files.find((file) => file.id === state.selectedFileId) ?? null
      : null
  const selectedFileStatus = selectedFile
    ? getFileStatusLabel(selectedFile, state)
    : null
  const selectedFileIsEln = selectedFile?.previewKind === 'eln'
  const documentOutlineCollapsed = selectedFileIsEln
    ? state.documentOutlineCollapsed ?? !maximized
    : true
  const previousMaximizedRef = useRef(maximized)

  function updateState(patch: Partial<WorkspaceSideWindowThreadState>) {
    onStateChange({ ...state, ...patch })
  }

  useEffect(() => {
    if (previousMaximizedRef.current === maximized) {
      return
    }

    previousMaximizedRef.current = maximized

    if (!selectedFileIsEln) {
      return
    }

    onStateChange({
      ...state,
      fileTreeCollapsed: maximized ? true : state.fileTreeCollapsed,
      documentOutlineCollapsed: !maximized,
    })
  }, [maximized, onStateChange, selectedFileIsEln, state])

  function toggleFileTree() {
    const nextFileTreeCollapsed = !state.fileTreeCollapsed

    updateState({
      fileTreeCollapsed: nextFileTreeCollapsed,
      ...(selectedFileIsEln && !nextFileTreeCollapsed
        ? { documentOutlineCollapsed: true }
        : {}),
    })
  }

  function updateDocumentOutlineCollapsed(collapsed: boolean) {
    updateState({
      documentOutlineCollapsed: collapsed,
      ...(selectedFileIsEln && !collapsed ? { fileTreeCollapsed: true } : {}),
    })
  }

  return (
    <section
      className={`workspace-side-window${
        mode === 'files' ? '' : ' workspace-side-window--pathless'
      }${maximized ? ' workspace-side-window--maximized' : ''}`}
      aria-label="Workspace 侧窗"
    >
      <header className="workspace-side-window__header">
        <div className="workspace-side-window__modes" aria-label="侧窗模式">
          <button
            type="button"
            className={`workspace-side-window__mode-button${
              mode === 'files' ? ' workspace-side-window__mode-button--active' : ''
            }`}
            aria-pressed={mode === 'files'}
            onClick={() => updateState({ mode: 'files' })}
          >
            <FolderIcon className="workspace-side-window__mode-icon" />
            <span>文件</span>
          </button>
          <button
            type="button"
            className={`workspace-side-window__mode-button${
              mode === 'sideChat' ? ' workspace-side-window__mode-button--active' : ''
            }`}
            aria-pressed={mode === 'sideChat'}
            onClick={() => updateState({ mode: 'sideChat' })}
          >
            <MessageCircleIcon className="workspace-side-window__mode-icon" />
            <span>侧边聊天</span>
          </button>
        </div>
        <button
          type="button"
          className="workspace-side-window__maximize"
          aria-label={maximized ? '还原侧窗' : '最大化侧窗'}
          aria-pressed={maximized}
          title={maximized ? '还原侧窗' : '最大化侧窗'}
          onClick={() => onMaximizedChange(!maximized)}
        >
          {maximized ? (
            <MinimizeIcon className="workspace-side-window__maximize-icon" />
          ) : (
            <MaximizeIcon className="workspace-side-window__maximize-icon" />
          )}
        </button>
      </header>

      {mode === 'files' ? (
        <div className="workspace-side-window__path">
          <span className="workspace-side-window__path-text">
            {projectName} /{selectedFile ? ` ${selectedFile.fileName}` : ''}
          </span>
          {selectedFileStatus ? (
            <span className="workspace-side-window__path-status">
              {selectedFileStatus}
            </span>
          ) : null}
          <button
            type="button"
            className="workspace-side-window__path-action"
            aria-label={state.fileTreeCollapsed ? '展开文件树' : '收起文件树'}
            title={state.fileTreeCollapsed ? '展开文件树' : '收起文件树'}
            onClick={toggleFileTree}
          >
            <FolderIcon className="workspace-side-window__path-action-icon" />
          </button>
        </div>
      ) : null}

      {mode === 'launcher' ? (
        <WorkspaceSideWindowLauncher
          onOpenFiles={() => updateState({ mode: 'files' })}
          onOpenSideChat={() => updateState({ mode: 'sideChat' })}
        />
      ) : null}

      {mode === 'files' ? (
        <WorkspaceFileBrowser
          files={files}
          state={state}
          maximized={maximized}
          documentOutlineCollapsed={documentOutlineCollapsed}
          onDocumentOutlineCollapsedChange={updateDocumentOutlineCollapsed}
          onStateChange={onStateChange}
        />
      ) : null}

      {mode === 'sideChat' ? <WorkspaceSideChatPlaceholder /> : null}
    </section>
  )
}

function WorkspaceSideWindowLauncher({
  onOpenFiles,
  onOpenSideChat,
}: {
  onOpenFiles: () => void
  onOpenSideChat: () => void
}) {
  return (
    <div className="workspace-side-window__launcher">
      <button
        type="button"
        className="workspace-side-window__launcher-card"
        onClick={onOpenFiles}
      >
        <FolderIcon className="workspace-side-window__launcher-icon" />
        <strong>文件</strong>
        <span>浏览项目文件</span>
      </button>
      <button
        type="button"
        className="workspace-side-window__launcher-card"
        onClick={onOpenSideChat}
      >
        <MessageCircleIcon className="workspace-side-window__launcher-icon" />
        <strong>侧边聊天</strong>
        <span>发起侧边对话</span>
      </button>
    </div>
  )
}

function WorkspaceFileBrowser({
  files,
  state,
  maximized,
  documentOutlineCollapsed,
  onDocumentOutlineCollapsedChange,
  onStateChange,
}: {
  files: SideWindowFileAsset[]
  state: WorkspaceSideWindowThreadState
  maximized: boolean
  documentOutlineCollapsed: boolean
  onDocumentOutlineCollapsedChange: (collapsed: boolean) => void
  onStateChange: (nextState: WorkspaceSideWindowThreadState) => void
}) {
  const filteredFiles = filterSideWindowFiles(files, state.searchQuery)
  const directories = getOrderedFileDirectories(filteredFiles)
  const selectedFile =
    files.find((file) => file.id === state.selectedFileId) ?? null
  const selectedFileIsEln = selectedFile?.previewKind === 'eln'
  const [documentOutline, setDocumentOutline] = useState<ElnDocumentOutlineItem[]>([])
  const [headingScrollRequest, setHeadingScrollRequest] =
    useState<ElnHeadingScrollRequest | null>(null)
  const previousSelectedFileIdRef = useRef<string | null>(selectedFile?.id ?? null)
  const browserClassName = [
    'workspace-file-browser',
    state.fileTreeCollapsed ? 'workspace-file-browser--tree-collapsed' : '',
    selectedFileIsEln ? 'workspace-file-browser--with-outline' : '',
    selectedFileIsEln && documentOutlineCollapsed
      ? 'workspace-file-browser--outline-collapsed'
      : '',
    selectedFileIsEln && !documentOutlineCollapsed
      ? 'workspace-file-browser--outline-expanded'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  function updateState(patch: Partial<WorkspaceSideWindowThreadState>) {
    onStateChange({ ...state, ...patch })
  }

  function updateFileStatus(fileId: string, statusLabel: string) {
    updateState({
      fileStatusOverrides: {
        ...(state.fileStatusOverrides ?? {}),
        [fileId]: statusLabel,
      },
    })
  }

  const handleDocumentOutlineChange = useCallback(
    (nextOutline: ElnDocumentOutlineItem[]) => {
      setDocumentOutline(nextOutline)
    },
    [],
  )

  function handleDocumentHeadingSelect(id: string) {
    setHeadingScrollRequest((current) => ({
      id,
      requestId: (current?.requestId ?? 0) + 1,
    }))
  }

  useEffect(() => {
    if (previousSelectedFileIdRef.current === (selectedFile?.id ?? null)) {
      return
    }

    previousSelectedFileIdRef.current = selectedFile?.id ?? null
    setDocumentOutline([])
    setHeadingScrollRequest(null)
  }, [selectedFile?.id])

  return (
    <div className={browserClassName}>
      {selectedFileIsEln ? (
        <ElnDocumentOutline
          collapsed={documentOutlineCollapsed}
          outline={documentOutline}
          onCollapsedChange={onDocumentOutlineCollapsedChange}
          onHeadingSelect={handleDocumentHeadingSelect}
        />
      ) : null}
      <WorkspaceFilePreview
        file={selectedFile}
        statusLabel={selectedFile ? getFileStatusLabel(selectedFile, state) : null}
        onFileStatusChange={updateFileStatus}
        onDocumentOutlineChange={handleDocumentOutlineChange}
        headingScrollRequest={headingScrollRequest}
      />
      {!state.fileTreeCollapsed ? (
        <aside className="workspace-file-tree" aria-label="对象存储文件树">
          <div className="workspace-file-tree__toolbar">
            <label className="workspace-file-tree__search">
              <SearchIcon className="workspace-file-tree__search-icon" />
              <input
                type="search"
                value={state.searchQuery}
                placeholder="筛选文件..."
                aria-label="筛选文件"
                onInput={(event) =>
                  updateState({ searchQuery: event.currentTarget.value })
                }
              />
            </label>
          </div>
          {filteredFiles.length > 0 ? (
            <div className="workspace-file-tree__groups">
              {directories.map((directory) => {
                const directoryFiles = filteredFiles.filter(
                  (file) => file.directory === directory,
                )

                if (directoryFiles.length === 0) {
                  return null
                }

                return (
                  <section
                    key={directory}
                    className="workspace-file-tree__group"
                    aria-label={`${directory} 文件`}
                  >
                    <div className="workspace-file-tree__group-title">
                      <ChevronDownIcon className="workspace-file-tree__group-icon" />
                      <span>{directory}</span>
                    </div>
                    <ul className="workspace-file-tree__file-list">
                      {directoryFiles.map((file) => (
                        <li key={file.id}>
                          <button
                            type="button"
                            className={`workspace-file-tree__file-button${
                              file.id === state.selectedFileId
                                ? ' workspace-file-tree__file-button--selected'
                                : ''
                            }`}
                            aria-label={file.fileName}
                            aria-pressed={file.id === state.selectedFileId}
                            onClick={() =>
                              updateState({
                                selectedFileId: file.id,
                                ...(file.previewKind === 'eln'
                                  ? {
                                      fileTreeCollapsed: true,
                                      documentOutlineCollapsed: !maximized,
                                    }
                                  : {}),
                              })
                            }
                          >
                            <span className="workspace-file-tree__file-extension">
                              {file.extension || 'file'}
                            </span>
                            <span className="workspace-file-tree__file-body">
                              <span className="workspace-file-tree__file-name">
                                {file.fileName}
                              </span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="workspace-file-tree__empty">没有匹配的文件</div>
          )}
        </aside>
      ) : null}
    </div>
  )
}

function ElnDocumentOutline({
  collapsed,
  outline,
  onCollapsedChange,
  onHeadingSelect,
}: {
  collapsed: boolean
  outline: ElnDocumentOutlineItem[]
  onCollapsedChange: (collapsed: boolean) => void
  onHeadingSelect: (id: string) => void
}) {
  return (
    <aside
      className={`workspace-file-outline${
        collapsed
          ? ' workspace-file-outline--collapsed'
          : ' workspace-file-outline--expanded'
      }`}
      aria-label="文档导航"
    >
      <button
        type="button"
        className="workspace-file-outline__toggle"
        aria-label={collapsed ? '展开文档导航' : '收起文档导航'}
        title={collapsed ? '展开文档导航' : '收起文档导航'}
        aria-expanded={!collapsed}
        onClick={() => onCollapsedChange(!collapsed)}
      >
        {collapsed ? (
          <span className="workspace-file-outline__toggle-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        ) : (
          <span className="workspace-file-outline__collapse-mark" aria-hidden="true">
            &lt;&lt;
          </span>
        )}
      </button>
      {!collapsed ? (
        outline.length > 0 ? (
          <nav className="workspace-file-outline__nav" aria-label="文档标题">
            <ol>
              {outline.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="workspace-file-outline__item"
                    aria-label={item.title}
                    data-outline-level={item.level}
                    onClick={() => onHeadingSelect(item.id)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>
        ) : (
          <p className="workspace-file-outline__empty">暂无标题</p>
        )
      ) : null}
    </aside>
  )
}

function getOrderedFileDirectories(files: SideWindowFileAsset[]) {
  const fileDirectorySet = new Set(files.map((file) => file.directory))
  const orderedDirectories = preferredDirectories.filter((directory) =>
    fileDirectorySet.has(directory),
  )
  const remainingDirectories = Array.from(fileDirectorySet)
    .filter((directory) => !preferredDirectorySet.has(directory))
    .sort((left, right) => left.localeCompare(right))

  return [...orderedDirectories, ...remainingDirectories]
}

function getFileStatusLabel(
  file: SideWindowFileAsset,
  state: WorkspaceSideWindowThreadState,
) {
  return state.fileStatusOverrides?.[file.id] ?? file.statusLabel
}

function WorkspaceFilePreview({
  file,
  statusLabel,
  onFileStatusChange,
  onDocumentOutlineChange,
  headingScrollRequest,
}: {
  file: SideWindowFileAsset | null
  statusLabel: string | null
  onFileStatusChange: (fileId: string, statusLabel: string) => void
  onDocumentOutlineChange: (outline: ElnDocumentOutlineItem[]) => void
  headingScrollRequest: ElnHeadingScrollRequest | null
}) {
  if (!file) {
    return (
      <section className="workspace-file-preview" aria-label="文件预览">
        <div className="workspace-file-preview__empty">
          <FolderIcon className="workspace-file-preview__empty-icon" />
          <h2>打开文件</h2>
          <p>从右侧对象树选择文件</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className={`workspace-file-preview workspace-file-preview--${file.previewKind}`}
      aria-label={`${file.fileName} 预览`}
    >
      {file.previewKind === 'markdown' ? (
        <div className="workspace-file-preview__markdown">
          {renderMarkdownContent(file.content)}
        </div>
      ) : null}
      {file.previewKind === 'json' ? (
        <pre className="workspace-file-preview__code">
          {renderJsonContent(file.content)}
        </pre>
      ) : null}
      {file.previewKind === 'eln' ? (
        <ElnEditorPreview
          file={file}
          onDirtyStateChange={(nextStatusLabel) =>
            onFileStatusChange(file.id, nextStatusLabel)
          }
          onDocumentOutlineChange={onDocumentOutlineChange}
          headingScrollRequest={headingScrollRequest}
        />
      ) : null}
      {file.previewKind === 'image' && file.imageSrc ? (
        <figure className="workspace-file-preview__figure">
          <img src={file.imageSrc} alt={file.fileName} />
        </figure>
      ) : null}
      {file.previewKind === 'spreadsheet' ? (
        <SpreadsheetFilePreview file={file} statusLabel={statusLabel ?? file.statusLabel} />
      ) : null}
      {file.previewKind === 'unsupported' ? (
        <UnsupportedFilePreview file={file} statusLabel={statusLabel ?? file.statusLabel} />
      ) : null}
    </section>
  )
}

function SpreadsheetFilePreview({
  file,
  statusLabel,
}: {
  file: SideWindowFileAsset
  statusLabel: string
}) {
  const preview =
    file.spreadsheetPreview ?? getFallbackSpreadsheetPreview(file.fileName)

  return (
    <div className="workspace-file-preview__sheet">
      <header className="workspace-file-preview__sheet-header">
        <div>
          <p className="workspace-file-preview__sheet-eyebrow">
            {file.extension.toUpperCase()} preview
          </p>
          <h3>{file.fileName}</h3>
          <p>{preview.summary}</p>
        </div>
        <span className="workspace-file-preview__sheet-badge">
          Sheet: {preview.sheetName}
        </span>
      </header>
      <div className="workspace-file-preview__sheet-meta">
        <span>{preview.totalRows} 行记录</span>
        <span>{preview.columns.length} 列</span>
        <span>{file.sourceLabel}</span>
        <span>{statusLabel}</span>
      </div>
      <div className="workspace-file-preview__sheet-table-scroll">
        <table className="workspace-file-preview__sheet-table">
          <thead>
            <tr>
              {preview.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row, rowIndex) => (
              <tr key={`${file.id}-row-${rowIndex}`}>
                {preview.columns.map((column, cellIndex) => (
                  <td key={`${column}-${cellIndex}`}>{row[cellIndex] ?? ''}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function getFallbackSpreadsheetPreview(fileName: string): SideWindowSpreadsheetPreview {
  return {
    sheetName: 'Preview',
    summary: '对象存储中的表格文件预览，当前仅显示前几行代表性记录。',
    columns: ['file', 'preview_status', 'note'],
    totalRows: 1,
    rows: [[fileName, 'available', 'table preview']],
  }
}

function UnsupportedFilePreview({
  file,
  statusLabel,
}: {
  file: SideWindowFileAsset
  statusLabel: string
}) {
  return (
    <div className="workspace-file-preview__unsupported">
      <h3>当前版本暂不支持内嵌预览</h3>
      <dl>
        <div>
          <dt>文件名</dt>
          <dd>{file.fileName}</dd>
        </div>
        <div>
          <dt>类型</dt>
          <dd>{file.extension.toUpperCase() || 'FILE'}</dd>
        </div>
        <div>
          <dt>大小</dt>
          <dd>{file.sizeLabel}</dd>
        </div>
        <div>
          <dt>来源</dt>
          <dd>{file.sourceLabel}</dd>
        </div>
        <div>
          <dt>对象路径</dt>
          <dd>{file.objectPath}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{statusLabel}</dd>
        </div>
      </dl>
    </div>
  )
}

function WorkspaceSideChatPlaceholder() {
  return (
    <section
      className="workspace-side-chat-placeholder"
      aria-label="侧边聊天"
    >
      <div className="workspace-side-chat-placeholder__body">
        <MessageCircleIcon className="workspace-side-chat-placeholder__icon" />
        <h2>侧边聊天</h2>
        <p>侧边聊天将在后续接入</p>
      </div>
      <input
        type="text"
        disabled
        placeholder="侧边聊天将在后续接入"
        aria-label="侧边聊天输入"
      />
    </section>
  )
}

function formatJsonContent(content: string | undefined) {
  if (!content) {
    return ''
  }

  try {
    return JSON.stringify(JSON.parse(content), null, 2)
  } catch {
    return content
  }
}

function renderMarkdownContent(content: string | undefined) {
  if (!content) {
    return null
  }

  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)

    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3'

      blocks.push(<HeadingTag key={`heading-${index}`}>{text}</HeadingTag>)
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const codeLines: string[] = []
      index += 1

      while (index < lines.length && !lines[index].startsWith('```')) {
        codeLines.push(lines[index])
        index += 1
      }

      blocks.push(
        <pre key={`code-${index}`} className="workspace-file-preview__md-code">
          <code>{codeLines.join('\n')}</code>
        </pre>,
      )
      index += 1
      continue
    }

    if (line.trim().startsWith('|') && lines[index + 1]?.includes('---')) {
      const tableLines: string[] = []

      while (index < lines.length && lines[index].trim().startsWith('|')) {
        tableLines.push(lines[index])
        index += 1
      }

      blocks.push(renderMarkdownTable(tableLines, blocks.length))
      continue
    }

    if (line.trim().startsWith('- ')) {
      const items: string[] = []

      while (index < lines.length && lines[index].trim().startsWith('- ')) {
        items.push(lines[index].trim().slice(2))
        index += 1
      }

      blocks.push(
        <ul key={`list-${index}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{item}</li>
          ))}
        </ul>,
      )
      continue
    }

    const paragraphLines: string[] = []

    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].match(/^(#{1,3})\s+(.+)$/) &&
      !lines[index].trim().startsWith('|') &&
      !lines[index].trim().startsWith('- ') &&
      !lines[index].startsWith('```')
    ) {
      paragraphLines.push(lines[index].trim())
      index += 1
    }

    blocks.push(<p key={`paragraph-${index}`}>{paragraphLines.join(' ')}</p>)
  }

  return blocks
}

function renderMarkdownTable(tableLines: string[], keyIndex: number) {
  const [headerLine, , ...bodyLines] = tableLines
  const headers = splitMarkdownTableRow(headerLine)
  const rows = bodyLines.map(splitMarkdownTableRow)

  return (
    <table key={`table-${keyIndex}`}>
      <thead>
        <tr>
          {headers.map((header, headerIndex) => (
            <th key={`${header}-${headerIndex}`}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={`${row.join('-')}-${rowIndex}`}>
            {row.map((cell, cellIndex) => (
              <td key={`${cell}-${cellIndex}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function splitMarkdownTableRow(row: string) {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function renderJsonContent(content: string | undefined) {
  const formatted = formatJsonContent(content)

  return formatted.split('\n').map((line, lineIndex, lines) => (
    <span key={`${line}-${lineIndex}`} className="workspace-file-preview__json-line">
      {renderJsonLine(line)}
      {lineIndex < lines.length - 1 ? '\n' : null}
    </span>
  ))
}

function renderJsonLine(line: string) {
  const tokenPattern =
    /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?/g
  const pieces: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = tokenPattern.exec(line)) !== null) {
    const token = match[0]

    if (match.index > cursor) {
      pieces.push(
        <span key={`plain-${cursor}`}>{line.slice(cursor, match.index)}</span>,
      )
    }

    pieces.push(
      <span
        key={`token-${match.index}`}
        className={`workspace-file-preview__json-${getJsonTokenClass(
          token,
          line.slice(match.index + token.length),
        )}`}
      >
        {token}
      </span>,
    )
    cursor = match.index + token.length
  }

  if (cursor < line.length) {
    pieces.push(<span key={`plain-${cursor}`}>{line.slice(cursor)}</span>)
  }

  return pieces
}

function getJsonTokenClass(token: string, restOfLine: string) {
  if (token.startsWith('"') && restOfLine.trimStart().startsWith(':')) {
    return 'key'
  }

  if (token.startsWith('"')) {
    return 'string'
  }

  if (token === 'true' || token === 'false') {
    return 'boolean'
  }

  if (token === 'null') {
    return 'null'
  }

  return 'number'
}

export default WorkspaceSideWindow
