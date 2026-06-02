# Changelog

## [0.12.0-rc.1] - 2026-06-02 — Release Candidate

### Added
- **`expandRowRenderer`** — new prop `(row: TData, rowIndex: number) => ReactNode` that attaches a collapsible detail panel below any row. Return `null`/`undefined` for rows that should not be expandable; return a `ReactNode` to show a `+`/`−` toggle with smooth CSS height animation (`grid-template-rows` trick). Works in both desktop (table `<tr>`) and mobile (card) layouts.
- Detail content is lazy-mounted: only rendered on first expand, stays mounted for smooth collapse animation.
- Expand state is keyed by `selectionProps.rowIdKey` when provided, falling back to array index — survives re-sorts and filter changes when a stable key is set.

---

## [0.11.1] - 2026-06-02

### Fixed
- **`animationProps` context churn** — `{ ...animationProps, isLoading }` was spread inline inside `TableProvider value`, creating a new object reference on every render and causing unnecessary re-renders of all context consumers. Wrapped in `useMemo` with individual field deps, mirroring the `resolvedFilterProps` fix from 0.11.0.

---

## [0.11.0] - 2026-05-28

### Added
- **ZestTextbox filter input** — replaced the plain `<input>` with `ZestTextbox` for consistent theming and accessibility.
- **Clear button** — a react-icons × button appears in the filter field when text is present.

### Fixed
- **Infinite re-render loop** — `resolvedFilterProps` was created with `Object.assign({}, ...)` on every render, destabilising the `useCallback(initializePlugins)` dep in `useTablePlugins` and triggering an infinite `useEffect` loop. Wrapped in `useMemo` keyed on individual `filterProps` fields.

---

## [0.10.x and earlier]

See git history.
