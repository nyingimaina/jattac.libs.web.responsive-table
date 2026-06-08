# ResponsiveTable Infinite Loop Report

## Summary

`ResponsiveTableInner` enters an infinite re-render loop (`Maximum update depth exceeded`) when the consumer passes `filterProps` as a truthy object. Two independent causal paths exist; either alone is sufficient to trigger the loop.

---

## Path A — Unstable `columnDefinitions` / `footerRows` (consumer-side)

The consumer creates `columnDefinitions` and `footerRows` inline in the render method — brand-new arrays of arrow functions on every render. `ResponsiveTableInner` passes these to `useTablePlugins`, where they are deps of `useCallback(initializePlugins, [...])`. A new callback ref on every render fires the `useEffect`, which calls `setActivePlugins` + `setProcessedData`, triggering a re-render.

**Mitigated by consumer**: cache the arrays via `??=` so the reference stabilizes after first render (or after cache invalidation on structural prop change).

```tsx
// Before:
columnDefinitions={[
  () => ({ cellRenderer: (row) => <div>{row.name}</div>, ... }),
  ...
]}

// After:
columnDefinitions={this.#columnDefinitionsCache ??= [
  () => ({ cellRenderer: (row) => <div>{row.name}</div>, ... }),
  ...
]}
```

**Recommended library hardening**: The library could guard against this by:
- Wrapping `columnDefinitions` in a `useRef` on first receipt and only updating when the definition list structurally changes (e.g., array length or a `key` field).
- Or deep-comparing `columnDefinitions` before invalidating plugins.

---

## Path B — Unstable `resolvedFilterProps` (library-internal)

**`index.es.js:1179`:**

```js
const resolvedFilterProps = filterProps
    ? Object.assign(Object.assign({}, filterProps), { mode: isServerFilter ? 'server' : 'client' })
    : undefined;
```

`Object.assign({}, ...)` creates a **new object on every render** of `ResponsiveTableInner`. This value is passed to `useTablePlugins` as the `filterProps` dep of `useCallback(initializePlugins, [...])`. The cycle:

```
render → Object.assign → new resolvedFilterProps
→ useCallback sees new dep → new initializePlugins ref
→ useEffect fires → setActivePlugins(newActivePlugins)
→ state update → re-render → goto top
```

The same pattern exists at **`index.es.js:1339`** for `animationProps`, though that object is passed to `TableProvider` context rather than to `useTablePlugins` directly.

```js
animationProps: Object.assign(Object.assign({}, animationProps), { isLoading }),
```

### Fix

Wrap the expression in `useMemo` so the reference is stable across renders when `filterProps` (and `isServerFilter`) haven't changed:

```js
const resolvedFilterProps = useMemo(() => filterProps
    ? Object.assign(Object.assign({}, filterProps), { mode: ... })
    : undefined,
[filterProps, isServerFilter]);
```

Similarly for `animationProps`:

```js
animationProps: useMemo(() => Object.assign(Object.assign({}, animationProps), { isLoading }), [animationProps, isLoading])
```

---

## Reproducer

```tsx
function App() {
  return (
    <ResponsiveTable
      columnDefinitions={[
        { displayLabel: "Name", cellRenderer: (r) => r.name },
      ]}
      data={[{ name: "Alice" }]}
      filterProps={{ showFilter: true, filterPlaceholder: "Filter..." }}
    />
  );
}
```

Mounting this component causes an infinite loop. Removing `filterProps` or stabilizing `columnDefinitions` alone is NOT sufficient — Path B is independent and fires from the library's own `Object.assign` regardless of consumer prop stability.

---

## Recommendations

| # | Area | Recommendation | Priority |
|---|------|---------------|----------|
| 1 | `resolvedFilterProps` | `useMemo` wrap (see fix above) | Critical |
| 2 | `animationProps inside TableProvider value` | `useMemo` wrap | High |
| 3 | `useTablePlugins` dependencies | Audit for any other inline object/array creation that could destabilize `initializePlugins` | Medium |
| 4 | `columnDefinitions` | Consider a ref-based stabilization strategy as defense-in-depth against consumer misuse | Low |
| 5 | `footerRows` | Same ref-based stabilization as columnDefinitions | Low |
