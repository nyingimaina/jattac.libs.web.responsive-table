# Specification: Fix Lint Errors for Publication

## Problem
The `npm publish` process fails because the `prepublishOnly` hook runs `npm run lint`, which reports errors in `src/Context/TableContext.tsx`. Specifically, the use of the `any` type is forbidden by the `@typescript-eslint/no-explicit-any` rule.

## Root Cause Analysis
The `src/Context/TableContext.tsx` file uses `any` in a few places to simplify generic handling in the `createContext` and `TableProvider` component:
- `createContext<TableContextValue<any> | undefined>(undefined)`
- `value as any` when destructuring `TableProviderProps`.
- `(row as any)[selectionProps.rowIdKey]` in `getRowId`.

These were introduced during the recent refactoring and need to be replaced with proper types or suppressed with valid reasons if unavoidable (though usually they are avoidable).

## Requirements
1. Remove all `any` usages in `src/Context/TableContext.tsx` and replace them with appropriate types (`TData`, `unknown`, or more specific interfaces).
2. Ensure `TableContext` remains generic and functional.
3. Verify that `npm run lint` passes without errors.
