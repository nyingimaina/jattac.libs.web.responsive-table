# API Reference
## Technical Specification for the ResponsiveTable Component

This document contains the exhaustive technical specification for the ResponsiveTable component, including property interfaces, type definitions, and functional callbacks.

## Table of Contents
*   [Component Properties (ResponsiveTable)](#responsivetable-properties)
*   [IResponsiveTableColumnDefinition Specification](#columndefinition)
*   [Selection Management Configuration](#selectionprops)
*   [Filtering Implementation Details](#filterprops)

---

[← Previous: Functional Capabilities](./features.md) | [Next: Configuration Specification →](./configuration.md)

### Component Properties (ResponsiveTable)

| Property | Type | Description |
| :--- | :--- | :--- |
| `data` | `TData[]` | **Required.** The dataset to be rendered within the component. Acts as `initialData` when `dataSource` is provided. |
| `columnDefinitions` | `ColumnDefinition<TData>[]` | **Required.** An array of objects defining the structural configuration of the columns. |
| `dataSource` | `DataSource<TData>` | Async function for server-side pagination, filtering, and search. When provided, enables infinite scroll with `IntersectionObserver`. |
| `pageSize` | `number` | Items per page when using `dataSource`. Default: `20`. |
| `maxHeight` | `string` | Defines a fixed height for the component, enabling internal scroll event interception and sticky headers. |
| `mobileBreakpoint` | `number` | The viewport width (in pixels) at which the component transitions to the mobile interface. Default: `600`. |
| `onRowClick` | `(item: TData) => void` | Callback function executed upon a row click event. |
| `footerRows` | `IFooterRowDefinition[]` | Configuration for table footers with support for automated scaling. |
| `selectionProps` | `ISelectionProps` | Interface for managing row selection state. |
| `filterProps` | `IFilterProps` | Interface for configuring data filtering mechanisms. Supports client and server-side modes. |
| `sortProps` | `ISortProps` | Initial sort configuration for the table. |
| `animationProps` | `IAnimationProps` | Configuration for staggered entry animations and loading states. |
| `mobileCardClassName` | `string` | Custom CSS class applied to each card in mobile view. |
| `onDataSourceStateChange` | `(state: DataSourceState<TData>) => void` | Callback fired whenever the dataSource state changes (data, page, loading, error). |
| `onPageChange` | `(page: number) => void` | Callback fired when the current page changes. |
| `onDataSourceError` | `(error: Error) => void` | Callback fired when a dataSource fetch fails. |
| `expandRowRenderer` | `(row: TData, rowIndex: number) => ReactNode` | Renders collapsible detail content below a row. Return `null`/`undefined` for no toggle on that row. |
| `expandChevronClassName` | `string` | Custom CSS class applied to the chevron icon `<span>`. Use to override color, size, or any other style. |

### Row Interaction & Visual Feedback (`onRowClick`)

When `onRowClick` or `selectionProps` is provided, the table applies a full interaction state machine to every clickable row — no additional configuration required.

| State | Desktop (`<tr>`) | Mobile (card) |
| :--- | :--- | :--- |
| **Default** | Stripe / base background | Card with subtle shadow |
| **Hover** | Background lightens (`--table-row-hover-bg`) | Card lifts 4px, shadow deepens |
| **Active (press)** | Background deepens to `#dde3ea` (80ms) | Card compresses to 1px lift, shadow reduces |
| **Selected** | Background sweeps to `#e7f1ff` (150ms transition) | Same tint + 4px primary-color left border |
| **Focus (keyboard)** | 2px primary-color `outline` (`:focus-visible` only) | Same |

All clickable rows and cards receive `tabIndex=0`, making the table fully keyboard-navigable. Press **Tab** to move between rows, **Enter** or **Space** to trigger `onRowClick`.

**Use cases**
- Navigation: `onRowClick={(row) => navigate(`/detail/${row.id}`)}`
- Inline drawer or modal trigger
- Combined with `selectionProps` for multi-select workflows

```tsx
// Navigation on click
<ResponsiveTable
  data={invoices}
  columnDefinitions={columns}
  onRowClick={(invoice) => router.push(`/invoices/${invoice.id}`)}
/>

// Selection + click
<ResponsiveTable
  data={employees}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    mode: 'multiple',
    onSelectionChange: (selected) => setSelected(selected),
  }}
  onRowClick={(employee) => setPreview(employee)}
/>
```

**Best practices**
- Use `data-rt-ignore-row-click` on buttons and links inside cells so inner interactions do not also fire the row handler — see [Handling Interactive Elements](./handling-interactive-elements.md).
- Always provide `selectionProps.rowIdKey` pointing to a stable unique field when using selection — prevents state drift when rows are sorted or filtered.
- The `:active` feedback is immediate by design (80ms transition-in). Do not suppress it via CSS — it is the primary signal that the press registered before any async work begins.

### IResponsiveTableColumnDefinition
The primary configuration interface for defining column-level behavior and rendering logic.

```typescript
interface IResponsiveTableColumnDefinition<TData> {
  /** The content to be displayed in the column header. */
  displayLabel: ReactNode;      
  /** Function defining the rendering logic for each cell in this column. */
  cellRenderer: (row: TData) => ReactNode; 
  /** Controls column visibility. If false, the column is excluded from the render cycle. */
  visible?: boolean;            
  /** Unique identifier for the column. Required for sorting and selection logic. */
  columnId?: string;            
  /** Function to extract a comparable value for default sorting logic. */
  getSortableValue?: (row: TData) => any;
  /** Custom comparison function for complex sorting requirements. */
  sortComparer?: (a: TData, b: TData, dir: 'asc'|'desc') => number;
  /** Function defining the searchable string representation of the cell content. */
  getFilterableValue?: (row: TData) => string;
}
```

### Filter Configuration (`filterProps`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `showFilter` | `boolean` | `false` | When true, renders a search input above the table. |
| `filterPlaceholder` | `string` | `"Search..."` | Placeholder text for the filter input. |
| `className` | `string` | — | Custom CSS class for the filter input. |
| `mode` | `'client' \| 'server'` | `'client'` | When `'client'`, filtering is performed in-memory on loaded data. When `'server'`, filter changes trigger a `dataSource` re-fetch with the `filter` param, enabling REST-powered search. |

### Animation Configuration (`animationProps`)

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isLoading` | `boolean` | `undefined` | When `true`, renders a skeleton loader in place of the table until data is ready. Merges with the internal `dataSource` loading state — either source sets the skeleton. |
| `animateOnLoad` | `boolean` | `undefined` | When `true`, rows animate in on initial mount with a staggered entrance effect. |

```tsx
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  animationProps={{ isLoading: isFetching, animateOnLoad: true }}
/>
```

### Expandable Rows (`expandRowRenderer`, `expandChevronClassName`)

#### `expandRowRenderer`

```typescript
expandRowRenderer?: (row: TData, rowIndex: number) => ReactNode
```

Attaches a collapsible detail panel below each row. A chevron in a dedicated 2rem left column indicates state (▶ collapsed, ▾ expanded). The renderer is called for every row — return `null` or `undefined` to suppress the toggle entirely for that row.

```tsx
// All rows expandable
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => <OrderLineItems orderId={order.id} />}
/>

// Selectively expandable — only rows with line items get a toggle
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) =>
    order.lineItems.length > 0 ? <OrderLineItems order={order} /> : null
  }
/>

// rowIndex for position-based logic (zebra detail panels, animation offsets)
<ResponsiveTable
  data={employees}
  columnDefinitions={columns}
  expandRowRenderer={(row, rowIndex) => (
    <EmployeeDetail employee={row} zebra={rowIndex % 2 === 0} />
  )}
/>
```

**Use cases**
- Master–detail layouts (orders → line items, users → permissions, assets → history)
- Inline editing panels without navigating away
- Progressive disclosure of verbose data fields that would clutter the main row
- Nested tables or charts scoped to a single row

**Behaviour**
- Chevron sits in a dedicated 2rem left column — not as an overlay or pseudo-element — keeping data columns structurally aligned.
- **Idle:** chevron at 25% opacity, rotated right (`-90deg`). Quiet and non-intrusive.
- **Hover:** chevron smooths to 60% opacity, subtle border accent on the row.
- **Expanded:** chevron rotates down (`0deg`), full opacity. A toggle bar slides in (0→2rem) at the top of the detail pane.
- **Greeting animation:** on mount, chevrons pop in with a staggered multi-pulse wave (2.2s), then settle to idle. Plays once per component lifecycle.
- Detail content is **lazy-mounted**: the panel component is not created until first expand, then stays mounted so the collapse animation plays correctly. Heavy components are instantiated on demand.
- Expand state is keyed by `selectionProps.rowIdKey` when provided, otherwise falls back to array index. A stable key survives re-sorts and filter changes.
- `rowIndex` is the **display-order** index (post-sort, post-filter) — not a stable identifier. Use the row object's own field for cross-render correlation.
- The chevron carries `data-rt-ignore-row-click` — tapping the toggle never fires `onRowClick`.
- Works identically in desktop (table `<tr>`) and mobile (card) layouts.

#### `expandChevronClassName`

```typescript
expandChevronClassName?: string
```

Custom CSS class applied to the chevron icon `<span>`. The chevron defaults to `1.125rem` in the primary color (`--primary-color`). Use this prop to override any style without forking the component. Do not override `transform` or `transition` — these drive the rotation animation.

```tsx
// Brand color override
<ResponsiveTable
  expandChevronClassName={styles.brandChevron}
  expandRowRenderer={(row) => <Detail row={row} />}
  ...
/>
```

```css
.brandChevron {
  color: #7c3aed;    /* your design-system accent */
  font-size: 1.8rem; /* smaller if the default is too prominent */
}
```

**Best practices**
- Override `color` to match your design token rather than using hardcoded hex — keeps theming consistent.
- Never override `transform` or `transition` — these drive the rotation animation.
- Override `--primary-color` at the `:root` level to theme the chevron, expanded left-border indicator, selection highlights, and focus rings simultaneously.
- See the **[Recommendations and Pitfalls guide](./recommendations.md)** for comprehensive best practices and anti-patterns.

For the complete feature reference — including expansion state keying, lazy mounting, accessibility, common patterns, and pitfalls — see the **[Row Expansion and Collapse Guide](./expand-collapse.md)**.

### DataSource Types

```typescript
interface IDataSourceParams {
  page: number;
  pageSize: number;
  sort?: { columnId: string; direction: 'asc' | 'desc' };
  filter?: string;
}

type DataSourceResult<TData> = TData[] | { items: TData[]; totalCount?: number };

type DataSource<TData> = (params: IDataSourceParams) => Promise<DataSourceResult<TData>>;

interface DataSourceState<TData> {
  data: TData[];
  currentPage: number;
  hasMore: boolean;
  totalCount?: number;
  isLoading: boolean;
  isFetchingMore: boolean;
  error?: Error;
}
```

### Imperative Handle (`ResponsiveTableHandle`)

When using a `ref` on `ResponsiveTable`, the following methods are exposed:

| Method | Return Type | Description |
| :--- | :--- | :--- |
| `loadNextPage()` | `Promise<void>` | Triggers the next page fetch. |
| `resetAndFetch()` | `Promise<void>` | Resets to page 1 and re-fetches. |
| `getState()` | `DataSourceState<TData>` | Returns the current pagination state (data, page, loading, error). |

### Context API

The `useTableContext` hook provides access to the internal table state, including pagination and processed data, for consumers rendered within the table's context.

```typescript
import { useTableContext } from 'jattac.libs.web.responsive-table';
```

---
**Previous:** [Functional Capabilities](./features.md) | **Next:** [Configuration Specification](./configuration.md)
