# Row Expansion and Collapse
## Progressive Disclosure of Row Detail

Expandable rows reveal arbitrary content below any row on demand. A chevron toggle bar appears beneath each eligible row; clicking it shows or hides a detail panel. The feature is surface-agnostic — it behaves identically in the desktop table layout and the mobile card layout — and composes transparently with all other table features: sorting, filtering, selection, `onRowClick`, and `dataSource`.

---

[← Previous: Technical Implementation Guide](./examples.md) | [Return to API Reference →](./api.md)

---

## Table of Contents

- [Props at a Glance](#props-at-a-glance)
- [expandRowRenderer](#expandrowrenderer)
  - [Signature](#signature)
  - [All Rows Expandable](#all-rows-expandable)
  - [Selective Expansion](#selective-expansion)
  - [Using rowIndex](#using-rowindex)
- [expandChevronClassName](#expandchevronclassname)
  - [Overriding Color](#overriding-color)
  - [Overriding Size](#overriding-size)
  - [Combining Overrides](#combining-overrides)
- [Expansion State and Row Identity](#expansion-state-and-row-identity)
- [Lazy Mounting](#lazy-mounting)
- [Multiple Rows Expanded Simultaneously](#multiple-rows-expanded-simultaneously)
- [Accessibility and Keyboard Navigation](#accessibility-and-keyboard-navigation)
- [Combining with onRowClick](#combining-with-onrowclick)
- [Combining with Selection](#combining-with-selection)
- [Combining with dataSource](#combining-with-datasource)
- [Common Patterns](#common-patterns)
  - [Master-Detail](#master-detail-orders--line-items)
  - [Inline Editing Panel](#inline-editing-panel)
  - [Nested Table](#nested-table)
  - [Charts and Rich Media](#charts-and-rich-media)
- [Visual Anatomy](#visual-anatomy)
- [CSS Customization Reference](#css-customization-reference)
- [Best Practices](#best-practices)
- [Pitfalls to Avoid](#pitfalls-to-avoid)

---

## Props at a Glance

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `expandRowRenderer` | `(row: TData, rowIndex: number) => ReactNode` | — | Renderer for the detail panel. Return `null` or `undefined` to suppress the toggle on that row. |
| `expandChevronClassName` | `string` | — | CSS class applied to the chevron `<span>`. Use to override color, size, or other styles. Do not override `transform` or `transition`. |

---

## `expandRowRenderer`

### Signature

```typescript
expandRowRenderer?: (row: TData, rowIndex: number) => React.ReactNode
```

The renderer function is called for every row on each render pass. The return value determines both whether the toggle is shown and what content is displayed when expanded.

| Return value | Effect |
| :--- | :--- |
| A `ReactNode` | Toggle bar appears. Content is shown when expanded. |
| `null` or `undefined` | No toggle bar is rendered for that row. The row renders flat with no visual affordance. |

### All Rows Expandable

The simplest case: every row receives a toggle.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => (
    <div style={{ padding: '1rem' }}>
      <strong>Notes:</strong> {order.notes}
    </div>
  )}
/>
```

### Selective Expansion

Return `null` or `undefined` for rows that should not be expandable. The toggle bar is completely absent — not hidden — for those rows, so there is no visual affordance for non-expandable rows.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) =>
    order.lineItems.length > 0
      ? <OrderLineItems order={order} />
      : null
  }
/>
```

This is the canonical pattern for master-detail layouts where only some records have associated detail data.

### Using `rowIndex`

The renderer receives the **display-order** index of the row as its second argument. This is the post-sort, post-filter position in the rendered list — it changes when the user re-sorts or filters.

```tsx
<ResponsiveTable
  data={employees}
  columnDefinitions={columns}
  expandRowRenderer={(employee, rowIndex) => (
    <EmployeeDetail
      employee={employee}
      zebra={rowIndex % 2 === 0}    // alternating panel background
    />
  )}
/>
```

> **Do not use `rowIndex` as a stable identifier.** Its value changes whenever the visible order changes. For data correlation that must survive re-renders, use the row object's own identifier field (`row.id`, etc.).

---

## `expandChevronClassName`

### Signature

```typescript
expandChevronClassName?: string
```

Applies a CSS class to the `<span>` wrapping the chevron icon. The chevron defaults to `2.2rem` and inherits its color from `--primary-color` (`#3b82f6` fallback). Use this prop to override any style without forking the component.

> **Do not override `transform` or `transition`** on this class. Both properties drive the collapse animation and will be reset internally on each toggle.

### Overriding Color

```tsx
<ResponsiveTable
  expandChevronClassName={styles.customChevron}
  expandRowRenderer={(row) => <Detail row={row} />}
  data={rows}
  columnDefinitions={columns}
/>
```

```css
.customChevron {
  color: #7c3aed; /* violet accent */
}
```

Prefer a CSS variable or design token over a hardcoded hex value to maintain theming consistency:

```css
.customChevron {
  color: var(--brand-accent);
}
```

### Overriding Size

```tsx
<ResponsiveTable
  expandChevronClassName={styles.compactChevron}
  expandRowRenderer={(row) => <Detail row={row} />}
  data={rows}
  columnDefinitions={columns}
/>
```

```css
.compactChevron {
  font-size: 1.6rem; /* smaller than the 2.2rem default */
}
```

### Combining Overrides

Multiple style properties can be applied in a single class:

```css
.brandedChevron {
  color: var(--brand-primary);
  font-size: 1.8rem;
  /* Do NOT set transform or transition here */
}
```

```tsx
<ResponsiveTable
  expandChevronClassName={styles.brandedChevron}
  expandRowRenderer={(row) => <Detail row={row} />}
  data={rows}
  columnDefinitions={columns}
/>
```

---

## Expansion State and Row Identity

Each row's expanded/collapsed state is tracked internally using a `Set` of row identifiers. The key used to identify rows is determined as follows:

| Condition | Key used |
| :--- | :--- |
| `selectionProps.rowIdKey` is provided | `row[rowIdKey]` — a stable data-derived identifier |
| `selectionProps` is not provided | Array index (display-order position) |

**With a stable key**, expanded panels survive re-sorts and filter changes. A user who expands "Order #1042" and then re-sorts by date will find "Order #1042" still expanded in its new position.

**Without a stable key**, expansion state is tied to position. Re-sorting resets all expanded panels because the indices no longer correspond to the same rows.

```tsx
// Stable: expanded state survives sort and filter
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    mode: 'multiple',
    onSelectionChange: setSelected,
  }}
  expandRowRenderer={(order) => <OrderLineItems order={order} />}
/>

// Index-based: expanded state resets on sort/filter
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => <OrderLineItems order={order} />}
/>
```

You can provide `selectionProps` solely to anchor expand state, even if row selection is not otherwise needed:

```tsx
// selectionProps used only to provide a stable expand key
// No selection UI is rendered unless selection is also visually wired
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    onSelectionChange: () => {},   // no-op — selection result is not consumed
  }}
  expandRowRenderer={(order) => <OrderLineItems order={order} />}
/>
```

---

## Lazy Mounting

Detail panel components are **not instantiated until the first time a row is expanded**. After that, the component stays mounted permanently. Collapse is achieved entirely by CSS (`grid-template-rows: 1fr → 0fr`) rather than by unmounting.

**Implications by scenario:**

| Scenario | Behaviour |
| :--- | :--- |
| Initial table render with 100 expandable rows | 0 detail components instantiated |
| First expand of a row | Detail component mounts; `useEffect` hooks fire |
| Subsequent collapse of the same row | Component stays mounted; only CSS changes |
| Second expand of the same row | No remount; component resumes from its current state |
| Component manages form state internally | Form state (values, validation) persists across collapse/expand cycles |

```tsx
// This API call fires on first expand, not on table render
function OrderDetail({ orderId }: { orderId: string }) {
  const { data } = useOrderDetail(orderId); // fires once, on first expand
  return <LineItemTable data={data} />;
}

<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  expandRowRenderer={(order) => <OrderDetail orderId={order.id} />}
/>
```

---

## Multiple Rows Expanded Simultaneously

Rows expand independently. Any number of rows can be open at the same time. There is no built-in accordion mode where opening one row closes others.

```tsx
// Alice and Bob can both be expanded — this is valid and supported
<ResponsiveTable
  data={[
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Carol' },
  ]}
  columnDefinitions={columns}
  expandRowRenderer={(row) => <Detail row={row} />}
/>
```

If your use case requires accordion behaviour — only one row open at a time — implement it by controlling which rows return content from the renderer:

```tsx
const [openId, setOpenId] = useState<string | null>(null);

// selectionProps provides stable keying for the single-open panel
<ResponsiveTable
  data={rows}
  columnDefinitions={columns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  expandRowRenderer={(row) => {
    if (row.id !== openId) return null;
    return <Detail row={row} onClose={() => setOpenId(null)} />;
  }}
/>
```

> When `openId` changes, affected rows re-render and return a different value (`null` vs content). Because expansion state is managed internally by the table, the visual toggle reflects the content availability — a row with `null` content has no toggle, and a row with content has a toggle.

---

## Accessibility and Keyboard Navigation

The toggle bar is fully accessible without any additional configuration.

| Attribute / Behaviour | Detail |
| :--- | :--- |
| `role="button"` | Toggle bar is announced as an interactive button to assistive technologies. |
| `tabIndex={0}` | Toggle bar is keyboard-focusable via Tab. |
| `aria-expanded="true/false"` | State is announced on each toggle; screen readers report the change. |
| **Enter** / **Space** | Toggles the panel from the keyboard. Default scroll behaviour is suppressed on Space. |
| `data-rt-ignore-row-click` | Toggle bar is excluded from the `onRowClick` event chain. Activating the toggle never fires the row click handler. |

The toggle bar is a separate focusable element from the row itself. When `onRowClick` is also present, both elements are keyboard-focusable independently: Tab reaches the row, Tab again reaches the toggle bar.

---

## Combining with `onRowClick`

The expand toggle and `onRowClick` are fully isolated. Clicking the chevron bar never fires `onRowClick` because the bar carries `data-rt-ignore-row-click` internally.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  onRowClick={(order) => navigate(`/orders/${order.id}`)}
  expandRowRenderer={(order) => <OrderLineItems order={order} />}
/>
```

Clicking the row body navigates. Clicking the chevron bar expands the panel. The two actions are fully independent and do not interfere with each other.

---

## Combining with Selection

Expand state and selection state share the same row identity key from `selectionProps.rowIdKey`. Providing a stable ID ensures both selection highlights and expanded panels survive sort and filter operations.

```tsx
<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  selectionProps={{
    rowIdKey: 'id',
    mode: 'multiple',
    onSelectionChange: setSelectedOrders,
  }}
  expandRowRenderer={(order) =>
    order.lineItems.length > 0
      ? <OrderLineItems order={order} />
      : null
  }
/>
```

---

## Combining with `dataSource`

`expandRowRenderer` is fully compatible with `dataSource` and its infinite scroll behaviour. As new pages load and rows append, previously expanded rows remain expanded. Newly loaded rows arrive in the collapsed state.

```tsx
<ResponsiveTable
  dataSource={async ({ page, pageSize }) => {
    const response = await api.orders.list({ page, limit: pageSize });
    return { items: response.data, totalCount: response.total };
  }}
  pageSize={20}
  columnDefinitions={columns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  expandRowRenderer={(order) =>
    order.lineItems.length > 0
      ? <OrderLineItems order={order} />
      : null
  }
/>
```

Providing `selectionProps.rowIdKey` is especially important with `dataSource`. Without a stable key, each new page fetch reassigns indices, resetting expand state for all currently visible rows.

---

## Common Patterns

### Master-Detail (Orders → Line Items)

The canonical use case. The summary row displays key fields; expanding reveals the full record or a sub-table.

```tsx
type Order = {
  id: string;
  reference: string;
  customer: string;
  total: number;
  lineItems: { sku: string; qty: number; price: number }[];
};

const columns: ColumnDefinition<Order>[] = [
  { displayLabel: 'Reference', cellRenderer: (o) => o.reference },
  { displayLabel: 'Customer',  cellRenderer: (o) => o.customer },
  { displayLabel: 'Total',     cellRenderer: (o) => `$${o.total.toFixed(2)}` },
];

<ResponsiveTable
  data={orders}
  columnDefinitions={columns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  expandRowRenderer={(order) =>
    order.lineItems.length === 0 ? null : (
      <table style={{ width: '100%', padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>SKU</th>
            <th style={{ textAlign: 'center' }}>Qty</th>
            <th style={{ textAlign: 'right' }}>Unit Price</th>
          </tr>
        </thead>
        <tbody>
          {order.lineItems.map((item) => (
            <tr key={item.sku}>
              <td>{item.sku}</td>
              <td style={{ textAlign: 'center' }}>{item.qty}</td>
              <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
/>
```

### Inline Editing Panel

Reveals an edit form below the row without navigating away. Because the component stays mounted after first expand, form state (draft values, validation errors) persists across collapse/expand cycles.

```tsx
function EditForm({ employee, onSave }: { employee: Employee; onSave: (e: Employee) => void }) {
  const [draft, setDraft] = useState(employee);

  return (
    <form
      style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
      onSubmit={(ev) => { ev.preventDefault(); onSave(draft); }}
    >
      <input
        value={draft.name}
        onChange={(ev) => setDraft({ ...draft, name: ev.target.value })}
        data-rt-ignore-row-click
      />
      <button type="submit" data-rt-ignore-row-click>Save</button>
    </form>
  );
}

<ResponsiveTable
  data={employees}
  columnDefinitions={columns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  onRowClick={(employee) => setPreview(employee)}
  expandRowRenderer={(employee) => (
    <EditForm employee={employee} onSave={handleSave} />
  )}
/>
```

> Add `data-rt-ignore-row-click` to interactive elements inside the detail panel when the table also uses `onRowClick`. See [Handling Interactive Elements](./handling-interactive-elements.md).

### Nested Table

Render a full child `ResponsiveTable` inside the detail panel for hierarchical data.

```tsx
<ResponsiveTable
  data={departments}
  columnDefinitions={deptColumns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  expandRowRenderer={(dept) =>
    dept.employees.length === 0 ? null : (
      <div style={{ padding: '0.75rem 1.5rem' }}>
        <ResponsiveTable
          data={dept.employees}
          columnDefinitions={employeeColumns}
          mobileBreakpoint={400}
        />
      </div>
    )
  }
/>
```

### Charts and Rich Media

Any `ReactNode` is valid detail content. Heavy libraries (charting, map rendering, rich text editors) mount lazily on first expand, keeping initial render cost low.

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

<ResponsiveTable
  data={assets}
  columnDefinitions={assetColumns}
  selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
  expandRowRenderer={(asset) => (
    <div style={{ padding: '1rem 1.5rem', height: 240 }}>
      <LineChart width={580} height={200} data={asset.priceHistory}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="price" dot={false} />
      </LineChart>
    </div>
  )}
/>
```

---

## Visual Anatomy

When `expandRowRenderer` returns content for a row, the following structure is rendered below that row's data cells (desktop) or card (mobile):

```
┌─ data row ─────────────────────────────────────────────────────────────┐
│  Alice        alice@example.com        Admin        2024-01-15         │
└────────────────────────────────────────────────────────────────────────┘
┌─ toggle bar (2.5rem tall, muted blue background) ──────────────────────┐
│  ▶  chevron (rotates 90° to ▾ when expanded)                           │
└────────────────────────────────────────────────────────────────────────┘
┌─ detail panel (CSS grid: 0fr → 1fr, content inset 1.5rem) ─────────────┐
│  [rendered detail content]                                             │
└────────────────────────────────────────────────────────────────────────┘
```

When expanded, both the toggle bar and the detail panel gain a `2px solid var(--primary-color)` left border, providing a visual anchor connecting the summary row to its detail content.

**Animation mechanism — all transitions are CSS-driven with no JavaScript animation loop:**

| Element | Technique | Duration |
| :--- | :--- | :--- |
| Chevron rotation (▶ → ▾) | `transform: rotate(-90deg) → rotate(0deg)` | 250ms ease |
| Panel open/close | `grid-template-rows: 0fr → 1fr` | 300ms ease |
| Toggle bar appearance | `height: 0 → 2.5rem` | 200ms ease |
| Left border indicator | `border-left` transition | 200ms ease |

---

## CSS Customization Reference

The following CSS module classes govern the expand/collapse visual system. They are not part of the public API — use `expandChevronClassName` for chevron customization. The table is provided for reference when applying global theme overrides via CSS variables.

| Class | Element | Key properties |
| :--- | :--- | :--- |
| `.detailCell` | `<td>` wrapping the entire detail row | `padding: 0`, `background: rgba(0,0,0,0.012)` |
| `.detailCellHasContent` | Applied when renderer returns content | `padding-bottom: 0.5rem` |
| `.detailCellExpanded` | Applied when the panel is open | `border-left: 2px solid var(--primary-color, #3b82f6)` |
| `.detailToggleBar` | Toggle bar `<div>` (base state) | `height: 0`, overflow hidden |
| `.detailToggleBarVisible` | Toggle bar when row has content | `height: 2.5rem`, `background: rgba(59,130,246,0.08)`, cursor pointer |
| `.detailChevron` | Chevron `<span>` | `color: var(--primary-color, #3b82f6)`, `font-size: 2.2rem`, `transform: rotate(-90deg)` |
| `.detailChevronExpanded` | Chevron when panel is open | `transform: rotate(0deg)` |
| `.detailContentWrapper` | Grid container for the detail content | `grid-template-rows: 0fr`, transitions to `1fr` on expand |
| `.detailContentInner` | Inner content container | `overflow: hidden`, `padding-left: 1.5rem` |
| `.mobileDetailOuter` | Wrapper for toggle bar + content in mobile view | `overflow: hidden`, `background: rgba(0,0,0,0.012)` |

To apply brand colors across the entire expand/collapse system (chevron, border indicator, and selection highlights simultaneously), override the `--primary-color` variable in your global stylesheet:

```css
:root {
  --primary-color: #7c3aed;
}
```

---

## Best Practices

- **Provide `selectionProps.rowIdKey` whenever your data has a stable unique field.** Expand state is keyed by row ID. Without it, re-sorting resets all open panels because indices no longer map to the same rows. The `rowIdKey` also benefits selection state simultaneously.

- **Return `null` for rows with no detail content.** The toggle is completely absent for those rows — not just hidden — so users are never presented with a toggle that opens an empty panel.

- **Treat `rowIndex` as a display position, not an identifier.** It is post-sort and post-filter. Use it only for cosmetic purposes such as zebra patterns or animation offsets. Use `row.id` (or equivalent) for data fetch parameters and cross-render correlation.

- **Add `data-rt-ignore-row-click` to interactive elements inside the detail panel** when `onRowClick` is also set. Buttons, inputs, and links in the panel should not propagate clicks to the row click handler. See [Handling Interactive Elements](./handling-interactive-elements.md).

- **Prefer `--primary-color` over per-class overrides for brand theming.** The chevron, the expanded left-border indicator, and selection highlights all derive from this single variable. Setting it once keeps the visual system consistent without multiple class overrides.

- **Do not override `transform` or `transition` in `expandChevronClassName`.** These properties drive the rotation animation and are reset by the component on every toggle.

---

## Pitfalls to Avoid

| Pitfall | Symptom | Fix |
| :--- | :--- | :--- |
| No `selectionProps.rowIdKey` on a sortable table | Expanded panels close when the user re-sorts | Add `selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}` |
| `expandRowRenderer` always returns a non-null node | Every row has a toggle, even rows with no meaningful detail content | Return `null` for rows where the detail panel would be empty |
| Overriding `transform` on the chevron | Chevron does not rotate on expand/collapse | Remove `transform` from the `expandChevronClassName` stylesheet rule |
| Interactive elements in detail panel fire `onRowClick` | Clicking a button inside the panel also triggers row navigation | Add `data-rt-ignore-row-click` to the interactive element or a wrapping container |
| Using `rowIndex` as a fetch key or database identifier | Incorrect data fetched after re-sort | Use `row.id` or another stable field from the row object |
| No `selectionProps.rowIdKey` with `dataSource` | Expanded panels reset when the next page loads | Provide `rowIdKey`; IDs from newly loaded pages then coexist with IDs already in the set |

---

**Previous:** [Technical Implementation Guide](./examples.md) | **Next:** [API Reference](./api.md)
