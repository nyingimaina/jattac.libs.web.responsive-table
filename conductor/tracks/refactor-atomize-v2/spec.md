# Specification: Advanced Table Atomization (Phase 2)

## Problem
The previous atomization phase successfully separated the table views (`DesktopView`, `MobileView`), but much of the rendering logic (headers, rows, cells) is still duplicated or heavily prop-drilled from `ResponsiveTable.tsx`. This makes the views difficult to maintain and extend.

## Root Cause Analysis
- `ResponsiveTable.tsx` acts as a monolithic data provider, passing down dozens of props to its children.
- Helper functions for plugin-aware rendering are redefined or passed down repeatedly.
- The distinction between layout (where cells/rows go) and logic (how they are rendered) is still blurred.

## Requirements
1.  **Introduce `TableContext`:** Centralize state (processed data, active plugins, visible columns) and helper functions.
2.  **Atomic Rendering Components:**
    *   `TableHeaderCell`: Handles plugin-aware header rendering and click events.
    *   `TableBodyRow`: Handles plugin-aware row rendering, selection, and click events.
    *   `TableBodyCell`: Handles plugin-aware cell rendering.
3.  **Encapsulated Logic:** Move all `get...` helper functions into the `TableContext` or a dedicated hook (`useTableContext`).
4.  **Simplified Views:** `DesktopView` and `MobileView` should only handle the high-level layout (e.g., table tags vs. card structures), delegating all cell/row rendering to the new atomic components.

## Goals
- Drastically reduce the number of props passed to `DesktopView` and `MobileView`.
- Improve maintainability by having a single source of truth for row/cell rendering logic.
- Ensure that the public API of `ResponsiveTable` remains unchanged.
