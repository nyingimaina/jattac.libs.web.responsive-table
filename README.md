# ResponsiveTable: A Modern and Flexible React Table Component

ResponsiveTable is a powerful, lightweight, and fully responsive React component for creating beautiful and functional tables. It’s designed to look great on any device, adapting from a traditional table layout on desktops to a clean, card-based view on mobile screens.

## Features

- **Mobile-First Design**: Automatically switches to a card layout on smaller screens for optimal readability.
- **Highly Customizable**: Tailor the look and feel of columns, headers, and footers.
- **Dynamic Data Handling**: Define columns and footers based on your data or application state.
- **Delightful Animations**: Includes an optional skeleton loader and staggered row entrance animations.
- **Interactive Elements**: Easily add click handlers for rows, headers, and footer cells.
- **Efficient & Responsive**: Built with efficiency in mind, including debounced resize handling for smooth transitions.
- **Easy to Use**: A simple and intuitive API for quick integration.
- **Extensible Plugin System**: Easily add new functionalities like filtering, sorting, or infinite scrolling.

## Installation

To get started, install the package from npm:

```bash
npm install jattac.libs.web.responsive-table
```

## Getting Started

Here’s a basic example to get you up and running in minutes.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const GettingStarted = () => {
  const columns = [
    { displayLabel: 'Name', dataKey: 'name', cellRenderer: (row) => row.name },
    { displayLabel: 'Age', dataKey: 'age', cellRenderer: (row) => row.age },
    { displayLabel: 'City', dataKey: 'city', cellRenderer: (row) => row.city },
  ];

  const data = [
    { name: 'Alice', age: 32, city: 'New York' },
    { name: 'Bob', age: 28, city: 'Los Angeles' },
    { name: 'Charlie', age: 45, city: 'Chicago' },
  ];

  return <ResponsiveTable columnDefinitions={columns} data={data} />;
};

export default GettingStarted;
```

This will render a table that automatically adapts to the screen size. On a desktop, it will look like a standard table, and on mobile, it will switch to a card-based layout.

---

## Comprehensive Examples

### Example 1: Loading State and Animations

You can provide a seamless user experience by showing a skeleton loader while your data is being fetched, and then animating the rows in when the data is ready.

```jsx
import React, { useState, useEffect } from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const AnimatedTable = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    { displayLabel: 'User', cellRenderer: (row) => row.name },
    { displayLabel: 'Email', cellRenderer: (row) => row.email },
  ];

  useEffect(() => {
    // Simulate a network request
    setTimeout(() => {
      setData([
        { name: 'Grace', email: 'grace@example.com' },
        { name: 'Henry', email: 'henry@example.com' },
      ]);
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <ResponsiveTable columnDefinitions={columns} data={data} animationProps={{ isLoading, animateOnLoad: true }} />
  );
};
```

### Example 2: Adding a Clickable Row Action

You can make rows clickable to perform actions, such as navigating to a details page or opening a modal.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const ClickableRows = () => {
  const columns = [
    { displayLabel: 'Product', cellRenderer: (row) => row.product },
    { displayLabel: 'Price', cellRenderer: (row) => `${row.price.toFixed(2)}` },
  ];

  const data = [
    { id: 1, product: 'Laptop', price: 1200 },
    { id: 2, product: 'Keyboard', price: 75 },
  ];

  const handleRowClick = (item) => {
    alert(`You clicked on product ID: ${item.id}`);
  };

  return <ResponsiveTable columnDefinitions={columns} data={data} onRowClick={handleRowClick} />;
};
```

### Example 3: Custom Cell Rendering

You can render any React component inside a cell, allowing for rich content like buttons, links, or status badges.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const CustomCells = () => {
  const columns = [
    { displayLabel: <strong>User</strong>, cellRenderer: (row) => <strong>{row.user}</strong> },
    {
      displayLabel: 'Status',
      cellRenderer: (row) => (
        <span
          style={{
            color: row.status === 'Active' ? 'green' : 'red',
            fontWeight: 'bold',
          }}
        >
          {row.status}
        </span>
      ),
    },
    {
      displayLabel: 'Action',
      cellRenderer: (row) => <button onClick={() => alert(`Editing ${row.user}`)}>Edit</button>,
    },
  ];

  const data = [
    { user: 'Eve', status: 'Active' },
    { user: 'Frank', status: 'Inactive' },
  ];

  return <ResponsiveTable columnDefinitions={columns} data={data} />;
};
```

### Example 4: Dynamic and Conditional Columns

Columns can be generated dynamically based on your data or application state. This is useful for creating flexible tables that adapt to different datasets.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const DynamicColumns = ({ isAdmin }) => {
  // Base columns for all users
  const columns = [
    { displayLabel: 'File Name', cellRenderer: (row) => row.fileName },
    { displayLabel: 'Size', cellRenderer: (row) => `${row.size} KB` },
  ];

  // Add an admin-only column conditionally
  if (isAdmin) {
    columns.push({
      displayLabel: 'Admin Actions',
      cellRenderer: (row) => <button onClick={() => alert(`Deleting ${row.fileName}`)}>Delete</button>,
    });
  }

  const data = [
    { fileName: 'document.pdf', size: 1024 },
    { fileName: 'image.jpg', size: 512 },
  ];

  return <ResponsiveTable columnDefinitions={columns} data={data} />;
};
```

### Example 5: Advanced Footer with Labels and Interactivity

You can add a footer to display summary information, such as totals or averages. The footer is also responsive and will appear correctly in both desktop and mobile views. With the enhanced footer functionality, you can provide explicit labels for mobile view and add click handlers to footer cells.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const TableWithFooter = () => {
  const columns = [
    { displayLabel: 'Item', cellRenderer: (row) => row.item },
    { displayLabel: 'Quantity', cellRenderer: (row) => row.quantity },
    { displayLabel: 'Price', cellRenderer: (row) => `${row.price.toFixed(2)}` },
  ];

  const data = [
    { item: 'Apples', quantity: 10, price: 1.5 },
    { item: 'Oranges', quantity: 5, price: 2.0 },
    { item: 'Bananas', quantity: 15, price: 0.5 },
  ];

  const total = data.reduce((sum, row) => sum + row.quantity * row.price, 0);

  const footerRows = [
    {
      columns: [
        {
          colSpan: 2,
          cellRenderer: () => <strong>Total:</strong>,
        },
        {
          colSpan: 1,
          displayLabel: 'Total',
          cellRenderer: () => <strong>${total.toFixed(2)}</strong>,
          onCellClick: () => alert('Total clicked!'),
        },
      ],
    },
  ];

  return <ResponsiveTable columnDefinitions={columns} data={data} footerRows={footerRows} />;
};
```

### Example 6: Disabling Page-Level Sticky Header

By default, the table header remains fixed to the top of the viewport as the user scrolls down the page. This ensures the column titles are always visible. To disable this behavior and have the header scroll away with the rest of the page, set the `enablePageLevelStickyHeader` prop to `false`.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const NonStickyHeaderTable = () => {
  // We need enough data to make the page scroll
  const data = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    item: `Item #${i + 1}`,
    description: 'This is a sample item.',
  }));

  const columns = [
    { displayLabel: 'ID', cellRenderer: (row) => row.id },
    { displayLabel: 'Item', cellRenderer: (row) => row.item },
    { displayLabel: 'Description', cellRenderer: (row) => row.description },
  ];

  return (
    <div>
      <h1 style={{ height: '50vh', display: 'flex', alignItems: 'center' }}>Scroll down to see the table</h1>
      <ResponsiveTable
        columnDefinitions={columns}
        data={data}
        enablePageLevelStickyHeader={false} // <-- Here's the magic switch!
      />
      <div style={{ height: '50vh' }} />
    </div>
  );
};
```

---

## Plugin System

ResponsiveTable is designed with an extensible plugin system, allowing developers to easily add new functionalities or modify existing behaviors without altering the core component. Plugins can interact with the table's data, render custom UI elements (like headers or footers), and respond to table events.

### How to Use Plugins

Plugins are passed to the `ResponsiveTable` component via the `plugins` prop, which accepts an array of `IResponsiveTablePlugin` instances. Some common functionalities, like filtering and infinite scrolling, are provided as built-in plugins that can be enabled via specific props (`filterProps` and `infiniteScrollProps`). When these props are used, the corresponding built-in plugins are automatically initialized if not already provided in the `plugins` array.

```jsx
import React from 'react';
// Note: All plugins are exported from the main package entry point.
import ResponsiveTable, { FilterPlugin } from 'jattac.libs.web.responsive-table';

const MyTableWithPlugins = () => {
  const columns = [
    { displayLabel: 'Name', dataKey: 'name', cellRenderer: (row) => row.name, getFilterableValue: (row) => row.name },
    {
      displayLabel: 'Age',
      dataKey: 'age',
      cellRenderer: (row) => row.age,
      getFilterableValue: (row) => row.age.toString(),
    },
  ];

  const data = [
    { name: 'Alice', age: 32 },
    { name: 'Bob', age: 28 },
    { name: 'Charlie', age: 45 },
  ];

  return (
    <ResponsiveTable
      columnDefinitions={columns}
      data={data}
      // Enable built-in filter plugin via props
      filterProps={{ showFilter: true, filterPlaceholder: 'Search by name or age...' }}
      // Or provide a custom instance of the plugin
      // plugins={[new FilterPlugin()]}
    />
  );
};
```

### Built-in Plugins

#### `SortPlugin`

The `SortPlugin` provides powerful, type-safe, and highly customizable column sorting. It adds intuitive UI cues, allowing users to click column headers to sort the data in ascending, descending, or original order.

**Enabling the `SortPlugin`:**

To use the plugin, you must first import it and provide a generic instance of it to the `plugins` prop. The real power comes from making the plugin instance generic with your data type, which provides type-safety and IDE autocompletion for the sort comparer helpers.

```jsx
import React from 'react';
import ResponsiveTable, { IResponsiveTableColumnDefinition, SortPlugin } from 'jattac.libs.web.responsive-table';

// Define the shape of your data
interface User {
  id: number;
  name: string;
  signupDate: string;
  logins: number;
}

// 1. Create a single, generic instance of the plugin.
//    This is the ONLY setup step required.
const sortPlugin = new SortPlugin<User>({
  initialSortColumn: 'logins',
  initialSortDirection: 'desc',
});

// 2. Define the columns, using the helpers directly from the plugin instance.
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  // ... see examples below
];

const UserTable = ({ users }) => (
  <ResponsiveTable
    columnDefinitions={columnDefinitions}
    data={users}
    // 3. Pass the already-configured plugin to the table.
    plugins={[sortPlugin]}
  />
);
```

**How to Make Columns Sortable (Opt-In):**

A column is made sortable by adding either a `sortComparer` or a `getSortableValue` property to its definition.

- `sortComparer`: A function that defines the exact comparison logic. This is the most powerful option and should be used for complex data types or custom logic.
- `getSortableValue`: A simpler function that just returns the primitive value (string, number, etc.) to be used in a default comparison.

**Example 1: Using Type-Safe Comparer Helpers**

The `SortPlugin` instance provides a `comparers` object with pre-built, type-safe helper functions to eliminate boilerplate for common sorting scenarios. This is the recommended approach.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (user) => user.name,
    // The plugin instance itself provides the type-safe helpers.
    // The string 'name' is fully type-checked against the User interface.
    sortComparer: sortPlugin.comparers.caseInsensitiveString('name'),
  },
  {
    displayLabel: 'Signup Date',
    dataKey: 'signupDate',
    cellRenderer: (user) => new Date(user.signupDate).toLocaleDateString(),
    // IDE autocompletion for 'signupDate' works perfectly.
    sortComparer: sortPlugin.comparers.date('signupDate'),
  },
  {
    displayLabel: 'Logins',
    dataKey: 'logins',
    cellRenderer: (user) => user.logins,
    sortComparer: sortPlugin.comparers.numeric('logins'),
  },
  {
    displayLabel: 'Actions',
    // This column is NOT sortable because it has no sort-related properties.
    cellRenderer: (user) => <button>View</button>,
  },
];
```

**Example 2: Writing a Custom `sortComparer`**

For unique requirements, you can write your own comparison function from scratch.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (user) => user.name,
    // Writing custom logic for a case-sensitive sort
    sortComparer: (a, b, direction) => {
      const nameA = a.name; // No .toLowerCase()
      const nameB = b.name;
      if (nameA < nameB) return direction === 'asc' ? -1 : 1;
      if (nameA > nameB) return direction === 'asc' ? 1 : -1;
      return 0;
    },
  },
];
```

**Example 3: Using `getSortableValue` for Simple Cases**

If you don't need special logic, `getSortableValue` is a concise way to enable default sorting on a property.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Logins',
    dataKey: 'logins',
    cellRenderer: (user) => user.logins,
    // This enables a simple, default numerical sort on the 'logins' property.
    getSortableValue: (user) => user.logins,
  },
];
```

**Plugin Options (via `new SortPlugin(options)`):**

| Prop                   | Type (`keyof TData`) | Description                                       |
| ---------------------- | -------------------- | ------------------------------------------------- |
| `initialSortColumn`    | `string`             | The `dataKey` of the column to sort by initially. |
| `initialSortDirection` | `'asc' \| 'desc'`    | The direction for the initial sort.               |

**`SortPlugin.comparers` API:**

The `comparers` object on your `SortPlugin` instance provides the following helper methods. Each method is a factory that takes a `dataKey` (which is type-checked against your data model) and returns a `sortComparer` function.

| Method                           | Description                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `numeric(dataKey)`               | Performs a standard numerical sort.                                           |
| `caseInsensitiveString(dataKey)` | Performs a case-insensitive alphabetical sort.                                |
| `date(dataKey)`                  | Correctly sorts dates, assuming the data is a valid date string or timestamp. |

#### `FilterPlugin`

Provides a search input to filter table data. It can be enabled by setting `filterProps.showFilter` to `true` on the `ResponsiveTable` component. For columns to be filterable, you must provide a `getFilterableValue` function in their `IResponsiveTableColumnDefinition`.

**Props for `FilterPlugin` (via `filterProps` on `ResponsiveTable`):**

| Prop                | Type      | Description                                                     |
| ------------------- | --------- | --------------------------------------------------------------- |
| `showFilter`        | `boolean` | If `true`, displays a filter input field above the table.       |
| `filterPlaceholder` | `string`  | Placeholder text for the filter input. Defaults to "Search...". |

**Example with `FilterPlugin`:**

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const FilterableTable = () => {
  const initialData = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' },
    { id: 3, name: 'Charlie', email: 'charlie@example.com' },
    { id: 4, name: 'David', email: 'david@example.com' },
  ];

  const columns = [
    { displayLabel: 'ID', cellRenderer: (row) => row.id, getFilterableValue: (row) => row.id.toString() },
    { displayLabel: 'Name', cellRenderer: (row) => row.name, getFilterableValue: (row) => row.name },
    { displayLabel: 'Email', cellRenderer: (row) => row.email, getFilterableValue: (row) => row.email },
  ];

  return (
    <ResponsiveTable
      columnDefinitions={columns}
      data={initialData}
      filterProps={{ showFilter: true, filterPlaceholder: 'Filter users...' }}
    />
  );
};
```

#### `InfiniteScrollPlugin`

Enables a simple infinite scroll for loading more data as the user scrolls to the bottom of the table. This is useful for progressively loading data from an API without needing traditional pagination buttons.

> **Important:** To enable infinite scroll, you **must** give the table a bounded height. This is done by passing the `maxHeight` prop to the `<ResponsiveTable>`. This prop creates a scrollable container for the table body, which is required for the scroll detection to work.

> **Performance Note:** This implementation renders all loaded rows into the DOM to guarantee correct column alignment and simplicity. It is **not a virtualized list**. For extremely large datasets (many thousands of rows), performance may degrade as more rows are loaded. It is best suited for scenarios where loading a few hundred up to a couple thousand rows is expected.

**Configuration (via `infiniteScrollProps` on `ResponsiveTable`):**

| Prop                   | Type                                         | Description                                                                                                                              |
| ---------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `enableInfiniteScroll` | `boolean`                                    | If `true`, enables infinite scrolling.                                                                                                   |
| `hasMore`              | `boolean`                                    | Set to `true` if there is more data to load, `false` otherwise. This tells the table whether to show the loading indicator.              |
| `onLoadMore`           | `(currentData: TData[]) => Promise<TData[]>` | A callback function that fires when the user scrolls near the end. It should fetch the next page of data and return it in a Promise. |
| `loadingMoreComponent` | `ReactNode`                                  | A custom component to display at the bottom while new data is being loaded. Defaults to "Loading more...".                               |
| `noMoreDataComponent`  | `ReactNode`                                  | A custom component to display at the bottom when `hasMore` is `false`. Defaults to "No more data.".                                      |

**Comprehensive Example:**

Here is a complete example showing how to use the infinite scroll feature. The parent component only needs to provide a function that fetches the next page of data.

```jsx
import React, { useState, useCallback } from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';

// Define the shape of our data items
interface DataItem {
  id: number;
  value: string;
}

// This is a mock API function to simulate fetching data.
// In a real app, this would be an actual network request.
const fetchData = async (page: number): Promise<DataItem[]> => {
  console.log(`Fetching page: ${page}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return an empty array for pages > 5 to simulate the end of the data
      if (page > 5) {
        resolve([]);
        return;
      }
      // Generate 20 new items for the current page
      const newData = Array.from({ length: 20 }, (_, i) => ({
        id: page * 20 + i,
        value: `Item #${page * 20 + i}`,
      }));
      resolve(newData);
    }, 500); // Simulate network latency
  });
};

const InfiniteScrollExample = () => {
  // Keep track of the next page to fetch.
  const [nextPage, setNextPage] = useState(0);

  // The onLoadMore function is now much simpler.
  // It just needs to fetch the data and return it.
  // The table will handle appending the data and managing the `hasMore` state internally.
  const loadMoreItems = useCallback(async () => {
    const newItems = await fetchData(nextPage);
    setNextPage((prevPage) => prevPage + 1);
    return newItems; // <-- Simply return the new items
  }, [nextPage]);

  const columns = [
    { displayLabel: 'ID', dataKey: 'id', cellRenderer: (row) => row.id },
    { displayLabel: 'Value', dataKey: 'value', cellRenderer: (row) => row.value },
  ];

  return (
    // The table MUST be inside a container with a defined height.
    <div style={{ height: '400px' }}>
      <ResponsiveTable
        columnDefinitions={columns}
        data={[]} // Start with an empty array of initial data
        maxHeight="100%"
        infiniteScrollProps={{
          enableInfiniteScroll: true,
          onLoadMore: loadMoreItems,
          // Note: `hasMore` is not needed! The component infers it.
          loadingMoreComponent: <h4>Loading more items...</h4>,
          noMoreDataComponent: <p>You've reached the end!</p>,
        }}
      />
    </div>
  );
};
```

---

## API Reference

### `ResponsiveTable` Props

| Prop                          | Type                                 | Required | Description                                                                                         |
| ----------------------------- | ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------- |
| `columnDefinitions`           | `IResponsiveTableColumnDefinition[]` | Yes      | An array of objects defining the table columns.                                                     |
| `data`                        | `TData[]`                            | Yes      | An array of data objects to populate the table rows.                                                |
| `footerRows`                  | `IFooterRowDefinition[]`             | No       | An array of objects defining the table footer.                                                      |
| `onRowClick`                  | `(item: TData) => void`              | No       | A callback function that is triggered when a row is clicked.                                        |
| `noDataComponent`             | `ReactNode`                          | No       | A custom component to display when there is no data.                                                |
| `maxHeight`                   | `string`                             | No       | Sets a maximum height for the table body, making it scrollable.                                     |
| `mobileBreakpoint`            | `number`                             | No       | The pixel width at which the table switches to the mobile view. Defaults to `600`.                  |
| `enablePageLevelStickyHeader` | `boolean`                            | No       | If `false`, disables the header from sticking to the top of the page on scroll. Defaults to `true`. |
| `plugins`                     | `IResponsiveTablePlugin<TData>[]`    | No       | An array of plugin instances to extend table functionality.                                         |
| `infiniteScrollProps`         | `object`                             | No       | Configuration for the built-in infinite scroll plugin.                                              |
| `filterProps`                 | `object`                             | No       | Configuration for the built-in filter plugin.                                                       |
| `animationProps`              | `object`                             | No       | Configuration for animations, including `isLoading` and `animateOnLoad`.                            |

### `IResponsiveTableColumnDefinition<TData>`

| Property             | Type                                                         | Required | Description                                                                              |
| -------------------- | ------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------- |
| `displayLabel`       | `ReactNode`                                                  | Yes      | The label displayed in the table header (can be a string or any React component).        |
| `cellRenderer`       | `(row: TData) => ReactNode`                                  | Yes      | A function that returns the content to be rendered in the cell.                          |
| `dataKey`            | `string`                                                     | No       | A key to match the column to a property in the data object (required for sorting).       |
| `interactivity`      | `object`                                                     | No       | An object to define header interactivity (`onHeaderClick`, `id`, `className`).           |
| `getFilterableValue` | `(row: TData) => string \| number`                           | No       | A function that returns the string or number value to be used for filtering this column. |
| `getSortableValue`   | `(row: TData) => any`                                        | No       | A function that returns a primitive value from a row to be used for default sorting.     |
| `sortComparer`       | `(a: TData, b: TData, direction: 'asc' \| 'desc') => number` | No       | A function that provides the precise comparison logic for sorting a column.              |

### `IFooterRowDefinition`

| Property  | Type                        | Required | Description                                        |
| --------- | --------------------------- | -------- | -------------------------------------------------- |
| `columns` | `IFooterColumnDefinition[]` | Yes      | An array of column definitions for the footer row. |

### `IFooterColumnDefinition`

| Property       | Type              | Required | Description                                                                                                                                                                                                                                      |
| -------------- | ----------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `colSpan`      | `number`          | Yes      | The number of columns the footer cell should span.                                                                                                                                                                                               |
| `cellRenderer` | `() => ReactNode` | Yes      | A function that returns the content for the footer cell.                                                                                                                                                                                         |
| `displayLabel` | `ReactNode`       | No       | An optional, explicit label for the footer cell. In mobile view, if `colSpan` is 1 and this is not provided, the corresponding column header will be used as a fallback. This is required for `colSpan` > 1 if you want a label to be displayed. |
| `onCellClick`  | `() => void`      | No       | An optional click handler for the footer cell.                                                                                                                                                                                                   |
| `className`    | `string`          | No       | Optional class name for custom styling of the footer cell.                                                                                                                                                                                       |

## License

This project is licensed under the MIT License.
