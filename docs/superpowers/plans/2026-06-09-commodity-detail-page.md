# Commodity Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a read-only commodity detail page with overview, billing items, cost/discount, and version history tabs.

**Architecture:** Keep the product management shell in `ProductManagementPlatformPage`, add route-aware selected commodity state, and move mock product data into a sibling data module so list and detail views share one source of truth.

**Tech Stack:** React, TypeScript, Vitest, happy-dom, CSS in `src/App.css`.

---

### Task 1: Route And Detail Entry

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`

- [ ] Write failing tests for direct detail URL and clicking a commodity name from the list.
- [ ] Run `npm test -- src/App.test.tsx src/components/product-management/ProductManagementPlatformPage.test.tsx` and confirm the new tests fail because the detail route and entry do not exist.
- [ ] Implement route parsing for `/product-management-platform/commodities/:commodityId`.
- [ ] Render the commodity detail page when a commodity is selected.
- [ ] Run the same test command and confirm the route and entry tests pass.

### Task 2: Shared Mock Data

**Files:**
- Create: `src/components/product-management/productManagementMockData.ts`
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`

- [ ] Write failing tests for SaaS billing item rows, BioMap Agent-specific billing items, and commodity overview fields.
- [ ] Extract commodity records and detail generation into `productManagementMockData.ts`.
- [ ] Add overview fields, billing items, cost discount rows, and version history rows for each commodity.
- [ ] Run `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx` and confirm the tests pass.

### Task 3: Read-Only Detail Tabs

**Files:**
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`

- [ ] Write failing tests for the four tabs: 商品概览, 计费项, 成本与折扣, 商品版本记录.
- [ ] Implement local detail tab state and read-only rendering for each tab.
- [ ] Add billing item filters for type, payment type, and search.
- [ ] Ensure detail tab tables have no新增、编辑、删除操作.
- [ ] Run `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx` and confirm the tests pass.

### Task 4: Styling And Verification

**Files:**
- Modify: `src/App.css`
- Test: `tests/App.css.test.ts`

- [ ] Write or update CSS tests for horizontal scrolling in the cost table.
- [ ] Add detail header, tabs, overview grid, table, and wide-table styles.
- [ ] Run `npm test -- tests/App.css.test.ts src/components/product-management/ProductManagementPlatformPage.test.tsx`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run build`.
- [ ] Open `http://127.0.0.1:5174/product-management-platform` and verify list-to-detail navigation visually.
