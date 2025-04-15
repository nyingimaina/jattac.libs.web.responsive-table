# ResponsiveTable

ResponsiveTable is a React component designed to create responsive tables that adapt seamlessly to both desktop and mobile screens. It simplifies the process of building tables with dynamic layouts and custom behaviors.

## Installation

To install ResponsiveTable, use npm:

```bash
npm install jattac.libs.web.responsive-table
```

## Why Use ResponsiveTable?

- **Mobile-Friendly**: Automatically adjusts to look great on small screens.
- **Customizable**: Define how each column looks and behaves.
- **Dynamic**: Supports flexible column setups, even changing them based on the data.
- **Easy to Use**: Simple API for quick integration into your React project.

## How to Use It

Here’s a quick example:

```jsx
import ResponsiveTable from 'jattac.libs.web.responsive-table';

const columns = [
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (row) => row.name,
  },
  {
    displayLabel: 'Age',
    dataKey: 'age',
    cellRenderer: (row) => row.age,
  },
];

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
];

<ResponsiveTable columnDefinitions={columns} data={data} />;
```

### Explanation

- **`columnDefinitions`**: Defines the columns of the table. Each column has a label (`displayLabel`), a key to match the data (`dataKey`), and a function to render the cell (`cellRenderer`).
- **`data`**: The rows of the table, where each object represents a row.

## Key Features

### 1. Mobile and Desktop Layouts

- On small screens, the table switches to a card-style layout for better readability.

### 2. Custom Columns

- Customize how each column looks and behaves. For example, you can add clickable headers or custom styles.

### 3. Dynamic Columns

- Columns can be defined dynamically based on the data or external conditions. This allows you to create tables that adapt to different datasets or user preferences.

#### Example 1: Conditional Columns

You can show or hide columns based on a condition:

```jsx
const isAdmin = true; // Example condition

const columns = [
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (row) => row.name,
  },
  isAdmin && {
    displayLabel: 'Actions',
    dataKey: 'actions',
    cellRenderer: (row) => <button onClick={() => alert(row.name)}>Edit</button>,
  },
].filter(Boolean); // Remove undefined columns

const data = [{ name: 'Alice' }, { name: 'Bob' }];

<ResponsiveTable columnDefinitions={columns} data={data} />;
```

#### Example 2: Dynamic Column Labels

You can change column labels dynamically based on user preferences or locale:

```jsx
const userLocale = 'fr'; // Example locale

const columnLabels = {
  en: { name: 'Name', age: 'Age' },
  fr: { name: 'Nom', age: 'Âge' },
};

const columns = [
  {
    displayLabel: columnLabels[userLocale].name,
    dataKey: 'name',
    cellRenderer: (row) => row.name,
  },
  {
    displayLabel: columnLabels[userLocale].age,
    dataKey: 'age',
    cellRenderer: (row) => row.age,
  },
];

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
];

<ResponsiveTable columnDefinitions={columns} data={data} />;
```

#### Example 3: Columns Based on Data

You can generate columns dynamically based on the dataset:

```jsx
const data = [
  { name: 'Alice', age: 25, city: 'New York' },
  { name: 'Bob', age: 30, city: 'Los Angeles' },
];

const columns = Object.keys(data[0]).map((key) => ({
  displayLabel: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize key
  dataKey: key,
  cellRenderer: (row) => row[key],
}));

<ResponsiveTable columnDefinitions={columns} data={data} />;
```

#### Example 4: Adding Columns Dynamically Using a Function

You can define columns dynamically by using a function that takes the row data and optionally the row index. This is useful for creating columns based on specific row properties or conditions.

```jsx
const columns = [
  {
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (row) => row.name,
  },
  {
    displayLabel: 'Dynamic Column',
    dataKey: 'dynamic',
    cellRenderer: (row, rowIndex) => {
      if (rowIndex % 2 === 0) {
        return `Even Row: ${row.name}`;
      } else {
        return `Odd Row: ${row.name}`;
      }
    },
  },
];

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 },
];

<ResponsiveTable columnDefinitions={columns} data={data} />;
```

### Explanation

- **Dynamic Column Logic**: The `cellRenderer` function for the dynamic column checks the row index and displays different content for even and odd rows.
- **Flexibility**: This approach allows you to create highly customized columns based on row-specific data or conditions.

### 4. No Data? No Problem!

- If there’s no data to display, you can show a custom message or graphic.

## Why It’s Designed This Way

- **Flexibility**: Works for both simple and complex data tables.
- **User-Friendly**: Automatically adapts to different screen sizes.
- **Customizable**: Lets you control how your data is displayed.

## Advantages

- Saves time: No need to build responsive tables from scratch.
- Easy to maintain: Clear and simple API.
- Works out of the box: Handles common table features like empty states and dynamic layouts.
