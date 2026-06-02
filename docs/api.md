# API Reference
## Technical Specification for the ResponsiveTable Component

This document contains the exhaustive technical specification for the ResponsiveTable component, including property interfaces, type definitions, and functional callbacks.

## Table of Contents
*   [Component Properties (ResponsiveTable)](#responsivetable-properties)
*   [IResponsiveTableColumnDefinition Specification](#columndefinition)
*   [Infinite Scroll Configuration](#infinitescrollprops)
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
| `infiniteScrollProps`| `IInfiniteScrollProps` | Interface for enabling asynchronous data loading (legacy; prefer `dataSource`). |
| `selectionProps` | `ISelectionProps` | Interface for managing row selection state. |
| `filterProps` | `IFilterProps` | Interface for configuring data filtering mechanisms. Supports client and server-side modes. |
| `sortProps` | `ISortProps` | Initial sort configuration for the table. |
| `animationProps` | `IAnimationProps` | Configuration for staggered entry animations and loading states. |
| `mobileCardClassName` | `string` | Custom CSS class applied to each card in mobile view. |
| `onDataSourceStateChange` | `(state: DataSourceState<TData>) => void` | Callback fired whenever the dataSource state changes (data, page, loading, error). |
| `onPageChange` | `(page: number) => void` | Callback fired when the current page changes. |
| `onDataSourceError` | `(error: Error) => void` | Callback fired when a dataSource fetch fails. |

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

### Infinite Scroll Configuration (Legacy)
Defines the parameters for the asynchronous data orchestration.

| Property | Type | Description |
| :--- | :--- | :--- |
| `onLoadMore` | `(data: TData[]) => Promise<TData[]>` | **Required.** Asynchronous function to retrieve data increments. |
| `hasMore` | `boolean` | Indicates if additional data is available for retrieval. |
| `loadingMoreComponent`| `ReactNode` | Component rendered during asynchronous fetch operations. |
| `noMoreDataComponent` | `ReactNode` | Component rendered upon exhaustion of the data stream. |

---
**Previous:** [Functional Capabilities](./features.md) | **Next:** [Configuration Specification](./configuration.md)
