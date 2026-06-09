# Product Management Platform Shell Design

## Goal

Build a DEMO-level shell for the 产品商品管理系统, exposed as 产品管理平台 from the existing top-right account dropdown. The work should show the correct entry point, independent full-screen page structure, and URL routing without implementing product, commodity, or cost management content.

## Entry Point

The existing top-right user button in `TopNav` becomes an account dropdown. Its options are:

- 系统设置
- 费用中心
- 权限与安全
- 产品管理平台

Only 产品管理平台 is functional in this iteration. Clicking it navigates to the product management platform route. The other three options close the dropdown and show the existing toast-style unavailable message.

## Routing

Add a lightweight route for the new page without introducing a router dependency.

- Product management platform URL: `/product-management-platform`
- Existing application URL: `/`
- App startup reads `window.location.pathname`.
- Direct visits to `/product-management-platform` render the product management platform shell.
- In-app navigation uses `window.history.pushState`.
- Browser back/forward is handled through `popstate`.

Vite fallback behavior is sufficient for local development and DEMO usage. The implementation should keep the route handling small and local to `App` unless a broader routing need emerges later.

## Product Management Platform Page

The route renders an independent full-screen page rather than the current Workspace/Projects/Assets shell.

Top area:

- Left: the same BioMap Agent logo asset used by the current homepage.
- Center/left navigation tabs:
  - 产品管理
  - 商品管理
  - 成本管理
- Default active tab: 产品管理.
- The page should feel like a management system surface, not a marketing page.

Body structure for every tab:

- Left navigation column.
- Main content canvas.
- No left navigation menu items yet.
- No business content yet.
- The empty regions should be visibly structured enough to communicate the future layout, but should not introduce placeholder menus, cards, tables, or fake product data.

Tab behavior:

- Clicking a tab switches the active tab locally.
- All three tabs share the same empty left-nav + main-canvas shell in this iteration.
- The URL does not need per-tab route segments yet.

## Visual Direction

Use the existing application design language: restrained, operational, and work-focused. Reuse existing colors, lines, spacing, and button treatment where practical. The product platform shell should be full-screen and dense enough for an enterprise management system, with no hero layout or decorative marketing treatment.

## State And Data

No persistent product management data is required.

Local UI state:

- Account dropdown open/closed state in `TopNav`.
- Active product platform tab in the new page component.
- App-level route state derived from the browser pathname.

No changes are required to existing demo store data for product, commodity, or cost management.

## Components

Expected implementation shape:

- Modify `src/components/TopNav.tsx` to render the account dropdown and expose menu selection callbacks.
- Modify `src/App.tsx` to handle the lightweight route and render the new page at `/product-management-platform`.
- Create `src/components/product-management/ProductManagementPlatformPage.tsx` for the independent page shell.
- Add scoped CSS selectors in `src/App.css`, following the existing single stylesheet pattern.
- Add focused tests for dropdown options, route navigation, direct route rendering, and tab switching.

## Non-Goals

- Do not implement product, commodity, or cost management menus.
- Do not add fake product tables, dashboard cards, metrics, filters, or forms.
- Do not connect APIs or persistence.
- Do not add a full router dependency.
- Do not change behavior of Workspace, Projects, Assets, or Capabilities except for route handling needed to preserve `/`.

## Verification

Run:

- `npm test`
- `npm run build`

Manual visual check:

- Open `/`.
- Open the account dropdown and verify all four Chinese options appear.
- Click 产品管理平台 and verify the URL becomes `/product-management-platform`.
- Verify the product platform page is full-screen, has the logo, three tabs, an empty left nav column, and an empty main region.
- Verify browser back returns to `/`.
