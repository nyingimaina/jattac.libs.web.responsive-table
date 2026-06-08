# Recommendations and Pitfalls
## Best Practices, Anti-Patterns, and Module Compatibility

This document covers three topics: the known ESM/CJS module hazard with a peer dependency, general best practices for optimal usage, and anti-patterns to avoid.

---

[← Previous: Handling Interactive Elements](./handling-interactive-elements.md) | [Return to README →](../README.md)

---

## Table of Contents

- [ESM/CJS Module Compatibility](#esmcjs-module-compatibility)
  - [Root Cause](#root-cause)
  - [Symptoms](#symptoms)
  - [Consumer Workarounds](#consumer-workarounds)
  - [Planned Fix](#planned-fix)
- [Recommendations](#recommendations)
  - [Row Identity and State Stability](#1-row-identity-and-state-stability)
  - [Interactive Elements and Event Isolation](#2-interactive-elements-and-event-isolation)
  - [Expandable Rows](#3-expandable-rows)
  - [Theming and Visual Customization](#4-theming-and-visual-customization)
  - [Performance and Rendering](#5-performance-and-rendering)
  - [Data Fetching and Pagination](#6-data-fetching-and-pagination)
  - [Column Definitions](#7-column-definitions)
- [Pitfalls](#pitfalls)
  - [Chevron Transform Override](#1-chevron-transform-override)
  - [rowIndex as a Stable Identifier](#2-rowindex-as-a-stable-identifier)
  - [Missing rowIdKey on Sortable Tables](#3-missing-rowidkey-on-sortable-tables)
  - [Missing data-rt-ignore-row-click](#4-missing-data-rt-ignore-row-click)
  - [Non-null expandRowRenderer for Empty Detail](#5-non-null-expandrowrenderer-for-empty-detail)
  - [Heavy Computation in expandRowRenderer](#6-heavy-computation-in-expandrowrenderer)
  - [Inline Props Without useMemo](#7-inline-props-without-usememo)
  - [No Error Handling with dataSource](#8-no-error-handling-with-datasource)

---

## ESM/CJS Module Compatibility

### Root Cause

The peer dependency `jattac.libs.web.zest-textbox` is published with `"type": "module"` in its `package.json`. This tells Node.js to treat all `.js` files in the package as ES modules. However, the file referenced by the `"require"` export condition — `dist/index.js` — is CommonJS (uses `require()` calls, `module.exports`).

The conflict:
1. Consumer calls `require('jattac.libs.web.zest-textbox')`
2. Node.js resolves via `"exports": { "require": "./dist/index.js" }`
3. Root `package.json` has `"type": "module"` → Node.js parses `dist/index.js` as ESM
4. ESM does not support `require()` → error

### Symptoms

- **Next.js Pages Router:** `ERR_REQUIRE_ESM` at build or server start
- **Jest tests:** `Jest failed to parse a file` — the test runner cannot `require()` the ESM-marked file
- **Webpack 4 / Create React App:** Module parse failure — bundler cannot handle the unexpected ESM/CJS mismatch
- **Next.js App Router:** Usually unaffected because `import` resolves to the separate `.esm.js` bundle which is genuine ESM

### Consumer Workarounds

#### Next.js

**App Router (13+):** If you still see the error, add the package to `transpilePackages`:

```js
// next.config.js
module.exports = {
  transpilePackages: ['jattac.libs.web.zest-textbox'],
};
```

**Pages Router:** Force webpack to use the ESM entry:

```js
// next.config.js
const path = require('path');

module.exports = {
  webpack: (config) => {
    config.resolve.alias['jattac.libs.web.zest-textbox'] =
      path.resolve(__dirname, 'node_modules/jattac.libs.web.zest-textbox/dist/index.esm.js');
    return config;
  },
};
```

#### Jest

Add the package to `transformIgnorePatterns`:

```js
// jest.config.js
module.exports = {
  transformIgnorePatterns: [
    '/node_modules/(?!(jattac.libs.web.zest-textbox)/)',
  ],
};
```

#### Vite

```js
// vite.config.js
export default {
  optimizeDeps: {
    include: ['jattac.libs.web.zest-textbox'],
  },
};
```

### Planned Fix

The next release of `jattac.libs.web.zest-textbox` will remove the `"type": "module"` field. The `"exports"` map already correctly routes `require` → CJS (`dist/index.js`) and `import` → ESM (`dist/index.esm.js`), so the field is redundant and harmful.

---

## Recommendations

### 1. Row Identity and State Stability

**Always provide `selectionProps.rowIdKey`** when using expandable rows or selection on a table that supports sorting, filtering, or pagination. The key links a row's visual identity to a stable data field so that expand and selection states survive re-order operations.

```tsx
// Without rowIdKey: re-sort resets all expanded/selected rows
// With rowIdKey: "Order #1042" stays expanded wherever it moves
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    onSelectionChange: () => {},
  }}
  expandRowRenderer={(order) => <OrderLineItems orderId={order.id} />}
/>
```

Even if you do not need row selection, provide `selectionProps` solely to anchor expand state. The no-op `onSelectionChange` is harmless.

### 2. Interactive Elements and Event Isolation

When using `onRowClick`, always add `data-rt-ignore-row-click` to buttons, links, inputs, and any other interactive element inside a cell. The table uses an explicit opt-in contract rather than automatic detection because many UI libraries render with custom elements that are not standard `<button>` or `<a>` tags.

```tsx
const columns = [
  {
    displayLabel: 'Actions',
    cellRenderer: (row) => (
      <button data-rt-ignore-row-click onClick={() => deleteRow(row.id)}>
        Delete
      </button>
    ),
  },
];
```

The same attribute works on containers — any child click is ignored:

```tsx
<div data-rt-ignore-row-click>
  <MyCustomToggle value={row.flag} onChange={(v) => setFlag(row.id, v)} />
</div>
```

See the [Handling Interactive Elements](./handling-interactive-elements.md) guide for detailed scenarios.

### 3. Expandable Rows

- **Return `null` for rows with no detail content.** The toggle is completely absent — not hidden — for those rows. A visible chevron that opens an empty panel confuses users.
- **Keep `expandRowRenderer` lightweight.** It is called for every visible row on every render pass. Expensive work (data fetching, heavy computation) should live inside the detail component itself (which is lazy-mounted).
- **Use `expandChevronClassName` to customize the chevron.** Override `color`, `font-size`, etc. Never override `transform` or `transition` — these drive the collapse animation.
- **The chevron is keyboard-accessible.** It has `role="button"`, `tabIndex={0}`, and `aria-expanded`. Enter/Space toggle the panel — no additional configuration needed.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) =>
    order.lineItems.length > 0
      ? <OrderLineItems order={order} />
      : null
  }
  expandChevronClassName="my-chevron"
/>
```

### 4. Theming and Visual Customization

Override `--primary-color` at the `:root` level rather than targeting individual elements. The chevron, the expanded left-border indicator, selection highlights, focus rings, and the spinner all derive from this single variable.

```css
:root {
  --primary-color: #7c3aed; /* violet accent */
}
```

For per-component overrides, scope the variable to the table's container:

```css
.my-page .responsiveTable {
  --primary-color: #059669; /* emerald green */
}
```

### 5. Performance and Rendering

- **Memoize props passed to `ResponsiveTable`.** Arrays and objects created inline (`columnDefinitions={[...]}`, `animationProps={{...}}`) create new references on every render, triggering unnecessary downstream work.
- **Use `useTableContext` sparingly.** Custom components rendered inside the table should `useMemo` their outputs when deriving data from context.
- **Avoid large `data` arrays without pagination.** Client-side rendering of thousands of rows will degrade performance. Use `dataSource` for server-side pagination or implement windowing.
- **Keep per-row callbacks stable.** Functions passed inside `cellRenderer` that capture state should use `useCallback` to avoid re-creating React elements for every row.

### 6. Data Fetching and Pagination

- **Prefer `dataSource` over manual pagination.** The table handles page tracking, `hasMore` detection, loading states, and error recovery automatically.
- **Return `{ items, totalCount }`** from your `dataSource` function for accurate `hasMore` detection. A plain array is also supported but `hasMore` is inferred from `pageSize`.
- **Always provide `selectionProps.rowIdKey` with `dataSource`.** Without it, expand and selection states reset every time a new page loads because indices no longer match.
- **Handle errors.** Provide `onDataSourceError` to show user-facing error messages. The table has a built-in retry button when the initial load fails and no data is available.

### 7. Column Definitions

- **Use the function form** `(row) => IResponsiveTableColumnDefinition<TData>` when columns need row-dependent options (visibility, class names, or rendering logic that differs per row).
- **Use `getSortableValue` for sorting.** This tells the built-in sort plugin how to compare cells. Without it, sorting falls back to `displayLabel` comparison which is rarely correct.
- **Use `getFilterableValue` for client-side filtering.** Without it, the filter plugin skips the column entirely.

---

## Pitfalls

### 1. Chevron Transform Override

**Problem:** Applying `transform` or `transition` in `expandChevronClassName`. The collapse animation rotates the chevron from `-90deg` to `0deg` using these exact properties. Overriding them breaks the rotation.

**Fix:** Override only cosmetic properties — `color`, `font-size`, `opacity`, `margin`, etc.:

```css
/* Correct */
.myChevron {
  color: var(--brand-color);
  font-size: 1.5rem;
}

/* Wrong — breaks rotation */
.myChevron {
  transform: scale(1.5);
  transition: all 0.5s;
}
```

### 2. rowIndex as a Stable Identifier

**Problem:** Using `rowIndex` from `expandRowRenderer` or `cellRenderer` as a database key, cache key, or state identifier. `rowIndex` is the display-order position after sort and filter — it changes when the user re-orders or searches.

**Fix:** Use a stable field from the data object (`row.id`, `row.uuid`, etc.) for any cross-render correlation:

```tsx
// Wrong — breaks after re-sort
expandRowRenderer={(row, rowIndex) => (
  <DetailPanel row={row} cacheKey={rowIndex} />
)}

// Correct
expandRowRenderer={(row) => (
  <DetailPanel row={row} cacheKey={row.id} />
)}
```

### 3. Missing rowIdKey on Sortable Tables

**Problem:** Omitting `selectionProps.rowIdKey` on a table with sorting, filtering, or `dataSource`. Expand state and selection state are tracked by array index. When the user re-sorts, indices shift and all open panels close.

**Fix:** Always provide `selectionProps` with a `rowIdKey` pointing to a stable unique field. If selection is not needed, use a no-op handler:

```tsx
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    onSelectionChange: () => {},   // expand stability only
  }}
  expandRowRenderer={(row) => <Detail row={row} />}
/>
```

### 4. Missing data-rt-ignore-row-click

**Problem:** Clicking a button or link inside a data row also fires `onRowClick`. This causes navigation, modals, or other side effects to fire unintentionally when the user tries to interact with a cell-level control.

**Fix:** Add `data-rt-ignore-row-click` to every interactive element inside a cell row when `onRowClick` is active:

```tsx
<button data-rt-ignore-row-click onClick={...}>Edit</button>
<a data-rt-ignore-row-click href={`/detail/${row.id}`}>View</a>
```

### 5. Non-null expandRowRenderer for Empty Detail

**Problem:** The renderer always returns a `ReactNode` even when there is no meaningful detail content. Every row gets a toggle chevron, including rows where the panel would be empty or useless.

**Fix:** Return `null` for rows that have no detail content:

```tsx
expandRowRenderer={(order) =>
  order.lineItems.length > 0
    ? <LineItems items={order.lineItems} />
    : null   // ← no toggle for orders without line items
}
```

### 6. Heavy Computation in expandRowRenderer

**Problem:** Performing expensive operations inside `expandRowRenderer` — API calls, heavy transforms, large array traversals. The renderer runs for every visible row on every render pass (sort, filter, page change, state update).

**Fix:** Move expensive work into the detail component, which only mounts on first expand:

```tsx
// Wrong — fetch runs on every render for every row
expandRowRenderer={(row) => {
  const data = useExpensiveQuery(row.id);  // hooks in renderer is illegal anyway
  return <Detail data={data} />;
}}

// Correct — fetch runs once, on first expand
expandRowRenderer={(row) => <DetailPage rowId={row.id} />}

function DetailPage({ rowId }: { rowId: string }) {
  const { data } = useExpensiveQuery(rowId);  // lazy-mounted
  return <Detail data={data} />;
}
```

### 7. Inline Props Without useMemo

**Problem:** Passing arrays, objects, or callbacks as inline literals in JSX:

```tsx
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}   // if this is a new array each render...
  animationProps={{ animateOnLoad: true }}   // ...or this is a new object
/>
```

Each render creates new references. The table's comparison logic detects changes and triggers unnecessary re-computation and re-renders.

**Fix:** Define stable references:

```tsx
const columns = useMemo(() => [...], []);
const animProps = useMemo(() => ({ animateOnLoad: true }), []);

<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  animationProps={animProps}
/>
```

### 8. No Error Handling with dataSource

**Problem:** Using `dataSource` without listening for errors. If the fetch fails and there is already cached data, the table continues showing stale data silently. If the initial fetch fails with no cached data, the user sees an empty skeleton indefinitely.

**Fix:** Provide `onDataSourceError` for logging or toast notifications, and use the built-in retry button for initial load failures:

```tsx
<ResponsiveTable
  dataSource={fetchPage}
  columnDefinitions={columns}
  onDataSourceError={(error) => {
    console.error('Failed to fetch page:', error);
    toast.error('Could not load data. Please try again.');
  }}
/>
```

---

**Previous:** [Handling Interactive Elements](./handling-interactive-elements.md) | **Next:** [Return to README](../README.md)
