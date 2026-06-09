# Commodity Management Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DEMO 商品管理 module inside the existing 产品管理平台 shell, with a left menu, disabled 权限申请 entry, filter/search controls, and a commodity table.

**Architecture:** Keep the module local to `ProductManagementPlatformPage` because this is a DEMO with no shared data contract yet. Use static mock commodity records, local UI filter state, and the existing `onNotify` toast callback for edit/delete/disabled actions. Extend the existing `.product-platform-*` CSS namespace in `App.css`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, happy-dom, existing application CSS and icon components.

---

## File Structure

- Modify `src/components/product-management/ProductManagementPlatformPage.tsx`: add commodity tab sidebar, static commodity records, filtering/search, table rendering, disabled permission request menu, and action callbacks.
- Modify `src/components/product-management/ProductManagementPlatformPage.test.tsx`: cover commodity tab menu, disabled 权限申请, table columns/status/actions, status filter, product filter, owner filter, and search.
- Modify `src/App.tsx`: pass `showStatus` into `ProductManagementPlatformPage`.
- Modify `src/App.css`: style commodity sidebar menu, toolbar, search, selects, status pills, table, and compact action buttons.

### Task 1: Commodity Tab Structure

**Files:**
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`

- [ ] **Step 1: Write failing tests for the commodity tab sidebar**

Add tests that click the top 商品管理 tab and assert:

```tsx
expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe('true')
expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('商品管理')
expect(container.querySelector('.product-platform-sidebar')?.textContent).toContain('权限申请')
expect(getButton(container, '权限申请').getAttribute('aria-disabled')).toBe('true')
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: FAIL because the sidebar is still empty.

- [ ] **Step 3: Implement commodity sidebar**

Render two sidebar menu buttons only when the active top tab is `commodity`. The 商品管理 button is selected. The 权限申请 button is disabled with `aria-disabled="true"` and does not change views.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: PASS.

### Task 2: Commodity Table

**Files:**
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing tests for table columns, statuses, and action buttons**

Assert that the commodity tab contains column labels:

```tsx
商品名称
所属产品
商品负责人
更新时间
创建时间
状态
操作
```

Assert statuses include `未发布`, `已发布`, `下架中`, and `下架`. Assert each row exposes `编辑` and `删除` action buttons.

- [ ] **Step 2: Run the table tests to verify they fail**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: FAIL because no commodity table exists.

- [ ] **Step 3: Implement mock table**

Create local records with fields:

```ts
{
  id: string
  name: string
  product: string
  owner: string
  updatedAt: string
  createdAt: string
  status: '未发布' | '已发布' | '下架中' | '下架'
}
```

Render a table with the required columns and action buttons. Use `onNotify` for edit/delete button clicks.

- [ ] **Step 4: Run the table tests to verify they pass**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: PASS.

### Task 3: Filters And Search

**Files:**
- Modify: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write failing tests for filters and search**

Assert:

- `aria-label="筛选商品状态"` filters rows by status.
- `aria-label="筛选所属产品"` filters rows by product.
- `aria-label="筛选商品负责人"` filters rows by owner.
- `aria-label="搜索商品"` filters by commodity name, product, or owner.

- [ ] **Step 2: Run the filter tests to verify they fail**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: FAIL because filters do not exist.

- [ ] **Step 3: Implement filters and search**

Use controlled local state and derive visible records. Default filters are `all`; search trims and lowercases the input.

- [ ] **Step 4: Run the filter tests to verify they pass**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: PASS.

### Task 4: Verification

**Files:**
- No additional files.

- [ ] **Step 1: Run targeted tests**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx src/App.test.tsx`

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint`

Expected: PASS.

- [ ] **Step 4: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Refresh local preview**

Open `http://127.0.0.1:5174/product-management-platform`, switch to 商品管理, and verify the left menu and table.
