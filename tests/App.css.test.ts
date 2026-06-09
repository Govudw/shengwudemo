import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

function getRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = appCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  expect(match, `CSS rule ${selector}`).not.toBeNull()
  return match?.[1] ?? ''
}

describe('ELN document layout CSS', () => {
  it('keeps the document page rail independent from the outline panel', () => {
    const expandedBrowserRule = getRule(
      '.workspace-file-browser--with-outline.workspace-file-browser--outline-expanded',
    )
    const expandedOutlineRule = getRule('.workspace-file-outline--expanded')

    expect(expandedBrowserRule).toContain(
      'grid-template-columns: minmax(0, 1fr);',
    )
    expect(expandedBrowserRule).not.toContain('240px')
    expect(expandedOutlineRule).toContain('position: absolute;')
    expect(expandedOutlineRule).toContain('width: 240px;')
  })

  it('matches Feishu document rail width in maximized ELN mode', () => {
    const maximizedEditorRule = getRule(
      '.thread-workspace--side-window-maximized .workspace-file-preview__eln-editor',
    )

    expect(maximizedEditorRule).toContain(
      '--eln-page-width: clamp(720px, calc(100vw - 692px), 1120px);',
    )
    expect(maximizedEditorRule).toContain('width: min(var(--eln-page-width), calc(100% - 48px));')
    expect(maximizedEditorRule).toContain(
      'margin-left: max(24px, calc((100vw - var(--eln-page-width)) / 2 - 64px));',
    )
    expect(maximizedEditorRule).toContain('margin-right: auto;')
  })

  it('renders the signature block as an amber highlighted document block', () => {
    const signatureRule = getRule('.workspace-file-preview__eln-signature-block')
    const signatureHoverRule = getRule(
      '.workspace-file-preview__eln-signature-block:hover,\n.workspace-file-preview__eln-signature-block:focus-within',
    )

    expect(signatureRule).toContain('border-color: #f1c24f;')
    expect(signatureRule).toContain('#fff8dc')
    expect(signatureRule).toContain('inset 3px 0 0 #f2b705')
    expect(signatureHoverRule).toContain('border-color: #d99a00;')
  })

  it('keeps the contextual insert plus outside the document text rail', () => {
    const sideWindowEditorRule = getRule(
      '.thread-workspace--side-window-open:not(.thread-workspace--side-window-maximized)\n  .workspace-file-preview__eln-editor',
    )
    const contextInsertRule = getRule('.workspace-file-preview__eln-context-insert')
    const insertMenuRule = getRule('.workspace-file-preview__eln-insert-menu')

    expect(sideWindowEditorRule).toContain('padding-left: 36px;')
    expect(contextInsertRule).toContain('left: -36px;')
    expect(contextInsertRule).toContain('width: 36px;')
    expect(contextInsertRule).toContain('justify-items: start;')
    expect(contextInsertRule).toContain('z-index: 70;')
    expect(insertMenuRule).toContain('left: -254px;')
    expect(insertMenuRule).toContain('z-index: 71;')
    expect(insertMenuRule).toContain('width: min(240px, calc(100% - 32px));')
  })

  it('does not let the collapsed sidebar rail intercept document insert controls', () => {
    const collapsedSidebarRule = getRule('.sidebar--collapsed')
    const collapseButtonRule = getRule('.sidebar__collapse-button')
    const sidebarRailRule = getRule('.sidebar__rail')
    const sidebarRailButtonRule = getRule('.sidebar__rail-button')
    const recentPopoverRule = getRule('.sidebar__recent-conversation-popover')

    expect(collapsedSidebarRule).toContain('pointer-events: none;')
    expect(collapseButtonRule).toContain('pointer-events: auto;')
    expect(sidebarRailRule).toContain('pointer-events: none;')
    expect(sidebarRailButtonRule).toContain('pointer-events: auto;')
    expect(recentPopoverRule).toContain('pointer-events: auto;')
  })
})

describe('Top navigation layering CSS', () => {
  it('keeps account dropdown above workspace chrome', () => {
    const topNavRule = getRule('.top-nav')
    const accountMenuRule = getRule('.top-nav__account-menu')

    expect(topNavRule).toContain('position: relative;')
    expect(topNavRule).toContain('z-index: 90;')
    expect(accountMenuRule).toContain('z-index: 91;')
  })
})

describe('Commodity detail CSS', () => {
  it('allows the cost and discount table to scroll horizontally', () => {
    const wideTableWrapRule = getRule('.commodity-detail__wide-table-wrap')
    const costTableRule = getRule('.commodity-detail__cost-table')

    expect(wideTableWrapRule).toContain('overflow-x: auto;')
    expect(costTableRule).toContain('min-width: 1680px;')
  })
})
