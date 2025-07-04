import { ReactNode } from 'react';

export default interface IResponsiveTableColumnDefinition<TData> {
  displayLabel: ReactNode;
  cellRenderer: (data: TData) => ReactNode;
  interactivity?: {
    id: string;
    onHeaderClick?: (id: string) => void;
    className?: string;
  };
  getFilterableValue?: (data: TData) => string | number;
}
