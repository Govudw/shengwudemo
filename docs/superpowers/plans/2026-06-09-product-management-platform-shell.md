# Product Management Platform Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a DEMO-level 产品管理平台 shell behind the top-right account dropdown, available at `/product-management-platform`.

**Architecture:** Keep routing local to `App` with browser history state and `popstate`. Extend `TopNav` to own its account dropdown and report selected dropdown actions to `App`. Add a focused `ProductManagementPlatformPage` component that renders a full-screen shell with logo, top tabs, an empty left nav column, and empty main canvas.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, happy-dom, existing app CSS.

---

## File Structure

- Modify `src/App.tsx`: add route state, navigation helpers, account menu action handling, and conditional render for `/product-management-platform`.
- Modify `src/components/TopNav.tsx`: add account dropdown markup and menu selection callback.
- Create `src/components/product-management/ProductManagementPlatformPage.tsx`: independent product platform shell and local tab state.
- Modify `src/App.css`: add account dropdown and product platform shell styles.
- Modify `src/App.test.tsx`: cover route navigation, direct route rendering, and browser back.
- Modify `src/components/TopNav.test.tsx`: cover dropdown options and selected menu callback.
- Add `src/components/product-management/ProductManagementPlatformPage.test.tsx`: cover default tab and tab switching.

### Task 1: Account Dropdown Contract

**Files:**
- Modify: `src/components/TopNav.test.tsx`
- Modify: `src/components/TopNav.tsx`

- [ ] **Step 1: Write the failing dropdown test**

```tsx
it('opens account menu options and reports selected account menu actions', () => {
  const onAccountMenuSelect = vi.fn()
  const { container, root } = renderTopNav({ onAccountMenuSelect })

  act(() => {
    getButton(container, 'zhengjun').click()
  })

  expect(getButton(container, '系统设置')).not.toBeNull()
  expect(getButton(container, '费用中心')).not.toBeNull()
  expect(getButton(container, '权限与安全')).not.toBeNull()
  expect(getButton(container, '产品管理平台')).not.toBeNull()

  act(() => {
    getButton(container, '产品管理平台').click()
  })

  expect(onAccountMenuSelect).toHaveBeenCalledWith('product-management-platform')
  expect(container.textContent).not.toContain('产品管理平台')

  root.unmount()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/TopNav.test.tsx`

Expected: FAIL because `onAccountMenuSelect` is not a `TopNav` prop and the account dropdown does not exist.

- [ ] **Step 3: Implement the dropdown minimally**

Add:

```tsx
export type AccountMenuItem =
  | 'system-settings'
  | 'billing-center'
  | 'permissions-security'
  | 'product-management-platform'
```

Extend `TopNavProps` with:

```tsx
onAccountMenuSelect: (item: AccountMenuItem) => void
```

Render four dropdown buttons from a static option list and call `onAccountMenuSelect(option.id)` when an option is selected.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/TopNav.test.tsx`

Expected: PASS.

### Task 2: Lightweight Route From Account Menu

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write failing route tests**

Add tests that:

```tsx
it('opens Product Management Platform from the account dropdown with a URL route', () => {
  window.history.replaceState(null, '', '/')
  const { container, root } = renderApp()

  act(() => {
    getButton(container, 'zhengjun').click()
  })
  act(() => {
    getButton(container, '产品管理平台').click()
  })

  expect(window.location.pathname).toBe('/product-management-platform')
  expect(container.querySelector('.product-platform-page')).not.toBeNull()
  expect(container.querySelector('.agent-shell')).toBeNull()

  root.unmount()
})

it('renders Product Management Platform on direct route visits', () => {
  window.history.replaceState(null, '', '/product-management-platform')
  const { container, root } = renderApp()

  expect(container.querySelector('.product-platform-page')).not.toBeNull()
  expect(container.textContent).toContain('产品管理')

  root.unmount()
})

it('returns to the main app when browser history goes back from Product Management Platform', () => {
  window.history.replaceState(null, '', '/')
  const { container, root } = renderApp()

  act(() => {
    getButton(container, 'zhengjun').click()
  })
  act(() => {
    getButton(container, '产品管理平台').click()
  })
  act(() => {
    window.history.back()
    window.dispatchEvent(new PopStateEvent('popstate'))
  })

  expect(window.location.pathname).toBe('/')
  expect(container.querySelector('.product-platform-page')).toBeNull()
  expect(container.querySelector('.agent-shell')).not.toBeNull()

  root.unmount()
})
```

- [ ] **Step 2: Run the route tests to verify they fail**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because the product route and page shell do not exist.

- [ ] **Step 3: Implement route state and account menu handling**

In `App`, add pathname state initialized from `window.location.pathname`, a `popstate` effect, a `navigateToPath` helper using `window.history.pushState`, and a `handleAccountMenuSelect` function. For non-product account menu items, call `showStatus`.

- [ ] **Step 4: Run the route tests to verify they pass**

Run: `npm test -- src/App.test.tsx`

Expected: PASS.

### Task 3: Product Platform Page Shell

**Files:**
- Create: `src/components/product-management/ProductManagementPlatformPage.tsx`
- Add: `src/components/product-management/ProductManagementPlatformPage.test.tsx`
- Modify: `src/App.css`

- [ ] **Step 1: Write the failing page component test**

```tsx
it('renders the product platform shell with 产品管理 selected by default', () => {
  const { container, root } = renderProductManagementPlatformPage()

  expect(container.querySelector('.product-platform-page')).not.toBeNull()
  expect(getButton(container, '产品管理').getAttribute('aria-selected')).toBe('true')
  expect(getButton(container, '商品管理').getAttribute('aria-selected')).toBe('false')
  expect(container.querySelector('.product-platform-sidebar')).not.toBeNull()
  expect(container.querySelector('.product-platform-canvas')).not.toBeNull()

  root.unmount()
})

it('switches the active top tab without adding left navigation content', () => {
  const { container, root } = renderProductManagementPlatformPage()

  act(() => {
    getButton(container, '成本管理').click()
  })

  expect(getButton(container, '成本管理').getAttribute('aria-selected')).toBe('true')
  expect(container.querySelector('.product-platform-sidebar')?.textContent).toBe('')

  root.unmount()
})
```

- [ ] **Step 2: Run the page test to verify it fails**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement page component and styles**

Create the component with three static tabs, default active tab `product`, same logo asset as `TopNav`, and empty `aside`/`section` body regions. Add responsive CSS in `App.css` for `.product-platform-*`.

- [ ] **Step 4: Run the page test to verify it passes**

Run: `npm test -- src/components/product-management/ProductManagementPlatformPage.test.tsx`

Expected: PASS.

### Task 4: Full Verification And Local Preview

**Files:**
- No additional files.

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: all test files pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Start local dev server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite reports a localhost URL.

- [ ] **Step 4: Browser verification**

Open the localhost URL, use the account dropdown, navigate to 产品管理平台, verify the URL route and empty full-screen shell.
