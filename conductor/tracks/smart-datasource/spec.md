# Specification: Smart Data Source & Seamless Infinite Scroll

## 1. Goal
Simplify the data-fetching and infinite-scroll experience for developers by introducing a high-level `dataSource` pattern and a more intuitive pagination-based API.

---

## 2. Proposed API: The `dataSource` Pattern

The current API requires the developer to manage data concatenation and manual state tracking for infinite scroll. The `dataSource` pattern abstracts this into a single, clean function call.

```typescript
interface IDataSourceParams<TData> {
  page: number;
  pageSize: number;
  sort?: { column: string; direction: 'asc' | 'desc' };
  filter?: string;
}

// Result can be a simple array (auto-detect hasMore) or a full result object
type DataSourceResult<TData> = TData[] | { items: TData[]; totalCount?: number };

interface IProps<TData> {
  // New unified data source
  dataSource?: (params: IDataSourceParams<TData>) => Promise<DataSourceResult<TData>>;
  pageSize?: number; // Default 20
  
  // Existing data prop becomes optional/fallback
  data?: TData[]; 
}
```

---

## 3. Core Enhancements

### 3.1. Internally Managed Pagination
- The `TableContext` will now track the `currentPage`.
- When the user scrolls to the bottom, the table increments the page and calls the `dataSource` automatically.
- The table handles the **concatenation** of new data batches, so the dev doesn't have to.

### 3.2. Intelligent `hasMore` Detection
- If the `dataSource` returns fewer items than the `pageSize`, the table automatically sets `hasMore = false`.
- If a `totalCount` is provided, the table uses it to determine the end of the data.

### 3.3. Performance: Intersection Observer Sentinel
- Replace scroll event listeners with a `Sentinel` component that uses the `IntersectionObserver` API. This is more performant and provides a smoother "seamless" loading experience.

### 3.4. Unified Loading States
- The table provides standardized `isLoading` (initial load) and `isFetchingMore` (pagination) states.
- These states can be used to automatically show skeleton loaders or spinners without extra boilerplate from the dev.

---

## 4. Design Goals
*   **Painless Integration**: One function to handle sorting, filtering, and paging.
*   **Zero Bookkeeping**: No more manual `[...data, ...newData]` calls.
*   **Performance**: Smooth, non-jittery infinite scrolling.
