# Building a Custom Row Selection Plugin

While `ResponsiveTable` provides built-in plugins for common functionalities like sorting and filtering, its extensible plugin system allows you to create custom plugins for highly specific needs, such as a bespoke row selection mechanism. This guide outlines the steps to build and integrate your own row selection plugin.

**Step 1: Define Your Plugin Class**

Create a new TypeScript class that implements the `IResponsiveTablePlugin<TData>` interface. This interface defines the lifecycle methods and hooks your plugin can use to interact with the table.

```typescript
// my-custom-selection-plugin.ts
import { IResponsiveTablePlugin, IPluginAPI } from './IResponsiveTablePlugin'; // Adjust path as needed
import styles from './ResponsiveTable.module.css'; // For styling selected rows

export class MyCustomSelectionPlugin<TData> implements IResponsiveTablePlugin<TData> {
  public id = 'my-custom-selection'; // A unique ID for your plugin
  private api!: IPluginAPI<TData>;
  private selectedRowIds = new Set<string | number>(); // Internal state for selected items

  // Constructor can accept options for your plugin
  constructor(options?: { initialSelection?: TData[]; rowIdKey: keyof TData }) {
    // Initialize internal state based on options
    if (options?.initialSelection && options.rowIdKey) {
      options.initialSelection.forEach((item) => this.selectedRowIds.add(item[options.rowIdKey] as string | number));
    }
  }

  // Called by the table to provide the plugin with its API
  public onPluginInit = (api: IPluginAPI<TData>) => {
    this.api = api;
  };

  // Helper to get a unique ID for a row
  private getRowId = (row: TData): string | number => {
    // Assuming rowIdKey is passed in constructor options or via plugin API
    const rowIdKey = (this as any).options.rowIdKey; // Access options from constructor
    return row[rowIdKey] as string | number;
  };

  // Handles row clicks to toggle selection
  private handleRowClick = (row: TData) => {
    const rowId = this.getRowId(row);
    if (this.selectedRowIds.has(rowId)) {
      this.selectedRowIds.delete(rowId);
    } else {
      this.selectedRowIds.add(rowId);
    }

    // Notify the table to re-render to reflect selection changes
    this.api.forceUpdate();

    // If you need to expose the selection to the parent component,
    // you would typically call a callback provided via plugin options.
    // e.g., (this as any).options.onSelectionChange(this.getSelectedItems());
  };

  // Provides props to be spread on each table row (<tr>)
  public getRowProps = (row: TData): React.HTMLAttributes<HTMLTableRowElement> => {
    const isSelected = this.selectedRowIds.has(this.getRowId(row));
    return {
      className: isSelected ? styles.selectedRow : '', // Apply selection styling
      onClick: () => this.handleRowClick(row), // Attach click handler
      'aria-selected': isSelected, // For accessibility
    };
  };

  // Optional: You can also implement renderHeader, renderFooter, processData, etc.
  // For example, to add a "Select All" checkbox in the header:
  // public renderHeader = () => {
  //   return (
  //     <input
  //       type="checkbox"
  //       checked={this.selectedRowIds.size === this.api.getData().length}
  //       onChange={() => this.toggleSelectAll()}
  //     />
  //   );
  // };
}
```

**Step 2: Integrate Your Custom Plugin**

Once your plugin class is defined, you can instantiate it and pass it to the `ResponsiveTable` component via the `plugins` prop.

```jsx
import React from 'react';
import ResponsiveTable from 'jattac.libs.web.responsive-table';
import { MyCustomSelectionPlugin } from './my-custom-selection-plugin'; // Adjust path

interface MyDataItem {
  id: string;
  name: string;
  // ... other properties
}

const MyTableWithCustomSelection = () => {
  const data: MyDataItem[] = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    // ...
  ];

  const columns = [
    { displayLabel: 'ID', cellRenderer: (row: MyDataItem) => row.id },
    { displayLabel: 'Name', cellRenderer: (row: MyDataItem) => row.name },
  ];

  // Instantiate your custom plugin, passing any necessary options
  const customSelectionPlugin = new MyCustomSelectionPlugin<MyDataItem>({
    rowIdKey: 'id', // Crucial for identifying rows
    // onSelectionChange: (selectedItems) => console.log(selectedItems),
  });

  return (
    <ResponsiveTable
      columnDefinitions={columns}
      data={data}
      plugins={[customSelectionPlugin]} // Pass your custom plugin here
    />
  );
};

export default MyTableWithCustomSelection;
```