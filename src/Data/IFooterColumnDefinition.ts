import { ReactNode } from 'react';

export default interface IFooterColumnDefinition {
  colSpan: number;
  cellRenderer: () => ReactNode;
  /**
   * An optional, explicit label for the footer cell, especially for mobile view.
   * If not provided, the table could try to infer it from the corresponding column.
   */
  displayLabel?: ReactNode;

  /**
   * An optional click handler for the footer cell.
   */
  onCellClick?: () => void;

  /**
   * Optional class name for custom styling of the footer cell.
   */
  className?: string;
}
