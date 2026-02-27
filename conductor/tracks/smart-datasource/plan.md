# Implementation Plan: Smart Data Source & Seamless Infinite Scroll
Status: In Progress

## Atoms
0.  **[DONE]** **[REGRESSION-BASELINE]** Run existing test suite and ensure it's 100% green before making any changes.
1.  **[DONE]** **[CONTEXT-UPDATE]** Update `TableContext` to include state for `dataSource`, `currentPage`, `pageSize`, `hasMore`, and unified loading states (`isLoading`, `isFetchingMore`).
2.  **[DONE]** **[HOOK-REFACTOR]** Create a `useTableDataSource` hook to manage the data fetching lifecycle (initial fetch, pagination, sorting/filtering integration).
3.  **[DONE]** **[UI-SENTINEL]** Create a `TableSentinel` component using the `IntersectionObserver` API to trigger the next page load.
4.  **[DONE]** **[UI-INTEGRATION]** Integrate the `TableSentinel` and unified loading components (spinners, skeletons) into `DesktopView` and `MobileView`.
5.  **[API-UNIFICATION]** Update `ResponsiveTable` to natively support the `dataSource` prop and internal pagination, potentially deprecating the need for a separate `InfiniteTable` component.
6.  **[TEST-SUITE]** Add a new test suite to verify the `dataSource` pattern with mock API responses and pagination.
