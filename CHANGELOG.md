# Changelog

## [0.12.0] - 2026-06-03

### Added
- **Expandable rows** — new `expandRowRenderer?: (row: TData, rowIndex: number) => ReactNode` prop. Returns `null`/`undefined` for no toggle; returns a `ReactNode` to show a rotating solid chevron (▶/▾) on a muted blue bar that animates open/closed. Works in both desktop and mobile layouts.
- **`expandChevronClassName`** — custom CSS class for the chevron icon span; override color, size, or any style without forking the component.
- **`rowIndex` parameter** on `expandRowRenderer` — consistent with the `ColumnDefinition` function form `(data, rowIndex?)` pattern.
- **Row click feedback** — full interaction state machine on clickable rows/cards: hover, `:active` press state (80ms), selection transition (150ms), `:focus-visible` keyboard ring, `tabIndex=0` for full keyboard navigation.
- **Mobile selected state** — card selection now shows background tint matching desktop, in addition to the existing left border.

### Changed
- Expand toggle: solid filled `MdArrowDropDown` chevron replaces `+`/`−` text; `2.2rem` default size; `2.5rem` bar height; muted blue bar `rgba(59,130,246,0.08)`; collapsed points right, expanded points down.
- All expand/collapse sizes converted to `rem`.

---

## [0.12.0-rc.4] - 2026-06-03 — Release Candidate

### Added
- `expandChevronClassName` prop — custom CSS class applied to the chevron icon span for color/size overrides

### Changed
- Chevron: `2.2rem` (was `1.5rem`); toggle bar height `2.5rem`
- Toggle bar: muted blue background `rgba(59,130,246,0.08)`, deepens to `0.14` on hover

### Added (onRowClick feedback)
- Desktop rows: `background-color` transition `0.12s`; `:active` press state (`#dde3ea`, `0.08s`)
- Mobile cards: `:active` compresses (`translateY(-1px)`, reduced shadow)
- `:focus-visible` ring on clickable rows and cards (2px primary-color)
- `tabIndex=0` on all clickable rows/cards for keyboard accessibility
- Selection `background-color` transition `0.15s` — smooth sweep instead of instant snap
- Mobile selected rows now match desktop with background tint

---

## [0.12.0-rc.3] - 2026-06-03 — Release Candidate

### Changed
- Chevron: replaced `MdKeyboardArrowDown` with solid `MdArrowDropDown` (filled triangle, more visual mass)
- Rotation: collapsed points right (`rotate(-90deg)`), expanded points down (`rotate(0deg)`) — universal accordion convention
- Size: `1.5rem` (was `1.25rem`) for faster eye-catch
- All detail row sizes converted to `rem`: bar height `2rem`, padding `0.75rem`, content indent `1.5rem`, bottom gap `0.5rem`

---

## [0.12.0-rc.2] - 2026-06-03 — Release Candidate

### Changed
- Polish expand/collapse toggle: replaced `+`/`−` text with a rotating `MdKeyboardArrowDown` chevron (primary-color blue, 20px); full toggle bar (32px) is now the click target; keyboard accessible (Enter/Space)
- Removed hard `border-top` separator; replaced with inset box-shadow + subtle background tint on the detail zone
- Left accent stripe (`border-left: 2px solid primary-color`) appears on expand
- Detail content indented 24px; bottom padding signals ownership to the preceding row

---

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
