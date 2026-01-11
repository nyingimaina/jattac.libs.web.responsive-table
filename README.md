# ResponsiveTable: A Modern and Flexible React Table Component

ResponsiveTable is a powerful, lightweight, and fully responsive React component for creating beautiful and functional tables. It’s designed to look great on any device, adapting from a traditional table layout on desktops to a clean, card-based view on mobile screens.

## Why ResponsiveTable?

ResponsiveTable is a modern, flexible, and highly customizable React component designed to tackle the challenges of displaying tabular data effectively across all devices. It's built for developers who need a robust, type-safe, and performant table solution that adapts seamlessly from desktop to mobile.

### Key Advantages

*   **Truly Responsive by Design:** Automatically transforms from a traditional table layout on larger screens to an intuitive, card-based view on mobile devices. This ensures optimal readability and interaction, eliminating the need for separate mobile implementations.
*   **Powerful & Extensible Plugin System:** A robust, well-defined architecture allows you to easily extend functionality without modifying the core component. Integrate advanced features like sorting, filtering, and infinite scrolling, or build your own custom behaviors.
*   **Type-Safe & Developer-Friendly API:** Built with TypeScript, ResponsiveTable offers compile-time safety, rich IDE support, and a clear API. This minimizes boilerplate, accelerates development, and reduces runtime errors.
*   **Highly Customizable:** Gain granular control over the look, feel, and behavior of every table element. From column rendering and header interactivity to dynamic footers and animations, tailor the table to perfectly match your application's design system.
*   **Optimized Performance:** Engineered for efficiency, featuring debounced resize handling for smooth transitions and careful rendering strategies to maintain responsiveness even with larger datasets.

### Who is this for?

ResponsiveTable is ideal for React developers building:

*   **Dashboards and Admin Panels:** Display complex data in an organized and interactive manner.
*   **Data-heavy Applications:** Present lists, reports, and analytics that need to be accessible on any screen size.
*   **Applications Requiring Custom Table Logic:** Leverage the plugin system to implement unique business rules or UI/UX requirements.
*   **Projects Prioritizing Type Safety and Maintainability:** Benefit from a TypeScript-first approach that enhances code quality and developer experience.

## Table of Contents

- [Why ResponsiveTable?](#why-responsivetable)
- [Features](#features)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Comprehensive Examples](#comprehensive-examples)
  - [Example 1: Loading State and Animations](#example-1-loading-state-and-animations)
  - [Example 2: Adding a Clickable Row Action](#example-2-adding-a-clickable-row-action)
  - [Example 3: Row Selection](#example-3-row-selection)
  - [Example 4: Custom Cell Rendering](#example-4-custom-cell-rendering)
  - [Example 5: Dynamic and Conditional Columns](#example-5-dynamic-and-conditional-columns)
  - [Example 6: Advanced Footer with Labels and Interactivity](#example-6-advanced-footer-with-labels-and-interactivity)
  - [Example 7: Disabling Page-Level Sticky Header](#example-7-disabling-page-level-sticky-header)
- [Plugin System](#plugin-system)
  - [Plugin Execution Order](#plugin-execution-order)
  - [How to Use Plugins](#how-to-use-plugins)
  - [Built-in Plugins](#built-in-plugins)
    - [SortPlugin Documentation](#sortplugin-documentation)
    - [SelectionPlugin Documentation](#selectionplugin-documentation)
    - [FilterPlugin Documentation](#filterplugin-documentation)
    - [InfiniteScrollPlugin Documentation](#infinitescrollplugin-documentation)
  - [Building a Custom Plugin](#building-a-custom-plugin)
- [API Reference](#api-reference)
  - [ResponsiveTable Props](#responsivetable-props)
  - [IResponsiveTableColumnDefinition<TData>](#iresponsivetablecolumndefinitiontdata)
  - [IFooterRowDefinition](#ifooterrowdefinition)
  - [IFooterColumnDefinition](#ifootercolumndefinition)
- [Breaking Changes](#breaking-changes)
  - [Version 0.5.0](#version-050)
- [License](#license)
- [Contribution Guidelines](#contribution-guidelines)
- [Development Setup](#development-setup)
- [Testing](#testing)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Accessibility Considerations](#accessibility-considerations)
- [Performance Best Practices](#performance-best-practices)
- [Visuals (Future Enhancement)](#visuals-future-enhancement)

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

Here's a basic example of how to use `ResponsiveTable`:

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

## API Reference

### ResponsiveTable Props

| Prop                         | Type                                                              | Description                                                                                                                                |
| ---------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `columnDefinitions`          | `IResponsiveTableColumnDefinition<TData>[]`                       | **Required.** An array of objects that define the columns of the table.                                                                    |
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

---

## Plugin System

### Built-in Plugins

#### FilterPlugin Documentation

The `FilterPlugin` adds a client-side search input to filter the table data.

**Enabling the `FilterPlugin`:**

The `FilterPlugin` is automatically enabled when you provide the `filterProps` to the `ResponsiveTable`. To make a column filterable, you must add a `getFilterableValue` function to its column definition.

```jsx
import React from 'react';
import ResponsiveTable, { IResponsiveTableColumnDefinition } from 'jattac.libs.web.responsive-table';

// Define your data and columns
interface Product {
  id: number;
  name: string;
  category: string;
}

const columnDefinitions: IResponsiveTableColumnDefinition<Product>[] = [
  {
    displayLabel: 'Product Name',
    cellRenderer: (row) => row.name,
    // Make this column filterable
    getFilterableValue: (row) => row.name,
  },
  {
    displayLabel: 'Category',
    cellRenderer: (row) => row.category,
    // And this one too
    getFilterableValue: (row) => row.category,
  },
];

const ProductTable = ({ products }) => (
  <ResponsiveTable
    data={products}
    columnDefinitions={columnDefinitions}
    filterProps={{
      showFilter: true,
      filterPlaceholder: 'Search products...',
    }}
  />
);
```

The plugin will automatically render a search input and highlight matches in the cells.

#### InfiniteScrollPlugin Documentation

The `InfiniteScrollPlugin` enables the table to load more data as the user scrolls.

**Enabling the `InfiniteScrollPlugin`:**

The `InfiniteScrollPlugin` is enabled by providing the `infiniteScrollProps` to the `ResponsiveTable`.

```jsx
import React, { useState } from 'react';
import ResponsiveTable, { IResponsiveTableColumnDefinition, InfiniteScrollPlugin } from 'jattac.libs.web.responsive-table';

// Assume you have a function to fetch data from an API
const fetchMoreData = async (offset: number): Promise<any[]> => {
  const response = await fetch(`https://api.example.com/data?offset=${offset}`);
  return response.json();
};

const App = () => {
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const onLoadMore = async (currentData) => {
    const newData = await fetchMoreData(currentData.length);
    if (newData && newData.length > 0) {
      setData([...currentData, ...newData]);
    } else {
      setHasMore(false);
    }
    return newData;
  };

  return (
    <ResponsiveTable
      data={data}
      columnDefinitions={/* ... */}
      plugins={[new InfiniteScrollPlugin()]}
      infiniteScrollProps={{
        onLoadMore: onLoadMore,
        hasMore: hasMore,
        loadingMoreComponent: <div>Loading...</div>,
        noMoreDataComponent: <div>End of list.</div>,
      }}
      maxHeight="600px" // Important: Infinite scroll requires a scrollable container
    />
  );
};
```

### Building a Custom Plugin

You can create your own plugins by implementing the `IResponsiveTablePlugin` interface. This allows you to hook into the table's lifecycle to add custom behavior.

The `IResponsiveTablePlugin<TData>` interface has the following methods:

| Method           | Description                                                              |
| ---------------- | ------------------------------------------------------------------------ |
| `id`             | A unique string identifier for the plugin.                               |
| `renderHeader`   | Renders a React node above the table.                                    |
| `renderFooter`   | Renders a React node below the table.                                    |
| `processData`    | A function to transform the data before it's rendered.                   |
| `onPluginInit`   | A callback that provides the plugin with an API to interact with the table. |
| `getHeaderProps` | A function to add props to the header `<th>` elements.                   |
| `renderCell`     | A function to wrap or modify the content of a cell.                      |
| `getRowProps`    | A function to add props to the table row `<tr>` elements.                |

**Example: A Simple Logging Plugin**

Here is an example of a plugin that logs the number of rows rendered to the console.

```jsx
import { IResponsiveTablePlugin } from 'jattac.libs.web.responsive-table';

class LoggingPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'logging-plugin';

  public processData(data: TData[]): TData[] {
    console.log(`Rendering ${data.length} rows.`);
    return data;
  }
}

// Usage:
// <ResponsiveTable
//   data={...}
//   columnDefinitions={...}
//   plugins={[new LoggingPlugin()]}
// />
```

---
## Contribution Guidelines

We welcome contributions to ResponsiveTable! To ensure a smooth and effective collaboration, please follow these guidelines.

### How to Contribute

1.  **Fork the Repository:** Start by forking the `jattac-web-libs/Jattac.Libs.Web.ResponsiveTable` repository to your GitHub account.
2.  **Clone Your Fork:** Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/your-username/Jattac.Libs.Web.ResponsiveTable.git
    cd Jattac.Libs.Web.ResponsiveTable
    ```
3.  **Create a New Branch:** For each new feature or bug fix, create a new branch.
    ```bash
    git checkout -b feature/your-feature-name
    # or
    git checkout -b bugfix/issue-description
    ```
4.  **Set Up Development Environment:** Follow the instructions in the [Development Setup](#development-setup) section to get your local environment ready.
5.  **Make Your Changes:** Implement your feature or fix the bug. Ensure your code adheres to the project's coding style and conventions.
6.  **Write Tests:** If you're adding a new feature, please write corresponding unit or integration tests. If you're fixing a bug, a regression test is highly appreciated.
7.  **Run Tests:** Before submitting, ensure all existing tests pass and your new tests pass. See [Testing](#testing) for instructions.
8.  **Lint and Format:** Ensure your code is properly linted and formatted.
    ```bash
    npm run lint
    npm run format
    ```
9.  **Commit Your Changes:** Write clear, concise commit messages.
    ```bash
    git commit -m "feat: Add new feature X"
    # or
    git commit -m "fix: Resolve issue Y"
    ```
10. **Push to Your Fork:**
    ```bash
    git push origin feature/your-feature-name
    ```
11. **Create a Pull Request (PR):**
    *   Go to the original `jattac-web-libs/Jattac.Libs.Web.ResponsiveTable` repository on GitHub.
    *   You should see a prompt to create a new pull request from your recently pushed branch.
    *   Provide a clear title and detailed description of your changes. Reference any related issues.

### Code Style

This project uses Prettier for code formatting and ESLint for linting. Please ensure your code conforms to these standards. You can run `npm run format` and `npm run lint` to automatically fix most issues.

### Reporting Bugs

If you find a bug, please open an issue on GitHub. Provide a clear and concise description of the bug, steps to reproduce it, and expected behavior. Screenshots or code examples are very helpful.

### Feature Requests

We'd love to hear your ideas for new features! Please open an issue on GitHub to propose new features. Describe the feature, its potential benefits, and any design considerations.

---

## Development Setup

To set up the project for local development, follow these steps:

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/jattac-web-libs/Jattac.Libs.Web.ResponsiveTable.git
    cd Jattac.Libs.Web.ResponsiveTable
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Build the Project:**
    This project uses Rollup for bundling. To build the project, run:
    ```bash
    npm run build
    ```
    This will compile the TypeScript code and generate the output in the `dist/` directory.

4.  **Run in Development Mode (if applicable):**
    If there's a development server or storybook setup, you would typically run:
    ```bash
    npm run dev
    ```
    (Note: This project is a library, so a direct `dev` command might not be present for a live preview. You would typically link this library into another project to test changes.)

---

## Testing

To ensure the quality and stability of ResponsiveTable, the project includes a suite of tests.

### Running Tests

1.  **Unit and Integration Tests:**
    To run all unit and integration tests, use the following command:
    ```bash
    npm test
    ```
    This will execute the test suite and report any failures.

2.  **Test Coverage:**
    To generate a test coverage report, run:
    ```bash
    npm run coverage
    ```
    (Note: This command assumes a coverage tool like `jest --coverage` is configured in `package.json`.)

3.  **Linting and Formatting Checks:**
    Before submitting any changes, please ensure your code adheres to the project's style guidelines.
    ```bash
    npm run lint
    npm run format
    ```
    These commands will check for linting errors and automatically format your code, respectively.

---

## Troubleshooting / FAQ

This section will be populated with common issues and their solutions as they arise.

### Common Issues

*   **Issue:** [Describe common issue 1]
    **Solution:** [Provide solution 1]
*   **Issue:** [Describe common issue 2]
    **Solution:** [Provide solution 2]

If you encounter any problems not listed here, please check the [GitHub Issues](https://github.com/jattac-web-libs/Jattac.Libs.Web.ResponsiveTable/issues) or open a new one.

---

## Accessibility Considerations

ResponsiveTable aims to be as accessible as possible. We strive to follow Web Content Accessibility Guidelines (WCAG) where applicable.

### Key Considerations

*   **Semantic HTML:** The component renders semantic HTML elements to ensure proper structure and meaning for assistive technologies.
*   **Keyboard Navigation:** Interactive elements within the table (e.g., selection checkboxes, sortable headers) should be navigable and operable via keyboard.
*   **ARIA Attributes:** Appropriate ARIA attributes are used to convey roles, states, and properties of UI elements to assistive technologies.
*   **Customization:** When customizing cell renderers or other parts of the table, developers are encouraged to consider accessibility best practices, such as providing `alt` text for images, proper `label` associations for form controls, and sufficient color contrast.

We are continuously working to improve the accessibility of this component. If you find any accessibility issues, please report them via the [GitHub Issues](https://github.com/jattac-web-libs/Jattac.Libs.Web.ResponsiveTable/issues).

---

## Performance Best Practices

To ensure optimal performance when using ResponsiveTable, especially with large datasets or complex cell renderers, consider the following best practices:

*   **Minimize Re-renders:**
    *   Ensure that `data` and `columnDefinitions` props are stable. Avoid creating new array or object instances on every render of your parent component if their content hasn't changed. Use `React.useMemo` or `React.useCallback` where appropriate.
    *   If your `cellRenderer` functions are complex, consider memoizing them or the components they render using `React.memo`.
*   **Efficient `cellRenderer`:**
    *   Keep `cellRenderer` functions as lightweight as possible. Avoid heavy computations or complex component trees within them if performance is critical.
    *   Only render what's necessary.
*   **`rowIdKey` for Selection:**
    *   Always provide a stable and unique `rowIdKey` when using the `SelectionPlugin`. This helps React and the plugin efficiently track row selections without unnecessary re-renders.
*   **Plugin Order (for Sort/Filter):**
    *   As noted in the [Plugin Execution Order](#plugin-execution-order) section, for client-side sorting and filtering, it's generally more performant to **filter first, then sort** to operate on a smaller dataset.
*   **Server-Side Operations for Large Datasets:**
    *   For extremely large datasets (thousands of rows or more), client-side filtering and sorting can become slow. Consider implementing these operations server-side and fetching pre-filtered/pre-sorted data.
    *   Utilize the `InfiniteScrollPlugin` for progressively loading data from the server, but be mindful that it renders all loaded rows into the DOM (not a virtualized list).
*   **Avoid Deeply Nested Components:**
    *   While flexible,.
    *   While flexible, deeply nested components within `cellRenderer` can increase rendering time. Optimize your component hierarchy where possible.

---

## Visuals (Future Enhancement)

To further enhance this documentation, consider adding screenshots or animated GIFs to visually demonstrate:
- The responsive behavior (desktop vs. mobile card view).
- Loading animations and staggered row entrance.
- Interactive elements (row clicks, selection).
- Plugin functionalities (sorting indicators, filter input).

These visual aids can significantly improve user understanding and showcase the component's capabilities more effectively.

---

## SortPlugin Documentation

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
const sortPlugin = new SortPlugin<User>({
  initialSortColumn: 'user_logins', // Use the columnId
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

A column is made sortable by adding a **`columnId`** and either a `sortComparer` or a `getSortableValue` property to its definition. The `columnId` must be a unique string that identifies the column.

- `sortComparer`: A function that defines the exact comparison logic. This is the most powerful option and should be used for complex data types or custom logic.
- `getSortableValue`: A simpler function that just returns the primitive value (string, number, etc.) to be used in a default comparison.

**Example 1: Using Type-Safe Comparer Helpers**

The `SortPlugin` instance provides a `comparers` object with pre-built, type-safe helper functions to eliminate boilerplate for common sorting scenarios. This is the recommended approach.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    columnId: 'user_name',
    displayLabel: 'Name',
    dataKey: 'name',
    cellRenderer: (user) => user.name,
    // The plugin instance itself provides the type-safe helpers.
    // The string 'name' is fully type-checked against the User interface.
    sortComparer: sortPlugin.comparers.caseInsensitiveString('name'),
  },
  {
    columnId: 'user_signup_date',
    displayLabel: 'Signup Date',
    dataKey: 'signupDate',
    cellRenderer: (user) => new Date(user.signupDate).toLocaleDateString(),
    // IDE autocompletion for 'signupDate' works perfectly.
    sortComparer: sortPlugin.comparers.date('signupDate'),
  },
  {
    columnId: 'user_logins',
    displayLabel: 'Logins',
    dataKey: 'logins',
    cellRenderer: (user) => user.logins,
    sortComparer: sortPlugin.comparers.numeric('logins'),
  },
  {
    columnId: 'user_actions',
    displayLabel: 'Actions',
    // This column is NOT sortable because it has no sort-related properties.
    cellRenderer: (user) => <button>View</button>,
  },
];
```

**Example 2: Writing a Custom `sortComparer` for a Computed Column**

> **Important:** When writing a custom `sortComparer`, you **must** include all three parameters (`a`, `b`, and `direction`) in your function signature. Forgetting the `direction` parameter will cause descending sorts to fail. The IDE is configured to provide a warning if you forget, and the developer console will also show a warning at runtime.

For unique requirements, you can write your own comparison function. Notice how `columnId` is used without a `dataKey`.

```jsx
const columnDefinitions: IResponsiveTableColumnDefinition<User>[] = [
  {
    columnId: 'user_name_custom',
    displayLabel: 'Name',
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
    columnId: 'user_logins_simple',
    displayLabel: 'Logins',
    dataKey: 'logins',
    cellRenderer: (user) => user.logins,
    // This enables a simple, default numerical sort on the 'logins' property.
    getSortableValue: (user) => user.logins,
  },
];
```

**Plugin Options (via `new SortPlugin(options)`):**

| Prop                   | Type              | Description                                        |
| ---------------------- | ----------------- | -------------------------------------------------- |
| `initialSortColumn`    | `string`          | The `columnId` of the column to sort by initially. |
| `initialSortDirection` | `'asc' \| 'desc'` | The direction for the initial sort.                |

**`SortPlugin.comparers` API:**

The `comparers` object on your `SortPlugin` instance provides the following helper methods. Each method is a factory that takes a `dataKey` (which is type-checked against your data model) and returns a `sortComparer` function.

| Method                           | Description                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `numeric(dataKey)`               | Performs a standard numerical sort.                                           |
| `caseInsensitiveString(dataKey)` | Performs a case-insensitive alphabetical sort.                                |
| `date(dataKey)`                  | Correctly sorts dates, assuming the data is a valid date string or timestamp. |
