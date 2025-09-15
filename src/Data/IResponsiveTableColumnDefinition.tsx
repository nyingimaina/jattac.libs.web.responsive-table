import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

// Base interface with common properties that all column definitions share
interface IResponsiveTableColumnDefinitionBase<TData> {
  displayLabel: ReactNode;
  cellRenderer: (data: TData) => ReactNode;
  dataKey?: keyof TData;
  getFilterableValue?: (data: TData) => string | number;
  interactivity?: {
    id: string;
    onHeaderClick?: (id: string) => void;
    className?: string;
  };
}

// The final type is a base definition intersected with one of three mutually exclusive cases for sorting
export type IResponsiveTableColumnDefinition<TData> = IResponsiveTableColumnDefinitionBase<TData> & (
  | {
      // Case 1: Sortable by providing a getSortableValue function. columnId is REQUIRED.
      columnId: string;
      getSortableValue: (row: TData) => string | number;
      sortComparer?: never; // Cannot be used with getSortableValue
    }
  | {
      // Case 2: Sortable by providing a custom sortComparer function. columnId is REQUIRED.
      columnId: string;
      sortComparer: (a: TData, b: TData, direction: SortDirection) => number;
      getSortableValue?: never; // Cannot be used with sortComparer
    }
  | {
      // Case 3: The column is not sortable. columnId is optional.
      columnId?: string;
      getSortableValue?: never;
      sortComparer?: never;
    }
);

