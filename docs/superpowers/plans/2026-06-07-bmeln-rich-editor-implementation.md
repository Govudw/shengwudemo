# BioMap ELN Rich Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full P0/P1 `.bmeln` ELN rich-document editor described in `docs/superpowers/specs/2026-06-07-lims-eln-rich-document-design.md`.

**Architecture:** Keep the standard Workspace Side Window file framework. Treat `.bmeln` as a BioMap Agent ELN Project File whose `previewKind` is still the semantic `eln`. Split the implementation into data/schema, editor extensions/block views, editor shell/interactions, and Workspace Side Window integration.

**Tech Stack:** React 19, TypeScript, Tiptap v3, ECharts, Vitest + happy-dom, existing CSS in `src/App.css`.

---

## File Structure

- Modify `package.json` and `package-lock.json` to add official Tiptap extensions for table, table row/cell/header, image if needed, and placeholder if needed.
- Modify `src/data/conversationTypes.ts` so Project File blocks can display `bmeln`.
- Modify `src/data/enzymeSynthesisOpsMockData.ts` and tests to migrate the current ELN file from `.eln` to `.bmeln` without changing Thread turn order.
- Modify `src/data/workspaceSideWindowMockData.ts` and tests to define `.bmeln` format metadata, richer ELN document content, image/chart/signature/attachment blocks, and extension recognition.
- Create `src/components/eln/ElnEditorExtensions.tsx` for Tiptap custom nodes and NodeViews.
- Create `src/components/eln/ElnEditorBlocks.tsx` for Image, Chart, Signature, Attachment and common block shell UI.
- Create `src/components/eln/elnDocumentModel.ts` for outline extraction, character counting, insertion templates and helpers.
- Replace `src/components/ElnEditorPreview.tsx` with an editor shell that uses the new helpers and block views.
- Modify `src/components/WorkspaceSideWindow.tsx` to pass `maximized`, coordinate Document Outline with Object Storage file tree, and keep `.bmeln` file opening behavior.
- Modify `src/App.css` for document-like ELN layout, outline, toolbar, slash menu, plus button, blocks, modal, table and responsive states.
- Add or update tests in `src/data/workspaceSideWindowMockData.test.ts`, `src/data/enzymeSynthesisOpsMockData.test.ts`, `src/components/ThreadWorkspace.test.tsx`, and `src/components/ElnEditorPreview.test.tsx`.

---

### Task 1: `.bmeln` Data Model And Mock Entry

**Files:**
- Modify: `src/data/conversationTypes.ts`
- Modify: `src/data/enzymeSynthesisOpsMockData.ts`
- Modify: `src/data/enzymeSynthesisOpsMockData.test.ts`
- Modify: `src/data/workspaceSideWindowMockData.ts`
- Modify: `src/data/workspaceSideWindowMockData.test.ts`

- [ ] **Step 1: Write failing data tests**

Update `src/data/workspaceSideWindowMockData.test.ts` so the extension test expects `getPreviewKindByExtension('bmeln')` to return `eln`, and the LIMS ELN test expects:

```ts
const eln = files.find(
  (file) => file.fileName === 'RUN-ENZ-SYN-20260604-001_experiment_record.bmeln',
)

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
```

Also assert the document content includes node types `elnImageBlock`, `elnChartBlock`, `elnSignatureBlock`, `elnAttachmentBlock`, `table`, and a H1 text `酶合成实验记录`.

Update `src/data/enzymeSynthesisOpsMockData.test.ts` so Thread project files and Run Inspector output expect `.bmeln`, and no longer expect `.eln`.

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npx vitest run src/data/workspaceSideWindowMockData.test.ts src/data/enzymeSynthesisOpsMockData.test.ts
```

Expected: FAIL because `bmeln` is unsupported and mock data still uses `.eln` / old ELN schema.

- [ ] **Step 3: Implement minimal data changes**

Change `ProjectFileBlock.fileKind` to include `'bmeln'`. Keep `SideWindowFilePreviewKind` as `'eln'`.

Change `SideWindowElnDocument` to include:

```ts
formatVersion: 'bmeln.v1'
revision: number
document: {
  type: 'doc'
  content: Array<Record<string, unknown>>
}
```

Keep any old fields only if implementation still needs them; the editor should not display old product header/meta/section cards.

Update the LIMS mock ELN file name and same-name references to `.bmeln`, including Run Inspector output, Thread text, ProjectFile block, Object Storage seed, and ELN body object links. Do not reorder or rewrite the Thread narrative except replacing the file extension and same-name references.

Build the richer document with:

- H1 `酶合成实验记录`
- 12 main chapters
- at least 8 table nodes
- at least 4 `elnImageBlock` nodes
- at least 6 `elnChartBlock` nodes
- at least 4 `elnSignatureBlock` nodes
- `elnAttachmentBlock` nodes for work orders, callbacks, result data and approval artifacts

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
npx vitest run src/data/workspaceSideWindowMockData.test.ts src/data/enzymeSynthesisOpsMockData.test.ts
```

Expected: PASS.

---

### Task 2: Tiptap Rich Block Extensions And Block Components

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/eln/ElnEditorBlocks.tsx`
- Create: `src/components/eln/ElnEditorExtensions.tsx`
- Create: `src/components/eln/elnDocumentModel.ts`
- Add tests: `src/components/ElnEditorPreview.test.tsx`

- [ ] **Step 1: Install Tiptap table dependencies**

Run:

```bash
npm install @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-placeholder
```

- [ ] **Step 2: Write failing rich block tests**

Create `src/components/ElnEditorPreview.test.tsx` using the existing happy-dom pattern. Render `ElnEditorPreview` with the LIMS `.bmeln` `SideWindowFileAsset`.

Assert:

- `.workspace-file-preview__eln-header`, `.workspace-file-preview__eln-meta`, and `.workspace-file-preview__eln-sections` are absent.
- `.workspace-file-preview__eln-image-block` exists and shows image caption and source.
- `.workspace-file-preview__eln-chart-block` exists and shows chart title, source and update time.
- `.workspace-file-preview__eln-signature-block` exists and shows signer/status/time.
- `.workspace-file-preview__eln-attachment-block` exists and shows file name/path/summary.
- Tables render inside `.workspace-file-preview__eln-table-scroll`.

- [ ] **Step 3: Run test to verify RED**

Run:

```bash
npx vitest run src/components/ElnEditorPreview.test.tsx
```

Expected: FAIL because the custom blocks and new editor shell are not implemented.

- [ ] **Step 4: Implement block components and Tiptap extensions**

Create custom Tiptap node extensions:

- `elnImageBlock`
- `elnChartBlock`
- `elnSignatureBlock`
- `elnAttachmentBlock`
- `elnCalloutBlock` if needed for prompt/deviation blocks

Each extension should parse/render attrs and use `ReactNodeViewRenderer`.

Implement `ElnImageBlockView`, `ElnChartBlockView`, `ElnSignatureBlockView`, and `ElnAttachmentBlockView` in `ElnEditorBlocks.tsx`. Reuse `echarts` directly or the existing ECharts pattern. The chart block must render an ECharts container plus readable fallback labels for tests.

Implement helpers in `elnDocumentModel.ts`:

- `countElnDocumentCharacters`
- `extractDocumentOutline`
- `getDefaultElnDocument`
- `getInsertableBlockTemplates`
- `buildDefaultTableNode`
- `buildDefaultChartNode`
- `buildDefaultSignatureNode`
- `buildDefaultImageNode`
- `buildDefaultAttachmentNode`

- [ ] **Step 5: Run test to verify GREEN**

Run:

```bash
npx vitest run src/components/ElnEditorPreview.test.tsx
```

Expected: PASS.

---

### Task 3: Editor Shell, Toolbar, Slash Menu, Plus Button, Undo And Image Modal

**Files:**
- Modify: `src/components/ElnEditorPreview.tsx`
- Modify: `src/components/eln/ElnEditorBlocks.tsx`
- Modify: `src/components/eln/elnDocumentModel.ts`
- Modify: `src/components/ElnEditorPreview.test.tsx`

- [ ] **Step 1: Write failing interaction tests**

Extend `src/components/ElnEditorPreview.test.tsx` to assert:

- toolbar shows `正文`, `H1`, `H2`, `H3`, `加粗`, `列表`, `表格`
- empty paragraph placeholder text is `输入 / 插入内容`
- typing `/` opens a slash menu with `普通表格`, `图片块`, `Chart Block`, `Signature Block`, `附件引用块`
- keyboard down/enter inserts the selected block
- line-start `+` button opens the same insert menu
- clicking image opens a large image viewer and closing it does not set dirty state
- clicking Signature Block toggles details
- block menu exposes `查看详情`, `复制块信息`, `删除块`
- deleting a special block can be undone with `Cmd/Ctrl+Z`

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
npx vitest run src/components/ElnEditorPreview.test.tsx
```

Expected: FAIL because interactions are not implemented.

- [ ] **Step 3: Implement editor shell and interactions**

Replace the old ELN product header/meta/sections UI with a document shell:

- outer save state badge only if standard frame needs it; no internal ELN product header
- top light toolbar
- `EditorContent`
- slash menu
- line-start plus insert button
- large image viewer
- selection floating menu if practical

Register `StarterKit`, `Placeholder`, `Table`, `TableRow`, `TableHeader`, `TableCell`, and custom ELN extensions.

Implement:

- no autofocus on open
- on update set save state to `有未保存编辑`
- toolbar commands for paragraph/H1/H2/H3/bold/list/table
- slash menu open on `/`
- slash keyboard controls
- same insert menu for plus button
- table insertion as 3x3
- add row/delete row controls for selected table
- undo/redo through Tiptap history
- read-only attrs shown in block details, not editable through content

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
npx vitest run src/components/ElnEditorPreview.test.tsx
```

Expected: PASS.

---

### Task 4: Workspace Side Window Outline Integration

**Files:**
- Modify: `src/components/WorkspaceSideWindow.tsx`
- Modify: `src/components/ElnEditorPreview.tsx`
- Modify: `src/components/ThreadWorkspace.test.tsx`

- [ ] **Step 1: Write failing side-window tests**

Update and add tests in `src/components/ThreadWorkspace.test.tsx`:

- clicking `RUN-ENZ-SYN-20260604-001_experiment_record.bmeln` opens the ELN editor
- path is `Enzyme Synthesis Ops / RUN-ENZ-SYN-20260604-001_experiment_record.bmeln`
- Object Storage file tree is collapsed when the `.bmeln` file opens
- non-maximized editor shows a collapsed Document Outline rail
- maximized editor shows expanded Document Outline with H1-H6 items
- expanding Object Storage file tree collapses Document Outline
- expanding Document Outline keeps Object Storage file tree collapsed

- [ ] **Step 2: Run test to verify RED**

Run:

```bash
npx vitest run src/components/ThreadWorkspace.test.tsx -t "ELN"
```

Expected: FAIL because Document Outline integration is missing and filename is still old in the component tests.

- [ ] **Step 3: Implement side-window outline state**

Add state for ELN outline expansion inside `WorkspaceFileBrowser` or pass callbacks into `ElnEditorPreview`.

Rules:

- non-maximized Workspace Side Window: Document Outline default collapsed
- maximized Workspace Side Window: Document Outline default expanded
- opening `.bmeln`: Object Storage file tree collapsed
- Document Outline and Object Storage file tree never expanded together
- Document Outline generated from headings only; no block entries
- Outline click scrolls to heading
- heading edits refresh outline

- [ ] **Step 4: Run test to verify GREEN**

Run:

```bash
npx vitest run src/components/ThreadWorkspace.test.tsx -t "ELN"
```

Expected: PASS.

---

### Task 5: Styling, Responsive Polish And Full Verification

**Files:**
- Modify: `src/App.css`
- Modify tests as needed

- [ ] **Step 1: Write or update style-sensitive tests**

Add assertions where feasible:

- old internal ELN header/meta/sections selectors absent
- toolbar, outline rail, image modal, chart block, signature block and table scroll selectors present
- narrow state uses collapsed outline class
- maximized state uses expanded outline class

- [ ] **Step 2: Implement CSS**

Update `src/App.css` so the ELN editor reads like a document:

- no internal product header
- centered readable document body
- light top toolbar
- collapsed/expanded outline
- hover block handles
- slash/plus menus
- responsive chart and image blocks
- large image viewer
- signature line block
- attachment block
- table horizontal scroll

- [ ] **Step 3: Run targeted tests**

Run:

```bash
npx vitest run src/data/workspaceSideWindowMockData.test.ts src/data/enzymeSynthesisOpsMockData.test.ts src/components/ElnEditorPreview.test.tsx src/components/ThreadWorkspace.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: all commands exit 0. Build may keep the existing large chunk warning.

