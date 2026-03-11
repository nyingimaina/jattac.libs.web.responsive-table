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
| `data` | `TData[]` | **Required.** The dataset to be rendered within the component. |
| `columnDefinitions` | `ColumnDefinition<TData>[]` | **Required.** An array of objects defining the structural configuration of the columns. |
| `maxHeight` | `string` | Defines a fixed height for the component, enabling internal scroll event interception and sticky headers. |
| `mobileBreakpoint` | `number` | The viewport width (in pixels) at which the component transitions to the mobile interface. Default: `600`. |
| `onRowClick` | `(item: TData) => void` | Callback function executed upon a row click event. |
| `footerRows` | `IFooterRowDefinition[]` | Configuration for table footers with support for automated scaling. |
| `infiniteScrollProps`| `IInfiniteScrollProps` | Interface for enabling asynchronous data loading. |
| `selectionProps` | `ISelectionProps` | Interface for managing row selection state. |
| `filterProps` | `IFilterProps` | Interface for configuring data filtering mechanisms. |
| `animationProps` | `IAnimationProps` | Configuration for staggered entry animations and loading states. |

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

### Infinite Scroll Configuration
Defines the parameters for the asynchronous data orchestration.

| Property | Type | Description |
| :--- | :--- | :--- |
| `onLoadMore` | `(data: TData[]) => Promise<TData[]>` | **Required.** Asynchronous function to retrieve data increments. |
| `hasMore` | `boolean` | Indicates if additional data is available for retrieval. |
| `loadingMoreComponent`| `ReactNode` | Component rendered during asynchronous fetch operations. |
| `noMoreDataComponent` | `ReactNode` | Component rendered upon exhaustion of the data stream. |

---
**Previous:** [Functional Capabilities](./features.md) | **Next:** [Configuration Specification](./configuration.md)
