# ResponsiveTable: A Modern and Flexible React Table Component

[![npm version](https://badge.fury.io/js/jattac.libs.web.responsive-table.svg)](https://badge.fury.io/js/jattac.libs.web.responsive-table)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ResponsiveTable is a powerful, lightweight, and fully responsive React component for creating beautiful and functional tables. It’s designed to look great on any device, adapting from a traditional table layout on desktops to a clean, card-based view on mobile screens.

## Features

*   **Truly Responsive:** Automatically transforms from a traditional table to a card-based layout on mobile.
*   **Extensible Plugin System:** Add features like sorting, filtering, selection, and infinite scroll with ease.
*   **Type-Safe API:** Built with TypeScript for a great developer experience.
*   **Highly Customizable:** Control the rendering of every part of the table.
*   **Animations:** Built-in support for loading skeletons and row animations.
*   **Small Bundle Size:** Lightweight and optimized for performance.

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Core Concepts](#core-concepts)
  - [Column Definitions](#column-definitions)
  - [Responsive Behavior](#responsive-behavior)
- [Advanced Guides](#advanced-guides)
  - [Custom Cell Rendering](#custom-cell-rendering)
  - [Clickable Rows and Headers](#clickable-rows-and-headers)
  - [Dynamic and Conditional Columns](#dynamic-and-conditional-columns)
  - [Advanced Footers](#advanced-footers)
  - [Animations and Loading States](#animations-and-loading-states)
- [Plugin System](#plugin-system)
  - [Using Plugins](#using-plugins)
  - [Built-in Plugins](#built-in-plugins)
    - [SortPlugin](#sortplugin)
    - [SelectionPlugin](#selectionplugin)
    - [FilterPlugin](#filterplugin)
    - [InfiniteScrollPlugin](#infinitescrollplugin)
  - [Building a Custom Plugin](#building-a-custom-plugin)
- [API Reference](#api-reference)
  - [ResponsiveTable Props](#responsivetable-props)
  - [ColumnDefinition Type](#columndefinition-type)
  - [Footer Types](#footer-types)
- [Performance Best Practices](#performance-best-practices)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

Install the package using your favorite package manager:

```bash
npm install jattac.libs.web.responsive-table
```

or

```bash
yarn add jattac.libs.web.responsive-table
```

## Getting Started

Here's a basic example to get you up and running with `ResponsiveTable`:

```jsx
import React from 'react';
import ResponsiveTable, { IResponsiveTableColumnDefinition } from 'jattac.libs.web.responsive-table';

// 1. Define your data structure
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// 2. Provide the data
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: 'Admin' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: 'User' },
  { id: 3, name: 'Charlie', email: 'charlie@example.com', role: 'User' },
];

// 3. Define the column structure
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Name',
    cellRenderer: (row) => row.name,
  },
  {
    displayLabel: 'Email',
    cellRenderer: (row) => row.email,
  },
  {
    displayLabel: 'Role',
    cellRenderer: (row) => row.role,
  },
];

// 4. Render the component
const App = () => (
  <div style={{ padding: '2rem' }}>
    <h1>Users</h1>
    <ResponsiveTable<User>
      data={users}
      columnDefinitions={columnDefinitions}
    />
  </div>
);

export default App;
```

---

## Core Concepts

### Column Definitions

The `columnDefinitions` prop is the heart of the table. It's an array of objects where each object defines a column. The two most important properties are:

*   `displayLabel`: The content of the header cell.
*   `cellRenderer`: A function that receives the row data and returns the content of the cell.

### Responsive Behavior

The table is responsive out of the box. It will render as a standard table on large screens and as a list of cards on small screens. You can control the breakpoint at which this change happens with the `mobileBreakpoint` prop.

---

## Advanced Guides

### Custom Cell Rendering

You can render any React component in a cell using the `cellRenderer` function.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Status',
    cellRenderer: (row) => (
      <span style={{
        color: row.isActive ? 'green' : 'red',
        fontWeight: 'bold',
      }}>
        {row.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    displayLabel: 'Actions',
    cellRenderer: (row) => (
      <button onClick={() => alert(`Editing ${row.name}`)}>
        Edit
      </button>
    ),
  },
];
```

### Clickable Rows and Headers

*   **Rows:** Use the `onRowClick` prop to handle row clicks.
*   **Headers:** Use the `interactivity` property in a column definition to handle header clicks.

```jsx
<ResponsiveTable
  data={users}
  columnDefinitions={[
    {
      displayLabel: 'Name',
      cellRenderer: (row) => row.name,
      interactivity: {
        id: 'name-header',
        onHeaderClick: (id) => alert(`Clicked ${id}`),
      },
    },
    // ...
  ]}
  onRowClick={(row) => alert(`Clicked on ${row.name}`)}
/>
```

### Dynamic and Conditional Columns

The `columnDefinitions` prop can be a function that returns an array of column definitions. This allows you to dynamically change the columns based on the data.

```jsx
const getColumnDefinitions = (user: User): IResponsiveTableColumnDefinition<User>[] => {
  const columns: IResponsiveTableColumnDefinition<User>[] = [
    // ... common columns
  ];

  if (user.role === 'Admin') {
    columns.push({
      displayLabel: 'Admin Actions',
      cellRenderer: () => <button>Delete User</button>,
    });
  }

  return columns;
};

<ResponsiveTable
  data={users}
  columnDefinitions={getColumnDefinitions}
/>
```

### Advanced Footers

You can add footer rows to the table using the `footerRows` prop.

```jsx
const footerRows: IFooterRowDefinition[] = [
  {
    columns: [
      {
        colSpan: 2,
        cellRenderer: () => <strong>Total Users:</strong>,
      },
      {
        colSpan: 1,
        cellRenderer: () => <strong>{users.length}</strong>,
      },
    ],
  },
];

<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  footerRows={footerRows}
/>
```

### Animations and Loading States

Use the `animationProps` prop to show a loading skeleton and animate rows on load.

```jsx
<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  animationProps={{
    isLoading: true, // Shows a skeleton loader
    animateOnLoad: true, // Animates rows on initial render
  }}
/>
```

---

## Plugin System

### Using Plugins

Some plugins are enabled automatically when you provide the correct props (`selectionProps`, `filterProps`, `sortProps`). For others, you may need to instantiate them and pass them to the `plugins` prop.

### Built-in Plugins

#### SortPlugin

Enables column sorting.

**Simple Usage (Recommended):**

The `SortPlugin` is automatically enabled when you make one or more columns sortable.

1.  Add a `columnId` to the columns you want to be sortable.
2.  Provide a `sortComparer` or `getSortableValue` function in the column definition.
3.  (Optional) Provide `sortProps` to set the initial sort order.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    columnId: 'name',
    displayLabel: 'Name',
    cellRenderer: (row) => row.name,
    getSortableValue: (row) => row.name, // Make this column sortable
  },
  // ...
];

<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  sortProps={{
    initialSortColumn: 'name',
    initialSortDirection: 'asc',
  }}
/>
```

**Advanced Usage:**

You can also instantiate the `SortPlugin` yourself to get access to the `comparers` helper functions.

```jsx
import { SortPlugin } from 'jattac.libs.web.responsive-table';

const sortPlugin = new SortPlugin<User>();

const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    columnId: 'name',
    displayLabel: 'Name',
    cellRenderer: (row) => row.name,
    sortComparer: sortPlugin.comparers.caseInsensitiveString('name'),
  },
  // ...
];

<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  plugins={[sortPlugin]}
/>
```

#### SelectionPlugin

Enables row selection.

**Usage:**

The `SelectionPlugin` is automatically enabled when you provide the `selectionProps`.

```jsx
<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  selectionProps={{
    onSelectionChange: (selectedItems) => console.log(selectedItems),
    rowIdKey: 'id',
    mode: 'multiple', // or 'single'
  }}
/>
```

#### FilterPlugin

Adds a client-side search input to filter the table.

**Usage:**

The `FilterPlugin` is automatically enabled when you provide the `filterProps`. Add a `getFilterableValue` function to the columns you want to be filterable.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    displayLabel: 'Name',
    cellRenderer: (row) => row.name,
    getFilterableValue: (row) => row.name,
  },
  // ...
];

<ResponsiveTable
  data={users}
  columnDefinitions={columnDefinitions}
  filterProps={{
    showFilter: true,
    filterPlaceholder: 'Search users...',
  }}
/>
```

#### InfiniteScrollPlugin

Enables infinite scrolling.

**Usage:**

```jsx
import { InfiniteScrollPlugin } from 'jattac.libs.web.responsive-table';

const onLoadMore = async (currentData) => {
  // Fetch more data...
  return moreData;
};

<ResponsiveTable
  data={data}
  columnDefinitions={columnDefinitions}
  plugins={[new InfiniteScrollPlugin()]}
  infiniteScrollProps={{
    onLoadMore: onLoadMore,
    hasMore: true,
  }}
  maxHeight="600px" // Requires a scrollable container
/>
```

### Building a Custom Plugin

Implement the `IResponsiveTablePlugin` interface to create your own plugin.

```jsx
import { IResponsiveTablePlugin } from 'jattac.libs.web.responsive-table';

class MyCustomPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'my-custom-plugin';

  public getRowProps = (row: TData) => {
    if (row.isSpecial) {
      return {
        className: 'special-row',
        style: { backgroundColor: 'lightblue' },
      };
    }
    return {};
  };
}

// Usage:
// <ResponsiveTable plugins={[new MyCustomPlugin()]} ... />
```

---

## API Reference

### ResponsiveTable Props

| Prop                         | Type                                                              | Description                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `columnDefinitions`          | `ColumnDefinition<TData>[]`                                       | **Required.** An array of objects that define the columns of the table.                                                                    |
| `data`                       | `TData[]`                                                         | **Required.** The array of data to be displayed in the table.                                                                              |
| `noDataComponent`            | `ReactNode`                                                       | A custom component to display when there is no data.                                                                                       |
| `maxHeight`                  | `string`                                                          | Sets a maximum height for the table, making the body scrollable. E.g., `'500px'`.                                                          |
| `onRowClick`                 | `(item: TData) => void`                                           | A callback function that is triggered when a row is clicked.                                                                               |
| `footerRows`                 | `IFooterRowDefinition[]`                                          | An array of objects that define the footer rows of the table.                                                                              |
| `mobileBreakpoint`           | `number`                                                          | The viewport width (in pixels) at which the table switches to the mobile card view. Defaults to `600`.                                     |
| `plugins`                    | `IResponsiveTablePlugin<TData>[]`                                 | An array of plugin instances to extend the table's functionality.                                                                          |
| `enablePageLevelStickyHeader`| `boolean`                                                         | When `false`, disables the sticky behavior of the header at the page level. Defaults to `true`.                                            |
| `animationProps`             | `{ isLoading?: boolean; animateOnLoad?: boolean; }`               | Props to control animations. `isLoading` shows a skeleton loader. `animateOnLoad` animates rows on initial render.                       |
| `filterProps`                | `{ showFilter?: boolean; filterPlaceholder?: string; className?: string; }` | Props to configure the built-in filter functionality. `showFilter` enables the filter input.                                               |
| `selectionProps`             | `{ onSelectionChange: (selectedItems: TData[]) => void; rowIdKey: keyof TData; mode?: 'single' \| 'multiple'; selectedItems?: TData[]; selectedRowClassName?: string; }` | Props to enable and configure row selection.                                                                                               |
| `infiniteScrollProps`        | `{ onLoadMore: (currentData: TData[]) => Promise<TData[] \| null>; hasMore?: boolean; loadingMoreComponent?: ReactNode; noMoreDataComponent?: ReactNode; }` | Props to enable infinite scrolling.                                                                                                        |
| `sortProps`                  | `{ initialSortColumn?: string; initialSortDirection?: 'asc' \| 'desc'; }` | Props to configure the built-in sort functionality.                                                                                        |

### ColumnDefinition Type

`IResponsiveTableColumnDefinition<TData>` is a union type. See the source file for detailed information.

### Footer Types

`IFooterRowDefinition` and `IFooterColumnDefinition` are used to define the footer. See the source files for detailed information.

---

## Performance Best Practices

*   **Memoize `data` and `columnDefinitions`:** To prevent unnecessary re-renders, wrap `data` and `columnDefinitions` in `React.useMemo`.
*   **Lightweight `cellRenderer`:** Keep your `cellRenderer` functions as simple as possible.
*   **Server-side Operations:** For large datasets, perform sorting, filtering, and pagination on the server.

---

## Troubleshooting / FAQ

This section will be populated with common issues and their solutions as they arise.

---

## Contributing

Contributions are welcome! Please follow the guidelines in the `CONTRIBUTING.md` file.

## License

This project is licensed under the MIT License.
