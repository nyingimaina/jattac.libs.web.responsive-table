# Scroll Position Control
## Saving and Restoring the Table's Scroll Offset

Tables that switch between data subsets, lose page focus, or live inside routed views often need to remember where the user was scrolling — and snap back there when they return. The scroll position API gives parent components full control over this, without forking internal state.

---

[← Previous: Row Expansion and Collapse](./expand-collapse.md) | [Return to API Reference →](./api.md)

---

## Table of Contents

- [When You Need This](#when-you-need-this)
- [Props and Ref API at a Glance](#props-and-ref-api-at-a-glance)
- [How It Works](#how-it-works)
  - [Internal Scroll (maxHeight)](#internal-scroll-maxheight)
  - [Page-Level Scroll (no maxHeight)](#page-level-scroll-no-maxheight)
- [onScrollPositionChange](#onscrollpositionchange)
  - [Signature](#signature)
  - [Basic Usage](#basic-usage)
- [ref.scrollTo()](#refscrollto)
  - [Signature](#signature-1)
  - [Basic Restore](#basic-restore)
- [Common Patterns](#common-patterns)
  - [Tab Switch — Preserve Position Per Tab](#tab-switch--preserve-position-per-tab)
  - [Subset Swap — Preserve Position Across Filter](#subset-swap--preserve-position-across-filter)
  - [Route Navigation — Save on Leave, Restore on Return](#route-navigation--save-on-leave-restore-on-return)
  - [Reset on Data Change](#reset-on-data-change)
- [Best Practices](#best-practices)
- [Pitfalls and Edge Cases](#pitfalls-and-edge-cases)

---

## When You Need This

Without this API, a user who scrolls halfway down a long table and then:

- Switches to another tab and back
- Triggers a filter that narrows the dataset
- Navigates away and returns

…will find the table snapped back to the top. The scroll position API lets the parent save the offset the moment it changes and restore it on the next render — so the user stays where they were.

**Concrete scenarios where this matters:**

| Scenario | Problem | Solution |
| :--- | :--- | :--- |
| Tab switcher with multiple tables | Each tab re-mounts the table at top | Save offset before unmount, restore after mount |
| Filter/search that re-renders the table | Applying a filter snaps to top even if results overlap | Save offset before filter, restore after (or reset intentionally) |
| Route navigation (SPA) | Navigating away and returning resets scroll | Store offset in route state, restore via `ref.scrollTo()` |
| Programmatic data subset swap | Parent changes `data` prop to a different slice | Save, swap, decide whether to restore or reset based on context |

---

## Props and Ref API at a Glance

| Prop / Method | Type | Description |
| :--- | :--- | :--- |
| `onScrollPositionChange` | `(scrollTop: number) => void` | Fired on each scroll event with the current pixel offset. `scrollTop` reflects the internal container when `maxHeight` is set, or `window.scrollY` otherwise. |
| `ref.scrollTo(position)` | `(position: number) => void` | Scrolls the internal container (or the page, if no `maxHeight`) to the given pixel offset. |

---

## How It Works

The scroll API has two modes that mirror the table's own layout modes.

### Internal Scroll (`maxHeight`)

When `maxHeight` is set, the table creates a fixed-height `<div>` with `overflow-y: auto`. All scrolling happens inside this container.

- `onScrollPositionChange` fires from the `onScroll` event on that div and reports `scrollTop`.
- `ref.scrollTo(position)` calls `container.scrollTo({ top: position })` on that same div.

No `window` listener is registered.

### Page-Level Scroll (no `maxHeight`)

When `maxHeight` is absent, the table expands to its full height and the page scrolls. The internal container is not a scroll target.

- `onScrollPositionChange` fires from a passive `window` scroll listener and reports `window.scrollY`.
- `ref.scrollTo(position)` calls `window.scrollTo({ top: position })`.

The window listener is registered in a `useEffect` and cleaned up on unmount. Changing `onScrollPositionChange` from a defined function to `undefined` (or vice versa) automatically re-registers or removes the listener.

---

## `onScrollPositionChange`

### Signature

```typescript
onScrollPositionChange?: (scrollTop: number) => void
```

Called on each scroll event. The value is the raw pixel offset — `scrollTop` for internal containers, `window.scrollY` for page-level scroll.

The callback fires at the browser's native scroll event rate (typically every animation frame while scrolling). If your handler is expensive, throttle it yourself before storing the value. For a simple `setState` or a ref assignment, the raw rate is fine.

### Basic Usage

```tsx
import { useRef, useState } from 'react';
import ResponsiveTable, { ResponsiveTableHandle } from 'jattac.libs.web.responsive-table';

function OrdersPage() {
  const tableRef = useRef<ResponsiveTableHandle<Order>>(null);
  const [savedPosition, setSavedPosition] = useState(0);

  return (
    <ResponsiveTable
      ref={tableRef}
      data={orders}
      columnDefinitions={columns}
      maxHeight="600px"
      onScrollPositionChange={(pos) => setSavedPosition(pos)}
    />
  );
}
```

Using a ref instead of state avoids re-renders on every scroll tick:

```tsx
const scrollPositionRef = useRef(0);

<ResponsiveTable
  onScrollPositionChange={(pos) => { scrollPositionRef.current = pos; }}
  ...
/>
```

This is the recommended pattern when the position is only used reactively (restoring on re-mount or data swap) rather than for display.

---

## `ref.scrollTo()`

### Signature

```typescript
tableRef.current?.scrollTo(position: number): void
```

Scrolls to the given pixel offset. The target is the internal container when `maxHeight` is set, or `window` otherwise — matching exactly what `onScrollPositionChange` reports.

### Basic Restore

```tsx
const tableRef = useRef<ResponsiveTableHandle<Order>>(null);
const savedPosition = useRef(0);

// Save
<ResponsiveTable
  ref={tableRef}
  onScrollPositionChange={(pos) => { savedPosition.current = pos; }}
  ...
/>

// Restore (e.g. after switching a tab back or swapping data)
tableRef.current?.scrollTo(savedPosition.current);
```

---

## Common Patterns

### Tab Switch — Preserve Position Per Tab

Each tab has its own table and its own saved position. When the user switches to a tab, the position saved before they left is restored.

```tsx
type Tab = 'pending' | 'completed';

function OrdersPage() {
  const pendingRef = useRef<ResponsiveTableHandle<Order>>(null);
  const completedRef = useRef<ResponsiveTableHandle<Order>>(null);
  const positions = useRef<Record<Tab, number>>({ pending: 0, completed: 0 });
  const [activeTab, setActiveTab] = useState<Tab>('pending');

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    // React re-renders synchronously in the same event — scrollTo on the next
    // frame so the table is in the DOM before we scroll it
    requestAnimationFrame(() => {
      const ref = tab === 'pending' ? pendingRef : completedRef;
      ref.current?.scrollTo(positions.current[tab]);
    });
  };

  return (
    <>
      <TabBar active={activeTab} onSwitch={switchTab} />

      {activeTab === 'pending' && (
        <ResponsiveTable
          ref={pendingRef}
          data={pendingOrders}
          columnDefinitions={columns}
          maxHeight="600px"
          onScrollPositionChange={(pos) => { positions.current.pending = pos; }}
        />
      )}
      {activeTab === 'completed' && (
        <ResponsiveTable
          ref={completedRef}
          data={completedOrders}
          columnDefinitions={columns}
          maxHeight="600px"
          onScrollPositionChange={(pos) => { positions.current.completed = pos; }}
        />
      )}
    </>
  );
}
```

> Use `requestAnimationFrame` when calling `scrollTo` immediately after switching tabs — the component needs to be in the DOM before the scroll target can be set.

---

### Subset Swap — Preserve Position Across Filter

The same table instance displays different slices of the same dataset. The user filters to "APAC region" while scrolled 400px down; you want to keep them roughly at that position in the filtered results.

```tsx
function OrdersPage() {
  const tableRef = useRef<ResponsiveTableHandle<Order>>(null);
  const savedPosition = useRef(0);
  const [region, setRegion] = useState<string>('all');

  const applyFilter = (newRegion: string) => {
    setRegion(newRegion);
    // Decide whether to restore the old position or reset to top.
    // Restoring makes sense if the filtered set overlaps the original.
    // Resetting to 0 makes sense if the set is completely different.
    requestAnimationFrame(() => {
      tableRef.current?.scrollTo(savedPosition.current);
    });
  };

  const filteredOrders = region === 'all'
    ? orders
    : orders.filter((o) => o.region === region);

  return (
    <>
      <RegionFilter value={region} onChange={applyFilter} />
      <ResponsiveTable
        ref={tableRef}
        data={filteredOrders}
        columnDefinitions={columns}
        maxHeight="600px"
        onScrollPositionChange={(pos) => { savedPosition.current = pos; }}
      />
    </>
  );
}
```

---

### Route Navigation — Save on Leave, Restore on Return

Store the position in route state (React Router v6 pattern). The position travels with the navigation history, so Back restores scroll context naturally.

```tsx
import { useLocation, useNavigate } from 'react-router-dom';

function OrdersPage() {
  const tableRef = useRef<ResponsiveTableHandle<Order>>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const restoredPosition = (location.state as { scrollPos?: number })?.scrollPos ?? 0;

  // Restore when the page mounts (Back navigation)
  useEffect(() => {
    if (restoredPosition > 0) {
      // Use a short delay to let content settle before scrolling
      const id = setTimeout(() => {
        tableRef.current?.scrollTo(restoredPosition);
      }, 50);
      return () => clearTimeout(id);
    }
  }, []);  // empty deps — read once at mount

  const navigateToDetail = (order: Order, currentScrollPos: number) => {
    navigate(`/orders/${order.id}`, {
      state: { scrollPos: currentScrollPos },
    });
  };

  const savedPosition = useRef(0);

  return (
    <ResponsiveTable
      ref={tableRef}
      data={orders}
      columnDefinitions={columns}
      onScrollPositionChange={(pos) => { savedPosition.current = pos; }}
      onRowClick={(order) => navigateToDetail(order, savedPosition.current)}
    />
  );
}
```

---

### Reset on Data Change

Sometimes the right UX is to snap to the top rather than restore. When a filter produces a completely different set of results, position 0 is more useful than a stale offset that may be past the end of the new shorter list.

```tsx
const [region, setRegion] = useState('all');
const tableRef = useRef<ResponsiveTableHandle<Order>>(null);

const applyFilter = (newRegion: string) => {
  setRegion(newRegion);
  requestAnimationFrame(() => {
    tableRef.current?.scrollTo(0);  // always reset to top on filter change
  });
};
```

---

## Best Practices

**Store the position in a ref, not in state.**
`onScrollPositionChange` fires on every scroll event. Updating a state variable on every call triggers a re-render on every scroll tick — unnecessary layout work. A ref stores the latest value without triggering renders:

```tsx
// Preferred
const pos = useRef(0);
<ResponsiveTable onScrollPositionChange={(p) => { pos.current = p; }} ... />

// Avoid — causes re-render on every scroll tick
const [pos, setPos] = useState(0);
<ResponsiveTable onScrollPositionChange={setPos} ... />
```

The only time `useState` is appropriate is when you're displaying the scroll position to the user (e.g., a "Back to top" button that appears after a threshold).

**Use `requestAnimationFrame` when restoring immediately after a render.**
`scrollTo` must run after the component is in the DOM and the browser has laid out its content. If you call `scrollTo` in a state-update callback or immediately in a `useEffect`, the scroll target may not exist yet:

```tsx
// Safe
requestAnimationFrame(() => tableRef.current?.scrollTo(savedPos));

// May silently no-op if the element is not yet laid out
tableRef.current?.scrollTo(savedPos);
```

**Guard against `null`.**
The ref is `null` until mount. Use optional chaining:

```tsx
tableRef.current?.scrollTo(savedPos);  // safe
tableRef.current.scrollTo(savedPos);   // throws before mount
```

**Match `maxHeight` setting to how you save position.**
The position reported by `onScrollPositionChange` corresponds to whatever is scrolling:
- With `maxHeight` → `scrollTop` of the internal div
- Without `maxHeight` → `window.scrollY`

`ref.scrollTo()` targets the same element. Do not mix positions from one mode with a restored call in another — e.g., save a position while `maxHeight="600px"` and then restore it after removing `maxHeight`. The values refer to different scroll containers and the restore will snap to the wrong location.

**Decide restore-vs-reset intentionally.**
Restoring the position is the right default for tab switches and back-navigation — the user returns to the same context. Resetting to 0 is often better after filter or sort changes that meaningfully reorder or shrink the dataset. There is no universal rule; the right answer depends on whether the new set of rows is recognisably "the same list" the user was scrolling through.

**Persist position outside React state for cross-session memory.**
`useRef` forgets the position on unmount. For a true "return to where you were" on page reload, persist to `sessionStorage` or `localStorage`:

```tsx
const savedPos = useRef(
  Number(sessionStorage.getItem('orders-scroll') ?? 0)
);

<ResponsiveTable
  onScrollPositionChange={(pos) => {
    savedPos.current = pos;
    sessionStorage.setItem('orders-scroll', String(pos));
  }}
  ...
/>
```

---

## Pitfalls and Edge Cases

**Calling `scrollTo` before the component mounts.**
The `ref` is `null` until the first render completes. An immediate `scrollTo` call in a `useEffect` with no delay or `requestAnimationFrame` may have no effect because the layout hasn't completed. If your `useEffect` runs before the browser paints, add a `requestAnimationFrame` or a minimal `setTimeout`.

**Restoring a position that is larger than the scrollable height.**
If the saved position was 800px but the new content is only 400px tall, `scrollTo(800)` is a no-op — both native `element.scrollTo` and `window.scrollTo` clamp to the maximum scrollable distance. This is silent and safe; the user lands at the bottom of the shorter list.

**`onScrollPositionChange` fires at full scroll event rate.**
The native scroll event fires on every frame while scrolling — potentially 60–120 times per second. If your callback writes to `localStorage`, makes an API call, or does any work more expensive than a simple ref assignment, wrap it in a throttle or debounce:

```tsx
import { useCallback, useRef } from 'react';

function useThrottle<T extends (...args: Parameters<T>) => void>(fn: T, ms: number): T {
  const last = useRef(0);
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last.current >= ms) {
      last.current = now;
      fn(...args);
    }
  }, [fn, ms]) as T;
}

const savePosition = useThrottle(
  (pos: number) => sessionStorage.setItem('scroll', String(pos)),
  200
);

<ResponsiveTable onScrollPositionChange={savePosition} ... />
```

**`onScrollPositionChange` identity must be stable.**
The prop is in the `useEffect` dependency array for the window listener. If you pass an inline arrow function without `useCallback`, the effect re-registers the window listener on every parent render — adding and removing the event listener repeatedly. Use `useCallback` or store the handler in a ref:

```tsx
// Safe — stable reference
const handleScroll = useCallback((pos: number) => {
  savedPos.current = pos;
}, []);

<ResponsiveTable onScrollPositionChange={handleScroll} ... />

// Risky — new function on every render, causes listener churn
<ResponsiveTable onScrollPositionChange={(pos) => { savedPos.current = pos; }} ... />
```

**Page-level scroll and `maxHeight` cannot be mixed on the same instance.**
`onScrollPositionChange` and `scrollTo` always target the same container — either the internal div (when `maxHeight` is set) or the window (when it is not). There is no API to listen to one and scroll the other. If you change `maxHeight` dynamically between renders, save and restore positions separately and do not carry a position from one mode across to the other.

**Mobile view scrolls the page, not a container.**
The mobile card layout expands to full height and is scrolled by the window. When `isMobile` is true (viewport is below `mobileBreakpoint`), the table behaves as if `maxHeight` were absent — the window listener is active and `scrollTo` targets `window`. This is consistent with the desktop page-level-scroll mode.

---

**Previous:** [Row Expansion and Collapse](./expand-collapse.md) | **Next:** [API Reference](./api.md)
