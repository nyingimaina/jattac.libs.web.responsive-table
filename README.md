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

Pass `expandRowRenderer` to reveal arbitrary content below any row. Return `null` or `undefined` for rows that should not be expandable — only those rows get a toggle.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => (
    <OrderLineItems orderId={order.id} />
  )}
/>
```

The renderer receives both the row and its display-order index:

```tsx
expandRowRenderer={(row, rowIndex) => (
  <div>Row {rowIndex}: <pre>{JSON.stringify(row, null, 2)}</pre></div>
)}
```

Selectively expandable — rows where the renderer returns `null` render at zero height with no toggle:

```tsx
expandRowRenderer={(row) =>
  row.hasDetails ? <DetailPanel row={row} /> : null
}
```

**Recommendations**
- Provide `selectionProps` with a `rowIdKey` when your data has a stable identifier. The expand state is keyed by row ID, so expand/collapse survives re-sorts and filter changes correctly.
- `rowIndex` reflects the current **display order** (post-sort, post-filter). Use `row.id` or equivalent for stable cross-render correlation.
- Detail content is lazy-mounted — the component only renders on first expand, then stays mounted so the collapse animation plays smoothly.

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
