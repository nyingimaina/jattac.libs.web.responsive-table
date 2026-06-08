import { ReactNode } from 'react';
import { ColumnDefinition } from '../UI/ResponsiveTable';
import { IResponsiveTableColumnDefinition } from '../Data/IResponsiveTableColumnDefinition';

export interface IResponsiveTablePlugin<TData> {
  // A unique identifier for the plugin
  id: string;

  // Optional: Renders a UI component above the table
  renderHeader?: () => ReactNode;

  // Optional: Renders a UI component below the table
  renderFooter?: () => ReactNode;

  // Optional: Processes the data before it's rendered
  processData?: (data: TData[]) => TData[];

  // Optional: A callback that the table can use to provide the plugin with its own API
  onPluginInit?: (api: IPluginAPI<TData>) => void;

  // Optional: Provides props to be spread on the table header (<th>) elements
  getHeaderProps?: (columnDefinition: IResponsiveTableColumnDefinition<TData>) => React.HTMLAttributes<HTMLElement> & { className?: string };

  // Optional: Renders the content of a cell, allowing plugins to modify the output
  renderCell?: (content: ReactNode, row: TData, column: IResponsiveTableColumnDefinition<TData>) => ReactNode;

  // Optional: Provides props to be spread on the table row (<tr>) elements
  getRowProps?: (row: TData) => React.HTMLAttributes<HTMLTableRowElement>;
}

export interface IPluginAPI<TData> {
  // Function to get the current data from the table
  getData: () => TData[];

  // Function to force the table to re-render
  forceUpdate: () => void;

  // Function to get the column definitions from the table
  columnDefinitions: ColumnDefinition<TData>[];

  // Function to get the scrollable element of the table
  getScrollableElement?: () => HTMLElement | null;

  // Optional: Filter props from the ResponsiveTable component
  filterProps?: {
    showFilter?: boolean;
    filterPlaceholder?: string;
    className?: string;
    mode?: 'client' | 'server';
  };

  // Optional: Selection props from the ResponsiveTable component
  selectionProps?: {
    onSelectionChange: (selectedItems: TData[]) => void;
    rowIdKey: keyof TData;
    mode?: 'single' | 'multiple';
    selectedItems?: TData[];
    selectedRowClassName?: string;
  };

  // Optional: Callback fired when the filter text changes
  onFilterChange?: (filterText: string) => void;
}
