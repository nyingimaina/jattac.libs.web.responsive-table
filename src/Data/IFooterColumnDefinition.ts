import { ReactNode } from 'react';

export default interface IFooterColumnDefinition {
  colSpan: number;
  cellRenderer: () => ReactNode;
}
