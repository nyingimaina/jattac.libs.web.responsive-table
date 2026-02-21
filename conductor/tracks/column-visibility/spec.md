# Specification: Programmatic Column Visibility & Intelligent Footer Scaling

## 1. Goal
Implement a programmatic way to hide columns in `ResponsiveTable` while ensuring that desktop headers, body cells, and complex footers automatically adjust their layout and `colSpan` to maintain a perfect visual alignment.

---

## 2. Public API Changes

### 2.1. `IResponsiveTableColumnDefinition<TData>`
Add an optional `visible` property to the column definition.
```typescript
interface IResponsiveTableColumnDefinition<TData> {
  // ... existing properties
  visible?: boolean; // Defaults to true
}
```

---

## 3. Internal Logic Changes

### 3.1. Hook: `useTablePlugins`
The hook will be updated to filter the `processedData`'s columns and return a list of `visibleColumns`. This ensures all components work with the same column subset.

```typescript
const visibleColumns = useMemo(() => {
  return columnDefinitions.filter(col => {
    const raw = getRawColumnDefinition(col);
    return raw.visible !== false;
  });
}, [columnDefinitions]);
```

### 3.2. Component: `DesktopView` (Footer Scaling)
The rendering loop for `<tfoot>` will be updated to calculate **Effective colSpan**.

**The Algorithm:**
1.  Iterate through `footerRows`.
2.  For each `footerCol`, determine its **Original Index Range** (e.g., from column 2 to column 4).
3.  Calculate the **Effective colSpan**: Count how many columns within that range are still `visible: true`.
4.  If `effectiveColSpan > 0`, render the `<td>` with the updated span.
5.  If `effectiveColSpan === 0`, skip rendering the `<td>`.

### 3.3. Component: `MobileView`
The card-based rendering will automatically skip any column where `visible === false`.

---

## 4. Implementation Details

### 4.1. The `getEffectiveColSpan` Helper
A utility function to map footer ranges to visible columns:

```typescript
const getEffectiveColSpan = (
  footerCol: IFooterColumnDefinition, 
  startIndex: number, 
  allColumns: ColumnDefinition<TData>[]
) => {
  const originalSpan = footerCol.colSpan || 1;
  const endIndex = startIndex + originalSpan;
  
  let visibleCount = 0;
  for (let i = startIndex; i < endIndex; i++) {
    const col = allColumns[i];
    if (col && getRawColumnDefinition(col).visible !== false) {
      visibleCount++;
    }
  }
  return visibleCount;
};
```

---

## 5. Benefits
*   **Zero Configuration**: Users only toggle `visible: false` on a column; the table handles the complex math for footers automatically.
*   **Maintainable**: Logic is centralized in the rendering loop.
*   **Non-Breaking**: Only adds an optional property to an existing interface.
