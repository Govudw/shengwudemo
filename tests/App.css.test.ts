import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const appCss = readFileSync(new URL('../src/App.css', import.meta.url), 'utf8')

function getRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = appCss.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`))

  expect(match, `CSS rule ${selector}`).not.toBeNull()
  return match?.[1] ?? ''
}

function getLastRule(selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = Array.from(
    appCss.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g')),
  )

  expect(matches.length, `CSS rule ${selector}`).toBeGreaterThan(0)
  return matches.at(-1)?.[1] ?? ''
}

function getMediaRule(mediaQuery: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const rulePattern = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`)
  let mediaIndex = appCss.indexOf(mediaQuery)

  while (mediaIndex !== -1) {
    const mediaEnd = appCss.indexOf('\n@media', mediaIndex + mediaQuery.length)
    const mediaBlock =
      mediaEnd === -1 ? appCss.slice(mediaIndex) : appCss.slice(mediaIndex, mediaEnd)
    const match = mediaBlock.match(rulePattern)

    if (match) {
      return match[1]
    }

    mediaIndex = appCss.indexOf(mediaQuery, mediaIndex + mediaQuery.length)
  }

  expect(null, `CSS rule ${selector} in ${mediaQuery}`).not.toBeNull()
  return ''
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

describe('Approval Center CSS', () => {
  it('fits below the fixed-height top navigation without clipping its scroll area', () => {
    const approvalCenterRule = getRule('.approval-center')
    const approvalMenuRule = getRule('.approval-center__menu')

    expect(approvalCenterRule).toContain('height: calc(100svh - 48px);')
    expect(approvalCenterRule).not.toContain('height: 100%;')
    expect(approvalMenuRule).toContain('overflow-y: auto;')
  })

  it('keeps Approval Center usable on narrow viewports', () => {
    expect(appCss).toContain('@media (max-width: 720px)')
    expect(appCss).toContain('grid-template-columns: 1fr;')
    expect(appCss).toContain('grid-template-rows: auto minmax(0, 1fr);')
    expect(appCss).toContain('overflow-x: auto;')
  })
})

describe('Notification Center CSS', () => {
  it('fits below the fixed-height top navigation so its table can scroll', () => {
    const notificationPageRule = getRule('.notification-center-page')
    const tableShellRule = getRule('.notification-page-table-shell')

    expect(notificationPageRule).toContain('height: calc(100svh - 48px);')
    expect(notificationPageRule).not.toContain('height: 100%;')
    expect(tableShellRule).toContain('overflow: auto;')
  })
})

describe('Billing Center CSS', () => {
  it('prevents the service tables from creating page-level horizontal scroll', () => {
    const pageRule = getRule('.billing-center-page')
    const mainPanelRule = getRule('.billing-center-main-panel')
    const tableWrapRule = getRule('.billing-center-table-wrap')
    const tableRule = getRule('.billing-center-table')
    const actionsRule = getRule('.billing-center-actions')

    expect(pageRule).toContain('overflow-x: clip;')
    expect(mainPanelRule).toContain('overflow-x: hidden;')
    expect(tableWrapRule).toContain('overflow-x: hidden;')
    expect(tableRule).toContain('min-width: 0;')
    expect(tableRule).toContain('table-layout: fixed;')
    expect(actionsRule).toContain('min-width: 0;')
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

describe('Home template section CSS', () => {
  it('keeps the Home control bar sticky and results independently scrollable on desktop', () => {
    const sectionRule = getRule('.template-section')
    const controlBarRule = getRule('.home-control-bar')
    const resultsRule = getRule('.template-section__results')
    const paginationRule = getRule('.template-section__pagination')

    expect(sectionRule).toContain('height: min(980px, calc(100svh - 96px));')
    expect(sectionRule).toContain('overflow: visible;')
    expect(sectionRule).toContain('margin-top: 6px;')
    expect(controlBarRule).toContain('position: sticky;')
    expect(controlBarRule).toContain('top: 8px;')
    expect(controlBarRule).toContain('z-index: 4;')
    expect(controlBarRule).toContain('margin-bottom: 0;')
    expect(resultsRule).toContain('flex: 1 1 auto;')
    expect(resultsRule).toContain('overflow-y: auto;')
    expect(resultsRule).toContain('min-height: 0;')
    expect(paginationRule).toContain('position: sticky;')
    expect(paginationRule).toContain('bottom: 0;')
  })

  it('keeps the homepage bottom gap compact below template pagination', () => {
    const workspaceInnerRule = getRule('.workspace-inner')

    expect(workspaceInnerRule).toContain(
      'padding: clamp(88px, 10svh, 112px) 40px 32px;',
    )
  })

  it('uses compact cards and compact filter controls', () => {
    const gridRule = getRule('.template-section__grid')
    const cardRule = getLastRule('.template-card')
    const controlBarRule = getRule('.home-control-bar')
    const templateControlsRule = getRule('.home-template-controls')
    const filterStripRule = getRule('.home-template-controls__filter-strip')
    const nowrapFilterGroupRule = getRule(
      '.home-template-controls__filter-strip > .template-section__filter-group',
    )
    const filterGroupRule = getRule('\n.template-section__filter-group')
    const advancedControlRule = getRule('.home-template-controls__advanced')
    const advancedToggleRule = getRule(
      '.home-template-controls__advanced-toggle',
    )
    const advancedPanelRule = getRule('.home-template-controls__popover')
    const advancedLabelRule = getRule('.home-template-controls__popover-label')
    const searchRule = getRule('.home-template-controls__search')
    const filterRule = getRule('.template-section__filter')
    const selectedFilterRule = getRule('.template-section__filter--selected')
    const tagRule = getRule('.template-card__tag')
    const cyanTagRule = getRule('.template-card__tag--cyan')
    const amberTagRule = getRule('.template-card__tag--amber')

    expect(gridRule).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));')
    expect(gridRule).toContain('gap: 10px;')
    expect(cardRule).toContain('min-height: 154px;')
    expect(cardRule).toContain('padding: 12px;')
    expect(controlBarRule).toContain('display: flex;')
    expect(controlBarRule).toContain('padding: 0;')
    expect(controlBarRule).toContain('border: 0;')
    expect(controlBarRule).toContain('background: transparent;')
    expect(controlBarRule).toContain('box-shadow: none;')
    expect(templateControlsRule).toContain('flex: 1 1 auto;')
    expect(templateControlsRule).toContain('padding: 3px 4px;')
    expect(templateControlsRule).toContain('border: 1px solid rgba(203, 216, 227, 0.62);')
    expect(templateControlsRule).toContain('border-radius: 8px;')
    expect(filterStripRule).toContain('overflow-x: auto;')
    expect(nowrapFilterGroupRule).toContain('flex-wrap: nowrap;')
    expect(filterGroupRule).toContain('padding: 2px;')
    expect(filterGroupRule).toContain('border: 1px solid rgba(203, 216, 227, 0.62);')
    expect(filterGroupRule).toContain('background: #f6f9fb;')
    expect(advancedControlRule).toContain('position: relative;')
    expect(advancedToggleRule).toContain('height: 28px;')
    expect(advancedToggleRule).toContain('white-space: nowrap;')
    expect(advancedPanelRule).toContain('position: absolute;')
    expect(advancedPanelRule).toContain('display: grid;')
    expect(advancedLabelRule).toContain('font-size: 12px;')
    expect(searchRule).toContain('flex: 0 0 108px;')
    expect(searchRule).toContain('min-width: 108px;')
    expect(searchRule).toContain('max-width: 126px;')
    expect(filterRule).toContain('min-height: 24px;')
    expect(filterRule).toContain('border: 0;')
    expect(filterRule).toContain('border-radius: 6px;')
    expect(filterRule).toContain('font-size: 12px;')
    expect(selectedFilterRule).toContain('background: var(--surface);')
    expect(selectedFilterRule).toContain(
      'box-shadow: 0 1px 2px rgba(16, 35, 63, 0.08);',
    )
    expect(tagRule).toContain('border: 1px solid transparent;')
    expect(cyanTagRule).toContain('background: #e8f8fb;')
    expect(amberTagRule).toContain('background: #fff4d8;')
  })

  it('lets mobile use normal page scrolling instead of nested template scrolling', () => {
    const mobileSectionRule = getMediaRule(
      '@media (max-width: 760px)',
      '.template-section',
    )
    const mobileControlBarRule = getMediaRule(
      '@media (max-width: 760px)',
      '.home-control-bar',
    )
    const mobileResultsRule = getMediaRule(
      '@media (max-width: 760px)',
      '.template-section__results',
    )

    expect(mobileSectionRule).toContain('max-height: none;')
    expect(mobileSectionRule).toContain('height: auto;')
    expect(mobileSectionRule).toContain('overflow: visible;')
    expect(mobileControlBarRule).toContain('position: static;')
    expect(mobileResultsRule).toContain('overflow-y: visible;')
  })
})
