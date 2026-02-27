# Implementation Plan: Advanced Table Atomization (Phase 2)

## Atoms
1.  **[CONTEXT-SETUP]** Create `src/Hooks/useTableContext.tsx` providing `TableContext`, `TableProvider`, and `useTableContext` hook.
2.  **[LOGIC-MIGRATION]** Migrate `getRawColumnDefinition`, `getColumnDefinition`, `getHeaderProps`, `getRowProps`, and `renderCell` logic from `ResponsiveTable.tsx` into the context or its hook.
3.  **[ATOMIC-CELL]** Extract `TableBodyCell` component (plugin-aware cell rendering).
4.  **[ATOMIC-HEADER]** Extract `TableHeaderCell` component (plugin-aware header rendering).
5.  **[ATOMIC-ROW]** Extract `TableBodyRow` component (plugin-aware row rendering, selection, and click events).
6.  **[REFACTOR-DESKTOP]** Update `DesktopView.tsx` to use the new atomic components and the `TableContext`.
7.  **[REFACTOR-MOBILE]** Update `MobileView.tsx` to use the new atomic components and the `TableContext`.
8.  **[CLEAN-RESPONSIVE]** Simplify `ResponsiveTable.tsx` to use the `TableProvider` and the simplified views.
9.  **[VERIFY]** Run `npm run build` and existing tests to ensure no regressions.
