# Implementation Plan: Programmatic Column Visibility & Intelligent Footer Scaling
Status: Completed

## Atoms
1.  **[DONE]** **[CORE]** Add `visible?: boolean` to `IResponsiveTableColumnDefinition` interface.
2.  **[DONE]** **[HOOK]** Update `useTablePlugins` to calculate `visibleColumns`.
3.  **[DONE]** **[UI-DESKTOP]** Update `DesktopView` to use `visibleColumns` and implement `getEffectiveColSpan` for footer math.
4.  **[DONE]** **[UI-MOBILE]** Update `MobileView` to use `visibleColumns`.
5.  **[DONE]** **[VERIFY]** Run tests for column visibility and footer scaling.
