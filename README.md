# ResponsiveTable: A Modern and Flexible React Table Component

ResponsiveTable is a powerful, lightweight, and fully responsive React component for creating beautiful and functional tables. It’s designed to look great on any device, adapting from a traditional table layout on desktops to a clean, card-based view on mobile screens.

## Features

- **Mobile-First Design**: Automatically switches to a card layout on smaller screens for optimal readability.
- **Highly Customizable**: Tailor the look and feel of columns, headers, and footers.
- **Dynamic Data Handling**: Define columns and footers based on your data or application state.
- **Delightful Animations**: Includes an optional skeleton loader and staggered row entrance animations.
- **Interactive Elements**: Easily add click handlers for rows, headers, and footer cells.
- **Performant**: Built with performance in mind, including debounced resize handling.
- **Easy to Use**: A simple and intuitive API for quick integration.

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

  return <ResponsiveTable columnDefinitions={columns} data={data} isLoading={isLoading} animateOnLoad={true} />;
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
    { displayLabel: 'User', cellRenderer: (row) => <strong>{row.user}</strong> },
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

---

## API Reference

### `ResponsiveTable` Props

| Prop                | Type                                 | Required | Description                                                                         |
| ------------------- | ------------------------------------ | -------- | ----------------------------------------------------------------------------------- |
| `columnDefinitions` | `IResponsiveTableColumnDefinition[]` | Yes      | An array of objects defining the table columns.                                     |
| `data`              | `TData[]`                            | Yes      | An array of data objects to populate the table rows.                                |
| `isLoading`         | `boolean`                            | No       | If `true`, displays a skeleton loader. Defaults to `false`.                         |
| `animateOnLoad`     | `boolean`                            | No       | If `true`, animates the rows with a staggered entrance effect. Defaults to `false`. |
| `footerRows`        | `IFooterRowDefinition[]`             | No       | An array of objects defining the table footer.                                      |
| `onRowClick`        | `(item: TData) => void`              | No       | A callback function that is triggered when a row is clicked.                        |
| `noDataComponent`   | `ReactNode`                          | No       | A custom component to display when there is no data.                                |
| `maxHeight`         | `string`                             | No       | Sets a maximum height for the table body, making it scrollable.                     |
| `mobileBreakpoint`  | `number`                             | No       | The pixel width at which the table switches to the mobile view. Defaults to `600`.  |

### `IResponsiveTableColumnDefinition`

| Property        | Type                        | Required | Description                                                                    |
| --------------- | --------------------------- | -------- | ------------------------------------------------------------------------------ |
| `displayLabel`  | `string`                    | Yes      | The label displayed in the table header.                                       |
| `cellRenderer`  | `(row: TData) => ReactNode` | Yes      | A function that returns the content to be rendered in the cell.                |
| `dataKey`       | `string`                    | No       | A key to match the column to a property in the data object (optional).         |
| `interactivity` | `object`                    | No       | An object to define header interactivity (`onHeaderClick`, `id`, `className`). |

### `IFooterRowDefinition`

| Property  | Type                        | Required | Description                                        |
| --------- | --------------------------- | -------- | -------------------------------------------------- |
| `columns` | `IFooterColumnDefinition[]` | Yes      | An array of column definitions for the footer row. |

### `IFooterColumnDefinition`

| Property       | Type              | Required | Description                                                                    |
| -------------- | ----------------- | -------- | ------------------------------------------------------------------------------ |
| `colSpan`      | `number`          | Yes      | The number of columns the footer cell should span.                               |
| `cellRenderer` | `() => ReactNode` | Yes      | A function that returns the content for the footer cell.                         |
| `displayLabel` | `ReactNode`       | No       | An optional, explicit label for the footer cell. In mobile view, if `colSpan` is 1 and this is not provided, the corresponding column header will be used as a fallback. This is required for `colSpan` > 1 if you want a label to be displayed. |
| `onCellClick`  | `() => void`      | No       | An optional click handler for the footer cell.                                 |
| `className`    | `string`          | No       | Optional class name for custom styling of the footer cell.                     |

## License

This project is licensed under the MIT License.
