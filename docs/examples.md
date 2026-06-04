# Technical Implementation Guide
## Implementation Patterns for the ResponsiveTable Component

This guide details standard implementation patterns for the ResponsiveTable component, ordered by increasing complexity. Each section contains a production-ready example designed for integration into enterprise applications.

## Table of Contents
*   [Standard Tabular Implementation](#1-standard-tabular-implementation)
*   [Implementing Sortable Columns](#2-implementing-sortable-columns)
*   [Asynchronous Data Filtering](#3-asynchronous-data-filtering)
*   [Row Selection Mechanisms](#4-row-selection-mechanisms)
*   [Navigation and Master-Detail Patterns](#5-navigation-and-master-detail-patterns)
*   [Programmatic Column Visibility Management](#6-programmatic-column-visibility-management)
*   [Automated Footer Scaling Logic](#7-automated-footer-scaling-logic)
*   [High-Volume Data: Asynchronous Infinite Scroll](#8-high-volume-data-asynchronous-infinite-scroll)
   *   [Internal Plugin Development](#9-internal-plugin-development)
   *   [Server-Side Search with dataSource](#10-server-side-search-with-datasource)
   *   [Observing dataSource State: Callbacks](#11-observing-datasource-state-callbacks)
   *   [Imperative Control via Ref](#12-imperative-control-via-ref)
   *   [Error Handling and Retry](#13-error-handling-and-retry)
   *   [Expandable Rows](#14-expandable-rows)

---

[← Return to Overview](../README.md)

### 1. Standard Tabular Implementation
A baseline implementation for displaying structured data. The component will automatically transition to a card-based layout when the viewport width is less than 600px.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const data = [
  { id: 1, name: 'Administrative User', role: 'Administrator' },
  { id: 2, name: 'Standard User', role: 'User' },
];

const columns = [
  { displayLabel: 'User Name', cellRenderer: (row) => row.name },
  { displayLabel: 'Assigned Role', cellRenderer: (row) => row.role },
];

export const BasicTable = () => (
  <ResponsiveTable data={data} columnDefinitions={columns} />
);
```

### 2. Implementing Sortable Columns
Enable sorting by defining a unique `columnId` and an associated sorting strategy via `getSortableValue` or a custom `sortComparer`.

```tsx
const columns = [
  { 
    columnId: 'name', 
    displayLabel: 'Name', 
    cellRenderer: (row) => row.name,
    getSortableValue: (row) => row.name // Lexicographical sort
  },
  { 
    columnId: 'date', 
    displayLabel: 'Registration Date', 
    cellRenderer: (row) => row.date.toLocaleDateString(),
    sortComparer: (a, b, dir) => { // Chronological sort implementation
      const diff = a.date.getTime() - b.date.getTime();
      return dir === 'asc' ? diff : -diff;
    }
  },
];
```

### 3. Asynchronous Data Filtering
Implement client-side data filtering by providing the `filterProps` configuration object.

```tsx
const columns = [
  { 
    displayLabel: 'Name', 
    cellRenderer: (row) => row.name,
    getFilterableValue: (row) => row.name // Search target definition
  },
];

<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  filterProps={{ showFilter: true, filterPlaceholder: 'Filter by name...' }} 
/>
```

### 4. Row Selection Mechanisms
The component supports persistent row selection in both single and multiple selection modes. State is maintained across re-renders via internal plugin orchestration.

```tsx
<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  selectionProps={{
    mode: 'multiple',
    rowIdKey: 'id',
    onSelectionChange: (items) => console.info('Current Selection:', items)
  }} 
/>
```

### 5. Navigation and Master-Detail Patterns
The `onRowClick` callback allows for the implementation of navigation patterns or detailed data inspection.

```tsx
<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  onRowClick={(row) => navigateToDetail(row.id)} 
/>
```

### 6. Programmatic Column Visibility Management
Toggle column visibility dynamically. The component will automatically adjust the layout to reflect changes in the visible column set.

```tsx
const [isRoleVisible, setIsRoleVisible] = useState(false);

const columns = [
  { displayLabel: 'User Name', cellRenderer: (row) => row.name },
  { 
    displayLabel: 'Assigned Role', 
    cellRenderer: (row) => row.role,
    visible: isRoleVisible // State-driven visibility
  },
];
```

### 7. Automated Footer Scaling Logic
When columns are programmatically hidden, the component automatically recalculates the `colSpan` of defined footer cells to maintain structural integrity.

```tsx
const footerRows = [
  {
    columns: [
      { colSpan: 2, cellRenderer: () => <strong>Aggregate Totals</strong> },
      { colSpan: 1, cellRenderer: () => <span>Count: {data.length}</span> },
    ]
  }
];

<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  footerRows={footerRows} 
/>
```

### 8. High-Volume Data: Smart Data Source (Infinite Scroll)
For datasets that exceed standard memory constraints, the `dataSource` pattern allows for seamless incremental data fetching during vertical scrolling. The table manages page tracking, data concatenation, and loading states automatically.

#### The Painless Implementation
Provide a single async function that returns the next batch of data.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

export const InfiniteUserTable = () => {
  const fetchUsers = async ({ page, pageSize, sort, filter }) => {
    // Forward table state directly to your API
    const response = await api.users.get({ 
      page, 
      limit: pageSize,
      search: filter,
      sortBy: sort?.columnId 
    });
    
    // Return items; table detects EOF automatically if items.length < pageSize
    return response.items; 
  };

  return (
    <ResponsiveTable
      dataSource={fetchUsers}
      pageSize={20}
      columnDefinitions={columns}
      animationProps={{ animateOnLoad: true }}
    />
  );
};
```

---

### 9. Internal Plugin Development
Extend the functional capabilities of the component by implementing the `IResponsiveTablePlugin` interface.

```tsx
import { IResponsiveTablePlugin } from 'jattac.libs.web.responsive-table';

class CustomStylingPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'status-styler';

  public getRowProps = (row: any) => {
    if (row.isActive) return { className: 'row-active' };
    return { className: 'row-inactive' };
  };
}

// Integration
<ResponsiveTable 
  data={data} 
  columnDefinitions={columns} 
  plugins={[new CustomStylingPlugin()]} 
/>
```

### 10. Server-Side Search with dataSource
Enable REST-powered search by setting `filterProps.mode` to `'server'`. Filter input changes will trigger a `dataSource` re-fetch with the `filter` parameter, rather than filtering in-memory.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const columns = [
  {
    columnId: 'name',
    displayLabel: 'Name',
    cellRenderer: (row) => row.name,
  },
  {
    columnId: 'email',
    displayLabel: 'Email',
    cellRenderer: (row) => row.email,
  },
];

const searchUsers = async ({ page, pageSize, filter }) => {
  // Forward the filter term to your API
  const response = await api.users.search({
    page,
    limit: pageSize,
    query: filter, // Comes from the search input
  });
  return response.items;
};

export const ServerSearchTable = () => (
  <ResponsiveTable
    dataSource={searchUsers}
    pageSize={20}
    columnDefinitions={columns}
    filterProps={{
      showFilter: true,
      filterPlaceholder: 'Search by name or email...',
      mode: 'server', // Enables server-side search
    }}
  />
);
```

### 11. Observing dataSource State: Callbacks
Track pagination, loading, and error state changes from outside the component.

```tsx
import { useState } from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

export const ObservableTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  return (
    <ResponsiveTable
      dataSource={async ({ page, pageSize, filter, sort }) => {
        const response = await api.items.list({ page, limit: pageSize });
        return response;
      }}
      pageSize={20}
      columnDefinitions={columns}
      onPageChange={(page) => setCurrentPage(page)}
      onDataSourceStateChange={(state) => {
        setTotalItems(state.totalCount ?? 0);
        console.log('Page:', state.currentPage, 'Loading:', state.isLoading);
      }}
      onDataSourceError={(error) => {
        console.error('Fetch failed:', error.message);
      }}
    />
  );
};
```

### 12. Imperative Control via Ref
Programmatically control pagination and read state using a ref.

```tsx
import { useRef } from 'react';
import ResponsiveTable, { ResponsiveTableHandle } from 'jattac.libs.web.responsive-table';

export const ImperativeTable = () => {
  const tableRef = useRef<ResponsiveTableHandle<MyData>>(null);

  const handleRefresh = () => {
    tableRef.current?.resetAndFetch();
  };

  const handleLogState = () => {
    const state = tableRef.current?.getState();
    console.log('Current state:', state);
  };

  return (
    <>
      <button onClick={handleRefresh}>Refresh</button>
      <button onClick={handleLogState}>Log State</button>
      <ResponsiveTable
        ref={tableRef}
        dataSource={async ({ page, pageSize }) => {
          const response = await api.items.list({ page, limit: pageSize });
          return response;
        }}
        pageSize={20}
        columnDefinitions={columns}
      />
    </>
  );
};
```

### 13. Error Handling and Retry
When a `dataSource` fetch fails, the component displays an error message with a **Retry** button. The error state and retry are also accessible via callbacks and the imperative handle.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

// The component handles errors automatically:
// - Shows "Failed to load data" with the error message
// - Provides a "Retry" button that calls resetAndFetch()
// - Exposes onDataSourceError callback for custom handling

export const ResilientTable = () => (
  <ResponsiveTable
    dataSource={async ({ page, pageSize }) => {
      // Simulate an unreliable API
      const response = await fetch(`/api/items?page=${page}&limit=${pageSize}`);
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      return response.json();
    }}
    pageSize={20}
    columnDefinitions={columns}
    onDataSourceError={(error) => {
      // Optionally log to your error tracking service
      reportError(error);
    }}
  />
);
```

### 14. Expandable Rows
Attach collapsible detail panels below any row using `expandRowRenderer`. Return `null` for rows that should not be expandable. Provide `selectionProps.rowIdKey` to ensure expanded panels survive re-sorts and filter changes.

```tsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

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

export const ExpandableOrderTable = () => (
  <ResponsiveTable
    data={orders}
    columnDefinitions={columns}
    // Stable expand state: survives sort and filter
    selectionProps={{ rowIdKey: 'id', onSelectionChange: () => {} }}
    // Return null for orders with no line items — no toggle rendered for those rows
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
);
```

For the complete feature reference including lazy mounting, keyboard accessibility, combining with `dataSource`, and CSS customization, see the **[Row Expansion and Collapse Guide](./expand-collapse.md)**.

---
**Previous:** [Overview](../README.md) | **Next:** [Functional Capabilities](./features.md)
