import { ReactNode } from 'react';

export default interface IResponsiveTableColumnDefinition<TData> {
  displayLabel: ReactNode;
  dataKey?: keyof TData;
  cellRenderer: (data: TData) => ReactNode;
}
