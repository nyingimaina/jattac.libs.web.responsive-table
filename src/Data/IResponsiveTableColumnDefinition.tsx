import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export type IResponsiveTableColumnDefinition<TData> = {
  displayLabel: ReactNode;
  cellRenderer: (data: TData) => ReactNode;
  interactivity?: {
    id: string;
    onHeaderClick?: (id: string) => void;
    className?: string;
  };
} & (
  | {
      // Case 1: Column has sorting/filtering properties, so dataKey is required
      dataKey: keyof TData; // dataKey is required and type-safe
      getFilterableValue?: (data: TData) => string | number;
      getSortableValue?: (row: TData) => string | number;
      sortComparer?: (a: TData, b: TData, direction: SortDirection) => number;
    }
  | {
      // Case 2: Column does NOT have sorting/filtering properties
      dataKey?: keyof TData; // dataKey is optional
      getFilterableValue?: never; // Exclude these properties
      getSortableValue?: never;
      sortComparer?: never;
    }
);

