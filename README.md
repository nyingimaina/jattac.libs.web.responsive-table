# ResponsiveTable
## Enterprise-Grade React Data Grid Component

ResponsiveTable is a high-performance, type-safe React component designed for complex data visualization. It provides seamless layout transitions between desktop-optimized tabular displays and mobile-optimized card views, ensuring data integrity and accessibility across all device form factors.

## Core Capabilities
*   **Dynamic Layout Orchestration:** Automated transformation between standard table structures and mobile-optimized interfaces based on configurable breakpoints.
*   **Extensible Architecture:** A robust plugin system for implementing sorting, filtering, row selection, and asynchronous data fetching.
*   **Intelligent Layout Scaling:** Automated recalculation of footer colSpan ranges to maintain structural alignment when columns are programmatically excluded.
*   **Performance Optimized:** An atomized internal architecture that decouples state management from rendering, minimizing re-render cycles.
*   **Type Safety:** Comprehensive TypeScript definitions for predictable implementation and robust development workflows.

## Installation

```bash
npm install jattac.libs.web.responsive-table jattac.libs.web.zest-textbox react-icons
```

---

## Built-in Filter

Enable the search box with one prop. A clear (×) button appears automatically when the field has text.

**Client-side** — filters the in-memory `data` array and highlights matches:
```tsx
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  filterProps={{ showFilter: true }}
/>
```

**Server-side** — when `dataSource` is present, server mode is automatic. The table resets to page 1 and calls your fetch function with the current `filter` string on every change:
```tsx
<ResponsiveTable
  dataSource={async ({ page, pageSize, filter }) =>
    api.getUsers({ page, pageSize, search: filter })
  }
  columnDefinitions={columns}
  filterProps={{ showFilter: true }}
/>
```

> To force client-side filtering even with a `dataSource`, pass `mode: 'client'`.

---

## Delightful Data Fetching: Smart Data Source

The `dataSource` pattern makes handling large datasets, server-side sorting, filtering, and infinite scroll completely painless. You provide the fetch logic; the table handles bookkeeping.

### Pagination only
```tsx
<ResponsiveTable
  dataSource={async ({ page, pageSize }) => {
    const users = await api.getUsers({ page, pageSize });
    return users; // hasMore is auto-detected from page size
  }}
  columnDefinitions={columns}
/>
```

### Pagination + sorting + filtering
```tsx
<ResponsiveTable
  dataSource={async ({ page, pageSize, sort, filter }) =>
    api.getUsers({
      page,
      limit: pageSize,
      sortBy: sort?.columnId,
      order: sort?.direction,
      search: filter,
    })
  }
  columnDefinitions={columns}
  sortProps={{ initialSortColumn: 'name' }}
  filterProps={{ showFilter: true }}
/>
```

### With total count (accurate hasMore)
Return `{ items, totalCount }` instead of a plain array and the table derives `hasMore` precisely:
```tsx
dataSource={async ({ page, pageSize }) => {
  const { data, total } = await api.getUsers({ page, pageSize });
  return { items: data, totalCount: total };
}}
```

---

## Basic Implementation

The following example demonstrates a standard implementation of the ResponsiveTable component:

```tsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const data = [
  { id: 1, name: 'Administrative User' },
  { id: 2, name: 'Standard User' }
];

const columns = [
  { displayLabel: 'Identifier', cellRenderer: (row) => row.id },
  { displayLabel: 'User Name', cellRenderer: (row) => row.name },
];

const App = () => (
  <ResponsiveTable 
    data={data} 
    columnDefinitions={columns} 
  />
);
```

---

## Handling Interactive Elements

When using the `onRowClick` prop, clicking any element within a row will trigger the callback. To prevent this when clicking buttons or other interactive elements, use the `data-rt-ignore-row-click` attribute.

```tsx
const columns = [
  {
    displayLabel: 'Actions',
    cellRenderer: (row) => (
      <button 
        data-rt-ignore-row-click 
        onClick={() => handleDelete(row.id)}
      >
        Delete
      </button>
    )
  }
];
```

For a deep dive into more complex scenarios, see the **[Handling Interactive Elements Guide](./docs/handling-interactive-elements.md)**.

---

## Expandable Rows

Pass `expandRowRenderer` to reveal arbitrary content below any row. Each expandable row gets a solid chevron toggle (▶ collapsed, ▾ expanded) on a muted blue bar. Returning `null` or `undefined` for a row suppresses its toggle entirely — that row renders flat with no visual affordance.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => <OrderLineItems orderId={order.id} />}
/>
```

**Selectively expandable** — only rows where the renderer returns content get a toggle:

```tsx
expandRowRenderer={(order) =>
  order.lineItems.length > 0
    ? <OrderLineItems order={order} />
    : null
}
```

**Using `rowIndex`** — the renderer receives both the row object and its current display-order index. Useful for position-based formatting, alternating detail styles, or correlating with a parallel index-aligned array:

```tsx
expandRowRenderer={(row, rowIndex) => (
  <DetailPanel row={row} zebra={rowIndex % 2 === 0} />
)}
```

> `rowIndex` is the **display-order** index (post-sort, post-filter) — it changes when the user re-sorts. For stable data correlation across renders, use the row's own identifier field (`row.id`, etc.).

**Customising the chevron** — override color, size, or any other style via `expandChevronClassName`:

```tsx
// Accent color from your design system
<ResponsiveTable
  expandChevronClassName="my-brand-chevron"
  expandRowRenderer={(row) => <Detail row={row} />}
  ...
/>
```

```css
/* your stylesheet */
.my-brand-chevron {
  color: #7c3aed;   /* purple accent */
  font-size: 2rem;
}
```

**Recommendations**
- Provide `selectionProps` with a `rowIdKey` when your data has a stable identifier. Expand state is keyed by row ID, so open panels survive re-sorts and filter changes.
- Detail content is **lazy-mounted** — the panel component is not created until first expand, then stays mounted so the collapse animation plays correctly. Heavy components are therefore only instantiated on demand.
- Expand and `onRowClick` coexist safely — the chevron bar carries `data-rt-ignore-row-click` so tapping the toggle never fires the row click handler.
- Works identically in both desktop (table row) and mobile (card) layouts.

---

## Row Interaction & Feedback

When `onRowClick` or `selectionProps` is provided, the table delivers tactile interaction feedback at every phase of the click:

| Phase | Desktop | Mobile |
| :--- | :--- | :--- |
| **Hover** | Subtle background lightening | Card lifts 4px with enhanced shadow |
| **Press (`:active`)** | Background deepens — confirms the press registered | Card compresses back to 1px lift |
| **Release / Selected** | Background sweeps to the selection tint (150ms transition) | Same tint + primary-color left border |
| **Keyboard focus** | 2px primary-color outline (`:focus-visible` only — not shown on mouse click) | Same |

**Rationale** — each phase is distinct so users receive unambiguous confirmation that their input was received, without animations that feel slow or decorative. The `:active` state is the most critical: it fires in the 80–150ms window of the press itself, before any state change, so even users on slow networks feel an immediate response.

**Keyboard navigation** — all clickable rows and cards have `tabIndex=0` and a `:focus-visible` ring. Tab through rows; press Enter or Space to trigger `onRowClick`.

**Combining with `onRowClick` and selection:**

```tsx
<ResponsiveTable
  data={employees}
  columnDefinitions={columns}
  onRowClick={(employee) => navigate(`/employees/${employee.id}`)}
  selectionProps={{
    rowIdKey: 'id',
    mode: 'multiple',
    onSelectionChange: (selected) => setSelected(selected),
  }}
/>
```

**Best practices**
- Always pair `onRowClick` with a visible hover state cue (the default cursor change handles this automatically).
- If rows contain buttons or links, use `data-rt-ignore-row-click` on those elements so inner interactions don't also trigger the row handler.
- For selection, always provide `rowIdKey` pointing to a stable unique field — this ensures expand state and selection state both survive sort/filter changes.

---

## Loading States & Animations

Control skeleton loaders and entrance animations with `animationProps`:

```tsx
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  animationProps={{ isLoading: isFetching, animateOnLoad: true }}
/>
```

| Prop | Type | Description |
| :--- | :--- | :--- |
| `isLoading` | `boolean` | Shows a skeleton loader while `true`. Merges with internal `dataSource` loading state. |
| `animateOnLoad` | `boolean` | Animates rows in on initial mount with a staggered entrance effect. |

---

## Documentation Directory

The following technical documentation provides comprehensive implementation guidance:

1.  **[Technical Implementation Guide](./docs/examples.md)** - Practical examples for core features, including infinite scroll and plugin integration.
2.  **[Functional Capabilities](./docs/features.md)** - A high-level overview of the component's feature set.
3.  **[API Reference](./docs/api.md)** - Technical specifications for props, interfaces, and type definitions.
4.  **[Configuration Specification](./docs/configuration.md)** - Detailed guidance on performance tuning and UI customization.
5.  **[Architecture and Contribution Guide](./docs/development.md)** - Internal system design and development environment setup.
6.  **[Handling Interactive Elements](./docs/handling-interactive-elements.md)** - Guide on preventing row click bubbling for buttons and custom components.

---
**Next Step:** [Review the Technical Implementation Guide](./docs/examples.md)
