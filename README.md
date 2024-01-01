# ResponsiveTable

ResponsiveTable is a reusable React component that displays tabular data in a responsive layout.

## Features

- Handles mobile and desktop layouts
- Customizable columns
- Dynamic column definitions
- Card-style mobile view
- Generic types for flexible data

## Usage

```jsx
<ResponsiveTable columnDefinitions={columns} data={data} />
```

- 'columnDefinitions' defines an array of columns, which can be a simple configuration object or dynamic function
- 'data' is an array of data objects to display in rows

The component handles switching layout based on screen width to optimize for desktop and mobile.

## Custom Columns

Columns can be configured using the 'IResponsiveTableColumnDefinition' interface.

Some key configuration options:

- 'displayLabel': Header label
- 'dataKey': Maps column to data property
- 'cellRenderer': Renders cell value

See docs for more details on customization.

## Dynamic Columns

Column definitions can also be a function allowing dynamic configurations per row.

## Props

Prop definitions provide detailed specification of component contract.

### IProps

```ts
interface IProps<TData> {
  /** Column definitions */
  columnDefinitions: ColumnDefinition<TData>[];

  /** Table data rows */
  data: TData[];

  /** Optional styling */
  className?: string;

  /** row click handler */
  onRowClicked?: (row: TData) => void;

  /** not data component */
  noDataComponent?: ReactNode;
}
```

```ts
type ColumnDefinition<TData> =
  | IResponsiveTableColumnDefinition<TData>
  | ((rowData: TData, rowIndex?: number) => IResponsiveTableColumnDefinition<TData>);
```

```ts
interface IResponsiveTableColumnDefinition<TData> {
  displayLabel: string | ReactNode;

  dataKey?: keyof TData;

  cellRenderer: (rowData: TData) => ReactNode;
}
```
