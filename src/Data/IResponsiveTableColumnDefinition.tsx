import { ReactNode } from 'react';

export type SortDirection = 'asc' | 'desc';

export default interface IResponsiveTableColumnDefinition<TData> {
  displayLabel: ReactNode;
  cellRenderer: (data: TData) => ReactNode;
  dataKey?: string;
  interactivity?: {
    id: string;
    onHeaderClick?: (id: string) => void;
    className?: string;
  };
  getFilterableValue?: (data: TData) => string | number;
  getSortableValue?: (row: TData) => any;
  sortComparer?: (a: TData, b: TData, direction: SortDirection) => number;
}
